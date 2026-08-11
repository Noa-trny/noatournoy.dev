"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";
import { scroll } from "./scrollState";
import { journey, type Phase } from "./journeyStore";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Les deux franchissements du film, en fraction de progression. */
export const SEUILS = { transit: 0.55, garage: 0.96 } as const;

const phasePour = (p: number): Phase =>
  p >= SEUILS.garage ? "garage" : p >= SEUILS.transit ? "transit" : "approche";

// Le pont entre le défilement et la scène. C'est le SEUL endroit où l'on crée
// un ScrollTrigger qui touche la 3D.
//
// Il vit ici, dans un composant client qui possède le div haut — et surtout PAS
// dans `<Canvas>`, dont les enfants vivent dans le réconciliateur three.js et
// n'ont aucun DOM sur lequel déclencher.

/**
 * LE DÉTAIL QUE PRESQUE TOUTES LES IMPLÉMENTATIONS RATENT.
 *
 * `scrub` ne lisse qu'une *animation liée*. Le `self.progress` d'un
 * ScrollTrigger nu est brut, saccadé, et le lire directement donne une caméra
 * qui suit la molette cran par cran. D'où ce tween sur un objet fantoche : il
 * n'anime rien de visible, il ne sert qu'à obtenir une progression lissée.
 */
export function useScrollBridge(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const el = scope.current;
      if (!el) return;

      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        ease: "none",
        onUpdate: () => {
          scroll.target = proxy.p;
        },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          // 0,6 s d'inertie : c'est le *toucher*. L'amortissement dans
          // useFrame fait un autre travail — il découple les deux boucles.
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            scroll.velocity = self.getVelocity();
            // Le survol reste collé quand la caméra bouge sans la souris :
            // R3F ne relance un lancer de rayon que sur événement pointeur.
            if (Math.abs(self.getVelocity()) > 60) {
              journey.set({ activeId: null });
            }
            journey.set({ phase: phasePour(proxy.p) });
          },
        },
      });

      // Le magasin dedoublonne : reecrire la meme phase a chaque frame ne
      // provoque aucun rendu. React se reveille donc deux fois sur tout le
      // film, aux deux franchissements.
      //
      // Les phases derivent de la MEME progression que la camera, plutot que
      // de ScrollTrigger separes. Un `start: "96% top"` demandait de defiler
      // 96 % de la hauteur du conteneur jusqu'en haut du cadre — impossible
      // quand le dernier ecran fait une hauteur de fenetre : la phase finale
      // n'etait jamais atteinte. Une seule source de verite supprime cette
      // classe d'erreur.
    },
    { scope, dependencies: [] }
  );
}

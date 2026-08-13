"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { bureau, useBureau } from "./etat";
import { CHAMP, SEUIL_PORTRAIT, VUE_LARGE, VUE_PORTRAIT, zonePar } from "./zones";

// LE VOL DE CAMERA.
//
// GSAP anime deux VECTEURS — l'oeil et la cible — et `useFrame` les applique.
// Jamais l'inverse. C'est la meme frontiere que sur le projet precedent, et
// pour la meme raison : les deux boucles d'animation, celle de GSAP et celle de
// R3F, sont independantes et leur ordre dans l'image n'est pas garanti. Animer
// directement `camera.position` donne des saccades au remontage, au
// rechargement a chaud et au retour d'onglet ; animer des nombres qu'on lit
// ensuite ne peut pas se desynchroniser.
//
// L'INTERPOLATION SE FAIT SUR LA CIBLE AUSSI, et c'est ce qui donne un
// mouvement de camera plutot qu'un saut. Deplacer l'oeil en gardant la cible
// fixe donne un travelling ; deplacer les deux donne un panoramique combine,
// c'est-a-dire le geste d'une camera qu'on porte.

const _oeil = new THREE.Vector3(...VUE_LARGE.oeil);
const _cible = new THREE.Vector3(...VUE_LARGE.cible);

export function Rig() {
  const camera = useThree((s) => s.camera);
  const taille = useThree((s) => s.size);
  const ouverte = useBureau((e) => e.ouverte);
  const premier = useRef(true);

  // LE RAPPORT DE L'ECRAN CHOISIT LE PLAN, et il est lu ici plutot que par une
  // media query : c'est la camera qui cadre, pas la feuille de style.
  const portrait = taille.width / Math.max(taille.height, 1) < SEUIL_PORTRAIT;

  // ET LE RECUL S'AJUSTE EN CONTINU entre les deux. Le champ horizontal vaut
  // `tan(fov/2) x rapport` : a rapport egal a la moitie, il faut deux fois plus
  // de recul pour cadrer la meme largeur. Sans cette correction, une fenetre
  // simplement etroite — pas un telephone, juste un navigateur reduit — coupe
  // les bords du bureau sans que rien ne bascule.
  const recul = useMemo(() => {
    const rapport = taille.width / Math.max(taille.height, 1);
    // La reference du plan portrait est le rapport d'un TELEPHONE, pas le seuil
    // de bascule. Prendre le seuil revenait a considerer un telephone comme
    // « bien plus etroit que prevu » et a reculer d'un facteur deux — sur un
    // plan deja compose pour l'etroit. Le bureau finissait minuscule et cadre
    // sur le mur. 0,462 est le rapport d'un 390x844, donc un recul de 1 : le
    // plan portrait est compose POUR ce format et n'a pas a etre corrige.
    const reference = portrait ? 0.462 : 1.674;
    // Borne haute : au-dela, on s'eloigne tellement que la scene disparait dans
    // la brume. Borne basse a 1 : on ne se rapproche jamais plus que prevu.
    return Math.min(Math.max(reference / Math.max(rapport, 0.28), 1), 2.1);
  }, [taille.width, taille.height, portrait]);

  // LA DISTANCE A LAQUELLE UNE LARGEUR DONNEE TIENT DANS LE CADRE. C'est la
  // formule du champ, rien de plus : `demi-largeur = d x tan(champ/2) x
  // rapport`. Elle remplace, pour les zones, tout reglage a la main — une vue
  // composee sur un ecran large coupait le texte des deux cotes en portrait,
  // et l'aurait recoupe a la premiere dalle redimensionnee.
  const distancePour = (largeur: number) => {
    const rapport = Math.max(taille.width / Math.max(taille.height, 1), 0.28);
    return largeur / 2 / (Math.tan(THREE.MathUtils.degToRad(CHAMP) / 2) * rapport);
  };

  useEffect(() => {
    const z = ouverte ? zonePar(ouverte) : null;
    const large = portrait ? VUE_PORTRAIT : VUE_LARGE;
    const cibleBrute = z ? z.cible : large.cible;
    const oeilBrut = z ? z.oeil : large.oeil;

    // Sur une zone, la distance vient de ce qu'il faut LIRE ; sur le plan
    // large, de la composition. D'ou deux facteurs et non un seul. Et jamais
    // moins que la distance ecrite : elle a ete composee, on ne s'en rapproche
    // pas sous pretexte qu'un ecran est large.
    let facteur = recul;
    if (z) {
      const d = Math.hypot(
        oeilBrut[0] - cibleBrute[0],
        oeilBrut[1] - cibleBrute[1],
        oeilBrut[2] - cibleBrute[2],
      );
      facteur = Math.max(1, distancePour(z.largeur) / d);
    }

    // Le facteur s'applique le long du vecteur cible -> oeil, pour ne changer
    // que la distance et jamais l'angle : c'est l'angle qui fait la composition.
    const versCible = cibleBrute;
    const versOeil: readonly [number, number, number] = [
      cibleBrute[0] + (oeilBrut[0] - cibleBrute[0]) * facteur,
      cibleBrute[1] + (oeilBrut[1] - cibleBrute[1]) * facteur,
      cibleBrute[2] + (oeilBrut[2] - cibleBrute[2]) * facteur,
    ];

    // Au tout premier rendu, on se pose sans animer : une camera qui vole vers
    // sa position de depart pendant que la page apparait donne l'impression
    // d'un bug, pas d'une intention.
    if (premier.current) {
      premier.current = false;
      _oeil.set(...versOeil);
      _cible.set(...versCible);
      bureau.volFini();
      return;
    }

    const duree = 1.15;
    const t1 = gsap.to(_oeil, {
      x: versOeil[0], y: versOeil[1], z: versOeil[2],
      duration: duree,
      // `power3.inOut` et non un rebond : on porte une camera, on ne lance pas
      // un objet. Un depassement, meme leger, se lit comme une erreur de visee.
      ease: "power3.inOut",
      onComplete: () => bureau.volFini(),
    });
    const t2 = gsap.to(_cible, {
      x: versCible[0], y: versCible[1], z: versCible[2],
      duration: duree,
      ease: "power3.inOut",
    });
    return () => {
      t1.kill();
      t2.kill();
    };
    // `taille` entre dans les dependances par `distancePour` : un
    // redimensionnement doit recalculer la distance de lecture, pas seulement
    // le recul du plan large.
  }, [ouverte, portrait, recul, taille.width, taille.height]);

  useFrame(() => {
    camera.position.copy(_oeil);
    camera.lookAt(_cible);
  });

  return null;
}

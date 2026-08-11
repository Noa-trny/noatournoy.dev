"use client";

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { refusDe3D } from "@/scene/capability";
import { useScrollBridge } from "@/scene/scroll/useScrollBridge";
import { journey } from "@/scene/scroll/journeyStore";
import { scroll } from "@/scene/scroll/scrollState";

const Scene = lazy(() => import("@/scene/Scene"));

// L'enveloppe du voyage.
//
// LE POINT LE PLUS IMPORTANT : `useState(false)`. Le rendu serveur et le
// PREMIER rendu client produisent donc exactement le même arbre — `null` à la
// place du canvas. La détection de capacité ne tourne que dans un effet, après
// que l'hydratation a été validée. Toute lecture de `window`, `matchMedia` ou
// `navigator` PENDANT le rendu serait une divergence d'hydratation par
// construction.
//
// Les enfants sont rendus dans les deux cas, jamais retirés. La 3D est une
// couche qui se pose PAR-DESSUS le site, elle ne le remplace pas : c'est ce qui
// garantit que les liens vers les six travaux restent dans le HTML servi, donc
// atteignables au clavier et lisibles par un robot d'indexation.

export function Journey({ children }: { children: React.ReactNode }) {
  const conteneur = useRef<HTMLDivElement>(null);
  const [actif, setActif] = useState(false);
  const [prete, setPrete] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const evaluer = () => {
      const refus = refusDe3D();
      setActif(refus === null);
      if (refus !== null && process.env.NODE_ENV === "development") {
        console.info(`[voyage] canvas non monté : ${refus}`);
      }
    };

    evaluer();
    // Une bascule de préférence en cours de session doit être honorée.
    mq.addEventListener("change", evaluer);
    return () => mq.removeEventListener("change", evaluer);
  }, []);

  // La perte de contexte WebGL n'est pas rare sur portable : sans ce garde,
  // l'utilisateur récupère un rectangle noir à la place de la scène.
  useEffect(() => {
    if (!actif) return;
    const el = conteneur.current;
    if (!el) return;
    const perdu = (e: Event) => {
      e.preventDefault();
      setActif(false);
      setPrete(false);
      journey.reset();
    };
    el.addEventListener("webglcontextlost", perdu, true);
    return () => el.removeEventListener("webglcontextlost", perdu, true);
  }, [actif]);

  // Une poignée d'inspection, en développement seulement : le pont écrit dans
  // un objet de module que rien n'expose, ce qui est voulu en production mais
  // rend le harnais de test aveugle. `process.env.NODE_ENV` est remplacé à la
  // compilation, donc ce bloc n'existe pas dans le paquet livré.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as Record<string, unknown>).__voyage = {
      scroll: () => ({ ...scroll }),
      etat: () => journey.get(),
      actif: () => actif,
      refus: refusDe3D,
    };
  }, [actif]);

  useScrollBridge(conteneur);

  return (
    <div
      ref={conteneur}
      className="journey"
      data-3d={actif ? "on" : "off"}
      data-prete={prete ? "1" : "0"}
    >
      {actif ? (
        <div className="journey-canvas" aria-hidden="true">
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </div>
      ) : null}
      <div className="journey-dom">{children}</div>
    </div>
  );
}

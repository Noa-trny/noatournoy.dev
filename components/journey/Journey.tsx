"use client";

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/routes";
import { refusDe3D } from "@/scene/capability";
import { useScrollBridge } from "@/scene/scroll/useScrollBridge";
import { journey } from "@/scene/scroll/journeyStore";
import { scroll } from "@/scene/scroll/scrollState";
import { home } from "@/content/home";
import { FocusVitrines } from "./FocusVitrines";

const Scene = lazy(() => import("@/scene/Scene"));

// LE VOYAGE, en tete de l'accueil.
//
// Il occupe ses propres ecrans, puis le site reprend dessous avec ses bandes.
// Le canvas est en `sticky` et non en `fixed` : il se libere tout seul a la fin
// du conteneur, la ou un element fixe aurait continue de couvrir le site.
//
// LE POINT LE PLUS IMPORTANT reste `useState(false)`. Le rendu serveur et le
// PREMIER rendu client produisent le meme arbre — rien. La detection de
// capacite ne tourne que dans un effet, apres l'hydratation. Toute lecture de
// `window`, `matchMedia` ou `navigator` PENDANT le rendu serait une divergence
// d'hydratation par construction.
//
// Sans 3D le conteneur reste vide et de hauteur nulle : le site commence
// immediatement, sans trou a combler. C'est le meme HTML dans les deux cas, et
// les six liens vers les travaux vivent dans le corps du site, en dessous —
// jamais dans la scene.

/** Hauteur du voyage, en hauteurs de fenetre. */
const ECRANS = 3.6;

export function Journey({ locale }: { locale: Locale }) {
  const conteneur = useRef<HTMLDivElement>(null);
  const [actif, setActif] = useState(false);

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
    mq.addEventListener("change", evaluer);
    return () => mq.removeEventListener("change", evaluer);
  }, []);

  // La perte de contexte WebGL n'est pas rare sur portable : sans ce garde,
  // l'utilisateur recupere un rectangle noir a la place de la scene.
  useEffect(() => {
    if (!actif) return;
    const el = conteneur.current;
    if (!el) return;
    const perdu = (e: Event) => {
      e.preventDefault();
      setActif(false);
      journey.reset();
    };
    el.addEventListener("webglcontextlost", perdu, true);
    return () => el.removeEventListener("webglcontextlost", perdu, true);
  }, [actif]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as Record<string, unknown>).__voyage = {
      scroll: () => ({ ...scroll }),
      etat: () => journey.get(),
      actif: () => actif,
      refus: refusDe3D,
    };
  }, [actif]);

  useScrollBridge(conteneur, actif);

  const c = home[locale];

  return (
    <div
      ref={conteneur}
      className="journey"
      data-3d={actif ? "on" : "off"}
      // La hauteur est posee ici et non en CSS : elle est la MEME grandeur que
      // celle qui sert au pont de defilement, et la dupliquer dans une feuille
      // de style ferait deriver les deux a la premiere retouche.
      style={actif ? { height: `${ECRANS * 100}vh` } : undefined}
    >
      {actif ? (
        <>
          <div className="journey-collant">
            <div className="journey-canvas" aria-hidden="true">
              <Suspense fallback={null}>
                <Scene locale={locale} />
              </Suspense>
            </div>
            {/* Le nom en surimpression, DECORATIF : le vrai <h1> vit dans le
                corps du site, juste dessous. Le dupliquer dans l'arbre
                d'accessibilite donnerait deux titres de niveau 1 pour une seule
                page. */}
            <p className="journey-titre" aria-hidden="true">
              <b>Noa Tournoy</b>
              <span>{c.heroSub.map((s) => s.t).join("")}</span>
            </p>
          </div>
          {/* Le focus clavier allume la vitrine correspondante quand on
              remonte dans le voyage. */}
          <FocusVitrines />
        </>
      ) : null}
    </div>
  );
}

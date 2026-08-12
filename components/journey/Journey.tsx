"use client";

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/routes";
import { refusDe3D } from "@/scene/capability";
import { useScrollBridge } from "@/scene/scroll/useScrollBridge";
import { journey } from "@/scene/scroll/journeyStore";
import { scroll } from "@/scene/scroll/scrollState";
import { FocusVitrines } from "./FocusVitrines";
import { Beats } from "./Beats";

const Scene = lazy(() => import("@/scene/Scene"));

// LE VOYAGE. Il EST l'accueil, du premier ecran au dernier.
//
// Le canvas reste derriere toute la page et le contenu defile par-dessus, en
// bandes devenues translucides. Le defilement pilote donc la camera sur toute
// la hauteur : arriver sur le parvis, longer les vitrines, franchir la baie.
//
// `sticky` avec une marge basse NEGATIVE, et non `fixed` : ainsi le canvas ne
// consomme aucune place dans le flux — le contenu remonte par-dessus lui — tout
// en se liberant proprement a la fin du conteneur.
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

export function Journey({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
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

  return (
    <div
      ref={conteneur}
      className="journey"
      data-3d={actif ? "on" : "off"}
    >
      {actif ? (
        <div className="journey-collant" aria-hidden="true">
          <div className="journey-canvas">
            <Suspense fallback={null}>
              <Scene locale={locale} />
            </Suspense>
          </div>
        </div>
      ) : null}
      {/* Les quelques mots de la visite : trois blocs sur toute la hauteur,
          pas un site. Marques aria-hidden — ils reprennent du texte qui vit
          deja dans le contenu complet ci-dessous, et le dupliquer dans l'arbre
          d'accessibilite le ferait lire deux fois. */}
      {actif ? <Beats locale={locale} /> : null}
      {/* Le contenu complet, toujours rendu et jamais retire : c'est lui qui
          porte les six liens vers les travaux, le referencement et le clavier.
          Invisible quand la scene est la, il revient au focus. */}
      <div className="journey-dom">{children}</div>
      {actif ? <FocusVitrines /> : null}
    </div>
  );
}

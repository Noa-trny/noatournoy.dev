"use client";

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/routes";
import { refusDe3D } from "@/scene/capability";
import { useScrollBridge } from "@/scene/scroll/useScrollBridge";
import { journey, useJourney } from "@/scene/scroll/journeyStore";
import { scroll } from "@/scene/scroll/scrollState";
import { FocusVitrines } from "./FocusVitrines";
import { Beats } from "./Beats";
import { Chargement } from "./Chargement";
import { Contact } from "./Contact";

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
      // Journalise TOUJOURS, pas seulement en developpement. Quand la scene ne
      // s'affiche pas chez quelqu'un d'autre, c'est la seule chose qui
      // distingue « la machine a refuse » de « ça a plante » — et c'est
      // exactement l'information qui manquait au premier rapport de bug.
      if (refus !== null) {
        console.warn(`[voyage] canvas non monté : ${refus}`);
      }
    };
    evaluer();
    mq.addEventListener("change", evaluer);
    return () => mq.removeEventListener("change", evaluer);
  }, []);

  // LE REPLI SUR PERTE DE CONTEXTE, DECIDE PAR L'ATTENTE ET NON PAR L'INSTANT.
  //
  // Trois versions ont echoue avant celle-ci, et chacune pour la meme raison de
  // fond : le conteneur essayait de juger un evenement qu'il ne pouvait pas
  // attribuer.
  //
  //   1. Couper des la premiere perte. Le code appelait `preventDefault()` —
  //      qui demande au navigateur de PREPARER une restauration — puis coupait
  //      la 3D a la ligne suivante. Il reclamait le retour du contexte et n'en
  //      faisait rien.
  //   2. Attendre la restauration. Un contexte DETRUIT ne revient jamais : le
  //      garde-fou finissait par tuer la scene, avec quatre secondes de retard.
  //   3. Ignorer les canvas retires du document. React retire le noeud APRES le
  //      nettoyage, donc le canvas jete est encore connecte quand il emet.
  //
  // Ce qui marche ne demande pas de savoir quel canvas est mort : il suffit de
  // regarder si un canvas VIVANT reapparait. Le mode strict en remonte un
  // aussitot, une vraie panne de pilote n'en remonte aucun. On laisse donc
  // passer le temps, et c'est lui qui tranche.
  const contexte = useJourney((s) => s.contexte);
  useEffect(() => {
    if (!actif || contexte !== "perdu") return;
    console.warn("[voyage] contexte de rendu perdu — attente d'un remplacant");
    const t = window.setTimeout(() => {
      console.warn("[voyage] aucun contexte apres 5 s, repli sur le site sans 3D");
      setActif(false);
      journey.reset();
    }, 5000);
    return () => window.clearTimeout(t);
  }, [actif, contexte]);

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
      {/* L'ecran de chargement. Monte AVANT la scene et hors de sa frontiere de
          suspension : il doit s'afficher pendant que le chunk R3F lui-meme
          arrive, pas seulement pendant que le modele se telecharge. */}
      {actif ? <Chargement locale={locale} /> : null}
      {/* Les quelques mots de la visite : trois blocs sur toute la hauteur,
          pas un site. Marques aria-hidden — ils reprennent du texte qui vit
          deja dans le contenu complet ci-dessous, et le dupliquer dans l'arbre
          d'accessibilite le ferait lire deux fois. */}
      {actif ? <Beats locale={locale} /> : null}
      {/* Le contenu complet, toujours rendu et jamais retire : c'est lui qui
          porte les six liens vers les travaux, le referencement et le clavier.
          Invisible quand la scene est la, il revient au focus. */}
      <div className="journey-dom">{children}</div>
      {/* Le contact, revele a l'arrivee dans le sejour. Hors de `.journey-dom`
          et donc jamais masque avec lui : c'est le seul bloc du voyage qui doit
          rester cliquable. */}
      {actif ? <Contact locale={locale} /> : null}
      {actif ? <FocusVitrines /> : null}
    </div>
  );
}

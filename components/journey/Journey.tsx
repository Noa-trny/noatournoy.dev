"use client";

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/routes";
import { refusDe3D } from "@/scene/capability";
import { useScrollBridge } from "@/scene/scroll/useScrollBridge";
import { journey } from "@/scene/scroll/journeyStore";
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

  // LA PERTE DE CONTEXTE WEBGL, ET SA RECUPERATION.
  //
  // La premiere version abandonnait des la premiere perte : elle appelait
  // `preventDefault()` — ce qui demande au navigateur de PREPARER une
  // restauration — puis coupait la 3D avant que cette restauration arrive.
  // Autrement dit elle demandait le retour du contexte et n'en faisait rien.
  //
  // Or une perte n'est pas forcement fatale. Sur un portable a deux cartes
  // graphiques, le navigateur bascule d'un GPU a l'autre peu apres la creation
  // du contexte, le perd, et le rend une fraction de seconde plus tard. Le
  // symptome vu par l'utilisateur etait exactement celui-la : la maison
  // s'affiche, puis disparait, et le site d'avant reapparait dessous.
  //
  // On attend donc la restauration, et on ne se replie que si elle ne vient
  // pas — ou si les pertes se repetent, signe d'un pilote qui ne tiendra pas.
  const pertes = useRef(0);
  useEffect(() => {
    if (!actif) return;
    const el = conteneur.current;
    if (!el) return;
    let minuterie: number | undefined;

    const perdu = (e: Event) => {
      // UN CANVAS DEJA RETIRE DU DOCUMENT NE COMPTE PAS, et c'est le coeur du
      // defaut rapporte.
      //
      // En developpement, le mode strict de React monte, demonte puis remonte
      // chaque composant. Le premier canvas est donc jete — et un canvas jete
      // emet `webglcontextlost`. L'ecouteur, pose en capture sur le conteneur,
      // recevait l'evenement du canvas MORT et coupait la 3D du vivant.
      //
      // Attendre la restauration ne suffisait pas non plus : un contexte
      // detruit ne revient jamais, donc le garde-fou de quatre secondes
      // finissait par tuer la scene de toute façon. Il faut distinguer les deux
      // situations, et `isConnected` le fait exactement.
      const source = e.target as HTMLCanvasElement | null;
      if (source && !source.isConnected) return;

      // Sans `preventDefault`, le navigateur ne restaure JAMAIS le contexte :
      // c'est l'appel qui signale qu'on souhaite le recuperer.
      e.preventDefault();
      pertes.current += 1;
      console.warn(
        `[voyage] contexte WebGL perdu (${pertes.current}) — attente de restauration`
      );
      if (pertes.current > 2) {
        console.warn("[voyage] trop de pertes, repli sur le site sans 3D");
        setActif(false);
        journey.reset();
        return;
      }
      minuterie = window.setTimeout(() => {
        console.warn("[voyage] contexte non restaure en 4 s, repli");
        setActif(false);
        journey.reset();
      }, 4000);
    };

    const revenu = () => {
      window.clearTimeout(minuterie);
      console.warn("[voyage] contexte WebGL restaure");
    };

    el.addEventListener("webglcontextlost", perdu, true);
    el.addEventListener("webglcontextrestored", revenu, true);
    return () => {
      window.clearTimeout(minuterie);
      el.removeEventListener("webglcontextlost", perdu, true);
      el.removeEventListener("webglcontextrestored", revenu, true);
    };
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

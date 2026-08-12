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

  // PERTE DE CONTEXTE : ON RECONSTRUIT, ON NE RENONCE PAS.
  //
  // La chronologie relevee au harnais est sans ambiguite : un seul canvas du
  // debut a la fin, contexte sain pendant vingt et une secondes, puis
  // « THREE.WebGLRenderer: Context Lost » sur une page immobile. Le mode strict
  // de React n'y est pour rien — deux corrections ont vise ce fantome.
  //
  // Un contexte perdu ne revient pas de lui-meme et `webglcontextrestored`
  // n'arrive jamais : three abandonne son renderer. Mais rien n'empeche d'en
  // fabriquer un neuf. On remonte donc la scene entiere sous une nouvelle cle,
  // ce qui cree un canvas neuf et un contexte neuf.
  //
  // Une seule fois. Si le second contexte meurt a son tour, la machine ne tient
  // pas cette scene, et insister ferait clignoter le site indefiniment.
  const contexte = useJourney((s) => s.contexte);
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    if (!actif || contexte !== "perdu") return;
    if (generation === 0) {
      console.warn("[voyage] contexte perdu — reconstruction de la scene");
      const t = window.setTimeout(() => {
        // REMETTRE L'ETAT A « VIVANT » AVANT DE REMONTER, sinon l'effet se
        // relance aussitot sur `generation` et lit encore « perdu » — le
        // nouveau canvas n'etant pas ne. Il declarait alors de lui-meme une
        // seconde perte, quatre cents millisecondes apres la premiere, et
        // repliait definitivement. La trace du harnais montrait les deux
        // avertissements a 15 734 et 16 152 ms : ce n'etait pas la scene qui
        // mourait deux fois, c'etait moi qui comptais deux fois.
        journey.set({ contexte: "vivant" });
        setGeneration(1);
      }, 400);
      return () => window.clearTimeout(t);
    }
    console.warn("[voyage] contexte perdu une seconde fois — repli definitif");
    setActif(false);
    journey.reset();
  }, [actif, contexte, generation]);

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
              {/* La cle porte la generation : la changer jette le canvas mort
                  et en fabrique un neuf, avec son contexte. */}
              <Scene key={generation} locale={locale} />
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

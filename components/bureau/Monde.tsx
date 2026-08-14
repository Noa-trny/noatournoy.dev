"use client";

import { Suspense, lazy, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Locale } from "@/content/routes";
import { refusDe3D } from "@/scene/capability";
import { pair } from "@/content/routes";
import { Footer, Header, Skip } from "@/components/chrome/Chrome";
import { STATIONS, brancher } from "@/scene/bureau/defilement";
import { Repere } from "./Repere";

const Bureau = lazy(() => import("@/scene/bureau/Bureau"));

// LE MONDE, ET SON REPLI.
//
// La decision porteuse, et la seule chose que trois refontes n'ont pas entamee :
// LE SERVEUR REND LE REPLI. Ce qui part de Vercel, c'est le portfolio sombre
// complet — six liens vers les travaux, la frise, la stack, le contact. Le
// bureau 3D est une AMELIORATION appliquee apres hydratation.
//
// Un seul chemin de code couvre donc sans-JavaScript, sans-WebGL, mouvement
// reduit, machine lente, rendu logiciel et robot d'indexation. Correct par
// defaut, plutot que correct parce qu'on a pense a six cas.
//
// `useState(false)` EST LE POINT LE PLUS IMPORTANT. Le serveur et le PREMIER
// rendu client produisent le meme arbre — le repli, rien d'autre. Toute lecture
// de `window`, `matchMedia` ou `navigator` PENDANT le rendu serait une
// divergence d'hydratation par construction ; elles vivent donc dans un effet.
//
// LE DOCUMENT EST LA PISTE, et c'est le changement de cette version. Le repli
// vivait dans une couche fixe posee par-dessus tout ; il est maintenant DECOUPE
// par station, chaque section a l'offset de defilement ou son objet est a
// l'ecran. Trois consequences tombent d'un coup :
//
//   — la page n'a plus besoin d'entretoise : ce sont les sections elles-memes
//     qui donnent sa hauteur au trajet, donc la piste ne peut pas se
//     desynchroniser du contenu ;
//   — tabuler vers un lien de projet le fait defiler NATIVEMENT, la progression
//     change, et la camera y vole. Zero ligne de code ;
//   — sans JavaScript, les memes sections s'empilent dans l'ordre et forment le
//     portfolio complet.

type Section = {
  /** La clef de station, telle que declaree dans `defilement.ts`. */
  readonly cle: string;
  readonly noeud: ReactNode;
};

export function Monde({
  locale,
  sections,
}: {
  locale: Locale;
  sections: readonly Section[];
}) {
  const [actif, setActif] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluer = () => {
      const refus = refusDe3D();
      setActif(refus === null);
      // Journalise TOUJOURS, pas seulement en developpement : quand la scene ne
      // s'affiche pas chez quelqu'un d'autre, c'est la seule chose qui
      // distingue « la machine a refuse » de « ça a plante ».
      if (refus !== null) console.warn(`[bureau] canvas non monté : ${refus}`);
    };
    evaluer();
    mq.addEventListener("change", evaluer);
    return () => mq.removeEventListener("change", evaluer);
  }, []);

  // La lecture de la barre n'est branchee QUE si la scene l'est : sans canvas,
  // la page se lit de haut en bas et n'a pas de camera a piloter.
  useEffect(() => {
    if (!actif) return;
    return brancher();
  }, [actif]);

  return (
    <div data-3d={actif ? "on" : "off"} className="monde">
      {actif ? (
        <Suspense fallback={null}>
          <Bureau locale={locale} />
        </Suspense>
      ) : null}
      {actif ? <Repere locale={locale} /> : null}

      {/* L'HABILLAGE MANQUAIT ENTIEREMENT SUR L'ACCUEIL, et c'est la refonte de
          `Monde` qui l'a emporte : lien d'evitement, barre de navigation et
          SELECTEUR DE LANGUE. Les metadonnees continuaient d'annoncer la paire
          FR/EN a Google pendant qu'aucun lien de la page n'y menait.

          Il est fixe quand la scene tourne — et non simplement transparent —
          parce qu'un en-tete dans le flux ajouterait sa hauteur a la piste :
          les stations valent un ecran chacune, et cinquante-sept pixels de plus
          decaleraient la camera de toutes les stations d'un cheveu croissant.
          Fixe, il ne pese rien dans la hauteur du document. */}
      <div className="chrome-haut">
        <Skip locale={locale} />
        <Header pair={pair.home} locale={locale} />
      </div>

      <main id="contenu" tabIndex={-1}>
        {STATIONS.map((st, i) => {
          const s = sections.find((x) => x.cle === st.cle);
          return (
            <div key={st.cle} className="station" data-station={i}>
              {/* Une station sans section existe quand meme : le couloir et le
                  plan large sont du TEMPS D'APPROCHE, et ce temps doit occuper
                  sa hauteur de piste sinon la premiere section commence avant
                  qu'on ait vu ou l'on est. */}
              {s ? <div className="station-fond">{s.noeud}</div> : null}
            </div>
          );
        })}
      </main>

      <div className="chrome-bas">
        <Footer locale={locale} />
      </div>
    </div>
  );
}

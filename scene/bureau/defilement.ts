"use client";

import type { IdZone } from "./zones";
import { ZONES } from "./zones";

// LE DEFILEMENT EST LE VOYAGE.
//
// Jusqu'ici la scene etait fixe : on cliquait un objet, la camera y volait, on
// reculait. C'etait un menu en volume. Le defilement en fait un TRAJET — on
// avance dans le bureau, les objets viennent a soi dans l'ordre, et l'on peut
// s'arreter en route. La difference tient en un mot : une scene fixe se
// consulte, un trajet se parcourt.
//
// UNE SEULE SOURCE POUR LA CAMERA, ET C'EST LA BARRE DE DEFILEMENT. Un clic sur
// un objet ne deplace plus l'oeil : il fait DEFILER, et c'est le defilement qui
// deplace l'oeil. Sans cette regle, deux commandes ecrivent la meme camera et
// finissent par se contredire — on clique, la camera part, on touche la
// molette, elle revient. Ici c'est impossible par construction.
//
// LES NOMBRES NE PASSENT PAS PAR REACT. L'ecouteur ecrit dans un objet mutable,
// `useFrame` le lit. Un `useState` par evenement de defilement reafficherait
// l'arbre soixante fois par seconde pour animer une camera qui, elle, ne passe
// jamais par le rendu React. C'est le meme contrat que sur le projet precedent,
// et c'est ce qui lui a permis de tenir 60 images par seconde.

export type Station = {
  /** Identite stable : elle sert de clef de rendu et de nom de point de vue. */
  readonly cle: string;
  /** La zone visee, ou `null` quand la station ne vise aucun objet. */
  readonly zone: IdZone | null;
};

/**
 * LES STATIONS, dans l'ordre du trajet.
 *
 * TROIS stations sans zone ouvrent la marche — le fond du couloir, le seuil,
 * puis le plan large — et c'est pourquoi une station n'est plus un simple
 * `IdZone | null` : trois `null` dans une liste ne se distinguent ni comme
 * clefs de rendu ni comme points de vue. Les cinq suivantes derivent des zones, donc du fichier qui
 * declare le contenu : ajouter une section lui donne une station sans qu'on
 * touche a celui-ci.
 */
export const STATIONS: readonly Station[] = [
  { cle: "couloir", zone: null },
  { cle: "seuil", zone: null },
  { cle: "bureau", zone: null },
  ...ZONES.map((z) => ({ cle: z.id, zone: z.id })),
];

/** Le nombre d'intervalles a parcourir : une station de moins que la liste. */
export const TRAJETS = STATIONS.length - 1;

/**
 * L'etat du defilement, mutable et lu par image.
 *
 * `brut` suit la barre immediatement ; `lisse` le rejoint avec inertie. Les deux
 * sont utiles et pour des raisons differentes : `lisse` donne le poids d'une
 * camera portee, et l'ECART entre les deux dit qu'on est en mouvement — ce qui
 * sert a purger le survol. R3F ne relance un lancer de rayon que sur evenement
 * de pointeur : sans cet ecart, un objet reste allume apres que la camera l'a
 * quitte, la souris n'ayant pas bouge.
 */
export const piste = { brut: 0, lisse: 0 };

const bornes = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 8 ? max : 0;
};

/** Branche la lecture de la barre. Retourne de quoi la debrancher. */
export function brancher(): () => void {
  const lire = () => {
    const max = bornes();
    piste.brut = max ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
  };
  lire();
  // Au branchement seulement, `lisse` rejoint `brut` d'un coup : sinon un
  // rechargement en milieu de page ferait voler la camera depuis le debut du
  // trajet, ce qui se lit comme un bug et non comme une intention.
  piste.lisse = piste.brut;
  // `passive` : sans ce drapeau le navigateur doit attendre l'ecouteur avant de
  // defiler, au cas ou il appellerait `preventDefault`. C'est la cause la plus
  // banale d'un defilement qui accroche.
  window.addEventListener("scroll", lire, { passive: true });
  window.addEventListener("resize", lire);
  return () => {
    window.removeEventListener("scroll", lire);
    window.removeEventListener("resize", lire);
  };
}

/** L'indice de station d'une zone, ou celui du plan large a defaut. */
export const indexDe = (id: IdZone | null) =>
  Math.max(
    STATIONS.findIndex((s) => s.zone === id),
    // Reculer ne ramene ni au couloir ni au seuil mais au PLAN LARGE : ce sont
    // des entrees, pas des points de retour — on ne ressort pas de chez soi
    // pour changer de piece.
    2,
  );

/**
 * Fait defiler jusqu'a une station.
 *
 * C'est tout ce que fait un clic sur un objet, et tout ce que font les boutons
 * de section. `scroll-behavior: smooth` est deja pose sur `html` par la feuille
 * de style, et bascule en `auto` sous `prefers-reduced-motion` : le confort et
 * son contraire tombent donc du CSS que le site expedie deja, sans une ligne de
 * JavaScript de plus.
 */
export function allerA(i: number) {
  const max = bornes();
  window.scrollTo({ top: (max * Math.min(Math.max(i, 0), TRAJETS)) / TRAJETS });
}

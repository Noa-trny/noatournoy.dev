import { SLUGS, type Slug } from "@/content/routes";
import { NIVEAUX } from "../camera/path";

// Ou se posent les six vitrines.
//
// Elles bordent la MONTEE, du portail au pied de l'escalier. Le plan d'origine
// les voulait dans un couloir interieur ; la mesure a tranche deux fois, et
// differemment a chaque modele.
//
// Sur le pavillon, l'interieur ne degageait que 8 m : il n'y avait pas la place,
// et elles sont sorties sur le parvis. Sur la villa il y en a 12,60 — mais LE
// LONG DE X, c'est-a-dire perpendiculairement a la marche de la camera. Un
// degagement transversal ne fait pas un couloir : on ne le parcourt pas, on le
// contemple d'un bout. Les y aligner reviendrait a les mettre toutes de front.
//
// Le parvis bas, lui, est fait pour ça. La camera y arrive de vingt metres et
// remonte vers l'escalier : les vitrines defilent une a une, chacune entrant par
// le fond du cadre pour en sortir par le cote.
//
// Consequence sur le recit, assumee : les travaux viennent AVANT la maison. Ils
// prennent l'ecran au moment ou l'attention est la plus forte, et la maison
// devient la destination plutot que le decor.

/** Le sol du parvis bas, ou la voiture est garee. Releve sur le modele. */
export const SOL_PARVIS = NIVEAUX.garage;

/**
 * Toutes du MEME cote, et c'est une contrainte du modele et non un gout.
 *
 * L'alternance de part et d'autre du passage marchait sur le parvis symetrique
 * du pavillon. Ici le cote gauche est occupe : la voiture tient x de -4,21 a
 * -2,17 sur quatre metres cinquante de long, et le garage est derriere elle.
 * Alterner y planterait une vitrine dans la carrosserie.
 *
 * En les rangeant toutes a droite on obtient d'ailleurs mieux qu'un pis-aller :
 * une file de panneaux qui borde la montee d'un cote, la voiture et le garage
 * de l'autre — deux sujets, deux cotes, aucun encombrement.
 */
const ECART = 4.2;

/** Un leger evasement : la file s'ouvre a mesure qu'on avance. */
const EVASEMENT = 0.22;

export type Emplacement = {
  readonly slug: Slug;
  /** Position du socle, au sol. */
  readonly position: readonly [number, number, number];
  /** Rotation autour de Y : la vitrine se tourne vers le passage. */
  readonly rotation: number;
  /** Progression a laquelle elle est au plus pres — sert aux ancres du DOM. */
  readonly beat: number;
};

// De la plus lointaine a la plus proche de la maison : la camera les rencontre
// donc dans l'ordre _01 a _06, celui de la numerotation du site.
// LA FILE SUIT LE RECUL DU TRAJET. En 30 degres de champ vertical, le cadre ne
// fait que 0,48 fois la distance en demi-largeur : une vitrine posee a 3,4 m de
// l'axe n'entre dans l'image qu'a partir de sept metres devant la camera. Placee
// trop pres du depart, elle nait deja hors cadre et n'est jamais vue.
const Z_DEPART = 30.0;
// Etale sur dix-huit metres et non douze. A 2,4 m d'intervalle la file se
// lisait comme une pile de panneaux entassee sur le bord droit du cadre : deux
// vitrines etaient enormes au premier plan et les quatre autres se
// chevauchaient derriere. Il faut que chacune ait le cadre pour elle un moment.
const Z_PAS = 3.6;

export const EMPLACEMENTS: readonly Emplacement[] = SLUGS.map((slug, i) => {
  const z = Z_DEPART - i * Z_PAS;
  return {
    slug,
    position: [ECART + i * EVASEMENT, SOL_PARVIS, z] as const,
    // Legerement de biais plutot que de face : un panneau strictement
    // perpendiculaire au passage n'offre sa surface qu'un instant.
    rotation: -Math.PI * 0.38,
    // Les beats suivent l'approche. Elle occupe environ les deux cinquiemes du
    // defilement : le trajet monte ensuite l'escalier, franchit la baie et
    // s'ouvre dans le sejour, ce que le pavillon de plain-pied ne faisait pas.
    beat: 0.06 + i * 0.055,
  };
});

export const emplacementDe = (slug: Slug): Emplacement =>
  EMPLACEMENTS.find((e) => e.slug === slug)!;

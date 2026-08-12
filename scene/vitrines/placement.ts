import { SLUGS, type Slug } from "@/content/routes";
import { CHEMIN, NIVEAUX } from "../camera/path";

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
const ECART = 3.5;

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
const Z_DEPART = 25.0;
// Etale sur dix-sept metres et non douze : a 2,4 m d'intervalle la file se
// lisait comme une pile de panneaux entassee sur le bord droit du cadre.
//
// Et elle COMMENCE NEUF METRES DEVANT LA CAMERA, pas quatre. Le cadre ne fait
// que 0,48 fois la distance en demi-largeur : a quatre metres, une vitrine
// posee a 4,2 m de l'axe deborde de l'image et n'y montre qu'une tranche
// enorme. A neuf, elle tient tout juste — c'est-a-dire qu'elle entre par le
// bord au moment ou on la decouvre.
const Z_PAS = 3.4;

/**
 * A quel moment du voyage la camera passe-t-elle au plus pres de ce point, et
 * d'ou le regarde-t-elle alors ?
 *
 * On echantillonne la courbe et on garde le minimum. Grossier, mais exact a la
 * tolerance de l'echantillonnage — et surtout DERIVE : le jour ou le trajet
 * change, les six vitrines se replacent sans que personne y pense.
 */
function rencontre(x: number, z: number) {
  const N = 400;
  let meilleur = { t: 0, d2: Infinity, cx: 0, cz: 0 };
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = CHEMIN.getPointAt(t);
    const d2 = (p.x - x) ** 2 + (p.z - z) ** 2;
    if (d2 < meilleur.d2) meilleur = { t, d2, cx: p.x, cz: p.z };
  }
  return meilleur;
}

export const EMPLACEMENTS: readonly Emplacement[] = SLUGS.map((slug, i) => {
  const x = ECART + i * EVASEMENT;
  const z = Z_DEPART - i * Z_PAS;
  const { t, cx, cz } = rencontre(x, z);
  return {
    slug,
    position: [x, SOL_PARVIS, z] as const,
    // CHAQUE VITRINE SE TOURNE VERS LA CAMERA, a l'instant ou celle-ci passe
    // au plus pres. L'angle n'est pas ecrit, il est CALCULE depuis la courbe :
    // retoucher le trajet reoriente les six sans y penser.
    //
    // C'etait le defaut principal. Toutes orientees pareil, elles etaient
    // prises de biais et a moitie hors cadre — on lisait des panneaux plantes
    // au bord d'une route, pas une presentation.
    //
    // `atan2` sur le vecteur vitrine -> camera, parce que le panneau regarde
    // son +Z local. Le petit decalage evite le strictement perpendiculaire, qui
    // n'offre sa surface qu'un instant et se presente de profil juste avant et
    // juste apres.
    rotation: Math.atan2(cx - x, cz - z) - 0.16,
    // Le beat est CALCULE lui aussi, au lieu d'etre reparti a la main. Les
    // ancres du DOM tombent donc quand la vitrine est reellement a l'ecran —
    // c'est ce qui fait que tabuler vers un projet y amene la camera.
    beat: t,
  };
});

export const emplacementDe = (slug: Slug): Emplacement =>
  EMPLACEMENTS.find((e) => e.slug === slug)!;

import type { Locale } from "@/content/routes";

// LES ZONES : la carte qui relie un objet du bureau a une section du site.
//
// C'est le fichier qui empeche ce monde d'etre un menu deguise. Chaque entree
// dit quel objet on regarde, d'ou la camera le regarde, et ce qui s'ouvre —
// donc le decor et le contenu sont declares au meme endroit, et il devient
// impossible d'ajouter une section sans lui donner un objet.
//
// Les points de vue sont des COUPLES position/cible. Une position seule ne
// suffit pas : R3F ne fait pas viser la camera, et c'est deja ce qui avait
// cadre le vide au-dessus du plateau au premier rendu.

export type IdZone = "projets" | "apropos" | "parcours" | "stack" | "contact";

export type Zone = {
  readonly id: IdZone;
  /** L'objet qui la porte, pour les commentaires et le libelle de survol. */
  readonly objet: Readonly<Record<Locale, string>>;
  readonly titre: Readonly<Record<Locale, string>>;
  /** D'ou la camera regarde, une fois arrivee. */
  readonly oeil: readonly [number, number, number];
  /** Ce qu'elle vise. */
  readonly cible: readonly [number, number, number];
  /**
   * La largeur, en metres, que l'image DOIT contenir : la dalle plus sa marge.
   *
   * C'est ce nombre, et non la position de l'oeil, qui decide de la distance
   * finale — `Rig` recule jusqu'a ce que cette largeur tienne dans le cadre.
   * Les couples ci-dessous ont ete composes sur un ecran large ; sur un
   * telephone, le champ horizontal vaut le quart, et les cinq vues coupaient le
   * texte des deux cotes. Une distance ecrite a la main aurait donc du etre
   * ecrite deux fois, puis retouchee a chaque fois qu'une dalle change de
   * taille. L'optique, elle, ne se trompe pas : `d = largeur / (2 tan(champ/2)
   * x rapport)`.
   */
  readonly largeur: number;
};

/** Le champ vertical de la camera, en degres. Partage avec `Bureau`. */
export const CHAMP = 32;

/** Le point de vue d'ensemble : le plan large, et le retour de chaque zone. */
export const VUE_LARGE = {
  oeil: [2.35, 1.98, 2.85] as const,
  cible: [-0.05, 0.88, -0.25] as const,
};

/**
 * LE PLAN LARGE EN PORTRAIT, et ce n'est pas le meme cadrage recadre.
 *
 * Un ecran de telephone est deux fois plus haut que large ; le champ HORIZONTAL
 * y vaut moins du quart de celui d'un ecran de bureau. Conserver la meme vue en
 * reculant donnerait un bureau minuscule au milieu de deux bandes vides, et
 * elargir la focale au point de tout rentrer donnerait 90 degres de champ,
 * c'est-a-dire une image d'oeil de poisson.
 *
 * On change donc de PLAN, pas d'echelle : la camera se rapproche, monte, et
 * cadre les deux ecrans plutot que le bureau entier. Ce qui sort du cadre — la
 * pile de livres, la plante — n'a jamais porte de contenu.
 */
export const VUE_PORTRAIT = {
  // CE QUE LA GEOMETRIE INTERDIT, ET QU'IL A FALLU CAPTURER POUR ADMETTRE.
  //
  // En 32 degres de champ vertical, la demi-largeur cadree vaut 0,13 fois la
  // distance sur un rapport de telephone. Les cinq objets porteurs s'etalent sur
  // 2,20 m de plateau, soit 1,80 m de largeur apparente de trois quarts : les
  // reunir dans une seule image demanderait SEPT METRES de recul. C'est le
  // premier essai, celui qui donnait un bureau minuscule au fond d'un cadre
  // vide. A l'inverse, cadrer serre coupait l'ecran principal.
  //
  // Il n'y a donc pas de cadrage qui contienne tout : le telephone atteint les
  // cinq zones par la barre du bas (voir Repere.tsx, revelee au pointeur
  // grossier), et l'image n'a plus a servir de menu. Elle redevient une image.
  //
  // ET ELLE PLONGE A TRENTE DEGRES. Un cadre deux fois plus haut que large ne se
  // remplit pas a l'horizontale — le troisieme essai, capture, montrait un tiers
  // de mur nu au-dessus du bureau, parce qu'a trois metres le cadre fait 1,66 m
  // de haut quand le bureau n'en occupe que 0,50. En plongee, c'est la
  // PROFONDEUR du plateau qui se deplie sur la hauteur de l'image : le bord
  // avant tombe en bas du cadre, la dalle occupe le milieu, et il ne reste qu'un
  // bandeau de mur. Pas quarante degres pour autant : la dalle est verticale, et
  // au-dela elle s'ecrase au point de ne plus se lire.
  oeil: [1.09, 2.16, 1.69] as const,
  cible: [-0.2, 0.86, -0.15] as const,
};

/** En deca de ce rapport largeur/hauteur, on bascule en portrait. */
export const SEUIL_PORTRAIT = 0.85;

export const ZONES: readonly Zone[] = [
  {
    id: "projets",
    objet: { fr: "l'écran principal", en: "the main screen" },
    titre: { fr: "Projets", en: "Projects" },
    // Presque de face, un peu au-dessus : on lit une dalle de face, pas de
    // trois quarts — c'est la seule zone ou l'angle du plan large ne vaut rien.
    oeil: [-0.12, 1.12, 0.72],
    cible: [-0.29, 1.03, -0.33],
    /** Dalle de 0.58 m, plus la marge. */
    largeur: 0.70,
  },
  {
    id: "apropos",
    objet: { fr: "le second écran", en: "the second screen" },
    titre: { fr: "À propos", en: "About" },
    oeil: [0.78, 1.1, 0.66],
    cible: [0.52, 1.0, -0.29],
    /** Dalle de 0.50 m, plus la marge. */
    largeur: 0.62,
  },
  {
    id: "parcours",
    objet: { fr: "le carnet", en: "the notebook" },
    titre: { fr: "Parcours", en: "Background" },
    // En plongee : un carnet pose se lit de dessus, pas de face.
    oeil: [-0.86, 1.34, 0.52],
    cible: [-1.02, 0.79, 0.2],
    /** Dalle de 0.175 m, plus la marge. */
    largeur: 0.26,
  },
  {
    id: "stack",
    objet: { fr: "la machine", en: "the machine" },
    titre: { fr: "Stack", en: "Stack" },
    // Plus de recul que les autres zones : une grille de neuf logos se lit
    // d'un coup d'oeil, elle n'a pas besoin qu'on colle le nez dessus — et de
    // pres, le boitier remplit le cadre sans qu'on sache ou l'on est.
    oeil: [-0.42, 1.24, 0.46],
    cible: [-1.2, 0.9, -0.3],
    /** Dalle de 0.28 m, plus la marge. */
    largeur: 0.40,
  },
  {
    id: "contact",
    objet: { fr: "le portable", en: "the laptop" },
    titre: { fr: "Contact", en: "Contact" },
    oeil: [1.02, 1.16, 0.92],
    cible: [1.02, 0.86, 0.1],
    /** Dalle de 0.31 m, plus la marge. */
    largeur: 0.42,
  },
];

export const zonePar = (id: IdZone): Zone => ZONES.find((z) => z.id === id)!;

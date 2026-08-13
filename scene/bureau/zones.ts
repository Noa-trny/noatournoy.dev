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
};

/** Le point de vue d'ensemble : le plan large, et le retour de chaque zone. */
export const VUE_LARGE = {
  oeil: [2.35, 1.98, 2.85] as const,
  cible: [-0.05, 0.88, -0.25] as const,
};

export const ZONES: readonly Zone[] = [
  {
    id: "projets",
    objet: { fr: "l'écran principal", en: "the main screen" },
    titre: { fr: "Projets", en: "Projects" },
    // Presque de face, un peu au-dessus : on lit une dalle de face, pas de
    // trois quarts — c'est la seule zone ou l'angle du plan large ne vaut rien.
    oeil: [-0.12, 1.12, 0.72],
    cible: [-0.29, 1.03, -0.33],
  },
  {
    id: "apropos",
    objet: { fr: "le second écran", en: "the second screen" },
    titre: { fr: "À propos", en: "About" },
    oeil: [0.78, 1.1, 0.66],
    cible: [0.52, 1.0, -0.29],
  },
  {
    id: "parcours",
    objet: { fr: "le carnet", en: "the notebook" },
    titre: { fr: "Parcours", en: "Background" },
    // En plongee : un carnet pose se lit de dessus, pas de face.
    oeil: [-0.86, 1.34, 0.52],
    cible: [-1.02, 0.79, 0.2],
  },
  {
    id: "stack",
    objet: { fr: "la machine", en: "the machine" },
    titre: { fr: "Stack", en: "Stack" },
    oeil: [-0.72, 1.12, 0.18],
    cible: [-1.24, 0.88, -0.34],
  },
  {
    id: "contact",
    objet: { fr: "le portable", en: "the laptop" },
    titre: { fr: "Contact", en: "Contact" },
    oeil: [1.02, 1.16, 0.92],
    cible: [1.02, 0.86, 0.1],
  },
];

export const zonePar = (id: IdZone): Zone => ZONES.find((z) => z.id === id)!;

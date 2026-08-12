import { SLUGS, type Slug } from "@/content/routes";

// Ou se posent les six vitrines.
//
// Elles bordent le PARVIS, pas un couloir interieur. Le plan d'origine les
// voulait dedans, mais la mesure a tranche : l'interieur de cette maison ne
// degage que ~8 m dans sa plus grande direction, cloisonne comme une vraie
// maison — six vitrines a 2 m d'intervalle en demandent 12.
//
// Le parvis, lui, est praticable de Z = 5 a Z = 22 et large de 18 m. Il porte
// une ouverture circulaire en son centre, d'ou l'alternance de part et d'autre
// du passage : la camera avance entre elles, et chacune passe a hauteur de
// regard sans jamais barrer la route.
//
// Consequence sur le recit, assumee : les travaux viennent AVANT la maison. Ils
// prennent l'ecran au moment ou l'attention est la plus forte, et la maison
// devient la destination plutot que le decor.

/** Le sol du parvis, mesure au lancer de rayon. */
export const SOL_PARVIS = -0.31;

/** Ecart lateral au passage. Assez pour ne pas gener, assez pour se lire. */
const ECART = 5.6;

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
const Z_DEPART = 19.0;
const Z_PAS = 2.5;

export const EMPLACEMENTS: readonly Emplacement[] = SLUGS.map((slug, i) => {
  const gauche = i % 2 === 0;
  const z = Z_DEPART - i * Z_PAS;
  return {
    slug,
    position: [gauche ? -ECART : ECART, SOL_PARVIS, z] as const,
    // Legerement de biais plutot que de face : un panneau strictement
    // perpendiculaire au passage n'offre sa surface qu'un instant.
    rotation: gauche ? Math.PI * 0.42 : -Math.PI * 0.42,
    // Les beats suivent l'approche, qui occupe les deux tiers du defilement.
    beat: 0.10 + i * 0.085,
  };
});

export const emplacementDe = (slug: Slug): Emplacement =>
  EMPLACEMENTS.find((e) => e.slug === slug)!;

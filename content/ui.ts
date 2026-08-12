import type { Locale } from "./routes";

// Les chaines de l'habillage : entete, tiroir de menu, pied de page, navigation
// entre fiches. Elles etaient recopiees dans 21 fichiers HTML, ce qui est
// exactement par ou les deux arbres ont derive.
//
// `Record<Locale, T>` rend une traduction manquante impossible a committer.

type L<T> = Readonly<Record<Locale, T>>;

export const ui = {
  skip: { fr: "Aller au contenu", en: "Skip to content" } satisfies L<string>,
  mark: { fr: "Portfolio", en: "Portfolio" } satisfies L<string>,
  langGroup: { fr: "Langue", en: "Language" } satisfies L<string>,
  menuOpen: { fr: "Menu", en: "Menu" } satisfies L<string>,
  menuClose: { fr: "Fermer", en: "Close" } satisfies L<string>,
  menuNav: { fr: "Sections", en: "Sections" } satisfies L<string>,

  /**
   * L'ecran de chargement de la visite. Il vit ici et non dans `home.ts` parce
   * que c'est de l'habillage, pas de la copie d'accueil — et parce que
   * `home.ts` est genere, donc une chaine ecrite a la main y serait perdue au
   * prochain passage du generateur.
   */
  chargement: {
    fr: "Chargement de la visite",
    en: "Loading the tour",
  } satisfies L<string>,

  /** Le titre masque qui ancre la section de navigation en bas des fiches. */
  suite: { fr: "Suite", en: "Next" } satisfies L<string>,
  /**
   * L'ancien arbre anglais portait aria-label="Travaux" ici — du francais dans
   * une page `lang="en"`, donc annonce avec la mauvaise prononciation par un
   * lecteur d'ecran. Corrige.
   */
  worksNav: { fr: "Travaux", en: "Work" } satisfies L<string>,
  prevWork: { fr: "Travail précédent", en: "Previous project" } satisfies L<string>,
  nextWork: { fr: "Travail suivant", en: "Next project" } satisfies L<string>,
  /**
   * La chaine des fiches n'est PAS cyclique : la premiere n'a pas de precedent
   * et la derniere pas de suivant. A la place, un retour vers l'index.
   */
  back: { fr: "Retour", en: "Back" } satisfies L<string>,
  allWork: { fr: "Tous les travaux", en: "All work" } satisfies L<string>,

  footPlace: {
    fr: "Noa Tournoy — Lille, France",
    en: "Noa Tournoy — Lille, France",
  } satisfies L<string>,
  /**
   * Meme correction qu'au-dessus : le pied de page anglais affichait
   * « Travaux » tout en pointant vers /en/work/.
   */
  footWork: { fr: "Travaux", en: "Work" } satisfies L<string>,
  footContact: { fr: "Contact", en: "Contact" } satisfies L<string>,

  // Le tiroir de menu des pages interieures : quatre destinations.
  navHome: { fr: "Accueil", en: "Home" } satisfies L<string>,
  navWork: { fr: "Travaux", en: "Work" } satisfies L<string>,
  navSkills: { fr: "Savoir-faire", en: "Skills" } satisfies L<string>,
  navContact: { fr: "Contact", en: "Contact" } satisfies L<string>,

  // Celui de l'accueil est different : cinq ancres vers ses propres sections.
  // Les deux existaient deja ; les confondre aurait fait disparaitre Parcours,
  // Stack et Certifications de la navigation de l'accueil.
  anchorWork: { fr: "Travaux", en: "Work" } satisfies L<string>,
  anchorPath: { fr: "Parcours", en: "Path" } satisfies L<string>,
  anchorStack: { fr: "Stack", en: "Stack" } satisfies L<string>,
  anchorCerts: { fr: "Certifications", en: "Certifications" } satisfies L<string>,
  anchorContact: { fr: "Contact", en: "Contact" } satisfies L<string>,
} as const;

/** Raccourci de lecture : `t(ui.skip, "en")`. */
export const t = <T,>(entry: Readonly<Record<Locale, T>>, locale: Locale): T =>
  entry[locale];

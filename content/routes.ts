// La carte des URLs. Le francais vit a la racine, l'anglais sous /en/ avec des
// segments traduits (/travaux/ -> /en/work/, /savoir-faire/ -> /en/skills/).
// C'est pour cela qu'un segment [locale] ne convenait pas : il aurait impose
// /fr/travaux/ puis une reecriture pour le cacher.
//
// Tout ce qui relie une page francaise a sa jumelle anglaise passe par ici :
// le selecteur de langue, les alternates hreflang et le sitemap en derivent,
// pour qu'un lien ne puisse pas pointer sur la mauvaise cible.

export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * L'ordre canonique des travaux — celui de la liste numerotee de l'accueil.
 *
 * Il existait deux ordres contradictoires dans l'ancien site : la liste de
 * l'accueil (_01 a _06) et la chaine precedent/suivant ecrite a la main en bas
 * de chaque fiche, qui divergeaient aux positions 4 a 6. Le tableau ci-dessous
 * est desormais la seule source : la numerotation ET la navigation en decoulent,
 * donc l'incoherence ne peut plus revenir.
 */
export const SLUGS = [
  "eclosion",
  "datasentinel",
  "supkonquest",
  "ludoria",
  "laying-grass",
  "gamedex",
] as const;

export type Slug = (typeof SLUGS)[number];

export const isSlug = (v: string): v is Slug =>
  (SLUGS as readonly string[]).includes(v);

export const ORIGIN = "https://noatournoy.dev";

type Static = Readonly<Record<Locale, string>>;
type Dynamic = Readonly<Record<Locale, (slug: Slug) => string>>;

export const routes = {
  home: { fr: "/", en: "/en/" } satisfies Static,
  work: { fr: "/travaux/", en: "/en/work/" } satisfies Static,
  skills: { fr: "/savoir-faire/", en: "/en/skills/" } satisfies Static,
  contact: { fr: "/contact/", en: "/en/contact/" } satisfies Static,
  project: {
    fr: (slug: Slug) => `/travaux/${slug}/`,
    en: (slug: Slug) => `/en/work/${slug}/`,
  } satisfies Dynamic,
} as const;

/** Le couple d'URLs d'une meme page, pour les alternates et le selecteur. */
export type Pair = Readonly<Record<Locale, string>>;

export const pair = {
  home: routes.home,
  work: routes.work,
  skills: routes.skills,
  contact: routes.contact,
  project: (slug: Slug): Pair => ({
    fr: routes.project.fr(slug),
    en: routes.project.en(slug),
  }),
} as const;

/**
 * Les `alternates` de l'API Metadata, dans la forme exacte que servait
 * l'ancien HTML : hreflang fr, hreflang en, et x-default pointant sur le
 * francais.
 */
export function alternates(p: Pair, locale: Locale) {
  return {
    canonical: p[locale],
    languages: {
      fr: p.fr,
      en: p.en,
      "x-default": p.fr,
    },
  };
}

/**
 * Toutes les pages du site, dans l'ordre du plan. Sert au sitemap.
 *
 * L'ordre des sections reprend celui de l'ancien sitemap.xml ; celui des six
 * travaux vient de SLUGS. L'ancien fichier les listait dans un TROISIEME ordre
 * — celui de la chaine precedent/suivant — different de la liste de l'accueil.
 * L'ensemble des URLs est identique, seule leur position change, et l'ordre
 * d'un sitemap ne porte aucune information.
 */
export function allPages(): { pair: Pair }[] {
  return [
    { pair: pair.home },
    { pair: pair.work },
    { pair: pair.skills },
    { pair: pair.contact },
    ...SLUGS.map((s) => ({ pair: pair.project(s) })),
  ];
}

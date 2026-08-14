import type { Locale, Slug } from "./routes";

// LE MANIFESTE. Une seule source pour trois consommateurs : le HTML des
// pages, la scene 3D (une vitrine par travail), et le sitemap.
//
// `Record<Locale, ...>` n'est pas decoratif : il fait d'une traduction
// manquante une ERREUR DE COMPILATION. C'est la garantie que les deux arbres
// HTML ecrits a la main ne pouvaient pas donner — et c'est precisement par la
// qu'ils avaient derive.
//
// Ce fichier a ete genere depuis l'ancien HTML puis relu, pour qu'aucune chaine
// ne derive a la recopie.

export type ProjectLink = {
  readonly href: string;
  readonly label: Readonly<Record<Locale, string>>;
};

export type ProjectCopy = {
  /** Deuxieme jeton de l'etiquette : annee et cadre. */
  readonly context: string;
  /** Troisieme jeton : la pile technique. */
  readonly stack: string;
  readonly lede: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly ogDescription: string;
};

/**
 * LE VISUEL D'UN TRAVAIL, sur la liste des travaux.
 *
 * Trois projets ont une capture publique, trois n'en ont pas — deux sont sous
 * accord de confidentialite, un est en depot prive. Plutot que de laisser trois
 * trous, ceux-la portent un MOT : c'est une decision de design assumee, comme
 * l'ancien site la prenait deja, et non une image manquante.
 *
 * Ce champ a existe sous le nom `peek`, a ete supprime comme mort — plus aucune
 * page ne le lisait depuis le retrait de l'ancienne feuille de style — et
 * revient ici parce que la liste des travaux s'en sert de nouveau. Il est cette
 * fois LU, ce qui est toute la difference.
 */
export type Vignette =
  | { readonly kind: "image"; readonly src: string; readonly alt: Readonly<Record<Locale, string>> }
  | { readonly kind: "mot"; readonly mot: Readonly<Record<Locale, string>> };

export type Project = {
  readonly slug: Slug;
  /** _01 a _06, la numerotation visible de l'accueil. */
  readonly no: string;
  /** Nom propre : jamais traduit. */
  readonly title: string;
  readonly tags: readonly string[];
  /** L'annee affichee en pastille sur /travaux/. */
  readonly year: string;
  /** La phrase longue de la liste /travaux/, distincte du lede de la fiche. */
  readonly blurb: Readonly<Record<Locale, string>>;
  readonly vignette: Vignette;
  readonly links: readonly ProjectLink[];
  /** Par defaut /og.png ; Eclosion montre sa propre aube. */
  readonly ogImage?: string;
  readonly copy: Readonly<Record<Locale, ProjectCopy>>;
};

export const PROJECTS: readonly Project[] = [
  {
    slug: "eclosion",
    no: "_01",
    title: "Éclosion",
    tags: ["Next.js", "React Three Fiber", "GLSL", "WebAudio"],
    year: "2026",
    blurb: { fr: "Expérience web 3D où le défilement est le temps, huit actes, 100 % procédurale — aucun modèle, aucune texture, aucun fichier audio. Seul, de bout en bout. Next.js 15 · React 19 · TypeScript · Three.js · GLSL · WebAudio.", en: "A 3D web experience where scrolling is time. Eight acts, fully procedural, with no models, no textures and no audio files. Solo, end to end. Next.js 15 · React 19 · TypeScript · Three.js · GLSL · WebAudio." },
    vignette: {
      kind: "image",
      src: "/travaux/eclosion/img/dawn-700.webp",
      alt: { fr: "L'aube d'Éclosion : un soleil bas sur un vol d'oiseaux.", en: "Éclosion's dawn: a low sun over a flight of birds." },
    },
    links: [
      { href: "https://eclosion.noatournoy.dev", label: { fr: "Voir l'expérience", en: "See the experience" } },
      { href: "https://github.com/Noa-trny/eclosion", label: { fr: "Lire le code", en: "Read the code" } },
    ],
    ogImage: "/travaux/eclosion/img/dawn-1400.webp",
    copy: {
      fr: {
        context: "2026, seul, de bout en bout",
        stack: "Next.js · React Three Fiber · GLSL · WebAudio",
        lede: "Une expérience web 3D où le défilement est le temps : huit actes, du Néant à l'Aube, traversés à la molette, du premier battement d'une graine jusqu'au premier lever de soleil du monde.",
        metaTitle: "Éclosion — Noa Tournoy",
        metaDescription: "Éclosion : expérience web 3D où le défilement est le temps. Huit actes, 100 % procédurale. Charge de première visite réduite de 19 %, gel de 617 ms éliminé.",
        ogDescription: "Expérience web 3D où le défilement est le temps. Huit actes, 100 % procédurale, aucun modèle ni texture ni fichier audio.",
      },
      en: {
        context: "2026, solo, end to end",
        stack: "Next.js · React Three Fiber · GLSL · WebAudio",
        lede: "A 3D web experience where scrolling is time: eight acts, from the Void to the Dawn, travelled with the wheel, from a seed's first beat to the world's first sunrise.",
        metaTitle: "Éclosion — Noa Tournoy",
        metaDescription: "Éclosion: a 3D web experience where scrolling is time. Eight acts, fully procedural. First-visit payload cut by 19%, a 617 ms freeze eliminated.",
        ogDescription: "Éclosion: a 3D web experience where scrolling is time. Eight acts, fully procedural. First-visit payload cut by 19%, a 617 ms freeze eliminated.",
      },
    },
  },
  {
    slug: "datasentinel",
    no: "_02",
    title: "DataSentinel",
    tags: ["Looker", "LookML", "Python", "BigQuery", "Terraform"],
    year: "2025",
    blurb: { fr: "Tableau de bord de pilotage de la sécurité des produits digitaux, chez ADEO. Stage de trois mois. Looker · LookML · Python · React · BigQuery · Terraform · Kubernetes.", en: "A dashboard for monitoring the security of digital products, at ADEO. Three-month internship. Looker · LookML · Python · React · BigQuery · Terraform · Kubernetes." },
    vignette: { kind: "mot", mot: { fr: "Confidentiel — ADEO", en: "Confidential — ADEO" } },
    links: [],
    copy: {
      fr: {
        context: "Juin → août 2025, stage ADEO Ronchin",
        stack: "Looker · LookML · Python · React · BigQuery · Terraform",
        lede: "Un tableau de bord qui a remplacé le suivi manuel de la sécurité des produits digitaux, et les extensions full-stack qui le rendent utilisable au quotidien.",
        metaTitle: "DataSentinel — Noa Tournoy",
        metaDescription: "DataSentinel : tableau de bord de pilotage de la sécurité des produits digitaux, construit pendant un stage de trois mois chez ADEO. Looker, LookML, Python, React, BigQuery, Terraform, Kubernetes.",
        ogDescription: "Un tableau de bord qui a remplacé le suivi manuel de la sécurité des produits digitaux, chez ADEO.",
      },
      en: {
        context: "June → August 2025, internship at ADEO Ronchin",
        stack: "Looker · LookML · Python · React · BigQuery · Terraform",
        lede: "A dashboard that replaced the manual tracking of digital-product security, and the full-stack extensions that make it usable day to day.",
        metaTitle: "DataSentinel — Noa Tournoy",
        metaDescription: "DataSentinel: a dashboard for monitoring the security of digital products, built during a three-month internship at ADEO. Looker, LookML, Python, React, BigQuery, Terraform, Kubernetes.",
        ogDescription: "DataSentinel: a dashboard for monitoring the security of digital products, built during a three-month internship at ADEO. Looker, LookML, Python, React, BigQuery, Terraform, Kubernetes.",
      },
    },
  },
  {
    slug: "supkonquest",
    no: "_03",
    title: "SupKonQuest",
    tags: ["Godot 4.6", "C++20", "TCP binaire", "Docker"],
    year: "2026",
    blurb: { fr: "Stratégie temps réel multijoueur. Client Godot, serveur C++20 faisant autorité sur Raspberry Pi 5, protocole TCP binaire, cartes procédurales. Dépôts privés.", en: "Multiplayer real-time strategy. Godot client, authoritative C++20 server on a Raspberry Pi 5, binary TCP protocol, procedural maps. Private repositories." },
    vignette: { kind: "mot", mot: { fr: "Dépôts privés", en: "Private repositories" } },
    links: [],
    copy: {
      fr: {
        context: "2026, sous Carton Studio's",
        stack: "Godot 4.6 · C++20 · TCP binaire",
        lede: "Un jeu de stratégie temps réel multijoueur, dans l'esprit de Risk : un client Godot, un serveur C++ qui fait autorité, et rien entre les deux qu'un protocole binaire.",
        metaTitle: "SupKonQuest — Noa Tournoy",
        metaDescription: "SupKonQuest : jeu de stratégie temps réel multijoueur. Client Godot 4.6, serveur C++20 faisant autorité sur Raspberry Pi 5, protocole TCP binaire, cartes procédurales.",
        ogDescription: "Stratégie temps réel multijoueur. Client Godot, serveur C++20 faisant autorité, protocole TCP binaire.",
      },
      en: {
        context: "2026, under Carton Studio's",
        stack: "Godot 4.6 · C++20 · binary TCP",
        lede: "A multiplayer real-time strategy game in the spirit of Risk: a Godot client, an authoritative C++ server, and nothing between them but a binary protocol.",
        metaTitle: "SupKonQuest — Noa Tournoy",
        metaDescription: "SupKonQuest: a multiplayer real-time strategy game. Godot 4.6 client, authoritative C++20 server targeting a Raspberry Pi 5, binary TCP protocol, procedural maps.",
        ogDescription: "SupKonQuest: a multiplayer real-time strategy game. Godot 4.6 client, authoritative C++20 server targeting a Raspberry Pi 5, binary TCP protocol, procedural maps.",
      },
    },
  },
  {
    slug: "ludoria",
    no: "_04",
    title: "Ludoria",
    tags: ["Python", "Pygame", "sockets", "Équipe de trois"],
    year: "2025",
    blurb: { fr: "Trois jeux de plateau en réseau : Katerenga, Congress, Isolation. Travail d'équipe à trois : interface, direction artistique et opposants automatiques. Python · Pygame · sockets.", en: "Three networked board games: Katerenga, Congress, Isolation. Team of three: interface, art direction and computer opponents. Python · Pygame · sockets." },
    vignette: {
      kind: "image",
      src: "/travaux/ludoria/img/ludoria-katerenga-700.webp",
      alt: { fr: "Le plateau de Katerenga dans Ludoria.", en: "The Katerenga board in Ludoria." },
    },
    links: [
      { href: "https://github.com/simonpotel/Ludoria", label: { fr: "Lire le code", en: "Read the code" } },
    ],
    copy: {
      fr: {
        context: "2025, équipe de trois",
        stack: "Python · Pygame · Pillow · sockets",
        lede: "Une plateforme qui réunit trois jeux de plateau (Katerenga, Congress et Isolation) jouables en local comme en ligne, sous une seule interface.",
        metaTitle: "Ludoria — Noa Tournoy",
        metaDescription: "Ludoria : trois jeux de plateau en réseau : Katerenga, Congress, Isolation. Python, Pygame, sockets. Travail d'équipe à trois ; interface, direction artistique et opposants automatiques.",
        ogDescription: "Trois jeux de plateau en réseau, en local et en ligne. Python, Pygame, sockets. Projet d'équipe à trois.",
      },
      en: {
        context: "2025, team of three",
        stack: "Python · Pygame · Pillow · sockets",
        lede: "A platform bringing together three board games (Katerenga, Congress and Isolation) playable locally and online, under a single interface.",
        metaTitle: "Ludoria — Noa Tournoy",
        metaDescription: "Ludoria: three networked board games: Katerenga, Congress, Isolation. Python, Pygame, sockets. A team of three; interface, art direction and computer opponents.",
        ogDescription: "Ludoria: three networked board games: Katerenga, Congress, Isolation. Python, Pygame, sockets. A team of three; interface, art direction and computer opponents.",
      },
    },
  },
  {
    slug: "laying-grass",
    no: "_05",
    title: "laying_grass",
    tags: ["C++17", "STL", "Zéro dépendance"],
    year: "2026",
    blurb: { fr: "Jeu de pose de tuiles en console, sans une seule dépendance externe. C++17.", en: "A tile-laying game in the console, without a single external dependency. C++17." },
    vignette: {
      kind: "image",
      src: "/travaux/laying-grass/img/console.webp",
      alt: { fr: "laying_grass en console, tuiles posees.", en: "laying_grass in the console, tiles placed." },
    },
    links: [
      { href: "https://github.com/Noa-trny/laying_grass_cpp", label: { fr: "Lire le code", en: "Read the code" } },
    ],
    copy: {
      fr: {
        context: "2026, seul",
        stack: "C++17 · console · zéro dépendance",
        lede: "Un jeu de placement de tuiles inspiré de « The Devil's Plan », écrit en C++17 pur : bibliothèque standard uniquement, jusqu'au parseur JSON.",
        metaTitle: "laying_grass — Noa Tournoy",
        metaDescription: "laying_grass : jeu de placement de tuiles en C++17 pur, zéro dépendance — bibliothèque standard uniquement, jusqu'au parseur JSON écrit à la main. 96 formes de tuiles, 2 à 9 joueurs.",
        ogDescription: "Jeu de placement de tuiles en C++17 pur, zéro dépendance. 96 formes, 2 à 9 joueurs, détection du plus grand carré.",
      },
      en: {
        context: "2026, solo",
        stack: "C++17 · console · zero dependencies",
        lede: "A tile-laying game inspired by \"The Devil's Plan\", written in pure C++17: standard library only, right down to the JSON parser.",
        metaTitle: "laying_grass — Noa Tournoy",
        metaDescription: "laying_grass: a tile-laying game in pure C++17 with zero dependencies — standard library only, right down to the hand-written JSON parser. 96 tile shapes, 2 to 9 players.",
        ogDescription: "laying_grass: a tile-laying game in pure C++17 with zero dependencies — standard library only, right down to the hand-written JSON parser. 96 tile shapes, 2 to 9 players.",
      },
    },
  },
  {
    slug: "gamedex",
    no: "_06",
    title: "Gamedex",
    tags: ["React", "TypeScript", "Vite", "Cypress"],
    year: "2026",
    blurb: { fr: "Catalogue de jeux vidéo sur l'API RAWG : recherche, filtres, favoris persistants. TypeScript · React.", en: "A video game catalogue built on the RAWG API: search, filters, persistent favourites. TypeScript · React." },
    vignette: { kind: "mot", mot: { fr: "TypeScript · React", en: "TypeScript · React" } },
    links: [
      { href: "https://github.com/Noa-trny/Gamedex", label: { fr: "Lire le code", en: "Read the code" } },
    ],
    copy: {
      fr: {
        context: "2026, binôme, module 2WEBD",
        stack: "React · TypeScript · Vite · Cypress",
        lede: "Un catalogue de jeux vidéo bâti sur l'API RAWG : recherche, filtres par plateforme et par boutique, tri, défilement infini, fiches détaillées et favoris qui survivent au rechargement.",
        metaTitle: "Gamedex — Noa Tournoy",
        metaDescription: "Gamedex : catalogue de jeux vidéo sur l'API RAWG. React, TypeScript, Vite. Recherche, filtres, tri, défilement infini, favoris persistants, tests Cypress. Projet en binôme.",
        ogDescription: "Catalogue de jeux vidéo sur l'API RAWG : recherche, filtres, favoris persistants. React et TypeScript.",
      },
      en: {
        context: "2026, pair project, 2WEBD module",
        stack: "React · TypeScript · Vite · Cypress",
        lede: "A video game catalogue built on the RAWG API: search, filters by platform and store, sorting, infinite scroll, detail pages, and favourites that survive a reload.",
        metaTitle: "Gamedex — Noa Tournoy",
        metaDescription: "Gamedex: a video game catalogue on the RAWG API. React, TypeScript, Vite. Search, filters, sorting, infinite scroll, persistent favourites, Cypress tests. Built as a pair.",
        ogDescription: "Gamedex: a video game catalogue on the RAWG API. React, TypeScript, Vite. Search, filters, sorting, infinite scroll, persistent favourites, Cypress tests. Built as a pair.",
      },
    },
  },
] as const;

export const bySlug = (slug: Slug): Project => {
  const p = PROJECTS.find((x) => x.slug === slug);
  if (!p) throw new Error(`travail inconnu : ${slug}`);
  return p;
};

/**
 * Le travail precedent et le suivant dans l'ordre canonique.
 *
 * La chaine n'est PAS cyclique — c'etait deja le cas dans l'ancien site, et le
 * rendre cyclique aurait fait disparaitre le lien « Retour · Tous les travaux »
 * qui occupe la place vide aux deux extremites. `null` signifie donc : mets le
 * retour vers l'index ici.
 */
export function neighbours(slug: Slug): {
  prev: Project | null;
  next: Project | null;
} {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  return {
    prev: i > 0 ? PROJECTS[i - 1]! : null,
    next: i < PROJECTS.length - 1 ? PROJECTS[i + 1]! : null,
  };
}

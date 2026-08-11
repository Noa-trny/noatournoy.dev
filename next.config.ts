import type { NextConfig } from "next";

// Ce fichier remplace vercel.json, a une exception pres : la CSP vit dans
// proxy.ts, parce qu'elle porte un nonce different a chaque requete et qu'un
// en-tete statique ne peut pas faire cela.
//
// `cleanUrls` de Vercel disparait avec les fichiers .html : c'est une fonction
// de l'hebergement statique, qui retirait l'extension des fichiers du dossier
// publie. Un projet Next n'a plus de .html a servir, son routage vient du
// manifeste de build.

const config: NextConfig = {
  // Reproduit exactement les URLs servies aujourd'hui : /travaux/eclosion/ avec
  // slash final, et une 308 depuis la forme sans slash.
  trailingSlash: true,
  poweredByHeader: false,
  // Sans cette ancre, Turbopack remonte jusqu'au dossier personnel, y trouve un
  // package-lock.json etranger et le signale a chaque build.
  turbopack: { root: import.meta.dirname },

  // Next 16 depose AGENTS.md et CLAUDE.md a la racine au premier `next dev`.
  // Ce depot ne porte aucune trace d'outillage : la documentation de travail
  // vit a cote, hors du dossier versionne.
  agentRules: false,

  experimental: {
    // app/global-not-found.tsx est indispensable ici : sans layout racine unique
    // — les deux vivent dans les groupes (fr) et (en) — un not-found.tsx n'a
    // aucun layout dans lequel se rendre. Cette convention rend son propre
    // document complet et remplace le layout racine pour la route /_not-found.
    //
    // Le drapeau vaut false par defaut. La page fonctionnait quand meme, parce
    // que le gating vit dans le loader webpack alors que Next 16 construit avec
    // Turbopack, qui prend un autre chemin. Autrement dit : ca marchait par
    // accident. On declare l'intention plutot que de dependre de cet ecart.
    globalNotFound: true,
  },

  async redirects() {
    return [
      // Ces deux redirections etaient MORTES en production : `trailingSlash`
      // normalise /projets en /projets/ avant d'evaluer les regles, et la source
      // "/projets" ne correspondait alors plus a rien. Mesure du 11/08/2026 :
      //   /projets          308 -> /projets/          -> 404
      //   /projets/eclosion 308 -> /projets/eclosion/ -> 404
      // Les deux formes sont donc declarees, pour ne dependre d'aucun ordre
      // d'evaluation.
      { source: "/projets", destination: "/travaux/", permanent: true },
      { source: "/projets/:path*", destination: "/travaux/", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Strict-Transport-Security",
            // Volontairement sans `preload` : l'inscription sur la liste est
            // difficile a defaire.
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
      // Les actifs dont le nom ne change jamais et le contenu non plus.
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/travaux/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Les modeles 3D et l'environnement lumineux, a partir de la phase 7.
      {
        source: "/models/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/hdr/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default config;

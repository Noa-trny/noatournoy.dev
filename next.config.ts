import type { NextConfig } from "next";

// Les en-tetes de securite et les redirections arrivent en phase 2. Ici, seul le
// routage : `trailingSlash` reproduit exactement les URLs servies aujourd'hui
// (/travaux/eclosion/), et `cleanUrls` de Vercel disparait avec les fichiers .html.
const config: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  // Sans cette ancre, Turbopack remonte jusqu'au dossier personnel, y trouve un
  // package-lock.json etranger et le signale a chaque build.
  turbopack: { root: import.meta.dirname },
};

export default config;

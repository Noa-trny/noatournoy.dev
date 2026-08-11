import type { MetadataRoute } from "next";
import { allPages, LOCALES, ORIGIN } from "@/content/routes";

// Remplace le sitemap.xml ecrit a la main. Chaque page apparait une fois par
// langue, et chaque entree porte les trois memes alternates que l'ancien
// fichier : hreflang fr, hreflang en, et x-default vers le francais.
//
// L'ancien fichier ne portait ni lastmod, ni changefreq, ni priority — on n'en
// ajoute pas : une date de modification inventee vaut moins que pas de date, et
// Google ignore changefreq et priority depuis longtemps.

const abs = (path: string) => `${ORIGIN}${path}`;

export default function sitemap(): MetadataRoute.Sitemap {
  return allPages().flatMap(({ pair }) =>
    LOCALES.map((locale) => ({
      url: abs(pair[locale]),
      alternates: {
        languages: {
          fr: abs(pair.fr),
          en: abs(pair.en),
          "x-default": abs(pair.fr),
        },
      },
    }))
  );
}

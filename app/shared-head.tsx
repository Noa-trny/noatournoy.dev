import type { Metadata } from "next";
import { ORIGIN } from "@/content/routes";

// Ce que les deux layouts racine ont en commun. Les icones et le prechargement
// de la fonte sont identiques mot pour mot dans les deux langues : les ecrire
// une fois evite qu'ils divergent, ce qui est exactement ce qui est arrive aux
// deux arbres HTML statiques qu'on remplace.

export const sharedMetadata = {
  metadataBase: new URL(ORIGIN),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  twitter: { card: "summary_large_image" },
} satisfies Metadata;

/**
 * Une seule fonte, prechargee a la main.
 *
 * `next/font` renommerait le fichier avec une empreinte, ce qui invaliderait la
 * regle de cache immuable sur /fonts/ — sans rien apporter : le sous-ensemble
 * latin et `font-display: swap` sont deja en place, et la recette de
 * sous-ensemble est documentee dans le README.
 *
 * `crossOrigin=""` n'est pas cosmetique : si le prechargement et la requete du
 * @font-face ne s'accordent pas sur le mode CORS, la fonte est telechargee deux
 * fois. Verifie en Chrome headless : une seule requete.
 */
export function FontPreload() {
  return (
    <link
      rel="preload"
      href="/fonts/Inter.woff2"
      as="font"
      type="font/woff2"
      crossOrigin=""
    />
  );
}

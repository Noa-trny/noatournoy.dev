import type { Metadata, Viewport } from "next";
import "@/styles/spec.css";

// Layout racine du groupe francais. Il n'existe volontairement PAS de
// `app/layout.tsx` : deux layouts racine (un par langue) sont le seul moyen
// propre de porter deux valeurs de `<html lang>`, et un layout imbrique ne
// peut pas changer cet attribut.

export const metadata: Metadata = {
  metadataBase: new URL("https://noatournoy.dev"),
  title:
    "Noa Tournoy — ingénieur logiciel, développement et cybersécurité",
  description:
    "Noa Tournoy, étudiant ingénieur à Lille, spécialisé en cybersécurité. Développement full-stack en Python, TypeScript et Docker. Alternance chez ADEO à partir d'octobre 2026.",
  alternates: {
    canonical: "/",
    languages: {
      fr: "/",
      en: "/en/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    title:
      "Noa Tournoy — ingénieur logiciel, développement et cybersécurité",
    description:
      "Développement full-stack, données et cybersécurité. Six travaux, du tableau de bord Looker à l'expérience web 3D Éclosion.",
    url: "/",
    locale: "fr_FR",
    images: ["/og.png"],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbfbfc",
};

export default function RootLayoutFr({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Une seule fonte, prechargee a la main. `next/font` renommerait le
            fichier avec une empreinte, ce qui invaliderait la regle de cache
            immuable sur /fonts/ sans rien apporter : le sous-ensemble latin et
            `font-display: swap` sont deja en place. */}
        <link
          rel="preload"
          href="/fonts/RobotoFlex.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

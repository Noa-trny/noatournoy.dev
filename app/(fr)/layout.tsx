import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { alternates, pair } from "@/content/routes";
import { FontPreload, sharedMetadata } from "../shared-head";
import "@/styles/app.css";

// Layout racine du groupe francais. Voir app/(en)/layout.tsx pour le pendant
// anglais et la raison pour laquelle il n'existe pas de app/layout.tsx.

export const metadata: Metadata = {
  ...sharedMetadata,
  title: "Noa Tournoy — ingénieur logiciel, développement et cybersécurité",
  description:
    "Noa Tournoy, étudiant ingénieur à Lille, spécialisé en cybersécurité. Développement full-stack en Python, TypeScript et Docker. Alternance chez ADEO à partir d'octobre 2026.",
  alternates: alternates(pair.home, "fr"),
  openGraph: {
    type: "website",
    title: "Noa Tournoy — ingénieur logiciel, développement et cybersécurité",
    description:
      "Développement full-stack, données et cybersécurité. Six travaux, du tableau de bord Looker à l'expérience web 3D Éclosion.",
    url: pair.home.fr,
    locale: "fr_FR",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbfbfc",
};

// `connection()` fait basculer tout l'arbre en rendu par requete. C'est la
// condition d'existence du nonce de proxy.ts : une page pre-rendue au build n'a
// pas de requete, donc pas de nonce, donc ses <script> inline seraient bloques.
// Le poser ici plutot que dans chaque page evite qu'une page future l'oublie et
// se retrouve silencieusement cassee en production.
export default async function RootLayoutFr({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  return (
    <html lang="fr">
      <head>
        <FontPreload />
      </head>
      <body>
        {children}
        {/* La jauge de defilement. Elle etait injectee dans le <body> par
            kinetic.js, donc INEXISTANTE en mouvement reduit ; dans le balisage
            elle existe toujours, et spec.css la masque sous cette preference. */}
        <div className="progress" aria-hidden="true">
          <i />
        </div>
      </body>
    </html>
  );
}

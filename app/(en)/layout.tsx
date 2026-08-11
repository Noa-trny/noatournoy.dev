import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { alternates, pair } from "@/content/routes";
import { Kinetics } from "@/components/motion/Kinetics";
import { MenuBehaviour } from "@/components/motion/MenuBehaviour";
import { FontPreload, sharedMetadata } from "../shared-head";
import "@/styles/spec.css";

// Layout racine du groupe anglais. Le pendant de app/(fr)/layout.tsx.
//
// Il n'existe volontairement PAS de app/layout.tsx : deux layouts racine sont le
// seul moyen propre de porter deux valeurs de <html lang>, un layout imbrique ne
// pouvant pas changer cet attribut. Consequence assumee : passer de /travaux/ a
// /en/work/ provoque un rechargement complet plutot qu'une transition client.
// C'est deja ce que fait le selecteur de langue aujourd'hui, et c'est ce qui
// garantit que lang et les metadonnees du document sont justes.

export const metadata: Metadata = {
  ...sharedMetadata,
  title: "Noa Tournoy — software engineering, development and cybersecurity",
  description:
    "Noa Tournoy, engineering student in Lille, France, focused on cybersecurity. Full-stack development in Python, TypeScript and Docker. Joining ADEO as an apprentice in October 2026.",
  alternates: alternates(pair.home, "en"),
  openGraph: {
    type: "website",
    title: "Noa Tournoy — software engineering, development and cybersecurity",
    description:
      "Noa Tournoy, engineering student in Lille, France, focused on cybersecurity. Full-stack development in Python, TypeScript and Docker. Joining ADEO as an apprentice in October 2026.",
    url: pair.home.en,
    locale: "en_US",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbfbfc",
};

// Voir app/(fr)/layout.tsx : `connection()` conditionne l'existence du nonce.
export default async function RootLayoutEn({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  return (
    <html lang="en">
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
        <Kinetics />
        <MenuBehaviour />
      </body>
    </html>
  );
}

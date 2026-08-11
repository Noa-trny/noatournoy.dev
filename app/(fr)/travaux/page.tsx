import type { Metadata } from "next";
import { alternates, pair } from "@/content/routes";
import { Footer, Header, MenuDrawer, Skip } from "@/components/chrome/Chrome";
import { WorkRows } from "@/components/WorkRows";

// Portage verbatim de travaux/index.html. L'habillage vient de Chrome, la liste
// numerotee de WorkRows : il ne reste ici que les trois sections de prose et
// leurs bandes claires/sombres, que la page porte elle-meme.

export const metadata: Metadata = {
  title: "Travaux — Noa Tournoy",
  description:
    "Six travaux de Noa Tournoy : Éclosion, DataSentinel, SupKonQuest, Gamedex, laying_grass et Ludoria. Contexte, rôle, décisions techniques et résultats mesurés.",
  alternates: alternates(pair.work, "fr"),
  openGraph: {
    type: "website",
    title: "Travaux — Noa Tournoy",
    description:
      "Six travaux : expérience web 3D, pilotage de sécurité, stratégie temps réel, applications et jeux.",
    url: pair.work.fr,
    locale: "fr_FR",
    images: ["/og.png"],
  },
};

export default function WorkFr() {
  return (
    <>
      <Skip locale="fr" />
      <Header pair={pair.work} locale="fr" />

      <main id="contenu" tabIndex={-1}>
        <section className="sec band-sec light" aria-labelledby="titre">
          <div className="wrap">
            <p className="label">
              <span>travaux</span>
              <span>six travaux</span>
              <span>2022 → 2026</span>
            </p>
            <h1 className="fiche-title" id="titre">
              Travaux
            </h1>
            <p className="hero-sub">
              Six pièces, du shader au tableau de bord. Chacune dit ce
              qu&apos;elle est, ce que j&apos;y ai fait exactement, et ce qui a
              été mesuré quand il y avait quelque chose à mesurer.
            </p>
          </div>
        </section>

        <section className="sec band-sec dark" aria-labelledby="index">
          <div className="wrap">
            <h2 className="sr-only" id="index">
              Index des travaux
            </h2>

            <WorkRows locale="fr" variant="blurb" />
          </div>
        </section>

        <section className="sec band-sec light" aria-labelledby="reste">
          <div className="wrap">
            <h2 className="sec-title" id="reste">
              Le reste est sur GitHub.
            </h2>
            <div className="prose">
              <p>
                Jeux en C, applications PHP, exercices de rendu, travaux
                d&apos;école : tout ce qui n&apos;a pas sa planche ici reste
                public et lisible sur{" "}
                <a href="https://github.com/Noa-trny">github.com/Noa-trny</a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <MenuDrawer locale="fr" />
      <Footer locale="fr" />
    </>
  );
}

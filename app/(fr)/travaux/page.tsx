import type { Metadata } from "next";
import { alternates, pair } from "@/content/routes";
import { Footer, Header, Skip } from "@/components/chrome/Chrome";
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
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-14 sm:px-8" aria-labelledby="titre">
          <div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-[0.14em] text-dim uppercase">
              <span>travaux</span>
              <span>six travaux</span>
              <span>2022 → 2026</span>
            </p>
            <h1 className="mt-5 text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.05] font-semibold" id="titre">
              Travaux
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-mid">
              Six pièces, du shader au tableau de bord. Chacune dit ce
              qu&apos;elle est, ce que j&apos;y ai fait exactement, et ce qui a
              été mesuré quand il y avait quelque chose à mesurer.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl border-t border-line px-6 py-14 sm:px-8" aria-labelledby="index">
          <div>
            <h2 className="sr-only" id="index">
              Index des travaux
            </h2>

            <WorkRows locale="fr" variant="blurb" />
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pt-20 pb-14 sm:px-8" aria-labelledby="reste">
          <div>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold" id="reste">
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
      <Footer locale="fr" />
    </>
  );
}

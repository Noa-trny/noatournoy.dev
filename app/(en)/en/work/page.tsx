import type { Metadata } from "next";
import { alternates, pair } from "@/content/routes";
import { Footer, Header, MenuDrawer, Skip } from "@/components/chrome/Chrome";
import { WorkRows } from "@/components/WorkRows";

// Portage verbatim de en/work/index.html. Pendant anglais de app/(fr)/travaux :
// l'habillage vient de Chrome, la liste numerotee de WorkRows, et la page ne
// garde que ses trois sections et leurs bandes.

export const metadata: Metadata = {
  title: "Work — Noa Tournoy",
  description:
    "Six works by Noa Tournoy: Éclosion, DataSentinel, SupKonQuest, Gamedex, laying_grass and Ludoria. Context, role, technical decisions and measured results.",
  alternates: alternates(pair.work, "en"),
  openGraph: {
    type: "website",
    title: "Work — Noa Tournoy",
    description:
      "Six works by Noa Tournoy: Éclosion, DataSentinel, SupKonQuest, Gamedex, laying_grass and Ludoria. Context, role, technical decisions and measured results.",
    url: pair.work.en,
    locale: "en_US",
    images: ["/og.png"],
  },
};

export default function WorkEn() {
  return (
    <>
      <Skip locale="en" />
      <Header pair={pair.work} locale="en" />

      <main id="contenu" tabIndex={-1}>
        <section className="sec band-sec light" aria-labelledby="titre">
          <div className="wrap">
            <p className="label">
              <span>work</span>
              <span>six pieces</span>
              <span>2022 → 2026</span>
            </p>
            <h1 className="fiche-title" id="titre">
              Work
            </h1>
            <p className="hero-sub">
              Six pieces, from shader to dashboard. Each one says what it is,
              exactly what I did on it, and what was measured when there was
              something to measure.
            </p>
          </div>
        </section>

        <section className="sec band-sec dark" aria-labelledby="index">
          <div className="wrap">
            <h2 className="sr-only" id="index">
              Index of work
            </h2>

            <WorkRows locale="en" variant="blurb" />
          </div>
        </section>

        <section className="sec band-sec light" aria-labelledby="reste">
          <div className="wrap">
            <h2 className="sec-title" id="reste">
              The rest lives on GitHub.
            </h2>
            <div className="prose">
              <p>
                Games in C, PHP applications, rendering exercises, coursework:
                everything without its own plate here stays public and readable
                at <a href="https://github.com/Noa-trny">github.com/Noa-trny</a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <MenuDrawer locale="en" />
      <Footer locale="en" />
    </>
  );
}

import type { Metadata } from "next";
import { alternates, pair } from "@/content/routes";
import { Footer, Header, Skip } from "@/components/chrome/Chrome";
import { WorkRows } from "@/components/WorkRows";

// Portage verbatim de en/work/index.html. Pendant anglais de app/(fr)/travaux :
// l'habillage vient de Chrome, la liste numerotee de WorkRows, et la page ne
// garde que ses trois sections et leurs bandes.

export const metadata: Metadata = {
  title: "Work · Noa Tournoy",
  description:
    "Six works by Noa Tournoy: Éclosion, DataSentinel, SupKonQuest, Gamedex, laying_grass and Ludoria. Context, role, technical decisions and measured results.",
  alternates: alternates(pair.work, "en"),
  openGraph: {
    type: "website",
    title: "Work · Noa Tournoy",
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
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-14 sm:px-8" aria-labelledby="titre">
          <div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-[0.14em] text-dim uppercase">
              <span>work</span>
              <span>six pieces</span>
              <span>2022 → 2026</span>
            </p>
            <h1 className="mt-5 text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.05] font-semibold" id="titre">
              Work
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-mid">
              Six pieces, from shader to dashboard. Each one says what it is,
              exactly what I did on it, and what was measured when there was
              something to measure.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl border-t border-line px-6 py-14 sm:px-8" aria-labelledby="index">
          <div>
            <h2 className="sr-only" id="index">
              Index of work
            </h2>

            <WorkRows locale="en" variant="blurb" />
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pt-20 pb-14 sm:px-8" aria-labelledby="reste">
          <div>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold" id="reste">
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
      <Footer locale="en" />
    </>
  );
}

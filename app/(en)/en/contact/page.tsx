import type { Metadata } from "next";
import { alternates, pair } from "@/content/routes";
import { Footer, Header, MenuDrawer, Skip } from "@/components/chrome/Chrome";

export const metadata: Metadata = {
  title: "Contact — Noa Tournoy",
  description:
    "Write to Noa Tournoy: noa.tournoy@supinfo.com. LinkedIn and GitHub. Based in Lille, France; joining ADEO as a cybersecurity apprentice in October 2026.",
  alternates: alternates(pair.contact, "en"),
  openGraph: {
    type: "website",
    title: "Contact — Noa Tournoy",
    description:
      "Write to Noa Tournoy: noa.tournoy@supinfo.com. LinkedIn and GitHub. Based in Lille, France; joining ADEO as a cybersecurity apprentice in October 2026.",
    url: pair.contact.en,
    locale: "en_US",
    images: ["/og.png"],
  },
};

export default function ContactEn() {
  return (
    <>
      <Skip locale="en" />
      <Header pair={pair.contact} locale="en" />
      <main id="contenu" tabIndex={-1}>
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-14 sm:px-8" aria-labelledby="titre">
          <div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-[0.14em] text-dim uppercase">
              <span>contact</span>
              <span>Lille, France</span>
            </p>
            <h1 className="sr-only" id="titre">
              Contact
            </h1>

            <a className="lueur inline-block text-[clamp(1.5rem,4.2vw,2.6rem)] font-medium tracking-[-0.02em] text-fg underline decoration-line underline-offset-8 transition-colors hover:decoration-accent-soft hover:text-accent-soft" href="mailto:noa.tournoy@supinfo.com">
              noa.tournoy@supinfo.com
            </a>

            <ul className="mt-8 flex flex-wrap gap-2">
              <li>
                <a className="lueur rounded-full border border-line px-4 py-2 text-sm text-mid transition-colors hover:border-accent/60 hover:text-fg" href="https://www.linkedin.com/in/noa-tournoy/">LinkedIn</a>
              </li>
              <li>
                <a className="lueur rounded-full border border-line px-4 py-2 text-sm text-mid transition-colors hover:border-accent/60 hover:text-fg" href="https://github.com/Noa-trny">GitHub</a>
              </li>
              <li>
                <a className="lueur rounded-full border border-line px-4 py-2 text-sm text-mid transition-colors hover:border-accent/60 hover:text-fg" href="https://eclosion.noatournoy.dev">Éclosion</a>
              </li>
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-4xl border-t border-line px-6 py-14 sm:px-8" aria-labelledby="quoi">
          <div>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold" id="quoi">
              What's worth <em>a message</em>.
            </h2>
            <div className="prose">
              <p>
                From 1 October 2026 I am a cybersecurity apprentice at ADEO,
                alongside the engineering programme at SUPINFO. Write for a
                technical question, a proposal to work together, or simply
                because one of the pieces stopped you. I answer.
              </p>
              <p>Email is the surest channel. LinkedIn works too.</p>
            </div>
          </div>
        </section>
      </main>
      <MenuDrawer locale="en" />
      <Footer locale="en" />
    </>
  );
}

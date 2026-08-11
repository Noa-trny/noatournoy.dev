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
        <section className="sec band-sec light" aria-labelledby="titre">
          <div className="wrap">
            <p className="label">
              <span>contact</span>
              <span>Lille, France</span>
            </p>
            <h1 className="sr-only" id="titre">
              Contact
            </h1>

            <a className="contact-line" href="mailto:noa.tournoy@supinfo.com">
              noa.tournoy@supinfo.com
            </a>

            <ul className="elsewhere">
              <li>
                <a href="https://www.linkedin.com/in/noa-tournoy/">LinkedIn</a>
              </li>
              <li>
                <a href="https://github.com/Noa-trny">GitHub</a>
              </li>
              <li>
                <a href="https://eclosion.noatournoy.dev">Éclosion</a>
              </li>
            </ul>
          </div>
        </section>

        <section className="sec band-sec dark" aria-labelledby="quoi">
          <div className="wrap">
            <h2 className="sec-title" id="quoi">
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

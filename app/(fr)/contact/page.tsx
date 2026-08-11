import type { Metadata } from "next";
import { alternates, pair } from "@/content/routes";
import { Footer, Header, MenuDrawer, Skip } from "@/components/chrome/Chrome";

export const metadata: Metadata = {
  title: "Contact — Noa Tournoy",
  description:
    "Écrire à Noa Tournoy : noa.tournoy@supinfo.com. LinkedIn et GitHub. Basé à Lille, alternant en cybersécurité chez ADEO à partir d'octobre 2026.",
  alternates: alternates(pair.contact, "fr"),
  openGraph: {
    type: "website",
    title: "Contact — Noa Tournoy",
    description:
      "Écrire à Noa Tournoy. Basé à Lille, alternant en cybersécurité chez ADEO à partir d'octobre 2026.",
    url: pair.contact.fr,
    locale: "fr_FR",
    images: ["/og.png"],
  },
};

export default function ContactFr() {
  return (
    <>
      <Skip locale="fr" />
      <Header pair={pair.contact} locale="fr" />
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
              Ce qui vaut <em>le message</em>.
            </h2>
            <div className="prose">
              <p>
                À partir du 1<sup>er</sup> octobre 2026, je suis alternant en
                cybersécurité chez ADEO, en parallèle du cycle ingénieur à
                SUPINFO. Écrivez pour une question technique, une proposition de
                collaboration, ou simplement parce qu'un des travaux vous a
                arrêté — je réponds.
              </p>
              <p>L'e-mail est le canal le plus sûr. LinkedIn marche aussi.</p>
            </div>
          </div>
        </section>
      </main>
      <MenuDrawer locale="fr" />
      <Footer locale="fr" />
    </>
  );
}

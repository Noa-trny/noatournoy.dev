import type { Metadata, Viewport } from "next";
import { FontPreload } from "./shared-head";
import "@/styles/app.css";

// `global-not-found.tsx` et non `not-found.tsx` : il n'existe pas de
// app/layout.tsx dans lequel rendre une page d'erreur, puisque les deux layouts
// racine vivent dans les groupes (fr) et (en). Cette convention rend donc son
// propre document complet, <html> compris.
//
// Elle est en francais parce qu'une URL inconnue n'a pas de langue : le
// francais est la langue par defaut du site (x-default pointe dessus), et un
// lien vers la version anglaise est offert dans le corps.

export const metadata: Metadata = {
  title: "Page introuvable — Noa Tournoy",
  // Pas de `robots` ici : Next pose deja <meta name="robots" content="noindex">
  // sur la route not-found. En declarer un second n'ajoutait rien et servait la
  // balise en double.
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbfbfc",
};

export default function GlobalNotFound() {
  return (
    <html lang="fr">
      <head>
        <FontPreload />
      </head>
      <body>
        <a className="skip" href="#contenu">
          Aller au contenu
        </a>

        <div className="head-band">
          <header className="tophead wrap">
            <a className="mark" href="/">
              Portfolio
            </a>
          </header>
        </div>

        <main id="contenu" tabIndex={-1}>
          <section className="sec band-sec light" aria-labelledby="titre">
            <div className="wrap">
              <p className="label">
                <span>Erreur 404</span>
              </p>
              <h1 className="fiche-title" id="titre">
                Page
                <br />
                introuvable
              </h1>
              <p className="hero-sub" lang="en">
                This page does not exist.
              </p>
              <ul className="fiche-links">
                <li>
                  <a href="/">Retour à l&apos;accueil</a>
                </li>
                <li>
                  <a href="/travaux/">Voir les travaux</a>
                </li>
                <li>
                  <a href="/en/" lang="en" hrefLang="en">
                    English version
                  </a>
                </li>
              </ul>
            </div>
          </section>
        </main>

        <footer className="foot dark">
          <div className="wrap foot-in">
            <span>Noa Tournoy — Lille, France</span>
            <span>
              <a href="https://eclosion.noatournoy.dev">Éclosion</a> ·{" "}
              <a href="/travaux/">Travaux</a> ·{" "}
              <a href="/contact/">Contact</a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}

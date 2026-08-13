import { connection } from "next/server";
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

// `connection()` COMME DANS LES DEUX LAYOUTS, et pour la meme raison — mais
// elle manquait ici, ce qui rendait cette page la seule du site a violer sa
// propre CSP.
//
// Le nonce est tire a chaque requete par le proxy. Une page PRERENDUE au build
// n'a pas de requete au moment de son rendu : Next ne pouvait donc poser aucun
// nonce sur ses deux <script> d'amorçage, que le navigateur bloquait ensuite.
// Mesure sur le HTML servi : deux scripts en ligne nonces sur l'accueil, zero
// sur la 404. La page s'affichait quand meme — elle est statique — mais sans
// JavaScript, donc sans navigation cote client, et en jetant une erreur de
// securite dans la console de chaque visiteur qui se trompe d'adresse.
export default async function GlobalNotFound() {
  await connection();
  return (
    <html lang="fr">
      <head>
        <FontPreload />
      </head>
      {/* CETTE PAGE PORTAIT ENCORE LE BALISAGE DE L'ANCIEN SITE. Onze classes —
          `wrap`, `tophead`, `fiche-title`, `foot-in`… — venaient de spec.css et
          ne designaient plus rien depuis la refonte sombre. Elle s'affichait
          quand meme, parce que les styles de base portent une page de texte,
          mais elle n'avait aucune mise en page a elle : ni gouttiere, ni
          rythme, ni hierarchie. Reecrite dans la grammaire du reste du site
          plutot que dotee de onze utilitaires pour une seule page. */}
      <body className="flex min-h-screen flex-col">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-sm focus:text-bg"
        >
          Aller au contenu
        </a>

        <header className="border-b border-line">
          <div className="mx-auto w-full max-w-6xl px-6 py-4 sm:px-8">
            <a href="/" className="text-sm font-medium text-fg">
              Noa&nbsp;Tournoy
            </a>
          </div>
        </header>

        <main id="contenu" tabIndex={-1} className="flex-1">
          <section
            aria-labelledby="titre"
            className="mx-auto w-full max-w-3xl px-6 pt-24 pb-20 sm:px-8"
          >
            <p className="text-xs tracking-[0.14em] text-dim uppercase">Erreur 404</p>

            <h1
              id="titre"
              className="mt-5 text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.05] font-semibold"
            >
              Page introuvable
            </h1>

            <p className="mt-6 text-lg text-mid" lang="en">
              This page does not exist.
            </p>

            {/* Trois sorties plutot qu'un seul retour : quelqu'un qui arrive ici
                s'est trompe d'adresse, il ne sait pas forcement laquelle il
                voulait. */}
            <ul className="mt-10 flex flex-wrap gap-2">
              {[
                { href: "/", texte: "Retour à l’accueil" },
                { href: "/travaux/", texte: "Voir les travaux" },
                { href: "/en/", texte: "English version", lang: "en" },
              ].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    {...(l.lang ? { lang: l.lang, hrefLang: l.lang } : {})}
                    className="lueur inline-block rounded-full border border-line px-4 py-2 text-sm text-mid transition-colors hover:border-accent/60 hover:text-fg"
                  >
                    {l.texte}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </main>

        <footer className="border-t border-line">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-10 text-sm text-dim sm:px-8">
            <span>Noa Tournoy — Lille, France</span>
            <span className="flex flex-wrap gap-5">
              <a href="https://eclosion.noatournoy.dev" className="hover:text-fg">
                Éclosion
              </a>
              <a href="/travaux/" className="hover:text-fg">
                Travaux
              </a>
              <a href="/contact/" className="hover:text-fg">
                Contact
              </a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}

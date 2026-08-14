import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Locale, Pair } from "@/content/routes";
import { routes } from "@/content/routes";
import { ui } from "@/content/ui";

// L'HABILLAGE DES PAGES INTERIEURES.
//
// Reecrit pour le theme sombre. L'ancienne version dependait de `spec.css` —
// 1393 lignes de bandes alternees et de vert acide — retiree des layouts avec la
// refonte : les onze pages autres que l'accueil s'affichaient donc nues.
//
// LE TIROIR DE MENU A DISPARU, et cette fois entierement. Il existait parce que
// l'ancien site avait cinq sections d'accueil a atteindre depuis n'importe ou.
// Quatre destinations tiennent dans une barre ; un tiroir pour quatre liens,
// c'est un clic de plus pour rien.
//
// `MenuDrawer` a survecu un temps comme coquille vide « le temps que les pages
// cessent de l'appeler ». Elles ne l'ont jamais fait, et le module de
// comportement qui l'ouvrait est reste monte sur toutes les pages — quatre-
// vingt-huit lignes a l'ecoute d'un `#menu` qu'aucune page ne rendait. Une
// compatibilite provisoire qu'on ne retire pas devient une dette qu'on paie a
// chaque chargement.

export function Skip({ locale }: { locale: Locale }) {
  return (
    <a
      href="#contenu"
      // Le lien d'evitement : hors de vue tant qu'il n'a pas le focus, jamais
      // `display: none` — qui le sortirait de l'ordre de tabulation, donc le
      // rendrait inatteignable par le seul public a qui il sert.
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-sm focus:text-bg"
    >
      {ui.skip[locale]}
    </a>
  );
}

function LangSwitch({ pair, locale }: { pair: Pair; locale: Locale }) {
  return (
    <nav aria-label={ui.langGroup[locale]} className="flex items-center gap-1 text-xs">
      {(["fr", "en"] as const).map((l) => (
        <Link
          key={l}
          href={pair[l]}
          hrefLang={l}
          {...(locale === l ? { "aria-current": "true" as const } : {})}
          className={`rounded px-2 py-1 uppercase transition-colors ${
            locale === l ? "text-fg" : "text-dim hover:text-mid"
          }`}
        >
          {l}
        </Link>
      ))}
    </nav>
  );
}

export function Header({ pair, locale }: { pair: Pair; locale: Locale }) {
  // TROIS DESTINATIONS, ET TROIS SEULEMENT. La liste en comptait quatre dont la
  // premiere etait jetee par un `.slice(1)` a l'affichage : elle dupliquait la
  // route de l'accueil, deja portee par la signature juste en dessous. Les deux
  // dernieres etaient ecrites en dur — dont un `locale === "fr" ? "Contact" :
  // "Contact"`, deux branches identiques — alors que `content/ui.ts` porte
  // exactement ces libelles dans les deux langues.
  const liens = [
    { href: routes.work[locale], nom: ui.navWork[locale] },
    { href: routes.skills[locale], nom: ui.navSkills[locale] },
    { href: routes.contact[locale], nom: ui.navContact[locale] },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4 sm:px-8">
        {/* LE RETOUR AU BUREAU, EN PREMIER ET AVEC UNE FLECHE.
        
            Depuis une fiche projet, le seul chemin vers l'accueil etait la
            signature, un mot en gras qu'on ne lit pas comme un bouton. Or on
            arrive sur ces pages EN CLIQUANT une ligne de l'ecran du bureau : on
            y vient d'un endroit, et l'on veut y retourner. La fleche dit ce que
            le mot seul ne disait pas.
        
            Il est le premier element de la barre, avant meme la signature :
            c'est la place qu'occupe un retour dans toute interface, et celle ou
            le pouce le cherche sur telephone. */}
        <Link
          href={routes.home[locale]}
          className="lueur group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-mid hover:border-accent/60 hover:text-fg tactile:min-h-11 tactile:px-4"
        >
          <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          {ui.navHome[locale]}
        </Link>
        <Link
          href={routes.home[locale]}
          className="hidden text-sm font-medium text-fg sm:block"
        >
          Noa&nbsp;Tournoy
        </Link>
        <nav className="flex flex-1 flex-wrap gap-4 text-sm">
          {liens.map((l) => (
            <Link key={l.href} href={l.href} className="text-mid transition-colors hover:text-fg">
              {l.nom}
            </Link>
          ))}
        </nav>
        <LangSwitch pair={pair} locale={locale} />
      </div>
    </header>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-10 text-sm text-dim sm:px-8">
        <p>{ui.footPlace[locale]}</p>
        <ul className="flex flex-wrap gap-5">
          <li>
            <a href="mailto:noa.tournoy@supinfo.com" className="transition-colors hover:text-fg">
              noa.tournoy@supinfo.com
            </a>
          </li>
          <li>
            <a href="https://github.com/Noa-trny" className="transition-colors hover:text-fg">
              GitHub
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/noa-tournoy/"
              className="transition-colors hover:text-fg"
            >
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

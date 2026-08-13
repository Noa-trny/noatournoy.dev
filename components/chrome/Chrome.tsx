import Link from "next/link";
import type { Locale, Pair } from "@/content/routes";
import { routes } from "@/content/routes";
import { ui } from "@/content/ui";

// L'HABILLAGE DES PAGES INTERIEURES.
//
// Reecrit pour le theme sombre. L'ancienne version dependait de `spec.css` —
// 1393 lignes de bandes alternees et de vert acide — retiree des layouts avec la
// refonte : les onze pages autres que l'accueil s'affichaient donc nues.
//
// LE TIROIR DE MENU A DISPARU. Il existait parce que l'ancien site avait cinq
// sections d'accueil a atteindre depuis n'importe ou, et il tirait un module de
// comportement en GSAP pour s'ouvrir. Quatre destinations tiennent dans une
// barre ; un tiroir pour quatre liens, c'est un clic de plus pour rien.
// `MenuDrawer` reste exporte et ne rend rien, le temps que les pages cessent de
// l'appeler — le retirer d'un coup casserait six fichiers pour aucun gain.

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

export function LangSwitch({ pair, locale }: { pair: Pair; locale: Locale }) {
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
  const liens = [
    { href: routes.home[locale], nom: ui.mark[locale] },
    { href: routes.work[locale], nom: ui.worksNav[locale] },
    { href: routes.skills[locale], nom: locale === "fr" ? "Savoir-faire" : "Skills" },
    { href: routes.contact[locale], nom: locale === "fr" ? "Contact" : "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4 sm:px-8">
        <Link href={routes.home[locale]} className="text-sm font-medium text-fg">
          Noa&nbsp;Tournoy
        </Link>
        <nav className="flex flex-1 flex-wrap gap-4 text-sm">
          {liens.slice(1).map((l) => (
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

/** Conserve pour ne pas casser les six pages qui l'appellent encore. */
export function MenuDrawer(_: { locale: Locale; variant?: string }) {
  return null;
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

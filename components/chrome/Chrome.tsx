import type { Locale, Pair } from "@/content/routes";
import { routes } from "@/content/routes";
import { ui } from "@/content/ui";

// L'habillage partage : lien d'evitement, entete, tiroir de menu, pied de page.
// Il etait recopie dans 21 fichiers HTML ; il vit desormais ici, une fois.
//
// Aucun de ces composants n'est client : ils ne font que produire du balisage.
// Le comportement du menu (Echap, retour du focus, aria-expanded) revient en
// phase 4, avec le reste du mouvement.

export function Skip({ locale }: { locale: Locale }) {
  return (
    <a className="skip" href="#contenu">
      {ui.skip[locale]}
    </a>
  );
}

/**
 * Le selecteur de langue.
 *
 * `pair` porte les DEUX URLs de la page courante, si bien que le lien mene a la
 * traduction de cette page-la et non a l'accueil. C'etait ecrit a la main sur
 * chaque page ; le deriver supprime toute une classe de liens faux.
 */
export function LangSwitch({
  pair,
  locale,
}: {
  pair: Pair;
  locale: Locale;
}) {
  return (
    <div className="lang" role="group" aria-label={ui.langGroup[locale]}>
      <a
        href={pair.fr}
        lang="fr"
        hrefLang="fr"
        {...(locale === "fr" ? { "aria-current": "true" as const } : {})}
      >
        FR
      </a>
      <a
        href={pair.en}
        lang="en"
        hrefLang="en"
        {...(locale === "en" ? { "aria-current": "true" as const } : {})}
      >
        EN
      </a>
    </div>
  );
}

/**
 * L'entete.
 *
 * `band` distingue les deux formes du site : l'accueil pose son entete DANS la
 * section hero, les pages interieures l'enveloppent dans `.head-band`. La
 * difference existait deja dans l'ancien HTML.
 */
export function Header({
  pair,
  locale,
  band = true,
}: {
  pair: Pair;
  locale: Locale;
  band?: boolean;
}) {
  const head = (
    <header className="tophead wrap">
      <a className="mark" href={routes.home[locale]}>
        {ui.mark[locale]}
      </a>
      <div className="tophead-right">
        <LangSwitch pair={pair} locale={locale} />
        <button
          className="menu-btn"
          type="button"
          aria-expanded="false"
          aria-controls="menu"
        >
          {ui.menuOpen[locale]}
        </button>
      </div>
    </header>
  );
  return band ? <div className="head-band">{head}</div> : head;
}

/**
 * Le tiroir de menu, en deux variantes qui existaient deja dans l'ancien site :
 *
 * - `pages` sur les pages interieures : quatre destinations du site ;
 * - `sections` sur l'accueil : cinq ancres vers ses propres sections.
 *
 * Les confondre faisait disparaitre Parcours, Stack et Certifications de la
 * navigation de l'accueil — c'est ce que la comparaison de texte a attrape.
 */
export function MenuDrawer({
  locale,
  variant = "pages",
}: {
  locale: Locale;
  variant?: "pages" | "sections";
}) {
  return (
    <div className="menu" id="menu" hidden>
      <button className="menu-close" type="button">
        {ui.menuClose[locale]}
      </button>
      <div className="menu-panel">
        <nav aria-label={ui.menuNav[locale]}>
          {variant === "sections" ? (
            <>
              <a href="#travaux">{ui.anchorWork[locale]}</a>
              <a href="#parcours">{ui.anchorPath[locale]}</a>
              <a href="#stack">{ui.anchorStack[locale]}</a>
              <a href="#certifications">{ui.anchorCerts[locale]}</a>
              <a href="#contact">{ui.anchorContact[locale]}</a>
            </>
          ) : (
            <>
              <a href={routes.work[locale]}>{ui.navWork[locale]}</a>
              <a href={routes.skills[locale]}>{ui.navSkills[locale]}</a>
              <a href={routes.contact[locale]}>{ui.navContact[locale]}</a>
              <a href={routes.home[locale]}>{ui.navHome[locale]}</a>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="foot dark">
      <div className="wrap foot-in">
        <span>{ui.footPlace[locale]}</span>
        <span>
          <a href="https://eclosion.noatournoy.dev">Éclosion</a> ·{" "}
          <a href={routes.work[locale]}>{ui.footWork[locale]}</a> ·{" "}
          <a href={routes.contact[locale]}>{ui.footContact[locale]}</a>
        </span>
      </div>
    </footer>
  );
}

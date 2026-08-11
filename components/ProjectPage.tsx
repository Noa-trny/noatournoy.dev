import type { ReactNode } from "react";
import type { Locale, Slug } from "@/content/routes";
import { pair, routes } from "@/content/routes";
import { bySlug, neighbours } from "@/content/projects";
import { ui } from "@/content/ui";
import { Footer, Header, MenuDrawer, Skip } from "./chrome/Chrome";
import { Split } from "./motion/Split";

/**
 * Une section de corps d'une fiche.
 *
 * Le fichier de prose ne declare PAS sa bande claire ou sombre : c'est le
 * gabarit qui alterne. Les six fiches alternaient deja strictement, mais chacune
 * l'ecrivait a la main — donc rien n'empechait une septieme de se tromper.
 */
export type Section = {
  readonly id: string;
  readonly title: ReactNode;
  /** Vrai quand le titre n'existe que pour les lecteurs d'ecran. */
  readonly srOnly?: boolean;
  readonly body: ReactNode;
};

const band = (i: number) => (i % 2 === 0 ? "light" : "dark");

export function ProjectPage({
  slug,
  locale,
  sections,
}: {
  slug: Slug;
  locale: Locale;
  sections: readonly Section[];
}) {
  const p = bySlug(slug);
  const c = p.copy[locale];
  const { prev, next } = neighbours(slug);
  const self = pair.project(slug);

  // L'entete est a l'indice 0 et vaut clair ; les sections suivent. La
  // navigation de fin herite donc de la parite du nombre de sections.
  const suiteIndex = 1 + sections.length;

  return (
    <>
      <Skip locale={locale} />
      <Header pair={self} locale={locale} />

      <main id="contenu" tabIndex={-1}>
        <section className="sec band-sec light" aria-labelledby="titre">
          <div className="wrap">
            <p className="label">
              {/* Le premier jeton est vide dans l'ancien balisage : il reserve
                  la place du filet decoratif que dessine spec.css. */}
              <span />
              <span>{c.context}</span>
              <span>{c.stack}</span>
            </p>
            <h1 className="fiche-title" id="titre">
              {p.title}
            </h1>
            <p className="hero-sub">{c.lede}</p>
            {p.links.length > 0 ? (
              <ul className="fiche-links">
                {p.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href}>{l.label[locale]}</a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        {sections.map((s, i) => (
          <section
            key={s.id}
            className={`sec band-sec ${band(i + 1)}`}
            aria-labelledby={s.id}
          >
            <div className="wrap">
              <h2
                className={s.srOnly ? "sr-only" : "sec-title"}
                id={s.id}
              >
                {/* Les titres masques n'ont pas besoin de masques de mots. */}
                {s.srOnly ? s.title : <Split>{s.title}</Split>}
              </h2>
              {s.body}
            </div>
          </section>
        ))}

        <section
          className={`sec band-sec ${band(suiteIndex)}`}
          aria-labelledby="suite"
        >
          <div className="wrap">
            <h2 className="sr-only" id="suite">
              {ui.suite[locale]}
            </h2>
            {/* L'arbre anglais portait aria-label="Travaux" ici : du francais
                dans une page lang="en". Corrige via ui.worksNav.

                La chaine n'est pas cyclique : aux deux extremites, la place
                vide est occupee par un retour vers l'index. */}
            <nav className="next" aria-label={ui.worksNav[locale]}>
              {prev ? (
                <a href={routes.project[locale](prev.slug)}>
                  <span className="dir">{ui.prevWork[locale]}</span>
                  {prev.title}
                </a>
              ) : (
                <a href={routes.work[locale]}>
                  <span className="dir">{ui.back[locale]}</span>
                  {ui.allWork[locale]}
                </a>
              )}
              {next ? (
                <a href={routes.project[locale](next.slug)}>
                  <span className="dir">{ui.nextWork[locale]}</span>
                  {next.title}
                </a>
              ) : (
                <a href={routes.work[locale]}>
                  <span className="dir">{ui.back[locale]}</span>
                  {ui.allWork[locale]}
                </a>
              )}
            </nav>
          </div>
        </section>
      </main>

      <MenuDrawer locale={locale} />
      <Footer locale={locale} />
    </>
  );
}

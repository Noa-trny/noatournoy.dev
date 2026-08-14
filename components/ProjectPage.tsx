import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { Locale, Slug } from "@/content/routes";
import { pair, routes } from "@/content/routes";
import { bySlug, neighbours } from "@/content/projects";
import { ui } from "@/content/ui";
import { Footer, Header, Skip } from "./chrome/Chrome";

// LA FICHE PROJET, en theme sombre.
//
// C'est la page ou atterrit quelqu'un qui clique une ligne sur l'ecran du
// bureau : elle doit tenir le meme registre que le monde d'ou il vient, sinon
// le clic donne l'impression d'avoir quitte le site.
//
// L'ALTERNANCE DE BANDES A DISPARU. Elle etait la structure de l'ancien site —
// clair, sombre, clair — et elle portait tout son rythme. Sur un fond unique,
// alterner n'a plus de sens : ce sont les respirations verticales et les filets
// qui separent, et ils le font sans repeindre la page une section sur deux.

export type Section = {
  readonly id: string;
  readonly title: ReactNode;
  /** Vrai quand le titre n'existe que pour les lecteurs d'ecran. */
  readonly srOnly?: boolean;
  readonly body: ReactNode;
};

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

  return (
    <>
      <Skip locale={locale} />
      <Header pair={self} locale={locale} />

      <main id="contenu" tabIndex={-1}>
        <section
          className="mx-auto max-w-3xl px-6 pt-20 pb-14 sm:px-8"
          aria-labelledby="titre"
        >
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-[0.14em] text-dim uppercase">
            <span>{c.context}</span>
            <span aria-hidden="true" className="text-line">
              ·
            </span>
            <span>{c.stack}</span>
          </p>

          <h1
            id="titre"
            className="mt-5 text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.05] font-semibold"
          >
            {p.title}
          </h1>

          <p className="mt-6 text-lg text-mid">{c.lede}</p>

          <ul className="mt-6 flex flex-wrap gap-1.5">
            {p.tags.map((t) => (
              <li
                key={t}
                className="rounded border border-line px-2 py-0.5 text-xs text-dim"
              >
                {t}
              </li>
            ))}
          </ul>

          {p.links.length > 0 ? (
            <ul className="mt-8 flex flex-wrap gap-3">
              {p.links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="lueur group inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm text-mid hover:border-accent/60 hover:text-fg"
                  >
                    {l.label[locale]}
                    <ArrowUpRight className="size-3.5 text-dim transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {sections.map((s, i) => (
          <section
            key={s.id}
            className="mx-auto max-w-3xl border-t border-line px-6 py-14 sm:px-8"
            aria-labelledby={s.id}
          >
            {/* UN NUMERO DEVANT CHAQUE TITRE, et il dit quelque chose de vrai :
                une fiche se lit dans l'ordre, du contexte au resultat. C'est la
                condition que le reste du site s'impose deja — les travaux sont
                numerotes parce qu'ils forment une suite, la frise parce qu'elle
                est chronologique. Un numero pose sur des sections
                interchangeables ne serait qu'un ornement.

                Il est masque aux lecteurs d'ecran : il ordonne l'oeil, il
                n'ajoute rien a l'ecoute. */}
            {s.srOnly ? null : (
              <p aria-hidden="true" className="mb-3 text-xs text-dim tabular-nums">
                {`_0${i + 1}.`}
              </p>
            )}
            <h2
              id={s.id}
              className={
                s.srOnly ? "sr-only" : "text-[clamp(1.5rem,3vw,2rem)] font-semibold"
              }
            >
              {s.title}
            </h2>
            {/* La prose des fiches est du HTML libre : elle recoit donc ses
                styles ici, par le selecteur d'enfants, plutot que d'imposer une
                classe a douze fichiers de contenu. */}
            <div className="mt-6 flex flex-col gap-5 text-mid [&_a]:text-accent-soft [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:border [&_code]:border-line [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.875em] [&_h3]:mt-4 [&_h3]:font-medium [&_h3]:text-fg [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-medium [&_strong]:text-fg">
              {s.body}
            </div>
          </section>
        ))}

        <section
          className="mx-auto max-w-3xl border-t border-line px-6 py-14 sm:px-8"
          aria-labelledby="suite"
        >
          <h2 className="sr-only" id="suite">
            {ui.suite[locale]}
          </h2>
          {/* La chaine n'est PAS cyclique : aux deux extremites, la place vide
              est occupee par un retour vers l'index plutot que par un bouclage
              qui ferait croire a une liste sans fin. */}
          <nav
            aria-label={ui.worksNav[locale]}
            className="grid gap-3 sm:grid-cols-2"
          >
            <Voisin
              href={prev ? routes.project[locale](prev.slug) : routes.work[locale]}
              sens="precedent"
              libelle={prev ? ui.prevWork[locale] : ui.back[locale]}
              titre={prev ? prev.title : ui.allWork[locale]}
            />
            <Voisin
              href={next ? routes.project[locale](next.slug) : routes.work[locale]}
              sens="suivant"
              libelle={next ? ui.nextWork[locale] : ui.back[locale]}
              titre={next ? next.title : ui.allWork[locale]}
            />
          </nav>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}

function Voisin({
  href,
  sens,
  libelle,
  titre,
}: {
  href: string;
  sens: "precedent" | "suivant";
  libelle: string;
  titre: string;
}) {
  const Fleche = sens === "precedent" ? ArrowLeft : ArrowRight;
  return (
    <Link
      href={href}
      className={`surface lueur group flex flex-col gap-1 p-5 hover:border-accent/45 hover:bg-surface-2 ${
        sens === "suivant" ? "sm:items-end sm:text-right" : ""
      }`}
    >
      <span className="inline-flex items-center gap-1.5 text-xs tracking-[0.14em] text-dim uppercase">
        {sens === "precedent" ? <Fleche className="size-3.5" /> : null}
        {libelle}
        {sens === "suivant" ? <Fleche className="size-3.5" /> : null}
      </span>
      <span className="font-medium text-fg">{titre}</span>
    </Link>
  );
}

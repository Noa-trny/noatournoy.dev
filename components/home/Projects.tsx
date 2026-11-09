import Link from "next/link";
import { ArrowUpRight, Globe } from "lucide-react";
import { GithubIcone } from "@/components/ui/Marques";
import type { Locale } from "@/content/routes";
import { routes } from "@/content/routes";
import { PROJECTS } from "@/content/projects";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { Reveal } from "@/components/ui/Reveal";

// LES PROJETS.
//
// Chaque carte est un LIEN, pas une carte contenant un lien. La difference
// n'est pas cosmetique : elle rend toute la surface cliquable sans script, et
// elle donne un seul arret de tabulation par projet au lieu de quatre.
//
// Les liens externes — depot, demonstration — ne peuvent donc pas etre imbriques
// dedans : un `<a>` dans un `<a>` est invalide et les navigateurs le reparent en
// les separant, ce qui casse le clic. Ils sont poses A COTE, dans un pied de
// carte, et le lien de fond couvre le reste.

export function Projects({ locale }: { locale: Locale }) {
  const c = home[locale];

  return (
    <section
      id="projets"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-section sm:px-8"
      aria-labelledby="t-projets"
    >
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-dim uppercase">
              {ui.projetsTitre[locale]}
            </p>
            <h2
              id="t-projets"
              className="mt-3 max-w-2xl text-[clamp(1.75rem,3.6vw,2.5rem)] font-semibold"
            >
              {c.titles.travaux.before}
              <span className="text-accent-soft">{c.titles.travaux.em}</span>
              {c.titles.travaux.after}
            </h2>
          </div>
          <Link
            href={routes.work[locale]}
            className="lueur group inline-flex items-center gap-1.5 text-sm text-mid hover:text-fg"
          >
            {c.moreWork}
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.slug} as="article" delai={(i % 2) * 60 + 40}>
            <div className="surface lueur group relative h-full overflow-hidden p-6 hover:border-accent/45 hover:bg-surface-2 sm:p-7">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-lg font-medium text-fg">
                  <Link
                    href={routes.project[locale](p.slug)}
                    /* `after:absolute after:inset-0` : le lien s'etend a toute
                       la carte sans envelopper son contenu, donc sans emprisonner
                       les liens externes du pied. */
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    {p.title}
                  </Link>
                </h3>
                <span className="shrink-0 text-xs text-dim tabular-nums">
                  {p.year}
                </span>
              </div>

              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-mid">
                {p.blurb[locale]}
              </p>

              <ul className="mt-5 flex flex-wrap gap-1.5">
                {p.tags.slice(0, 4).map((tag) => (
                  <li
                    key={tag}
                    className="rounded border border-line px-2 py-0.5 text-xs text-dim"
                  >
                    {tag}
                  </li>
                ))}
              </ul>

              {p.links.length > 0 ? (
                <div className="relative z-10 mt-6 flex flex-wrap gap-4 border-t border-line pt-5">
                  {p.links.map((l) => {
                    let depot = false;
                    try {
                      const hostname = new URL(l.href).hostname.toLowerCase();
                      depot =
                        hostname === "github.com" ||
                        hostname.endsWith(".github.com");
                    } catch {
                      depot = false;
                    }
                    return (
                      <a
                        key={l.href}
                        href={l.href}
                        className="lueur inline-flex items-center gap-1.5 text-xs text-dim hover:text-accent-soft"
                      >
                        {depot ? (
                          <GithubIcone className="size-3.5" />
                        ) : (
                          <Globe className="size-3.5" strokeWidth={1.75} />
                        )}
                        {depot ? ui.codeSource[locale] : ui.enLigne[locale]}
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

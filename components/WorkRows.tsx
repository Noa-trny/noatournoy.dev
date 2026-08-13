import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/content/routes";
import { routes } from "@/content/routes";
import { PROJECTS } from "@/content/projects";

// La liste numerotee des travaux. Elle existe sur deux pages avec deux contenus
// differents : l'accueil montre les etiquettes de techno, /travaux/ montre une
// annee et une phrase longue. D'ou la variante.
//
// Deux defauts de l'ancien site, corriges de longue date, tiennent toujours :
// la NUMEROTATION derive du meme tableau SLUGS des deux cotes — l'accueil disait
// « _04 Ludoria » quand /travaux/ disait « _04 Gamedex » — et la PUCE D'ANNEE
// existe dans les deux langues, l'anglais l'ayant perdue en chemin.
//
// LA VIGNETTE QUI SUIVAIT LE CURSEUR A DISPARU avec `spec.css`. Elle affichait
// une capture au survol d'une ligne ; sur le theme sombre, la carte porte deja
// son annee et sa phrase, et un objet flottant qui poursuit la souris se lit
// comme une infobulle de 2012. Ce qu'elle apportait — savoir a quoi ressemble le
// projet — appartient a la fiche.

export function WorkRows({
  locale,
  variant,
}: {
  locale: Locale;
  variant: "tags" | "blurb";
}) {
  return (
    <ol className="flex flex-col">
      {PROJECTS.map((p) => (
        <li key={p.slug} data-slug={p.slug}>
          <Link
            href={routes.project[locale](p.slug)}
            className="lueur group flex items-baseline gap-5 border-b border-line py-7 hover:bg-surface/40 sm:gap-8"
          >
            {/* Une seule expression : `{p.no}.` produirait deux noeuds de texte,
                que React separe par un commentaire dans le HTML rendu. */}
            <span className="shrink-0 text-xs text-dim tabular-nums">{`${p.no}.`}</span>

            <div className="min-w-0 flex-1">
              <h3 className="flex items-center gap-2 text-xl font-medium text-fg sm:text-2xl">
                {p.title}
                <ArrowUpRight className="size-4 text-dim transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-soft" />
              </h3>

              {variant === "tags" ? (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded border border-line px-2 py-0.5 text-xs text-dim"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mid">
                  {p.blurb[locale]}
                </p>
              )}
            </div>

            <span className="shrink-0 text-xs text-dim tabular-nums">{p.year}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

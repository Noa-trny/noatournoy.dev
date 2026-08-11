import type { Locale } from "@/content/routes";
import { routes } from "@/content/routes";
import { PROJECTS } from "@/content/projects";
import { RowPeek } from "./motion/RowPeek";

// La liste numerotee des travaux. Elle existe sur deux pages avec deux contenus
// differents : l'accueil montre les etiquettes de techno, /travaux/ montre une
// annee et une phrase longue. D'ou la variante.
//
// Deux defauts de l'ancien site disparaissent ici :
//
// 1. La NUMEROTATION divergeait. L'accueil disait « _04 Ludoria » quand
//    /travaux/ disait « _04 Gamedex » : un visiteur qui passait de l'une a
//    l'autre voyait les numeros se melanger. Les deux derivent maintenant du
//    meme tableau SLUGS.
// 2. La PUCE D'ANNEE n'existait que cote francais — /en/work/ avait perdu le
//    <span> de l'annee en cours de route. Les deux langues la portent a nouveau.
//
// Les attributs data-shot / data-none disparaissent : la vignette qui suit le
// curseur lit PROJECTS directement plutot que de relire le DOM qu'elle vient
// d'ecrire. Il ne reste qu'un `data-slug`, la cle qui relie une ligne rendue
// cote serveur a son entree du manifeste.

export function WorkRows({
  locale,
  variant,
}: {
  locale: Locale;
  variant: "tags" | "blurb";
}) {
  return (
    <div className="rows-wrap">
      <ol className="rows">
        {PROJECTS.map((p) => (
          <li className="row" key={p.slug} data-slug={p.slug}>
            {/* Une seule expression : `{p.no}.` produirait deux noeuds de texte,
                que React separe par un commentaire dans le HTML rendu. */}
            <span className="row-no">{`${p.no}.`}</span>
            <div>
              <h3 className="row-title">
                <a href={routes.project[locale](p.slug)}>{p.title}</a>
              </h3>
              <p className="row-tags">
                {variant === "tags" ? (
                  p.tags.map((t) => <span key={t}>{t}</span>)
                ) : (
                  <>
                    <span>{p.year}</span>
                    <span>{p.blurb[locale]}</span>
                  </>
                )}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <RowPeek locale={locale} />
    </div>
  );
}

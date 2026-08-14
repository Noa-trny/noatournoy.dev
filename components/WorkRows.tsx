import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/content/routes";
import { routes } from "@/content/routes";
import { PROJECTS } from "@/content/projects";

// LA LISTE DES TRAVAUX, EN CARTES.
//
// Elle etait une suite de lignes : un numero, un titre, une phrase, une annee,
// separes par un filet. Rien a redire sur l'information — mais c'etait la page
// la plus nue du site, du texte gris sur du noir, alors que trois de ces
// projets ont une vraie capture qui dormait dans le depot depuis le debut. Un
// portfolio qui ne montre pas son travail se prive de son seul argument.
//
// TROIS N'ONT PAS D'IMAGE, et c'est assume plutot que subi : deux sont sous
// accord de confidentialite, un est en depot prive. Ceux-la portent un MOT, en
// capitales espacees sur le fond de carte — la meme decision que l'ancien site
// prenait deja. Un cadre vide se lit comme une image cassee ; un mot se lit
// comme une raison.
//
// PAS DE `next/image` : il emet toujours `style="color:transparent"`, un style
// EN LIGNE, et la CSP du site est `style-src 'self' 'nonce-…'`. La balise nue
// avec ses dimensions explicites fait le meme travail sans decalage de mise en
// page, puisque le rapport est fixe par la carte.

export function WorkRows({
  locale,
  variant,
}: {
  locale: Locale;
  variant: "tags" | "blurb";
}) {
  return (
    <ol className="grid gap-5 sm:grid-cols-2">
      {PROJECTS.map((p) => (
        <li key={p.slug} data-slug={p.slug}>
          <Link
            href={routes.project[locale](p.slug)}
            className="surface lueur group flex h-full flex-col overflow-hidden hover:border-accent/45 hover:bg-surface-2"
          >
            {/* LE VISUEL EN PREMIER, au rapport fixe : c'est lui qui donne son
                rythme a la grille, et un rapport fixe garantit que deux cartes
                voisines s'alignent quelle que soit la longueur du texte. */}
            <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-bg">
              {p.vignette.kind === "image" ? (
                <img
                  src={p.vignette.src}
                  alt={p.vignette.alt[locale]}
                  width={700}
                  height={438}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <span className="flex size-full items-center justify-center px-6 text-center text-xs tracking-[0.18em] text-dim uppercase">
                  {p.vignette.mot[locale]}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <p className="flex items-center justify-between text-xs text-dim tabular-nums">
                {/* Une seule expression : `{p.no}.` produirait deux noeuds de
                    texte, que React separe par un commentaire dans le HTML. */}
                <span>{`${p.no}.`}</span>
                <span>{p.year}</span>
              </p>

              <h3 className="mt-2 flex items-center gap-2 text-xl font-medium text-fg">
                {p.title}
                <ArrowUpRight className="size-4 text-dim transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-soft" />
              </h3>

              {variant === "tags" ? (
                <ul className="mt-4 flex flex-wrap gap-1.5">
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
                <p className="mt-2 text-sm leading-relaxed text-mid">{p.blurb[locale]}</p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

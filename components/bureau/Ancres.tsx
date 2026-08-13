import Link from "next/link";
import type { Locale } from "@/content/routes";
import { routes } from "@/content/routes";
import { PROJECTS } from "@/content/projects";
import { home } from "@/content/home";

// LES VRAIS LIENS, dans le document.
//
// C'est la seule chose de ce site qui n'a pas bouge en trois refontes, et la
// raison est simple : un monde 3D n'est pas indexable et ne se tabule pas. Le
// contenu peint sur les ecrans est une IMAGE — un lecteur d'ecran n'en tire
// rien, un robot d'indexation non plus.
//
// Ces ancres sont donc le site, au sens strict. Elles sont rendues par le
// serveur, presentes dans le HTML servi, et atteignables au clavier.
//
// `sr-only` PLUTOT QUE `display: none` OU `hidden`. Les deux derniers retirent
// l'element de l'ordre de tabulation et de l'arbre d'accessibilite, ce qui est
// exactement l'inverse du but. Le motif ci-dessous — un cadre d'un pixel,
// decoupe et sorti du flux — laisse l'element focalisable, et il REDEVIENT
// visible au focus pour que quelqu'un qui tabule voie ou il est.

export function Ancres({ locale }: { locale: Locale }) {
  const c = home[locale];

  return (
    <div className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:inset-x-0 focus-within:bottom-0 focus-within:z-50 focus-within:bg-bg focus-within:p-6">
      <h2 className="text-sm font-medium text-fg">{c.labels.travaux}</h2>
      <ul className="mt-3 flex flex-wrap gap-3">
        {PROJECTS.map((p) => (
          <li key={p.slug}>
            <Link
              href={routes.project[locale](p.slug)}
              className="rounded-full border border-line px-3 py-2 text-sm text-mid hover:border-accent hover:text-fg"
            >
              {p.title}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href={routes.work[locale]}
            className="rounded-full border border-line px-3 py-2 text-sm text-mid hover:border-accent hover:text-fg"
          >
            {c.moreWork}
          </Link>
        </li>
        <li>
          <Link
            href={routes.skills[locale]}
            className="rounded-full border border-line px-3 py-2 text-sm text-mid hover:border-accent hover:text-fg"
          >
            {c.moreSkills}
          </Link>
        </li>
        <li>
          <a
            href="mailto:noa.tournoy@supinfo.com"
            className="rounded-full border border-line px-3 py-2 text-sm text-mid hover:border-accent hover:text-fg"
          >
            noa.tournoy@supinfo.com
          </a>
        </li>
      </ul>
    </div>
  );
}

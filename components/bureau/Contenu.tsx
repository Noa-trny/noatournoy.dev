import Link from "next/link";
import { ArrowUpRight, Globe } from "lucide-react";
import type { Locale } from "@/content/routes";
import { routes } from "@/content/routes";
import { PROJECTS } from "@/content/projects";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { GithubIcone, LinkedinIcone } from "@/components/ui/Marques";
import type { IdZone } from "@/scene/bureau/zones";

// LE CONTENU DES PANNEAUX.
//
// Rendu sur le SERVEUR et passe au panneau, qui n'en fait qu'afficher un
// morceau. Le monde 3D ne porte donc aucun texte : il porte des objets, et le
// texte vit dans le document — ou un robot d'indexation et un lecteur d'ecran
// le trouvent, que WebGL fonctionne ou non.
//
// C'est la propriete a laquelle on ne touche pas, et elle survit a la troisieme
// refonte de la journee : les six liens vers les travaux sont de vrais `<a>`
// dans le HTML servi.

export function Contenu({ locale }: { locale: Locale }) {
  const c = home[locale];

  const blocs: Record<IdZone, React.ReactNode> = {
    projets: (
      <ul className="flex flex-col gap-3">
        {PROJECTS.map((p) => (
          <li key={p.slug}>
            <Link
              href={routes.project[locale](p.slug)}
              className="surface lueur group block p-5 hover:border-accent/45 hover:bg-surface-2"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium text-fg">{p.title}</span>
                <span className="shrink-0 text-xs text-dim tabular-nums">{p.year}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-mid">{p.blurb[locale]}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {p.tags.slice(0, 4).map((t) => (
                  <li key={t} className="rounded border border-line px-2 py-0.5 text-xs text-dim">
                    {t}
                  </li>
                ))}
              </ul>
            </Link>
          </li>
        ))}
      </ul>
    ),

    apropos: (
      <div className="flex flex-col gap-6">
        <p className="text-[1.0625rem] leading-relaxed text-mid">
          {c.heroSub.map((s, i) =>
            s.b ? (
              <strong key={i} className="font-medium text-fg">
                {s.t}
              </strong>
            ) : (
              <span key={i}>{s.t}</span>
            )
          )}
        </p>
        <dl className="grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
          {c.bref.map((b) => (
            <div key={b.i}>
              <dt className="text-xs tracking-[0.14em] text-dim uppercase">{b.k}</dt>
              <dd className="mt-1 text-fg">{b.v}</dd>
              <dd className="text-sm text-dim">{b.n}</dd>
            </div>
          ))}
        </dl>
      </div>
    ),

    parcours: (
      <ol className="ml-1 border-l border-line pl-7">
        {c.time.map((m) => (
          <li key={`${m.when}-${m.what}`} className="relative pb-8 last:pb-0">
            <span
              aria-hidden="true"
              className={`absolute top-2 -left-[2.05rem] size-2.5 rounded-full ring-4 ring-bg ${
                m.now ? "bg-accent" : "bg-line"
              }`}
            />
            <time className="text-xs tracking-wide text-dim tabular-nums uppercase">
              {m.when}
            </time>
            <h3 className="mt-1 font-medium text-fg">
              {m.what} <span className="font-normal text-mid">{m.where}</span>
            </h3>
            <p className="mt-1 text-sm text-dim">{m.note}</p>
          </li>
        ))}
      </ol>
    ),

    stack: (
      <div className="flex flex-col gap-5">
        {c.stack.map((g) => (
          <div key={g.word}>
            <h3 className="text-sm font-medium text-fg">{g.word}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {g.items.map((it) => (
                <li
                  key={it.name}
                  className="rounded-md border border-line bg-surface-2 px-2.5 py-1 text-[0.8125rem] text-mid"
                >
                  {it.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),

    contact: (
      <div className="flex flex-col gap-6">
        <p className="text-mid">{ui.parlonsEn[locale]}</p>
        <ul className="flex flex-col gap-3">
          {[
            { href: "mailto:noa.tournoy@supinfo.com", nom: "noa.tournoy@supinfo.com", I: Globe },
            { href: "https://github.com/Noa-trny", nom: "GitHub", I: GithubIcone },
            { href: "https://www.linkedin.com/in/noa-tournoy/", nom: "LinkedIn", I: LinkedinIcone },
          ].map(({ href, nom, I }) => (
            <li key={href}>
              <a
                href={href}
                className="surface lueur group flex items-center gap-3 p-4 text-sm text-mid hover:border-accent/60 hover:text-fg"
              >
                <I className="size-4" />
                {nom}
                <ArrowUpRight className="ml-auto size-4 text-dim transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    ),
  };

  return blocs;
}

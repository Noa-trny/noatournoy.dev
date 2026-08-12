import type { Locale } from "@/content/routes";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { Reveal } from "@/components/ui/Reveal";

// LA FRISE.
//
// Une seule ligne verticale, une pastille par jalon, et rien d'autre. La
// tentation sur un theme sombre est d'y mettre des cartes ; ça transforme une
// chronologie en liste, et une liste n'a pas de sens de lecture.
//
// La ligne est tracee par une BORDURE sur le `<ol>` plutot que par un
// pseudo-element absolu : elle suit alors la hauteur reelle du contenu, y
// compris quand un texte passe sur trois lignes en mobile.
//
// Le jalon en cours porte l'accent — c'est la seule information de la section
// qui ne se deduit pas des dates, donc la seule qui merite la couleur.

export function Timeline({ locale }: { locale: Locale }) {
  const c = home[locale];

  return (
    <section
      id="parcours"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-section sm:px-8"
      aria-labelledby="t-parcours"
    >
      <Reveal>
        <p className="text-xs font-medium tracking-[0.18em] text-dim uppercase">
          {c.labels.parcours}
        </p>
        <h2
          id="t-parcours"
          className="mt-3 max-w-2xl text-[clamp(1.75rem,3.6vw,2.5rem)] font-semibold"
        >
          {c.labels.bref}
        </h2>
      </Reveal>

      <ol className="mt-10 ml-2 border-l border-line pl-8 sm:ml-3">
        {c.time.map((m, i) => (
          <Reveal key={`${m.when}-${m.what}`} as="li" delai={i * 50}>
            <div className="relative pb-9 last:pb-0">
              {/* La pastille est posee SUR la ligne : decalage de sa moitie plus
                  l'epaisseur du trait. */}
              <span
                aria-hidden="true"
                className={`absolute top-2 -left-[2.28rem] size-2.5 rounded-full ring-4 ring-bg ${
                  m.now ? "bg-accent" : "bg-line"
                }`}
              />
              <div className="flex flex-wrap items-baseline gap-x-3">
                <time className="text-xs tracking-wide text-dim tabular-nums uppercase">
                  {m.when}
                </time>
                {m.now ? (
                  <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[0.6875rem] text-accent-soft">
                    {ui.maintenant[locale]}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-1.5 font-medium text-fg">
                {m.what}{" "}
                <span className="font-normal text-mid">{m.where}</span>
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-dim">{m.note}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

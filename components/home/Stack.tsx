import type { Locale } from "@/content/routes";
import { home } from "@/content/home";
import { Reveal } from "@/components/ui/Reveal";

// LA STACK, en pastilles de texte et non en logos.
//
// La demande laissait le choix entre « icones propres » et « pastilles de texte
// minimalistes ». Les secondes, pour trois raisons qui tiennent au projet.
//
// D'abord la CSP : `img-src 'self'` interdit tout logo servi par un CDN, il
// faudrait donc heberger une trentaine de SVG de marques — dont l'usage est
// justement encadre par leurs proprietaires.
//
// Ensuite la lisibilite : un mur de logos colores se lit comme un salon
// professionnel. En gris, avec un seul accent au survol, la liste redevient une
// liste — ce qu'elle est.
//
// Enfin la verite : « Docker » ecrit veut dire ce qu'on en fait ; le logo de
// Docker, non.

export function Stack({ locale }: { locale: Locale }) {
  const c = home[locale];

  return (
    <section
      id="stack"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-section sm:px-8"
      aria-labelledby="t-stack"
    >
      <Reveal>
        <p className="text-xs font-medium tracking-[0.18em] text-dim uppercase">
          {c.labels.stack}
        </p>
        <h2
          id="t-stack"
          className="mt-3 max-w-2xl text-[clamp(1.75rem,3.6vw,2.5rem)] font-semibold"
        >
          {c.titles.stack.before}
          <span className="text-accent-soft">{c.titles.stack.em}</span>
          {c.titles.stack.after}
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {c.stack.map((groupe, i) => (
          <Reveal key={groupe.word} delai={i * 60}>
            <div className="surface h-full p-6">
              <h3 className="text-sm font-medium text-fg">{groupe.word}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {groupe.items.map((item) => (
                  <li key={item.name}>
                    {/* `lueur` porte la transition, la bordure porte l'etat.
                        Une pastille qui change de FOND au survol clignote quand
                        on balaie la liste ; une bordure qui s'eclaire, non. */}
                    <span className="lueur inline-flex rounded-md border border-line bg-surface-2 px-2.5 py-1 text-[0.8125rem] text-mid hover:border-accent/60 hover:text-fg">
                      {item.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

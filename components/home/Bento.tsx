import { GraduationCap, MapPin, Briefcase, ShieldCheck } from "lucide-react";
import type { Locale } from "@/content/routes";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { Reveal } from "@/components/ui/Reveal";

// LE BLOC « A PROPOS », en grille bento.
//
// La grille n'est pas un motif decoratif : elle encode une hierarchie. Le texte
// qui presente occupe deux colonnes sur trois et deux rangees, les faits
// verifiables occupent des cellules d'une unite. On lit donc d'abord qui, puis
// les preuves — et non l'inverse, ce que donnerait une grille reguliere.
//
// Les quatre faits viennent de `bref`, deja typé et deja traduit. Leur icone
// est choisie ici parce qu'elle appartient a la presentation : mettre un nom
// d'icone dans le contenu obligerait a le retraduire a chaque refonte.

const ICONES = [GraduationCap, Briefcase, MapPin, ShieldCheck];

export function Bento({ locale }: { locale: Locale }) {
  const c = home[locale];
  const faits = c.bref.slice(0, 4);

  return (
    <section
      id="a-propos"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-section sm:px-8"
      aria-labelledby="t-apropos"
    >
      <Reveal>
        <p className="text-xs font-medium tracking-[0.18em] text-dim uppercase">
          {ui.aPropos[locale]}
        </p>
        <h2
          id="t-apropos"
          className="mt-3 max-w-2xl text-[clamp(1.75rem,3.6vw,2.5rem)] font-semibold"
        >
          {/* SON PROPRE TITRE. Cette section portait celui du PARCOURS — « Du
              bac NSI a l'alternance cyber » — qui decrit un trajet dans le
              temps, pas un apercu. Les deux `aria-labelledby` nommaient donc la
              mauvaise section l'un comme l'autre. */}
          {c.titles.apropos.before}
          <span className="text-accent-soft">{c.titles.apropos.em}</span>
          {c.titles.apropos.after}
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Reveal className="sm:col-span-2 lg:row-span-2" delai={40}>
          <div className="surface flex h-full flex-col justify-between gap-8 p-7 sm:p-9">
            <p className="text-[1.0625rem] leading-relaxed text-mid">
              {c.heroSub.map((seg, i) =>
                seg.b ? (
                  <strong key={i} className="font-medium text-fg">
                    {seg.t}
                  </strong>
                ) : (
                  <span key={i}>{seg.t}</span>
                )
              )}
            </p>
            <dl className="grid gap-x-8 gap-y-4 border-t border-line pt-7 sm:grid-cols-2">
              {c.certs.slice(0, 2).map((cert) => (
                <div key={cert.name}>
                  <dt className="text-sm text-fg">{cert.name}</dt>
                  <dd className="text-sm text-dim">
                    {cert.org} · {cert.when}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        {faits.map((f, i) => {
          const Icone = ICONES[i] ?? MapPin;
          return (
            <Reveal key={f.i} delai={80 + i * 50}>
              <div className="surface lueur h-full p-6 hover:border-accent/45 hover:bg-surface-2">
                <Icone className="size-5 text-accent" strokeWidth={1.75} />
                <p className="mt-5 text-xs tracking-[0.14em] text-dim uppercase">
                  {f.k}
                </p>
                <p className="mt-1.5 font-medium text-fg">{f.v}</p>
                <p className="mt-0.5 text-sm text-dim">{f.n}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

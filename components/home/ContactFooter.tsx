import { Mail, ArrowUpRight } from "lucide-react";
import { GithubIcone, LinkedinIcone } from "@/components/ui/Marques";
import type { Locale } from "@/content/routes";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { Reveal } from "@/components/ui/Reveal";

// LE CONTACT ET LE PIED DE PAGE, en un seul bloc.
//
// Les separer donnerait deux zones qui disent la meme chose a trente pixels
// d'ecart. Le pied n'a rien a ajouter apres un appel a ecrire : il porte donc
// seulement la mention legale et les trois liens, sur la meme surface.
//
// Les libelles sont ECRITS a cote des icones et non caches derriere un
// `aria-label`. Une icone seule demande de reconnaitre un pictogramme ; le mot
// se lit. Sur trois liens, la place ne manque pas.

const LIENS = [
  {
    href: "mailto:noa.tournoy@supinfo.com",
    nom: "noa.tournoy@supinfo.com",
    Icone: ({ className }: { className?: string }) => (
      <Mail className={className} strokeWidth={1.75} />
    ),
  },
  { href: "https://github.com/Noa-trny", nom: "GitHub", Icone: GithubIcone },
  {
    href: "https://www.linkedin.com/in/noa-tournoy/",
    nom: "LinkedIn",
    Icone: LinkedinIcone,
  },
] as const;

export function ContactFooter({ locale }: { locale: Locale }) {
  const c = home[locale];

  return (
    <footer
      id="contact"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 pt-section pb-16 sm:px-8"
    >
      <Reveal>
        <div className="surface relative overflow-hidden p-8 sm:p-12">
          {/* Le degrade d'accent, cantonne au coin superieur : il signale la fin
              de la page sans repeindre la carte. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent_70%)]"
          />

          <p className="text-xs font-medium tracking-[0.18em] text-dim uppercase">
            {c.contactLabel}
          </p>
          <h2 className="mt-3 max-w-xl text-[clamp(1.75rem,3.6vw,2.5rem)] font-semibold">
            {c.contactTitle.join(" ")}
          </h2>
          <p className="mt-4 max-w-lg text-mid">{ui.parlonsEn[locale]}</p>

          <ul className="mt-9 flex flex-wrap gap-3">
            {LIENS.map(({ href, nom, Icone }) => (
              <li key={href}>
                <a
                  href={href}
                  className="lueur group inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-4 py-2.5 text-sm text-mid hover:border-accent/60 hover:text-fg"
                >
                  <Icone className="size-4" />
                  {nom}
                  <ArrowUpRight className="size-3.5 text-dim transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <p className="mt-10 text-center text-xs text-dim">
        © {new Date().getFullYear()} Noa Tournoy · Lille, France
      </p>
    </footer>
  );
}

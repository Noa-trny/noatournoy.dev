import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import type { Locale } from "@/content/routes";
import { routes } from "@/content/routes";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { Reveal } from "@/components/ui/Reveal";

// L'accroche.
//
// Un seul titre, une seule phrase, deux actions. Le reste de la page detaille ;
// cet ecran-ci doit tenir en trois secondes de lecture.
//
// La pastille de disponibilite est le seul endroit du site ou une couleur autre
// que l'accent apparait — un vert, parce qu'il dit « ouvert » sans qu'on ait a
// le lire. C'est aussi l'information la plus perissable de la page, donc elle
// vient du contenu type et non du balisage.

export function Hero({ locale }: { locale: Locale }) {
  const c = home[locale];
  const accroche = c.heroSub.map((s) => s.t).join("");

  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 pt-28 pb-20 sm:px-8 sm:pt-36 sm:pb-28">
      {/* La lueur d'ambiance. Un dégradé radial très large et très faible :
          il ne se voit pas, il empeche seulement le fond d'etre parfaitement
          plat, ce qui est ce qui fait « page non finie » sur un theme sombre.
          `pointer-events-none` parce qu'il couvre toute la zone. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_srgb,var(--color-accent)_12%,transparent),transparent_70%)]"
      />

      <Reveal>
        <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/60 px-3.5 py-1.5 text-[0.8125rem] text-mid">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-good opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-good" />
          </span>
          {ui.dispo[locale]}
        </p>
      </Reveal>

      <Reveal delai={60}>
        <h1 className="mt-7 max-w-4xl text-[clamp(2.6rem,7vw,4.75rem)] leading-[1.03] font-semibold">
          Noa Tournoy,
          <br />
          <span className="text-mid">développeur full-stack</span>
          <br />
          <span className="bg-[linear-gradient(100deg,var(--color-fg),var(--color-accent-soft))] bg-clip-text text-transparent">
            &amp; systèmes
          </span>
        </h1>
      </Reveal>

      <Reveal delai={120}>
        <p className="mt-7 max-w-2xl text-[1.0625rem] text-mid sm:text-lg">
          {accroche}
        </p>
      </Reveal>

      <Reveal delai={180}>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href={routes.work[locale]}
            className="lueur group inline-flex items-center gap-2 rounded-full bg-fg px-5 py-3 text-sm font-medium text-bg hover:bg-accent-soft"
          >
            {ui.voirProjets[locale]}
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <a
            href="mailto:noa.tournoy@supinfo.com"
            className="lueur inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm text-fg hover:border-accent hover:bg-surface"
          >
            <Mail className="size-4" />
            {ui.meContacter[locale]}
          </a>
        </div>
      </Reveal>
    </section>
  );
}

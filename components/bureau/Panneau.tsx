"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Locale } from "@/content/routes";
import { ui } from "@/content/ui";
import { bureau, useBureau } from "@/scene/bureau/etat";
import { zonePar } from "@/scene/bureau/zones";

// LE PANNEAU qui s'ouvre par-dessus la scene.
//
// Du DOM, pas un `<Html>` de drei. Trois raisons, et aucune n'est une
// preference : `<Html>` recalcule une transformation matrice vers CSS a chaque
// image et par instance ; il ecrit des styles en ligne que la CSP interdirait ;
// et il vit dans le canvas, donc hors de l'arbre rendu par le serveur — c'est-
// a-dire invisible pour un robot d'indexation et pour un lecteur d'ecran.
//
// LE PIEGE DU FOCUS. Un panneau modal qui n'attrape pas le focus laisse le
// clavier derriere lui : on tabule dans une page qu'on ne voit plus. On pose
// donc le focus a l'ouverture, on le rend a la fermeture, et `Echap` ferme.

export function Panneau({
  locale,
  blocs,
}: {
  locale: Locale;
  /**
   * Les sections DEJA RENDUES, indexees par zone.
   *
   * Un objet d'elements et non une fonction de rendu : une fonction ne
   * traverse pas la frontiere serveur/client — React refuse de la serialiser,
   * et la page rend 500. Des elements, eux, se serialisent.
   */
  blocs: Partial<Record<string, React.ReactNode>>;
}) {
  const ouverte = useBureau((e) => e.ouverte);
  const boite = useRef<HTMLDivElement>(null);
  const avant = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ouverte) return;
    avant.current = document.activeElement as HTMLElement | null;
    // Une image d'attente : le panneau vient d'apparaitre, il n'est pas encore
    // dans le document au moment ou l'effet part.
    const t = requestAnimationFrame(() => boite.current?.focus());
    const clavier = (e: KeyboardEvent) => {
      if (e.key === "Escape") bureau.fermer();
    };
    document.addEventListener("keydown", clavier);
    return () => {
      cancelAnimationFrame(t);
      document.removeEventListener("keydown", clavier);
      avant.current?.focus?.();
    };
  }, [ouverte]);

  if (!ouverte) return null;
  const z = zonePar(ouverte);

  return (
    <div
      ref={boite}
      role="dialog"
      aria-modal="true"
      aria-label={z.titre[locale]}
      tabIndex={-1}
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-xl flex-col outline-none sm:w-[46vw]"
    >
      {/* Le fond : opaque a droite, degrade vers la gauche. La scene reste
          visible sous le texte, ce qui rappelle d'ou l'on vient — un panneau
          plein ferait oublier qu'il y a un monde derriere. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-bg)_92%,transparent)_22%,var(--color-bg)_58%)]"
      />

      <div className="flex items-start justify-between gap-6 px-8 pt-10 sm:px-12">
        <div>
          <p className="text-xs tracking-[0.18em] text-dim uppercase">
            {z.objet[locale]}
          </p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
            {z.titre[locale]}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => bureau.fermer()}
          className="lueur mt-1 inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs text-mid hover:border-accent hover:text-fg"
        >
          <X className="size-3.5" />
          {ui.menuClose[locale]}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-8 pt-8 pb-12 sm:px-12">
        {blocs[ouverte]}
      </div>
    </div>
  );
}

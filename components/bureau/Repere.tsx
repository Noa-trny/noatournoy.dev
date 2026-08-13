"use client";

import { useEffect } from "react";
import type { Locale } from "@/content/routes";
import { useBureau } from "@/scene/bureau/etat";
import { ZONES, zonePar } from "@/scene/bureau/zones";
import { bureau } from "@/scene/bureau/etat";

// L'ETIQUETTE DE SURVOL, et le repli au clavier.
//
// UN SEUL div fixe dont le texte change, et non une etiquette par objet. Un
// `<Html>` de drei par zone recalculerait cinq transformations matrice vers CSS
// a chaque image, pour afficher un mot a la fois.
//
// LES BOUTONS SOUS LE CANVAS SONT LA VRAIE NAVIGATION. Le survol et le clic
// dans la scene sont un agrement ; ceux-ci sont atteignables au clavier, lus
// par un lecteur d'ecran, et presents dans le document. Ils ne sont pas caches
// par `display: none` — ce qui les sortirait de l'ordre de tabulation — mais
// rendus transparents et reveles au focus, comme un lien d'evitement.

export function Repere({ locale }: { locale: Locale }) {
  const survol = useBureau((e) => e.survol);
  const ouverte = useBureau((e) => e.ouverte);
  const z = survol ? zonePar(survol) : null;

  // LE RETOUR EN ARRIERE. Sans panneau a fermer, il faut un chemin explicite
  // pour reculer — sinon on approche un objet et l'on reste coince dessus.
  // Trois : la touche d'echappement, un clic dans le vide, et un bouton.
  useEffect(() => {
    if (!ouverte) return;
    const clavier = (e: KeyboardEvent) => {
      if (e.key === "Escape") bureau.fermer();
    };
    document.addEventListener("keydown", clavier);
    return () => document.removeEventListener("keydown", clavier);
  }, [ouverte]);

  return (
    <>
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed bottom-10 left-1/2 z-30 -translate-x-1/2 rounded-full border border-line bg-surface/80 px-4 py-2 text-sm text-fg backdrop-blur transition-opacity duration-200 ${
          z && !ouverte ? "opacity-100" : "opacity-0"
        }`}
      >
        {z ? z.titre[locale] : ""}
        <span className="ml-2 text-dim">{z ? z.objet[locale] : ""}</span>
      </div>

      {/* Le bouton de retour, visible seulement quand on est approche. */}
      <button
        type="button"
        onClick={() => bureau.fermer()}
        className={`fixed top-6 left-6 z-30 rounded-full border border-line bg-surface/80 px-4 py-2 text-sm text-mid backdrop-blur transition-opacity duration-300 hover:border-accent hover:text-fg ${
          ouverte ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        ← {locale === "fr" ? "Reculer" : "Step back"}
      </button>

      {/* LES BOUTONS SOUS LE CANVAS SONT LA VRAIE NAVIGATION.
      
          Le survol et le clic dans la scene sont un agrement ; ceux-ci sont
          atteignables au clavier et lus par un lecteur d'ecran. Ils ne sont pas
          caches par `display: none` — ce qui les sortirait de l'ordre de
          tabulation — mais rendus transparents et reveles au focus. */}
      <nav
        aria-label={locale === "fr" ? "Sections" : "Sections"}
        className="fixed bottom-6 left-6 z-30 flex flex-wrap gap-2 opacity-0 transition-opacity focus-within:opacity-100"
      >
        {ZONES.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => bureau.ouvrir(zone.id)}
            className="rounded-full border border-line bg-surface px-3 py-2 text-xs text-mid hover:border-accent hover:text-fg"
          >
            {zone.titre[locale]}
          </button>
        ))}
      </nav>
    </>
  );
}

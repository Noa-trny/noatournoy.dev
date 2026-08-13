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
          tabulation — mais rendus transparents et reveles au focus.

          AU POINTEUR GROSSIER, ILS SONT LA NAVIGATION TOUT COURT. Deux raisons
          se rejoignent : sans survol, rien ne dit qu'un objet est vise ; et le
          cadrage portrait ne peut pas contenir les cinq objets a la fois — leurs
          2,20 m de plateau demanderaient sept metres de recul (voir zones.ts).
          Ils passent donc au centre, visibles, plutot que de rester un carre
          transparent dans un coin — c'est-a-dire, sur telephone, une zone qui
          navigue sans rien montrer.

          `pointer-events-none` tant qu'ils sont invisibles : le focus clavier
          traverse cette propriete, le doigt non. */}
      <nav
        aria-label={locale === "fr" ? "Sections" : "Sections"}
        className="pointer-events-none fixed bottom-6 left-6 z-30 flex flex-wrap gap-2 opacity-0 transition-opacity focus-within:pointer-events-auto focus-within:opacity-100 tactile:pointer-events-auto tactile:right-4 tactile:bottom-5 tactile:left-4 tactile:justify-center tactile:opacity-100"
      >
        {ZONES.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => bureau.ouvrir(zone.id)}
            // Le plancher de 44 px au doigt vaut pour les cinq : une pastille de
            // 30 px de haut se rate une fois sur trois, et c'est ici le seul
            // chemin vers le contenu.
            className="rounded-full border border-line bg-surface/85 px-3 py-2 text-xs text-mid backdrop-blur hover:border-accent hover:text-fg tactile:min-h-11 tactile:px-4 tactile:text-sm"
          >
            {zone.titre[locale]}
          </button>
        ))}
      </nav>
    </>
  );
}

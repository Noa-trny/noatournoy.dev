"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { journey } from "@/scene/scroll/journeyStore";
import { isSlug } from "@/content/routes";

// Le pont entre le clavier et la scene.
//
// C'est la moitie qui compte pour l'accessibilite. La scene porte la
// navigation, mais elle ne la CONFISQUE pas : les six liens vivent dans le DOM,
// rendus par le serveur, et ce composant se contente de faire echo dans la
// scene a ce que le clavier designe.
//
// Trois raisons de le faire imperativement plutot qu'avec des gestionnaires
// React sur chaque lien :
//
// 1. `WorkRows` reste un composant SERVEUR. Son balisage part dans le HTML
//    livre, ce qui est precisement ce qui garantit qu'un robot et un navigateur
//    sans JavaScript trouvent les six routes.
// 2. La delegation coute deux ecouteurs pour six liens, quel que soit leur
//    nombre.
// 3. Rien ici n'est necessaire au fonctionnement : sans JavaScript, les liens
//    restent des liens.

export function FocusVitrines() {
  const pathname = usePathname();

  useEffect(() => {
    const lignes = document.querySelector<HTMLElement>(".rows");
    if (!lignes) return;

    /** Remonte du lien focalise a la ligne qui porte le slug. */
    const slugDe = (cible: EventTarget | null): string | null => {
      const el = cible as HTMLElement | null;
      const ligne = el?.closest<HTMLElement>("[data-slug]");
      const s = ligne?.dataset.slug;
      return s && isSlug(s) ? s : null;
    };

    // `focusin` et non `focus` : ce dernier ne remonte pas, et la delegation
    // serait impossible.
    const entre = (e: FocusEvent) => {
      const s = slugDe(e.target);
      if (s) journey.set({ activeId: s });
    };
    const sort = (e: FocusEvent) => {
      // Si le focus reste dans la meme ligne, on ne l'eteint pas.
      const versLaMeme = slugDe(e.relatedTarget) === slugDe(e.target);
      if (!versLaMeme) journey.set({ activeId: null });
    };

    lignes.addEventListener("focusin", entre);
    lignes.addEventListener("focusout", sort);
    return () => {
      lignes.removeEventListener("focusin", entre);
      lignes.removeEventListener("focusout", sort);
      journey.set({ activeId: null });
    };
  }, [pathname]);

  return null;
}

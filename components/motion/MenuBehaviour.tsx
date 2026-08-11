"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Le comportement du panneau de menu. Portage de scripts/menu.js.
//
// Le balisage reste rendu cote serveur (composants Chrome) et ce composant s'y
// accroche : sans JavaScript le bouton n'ouvre rien et le panneau reste masque,
// ce qui est le comportement voulu — les liens de section sont de toute facon
// dans le pied de page.
//
// Manipuler ainsi du DOM rendu ailleurs serait dangereux si React re-rendait ce
// balisage : ici il ne le fait pas, le tiroir etant un composant serveur figé.
// A la navigation, l'arbre est reconstruit ET l'effet rejoue — d'ou la fermeture
// automatique ci-dessous, qui traite un cas que l'ancien site n'avait pas :
// un clic sur un lien rechargeait la page, donc le menu disparaissait tout seul.

export function MenuBehaviour() {
  const pathname = usePathname();

  useEffect(() => {
    const btn = document.querySelector<HTMLButtonElement>(".menu-btn");
    const panel = document.getElementById("menu");
    if (!btn || !panel) return;

    let open = false;
    let secours: ReturnType<typeof setTimeout> | undefined;
    let onEnd: (() => void) | undefined;

    function set(state: boolean) {
      if (!btn || !panel) return;
      open = state;
      btn.setAttribute("aria-expanded", String(state));
      document.documentElement.classList.toggle("menu-open", state);

      if (state) {
        panel.hidden = false;
        requestAnimationFrame(() => panel.classList.add("is-open"));
        panel.querySelector<HTMLElement>(".menu-close")?.focus();
        return;
      }

      panel.classList.remove("is-open");
      // Sans repli, un mouvement reduit supprime la transition, `transitionend`
      // ne se produit jamais, le panneau reste affiche et son voile intercepte
      // tous les clics de la page.
      let fini = false;
      onEnd = () => {
        if (fini) return;
        fini = true;
        panel.hidden = true;
        if (onEnd) panel.removeEventListener("transitionend", onEnd);
        clearTimeout(secours);
      };
      secours = setTimeout(onEnd, 500);
      panel.addEventListener("transitionend", onEnd);
      btn.focus();
    }

    const onBtn = () => set(!open);
    const onPanel = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      /* un lien, le bouton Fermer, ou le voile lui-meme */
      if (t === panel || t.closest("a") || t.closest(".menu-close")) set(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) set(false);
    };

    btn.addEventListener("click", onBtn);
    panel.addEventListener("click", onPanel);
    document.addEventListener("keydown", onKey);

    return () => {
      btn.removeEventListener("click", onBtn);
      panel.removeEventListener("click", onPanel);
      document.removeEventListener("keydown", onKey);
      if (onEnd) panel.removeEventListener("transitionend", onEnd);
      clearTimeout(secours);
      // On ne laisse jamais la classe derriere nous : elle bloque le
      // defilement du document.
      document.documentElement.classList.remove("menu-open");
    };
  }, [pathname]);

  return null;
}

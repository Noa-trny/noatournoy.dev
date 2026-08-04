/* Le panneau de menu. Sans JavaScript le bouton n'existe pas et le panneau
   reste masqué : les liens de section sont de toute façon dans le pied de page. */
(function () {
  "use strict";

  var btn = document.querySelector(".menu-btn");
  var panel = document.getElementById("menu");
  if (!btn || !panel) return;

  var open = false;

  function set(state) {
    open = state;
    btn.setAttribute("aria-expanded", String(state));
    document.documentElement.classList.toggle("menu-open", state);
    if (state) {
      panel.hidden = false;
      requestAnimationFrame(function () { panel.classList.add("is-open"); });
      var first = panel.querySelector(".menu-close");
      if (first) first.focus();
    } else {
      panel.classList.remove("is-open");
      /* Sans repli, un mouvement reduit supprime la transition, transitionend
         ne se produit jamais, le panneau reste affiche et son voile intercepte
         tous les clics de la page. */
      var fini = false;
      var done = function () {
        if (fini) return;
        fini = true;
        panel.hidden = true;
        panel.removeEventListener("transitionend", done);
        clearTimeout(secours);
      };
      var secours = setTimeout(done, 500);
      panel.addEventListener("transitionend", done);
      btn.focus();
    }
  }

  btn.addEventListener("click", function () { set(!open); });

  panel.addEventListener("click", function (e) {
    /* un lien, le bouton Fermer, ou le voile lui-meme */
    if (e.target === panel || e.target.closest("a") || e.target.closest(".menu-close")) {
      set(false);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) set(false);
  });
})();

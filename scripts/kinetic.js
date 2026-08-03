/* Le mécanisme du site, sur GSAP + ScrollTrigger. Deux usages, et ils ne
   touchent qu'un seul élément : le nom du premier écran.
   1. la vitesse de défilement pilote ses axes variables et son volume (--vel) ;
   2. il s'échappe vers le haut quand on quitte le premier écran.
   Le corps de texte, les listes et les planches ne bougent jamais : faire
   varier la chasse d'un texte le relayoute, et un texte qui glisse pendant
   qu'on le lit est illisible.
   Sans JavaScript, --vel reste à 0 et tout est déjà lisible et visible. */
(function () {
  "use strict";

  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  // la fonte change les hauteurs : les déclencheurs se recalculent après son arrivée
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }

  var root = document.documentElement;
  var mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", function () {
    /* ---- 1. la vitesse compose la page ------------------------------- */

    var state = { v: 0 };
    var CEIL = 2600; // px/s correspondant à l'amplitude maximale
    var settle;

    /* le relevé d'axes affiche les valeurs réelles ; les créneaux sont à chasse
       fixe et en chiffres tabulaires, donc l'affichage ne relayoute rien */
    var out = {};
    document.querySelectorAll("[data-readout] [data-ax]").forEach(function (el) {
      out[el.dataset.ax] = el;
    });
    var AX = { wght: [780, 280], wdth: [105, 45], grad: [0, 120] };

    function write() {
      var v = state.v;
      root.style.setProperty("--vel", v.toFixed(4));
      for (var k in out) {
        out[k].textContent = Math.round(AX[k][0] + (AX[k][1] - AX[k][0]) * v);
      }
    }

    var rise = gsap.quickTo(state, "v", {
      duration: 0.24,
      ease: "power2.out",
      onUpdate: write,
    });
    var fall = gsap.quickTo(state, "v", {
      duration: 0.9,
      ease: "power3.out",
      onUpdate: write,
    });

    ScrollTrigger.create({
      onUpdate: function (self) {
        var target = Math.min(Math.abs(self.getVelocity()) / CEIL, 1);
        (target > state.v ? rise : fall)(target);
        if (settle) settle.restart(true);
        else settle = gsap.delayedCall(0.12, function () { fall(0); });
      },
    });

    /* ---- 2. le nom s'échappe quand on quitte le premier écran --------- */

    /* C'est le seul déplacement du site. Rien d'autre ne bouge : ni le corps
       de texte, ni les listes, ni les planches. Un texte qui glisse pendant
       qu'on le lit est illisible. */
    var wordmark = document.querySelector(".opening .wordmark");
    if (wordmark) {
      gsap.to(wordmark, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: ".opening",
          start: "top top",
          end: "bottom top",
          scrub: 0.4,
        },
      });
    }

    return function () {
      state.v = 0;
      write();
    };
  });
})();

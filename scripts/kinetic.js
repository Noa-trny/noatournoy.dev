/* Le mécanisme du site, sur GSAP + ScrollTrigger.
   Trois usages, pas un de plus :
   1. la vitesse de défilement pilote les axes de la fonte variable (--vel) ;
   2. le premier écran s'échappe en parallaxe quand on le quitte ;
   3. les planches entrent une fois, décalées.
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

    function write() {
      root.style.setProperty("--vel", state.v.toFixed(4));
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

    /* ---- 2. le premier écran s'échappe ------------------------------- */

    var opening = document.querySelector(".opening");
    if (opening) {
      gsap.to(opening.querySelector(".wordmark"), {
        yPercent: -14,
        scale: 0.94,
        transformOrigin: "0% 50%",
        ease: "none",
        scrollTrigger: {
          trigger: opening,
          start: "top top",
          end: "bottom top",
          scrub: 0.4,
        },
      });
      gsap.to(opening.querySelector(".identification"), {
        yPercent: -30,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: opening,
          start: "top top",
          end: "bottom top",
          scrub: 0.4,
        },
      });
    }

    /* ---- 3. les planches entrent ------------------------------------- */

    /* fromTo sans rendu immédiat : rien n'est estompé tant que le déclencheur
       n'a pas parlé. Si l'un d'eux ne parle jamais, le texte reste simplement
       à son état normal. */
    function enter(targets, trigger, opts) {
      gsap.fromTo(
        targets,
        { opacity: opts.from, y: opts.y },
        {
          opacity: 1,
          y: 0,
          duration: opts.duration,
          stagger: opts.stagger,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: { trigger: trigger, start: opts.start, once: true },
        }
      );
    }

    gsap.utils.toArray(".plate:not(.opening)").forEach(function (plate) {
      if (!plate.children.length) return;
      enter(plate.children, plate, {
        from: 0.3, y: 26, duration: 0.7, stagger: 0.07, start: "top 88%",
      });
    });

    /* la cascade et l'index des travaux entrent ligne à ligne */
    gsap.utils.toArray(".cascade, .works").forEach(function (list) {
      enter(list.children, list, {
        from: 0.25, y: 18, duration: 0.6, stagger: 0.08, start: "top 85%",
      });
    });

    return function () {
      state.v = 0;
      write();
    };
  });
})();

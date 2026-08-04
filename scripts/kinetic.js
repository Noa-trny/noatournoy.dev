/* Les entrées. Uniquement transform et opacity : rien qui change une largeur,
   donc rien qui relayoute pendant le défilement.
   Sans JavaScript, tout est déjà en place et visible. */
(function () {
  "use strict";

  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", function () {
    function enter(targets, trigger, stagger) {
      if (!targets || !targets.length) return;
      gsap.fromTo(
        targets,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: stagger,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: { trigger: trigger, start: "top 88%", once: true },
        }
      );
    }

    var hero = document.querySelector(".hero");
    if (hero) {
      gsap.from(hero.children, {
        opacity: 0,
        y: 26,
        duration: 0.7,
        stagger: 0.09,
        ease: "power2.out",
      });
    }

    gsap.utils.toArray(".work").forEach(function (card) {
      enter([card], card, 0);
    });

    gsap.utils.toArray(".sec").forEach(function (sec) {
      var head = sec.querySelectorAll(".label, .sec-title");
      enter(head, sec, 0.08);
      var rows = sec.querySelectorAll(".time > li");
      if (rows.length) enter(rows, sec.querySelector(".time"), 0.05);
    });

    var cta = document.querySelector(".cta");
    if (cta) enter([cta], cta, 0);
  });
})();

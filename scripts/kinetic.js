/* Les animations de défilement.
   Deux règles qui ne se négocient pas :
   1. uniquement transform et opacity — rien qui change une largeur, donc rien
      qui relayoute pendant qu'on lit ;
   2. tout ce qui dépend du défilement passe par fromTo sans rendu immédiat —
      un déclencheur muet laisse le contenu à son état normal, jamais invisible.
   Sans JavaScript, la page est déjà complète. */
(function () {
  "use strict";

  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }

  /* découpe un titre en mots sans altérer le texte lu à voix haute */
  function splitWords(el) {
    if (!el || el.dataset.split) return [];
    var out = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType !== 3) {
        if (node.nodeType === 1) out.push(node);
        return;
      }
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (chunk) {
        if (!chunk) return;
        if (/^\s+$/.test(chunk)) return frag.appendChild(document.createTextNode(chunk));
        var s = document.createElement("span");
        s.style.display = "inline-block";
        s.textContent = chunk;
        frag.appendChild(s);
        out.push(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
    el.dataset.split = "1";
    return out;
  }

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", function () {
    /* révélation sûre : l'état de départ n'est pose qu'au moment du déclenchement */
    function reveal(targets, from, opts) {
      var list = targets && targets.length ? targets : null;
      if (!list) return;
      var to = { opacity: 1, x: 0, y: 0, yPercent: 0, scale: 1 };
      to.duration = opts.duration || 0.65;
      to.stagger = opts.stagger || 0;
      to.ease = opts.ease || "power2.out";
      to.immediateRender = false;
      to.scrollTrigger = {
        trigger: opts.trigger,
        start: opts.start || "top 88%",
        once: true,
      };
      gsap.fromTo(list, from, to);
    }

    /* ---- bandeau défilant, la vitesse suit le défilement -------------- */

    var track = document.querySelector(".marquee-track");
    if (track) {
      var items = Array.prototype.slice.call(track.children);
      items.forEach(function (n) { track.appendChild(n.cloneNode(true)); });
      var half = track.scrollWidth / 2;
      var loop = gsap.to(track, {
        x: -half,
        duration: 26,
        ease: "none",
        repeat: -1,
        modifiers: { x: gsap.utils.unitize(function (x) { return parseFloat(x) % half; }) },
      });
      ScrollTrigger.create({
        onUpdate: function (self) {
          var v = gsap.utils.clamp(0.6, 5, 1 + Math.abs(self.getVelocity()) / 900);
          gsap.to(loop, { timeScale: self.direction === -1 ? -v : v, duration: 0.3, overwrite: true });
        },
      });
    }

    /* ---- projecteur au curseur ---------------------------------------- */

    document.querySelectorAll(".cert").forEach(function (c) {
      var g = document.createElement("span");
      g.className = "cert-glow";
      g.setAttribute("aria-hidden", "true");
      c.appendChild(g);
    });

    if (window.matchMedia("(hover: hover)").matches) {
      document.querySelectorAll(".row, .cert").forEach(function (el) {
        el.addEventListener("pointermove", function (e) {
          var r = el.getBoundingClientRect();
          el.style.setProperty("--mx", (e.clientX - r.left) + "px");
          el.style.setProperty("--my", (e.clientY - r.top) + "px");
        });
      });

      /* boutons magnétiques */
      document.querySelectorAll(".btn").forEach(function (b) {
        var qx = gsap.quickTo(b, "x", { duration: 0.35, ease: "power3.out" });
        var qy = gsap.quickTo(b, "y", { duration: 0.35, ease: "power3.out" });
        b.addEventListener("pointermove", function (e) {
          var r = b.getBoundingClientRect();
          qx((e.clientX - r.left - r.width / 2) * 0.28);
          qy((e.clientY - r.top - r.height / 2) * 0.4);
        });
        b.addEventListener("pointerleave", function () { qx(0); qy(0); });
      });
    }

    /* ---- certifications ------------------------------------------------ */

    reveal(document.querySelectorAll(".cert"), { opacity: 0, y: 32, scale: 0.97 }, {
      trigger: document.querySelector(".certs"), duration: 0.6, stagger: 0.08,
    });

    /* ---- jauge de progression ---------------------------------------- */

    var bar = document.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = "<i></i>";
    document.body.appendChild(bar);
    gsap.to(bar.firstChild, {
      yPercent: 355,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.25 },
    });

    /* ---- la vignette suit le curseur sur la liste --------------------- */

    var rows = document.querySelectorAll(".row");
    if (rows.length && window.matchMedia("(hover: hover)").matches) {
      var peek = document.createElement("div");
      peek.className = "peek";
      peek.setAttribute("aria-hidden", "true");
      document.body.appendChild(peek);

      var px = gsap.quickTo(peek, "x", { duration: 0.5, ease: "power3.out" });
      var py = gsap.quickTo(peek, "y", { duration: 0.5, ease: "power3.out" });
      var shown = null;

      rows.forEach(function (row) {
        row.addEventListener("pointerenter", function () {
          if (shown === row) return;
          shown = row;
          var shot = row.dataset.shot;
          peek.innerHTML = shot
            ? '<img src="' + shot + '" alt="">'
            : '<div class="none"><b>' +
              row.querySelector(".row-title").textContent.trim() +
              "</b><span>" + (row.dataset.none || "") + "</span></div>";
          gsap.to(peek, { opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" });
        });
        row.addEventListener("pointerleave", function () {
          shown = null;
          gsap.to(peek, { opacity: 0, scale: 0.9, duration: 0.28, ease: "power2.out" });
        });
        row.addEventListener("pointermove", function (e) {
          px(e.clientX);
          py(e.clientY);
        });
      });
    }

    /* ---- les lignes de la liste entrent une à une --------------------- */

    reveal(document.querySelectorAll(".row"), { opacity: 0, y: 26 }, {
      trigger: document.querySelector(".rows"), duration: 0.6, stagger: 0.07,
    });
    reveal(document.querySelectorAll(".ghost-row"), { opacity: 0, x: -22 }, {
      trigger: document.querySelector(".ghosts"), duration: 0.6, stagger: 0.07,
    });

    /* ---- premier écran ------------------------------------------------ */
    /* joue au chargement, sans déclencheur : from est sûr ici */

    var hero = document.querySelector(".hero");
    if (hero) {
      var h1 = hero.querySelector("h1");
      var words = splitWords(h1);
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(hero.querySelector(".label"), { opacity: 0, y: 14, duration: 0.5 })
        .from(words, { opacity: 0, yPercent: 110, duration: 0.85, stagger: 0.045 }, "-=0.25")
        .from(hero.querySelector(".hero-sub"), { opacity: 0, y: 18, duration: 0.6 }, "-=0.45")
        .from(hero.querySelector(".hero-meta"), { opacity: 0, y: 14, duration: 0.5 }, "-=0.4")
        .from(hero.querySelectorAll(".status > *"), { opacity: 0, y: 22, duration: 0.6, stagger: 0.07 }, "-=0.35");

      gsap.to([h1, hero.querySelector(".hero-sub"), hero.querySelector(".hero-meta")], {
        yPercent: -18,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5 },
      });
    }

    /* ---- titres et étiquettes ----------------------------------------- */

    gsap.utils.toArray(".sec-title").forEach(function (title) {
      reveal(splitWords(title), { opacity: 0, yPercent: 105 }, {
        trigger: title, duration: 0.8, stagger: 0.035, ease: "power3.out",
      });
    });

    gsap.utils.toArray(".label").forEach(function (l) {
      if (l.closest(".hero")) return;
      reveal([l], { opacity: 0, x: -12 }, { trigger: l, duration: 0.5, start: "top 92%" });
    });

    /* ---- cartes de travaux -------------------------------------------- */

    /* ---- frises : le rail se trace, les lignes suivent ---------------- */

    gsap.utils.toArray(".time").forEach(function (list) {
      var rail = document.createElement("span");
      rail.className = "time-rail";
      rail.setAttribute("aria-hidden", "true");
      list.appendChild(rail);

      gsap.to(rail, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: list, start: "top 80%", end: "bottom 60%", scrub: 0.4 },
      });

      reveal(list.querySelectorAll(":scope > li"), { opacity: 0, x: 18 }, {
        trigger: list, duration: 0.55, stagger: 0.08, start: "top 85%",
      });
    });

    /* ---- appel final --------------------------------------------------- */

    var cta = document.querySelector(".cta");
    if (cta) {
      reveal([cta], { opacity: 0, y: 36 }, { trigger: cta, duration: 0.7 });
      reveal(cta.querySelectorAll(".btn"), { opacity: 0, y: 14 }, {
        trigger: cta, duration: 0.45, stagger: 0.08, start: "top 80%",
      });
    }
  });
})();

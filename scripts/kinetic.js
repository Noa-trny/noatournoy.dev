/* Les animations de défilement.
   Deux règles qui ne se négocient pas :
   1. uniquement transform et opacity — rien qui change une largeur, donc rien
      qui relayoute pendant qu'on lit ;
   2. une révélation déclenchée une seule fois passe par fromTo sans rendu
      immédiat — un déclencheur muet laisse le contenu à son état normal,
      jamais invisible. Une animation scrubbée fait l'inverse : sa tête de
      lecture est posée dès l'initialisation, et différer le rendu ferait
      sauter les éléments à leur état de départ en plein défilement.
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
        /* chaque mot monte derrière son propre masque : plus de chevauchement
           d'une ligne sur l'autre pendant la montée */
        var mask = document.createElement("span");
        mask.className = "w";
        var inner = document.createElement("span");
        inner.className = "wi";
        inner.textContent = chunk;
        mask.appendChild(inner);
        frag.appendChild(mask);
        out.push(inner);
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
        /* Toujours au bas du cadre. Avec un rendu differe, GSAP ne pose
           l'etat de depart qu'au moment ou le declencheur part : si ce
           moment arrive alors que l'element est deja visible, on le voit
           disparaitre d'un coup avant de reapparaitre. Declencher sous la
           ligne de flottaison met ce saut hors champ. */
        start: opts.start || "top bottom",
        once: true,
      };
      gsap.fromTo(list, from, to);
    }

    /* Sur une liste haute, declencher sur le conteneur fait jouer les
       dernieres lignes bien avant qu'on les atteigne. Chacune porte donc
       son propre declencheur. */
    function revelerChacun(sel, from, opts) {
      gsap.utils.toArray(sel).forEach(function (el) {
        var o = { trigger: el };
        for (var k in opts) if (opts[k] !== undefined) o[k] = opts[k];
        o.stagger = 0;
        reveal([el], from, o);
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

    /* ---- le ciel derive avec le defilement ----------------------------- */

    var heroLight = document.querySelector(".hero.light");
    if (heroLight) {
      ScrollTrigger.create({
        trigger: heroLight,
        start: "bottom 60px",
        onEnter: function () { document.body.classList.add("past-hero"); },
        onLeaveBack: function () { document.body.classList.remove("past-hero"); },
      });
    }

    /* ---- la vignette suit le curseur sur la liste --------------------- */

    var wrap = document.querySelector(".rows-wrap");
    var list = document.querySelector(".rows");
    var rows = list ? list.querySelectorAll(".row") : [];
    if (wrap && rows.length && window.matchMedia("(hover: hover)").matches) {
      var peek = document.createElement("div");
      peek.className = "peek";
      peek.setAttribute("aria-hidden", "true");
      wrap.appendChild(peek);
      gsap.set(peek, { yPercent: -50, scale: 0.96 });

      /* la vignette s'ancre à droite et glisse d'une ligne à l'autre */
      var slide = gsap.quickTo(peek, "top", {
        duration: 0.45,
        ease: "power3.out",
        unit: "px",
      });
      var shown = null;

      rows.forEach(function (row) {
        row.addEventListener("pointerenter", function () {
          if (shown === row) return;
          var first = shown === null;
          shown = row;
          var shot = row.dataset.shot;
          peek.innerHTML = shot
            ? '<img src="' + shot + '" alt="">'
            : '<div class="none"><b>' +
              row.querySelector(".row-title").textContent.trim() +
              "</b><span>" + (row.dataset.none || "") + "</span></div>";
          var centre = row.offsetTop + row.offsetHeight / 2;
          if (first) gsap.set(peek, { top: centre });
          else slide(centre);
          gsap.to(peek, { opacity: 1, scale: 1, yPercent: -50, duration: 0.35, ease: "power3.out" });
        });
      });

      wrap.addEventListener("pointerleave", function () {
        shown = null;
        gsap.to(peek, { opacity: 0, scale: 0.96, yPercent: -50, duration: 0.28, ease: "power2.out" });
      });
    }

    /* ---- en bref : le mot se remplit au défilement -------------------- */

    /* Le mot se remplit sur un seul rendu de texte : un dégradé découpé à la
       forme des lettres, dont on déplace la position. Superposer deux calques
       de texte revenait à mélanger deux anticrénelages sous-pixel — liseré
       coloré et scintillement.
       Les quatre colonnes étant à la même hauteur, elles partagent un seul
       déclencheur et se décalent de gauche à droite. */
    var bref = document.querySelector(".bref");
    if (bref) {
      /* Ici le rendu immédiat est voulu, contrairement aux révélations « once ».
         Sans lui, une colonne dont le tween n'a pas encore démarré garde son
         état naturel — pleine — puis saute d'un coup à son état de départ quand
         son tour arrive : le mot se vide brutalement en plein défilement.
         Un scrub place sa tête de lecture dès l'initialisation, donc l'état de
         départ n'est jamais celui qui reste affiché. */
      gsap.timeline({
        scrollTrigger: { trigger: bref, start: "top 86%", end: "top 42%", scrub: 0.5 },
      })
        .fromTo(bref.querySelectorAll(".bref-rule"), { scaleY: 0 },
          { scaleY: 1, ease: "none", stagger: 0.08 }, 0)
        .fromTo(bref.querySelectorAll(".bref-k"), { "--fill": "0%" },
          { "--fill": "100%", ease: "none", stagger: 0.12 }, 0.05)
        .fromTo(bref.querySelectorAll(".bref-d"), { opacity: 0, y: 14 },
          { opacity: 1, y: 0, ease: "power2.out", stagger: 0.1 }, 0.28);
    }

    /* ---- les lignes de la liste entrent une à une --------------------- */

    revelerChacun(".row", { opacity: 0, y: 26 }, { duration: 0.6 });
    revelerChacun(".ghost-row", { opacity: 0, x: -22 }, { duration: 0.6 });

    /* ---- premier écran ------------------------------------------------ */
    /* joue au chargement, sans déclencheur : from est sûr ici */

    var hero = document.querySelector(".hero");
    if (hero) {
      var h1 = hero.querySelector("h1");
      var words = splitWords(h1);
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(hero.querySelector(".label"), { opacity: 0, y: 14, duration: 0.5 })
        .from(words, { opacity: 0, yPercent: 135, duration: 0.9, stagger: 0.05 }, "-=0.25")
        .from(hero.querySelector(".hero-sub"), { opacity: 0, y: 18, duration: 0.6 }, "-=0.45")
        .from(hero.querySelector(".hero-meta"), { opacity: 0, y: 14, duration: 0.5 }, "-=0.4");

      /* le titre s'echappe ; l'accroche et la ligne de technos restent lisibles */
      gsap.to(h1, {
        yPercent: -14,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5 },
      });
    }

    /* ---- titres et étiquettes ----------------------------------------- */

    gsap.utils.toArray(".sec-title").forEach(function (title) {
      reveal(splitWords(title), { opacity: 0, yPercent: 135 }, {
        trigger: title, duration: 0.85, stagger: 0.04, ease: "power3.out",
      });
    });

    gsap.utils.toArray(".label").forEach(function (l) {
      if (l.closest(".hero")) return;
      reveal([l], { opacity: 0, x: -12 }, { trigger: l, duration: 0.5 });
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

      revelerChacun(list.querySelectorAll(":scope > li"), { opacity: 0, x: 18 },
        { duration: 0.55 });
    });

    /* ---- appel final --------------------------------------------------- */

    var cta = document.querySelector(".cta");
    if (cta) {
      reveal([cta], { opacity: 0, y: 36 }, { trigger: cta, duration: 0.7 });
      reveal(cta.querySelectorAll(".btn"), { opacity: 0, y: 14 }, {
        trigger: cta, duration: 0.45, stagger: 0.08,
      });
    }
  });
})();

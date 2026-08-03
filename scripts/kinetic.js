/* Le seul mécanisme de motion du site : le défilement pilote les axes variables.
   Position = état, vitesse = amplitude. Sans JavaScript, --vel reste à 0 et la
   composition est celle de la lecture. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches) return;

  var NORM = 55; // px par frame correspondant à l'amplitude maximale
  var RISE = 0.28; // montée
  var FALL = 0.075; // retour au repos, plus lent que la montée
  var last = window.scrollY;
  var vel = 0;
  var running = false;

  function frame() {
    var now = window.scrollY;
    var raw = Math.min(Math.abs(now - last) / NORM, 1);
    last = now;

    var k = raw > vel ? RISE : FALL;
    vel += (raw - vel) * k;

    if (vel < 0.001) {
      vel = 0;
      root.style.setProperty("--vel", "0");
      running = false;
      return;
    }

    root.style.setProperty("--vel", vel.toFixed(4));
    requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  window.addEventListener("scroll", start, { passive: true });

  reduce.addEventListener("change", function (e) {
    if (e.matches) {
      running = false;
      vel = 0;
      root.style.setProperty("--vel", "0");
    }
  });
})();

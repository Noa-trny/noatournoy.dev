/* Le nom en volume. Chaque lettre devient un bloc extrudé dont les faces latérales
   ne sont que des contours : un tracé technique, pas un relief décoratif.
   Au repos la rotation est nulle, les contours se projettent exactement derrière
   la face et la composition est celle du HTML. Sans JavaScript, rien ne change. */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var fam = document.querySelector(".wordmark .fam");
  if (!fam || !CSS.supports("transform-style", "preserve-3d")) return;

  // sur petit écran l'épaisseur se lit à peine, le coût de rendu se lit très bien
  var LAYERS = window.innerWidth < 640 ? 4 : 7;
  var text = fam.textContent;
  var frag = document.createDocumentFragment();

  for (var i = 0; i < text.length; i++) {
    var glyph = document.createElement("span");
    glyph.className = "glyph";
    glyph.style.setProperty("--i", i);

    var face = document.createElement("span");
    face.className = "face";
    face.textContent = text[i];
    glyph.appendChild(face);

    for (var l = 1; l <= LAYERS; l++) {
      var layer = document.createElement("span");
      layer.className = "layer";
      layer.setAttribute("aria-hidden", "true");
      layer.style.setProperty("--l", l);
      layer.textContent = text[i];
      glyph.appendChild(layer);
    }
    frag.appendChild(glyph);
  }

  fam.textContent = "";
  fam.appendChild(frag);
  fam.setAttribute("aria-label", text);
  fam.dataset.volume = "1";
})();

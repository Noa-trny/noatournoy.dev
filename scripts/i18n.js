/* Deux langues de plein droit. Le français est dans le HTML et se lit sans
   JavaScript ; l'anglais vit dans un dictionnaire de même origine. */
(function () {
  "use strict";

  var KEY = "nt-lang";
  var bar = document.querySelector("[data-lang-bar]");
  if (!bar) return;

  var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
  var fr = Object.create(null);
  var dict = null;
  var current = "fr";

  nodes.forEach(function (el) {
    var k = el.getAttribute("data-i18n");
    var attr = el.getAttribute("data-i18n-attr");
    fr[k] = attr ? el.getAttribute(attr) : el.innerHTML;
  });

  function paint(lang) {
    var src = lang === "en" && dict ? dict : fr;
    nodes.forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (!(k in src)) return;
      var attr = el.getAttribute("data-i18n-attr");
      if (attr) el.setAttribute(attr, src[k]);
      else el.innerHTML = src[k];
    });
    document.documentElement.lang = lang;
    if (src["doc.title"]) document.title = src["doc.title"];
    Array.prototype.forEach.call(bar.querySelectorAll("button"), function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    current = lang;
  }

  function set(lang) {
    if (lang === current) return;
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    if (lang === "fr" || dict) return paint(lang);

    fetch("/i18n/en.json", { cache: "force-cache" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (json) { dict = json; paint("en"); })
      .catch(function () {
        bar.setAttribute("data-error", "1");
      });
  }

  bar.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-lang]");
    if (b) set(b.dataset.lang);
  });

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (!saved && (navigator.language || "").slice(0, 2).toLowerCase() !== "fr") saved = "en";
  if (saved === "en") set("en");
})();

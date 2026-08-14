// Garde-fou de parite FR/EN.
//
// Le systeme de types garantit qu'une traduction ne peut pas MANQUER. Il ne
// garantit pas qu'elle a vraiment ete traduite : rien n'empeche de coller le
// francais dans la case anglaise, et c'est exactement ce qui etait arrive a
// l'ancien arbre statique (« Travaux » dans le pied de page anglais, cinq alt
// francais sur la fiche Eclosion).
//
// Ce script signale donc toute paire fr/en identique qui n'est pas dans la
// liste des exceptions legitimes. Il tourne au prebuild.
//
//   node --experimental-strip-types scripts/check-parity.mts

import { PROJECTS } from "../content/projects.ts";
import { ui } from "../content/ui.ts";
import { home } from "../content/home.ts";

/**
 * Les chaines qui DOIVENT etre identiques dans les deux langues : noms propres,
 * piles techniques, mots empruntes tels quels. Chacune est ici parce qu'on l'a
 * regardee, pas par defaut.
 */
const IDENTIQUE_PAR_NATURE = new Set([
  "Portfolio",
  "Menu",
  "Sections",
  "Contact",
  "Stack",
  "Certifications",
  "Noa Tournoy — Lille, France",
  "Lille, France",
  "Éclosion",
  "DataSentinel",
  "SupKonQuest",
  "Ludoria",
  "laying_grass",
  "Gamedex",
  "TypeScript · React",
  "Next.js · React Three Fiber · GLSL · WebAudio",
  "Looker · LookML · Python · React · BigQuery · Terraform",
  "Python · Pygame · Pillow · sockets",
  "React · TypeScript · Vite · Cypress",
  "2022 → 2026",

  // Les titres de document : nom propre du travail, tiret cadratin, nom de la
  // personne. Rien a traduire.
  "Éclosion — Noa Tournoy",
  "DataSentinel — Noa Tournoy",
  "SupKonQuest — Noa Tournoy",
  "Ludoria — Noa Tournoy",
  "laying_grass — Noa Tournoy",
  "Gamedex — Noa Tournoy",

  // Verifie dans en/index.html : ces trois-la sont volontairement identiques
  // dans la source anglaise. « Oct. » s'abrege pareil, « Master of Engineering »
  // est deja anglais, et « Baccalaureat » est le nom propre du diplome.
  "Oct. 2026",
  "Master of Engineering",
  "Baccalauréat",
  "CCNA",
]);

type Pb = { ou: string; valeur: string };
const pbs: Pb[] = [];

function check(ou: string, fr: unknown, en: unknown): void {
  if (typeof fr !== "string" || typeof en !== "string") return;
  if (fr !== en) return;
  if (IDENTIQUE_PAR_NATURE.has(fr.trim())) return;
  // Une chaine sans lettre (annee, nombre, ponctuation) ne se traduit pas.
  if (!/\p{L}{2,}/u.test(fr)) return;
  pbs.push({ ou, valeur: fr });
}

// --- content/ui.ts -----------------------------------------------------
for (const [cle, v] of Object.entries(ui)) {
  if (v && typeof v === "object" && "fr" in v && "en" in v) {
    check(`ui.${cle}`, (v as Record<string, unknown>).fr, (v as Record<string, unknown>).en);
  }
}

// --- content/projects.ts -----------------------------------------------
for (const p of PROJECTS) {
  check(`${p.slug}.blurb`, p.blurb.fr, p.blurb.en);
  if (p.vignette.kind === "mot") {
    check(`${p.slug}.vignette`, p.vignette.mot.fr, p.vignette.mot.en);
  } else {
    check(`${p.slug}.vignette.alt`, p.vignette.alt.fr, p.vignette.alt.en);
  }
  p.links.forEach((l, i) =>
    check(`${p.slug}.links[${i}]`, l.label.fr, l.label.en)
  );
  for (const champ of [
    "context", "stack", "lede", "metaTitle", "metaDescription", "ogDescription",
  ] as const) {
    check(`${p.slug}.copy.${champ}`, p.copy.fr[champ], p.copy.en[champ]);
  }
}

// --- content/home.ts ---------------------------------------------------
const { fr, en } = home;
for (const champ of [
  "heroCta", "heroCardLabel", "heroCardAlt", "mailLabel", "moreWork",
  "moreSkills", "contactLabel",
] as const) {
  check(`home.${champ}`, fr[champ], en[champ]);
}
for (const k of Object.keys(fr.labels) as (keyof typeof fr.labels)[]) {
  check(`home.labels.${k}`, fr.labels[k], en.labels[k]);
}
for (const k of Object.keys(fr.titles) as (keyof typeof fr.titles)[]) {
  check(`home.titles.${k}.before`, fr.titles[k].before, en.titles[k].before);
  check(`home.titles.${k}.em`, fr.titles[k].em, en.titles[k].em);
}
fr.bref.forEach((r, i) => {
  const e = en.bref[i];
  if (!e) return;
  check(`home.bref[${i}].k`, r.k, e.k);
  check(`home.bref[${i}].v`, r.v, e.v);
});
fr.time.forEach((m, i) => {
  const e = en.time[i];
  if (!e) return;
  check(`home.time[${i}].when`, m.when, e.when);
  check(`home.time[${i}].what`, m.what, e.what);
  check(`home.time[${i}].note`, m.note, e.note);
});
fr.certs.forEach((c, i) => {
  const e = en.certs[i];
  if (!e) return;
  check(`home.certs[${i}].note`, c.note, e.note);
  check(`home.certs[${i}].when`, c.when, e.when);
});
fr.contactTitle.forEach((l, i) =>
  check(`home.contactTitle[${i}]`, l, en.contactTitle[i])
);

// --- verdict -----------------------------------------------------------
if (pbs.length === 0) {
  console.log("parite FR/EN : aucune chaine anglaise identique a sa jumelle francaise");
  process.exit(0);
}

console.error(`parite FR/EN : ${pbs.length} chaine(s) non traduite(s)\n`);
for (const p of pbs) console.error(`  ${p.ou}\n    « ${p.valeur} »`);
console.error(
  "\nSi l'une de ces chaines doit legitimement etre identique dans les deux\n" +
    "langues, ajoute-la a IDENTIQUE_PAR_NATURE dans ce fichier."
);
process.exit(1);

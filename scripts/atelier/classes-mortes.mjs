// LES CLASSES QUI NE STYLENT RIEN.
//
//   npm run build && node scripts/atelier/classes-mortes.mjs
//
// Il existe parce que j'ai cherche ces classes A LA MAIN une premiere fois, en
// devinant leurs noms — et j'en ai trouve deux sur douze. `kv` et `prose`
// etaient corrigees pendant que `contact-line` et `elsewhere` laissaient le
// bloc principal de la page contact en texte nu. Deviner une liste, c'est
// s'arreter des qu'on est content.
//
// LA METHODE EST UNE COMPARAISON, PAS UNE RECHERCHE. Tailwind ne compile que ce
// qu'il reconnait : une classe presente dans le balisage mais absente de la
// feuille produite ne peut, par construction, rien styler. On extrait donc tous
// les jetons des `className`, on les cherche dans le CSS compile, et ce qui
// manque est la reponse complete — pas un echantillon.
//
// DEUX PIEGES, QUI ONT TOUS DEUX FAIT CRIER LA PREMIERE VERSION.
//
// 1. Tailwind ECHAPPE la ponctuation de ses selecteurs : `sm:px-8` s'ecrit
//    `.sm\:px-8` dans la feuille. Chercher le jeton tel quel ne trouvait donc
//    aucune classe a variante, et le controle denonçait cent trente-six pannes
//    imaginaires. On retire les antislashs du CSS avant de comparer, ce qui met
//    les deux cotes dans la meme forme.
//
// 2. Un `className={...}` contient du JAVASCRIPT — ternaires, interpolations,
//    guillemets. Decoupe sur les espaces, il livrait `?`, `}` et `&&` comme
//    s'il s'agissait de classes. On retire donc les expressions `${…}` et l'on
//    ecarte tout jeton portant un caractere qui ne peut pas vivre dans un
//    attribut `class`.
//
// Ce que ce controle NE dit pas : qu'une page est belle. Une classe peut exister
// et mal habiller. Il ferme une classe de pannes, celle du balisage orphelin
// laisse derriere une feuille de style retiree.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SOURCES = ["app", "components", "scene"];
const CSS = ".next/static/chunks";

function fichiers(dossier, acc = []) {
  for (const e of readdirSync(dossier, { withFileTypes: true })) {
    const p = join(dossier, e.name);
    if (e.isDirectory()) {
      if (!/node_modules|\.next|\.git/.test(p)) fichiers(p, acc);
    } else if (/\.tsx?$/.test(e.name)) acc.push(p);
  }
  return acc;
}

/** Un jeton plausible : ce qu'un attribut `class` peut reellement contenir. */
const plausible = (c) =>
  c.length > 1 && !/["'`{}?&|=<>()!;]/.test(c) && !c.startsWith("[") && /^[a-zA-Z.-]/.test(c);

const jetons = new Map();
for (const f of SOURCES.flatMap((d) => fichiers(d))) {
  const texte = readFileSync(f, "utf8");
  for (const m of texte.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
    // Les interpolations partent AVANT le decoupage : leur contenu est du code,
    // pas des classes, et les classes qu'elles produisent sont litterales a
    // l'interieur des chaines qu'on lit par ailleurs.
    const brut = (m[1] || m[2] || "").replace(/\$\{[^}]*\}/g, " ");
    for (const c of brut.split(/\s+/)) {
      if (!plausible(c)) continue;
      if (!jetons.has(c)) jetons.set(c, new Set());
      jetons.get(c).add(f);
    }
  }
}

let css;
try {
  css = readdirSync(CSS)
    .filter((n) => n.endsWith(".css"))
    .map((n) => readFileSync(join(CSS, n), "utf8"))
    .join("\n")
    // Les deux cotes dans la meme forme : voir le piege 1.
    .replace(/\\/g, "");
} catch {
  console.error(`Aucune feuille compilee dans ${CSS} — lancer 'npm run build' d'abord.`);
  process.exit(2);
}

const echapper = (s) => s.replace(/[.*+?^${}()|[\]/]/g, "\\$&");
const mortes = [...jetons.keys()].filter(
  (c) => !new RegExp("\\." + echapper(c) + "(?![\\w-])").test(css),
);

console.log(`classes distinctes dans le balisage : ${jetons.size}`);
if (!mortes.length) {
  console.log("Aucune classe morte : tout ce qui est ecrit style quelque chose.");
  process.exit(0);
}
console.log(`SANS AUCUNE REGLE COMPILEE : ${mortes.length}\n`);
for (const c of mortes.sort()) {
  const ou = [...jetons.get(c)].map((f) => f.replace(/\\/g, "/")).join(", ");
  console.log(`  .${c.padEnd(14)} ${ou}`);
}
process.exit(1);

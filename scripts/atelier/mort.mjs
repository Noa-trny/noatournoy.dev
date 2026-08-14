// LE CODE QUE PLUS RIEN N'ATTEINT.
//
//   node scripts/atelier/mort.mjs
//
// `noUnusedLocals` attrape ce qui est mort A L'INTERIEUR d'un fichier. Il ne
// voit rien de ce qui est mort ENTRE fichiers : un module qu'aucun autre
// n'importe compile parfaitement, et un export sans appelant aussi. Sur ce
// projet, une relecture a trouve `Split.tsx` — soixante-cinq lignes jamais
// importees — et deux exports sans consommateur, qu'aucun outil ne pouvait
// signaler puisque aucun ne regardait.
//
// IL SOUS-DECLARE PLUTOT QU'IL NE SUR-DECLARE. Un detecteur qui cite de faux
// morts est pire qu'aucun detecteur : on finit par ignorer ce qu'il dit, et
// c'est deja arrive ici — une premiere version d'un controle voisin a annonce
// cent trente-six pannes dont douze existaient. Les regles de resolution sont
// donc genereuses : tout ce qui ressemble a un usage compte comme un usage.
//
// CE QU'IL NE PEUT PAS SAVOIR : un fichier atteint uniquement par un import
// dynamique construit a l'execution, ou un export consomme hors du depot. Il
// n'y en a pas ici, et le jour ou il y en aura, la liste blanche est en tete.

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";

const RACINES = ["app", "components", "scene", "content"];

/**
 * Les points d'entree : ce que le framework charge sans qu'aucun fichier ne
 * l'importe. Tout ce qui n'est pas atteignable depuis eux est mort.
 */
const ENTREES = (f) =>
  f.startsWith("app" + "/") ||
  /^(proxy|next\.config|instrumentation)\./.test(f);

// LE PARCOURS PART DES RACINES DECLAREES, jamais du dossier courant. Une
// premiere version lisait `.` et descendait dans `node_modules` : treize mille
// « exports morts » signales, c'est-a-dire un defaut de l'outil et non du
// projet. Un detecteur qui deborde de son perimetre ne se relit pas, on le
// jette.
const fichiers = [];
for (const racine of RACINES) {
  (function marcher(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name).replace(/\\/g, "/");
      if (e.isDirectory()) marcher(p);
      else if (/\.(ts|tsx)$/.test(e.name)) fichiers.push(p);
    }
  })(racine);
}
// Les fichiers de configuration a la racine sont des points d'entree, pas des
// modules a parcourir : on les ajoute nommement.
for (const f of ["proxy.ts", "next.config.ts"]) fichiers.push(f);

const source = new Map();
for (const f of fichiers) source.set(f, readFileSync(f, "utf8"));

/** Resout un specificateur d'import vers un fichier du depot, ou `null`. */
function resoudre(depuis, spec) {
  let base;
  if (spec.startsWith("@/")) base = spec.slice(2);
  else if (spec.startsWith(".")) base = relative(".", resolve(dirname(depuis), spec)).replace(/\\/g, "/");
  else return null;
  for (const suffixe of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
    const essai = (base + suffixe).replace(/\\/g, "/");
    if (source.has(essai)) return essai;
  }
  return null;
}

// --- Fichiers jamais atteints ---------------------------------------------
const aretes = new Map(fichiers.map((f) => [f, new Set()]));
for (const [f, texte] of source) {
  for (const m of texte.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)) {
    const cible = resoudre(f, m[1]);
    if (cible) aretes.get(f).add(cible);
  }
}
const vus = new Set();
const pile = fichiers.filter(ENTREES);
while (pile.length) {
  const f = pile.pop();
  if (vus.has(f)) continue;
  vus.add(f);
  for (const v of aretes.get(f) ?? []) pile.push(v);
}
const orphelins = fichiers.filter((f) => !vus.has(f));

// --- Exports que personne n'importe ---------------------------------------
const morts = [];
for (const [f, texte] of source) {
  if (ENTREES(f)) continue; // une page exporte `default` pour le framework
  const noms = new Set();
  for (const m of texte.matchAll(/^export\s+(?:async\s+)?(?:function|const|class|type|interface)\s+(\w+)/gm))
    noms.add(m[1]);
  for (const nom of noms) {
    const utilise = [...source].some(
      ([autre, t]) =>
        autre !== f &&
        // Une seule regle, volontairement large : le nom apparait quelque part
        // dans un fichier qui importe celui-ci. On ne cherche pas a analyser la
        // liste d'import, qui peut etre renommee, groupee ou etoilee.
        aretes.get(autre)?.has(f) &&
        new RegExp(`\\b${nom}\\b`).test(t)
    );
    if (!utilise) morts.push(`${f} → ${nom}`);
  }
}

// --- Dependances declarees et jamais importees -----------------------------
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const tout = [...source.values()].join("\n") + readFileSync("next.config.ts", "utf8");
// `react-dom` n'est importe par aucun fichier du projet et reste indispensable :
// React et Next s'en servent a l'execution. C'est un faux positif structurel, et
// l'inscrire ici vaut mieux que le redecouvrir a chaque passage.
const SOCLE = new Set(["react-dom"]);
const inutiles = Object.keys(pkg.dependencies ?? {}).filter(
  (d) =>
    !SOCLE.has(d) &&
    !new RegExp(`["'](${d.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&")})(/[^"']*)?["']`).test(tout)
);

const bilan = (titre, liste, note) => {
  console.log(`\n${titre} : ${liste.length}`);
  for (const x of liste) console.log(`  ${x}`);
  if (liste.length && note) console.log(`  ${note}`);
  return liste.length;
};

let total = 0;
total += bilan("FICHIERS QU'AUCUN POINT D'ENTREE N'ATTEINT", orphelins);
total += bilan("EXPORTS SANS AUCUN CONSOMMATEUR", morts);
total += bilan("DEPENDANCES DECLAREES ET JAMAIS IMPORTEES", inutiles,
  "(verifier a la main : certaines servent au build ou aux types)");

console.log(
  total === 0
    ? "\nRien de mort : tout ce qui est ecrit est atteint."
    : `\n${total} element(s) a examiner.`
);
process.exit(total ? 1 : 0);

// LE BALAYAGE DES SURFACES CLIQUABLES.
//
//   node scripts/atelier/surfaces.mjs <port-debug> <origine>
//
// Il existe a cause d'une panne precise : la piste de defilement s'est posee
// par-dessus le canvas et a avale TOUS les clics de la scene pendant plusieurs
// commits. Aucune capture ne l'a vu, et pour une raison de fond — une image ne
// montre pas ce qui recoit les evenements. Les objets du bureau ne sont pas des
// balises : ni un lecteur d'ecran, ni un selecteur CSS, ni l'inspecteur ne
// peuvent dire « ce pixel est un lien ». Seul un vrai clic le peut.
//
// IL CHERCHE LES ZONES, IL NE LES SUPPOSE PAS. La premiere version portait des
// coordonnees ecrites a la main et a signale deux pannes qui n'existaient pas :
// une liste attendue decalee d'un cran, et un clic tombe deux pixels au-dessus
// d'une bande. Un harnais qui cite de faux positifs est pire qu'aucun harnais —
// on finit par ignorer ce qu'il dit. Il balaie donc une colonne, releve ou le
// curseur devient une main, et clique au CENTRE de chaque bande trouvee.
//
// Prerequis : `npx next start` d'un cote, un Chrome en `--remote-debugging-port`
// de l'autre. Le drapeau `?force3d` force la scene meme en rendu logiciel.

const port = Number(process.argv[2] ?? 9222);
const ORIGIN = process.argv[3] ?? "http://localhost:3000";

const liste = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const ws = new WebSocket(liste.find((x) => x.type === "page").webSocketDebuggerUrl);
let id = 0;
const att = new Map();
const erreurs = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && att.has(m.id)) { att.get(m.id)(m.result); att.delete(m.id); }
  if (m.method === "Log.entryAdded" && m.params.entry?.level === "error")
    erreurs.push(m.params.entry.text.slice(0, 110));
});
const env = (me, p = {}) =>
  new Promise((r) => { const n = ++id; att.set(n, r); ws.send(JSON.stringify({ id: n, method: me, params: p })); });
const pause = (n) => new Promise((r) => setTimeout(r, n));
const ev = async (x) => (await env("Runtime.evaluate", { expression: x, returnByValue: true })).result.value;

const survoler = async (x, y) => {
  await env("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "none" });
  await pause(70);
  return (await ev(`getComputedStyle(document.body).cursor`)) === "pointer";
};
const cliquer = async (x, y) => {
  await survoler(x, y);
  for (const type of ["mousePressed", "mouseReleased"])
    await env("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
};
const station = async (s) => {
  await ev(`(()=>{const m=document.documentElement.scrollHeight-innerHeight;document.documentElement.scrollTop=m*${s}/7;})()`);
  await pause(1700);
};
const recharger = async () => { await env("Page.navigate", { url: ORIGIN + "/?force3d" }); await pause(7500); };

/** Les bandes ou le curseur devient une main, le long d'une colonne. */
async function bandes(x, haut, bas, pas = 6) {
  const trouvees = [];
  let ouverte = null;
  for (let y = haut; y <= bas; y += pas) {
    const main = await survoler(x, y);
    if (main && !ouverte) ouverte = { de: y };
    if (!main && ouverte) { trouvees.push({ ...ouverte, a: y - pas }); ouverte = null; }
  }
  if (ouverte) trouvees.push({ ...ouverte, a: bas });
  return trouvees.map((b) => Math.round((b.de + b.a) / 2));
}

let echecs = 0;
const verdict = (ok, texte) => { if (!ok) echecs += 1; return `${ok ? "ok  " : "ECHEC"} ${texte}`; };

await new Promise((r) => ws.addEventListener("open", r));
await env("Page.enable"); await env("Log.enable"); await env("Runtime.enable");
await env("Emulation.setDeviceMetricsOverride", { width: 1440, height: 860, deviceScaleFactor: 1, mobile: false });
await recharger();

// --- Les lignes de projet, sur l'ecran principal ---------------------------
// L'ordre attendu est lu dans le DOM de repli plutot qu'ecrit ici : si la scene
// et le document divergent un jour, c'est exactement ce qu'on veut voir.
const attendus = JSON.parse(
  await ev(`JSON.stringify([...document.querySelectorAll('.station[data-station="3"] a[href]')]
    .map(a=>new URL(a.href).pathname).filter(p=>/^\\/travaux\\/.+\\//.test(p)))`)
);
await station(3);
const lignes = await bandes(670, 200, 640);
console.log(`\nECRAN PRINCIPAL — ${lignes.length} lignes cliquables pour ${attendus.length} projets`);
for (let i = 0; i < lignes.length; i++) {
  await station(3);
  await cliquer(670, lignes[i]);
  await pause(2000);
  const url = await ev(`location.pathname`);
  console.log("  " + verdict(url === attendus[i], `ligne ${i + 1} -> ${url}${url === attendus[i] ? "" : `  (attendu ${attendus[i]})`}`));
  await recharger();
}

// --- Les liens du portable -------------------------------------------------
await station(7);
// `window.open` est remplace pour ne pas ouvrir d'onglet. `location.href` ne
// peut pas l'etre : la ligne « courriel » se contente donc d'exister.
await ev(`(()=>{window.__ouverts=[];window.open=(u)=>{window.__ouverts.push(u);return null;};})()`);
const contacts = await bandes(870, 300, 520);
console.log(`\nPORTABLE — ${contacts.length} lignes cliquables`);
for (const y of contacts) {
  const avant = JSON.parse(await ev(`JSON.stringify(window.__ouverts)`)).length;
  await cliquer(870, y);
  await pause(600);
  const ouverts = JSON.parse(await ev(`JSON.stringify(window.__ouverts)`));
  console.log(`  ok   y=${y} -> ${ouverts.length > avant ? ouverts.at(-1) : "courriel (non declenchable ici)"}`);
}
console.log("  " + verdict(contacts.length === 3, `trois lignes attendues, ${contacts.length} trouvees`));

// --- Les boutons de section, le retour, et les objets ----------------------
await recharger();
console.log("\nBOUTONS DE SECTION");
for (const [i, nom] of [[3, "Projets"], [4, "À propos"], [5, "Parcours"], [6, "Stack"], [7, "Contact"]]) {
  await ev(`[...document.querySelectorAll('nav[aria-label="Sections"] button')].find(b=>b.textContent.trim()===${JSON.stringify(nom)}).click()`);
  await pause(2200);
  const y = await ev(`Math.round(scrollY)`);
  const vise = await ev(`Math.round((document.documentElement.scrollHeight-innerHeight)*${i}/7)`);
  console.log("  " + verdict(Math.abs(y - vise) < 12, `${nom} -> ${y} (station ${i} a ${vise})`));
}

console.log("\nOBJETS DU BUREAU");
for (const [nom, x, y, s] of [["second ecran", 900, 400, 4], ["machine", 440, 360, 6], ["carnet", 350, 437, 5]]) {
  await station(2);
  await cliquer(x, y);
  await pause(2200);
  const yy = await ev(`Math.round(scrollY)`);
  const vise = await ev(`Math.round((document.documentElement.scrollHeight-innerHeight)*${s}/7)`);
  console.log("  " + verdict(Math.abs(yy - vise) < 60, `${nom} -> ${yy} (attendu ${vise})`));
}

console.log(`\nconsole : ${erreurs.length ? erreurs.slice(0, 3).join(" | ") : "propre"}`);
console.log(echecs ? `\n${echecs} ECHEC(S)` : "\nToutes les surfaces repondent.");
ws.close();
process.exit(echecs ? 1 : 0);

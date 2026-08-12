// Verifie les seuils du voyage sans navigateur : ce sont des nombres derives
// d'une courbe, donc ils se controlent en les recalculant.
import { CHEMIN, VISEE, GLASS_T, NIVEAUX, dollyA, HAUTEUR_CADREE, FOV_BASE } from "../../scene/camera/path.ts";

const T_TRAVAUX = Math.max(0, GLASS_T - 0.26) * 0.45;
const SEUILS = { transit: Math.max(0, GLASS_T - 0.26), dedans: Math.min(1, GLASS_T + 0.02) };
const phasePour = (p: number) =>
  p >= SEUILS.dedans ? "dedans" : p >= SEUILS.transit ? "transit" : "approche";

console.log(`GLASS_T          ${GLASS_T.toFixed(4)}`);
console.log(`SEUILS.transit   ${SEUILS.transit.toFixed(4)}`);
console.log(`SEUILS.dedans    ${SEUILS.dedans.toFixed(4)}`);
console.log(`part « dedans »  ${((1 - SEUILS.dedans) * 100).toFixed(1)} % du defilement`);

console.log("\nprogression -> phase, position, champ demande :");
for (const t of [0, 0.2, 0.4, 0.55, 0.7, GLASS_T - 0.01, GLASS_T, GLASS_T + 0.05, 0.95, 1]) {
  const p = CHEMIN.getPointAt(Math.min(1, Math.max(0, t)));
  const v = VISEE.getPointAt(Math.min(1, Math.max(0, t)));
  const d = Math.max(p.distanceTo(v), 0.5);
  const fige = 2 * Math.atan(HAUTEUR_CADREE / (2 * d)) * (180 / Math.PI);
  const fov = Math.min(46, Math.max(20, FOV_BASE + (fige - FOV_BASE) * dollyA(t)));
  console.log(
    `  t=${t.toFixed(3)}  ${phasePour(t).padEnd(8)}  ` +
    `(${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)})  ` +
    `d=${d.toFixed(2)}  champ demande ${fige.toFixed(0)}° -> retenu ${fov.toFixed(1)}°`
  );
}
const franchi = CHEMIN.getPointAt(GLASS_T);
console.log(`\nau franchissement : z=${franchi.z.toFixed(2)} (baie mesuree a -2.95), ` +
  `x=${franchi.x.toFixed(2)} (baie mesuree a -0.15), y=${franchi.y.toFixed(2)} ` +
  `(plancher a ${NIVEAUX.sejour})`);

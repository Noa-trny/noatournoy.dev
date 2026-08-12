// Echantillonne la trajectoire et l'ecrit en JSON, pour que Blender puisse la
// controler contre la geometrie reelle. Les deux mondes ne parlent pas la meme
// langue : la courbe vit en TypeScript, les murs vivent dans un .glb.
import { CHEMIN, T_VERRIERE, FRANCHISSEMENTS } from "../../scene/camera/path.ts";
import { writeFileSync } from "node:fs";
const N = 160;
const points = [];
for (let i = 0; i <= N; i++) {
  const t = i / N;
  const p = CHEMIN.getPointAt(t);
  points.push({ t: Number(t.toFixed(4)), x: p.x, y: p.y, z: p.z });
}
writeFileSync(process.argv[2], JSON.stringify({ glassT: T_VERRIERE, franchissements: FRANCHISSEMENTS, points }));
console.log(`${points.length} points ecrits`);

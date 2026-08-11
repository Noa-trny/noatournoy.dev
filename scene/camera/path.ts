import * as THREE from "three";

// La trajectoire de la camera.
//
// Deux courbes, pas une : la position et le point vise. Les decoupler permet de
// regarder en arriere tout en avançant, et de ralentir le panoramique sans
// ralentir le deplacement.
//
// Les coordonnees ont un sens parce que le modele a ete recentre : le vitrage
// est a l'origine, le plancher a Y = 0, la camera arrive des Z positifs.

function courbe(points: [number, number, number][]) {
  const c = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(...p)),
    false,
    // `centripetal` plutot que la parametrisation par defaut : elle garantit
    // l'absence de rebroussement et d'auto-intersection sur des points espaces
    // irregulierement — et des points places a la main le sont toujours.
    "centripetal"
  );
  // Par defaut 200 : trop grossier pour une table de longueurs d'arc sur 50 m.
  c.arcLengthDivisions = 1000;
  return c;
}

/** Le trajet : la rue, la baie, l'interieur. */
export const CHEMIN = courbe([
  [  0.0, 1.75,  42.0 ],  // 0.00  la facade tient dans le cadre
  [ -2.5, 1.70,  26.0 ],
  [ -1.0, 1.68,  13.0 ],
  [  0.0, 1.66,   5.5 ],  // ~0.30 la baie grandit
  [  0.0, 1.64,   0.0 ],  // ~0.34 DANS le plan du vitrage
  [  0.4, 1.62,  -4.5 ],
  [  1.2, 1.60,  -8.5 ],
  [  0.8, 1.58, -11.5 ],  // 1.00  le fond de la maison
]);

/** Ce que la camera regarde. Plus lisse que le trajet lui-meme. */
export const VISEE = courbe([
  [  0.0, 2.20,  10.0 ],
  [  0.0, 2.00,  -2.0 ],
  [  0.5, 1.75,  -9.0 ],
  [  0.9, 1.60, -16.0 ],
]);

export const FOV_BASE = 40;

/**
 * L'extension verticale du monde visible a la distance de depart.
 *
 * Le dolly zoom consiste a maintenir `h = 2 d tan(fov/2)` constant pendant que
 * `d` change. On fige donc ici le cadrage initial, et la focale s'ajuste
 * ensuite pour le conserver.
 */
export const HAUTEUR_CADREE =
  2 * 40.0 * Math.tan(THREE.MathUtils.degToRad(FOV_BASE) / 2);

/**
 * L'enveloppe du vertigo : nulle aux deux bouts, pleine a la traversee.
 *
 * Un dolly zoom tenu a fond sur 50 m donne la nausee. Il monte a l'approche de
 * la baie et retombe une fois dedans, si bien que l'effet ponctue le
 * franchissement au lieu de le noyer.
 */
export const dollyA = (t: number) =>
  THREE.MathUtils.smoothstep(t, 0.10, 0.32) *
  (1 - THREE.MathUtils.smoothstep(t, 0.36, 0.55));

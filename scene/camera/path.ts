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
  // A 42 m la maison occupait un timbre-poste au bas du cadre : elle ne fait
  // que 6,5 m de haut, et le ciel prenait les trois quarts de l'image.
  [  0.0, 1.90,  24.0 ],  // 0.00  la facade tient le cadre
  [ -1.6, 1.84,  16.0 ],
  [ -0.6, 1.78,   9.0 ],
  [  0.0, 1.74,   4.0 ],  // ~0.28 la baie grandit
  [  0.0, 1.72,   0.0 ],  // ~0.34 DANS le plan du vitrage
  [  0.4, 1.70,  -4.5 ],
  [  1.0, 1.68,  -8.5 ],
  [  0.8, 1.66, -11.5 ],  // 1.00  le fond de la maison
]);

/** Ce que la camera regarde. Plus lisse que le trajet lui-meme. */
export const VISEE = courbe([
  [  0.0, 2.05,   4.0 ],
  [  0.0, 1.95,  -3.0 ],
  [  0.5, 1.78,  -9.0 ],
  [  0.9, 1.66, -16.0 ],
]);

// 30 et non 40 : a 24 m une maison de 3,5 m de haut ne remplit qu'un cinquieme
// du cadre en 40 degres, et le ciel prend le reste. Une focale plus longue
// resserre, aplatit la perspective — ce qui sert le brutalisme — et rend le
// dolly zoom plus lisible, l'ecart entre les deux focales etant plus grand.
export const FOV_BASE = 30;

/**
 * L'extension verticale du monde visible a la distance de depart.
 *
 * Le dolly zoom consiste a maintenir `h = 2 d tan(fov/2)` constant pendant que
 * `d` change. On fige donc ici le cadrage initial, et la focale s'ajuste
 * ensuite pour le conserver.
 */
export const HAUTEUR_CADREE =
  2 * 24.0 * Math.tan(THREE.MathUtils.degToRad(FOV_BASE) / 2);

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

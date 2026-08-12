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

/**
 * Le trajet : le parvis, la baie, l'interieur.
 *
 * L'approche occupe l'essentiel du parcours, parce que c'est elle qui porte les
 * six vitrines. L'interieur ne fait que 8 m — mesure au lancer de rayon — donc
 * il forme une coda courte, pas une seconde moitie.
 *
 * Le leger louvoiement lateral n'est pas decoratif : il fait varier l'angle
 * sous lequel chaque vitrine se presente, la ou une ligne droite les donnerait
 * toutes de trois quarts identiques.
 */
export const CHEMIN = courbe([
  [  0.0, 1.90,  26.0 ],  // 0.00  la facade tient le cadre, les vitrines devant
  [  0.8, 1.87,  20.0 ],
  [ -0.9, 1.84,  15.0 ],
  [  0.9, 1.80,  10.0 ],
  [ -0.5, 1.76,   5.5 ],
  [  0.0, 1.74,   2.0 ],
  [  0.0, 1.72,   0.0 ],  //       DANS le plan du vitrage
  [  0.3, 1.70,  -2.0 ],
  [  0.6, 1.68,  -3.6 ],  // 1.00  le fond de la piece
]);

/** Ce que la camera regarde. Plus lisse que le trajet lui-meme. */
export const VISEE = courbe([
  [  0.0, 2.05,  12.0 ],
  [  0.0, 1.95,   2.0 ],
  [  0.4, 1.80,  -4.0 ],
  [  0.8, 1.70, -10.0 ],
]);

/**
 * L'abscisse a laquelle la camera est dans le plan du vitrage.
 *
 * CALCULEE, pas ecrite a la main. Avec `getPointAt` la progression est uniforme
 * en DISTANCE : deplacer un point de controle change donc l'abscisse du
 * franchissement, et un nombre fige se serait desynchronise en silence a la
 * premiere retouche. On cherche simplement ou la courbe traverse Z = 0.
 */
export const GLASS_T = (() => {
  const N = 400;
  let precedent = CHEMIN.getPointAt(0).z;
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    const z = CHEMIN.getPointAt(t).z;
    if (precedent > 0 && z <= 0) {
      // interpolation lineaire entre les deux echantillons
      const f = precedent / (precedent - z);
      return (i - 1 + f) / N;
    }
    precedent = z;
  }
  return 0.85;
})();

/** Largeur de la bande de fondu du vitrage, en fraction de progression. */
export const GLASS_BANDE = 0.045;

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
  THREE.MathUtils.smoothstep(t, GLASS_T - 0.30, GLASS_T - 0.04) *
  (1 - THREE.MathUtils.smoothstep(t, GLASS_T + 0.02, GLASS_T + 0.12));

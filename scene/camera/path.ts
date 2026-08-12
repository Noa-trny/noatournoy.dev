import * as THREE from "three";

// La trajectoire de la camera.
//
// Deux courbes, pas une : la position et le point vise. Les decoupler permet de
// regarder en arriere tout en avançant, et de ralentir le panoramique sans
// ralentir le deplacement.
//
// Les coordonnees ont un sens parce que le modele a ete recentre et RELEVE :
// tous les nombres de ce fichier viennent de `scripts/blender/reperer.py`,
// execute sur le modele reellement servi, et non d'un placement a vue.

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
 * LA BAIE, telle que le modele la place.
 *
 * Ce nombre n'est pas un reglage : c'est le centre de la plus grande surface de
 * verre verticale du fichier, 2,98 x 2,45 m, mesure par `reperer.py`. Le trajet
 * precedent traversait le plan Z = 0 parce que le modele precedent y avait sa
 * baie ; le meme choix ici ferait passer la camera dans du beton plein, ce qui
 * est exactement le defaut qu'on avait a l'ecran.
 */
export const BAIE = { x: -0.15, y: 1.27, z: -2.95 } as const;

/**
 * Les niveaux, releves sur les grandes surfaces horizontales du modele.
 *
 * La villa s'etage, la ou le pavillon etait de plain-pied. C'est le changement
 * qui a le plus d'effet sur le recit : le trajet monte au lieu d'avancer.
 */
export const NIVEAUX = {
  garage: -2.5, // le parvis bas, ou la voiture est garee
  sejour: 0.0, // le plancher de reference
  etage: 2.5,
} as const;

/** Hauteur d'oeil au-dessus d'un plancher. */
const OEIL = 1.6;

/**
 * Le trajet : le parvis bas, l'escalier, la baie, le sejour.
 *
 * LE MOUVEMENT A CHANGE DE NATURE. Sur le pavillon la camera avançait tout
 * droit sur un seul niveau ; ici elle MONTE. La villa presente au premier plan
 * son garage et la voiture, puis un escalier monumental jusqu'a la porte, puis
 * la baie pleine hauteur — c'est-a-dire, gratuitement, la progression que le
 * recit demandait et que la maison precedente ne savait pas donner.
 *
 * LE RECUL DE DEPART EST CALCULE, pas recopie. J'ai d'abord repris tel quel le
 * point de vue du rendu d'orientation, qui cadrait parfaitement la villa — et
 * la scene a rendu un gros plan sur la porte de garage. Un rendu Blender en
 * 30 mm ouvre environ 61 degres a l'horizontale ; la scene travaille a 30
 * degres de champ VERTICAL. Les deux « 30 » n'ont rien a voir.
 *
 * La villa fait 8,5 m du bas du garage au haut de l'attique. Il faut donc
 * `d >= 8,5 / (2 tan 15°)`, soit 16 m au strict minimum et une trentaine pour
 * qu'elle respire. Le trajet part de 34 m.
 */
export const CHEMIN = courbe([
  [0.9, NIVEAUX.garage + OEIL + 0.9, 34.0], // 0.00  la villa entiere de loin
  [1.3, NIVEAUX.garage + OEIL + 0.5, 27.0],
  [0.7, NIVEAUX.garage + OEIL + 0.2, 20.0], // ~0.25 la file de vitrines defile
  [-0.1, NIVEAUX.garage + OEIL, 13.5],
  [-0.5, NIVEAUX.garage + OEIL, 8.6], // ~0.45 on longe la voiture et le garage
  [-0.3, NIVEAUX.garage + OEIL + 1.6, 5.0], // ~0.58 on monte avec les marches
  [-0.15, NIVEAUX.sejour + OEIL, 1.4], // ~0.72 sur le palier, face a la baie
  [BAIE.x, NIVEAUX.sejour + OEIL, BAIE.z], //      DANS le plan du vitrage
  [0.5, NIVEAUX.sejour + OEIL, -5.0],
  [2.4, NIVEAUX.sejour + OEIL - 0.05, -6.2], // 1.00  le sejour s'ouvre en largeur
]);

/**
 * Ce que la camera regarde. Plus lisse que le trajet lui-meme.
 *
 * La visee de depart est BASSE — sous la camera — pour tenir la voiture et le
 * garage dans le cadre pendant l'approche. Viser l'horizon donnait un tiers
 * d'image de ciel vide sur le modele precedent ; ici la villa monte, donc le
 * probleme ne se pose que si on l'invite.
 */
export const VISEE = courbe([
  [0.0, 1.1, 7.0],
  [-0.15, 1.3, -1.0],
  [BAIE.x, 1.5, -6.0],
  // La fin regarde vers le grand cote du sejour : 12,60 m de degagement mesure,
  // mais le long de X — PERPENDICULAIREMENT a la marche. L'espace s'ouvre
  // lateralement au lieu de se prolonger, et la camera doit donc tourner.
  [5.4, 1.4, -6.6],
]);

/**
 * L'abscisse a laquelle la camera est dans le plan du vitrage.
 *
 * CALCULEE, pas ecrite a la main. Avec `getPointAt` la progression est uniforme
 * en DISTANCE : deplacer un point de controle change donc l'abscisse du
 * franchissement, et un nombre fige se serait desynchronise en silence a la
 * premiere retouche. On cherche ou la courbe traverse le plan de la baie —
 * `BAIE.z` et non zero, la baie de ce modele n'etant pas a l'origine.
 */
export const GLASS_T = (() => {
  const N = 400;
  let precedent = CHEMIN.getPointAt(0).z;
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    const z = CHEMIN.getPointAt(t).z;
    if (precedent > BAIE.z && z <= BAIE.z) {
      // interpolation lineaire entre les deux echantillons
      const f = (precedent - BAIE.z) / (precedent - z);
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
 *
 * La distance de reference suit le premier point du trajet : elle etait ecrite
 * en dur a 24 m pour le pavillon, ce qui aurait fausse tout le vertigo des lors
 * que le depart passait a 20 m.
 */
export const DEPART = CHEMIN.getPointAt(0);
export const HAUTEUR_CADREE =
  2 * DEPART.distanceTo(VISEE.getPointAt(0)) *
  Math.tan(THREE.MathUtils.degToRad(FOV_BASE) / 2);

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

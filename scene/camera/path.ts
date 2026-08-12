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
 * ON FRANCHIT DEUX VITRAGES, PAS UN — et l'avoir cru pendant tout ce temps
 * reposait sur une erreur de lecture du modele.
 *
 * J'avais pris la plus grande surface de verre du fichier pour la baie
 * d'entree. Elle l'est par la taille, pas par la fonction : un rayon tire vers
 * l'arrivee de la camera bute dessus avant de sortir, donc elle donne a
 * l'interieur. C'est la VERRIERE ARRIERE, sept metres de large, qui ouvre sur
 * la terrasse — et les 12,60 m de degagement que j'appelais « le sejour »
 * etaient cette terrasse, pas une piece.
 *
 * L'entree, elle, est une ouverture modeste en facade. Le voyage traverse donc
 * la maison de part en part et ressort de l'autre cote, face a l'horizon. Cela
 * vaut mieux que ce que j'avais compris.
 */
export const VITRAGES = [
  /** L'entree, en facade, cote arrivee. Verifie expose sur le dehors. */
  { x: -2.99, y: 1.58, z: 3.45 },
  /** La verriere arriere, sur la terrasse. C'est elle, le climax. */
  { x: BAIE.x, y: BAIE.y, z: BAIE.z },
] as const;

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
  [0.7, NIVEAUX.garage + OEIL + 0.2, 20.0], // ~0.22 la file de vitrines defile
  [-0.4, NIVEAUX.garage + OEIL, 13.5],
  [-1.6, NIVEAUX.garage + OEIL + 0.5, 9.2], // ~0.42 on longe la voiture et le garage

  // LA MONTEE ET L'ENTREE, tracees d'apres un balayage du degagement reel.
  //
  // Le premier trace montait au milieu de l'escalier et percutait tout : sept
  // centimetres de la rambarde, onze de sa main courante, vingt-cinq d'un
  // rocher. Le balayage a montre que la seule ouverture en facade, a hauteur
  // d'homme, est a x = -2,75 environ — c'est-a-dire exactement la fenetre
  // basse relevee comme donnant sur le dehors.
  // La montee se fait AU-DESSUS du mur de souténement, pas dedans. A six
  // metres de la facade, le degagement a hauteur d'oeil est libre sur toute la
  // largeur ; a mi-hauteur, la camera etait dans la pierre.
  [-2.75, VITRAGES[0].y, 6.4],
  [VITRAGES[0].x, VITRAGES[0].y, VITRAGES[0].z], // le premier vitrage

  // L'INTERIEUR est un passage etroit, pas une salle : le degagement a hauteur
  // d'oeil n'y fait qu'un metre et demi de large, autour de x = 0.
  [-0.9, NIVEAUX.sejour + OEIL, 2.4],
  [0.0, NIVEAUX.sejour + OEIL, 0.6],
  [BAIE.x, NIVEAUX.sejour + OEIL, BAIE.z], // la verriere arriere

  // LA TERRASSE, et c'est la que les 12,60 m mesures se depensent enfin. On
  // sort de la maison au lieu de s'y arreter, et le balayage lateral se fait
  // face au large.
  [0.5, NIVEAUX.sejour + OEIL, -4.2],
  [2.3, NIVEAUX.sejour + OEIL, -4.5],
  [4.0, NIVEAUX.sejour + OEIL - 0.03, -4.3],
  [5.3, NIVEAUX.sejour + OEIL - 0.05, -4.0], // 1.00  au bout de la terrasse
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
  [-2.4, 1.5, 2.0],
  [-0.6, 1.6, -1.4],
  [0.2, 1.5, -6.2],
  // Une fois dehors, la visee precede la camera dans le balayage : c'est ce
  // decalage entre les deux courbes qui donne un panoramique la ou une visee
  // calquee sur le trajet donnerait un simple travelling.
  [3.0, 1.45, -7.4],
  [9.4, 1.4, -5.2],
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
export const FRANCHISSEMENTS = (() => {
  const N = 600;
  const trouve: number[] = [];
  for (const v of VITRAGES) {
    let precedent = CHEMIN.getPointAt(0).z;
    for (let i = 1; i <= N; i++) {
      const t = i / N;
      const z = CHEMIN.getPointAt(t).z;
      if (precedent > v.z && z <= v.z) {
        const f = (precedent - v.z) / (precedent - z);
        trouve.push((i - 1 + f) / N);
        break;
      }
      precedent = z;
    }
  }
  return trouve;
})();

/** L'entree en facade : dehors -> dedans. Bref, et pas le point d'orgue. */
export const T_ENTREE = FRANCHISSEMENTS[0] ?? 0.5;
/** La verriere arriere : dedans -> la terrasse et l'horizon. Le climax. */
export const T_VERRIERE = FRANCHISSEMENTS[FRANCHISSEMENTS.length - 1] ?? 0.8;

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
  // L'enveloppe se cale sur la VERRIERE et non sur l'entree. Les deux sont des
  // franchissements, mais un seul est un evenement : l'entree est une fenetre
  // de deux metres qu'on passe en une fraction de seconde, la verriere ouvre
  // sur le large. Doser le vertigo sur les deux le diluerait au lieu de le
  // ponctuer — c'est le meme raisonnement qui interdit de le tenir a fond sur
  // toute la longueur.
  THREE.MathUtils.smoothstep(t, T_VERRIERE - 0.24, T_VERRIERE - 0.04) *
  (1 - THREE.MathUtils.smoothstep(t, T_VERRIERE + 0.02, T_VERRIERE + 0.12));

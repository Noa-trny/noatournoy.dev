// Le chemin chaud. GSAP écrit ici, `useFrame` lit ici, et React n'en sait rien.
//
// C'est le contrat que tu as déjà écrit pour Éclosion : « un registre d'uniforms
// mutables que les tweens écrivent et que le rendu lit à chaque frame — sans
// jamais passer par un render React ».
//
// POURQUOI un objet mutable plutôt que de laisser GSAP écrire directement
// `camera.position` : le ticker de GSAP et la boucle de rendu de R3F sont deux
// `requestAnimationFrame` indépendants, et leur ordre dans une même frame n'est
// pas stable — il change au remontage, au rechargement à chaud, au retour
// d'onglet. Si ScrollTrigger écrivait la position et que R3F rendait avant lui
// cette frame-là, on afficherait une transformation vieille d'une frame. À
// 30 px de défilement par frame, ça se voit, et ça empire quand on défile vite,
// c'est-à-dire exactement quand un mouvement de caméra doit rester fluide.
//
// Écrire un SCALAIRE rend cette péremption invisible : le rig amortit de toute
// façon, et une valeur vieille d'une frame ne déplace la sortie amortie que
// d'environ 2 %.

export const scroll = {
  /** 0 à 1. Écrit par un tween scrubbé — déjà lissé par `scrub`. */
  target: 0,
  /** 0 à 1. Amorti dans `useFrame` : la seule valeur que le rig échantillonne. */
  eased: 0,
  /** Vitesse instantanée, en pixels par seconde. Sert à purger le survol. */
  velocity: 0,
  /** 0 à 1 : intensité du vertigo autour de la baie vitrée. */
  dolly: 0,
  /** 0 à 1 : bascule du jour extérieur vers le studio du garage. */
  interior: 0,
};

/** Remet tout à zéro. Utile au démontage et aux tests. */
export function resetScroll() {
  scroll.target = 0;
  scroll.eased = 0;
  scroll.velocity = 0;
  scroll.dolly = 0;
  scroll.interior = 0;
}

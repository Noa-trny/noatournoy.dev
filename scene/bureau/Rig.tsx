"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { bureau } from "./etat";
import { STATIONS, TRAJETS, piste } from "./defilement";
import { CHAMP, SEUIL_PORTRAIT, VUE_LARGE, VUE_PORTRAIT, zonePar } from "./zones";

// LE VOL DE CAMERA, DESORMAIS PILOTE PAR LA BARRE DE DEFILEMENT.
//
// GSAP a disparu d'ici, et ce n'est pas une economie de dependance : il n'avait
// plus rien a animer. Une camera qui suit le defilement n'a pas de duree — sa
// position est une FONCTION de la progression, pas une trajectoire dans le
// temps. Faire tenir les deux ensemble aurait donne un tween qui court apres
// une valeur qui change pendant qu'il court.
//
// CE QUI RESTE DU CONTRAT PRECEDENT : le rendu ne passe jamais par React. La
// barre ecrit un nombre, `useFrame` le lit et pose la camera. Deux boucles
// d'animation independantes ne peuvent pas se desynchroniser si l'une se
// contente de lire ce que l'autre a ecrit.

const _oeil = new THREE.Vector3();
const _cible = new THREE.Vector3();

/**
 * L'ADOUCISSEMENT ENTRE DEUX STATIONS, et c'est lui qui fait qu'on s'ARRETE.
 *
 * Une interpolation lineaire donnerait une camera a vitesse constante qui
 * traverse chaque station sans jamais s'y poser : le contenu defilerait devant
 * l'oeil comme un paysage de train. Le lissage en `t^3(t(6t-15)+10)` a une
 * derivee nulle AUX DEUX BOUTS : la camera arrive lentement, tient un instant,
 * puis repart. C'est la difference entre passer devant un objet et le regarder.
 */
const adoucir = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

// LE MOUCHARD, sous le meme drapeau que le forçage de la scene.
//
// Une camera qui cadre le vide ne laisse aucune trace : pas d'erreur, pas
// d'avertissement, une image noire. Le seul moyen de savoir OU elle est, c'est
// qu'elle le dise. Trois defauts de cadrage de ce projet ont ete diagnostiques
// par raisonnement avant d'etre reproduits, et les trois fois le raisonnement
// s'est trompe.
const espion =
  typeof window !== "undefined" && window.location.search.includes("force3d");

export function Rig() {
  const camera = useThree((s) => s.camera);
  const taille = useThree((s) => s.size);
  const branche = useRef(false);

  // LE RAPPORT DE L'ECRAN CHOISIT LE PLAN, et il est lu ici plutot que par une
  // media query : c'est la camera qui cadre, pas la feuille de style.
  const portrait = taille.width / Math.max(taille.height, 1) < SEUIL_PORTRAIT;

  // LES SIX POINTS DE VUE, CALCULES UNE FOIS PAR FORMAT et non par image. Ils ne
  // dependent que de la taille de la fenetre ; les recalculer dans `useFrame`
  // ferait soixante fois par seconde un travail qui change au redimensionnement.
  const vues = useMemo(() => {
    const rapport = Math.max(taille.width / Math.max(taille.height, 1), 0.28);
    const demiChamp = Math.tan(THREE.MathUtils.degToRad(CHAMP) / 2);

    // La distance a laquelle une largeur donnee tient dans le cadre : c'est la
    // formule du champ, rien de plus. Elle remplace tout reglage a la main —
    // les vues, composees sur un ecran large, coupaient le texte des deux cotes
    // en portrait, et l'auraient recoupe a la premiere dalle redimensionnee.
    const distancePour = (largeur: number) => largeur / 2 / (demiChamp * rapport);

    // Le plan large, lui, n'a pas de largeur a lire : il a une composition. On
    // le recule donc au rapport, borne haut et bas — sans quoi une fenetre
    // simplement etroite coupe les bords du bureau sans que rien ne bascule.
    const reference = portrait ? 0.462 : 1.674;
    const reculLarge = Math.min(Math.max(reference / rapport, 1), 2.1);

    return STATIONS.map((id) => {
      const z = id ? zonePar(id) : null;
      const large = portrait ? VUE_PORTRAIT : VUE_LARGE;
      const cible = new THREE.Vector3(...(z ? z.cible : large.cible));
      const oeilBrut = new THREE.Vector3(...(z ? z.oeil : large.oeil));

      // Le facteur s'applique le long du vecteur cible -> oeil : seule la
      // distance change, jamais l'angle. C'est l'angle qui fait la composition.
      // Et jamais moins que la distance ecrite : elle a ete composee, on ne s'en
      // rapproche pas sous pretexte qu'un ecran est large.
      const facteur = z
        ? Math.max(1, distancePour(z.largeur) / oeilBrut.distanceTo(cible))
        : reculLarge;

      const oeil = cible.clone().addScaledVector(oeilBrut.clone().sub(cible), facteur);
      return { oeil, cible };
    });
  }, [taille.width, taille.height, portrait]);

  // Au changement de format, la camera doit se reposer immediatement sur la
  // nouvelle vue : l'amortissement ci-dessous part de l'ancienne, et sans ce
  // drapeau on verrait la camera glisser d'un plan a l'autre au redimensionnement.
  useEffect(() => {
    branche.current = false;
  }, [vues]);

  useFrame((_, dt) => {
    // L'INERTIE EST ICI, ET NULLE PART AILLEURS. `damp` est independant de la
    // cadence — un `lerp` a coefficient fixe donnerait une camera deux fois plus
    // molle sur un ecran a 120 Hz.
    piste.lisse = branche.current
      ? THREE.MathUtils.damp(piste.lisse, piste.brut, 5, dt)
      : piste.brut;

    const s = piste.lisse * TRAJETS;
    const i = Math.min(Math.floor(s), TRAJETS - 1);
    const t = adoucir(THREE.MathUtils.clamp(s - i, 0, 1));

    // Les deux bornes sont relues plutot qu'affirmees non nulles : `i` vient
    // d'un nombre a virgule, et une progression qui deborde d'un cheveu — ce
    // qu'un rebond de defilement produit sur macOS — sortirait du tableau.
    const de = vues[i];
    const vers = vues[i + 1];
    if (!de || !vers) return;

    _oeil.lerpVectors(de.oeil, vers.oeil, t);
    _cible.lerpVectors(de.cible, vers.cible, t);
    camera.position.copy(_oeil);
    camera.lookAt(_cible);

    if (espion) {
      (window as unknown as { __piste?: unknown }).__piste = {
        brut: +piste.brut.toFixed(3),
        lisse: +piste.lisse.toFixed(3),
        s: +s.toFixed(2),
        i,
        oeil: _oeil.toArray().map((n) => +n.toFixed(2)),
        cible: _cible.toArray().map((n) => +n.toFixed(2)),
      };
    }

    branche.current = true;

    // CE QU'ON PUBLIE A REACT, ET SEULEMENT QUAND ÇA CHANGE. Une station n'est
    // « ouverte » que si l'on s'y est vraiment arrete : au quart de trajet, on
    // n'est nulle part, et l'etiquette ne doit rien annoncer. Le magasin ne
    // notifie que sur changement reel, donc ces deux appels ne coutent rien
    // entre deux stations.
    const proche = Math.round(s);
    const pose = Math.abs(s - proche) < 0.22;
    bureau.set({
      ouverte: (pose ? STATIONS[proche] : null) ?? null,
      // En mouvement, le survol est perime : R3F ne relance un lancer de rayon
      // que sur evenement de pointeur, jamais parce que la camera a bouge.
      ...(Math.abs(piste.brut - piste.lisse) > 0.0015 ? { survol: null } : {}),
    });
  });

  return null;
}

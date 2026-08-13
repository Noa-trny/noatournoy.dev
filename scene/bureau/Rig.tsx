"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { bureau, useBureau } from "./etat";
import { VUE_LARGE, zonePar } from "./zones";

// LE VOL DE CAMERA.
//
// GSAP anime deux VECTEURS — l'oeil et la cible — et `useFrame` les applique.
// Jamais l'inverse. C'est la meme frontiere que sur le projet precedent, et
// pour la meme raison : les deux boucles d'animation, celle de GSAP et celle de
// R3F, sont independantes et leur ordre dans l'image n'est pas garanti. Animer
// directement `camera.position` donne des saccades au remontage, au
// rechargement a chaud et au retour d'onglet ; animer des nombres qu'on lit
// ensuite ne peut pas se desynchroniser.
//
// L'INTERPOLATION SE FAIT SUR LA CIBLE AUSSI, et c'est ce qui donne un
// mouvement de camera plutot qu'un saut. Deplacer l'oeil en gardant la cible
// fixe donne un travelling ; deplacer les deux donne un panoramique combine,
// c'est-a-dire le geste d'une camera qu'on porte.

const _oeil = new THREE.Vector3(...VUE_LARGE.oeil);
const _cible = new THREE.Vector3(...VUE_LARGE.cible);

export function Rig() {
  const camera = useThree((s) => s.camera);
  const ouverte = useBureau((e) => e.ouverte);
  const premier = useRef(true);

  useEffect(() => {
    const z = ouverte ? zonePar(ouverte) : null;
    const versOeil = z ? z.oeil : VUE_LARGE.oeil;
    const versCible = z ? z.cible : VUE_LARGE.cible;

    // Au tout premier rendu, on se pose sans animer : une camera qui vole vers
    // sa position de depart pendant que la page apparait donne l'impression
    // d'un bug, pas d'une intention.
    if (premier.current) {
      premier.current = false;
      _oeil.set(...versOeil);
      _cible.set(...versCible);
      bureau.volFini();
      return;
    }

    const duree = 1.15;
    const t1 = gsap.to(_oeil, {
      x: versOeil[0], y: versOeil[1], z: versOeil[2],
      duration: duree,
      // `power3.inOut` et non un rebond : on porte une camera, on ne lance pas
      // un objet. Un depassement, meme leger, se lit comme une erreur de visee.
      ease: "power3.inOut",
      onComplete: () => bureau.volFini(),
    });
    const t2 = gsap.to(_cible, {
      x: versCible[0], y: versCible[1], z: versCible[2],
      duration: duree,
      ease: "power3.inOut",
    });
    return () => {
      t1.kill();
      t2.kill();
    };
  }, [ouverte]);

  useFrame(() => {
    camera.position.copy(_oeil);
    camera.lookAt(_cible);
  });

  return null;
}

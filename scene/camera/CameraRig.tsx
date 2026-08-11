"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { scroll } from "../scroll/scrollState";
import { CHEMIN, VISEE, FOV_BASE, HAUTEUR_CADREE, dollyA } from "./path";

// Le rig de camera. Il ne lit que `scroll`, jamais React.

const _p = new THREE.Vector3();
const _v = new THREE.Vector3();

export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const vise = useRef(new THREE.Vector3().copy(VISEE.getPointAt(0)));

  useFrame((_, delta) => {
    // Un onglet en arriere-plan, un ramasse-miettes ou une compilation de
    // shader produisent un delta enorme : sans ce plafond, la camera
    // teleporterait au retour.
    const dt = Math.min(delta, 1 / 30);

    scroll.eased = THREE.MathUtils.damp(scroll.eased, scroll.target, 6, dt);
    const t = THREE.MathUtils.clamp(scroll.eased, 0, 1);
    scroll.dolly = dollyA(t);

    // `getPointAt` et NON `getPoint` : le second est uniforme dans le parametre
    // de la courbe, ce qui tasse les points dans les virages. La camera y
    // ralentirait exactement la ou la geometrie devient interessante, et ca se
    // lit comme un calage.
    CHEMIN.getPointAt(t, _p);
    VISEE.getPointAt(t, _v);

    camera.position.copy(_p);
    // Le point vise est amorti a part : le panoramique reste doux meme quand la
    // courbe de visee tourne vite.
    vise.current.lerp(_v, 1 - Math.exp(-8 * dt));
    camera.lookAt(vise.current);

    // ---- dolly zoom : h = 2 d tan(fov/2), on fige h, donc fov = 2 atan(h/2d)
    //
    // `d` est la distance au SUJET, pas l'abscisse curviligne : le cadrage
    // porte sur ce qu'on regarde, pas sur le chemin parcouru.
    const d = Math.max(camera.position.distanceTo(vise.current), 0.5);
    const fige = 2 * Math.atan(HAUTEUR_CADREE / (2 * d)) * THREE.MathUtils.RAD2DEG;
    const fov = THREE.MathUtils.lerp(FOV_BASE, fige, scroll.dolly);

    // `updateProjectionMatrix` est obligatoire apres toute ecriture de fov,
    // near, far, aspect ou zoom — R3F ne le fait que sur changement de PROP, il
    // ne peut pas savoir qu'on a mute l'objet. Sous garde epsilon : recalculer
    // la matrice inverse a chaque frame pour rien serait du gaspillage.
    if (Math.abs(fov - camera.fov) > 1e-3) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

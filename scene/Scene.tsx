"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { scroll } from "./scroll/scrollState";

// Phase 6 : le squelette. Aucun modèle, aucune lumière d'ambiance, aucun
// matériau physique — juste de quoi PROUVER que le pont entre le défilement et
// la boucle de rendu est sans gigue avant de construire quoi que ce soit
// par-dessus. La maison arrive en phase 7, la voiture en phase 9.

/** L'amortissement qui découple la boucle de GSAP de celle de R3F. */
function Rig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const cube = useRef<THREE.Mesh>(null);
  const look = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    // Un onglet en arrière-plan, un ramasse-miettes ou une compilation de
    // shader produisent un delta énorme. Sans ce plafond, la caméra
    // téléporterait au retour.
    const dt = Math.min(delta, 1 / 30);

    scroll.eased = THREE.MathUtils.damp(scroll.eased, scroll.target, 6, dt);
    const t = scroll.eased;

    // Une trajectoire provisoire, en ligne droite : elle sera remplacée par une
    // CatmullRomCurve3 en phase 7.
    camera.position.set(
      Math.sin(t * Math.PI) * 3,
      2.2 - t * 0.8,
      12 - t * 14
    );
    look.current.set(0, 1.2 - t * 0.4, -2 - t * 6);
    camera.lookAt(look.current);

    if (cube.current) {
      cube.current.rotation.y = t * Math.PI * 2;
      cube.current.rotation.x = t * Math.PI;
    }
  });

  return (
    <mesh ref={cube} position={[0, 1, -4]}>
      <boxGeometry args={[2, 2, 2]} />
      {/* `toneMapped={false}` garde le vert acide exact : c'est une couleur
          d'identité, pas une couleur physique. */}
      <meshBasicMaterial color="#c2f53f" wireframe toneMapped={false} />
    </mesh>
  );
}

export default function Scene() {
  return (
    <Canvas
      camera={{ fov: 38, near: 0.1, far: 200, position: [0, 2.2, 12] }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      // Le canvas est purement décoratif : il ne doit jamais recevoir le focus
      // ni apparaître dans l'arbre d'accessibilité. Toute la navigation vit
      // dans le DOM, à côté.
      aria-hidden="true"
      tabIndex={-1}
    >
      <color attach="background" args={["#08080a"]} />
      <Rig />
    </Canvas>
  );
}

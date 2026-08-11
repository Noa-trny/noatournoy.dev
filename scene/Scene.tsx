"use client";

import { Canvas } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { Suspense } from "react";
import { CameraRig } from "./camera/CameraRig";
import { House } from "./house/House";

// La scene. Phase 7 : la maison et le trajet de camera. Les vitrines viennent
// en phase 8, le garage et la voiture en phase 9.
//
// Deux choses volontairement absentes :
//
// - Aucun `<Environment preset=...>`. Il irait chercher une HDRI sur un CDN
//   tiers, que `connect-src 'self'` bloque. `<Sky>` est procedural et ne pese
//   pas un octet.
// - Aucun post-processing. Il tirerait tout l'EffectComposer, et surtout il
//   invaliderait le prechauffage des shaders — le piege de cle de cache qui a
//   coute 617 ms de pire frame sur Eclosion.

function Lumiere() {
  return (
    <>
      {/* Rasant, venant de l'avant-gauche : c'est cette incidence qui creuse
          les debords et pose l'ombre horizontale sous la dalle. */}
      <directionalLight position={[-18, 16, 24]} intensity={2.6} />
      {/* Le ciel comme lumiere d'appoint. Sans lui les faces a l'ombre
          tombent au noir et la maison se lit en decoupage. */}
      <hemisphereLight args={["#b9c9e2", "#5a5750", 1.1]} />
    </>
  );
}

export default function Scene() {
  return (
    <Canvas
      camera={{ fov: 40, near: 0.1, far: 400, position: [0, 1.75, 42] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 1.75]}
      shadows={false}
      // Purement decoratif : jamais dans l'arbre d'accessibilite, jamais un
      // arret de tabulation. Toute la navigation vit dans le DOM, a cote.
      aria-hidden="true"
      tabIndex={-1}
    >
      <color attach="background" args={["#aebdd2"]} />
      <Sky sunPosition={[-18, 16, 24]} turbidity={5} rayleigh={1.4} />
      <Lumiere />
      <CameraRig />
      {/* La maison a sa propre frontiere : quand le garage arrivera en phase 9,
          il aura la sienne, et sa suspension ne figera pas ce qui est deja la. */}
      <Suspense fallback={null}>
        <House />
      </Suspense>
    </Canvas>
  );
}

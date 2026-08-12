"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Sky } from "@react-three/drei";
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
      <directionalLight position={[-18, 16, 24]} intensity={2.4} />
      {/* Une seconde directionnelle, faible et opposee, pour que les faces a
          contre-jour gardent du modele. Sans elle le beton s'y aplatit. */}
      <directionalLight position={[22, 9, -18]} intensity={0.55} />
      {/* Le ciel comme lumiere d'appoint. Sans lui les faces a l'ombre
          tombent au noir et la maison se lit en decoupage. */}
      <hemisphereLight args={["#b9c9e2", "#57544d", 1.25]} />
    </>
  );
}

/**
 * Le sol.
 *
 * Le terrain du modele a ete retire — 92 x 75 m de pelouse que la camera ne
 * verra jamais. Restait un vide blanc sous l'esplanade, qui la faisait
 * flotter. Un plan suffit : la camera ne s'en approche jamais assez pour
 * demander une texture.
 */
function Sol() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.99, 0]} raycast={() => {}}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#8e8c85" roughness={0.95} metalness={0} />
      </mesh>
      {/* Une ombre de contact cuite en UNE fois plutot qu'a chaque frame :
          c'est elle qui pose vraiment la maison au sol, la ou une ombre portee
          en temps reel couterait une passe complete par image. */}
      <ContactShadows
        frames={1}
        position={[0, -2.96, 0]}
        scale={140}
        far={9}
        blur={2.4}
        opacity={0.55}
        resolution={1024}
        color="#2a2926"
      />
    </>
  );
}

export default function Scene() {
  return (
    <Canvas
      camera={{ fov: 30, near: 0.1, far: 400, position: [0, 1.9, 24] }}
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
      <Sol />
      <CameraRig />
      {/* La maison a sa propre frontiere : quand le garage arrivera en phase 9,
          il aura la sienne, et sa suspension ne figera pas ce qui est deja la. */}
      <Suspense fallback={null}>
        <House />
      </Suspense>
    </Canvas>
  );
}

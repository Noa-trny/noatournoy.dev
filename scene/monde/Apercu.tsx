"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Forme } from "../croquis/Forme";

// MAQUETTE DE RENDU, pas encore le monde.
//
// Elle n'existe que pour repondre a une question avant d'en construire dix
// mille lignes : est-ce que le trait, les paliers d'eclairage et le grain de
// papier donnent un DESSIN, ou un low-poly gris ? Un couloir nu et quatre
// ouvertures suffisent a le savoir, et se jettent sans regret.
//
// C'est la lecon de la journee : une villa entiere a ete preparee, eclairee et
// parcourue avant qu'on regarde ce qu'elle donnait a l'ecran.

const MUR = { couleur: "#e9e4d8", paliers: 4, grain: 0.18 } as const;
const SOL = { couleur: "#cfc7b6", paliers: 3, grain: 0.22 } as const;
const PORTE = { couleur: "#3b82f6", paliers: 3, grain: 0.1 } as const;
const ACCENT = { couleur: "#f0b429", paliers: 3, grain: 0.12 } as const;

/** Une travee : deux murs, une poutre, et une ouverture d'un cote. */
function Travee({ z, ouverture }: { z: number; ouverture: "gauche" | "droite" | null }) {
  return (
    <group position={[0, 0, z]}>
      {ouverture === "gauche" ? (
        <>
          <Forme reglages={MUR} position={[-3, 2.6, 0]}>
            <boxGeometry args={[0.3, 1.4, 4]} />
          </Forme>
          <Forme reglages={PORTE} position={[-3.02, 1.1, 0]} trait={0.005}>
            <boxGeometry args={[0.12, 2.2, 1.6]} />
          </Forme>
        </>
      ) : (
        <Forme reglages={MUR} position={[-3, 1.7, 0]}>
          <boxGeometry args={[0.3, 3.4, 4]} />
        </Forme>
      )}

      {ouverture === "droite" ? (
        <>
          <Forme reglages={MUR} position={[3, 2.6, 0]}>
            <boxGeometry args={[0.3, 1.4, 4]} />
          </Forme>
          <Forme reglages={PORTE} position={[3.02, 1.1, 0]} trait={0.005}>
            <boxGeometry args={[0.12, 2.2, 1.6]} />
          </Forme>
        </>
      ) : (
        <Forme reglages={MUR} position={[3, 1.7, 0]}>
          <boxGeometry args={[0.3, 3.4, 4]} />
        </Forme>
      )}

      {/* La poutre rythme le couloir et porte des ombres, donc de la
          profondeur — sans elle, un corridor se lit comme un tunnel plat. */}
      <Forme reglages={ACCENT} position={[0, 3.35, 0]} trait={0.004}>
        <boxGeometry args={[6.3, 0.22, 0.35]} />
      </Forme>
    </group>
  );
}

export default function Apercu() {
  return (
    <div className="fixed inset-0 z-50">
      <Canvas
        camera={{ fov: 38, near: 0.1, far: 120, position: [0.7, 2.5, 11.5] }}
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
        shadows={{ type: THREE.PCFShadowMap }}
      >
        <color attach="background" args={["#12141a"]} />
        <fogExp2 attach="fog" args={["#12141a", 0.055]} />

        {/* UNE lumiere qui porte l'ombre, et un appoint tres faible. Les
            paliers du shader ecrasent les degrades : multiplier les sources ne
            donnerait pas plus de modele, seulement plus de bandes. */}
        <directionalLight
          position={[-5, 8, 6]}
          intensity={2.6}
          color="#fff4e0"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0006}
          shadow-normalBias={0.05}
          shadow-camera-near={1}
          shadow-camera-far={40}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <hemisphereLight args={["#93b4e8", "#3c352c", 0.9]} />

        <Forme
          reglages={SOL}
          position={[0, 0, -6]}
          rotation={[-Math.PI / 2, 0, 0]}
          trait={0}
          castShadow={false}
        >
          <planeGeometry args={[6.4, 40]} />
        </Forme>

        <Travee z={2} ouverture="gauche" />
        <Travee z={-2} ouverture="droite" />
        <Travee z={-6} ouverture="gauche" />
        <Travee z={-10} ouverture="droite" />

        {/* Le fond du couloir : sans lui, le brouillard ouvre sur du vide. */}
        <Forme reglages={MUR} position={[0, 1.7, -13]}>
          <boxGeometry args={[6.3, 3.4, 0.3]} />
        </Forme>
      </Canvas>
    </div>
  );
}

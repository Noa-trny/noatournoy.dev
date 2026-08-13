"use client";

import { Canvas } from "@react-three/fiber";
import { Rig } from "./Rig";
import { Sensible } from "./Sensible";
import * as THREE from "three";
import { Forme } from "../croquis/Forme";
import {
  Carnet,
  Ecran,
  Lampe,
  Machine,
  Mug,
  PALETTE,
  Plante,
  Plateau,
  Portable,
  Saisie,
  Livres,
  Casque,
  Feuillets,
} from "./pieces";

// LE POSTE DE TRAVAIL.
//
// Un bureau de nuit vu de trois quarts. Chaque objet du quotidien porte une
// section du site : les ecrans les projets, le carnet le parcours, la machine
// la stack, l'enveloppe le contact. C'est ce qui distingue ce monde d'un menu
// deguise en 3D — le decor EST le contenu, comme les autocollants sur la porte
// d'itomdev.
//
// L'ECLAIRAGE PORTE TOUT LE PROPOS. Une lampe chaude fait un ilot au centre, le
// reste tombe dans un bleu froid et le fond disparait. Un bureau uniformement
// eclairé est un bureau de bureau ; celui-ci doit etre un poste a soi, la nuit.
//
// Trois sources et pas une de plus : les aplats du shader ecrasent les degrades,
// donc multiplier les lumieres n'ajoute pas de modele, seulement des bandes.

/** Le halo de la lampe : une sphere non eclairee, tres transparente. */
function Halo() {
  return (
    <mesh position={[-0.62, 1.24, -0.16]} raycast={() => {}}>
      <sphereGeometry args={[0.42, 16, 12]} />
      <meshBasicMaterial color="#ffcf90" transparent opacity={0.055} depthWrite={false} />
    </mesh>
  );
}

export default function Bureau() {
  return (
    <div className="fixed inset-0">
      <Canvas
        // Trois quarts, legerement en plongee : c'est l'angle d'ou l'on voit un
        // bureau quand on s'en approche, et le seul qui montre a la fois les
        // ecrans et le plateau. De face, les objets poses disparaissent.
        camera={{ fov: 32, near: 0.05, far: 40, position: [2.35, 1.98, 2.85] }}
        gl={{ antialias: true }}
        // LA CAMERA DOIT VISER, et R3F ne le fait pas pour vous. Sans `lookAt`,
        // elle regarde droit devant elle le long de -Z : placee en hauteur et de
        // biais, elle cadrait donc le vide au-dessus du plateau, et le bureau
        // sortait par le bas. Le point vise est le centre du plateau, un peu
        // en arriere, pour que les ecrans montent dans le cadre.
        // La visee est desormais tenue par <Rig>, qui la partage avec les
        // vols vers chaque zone. La poser ici aussi la ferait sauter d'une
        // image au premier rendu.
        dpr={[1, 1.5]}
        shadows={{ type: THREE.PCFShadowMap }}
      >
        <color attach="background" args={["#0a0b0d"]} />
        <fogExp2 attach="fog" args={["#0a0b0d", 0.19]} />

        {/* LA LAMPE. Portee, chaude, placee dans l'abat-jour. C'est la seule
            source qui projette une ombre : deux lumieres a ombres donneraient
            deux ombres par objet, ce qu'aucun bureau ne fait. */}
        <pointLight
          position={[-0.62, 1.3, -0.14]}
          intensity={3.4}
          distance={4.2}
          decay={2}
          color="#ffd6a0"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0012}
          shadow-normalBias={0.03}
          shadow-camera-near={0.1}
          shadow-camera-far={6}
        />

        {/* La lueur des ecrans, froide, sans ombre : elle remonte sur le clavier
            et sur le visage de celui qui n'est pas la. */}
        <pointLight position={[0.1, 1.15, -0.35]} intensity={0.9} distance={2.4} decay={2} color="#7fb0ff" />

        {/* L'ambiante, tres faible et bleue : elle empeche le noir absolu sans
            eclairer la piece. */}
        <hemisphereLight args={["#33415c", "#0d0f14", 0.55]} />

        {/* Le sol. Il n'existe que pour recevoir l'ombre du bureau — sans lui,
            le meuble flotte. Sans trait : un contour sur un plan infini
            dessinerait un cadre autour de la scene. */}
        <Forme
          reglages={{ couleur: "#15171d", paliers: 3, grain: 0.1, plancher: 0.3 }}
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          trait={0}
          castShadow={false}
        >
          <planeGeometry args={[14, 14]} />
        </Forme>

        {/* Le mur du fond, juste derriere les ecrans : il donne une butee au
            regard et recoit le halo de la lampe. */}
        <Forme reglages={{ couleur: "#1b1e26", paliers: 3, grain: 0.12, plancher: 0.28 }} position={[0, 1.4, -1.05]} trait={0}>
          <boxGeometry args={[7, 2.8, 0.06]} />
        </Forme>

        <Plateau />

        {/* Les deux ecrans, legerement tournes vers le siege : un ecran droit
            face au monde est un ecran de vitrine, pas de travail. */}
        <Ecran position={[-0.32, 0.7675, -0.34]} rotation={[0, 0.22, 0]}>
          <mesh>
            <planeGeometry args={[0.58, 0.34]} />
            <meshBasicMaterial color="#101826" />
          </mesh>
        </Ecran>
        <Ecran position={[0.5, 0.7675, -0.3]} rotation={[0, -0.3, 0]} largeur={0.54} hauteur={0.34}>
          <mesh>
            <planeGeometry args={[0.5, 0.3]} />
            <meshBasicMaterial color="#0e1a18" />
          </mesh>
        </Ecran>

        <Portable position={[1.02, 0.7675, 0.16]} rotation={[0, -0.62, 0]} />
        <Saisie position={[-0.18, 0.7675, 0.28]} />
        <Carnet position={[-1.02, 0.7675, 0.2]} rotation={[0, 0.34, 0]} />
        <Machine position={[-1.24, 0.7675, -0.34]} rotation={[0, 0.18, 0]} />
        <Lampe position={[-1.16, 0.7675, -0.52]} />
        <Mug position={[0.28, 0.7675, 0.36]} />
        <Plante position={[1.42, 0.7675, -0.46]} />
        {/* Le cote droit etait vide : trois objets suffisent a l'habiter, et
            chacun apporte une hauteur differente — c'est la variation de
            hauteur qui fait un plateau vecu plutot qu'un plan de travail. */}
        <Livres position={[1.36, 0.7675, 0.18]} rotation={[0, -0.42, 0]} />
        <Casque position={[0.92, 0.7675, -0.52]} />
        <Feuillets position={[0.58, 0.7675, 0.42]} />

        <Halo />

        {/* LE RIG ET LES ZONES SENSIBLES.

            Cinq boites invisibles, une par section, PLUS GENEREUSES que les
            objets qu'elles designent : un carnet de deux centimetres
            d'epaisseur est impossible a viser a la souris, une boite de quinze
            centimetres autour se vise sans y penser. */}
        <Rig />
        <Sensible
          id="projets"
          position={[-0.32, 1.05, -0.33]}
          taille={[0.7, 0.46, 0.2]}
          rotation={[0, 0.22, 0]}
        />
        <Sensible
          id="apropos"
          position={[0.5, 1.03, -0.29]}
          taille={[0.62, 0.42, 0.2]}
          rotation={[0, -0.3, 0]}
        />
        <Sensible
          id="parcours"
          position={[-1.02, 0.81, 0.2]}
          taille={[0.32, 0.18, 0.38]}
          rotation={[0, 0.34, 0]}
        />
        <Sensible
          id="stack"
          position={[-1.24, 0.88, -0.34]}
          taille={[0.28, 0.32, 0.4]}
          rotation={[0, 0.18, 0]}
        />
        <Sensible
          id="contact"
          position={[1.02, 0.85, 0.1]}
          taille={[0.44, 0.26, 0.38]}
          rotation={[0, -0.62, 0]}
        />
      </Canvas>
    </div>
  );
}

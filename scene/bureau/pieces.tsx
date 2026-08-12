"use client";

import { Forme } from "../croquis/Forme";

// LES PIECES DU BUREAU.
//
// Chaque objet est construit en primitives — boites, cylindres, tores — et non
// importe. C'est ce qui permet au monde entier de peser quelques kilooctets au
// lieu de cinq megaoctets, de tourner sur une carte integree, et surtout d'etre
// MODIFIABLE : deplacer un ecran est une ligne, pas un aller-retour dans
// Blender.
//
// La palette est celle d'un bureau de nuit. Une lampe chaude fait l'ilot de
// lumiere, le reste tombe dans un bleu froid. C'est ce contraste qui donne
// l'intimite recherchee — un bureau uniformement eclairé est un bureau de
// bureau, pas un poste de travail a soi.

export const PALETTE = {
  plateau: { couleur: "#8a6a45", paliers: 4, grain: 0.1, plancher: 0.34 },
  pied: { couleur: "#2f3138", paliers: 3, grain: 0.08, plancher: 0.3 },
  boitier: { couleur: "#23262d", paliers: 3, grain: 0.08, plancher: 0.32 },
  cadre: { couleur: "#15171c", paliers: 3, grain: 0.06, plancher: 0.3 },
  papier: { couleur: "#efe7d6", paliers: 4, grain: 0.14, plancher: 0.4 },
  laiton: { couleur: "#c08a3e", paliers: 4, grain: 0.08, plancher: 0.36 },
  ceramique: { couleur: "#d8d2c6", paliers: 4, grain: 0.1, plancher: 0.38 },
  feuillage: { couleur: "#4f7a52", paliers: 3, grain: 0.16, plancher: 0.35 },
} as const;

/** Le plateau et son piétement. L'assise de toute la composition. */
export function Plateau() {
  return (
    <group>
      <Forme reglages={PALETTE.plateau} position={[0, 0.74, 0]} trait={0.0032}>
        <boxGeometry args={[3.2, 0.055, 1.5]} />
      </Forme>
      {/* Un tablier sous le plateau : sans lui, la tranche se lit comme une
          planche posee en l'air. */}
      <Forme reglages={PALETTE.plateau} position={[0, 0.66, -0.6]} trait={0.003}>
        <boxGeometry args={[3.1, 0.12, 0.06]} />
      </Forme>
      {[-1.5, 1.5].map((x) => (
        <Forme key={x} reglages={PALETTE.pied} position={[x, 0.36, 0]} trait={0.003}>
          <boxGeometry args={[0.07, 0.72, 1.3]} />
        </Forme>
      ))}
    </group>
  );
}

/**
 * Un ecran. C'est LE support de projet : sa dalle recevra une capture.
 *
 * La dalle est une piece a part, tres legerement en avant du cadre, pour deux
 * raisons : elle peut recevoir un materiau non eclairé — un ecran s'eclaire
 * lui-meme — et elle est la seule surface a rendre cliquable.
 */
export function Ecran({
  position,
  rotation = [0, 0, 0],
  largeur = 0.62,
  hauteur = 0.38,
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  largeur?: number;
  hauteur?: number;
  children?: React.ReactNode;
}) {
  const pied = hauteur / 2 + 0.09;
  return (
    <group position={position} rotation={rotation}>
      {/* Socle et colonne */}
      <Forme reglages={PALETTE.pied} position={[0, 0.012, 0]} trait={0.0028}>
        <boxGeometry args={[0.24, 0.024, 0.16]} />
      </Forme>
      <Forme reglages={PALETTE.pied} position={[0, 0.055, 0]} trait={0.0028}>
        <boxGeometry args={[0.045, 0.09, 0.045]} />
      </Forme>
      {/* Le cadre */}
      <Forme reglages={PALETTE.cadre} position={[0, pied, 0]} trait={0.0032}>
        <boxGeometry args={[largeur, hauteur, 0.028]} />
      </Forme>
      {/* La dalle, portee par le parent pour que l'appelant y mette ce qu'il
          veut — capture de projet, code, ou rien. */}
      <group position={[0, pied, 0.016]}>{children}</group>
    </group>
  );
}

/** Le portable, ouvert. Il double l'ecran principal sans le repeter. */
export function Portable({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <Forme reglages={PALETTE.boitier} position={[0, 0.008, 0]} trait={0.0026}>
        <boxGeometry args={[0.34, 0.016, 0.24]} />
      </Forme>
      {/* L'ecran, incline : c'est l'inclinaison qui dit « ouvert » et qui
          accroche la lumiere de la lampe sur sa tranche. */}
      <group position={[0, 0.016, -0.12]} rotation={[-1.18, 0, 0]}>
        <Forme reglages={PALETTE.boitier} position={[0, 0.11, 0]} trait={0.0026}>
          <boxGeometry args={[0.34, 0.22, 0.012]} />
        </Forme>
      </group>
    </group>
  );
}

/** Clavier et souris : ils occupent le devant du plateau et donnent l'echelle. */
export function Saisie({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Forme reglages={PALETTE.boitier} position={[0, 0.01, 0]} trait={0.0026}>
        <boxGeometry args={[0.44, 0.02, 0.14]} />
      </Forme>
      <Forme reglages={PALETTE.cadre} position={[0, 0.022, 0]} trait={0}>
        <boxGeometry args={[0.4, 0.006, 0.1]} />
      </Forme>
      <Forme reglages={PALETTE.boitier} position={[0.36, 0.014, 0.01]} trait={0.0026}>
        <boxGeometry args={[0.06, 0.028, 0.1]} />
      </Forme>
    </group>
  );
}

/** Le carnet : support du parcours. Ferme, avec un marque-page. */
export function Carnet({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <Forme reglages={PALETTE.cadre} position={[0, 0.012, 0]} trait={0.0026}>
        <boxGeometry args={[0.2, 0.024, 0.28]} />
      </Forme>
      <Forme reglages={PALETTE.papier} position={[0, 0.026, 0]} trait={0.0022}>
        <boxGeometry args={[0.185, 0.006, 0.265]} />
      </Forme>
      {/* Le marque-page depasse : un detail qui coute six sommets et fait
          passer l'objet de « boite » a « carnet ». */}
      <Forme reglages={PALETTE.laiton} position={[0.05, 0.03, 0.16]} trait={0}>
        <boxGeometry args={[0.018, 0.002, 0.08]} />
      </Forme>
    </group>
  );
}

/** La machine : support de la stack. Un boitier a LED, pose de chant. */
export function Machine({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <Forme reglages={PALETTE.boitier} position={[0, 0.115, 0]} trait={0.003}>
        <boxGeometry args={[0.16, 0.23, 0.3]} />
      </Forme>
      {/* Les diodes. Non eclairees et legerement en avant : une LED qui recoit
          l'ombre de la lampe cesse d'etre une LED. */}
      {[0.04, 0.0, -0.04].map((y, i) => (
        <mesh key={y} position={[0.081, 0.17 + y, 0.06]}>
          <boxGeometry args={[0.004, 0.012, 0.012]} />
          <meshBasicMaterial color={i === 0 ? "#7ee787" : i === 1 ? "#58a6ff" : "#f0b429"} />
        </mesh>
      ))}
    </group>
  );
}

/** La lampe d'architecte : c'est elle qui fait l'ilot de lumiere. */
export function Lampe({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Forme reglages={PALETTE.pied} position={[0, 0.012, 0]} trait={0.0026}>
        <cylinderGeometry args={[0.075, 0.085, 0.024, 20]} />
      </Forme>
      <group rotation={[0, 0, -0.36]}>
        <Forme reglages={PALETTE.laiton} position={[0, 0.24, 0]} trait={0.0024}>
          <cylinderGeometry args={[0.011, 0.011, 0.46, 12]} />
        </Forme>
      </group>
      <group position={[-0.17, 0.46, 0]} rotation={[0, 0, 0.95]}>
        <Forme reglages={PALETTE.laiton} position={[0, 0.14, 0]} trait={0.0024}>
          <cylinderGeometry args={[0.011, 0.011, 0.3, 12]} />
        </Forme>
        {/* L'abat-jour, cone ouvert vers le bas. `openEnded` pour qu'on voie
            l'interieur eclairé quand la camera passe dessous. */}
        <group position={[0.02, 0.3, 0]} rotation={[0, 0, -1.15]}>
          <Forme reglages={PALETTE.laiton} position={[0, 0, 0]} trait={0.0026}>
            <cylinderGeometry args={[0.055, 0.105, 0.13, 20, 1, true]} />
          </Forme>
          <mesh position={[0, -0.055, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.1, 20]} />
            <meshBasicMaterial color="#ffd9a0" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/** Le mug : il ne sert a rien, et c'est exactement pourquoi il est la. */
export function Mug({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Forme reglages={PALETTE.ceramique} position={[0, 0.045, 0]} trait={0.0024}>
        <cylinderGeometry args={[0.042, 0.036, 0.09, 18]} />
      </Forme>
      <Forme reglages={PALETTE.ceramique} position={[0.055, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} trait={0.0022}>
        <torusGeometry args={[0.026, 0.007, 8, 16]} />
      </Forme>
    </group>
  );
}

/** La plante : la seule courbe organique d'une scene faite de boites. */
export function Plante({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Forme reglages={PALETTE.ceramique} position={[0, 0.06, 0]} trait={0.0026}>
        <cylinderGeometry args={[0.07, 0.055, 0.12, 16]} />
      </Forme>
      {[
        [0, 0.2, 0, 0.16],
        [0.05, 0.17, 0.03, 0.12],
        [-0.045, 0.16, -0.02, 0.11],
        [0.02, 0.15, -0.05, 0.1],
      ].map(([x, y, z, r], i) => (
        <Forme
          key={i}
          reglages={PALETTE.feuillage}
          position={[x!, y!, z!]}
          rotation={[i * 0.4, i * 1.1, i * 0.3]}
          trait={0.0022}
        >
          <icosahedronGeometry args={[r, 0]} />
        </Forme>
      ))}
    </group>
  );
}

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
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  children?: React.ReactNode;
}) {
  return (
    <group position={position} rotation={rotation}>
      <Forme reglages={PALETTE.boitier} position={[0, 0.008, 0]} trait={0.0026}>
        <boxGeometry args={[0.34, 0.016, 0.24]} />
      </Forme>
      {/* LE CAPOT PIVOTE AUTOUR DE SA CHARNIERE, au bord arriere du socle, et
          d'une vingtaine de degres seulement au-dela de la verticale.
          Premiere version : soixante-huit degres, c'est-a-dire presque a plat.
          L'objet se lisait comme une feuille posee sur la table. Un portable
          ouvert tient entre cent et cent vingt degres d'ouverture totale. */}
      <group position={[0, 0.016, -0.115]} rotation={[-0.32, 0, 0]}>
        <Forme reglages={PALETTE.boitier} position={[0, 0.11, 0]} trait={0.0026}>
          <boxGeometry args={[0.34, 0.22, 0.011]} />
        </Forme>
        {/* La dalle, non eclairee : un ecran allume ne recoit pas d'ombre. */}
        <group position={[0, 0.11, 0.007]}>{children}</group>
      </group>
      {/* Pave tactile et clavier : deux creux suffisent a la lecture. */}
      <Forme reglages={PALETTE.cadre} position={[0, 0.017, 0.055]} trait={0}>
        <boxGeometry args={[0.11, 0.002, 0.07]} />
      </Forme>
      <Forme reglages={PALETTE.cadre} position={[0, 0.017, -0.045]} trait={0}>
        <boxGeometry args={[0.3, 0.002, 0.09]} />
      </Forme>
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
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  children?: React.ReactNode;
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
      {children}
    </group>
  );
}

/** La machine : support de la stack. Un boitier a LED, pose de chant. */
export function Machine({
  position,
  rotation = [0, 0, 0],
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  children?: React.ReactNode;
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
      {children}
    </group>
  );
}

/**
 * La lampe d'architecte : c'est elle qui fait l'ilot de lumiere.
 *
 * RECONSTRUITE EN CHAINE SIMPLE. La premiere version empilait des groupes
 * tournes les uns dans les autres, et l'abat-jour finissait a vingt centimetres
 * du bras — chaque rotation deplacait l'origine de la suivante. Ici chaque
 * segment est place ET tourne explicitement dans le repere de la lampe : plus
 * verbeux, mais on voit ou sont les choses.
 */
export function Lampe({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Forme reglages={PALETTE.pied} position={[0, 0.014, 0]} trait={0.0026}>
        <cylinderGeometry args={[0.08, 0.09, 0.028, 20]} />
      </Forme>
      {/* Le montant, legerement incline */}
      <Forme
        reglages={PALETTE.laiton}
        position={[0.03, 0.24, -0.02]}
        rotation={[0.08, 0, -0.13]}
        trait={0.0024}
      >
        <cylinderGeometry args={[0.012, 0.012, 0.44, 12]} />
      </Forme>
      {/* L'articulation */}
      <Forme reglages={PALETTE.pied} position={[0.06, 0.455, -0.01]} trait={0.0022}>
        <sphereGeometry args={[0.022, 12, 10]} />
      </Forme>
      {/* Le bras, tendu vers le centre du bureau */}
      <Forme
        reglages={PALETTE.laiton}
        position={[0.25, 0.5, 0.08]}
        rotation={[0.28, 0, 1.42]}
        trait={0.0024}
      >
        <cylinderGeometry args={[0.011, 0.011, 0.42, 12]} />
      </Forme>
      {/* L'abat-jour, AU BOUT du bras, ouvert vers le bas et vers l'avant */}
      <group position={[0.44, 0.47, 0.17]} rotation={[0.42, 0, 0.22]}>
        <Forme reglages={PALETTE.laiton} position={[0, 0, 0]} trait={0.0026}>
          <cylinderGeometry args={[0.05, 0.1, 0.12, 20, 1, true]} />
        </Forme>
        {/* La face interieure, non eclairee : c'est l'ampoule qu'on voit. */}
        <mesh position={[0, -0.052, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.095, 20]} />
          <meshBasicMaterial color="#ffd9a0" />
        </mesh>
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

/**
 * La plante : la seule courbe organique d'une scene faite de boites.
 *
 * Les feuilles PARTENT du pot au lieu de flotter au-dessus. La premiere version
 * les posait a vingt centimetres de haut sur un pot qui en fait douze : on
 * voyait un caillou en levitation. Elles se chevauchent aussi entre elles —
 * une touffe est un volume continu, pas une constellation.
 */
export function Plante({ position }: { position: [number, number, number] }) {
  const feuilles: [number, number, number, number][] = [
    [0, 0.15, 0, 0.075],
    [0.055, 0.185, 0.02, 0.062],
    [-0.05, 0.17, -0.03, 0.058],
    [0.02, 0.225, -0.045, 0.05],
    [-0.03, 0.13, 0.055, 0.052],
    [0.06, 0.13, -0.05, 0.045],
  ];
  return (
    <group position={position}>
      <Forme reglages={PALETTE.ceramique} position={[0, 0.055, 0]} trait={0.0026}>
        <cylinderGeometry args={[0.068, 0.05, 0.11, 16]} />
      </Forme>
      {/* Le rebord : un pot sans levre se lit comme un verre. */}
      <Forme reglages={PALETTE.ceramique} position={[0, 0.112, 0]} trait={0.0022}>
        <cylinderGeometry args={[0.074, 0.07, 0.014, 16]} />
      </Forme>
      {feuilles.map(([x, y, z, r], i) => (
        <Forme
          key={i}
          reglages={PALETTE.feuillage}
          position={[x, y, z]}
          rotation={[i * 0.5, i * 1.3, i * 0.4]}
          trait={0.0022}
        >
          <icosahedronGeometry args={[r, 0]} />
        </Forme>
      ))}
    </group>
  );
}

/** Une pile de livres : elle occupe le vide et donne de la verticale. */
export function Livres({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const pile = [
    { h: 0.032, l: 0.22, p: 0.16, c: PALETTE.cadre, d: 0 },
    { h: 0.026, l: 0.21, p: 0.155, c: PALETTE.laiton, d: 0.06 },
    { h: 0.03, l: 0.2, p: 0.15, c: PALETTE.feuillage, d: -0.05 },
  ];
  let y = 0;
  return (
    <group position={position} rotation={rotation}>
      {pile.map((b, i) => {
        const yy = y + b.h / 2;
        y += b.h;
        return (
          <Forme
            key={i}
            reglages={b.c}
            position={[0, yy, 0]}
            rotation={[0, b.d, 0]}
            trait={0.0024}
          >
            <boxGeometry args={[b.l, b.h, b.p]} />
          </Forme>
        );
      })}
    </group>
  );
}

/** Le casque sur son support : un objet qui dit « on y passe des heures ». */
export function Casque({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Forme reglages={PALETTE.pied} position={[0, 0.01, 0]} trait={0.0024}>
        <cylinderGeometry args={[0.055, 0.06, 0.02, 16]} />
      </Forme>
      <Forme reglages={PALETTE.pied} position={[0, 0.11, 0]} trait={0.0022}>
        <cylinderGeometry args={[0.009, 0.009, 0.2, 10]} />
      </Forme>
      {/* L'arceau : un DEMI-tore, d'ou `thetaLength` a PI. */}
      <Forme reglages={PALETTE.boitier} position={[0, 0.2, 0]} trait={0.0024}>
        <torusGeometry args={[0.075, 0.011, 8, 20, Math.PI]} />
      </Forme>
      {[-0.075, 0.075].map((x) => (
        <Forme
          key={x}
          reglages={PALETTE.boitier}
          position={[x, 0.185, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          trait={0.0024}
        >
          <cylinderGeometry args={[0.032, 0.032, 0.026, 14]} />
        </Forme>
      ))}
    </group>
  );
}

/** Des feuillets epars : le desordre qui prouve qu'on travaille. */
export function Feuillets({ position }: { position: [number, number, number] }) {
  const pages: [number, number, number][] = [
    [0, 0, 0.02],
    [0.03, 0.0015, -0.34],
    [-0.02, 0.003, 0.21],
  ];
  return (
    <group position={position}>
      {pages.map(([x, y, r], i) => (
        <Forme
          key={i}
          reglages={PALETTE.papier}
          position={[x, y + 0.0012, 0]}
          rotation={[0, r, 0]}
          trait={0.0018}
        >
          <boxGeometry args={[0.21, 0.0022, 0.29]} />
        </Forme>
      ))}
    </group>
  );
}

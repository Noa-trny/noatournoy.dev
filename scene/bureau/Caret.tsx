"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import type { Locale } from "@/content/routes";
import { finEntete } from "./peinture";

// LA SEULE CHOSE QUI BOUGE DANS CETTE PIECE.
//
// Tout y est fige, et volontairement : les ombres sont cuites une fois, le
// couloir ne s'eclaire pas, la vitre est peinte. Le prix de cette economie est
// que la scene se lit comme une PHOTOGRAPHIE — un bureau parfaitement rendu,
// mais arrete. Le fauteuil vide raconte que quelqu'un vient de sortir ; rien ne
// le confirme.
//
// Un curseur qui clignote suffit a le confirmer, et il suffit qu'il y en ait UN.
// C'est ce qui date la scene de deux minutes plutot que d'un rendu. Deux ou
// trois choses qui bougent feraient un ecran de veille.
//
// IL NE FAIT PAS CLIGNOTER LE NEON, et le choix vaut d'etre ecrit : c'est le
// nom de Noa. Une enseigne qui gresille se lit comme cassee.
//
// CE N'EST PAS LE `curseur.ts` VOISIN, qui arbitre la main du pointeur au
// survol des dalles. Celui-ci est le trait clignotant d'une saisie, et il n'a
// aucun rapport avec la souris.

/** La demi-periode du clignotement. C'est celle d'un terminal. */
const BATTEMENT = 0.53;

/**
 * Le curseur, pose au bout du titre de l'ecran principal.
 *
 * IL VIT DANS LE REPERE DE LA DALLE, pas dans celui de la piece : le peintre
 * travaille en pixels d'une toile de reference, la dalle en metres. La
 * conversion est ici, une fois, et elle suit la dalle si sa taille change.
 */
export function Caret({
  locale,
  largeur,
  hauteur,
  reference,
}: {
  locale: Locale;
  /** Largeur de la dalle qui le porte, en metres. */
  largeur: number;
  hauteur: number;
  /** Le repere du peintre, en pixels. */
  reference: readonly [number, number];
}) {
  const maille = useRef<THREE.Mesh>(null);

  // MESURER EXIGE UNE TOILE, donc le navigateur : au rendu serveur il n'y en a
  // pas. On mesure apres le montage, ce qui laisse le curseur absent d'une
  // image — invisible, puisqu'il passe la moitie de son temps eteint.
  const [fin, setFin] = useState<readonly [number, number] | null>(null);
  useEffect(() => setFin(finEntete(locale)), [locale]);

  // LE MOUVEMENT SE COUPE SI LA MACHINE LE DEMANDE. Un clignotement est
  // exactement ce que `prefers-reduced-motion` vise ; le curseur reste alors
  // allume, ce qui raconte la meme chose sans battre.
  const [sobre] = useState(
    () =>
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // On ecrit `visible` sur le maillage, sans passer par un etat de React : un
  // rendu de React par demi-seconde reconcilierait tout l'arbre de la scene
  // pour allumer un rectangle de neuf pixels.
  useFrame(({ clock }) => {
    if (!maille.current || sobre) return;
    maille.current.visible = Math.floor(clock.elapsedTime / BATTEMENT) % 2 === 0;
  });

  if (!fin) return null;

  const [px, py] = fin;
  const [rx, ry] = reference;
  const l = (9 / rx) * largeur;
  const h = (19 / ry) * hauteur;

  return (
    <mesh
      ref={maille}
      // Le repere du peintre descend, celui de la dalle monte : d'ou le `0.5 -`.
      // La cote verticale vise le MILIEU du caractere, un peu au-dessus de la
      // ligne de base — un curseur cale sur la base flotte sous le mot.
      position={[(px / rx - 0.5) * largeur, (0.5 - (py - 6) / ry) * hauteur, 0.0012]}
      raycast={() => {}}
      castShadow={false}
      receiveShadow={false}
    >
      <planeGeometry args={[l, h]} />
      {/* Non eclairé et hors brouillard, comme la dalle qu'il habite : un
          curseur est de la lumiere emise par l'ecran, pas une piece posee
          devant lui. */}
      <meshBasicMaterial color="#7d8ea6" toneMapped={false} fog={false} />
    </mesh>
  );
}

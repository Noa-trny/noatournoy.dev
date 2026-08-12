"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { materiauContour, materiauCroquis, type ReglagesCroquis } from "./materiau";

// Une forme dessinee : le volume, plus son trait.
//
// Le trait est une COQUE INVERSEE — le meme maillage redessine un peu plus
// gros, en noir, faces arriere seulement. Ne reste visible que ce qui depasse
// de la silhouette, c'est-a-dire le contour. Un appel de dessin par objet,
// aucune passe d'ecran, donc aucun `EffectComposer` a trainer.
//
// Le contour ne participe NI au lancer de rayon NI aux ombres : il double
// sinon le cout du survol et projette une ombre legerement trop grande, ce qui
// se voit comme un halo au pied des objets.

export type FormeProps = {
  children: React.ReactElement;
  reglages: ReglagesCroquis;
  /** Epaisseur du trait. Zero le supprime — utile pour le sol. */
  trait?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
};

export function Forme({
  children,
  reglages,
  trait = 0.012,
  position,
  rotation,
  castShadow = true,
  receiveShadow = true,
}: FormeProps) {
  // Les materiaux sont memorises sur leurs reglages : sans ça, chaque rendu de
  // React en creerait de nouveaux, three recompilerait, et le taux d'images
  // s'effondrerait pour un changement invisible.
  const mat = useMemo(
    () => materiauCroquis(reglages),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reglages.couleur, reglages.paliers, reglages.grain, reglages.rugosite]
  );
  const matTrait = useMemo(() => (trait > 0 ? materiauContour(trait) : null), [trait]);

  return (
    <group position={position} rotation={rotation}>
      <mesh material={mat} castShadow={castShadow} receiveShadow={receiveShadow}>
        {children}
      </mesh>
      {matTrait ? (
        <mesh material={matTrait} raycast={() => {}} castShadow={false} receiveShadow={false}>
          {children}
        </mesh>
      ) : null}
    </group>
  );
}

/** Geometries partagees : un couloir en compte des dizaines d'exemplaires. */
export const G = {
  boite: new THREE.BoxGeometry(1, 1, 1),
  plan: new THREE.PlaneGeometry(1, 1),
  cylindre: new THREE.CylinderGeometry(0.5, 0.5, 1, 16),
};

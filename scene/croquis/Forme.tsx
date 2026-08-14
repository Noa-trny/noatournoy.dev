"use client";

import { useMemo, useState } from "react";
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

type FormeProps = {
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

  // LES DEUX MAILLAGES PARTAGENT UNE GEOMETRIE, et c'est tout l'objet de ce
  // detour par une reference.
  //
  // Rendre `children` aux deux endroits paraissait naturel : c'est le meme
  // element JSX. Mais React le reconcilie comme DEUX fibres distinctes, donc
  // R3F construisait deux `BufferGeometry` et televersait deux fois les memes
  // sommets. Mesure sur la scene : cent dix-neuf maillages pour cent dix-huit
  // geometries distinctes — autant dire aucun partage.
  //
  // On capture donc la geometrie du volume au montage et la coque la reprend
  // telle quelle. Le contour apparait un rendu plus tard, ce qui ne se voit pas.
  //
  // LIMITE ASSUMEE : si la geometrie de `children` change apres le montage — un
  // `args` modifie a chaud —, R3F la remplace sur le maillage sans que la
  // reference se redeclenche, et la coque garde l'ancienne. Cela ne se produit
  // qu'au rechargement a chaud pendant le developpement, ou un remontage suffit
  // a corriger.
  const [geometrie, setGeometrie] = useState<THREE.BufferGeometry | null>(null);

  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={(m) => {
          if (m && m.geometry !== geometrie) setGeometrie(m.geometry);
        }}
        material={mat}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        {children}
      </mesh>
      {matTrait && geometrie ? (
        <mesh
          geometry={geometrie}
          material={matTrait}
          raycast={() => {}}
          castShadow={false}
          receiveShadow={false}
        />
      ) : null}
    </group>
  );
}

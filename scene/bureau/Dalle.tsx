"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { policePrete } from "./peinture";

// UNE SURFACE QUI PORTE DU CONTENU.
//
// Elle dessine tout de suite, avec la police disponible, puis REDESSINE quand
// Inter est chargee. Attendre la police avant de peindre laisserait un
// rectangle noir a l'ecran pendant une seconde — et un rectangle noir sur un
// bureau se lit comme un ecran eteint, c'est-a-dire comme le defaut qu'on est
// justement en train de corriger.
//
// Le materiau est BASIQUE, non eclairé. Un ecran allumé produit sa lumiere : le
// soumettre a la lampe le ferait s'assombrir du cote oppose, ce qu'aucun ecran
// ne fait. Le carnet, lui, est du papier — il prend un materiau standard, passe
// en `eclaire`.

export function Dalle({
  peindre,
  largeur,
  hauteur,
  position,
  rotation,
  eclaire = false,
}: {
  /** Le peintre, appele a chaque redessin. */
  peindre: () => THREE.CanvasTexture;
  largeur: number;
  hauteur: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  eclaire?: boolean;
}) {
  const [version, setVersion] = useState(0);

  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    return peindre();
    // `version` force le redessin quand la police arrive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peindre, version]);

  useEffect(() => {
    let vivant = true;
    policePrete().then(() => {
      if (vivant) setVersion((v) => v + 1);
    });
    return () => {
      vivant = false;
    };
  }, []);

  // La texture precedente est liberee a chaque remplacement : sans ça, chaque
  // redessin laisse une image de plus en memoire graphique.
  useEffect(() => () => tex?.dispose(), [tex]);

  if (!tex) return null;

  return (
    <mesh position={position} rotation={rotation} raycast={() => {}}>
      <planeGeometry args={[largeur, hauteur]} />
      {eclaire ? (
        <meshStandardMaterial map={tex} roughness={0.95} metalness={0} />
      ) : (
        <meshBasicMaterial map={tex} toneMapped={false} />
      )}
    </mesh>
  );
}

"use client";

import { useEffect, useId, useMemo, useState } from "react";
import * as THREE from "three";
import { policePrete } from "./peinture";
import { oublieLaMain, veutLaMain } from "./curseur";

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

type Ligne = {
  /** Bord superieur de la ligne, dans le repere du peintre. */
  readonly y0: number;
  readonly y1: number;
  readonly faire: () => void;
};

export function Dalle({
  peindre,
  largeur,
  hauteur,
  position,
  rotation,
  eclaire = false,
  lignes,
  reference,
}: {
  /** Le peintre, appele a chaque redessin. */
  peindre: () => THREE.CanvasTexture;
  largeur: number;
  hauteur: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  eclaire?: boolean;
  /** Bandes cliquables, en coordonnees du peintre. */
  lignes?: readonly Ligne[];
  /** Le repere du peintre, pour convertir les UV en pixels de toile. */
  reference?: readonly [number, number];
}) {
  const [ligneSurvolee, setLigneSurvolee] = useState<number | null>(null);
  // Une clef propre a cette dalle : deux dalles cliquables ne doivent pas se
  // liberer la main l'une l'autre.
  const clefCurseur = useId();
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

  // Une dalle demontee ne doit pas laisser la main derriere elle.
  useEffect(() => () => oublieLaMain(clefCurseur), [clefCurseur]);

  if (!tex) return null;

  // LE TEST DE CLIC SE FAIT EN COORDONNEES UV.
  //
  // Une surface peinte n'a pas de boutons : il n'y a qu'un maillage et une
  // image. Mais l'evenement de R3F porte `uv`, c'est-a-dire l'endroit exact de
  // la texture que le rayon a touche. On le reconvertit en pixels de toile et
  // l'on sait quelle ligne a ete visee — sans un seul objet supplementaire dans
  // la scene, donc sans alourdir le lancer de rayons.
  //
  // `1 - uv.y` parce que les UV montent quand les pixels de toile descendent.
  const ligneSous = (uv?: THREE.Vector2 | null): number | null => {
    if (!uv || !lignes || !reference) return null;
    const y = (1 - uv.y) * reference[1];
    const i = lignes.findIndex((l) => y >= l.y0 && y <= l.y1);
    return i === -1 ? null : i;
  };

  const interactif = Boolean(lignes && reference);

  return (
    <mesh
      position={position}
      rotation={rotation}
      raycast={interactif ? undefined : () => {}}
      onPointerMove={
        interactif
          ? (e) => {
              const i = ligneSous(e.uv);
              setLigneSurvolee(i);
              veutLaMain(clefCurseur, i !== null);
            }
          : undefined
      }
      onPointerOut={
        interactif
          ? () => {
              setLigneSurvolee(null);
              oublieLaMain(clefCurseur);
            }
          : undefined
      }
      onClick={
        interactif
          ? (e) => {
              const i = ligneSous(e.uv);
              if (i === null) return;
              e.stopPropagation();
              lignes![i]!.faire();
            }
          : undefined
      }
    >
      <planeGeometry args={[largeur, hauteur]} />
      {eclaire ? (
        <meshStandardMaterial map={tex} roughness={0.95} metalness={0} />
      ) : (
        // La ligne survolee eclaircit TOUTE la dalle d'un cheveu. Surligner la
        // ligne elle-meme demanderait de repeindre la toile a chaque mouvement
        // de souris — quinze fois par seconde pour un retour que ce leger
        // eclat suffit a donner, le curseur disant deja lequel.
        <meshBasicMaterial
          map={tex}
          toneMapped={false}
          color={ligneSurvolee === null ? "#ffffff" : "#c9d6ea"}
        />
      )}
    </mesh>
  );
}

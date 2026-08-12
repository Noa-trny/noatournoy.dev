"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { Locale } from "@/content/routes";
import { home } from "@/content/home";
import { texteTexture } from "./texteTexture";
import { policePrete } from "../vitrines/panelTexture";

// La stele d'entree : un monolithe de beton grave, planté au debut du parvis.
//
// C'est ici que le nom vit, dans le monde et non par-dessus lui. Une plaque
// gravee a l'entree est ce qu'un batiment fait naturellement — un cartouche
// HTML flottant devant la camera, non.
//
// Elle se lit de face au depart du trajet, puis la camera la depasse : le nom
// n'occupe l'ecran que le temps qu'il faut.

const LARGEUR = 2.9;
const HAUTEUR = 1.85;
const EPAISSEUR = 0.34;

export function Stele({ locale }: { locale: Locale }) {
  const c = home[locale];
  const [version, setVersion] = useState(0);

  const texture = useMemo(() => {
    const accroche = c.heroSub.map((s) => s.t).join("");
    return texteTexture({
      largeur: 1024,
      hauteur: 640,
      marge: 56,
      lignes: [
        { texte: "Noa", taille: 132, graisse: 800, couleur: "#f4f5f2" },
        { texte: "Tournoy", taille: 132, graisse: 800, couleur: "#f4f5f2" },
        {
          texte: accroche,
          taille: 30,
          graisse: 400,
          couleur: "#cfd3cb",
          avant: 34,
        },
      ],
    });
    // `version` force le redessin quand la police arrive.
  }, [c, version]);

  // Dessine tout de suite, redessine quand Roboto Flex est la. Meme lecon que
  // les panneaux des vitrines : un texte a la mauvaise police vaut mieux qu'un
  // rectangle vide.
  useEffect(() => {
    let vivant = true;
    policePrete().then(() => {
      if (vivant) setVersion((v) => v + 1);
    });
    return () => {
      vivant = false;
    };
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    // Placement contraint par la focale, pas par le gout : en 30 degres, a
    // 3,5 m devant la camera, le champ ne fait que 1,7 m de demi-largeur — la
    // premiere position, a 3,4 m sur le cote, tombait hors cadre. A 8 m elle en
    // fait 3,8, et la stele tient dans l'image tout en laissant le passage.
    <group position={[-2.3, -0.31, 14.5]} rotation={[0, 0.26, 0]}>
      {/* Le monolithe. Legerement fruite — une face parfaitement verticale
          lit comme un panneau publicitaire, pas comme du beton coule. */}
      <mesh position={[0, HAUTEUR / 2, 0]} raycast={() => {}}>
        <boxGeometry args={[LARGEUR, HAUTEUR, EPAISSEUR]} />
        <meshStandardMaterial color="#6e6c66" roughness={0.92} metalness={0} />
      </mesh>

      {/* Le texte, pose sur la face. `alphaTest` plutot que `transparent` :
          pas de tri des transparents pour un texte opaque, et donc pas de
          risque qu'il passe derriere le beton selon l'angle. */}
      <mesh position={[0, HAUTEUR / 2, EPAISSEUR / 2 + 0.004]} raycast={() => {}}>
        <planeGeometry args={[LARGEUR * 0.9, HAUTEUR * 0.9]} />
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.02}
          toneMapped={false}
        />
      </mesh>

      {/* Le filet vert acide en pied, la signature du site. */}
      <mesh position={[0, 0.14, EPAISSEUR / 2 + 0.006]} raycast={() => {}}>
        <planeGeometry args={[LARGEUR * 0.62, 0.035]} />
        <meshBasicMaterial color="#c2f53f" toneMapped={false} />
      </mesh>
    </group>
  );
}

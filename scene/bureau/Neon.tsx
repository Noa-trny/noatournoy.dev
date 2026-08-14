"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { policePrete } from "./peinture";

// L'ENSEIGNE DU MUR : de la typographie, pas de la geometrie.
//
// TROIS VERSIONS EN TUBES ONT ETE JETEES. Chacune reglait mieux que la
// precedente — halo en degrade plutot qu'en opacite constante, coeur blanc
// plutot que sature, tube plus fin, lettres plus etroites — et chacune restait
// laide, parce que le defaut n'etait dans aucun de ces reglages. Il etait dans
// les LETTRES : trois batons droits pour un N, un ovale parfait pour un O, des
// billes aux jonctions. C'est du dessin a la main dans un editeur 3D, et aucun
// reglage de couleur ne rattrape une lettre mal dessinee.
//
// Un dessinateur d'enseigne part d'un caractere. Ici il y en a un, deja charge,
// deja celui du site : Inter. On le PEINT donc, et l'on projette la peinture.
//
// LE HALO EST PEINT LUI AUSSI, en deux dimensions, et c'est ce qui le rend
// juste. `shadowBlur` du contexte 2D est un vrai flou gaussien — la meme chose
// qu'un bloom, calculee une fois au chargement au lieu de deux passes d'ecran
// par image. Le halo geometrique, lui, ne pouvait qu'approcher : une gaine de
// verre n'a pas de decroissance gaussienne.
//
// TROIS TOILES ET NON UNE, une par lettre, parce que la teinte doit differer
// d'une lettre a l'autre. Elles sont peintes en BLANC : c'est la couleur du
// materiau qui les teinte, donc un cycle chromatique ne coute pas un repeinte.

const LETTRES = ["N", "O", "A"] as const;

/** Hauteur d'une lettre, en metres. */
const HAUTEUR = 0.46;
/** Ecart entre deux centres de lettre, en hauteurs. */
const PAS = 0.86;
/** Teintes de depart, voisines : trois couleurs opposees font un chapiteau. */
const DEPARTS = [0, 0.09, 0.18];

// LA TOILE SUIT LA TAILLE REELLE. Une enseigne plus grande occupe plus de
// pixels a l'ecran : a 320 pour 71 cm de plan, on tombait sous cinq cents
// points par metre, et la station des projets amene la camera a un metre du mur
// — ou l'ecran en affiche trois fois plus. Le halo, lui, ne souffre pas d'etre
// doux ; ce sont les bords du COEUR qui trahissent une texture trop petite.
const TOILE = 512;

/**
 * Peint une lettre en blanc, sur fond transparent, avec sa lueur.
 *
 * Les passes de flou vont de la plus large a la plus serree : une seule passe
 * large donne une tache, une seule passe serree un contour dur. C'est leur
 * empilement qui fait la decroissance continue d'un tube allume.
 */
function peindreLettre(lettre: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = TOILE;
  c.height = TOILE;
  const g = c.getContext("2d")!;
  g.textAlign = "center";
  g.textBaseline = "middle";
  // 300 et non 700 : un neon est un TUBE d'epaisseur constante, donc un trait
  // fin. Une graisse forte donne des lettres pleines, qui se lisent comme du
  // plastique retroeclaire.
  g.font = `300 ${TOILE * 0.66}px "Inter", sans-serif`;

  const x = TOILE / 2;
  const y = TOILE / 2;
  g.shadowColor = "rgba(255,255,255,1)";

  for (const [flou, alpha] of [
    [64, 0.55],
    [34, 0.5],
    [16, 0.6],
    [7, 0.8],
  ] as const) {
    g.shadowBlur = flou;
    g.fillStyle = `rgba(255,255,255,${alpha})`;
    g.fillText(lettre, x, y);
  }

  // Le coeur, net et sans lueur : c'est le verre lui-meme.
  g.shadowBlur = 0;
  g.fillStyle = "#ffffff";
  g.fillText(lettre, x, y);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function Neon({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  // LA POLICE D'ABORD, SINON ON CUIT LE REPLI. Peindre avant qu'Inter ne soit
  // chargee grave la fonte systeme dans la texture, definitivement — c'est le
  // piege que `Dalle` documente deja. On peint donc une premiere fois pour ne
  // pas laisser un trou, puis une seconde fois quand la police est la.
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let vivant = true;
    policePrete().then(() => vivant && setVersion((v) => v + 1));
    return () => {
      vivant = false;
    };
  }, []);

  const textures = useMemo(
    () => (typeof document === "undefined" ? null : LETTRES.map((l) => peindreLettre(l))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );

  const materiaux = useMemo(
    () =>
      textures?.map(
        (map) =>
          new THREE.MeshBasicMaterial({
            map,
            transparent: true,
            toneMapped: false,
            depthWrite: false,
            // Additif : une enseigne AJOUTE de la lumiere au mur, elle ne le
            // recouvre pas. C'est aussi ce qui fait disparaitre le rectangle de
            // la toile, dont le noir devient neutre.
            blending: THREE.AdditiveBlending,
          })
      ) ?? null,
    [textures]
  );

  // Les textures et materiaux precedents sont liberes a chaque repeinte : sans
  // ça, la seconde passe laisse la premiere en memoire graphique.
  useEffect(
    () => () => {
      textures?.forEach((t) => t.dispose());
      materiaux?.forEach((m) => m.dispose());
    },
    [textures, materiaux]
  );

  useFrame((etat) => {
    if (!materiaux) return;
    const t = etat.clock.elapsedTime * 0.014;
    materiaux.forEach((m, i) => {
      // Clarte elevee, saturation moyenne : la toile est deja blanche au coeur
      // et coloree dans sa lueur, la teinte ne fait que l'habiller.
      m.color.setHSL((t + (DEPARTS[i] ?? 0)) % 1, 0.8, 0.62);
    });
  });

  if (!materiaux) return null;

  return (
    <group position={position} rotation={rotation}>
      {materiaux.map((m, i) => (
        <mesh key={i} position={[i * PAS * HAUTEUR, 0, 0]} material={m}>
          {/* La toile est carree, le plan aussi : la lueur deborde de la lettre
              et a besoin de cette marge pour ne pas etre coupee au bord. */}
          <planeGeometry args={[HAUTEUR * 1.55, HAUTEUR * 1.55]} />
        </mesh>
      ))}
    </group>
  );
}

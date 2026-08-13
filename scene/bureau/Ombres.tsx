"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";

// LES OMBRES SONT CUITES UNE FOIS, PUIS GELEES.
//
// La lampe du bureau est une lampe PONCTUELLE qui porte des ombres, et c'est de
// loin le poste le plus cher de la scene : une source ponctuelle projette dans
// les six directions, donc three redessine tous les objets porteurs d'ombre SIX
// FOIS par image, dans une carte cubique de 1024 pixels de cote. Mesure sur une
// Intel UHD : deux cents appels de rendu et vingt millisecondes par image, pour
// une lampe qui ne bouge pas, dans une piece ou rien ne bouge non plus.
//
// Rien ne bouge : c'est toute la justification. On rend donc la carte d'ombres
// une fois, on la gele, et l'on ne la refait que lorsque la scene CHANGE
// vraiment — c'est-a-dire quand un modele importe finit d'arriver.
//
// LE RAFRAICHISSEMENT EST DEMANDE, PAS DEVINE. Compter les images, ou attendre
// deux secondes, aurait marche sur cette machine et rate sur une connexion
// lente : les trois modeles arrivent par le reseau, et un fauteuil qui se pose
// apres le gel n'aurait jamais d'ombre. Ce sont donc les objets eux-memes qui
// signalent leur arrivee, au montage.

let demandes = 0;

/** A appeler quand quelque chose entre dans la scene ou en sort. */
export function rafraichirOmbres() {
  demandes += 1;
}

export function OmbresFigees() {
  const gl = useThree((s) => s.gl);
  const vues = useRef(-1);
  const restantes = useRef(0);

  useFrame(() => {
    if (vues.current !== demandes) {
      vues.current = demandes;
      // DEUX images et non une : la premiere peut tomber pendant le montage du
      // nouvel objet, avant que ses matrices monde ne soient a jour, et l'ombre
      // serait alors cuite a la mauvaise place.
      restantes.current = 2;
    }

    if (restantes.current > 0) {
      restantes.current -= 1;
      gl.shadowMap.autoUpdate = true;
      gl.shadowMap.needsUpdate = true;
    } else if (gl.shadowMap.autoUpdate) {
      gl.shadowMap.autoUpdate = false;
    }
  });

  return null;
}

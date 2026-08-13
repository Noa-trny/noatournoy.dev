"use client";

import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { materiauContour, materiauCroquis, type ReglagesCroquis } from "./materiau";

// UN MODELE IMPORTE, REDESSINE AU CROQUIS.
//
// Tout le reste du monde est bati en primitives, et pour de bonnes raisons :
// quelques kilooctets, aucune licence a suivre, et un ecran qu'on deplace en
// changeant une ligne. Mais une primitive ne fait pas tout. Un arceau de casque
// qui epouse une tete, un dossier de fauteuil, une feuille : ces formes-la
// n'existent pas dans un catalogue de boites et de cylindres, et les
// approximer donne exactement ce qu'on obtenait — un tore et deux cylindres qui
// disent « casque » sans en avoir l'air.
//
// CE COMPOSANT EXISTE PARCE QU'UN `useGLTF` NE SUFFIT PAS ICI. Un modele arrive
// avec ses propres materiaux, et les afficher tels quels poserait au milieu
// d'une scene dessinee un objet photographie : pas de paliers, pas de grain, pas
// de contour. Il serait plus detaille que tout le reste et sonnerait faux pour
// cette raison meme. On garde donc la GEOMETRIE — la seule chose qu'on est venu
// chercher — et l'on jette tout le reste.
//
// LE CHARGEUR EST LE `GLTFLoader` NU, sans `useGLTF` de drei. Celui-ci installe
// par defaut un decodeur Draco pointant sur `gstatic.com`, que la CSP du site
// (`connect-src 'self'`) bloque : la dependance ne se declencherait que le jour
// ou un modele compresse arriverait, c'est-a-dire longtemps apres qu'on aurait
// oublie qu'elle existe. Ici, ce qui n'est pas ecrit ne peut pas se declencher.

export function Importe({
  url,
  reglages,
  trait = 0.0024,
  position,
  rotation,
  scale,
}: {
  url: string;
  reglages: ReglagesCroquis;
  /** Epaisseur du contour. Zero le supprime. */
  trait?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}) {
  const gltf = useLoader(GLTFLoader, url);

  const objet = useMemo(() => {
    const mat = materiauCroquis(reglages);
    const matTrait = trait > 0 ? materiauContour(trait) : null;

    // CLONE, et ce n'est pas une precaution de style. `useLoader` met le resultat
    // en cache par URL : ecrire les materiaux sur la scene chargee les ecrirait
    // pour tous les usages du meme fichier, y compris ceux montes plus tard avec
    // d'autres reglages. Le clone partage les geometries — ce qu'on veut — et
    // rien d'autre.
    const racine = gltf.scene.clone(true);

    // La liste est faite AVANT d'ajouter quoi que ce soit : `traverse` marche
    // sur l'arbre vivant, et greffer une coque pendant le parcours la ferait
    // visiter a son tour, donc doubler indefiniment.
    const maillages: THREE.Mesh[] = [];
    racine.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) maillages.push(o as THREE.Mesh);
    });

    for (const m of maillages) {
      m.material = mat;
      m.castShadow = true;
      m.receiveShadow = true;
      if (matTrait) {
        // La coque est ENFANT du maillage, donc elle herite de sa
        // transformation : aucune matrice a tenir a jour, et le contour ne peut
        // pas deriver si le modele est deplace ou remis a l'echelle.
        const coque = new THREE.Mesh(m.geometry, matTrait);
        coque.raycast = () => {};
        coque.castShadow = false;
        coque.receiveShadow = false;
        m.add(coque);
      }
    }
    return racine;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf, trait, reglages.couleur, reglages.paliers, reglages.grain, reglages.plancher]);

  return (
    <primitive object={objet} position={position} rotation={rotation} scale={scale} />
  );
}

/**
 * Demande le fichier avant qu'on en ait besoin.
 *
 * Un modele charge a l'instant ou la camera arrive dessus apparait EN RETARD,
 * et le retard se lit comme un defaut alors que c'est la latence du reseau.
 * Appele au montage de la scene, le fichier est la bien avant la station.
 */
export function precharger(url: string) {
  useLoader.preload(GLTFLoader, url);
}

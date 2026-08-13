"use client";

import { useLoader } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { materiauContour, materiauCroquis, type ReglagesCroquis } from "./materiau";
import { rafraichirOmbres } from "../bureau/Ombres";

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

/**
 * Les reglages : soit UN jeu pour tout l'objet, soit un par nom de materiau.
 *
 * La plupart des objets du bureau sont d'une seule matiere — un casque est noir,
 * un fauteuil aussi. Une plante en pot, non : pot, terre et feuillage sont trois
 * matieres, et les peindre d'une seule couleur donne une sculpture verte. La
 * clef est le NOM du materiau tel qu'il vit dans le fichier ; c'est la seule
 * chose stable qu'un modele conserve a travers la chaine de preparation, l'ordre
 * des primitives, lui, ne l'etant pas.
 */
export type ReglagesParMateriau = { readonly [nom: string]: ReglagesCroquis };

const estUnSeul = (r: ReglagesCroquis | ReglagesParMateriau): r is ReglagesCroquis =>
  "couleur" in r;

export function Importe({
  url,
  reglages,
  trait = 0.0024,
  position,
  rotation,
  scale,
}: {
  url: string;
  reglages: ReglagesCroquis | ReglagesParMateriau;
  /** Epaisseur du contour. Zero le supprime. */
  trait?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}) {
  const gltf = useLoader(GLTFLoader, url);

  const objet = useMemo(() => {
    // UN MATERIAU PAR NOM, ET NON PAR MAILLAGE. Les creer dans la boucle en
    // ferait un par primitive : three les compilerait separement et le cache de
    // programmes ne pourrait pas les regrouper, alors que ce sont les memes.
    const parNom = new Map<string, THREE.Material>();
    const donner = (nom: string) => {
      const trouve = parNom.get(nom);
      if (trouve) return trouve;
      const r = estUnSeul(reglages)
        ? reglages
        : (reglages[nom] ?? Object.values(reglages)[0]!);
      const m = materiauCroquis(r);
      parNom.set(nom, m);
      return m;
    };
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
      // Le nom du materiau D'ORIGINE, lu avant de l'ecraser : c'est la clef.
      const nom = Array.isArray(m.material)
        ? (m.material[0]?.name ?? "")
        : (m.material?.name ?? "");
      m.material = donner(nom);
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
    // `reglages` est compare par sa forme serialisee : les appelants passent un
    // litteral, donc une nouvelle reference a chaque rendu, et depender de la
    // reference recreerait tous les materiaux par image.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf, trait, JSON.stringify(reglages)]);

  // LA CARTE D'OMBRES EST GELEE une fois la scene posee : un objet qui arrive
  // par le reseau apres le gel n'aurait aucune ombre, et flotterait. Il demande
  // donc lui-meme une cuisson de plus — la seule façon fiable, puisque personne
  // d'autre ne sait quand il est arrive.
  useEffect(() => {
    rafraichirOmbres();
  }, [objet]);

  return (
    <primitive object={objet} position={position} rotation={rotation} scale={scale} />
  );
}

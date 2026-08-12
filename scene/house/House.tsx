"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { scroll } from "../scroll/scrollState";
import { GLASS_T, GLASS_BANDE } from "../camera/path";

// La maison.
//
// Le modele vient de Visthetique (CC BY 4.0), retexture en beton banche,
// remis a l'echelle du metre — il arrivait a 7,90x — et recentre sur sa baie.
// Les reperes utiles sont dans `scene/camera/path.ts`, tous MESURES sur le
// fichier reellement servi.
//
// Il est compresse en EXT_meshopt_compression — 2,7 Mo pour 137 000 triangles,
// la ou la source en faisait 119 et 948 000. C'est ce qui impose
// `'wasm-unsafe-eval'` dans la CSP, et c'est documente dans proxy.ts.

const MODELE = "/models/villa.glb";

export function House() {
  const { scene } = useGLTF(MODELE);
  const vitrages = useRef<THREE.Material[]>([]);

  // On travaille sur une copie : `useGLTF` met la scene en cache, et muter
  // l'original ferait porter nos reglages a toute autre instance.
  const modele = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    const verres: THREE.Material[] = [];

    modele.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;

      // Rien de la maison n'est cliquable : les vitrines poseront leurs propres
      // gestionnaires en phase 8. Sans ce retrait, R3F parcourrait tout le
      // sous-arbre a chaque evenement de pointeur.
      mesh.raycast = () => {};
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        if (!m) continue;
        // TOUT ce qui commence par « glass », pas le nom exact. Le modele
        // livre `Glass` ET `Glassend` ; ne traiter que le premier laissait la
        // moitie du vitrage opaque au franchissement, c'est-a-dire un mur
        // transparent qui reste en travers du chemin.
        if (m.name.toLowerCase().startsWith("glass")) {
          // On isole une copie par materiau de verre : le fondu au
          // franchissement ne doit pas modifier le cache de useGLTF.
          // Le verre ne porte pas d'ombre : une vitre qui projetterait une
          // ombre pleine plongerait l'interieur dans le noir, ce qui est
          // l'inverse de ce qu'une baie fait. Il en RECOIT, en revanche.
          mesh.castShadow = false;
          const copie = m.clone();
          copie.transparent = true;
          copie.depthWrite = false;
          (copie as THREE.MeshStandardMaterial).roughness = 0.04;
          (copie as THREE.MeshStandardMaterial).metalness = 0;
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((x) => (x === m ? copie : x));
          } else {
            mesh.material = copie;
          }
          verres.push(copie);
        }
      }
    });

    vitrages.current = verres;
  }, [modele]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    if (!vitrages.current.length) return;

    // LE FRANCHISSEMENT.
    //
    // La vitre s'efface a l'approche puis revient derriere nous. Deux raisons
    // de la faire disparaitre plutot que de la traverser telle quelle : le plan
    // proche finirait par la trancher en pleine frame, et une nappe
    // transparente plein cadre coute cher a trier au moment ou la scene est la
    // plus chargee.
    const loin = THREE.MathUtils.clamp(
      Math.abs(scroll.eased - GLASS_T) / GLASS_BANDE,
      0,
      1
    );
    const cible = 0.34 * loin;

    for (const m of vitrages.current) {
      const mat = m as THREE.MeshStandardMaterial;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, cible, 10, dt);
      // En dessous de ce seuil on retire l'objet du tri des transparents
      // plutot que de dessiner une surface invisible.
      mat.visible = mat.opacity > 0.004;
    }
  });

  return <primitive object={modele} />;
}

useGLTF.preload(MODELE);

"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// LE NEON DU MUR : trois lettres en tubes, et leur halo.
//
// POURQUOI DES TUBES ET NON UNE TEXTURE. Un neon peint sur un plan se trahit
// des qu'on l'approche : il n'a pas d'epaisseur, donc pas de tranche eclairee ni
// de recouvrement aux angles. Les stations amenent la camera a un metre du mur.
// Sept cylindres et un tore coutent moins qu'une toile de 1024 pixels, et
// tiennent le gros plan.
//
// POURQUOI PAS DE POST-TRAITEMENT. Le halo d'un neon, c'est ce qu'un
// `UnrealBloomPass` ferait — et un `EffectComposer` tirerait quarante
// kilooctets tout en invalidant le prechauffage des shaders, le piege que ce
// projet evite depuis le debut.
//
// POURQUOI AUCUNE LUMIERE. Une source de plus, c'est une passe d'eclairage de
// plus sur TOUS les materiaux de la scene, couloir compris — on vient
// justement de ramener les programmes de vingt-deux a huit. La lampe magenta
// qui lave deja ce mur fait le travail ; ce qu'on ajoute ici, c'est ce qu'on
// VOIT briller, pas ce qui eclaire.

/** Un trait de lettre : deux points dans le plan de la lettre. */
type Trait = readonly [number, number, number, number];

/**
 * Les trois lettres, en unites de hauteur de lettre.
 *
 * `O` n'est pas un trait mais un anneau : le tracer en segments donnerait un
 * polygone, et un neon en polygone se lit comme un panneau de signalisation.
 */
// LES LETTRES SONT ETROITES, et c'est la moitie de ce qui separe une enseigne
// d'un jeu de cubes. A 0,6 de large pour 1 de haut, un N est presque carre : le
// dessin se lit comme des lettres de bloc. Une enseigne au neon est etiree en
// hauteur, parce qu'un tube plie garde son rayon et qu'un dessin large parait
// gras a diametre egal.
const LETTRES: readonly { readonly traits: readonly Trait[]; readonly anneau?: true }[] = [
  // N : deux montants et la diagonale qui les joint.
  { traits: [[0, 0, 0, 1], [0, 1, 0.52, 0], [0.52, 0, 0.52, 1]] },
  // O
  { traits: [], anneau: true },
  // A : deux obliques et la barre.
  { traits: [[0, 0, 0.26, 1], [0.26, 1, 0.52, 0], [0.1, 0.36, 0.42, 0.36]] },
];

const HAUTEUR = 0.42;
/** L'ecart entre deux lettres, en hauteurs de lettre. Une lettre fait 0,52. */
const PAS = 0.88;
// UN TUBE PLUS FIN. A 0,042 pour une lettre de 1, le trait faisait un
// douzieme de la hauteur — l'epaisseur d'un feutre d'ecolier. Un tube de neon
// reel avoisine le vingtieme.
const RAYON = 0.03;
/** Le halo, en multiples du rayon du tube. */
const AMPLEUR = 3.4;

/**
 * LES TROIS TEINTES SONT VOISINES, ET NON OPPOSEES.
 *
 * Elles etaient a un tiers de cercle l'une de l'autre — l'ecart MAXIMAL, donc
 * jaune, cyan et rose ensemble : la palette d'une fete d'anniversaire. Un
 * dixieme suffit a ce que les trois se distinguent tout en restant de la meme
 * famille, et le cycle continue de traverser tout le spectre — on garde le RVB
 * sans le chapiteau.
 */
const DEPARTS = [0, 0.1, 0.2];

/**
 * LE HALO A UN DEGRADE, ET C'EST TOUT CE QUI LE SEPARE D'UN TUBE EN PLASTIQUE.
 *
 * Sa premiere version etait un cylindre plus large en fondu additif, d'opacite
 * CONSTANTE. De loin ça passait ; de pres on voyait exactement ce que c'etait —
 * un gros tube translucide a bord net. Et comme le fondu additif s'ajoute a
 * lui-meme, les croisements de traits et les deux parois d'un meme cylindre
 * s'empilaient jusqu'au blanc.
 *
 * Ici l'opacite suit l'angle entre la normale et le regard : pleine la ou le
 * tube fait face a la camera, nulle a sa silhouette. La gaine n'a donc plus de
 * bord — elle s'eteint d'elle-meme — et une seule face est rendue, ce qui
 * supprime l'empilement.
 */
const HALO_SOMMET = /* glsl */ `
  varying vec3 vNormale;
  varying vec3 vVersOeil;
  void main() {
    vec4 vue = modelViewMatrix * vec4(position, 1.0);
    vNormale = normalize(normalMatrix * normal);
    vVersOeil = normalize(-vue.xyz);
    gl_Position = projectionMatrix * vue;
  }
`;

const HALO_FRAGMENT = /* glsl */ `
  uniform vec3 uCouleur;
  uniform float uForce;
  varying vec3 vNormale;
  varying vec3 vVersOeil;
  void main() {
    float face = max(dot(normalize(vNormale), normalize(vVersOeil)), 0.0);
    // Puissance 2,5 : en lineaire la gaine reste visible presque jusqu'au bord
    // et redessine la silhouette du tube. Il faut que l'extinction soit
    // franche pour qu'on lise une lueur et non un volume.
    gl_FragColor = vec4(uCouleur, pow(face, 2.5) * uForce);
  }
`;

export function Neon({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const coeurs = useRef<{ mat: THREE.MeshBasicMaterial; depart: number }[]>([]);
  const gaines = useRef<{ mat: THREE.ShaderMaterial; depart: number }[]>([]);

  const lettres = useMemo(() => {
    // Deux jeux de geometries, un fin et un epais — et non un seul mis a
    // l'echelle. Mettre le GROUPE a l'echelle agrandissait les positions autant
    // que les tubes : le halo se retrouvait plus grand ET decale, un second
    // « NOA » fantome. Seul le RAYON doit grossir.
    const tube = new THREE.CylinderGeometry(RAYON, RAYON, 1, 12, 1, true);
    const tubeHalo = new THREE.CylinderGeometry(RAYON * AMPLEUR, RAYON * AMPLEUR, 1, 14, 1, true);
    const bille = new THREE.SphereGeometry(RAYON, 12, 8);
    // L'ANNEAU EST OVALE, pas rond. Un tore de rayon 0,3 dans une lettre haute
    // de 1 donne un O qui n'occupe que six dixiemes de la hauteur : a cote d'un
    // N et d'un A pleine hauteur, il se lit comme un point.
    const anneau = new THREE.TorusGeometry(0.26, RAYON, 8, 34);
    const anneauHalo = new THREE.TorusGeometry(0.26, RAYON * AMPLEUR, 10, 34);

    return LETTRES.map((l, i) => {
      const segments = l.traits.map(([x1, y1, x2, y2]) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return {
          position: [(x1 + x2) / 2, (y1 + y2) / 2, 0] as [number, number, number],
          // Un cylindre pointe vers +Y : l'angle se mesure depuis la verticale,
          // d'ou le quart de tour retire.
          rotation: [0, 0, Math.atan2(dy, dx) - Math.PI / 2] as [number, number, number],
          longueur: Math.hypot(dx, dy),
        };
      });
      // LES JONCTIONS SONT DES BILLES. Deux cylindres qui se rencontrent a
      // angle laissent un coin vide, et un neon n'en a pas — le verre y est
      // continu. Une sphere par extremite ferme l'angle pour dix triangles.
      const noeuds = l.traits.flatMap(([x1, y1, x2, y2]) => [
        [x1, y1, 0] as [number, number, number],
        [x2, y2, 0] as [number, number, number],
      ]);
      return {
        segments,
        noeuds,
        anneau: l.anneau,
        decalage: i * PAS,
        depart: DEPARTS[i] ?? 0,
        tube,
        tubeHalo,
        bille,
        anneauGeo: anneau,
        anneauHalo,
      };
    });
  }, []);

  // LA COULEUR TOURNE, ET C'EST LA SEULE ANIMATION DE LA SCENE. Un neon de
  // bureau ne clignote pas : il derive. Un cycle complet en quarante secondes se
  // remarque sans distraire, et l'ecart d'un tiers de cercle entre les lettres
  // fait qu'a tout instant les trois different.
  useFrame((etat) => {
    const t = etat.clock.elapsedTime * 0.014;
    // LE COEUR EST PRESQUE BLANC, LE HALO PORTE LA COULEUR. C'est ce qui
    // distingue un neon d'un tube de plastique colore, et c'etait le defaut
    // principal : un tube saturé plein se lit comme un jouet. Dans un vrai
    // neon, le gaz chauffe au blanc et seule la lueur alentour est teintee —
    // c'est ainsi qu'une enseigne photographie.
    for (const c of coeurs.current) c.mat.color.setHSL((t + c.depart) % 1, 0.22, 0.93);
    for (const g of gaines.current) {
      (g.mat.uniforms.uCouleur!.value as THREE.Color).setHSL((t + g.depart) % 1, 1, 0.52);
    }
  });

  const materiauGaine = (depart: number) => (m: THREE.ShaderMaterial | null) => {
    if (m && !gaines.current.some((g) => g.mat === m)) gaines.current.push({ mat: m, depart });
  };
  const materiauCoeur = (depart: number) => (m: THREE.MeshBasicMaterial | null) => {
    if (m && !coeurs.current.some((c) => c.mat === m)) coeurs.current.push({ mat: m, depart });
  };

  /** La gaine : un seul cote rendu, aucune ecriture de profondeur. */
  const gaine = (depart: number) => (
    <shaderMaterial
      ref={materiauGaine(depart)}
      args={[
        {
          uniforms: { uCouleur: { value: new THREE.Color() }, uForce: { value: 0.62 } },
          vertexShader: HALO_SOMMET,
          fragmentShader: HALO_FRAGMENT,
        },
      ]}
      transparent
      depthWrite={false}
      side={THREE.FrontSide}
      blending={THREE.AdditiveBlending}
    />
  );

  return (
    <group position={position} rotation={rotation}>
      {lettres.map((l, i) => (
        <group key={i} position={[l.decalage * HAUTEUR, 0, 0]} scale={HAUTEUR}>
          {l.anneau ? (
            <>
              <mesh position={[0.26, 0.5, 0]} scale={[1, 1.88, 1]} geometry={l.anneauGeo}>
                <meshBasicMaterial ref={materiauCoeur(l.depart)} toneMapped={false} />
              </mesh>
              <mesh position={[0.26, 0.5, 0]} scale={[1, 1.88, 1]} geometry={l.anneauHalo}>
                {gaine(l.depart)}
              </mesh>
            </>
          ) : null}

          {l.segments.map((s, j) => (
            <group key={j} position={s.position} rotation={s.rotation} scale={[1, s.longueur, 1]}>
              <mesh geometry={l.tube}>
                <meshBasicMaterial ref={materiauCoeur(l.depart)} toneMapped={false} />
              </mesh>
              <mesh geometry={l.tubeHalo}>{gaine(l.depart)}</mesh>
            </group>
          ))}

          {l.noeuds.map((p, j) => (
            <mesh key={`n${j}`} position={p} geometry={l.bille}>
              <meshBasicMaterial ref={materiauCoeur(l.depart)} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

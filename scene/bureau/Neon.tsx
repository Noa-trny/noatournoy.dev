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
// projet evite depuis le debut. Le halo est donc GEOMETRIQUE : chaque trait est
// dessine deux fois, un coeur mince et vif, une gaine plus large en fondu
// additif. C'est la meme ruse que le contour en coque inversee, retournee.
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
const LETTRES: readonly { readonly traits: readonly Trait[]; readonly anneau?: true }[] = [
  // N : deux montants et la diagonale qui les joint.
  { traits: [[0, 0, 0, 1], [0, 1, 0.6, 0], [0.6, 0, 0.6, 1]] },
  // O
  { traits: [], anneau: true },
  // A : deux obliques et la barre.
  { traits: [[0, 0, 0.3, 1], [0.3, 1, 0.6, 0], [0.12, 0.38, 0.48, 0.38]] },
];

const HAUTEUR = 0.26;
const PAS = 0.72;
const RAYON = 0.05;

/** Les trois teintes de depart, reparties sur le cercle chromatique. */
const DEPARTS = [0, 0.34, 0.68];

export function Neon({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const materiaux = useRef<THREE.MeshBasicMaterial[]>([]);

  // Les geometries sont construites une fois : elles ne dependent de rien.
  const lettres = useMemo(() => {
    // Un cylindre unite, oriente sur Y, mis a l'echelle et tourne par trait :
    // trois geometries partagees pour tout le neon plutot qu'une par segment.
    // DEUX JEUX DE GEOMETRIES, un fin et un epais — et non un seul mis a
    // l'echelle. Mettre le GROUPE a l'echelle 2,1 agrandissait les positions
    // autant que les tubes : le halo se retrouvait deux fois plus grand ET
    // decale, un second « NOA » fantome en haut a droite du vrai. Seul le
    // RAYON doit grossir.
    const tube = new THREE.CylinderGeometry(RAYON, RAYON, 1, 10, 1, true);
    const tubeHalo = new THREE.CylinderGeometry(RAYON * 3, RAYON * 3, 1, 10, 1, true);
    const bille = new THREE.SphereGeometry(RAYON, 10, 8);
    // L'ANNEAU EST OVALE, pas rond. Un tore de rayon 0,3 dans une lettre haute
    // de 1 donne un O qui n'occupe que six dixiemes de la hauteur : a cote d'un
    // N et d'un A pleine hauteur, il se lit comme un point. On l'etire donc sur
    // Y a la hauteur des autres — ce qui est aussi ce que fait un O dessine.
    const anneau = new THREE.TorusGeometry(0.3, RAYON, 8, 30);
    const anneauHalo = new THREE.TorusGeometry(0.3, RAYON * 3, 8, 30);

    return LETTRES.map((l, i) => {
      const segments = l.traits.map(([x1, y1, x2, y2]) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const long = Math.hypot(dx, dy);
        return {
          position: [(x1 + x2) / 2, (y1 + y2) / 2, 0] as [number, number, number],
          // Un cylindre pointe vers +Y : l'angle est donc mesure depuis la
          // verticale, d'ou le quart de tour retire.
          rotation: [0, 0, Math.atan2(dy, dx) - Math.PI / 2] as [number, number, number],
          longueur: long,
        };
      });
      // LES JONCTIONS SONT DES BILLES. Deux cylindres qui se rencontrent a
      // angle laissent un coin vide, et un neon n'a pas de coin vide — le verre
      // y est continu. Une sphere au bout de chaque trait ferme l'angle pour
      // dix triangles.
      const noeuds = l.traits.flatMap(([x1, y1, x2, y2]) => [
        [x1, y1, 0] as [number, number, number],
        [x2, y2, 0] as [number, number, number],
      ]);
      return { segments, noeuds, anneau: l.anneau, decalage: i * PAS, depart: DEPARTS[i] ?? 0 };
    }).map((l) => ({ ...l, tube, tubeHalo, bille, anneauGeo: anneau, anneauHalo }));
  }, []);

  // LA COULEUR TOURNE, ET C'EST LA SEULE ANIMATION DE LA SCENE. Un neon RVB de
  // bureau ne clignote pas : il derive lentement. Un cycle complet en quarante
  // secondes se remarque sans jamais distraire — et l'ecart d'un tiers de
  // cercle entre les lettres fait qu'a tout instant les trois sont differentes.
  useFrame((etat) => {
    const t = etat.clock.elapsedTime * 0.025;
    for (const m of materiaux.current) {
      if (!m) continue;
      const depart = m.userData.depart as number;
      m.color.setHSL((t + depart) % 1, 0.9, m.userData.halo ? 0.55 : 0.66);
    }
  });

  const inscrire = (m: THREE.MeshBasicMaterial | null, depart: number, halo: boolean) => {
    if (!m) return;
    m.userData.depart = depart;
    m.userData.halo = halo;
    if (!materiaux.current.includes(m)) materiaux.current.push(m);
  };

  return (
    <group position={position} rotation={rotation}>
      {lettres.map((l, i) => (
        <group key={i} position={[l.decalage * HAUTEUR, 0, 0]} scale={HAUTEUR}>
          {/* Deux passes : le coeur, puis la gaine. La gaine est plus large,
              en fondu additif et sans ecriture de profondeur — elle ne doit
              masquer ni le coeur ni ce qui se trouve derriere. */}
          {[false, true].map((halo) => (
            <group key={String(halo)}>
              {l.anneau ? (
                <mesh
                  position={[0.3, 0.5, 0]}
                  scale={[1, 1.62, 1]}
                  geometry={halo ? l.anneauHalo : l.anneauGeo}
                >
                  <meshBasicMaterial
                    ref={(m) => inscrire(m, l.depart, halo)}
                    toneMapped={false}
                    transparent={halo}
                    opacity={halo ? 0.13 : 1}
                    blending={halo ? THREE.AdditiveBlending : THREE.NormalBlending}
                    depthWrite={!halo}
                  />
                </mesh>
              ) : null}
              {l.segments.map((s, j) => (
                <mesh
                  key={j}
                  position={s.position}
                  rotation={s.rotation}
                  scale={[1, s.longueur, 1]}
                  geometry={halo ? l.tubeHalo : l.tube}
                >
                  <meshBasicMaterial
                    ref={(m) => inscrire(m, l.depart, halo)}
                    toneMapped={false}
                    transparent={halo}
                    opacity={halo ? 0.13 : 1}
                    blending={halo ? THREE.AdditiveBlending : THREE.NormalBlending}
                    depthWrite={!halo}
                  />
                </mesh>
              ))}
              {!halo
                ? l.noeuds.map((p, j) => (
                    <mesh key={`n${j}`} position={p} geometry={l.bille}>
                      <meshBasicMaterial
                        ref={(m) => inscrire(m, l.depart, false)}
                        toneMapped={false}
                      />
                    </mesh>
                  ))
                : null}
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Forme } from "../croquis/Forme";

// LA FENETRE, ET CE QU'ELLE REPARE.
//
// La piece n'avait aucun exterieur. Le remplissage froid qui baigne toute la
// scene — celui qui empeche le chaud de la lampe de tout envahir — ne venait de
// NULLE PART : il existait parce qu'on l'avait pose, pas parce que quelque
// chose l'emettait. C'est la difference entre une piece et un decor de studio,
// et elle se sent avant de se voir.
//
// LA VITRE EST PEINTE, PAS ECLAIREE. Une nuit de ville derriere une vitre, ce
// sont quelques points chauds dans un degrade froid : une toile de 256 pixels
// le dit mieux qu'une geometrie, et ne coute qu'un appel de rendu. Le materiau
// est basique — une fenetre de nuit EMET, elle ne recoit pas.
//
// ET AUCUNE LUMIERE N'EST AJOUTEE. Le remplissage froid existe deja et suffit ;
// ce qui manquait n'etait pas de la lumiere mais sa CAUSE. Une source de plus
// couterait une passe d'eclairage sur tous les materiaux de la scene, couloir
// compris, pour un effet que l'oeil attribue de toute façon a la fenetre des
// qu'elle est la.

const CADRE = { couleur: "#1a1e26", paliers: 3, grain: 0.07, plancher: 0.2 } as const;

const LARGEUR = 1.72;
const HAUTEUR = 1.24;
const MONTANT = 0.05;

/**
 * Peint la nuit derriere la vitre.
 *
 * Les lumieres sont groupees BAS et vers le centre : une ville vue d'un premier
 * etage occupe le tiers inferieur du cadre, le reste est du ciel. Les repartir
 * uniformement donnerait un ciel etoile, ce qui n'est pas la meme histoire.
 */
function peindreNuit(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 192;
  const g = c.getContext("2d")!;

  const ciel = g.createLinearGradient(0, 0, 0, c.height);
  // PLUS CLAIRE QU'UNE VRAIE NUIT, et c'est une correction de point de vue.
  // Sur le mur de gauche, aucune camera ne la regarde de face : elle est vue a
  // soixante-six degres de sa normale, donc ecrasee sur quelques dizaines de
  // pixels. A la valeur d'une nuit reelle elle rendait noire, c'est-a-dire
  // comme un cadre vide. Une fenetre qu'on voit de biais doit etre plus
  // lumineuse pour se lire autant.
  ciel.addColorStop(0, "#0d1526");
  ciel.addColorStop(0.62, "#16233c");
  // L'horizon est le seul endroit clair : c'est la lueur de la ville sur les
  // nuages, et c'est elle qui donne sa direction au bleu de la piece.
  ciel.addColorStop(1, "#2e456b");
  g.fillStyle = ciel;
  g.fillRect(0, 0, c.width, c.height);

  // Une generation DETERMINISTE : `Math.random` donnerait une ville differente
  // a chaque rendu serveur et client, donc une divergence d'hydratation — et,
  // plus betement, une fenetre qui change a chaque rechargement.
  let graine = 1337;
  const suivant = () => {
    graine = (graine * 1103515245 + 12345) & 0x7fffffff;
    return graine / 0x7fffffff;
  };

  for (let i = 0; i < 150; i += 1) {
    const x = suivant() * c.width;
    // Concentrees vers le bas : `1 - r^2` pousse la densite vers l'horizon.
    const y = c.height * (0.62 + 0.38 * (1 - suivant() ** 2));
    const chaud = suivant() > 0.35;
    g.fillStyle = chaud
      ? `rgba(255, ${190 + suivant() * 50}, ${120 + suivant() * 60}, ${0.5 + suivant() * 0.5})`
      : `rgba(150, 200, 255, ${0.2 + suivant() * 0.35})`;
    g.fillRect(x, y, 1 + suivant() * 2, 1 + suivant() * 2);
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function Fenetre({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const nuit = useMemo(() => (typeof document === "undefined" ? null : peindreNuit()), []);
  useEffect(() => () => nuit?.dispose(), [nuit]);
  if (!nuit) return null;

  const demiL = LARGEUR / 2;
  const demiH = HAUTEUR / 2;

  return (
    <group position={position} rotation={rotation}>
      {/* La vitre, LEGEREMENT en arriere du cadre pour qu'on lise une
          ouverture et non une affiche — mais devant le mur, ce qui n'allait pas
          de soi : a trois centimetres en arriere elle tombait DANS la cloison,
          qui occupe six centimetres d'epaisseur, et la nuit etait peinte a
          l'interieur du mur. Le cadre s'affichait, la vitre restait noire, et
          l'ensemble se lisait comme un cadre vide accroche la. */}
      <mesh position={[0, 0, -0.018]}>
        <planeGeometry args={[LARGEUR - MONTANT, HAUTEUR - MONTANT]} />
        <meshBasicMaterial map={nuit} toneMapped={false} />
      </mesh>

      {/* Le dormant : deux montants, deux traverses. */}
      {[
        [0, demiH, LARGEUR, MONTANT],
        [0, -demiH, LARGEUR, MONTANT],
        [-demiL, 0, MONTANT, HAUTEUR],
        [demiL, 0, MONTANT, HAUTEUR],
      ].map(([x, y, l, h]) => (
        <Forme key={`${x}-${y}`} reglages={CADRE} position={[x!, y!, 0]} trait={0.0028}>
          <boxGeometry args={[l!, h!, 0.07]} />
        </Forme>
      ))}

      {/* LES CROISILLONS FONT LA FENETRE. Une vitre unique dans un cadre se lit
          comme un tableau retroeclaire ; ce sont les meneaux qui disent
          « ouverture », parce qu'aucun cadre de tableau n'en porte. */}
      <Forme reglages={CADRE} position={[0, 0, 0]} trait={0.0024}>
        <boxGeometry args={[0.03, HAUTEUR - MONTANT, 0.05]} />
      </Forme>
      <Forme reglages={CADRE} position={[0, 0, 0]} trait={0.0024}>
        <boxGeometry args={[LARGEUR - MONTANT, 0.03, 0.05]} />
      </Forme>

      {/* L'appui, qui donne son epaisseur au mur : sans lui la fenetre est un
          trou decoupe dans une feuille de papier. */}
      <Forme reglages={CADRE} position={[0, -demiH - 0.045, 0.045]} trait={0.0028}>
        <boxGeometry args={[LARGEUR + 0.12, 0.04, 0.16]} />
      </Forme>
    </group>
  );
}

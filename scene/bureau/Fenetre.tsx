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
 * Le retrait de la vitre derriere le dormant : c'est lui qui fait lire une
 * OUVERTURE plutot qu'une affiche accrochee au mur.
 */
const RETRAIT = 0.018;

/**
 * DE COMBIEN LE GROUPE DOIT AVANCER SUR LA FACE DU MUR QUI LE PORTE.
 *
 * Le retrait ci-dessus va vers l'exterieur. Poser le groupe pile sur la face
 * de la cloison met donc la vitre DEDANS : la nuit est peinte a l'interieur du
 * mur, le dormant s'affiche, et l'ensemble se lit comme un cadre vide. C'est
 * arrive deux fois, au fond puis a gauche, et les deux fois la cote avait ete
 * ecrite a la main. Elle se compose maintenant : `MUR + POSE`, et jamais un
 * nombre pose de memoire.
 */
export const POSE = RETRAIT + 0.022;

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
  // LES VALEURS D'UNE VRAIE NUIT, ET IL A FALLU LES RENDRE DEUX FOIS.
  //
  // Elles ont ete remontees d'un cran une fois — ciel eclairci, lumieres passees
  // de quatre-vingt-dix a cent cinquante — parce que la fenetre « rendait noire
  // vue de biais ». C'ETAIT UN FAUX DIAGNOSTIC : elle rendait noire parce que
  // la vitre etait DANS la cloison, et aucune valeur de peinture n'y pouvait
  // rien. Une fois la vitre du bon cote du mur, la nuit reelle se lit
  // parfaitement a soixante-six degres, et la version eclaircie virait au
  // confetti — deux enseignes lumineuses dans la meme image, ce que le
  // deplacement de la fenetre cherchait justement a eviter.
  ciel.addColorStop(0, "#070b14");
  ciel.addColorStop(0.62, "#0d1626");
  // L'horizon est le seul endroit clair : c'est la lueur de la ville sur les
  // nuages, et c'est elle qui donne sa direction au bleu de la piece.
  ciel.addColorStop(1, "#1b2a44");
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

  for (let i = 0; i < 90; i += 1) {
    const x = suivant() * c.width;
    // Concentrees vers le bas : `1 - r^2` pousse la densite vers l'horizon.
    const y = c.height * (0.62 + 0.38 * (1 - suivant() ** 2));
    const chaud = suivant() > 0.35;
    g.fillStyle = chaud
      ? `rgba(255, ${190 + suivant() * 50}, ${120 + suivant() * 60}, ${0.35 + suivant() * 0.5})`
      : `rgba(150, 200, 255, ${0.2 + suivant() * 0.35})`;
    g.fillRect(x, y, 1 + suivant() * 2, 1 + suivant() * 2);
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// LA FLAQUE : CE QUE LA FENETRE POSE PAR TERRE.
//
// Sans elle, la fenetre reste un objet ACCROCHE au mur. Le commentaire en tete
// de ce fichier dit que le remplissage froid tenait sa cause de la fenetre —
// mais tant que rien au sol ne porte sa trace, cette cause est affirmee, pas
// montree. Une source de lumiere qui n'eclaire aucune surface n'est pas une
// source, c'est une decoration.
//
// PAS DE RECTANGLE NET AVEC LA CROIX DES MENEAUX, et c'est la seule chose ici
// qui ait demande a etre tranchee. L'image de cinema — le parallelogramme
// decoupe qui traverse le plancher — suppose une source PONCTUELLE et HAUTE :
// la lune. Ce qu'il y a derriere cette vitre est une ville, c'est-a-dire une
// bande lumineuse large et BASSE. Deux consequences, et les deux interdisent le
// rectangle : une source large ne projette pas d'arete franche, elle lave ; et
// une source basse jette sa flaque LOIN — a quinze degres au-dessus de
// l'horizon, le rectangle atterrirait six metres plus loin, c'est-a-dire sous
// le bureau, ou personne ne le verrait jamais. La lueur reste donc au pied du
// mur et s'eteint en un metre et demi, ce qui est aussi ce qu'on observe dans
// une piece reelle.
//
// ELLE EST PEINTE ET ADDITIVE, comme la vitre : aucune lumiere n'entre dans la
// scene, donc aucune passe d'eclairage supplementaire sur les materiaux, et la
// carte d'ombres gelee n'a pas a etre refaite.

/** Jusqu'ou la lueur porte sur le sol, depuis le pied du mur. */
const PORTEE = 1.55;

/**
 * A quelle hauteur la flaque est posee.
 *
 * Deux centimetres, et non zero : le tapis commence a soixante-dix centimetres
 * du mur et son dessus est a treize millimetres. Une flaque posee sur le sol
 * disparaitrait dessous a mi-course. A cette rasance, les deux centimetres ne
 * se lisent nulle part, et la lueur traverse le bord du tapis comme la lumiere
 * le fait.
 */
const SOL = 0.02;

function peindreFlaque(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 192;
  c.height = 128;
  const g = c.getContext("2d")!;

  // La teinte est celle de l'horizon de la vitre, et pas une autre : c'est la
  // partie claire du ciel qui fait la lueur, donc c'est elle qu'on retrouve au
  // sol. Une flaque d'une autre couleur ferait deux sources.
  g.fillStyle = "#3f5f96";
  g.fillRect(0, 0, c.width, c.height);

  // L'ALPHA SE SCULPTE EN DEUX PASSES DE `destination-in`, qui MULTIPLIE
  // l'opacite existante par celle de la source. Un seul degrade ne peut pas
  // decrire une flaque : il en faut deux, l'un pour la distance au mur,
  // l'autre pour la largeur, et c'est leur produit qu'on veut.
  g.globalCompositeOperation = "destination-in";

  // En s'eloignant du mur : une decroissance rapide au depart puis une longue
  // trainee. Une decroissance lineaire donne un bord visible la ou elle
  // s'arrete, et l'oeil lit un objet pose plutot qu'une lumiere.
  const loin = g.createLinearGradient(0, 0, c.width, 0);
  loin.addColorStop(0, "rgba(0,0,0,1)");
  loin.addColorStop(0.18, "rgba(0,0,0,0.82)");
  loin.addColorStop(0.5, "rgba(0,0,0,0.3)");
  loin.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = loin;
  g.fillRect(0, 0, c.width, c.height);

  // En largeur : un plateau sur l'ouverture, deux epaulements larges. Ce sont
  // eux qui disent que la lumiere vient d'une baie et non d'un projecteur.
  const large = g.createLinearGradient(0, 0, 0, c.height);
  large.addColorStop(0, "rgba(0,0,0,0)");
  large.addColorStop(0.16, "rgba(0,0,0,0.5)");
  large.addColorStop(0.3, "rgba(0,0,0,1)");
  large.addColorStop(0.7, "rgba(0,0,0,1)");
  large.addColorStop(0.84, "rgba(0,0,0,0.5)");
  large.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = large;
  g.fillRect(0, 0, c.width, c.height);

  g.globalCompositeOperation = "source-over";

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * La lueur que la fenetre pose au sol.
 *
 * Elle prend la face du mur et la cote de la fenetre le long de ce mur, comme
 * la fenetre elle-meme : les deux se deplacent ensemble ou pas du tout.
 */
export function FlaqueFenetre({ mur, z }: { mur: number; z: number }) {
  const lueur = useMemo(() => (typeof document === "undefined" ? null : peindreFlaque()), []);
  useEffect(() => () => lueur?.dispose(), [lueur]);
  if (!lueur) return null;

  return (
    <mesh
      position={[mur + PORTEE / 2, SOL, z]}
      rotation={[-Math.PI / 2, 0, 0]}
      // Elle ne doit ni intercepter un clic, ni porter d'ombre, ni en recevoir.
      raycast={() => {}}
      castShadow={false}
      receiveShadow={false}
    >
      {/* Plus large que l'ouverture : la lumiere deborde toujours du cadre. */}
      <planeGeometry args={[PORTEE, LARGEUR * 1.45]} />
      {/* ADDITIF, DONC SANS BROUILLARD. Le brouillard melange vers SA couleur ;
          sur un materiau qui s'ajoute au fond, ce melange AJOUTE du gris au
          lieu d'en retirer, et la flaque s'eclaircirait avec la distance. */}
      <meshBasicMaterial
        map={lueur}
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
        fog={false}
      />
    </mesh>
  );
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
          l'ensemble se lisait comme un cadre vide accroche la. C'est `POSE`,
          plus haut, qui garantit que le groupe est assez avance pour que ce
          retrait reste du bon cote du mur. */}
      <mesh position={[0, 0, -RETRAIT]}>
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

"use client";

import { useEffect, useId, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Forme } from "../croquis/Forme";
import { Importe } from "../croquis/Importe";
import { materiauCroquis } from "../croquis/materiau";
import { oublieLaMain, veutLaMain } from "./curseur";

// LES PIECES DU BUREAU.
//
// Chaque objet est construit en primitives — boites, cylindres, tores — et non
// importe. C'est ce qui permet au monde entier de peser quelques kilooctets au
// lieu de cinq megaoctets, de tourner sur une carte integree, et surtout d'etre
// MODIFIABLE : deplacer un ecran est une ligne, pas un aller-retour dans
// Blender.
//
// La palette est celle d'un bureau de nuit. Une lampe chaude fait l'ilot de
// lumiere, le reste tombe dans un bleu froid. C'est ce contraste qui donne
// l'intimite recherchee — un bureau uniformement eclairé est un bureau de
// bureau, pas un poste de travail a soi.

const PALETTE = {
  plateau: { couleur: "#6e5438", paliers: 4, grain: 0.1, plancher: 0.34 },
  pied: { couleur: "#3d434e", paliers: 3, grain: 0.08, plancher: 0.3 },
  boitier: { couleur: "#23262d", paliers: 3, grain: 0.08, plancher: 0.32 },
  cadre: { couleur: "#1e222a", paliers: 3, grain: 0.06, plancher: 0.3 },
  papier: { couleur: "#efe7d6", paliers: 4, grain: 0.14, plancher: 0.4 },
  laiton: { couleur: "#c08a3e", paliers: 4, grain: 0.08, plancher: 0.36 },
  ceramique: { couleur: "#d8d2c6", paliers: 4, grain: 0.1, plancher: 0.38 },
  feuillage: { couleur: "#4f7a52", paliers: 3, grain: 0.16, plancher: 0.35 },
} as const;

/** Le plateau et son piétement. L'assise de toute la composition. */
export function Plateau() {
  return (
    <group>
      <Forme reglages={PALETTE.plateau} position={[0, 0.74, 0]} trait={0.0032}>
        <boxGeometry args={[3.2, 0.055, 1.5]} />
      </Forme>
      {/* Un tablier sous le plateau : sans lui, la tranche se lit comme une
          planche posee en l'air. */}
      <Forme reglages={PALETTE.plateau} position={[0, 0.66, -0.6]} trait={0.003}>
        <boxGeometry args={[3.1, 0.12, 0.06]} />
      </Forme>
      {[-1.5, 1.5].map((x) => (
        <Forme key={x} reglages={PALETTE.pied} position={[x, 0.36, 0]} trait={0.003}>
          <boxGeometry args={[0.07, 0.72, 1.3]} />
        </Forme>
      ))}
    </group>
  );
}

/**
 * Un ecran. C'est LE support de projet : sa dalle recevra une capture.
 *
 * La dalle est une piece a part, tres legerement en avant du cadre, pour deux
 * raisons : elle peut recevoir un materiau non eclairé — un ecran s'eclaire
 * lui-meme — et elle est la seule surface a rendre cliquable.
 */
export function Ecran({
  position,
  rotation = [0, 0, 0],
  largeur = 0.62,
  hauteur = 0.38,
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  largeur?: number;
  hauteur?: number;
  children?: React.ReactNode;
}) {
  const pied = hauteur / 2 + 0.09;
  return (
    <group position={position} rotation={rotation}>
      {/* Socle et colonne */}
      <Forme reglages={PALETTE.pied} position={[0, 0.012, 0]} trait={0.0028}>
        <boxGeometry args={[0.24, 0.024, 0.16]} />
      </Forme>
      <Forme reglages={PALETTE.pied} position={[0, 0.055, 0]} trait={0.0028}>
        <boxGeometry args={[0.045, 0.09, 0.045]} />
      </Forme>
      {/* LE CADRE NE PORTE PAS D'OMBRE, et c'est le meme raisonnement que pour
          l'abat-jour de la lampe.

          C'est le plus grand occulteur de la piece — un panneau de soixante par
          trente-huit — et il se dresse a soixante centimetres de la seule source
          a ombre portee. Sa silhouette tombait donc en travers du plateau, du
          cote oppose a la lampe : une GRANDE DALLE SOMBRE a bord franc qui se
          lit comme une tache sur le bois, et non comme de l'ombre.

          Physiquement, elle devrait pourtant y etre. Mais un ecran n'est pas un
          panneau opaque, c'est une SOURCE : il emet vers l'avant, exactement la
          ou tombe son ombre, et la remplit. Le rendu ne modelise pas cette
          emission — la lueur froide est une ponctuelle posee entre les deux
          dalles, elle ne sait pas d'ou elle vient. Retirer le cadre de la passe
          d'ombres approche donc mieux la realite que l'y laisser, et c'est
          gratuit : deux occulteurs de moins dans la carte cubique.

          Le socle et la colonne, eux, la portent toujours. Ce sont de petits
          objets poses sur le plateau, leur ombre est courte et c'est elle qui
          dit qu'ils y sont poses. */}
      <Forme
        reglages={PALETTE.cadre}
        position={[0, pied, 0]}
        trait={0.0032}
        castShadow={false}
      >
        <boxGeometry args={[largeur, hauteur, 0.028]} />
      </Forme>
      {/* La dalle, portee par le parent pour que l'appelant y mette ce qu'il
          veut — capture de projet, code, ou rien. */}
      <group position={[0, pied, 0.016]}>{children}</group>
    </group>
  );
}

/** Le portable, ouvert. Il double l'ecran principal sans le repeter. */
export function Portable({
  position,
  rotation = [0, 0, 0],
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  children?: React.ReactNode;
}) {
  return (
    <group position={position} rotation={rotation}>
      <Forme reglages={PALETTE.boitier} position={[0, 0.008, 0]} trait={0.0026}>
        <boxGeometry args={[0.34, 0.016, 0.24]} />
      </Forme>
      {/* LE CAPOT PIVOTE AUTOUR DE SA CHARNIERE, au bord arriere du socle, et
          d'une vingtaine de degres seulement au-dela de la verticale.
          Premiere version : soixante-huit degres, c'est-a-dire presque a plat.
          L'objet se lisait comme une feuille posee sur la table. Un portable
          ouvert tient entre cent et cent vingt degres d'ouverture totale. */}
      <group position={[0, 0.016, -0.115]} rotation={[-0.32, 0, 0]}>
        {/* Le capot non plus, pour la meme raison que le cadre d'un ecran. */}
        <Forme
          reglages={PALETTE.boitier}
          position={[0, 0.11, 0]}
          trait={0.0026}
          castShadow={false}
        >
          <boxGeometry args={[0.34, 0.22, 0.011]} />
        </Forme>
        {/* La dalle, non eclairee : un ecran allume ne recoit pas d'ombre. */}
        <group position={[0, 0.11, 0.007]}>{children}</group>
      </group>
      {/* Pave tactile et clavier : deux creux suffisent a la lecture. */}
      <Forme reglages={PALETTE.cadre} position={[0, 0.017, 0.055]} trait={0}>
        <boxGeometry args={[0.11, 0.002, 0.07]} />
      </Forme>
      <Forme reglages={PALETTE.cadre} position={[0, 0.017, -0.045]} trait={0}>
        <boxGeometry args={[0.3, 0.002, 0.09]} />
      </Forme>
    </group>
  );
}

/**
 * LE CLAVIER, TOUCHE PAR TOUCHE.
 *
 * C'etait une plaque posee sur une boite : de loin ça passait, de pres — et le
 * defilement amene desormais tout en gros plan — c'etait une savonnette. Un
 * clavier se reconnait a une seule chose, la GRILLE, et une grille ne se suggere
 * pas.
 *
 * POURQUOI PAS UN MODELE IMPORTE. C'est la question qu'on se pose naturellement
 * ici, et le clavier est justement l'objet ou elle se tranche le plus vite : un
 * clavier EST une grille de boites. Un `.glb` de bonne facture pese entre
 * trois cent et huit cents kilooctets, arrive avec ses propres materiaux qu'il
 * faudrait remplacer un a un pour retrouver le rendu croquis, et impose une
 * licence a suivre. Celui-ci pese zero octet, herite du style sans rien faire,
 * et se remodele en changeant un tableau de nombres. Reste que pour un objet
 * VRAIMENT organique — une main, un fauteuil, un casque bien dessine — le
 * raisonnement s'inverse, et la chaine d'import est prete pour ça.
 *
 * TOUT EST FUSIONNE EN UNE SEULE GEOMETRIE. Soixante-dix touches en soixante-dix
 * maillages, ce serait cent quarante appels de rendu avec les contours — plus
 * que toute la scene actuelle, pour un seul objet. Fusionnees, c'est deux. Elles
 * ne bougent jamais les unes par rapport aux autres : la fusion ne coute donc
 * rien, la ou des instances imposeraient un tampon de matrices a maintenir.
 */

/**
 * Le plan de touches, en unites de pas (1u = un pas de touche).
 *
 * Un nombre negatif est un ECART et non une touche : c'est ce qui separe les
 * blocs de fonctions, et sans quoi la rangee du haut se lit comme une barre
 * continue. Les largeurs sont celles d'un clavier reel — la barre d'espace fait
 * six unites et quart, le retour chariot deux et quart — parce qu'un oeil
 * reconnait ces proportions avant de compter les touches.
 */
const RANGEES: readonly (readonly number[])[] = [
  [1, -1, 1, 1, 1, 1, -0.5, 1, 1, 1, 1, -0.5, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75],
  [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25],
];

/** Le pas d'un clavier reel, en metres. Tout le reste en decoule. */
const PAS = 0.019;
/** Le jeu entre deux capuchons : sans lui, la grille redevient une plaque. */
const JEU = 0.0028;

function useTouches() {
  return useMemo(() => {
    const morceaux: THREE.BufferGeometry[] = [];
    // La rangee de fonctions est un peu plus basse et plus fine que les autres,
    // comme sur un vrai clavier : c'est ce qui empeche le bloc de se lire comme
    // un damier regulier.
    RANGEES.forEach((rangee, r) => {
      const fonction = r === 0;
      let u = 0;
      for (const w of rangee) {
        if (w < 0) {
          u += -w;
          continue;
        }
        const g = new THREE.BoxGeometry(
          w * PAS - JEU,
          fonction ? 0.006 : 0.0085,
          PAS - JEU,
        );
        g.translate(
          (u + w / 2) * PAS,
          fonction ? 0.003 : 0.00425,
          // La rangee 0 est au fond : l'axe des z va vers l'observateur, donc
          // les indices croissants se rapprochent de lui.
          (r - (RANGEES.length - 1) / 2) * PAS + (fonction ? -0.004 : 0),
        );
        morceaux.push(g);
        u += w;
      }
    });
    // Centre le bloc entier sur l'objet : les rangees ont ete construites a
    // partir de zero, chacune avec sa propre longueur.
    const large = 15 * PAS;
    const fusion = mergeGeometries(morceaux, false);
    morceaux.forEach((g) => g.dispose());
    fusion.translate(-large / 2, 0, 0);
    return fusion;
  }, []);
}

/** Clavier et souris : ils occupent le devant du plateau et donnent l'echelle. */
export function Saisie({ position }: { position: [number, number, number] }) {
  const touches = useTouches();
  return (
    <group position={position}>
      {/* Le chassis, legerement plus grand que le bloc de touches. */}
      <Forme reglages={PALETTE.boitier} position={[0, 0.008, 0]} trait={0.0026}>
        <boxGeometry args={[0.308, 0.016, 0.134]} />
      </Forme>
      {/* LA PLAQUE DE FOND EST UNE SOURCE, pas une surface. C'est tout le
          retroeclairage du clavier : la lumiere ne sort pas des touches, elle
          sort de DESSOUS et remonte par les interstices — exactement comme sur
          un vrai clavier retroeclaire, ou l'on ne voit jamais les diodes.
          Materiau non eclaire, donc elle ne coute aucune passe de lumiere et
          ne projette rien : un clavier qui eclairerait le bureau serait un
          projecteur. */}
      <mesh position={[0, 0.0165, 0]}>
        <boxGeometry args={[0.296, 0.001, 0.122]} />
        <meshBasicMaterial color="#7b3ff2" toneMapped={false} />
      </mesh>
      <Forme reglages={PALETTE.pied} position={[0, 0.017, 0]} trait={0.0016}>
        <primitive object={touches} attach="geometry" />
      </Forme>

      {/* La souris : un dos bombe, pas une boite. C'est le seul objet du bureau
          qui n'a aucune arete vive, et c'est precisement ce qui le fait
          reconnaitre — une boite de six centimetres a cote d'un clavier peut
          etre n'importe quoi.

          UNE DEMI-SPHERE MISE A L'ECHELLE, et non une geometrie dediee. Le
          contour s'inflate le long des NORMALES en espace de vue ; three
          recalcule la matrice des normales a partir de la matrice de vue-modele,
          donc une echelle non uniforme reste correctement cernee. */}
      <group position={[0.235, 0, 0.012]} scale={[1, 0.85, 1.4]}>
        <Forme reglages={PALETTE.boitier} position={[0, 0.001, 0]} trait={0.0024}>
          <sphereGeometry args={[0.031, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </Forme>
        <Forme reglages={PALETTE.cadre} position={[0, 0.03, -0.012]} trait={0}>
          <boxGeometry args={[0.005, 0.006, 0.013]} />
        </Forme>
      </group>
    </group>
  );
}

/** Le carnet : support du parcours. Ferme, avec un marque-page. */
export function Carnet({
  position,
  rotation = [0, 0, 0],
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  children?: React.ReactNode;
}) {
  return (
    <group position={position} rotation={rotation}>
      <Forme reglages={PALETTE.cadre} position={[0, 0.012, 0]} trait={0.0026}>
        <boxGeometry args={[0.2, 0.024, 0.28]} />
      </Forme>
      <Forme reglages={PALETTE.papier} position={[0, 0.026, 0]} trait={0.0022}>
        <boxGeometry args={[0.185, 0.006, 0.265]} />
      </Forme>
      {/* Le marque-page depasse : un detail qui coute six sommets et fait
          passer l'objet de « boite » a « carnet ». */}
      <Forme reglages={PALETTE.laiton} position={[0.05, 0.03, 0.16]} trait={0}>
        <boxGeometry args={[0.018, 0.002, 0.08]} />
      </Forme>
      {children}
    </group>
  );
}

// CE QUI FAIT QU'UNE BOITE EST UNE TOUR.
//
// Le boitier etait un parallelepipede pose a plat, avec des autocollants sur le
// flanc. Rien n'y disait « ordinateur » : les proportions d'un petit boitier
// sont celles d'un carton d'archives, et c'est exactement ce qu'on lisait.
//
// Trois signes suffisent, et ils sont tous sur la FACE AVANT — la seule qu'on
// regarde, et la seule qu'aucun objet ne cachait : une GRILLE d'aeration, un
// BOUTON, des PRISES. Aucun autre objet du bureau n'en porte, donc ils ne se
// confondent avec rien.
//
// ELLE EST PEINTE, PAS MODELEE, comme l'enseigne et la vitre. Modelee, la seule
// grille demanderait quatorze fentes, soit vingt-huit appels de rendu avec
// leurs contours — sur une scene qui en compte cent vingt et un, pour un detail
// qui occupera QUATRE-VINGT-DIX PIXELS au plan large. Une toile de 96 sur 144
// dit la meme chose en un appel.
//
// LA DIODE D'ALIMENTATION, ELLE, RESTE UN OBJET. Peinte sur la facade, elle
// serait eclairee par la lampe comme le reste du panneau, donc eteinte : une
// LED qui recoit de l'ombre cesse d'etre une LED. C'est le meme raisonnement
// que pour les trois diodes du flanc.

// LA SILHOUETTE AVANT LES DETAILS.
//
// La premiere reprise a ajoute une facade, des pieds, un bouton — et l'objet ne
// ressemblait toujours pas a une machine. Le defaut etait ailleurs : le boitier
// mesurait seize sur vingt-trois sur trente, c'est-a-dire les proportions d'un
// CUBE. Aucun detail de façade ne rattrape une silhouette fausse, parce qu'une
// silhouette se lit en un dixieme de seconde et un detail en une seconde.
//
// Une tour est HAUTE, ETROITE et PROFONDE. Dix-sept sur quarante sur
// trente-sept la met dans les proportions d'un vrai boitier moyen, et la
// compare a ce qui l'entoure : elle monte a quarante-deux centimetres au-dessus
// du plateau quand le sommet de l'ecran principal est a quarante-sept. C'est
// exactement le rapport qu'on a sous les yeux quand une tour est posee sur un
// bureau, et c'est ce rapport qui la nomme.
const BOITIER = { largeur: 0.17, hauteur: 0.4, profondeur: 0.37, pieds: 0.016 } as const;

/** Le milieu du boitier au-dessus du plateau : tout s'y rapporte. */
const MILIEU = BOITIER.pieds + BOITIER.hauteur / 2;

const FACADE = { largeur: 0.15, hauteur: 0.36 } as const;

function peindreFacade(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 96;
  c.height = 230;
  const g = c.getContext("2d")!;

  // LA FACADE EST PLUS CLAIRE QUE LES FLANCS, ET C'EST UNE NECESSITE AVANT
  // D'ETRE UN CHOIX. La lampe est en haut a DROITE et en arriere de la tour :
  // la face avant, tournee vers le siege, ne recoit donc rien. Peinte a la
  // valeur d'un flanc, elle rendait uniformement noire et la grille comme le
  // bouton disparaissaient — on retrouvait la boite. Un panneau avant reel est
  // de toute façon plus clair que sa tole : c'est une piece rapportee, souvent
  // en aluminium brosse ou en maille.
  g.fillStyle = "#3d434e";
  g.fillRect(0, 0, c.width, c.height);

  // Le JOINT du panneau, en haut : une facade d'un seul tenant se lit comme
  // une plaque, alors qu'un boitier est toujours fait de morceaux rapportes.
  g.fillStyle = "#20242c";
  g.fillRect(0, 16, c.width, 1.5);

  // LE BOUTON EST SEUL SUR SA LIGNE, ET CENTRE. C'est le point de
  // reconnaissance le plus rapide d'une machine, et le mettre en rang avec les
  // prises le noyait parmi elles : quatre pastilles alignees ne se distinguent
  // plus les unes des autres a distance.
  g.fillStyle = "#525a67";
  g.beginPath();
  g.arc(48, 42, 9, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#7d8694";
  g.lineWidth = 1.6;
  g.stroke();

  // LES PRISES, sur la ligne suivante. Deux rectangles et un cercle : USB, USB,
  // jack. Leur INTERIEUR est presque noir, et c'est ce creux qui les fait lire
  // comme des prises et non comme des pastilles collees.
  g.fillStyle = "#12151b";
  g.fillRect(19, 66, 17, 7);
  g.fillRect(40, 66, 17, 7);
  g.beginPath();
  g.arc(69, 69.5, 4.5, 0, Math.PI * 2);
  g.fill();

  // LA GRILLE occupe les deux tiers du bas. Des fentes et non des trous : a
  // cette taille, une trame de trous se filtre en aplat gris et l'on perd tout.
  g.fillStyle = "#171b22";
  for (let y = 92; y < 216; y += 6) {
    g.fillRect(12, y, c.width - 24, 3.5);
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/**
 * La grille du DESSUS, et c'est la face la plus rentable de l'objet.
 *
 * La camera du plan large est en plongee : on voit le dessus du boitier en
 * entier, alors que la facade est vue de biais et a demi dans l'ombre. Une tour
 * evacue par le haut, tout le monde l'a vu sans le savoir, et c'est le seul
 * signe de cette machine qui soit pleinement eclaire.
 */
function peindreDessus(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 96;
  c.height = 208;
  const g = c.getContext("2d")!;

  g.fillStyle = "#2b3038";
  g.fillRect(0, 0, c.width, c.height);

  // La grille ne va pas jusqu'au bord : une tole est toujours pliee sur son
  // pourtour, et c'est cette marge qui empeche le dessus de se lire comme un
  // trou ouvert.
  g.fillStyle = "#14171d";
  for (let y = 26; y < 184; y += 6) {
    g.fillRect(14, y, c.width - 28, 3.5);
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** La machine : support de la stack. Un boitier a LED, pose de chant. */
export function Machine({
  position,
  rotation = [0, 0, 0],
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  children?: React.ReactNode;
}) {
  // Les deux toles ajourees. La couleur du materiau est blanche : ce sont les
  // pixels de la toile qui portent la teinte, et le materiau ne fait que les
  // eclairer avec les memes paliers et le meme grain que le reste de la scene.
  const [facade, dessus] = useMemo(
    () =>
      typeof document === "undefined"
        ? [null, null]
        : ([peindreFacade(), peindreDessus()] as const),
    []
  );
  const matFacade = useMemo(() => {
    if (!facade) return null;
    // LE PLANCHER MONTE BIEN AU-DESSUS DU RESTE DE LA SCENE, pour la meme
    // raison que la facade est peinte claire : sans lumiere directe, c'est lui
    // seul qui decide si l'on voit encore quelque chose. C'est le reglage
    // prevu pour ça — la luminosite minimale des zones a l'ombre.
    const m = materiauCroquis({ couleur: "#ffffff", paliers: 4, grain: 0.08, plancher: 0.46 });
    m.map = facade;
    return m;
  }, [facade]);
  const matDessus = useMemo(() => {
    if (!dessus) return null;
    // Le dessus, lui, RECOIT la lampe : son plancher reste celui de la scene,
    // et c'est ce qui lui donne le meme modele que les autres surfaces.
    const m = materiauCroquis({ couleur: "#ffffff", paliers: 3, grain: 0.08, plancher: 0.3 });
    m.map = dessus;
    return m;
  }, [dessus]);
  useEffect(
    () => () => {
      facade?.dispose();
      dessus?.dispose();
      matFacade?.dispose();
      matDessus?.dispose();
    },
    [facade, dessus, matFacade, matDessus]
  );

  return (
    <group position={position} rotation={rotation}>
      {/* LES PIEDS. Une tour ne touche jamais le meuble : elle est posee sur
          quatre patins, et le jour qu'ils menagent est visible de tres loin
          parce qu'il est SOMBRE sur un plateau clair. Sans lui, le boitier a
          l'air enfonce dans le bois. Un socle unique et non quatre patins : a
          cette distance on ne voit que la ligne d'ombre, pas ce qui la tient. */}
      <Forme reglages={PALETTE.cadre} position={[0, BOITIER.pieds / 2, 0]} trait={0.0022}>
        <boxGeometry args={[0.14, BOITIER.pieds, BOITIER.profondeur - 0.05]} />
      </Forme>

      <Forme reglages={PALETTE.boitier} position={[0, MILIEU, 0]} trait={0.003}>
        <boxGeometry args={[BOITIER.largeur, BOITIER.hauteur, BOITIER.profondeur]} />
      </Forme>

      {/* Les deux toles, un millimetre en avant de leur face pour ne pas s'y
          battre en profondeur. */}
      {matFacade ? (
        <mesh
          position={[0, MILIEU, BOITIER.profondeur / 2 + 0.001]}
          material={matFacade}
          raycast={() => {}}
        >
          <planeGeometry args={[FACADE.largeur, FACADE.hauteur]} />
        </mesh>
      ) : null}
      {matDessus ? (
        <mesh
          position={[0, BOITIER.pieds + BOITIER.hauteur + 0.001, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={matDessus}
          raycast={() => {}}
        >
          <planeGeometry args={[FACADE.largeur, BOITIER.profondeur - 0.04]} />
        </mesh>
      ) : null}

      {/* La diode d'alimentation, DANS le bouton — sa cote se deduit de la
          toile : le bouton est peint en (48 ; 42) sur 96 par 230, donc centre
          en largeur et 117 mm au-dessus du milieu du panneau. */}
      <mesh position={[0, MILIEU + 0.117, BOITIER.profondeur / 2 + 0.0025]}>
        <circleGeometry args={[0.005, 10]} />
        <meshBasicMaterial color="#7ee787" toneMapped={false} />
      </mesh>

      {/* LE FLANC N'A PLUS DE DIODES, et il ne doit pas en ravoir : c'est la
          face qui porte l'etiquette de la stack, et trois pastilles vives
          posees devant elle mangeaient les logos. Le seul temoin lumineux de la
          machine est desormais celui de l'alimentation, sur la facade, ou il ne
          dispute rien a personne. */}
      {children}
    </group>
  );
}

/**
 * La lampe d'architecte : c'est elle qui fait l'ilot de lumiere.
 *
 * RECONSTRUITE EN CHAINE SIMPLE. La premiere version empilait des groupes
 * tournes les uns dans les autres, et l'abat-jour finissait a vingt centimetres
 * du bras — chaque rotation deplacait l'origine de la suivante. Ici chaque
 * segment est place ET tourne explicitement dans le repere de la lampe : plus
 * verbeux, mais on voit ou sont les choses.
 */
export function Lampe({
  position,
  allumee = true,
  onBasculer,
}: {
  position: [number, number, number];
  allumee?: boolean;
  /** Appele au clic sur l'abat-jour. Absent, la lampe n'est pas cliquable. */
  onBasculer?: () => void;
}) {
  const clef = useId();
  useEffect(() => () => oublieLaMain(clef), [clef]);

  // AUCUNE PIECE DU LUMINAIRE NE PORTE D'OMBRE, et c'est la seule façon d'avoir
  // une lampe credible. L'ampoule est A L'INTERIEUR de l'abat-jour, a trois
  // centimetres de lui ; le mur est a cinquante. La silhouette de l'abat-jour
  // s'y projetait donc grossie une dizaine de fois — une immense aile noire a
  // bord franc, qui ne ressemblait a rien de ce qu'une lampe fait.
  //
  // Physiquement, c'est pourtant ce qu'une source ponctuelle nue produit. Le
  // defaut n'est pas dans le calcul, il est dans le MODELE : une vraie ampoule
  // n'est pas un point, c'est un volume diffusant, et l'ombre d'un objet a
  // trois centimetres d'une source large n'existe pratiquement pas. Retirer le
  // luminaire de la passe d'ombres approche mieux la realite que l'y laisser.
  return (
    <group position={position}>
      <Forme reglages={PALETTE.pied} position={[0, 0.014, 0]} trait={0.0026} castShadow={false}>
        <cylinderGeometry args={[0.08, 0.09, 0.028, 20]} />
      </Forme>
      {/* Le montant, legerement incline */}
      <Forme
        reglages={PALETTE.laiton}
        position={[0.03, 0.24, -0.02]}
        rotation={[0.08, 0, -0.13]}
        trait={0.0024}
        castShadow={false}
      >
        <cylinderGeometry args={[0.012, 0.012, 0.44, 12]} />
      </Forme>
      {/* L'articulation */}
      <Forme reglages={PALETTE.pied} position={[0.06, 0.455, -0.01]} trait={0.0022} castShadow={false}>
        <sphereGeometry args={[0.022, 12, 10]} />
      </Forme>
      {/* LE BRAS NE JOIGNAIT RIEN, ET LA LAMPE SE LISAIT COUPEE EN DEUX.

          Il etait pose a la main, comme le reste de la chaine — et c'est
          justement la limite de ce choix : ses deux bouts tombaient a six et
          sept centimetres de ce qu'ils devaient tenir, l'articulation d'un cote
          et l'abat-jour de l'autre, l'ecart etant surtout en PROFONDEUR, donc
          invisible sur un plan de face et flagrant de trois quarts. On voyait
          une tige qui flotte, un abat-jour qui vole, et rien entre les deux.

          IL EST DESORMAIS CALCULE A PARTIR DE SES DEUX EXTREMITES : longueur,
          milieu et angles d'Euler viennent du vecteur qui va de l'articulation
          au haut de l'abat-jour, et non l'inverse. C'est plus long a ecrire une
          fois et ça ne peut plus se decoller.

          ET IL EST PLUS LONG : quarante-sept centimetres au lieu de trente. Le
          commentaire d'avant disait que 0,42 portait l'abat-jour DANS la dalle
          de l'ecran principal, et c'etait vrai — pour une direction plus
          frontale. Celle-ci passe devant l'ecran plutot que dedans : le bord
          gauche du cadre est a x = -0,62 et l'abat-jour s'arrete a -0,76, soit
          quatorze centimetres de jour. C'est ce que ça coute pour que la flaque
          tombe enfin sur la zone de travail et non dans le coin du meuble. */}
      <Forme
        reglages={PALETTE.laiton}
        position={[0.2515, 0.4932, 0.1206]}
        rotation={[1.2864, 0, -0.9527]}
        trait={0.0024}
        castShadow={false}
      >
        <cylinderGeometry args={[0.011, 0.011, 0.47, 12]} />
      </Forme>
      {/* L'ABAT-JOUR, AU BOUT DU BRAS, ET IL REGARDE LE BUREAU.

          Son inclinaison est la seule chose qui dise ou la lampe pointe : le
          luminaire est bati en chaine dans son propre repere, sans rotation
          d'ensemble, donc c'est ici que ça se joue. A 0,22 sur Z, l'ouverture
          descendait presque a la verticale — la lampe eclairait SON PROPRE
          COIN, et se lisait comme posee la sans raison, a cote d'un plateau
          qu'elle ne regardait pas.

          A 0,58, l'ouverture pointe vers les x positifs, c'est-a-dire vers les
          ecrans et le clavier. Le basculement vers l'avant, lui, ne bouge pas :
          il place deja l'ouverture du bon cote en profondeur.

          CELA NE CHANGE PAS LA FLAQUE, et c'est voulu. La source est une
          PONCTUELLE dans l'abat-jour, pas un projecteur — un cone a ete essaye
          et rejete. Elle rayonne dans toutes les directions quelle que soit
          l'inclinaison de la tole : ce qu'on corrige ici est ce que l'oeil lit
          du geste de la lampe, pas ce qu'elle eclaire. */}
      <group position={[0.46, 0.4825, 0.22]} rotation={[0.42, 0, 0.58]}>
        <Forme reglages={PALETTE.laiton} position={[0, 0, 0]} trait={0.0026} castShadow={false}>
          <cylinderGeometry args={[0.05, 0.1, 0.12, 20, 1, true]} />
        </Forme>
        {/* La face interieure, non eclairee : c'est l'ampoule qu'on voit.
            ETEINTE, ELLE NE DEVIENT PAS NOIRE mais terne. Un reflecteur eteint
            reste une surface claire qui recoit le peu de lumiere de la piece ;
            au noir, l'abat-jour se lirait comme troue. */}
        <mesh position={[0, -0.052, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.095, 20]} />
          <meshBasicMaterial color={allumee ? "#ffd9a0" : "#38332b"} />
        </mesh>
      </group>

      {/* L'INTERRUPTEUR : une boite invisible sur l'abat-jour.

          Le gestionnaire ne va pas sur le groupe de la lampe, et c'est la meme
          raison que pour les zones (voir Sensible) : R3F descend
          RECURSIVEMENT dans les objets porteurs de gestionnaires, donc poser un
          clic sur la lampe entiere y ferait entrer ses huit maillages a chaque
          mouvement de souris. Une boite en fait douze triangles.

          SUR L'ABAT-JOUR ET NON SUR LE PIED, pour deux raisons qui vont dans le
          meme sens : c'est la ou l'on tend la main vers une vraie lampe, et
          c'est le seul endroit du luminaire qui ne chevauche AUCUNE zone
          sensible — le pied, lui, entre dans la boite de la zone « stack », et
          un clic y serait mange par la machine. */}
      {onBasculer ? (
        <mesh
          position={[0.31, 0.47, 0.12]}
          visible={false}
          onPointerOver={(e) => {
            e.stopPropagation();
            veutLaMain(clef, true);
          }}
          onPointerOut={() => oublieLaMain(clef)}
          onClick={(e) => {
            e.stopPropagation();
            onBasculer();
          }}
        >
          <boxGeometry args={[0.24, 0.2, 0.24]} />
        </mesh>
      ) : null}
    </group>
  );
}

/** Le mug : il ne sert a rien, et c'est exactement pourquoi il est la. */
export function Mug({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Forme reglages={PALETTE.ceramique} position={[0, 0.045, 0]} trait={0.0024}>
        <cylinderGeometry args={[0.042, 0.036, 0.09, 18]} />
      </Forme>
      <Forme reglages={PALETTE.ceramique} position={[0.055, 0.05, 0]} trait={0.0022}>
        <torusGeometry args={[0.026, 0.007, 8, 16]} />
      </Forme>
    </group>
  );
}

/**
 * LA PLANTE. Troisieme modele importe, et le cas qui a fait evoluer la chaine.
 *
 * Six icosaedres verts faisaient une constellation, pas un feuillage. Le
 * probleme n'etait pas le nombre — c'est qu'une feuille a une NERVURE et un
 * bord, deux choses qu'un solide de Platon n'a pas, et qu'aucun empilement de
 * solides ne finit par avoir.
 *
 * ELLE EST LA SEULE A GARDER SES TROIS MATERIAUX. Pot, terre et feuillage sont
 * trois matieres ; les fondre en une, comme pour le casque et le fauteuil,
 * donnait une sculpture verte. C'est ce qui a fait naitre le drapeau
 * `--par-materiau` de la chaine de preparation et la table de reglages par nom
 * de materiau — le nom etant la seule chose qu'un modele conserve de façon
 * stable a travers la preparation.
 *
 * Trois primitives, donc six appels de rendu avec les contours. C'est le prix de
 * la couleur, et il se paie une fois pour toutes les instances : le fichier est
 * telecharge, decode et mis en cache par URL, donc la plante de sol et celle du
 * bureau ne coutent qu'un seul chargement.
 */
const MATIERES_PLANTE = {
  Plant_Green: PALETTE.feuillage,
  Brown: { couleur: "#4a3826", paliers: 3, grain: 0.16, plancher: 0.3 },
  Black: PALETTE.ceramique,
} as const;

export function Plante({
  position,
  rotation = [0, 0, 0],
  echelle = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  /**
   * Une plante n'a pas de taille canonique — c'est ce qui la distingue du
   * fauteuil, qu'on se garde bien de redimensionner. Le meme fichier sert donc
   * de plante de sol a un metre et de pot de bureau a trente centimetres.
   */
  echelle?: number;
}) {
  return (
    <Importe
      url="/models/plante.glb"
      reglages={MATIERES_PLANTE}
      trait={0.0026 / Math.max(echelle, 0.2)}
      position={position}
      rotation={rotation}
      scale={echelle}
    />
  );
}

export function Casque({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Forme reglages={PALETTE.pied} position={[0, 0.01, 0]} trait={0.0024}>
        <cylinderGeometry args={[0.055, 0.06, 0.02, 16]} />
      </Forme>
      <Forme reglages={PALETTE.pied} position={[0, 0.11, 0]} trait={0.0022}>
        <cylinderGeometry args={[0.009, 0.009, 0.2, 10]} />
      </Forme>
      {/* Pose sur le montant plutot que suspendu : l'arceau vient coiffer le
          haut du pied, ce qui est exactement la façon dont un casque tient sur
          un support et evite d'avoir a modeliser un crochet. */}
      <Importe
        url="/models/casque.glb"
        reglages={PALETTE.boitier}
        trait={0.0022}
        position={[0, 0.1, 0]}
        rotation={[0, -0.5, 0]}
        scale={1.35}
      />
    </group>
  );
}

/**
 * LE FAUTEUIL. Deuxieme modele importe, et celui qui manquait le plus.
 *
 * La place du siege etait VIDE — pas simplifiee, absente. Un poste de travail
 * sans siege se lit comme un decor de vitrine : personne n'y travaille. Et
 * c'est la forme qu'aucune primitive n'approche, entre le galbe du dossier, les
 * accoudoirs et l'etoile a cinq branches du pied.
 *
 * Il n'est pas mis a l'echelle : le modele fait 1,13 m de haut et son origine
 * est au sol, ce qui est exactement un fauteuil de bureau reel. Quand c'est le
 * cas, on n'y touche pas — un facteur d'echelle sur un objet dont on connait la
 * taille reelle est une erreur qui attend son heure.
 */
export function Fauteuil({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <Importe
      url="/models/fauteuil.glb"
      reglages={PALETTE.boitier}
      trait={0.0026}
      position={position}
      rotation={rotation}
    />
  );
}

/**
 * LES CABLES, ET POURQUOI ILS COMPTENT PLUS QU'ILS N'EN ONT L'AIR.
 *
 * Aucun ecran n'etait branche. C'est le detail le moins spectaculaire et le
 * plus revelateur : dans une piece reelle il y a toujours un fil qui tombe
 * derriere le meuble, et son absence est une des signatures les plus sures
 * d'une image de synthese. L'oeil ne le remarque pas, il remarque que quelque
 * chose cloche.
 *
 * UNE COURBE ET NON DEUX SEGMENTS. Un cable ne va jamais droit au but : c'est
 * son MOU qui le rend credible, pas son trajet. Les points de controle sont
 * donc poses de travers, l'un d'eux revenant meme en arriere — sans quoi on
 * obtient une tige coudee, ce qu'aucun cable ne fait.
 */
const CABLE = { couleur: "#16181d", paliers: 3, grain: 0.05, plancher: 0.26 } as const;

export function Cables({ position }: { position: [number, number, number] }) {
  const tubes = useMemo(
    () =>
      (
        [
          // ILS COURENT SUR LE PLATEAU, ET SORTENT PAR L'ARRIERE.
          //
          // Les deux essais precedents ont echoue par le meme bout. Derriere le
          // meuble, ils etaient parfaits et INVISIBLES. Devant le tablier, dans
          // le vide sous le plateau, ils sont devenus trois MOIGNONS NOIRS :
          // le plateau, vu de haut, masque le sol au-dela de z = -0,78, si bien
          // que le cable disparaissait a mi-hauteur et s'arretait en l'air.
          //
          // Ce qui manquait aux deux n'est pas une trajectoire mais un CONTACT.
          // Un cable ne se lit pas parce qu'il pend, il se lit parce qu'il
          // TOUCHE : il sort d'un appareil, il rampe sur une surface eclairee,
          // il passe un bord. Le voici donc a plat sur le plateau, derriere les
          // ecrans — la seule bande a la fois visible du plan large et prise
          // dans la lumiere de la lampe — puis basculant par-dessus l'arete
          // arriere. Sa chute tombe dans les vingt-sept centimetres entre le
          // plateau et le mur, que AUCUNE camera n'atteint : l'oeil lit « ça
          // descend derriere le bureau », qui est la verite, au lieu de
          // constater que ça s'arrete.
          //
          // Onze millimetres, c'etait un tuyau d'arrosage. Sept, c'est un cable.
          [[-0.30, 0.007, -0.44], [-0.41, 0.007, -0.53], [-0.49, 0.007, -0.66], [-0.53, -0.09, -0.80]],
          [[0.52, 0.007, -0.40], [0.45, 0.007, -0.54], [0.40, 0.007, -0.68], [0.38, -0.09, -0.80]],
          // CELUI DE LA MACHINE PART DE SON ANGLE ARRIERE, et il a fallu le
          // refaire quand la tour a grandi : elle s'est ecartee de douze
          // centimetres vers la gauche, son cable est reste ou il etait, et il
          // sortait donc du vide a cote d'elle.
          //
          // Il flane, parce que le mou est ce qui distingue un cable d'une
          // droite tiree au cordeau — mais il flane VERS LA DROITE, ce qui
          // n'est pas un caprice de trace : le socle de la lampe est un disque
          // de neuf centimetres de rayon centre en (-1,32 ; -0,60), et la route
          // directe lui passait dedans.
          [[-1.3, 0.007, -0.48], [-1.18, 0.007, -0.58], [-1.2, 0.007, -0.7], [-1.15, -0.09, -0.81]],
        ] as const
      ).map((points) => {
        const courbe = new THREE.CatmullRomCurve3(
          points.map((p) => new THREE.Vector3(...p)),
          false,
          "catmullrom",
          0.6
        );
        return new THREE.TubeGeometry(courbe, 24, 0.007, 6, false);
      }),
    []
  );

  return (
    <group position={position}>
      {tubes.map((g, i) => (
        // Le trait descend avec le diametre : a 0,0016 il ajoutait six
        // millimetres de noir de chaque cote d'un cable qui en fait sept, donc
        // il DOUBLAIT le cable. C'est ce qui les faisait lire comme des rayures.
        <Forme key={i} reglages={CABLE} trait={0.0009} receiveShadow={false}>
          <primitive object={g} attach="geometry" />
        </Forme>
      ))}
    </group>
  );
}

/**
 * LE TAPIS. Le sol est un plan noir, et ça se voit au plan du seuil : le bureau
 * et le fauteuil flottent sur du neant. Un tapis les rattache au sol et casse
 * le grand aplat sombre — c'est le meme service qu'un socle rend a une statue.
 *
 * Une BOITE tres plate et non un plan : a epaisseur nulle, la tranche
 * disparait et le contour du croquis dessine un rectangle sans volume, ce qui
 * se lit comme une tache et non comme un objet pose.
 */
export function Tapis({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <Forme
      reglages={{ couleur: "#2c3242", paliers: 4, grain: 0.22, plancher: 0.3 }}
      position={position}
      rotation={rotation}
      trait={0.0022}
      castShadow={false}
    >
      <boxGeometry args={[3.5, 0.012, 2.3]} />
    </Forme>
  );
}

/** Des feuillets epars : le desordre qui prouve qu'on travaille. */
export function Feuillets({ position }: { position: [number, number, number] }) {
  const pages: [number, number, number][] = [
    [0, 0, 0.02],
    [0.03, 0.0015, -0.34],
    [-0.02, 0.003, 0.21],
  ];
  return (
    <group position={position}>
      {pages.map(([x, y, r], i) => (
        <Forme
          key={i}
          reglages={PALETTE.papier}
          position={[x, y + 0.0012, 0]}
          rotation={[0, r, 0]}
          trait={0.0018}
        >
          <boxGeometry args={[0.21, 0.0022, 0.29]} />
        </Forme>
      ))}
    </group>
  );
}

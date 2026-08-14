"use client";

import { Forme } from "../croquis/Forme";

// LE COULOIR, ET LA PIECE AU BOUT.
//
// Le voyage commençait sur le bureau, a quatre metres : on ouvrait la page et
// l'on y etait deja. Il commence maintenant de LOIN, dans un passage sombre
// dont la seule lumiere est, tout au fond, la flaque de la lampe. Ce n'est pas
// un decor de plus : c'est ce qui donne au defilement une raison d'exister
// avant meme la premiere station. On avance vers quelque chose.
//
// TOUT EST EN BOITES, et c'est un choix de rendu autant que de cout. Le
// materiau croquis cerne chaque volume d'un contour : sur des formes simples il
// dessine une perspective nette, sur des formes molles il bave. Un couloir est
// justement la figure la plus lisible qu'on puisse tracer — deux fuyantes et
// une ligne d'horizon.

/** La geometrie du lieu, en un seul endroit : la camera s'y refere. */
const LIEU = {
  /**
   * Demi-largeur du couloir.
   *
   * Deux metres vingt de large, soit un vrai couloir. La premiere version en
   * faisait quatre-huit pour que la camera puisse filer droit vers le plan
   * large sans traverser un mur — et a cette largeur, avec le champ d'alors,
   * les murs n'entraient jamais dans le cadre : il n'y avait plus de couloir a
   * voir. C'est l'arret au SEUIL qui a rendu l'etroitesse possible, en
   * remplaçant une corde oblique par deux segments droits.
   */
  couloir: 1.1,
  /** Demi-largeur de la piece du bureau. */
  piece: 4.2,
  /** Le seuil : ou le couloir debouche. */
  seuil: 7.5,
  /** Le fond du couloir, derriere la camera de depart. */
  fond: 13.5,
  hauteurCouloir: 2.4,
  hauteurPiece: 3.2,
} as const;

const MUR = { couleur: "#111419", paliers: 3, grain: 0.09, plancher: 0.13 } as const;
// LES MURS DU COULOIR SONT PLUS CLAIRS QUE CEUX DE LA PIECE, ce qui parait a
// l'envers et ne l'est pas. Le materiau croquis MULTIPLIE la couleur propre par
// l'eclairage : sous une lumiere faible, seul un albedo clair rend encore
// quelque chose. A #0e1116 les deux fuyantes tombaient au noir et il ne restait
// que les bandeaux du plafond flottant dans le vide — un couloir dont on ne
// voit pas les murs n'est pas un couloir.
const MUR_COULOIR = { couleur: "#232a36", paliers: 3, grain: 0.1, plancher: 0.2 } as const;
const NERVURE = { couleur: "#39434f", paliers: 3, grain: 0.07, plancher: 0.24 } as const;

/**
 * Les nervures du couloir, et pourquoi elles ne sont pas decoratives.
 *
 * Un couloir aux murs lisses n'a AUCUNE echelle : on ne sait ni s'il fait dix
 * metres ni cinquante, et l'on n'a donc pas la sensation d'avancer — les deux
 * fuyantes glissent sans rien qui defile. Quatre cadres reguliers suffisent a
 * donner la parallaxe : ce sont eux qui passent, pas le mur.
 */
const NERVURES = [8.0, 8.9, 9.8];

// AUCUNE PIECE DU COULOIR NE PORTE D'OMBRE. La lampe du bureau est a onze
// metres, sa portee en fait cinq : elle n'eclaire rien ici. Mais three ne le
// sait pas — il rend TOUS les objets marques porteurs d'ombre dans les six faces
// de la carte cubique, et le couloir est le decor le plus lourd de la scene. Le
// retirer de la passe d'ombres est gratuit et invisible.
const SANS_OMBRE = { castShadow: false, receiveShadow: false } as const;

export function Couloir() {
  const { couloir, piece, seuil, fond, hauteurCouloir, hauteurPiece } = LIEU;
  const longCouloir = fond - seuil;
  const zCouloir = (fond + seuil) / 2;

  return (
    <group>
      {/* --- La piece du bureau ------------------------------------------- */}
      {/* Les deux murs lateraux. Ils sont assez ecartes pour que le plan large,
          pris de biais a 2,35 m sur X, reste a l'interieur : une camera placee
          derriere un mur ne cadre rien du tout. */}
      {[-piece, piece].map((x) => (
        <Forme key={x} reglages={MUR} position={[x, hauteurPiece / 2, (seuil - 1.05) / 2]} trait={0} {...SANS_OMBRE}>
          <boxGeometry args={[0.08, hauteurPiece, seuil + 1.05]} />
        </Forme>
      ))}

      {/* --- Le seuil ------------------------------------------------------ */}
      {/* Le mur qui separe les deux volumes, perce de l'ouverture du couloir :
          trois panneaux plutot qu'un trou, parce qu'une boite ne se perce pas.
          C'est LE plan qui fait exister le couloir comme un ailleurs — sans
          lui, on traverse d'un volume a l'autre sans rien franchir. */}
      {[-1, 1].map((s) => (
        <Forme
          key={s}
          reglages={MUR}
          position={[(s * (piece + couloir)) / 2, hauteurPiece / 2, seuil]}
          trait={0.003}
          {...SANS_OMBRE}
        >
          <boxGeometry args={[piece - couloir, hauteurPiece, 0.1]} />
        </Forme>
      ))}
      <Forme
        reglages={MUR}
        position={[0, (hauteurCouloir + hauteurPiece) / 2, seuil]}
        trait={0.003}
      >
        <boxGeometry args={[couloir * 2, hauteurPiece - hauteurCouloir, 0.1]} />
      </Forme>

      {/* --- Le couloir ---------------------------------------------------- */}
      {/* SON PROPRE SOL, pose d'un millimetre au-dessus du grand plan.
          Le sol de la piece est presque noir, ce qui convient a un ilot de
          lampe dans le vide ; dans le couloir, il effaçait la fuyante du bas et
          l'on flottait entre deux murs sans savoir a quelle hauteur. Une dalle
          separee permet de l'eclaircir la ou il faut sans toucher a la piece. */}
      <Forme
        reglages={{ couleur: "#232a36", paliers: 3, grain: 0.11, plancher: 0.2 }}
        position={[0, 0.001, zCouloir]}
        rotation={[-Math.PI / 2, 0, 0]}
        trait={0}
        {...SANS_OMBRE}
      >
        <planeGeometry args={[couloir * 2, longCouloir]} />
      </Forme>

      {[-couloir, couloir].map((x) => (
        <Forme key={x} reglages={MUR_COULOIR} position={[x, hauteurCouloir / 2, zCouloir]} trait={0} {...SANS_OMBRE}>
          <boxGeometry args={[0.08, hauteurCouloir, longCouloir]} />
        </Forme>
      ))}
      {/* Le plafond n'existe QUE sur le couloir. Au-dessus de la piece, il
          entrerait dans le champ du plan large et fermerait une image qui vaut
          justement par le noir au-dessus du bureau. */}
      <Forme reglages={MUR_COULOIR} position={[0, hauteurCouloir, zCouloir]} trait={0} {...SANS_OMBRE}>
        <boxGeometry args={[couloir * 2, 0.08, longCouloir]} />
      </Forme>

      {NERVURES.map((z) => (
        <group key={z}>
          {[-couloir, couloir].map((x) => (
            <Forme
              key={x}
              reglages={NERVURE}
              position={[x - Math.sign(x) * 0.06, hauteurCouloir / 2, z]}
              trait={0.0028}
              {...SANS_OMBRE}
            >
              <boxGeometry args={[0.06, hauteurCouloir, 0.14]} />
            </Forme>
          ))}
          <Forme
            reglages={NERVURE}
            position={[0, hauteurCouloir - 0.06, z]}
            trait={0.0028}
            {...SANS_OMBRE}
          >
            <boxGeometry args={[couloir * 2, 0.06, 0.14]} />
          </Forme>
        </group>
      ))}

      {/* LES BANDEAUX LUMINEUX SONT DES SURFACES, PAS DES LAMPES.
          Quatre vraies sources dans le couloir couteraient quatre passes
          d'eclairage par image pour eclairer des murs qu'on traverse en deux
          secondes. Un materiau non eclaire donne exactement la meme lecture —
          « il y a de la lumiere ici » — et ne coute rien. Le seul vrai
          luminaire de la scene reste la lampe du bureau, et c'est bien elle
          qu'on doit voir de loin. */}
      {NERVURES.map((z, i) => (
        <mesh key={z} position={[0, hauteurCouloir - 0.09, z - 0.45]}>
          <boxGeometry args={[0.3, 0.012, 0.55]} />
          {/* La derniere est la plus faible : le regard doit filer vers le
              fond, pas s'arreter au plafond juste au-dessus de soi. */}
          <meshBasicMaterial color={i === 2 ? "#495164" : "#6d7690"} />
        </mesh>
      ))}
    </group>
  );
}

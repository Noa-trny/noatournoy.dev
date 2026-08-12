"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Sky } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { CameraRig } from "./camera/CameraRig";
import { House } from "./house/House";
import { Vitrines } from "./vitrines/Vitrines";
import { Stele } from "./textes/Stele";
import type { Locale } from "@/content/routes";
import { journey } from "./scroll/journeyStore";
import { NIVEAUX } from "./camera/path";

// La scene. Phase 7 : la maison et le trajet de camera. Les vitrines viennent
// en phase 8, le garage et la voiture en phase 9.
//
// Deux choses volontairement absentes :
//
// - Aucun `<Environment preset=...>`. Il irait chercher une HDRI sur un CDN
//   tiers, que `connect-src 'self'` bloque. `<Sky>` est procedural et ne pese
//   pas un octet.
// - Aucun post-processing. Il tirerait tout l'EffectComposer, et surtout il
//   invaliderait le prechauffage des shaders — le piege de cle de cache qui a
//   coute 617 ms de pire frame sur Eclosion.

// LE SOLEIL, declare une seule fois.
//
// La meme position sert a `<Sky>` et a la directionnelle. Deux constantes
// auraient diverge a la premiere retouche, et un ciel dont le soleil n'est pas
// la ou les ombres disent qu'il est se lit faux immediatement, sans qu'on
// sache dire pourquoi.
//
// Dix-huit metres de haut pour trente-cinq de cote : environ 27 degres
// d'elevation. Ce choix n'est pas decoratif. Le beton brut n'a ni couleur ni
// motif — il n'a que du relief, et le relief ne devient visible qu'en lumiere
// rasante.
//
// L'angle a ete trouve par MESURE, pas au gout, et deux essais ont servi de
// bornes. A 31 degres sans ombres portees : un aplat gris. A 14 degres : la
// facade entiere disparaissait dans l'ombre du debord de toiture, et la
// lumiere ne se lisait plus que sur le sol.
//
// La contrainte s'ecrit d'ailleurs en une ligne. Un debord de profondeur p pose
// sur la facade une bande d'ombre de hauteur p / tan(elevation) ; pour qu'il en
// reste sous la bande, il faut tan(elevation) > p / hauteur de facade. Avec le
// debord de ce modele, cela place le plancher aux alentours de 27 degres — soit
// exactement assez pour que la bande soit franche sans tout avaler.
const SOLEIL: readonly [number, number, number] = [-32, 14, 21];

function Lumiere() {
  return (
    <>
      {/* La seule lumiere qui porte une ombre. Chaude, parce qu'un soleil bas
          traverse plus d'atmosphere — et parce que le froid du ciel dans les
          ombres n'existe comme contraste que s'il a du chaud en face. */}
      <directionalLight
        position={SOLEIL as unknown as THREE.Vector3Tuple}
        intensity={3.9}
        color="#ffdfba"
        castShadow
        shadow-mapSize={[2048, 2048]}
        // `bias` corrige l'acne de profondeur, `normalBias` le decollement sur
        // les surfaces vues de biais. Il faut les deux : la premiere seule
        // oblige a une valeur si forte que les ombres se detachent du pied des
        // objets.
        shadow-bias={-0.0006}
        shadow-normalBias={0.06}
        // Le troncon cadre le parvis et la maison, pas le monde : une ortho
        // large gaspille la resolution de la carte la ou personne ne regarde.
        shadow-camera-near={1}
        shadow-camera-far={110}
        shadow-camera-left={-38}
        shadow-camera-right={38}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
      />
      {/* L'appoint froid, a contre-jour et faible. Il empeche les faces a
          l'ombre de tomber au noir sans jamais combler les ombres portees —
          c'est la difference entre du modele et de la bouillie. */}
      <directionalLight position={[26, 14, -14]} intensity={0.5} color="#86a6d6" />
      {/* Le rebond du sol, et RIEN DE PLUS. L'appoint du ciel est desormais
          fourni par la carte d'environnement ; garder une hemispherique a
          pleine puissance a cote reviendrait a compter deux fois la meme
          lumiere, ce qui est exactement ce qui a delave la scene au premier
          essai. Il ne reste ici que le demi-ciel du BAS — le froid qui remonte
          du dallage — la moitie haute etant mise a zero.

          Le contraste d'une photo d'architecture n'est pas clair contre
          sombre, il est CHAUD contre FROID : le soleil bas est ambre, et ce
          qu'il ne touche pas n'est eclaire que par le bleu du ciel. */}
      <hemisphereLight args={["#000000", "#3d4653", 0.45]} />
    </>
  );
}

/**
 * Les ombres, calculees une fois puis gelees.
 *
 * Ni le soleil ni la maison ne bougent : recalculer la carte d'ombres a chaque
 * image reviendrait a payer une passe de rendu complete pour reobtenir
 * exactement la meme image. On laisse tourner quelques images — le temps que le
 * modele soit reellement dans la scene — puis on coupe la mise a jour.
 *
 * Monte DANS la frontiere de suspension de la maison, et c'est tout l'interet :
 * il ne peut donc pas geler la carte avant que le GLB soit arrive.
 */
function OmbresGelees() {
  const gl = useThree((s) => s.gl);
  const restant = useRef(8);
  useFrame(() => {
    if (restant.current <= 0) return;
    restant.current -= 1;
    if (restant.current === 0) gl.shadowMap.autoUpdate = false;
  });
  return null;
}

/**
 * Le sol.
 *
 * Le terrain du modele a ete retire — 92 x 75 m de pelouse que la camera ne
 * verra jamais. Restait un vide blanc sous l'esplanade, qui la faisait flotter.
 * Un plan suffit : la camera ne s'en approche jamais assez pour demander une
 * texture.
 *
 * L'ombre de contact cuite qui vivait ici a ete retiree. Elle etait un
 * substitut a des ombres portees ; maintenant qu'il y en a de vraies, elle ne
 * ferait que doubler l'assombrissement sous la dalle.
 *
 * SA HAUTEUR EST LE REGLAGE QUI COMPTE, et je l'avais fausse. Le plan etait a
 * -2,99, soit la hauteur de l'ancien terrain. Or le parvis est perce d'un
 * cercle a l'endroit ou le modele posait un bassin, que la suppression du
 * terrain a laisse ouvert : on voyait donc le sol deux metres soixante-dix plus
 * bas, ce qui se lisait comme une fosse noire en plein milieu du cadre — et
 * d'autant plus depuis que les ombres existent, l'interieur du trou etant
 * masque par son propre rebord.
 *
 * Cale trois centimetres sous le parvis, un percement du dallage se lit comme
 * du dallage. Trois centimetres et non zero : a hauteur egale les deux surfaces
 * se disputeraient le tampon de profondeur.
 *
 * Le parvis de reference est celui du BAS — le niveau du garage, ou la camera
 * commence — et non le plancher du sejour. La villa s'etage sur quatre niveaux
 * la ou le pavillon etait de plain-pied ; poser le sol au niveau du sejour
 * aurait noye l'escalier et la voiture sous une dalle.
 */
function Sol() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, NIVEAUX.garage - 0.03, 0]}
      receiveShadow
      raycast={() => {}}
    >
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial color="#84806f" roughness={0.97} metalness={0} />
    </mesh>
  );
}

export default function Scene({ locale }: { locale: Locale }) {
  return (
    <Canvas
      camera={{ fov: 30, near: 0.1, far: 400, position: [0, 1.9, 24] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 1.75]}
      // DE VRAIES OMBRES PORTEES, et c'est le changement qui fait tout le
      // reste. Sans elles la directionnelle « rasante » n'eclairait que la
      // face qu'elle touchait, sans rien projeter : la maison, les vitrines
      // et la stele flottaient au meme gris. Le cout est nul en regime
      // etabli, la carte etant gelee des la maison chargee.
      //
      // PCF simple et non PCFSoft : three deprecie le second, qui retombe de
      // toute facon sur le premier en emettant un avertissement.
      shadows={{ type: THREE.PCFShadowMap }}
      // Purement decoratif : jamais dans l'arbre d'accessibilite, jamais un
      // arret de tabulation. Toute la navigation vit dans le DOM, a cote.
      aria-hidden="true"
      tabIndex={-1}
      // Un clic dans le vide eteint le survol : R3F ne relance un lancer de
      // rayon que sur evenement pointeur, jamais parce que la camera a bouge.
      onPointerMissed={() => journey.set({ activeId: null })}
    >
      <color attach="background" args={["#b9c3cf"]} />
      {/* LA BRUME, et son vrai role n'est pas l'ambiance.
      
          Le sol est un plan de quatre cents metres de cote. Sans elle il
          rencontre le ciel sur une ligne parfaitement droite et parfaitement
          nette, a mi-hauteur d'image — ce qui denonce le plan comme un plan.
          Une decroissance exponentielle le dissout avant qu'il n'atteigne son
          bord, et l'horizon cesse d'exister.
      
          La densite est choisie pour que la villa n'en paie presque rien : a
          trente metres l'attenuation vaut quatre pour cent, a deux cents metres
          les trois quarts. C'est aussi de la perspective aerienne — le lointain
          d'une photo d'architecture est toujours plus pale que le premier plan.
      
          Le `<Sky>` n'est pas concerne : son shader ne lit pas le brouillard,
          ce qui est ici exactement ce qu'on veut. */}
      <fogExp2 attach="fog" args={["#cdd0cf", 0.0075]} />
      {/* Turbidite plus haute que par defaut : c'est la brume, et c'est
          elle qui donne au soleil bas son halo chaud au-dessus de
          l'horizon. */}
      <Sky
        sunPosition={SOLEIL as unknown as THREE.Vector3Tuple}
        turbidity={8.0}
        rayleigh={0.9}
      />
      {/* L'ENVIRONNEMENT, cuit une fois a partir du ciel lui-meme.
      
          Sans lui, un materiau lisse n'a rien a refleter : les baies rendaient
          des rectangles noirs, ce qui est le contraire de ce qu'une vitre fait
          en exterieur. `<Environment preset=...>` irait chercher une HDRI sur
          un CDN tiers, que `connect-src 'self'` bloque ; en lui donnant le
          `<Sky>` procedural pour enfant, on obtient la meme carte sans un octet
          de reseau et sans elargir la CSP.
      
          `frames={1}` : le ciel ne bouge pas, la cuisson n'a donc lieu qu'une
          fois — meme raisonnement que pour la carte d'ombres. */}
      <Environment
        frames={1}
        resolution={128}
        // A UN, la carte du ciel eclaire la scene autant qu'un plein jour
        // couvert : la premiere version rendait un beton presque blanc et
        // effacait les ombres qu'on venait d'obtenir. Elle n'est pas ici pour
        // eclairer — les directionnelles s'en chargent — mais pour DONNER
        // QUELQUE CHOSE A REFLETER aux surfaces lisses.
        environmentIntensity={0.3}
      >
        <Sky
          sunPosition={SOLEIL as unknown as THREE.Vector3Tuple}
          turbidity={8.0}
          rayleigh={0.9}
        />
      </Environment>
      <Lumiere />
      <Sol />
      <CameraRig />
      {/* La maison a sa propre frontiere : quand le garage arrivera en phase 9,
          il aura la sienne, et sa suspension ne figera pas ce qui est deja la. */}
      <Suspense fallback={null}>
        <House />
        <OmbresGelees />
      </Suspense>
      {/* Les vitrines ont leur propre frontiere : leurs captures ne doivent pas
          retarder l'apparition de la maison. */}
      <Suspense fallback={null}>
        <Vitrines locale={locale} />
      </Suspense>
      <Stele locale={locale} />
    </Canvas>
  );
}

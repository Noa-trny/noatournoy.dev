"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import type { Locale } from "@/content/routes";
import { Rig } from "./Rig";
import { CHAMP } from "./zones";
import { useRouter } from "next/navigation";
import { routes } from "@/content/routes";
import { PROJECTS } from "@/content/projects";
import { LIGNES_CONTACT, LIGNES_PROJETS } from "./peinture";
import { Dalle } from "./Dalle";
import {
  peindreApropos,
  peindreContact,
  peindreParcours,
  peindreProjets,
  peindreStack,
} from "./peinture";
import { Sensible } from "./Sensible";
import * as THREE from "three";
import { Forme } from "../croquis/Forme";
import { Couloir } from "./Couloir";
import {
  Carnet,
  Ecran,
  Lampe,
  Machine,
  Mug,
  PALETTE,
  Plante,
  Plateau,
  Portable,
  Saisie,
  Livres,
  Casque,
  Feuillets,
} from "./pieces";

// LE POSTE DE TRAVAIL.
//
// Un bureau de nuit vu de trois quarts. Chaque objet du quotidien porte une
// section du site : les ecrans les projets, le carnet le parcours, la machine
// la stack, l'enveloppe le contact. C'est ce qui distingue ce monde d'un menu
// deguise en 3D — le decor EST le contenu, comme les autocollants sur la porte
// d'itomdev.
//
// L'ECLAIRAGE PORTE TOUT LE PROPOS. Une lampe chaude fait un ilot au centre, le
// reste tombe dans un bleu froid et le fond disparait. Un bureau uniformement
// eclairé est un bureau de bureau ; celui-ci doit etre un poste a soi, la nuit.
//
// Trois sources et pas une de plus : les aplats du shader ecrasent les degrades,
// donc multiplier les lumieres n'ajoute pas de modele, seulement des bandes.

/** Le halo de la lampe : une sphere non eclairee, tres transparente. */
function Halo() {
  return (
    <mesh position={[-1.0, 1.2, -0.45]} raycast={() => {}}>
      <sphereGeometry args={[0.52, 16, 12]} />
      <meshBasicMaterial color="#ffe0b0" transparent opacity={0.04} depthWrite={false} />
    </mesh>
  );
}

export default function Bureau({ locale = "fr" }: { locale?: Locale }) {
  // Les peintres sont memorises sur la langue : sans ça, chaque rendu de
  // React en fabriquerait de nouveaux et `Dalle` repeindrait cinq toiles.
  const routeur = useRouter();

  // LES LIGNES CLIQUABLES, derivees de la meme geometrie que le dessin.
  //
  // Les projets naviguent par le routeur de Next : sans rechargement, et vers
  // de vraies URL qui existent aussi dans le document. Les liens externes
  // passent par `window.open` avec `noopener` — sans lui, la page ouverte
  // recupere une reference vers celle-ci par `window.opener` et peut la
  // rediriger.
  const lignesProjets = useMemo(
    () =>
      PROJECTS.map((p, i) => ({
        y0: LIGNES_PROJETS.haut + i * LIGNES_PROJETS.pas,
        y1: LIGNES_PROJETS.haut + i * LIGNES_PROJETS.pas + LIGNES_PROJETS.hauteur,
        faire: () => routeur.push(routes.project[locale](p.slug)),
      })),
    [routeur, locale]
  );

  const lignesContact = useMemo(() => {
    const cibles: (() => void)[] = [
      () => {
        window.location.href = "mailto:noa.tournoy@supinfo.com";
      },
      () => {
        window.open("https://github.com/Noa-trny", "_blank", "noopener,noreferrer");
      },
      () => {
        window.open(
          "https://www.linkedin.com/in/noa-tournoy/",
          "_blank",
          "noopener,noreferrer"
        );
      },
    ];
    return cibles.map((faire, i) => ({
      y0: LIGNES_CONTACT.haut + i * LIGNES_CONTACT.pas,
      y1: LIGNES_CONTACT.haut + i * LIGNES_CONTACT.pas + LIGNES_CONTACT.hauteur,
      faire,
    }));
  }, []);

  const peintres = useMemo(
    () => ({
      projets: () => peindreProjets(locale),
      apropos: () => peindreApropos(locale),
      parcours: () => peindreParcours(locale),
      stack: () => peindreStack(locale),
      contact: () => peindreContact(locale),
    }),
    [locale]
  );

  return (
    <div className="fixed inset-0">
      <Canvas
        // Trois quarts, legerement en plongee : c'est l'angle d'ou l'on voit un
        // bureau quand on s'en approche, et le seul qui montre a la fois les
        // ecrans et le plateau. De face, les objets poses disparaissent.
        camera={{ fov: CHAMP, near: 0.05, far: 40, position: [2.35, 1.98, 2.85] }}
        gl={{ antialias: true }}
        // LA CAMERA DOIT VISER, et R3F ne le fait pas pour vous. Sans `lookAt`,
        // elle regarde droit devant elle le long de -Z : placee en hauteur et de
        // biais, elle cadrait donc le vide au-dessus du plateau, et le bureau
        // sortait par le bas. Le point vise est le centre du plateau, un peu
        // en arriere, pour que les ecrans montent dans le cadre.
        // La visee est desormais tenue par <Rig>, qui la partage avec les
        // vols vers chaque zone. La poser ici aussi la ferait sauter d'une
        // image au premier rendu.
        dpr={[1, 1.5]}
        shadows={{ type: THREE.PCFShadowMap }}
        // LE CLIC DANS LE VIDE NE FAIT PLUS RIEN. Il ramenait au plan large,
        // ce qui avait un sens quand un clic ouvrait un panneau ; maintenant
        // qu'il fait defiler, le meme geste renverrait au debut du trajet a la
        // moindre maladresse. On recule en defilant, comme on avance.
      >
        <color attach="background" args={["#0a0b0d"]} />
        {/* La brume s'ouvre encore. A 0,13 elle etait juste pour une piece de
            quatre metres ; depuis le fond du couloir, a onze, elle effaçait
            quatre cinquiemes de la flaque de la lampe — c'est-a-dire la seule
            chose que ce premier plan doit montrer. A 0,085, le couloir garde sa
            profondeur et la destination reste visible. */}
        <fogExp2 attach="fog" args={["#090a0d", 0.085]} />

        {/* LA LAMPE. Portee, chaude, placee dans l'abat-jour.

            LA FLAQUE ETAIT UN DISQUE, et c'est `distance` qui la decoupait : au
            dela, la lumiere s'arrete NET. Une lampe ne s'arrete pas, elle
            faiblit. On la porte donc assez loin pour que seule la decroissance
            en carre agisse, et l'on baisse l'intensite d'autant. La couleur est
            aussi moins ambree : a #ffd6a0 tout le bureau virait a l'orange, y
            compris ce que la lampe n'atteint pas — signe d'une teinte trop
            saturee, pas d'une lumiere trop forte. C'est la seule
            source qui projette une ombre : deux lumieres a ombres donneraient
            deux ombres par objet, ce qu'aucun bureau ne fait. */}
        <pointLight
          // LA SOURCE EST DANS L'ABAT-JOUR, et elle n'y etait pas : elle
          // flottait cinquante centimetres a sa droite, si bien que la flaque
          // ne tombait pas sous la lampe. Personne ne l'avait vu parce qu'une
          // flaque ronde a l'air juste ou qu'elle soit — jusqu'a ce qu'on
          // regarde la lampe et la flaque ensemble.
          position={[-1.0, 1.2, -0.45]}
          intensity={2.5}
          distance={11}
          decay={2}
          color="#ffe4c4"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0012}
          shadow-normalBias={0.03}
          shadow-camera-near={0.1}
          shadow-camera-far={6}
        />

        {/* La lueur des ecrans, froide, sans ombre : elle remonte sur le clavier
            et sur le visage de celui qui n'est pas la. */}
        <pointLight
          position={[0.1, 1.12, -0.3]}
          intensity={1.35}
          distance={5}
          decay={2}
          color="#8fbcff"
        />

        {/* L'ambiante, tres faible et bleue : elle empeche le noir absolu sans
            eclairer la piece. */}
        {/* L'ambiante remonte : le froid doit exister ailleurs que sous les
            ecrans, sinon le chaud de la lampe n'a rien contre quoi se detacher
            et l'image entiere passe orange. */}
        <hemisphereLight args={["#3d4f70", "#0e1116", 0.85]} />

        {/* Le sol. Il recoit l'ombre du bureau — sans lui, le meuble flotte —
            et il court desormais jusqu'au fond du couloir : un couloir sans sol
            n'a qu'une fuyante sur deux, et l'oeil ne sait plus a quelle hauteur
            il se trouve. Sans trait : un contour sur un plan de vingt-quatre
            metres dessinerait un cadre autour de la scene. */}
        <Forme
          reglages={{ couleur: "#0f1116", paliers: 3, grain: 0.08, plancher: 0.16 }}
          position={[0, 0, 4.5]}
          rotation={[-Math.PI / 2, 0, 0]}
          trait={0}
          castShadow={false}
        >
          <planeGeometry args={[16, 24]} />
        </Forme>

        {/* Le mur du fond, juste derriere les ecrans : il donne une butee au
            regard et recoit le halo de la lampe. */}
        {/* Le mur descend en valeur. A #1b1e26 avec un plancher a 0,28, il
            renvoyait presque autant que le plateau eclaire : le bureau n'etait
            plus un ilot dans le noir, mais un objet pose sur un fond gris. */}
        <Forme
          reglages={{ couleur: "#12151b", paliers: 3, grain: 0.1, plancher: 0.14 }}
          position={[0, 1.6, -1.05]}
          trait={0}
        >
          <boxGeometry args={[8.6, 3.2, 0.06]} />
        </Forme>

        {/* LA LUMIERE DU COULOIR : une seule source, et elle s'arrete avant le
            bureau. `distance` a huit metres depuis le milieu du passage : elle
            revele les deux fuyantes et meurt au seuil, donc elle ne touche pas
            l'ilot de la lampe — qui doit rester la seule chaleur de la scene.
            Trois sources pour trois bandeaux auraient coute trois passes
            d'eclairage par image sur TOUS les materiaux, y compris ceux du
            bureau, pour un couloir qu'on traverse en deux secondes. */}
        <pointLight
          position={[0, 2.15, 9.1]}
          intensity={2.6}
          distance={8}
          decay={2}
          color="#7c88a4"
        />

        <Couloir />

        <Plateau />

        {/* Les deux ecrans, legerement tournes vers le siege : un ecran droit
            face au monde est un ecran de vitrine, pas de travail. */}
        <Ecran position={[-0.32, 0.7675, -0.34]} rotation={[0, 0.22, 0]}>
          <Dalle
            peindre={peintres.projets}
            largeur={0.58}
            hauteur={0.34}
            lignes={lignesProjets}
            reference={LIGNES_PROJETS.reference}
          />
        </Ecran>
        <Ecran position={[0.5, 0.7675, -0.3]} rotation={[0, -0.3, 0]} largeur={0.54} hauteur={0.34}>
          <Dalle peindre={peintres.apropos} largeur={0.5} hauteur={0.3} />
        </Ecran>

        <Portable position={[1.02, 0.7675, 0.16]} rotation={[0, -0.62, 0]}>
          <Dalle
            peindre={peintres.contact}
            largeur={0.31}
            hauteur={0.19}
            lignes={lignesContact}
            reference={LIGNES_CONTACT.reference}
          />
        </Portable>
        <Saisie position={[-0.18, 0.7675, 0.28]} />
        {/* LE CARNET EST OUVERT, et sa page porte la frise. Ferme, il ne
            pouvait qu'annoncer une section ; ouvert, il la montre. C'est toute
            la difference entre un objet qui designe un contenu et un objet qui
            EST le contenu. */}
        <Carnet position={[-1.02, 0.7675, 0.2]} rotation={[0, 0.34, 0]}>
          <Dalle
            peindre={peintres.parcours}
            largeur={0.175}
            hauteur={0.255}
            position={[0, 0.031, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            eclaire
          />
        </Carnet>
        <Machine position={[-1.24, 0.7675, -0.34]} rotation={[0, 0.18, 0]}>
          {/* Le flanc de la machine, tourne vers la camera : une etiquette
              d'inventaire plutot qu'un boitier muet. */}
          <Dalle
            peindre={peintres.stack}
            largeur={0.28}
            hauteur={0.21}
            position={[0.082, 0.115, 0]}
            // Un seul quart de tour, autour de Y. Le second, autour de Z, faisait
            // monter l'etiquette a la verticale : le mot « STACK » se lisait de
            // bas en haut le long de l'arete.
            rotation={[0, Math.PI / 2, 0]}
            eclaire
          />
        </Machine>
        <Lampe position={[-1.32, 0.7675, -0.6]} />
        <Mug position={[0.28, 0.7675, 0.36]} />
        <Plante position={[1.42, 0.7675, -0.46]} />
        {/* Le cote droit etait vide : trois objets suffisent a l'habiter, et
            chacun apporte une hauteur differente — c'est la variation de
            hauteur qui fait un plateau vecu plutot qu'un plan de travail. */}
        <Livres position={[1.36, 0.7675, 0.18]} rotation={[0, -0.42, 0]} />
        {/* SA PROPRE FRONTIERE DE SUSPENSE, et non celle de la scene. Le
            casque est le seul objet qui se telecharge ; partager la frontiere
            du monde ferait attendre le bureau entier — couloir compris — sur
            vingt-six kilooctets. Le repli est `null` et non un element du DOM :
            dans un canvas, React reconcilie des objets three, pas des balises,
            et un div en repli fait planter le reconciliateur. */}
        <Suspense fallback={null}>
          <Casque position={[0.92, 0.7675, -0.52]} />
        </Suspense>
        <Feuillets position={[0.58, 0.7675, 0.42]} />

        <Halo />

        {/* LE RIG ET LES ZONES SENSIBLES.

            Cinq boites invisibles, une par section, PLUS GENEREUSES que les
            objets qu'elles designent : un carnet de deux centimetres
            d'epaisseur est impossible a viser a la souris, une boite de quinze
            centimetres autour se vise sans y penser. */}
        <Rig />
        <Sensible
          id="projets"
          position={[-0.32, 1.05, -0.33]}
          taille={[0.7, 0.46, 0.2]}
          rotation={[0, 0.22, 0]}
        />
        <Sensible
          id="apropos"
          position={[0.5, 1.03, -0.29]}
          taille={[0.62, 0.42, 0.2]}
          rotation={[0, -0.3, 0]}
        />
        <Sensible
          id="parcours"
          position={[-1.02, 0.81, 0.2]}
          taille={[0.32, 0.18, 0.38]}
          rotation={[0, 0.34, 0]}
        />
        <Sensible
          id="stack"
          position={[-1.24, 0.88, -0.34]}
          taille={[0.28, 0.32, 0.4]}
          rotation={[0, 0.18, 0]}
        />
        <Sensible
          id="contact"
          position={[1.02, 0.85, 0.1]}
          taille={[0.44, 0.26, 0.38]}
          rotation={[0, -0.62, 0]}
        />
      </Canvas>
    </div>
  );
}

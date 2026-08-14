"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { bureau } from "./etat";
import { STATIONS, TRAJETS, piste } from "./defilement";
import {
  CHAMP,
  VUE_SEUIL,
  VUE_SEUIL_PORTRAIT,
  RECUL_MAX,
  SEUIL_PORTRAIT,
  VUE_COULOIR,
  VUE_COULOIR_PORTRAIT,
  VUE_LARGE,
  VUE_PORTRAIT,
  zonePar,
} from "./zones";

// LE VOL DE CAMERA, DESORMAIS PILOTE PAR LA BARRE DE DEFILEMENT.
//
// GSAP a disparu d'ici, et ce n'est pas une economie de dependance : il n'avait
// plus rien a animer. Une camera qui suit le defilement n'a pas de duree — sa
// position est une FONCTION de la progression, pas une trajectoire dans le
// temps. Faire tenir les deux ensemble aurait donne un tween qui court apres
// une valeur qui change pendant qu'il court.
//
// CE QUI RESTE DU CONTRAT PRECEDENT : le rendu ne passe jamais par React. La
// barre ecrit un nombre, `useFrame` le lit et pose la camera. Deux boucles
// d'animation independantes ne peuvent pas se desynchroniser si l'une se
// contente de lire ce que l'autre a ecrit.

const _oeil = new THREE.Vector3();
const _cible = new THREE.Vector3();

/**
 * L'ADOUCISSEMENT ENTRE DEUX STATIONS, et c'est lui qui fait qu'on s'ARRETE.
 *
 * Une interpolation lineaire donnerait une camera a vitesse constante qui
 * traverse chaque station sans jamais s'y poser : le contenu defilerait devant
 * l'oeil comme un paysage de train. Le lissage en `t^3(t(6t-15)+10)` a une
 * derivee nulle AUX DEUX BOUTS : la camera arrive lentement, tient un instant,
 * puis repart. C'est la difference entre passer devant un objet et le regarder.
 */
const adoucir = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

// LE MOUCHARD, sous le meme drapeau que le forçage de la scene.
//
// Une camera qui cadre le vide ne laisse aucune trace : pas d'erreur, pas
// d'avertissement, une image noire. Le seul moyen de savoir OU elle est, c'est
// qu'elle le dise. Trois defauts de cadrage de ce projet ont ete diagnostiques
// par raisonnement avant d'etre reproduits, et les trois fois le raisonnement
// s'est trompe.
const espion =
  typeof window !== "undefined" && window.location.search.includes("force3d");

export function Rig() {
  const camera = useThree((s) => s.camera);
  const taille = useThree((s) => s.size);
  // Le renderer n'est lu QUE par le mouchard. Le prendre ici plutot que
  // d'aller le chercher depuis l'exterieur est la seule façon fiable : R3F ne
  // publie le sien nulle part sur le document, et une sonde qui fouillait les
  // proprietes internes du canvas est revenue avec des zeros — ce qui se lit
  // comme « la scene ne dessine rien » alors qu'elle dessinait tres bien.
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const branche = useRef(false);
  const horloge = useRef({ derniere: 0, pire: 0, images: 0, cumul: 0 });
  const recense = useRef<{ maillages: number; geometriesDistinctes: number } | null>(null);
  const derniere = useRef<string | null>(null);

  // LE RAPPORT DE L'ECRAN CHOISIT LE PLAN, et il est lu ici plutot que par une
  // media query : c'est la camera qui cadre, pas la feuille de style.
  const portrait = taille.width / Math.max(taille.height, 1) < SEUIL_PORTRAIT;

  // LES SIX POINTS DE VUE, CALCULES UNE FOIS PAR FORMAT et non par image. Ils ne
  // dependent que de la taille de la fenetre ; les recalculer dans `useFrame`
  // ferait soixante fois par seconde un travail qui change au redimensionnement.
  const vues = useMemo(() => {
    const rapport = Math.max(taille.width / Math.max(taille.height, 1), 0.28);
    // La distance a laquelle une largeur donnee tient dans le cadre : c'est la
    // formule du champ, rien de plus. Elle remplace tout reglage a la main —
    // les vues, composees sur un ecran large, coupaient le texte des deux cotes
    // en portrait, et l'auraient recoupe a la premiere dalle redimensionnee.
    const distancePour = (largeur: number, champ: number) =>
      largeur / 2 / (Math.tan(THREE.MathUtils.degToRad(champ) / 2) * rapport);

    // Le plan large, lui, n'a pas de largeur a lire : il a une composition. On
    // le recule donc au rapport, borne haut et bas — sans quoi une fenetre
    // simplement etroite coupe les bords du bureau sans que rien ne bascule.
    // La borne haute vient des murs, pas du gout : voir RECUL_MAX.
    const reference = portrait ? 0.462 : 1.674;
    const reculLarge = Math.min(Math.max(reference / rapport, 1), RECUL_MAX);

    const approche = {
      couloir: portrait ? VUE_COULOIR_PORTRAIT : VUE_COULOIR,
      seuil: portrait ? VUE_SEUIL_PORTRAIT : VUE_SEUIL,
      bureau: portrait ? VUE_PORTRAIT : VUE_LARGE,
    } as const;

    return STATIONS.map((st) => {
      const z = st.zone ? zonePar(st.zone) : null;
      const large = st.cle === "bureau";
      const brut = z ?? approche[st.cle as keyof typeof approche] ?? approche.bureau;
      const cible = new THREE.Vector3(...brut.cible);
      const oeilBrut = new THREE.Vector3(...brut.oeil);
      // Le champ appartient au plan : large dans le couloir, resserre une fois
      // arrive. Une station qui n'en declare pas garde celui de la camera.
      const champ = "champ" in brut ? brut.champ : CHAMP;

      // Le facteur s'applique le long du vecteur cible -> oeil : seule la
      // distance change, jamais l'angle. C'est l'angle qui fait la composition.
      // Et jamais moins que la distance ecrite : elle a ete composee, on ne s'en
      // rapproche pas sous pretexte qu'un ecran est large.
      //
      // Le couloir ne recule PAS. Ce qui remplit son cadre, ce sont ses propres
      // murs : ils s'ecartent exactement comme le champ, donc reculer n'y montre
      // rien de plus — seulement du noir en plus, et un depart plus loin de la
      // seule lumiere de l'image.
      const facteur = z
        ? Math.max(1, distancePour(z.largeur, champ) / oeilBrut.distanceTo(cible))
        : large
          ? reculLarge
          : 1;

      const oeil = cible.clone().addScaledVector(oeilBrut.clone().sub(cible), facteur);
      return { oeil, cible, champ };
    });
  }, [taille.width, taille.height, portrait]);

  // Au changement de format, la camera doit se reposer immediatement sur la
  // nouvelle vue : l'amortissement ci-dessous part de l'ancienne, et sans ce
  // drapeau on verrait la camera glisser d'un plan a l'autre au redimensionnement.
  useEffect(() => {
    branche.current = false;
  }, [vues]);

  useFrame((_, dt) => {
    // L'INERTIE EST ICI, ET NULLE PART AILLEURS. `damp` est independant de la
    // cadence — un `lerp` a coefficient fixe donnerait une camera deux fois plus
    // molle sur un ecran a 120 Hz.
    piste.lisse = branche.current
      ? THREE.MathUtils.damp(piste.lisse, piste.brut, 5, dt)
      : piste.brut;

    const s = piste.lisse * TRAJETS;
    const i = Math.min(Math.floor(s), TRAJETS - 1);
    const t = adoucir(THREE.MathUtils.clamp(s - i, 0, 1));

    // Les deux bornes sont relues plutot qu'affirmees non nulles : `i` vient
    // d'un nombre a virgule, et une progression qui deborde d'un cheveu — ce
    // qu'un rebond de defilement produit sur macOS — sortirait du tableau.
    const de = vues[i];
    const vers = vues[i + 1];
    if (!de || !vers) return;

    _oeil.lerpVectors(de.oeil, vers.oeil, t);
    _cible.lerpVectors(de.cible, vers.cible, t);
    camera.position.copy(_oeil);
    camera.lookAt(_cible);

    // LE CHAMP SE RESSERRE EN MEME TEMPS QU'ON AVANCE : cinquante-huit degres
    // au fond du couloir, trente-deux une fois au bureau. C'est ce qui donne au
    // passage la compression d'un objectif qui se ferme plutot que le simple
    // rapprochement d'une camera fixe.
    //
    // `updateProjectionMatrix` recalcule une matrice a chaque appel : la garde
    // epsilon evite de le faire soixante fois par seconde pendant les longues
    // portions ou le champ ne bouge pas d'un centieme de degre.
    const champ = THREE.MathUtils.lerp(de.champ, vers.champ, t);
    const perspective = camera as THREE.PerspectiveCamera;
    if (Math.abs(perspective.fov - champ) > 0.01) {
      perspective.fov = champ;
      perspective.updateProjectionMatrix();
    }

    if (espion) {
      // LE COUT REEL, PAR IMAGE. `gl.info.render` est remis a zero a chaque
      // rendu par three, donc ces nombres sont ceux de l'image qui vient de
      // passer — pas un cumul.
      const h = horloge.current;
      const maintenant = performance.now();
      if (h.derniere) {
        const ecart = maintenant - h.derniere;
        h.images += 1;
        h.cumul += ecart;
        // Les dix premieres images sont ignorees : elles contiennent la
        // compilation des programmes, qui n'a lieu qu'une fois et fausserait le
        // pire cas pour toute la session.
        if (h.images > 10) h.pire = Math.max(h.pire, ecart);
      }
      h.derniere = maintenant;

      // UN SEUL RECENSEMENT, au bout de deux secondes — le temps que les modeles
      // arrivent. Le faire par image alourdirait la mesure de cadence qu'il
      // sert justement a etablir : parcourir cent vingt objets soixante fois par
      // seconde fausse le chiffre qu'on lit ensuite.
      if (!recense.current && piste.lisse >= 0 && h.images > 120) {
        let maillages = 0;
        const geos = new Set<unknown>();
        scene.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            maillages += 1;
            geos.add(m.geometry);
          }
        });
        recense.current = { maillages, geometriesDistinctes: geos.size };
      }

      (window as unknown as { __cout?: unknown }).__cout = {
        ...(recense.current ?? {}),
        dessins: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        programmes: gl.info.programs?.length ?? 0,
        geometries: gl.info.memory.geometries,
        textures: gl.info.memory.textures,
        imageMoyenne: h.images ? +(h.cumul / h.images).toFixed(1) : 0,
        pireImage: +h.pire.toFixed(1),
        rendu: (gl.getContext() as WebGLRenderingContext).getParameter(0x1f01),
      };
      (window as unknown as { __piste?: unknown }).__piste = {
        brut: +piste.brut.toFixed(3),
        lisse: +piste.lisse.toFixed(3),
        s: +s.toFixed(2),
        i,
        oeil: _oeil.toArray().map((n) => +n.toFixed(2)),
        cible: _cible.toArray().map((n) => +n.toFixed(2)),
      };
    }

    branche.current = true;

    // CE QU'ON PUBLIE A REACT, ET SEULEMENT QUAND ÇA CHANGE. Une station n'est
    // « ouverte » que si l'on s'y est vraiment arrete : au quart de trajet, on
    // n'est nulle part, et l'etiquette ne doit rien annoncer. Le magasin ne
    // notifie que sur changement reel, donc ces deux appels ne coutent rien
    // entre deux stations.
    const proche = Math.round(s);
    const pose = Math.abs(s - proche) < 0.22;
    const station = (pose ? STATIONS[proche]?.zone : null) ?? null;

    // ON NE PUBLIE QUE SUR CHANGEMENT, et la comparaison se fait AVANT l'appel.
    // `bureau.set` recevait un litteral neuf a chaque image — plus une diffusion
    // conditionnelle — et le magasin parcourait ensuite `Object.entries` pour
    // conclure que rien n'avait bouge. Trois allocations par image, pendant
    // toute la session, dans la seule boucle dont l'en-tete de ce fichier dit
    // qu'elle ne doit pas toucher React.
    if (station !== derniere.current) {
      derniere.current = station;
      bureau.set({ ouverte: station });
    }
    // En mouvement, le survol est perime : R3F ne relance un lancer de rayon que
    // sur evenement de pointeur, jamais parce que la camera a bouge.
    if (Math.abs(piste.brut - piste.lisse) > 0.0015 && bureau.get().survol !== null) {
      bureau.set({ survol: null });
    }
  });

  return null;
}

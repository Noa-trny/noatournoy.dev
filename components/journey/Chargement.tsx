"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/routes";
import { ui } from "@/content/ui";

// L'ecran de chargement de la visite.
//
// Il existe pour une raison mesurable : le modele pese 6,9 Mo et la carte
// d'environnement 315 Ko. Sans lui, le visiteur defile pendant que la villa
// arrive, et la scene se construit sous ses yeux — le sol d'abord, puis la
// maison qui apparait d'un coup, puis les textures. Il ne voit pas un
// chargement, il voit un site casse.
//
// DU DOM ET PAS `<Html>` NI `<Loader>` DE DREI. Les deux ecrivent des blocs
// `<style>`, que `style-src 'self'` interdit ; et surtout ils vivent dans le
// canvas, donc ils ne peuvent pas s'afficher AVANT que le canvas existe — ce
// qui est precisement le moment ou l'on a besoin d'eux. Un div ordinaire n'a
// aucun de ces deux problemes.

/** Au-dela, on renonce a attendre : mieux vaut une scene incomplete qu'un mur. */
const PATIENCE = 20000;

export function Chargement({ locale }: { locale: Locale }) {
  const { active, progress, errors } = useProgress();
  const [phase, setPhase] = useState<"attente" | "charge" | "fini">("attente");
  const vu = useRef(false);

  // La machine a trois etats, et le premier n'est pas superflu.
  //
  // `useProgress` demarre a 100 % et `active` a faux : rien n'a encore ete
  // demande. Se fier au seul pourcentage ferait donc disparaitre l'ecran a
  // l'instant meme ou il apparait, avant que le premier octet soit parti. On
  // attend d'avoir VU un chargement commencer.
  useEffect(() => {
    // « fini » est un ETAT PUITS : une fois qu'on en est sorti, on n'y revient
    // pas. Sans cette garde, le garde-fou de patience ne servait a rien —
    // il basculait bien l'ecran sur « fini », puis le premier evenement de
    // progression suivant le ramenait a « charge », indefiniment. Mesure :
    // l'ecran etait encore la a quarante-sept secondes, avec un garde-fou
    // regle a vingt.
    if (phase === "fini") return;
    if (active) {
      vu.current = true;
      setPhase("charge");
      return;
    }
    if (vu.current && progress >= 100) {
      // Une frame de repit : le decodage de la derniere texture et son transfert
      // vers le GPU se terminent apres que le gestionnaire s'est tu.
      const t = setTimeout(() => setPhase("fini"), 420);
      return () => clearTimeout(t);
    }
  }, [active, progress, phase]);

  // Le garde-fou. Un fichier qui ne repond jamais — reseau coupe en cours,
  // proxy d'entreprise, onglet en veille — laisserait sinon l'ecran a demeure.
  useEffect(() => {
    const t = setTimeout(() => setPhase("fini"), PATIENCE);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (errors.length) setPhase("fini");
  }, [errors]);

  // LE DEFILEMENT EST BLOQUE PENDANT LE CHARGEMENT, et c'est la moitie de
  // l'interet. Sans ça, quelqu'un qui defile pendant les six secondes de
  // telechargement se retrouve au milieu du voyage quand l'ecran se leve, ayant
  // manque l'arrivee — c'est-a-dire le seul plan qui explique ou l'on est.
  //
  // `scrollbar-gutter: stable` est pose en CSS sur `html` pour que l'ajout de
  // `overflow: hidden` ne decale pas la page de la largeur d'une barre.
  useEffect(() => {
    if (phase === "fini") return;
    const el = document.documentElement;
    const avant = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = avant;
      window.scrollTo(0, 0);
    };
  }, [phase]);

  if (phase === "fini") return null;

  const pct = Math.min(100, Math.round(progress));

  return (
    <div
      className="chargement"
      data-etat={phase}
      // `status` et non `alert` : c'est une information d'avancement, pas une
      // interruption. `polite` laisse le lecteur d'ecran finir sa phrase.
      role="status"
      aria-live="polite"
    >
      <div className="chargement-bloc">
        <p className="chargement-nom">
          Noa<span>Tournoy</span>
        </p>
        <div className="chargement-piste">
          <i style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <p className="chargement-etat">
          {ui.chargement[locale]}
          {" · "}
          <b>{pct} %</b>
        </p>
      </div>
    </div>
  );
}

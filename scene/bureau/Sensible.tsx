"use client";

import { useEffect } from "react";
import { bureau, useBureau } from "./etat";
import { oublieLaMain, veutLaMain } from "./curseur";
import type { IdZone } from "./zones";

// LA SURFACE SENSIBLE d'une zone.
//
// Une boite invisible posee sur l'objet, et c'est elle seule qui reçoit les
// evenements. Trois raisons, toutes mesurees sur le projet precedent :
//
// 1. R3F ne parcourt pas la scene a chaque evenement, il parcourt les objets
//    PORTEURS DE GESTIONNAIRES, recursivement. Poser un gestionnaire sur le
//    groupe d'un objet compose y ferait entrer tous ses enfants — vingt
//    maillages pour un carnet. Une boite unique en fait douze triangles.
// 2. La zone sensible peut etre plus GENEREUSE que l'objet : un carnet de deux
//    centimetres d'epaisseur est impossible a viser a la souris, alors qu'une
//    boite de quinze centimetres autour se vise sans y penser.
// 3. Elle rend le survol independant de la geometrie : retoucher la plante ne
//    casse pas sa zone.
//
// `visible={false}` plutot que transparente : un materiau transparent entre
// dans le tri des transparents et coute a chaque image, meme invisible.

export function Sensible({
  id,
  position,
  taille,
  rotation = [0, 0, 0],
}: {
  id: IdZone;
  position: [number, number, number];
  taille: [number, number, number];
  rotation?: [number, number, number];
}) {
  const ouverte = useBureau((e) => e.ouverte);
  const survol = useBureau((e) => e.survol);

  // Le curseur se declare sous une clef plutot que de s'ecrire directement :
  // la dalle des projets le veut aussi, et deux ecrivains sur une meme propriete
  // globale se raturent l'un l'autre. Voir curseur.ts.
  //
  // On passe par le survol GLOBAL et non par `onPointerOut` de la boite, parce
  // que celui-ci ne part pas toujours quand la camera emporte l'objet — la main
  // resterait alors sur toute la page.
  useEffect(() => {
    veutLaMain(`sensible-${id}`, survol === id);
    return () => oublieLaMain(`sensible-${id}`);
  }, [survol, id]);

  // LA BOITE S'EFFACE DEVANT SON PROPRE CONTENU, et c'est la seule condition.
  //
  // Elle enveloppe l'objet, donc elle est PLUS PRES de la camera que la dalle
  // qu'il porte : arrivee a la station, elle intercepterait chaque clic destine
  // a une ligne de projet, et les six liens seraient morts. Une fois sur place,
  // elle se retire — l'objet est deja atteint, elle n'a plus rien a offrir.
  //
  // Les AUTRES restent vives tout du long : le trajet est un defilement, pas un
  // couloir a sens unique, et l'on doit pouvoir sauter d'un objet a l'autre sans
  // repasser par le plan large.
  const actif = ouverte !== id;

  return (
    <mesh
      position={position}
      rotation={rotation}
      visible={false}
      onPointerOver={(e) => {
        if (!actif) return;
        e.stopPropagation();
        bureau.set({ survol: id });
      }}
      onPointerOut={() => bureau.set({ survol: null })}
      onClick={(e) => {
        if (!actif) return;
        e.stopPropagation();
        bureau.ouvrir(id);
      }}
    >
      <boxGeometry args={taille} />
    </mesh>
  );
}

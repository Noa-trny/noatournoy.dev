"use client";

import { useSyncExternalStore } from "react";
import type { IdZone } from "./zones";

// L'etat du bureau : quelle zone est survolee, laquelle est ouverte.
//
// `useSyncExternalStore` et non un contexte React : le survol change a chaque
// mouvement de souris, et faire remonter ça dans un contexte reafficherait tout
// l'arbre de la scene. Ici, seuls les composants qui LISENT la tranche
// concernee se rendent a nouveau — et le rendu de la scene, lui, ne passe
// jamais par React.
//
// Zero dependance : c'est la meme mecanique que le magasin du voyage precedent,
// qui a survecu a trois refontes. Une bibliotheque d'etat n'aurait rien apporte
// qu'un poids de plus.

type Etat = {
  readonly survol: IdZone | null;
  readonly ouverte: IdZone | null;
  /** Vrai pendant le vol de camera : on ignore les clics le temps du trajet. */
  readonly enVol: boolean;
};

let etat: Etat = { survol: null, ouverte: null, enVol: false };
const abonnes = new Set<() => void>();

function poser(suite: Partial<Etat>) {
  // On ne notifie que si quelque chose a REELLEMENT change. Sans cette garde,
  // un `pointermove` sur le meme objet declencherait un rendu par image.
  let change = false;
  for (const [k, v] of Object.entries(suite)) {
    if (etat[k as keyof Etat] !== v) {
      change = true;
      break;
    }
  }
  if (!change) return;
  etat = { ...etat, ...suite };
  abonnes.forEach((f) => f());
}

export const bureau = {
  get: () => etat,
  set: poser,
  ouvrir(id: IdZone) {
    poser({ ouverte: id, survol: null, enVol: true });
  },
  fermer() {
    poser({ ouverte: null, enVol: true });
  },
  volFini() {
    poser({ enVol: false });
  },
  subscribe(f: () => void) {
    abonnes.add(f);
    return () => abonnes.delete(f);
  },
};

/**
 * Lit une tranche de l'etat.
 *
 * Le troisieme argument est l'instantane SERVEUR : sans lui, le rendu serveur
 * lit `etat` du module, qui est partage entre requetes. Ici il rend toujours
 * l'etat neutre, ce qui garantit que le serveur et le premier rendu client
 * produisent le meme arbre.
 */
export function useBureau<T>(choix: (e: Etat) => T): T {
  return useSyncExternalStore(
    bureau.subscribe,
    () => choix(etat),
    () => choix({ survol: null, ouverte: null, enVol: false })
  );
}

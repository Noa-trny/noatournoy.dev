"use client";

import { useSyncExternalStore } from "react";
import { allerA, indexDe } from "./defilement";
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
  /**
   * La station ou l'on se trouve, ou `null` entre deux.
   *
   * ECRITE PAR LE RIG, jamais par un gestionnaire de clic : c'est une lecture de
   * la barre de defilement, pas une intention. Le drapeau `enVol` a disparu avec
   * la meme logique — il existait pour ignorer les clics pendant un vol de
   * camera, et il n'y a plus de vol : il y a un defilement, qu'on peut
   * interrompre a tout moment parce que c'est la main de l'utilisateur qui le
   * tient.
   */
  readonly ouverte: IdZone | null;
};

let etat: Etat = { survol: null, ouverte: null };
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
  // OUVRIR NE POSE PLUS D'ETAT : ça fait defiler. La camera a une seule source,
  // et c'est la barre — un clic sur un objet est donc un raccourci de
  // defilement, pas une seconde commande. `ouverte` redevient ce qu'il aurait
  // toujours du etre : la lecture de la station ou l'on se trouve, ecrite par
  // le rig, jamais par un gestionnaire de clic. Sans cette regle, cliquer puis
  // toucher la molette faisait revenir la camera sur ses pas.
  ouvrir(id: IdZone) {
    allerA(indexDe(id));
  },
  fermer() {
    // Vers le PLAN LARGE et non le couloir : celui-ci est une entree, pas un
    // point de retour. On ne ressort pas de chez soi pour changer de piece.
    allerA(indexDe(null));
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
    () => choix({ survol: null, ouverte: null })
  );
}

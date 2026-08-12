import { useSyncExternalStore } from "react";

// Les changements DISCRETS du voyage — ceux qui doivent réveiller React.
//
// Il y en a quatre ou cinq sur tout le film. Le reste passe par scrollState,
// qui ne déclenche aucun rendu.
//
// Pas de zustand ici, contrairement à Éclosion : `useSyncExternalStore` est
// dans React, fait exactement ce travail, et ce dépôt n'avait aucune dépendance
// avant cette semaine. Un abonnement pour quatre changements d'état ne justifie
// pas un paquet de plus.

/**
 * Les trois temps du voyage.
 *
 * La derniere s'appelait « garage », d'apres un plan ou la camera finissait sa
 * course devant la voiture. La villa a decide autrement : son garage est au
 * pied de la colline, donc du cote de l'arrivee, et le trajet le depasse dans
 * les premieres secondes. Le nom mentait donc sur ce qu'il designe — le moment
 * ou l'on est DEDANS.
 */
export type Phase = "approche" | "transit" | "dedans";

/**
 * L'etat du contexte de rendu.
 *
 * Il vit ici parce que celui qui SAIT n'est pas celui qui DECIDE : la scene
 * possede le contexte, le conteneur possede le repli. Faire remonter
 * l'information par le magasin evite au conteneur d'espionner des evenements
 * dont il ne peut pas dire de quel canvas ils viennent — ce qui etait
 * precisement le defaut.
 */
export type Contexte = "vivant" | "perdu";
export type CarState = "idle" | "prefetch" | "mount" | "ready";
export type Tier = "haut" | "bas";

type State = {
  readonly phase: Phase;
  readonly contexte: Contexte;
  readonly carState: CarState;
  readonly tier: Tier;
  /** Le travail survolé ou focalisé, s'il y en a un. */
  readonly activeId: string | null;
};

let state: State = {
  phase: "approche",
  contexte: "vivant",
  carState: "idle",
  tier: "haut",
  activeId: null,
};

const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  let change = false;
  for (const k of Object.keys(patch) as (keyof State)[]) {
    if (patch[k] !== undefined && patch[k] !== state[k]) change = true;
  }
  // Sans ce garde, une phase réécrite à l'identique à chaque frontière
  // provoquerait un rendu pour rien.
  if (!change) return;
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const journey = {
  get: () => state,
  set,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  reset() {
    state = { phase: "approche",
      contexte: "vivant", carState: "idle", tier: "haut", activeId: null };
    listeners.forEach((l) => l());
  },
};

/**
 * Lit une tranche de l'état.
 *
 * Le troisième argument de `useSyncExternalStore` est l'instantané SERVEUR : il
 * garantit que le premier rendu client est identique au rendu serveur, donc
 * aucune erreur d'hydratation.
 */
export function useJourney<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    journey.subscribe,
    () => select(state),
    () => select(state)
  );
}

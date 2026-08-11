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

export type Phase = "approche" | "transit" | "garage";
export type CarState = "idle" | "prefetch" | "mount" | "ready";
export type Tier = "haut" | "bas";

type State = {
  readonly phase: Phase;
  readonly carState: CarState;
  readonly tier: Tier;
  /** Le travail survolé ou focalisé, s'il y en a un. */
  readonly activeId: string | null;
};

let state: State = {
  phase: "approche",
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
    state = { phase: "approche", carState: "idle", tier: "haut", activeId: null };
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

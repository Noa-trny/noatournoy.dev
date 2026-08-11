// Le portier de la scène 3D.
//
// La décision porteuse de tout le repli : le rendu serveur produit la version
// SANS canvas, et la 3D n'est qu'une amélioration appliquée après hydratation.
// Un seul chemin de code couvre donc sans-JS, sans-WebGL, mouvement réduit,
// machine lente et robot d'indexation — correct par défaut plutôt que parce
// qu'on a pensé à cinq cas.
//
// Conséquence directe : cette fonction ne doit JAMAIS être appelée pendant le
// rendu. Uniquement dans un effet, après que React a fini d'hydrater.

/**
 * Un contexte WebGL2 est-il disponible ?
 *
 * Le contexte de sonde est libéré immédiatement : les navigateurs plafonnent le
 * nombre de contextes vivants (autour de 16), et une sonde qui fuit finit par
 * empêcher la vraie scène de s'ouvrir.
 */
function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

type NavigatorPlus = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

/** La raison du refus, pour pouvoir la journaliser en développement. */
export type Refus =
  | "serveur"
  | "mouvement-reduit"
  | "economie-de-donnees"
  | "reseau-lent"
  | "peu-de-coeurs"
  | "peu-de-memoire"
  | "webgl2-absent";

export function refusDe3D(): Refus | null {
  if (typeof window === "undefined") return "serveur";

  // Une caméra qui vole au défilement est précisément ce que cette préférence
  // demande d'éviter. Ce n'est pas une dégradation, c'est la réponse juste.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "mouvement-reduit";
  }

  const nav = navigator as NavigatorPlus;
  if (nav.connection?.saveData) return "economie-de-donnees";
  if (/(^|-)2g/.test(nav.connection?.effectiveType ?? "")) return "reseau-lent";
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) {
    return "peu-de-coeurs";
  }
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) {
    return "peu-de-memoire";
  }
  if (!hasWebGL2()) return "webgl2-absent";

  return null;
}

export const canRun3D = (): boolean => refusDe3D() === null;

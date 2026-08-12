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
let sondeWebGL: boolean | null = null;
let sondeLogiciel: boolean | null = null;

/**
 * Le rendu est-il LOGICIEL ?
 *
 * Question decisive, et qui ne se devine pas : `getContext('webgl2')` reussit
 * aussi bien sur une vraie carte que sur l'emulation logicielle de Chrome, et
 * rien dans l'API standard ne les distingue. Il faut l'extension
 * `WEBGL_debug_renderer_info`, qui rend la chaine du pilote.
 *
 * Pourquoi ça compte ici : mesure au harnais, cette scene perd son contexte au
 * bout d'une quinzaine de secondes en rendu logiciel, sur une page immobile. Le
 * visiteur voit alors la maison, puis un ecran noir, puis le site sans 3D — la
 * pire des trois issues possibles, parce qu'elle promet puis retire.
 *
 * Chrome bascule en logiciel tout seul quand son processus graphique a plante
 * plusieurs fois, et l'utilisateur n'en sait rien. Autant refuser d'emblee et
 * servir le site complet, qui lui fonctionne partout.
 */
function rendLogiciel(gl: WebGL2RenderingContext): boolean {
  if (sondeLogiciel !== null) return sondeLogiciel;
  try {
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const nom = ext
      ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? "")
      : String(gl.getParameter(gl.RENDERER) ?? "");
    if (process.env.NODE_ENV !== "production" || typeof window !== "undefined") {
      console.info(`[voyage] rendu par : ${nom || "(inconnu)"}`);
    }
    sondeLogiciel = /swiftshader|software|llvmpipe|basic render|microsoft basic/i.test(nom);
    return sondeLogiciel;
  } catch {
    sondeLogiciel = false;
    return false;
  }
}

function hasWebGL2(): boolean {
  // MEMORISE pour toute la duree de la page.
  //
  // Chaque appel ouvrait un contexte, et un navigateur en plafonne le nombre
  // vivant — autour de seize. Une sonde par montage, plus les remontages du
  // rechargement a chaud et des navigations, finissait par saturer : la garde
  // repondait alors « pas de WebGL » sur une machine qui en a, et la scene
  // disparaissait sans raison visible.
  //
  // La capacite WebGL d'un onglet ne change pas en cours de route : la mesurer
  // une fois suffit.
  if (sondeWebGL !== null) return sondeWebGL;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      sondeWebGL = false;
      return false;
    }
    // On profite du contexte de sonde, deja ouvert, pour lire le pilote.
    logicielVu = rendLogiciel(gl);
    // On libere immediatement : le contexte de sonde ne doit pas compter dans
    // le budget de celui dont la scene aura besoin.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    sondeWebGL = true;
    return true;
  } catch {
    sondeWebGL = false;
    return false;
  }
}

let logicielVu = false;

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
  | "webgl2-absent"
  | "rendu-logiciel";

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
  // Apres `hasWebGL2`, qui renseigne le drapeau au passage.
  //
  // `?force3d` passe outre. C'est la seule maniere de MESURER la scene : le
  // harnais de capture tourne en SwiftShader — un navigateur sans interface n'a
  // pas de carte graphique a sa disposition — et se verrait donc refuser la 3D
  // qu'il est charge de photographier. L'echappatoire ne concerne que celui qui
  // l'ecrit dans l'adresse, et elle n'allege rien : elle laisse simplement
  // entrer, avec les consequences.
  const force =
    typeof location !== "undefined" && /(^|[?&])force3d(=|&|$)/.test(location.search);
  if (logicielVu && !force) return "rendu-logiciel";

  return null;
}

export const canRun3D = (): boolean => refusDe3D() === null;

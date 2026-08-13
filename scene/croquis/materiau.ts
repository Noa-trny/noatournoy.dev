import * as THREE from "three";

// LE RENDU DESSINE.
//
// Ce fichier est ce qui separe « stylise » de « low-poly par defaut ». Trois
// effets, tous dans le shader, aucun en post-traitement.
//
// POURQUOI PAS DE POST-TRAITEMENT. Un `EffectComposer` tirerait quarante
// kilooctets, mais surtout il invaliderait toute strategie de prechauffage des
// shaders — c'est exactement le piege de cle de cache qui a coute 617 ms de
// pire image sur Eclosion. Le contour se fait donc par coque inversee, un
// appel de dessin par objet, et le grain se fait dans le fragment.
//
// POURQUOI `onBeforeCompile` PLUTOT QU'UN `ShaderMaterial`. Recrire le shader
// entier ferait perdre l'eclairage, les ombres et le brouillard de three, qu'il
// faudrait reimplementer — et mal. On greffe donc sur le materiau standard :
// on garde tout, on n'ajoute que ce qui manque.
//
// ATTENTION AU CACHE DE PROGRAMMES : three regroupe les materiaux par
// `customProgramCacheKey`. Sans clef distincte, deux materiaux greffes
// differemment partageraient un programme compile et l'un des deux rendrait
// faux. Avec une clef trop fine, on recompile pour rien.

export type ReglagesCroquis = {
  /** Couleur de base. */
  couleur: THREE.ColorRepresentation;
  /** Nombre de paliers d'eclairage. Trois lit « bande dessinee », six « doux ». */
  paliers?: number;
  /** Force du grain de papier, en fraction de la luminosite. */
  grain?: number;
  /** Rugosite standard : le grain ne remplace pas la matiere. */
  rugosite?: number;
  /** Luminosite minimale des zones a l'ombre, en fraction. */
  plancher?: number;
};

/**
 * Le fragment injecte apres le calcul d'eclairage.
 *
 * `gl_FragColor` n'existe plus dans three moderne : la sortie s'appelle
 * `gl_FragColor` dans les anciens chunks mais `outgoingLight` est la variable
 * a modifier avant l'assemblage final. On se greffe donc sur
 * `#include <dithering_fragment>`, le dernier maillon de la chaine.
 */
const APRES_ECLAIRAGE = /* glsl */ `
  #include <dithering_fragment>

  // --- Paliers -----------------------------------------------------------
  //
  // On quantifie la LUMINOSITE et non chaque canal : quantifier les canaux
  // separement fait deriver la teinte vers les couleurs primaires, et un
  // beton vire au rose.
  float lum = dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  float pas = max(lum, 1e-4);
  float quant = floor(lum * uPaliers + 0.5) / uPaliers;
  // PLANCHER SUR LE PALIER LE PLUS BAS. Sans lui, la troncature envoie a zero
  // tout ce qui recoit moins d'un palier : les ombres portees tombent au
  // noir absolu et la scene se lit comme un decoupage de papier noir. Un dessin
  // garde de la matiere dans ses ombres — c'est meme la que le trait se voit.
  quant = max(quant, uPlancher);

  // MAIS LE FACTEUR EST BORNE, et c'est ce qui manquait.
  //
  // Relever un pixel jusqu'au plancher revient a MULTIPLIER ses trois canaux.
  // Un pixel a l'ombre valant deux centiemes de luminosite se voyait donc
  // multiplier par seize : le canal le plus fort saturait, les deux autres non,
  // et la teinte partait avec. Tout ce que la lampe n'atteignait pas prenait la
  // couleur du remplissage froid, en neon — un boitier gris anthracite rendait
  // bleu electrique. Le defaut ne se voyait que de pres, donc il est reste
  // invisible tant que la scene etait un plan large ; le defilement, qui
  // amene a chaque station un gros plan, l'a mis au premier plan.
  //
  // Trois, parce que c'est le facteur au-dela duquel la derive de teinte
  // devient lisible : les demi-tons, qui passent sous cette borne, gardent
  // exactement le rendu d'avant.
  gl_FragColor.rgb *= min(quant / pas, 3.0);

  // --- Grain de papier ---------------------------------------------------
  //
  // En espace ECRAN et non en espace objet : un grain colle a la surface
  // ressemble a une texture sale, alors qu'un grain fixe par rapport a l'oeil
  // ressemble au papier sur lequel on dessine. C'est ce qui fait la difference
  // entre « texture de bruit » et « croquis ».
  vec2 g = gl_FragCoord.xy;
  float bruit = fract(sin(dot(g, vec2(12.9898, 78.233))) * 43758.5453);
  float hachure = fract(sin(dot(floor(g / 3.0), vec2(4.898, 7.23))) * 23421.631);
  gl_FragColor.rgb *= 1.0 - uGrain * (0.6 * bruit + 0.4 * hachure);
`;

/**
 * Materiau dessine.
 *
 * Chaque appel cree une INSTANCE. Les partager entre objets de meme couleur
 * est non seulement possible mais souhaitable : three compile un programme par
 * combinaison de definitions, pas par instance, mais il change d'etat entre
 * deux materiaux differents.
 */
export function materiauCroquis(r: ReglagesCroquis): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({
    color: r.couleur,
    roughness: r.rugosite ?? 0.95,
    metalness: 0,
  });

  const paliers = r.paliers ?? 4;
  const grain = r.grain ?? 0.16;
  const plancher = r.plancher ?? 0.3;

  m.onBeforeCompile = (shader) => {
    shader.uniforms.uPaliers = { value: paliers };
    shader.uniforms.uGrain = { value: grain };
    shader.uniforms.uPlancher = { value: plancher };
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "void main() {",
        [
          "uniform float uPaliers;",
          "uniform float uGrain;",
          "uniform float uPlancher;",
          "void main() {",
        ].join("\n")
      )
      .replace("#include <dithering_fragment>", APRES_ECLAIRAGE);
  };

  // La clef porte les DEUX reglages qui changent le code compile. Sans elle,
  // deux materiaux aux paliers differents se partageraient un programme et le
  // second rendrait avec les valeurs du premier.
  m.customProgramCacheKey = () => `croquis-${paliers}-${grain.toFixed(3)}-${plancher.toFixed(3)}`;

  return m;
}

/**
 * Le materiau de contour, pour la coque inversee.
 *
 * Le trait s'obtient en redessinant l'objet un peu plus gros, en noir, faces
 * ARRIERE seulement : ne restent visibles que les bords, la ou la coque
 * depasse de la silhouette. Un appel de dessin, aucune passe d'ecran.
 *
 * `depthWrite: false` : la coque ne doit pas masquer ce qu'elle entoure quand
 * deux objets se chevauchent.
 */
export function materiauContour(
  epaisseur = 0.0035,
  couleur: THREE.ColorRepresentation = "#0b0d12"
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uEpaisseur: { value: epaisseur },
      uCouleur: { value: new THREE.Color(couleur) },
    },
    vertexShader: /* glsl */ `
      uniform float uEpaisseur;
      void main() {
        // Le gonflement se fait le long de la NORMALE, en espace vue, et
        // proportionnellement a la profondeur : sans cette correction, le trait
        // s'epaissit quand on s'approche et disparait de loin.
        vec4 vue = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normal);
        // L'epaisseur suit la profondeur pour rester constante a l'ecran.
        // Le coefficient est petit : a 0,012 le trait des objets lointains
        // devenait une masse noire qui mangeait la silhouette.
        vue.xyz += n * uEpaisseur * max(-vue.z, 1.0);
        gl_Position = projectionMatrix * vue;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uCouleur;
      void main() { gl_FragColor = vec4(uCouleur, 1.0); }
    `,
  });
}

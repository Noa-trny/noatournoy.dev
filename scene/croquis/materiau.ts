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

  // UNE CLEF CONSTANTE, ET C'EST TOUT CE QU'IL FAUT.
  //
  // Elle valait `croquis-${paliers}-${grain}-${plancher}`, c'est-a-dire qu'elle
  // pliait trois UNIFORMES dans la clef d'un programme. Or le GLSL injecte est
  // identique au caractere pres pour tous les materiaux croquis : ces trois
  // valeurs ne changent pas une ligne de code, elles changent une donnee que le
  // shader lit a l'execution.
  //
  // three alloue un `WebGLProgram` par clef distincte. Les huit entrees de la
  // palette, les quatre matieres du couloir, le sol, le mur et la terre de la
  // plante donnaient une quinzaine de triplets differents, donc une quinzaine
  // de compilations et d'editions de liens a la premiere image — sur une scene
  // dont tout l'objet est de tourner sur une carte integree.
  //
  // Le commentaire en tete de ce fichier prevenait des DEUX erreurs possibles :
  // une clef trop large fait partager un programme a deux materiaux differents,
  // une clef trop fine recompile pour rien. C'etait la seconde.
  m.customProgramCacheKey = () => "croquis";

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
 *
 * LA COQUE NE SE GONFLE PAS LE LONG DE LA NORMALE, ET C'EST TOUT L'ENJEU.
 *
 * Elle l'a fait, et ça se voyait sur les ecrans : bord droit epaissi en coin,
 * bande noire sous la dalle, encoches aux quatre angles. La cause est dans la
 * geometrie d'une boite. Ses normales sont DURES — les huit sommets existent en
 * trois exemplaires, un par face, portant trois normales differentes. Gonfler
 * chacun le long de la sienne fait partir les trois copies dans trois
 * directions : la coque se DECHIRE le long de chaque arete, et les fentes
 * ouvertes se lisent comme un trait sale, d'autant plus large que l'objet est
 * plat. Sur un cadre d'ecran de vingt-huit millimetres, la dechirure faisait la
 * largeur du bord lui-meme.
 *
 * On gonfle donc le long de la NORMALE MOYENNEE — celle qu'on obtiendrait en
 * fusionnant les sommets, sans dupliquer une seule geometrie, ce que le detour
 * par une reference partagee dans `Forme` cherche justement a eviter. Elle ne
 * depend que de la POSITION du sommet : trois copies au meme endroit partent au
 * meme endroit, la coque reste close, et le trait garde une epaisseur egale.
 *
 * SUR UNE BOITE ALIGNEE, ELLE SE CALCULE EXACTEMENT, et c'est ce qui rend
 * l'affaire gratuite : `normalize(sign(position - centre))`. Un coin appartient
 * a trois faces de normales ±x, ±y, ±z, dont la moyenne vaut (±1, ±1, ±1)/√3 ;
 * un sommet de milieu d'arete a deux faces, un sommet de milieu de face une
 * seule — et la fonction signe donne les trois cas sans les distinguer.
 *
 * CE N'EST SURTOUT PAS LE RAYON DEPUIS LE CENTRE, qui a ete essaye et qui est
 * FAUX des que la boite n'est pas un cube. Ce rayon est proportionnel aux
 * DIMENSIONS : au coin d'un clavier de trente sur un virgule six, il est
 * presque horizontal. La coque ne montait alors plus du tout, elle s'etalait en
 * JUPE autour de l'objet, a sa propre hauteur — et cette jupe se projetait en
 * un gros bandeau noir sous chaque objet plat, carnet, clavier, machine et
 * socles d'ecran. La normale moyennee, elle, vaut autant dans les trois axes
 * quelle que soit la forme de la boite.
 *
 * LA NORMALE RESTE LA DIRECTION DE TOUT LE RESTE, et ce n'est pas un repli par
 * defaut : un plan est coplanaire, donc le rayon depuis son centre ne gonfle
 * rien ; un cylindre, une sphere, un modele importe ont des normales lisses,
 * donc leur coque ne se dechire pas ; et une courbe — un tube de cable — a beau
 * avoir du volume, son centre de boite englobante n'est pas « dedans », si bien
 * que le rayon y donnerait un trait d'epaisseur inegale. C'est `Forme` qui
 * tranche, et il ne dit oui qu'aux boites.
 */
/**
 * L'ABATTEMENT GLOBAL SUR LE TRAIT, et pourquoi il vaut mieux qu'un passage en
 * revue des trente-six appels.
 *
 * Chaque objet declare son epaisseur, et ces valeurs ne sont pas arbitraires :
 * elles disent le RAPPORT entre les traits — un cable est plus fin qu'un cadre
 * d'ecran, qui est plus fin qu'un plateau. Ce rapport est juste. C'est
 * l'echelle d'ensemble qui ne l'etait pas : a un, le trait faisait cinq pixels
 * sur une fenetre de huit cent soixante, ce qui est une grosse mine sur un
 * dessin de cette finesse. Un coefficient unique les baisse tous d'un cran sans
 * toucher a leurs proportions — et c'est le seul nombre a bouger le jour ou il
 * faudra en rediscuter.
 *
 * Il ne s'applique PAS a la decision « trait ou pas » : `trait={0}` reste zero,
 * `Forme` ne construisant meme pas de coque dans ce cas.
 */
const FINESSE = 0.6;

export function materiauContour(
  epaisseur = 0.0035,
  couleur: THREE.ColorRepresentation = "#0b0d12"
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uEpaisseur: { value: epaisseur * FINESSE },
      uCouleur: { value: new THREE.Color(couleur) },
      /** Le centre de la boite englobante, en espace objet. */
      uCentre: { value: new THREE.Vector3() },
      /** 1 si la geometrie est une boite, 0 pour le repli sur la normale. */
      uBoite: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform float uEpaisseur;
      uniform vec3 uCentre;
      uniform float uBoite;
      void main() {
        vec4 vue = modelViewMatrix * vec4(position, 1.0);

        // La direction du gonflement : la normale moyennee si la forme est une
        // boite, sinon la normale de face. Le test protege le sommet qui
        // tomberait pile sur le centre, ou la fonction signe rend un vecteur
        // nul — une subdivision impaire en produit un.
        vec3 quadrant = sign(position - uCentre);
        vec3 sortant = (uBoite > 0.5 && dot(quadrant, quadrant) > 0.5)
          ? normalize(quadrant)
          : normal;

        vec3 n = normalize(normalMatrix * sortant);
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

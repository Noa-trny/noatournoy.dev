import * as THREE from "three";

// Du texte grave dans la scene, et non pose devant elle.
//
// Rendu en CanvasTexture plutot qu'avec `<Text>` de drei, pour trois raisons :
//
// 1. troika, que drei utilise, ouvre un worker depuis une URL blob: — ce qui
//    imposerait `worker-src blob:` dans la CSP. Le canevas 2D n'ajoute aucune
//    surface.
// 2. On dispose deja de Roboto Flex avec ses axes variables : la typographie du
//    site se retrouve telle quelle dans le monde.
// 3. C'est la meme mecanique que les panneaux des vitrines, donc un seul
//    comportement a comprendre et a maintenir.

export type Ligne = {
  readonly texte: string;
  /** En pixels de canevas ; 1024 px de large valent environ 3 m de mur. */
  readonly taille: number;
  readonly graisse?: number;
  /** Chasse de la police variable — 74 pour le titrage serre du site. */
  readonly chasse?: number;
  readonly couleur?: string;
  readonly capitales?: boolean;
  readonly interlettrage?: number;
  /** Espace avant la ligne, en pixels. */
  readonly avant?: number;
};

const police = (l: Ligne) =>
  `${l.graisse ?? 700} ${l.taille}px "Roboto Flex", system-ui, sans-serif`;

/** Decoupe une ligne trop longue en respectant les mots. */
function plier(
  g: CanvasRenderingContext2D,
  texte: string,
  largeurMax: number
): string[] {
  const mots = texte.split(/\s+/);
  const out: string[] = [];
  let courante = "";
  for (const mot of mots) {
    const essai = courante ? `${courante} ${mot}` : mot;
    if (g.measureText(essai).width > largeurMax && courante) {
      out.push(courante);
      courante = mot;
    } else {
      courante = essai;
    }
  }
  if (courante) out.push(courante);
  return out;
}

export type Bloc = {
  readonly lignes: readonly Ligne[];
  readonly largeur: number;
  readonly hauteur: number;
  /** Transparent par defaut : le texte s'inscrit sur la matiere qui est dessous. */
  readonly fond?: string;
  readonly marge?: number;
  readonly aligne?: "left" | "center";
};

/**
 * Dessine un bloc de texte et renvoie sa texture.
 *
 * Le canevas est transparent par defaut : combine a `alphaTest`, le texte
 * apparait pose sur le beton sans rectangle autour de lui.
 */
export function texteTexture(bloc: Bloc): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = bloc.largeur;
  c.height = bloc.hauteur;
  const g = c.getContext("2d")!;

  if (bloc.fond) {
    g.fillStyle = bloc.fond;
    g.fillRect(0, 0, c.width, c.height);
  }

  const marge = bloc.marge ?? 48;
  const aligne = bloc.aligne ?? "left";
  const largeurUtile = c.width - marge * 2;
  g.textAlign = aligne;
  g.textBaseline = "alphabetic";
  const x = aligne === "center" ? c.width / 2 : marge;

  let y = marge;
  for (const l of bloc.lignes) {
    g.font = police(l);
    if ("letterSpacing" in g) {
      (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
        `${l.interlettrage ?? 0}px`;
    }
    // `fontVariationSettings` n'existe pas sur le contexte 2D : la chasse
    // serree du titrage se rend en choisissant la graisse, pas l'axe wdth.
    g.fillStyle = l.couleur ?? "#f4f5f2";
    const texte = l.capitales ? l.texte.toUpperCase() : l.texte;
    y += l.avant ?? 0;
    for (const morceau of plier(g, texte, largeurUtile)) {
      y += l.taille;
      g.fillText(morceau, x, y);
      y += l.taille * 0.18;
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

import * as THREE from "three";
import type { Locale } from "@/content/routes";
import type { Project } from "@/content/projects";

// Le panneau des travaux SANS capture publique.
//
// Trois des six n'ont aucun visuel : DataSentinel est confidentiel, SupKonQuest
// vit dans des depots prives, Gamedex n'a jamais eu de capture. Le site a deja
// une reponse a ça — la vignette `.peek .none` de spec.css : le titre en gros,
// puis la raison en petites capitales espacees sur fond de panneau.
//
// On la rejoue ici en CanvasTexture. Le resultat lit comme la meme decision de
// design assumee que le site prend deja, et non comme une image cassee.

const LARGEUR = 1024;
const HAUTEUR = 576; // 16/9, le rapport de .peek

/** Les couleurs viennent des jetons de spec.css, pas d'un choix nouveau. */
const PANEL = "#101013";
const FG = "#e7e9e7";
const DIM = "#949a97";

export function textureSansImage(
  projet: Project,
  locale: Locale
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = LARGEUR;
  c.height = HAUTEUR;
  const g = c.getContext("2d")!;

  g.fillStyle = PANEL;
  g.fillRect(0, 0, LARGEUR, HAUTEUR);

  // Un filet vert acide en pied : la meme signature que les etiquettes du site.
  g.fillStyle = "#c2f53f";
  g.fillRect(0, HAUTEUR - 6, LARGEUR, 6);

  g.textAlign = "center";
  g.fillStyle = FG;
  g.font = '800 92px "Roboto Flex", system-ui, sans-serif';
  g.fillText(projet.title, LARGEUR / 2, HAUTEUR / 2 - 6);

  g.fillStyle = DIM;
  g.font = '400 27px "Roboto Flex", system-ui, sans-serif';
  // `letterSpacing` du contexte 2D : Chrome 99+, Safari 17.4+. Ailleurs il est
  // ignore et le texte s'affiche sans interlettrage — degradation acceptable.
  if ("letterSpacing" in g) {
    (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      "4.5px";
  }
  const raison =
    projet.peek.kind === "none" ? projet.peek.label[locale].toUpperCase() : "";
  g.fillText(raison, LARGEUR / 2, HAUTEUR / 2 + 54);

  const tex = new THREE.CanvasTexture(c);
  // Sans cette ligne le panneau part delave : three.js suppose l'espace
  // lineaire pour une CanvasTexture.
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Attend que la police variable soit disponible.
 *
 * Dessiner avant que `Roboto Flex` ne soit chargee cuirait la police de repli
 * dans la texture — et une CanvasTexture ne se redessine pas toute seule.
 */
export function policePrete(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
  // Avec un delai de garde : si `fonts.ready` ne se resout jamais — ce qui
  // arrive sous certains navigateurs sans interface — on dessine quand meme.
  // Un panneau avec la mauvaise police vaut mieux qu'un panneau noir.
  return Promise.race([
    document.fonts.ready.then(() => undefined),
    new Promise<void>((r) => setTimeout(r, 2500)),
  ]);
}

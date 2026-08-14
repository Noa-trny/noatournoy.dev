import * as THREE from "three";
import type { Locale } from "@/content/routes";
import { PROJECTS } from "@/content/projects";
import { home } from "@/content/home";

// LE CONTENU PEINT SUR LES OBJETS.
//
// Jusqu'ici les objets ANNONCAIENT une section : on cliquait un ecran eteint et
// un panneau s'ouvrait a cote. C'est un bouton deguise en 3D — exactement ce
// qu'on reprochait a la villa, ou les projets etaient des panneaux plantes dans
// un jardin. Ici les surfaces portent le texte : l'ecran affiche les projets, le
// carnet montre la frise, la machine liste la stack. On les LIT dans le monde,
// et le panneau ne sert plus qu'a lire confortablement.
//
// DU CANEVAS 2D, PAS LE `<Text>` DE DREI. Celui-ci passe par troika, qui ouvre
// un worker depuis une URL `blob:` — il faudrait donc elargir la CSP de
// `worker-src blob:`. Un canevas n'ajoute aucune surface d'attaque, et il donne
// en prime la mise en page : troika sait poser une ligne, pas une liste avec
// des pastilles.

/**
 * La police du site, une fois disponible.
 *
 * `document.fonts.ready` ne suffit pas : il se resout des que le chargement est
 * TERMINE, y compris quand rien n'a ete demande. On force donc un chargement de
 * la fonte a la taille utilisee, sans quoi le canevas peint en repli et l'on
 * obtient un texte a la mauvaise chasse — invisible tant qu'on ne compare pas.
 */
export async function policePrete(): Promise<void> {
  if (typeof document === "undefined") return;
  try {
    await document.fonts.load('600 32px "Inter"');
    await document.fonts.load('400 24px "Inter"');
    await document.fonts.ready;
  } catch {
    /* Sans l'API des fontes, le repli fera l'affaire. */
  }
}

type Contexte = CanvasRenderingContext2D;

const JETONS = {
  fond: "#0d1015",
  fondCarte: "#161a21",
  ligne: "#242a34",
  encre: "#e9ecf1",
  mid: "#a2abb8",
  dim: "#6b7480",
  accent: "#3b82f6",
} as const;

/**
 * LA GEOMETRIE DES LIGNES, partagee entre le peintre et le test de clic.
 *
 * C'est la seule maniere honnete de rendre une surface peinte cliquable : le
 * dessin et la zone sensible doivent lire les MEMES nombres. Les separer, c'est
 * garantir qu'un jour la ligne cliquee ne sera plus celle qu'on voit — un
 * decalage d'un pixel que personne ne remarque avant d'ouvrir le mauvais
 * projet.
 */
export const LIGNES_PROJETS = { haut: 68, hauteur: 78, pas: 86, reference: [1024, 600] as const };
export const LIGNES_CONTACT = { haut: 216, hauteur: 48, pas: 60, reference: [760, 460] as const };

let REFERENCE: [number, number] = [1024, 600];

function toile(l: number, h: number): [HTMLCanvasElement, Contexte] {
  const c = document.createElement("canvas");
  c.width = l;
  c.height = h;
  const g = c.getContext("2d")!;
  // LA MISE A L'ECHELLE EST FAITE PAR LE CONTEXTE, pas par les coordonnees.
  //
  // Les toiles etaient dessinees pour une resolution de reference et pesaient
  // ensemble 2,6 millions de pixels — assez pour faire perdre son contexte au
  // rendu logiciel. Les reduire imposait de reecrire chaque coordonnee ; un
  // `scale` sur le contexte le fait pour tout le dessin, d'un coup, et laisse
  // le code de peinture lisible dans son repere d'origine.
  g.scale(l / REFERENCE[0], h / REFERENCE[1]);
  return [c, g];
}

function texture(c: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  // Sans espace colorimetrique explicite, les couleurs partent delavees : la
  // toile est en sRGB, three suppose du lineaire.
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

/** Coupe un texte a la largeur donnee, en respectant les mots. */
function plier(g: Contexte, texte: string, largeur: number, max: number): string[] {
  const out: string[] = [];
  let ligne = "";
  for (const mot of texte.split(/\s+/)) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (g.measureText(essai).width > largeur && ligne) {
      out.push(ligne);
      if (out.length >= max) return out;
      ligne = mot;
    } else {
      ligne = essai;
    }
  }
  if (ligne && out.length < max) out.push(ligne);
  return out;
}

function pastille(g: Contexte, x: number, y: number, texte: string): number {
  g.font = '500 17px "Inter", sans-serif';
  const l = g.measureText(texte).width + 20;
  g.strokeStyle = JETONS.ligne;
  g.lineWidth = 1.5;
  g.beginPath();
  g.roundRect(x, y, l, 28, 6);
  g.stroke();
  g.fillStyle = JETONS.dim;
  g.fillText(texte, x + 10, y + 19);
  return l + 8;
}

/** Le titre de la fenetre de l'ecran principal. */
const ENTETE = { fr: "travaux · 6 projets", en: "work · 6 projects" } as const;

/** La police de cette barre de titre, ecrite une fois pour les deux usages. */
const POLICE_ENTETE = '500 17px "Inter", sans-serif';

/**
 * OU FINIT LE TITRE, en pixels du repere de l'ecran principal.
 *
 * C'est la que se pose le curseur qui clignote — un objet de la scene, pas un
 * pixel de la toile, puisqu'il doit s'allumer et s'eteindre sans qu'on
 * repeigne une image de mille pixels soixante fois par seconde.
 *
 * IL FAUT DONC MESURER LE TEXTE ICI, et non deviner sa longueur : elle n'est
 * pas la meme en français et en anglais, et elle change encore quand Inter
 * remplace la police de secours. Mesurer avec la MEME chaine et la MEME police
 * que le peintre est la seule façon que le curseur tombe au bout du mot dans
 * les deux langues.
 */
export function finEntete(locale: Locale): readonly [number, number] {
  const g = document.createElement("canvas").getContext("2d")!;
  g.font = POLICE_ENTETE;
  return [100 + g.measureText(ENTETE[locale]).width + 9, 28];
}

/** L'ecran principal : la liste des projets, comme une fenetre ouverte. */
export function peindreProjets(locale: Locale): THREE.CanvasTexture {
  REFERENCE = [1024, 600];
  const [c, g] = toile(768, 450);
  g.fillStyle = JETONS.fond;
  g.fillRect(0, 0, 1024, 600);

  // La barre de fenetre : trois pastilles suffisent a dire « application ».
  g.fillStyle = "#11151b";
  g.fillRect(0, 0, 1024, 44);
  ["#f0704a", "#f0b429", "#4ec07a"].forEach((col, i) => {
    g.fillStyle = col;
    g.beginPath();
    g.arc(26 + i * 22, 22, 6, 0, Math.PI * 2);
    g.fill();
  });
  g.fillStyle = JETONS.dim;
  g.font = POLICE_ENTETE;
  g.fillText(ENTETE[locale], 100, 28);

  let y = LIGNES_PROJETS.haut;
  for (const p of PROJECTS) {
    g.fillStyle = JETONS.fondCarte;
    g.beginPath();
    g.roundRect(24, y, 976, 78, 10);
    g.fill();

    g.fillStyle = JETONS.encre;
    g.font = '600 25px "Inter", sans-serif';
    g.fillText(p.title, 44, y + 32);

    g.fillStyle = JETONS.dim;
    g.font = '400 19px "Inter", sans-serif';
    const an = g.measureText(p.year).width;
    g.fillText(p.year, 980 - an, y + 32);

    g.fillStyle = JETONS.mid;
    g.font = '400 18px "Inter", sans-serif';
    const [l1] = plier(g, p.blurb[locale], 700, 1);
    g.fillText(l1 ?? "", 44, y + 60);

    let x = 760;
    for (const t of p.tags.slice(0, 2)) x += pastille(g, x, y + 42, t);

    y += LIGNES_PROJETS.pas;
  }
  return texture(c);
}

/**
 * LES LOGOS SONT CHARGES UNE FOIS POUR TOUTE LA SESSION.
 *
 * Chaque dalle repeint quand la police arrive — c'est ce qui evite d'afficher
 * un rectangle noir en attendant Inter. Mais `peindreStack` recreait alors neuf
 * `Image()` et relançait neuf requetes : le navigateur servait la seconde salve
 * depuis son cache, sans que ça se voie, mais les neuf SVG etaient redecodes
 * pour rien a chaque passage.
 *
 * Le cache est indexe par NOM et garde la promesse, pas l'image : deux dalles
 * peintes en meme temps se partagent alors le meme chargement en cours plutot
 * que d'en lancer deux.
 */
const logos = new Map<string, Promise<[string, HTMLImageElement]>>();

function charger(nom: string): Promise<[string, HTMLImageElement]> {
  const deja = logos.get(nom);
  if (deja) return deja;
  const p = new Promise<[string, HTMLImageElement]>((resoudre, rejeter) => {
    const img = new Image();
    img.onload = () => resoudre([nom, img]);
    // Une icone manquante ne doit pas rester en cache : sans cet oubli, un
    // echec reseau ponctuel condamnerait le logo pour toute la session.
    img.onerror = (e) => {
      logos.delete(nom);
      rejeter(e);
    };
    img.src = `/assets/icons/${nom}.svg`;
  });
  logos.set(nom, p);
  return p;
}

/** Le second ecran : la presentation, comme un document ouvert. */
export function peindreApropos(locale: Locale): THREE.CanvasTexture {
  const cph = home[locale];
  REFERENCE = [900, 560];
  const [c, g] = toile(640, 400);
  g.fillStyle = "#0f1319";
  g.fillRect(0, 0, 900, 560);
  g.fillStyle = "#11151b";
  g.fillRect(0, 0, 900, 40);

  g.fillStyle = JETONS.accent;
  g.font = '600 18px "Inter", sans-serif';
  g.fillText((cph.labels.bref ?? "").toUpperCase(), 40, 92);

  g.fillStyle = JETONS.encre;
  g.font = '600 34px "Inter", sans-serif';
  g.fillText("Noa Tournoy", 40, 140);

  g.fillStyle = JETONS.mid;
  g.font = '400 21px "Inter", sans-serif';
  let y = 190;
  for (const ligne of plier(g, cph.heroSub.map((s) => s.t).join(""), 820, 6)) {
    g.fillText(ligne, 40, y);
    y += 32;
  }

  y += 18;
  g.strokeStyle = JETONS.ligne;
  g.beginPath();
  g.moveTo(40, y);
  g.lineTo(860, y);
  g.stroke();
  y += 40;

  for (const b of cph.bref.slice(0, 3)) {
    g.fillStyle = JETONS.dim;
    g.font = '500 16px "Inter", sans-serif';
    g.fillText(b.k.toUpperCase(), 40, y);
    g.fillStyle = JETONS.encre;
    g.font = '500 21px "Inter", sans-serif';
    g.fillText(b.v, 300, y);
    y += 40;
  }
  return texture(c);
}

/** La page du carnet : la frise, ecrite a la main sur du papier. */
export function peindreParcours(locale: Locale): THREE.CanvasTexture {
  const cph = home[locale];
  REFERENCE = [680, 900];
  const [c, g] = toile(480, 640);
  // Un papier creme, pas blanc : le blanc pur sur un bureau de nuit brule.
  g.fillStyle = "#efe7d6";
  g.fillRect(0, 0, 680, 900);

  // La reglure, et une marge rouge — c'est ce qui fait « carnet » et non
  // « rectangle beige ».
  g.strokeStyle = "#d8cdb6";
  g.lineWidth = 1;
  for (let y = 120; y < 880; y += 38) {
    g.beginPath();
    g.moveTo(60, y);
    g.lineTo(640, y);
    g.stroke();
  }
  g.strokeStyle = "#c98b86";
  g.beginPath();
  g.moveTo(84, 40);
  g.lineTo(84, 880);
  g.stroke();

  g.fillStyle = "#3a352c";
  g.font = '600 30px "Inter", sans-serif';
  g.fillText(cph.labels.parcours, 100, 78);

  let y = 148;
  for (const m of cph.time.slice(0, 6)) {
    g.fillStyle = m.now ? "#2f5fb0" : "#7a7364";
    g.font = '500 17px "Inter", sans-serif';
    g.fillText(m.when.toUpperCase(), 100, y);

    g.fillStyle = "#2c2822";
    g.font = '600 21px "Inter", sans-serif';
    g.fillText(m.what, 100, y + 28);

    g.fillStyle = "#6b6353";
    g.font = '400 17px "Inter", sans-serif';
    for (const l of plier(g, `${m.where} ${m.note}`, 520, 2)) {
      y += 24;
      g.fillText(l, 100, y + 28);
    }
    y += 86;
    if (y > 830) break;
  }
  return texture(c);
}

/**
 * Le flanc de la machine : LES LOGOS, et rien d'autre.
 *
 * La premiere version listait la stack en pastilles de texte, groupe par
 * groupe. Sur une surface de trente centimetres vue a deux metres, ça donnait
 * un pave gris illisible — le texte etait la pour le principe, pas pour etre lu.
 * Un logo se reconnait a une taille ou un mot ne se lit plus, et c'est
 * exactement la contrainte d'une etiquette collee sur un boitier.
 *
 * NEUF SEULEMENT, en grille. Tout mettre reviendrait a refaire le pave, en
 * images cette fois. Ce sont les outils qui reviennent dans les projets.
 *
 * LE DESSIN EST ASYNCHRONE et c'est ce que la mecanique doit encaisser. Les
 * fichiers sont des SVG a charger ; on peint donc le fond tout de suite, puis on
 * repeint quand les images arrivent en marquant la texture a rafraichir. Sans
 * ce deuxieme passage, la surface resterait vide — et attendre avant de peindre
 * laisserait un trou noir sur le bureau.
 */
const LOGOS = [
  "python", "typescript", "react", "docker", "postgresql",
  "kubernetes", "nextdotjs", "git", "cplusplus",
];

export function peindreStack(locale: Locale): THREE.CanvasTexture {
  const cph = home[locale];
  REFERENCE = [512, 400];
  const [c, g] = toile(384, 300);

  const fond = () => {
    g.fillStyle = "#12161c";
    g.fillRect(0, 0, 512, 400);
    g.fillStyle = JETONS.accent;
    g.font = '600 22px "Inter", sans-serif';
    g.fillText(cph.labels.stack.toUpperCase(), 36, 52);
    g.strokeStyle = JETONS.ligne;
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(36, 70);
    g.lineTo(476, 70);
    g.stroke();
  };
  fond();

  const tex = texture(c);

  // Le chargement, puis un unique repassage. `Promise.allSettled` et non `all` :
  // une icone manquante ne doit pas emporter les huit autres.
  const cote = 96;
  const marge = 36;
  const pas = (512 - marge * 2 - cote) / 2;
  Promise.allSettled(LOGOS.map(charger)).then((sorties) => {
    fond();
    let i = 0;
    for (const sortie of sorties) {
      if (sortie.status !== "fulfilled") {
        i += 1;
        continue;
      }
      const [, img] = sortie.value;
      const x = marge + (i % 3) * pas;
      const y = 108 + Math.floor(i / 3) * 94;
      // Une plaque sous chaque logo : sans elle, un logo sombre — Next, GitHub —
      // disparait dans le fond du boitier.
      g.fillStyle = "#1c222b";
      g.beginPath();
      g.roundRect(x - 14, y - 14, cote + 28, cote + 28, 12);
      g.fill();
      g.drawImage(img, x, y, cote, cote);
      i += 1;
    }
    tex.needsUpdate = true;
  });

  return tex;
}

/** L'ecran du portable : le contact. */
export function peindreContact(locale: Locale): THREE.CanvasTexture {
  const cph = home[locale];
  REFERENCE = [760, 460];
  const [c, g] = toile(560, 340);
  g.fillStyle = "#0d141c";
  g.fillRect(0, 0, 760, 460);

  g.fillStyle = JETONS.accent;
  g.font = '600 19px "Inter", sans-serif';
  g.fillText(cph.contactLabel.toUpperCase(), 44, 70);

  g.fillStyle = JETONS.encre;
  g.font = '600 34px "Inter", sans-serif';
  let y = 128;
  for (const ligne of cph.contactTitle.slice(0, 2)) {
    g.fillText(ligne, 44, y);
    y += 44;
  }

  y = LIGNES_CONTACT.haut + LIGNES_CONTACT.hauteur - 22;
  for (const l of ["noa.tournoy@supinfo.com", "github.com/Noa-trny", "linkedin.com/in/noa-tournoy"]) {
    g.fillStyle = JETONS.fondCarte;
    g.beginPath();
    g.roundRect(44, y - 26, 672, 48, 8);
    g.fill();
    g.fillStyle = JETONS.mid;
    g.font = '400 20px "Inter", sans-serif';
    g.fillText(l, 64, y + 4);
    y += LIGNES_CONTACT.pas;
  }
  return texture(c);
}

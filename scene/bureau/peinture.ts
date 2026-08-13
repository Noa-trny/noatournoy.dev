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
  g.font = '500 17px "Inter", sans-serif';
  g.fillText(locale === "fr" ? "travaux — 6 projets" : "work — 6 projects", 100, 28);

  let y = 68;
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

    y += 86;
  }
  return texture(c);
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

/** Le flanc de la machine : la stack, comme une etiquette d'inventaire. */
export function peindreStack(locale: Locale): THREE.CanvasTexture {
  const cph = home[locale];
  REFERENCE = [512, 640];
  const [c, g] = toile(384, 480);
  g.fillStyle = "#191d24";
  g.fillRect(0, 0, 512, 640);

  g.fillStyle = JETONS.accent;
  g.font = '600 22px "Inter", sans-serif';
  g.fillText(cph.labels.stack.toUpperCase(), 34, 56);
  g.strokeStyle = JETONS.ligne;
  g.beginPath();
  g.moveTo(34, 74);
  g.lineTo(478, 74);
  g.stroke();

  let y = 118;
  for (const groupe of cph.stack.slice(0, 4)) {
    g.fillStyle = JETONS.encre;
    g.font = '600 19px "Inter", sans-serif';
    g.fillText(groupe.word, 34, y);
    y += 26;
    let x = 34;
    for (const it of groupe.items.slice(0, 6)) {
      g.font = '400 16px "Inter", sans-serif';
      const l = g.measureText(it.name).width + 18;
      if (x + l > 478) {
        x = 34;
        y += 32;
      }
      g.strokeStyle = JETONS.ligne;
      g.beginPath();
      g.roundRect(x, y - 18, l, 26, 5);
      g.stroke();
      g.fillStyle = JETONS.mid;
      g.fillText(it.name, x + 9, y);
      x += l + 7;
    }
    y += 56;
    if (y > 600) break;
  }
  return texture(c);
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

  y += 26;
  for (const l of ["noa.tournoy@supinfo.com", "github.com/Noa-trny", "linkedin.com/in/noa-tournoy"]) {
    g.fillStyle = JETONS.fondCarte;
    g.beginPath();
    g.roundRect(44, y - 26, 672, 48, 8);
    g.fill();
    g.fillStyle = JETONS.mid;
    g.font = '400 20px "Inter", sans-serif';
    g.fillText(l, 64, y + 4);
    y += 60;
  }
  return texture(c);
}

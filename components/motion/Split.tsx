import { Children, isValidElement, type ReactNode } from "react";

// Decoupe un titre en mots masques, cote SERVEUR.
//
// L'ancien kinetic.js faisait ce decoupage apres le chargement, en remplacant
// des noeuds de texte par des fragments. Trois raisons de le remonter au rendu :
//
// 1. les masques sont dans le HTML servi, donc l'initialisation de GSAP ne
//    provoque plus aucun reflow ;
// 2. plus aucune mutation de noeuds que React possede — c'etait le vrai danger,
//    un simple re-rendu du titre aurait efface le decoupage ;
// 3. le texte lu par un lecteur d'ecran est inchange : les spans sont en ligne
//    et les noeuds de texte restent contigus, exactement comme apres le
//    decoupage cote client.
//
// La descente dans les elements est essentielle et coute cher a apprendre : le
// <em> qui porte le vert acide doit etre decoupe LUI AUSSI. Anime en bloc, il
// recevait le yPercent du mot sans recevoir son masque — la partie coloree
// montait d'un seul tenant pendant que le reste du titre se levait mot par mot.

function splitText(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  // On garde les separateurs : sans eux les mots se collent.
  text.split(/(\s+)/).forEach((chunk, i) => {
    if (!chunk) return;
    if (/^\s+$/.test(chunk)) {
      out.push(chunk);
      return;
    }
    out.push(
      <span className="w" key={`${keyBase}-${i}`}>
        <span className="wi">{chunk}</span>
      </span>
    );
  });
  return out;
}

function walk(node: ReactNode, keyBase: string): ReactNode {
  if (typeof node === "string") return splitText(node, keyBase);
  if (typeof node === "number") return splitText(String(node), keyBase);
  if (Array.isArray(node)) {
    return Children.map(node, (child, i) => walk(child, `${keyBase}.${i}`));
  }
  if (isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: ReactNode }>;
    if (el.props.children === undefined) return node;
    // On descend : le <em> doit etre decoupe comme le reste.
    return {
      ...el,
      props: { ...el.props, children: walk(el.props.children, `${keyBase}.c`) },
    } as ReactNode;
  }
  return node;
}

/**
 * Enveloppe un contenu textuel et le rend mot par mot, chacun derriere son
 * propre masque. GSAP anime ensuite les `.wi`.
 */
export function Split({ children }: { children: ReactNode }) {
  return <>{walk(children, "s")}</>;
}

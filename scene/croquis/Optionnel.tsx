"use client";

import { Component, Suspense, type ReactNode } from "react";

// UN OBJET QUI PEUT NE PAS ARRIVER.
//
// Constate en bloquant les `.glb` dans le navigateur : un seul modele qui ne se
// charge pas ne degradait pas la scene, il DETRUISAIT LE SITE. Plus de canvas,
// plus de piste de defilement, plus de contenu de repli — la page entiere
// remplacee par l'ecran d'erreur du framework. Vingt-sept kilooctets manquants,
// et le portfolio n'existait plus.
//
// La cause est mecanique. `useLoader` signale un echec en LANÇANT pendant le
// rendu ; sans limite d'erreur au-dessus, React demonte jusqu'a la racine. Une
// frontiere de suspense n'y change rien : elle attend une promesse, elle
// n'attrape pas un echec. Il en fallait donc une seconde, d'une autre nature.
//
// LE REPLI EST `null`, ET C'EST DELIBERE. Un fauteuil absent laisse un bureau
// sans fauteuil : la scene reste juste, la navigation entiere reste debout, et
// personne ne sait ce qui manque sauf celui qui l'a modelise. Afficher un cube
// de remplacement ou un message d'erreur serait pire que l'absence — ça
// signalerait une panne la ou il n'y a qu'un objet en moins.
//
// L'echec est journalise TOUJOURS, pas seulement en developpement : quand un
// objet manque chez quelqu'un d'autre, c'est la seule chose qui distingue « le
// fichier n'est pas arrive » de « il n'a jamais existe ».

class Garde extends Component<{ nom: string; children: ReactNode }, { tombe: boolean }> {
  state = { tombe: false };

  static getDerivedStateFromError() {
    return { tombe: true };
  }

  componentDidCatch(erreur: unknown) {
    console.warn(`[bureau] ${this.props.nom} absent :`, erreur);
  }

  render() {
    return this.state.tombe ? null : this.props.children;
  }
}

/**
 * Monte un decor qui arrive par le reseau, sans lui confier le sort de la page.
 *
 * Les deux frontieres sont dans cet ordre pour une raison : la limite d'erreur
 * doit englober la frontiere de suspense, sinon l'echec du chargement remonte
 * au-dessus d'elle et sort du perimetre garde.
 */
export function Optionnel({ nom, children }: { nom: string; children: ReactNode }) {
  return (
    <Garde nom={nom}>
      {/* Repli `null` et non un element du DOM : dans un canvas, React
          reconcilie des objets three, et une balise en repli fait planter le
          reconciliateur. */}
      <Suspense fallback={null}>{children}</Suspense>
    </Garde>
  );
}

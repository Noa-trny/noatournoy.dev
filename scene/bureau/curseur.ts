"use client";

// LE CURSEUR N'A QU'UN PROPRIETAIRE.
//
// Il en avait deux, et ils se le disputaient. Les cinq boites sensibles
// ecrivaient `document.body.style.cursor` depuis un effet indexe sur le survol
// GLOBAL, et leur nettoyage le remettait a vide a chaque changement ; la dalle
// des projets, elle, l'ecrivait depuis ses propres gestionnaires de pointeur.
//
// Le resultat se voyait a la station des projets : on survole une ligne, la
// dalle pose « pointer », puis le rig publie `survol: null` des que
// l'amortissement du defilement bouge d'un cheveu — les cinq effets se
// nettoient et remettent le curseur a vide alors que le pointeur est toujours
// sur un lien. Lequel des deux ecrit en dernier depend de l'ordre des effets,
// c'est-a-dire de rien de stable.
//
// UN REGISTRE DE PRETENDANTS PLUTOT QU'UNE PROPRIETE PARTAGEE. Chacun annonce
// ce qu'il veut sous sa propre clef ; la main s'affiche tant qu'il en reste un.
// Personne n'efface le travail d'un autre, et l'ordre n'a plus d'importance.

const pretendants = new Set<string>();

/** Declare, sous `clef`, que l'on veut (ou non) la main. */
export function veutLaMain(clef: string, oui: boolean) {
  if (typeof document === "undefined") return;
  const avant = pretendants.size;
  if (oui) pretendants.add(clef);
  else pretendants.delete(clef);
  // On n'ecrit que si l'etat global bascule : passer de deux pretendants a un
  // ne change rien a l'affichage, et toucher au style force un recalcul.
  const apres = pretendants.size;
  if ((avant === 0) !== (apres === 0)) {
    document.body.style.cursor = apres ? "pointer" : "";
  }
}

/** A appeler au demontage : un pretendant qui disparait libere sa clef. */
export function oublieLaMain(clef: string) {
  veutLaMain(clef, false);
}

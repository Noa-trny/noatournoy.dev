import type { ReactNode } from "react";
import type { Locale } from "@/content/routes";
import { Hero } from "./Hero";
import { Bento } from "./Bento";
import { Stack } from "./Stack";
import { Projects } from "./Projects";
import { Timeline } from "./Timeline";
import { ContactFooter } from "./ContactFooter";

// L'accueil, en six sections et rien de plus.
//
// Chacune est un composant a part, sans etat et rendu sur le SERVEUR : seul
// `Reveal` porte du JavaScript, et il n'enveloppe que l'apparition. C'est ce
// qui permet a la page entiere de s'afficher, complete et lisible, avant que le
// moindre script ne soit execute — et de rester lisible s'il ne l'est jamais.
//
// CE FICHIER N'EST PLUS UNE MISE EN PAGE, C'EST UNE CARTE. Chaque section est
// rattachee a la STATION du trajet ou son objet est a l'ecran : la liste des
// travaux au moment ou la camera lit l'ecran principal, la frise au moment ou
// elle lit le carnet. Le meme tableau sert aux deux modes — pose le long de la
// piste quand la scene tourne, empile de haut en bas quand elle ne tourne pas.
//
// L'ORDRE DE LECTURE SUIT DONC LE TRAJET, et il a change : les travaux passent
// juste apres l'ouverture, la presentation ensuite. C'est l'ordre des zones, et
// il valait mieux le suivre que maintenir deux ordres — celui du document et
// celui de la camera — qui auraient diverge au premier remaniement.

export function sectionsAccueil(
  locale: Locale
): readonly { cle: string; noeud: ReactNode }[] {
  return [
    // Le fond du couloir : on n'a encore rien vu, donc c'est la qu'on se
    // presente. C'est la seule section qui n'a pas d'objet — elle a le lieu.
    { cle: "couloir", noeud: <Hero locale={locale} /> },
    { cle: "projets", noeud: <Projects locale={locale} /> },
    { cle: "apropos", noeud: <Bento locale={locale} /> },
    { cle: "parcours", noeud: <Timeline locale={locale} /> },
    { cle: "stack", noeud: <Stack locale={locale} /> },
    { cle: "contact", noeud: <ContactFooter locale={locale} /> },
  ];
}

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

export function Home({ locale }: { locale: Locale }) {
  return (
    <main id="contenu">
      <Hero locale={locale} />
      <Bento locale={locale} />
      <Projects locale={locale} />
      <Stack locale={locale} />
      <Timeline locale={locale} />
      <ContactFooter locale={locale} />
    </main>
  );
}

import type { Metadata } from "next";
import { alternates, pair } from "@/content/routes";

// Ossature de route — le contenu arrive en phase 3, depuis content/prose/.
// Elle existe des maintenant pour que la parite d'URLs avec l'ancien site soit
// verifiable avant qu'une seule ligne de prose ne bouge.

export const metadata: Metadata = {
  title: "Skills",
  alternates: alternates(pair.skills, "en"),
};

export default function SkillsEn() {
  return (
    <main id="contenu" tabIndex={-1}>
      <h1>Skills</h1>
    </main>
  );
}

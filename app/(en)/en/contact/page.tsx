import type { Metadata } from "next";
import { alternates, pair } from "@/content/routes";

// Ossature de route — le contenu arrive en phase 3, depuis content/prose/.
// Elle existe des maintenant pour que la parite d'URLs avec l'ancien site soit
// verifiable avant qu'une seule ligne de prose ne bouge.

export const metadata: Metadata = {
  title: "Contact",
  alternates: alternates(pair.contact, "en"),
};

export default function ContactEn() {
  return (
    <main id="contenu" tabIndex={-1}>
      <h1>Contact</h1>
    </main>
  );
}

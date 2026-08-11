import { HomeBody } from "@/components/HomeBody";

// L'accueil francais. Tout son contenu vit dans content/home.ts et
// content/projects.ts ; la page ne fait que choisir la langue.
//
// Les metadonnees sont portees par le layout racine du groupe (fr), l'accueil
// etant la page dont il decrit deja le titre et la description.

export default function Accueil() {
  return <HomeBody locale="fr" />;
}

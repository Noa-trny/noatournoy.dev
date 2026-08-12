import { Home } from "@/components/home/Home";

// L'accueil francais. Tout son contenu vit dans content/home.ts et
// content/projects.ts ; la page ne fait que choisir la langue.
//
// La scene 3D a ete retiree. Elle avait coute beaucoup et ne servait pas le
// propos : une villa mediterraneenne photorealiste ne dit rien d'un ingenieur
// en cybersecurite, et les projets y etaient des panneaux plantes dans un
// jardin. Le code reste dans le depot, sous `scene/`, non monte.

export default function Accueil() {
  return <Home locale="fr" />;
}

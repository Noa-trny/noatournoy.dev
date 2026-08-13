import Bureau from "@/scene/bureau/Bureau";
import { Panneau } from "@/components/bureau/Panneau";
import { Contenu } from "@/components/bureau/Contenu";
import { Repere } from "@/components/bureau/Repere";

// Le laboratoire : le monde et sa navigation, avant branchement sur le site.
//
// Le CONTENU est construit ici, sur le serveur, et passe au panneau. Le monde
// 3D ne porte donc aucun texte : il porte des objets. C'est ce qui permet au
// document servi de rester complet — un robot d'indexation et un lecteur
// d'ecran y trouvent tout, que WebGL fonctionne ou non.

export default function Labo() {
  const blocs = Contenu({ locale: "fr" });
  return (
    <>
      <Bureau />
      <Repere locale="fr" />
      <Panneau locale="fr" blocs={blocs} />
    </>
  );
}

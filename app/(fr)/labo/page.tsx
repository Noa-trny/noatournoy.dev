import Bureau from "@/scene/bureau/Bureau";
import { Repere } from "@/components/bureau/Repere";
import { Ancres } from "@/components/bureau/Ancres";

// Le laboratoire : le monde, et rien par-dessus.
//
// LE PANNEAU LATERAL A ETE RETIRE. Il redisait a cote ce que les objets
// portaient deja, et il ramenait le site a ce qu'on essayait de quitter : une
// colonne de texte, avec une illustration animee derriere. Cliquer un objet
// approche desormais la camera, et l'on LIT SUR L'OBJET.
//
// Ce qui reste dans le document — et qui n'est pas negociable — ce sont les
// vrais liens. `<Ancres>` les porte : invisibles a l'oeil, presents dans le
// HTML servi, atteignables au clavier. C'est ce qui permet a un robot
// d'indexation et a un lecteur d'ecran de trouver les six travaux, que WebGL
// fonctionne ou non.

export default function Labo() {
  return (
    <>
      <Bureau />
      <Repere locale="fr" />
      <Ancres locale="fr" />
    </>
  );
}

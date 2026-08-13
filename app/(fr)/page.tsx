import { Home } from "@/components/home/Home";
import { Monde } from "@/components/bureau/Monde";

// L'accueil francais.
//
// Le SERVEUR rend le portfolio complet ; le bureau 3D vient par-dessus apres
// hydratation, quand la machine le permet. C'est ce qui garantit que le
// referencement, le clavier et les navigateurs sans WebGL voient le meme site
// que tout le monde — et c'est la seule propriete que les trois refontes de ce
// projet n'ont pas entamee.

export default function Accueil() {
  return (
    <Monde locale="fr">
      <Home locale="fr" />
    </Monde>
  );
}

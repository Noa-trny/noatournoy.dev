import type { Section } from "@/components/ProjectPage";

export const sections: readonly Section[] = [
  {
    id: "sujet",
    title: "Le serveur décide, le client affiche.",
    body: (
      <div className="prose">
        <p>
          L'architecture fait autorité côté serveur : le serveur détient l'état de la partie,
          le client ne fait que le représenter et transmettre des intentions. C'est le choix
          qui coûte le plus cher à écrire, et celui qui rend la triche structurellement
          impossible.
        </p>
        <p>
          Deux dépôts, deux langages, une seule vérité. Le serveur est en C++20 et vise le
          Raspberry Pi 5 ; le client est en Godot 4.6. Ils se parlent en TCP par un protocole
          binaire versionné, écrit pour cette partie plutôt que repris d'une bibliothèque
          générique.
        </p>
      </div>
    ),
  },
  {
    id: "fait",
    title: "Réalisation",
    srOnly: true,
    body: (
      <>
        <p className="label">
          <span>Ce que ça fait tourner</span>
        </p>
        <div className="prose">
          <h3>Des cartes générées</h3>
          <p>
            La carte est produite procéduralement côté serveur, en trois configurations, puis
            transmise au client. Aucune carte n'est stockée : elles se recalculent.
          </p>

          <h3>Une partie complète</h3>
          <p>
            Sélection et déplacement d'unités, formations, capture de camps, revenu, sorts,
            conditions de fin de partie, un adversaire automatique, et un classement accessible
            depuis le menu. Le jeu se termine, ce qui est la part du travail qu'on sous-estime
            toujours.
          </p>

          <h3>Trois langues</h3>
          <p>
            Le client est traduit en français, anglais et espagnol, avec le changement de langue
            depuis les réglages.
          </p>

          <h3>La contrainte matérielle</h3>
          <p>
            Viser un Raspberry Pi 5 comme cible de déploiement n'est pas une coquetterie : sur
            une machine de cette taille, une boucle de jeu qui dérive ou un protocole bavard se
            voient tout de suite. La contrainte fait le travail du profileur.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "acces",
    title: "Accès au code",
    srOnly: true,
    body: (
      <div className="prose">
        <p>
          Les deux dépôts sont privés, sous l'organisation Carton Studio's. J'en parle
          volontiers en entretien ; je ne peux pas les ouvrir ici.
        </p>
      </div>
    ),
  },
];

import type { Section } from "@/components/ProjectPage";

export const sections: readonly Section[] = [
  {
    id: "sujet",
    title: "Une vraie application, pas une démonstration.",
    body: (
      <div className="prose">
        <p>
          Cinq routes réelles : la liste des jeux avec recherche, filtres et défilement infini ;
          la fiche d'un jeu avec sa description, sa bande-annonce, ses succès et leur taux de
          déblocage, ses studios et éditeurs ; tous les jeux d'un éditeur ; les favoris ; et
          une page d'erreur qui ramène quelque part.
        </p>
        <p>
          Les favoris tiennent dans un contexte React adossé au stockage local : l'état
          persiste sans serveur. La clé d'API vit dans un fichier d'environnement jamais
          versionné : elle n'apparaît nulle part dans le code source.
        </p>
        <p>
          Projet réalisé <strong>en binôme</strong> avec Antoine Delebecque, dans le cadre du
          module 2WEBD. Vérification de types, analyse statique et un parcours de bout en bout
          sous Cypress font partie des scripts du dépôt.
        </p>
      </div>
    ),
  },
];

import type { Section } from "@/components/ProjectPage";

export const sections: readonly Section[] = [
  {
    id: "sujet",
    title: "Des tableurs vers une source unique.",
    body: (
      <div className="prose">
        <p>Le suivi de la sécurité des produits digitaux vivait dans des feuilles de calcul tenues à la main : état des vulnérabilités, conformité, avancement des tests d'intrusion. Chaque recoupement était un travail de copie, et personne n'avait la même version du chiffre.</p>
        <p>DataSentinel centralise ce pilotage dans un tableau de bord Looker branché directement sur les données. Le chiffre affiché est le chiffre de la source ; il n'y a plus de version intermédiaire à maintenir.</p>
      </div>
    ),
  },
  {
    id: "fait",
    title: "Réalisation",
    srOnly: true,
    body: (
      <>
        <p className="label"><span>Ce que j'ai construit</span></p>
        <div className="prose">
          <h3>La modélisation</h3>
          <p>Exploitation des données via Google Cloud Platform et BigQuery : requêtes SQL complexes et modélisation en LookML. C'est la couche qui décide de ce qu'un indicateur veut dire : l'endroit où une définition floue coûte le plus cher.</p>

          <h3>Les extensions full-stack</h3>
          <p>Un tableau de bord montre ; il ne laisse pas agir. J'ai développé des extensions intégrées à Looker (backend Python, frontend React) pour rendre la gestion des tests d'intrusion interactive : consulter, mettre à jour et suivre depuis l'outil plutôt qu'à côté.</p>

          <h3>Le déploiement</h3>
          <p>Pipeline d'intégration et de déploiement continus, et infrastructure décrite comme du code : Terraform, GitHub Actions, Docker, Kubernetes. L'outil se redéploie sans geste manuel.</p>

          <h3>Ce que j'en ai rapporté</h3>
          <p>Les certifications <strong>Google Looker</strong> et <strong>LookML</strong>, et une conviction : sur un sujet de sécurité, la valeur n'est pas dans le graphique mais dans la définition de la donnée qu'il affiche.</p>
        </div>
      </>
    ),
  },
  {
    id: "confid",
    title: "Confidentialité",
    srOnly: true,
    body: (
      <div className="prose">
        <p>Aucune capture, aucune donnée, aucun nom de produit : le contenu de l'outil appartient à ADEO. Ce qui est décrit ici se limite à ce que je peux dire de mon propre travail.</p>
      </div>
    ),
  },
];

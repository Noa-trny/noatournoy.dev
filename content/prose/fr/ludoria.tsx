import type { Section } from "@/components/ProjectPage";
import { Figure } from "@/components/Figure";

export const sections: readonly Section[] = [
  {
    id: "sujet",
    title: "Trois jeux, une seule expérience.",
    body: (
      <>
        <div className="prose">
          <p>
            Trois jeux qui partagent un plateau mais pas leurs règles. L'enjeu
            du projet n'était pas d'en écrire un, mais de les faire cohabiter :
            une même interface, un même vocabulaire de gestes, sans que le
            joueur ait à réapprendre où cliquer à chaque changement de jeu.
          </p>
          <p>
            <strong>Projet d'équipe à trois.</strong> Le dépôt d'origine est
            chez{" "}
            <a href="https://github.com/simonpotel/Ludoria">simonpotel</a> ; mes
            contributions y sont vérifiables commit par commit.
          </p>
        </div>

        <div className="plates-grid mt-bloc">
          <Figure
            srcSet="/travaux/ludoria/img/ludoria-katerenga-700.webp 700w, /travaux/ludoria/img/ludoria-katerenga.webp 1280w"
            sizes="(min-width: 60rem) 24rem, 100vw"
            src="/travaux/ludoria/img/ludoria-katerenga.webp"
            alt="Katerenga : le plateau à quatre quadrants, les pions posés en début de partie."
            width={1280}
            height={720}
            caption="Katerenga, le plateau composé de quatre quadrants tirés au sort."
          />
          <Figure
            srcSet="/travaux/ludoria/img/ludoria-congress-700.webp 700w, /travaux/ludoria/img/ludoria-congress.webp 1280w"
            sizes="(min-width: 60rem) 24rem, 100vw"
            src="/travaux/ludoria/img/ludoria-congress.webp"
            alt="Congress : les pions d'une même couleur en cours de regroupement."
            width={1280}
            height={720}
            caption="Congress, où la victoire tient au regroupement de ses propres pions."
          />
          <Figure
            srcSet="/travaux/ludoria/img/ludoria-isolation-700.webp 700w, /travaux/ludoria/img/ludoria-isolation.webp 1280w"
            sizes="(min-width: 60rem) 24rem, 100vw"
            src="/travaux/ludoria/img/ludoria-isolation.webp"
            alt="Isolation : des cases neutralisées au fil des tours."
            width={1280}
            height={720}
            caption="Isolation, le plateau se referme case après case."
          />
        </div>
      </>
    ),
  },
  {
    id: "part",
    title: "Contribution",
    srOnly: true,
    body: (
      <>
        <p className="label">
          <span>Ma part</span>
        </p>
        <div className="prose">
          <h3>L'interface et la direction artistique</h3>
          <p>
            Conception de l'interface et création des plateaux : c'est la partie
            qui décide si trois jeux différents donnent l'impression d'un seul
            produit. Interface fluide et cohérente, pensée pour l'expérience
            multi-jeux.
          </p>

          <h3>La logique métier</h3>
          <p>
            Moteurs de jeu, gestion des tours, conditions de victoire : chaque
            jeu a les siennes, sur une base commune.
          </p>

          <h3>Les opposants automatiques</h3>
          <p>
            Développement des algorithmes de bots, pour qu'une partie soit
            jouable sans adversaire humain sous la main.
          </p>
        </div>
      </>
    ),
  },
];

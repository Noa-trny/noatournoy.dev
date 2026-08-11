import type { Section } from "@/components/ProjectPage";
import { Figure } from "@/components/Figure";

export const sections: readonly Section[] = [
  {
    id: "sujet",
    title: "Zéro dépendance, littéralement.",
    body: (
      <>
        <div className="prose">
          <p>
            Le jeu lit ses 96 formes de tuiles dans un fichier JSON. Importer une bibliothèque
            pour lire un seul fichier aurait été plus rapide à écrire ; le parseur est écrit à la
            main. C'est la décision qui résume l'esprit du projet, et celle qui apprend le plus.
          </p>
          <p>
            De deux à neuf joueurs, sur une grille de 20 × 20 ou de 30 × 30 selon l'effectif,
            neuf tours chacun. Les tuiles tournent et se retournent. Gagne celui qui possède le
            plus grand carré plein en fin de partie ; à égalité, le plus grand territoire
            départage.
          </p>
        </div>

        <Figure
          bloc
          srcSet="/travaux/laying-grass/img/console.webp 1280w"
          sizes="(min-width: 60rem) 60rem, 100vw"
          src="/travaux/laying-grass/img/console.webp"
          alt="Une partie en cours dans le terminal : la grille, les tuiles disponibles et le score des joueurs."
          width={1280}
          height={720}
          caption="Une partie en cours, telle que le programme la dessine dans le terminal."
        />
      </>
    ),
  },
  {
    id: "archi",
    title: "Architecture",
    srOnly: true,
    body: (
      <>
        <p className="label">
          <span>L'architecture</span>
        </p>
        <div className="prose">
          <p>
            Une séparation nette entre les règles, la validation des placements, les algorithmes
            et l'affichage. <strong>Game</strong> tient la logique, <strong>Validator</strong> décide
            si un coup est légal, <strong>Algorithms</strong> porte la recherche du plus grand carré
            et le calcul de connexité, <strong>Board</strong> gère la grille et les territoires.
            RAII, <code>enum class</code>, <code>constexpr</code>, STL : les outils du langage
            plutôt que des rustines.
          </p>
          <p>
            Trois mécaniques de bonus s'ajoutent au placement : les coupons d'échange, qui
            laissent choisir parmi les cinq tuiles suivantes ; les pierres, qui bloquent un
            adversaire ; et l'annexion, qui prend une case du territoire d'en face.
          </p>
          <p>
            Le dépôt est documenté à part : prise en main, architecture et décisions
            d'implémentation, règles détaillées, arborescence et dépendances entre modules.
          </p>
        </div>
      </>
    ),
  },
];

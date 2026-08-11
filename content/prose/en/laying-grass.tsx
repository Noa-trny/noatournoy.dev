import type { Section } from "@/components/ProjectPage";
import { Figure } from "@/components/Figure";

export const sections: readonly Section[] = [
  {
    id: "sujet",
    title: "Zero dependencies, literally.",
    body: (
      <>
        <div className="prose">
          <p>
            The game reads its 96 tile shapes from a JSON file. Pulling in a library to read one
            file would have been quicker to write; the parser is hand-written instead. That is the
            decision that sums up the project, and the one that teaches the most.
          </p>
          <p>
            Two to nine players, on a 20 × 20 or 30 × 30 grid depending on the count, nine rounds
            each. Tiles rotate and flip. The winner is whoever holds the largest filled square at
            the end; ties are broken by total territory.
          </p>
        </div>

        <Figure
          bloc
          srcSet="/travaux/laying-grass/img/console.webp 1280w"
          sizes="(min-width: 60rem) 60rem, 100vw"
          src="/travaux/laying-grass/img/console.webp"
          alt="A game in progress in the terminal: the grid, the available tiles and the players' scores."
          width={1280}
          height={720}
          caption="A game in progress, exactly as the program draws it in the terminal."
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
          <span>The architecture</span>
        </p>
        <div className="prose">
          <p>
            A clean separation between rules, placement validation, algorithms and display.{" "}
            <strong>Game</strong> holds the logic, <strong>Validator</strong> decides whether a move
            is legal, <strong>Algorithms</strong> carries the largest-square search and the
            connectivity computation, <strong>Board</strong> manages the grid and territories. RAII,{" "}
            <code>enum class</code>, <code>constexpr</code>, STL: the language's own tools rather
            than patches.
          </p>
          <p>
            Three bonus mechanics sit on top of placement: exchange coupons, which let you pick from
            the next five tiles; stones, which block an opponent; and annexation, which takes a cell
            from the territory across the board.
          </p>
          <p>
            The repository is documented separately: getting started, architecture and
            implementation decisions, detailed rules, file tree and inter-module dependencies.
          </p>
        </div>
      </>
    ),
  },
];

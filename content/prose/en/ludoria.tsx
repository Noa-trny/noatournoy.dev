import type { Section } from "@/components/ProjectPage";
import { Figure } from "@/components/Figure";

export const sections: readonly Section[] = [
  {
    id: "sujet",
    title: "Three games, one experience.",
    body: (
      <>
        <div className="prose">
          <p>
            Three games that share a board but not their rules. The point of the
            project was not writing one of them, but making them cohabit: one
            interface, one vocabulary of gestures, without the player having to
            relearn where to click each time the game changes.
          </p>
          <p>
            <strong>A team of three.</strong> The original repository lives at{" "}
            <a href="https://github.com/simonpotel/Ludoria">simonpotel</a>; my
            contributions are verifiable commit by commit.
          </p>
        </div>

        <div className="plates-grid mt-bloc">
          <Figure
            srcSet="/travaux/ludoria/img/ludoria-katerenga-700.webp 700w, /travaux/ludoria/img/ludoria-katerenga.webp 1280w"
            sizes="(min-width: 60rem) 24rem, 100vw"
            src="/travaux/ludoria/img/ludoria-katerenga.webp"
            alt="Katerenga: the four-quadrant board with the pieces set up at the start of a game."
            width={1280}
            height={720}
            caption="Katerenga, its board built from four randomly drawn quadrants."
          />
          <Figure
            srcSet="/travaux/ludoria/img/ludoria-congress-700.webp 700w, /travaux/ludoria/img/ludoria-congress.webp 1280w"
            sizes="(min-width: 60rem) 24rem, 100vw"
            src="/travaux/ludoria/img/ludoria-congress.webp"
            alt="Congress: pieces of one colour being gathered together."
            width={1280}
            height={720}
            caption="Congress, where winning means gathering your own pieces together."
          />
          <Figure
            srcSet="/travaux/ludoria/img/ludoria-isolation-700.webp 700w, /travaux/ludoria/img/ludoria-isolation.webp 1280w"
            sizes="(min-width: 60rem) 24rem, 100vw"
            src="/travaux/ludoria/img/ludoria-isolation.webp"
            alt="Isolation: squares neutralised as the turns go by."
            width={1280}
            height={720}
            caption="Isolation, where the board closes in one square at a time."
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
          <span>My part</span>
        </p>
        <div className="prose">
          <h3>Interface and art direction</h3>
          <p>
            Designing the interface and creating the boards: this is the part
            that decides whether three different games feel like one product. A
            fluid, consistent interface, built for the multi-game experience.
          </p>

          <h3>Game logic</h3>
          <p>
            Game engines, turn handling, victory conditions: each game has its
            own, on a shared base.
          </p>

          <h3>Computer opponents</h3>
          <p>
            Building the bot algorithms, so a game is playable without a human
            opponent at hand.
          </p>
        </div>
      </>
    ),
  },
];

import type { Section } from "@/components/ProjectPage";

export const sections: readonly Section[] = [
  {
    id: "sujet",
    title: "A real application, not a demo.",
    body: (
      <div className="prose">
        <p>
          Five actual routes: the game list with search, filters and infinite scroll; a game's
          detail page with its description, trailer, achievements and their unlock rates,
          studios and publishers; every game from a publisher; favourites; and an error page
          that takes you somewhere.
        </p>
        <p>
          Favourites live in a React context backed by local storage: the state persists
          without a server. The API key sits in an environment file that is never committed:
          it appears nowhere in the source.
        </p>
        <p>
          Built <strong>as a pair</strong> with Antoine Delebecque, for the 2WEBD module. Type
          checking, static analysis and an end-to-end journey under Cypress are part of the
          repository's scripts.
        </p>
      </div>
    ),
  },
];

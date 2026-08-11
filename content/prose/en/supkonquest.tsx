import type { Section } from "@/components/ProjectPage";

export const sections: readonly Section[] = [
  {
    id: "sujet",
    title: "The server decides, the client draws.",
    body: (
      <div className="prose">
        <p>
          The architecture is server-authoritative: the server holds the game state, the client
          only represents it and sends intentions. It is the choice that costs the most to
          write, and the one that makes cheating structurally impossible.
        </p>
        <p>
          Two repositories, two languages, one truth. The server is C++20 and targets a
          Raspberry Pi 5; the client is Godot 4.6. They speak over TCP through a versioned
          binary protocol, written for this game rather than lifted from a generic library.
        </p>
      </div>
    ),
  },
  {
    id: "fait",
    title: "Delivery",
    srOnly: true,
    body: (
      <>
        <p className="label">
          <span>What it runs</span>
        </p>
        <div className="prose">
          <h3>Generated maps</h3>
          <p>
            The map is produced procedurally on the server, in three configurations, then sent
            to the client. No map is stored: they are recomputed.
          </p>

          <h3>A complete game</h3>
          <p>
            Unit selection and movement, formations, camp capture, income, spells, end-of-game
            conditions, a computer opponent, and a leaderboard reachable from the menu. The game
            ends, which is the part of the work everyone underestimates.
          </p>

          <h3>Three languages</h3>
          <p>
            The client is translated into French, English and Spanish, with the language switch
            in the settings.
          </p>

          <h3>The hardware constraint</h3>
          <p>
            Targeting a Raspberry Pi 5 for deployment is not an affectation: on a machine that
            size, a drifting game loop or a chatty protocol shows up immediately. The constraint
            does the profiler's job.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "acces",
    title: "Access to the code",
    srOnly: true,
    body: (
      <div className="prose">
        <p>
          Both repositories are private, under the Carton Studio's organisation. I am happy to
          talk them through in an interview; I cannot open them here.
        </p>
      </div>
    ),
  },
];

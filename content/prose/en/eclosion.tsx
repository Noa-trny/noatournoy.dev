import type { Section } from "@/components/ProjectPage";
import { Figure } from "@/components/Figure";

export const sections: readonly Section[] = [
  {
    id: "sujet",
    title: "One hundred per cent procedural.",
    body: (
      <>
        <div className="prose">
          <p>
            No 3D models, no textures, no audio files, no external requests at runtime.
            Geometry, materials (noise and FBM in GLSL), over a hundred thousand particles and
            the music itself (pure WebAudio synthesis) are produced by the code. One deliberate
            exception: the typeface, committed to the repository.
          </p>
          <p>
            Roughly 11,600 lines across 195 files. Next.js 15, React 19, strict TypeScript,
            Three.js and React Three Fiber, GSAP ScrollTrigger, Lenis, zustand, WebAudio.
          </p>
        </div>

        <Figure
          bloc
          srcSet="/travaux/eclosion/img/dawn-700.webp 700w, /travaux/eclosion/img/dawn-1400.webp 1400w"
          sizes="(min-width: 60rem) 60rem, 100vw"
          src="/travaux/eclosion/img/dawn-1400.webp"
          alt="The dawn of Éclosion: the sun grazes the horizon above procedural terrain."
          width={1400}
          height={875}
          caption="The Dawn, final act. The solar disc ignores the fog so it can clear the bloom threshold."
        />
      </>
    ),
  },
  {
    id: "choix",
    title: "Technical decisions",
    srOnly: true,
    body: (
      <>
        <p className="label"><span>Three decisions that shape everything</span></p>

        <div className="prose">
          <h3>The scroll contract: zero React renders at 60 frames per second</h3>
          <p>
            One smoothing layer (Lenis), one master ScrollTrigger scrubbing a GSAP timeline of
            duration 1, and a registry of mutable uniforms that the tweens write and the
            renderer reads every frame, never through a React render. React only wakes up on act
            changes. The DOM text follows through a single MotionValue, also outside React.
          </p>

          <h3>One world, one truth</h3>
          <p>An analytic function <strong>groundHeight(x, z)</strong> generates the visible terrain, constrains walking in free-roam, bounces the physics and bounds the birds' flight. What you see is exactly what you touch. Same logic for the camera: a single continuous CatmullRom curve, each act travelling to the first point of the next. No cut across the whole film.</p>

          <h3>Stateless particles</h3>
          <p>
            Every behaviour (rain, curl-noise fireflies, embers, the final vortex) is a closed
            function of (seed, time) evaluated in the vertex shader. No simulation to maintain,
            no GPU round trip. Buffers are allocated once at the highest quality level; changing
            tier only moves a setDrawRange.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "mesures",
    title: "Measurements",
    srOnly: true,
    body: (
      <>
        <p className="label"><span>The engineering, in numbers</span></p>

        <table className="measures">
          <caption>Integrated-GPU bench forced to the highest tier, the worst measurable case.</caption>
          <thead>
            <tr>
              <th scope="col">Measurement</th>
              <th scope="col">Before</th>
              <th scope="col">After</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">First-visit payload</th>
              <td>422 Kio</td>
              <td className="after">342 Kio<span aria-hidden="true"> · −19 %</span></td>
            </tr>
            <tr>
              <th scope="row">Worst frame at act boundaries</th>
              <td>617 ms</td>
              <td className="after">167 ms</td>
            </tr>
            <tr>
              <th scope="row">Forest trees, at equal frame cost</th>
              <td>420</td>
              <td className="after">630</td>
            </tr>
            <tr>
              <th scope="row">Lighthouse : accessibility, best practices, SEO</th>
              <td></td>
              <td className="after">100 / 100 / 100</td>
            </tr>
          </tbody>
        </table>

        <div className="prose mt-prose">
          <h3>The 19%</h3>
          <p>
            The italic font, 80 KB preloaded at high priority, was rendered nowhere. A single
            occurrence of the word "italic" in the entire codebase: its own declaration.
          </p>

          <h3>The 617 ms</h3>
          <p>Three stalls stacked at every act boundary, untangled with the CPU profiler and GL hooks placed on <strong>linkProgram</strong>:</p>
          <ul>
            <li><strong>the cache-key trap</strong>: post-processing renders the scene under its own renderer state, so all shader warm-up was compiling programs the real render never used, and the first visible frame relinked everything;</li>
            <li><strong>the link wait</strong>: an act would draw as soon as the camera swept it, ready or not;</li>
            <li><strong>the driver's deferred reflection</strong>: even linked, a program pays for its first introspection, about 180 ms each on an integrated GPU.</li>
          </ul>
          <p>
            The answer: each act mounts invisible, compiles under the composer's state, gets one
            program introspected per frame, then reveals itself, all of it covered by the scene's
            fog. No visual change, smooth boundaries.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "debug",
    title: "Nothing gets fixed without being seen.",
    body: (
      <>
        <div className="prose">
          <p>
            A CDP harness drives a real Chrome: enter the experience, jump to a precise beat,
            capture, before and after, for every rendering change. Speed-linked effects have to
            be captured mid-scroll; a still capture shows nothing. The GPU tier is forced by
            injecting the renderer string.
          </p>

          <h3>The sun that wouldn't ignite</h3>
          <p>
            The dawn disc rendered grey. Exponential fog was eating 99.5% of it at that distance,
            and its luminance ceiling stayed below the bloom threshold: "bright enough to bloom",
            said the comment; it had never been true. The fix: the sun ignores the fog (the moon
            re-emulates it identically in JavaScript) and an ignition curve clears the threshold:
            ember below the horizon, gold at grazing, cream at the zenith.
          </p>

          <h3>The ocean's lines</h3>
          <p>
            One symptom, "white streaks", turned out to be five stacked defects, each masking the
            next: motion-blur ghosting, light-shaft edges, the night sky dome visible underwater,
            the Gerstner sheet's edge, an overlit floor. The method that finally won: mask
            components one by one to isolate the source before touching a single shader.
          </p>
        </div>

        <div className="plates-grid mt-bloc">
          <Figure
            srcSet="/travaux/eclosion/img/void-constellations-700.webp 700w, /travaux/eclosion/img/void-constellations-1400.webp 1400w"
            sizes="(min-width: 60rem) 30rem, 100vw"
            src="/travaux/eclosion/img/void-constellations-1400.webp"
            alt="The Void: constellations traced on an empty sky."
            width={1400}
            height={875}
            caption="The Void, generated constellations, no horizon."
          />
          <Figure
            srcSet="/travaux/eclosion/img/storm-700.webp 700w, /travaux/eclosion/img/storm-1400.webp 1400w"
            sizes="(min-width: 60rem) 30rem, 100vw"
            src="/travaux/eclosion/img/storm-1400.webp"
            alt="The Storm: dense rain and lightning above the terrain."
            width={1400}
            height={875}
            caption="The Storm, captured mid-scroll, the only way to see the speed blur."
          />
          <Figure
            srcSet="/travaux/eclosion/img/forest-700.webp 700w, /travaux/eclosion/img/forest-1400.webp 1400w"
            sizes="(min-width: 60rem) 30rem, 100vw"
            src="/travaux/eclosion/img/forest-1400.webp"
            alt="The Forest: hundreds of trees generated as instances."
            width={1400}
            height={875}
            caption="The Forest, 630 trees across five InstancedMesh, at unchanged frame cost."
          />
          <Figure
            srcSet="/travaux/eclosion/img/ocean-700.webp 700w, /travaux/eclosion/img/ocean-1400.webp 1400w"
            sizes="(min-width: 60rem) 30rem, 100vw"
            src="/travaux/eclosion/img/ocean-1400.webp"
            alt="The Ocean: a Gerstner sheet crossed by light shafts."
            width={1400}
            height={875}
            caption="The Ocean, a Gerstner sheet and light shafts below the surface."
          />
        </div>
      </>
    ),
  },
  {
    id: "qualite",
    title: "Quality and accessibility",
    srOnly: true,
    body: (
      <>
        <p className="label"><span>Holding quality over time</span></p>

        <div className="prose">
          <ul>
            <li><strong>Continuous integration on every push</strong>: strict linting (the <code>any</code> type is banned), strict TypeScript, 16 unit tests (act tiling, seeded pseudo-random generator, analytic ground, FR/EN text parity), build.</li>
            <li><strong>One end-to-end test</strong> plays the whole film (boot, entry, every act, the emergence from the water, the fallback, in both languages) and requires zero console errors. It caught a real race the day it went live: a dispose during a shader link.</li>
            <li><strong>Without WebGL2</strong>: a fallback page serves the complete narrative as server-rendered HTML, without JavaScript, in both languages.</li>
            <li><strong>Reduced motion</strong>: native scrolling, particles at 4%, no shake, sound off. <code>aria-live</code> announcements on each act, full keyboard navigation, visible focus throughout.</li>
          </ul>
        </div>
      </>
    ),
  },
];

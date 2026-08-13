import type { Metadata } from "next";
import { alternates, pair } from "@/content/routes";
import { Footer, Header, MenuDrawer, Skip } from "@/components/chrome/Chrome";

// La page skills, portee depuis /en/skills/index.html.
// Les quatre bandes (titre, tech, ou, autres) sont portees par la page
// elle-meme : contrairement aux fiches de travaux, rien ici n'est generique.
// Les id restent ceux de la source francaise, pour que les deux arbres se
// comparent section par section.

export const metadata: Metadata = {
  title: "Skills — Noa Tournoy",
  description:
    "Languages, front end, data and BI, infrastructure, Google Looker and LookML certifications, spoken languages. Every line points to a piece of work where it was used.",
  alternates: alternates(pair.skills, "en"),
  openGraph: {
    type: "website",
    title: "Skills — Noa Tournoy",
    description:
      "Languages, front end, data and BI, infrastructure, Google Looker and LookML certifications, spoken languages. Every line points to a piece of work where it was used.",
    url: pair.skills.en,
    locale: "en_US",
    images: ["/og.png"],
  },
};

export default function SkillsEn() {
  return (
    <>
      <Skip locale="en" />
      <Header pair={pair.skills} locale="en" />
      <main id="contenu" tabIndex={-1}>
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-14 sm:px-8" aria-labelledby="titre">
          <div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-[0.14em] text-dim uppercase">
              <span>skills</span>
              <span>languages, infrastructure, certifications</span>
            </p>
            <h1 className="mt-5 text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.05] font-semibold" id="titre">
              Skills
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-mid">
              A list is only worth something if every line has been used somewhere. The ones below point to the work where they were.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl border-t border-line px-6 py-14 sm:px-8" aria-labelledby="tech">
          <div>
            <h2 className="sr-only" id="tech">
              Technical
            </h2>
            <dl className="kv">
              <dt>Languages</dt>
              <dd>Python, TypeScript, JavaScript, SQL, C, C++, Java, PHP, LookML</dd>

              <dt>Web</dt>
              <dd>React, Next.js, HTML, CSS, Three.js and GLSL, React Native / Expo, Node.js, Electron</dd>

              <dt>Data and BI</dt>
              <dd>Looker, LookML, BigQuery, Google Cloud Platform, PostgreSQL, complex SQL queries</dd>

              <dt>Infrastructure</dt>
              <dd>Docker, Kubernetes, Terraform, GitHub Actions, Vercel, continuous integration and delivery</dd>

              <dt>Tools</dt>
              <dd>Git and GitHub, PostgreSQL, Auth0, Godot, Visual Studio Code, Cisco Packet Tracer, Notion, Trello</dd>

              <dt>Certifications</dt>
              <dd>Google Looker · LookML, during the 2025 ADEO internship · AWS Academy Cloud Foundations · CCNA Introduction to Networks</dd>
            </dl>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pt-20 pb-14 sm:px-8" aria-labelledby="ou">
          <div>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold" id="ou">
              Where it <em>was used</em>.
            </h2>
            <div className="prose">
              <ul>
                <li><strong>Looker, LookML, BigQuery, Terraform, Kubernetes</strong>: <a href="/en/work/datasentinel/">DataSentinel</a>, the security monitoring dashboard at ADEO.</li>
                <li><strong>TypeScript, React, Three.js, GLSL, WebAudio</strong>: <a href="/en/work/eclosion/">Éclosion</a>, a fully procedural 3D web experience.</li>
                <li><strong>C++20, Godot, binary protocol</strong>: <a href="/en/work/supkonquest/">SupKonQuest</a>, multiplayer real-time strategy.</li>
                <li><strong>C++17 with no dependencies</strong>: <a href="/en/work/laying-grass/">laying_grass</a>, down to the hand-written JSON parser.</li>
                <li><strong>Python, Pygame, sockets</strong>: <a href="/en/work/ludoria/">Ludoria</a>, three networked board games.</li>
                <li><strong>React, TypeScript, Cypress</strong>: <a href="/en/work/gamedex/">Gamedex</a>, a game catalogue on the RAWG API.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl border-t border-line px-6 py-14 sm:px-8" aria-labelledby="autres">
          <div>
            <h2 className="sr-only" id="autres">
              Languages and method
            </h2>
            <dl className="kv">
              <dt>Spoken languages</dt>
              <dd>French, native · English, professional</dd>

              <dt>Method</dt>
              <dd>Measure before fixing. Verify every visual change with a capture. Isolate before accusing. Encode each lesson paid for as a test or an invariant, so it only costs once.</dd>

              <dt>Away from the code</dt>
              <dd>Weight training, video games, fashion</dd>
            </dl>
          </div>
        </section>
      </main>
      <MenuDrawer locale="en" />
      <Footer locale="en" />
    </>
  );
}

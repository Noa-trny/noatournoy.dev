import type { Metadata } from "next";
import { alternates, pair } from "@/content/routes";
import { Footer, Header, MenuDrawer, Skip } from "@/components/chrome/Chrome";

// La page savoir-faire, portee depuis /savoir-faire/index.html.
// Les quatre bandes (titre, tech, ou, autres) sont portees par la page
// elle-meme : contrairement aux fiches de travaux, rien ici n'est generique.

export const metadata: Metadata = {
  title: "Savoir-faire — Noa Tournoy",
  description:
    "Langages, front, données et BI, infrastructure, certifications Google Looker et LookML, langues parlées. Chaque ligne renvoie à un travail où elle a servi.",
  alternates: alternates(pair.skills, "fr"),
  openGraph: {
    type: "website",
    title: "Savoir-faire — Noa Tournoy",
    description:
      "Langages, front, données et BI, infrastructure, certifications. Chaque ligne renvoie à un travail où elle a servi.",
    url: pair.skills.fr,
    locale: "fr_FR",
    images: ["/og.png"],
  },
};

export default function SkillsFr() {
  return (
    <>
      <Skip locale="fr" />
      <Header pair={pair.skills} locale="fr" />
      <main id="contenu" tabIndex={-1}>
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-14 sm:px-8" aria-labelledby="titre">
          <div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-[0.14em] text-dim uppercase">
              <span>savoir-faire</span>
              <span>langages, infrastructure, certifications</span>
            </p>
            <h1 className="mt-5 text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.05] font-semibold" id="titre">
              Savoir-faire
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-mid">
              Une liste n'a de valeur que si chaque ligne a servi quelque part. Celles qui suivent renvoient au travail où elles ont servi.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl border-t border-line px-6 py-14 sm:px-8" aria-labelledby="tech">
          <div>
            <h2 className="sr-only" id="tech">
              Technique
            </h2>
            <dl className="kv">
              <dt>Langages</dt>
              <dd>Python, TypeScript, JavaScript, SQL, C, C++, Java, PHP, LookML</dd>

              <dt>Web</dt>
              <dd>React, Next.js, HTML, CSS, Three.js et GLSL, React Native / Expo, Node.js, Electron</dd>

              <dt>Données et BI</dt>
              <dd>Looker, LookML, BigQuery, Google Cloud Platform, PostgreSQL, requêtes SQL complexes</dd>

              <dt>Infrastructure</dt>
              <dd>Docker, Kubernetes, Terraform, GitHub Actions, Vercel, intégration et déploiement continus</dd>

              <dt>Outils</dt>
              <dd>Git et GitHub, PostgreSQL, Auth0, Godot, Visual Studio Code, Cisco Packet Tracer, Notion, Trello</dd>

              <dt>Certifications</dt>
              <dd>Google Looker · LookML, pendant le stage ADEO 2025 · AWS Academy Cloud Foundations · CCNA Introduction to Networks</dd>
            </dl>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pt-20 pb-14 sm:px-8" aria-labelledby="ou">
          <div>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold" id="ou">
              Où ça a <em>servi</em>.
            </h2>
            <div className="prose">
              <ul>
                <li><strong>Looker, LookML, BigQuery, Terraform, Kubernetes</strong> : <a href="/travaux/datasentinel/">DataSentinel</a>, le tableau de bord de pilotage de la sécurité chez ADEO.</li>
                <li><strong>TypeScript, React, Three.js, GLSL, WebAudio</strong> : <a href="/travaux/eclosion/">Éclosion</a>, expérience web 3D entièrement procédurale.</li>
                <li><strong>C++20, Godot, protocole binaire</strong> : <a href="/travaux/supkonquest/">SupKonQuest</a>, stratégie temps réel multijoueur.</li>
                <li><strong>C++17 sans dépendance</strong> : <a href="/travaux/laying-grass/">laying_grass</a>, jusqu'au parseur JSON écrit à la main.</li>
                <li><strong>Python, Pygame, sockets</strong> : <a href="/travaux/ludoria/">Ludoria</a>, trois jeux de plateau en réseau.</li>
                <li><strong>React, TypeScript, Cypress</strong> : <a href="/travaux/gamedex/">Gamedex</a>, catalogue de jeux sur l'API RAWG.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl border-t border-line px-6 py-14 sm:px-8" aria-labelledby="autres">
          <div>
            <h2 className="sr-only" id="autres">
              Langues et méthode
            </h2>
            <dl className="kv">
              <dt>Langues parlées</dt>
              <dd>Français, langue maternelle · Anglais, niveau professionnel</dd>

              <dt>Méthode</dt>
              <dd>Mesurer avant de corriger. Vérifier chaque changement visuel par capture. Isoler avant d'accuser. Encoder chaque leçon payée en test ou en invariant, pour qu'elle ne coûte qu'une fois.</dd>

              <dt>En dehors du code</dt>
              <dd>Musculation, jeux vidéo, mode</dd>
            </dl>
          </div>
        </section>
      </main>
      <MenuDrawer locale="fr" />
      <Footer locale="fr" />
    </>
  );
}

// Portage verbatim de l'ancien index.html. Aucune animation ici : GSAP revient
// en phase 4 sous forme de composant client, et la scene 3D en phase 6. Les
// attributs `data-i18n` de l'ancien balisage ne sont pas repris : plus aucun
// script ne les lisait depuis le passage a deux arbres statiques (commit d018db8).

export default function Accueil() {
  return (
    <>
      <a className="skip" href="#contenu">
        Aller au contenu
      </a>

      <main>
        <section className="hero light band-sec" aria-labelledby="titre">
          <header className="tophead wrap">
            <a className="mark" href="/">
              Portfolio
            </a>
            <div className="tophead-right">
              <div className="lang" role="group" aria-label="Langue">
                <a href="/" lang="fr" hrefLang="fr" aria-current="true">
                  FR
                </a>
                <a href="/en/" lang="en" hrefLang="en">
                  EN
                </a>
              </div>
              <button
                className="menu-btn"
                type="button"
                aria-expanded="false"
                aria-controls="menu"
              >
                Menu
              </button>
            </div>
          </header>

          <div className="wrap hero-in" id="contenu" tabIndex={-1}>
            <div className="hero-grid">
              <div className="hero-text">
                <h1 id="titre">Noa Tournoy</h1>
                <p className="hero-sub">
                  Étudiant ingénieur à Lille, spécialisé en{" "}
                  <b>cybersécurité</b>. Je développe en <b>Python</b>,{" "}
                  <b>TypeScript</b> et <b>Docker</b> — du tableau de bord de
                  sécurité à l&apos;expérience web 3D. Alternance chez{" "}
                  <b>ADEO</b> à partir d&apos;octobre 2026.
                </p>

                <div className="hero-actions">
                  <a className="btn" href="#travaux">
                    Voir mes travaux
                  </a>
                  <a
                    className="icon-btn"
                    href="https://github.com/Noa-trny"
                    aria-label="GitHub"
                  >
                    <img
                      src="/assets/icons/github.svg"
                      alt=""
                      width="19"
                      height="19"
                      decoding="async"
                    />
                  </a>
                  <a
                    className="icon-btn"
                    href="https://www.linkedin.com/in/noa-tournoy/"
                    aria-label="LinkedIn"
                  >
                    <img
                      src="/assets/icons/linkedin.svg"
                      alt=""
                      width="19"
                      height="19"
                      decoding="async"
                    />
                  </a>
                  <a
                    className="icon-btn"
                    href="mailto:noa.tournoy@supinfo.com"
                    aria-label="Écrire un courriel"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="19"
                      height="19"
                      aria-hidden="true"
                      fill="none"
                      stroke="#e7e9e7"
                      strokeWidth="1.8"
                    >
                      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </a>
                </div>
              </div>

              <a
                className="hero-card"
                href="/travaux/eclosion/"
                aria-label="Éclosion — expérience web 3D, 100 % procédurale"
              >
                <picture>
                  <source
                    type="image/webp"
                    srcSet="/travaux/eclosion/img/dawn-700.webp 700w, /travaux/eclosion/img/dawn-1400.webp 1400w"
                    sizes="(min-width: 62rem) 30rem, 100vw"
                  />
                  <img
                    src="/travaux/eclosion/img/dawn.jpg"
                    alt="L'aube d'Éclosion : le soleil affleure l'horizon au-dessus d'un relief procédural."
                    width="1400"
                    height="875"
                  />
                </picture>
              </a>
            </div>
          </div>
        </section>

        <section className="sec band-sec dark band" aria-labelledby="bref">
          <div className="wrap">
            <p className="label" id="bref">
              <span>En bref</span>
            </p>

            <ul className="bref">
              <li className="bref-row">
                <span className="bref-rule" aria-hidden="true"></span>
                <div className="bref-in">
                  <span className="bref-i" aria-hidden="true">
                    _01
                  </span>
                  <span className="bref-k">Maintenant</span>
                  <span className="bref-d">
                    <span className="bref-v">Cycle ingénieur</span>
                    <span className="bref-n">SUPINFO, 2024 → 2029</span>
                  </span>
                </div>
              </li>
              <li className="bref-row">
                <span className="bref-rule" aria-hidden="true"></span>
                <div className="bref-in">
                  <span className="bref-i" aria-hidden="true">
                    _02
                  </span>
                  <span className="bref-k">Octobre 2026</span>
                  <span className="bref-d">
                    <span className="bref-v">Alternance cybersécurité</span>
                    <span className="bref-n">ADEO, Ronchin</span>
                  </span>
                </div>
              </li>
              <li className="bref-row">
                <span className="bref-rule" aria-hidden="true"></span>
                <a className="bref-in" href="#certifications">
                  <span className="bref-i" aria-hidden="true">
                    _03
                  </span>
                  <span className="bref-k">Certifications</span>
                  <span className="bref-d">
                    <span className="bref-v">Quatre titres</span>
                    <span className="bref-n">Looker · LookML · AWS · CCNA</span>
                  </span>
                </a>
              </li>
              <li className="bref-row">
                <span className="bref-rule" aria-hidden="true"></span>
                <a className="bref-in" href="#contact">
                  <span className="bref-i" aria-hidden="true">
                    _04
                  </span>
                  <span className="bref-k">Écrire</span>
                  <span className="bref-d">
                    <span className="bref-v">Me contacter</span>
                    <span className="bref-n">noa.tournoy@supinfo.com</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </section>

        <section
          className="sec band-sec light"
          id="travaux"
          aria-labelledby="h-travaux"
        >
          <div className="wrap">
            <p className="label">Mes travaux</p>
            <h2 className="sec-title" id="h-travaux">
              Du shader au <em>tableau de bord</em>
            </h2>

            <div className="rows-wrap">
              <ol className="rows">
                <li
                  className="row"
                  data-shot="/travaux/eclosion/img/dawn-700.webp"
                >
                  <span className="row-no">_01.</span>
                  <div>
                    <h3 className="row-title">
                      <a href="/travaux/eclosion/">Éclosion</a>
                    </h3>
                    <p className="row-tags">
                      <span>Next.js</span>
                      <span>React Three Fiber</span>
                      <span>GLSL</span>
                      <span>WebAudio</span>
                    </p>
                  </div>
                </li>
                <li className="row" data-none="Confidentiel — ADEO">
                  <span className="row-no">_02.</span>
                  <div>
                    <h3 className="row-title">
                      <a href="/travaux/datasentinel/">DataSentinel</a>
                    </h3>
                    <p className="row-tags">
                      <span>Looker</span>
                      <span>LookML</span>
                      <span>Python</span>
                      <span>BigQuery</span>
                      <span>Terraform</span>
                    </p>
                  </div>
                </li>
                <li
                  className="row"
                  data-none="Dépôts privés — Carton Studio's"
                >
                  <span className="row-no">_03.</span>
                  <div>
                    <h3 className="row-title">
                      <a href="/travaux/supkonquest/">SupKonQuest</a>
                    </h3>
                    <p className="row-tags">
                      <span>Godot 4.6</span>
                      <span>C++20</span>
                      <span>TCP binaire</span>
                      <span>Docker</span>
                    </p>
                  </div>
                </li>
                <li
                  className="row"
                  data-shot="/travaux/ludoria/img/ludoria-katerenga-700.webp"
                >
                  <span className="row-no">_04.</span>
                  <div>
                    <h3 className="row-title">
                      <a href="/travaux/ludoria/">Ludoria</a>
                    </h3>
                    <p className="row-tags">
                      <span>Python</span>
                      <span>Pygame</span>
                      <span>sockets</span>
                      <span>Équipe de trois</span>
                    </p>
                  </div>
                </li>
                <li
                  className="row"
                  data-shot="/travaux/laying-grass/img/console.webp"
                >
                  <span className="row-no">_05.</span>
                  <div>
                    <h3 className="row-title">
                      <a href="/travaux/laying-grass/">laying_grass</a>
                    </h3>
                    <p className="row-tags">
                      <span>C++17</span>
                      <span>STL</span>
                      <span>Zéro dépendance</span>
                    </p>
                  </div>
                </li>
                <li className="row" data-none="TypeScript · React">
                  <span className="row-no">_06.</span>
                  <div>
                    <h3 className="row-title">
                      <a href="/travaux/gamedex/">Gamedex</a>
                    </h3>
                    <p className="row-tags">
                      <span>React</span>
                      <span>TypeScript</span>
                      <span>Vite</span>
                      <span>Cypress</span>
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <p className="mt-lien">
              <a className="more" href="/travaux/">
                Le détail de chaque travail
              </a>
            </p>
          </div>
        </section>

        <section
          className="sec band-sec dark"
          id="parcours"
          aria-labelledby="h-parcours"
        >
          <div className="wrap">
            <p className="label">Parcours</p>
            <h2 className="sec-title" id="h-parcours">
              Du bac NSI à <em>l&apos;alternance cyber</em>.
            </h2>

            <ul className="time">
              <li className="now">
                <span className="when">Oct. 2026</span>
                <div>
                  <p className="what">
                    Alternance cybersécurité{" "}
                    <span className="where">· ADEO, Ronchin</span>
                  </p>
                  <p className="note">
                    En parallèle du cycle ingénieur à SUPINFO.
                  </p>
                </div>
              </li>
              <li>
                <span className="when">Juin → août 2026</span>
                <div>
                  <p className="what">
                    Stage développement{" "}
                    <span className="where">· Never2Wait, Tournai</span>
                  </p>
                  <p className="note">
                    Développement produit. Python, TypeScript, React et Next.js,
                    React Native.
                  </p>
                </div>
              </li>
              <li>
                <span className="when">Juin → août 2025</span>
                <div>
                  <p className="what">
                    Stage DataSentinel{" "}
                    <span className="where">· ADEO, Ronchin</span>
                  </p>
                  <p className="note">
                    Tableau de bord de pilotage de la sécurité des produits
                    digitaux. Looker, LookML, Python, React, BigQuery,
                    Terraform, Kubernetes. Certifications Google Looker et
                    LookML.
                  </p>
                </div>
              </li>
              <li>
                <span className="when">2024 → 2029</span>
                <div>
                  <p className="what">
                    Master of Engineering{" "}
                    <span className="where">
                      · SUPINFO International University
                    </span>
                  </p>
                  <p className="note">Cycle ingénieur informatique, en cours.</p>
                </div>
              </li>
              <li>
                <span className="when">2022</span>
                <div>
                  <p className="what">
                    Stage d&apos;observation{" "}
                    <span className="where">· Proges Plus, Willems</span>
                  </p>
                  <p className="note">
                    Une semaine. L&apos;interface d&apos;un site de gestion RH en
                    HTML et CSS, d&apos;après les maquettes du designer.
                  </p>
                </div>
              </li>
              <li>
                <span className="when">2021 → 2024</span>
                <div>
                  <p className="what">
                    Baccalauréat{" "}
                    <span className="where">· Institut de Genech</span>
                  </p>
                  <p className="note">
                    Mention bien. Spécialités mathématiques et NSI.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section
          className="sec band-sec light"
          id="stack"
          aria-labelledby="h-stack"
        >
          <div className="wrap">
            <p className="label">Stack</p>
            <h2 className="sec-title" id="h-stack">
              Ce que j&apos;utilise, et <em>où ça a servi</em>.
            </h2>

            <ul className="ghosts">
              <li className="ghost-row">
                <p className="ghost-word">Langages</p>
                <ul className="ghost-items">
                  <li>
                    <img src="/assets/icons/python.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    Python
                  </li>
                  <li>
                    <img src="/assets/icons/typescript.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    TypeScript
                  </li>
                  <li>
                    <img src="/assets/icons/javascript.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    JavaScript
                  </li>
                  <li>
                    <img src="/assets/icons/cplusplus.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    C++
                  </li>
                  <li>
                    <img src="/assets/icons/openjdk.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    Java
                  </li>
                  <li>
                    <img src="/assets/icons/mysql.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    SQL
                  </li>
                </ul>
              </li>
              <li className="ghost-row">
                <p className="ghost-word">Web</p>
                <ul className="ghost-items">
                  <li>
                    <img src="/assets/icons/react.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    React
                  </li>
                  <li>
                    <img src="/assets/icons/nextdotjs.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    Next.js
                  </li>
                  <li>
                    <img src="/assets/icons/nodedotjs.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    Node.js
                  </li>
                  <li>
                    <img src="/assets/icons/threedotjs.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    Three.js
                  </li>
                  <li>
                    <img src="/assets/icons/expo.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    Expo
                  </li>
                  <li>
                    <img src="/assets/icons/electron.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    Electron
                  </li>
                </ul>
              </li>
              <li className="ghost-row">
                <p className="ghost-word">Infra</p>
                <ul className="ghost-items">
                  <li>
                    <img src="/assets/icons/docker.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    Docker
                  </li>
                  <li>
                    <img src="/assets/icons/kubernetes.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    Kubernetes
                  </li>
                  <li>
                    <img src="/assets/icons/terraform.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    Terraform
                  </li>
                  <li>
                    <img src="/assets/icons/githubactions.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    GitHub&nbsp;Actions
                  </li>
                  <li>
                    <img src="/assets/icons/vercel.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    Vercel
                  </li>
                  <li>
                    <img src="/assets/icons/git.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    Git
                  </li>
                </ul>
              </li>
              <li className="ghost-row">
                <p className="ghost-word">Données</p>
                <ul className="ghost-items">
                  <li>
                    <img src="/assets/icons/googlebigquery.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    BigQuery
                  </li>
                  <li>
                    <img src="/assets/icons/looker.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    Looker
                  </li>
                  <li>
                    <img src="/assets/icons/postgresql.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    PostgreSQL
                  </li>
                  <li>
                    <img src="/assets/icons/googlecloud.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    Google&nbsp;Cloud
                  </li>
                  <li>
                    <img src="/assets/icons/amazonwebservices.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    AWS
                  </li>
                </ul>
              </li>
              <li className="ghost-row">
                <p className="ghost-word">Jeu &amp; réseau</p>
                <ul className="ghost-items">
                  <li>
                    <img src="/assets/icons/godotengine.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    Godot
                  </li>
                  <li>
                    <img src="/assets/icons/cisco.svg" alt="" width="22" height="22" loading="lazy" decoding="async" />
                    Cisco
                  </li>
                </ul>
              </li>
              <li className="ghost-row">
                <p className="ghost-word">Langues</p>
                <ul className="ghost-items plain">
                  <li>Français</li>
                  <li>Anglais</li>
                </ul>
              </li>
            </ul>

            <p className="mt-lien">
              <a className="more" href="/savoir-faire/">
                Le détail du savoir-faire
              </a>
            </p>
          </div>
        </section>

        <section
          className="sec band-sec dark"
          id="certifications"
          aria-labelledby="h-certs"
        >
          <div className="wrap">
            <p className="label">Certifications</p>
            <h2 className="sec-title" id="h-certs">
              Quatre titres, <em>tous vérifiables</em>.
            </h2>

            <ul className="certs">
              <li className="cert">
                <span className="cert-org">Google</span>
                <h3 className="cert-name">Looker</h3>
                <p className="cert-note">
                  Modélisation et exploration de données
                </p>
                <span className="cert-when">2025</span>
              </li>
              <li className="cert">
                <span className="cert-org">Google</span>
                <h3 className="cert-name">LookML</h3>
                <p className="cert-note">Langage de modélisation sémantique</p>
                <span className="cert-when">2025</span>
              </li>
              <li className="cert">
                <span className="cert-org">AWS Academy</span>
                <h3 className="cert-name">Cloud Foundations</h3>
                <p className="cert-note">Graduate, fondamentaux du cloud</p>
                <span className="cert-when">Badge de formation</span>
              </li>
              <li className="cert">
                <span className="cert-org">Cisco</span>
                <h3 className="cert-name">Introduction to Networks</h3>
                <p className="cert-note">
                  Réseaux, adressage et commutation
                </p>
                <span className="cert-when">CCNA</span>
              </li>
            </ul>
          </div>
        </section>

        <section
          className="sec band-sec light"
          id="contact"
          aria-labelledby="h-contact"
        >
          <div className="wrap">
            <div className="cta">
              <p className="label">Contact</p>
              <h2 id="h-contact">
                Une question technique, une collaboration,
                <br />
                ou juste un des travaux qui vous a arrêté ?
              </h2>
              <div className="cta-links">
                <a className="btn" href="mailto:noa.tournoy@supinfo.com">
                  noa.tournoy@supinfo.com
                </a>
                <a
                  className="btn ghost"
                  href="https://www.linkedin.com/in/noa-tournoy/"
                >
                  LinkedIn
                </a>
                <a className="btn ghost" href="https://github.com/Noa-trny">
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="menu" id="menu" hidden>
        <button className="menu-close" type="button">
          Fermer
        </button>
        <div className="menu-panel">
          <nav aria-label="Sections">
            <a href="#travaux">Travaux</a>
            <a href="#parcours">Parcours</a>
            <a href="#stack">Stack</a>
            <a href="#certifications">Certifications</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </div>

      <a className="side-mail" href="mailto:noa.tournoy@supinfo.com">
        noa.tournoy@supinfo.com
      </a>

      <footer className="foot dark">
        <div className="wrap foot-in">
          <span>Noa Tournoy — Lille, France</span>
          <span>
            <a href="https://eclosion.noatournoy.dev">Éclosion</a> ·{" "}
            <a href="/travaux/">Travaux</a> · <a href="/contact/">Contact</a>
          </span>
        </div>
      </footer>
    </>
  );
}

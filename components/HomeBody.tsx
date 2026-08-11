import type { Locale } from "@/content/routes";
import { pair, routes } from "@/content/routes";
import { home, type EmTitle } from "@/content/home";
import { ui } from "@/content/ui";
import { Footer, LangSwitch, MenuDrawer, Skip } from "./chrome/Chrome";
import { WorkRows } from "./WorkRows";

// Le corps de l'accueil, partage par les deux langues. Tout son texte vient de
// content/home.ts, extrait mecaniquement des deux anciens index.html.
//
// L'accueil ne pose PAS son entete dans un `.head-band` comme les pages
// interieures : elle vit a l'interieur de la section hero. D'ou l'entete ecrite
// ici plutot que le composant Header.

/** Le titre de section et son `<em>`, qui porte le vert acide. */
function SecTitle({ id, title }: { id: string; title: EmTitle }) {
  return (
    <h2 className="sec-title" id={id}>
      {title.before}
      {title.em ? <em>{title.em}</em> : null}
      {title.after}
    </h2>
  );
}

export function HomeBody({ locale }: { locale: Locale }) {
  const c = home[locale];
  const self = pair.home;

  return (
    <>
      <Skip locale={locale} />

      <main>
        <section className="hero light band-sec" aria-labelledby="titre">
          <header className="tophead wrap">
            <a className="mark" href={routes.home[locale]}>
              {ui.mark[locale]}
            </a>
            <div className="tophead-right">
              <LangSwitch pair={self} locale={locale} />
              <button
                className="menu-btn"
                type="button"
                aria-expanded="false"
                aria-controls="menu"
              >
                {ui.menuOpen[locale]}
              </button>
            </div>
          </header>

          <div className="wrap hero-in" id="contenu" tabIndex={-1}>
            <div className="hero-grid">
              <div className="hero-text">
                <h1 id="titre">Noa Tournoy</h1>
                <p className="hero-sub">
                  {c.heroSub.map((s, i) =>
                    s.b ? <b key={i}>{s.t}</b> : <span key={i}>{s.t}</span>
                  )}
                </p>

                <div className="hero-actions">
                  <a className="btn" href="#travaux">
                    {c.heroCta}
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
                    aria-label={c.mailLabel}
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
                href={routes.project[locale]("eclosion")}
                aria-label={c.heroCardLabel}
              >
                <picture>
                  <source
                    type="image/webp"
                    srcSet="/travaux/eclosion/img/dawn-700.webp 700w, /travaux/eclosion/img/dawn-1400.webp 1400w"
                    sizes="(min-width: 62rem) 30rem, 100vw"
                  />
                  {/* Le repli pointait un JPEG de 120 Ko que plus aucun
                      navigateur ne demandait. */}
                  <img
                    src="/travaux/eclosion/img/dawn-1400.webp"
                    alt={c.heroCardAlt}
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
              <span>{c.labels.bref}</span>
            </p>

            <ul className="bref">
              {c.bref.map((r) => {
                const inner = (
                  <>
                    <span className="bref-i" aria-hidden="true">
                      {r.i}
                    </span>
                    <span className="bref-k">{r.k}</span>
                    <span className="bref-d">
                      <span className="bref-v">{r.v}</span>
                      <span className="bref-n">{r.n}</span>
                    </span>
                  </>
                );
                return (
                  <li className="bref-row" key={r.i}>
                    <span className="bref-rule" aria-hidden="true" />
                    {r.href ? (
                      <a className="bref-in" href={r.href}>
                        {inner}
                      </a>
                    ) : (
                      <div className="bref-in">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section
          className="sec band-sec light"
          id="travaux"
          aria-labelledby="h-travaux"
        >
          <div className="wrap">
            <p className="label">{c.labels.travaux}</p>
            <SecTitle id="h-travaux" title={c.titles.travaux} />
            <WorkRows locale={locale} variant="tags" />
            <p className="mt-lien">
              <a className="more" href={routes.work[locale]}>
                {c.moreWork}
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
            <p className="label">{c.labels.parcours}</p>
            <SecTitle id="h-parcours" title={c.titles.parcours} />
            <ul className="time">
              {c.time.map((m) => (
                <li key={m.when} className={m.now ? "now" : undefined}>
                  <span className="when">{m.when}</span>
                  <div>
                    <p className="what">
                      {m.what} <span className="where">{m.where}</span>
                    </p>
                    <p className="note">{m.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="sec band-sec light"
          id="stack"
          aria-labelledby="h-stack"
        >
          <div className="wrap">
            <p className="label">{c.labels.stack}</p>
            <SecTitle id="h-stack" title={c.titles.stack} />
            <ul className="ghosts">
              {c.stack.map((g) => (
                <li className="ghost-row" key={g.word}>
                  <p className="ghost-word">{g.word}</p>
                  <ul
                    className={g.plain ? "ghost-items plain" : "ghost-items"}
                  >
                    {g.items.map((it) => (
                      <li key={it.name}>
                        {it.icon ? (
                          <img
                            src={it.icon}
                            alt=""
                            width="22"
                            height="22"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : null}
                        {it.name}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <p className="mt-lien">
              <a className="more" href={routes.skills[locale]}>
                {c.moreSkills}
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
            <p className="label">{c.labels.certs}</p>
            <SecTitle id="h-certs" title={c.titles.certs} />
            <ul className="certs">
              {c.certs.map((cert) => (
                <li className="cert" key={cert.name}>
                  <span className="cert-org">{cert.org}</span>
                  <h3 className="cert-name">{cert.name}</h3>
                  <p className="cert-note">{cert.note}</p>
                  <span className="cert-when">{cert.when}</span>
                </li>
              ))}
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
              <p className="label">{c.contactLabel}</p>
              <h2 id="h-contact">
                {c.contactTitle.map((line, i) => (
                  <span key={i}>
                    {i > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
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

      {/* L'accueil a son propre menu : cinq ancres vers ses sections, la ou
          les pages interieures listent quatre destinations du site. */}
      <MenuDrawer locale={locale} variant="sections" />

      <a className="side-mail" href="mailto:noa.tournoy@supinfo.com">
        noa.tournoy@supinfo.com
      </a>

      <Footer locale={locale} />
    </>
  );
}

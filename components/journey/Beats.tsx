import type { Locale } from "@/content/routes";
import { routes } from "@/content/routes";
import { home } from "@/content/home";
import { ui } from "@/content/ui";

// Les quelques mots de la visite.
//
// Trois blocs sur toute la hauteur, pas un site. C'est la lecon des deux
// references : chez itomdev tout est dans le monde, chez affanahmer le texte
// est rare et compose avec la scene. Ce qui n'allait pas dans ma version
// precedente n'etait pas le HTML, c'etait la QUANTITE — j'avais garde le
// portfolio entier et je l'avais pose sur le canvas.
//
// Le contenu complet reste dans le document, juste en dessous et invisible :
// c'est lui qui porte le referencement et le clavier. Ces blocs-ci ne font que
// ponctuer le trajet.
//
// Positionnes en pourcentage de la hauteur du voyage, donc synchronises avec la
// camera sans une seule ligne de JavaScript par frame.

type Beat = {
  readonly t: number;
  readonly cote: "gauche" | "droite";
  readonly contenu: React.ReactNode;
};

export function Beats({ locale }: { locale: Locale }) {
  const c = home[locale];

  const beats: Beat[] = [
    {
      // Juste apres la stele, quand la camera longe les premieres vitrines.
      t: 0.26,
      cote: "droite",
      contenu: (
        <>
          <span className="beat-etiq">{c.labels.travaux}</span>
          <p className="beat-titre">
            {c.titles.travaux.before}
            <em>{c.titles.travaux.em}</em>
            {c.titles.travaux.after}
          </p>
          <a className="beat-lien" href={routes.work[locale]}>
            {c.moreWork}
          </a>
        </>
      ),
    },
    {
      // A l'approche de la baie : ce qu'il y a derriere la vitre.
      t: 0.62,
      cote: "gauche",
      contenu: (
        <>
          <span className="beat-etiq">{c.labels.parcours}</span>
          <p className="beat-titre">
            {c.titles.parcours.before}
            <em>{c.titles.parcours.em}</em>
            {c.titles.parcours.after}
          </p>
          <a className="beat-lien" href={routes.skills[locale]}>
            {c.moreSkills}
          </a>
        </>
      ),
    },
    {
      // Une fois dedans, la fin de la visite.
      t: 0.93,
      cote: "gauche",
      contenu: (
        <>
          <span className="beat-etiq">{c.contactLabel}</span>
          <p className="beat-titre">{c.contactTitle[0]}</p>
          <div className="beat-liens">
            <a href="mailto:noa.tournoy@supinfo.com">
              noa.tournoy@supinfo.com
            </a>
            <a href="https://www.linkedin.com/in/noa-tournoy/">LinkedIn</a>
            <a href="https://github.com/Noa-trny">GitHub</a>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="journey-beats" aria-hidden="true">
      {beats.map((b) => (
        <div
          key={b.t}
          className={`beat beat-${b.cote}`}
          // En ligne parce que c'est une donnee, pas un style : la position de
          // chaque bloc appartient au recit, au meme titre que les points de la
          // courbe de camera.
          style={{ top: `${b.t * 100}%` }}
        >
          {b.contenu}
        </div>
      ))}
      {/* L'invitation a defiler, sur le premier ecran seulement. */}
      <div className="beat-amorce">
        <span>{ui.suite[locale] === "Next" ? "Scroll" : "Défilez"}</span>
        <i />
      </div>
    </div>
  );
}

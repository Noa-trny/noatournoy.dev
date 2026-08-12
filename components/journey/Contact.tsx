"use client";

import type { Locale } from "@/content/routes";
import { home } from "@/content/home";
import { useJourney } from "@/scene/scroll/journeyStore";

// L'ecran de contact, au bout du voyage.
//
// Le plan le placait dans le garage : la camera devait y finir sa course, face
// a la voiture. La villa a decide autrement — son garage est au PIED de la
// colline, donc du cote de l'arrivee, et le trajet le depasse dans les
// premieres secondes. Le voyage se termine dans le sejour, la ou l'espace
// s'ouvre en largeur. C'est donc la que le contact vit, et le raisonnement du
// plan tient toujours : la camera y est quasi immobile, si bien qu'une
// surcouche fixe et un panneau ancre dans la scene sont indiscernables a l'oeil
// — et la surcouche ne coute rien par image.
//
// DE VRAIS LIENS, PAS UNE IMAGE DE LIENS. Les blocs de texte du voyage sont
// `aria-hidden` parce qu'ils redisent ce que le document porte deja ; ceux-ci
// sont le contraire. Ils sont focalisables, cliquables, et reprennent le
// balisage `.btn` du site pour ne pas inventer un second bouton.

export function Contact({ locale }: { locale: Locale }) {
  const phase = useJourney((s) => s.phase);
  const c = home[locale];
  const ouvert = phase === "dedans";

  return (
    <div
      className="journey-contact"
      data-ouvert={ouvert ? "oui" : "non"}
      // `inert` ET `visibility` plutot qu'une simple opacite.
      //
      // La nuance compte, et elle est l'exact oppose du choix fait pour les
      // liens vers les travaux. Ceux-la doivent rester atteignables au clavier
      // a tout moment, puisque c'est le focus qui fait avancer la camera
      // jusqu'a eux. Ici, rien ne doit reveler le contact avant la fin : un
      // element seulement transparent resterait dans l'ordre de tabulation et
      // un lecteur d'ecran l'annoncerait des l'arrivee.
      inert={!ouvert}
      aria-hidden={!ouvert}
    >
      <p className="journey-contact-etiq">{c.contactLabel}</p>
      <h2 className="journey-contact-titre">
        {c.contactTitle.map((ligne, i) => (
          <span key={i}>
            {i > 0 ? <br /> : null}
            {ligne}
          </span>
        ))}
      </h2>
      <div className="journey-contact-liens">
        <a className="btn" href="mailto:noa.tournoy@supinfo.com">
          noa.tournoy@supinfo.com
        </a>
        <a className="btn ghost" href="https://www.linkedin.com/in/noa-tournoy/">
          LinkedIn
        </a>
        <a className="btn ghost" href="https://github.com/Noa-trny">
          GitHub
        </a>
      </div>
    </div>
  );
}

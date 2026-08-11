"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Les animations de defilement. Portage de scripts/kinetic.js.
//
// Les deux regles de l'original ne se negocient toujours pas :
//
// 1. uniquement transform et opacity — rien qui change une largeur, donc rien
//    qui relayoute pendant qu'on lit ;
// 2. une revelation declenchee une seule fois passe par fromTo SANS rendu
//    immediat : un declencheur muet laisse le contenu a son etat normal, jamais
//    invisible. Une animation scrubbee fait l'inverse — sa tete de lecture est
//    posee des l'initialisation, et differer le rendu ferait sauter les
//    elements a leur etat de depart en plein defilement.
//
// Sans JavaScript, la page est deja complete.
//
// Ce que le portage change, et pourquoi :
//
// - Le decoupage des mots a remonte cote serveur (components/motion/Split.tsx) :
//   plus de mutation de noeuds que React possede, et zero reflow a l'init.
// - La jauge, le halo des certifications et le rail des frises sont dans le
//   balisage plutot qu'injectes ici.
// - `useGSAP` avec `dependencies: [pathname]` et `revertOnUpdate` : apres une
//   navigation cote client, le DOM est neuf et les anciens ScrollTrigger
//   pointent des elements disparus. `ScrollTrigger.refresh()` ne suffirait pas —
//   il recalcule des positions sur des cibles mortes. Il faut REVERTER le
//   contexte et le reconstruire.

gsap.registerPlugin(useGSAP, ScrollTrigger);

type RevealOpts = {
  trigger: Element | null;
  duration?: number;
  stagger?: number;
  ease?: string;
  start?: string;
};

export function Kinetics() {
  const pathname = usePathname();
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ScrollTrigger.config({ ignoreMobileResize: true });

      // La police variable change les metriques a la bascule : les positions
      // calculees avant sont fausses.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* revelation sure : l'etat de depart n'est pose qu'au declenchement */
        function reveal(
          targets: ArrayLike<Element> | Element[],
          from: gsap.TweenVars,
          opts: RevealOpts
        ) {
          const list = Array.from(targets);
          if (!list.length || !opts.trigger) return;
          gsap.fromTo(list, from, {
            opacity: 1,
            x: 0,
            y: 0,
            yPercent: 0,
            scale: 1,
            duration: opts.duration ?? 0.65,
            stagger: opts.stagger ?? 0,
            ease: opts.ease ?? "power2.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: opts.trigger,
              // Toujours au bas du cadre. Avec un rendu differe, GSAP ne pose
              // l'etat de depart qu'au moment ou le declencheur part : si ce
              // moment arrive alors que l'element est deja visible, on le voit
              // disparaitre d'un coup avant de reapparaitre. Declencher sous la
              // ligne de flottaison met ce saut hors champ.
              start: opts.start ?? "top bottom",
              once: true,
            },
          });
        }

        /* Sur une liste haute, declencher sur le conteneur fait jouer les
           dernieres lignes bien avant qu'on les atteigne. Chacune porte donc
           son propre declencheur. */
        function revelerChacun(
          els: ArrayLike<Element>,
          from: gsap.TweenVars,
          opts: Omit<RevealOpts, "trigger">
        ) {
          Array.from(els).forEach((el) =>
            reveal([el], from, { ...opts, trigger: el, stagger: 0 })
          );
        }

        const q = <T extends Element>(sel: string) =>
          document.querySelectorAll<T>(sel);

        /* ---- projecteur au curseur ---------------------------------- */

        if (window.matchMedia("(hover: hover)").matches) {
          q<HTMLElement>(".row, .cert").forEach((el) => {
            el.addEventListener("pointermove", (e) => {
              const r = el.getBoundingClientRect();
              el.style.setProperty("--mx", `${e.clientX - r.left}px`);
              el.style.setProperty("--my", `${e.clientY - r.top}px`);
            });
          });

          /* boutons magnetiques */
          q<HTMLElement>(".btn").forEach((b) => {
            const qx = gsap.quickTo(b, "x", {
              duration: 0.35,
              ease: "power3.out",
            });
            const qy = gsap.quickTo(b, "y", {
              duration: 0.35,
              ease: "power3.out",
            });
            b.addEventListener("pointermove", (e) => {
              const r = b.getBoundingClientRect();
              qx((e.clientX - r.left - r.width / 2) * 0.28);
              qy((e.clientY - r.top - r.height / 2) * 0.4);
            });
            b.addEventListener("pointerleave", () => {
              qx(0);
              qy(0);
            });
          });
        }

        /* ---- certifications ----------------------------------------- */

        reveal(
          q(".cert"),
          { opacity: 0, y: 32, scale: 0.97 },
          { trigger: document.querySelector(".certs"), duration: 0.6, stagger: 0.08 }
        );

        /* ---- jauge de progression ----------------------------------- */

        const bar = document.querySelector(".progress i");
        if (bar) {
          gsap.to(bar, {
            yPercent: 355,
            ease: "none",
            scrollTrigger: { start: 0, end: "max", scrub: 0.25 },
          });
        }

        /* ---- le ciel derive avec le defilement ----------------------- */

        const heroLight = document.querySelector(".hero.light");
        if (heroLight) {
          ScrollTrigger.create({
            trigger: heroLight,
            start: "bottom 60px",
            onEnter: () => document.body.classList.add("past-hero"),
            onLeaveBack: () => document.body.classList.remove("past-hero"),
          });
        }

        /* ---- en bref : le mot se remplit au defilement --------------- */

        /* Le mot se remplit sur un seul rendu de texte : un degrade decoupe a
           la forme des lettres, dont on deplace la position. Superposer deux
           calques de texte revenait a melanger deux anticrenelages sous-pixel —
           lisere colore et scintillement. */
        const bref = document.querySelector(".bref");
        if (bref) {
          /* Ici le rendu immediat est VOULU, contrairement aux revelations
             « once ». Sans lui, une colonne dont le tween n'a pas encore
             demarre garde son etat naturel — pleine — puis saute d'un coup a
             son etat de depart quand son tour arrive : le mot se vide
             brutalement en plein defilement. Un scrub place sa tete de lecture
             des l'initialisation, donc l'etat de depart n'est jamais celui qui
             reste affiche. */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: bref,
                start: "top 86%",
                end: "top 42%",
                scrub: 0.5,
              },
            })
            .fromTo(
              bref.querySelectorAll(".bref-rule"),
              { scaleY: 0 },
              { scaleY: 1, ease: "none", stagger: 0.08 },
              0
            )
            .fromTo(
              bref.querySelectorAll(".bref-k"),
              { "--fill": "0%" },
              { "--fill": "100%", ease: "none", stagger: 0.12 },
              0.05
            )
            .fromTo(
              bref.querySelectorAll(".bref-d"),
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, ease: "power2.out", stagger: 0.1 },
              0.28
            );
        }

        /* ---- les lignes de la liste entrent une a une ---------------- */

        revelerChacun(q(".row"), { opacity: 0, y: 26 }, { duration: 0.6 });
        revelerChacun(q(".ghost-row"), { opacity: 0, x: -22 }, { duration: 0.6 });

        /* ---- premier ecran ------------------------------------------ */
        /* joue au chargement, sans declencheur : `from` est sur ici */

        const hero = document.querySelector(".hero");
        if (hero) {
          const h1 = hero.querySelector("h1");
          const words = h1 ? h1.querySelectorAll(".wi") : [];
          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

          // L'original interrogeait `.label` et `.hero-meta` dans le hero ;
          // l'accueil n'en a aucun des deux. On garde l'intention en sautant
          // les cibles absentes plutot qu'en passant `null` a GSAP.
          const label = hero.querySelector(".label");
          if (label) tl.from(label, { opacity: 0, y: 14, duration: 0.5 });
          if (words.length) {
            tl.from(
              words,
              { opacity: 0, yPercent: 135, duration: 0.9, stagger: 0.05 },
              label ? "-=0.25" : 0
            );
          }
          const sub = hero.querySelector(".hero-sub");
          if (sub) tl.from(sub, { opacity: 0, y: 18, duration: 0.6 }, "-=0.45");
          const meta = hero.querySelector(".hero-meta");
          if (meta) tl.from(meta, { opacity: 0, y: 14, duration: 0.5 }, "-=0.4");

          /* le titre s'echappe ; l'accroche reste lisible */
          if (h1) {
            gsap.to(h1, {
              yPercent: -14,
              ease: "none",
              scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom top",
                scrub: 0.5,
              },
            });
          }
        }

        /* ---- titres et etiquettes ----------------------------------- */

        q(".sec-title").forEach((title) => {
          reveal(
            title.querySelectorAll(".wi"),
            { opacity: 0, yPercent: 135 },
            { trigger: title, duration: 0.85, stagger: 0.04, ease: "power3.out" }
          );
        });

        q(".label").forEach((l) => {
          if (l.closest(".hero")) return;
          reveal([l], { opacity: 0, x: -12 }, { trigger: l, duration: 0.5 });
        });

        /* ---- frises : le rail se trace, les lignes suivent ----------- */

        q(".time").forEach((list) => {
          const rail = list.querySelector(".time-rail");
          if (rail) {
            gsap.to(rail, {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: list,
                start: "top 80%",
                end: "bottom 60%",
                scrub: 0.4,
              },
            });
          }
          revelerChacun(
            list.querySelectorAll(":scope > li"),
            { opacity: 0, x: 18 },
            { duration: 0.55 }
          );
        });

        /* ---- appel final -------------------------------------------- */

        const cta = document.querySelector(".cta");
        if (cta) {
          reveal([cta], { opacity: 0, y: 36 }, { trigger: cta, duration: 0.7 });
          reveal(
            cta.querySelectorAll(".btn"),
            { opacity: 0, y: 14 },
            { trigger: cta, duration: 0.45, stagger: 0.08 }
          );
        }
      });

      // Le contexte matchMedia a son propre cycle de vie : `useGSAP` reverte
      // les tweens de son scope, pas les media queries.
      return () => mm.revert();
    },
    { scope, dependencies: [pathname], revertOnUpdate: true }
  );

  // Un noeud vide, uniquement pour donner un scope a useGSAP. Tout ce qui est
  // anime vit ailleurs dans la page : le scope ne sert qu'au nettoyage.
  return <div ref={scope} hidden />;
}

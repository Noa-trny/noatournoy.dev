"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { Locale } from "@/content/routes";
import { PROJECTS } from "@/content/projects";

// La vignette qui suit le curseur le long de la liste des travaux.
//
// L'ancienne version lisait `data-shot` / `data-none` sur chaque ligne et
// construisait la vignette noeud par noeud — jamais par concatenation de HTML —
// avec un garde sur le chemin de l'image, parce qu'une valeur venue d'ailleurs
// que du balisage aurait pu ouvrir une faille. Ce garde disparait ici sans rien
// perdre : la source n'est plus le DOM mais PROJECTS, un tableau typé du depot.
// Le probleme est resolu par construction plutot que par verification.
//
// Le rendu passe par React ; seule la position reste pilotee par GSAP, parce
// qu'elle change a chaque frame et n'a rien a faire dans un etat de composant.

type Shown = { slug: string; title: string } | null;

export function RowPeek({ locale }: { locale: Locale }) {
  const peek = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<Shown>(null);

  useEffect(() => {
    const el = peek.current;
    const wrap = el?.parentElement;
    if (!el || !wrap) return;
    // Une vignette qui suit le curseur n'a aucun sens sans curseur.
    if (!window.matchMedia("(hover: hover)").matches) return;

    gsap.set(el, { yPercent: -50, scale: 0.96, opacity: 0 });
    const slide = gsap.quickTo(el, "top", {
      duration: 0.45,
      ease: "power3.out",
      unit: "px",
    });

    let courant: string | null = null;
    const rows = Array.from(wrap.querySelectorAll<HTMLElement>(".row"));
    const off: (() => void)[] = [];

    rows.forEach((row) => {
      const slug = row.dataset.slug;
      if (!slug) return;
      const enter = () => {
        if (courant === slug) return;
        const premier = courant === null;
        courant = slug;
        const p = PROJECTS.find((x) => x.slug === slug);
        if (p) setShown({ slug, title: p.title });

        /* la vignette s'ancre a droite et glisse d'une ligne a l'autre */
        const centre = row.offsetTop + row.offsetHeight / 2;
        if (premier) gsap.set(el, { top: centre });
        else slide(centre);
        gsap.to(el, {
          opacity: 1,
          scale: 1,
          yPercent: -50,
          duration: 0.35,
          ease: "power3.out",
        });
      };
      row.addEventListener("pointerenter", enter);
      off.push(() => row.removeEventListener("pointerenter", enter));
    });

    const leave = () => {
      courant = null;
      gsap.to(el, {
        opacity: 0,
        scale: 0.96,
        yPercent: -50,
        duration: 0.28,
        ease: "power2.out",
      });
    };
    wrap.addEventListener("pointerleave", leave);
    off.push(() => wrap.removeEventListener("pointerleave", leave));

    return () => {
      off.forEach((f) => f());
      gsap.killTweensOf(el);
    };
  }, []);

  const p = shown ? PROJECTS.find((x) => x.slug === shown.slug) : null;

  return (
    <div className="peek" aria-hidden="true" ref={peek}>
      {p ? (
        p.peek.kind === "shot" ? (
          <img src={p.peek.src} alt="" />
        ) : (
          <div className="none">
            <b>{p.title}</b>
            <span>{p.peek.label[locale]}</span>
          </div>
        )
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

// La revelation au defilement, en trente lignes plutot qu'en quarante kilooctets.
//
// Framer Motion ferait la meme chose, et la demande le mentionnait — mais il
// pese davantage que tout le JavaScript actuel de ce site reuni, pour un effet
// qui tient dans un `IntersectionObserver` et deux classes CSS. Le budget
// d'octets de ce portfolio est une de ses proprietes, pas un detail.
//
// L'observateur est DECONNECTE des qu'il a servi : garder un observateur vivant
// par element revelé, sur une page qui en compte une trentaine, fait travailler
// le navigateur a chaque defilement pour des elements dont le sort est scelle.
//
// Le mouvement reduit est traite en CSS et non ici : la regle `@media` de
// `app.css` neutralise l'opacite et la transformation, si bien que le contenu
// est visible meme si ce composant ne s'execute jamais — sans JavaScript, par
// exemple.

export function Reveal({
  children,
  delai = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Retard en millisecondes, pour echelonner une grille. */
  delai?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement>(null);
  const [vu, setVu] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // `IntersectionObserver` manque sur des navigateurs tres anciens : plutot
    // que de laisser le contenu invisible, on le montre tout de suite.
    if (typeof IntersectionObserver === "undefined") {
      setVu(true);
      return;
    }
    const io = new IntersectionObserver(
      (entrees) => {
        // `entrees[0]` et non un parametre destructure : `noUncheckedIndexedAccess`
        // rend l'element possiblement absent, et il l'est reellement — le
        // rappel peut etre invoque avec un tableau vide lors d'un demontage.
        const e = entrees[0];
        if (!e?.isIntersecting) return;
        setVu(true);
        io.disconnect();
      },
      // `-12%` en bas : l'element se revele quand il est franchement entre dans
      // le cadre, pas au moment ou son premier pixel affleure.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`revele ${vu ? "revele-vu" : ""} ${className}`}
      style={delai ? { transitionDelay: `${delai}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

"use client";

import { Suspense, lazy, useEffect, useState } from "react";
import type { Locale } from "@/content/routes";
import { refusDe3D } from "@/scene/capability";
import { Repere } from "./Repere";

const Bureau = lazy(() => import("@/scene/bureau/Bureau"));

// LE MONDE, ET SON REPLI.
//
// La decision porteuse, et la seule chose que trois refontes n'ont pas entamee :
// LE SERVEUR REND LE REPLI. Ce qui part de Vercel, c'est le portfolio sombre
// complet — six liens vers les travaux, la frise, la stack, le contact. Le
// bureau 3D est une AMELIORATION appliquee apres hydratation.
//
// Un seul chemin de code couvre donc sans-JavaScript, sans-WebGL, mouvement
// reduit, machine lente, rendu logiciel et robot d'indexation. Correct par
// defaut, plutot que correct parce qu'on a pense a six cas.
//
// `useState(false)` EST LE POINT LE PLUS IMPORTANT. Le serveur et le PREMIER
// rendu client produisent le meme arbre — le repli, rien d'autre. Toute lecture
// de `window`, `matchMedia` ou `navigator` PENDANT le rendu serait une
// divergence d'hydratation par construction ; elles vivent donc dans un effet.

export function Monde({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [actif, setActif] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluer = () => {
      const refus = refusDe3D();
      setActif(refus === null);
      // Journalise TOUJOURS, pas seulement en developpement : quand la scene ne
      // s'affiche pas chez quelqu'un d'autre, c'est la seule chose qui
      // distingue « la machine a refuse » de « ça a plante ».
      if (refus !== null) console.warn(`[bureau] canvas non monté : ${refus}`);
    };
    evaluer();
    mq.addEventListener("change", evaluer);
    return () => mq.removeEventListener("change", evaluer);
  }, []);

  return (
    <div data-3d={actif ? "on" : "off"} className="monde">
      {actif ? (
        <Suspense fallback={null}>
          <Bureau locale={locale} />
        </Suspense>
      ) : null}
      {actif ? <Repere locale={locale} /> : null}

      {/* Le site complet, TOUJOURS rendu et jamais retire. Invisible quand le
          bureau est la, il revient au focus — `opacity` et non `display: none`,
          qui le sortirait de l'ordre de tabulation. */}
      <div className="monde-dom">{children}</div>
    </div>
  );
}

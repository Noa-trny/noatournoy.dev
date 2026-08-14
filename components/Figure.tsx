import type { ReactNode } from "react";

// Une capture avec sa legende.
//
// `<picture>` n'est pas decoratif : `.figure picture` porte le rayon et
// `overflow: hidden` dans spec.css. Le retirer arrondirait plus rien.
//
// Le repli `src` pointe desormais sur le WebP le plus large et non sur un JPEG.
// L'ancien site embarquait 1,26 Mo de JPEG qui n'ont servi a personne depuis
// que WebP est universel (Safari 14, 2020) : ils n'etaient que le repli d'un
// <source> que tous les navigateurs savent lire.

type FigureProps = {
  /** Les variantes WebP, de la plus etroite a la plus large. */
  readonly srcSet: string;
  readonly sizes: string;
  /** Le repli, servi aux rares agents sans <picture>. */
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly caption?: ReactNode;
  /** `mt-bloc` sur les figures qui respirent seules dans le flux. */
  readonly bloc?: boolean;
};

export function Figure({
  srcSet,
  sizes,
  src,
  alt,
  width,
  height,
  caption,
  bloc = false,
}: FigureProps) {
  return (
    <figure className={bloc ? "figure mt-bloc" : "figure"}>
      <picture>
        <source type="image/webp" srcSet={srcSet} sizes={sizes} />
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
        />
      </picture>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

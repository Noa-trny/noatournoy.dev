import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { alternates, isSlug, pair, SLUGS } from "@/content/routes";
import { bySlug } from "@/content/projects";
import { prose } from "@/content/prose";
import { ProjectPage } from "@/components/ProjectPage";

// Une fiche de travail, en francais. Le gabarit ProjectPage produit l'entete, le
// bloc de titre et la navigation de fin ; content/prose/fr/<slug>.tsx fournit le
// corps ; content/projects.ts fournit tout le reste.

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isSlug(slug)) return {};
  const p = bySlug(slug);
  const c = p.copy.fr;
  const url = pair.project(slug).fr;

  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: alternates(pair.project(slug), "fr"),
    openGraph: {
      // Les fiches sont des articles, les pages de section des sites.
      type: "article",
      title: c.metaTitle,
      description: c.ogDescription,
      url,
      locale: "fr_FR",
      images: [p.ogImage ?? "/og.png"],
    },
  };
}

export default async function Travail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  // `generateStaticParams` ne ferme pas la route : sans ce garde, un slug
  // inconnu rendrait une page vide en 200 au lieu d'un vrai 404.
  if (!isSlug(slug)) notFound();

  return (
    <ProjectPage slug={slug} locale="fr" sections={prose.fr[slug]} />
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { alternates, isSlug, pair, SLUGS, type Slug } from "@/content/routes";

// Ossature de fiche de travail. Le corps de prose arrive en phase 3 depuis
// content/prose/fr/<slug>.tsx ; ici on ne fixe que le contrat d'URL.

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
  return { alternates: alternates(pair.project(slug), "fr") };
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
  const s: Slug = slug;

  return (
    <main id="contenu" tabIndex={-1}>
      <h1>{s}</h1>
    </main>
  );
}

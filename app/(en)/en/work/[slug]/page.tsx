import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { alternates, isSlug, pair, SLUGS, type Slug } from "@/content/routes";

// Le pendant anglais de app/(fr)/travaux/[slug]/page.tsx. Les six slugs sont
// identiques dans les deux langues — seul le segment parent change.

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
  return { alternates: alternates(pair.project(slug), "en") };
}

export default async function Work({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();
  const s: Slug = slug;

  return (
    <main id="contenu" tabIndex={-1}>
      <h1>{s}</h1>
    </main>
  );
}

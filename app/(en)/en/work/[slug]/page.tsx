import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { alternates, isSlug, pair, SLUGS } from "@/content/routes";
import { bySlug } from "@/content/projects";
import { prose } from "@/content/prose";
import { ProjectPage } from "@/components/ProjectPage";

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
  const p = bySlug(slug);
  const c = p.copy.en;
  const url = pair.project(slug).en;

  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: alternates(pair.project(slug), "en"),
    openGraph: {
      type: "article",
      title: c.metaTitle,
      description: c.ogDescription,
      url,
      locale: "en_US",
      images: [p.ogImage ?? "/og.png"],
    },
  };
}

export default async function Work({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();

  return (
    <ProjectPage slug={slug} locale="en" sections={prose.en[slug]} />
  );
}

import { Home } from "@/components/home/Home";

// The English home page. See app/(fr)/page.tsx for the reasoning; the content
// lives in content/home.ts and content/projects.ts, and the page only picks the
// language.

export default function HomePage() {
  return <Home locale="en" />;
}

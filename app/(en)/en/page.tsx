import { sectionsAccueil } from "@/components/home/Home";
import { Monde } from "@/components/bureau/Monde";

// The English home page. See app/(fr)/page.tsx for the reasoning: the server
// renders the full portfolio, the 3D desk is layered on after hydration, and
// the sections are laid out along the scroll track station by station.

export default function HomePage() {
  return <Monde locale="en" sections={sectionsAccueil("en")} />;
}

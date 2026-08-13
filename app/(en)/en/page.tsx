import { Home } from "@/components/home/Home";
import { Monde } from "@/components/bureau/Monde";

// The English home page. See app/(fr)/page.tsx for the reasoning: the server
// renders the full portfolio, the 3D desk is layered on after hydration.

export default function HomePage() {
  return (
    <Monde locale="en">
      <Home locale="en" />
    </Monde>
  );
}

import { HomeBody } from "@/components/HomeBody";
import { Journey } from "@/components/journey/Journey";

// Le pendant anglais. Voir app/(fr)/page.tsx.

export default function Home() {
  return (
    <Journey>
      <HomeBody locale="en" />
    </Journey>
  );
}

import { HomeBody } from "@/components/HomeBody";
import { Journey } from "@/components/journey/Journey";

// Le pendant anglais. Voir app/(fr)/page.tsx.

export default function Home() {
  return (
    <>
      {/* Le voyage occupe ses propres ecrans, puis le site reprend dessous
          avec ses bandes. Sans 3D il ne prend aucune place. */}
      <Journey locale="en" />
      <HomeBody locale="en" />
    </>
  );
}

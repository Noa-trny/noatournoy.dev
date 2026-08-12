import Apercu from "@/scene/monde/Apercu";

// Le laboratoire : une page qui n'existe que pour REGARDER une piste avant de
// la construire. Elle n'est liee depuis nulle part et sortira du depot une fois
// la direction arretee.
//
// Import direct plutot que `next/dynamic` avec `ssr: false` : ce dernier est
// interdit dans un composant serveur depuis Next 15. Le "use client" du module
// suffit — le canvas ne rend rien cote serveur de toute façon.

export default function Labo() {
  return <Apercu />;
}

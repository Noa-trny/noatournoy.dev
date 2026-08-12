"use client";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import type { Locale } from "@/content/routes";
import { routes } from "@/content/routes";
import { bySlug, type Project } from "@/content/projects";
import { journey, useJourney } from "../scroll/journeyStore";
import { EMPLACEMENTS, type Emplacement } from "./placement";
import { policePrete, textureSansImage } from "./panelTexture";

// Les six vitrines. Un socle, un cadre, un panneau — pas six modeles sur
// mesure : ce sont des objets vus deux secondes chacun, et six jobs de
// modelisation pour ça serait du budget mal place.
//
// L'ACCESSIBILITE NE PASSE PAS PAR ICI. Chaque vitrine a son jumeau `<a href>`
// dans le DOM, rendu par le serveur. Ce qui suit n'est qu'une surface de
// pointage qui double ces liens ; le clavier, les robots et le repli utilisent
// le DOM. C'est ce qui permet a la scene de porter la navigation sans la
// confisquer.

const VERT = "#c2f53f";

// Geometries partagees : six socles identiques n'ont aucune raison d'allouer
// six fois la meme chose.
const G_SOCLE = new THREE.BoxGeometry(1.9, 1.0, 0.5);
const G_CADRE = new THREE.BoxGeometry(1.78, 1.04, 0.12);
const G_PANNEAU = new THREE.PlaneGeometry(1.68, 0.945);

function Vitrine({
  emplacement,
  projet,
  locale,
  texture,
}: {
  emplacement: Emplacement;
  projet: Project;
  locale: Locale;
  texture: THREE.Texture | null;
}) {
  const router = useRouter();
  const groupe = useRef<THREE.Group>(null);
  const cadre = useRef<THREE.MeshStandardMaterial>(null);
  const actif = useJourney((s) => s.activeId) === projet.slug;
  const href = routes.project[locale](projet.slug);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    if (cadre.current) {
      cadre.current.emissiveIntensity = THREE.MathUtils.damp(
        cadre.current.emissiveIntensity,
        actif ? 1.9 : 0.05,
        8,
        dt
      );
    }
    if (groupe.current) {
      groupe.current.position.y = THREE.MathUtils.damp(
        groupe.current.position.y,
        emplacement.position[1] + (actif ? 0.04 : 0),
        8,
        dt
      );
    }
  });

  return (
    <group
      ref={groupe}
      position={emplacement.position as unknown as THREE.Vector3Tuple}
      rotation={[0, emplacement.rotation, 0]}
    >
      {/* Le socle et le cadre ne sont PAS interactifs : poser un gestionnaire
          dessus ferait entrer tout leur sous-arbre dans le parcours de rayons
          a chaque mouvement de pointeur. */}
      <mesh
        geometry={G_SOCLE}
        position={[0, 0.5, 0]}
        castShadow
        receiveShadow
        raycast={() => {}}
      >
        <meshStandardMaterial color="#6f6d67" roughness={0.9} metalness={0} />
      </mesh>

      <mesh
        geometry={G_CADRE}
        position={[0, 1.62, 0]}
        castShadow
        receiveShadow
        raycast={() => {}}
      >
        <meshStandardMaterial
          ref={cadre}
          color="#121312"
          roughness={0.45}
          metalness={0}
          emissive={VERT}
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Le SEUL objet interactif : deux triangles, et c'est exactement la
          zone que l'oeil identifie comme cliquable. */}
      <mesh
        geometry={G_PANNEAU}
        position={[0, 1.62, 0.062]}
        onPointerOver={(e) => {
          e.stopPropagation();
          journey.set({ activeId: projet.slug });
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          journey.set({ activeId: null });
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "";
          router.push(href);
        }}
      >
        {texture ? (
          // `toneMapped={false}` garde la capture telle qu'elle est : c'est une
          // image, pas une surface eclairee par la scene.
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshBasicMaterial color="#101013" toneMapped={false} />
        )}
      </mesh>
    </group>
  );
}

/** Charge les captures des travaux qui en ont une. */
function useCaptures(projets: Project[]) {
  const urls = useMemo(
    () =>
      projets
        .map((p) => (p.peek.kind === "shot" ? p.peek.src : null))
        .filter((s): s is string => s !== null),
    [projets]
  );
  const textures = useTexture(urls);
  const liste = Array.isArray(textures) ? textures : [textures];

  return useMemo(() => {
    const par = new Map<string, THREE.Texture>();
    urls.forEach((u, i) => {
      const t = liste[i];
      if (!t) return;
      // Sans espace colorimetrique explicite les captures partent delavees.
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      par.set(u, t);
    });
    return par;
  }, [urls, liste]);
}

export function Vitrines({ locale }: { locale: Locale }) {
  const projets = useMemo(() => EMPLACEMENTS.map((e) => bySlug(e.slug)), []);
  const captures = useCaptures(projets);
  // Dessinees des le premier rendu, jamais attendues : une texture noire a
  // l'ecran coute plus cher qu'une police de repli pendant deux secondes.
  const sansImage = useMemo(() => {
    const m = new Map<string, { texture: THREE.Texture; redessiner: () => void }>();
    for (const p of projets) {
      if (p.peek.kind !== "none") continue;
      m.set(p.slug, textureSansImage(p, locale));
    }
    return m;
  }, [projets, locale]);

  // Puis on repasse dessus quand la vraie police est disponible.
  useEffect(() => {
    let vivant = true;
    policePrete().then(() => {
      if (vivant) sansImage.forEach((e) => e.redessiner());
    });
    return () => {
      vivant = false;
    };
  }, [sansImage]);

  useEffect(() => () => sansImage.forEach((e) => e.texture.dispose()), [sansImage]);

  return (
    <group>
      {EMPLACEMENTS.map((e) => {
        const p = bySlug(e.slug);
        const tex =
          p.peek.kind === "shot"
            ? captures.get(p.peek.src) ?? null
            : sansImage.get(p.slug)?.texture ?? null;
        return (
          <Vitrine
            key={e.slug}
            emplacement={e}
            projet={p}
            locale={locale}
            texture={tex}
          />
        );
      })}
    </group>
  );
}

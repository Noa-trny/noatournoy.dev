import type { Section } from "@/components/ProjectPage";
import { Figure } from "@/components/Figure";

export const sections: readonly Section[] = [
  {
    id: "sujet",
    title: "Cent pour cent procédurale.",
    body: (
      <>
        <div className="prose">
          <p>
            Aucun modèle 3D, aucune texture, aucun fichier audio, aucune requête externe au
            runtime. La géométrie, les matériaux (bruit et FBM en GLSL), plus de cent mille
            particules et la musique elle-même (synthèse WebAudio pure) sont produits par le
            code. Seule exception assumée : la typographie, committée dans le dépôt.
          </p>
          <p>
            Environ 11 600 lignes réparties sur 195 fichiers. Next.js 15, React 19, TypeScript
            strict, Three.js et React Three Fiber, GSAP ScrollTrigger, Lenis, zustand, WebAudio.
          </p>
        </div>

        <Figure
          bloc
          srcSet="/travaux/eclosion/img/dawn-700.webp 700w, /travaux/eclosion/img/dawn-1400.webp 1400w"
          sizes="(min-width: 60rem) 60rem, 100vw"
          src="/travaux/eclosion/img/dawn-1400.webp"
          alt="L'aube d'Éclosion : le soleil affleure l'horizon au-dessus d'un relief procédural."
          width={1400}
          height={875}
          caption="L'Aube, dernier acte. Le disque solaire ignore le brouillard pour passer le seuil du bloom."
        />
      </>
    ),
  },
  {
    id: "choix",
    title: "Décisions techniques",
    srOnly: true,
    body: (
      <>
        <p className="label"><span>Trois choix qui structurent tout</span></p>

        <div className="prose">
          <h3>Le contrat de scroll : zéro render React à 60 images par seconde</h3>
          <p>
            Un seul lissage (Lenis), un seul ScrollTrigger maître qui scrube une timeline GSAP
            de durée 1, et un registre d'uniforms mutables que les tweens écrivent et que le
            rendu lit à chaque frame, sans jamais passer par un render React. React ne se
            réveille qu'aux changements d'acte. Le texte DOM suit via un unique MotionValue,
            hors React lui aussi.
          </p>

          <h3>Un seul monde, une seule vérité</h3>
          <p>Une fonction analytique <strong>groundHeight(x, z)</strong> génère le terrain visible, contraint la marche en exploration libre, fait rebondir la physique et borne les vols d'oiseaux. Ce qu'on voit est exactement ce qu'on touche. Même logique pour la caméra : une seule courbe CatmullRom continue, chaque acte voyageant jusqu'au premier point du suivant. Aucune coupure sur tout le film.</p>

          <h3>Des particules sans état</h3>
          <p>
            Chaque comportement (pluie, lucioles en curl-noise, braises, vortex du final) est
            une fonction fermée de (graine, temps) évaluée dans le vertex shader. Pas de
            simulation à maintenir, pas d'aller-retour GPU. Les buffers sont alloués une fois au
            niveau de qualité maximal ; changer de palier ne fait que déplacer un setDrawRange.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "mesures",
    title: "Mesures",
    srOnly: true,
    body: (
      <>
        <p className="label"><span>L'ingénierie, chiffrée</span></p>

        <table className="measures">
          <caption>Banc GPU intégré forcé au palier maximal, le pire cas mesurable.</caption>
          <thead>
            <tr>
              <th scope="col">Mesure</th>
              <th scope="col">Avant</th>
              <th scope="col">Après</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Charge de première visite</th>
              <td>422 Kio</td>
              <td className="after">342 Kio<span aria-hidden="true"> · −19 %</span></td>
            </tr>
            <tr>
              <th scope="row">Pire frame aux frontières d'acte</th>
              <td>617 ms</td>
              <td className="after">167 ms</td>
            </tr>
            <tr>
              <th scope="row">Arbres de la forêt, à coût de frame égal</th>
              <td>420</td>
              <td className="after">630</td>
            </tr>
            <tr>
              <th scope="row">Lighthouse : accessibilité, bonnes pratiques, SEO</th>
              <td></td>
              <td className="after">100 / 100 / 100</td>
            </tr>
          </tbody>
        </table>

        <div className="prose mt-prose">
          <h3>Les −19 %</h3>
          <p>
            La police italique, 80 Ko préchargés en priorité haute, n'était rendue nulle part.
            Une seule occurrence du mot « italic » dans tout le code : sa propre déclaration.
          </p>

          <h3>Les 617 ms</h3>
          <p>Trois blocages empilés à chaque frontière d'acte, démêlés au profileur CPU et aux hooks GL posés sur <strong>linkProgram</strong> :</p>
          <ul>
            <li><strong>le piège de la clé de cache</strong> : le post-traitement rend la scène sous son propre état renderer ; tout le préchauffage de shaders compilait donc des programmes que le rendu réel n'utilisait jamais, et la première frame visible relinkait tout ;</li>
            <li><strong>l'attente de link</strong> : un acte se dessinait dès que la caméra le balayait, prêt ou pas ;</li>
            <li><strong>la réflexion différée du pilote</strong> : même linké, un programme paie sa première introspection, environ 180 ms chacun sur GPU intégré.</li>
          </ul>
          <p>
            Réponse : chaque acte monte invisible, compile sous l'état du composer, se fait
            introspecter un programme par frame, puis se révèle, le tout couvert par le
            brouillard de la scène. Aucun changement visuel, frontières fluides.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "debug",
    title: "Rien ne se corrige sans être vu.",
    body: (
      <>
        <div className="prose">
          <p>
            Un harnais CDP pilote un vrai Chrome : entrée dans l'expérience, saut à un instant
            précis, capture, avant et après, pour chaque changement de rendu. Les effets liés à
            la vitesse se capturent en plein défilement, une capture posée ne montre rien. Le
            palier GPU se force en injectant la chaîne du renderer.
          </p>

          <h3>Le soleil qui ne s'embrasait pas</h3>
          <p>
            Le disque de l'aube rendait gris. Le brouillard exponentiel en mangeait 99,5 % à
            cette distance, et son plafond de luminance restait sous le seuil du bloom :
            « bright enough to bloom », disait le commentaire ; c'était faux depuis toujours.
            Correctif : le soleil ignore le brouillard (la lune, elle, le ré-émule à l'identique
            en JavaScript) et une courbe d'embrasement passe le seuil : braise sous l'horizon,
            or à l'affleurement, crème au zénith.
          </p>

          <h3>Les lignes de l'océan</h3>
          <p>
            Un même symptôme, « des traits blancs », s'est révélé être cinq défauts empilés,
            chacun masquant le suivant : ghosting du flou de vitesse, arêtes des fûts de lumière,
            dôme de ciel nocturne visible sous l'eau, bord de la nappe de Gerstner, plancher trop
            éclairé. La méthode qui a fini par gagner : masquer les composants un à un pour
            isoler la source avant de toucher au moindre shader.
          </p>
        </div>

        <div className="plates-grid mt-bloc">
          <Figure
            srcSet="/travaux/eclosion/img/void-constellations-700.webp 700w, /travaux/eclosion/img/void-constellations-1400.webp 1400w"
            sizes="(min-width: 60rem) 30rem, 100vw"
            src="/travaux/eclosion/img/void-constellations-1400.webp"
            alt="Le Néant : des constellations tracées sur un ciel vide."
            width={1400}
            height={875}
            caption="Le Néant, constellations générées, sans horizon."
          />
          <Figure
            srcSet="/travaux/eclosion/img/storm-700.webp 700w, /travaux/eclosion/img/storm-1400.webp 1400w"
            sizes="(min-width: 60rem) 30rem, 100vw"
            src="/travaux/eclosion/img/storm-1400.webp"
            alt="L'orage : pluie dense et éclairs au-dessus du relief."
            width={1400}
            height={875}
            caption="L'Orage, capturé en plein défilement, seul moyen de voir le flou de vitesse."
          />
          <Figure
            srcSet="/travaux/eclosion/img/forest-700.webp 700w, /travaux/eclosion/img/forest-1400.webp 1400w"
            sizes="(min-width: 60rem) 30rem, 100vw"
            src="/travaux/eclosion/img/forest-1400.webp"
            alt="La forêt : des centaines d'arbres générés en instances."
            width={1400}
            height={875}
            caption="La Forêt, 630 arbres en cinq InstancedMesh, à coût de frame inchangé."
          />
          <Figure
            srcSet="/travaux/eclosion/img/ocean-700.webp 700w, /travaux/eclosion/img/ocean-1400.webp 1400w"
            sizes="(min-width: 60rem) 30rem, 100vw"
            src="/travaux/eclosion/img/ocean-1400.webp"
            alt="L'océan : une nappe de Gerstner traversée de fûts de lumière."
            width={1400}
            height={875}
            caption="L'Océan, nappe de Gerstner et fûts de lumière sous la surface."
          />
        </div>
      </>
    ),
  },
  {
    id: "qualite",
    title: "Qualité et accessibilité",
    srOnly: true,
    body: (
      <>
        <p className="label"><span>Tenir la qualité dans le temps</span></p>

        <div className="prose">
          <ul>
            <li><strong>Intégration continue à chaque push</strong> : lint strict (le type <code>any</code> est interdit), TypeScript strict, 16 tests unitaires (pavage des actes, générateur pseudo-aléatoire seedé, sol analytique, parité des textes FR et EN), build.</li>
            <li><strong>Un test de bout en bout</strong> joue le film entier, démarrage, entrée, chaque acte, l'émergence hors de l'eau, le repli, dans les deux langues, et exige zéro erreur de console. Il a attrapé une vraie course le jour de sa mise en service : une libération de ressources pendant un link de shader.</li>
            <li><strong>Sans WebGL2</strong> : une page de repli sert le récit complet en HTML rendu côté serveur, sans JavaScript, dans les deux langues.</li>
            <li><strong>Mouvement réduit</strong> : défilement natif, particules à 4 %, aucune secousse, son coupé. Annonces <code>aria-live</code> à chaque acte, parcours clavier complet, focus visible partout.</li>
          </ul>
        </div>
      </>
    ),
  },
];

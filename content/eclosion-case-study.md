# Éclosion — étude de cas

> Contenu source pour la future page « projets ». Chaque chiffre est mesuré, chaque
> anecdote est vraie — rien à inventer, tout à mettre en scène. Les visuels vivent dans
> `Noa-trny/eclosion` → `docs/screens/*.jpg` (+ la carte OG du site).

---

## Le pitch

**Éclosion** est une expérience web 3D où le défilement est le temps : huit actes — du
Néant à l'Aube — traversés à la molette, du premier battement d'une graine jusqu'au
premier lever de soleil du monde.

**100 % procédural.** Aucun modèle 3D, aucune texture, aucun fichier audio, aucune
requête externe au runtime. Géométrie, matériaux (bruit/FBM en GLSL), plus de
100 000 particules et la musique elle-même (synthèse WebAudio pure) sont générés par le
code. Seule exception assumée : la typographie Fraunces, committée dans le repo.

- **Voir** : https://eclosion.noatournoy.dev
- **Lire** : https://github.com/Noa-trny/eclosion
- **Stack** : Next.js 15 · React 19 · TypeScript strict · Three.js + React Three Fiber ·
  GSAP ScrollTrigger · Lenis · zustand · WebAudio — ~11 600 lignes, 195 fichiers.

---

## Trois choix qui structurent tout

### 1. Le contrat de scroll : zéro render React à 60 fps

Un seul lissage (Lenis), un seul ScrollTrigger maître qui scrube une timeline GSAP de
durée 1, et un registre d'uniforms mutables que les tweens écrivent et que le rendu lit
à chaque frame — sans jamais passer par un render React. React ne se réveille qu'aux
changements d'acte. Le texte DOM suit via un unique MotionValue, hors React lui aussi.

### 2. Un seul monde, une seule vérité

`groundHeight(x, z)` — une fonction analytique — génère le terrain visible, contraint la
marche en exploration libre, fait rebondir la physique et borne les vols d'oiseaux. Ce
qu'on voit est exactement ce qu'on touche. Même logique pour la caméra : une seule courbe
CatmullRom continue, chaque acte voyageant jusqu'au premier point du suivant — aucune
coupure sur tout le film.

### 3. Des particules sans état

Chaque comportement — pluie, lucioles en curl-noise, braises, vortex du final — est une
fonction fermée de `(graine, temps)` évaluée dans le vertex shader. Pas de simulation à
maintenir, pas d'aller-retour GPU. Les buffers sont alloués une fois au niveau de qualité
maximal ; changer de tier ne fait que déplacer un `setDrawRange`.

---

## L'ingénierie, chiffrée

| Mesure | Avant | Après |
|---|---|---|
| Charge de première visite | 422 Kio | **342 Kio** (−19 %) |
| Pire frame aux frontières d'acte* | 617 ms | **167 ms** |
| Accessibilité / Bonnes pratiques / SEO (Lighthouse) | — | **100 / 100 / 100** |
| Arbres de la forêt (coût frame mesuré) | 420 | **630, médiane inchangée à 0,1 ms près** |

*banc GPU intégré forcé au tier maximal — le pire cas mesurable.

**Les −19 %** : la police italique de Fraunces — 80 Ko préchargés en priorité haute —
n'était rendue nulle part. Une seule occurrence du mot « italic » dans tout le code : sa
propre déclaration.

**Les 617 ms** : trois stalls empilés à chaque frontière d'acte, démêlés au profileur CPU
(piles d'appel V8) et aux hooks GL posés sur `linkProgram` :

1. **le piège de la clé de cache** — le post-processing rend la scène sous son propre
   état renderer ; tout le préchauffage de shaders compilait donc des programmes que le
   rendu réel n'utilisait jamais, et la première frame visible relinkait tout ;
2. **l'attente de link** — un acte se dessinait dès que la caméra le balayait, prêt ou
   pas ;
3. **la réflexion différée du driver** — même linké, un programme paie sa première
   introspection (~180 ms chacun sur GPU intégré).

Réponse : chaque acte monte **invisible**, compile sous l'état du composer, se fait
introspecter un programme par frame, puis se révèle — le tout couvert par le brouillard
de la scène. Aucun changement visuel, frontières fluides.

---

## Le débogage comme discipline

**Rien ne se corrige sans être vu.** Un harnais CDP pilote un vrai Chrome : entrée dans
l'expérience, saut à un beat précis, capture — avant/après pour chaque changement de
rendu. Les effets liés à la vitesse se capturent **en plein défilement** (une capture
posée ne montre rien). Le tier GPU se force en injectant la chaîne du renderer.

Deux traques racontables :

- **Le soleil qui ne s'embrasait pas.** Le disque de l'aube rendait gris — le brouillard
  exponentiel en mangeait 99,5 % à cette distance, et son plafond de luminance restait
  sous le seuil du bloom : « bright enough to bloom », disait le commentaire ; c'était
  faux depuis toujours. Correctif : le soleil ignore le brouillard (la lune, elle, le
  ré-émule à l'identique en JS) et une courbe d'embrasement qui passe le seuil — braise
  sous l'horizon, or à l'affleurement, crème au zénith.
- **Les lignes de l'océan.** Un même symptôme — « des traits blancs » — s'est révélé être
  **cinq défauts empilés**, chacun masquant le suivant : ghosting du flou de vitesse,
  arêtes des fûts de lumière, dôme de ciel nocturne visible sous l'eau, bord de la nappe
  de Gerstner, plancher trop éclairé. Méthode qui a fini par gagner : masquer les
  composants un à un pour isoler la source avant de toucher au moindre shader.

---

## Tenir la qualité dans le temps

- **CI sur chaque push** : lint strict (`any` interdit), TypeScript strict, 16 tests
  unitaires (pavage des actes, PRNG seedé, sol analytique, parité FR/EN), build.
- **Un smoke test e2e** joue le film entier — boot, entrée, chaque acte, l'émergence, le
  fallback dans les deux langues — et exige **zéro erreur console**. Il a attrapé une
  vraie course (dispose pendant un link de shader) le jour de sa mise en service.
- **Workflow** : PRs de features vers `dev`, release `dev → main` = déploiement.

---

## Accessible par construction

- Sans WebGL2 : `/fallback` — le récit complet en HTML rendu serveur, **sans JavaScript**,
  bilingue.
- `prefers-reduced-motion` : scroll natif, particules à 4 %, pas de shake, son coupé.
- Annonces `aria-live` par acte, parcours clavier complet, `focus-visible` partout.

---

## Ce que ce projet dit de ma façon de travailler

Mesurer avant de corriger. Vérifier chaque changement de rendu par capture. Isoler avant
d'accuser. Encoder chaque leçon payée — en test, en garde-fou, en invariant écrit — pour
qu'elle ne coûte qu'une fois.

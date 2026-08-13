# Crédits

Presque tout ce que montre ce site est écrit à la main : la scène 3D est bâtie
en primitives — boîtes, cylindres, tores — et les textes affichés dans le monde
sont peints sur des toiles au moment du rendu. Ce fichier ne liste donc que ce
qui vient d'ailleurs.

## Modèles 3D

| Fichier | Source | Auteur | Licence |
|---|---|---|---|
| `public/models/casque.glb` | [Poly Pizza](https://poly.pizza/m/PSsWSIAYIL) | CreativeTrio | CC0 1.0 (domaine public) |

CC0 n'exige aucune attribution. Elle figure ici parce qu'un travail qu'on
reprend se cite, et parce que la question « d'où vient ce fichier » doit avoir
une réponse dans le dépôt plutôt que dans la mémoire de quelqu'un.

Le fichier livré n'est pas celui d'origine : il passe par
`scripts/atelier/importer.mjs`, qui retire les matériaux et les textures —
remplacés au chargement par le matériau croquis — puis aplatit et joint la
géométrie. De 42 Ko à 27 Ko, une seule primitive, aucune image.

## Police

Inter, par Rasmus Andersson, sous SIL Open Font License 1.1. Auto-hébergée en
`public/fonts/Inter.woff2` : aucune requête ne part vers un service de polices,
ce qui est autant une question de confidentialité que de conformité à la CSP du
site (`default-src 'none'`).

## Logos de technologies

`public/assets/icons/` contient les marques figuratives des outils cités dans la
section « stack ». Elles appartiennent à leurs détenteurs respectifs et ne sont
utilisées que pour désigner nominativement ces outils — un usage descriptif, qui
ne suggère ni partenariat ni approbation.

// LA CHAINE D'IMPORT D'UN MODELE, en une commande.
//
//   node scripts/atelier/importer.mjs <entree.glb> <public/models/sortie.glb>
//
// Elle fait trois choses, et chacune pour une raison qui tient a CE projet.
//
// 1. ELLE RETIRE LES TEXTURES ET LES MATERIAUX. La scene entiere est rendue par
//    le materiau croquis — quantification de la luminosite, grain de papier,
//    contour en coque inversee. Un modele importe arrive avec ses propres
//    materiaux PBR, qui sont remplaces au chargement de toute façon : les
//    garder dans le fichier ferait telecharger, decoder et televerser des
//    images que personne ne regardera jamais. Sur ce casque, l'atlas de
//    palette pese sept kilooctets sur le disque mais quatre-vingt-sept en
//    memoire graphique.
//
// 2. ELLE FUSIONNE CE QUI PEUT L'ETRE. Chaque primitive coute un appel de
//    rendu, et le contour le DOUBLE : un modele en douze morceaux en coute
//    vingt-quatre. Une fois les materiaux reduits a un seul, plus rien
//    n'empeche de tout joindre.
//
// 3. ELLE NE COMPRESSE PAS. C'est le choix qui surprend, et il se mesure : a
//    quarante kilooctets, Meshopt en economiserait une quinzaine, au prix d'un
//    decodeur WebAssembly dans le chemin de chargement. Le gain est de l'ordre
//    d'un centieme de seconde sur une connexion ordinaire ; la dependance, elle,
//    est permanente. La compression redeviendra la bonne reponse au premier
//    modele qui depassera quelques centaines de kilooctets — c'est un seuil, pas
//    une doctrine.

import { NodeIO } from "@gltf-transform/core";
import { dedup, prune, join, weld, flatten } from "@gltf-transform/functions";
import { readFileSync, writeFileSync } from "node:fs";

const [entree, sortie] = process.argv.slice(2);
if (!entree || !sortie) {
  console.error("usage: importer.mjs <entree.glb> <sortie.glb>");
  process.exit(1);
}

const io = new NodeIO();
const doc = await io.readBinary(readFileSync(entree));
const racine = doc.getRoot();

const avant = {
  octets: readFileSync(entree).byteLength,
  maillages: racine.listMeshes().length,
  primitives: racine.listMeshes().reduce((n, m) => n + m.listPrimitives().length, 0),
  materiaux: racine.listMaterials().length,
  textures: racine.listTextures().length,
};

// Les textures d'abord : `prune` ne les retirera que lorsque plus rien ne les
// pointe, donc il faut d'abord couper le lien depuis les materiaux.
for (const m of racine.listMaterials()) {
  m.setBaseColorTexture(null)
    .setNormalTexture(null)
    .setEmissiveTexture(null)
    .setMetallicRoughnessTexture(null)
    .setOcclusionTexture(null)
    // Blanc : le materiau croquis MULTIPLIE sa couleur par celle du modele. Une
    // couleur de base restee grise assombrirait toute la palette du projet, et
    // le decalage serait d'autant plus difficile a diagnostiquer qu'il
    // s'appliquerait uniformement.
    .setBaseColorFactor([1, 1, 1, 1]);
}

// Les UV suivent : plus aucune texture ne les lit, et ils pesent deux flottants
// par sommet.
for (const mesh of racine.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    for (const nom of prim.listSemantics()) {
      if (nom.startsWith("TEXCOORD") || nom.startsWith("COLOR")) {
        prim.setAttribute(nom, null);
      }
    }
  }
}

await doc.transform(
  prune(),
  dedup(),
  // `flatten` avant `join` : joindre ne peut fusionner que des primitives dont
  // les noeuds partagent la meme transformation.
  flatten(),
  join(),
  weld(),
  prune(),
);

writeFileSync(sortie, Buffer.from(await io.writeBinary(doc)));

const apres = {
  octets: readFileSync(sortie).byteLength,
  maillages: doc.getRoot().listMeshes().length,
  primitives: doc.getRoot().listMeshes().reduce((n, m) => n + m.listPrimitives().length, 0),
  materiaux: doc.getRoot().listMaterials().length,
  textures: doc.getRoot().listTextures().length,
};

const ko = (n) => `${(n / 1024).toFixed(1)} ko`;
console.log(`  octets      ${ko(avant.octets)}  ->  ${ko(apres.octets)}`);
console.log(`  primitives  ${avant.primitives}  ->  ${apres.primitives}   (chacune = 2 appels de rendu, contour compris)`);
console.log(`  materiaux   ${avant.materiaux}  ->  ${apres.materiaux}`);
console.log(`  textures    ${avant.textures}  ->  ${apres.textures}`);

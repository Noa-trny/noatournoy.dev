"""Ou est l'interieur de cette villa, et de quelle taille ?

Trois heuristiques de lancer de rayon ont echoue d'affilee, chacune pour la meme
raison de fond : sur un modele pose dans un terrain paysage, « vide », « borne »
et « couvert » decrivent aussi bien un sous-bois qu'un couloir.

Il existe pourtant un temoin sans ambiguite. Personne ne pose un canape, une
table de salle a manger et des pots d'epices dehors : LA OU SONT LES MEUBLES, ON
EST DEDANS. Leur boite englobante donne d'un coup l'emprise interieure et la
hauteur du plancher, sans aucune heuristique.

    blender --background --python ou_est_dedans.py -- <fichier.glb>
"""

import bpy
import sys
from mathutils import Vector

chemin = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=chemin)
objets = [o for o in bpy.context.scene.objects if o.type == "MESH"]


def boite(objs):
    mn = Vector((1e9, 1e9, 1e9))
    mx = Vector((-1e9, -1e9, -1e9))
    for o in objs:
        for c in o.bound_box:
            p = o.matrix_world @ Vector(c)
            mn = Vector((min(mn[i], p[i]) for i in range(3)))
            mx = Vector((max(mx[i], p[i]) for i in range(3)))
    return mn, mx


def mats(o):
    return " ".join((m.name or "").lower() for m in o.data.materials if m)


# --- L'echelle, lue sur un objet dont on connait les dimensions reelles -------
# La 911 (type 992) fait 4,519 m de long, 1,852 de large (1,98 retroviseurs
# compris) et 1,303 de haut. C'est le seul metre etalon du fichier.
porsche = [o for o in objets if "911body" in mats(o) or "911Body" in o.name]
echelle = None
if porsche:
    mn, mx = boite(porsche)
    d = mx - mn
    long_modele = max(d.x, d.y)
    echelle = long_modele / 4.519
    print(f"=== ECHELLE ===")
    print(f"  la 911 mesure {d.x:.2f} x {d.y:.2f} x {d.z:.2f} unites")
    print(f"  -> une unite de modele vaut {1/echelle:.4f} m ; le modele est a {echelle:.2f}x")
    print(f"     verification : hauteur {d.z/echelle:.2f} m (reel 1,30), largeur"
          f" {min(d.x,d.y)/echelle:.2f} m (reel 1,98 retroviseurs compris)")


def m(u):
    """Unites de modele -> metres."""
    return u / echelle if echelle else u


# --- L'interieur, tel que le denoncent les meubles ---------------------------
MEUBLES = (
    "couch", "diningchair", "diningtable", "diningrug", "carpet_plush",
    "sink2", "sink3", "sink_3", "faucet", "spicejar", "spicyrack",
    "cayennepepper", "blackpepper", "oregano", "salt", "plaster",
    "tilestravertine",
)
dedans = [o for o in objets if any(k in mats(o) for k in MEUBLES)]
print(f"\n=== L'INTERIEUR, D'APRES LES MEUBLES ===")
print(f"  {len(dedans)} maillages d'ameublement")
if dedans:
    mn, mx = boite(dedans)
    d = mx - mn
    print(f"  emprise  : {m(d.x):.2f} x {m(d.y):.2f} m sur {m(d.z):.2f} m de haut")
    print(f"  du point : ({m(mn.x):.2f}, {m(mn.y):.2f}, {m(mn.z):.2f}) m")
    print(f"  au point : ({m(mx.x):.2f}, {m(mx.y):.2f}, {m(mx.z):.2f}) m")
    print(f"  -> le plancher est vers z = {mn.z:.2f} unites ({m(mn.z):.2f} m)")
    for o in sorted(dedans, key=lambda o: -(boite([o])[1] - boite([o])[0]).length)[:14]:
        a, b = boite([o])
        dd = b - a
        c = (a + b) / 2
        print(f"     {m(dd.x):6.2f} x {m(dd.y):6.2f} x {m(dd.z):5.2f} m"
              f"   centre ({m(c.x):7.2f}, {m(c.y):7.2f}, {m(c.z):6.2f})   {o.name[:34]}")

# --- Le degagement, mesure au bon endroit et a la bonne hauteur --------------
if dedans:
    imn, imx = boite(dedans)
    sol = imn.z
    depsgraph = bpy.context.evaluated_depsgraph_get()
    scene = bpy.context.scene
    print(f"\n=== DEGAGEMENT DANS L'EMPRISE DES MEUBLES ===")
    # Balayage sur toute la HAUTEUR de l'emprise meublee, tous les 40 cm. Les
    # trois premieres sondes etaient toutes sur le niveau bas, alors que les
    # meubles sont trois metres plus haut : la villa a deux niveaux, et il
    # fallait le decouvrir au lieu de le supposer.
    hauteurs = []
    hm = 0.4
    while sol + hm * (echelle or 1.0) < imx.z:
        hauteurs.append(hm)
        hm += 0.4
    for hm in hauteurs:
        z = sol + hm * (echelle or 1.0)
        meilleur = (0, None)
        pas = (echelle or 1.0) * 0.4
        for nom, dirv, a0, a1, b0, b1 in (
            ("X", Vector((1, 0, 0)), imn.x, imx.x, imn.y, imx.y),
            ("Y", Vector((0, 1, 0)), imn.y, imx.y, imn.x, imx.x),
        ):
            b = b0
            while b <= b1:
                orig = Vector((a0 - 1, b, z)) if nom == "X" else Vector((b, a0 - 1, z))
                impacts, parcouru, cur = [], 0.0, orig.copy()
                total = (a1 - a0) + 2
                for _ in range(160):
                    reste = total - parcouru
                    if reste <= 0.01:
                        break
                    t, pt, _, _, _, _ = scene.ray_cast(depsgraph, cur, dirv, distance=reste)
                    if not t:
                        break
                    parcouru += (pt - cur).length
                    impacts.append(parcouru)
                    cur = pt + dirv * 0.002
                    parcouru += 0.002
                for i in range(len(impacts) - 1):
                    v = impacts[i + 1] - impacts[i]
                    if v > meilleur[0]:
                        meilleur = (v, (nom, b, a0 - 1 + impacts[i]))
                b += pas
        if meilleur[1]:
            nom, b, deb = meilleur[1]
            print(f"  +{hm:5.1f} m (z={m(z):6.2f}) : {m(meilleur[0]):6.2f} m le long de {nom}"
                  f"   (autre axe = {m(b):7.2f} m, depart = {m(deb):7.2f} m)")
        else:
            print(f"  +{hm:5.1f} m (z={m(z):6.2f}) : rien")

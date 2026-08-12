# Releve les reperes du modele PREPARE, dans ses coordonnees finales.
#
#   blender --background --python scripts/blender/reperer.py -- <prepare.glb>
#
# `mesurer.py` sert a decider si un modele convient ; celui-ci sert a ecrire la
# trajectoire de camera une fois qu'il est retenu. Ce ne sont pas les memes
# questions : la premiere se pose une fois, la seconde a chaque retouche du
# modele — et une trajectoire ecrite d'apres des nombres perimes se voit
# immediatement, la camera passant a travers un mur.
#
# Tout est rendu en coordonnees glTF (Y-up), c'est-a-dire celles de la scene
# web, et non en coordonnees Blender (Z-up). C'est le seul repere dans lequel
# les valeurs peuvent etre recopiees sans conversion — et donc sans erreur de
# signe une fois sur deux.

import bpy
import os
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


def gl(v):
    """Blender (x, y, z) -> glTF (x, y, z) avec Y en haut.

    L'importateur glTF a converti Y-up en Z-up a l'entree ; on refait le chemin
    inverse pour que les nombres imprimes soient EXACTEMENT ceux a recopier dans
    le code de la scene. Sans ça, chaque valeur demande une conversion mentale,
    et une conversion mentale sur deux est fausse.
    """
    return (v.x, v.z, -v.y)


def mats(o):
    return " ".join((m.name or "").lower() for m in o.data.materials if m)


def sur(mots):
    return [o for o in objets if any(k in mats(o) for k in mots)]


print("\n=== ENSEMBLE (coordonnees glTF, Y en haut) ===")
mn, mx = boite(objets)
a, b = gl(mn), gl(mx)
print(f"  X de {min(a[0], b[0]):7.2f} a {max(a[0], b[0]):7.2f}")
print(f"  Y de {min(a[1], b[1]):7.2f} a {max(a[1], b[1]):7.2f}")
print(f"  Z de {min(a[2], b[2]):7.2f} a {max(a[2], b[2]):7.2f}")
print(f"  {len(objets)} maillages")

print("\n=== LA BAIE ===")
verres = sur(("glass",))
if verres:
    mn, mx = boite(verres)
    c = (mn + mx) / 2
    print(f"  {len(verres)} maillage(s) de verre")
    print(f"  centre du vitrage : {tuple(round(x, 2) for x in gl(c))}")
    # La plus grande surface verticale : c'est elle que la camera traverse.
    plus_grande = None
    for o in verres:
        m1, m2 = boite([o])
        d = m2 - m1
        ep = min(d.x, d.y)
        if d.z < 1.6 or max(d.x, d.y) < 1.6 or ep > 0.6:
            continue
        aire = max(d.x, d.y) * d.z
        if plus_grande is None or aire > plus_grande[0]:
            plus_grande = (aire, o, m1, m2)
    if plus_grande:
        _, o, m1, m2 = plus_grande
        c = (m1 + m2) / 2
        d = m2 - m1
        print(f"  plus grande baie  : {max(d.x, d.y):.2f} x {d.z:.2f} m — {o.name[:40]}")
        print(f"  a franchir en     : x = {gl(c)[0]:.2f}, y = {gl(c)[1]:.2f}, z = {gl(c)[2]:.2f}")

print("\n=== LA VOITURE ===")
autos = sur(("911body", "911glass"))
if autos:
    mn, mx = boite(autos)
    c = (mn + mx) / 2
    d = mx - mn
    print(f"  {d.x:.2f} x {d.y:.2f} x {d.z:.2f} m")
    print(f"  centre : {tuple(round(x, 2) for x in gl(c))}")
else:
    print("  aucune")

print("\n=== LES NIVEAUX ===")
# Les planchers se lisent sur les grandes surfaces horizontales : on histogramme
# les altitudes des faces plates et on garde les paliers ou il y a de la matiere.
paliers = {}
for o in objets:
    o.data.calc_loop_triangles()
    mw = o.matrix_world
    for t in o.data.loop_triangles:
        n = (mw.to_3x3() @ t.normal).normalized()
        if abs(n.z) < 0.94:
            continue
        z = (mw @ t.center).z
        paliers[round(z * 4) / 4] = paliers.get(round(z * 4) / 4, 0) + t.area
for z, aire in sorted(paliers.items(), key=lambda kv: -kv[1])[:8]:
    print(f"  y = {z:6.2f} m   {aire:8.1f} m2 de surface horizontale")

print("\n=== DEGAGEMENT PAR TRANCHE, DANS LE REPERE FINAL ===")
depsgraph = bpy.context.evaluated_depsgraph_get()
scene = bpy.context.scene
mn, mx = boite(objets)


def impacts(depart, direction, longueur):
    out, parcouru, cur = [], 0.0, Vector(depart)
    for _ in range(160):
        reste = longueur - parcouru
        if reste <= 0.01:
            break
        touche, pt, _, _, _, _ = scene.ray_cast(depsgraph, cur, direction, distance=reste)
        if not touche:
            break
        parcouru += (pt - cur).length
        out.append(parcouru)
        cur = pt + direction * 0.002
        parcouru += 0.002
    return out


for hauteur in (1.0, 1.6, 2.2, 3.6, 4.2, 4.8):
    z = mn.z + hauteur
    meilleur = (0.0, None)
    for nom, dirv, a0, a1, b0, b1 in (
        ("X", Vector((1, 0, 0)), mn.x, mx.x, mn.y, mx.y),
        ("Y", Vector((0, 1, 0)), mn.y, mx.y, mn.x, mx.x),
    ):
        b = b0
        while b <= b1:
            dep = Vector((a0 - 1, b, z)) if nom == "X" else Vector((b, a0 - 1, z))
            imp = impacts(dep, dirv, (a1 - a0) + 2)
            for i in range(len(imp) - 1):
                v = imp[i + 1] - imp[i]
                if v > meilleur[0]:
                    p0 = a0 - 1 + imp[i]
                    p1 = a0 - 1 + imp[i + 1]
                    meilleur = (v, (nom, b, p0, p1))
            b += 0.4
    if meilleur[1]:
        nom, b, p0, p1 = meilleur[1]
        if nom == "X":
            d0, d1 = gl(Vector((p0, b, z))), gl(Vector((p1, b, z)))
        else:
            d0, d1 = gl(Vector((b, p0, z))), gl(Vector((b, p1, z)))
        print(f"  a {hauteur:.1f} m : {meilleur[0]:5.2f} m   de "
              f"({d0[0]:6.2f}, {d0[1]:5.2f}, {d0[2]:6.2f})"
              f" a ({d1[0]:6.2f}, {d1[1]:5.2f}, {d1[2]:6.2f})")
    else:
        print(f"  a {hauteur:.1f} m : rien")

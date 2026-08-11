# Mesure un modele telecharge, avant de decider quoi que ce soit.
#
#   blender --background --python scripts/blender/mesurer.py -- <chemin.glb|.gltf|.fbx>
#
# Trois questions auxquelles aucune fiche de telechargement ne repond, et dont
# depend toute la trajectoire de camera :
#
#   1. La baie est-elle franchissable ? Il lui faut ~7 m de large et 2,5 m de
#      haut pour qu'une camera passe sans raser les tableaux.
#   2. Y a-t-il vraiment un interieur, et est-il traversant ?
#   3. Comment les materiaux sont-ils nommes ? Sans un nom exploitable pour le
#      beton et le verre, impossible de retexturer ou de faire disparaitre la
#      vitre au franchissement.
#
# Le graphe de scene de Sketchfab est chiffre : ces reponses ne s'obtiennent
# qu'en ouvrant le fichier.

import bpy
import math
import os
import sys
from mathutils import Vector

SORTIE = os.environ.get("MESURE_OUT", os.path.expanduser("~/mesure"))


def importer(chemin):
    ext = os.path.splitext(chemin)[1].lower()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if ext in (".glb", ".gltf"):
        bpy.ops.import_scene.gltf(filepath=chemin)
    elif ext == ".fbx":
        bpy.ops.import_scene.fbx(filepath=chemin)
    elif ext == ".obj":
        bpy.ops.wm.obj_import(filepath=chemin)
    elif ext == ".dae":
        bpy.ops.wm.collada_import(filepath=chemin)
    else:
        raise SystemExit(f"format non gere : {ext}")
    return [o for o in bpy.context.scene.objects if o.type == "MESH"]


def boite_monde(objets):
    """Boite englobante en coordonnees monde."""
    mn = Vector((1e9, 1e9, 1e9))
    mx = Vector((-1e9, -1e9, -1e9))
    for o in objets:
        for c in o.bound_box:
            p = o.matrix_world @ Vector(c)
            mn = Vector((min(mn[i], p[i]) for i in range(3)))
            mx = Vector((max(mx[i], p[i]) for i in range(3)))
    return mn, mx


def triangles(o):
    me = o.data
    me.calc_loop_triangles()
    return len(me.loop_triangles)


def dims(o):
    """Dimensions monde d'un objet, triees pour lire large/haut/profond."""
    mn, mx = boite_monde([o])
    return mx - mn


def rapport(chemin):
    objets = importer(chemin)
    if not objets:
        raise SystemExit("aucun maillage importe")

    mn, mx = boite_monde(objets)
    taille = mx - mn
    total_tris = sum(triangles(o) for o in objets)

    print("\n=== ENSEMBLE ===")
    print(f"  maillages        : {len(objets)}")
    print(f"  triangles        : {total_tris:,}".replace(",", " "))
    print(f"  emprise (X,Y,Z)  : {taille.x:.2f} x {taille.y:.2f} x {taille.z:.2f} m")
    print(f"  du point         : ({mn.x:.2f}, {mn.y:.2f}, {mn.z:.2f})")
    print(f"  au point         : ({mx.x:.2f}, {mx.y:.2f}, {mx.z:.2f})")
    # Blender est Z-up ; un glTF importe garde son orientation d'origine, donc
    # on verifie laquelle des trois dimensions est la hauteur plausible.
    axe_h = min(range(3), key=lambda i: taille[i])
    print(f"  axe le plus court: {'XYZ'[axe_h]} ({taille[axe_h]:.2f} m) — probablement la hauteur")

    # --- materiaux --------------------------------------------------------
    mats = {}
    for o in objets:
        for slot in o.material_slots:
            if slot.material:
                mats.setdefault(slot.material.name, []).append(o.name)
    print(f"\n=== MATERIAUX ({len(mats)}) ===")
    for nom in sorted(mats):
        n = len(mats[nom])
        print(f"  {nom:44s} {n:3d} objet(s)")

    # --- reperage du vitrage ---------------------------------------------
    # On cherche par nom d'abord : c'est le plus fiable quand l'auteur nomme
    # proprement. Sinon on repere les matériaux transparents.
    MOTS_VERRE = ("glass", "verre", "vitr", "window", "glazing", "baie")
    MOTS_BETON = ("concrete", "beton", "béton", "cmu", "cement", "plaster", "stucco")

    verre = [n for n in mats if any(m in n.lower() for m in MOTS_VERRE)]
    beton = [n for n in mats if any(m in n.lower() for m in MOTS_BETON)]
    print("\n=== REPERAGE PAR NOM ===")
    print(f"  verre  : {verre or '(aucun nom evident — a reperer a l oeil)'}")
    print(f"  beton  : {beton or '(aucun nom evident)'}")

    # --- les plus grandes surfaces vitrees --------------------------------
    if verre:
        print("\n=== OUVERTURES VITREES, de la plus large a la plus etroite ===")
        vitres = []
        for o in objets:
            noms = [s.material.name for s in o.material_slots if s.material]
            if any(v in noms for v in verre):
                d = dims(o)
                # La largeur est la plus grande dimension horizontale.
                horiz = sorted([d[i] for i in range(3) if i != axe_h], reverse=True)
                vitres.append((horiz[0], d[axe_h], o.name, triangles(o)))
        for larg, haut, nom, t in sorted(vitres, reverse=True)[:12]:
            verdict = "FRANCHISSABLE" if larg >= 5.0 and haut >= 2.3 else ""
            print(f"  {larg:6.2f} m large x {haut:5.2f} m haut   {nom[:38]:38s} {t:5d} tri  {verdict}")
        if not vitres:
            print("  (aucun objet ne porte ces materiaux)")

    # --- les plus gros maillages, pour planifier la decimation -------------
    print("\n=== LES 12 PLUS GROS MAILLAGES ===")
    for o in sorted(objets, key=triangles, reverse=True)[:12]:
        d = dims(o)
        print(f"  {triangles(o):7d} tri  {d.x:5.1f} x {d.y:5.1f} x {d.z:5.1f}   {o.name[:44]}")

    # --- y a-t-il un interieur ? ------------------------------------------
    # Heuristique : un objet entierement contenu dans la boite englobante,
    # loin des faces exterieures, est probablement du mobilier ou une cloison.
    marge = 0.12
    interieurs = []
    for o in objets:
        omn, omx = boite_monde([o])
        dedans = all(
            omn[i] > mn[i] + taille[i] * marge and omx[i] < mx[i] - taille[i] * marge
            for i in range(3) if i != axe_h
        )
        if dedans:
            interieurs.append(o)
    print(f"\n=== INTERIEUR ===")
    print(f"  {len(interieurs)} maillage(s) entierement a l'interieur de l'emprise")
    for o in sorted(interieurs, key=triangles, reverse=True)[:10]:
        print(f"    {triangles(o):7d} tri   {o.name[:50]}")
    if not interieurs:
        print("    aucun — c'est probablement une coquille exterieure")

    print("\n=== A CONFRONTER AU CAHIER DES CHARGES ===")
    print("  baie franchissable   : 7,20 x 2,90 m")
    print("  couloir              : 6,00 x 13,00 m")
    print("  garage               : 9,00 x 9,00 m, 3,40 m sous plafond")
    print("  budget apres optim.  : 300 000 triangles, 4 Mo")
    print(f"  ce modele            : {total_tris:,} triangles".replace(",", " "))
    if total_tris > 300000:
        print(f"  -> decimation necessaire : ratio ~{300000/total_tris:.2f}")

    return objets


def rendre_vues(objets, dossier):
    """
    Regarder plutot que deduire.

    L'heuristique d'interieur s'est revelee inutile sur ce modele : la boite
    englobante etant celle de la parcelle entiere, elle a marque 796 maillages
    sur 800. Des vues valent mieux qu'une deduction fausse.
    """
    mn, mx = boite_monde(objets)
    c = (mn + mx) / 2.0
    d = mx - mn
    r = max(d.x, d.y) * 0.62

    monde = bpy.data.worlds.new("w")
    bpy.context.scene.world = monde
    monde.use_nodes = True
    fond = next(n for n in monde.node_tree.nodes if n.bl_idname == "ShaderNodeBackground")
    fond.inputs["Color"].default_value = (0.45, 0.53, 0.66, 1.0)
    fond.inputs["Strength"].default_value = 1.4

    soleil = bpy.data.objects.new("s", bpy.data.lights.new("s", "SUN"))
    bpy.context.scene.collection.objects.link(soleil)
    soleil.data.energy = 3.0
    soleil.rotation_euler = (math.radians(48), 0, math.radians(35))

    vues = [
        ("a-ensemble", Vector((c.x + r, c.y - r, c.z + r * 0.55)), c, 35.0),
        ("b-facade",   Vector((c.x, c.y - r * 1.15, c.z + d.z * 0.35)), c, 42.0),
        ("c-dessus",   Vector((c.x, c.y - r * 0.25, c.z + r * 1.4)), c, 35.0),
    ]
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 24
    sc.cycles.use_denoising = True
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "OPTIX"; prefs.get_devices()
        for dev in prefs.devices: dev.use = dev.type in ("OPTIX", "CPU")
        sc.cycles.device = "GPU"
    except Exception:
        pass
    sc.render.resolution_x, sc.render.resolution_y = 1280, 800
    sc.view_settings.view_transform = "AgX"
    for nom, pos, cible, foc in vues:
        cam = bpy.data.objects.new(nom, bpy.data.cameras.new(nom))
        bpy.context.scene.collection.objects.link(cam)
        cam.location = pos
        cam.data.lens = foc
        cam.rotation_euler = (Vector(cible) - pos).to_track_quat("-Z", "Y").to_euler()
        sc.camera = cam
        sc.render.filepath = os.path.join(dossier, nom + ".png")
        bpy.ops.render.render(write_still=True)
        print("  rendu ->", nom)


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if not argv:
        raise SystemExit("usage : ... -- <chemin du modele>")
    chemin = argv[0]
    if not os.path.exists(chemin):
        raise SystemExit(f"introuvable : {chemin}")
    os.makedirs(SORTIE, exist_ok=True)
    objets = rapport(chemin)
    if "--render" in argv:
        rendre_vues(objets, SORTIE)


main()

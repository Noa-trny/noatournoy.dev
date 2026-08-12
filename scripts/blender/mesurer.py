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

    print("\n=== DEGAGEMENT RECTILIGNE A HAUTEUR D'OEIL ===")
    pas = max(mx.x - mn.x, mx.y - mn.y) / 220.0
    segs = degagement(objets, mn, mx, pas=pas)
    if not segs:
        print("    aucun vide borne des deux cotes ET couvert : coquille exterieure")
    else:
        # Un seul representant par hauteur : sans ça, les huit premieres lignes
        # sont huit tranches voisines du meme couloir.
        vues = set()
        montres = 0
        for longueur, axe, z, transverse, milieu, plafond in segs:
            cle = (axe, round(z, 1))
            if cle in vues:
                continue
            vues.add(cle)
            print(
                f"    {longueur:7.2f}  le long de {axe}   sol {z:7.2f}"
                f"   plafond +{plafond:5.2f}"
                f"   (autre axe = {transverse:8.2f}, milieu = {milieu:8.2f})"
            )
            montres += 1
            if montres >= 10:
                break
        print(f"    -> le plus long fait {segs[0][0]:.2f} unites de modele")

    print("\n=== BAIES VITREES VERTICALES ===")
    vitrages = baies(objets)
    if not vitrages:
        print("    aucun materiau de verre identifiable par son nom")
    else:
        for aire, larg, haut, bmn, bmx, nom in vitrages[:6]:
            c = (bmn + bmx) / 2.0
            print(
                f"    {larg:5.2f} x {haut:5.2f} m  centre ({c.x:7.2f},"
                f" {c.y:7.2f}, {c.z:6.2f})   {nom[:38]}"
            )
        a, larg, haut, bmn, bmx, nom = vitrages[0]
        c = (bmn + bmx) / 2.0
        print(f"    -> la plus grande fait {larg:.2f} x {haut:.2f} m")
        print(f"       le franchissement doit passer par ({c.x:.2f}, {c.y:.2f})")

    print("\n=== A CONFRONTER AU CAHIER DES CHARGES ===")
    print("  baie franchissable   : 7,20 x 2,90 m")
    print("  couloir              : 6,00 x 13,00 m")
    print("  garage               : 9,00 x 9,00 m, 3,40 m sous plafond")
    print("  budget apres optim.  : 300 000 triangles, 4 Mo")
    print(f"  ce modele            : {total_tris:,} triangles".replace(",", " "))
    if total_tris > 300000:
        print(f"  -> decimation necessaire : ratio ~{300000/total_tris:.2f}")

    return objets


def degagement(objets, mn, mx, hauteurs=None, pas=0.5):
    """
    LE DEGAGEMENT RECTILIGNE — la mesure qui manquait.

    Le modele precedent a ete choisi sur son titre, ses tags et trois vues. Il
    remplissait tout, sauf la seule chose dont depend le recit : la longueur en
    ligne droite dont on dispose a l'interieur. Elle faisait huit metres, il en
    fallait vingt, et cette decouverte est arrivee bien trop tard — apres la
    preparation du modele, apres la trajectoire, apres les vitrines.

    Le principe est celui d'une canne d'aveugle. A hauteur d'oeil, on balaie le
    plan en lignes paralleles et on marche le long de chacune en enregistrant
    tout ce qu'on percute. Entre deux impacts consecutifs il y a du vide ; un
    vide BORNE AUX DEUX BOUTS par de la matiere est un couloir, alors qu'un vide
    ouvert d'un cote n'est que le dehors.

    UN COULOIR A UN PLAFOND, et c'est ce qui le distingue d'une allee. La version
    precedente ne testait que « borne aux deux bouts » ; sur un terrain paysage
    ça decrit aussi bien un vide entre deux arbres, et le rapport remontait
    trente metres de jardin comme s'il s'agissait d'un couloir. On tire donc un
    rayon vers le HAUT depuis trois points du segment : si les trois butent sur
    quelque chose, on est dedans.

    Renvoie les plus longs, tries, avec leur axe, leur hauteur, leur position et
    la hauteur sous plafond.

    LA HAUTEUR DE BALAYAGE EST BALAYEE, ELLE AUSSI. La premiere version prenait
    « le bas de l'emprise plus 1,70 m », ce qui suppose que le bas de l'emprise
    est le plancher. Sur un modele pose dans un terrain — une villa a flanc de
    colline, par exemple — le bas de l'emprise est le fond du terrain, et le
    balayage passe soixante metres sous la maison. Le rapport annonce alors
    « coquille exterieure » sur un modele qui a un canapé et des pots d'epices
    dans la cuisine.

    On ne sait pas ou est le plancher : on le CHERCHE, en echantillonnant des
    hauteurs sur toute la course verticale. Les niveaux ressortent d'eux-memes,
    puisque ce sont les seules hauteurs ou des vides bornes apparaissent.
    """
    import bpy
    from mathutils import Vector

    depsgraph = bpy.context.evaluated_depsgraph_get()
    scene = bpy.context.scene
    if hauteurs is None:
        # Vingt-quatre tranches sur toute la course verticale. Assez fin pour
        # qu'un etage de 2,5 m ne passe pas entre deux tranches sur un modele
        # de gabarit courant, et assez grossier pour tenir en quelques secondes.
        n = 24
        hauteurs = [mn.z + (mx.z - mn.z) * (i + 0.5) / n for i in range(n)]
    segments = []

    def marcher(depart, direction, longueur):
        """Tous les impacts le long d'un rayon, du plus proche au plus loin."""
        impacts = []
        parcouru = 0.0
        origine = Vector(depart)
        # Borne dure : un modele pathologique (surfaces coplanaires, normales
        # inversees) peut renvoyer un impact a distance nulle indefiniment.
        for _ in range(200):
            reste = longueur - parcouru
            if reste <= 0.01:
                break
            touche, point, _, _, _, _ = scene.ray_cast(
                depsgraph, origine, direction, distance=reste
            )
            if not touche:
                break
            d = (point - origine).length
            parcouru += d
            impacts.append(parcouru)
            # On repart LEGEREMENT au-dela, sinon on repercute la meme face.
            origine = point + direction * 0.002
            parcouru += 0.002
        return impacts

    axes = (
        ("X", Vector((1.0, 0.0, 0.0)), mn.x, mx.x, mn.y, mx.y),
        ("Y", Vector((0.0, 1.0, 0.0)), mn.y, mx.y, mn.x, mx.x),
    )
    HAUT = Vector((0.0, 0.0, 1.0))

    def sous_plafond(point, portee):
        """Distance au premier obstacle au-dessus, ou None a ciel ouvert."""
        touche, impact, _, _, _, _ = scene.ray_cast(
            depsgraph, point + Vector((0.0, 0.0, 0.01)), HAUT, distance=portee
        )
        return (impact - point).length if touche else None

    # Un couloir doit faire au moins ce quart de la plus grande dimension
    # horizontale pour meriter d'etre rapporte. Un seuil en metres serait faux
    # sur un modele qui n'est pas a l'echelle — et celui-ci ne l'est pas.
    seuil = max(mx.x - mn.x, mx.y - mn.y) * 0.02

    for z in hauteurs:
        for nom, direction, a0, a1, b0, b1 in axes:
            longueur = (a1 - a0) + 2.0
            b = b0
            while b <= b1:
                depart = (
                    Vector((a0 - 1.0, b, z)) if nom == "X" else Vector((b, a0 - 1.0, z))
                )
                impacts = marcher(depart, direction, longueur)
                # Un vide borne des deux cotes : entre l'impact i et l'impact i+1.
                for i in range(len(impacts) - 1):
                    vide = impacts[i + 1] - impacts[i]
                    if vide < seuil:
                        continue
                    debut = a0 - 1.0 + impacts[i]
                    milieu = a0 - 1.0 + (impacts[i] + impacts[i + 1]) / 2.0
                    # Trois sondes plutot qu'une : un auvent ou un arbre isole
                    # suffirait a couvrir le seul point median.
                    portee = (mx.z - mn.z) * 0.12
                    hauteurs_p = []
                    for f in (0.25, 0.5, 0.75):
                        t = debut + vide * f
                        pt = Vector((t, b, z)) if nom == "X" else Vector((b, t, z))
                        h = sous_plafond(pt, portee)
                        if h is None:
                            hauteurs_p = None
                            break
                        hauteurs_p.append(h)
                    if hauteurs_p is None:
                        continue
                    segments.append((vide, nom, z, b, milieu, min(hauteurs_p)))
                b += pas

    segments.sort(reverse=True)
    return segments


def baies(objets, mots=("glass", "verre", "window", "glazing", "vitr")):
    """
    Ou est la baie, exactement.

    L'autre defaut du modele precedent : la trajectoire traversait le plan du
    vitrage a une abscisse choisie a la main, et cette abscisse tombait sur du
    beton plein. Le franchissement se terminait dans un mur. La position de la
    baie n'est pas une preference, c'est une donnee du modele — donc on la lit.
    """
    trouve = []
    for o in objets:
        noms = " ".join((m.name or "").lower() for m in o.data.materials if m)
        if not any(k in noms for k in mots):
            continue
        mn, mx = boite_monde([o])
        d = mx - mn
        # Une baie est VERTICALE : large et haute, mince dans la troisieme
        # dimension. Ce test ecarte les tables basses et les garde-corps
        # horizontaux, qui portent souvent le meme materiau de verre.
        epaisseur = min(d.x, d.y)
        hauteur = d.z
        largeur = max(d.x, d.y)
        if hauteur < 1.6 or largeur < 1.6 or epaisseur > 0.6:
            continue
        trouve.append((largeur * hauteur, largeur, hauteur, mn, mx, o.name))
    trouve.sort(reverse=True, key=lambda t: t[0])
    return trouve


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

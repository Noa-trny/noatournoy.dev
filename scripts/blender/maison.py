# La maison, ecrite plutot que modelee.
#
# Pourquoi du code : la trajectoire de camera et le placement des vitrines vont
# demander beaucoup d'allers-retours. Une maison parametree se reajuste en
# changeant un nombre et se relit dans une revue de code — un .blend, non.
#
#   blender --background --python scripts/blender/maison.py -- --render
#   blender --background --python scripts/blender/maison.py -- --bake --export
#
# Le brutalisme se prete a l'exercice : ce sont des dalles, des refends et des
# porte-a-faux. Ce qui fera le realisme n'est pas la geometrie mais les
# chanfreins, l'occlusion cuite et la matiere du beton.

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector

# --------------------------------------------------------------- parametres
# Tout est en metres, a l'echelle reelle : la camera a un plan proche a 0,1 m et
# une maison a la mauvaise echelle donnerait des perspectives fausses.

M = {
    # Emprise. La facade vitree est en z = 0, la maison s'enfonce vers -z ;
    # la camera arrive de +z.
    "largeur": 18.0,          # x, de -9 a +9
    "profondeur": 24.0,       # z, de 0 a -24
    "h_rdc": 4.1,             # hauteur libre du rez-de-chaussee
    "ep_dalle": 0.80,         # epaisseur des dalles de plancher
    "h_etage": 3.2,
    "debord": 3.0,            # porte-a-faux de la dalle haute sur la facade
    # La baie que la camera traverse.
    "baie_l": 7.2,
    "baie_h": 2.9,
    "baie_x": 0.0,            # centree
    "allege": 0.35,           # hauteur du seuil sous la baie
    # Le couloir des vitrines, entre la baie et le garage.
    "couloir_l": 6.0,
    "couloir_z0": -2.0,
    "couloir_z1": -15.0,
    # Le garage, au fond.
    "garage_l": 9.0,
    "garage_z0": -15.0,
    "garage_z1": -24.0,
    "garage_h": 3.4,
    # Les refends verticaux qui rythment la facade.
    "refend_ep": 0.60,
    "chanfrein": 0.018,       # 12 mm : le beton coffre n'a jamais d'arete vive
}

SORTIE = os.environ.get("MAISON_OUT", os.path.expanduser("~/maison"))


# ------------------------------------------------------------------ outillage

def vider():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def B(x, h, p):
    """
    Convertit nos coordonnees semantiques en coordonnees Blender.

    On raisonne en (x lateral, h hauteur, p profondeur) parce que c'est la
    convention de three.js et qu'on veut pouvoir relire les cotes en pensant a
    la scene web. Blender, lui, est Z-up : sa hauteur est z et sa profondeur y.
    Tout passe par ici, donc l'erreur ne peut se produire qu'a un seul endroit.

    L'exportateur glTF refait ensuite la conversion inverse vers le Y-up de la
    scene web : on n'a donc rien a corriger cote three.js.
    """
    return (x, p, h)


def boite(nom, centre, taille, collection=None):
    """Une boite alignee sur les axes, en coordonnees SEMANTIQUES (x, h, p)."""
    me = bpy.data.meshes.new(nom)
    ob = bpy.data.objects.new(nom, me)
    (collection or bpy.context.scene.collection).objects.link(ob)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bm.to_mesh(me)
    bm.free()
    ob.location = Vector(B(*centre))
    ob.scale = Vector(B(*taille))
    return ob


def appliquer_echelle(objets):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objets:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objets[0]
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)


def difference(cible, outil):
    """Booleen soustractif, applique immediatement."""
    mod = cible.modifiers.new(name="decoupe", type="BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.object = outil
    mod.solver = "EXACT"
    bpy.context.view_layer.objects.active = cible
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(outil, do_unlink=True)


def chanfreiner(ob, largeur=None, segments=2):
    """
    Le detail qui trahit le plus vite une image de synthese : une arete
    parfaitement vive n'existe pas en beton coffre. Un chanfrein de 12 mm
    accroche la lumiere et suffit a faire basculer la lecture.
    """
    mod = ob.modifiers.new(name="chanfrein", type="BEVEL")
    mod.width = largeur if largeur is not None else M["chanfrein"]
    mod.segments = segments
    mod.limit_method = "ANGLE"
    mod.angle_limit = math.radians(35)
    mod.harden_normals = False


# ---------------------------------------------------------------- materiaux

def mat_beton():
    m = bpy.data.materials.new("beton")
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    # Le beton n'est pas gris neutre : il tire vers le chaud et n'est jamais
    # uniforme. La variation viendra des textures cote web ; ici on cuit
    # surtout l'occlusion, donc une base claire suffit.
    bsdf.inputs["Base Color"].default_value = (0.30, 0.293, 0.278, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.88
    bsdf.inputs["Metallic"].default_value = 0.0
    return m


def mat_verre():
    m = bpy.data.materials.new("verre")
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.85, 0.9, 0.9, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.04
    bsdf.inputs["Metallic"].default_value = 0.0
    # La transmission reste ici pour le rendu Blender ; cote web la baie sera
    # une simple nappe reflechissante, la refraction etant invisible sur une
    # vitre plane et couteuse a calculer par frame.
    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = 0.92
    return m


def mat_sol():
    m = bpy.data.materials.new("sol")
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.30, 0.30, 0.31, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.55
    return m


# ---------------------------------------------------------------- la maison

def construire():
    beton, verre, sol = mat_beton(), mat_verre(), mat_sol()
    L, P = M["largeur"], M["profondeur"]
    hr, ed, he = M["h_rdc"], M["ep_dalle"], M["h_etage"]
    zc = -P / 2.0  # centre en profondeur

    pieces = []

    # --- le terrain, une simple dalle affleurante -------------------------
    terrain = boite("terrain", (0, -1.0, zc + 6), (400.0, 2.0, 400.0))
    terrain.data.materials.append(sol)

    # --- dalle basse ------------------------------------------------------
    d0 = boite("dalle_rdc", (0, -ed / 2, zc), (L, ed, P))
    pieces.append(d0)

    # --- dalle haute, en porte-a-faux sur la facade ------------------------
    # Le debord est ce qui donne l'ombre portee horizontale du brutalisme.
    y1 = hr
    d1 = boite(
        "dalle_etage",
        (0, y1 + ed / 2, zc + M["debord"] / 2),
        (L + 1.2, ed, P + M["debord"]),
    )
    pieces.append(d1)

    # --- toiture ----------------------------------------------------------
    y2 = hr + ed + he
    d2 = boite(
        "toiture",
        (0, y2 + ed / 2, zc + M["debord"] / 2),
        (L + 1.2, ed, P + M["debord"]),
    )
    pieces.append(d2)

    # --- murs pignons, pleins ---------------------------------------------
    for s in (-1, 1):
        mur = boite(
            f"pignon_{'g' if s < 0 else 'd'}",
            (s * (L / 2 - M['refend_ep'] / 2), (y2 + ed) / 2, zc),
            (M["refend_ep"], y2 + ed, P),
        )
        pieces.append(mur)

    # --- facade : allege, linteau, et deux refends encadrant la baie -------
    zf = -M["refend_ep"] / 2  # la facade a une epaisseur, centree sur z=0

    allege = boite("allege", (0, M["allege"] / 2, zf), (L, M["allege"], M["refend_ep"]))
    pieces.append(allege)

    y_baie0 = M["allege"]
    y_baie1 = M["allege"] + M["baie_h"]
    linteau_h = hr - y_baie1
    if linteau_h > 0.05:
        lint = boite(
            "linteau",
            (0, y_baie1 + linteau_h / 2, zf),
            (L, linteau_h, M["refend_ep"]),
        )
        pieces.append(lint)

    # Les deux jambages qui bornent la baie.
    jamb_l = (L - M["baie_l"]) / 2.0
    for s in (-1, 1):
        j = boite(
            f"jambage_{'g' if s < 0 else 'd'}",
            (s * (M["baie_l"] / 2 + jamb_l / 2), (y_baie0 + y_baie1) / 2, zf),
            (jamb_l, M["baie_h"], M["refend_ep"]),
        )
        pieces.append(j)

    # --- l'etage : une facade pleine percee de fentes horizontales ---------
    fac_et = boite(
        "facade_etage",
        (0, hr + ed + he / 2, zf),
        (L, he, M["refend_ep"]),
    )
    # Trois fentes : le rythme vertical qui casse la masse.
    for i, xo in enumerate((-5.4, 0.0, 5.4)):
        outil = boite(
            f"fente_{i}",
            (xo, hr + ed + he * 0.62, zf),
            (3.2, 0.85, M["refend_ep"] * 3),
        )
        appliquer_echelle([outil])
        appliquer_echelle([fac_et])
        difference(fac_et, outil)
    pieces.append(fac_et)

    # Un fond sombre derriere les fentes : sans lui, ce sont des trous noirs
    # decoupes dans une facade, et l'oeil lit un decor de carton.
    interieur = boite(
        "interieur_etage",
        (0, hr + ed + he / 2, -1.6),
        (L - M["refend_ep"] * 2, he, 2.0),
    )
    appliquer_echelle([interieur])
    fond_mat = bpy.data.materials.new("interieur")
    fond_mat.use_nodes = True
    fond_mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.05, 0.05, 0.055, 1.0)
    fond_mat.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.7
    interieur.data.materials.append(fond_mat)

    # --- refends interieurs, qui bordent le couloir des vitrines ----------
    for s in (-1, 1):
        r = boite(
            f"refend_couloir_{'g' if s < 0 else 'd'}",
            (
                s * (M["couloir_l"] / 2 + M["refend_ep"] / 2),
                hr / 2,
                (M["couloir_z0"] + M["couloir_z1"]) / 2,
            ),
            (
                M["refend_ep"],
                hr,
                abs(M["couloir_z1"] - M["couloir_z0"]),
            ),
        )
        pieces.append(r)

    # --- le garage : un volume plus bas, ouvert sur le couloir -------------
    gz = (M["garage_z0"] + M["garage_z1"]) / 2
    gp = abs(M["garage_z1"] - M["garage_z0"])
    for s in (-1, 1):
        g = boite(
            f"garage_mur_{'g' if s < 0 else 'd'}",
            (s * (M["garage_l"] / 2 + M["refend_ep"] / 2), M["garage_h"] / 2, gz),
            (M["refend_ep"], M["garage_h"], gp),
        )
        pieces.append(g)
    fond = boite(
        "garage_fond",
        (0, M["garage_h"] / 2, M["garage_z1"] - M["refend_ep"] / 2),
        (M["garage_l"] + M["refend_ep"] * 2, M["garage_h"], M["refend_ep"]),
    )
    pieces.append(fond)
    plafond_g = boite(
        "garage_plafond",
        (0, M["garage_h"] + ed / 2, gz),
        (M["garage_l"] + M["refend_ep"] * 2, ed, gp),
    )
    pieces.append(plafond_g)

    appliquer_echelle(pieces + [terrain])
    for p in pieces:
        p.data.materials.append(beton)
        chanfreiner(p)
    chanfreiner(terrain, largeur=0.004, segments=1)

    # --- la vitre de la baie ----------------------------------------------
    vitre = boite(
        "baie_vitree",
        (M["baie_x"], (y_baie0 + y_baie1) / 2, zf - M["refend_ep"] * 0.55),
        (M["baie_l"], M["baie_h"], 0.024),
    )
    appliquer_echelle([vitre])
    vitre.data.materials.append(verre)

    return pieces, vitre, terrain


# ------------------------------------------------------------------- lumiere

def oriente_vers(ob, depuis, vers):
    """Oriente un objet (camera ou soleil) d'un point vers un autre."""
    d = Vector(B(*vers)) - Vector(B(*depuis))
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def eclairer():
    """
    L'equilibre soleil / ciel est ce qui decide si la maison a du relief.

    Au premier essai le ciel etait a 1,15 et le soleil a 3,2 : le ciel eclairait
    tout uniformement et noyait les ombres portees, si bien que les
    porte-a-faux — qui SONT le sujet en brutalisme — ne se lisaient plus. Un
    ciel faible et un soleil franc, et le volume revient.
    """
    soleil = bpy.data.objects.new("soleil", bpy.data.lights.new("soleil", "SUN"))
    bpy.context.scene.collection.objects.link(soleil)
    soleil.data.energy = 2.6
    # Rasant, venant de l'avant-gauche : c'est cette incidence qui creuse les
    # debords et pose l'ombre horizontale sous la dalle haute.
    oriente_vers(soleil, depuis=(-16.0, 14.0, 22.0), vers=(0.0, 2.0, -6.0))
    soleil.data.angle = math.radians(0.9)

    monde = bpy.data.worlds.new("ciel")
    bpy.context.scene.world = monde
    monde.use_nodes = True
    nt = monde.node_tree
    sortie = next((n for n in nt.nodes if n.bl_idname == "ShaderNodeOutputWorld"), None)
    fond = next((n for n in nt.nodes if n.bl_idname == "ShaderNodeBackground"), None)
    if fond is None:
        fond = nt.nodes.new("ShaderNodeBackground")
    if sortie and not sortie.inputs[0].is_linked:
        nt.links.new(fond.outputs[0], sortie.inputs[0])

    # Un ciel uni, et c'est tout.
    #
    # J'ai essaye un degrade construit en noeuds : il rendait noir, et le
    # diagnostic a montre que les liens ne se posaient pas comme demande — un
    # Background branche sur un SeparateXYZ. Ce ciel ne sert qu'a EclAIRER la
    # maison pendant que je juge des proportions ; la scene web aura le sien.
    # Ne pas payer trois iterations pour un decor qu'on jettera.
    fond.inputs["Color"].default_value = (0.42, 0.52, 0.68, 1.0)
    fond.inputs["Strength"].default_value = 1.5


def camera(position, cible, focale=38.0, nom="cam"):
    cam = bpy.data.objects.new(nom, bpy.data.cameras.new(nom))
    bpy.context.scene.collection.objects.link(cam)
    cam.location = Vector(B(*position))
    cam.data.lens = focale
    oriente_vers(cam, position, cible)
    return cam


# -------------------------------------------------------------------- rendu

def rendre(chemin, cam, largeur=1280, hauteur=800, echantillons=48):
    sc = bpy.context.scene
    sc.camera = cam
    sc.render.engine = "CYCLES"
    sc.cycles.samples = echantillons
    sc.cycles.use_denoising = True
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "OPTIX"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = d.type in ("OPTIX", "CPU")
        sc.cycles.device = "GPU"
    except Exception as e:
        print("  (rendu CPU :", e, ")")
    sc.render.resolution_x = largeur
    sc.render.resolution_y = hauteur
    sc.render.film_transparent = False
    sc.view_settings.view_transform = "AgX"
    sc.render.filepath = chemin
    sc.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)
    print("  rendu ->", chemin)


# --------------------------------------------------------------------- main

def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    os.makedirs(SORTIE, exist_ok=True)

    vider()
    construire()
    eclairer()

    if "--render" in argv or not argv:
        vues = [
            # Le plan d'ouverture : la facade vue de la rue.
            ("01-facade", (0.0, 3.4, 30.0), (0.0, 3.4, -4.0), 42.0),
            # Trois quarts, pour lire le porte-a-faux et la profondeur.
            ("02-trois-quarts", (21.0, 6.5, 22.0), (0.0, 3.0, -9.0), 34.0),
            # A l'aplomb de la baie, juste avant la traversee.
            ("03-baie", (1.2, 1.8, 8.5), (0.0, 1.9, -8.0), 30.0),
            # Dans le couloir, la ou vivront les six vitrines.
            ("04-couloir", (0.0, 1.7, -3.0), (0.0, 1.6, -16.0), 30.0),
        ]
        for nom, pos, cible, foc in vues:
            rendre(os.path.join(SORTIE, f"{nom}.png"), camera(pos, cible, foc, nom))

    print("  termine.")


main()

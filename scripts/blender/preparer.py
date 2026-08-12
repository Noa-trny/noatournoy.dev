# Prepare le modele telecharge pour la scene web.
#
#   blender --background --python scripts/blender/preparer.py -- <source.glb> [--render] [--export <sortie.glb>]
#
# Quatre operations, dans cet ordre :
#
#   1. Jeter le terrain. Le fichier livre 92 x 75 m de pelouse, de gravier et
#      d'allee. La camera ne les verra jamais.
#   2. Decimer les monstres. Dix maillages totalisent 403 600 triangles — 71 %
#      du modele — pour des poignees et des rails de 2 cm. La silhouette n'y
#      touche pas ; c'est le meilleur rapport gain/risque du lot.
#   3. Retexturer l'enveloppe en beton. C'est l'operation qui fait basculer la
#      maison : elle arrive en brique beige de banlieue neo-zelandaise, elle
#      doit repartir en beton banche.
#   4. Ne PAS toucher au verre. Son materiau s'appelle `Glass` et ce nom est ce
#      qui permettra, cote web, de faire disparaitre la vitre au moment ou la
#      camera la franchit.

import bpy
import math
import os
import sys
from mathutils import Vector

ICI = os.path.dirname(os.path.abspath(__file__))
TEX = os.environ.get(
    "MAISON_TEX",
    r"C:/Users/Noato/OneDrive/Documents/GitHub/.noatournoy-atelier/maison/textures",
)
SORTIE = os.environ.get("PREP_OUT", os.path.expanduser("~/prep"))

# --- LES PROFILS ------------------------------------------------------------
#
# Un profil par modele source, plutot qu'une copie du script par modele. Les
# noms de materiaux sont la seule chose qui change vraiment d'un fichier a
# l'autre ; tout le reste — jeter, decimer, retexturer, recentrer — est le meme
# travail. Dupliquer le script aurait fait diverger les corrections, et il y en
# a eu beaucoup.

PROFILS = {
    # ------------------------------------------------------------- le pavillon
    # Premier modele. Abandonne : 8 m de degagement interieur la ou il en
    # fallait vingt. Le profil reste, il documente ce qui a ete appris.
    "pavillon": {
        # Le terrain et ses accessoires. La scene web posera son propre sol.
        "jeter": {"Grass", "Soil", "Gravel", "Water"},
        # L'enveloppe, reperee par ORIENTATION plutot que par nom : une analyse
        # des surfaces verticales a montre que les noms trompent.
        # `Colorsteel__Sandstone_Grey`, que je prenais pour le bardage, fait
        # 1876 m2 horizontaux contre 137 verticaux — c'est la terrasse. Le vrai
        # mur, 662 m2 verticaux sur toute la hauteur, est `Metal__Bronze`.
        "beton": {
            "Metal__Bronze",              # les murs et le bandeau
            "Paint__White",               # 418 m2 verticaux
            "Wood__Plywood",              # 263 m2 verticaux
            "Masonry_Block",
            "Concrete",
            "Paint__Gray__170",
            "Paint__Gray__190",
            "Colorsteel__Sandstone_Grey", # la terrasse
            "Colorsteel__Flaxpod",
            "Unispan",                    # la dalle
        },
        "echelle": None,
        "plafond_petit": 4000,
        "plafond_grand": 12000,
        "projection": "BOX",
    },
    # ----------------------------------------------------------------- la villa
    # Modele retenu : 17,4 m de degagement rectiligne interieur, sur deux
    # niveaux, avec une 911 deja garee devant le garage.
    "villa": {
        # ON NE JETTE PRESQUE RIEN, et c'est un renversement assume.
        #
        # J'avais retire la vegetation, les rochers, le terrain et les jardinieres
        # — 566 000 triangles — au motif que la camera ne les regarde pas. C'est
        # vrai qu'elle ne les regarde pas ; c'est faux qu'ils ne servent a rien.
        # Ce sont eux qui posent la maison dans un lieu. Sans eux elle flotte sur
        # un plan gris, et c'est exactement ce que rendait la scene.
        #
        # Ne partent donc que les objets vraiment invisibles depuis le trajet :
        # le detail de cuisine, qui coute deux fois — le robinet dore fait 53 000
        # triangles, la passoire 45 000, le pot d'epices 35 000, et chacun de ces
        # objets minuscules traine ses trois cartes de texture.
        "jeter": {
            # LES DEUX GRANDS ARBRES, et pour une raison qui ne se devine pas :
            # ils ne survivent pas a la decimation. Un feuillage de ce genre est
            # fait de cartes plates portant une texture a canal alpha ; l'algo
            # « collapse » fusionne des aretes en supposant une surface, et il
            # effondre donc les cartes en triangles pointus. Le rendu montrait
            # des sapins de papier crepon a la place des houppiers.
            #
            # Les garder intacts coutait 167 000 triangles a eux seuls, et ils
            # se plantaient de toute façon en travers de la facade. Le bonsai,
            # les fougeres, les rochers et les jardinieres restent : ils posent
            # la maison dans un lieu sans barrer la vue.
            "LC_Oak_Tree_Material", "LC_Oak_Tree_Material1",
            "LC_Dogwood_Tree_Material", "LC_Dogwood_Tree_Material1",
            "Faucet2Brass", "Faucet2Plastic", "Gold",
            "Sink2", "Sink2Metal", "Sink3Colander", "Sink3Gird", "Sink3Metal",
            "Sink3OutMetal", "Sink3Wood", "Sink_3_Wood2",
            "SpiceJarGlass", "SpicejarMetal", "SpicyRackMetal",
            "CayennePepper", "BlackPepper", "Oregano", "Salt",
        },
        # AUCUN RETEXTURAGE. Le pavillon arrivait en brique beige de banlieue et
        # demandait a etre sauve ; cette villa a son identite — enduit blanc,
        # pierre doree, bois — et c'est elle qu'on est venu chercher. La passer
        # en beton banche revenait a acheter un modele pour effacer ce qui le
        # distinguait.
        "beton": set(),
        # La vegetation est decimee bien plus durement que l'architecture. Une
        # arete de mur decimee se voit au premier coup d'oeil ; un feuillage, non
        # — c'est deja du bruit. Le chene passe de 69 000 triangles a 6 000 sans
        # que la silhouette bouge.
        # Le feuillage restant est decime avec MENAGEMENT, pas durement : c'est
        # la meme mecanique de cartes alpha que celle qui a detruit les grands
        # arbres, simplement a une echelle ou elle se voit moins.
        "plafond_par_materiau": {
            "ferns_1": 6000, "trop_leav_4": 6000, "trop_leav_5": 6000,
            "GG050089": 12000, "GG050091": 12000,
            "Rock05": 3000, "Rock08": 3000,
            "PDM_Ceramic_Wallscape_Planters_Material_13": 1500,
            "PDM_Ceramic_Wallscape_Planters_Material_14": 1500,
            "PDM_Ceramic_Wallscape_Planters_Material_15": 1500,
            "PDM_Galvanized_Planters_Material_05": 1500,
        },
        "textures_fines": set(),
        "projection": "UV",
        # Les marques ne se cedent pas. Le modeleur peut nous accorder son droit
        # d'auteur par une licence CC BY ; personne ne peut nous accorder
        # « Porsche » ni « 911 », qui sont des marques deposees, et un portfolio
        # est un usage dans la vie des affaires.
        #
        # Renommer ne debadge pas la carrosserie — l'ecusson et le lettrage
        # vivent dans la texture et demandent une passe de peinture. Mais les
        # noms partent dans le glTF servi, donc dans quelque chose d'indexable,
        # et ça c'est gratuit a corriger.
        # Le debadgeage visuel. Renommer les maillages ne suffisait pas : les
        # marques sont PEINTES dans l'atlas de carrosserie — ecusson de
        # Stuttgart sur le capot, lettrage du hayon, cache-moyeux, moyeu de
        # volant, etriers de frein graves. `scripts/atelier/debadger.py` les
        # recouvre en echantillonnant la mediane du pourtour de chaque zone,
        # pour que la piece garde la couleur de son voisinage.
        "remplacer_textures": {"SportsCarBody": "carrosserie-debadgee.png"},
        "renommer": {
            "911Body": "SportsCarBody",
            "911Glass": "SportsCarGlass",
            "Porsche": "SportsCar",
        },
        "echelle": 1.0 / 7.90,
        "plafond_petit": 3000,
        "plafond_grand": 14000,
    },
}

# Rempli par main() une fois le profil choisi.
MATERIAUX_TERRAIN = set()
MATERIAUX_ENVELOPPE = set()
PLAFOND_PETIT = 4000
PLAFOND_GRAND = 12000
PLAFOND_MATERIAU = {}
ECHELLE = None
PROJECTION = "BOX"


def maillages():
    return [o for o in bpy.context.scene.objects if o.type == "MESH"]


def triangles(o):
    o.data.calc_loop_triangles()
    return len(o.data.loop_triangles)


def dim_max(o):
    mn = Vector((1e9, 1e9, 1e9))
    mx = Vector((-1e9, -1e9, -1e9))
    for c in o.bound_box:
        p = o.matrix_world @ Vector(c)
        mn = Vector((min(mn[i], p[i]) for i in range(3)))
        mx = Vector((max(mx[i], p[i]) for i in range(3)))
    d = mx - mn
    return max(d.x, d.y, d.z)


def materiaux_de(o):
    return {s.material.name for s in o.material_slots if s.material}


# ---------------------------------------------------------------- 1. nettoyer

def jeter_le_terrain():
    partis = 0
    tris = 0
    for o in list(maillages()):
        if materiaux_de(o) & MATERIAUX_TERRAIN:
            tris += triangles(o)
            bpy.data.objects.remove(o, do_unlink=True)
            partis += 1
    print(f"  terrain      : {partis} maillage(s) retire(s), {tris} triangles")


# --------------------------------------------------------------- 1 ter. renommer

def renommer(table):
    """Efface les noms de marque des maillages et des materiaux.

    Un fichier glTF transporte les noms tels quels, et un fichier servi est un
    fichier indexable. C'est la partie du debadgeage qui ne coute rien ; celle
    qui touche la carrosserie demande une passe de texture.
    """
    if not table:
        return
    n = 0
    for coll in (bpy.data.objects, bpy.data.materials, bpy.data.meshes):
        for item in coll:
            nom = item.name
            for avant, apres in table.items():
                if avant in nom:
                    nom = nom.replace(avant, apres)
            if nom != item.name:
                item.name = nom
                n += 1
    print(f"  renommage    : {n} nom(s) sans marque deposee")


# ------------------------------------------------------- 1 bis. mettre a l'echelle

def mettre_a_l_echelle():
    """
    Ramene le modele au metre.

    Un modele hors d'echelle ne se voit pas : il rend exactement pareil, et tout
    ce qu'on ecrit ensuite est faux d'un facteur constant — hauteur d'oeil,
    vitesse de camera, distance de plan proche, portee des ombres. La villa est
    livree a 7,90x, ce qui n'apparait dans aucune fiche.

    On met a l'echelle les RACINES de la scene, pas les maillages : l'importateur
    glTF range tout sous une hierarchie de noeuds vides, si bien qu'aucun
    maillage n'est sans parent. La meme erreur avait rendu le recentrage inerte
    sur le modele precedent — il annonçait un deplacement sans rien deplacer.
    """
    if not ECHELLE or abs(ECHELLE - 1.0) < 1e-6:
        return
    racines = [o for o in bpy.context.scene.objects if o.parent is None]
    for o in racines:
        o.scale *= ECHELLE
        o.location *= ECHELLE
    bpy.context.view_layer.update()
    print(f"  echelle      : x{ECHELLE:.5f} sur {len(racines)} racine(s)"
          f" (le modele arrivait a {1/ECHELLE:.2f}x)")


# ------------------------------------------------- 1 quater. remplacer des cartes

def atteint_base_color(arbre, depart, profondeur=6):
    """Le noeud alimente-t-il, directement ou non, l'entree de couleur de base ?

    LA COMPARAISON SE FAIT PAR NOM, ET C'EST OBLIGATOIRE. Les objets que `bpy`
    rend sont des enveloppes transitoires autour des donnees de Blender : le
    noeud obtenu en parcourant `nodes` et celui rendu par `link.from_node`
    decrivent la meme chose sans etre le meme objet Python. `is` y repond donc
    toujours faux — y compris sur un lien qui va droit du noeud a l'entree
    cherchee. Le remplacement annonçait zero carte sur un materiau qui en avait
    une, reliee directement, et rien dans le graphe n'expliquait pourquoi.
    """
    front = [depart.name]
    for _ in range(profondeur):
        suivants = []
        for nom in front:
            for l in arbre.links:
                if l.from_node.name != nom:
                    continue
                if l.to_socket.name == "Base Color":
                    return True
                suivants.append(l.to_node.name)
        if not suivants:
            return False
        front = suivants
    return False


def remplacer_textures(table):
    """Substitue une image de base a celle d'un materiau, par nom.

    Sert au debadgeage : la carrosserie porte ses marques dans sa texture, pas
    dans sa geometrie. On ne peut donc pas les retirer en supprimant un
    maillage — il faut repeindre l'atlas et le reinjecter ici, pour que
    l'operation se rejoue a chaque preparation au lieu d'etre un fichier
    retouche a la main qu'on oublie de refaire.
    """
    if not table:
        return
    n = 0
    for mat in bpy.data.materials:
        cible = next((v for k, v in table.items() if k in (mat.name or "")), None)
        if not cible or not mat.use_nodes:
            continue
        chemin = os.path.join(TEX, cible)
        if not os.path.exists(chemin):
            print(f"  ATTENTION   : {cible} introuvable, {mat.name} garde ses marques")
            continue
        img = bpy.data.images.load(chemin, check_existing=True)
        for noeud in mat.node_tree.nodes:
            if noeud.bl_idname != "ShaderNodeTexImage":
                continue
            # Uniquement la carte de COULEUR : remplacer une carte de relief ou
            # de rugosite par une image de couleur donnerait n'importe quoi.
            #
            # On SUIT LE GRAPHE au lieu de tester le lien direct. L'importateur
            # glTF intercale un noeud de melange des qu'un facteur de couleur de
            # base accompagne la texture — le premier test, qui cherchait une
            # arete allant droit sur « Base Color », ne trouvait donc jamais rien
            # et le remplacement annonçait zero carte.
            if atteint_base_color(mat.node_tree, noeud):
                noeud.image = img
                n += 1
    print(f"  debadgeage   : {n} carte(s) de couleur remplacee(s)")


# --------------------------------------------------------------- 2. decimer

def decimer():
    total_avant = 0
    total_apres = 0
    touches = 0
    for o in maillages():
        t = triangles(o)
        total_avant += t
        # Un plafond par MATIERE quand le profil en donne un : la vegetation
        # supporte une decimation que l'architecture ne supporte pas.
        plafond = PLAFOND_PETIT if dim_max(o) < 5.0 else PLAFOND_GRAND
        for mat in materiaux_de(o):
            if mat in PLAFOND_MATERIAU:
                plafond = min(plafond, PLAFOND_MATERIAU[mat])
        if t <= plafond:
            total_apres += t
            continue
        mod = o.modifiers.new("decim", "DECIMATE")
        mod.decimate_type = "COLLAPSE"
        mod.ratio = plafond / t
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.modifier_apply(modifier=mod.name)
        apres = triangles(o)
        total_apres += apres
        touches += 1
        if t > 20000:
            print(f"    {o.name[:46]:46s} {t:7d} -> {apres:6d}")
    print(f"  decimation   : {touches} maillage(s) reduit(s)")
    print(f"                 {total_avant} -> {total_apres} triangles "
          f"({100 * total_apres / max(total_avant, 1):.0f} %)")


# --------------------------------------------------- 2 bis. souder et lisser

def souder_et_lisser(seuil=0.0001, angle_deg=35.0):
    """
    Fusionne les sommets confondus et repasse en ombrage par angle.

    LE PLUS GROS POSTE DU FICHIER, et il ne se voit nulle part. Le bonsai
    sortait a 48 000 triangles pour 144 000 sommets — exactement trois par
    triangle, donc AUCUN sommet partage. Un maillage non indexe coute trois
    fois sa position, sa normale et sa coordonnee de texture.

    La soudure de `gltf-transform` n'y pouvait rien : elle ne fusionne que des
    sommets dont TOUS les attributs coincident, et ici les normales different
    corner par corner — heritage de l'ombrage plat et des normales
    personnalisees que la decimation laisse derriere elle. Elle recuperait
    0,12 Mo sur 6,9.

    Il faut donc traiter la cause, du cote Blender : effacer les normales
    personnalisees, fusionner par distance, puis reconstruire l'ombrage a partir
    d'un angle. Les aretes vives de l'architecture sont conservees — un angle de
    35 degres les depasse largement — et les surfaces organiques, feuillages en
    tete, retrouvent des sommets partageables.
    """
    from math import radians

    avant = sum(len(o.data.vertices) for o in maillages())
    for o in maillages():
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True)
        try:
            bpy.ops.mesh.customdata_custom_splitnormals_clear()
        except Exception:
            pass
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.mesh.remove_doubles(threshold=seuil)
        bpy.ops.object.mode_set(mode="OBJECT")
        try:
            # Blender 4.1 a retire `use_auto_smooth` au profit d'un operateur.
            bpy.ops.object.shade_smooth_by_angle(angle=radians(angle_deg))
        except Exception:
            bpy.ops.object.shade_smooth()
    apres = sum(len(o.data.vertices) for o in maillages())
    print(f"  soudure      : {avant} -> {apres} sommets "
          f"({100 * apres / max(avant, 1):.0f} %)")


# ------------------------------------------------------------ 3. retexturer

def carte(nt, nom_fichier, coord, non_couleur=False):
    img = bpy.data.images.load(os.path.join(TEX, nom_fichier), check_existing=True)
    if non_couleur:
        img.colorspace_settings.name = "Non-Color"
    n = nt.nodes.new("ShaderNodeTexImage")
    n.image = img
    # Projection BOX : le modele vient d'un export CAO et ses UV sont faits
    # pour ses propres textures, pas pour les notres. Une projection triplanaire
    # depuis les coordonnees objet donne un beton a l'echelle reelle sur toutes
    # les faces, sans dependre d'un depliage qu'on ne controle pas.
    if PROJECTION == "UV":
        n.projection = "FLAT"
    else:
        n.projection = "BOX"
        n.projection_blend = 0.30
    n.extension = "REPEAT"
    nt.links.new(coord, n.inputs["Vector"])
    return n


def materiau_beton(repere):
    m = bpy.data.materials.new("Beton_banche")
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]

    tc = nt.nodes.new("ShaderNodeTexCoord")
    tc.object = repere  # un repere commun : l'echelle du beton ne depend
                        # donc pas de l'origine de chaque objet
    mapping = nt.nodes.new("ShaderNodeMapping")
    # Une dalle de coffrage fait environ 2,4 m : c'est l'echelle qu'on vise.
    #
    # ET ELLE SE CORRIGE DU FACTEUR D'ECHELLE DU MODELE. La coordonnee vient de
    # `Texture Coordinate -> Object`, qui rend des unites de MODELE et non des
    # metres : mettre la villa a 1/7,9 ne change donc rien aux coordonnees de
    # texture, et le beton se retrouve repete pres de soixante fois par mur.
    # Le rendu ne montrait meme pas un motif trop petit, mais de fines rayures
    # verticales — un repliement pur et simple, la texture repetant plusieurs
    # fois par pixel.
    #
    # Le diagnostic est venu d'une elimination en trois rendus : beton en gris
    # uni (rayures parties, donc ce n'est pas la geometrie), carte diffuse
    # seule (rayures revenues, donc ce n'est pas la carte de relief), puis
    # balayage de l'echelle (0,42 et 3,3 rendent presque la meme image, donc le
    # probleme n'est pas dans la plage essayee mais deux ordres plus bas).
    e = float(os.environ.get("BETON_ECHELLE", "0.42")) * (ECHELLE or 1.0)
    mapping.inputs["Scale"].default_value = (e, e, e)
    # DEUX ORIGINES POSSIBLES POUR LA COORDONNEE, et le bon choix depend de la
    # provenance du modele.
    #
    # Le pavillon etait un export CAO : ses UV servaient ses propres textures et
    # ne valaient rien pour les notres, d'ou la projection triplanaire depuis un
    # repere commun. La villa est modelisee sous Blender et depliee proprement —
    # la meme projection triplanaire y rendait de fines rayures verticales que
    # ni l'echelle ni le choix des cartes n'expliquaient. Ses UV, elles,
    # existent et sont justes.
    nt.links.new(
        tc.outputs["UV" if PROJECTION == "UV" else "Object"], mapping.inputs["Vector"]
    )
    v = mapping.outputs["Vector"]

    diff = carte(nt, "beton_diffuse.jpg", v)
    nt.links.new(diff.outputs["Color"], bsdf.inputs["Base Color"])

    rough = carte(nt, "beton_rough.jpg", v, non_couleur=True)
    nt.links.new(rough.outputs["Color"], bsdf.inputs["Roughness"])

    nrm = carte(nt, "beton_normal.jpg", v, non_couleur=True)
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = 0.85
    nt.links.new(nrm.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], bsdf.inputs["Normal"])

    bsdf.inputs["Metallic"].default_value = 0.0
    return m


def retexturer():
    if not MATERIAUX_ENVELOPPE:
        print("  retexturage  : aucun — les materiaux d'origine sont conserves")
        verres = [m for m in bpy.data.materials if m.name.lower().startswith("glass")]
        for m in verres:
            if not m.use_nodes:
                continue
            b = m.node_tree.nodes.get("Principled BSDF")
            if b:
                b.inputs["Roughness"].default_value = 0.04
                b.inputs["Metallic"].default_value = 0.0
        print(f"  verre        : {len(verres)} materiau(x) — "
              + ", ".join(sorted(m.name for m in verres)))
        return
    repere = bpy.data.objects.new("repere_beton", None)
    bpy.context.scene.collection.objects.link(repere)
    repere.location = (0, 0, 0)

    beton = materiau_beton(repere)
    remplaces = 0
    for o in maillages():
        for slot in o.material_slots:
            if slot.material and slot.material.name in MATERIAUX_ENVELOPPE:
                slot.material = beton
                remplaces += 1
    print(f"  retexturage  : {remplaces} emplacement(s) passe(s) en beton banche")

    # Le verre reste nomme `Glass` : c'est la poignee qui servira, cote web,
    # a le faire disparaitre au franchissement.
    # Tout ce qui COMMENCE par « glass », pas seulement le nom exact. La villa
    # livre `Glass` et `Glassend` ; ne traiter que le premier laissait la moitie
    # du vitrage opaque au franchissement.
    verres = [m for m in bpy.data.materials if m.name.lower().startswith("glass")]
    for m in verres:
        if not m.use_nodes:
            continue
        b = m.node_tree.nodes.get("Principled BSDF")
        if not b:
            continue
        b.inputs["Roughness"].default_value = 0.04
        b.inputs["Metallic"].default_value = 0.0
        if "Transmission Weight" in b.inputs:
            b.inputs["Transmission Weight"].default_value = 0.9
    print(f"  verre        : {len(verres)} materiau(x) conserve(s) — "
          + ", ".join(sorted(m.name for m in verres)))


# ------------------------------------------------------------------ rendu

def recentrer():
    """
    Amene la maison a un repere utile : baie au centre, sol a zero.

    Le fichier livre place la maison entre x = -25 et x = 67, parce que
    l'origine est celle de la parcelle. Ecrire une courbe de camera dans ce
    repere revient a manipuler des nombres sans signification et a se tromper.
    Apres recentrage, la scene se lit toute seule : la camera arrive de +Z,
    franchit la baie en Z = 0, et s'enfonce vers les Z negatifs.
    """
    objets = maillages()
    verres = [o for o in objets
              if any(s.material and s.material.name.lower().startswith("glass")
                     for s in o.material_slots)]
    cible = verres or objets

    mn = Vector((1e9,) * 3); mx = Vector((-1e9,) * 3)
    for o in cible:
        for c in o.bound_box:
            p = o.matrix_world @ Vector(c)
            mn = Vector((min(mn[i], p[i]) for i in range(3)))
            mx = Vector((max(mx[i], p[i]) for i in range(3)))
    centre = (mn + mx) / 2.0

    # Le sol de reference est le BAS DU VITRAGE, pas le point le plus bas du
    # modele. Une baie toute hauteur pose sur le plancher ; le point le plus bas,
    # lui, est une fondation enterree — s'y fier plaçait le plancher a 2,99 m et
    # aurait mis la camera dans le vide sous la maison.
    sol = 1e9
    for o in cible:
        for c in o.bound_box:
            sol = min(sol, (o.matrix_world @ Vector(c)).z)

    # Blender est Z-up : x lateral, y profondeur, z hauteur.
    delta = Vector((-centre.x, -centre.y, -sol))
    # Les RACINES de la scene, pas les maillages : l'importateur glTF range
    # tout sous une hierarchie de noeuds vides, si bien qu'aucun maillage n'est
    # sans parent — la premiere version ne deplaçait donc rien du tout, en le
    # signalant quand meme dans le journal.
    racines = [o for o in bpy.context.scene.objects if o.parent is None]
    for o in racines:
        o.location += delta
    print(f"                 {len(racines)} racine(s) deplacee(s)")
    print(f"  recentrage   : deplace de ({delta.x:.2f}, {delta.y:.2f}, {delta.z:.2f})")
    print(f"                 baie desormais en (0, 0), sol a 0")


def redimensionner_textures(cote=1024, fines=(), cote_fin=1024):
    """
    Redimensionne les images DANS Blender, avant l'export.

    gltf-transform sait le faire, mais il passe par sharp/libvips, qui
    s'etrangle sur les textures de ce modele : « colourspace: parameter space
    not set ». Plutot que de chercher laquelle des quatorze est en cause,
    Blender les redimensionne toutes — il les a deja chargees.
    """
    n = 0
    for img in bpy.data.images:
        # Deux resolutions, pas une. Tout ramener a 1024 laissait 68 cartes en
        # 1024 pour quatre megaoctets, alors qu'une seule matiere est regardee
        # de pres. Le beton garde sa finesse, le reste passe en dessous — un
        # facteur deux sur le cote, donc quatre sur les octets.
        vise = cote_fin if any(f in img.name for f in fines) else cote
        # Surtout PAS de garde sur `has_data` : sans rendu prealable il vaut
        # False, et le redimensionnement ne touchait alors AUCUNE image — le
        # fichier partait avec des cartes en 2048, soit 22 Mo de VRAM chacune.
        w, h = img.size
        if w == 0 or h == 0:
            continue
        if max(w, h) <= vise:
            continue
        f = vise / max(w, h)
        img.scale(max(1, int(w * f)), max(1, int(h * f)))
        n += 1
    print(f"  textures     : {n} image(s) ramenee(s) — {cote} px, {cote_fin} pour le beton")


def eclairer_et_cadrer():
    monde = bpy.data.worlds.new("w")
    bpy.context.scene.world = monde
    monde.use_nodes = True
    fond = next(n for n in monde.node_tree.nodes if n.bl_idname == "ShaderNodeBackground")
    fond.inputs["Color"].default_value = (0.44, 0.52, 0.66, 1.0)
    fond.inputs["Strength"].default_value = 1.3

    soleil = bpy.data.objects.new("s", bpy.data.lights.new("s", "SUN"))
    bpy.context.scene.collection.objects.link(soleil)
    soleil.data.energy = 2.8
    soleil.data.angle = math.radians(1.0)
    soleil.rotation_euler = (math.radians(50), 0, math.radians(30))


def rendre(dossier):
    # On cadre sur le VITRAGE.
    #
    # Deux tentatives ratees avant celle-ci : l'emprise de la parcelle mettait
    # la camera a 67 m, et filtrer par altitude laissait encore l'esplanade de
    # 90 m qui decentrait tout. Le verre, lui, n'existe que dans la maison —
    # c'est l'ancrage le plus fiable, et il ne demande aucun seuil arbitraire.
    ancres = [o for o in maillages()
              if any(s.material and s.material.name.lower().startswith("glass")
                     for s in o.material_slots)]
    obj = ancres or maillages()
    mn = Vector((1e9, 1e9, 1e9)); mx = Vector((-1e9, -1e9, -1e9))
    for o in obj:
        for c in o.bound_box:
            p = o.matrix_world @ Vector(c)
            mn = Vector((min(mn[i], p[i]) for i in range(3)))
            mx = Vector((max(mx[i], p[i]) for i in range(3)))
    c = (mn + mx) / 2.0
    d = mx - mn
    r = max(d.x, d.y, 12.0) * 0.95

    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 40
    sc.cycles.use_denoising = True
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "OPTIX"; prefs.get_devices()
        for dev in prefs.devices:
            dev.use = dev.type in ("OPTIX", "CPU")
        sc.cycles.device = "GPU"
    except Exception:
        pass
    sc.render.resolution_x, sc.render.resolution_y = 1280, 800
    sc.view_settings.view_transform = "AgX"

    vues = [
        ("1-trois-quarts", Vector((c.x + r * 0.8, c.y - r * 0.8, c.z + d.z * 1.5)), c, 40.0),
        ("2-facade", Vector((c.x, c.y - r * 0.85, c.z + d.z * 0.6)), c, 45.0),
        ("3-baie", Vector((c.x, c.y - d.y * 0.9, c.z + d.z * 0.25)),
         Vector((c.x, c.y, c.z + d.z * 0.2)), 32.0),
    ]
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


# ----------------------------------------------------------------- main

def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if not argv:
        raise SystemExit("usage : ... -- <source.glb> [--render] [--export <sortie.glb>]")
    src = argv[0]
    os.makedirs(SORTIE, exist_ok=True)

    global MATERIAUX_TERRAIN, MATERIAUX_ENVELOPPE, ECHELLE, PROJECTION
    global PLAFOND_MATERIAU
    global PLAFOND_PETIT, PLAFOND_GRAND
    if "--profil" in argv:
        nom_profil = argv[argv.index("--profil") + 1]
    else:
        # Devine d'apres le nom du fichier, mais n'invente jamais : un profil
        # inconnu doit s'arreter, pas retomber sur celui d'un autre modele et
        # produire en silence un resultat faux.
        base = os.path.basename(src).lower()
        nom_profil = next((k for k in PROFILS if k[:5] in base), None)
        if nom_profil is None and "hillside" in base:
            nom_profil = "villa"
    if nom_profil not in PROFILS:
        raise SystemExit(
            f"profil inconnu pour « {os.path.basename(src)} » ; "
            f"precisez --profil parmi {sorted(PROFILS)}"
        )
    prof = PROFILS[nom_profil]
    MATERIAUX_TERRAIN = prof["jeter"]
    MATERIAUX_ENVELOPPE = prof["beton"]
    ECHELLE = prof["echelle"]
    PROJECTION = prof.get("projection", "BOX")
    PLAFOND_MATERIAU = prof.get("plafond_par_materiau", {})
    PLAFOND_PETIT = prof["plafond_petit"]
    PLAFOND_GRAND = prof["plafond_grand"]
    print(f"\n  profil       : {nom_profil}")

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=src)
    print(f"\n  importe      : {len(maillages())} maillages, "
          f"{sum(triangles(o) for o in maillages())} triangles")

    jeter_le_terrain()
    renommer(prof.get("renommer"))
    remplacer_textures(prof.get("remplacer_textures"))
    mettre_a_l_echelle()
    decimer()
    souder_et_lisser()
    retexturer()
    eclairer_et_cadrer()

    total = sum(triangles(o) for o in maillages())
    print(f"\n  RESULTAT     : {len(maillages())} maillages, {total} triangles")
    print(f"                 budget 300 000 : {'TENU' if total <= 300000 else 'DEPASSE'}")

    if "--render" in argv:
        rendre(SORTIE)

    if "--export" in argv:
        recentrer()
        redimensionner_textures(
            cote=512, fines=prof.get("textures_fines", ()), cote_fin=1024
        )
        cible = argv[argv.index("--export") + 1]
        os.makedirs(os.path.dirname(cible), exist_ok=True)
        bpy.ops.export_scene.gltf(
            filepath=cible,
            export_format="GLB",
            export_apply=True,
            export_yup=True,          # la scene web est en Y-up
            # On laisse les images dans leur format d'origine : sharp, que
            # gltf-transform utilise ensuite, s'etrangle sur les WebP ecrits
            # par Blender (« colourspace: parameter space not set »). Un seul
            # outil possede la compression, et c'est gltf-transform.
            export_image_format="WEBP",
            export_image_quality=80,
        )
        print("  exporte ->", cible, f"({os.path.getsize(cible)//1024} Ko)")


main()

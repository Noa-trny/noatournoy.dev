# Verifie que la camera ne traverse rien, sur TOUTE la longueur du trajet.
#
#   blender --background --python scripts/blender/degagement-trajet.py -- <modele.glb> <trajet.json>
#
# Le franchissement de la baie se controle en comparant deux nombres, et c'est
# ce que fait `scripts/verif/seuils.mts`. Mais un trajet peut tomber juste a cet
# endroit-la et raser un mur trente metres plus tot, ou passer au travers d'une
# jardiniere que personne n'a mesuree. La seule verification honnete est
# geometrique : pour chaque point echantillonne, chercher la surface la plus
# proche dans toutes les directions.
#
# Six rayons axiaux plutot qu'une distance exacte : Blender ne donne pas la
# distance a la geometrie la plus proche, et six directions suffisent a
# attraper un mur, un plancher ou un plafond. Ce qu'elles ratent — un poteau
# vu en diagonale — est rattrape par la densite de l'echantillonnage.

import bpy
import json
import sys
from mathutils import Vector

chemin_modele, chemin_trajet = sys.argv[sys.argv.index("--") + 1:][:2]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=chemin_modele)

trajet = json.load(open(chemin_trajet, encoding="utf-8"))
FRANCHIS = trajet.get("franchissements") or [trajet["glassT"]]

depsgraph = bpy.context.evaluated_depsgraph_get()
scene = bpy.context.scene

# glTF (Y en haut) -> Blender (Z en haut).
def B(p):
    return Vector((p["x"], -p["z"], p["y"]))


DIRECTIONS = [
    ("droite", Vector((1, 0, 0))),
    ("gauche", Vector((-1, 0, 0))),
    ("avant", Vector((0, -1, 0))),
    ("arriere", Vector((0, 1, 0))),
    ("haut", Vector((0, 0, 1))),
    ("bas", Vector((0, 0, -1))),
]

# Le seuil n'est pas arbitraire : le plan proche de la camera est a 0,10 m, donc
# tout ce qui passe sous cette distance est TRANCHE a l'ecran. On garde une
# marge confortable — une surface a moins de 30 cm remplit deja tout le cadre et
# se lit comme un accident, meme sans etre coupee.
PROCHE = 0.30
# Tolerance autour d'un vitrage, qu'on traverse expres.
#
# ELLE ETAIT DIX FOIS TROP LARGE. A 0,06 sur une trajectoire de quarante-cinq
# metres, la fenetre d'exclusion couvrait pres de trois metres de chemin de part
# et d'autre de chaque franchissement — assez pour que la camera traverse le MUR
# a cote de la baie sans que rien ne le signale. Le controle rendait « aucun
# passage sous le seuil » sur un trajet ou l'on passe visiblement dans un mur.
#
# A 0,008, l'exclusion ne couvre plus qu'un point d'echantillonnage de chaque
# cote, soit la vitre elle-meme et rien d'autre.
FRANCHISSEMENT = 0.008

alertes = []
mini = (1e9, None, None)

for pt in trajet["points"]:
    o = B(pt)
    for nom, d in DIRECTIONS:
        touche, impact, _, _, obj, _ = scene.ray_cast(depsgraph, o, d, distance=6.0)
        if not touche:
            continue
        dist = (impact - o).length
        if dist < mini[0]:
            mini = (dist, pt["t"], f"{nom} / {obj.name if obj else '?'}")
        if dist < PROCHE:
            # Le vitrage, on le traverse volontairement : c'est le climax.
            if any(abs(pt["t"] - f) < FRANCHISSEMENT for f in FRANCHIS):
                continue
            alertes.append((pt["t"], nom, round(dist, 3),
                            obj.name[:38] if obj else "?",
                            round(pt["x"], 2), round(pt["y"], 2), round(pt["z"], 2)))

print(f"\n=== DEGAGEMENT LE LONG DU TRAJET ({len(trajet['points'])} points) ===")
print(f"  seuil d'alerte : {PROCHE} m   (plan proche de la camera : 0,10 m)")
print("  franchissements exclus du controle : "
          + ", ".join(f"t={f:.4f}" for f in FRANCHIS))
print(f"  passage le plus etroit : {mini[0]:.3f} m a t={mini[1]}  vers {mini[2]}")

if not alertes:
    print("\n  AUCUN passage sous le seuil. Le trajet ne traverse rien.")
else:
    print(f"\n  {len(alertes)} point(s) trop pres :")
    for t, nom, dist, obj, x, y, z in alertes[:24]:
        print(f"    t={t:.4f}  {nom:8} {dist:5.2f} m   ({x:6.2f},{y:5.2f},{z:7.2f})   {obj}")
    if len(alertes) > 24:
        print(f"    ... et {len(alertes) - 24} autres")

"""Efface les marques deposees de l'atlas de carrosserie.

Deux droits se superposent sur ce modele, et un seul se cede. Le modeleur nous
accorde le sien par une licence CC BY ; « Porsche », « 911 » et l'ecusson de
Stuttgart sont des marques deposees que PERSONNE ne peut nous ceder, et un
portfolio est un usage dans la vie des affaires.

Renommer les maillages ne suffisait pas : les marques sont peintes dans la
texture. Ce script les recouvre.

La methode n'est pas un aplat arbitraire. Pour chaque zone, on prend la MEDIANE
d'un anneau juste autour d'elle et on remplit avec — la piece garde ainsi la
couleur de son voisinage, donc l'etrier reste jaune, le cache-moyeu reste gris
et le hayon reste noir. Un aplat choisi a la main jurerait a la premiere image.
"""

from PIL import Image, ImageDraw, ImageFilter
import statistics, sys, os

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
W, H = im.size
assert (W, H) == (512, 512), f"atlas inattendu : {W}x{H}"
px = im.load()


def mediane_autour(box, marge=6):
    """Couleur mediane d'un anneau entourant la zone, hors de la zone."""
    x0, y0, x1, y1 = box
    ech = [[], [], []]
    for x in range(max(0, x0 - marge), min(W, x1 + marge)):
        for y in range(max(0, y0 - marge), min(H, y1 + marge)):
            if x0 <= x < x1 and y0 <= y < y1:
                continue
            p = px[x, y]
            for i in range(3):
                ech[i].append(p[i])
    if not ech[0]:
        return (128, 128, 128)
    return tuple(int(statistics.median(c)) for c in ech)


def effacer(d, box, couleur=None, nom=""):
    c = couleur or mediane_autour(box)
    d.rectangle(box, fill=c)
    print(f"  {nom:26} {box}  <- rgb{c}")
    return c


d = ImageDraw.Draw(im)

# ---------------------------------------------------------------- les marques
#
# Coordonnees relevees sur l'atlas avec une grille de 32 px, puis elargies de
# quelques pixels : une bordure de marque qui depasse se voit autant que la
# marque.

# L'ecusson de Stuttgart, sur le capot. Le plus grand et le plus reconnaissable.
# Rempli d'un gris neutre plutot que du noir de sa tuile : la zone est mappee
# sur un badge en relief, et un badge noir se lirait comme un trou.
effacer(d, (258, 358, 380, 512), couleur=(126, 128, 131), nom="ecusson (capot)")

# Le lettrage du hayon. PREMIERE VERSION FAUSSE : j'avais relevé ses
# coordonnees dans le mauvais quadrant et repeint un rectangle gris par-dessus
# l'ecusson et la roue. Il est en haut a gauche, ecrit en miroir sur sa tuile
# noire — la mediane du pourtour rend donc exactement le noir voulu.
effacer(d, (112, 220, 254, 256), nom="lettrage hayon")

# Le cache-moyeu et le volant portent le meme ecusson en miniature.
effacer(d, (414, 442, 448, 478), nom="ecusson cache-moyeu")
effacer(d, (446, 30, 476, 58), nom="ecusson volant")

# Les etriers de frein sont graves. Deux jeux, jaune et rouge.
effacer(d, (18, 110, 96, 130), nom="etrier jaune (bas)")
effacer(d, (4, 84, 70, 100), nom="etrier jaune (haut)")
effacer(d, (2, 36, 44, 56), nom="etrier rouge")

# ------------------------------------------------------------------- finition
#
# Un rectangle parfaitement uniforme au milieu d'une texture bruitee se voit
# aussi. Un flou tres court sur les seules zones repeintes leur rend le grain
# de leur voisinage.
masque = Image.new("L", (W, H), 0)
dm = ImageDraw.Draw(masque)
for box in [
    (258, 358, 380, 512), (112, 220, 254, 256), (414, 442, 448, 478),
    (446, 30, 476, 58), (18, 110, 96, 130), (4, 84, 70, 100), (2, 36, 44, 56),
]:
    dm.rectangle((box[0] - 2, box[1] - 2, box[2] + 2, box[3] + 2), fill=255)
masque = masque.filter(ImageFilter.GaussianBlur(1.5))
im = Image.composite(im.filter(ImageFilter.GaussianBlur(1.2)), im, masque)

im.save(dst)
print(f"\n-> {dst}  ({os.path.getsize(dst)//1024} Ko)")

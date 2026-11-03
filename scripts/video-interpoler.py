# Remplace des images isolées (qui clignotent) par l'interpolation de leurs voisines,
# compensée par flot optique (OpenCV DIS) : bien plus rapide qu'un nouveau rendu Blender.
# Près d'une coupe de caméra ou d'une pièce qui apparaît ou disparaît, l'image est tirée
# d'une seule voisine (celle du même côté), déplacée d'une demi-image.
# L'original est gardé dans <dossier>/avant/ ; le fichier est réécrit (lien dur rompu :
# une autre version qui partage l'image reste intacte).
#
#   python3 scripts/video-interpoler.py scratch/v17/3d liste.json [--anim anim.json]
import argparse, json, os, cv2, numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('dossier')
ap.add_argument('liste', help='JSON : numéros d’images à remplacer')
ap.add_argument('--anim', help='anim.json de blender-export.mjs (coupes, pièces qui apparaissent)')
a = ap.parse_args()
P = lambda f: os.path.join(a.dossier, f'f_{f:05d}.jpg')
cuts, vis = set(), set()
if a.anim:
    an = json.load(open(a.anim, encoding='utf-8'))
    cam = np.array([c[:3] for c in an['cam']])
    cuts = {f for f in range(1, len(cam)) if np.linalg.norm(cam[f] - cam[f - 1]) > 0.3}
    st = {}
    for c in sorted(an['changes'], key=lambda c: c[0]):
        if c[1] in st and st[c[1]] != c[2]:
            vis.add(c[0])
        st[c[1]] = c[2]
dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
flow = lambda x, y: dis.calc(cv2.cvtColor(x, cv2.COLOR_BGR2GRAY), cv2.cvtColor(y, cv2.COLOR_BGR2GRAY), None)


def warp(img, fl):
    h, w = fl.shape[:2]
    gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    return cv2.remap(img, gx + fl[..., 0], gy + fl[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)


os.makedirs(os.path.join(a.dossier, 'avant'), exist_ok=True)
stats = {}
for f in json.load(open(a.liste)):
    prev, nxt = cv2.imread(P(f - 1)), cv2.imread(P(f + 1))
    gauche = f in cuts or f in vis          # rupture entre f-1 et f : prendre f+1
    droite = f + 1 in cuts or f + 1 in vis  # rupture entre f et f+1 : prendre f-1
    if gauche and droite:
        how = 'gardée'
    elif gauche:
        how, mid = 'suivante', warp(nxt, 0.5 * flow(prev, nxt))
    elif droite:
        how, mid = 'précédente', warp(prev, 0.5 * flow(nxt, prev))
    else:
        how = 'interpolée'
        mid = (0.5 * warp(prev, 0.5 * flow(nxt, prev)) + 0.5 * warp(nxt, 0.5 * flow(prev, nxt))).round().clip(0, 255).astype(np.uint8)
    stats[how] = stats.get(how, 0) + 1
    if how == 'gardée':
        continue
    keep = os.path.join(a.dossier, 'avant', f'f_{f:05d}.jpg')
    if not os.path.exists(keep):
        os.link(P(f), keep)
    os.remove(P(f))
    cv2.imwrite(P(f), mid, [cv2.IMWRITE_JPEG_QUALITY, 95])
print(stats)

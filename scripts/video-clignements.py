# Clignements : images isolées qui « sautent » (différentes de la précédente ET de la
# suivante), typiquement une image rendue avec d'autres réglages que ses voisines (veine du
# bois décalée). Un pic d'écart image à image suivi d'un second pic = une image isolée.
#
#   python3 scripts/video-clignements.py scratch/v17/3d/f_%05d.jpg 12090   (dossier d'images)
#   python3 scripts/video-clignements.py plancher.mp4                      (vidéo finale, 3D seulement)
# Écrit la liste des images isolées en JSON avec --out liste.json.
import argparse, json, subprocess, numpy as np, cv2
from scipy.ndimage import median_filter

ap = argparse.ArgumentParser()
ap.add_argument('source', help='motif d’images (f_%%05d.jpg) ou vidéo')
ap.add_argument('n', nargs='?', type=int, help='nombre d’images (motif seulement)')
ap.add_argument('--out')
a = ap.parse_args()
W, H = 1280, 540  # zone 3D de la vidéo (le bandeau est en dessous)


def frames():
    if '%' in a.source:
        for f in range(a.n):
            yield cv2.imread(a.source % f, cv2.IMREAD_GRAYSCALE)
    else:
        p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', a.source, '-vf', f'crop={W}:{H}:0:0,format=gray',
                              '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
        while len(b := p.stdout.read(W * H)) == W * H:
            yield np.frombuffer(b, np.uint8).reshape(H, W)


d, prev = [], None
for img in frames():
    x = img.astype(np.float32)
    d.append(0.0 if prev is None else float(np.abs(x - prev).mean()))
    prev = x
d = np.array(d)
r = d / (median_filter(d, 9) + 0.05)
pk = set(np.where((r > 1.6) & (d > 0.3))[0].tolist())
iso = sorted(i for i in pk if i + 1 in pk)  # l'image i diffère de i-1 et de i+1
print(f'{len(d)} images ; {len(pk)} pics d’écart ; {len(iso)} images isolées qui sautent : {iso[:30]}')
if len(iso) > 2:
    print('écarts entre elles (images) :', np.diff(iso)[:20].tolist())
if a.out:
    json.dump(iso, open(a.out, 'w'))

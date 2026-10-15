"""Composition de la vidéo du plancher (appelé par video-plancher.mjs).

Chaque image : la 3D (1280 x 540) sur le fond du bandeau, puis les calques du
segment (PNG transparents capturés par la page) aux opacités relevées par
window.__frame : le bandeau passe en fondu du segment précédent au suivant,
« Pourquoi » et le carton apparaissent et disparaissent en fondu. Les images
sont envoyées à ffmpeg (H.264, yuv420p, +faststart) ; image d'aperçu à 3,5 s.

  python3 scripts/video-plancher-compose.py <dossier> <i/s> <nombre d'images>
  python3 scripts/video-plancher-compose.py <dossier> <i/s> --stills 120,960
"""
import json
import os
import subprocess
import sys

from PIL import Image

out, fps = sys.argv[1], int(sys.argv[2])
stills = None
if sys.argv[3] == '--stills':
    stills = [int(x) for x in sys.argv[4].split(',')]
    total = max(stills) + 1
else:
    total = int(sys.argv[3])
levels = json.load(open(os.path.join(out, 'levels.json')))
cache = {}


def layer(name, i):
    key = (name, i)
    if key not in cache:
        p = os.path.join(out, 'layers', f'{name}_{i:02d}.png')
        cache[key] = Image.open(p).convert('RGBA') if os.path.exists(p) else None
    return cache[key]


def faded(img, a):
    if img is None or a <= 0.002:
        return None
    if a >= 0.998:
        return img
    r, g, b, al = img.split()
    return Image.merge('RGBA', (r, g, b, al.point(lambda v: int(v * a))))


BG = (21, 25, 28)


def frame(f):
    lv = levels[str(f)]
    i = lv['seg']
    im = Image.new('RGBA', (1280, 720), BG + (255,))
    img3d = Image.open(os.path.join(out, '3d', f'f_{f:05d}.jpg')).convert('RGBA')
    if img3d.size != (1280, 540):  # aperçu en demi-résolution
        img3d = img3d.resize((1280, 540), Image.BILINEAR)
    im.paste(img3d, (0, 0))
    band = layer('band', i)
    prev = layer('band', i - 1) if i > 0 else None
    if lv['text'] < 1 and prev is not None:
        # Fondu enchaîné du bandeau précédent au bandeau du segment.
        mix = Image.blend(prev, band, lv['text'])
    else:
        mix = band
    b = faded(mix, lv['band'])
    if b is not None:
        im.alpha_composite(b)
    for name, a in (('card', lv['card']), ('why', lv['why'])):
        lay = faded(layer(name, i), a)
        if lay is not None:
            im.alpha_composite(lay)
    tag = layer('tag', 0)
    if tag is not None:
        im.alpha_composite(tag)
    return im.convert('RGB')


if stills:
    for f in stills:
        frame(f).save(os.path.join(out, f'still_{f:05d}.jpg'), quality=90)
    sys.exit(0)

mp4 = os.path.join(out, 'plancher_foreuse_diamants.mp4')
enc = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '1280x720',
                        '-r', str(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '22',
                        '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], stdin=subprocess.PIPE)
for f in range(total):
    enc.stdin.write(frame(f).tobytes())
    if f % 1200 == 0:
        print(f'composition {f}/{total}', flush=True)
enc.stdin.close()
enc.wait()
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', '3.5', '-i', mp4, '-frames:v', '1', '-q:v', '4',
                os.path.join(out, 'plancher_poster.jpg')], check=True)
print('->', mp4)

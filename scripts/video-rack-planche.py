"""Planche-contact des plans de la vidéo du support de tiges : pour chaque plan
de chaque passage (src/video/rack-script.js), une image au début et une à la
fin, demandées au serveur d'images fixes (node scripts/video-rack.mjs --serve 5180).

  python3 -I scripts/video-rack-planche.py --out scratch/rack/planche [--only etape-05,etape-12] [--port 5180]

Écrit <out>/<passage>-<plan>-<a|b>.jpg et les planches <out>/planche-N.jpg
(4 colonnes, 20 images par planche, légende : passage, instant, titre)."""
import json
import os
import sys
import urllib.parse
import urllib.request

from PIL import Image, ImageDraw, ImageFont


def opt(name, default=None):
    return sys.argv[sys.argv.index('--' + name) + 1] if '--' + name in sys.argv else default


out = os.path.abspath(opt('out', 'scratch/rack/planche'))
port = opt('port', '5180')
only = opt('only').split(',') if opt('only') else None
os.makedirs(out, exist_ok=True)
base = f'http://localhost:{port}'


def get(path, **q):
    url = base + path + ('?' + urllib.parse.urlencode(q) if q else '')
    with urllib.request.urlopen(url, timeout=600) as r:
        return json.load(r)


segs = get('/segments')
shots = []
for s in segs:
    if only and s['id'] not in only:
        continue
    for k, sh in enumerate(s['shots']):
        end = s['shots'][k + 1]['t'] if k + 1 < len(s['shots']) else s['dur']
        # Début du plan une fois le glissement terminé, puis fin du plan.
        glide = 0 if sh.get('cut') else sh.get('glide', 1.4)
        for tag, t in (('a', min(end - 0.05, sh['t'] + glide + 0.05)), ('b', end - 0.05)):
            f = os.path.join(out, f"{s['id']}-{k + 1}-{tag}.jpg")
            r = get('/still', seg=s['id'], t=round(t, 2), out=f)
            if not r.get('ok'):
                raise SystemExit(r)
            shots.append((f, f"{s['id']} · plan {k + 1}{tag} · {t:.1f} s / {s['dur']} s", s['title']))
            print(shots[-1][1])

try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
except OSError:
    font = ImageFont.load_default()
W, H, PAD, COLS, PER = 480, 270, 26, 4, 20
for n in range(0, len(shots), PER):
    part = shots[n:n + PER]
    rows = (len(part) + COLS - 1) // COLS
    sheet = Image.new('RGB', (COLS * W, rows * (H + PAD)), (20, 22, 26))
    d = ImageDraw.Draw(sheet)
    for i, (f, cap, title) in enumerate(part):
        x, y = (i % COLS) * W, (i // COLS) * (H + PAD)
        sheet.paste(Image.open(f).convert('RGB').resize((W, H), Image.LANCZOS), (x, y + PAD))
        d.text((x + 6, y + 4), cap, fill=(255, 190, 120), font=font)
    name = os.path.join(out, f'planche-{n // PER + 1}.jpg')
    sheet.save(name, quality=88)
    print('->', name)

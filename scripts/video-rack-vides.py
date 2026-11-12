"""Contrôle des images tournées de la vidéo du support de tiges : cherche celles où la scène 3D manque
(image vide : il ne reste que le fond sombre et le bandeau). Une image par fichier distinct (les images
reprises d'un plan fixe sont des liens vers la même image).

  python3 -I scripts/video-rack-vides.py scratch/rack/video/images [seuil]

Code de sortie 1 si une image est suspecte (écart-type des gris au-dessus du bandeau sous le seuil, 9 par défaut)."""
import os
import sys

from PIL import Image, ImageStat

src = sys.argv[1]
seuil = float(sys.argv[2]) if len(sys.argv) > 2 else 9.0
seen = {}
for seg in sorted(os.listdir(src)):
    d = os.path.join(src, seg)
    if not os.path.isdir(d):
        continue
    for f in sorted(os.listdir(d)):
        p = os.path.join(d, f)
        ino = os.stat(p).st_ino
        if ino in seen:
            seen[ino][3] += 1
            continue
        im = Image.open(p)
        im.draft('L', (320, 180))
        top = im.convert('L').resize((160, 90)).crop((0, 0, 160, 66))  # au-dessus du bandeau
        seen[ino] = [seg, f, ImageStat.Stat(top).stddev[0], 1]
bad = [v for v in seen.values() if v[2] < seuil]
print(f'{len(seen)} images distinctes, {len(bad)} suspecte(s) (écart-type < {seuil})')
for seg, f, sd, k in bad:
    print(f'  {seg}/{f} : écart-type {sd:.1f}, reprise {k} fois → re-tourner : --only {seg}')
sys.exit(1 if bad else 0)

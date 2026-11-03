# Images à rendre dans Blender : une image identique à la précédente (aucun objet changé,
# même caméra, même transparence de la cage) n'est pas rendue, elle reprend l'image rendue
# avant elle. Écrit la liste à rendre (à passer à blender-plancher.py avec « @liste.json »)
# et la correspondance image → image rendue (pour assembler le dossier 3d/).
#
#   python3 scripts/blender-images.py anim.json --out dossier [--range a:b]
#     → dossier/images.json (liste à rendre) et dossier/dup.json ({image: image rendue})
import argparse, json, os

ap = argparse.ArgumentParser()
ap.add_argument('anim')
ap.add_argument('--out', required=True)
ap.add_argument('--range', help='a:b, images a à b-1 (toute la vidéo par défaut)')
a = ap.parse_args()
anim = json.load(open(a.anim, encoding='utf-8'))
A, B = map(int, a.range.split(':')) if a.range else (0, anim['frames'])
chg = {c[0] for c in anim['changes']}
cam, ghost = anim['cam'], anim['ghost']
render, dup, src = [], {}, None
for f in range(A, B):
    same = f > A and f not in chg and cam[f] == cam[f - 1] and ghost[f] == ghost[f - 1]
    if not same:
        src = f
        render.append(f)
    dup[f] = src
os.makedirs(a.out, exist_ok=True)
json.dump(render, open(os.path.join(a.out, 'images.json'), 'w'))
json.dump(dup, open(os.path.join(a.out, 'dup.json'), 'w'))
print(f'{len(render)} images à rendre sur {B - A} ({100 * (1 - len(render) / (B - A)):.0f} % reprises)')

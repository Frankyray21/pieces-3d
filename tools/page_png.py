"""Page du manuel en PNG lisible : python3 -I tools/page_png.py <eq> <Pxxx> <sortie.png> [x0 y0 x1 y1]
Coordonnées de recadrage en fractions de la page (0 à 1). Sans recadrage :
page entière réduite à 1100 px de haut ; avec : zone agrandie (2000 px max)."""
import sys
from PIL import Image
eq, page, out = sys.argv[1:4]
im = Image.open(f'/home/user/pieces-3d/public/equipment/{eq}/pages/{page}.webp').convert('L')
W, H = im.size
if len(sys.argv) >= 8:
    x0, y0, x1, y1 = map(float, sys.argv[4:8])
    im = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
    k = min(2000 / max(im.size), 3.0)
else:
    k = 1100 / H
im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.LANCZOS).save(out)
print(out, im.size, '→', (int(im.width * k), int(im.height * k)))

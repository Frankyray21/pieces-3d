# OCR des planches d'un manuel : lignes de texte (détection + reconnaissance) et
# bulles de repère (cercles + reconnaissance du numéro inscrit, tools/ocr_bulles.py).
# Une ligne JSON par planche : {sheet, w, h, lines: [[texte, x, y, l, h, conf]],
# bulles: [[repère, x, y, rayon, score]]}, coordonnées rapportées à la page.
# Usage : python3 tools/ocr_pages.py <dossier pages> <sortie.jsonl> <page> [<page> …]
# (pip install rapidocr-onnxruntime opencv-python-headless ; ~6 s par planche.)
# Résultats rangés dans tools/atelier/ocr/<id>.jsonl.gz pour build_atelier.py.
import sys, json, unicodedata, cv2, numpy as np
from rapidocr_onnxruntime import RapidOCR
eng = RapidOCR()
root, out = sys.argv[1], sys.argv[2]
pages = sys.argv[3:]
nk = lambda s: unicodedata.normalize('NFKC', s).strip()

sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import ocr_bulles as bub2

def bubbles(gray):
    h, w = gray.shape
    found = []
    for thr, close in ((150, False), (170, True)):
        ink_res = bub2.bubbles(gray, int(w * 0.005), int(w * 0.02), thr) if close else bub2_plain(gray, int(w * 0.005), int(w * 0.02), thr)
        for t, s, x, y, r in ink_res:
            if any((x - f[0]) ** 2 + (y - f[1]) ** 2 < (r * 0.8) ** 2 for f in found):
                k = next(i for i, f in enumerate(found) if (x - f[0]) ** 2 + (y - f[1]) ** 2 < (r * 0.8) ** 2)
                if s > found[k][4]: found[k] = (x, y, r, t, s)
                continue
            found.append((x, y, r, t, s))
    return [[t, round(x / w, 4), round(y / h, 4), round(r / w, 4), round(float(s), 2)] for x, y, r, t, s in found]

def bub2_plain(gray, rmin, rmax, thr):
    saved = bub2.cv2.morphologyEx
    bub2.cv2.morphologyEx = lambda img, *a, **k: img
    try:
        return bub2.bubbles(gray, rmin, rmax, thr)
    finally:
        bub2.cv2.morphologyEx = saved

with open(out, 'a') as f:
    for s in pages:
        p = None
        for ext in ('webp', 'jpg', 'png'):
            q = f'{root}/{s}.{ext}'
            try:
                open(q).close(); p = q; break
            except OSError: pass
        if not p: continue
        img = cv2.imread(p)
        h, w = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        lines = []
        r, _ = eng(img, box_thresh=0.35, text_score=0.4)
        for box, txt, conf in (r or []):
            xs = [pt[0] for pt in box]; ys = [pt[1] for pt in box]
            lines.append([nk(txt), round(min(xs) / w, 4), round(min(ys) / h, 4), round((max(xs) - min(xs)) / w, 4), round((max(ys) - min(ys)) / h, 4), round(float(conf), 2)])
        f.write(json.dumps({'sheet': s, 'w': w, 'h': h, 'lines': lines, 'bubbles': bubbles(gray)}, ensure_ascii=False) + '\n')
        f.flush()

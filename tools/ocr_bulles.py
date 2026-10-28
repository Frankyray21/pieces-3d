# Bulles = trous circulaires du tracé (intérieur de l'anneau), numéro lu par gabarits.
import sys, cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont
TW, TH = 18, 26
def norm(g):
    ys, xs = np.where(g)
    g = g[ys.min():ys.max() + 1, xs.min():xs.max() + 1].astype(np.float32)
    h, w = g.shape
    nw = max(1, min(TW - 2, int(round(w * (TH - 2) / h))))
    g = cv2.resize(g, (nw, TH - 2), interpolation=cv2.INTER_AREA)
    out = np.zeros((TH, TW), np.float32); x0 = (TW - nw) // 2
    out[1:TH - 1, x0:x0 + nw] = g
    return out, w / h
def mk(chars):
    T = []
    for path in ['/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
        f = ImageFont.truetype(path, 60)
        for c in chars:
            im = Image.new('L', (80, 90), 0); ImageDraw.Draw(im).text((10, 5), c, fill=255, font=f)
            a = np.array(im) > 100
            for k in (1, 3, 5):
                g, ar = norm(cv2.dilate(a.astype(np.uint8), np.ones((k, k), np.uint8)) > 0)
                t = g - g.mean(); t /= np.linalg.norm(t) + 1e-6
                T.append((c, t, ar))
    return T
TD = mk('0123456789')
TL = mk('ABCDEFGHJKLMNPRSTUVWXY')
def classify(g, T):
    v, ar = norm(g); v = v - v.mean(); v /= np.linalg.norm(v) + 1e-6
    best = (-9, '?')
    for c, t, tar in T:
        s = float((v * t).sum()) - 0.12 * abs(np.log((ar + 0.05) / (tar + 0.05)))
        if s > best[0]: best = (s, c)
    return best[1], best[0]
def read(inner, letters=False):
    n, lab, st, _ = cv2.connectedComponentsWithStats(inner.astype(np.uint8), 8)
    comps = [(st[i][0], st[i][1], st[i][2], st[i][3], st[i][4], i) for i in range(1, n) if st[i][4] >= 4]
    if not comps: return '', 0
    H = max(c[3] for c in comps)
    txt, sc = '', []
    for x, y, w, h, a, i in sorted(comps):
        if h < H * 0.35:
            if w < H * 0.4: txt += '.'
            continue
        g = lab == i
        if w < 0.42 * h and h >= H * 0.7:
            txt += '1'; sc.append(0.9); continue
        cd, sd = classify(g, TD)
        if cd == '4' and sd < 0.62 and w < 0.6 * h: cd, sd = '1', 0.6  # « 1 » à drapeau
        if letters:
            cl, sl = classify(lab == i, TL)
            if sl > sd + 0.08: cd, sd = cl, sl
        txt += cd; sc.append(sd)
    return txt.strip('.'), (min(sc) if sc else 0)
def read_any(inner):
    best = read(inner)
    rot = np.ascontiguousarray(np.rot90(inner, -1))  # texte écrit de bas en haut (planche tournée)
    alt = read(rot)
    return alt if alt[1] > best[1] + 0.05 else best
def bubbles(gray, rmin, rmax, thr=170):
    ink = (gray < thr).astype(np.uint8)
    ink = cv2.morphologyEx(ink, cv2.MORPH_CLOSE, np.ones((2, 2), np.uint8))
    cnts, hier = cv2.findContours(ink, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    out = []
    if hier is None: return out
    for i, c in enumerate(cnts):
        if hier[0][i][3] == -1: continue  # contour extérieur : on veut les trous
        a = cv2.contourArea(c); p = cv2.arcLength(c, True)
        if p == 0: continue
        circ = 4 * np.pi * a / (p * p)
        (x, y), r = cv2.minEnclosingCircle(c)
        if not (rmin <= r <= rmax) or circ < 0.80 or a < 0.75 * np.pi * r * r: continue
        x, y, r = int(round(x)), int(round(y)), int(round(r))
        m = np.zeros_like(ink); cv2.drawContours(m, [c], -1, 1, -1)
        cv2.erode(m, np.ones((3, 3), np.uint8), m)
        inner = (ink & m)[y - r:y + r + 1, x - r:x + r + 1]
        if inner.sum() < 8: continue
        t, s = read_any(inner)
        if t: out.append((t, round(s, 2), x, y, r))
    return out
if __name__ == '__main__':
    img = cv2.imread(sys.argv[1], cv2.IMREAD_GRAYSCALE); w = img.shape[1]
    res = bubbles(img, int(w * float(sys.argv[2])), int(w * float(sys.argv[3])))
    print(len(res)); print(sorted([(t, s) for t, s, x, y, r in res], key=lambda o: (len(o[0]), o[0])))

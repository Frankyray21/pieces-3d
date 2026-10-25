#!/usr/bin/env python3
"""
Positions des bulles des dessins du STM-1500 : public/equipment/stm-1500/bulles.json

Les dessins du manuel désignent chaque pièce par une bulle qui porte son
numéro de pièce (ex. « UM-032-102A »). La couche texte du PDF donne la
position de ces mots (pdftotext -bbox-layout) ; on retient, pour chaque page,
les mots qui sont le numéro d'une ligne de data.json, hors tableau « LISTE DE
PIÈCE » (colonne de numéros alignés les uns sous les autres) et hors cartouche.
Les positions sont relatives à l'image de la page (0 à 1, origine en haut à
gauche) : [x, y, largeur, hauteur] du mot.

Les pages sans couche texte (P049, P069, P074, P079, P083…) n'ont pas de bulles
connues : la fiche de pièce ouvre alors simplement la page.

Usage :
    python3 -I tools/extract_bulles.py manuel.pdf
"""
import html
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EQ = ROOT / 'public/equipment/stm-1500'
PDF = sys.argv[1]


def norm(pn):
    """Comme normPn (src/data/equipment.js) : majuscules, sans « * » initial ni espaces."""
    return re.sub(r'\s', '', str(pn or '').upper().lstrip('*'))


def page_info(n):
    out = subprocess.run(['pdfinfo', '-f', str(n), '-l', str(n), PDF], capture_output=True, text=True).stdout
    w, h = map(float, re.search(rf'Page\s+{n} size:\s+([\d.]+) x ([\d.]+)', out).groups())
    rot = int(re.search(rf'Page\s+{n} rot:\s+(\d+)', out).group(1))
    return w, h, rot


def words_of(n):
    out = subprocess.run(['pdftotext', '-bbox-layout', '-f', str(n), '-l', str(n), PDF, '-'],
                         capture_output=True, text=True).stdout
    res = []
    for m in re.finditer(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>', out):
        x0, y0, x1, y1 = map(float, m.groups()[:4])
        res.append({'x0': x0, 'y0': y0, 'x1': x1, 'y1': y1, 't': html.unescape(m.group(5))})
    return res


def in_list(w, hits):
    """Mot d'une colonne de liste : au moins deux autres numéros centrés sur la même verticale, en lignes voisines."""
    cx = (w['x0'] + w['x1']) / 2
    col = [o for o in hits if abs((o['x0'] + o['x1']) / 2 - cx) < 6]
    col.sort(key=lambda o: o['y0'])
    # Composante connexe verticale (écart entre lignes ≤ 22 pt) contenant w.
    i = col.index(w)
    lo = hi = i
    while lo > 0 and col[lo]['y0'] - col[lo - 1]['y0'] <= 22:
        lo -= 1
    while hi < len(col) - 1 and col[hi + 1]['y0'] - col[hi]['y0'] <= 22:
        hi += 1
    return hi - lo + 1 >= 3


def main():
    data = json.load(open(EQ / 'data.json'))
    pns = set()
    for a in data['assemblies'].values():
        for p in a['parts']:
            if p[1]:
                pns.add(norm(p[1]))
    for d in data.get('documents', []):
        for p in d['parts']:
            if p[1]:
                pns.add(norm(p[1]))
    pns.discard('')
    pages = {}
    for n in range(1, data['document']['sheets'] + 1):
        sheet = f'P{n:03d}'
        w, h, rot = page_info(n)
        W, H = (h, w) if rot in (90, 270) else (w, h)
        words = words_of(n)
        # Mots seuls, puis suites de 2 à 4 mots voisins sur une ligne (« UM-032 -100A », « XCS-ZR5902 NUT »,
        # « C016 20F003 100 12 ») ; à une même place, on garde le plus long qui est un numéro.
        cands = []
        for i, wd in enumerate(words):
            cands.append(dict(wd, n=norm(wd['t']), k=1))
            cur = dict(wd, t=wd['t'])
            for k in range(2, 5):
                if i + k - 1 >= len(words):
                    break
                nx = words[i + k - 1]
                if not (abs(nx['y0'] - cur['y0']) < 2 and 0 <= nx['x0'] - cur['x1'] < 6):
                    break
                cur = {'x0': cur['x0'], 'y0': min(cur['y0'], nx['y0']), 'x1': nx['x1'],
                       'y1': max(cur['y1'], nx['y1']), 't': cur['t'] + nx['t']}
                cands.append(dict(cur, n=norm(cur['t']), k=k))
        hits = [c for c in cands if c['n'] in pns and len(c['n']) >= 4]
        inside = lambda a, b: a is not b and b['k'] > a['k'] and abs(a['y0'] - b['y0']) < 2 and b['x0'] - 0.5 <= a['x0'] and a['x1'] <= b['x1'] + 0.5
        hits = [c for c in hits if not any(inside(c, o) for o in hits)]
        rows = [c for c in hits if in_list(c, hits)]
        # Cadre de chaque colonne de numéros (numéros suivis d'un texte, ex. « B500-6500 GRADE 8 », compris).
        cols = []
        for r in rows:
            cx = (r['x0'] + r['x1']) / 2
            col = next((k for k in cols if abs(k['cx'] - cx) < 6), None)
            if col is None:
                cols.append({'cx': cx, 'x0': r['x0'], 'x1': r['x1'], 'y0': r['y0'], 'y1': r['y1']})
            else:
                col.update(x0=min(col['x0'], r['x0']), x1=max(col['x1'], r['x1']),
                           y0=min(col['y0'], r['y0']), y1=max(col['y1'], r['y1']))
        # Colonnes « ITEM » des tableaux (même courts) : mots alignés sous l'en-tête, sans trou de plus de 22 pt.
        for it in [x for x in words if x['t'] in ('ITEM', 'ITEM:')]:
            cx0 = (it['x0'] + it['x1']) / 2
            band = sorted((x for x in words if abs((x['x0'] + x['x1']) / 2 - cx0) < 40 and x['y0'] > it['y0']),
                          key=lambda x: x['y0'])
            y1 = it['y1']
            for x in band:
                if x['y0'] - y1 > 22:
                    break
                y1 = max(y1, x['y1'])
            cols.append({'cx': cx0, 'x0': cx0 - 40, 'x1': cx0 + 40, 'y0': it['y0'], 'y1': y1 - 30})
        # Cartouche : numéro du dessin (« # DRAFT: », « NO. DESSIN: »).
        stamps = [x for x in words if x['t'] in ('DRAFT:', 'DESSIN:', 'DESSIN')]
        # Listes à points de conduite (« 9. Louver.......107-0004.......Stock: », P074) : numéros d'une ligne, pas des bulles.
        dotted = [x for x in words if re.search(r'\.{3,}', x['t'])]
        found = {}
        for c in hits:
            if any(abs(d['y0'] - c['y0']) < 2 and (0 <= c['x0'] - d['x1'] < 8 or 0 <= d['x0'] - c['x1'] < 8) for d in dotted):
                continue
            if any(abs(st['y0'] - c['y0']) < 4 and 0 <= c['x0'] - st['x1'] < 120 for st in stamps):
                continue
            cx, cy = (c['x0'] + c['x1']) / 2, (c['y0'] + c['y1']) / 2
            # Colonne de numéros de la liste, ou autre colonne de la même ligne du tableau, juste à droite du numéro
            # (description qui répète le numéro). Une bulle du dessin à la même hauteur qu'une ligne d'un tableau
            # (à gauche du tableau, ou loin à droite) reste une bulle.
            if c in rows or any(abs(r['y0'] - c['y0']) < 3 and r['x1'] <= c['x0'] and c['x0'] - r['x1'] < 200 for r in rows):
                continue
            if any(k['x0'] - 12 <= cx <= k['x1'] + 12 and k['y0'] - 4 <= cy <= k['y1'] + 30 for k in cols):
                continue
            box = [round(c['x0'] / W, 4), round(c['y0'] / H, 4),
                   round((c['x1'] - c['x0']) / W, 4), round((c['y1'] - c['y0']) / H, 4)]
            if not (0 <= box[0] <= 1 and 0 <= box[1] <= 1):
                continue
            found.setdefault(c['n'], []).append(box)
        if found:
            pages[sheet] = found
    out = {
        'source': 'Couche texte du manuel STM-1500 (pdftotext -bbox-layout) ; tools/extract_bulles.py',
        'format': 'pages[feuille][numéro normalisé] = [[x, y, largeur, hauteur], …] relatifs à l\'image',
        'pages': pages,
    }
    (EQ / 'bulles.json').write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')) + '\n')
    total = sum(len(v) for p in pages.values() for v in p.values())
    print(f'{len(pages)} pages, {total} bulles', file=sys.stderr)
    for s, p in pages.items():
        print(s, len(p), file=sys.stderr)


main()

"""Brouillon des listes « LISTE DE PIÈCE » (ITEM | NOM/NAME | QTE) du manuel STM-1500, par position des mots.

Usage : python3 -I tools/extract_stm1500_lists.py manuel.pdf "10,11,13" listes.json > listes.txt
Les colonnes viennent des traits verticaux du tableau qui traversent la ligne
d'en-tête ; le résultat est relu et complété par tools/extract_stm1500.py."""
import sys, json, re, pdfplumber
pdf = pdfplumber.open(sys.argv[1])
pages = [int(p) for p in sys.argv[2].split(',')] if len(sys.argv) > 2 and sys.argv[2] else range(1, len(pdf.pages) + 1)
res = {}

def lines_of(words, tol=2.0):
    out = []
    for w in sorted(words, key=lambda w: (w['top'], w['x0'])):
        for l in out:
            if abs(l['top'] - w['top']) <= tol:
                l['w'].append(w); break
        else:
            out.append({'top': w['top'], 'bottom': w['bottom'], 'w': [w]})
    for l in out:
        l['w'].sort(key=lambda w: w['x0'])
        l['bottom'] = max(w['bottom'] for w in l['w'])
    return sorted(out, key=lambda l: l['top'])

for n in pages:
    pg = pdf.pages[n - 1]
    words = pg.extract_words(keep_blank_chars=False, x_tolerance=1.5)
    for w in words:
        w['text'] = w['text'].replace('−', '-').replace('’', "'")
    items = [w for w in words if w['text'] in ('ITEM', 'ITEM:')]
    tabs = []
    for it in items:
        same = [w for w in words if abs(w['top'] - it['top']) < 3 and w['x0'] > it['x0']]
        name = next((w for w in sorted(same, key=lambda w: w['x0']) if w['text'].startswith('NOM') or w['text'] in ('DESCRIPTION',)), None)
        qte = next((w for w in sorted(same, key=lambda w: w['x0']) if w['text'] in ('QTE', 'QTY', 'Quantity')), None)
        ref = next((w for w in sorted(same, key=lambda w: w['x0']) if w['text'].startswith('REF')), None)
        if not name or not qte:
            continue
        # colonnes : item [x_item0, name0) ; nom [name0, qte0) ; qte [qte0, qte1+20]
        x_item = it['x0'] - 48
        x_name = (name['x0'] if not ref else ref['x0']) - 4
        x_qte = qte['x0'] - 6
        x_end = qte['x1'] + 22
        # Traits verticaux du tableau qui traversent la ligne d'en-tête : limites réelles des colonnes.
        vx = sorted({round(e['x0'], 1) for e in pg.edges if e['orientation'] == 'v'
                     and e['top'] <= it['top'] + 1 and e['bottom'] >= it['bottom'] + 4
                     and it['x0'] - 120 <= e['x0'] <= qte['x1'] + 60})
        def cell(x):
            lo = [v for v in vx if v <= x]
            hi = [v for v in vx if v > x]
            return (lo[-1] if lo else None, hi[0] if hi else None)
        ci, cn, cq = cell(it['x0']), cell(name['x0']), cell(qte['x0'])
        if ci[0] is not None and cn[0] is not None and cq[0] is not None and ci != cn and cn != cq:
            x_item = ci[0] - 9
            x_name = (cell(ref['x0'])[0] if ref else cn[0]) - 0.5
            x_qte = cq[0] - 0.5
            x_end = (cq[1] or qte['x1'] + 22) + 0.5
            if ref: x_ref = cell(ref['x0'])
        body = [w for w in words if w['top'] > it['bottom'] + 1 and x_item <= w['x0'] < x_end]
        rows = []
        last = it['bottom']
        for l in lines_of(body):
            if l['top'] - last > 30: break
            item = ' '.join(w['text'] for w in l['w'] if w['x0'] < x_name)
            nm = ' '.join(w['text'] for w in l['w'] if x_name <= w['x0'] < x_qte)
            if ref and cn[0] is not None and ci != cn:
                rf = ' '.join(w['text'] for w in l['w'] if x_name <= w['x0'] < cn[0])
                nm = ' '.join(w['text'] for w in l['w'] if cn[0] <= w['x0'] < x_qte)
                if rf: nm = f'{nm} {{REF {rf}}}'
            q = ' '.join(w['text'] for w in l['w'] if w['x0'] >= x_qte)
            if not (item or nm or q): continue
            if not item and not q and rows:  # suite de la description
                rows[-1][1] += ' ' + nm; last = l['bottom']; continue
            if re.search(r'DESIGNED|CONÇU|# DE JOB|DESSIN', item + nm): break
            rows.append([item, nm, q]); last = l['bottom']
        tabs.append({'x': round(x_item), 'y': round(it['top']), 'rows': rows})
    res[n] = tabs
    print(f'=== P{n:03d} : {len(tabs)} liste(s)')
    for t in tabs:
        print(f'  -- liste x={t["x"]} y={t["y"]} ({len(t["rows"])} lignes)')
        for r in t['rows']:
            print('    ', ' | '.join(r))
json.dump(res, open(sys.argv[3] if len(sys.argv) > 3 else 'lists.json', 'w'), ensure_ascii=False, indent=1)

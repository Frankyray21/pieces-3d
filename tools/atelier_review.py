#!/usr/bin/env python3
"""
Planches de relecture des textes lus par OCR (consignes, réglages, titres de
schémas électriques) : chaque texte est découpé sur sa planche, encadré en
rouge et étiqueté par son identifiant, six par image. La relecture (à l'œil,
sur ces images) donne tools/atelier/<id>.json, que build_atelier.py applique :

    {"notes":    {"<id>": {"en": "texte exact", "fr": "traduction", "kind": "couple",
                           "torques": [{"item": "…", "min": 30, "max": 35, "unit": "lbf·ft"}],
                           "values": [{"what": "…", "min": 2500, "unit": "psi"}]}
                  | {"drop": true}},
     "settings": {"<id>": {"en": "…", "fr": "…", "values": [...]} | {"drop": true}},
     "titles":   {"<planche>": {"en": "…", "fr": "…"}}}

Usage :
    python3 tools/atelier_review.py <id> <dossier de sortie> tools/atelier/ocr/<id>.jsonl.gz
"""
import json
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(__file__))
import build_atelier as B  # noqa: E402

PER_SHEET = 6
WIDTH = 1100


def font(size):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'):
        if os.path.exists(f):
            return ImageFont.truetype(f, size)
    return ImageFont.load_default()


def title_box(p):
    """Zone du titre dans le cartouche d'un schéma électrique."""
    t = next((l for l in p.get('lines', []) if re.match(r'^TITLE:?$', l[0].strip().upper())), None)
    return [max(0, t[1] - 0.02), max(0, t[2] - 0.004), 0.3, 0.065] if t else None


def main():
    eid, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    data = json.load(open(f'public/equipment/{eid}/data.json'))
    sysmap, docsys, _ = B.classify(data)
    pages = B.ocr_load(sys.argv[3:])
    own = B.sheet_owner(data)
    notes, settings, schem = B.ocr_texts(data, pages, own, sysmap, docsys)
    items = [('notes', n['id'], n['src']['sheet'], n['box'], n['en']) for n in notes]
    items += [('settings', s['id'], s['src']['sheet'], s['box'], s['en']) for s in settings]
    for s, v in sorted(schem.items()):
        if v['fam'] == 'electricite':
            b = title_box(pages[s])
            if b:
                items.append(('titles', s, s, b, v.get('title', '')))
    pat = data['document']['pagePattern']
    cache = {}
    crops = []
    for kind, iid, sheet, box, text in items:
        if sheet not in cache:
            cache.clear()
            cache[sheet] = Image.open(f'public/equipment/{eid}/{pat.replace("{sheet}", sheet)}').convert('RGB')
        im = cache[sheet]
        W, H = im.size
        pad = 0.03
        x0, y0 = max(0, box[0] - pad), max(0, box[1] - pad)
        x1, y1 = min(1, box[0] + box[2] + 2 * pad), min(1, box[1] + box[3] + 2 * pad)  # la suite d'une note reste visible
        c = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
        k = min(2.0, (WIDTH - 20) / c.width)
        c = c.resize((max(1, int(c.width * k)), max(1, int(c.height * k))), Image.LANCZOS)
        d = ImageDraw.Draw(c)
        bx0, by0 = (box[0] - x0) * W * k, (box[1] - y0) * H * k
        d.rectangle([bx0 - 3, by0 - 3, bx0 + box[2] * W * k + 3, by0 + box[3] * H * k + 3], outline=(220, 0, 0), width=2)
        crops.append((kind, iid, c))
    manifest = []
    f = font(18)
    for n in range(0, len(crops), PER_SHEET):
        group = crops[n:n + PER_SHEET]
        h = sum(c.height + 34 for _, _, c in group) + 10
        sheet_img = Image.new('RGB', (WIDTH, h), (255, 255, 255))
        d = ImageDraw.Draw(sheet_img)
        y = 6
        for kind, iid, c in group:
            d.rectangle([0, y, WIDTH, y + 26], fill=(30, 40, 55))
            d.text((8, y + 3), f'{kind[:-1].upper()}  {iid}', fill=(255, 255, 255), font=f)
            sheet_img.paste(c, (10, y + 30))
            y += c.height + 34
        name = f'{eid}_{n // PER_SHEET:03d}.png'
        sheet_img.save(os.path.join(out, name))
        manifest.append({'image': name, 'items': [iid for _, iid, _ in group]})
    texts = {iid: {'kind': kind, 'sheet': sheet, 'ocr': text} for kind, iid, sheet, box, text in items}
    json.dump({'equipment': eid, 'sheets': manifest, 'items': texts}, open(os.path.join(out, f'{eid}_manifest.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'{eid} : {len(items)} textes, {len(manifest)} images', file=sys.stderr)


if __name__ == '__main__':
    main()

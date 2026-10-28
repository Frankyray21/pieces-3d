#!/usr/bin/env python3
"""Manuel de l'utilisateur (manuel d'opération) d'un équipement → données du site.

Produit, dans public/equipment/<id>/ :
  - utilisation.json        : titre, édition, nombre de pages, sommaire (signets du PDF) ;
  - utilisation-texte.json  : texte de chaque page (recherche plein texte, chargé à la demande) ;
  - utilisation/U001.webp…  : image de chaque page.

Usage :
  python3 tools/extract_utilisation.py <manuel.pdf> <id> [--source URL] [--dpi 150] [--qualite 62]

Dépendances : pypdf, Pillow, pdftotext et pdftoppm (poppler-utils).
"""
import argparse
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

# En-têtes et pieds de page répétés sur chaque page : retirés du texte de recherche.
BRUIT = [
    re.compile(r"^Manuel de l'utilisateur(\s+DU311\s*-\s*Tier3)?$"),
    re.compile(r"^DU311\s*-\s*Tier3$"),
    re.compile(r"^Copyright © Sandvik Group(\s+\d+ \(\d+\))?$"),
    re.compile(r"^ID ?:GUID-[0-9A-F-]+ .*$"),
    re.compile(r"^\d+ \(\d+\)$"),
    re.compile(r"^Cette page a été intentionnellement laissée vierge\.$"),
]


def sommaire(reader):
    """Signets du PDF → [[niveau, numéro, titre, page]] (le signet racine et « Sommaire » sont omis)."""
    out = []

    def walk(items, niveau):
        for it in items:
            if isinstance(it, list):
                walk(it, niveau + 1)
                continue
            titre = it.title.strip()
            page = reader.get_destination_page_number(it) + 1
            if niveau == 0 or titre == 'Sommaire':
                continue
            m = re.match(r'^(\d+(?:\.\d+)*)\s+(.*)$', titre)
            num, t = (m.group(1), m.group(2)) if m else ('', titre)
            out.append([niveau, num, t, page])

    walk(reader.outline, 0)
    return out


def textes(pdf, n):
    """Texte de chaque page, sans en-têtes ni pieds de page, espaces réduits."""
    out = []
    for p in range(1, n + 1):
        raw = subprocess.run(['pdftotext', '-f', str(p), '-l', str(p), '-enc', 'UTF-8', str(pdf), '-'],
                             capture_output=True, text=True, check=True).stdout
        lignes = []
        for l in raw.splitlines():
            l = re.sub(r'\s+', ' ', l).strip()
            l = re.sub(r'\s*\.{4,}\s*', ' … ', l)  # points de conduite du sommaire
            if l and not any(b.match(l) for b in BRUIT):
                lignes.append(l)
        out.append(' '.join(lignes))
    return out


def images(pdf, n, dest, dpi, qualite):
    dest.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(['pdftoppm', '-r', str(dpi), '-png', str(pdf), f'{tmp}/p'], check=True)
        pngs = sorted(Path(tmp).glob('p-*.png'))
        if len(pngs) != n:
            sys.exit(f'{len(pngs)} images pour {n} pages')
        for i, png in enumerate(pngs, 1):
            Image.open(png).convert('RGB').save(dest / f'U{i:03d}.webp', 'WEBP', quality=qualite, method=6)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pdf', type=Path)
    ap.add_argument('id')
    ap.add_argument('--source', default='')
    ap.add_argument('--dpi', type=int, default=150)
    ap.add_argument('--qualite', type=int, default=62)
    a = ap.parse_args()

    reader = PdfReader(str(a.pdf))
    n = len(reader.pages)
    out = Path('public/equipment') / a.id
    premiere = textes(a.pdf, 1)[0]
    m = re.search(r'(fr-FR \d+ \d{4}-\d{2}-\d{2})', reader.pages[0].extract_text() or '')
    data = {
        'titre': "Manuel de l'utilisateur",
        'modele': 'DU311 - Tier3' if 'Tier3' in premiere else '',
        'edition': m.group(1) if m else '',
        'note': 'Traduction de la notice originale (Sandvik). Pages et sommaire tels que dans le PDF.',
        'source': a.source,
        'pages': n,
        'image': 'utilisation/U{n}.webp',
        'sommaire': sommaire(reader),
    }
    (out / 'utilisation.json').write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
    (out / 'utilisation-texte.json').write_text(json.dumps(textes(a.pdf, n), ensure_ascii=False, separators=(',', ':')) + '\n')
    images(a.pdf, n, out / 'utilisation', a.dpi, a.qualite)
    print(f'{n} pages, {len(data["sommaire"])} entrées au sommaire → {out}')


if __name__ == '__main__':
    main()

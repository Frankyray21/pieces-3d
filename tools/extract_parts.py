#!/usr/bin/env python3
"""
Extraction des listes de pièces d'un manuel PDF (dessins d'assemblage).

Usage :
    python3 tools/extract_parts.py manuel.pdf > brouillon.json

Pour chaque page, l'outil repère l'en-tête du tableau (« PART NUMBER » /
« DESCRIPTION ») puis lit les lignes situées sous cet en-tête, dans la même
zone horizontale. Il produit un brouillon JSON à relire : les pages dont le
tableau est une image (sans couche texte) sont signalées « ocr_requis ».

Le brouillon sert ensuite à remplir le fichier de données de l'équipement
(public/equipment/<id>/data.json).

Limites connues : les caractères dessinés en vectoriel par AutoCAD (« / »,
« # ») sont absents du texte extrait, et les tableaux insérés comme images
(ex. pages F04, F20, F21, F23, F25 du Cubex) doivent être transcrits à la main.
"""
import json
import re
import sys

import pdfplumber

HEADER_KEYS = ("PART", "NUMBER", "DESCRIPTION")
REF_RE = re.compile(r"^\d{1,3}$")
QTY_RE = re.compile(r"^\d{1,4}$")
CID = {"(cid:158)": "°", "(cid:145)": "Ø"}


def group_lines(words, tol=2.5):
    lines = []
    for w in sorted(words, key=lambda w: (round(w["top"]), w["x0"])):
        for line in lines:
            if abs(line["top"] - w["top"]) <= tol:
                line["words"].append(w)
                break
        else:
            lines.append({"top": w["top"], "words": [w]})
    for line in lines:
        line["words"].sort(key=lambda w: w["x0"])
    return sorted(lines, key=lambda l: l["top"])


def find_table(words):
    """Retourne (x_min, x_max, y_header, colonnes) de la table de pièces."""
    desc = [w for w in words if w["text"].upper() == "DESCRIPTION"]
    pn = [w for w in words if w["text"].upper() == "NUMBER"]
    if not desc or not pn:
        return None
    d = desc[0]
    p = min(pn, key=lambda w: abs(w["top"] - d["top"]))
    if abs(p["top"] - d["top"]) > 15:
        return None
    # La colonne REF est à gauche du numéro de pièce, la quantité entre les deux.
    left = p["x0"] - 120
    return {"left": left, "right": d["x1"] + 400, "top": max(d["bottom"], p["bottom"]),
            "pn_x": (p["x0"], p["x1"]), "desc_x0": d["x0"]}


def parse_page(page):
    words = page.extract_words(keep_blank_chars=False, use_text_flow=False)
    table = find_table(words)
    if not table:
        return None
    inside = [w for w in words
              if w["x0"] >= table["left"] and w["top"] > table["top"]]
    rows = []
    for line in group_lines(inside):
        toks = [w["text"] for w in line["words"]]
        if len(toks) < 3 or not REF_RE.match(toks[0]):
            if rows and line["top"] - rows[-1]["_top"] < 20:
                continue
            if rows:
                break
            continue
        ref, pn = toks[0], toks[1]
        rest = toks[2:]
        qty = None
        if rest and QTY_RE.match(rest[0]):
            qty = int(rest[0])
            rest = rest[1:]
        desc = " ".join(rest)
        for cid, char in CID.items():
            desc = desc.replace(cid, char)
        rows.append({"ref": ref, "partNumber": pn, "qty": qty,
                     "description": desc, "_top": line["top"]})
    for r in rows:
        r.pop("_top", None)
    return rows


def main(path):
    out = []
    with pdfplumber.open(path) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            sheet = f"F{i:02d}"
            try:
                rows = parse_page(page)
            except Exception as exc:  # noqa: BLE001 - brouillon, on continue
                out.append({"sheet": sheet, "erreur": str(exc)})
                continue
            if rows is None:
                has_text = bool(page.extract_words())
                out.append({"sheet": sheet, "parts": [],
                            "statut": "aucune_table" if has_text else "ocr_requis"})
            else:
                out.append({"sheet": sheet, "parts": rows, "statut": "ok"})
    json.dump(out, sys.stdout, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])

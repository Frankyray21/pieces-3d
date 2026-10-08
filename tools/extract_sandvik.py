#!/usr/bin/env python3
"""
Extraction complète d'un manuel de pièces Sandvik (format « Parts Manual »
généré par Antenna House : un dessin par page paire, la liste en page impaire).

Usage :
    python3 tools/extract_sandvik.py manuel.pdf [id] > public/equipment/<id>/data.json

id : profil de l'équipement dans PROFILES (défaut : du311).

Le manuel est découpé d'après sa table des matières (« * TITRE....page ») :
chaque entrée devient un assemblage identifié par sa première page (« P024 »),
avec ses pages de dessin et de liste. Les lignes de pièces sont lues par
position de colonne (Ref., Part No., QTY, UOM, Item name, Spare part
description, Page, kg, NOTE) ; la colonne « Page » donne le lien vers le
sous-assemblage. Les chapitres de schémas (air, hydraulique, électrique)
deviennent des documents.

Les champs descriptifs de l'équipement (nom, fabricant, fiche technique)
viennent de son profil ; voir PROFILES ci-dessous.
"""
import json
import re
import subprocess
import sys

import pdfplumber

# Chapitres dont les entrées sont des schémas (documents) plutôt que des
# assemblages mécaniques. Repérés par leur titre dans la table des matières.
DOC_CHAPTERS = re.compile(r"SCHEMATIC", re.I)

TOC_ENTRY = re.compile(r"^\s*(\*+)\s*(.+?)\s*\.{3,}\s*(\d+)\s*$")
TOC_CHAPTER = re.compile(r"^\s*(\d+)\s{2,}([A-Z].+?)\s*$")
HEAD_PN = re.compile(r"^\s*(?:Page|DU\S+)?\s{2,}([A-Z0-9][A-Z0-9-]*)(?: (\d+|[A-Z]{1,2}))?\s*(?:\s{2,}\S.*)?$")
REF = re.compile(r"^([*#]?\d+(?:\.\d+)?[A-Z]?[*#]?|[A-Z]{1,3}\d{0,2}|KEY)$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
COLS = ("ref", "pn", "qty", "uom", "item", "spare", "page", "kg", "note")


def sid(page):
    return f"P{page:03d}"


def parse_toc(texts):
    """Entrées de la table des matières : (niveau, titre, page, chapitre)."""
    entries, chapter = [], None
    for i, t in enumerate(texts[:12]):
        if "Table of Contents" not in t and not entries:
            continue
        for line in t.splitlines():
            m = TOC_ENTRY.match(line)
            if m:
                entries.append({"level": len(m.group(1)), "title": m.group(2).strip(),
                                "page": int(m.group(3)), "chapter": chapter})
                continue
            m = TOC_CHAPTER.match(line)
            if m and "(" not in line:
                chapter = {"num": int(m.group(1)), "title": m.group(2).strip()}
    return entries


def header_pn(text):
    for line in text.splitlines()[:4]:
        m = HEAD_PN.match(line)
        if m and m.group(1) not in ("Page", MODEL):
            return m.group(1), m.group(2) or ""
    return None, None


def group_lines(words, tol=2.0):
    lines = []
    for w in sorted(words, key=lambda w: (w["top"], w["x0"])):
        if lines and abs(lines[-1]["top"] - w["top"]) <= tol:
            lines[-1]["words"].append(w)
        else:
            lines.append({"top": w["top"], "words": [w]})
    for line in lines:
        line["words"].sort(key=lambda w: w["x0"])
    return lines


def column_edges(header, left):
    """Bords droits des cellules (un mot va dans la cellule de son centre).

    Titres centrés sur leur colonne (manuel DU311-TVK) : chaque bord est le
    symétrique du précédent par rapport au centre du titre. Si un titre sort
    alors de sa propre cellule, les titres sont alignés à gauche (manuel
    DU311) : une colonne commence juste avant son titre. Une colonne absente
    de l'en-tête (« NOTE ») reçoit une largeur nulle."""
    titles = [("Ref.",), ("Part", "No."), ("QTY",), ("UOM",), ("Item", "name"),
              ("Spare", "part", "description"), ("Page",), ("kg",), ("NOTE",)]
    spans = []
    for names in titles:
        ws = [w for w in header if w["text"] in names]
        spans.append((min(w["x0"] for w in ws), max(w["x1"] for w in ws)) if ws else None)
    edges, edge = [], left
    for span in spans:
        if span:
            edge = span[0] + span[1] - edge
        edges.append(edge)
    lo = left
    for span, hi in zip(spans, edges):
        if span and not (lo - 1 <= span[0] and span[1] <= hi + 1):
            break
        lo = hi
    else:
        return edges
    nxt = [next((t[0] - 3 for t in spans[k + 1:] if t), float("inf")) for k in range(len(spans))]
    return nxt


def parse_list(page):
    """Lignes de la liste de pièces d'une page, ou None si la page n'en a pas."""
    words = page.extract_words()
    lines = group_lines(words)
    head = next((l for l in lines if {"Ref.", "QTY", "UOM"} <= {w["text"] for w in l["words"]}), None)
    if not head:
        return None
    foot = min((w["top"] for w in words if w["text"] == "Copyright"
                or (DATE.match(w["text"]) and w["top"] > page.height * 0.8)), default=page.height)
    left = min(w["x0"] for w in words)
    edges = column_edges(head["words"], left)
    rows, cur = [], None
    for line in lines:
        if line["top"] <= head["top"] + 2 or line["top"] >= foot - 2:
            continue
        cells = {c: [] for c in COLS}
        for w in line["words"]:
            x = (w["x0"] + w["x1"]) / 2
            col = next((c for c, e in zip(COLS, edges) if x < e), "note")
            cells[col].append(w["text"])
        ref = " ".join(cells["ref"])
        if ref and REF.match(ref):
            if ref == "KEY":  # en-tête recopié dans la liste
                cur = None
                continue
            cur = {c: [" ".join(cells[c])] if cells[c] else [] for c in COLS}
            rows.append(cur)
        elif cur:
            if cells["ref"] or cells["qty"]:
                print(f"  page {page.page_number} : ligne douteuse rattachée à la réf. {cur['ref'][0]} « {' '.join(w['text'] for w in line['words'])} »", file=sys.stderr)
            for c in COLS:
                if cells[c]:
                    cur[c].append(" ".join(cells[c]))
        else:
            print(f"  page {page.page_number} : texte hors ligne ignoré « {' '.join(w['text'] for w in line['words'])} »", file=sys.stderr)
    return rows


MARKS = {"NSS": "Non vendu séparément (NSS au manuel)."}


def join_pn(parts):
    """Numéro de pièce et mentions écrites dessous (« NSS », « RR »)."""
    pn, marks = "", []
    for part in parts:
        if pn.endswith("-") or not pn:
            pn += part  # « CP13001-DK1- » + « ISO » → « CP13001-DK1-ISO »
        elif re.fullmatch(r"[A-Z]{1,3}", part):
            marks.append(MARKS.get(part, f"Mention « {part} » sous le numéro au manuel."))
        else:
            pn += " " + part
    return pn, marks


def to_row(r, link_of):
    ref = r["ref"][0]
    pn, marks = join_pn(r["pn"])
    if pn == "-":  # numéro absent au manuel
        pn = ""
    nss = pn == "NSS"
    if nss:  # pièce sans numéro de commande
        pn, marks = "", [MARKS["NSS"]] + marks
    qty_txt = " ".join(r["qty"])
    qty = int(qty_txt) if qty_txt.isdigit() else (qty_txt or None)
    desc = " ".join(r["item"])
    spare = " ".join(r["spare"])
    if spare:
        desc = f"{desc} — {spare}" if desc else spare
    extra = {"nss": True} if nss or MARKS["NSS"] in marks else {}
    page = " ".join(r["page"])
    if page.isdigit():
        target = link_of(int(page))
        if target:
            extra["link"] = target
    if r["uom"] and r["uom"] != ["EA"]:
        extra["uom"] = " ".join(r["uom"])
    if r["kg"]:
        extra["kg"] = " ".join(r["kg"])
    notes = marks + ([" ".join(r["note"])] if r["note"] else [])
    if notes:
        extra["note"] = " ".join(notes)
    return [ref, pn, qty, desc, extra] if extra else [ref, pn, qty, desc]


def main(path):
    pdf = pdfplumber.open(path)
    texts = subprocess.run(["pdftotext", "-layout", path, "-"], capture_output=True,
                           text=True, check=True).stdout.split("\f")[:len(pdf.pages)]
    n = len(texts)
    toc = parse_toc(texts)
    starts = sorted({e["page"] for e in toc})
    # Fin de chaque entrée : la page avant l'entrée suivante (ou la fin du PDF).
    for e in toc:
        nxt = [s for s in starts if s > e["page"]]
        e["end"] = (nxt[0] - 1) if nxt else n

    info = []
    for i, page in enumerate(pdf.pages):
        pn, rev = header_pn(texts[i])
        # Dessin présent : image matricielle ou tracé vectoriel (schémas électriques).
        drawn = bool(page.images) or len(page.lines) + len(page.curves) > 100
        info.append({"pn": pn, "rev": rev, "img": drawn, "rows": parse_list(page)})

    def owner(pg):
        for e in toc:
            if e["page"] <= pg <= e["end"]:
                return e
        return None

    def link_of(pg):
        e = owner(pg)
        return sid(e["page"]) if e else None

    assemblies, documents, titles = {}, [], {}
    for e in toc:
        first = info[e["page"] - 1]
        # Certains manuels font précéder le titre du numéro de l'assemblage
        # (« CX035575 ASSY, TOPDRIVE ») : le numéro est déjà affiché à part.
        if first["pn"] and e["title"].startswith(first["pn"] + " "):
            e["title"] = e["title"][len(first["pn"]) + 1:].strip()
        pages = []
        for pg in range(e["page"], e["end"] + 1):
            p = info[pg - 1]
            same = p["pn"] and p["pn"] == first["pn"]
            # Schémas électriques pleine page, sans en-tête (sauf la 4e de couverture).
            headerless = not first["pn"] and p["img"] and "www.sandvik.com" not in texts[pg - 1]
            if same or headerless:
                pages.append(pg)
        drawings = [pg for pg in pages if info[pg - 1]["rows"] is None]
        lists = [pg for pg in pages if info[pg - 1]["rows"] is not None]
        rows = [to_row(r, link_of) for pg in lists for r in info[pg - 1]["rows"]]
        for pg in drawings:
            titles[sid(pg)] = e["title"]
        for pg in lists:
            titles[sid(pg)] = f"{e['title']} — liste"
        key = sid(e["page"])
        base = {"title": e["title"], "titleFr": e["title"], "pn": first["pn"], "rev": first["rev"],
                "chapter": e["chapter"]["title"] if e["chapter"] else None}
        if e["chapter"] and DOC_CHAPTERS.search(e["chapter"]["title"]):
            documents.append({"id": key, **base, "sheets": [sid(pg) for pg in pages],
                              "columns": ["ref", "pn", "qty", "desc"], "parts": rows})
        else:
            # Sans modèle 3D, l'application affiche les dessins (sheets) ;
            # les pages de liste (lists) restent consultables dans le manuel.
            assemblies[key] = {**base, "sheets": [sid(pg) for pg in drawings],
                               "lists": [sid(pg) for pg in lists], "parts": rows}
        print(f"{key} {e['title'][:50]:50} pages {len(drawings)}+{len(lists)} lignes {len(rows)}", file=sys.stderr)

    for i, p in enumerate(info):
        if p["pn"] and sid(i + 1) not in titles:
            print(f"  page {i + 1} ({p['pn']}) rattachée à aucune entrée de la table des matières", file=sys.stderr)
    for i, t in enumerate(texts):
        if sid(i + 1) not in titles:
            m = re.search(r"^\s*\d+\s{2,}([A-Z].+?)\s*$", t, re.M)
            titles[sid(i + 1)] = {1: "Page couverture", 3: "Table des matières"}.get(i + 1) or (m.group(1).strip() if m and i > 7 else "")

    out = {**EQUIPMENT,
           "document": {**EQUIPMENT["document"], "sheets": n},
           "sheetTitles": titles,
           "root": sid(toc[0]["page"]),
           "assemblies": assemblies,
           "documents": documents}
    json.dump(out, sys.stdout, ensure_ascii=False, indent=1)
    sys.stdout.write("\n")


# Profils d'équipement : valeurs relevées dans chaque manuel (page couverture,
# table des matières, vue générale et listes). Un profil par manuel.
PROFILES = {
    # DU311-TVK s/n 10680 (release « manuel-du311 »)
    "du311": {
        "id": "du311",
        "name": "Sandvik DU311-TVK",
        "manufacturer": "Sandvik",
        "category": "Foreuse sur chenilles",
        "serial": "10680",
        "document": {
            "title": "Parts Manual DU311-TVK",
            "reference": "10680",
            "preparedBy": "Sandvik",
            "date": "2020-07-02",
            "pagePattern": "pages/{sheet}.webp",
        },
        "specs": [
            ["Modèle", "DU311-TVK"],
            ["Groupe de pompage électrique", "60 HP, 575 V, 60 Hz"],
            ["Moteur diesel", "Deutz D914L04"],
            ["Tête de rotation", "RH6230-A"],
            ["Surpresseur d'air", "Le Roi"],
        ],
        "weights": [
            ["Poids total (vue générale)", "38 317 lb"],
        ],
    },
    # DU311 s/n 10703 (release « manuel-du311-std ») : porteur sur roues,
    # carrousel de tiges 6 pi, extinction d'incendie, pont arrière.
    "du311-std": {
        "id": "du311-std",
        "name": "Sandvik DU311",
        "manufacturer": "Sandvik",
        "category": "Foreuse sur roues",
        "serial": "10703",
        "document": {
            "title": "Parts Manual DU311",
            "reference": "10703",
            "preparedBy": "Sandvik",
            "date": "2021-12-10",
            "pagePattern": "pages/{sheet}.webp",
        },
        "specs": [
            ["Modèle", "DU311"],
            ["Groupe de pompage électrique", "60 HP, 575 V, 60 Hz (CX028746)"],
            ["Moteur électrique (pont arrière)", "75 HP, 575 V, 60 Hz (CX003314)"],
            ["Moteur diesel", "Mercedes 904, 174 HP (CP000388)"],
            ["Porteur", "4 roues 12.00-20 (CP000243)"],
            ["Tête de rotation", "RH6230-A, ME12-SS #24 (CX035575)"],
            ["Avance", "6 pi basic (CX036191), carrousel de tiges 6 pi"],
            ["Surpresseur d'air", "Le Roi (CP48501)"],
            ["Extinction d'incendie", "Automatique (CX037391)"],
        ],
        "weights": [
            ["Poids total (vue générale)", "50 809 lb"],
        ],
    },
}

EQUIPMENT = PROFILES["du311"]
MODEL = EQUIPMENT["document"]["title"].split()[-1]

if __name__ == "__main__":
    if len(sys.argv) not in (2, 3) or (len(sys.argv) == 3 and sys.argv[2] not in PROFILES):
        sys.exit(__doc__ + f"\nProfils : {', '.join(PROFILES)}")
    EQUIPMENT = PROFILES[sys.argv[2] if len(sys.argv) == 3 else "du311"]
    MODEL = EQUIPMENT["document"]["title"].split()[-1]
    main(sys.argv[1])

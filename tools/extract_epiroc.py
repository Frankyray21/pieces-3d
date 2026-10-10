#!/usr/bin/env python3
"""
Extraction du catalogue Epiroc « Core Drilling Tools — In-The-Hole »
(outils de carottage au câble : carottiers, têtes, overshots, émerillons…).

Usage :
    python3 tools/extract_epiroc.py catalogue.pdf > public/equipment/epiroc-ith/data.json
    python3 tools/extract_epiroc.py catalogue.pdf --pages public/equipment/epiroc-ith/pages

Le PDF est en planches doubles (deux pages du catalogue par page PDF, sauf la
couverture et le dos) : la page PDF n correspond aux pages 2(n-1) et 2(n-1)+1
du catalogue, numérotées ici P002…P107 (P001 couverture, P108 dos). --pages
rend chaque page du catalogue en WebP couleur (planches coupées en deux).

Les tableaux sont lus avec pdfplumber : chaque case fusionnée (même numéro
pour plusieurs tailles, remarque commune à plusieurs lignes) est recopiée
dans toutes les cases qu'elle couvre. La structure de chaque page (assemblage
ou liste de trousses, liens vers les autres pages, repères des lignes sans
numéro) est décrite dans PAGES ci-dessous.

Lignes produites : [repère, n° de pièce, qté, description, extra] où extra
peut contenir :
  sizes   {taille: n° ou texte} quand le numéro varie selon la taille (N, N2…)
  pnText  texte affiché à la place du numéro (« Voir p. 54 », « Sur demande »…)
  group   repères des pièces 3D d'un ensemble (ex. tube intérieur complet)
  link    page de l'assemblage ou de la liste détaillée
  see     pages à consulter ; note : remarque du catalogue
  no3d    ligne sans objet 3D propre (clés, option non dessinée)
"""
import argparse
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import pdfplumber

PN = re.compile(r"^\d[\d -]{5,12}\d$")
ORDER = {"N": 0, "N2": 1, "N3": 2, "H": 0, "H3": 1, "P": 0, "P3": 1}


def sid(num):
    return f"P{num:03d}"


# ------------------------------------------------------------------ tableaux


def grid(t):
    """Cases du tableau, cases fusionnées recopiées dans les cases couvertes."""
    ncol = max(len(r.cells) for r in t.rows)
    raw = t.extract()
    text = {}
    for r, vals in zip(t.rows, raw):
        for c, v in zip(r.cells, vals):
            if c is not None:
                text[tuple(c)] = " ".join((v or "").split())
    xs, xe = [None] * ncol, [None] * ncol
    for r in t.rows:
        for j, c in enumerate(r.cells):
            if c is None:
                continue
            if xs[j] is None:
                xs[j] = c[0]
            if j + 1 < len(r.cells) and r.cells[j + 1] is not None:
                xe[j] = c[2] if xe[j] is None else min(xe[j], c[2])
    for j in range(ncol):
        if xe[j] is None:
            xe[j] = next((x for x in xs[j + 1:] if x is not None), t.bbox[2])
    out = []
    for r in t.rows:
        own = [c for c in r.cells if c is not None]
        cy = (max(c[1] for c in own) + min(c[3] for c in own)) / 2
        row = []
        for j in range(ncol):
            c = r.cells[j] if j < len(r.cells) else None
            if c is not None:
                row.append(text[tuple(c)])
                continue
            cx = (xs[j] + xe[j]) / 2
            hit = [b for b in text if b[0] < cx < b[2] and b[1] < cy < b[3]]
            hit.sort(key=lambda b: (b[2] - b[0]) * (b[3] - b[1]))
            row.append(text[hit[0]] if hit else "")
        out.append(row)
    return out


def read_tables(path):
    """{page du catalogue: [tableaux]}, tableaux dans l'ordre de lecture."""
    res = {}
    with pdfplumber.open(path) as pdf:
        last = len(pdf.pages)
        for i, page in enumerate(pdf.pages, start=1):
            if i in (1, last):
                continue
            w = page.width
            for t in page.find_tables():
                x0, _, x1, _ = t.bbox
                num = 2 * (i - 1) + (0 if (x0 + x1) / 2 < w / 2 else 1)
                res.setdefault(sid(num), []).append(grid(t))
    return res


# ------------------------------------------------------------------ valeurs


def clean(s):
    s = " ".join(str(s or "").split())
    s = s.replace("pres- sure", "pressure").replace("dimen- sion", "dimension")
    s = s.replace("’", "'").replace("”", '"').replace("“", '"')
    return s


def norm_ref(s):
    s = clean(s).replace("–", "-").replace("—", "-")
    s = re.sub(r"\s*,\s*", ",", s)
    return re.sub(r"\s*-\s*", "-", s)


def is_pn(s):
    return bool(PN.match(s.rstrip("*")))


def pn_text(v):
    """Texte du catalogue → (n°, texte affiché, pages à voir)."""
    v = clean(v)
    low = v.lower()
    if is_pn(v):
        return v.rstrip("*"), None, None
    m = re.match(r"^(\d{8,10}) or (\d{8,10})$", v)
    if m:
        return m.group(1), None, None
    if low in ("n/a", "not applicable"):
        return "", "N/A", None
    if low in ("-", "–", ""):
        return "", None, None
    if "diamond tools" in low:
        return "", "Catalogue des outils diamantés", None
    if "contact your" in low or "on request" in low:
        return "", "Sur demande", None
    if "page 54" in low:
        return "", "Voir les options (p. 54)", ["P054"]
    if "62-63" in low or "102-103" in low or "page 113" in low:
        return "", "Voir les tiges (p. 107)", ["P107"]
    if "chart below" in low:
        return "", "Voir le tableau", None
    return "", v, None


def qty_of(v):
    v = clean(v).rstrip("*")
    return int(v) if v.isdigit() else None


# ------------------------------------------------------------------ listes de pièces

DESC_HEAD = ("description", "drill string component", "core barrel options", "drill rod connection")


def columns(rows):
    """Rôle de chaque colonne d'après les lignes d'en-tête."""
    head = []
    keys = ("item", "description", "part number", "qty", "remarks") + DESC_HEAD
    for r in rows:
        if len(set(r)) == 1 and r[0]:
            break
        sized = [c for c in map(clean, r) if c]
        if any(is_pn(c) for c in sized) or not (any(c.lower() in keys for c in sized)
                                                 or all(re.search(r"(?i)size$|core barrel$|cable$", c) for c in sized)):
            break
        head.append(r)
        if len(head) == 3:
            break
    ncol = len(rows[0])
    roles, sizes = [], []
    for j in range(ncol):
        labels = [clean(h[j]) for h in head]
        low = " ".join(labels).lower()
        last = next((x for x in reversed(labels) if x), "")
        if "item" in low:
            roles.append("ref")
        elif "qty" in low:
            roles.append("qty")
        elif "remarks" in low or (not labels[0] and len(labels) > 1 and labels[1] == "Remarks"):
            roles.append("remarks")
        elif any(k in low for k in DESC_HEAD):
            roles.append("desc" if "desc" not in roles else "skip")
        elif low.strip() in ("kg",):
            roles.append("kg")
        elif low.strip() in ("lbs",):
            roles.append("lbs")
        else:
            roles.append("pn")
            size = re.sub(r"(?i)\s*(part number|core barrel|size)\s*", " ", last).strip()
            sizes.append(size or None)
    return len(head), roles, sizes


def parse_parts(rows):
    """Lignes d'un tableau de pièces : dicts {ref, desc, values, qty, section, remarks}."""
    nh, roles, sizes = columns(rows)
    out, section = [], None
    for r in rows[nh:]:
        r = [clean(c) for c in r]
        if not any(r):
            continue
        if len(set(c for c in r if c)) == 1 and not is_pn(next(c for c in r if c)):
            section = next(c for c in r if c)
            out.append({"section": section})
            continue
        row = {"ref": "", "desc": "", "values": [], "qty": None, "remarks": "", "section": None, "sec": section}
        for role, v in zip(roles, r):
            if role == "ref":
                row["ref"] = norm_ref(v)
            elif role == "desc":
                row["desc"] = v
            elif role == "remarks":
                row["remarks"] = v
            elif role == "qty":
                row["qty"] = v
            elif role == "pn":
                row["values"].append(v)
            elif role in ("kg", "lbs"):
                row[role] = v
        if row["desc"] == row["ref"] and row["ref"]:
            row["ref"] = ""
        out.append(row)
    # Colonne vide d'en-tête qui répète la description (page 74) : ignorée.
    data = [p for p in out if "values" in p]
    dup = [j for j in range(len(sizes)) if data and all(p["values"][j] == p["desc"] for p in data if p["desc"])]
    if dup:
        for p in data:
            p["values"] = [v for j, v in enumerate(p["values"]) if j not in dup]
        sizes = [x for j, x in enumerate(sizes) if j not in dup]
    return out, [s for s in sizes]


def size_label(s):
    s = clean(s)
    return {"NH Short": "NH Short", "NH short": "NH Short"}.get(s, s)


def to_row(p, sizes, extra=None):
    """Ligne de données : [repère, n°, qté, description, extra]."""
    ex = dict(extra or {})
    vals = p["values"]
    pn, text, see = "", None, None
    if sizes and len(sizes) > 1 and len(set(vals)) > 1:
        sz = {}
        for s, v in zip(sizes, vals):
            n, t, _ = pn_text(v)
            sz[size_label(s)] = n or t or "-"
        ex["sizes"] = sz
        firsts = [pn_text(v) for v in vals]
        pn = next((n for n, _, _ in firsts if n), "")
        see = next((s for _, _, s in firsts if s), None)
    elif vals:
        pn, text, see = pn_text(vals[0])
        alt = re.match(r"^\d{8,10} or (\d{8,10})$", clean(vals[0]))
        if alt:
            ex["note"] = f"Ou {alt.group(1)}."
    if text:
        ex["pnText"] = text
    if see:
        ex["see"] = see
    if p.get("remarks"):
        rk = p["remarks"]
        if not re.search(r"(?i)see (options on )?page|see page", rk):
            ex.setdefault("note", rk[0].upper() + rk[1:] + ("" if rk.endswith(".") else "."))
    if p.get("kg"):
        kg = p["kg"]
        if kg not in ("-", "") and not is_pn(kg):
            ex["note"] = f"Masse : {kg} kg ({p.get('lbs')} lb)."
    desc = p["desc"]
    q = qty_of(p["qty"]) if p["qty"] is not None else None
    if p["qty"] and p["qty"].endswith("*"):
        ex.setdefault("note", "Quantité marquée d'un astérisque au catalogue.")
    return [p["ref"], pn, q, desc, ex] if ex else [p["ref"], pn, q, desc]


# ------------------------------------------------------------------ description des pages


def A(title, fr, **kw):
    return {"kind": "asm", "title": title, "fr": fr, **kw}


def D(title, fr, **kw):
    return {"kind": "doc", "title": title, "fr": fr, **kw}


# Lignes sans repère des carottiers DiscovOre (repères des dessins du catalogue,
# comme à la page 49 : W.S., W.S. adapter, H.P., H.P. adapter, Rod).
SURF_UNNAMED = [("Water swivel", "WS", "WSA"), ("Hoisting plug", "HP", "HPA"), ("Wireline drill", "Rod", "Rod")]
UG_UNNAMED = [("Water swivel", "WS", "WS"), ("Stuffing box dimen", "DK", "DK"), ("Stuffing box", "SB", "SB"), ("Rod", "Rod", "Rod")]
WRENCH = {"Inner tube wrenches": "IW", "Outer tube wrenches": "OW", "Inner tube wrench": "IW", "Outer tube wrench": "OW"}

S, U = "surface", "souterrain"

PAGES = {
    # ---------------------------------------------------------------- B surface
    "P006": A("B DiscovOre core barrel assembly", f"Carottier B DiscovOre — {S}", kind2="barrel",
              unnamed=SURF_UNNAMED, links={"B": "P007", "C": "P016", "WS": "P056", "1": "P054"},
              groups={"A": ["B", "5", "7", "8", "9"]}),
    "P007": A("B DiscovOre head assembly", f"Tête B DiscovOre — {S}"),
    "P008": D("B DiscovOre accessories", "Trousses et consommables B DiscovOre", tables=[("P008", 0), ("P008", 1), ("P008", 2)]),
    "P009": A("B Excore core barrel assembly", f"Carottier B Excore — {S}", kind2="barrel",
              options=["CB", "CB", "IT", "IT"], links={"1": "P010", "2": "P017", "3": "P056", "8": "P054"},
              groups={"CB": ["1", "9", "10", "11", "12", "13", "14", "15", "16"], "IT": ["1", "12", "14", "15", "16"]},
              drawn=["Rshell", "Bit"], kits=[("P009", 1)]),
    "P010": A("B Excore head assembly", f"Tête B Excore — {S}"),
    "P011": D("B Excore accessories", "Pièces de rechange B Excore", tables=[("P011", 0)]),
    "P012": A("B OWL L-Latch core barrel assembly", f"Carottier B OWL L-Latch — {S}", kind2="barrel",
              options=["CB", "CB", "IT", "IT"], links={"1": "P013", "6": "P054"},
              groups={"CB": ["1", "2", "3", "4", "5", "7", "8", "9", "10"], "IT": ["1", "2", "3", "4", "5"]},
              drawn=["Rshell"], kits=[("P012", 1)]),
    "P013": A("B OWL L-Latch head assembly", f"Tête B OWL L-Latch — {S}", cap="27-30"),
    "P014": A("B OWL standard core barrel assembly", f"Carottier B OWL standard — {S}", kind2="barrel",
              options=["CB", "CB", "IT", "IT"], links={"1": "P015", "6": "P054"},
              groups={"CB": ["1", "2", "3", "4", "5", "7", "8", "9", "10"], "IT": ["1", "2", "3", "4", "5"]},
              drawn=["Rshell"], kits=[("P014", 1)]),
    "P015": A("B OWL standard head assembly", f"Tête B OWL standard — {S}", cap="24-27"),
    "P016": A("B Arrow 3S overshot", f"Overshot B Arrow 3S — {S}", kits=[("P016", 1), ("P016", 2)]),
    "P017": A("B Excore II safety overshot", f"Overshot de sécurité B Excore II — {S}", kits=[("P017", 1)]),
    # ---------------------------------------------------------------- N surface
    "P018": A("N-N2-N3 DiscovOre core barrel assembly", f"Carottier N, N2, N3 DiscovOre — {S}", kind2="barrel",
              unnamed=SURF_UNNAMED, links={"B": "P019", "C": "P030", "WS": "P056", "1": "P054"},
              groups={"A": ["B", "5", "6", "7", "8", "9", "10", "12", "13", "14"]}, triple=["6", "7", "8", "9", "10"]),
    "P019": A("N-N2 DiscovOre head assembly", f"Tête N, N2 DiscovOre — {S}"),
    "P020": D("N-N2-N3 DiscovOre accessories", "Trousses et consommables N, N2, N3 DiscovOre",
              tables=[("P020", i) for i in range(5)]),
    "P021": A("N-N2-N3 Excore core barrel assembly", f"Carottier N, N2, N3 Excore — {S}", kind2="barrel",
              options=["CB", "CB", "IT", "IT"], links={"1": "P022", "2": "P032", "3": "P058", "8": "P054"},
              groups={"CB": ["1", "9", "10", "11", "12", "13", "14", "15", "16", "16A", "17", "18", "19", "20"],
                      "IT": ["1", "12", "13", "14", "15", "16", "16A", "17", "18", "19"]},
              drawn=["Rshell", "Bit"], triple=["13", "14", "15", "16", "16A"], fix="P021"),
    "P022": A("N-N2 Excore head assembly", f"Tête N, N2 Excore — {S}"),
    "P023": D("N-N2-N3 Excore accessories", "Pièces de rechange N, N2, N3 Excore", tables=[("P023", 0)]),
    "P024": A("N-N2-N3 OWL L-Latch core barrel assembly", f"Carottier N, N2, N3 OWL L-Latch — {S}", kind2="barrel",
              options=["CB", "CB", "IT", "IT"], links={"1": "P025", "6": "P054"},
              groups={"CB": ["1", "2", "3", "4", "5", "7", "8", "9", "10"], "IT": ["1", "2", "3", "4", "5"]},
              drawn=["Rshell"], triple_unnamed=True),
    "P025": A("N-N2 OWL L-Latch head assembly", f"Tête N, N2 OWL L-Latch — {S}", cap="28-31"),
    "P026": A("N-N2-N3 OWL standard core barrel assembly", f"Carottier N, N2, N3 OWL standard — {S}", kind2="barrel",
              options=["CB", "CB", "IT", "IT"], links={"1": "P027", "6": "P054"},
              groups={"CB": ["1", "2", "3", "4", "5", "7", "8", "9", "10"], "IT": ["1", "2", "3", "4", "5"]},
              drawn=["Rshell"], triple_unnamed=True),
    "P027": A("N-N2 OWL standard head assembly", f"Tête N, N2 OWL standard — {S}", cap="25-28"),
    "P028": D("N-N2-N3 core barrel accessories", "Consommables et conversion N, N2, N3", tables=[("P028", i) for i in range(4)]),
    "P029": A("NTW OWL standard head assembly", f"Tête NTW OWL standard — {S}", cap="25-28"),
    "P030": A("N-N2 Arrow 3S overshot and accessories", f"Overshot NH Arrow 3S (N, N2, P) — {S}", sheets=["P030", "P031"]),
    "P031": D("N-N2 Arrow 3S overshot accessories", "Trousses et conversions de l'overshot NH Arrow 3S",
              tables=[("P031", i) for i in range(5)]),
    "P032": A("N-N2 Excore II safety overshot and accessories", f"Overshot de sécurité N Excore II — {S}", kits=[("P032", 1), ("P032", 2)]),
    "P033": D("N-N2 Excore II safety overshot accessories", "Trousses de l'overshot N Excore II", tables=[("P033", 0), ("P033", 1)]),
    # ---------------------------------------------------------------- H surface
    "P034": A("H-H3 DiscovOre core barrel assembly", f"Carottier H, H3 DiscovOre — {S}", kind2="barrel",
              unnamed=SURF_UNNAMED, links={"B": "P035", "C": "P047", "WS": "P058", "1": "P054"},
              groups={"A": ["B", "5", "6", "7", "8", "9", "10", "12", "13", "14"]}, triple=["6", "7", "8", "9", "10"]),
    "P035": A("H-H3 DiscovOre head assembly", f"Tête H, H3 DiscovOre — {S}"),
    "P036": D("H-H3 DiscovOre accessories", "Trousses, consommables et conversions H, H3 DiscovOre",
              tables=[("P036", 0), ("P036", 1), ("P036", 2), ("P037", 0), ("P037", 1)], sheets=["P036", "P037"]),
    "P038": A("H-H3 Excore core barrel assembly", f"Carottier H, H3 Excore — {S}", kind2="barrel",
              options=["CB", "CB", "IT", "IT"], links={"1": "P039", "2": "P048", "3": "P058", "8": "P054"},
              groups={"CB": ["1", "9", "10", "11", "12", "13", "14", "15", "16", "16A", "17", "18", "19", "20"],
                      "IT": ["1", "12", "13", "14", "15", "16", "16A", "17", "18", "19"]},
              drawn=["Rshell", "Bit"], triple=["13", "14", "15", "16", "16A"]),
    "P039": A("H Excore head assembly", f"Tête H Excore — {S}"),
    "P040": D("H-H3 Excore accessories", "Pièces de rechange H, H3 Excore", tables=[("P040", 0)]),
    "P041": A("H-H3 OWL L-Latch core barrel assembly", f"Carottier H, H3 OWL L-Latch — {S}", kind2="barrel",
              options=["CB", "CB", "IT", "IT"], links={"1": "P042", "6": "P054"},
              groups={"CB": ["1", "2", "3", "4", "5", "7", "8", "9", "10"], "IT": ["1", "2", "3", "4", "5"]},
              drawn=["Rshell"], triple_unnamed=True),
    "P042": A("H OWL L-Latch head assembly", f"Tête H OWL L-Latch — {S}", cap="28-31"),
    "P043": A("H-H3 OWL standard core barrel assembly", f"Carottier H, H3 OWL standard — {S}", kind2="barrel",
              options=["CB", "CB", "IT", "IT"], links={"1": "P044", "6": "P054"},
              groups={"CB": ["1", "2", "3", "4", "5", "7", "8", "9", "10"], "IT": ["1", "2", "3", "4", "5"]},
              drawn=["Rshell"], triple_unnamed=True),
    "P044": A("H OWL standard head assembly", f"Tête H OWL standard — {S}", cap="25-28"),
    "P045": D("H-H3 core barrel accessories", "Consommables et conversion H, H3", tables=[("P045", 0), ("P045", 1)]),
    "P046": A("HTW OWL standard head assembly", f"Tête HTW OWL standard — {S}", cap="25-28"),
    "P047": A("H-H3 Arrow 3S overshot and accessories", f"Overshot NH Arrow 3S (H, H3) — {S}", kits=[("P047", 1), ("P047", 2)]),
    "P048": A("H-H3 Excore overshot and accessories", f"Overshot de sécurité H Excore II — {S}",
              kits=[("P048", 1), ("P048", 2), ("P048", 3)]),
    # ---------------------------------------------------------------- P surface
    "P049": A("P-P3 DiscovOre core barrel assembly", f"Carottier P, P3 DiscovOre — {S}", kind2="barrel",
              links={"B": "P050", "C": "P051", "WS": "P058", "1": "P054"},
              groups={"A": ["B", "5", "6", "7", "8", "9", "10", "12", "13", "14"]}, triple=["6", "7", "8", "9", "10"],
              fix="P049"),
    "P050": A("P DiscovOre head assembly", f"Tête P DiscovOre — {S}"),
    "P051": A("P-P3 Arrow 3S overshot and accessories", f"Overshot NHP Arrow 3S (P, P3) — {S}"),
    "P052": D("P-P3 DiscovOre & core barrel accessories", "Trousses, consommables et conversions P, P3 DiscovOre",
              tables=[("P052", i) for i in range(5)]),
    "P053": A("P OWL L-Latch head assembly", f"Tête P OWL L-Latch — {S}"),
    # ---------------------------------------------------------------- outils de surface
    "P054": A("Surface locking coupling options", f"Raccords de verrouillage — {S}", special="couplings"),
    "P055": A("Roller overshot conversion kits", "Trousses de conversion d'overshot à rouleaux"),
    "P056": A("Shallow water swivel", "Émerillon d'eau peu profond (shallow)", sheets=["P056", "P057"],
              kits=[("P056", 1)], data=("P057", 0), depth=("P057", 2), adapters=("P057", 1)),
    "P058": A("Deep water swivel", "Émerillon d'eau profond (deep)", sheets=["P058", "P059"],
              kits=[("P058", 1)], data=("P059", 1), depth=("P059", 2), adapters=("P059", 0)),
    "P060": A("Casing advancer assembly", "Avance-tubage (casing advancer)", asmrow=False, options=["STD", "DO"],
              groups={"STD": ["1A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17",
                              "18", "19", "20", "21"],
                      "DO": ["1B", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17",
                             "18", "19", "20", "21"]},
              notshown=["24", "25", "26", "27A", "27B"]),
    "P061": A("Casing & rod cutter assembly", "Coupe-tubage et coupe-tiges", special="cutter"),
    # ---------------------------------------------------------------- BU souterrain
    "P064": A("BU-BTWU DiscovOre core barrel assembly", f"Carottier BU, BTWU DiscovOre — {U}", kind2="barrel",
              unnamed=UG_UNNAMED, links={"B": "P065", "C": "P070", "D": "P094", "WS": "P098", "SB": "P100", "1": "P096"},
              groups={"A": ["B", "5", "7", "8", "9"]}),
    "P065": A("BU-BTWU DiscovOre head assembly", f"Tête BU, BTWU DiscovOre — {U}"),
    "P066": D("BU-BTWU DiscovOre accessories", "Trousses et consommables BU, BTWU DiscovOre", tables=[("P066", i) for i in range(3)]),
    "P067": A("BU Excore core barrel assembly", f"Carottier BU Excore — {U}", kind2="barrel",
              options=["CB", "CB", "IT", "IT"], links={"1": "P068", "2": "P069", "3": "P098", "4": "P100", "7": "P096"},
              groups={"CB": ["1", "8", "9", "10", "11", "12", "13", "14", "15"], "IT": ["1", "11", "13", "14", "15"]},
              drawn=["Rshell", "Bit"]),
    "P068": A("BU Excore head assembly", f"Tête BU Excore — {U}"),
    "P069": A("BU Excore II overshot assembly", f"Overshot BU Excore II — {U}"),
    "P070": A("BU-BTWU Arrow 3S overshot and accessories", f"Overshot BU, BTWU Arrow 3S — {U}", kits=[("P070", 1)]),
    "P071": A("BU EX II safety overshot and accessories", f"Overshot de sécurité BU EX II — {U}", kits=[("P071", 1)]),
    "P072": A("BU OWL L-Latch head assembly", f"Tête BU OWL L-Latch — {U}", cap="31-34"),
    # ---------------------------------------------------------------- NU souterrain
    "P073": A("NU-N2U DiscovOre core barrel assembly", f"Carottier NU, N2U DiscovOre — {U}", kind2="barrel",
              links={"B": "P074", "C": "P079", "D": "P094-NH", "WS": "P098", "SB": "P100", "1": "P096"},
              groups={"A": ["B", "5", "7", "8", "9"]}),
    "P074": A("NU-N2U DiscovOre head assembly", f"Tête NU, N2U DiscovOre — {U}"),
    "P075": D("NU-N2U DiscovOre accessories", "Trousses et consommables NU, N2U DiscovOre", tables=[("P075", i) for i in range(5)]),
    "P076": A("NU-N2U Excore core barrel assembly", f"Carottier NU, N2U Excore — {U}", kind2="barrel",
              options=["CB", "CB", "IT", "IT"], links={"1": "P077", "2": "P080", "3": "P098", "4": "P100", "7": "P096"},
              groups={"CB": ["1", "8", "9", "10", "11", "12", "13", "14", "15"], "IT": ["1", "11", "13", "14", "15"]},
              drawn=["Rshell", "Bit"]),
    "P077": A("NU-N2U Excore head assembly", f"Tête NU, N2U Excore — {U}"),
    "P078": D("N-NU-N2-N2U core barrel consumables", "Consommables N, NU, N2, N2U", tables=[("P078", 0), ("P078", 1)]),
    "P079": A("NU Arrow 3S overshot and accessories", f"Overshot NU Arrow 3S — {U}", kits=[("P079", 1)]),
    "P080": A("NU Excore II overshot and accessories", f"Overshot NU Excore II — {U}", kits=[("P080", 1)]),
    "P081": A("NU-N2U OWL L-Latch head assembly", f"Tête NU, N2U OWL L-Latch — {U}", cap="31-34"),
    # ---------------------------------------------------------------- HU souterrain
    "P082": A("HU DiscovOre core barrel assembly", f"Carottier HU DiscovOre — {U}", kind2="barrel",
              links={"B": "P083", "C": "P089", "D": "P094-NH", "WS": "P098", "SB": "P100", "1": "P096"},
              groups={"A": ["B", "5", "7", "8", "9"]}),
    "P083": A("HU DiscovOre head assembly", f"Tête HU DiscovOre — {U}"),
    "P084": D("HU DiscovOre accessories", "Trousses et consommables HU DiscovOre", tables=[("P084", i) for i in range(3)]),
    "P085": A("HU Excore core barrel assembly", f"Carottier HU Excore — {U}", kind2="barrel",
              options=["CB", "CB", "IT", "IT"], links={"1": "P086", "2": "P088", "3": "P098", "4": "P100", "7": "P096"},
              groups={"CB": ["1", "8", "9", "10", "11", "12", "13", "14", "15"], "IT": ["1", "11", "13", "14", "15"]},
              drawn=["Rshell", "Bit"]),
    "P086": A("HU Excore head assembly", f"Tête HU Excore — {U}"),
    "P087": D("HU Excore accessories", "Pièces de rechange HU Excore", tables=[("P087", 0), ("P087", 1)]),
    "P088": A("HU Excore II overshot and accessories", f"Overshot HU Excore II — {U}", kits=[("P088", 1)]),
    "P089": A("HU Arrow 3S overshot and accessories", f"Overshot HU Arrow 3S — {U}", kits=[("P089", 1)]),
    "P090": A("HU OWL L-Latch head assembly", f"Tête HU OWL L-Latch — {U}", cap="32-35"),
    # ---------------------------------------------------------------- PU souterrain
    "P091": A("PU Arrow 3S overshot and accessories", f"Overshot PU Arrow 3S — {U}",
              groups={"17": ["18", "19", "20", "21", "22"]}),
    "P092": A("PU DiscovOre head assembly", f"Tête PU DiscovOre — {U}"),
    "P093": D("PU DiscovOre accessories", "Trousses PU DiscovOre", tables=[("P093", i) for i in range(3)]),
    # ---------------------------------------------------------------- accessoires DiscovOre
    "P094": A("B loading tool", "Outil de chargement B (DiscovOre souterrain)", table=("P094", 0)),
    "P094-NH": A("NH loading tool", "Outil de chargement NH (DiscovOre souterrain)", page="P094", table=("P094", 1)),
    "P094-LI": A("Landing indicator bushing removal tool", "Extracteur de bague indicatrice d'atterrissage",
                 page="P094", table=("P094", 2)),
    "P094K": D("Survey instrument spearhead replacement assembly", "Lances de remplacement pour instruments de mesure",
               tables=[("P094", 3)], sheets=["P094"]),
    "P095": D("DiscovOre head assembly conversion kits", "Trousses de conversion des têtes DiscovOre (surface ↔ souterrain)",
              tables=[("P095", i) for i in range(8)]),
    "P096": A("Underground locking coupling options", f"Raccords de verrouillage — {U}", special="couplings"),
    "P097": A("AWJ teflon and ceramic water swivel", "Émerillon d'eau AWJ téflon et céramique", data=("P097", 1)),
    "P098": A("Pro 18+ water swivel", "Émerillon d'eau Pro 18+", special="pro", data=("P098", 3), kits=[("P098", 2)]),
    "P099": A("Pro 25+ water swivel", "Émerillon d'eau Pro 25+", special="pro", kits=[("P099", 2), ("P099", 3)]),
    "P100": A("Standard stuffing box", "Presse-étoupe standard", sheets=["P100", "P101"], special="stuffing"),
    "P101": D("Stuffing box repair kit", "Trousse de réparation du presse-étoupe", tables=[("P101", 1)]),
    "P102": A("Rotating pump through stuffing box", "Presse-étoupe rotatif à pompage (RPT)", sheets=["P102", "P103"], special="rpt"),
    "P103": D("RPT stuffing box rebuild kit", "Trousse de remise à neuf du presse-étoupe RPT", tables=[("P103", 0)]),
    "P104": A("48TT conventional core barrel system", "Carottier conventionnel 48TT", links={"9": "P105", "1": "P097"},
              data=("P104", 1)),
    "P105": A("48TT core barrel head assembly", "Tête du carottier conventionnel 48TT", kits=[("P105", 1), ("P105", 2)],
              kitnames=["Consumable kit (500 m) — 8393081200", "Spare parts kit (500 m) — 3760015999"]),
    "P107": D("Drill rod dimensions", "Tiges de forage au câble — dimensions et numéros", special="rods", sheets=["P106", "P107"]),
}

# Pages sans tableau (titres des pages du catalogue).
TITLES = {
    "P001": "Page couverture", "P002": "Table des matières (surface)", "P003": "Table des matières (souterrain)",
    "P004": "Surface — photo", "P005": "Têtes de surface — description rapide", "P062": "Souterrain — photo",
    "P063": "Outils souterrains — description rapide", "P106": "Capacité de profondeur des tiges", "P108": "Dos du catalogue",
    "P037": "H-H3 DiscovOre accessories", "P057": "Shallow water swivel — données et adaptateurs",
    "P059": "Deep water swivel — données et adaptateurs",
}

# Table des matières (pages 2 et 3) : [section, page, titre].
# Sections de la table des matières : outils souterrains en tête (l'équipement
# utilisé), puis surface et tiges.
TOC = [
    ("Souterrain — BU, BTWU", ["P064", "P065", "P066", "P067", "P068", "P069", "P070", "P071", "P072"]),
    ("Souterrain — NU, N2U", ["P073", "P074", "P075", "P076", "P077", "P078", "P079", "P080", "P081"]),
    ("Souterrain — HU", ["P082", "P083", "P084", "P085", "P086", "P087", "P088", "P089", "P090"]),
    ("Souterrain — PU", ["P091", "P092", "P093"]),
    ("Souterrain — outils", ["P094", "P094-NH", "P094-LI", "P094K", "P095", "P096", "P097", "P098", "P099", "P100", "P101",
                             "P102", "P103", "P104", "P105"]),
    ("Surface — B", ["P006", "P007", "P008", "P009", "P010", "P011", "P012", "P013", "P014", "P015", "P016", "P017"]),
    ("Surface — N, N2, N3", ["P018", "P019", "P020", "P021", "P022", "P023", "P024", "P025", "P026", "P027", "P028", "P029",
                             "P030", "P031", "P032", "P033"]),
    ("Surface — H, H3", ["P034", "P035", "P036", "P038", "P039", "P040", "P041", "P042", "P043", "P044", "P045", "P046",
                         "P047", "P048"]),
    ("Surface — P, P3", ["P049", "P050", "P051", "P052", "P053"]),
    ("Surface — outils", ["P054", "P055", "P056", "P058", "P060", "P061"]),
    ("Tiges de forage", ["P106", "P107"]),
]


# ------------------------------------------------------------------ corrections ponctuelles


def fix_rows(key, parts):
    """Lignes mal découpées par la lecture du PDF (vérifiées sur les pages)."""
    if key == "P011":
        out = []
        for p in parts:
            if p.get("desc") == "B shut off valve Thrust bearing":
                out.append({**p, "desc": "Thrust bearing", "values": ["3760006470"], "qty": "2"})
            else:
                out.append(p)
        return out
    if key == "P021":
        for p in parts:
            if (p.get("section") or "").startswith("5 BNHP"):
                p.clear()
                p.update({"ref": "5", "desc": "BNHP hoisting plug assembly, NW box thread", "values": ["3760006010"] * 3,
                          "qty": None, "remarks": "", "section": None, "sec": "Hoisting plug*"})
        return parts
    if key == "P049":
        # Les trousses de rechange listées sous le carottier vont dans la liste des trousses.
        cut = next(i for i, p in enumerate(parts) if (p.get("desc") or p.get("section") or "").startswith("Spare Part Kits"))
        return parts[:cut]
    return parts


# ------------------------------------------------------------------ assemblages


def assembly(key, spec, tables):
    page = spec.get("page", key)
    tref = spec.get("table", (page, 0))
    rows = tables[tref[0]][tref[1]]
    parts, sizes = parse_parts(rows)
    parts = [p for p in fix_rows(spec.get("fix", key), parts) if p]
    order = sorted(range(len(sizes)), key=lambda i: ORDER.get(sizes[i] or "", i)) if len(sizes) > 1 else list(range(len(sizes)))
    sizes = [sizes[i] for i in order]
    for p in parts:
        if "values" in p:
            p["values"] = [p["values"][i] for i in order]
    multi = len(sizes) > 1
    asm = {"title": spec["title"], "titleFr": spec["fr"]}
    if page != key:
        asm["sheet"] = page
    asm["sheets"] = spec.get("sheets", [page])
    out = []
    unnamed = {u[0]: u[1:] for u in spec.get("unnamed", [])}
    seen_unnamed = {}
    opt = list(spec.get("options", []))
    triple_names = iter(["ST", "ST", "TA", "PP", "PI", "OR"])
    prev_ref = None
    pending_section = None
    for p in parts:
        if "section" in p and p.get("desc") is None:
            pending_section = p["section"]
            sec = p["section"]
            # Section sans ligne (« Wireline drill rod ») : une ligne pour la tige.
            for k, (first, _) in unnamed.items():
                if sec.startswith(k) and first == "Rod":
                    out.append(["Rod", "", None, sec, {"pnText": "Voir les tiges (p. 107)", "see": ["P107"]}])
            continue
        ref = p["ref"]
        ex = {}
        if (not out and ref in ("-", "") and spec.get("asmrow", True) and not opt and not unnamed
                and re.search(r"(?i)assembly|assy|overshot", p["desc"])):
            # Première ligne : l'assemblage lui-même (numéro de commande complet).
            vals = p["values"]
            if multi and len(set(vals)) > 1:
                asm["pn"] = " / ".join(f"{size_label(s)} {pn_text(v)[0] or '—'}" for s, v in zip(sizes, vals))
            else:
                asm["pn"] = pn_text(vals[0])[0]
            continue
        if ref == "Option" and prev_ref:
            ref = prev_ref
            p = {**p, "desc": p["desc"] + " (option)"}
        if ref == "Triple tubes components":
            ref = ""
        if ref == "Not shown":
            ref = "NS"
            ex["no3d"] = True
            ex["note"] = "Non dessiné au catalogue."
        if ref in ("-", "") and p["desc"] in WRENCH:
            ref = WRENCH[p["desc"]]
            ex["no3d"] = True
        elif ref == "-" and "Inner Tube Cap Assembly".lower() in p["desc"].lower() and spec.get("cap"):
            ref = spec["cap"]
        elif ref in ("", "-") and opt:
            ref = opt.pop(0)
        elif ref in ("", "-") and spec.get("triple_unnamed") and p["sec"] and "Consumables" in p["sec"]:
            ref = next(triple_names)
            ex["no3d"] = True
            ex["note"] = "Triple tube (N3, H3) : non dessiné au catalogue."
        elif ref == "" and p["values"] and p["desc"] and spec.get("triple_unnamed"):
            ref = next(triple_names)
            ex["no3d"] = True
            ex["note"] = "Triple tube (N3, H3) : non dessiné au catalogue."
        elif ref in ("", "-") and p["sec"]:
            for k, names in unnamed.items():
                if p["sec"].startswith(k):
                    n = seen_unnamed.get(k, 0)
                    ref = names[0] if n == 0 else names[1]
                    seen_unnamed[k] = n + 1
                    break
        elif ref in ("Water swivel", "Stuffing box", "Stuffing box dimension kit", "Rod", "W.S.", "W.S. adapter", "H.P.",
                     "H.P. adapter"):
            ref = {"Water swivel": "WS", "Stuffing box": "SB", "Stuffing box dimension kit": "DK", "W.S.": "WS",
                   "W.S. adapter": "WSA", "H.P.": "HP", "H.P. adapter": "HPA"}.get(ref, ref)
        if ref == "" and prev_ref and p["values"]:
            ref = prev_ref  # ligne de la même pièce (3,0 m sous 1,5 m)
        if not ref:
            raise SystemExit(f"{key} : ligne sans repère — {p}")
        if ref in spec.get("notshown", []) or "not shown" in p["desc"].lower():
            ex["no3d"] = True
            ex["note"] = "Non dessiné au catalogue."
        if ref in spec.get("links", {}):
            ex["link"] = spec["links"][ref]
        if ref in spec.get("groups", {}):
            ex["group"] = spec["groups"][ref]
        if ref in ("Rshell", "Bit") and "See diamond" in " ".join(p["values"]):
            pass
        row = to_row(p, sizes if multi else None, ex)
        if ref in spec.get("triple", []):
            r4 = row[4] if len(row) > 4 else {}
            r4.setdefault("note", "Triple tube (N3, H3, P3).")
            if len(row) == 4:
                row.append(r4)
        row[0] = ref
        out.append(row)
        prev_ref = ref
    for ref in spec.get("drawn", []):
        if any(r[0] == ref for r in out):
            continue
        desc = {"Rshell": "Reaming shell", "Bit": "Coring bit"}[ref]
        out.append([ref, "", None, desc, {"pnText": "Catalogue des outils diamantés",
                                          "note": "Sur le dessin du catalogue, sans ligne au tableau."}])
    if key == "P079":
        # Les deux dernières lignes reprennent les repères 17 et 18 avec des pièces de taille B.
        for r in out[-2:]:
            if len(r) == 4:
                r.append({})
            r[4]["note"] = "Ligne en double au catalogue (repère déjà utilisé plus haut, pièce de taille B)."
    if multi:
        asm["sizes"] = [size_label(s) for s in sizes]
    asm["parts"] = out
    return asm


# ------------------------------------------------------------------ listes de trousses


KIT = re.compile(r"(?i)\bkits?\b|\bassembly\b(?!.*\bkit)")


def kit_rows(rows, start=1):
    """Tableau de trousse(s) : la trousse en tête, son contenu en sous-lignes."""
    head = [clean(c) for c in rows[0]]
    roles = []
    sizes = []
    # Deux lignes d'en-tête quand les colonnes sont des tailles.
    nh = 1
    if len(rows) > 1 and not any(is_pn(clean(c)) for c in rows[1]) and len(set(rows[1])) > 1 and any(
            re.search(r"(?i)core barrel$|size$|cable$|^description$|^part number$", clean(c)) for c in rows[1]):
        nh = 2
    for j, h in enumerate(head):
        sub = clean(rows[1][j]) if nh == 2 else ""
        low = (h + " " + sub).lower()
        if low.startswith("part number") and "item in" not in low and sub and sub.lower() != "part number":
            roles.append("pn")
            sizes.append(re.sub(r"(?i)\s*(core barrel|size)\s*", " ", sub).strip())
        elif "item in" in low:
            roles.append("repl")
        elif "part number" in low:
            roles.append("pn")
            sizes.append(None)
        elif "description" in low or "spare part kits" in low:
            roles.append("desc")
        elif "qty" in low:
            roles.append("qty")
        elif "item" in low:
            roles.append("item")
        else:
            roles.append("skip")
    if len([r for r in roles if r == "desc"]) > 1:
        first = roles.index("desc")
        roles = [r if (r != "desc" or i == first) else "skip" for i, r in enumerate(roles)]
    multi = len(sizes) > 1
    out = []
    n = start - 1
    sub = 0
    section = None
    cur_kit = False
    order = sorted(range(len(sizes)), key=lambda i: ORDER.get(sizes[i] or "", i)) if multi else []
    for r in rows[nh:]:
        r = [clean(c) for c in r]
        if not any(r):
            continue
        labelled = [re.match(r"^([A-Z][a-z]+) (\d{10})$", c) for c in r]
        if sum(1 for m in labelled if m) >= 2:
            # Trousse en deux versions (« Complete 3760014167 | Basic 3760014169 ») : tailles.
            sizes = [m.group(1) for m in labelled if m]
            multi, order = True, list(range(len(sizes)))
            n += 1
            sub = 0
            cur_kit = True
            out.append([str(n), labelled[1 if not labelled[0] else 0].group(2), 1, r[0],
                        {"sizes": {m.group(1): m.group(2) for m in labelled if m}}])
            continue
        if len(set(c for c in r if c)) == 1 and not is_pn(next(c for c in r if c)) or (
                len(r) > 2 and r[1] == r[2] == r[-1] and not is_pn(r[1])):
            # Section (« Item to be replaced… ») ou ligne-titre « numéro | titre de la trousse ».
            if is_pn(r[0]) and r[1]:
                n += 1
                sub = 0
                out.append([str(n), r[0], 1, r[1]])
                section = None
                cur_kit = True
            else:
                section = r[0]
            continue
        cell = dict(desc="", qty=None, values=[], repl="", item="")
        for role, v in zip(roles, r):
            if role == "pn":
                cell["values"].append(v)
            elif role in ("desc", "qty", "repl", "item"):
                cell[role] = v
        if not cell["desc"]:
            continue
        vals = [cell["values"][i] for i in order] if multi else cell["values"]
        p = {"ref": "", "desc": cell["desc"], "values": vals, "qty": cell["qty"], "remarks": ""}
        if section and "removed" in section.lower():
            # Pièce à retirer : son numéro est celui de la colonne « Item in … ».
            p["desc"] += " — à retirer"
            if is_pn(cell["repl"]) and not any(is_pn(v) for v in p["values"]):
                p["values"] = [cell["repl"]] * len(p["values"] or [""])
        elif section and "added" in section.lower():
            p["desc"] += " — à ajouter"
        elif cell["repl"] and is_pn(cell["repl"]):
            p["desc"] += f" — remplace {cell['repl']}"
        is_kit = bool(re.search(r"(?i)\bkits?\b", cell["desc"])) and not (section and "add" in section.lower())
        if cell["item"] in ("-",) or (cell["item"] == "" and "kit" in cell["desc"].lower()):
            is_kit = True
        elif cell["item"] and cell["item"] != "-":
            is_kit = False
        if is_kit or n < start or not cur_kit:
            n += 1
            sub = 0
            ref = str(n)
            cur_kit = is_kit
        else:
            sub += 1
            ref = f"{n}.{sub}"
        row = to_row(p, [sizes[i] for i in order] if multi else None)
        row[0] = ref
        if cell["item"] and cell["item"] not in ("-", ""):
            ex = row[4] if len(row) > 4 else {}
            ex["note"] = f"Repère {cell['item']} du dessin."
            if len(row) == 4:
                row.append(ex)
        out.append(row)
    return out, [sizes[i] for i in order if sizes[i]] if multi else []


def document(key, spec, tables):
    rows, sizes = [], []
    for page, idx in spec.get("tables", []):
        t = tables[page][idx]
        if key == "P052" and idx == 4:
            # Ligne de titre placée au-dessus de l'en-tête : en-tête d'abord.
            t = [t[1], t[0]] + t[2:]
        if key == "P028" and idx == 3 or key == "P052" and idx == 3:
            t = t[1:]
        if key == "P011":
            # Deux lignes fusionnées par la lecture du PDF (« B shut off valve » + « Thrust bearing »).
            t = [["Thrust bearing", "3760006470", "2"] if clean(r[0]) == "B shut off valve Thrust bearing" else r for r in t]
        r, s = kit_rows(t, start=len([x for x in rows if "." not in x[0]]) + 1)
        rows += r
        for x in s:
            if x not in sizes:
                sizes.append(x)
    doc = {"id": key, "title": spec["title"], "titleFr": spec["fr"], "sheets": spec.get("sheets", [key]),
           "columns": ["ref", "pn", "qty", "desc"], "parts": rows}
    if sizes:
        doc["sizes"] = sizes
    return doc


def kits_document(key, asm_key, spec, tables, title, fr):
    rows = []
    names = iter(spec.get("kitnames", []))
    for page, idx in spec.get("kits", []):
        t = tables[page][idx]
        start = len([x for x in rows if "." not in x[0]]) + 1
        if spec.get("kitnames"):
            # Tableau sans ligne de trousse : son titre (au-dessus) en tête.
            name, pn = next(names).rsplit(" — ", 1)
            rows.append([str(start), pn, 1, name])
            r, _ = kit_rows(t, start=start + 1)
            r = [[f"{start}.{i + 1}", *x[1:]] for i, x in enumerate(r)]
        else:
            r, _ = kit_rows(t, start=start)
        rows += r
    return {"id": key, "title": title, "titleFr": fr, "sheets": [spec.get("page", asm_key)],
            "columns": ["ref", "pn", "qty", "desc"], "parts": rows}


# ------------------------------------------------------------------ pages particulières


def couplings(key, tables):
    rows = tables[key][0]
    head = [clean(c) for c in rows[0]]
    styles = head[1:]
    out = []
    for j, style in enumerate(styles, start=1):
        sz = {}
        for r in rows[1:]:
            rod = clean(r[0]).replace(" (HWT)", "")
            v = clean(r[j])
            if not v:
                continue
            n, t, _ = pn_text(v)
            sz[rod] = n or t
        pn = next((v for v in sz.values() if is_pn(v)), "")
        out.append([str(j), pn, 1, f"Locking coupling — {style}", {"sizes": sz}])
    return out, [clean(r[0]).replace(" (HWT)", "") for r in rows[1:]]


def cutter(tables):
    t = tables["P061"]
    labels = ["BW", "NW", "HW"]
    kits = ["3760009436", "3760009431", "3760009252"]
    lists = [parse_parts(t[i])[0] for i in range(3)]
    out = []
    for k, row in enumerate(lists[0]):
        refs = [lst[k] for lst in lists]
        descs = [r["desc"] for r in refs]
        vals = [r["values"][0] for r in refs]
        qtys = [r["qty"] for r in refs]
        same = len({d.lower() for d in descs}) == 1 and len(set(qtys)) == 1
        if same:
            p = {**row, "values": vals}
            out.append(to_row(p, labels))
        else:
            for lab, r in zip(labels, refs):
                rr = to_row(r, None)
                rr[3] = f"{r['desc']} ({lab})"
                if rr[1] == "376 011016":
                    rr.append({"note": "Numéro imprimé « 376 011016 » au catalogue (vraisemblablement 3760011016, "
                                       "même vis que le repère 3 du HW)."})
                out.append(rr)
    return out, kits, labels


def pro_swivel(key, tables):
    t = tables[key]
    parts, _ = parse_parts(t[0])
    chart = t[1][2:]
    sw = {clean(r[0]): pn_text(r[1])[0] or "-" for r in chart}
    cp = {clean(r[0]): pn_text(r[2])[0] or "-" for r in chart}
    out = []
    for p in parts:
        if "section" in p and p.get("desc") is None:
            continue
        row = to_row(p, None)
        if p["ref"] in ("1-7",):
            row[4] = {"sizes": sw, "note": "Numéro selon le filetage de la tige (tableau du catalogue)."}
            row[1] = ""
        elif p["ref"] == "7":
            row[4] = {"sizes": cp, "note": "Numéro selon le filetage de la tige (tableau du catalogue)."}
            row[1] = ""
        out.append(row)
    return out


def stuffing(tables):
    parts, _ = parse_parts(tables["P100"][0])
    seal, _ = parse_parts(tables["P100"][1])
    dim = tables["P101"][0][3:]
    rods = [clean(r[0]) for r in dim]
    out = []
    for p in parts:
        if p["ref"] == "1-3-6":
            out.append(["1-3-6", "", 1, "Seal kit", {"sizes": {"5 mm cable": "8393081985", "5-6 mm cable": "8393082109"}}])
            for s in seal[1:]:
                out.append(to_row(s, ["5 mm cable", "5-6 mm cable"]))
            continue
        if p["ref"] == "10-14":
            kit = {rod: (pn_text(r[1])[0] or "-") for rod, r in zip(rods, dim)}
            out.append(["10-14", "", 1, "Dimension kit", {"sizes": kit, "note": "Une trousse par filetage de tige (page 101)."}])
            names = ["Lubricating nipple", "Swivel adapter", "O-ring", "Washer", "Circlip"]
            for k, name in enumerate(names):
                sz = {rod: (pn_text(r[2 + k])[0] or "-") for rod, r in zip(rods, dim)}
                vals = set(sz.values())
                if len(vals) == 1:
                    out.append([str(10 + k), vals.pop(), 1, name])
                else:
                    out.append([str(10 + k), next(v for v in sz.values() if v != "-"), 1, name, {"sizes": sz}])
            continue
        out.append(to_row(p, None))
    order = {r: i for i, r in enumerate(["1-9", "1-3-6", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10-14"])}
    out.sort(key=lambda r: order.get(r[0], 100 + int(re.sub(r"\D", "", r[0]) or 0)))
    return out


def rpt(tables):
    parts, _ = parse_parts(tables["P102"][0])
    out = []
    complete = {}
    adapters = {}
    for p in parts:
        if p["ref"] == "-":
            complete[p["desc"].split(" Rotating")[0].replace(" (HWT)", "")] = p["values"][0]
        elif p["ref"] == "12":
            adapters[p["desc"].split(" Adapter")[0].replace(" (HWT)", "")] = p["values"][0]
        else:
            out.append(to_row(p, None))
    out.insert(0, ["1-12", "", 1, "Rotating pump through stuffing box", {"sizes": complete,
                                                                          "note": "Numéro selon le filetage de la tige."}])
    out.append(["12", "", 1, "Adapter sub", {"sizes": adapters, "note": "Selon le filetage de la tige."}])
    return out


def rods(tables):
    t = tables["P107"][0]
    out = []
    unit = "m"
    kinds = [(0, "O"), (3, "T"), (6, "R"), (9, "TW"), (12, "MO")]
    n = 0
    for r in t[1:]:
        r = [clean(c) for c in r]
        if r[0] == "Imperial":
            unit = "ft"
            continue
        walls = r[15]
        for col, _ in kinds:
            name, length, pn = r[col], r[col + 1], r[col + 2]
            if not name:
                continue
            n += 1
            p, text, _ = pn_text(pn)
            ex = {"note": f"Parois : {'parallèles' if walls == 'Parallel' else 'à renflement intérieur (internally upset)'}."}
            if text:
                ex["pnText"] = text
            if pn == "":
                ex["note"] += " Numéro absent du catalogue."
            out.append([str(n), p.replace("-", ""), None, f"{name} drill rod {length}", ex])
    return out


# ------------------------------------------------------------------ données techniques


def tech_note(rows):
    items = []
    for r in rows:
        r = [clean(c) for c in r]
        if len(set(r)) == 1:
            items.append(r[0])
            continue
        if r[0] in ("Technical data", "") and r[1] in ("Metric", "Metric system (mm)"):
            continue
        k, a, b = r[0], r[1], r[2] if len(r) > 2 else ""
        items.append(f"{k} : {a}" + (f" ({b})" if b and b != a else ""))
    return " · ".join(items)


def depth_note(rows):
    head = [clean(c) for c in rows[0]]
    out = []
    for r in rows[1:]:
        r = [clean(c) for c in r]
        out.append(f"{r[0]} — " + ", ".join(f"{h} {v}" for h, v in zip(head[1:], r[1:])))
    return " · ".join(out)


def adapters_doc(key, rows, title, fr, sheet):
    out = []
    n = 0
    for r in rows[1:]:
        r = [clean(c) for c in r]
        if r[0] in ("Drill rod pin",):
            continue
        n += 1
        pn, text, _ = pn_text(r[3])
        kind = "casing pin" if n > 0 and r[0] == "BW" and r[1] in ("NW", "HW", "HWT") else "rod pin"
        row = [str(n), pn, None, f"Adapter {r[0]} rod pin – {r[1]} {kind} ({r[2]})"]
        if text:
            row.append({"pnText": text})
        out.append(row)
    return {"id": key, "title": title, "titleFr": fr, "sheets": [sheet], "columns": ["ref", "pn", "qty", "desc"], "parts": out}


# ------------------------------------------------------------------ assemblage du fichier


def build(path):
    tables = read_tables(path)
    assemblies, documents = {}, []
    titles = dict(TITLES)
    for key, spec in PAGES.items():
        page = spec.get("page", key)
        if spec["kind"] == "doc":
            if spec.get("special") == "rods":
                doc = {"id": key, "title": spec["title"], "titleFr": spec["fr"], "sheets": spec["sheets"],
                       "columns": ["ref", "pn", "qty", "desc"], "parts": rods(tables)}
            else:
                doc = document(key, spec, tables)
            documents.append(doc)
            for s in doc["sheets"]:
                titles.setdefault(s, spec["title"])
            continue
        special = spec.get("special")
        if special == "couplings":
            parts, rods_ = couplings(page, tables)
            asm = {"title": spec["title"], "titleFr": spec["fr"], "sheets": [page], "sizes": rods_, "parts": parts,
                   "note": "Chaque style de raccord se commande selon le filetage de la tige (numéros par type de tige)."}
        elif special == "cutter":
            parts, kits, labels = cutter(tables)
            asm = {"title": spec["title"], "titleFr": spec["fr"], "sheets": [page], "sizes": labels,
                   "pn": " / ".join(f"{lab} {k}" for lab, k in zip(labels, kits)), "parts": parts,
                   "note": "BW casing / N rod : 2,4 à 3,25 po (61 à 82,6 mm) · NW casing / H rod : 3,0 à 3,75 po "
                           "(76,2 à 95,2 mm) · HW casing / P rod : 3,85 à 4,75 po (97,8 à 120,6 mm). Graisser l'outil avant "
                           "et après chaque usage."}
        elif special == "pro":
            asm = {"title": spec["title"], "titleFr": spec["fr"], "sheets": [page], "parts": pro_swivel(page, tables)}
        elif special == "stuffing":
            asm = {"title": spec["title"], "titleFr": spec["fr"], "sheets": spec["sheets"], "parts": stuffing(tables),
                   "pn": "8393081965"}
        elif special == "rpt":
            asm = {"title": spec["title"], "titleFr": spec["fr"], "sheets": spec["sheets"], "parts": rpt(tables)}
        else:
            asm = assembly(key, spec, tables)
        if spec.get("data"):
            p, i = spec["data"]
            asm["note"] = "Données techniques — " + tech_note(tables[p][i])
        if spec.get("depth"):
            p, i = spec["depth"]
            asm["note"] = asm.get("note", "") + " · Capacité de profondeur — " + depth_note(tables[p][i])
        assemblies[key] = asm
        for s in asm["sheets"]:
            titles.setdefault(s, spec["title"])
        if spec.get("kits"):
            documents.append(kits_document(f"{key}K", key, spec, tables, f"{spec['title']} — kits",
                                           f"Trousses — {spec['fr'].split(' — ')[0]}"))
        if key == "P049":
            rows = tables["P049"][0]
            cut = next(i for i, r in enumerate(rows) if clean(r[1]).startswith("Spare Part Kits"))
            kits = []
            for r in rows[cut + 1:]:
                r = [clean(c) for c in r]
                if len(set(r[1:])) == 1:
                    continue
                p = {"ref": "", "desc": r[1], "values": [r[4], r[3]], "qty": None, "remarks": ""}
                row = to_row(p, ["P", "P3"])
                row[0] = str(len(kits) + 1)
                kits.append(row)
            documents.append({"id": "P049K", "title": "P-P3 DiscovOre spare part kits (2000 m / 6600 ft drilling)",
                              "titleFr": "Trousses — Carottier P, P3 DiscovOre", "sheets": ["P049"],
                              "columns": ["ref", "pn", "qty", "desc"], "sizes": ["P", "P3"], "parts": kits})
        if spec.get("adapters"):
            p, i = spec["adapters"]
            documents.append(adapters_doc(f"{key}A", tables[p][i], f"{spec['title']} — drill rod adapters",
                                          f"Adaptateurs de tige — {spec['fr']}", p))
    titles.update({k: v for k, v in TITLES.items()})
    # Table des matières : racine du catalogue, une ligne par page.
    ids = {**{k: v["titleFr"] for k, v in assemblies.items()}, **{d["id"]: d["titleFr"] for d in documents}}
    toc = []
    for section, pages in TOC:
        for p in pages:
            num = re.sub(r"\D", "", p.split("-")[0]) if p != "P094K" else "94"
            ref = str(int(num)) + ("" if p in ("P094", "P094K") or "-" not in p else p.split("-")[1][:1].lower())
            if p == "P094K":
                ref = "94s"
            if p == "P094-NH":
                ref = "94n"
            if p == "P094-LI":
                ref = "94i"
            if p == "P106":
                toc.append([ref, "", None, "Capacité de profondeur des tiges", {"pseudo": True, "index": True, "see": ["P106"],
                                                                                  "note": section}])
                continue
            target = p
            title = ids.get(target)
            if title is None:
                raise SystemExit(f"Table des matières : {p} inconnu")
            toc.append([ref, "", None, title, {"link": target, "pseudo": True, "index": True, "note": section}])
    root = {"title": "Core Drilling Tools — In-The-Hole (table of contents)", "titleFr": "Gamme d'outils de carottage ITH",
            "sheets": ["P002", "P003"],
            "note": "Table des matières du catalogue : chaque ligne ouvre la page de l'assemblage ou de la liste. "
                    "La 3D présente un exemplaire de chaque famille d'outils souterrains (taille NU) ; chaque page a sa propre 3D.",
            "parts": toc}
    apply_drawn(assemblies)
    assemblies = {"P002": root, **assemblies}
    titles["P002"] = TITLES["P002"]
    sheet_titles = {sid(n): titles.get(sid(n), "") for n in range(1, 109)}
    return {
        "id": "epiroc-ith",
        "name": "Epiroc — outils de carottage ITH",
        "manufacturer": "Epiroc",
        "category": "Outils de carottage au câble (in-the-hole)",
        "document": {"title": "Core Drilling Tools — In-The-Hole", "reference": "Catalogue ITH Epiroc",
                     "preparedBy": "Epiroc Drilling Tools", "date": "2026-08-24", "pagePattern": "pages/{sheet}.webp",
                     "sheets": 108, "kind": "catalogue"},
        "labels": {"documents": "Trousses, consommables et options"},
        "specs": [
            ["Catalogue", "Core Drilling Tools — In-The-Hole (Epiroc, 108 p.)"],
            ["Têtes de surface", "DiscovOre, Excore, OWL L-Latch, OWL standard"],
            ["Têtes souterraines", "DiscovOre, Excore, OWL L-Latch"],
            ["Overshots", "Arrow 3S, Excore II"],
            ["Tailles de surface", "B, N, N2, N3, H, H3, P, P3 (NTW, HTW)"],
            ["Tailles souterraines", "BU, BTWU, NU, N2U, HU, PU"],
            ["Émerillons d'eau", "Peu profond, profond, AWJ, Pro 18+, Pro 25+"],
        ],
        "weights": [],
        "sheetTitles": sheet_titles,
        "root": "P002",
        "assemblies": assemblies,
        "documents": documents,
    }


# ------------------------------------------------------------------ liste ↔ dessin

# Écarts entre la liste et le dessin du catalogue, par page : (repère, n-ième
# ligne de ce repère, ajouts). La 3D suit le dessin : qty3d donne le nombre de
# pièces dessinées, la note signale l'écart ; same rattache une ligne en double
# à la pièce qu'elle désigne.
DRAWN = {
    "P079": [("17", 2, {"same": "16"}), ("18", 2, {"same": "17"})],
    "P086": [("13", 1, {"qty3d": 1}), ("23", 1, {"qty3d": 1}), ("25", 1, {"qty3d": 2})],
    "P097": [("2", 1, {"qty3d": 1}), ("3", 1, {"qty3d": 2}), ("4", 1, {"qty3d": 3, "note": "Jeu de 3 garnitures, dessinées séparément."}),
             ("5", 1, {"qty3d": 1}), ("6", 1, {"qty3d": 2})],
    "P105": [("13", 1, {"qty3d": 2, "note": "Le dessin en montre deux (un sous la rondelle 12, un sur l'arbre 18) ; "
                                           "la trousse de pièces de rechange en compte aussi deux."})],
}


def apply_drawn(assemblies):
    for key, fixes in DRAWN.items():
        parts = assemblies[key]["parts"]
        for ref, nth, add in fixes:
            hits = [r for r in parts if str(r[0]) == ref]
            if len(hits) < nth:
                raise SystemExit(f"{key} : ligne {ref} n° {nth} introuvable")
            row = hits[nth - 1]
            if len(row) < 5:
                row.append({})
            ex = row[4]
            ex.update({k: v for k, v in add.items() if k != "note"})
            note = add.get("note")
            if "qty3d" in add and not note:
                n, q = add["qty3d"], row[2]
                note = f"La liste indique {q}, le dessin du catalogue en montre {n}."
            if note:
                ex["note"] = f"{ex['note']} {note}" if ex.get("note") else note


# ------------------------------------------------------------------ pages en images


def render_pages(path, out):
    from PIL import Image

    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdftoppm", "-r", "200", "-png", path, f"{tmp}/p"], check=True)
        files = sorted(Path(tmp).glob("p-*.png"))
        last = len(files)
        for i, f in enumerate(files, start=1):
            img = Image.open(f).convert("RGB")
            if i in (1, last):
                halves = [(1 if i == 1 else 108, img)]
            else:
                w, h = img.size
                halves = [(2 * (i - 1), img.crop((0, 0, w // 2, h))), (2 * (i - 1) + 1, img.crop((w // 2, 0, w, h)))]
            for num, im in halves:
                im.save(out / f"{sid(num)}.webp", "WEBP", quality=70, method=6)
    print(f"{len(list(out.glob('*.webp')))} pages dans {out}", file=sys.stderr)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("pdf")
    ap.add_argument("--pages", help="dossier de sortie des pages WebP (au lieu du fichier de données)")
    a = ap.parse_args()
    if a.pages:
        render_pages(a.pdf, a.pages)
        return
    json.dump(build(a.pdf), sys.stdout, ensure_ascii=False, indent=1)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()

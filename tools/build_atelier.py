#!/usr/bin/env python3
"""
Données d'atelier d'un équipement, tirées uniquement de son manuel de pièces,
aux formats lus par src/ui/features/ (public/equipment/<id>/<nom>.json) :

- bulles.json : position des bulles de repère sur les planches (OCR validé par
  la liste de la planche), par numéro de pièce (fiche.js, « Voir sur le dessin »)
  et par repère (planches.js, clic sur la planche) ;
- donnees.json : données techniques (capacités, moteurs, pompes, pressions,
  vérins, instruments, pneus) relevées dans les titres et les descriptions des
  listes, couples et réglages imprimés sur les dessins (relus), pièces
  d'entretien (graisseurs, filtres, trousses, outillage), avec leur page ;
- entretien.json : points d'entretien des listes (graisseurs, éléments
  filtrants, reniflards, repères de remplissage), placés sur la pièce de leur
  repère dans la vue 3D ;
- consignes.json : notes des dessins (couples, produits de freinage, cales,
  orientation, trousses…), relues et traduites, avec leur cadre sur la planche ;
- schemas.json : circuits des schémas (composants des schémas hydrauliques et
  pneumatiques, étiquettes des schémas électriques), titre relu de chaque
  planche électrique, échelons et renvois.

Usage :
    python3 tools/build_atelier.py <id> tools/atelier/ocr/<id>.jsonl.gz

Les fichiers OCR viennent de tools/ocr_pages.py (une ligne JSON par planche).
Les textes lus sont relus sur les planches (tools/atelier_review.py) ; la
relecture, tools/atelier/<id>.json, donne la transcription exacte, la
traduction, les couples et les valeurs : seuls les textes relus sont publiés.
Le script affiche la liste des fichiers écrits, à déclarer dans le champ
« extras » de public/equipment/index.json. Sans OCR, seules les données des
listes sont produites.
"""
import difflib
import gzip
import json
import re
import sys
from collections import defaultdict

# ---------------------------------------------------------------- systèmes
SYSTEMS = {
    'general': ('Vue générale', 'general'),
    'porteur': ('Porteur et châssis', 'carrier'),
    'moteur': ('Moteur diesel et refroidissement', 'engine'),
    'cabine': ('Cabine et poste de conduite', 'cab'),
    'hydraulique': ('Hydraulique', 'hydraulic'),
    'air': ('Air comprimé et eau', 'air'),
    'electricite': ('Électricité et commandes', 'electric'),
    'glissiere': ('Glissière et positionnement', 'slide'),
    'avance': ('Avance et forage', 'feed'),
    'carrousel': ('Carrousel et manutention des tiges', 'carousel'),
    'graissage': ('Graissage', 'grease'),
    'securite': ('Sécurité et extinction', 'fire'),
    'finition': ('Finition et autocollants', 'decal'),
    'options': ('Options et outillage', 'tools'),
}
# Familles du catalogue d'outils de carottage (Epiroc).
SYSTEMS_CAT = {
    'gamme': ('Gamme et repères', 'general'),
    'carottier': ('Carottiers', 'barrel'),
    'tete': ('Têtes de carottier', 'head'),
    'overshot': ('Overshots et outils de repêchage', 'overshot'),
    'emerillon': ('Émerillons d\'eau', 'swivel'),
    'presse': ('Presse-étoupes', 'packing'),
    'tubage': ('Tubage et coupe', 'casing'),
    'raccord': ('Raccords et adaptateurs', 'fitting'),
    'trousse': ('Trousses et consommables', 'kit'),
    'outil': ('Outils de manutention', 'tools'),
}

# Règles fortes (titre propre à un système), dans l'ordre ; les termes
# génériques (vanne, vérin, distributeur seul…) passent après le parent.
STRONG = [
    ('porteur', r'MAST REST'),
    ('securite', r'FIRE|E-STOP|EMERGENCY STOP|SAFETY CHAIN'),
    ('finition', r'DECAL|LABEL KIT|FINISHING|\bSIGN\b'),
    ('graissage', r'GREAS|LUBRIC|INJECTOR ASSY'),
    ('options', r'OPTIONS|TOOL KIT|BREAKOUT|WASH ?WAND|HOSE REEL'),
    ('hydraulique', r'VALVE BANK|FEED VALVE|SETUP VALVE|DRILLING VALVE|TRAM VALVE|AUX\. VALVE|FEED SYSTEM VALVE|TRAMMING MANIFOLD'),
    ('air', r'BOOSTER (?:INSTALL|MODULE|COMPRESSOR)|LE ROI|COMPRESSOR|AFTERCOOLER|AIR FILTER|WATER SEPARATOR|WATER PUMP|WATER INLET|WATER 3-WAY|RECEIVER|AIR SYSTEM|AIR ON/OFF|AIR SWIVEL|BYPASS VALVE|AUTO DRAIN|PRESS(?:URE)?\.? DIFF|COMP\. (?:CONTROL|DISCHARGE)|SOL(?:ENOID)?\.? VALVES?, AIR|AIR CTRL|AIR INLET PIPING|MINE AIR|DTH|RECIP DRIVE|PNEUMATIC|AIR SCHEMATIC|AIR INTAKE|BOOSTER$|-T BOOSTER'),
    ('moteur', r'ENGINE|RADIATOR|EXHAUST|\bCAC\b|COOLANT|FUEL|BELT GUARD|MBE904|DEUTZ|D914|MUFFLER|BATTERY|AIR INLET ASSY'),
    ('carrousel', r'CAROUSEL|PIPE ARM|SWING ARM|PIVOT ARM|PIPE RAMP|PIPE GUIDES?|CLAMP ARM|PIPE CLAMP|ROD (?:RACK|HANDL)'),
    ('glissiere', r'SLIDE|MCP|ROTARY ACTUATOR|\bACTUATOR$|MAST CONNECTION|ALIGNMENT LASER|TRAMMING CAMERA'),
    ('avance', r'FEED|TOP ?DRIVE|STINGER|CENTRALIZER|SLIP PLATE|\bJAWS\b|\bMAST\b|HOSE LOOP|GUIDE BAR|LENGTH TRANSDUCER|WIPER|DIVERTOR|DIVERTER|ROCK DEFLECTOR|SPLIT CENT|LOAD CHECK|TABLE|ROTATION MOTOR'),
    ('electricite', r'ELECTRICAL|ELEC |JUNCTION BOX|POWER PANEL|HARNESS|CABLE REEL|CABLE ROLLER|SENSOR|CAMERA|REMOTE MONITORING|\bDCU\b|ERIS|CONTROL PANEL|EBOM|SCHEMATICS|\bLV\b|\bHV\b|MAIN MOTOR|ELECTRIC DIAGRAM|CONSOL|REMOTE CONTROL|SET UP CONTROL|DRILLING CONTROL'),
    ('cabine', r'\bCAB\b|SEAT|ROPS|FOPS|SERVICE COMPARTMENT|DRIVER|\bROOF\b'),
    ('hydraulique', r'HYDRAULIC|HYD\.|PUMP DRIVE|HIGH PRESSURE FILTER|SUCTION|PRESSURE LINE|PRESSURE MANIFOLD|RETURN MANIFOLD|QUICK DISCONNECT|SHUTTLE|OIL COOLER|HYD(?:RAULIC)? ?TANK|COUPLING|HOSE KIT|PLUMBING|TRANSDUCER BLOCK|ELECTRIC OIL (?:FILL )?PUMP|OIL FILL PUMP|UNLOAD VALVE|LOAD SENSE|GAUGE PANEL, DU311(?:-TK)? *$|DA101'),
    ('porteur', r'CARRIER|FRAME|OUTRIGGER|AXLE|WHEEL|TIRE|BRAKE|SKID|FRONT DECK|REAR DECK|TRACK|GEARBOX|FLOOR|TRAM STEP|ARTICULATION'),
    ('general', r'GENERAL ARRANGEMENT|GENERAL VIEWS'),
]
# Règles faibles : seulement sans parent rangé.
WEAK = [
    ('hydraulique', r'VALVE|CYLINDER|PUMP|FILTER|HOSE|SOLENOID|TRANSDUCER|MANIFOLD'),
    ('porteur', r'GASKET|BUSHING|COVER'),
]
# Corrections au cas par cas (titre trompeur).
OVERRIDES = {
    'du311-std': {'P216': 'air', 'P312': 'air', 'P314': 'air', 'P276': 'hydraulique', 'P418': 'air', 'P144': 'carrousel'},
    'du311': {},
    # STM-1500 : tête de forage et serre-tiges (avance), treuil, groupe hydraulique, eau et boue, protections.
    'stm-1500': {**{k: 'avance' for k in ('P032', 'P048', 'P049', 'P052')}, **{k: 'treuil' for k in ('P039', 'P040', 'P041', 'P042')},
                 **{k: 'hydraulique' for k in ('P068', 'P069', 'P071')}, **{k: 'air' for k in ('P029', 'P034', 'P036')},
                 **{k: 'securite' for k in ('P023', 'P024', 'P025')}},
}
CAT_RULES = [
    ('gamme', r'^Gamme'),
    ('trousse', r'^Trousses|consommables|Conversion|conversion'),
    ('tete', r'^Tête'),
    ('carottier', r'^Carottier'),
    ('overshot', r'^Overshot|repêchage'),
    ('emerillon', r'^Émerillon'),
    ('presse', r'^Presse-étoupe'),
    ('tubage', r'tubage|Coupe-'),
    ('raccord', r'^Raccord|^Adaptateur'),
    ('outil', r'^Outil|^Extracteur'),
]


def classify(data):
    asms = data['assemblies']
    parent = {}
    for k, a in asms.items():
        for r in a.get('parts', []):
            if len(r) > 4 and isinstance(r[4], dict) and r[4].get('link') in asms:
                parent.setdefault(r[4]['link'], k)
    catalogue = data['document'].get('kind') == 'catalogue'
    out = {}

    def title(a):
        return (a.get('title') or '').upper()

    def strong(t):
        for s, p in STRONG:
            if re.search(p, t):
                return s
        return None

    def get(k, seen=()):
        if k in out:
            return out[k]
        a = asms[k]
        if catalogue:
            t = a.get('titleFr') or a.get('title') or ''
            s = next((s for s, p in CAT_RULES if re.search(p, t)), 'gamme')
        else:
            t = title(a)
            s = strong(t)
            if not s and k in parent and parent[k] not in seen:
                s = get(parent[k], seen + (k,))
                if s == 'general':
                    s = None
            if not s:
                s = next((s for s, p in WEAK if re.search(p, t)), None)
            if not s:
                s = 'general' if k == data['root'] else 'porteur'
        out[k] = s
        return s

    for k, v in OVERRIDES.get(data['id'], {}).items():
        if k in asms:
            out[k] = v
    for k in asms:
        get(k)
    docs = {}
    for d in data.get('documents', []):
        t = (d.get('title') or d.get('titleFr') or '').upper()
        if catalogue:
            tf = d.get('titleFr') or ''
            docs[d['id']] = next((s for s, p in CAT_RULES if re.search(p, tf)), 'trousse')
        elif re.search(r'AIR SCHEMATIC|PNEUMATIC', t):
            docs[d['id']] = 'air'
        elif re.search(r'JUNCTION BOX|PANEL|HARNESS', t):
            docs[d['id']] = 'electricite'
        elif re.search(r'HYDRAULIC|PLUMBING', t):
            docs[d['id']] = 'hydraulique'
        elif re.search(r'FIRE', t):
            docs[d['id']] = 'securite'
        else:
            docs[d['id']] = 'electricite'
    return out, docs, parent


# ---------------------------------------------------------------- unités
FRAC = re.compile(r'(\d+)\s+(\d+)/(\d+)|(\d+)/(\d+)|(\d+(?:\.\d+)?)')


def num(s):
    """« 6 1/8 » → 6.125 ; « 229/32 » (2 29/32 mal lu) → 2.90625 ; « 3.25 » → 3.25."""
    s = s.strip().replace(',', '')
    m = re.fullmatch(r'(\d+)\s+(\d+)/(\d+)', s)
    if m:
        return int(m[1]) + int(m[2]) / int(m[3])
    m = re.fullmatch(r'(\d)(\d{2})/(\d{2})', s)  # « 229/32 » : 2 29/32
    if m and int(m[2]) < int(m[3]):
        return int(m[1]) + int(m[2]) / int(m[3])
    m = re.fullmatch(r'(\d+)/(\d+)', s)
    if m:
        return int(m[1]) / int(m[2])
    try:
        return float(s)
    except ValueError:
        return None


def fr(x, d=1):
    """Nombre à la française : 1 234,5."""
    if x is None:
        return ''
    s = f'{x:,.{d}f}' if abs(x - round(x)) > 1e-9 or d == 0 else f'{round(x):,}'
    if d and '.' in s:
        s = s.rstrip('0').rstrip('.')
    return s.replace(',', ' ').replace('.', ',')


def gal(v):
    return f'{fr(v)} gal US ({fr(v * 3.785411784, 0)} L)'


def litres(v):
    return f'{fr(v)} L ({fr(v / 3.785411784)} gal US)'


def psi(v):
    return f'{fr(v, 0)} psi ({fr(v * 0.0689476, 0 if v * 0.0689476 >= 10 else 1)} bar)'


def inch(v):
    return f'{fr(v, 3)} po ({fr(v * 25.4, 0)} mm)'


def hp(v):
    return f'{fr(v)} HP ({fr(v * 0.7457)} kW)'


# ---------------------------------------------------------------- lignes de liste
def rows_of(data):
    """(source, réf., n°, qté, description, titre de la source) pour chaque ligne."""
    for k, a in data['assemblies'].items():
        for r in a.get('parts', []):
            if len(r) >= 4 and isinstance(r[3], str):
                yield ('asm', k), str(r[0]), r[1] or '', r[2], r[3], a.get('title') or ''
    for d in data.get('documents', []):
        for r in d.get('parts', []) or []:
            if len(r) >= 4:
                desc = r[3] if isinstance(r[3], str) else (r[4] if len(r) > 4 and isinstance(r[4], str) else '')
                if isinstance(desc, str):
                    yield ('doc', d['id']), str(r[0]), r[1] or '', r[2] if isinstance(r[2], (int, float)) else None, desc, d.get('title') or ''


def src(kind, sid, ref=None, pn=None, sheet=None):
    s = {'type': kind, 'id': sid}
    if ref is not None:
        s['ref'] = ref
    if pn:
        s['pn'] = pn
    if sheet:
        s['sheet'] = sheet
    return s


def techdata(data, sysmap, docsys):
    out = []
    seen = set()

    def add(group, label, value, s, system=None, key=None):
        k = key or (group, label.upper(), value)
        if k in seen:
            return
        seen.add(k)
        out.append({'group': group, 'label': label, 'value': value, 'src': s, **({'system': system} if system else {})})

    for k, v in data.get('specs', []):
        add('Identification', k, v, src('spec', 'specs'))
    for k, v in data.get('weights', []):
        add('Masses', k, v, src('spec', 'weights'))
    asms = data['assemblies']

    def sys_of(s):
        return sysmap.get(s[1]) if s[0] == 'asm' else docsys.get(s[1])

    # titres d'assemblage : capacités, moteurs, vérins
    for k, a in asms.items():
        t = (a.get('title') or '').upper()
        sysk = sysmap.get(k)
        for m in re.finditer(r'(\d+(?:\.\d+)?)\s*(?:US\s*)?(GAL(?:LON)?S?|LITRES?|LITERS?)\b', t):
            v = float(m[1])
            add('Capacités', a['title'], gal(v) if m[2].startswith('GAL') else litres(v), src('asm', k, pn=a.get('pn')), sysk, key=('cap', fr(v), capkind(t)))
        if re.search(r'CYLINDER', t):
            cyl(add, a['title'], src('asm', k, pn=a.get('pn')), sysk)
        mh = re.search(r'(\d+(?:\.\d+)?)\s*HP', t)
        if mh:
            add('Moteurs et entraînements', a['title'], motor(t), src('asm', k, pn=a.get('pn')), sysk, key=('mot', a['title']))
    # lignes des listes
    for s, ref, pn, qty, desc, owner in rows_of(data):
        u = desc.upper()
        sysk = sys_of(s)
        sr = src(s[0], s[1], ref, pn)
        for m in re.finditer(r'(\d+(?:\.\d+)?)\s*(?:US\s*)?(GAL(?:LON)?S?|LITRES?|LITERS?)\b', u):
            if re.match(r'(COVER|CAP|LID|DECAL|GASKET|BRACKET|MOUNT|STRAP)', u):
                continue
            v = float(m[1])
            add('Capacités', desc, gal(v) if m[2].startswith('GAL') else litres(v), sr, sysk, key=('cap', fr(v), capkind(u)))
        if re.search(r'\bTIRE\b', u):
            mt = re.search(r'(\d+\.\d+)\s*-\s*(\d+)', u)
            if mt:
                add('Roues et pneus', desc, f'Pneu {mt[1]}-{mt[2]}', sr, sysk, key=('tire', mt[0]))
        if re.search(r'(\d+(?:\.\d+)?)\s*HP\b', u) and re.search(r'MOTOR|DRIVE|ENGINE|PUMP', u) and not re.search(r'MOUNT|PAD|BRACKET|COUPLING|GUARD|DECAL', u):
            add('Moteurs et entraînements', desc, motor(u), sr, sysk, key=('mot', u))
        mc = re.search(r'(\d+(?:\.\d+)?)\s*CC\b', u)
        if mc and re.search(r'PUMP|MOTOR', u):
            add('Hydraulique — pompes et moteurs', desc, f'{fr(float(mc[1]))} cm³/tr', sr, sysk, key=('cc', u))
        if re.search(r'PSI|\bBAR\b', u) and not re.search(r'HOSE|DECAL|LABEL', u):
            mr = re.search(r'(\d[\d,]*)\s*-\s*(\d[\d,]*)\s*PSI', u)
            mp = re.search(r'(\d[\d,]*)\s*PSI', u)
            if mr:
                a0, a1 = float(mr[1].replace(',', '')), float(mr[2].replace(',', ''))
                val = f'Plage {fr(a0, 0)} à {psi(a1)}'
            elif mp:
                val = psi(float(mp[1].replace(',', '')))
            else:
                continue
            g = 'Air — pressions et réglages' if sysk == 'air' or re.search(r'AIR|WATER', u) else 'Hydraulique — pressions et réglages'
            if re.search(r'GAUGE|TRANSDUCER|SWITCH|SENSOR', u):
                g = 'Instruments de mesure'
            add(g, desc, val, sr, sysk, key=(g, u))
        if re.search(r'\bCYLINDER\b', u) and re.search(r'X\s*\d', u) and not re.search(r'KIT|SEAL|DECAL', u):
            cyl(add, desc, sr, sysk)
        mv = re.search(r'(\d{3,4})\s*V(?:OLTS?)?\b', u)
        if mv and re.search(r'TRANSFORMER|PANEL|HEATER', u) and not re.search(r'DECAL|LABEL|KIT', u):
            add('Électricité', desc, f'{mv[1]} V', sr, sysk, key=('v', u))
        ma = re.search(r'(\d+(?:\.\d+)?)\s*AMPS?\b', u)
        if ma and re.search(r'FUSE|BREAKER|DISCONNECT', u):
            add('Électricité', desc, f'{fr(float(ma[1]))} A', sr, sysk, key=('a', u))
    order = ['Identification', 'Masses', 'Capacités', 'Moteurs et entraînements', 'Hydraulique — pompes et moteurs',
             'Hydraulique — pressions et réglages', 'Vérins', 'Air — pressions et réglages', 'Instruments de mesure',
             'Électricité', 'Roues et pneus']
    out.sort(key=lambda r: (order.index(r['group']) if r['group'] in order else 99))
    return out


def capkind(u):
    for k in ('FUEL', 'HYD', 'GREASE', 'RECEIVER', 'MANIFOLD', 'WATER', 'OIL', 'TANK'):
        if k in u:
            return k
    return u


def motor(u):
    parts = []
    m = re.search(r'(\d+(?:\.\d+)?)\s*HP', u)
    if m:
        parts.append(hp(float(m[1])))
    m = re.search(r'(\d{3,4})\s*V\b', u)
    if m:
        parts.append(f'{m[1]} V')
    m = re.search(r'(\d{2})\s*HZ', u)
    if m:
        parts.append(f'{m[1]} Hz')
    m = re.search(r'\b(\d{3}T)\b', u)
    if m:
        parts.append(f'carcasse {m[1]}')
    return ', '.join(parts)


def cyl(add, title, s, sysk):
    u = title.upper().replace('”', '"').replace('″', '"')
    mb = re.search(r'(?:Ø|BORE\s*)?\s*Ø?\s*(\d+(?:\.\d+)?(?:\s+\d+/\d+)?)\s*"?\s*(?:BORE)?\s*X\s*', u)
    ms = re.search(r'X\s*(\d+(?:\.\d+)?(?:\s*\d+/\d+)?|\d+/\d+)\s*"?\s*(?:STROKE|ST\b|LG)', u)
    if not mb or not ms:
        return
    b, st = num(mb[1]), num(ms[1].strip())
    if not b or not st:
        return
    add('Vérins', title, f'Alésage {inch(b)} · course {inch(st)}', s, sysk, key=('cyl', u))


# ---------------------------------------------------------------- entretien
GREASE = re.compile(r'GREASE (?:NIPPLE|FITTING|ZERK)|\bZERK\b|LUBE FITTING|GRAISSEUR|GREASE FITTING')
FILTER = re.compile(r'\b(FILTERS?|ELEMENTS?|STRAINER|SEPARATOR|BREATHER|CARTRIDGE)\b')
NOT_FILTER = re.compile(r'BRACKET|MOUNT|DECAL|LABEL|HOUSING|SWITCH|INDICATOR|GASKET|WELD|PLATE|SUPPORT|GUARD|TUBE|HOSE|CLAMP|SPRING|FITTING|SCREW|BOLT|NUT|WASHER|O-RING|ADAPTER|ELEMENTARY|HEATING ELEMENT|TRANSDUCER')
KIT = re.compile(r'\bKIT\b|TROUSSE')
SERVICE_KIT = re.compile(r'SEAL|SERVICE|REPAIR|SPARE|REPLACEMENT|O-RING|CONSUMABLE|REBUILD|OVERHAUL|BACK-UP|GASKET|FILTER|SHIM|BUSHING|WEAR|PARTS')
TOOL = re.compile(r'TOOL KIT|\bTOOLS?\b|WRENCH|SPANNER|PULLER|LOADING TOOL|EXTRACTOR|OUTIL')
FILL = re.compile(r'FLUID|FUEL|OIL|COOLANT|GREASE|LEVEL|FILL')
LIFE = re.compile(r'\((\d[\d ,]*)\s*m\s*/\s*(\d[\d ,]*)\s*ft[^)]*\)', re.I)


def maintenance(data, sysmap, docsys, tech):
    grease = defaultdict(lambda: {'qty': 0, 'rows': []})
    filters, kits, tools, fills = [], [], [], []
    seenf, seenk, seent = set(), set(), set()
    for s, ref, pn, qty, desc, owner in rows_of(data):
        u = desc.upper()
        sysk = sysmap.get(s[1]) if s[0] == 'asm' else docsys.get(s[1])
        sr = src(s[0], s[1], ref, pn)
        q = qty if isinstance(qty, (int, float)) else 1
        if GREASE.search(u):
            g = grease[(s[0], s[1])]
            g['qty'] += q
            g['rows'].append({'ref': ref, 'pn': pn, 'desc': desc, 'qty': qty})
        if FILTER.search(u) and not NOT_FILTER.search(u) and pn and (pn, s[1]) not in seenf:
            seenf.add((pn, s[1]))
            filters.append({'desc': desc, 'pn': pn, 'qty': qty, 'src': sr, 'system': sysk})
        if KIT.search(u) and SERVICE_KIT.search(u) and not re.search(r'DECAL|LABEL|QUICK DISCONNECT|TOOL', u) and (pn, s[1]) not in seenk:
            seenk.add((pn, s[1]))
            k = {'desc': desc, 'pn': pn, 'qty': qty, 'src': sr, 'system': sysk}
            m = LIFE.search(desc)
            if m:
                k['life'] = f"{m[1].strip()} m / {m[2].strip()} ft de forage"
            kits.append(k)
        if TOOL.search(u) and not re.search(r'DECAL|LABEL|BOX|HOLDER|BRACKET|MOUNT', u) and (pn, desc) not in seent:
            seent.add((pn, desc))
            tools.append({'desc': desc, 'pn': pn, 'qty': qty, 'src': sr, 'system': sysk})
        if re.search(r'DECAL|DECL|LABEL', u) and FILL.search(u):
            fills.append({'desc': desc, 'pn': pn, 'qty': qty, 'src': sr})
    # assemblages d'outillage (titre), assemblages de graissage centralisé
    for k, a in data['assemblies'].items():
        t = (a.get('title') or '').upper()
        if re.search(r'TOOL KIT|BREAKOUT WRENCH|^OUTIL|^EXTRACTEUR', t) or re.search(r'^Outil|^Extracteur', a.get('titleFr') or ''):
            if ('', a.get('title')) not in seent:
                seent.add(('', a.get('title')))
                tools.append({'desc': a.get('titleFr') or a.get('title'), 'pn': a.get('pn') or '', 'qty': 1, 'src': src('asm', k, pn=a.get('pn')), 'system': sysmap.get(k), 'assembly': True})
    central = []
    for k, a in data['assemblies'].items():
        t = (a.get('title') or '').upper()
        if re.search(r'CENTRALIZED GREAS|GREASE INJECTION|GREASING UNIT|GREASE LINE|INJECTOR ASSY', t):
            lines = [r for r in a.get('parts', []) if isinstance(r[3], str) and re.search(r'HOSE|TUBE|LINE', r[3].upper())]
            central.append({'id': k, 'title': a.get('titleFr') or a.get('title'), 'lines': sum(r[2] if isinstance(r[2], (int, float)) else 1 for r in lines), 'parts': len(a.get('parts', []))})
    gl = []
    for (kind, sid), g in grease.items():
        title = (data['assemblies'][sid].get('titleFr') if kind == 'asm' else next((d.get('titleFr') for d in data['documents'] if d['id'] == sid), sid))
        gl.append({'src': src(kind, sid), 'title': title, 'points': g['qty'], 'rows': g['rows'], 'system': sysmap.get(sid) if kind == 'asm' else docsys.get(sid)})
    gl.sort(key=lambda g: (-g['points'], g['src']['id']))
    caps = [t for t in tech if t['group'] == 'Capacités']
    intervals = [{'desc': k['desc'], 'pn': k['pn'], 'life': k['life'], 'src': k['src']} for k in kits if k.get('life')]
    return {'grease': gl, 'central': central, 'filters': filters, 'fluids': caps, 'fills': fills, 'kits': kits, 'tools': tools, 'intervals': intervals}


# ---------------------------------------------------------------- OCR : bulles, consignes, réglages, schémas
NOTE_KEYS = re.compile(r'\bNOTES?\b|LOCTITE|TORQUE|FT[ .-]?LBS?|LBS?[ .-]?FT|N[.·]?M\b|APPLY|SEALANT|ANTI-?SEIZE|THREAD ?LOCK|GREASE|LUBRICAT|SHIM|PRELOAD|ADJUST|TIGHTEN|REPLACEMENT KIT|SERVICE KIT|SEE PAGE|ORIENT|ALIGN|INSTALL|REMOVE|DO NOT|CAUTION|WARNING|IMPORTANT|TYP\b|BOTH SIDES|PRE-?CHARGE|NITROGEN|FILL WITH|OIL LEVEL|DRAIN')
SETTING = re.compile(r'(\d[\d,.]*)\s*(PSI|BAR|GPM|LPM|L/MIN|°F|°C|RPM|CFM|KPA)\b')
LIST_HEAD = re.compile(r'PART ?NO|ITEM ?NAME|SPARE PART')
ITEMS = re.compile(r'ITEMS?\s*((?:[#(]?\s*\d{1,3}[A-Z]?\s*\)?\s*(?:,|&|AND|TO)?\s*)+)')
# Schémas électriques en échelle : catégorie de chaque étiquette (couleur).
ELEC_CAT = [
    ('eclairage', r'LIGHT|LAMP|BEACON|HORN|ALARM|BUZZER|STROBE'),
    ('capteurs', r'SENSOR|TRANSDUCER|PROX|ENCODER|CAMERA|LEVEL|TEMP|PRESS(?:URE)? ?SW|\bTTR?\d|\bPT\d|\bLS\d'),
    ('puissance', r'BATTER|STARTER|ALTERNATOR|POWER|\bCB\d|BREAKER|FUSE|\d{3,4} ?V\b|\b(?:12|24) ?V(?:DC)?\b|CONTACTOR|\bMOT\d|MOTOR|TRANSFORMER|GROUND|\bGND\b|CHARGING'),
    ('commande', r'\bPLC|INPUT|OUTPUT|RELAY|\bCR\d|SWITCH|\bSS\d|BUTTON|JOYSTICK|\bCAN\b|CONTROL|E-?STOP|SOLENOID|\bSOL\d|VALVE|COIL'),
]
XREF = re.compile(r'^[+Y]?\s*(?:TO|FROM|FO|F0|T0)\s*(\d{3})$')
RUNG = re.compile(r'^\d{3}$')


def ocr_load(paths):
    pages = {}
    for p in paths:
        with (gzip.open(p, 'rt') if p.endswith('.gz') else open(p)) as f:
            for line in f:
                try:
                    d = json.loads(line)
                except json.JSONDecodeError:
                    continue
                pages[d['sheet']] = d
    return pages


def sheet_owner(data):
    own = {}
    for k, a in data['assemblies'].items():
        for s in [k] + list(a.get('sheets') or []) + list(a.get('lists') or []):
            own.setdefault(s, ('asm', k))
    for d in data.get('documents', []):
        for s in d.get('sheets', []):
            own.setdefault(s, ('doc', d['id']))
    return own


def refs_of(data, kind, sid):
    if kind == 'asm':
        parts = data['assemblies'][sid].get('parts', [])
    else:
        parts = next((d.get('parts') or [] for d in data['documents'] if d['id'] == sid), [])
    return {str(r[0]).strip('*#') for r in parts}


def is_list_page(p):
    """Page de liste (en-tête « Part No. », « Item name »…) : pas de dessin à lire."""
    return sum(1 for l in p.get('lines', []) if l[2] < 0.14 and LIST_HEAD.search(l[0].upper())) >= 2


def hotspots(data, pages, own):
    out = {}
    for s, p in pages.items():
        o = own.get(s)
        if not o:
            continue
        refs = refs_of(data, *o)
        keep = []
        for t, x, y, r, conf in p.get('bubbles', []):
            t = t.strip('.')
            cand = t if t in refs else None
            if not cand and conf >= 0.6:
                # confusions fréquentes des chiffres CAO (1↔4, 1↔7) sur un seul caractère
                for a, b in (('4', '1'), ('7', '1'), ('1', '4'), ('1', '7')):
                    for i, ch in enumerate(t):
                        if ch == a and (t[:i] + b + t[i + 1:]) in refs:
                            cand = t[:i] + b + t[i + 1:]
                            break
                    if cand:
                        break
            if cand and (conf >= 0.45 or t == cand):
                keep.append([cand, round(x, 4), round(y, 4), round(r, 4)])
        if keep:
            out[s] = keep
    return out


def blocks(lines):
    """Regroupe les lignes OCR proches (même colonne, interligne serré) en blocs."""
    ls = sorted(lines, key=lambda l: (l[2], l[1]))
    used = [False] * len(ls)
    out = []
    for i, l in enumerate(ls):
        if used[i]:
            continue
        used[i] = True
        blk = [l]
        changed = True
        while changed:
            changed = False
            for j, m in enumerate(ls):
                if used[j]:
                    continue
                last = blk[-1]
                h = max(last[4], m[4])
                if 0 <= m[2] - (last[2] + last[4]) <= h * 1.7 and abs(m[1] - blk[0][1]) <= 0.03:
                    blk.append(m)
                    used[j] = True
                    changed = True
        out.append(blk)
    return out


def bbox(ls):
    x0 = min(l[1] for l in ls); y0 = min(l[2] for l in ls)
    x1 = max(l[1] + l[3] for l in ls); y1 = max(l[2] + l[4] for l in ls)
    return [round(x0, 4), round(y0, 4), round(x1 - x0, 4), round(y1 - y0, 4)]


def oid(s, box):
    """Identifiant stable d'un texte lu : planche et coin du cadre (‰)."""
    return f'{s}-{round(box[0] * 1000):03d}-{round(box[1] * 1000):03d}'


def note_kind(u):
    return ('couple' if re.search(r'TORQUE|FT[ .*-]?LB|LB[S]?[ .*-]?FT|IN[ .*-]?LB|N[.·]?M\b', u) else
            'freinage' if re.search(r'LOCTITE|SEALANT|THREAD ?LOCK|ANTI-?SEIZE|LIQUID SEAL', u) else
            'graissage' if re.search(r'GREASE|LUBRICAT|OIL', u) else
            'reglage' if re.search(r'SHIM|PRELOAD|ADJUST|ALIGN|ORIENT|PRE-?CHARGE|NITROGEN', u) else
            'trousse' if re.search(r'KIT', u) else 'note')


def elec_sheet(p):
    """Schéma électrique en échelle : titre du cartouche, échelons, renvois, étiquettes classées."""
    lines = p.get('lines', [])
    cand = [l for l in lines if l[1] < 0.08 and RUNG.match(l[0].strip())]
    if len(cand) < 5:
        return None
    # numéros d'échelons : la colonne la plus fournie, puis la plus longue suite continue
    xs = sorted(l[1] for l in cand)
    xm = xs[len(xs) // 2]
    nums = sorted({int(l[0]) for l in cand if abs(l[1] - xm) < 0.012})
    runs, cur = [], []
    for n in nums:
        if cur and n - cur[-1] > 2:
            runs.append(cur)
            cur = []
        cur.append(n)
    runs.append(cur)
    rungs = max(runs, key=len)
    if len(rungs) < 5:
        return None
    ys = {int(l[0]): l[2] + l[4] / 2 for l in cand if abs(l[1] - xm) < 0.012}
    ry = [round(ys[rungs[0]], 4), round(ys[rungs[-1]], 4)]
    title = ''
    t = next((l for l in lines if re.match(r'^TITLE:?$', l[0].strip().upper())), None)
    if t:
        ls = [l for l in lines if t[2] + 0.004 < l[2] < t[2] + 0.06 and t[1] - 0.02 < l[1] < t[1] + 0.25
              and not re.search(r'DRAWING|CHECKED|APPROVED|APPRVED|SHEET', l[0].upper())]
        title = ' '.join(l[0] for l in sorted(ls, key=lambda l: (round(l[2], 2), l[1])))
        title = re.sub(r'^ELECTRICAL\s*S(?:CHEMATIC)?\s*(?:SCHEMATIC)?\s*', '', title.strip(), flags=re.I)
    marks, xrefs = [], []
    for l in lines:
        if l[2] > 0.83:  # cartouche
            continue
        u = l[0].upper().strip()
        box = [round(l[1], 4), round(l[2], 4), round(l[3], 4), round(l[4], 4)]
        m = XREF.match(u)
        if m:
            xrefs.append([int(m[1]), *box])
            continue
        if len(re.sub(r'[^A-Z]', '', u)) < 2:
            continue
        cat = next((c for c, pat in ELEC_CAT if re.search(pat, u)), None)
        if cat:
            marks.append([cat, *box])
    return {'title': title, 'rungs': [rungs[0], rungs[-1]], 'ry': ry, 'marks': marks, 'xrefs': xrefs}


def ocr_texts(data, pages, own, sysmap, docsys):
    """Consignes (notes des dessins), réglages lus et schémas électriques."""
    notes, settings, schem = [], [], {}
    catalogue = data['document'].get('kind') == 'catalogue'
    fam = {d: s for d, s in docsys.items() if s in ('electricite', 'hydraulique', 'air')}
    for s, p in sorted(pages.items()):
        o = own.get(s)
        if not o or is_list_page(p):
            continue
        sysk = sysmap.get(o[1]) if o[0] == 'asm' else docsys.get(o[1])
        if o[0] == 'doc' and o[1] in fam:
            e = elec_sheet(p) if fam[o[1]] == 'electricite' else None
            if e:
                schem[s] = {'fam': 'electricite', 'doc': o[1], **e}
                continue
            if fam[o[1]] != 'electricite':
                schem[s] = {'fam': fam[o[1]], 'doc': o[1]}
        lines = [l for l in p.get('lines', []) if 0.09 < l[2] < 0.93 and len(l[0]) > 1]  # sans cartouche
        for blk in blocks(lines):
            text = ' '.join(l[0] for l in blk)
            u = text.upper()
            box = bbox(blk)
            pns = len(re.findall(r'\b(?:\d{6,}|C[XPM]\d{4,}[-\w]*)\b', u))
            note = NOTE_KEYS.search(u) and len(text) >= 12 and o[0] == 'asm' and pns < 3  # pas un groupe d'étiquettes de pièces
            if catalogue:
                note = note and re.search(r'\bNOTE|IMPORTANT|CAUTION|WARNING', u)
            if note:
                notes.append({'id': oid(s, box), 'src': src(o[0], o[1], sheet=s), 'system': sysk, 'kind': note_kind(u), 'en': text, 'box': box})
            elif SETTING.search(u) and pns < 3:
                settings.append({'id': oid(s, box), 'src': src(o[0], o[1], sheet=s), 'system': sysk, 'en': text, 'box': box})
    return notes, settings, schem


# ---------------------------------------------------------------- relecture (textes vérifiés sur les planches)
UNITS = {
    'psi': ('bar', 0.0689476), 'bar': ('psi', 14.5038), 'gpm': ('L/min', 3.785411784), 'L/min': ('gpm', 0.264172),
    'lbf·ft': ('N·m', 1.3558179), 'lbf·in': ('N·m', 0.1129848), 'N·m': ('lbf·ft', 0.7375621), 'cfm': ('m³/min', 0.0283168),
    'gal': ('L', 3.785411784), 'L': ('gal US', 0.264172), 'in': ('mm', 25.4), 'mm': ('po', 0.0393701),
}
UNIT_FR = {'lbf·in': 'lbf·po', 'in': 'po', 'gal': 'gal US'}


def qty(v, unit, printed=None):
    """« 30 à 35 lbf·ft (41 à 47 N·m) », « 180 °F (82 °C) ». La valeur du dessin est
    écrite telle quelle ; l'équivalent est arrondi, sauf s'il est lui aussi imprimé
    (printed), car le calcul peut différer d'un arrondi."""
    lo, hi = (v, None) if not isinstance(v, (list, tuple)) else (v[0], v[1] if len(v) > 1 else None)
    rng = lambda a, b, d: fr(a, d) if b is None else f'{fr(a, d)} à {fr(b, d)}'
    dec = lambda a, b=None: (lambda m: 0 if m >= 10 else 1 if m >= 1 else 2)(max(abs(a or 0), abs(b or 0)))
    name = UNIT_FR.get(unit, unit)
    src = rng(lo, hi, 3)
    if unit in ('°F', '°C'):
        f = (lambda x: (x - 32) / 1.8) if unit == '°F' else (lambda x: x * 1.8 + 32)
        other = '°C' if unit == '°F' else '°F'
        return f'{src} {unit} ({rng(f(lo), None if hi is None else f(hi), 0)} {other})'
    if unit in UNITS:
        u2, k = UNITS[unit]
        if printed:
            return f'{src} {name} ({rng(*printed, 3)} {u2})'
        a, b = lo * k, None if hi is None else hi * k
        return f'{src} {name} ({rng(a, b, dec(a, b))} {u2})'
    return f'{src} {name}'


def printed_metric(text):
    """Couples imprimés avec leur équivalent : « 30-35 FT-LBS/41-47 Nm » → {(30, 35): (41, 47)}."""
    out = {}
    n = r'(\d+(?:[.,]\d+)?)(?:\s*-\s*(\d+(?:[.,]\d+)?))?'
    for m in re.finditer(n + r'\s*(?:FT|IN|LBS?)[\s*.·-]*(?:LBS?|FT|IN)?\s*[/(\[]?\s*' + n + r'\s*N[\s.·]?M\b', text.upper()):
        f = lambda x: None if x is None else float(x.replace(',', '.'))
        out[(f(m[1]), f(m[2]))] = (f(m[3]), f(m[4]))
    return out


PAIRS = {('mm', 'in'), ('in', 'mm'), ('psi', 'bar'), ('bar', 'psi'), ('gpm', 'L/min'), ('L/min', 'gpm'), ('gal', 'L'), ('L', 'gal')}


def values_of(vals):
    """(désignation, valeurs, unité, équivalent imprimé) : une même grandeur donnée
    dans deux unités sur le dessin (« 16mm/0.625" ») n'en fait qu'une."""
    out, skip = [], set()
    for i, t in enumerate(vals):
        if i in skip:
            continue
        v = [t['min']] + ([t['max']] if t.get('max') not in (None, t['min']) else [])
        printed = None
        for j in range(i + 1, len(vals)):
            u = vals[j]
            if j not in skip and u['what'] == t['what'] and (t['unit'], u['unit']) in PAIRS:
                printed = (u['min'], u.get('max') if u.get('max') not in (None, u['min']) else None)
                skip.add(j)
                break
        out.append((t['what'], v, t['unit'], printed))
    return out


def load_review(eid):
    try:
        with open(f'tools/atelier/{eid}.json') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def apply_review(eid, data, notes, settings, schem, tech):
    """Textes relus sur les planches (tools/atelier/<id>.json) : transcription exacte,
    traduction, couples et valeurs ; les lectures écartées disparaissent."""
    rv = load_review(eid)
    rn, rs, rt = rv.get('notes', {}), rv.get('settings', {}), rv.get('titles', {})
    flat = lambda t: re.sub(r'[^A-Z0-9]', '', t.upper())
    # Morceaux d'une note écartés parce que la relecture a réuni le texte entier sur un
    # seul identifiant : leur cadre rejoint celui de la note gardée (extrait complet).
    dropped = [n for n in notes if (rn.get(n['id']) or {}).get('drop')]
    out = []
    for n in notes:
        r = rn.get(n['id'])
        if r and not r.get('drop') and r.get('en'):
            full = flat(r['en'])
            for d in dropped:
                piece = flat(d['en'])
                b, c = n['box'], d['box']
                near = (max(b[1], c[1]) - min(b[1] + b[3], c[1] + c[3]) < 0.06
                        and max(b[0], c[0]) - min(b[0] + b[2], c[0] + c[2]) < 0.06)  # pas une copie ailleurs sur la planche
                if d['src']['sheet'] == n['src']['sheet'] and len(piece) >= 6 and near:
                    sm = difflib.SequenceMatcher(None, piece, full, autojunk=False)
                    if sum(b.size for b in sm.get_matching_blocks()) >= 0.8 * len(piece):
                        x0, y0 = min(n['box'][0], d['box'][0]), min(n['box'][1], d['box'][1])
                        x1 = max(n['box'][0] + n['box'][2], d['box'][0] + d['box'][2])
                        y1 = max(n['box'][1] + n['box'][3], d['box'][1] + d['box'][3])
                        n['box'] = [round(x0, 4), round(y0, 4), round(x1 - x0, 4), round(y1 - y0, 4)]
    for n in notes:
        r = rn.get(n['id']) or rs.get(n['id'])
        if r and r.get('drop'):
            continue
        if r:
            n['en'] = r.get('en', n['en'])
            n['fr'] = r.get('fr', '')
            n['kind'] = r.get('kind', n['kind'])
            pm = printed_metric(n['en'])
            for t in r.get('torques', []):
                v = [t['min']] + ([t['max']] if t.get('max') not in (None, t['min']) else [])
                key = (float(t['min']), float(t['max']) if len(v) > 1 else None)
                tech.append({'group': 'Couples de serrage relevés sur les dessins', 'label': t['item'], 'value': qty(v, t['unit'], pm.get(key)), 'printed': key in pm,
                             'src': n['src'], 'system': n['system'], 'box': n['box'], 'note': n['id']})
            for what, v, unit, printed in values_of(r.get('values', [])):
                tech.append({'group': 'Réglages relevés sur les dessins', 'label': what, 'value': qty(v, unit, printed), 'printed': bool(printed),
                             'src': n['src'], 'system': n['system'], 'box': n['box'], 'note': n['id']})
        else:
            n['ocr'] = True  # lecture automatique non relue
        refs = refs_of(data, n['src']['type'], n['src']['id'])
        items = []
        for m in ITEMS.finditer(n['en'].upper()):
            for ref in re.findall(r'\d{1,3}[A-Z]?', m[1]):
                if ref in refs and ref not in items:
                    items.append(ref)
        if items:
            n['items'] = items
        out.append(n)
    for st in settings:
        r = rs.get(st['id']) or rn.get(st['id'])
        if not r or r.get('drop'):
            continue  # un réglage n'est publié que relu
        for what, v, unit, printed in values_of(r.get('values', [])):
            tech.append({'group': 'Réglages relevés sur les dessins', 'label': what, 'value': qty(v, unit, printed), 'printed': bool(printed),
                         'src': st['src'], 'system': st['system'], 'box': st['box'], 'text': r.get('en', st['en'])})
    # une même valeur lue sur plusieurs planches identiques (schéma répété) : une seule ligne
    seen, keep = set(), []
    for t in tech:
        k = (t['group'], t['label'], t['value']) if 'box' in t else id(t)
        if k not in seen:
            seen.add(k)
            keep.append(t)
    tech[:] = keep
    for s, t in rt.items():
        if s in schem:
            schem[s]['title'] = t.get('fr') or t.get('en') or schem[s].get('title', '')
            schem[s]['titleEn'] = t.get('en', '')
    return out


# Familles de circuits : schémas hydrauliques et pneumatiques (composants de la
# liste) et électriques (étiquettes du schéma).
CIRCUITS = {
    'air': [('forage', 'Air de forage', r'DRILL AIR|DTH|BOOST|COMPRESSOR|HIGH ?PRESSURE ?AIR|RECEIVER|SYSTEM RELIEF|AFTERCOOLER|BLOWDOWN|MINE ?AIR|AIR (?:FILTER|INLET|SWIVEL)|CHECK VALVE|BYPASS'),
            ('eau', 'Eau', r'WATER|WASH|FLUSH'),
            ('huile', 'Huile et graisse', r'OIL|GREASE|LUBE|LUBRICAT'),
            ('commande', 'Commande et instruments', r'TRANSDUCER|SOLENOID|SWITCH|GAUGE|SHUT-?OFF|ON/OFF|PRESSURE|TEMP|SENSOR|VALVE')],
    'hydraulique': [('forage', 'Rotation et avance', r'ROTAT|FEED|DRILL|TOP ?DRIVE|STINGER|CENTRAL|JAW|SLIP'),
                    ('mise', 'Mise en place (glissière, mât)', r'TILT|DUMP|SWING|SHIFT|SLIDE|EXTEN|MCP|ROLL|ACTUATOR|MAST'),
                    ('porteur', 'Translation, direction, freins', r'TRAM|STEER|BRAKE|AXLE|WHEEL|OUTRIGGER|JACK|PARK|ACCUMULATOR|TRACK|PROPEL'),
                    ('carrousel', 'Carrousel et tiges', r'CAROUSEL|PIPE ARM|CLAMP|INDEX|ROD'),
                    ('retour', 'Retour, refroidissement, filtration', r'RETURN|TANK|COOLER|FILTER|DRAIN|CASE|BREATHER|STRAINER|SUCTION'),
                    ('pompe', 'Pompes et pressions', r'PUMP|RELIEF|LOAD ?SENSE|\bLS\b|PRESSURE|PSI|\bBAR\b|MOTOR')],
    'electricite': [('puissance', 'Puissance et alimentation', ''),
                    ('commande', 'Commande (entrées, sorties, relais)', ''),
                    ('capteurs', 'Capteurs', ''),
                    ('eclairage', 'Éclairage et signalisation', '')],
}


def row_circuits(data, docsys):
    """Circuit de chaque composant des listes de schémas hydrauliques et pneumatiques."""
    out = {}
    for d in data.get('documents', []):
        f = docsys.get(d['id'])
        if f not in ('hydraulique', 'air'):
            continue
        m = {}
        for r in d.get('parts') or []:
            desc = r[3] if len(r) > 3 and isinstance(r[3], str) else ''
            c = next((c for c, _, pat in CIRCUITS[f] if pat and re.search(pat, desc.upper())), None)
            if c:
                m[str(r[0])] = c
        if m:
            out[d['id']] = m
    return out


# ---------------------------------------------------------------- fichiers du site (formats de src/ui/features)
def norm_pn(pn):
    """Comme normPn (src/data/equipment.js) : majuscules, sans « * » initial ni espaces."""
    return re.sub(r'\s', '', str(pn or '').upper().lstrip('*')) if pn else ''


def is_pn_text(v):
    return bool(re.fullmatch(r'\d[\d -]{5,12}\d', str(v or '')))


def owner_rows(data, kind, sid):
    if kind == 'asm':
        return data['assemblies'][sid].get('parts', [])
    return next((d.get('parts') or [] for d in data['documents'] if d['id'] == sid), [])


def page_of(data, s):
    """Page d'une source : feuille lue, sinon page de l'assemblage ou première page du schéma."""
    if s.get('sheet'):
        return s['sheet']
    if s['type'] == 'asm':
        return data['assemblies'][s['id']].get('sheet') or s['id']
    if s['type'] == 'doc':
        return next((d['sheets'][0] for d in data['documents'] if d['id'] == s['id']), None)
    return None


def bulles_json(data, pages, own, hs):
    """Bulles des planches : par numéro de pièce normalisé (fiche.js, « Voir sur le dessin ») et par repère (clic sur la planche)."""
    by_pn, by_ref = {}, {}
    for s, items in sorted(hs.items()):
        o = own.get(s)
        W, H = pages[s].get('w') or 1, pages[s].get('h') or 1
        rows = owner_rows(data, *o) if o else []
        for ref, x, y, r in items:
            box = [round(x - r, 3), round(y - r * W / H, 3), round(2 * r, 3), round(2 * r * W / H, 3)]
            by_ref.setdefault(s, []).append([ref, *box])
            for row in rows:
                if str(row[0]).split('#')[0] != ref:
                    continue
                extra = row[4] if len(row) > 4 and isinstance(row[4], dict) else {}
                keys = {norm_pn(row[1])} | {norm_pn(v) for v in (extra.get('sizes') or {}).values() if is_pn_text(v)}
                for k in filter(None, keys):
                    lst = by_pn.setdefault(s, {}).setdefault(k, [])
                    if box not in lst:
                        lst.append(box)
    return {
        'source': 'Bulles de repère lues par OCR sur les planches du manuel (tools/ocr_pages.py), gardées seulement si le repère figure dans la liste de la planche ; tools/build_atelier.py',
        'format': "pages[feuille][numéro normalisé] = [[x, y, largeur, hauteur], …] ; reperes[feuille] = [[repère, x, y, largeur, hauteur], …] ; relatifs à l'image",
        'pages': by_pn,
        'reperes': by_ref,
    }


METRIC = re.compile(r'\b(?:L|bar|mm|kW|N·m|L/min|°C|kg|m³/min|m)\b|°C')


def split_value(value, printed=False):
    """« 34 gal US (129 L) » → {i, m, conv} ; valeur composée ou sans équivalent → {v}."""
    m = re.fullmatch(r'([^()]+?) \(([^()]+)\)', value or '')
    if not m:
        return {'v': value or '—'}
    a, b = m[1], m[2]
    if METRIC.search(b) and not METRIC.search(a):
        out = {'i': a, 'm': b, 'conv': 'm'}
    elif METRIC.search(a):
        out = {'m': a, 'i': b, 'conv': 'i'}
    else:
        return {'v': value}
    if printed:
        out.pop('conv')
    return out


DN_GROUPS = [  # (id, titre, icône, [(groupe d'origine, titre du tableau)])
    ('identification', 'Identification', 'page', [('Identification', 'Fiche de la machine'), ('Masses', 'Masses')]),
    ('capacites', 'Capacités et liquides', 'goutte', [('Capacités', 'Réservoirs et capacités'), ('_fills', 'Repères de remplissage')]),
    ('moteurs', 'Moteurs et entraînements', 'engrenage', [('Moteurs et entraînements', 'Moteurs')]),
    ('hydraulique', 'Hydraulique', 'goutte', [('Hydraulique — pompes et moteurs', 'Pompes et moteurs'), ('Hydraulique — pressions et réglages', 'Pressions et réglages des listes'), ('Vérins', 'Vérins')]),
    ('air', 'Air comprimé', 'cable', [('Air — pressions et réglages', 'Pressions et réglages des listes')]),
    ('instruments', 'Instruments de mesure', 'liste', [('Instruments de mesure', 'Manomètres, capteurs et pressostats')]),
    ('electricite', 'Électricité', 'eclair', [('Électricité', 'Tensions et protections')]),
    ('roues', 'Roues et pneus', 'structure', [('Roues et pneus', 'Pneus')]),
    ('couples', 'Couples de serrage (dessins)', 'cle', [('Couples de serrage relevés sur les dessins', 'Couples imprimés sur les dessins')]),
    ('reglages', 'Réglages relevés sur les dessins', 'engrenage', [('Réglages relevés sur les dessins', 'Valeurs imprimées sur les dessins et les schémas')]),
    ('pieces-entretien', "Pièces d'entretien", 'cle', [('_grease', 'Points de graissage'), ('_filters', 'Filtres et éléments filtrants'), ('_kits', "Trousses d'entretien et de réparation"), ('_tools', 'Outillage spécial')]),
]


def donnees_json(eid, data, tech, maint):
    catalogue = data['document'].get('kind') == 'catalogue'

    def line(t):
        ln = {'l': t['label'], **split_value(t['value'], t.get('printed'))}
        pg = page_of(data, t['src'])
        if pg:
            ln['p'] = pg
        n = []
        if t['src'].get('ref') is not None and t['src']['type'] != 'spec':
            n.append(f"réf. {t['src']['ref']}" + (f" · {t['src']['pn']}" if t['src'].get('pn') else ''))
        if t.get('text'):
            n.append(f"sur le dessin : « {t['text']} »")
        if n:
            ln['n'] = ' — '.join(n)
        return ln

    def row(x, v, n=None):
        ln = {'l': x['desc'], 'v': v or '—'}
        pg = page_of(data, x['src'])
        if pg:
            ln['p'] = pg
        if n:
            ln['n'] = n
        return ln

    special = {
        '_fills': [row(x, x['pn'], f"réf. {x['src']['ref']}") for x in maint['fills']],
        '_grease': [{'l': g['title'], 'v': f"{g['points']} graisseur{'s' if g['points'] > 1 else ''}", 'p': page_of(data, g['src']),
                     'n': ' · '.join(f"réf. {r['ref']} {r['pn']}" for r in g['rows'][:6])} for g in maint['grease']],
        '_filters': [row(x, x['pn'], f"qté {x['qty']} · réf. {x['src']['ref']}" if x['qty'] is not None else f"réf. {x['src']['ref']}") for x in maint['filters']],
        '_kits': [row(x, x['pn'], ' · '.join(filter(None, [x.get('life') and f"durée indiquée : {x['life']}", f"réf. {x['src']['ref']}" if x['src'].get('ref') is not None else None]))) for x in maint['kits']],
        '_tools': [row(x, x['pn'] or '—') for x in maint['tools']],
    }
    groupes = []
    for gid, titre, icone, tabs in DN_GROUPS:
        tableaux = []
        for g, tt in tabs:
            lignes = special[g] if g in special else [line(t) for t in tech if t['group'] == g]
            if lignes:
                tableaux.append({'titre': tt, 'lignes': lignes})
        if tableaux:
            groupes.append({'id': gid, 'titre': titre, 'icone': icone, 'tableaux': tableaux})
    # chiffres clés : masse, réservoirs hydraulique et de carburant, moteurs
    cles = []

    def key(lbl, t):
        sv = split_value(t['value'], t.get('printed'))
        val = re.sub(r'\s*\((?:C[XPM]|[A-Z]{2})\w*[-\w]*\)', '', t['value'])  # sans le n° de pièce entre parenthèses
        mh = re.search(r'(\d+(?:[.,]\d+)?)\s*HP\b', val)
        ml = re.fullmatch(r'([\d ]+)\s*lb', val.strip())
        if mh:  # « Mercedes 904, 174 HP » → 174 HP, Mercedes 904 (tuile courte)
            rest = ' · '.join(x.strip() for x in re.split(r',', val.replace(mh[0], '')) if x.strip())
            cles.append({'l': lbl, 'v': f'{mh[1]} HP', **({'s': rest} if rest else {}), **({'p': page_of(data, t['src'])} if page_of(data, t['src']) else {})})
            return
        if ml:
            lb = float(ml[1].replace(' ', ''))
            cles.append({'l': lbl, 'v': val.strip(), 's': f'{fr(lb * 0.45359237, 0)} kg', 'conv': 's'})
            return
        k = {'l': lbl, 'v': sv.get('i') or sv.get('m') or sv.get('v')}
        if 'i' in sv and 'm' in sv:
            k['s'] = sv['m'] if k['v'] == sv['i'] else sv['i']
            if sv.get('conv'):
                k['conv'] = 's' if sv['conv'] == ('m' if k['v'] == sv['i'] else 'i') else 'v'
        pg = page_of(data, t['src'])
        if pg:
            k['p'] = pg
        cles.append(k)

    if not catalogue:
        pick = lambda grp, pat: next((t for t in tech if t['group'] == grp and re.search(pat, t['label'].upper())), None)
        for lbl, grp, pat in (('Poids total', 'Masses', r'.'), ('Moteur diesel', 'Identification', r'DIESEL'),
                              ('Groupe de pompage électrique', 'Identification', r'POMPAGE'), ('Réservoir hydraulique', 'Capacités', r'HYD.*TANK|TANK.*HYD|HYDTANK'),
                              ('Réservoir de carburant', 'Capacités', r'FUEL'), ('Réservoir d\'air', 'Capacités', r'RECEIVER')):
            t = pick(grp, pat)
            if t:
                key(lbl, t)
    title = data['document'].get('title') or eid
    return {
        'equipement': eid,
        'note': (f"Valeurs relevées dans le {('catalogue' if catalogue else 'manuel de pièces')} « {title} » : titres et descriptions des listes, "
                 "et valeurs imprimées sur les dessins (lues par OCR, puis relues sur la planche). Chaque ligne cite sa page. "
                 "Quand le manuel ne donne qu'une unité, l'autre est convertie (« conv. »). Absents du manuel : cotes et jeux de montage, "
                 "couples autres que ceux imprimés sur les dessins, intervalles d'entretien."),
        'cles': cles[:6],
        'groupes': groupes,
    }


FILTRE = re.compile(r'\b(FILTERS?|ELEMENTS?|STRAINER|SEPARATOR|BREATHER)\b')


def entretien_json(eid, data, maint):
    """Points d'entretien des listes (graisseurs, éléments filtrants, reniflards, repères de remplissage),
    placés en 3D sur la pièce de leur repère (marqueur sans coordonnées)."""
    asms = data['assemblies']
    points, seen = [], set()

    def add(kind, typ, sid, ref, pn, desc, qty, titre):
        if sid not in asms or (sid, ref) in seen:
            return
        seen.add((sid, ref))
        a = asms[sid]
        pg = a.get('sheet') or sid
        points.append({
            'id': f'{kind}-{sid}-{ref}', 'type': typ, 'titre': titre,
            'lieu': f"{a.get('titleFr') or a.get('title')} : {qty if qty is not None else '?'} × {desc} (réf. {ref}{f', {pn}' if pn else ''})",
            'assemblage': sid, 'pages': [pg], 'source': f'Liste {pg}, réf. {ref}',
            'marqueurs': [{'assemblage': sid, 'repere': str(ref)}],
        })

    for g in maint['grease']:
        if g['src']['type'] != 'asm':
            continue
        for r in g['rows']:
            add('G', 'graisseur', g['src']['id'], r['ref'], r['pn'], r['desc'], r['qty'], f"Graisseur{'s' if (r['qty'] or 1) > 1 else ''}")
    for f in maint['filters']:
        u = f['desc'].upper()
        if f['src']['type'] != 'asm' or not FILTRE.search(u) or re.search(r'VALVE|DIVIDER|EXPELLANT|GAS', u):
            continue
        typ = 'reniflard' if 'BREATHER' in u else 'filtre'
        add('F', typ, f['src']['id'], f['src']['ref'], f['pn'], f['desc'], f['qty'], 'Reniflard' if typ == 'reniflard' else 'Filtre ou élément filtrant')
    for d in maint['fills']:
        if d['src']['type'] == 'asm':
            add('R', 'plaque', d['src']['id'], d['src']['ref'], d['pn'], d['desc'], d['qty'], 'Repère de remplissage (autocollant)')
    central = [c for c in maint['central']]
    return {
        'titre': f"Entretien et graissage — {data.get('name') or eid}",
        'note': ("Points tirés des listes du manuel de pièces (graisseurs, éléments filtrants, reniflards, autocollants de remplissage), "
                 "placés sur la pièce de leur repère. Le manuel de pièces ne donne ni intervalles ni lubrifiants : voir le manuel "
                 "d'utilisation et d'entretien du constructeur."),
        'points': points,
        'renvoi': {
            'texte': ('Graissage centralisé : ' + ' ; '.join(f"{c['title']} ({c['id']})" for c in central) + '.') if central else
                     "Aucun point d'entretien listé dans cet assemblage ; voir les données techniques (pièces d'entretien).",
            'pages': [c['id'] for c in central],
        },
    }


def consignes_json(data, notes):
    out = []
    for n in notes:
        if n.get('ocr') or not n.get('fr'):
            continue  # seules les consignes relues sur la planche sont publiées
        c = {'id': n['id'], 'kind': n['kind'], 'asm': n['src']['id'], 'type': n['src']['type'], 'sheet': n['src']['sheet'], 'box': n['box'], 'en': n['en'], 'fr': n['fr']}
        if n.get('items'):
            c['items'] = n['items']
        out.append(c)
    return {
        'note': ("Consignes imprimées sur les planches du manuel (couples, produits de freinage, cales, orientation, trousses…), "
                 "lues par OCR puis relues et traduites sur la planche ; tools/build_atelier.py. Le manuel de pièces ne contient pas "
                 "de procédure de réparation pas à pas."),
        'consignes': out,
    }


def schemas_json(data, schem, docsys):
    catalogue = data['document'].get('kind') == 'catalogue'
    return {
        'note': ("Schémas du manuel en couleur par circuit : composants des schémas hydrauliques et pneumatiques rangés d'après "
                 "leur description ; étiquettes des schémas électriques en échelle classées par catégorie, titre de chaque planche "
                 "(relu) et renvois d'échelons ; tools/build_atelier.py."),
        'circuits': {k: [{'id': c, 'name': n} for c, n, _ in v] for k, v in CIRCUITS.items()} if not catalogue else {},
        'documents': {d: f for d, f in docsys.items() if f in CIRCUITS} if not catalogue else {},
        'planches': schem,
        'composants': row_circuits(data, docsys) if not catalogue else {},
    }


# Systèmes fonctionnels affichés en 3D (src/ui/features/systemes3d.js) : nom, pictogramme (src/ui/icons.js), couleur.
SYS3D = {
    'general': ('Vue générale', 'cube', '#5b6b7c'), 'porteur': ('Porteur et châssis', 'roue', '#8d6e3f'),
    'moteur': ('Moteur diesel et refroidissement', 'engrenage', '#c0392b'), 'cabine': ('Cabine et poste de conduite', 'siege', '#7e57c2'),
    'hydraulique': ('Hydraulique', 'goutte', '#1e6fd9'), 'air': ('Air comprimé et eau', 'vent', '#138d90'),
    'electricite': ('Électricité et commandes', 'eclair', '#c99a06'), 'glissiere': ('Glissière et positionnement', 'glissiere', '#5f8a1f'),
    'avance': ('Avance et forage', 'foret', '#ad1457'), 'carrousel': ('Carrousel et manutention des tiges', 'carrousel', '#9c5a2e'),
    'treuil': ('Treuil de câble', 'cable', '#3949ab'), 'graissage': ('Graissage', 'burette', '#5d4037'), 'securite': ('Sécurité et extinction', 'flamme', '#e8453c'),
    'finition': ('Finition et autocollants', 'etiquette', '#00838f'), 'options': ('Options et outillage', 'cle', '#455a64'),
    'gamme': ('Gamme et repères', 'cube', '#5b6b7c'), 'carottier': ('Carottiers', 'structure', '#1e6fd9'), 'tete': ('Têtes de carottier', 'engrenage', '#c0392b'),
    'overshot': ('Overshots et outils de repêchage', 'cle', '#7e57c2'), 'emerillon': ("Émerillons d'eau", 'goutte', '#138d90'),
    'presse': ('Presse-étoupes', 'carrousel', '#8d6e3f'), 'tubage': ('Tubage et coupe', 'structure', '#5f8a1f'),
    'raccord': ('Raccords et adaptateurs', 'cle', '#c99a06'), 'trousse': ('Trousses et consommables', 'etiquette', '#ad1457'),
    'outil': ('Outils de manutention', 'cle', '#455a64'),
}


def systemes_json(data, sysmap, docsys):
    """Système fonctionnel de chaque assemblage (moteur, hydraulique, électricité…), pour la vue 3D."""
    used = set(sysmap.values())
    order = list(SYS3D)
    return {
        'note': ("Systèmes fonctionnels de la machine, d'après le titre de chaque assemblage du manuel (ou celui de son "
                 "parent) ; tools/build_atelier.py (classify)."),
        'systemes': [{'id': k, 'nom': SYS3D[k][0], 'icone': SYS3D[k][1], 'couleur': SYS3D[k][2]} for k in order if k in used],
        'assemblages': dict(sorted(sysmap.items())),
        'documents': dict(sorted(docsys.items())),
    }


def main():
    """Écrit bulles, donnees, entretien, consignes, schemas et systemes (.json) dans public/equipment/<id>/
    et la liste des fichiers produits (champ « extras » de public/equipment/index.json)."""
    eid = sys.argv[1]
    data = json.load(open(f'public/equipment/{eid}/data.json'))
    sysmap, docsys, parent = classify(data)
    if '--systemes' in sys.argv:  # seulement les systèmes (équipement dont les autres fichiers sont faits à la main)
        with open(f'public/equipment/{eid}/systemes.json', 'w') as f:
            json.dump(systemes_json(data, sysmap, docsys), f, ensure_ascii=False, separators=(',', ':'))
        print(json.dumps(['systemes']))
        return
    tech = techdata(data, sysmap, docsys)
    maint = maintenance(data, sysmap, docsys, tech)
    pages = ocr_load(sys.argv[2:]) if len(sys.argv) > 2 else {}
    own = sheet_owner(data)
    hs = hotspots(data, pages, own) if pages else {}
    notes, settings, schem = ocr_texts(data, pages, own, sysmap, docsys) if pages else ([], [], {})
    notes = apply_review(eid, data, notes, settings, schem, tech)
    files = {
        'bulles': bulles_json(data, pages, own, hs) if hs else None,
        'donnees': donnees_json(eid, data, tech, maint),
        'entretien': entretien_json(eid, data, maint),
        'consignes': consignes_json(data, notes),
        'schemas': schemas_json(data, schem, docsys),
        'systemes': systemes_json(data, sysmap, docsys),
    }
    made = []
    for name, d in files.items():
        empty = (not d or (name == 'entretien' and not d['points']) or (name == 'consignes' and not d['consignes'])
                 or (name == 'schemas' and not d['planches'] and not d['composants']))
        path = f'public/equipment/{eid}/{name}.json'
        if empty:
            continue
        with open(path, 'w') as f:
            json.dump(d, f, ensure_ascii=False, separators=(',', ':'))
        made.append(name)
    print(json.dumps(made))
    n = lambda d, k: len(d[k]) if d else 0
    print(f"{eid} : bulles {sum(len(v) for v in hs.values())} sur {len(hs)} planches, données {sum(len(t['lignes']) for g in files['donnees']['groupes'] for t in g['tableaux'])}, "
          f"entretien {n(files['entretien'], 'points')}, consignes {n(files['consignes'], 'consignes')}, planches de schémas {len(schem)}", file=sys.stderr)


if __name__ == '__main__':
    main()

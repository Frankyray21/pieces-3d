#!/usr/bin/env python3
"""
Données d'atelier d'un équipement (vue « documentation technique » du site) :
public/equipment/<id>/atelier.json, tirées uniquement du manuel de pièces.

- systèmes : chaque assemblage et chaque schéma rangé dans un système
  (hydraulique, air, électricité, moteur…) d'après son titre, ou celui de son
  parent ;
- données techniques : capacités, moteurs, pompes, pressions, vérins, pneus…
  relevées dans les titres et les descriptions des listes, et réglages lus sur
  les schémas (OCR) ;
- entretien : points de graissage, filtres et éléments, liquides et repères
  de remplissage, trousses (avec leur durée quand le manuel la donne),
  outillage spécial ;
- consignes : notes des dessins (produits de freinage, couples, cales,
  trousses de remplacement…), lues par OCR ;
- bulles : position des bulles de repère sur les planches (OCR validé par la
  liste de la planche), pour cliquer une pièce sur le dessin ;
- étiquettes des schémas, classées par circuit (couleur par circuit).

Usage :
    python3 tools/build_atelier.py <id> tools/atelier/ocr/<id>.jsonl.gz > public/equipment/<id>/atelier.json

Les fichiers OCR viennent de tools/ocr_pages.py (une ligne JSON par planche).
Les textes lus sont relus sur les planches (tools/atelier_review.py) ; la
relecture, tools/atelier/<id>.json, donne la transcription exacte, la
traduction, les couples et les valeurs. Sans OCR, seules les données des
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
                tech.append({'group': 'Couples de serrage relevés sur les dessins', 'label': t['item'], 'value': qty(v, t['unit'], pm.get(key)),
                             'src': n['src'], 'system': n['system'], 'box': n['box'], 'note': n['id']})
            for what, v, unit, printed in values_of(r.get('values', [])):
                tech.append({'group': 'Réglages relevés sur les dessins', 'label': what, 'value': qty(v, unit, printed),
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
            tech.append({'group': 'Réglages relevés sur les dessins', 'label': what, 'value': qty(v, unit, printed),
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


def main():
    eid = sys.argv[1]
    data = json.load(open(f'public/equipment/{eid}/data.json'))
    sysmap, docsys, parent = classify(data)
    catalogue = data['document'].get('kind') == 'catalogue'
    table = SYSTEMS_CAT if catalogue else SYSTEMS
    tech = techdata(data, sysmap, docsys)
    maint = maintenance(data, sysmap, docsys, tech)
    pages = ocr_load(sys.argv[2:]) if len(sys.argv) > 2 else {}
    own = sheet_owner(data)
    hs = hotspots(data, pages, own) if pages else {}
    notes, settings, schem = ocr_texts(data, pages, own, sysmap, docsys) if pages else ([], [], {})
    notes = apply_review(eid, data, notes, settings, schem, tech)
    used = set(sysmap.values()) | set(docsys.values())
    systems = []
    for k, (name, icon) in table.items():
        if k not in used:
            continue
        systems.append({'id': k, 'name': name, 'icon': icon,
                        'assemblies': [a for a, s in sysmap.items() if s == k],
                        'documents': [d for d, s in docsys.items() if s == k]})
    circuits = {k: [{'id': c, 'name': n} for c, n, _ in v] for k, v in CIRCUITS.items()} if not catalogue else {}
    out = {
        'id': eid,
        'systems': systems,
        'tech': tech,
        'maintenance': maint,
        'notes': notes,
        'hotspots': hs,
        'schematics': schem,
        'circuits': circuits,
        'rowCircuits': row_circuits(data, docsys) if not catalogue else {},
        'sources': {'ocr': bool(pages), 'pages': len(pages)},
    }
    json.dump(out, sys.stdout, ensure_ascii=False, separators=(',', ':'))


if __name__ == '__main__':
    main()

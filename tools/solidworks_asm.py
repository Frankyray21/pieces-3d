"""Extrait la géométrie d'un assemblage SolidWorks (.SLDASM, format 2015 et plus) sans SolidWorks.

Le fichier est une suite de flux compressés (deflate brut) ; trois servent ici :
  - swXmlContents/COMPINSTANCETREE : arbre des composants, pose de chaque occurrence (mètres) ;
  - FaceTessellations/Directory    : nom de chaque occurrence et identifiant de son corps ;
  - FaceTessellations/000-000-020  : facettes d'affichage de chaque corps, face par face,
    en bandes de triangles (sommets et normales en float32, repère de la pièce, mètres).

Usage : python tools/solidworks_asm.py assemblage.SLDASM sortie.json
Sortie : { "name", "bbox", "bodies": { nom: { "v", "n", "t" } }, "instances": [ { "path", "body", "matrix" } ] }
(matrix : 4 × 4 en lignes, repère de l'assemblage, à appliquer en colonne : p' = M · p).
Seule la bibliothèque standard de Python est utilisée.
"""
import json
import re
import struct
import sys
import xml.etree.ElementTree as ET
import zlib

MARK = bytes.fromhex('140006000800')
NS = '{http://www.solidworks.com/sw2003/schema}'


def streams(data):
    """Flux du fichier : { nom: octets } (le dernier flux d'un nom l'emporte)."""
    out = {}
    pos = 0
    while True:
        i = data.find(MARK, pos)
        if i < 0:
            return out
        _, _, csize, usize, nlen = struct.unpack_from('<5I', data, i + 6)
        start = i + 26 + nlen
        pos = i + 6
        if nlen > 512 or start + csize > len(data):
            continue
        # Les noms sont écrits quartets inversés.
        name = bytes(((b << 4) | (b >> 4)) & 0xFF for b in data[i + 26:start]).decode('latin1')
        try:
            raw = zlib.decompress(data[start:start + csize], -15)
        except zlib.error:
            continue
        if len(raw) == usize:
            out[name] = raw
            pos = start + csize


def mul(a, b):
    return [[sum(a[i][k] * b[k][j] for k in range(4)) for j in range(4)] for i in range(4)]


def tree(xml):
    """Occurrences de pièces : [(chemin « A-1@Asm/B-1@A », matrice 4 × 4)] et nom de l'assemblage."""
    root = ET.fromstring(xml.decode('utf-8'))
    models = {m.get('id'): m for m in root.iter(NS + 'swModel')}
    top = [m for m in models.values() if m.get('swFileRef') == root.find(f'{NS}swHeader/{NS}swFile').get('id')][0]
    out = []

    def walk(model, parent, prefix):
        for r in model.findall(NS + 'swReference'):
            if r.get('swSuppressed') != 'NO':
                continue
            t = [float(x) for x in r.get('swTransform').split()]
            # SolidWorks écrit la matrice en vecteurs lignes : transposée pour p' = M · p.
            m = [[t[0], t[4], t[8], t[12]], [t[1], t[5], t[9], t[13]], [t[2], t[6], t[10], t[14]], [0, 0, 0, 1]]
            m = mul(parent, m)
            path = f"{prefix}{r.get('swName')}-{r.get('swReferenceNumber')}@{model.get('swName')}"
            child = models[r.get('swModelRef')]
            if child.findall(NS + 'swReference'):
                walk(child, m, path + '/')
            else:
                out.append((path, m))

    ident = [[float(i == j) for j in range(4)] for i in range(4)]
    walk(top, ident, '')
    return top.get('swName'), [float(x) for x in top.get('swBoundingBox').split()], out


def directory(d):
    """{ chemin de l'occurrence: identifiant (8 octets) du corps }."""
    out = {}
    for m in re.finditer(rb'\xff\xfe\xff(.)((?:[\x20-\x7e\x80-\xff][\x00-\x01])+)', d, re.S):
        n = m.group(1)[0]
        name = d[m.start() + 4:m.start() + 4 + 2 * n].decode('utf-16le')
        if '@' not in name:
            continue
        end = m.start() + 4 + 2 * n
        # Stamp (4), 8 ou 16 zéros, identifiant ; une occurrence répétée renvoie d'abord au corps déjà écrit.
        tail = d[end + 4:end + 36]
        ids = [tail[k:k + 8] for k in range(0, 32, 8)]
        out[name] = next(i for i in ids if any(i))
    return out


def bodies(d, ids):
    """Facettes de chaque corps : { identifiant: { v, n, t } }."""
    offs = sorted((d.find(i), i) for i in set(ids)) + [(len(d), None)]
    out = {}
    for (o, ident), (end, _) in zip(offs, offs[1:]):
        verts, norms, tris = [], [], []
        pos = o
        while pos < end - 32:
            es, ty, two, n = struct.unpack_from('<4I', d, pos)
            p2 = pos + 16 + 4 * n
            if (es, ty, two) != (4, 8, 2) or not 0 < n < 100000 or p2 + 16 > end:
                pos += 1
                continue
            lens = struct.unpack_from(f'<{n}i', d, pos + 16)
            es2, ty2, two2, nv = struct.unpack_from('<4I', d, p2)
            if (es2, ty2, two2) != (12, 100, 2) or nv != sum(lens) or min(lens) < 3:
                pos += 1
                continue
            v = struct.unpack_from(f'<{3 * nv}f', d, p2 + 16)
            p3 = p2 + 16 + 12 * nv
            nn = struct.unpack_from(f'<{3 * nv}f', d, p3 + 16)
            p4 = p3 + 16 + 12 * nv
            ne = struct.unpack_from('<4I', d, p4)[3]
            base = len(verts)
            verts += [v[k:k + 3] for k in range(0, 3 * nv, 3)]
            norms += [nn[k:k + 3] for k in range(0, 3 * nv, 3)]
            k = base
            for ln in lens:  # bande de triangles : le sens alterne
                for i in range(ln - 2):
                    tris.append((k + i + 1, k + i, k + i + 2) if i % 2 else (k + i, k + i + 1, k + i + 2))
                k += ln
            pos = p4 + 16 + 4 * ne
        out[ident] = {'v': verts, 'n': norms, 't': tris}
    return out


def main(src, dst):
    s = streams(open(src, 'rb').read())
    name, bbox, occ = tree(s['swXmlContents/COMPINSTANCETREE'])
    ids = directory(s['FaceTessellations/Directory'])
    tess = next(v for k, v in s.items() if k.startswith('FaceTessellations/') and not k.endswith('Directory'))
    geo = bodies(tess, ids.values())
    names = {}
    instances = []
    for path, m in occ:
        ident = ids[path]
        body = names.setdefault(ident, path.split('/')[-1].split('@')[0].rsplit('-', 1)[0])
        instances.append({'path': path, 'body': body, 'matrix': m})
    out = {'name': name, 'bbox': bbox, 'bodies': {names[i]: g for i, g in geo.items() if i in names}, 'instances': instances}
    json.dump(out, open(dst, 'w'))
    for n, g in out['bodies'].items():
        print(f"{n} : {len(g['v'])} sommets, {len(g['t'])} triangles")
    print(len(instances), 'occurrences')


if __name__ == '__main__':
    main(*sys.argv[1:3])

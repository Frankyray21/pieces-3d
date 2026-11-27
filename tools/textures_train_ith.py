#!/usr/bin/env python3
"""
Textures PBR usées du train de forage ITH (scripts/export-train-ith-unreal.mjs les demande).

Usage : python3 tools/textures_train_ith.py travaux.json dossier_de_sortie

travaux.json : liste de travaux. Deux sortes :
  - « piece » : texture propre à une pièce tournée. u autour de l'axe (raccord sans couture), v le long du
    profil. bandes = [{v0, v1, zone, y0, y1, r}] (v de 0 à 1), aretes = [v…], L = longueur développée (mm),
    C = circonférence (mm), w, h = taille de l'image.
  - « tuile » : texture répétée d'une zone (chariot, chaîne, boutons), côté = 500 mm.
Pour chaque travail, écrit <nom>_C.jpg (couleur), <nom>_N.jpg (normales OpenGL) et <nom>_ORM.jpg
(occlusion R, rugosité V, métal B, comme le glTF).

Le rendu suit les photos de chantier : peinture partie aux arêtes, sur les bouts et en longues rayures
(mâchoires, tables), acier nu gris piqué de rouille, filets graissés sombres, crasse sombre et humide
(pas de poussière claire, demande du client). Bruits périodiques (FFT) : pas de couture autour de l'axe.
"""
import json
import sys

import numpy as np
from PIL import Image

RNG = np.random.default_rng(20261127)


def bruit(h, w, echelle_v, echelle_u=None, seed=None):
    """Bruit gaussien filtré dans le domaine de Fourier, périodique, normalisé de 0 à 1.
    echelle_v / echelle_u : taille des taches en pixels le long de v et de u."""
    rng = np.random.default_rng(seed) if seed is not None else RNG
    echelle_u = echelle_v if echelle_u is None else echelle_u
    n = rng.standard_normal((h, w))
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.fftfreq(w)[None, :]
    g = np.exp(-((fy * echelle_v) ** 2 + (fx * echelle_u) ** 2) * 2 * np.pi ** 2)
    out = np.real(np.fft.ifft2(np.fft.fft2(n) * g))
    out -= out.min()
    return out / (out.max() + 1e-9)


def fbm(h, w, base, oct=4, aniso=1.0, seed=None):
    rng = np.random.default_rng(seed)
    t = np.zeros((h, w))
    a, tot = 1.0, 0.0
    e = base
    for _ in range(oct):
        t += a * bruit(h, w, e, e * aniso, seed=rng.integers(1 << 30))
        tot += a
        a *= 0.5
        e = max(1.0, e / 2.1)
    return t / tot


def lisse(x, a, b):
    t = np.clip((x - a) / (b - a + 1e-9), 0, 1)
    return t * t * (3 - 2 * t)


def srgb(c):
    return np.array(c, dtype=float) / 255.0


# Couleurs (sRGB 0-255), rugosité, métal de chaque finition.
PEINTURES = {
    'peinture-jaune': ((178, 136, 50), 0.6),
    'peinture-noire': ((30, 31, 33), 0.5),
    'fourreau': ((30, 30, 31), 0.55),
    'tete': ((40, 37, 34), 0.55),
    'anneau': ((214, 172, 30), 0.5),
    'rouge': ((165, 22, 26), 0.45),
    'chaine': ((160, 24, 26), 0.5),
}
ACIERS = {
    # couleur, rugosité, métal, part de rouille
    'acier': ((140, 135, 127), 0.42, 1.0, 0.22),
    'queue': ((120, 115, 108), 0.4, 1.0, 0.25),
    'filet': ((70, 58, 45), 0.3, 0.6, 0.1),
    'interieur': ((38, 35, 33), 0.8, 0.5, 0.2),
    'bit': ((82, 74, 66), 0.6, 0.85, 0.35),
    'casse': ((72, 60, 52), 0.72, 0.7, 0.45),
    'acier-chariot': ((150, 148, 143), 0.45, 1.0, 0.3),
    'carbure': ((132, 134, 136), 0.32, 0.8, 0.0),
}
AUTRES = {
    'plastique': ((222, 216, 200), 0.65, 0.0),
    'gaine': ((150, 150, 145), 0.8, 0.0),
    'pneu': ((26, 26, 27), 0.85, 0.0),
}
ROUILLE = [srgb((84, 48, 28)), srgb((112, 64, 34)), srgb((58, 36, 24))]
CRASSE = srgb((34, 31, 28))


def surface(zone, h, w, vpx, upx, arete, bout, seed):
    """Couleur (h, w, 3), hauteur, rugosité, métal d'une zone. vpx, upx : mm par pixel ; arete : 0 à 1 près des
    arêtes ; bout : 0 à 1 près des bouts de la pièce."""
    rng = np.random.default_rng(seed)
    mm = lambda x, axe='v': max(1.0, x / (vpx if axe == 'v' else upx))
    taches = fbm(h, w, mm(40), 4, seed=rng.integers(1 << 30))
    fines = bruit(h, w, mm(2), seed=rng.integers(1 << 30))
    # Rayures le long de la pièce (mâchoires, tables, slip plate) : longues en v, fines en u.
    rayures = bruit(h, w, mm(90), mm(1.2, 'u'), seed=rng.integers(1 << 30))
    rayures = lisse(rayures, 0.7, 0.86)
    # Rouille : taches irrégulières, plus fortes là où ça s'use.
    rou = fbm(h, w, mm(14), 4, seed=rng.integers(1 << 30))
    rou_col = ROUILLE[0] * (1 - fines[..., None]) + ROUILLE[1] * fines[..., None]
    crasse = fbm(h, w, mm(60), 4, seed=rng.integers(1 << 30))
    haut = np.zeros((h, w))

    if zone in PEINTURES:
        col, rugo = PEINTURES[zone]
        c = srgb(col)[None, None, :] * (0.86 + 0.22 * taches[..., None])
        # Usure : peinture partie (champ d'usure + arêtes + bouts + rayures).
        usure = 0.55 * taches + 0.45 * fines + 0.75 * arete + 0.35 * bout
        lourd = {'fourreau': 0.2, 'tete': 0.32, 'peinture-noire': 0.1, 'peinture-jaune': 0.1}.get(zone, 0.05)
        nu = lisse(usure, 1.05 - lourd, 1.12 - lourd)
        nu = np.maximum(nu, rayures * (0.6 if zone in ('fourreau', 'tete') else 0.45))
        acier = srgb((104, 100, 94))[None, None, :] * (0.75 + 0.3 * fines[..., None])
        rr = lisse(rou, 0.6, 0.75) * (0.4 + 0.6 * nu)
        acier = acier * (1 - rr[..., None]) + rou_col * rr[..., None]
        couleur = c * (1 - nu[..., None]) + acier * nu[..., None]
        r = rugo * (1 - nu) + (0.48 + 0.35 * rr) * nu
        met = nu * (1 - rr)
        haut = 0.6 * (1 - nu) + 0.08 * fines
    elif zone in ACIERS:
        col, rugo, metal, part = ACIERS[zone]
        c = srgb(col)[None, None, :] * (0.82 + 0.3 * taches[..., None])
        # Acier usiné : stries fines autour de l'axe (tournage) et rayures le long.
        stries = bruit(h, w, mm(0.6), mm(25, 'u'), seed=rng.integers(1 << 30))
        c = c * (0.92 + 0.12 * stries[..., None]) * (1 + 0.15 * rayures[..., None])
        rr = lisse(rou * (0.75 + 0.5 * fines), 0.78 - part * 0.45, 0.95 - part * 0.4) * (0.7 + 0.3 * arete + 0.3 * bout)
        rr = np.clip(rr, 0, 1)
        couleur = c * (1 - rr[..., None]) + rou_col * rr[..., None]
        r = np.clip(rugo + 0.15 * (taches - 0.5) + 0.35 * rr - 0.1 * rayures, 0.05, 1)
        met = metal * (1 - rr)
        haut = 0.12 * stries + 0.3 * rr * fines - 0.2 * rayures
        if zone == 'filet':
            # Graisse à filets : brillante, sombre, en coulures.
            gr = lisse(fbm(h, w, mm(8), 3, seed=rng.integers(1 << 30)), 0.35, 0.6)
            couleur = couleur * (1 - 0.5 * gr[..., None]) + srgb((40, 33, 25)) * 0.5 * gr[..., None]
            r = r * (1 - 0.6 * gr) + 0.12 * gr
    else:
        col, rugo, metal = AUTRES[zone]
        c = srgb(col)[None, None, :] * (0.85 + 0.25 * taches[..., None])
        couleur = c * (0.95 + 0.1 * fines[..., None])
        r = rugo + 0.1 * (fines - 0.5)
        met = np.full((h, w), metal)
        haut = 0.2 * fines
        if zone == 'gaine':
            # Gaine de poignée : usée par les mains (plus lisse et plus sombre au milieu).
            couleur *= 0.9 + 0.1 * taches[..., None]

    # Crasse sombre et humide (boue de roche), plus forte vers les bouts et dans les creux.
    cr = lisse(crasse * (0.8 + 0.4 * fines), 0.45 - 0.25 * bout, 0.9 - 0.2 * bout) * (0.6 if zone not in ('interieur',) else 0.2)
    couleur = couleur * (1 - cr[..., None]) + CRASSE[None, None, :] * cr[..., None]
    r = np.clip(r * (1 - 0.3 * cr) + 0.25 * cr, 0.04, 1)
    met = np.clip(met * (1 - 0.8 * cr), 0, 1)
    return couleur, haut, r, met


def normales(haut, force, wrap_v=False):
    dx = (np.roll(haut, -1, 1) - np.roll(haut, 1, 1)) * 0.5
    if wrap_v:
        dy = (np.roll(haut, -1, 0) - np.roll(haut, 1, 0)) * 0.5
    else:
        dy = np.gradient(haut, axis=0)
    nx, ny = -dx * force, dy * force
    nz = np.ones_like(haut)
    l = np.sqrt(nx * nx + ny * ny + nz * nz)
    return np.stack([nx / l, ny / l, nz / l], -1) * 0.5 + 0.5


def ecrire(nom, dossier, couleur, haut, r, met, ao, force=6.0, wrap_v=False):
    q = 90
    Image.fromarray((np.clip(couleur, 0, 1) ** (1 / 1.0) * 255).astype(np.uint8)).save(f'{dossier}/{nom}_C.jpg', quality=q)
    Image.fromarray((normales(haut, force, wrap_v) * 255).astype(np.uint8)).save(f'{dossier}/{nom}_N.jpg', quality=q)
    orm = np.stack([ao, r, met], -1)
    Image.fromarray((np.clip(orm, 0, 1) * 255).astype(np.uint8)).save(f'{dossier}/{nom}_ORM.jpg', quality=q)


def piece(t, dossier, seed):
    h, w = t['h'], t['w']
    vpx = t['L'] / h
    upx = t['C'] / w
    v = (np.arange(h) + 0.5) / h
    # Arêtes et bouts, par ligne.
    ar = np.zeros(h)
    for a in t['aretes']:
        ar = np.maximum(ar, np.exp(-np.abs(v - a) * t['L'] / 5.0))
    # Bout : proximité du haut et du bas de la pièce (y), par bande.
    ymin, ymax = t['ymin'], t['ymax']
    yrow = np.zeros(h)
    zone_row = np.empty(h, dtype=object)
    for b in t['bandes']:
        m = (v >= b['v0']) & (v <= b['v1'] + 1e-9)
        if b['v1'] > b['v0']:
            f = (v[m] - b['v0']) / (b['v1'] - b['v0'])
            yrow[m] = b['y0'] + (b['y1'] - b['y0']) * f
        zone_row[m] = b['zone']
    zone_row[zone_row == None] = t['bandes'][-1]['zone']  # noqa: E711
    bout = np.clip(1 - np.minimum(yrow - ymin, ymax - yrow) / 250.0, 0, 1) ** 2
    arete2 = np.repeat(ar[:, None], w, 1)
    arete2 *= 0.75 + 0.5 * bruit(h, w, 6, seed=seed + 7)  # arêtes ébréchées par endroits
    bout2 = np.repeat(bout[:, None], w, 1)
    couleur = np.zeros((h, w, 3)); haut = np.zeros((h, w)); r = np.zeros((h, w)); met = np.zeros((h, w))
    for k, z in enumerate(sorted(set(zone_row))):
        m = zone_row == z
        c, hh, rr, mm_ = surface(z, h, w, vpx, upx, arete2, bout2, seed * 31 + k)
        couleur[m], haut[m], r[m], met[m] = c[m], hh[m], rr[m], mm_[m]
    ao = 1 - 0.35 * np.repeat((np.isin(zone_row, ['interieur', 'filet']) * 1.0)[:, None], w, 1)
    ecrire(t['nom'], dossier, couleur, haut, r, met, ao)


def tuile(t, dossier, seed):
    n = t['taille']
    px = 500.0 / n
    ar = np.full((n, n), 0.25) * (0.5 + bruit(n, n, 20, seed=seed + 3))
    bt = np.full((n, n), 0.3)
    c, hh, rr, mm_ = surface(t['zone'], n, n, px, px, ar, bt, seed)
    ecrire(t['nom'], dossier, c, hh, rr, mm_, np.ones((n, n)), force=4.0, wrap_v=True)


def main():
    travaux = json.load(open(sys.argv[1]))
    dossier = sys.argv[2]
    for i, t in enumerate(travaux):
        (piece if t['type'] == 'piece' else tuile)(t, dossier, 1000 + i * 17)
        print(t['nom'], file=sys.stderr)


if __name__ == '__main__':
    main()

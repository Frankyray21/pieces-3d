// Éclairage et signalisation du porteur (formes simplifiées, sans pièce propre au
// manuel : elles appartiennent aux assemblages qui les portent). Construits face à +X
// (vers l'avant) sauf mention ; orienter avec at(…, [0, lacet, 0]).

/** Projecteur de travail à DEL : boîtier à ailettes, lentille lumineuse, étrier. */
export function workLight(S, { w = 0.12, h = 0.09 } = {}) {
  const { box, at, group } = S;
  return group(
    box(0.06, h, w, 'black', { r: 0.01 }),
    at(box(0.004, h * 0.78, w * 0.84, 'lamp'), [0.031, 0, 0]),
    ...[-1, 0, 1].map((k) => at(box(0.018, h * 0.9, 0.006, 'black'), [-0.038, 0, k * w * 0.3])),
    at(box(0.02, h * 0.55, 0.02, 'darkSteel'), [0, -h * 0.75, 0]),
    at(box(0.07, 0.012, 0.07, 'darkSteel'), [0, -h * 1.02, 0]),
  );
}

/** Gyrophare orange : socle, globe lumineux. */
export function beacon(S) {
  const { cyl, at, group } = S;
  return group(
    at(cyl(0.065, 0.03, 'black', { seg: 28 }), [0, 0.015, 0]),
    at(cyl(0.052, 0.09, 'lampAmber', { r2: 0.046, seg: 28 }), [0, 0.075, 0]),
    at(cyl(0.03, 0.012, 'lampAmber', { r2: 0.02, seg: 20 }), [0, 0.126, 0]),
  );
}

/** Feu rond (lentille de la matière donnée), boîtier noir. */
export function roundLamp(S, lens = 'lamp', r = 0.045) {
  const { cyl, at, group } = S;
  return group(
    cyl(r + 0.008, 0.06, 'black', { axis: 'x', seg: 28 }),
    at(cyl(r, 0.006, lens, { axis: 'x', seg: 28 }), [0.031, 0, 0]),
    at(cyl(r + 0.012, 0.008, 'darkSteel', { axis: 'x', seg: 28 }), [0.026, 0, 0]),
  );
}

/** Feu arrière rectangulaire (stop / feu de position). */
export function tailLamp(S, lens = 'lampRed') {
  const { box, at, group } = S;
  return group(box(0.03, 0.08, 0.15, 'black', { r: 0.008 }), at(box(0.004, 0.064, 0.134, lens), [0.016, 0, 0]));
}

/**
 * Rétroviseur : bras horizontal depuis le montant (vers ±Z selon side), tête noire,
 * miroir orienté vers l'arrière (-X).
 */
export function mirror(S, side) {
  const { box, cyl, at, group } = S;
  return group(
    at(cyl(0.012, 0.2, 'black', { axis: 'z' }), [0, 0, side * 0.1]),
    at(cyl(0.012, 0.12, 'black'), [0, -0.06, side * 0.2]),
    at(box(0.03, 0.2, 0.13, 'black', { r: 0.012 }), [0, -0.16, side * 0.24]),
    at(box(0.003, 0.18, 0.11, 'chrome'), [-0.0165, -0.16, side * 0.24]),
  );
}

/** Main courante jaune entre deux points (avec pattes de fixation). */
export function grabRail(S, a, b, standoff = [0, 0, -0.05]) {
  const { tube, box, at, group } = S;
  const foot = (p) => at(box(0.03, 0.03, Math.abs(standoff[2]) || 0.03, 'safety'), [p[0] + standoff[0] / 2, p[1] + standoff[1] / 2, p[2] + standoff[2] / 2]);
  return group(tube([a, b], 0.016, 'safety', { sharp: true, seg: 2 }), foot(a), foot(b));
}

/** Bande réfléchissante rouge et blanche (plan XY, face +Z), longueur selon X. */
export function tape(S, len, h = 0.05, seg = 0.15) {
  const { box, at, merged, group } = S;
  const n = Math.max(2, Math.round(len / seg));
  const cols = { red: [], white: [] };
  for (let i = 0; i < n; i++) {
    const w = len / n;
    const o = at(box(w, h, 0.002), [-len / 2 + w * (i + 0.5), 0, 0.001]);
    o.updateMatrixWorld(true);
    cols[i % 2 ? 'white' : 'red'].push(o);
  }
  return group(merged(cols.red, 'red'), merged(cols.white, 'white'));
}

/** Zébras jaune et noir à 45° (plan XY, face +Z), longueur selon X, rognés aux extrémités. */
export function chevrons(S, len, h = 0.1, pitch = 0.1) {
  const { box, extrude, at, merged, group } = S;
  const base = at(box(len, h, 0.002), [0, 0, 0.001]);
  base.updateMatrixWorld(true);
  const clip = (poly, x0, x1) => {
    const cut = (pts, x, keepLeft) => {
      const out = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        const ina = keepLeft ? a[0] <= x : a[0] >= x, inb = keepLeft ? b[0] <= x : b[0] >= x;
        if (ina) out.push(a);
        if (ina !== inb) { const t = (x - a[0]) / (b[0] - a[0]); out.push([x, a[1] + t * (b[1] - a[1])]); }
      }
      return out;
    };
    return cut(cut(poly, x1, true), x0, false);
  };
  const stripes = [];
  for (let x = -len / 2 - h; x < len / 2; x += pitch * 2) {
    const poly = clip([[x, -h / 2], [x + pitch, -h / 2], [x + pitch + h, h / 2], [x + h, h / 2]], -len / 2, len / 2);
    if (poly.length < 3) continue;
    const o = at(extrude(poly, 0.0012), [0, 0, 0.0028]);
    o.updateMatrixWorld(true);
    stripes.push(o);
  }
  return group(merged([base], 'safety'), merged(stripes, 'black'));
}

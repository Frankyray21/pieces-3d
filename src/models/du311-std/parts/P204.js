// P204 — Distributeur d'avance « ACCRA FEED MANIFOLD » CP000053 rév. C
// (page 204 : schéma hydraulique, six vues cotées et isométrique). Bloc en
// acier (1) 7.00 × 6.00 × 5.38 po percé des cavités de vingt et une
// cartouches vissées : séquence PPDB (2), clapet CXBA (3), limiteurs RBAP /
// RPCC (4, 5, trois 6, deux 13), réducteur de pression (14), électrovannes
// DMDA / SCGA (7, 8 et neuf 9, bobines noires à connecteur DIN), bouchons
// SAE-4 (11, quatre) et SAE-6 (12) à six-pans creux et joint torique.
// Orifices (schéma) : MA, MB, AC1, BC2, X, B en -12 ; P1 à P7, C1, C2, CD,
// LSAB1, LSAB2 en -4 / -6 ; trous de fixation lamés aux quatre coins de la
// face avant.
// Repère : origine au centre du bloc ; X le long des 7.00 po, Y le long des
// 6.00 po (vers le haut une fois monté), Z le long des 5.38 po, face −Z
// d'appui (contre la paroi arrière de P180 dans P202), face +Z avant.
// Encombrement ≈ 0.34 × 0.31 × 0.24 m (bobines comprises).

import { IN, u, L, hexPrism, orbPlug, frame } from './_slide.js';

export const MAN204 = { size: [7.0 * IN, 6.0 * IN, 5.38 * IN] };

const [HX, HY, HZ] = MAN204.size.map((v) => v / 2);
// Faces du bloc : normale, axes (a, b) dans le plan de la face, demi-épaisseur.
export const FACE204 = {
  '+z': { n: [0, 0, 1], a: [1, 0, 0], b: [0, 1, 0], d: HZ },
  '+y': { n: [0, 1, 0], a: [1, 0, 0], b: [0, 0, -1], d: HY },
  '-y': { n: [0, -1, 0], a: [1, 0, 0], b: [0, 0, 1], d: HY },
  '+x': { n: [1, 0, 0], a: [0, 0, -1], b: [0, 1, 0], d: HX },
  '-x': { n: [-1, 0, 0], a: [0, 0, 1], b: [0, 1, 0], d: HX },
};
/** Pose un objet construit le long de +Y (face d'appui à y = 0) sur une face du bloc, en (a, b) (po). */
export function onFace204(THREE, obj, f, a, b) {
  const F = FACE204[f];
  const p = F.n.map((v, i) => v * F.d + F.a[i] * a * IN + F.b[i] * b * IN);
  const ez = [F.a[1] * F.n[2] - F.a[2] * F.n[1], F.a[2] * F.n[0] - F.a[0] * F.n[2], F.a[0] * F.n[1] - F.a[1] * F.n[0]];
  return frame(THREE, obj, p, F.a, F.n, ez);
}

export default function P204(api) {
  const { THREE, S } = api;
  const { box, cyl, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const [BX, BY, BZ] = MAN204.size;
  const hy = BY / 2, hz = BZ / 2;

  const onFace = (obj, f, a, b) => onFace204(THREE, obj, f, a, b);
  const out = (f, k = 0.12) => FACE204[f].n.map((v) => v * k);

  // Cartouches (le long de +Y, face d'appui à y = 0), cotes en po.
  const relief = (big = false) => group(
    merged([
      hexPrism(S, THREE, big ? 1.25 : 1.125, 0.4, 0, 0, 'zinc'),
      L(S, [[0, 0.4], [0.5, 0.4], [0.5, 1.5], [0.46, 1.55], [0, 1.55]], 'zinc', 20),
      hexPrism(S, THREE, 0.75, 0.25, 1.55, 0.22, 'zinc'),
      L(S, [[0, 1.8], [0.22, 1.8], ...S.thread(0.22, 1.8, 2.4, { pitch: 0.06, maxTurns: 6, chamferBottom: false }), [0.2, 2.45], [0, 2.45]], 'steel', 12),
    ], 'zinc'),
    L(S, [[0, 2.2], [0.36, 2.2], [0.37, 2.25], [0.37, 2.7], [0.32, 2.75], [0, 2.75]], 'black', 14),
  );
  const check = () => merged([
    hexPrism(S, THREE, 0.875, 0.32, 0, 0, 'zinc'),
    L(S, [[0, 0.32], [0.32, 0.32], [0.32, 0.5], [0.26, 0.56], [0, 0.56]], 'zinc', 16),
  ], 'zinc');
  const solenoid = () => group(
    merged([
      hexPrism(S, THREE, 0.875, 0.35, 0, 0, 'zinc'),
      L(S, [[0, 0.35], [0.28, 0.35], [0.28, 2.6], [0, 2.6]], 'steel', 14),
      hexPrism(S, THREE, 0.5, 0.22, 2.6, 0.15, 'zinc'),
    ], 'zinc'),
    // bobine et connecteur DIN
    merged([
      L(S, [[0.3, 0.42], [0.72, 0.42], [0.76, 0.48], [0.76, 2.24], [0.72, 2.3], [0.3, 2.3], [0.3, 0.42]], 'black', 24),
      at(box(u(0.62), u(1.0), u(0.8), 'black', { r: u(0.06) }), [u(0.95), u(1.36), 0]),
      at(box(u(0.5), u(0.45), u(0.55), 'black', { r: u(0.05) }), [u(1.42), u(1.36), 0]),
    ], 'black'),
  );

  // 1 — corps : bloc aux arêtes cassées, trous de fixation lamés aux coins de la face avant,
  // orifices non équipés suggérés (lamages ronds) sur les faces latérales
  const spots = [];
  for (const [x, y] of [[-3.0, -2.5], [3.0, -2.5], [-3.0, 2.5], [3.0, 2.5]]) spots.push(at(cyl(u(0.45), u(0.02), 'darkSteel', { axis: 'z', seg: 16 }), [u(x), u(y), hz + u(0.005)]));
  for (const [x, z] of [[-2.2, 1.6], [2.4, -1.4], [0.4, 1.9]]) spots.push(at(cyl(u(0.32), u(0.02), 'darkSteel', { seg: 14 }), [u(x), -hy - u(0.005), u(z)]));
  P('1', group(at(box(BX, BY, BZ, 'steel', { r: 0.003 }), [0, 0, 0]), merged(spots, 'darkSteel')), [0, 0, 0]);

  // Cartouches et bouchons (face, a, b en po).
  const place = [
    ['2', relief(true), '+z', -1.6, 1.4], ['4', relief(), '+z', 0.0, 1.5], ['13', relief(), '+z', 1.6, 1.4], ['13', relief(), '+z', 1.6, -0.2],
    ['14', relief(), '+z', 0.0, -0.1], ['9', solenoid(), '+z', -1.7, -1.6], ['9', solenoid(), '+z', 1.6, -1.8],
    ['11', orbPlug(S, THREE, 4), '+z', -0.3, -1.9], ['11', orbPlug(S, THREE, 4), '+z', -1.7, 0.1],
    ['7', solenoid(), '+y', -2.2, 0.6], ['8', solenoid(), '+y', 2.2, 0.6], ['9', solenoid(), '+y', 0.0, -1.2],
    ['3', check(), '+y', -0.6, 1.6], ['12', orbPlug(S, THREE, 6), '+y', 0.9, 1.7],
    ['9', solenoid(), '-y', -2.0, 0.0], ['9', solenoid(), '-y', 2.0, 0.0], ['5', relief(), '-y', 0.0, -1.2], ['11', orbPlug(S, THREE, 4), '-y', 0.0, 1.5],
    ['9', solenoid(), '+x', -1.1, 1.6], ['9', solenoid(), '+x', 1.0, -1.7], ['6', relief(), '+x', 1.2, 1.3],
    ['9', solenoid(), '-x', 1.1, 1.6], ['9', solenoid(), '-x', -1.0, -1.7], ['6', relief(), '-x', -1.2, 1.4], ['6', relief(), '-x', 1.3, -0.6],
    ['11', orbPlug(S, THREE, 4), '-x', -1.6, 0.0],
  ];
  for (const [ref, obj, f, a, b] of place) P(ref, onFace(obj, f, a, b), out(f));
  return { view: { dir: [0.8, 0.7, 1.1] } };
}

// P144 — Bloc de valves de séquence CX036335 rév. 1 (page 144) : « SEQUENCE
// VALVE ». Bloc foré du circuit des bras de tige (P142), schéma de la page :
// deux valves de séquence à retour libre (SCCA), quatre clapets pilotés et un
// diviseur de débit en cartouches :
// - bloc acier zingué (4) à gradin : partie haute 3 po côté -X (cartouches),
//   partie basse 2 1/2 po côté +X, 5 × 2 1/2 po en plan, deux trous de
//   fixation traversants selon Z (vis 8 de P142), orifices SAE -06 (CGR1,
//   CGR2, CSP, CLP, CLR, PA, PB, T) dessous et sur la face -X ;
// - deux valves de séquence (1) vissées dans la face +X, vis de réglage et
//   contre-écrou ; quatre clapets pilotés (2) et le diviseur de débit (3)
//   vissés dans le dessus ;
// - bouchons ORB à six-pans creux et joint torique : un -04 (5), six -06
//   (6), six -08 noyés (7) dans les perçages de fabrication.
// Repère : origine au centre de la face inférieure, Y vers le haut, X selon
// la longueur (gradin bas et valves de séquence vers +X), Z selon la
// profondeur (face avant des bouchons vers +Z). Encombrement ≈ 0.19 (X, avec
// les valves de séquence) × 0.11 (Y) × 0.064 (Z) m.
// Cotes : filets des bouchons (liste) ; bloc et cartouches à l'échelle des
// bouchons -06 (Ø 9/16 po) sur les vues isométriques ; couples de serrage de
// la note d'installation (non représentés).
import { u, L, hex, orbPlug, place } from './_carousel.js';

const B = { x0: -2.5, x1: 2.5, step: 0.6, hHi: 3.0, hLo: 2.5, d: 2.5 };
// Orifices des raccords de P142 (po) : dessous [x, z] et face -X [y, z].
export const PORTS144 = {
  bottom: [[-1.9, -0.55], [-1.0, 0.55], [-0.1, -0.55], [0.8, 0.55], [1.7, -0.55], [1.9, 0.55]],
  endX: [[1.0, -0.6], [2.0, 0.6]],
  bolts: [[-1.55, 1.9], [1.35, 1.25]], // trous de fixation selon Z : [x, y]
  B,
};

export default function P144(api) {
  const { S } = api;
  const { group, merged, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const V = (x, y, z) => [u(x), u(y), u(z)];

  // ================================================ 4 — bloc
  const hd = B.d / 2;
  const hi = S.box(u(B.step - B.x0), u(B.hHi), u(B.d), 'zinc', { r: 0.0012, pos: V((B.x0 + B.step) / 2, B.hHi / 2, 0) });
  const lo = S.box(u(B.x1 - B.step), u(B.hLo), u(B.d), 'zinc', { r: 0.0012, pos: V((B.step + B.x1) / 2, B.hLo / 2, 0) });
  // amorces visibles des orifices (lamages sombres) et trous de fixation
  const holes = [];
  const spot = (pos, axis, r) => holes.push(L(api, [[0, 0], [r, 0], [r, 0.03], [0, 0.03]], 'darkSteel', 16, { axis, pos }));
  for (const [x, z] of PORTS144.bottom) spot(V(x, -0.025, z), 'y', 0.34);
  for (const [y, z] of PORTS144.endX) spot(V(B.x0 - 0.025, y, z), 'x', 0.34);
  for (const [x, y] of PORTS144.bolts) { spot(V(x, y, hd - 0.004), 'z', 0.2); spot(V(x, y, -hd - 0.026), 'z', 0.2); }
  // marquages gravés (repères d'orifices) : petites plages sur la face avant
  const marks = [[-1.9, 0.5], [-0.9, 0.5], [0.2, 0.5], [1.2, 0.5]].map(([x, y]) => S.box(u(0.32), u(0.08), 0.0003, 'darkSteel', { pos: V(x, y, hd + 0.005) }));
  P('4', group(merged([hi, lo], 'zinc'), merged([...holes, ...marks], 'darkSteel')), [0, -0.04, 0]);

  // ================================================ 2 — clapets pilotés (dessus de la partie haute), 3 — diviseur
  const cart = (af, h1, capR, capH) => group(merged([
    hex(api, af, h1, 0, 'steel'),
    L(api, [[0, h1], [capR, h1], [capR, h1 + capH - 0.05], [capR - 0.05, h1 + capH], [0, h1 + capH]], 'steel', 18),
  ], 'steel'), L(api, [[af * 0.48, -0.05], [af * 0.5, -0.05], [af * 0.5, 0], [af * 0.48, 0]], 'rubber', 18));
  for (const [x, z] of [[-1.95, -0.55], [-1.95, 0.55], [-0.95, -0.55], [-0.95, 0.55]]) P('2', at(cart(0.875, 0.35, 0.36, 0.3), V(x, B.hHi, z)), [0, 0.06, 0]);
  P('3', at(cart(1.0, 0.4, 0.42, 0.45), V(0.05, B.hHi, 0)), [0, 0.07, 0]);

  // ================================================ 1 — valves de séquence (face +X)
  const seq = () => group(merged([
    hex(api, 1.0, 0.45, 0, 'steel'),
    L(api, [[0, 0.45], [0.42, 0.45], [0.42, 1.2], [0.36, 1.25], [0, 1.25]], 'steel', 18),
    hex(api, 0.5625, 0.22, 1.28, 'zinc'),
    L(api, [[0, 1.25], [0.15, 1.25], [0.15, 2.0], [0.12, 2.05], [0, 2.05]], 'steel', 12),
  ], 'steel'), L(api, [[0, 1.86], [0.06, 1.86], [0.06, 2.06], [0, 2.06]], 'blackOxide', 6));
  for (const [y, z] of [[1.25, -0.6], [1.25, 0.6]]) P('1', place(api, seq(), V(B.x1, y, z), [1, 0, 0]), [0.06, 0, 0]);

  // ================================================ 5, 6, 7 — bouchons
  P('5', place(api, orbPlug(api, 4), V(-2.05, 1.0, hd), [0, 0, 1]), [0, 0, 0.05]);
  for (const [x, y, s] of [[-0.6, 2.2, 1], [0.6, 0.8, 1], [2.0, 1.6, 1], [-1.9, 1.0, -1], [0.0, 1.5, -1], [1.9, 0.9, -1]]) P('6', place(api, orbPlug(api, 6), V(x, y, s * hd), [0, 0, s]), [0, 0, s * 0.05]);
  for (const [p, d] of [[[-1.45, 0, 0], [0, -1, 0]], [[0.35, 0, 0], [0, -1, 0]], [[1.25, 0, 0], [0, -1, 0]], [[2.2, 0, -0.2], [0, -1, 0]], [[B.step, 2.75, 0], [1, 0, 0]], [[B.x0, 2.3, 0], [-1, 0, 0]]]) {
    P('7', place(api, orbPlug(api, 8, { countersunk: true }), V(...p), d), d.map((v) => v * 0.05));
  }
  return { view: { dir: [0.8, 0.7, 1] } };
}

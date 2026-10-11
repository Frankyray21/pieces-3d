// P158 — Vérin d'extension de l'avance « CYLINDER, FEED EXTENSION QXR Ø4.00
// BORE » CM77602 rév. 4 (page 158, coupe A-A). Alésage 4 po, tige Ø 2 po,
// course 54 po, entraxe rentré 69 1/4 po, pression de service 4000 psi.
// - tube (1) soudé sur le fond-bloc (dessiné avec lui) : bloc carré 4 1/2 po
//   portant l'œil de fond Ø 3 1/2 × 2 1/4 garni de sa bague (5), les deux
//   valves d'équilibrage à cartouche (17) vissées dans ses faces latérales,
//   le té (20) de l'orifice de fond avec son bouchon (14) ;
// - tube d'huile (19) Ø 1/2 du té au coude (21) de l'orifice de tête ;
// - tête (4) vissée, racleur et joints ;
// - tige chromée (2) à œil soudé garni d'une rotule (16) ;
// - piston (3) et son écrou de blocage (6) arrêté par une vis sans tête 3/8-16
//   (18, non vendue séparément). La trousse de joints (22) reste sans objet.
// Repère : origine sur l'axe de l'œil de fond ; +X le long de l'axe vers la
// tige ; Z = axes des deux œils (et des valves) ; +Y côté du tube d'huile.
// Option ext : sortie de tige (m) ; vérin rentré par défaut (entraxe 1.759 m).
// Encombrement ≈ 1.84 (X) × 0.17 (Y) × 0.21 (Z) m.
// Simulation : tige, rotule, piston, écrou et vis marqués côté tige (rodSide).

import { rodSide } from '../layout.js';
import { u, L, cbValve, zerk, along, jicElbow, hexPrism } from './_slide.js';

const X = {
  eye: 0, capA: 1.6, capB: 5.6, tubeEnd: 63.0, glandIn: 61.2, glandTop: 64.6,
  piston: [5.6, 8.1], rodEnd: 67.4, rodEye: 69.25, stroke: 54,
};
const R = { tube: 2.375, bore: 2.0, rod: 1.0, eye: 1.75, blk: 2.25 };

export const CYL158 = { retracted: u(X.rodEye), stroke: u(X.stroke), pin: u(2.0), eyeW: u(2.25), rodEyeW: u(1.75) };

export default function P158(api, opts = {}) {
  const { THREE, S } = api;
  const { lathe, extrude, merged, weldRing, group, at, box, tube, nut } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const ext = Math.max(0, Math.min(opts.ext ?? 0, u(X.stroke)));
  const Lx = (pts, mat, seg = 40) => lathe(pts.map(([r, x]) => [u(r), u(x)]), mat, { seg, axis: 'x' });
  const Lz = (pts, mat, seg = 28) => lathe(pts.map(([r, z]) => [u(r), u(z)]), mat, { seg, axis: 'z' });
  const v3 = (x, y, z = 0) => [u(x), u(y), u(z)];
  const RS = (obj) => { const g = group(obj); g.position.x = ext; return rodSide(g); };
  const eye = (cx, dir, w, foot, hole, mat) => {
    const pts = [];
    for (let i = 0; i <= 18; i++) { const a = -Math.PI / 2 + (i / 18) * Math.PI; pts.push([cx + dir * R.eye * Math.cos(a), R.eye * Math.sin(a)]); }
    pts.push(...foot);
    let area = 0;
    pts.forEach(([x0, y0], i) => { const [x1, y1] = pts[(i + 1) % pts.length]; area += x0 * y1 - x1 * y0; });
    if (area < 0) pts.reverse();
    return extrude(pts.map(([x, y]) => [u(x), u(y)]), u(w), mat, { holes: [[u(cx), 0, u(hole)]] });
  };

  // ================================================================ 1 — tube et fond-bloc (œil, bossages)
  const barrel = Lx([[R.bore, X.capB], [R.tube - 0.06, X.capB], [R.tube, X.capB + 0.06], [R.tube, X.tubeEnd - 0.05], [R.tube - 0.05, X.tubeEnd], [R.bore, X.tubeEnd], [R.bore, X.capB]], 'black', 40);
  barrel.userData.hasInterior = true;
  P('1', group(
    merged([
      barrel,
      at(box(u(X.capB - X.capA), u(2 * R.blk), u(2 * R.blk), 'black', { r: u(0.12) }), v3((X.capA + X.capB) / 2, 0)),
      eye(0, -1, 2.25, [[X.capA + 0.05, R.eye * 0.95], [X.capA + 0.05, -R.eye * 0.95]], 1.125 + 0.003, 'black'),
      at(S.cyl(u(0.55), u(0.5), 'black', { seg: 16 }), v3(X.glandIn - 1.2, R.tube + 0.2)),
    ], 'black'),
    weldRing(u(R.tube + 0.02), u(0.2), 'black', { axis: 'x', pos: v3(X.capB + 0.04, 0) }),
  ), [0, 0, 0]);
  // 5 — bague de l'œil de fond (2 × 2 1/4 × 2 1/4), graisseur
  P('5', group(Lz([[1.0, -1.125], [1.125, -1.125], [1.125, 1.125], [1.0, 1.125], [1.0, -1.125]], 'brass'), at(zerk(S, 1.0), v3(-R.eye + 0.02, 0), [0, 0, Math.PI / 2])), [-0.1, 0, 0]);

  // ================================================================ 17 — valves d'équilibrage (faces ±Z du bloc)
  for (const s of [-1, 1]) P('17', along(THREE, cbValve(S), [0, 0, s], v3(3.6, -0.4, s * R.blk)), [0, 0, s * 0.12]);
  // 20 — té de l'orifice de fond (face +Y), 14 — bouchon JIC sur sa branche libre
  const yT = R.blk;
  P('20', at(group(merged([
    hexPrism(S, THREE, 0.875, 0.35, 0, 0, 'zinc'),
    L(S, [[0, -0.5], ...S.thread(0.375, -0.5, -0.05, { pitch: 0.06, maxTurns: 4 }), [0, 0]], 'zinc', 12),
  ], 'zinc'), at(jicElbow(S, THREE, 8, { tee: true }), [0, u(0.35 + 0.4), 0])), v3(4.2, yT)), [0, 0.1, 0]);
  P('14', at(merged([hexPrism(S, THREE, 0.875, 0.6, 0, 0.2, 'zinc'), L(S, [[0, 0.6], [0.35, 0.6], [0.3, 0.7], [0, 0.7]], 'zinc', 12)], 'zinc'), v3(4.2 - 1.75, yT + 0.35 + 0.4 + 0.71), [0, 0, Math.PI / 2]), [-0.08, 0.1, 0]);
  // 21 — coude de l'orifice de tête, 19 — tube d'huile Ø 1/2 le long du tube
  P('21', at(jicElbow(S, THREE, 8), v3(X.glandIn - 1.2, R.tube + 0.45), [0, Math.PI, 0]), [0, 0.1, 0]);
  const yl = yT + 0.35 + 0.4 + 0.71;
  P('19', group(
    tube([v3(4.2 + 1.75, yl), v3(9, yl), v3(14, R.tube + 1.15), v3(X.glandIn - 6, R.tube + 1.15), v3(X.glandIn - 2.3, R.tube + 1.15)], u(0.25), 'steel', { seg: 64, tension: 0.4, radial: 10 }),
    merged([at(nut(u(0.875), u(0.5), 'zinc', { axis: 'x' }), v3(4.2 + 1.9, yl)), at(nut(u(0.875), u(0.5), 'zinc', { axis: 'x' }), v3(X.glandIn - 2.45, R.tube + 1.15))], 'zinc'),
    // colliers du tube sur le corps
    merged([20, 40].map((x) => at(box(u(0.6), u(1.3), u(0.9), 'zinc', { r: u(0.1) }), v3(x, R.tube + 0.6))), 'zinc'),
  ), [0, 0.15, 0]);

  // ================================================================ 4 — tête vissée, racleur
  P('4', group(
    Lx([[R.rod + 0.02, X.glandIn], [R.bore - 0.02, X.glandIn], ...S.thread(R.bore - 0.02, X.glandIn + 0.2, X.tubeEnd - 0.1, { pitch: 1 / 12, maxTurns: 4 }), [R.bore - 0.02, X.tubeEnd], [R.tube + 0.05, X.tubeEnd], [R.tube + 0.05, X.glandTop - 0.08], [R.tube - 0.03, X.glandTop], [R.rod + 0.3, X.glandTop], [R.rod + 0.3, X.glandTop - 0.25], [R.rod + 0.02, X.glandTop - 0.25], [R.rod + 0.02, X.glandIn]], 'black', 40),
    Lx([[R.rod + 0.005, X.glandTop - 0.25], [R.rod + 0.29, X.glandTop - 0.25], [R.rod + 0.29, X.glandTop + 0.04], [R.rod + 0.12, X.glandTop + 0.08], [R.rod + 0.005, X.glandTop + 0.04]], 'rubber', 28),
    merged([0, 1, 2, 3].map((k) => { const a = (k * Math.PI) / 2 + Math.PI / 4; return at(S.cyl(u(0.14), u(0.06), 'darkSteel', { axis: 'x', seg: 8 }), v3(X.glandTop + 0.01, Math.cos(a) * (R.tube - 0.45), Math.sin(a) * (R.tube - 0.45))); }), 'darkSteel'),
  ), [0.25, 0, 0]);

  // ================================================================ 2 — tige à œil soudé, 16 — rotule
  P('2', RS(group(
    Lx([[0, X.piston[1]], [R.rod - 0.05, X.piston[1]], [R.rod, X.piston[1] + 0.05], [R.rod, X.rodEnd - 0.1], [R.rod - 0.1, X.rodEnd], [0, X.rodEnd]], 'chrome', 32),
    Lx([[0, X.piston[0] - 1.0], ...S.thread(0.75, X.piston[0] - 1.0, X.piston[0], { pitch: 1 / 12, maxTurns: 4 }), [0.75, X.piston[1]], [0, X.piston[1]]], 'steel', 16),
    eye(X.rodEye, 1, 1.75, [[X.rodEnd - 0.05, R.rod + 0.1], [X.rodEnd - 0.05, -R.rod - 0.1]], 1.45, 'grey'),
    weldRing(u(R.rod + 0.03), u(0.18), 'grey', { axis: 'x', pos: v3(X.rodEnd - 0.03, 0) }),
  )), [0.45, 0, 0]);
  {
    const Rb = 1.32;
    const sph = Array.from({ length: 7 }, (_, i) => { const z = -0.85 + (i / 6) * 1.7; return [Math.sqrt(Rb * Rb - z * z), z]; });
    P('16', RS(at(group(
      Lz([[1.2, -0.85], [1.45, -0.85], [1.45, 0.85], [1.2, 0.85], [1.25, 0.3], [1.25, -0.3], [1.2, -0.85]], 'steel'),
      Lz([[1.0, -1.0], ...sph, [1.0, 1.0], [1.0, -1.0]], 'chrome'),
    ), v3(X.rodEye, 0))), [0.5, 0, 0.1]);
  }

  // ================================================================ 3 — piston, 6 — écrou de blocage, 18 — vis sans tête
  P('3', RS(Lx([
    [0.75, X.piston[0]], [R.bore - 0.06, X.piston[0]], [R.bore - 0.01, X.piston[0] + 0.06], [R.bore - 0.01, X.piston[0] + 0.6],
    [R.bore - 0.18, X.piston[0] + 0.6], [R.bore - 0.18, X.piston[0] + 1.9], [R.bore - 0.01, X.piston[0] + 1.9],
    [R.bore - 0.01, X.piston[1] - 0.06], [R.bore - 0.06, X.piston[1]], [0.75, X.piston[1]],
  ], 'steel', 36)), [0.15, 0.15, 0]);
  P('6', RS(at(nut(u(2.0), u(0.9), 'steel', { axis: 'x' }), v3(X.piston[0] - 0.5, 0))), [0.08, 0.15, 0]);
  P('18', RS(at(lathe([[0, -0.0095], [0.0042, -0.0095], [0.0048, -0.008], [0.0048, 0], [0.002, 0], [0.002, -0.004], [0, -0.0045]], 'blackOxide', { seg: 10 }), v3(X.piston[0] - 0.5, 0.95))), [0.08, 0.22, 0]);
  return { view: { dir: [0.3, 0.6, 1] } };
}

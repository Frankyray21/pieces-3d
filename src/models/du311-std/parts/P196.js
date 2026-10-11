// P196 — Graissage centralisé de la glissière « ASSY, CENTRALIZED GREASE -
// SLIDEOVER » CX038496 rév. 0 (pages 196 et 198 : détail A du bloc, détails B
// à J des points graissés). Bloc de graissage à dix sorties (2, CX038497)
// vissé sur la face arrière de la colonne +Z du cadre de la glissière par
// deux vis H 1/4 × 1 1/2 (7) et rondelles Nord-Lock (8) : dix graisseurs
// 1/8 NPT (1) sur la face extérieure, dix bouchons NPT 1/8 à six-pans creux
// noyés (3) sur la face intérieure, dix raccords droits à écrou tournant (6)
// sur la face arrière, d'où partent les dix flexibles de graissage L1 à L10
// (HA02554, embouts NPT droits) ; à l'autre bout, coudes 90° à écrou
// tournant (5) vissés sur les points graissés, précédés d'un coude 45° (4)
// aux détails C et H.
// Points graissés : L1 / L2 axes des œils de fond des vérins de basculement
// (détails E, F : joue extérieure des chapes de P180) ; L3 / L5 paliers de
// l'arbre de basculement (détails G, H) ; L4 / L6 axes des œils de tige des
// vérins de basculement (détails C, D : blocs bas du cadre) ; L7 à L10
// bossages des barres de glissement des plaques porte-actionneur (détails
// B, I, J ; dos des bossages).
// Repère : celui de la machine (X vers l'avant, Y vers le haut, Z à droite),
// cadre dressé, placé à l'identité par P164. Bloc derrière la colonne +Z
// (x = AC.x + G.colRear, z = G.colZ), centré à la hauteur de l'axe de
// rotation.
// Encombrement ≈ 1.0 (X) × 1.3 (Y) × 1.6 (Z) m (flexibles compris).
// Simulation : bloc, graisseurs, bouchons, raccords de départ et extrémités
// sur le cadre → « tilt » ; extrémités sur le châssis avant → « front » ;
// sur les plaques → « shift » ; flexibles déformables (flex) entre ces corps.

import { body, flex } from '../layout.js';
import { IN, u, L, AC, G, SLIDE, frame, hexPrism, hhcs, nordLock, nptPlug, grease18, g2m } from './_slide.js';

export default function P196(api) {
  const { THREE, S } = api;
  const { merged, group, at, box } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const xb = AC[0] + G.colRear, zb = G.colZ, yb = AC[1];
  const BW = 0.025, BH = 0.25, BD = 0.032; // bloc : épaisseur (X), hauteur (Y), largeur (Z)
  const outY = (i) => yb - 0.1 + i * 0.0222;

  // Raccords 1/8 NPT (le long de +Y, appui à y = 0).
  const straight = () => merged([
    L(S, [[0, -0.3], ...S.thread(0.19, -0.3, -0.02, { r1: 0.205, pitch: 0.055, maxTurns: 4 }), [0, -0.02]], 'zinc', 10),
    hexPrism(S, THREE, 0.4375, 0.22, 0, 0, 'zinc'),
    L(S, [[0, 0.22], [0.14, 0.22], [0.14, 0.32], [0, 0.32]], 'zinc', 10),
    hexPrism(S, THREE, 0.5, 0.3, 0.32, 0.12, 'zinc'),
  ], 'zinc');
  const elbow = (deg = 90) => {
    const arm = group(merged([
      L(S, [[0, 0], [0.15, 0], [0.15, 0.32], [0, 0.32]], 'zinc', 10),
      hexPrism(S, THREE, 0.5, 0.3, 0.32, 0.12, 'zinc'),
    ], 'zinc'));
    arm.rotation.z = -(deg * Math.PI) / 180;
    arm.position.y = u(0.42);
    return group(merged([
      L(S, [[0, -0.3], ...S.thread(0.19, -0.3, -0.02, { r1: 0.205, pitch: 0.055, maxTurns: 4 }), [0, -0.02]], 'zinc', 10),
      hexPrism(S, THREE, 0.4375, 0.2, 0, 0, 'zinc'),
      L(S, [[0, 0.2], [0.21, 0.2], [0.21, 0.5], [0.18, 0.56], [0, 0.56]], 'zinc', 12),
    ], 'zinc'), arm);
  };
  // pose un raccord bâti selon +Y : axe n, bras (+X local) selon a
  const pose = (obj, p, n, a) => {
    const ez = [a[1] * n[2] - a[2] * n[1], a[2] * n[0] - a[0] * n[2], a[0] * n[1] - a[1] * n[0]];
    return frame(THREE, obj, p, a, n, ez);
  };

  // ================================================================ 2 — bloc, 7 + 8 — vis
  const T = (o) => body('tilt', o);
  P('2', T(at(box(BW, BH, BD, 'zinc', { r: 0.002 }), [xb - BW / 2, yb, zb])), [-0.15, 0, 0.1]);
  for (const dy of [-0.115, 0.115]) {
    const p = [xb - BW, yb + dy, zb];
    P('8', T(pose(nordLock(S, THREE, 0.25), p, [-1, 0, 0], [0, 1, 0])), [-0.22, 0, 0.1]);
    P('7', T(pose(hhcs(S, THREE, 0.25, 1.5), [p[0] - 0.0025, p[1], p[2]], [-1, 0, 0], [0, 1, 0])), [-0.28, 0, 0.1]);
  }
  // 1 — graisseurs (face +Z), 3 — bouchons (face −Z), 6 — raccords de départ (face arrière)
  for (let i = 0; i < 10; i++) {
    const y = outY(i);
    P('1', T(pose(grease18(S, THREE), [xb - BW / 2, y, zb + BD / 2], [0, 0, 1], [1, 0, 0])), [-0.15, 0, 0.18]);
    P('3', T(pose(nptPlug(S, THREE, 2), [xb - BW / 2, y, zb - BD / 2], [0, 0, -1], [1, 0, 0])), [-0.15, 0, 0.02]);
    P('6', T(pose(straight(), [xb - BW, y, zb + 0.004 * (i % 2 ? 1 : -1)], [-1, 0, 0], [0, 1, 0])), [-0.25, 0, 0.1]);
  }

  // ================================================================ points graissés et flexibles
  // Point : position, normale sortante, corps ; chemin intermédiaire (points, corps).
  const D = SLIDE.dump, PV = SLIDE.pivot;
  const cheekOut = D.z + 1.0 * IN + 0.003 + 1.25 * IN; // face extérieure de la joue extérieure (P180)
  const back = (y, z) => g2m([G.colRear - 0.05, y, z]); // derrière le cadre
  const lines = [];
  // Faisceau : les flexibles descendent le long de la face arrière de la colonne +Z, puis
  // suivent l'arrière des blocs bas jusqu'à leur côté ; ceux du chariot longent la tôle
  // arrière à mi-hauteur et passent par sa fenêtre.
  const run = (y, z) => [back(y, z), 'tilt'];
  for (const s of [-1, 1]) {
    const zs = s > 0 ? [0.72] : [0.72, 0.2, -0.3, -0.62];
    // L1 / L2 — œils de fond des vérins de basculement (châssis avant)
    lines.push({ ref: s < 0 ? 'L1' : 'L2', i: s < 0 ? 0 : 1, p: [D.a[0], D.a[1] + 0.055, s * cheekOut], n: [0, 0, s], b: 'front',
      via: [...zs.map((z) => run(-0.42, z)), run(-0.47, s * 0.55), [[2.72, 1.02, s * 0.52], 'front'], [[2.42, 0.78, s * 0.51], 'front']] });
    // L3 / L5 — paliers de l'arbre (châssis avant)
    lines.push({ ref: s < 0 ? 'L3' : 'L5', i: s < 0 ? 2 : 4, p: [PV.x, PV.y + 0.07, s * (0.62 - 0.047)], n: [0, 0, -s], b: 'front', e45: s > 0,
      via: [...zs.map((z) => run(-0.36, z)), run(-0.46, s * 0.52), [[2.84, 1.16, s * 0.5], 'front']] });
    // L4 / L6 — œils de tige des vérins de basculement (blocs bas du cadre)
    lines.push({ ref: s < 0 ? 'L4' : 'L6', i: s < 0 ? 3 : 5, p: [D.b[0] - 0.03, D.b[1] + 0.07, s * 0.552], n: [0, 0, s], b: 'tilt', e45: s > 0,
      via: [...zs.map((z) => run(-0.28, z)), run(-0.24, s * 0.6)] });
  }
  // L7 à L10 — dos des bossages des plaques (chariot) : par la fenêtre de la tôle arrière
  for (const [ref, i, sy, s] of [['L7', 6, 1, 1], ['L8', 7, -1, 1], ['L9', 8, -1, -1], ['L10', 9, 1, -1]]) {
    const yr = 0.05 + (i - 6) * 0.015;
    const zs = s > 0 ? [0.68, 0.42] : [0.68, 0.0, -0.42];
    lines.push({ ref, i, p: g2m([G.barX - G.bossR - 0.003, sy * G.barY, s * 0.25]), n: [-1, 0, 0], b: 'shift',
      via: [...zs.map((z) => run(yr, z)), [g2m([-0.3, 0.12 * sy, s * 0.4]), ['tilt', 'shift', 0.5]], [g2m([-0.05, 0.27 * sy, s * 0.37]), 'shift']] });
  }
  for (const ln of lines) {
    const B = (o) => body(ln.b, o);
    // coude 45° éventuel puis coude 90° sur le point ; bras vers le chemin du flexible
    let tip = ln.p;
    const toward = ln.via[ln.via.length - 1][0].map((v, k) => v - ln.p[k]);
    const d = toward.map((v, k) => v - ln.n[k] * (toward[0] * ln.n[0] + toward[1] * ln.n[1] + toward[2] * ln.n[2]));
    const dl = Math.hypot(...d) || 1;
    const a = d.map((v) => v / dl);
    if (ln.e45) {
      P('4', B(pose(elbow(45), ln.p, ln.n, a)), ln.n.map((v) => v * 0.1));
      tip = ln.p.map((v, k) => v + ln.n[k] * u(0.6) + a[k] * u(0.25));
    }
    P('5', B(pose(elbow(90), tip, ln.n, a)), ln.n.map((v) => v * 0.14));
    const end = tip.map((v, k) => v + ln.n[k] * u(0.42) + a[k] * u(0.75));
    const start = [xb - BW - u(0.62), outY(ln.i), zb + 0.004 * (ln.i % 2 ? 1 : -1)];
    const pts = [start, [start[0] - 0.03, start[1] - 0.01, start[2]], ...ln.via.map(([q]) => q), end];
    const bodies = ['tilt', 'tilt', ...ln.via.map(([, b]) => b), ln.b];
    P(ln.ref, flex(S, pts, bodies, 0.0045, 'hose', { seg: 64, radial: 8 }), [-0.1, 0, 0]);
  }
  return { view: { dir: [-1, 0.6, 0.9] } };
}

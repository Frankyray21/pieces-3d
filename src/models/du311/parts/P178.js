// P178 — Vérin de glissière CX047505 (page 178) : « CYLINDER - Ø3.25 X
// 30.00 ST », alésage 3 1/4 po, course 30 po, tige Ø 1 3/4 po. Vérin soudé à
// tête vissée, dessiné rentré (coupe A-A en demi-vue, coupe B-B en bout) :
// - tube (14) : tube Ø 3 3/4 × 1/4 po, fond soudé, œil de fond Ø 3 × 1 po
//   garni d'une bague 1 1/4 × 1 1/2 × 1 po (16) ; bloc des valves soudé sur
//   le côté du tube près du fond, deux valves d'équilibrage à cartouche (19,
//   l'une sur la face avant, l'autre sur la face côté fond) ;
// - ligne d'huile (18) : deux tubes Ø 3/8 po à écrous JIC et coudes, du bloc à
//   l'orifice de la tête (vers le haut) et à l'orifice du fond (vers le bas) ;
// - tête (1) vissée dans le tube, collerette au Ø du tube ;
// - tige (12) : tige chromée Ø 1 3/4 po, queue filetée, œil de tige soudé
//   avec graisseur, rotule autoaligneuse (13, Ø 2 × alésage 1 1/4 po) ;
// - piston (6) vissé sur la queue, bague de blocage (10).
// La trousse de joints (22) reste sans objet.
// Repère : origine sur l'axe de la bague de l'œil de fond ; +X le long de
// l'axe du vérin vers la tige ; Z = axe des deux yeux (axes d'articulation
// parallèles, vue de côté du dessin prise selon Z) ; +Y vers le bloc des
// valves et le graisseur de l'œil de tige (côté gauche du dessin).
// Vérin rentré : entraxe 1.001 m (39.41 po), sorti 1.763 m.
// Encombrement ≈ 1.04 (X, de -0.038 à 1.039) × 0.144 (Y, de -0.048 à 0.097)
// × 0.13 (Z, ±0.053 au bloc, +0.11 au bout de la valve avant) m.
// Cotes : liste (alésage, course, bague 125-150-100) ; le reste relevé sur
// les coupes (≈ 103 px/po en bas de page, 160 px/po pour la tête) : tube
// Ø 3 3/4, yeux Ø 3 × 1 po, bloc des valves 2.2 × 4.0 × 4.2 po.

import { cbValve, zerk } from './P176.js';

const IN = 0.0254;
const u = (v) => v * IN;

// Cotes axiales (po), vérin rentré, depuis l'axe de l'œil de fond.
const X = {
  capFace: 2.0, // face extérieure du fond
  capIn: 2.75, // face intérieure du fond = bout du tube
  ringEnd: 3.10, // bague de blocage (10) de 2.75 à 3.10
  pistonEnd: 4.76, // piston (6) de 3.10 à 4.76
  portA: 3.0, // orifice côté fond (z = -0.4 po)
  blockA: 4.6, blockB: 8.6, // bloc des valves
  hpBot: 34.76, // dessous de la tête = pistonEnd + course
  portB: 35.0, // orifice côté tige (dans la tête)
  tubeEnd: 36.54,
  hpTop: 37.04,
  eyeBase: 37.79, // pied de l'œil de tige
  eye: 39.41, // axe de l'œil de tige
};
const STROKE = 30;
const TUBE = 1.875, BORE = 1.625, ROD = 0.875, PILOT = 0.625; // rayons (po)
const EYE = { R: 1.5, T: 1.0 };
const BLK = { y0: 1.65, y1: 3.8, z: 2.1 }; // bloc des valves (Y radial, ±Z)
const G = 0.02;

export const CYL178 = {
  pinRetracted: u(X.eye), // x de l'axe de l'œil de tige (vérin rentré)
  stroke: u(STROKE),
  pinExtended: u(X.eye + STROKE),
  bore: u(2 * 1.625),
  tubeR: u(TUBE),
  rodR: u(ROD),
  eyeR: u(EYE.R),
  eyeWidth: u(EYE.T), // épaisseur des yeux selon Z
  pinD: u(1.25), // alésage de la bague (fond) et de la rotule (tige)
  axis: 'x', // axe du vérin ; axes des yeux selon Z ; bloc des valves vers +Y
};

export default function P178(api) {
  const { S } = api;
  const { lathe, thread, extrude, weld, weldRing, merged, at, group, nut, cyl, box, tube } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const L = (pts, mat, seg = 48, opts = {}) => lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg, axis: 'x', ...opts });
  const Lz = (pts, mat, seg = 16) => lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg, axis: 'z' });
  const v3 = (x, y, z) => [u(x), u(y), u(z)];

  // Œil (plan XY, épaisseur selon Z) : demi-cercle côté libre, flancs jusqu'au pied.
  const eyeBody = (cx, dir, foot, hole) => {
    const pts = [];
    const n = 16;
    for (let i = 0; i <= n; i++) {
      const a = -Math.PI / 2 + (i / n) * Math.PI;
      pts.push([cx + dir * EYE.R * Math.cos(a), EYE.R * Math.sin(a)]);
    }
    pts.push(...foot);
    let area = 0;
    pts.forEach(([x0, y0], i) => { const [x1, y1] = pts[(i + 1) % pts.length]; area += x0 * y1 - x1 * y0; });
    if (area < 0) pts.reverse();
    return extrude(pts.map(([x, y]) => [u(x), u(y)]), u(EYE.T), 'grey', { holes: [[u(cx), 0, u(hole)]] });
  };

  // ================================================ 14 — tube soudé
  const TAP = { y0: X.tubeEnd - 1.0, y1: X.tubeEnd - 0.08 };
  const barrel = merged([
    L([
      [BORE, X.capIn], [TUBE - 0.08, X.capIn], [TUBE, X.capIn + 0.1], [TUBE, X.tubeEnd - 0.04],
      [TUBE - 0.04, X.tubeEnd], [BORE, X.tubeEnd], [BORE, X.capIn],
    ], 'grey', 20),
    L([[BORE, TAP.y0], ...thread(BORE, TAP.y0, TAP.y1, { pitch: 1 / 12, maxTurns: 4, chamferBottom: false }).reverse()], 'grey', 20),
  ], 'grey');
  barrel.userData.hasInterior = true;
  // fond : disque avec gorge de dégagement, chanfrein de soudure
  const cap = L([
    [0, X.capFace], [TUBE - 0.06, X.capFace], [TUBE, X.capFace + 0.06], [TUBE, 2.12], [1.72, 2.16], [1.72, 2.32], [TUBE, 2.36],
    [TUBE, X.capIn - 0.1], [TUBE - 0.08, X.capIn], [BORE - G, X.capIn], [0, X.capIn],
  ], 'grey', 20);
  // œil de fond (pied carré sur le fond)
  const capEye = eyeBody(0, -1, [[X.capFace + 0.01, EYE.R], [X.capFace + 0.01, -EYE.R]], 0.75 + 0.003);
  // bloc des valves : soudé sur le tube, entaillé à son rayon
  const block = box(u(X.blockB - X.blockA), u(BLK.y1 - BLK.y0), u(2 * BLK.z), 'grey', { r: u(0.06) });
  block.position.set(...v3((X.blockA + X.blockB) / 2, (BLK.y0 + BLK.y1) / 2, 0));
  // bossages des orifices (côté fond et dans la tête) sous les coudes
  const boss = (x) => at(cyl(u(0.5), u(0.5), 'grey', { seg: 16 }), v3(x, TUBE + 0.05, 0));
  P('14', group(
    merged([barrel, cap, capEye, block, boss(X.portB)], 'grey'),
    weldRing(u(TUBE - 0.02), u(0.18), 'grey', { axis: 'x', pos: v3(X.capIn + 0.03, 0, 0) }),
    weld([[X.capFace - 0.05, EYE.R + 0.04, -EYE.T / 2 - 0.04], [X.capFace - 0.05, EYE.R + 0.04, EYE.T / 2 + 0.04]].map((p) => v3(...p)), u(0.15), 'grey'),
    weld([[X.capFace - 0.05, -EYE.R - 0.04, -EYE.T / 2 - 0.04], [X.capFace - 0.05, -EYE.R - 0.04, EYE.T / 2 + 0.04]].map((p) => v3(...p)), u(0.15), 'grey'),
  ), [0, 0, 0]);

  // 16 — bague de l'œil de fond 1 1/4 × 1 1/2 × 1 po, fente de graissage
  P('16', Lz([[0.625, -0.5], [0.75, -0.5], [0.75, 0.5], [0.625, 0.5], [0.625, -0.5]], 'brass', 20), [0, 0, 0.1]);

  // ================================================ 19 — valves d'équilibrage (×2)
  const yv = 2.94;
  P('19', at(cbValve(S), v3(6.6, yv, BLK.z), [Math.PI / 2, 0, 0]), [0, 0, 0.1]);
  P('19', at(cbValve(S), v3(X.blockA, yv, 0.78), [0, 0, Math.PI / 2]), [-0.1, 0, 0]);

  // ================================================ 18 — ligne d'huile
  // Coude 90° vissé (ORB) : queue le long de +Y local, sortie JIC vers +X local.
  const elbow = () => merged([
    lathe([[0, -0.3], [0.2, -0.3], [0.2, 0], [0, 0]].map(([r, y]) => [u(r), u(y)]), 'zinc', { seg: 10 }),
    at(nut(u(0.625), u(0.22), 'zinc'), [0, u(0.11), 0]),
    at(box(u(0.62), u(0.62), u(0.62), 'zinc'), [0, u(0.53), 0]),
    at(lathe([[0, 0], [0.24, 0], [0.24, 0.55], [0.18, 0.62], [0, 0.62]].map(([r, y]) => [u(r), u(y)]), 'zinc', { seg: 10, axis: 'x' }), [u(0.3), u(0.53), 0]),
  ], 'zinc');
  // Raccord droit vissé (ORB / JIC) le long de +Y local.
  const straight = () => merged([
    lathe([[0, -0.3], [0.2, -0.3], [0.2, 0], [0, 0]].map(([r, y]) => [u(r), u(y)]), 'zinc', { seg: 10 }),
    at(nut(u(0.6875), u(0.3), 'zinc'), [0, u(0.15), 0]),
    lathe([[0, 0.3], [0.24, 0.3], [0.24, 0.75], [0.18, 0.82], [0, 0.82]].map(([r, y]) => [u(r), u(y)]), 'zinc', { seg: 10 }),
  ], 'zinc');
  const jicNut = (p, axis) => at(nut(u(0.6875), u(0.42), 'zinc', { axis }), p);
  const rt = 0.1875; // tube Ø 3/8
  // haut : raccord droit sur la face haute du bloc, tube jusqu'au coude de l'orifice de la tête
  const topFit = at(straight(), v3(X.blockB, yv, 0), [0, 0, -Math.PI / 2]); // +Y local → +X
  const headElbow = at(elbow(), v3(X.portB, TUBE + 0.3, 0), [0, Math.PI, 0]); // queue vers -Y, sortie vers -X
  const yTop = TUBE + 0.3 + 0.53;
  const upper = tube([
    v3(X.blockB + 0.82, yv, 0), v3(X.blockB + 2.5, yv, 0), v3(X.blockB + 4.5, yTop - 0.05, 0),
    v3(X.portB - 3.0, yTop, 0), v3(X.portB - 0.95, yTop, 0),
  ], u(rt), 'steel', { seg: 24, tension: 0.3, radial: 8 });
  // bas : raccord droit sur la face côté fond du bloc (vers -X), tube cintré
  // jusqu'au raccord droit de l'orifice du fond (radial, vers +Y)
  const botFit = at(straight(), v3(X.blockA, yv, -0.4), [0, 0, Math.PI / 2]); // +Y local → -X
  const ys = Math.sqrt(TUBE * TUBE - 0.16) + 0.03;
  const portFit = at(merged([
    lathe([[0, -0.3], [0.2, -0.3], [0.2, 0], [0, 0]].map(([r, y]) => [u(r), u(y)]), 'zinc', { seg: 10 }),
    at(nut(u(0.6875), u(0.25), 'zinc'), [0, u(0.125), 0]),
    lathe([[0, 0.25], [0.24, 0.25], [0.24, 0.56], [0.18, 0.62], [0, 0.62]].map(([r, y]) => [u(r), u(y)]), 'zinc', { seg: 10 }),
  ], 'zinc'), v3(X.portA, ys, -0.4));
  const lower = tube([
    v3(X.blockA - 0.82, yv, -0.4), v3(X.blockA - 1.15, yv, -0.4), v3(X.portA + 0.12, yv - 0.15, -0.4), v3(X.portA, ys + 0.62, -0.4),
  ], u(rt), 'steel', { seg: 16, tension: 0.4, radial: 8 });
  P('18', group(
    merged([topFit, headElbow, botFit, portFit,
      jicNut(v3(X.blockA - 0.98, yv, -0.4), 'x'), jicNut(v3(X.portA, ys + 0.83, -0.4), 'y'),
      jicNut(v3(X.blockB + 1.1, yv, 0), 'x'), jicNut(v3(X.portB - 1.1, yTop, 0), 'x'),
    ], 'zinc'),
    upper, lower,
  ), [0, 0.08, 0]);

  // ================================================ 1 — tête vissée
  P('1', group(
    L([
      [ROD + G, X.hpBot + 0.06], [ROD + 0.08, X.hpBot], [BORE - 0.04, X.hpBot], [BORE - G, X.hpBot + 0.04],
      [BORE - G, X.hpBot + 0.5], [BORE - 0.1, X.hpBot + 0.5], [BORE - 0.1, X.hpBot + 0.66], [BORE - G, X.hpBot + 0.66],
      ...thread(BORE - G, TAP.y0, TAP.y1, { pitch: 1 / 12, maxTurns: 4 }),
      [BORE - G, X.tubeEnd], [TUBE, X.tubeEnd], [TUBE, X.hpTop - 0.05], [TUBE - 0.05, X.hpTop],
      [1.12, X.hpTop], [1.12, X.hpTop - 0.18], [ROD + G, X.hpTop - 0.18], [ROD + G, X.hpBot + 0.06],
    ], 'grey', 20),
    L([[ROD + G, X.hpTop - 0.18], [1.1, X.hpTop - 0.18], [1.1, X.hpTop + 0.02], [0.98, X.hpTop + 0.05], [ROD + G, X.hpTop + 0.02]], 'rubber', 16),
  ), [0.2, 0, 0]);

  // ================================================ 12 — tige soudée (œil, graisseur)
  const rodEye = eyeBody(X.eye, 1, [[X.eyeBase, 1.39], [X.eyeBase, -1.39]], 1.0 + 0.003);
  const zk = zerk(S, 0.8);
  P('12', group(
    L([
      [0, X.pistonEnd], [ROD - 0.05, X.pistonEnd], [ROD, X.pistonEnd + 0.05], [ROD, X.hpTop + 0.35],
      [0.875, X.hpTop + 0.38], [0.6, X.hpTop + 0.6], [0.5, X.hpTop + 0.62], [0.5, X.eyeBase + 0.02], [0, X.eyeBase + 0.02],
    ], 'chrome', 16),
    L([[0, X.capIn + 0.05], ...thread(PILOT, X.capIn + 0.05, X.pistonEnd - 0.08, { pitch: 1 / 12, maxTurns: 4 }), [PILOT, X.pistonEnd], [0, X.pistonEnd]], 'steel', 12),
    rodEye,
    weldRing(u(0.56), u(0.14), 'grey', { axis: 'x', pos: v3(X.eyeBase - 0.04, 0, 0) }),
    at(zk, v3(X.eye, EYE.R - 0.02, 0)),
  ), [0.35, 0, 0]);

  // 13 — rotule autoaligneuse : bague extérieure Ø 2 po, rotule chromée alésage 1 1/4
  {
    const R = 0.86;
    const sph = Array.from({ length: 7 }, (_, i) => { const z = -0.5 + (i / 6) * 1.0; return [Math.sqrt(R * R - z * z), z]; });
    P('13', at(group(
      Lz([[0.76, -0.44], [1.0, -0.44], [1.0, 0.44], [0.76, 0.44], [0.8, 0.2], [0.8, -0.2], [0.76, -0.44]], 'steel'),
      Lz([[0.625, -0.5], ...sph, [0.625, 0.5], [0.625, -0.5]], 'chrome'),
    ), v3(X.eye, 0, 0)), [0, 0, 0.12]);
  }

  // ================================================ 6 — piston, 10 — bague de blocage
  P('6', L([
    [PILOT + G, X.ringEnd], [BORE - 0.05, X.ringEnd], [BORE - G, X.ringEnd + 0.04], [BORE - G, X.ringEnd + 0.3],
    [BORE - 0.12, X.ringEnd + 0.3], [BORE - 0.12, X.ringEnd + 0.62], [BORE - G, X.ringEnd + 0.62],
    [BORE - G, X.ringEnd + 0.72], [BORE - 0.22, X.ringEnd + 0.72], [BORE - 0.22, X.ringEnd + 1.1], [BORE - G, X.ringEnd + 1.1],
    [BORE - G, X.pistonEnd - 0.04], [BORE - 0.05, X.pistonEnd], [PILOT + G, X.pistonEnd],
  ], 'steel', 20), [0.15, 0.15, 0]);
  P('10', L([
    [PILOT + G, X.capIn + 0.02], [1.25, X.capIn + 0.02], [1.3, X.capIn + 0.06], [1.3, X.ringEnd - 0.04], [1.26, X.ringEnd], [PILOT + G, X.ringEnd],
  ], 'steel', 20), [0.05, 0.15, 0]);

  return { view: { dir: [0.3, 0.6, 1] } };
}

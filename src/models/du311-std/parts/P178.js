// P178 — Vérin de translation « CYLINDER - Ø3.25 X 30.00 ST. » CX036169 rév. 0
// (page 178 : coupe longitudinale en demi-vue, vue de côté du bloc des
// valves, isométrique et schéma hydraulique). Même vérin soudé à tête vissée
// que celui du DU311-TVK (pièces CX047505), équipé ici de deux valves
// d'équilibrage CP004070 (18) et d'une ligne d'huile à embouts SAE J514-6
// (17) ; alésage 3 1/4 po, course 30 po, tige Ø 1 3/4 po, entraxe rentré
// 39.50 po maxi.
// - tube soudé (non listé : l'ensemble CX036169 est le tube équipé ; dessiné
//   avec la bague 16 de son œil de fond) : tube Ø 3 3/4 × 1/4 po, fond soudé,
//   œil de fond Ø 3 × 1 po, bloc des valves soudé sur le côté près du fond ;
// - bague de l'œil de fond 1 1/4 × 1 1/2 × 1 po (16) ;
// - bloc des valves : valves d'équilibrage à cartouche (18) sur les faces
//   côté tête et côté fond, quatre bouchons ORB -6 à joint (14), orifices
//   1 (sortie / rentrée, 9/16-18 ORB) sur les faces ±Z où se vissent les
//   coudes 29 de P170 ; raccord droit ORB → JIC (15) sur la face côté tête ;
// - ligne d'huile (17) : tube Ø 3/8 po du raccord 15 à l'orifice de la
//   tête, écrous JIC et coude d'orifice ;
// - tête (1) vissée dans le tube, joint torique extérieur (2*), joint de
//   tige (3*), racleur (4*), bague de guidage (5*) ;
// - tige (12) chromée, œil de tige soudé, rotule autoaligneuse alésage
//   1 3/8 po (13), graisseur 1/8 NPT (19) ;
// - piston (6) vissé sur la queue, joint de piston (7*), bague d'usure (8*),
//   joint torique intérieur (9*), bague de blocage (10) et sa vis sans tête
//   3/8-24 (11). La trousse de joints (20*) reste sans objet.
// Repère : origine sur l'axe de la bague de l'œil de fond ; +X le long de
// l'axe vers la tige ; Z = axe des deux yeux ; +Y vers le bloc des valves.
// Vérin rentré (option ext : sortie de tige en m) : entraxe 1.003 m (39.50
// po), sorti 1.765 m. Encombrement ≈ 1.04 × 0.15 × 0.15 m.
// Simulation : tige, œil, rotule, graisseur, piston, ses joints, bague de
// blocage et vis sont marqués côté tige (rodSide).
// Cotes : liste et dessin (alésage, course, entraxe, Ø des axes) ; le reste
// relevé sur la coupe à l'échelle de la cote de course.

import { rodSide } from '../layout.js';
import { cbValve, zerk, orbPlug, jicAdapter, along } from './_slide.js';

const IN = 0.0254;
const u = (v) => v * IN;

// Cotes axiales (po), vérin rentré, depuis l'axe de l'œil de fond.
const X = {
  capFace: 2.0, capIn: 2.75, ringEnd: 3.10, pistonEnd: 4.76,
  portA: 3.0, blockA: 4.4, blockB: 8.4,
  hpBot: 34.76, portB: 35.0, tubeEnd: 36.54, hpTop: 37.04,
  eyeBase: 37.85, eye: 39.5,
};
const STROKE = 30;
const TUBE = 1.875, BORE = 1.625, ROD = 0.875, PILOT = 0.625; // rayons (po)
const EYE = { R: 1.5, T: 1.0 }; // œil de fond
const REYE = { R: 1.6, T: 1.0 }; // œil de tige (rotule Ø 2 3/16)
const BLK = { y0: 1.65, y1: 3.8, z: 2.1 };
const G = 0.02;

export const CYL178 = {
  pinRetracted: u(X.eye), stroke: u(STROKE), pinExtended: u(X.eye + STROKE),
  tubeR: u(TUBE), rodR: u(ROD), eyeR: u(EYE.R), eyeWidth: u(EYE.T), rodEyeWidth: u(REYE.T),
  basePin: u(1.25), rodPin: u(1.375),
  // orifices 1 (faces ±Z du bloc) où se vissent les coudes de P170 : (x, y, ±z)
  ports: [[u(6.9), u(2.75), u(BLK.z)], [u(5.6), u(2.75), -u(BLK.z)]],
};

export default function P178(api, opts = {}) {
  const { THREE, S } = api;
  const { lathe, thread, extrude, weld, weldRing, merged, at, group, nut, cyl, box, tube } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const ext = Math.max(0, Math.min(opts.ext ?? 0, u(STROKE))); // sortie de tige (m)
  const L = (pts, mat, seg = 40, o = {}) => lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg, axis: 'x', ...o });
  const Lz = (pts, mat, seg = 18) => lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg, axis: 'z' });
  const v3 = (x, y, z) => [u(x), u(y), u(z)];
  // pièce côté tige : décalée de la sortie de tige
  const R = (obj) => { const g = group(obj); g.position.x = ext; return rodSide(g); };

  // Œil (plan XY, épaisseur selon Z) : demi-cercle côté libre, flancs jusqu'au pied.
  const eyeBody = (cx, dir, e, foot, hole) => {
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const a = -Math.PI / 2 + (i / 16) * Math.PI;
      pts.push([cx + dir * e.R * Math.cos(a), e.R * Math.sin(a)]);
    }
    pts.push(...foot);
    let area = 0;
    pts.forEach(([x0, y0], i) => { const [x1, y1] = pts[(i + 1) % pts.length]; area += x0 * y1 - x1 * y0; });
    if (area < 0) pts.reverse();
    return extrude(pts.map(([x, y]) => [u(x), u(y)]), u(e.T), 'grey', { holes: [[u(cx), 0, u(hole)]] });
  };

  // ================================================ 16 — bague de l'œil de fond, avec le tube soudé
  const TAP = { y0: X.tubeEnd - 1.0, y1: X.tubeEnd - 0.08 };
  const barrel = merged([
    L([[BORE, X.capIn], [TUBE - 0.08, X.capIn], [TUBE, X.capIn + 0.1], [TUBE, X.tubeEnd - 0.04], [TUBE - 0.04, X.tubeEnd], [BORE, X.tubeEnd], [BORE, X.capIn]], 'grey', 24),
    L([[BORE, TAP.y0], ...thread(BORE, TAP.y0, TAP.y1, { pitch: 1 / 12, maxTurns: 4, chamferBottom: false }).reverse()], 'grey', 20),
  ], 'grey');
  barrel.userData.hasInterior = true;
  const cap = L([
    [0, X.capFace], [TUBE - 0.06, X.capFace], [TUBE, X.capFace + 0.06], [TUBE, 2.12], [1.72, 2.16], [1.72, 2.32], [TUBE, 2.36],
    [TUBE, X.capIn - 0.1], [TUBE - 0.08, X.capIn], [BORE - G, X.capIn], [0, X.capIn],
  ], 'grey', 24);
  const capEye = eyeBody(0, -1, EYE, [[X.capFace + 0.01, EYE.R], [X.capFace + 0.01, -EYE.R]], 0.75 + 0.003);
  const block = at(box(u(X.blockB - X.blockA), u(BLK.y1 - BLK.y0), u(2 * BLK.z), 'grey', { r: u(0.06) }), v3((X.blockA + X.blockB) / 2, (BLK.y0 + BLK.y1) / 2, 0));
  // bossage de l'orifice de tête (sous le coude de la ligne d'huile)
  const boss = at(cyl(u(0.5), u(0.5), 'grey', { seg: 16 }), v3(X.portB, TUBE + 0.05, 0));
  const bushing16 = Lz([[0.625, -0.5], [0.75, -0.5], [0.75, 0.5], [0.625, 0.5], [0.625, -0.5]], 'brass', 20);
  P('16', group(
    merged([barrel, cap, capEye, block, boss], 'grey'),
    weldRing(u(TUBE - 0.02), u(0.18), 'grey', { axis: 'x', pos: v3(X.capIn + 0.03, 0, 0) }),
    weld([[X.capFace - 0.05, EYE.R + 0.04, -EYE.T / 2 - 0.04], [X.capFace - 0.05, EYE.R + 0.04, EYE.T / 2 + 0.04]].map((p) => v3(...p)), u(0.15), 'grey'),
    weld([[X.capFace - 0.05, -EYE.R - 0.04, -EYE.T / 2 - 0.04], [X.capFace - 0.05, -EYE.R - 0.04, EYE.T / 2 + 0.04]].map((p) => v3(...p)), u(0.15), 'grey'),
    weld([[X.blockA, TUBE - 0.1, -BLK.z], [X.blockA, TUBE - 0.1, BLK.z]].map((p) => v3(...p)), u(0.14), 'grey'),
    weld([[X.blockB, TUBE - 0.1, -BLK.z], [X.blockB, TUBE - 0.1, BLK.z]].map((p) => v3(...p)), u(0.14), 'grey'),
    bushing16,
  ), [0, 0, 0]);

  // ================================================ 18 — valves d'équilibrage (faces côté tête et côté fond du bloc)
  const yv = 2.95;
  P('18', at(cbValve(S), v3(X.blockB, yv, -0.9), [0, 0, -Math.PI / 2]), [0.12, 0, 0]);
  P('18', at(cbValve(S), v3(X.blockA, yv, 0.9), [0, 0, Math.PI / 2]), [-0.12, 0, 0]);

  // ================================================ 14 — bouchons ORB -6 (face extérieure et faces ±Z)
  for (const [x, y, z, dir] of [[5.4, BLK.y1, -1.0, [0, 1, 0]], [7.4, BLK.y1, 1.0, [0, 1, 0]], [7.4, 2.3, BLK.z, [0, 0, 1]], [5.0, 2.3, -BLK.z, [0, 0, -1]]]) {
    P('14', along(THREE, orbPlug(S, THREE, 6), dir, v3(x, y, z)), dir.map((d) => d * 0.08));
  }

  // ================================================ 15 — raccord droit ORB → JIC (face côté tête du bloc), 17 — ligne d'huile
  const yl = 2.35, zl = 0.9;
  P('15', along(THREE, jicAdapter(S, THREE, 6), [1, 0, 0], v3(X.blockB, yl, zl)), [0.1, 0.04, 0]);
  {
    const rt = 0.1875; // tube Ø 3/8
    const x0 = X.blockB + 1.05; // nez du raccord 15
    const yTop = TUBE + 0.85;
    // coude d'orifice de tête (ORB → JIC, nez vers −X) et écrous JIC aux deux bouts
    const headEl = merged([
      L([[0, 0], [0.2, 0], [0.2, 0.3], [0, 0.3]], 'zinc', 10, { axis: 'y' }),
      at(nut(u(0.6875), u(0.25), 'zinc'), v3(0, 0.42, 0)),
      at(box(u(0.62), u(0.6), u(0.62), 'zinc', { r: u(0.06) }), v3(0, 0.85, 0)),
      L([[0, 0], [0.24, 0], [0.24, 0.55], [0.18, 0.62], [0, 0.62]], 'zinc', 10, { axis: '-x' }),
    ], 'zinc');
    headEl.position.set(...v3(X.portB, TUBE + 0.3, zl * 0));
    const line = tube([
      v3(x0, yl, zl), v3(x0 + 1.5, yl, zl), v3(x0 + 3.5, yTop - 0.05, zl * 0.6), v3(X.portB - 4.0, yTop, 0.05), v3(X.portB - 1.15, yTop, 0),
    ], u(rt), 'steel', { seg: 28, tension: 0.35, radial: 8 });
    const nuts = merged([
      at(nut(u(0.6875), u(0.42), 'zinc', { axis: 'x' }), v3(x0 + 0.2, yl, zl)),
      at(nut(u(0.6875), u(0.42), 'zinc', { axis: 'x' }), v3(X.portB - 1.0, yTop, 0)),
    ], 'zinc');
    P('17', group(headEl, line, nuts), [0, 0.1, 0]);
  }

  // ================================================ 1 — tête vissée ; 2*, 3*, 4*, 5* — joints de tête
  P('1', L([
    [ROD + G, X.hpBot + 0.06], [ROD + 0.08, X.hpBot], [BORE - 0.04, X.hpBot], [BORE - G, X.hpBot + 0.04],
    [BORE - G, X.hpBot + 0.5], [BORE - 0.1, X.hpBot + 0.5], [BORE - 0.1, X.hpBot + 0.66], [BORE - G, X.hpBot + 0.66],
    ...thread(BORE - G, TAP.y0, TAP.y1, { pitch: 1 / 12, maxTurns: 4 }),
    [BORE - G, X.tubeEnd], [TUBE, X.tubeEnd], [TUBE, X.hpTop - 0.05], [TUBE - 0.05, X.hpTop],
    [1.12, X.hpTop], [1.12, X.hpTop - 0.18], [ROD + G, X.hpTop - 0.18], [ROD + G, X.hpBot + 0.06],
  ], 'grey', 24), [0.2, 0, 0]);
  P('2*', L([[BORE - 0.1, X.hpBot + 0.5], [BORE - 0.02, X.hpBot + 0.5], [BORE - 0.02, X.hpBot + 0.66], [BORE - 0.1, X.hpBot + 0.66], [BORE - 0.1, X.hpBot + 0.5]], 'rubber', 24), [0.26, 0, 0]);
  P('3*', L([[ROD + 0.005, X.hpBot + 1.0], [ROD + 0.22, X.hpBot + 1.0], [ROD + 0.22, X.hpBot + 1.35], [ROD + 0.005, X.hpBot + 1.35], [ROD + 0.005, X.hpBot + 1.0]], 'blue', 20), [0.3, 0, 0]);
  P('4*', L([[ROD + 0.005, X.hpTop - 0.18], [1.1, X.hpTop - 0.18], [1.1, X.hpTop + 0.02], [0.98, X.hpTop + 0.05], [ROD + 0.005, X.hpTop + 0.02], [ROD + 0.005, X.hpTop - 0.18]], 'rubber', 20), [0.34, 0, 0]);
  P('5*', L([[ROD + 0.005, X.hpBot + 0.25], [ROD + 0.08, X.hpBot + 0.25], [ROD + 0.08, X.hpBot + 0.75], [ROD + 0.005, X.hpBot + 0.75], [ROD + 0.005, X.hpBot + 0.25]], 'cream', 20), [0.28, 0, 0]);

  // ================================================ 12 — tige soudée (œil) ; 13 — rotule ; 19 — graisseur
  const rodEye = eyeBody(X.eye, 1, REYE, [[X.eyeBase, 1.39], [X.eyeBase, -1.39]], 1.1 + 0.003);
  P('12', R(group(
    L([
      [0, X.pistonEnd], [ROD - 0.05, X.pistonEnd], [ROD, X.pistonEnd + 0.05], [ROD, X.hpTop + 0.35],
      [0.875, X.hpTop + 0.38], [0.6, X.hpTop + 0.6], [0.5, X.hpTop + 0.62], [0.5, X.eyeBase + 0.02], [0, X.eyeBase + 0.02],
    ], 'chrome', 18),
    L([[0, X.capIn + 0.05], ...thread(PILOT, X.capIn + 0.05, X.pistonEnd - 0.08, { pitch: 1 / 12, maxTurns: 4 }), [PILOT, X.pistonEnd], [0, X.pistonEnd]], 'steel', 12),
    rodEye,
    weldRing(u(0.56), u(0.14), 'grey', { axis: 'x', pos: v3(X.eyeBase - 0.04, 0, 0) }),
  )), [0.35, 0, 0]);
  {
    const Rb = 0.95;
    const sph = Array.from({ length: 7 }, (_, i) => { const z = -0.5 + (i / 6) * 1.0; return [Math.sqrt(Rb * Rb - z * z), z]; });
    P('13', R(at(group(
      Lz([[0.86, -0.45], [1.1, -0.45], [1.1, 0.45], [0.86, 0.45], [0.9, 0.2], [0.9, -0.2], [0.86, -0.45]], 'steel'),
      Lz([[0.6875, -0.5], ...sph, [0.6875, 0.5], [0.6875, -0.5]], 'chrome'),
    ), v3(X.eye, 0, 0))), [0, 0, 0.12]);
  }
  // graisseur 1/8 NPT sur le flanc de l'œil (côté −Y, comme sur la coupe)
  P('19', R(at(zerk(S, 0.85), v3(X.eye, -REYE.R + 0.02, 0), [Math.PI, 0, 0])), [0, -0.06, 0]);

  // ================================================ 6 — piston ; 7*, 8*, 9* — joints ; 10 — bague de blocage ; 11 — vis
  P('6', R(L([
    [PILOT + G, X.ringEnd], [BORE - 0.05, X.ringEnd], [BORE - G, X.ringEnd + 0.04], [BORE - G, X.ringEnd + 0.3],
    [BORE - 0.12, X.ringEnd + 0.3], [BORE - 0.12, X.ringEnd + 0.62], [BORE - G, X.ringEnd + 0.62],
    [BORE - G, X.ringEnd + 0.72], [BORE - 0.22, X.ringEnd + 0.72], [BORE - 0.22, X.ringEnd + 1.1], [BORE - G, X.ringEnd + 1.1],
    [BORE - G, X.pistonEnd - 0.04], [BORE - 0.05, X.pistonEnd], [PILOT + G, X.pistonEnd],
  ], 'steel', 24)), [0.15, 0.15, 0]);
  P('7*', R(L([[BORE - 0.22, X.ringEnd + 0.72], [BORE - 0.005, X.ringEnd + 0.72], [BORE - 0.005, X.ringEnd + 1.1], [BORE - 0.22, X.ringEnd + 1.1], [BORE - 0.22, X.ringEnd + 0.72]], 'blue', 24)), [0.15, 0.22, 0]);
  P('8*', R(L([[BORE - 0.12, X.ringEnd + 0.3], [BORE - 0.005, X.ringEnd + 0.3], [BORE - 0.005, X.ringEnd + 0.62], [BORE - 0.12, X.ringEnd + 0.62], [BORE - 0.12, X.ringEnd + 0.3]], 'cream', 24)), [0.15, 0.27, 0]);
  P('9*', R(L([[PILOT + 0.002, X.ringEnd + 0.75], [PILOT + 0.09, X.ringEnd + 0.75], [PILOT + 0.09, X.ringEnd + 0.9], [PILOT + 0.002, X.ringEnd + 0.9], [PILOT + 0.002, X.ringEnd + 0.75]], 'rubber', 18)), [0.12, 0.3, 0]);
  P('10', R(L([
    [PILOT + G, X.capIn + 0.02], [1.25, X.capIn + 0.02], [1.3, X.capIn + 0.06], [1.3, X.ringEnd - 0.04], [1.26, X.ringEnd], [PILOT + G, X.ringEnd],
  ], 'steel', 24)), [0.05, 0.15, 0]);
  P('11', R(at(lathe([[0, -0.0127], [0.0042, -0.0127], [0.0048, -0.011], [0.0048, 0], [0.002, 0], [0.002, -0.004], [0, -0.0045]], 'blackOxide', { seg: 10 }), v3((X.capIn + X.ringEnd) / 2, 1.3, 0))), [0.05, 0.22, 0]);

  return { view: { dir: [0.3, 0.6, 1] } };
}

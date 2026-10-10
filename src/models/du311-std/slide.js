// P164 — Glissière (« CLTR ASSY, SLIDE ») et P156 — plaque de liaison du mât
// (MCP), en formes simplifiées d'après les vues des pages 156, 164 et 166.
// La glissière est boulonnée au nez du porteur (repère machine, voir
// layout.js) : caisson d'appui avec stabilisateurs avant, cadre dressé pivotant
// sur paliers (vérins de basculement), chariot de translation latérale sur deux
// tubes et actionneur rotatif qui porte le MCP.
import { M } from './layout.js';

const FZ = M.frameZ;

export const SLIDE = {
  base: { x0: M.nose, x1: 2.95, z: 0.62, y0: 0.5, y1: 1.1 },
  frameX: 3.0, // plan des tubes du cadre dressé
  tubes: [1.32, 2.15],
  rot: { x: 3.3, y: 1.72 }, // centre de l'actionneur rotatif (face avant à x = 3.38)
  face: 3.4, // appui du MCP
};

// Vérin entre deux points du plan XY (à la cote z), œil côté a.
function cylinderAB(S, a, b, z, bore, material = 'black') {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  return S.at(S.hydCylinder(len - bore * 0.6, bore, { material, ext: 0.42 }), [a[0], a[1], z], [0, 0, Math.atan2(dy, dx)]);
}

export function P164(api) {
  const { box, cyl, ring, tube, bolt, nut, fitting, ballValve, plate, hydCylinder, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const B = SLIDE.base, X = SLIDE.frameX, [T0, T1] = SLIDE.tubes, R = SLIDE.rot;
  const bx = (B.x0 + B.x1) / 2, bl = B.x1 - B.x0;
  const IN = 0.0254;

  // 1 — ensemble de glissement : caisson d'appui, paliers et axe de basculement, cadre dressé
  // (flasques, tubes), chariot et vérin de translation, actionneur rotatif, vérins de basculement
  const flank = (s) => at(plate(bl, B.y1 - B.y0, 0.025, 'lightGrey', { holes: [[-0.2, 0.05, 0.08], [0.18, -0.08, 0.06]] }), [bx, (B.y0 + B.y1) / 2, s * B.z], [Math.PI / 2, 0, 0]);
  const sideFrame = (s) => group(
    at(box(0.32, T1 - T0 + 0.36, 0.05, 'lightGrey', { r: 0.02 }), [X, (T0 + T1) / 2, s * 0.8]),
    at(box(0.12, 0.25, 0.05, 'lightGrey'), [X - 0.04, 1.2, s * 0.56]),
    at(cyl(0.1, 0.06, 'lightGrey', { axis: 'z' }), [X, T1 + 0.04, s * 0.83]),
    at(cyl(0.1, 0.06, 'lightGrey', { axis: 'z' }), [X, T0 - 0.04, s * 0.83]),
  );
  P('1', group(
    flank(1), flank(-1),
    at(box(0.04, B.y1 - B.y0, 2 * B.z, 'lightGrey'), [B.x0 + 0.02, (B.y0 + B.y1) / 2, 0]),
    at(box(0.04, B.y1 - B.y0, 2 * B.z, 'lightGrey'), [B.x1 - 0.02, (B.y0 + B.y1) / 2, 0]),
    at(box(bl, 0.03, 2 * B.z + 0.03, 'lightGrey'), [bx, B.y1 - 0.015, 0]),
    at(box(bl, 0.02, 2 * B.z, 'grey'), [bx, B.y0 + 0.01, 0]),
    // paliers et axe de basculement, colliers d'arrêt
    ...[1, -1].map((s) => at(box(0.18, 0.14, 0.12, 'darkSteel', { r: 0.01 }), [X - 0.06, 1.17, s * 0.5])),
    at(cyl(0.045, 1.25, 'steel', { axis: 'z' }), [X - 0.06, 1.2, 0]),
    ...[1, -1].map((s) => at(ring(0.07, 0.045, 0.04, 'darkSteel', { axis: 'z' }), [X - 0.06, 1.2, s * 0.6])),
    // cadre dressé : flasques, tubes de glissement, traverse supérieure
    sideFrame(1), sideFrame(-1),
    ...[T0, T1].map((y) => at(cyl(0.085, 1.66, 'chrome', { axis: 'z', seg: 36 }), [X, y, 0])),
    at(box(0.16, 0.1, 1.6, 'lightGrey'), [X - 0.1, T1 + 0.2, 0]),
    // chariot de translation (paliers sur les tubes) et actionneur rotatif
    at(box(0.2, T1 - T0 + 0.18, 0.6, 'grey', { r: 0.015 }), [X + 0.1, (T0 + T1) / 2, 0]),
    ...[T0, T1].flatMap((y) => [1, -1].map((s) => at(ring(0.13, 0.086, 0.16, 'grey', { axis: 'z', seg: 36 }), [X, y, s * 0.22]))),
    at(cyl(0.26, 0.14, 'charcoal', { axis: 'x', seg: 48 }), [R.x - 0.01, R.y, 0]),
    at(cyl(0.22, 0.03, 'darkSteel', { axis: 'x', seg: 48 }), [R.x + 0.075, R.y, 0]),
    ...Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return at(cyl(0.012, 0.03, 'steel', { axis: 'x', seg: 6 }), [R.x + 0.08, R.y + Math.sin(a) * 0.18, Math.cos(a) * 0.18]);
    }),
    // vérin de translation latérale au-dessus du tube supérieur
    at(hydCylinder(0.95, 0.08, { material: 'black', axis: 'z', ext: 0.35 }), [X + 0.02, T1 + 0.2, -0.7]),
    at(box(0.1, 0.1, 0.1, 'grey'), [X + 0.04, T1 + 0.13, 0.28]),
    at(box(0.1, 0.1, 0.08, 'grey'), [X - 0.02, T1 + 0.2, -0.76]),
    // vérins de basculement (« dump »), du caisson au cadre
    ...[1, -1].map((s) => cylinderAB(api.S, [B.x0 + 0.12, B.y1 + 0.06], [X - 0.12, T1 + 0.18], s * 0.42, 0.1)),
    ...[1, -1].map((s) => at(box(0.12, 0.1, 0.12, 'lightGrey'), [B.x0 + 0.12, B.y1 + 0.04, s * 0.42])),
  ), [0, 0, 0]);

  // 4 — circuit d'air : réservoir tampon couché sur le caisson, vanne marche/arrêt, flexibles à bride
  P('4', group(
    at(cyl(0.17, 0.62, 'grey', { axis: 'z', seg: 40 }), [2.6, B.y1 + 0.22, 0]),
    ...[1, -1].map((s) => at(cyl(0.17, 0.06, 'grey', { axis: 'z', r2: 0.11 }), [2.6, B.y1 + 0.22, s * 0.34])),
    ...[1, -1].map((s) => at(box(0.26, 0.07, 0.05, 'darkSteel'), [2.6, B.y1 + 0.035, s * 0.2])),
    at(ballValve(0.05, 'brass', { axis: 'z' }), [2.6, B.y1 + 0.42, 0.24]),
    tube([[2.6, B.y1 + 0.39, 0.0], [2.6, B.y1 + 0.42, 0.18]], 0.025, 'steel', { sharp: true, seg: 2 }),
    tube([[2.6, B.y1 + 0.42, 0.3], [2.75, B.y1 + 0.6, 0.38], [3.0, 1.7, 0.45], [3.2, 2.0, 0.3], [3.38, 2.15, 0.1]], 0.03, 'black', { seg: 32 }),
    tube([[2.45, B.y1 + 0.22, 0.37], [2.36, B.y1 + 0.1, 0.66], [2.26, 0.95, 0.66], [M.nose + 0.01, 0.88, FZ + 0.05]], 0.03, 'black', { seg: 16 }),
  ), [0, 0.45, 0]);

  // 5 — stabilisateurs avant gauche et droit, supports de projecteurs, écrans de capteurs
  const outrigger = (s) => group(
    at(box(0.26, 0.5, 0.18, 'lightGrey', { r: 0.01 }), [2.62, 0.82, s * (B.z + 0.09)]),
    at(cyl(0.075, 0.8, 'grey'), [2.62, 0.72, s * 0.8]),
    at(cyl(0.05, 0.28, 'chrome'), [2.62, 0.2, s * 0.8]),
    at(cyl(0.13, 0.03, 'darkSteel', { seg: 32 }), [2.62, 0.055, s * 0.8]),
    at(cyl(0.15, 0.04, 'darkSteel', { seg: 32 }), [2.62, 0.02, s * 0.8]),
    at(box(0.08, 0.06, 0.08, 'steel', { r: 0.006 }), [2.62, 1.15, s * 0.8]),
    at(box(0.1, 0.03, 0.12, 'grey'), [2.73, 1.06, s * 0.8]),
    at(box(0.06, 0.08, 0.1, 'black', { r: 0.008 }), [2.8, 1.11, s * 0.8]),
    at(box(0.006, 0.06, 0.08, 'lamp'), [2.833, 1.11, s * 0.8]),
    at(box(0.12, 0.14, 0.01, 'grey'), [2.62, 0.5, s * 0.885]),
    ...[0.68, 0.76, 0.84, 0.92].map((y) => bolt(0.625 * IN, 1.5 * IN, 'steel', { axis: s > 0 ? 'z' : '-z', pos: [2.53, y, s * (B.z + 0.18)] })),
  );
  P('5', outrigger(1), [0.1, -0.15, 0.4]);
  P('5', outrigger(-1), [0.1, -0.15, -0.4]);

  // 2 — support du laser d'alignement (flasque droit) ; 3 — support de la caméra de translation (flasque gauche)
  P('2', group(
    at(cyl(0.06, 0.02, 'darkSteel', { axis: 'z' }), [X, 1.9, 0.835]),
    at(box(0.12, 0.05, 0.05, 'black', { r: 0.008 }), [X + 0.02, 1.9, 0.87]),
    at(cyl(0.012, 0.01, 'red', { axis: 'x' }), [X + 0.085, 1.9, 0.87]),
  ), [0, 0.1, 0.35]);
  P('3', group(
    at(box(0.12, 0.03, 0.12, 'grey'), [X + 0.18, 1.08, -0.78]),
    at(box(0.08, 0.07, 0.08, 'black', { r: 0.01 }), [X + 0.2, 1.13, -0.78]),
    at(cyl(0.022, 0.02, 'glass', { axis: 'x' }), [X + 0.245, 1.13, -0.78]),
  ), [0.3, 0, -0.3]);
  // 6 — graissage centralisé de la glissière (bloc distributeur sur le flasque droit)
  P('6', group(
    at(box(0.05, 0.28, 0.04, 'steel', { r: 0.004 }), [X + 0.08, 1.75, 0.845]),
    ...[0, 1, 2, 3, 4, 5].map((i) => at(fitting(0.008, 0.02, 'brass', { axis: 'z' }), [X + 0.08, 1.64 + i * 0.045, 0.87])),
  ), [0.1, 0, 0.35]);
  // 7 — clapet de retenue de charge ; 8 — bloc d'alimentation de l'avance (sur le caisson)
  P('7', group(
    at(box(0.1, 0.08, 0.12, 'steel', { r: 0.005 }), [2.32, B.y1 + 0.04, -0.3]),
    at(cyl(0.02, 0.06, 'black'), [2.32, B.y1 + 0.11, -0.3]),
  ), [-0.2, 0.3, 0]);
  P('8', group(
    at(box(0.14, 0.14, 0.18, 'steel', { r: 0.006 }), [2.36, B.y1 + 0.07, 0.3]),
    ...[-0.05, 0.05].map((z) => at(cyl(0.022, 0.08, 'black', { axis: 'x' }), [2.47, B.y1 + 0.09, 0.3 + z])),
    ...[-0.05, 0.05].map((z) => at(fitting(0.018, 0.04, 'steel'), [2.36, B.y1 + 0.16, 0.3 + z])),
  ), [-0.2, 0.35, 0]);
  // 9 — vis 1 x 3 3/4 po et 10 — contre-écrous, aux coins arrière du caisson
  for (const s of [1, -1]) {
    P('9', bolt(1 * IN, 3.75 * IN, 'steel', { pos: [B.x0 + 0.07, B.y1 + 0.03, s * 0.52] }), [0, 0.35, 0]);
    P('10', nut(1.5 * IN, 0.025, 'steel', { pos: [B.x0 + 0.07, B.y1 + 0.0125, s * 0.52] }), [0, 0.25, 0]);
  }
  return { view: { dir: [1.15, 0.6, 1.0] } };
}

// P156 — MCP (plaque de liaison du mât) : plaque dans le plan XY centrée à
// l'origine, longueur selon Y, face avant (vers le mât) selon +Z. Les barres
// de guidage du cadre du carrousel coulissent dans les patins (x = ±0.25).
export const MCP = { length: 2.0, width: 0.56, t: 0.05, rail: 0.25, front: 0.175 };

export function P156(api) {
  const { box, bolt, extrude, fitting, hydCylinder, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { length: L, width: W, t, rail } = MCP;
  const h = L / 2;
  const IN = 0.0254;

  // 2 — plaque et patins de guidage boulonnés (deux par côté)
  const pad = (s, y) => group(
    at(box(0.025, 0.7, 0.15, 'grey'), [s * (rail + 0.055), y, t / 2 + 0.075]),
    at(box(0.07, 0.7, 0.02, 'grey'), [s * (rail + 0.03), y, t / 2 + 0.14]),
    at(box(0.012, 0.66, 0.1, 'white'), [s * (rail + 0.036), y, t / 2 + 0.07]),
    ...[-0.25, -0.08, 0.08, 0.25].map((dy) => at(bolt(0.625 * IN, 1.5 * IN, 'steel', { axis: s > 0 ? 'x' : '-x', pos: [s * (rail + 0.075), y + dy, t / 2 + 0.07] }), [0, 0, 0])),
  );
  P('2', group(
    at(extrude([[-W / 2, -h + 0.25], [-W / 2, h], [W / 2, h], [W / 2, -h + 0.25], [0.12, -h], [-0.12, -h]], t, 'lightGrey', { holes: [[0, 0.1, 0.12]] }), [0, 0, 0]),
    pad(1, 0.55), pad(-1, 0.55), pad(1, -0.45), pad(-1, -0.45),
    at(box(0.12, 0.1, 0.12, 'lightGrey'), [0, h - 0.06, t / 2 + 0.06]),
  ), [0, 0, -0.35]);

  // 1 — vérin d'extension de l'avance Ø 4 po, couché sur la plaque entre les patins
  const r = 2 * IN, y0 = -h + 0.08, len = L - 0.18;
  P('1', at(hydCylinder(len, 4 * IN, { material: 'black', axis: 'y', ext: 0.32 }), [0, y0, t / 2 + 0.065]), [0, 0, 0.45]);
  // 3 — coudes 90° sur les orifices du vérin ; 4 — coude 45° à écrou tournant
  const barrel = len * 0.68;
  for (const y of [y0 + r * 1.05, y0 + barrel - r * 1.1]) {
    P('3', at(fitting(0.02, 0.04, 'steel', { axis: 'x', elbow: true }), [-r * 1.45, y, t / 2 + 0.065]), [-0.3, 0, 0.5]);
  }
  P('4', at(fitting(0.02, 0.035, 'steel', { axis: 'z' }), [-r * 1.45 - 0.03, y0 + r * 1.05, t / 2 + 0.1]), [-0.35, 0, 0.6]);
  return { view: { dir: [0.9, 0.5, 1.2] } };
}

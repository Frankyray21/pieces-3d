import { SIZES, layout, prof } from './common.js';

// Carottiers au câble complets (core barrel assemblies) : couronne, alésoir,
// stabilisateur, tube extérieur, bague d'atterrissage, raccord d'adaptation,
// raccord de verrouillage, tige, adaptateur et émerillon d'eau (ou bouchon de
// levage, presse-étoupe en souterrain). Le tube intérieur, avec sa tête (sous-
// assemblage de la page de la tête), son arrêtoir, son extracteur et son
// boîtier d'extracteur, est logé dans le tube extérieur ; l'épaulement de la
// tête repose sur la bague d'atterrissage et ses cliquets s'engagent dans le
// raccord de verrouillage. L'overshot (sous-assemblage) est posé au-dessus du
// train, prêt à saisir la tête.
//
// Longueurs raccourcies comme sur les dessins coupés du catalogue : tubes de
// 1 m (au lieu de 1,5 ou 3 m), tige de 0,6 m.

const PI = Math.PI;
const TUBE = 1.0;
const ROD = 0.6;

export function barrel(api, cfg) {
  const S = api.S;
  const R = cfg.R;
  const s = SIZES[cfg.size];
  const [rodO, rodI] = s.rod.map((v) => v / 2);
  const [otO, otI] = s.outer.map((v) => v / 2);
  const [itO, itI] = s.inner.map((v) => v / 2);
  const [bitO, bitI] = s.bit.map((v) => v / 2);
  const sh = s.shoulder / 2;
  const U = s.rod[0]; // unité de la mise en page : diamètre de la tige
  const L = layout(api, U, { gap: 0.9, rows: { A: 0, B: -2.6, C: 2.4, E: -4.8 } });
  const has = (role) => R[role] != null;
  const ref = (role) => R[role];
  const lat = (pts, mat) => S.lathe(pts, mat, { axis: 'x', seg: 48 });
  const th = (r, a, b, pitch, o = {}) => S.thread(r, a, b, { pitch, maxTurns: 10, ...o });
  const add = (role, obj, o) => { if (has(role)) L.add(ref(role), obj, o); return obj; };
  // Sous-assemblage placé pour que son origine soit en x (et y, z).
  const sub = (id, x, y = 0) => { const g = api.sub(id); g.position.set(x, y, 0); return g; };

  // ---------------------------------------------------------------- tube intérieur et tête
  const tipX = 0.012; // bas du boîtier d'extracteur, dans la couronne
  const case1 = tipX + 0.085;
  const it1 = case1 + TUBE;
  const head = api.sub(cfg.head);
  const A = head.userData.view.anchors;
  const hd = SIZES[cfg.size].D;
  const h0 = it1 - 0.42 * hd; // le chapeau se visse sur le tube intérieur
  head.position.x = h0;
  const shX = h0 + A.shoulder;
  const latchX = h0 + A.latch;
  const headTop = h0 + A.top;

  // Boîtier d'extracteur (vissé sous le tube), extracteur fendu conique, arrêtoir.
  add('lifterCase', lat([[bitI * 1.02, tipX], [itO * 0.98, tipX], [itO, tipX + 0.006], ...th(itO * 0.97, case1 - 0.03, case1, 0.006, { chamferBottom: false }), [itI * 1.01, case1], [itI * 1.01, case1 - 0.025], [bitI * 1.12, tipX + 0.012]], 'darkSteel'), { row: 'B' });
  if (has('lifter')) {
    const lifter = S.slotted(bitI * 1.11, bitI * 1.0, tipX + 0.014, case1 - 0.03, [{ a: 0, w: 0.12, y0: 0, y1: 1 }], 'black', { axis: 'x', seg: 40 });
    add('lifter', lifter, { row: 'B' });
  }
  add('stopRing', S.ring(itI * 1.0, bitI * 1.05, 0.006, 'steel', { axis: 'x', pos: [case1 - 0.022, 0, 0] }), { row: 'B' });
  add('inner', lat([[itI, case1 - 0.03], [itO * 0.97, case1 - 0.03], [itO, case1], [itO, it1 - 0.04], [itO * 0.97, it1], [itI, it1]], 'grey'), { row: 'B' });
  // Triple tube (N3, H3, P3) : demi-coquilles dans le tube intérieur, adaptateur, piston.
  const sp0 = case1 + 0.005, sp1 = it1 - 0.09;
  add('split', S.slotted(itI * 0.99, itI * 0.9, sp0, sp1, [{ a: 0, w: 0.05, y0: sp0, y1: sp1 }, { a: PI, w: 0.05, y0: sp0, y1: sp1 }], 'lightGrey', { axis: 'x', seg: 40 }), { row: 'B' });
  add('tripleAdapter', lat([[itI * 0.82, sp0 - 0.012], [itI * 0.99, sp0 - 0.012], [itI * 0.99, sp0 + 0.004], [itI * 0.82, sp0 + 0.004]], 'steel'), { row: 'B' });
  add('pistonPlug', lat([[0, sp1 + 0.03], [itI * 0.6, sp1 + 0.03], [itI * 0.6, sp1 + 0.07], [0, sp1 + 0.07]], 'steel'), { row: 'B' });
  add('piston', lat([[0, sp1 + 0.002], [itI * 0.88, sp1 + 0.002], [itI * 0.88, sp1 + 0.026], [0, sp1 + 0.026]], 'darkSteel'), { row: 'B' });
  add('oring', S.torus(itI * 0.88, 0.0025, 'rubber', { axis: 'x', pos: [sp1 + 0.014, 0, 0] }), { row: 'B' });
  if (has('head')) L.add(ref('head'), head, { row: 'B' });

  // ---------------------------------------------------------------- train extérieur
  const bit1 = 0.07, rs1 = 0.25, st1 = rs1 + 0.016;
  if (has('bit')) {
    // Couronne : matrice diamantée à canaux d'eau, corps acier peint.
    const crown = S.slotted(bitO, bitI, 0, 0.022, [0, 1, 2, 3, 4, 5, 6, 7].map((k) => ({ a: (k * PI) / 4, w: 0.18, y0: -0.001, y1: 0.009 })), 'charcoal', { axis: 'x', seg: 64 });
    const blank = lat([[bitI * 1.02, 0.022], [bitO * 0.99, 0.022], [bitO * 0.97, bit1 - 0.012], ...th(otO * 0.93, bit1 - 0.012, bit1, 0.004, { chamferBottom: false }), [otI * 1.0, bit1], [otI * 1.0, bit1 - 0.02], [bitI * 1.02, 0.03]], 'yellow');
    add('bit', S.group(crown, blank), { row: 'A' });
  }
  if (has('shell')) {
    // Alésoir : bandes diamantées en relief et canaux.
    const g = S.group(lat([[otI, bit1], [otO * 0.98, bit1], [otO * 0.98, rs1], [otI, rs1]], 'darkSteel'));
    g.add(S.slotted(bitO * 0.995, otO * 0.97, bit1 + 0.02, rs1 - 0.03, [0, 1, 2, 3, 4, 5].map((k) => ({ a: (k * PI) / 3, w: 0.32, y0: 0, y1: 1 })), 'charcoal', { axis: 'x', seg: 60 }));
    add('shell', g, { row: 'A' });
  }
  add('stabilizer', lat([[itO * 1.03, rs1 - 0.004], [otI, rs1 - 0.004], [otI, st1], [itO * 1.03, st1]], 'brass'), { row: 'A' });
  // Tube extérieur jusqu'à la bague d'atterrissage, sous l'épaulement de la tête.
  const lr1 = shX, lr0 = lr1 - 0.016;
  const ot0 = st1, ot1 = lr0;
  add('outer', lat([[otI, ot0], [otO * 0.97, ot0], [otO, ot0 + 0.004], [otO, ot1 - 0.004], [otO * 0.97, ot1], [otI, ot1]], 'grey'), { row: 'A' });
  add('landingRing', lat([[sh * 0.9, lr0], [otI, lr0], [otI, lr1], [sh * 0.9, lr1]], 'steel'), { row: 'A' });
  // Raccord d'adaptation, puis raccord de verrouillage autour des cliquets.
  const lc0 = Math.max(lr1 + 0.1, latchX - 0.09);
  add('adapterCoupling', lat([[rodI, lr1], [otO * 0.97, lr1], [otO, lr1 + 0.004], [otO, lc0 - 0.004], [otO * 0.97, lc0], [rodI, lc0]], 'darkSteel'), { row: 'A' });
  const lc1 = Math.max(lc0 + 0.2, latchX + 0.1);
  if (has('coupling')) {
    const g = S.group(lat([[rodI * 0.98, lc0], [rodO * 1.02, lc0], [rodO * 1.02, lc1 - 0.04], [rodO * 0.92, lc1 - 0.035], ...th(rodO * 0.9, lc1 - 0.035, lc1 + 0.02, 0.005, { chamferBottom: false }), [rodI * 0.98, lc1 + 0.02]], cfg.couplingMat || 'black'));
    // Fenêtres de lavage ovales (raccord « full hole »).
    g.add(S.slotted(rodO * 1.03, rodO * 1.0, lc0 + 0.03, lc1 - 0.06, [0, 1, 2, 3].map((k) => ({ a: (k * PI) / 2 + PI / 4, w: 0.35, y0: lc0 + 0.06, y1: lc1 - 0.09 })), 'steel', { axis: 'x', seg: 48 }));
    add('coupling', g, { row: 'A' });
  }
  // Tige de forage (tronçon), au-delà du haut de la tête.
  const rd0 = lc1 - 0.035, rd1 = Math.max(rd0 + ROD, headTop + 0.12);
  add('rod', lat([[rodI, rd0], [rodO * 0.97, rd0], [rodO, rd0 + 0.004], [rodO, rd1 - 0.004], [rodO * 0.97, rd1], [rodI, rd1]], 'charcoal'), { row: 'A' });
  // Adaptateur d'émerillon (mâle-mâle) et émerillon.
  let top = rd1;
  if (has('wsAdapter')) {
    const a1 = rd1 + 0.11;
    add('wsAdapter', lat([[rodI * 0.5, rd1 - 0.04], [rodO * 0.9, rd1 - 0.04], [rodO * 0.9, rd1], [rodO * 0.96, rd1 + 0.004], [rodO * 0.96, a1 - 0.035], [rodO * 0.7, a1 - 0.03], ...th(rodO * 0.66, a1 - 0.03, a1, 0.004, { chamferBottom: false }), [rodI * 0.5, a1]], 'darkSteel'), { row: 'A' });
    top = a1;
  }
  if (has('ws')) {
    const ws = api.sub(cfg.swivel);
    const b = new api.THREE.Box3().setFromObject(ws);
    ws.position.x = top - b.min.x - 0.03;
    add('ws', ws, { row: 'A' });
  }

  // ---------------------------------------------------------------- outils posés à côté du train
  // Overshot au-dessus, bouche au droit du haut de la tête ; bouchon de levage,
  // presse-étoupe et outil de chargement sous le train.
  if (has('overshot')) add('overshot', sub(cfg.overshot, headTop + 0.06, 2.4 * U), { row: 'C' });
  let bx = rd1 - 0.25;
  const below = (role, obj, len) => { if (!has(role)) return; obj.position.y = -2.6 * U; obj.position.x = bx; L.add(ref(role), obj, { row: 'E' }); bx += len + 0.1; };
  if (has('hoist')) {
    const hp = S.group(
      lat([[0, 0.08], [rodO * 0.95, 0.08], [rodO * 0.95, 0.24], [rodO * 0.6, 0.27], [rodO * 0.6, 0.3], [0, 0.3]], 'darkSteel'),
      lat([[rodI * 0.7, 0], [rodO * 0.95, 0], [rodO * 0.95, 0.08], [rodI * 0.7, 0.08]], 'darkSteel'),
      S.torus(rodO * 0.7, rodO * 0.18, 'steel', { axis: 'z', pos: [0.36, 0, 0] }),
    );
    below('hpAdapter', lat([[rodI * 0.5, 0], [rodO * 0.92, 0], [rodO * 0.96, 0.004], [rodO * 0.96, 0.08], [rodO * 0.7, 0.085], ...th(rodO * 0.66, 0.085, 0.12, 0.004, { chamferBottom: false }), [rodI * 0.5, 0.12]], 'darkSteel'), 0.12);
    below('hoist', hp, 0.45);
  }
  if (has('sb')) { const g = api.sub('P100'); const b = new api.THREE.Box3().setFromObject(g); g.position.x = -b.min.x; below('sb', S.group(g), b.max.x - b.min.x); }
  if (has('dk')) below('dk', lat([[rodI * 0.45, 0], [rodO * 0.8, 0], [rodO * 0.8, 0.05], [rodO * 0.7, 0.055], ...th(rodO * 0.66, 0.055, 0.1, 0.004, { chamferBottom: false }), [rodI * 0.45, 0.1]], 'grey'), 0.1);
  if (has('loadingTool')) { const g = api.sub(cfg.loadingTool); const b = new api.THREE.Box3().setFromObject(g); g.position.x = -b.min.x; below('loadingTool', S.group(g), b.max.x - b.min.x); }

  L.done();
  return { view: { dir: [0.12, 0.38, 1], section: { axis: 'z', pos: 0.5 } } };
}

// ---------------------------------------------------------------- pages du catalogue

const B = (size, head, overshot, swivel, R, o = {}) => (api) => barrel(api, { size, head, overshot, swivel, R, ...o });

// DiscovOre de surface : WS, WSA, HP, HPA, Rod, 1 raccord, B tête, C overshot, 2 à 14.
const DO = { ws: 'WS', wsAdapter: 'WSA', hoist: 'HP', hpAdapter: 'HPA', rod: 'Rod', coupling: '1', head: 'B', overshot: 'C', adapterCoupling: '2', landingRing: '3', outer: '4', inner: '5', shell: 'Rshell', bit: 'Bit' };
export const P006 = B('B', 'P007', 'P016', 'P056', { ...DO, stabilizer: '6', stopRing: '7', lifter: '8', lifterCase: '9' });
const DO3 = { ...DO, split: '6', tripleAdapter: '7', pistonPlug: '8', piston: '9', oring: '10', stabilizer: '11', stopRing: '12', lifter: '13', lifterCase: '14' };
export const P018 = B('N', 'P019', 'P030', 'P056', DO3);
export const P034 = B('H', 'P035', 'P047', 'P058', DO3);
export const P049 = B('P', 'P050', 'P051', 'P058', DO3);

// Excore de surface : 1 tête, 2 overshot, 3 émerillon, 4 adaptateur, 5 bouchon…
const EX = { head: '1', overshot: '2', ws: '3', wsAdapter: '4', hoist: '5', hpAdapter: '6', rod: '7', coupling: '8', adapterCoupling: '9', landingRing: '10', outer: '11', inner: '12', shell: 'Rshell', bit: 'Bit' };
export const P009 = B('B', 'P010', 'P017', 'P056', { ...EX, stabilizer: '13', stopRing: '14', lifter: '15', lifterCase: '16' });
const EX3 = { ...EX, split: '13', tripleAdapter: '14', pistonPlug: '15', piston: '16', oring: '16A', stopRing: '17', lifter: '18', lifterCase: '19', stabilizer: '20' };
export const P021 = B('N', 'P022', 'P032', 'P058', EX3);
export const P038 = B('H', 'P039', 'P048', 'P058', EX3);

// OWL (L-Latch et standard) : la page ne liste que le carottier (sans train de tiges).
const OW = { head: '1', inner: '2', stopRing: '3', lifter: '4', lifterCase: '5', coupling: '6', adapterCoupling: '7', landingRing: '8', outer: '9', stabilizer: '10', shell: 'Rshell' };
export const P012 = B('B', 'P013', null, null, OW);
export const P014 = B('B', 'P015', null, null, OW);
export const P024 = B('N', 'P025', null, null, OW);
export const P026 = B('N', 'P027', null, null, OW);
export const P041 = B('H', 'P042', null, null, OW);
export const P043 = B('H', 'P044', null, null, OW);

// Souterrains : émerillon Pro 18+, presse-étoupe et outil de chargement.
const DU = { ws: 'WS', sb: 'SB', dk: 'DK', rod: 'Rod', coupling: '1', head: 'B', overshot: 'C', loadingTool: 'D', adapterCoupling: '2', landingRing: '3', outer: '4', inner: '5', stabilizer: '6', stopRing: '7', lifter: '8', lifterCase: '9', shell: 'Rshell', bit: 'Bit' };
export const P064 = B('B', 'P065', 'P070', 'P098', DU, { loadingTool: 'P094' });
export const P073 = B('N', 'P074', 'P079', 'P098', DU, { loadingTool: 'P094-NH' });
export const P082 = B('H', 'P083', 'P089', 'P098', DU, { loadingTool: 'P094-NH' });
const EU = { head: '1', overshot: '2', ws: '3', sb: '4', dk: '5', rod: '6', coupling: '7', adapterCoupling: '8', landingRing: '9', outer: '10', inner: '11', stabilizer: '12', stopRing: '13', lifter: '14', lifterCase: '15', shell: 'Rshell', bit: 'Bit' };
export const P067 = B('B', 'P068', 'P069', 'P098', EU);
export const P076 = B('N', 'P077', 'P080', 'P098', EU);
export const P085 = B('H', 'P086', 'P088', 'P098', EU);

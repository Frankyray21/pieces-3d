import { SIZES, layout } from './common.js';

// Carottiers au câble complets (core barrel assemblies) : couronne, alésoir,
// stabilisateur, tube extérieur, bague d'atterrissage, raccord d'adaptation,
// raccord de verrouillage, tige, adaptateur et émerillon d'eau (ou bouchon de
// levage ; presse-étoupe et trousse de dimension en souterrain). Le tube
// intérieur, avec sa tête (sous-assemblage de la page de la tête), son
// arrêtoir, son extracteur et son boîtier d'extracteur, est logé dans le tube
// extérieur ; l'épaulement de la tête repose sur la bague d'atterrissage et ses
// cliquets s'engagent dans le raccord de verrouillage. L'overshot (sous-
// assemblage) est posé au-dessus du train, prêt à saisir la tête.
//
// Chaque élément vissé a son filet mâle en bas et son filet femelle en haut
// (la couronne reçoit l'alésoir, l'alésoir le tube extérieur…) ; le
// stabilisateur et la bague d'atterrissage sont logés au fond des filets
// femelles. Vue rompue comme les dessins du catalogue : tubes et tige
// raccourcis (0,45 m et 0,3 m), coupés au milieu par un trait crénelé.

const PI = Math.PI;
const TUBE = 0.45;
const ROD = 0.3;
const PIN = 0.025; // longueur des filets mâles (environ 1 po)

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
  // Rangées : train (A), tube intérieur et tête (B), overshot, presse-étoupe et
  // trousse (C), outil de chargement (E) ; assez écartées pour que les
  // sous-assemblages éclatés (« Tout éclater ») ne se recouvrent pas.
  const L = layout(api, U, { gap: 0.9, rows: { A: 0, B: -4.2, C: 4.0, E: -8.5 }, anchor: true });
  const has = (role) => R[role] != null;
  const ref = (role) => R[role];
  const lat = (pts, mat) => S.lathe(pts, mat, { axis: 'x', seg: 48 });
  const th = (r, a, b, pitch, o = {}) => S.thread(r, a, b, { pitch, maxTurns: 10, ...o });
  // Filet femelle de a (fond) à b (entrée), parcouru de haut en bas (paroi intérieure d'un profil).
  const boxTh = (r, a, b, pitch) => th(r, a, b, pitch, { chamferBottom: false }).map(([rr, y]) => [2 * r - rr, y]).reverse();
  const add = (role, obj, o) => { if (has(role)) L.add(ref(role), obj, o); return obj; };
  // Sous-assemblage ; un outil pas encore modélisé est remplacé par un cylindre de même encombrement.
  const subOr = (id, len, r, o) => {
    try { return api.sub(id, o); } catch { return S.group(S.cyl(r, len, 'lightGrey', { axis: 'x', pos: [len / 2, 0, 0] })); }
  };
  const placeAt = (g, x) => { const b = new api.THREE.Box3().setFromObject(g); g.position.x = x - b.min.x; return S.group(g); };

  // Tube rompu de x0 à x1 (rayons rO, rI), coupé en xm : deux tronçons aux bords
  // crénelés en vis-à-vis, comme le trait de coupe des dessins.
  const gapW = 0.5 * otO, cren = 0.45 * otO;
  const teeth = (a0) => [0, 1, 2, 3, 4, 5].map((k) => ({ a: a0 + (k * PI) / 3, w: PI / 6 }));
  const broken = (rO, rI, x0, x1, xm, mat) => {
    const a = xm - gapW / 2, b = xm + gapW / 2;
    const tube = (y0, y1, wins) => S.slotted(rO, rI, y0, y1, wins, mat, { axis: 'x', seg: 48 });
    return S.group(
      tube(x0, a - cren, []),
      tube(a - cren, a, teeth(0).map((t) => ({ ...t, y0: a - cren * 0.6, y1: a + 0.001 }))),
      tube(b, b + cren, teeth(PI / 6).map((t) => ({ ...t, y0: b - 0.001, y1: b + cren * 0.6 }))),
      tube(b + cren, x1, []),
    );
  };

  // ---------------------------------------------------------------- tube intérieur et tête
  const tipX = 0.012; // bas du boîtier d'extracteur, dans la couronne
  const case1 = tipX + 0.085;
  const it1 = case1 + TUBE;
  const head = api.sub(cfg.head);
  const A = head.userData.view.anchors;
  const hd = SIZES[cfg.size].D;
  const h0 = it1; // le chapeau (taraudé) se visse sur le filet mâle du haut du tube intérieur
  head.position.x = h0;
  const shX = h0 + A.shoulder;
  const latchX = h0 + A.latch;
  const headTop = h0 + A.top;

  // Boîtier d'extracteur : alésage taraudé en haut (filet mâle du tube intérieur).
  const pinI = itO * 0.95, pinIL = 0.02;
  add('lifterCase', lat([[bitI * 1.02, tipX], [itO * 0.98, tipX], [itO, tipX + 0.006], [itO, case1], ...boxTh(pinI, case1 - pinIL, case1, 0.004), [itI * 1.0, case1 - pinIL], [bitI * 1.12, tipX + 0.03], [bitI * 1.02, tipX + 0.012]], 'darkSteel'), { row: 'B' });
  if (has('lifter')) {
    // Extracteur : bague fendue courte et conique (trois gradins), logée dans le boîtier.
    const l0 = tipX + 0.016, lh = 0.5 * hd;
    const g = S.group(...[1.12, 1.075, 1.03].map((k, i) => S.slotted(bitI * k, bitI * 0.98, l0 + (i * lh) / 3, l0 + ((i + 1) * lh) / 3, [{ a: 0, w: 0.28, y0: 0, y1: 1 }], 'black', { axis: 'x', seg: 40 })));
    add('lifter', g, { row: 'B' });
  }
  // Arrêtoir : au fond du boîtier, sous le tube intérieur (dessiné entre l'extracteur et le tube).
  add('stopRing', S.ring(itI * 1.0, bitI * 1.05, 0.004, 'steel', { axis: 'x', pos: [case1 - pinIL - 0.003, 0, 0] }), { row: 'B', order: case1 - pinIL - 0.01 });
  if (has('inner')) {
    const xm = (Math.max(case1, 0.25) + Math.min(it1, shX)) / 2;
    const g = S.group(
      lat([[itI, case1 - pinIL], ...th(pinI, case1 - pinIL, case1, 0.004, { chamferBottom: true }), [itO, case1 + 0.003], [itO, case1 + 0.01], [itI, case1 + 0.01]], 'lightGrey'),
      broken(itO, itI, case1 + 0.01, it1 - 0.01, xm, 'lightGrey'),
      lat([[itI, it1 - 0.01], [itO, it1 - 0.01], [itO, it1], [pinI, it1], ...th(pinI, it1, it1 + 0.58 * hd, 0.004, { chamferBottom: false }), [itI, it1 + 0.58 * hd]], 'lightGrey'),
    );
    add('inner', g, { row: 'B' });
  }
  // Triple tube (N3, H3, P3) : demi-coquilles dans le tube intérieur, adaptateur, piston.
  const sp0 = case1 + 0.005, sp1 = it1 - 0.09;
  add('split', S.slotted(itI * 0.99, itI * 0.9, sp0, sp1, [{ a: 0, w: 0.05, y0: sp0, y1: sp1 }, { a: PI, w: 0.05, y0: sp0, y1: sp1 }], 'lightGrey', { axis: 'x', seg: 40 }), { row: 'B' });
  add('tripleAdapter', lat([[itI * 0.82, sp0 - 0.012], [itI * 0.99, sp0 - 0.012], [itI * 0.99, sp0 + 0.004], [itI * 0.82, sp0 + 0.004]], 'steel'), { row: 'B' });
  add('pistonPlug', lat([[0, sp1 + 0.03], [itI * 0.6, sp1 + 0.03], [itI * 0.6, sp1 + 0.07], [0, sp1 + 0.07]], 'steel'), { row: 'B' });
  add('piston', lat([[0, sp1 + 0.002], [itI * 0.88, sp1 + 0.002], [itI * 0.88, sp1 + 0.026], [0, sp1 + 0.026]], 'darkSteel'), { row: 'B' });
  add('oring', S.torus(itI * 0.88, 0.0025, 'rubber', { axis: 'x', pos: [sp1 + 0.014, 0, 0] }), { row: 'B' });
  if (has('head')) L.add(ref('head'), head, { row: 'B' });

  // ---------------------------------------------------------------- train extérieur
  const pinO = otO * 0.93; // filet mâle des tubes extérieurs
  const pinR = rodO * 0.9; // filet mâle des tiges et raccords
  const bit1 = 0.07, rs1 = 0.25;
  if (has('bit')) {
    // Couronne : matrice diamantée à canaux d'eau, corps acier peint, filet femelle en haut (alésoir).
    const crown = S.slotted(bitO, bitI, 0, 0.022, [0, 1, 2, 3, 4, 5, 6, 7].map((k) => ({ a: (k * PI) / 4, w: 0.18, y0: -0.001, y1: 0.009 })), 'charcoal', { axis: 'x', seg: 64 });
    const blank = lat([[bitI * 1.02, 0.022], [bitO * 0.99, 0.022], [bitO * 0.97, bit1 - 0.004], [bitO * 0.95, bit1], ...boxTh(pinO, bit1 - PIN, bit1, 0.004), [otI, bit1 - PIN], [bitI * 1.02, 0.03]], 'yellow');
    add('bit', S.group(crown, blank), { row: 'A' });
  }
  if (has('shell')) {
    // Alésoir : filet mâle dans la couronne, bandes diamantées en relief, filet femelle en haut.
    const g = S.group(lat([[otI, bit1 - PIN], ...th(pinO, bit1 - PIN, bit1, 0.004), [otO * 0.98, bit1], [otO * 0.98, rs1], ...boxTh(pinO, rs1 - PIN - 0.012, rs1, 0.004), [otI, rs1 - PIN - 0.012]], 'darkSteel'));
    g.add(S.slotted(bitO * 0.995, otO * 0.97, bit1 + 0.02, rs1 - 0.03, [0, 1, 2, 3, 4, 5].map((k) => ({ a: (k * PI) / 3, w: 0.32, y0: 0, y1: 1 })), 'charcoal', { axis: 'x', seg: 60 }));
    add('shell', g, { row: 'A' });
  }
  // Stabilisateur : bague au fond du filet femelle de l'alésoir, sous le tube extérieur.
  add('stabilizer', lat([[itO * 1.03, rs1 - PIN - 0.012], [pinO * 0.98, rs1 - PIN - 0.012], [pinO * 0.98, rs1 - PIN], [itO * 1.03, rs1 - PIN]], 'steel'), { row: 'A' });
  // Tube extérieur : mâle en bas, femelle en haut ; la bague d'atterrissage
  // au fond du filet femelle porte l'épaulement de la tête.
  const lr1 = shX, lr0 = lr1 - 0.012;
  const ot1 = lr1 + PIN;
  if (has('outer')) {
    const xm = (Math.max(case1, rs1) + Math.min(it1, ot1 - PIN)) / 2;
    add('outer', S.group(
      lat([[otI, rs1 - PIN], ...th(pinO, rs1 - PIN, rs1, 0.004), [otO, rs1], [otO, rs1 + 0.01], [otI, rs1 + 0.01]], 'darkSteel'),
      broken(otO, otI, rs1 + 0.01, lr0 - 0.01, xm, 'darkSteel'),
      lat([[otI, lr0 - 0.01], [otO, lr0 - 0.01], [otO, ot1 - 0.003], [otO * 0.97, ot1], ...boxTh(pinO, lr0, ot1, 0.004), [otI, lr0]], 'darkSteel'),
    ), { row: 'A' });
  }
  add('landingRing', lat([[sh * 0.9, lr0], [pinO * 0.98, lr0], [pinO * 0.98, lr1], [sh * 0.9, lr1]], 'steel'), { row: 'A' });
  // Raccord d'adaptation (mâle dans le tube extérieur), puis raccord de
  // verrouillage autour des cliquets de la tête.
  const lc0 = Math.max(ot1 + 0.1, latchX - 0.09);
  add('adapterCoupling', lat([[rodI, lr1], ...th(pinO, lr1, ot1, 0.004), [otO, ot1], [otO, lc0 - 0.003], [otO * 0.97, lc0], ...boxTh(pinR, lc0 - PIN, lc0, 0.004), [rodI, lc0 - PIN]], 'darkSteel'), { row: 'A' });
  const lc1 = Math.max(lc0 + 0.2, latchX + 0.1);
  if (has('coupling')) {
    // Souterrain : raccord plein, sans fenêtres ni ergot ; surface : fenêtres de lavage.
    const g = S.group(lat([[rodI * 0.98, lc0 - PIN], ...th(pinR, lc0 - PIN, lc0, 0.004), [rodO * 1.02, lc0], [rodO * 1.02, lc1 - 0.003], [rodO, lc1], ...boxTh(pinR, lc1 - PIN, lc1, 0.004), [rodI * 0.98, lc1 - PIN]], cfg.couplingMat || 'black'));
    if (!cfg.ug) g.add(S.slotted(rodO * 1.03, rodO * 1.0, lc0 + 0.03, lc1 - 0.06, [0, 1, 2, 3].map((k) => ({ a: (k * PI) / 2 + PI / 4, w: 0.35, y0: lc0 + 0.06, y1: lc1 - 0.09 })), 'steel', { axis: 'x', seg: 48 }));
    add('coupling', g, { row: 'A' });
  }
  // Tige de forage (tronçon rompu), au-delà du haut de la tête.
  const rd0 = lc1, rd1 = Math.max(rd0 + ROD, headTop + 0.12);
  if (has('rod')) {
    add('rod', S.group(
      lat([[rodI, rd0 - PIN], ...th(pinR, rd0 - PIN, rd0, 0.004), [rodO, rd0], [rodO, rd0 + 0.01], [rodI, rd0 + 0.01]], 'charcoal'),
      broken(rodO, rodI, rd0 + 0.01, rd1 - PIN - 0.005, (rd0 + rd1 - PIN) / 2, 'charcoal'),
      lat([[rodI, rd1 - PIN - 0.005], [rodO, rd1 - PIN - 0.005], [rodO, rd1 - 0.003], [rodO * 0.97, rd1], ...boxTh(pinR, rd1 - PIN, rd1, 0.004), [rodI, rd1 - PIN]], 'charcoal'),
    ), { row: 'A' });
  }
  // Adaptateur d'émerillon (mâle-mâle) et émerillon.
  let top = rd1;
  if (has('wsAdapter')) {
    const a1 = rd1 + 0.11;
    add('wsAdapter', lat([[rodI * 0.5, rd1 - PIN], ...th(pinR, rd1 - PIN, rd1, 0.004), [rodO * 0.96, rd1 + 0.004], [rodO * 0.96, a1 - 0.035], [rodO * 0.7, a1 - 0.03], ...th(rodO * 0.66, a1 - 0.03, a1, 0.004, { chamferBottom: false }), [rodI * 0.5, a1]], 'darkSteel'), { row: 'A' });
    top = a1;
  }
  if (has('ws')) {
    const ws = subOr(cfg.swivel, 0.25, rodO * 1.3);
    const b = new api.THREE.Box3().setFromObject(ws);
    ws.position.x = top - b.min.x - (has('wsAdapter') ? 0.03 : PIN);
    add('ws', ws, { row: 'A' });
  }

  // ---------------------------------------------------------------- outils posés à côté du train
  // Overshot au-dessus, bouche au droit du haut de la tête ; presse-étoupe et
  // trousse de dimension au-dessus de l'émerillon ; bouchon de levage et outil
  // de chargement sous le train.
  // Posés au-dessus du train (y), au droit de leur place : l'overshot au-dessus
  // de la tête, le presse-étoupe et la trousse (qui remplacent l'émerillon pour
  // pomper l'overshot) au-dessus de l'émerillon.
  const beside = (g) => { g.position.y = 2.2 * U; return g; };
  if (has('overshot')) { const o = api.sub(cfg.overshot); o.position.x = headTop + 0.06; add('overshot', beside(o), { row: 'C' }); }
  if (has('sb')) add('sb', beside(placeAt(subOr('P100', 0.3, rodO * 0.8, { part: 'body' }), top - 0.05)), { row: 'C' });
  if (has('dk')) add('dk', beside(placeAt(subOr('P100', 0.1, rodO * 0.8, { part: 'kit' }), top + 0.25)), { row: 'C' });
  if (has('hoist')) {
    const hp = S.group(
      lat([[0, 0.08], [rodO * 0.95, 0.08], [rodO * 0.95, 0.24], [rodO * 0.6, 0.27], [rodO * 0.6, 0.3], [0, 0.3]], 'darkSteel'),
      lat([[rodI * 0.7, 0], [rodO * 0.95, 0], [rodO * 0.95, 0.08], [rodI * 0.7, 0.08]], 'darkSteel'),
      S.torus(rodO * 0.7, rodO * 0.18, 'steel', { axis: 'z', pos: [0.36, 0, 0] }),
    );
    add('hpAdapter', placeAt(lat([[rodI * 0.5, 0], [rodO * 0.92, 0], [rodO * 0.96, 0.004], [rodO * 0.96, 0.08], [rodO * 0.7, 0.085], ...th(rodO * 0.66, 0.085, 0.12, 0.004, { chamferBottom: false }), [rodI * 0.5, 0.12]], 'darkSteel'), rd1), { row: 'E' });
    add('hoist', placeAt(hp, rd1 + 0.15), { row: 'E' });
  }
  if (has('loadingTool')) add('loadingTool', placeAt(subOr(cfg.loadingTool, 0.2, rodO * 0.7), headTop - 0.1), { row: 'E' });

  L.done();
  // Coupe par l'axe du train (plan vertical) ; la vue rompue reste lisible.
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
export const P064 = B('B', 'P065', 'P070', 'P098', DU, { ug: true, loadingTool: 'P094' });
export const P073 = B('N', 'P074', 'P079', 'P098', DU, { ug: true, loadingTool: 'P094-NH' });
export const P082 = B('H', 'P083', 'P089', 'P098', DU, { ug: true, loadingTool: 'P094-NH' });
const EU = { head: '1', overshot: '2', ws: '3', sb: '4', dk: '5', rod: '6', coupling: '7', adapterCoupling: '8', landingRing: '9', outer: '10', inner: '11', stabilizer: '12', stopRing: '13', lifter: '14', lifterCase: '15', shell: 'Rshell', bit: 'Bit' };
export const P067 = B('B', 'P068', 'P069', 'P098', EU, { ug: true });
export const P076 = B('N', 'P077', 'P080', 'P098', EU, { ug: true });
export const P085 = B('H', 'P086', 'P088', 'P098', EU, { ug: true });

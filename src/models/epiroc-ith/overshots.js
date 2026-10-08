import { SIDE, layout, prof } from './common.js';

// Overshots (repêcheurs au câble) : Arrow 3S (têtes DiscovOre) et Excore II
// de sécurité (têtes à lance). Version de surface : émerillon de câble, barre
// de charge, tube et tige de coulisse (jar), manchon de libération, corps à
// cliquets. Version souterraine, courte : corps de clapet portant des joints
// de pompage (l'overshot est poussé par l'eau dans les trous montants).
//
// Repère : axe X, bouche de l'overshot (cliquets) à x = 0, câble vers +X.
// Cotes en multiples du diamètre d de la barre de charge.

const PI = Math.PI;
const UP = 3 * PI / 2;
const DOWN = PI / 2;

// Diamètre de corps selon la taille (passe dans l'alésage des tiges).
const DIA = { B: 0.04, N: 0.05, H: 0.064, P: 0.05, PU: 0.084 };

export function overshot(api, cfg) {
  const S = api.S;
  const { type, ug = false, R } = cfg;
  const d = DIA[cfg.size];
  const L = layout(api, d, { gap: 0.6, rows: { A: 0, B: -2.6, C: 2.4 } });
  const has = (role) => R[role] != null;
  const ref = (role, i = 0) => (Array.isArray(R[role]) ? R[role][Math.min(i, R[role].length - 1)] : R[role]);
  const X = (x, y = 0, z = 0) => [x * d, y * d, z * d];
  const lat = (pts, mat) => S.lathe(prof(d, pts), mat, { axis: 'x', seg: 40 });
  const th = (r, a, b, pitch = 0.09, o = {}) => S.thread(r, a, b, { pitch, maxTurns: 8, ...o });
  const win = (a, w, x0, x1) => ({ a, w, y0: x0 * d, y1: x1 * d });
  const hole = (a, x, r, wall, through = true) => S.roundHole(a, x * d, r * d, wall * d, { through });
  const tube = (rO, rI, x0, x1, wins, mat) => S.slotted(rO * d, rI * d, x0 * d, x1 * d, wins, mat, { axis: 'x', seg: 56 });
  const pinZ = (r, len, x, y = 0, mat = 'steel') => S.cyl(r * d, len * d, mat, { axis: 'z', pos: X(x, y) });
  const add = (role, obj, o = {}) => { if (has(role)) L.add(ref(role, o.i ?? 0), obj, o); return obj; };
  const body = type === 'arrow' ? 'black' : 'darkSteel';
  const lh = cfg.long ?? 1; // facteur de longueur de la barre de charge

  // ---------------------------------------------------------------- bouche et cliquets
  // Corps de l'overshot : fenêtres des cliquets en haut et en bas, entrée conique.
  const b1 = 4.6; // haut du corps
  const dogTop = 3.35; // axe des cliquets
  const bodyRole = type === 'arrow' ? 'body' : 'head';
  if (has(bodyRole)) {
    const wins = [win(UP, 0.8, 0.45, 3.65), win(DOWN, 0.8, 0.45, 3.65), ...hole(0, dogTop, 0.06, 0.5)];
    if (type === 'excore') wins.push(...hole(0, 4.05, 0.05, 0.5));
    const g = S.group(
      lat([[0.33, 0], [0.47, 0], [0.5, 0.06], [0.5, 0.22], [0.36, 0.22]], body),
      tube(0.5, 0.36, 0.2, b1 - 0.6, wins, body),
      lat([[0.2, b1 - 0.62], [0.5, b1 - 0.62], [0.5, b1 - 0.52], [0.44, b1 - 0.46], ...th(0.42, b1 - 0.46, b1, 0.08, { chamferBottom: false }), [0.2, b1]], body),
    );
    add(bodyRole, g, { row: 'A' });
  }
  // Cliquets de levage : pivot en haut, bec en bas qui passe sous la lance.
  if (has('dogs')) {
    for (const s of [1, -1]) {
      const pts = [[0.14, 0.02], [0.14, 0.24], [-1.6, 0.34], [-2.7, 0.32], [-2.9, 0.18], [-2.95, -0.1], [-2.72, -0.16], [-2.55, 0.04], [-1.6, 0.1], [0, -0.1]];
      const g = S.extrude(pts.map(([u, v]) => [(dogTop + u) * d, s * (0.12 + v) * d]), 0.24 * d, type === 'arrow' ? 'steel' : 'lightGrey');
      L.add(ref('dogs'), g, { follow: ref(bodyRole), extra: [0, s * 1.4, 0] });
    }
  }
  if (has('dogPins')) for (const s of [1, -1]) L.add(ref('dogPins'), pinZ(0.055, 1.05, dogTop, s * 0.14), { follow: ref(bodyRole), extra: [0, s * 0.5, 1.4] });
  if (has('pivotPin')) add('pivotPin', S.group(pinZ(0.07, 1.1, dogTop), S.cyl(0.11 * d, 0.06 * d, 'steel', { axis: 'z', pos: X(dogTop, 0, 0.58) })), { follow: ref(bodyRole), extra: [0, 0, 1.6] });
  if (has('pivotRetainer')) add('pivotRetainer', S.washer(0.12 * d, 0.07 * d, 0.03 * d, 'steel', { axis: 'z', pos: X(dogTop, 0, -0.56) }), { follow: ref(bodyRole), extra: [0, 0, -1.4] });
  if (has('retainingRing')) add('retainingRing', S.torus(0.09 * d, 0.015 * d, 'steel', { axis: 'z', pos: X(dogTop, 0, -0.6) }), { follow: ref(bodyRole), extra: [0, 0, -1.8] });
  if (has('dogSpring')) add('dogSpring', S.spring(0.07 * d, 0.016 * d, 0.34 * d, 6, 'steel', { axis: 'y', pos: X(2.6) }), { follow: ref(bodyRole), extra: [0.2, 0, 1.4] });
  if (has('springPin')) add('springPin', pinZ(0.04, 0.95, 4.05), { follow: ref(bodyRole), extra: [0, 0.6, 1.4] });
  if (has('safetyPin')) add('safetyPin', S.group(pinZ(0.05, 1.3, 1.1), S.torus(0.2 * d, 0.025 * d, 'steel', { axis: 'z', pos: X(1.3, 0, 0.72) })), { follow: ref(bodyRole), extra: [0, -0.8, 1.6] });
  if (has('releaseBars')) {
    for (const s of [1, -1]) L.add(ref('releaseBars'), S.box(2.4 * d, 0.07 * d, 0.2 * d, 'steel', { pos: X(2.4, s * 0.47) }), { follow: ref(bodyRole), extra: [0, s * 2.2, 0] });
  }
  if (has('protectionSleeve')) add('protectionSleeve', tube(0.56, 0.5, 3.4, 4.5, [...hole(0, 4.05, 0.06, 0.56)], 'steel'), { row: 'A' });
  if (has('setScrew') && type === 'excore') add('setScrew', S.cyl(0.05 * d, 0.14 * d, 'black', { axis: 'z', pos: X(4.05, 0, 0.53) }), { follow: ref(bodyRole), extra: [0, 0, 1.2] });
  if (has('adapterSleeve')) add('adapterSleeve', tube(0.62, 0.5, -0.4, 1.6, [...hole(0, 1.2, 0.05, 0.62), ...hole(PI / 2, 1.2, 0.05, 0.62)], 'steel'), { row: 'A' });
  if (has('rollPins')) for (const a of [0, PI]) L.add(ref('rollPins'), pinZ(0.04, 0.3, 1.2, 0, 'steel').translateZ(Math.cos(a) * 0.55 * d), { follow: ref('adapterSleeve'), extra: [0, 0.8, 0] });
  if (has('sizeAdapter')) {
    // Adaptateur de taille P : entonnoir à quatre ailettes sous la bouche.
    const g = S.group(lat([[0.36, -1.9], [0.62, -1.9], [0.62, 0.1], [0.5, 0.1], [0.5, -0.15], [0.36, -0.2]], 'darkSteel'));
    for (let k = 0; k < 4; k++) {
      const fin = S.box(1.6 * d, 0.12 * d, 0.45 * d, 'darkSteel', { pos: X(-1.0) });
      fin.rotation.x = (k * PI) / 2;
      fin.translateZ(0.72 * d);
      g.add(fin);
    }
    add('sizeAdapter', g, { row: 'A' });
  }
  if (has('centralizer')) {
    const g = S.group(lat([[0.3, -1.4], [0.56, -1.4], [0.56, 0.05], [0.3, 0.05]], 'lightGrey'));
    for (let k = 0; k < 4; k++) {
      const fin = S.box(1.3 * d, 0.1 * d, 0.32 * d, 'lightGrey', { pos: X(-0.7) });
      fin.rotation.x = (k * PI) / 2 + PI / 4;
      fin.translateZ(0.68 * d);
      g.add(fin);
    }
    add('centralizer', g, { row: 'A' });
  }

  let x = b1;
  if (!ug) surfaceUpper();
  else ugUpper();
  const top = swivel(x);
  L.done();
  return { view: { ...SIDE, anchors: { top: top * d, mouth: (cfg.sizeAdapter ? -1.9 : 0) * d } } };

  // Surface : corps pivot (Arrow) ou tête filetée (Excore), coulisse et barre de charge.
  function surfaceUpper() {
    if (type === 'arrow' && has('pivotBody')) {
      add('pivotBody', lat([[0.2, x - 0.46], [0.36, x - 0.46], [0.42, x - 0.4], [0.5, x - 0.4], [0.5, x + 1.55], [0.44, x + 1.62], [0.2, x + 1.62]], 'black'), { row: 'A' });
    }
    if (has('detent')) add('detent', lat([[0, x + 0.5], [0.09, x + 0.5], [0.09, x + 0.75], [0, x + 0.8]], 'steel'), { row: 'B' });
    if (has('detentSpring')) add('detentSpring', S.spring(0.07 * d, 0.015 * d, 0.4 * d, 7, 'steel', { axis: 'x', pos: X(x + 0.3) }), { row: 'B' });
    if (has('setScrew') && type === 'arrow') add('setScrew', S.cyl(0.06 * d, 0.16 * d, 'black', { axis: 'z', pos: X(x + 1.2, 0, 0.52) }), { follow: ref('pivotBody'), extra: [0, 0, 1.2] });
    if (has('coiledPin')) add('coiledPin', pinZ(0.07, 1.05, x + 0.2), { follow: ref('pivotBody'), extra: [0, 0.8, 1.3] });
    if (has('springPin2')) add('springPin2', pinZ(0.045, 1.0, x + 1.35), { follow: ref('pivotBody'), extra: [0, 0.8, 1.3] });
    const top = type === 'arrow' ? x + 1.62 : x;
    // Tige de coulisse (jar staff) : filet en bas, tête de frappe en haut.
    const js1 = top + 11.5 * lh;
    if (has('jarStaff')) add('jarStaff', lat([[0, top - 0.3], [0.16, top - 0.3], ...th(0.18, top - 0.3, top + 0.25, 0.07, { chamferBottom: false }), [0.17, top + 0.3], [0.17, js1 - 0.5], [0.3, js1 - 0.45], [0.3, js1], [0, js1]], 'steel'), { row: 'B' });
    if (has('jamNut')) add('jamNut', S.nut(0.42 * d, 0.2 * d, 'steel', { axis: 'x', pos: X(top + 0.12) }), { row: 'B' });
    // Tube de coulisse et barre de charge vissés l'un dans l'autre.
    const jt0 = top + 0.35, jt1 = jt0 + 10.6 * lh;
    if (has('jarTube')) add('jarTube', lat([[0.19, jt0], [0.42, jt0], [0.5, jt0 + 0.08], [0.5, jt1 - 0.4], [0.44, jt1 - 0.36], ...th(0.42, jt1 - 0.36, jt1, 0.08, { chamferBottom: false }), [0.34, jt1], [0.34, jt0 + 0.3], [0.19, jt0 + 0.25]], body), { row: 'A' });
    // Manchon de libération (coulisse sur le corps pour ouvrir les cliquets).
    if (has('releaseSleeve')) add('releaseSleeve', tube(0.58, 0.51, 0.9, top + 0.9, [win(0, 0.5, 1.3, 2.6), win(PI, 0.5, 1.3, 2.6), ...hole(0, top + 0.5, 0.07, 0.58)], body), { row: 'B' });
    const sb0 = jt1, sb1 = sb0 + 15.5 * lh;
    if (has('sinkingBar')) add('sinkingBar', lat([[0.22, sb0 - 0.02], [0.46, sb0 - 0.02], [0.5, sb0 + 0.04], [0.5, sb1 - 0.4], [0.44, sb1 - 0.36], ...th(0.4, sb1 - 0.36, sb1, 0.08, { chamferBottom: false }), [0.22, sb1]], body), { row: 'A' });
    x = sb1;
  }

  // Souterrain : clapet et joints de pompage, poussés vers le fond par l'eau.
  function ugUpper() {
    if (type === 'excore') {
      if (has('threadedAdapter')) add('threadedAdapter', lat([[0.2, x - 0.45], [0.38, x - 0.45], [0.42, x - 0.4], [0.47, x], [0.47, x + 0.6], [0.4, x + 0.66], ...th(0.38, x + 0.66, x + 1.0, 0.07, { chamferBottom: false }), [0.2, x + 1.0]], 'black'), { row: 'A' });
      x += 0.66;
      if (has('retainingClip')) add('retainingClip', S.torus(0.38 * d, 0.025 * d, 'steel', { axis: 'x', pos: X(x - 0.2) }), { row: 'B' });
    } else if (has('springPin2')) add('springPin2', pinZ(0.045, 1.0, x - 0.2), { follow: ref(bodyRole), extra: [0, 0.8, 1.3] });
    // Corps de clapet : siège, bille et bague indicatrice, joints de pompage.
    const v0 = x, v1 = x + 3.0;
    const vRole = type === 'excore' ? 'lowerBody' : 'valveBody';
    if (has(vRole)) {
      add(vRole, lat([[0.2, v0 - 0.3], [0.34, v0 - 0.3], [0.38, v0 - 0.26], [0.38, v0], [0.44, v0], [0.44, v1 - 0.5], [0.5, v1 - 0.44], [0.5, v1], [0.3, v1], [0.3, v0 + 0.3], [0.2, v0 + 0.2]], 'black'), { row: 'A' });
    }
    if (has('valveSleeve')) add('valveSleeve', tube(0.52, 0.44, v1 - 0.95, v1 - 0.5, [], 'steel'), { row: 'A' });
    if (has('sealSeat')) add('sealSeat', S.washer(0.5 * d, 0.44 * d, 0.1 * d, 'steel', { axis: 'x', pos: X(v0 + 0.15) }), { row: 'A', gap: 0.3 });
    if (has('backupWasher')) add('backupWasher', S.washer(0.52 * d, 0.44 * d, 0.06 * d, 'steel', { axis: 'x', pos: X(v0 + 0.13) }), { row: 'A', gap: 0.3 });
    const seals = type === 'arrow' ? ['propLower', 'propUpper'] : ['lipSeals', 'lipSeals'];
    const col = type === 'arrow' ? 'blue' : 'yellow';
    seals.forEach((role, k) => {
      if (!has(role)) return;
      const s0 = v0 + 0.25 + k * 0.85;
      L.add(ref(role), lat([[0.44, s0], [0.58, s0], [0.6, s0 + 0.1], [0.55, s0 + 0.75], [0.44, s0 + 0.75]], col), { row: 'A', gap: 0.3 });
    });
    if (has('valveWasher')) add('valveWasher', S.washer(0.44 * d, 0.2 * d, 0.05 * d, 'steel', { axis: 'x', pos: X(v1 - 0.3) }), { row: 'B' });
    if (has('ball')) add('ball', S.ball(0.011, 'chrome', { pos: X(v0 + 0.55) }), { row: 'B' });
    if (has('bushing')) add('bushing', lat([[0.12, v0 + 0.75], [0.28, v0 + 0.75], [0.28, v0 + 1.05], [0.12, v0 + 1.05]], 'lightGrey'), { row: 'B' });
    x = v1;
    if (type === 'excore') {
      if (has('valveCap')) add('valveCap', lat([[0.18, x - 0.35], [0.3, x - 0.35], [0.3, x], [0.48, x], [0.48, x + 0.7], [0.18, x + 0.7]], 'black'), { row: 'A' });
      x += 0.7;
      if (has('lockNut')) add('lockNut', S.nut(0.7 * d, 0.24 * d, 'steel', { axis: 'x', pos: X(x + 0.12) }), { row: 'A' });
      x += 0.24;
    }
  }

  // Émerillon de câble : corps (souterrain), collet, butée, écrous, boulon à œil, manchons de sertissage.
  function swivel(x0) {
    let s0 = x0;
    if (has('swivelBody')) {
      add('swivelBody', lat([[0.16, s0 - 0.35], [0.3, s0 - 0.35], [0.36, s0 - 0.3], [0.36, s0], [0.47, s0 + 0.05], [0.47, s0 + 1.7], [0.4, s0 + 1.75], [0.16, s0 + 1.75]], 'black'), { row: 'A' });
      if (has('shearPin')) add('shearPin', pinZ(0.04, 1.05, s0 - 0.15), { follow: ref('swivelBody'), extra: [0, 0.8, 1.2] });
      s0 += 1.75;
    } else if (has('shearPin')) add('shearPin', pinZ(0.04, 1.05, s0 - 0.15), { row: 'C' });
    const c1 = s0 + 1.5;
    if (has('collar')) add('collar', lat([[0.2, s0], [0.47, s0], [0.47, c1 - 0.08], [0.4, c1], [0.2, c1], [0.2, c1 - 0.3], [0.32, c1 - 0.35], [0.32, s0 + 0.25], [0.2, s0 + 0.2]], 'darkSteel'), { row: 'A' });
    if (has('grease')) add('grease', S.at(S.fitting(0.12 * d, 0.24 * d, 'brass'), X(s0 + 0.75, 0.47)), { follow: ref('collar'), extra: [0, 0.8, 0] });
    if (has('bearing')) add('bearing', S.bearing(0.3 * d, 0.15 * d, 0.16 * d, 'steel', { thrust: true, axis: 'x', pos: X(c1 - 0.45) }), { row: 'B' });
    if (has('nuts')) for (const k of [0, 1]) L.add(ref('nuts'), S.nut(0.38 * d, 0.18 * d, 'steel', { axis: 'x', pos: X(s0 + 0.5 + k * 0.2) }), { row: 'B', gap: 0.25 });
    // Boulon à œil : tige filetée, épaulement, œil en haut.
    const e1 = c1 + 1.3;
    if (has('eyeBolt')) {
      add('eyeBolt', S.group(
        lat([[0, s0 + 0.3], [0.14, s0 + 0.3], ...th(0.16, s0 + 0.3, s0 + 1.0, 0.06), [0.16, c1 - 0.5], [0.28, c1 - 0.48], [0.28, c1 - 0.38], [0.16, c1 - 0.36], [0.16, e1 - 0.3], [0, e1 - 0.3]], 'steel'),
        S.torus(0.24 * d, 0.1 * d, 'steel', { axis: 'z', pos: X(e1) }),
      ), { row: 'A' });
    }
    if (has('sleeves')) {
      for (const k of [0, 1]) {
        const sl = S.box(0.38 * d, 0.24 * d, 0.36 * d, 'copper', { r: 0.1 * d, pos: X(e1 + 0.75 + k * 0.6) });
        L.add(ref('sleeves'), sl, { row: 'C' });
      }
    }
    const top = has('sleeves') ? e1 + 1.5 : e1 + 0.35;
    if (has('releaseTool')) {
      const tool = S.group(
        S.cyl(0.08 * d, 2.6 * d, 'black', { axis: 'x', pos: X(e1 - 1.5, 3.2) }),
        S.cyl(0.11 * d, 1.4 * d, 'black', { axis: 'y', pos: X(e1 - 0.15, 3.2) }),
      );
      add('releaseTool', tool, { follow: ref('collar'), extra: [0, 0.4, 0] });
    }
    return top;
  }
}

// ---------------------------------------------------------------- pages du catalogue

const O = (size, type, R, o = {}) => (api) => overshot(api, { size, type, R, ...o });

// Arrow 3S de surface : 1 manchons … 21 corps, 22 outil de libération.
export const P016 = O('B', 'arrow', { sleeves: '1', eyeBolt: '2', collar: '3', bearing: '4', nuts: '5', grease: '6', sinkingBar: '7', jarTube: '8', releaseSleeve: '9', jarStaff: '10', jamNut: '11', setScrew: '12', pivotBody: '13', detentSpring: '14', detent: '15', springPin2: '16', coiledPin: '17', dogPins: '17', dogSpring: '18', dogs: '19', body: '20', releaseTool: '21' }, { long: 0.9 });
const A3S = { sleeves: '1', eyeBolt: '2', collar: '3', bearing: '4', nuts: '5', grease: '6', sinkingBar: '7', jarTube: '8', releaseSleeve: '9', jarStaff: '10', jamNut: '11', setScrew: '12', pivotBody: '13', detentSpring: '14', detent: '15', coiledPin: '16', springPin2: '17', dogPins: '18', dogSpring: '19', dogs: '20', body: '21', releaseTool: '22', sizeAdapter: '23' };
export const P030 = O('N', 'arrow', A3S);
export const P047 = O('N', 'arrow', A3S);
export const P051 = O('N', 'arrow', A3S);

// Excore II de surface.
export const P017 = O('B', 'excore', { sleeves: '1', eyeBolt: '2', bearing: '3', collar: '4', nuts: '5', grease: '6', sinkingBar: '7', jarTube: '8', releaseSleeve: '9', jarStaff: '10', jamNut: '11', dogSpring: '12', protectionSleeve: '13', setScrew: '14', head: '15', pivotPin: '16', springPin: '17', releaseBars: '18', dogs: '19' }, { long: 0.9 });
const EX2 = { sleeves: '1', eyeBolt: '2', collar: '3', bearing: '4', nuts: '5', grease: '6', sinkingBar: '7', jarTube: '8', releaseSleeve: '9', jarStaff: '10', dogSpring: '11', springPin: '12', head: '13', pivotRetainer: '14', retainingRing: '15', pivotPin: '16', dogs: '17', safetyPin: '18', setScrew: '19', releaseTool: '20', jamNut: '21' };
export const P032 = O('N', 'excore', EX2);
export const P048 = O('H', 'excore', { ...EX2, adapterSleeve: '22', rollPins: '23' });

// Souterrains.
export const P069 = O('B', 'excore', { sleeves: '1', eyeBolt: '2', collar: '3', bearing: '4', nuts: '5', grease: '6', swivelBody: '7', shearPin: '8', valveCap: '9', lockNut: '10', lipSeals: '11', sealSeat: '12', ball: '13', bushing: '14', lowerBody: '15', threadedAdapter: '16', retainingClip: '17', pivotRetainer: '18', dogSpring: '19', springPin: '20', pivotPin: '21', dogs: '22', head: '23' }, { ug: true });
export const P070 = O('B', 'arrow', { sleeves: '1', eyeBolt: '2', collar: '3', bearing: '4', nuts: '5', swivelBody: '6', grease: '7', valveBody: '8', shearPin: '9', propUpper: '10', propLower: '11', valveSleeve: '12', ball: '13', bushing: '14', body: '15', dogPins: '16', dogSpring: '17', dogs: '18' }, { ug: true });
export const P071 = O('B', 'excore', { sleeves: '1', eyeBolt: '2', bearing: '3', collar: '4', nuts: '5', swivelBody: '6', grease: '7', shearPin: '8', valveCap: '9', lockNut: '10', lipSeals: '11', sealSeat: '12', ball: '13', bushing: '14', lowerBody: '15', threadedAdapter: '16', head: '17', springPin: '18', protectionSleeve: '19', dogSpring: '20', pivotPin: '21', releaseBars: '22', dogs: '23' }, { ug: true });
export const P079 = O('N', 'arrow', { sleeves: '1', eyeBolt: '2', collar: '3', bearing: '4', nuts: '5', swivelBody: '6', grease: '7', shearPin: '8', valveBody: '9', propUpper: '10', propLower: '11', bushing: '12', ball: '13', springPin2: '14', dogPins: '15', dogSpring: '16', dogs: '17', body: '18' }, { ug: true });
const EX2U = { sleeves: '1', eyeBolt: '2', collar: '3', bearing: '4', nuts: '5', grease: '6', swivelBody: '7', shearPin: '8', valveCap: '9', lockNut: '10', lipSeals: '11', valveWasher: '12', sealSeat: '13', ball: '14', bushing: '15', lowerBody: '16', threadedAdapter: '17', dogSpring: '18', springPin: '19', head: '20', pivotRetainer: '21', retainingRing: '22', pivotPin: '23', dogs: '24' };
export const P080 = O('N', 'excore', EX2U, { ug: true });
export const P088 = O('H', 'excore', { ...EX2U, adapterSleeve: '25', rollPins: '26' }, { ug: true });
export const P089 = O('H', 'arrow', { sleeves: '1', eyeBolt: '2', collar: '3', bearing: '4', nuts: '5', swivelBody: '6', grease: '7', shearPin: '8', valveBody: '9', propUpper: '10', propLower: '11', backupWasher: '12', bushing: '13', ball: '14', springPin2: '15', dogPins: '16', dogSpring: '17', dogs: '18', body: '19' }, { ug: true });
export const P091 = O('PU', 'arrow', { body: '1', dogs: '2', centralizer: '3', dogPins: '4', springPin2: '5', dogSpring: '6', bushing: '7', ball: '8', backupWasher: '9', propLower: '10', propUpper: '11', valveSleeve: '12', shearPin: '13', valveBody: '14', grease: '15', swivelBody: '16', sleeves: '18', eyeBolt: '19', collar: '20', bearing: '21', nuts: '22' }, { ug: true });

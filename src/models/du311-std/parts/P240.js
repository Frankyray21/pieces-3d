// P240 — Capot moteur CX030876 rév. 2 (pages 240 à 244) : « ASSY, ENGINE
// CANOPY, DU311 », repère 4 de P220. Ossature : quatre poteaux mécano-
// soudés (20 arrière droit, 21 arrière gauche, 23 avant droit, 24 avant
// gauche) vissés par équerres contre les longerons, chacun avec sa moitié de
// passage de roue (jupe intérieure et plancher au-dessus des roues) ; poutres
// supérieures en U droite (31, porte le refroidisseur P270) et gauche (32)
// sur les traverses de tête (cornières 9 à l'avant, rebord du panneau
// arrière à l'arrière) et les consoles 8 ; panneau arrière à persiennes (22,
// sortie d'air du radiateur) ; tôle d'appui avant (30) et console du coffret
// électrique (39). Porte supérieure (17) articulée sur la poutre gauche,
// soulevée par deux vérins à gaz (3) sur pivots (29) et réglages (28),
// équerre de support (14), béquille (15) et son pivot (16), tirant (33),
// verrou (34) et rondelle d'appui (35) de rabattement ; portes latérales
// droite (18) et gauche (19) à persiennes, articulées en haut sur les
// poutres, vérins à gaz 500 mm (5) sur consoles (25), chaînes de retenue sur
// manilles (7), gâches (4) sur platines (10) ; joint de porte (13) et sa
// contre-plaque (12) le long du bord avant contre la cabine, joint (26) et
// plat de serrage (27) le long du bord arrière ; prise d'air : chapeau (2),
// collier Ø 5 1/2 po (1), adaptateur (40) et sa console (11) ; ligne de
// raccords 1 po sur le poteau 20 : console (36), tube coudé (37), coupleurs
// (38), raccords tournants (6), coudes (42, 41), mamelons (43) ; boulonnerie
// 1/4, 3/8 et 1/2 po (44 à 67).
// Repère : REPÈRE MACHINE (../layout.js), posé à l'identité par P220 ;
// enveloppe de M.engine conservée (x −2.75 → −1.1, dessus à 1.95, 1,96 m de
// large au-dessus des roues, 1,24 m entre les roues jusqu'au châssis).
// Encombrement 1.66 × 1.18 (Y, de 0.95 à 2.13 avec le chapeau) × 1.97 m.
// Cotes : enveloppe de ../carrier.js, poteaux, poutres et portes d'après les
// vues des pages 240 à 244 et 252, quincaillerie d'après la liste.
import { M } from '../layout.js';
import { HC, AIR, IN, u, bolt, nut, washer, washerT, pose, tBoltClamp, fitElbow, fitStraight } from './_engine.js';

export default function P240(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, at, group, merged, extrude, tube } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const X0 = M.engine.x0, X1 = M.engine.x1, TOP = M.engine.top;
  const ZW = 0.98, ZB = 0.62, YB = 1.205, YF = M.frameTop, FZ = M.frameZ;
  const PX = [-2.715, -1.16], PZ = 0.6, PW = 0.06, PY1 = 1.83; // poteaux
  const BZ = 0.7786, BY0 = 1.87, BY1 = 1.935; // poutres en U : face extérieure de l'âme, bas, haut
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  // Tôle plane : contour (plan XY local), trous en polygones, épaisseur t selon Z local.
  const sheet = (outer, holes, t, mat) => {
    const sh = new THREE.Shape(V2(outer));
    for (const h of holes) sh.holes.push(new THREE.Path(V2([...h].reverse())));
    return S.merged([new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false, curveSegments: 6 }))], mat);
  };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const sideOf = (s) => (s > 0 ? 'R' : 'L');

  // ================================================================ poteaux 20, 21, 23, 24
  // Tube carré 60 × 60, équerre de pied vissée contre la face extérieure du
  // longeron, moitié de jupe intérieure (z ±0.62) et de plancher au-dessus des roues.
  const xMid = (X0 + X1) / 2;
  const post = (x, s, front) => {
    const z = s * PZ;
    const parts = [
      box(PW, PY1 - YF, PW, 'lightGrey', { pos: [x, (PY1 + YF) / 2, z] }),
      box(0.012, PW, PW, 'lightGrey', { pos: [x, PY1 + 0.006, z] }),
      box(0.1, 0.012, PZ - FZ + 0.05, 'lightGrey', { pos: [x, YF + 0.006, s * (FZ + PZ) / 2] }),
      box(0.1, 0.11, 0.012, 'lightGrey', { pos: [x, YF - 0.055, s * (FZ + 0.021)] }),
      box(0.008, 0.08, 0.08, 'lightGrey', { pos: [x, YF + 0.05, s * (PZ - 0.07)] }),
    ];
    const xa = front ? xMid : X0 + 0.005, xb = front ? X1 - 0.005 : xMid;
    parts.push(box(xb - xa, YB - YF, 0.004, 'lightGrey', { pos: [(xa + xb) / 2, (YB + YF) / 2, s * ZB] }));
    parts.push(box(xb - xa, 0.004, ZW - ZB - 0.003, 'lightGrey', { pos: [(xa + xb) / 2, YB - 0.002, s * (ZB + ZW - 0.003) / 2] }));
    parts.push(box(xb - xa, 0.03, 0.004, 'lightGrey', { pos: [(xa + xb) / 2, YB - 0.017, s * (ZW - 0.005)] }));
    return group(merged(parts, 'lightGrey'), S.weld([[x - PW / 2, YF + 0.012, z - s * PW / 2], [x + PW / 2, YF + 0.012, z - s * PW / 2]], 0.006, 'lightGrey'));
  };
  P('20', post(PX[0], 1, false), [-0.15, 0, 0.25]);
  P('21', post(PX[0], -1, false), [-0.15, 0, -0.25]);
  P('23', post(PX[1], 1, true), [0.15, 0, 0.25]);
  P('24', post(PX[1], -1, true), [0.15, 0, -0.25]);

  // ================================================================ 22 — panneau arrière à persiennes
  // Tôle sur toute la largeur (étroite sous 1.205, large au-dessus), grille de
  // fentes à volets derrière le radiateur, cadre, rebord supérieur en cornière (traverse de tête arrière).
  {
    const outer = [[-ZB, YF], [ZB, YF], [ZB, YB], [ZW - 0.02, YB], [ZW - 0.02, 1.78], [0.8, BY0 - 0.04], [-0.8, BY0 - 0.04], [-(ZW - 0.02), 1.78], [-(ZW - 0.02), YB], [-ZB, YB]];
    const slots = [], blades = [];
    for (let r = 0; r < 14; r++) for (let c = 0; c < 8; c++) {
      const zc = -0.455 + c * 0.13, yc = 1.08 + r * 0.05;
      slots.push(rect(zc - 0.05, yc - 0.012, zc + 0.05, yc + 0.012));
      blades.push(box(0.016, 0.003, 0.1, 'lightGrey', { pos: [X0 + 0.012, yc + 0.006, zc], rot: [0, 0, -0.7] }));
    }
    const pan = sheet(outer.map(([z, y]) => [z, y]), slots.map((h) => h.map(([z, y]) => [z, y])), 0.003, 'lightGrey');
    pan.rotation.y = Math.PI / 2; // X local → −Z machine… corrigé par le contour en −z
    pan.scale.x = -1;
    pan.position.x = X0 + 0.003;
    const fr = [
      box(0.03, 0.006, 1.6, 'lightGrey', { pos: [X0 + 0.015, BY0 - 0.043, 0] }),
      box(0.006, 0.04, 1.6, 'lightGrey', { pos: [X0 + 0.006, BY0 - 0.02, 0] }),
      box(0.025, 0.003, 1.1, 'lightGrey', { pos: [X0 + 0.0125, 1.055, 0] }),
      box(0.025, 0.003, 1.1, 'lightGrey', { pos: [X0 + 0.0125, 1.78, 0] }),
    ];
    P('22', group(pan, merged([...blades, ...fr], 'lightGrey')), [-0.4, 0, 0]);
  }

  // ================================================================ 9 — cornières de tête avant (deux), 8 — consoles (huit)
  for (const s of [-1, 1]) P('9', group(merged([
    box(0.05, 0.005, 0.24, 'lightGrey', { pos: [PX[1], BY0 - 0.0025, s * 0.68] }),
    box(0.005, 0.04, 0.24, 'lightGrey', { pos: [PX[1] + 0.0275, BY0 - 0.02, s * 0.68] }),
  ], 'lightGrey')), [0.1, 0.15, s * 0.1]);
  const brackets = [];
  for (const x of PX) for (const s of [-1, 1]) for (const k of [-1, 1]) brackets.push([x + k * (PW / 2 + 0.004), s]);
  for (const [x, s] of brackets) P('8', group(merged([
    box(0.008, 0.08, 0.1, 'lightGrey', { pos: [x, PY1 - 0.03, s * (PZ + 0.07)] }),
    box(0.008, 0.01, 0.1, 'lightGrey', { pos: [x, PY1 + 0.005, s * (PZ + 0.07)] }),
  ], 'lightGrey')), [0, 0.12, s * 0.12]);

  // ================================================================ 31, 32 — poutres supérieures en U
  for (const s of [1, -1]) {
    const L = X1 - X0 - 0.01;
    P(s > 0 ? '31' : '32', group(merged([
      box(L, BY1 - BY0, 0.005, 'lightGrey', { pos: [xMid, (BY0 + BY1) / 2, s * (BZ - 0.0025)] }),
      box(L, 0.005, 0.05, 'lightGrey', { pos: [xMid, BY0 + 0.0025, s * (BZ - 0.025)] }),
      box(L, 0.005, 0.05, 'lightGrey', { pos: [xMid, BY1 - 0.0025, s * (BZ - 0.025)] }),
      ...PX.map((x) => box(0.006, BY1 - BY0, 0.05, 'lightGrey', { pos: [x, (BY0 + BY1) / 2, s * (BZ - 0.025)] })),
    ], 'lightGrey')), [0, 0.3, s * 0.2]);
  }

  // ================================================================ 30 — tôle d'appui avant, 39 — console du coffret électrique
  P('30', group(merged([
    box(0.004, 0.44, 2 * ZB, 'lightGrey', { pos: [X1 - 0.002, YF + 0.22, 0] }),
    box(0.03, 0.004, 2 * ZB, 'lightGrey', { pos: [X1 - 0.015, YF + 0.44, 0] }),
  ], 'lightGrey')), [0.35, 0, 0]);
  const jb = [X1 - 0.004, 1.3, -0.35];
  P('39', group(merged([
    box(0.006, 0.16, 0.2, 'black', { pos: [jb[0] - 0.003, jb[1], jb[2]] }),
    box(0.06, 0.006, 0.2, 'black', { pos: [jb[0] - 0.03, jb[1] - 0.08, jb[2]] }),
  ], 'black')), [0.3, 0, -0.1]);

  // ================================================================ portes latérales 18 (droite) et 19 (gauche)
  // Tôle verticale à grille de persiennes, dessus cintré jusqu'à la charnière
  // continue sur la poutre, retours d'extrémités et bas, raidisseurs, serrures.
  const RC = 0.18, YV = BY1 + 0.015 - RC; // rayon du cintrage, haut de la partie verticale
  const doorBody = (s) => {
    const L = X1 - X0 - 0.01, xa = X0 + 0.005;
    const slots = [], blades = [];
    for (let r = 0; r < 10; r++) for (let c = 0; c < 6; c++) {
      const xc = -2.6 + c * 0.11 + (r % 2) * 0.055, yc = 1.3 + r * 0.042;
      if (xc > -1.98) continue;
      slots.push(rect(xc - 0.045, yc - 0.011, xc + 0.045, yc + 0.011));
      blades.push(box(0.09, 0.003, 0.016, 'lightGrey', { pos: [xc, yc + 0.005, s * (ZW - 0.01)], rot: [s * 0.7, 0, 0] }));
    }
    const plate = sheet(rect(xa, YB, xa + L, YV), slots, 0.003, 'lightGrey');
    plate.position.z = s > 0 ? ZW - 0.003 : -ZW;
    // Dessus cintré : profil (z, y) extrudé selon X.
    const arc = [];
    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * (Math.PI / 2);
      arc.push([ZW - RC + Math.cos(a) * RC, YV + Math.sin(a) * RC]);
    }
    arc.push([BZ + 0.01, BY1 + 0.015]);
    const inner = arc.map(([z, y], i) => (i < arc.length - 1 ? [ZW - RC + (z - (ZW - RC)) * (RC - 0.003) / RC, YV + (y - YV) * (RC - 0.003) / RC] : [z, y - 0.003])).reverse();
    const top = extrude([...arc, ...inner].map(([z, y]) => [s * z, y]), L, 'lightGrey');
    top.rotation.y = Math.PI / 2;
    if (s > 0) top.scale.z = -1;
    top.position.x = xa + L / 2;
    const ret = [
      box(L, 0.003, 0.035, 'lightGrey', { pos: [xa + L / 2, YB + 0.0015, s * (ZW - 0.0175)] }),
      ...[xa + 0.0015, xa + L - 0.0015].map((x) => box(0.003, YV - YB, 0.035, 'lightGrey', { pos: [x, (YB + YV) / 2, s * (ZW - 0.0175)] })),
      ...[-2.4, -1.85, -1.4].map((x) => box(0.03, YV - YB - 0.04, 0.02, 'lightGrey', { pos: [x, (YB + YV) / 2, s * (ZW - 0.013)] })),
    ];
    // Serrures à quart de tour (pênes intérieurs) et poignée encastrée.
    const lock = [];
    for (const x of [-2.6, -2.2, -1.8, -1.4]) lock.push(box(0.03, 0.04, 0.02, 'darkSteel', { pos: [x, 1.3, s * (ZW - 0.013)] }));
    const hinge = [];
    for (let i = 0; i < 16; i++) hinge.push(cyl(0.0065, L / 16 - 0.002, 'zinc', { axis: 'x', seg: 10, pos: [xa + (i + 0.5) * L / 16, BY1 + 0.006, s * (BZ + 0.004)] }));
    hinge.push(box(L, 0.002, 0.03, 'zinc', { pos: [xa + L / 2, BY1 + 0.001, s * (BZ - 0.012)] }));
    return group(plate, top, merged([...blades, ...ret], 'lightGrey'), merged(lock, 'darkSteel'), merged(hinge, 'zinc'));
  };
  P('18', doorBody(1), [0, 0.15, 0.45]);
  P('19', doorBody(-1), [0, 0.15, -0.45]);

  // ================================================================ 17 — porte supérieure
  // Tôle à rebords tombés, raidisseurs en U dessous, trou de la prise d'air,
  // charnière continue côté gauche, poignée de rabattement côté droit.
  {
    const L = X1 - X0 - 0.01, xa = X0 + 0.005, zh = BZ - 0.02;
    const holes = [Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return [AIR.x + Math.cos(a) * 0.08, AIR.inZ + Math.sin(a) * 0.08]; })];
    const pl = sheet(rect(xa, -zh, xa + L, zh), holes.map((h) => h.map(([x, z]) => [x, z])), 0.003, 'lightGrey');
    pl.rotation.x = Math.PI / 2; // plan XY local → plan XZ (Y local → +Z)
    pl.position.y = TOP;
    const parts = [
      box(L, 0.025, 0.003, 'lightGrey', { pos: [xa + L / 2, TOP - 0.0125, zh - 0.0015] }),
      box(L, 0.025, 0.003, 'lightGrey', { pos: [xa + L / 2, TOP - 0.0125, -zh + 0.0015] }),
      ...[xa + 0.0015, xa + L - 0.0015].map((x) => box(0.003, 0.025, 2 * zh, 'lightGrey', { pos: [x, TOP - 0.0125, 0] })),
      ...[-2.45, -1.95, -1.45].map((x) => box(0.04, 0.012, 2 * zh - 0.02, 'lightGrey', { pos: [x, TOP - 0.009, 0] })),
    ];
    const hinge = [];
    for (let i = 0; i < 14; i++) hinge.push(cyl(0.006, L / 14 - 0.002, 'zinc', { axis: 'x', seg: 10, pos: [xa + (i + 0.5) * L / 14, TOP - 0.006, -zh + 0.01] }));
    const handle = tube([[-1.2, TOP + 0.001, zh - 0.05], [-1.2, TOP + 0.03, zh - 0.05], [-1.3, TOP + 0.03, zh - 0.05], [-1.3, TOP + 0.001, zh - 0.05]], 0.006, 'black', { sharp: true, seg: 3, radial: 8 });
    P('17', group(pl, merged(parts, 'lightGrey'), merged(hinge, 'zinc'), handle), [0, 0.45, 0]);
  }

  // ================================================================ prise d'air : 40 adaptateur, 11 console, 2 chapeau, 1 collier
  const IA = [AIR.x, 0, AIR.inZ];
  P('40', group(merged([
    lathe([[0.073, 1.905], [0.076, 1.905], [0.076, TOP - 0.004], [0.11, TOP - 0.004], [0.11, TOP + 0.004], [0.066, TOP + 0.006], [0.0635, TOP + 0.012], [0.0635, 2.05], [0.0605, 2.05], [0.0605, TOP + 0.012], [0.073, TOP]], 'zinc', { seg: 32, pos: IA }),
  ], 'zinc')), [0, 0.3, 0]);
  P('11', group(merged([
    box(0.2, 0.006, 0.2, 'black', { pos: [IA[0], TOP - 0.032, IA[2]] }),
    ...[-1, 1].map((k) => box(0.006, 0.03, 0.2, 'black', { pos: [IA[0] + k * 0.097, TOP - 0.017, IA[2]] })),
  ], 'black')), [0, 0.2, 0]);
  P('2', group(
    lathe([[0, 2.06], [0.15, 2.06], [0.152, 2.066], [0.14, 2.09], [0.1, 2.11], [0.04, 2.12], [0, 2.12]], 'black', { seg: 40, pos: IA }),
    lathe([[0.066, 2.0], [0.07, 2.0], [0.07, 2.062], [0.066, 2.062]], 'black', { seg: 28, pos: IA }),
    merged(Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return box(0.01, 0.06, 0.004, 'black', { pos: [IA[0] + Math.cos(a) * 0.1, 2.035, IA[2] + Math.sin(a) * 0.1], rot: [0, -a, 0] }); }), 'black'),
  ), [0, 0.5, 0]);
  P('1', at(group(tBoltClamp(S, 0.142)), [IA[0], 2.03, IA[2]]), [0, 0.4, 0]);

  // ================================================================ 3 — vérins à gaz de la porte supérieure, 29 pivots, 28 réglages
  const gas = (a, b, rb, rr) => {
    const d = b.map((v, i) => v - a[i]), L = Math.hypot(...d);
    return pose(THREE, group(
      cyl(rb, L * 0.56, 'black', { seg: 16, pos: [0, 0.03 + L * 0.28, 0] }),
      cyl(rr, L * 0.4, 'chrome', { seg: 10, pos: [0, L * 0.58 + L * 0.2 - 0.012, 0] }),
      merged([0.012, L - 0.012].map((y) => S.ball(0.0085, 'steel', { pos: [0, y, 0] })), 'steel'),
    ), a, d);
  };
  for (const x of [PX[0] + 0.07, PX[1] - 0.07]) {
    const pA = [x, 1.56, -(PZ - 0.045)], pB = [x, TOP - 0.025, -0.45];
    P('3', gas(pA, pB, 0.011, 0.0045), [0, 0.2, -0.1]);
    P('29', group(merged([box(0.05, 0.06, 0.008, 'black', { pos: [x, 1.56, -(PZ - PW / 2 - 0.004)] }), cyl(0.008, 0.03, 'steel', { axis: 'z', seg: 10, pos: [x, 1.56, -(PZ - 0.045)] })], 'black')), [0, 0, 0.15]);
    P('28', group(merged([box(0.045, 0.03, 0.04, 'black', { pos: [x, TOP - 0.02, -0.45] }), cyl(0.006, 0.05, 'steel', { axis: 'x', seg: 10, pos: [x, TOP - 0.025, -0.45] })], 'black')), [0, 0.3, 0]);
  }
  // 55 — vis 1/2 × 4 1/4 des pivots au travers des poteaux, 67 écrous nylstop (59 plate sous l'un, 62 Grower sous l'autre tête).
  {
    const d = 0.5;
    PX.forEach((x0, i) => {
      const x = i === 0 ? x0 + 0.07 : x0 - 0.07;
      const zH = -(PZ - PW / 2 - 0.008);
      if (i === 0) P('59', pose(THREE, washer(S, d), [x, 1.56, zH], [0, 0, 1]), [0, 0, 0.1]);
      else P('62', pose(THREE, washer(S, d, 'split'), [x, 1.56, zH], [0, 0, 1]), [0, 0, 0.1]);
      P('55', pose(THREE, bolt(S, d, 4.25), [x, 1.56, zH + (i === 0 ? washerT(d) : washerT(d, 'split'))], [0, 0, 1]), [0, 0, 0.15]);
      P('67', pose(THREE, nut(S, d, { nylon: true }), [x, 1.56, -(PZ + PW / 2 + 0.06)], [0, 0, -1]), [0, 0, -0.12]);
    });
  }

  // ================================================================ 5 — vérins à gaz des portes latérales, 25 consoles, 7 manilles
  for (const s of [1, -1]) {
    const pA = [PX[1] - 0.05, 1.42, s * (PZ + PW / 2 + 0.03)], pB = [PX[1] - 0.12, YV + 0.02, s * (ZW - 0.05)];
    P('5', gas(pA, pB, 0.01, 0.004), [0, 0.15, s * 0.2]);
    P('25', group(merged([box(0.06, 0.07, 0.006, 'black', { pos: [PX[1] - 0.05, 1.42, s * (PZ + PW / 2 + 0.003)] }), box(0.06, 0.006, 0.035, 'black', { pos: [PX[1] - 0.05, 1.39, s * (PZ + PW / 2 + 0.02)] })], 'black')), [0, 0, s * 0.15]);
    // Manille 1/4 po et chaîne de retenue (huit maillons) vers la porte.
    const sh = [PX[0] + 0.06, 1.62, s * (PZ + PW / 2 + 0.01)];
    const links = [];
    for (let i = 0; i < 8; i++) {
      const p = [sh[0] + 0.01 * i, sh[1] + 0.03 * i, sh[2] + s * 0.03 * i];
      const l = S.torus(0.009, 0.0025, 'zinc', { axis: i % 2 ? 'x' : 'z' });
      l.position.set(...p);
      links.push(l);
    }
    P('7', group(
      merged([S.torus(0.012, 0.0032, 'zinc', { axis: 'x' }), cyl(0.004, 0.03, 'zinc', { axis: 'z', seg: 8 })].map((o) => { o.position.set(...sh); return o; }), 'zinc'),
      merged(links, 'zinc'),
    ), [0, 0, s * 0.15]);
  }
  // Rotules des vérins 5 : 58 plates, 61 Grower, 64 écrous (quatre rotules).
  {
    const d = 0.375, tF = washerT(d), tS = washerT(d, 'split');
    for (const s of [1, -1]) for (const p of [[PX[1] - 0.05 - 0.015, 1.42, s * (PZ + PW / 2 + 0.03)], [PX[1] - 0.12 - 0.015, YV + 0.02, s * (ZW - 0.05)]]) {
      P('58', pose(THREE, washer(S, d), p, [-1, 0, 0]), [-0.05, 0, 0]);
      P('61', pose(THREE, washer(S, d, 'split'), [p[0] - tF, p[1], p[2]], [-1, 0, 0]), [-0.06, 0, 0]);
      P('64', pose(THREE, nut(S, d), [p[0] - tF - tS, p[1], p[2]], [-1, 0, 0]), [-0.07, 0, 0]);
    }
  }

  // ================================================================ 4 — gâches, 10 — platines de gâche
  const strikers = [];
  for (const x of PX) for (const s of [1, -1]) strikers.push([x, s]);
  for (const [x, s] of strikers) {
    const z0 = s * (PZ + PW / 2);
    P('10', group(merged([box(0.07, 0.09, 0.008, 'zinc', { pos: [x, 1.3, z0 + s * 0.004] })], 'zinc')), [0, 0, s * 0.1]);
    P('4', at(cyl(0.008, 0.11, 'steel', { axis: 'z', seg: 12 }), [x, 1.31, z0 + s * 0.063]), [0, 0, s * 0.2]);
  }

  // ================================================================ 14, 15, 16, 33, 34, 35 — rabattement de la porte supérieure (avant droit)
  const xr = PX[1] - 0.04, zr = PZ - 0.04;
  P('14', group(merged([box(0.05, 0.005, 0.12, 'lightGrey', { pos: [xr, PY1 - 0.06, zr + 0.06] }), box(0.005, 0.05, 0.12, 'lightGrey', { pos: [xr + 0.0225, PY1 - 0.085, zr + 0.06] })], 'lightGrey')), [0.1, 0, 0.1]);
  P('16', group(merged([box(0.03, 0.04, 0.03, 'black', { pos: [xr, PY1 - 0.04, zr + 0.1] }), cyl(0.006, 0.04, 'steel', { axis: 'x', seg: 10, pos: [xr, PY1 - 0.03, zr + 0.1] })], 'black')), [0.1, 0.05, 0.1]);
  P('15', group(merged([box(0.02, 0.006, 0.12, 'black', { pos: [xr, PY1 - 0.03, zr + 0.17], rot: [0.3, 0, 0] })], 'black')), [0.1, 0.08, 0.12]);
  P('33', tube([[xr - 0.02, TOP - 0.03, BZ - 0.05], [xr - 0.02, 1.45, BZ - 0.05], [xr - 0.02, 1.43, BZ - 0.08]], 0.005, 'zinc', { sharp: true, seg: 3, radial: 8 }), [0.1, -0.1, 0]);
  P('34', group(merged([box(0.04, 0.05, 0.006, 'black', { pos: [xr - 0.02, 1.45, PZ + PW / 2 + 0.003] }), box(0.04, 0.006, 0.05, 'black', { pos: [xr - 0.02, 1.47, PZ + PW / 2 + 0.03] })], 'black')), [0.1, -0.1, 0.1]);
  P('35', at(washer(S, 0.5, 'flat', { mat: 'zinc' }), [xr - 0.02, 1.473, BZ - 0.05]), [0.1, -0.05, 0.05]);
  // 56 — vis fraisée 3/8 × 1 1/2 du verrou, 66 contre-écrou.
  P('56', pose(THREE, bolt(S, 0.375, 1.5, { flat: true, mat: 'blackOxide' }), [xr - 0.02, 1.473, PZ + PW / 2 + 0.006], [0, 0, 1]), [0, 0, 0.1]);
  P('66', pose(THREE, nut(S, 0.375, { jam: true }), [xr - 0.02, 1.473, PZ + PW / 2 - 0.035], [0, 0, -1]), [0, 0, -0.1]);

  // ================================================================ 12, 13 — joint avant ; 26, 27 — joint arrière
  P('12', group(merged([box(0.004, 0.05, 1.56, 'zinc', { pos: [X1 - 0.002, TOP - 0.035, 0] })], 'zinc')), [0.2, 0, 0]);
  P('13', group(merged([box(0.012, 0.07, 1.56, 'rubber', { pos: [X1 + 0.006, TOP - 0.035, 0] }), box(0.03, 0.006, 1.56, 'rubber', { pos: [X1 + 0.02, TOP + 0.003, 0] })], 'rubber')), [0.3, 0, 0]);
  P('26', group(merged([box(0.04, 0.006, 1.56, 'rubber', { pos: [X0 - 0.01, TOP + 0.003, 0] }), box(0.006, 0.05, 1.56, 'rubber', { pos: [X0 - 0.027, TOP - 0.02, 0] })], 'rubber')), [-0.3, 0, 0]);
  P('27', group(merged([box(0.03, 0.004, 1.56, 'zinc', { pos: [X0 + 0.01, TOP + 0.008, 0] })], 'zinc')), [-0.2, 0.05, 0]);

  // ================================================================ ligne de raccords 1 po sur le poteau 20
  // Console (36) à deux colliers, coupleurs 1 po NPT (38), raccords tournants
  // (6), mamelons (43), coudes 90° (42) et 45° (41), tube coudé Ø 1 po (37).
  const cx = PX[0] + PW / 2 + 0.035, cz = PZ - 0.01;
  P('36', group(merged([
    box(0.008, 0.36, 0.08, 'black', { pos: [PX[0] + PW / 2 + 0.004, 1.42, cz] }),
    ...[1.28, 1.56].map((y) => box(0.03, 0.006, 0.06, 'black', { pos: [cx - 0.015, y, cz] })),
  ], 'black')), [0.1, 0, 0]);
  const npt = (r, L, mat = 'zinc') => S.lathe([[0, 0], [r, 0], [r * 1.04, L * 0.2], [r * 1.04, L * 0.8], [r, L], [0, L]], mat, { seg: 14 });
  const coupler = (y) => group(merged([at(S.nut(0.045, 0.02, 'zinc'), [cx, y, cz]), cyl(0.024, 0.06, 'zinc', { seg: 18, pos: [cx, y + 0.04, cz] }), cyl(0.028, 0.012, 'zinc', { seg: 18, pos: [cx, y + 0.064, cz] })], 'zinc'));
  P('38', coupler(1.22), [0.12, -0.05, 0]);
  P('38', coupler(1.58), [0.12, 0.05, 0]);
  const swivel = (y, dir) => pose(THREE, group(merged([S.nut(0.042, 0.022, 'zinc', { pos: [0, 0.011, 0] }), cyl(0.02, 0.03, 'zinc', { seg: 16, pos: [0, 0.035, 0] })], 'zinc')), [cx, y, cz], dir);
  P('6', swivel(1.22, [0, -1, 0]), [0.12, -0.1, 0]);
  P('6', swivel(1.648, [0, 1, 0]), [0.12, 0.1, 0]);
  P('43', pose(THREE, npt(0.0167, 0.05), [cx, 1.17, cz], [0, -1, 0]), [0.12, -0.14, 0]);
  P('43', pose(THREE, npt(0.0167, 0.05), [cx, 1.698, cz], [0, 1, 0]), [0.12, 0.14, 0]);
  const e1 = fitElbow(S, 16, 16), e2 = fitElbow(S, 16, 16), e3 = fitElbow(S, 16, 16), e4 = fitElbow(S, 16, 16);
  const place = (f, p, n, w) => {
    const g = new THREE.Group(), inner = new THREE.Group();
    inner.add(f.obj); g.add(inner);
    let best = 0, bs = -2;
    for (let k = 0; k < 8; k++) {
      inner.rotation.y = (k * Math.PI) / 4;
      g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...n).normalize());
      g.position.set(...p);
      g.updateMatrixWorld(true);
      const d = new THREE.Vector3(...f.dir).transformDirection(inner.matrixWorld);
      const sc = d.dot(new THREE.Vector3(...w).normalize());
      if (sc > bs) { bs = sc; best = k; }
    }
    inner.rotation.y = (best * Math.PI) / 4;
    g.updateMatrixWorld(true);
    return { obj: g, tip: new THREE.Vector3(...f.tip).applyMatrix4(inner.matrixWorld).toArray() };
  };
  const a1 = place(e1, [cx, 1.12, cz], [0, -1, 0], [0, 0, -1]);
  const a2 = place(e2, [cx, 1.748, cz], [0, 1, 0], [0, 0, -1]);
  P('42', a1.obj, [0.12, -0.2, 0]);
  P('42', a2.obj, [0.12, 0.2, 0]);
  // 37 — tube Ø 1 po coudé à 90° entre les coudes (raccords JIC à écrou), le long du poteau.
  const t37 = [a1.tip, [a1.tip[0], a1.tip[1], a1.tip[2] - 0.05], [a1.tip[0], a1.tip[1] - 0.04, a1.tip[2] - 0.09], [a1.tip[0] + 0.12, a1.tip[1] - 0.06, a1.tip[2] - 0.11]];
  P('37', group(tube(t37, 0.0127, 'steel', { seg: 24, radial: 14 }), merged([at(S.nut(0.04, 0.02, 'zinc', { axis: 'z' }), [a1.tip[0], a1.tip[1], a1.tip[2] - 0.01])], 'zinc')), [0.15, -0.2, -0.1]);
  const a3 = place(e3, [a2.tip[0], a2.tip[1], a2.tip[2]], [0, 0, -1], [1, 0, 0]);
  P('42', a3.obj, [0.15, 0.2, -0.1]);
  const a4 = place(e4, [t37.at(-1)[0], t37.at(-1)[1], t37.at(-1)[2]], [1, 0, 0], [0, -1, 0]);
  P('42', a4.obj, [0.2, -0.25, -0.1]);
  P('43', pose(THREE, npt(0.0167, 0.05), a3.tip, [1, 0, 0]), [0.2, 0.2, -0.1]);
  const f41 = fitElbow(S, 16, 16, { angle: 45 });
  P('41', place(f41, [a3.tip[0] + 0.05, a3.tip[1], a3.tip[2]], [1, 0, 0], [0, 1, 0]).obj, [0.25, 0.25, -0.1]);
  void fitStraight;

  // ================================================================ boulonnerie
  const B = (ref, d, len, p, n, opt) => P(ref, pose(THREE, bolt(S, d, len, opt), p, n), n.map((v) => v * 0.08));
  const W = (ref, d, kind, p, n) => P(ref, pose(THREE, washer(S, d, kind), p, n), n.map((v) => v * 0.06));
  const N = (ref, d, p, n, opt) => P(ref, pose(THREE, nut(S, d, opt), p, n), n.map((v) => v * 0.07));
  const off = (p, n, k) => p.map((v, i) => v + n[i] * k);
  // Vis 1/2 po avec rondelle plate (59) et Grower (62) sous la tête ; écrou (65) avec plate (59) si traversante.
  const half = (ref, len, p, n, nutAt = null) => {
    const d = 0.5;
    W('59', d, 'flat', p, n);
    W('62', d, 'split', off(p, n, washerT(d)), n);
    B(ref, d, len, off(p, n, washerT(d) + washerT(d, 'split')), n);
    if (nutAt) {
      const m = n.map((v) => -v);
      W('59', d, 'flat', nutAt, m);
      N('65', d, off(nutAt, m, washerT(d)), m);
    }
  };
  // 53 — pieds des poteaux : quatre vis horizontales par équerre dans la face extérieure du longeron.
  for (const x of PX) for (const s of [1, -1]) for (const dx of [-0.03, 0.03]) for (const y of [YF - 0.03, YF - 0.08]) {
    half('53', 1.75, [x + dx, y, s * (FZ + 0.027)], [0, 0, s]);
  }
  // 54 — poutres sur les consoles de tête (trois par poteau, verticales).
  for (const x of PX) for (const s of [1, -1]) for (const dz of [0.03, 0.08, 0.13]) {
    half('54', 2.0, [x + (dz === 0.08 ? 0.02 : -0.02), BY1, s * (BZ - 0.05 + dz * 0.2)], [0, 1, 0]);
  }
  // 52 — consoles 8 au travers des poteaux (écrou 65 de l'autre côté).
  for (const [x, s] of brackets) {
    const k = x > (PX[0] + PX[1]) / 2 ? (x > PX[1] ? 1 : -1) : (x > PX[0] ? 1 : -1);
    half('52', 1.5, [x + k * 0.004, PY1 - 0.04, s * (PZ + 0.04)], [k, 0, 0], [x - k * (PW + 0.004), PY1 - 0.04, s * (PZ + 0.04)]);
  }
  // 51 — panneau arrière (huit), tôle avant (six, écrous 65), charnière de la porte supérieure (six),
  // charnières des portes latérales (quatre chacune), équerre de support 14 (une), cornières 9 (deux).
  for (const s of [1, -1]) for (const y of [1.1, 1.3, 1.5, 1.7]) half('51', 1.25, [X0 - 0.0, y, s * PZ], [-1, 0, 0]);
  for (const s of [1, -1]) for (const y of [1.1, 1.25, 1.4]) half('51', 1.25, [X1 + 0.0, y, s * PZ], [1, 0, 0], [PX[1] - PW / 2, y, s * PZ]);
  for (const x of [-2.6, -2.3, -2.0, -1.7, -1.4, -1.2]) half('51', 1.25, [x, BY1 + 0.002, -(BZ - 0.035)], [0, 1, 0]);
  for (const s of [1, -1]) for (const x of [-2.55, -2.1, -1.65, -1.25]) half('51', 1.25, [x, (BY0 + BY1) / 2, s * BZ], [0, 0, s]);
  half('51', 1.25, [xr + 0.025, PY1 - 0.085, zr + 0.06], [1, 0, 0]);
  for (const s of [1, -1]) half('51', 1.25, [PX[1], BY0, s * 0.72], [0, 1, 0]);
  // 50 — platines de gâche (quatre), béquille 15 et pivot 16.
  for (const [x, s] of strikers) half('50', 1.0, [x - 0.025, 1.28, s * (PZ + PW / 2 + 0.008)], [0, 0, s]);
  half('50', 1.0, [xr - 0.015, PY1 - 0.03, zr + 0.17], [1, 0, 0]);
  half('50', 1.0, [xr + 0.015, PY1 - 0.04, zr + 0.1], [1, 0, 0]);
  // 1/4 po : 44 — contre-plaque du joint avant (treize), 45 — plat du joint arrière (douze), 46 — colliers de la console 36 (quatre) ; Grower 60.
  const quarter = (ref, len, p, n) => { W('60', 0.25, 'split', p, n); B(ref, 0.25, len, off(p, n, washerT(0.25, 'split')), n); };
  for (let i = 0; i < 13; i++) quarter('44', 0.5, [X1, TOP - 0.035, -0.72 + i * 0.12], [1, 0, 0]);
  for (let i = 0; i < 12; i++) quarter('45', 0.75, [X0 + 0.01, TOP + 0.01, -0.715 + i * 0.13], [0, 1, 0]);
  for (const y of [1.28, 1.56]) for (const dz of [-0.022, 0.022]) quarter('46', 1.0, [cx - 0.015, y + 0.003, cz + dz], [0, 1, 0]);
  // 47 — console 11 au travers de la porte supérieure : plates 57 dessus et dessous, écrous 63.
  for (const [dx, dz] of [[-0.08, -0.08], [0.08, -0.08], [-0.08, 0.08], [0.08, 0.08]]) {
    const p = [IA[0] + dx, TOP, IA[2] + dz];
    W('57', 0.25, 'flat', p, [0, 1, 0]);
    B('47', 0.25, 1.5, off(p, [0, 1, 0], washerT(0.25)), [0, 1, 0]);
    W('57', 0.25, 'flat', [p[0], TOP - 0.035, p[2]], [0, -1, 0]);
    N('63', 0.25, [p[0], TOP - 0.035 - washerT(0.25), p[2]], [0, -1, 0]);
  }
  // 3/8 po : 48 — console 36 sur le poteau (Grower 61) ; 49 — console 39 sur la tôle avant (plates 58, Grower 61, écrous 64).
  for (const y of [1.3, 1.54]) {
    const p = [PX[0] + PW / 2 + 0.008, y, cz];
    W('61', 0.375, 'split', p, [1, 0, 0]);
    B('48', 0.375, 0.75, off(p, [1, 0, 0], washerT(0.375, 'split')), [1, 0, 0]);
  }
  for (const dz of [-0.06, 0.06]) {
    const p = [jb[0] - 0.006, jb[1], jb[2] + dz];
    W('58', 0.375, 'flat', p, [-1, 0, 0]);
    W('61', 0.375, 'split', off(p, [-1, 0, 0], washerT(0.375)), [-1, 0, 0]);
    B('49', 0.375, 1.25, off(p, [-1, 0, 0], washerT(0.375) + washerT(0.375, 'split')), [-1, 0, 0]);
    W('58', 0.375, 'flat', [X1, jb[1], jb[2] + dz], [1, 0, 0]);
    N('64', 0.375, [X1 + washerT(0.375), jb[1], jb[2] + dz], [1, 0, 0]);
  }
  void HC; void IN; void u; void sideOf;
  return { view: { dir: [1, 0.6, 1.1] } };
}

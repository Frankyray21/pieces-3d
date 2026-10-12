// P422 — Capot du compresseur CX008817 rév. 16 (page 422) : « COMPRESSOR
// CANOPY ASSEMBLY », repère 2 du pont arrière P420. Caisson acoustique de
// 1,37 × 1,92 m posé sur le châssis du pont derrière le capot moteur : porte
// du dessus (1, P426) charnière à l'avant et soutenue par deux vérins à gaz
// (14) ; portes gauche (22, P424, découpe ronde du volant ventilé) et droite
// (23, P428, grille) charnières sur les montants avant (11 à droite, 10 à
// gauche), retenues ouvertes par deux ressorts à gaz de 500 mm (19) sur
// leurs supports réglables (20) ; traverse avant tubulaire et son poteau
// central à tablette (9) ; cornière arrière gauche (4, gâche de la porte
// gauche) ; tôle pliée transversale (5) qui porte les gâches de la porte du
// dessus ; tôle pliée (21) de la gâche de la porte droite ; quatre gâches
// (3 + 12). À l'avant : panneau des manomètres (8) suspendu à sa tôle pliée
// (18), support du bouchon de remplissage d'huile (6), tube (13), support du
// gyrophare (7) au-dessus de la baie d'évacuation d'air ; supports du
// flexible du surpresseur (A) et du filtre coalescent (B) ; verrou de maintien
// (15) entre ses deux chapes (16, 17) ; 18 cales (2) sous et derrière les
// pieds (« au besoin »).
// Repère machine (../layout.js : origine au sol sous l'articulation, X vers
// l'avant, Y vers le haut, Z vers la droite), placé à l'identité par P420.
// Capot de x = -4.16 à -2.79, z = ±0.96, de y = 1.01 (bas des portes) à
// 1.975 (avant) / 1.86 (arrière) ; montants boulonnés sur les flancs du
// châssis (z = ±0.8725) jusqu'à y = 0.70. Constantes communes : CAN (./_reara.js).
// Cotes : vues des pages 416, 420, 422 à l'échelle du châssis (1,65 m) et de
// la poulie 10,3 po (P418) — longueur 1,37 m (vue de côté de la page 422 et
// porte de la page 424), traverse 3 × 2 po, montants 2 × 2 po, cornière
// 2 × 2 × 1/4 po, panneau des manomètres 0,33 × 0,28 m à cinq trous
// (Ø 100 et 4 × Ø 67 mm), tôles pliées 10 ga ; ressorts 19 : 500 mm sortis,
// course 201 mm (liste) ; le reste d'après les proportions des vues.

import { DECK, CAN, I, topToMachine, sheetGeo, sweepGeo, xform, meshOf, flangeProfile, rrect, circ, basis, striker, gasSpring, orient } from './_reara.js';

const XC = (CAN.beam.x[0] + CAN.beam.x[1]) / 2; // axe de la traverse et des montants avant (-2.8204)
const XF = CAN.beam.x[1]; // face avant de la traverse et des montants (-2.795)
const XB = CAN.beam.x[0]; // face arrière (-2.8458)
const [BY0, BY1] = CAN.beam.y; // dessous / dessus de la traverse
const PZ = CAN.post, PY0 = 0.7;
const SH = I(0.048); // cale 18 ga
const US = CAN.L - 0.41, WPIN = 0.085; // gâches de la porte du dessus (voir P426)
const T10 = I(0.135); // tôle 10 ga

export default function P422(api) {
  const { THREE, S } = api;
  const { box, at, group, merged, weld } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const V3 = (a) => new THREE.Vector3(...a);

  // Tube rectangulaire w × h (paroi e) de longueur len selon l'axe 'x' (w selon Z, h selon Y),
  // 'y' (w selon X, h selon Z) ou 'z' (w selon X, h selon Y), centré en c.
  const rtube = (w, h, e, len, axis, c) => {
    const g = sheetGeo(THREE, rrect(w, h, Math.min(0.006, e * 1.5), 3), [rrect(w - 2 * e, h - 2 * e, 0.002, 2)], len, { z0: -len / 2 });
    const m = new THREE.Matrix4();
    if (axis === 'y') m.makeBasis(V3([1, 0, 0]), V3([0, 0, -1]), V3([0, 1, 0]));
    else if (axis === 'x') m.makeBasis(V3([0, 0, -1]), V3([0, 1, 0]), V3([1, 0, 0]));
    m.setPosition(...c);
    return xform(g, m);
  };
  // Tôle plane dans le plan (ex, ey) d'origine o, épaisseur selon ez.
  const plate = (out, holes, t, o, ex, ey, ez) => xform(sheetGeo(THREE, out, holes, t), basis(THREE, o, ex, ey, ez));
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1], nX = [-1, 0, 0], nZ = [0, 0, -1];
  // Boulon H d (po) × len (po), tête en p, tige selon dir (vecteur unitaire).
  const boltAt = (d, len, p, dir, washer = true) => orient(THREE, S.bolt(I(d), I(len), 'zinc', { washer }), p, dir.map((v) => -v), Math.abs(dir[0]) > 0.9 ? Z : X);
  const nutAt = (d, p, dir) => orient(THREE, S.nut(I(d * 1.5), I(d * 0.85), 'zinc', { pos: [0, I(d * 0.425), 0] }), p, dir, Math.abs(dir[0]) > 0.9 ? Z : X);

  // ---------------------------------------------------------------- 9 — traverse avant et poteau central
  const g9 = [];
  g9.push(rtube(0.0508, 0.0762, I(3 / 16), 2 * CAN.beam.z, 'z', [XC, (BY0 + BY1) / 2, 0]));
  for (const s of [-1, 1]) g9.push(sheetGeo(THREE, rrect(0.0508, 0.0762, 0.004, 2, XC, (BY0 + BY1) / 2), [], I(3 / 16), { z0: s > 0 ? CAN.beam.z : -CAN.beam.z - I(3 / 16) }));
  const yBase = DECK.top + 3 * SH, yPost0 = yBase + I(3 / 8);
  g9.push(rtube(0.0508, 0.0508, I(3 / 16), BY0 - yPost0, 'y', [XC, (BY0 + yPost0) / 2, 0]));
  g9.push(plate(rrect(0.1, 0.1, 0.006, 2, 0, 0), [circ(0.0355, 0.035, 0.0055, 12), circ(0.0355, -0.035, 0.0055, 12)], I(3 / 8), [XC, yBase, 0], X, nZ, Y));
  // Tablette (support de tube) et ses goussets, patte de rotule du vérin droit.
  const yTab = 1.28;
  g9.push(box(0.045, I(1 / 4), 0.55, 'lightGrey', { pos: [XF - 0.0225, yTab - I(1 / 8), 0.095] }));
  for (const s of [-1, 1]) g9.push(xform(S.extrude([[0, 0], [0.07, 0], [0, -0.07]], I(1 / 4), 'lightGrey').geometry.clone(), new THREE.Matrix4().makeBasis(V3([0, 0, s]), V3(Y), V3(X)).setPosition(XC, yTab - I(1 / 4), s * 0.0254)));
  g9.push(box(0.04, 0.045, I(1 / 4), 'lightGrey', { pos: [XC, yTab + 0.0225, 0.37 + I(1 / 8)] }));
  const beads9 = [
    weld([[XF + 0.001, BY0 - 0.002, -0.027], [XF + 0.001, BY0 - 0.002, 0.027]], 0.006, 'lightGrey'),
    weld([[XB - 0.001, BY0 - 0.002, -0.027], [XB - 0.001, BY0 - 0.002, 0.027]], 0.006, 'lightGrey'),
    weld([[XC - 0.027, yPost0 + 0.002, -0.027], [XC + 0.027, yPost0 + 0.002, -0.027], [XC + 0.027, yPost0 + 0.002, 0.027], [XC - 0.027, yPost0 + 0.002, 0.027]], 0.006, 'lightGrey', { closed: true }),
    weld([[XF + 0.001, yTab - I(1 / 4) - 0.002, -0.027], [XF + 0.001, yTab - I(1 / 4) - 0.002, 0.027]], 0.005, 'lightGrey'),
  ];
  const fast9 = [];
  for (const z of [-0.035, 0.035]) fast9.push(boltAt(0.375, 1.25, [XC + 0.0355, yPost0, z], [0, -1, 0]));
  for (const s of [-1, 1]) for (const dx of [-0.012, 0.012]) fast9.push(boltAt(0.375, 1.0, [XC + dx, BY1, s * (PZ - 0.004)], [0, -1, 0]));
  P('9', group(meshOf(api, g9, 'lightGrey', 0.4), merged(beads9, 'lightGrey'), merged(fast9, 'zinc')), [0.25, 0.2, 0]);

  // ---------------------------------------------------------------- 10, 11 — montants avant
  // Tube 2 × 2 × 3/16 po coiffé, boulonné (deux vis 3/8-16 tête côté intérieur
  // du flanc) sur trois cales contre le flanc du châssis.
  for (const [ref, s] of [['10', -1], ['11', 1]]) {
    const g = [rtube(0.0508, 0.0508, I(3 / 16), BY0 - I(3 / 16) - PY0, 'y', [XC, (BY0 - I(3 / 16) + PY0) / 2, s * PZ])];
    g.push(box(0.0508, I(3 / 16), 0.0508, 'lightGrey', { pos: [XC, BY0 - I(3 / 32), s * PZ] }));
    g.push(box(0.0508, I(3 / 16), 0.0508, 'lightGrey', { pos: [XC, PY0 - I(3 / 32), s * PZ] }));
    const f = [0.8, 0.92].map((y) => boltAt(0.375, 1.75, [XC, y, s * (DECK.z - 0.0125)], [0, 0, s]));
    P(ref, group(meshOf(api, g, 'lightGrey', 0.4), merged(f, 'zinc')), [0.12, 0, s * 0.3]);
  }

  // ---------------------------------------------------------------- 4 — cornière arrière gauche
  // Cornière 2 × 2 × 1/4 po : aile A contre le flanc (sur trois cales), aile B
  // tournée vers l'arrière qui porte la gâche de la porte gauche.
  const zA = -(DECK.zo + 3 * SH), y4 = [PY0, 1.8];
  const g4 = [
    box(0.0508, y4[1] - y4[0], I(1 / 4), 'lightGrey', { pos: [-4.1, (y4[0] + y4[1]) / 2, zA - I(1 / 8)] }),
    box(I(1 / 4), y4[1] - y4[0], 0.0508 - I(1 / 4), 'lightGrey', { pos: [-4.1254 + I(1 / 8), (y4[0] + y4[1]) / 2, zA - I(1 / 4) - (0.0508 - I(1 / 4)) / 2] }),
  ];
  const f4 = [0.8, 0.92].map((y) => boltAt(0.375, 1.5, [-4.1, y, -(DECK.z - 0.0125)], [0, 0, -1]));
  P('4', group(meshOf(api, g4, 'lightGrey', 0.4), merged(f4, 'zinc')), [-0.15, 0, -0.25]);

  // ---------------------------------------------------------------- 5 — tôle pliée des gâches de la porte du dessus
  // Profilé en U 10 ga (âme 3 po, ailes 1 1/2 po vers l'arrière) le long de Z
  // sous la porte du dessus, au droit de ses serrures ; pattes d'extrémité
  // repliées vers le bas, boulonnées sur les montants du châssis (P420).
  const pin0 = topToMachine(US + 0.05, 0, WPIN);
  const x5 = pin0[0], y5 = pin0[1];
  const C = [[x5, y5 - 0.0381], [x5, y5 + 0.0381], [x5 - 0.0381, y5 + 0.0381], [x5 - 0.0381, y5 + 0.0381 - T10], [x5 - T10, y5 + 0.0381 - T10],
    [x5 - T10, y5 - 0.0381 + T10], [x5 - 0.0381, y5 - 0.0381 + T10], [x5 - 0.0381, y5 - 0.0381]];
  const g5 = [sheetGeo(THREE, C, [], 1.8, { z0: -0.9 })];
  for (const s of [-1, 1]) g5.push(plate(rrect(0.0381, 0.16, 0.004, 2, -0.0191, -0.08), [circ(-0.019, -0.05, 0.0055, 10), circ(-0.019, -0.12, 0.0055, 10)], T10, [x5, y5 - 0.0381, s > 0 ? 0.9 - T10 : -0.9], X, Y, Z));
  P('5', group(meshOf(api, g5, 'lightGrey', 0.4)), [-0.1, 0.25, 0]);

  // ---------------------------------------------------------------- 3 + 12 — gâches (quatre)
  // Gâche : plaque à boutonnières (3) et goupille sans tête (12), axe selon X.
  const strikerAt = (p, dir, pinLen, eP, eS) => {
    const st = striker(api, { pinLen });
    const up = Math.abs(dir[1]) > 0.9 ? X : Y;
    P('3', orient(THREE, st.plate, p, up, [up[1] * dir[2] - up[2] * dir[1], up[2] * dir[0] - up[0] * dir[2], up[0] * dir[1] - up[1] * dir[0]]), eP);
    P('12', orient(THREE, group(st.pin), p, up, [up[1] * dir[2] - up[2] * dir[1], up[2] * dir[0] - up[0] * dir[2], up[0] * dir[1] - up[1] * dir[0]]), eS);
  };
  // Deux sur l'âme de la tôle 5, goupilles vers l'avant (+X) dans les serrures de la porte du dessus.
  for (const v of [-0.42, 0.23]) strikerAt([x5, y5, v], X, 0.75, [0.08, 0, 0], [0.16, 0, 0]);
  // Porte gauche : sur l'aile arrière de la cornière 4, goupille vers l'arrière.
  strikerAt([-4.1254, CAN.yb + 0.22, -CAN.zo + 0.078], nX, 1.0, [-0.06, 0, 0], [-0.12, 0, 0]);
  // Porte droite : sur la patte de la tôle pliée 21, goupille vers l'arrière.
  strikerAt([-3.5934, CAN.yb + 0.155, CAN.zo - 0.08], nX, 1.0, [-0.06, 0, 0.05], [-0.12, 0, 0.05]);

  // ---------------------------------------------------------------- 21 — tôle pliée de la gâche droite
  // Aile boulonnée sur le flanc droit du châssis, palier, patte verticale (plan YZ) en x = -3.59.
  const g21 = [
    plate(rrect(0.1, 0.13, 0.006, 2), [circ(-0.03, -0.03, 0.0055, 10), circ(0.03, -0.03, 0.0055, 10)], T10, [-3.59 - 0.05, 0.925, DECK.zo], X, Y, Z),
    box(0.06, T10, 0.06, 'lightGrey', { pos: [-3.59 - 0.03, DECK.top + 0.0, DECK.zo + 0.03] }),
    plate(rrect(0.06, 0.23, 0.006, 2, 0, 0), [], T10, [-3.59, 1.105, DECK.zo + 0.03], nZ, Y, nX),
  ];
  const f21 = [-0.03, 0.03].map((dx) => boltAt(0.3125, 1.0, [-3.64 + dx, 0.895, DECK.z - 0.0125], [0, 0, 1]));
  P('21', group(meshOf(api, g21, 'lightGrey', 0.4), merged(f21, 'zinc')), [0, 0.1, 0.25]);

  // ---------------------------------------------------------------- 8 — panneau des manomètres ; 18 — sa tôle pliée ; 6 — support du bouchon
  // Panneau 10 ga dans le plan YZ (face vers l'avant), bords tombés vers
  // l'arrière sur trois côtés, cinq trous de manomètres, quatre vis en haut.
  const pz0 = 0.49, pz1 = 0.82, py0 = 1.35, py1 = 1.63, xP = XF - 0.0205;
  const pan = [[pz0, py0], [pz1, py0], [pz1, py1], [pz0, py1]];
  const fx = (f) => pz0 + f * (pz1 - pz0), fy = (f) => py1 - f * (py1 - py0);
  const gh = [circ(fx(0.5), fy(0.26), 0.05, 32), ...[[0.18, 0.53], [0.84, 0.53], [0.32, 0.81], [0.68, 0.81]].map(([a, b]) => circ(fx(a), fy(b), 0.0335, 24))];
  const panM = basis(THREE, [xP, 0, 0], nZ, Y, nX);
  const g8 = [xform(sheetGeo(THREE, pan, gh, T10, { bevel: false }), panM), xform(sweepGeo(THREE, pan, flangeProfile(T10, 0.004, 0.022), { i0: 3, i1: 2, loop: true }), panM)];
  const f8 = [0.56, 0.75].map((z) => boltAt(0.25, 0.75, [xP + 0.002, py1 - 0.015, -z], nX));
  P('8', group(meshOf(api, g8, 'lightGrey', 0.4), merged(f8, 'zinc')), [0.2, 0, 0]);
  const g18 = [
    box(0.026, T10, pz1 - pz0 + 0.04, 'lightGrey', { pos: [xP - T10 - 0.013, BY0 - T10 / 2, -(pz0 + pz1) / 2] }),
    box(T10, BY0 - 1.6, pz1 - pz0 + 0.04, 'lightGrey', { pos: [xP - T10 - T10 / 2, (BY0 + 1.6) / 2, -(pz0 + pz1) / 2] }),
  ];
  const f18 = [-0.56, -0.75].map((z) => boltAt(0.3125, 1.0, [xP - 0.013, BY0 - T10, z], [0, 1, 0]));
  P('18', group(meshOf(api, g18, 'lightGrey', 0.4), merged(f18, 'zinc')), [0.15, 0.08, 0]);
  // 6 — équerre sur la face intérieure du montant 10, tablette percée Ø 35 mm.
  const zi = -(PZ - 0.0254);
  const g6 = [
    plate(rrect(0.09, 0.07, 0.006, 2), [], I(1 / 4), [XC - 0.03, 1.435, zi], X, Y, Z),
    plate(rrect(0.08, 0.075, 0.008, 2, 0, 0), [circ(0, 0, 0.0175, 20)], I(1 / 4), [XC - 0.045, 1.4, zi + 0.0375], X, nZ, Y),
  ];
  P('6', group(meshOf(api, g6, 'lightGrey', 0.4), merged([boltAt(0.25, 0.75, [XC - 0.06, 1.45, zi + I(1 / 4)], [0, 0, -1]), boltAt(0.25, 0.75, [XC, 1.45, zi + I(1 / 4)], [0, 0, -1])], 'zinc')), [0.1, 0, 0.12]);

  // ---------------------------------------------------------------- 13 — tube
  // Tube acier Ø 1/2 po du panneau des manomètres au raccord de cloison de la
  // tablette du poteau central, écrous JIC aux deux bouts, collier sur la traverse.
  const xt = XF - 0.035;
  const path13 = [[xt, 1.5, -0.6], [xt, 1.79, -0.6], [xt, 1.82, -0.57], [xt, 1.82, -0.075], [xt, 1.79, -0.045], [xt, 1.36, -0.045], [xt, 1.33, -0.02], [XF - 0.0225, 1.3, 0.08], [XF - 0.0225, 1.283, 0.1]];
  const t13 = S.tube(path13, I(0.25), 'steel', { seg: 96, radial: 10, tension: 0.1, ends: 'none' });
  const jic = (p) => at(S.nut(I(0.75), I(0.6), 'zinc', { axis: 'y' }), p);
  const clip = at(S.torus(0.009, 0.0025, 'zinc', { axis: 'z' }), [xt, 1.82, -0.32]);
  const clipTab = box(0.012, 0.045, 0.02, 'zinc', { pos: [xt, 1.845, -0.32] });
  P('13', group(t13, merged([jic([xt, 1.51, -0.6]), jic([XF - 0.0225, 1.293, 0.1]), clip, clipTab], 'zinc')), [0.12, 0.05, 0]);

  // ---------------------------------------------------------------- 7 — support du gyrophare
  // Semelle sur la traverse dans la baie, deux joues, platine Ø 25 mm + trois trous.
  const zB = 0.6, yP = 2.03;
  const g7 = [
    box(0.045, I(1 / 4), 0.26, 'lightGrey', { pos: [XC, BY1 + I(1 / 8), zB] }),
    ...[-0.05, 0.05].map((dz) => xform(S.extrude([[-0.0225, 0], [0.0225, 0], [0.01, yP - BY1 - I(1 / 4)], [-0.04, yP - BY1 - I(1 / 4)]], I(1 / 4), 'lightGrey').geometry.clone(), new THREE.Matrix4().setPosition(XC, BY1 + I(1 / 4), zB + dz))),
    plate(circ(0, 0, 0.065, 28), [circ(0, 0, 0.0125, 16), ...[0, 1, 2].map((k) => circ(0.045 * Math.cos(k * 2.094), 0.045 * Math.sin(k * 2.094), 0.0035, 8))], I(1 / 4), [XC - 0.015, yP, zB], X, nZ, Y),
  ];
  P('7', group(meshOf(api, g7, 'lightGrey', 0.4), merged([-0.1, 0.1].map((dz) => boltAt(0.3125, 1.0, [XC, BY1 + I(1 / 4), zB + dz], [0, -1, 0])), 'zinc')), [0, 0.2, 0]);

  // ---------------------------------------------------------------- A — support du flexible du surpresseur ; B — support du filtre coalescent
  const gA = [
    box(0.038, I(1 / 4), 0.08, 'lightGrey', { pos: [x5 - 0.019, y5 - 0.0381 - I(1 / 8), -0.25] }),
    plate(rrect(0.08, 0.15, 0.01, 3, 0, -0.075), [circ(0, -0.105, 0.0325, 28)], I(1 / 4), [x5 - 0.0381, y5 - 0.0381, -0.25], nZ, Y, nX),
  ];
  P('A', group(meshOf(api, gA, 'lightGrey', 0.4), merged([-0.27, -0.23].map((z) => boltAt(0.3125, 0.75, [x5 - 0.019, y5 - 0.0381 + 0.0, z], [0, -1, 0])), 'zinc')), [-0.1, -0.1, 0]);
  const zF = 0.6, yS = 1.62;
  const gB = [
    plate(rrect(0.14, 0.28, 0.006, 2, 0, 0), [], I(1 / 4), [XB, yS + 0.14, zF], nZ, Y, nX),
    plate(rrect(0.2, 0.14, 0.008, 3, 0, 0), [circ(0, 0, 0.025, 24), ...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => circ(a * 0.035, b * 0.035, 0.0045, 8))], I(1 / 4), [XB - I(1 / 4) - 0.1, yS, zF], X, nZ, Y),
    ...[-0.065, 0.065].map((dz) => xform(S.extrude([[0, 0], [0.12, 0], [0, 0.18]], I(3 / 16), 'lightGrey').geometry.clone(), new THREE.Matrix4().makeBasis(V3(nX), V3(Y), V3(Z)).setPosition(XB - I(1 / 4), yS + I(1 / 4), zF + dz))),
  ];
  P('B', group(meshOf(api, gB, 'lightGrey', 0.4), merged([-0.04, 0.04].map((dz) => boltAt(0.3125, 1.25, [XB - I(1 / 4), 1.9, zF + dz], X)), 'zinc')), [-0.12, 0.05, 0]);

  // ---------------------------------------------------------------- 16, 17 — chapes du verrou ; 15 — verrou de maintien
  // Sur le dessus du flanc gauche, près du montant avant : deux chapes
  // symétriques (semelle + oreille percée, axe selon X) et le verrou plat
  // 3/8 po à crochet qui pivote entre elles (axe, écrou à freinage).
  const xL = -2.95, zL = -(DECK.z - 0.0), yL = DECK.top + 3 * SH;
  for (const [ref, dx] of [['16', 0.0109], ['17', -0.0109]]) {
    const ear = sheetGeo(THREE, [[-0.0125, 0], [0.0125, 0], [0.0125, 0.035], ...circ(0, 0.035, 0.0125, 12).filter(([, y]) => y > 0.035), [-0.0125, 0.035]], [circ(0, 0.035, 0.0055, 12)], I(1 / 4));
    const g = [
      box(0.03, I(1 / 4), 0.03, 'lightGrey', { pos: [xL + dx + Math.sign(dx) * 0.006, yL + I(1 / 8), zL] }),
      xform(ear, new THREE.Matrix4().makeBasis(V3(Z), V3(Y), V3(X)).setPosition(xL + dx - I(1 / 8), yL + I(1 / 4), zL)),
    ];
    P(ref, group(meshOf(api, g, 'lightGrey', 0.4)), [dx * 6, 0.06, -0.08]);
  }
  const latch = S.extrude([[0, -0.0175], [0.2, -0.0175], [0.215, -0.005], [0.205, 0.0175], [0.18, 0.0175], [0.18, 0.005], [0.165, 0.005], [0.165, 0.0175], [0, 0.0175]], I(3 / 8), 'safety');
  // Plat dessiné en (longueur x, largeur y, épaisseur z) : longueur portée sur Y
  // local, épaisseur sur X (axe du pivot), puis incliné de 0,5 rad vers l'intérieur.
  const lg = xform(latch.geometry.clone().translate(-0.0175, 0, 0), new THREE.Matrix4().makeBasis(V3(Y), V3(Z), V3(X)));
  const pivot = [xL, yL + I(1 / 4) + 0.035, zL];
  const l15 = orient(THREE, group(meshOf(api, [lg], 'safety', 0.4)), pivot, [0, Math.cos(0.5), Math.sin(0.5)], X);
  const pinB = orient(THREE, S.bolt(I(3 / 8), I(1.5), 'zinc', { washer: true }), [xL + 0.026, pivot[1], pivot[2]], X, Y);
  const pinN = orient(THREE, S.nut(I(9 / 16), I(0.4), 'zinc'), [xL - 0.022, pivot[1], pivot[2]], nX, Y);
  P('15', group(l15, merged([pinB, pinN], 'zinc')), [0, 0.14, -0.12]);

  // ---------------------------------------------------------------- 2 — cales (18)
  // Cales 18 ga 1 1/2 × 3 po à deux encoches : trois derrière chaque montant
  // (10, 11) et la cornière 4, trois sous le pied du poteau central 9, trois
  // sous chaque chape 16 / 17.
  const shimGeo = () => sheetGeo(THREE, rrect(0.038, 0.076, 0.003, 2), [rrect(0.009, 0.026, 0.0045, 3, 0.006, -0.02), rrect(0.009, 0.026, 0.0045, 3, 0.006, 0.02)], SH, { bevel: false });
  const shim = (o, ex, ey, ez) => group(meshOf(api, [xform(shimGeo(), basis(THREE, o, ex, ey, ez))], 'zinc', 0.4));
  for (let k = 0; k < 3; k++) {
    for (const [x, s] of [[XC, -1], [XC, 1], [-4.1, -1]]) {
      const z = s * (DECK.zo + k * SH);
      P('2', shim([x, 0.86, z], X, Y, [0, 0, s]), [0, -0.05, s * (0.08 + k * 0.03)]);
    }
    P('2', shim([XC, DECK.top + k * SH, 0], X, nZ, Y), [0, -0.05 - k * 0.03, 0.12]);
    for (const dx of [0.0109, -0.0109]) P('2', shim([xL + dx + Math.sign(dx) * 0.006, DECK.top + k * SH, zL], Z, X, Y), [dx * 6, -0.04 - k * 0.025, -0.1]);
  }

  // ---------------------------------------------------------------- 14 — vérins à gaz de la porte du dessus (deux)
  // Rotule basse sur le montant 10 (gauche) ou la patte du poteau central
  // (droite), rotule haute sur la patte soudée sous la porte ; tige en bas.
  for (const [zLow, zLowStud, v, dv] of [[-0.861, -(PZ - 0.0254), -0.86, 1], [0.355, 0.37, 0.36, -1]]) {
    const a = [XC, 1.29, zLow];
    const b = topToMachine(0.3, v + dv * (I(3 / 32) + 0.008), 0.032 + CAN.t);
    const spring = gasSpring(api, a, b, { ends: 'ball', rodDown: true, bodyL: 0.36, rB: 0.011, rR: 0.004 });
    const studs = [
      at(S.cyl(0.004, Math.abs(zLow - zLowStud) + 0.004, 'zinc', { axis: 'z', seg: 10 }), [XC, 1.29, (zLow + zLowStud) / 2]),
      at(S.cyl(0.004, 0.012, 'zinc', { axis: 'z', seg: 10 }), [b[0], b[1], v + dv * 0.004]),
    ];
    P('14', group(spring, merged(studs, 'zinc')), [0.1, 0.1, 0]);
  }

  // ---------------------------------------------------------------- 20 — supports réglables ; 19 — ressorts de maintien des portes latérales
  // Platine 1/4 po à deux boutonnières verticales sur la face arrière du
  // montant, rotule vers l'arrière ; ressort 500 mm sorti (course 201 mm) vers
  // la patte de la porte, presque rentré porte fermée.
  for (const s of [-1, 1]) {
    const zp = s * PZ, yS2 = CAN.yb + 0.82;
    const g20 = [xform(sheetGeo(THREE, rrect(0.044, 0.09, 0.005, 3), [rrect(0.009, 0.03, 0.0045, 3, 0, 0.025), rrect(0.009, 0.03, 0.0045, 3, 0, -0.025)], I(1 / 4)), new THREE.Matrix4().makeBasis(V3(nZ), V3(Y), V3(nX)).setPosition(XB, yS2, zp))];
    const stud = [at(S.cyl(0.0045, 0.012, 'zinc', { axis: 'x', seg: 10 }), [XB - I(1 / 4) - 0.006, yS2, zp]), at(S.ball(0.0065, 'zinc'), [XB - I(1 / 4) - 0.014, yS2, zp])];
    const bolts = [0.025, -0.025].map((dy) => boltAt(0.25, 0.75, [XB - I(1 / 4), yS2 + dy, zp], X));
    P('20', group(meshOf(api, g20, 'zinc', 0.4), merged([...stud, ...bolts], 'zinc')), [-0.06, 0, s * 0.1]);
    const a = [XB - I(1 / 4) - 0.014, yS2, zp];
    const b = [CAN.xf - 0.37, yS2, s * (CAN.zo - CAN.t - 0.025)];
    P('19', gasSpring(api, a, b, { ends: 'ball', rodDown: true, bodyL: 0.2, rB: 0.0095, rR: 0.004 }), [-0.08, 0.05, s * 0.18]);
  }

  // ---------------------------------------------------------------- 1, 22, 23 — portes
  P('1', at(api.sub('P426'), [CAN.hx, CAN.hy, 0], [0, 0, CAN.slope]), [0, 0.7, 0]);
  P('22', at(api.sub('P424'), [CAN.hx, CAN.yb, -CAN.hz]), [0, 0, -0.7]);
  P('23', at(api.sub('P428'), [CAN.hx, CAN.yb, CAN.hz]), [0, 0, 0.7]);

  return { view: { dir: [-1, 0.6, 1.1] } };
}

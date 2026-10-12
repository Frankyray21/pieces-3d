// P278 — Cabine du DU311, FOPS CX030878 rév. 3 (pages 278 à 283) : « ASSY,
// CAB, DU311, FOPS », repère 6 du porteur P220. Poste de conduite ouvert sous
// auvent ROPS/FOPS, posé sur le châssis arrière derrière l'articulation :
// caisson soudé et auvent (41, P286 → P288), siège et manipulateur (20, P290),
// collecteur d'huile 10 gal sous le palier d'accès (24, P284), marchepied à
// quatre marches en caillebotis côté −Z (23).
// Panneaux : visite arrière (27) et avant du pupitre (21) à vis, couvercle
// perforé du pupitre (22) à charnière et deux poignées en T, trappe du
// plancher (28), tôle antidérapante du palier (29), plaque de traversée
// perforée sous le pupitre (25).
// Tableau de manomètres : tôle pliée (43) en tête de la paroi arrière, neuf
// manomètres 2 1/2 po à raccord arrière (de +Z vers −Z : 16, 14, 16, 16, 15,
// 15, 14, 14, 14 — 0-5000 psi, pression, 1500 psi), coudes 1/8 NPT → JIC -4
// derrière chacun (48) ; support (38) et capot (39) du moniteur de la caméra
// de translation ; guide de flexibles (40) sur la paroi arrière.
// Frein : pédale (2) sur la trappe du plancher, tringle et chape à fourche
// M10 (4) vers la valve de frein (6) fixée sous le plancher par trois vis CHC
// 5/16 × 3 (49) et rondelles à collet haut (50) : adaptateurs M10 → JIC -4
// (7, élargisseur à écrou tournant -4 → -6 46), M16 → -8 (8), M18 → -12 (9),
// cinq M16 → -6 (10), deux M12 → -6 (11), bouchons M16 (12) et M18 (13), deux
// tés de branche (45) et deux tés de passage tournants (47) -6, quatre
// réductions -6 → -4 (44).
// Basculement de la cabine : arbre de charnière (31) dans quatre paliers
// (35 : deux dans les chapes du caisson, deux sur pattes du châssis), axes
// d'arrêt (30) et épingles (1) ; vérin Ø 2 1/2 × 16,5 po (26) sous le
// plancher, axes 32 (tige, chape du caisson) et 33 (fût, chape du châssis) ;
// verrou de vérin (34) rangé sur son support (42), goupille à poignée en T (5).
// Vérins de réglage de l'auvent (19, ×2) logés dans les fourreaux de l'embase
// P288. Extincteur portatif 20 lb (18) sur son support (17) au palier d'accès.
// La trousse de colliers (3) n'est pas représentée.
// Repère machine (../layout.js), placé à l'identité par P220 ; cabine dans
// le repère de P286 (origine CAB.o, voir _cab.js). Pièces du châssis arrière
// (aucune étiquette de corps mobile). Opérateur tourné vers −Z.
import { u, CAB, CANOPY, SEAT, MANIF, cabHw, cabToMachine, panelXY, prism, rrect } from './_cab.js';

export default function P278(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, merged, group, at, tube, hydCylinder } = S;
  const H_ = cabHw(api);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { hx, hz, nose, noseZ, H, hc, t, land } = CAB;
  const O = CAB.open;
  /** Objet construit dans le repère de la cabine → repère machine. */
  const C = (obj) => { const g = group(obj); g.position.set(...CAB.o); return g; };
  const Cp = (p) => cabToMachine(p);

  // ---------------------------------------------------------------- 41 — caisson et auvent (P286) ; 20 — siège (P290) ; 24 — collecteur (P284)
  const cab = api.sub('P286');
  cab.position.set(...CAB.o);
  P('41', cab, [0, 0.5, 0]);
  const seat = api.sub('P290');
  seat.position.set(...Cp(SEAT.at));
  seat.rotation.y = SEAT.rotY;
  P('20', seat, [0, 0.9, 0.2]);
  const man = api.sub('P284');
  man.position.set(...MANIF.at);
  P('24', man, [0, -0.35, -0.3]);

  // ---------------------------------------------------------------- 27 — panneau de visite arrière ; 21 — panneau avant du pupitre
  const tP = u(0.1875);
  const rear = panelXY(S, THREE, O.rear.w + 0.1, O.rear.h + 0.1, tP, 'grey', { r: 0.03 });
  const rearScrews = [];
  for (const k of [-2, -1, 0, 1, 2]) for (const s of [-1, 1]) {
    rearScrews.push(at(lathe([[0, 0], [0.008, 0], [0.008, 0.0015], [0.006, 0.0045], [0, 0.005]], 'zinc', { seg: 10 }), [k * 0.2, s * (O.rear.h / 2 + 0.035), tP / 2], [Math.PI / 2, 0, 0]));
  }
  const rearG = group(rear, merged(rearScrews, 'zinc'));
  rearG.rotation.y = -Math.PI / 2;
  rearG.position.set(-hx - tP / 2, O.rear.y, O.rear.z);
  P('27', C(rearG), [-0.25, 0, 0]);
  const front = panelXY(S, THREE, O.front.w + 0.08, O.front.h + 0.08, tP, 'grey', { r: 0.025 });
  const qt = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    const x = sx * (O.front.w / 2 + 0.018), y = sy * (O.front.h / 2 + 0.018);
    qt.push(at(lathe([[0, 0], [0.012, 0], [0.012, 0.004], [0.009, 0.007], [0, 0.007]], 'black', { seg: 14 }), [x, y, tP / 2], [Math.PI / 2, 0, 0]));
    qt.push(box(0.018, 0.005, 0.008, 'black', { pos: [x, y, tP / 2 + 0.009] }));
  }
  const frontG = group(front, merged(qt, 'black'));
  frontG.rotation.y = Math.PI / 2;
  frontG.position.set(nose + tP / 2, O.front.y, O.front.z);
  P('21', C(frontG), [0.25, 0, 0]);

  // ---------------------------------------------------------------- 22 — couvercle perforé du pupitre
  const lidPts = [[hx + t, hz - 0.012], [nose - 0.006, noseZ[1] - 0.004], [nose - 0.006, noseZ[0] + 0.004], [hx + t, -hz + 0.02]];
  const swHoles = [];
  for (let i = 0; i < 8; i++) for (const x of [0.44, 0.52]) swHoles.push([x, 0.02 + i * 0.07, 0.011]);
  const lid = prism(S, THREE, lidPts, tP, 'grey', 'xz', hc + tP / 2, { holes: swHoles });
  const plugs = merged(swHoles.map(([x, z]) => at(lathe([[0, 0], [0.0125, 0], [0.0125, 0.003], [0.009, 0.006], [0, 0.006]], 'rubber', { seg: 12 }), [x, hc + tP, z])), 'rubber');
  const lidHw = merged([
    S.at(cyl(0.007, 2 * hz - 0.1, 'zinc', { axis: 'z', seg: 10 }), [hx + t + 0.006, hc + tP, 0]),
    ...[0.12, 0.48].flatMap((z) => [
      S.at(cyl(0.005, 0.05, 'steel', { seg: 10 }), [nose + 0.012, hc - 0.025, z]),
      S.at(cyl(0.006, 0.05, 'steel', { axis: 'z', seg: 10 }), [nose + 0.012, hc - 0.05, z]),
      box(0.012, 0.014, 0.03, 'steel', { pos: [nose - 0.008, hc - 0.006, z] }),
    ]),
  ], 'steel');
  P('22', C(group(lid, plugs, lidHw)), [0.05, 0.3, 0]);

  // ---------------------------------------------------------------- 28 — trappe du plancher ; 29 — tôle du palier ; 25 — plaque de traversée
  const trap = H_.K.plate(O.floor.w, O.floor.d, u(0.25), 'grey', { r: 0.015, seg: 8 });
  trap.position.set(O.floor.x, t + u(0.125), O.floor.z);
  const trapScrews = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 0, 1]) trapScrews.push(at(lathe([[0, 0], [0.008, 0], [0.006, 0.002], [0, 0.002]], 'blackOxide', { seg: 10 }), [O.floor.x + sx * (O.floor.w / 2 - 0.018), t + u(0.25), O.floor.z + sz * (O.floor.d / 2 - 0.018)]));
  const lift = box(0.1, 0.004, 0.03, 'blackOxide', { r: 0.002, pos: [O.floor.x + 0.12, t + u(0.25) + 0.0005, O.floor.z + 0.18] });
  P('28', C(group(trap, merged(trapScrews, 'blackOxide'), lift)), [0, 0.35, 0]);
  const grip = [];
  for (let i = 0; i < 9; i++) for (let k = 0; k < 4; k++) grip.push([-0.29 + i * 0.07, -0.79 + k * 0.07, 0.012]);
  const landPl = prism(S, THREE, [[-hx + t, -hz + t], [-hx + t, land.z1], [hx, land.z1], [hx, -hz + t]], u(0.1875), 'grey', 'xz', land.y + u(0.094), { holes: grip });
  P('29', C(landPl), [0, 0.3, -0.15]);
  const mHoles = [];
  for (let i = 0; i < 11; i++) for (const x of [-0.06, -0.02, 0.02, 0.06]) mHoles.push([x, -0.25 + i * 0.05, 0.011]);
  const mp = prism(S, THREE, [[-0.11, -0.3], [0.11, -0.3], [0.125, -0.28], [0.125, 0.28], [0.11, 0.3], [-0.11, 0.3], [-0.125, 0.28], [-0.125, -0.28]], u(0.25), 'grey', 'xz', -u(0.125), { holes: mHoles });
  const mpG = group(mp, merged([-1, 1].flatMap((sx) => [-0.27, 0, 0.27].map((z) => at(lathe([[0, 0], [0.007, 0], [0.007, 0.004], [0, 0.004]], 'zinc', { seg: 6 }), [sx * 0.105, -u(0.25), z], [Math.PI, 0, 0]))), 'zinc'));
  mpG.position.set(O.under.x, 0, O.under.z);
  P('25', C(mpG), [0, -0.25, 0]);

  // ---------------------------------------------------------------- 43 — tableau des manomètres ; 14, 15, 16 — manomètres ; 48 — coudes
  const A = [-hx + t + 0.004, H - 0.045], B = [-hx + 0.08, H - 0.135];
  const sl = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const n = [(A[1] - B[1]) / sl, (B[0] - A[0]) / sl]; // normale du pan incliné (vers l'opérateur)
  const gz = [0.4, 0.3, 0.2, 0.1, 0, -0.1, -0.2, -0.3, -0.4];
  const rG = u(1.35); // boîtier Ø 2,7 po
  const face = panelXY(S, THREE, 0.98, sl + 0.02, u(0.1345), 'grey', { r: 0.008, holes: gz.map((z) => [z, 0, rG * 0.82]) });
  const faceIn = group(face); faceIn.rotation.y = -Math.PI / 2;
  // Pan incliné : plaque construite dans le plan z-y (épaisseur X), tournée autour de Z.
  const panG = group(faceIn);
  panG.rotation.z = Math.atan2(B[0] - A[0], A[1] - B[1]);
  panG.position.set((A[0] + B[0]) / 2, (A[1] + B[1]) / 2, 0);
  const flange = box(u(0.1345), 0.045, 0.98, 'grey', { pos: [-hx + t + u(0.067), H - 0.022, 0] });
  const lip = box(0.03, u(0.1345), 0.98, 'grey', { pos: [B[0] + 0.012, B[1] - 0.004, 0] });
  const panScrews = merged([-0.45, -0.15, 0.15, 0.45].map((z) => at(lathe([[0, 0], [0.007, 0], [0.005, 0.003], [0, 0.003]], 'zinc', { seg: 8 }), [-hx + t + u(0.1345), H - 0.02, z], [0, 0, -Math.PI / 2])), 'zinc');
  P('43', C(group(panG, flange, lip, panScrews)), [0.15, 0.25, 0]);
  // Manomètre à raccord arrière, face selon +Z local : boîtier inox, lunette, verre,
  // cadran, graduations, aiguille, six-pans et queue 1/8 NPT vers −Z.
  const gauge = (max) => {
    const r = rG;
    const ticks = [];
    for (let i = 0; i <= 10; i++) {
      const a = (-135 + i * 27) * (Math.PI / 180), l = r * (i % 2 ? 0.08 : 0.15), rr = r * 0.72 - l / 2;
      ticks.push(at(box(r * 0.03, l, 0.0006, 'black'), [Math.sin(a) * rr, Math.cos(a) * rr, 0.0045], [0, 0, -a]));
    }
    ticks.push(box(r * 0.5, r * 0.08, 0.0006, 'black', { pos: [0, -r * 0.35, 0.0045] }));
    const needleA = max > 3000 ? -0.9 : 0.4;
    return group(
      lathe([[0, -0.022], [r * 0.9, -0.022], [r * 0.97, -0.016], [r * 0.97, 0.002], [r, 0.003], [r, 0.007], [r * 0.9, 0.008], [r * 0.88, 0.004], [0, 0.004]], 'chrome', { seg: 24 }),
      at(cyl(r * 0.86, 0.001, 'white', { axis: 'z', seg: 24 }), [0, 0, 0.0035]),
      merged(ticks, 'black'),
      at(box(r * 0.04, r * 0.68, 0.0008, 'red'), [Math.sin(needleA) * r * 0.24, Math.cos(needleA) * r * 0.24, 0.005], [0, 0, -needleA]),
      at(cyl(r * 0.86, 0.0012, 'glass', { axis: 'z', seg: 24 }), [0, 0, 0.0068]),
      merged([
        at(lathe([[0, 0], [u(0.29), 0], [u(0.29), 0.006], [0, 0.006]], 'brass', { seg: 6 }), [0, 0, -0.028], [Math.PI / 2, 0, 0]),
        at(lathe([[0, 0], [u(0.2), 0], [u(0.2), 0.012], [0, 0.012]], 'brass', { seg: 10 }), [0, 0, -0.034], [Math.PI / 2, 0, 0]),
      ], 'brass'),
    );
  };
  const order = ['16', '14', '16', '16', '15', '15', '14', '14', '14'];
  const maxOf = { 14: 1000, 15: 1500, 16: 5000 };
  const cG = [(A[0] + B[0]) / 2 + n[0] * 0.006, (A[1] + B[1]) / 2 + n[1] * 0.006];
  const frameOf = (obj, z) => H_.pose(obj, [cG[0], cG[1], z], [-n[1], n[0], 0], [0, 0, -1]);
  gz.forEach((z, k) => {
    P(order[k], C(frameOf(gauge(maxOf[order[k]]), z)), [n[0] * 0.2, n[1] * 0.2, 0]);
    // 48 — coude 1/8 NPT → JIC -4 au bout de la queue, sortie vers le bas (derrière le pan).
    const el = H_.R.elbow({ port: 'npt', pd: 2, jd: 4 });
    const elP = H_.pose(el, [0, 0, -0.046], [0, 0, -1], [0, -1, 0]);
    P('48', C(frameOf(elP, z)), [-0.12, 0.05, 0]);
  });

  // ---------------------------------------------------------------- 38 — support et 39 — capot du moniteur de caméra
  const zM = -0.06, yM = H + 0.02, xM = -hx + 0.07;
  const mount = group(
    merged([
      box(0.006, 0.09, 0.1, 'black', { pos: [-hx + t + 0.003, H - 0.02, zM] }),
      at(box(0.09, 0.006, 0.1, 'black'), [-hx + 0.05, H + 0.018, zM], [0, 0, -0.35]),
    ], 'black'),
    // Écran 7 po (sans repère) : coque, cadre, dalle.
    merged([at(box(0.03, 0.12, 0.19, 'plastic', { r: 0.006 }), [xM, yM + 0.03, zM], [0, 0, -0.35])], 'plastic'),
    at(box(0.002, 0.095, 0.16, 'glass'), [xM + 0.016, yM + 0.036, zM], [0, 0, -0.35]),
  );
  P('38', C(mount), [0.1, 0.2, 0]);
  const hood = merged([
    at(box(0.07, 0.004, 0.22, 'black'), [xM + 0.015, yM + 0.105, zM], [0, 0, -0.35]),
    ...[-1, 1].map((s) => at(box(0.07, 0.13, 0.004, 'black'), [xM + 0.012, yM + 0.04, zM + s * 0.108], [0, 0, -0.35])),
  ], 'black');
  P('39', C(hood), [0.12, 0.3, 0]);

  // ---------------------------------------------------------------- 40 — guide de flexibles (paroi arrière, côté −Z)
  const yH = 0.62, xo = -hx - 0.07;
  P('40', C(group(
    tube([[-hx - 0.004, yH, -0.62], [xo, yH, -0.6], [xo, yH, -0.36], [-hx - 0.004, yH, -0.34]], 0.008, 'black', { seg: 24, radial: 8, ends: 'none', tension: 0.2 }),
    merged([-0.62, -0.34].map((z) => box(0.008, 0.05, 0.04, 'black', { r: 0.003, pos: [-hx - 0.004, yH, z] })), 'black'),
  )), [-0.15, 0, 0]);

  // ---------------------------------------------------------------- 23 — marchepied (côté −Z, devant la roue arrière gauche)
  const zs0 = -hz - 0.012, zs1 = -hz - 0.26, ys0 = -0.48, ys1 = land.y;
  const step = [];
  for (const x of [-0.22, 0.2]) step.push(prism(S, THREE, [[zs0, ys0], [zs1, ys0], [zs1, ys1 - 0.02], [zs1 + 0.02, ys1], [zs0, ys1]], u(0.375), 'lightGrey', 'zy', x, { polys: [rrect((zs0 + zs1) / 2, ys0 + 0.2, 0.14, 0.12, 0.03), rrect((zs0 + zs1) / 2, ys0 + 0.5, 0.14, 0.12, 0.03)] }));
  step.push(prism(S, THREE, [[-0.22, ys0 + 0.1], [0.2, ys0 + 0.1], [0.2, ys1], [-0.22, ys1]], u(0.25), 'lightGrey', 'xy', zs0 - u(0.125)));
  const bars = [];
  for (const y of [ys0 + 0.06, ys0 + 0.3, ys0 + 0.54, ys1 - 0.015]) {
    for (let k = 0; k < 8; k++) bars.push(box(0.41, 0.03, 0.004, 'zinc', { pos: [-0.01, y, zs0 - 0.015 - k * 0.032] }));
    for (const z of [zs0 - 0.01, zs1 + 0.01]) bars.push(box(0.41, 0.03, 0.006, 'zinc', { pos: [-0.01, y, z] }));
    for (const x of [-0.12, 0.1]) bars.push(at(cyl(0.004, 0.25, 'zinc', { axis: 'z', seg: 6 }), [x, y + 0.008, (zs0 + zs1) / 2]));
  }
  P('23', C(group(merged(step, 'lightGrey'), merged(bars, 'zinc'))), [0, 0, -0.35]);

  // ---------------------------------------------------------------- basculement : 31 arbre, 35 paliers, 30 axes d'arrêt, 1 épingles
  const hg = CAB.hinge;
  P('31', C(at(lathe([[0, -0.36], [0.0155, -0.36], [0.0159, -0.355], [0.0159, 0.355], [0.0155, 0.36], [0, 0.36]], 'steel', { seg: 18 }), [0, hg.y, hg.z], [0, 0, Math.PI / 2])), [0.3, 0, 0]);
  for (const x of [-0.3, -0.22, 0.22, 0.3]) {
    const outer = Math.abs(x) > 0.25;
    const bush = at(lathe([[0.0162, -0.0125], [0.026, -0.0125], [0.026, 0.0125], [0.0162, 0.0125], [0.0162, -0.0125]], outer ? 'lightGrey' : 'brass', { seg: 20 }), [x, hg.y, hg.z], [0, 0, Math.PI / 2]);
    const g = outer ? group(bush, prism(S, THREE, [[hg.z - 0.05, hg.y - 0.07], [hg.z + 0.05, hg.y - 0.07], [hg.z + 0.05, hg.y], [hg.z + 0.026, hg.y + 0.024], [hg.z - 0.026, hg.y + 0.024], [hg.z - 0.05, hg.y]], 0.019, 'lightGrey', 'zy', x, { holes: [[hg.z, hg.y, 0.026]] })) : bush;
    P('35', C(g), [x * 0.4, -0.08, 0.1]);
  }
  for (const s of [-1, 1]) {
    const x = s * 0.345;
    P('30', C(group(
      at(lathe([[0, -0.03], [0.0032, -0.03], [0.0032, 0.022], [0.007, 0.022], [0.007, 0.027], [0, 0.027]], 'steel', { seg: 10 }), [x, hg.y, hg.z]),
      at(S.washer(0.022, 0.0162, 0.003, 'zinc'), [x - s * 0.01, hg.y, hg.z], [0, 0, Math.PI / 2]),
    )), [s * 0.12, 0, 0]);
    P('1', C(tube([[x, hg.y - 0.024, hg.z], [x, hg.y - 0.034, hg.z], [x + 0.004, hg.y - 0.04, hg.z + 0.01], [x + 0.004, hg.y - 0.03, hg.z + 0.05], [x, hg.y - 0.024, hg.z + 0.1], [x, hg.y - 0.028, hg.z + 0.105]], u(0.094), 'zinc', { seg: 20, radial: 6, ends: 'none' })), [s * 0.12, -0.05, 0]);
  }

  // ---------------------------------------------------------------- 26 — vérin de basculement ; 32, 33 — axes
  const cy = CAB.cyl;
  const bore = u(2.5), r = bore / 2, rodR = r * 0.55;
  const len = (cy.z1 - cy.z0) - 0.6 * r - 0.9 * rodR;
  const tilt = hydCylinder(len, bore, { material: 'black', axis: 'z', ext: 0.3 });
  tilt.position.set(cy.x, cy.y, cy.z0 + 0.6 * r);
  P('26', C(tilt), [0, -0.2, 0]);
  const pinX = (x, y, z, L) => group(
    at(lathe([[0, -L / 2], [0.0125, -L / 2], [0.0127, -L / 2 + 0.002], [0.0127, L / 2], [0.018, L / 2], [0.018, L / 2 + 0.006], [0, L / 2 + 0.006]], 'steel', { seg: 14 }), [x, y, z], [0, 0, Math.PI / 2]),
    at(lathe([[0, -0.012], [0.002, -0.012], [0.002, 0.012], [0, 0.012]], 'zinc', { seg: 6 }), [x - L / 2 + 0.006, y, z]),
  );
  P('32', C(pinX(cy.x, cy.y, cy.z1, 0.075)), [0.1, -0.1, 0]);
  // 33 — axe du fût dans la chape du châssis (chape dessinée pour le situer).
  const clev = merged([-1, 1].map((s) => prism(S, THREE, [[cy.z0 - 0.04, cy.y - 0.04], [cy.z0 + 0.04, cy.y - 0.04], [cy.z0 + 0.03, cy.y + 0.035], [cy.z0 - 0.03, cy.y + 0.035]], 0.0127, 'lightGrey', 'zy', cy.x + s * 0.032, { holes: [[cy.z0, cy.y, 0.0135]] })), 'lightGrey');
  P('33', C(group(pinX(cy.x, cy.y, cy.z0, 0.085), clev)), [0.1, -0.1, 0]);

  // ---------------------------------------------------------------- 42 — support du verrou ; 34 — verrou rangé ; 5 — goupille en T
  const yL = 0.1, xL = -hx - 0.035;
  P('42', C(merged([0.24, 0.6].map(() => prism(S, THREE, [[-0.03, 0], [0.03, 0], [0.03, 0.06], [-0.03, 0.06]], 0.008, 'lightGrey', 'xy', 0, { holes: [[0, 0.03, 0.006]] })).map((m, i) => { const g = group(m); g.position.set(-hx - 0.03, yL - 0.03, [0.24, 0.6][i]); return g; }), 'lightGrey')), [-0.15, 0, 0]);
  const lock = prism(S, THREE, [[-0.03, -0.022], [0.03, -0.022], [0.03, 0.022], [0.024, 0.022], [0.024, -0.016], [-0.024, -0.016], [-0.024, 0.022], [-0.03, 0.022]], 0.42, 'safety', 'xy', 0);
  const lockG = group(lock, box(0.07, 0.006, 0.03, 'safety', { pos: [0, -0.025, 0.2] }));
  lockG.position.set(xL, yL + 0.03, 0.42);
  P('34', C(lockG), [-0.2, 0, 0]);
  P('5', C(group(
    at(lathe([[0, -0.07], [0.0045, -0.07], [0.0048, -0.066], [0.0048, 0], [0, 0]], 'steel', { seg: 10 }), [xL, yL + 0.06, 0.6]),
    at(cyl(0.006, 0.06, 'yellow', { axis: 'x', seg: 10 }), [xL, yL + 0.066, 0.6]),
    S.torus(0.009, 0.0015, 'steel', { pos: [xL + 0.035, yL + 0.066, 0.6], axis: 'z' }),
  )), [-0.15, 0.1, 0]);

  // ---------------------------------------------------------------- 19 — vérins de réglage de l'auvent (dans les fourreaux de P288)
  for (const s of [-1, 1]) {
    const b19 = u(1.5), r19 = b19 / 2, rod19 = r19 * 0.55;
    const L19 = (CANOPY.pin6 - CANOPY.pin5) - 0.6 * r19 - 0.9 * rod19;
    const c19 = hydCylinder(L19, b19, { material: 'black', axis: 'y', ext: 0.35 });
    c19.position.set(CANOPY.at[0] + s * CANOPY.post.x, CANOPY.at[1] + CANOPY.pin5 + 0.6 * r19, CANOPY.at[2]);
    P('19', C(c19), [0, 0.1, 0.25]);
  }

  // ---------------------------------------------------------------- 17 — support et 18 — extincteur 20 lb (palier d'accès)
  const xE = hx - 0.105, zE = -0.69, yE = land.y + u(0.1875);
  P('17', C(merged([
    box(0.006, 0.42, 0.08, 'red', { pos: [hx - 0.003, yE + 0.25, zE] }),
    ...[0.12, 0.38].map((y) => tube([[hx - 0.006, yE + y, zE - 0.06], [xE - 0.09, yE + y, zE - 0.07], [xE - 0.1, yE + y, zE], [xE - 0.09, yE + y, zE + 0.07], [hx - 0.006, yE + y, zE + 0.06]], 0.004, 'red', { seg: 16, radial: 4, ends: 'none' })),
    box(0.1, 0.006, 0.12, 'red', { pos: [xE + 0.04, yE + 0.003, zE] }),
  ], 'red')), [0.12, 0, 0]);
  const rE = 0.089;
  const ext = group(
    lathe([[0, 0.006], [rE - 0.01, 0.006], [rE, 0.02], [rE, 0.43], [rE - 0.03, 0.47], [0.03, 0.49], [0, 0.49]], 'red', { seg: 28 }),
    merged([
      lathe([[0, 0.49], [0.025, 0.49], [0.025, 0.53], [0.018, 0.54], [0, 0.54]], 'chrome', { seg: 14 }),
      at(box(0.12, 0.012, 0.03, 'chrome', { r: 0.004 }), [-0.03, 0.56, 0], [0, 0, 0.12]),
      at(box(0.11, 0.01, 0.026, 'chrome', { r: 0.004 }), [-0.035, 0.535, 0], [0, 0, -0.05]),
    ], 'chrome'),
    at(S.gauge(0.014, { axis: '-z' }), [0, 0.515, -0.026]),
    tube([[0.02, 0.51, 0.01], [0.08, 0.45, 0.05], [0.095, 0.25, 0.07], [0.085, 0.1, 0.07]], 0.007, 'hose', { seg: 24, radial: 8 }),
    at(cyl(0.012, 0.06, 'black', { r2: 0.008, seg: 12 }), [0.085, 0.07, 0.07]),
    at(S.nameplate(0.1, 0.12, { material: 'white', ink: 'black' }), [-rE - 0.001, 0.25, 0], [0, -Math.PI / 2, 0]),
  );
  ext.position.set(xE, yE, zE);
  P('18', C(ext), [0, 0.2, 0]);

  // ---------------------------------------------------------------- 2 — pédale de frein ; 6 — valve de frein et ses raccords
  const xV = 0.3, yV = -0.075, zV = -0.47; // centre du corps de valve (sous le plancher)
  const VB = { x: 0.08, y: 0.07, z: 0.14 };
  const yF = t + u(0.25); // dessus de la trappe 28
  const zHinge = -0.33;
  P('2', C(group(
    merged([
      box(0.14, 0.008, 0.1, 'black', { r: 0.003, pos: [0.22, yF + 0.004, zHinge] }),
      ...[-1, 1].map((s) => box(0.008, 0.04, 0.03, 'black', { pos: [0.22 + s * 0.06, yF + 0.02, zHinge] })),
      at(box(0.035, 0.012, 0.2, 'black', { r: 0.004 }), [0.22, yF + 0.09, zHinge - 0.085], [0.72, 0, 0]),
      box(0.012, 0.09, 0.012, 'black', { pos: [0.27, yF - 0.04, zHinge] }),
    ], 'black'),
    at(box(0.1, 0.02, 0.14, 'rubber', { r: 0.006 }), [0.22, yF + 0.155, zHinge - 0.15], [0.72, 0, 0]),
    merged([0, 1, 2, 3, 4].map((i) => at(box(0.1, 0.004, 0.006, 'rubber'), [0.22, yF + 0.165 - i * 0.017, zHinge - 0.112 - i * 0.018], [0.72, 0, 0])), 'rubber'),
    at(cyl(0.006, 0.1, 'steel', { axis: 'x', seg: 10 }), [0.22, yF + 0.025, zHinge]),
    S.spring(0.008, 0.0015, 0.06, 8, 'steel', { pos: [0.25, yF + 0.035, zHinge - 0.04], axis: 'y' }),
    // tringle de commande vers la chape à fourche de la valve
    tube([[0.27, yF - 0.08, zHinge], [0.29, yV + 0.01, zHinge - 0.01], [xV, yV, zV + VB.z / 2 + 0.07]], 0.004, 'steel', { seg: 12, radial: 6, ends: 'none' }),
  )), [0, 0.3, 0]);
  // 6 — corps de valve (fonte), piston de commande vers +Z, patte de fixation côté −X.
  const valve = group(
    box(VB.x, VB.y, VB.z, 'castIron', { r: 0.003, pos: [xV, yV, zV] }),
    merged([
      at(cyl(0.016, 0.04, 'castIron', { axis: 'z', seg: 18 }), [xV, yV, zV + VB.z / 2 + 0.02]),
    ], 'castIron'),
    at(cyl(0.006, 0.03, 'chrome', { axis: 'z', seg: 10 }), [xV, yV, zV + VB.z / 2 + 0.05]),
    at(S.torus(0.009, 0.003, 'rubber', { axis: 'z' }), [xV, yV, zV + VB.z / 2 + 0.041]),
    // patte soudée sous le plancher (dessinée avec la valve pour la situer)
    box(0.008, -yV + VB.y / 2, VB.z, 'lightGrey', { pos: [xV - VB.x / 2 - 0.004, (yV - VB.y / 2) / 2 + 0.0, zV] }),
  );
  P('6', C(valve), [0, -0.2, 0]);
  // 4 — chape à fourche M10 × 1,5 au bout du piston.
  P('4', C(group(
    merged([
      box(0.024, 0.024, 0.016, 'zinc', { r: 0.003, pos: [xV, yV, zV + VB.z / 2 + 0.073] }),
      ...[-1, 1].map((s) => box(0.006, 0.024, 0.03, 'zinc', { r: 0.002, pos: [xV + s * 0.009, yV, zV + VB.z / 2 + 0.095] })),
      at(cyl(0.004, 0.03, 'steel', { axis: 'x', seg: 8 }), [xV, yV, zV + VB.z / 2 + 0.1]),
    ], 'zinc'),
  )), [0, 0, 0.12]);
  // 49 — vis CHC 5/16 × 3 et 50 — rondelles à collet haut (face +X → patte).
  const sPts = [[0.025, -0.035], [0.025, 0.035], [-0.025, 0]];
  for (const [dy, dz] of sPts) {
    const p = [xV + VB.x / 2, yV + dy, zV + dz];
    P('50', C(H_.washer(0.3125, p, [1, 0, 0], 'hc')), [0.1, 0, 0]);
    P('49', C(H_.capscrew(0.3125, 3.0, [p[0] + H_.wT(0.3125, 'hc'), p[1], p[2]], [1, 0, 0])), [0.15, 0, 0]);
  }
  // Raccords : face +X (rangée médiane), dessous, dessus, bout −Z.
  const fx = xV + VB.x / 2, by = yV - VB.y / 2, ty = yV + VB.y / 2, ez = zV - VB.z / 2;
  const onX = (obj, y, z) => C(H_.pose(obj, [fx, y, z], [1, 0, 0], [0, 1, 0]));
  P('9', onX(H_.metric(18, 12), yV, zV - 0.05), [0.12, 0, 0]);
  P('13', onX(group(H_.R.hexY(0.022, 0, 0.008), lathe([[0, -0.012], [0.009, -0.012], [0.009, 0], [0, 0]], 'zinc', { seg: 10 })), yV, zV - 0.015), [0.12, 0, 0]);
  // 10 → 45 (té de branche) → 44 (réduction -6 → -4 sur la branche), deux fois en face +X.
  for (const z of [zV + 0.02, zV + 0.055]) {
    P('10', onX(H_.metric(16, 6), yV, z), [0.12, 0, 0]);
    const tee = C(H_.pose(H_.R.swivel({ kind: 'tee', fd: 6, jd: 6 }), [fx + H_.metricTip(16, 6), yV, z], [1, 0, 0], [0, -1, 0]));
    P('45', tee, [0.18, 0, 0]);
    const br = H_.port(tee.children[0], 1);
    P('44', C(H_.pose(H_.R.swivel({ kind: 'reducer', fd: 6, jd: 4 }), br.p, br.d, [1, 0, 0])), [0.18, -0.06, 0]);
  }
  // Dessous : 10 → 47 (té de passage tournant) → 44 sur la branche, deux fois.
  const onY = (obj, x, z, dn) => C(H_.pose(obj, [x, dn ? by : ty, z], [0, dn ? -1 : 1, 0], [0, 0, 1]));
  for (const z of [zV - 0.035, zV + 0.025]) {
    P('10', onY(H_.metric(16, 6), xV, z, true), [0, -0.12, 0]);
    const tee = C(H_.pose(H_.R.swivel({ kind: 'tee', fd: 6, jd: 6 }), [xV, by - H_.metricTip(16, 6), z], [0, -1, 0], [0, 0, 1]));
    P('47', tee, [0, -0.18, 0]);
    const br = H_.port(tee.children[0], 1);
    P('44', C(H_.pose(H_.R.swivel({ kind: 'reducer', fd: 6, jd: 4 }), br.p, br.d, [0, 1, 0])), [0, -0.18, 0.06]);
  }
  // Dessus : 7 (M10 → -4) coiffé de l'élargisseur tournant 46 (-4 → -6) ; deux 11 (M12 → -6).
  P('7', onY(H_.metric(10, 4), xV - 0.012, zV - 0.035, false), [0, 0.1, 0]);
  P('46', C(H_.pose(H_.R.swivel({ kind: 'reducer', fd: 4, jd: 6 }), [xV - 0.012, ty + H_.metricTip(10, 4), zV - 0.035], [0, 1, 0], [1, 0, 0])), [0, 0.16, 0]);
  P('11', onY(H_.metric(12, 6), xV + 0.015, zV + 0.005, false), [0, 0.1, 0]);
  P('11', onY(H_.metric(12, 6), xV - 0.012, zV + 0.045, false), [0, 0.1, 0]);
  // Bout −Z : 8 (M16 → -8), bouchon M16 (12), 10 (M16 → -6).
  const onZ = (obj, x, y) => C(H_.pose(obj, [x, y, ez], [0, 0, -1], [1, 0, 0]));
  P('8', onZ(H_.metric(16, 8), xV - 0.018, yV + 0.012), [0, 0, -0.12]);
  P('12', onZ(group(H_.R.hexY(0.019, 0, 0.007), lathe([[0, -0.011], [0.008, -0.011], [0.008, 0], [0, 0]], 'zinc', { seg: 10 })), xV + 0.018, yV + 0.012), [0, 0, -0.12]);
  P('10', onZ(H_.metric(16, 6), xV, yV - 0.018), [0, 0, -0.12]);
  return { view: { dir: [1.1, 0.75, -1.15] } };
}

// Tête de rotation RH6230-A-SP (P138), son émerillon d'air (P140) et sa boîte
// d'engrenages (P142). Repère : axe de rotation (tiges de forage) selon Y à
// l'origine, carter entre y = -0.14 et 0.14, bride de fixation à l'arrière
// (z ≈ -0.215) contre la plaque porte-tête. Proportions tirées des coupes du
// manuel (pages 140 et 144).

const IN = 0.0254;
const XP = 0.235; // entraxe arbre / pignons
export const TOPDRIVE = { flangeZ: -0.235, pinionX: XP };

// Contour du carter vu de dessus : couronne centrale et deux lobes de pignons.
function lobes(R0, rp, xp, n = 96) {
  const circles = [[0, 0, R0], [xp, 0, rp], [-xp, 0, rp]];
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const dx = Math.cos(a), dy = Math.sin(a);
    let best = 0;
    for (const [cx, cy, r] of circles) {
      const b = dx * cx + dy * cy;
      const disc = b * b - (cx * cx + cy * cy) + r * r;
      if (disc >= 0) best = Math.max(best, b + Math.sqrt(disc));
    }
    pts.push([dx * best, dy * best]);
  }
  return pts;
}

// Tranche du carter entre y0 et y1 (profil lobé extrudé selon Y).
function slab(api, pts, y0, y1, material) {
  const m = api.S.extrude(pts, y1 - y0, material);
  m.rotation.x = -Math.PI / 2;
  m.position.y = (y0 + y1) / 2;
  return m;
}

// P142 — Boîte d'engrenages RH6230-A : carter, arbre creux et grande couronne,
// deux pignons de 15 dents, roulements, chapeau, logement de joints.
export function P142(api) {
  const { box, cyl, ring, gear, bolt, nut, torus, fitting, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const outline = lobes(0.2, 0.115, XP);
  const OUT = 0.62; // sortie des pièces internes vers l'avant en vue éclatée

  // 6 — carter (moitiés haute et basse) avec bride arrière ; 2 — joint de plan
  P('6', group(
    slab(api, outline, -0.14, 0.055, 'charcoal'),
    slab(api, outline, 0.06, 0.14, 'charcoal'),
    at(box(0.32, 0.34, 0.04, 'charcoal'), [0, 0, -0.215]),
  ), [0, 0, 0]);
  P('2', slab(api, outline, 0.055, 0.06, 'cream'), [0.85, 0.06, 0]);

  // Ensemble arbre (sort à l'avant, comme la vue « driveshaft subassembly »)
  P('11', ring(0.065, 0.045, 0.45, 'steel', { pos: [0, -0.03, 0], seg: 40 }), [0, 0, OUT]);
  P('4', gear(0.165, 0.18, 64, 0.09, 'steel', { axis: 'y', hole: 0.065 }), [0, 0, OUT]);
  P('7', ring(0.085, 0.065, 0.015, 'darkSteel', { pos: [0, 0.0525, 0] }), [0, 0.03, OUT]);
  P('8', ring(0.08, 0.065, 0.05, 'darkSteel', { pos: [0, -0.07, 0] }), [0, -0.03, OUT]);
  P('18', cyl(0.09, 0.035, 'steel', { r2: 0.075, pos: [0, 0.08, 0] }), [0, 0.07, OUT]);
  P('18', cyl(0.075, 0.035, 'steel', { r2: 0.09, pos: [0, -0.1125, 0] }), [0, -0.07, OUT]);
  P('10', ring(0.08, 0.065, 0.015, 'darkSteel', { pos: [0, 0.105, 0] }), [0, 0.1, OUT]);
  P('9', ring(0.075, 0.065, 0.05, 'darkSteel', { pos: [0, 0.14, 0] }), [0, 0.14, OUT]);
  P('9', ring(0.075, 0.065, 0.05, 'darkSteel', { pos: [0, -0.155, 0] }), [0, -0.12, OUT]);
  // 17 — cuvettes des roulements coniques (restent dans le carter, sortent en hauteur)
  P('17', ring(0.105, 0.09, 0.035, 'steel', { pos: [0, 0.08, 0] }), [0, 0.42, 0]);
  P('17', ring(0.105, 0.09, 0.035, 'steel', { pos: [0, -0.1125, 0] }), [0, -0.42, 0]);

  // 5 — pignons (avec leur arbre), 16 — roulements des pignons
  for (const s of [1, -1]) {
    P('5', group(
      gear(0.042, 0.055, 15, 0.1, 'steel', { axis: 'y' }),
      cyl(0.028, 0.22, 'steel'),
    ).translateX(s * XP), [s * 0.45, 0, 0]);
    for (const y of [0.085, -0.085]) P('16', ring(0.052, 0.028, 0.025, 'steel', { pos: [s * XP, y, 0] }), [s * 0.45, Math.sign(y) * 0.2, 0]);
  }

  // 13 — logement de joints (haut) et 3 son joint ; 12 — chapeau de roulement (bas) et 1 cales
  P('13', ring(0.15, 0.078, 0.06, 'charcoal', { pos: [0, 0.17, 0], seg: 40 }), [0, 0.6, 0]);
  P('3', ring(0.15, 0.078, 0.002, 'cream', { pos: [0, 0.141, 0], seg: 40 }), [0, 0.5, 0]);
  P('12', ring(0.15, 0.08, 0.07, 'charcoal', { pos: [0, -0.175, 0], seg: 40 }), [0, -0.6, 0]);
  P('1', ring(0.17, 0.12, 0.003, 'steel', { pos: [0, -0.1415, 0], seg: 40 }), [0, -0.48, 0]);
  // 15 — joints à lèvre, 20 — cache-poussière (le bas se monte sur le raccord d'usure)
  P('15', ring(0.078, 0.066, 0.014, 'rubber', { pos: [0, 0.19, 0] }), [0, 0.78, 0]);
  P('15', ring(0.078, 0.066, 0.014, 'rubber', { pos: [0, -0.2, 0] }), [0, -0.78, 0]);
  P('20', cyl(0.09, 0.02, 'rubber', { r2: 0.072, pos: [0, 0.21, 0] }), [0, 0.92, 0]);
  P('20', cyl(0.072, 0.02, 'rubber', { r2: 0.09, pos: [0, -0.22, 0] }), [0, -0.92, 0]);

  // Boulonnerie : 27/32 logement de joints, 30/31 chapeau, 28/33 et 29/34 carter
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const x = Math.cos(a) * 0.125, z = Math.sin(a) * 0.125;
    P('27', bolt(0.375 * IN, 2.25 * IN, 'steel', { pos: [x, 0.2015, z] }), [0, 0.95, 0]);
    P('32', ring(0.011, 0.005, 0.0015, 'steel', { pos: [x, 0.2008, z] }), [0, 0.86, 0]);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.cos(a) * 0.125, z = Math.sin(a) * 0.125;
    P('30', bolt(0.75 * IN, 2.25 * IN, 'steel', { axis: '-y', pos: [x, -0.212, z] }), [0, -0.95, 0]);
    P('31', ring(0.02, 0.01, 0.003, 'steel', { pos: [x, -0.2115, z] }), [0, -0.85, 0]);
  }
  [[0.3, 0.07], [0.3, -0.07], [-0.3, 0.07], [-0.3, -0.07], [0.11, 0.155], [-0.11, 0.155]].forEach(([x, z]) => {
    P('28', bolt(0.5 * IN, 3.75 * IN, 'steel', { pos: [x, 0.143, z] }), [0, 0.7, 0]);
    P('33', ring(0.014, 0.0066, 0.003, 'steel', { pos: [x, 0.1415, z] }), [0, 0.62, 0]);
  });
  [[0.1, -0.16], [-0.1, -0.16], [0.25, -0.09], [-0.25, -0.09]].forEach(([x, z]) => {
    P('29', bolt(0.75 * IN, 4 * IN, 'steel', { pos: [x, 0.143, z] }), [0, 0.8, 0]);
    P('34', ring(0.02, 0.01, 0.003, 'steel', { pos: [x, 0.1415, z] }), [0, 0.7, 0]);
  });
  // 14 — vis sans tête du chapeau
  for (const s of [1, -1]) P('14', cyl(0.0064, 0.02, 'black', { axis: 'x', pos: [s * 0.152, -0.175, 0] }), [s * 0.2, -0.6, 0]);

  // Bouchons et remplissage : 21 bouchon M18 + 19 joint, 22 adaptateur de remplissage,
  // 23 bouchons fraisés (dessous), 24 bouchons du chapeau, 25 / 26 bouchons carrés
  P('21', nut(0.026, 0.012, 'steel', { axis: 'z', pos: [0.05, -0.05, 0.2] }), [0, 0, 0.35]);
  P('19', torus(0.01, 0.002, 'rubber', { axis: 'z', pos: [0.05, -0.05, 0.194] }), [0, 0, 0.28]);
  P('22', at(fitting(0.022, 0.045, 'steel'), [0.1, 0.16, 0.1]), [0, 0.45, 0.2]);
  [[0.22, 0.05], [0.22, -0.05], [-0.22, 0.05], [-0.22, -0.05]].forEach(([x, z]) => P('23', cyl(0.008, 0.006, 'steel', { pos: [x, -0.143, z] }), [0, -0.3, 0]));
  P('24', cyl(0.007, 0.01, 'steel', { axis: 'z', pos: [0, -0.175, 0.152] }), [0, -0.6, 0.2]);
  P('24', cyl(0.007, 0.01, 'steel', { axis: 'z', pos: [0.1, -0.175, 0.114] }), [0, -0.6, 0.2]);
  P('25', box(0.018, 0.02, 0.018, 'steel', { pos: [-0.12, 0.15, 0.08] }), [0, 0.35, 0]);
  P('26', box(0.024, 0.025, 0.024, 'steel', { pos: [0.15, 0.152, -0.05] }), [0, 0.35, 0]);
  return { view: { dir: [0.85, 0.75, 1.15] } };
}

// P140 — Émerillon d'air : axe Y, y = 0 au bas du filetage (vissé dans l'arbre).
export function P140(api) {
  const { box, cyl, ring, torus, nut, bolt, fitting, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  // 1 — corps tournant (filetage en bas), 2 — couvercle
  P('1', group(
    at(cyl(0.075, 0.13, 'darkSteel', { seg: 40 }), [0, 0.118, 0]),
    at(cyl(0.0406, 0.0533, 'darkSteel'), [0, 0.0267, 0]),
    ...[0.008, 0.018, 0.028, 0.038, 0.048].map((y) => at(torus(0.0406, 0.0018, 'darkSteel'), [0, y, 0])),
  ), [0, 0, 0]);
  P('2', ring(0.075, 0.045, 0.033, 'darkSteel', { pos: [0, 0.1995, 0], seg: 40 }), [0, 0.22, 0]);
  // 3 — grand tube fixe (bloc d'arrivée d'air en haut), 5 — petit tube central, 23 / 26 — écrou et rondelle
  P('3', group(
    at(cyl(0.036, 0.176, 'steel'), [0, 0.182, 0]),
    at(box(0.075, 0.07, 0.075, 'steel', { r: 0.004 }), [0, 0.305, 0]),
    at(cyl(0.022, 0.006, 'black', { axis: 'x' }), [0.0385, 0.305, 0]),
  ), [0, 0.42, 0]);
  P('5', cyl(0.008, 0.315, 'chrome', { pos: [0, 0.198, 0] }), [0, 0.62, 0]);
  P('26', ring(0.02, 0.012, 0.003, 'steel', { pos: [0, 0.3415, 0] }), [0, 0.7, 0]);
  P('23', nut(0.034, 0.015, 'steel', { pos: [0, 0.3505, 0] }), [0, 0.78, 0]);
  P('18', torus(0.012, 0.0025, 'rubber', { pos: [0, 0.31, 0] }), [-0.18, 0.45, 0]);
  // Roulements et entretoise (sortent à droite) ; joints et bagues (à gauche)
  P('11', ring(0.06, 0.04, 0.023, 'steel', { pos: [0, 0.166, 0] }), [0.3, 0.05, 0]);
  P('11', ring(0.06, 0.04, 0.023, 'steel', { pos: [0, 0.1335, 0] }), [0.3, -0.05, 0]);
  P('8', ring(0.05, 0.04, 0.01, 'darkSteel', { pos: [0, 0.15, 0] }), [0.3, 0, 0]);
  P('7', ring(0.04, 0.036, 0.119, 'chrome', { pos: [0, 0.154, 0] }), [0.18, 0.12, 0]);
  P('9', ring(0.05, 0.04, 0.016, 'darkSteel', { pos: [0, 0.195, 0] }), [-0.25, 0.12, 0]);
  P('14', ring(0.05, 0.04, 0.01, 'rubber', { pos: [0, 0.21, 0] }), [-0.25, 0.18, 0]);
  P('10', ring(0.075, 0.05, 0.0015, 'steel', { pos: [0, 0.183, 0], seg: 40 }), [0, 0.17, 0]);
  P('4', ring(0.06, 0.036, 0.015, 'darkSteel', { pos: [0, 0.104, 0] }), [-0.25, 0, 0]);
  P('12', torus(0.04, 0.004, 'rubber', { pos: [0, 0.104, 0] }), [-0.25, -0.05, 0]);
  P('15', torus(0.06, 0.0025, 'rubber', { pos: [0, 0.106, 0] }), [-0.25, -0.08, 0]);
  P('16', ring(0.063, 0.058, 0.003, 'white', { pos: [0, 0.1, 0] }), [-0.25, -0.11, 0]);
  P('17', ring(0.045, 0.038, 0.002, 'steel', { pos: [0, 0.117, 0] }), [0.3, -0.12, 0]);
  // Bas de l'émerillon : 6 bouchon de joint, 13 petit joint tournant, 19 roulement, 20 circlip, 25 joint torique
  P('6', ring(0.02, 0.009, 0.018, 'darkSteel', { pos: [0, 0.07, 0] }), [-0.2, -0.1, 0]);
  P('13', torus(0.012, 0.003, 'rubber', { pos: [0, 0.057, 0] }), [-0.2, -0.14, 0]);
  P('19', ring(0.02, 0.01, 0.012, 'steel', { pos: [0, 0.048, 0] }), [-0.2, -0.18, 0]);
  P('20', ring(0.021, 0.015, 0.0015, 'steel', { pos: [0, 0.04, 0] }), [-0.2, -0.22, 0]);
  P('25', torus(0.04, 0.003, 'rubber', { pos: [0, 0.01, 0] }), [0, -0.2, 0]);
  // 22 / 21 — vis du couvercle (8) et rondelles ; 24 — graisseur
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.cos(a) * 0.06, z = Math.sin(a) * 0.06;
    P('22', bolt(0.375 * IN, 1.75 * IN, 'steel', { pos: [x, 0.2175, z] }), [0, 0.42, 0]);
    P('21', ring(0.009, 0.005, 0.002, 'steel', { pos: [x, 0.217, z] }), [0, 0.34, 0]);
  }
  P('24', at(fitting(0.008, 0.02, 'brass', { axis: 'x' }), [0.078, 0.12, 0]), [0.2, 0, 0]);
  return { view: { dir: [0.8, 0.45, 1.2] } };
}

// Tête de rotation complète RH6230-A-SP : boîte d'engrenages, deux moteurs,
// émerillon d'air, piston cannelé et ressort, raccord d'usure. Paramètres :
// repères de la liste (R), feuilles des sous-assemblages (sub), moteurs
// (k : échelle ME18 = 1), raccord d'usure (rSub, rayon du filetage).
const TK_ASSY = {
  sub: { gearbox: 'P142', swivel: 'P140' },
  R: {
    piston: '1', spring: '2', saverSub: '3', swivel: '4', insert: '5', motor: '6', cap: '7',
    pistonRing: '8', swivelRing: '9', gearbox: '10', insertBolt: '11', flangeBolt: '12',
    motorBolt: '13', insertWasher: '14', motorWasher: '15', flangeWasher: '16',
  },
  k: 1,
  rSub: 0.05,
};

export function topdriveAssembly(api, { sub, R, k, rSub }) {
  const { box, cyl, ring, torus, spring, gear, bolt, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  P(R.gearbox, api.sub(sub.gearbox), [0, 0, 0]);

  // Moteurs hydrauliques sur les pignons (corps et capot à l'échelle k, bride
  // identique) ; bouchons M12 (TK seulement) ; vis et rondelles de bride.
  const motor = () => group(
    at(box(0.15, 0.03, 0.15, 'black', { r: 0.004 }), [0, 0.015, 0]),
    at(box(0.13, 0.07, 0.17, 'black', { r: 0.008 }), [0, 0.065, 0.01]),
    at(cyl(0.085 * k, 0.13 * k, 'black', { seg: 36 }), [0, 0.1 + 0.065 * k, 0]),
    at(cyl(0.07 * k, 0.02, 'darkSteel', { seg: 36 }), [0, 0.11 + 0.13 * k, 0]),
    at(cyl(0.012, 0.06, 'steel'), [0, -0.03, 0]),
    at(cyl(0.015, 0.01, 'steel', { axis: 'z' }), [0.035, 0.065, 0.1]),
    at(cyl(0.015, 0.01, 'steel', { axis: 'z' }), [-0.035, 0.065, 0.1]),
  );
  for (const s of [1, -1]) {
    P(R.motor, at(motor(), [s * XP, 0.14, 0]), [s * 0.12, 0.5, 0]);
    if (R.cap) P(R.cap, cyl(0.009, 0.012, 'red', { axis: 'x', pos: [s * (XP + 0.066), 0.205, 0] }), [s * 0.3, 0.55, 0]);
    for (const [dx, dz] of [[0.06, 0.06], [-0.06, 0.06], [0.06, -0.06], [-0.06, -0.06]]) {
      P(R.motorBolt, bolt(0.5 * IN, 1.5 * IN, 'black', { pos: [s * XP + dx, 0.173, dz] }), [s * 0.12, 0.85, 0]);
      P(R.motorWasher, ring(0.013, 0.0066, 0.003, 'steel', { pos: [s * XP + dx, 0.1715, dz] }), [s * 0.12, 0.75, 0]);
    }
  }

  // Émerillon d'air vissé en haut de l'arbre et son joint torique
  P(R.swivel, at(api.sub(sub.swivel), [0, 0.2 - 0.0533, 0]), [0, 0.75, 0]);
  P(R.swivelRing, torus(0.06, 0.003, 'rubber', { pos: [0, 0.2, 0] }), [0, 0.45, 0]);
  // Piston cannelé, son joint torique et ressort (dans l'arbre, sortent à droite)
  P(R.piston, group(
    at(cyl(0.035, 0.04, 'steel'), [0, 0.17, 0]),
    at(gear(0.022, 0.028, 10, 0.1, 'steel', { axis: 'y' }), [0, 0.1, 0]),
  ), [0.55, 0.35, 0]);
  P(R.pistonRing, torus(0.035, 0.003, 'rubber', { pos: [0, 0.185, 0] }), [0.55, 0.5, 0]);
  P(R.spring, spring(0.03, 0.004, 0.11, 7, 'steel', { pos: [0, 0.0, 0] }), [0.55, 0.15, 0]);
  // Insert cannelé au bas de l'arbre, sa vis et sa rondelle
  P(R.insert, group(
    ring(0.045, 0.025, 0.035, 'steel', { pos: [0, -0.24, 0] }),
    gear(0.05, 0.062, 8, 0.01, 'steel', { axis: 'y', hole: 0.025, pos: [0, -0.255, 0] }),
  ), [0, -0.35, 0.3]);
  P(R.insertBolt, bolt(0.25 * IN, 0.75 * IN, 'steel', { axis: '-y', pos: [0.035, -0.262, 0] }), [0, -0.45, 0.3]);
  P(R.insertWasher, ring(0.008, 0.0035, 0.0015, 'steel', { pos: [0.035, -0.2612, 0] }), [0, -0.4, 0.3]);
  // Raccord d'usure (filetage en haut, six pans en bas)
  P(R.saverSub, group(
    at(cyl(rSub, 0.045, 'steel'), [0, -0.2775, 0]),
    ...[-0.264, -0.274, -0.284, -0.294].map((y) => at(torus(rSub, 0.002, 'steel'), [0, y, 0])),
    at(cyl(0.065, 0.07, 'steel', { seg: 6 }), [0, -0.335, 0]),
  ), [0, -0.55, 0]);

  // Boulons de la bride arrière (2 colonnes de 5) et rondelles
  for (const x of [-0.12, 0.12]) for (const y of [-0.13, -0.065, 0, 0.065, 0.13]) {
    P(R.flangeBolt, bolt(0.75 * IN, 2.25 * IN, 'steel', { axis: 'z', pos: [x, y, -0.192] }), [0, 0, -0.45]);
    P(R.flangeWasher, ring(0.02, 0.01, 0.003, 'steel', { axis: 'z', pos: [x, y, -0.1935] }), [0, 0, -0.36]);
  }
  void cyl;
  return { view: { dir: [0.85, 0.6, 1.2] } };
}

// P138 — DU311-TVK : moteurs ME18, raccord d'usure #28, bouchons M12.
export function P138(api) {
  return topdriveAssembly(api, TK_ASSY);
}

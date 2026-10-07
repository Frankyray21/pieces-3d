// Mât et tables (F14), mât (F15), table supérieure / chariot (F16),
// table inférieure / avance d'extension (F17), tête de rotation (F18).
// Repère du mât : axe du mât selon +X (pied à x = 0, sommet à x = 2.9),
// face de la tête de rotation vers +Y. L'axe des tiges de forage est à y = ROD_Y.

export const MAST = { length: 2.9, rodY: 0.59, carriageX: 2.0, extFeedX: 0.6 };

function halfShell(api, rOut, rIn, len, side, material) {
  // Demi-coquille (mâchoire, centreur) d'axe X occupant le côté +Z (side=1) ou -Z (side=-1).
  const pts = [];
  const n = 12;
  for (let i = 0; i <= n; i++) { const a = Math.PI / 2 + (i / n) * Math.PI; pts.push([Math.cos(a) * rOut, Math.sin(a) * rOut]); }
  for (let i = n; i >= 0; i--) { const a = Math.PI / 2 + (i / n) * Math.PI; pts.push([Math.cos(a) * rIn, Math.sin(a) * rIn]); }
  const m = api.S.extrude(pts, len, material);
  const g = new api.THREE.Group();
  m.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
  g.add(m);
  return g;
}

export function F18(api) {
  const { box, cyl, ring, nut, bolt, fitting, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  P('3', group(
    cyl(0.2, 0.3, 'red', { axis: 'x', seg: 40 }),
    at(box(0.34, 0.14, 0.42, 'red', { r: 0.02 }), [0, -0.13, 0]),
    at(box(0.42, 0.03, 0.5, 'red'), [0, -0.22, 0]),
    at(box(0.26, 0.07, 0.2, 'red', { r: 0.015 }), [0, 0.2, 0]),
    at(cyl(0.12, 0.04, 'red', { axis: 'x' }), [-0.16, 0, 0]),
    at(box(0.12, 0.2, 0.36, 'red', { r: 0.02 }), [0.17, -0.02, 0]),
  ), [0, 0, 0]);
  P('2', ring(0.17, 0.055, 0.015, 'red', { axis: 'x', pos: [-0.2, 0, 0], seg: 40 }), [-0.28, 0, 0]);
  P('1', group(
    at(nut(0.17, 0.07, 'black', { axis: 'x' }), [-0.36, 0, 0]),
    at(cyl(0.066, 0.1, 'black', { axis: 'x' }), [-0.27, 0, 0]),
  ), [-0.55, 0, 0]);
  for (const s of [1, -1]) {
    P('4', group(
      at(box(0.03, 0.13, 0.13, 'black', { r: 0.01 }), [0.245, -0.04, s * 0.14]),
      at(cyl(0.07, 0.17, 'black', { axis: 'x' }), [0.345, -0.04, s * 0.14]),
      at(cyl(0.015, 0.04, 'darkSteel'), [0.3, 0.04, s * 0.14]),
    ), [0.4, 0, s * 0.22]);
  }
  P('6', group(
    at(cyl(0.07, 0.17, 'red', { axis: 'x' }), [0.32, 0.05, 0]),
    at(ring(0.095, 0.03, 0.02, 'red', { axis: 'x' }), [0.24, 0.05, 0]),
    at(box(0.1, 0.08, 0.08, 'red'), [0.45, 0.05, 0]),
  ), [0.55, 0.12, 0]);
  P('5', group(cyl(0.015, 0.05, 'red'), at(cyl(0.013, 0.04, 'red', { axis: 'z' }), [0, 0.025, 0.02])).translateX(0.45).translateY(0.11).translateZ(0.02), [0.6, 0.35, 0]);
  P('7', at(fitting(0.02, 0.05, 'red', { axis: 'x' }), [0.52, 0.02, 0]), [0.85, 0.1, 0]);
  for (const s of [1, -1]) for (const x of [-0.16, -0.08, 0, 0.08, 0.16]) {
    P('9', bolt(0.019, 0.08, 'steel', { pos: [x, -0.2, s * 0.225] }), [0, -0.45, 0]);
    P('8', ring(0.02, 0.01, 0.008, 'darkSteel', { pos: [x, -0.203, s * 0.225] }), [0, -0.3, 0]);
  }
  return { view: { dir: [-0.9, 0.6, 1.0] } };
}

export function F16(api) {
  const { box, cyl, ring, bolt, nut, at, group, extrude } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  P('1', group(
    at(box(0.62, 0.035, 0.5, 'red'), [0, 0.06, 0]),
    at(box(0.62, 0.06, 0.03, 'red'), [0, 0.03, 0.25]),
    at(box(0.62, 0.06, 0.03, 'red'), [0, 0.03, -0.25]),
    at(box(0.03, 0.05, 0.5, 'red'), [0.3, 0.1, 0]),
  ), [0, 0, 0]);
  P('2', group(
    at(box(0.42, 0.025, 0.36, 'red'), [0, 0.2, 0]),
    at(box(0.36, 0.1, 0.03, 'red'), [0, 0.13, 0.12]),
    at(box(0.36, 0.1, 0.03, 'red'), [0, 0.13, -0.12]),
  ), [0, 0.38, 0]);
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    P('3', at(box(0.1, 0.11, 0.025, 'red'), [sx * 0.22, 0.0, sz * 0.278]), [0, -0.1, sz * 0.25]);
  }
  for (const s of [1, -1]) {
    P('4', at(box(0.56, 0.03, 0.05, 'lightGrey'), [0, 0.012, s * 0.2]), [0, -0.22, 0]);
    P('5', at(box(0.56, 0.045, 0.025, 'black'), [0, 0.022, s * 0.237]), [0, -0.2, s * 0.2]);
    P('6', at(extrude([[-0.06, 0], [0.06, 0], [0.06, -0.06], [0.03, -0.12], [-0.03, -0.12], [-0.06, -0.06]], 0.035, 'red', { holes: [[0, -0.075, 0.018]] }), [s * 0.12, 0.045, 0], [0, Math.PI / 2, 0]), [0, -0.4, 0]);
  }
  P('7', group(at(box(0.015, 0.2, 0.12, 'red'), [0, 0.1, 0]), at(box(0.08, 0.015, 0.12, 'red'), [0.04, 0, 0])).translateX(-0.29).translateY(0.08).translateZ(0.17), [-0.3, 0.2, 0.2]);
  // Poussoirs aux 4 coins : 8 rondelle téflon, 9 plaque, 10 couvercle (+11 boulons, 20/21 petite visserie)
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    const x = sx * 0.22, z = sz * 0.17;
    P('8', cyl(0.035, 0.03, 'lightGrey', { pos: [x, 0.093, z] }), [0, 0.18, 0]);
    P('9', cyl(0.042, 0.012, 'white', { pos: [x, 0.114, z] }), [0, 0.28, 0]);
    P('10', group(cyl(0.05, 0.02, 'darkSteel'), at(cyl(0.022, 0.012, 'steel'), [0, 0.016, 0])).translateX(x).translateY(0.13).translateZ(z), [0, 0.38, 0]);
    P('11', bolt(0.008, 0.03, 'steel', { pos: [x + 0.035, 0.142, z] }), [0, 0.5, 0]);
    P('21', bolt(0.005, 0.02, 'steel', { pos: [x, 0.03, sz * 0.25] }), [0, -0.2, sz * 0.35]);
    P('20', ring(0.008, 0.003, 0.002, 'steel', { pos: [x, 0.031, sz * 0.252] }), [0, -0.2, sz * 0.3]);
  }
  // Fixation entretoise : 14 boulons 1" + 15 rondelles ; 16 boulons 3/4" + 17 rondelles
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    P('14', bolt(0.025, 0.1, 'steel', { pos: [sx * 0.17, 0.225, sz * 0.15] }), [0, 0.7, 0]);
    P('15', ring(0.03, 0.013, 0.005, 'darkSteel', { pos: [sx * 0.17, 0.215, sz * 0.15] }), [0, 0.58, 0]);
    P('16', bolt(0.019, 0.06, 'steel', { axis: '-y', pos: [sx * 0.26, 0.04, sz * 0.12] }), [0, -0.5, 0]);
    P('17', ring(0.022, 0.01, 0.004, 'darkSteel', { pos: [sx * 0.26, 0.04, sz * 0.12] }), [0, -0.38, 0]);
  }
  // Boulons de réglage à tête carrée 18 / 19 + écrous 22 (sur les flancs) ; 12 boulons + 13 rondelles (couvercles)
  for (const s of [1, -1]) {
    P('18', bolt(0.019, 0.07, 'steel', { axis: s > 0 ? '-z' : 'z', head: 'square', pos: [0.12, 0.03, s * 0.31] }), [0, 0, s * 0.45]);
    P('19', bolt(0.019, 0.07, 'steel', { axis: s > 0 ? '-z' : 'z', head: 'square', pos: [-0.12, 0.03, s * 0.31] }), [0, 0, s * 0.45]);
    P('22', nut(0.03, 0.018, 'steel', { axis: 'z', pos: [0.12, 0.03, s * 0.275] }), [0, 0, s * 0.35]);
    P('22', nut(0.03, 0.018, 'steel', { axis: 'z', pos: [-0.12, 0.03, s * 0.275] }), [0, 0, s * 0.35]);
    P('12', bolt(0.012, 0.03, 'steel', { axis: s > 0 ? 'z' : '-z', pos: [0.22, 0.0, s * 0.295] }), [0, -0.1, s * 0.45]);
    P('13', ring(0.014, 0.006, 0.003, 'steel', { axis: 'z', pos: [0.22, 0.0, s * 0.292] }), [0, -0.1, s * 0.38]);
  }
  return { view: { dir: [0.9, 0.9, 1.0] } };
}

export function F17(api) {
  const { box, cyl, ring, bolt, nut, at, group, extrude } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const plateShape = [[-0.35, -0.3], [0.35, -0.3], [0.35, 0.3], [0.08, 0.3], [0.04, 0.4], [-0.04, 0.4], [-0.08, 0.3], [-0.35, 0.3]];
  const pl = extrude(plateShape, 0.03, 'red', { holes: [[0, 0, 0.055], [0, 0.35, 0.015], ...Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return [Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0.009]; })] });
  pl.rotation.x = Math.PI / 2;
  P('1', group(pl), [0, 0, 0]);
  for (const s of [1, -1]) {
    P('3', at(box(0.66, 0.01, 0.06, 'black'), [0, 0.02, s * 0.215]), [0, 0.1, 0]);
    P('2', group(at(box(0.64, 0.03, 0.012, 'black'), [0, 0.04, s * 0.25]), at(box(0.64, 0.012, 0.04, 'black'), [0, 0.03, s * 0.232])), [0, 0.2, 0]);
    P('4', group(at(box(0.6, 0.03, 0.04, 'orange'), [0, 0.07, s * 0.265]), at(box(0.04, 0.05, 0.05, 'orange'), [0.3, 0.075, s * 0.265]), at(box(0.04, 0.05, 0.05, 'orange'), [-0.3, 0.075, s * 0.265])), [0, 0.32, 0]);
    P('5', at(box(0.58, 0.03, 0.065, 'lightGrey'), [0, 0.1, s * 0.275]), [0, 0.45, 0]);
    for (const x of [-0.24, 0, 0.24]) {
      P('7', bolt(0.012, 0.14, 'steel', { pos: [x, 0.116, s * 0.28] }), [0, 0.65, 0]);
      P('8', ring(0.014, 0.006, 0.003, 'steel', { pos: [x, 0.117, s * 0.28] }), [0, 0.55, 0]);
      P('8', ring(0.014, 0.006, 0.003, 'steel', { pos: [x, -0.017, s * 0.28] }), [0, -0.12, 0]);
      P('9', nut(0.02, 0.012, 'steel', { pos: [x, -0.025, s * 0.28] }), [0, -0.2, 0]);
    }
  }
  P('6', ring(0.09, 0.055, 0.04, 'steel', { pos: [0, -0.035, 0] }), [0, -0.35, 0]);
  void cyl;
  return { view: { dir: [0.8, 0.9, 1.0] } };
}

export function F15(api) {
  const { box, cyl, ring, tube, rod, spring, bolt, nut, at, group, hydCylinder, extrude } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { length: L, rodY } = MAST;

  // M — Corps du mât (caisson en U)
  P('M', group(
    at(box(L, 0.02, 0.36, 'red'), [L / 2, -0.1, 0]),
    at(box(L, 0.2, 0.02, 'red'), [L / 2, 0, 0.17]),
    at(box(L, 0.2, 0.02, 'red'), [L / 2, 0, -0.17]),
    at(box(L, 0.02, 0.06, 'red'), [L / 2, 0.1, 0.15]),
    at(box(L, 0.02, 0.06, 'red'), [L / 2, 0.1, -0.15]),
    ...[0.6, 1.2, 1.8, 2.4].map((x) => at(box(0.02, 0.18, 0.32, 'redDark'), [x, -0.005, 0])),
    at(box(0.12, 0.24, 0.38, 'red'), [0.06, 0, 0]),
    at(box(0.12, 0.24, 0.38, 'red'), [L - 0.06, 0, 0]),
    ...Array.from({ length: 9 }, (_, i) => at(cyl(0.025, 0.005, 'black', { axis: 'z' }), [0.3 + i * 0.3, 0.02, 0.182])),
  ), [0, 0, 0]);
  // 24 — Barres de guidage ; 25 — couvercle supérieur ; 29 — couvercle inférieur
  for (const s of [1, -1]) P('24', cyl(0.025, L - 0.3, 'chrome', { axis: 'x', pos: [L / 2 + 0.05, 0.115, s * 0.2] }), [0, 0.35, s * 0.15]);
  P('25', group(at(box(0.05, 0.28, 0.44, 'red', { r: 0.01 }), [0, 0, 0]), at(box(0.08, 0.02, 0.44, 'red'), [-0.04, 0.13, 0])).translateX(L + 0.025), [0.35, 0, 0]);
  P('29', at(box(0.3, 0.02, 0.32, 'red'), [0.4, -0.12, 0]), [0, -0.3, 0]);

  // Tables au pied du mât : 26 table droite (fixe), 12 table gauche (pivotante)
  const tbl = (s) => group(
    at(box(0.4, 0.62, 0.26, 'red', { r: 0.02 }), [0, 0, 0]),
    at(box(0.4, 0.12, 0.08, 'red'), [0, -0.37, -s * 0.06]),
  );
  P('26', at(tbl(1), [-0.16, rodY - 0.04, 0.17]), [-0.15, 0, 0.5]);
  P('12', at(tbl(-1), [-0.16, rodY - 0.04, -0.17]), [-0.15, 0, -0.5]);
  // Inserts : 1/2 mâchoires (slip plates), 3/4 centreurs
  P('1', at(halfShell(api, 0.1, 0.055, 0.12, 1, 'grey'), [-0.29, rodY, 0.0]), [-0.15, 0.1, 0.75]);
  P('2', at(halfShell(api, 0.1, 0.07, 0.12, -1, 'grey'), [-0.29, rodY, 0.0]), [-0.15, 0.1, -0.75]);
  P('3', at(halfShell(api, 0.1, 0.05, 0.1, 1, 'grey'), [-0.06, rodY, 0.0]), [-0.15, 0.3, 0.75]);
  P('4', at(halfShell(api, 0.1, 0.065, 0.1, -1, 'grey'), [-0.06, rodY, 0.0]), [-0.15, 0.3, -0.75]);

  // Vérins de mâchoires (6) et de centreurs (8), axes 5/10 et 7, bagues 9 et 11
  for (const s of [1, -1]) {
    const c6 = hydCylinder(0.2, 0.05, { material: 'black', axis: 'z' });
    c6.position.set(-0.29, rodY + 0.38, s * 0.32);
    c6.rotation.y = s > 0 ? Math.PI : 0;
    P('6', c6, [-0.1, 0.35, s * 0.6]);
    P(s > 0 ? '5' : '10', cyl(0.009, 0.08, 'steel', { pos: [-0.29, rodY + 0.38, s * 0.33] }), [-0.1, 0.55, s * 0.6]);
    P(s > 0 ? '10' : '5', cyl(0.009, 0.08, 'steel', { pos: [-0.29, rodY + 0.38, s * 0.1] }), [-0.1, 0.55, s * 0.35]);
    P('9', cyl(0.016, 0.03, 'brass', { pos: [-0.29, rodY + 0.33, s * 0.1] }), [-0.1, 0.45, s * 0.3]);
    const c8 = hydCylinder(0.2, 0.05, { material: 'black', axis: 'z' });
    c8.position.set(-0.06, rodY + 0.38, s * 0.32);
    c8.rotation.y = s > 0 ? Math.PI : 0;
    P('8', c8, [0.1, 0.35, s * 0.6]);
    P('7', cyl(0.009, 0.1, 'steel', { pos: [-0.06, rodY + 0.38, s * 0.33] }), [0.1, 0.55, s * 0.6]);
    P('11', cyl(0.016, 0.03, 'brass', { pos: [-0.06, rodY + 0.33, s * 0.1] }), [0.1, 0.45, s * 0.3]);
  }
  // Vérins de tables (20) sous les tables, axes 14 / 17 / 27, bagues 15 16 18 19 28
  for (const s of [1, -1]) {
    const c20 = hydCylinder(0.26, 0.07, { material: 'black', axis: 'z' });
    c20.position.set(-0.16, 0.2, s * 0.06);
    c20.rotation.y = s > 0 ? 0 : Math.PI;
    P('20', c20, [-0.1, -0.35, s * 0.45]);
    P('14', cyl(0.012, 0.12, 'steel', { axis: 'x', pos: [-0.16, 0.2, s * 0.36] }), [-0.35, -0.35, s * 0.75]);
    P('15', cyl(0.02, 0.04, 'brass', { axis: 'x', pos: [-0.12, 0.2, s * 0.36] }), [-0.25, -0.35, s * 0.85]);
    P('16', cyl(0.02, 0.025, 'brass', { axis: 'x', pos: [-0.2, 0.2, s * 0.36] }), [-0.45, -0.35, s * 0.85]);
    P(s > 0 ? '17' : '27', cyl(0.012, 0.12, 'steel', { axis: 'x', pos: [-0.16, 0.2, s * 0.03] }), [-0.35, -0.5, s * 0.3]);
    P(s > 0 ? '18' : '28', cyl(0.02, 0.03, 'brass', { axis: 'x', pos: [-0.12, 0.2, s * 0.03] }), [-0.25, -0.55, s * 0.3]);
    P('19', cyl(0.02, 0.03, 'brass', { axis: 'x', pos: [-0.2, 0.2, s * 0.03] }), [-0.45, -0.55, s * 0.3]);
  }
  // 21 — Axes de charnière des tables (avec écrou) ; 13 / 22 — trousses de bagues
  for (const s of [1, -1]) {
    P('21', group(cyl(0.022, 0.52, 'steel', { axis: 'x' }), at(nut(0.05, 0.03, 'steel', { axis: 'x' }), [0.27, 0, 0])).translateX(-0.14).translateY(0.13).translateZ(s * 0.2), [-0.55, -0.15, s * 0.1]);
    [-0.33, -0.16, 0.01].forEach((x) => P(s > 0 ? '13' : '22', cyl(0.032, 0.035, 'brass', { axis: 'x', pos: [x, 0.13, s * 0.2] }), [-0.3, -0.25, s * 0.25]));
  }

  // 23 — Support de jonction des boyaux
  P('23', group(at(box(0.2, 0.12, 0.015, 'red'), [0, 0, 0]), at(cyl(0.03, 0.06, 'red', { axis: 'z' }), [0.06, 0.02, -0.03])).translateX(1.5).translateY(0.02).translateZ(-0.19), [0, 0, -0.3]);

  // Câble d'arrêt d'urgence : 30 support inf., 31 attache, 32 ressort, 33 garde, 34 support sup., 35 câble + interrupteur
  P('30', at(box(0.04, 0.08, 0.04, 'red'), [0.4, 0.15, 0.22]), [0, 0.2, 0.3]);
  P('31', cyl(0.006, 0.04, 'steel', { axis: 'x', pos: [0.44, 0.18, 0.22] }), [0.05, 0.3, 0.35]);
  P('32', spring(0.01, 0.002, 0.1, 10, 'steel', { axis: 'x', pos: [0.51, 0.18, 0.22] }), [0.1, 0.35, 0.35]);
  P('34', at(box(0.04, 0.1, 0.05, 'red'), [2.6, 0.16, 0.22]), [0, 0.2, 0.3]);
  P('33', group(at(box(0.12, 0.01, 0.08, 'red'), [0, 0.06, 0]), at(box(0.12, 0.06, 0.01, 'red'), [0, 0.03, 0.04])).translateX(2.68).translateY(0.15).translateZ(0.24), [0, 0.45, 0.35]);
  P('35', group(
    tube([[0.56, 0.18, 0.22], [1.6, 0.185, 0.22], [2.62, 0.19, 0.22]], 0.003, 'black', { seg: 8 }),
    at(box(0.08, 0.06, 0.06, 'safety', { r: 0.008 }), [2.7, 0.2, 0.24]),
    at(cyl(0.015, 0.02, 'red'), [2.7, 0.24, 0.24]),
  ), [0, 0.3, 0.55]);

  // 38 — Vérin du stinger (le long du flanc gauche), 41 colliers, 37 étriers en U, 36 boulons, 39 rondelles, 40 écrous
  const st = hydCylinder(2.1, 0.09, { axis: '-x', ext: 0.35 });
  st.position.set(2.45, 0.02, -0.27);
  P('38', st, [0, 0, -0.5]);
  for (const x of [0.9, 2.1]) {
    P('41', group(at(box(0.06, 0.13, 0.03, 'red'), [0, 0, 0.03]), at(box(0.06, 0.02, 0.1, 'red'), [0, 0.06, -0.02])).translateX(x).translateY(0.02).translateZ(-0.21), [0, 0, -0.3]);
    P('37', tube([[0, 0.05, 0], [0, 0.05, -0.06], [0, 0, -0.1], [0, -0.05, -0.06], [0, -0.05, 0]], 0.006, 'steel', { seg: 16 }).translateX(x).translateY(0.02).translateZ(-0.22), [0, 0, -0.75]);
    for (const dy of [0.04, -0.04]) {
      P('36', bolt(0.012, 0.06, 'steel', { axis: 'z', pos: [x, 0.02 + dy, -0.175] }), [0, 0, -0.95]);
      P('39', ring(0.014, 0.006, 0.003, 'steel', { axis: 'z', pos: [x, 0.02 + dy, -0.245] }), [0, 0, -1.05]);
      P('40', nut(0.02, 0.012, 'steel', { axis: 'z', pos: [x, 0.02 + dy, -0.255] }), [0, 0, -1.12]);
    }
  }
  void rod; void extrude;
  return { view: { dir: [0.35, 0.75, 1.0] } };
}

export function F14(api) {
  const { box, at, group, hydCylinder } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { rodY, carriageX, extFeedX } = MAST;
  P('4', api.sub('F15'), [0, 0, 0]);
  P('F16', at(api.sub('F16'), [carriageX, 0.14, 0]), [0, 0.45, 0]);
  P('1', at(api.sub('F18'), [carriageX, rodY, 0]), [0, 0.95, 0]);
  P('2', group(
    at(box(0.015, 0.2, 0.08, 'red'), [0, 0.1, 0]),
    at(box(0.12, 0.015, 0.08, 'red'), [0.06, 0.2, 0]),
    at(box(0.08, 0.015, 0.08, 'red'), [-0.04, 0, 0]),
  ).translateX(carriageX + 0.5).translateY(rodY + 0.05).translateZ(0.12), [0.3, 1.2, 0.3]);
  P('3', at(hydCylinder(carriageX - 0.35, 0.11, { ext: 0.45 }), [0.35, 0, 0]), [0, 0.0, 0.75]);
  P('5', at(api.sub('F17'), [extFeedX, -0.15, 0]), [0, -0.5, 0]);
  P('6', at(hydCylinder(0.9, 0.08, { ext: 0.4 }), [0.15, -0.26, 0]), [0, -0.85, 0]);
  return { view: { dir: [0.45, 0.7, 1.0] } };
}

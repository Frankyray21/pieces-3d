// P010 — Foreuse STM-1500 complète FBRA-002-100AS (page 1.0), avance à 0°
// comme sur la page 1.01 : traîneau noir (P011) sur patins relevés, support
// d'avance à chevalets (P012) et axe de bascule, poutre d'avance bleue (P013)
// avec pied, boîte et serre-tiges Boyles 12HH, table (P018) et tête Boyles
// (P048), vérin supérieur « bazooka » (P022), vérin d'avance double sous la
// poutre (P021), vérins de bascule et de relevage (P019), jambes et attelage
// (P020), rallonge et poulie double à l'arrière (P015 à P017),
// émerillon d'eau (P029), treuil de câble (P042) posé à côté du traîneau.
// Sans le garde-corps grillagé (P023) : la foreuse est isolée par la porte et
// les grillages du site (voir P002). Tout en rouge comme le groupe
// hydraulique, vérins noirs. Repère : layout.js.
import { lister, SLED, AXIS_Y, BEAM, PIVOT, IN } from './layout.js';
import { SPY } from './head.js';

const HEAD_X = -0.32; // table (centre de la tête) le long de l'avance
const TABLE_T = AXIS_Y - BEAM.top - SPY; // épaisseur de la table sous la tête

export function P010(api) {
  const { box, cyl, ring, shell, tube, hose, rod, plate, extrude, hydCylinder, bolt, boltSet, group, at, lathe, torus, nut, gear, merged, ballValve } = api.S;
  const P = lister(api, 'P010');
  const railZ = SLED.w / 2 - SLED.railW / 2;
  const ry = SLED.railH / 2;

  // 1 — Traîneau : deux longerons en tube 6 × 4 po, nez relevés, traverses, plancher central, oreilles de levage.
  const sled = [];
  for (const z of [-railZ, railZ]) {
    sled.push(at(box(SLED.len - 0.3, SLED.railH, SLED.railW, 'red', { r: 0.008 }), [0, ry, z]));
    for (const s of [-1, 1]) sled.push(at(box(0.36, SLED.railH, SLED.railW, 'red', { r: 0.008 }), [s * (SLED.len / 2 - 0.13), ry + 0.06, z], [0, 0, s * 0.42]));
    sled.push(at(box(SLED.len - 0.45, 0.012, SLED.railW + 0.03, 'red'), [0, SLED.railH + 0.006, z]));
  }
  for (const x of [-1.25, -0.55, 0.15, 0.85, 1.25]) sled.push(at(box(0.1, 0.1, SLED.w - 2 * SLED.railW, 'red', { r: 0.005 }), [x, 0.07, 0]));
  sled.push(at(plate(1.2, SLED.w - 2 * SLED.railW, 0.012, 'red', { cutouts: [[0.25, 0, 0.3, 0.3]] }), [-0.6, 0.126, 0]));
  for (const x of [-1.38, 1.38]) for (const z of [-railZ, railZ]) {
    sled.push(at(ring(0.05, 0.026, 0.025, 'red', { axis: 'z' }), [x, 0.2, z + Math.sign(z) * 0.065]));
  }
  // Vannes à bille et sélecteur mât / treuil sur le flanc gauche.
  sled.push(at(ballValve(0.05, 'brass', { axis: 'x' }), [-0.9, 0.2, -railZ - 0.09]));
  sled.push(at(ballValve(0.05, 'brass', { axis: 'x' }), [-0.75, 0.2, -railZ - 0.09]));
  sled.push(at(box(0.1, 0.08, 0.06, 'darkSteel', { r: 0.006 }), [-0.55, 0.2, -railZ - 0.09]));
  P('FBRA-002-150BM', group(sled), [0, -0.35, 0]);

  // 5 — Support d'avance : deux chevalets en HSS 5 × 3 po et axe de bascule Ø 3 po (tube sch. 80).
  const sup = [];
  for (const z of [-0.36, 0.36]) {
    sup.push(rod([PIVOT.x - 0.42, 0.16, z], [PIVOT.x, PIVOT.y, z], 0.045, 'red', 4));
    sup.push(rod([PIVOT.x + 0.42, 0.16, z], [PIVOT.x, PIVOT.y, z], 0.045, 'red', 4));
    sup.push(at(box(1.0, 0.03, 0.14, 'red', { r: 0.004 }), [PIVOT.x, 0.168, z]));
    sup.push(at(cyl(0.075, 0.12, 'red', { axis: 'z' }), [PIVOT.x, PIVOT.y, z]));
    // Blocs de serrage sur les longerons (4) et chaînettes.
    for (const s of [-1, 1]) sup.push(at(box(0.11, 0.04, 0.24, 'darkSteel', { r: 0.004 }), [PIVOT.x + s * 0.45, 0.17, z * 1.05]));
  }
  sup.push(at(cyl(IN * 1.75, 0.86, 'steel', { axis: 'z' }), [PIVOT.x, PIVOT.y, 0]));
  sup.push(at(box(0.08, 0.3, 0.72, 'red', { r: 0.006 }), [PIVOT.x, 0.38, 0]));
  P('FBRA-002-600BB', group(sup), [0, -0.15, 0.5]);

  // 2 — Poutre d'avance (caisson ouvert) : semelle, deux flancs, glissières de la table, plaque d'extrémité.
  const bx0 = BEAM.x0, bx1 = BEAM.x1, bl = bx1 - bx0, bxc = (bx0 + bx1) / 2;
  const by0 = BEAM.top - BEAM.h;
  const beam = [];
  beam.push(at(box(bl, 0.016, BEAM.w, 'red', { r: 0.004 }), [bxc, by0 + 0.008, 0]));
  for (const s of [-1, 1]) {
    beam.push(at(box(bl, BEAM.h - 0.03, 0.014, 'red', { r: 0.003 }), [bxc, by0 + BEAM.h / 2 - 0.005, s * (BEAM.w / 2 - 0.007)]));
    beam.push(at(box(bl, 0.03, 0.07, 'red', { r: 0.004 }), [bxc, BEAM.top - 0.015, s * (BEAM.w / 2 - 0.035)]));
    beam.push(at(box(bl - 0.2, 0.012, 0.05, 'darkSteel', { r: 0.002 }), [bxc + 0.05, BEAM.top + 0.006, s * (BEAM.w / 2 - 0.035)]));
    // Raidisseurs ajourés des flancs.
    for (let x = bx0 + 0.25; x < bx1 - 0.2; x += 0.45) beam.push(at(box(0.06, BEAM.h - 0.05, 0.02, 'red'), [x, by0 + BEAM.h / 2, s * (BEAM.w / 2 + 0.004)]));
  }
  // Paliers de bascule sous la poutre.
  for (const z of [-0.26, 0.26]) beam.push(at(box(0.18, by0 - PIVOT.y + 0.1, 0.05, 'red', { r: 0.006 }), [PIVOT.x, (by0 + PIVOT.y) / 2, z]));
  beam.push(at(box(0.04, BEAM.h + 0.08, BEAM.w + 0.06, 'red', { r: 0.006 }), [bx0 + 0.02, by0 + BEAM.h / 2, 0]));
  P('FBRA-002-300BB', group(beam), [0, 0.35, 0]);

  // 11 — Table de la tête : plaque coulissante sur les glissières, blocs et serres de dessous.
  const tableY = BEAM.top + 0.012;
  P('UM-064-200DS', group(
    at(box(0.72, TABLE_T - 0.012, BEAM.w + 0.1, 'red', { r: 0.006 }), [HEAD_X, tableY + (TABLE_T - 0.012) / 2, 0]),
    ...[-1, 1].map((s) => at(box(0.72, 0.05, 0.03, 'black', { r: 0.004 }), [HEAD_X, BEAM.top - 0.02, s * (BEAM.w / 2 + 0.03)])),
    ...[-1, 1].flatMap((s) => [-0.3, 0.3].map((dx) => at(box(0.08, 0.04, 0.05, 'darkSteel', { r: 0.004 }), [HEAD_X + dx, BEAM.top + TABLE_T + 0.02, s * 0.22]))),
  ), [0, 0.25, 0]);

  // 9 — Tête de forage Boyles sur la table, broche dans l'axe de l'avance.
  P('UM-012-100UG', at(api.sub('P048'), [HEAD_X, BEAM.top + TABLE_T, 0]), [0, 0.7, 0]);

  // 3 — Pied de l'avance (plaque avant percée au passage des tiges), 7 — boîte du serre-tiges, 16 — serre-tiges Boyles 12HH.
  const fx = bx1 + 0.015;
  P('FBRA-002-305BB', group(
    at(plate(0.78, 0.68, 0.03, 'red', { holes: [[AXIS_Y - 1.18, 0, 0.07]], r: 0.03 }), [fx, 1.18, 0], [0, 0, Math.PI / 2]),
    ...[-1, 1].map((s) => at(box(0.12, 0.78, 0.025, 'red', { r: 0.004 }), [fx - 0.07, 1.18, s * 0.33])),
  ), [0.45, 0, 0]);
  const hx = fx - 0.03 - 0.16;
  P('FTD-148-300TF', group(
    at(box(0.32, 0.03, 0.46, 'red', { r: 0.004 }), [hx, AXIS_Y + 0.215, 0]),
    at(box(0.32, 0.03, 0.46, 'red', { r: 0.004 }), [hx, AXIS_Y - 0.215, 0]),
    ...[-1, 1].map((s) => at(box(0.32, 0.4, 0.03, 'red', { r: 0.004 }), [hx, AXIS_Y, s * 0.215])),
    boltSet([-0.1, 0, 0.1].flatMap((dx) => [-0.15, 0.15].map((dz) => [hx + dx, AXIS_Y + 0.23, dz])), 0.0127, 0.07, 'steel'),
  ), [0.25, 0.4, 0]);
  P('UM-079-100A-12', group(
    at(lathe([[0.049, 0], [0.13, 0], [0.155, 0.02], [0.155, 0.32], [0.13, 0.34], [0.049, 0.34]], 'red', { axis: 'x', seg: 40 }), [hx - 0.17, AXIS_Y, 0]),
    at(ring(0.16, 0.13, 0.025, 'steel', { axis: 'x', seg: 40 }), [hx - 0.06, AXIS_Y, 0]),
    at(ring(0.16, 0.13, 0.025, 'steel', { axis: 'x', seg: 40 }), [hx + 0.06, AXIS_Y, 0]),
  ), [0.35, 0.6, 0]);
  // 15 — Pivot du serre-tiges (table de serrage, axe et boulons à œil) sur la poutre.
  P('UM-064-800B', group(
    at(box(0.36, 0.04, 0.4, 'red', { r: 0.005 }), [hx, BEAM.top + 0.02, 0]),
    at(cyl(0.0127, 0.46, 'steel', { axis: 'z', seg: 16 }), [hx - 0.15, BEAM.top + 0.05, 0]),
    ...[-1, 1].map((s) => at(torus(0.022, 0.006, 'steel', { axis: 'x' }), [hx + 0.12, BEAM.top + 0.07, s * 0.17])),
  ), [0.2, 0.3, 0]);
  // Entretoises (braces) du pied vers la poutre.
  api.add(group(...[-1, 1].map((s) => rod([fx - 0.03, 1.5, s * 0.28], [bx1 - 0.7, BEAM.top, s * (BEAM.w / 2 - 0.02)], 0.016, 'red', 10))));

  // 17 — Vérin d'avance double (tube central, deux tiges opposées), logé dans la poutre entre ses flancs.
  // Le vérin supérieur « bazooka » (6) et sa console (8) ne sont pas montés sur cette foreuse.
  const fcY = by0 + 0.12;
  P('UM-064-100Z', group(
    at(shell(0.06, 0.045, 1.5, 'black', { axis: 'x' }), [-0.55, fcY, 0]),
    at(cyl(0.068, 0.06, 'black', { axis: 'x' }), [-1.3, fcY, 0]),
    at(cyl(0.068, 0.06, 'black', { axis: 'x' }), [0.2, fcY, 0]),
    at(cyl(0.025, 0.55, 'chrome', { axis: 'x' }), [-1.6, fcY, 0]),
    at(cyl(0.025, 0.55, 'chrome', { axis: 'x' }), [0.5, fcY, 0]),
    at(box(0.06, 0.08, 0.1, 'black', { r: 0.008 }), [-1.88, fcY + 0.02, 0]),
    at(box(0.06, 0.08, 0.1, 'black', { r: 0.008 }), [0.78, fcY + 0.02, 0]),
    // Patte du tube central sous la table : le tube entraîne la table, les tiges sont fixées aux bouts de la poutre.
    at(box(0.1, BEAM.top + 0.012 - fcY - 0.05, 0.06, 'black', { r: 0.006 }), [HEAD_X, (fcY + 0.05 + BEAM.top + 0.012) / 2, 0]),
  ), [0, -0.45, 0]);

  // 18 — Vérins de bascule HBU-3010 (2) : du traîneau à la poutre, côté arrière.
  for (const z of [-0.34, 0.34]) {
    const a = [-1.15, 0.2, z], b = [-1.0, by0 - 0.03, z];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const c = hydCylinder(len, 0.09, { material: 'black', rodR: 0.03, ext: 0.4 });
    c.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]);
    P('FBRA-002-515ZZ', at(group(c), a), [0, 0, z > 0 ? 0.45 : -0.45]);
  }
  // 12 — Vérin de relevage (HBU 2536) : du traîneau vers l'arrière de la poutre.
  {
    const a = [0.05, 0.2, 0], b = [-1.75, by0 - 0.02, 0];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const c = hydCylinder(len, 0.065, { material: 'black', rodR: 0.022, ext: 0.35 });
    c.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]);
    P('UM-064-300Z', at(group(c), a), [0, -0.3, 0]);
  }

  // 14 — Jambes télescopiques (2) sous l'arrière de la poutre : section centrale, inférieure, vis de réglage et patin.
  for (const z of [-0.1, 0.1]) {
    const x = bx0 + 0.3;
    P('UM-064-400D', group(
      at(box(0.076, 0.32, 0.076, 'red', { r: 0.004 }), [x, by0 - 0.16, z]),
      at(box(0.064, 0.22, 0.064, 'red', { r: 0.004 }), [x, by0 - 0.38, z]),
      at(cyl(0.02, 0.1, 'steel', { axis: 'y', seg: 14 }), [x, 0.08, z]),
      at(box(0.14, 0.02, 0.14, 'red', { r: 0.004 }), [x, 0.01, z]),
      at(cyl(0.0095, 0.12, 'steel', { axis: 'z', seg: 10 }), [x, by0 - 0.3, z]),
    ), [0, -0.2, z > 0 ? 0.25 : -0.25]);
  }

  // 13 — Attelage amovible à l'arrière du traîneau (cadre en V, anneau).
  const hx0 = -SLED.len / 2 + 0.02;
  P('UM-064-351D', group(
    rod([hx0, 0.12, -railZ], [hx0 - 0.42, 0.12, 0], 0.03, 'red', 4),
    rod([hx0, 0.12, railZ], [hx0 - 0.42, 0.12, 0], 0.03, 'red', 4),
    at(ring(0.055, 0.03, 0.03, 'red'), [hx0 - 0.47, 0.12, 0]),
    ...[-1, 1].map((s) => at(box(0.08, 0.1, 0.12, 'red', { r: 0.005 }), [hx0 + 0.02, 0.1, s * railZ])),
  ), [-0.4, 0, 0]);

  // 10 — Rallonge à l'arrière de l'avance (P013) : tube carré réglable qui coulisse dans la plaque
  // d'extrémité, montant, pivot à ressort (P015), poulie double pivotante (P017 : deux flasques, deux
  // réas à gorge sur roulements, axes et entretoises) et guide de tiges à rouleau diabolo (P016).
  const ex1 = bx0 - 0.62, ey = AXIS_Y + 0.3, py = AXIS_Y + 0.62;
  const sheave = (x) => group(
    at(lathe([[0.03, -0.022], [0.122, -0.022], [0.132, -0.016], [0.132, -0.01], [0.1, 0], [0.132, 0.01], [0.132, 0.016], [0.122, 0.022], [0.03, 0.022]], 'red', { axis: 'z', seg: 48 }), [x, py, 0]),
    at(ring(0.045, 0.02, 0.05, 'steel', { axis: 'z', seg: 24 }), [x, py, 0]),
    ...[0, 1, 2, 3, 4].map((k) => at(cyl(0.012, 0.012, 'red', { axis: 'z', seg: 12 }), [x + Math.cos(k * 1.257) * 0.07, py + Math.sin(k * 1.257) * 0.07, 0.022])),
  );
  const flasque = (z) => at(extrude([[-0.13, -0.035], [0.13, -0.035], [0.16, 0], [0.13, 0.035], [-0.13, 0.035], [-0.16, 0]], 0.012, 'red', { holes: [[-0.13, 0, 0.0125], [0.13, 0, 0.0125]] }), [ex1, py, z]);
  P('UM-064-200C', group(
    at(box(0.72, 0.1, 0.1, 'red', { r: 0.008 }), [ex1 + 0.36, ey, 0]),
    ...[-1, 1].map((s) => at(box(0.14, 0.02, 0.1, 'red', { r: 0.004 }), [bx0 + 0.07, ey + s * 0.06, 0])),
    boltSet([[bx0 + 0.04, ey + 0.071, 0], [bx0 + 0.1, ey + 0.071, 0]], 0.016, 0.05, 'steel'),
    at(box(0.1, py - ey - 0.12, 0.1, 'red', { r: 0.008 }), [ex1 + 0.05, (py + ey) / 2 - 0.06, 0]),
    // Pivot à ressort : plaque de base, plaque mobile sur son axe, vis de réglage et ressort.
    at(box(0.16, 0.02, 0.14, 'red', { r: 0.004 }), [ex1 + 0.05, py - 0.12, 0]),
    at(cyl(0.016, 0.16, 'steel', { axis: 'z', seg: 16 }), [ex1 - 0.02, py - 0.1, 0]),
    at(api.S.spring(0.018, 0.004, 0.08, 7, 'red'), [ex1 + 0.1, py - 0.19, 0.05]),
    at(cyl(0.008, 0.12, 'steel', { axis: 'y', seg: 10 }), [ex1 + 0.1, py - 0.15, 0.05]),
    // Poulie double : deux flasques, deux réas, axes, écrous et entretoises.
    flasque(-0.036), flasque(0.036),
    sheave(ex1 - 0.13), sheave(ex1 + 0.13),
    ...[-0.13, 0.13].map((dx) => at(cyl(0.0125, 0.1, 'steel', { axis: 'z', seg: 16 }), [ex1 + dx, py, 0])),
    ...[-0.13, 0.13].flatMap((dx) => [-1, 1].map((sz) => at(nut(0.032, 0.014, 'steel', { axis: 'z' }), [ex1 + dx, py, sz * 0.05]))),
    // Câble du treuil sur les réas.
    tube([[ex1 - 0.27, py - 0.25, 0], [ex1 - 0.245, py - 0.03, 0], [ex1 - 0.13, py + 0.1, 0], [ex1 + 0.13, py + 0.1, 0], [ex1 + 0.245, py + 0.02, 0], [ex1 + 0.4, py - 0.2, 0]], 0.004, 'darkSteel', { seg: 40 }),
    // Guide de tiges : cadre en U à boutonnières, axe et rouleau diabolo en caoutchouc.
    ...[-1, 1].map((s) => at(box(0.14, 0.2, 0.012, 'red', { r: 0.004 }), [bx0 - 0.07, AXIS_Y, s * 0.085])),
    at(box(0.14, 0.012, 0.18, 'red', { r: 0.003 }), [bx0 - 0.07, AXIS_Y - 0.1, 0]),
    at(cyl(0.012, 0.2, 'steel', { axis: 'z', seg: 14 }), [bx0 - 0.07, AXIS_Y - 0.06, 0]),
    at(lathe([[0.014, -0.075], [0.052, -0.075], [0.056, -0.06], [0.032, 0], [0.056, 0.06], [0.052, 0.075], [0.014, 0.075]], 'rubber', { axis: 'z', seg: 32 }), [bx0 - 0.07, AXIS_Y - 0.06, 0]),
  ), [-0.6, 0.3, 0]);

  // 20 — Émerillon d'eau (bleu) au bout arrière de la broche.
  const swX = HEAD_X - 0.62;
  P('UM-106-100AA', group(
    at(lathe([[0.02, 0], [0.055, 0], [0.065, 0.03], [0.065, 0.15], [0.045, 0.19], [0.02, 0.19]], 'red', { axis: 'x', seg: 28 }), [swX - 0.19, AXIS_Y, 0]),
    at(cyl(0.018, 0.1, 'brass', { axis: 'y', seg: 14 }), [swX - 0.1, AXIS_Y + 0.1, 0]),
    at(cyl(0.02, 0.06, 'brass', { axis: 'z', seg: 14 }), [swX - 0.1, AXIS_Y + 0.15, 0.03]),
  ), [-0.4, 0.2, 0]);

  // 4 — Treuil de câble 10 000 pi (bleu) posé à côté du traîneau, côté droit : bâti tubulaire, deux tambours, carters de chaîne, moteurs White.
  const wz = SLED.w / 2 + 0.55, wx = -0.55;
  const w = [];
  for (const z of [-0.33, 0.33]) {
    w.push(at(box(0.97, 0.1, 0.06, 'red', { r: 0.006 }), [wx, 0.05, wz + z]));
    w.push(at(box(0.06, 0.52, 0.06, 'red', { r: 0.006 }), [wx - 0.42, 0.33, wz + z]));
    w.push(at(box(0.06, 0.52, 0.06, 'red', { r: 0.006 }), [wx + 0.42, 0.33, wz + z]));
  }
  for (const x of [-0.42, 0.42]) w.push(at(box(0.06, 0.06, 0.72, 'red', { r: 0.006 }), [wx + x, 0.6, wz]));
  for (const x of [-0.18, 0.18]) {
    w.push(at(cyl(0.17, 0.56, 'red', { axis: 'z', seg: 36 }), [wx + x, 0.35, wz]));
    w.push(at(cyl(0.155, 0.5, 'steel', { axis: 'z', seg: 36 }), [wx + x, 0.35, wz]));
    for (const z of [-0.29, 0.29]) w.push(at(cyl(0.21, 0.02, 'red', { axis: 'z', seg: 36 }), [wx + x, 0.35, wz + z]));
  }
  w.push(at(box(0.9, 0.36, 0.08, 'red', { r: 0.04 }), [wx, 0.35, wz + 0.4]));
  for (const x of [-0.18, 0.18]) w.push(at(cyl(0.06, 0.16, 'blackCast', { axis: 'z' }), [wx + x, 0.35, wz - 0.42]));
  // Guide-câble à vis-mère et volants.
  w.push(at(cyl(0.02, 0.62, 'steel', { axis: 'z', seg: 14 }), [wx + 0.42, 0.68, wz]));
  w.push(at(box(0.08, 0.08, 0.1, 'brass', { r: 0.006 }), [wx + 0.42, 0.68, wz + 0.05]));
  for (const z of [-0.36, 0.36]) w.push(at(torus(0.07, 0.008, 'black', { axis: 'z' }), [wx + 0.42, 0.68, wz + z]));
  P('FBRA-002-400HH', group(w, hose([[wx - 0.18, 0.35, wz - 0.52], [wx - 0.3, 0.3, wz - 0.8], [-0.95, 0.25, railZ + 0.08]], 0.014),
    hose([[wx + 0.18, 0.35, wz - 0.52], [wx + 0.1, 0.3, wz - 0.8], [-0.8, 0.25, railZ + 0.08]], 0.014)), [0, 0, 0.7]);

  // Boyaux du traîneau : bloc de raccords (côté console) vers les vérins et la tête, le long du flanc gauche.
  api.add(group(
    at(box(0.62, 0.08, 0.06, 'castAlu', { r: 0.006 }), [-0.65, 0.2, -railZ - 0.12]),
    hose([[-0.6, 0.24, -railZ - 0.12], [-1.4, 0.45, -0.3], [-1.9, BEAM.top - 0.05, -BEAM.w / 2 - 0.04], [-1.0, BEAM.top + 0.08, -0.38]], 0.016),
    hose([[-0.75, 0.24, -railZ - 0.12], [-1.45, 0.42, -0.34], [-1.95, BEAM.top - 0.08, -BEAM.w / 2 - 0.06], [-1.1, BEAM.top + 0.04, -0.42]], 0.016),
  ));
  return { view: { dir: [0.75, 0.5, 1.0] } };
}

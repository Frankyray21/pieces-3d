// P378 — Réservoir hydraulique équipé CX033004 rév. 1 (page 378), repère 38 de
// P328 : réservoir (5, P380) et ses équipements sur le couvercle avant.
//   · filtre de retour (18) posé sur son perçage, bride carrée serrée par 4 vis
//     H 3/8 × 1 (16) et rondelles fendues (17) ; cuve et élément plongent dans le
//     réservoir. Orifice −X (-20) : adaptateur -20 / -12 (11), adaptateur droit
//     NPT 3/4 à écrou tournant -12 (10), clapet anti-retour 3/4 NPT (3) et coude
//     90° NPT 3/4 × 1/2 (9) tourné vers le bas au bout du réservoir. Orifice +X
//     (-24) : adaptateur -24 / -20 (12), té tournant -20 (8, branche vers +Z),
//     coude tournant -20 (6) et réduction tournante -20 / -16 (7) ;
//   · reniflard (2) sur un mamelon 3/4 × 3 po (15) vissé dans un manchon 3/4 NPT
//     (14) ; sonde de niveau / température (1) à connecteur à côté ;
//   · coude 90° mâle-femelle 1/8 NPT (13) sur la prise avant du couvercle ;
//   · trois voyants de niveau (4) sur les bossages de la face −X.
// Repère : celui de P380 (origine au centre du dessous du fond, Y vers le haut,
// X selon la longueur, voyants et trappe vers −X, face inclinée vers +Z).
// Encombrement ≈ 0.95 (X, de −0.50 au bout de 7) × 0.72 (Y) × 0.50 (Z) m.
import { IN, kit, racFactory, racPose, racPort } from './_porteur.js';
import { HT } from './P380.js';

export default function P378(api) {
  const { THREE, S } = api;
  const { lathe, box, cyl, merged, group, at } = S;
  const K = kit(api);
  const F = racFactory(S);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const pose = (obj, p, d, side) => racPose(THREE, obj, p, d, side);
  const add = (p, d, k) => p.map((v, i) => v + d[i] * k);

  P('5', api.sub('P380'), [0, -0.25, 0]);
  const yT = HT.H + 0.002 + HT.lid; // dessus du couvercle avant

  // ---------------------------------------------------------------- 18 — filtre de retour
  const [fx, fz] = HT.holes.filter;
  const yP = yT + 0.04; // axe des orifices de la tête
  const head = group(
    // Bride carrée, tête ronde, couvercle à 4 vis, bossages des orifices.
    merged([
      box(0.15, 0.012, 0.15, 'castAlu', { r: 0.01, pos: [0, 0.006, 0] }),
      lathe([[0, 0.012], [0.065, 0.012], [0.065, 0.07], [0, 0.07]], 'castAlu', { seg: 24 }),
      lathe([[0, 0.07], [0.062, 0.07], [0.062, 0.084], [0.055, 0.09], [0, 0.09]], 'castAlu', { seg: 24 }),
      box(0.03, 0.05, 0.06, 'castAlu', { r: 0.004, pos: [-0.072, 0.04, 0] }),
      box(0.03, 0.055, 0.065, 'castAlu', { r: 0.004, pos: [0.072, 0.04, 0] }),
    ], 'castAlu'),
    // Vis du couvercle, indicateur de colmatage.
    merged([0, 1, 2, 3].map((i) => K.hex(0.012, 0.007, 'zinc', { pos: [Math.cos(i * Math.PI / 2 + 0.785) * 0.05, 0.094, Math.sin(i * Math.PI / 2 + 0.785) * 0.05] })), 'zinc'),
    at(cyl(0.012, 0.02, 'red', { axis: 'z', seg: 10 }), [0, 0.045, 0.07]),
    // Cuve et élément dans le réservoir.
    lathe([[0, -0.3], [0.045, -0.3], [0.05, -0.29], [0.05, 0], [0, 0]], 'steel', { seg: 16 }),
  );
  P('18', at(head, [fx, yT, fz]), [0, 0.5, 0]);
  // 16, 17 — vis de la bride
  for (const [dx, dz] of [[-0.06, -0.06], [0.06, -0.06], [0.06, 0.06], [-0.06, 0.06]]) {
    P('17', K.lock(0.375 * IN, 'zinc', { pos: [fx + dx, yT + 0.012, fz + dz] }), [0, 0.62, 0]);
    P('16', K.screw(0.375 * IN, 1 * IN, 'zinc', { pos: [fx + dx, yT + 0.014, fz + dz] }), [0, 0.68, 0]);
  }

  // ---------------------------------------------------------------- ligne −X : 11, 10, 3, 9
  const a11 = pose(F.straight({ pd: 20, jd: 12 }), [fx - 0.087, yT + 0.04, fz], [-1, 0, 0]);
  P('11', a11, [-0.06, 0.5, 0]);
  const q11 = racPort(THREE, a11);
  const sw = F.nptSwivel(12, 12);
  const L10 = sw.userData.ports[0].p[1];
  const o10 = add(q11.p, q11.d, L10);
  P('10', pose(sw, o10, q11.d.map((v) => -v)), [-0.12, 0.5, 0]);
  // 3 — clapet anti-retour 3/4 NPT : corps six-pans 1 1/4, deux embouts femelles.
  const cv = lathe([[0.011, 0], [0.019, 0], [0.019, 0.004], [0.021, 0.006], [0.021, 0.05], [0.019, 0.052], [0.019, 0.07], [0.011, 0.07], [0.011, 0]], 'brass', { seg: 6 });
  const o3 = add(o10, q11.d, -0.004);
  P('3', pose(cv, o3, q11.d), [-0.18, 0.5, 0]);
  // 9 — coude 90° 3/4 × 1/2 NPT vers le bas.
  const elb = group(
    lathe([[0, -0.016], [0.0125, -0.016], [0.0133, 0], [0, 0]], 'zinc', { seg: 10 }),
    lathe([[0, 0], [0.016, 0], [0.016, 0.022], [0, 0.022]], 'zinc', { seg: 10 }),
    at(lathe([[0, 0], [0.012, 0], [0.012, 0.014], [0.0105, 0.03], [0, 0.03]], 'zinc', { seg: 10 }), [0, 0.022, 0], [0, 0, Math.PI / 2]),
  );
  const o9 = add(o3, q11.d, 0.084);
  P('9', pose(elb, o9, q11.d, [0, -1, 0]), [-0.24, 0.5, 0]);

  // ---------------------------------------------------------------- ligne +X : 12, 8, 6, 7
  const a12 = pose(F.straight({ pd: 24, jd: 20 }), [fx + 0.087, yP, fz], [1, 0, 0]);
  P('12', a12, [0.06, 0.5, 0]);
  const q12 = racPort(THREE, a12);
  const t8 = pose(F.swivel({ kind: 'tee', fd: 20 }), q12.p, q12.d, [0, 0, 1]);
  P('8', t8, [0.12, 0.5, 0]);
  const q8 = racPort(THREE, t8, 0); // passage (suite de la ligne)
  const e6 = pose(F.swivel({ kind: 'elbow', fd: 20 }), q8.p, q8.d, [0, 0, 1]);
  P('6', e6, [0.18, 0.5, 0]);
  const q6 = racPort(THREE, e6);
  P('7', pose(F.swivel({ kind: 'reducer', fd: 20, jd: 16 }), q6.p, q6.d), [0.18, 0.5, 0.06]);

  // ---------------------------------------------------------------- 14, 15, 2 — reniflard
  const [vx, vz] = HT.holes.vent;
  const coupling = lathe([[0.0133, 0], [0.019, 0], [0.019, 0.003], [0.0205, 0.005], [0.0205, 0.045], [0.019, 0.048], [0.0133, 0.048]], 'zinc', { seg: 12 });
  P('14', at(coupling, [vx, yT, vz]), [0, 0.1, 0]);
  P('15', at(lathe([[0.01, 0], [0.0133, 0], [0.0133, 0.076], [0.01, 0.076]], 'zinc', { seg: 12 }), [vx, yT + 0.03, vz]), [0, 0.2, 0]);
  const yB = yT + 0.03 + 0.076 - 0.015;
  const cap = group(
    lathe([[0, 0], [0.034, 0], [0.036, 0.004], [0.036, 0.04], [0.032, 0.046], [0, 0.048]], 'black', { seg: 20 }),
    merged(Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2; return box(0.004, 0.03, 0.005, 'black', { pos: [Math.cos(a) * 0.036, 0.02, Math.sin(a) * 0.036], rot: [0, -a, 0] }); }), 'black'),
  );
  P('2', at(cap, [vx, yB, vz]), [0, 0.3, 0]);

  // ---------------------------------------------------------------- 1 — sonde de niveau / température
  const [lx, lz] = HT.holes.level;
  const sensor = group(
    at(K.hex(0.027, 0.012, 'zinc'), [0, 0.006, 0]),
    lathe([[0, 0.012], [0.012, 0.012], [0.012, 0.04], [0, 0.04]], 'zinc', { seg: 12 }),
    box(0.03, 0.034, 0.028, 'plastic', { r: 0.003, pos: [0.006, 0.055, 0] }),
    box(0.012, 0.022, 0.022, 'plastic', { r: 0.002, pos: [0.027, 0.055, 0] }),
    // Tube de sonde dans le réservoir.
    lathe([[0, -0.35], [0.007, -0.35], [0.007, 0], [0, 0]], 'steel', { seg: 10 }),
  );
  P('1', at(sensor, [lx, yT, lz]), [0, 0.42, 0.05]);

  // ---------------------------------------------------------------- 13 — coude 1/8 NPT, prise avant
  const [cx, cz] = HT.holes.front;
  const e13 = group(
    lathe([[0, -0.009], [0.0048, -0.009], [0.0051, 0], [0, 0]], 'zinc', { seg: 8 }),
    lathe([[0, 0], [0.0075, 0], [0.0075, 0.016], [0, 0.016]], 'zinc', { seg: 8 }),
    at(lathe([[0, 0], [0.0075, 0], [0.0075, 0.014], [0, 0.014]], 'zinc', { seg: 8 }), [0, 0.009, 0], [Math.PI / 2, 0, 0]),
  );
  P('13', at(e13, [cx, yT, cz]), [0, 0.12, 0.05]);

  // ---------------------------------------------------------------- 4 — voyants (×3), face −X
  for (const y of HT.glass.y) {
    const g = group(
      at(K.hex(0.04, 0.012, 'zinc'), [0, 0.006, 0]),
      lathe([[0, 0.012], [0.014, 0.012], [0.014, 0.014], [0, 0.014]], 'glass', { seg: 14 }),
      lathe([[0.014, 0.012], [0.017, 0.012], [0.017, 0.0145], [0.014, 0.0145]], 'red', { seg: 14 }),
    );
    P('4', pose(g, [-HT.L / 2 - 0.008, y, HT.glass.z], [-1, 0, 0]), [-0.12, 0, 0]);
  }

  return { view: { dir: [-0.8, 0.8, 1.2] } };
}

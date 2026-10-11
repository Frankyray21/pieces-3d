// P224 — Refroidisseur d'huile : CX030827 rév. 2 « ASSEMBLY, OIL COOLER »
// (page 224), repère 16 de P186. Échangeur à faisceau tubulaire (1) : calandre
// Ø 6 po, brides Ø 9 po boulonnées (8 boulons) aux deux bouts, couvercle bombé
// à gauche, boîte à eau à droite (orifices d'eau 1 NPT en bout), deux pattes
// d'appui pliées à boutonnières sous les brides, deux piquages d'huile
// MORB -24 sur le dessus de la calandre. Piquage gauche : adaptateur MORB -24
// → FNPT -20 (9), té de passage 1 1/4 NPT (8), coude 45° MNPT → JIC -20 (3)
// sur la branche, réduction six-pans 1 1/4 → 1/2 NPT (7) et sonde de
// température -18 à 260 °C (2) à tête de raccordement. Piquage droit : coude
// MORB -24 → JIC -20 (6). Boîte à eau : coude 90° MNPT → JIC -16 (4) en bas,
// adaptateur droit -16 (5) en haut.
// Repère : origine au milieu du plan d'appui des pattes, Y vers le haut, X
// selon l'axe de la calandre (boîte à eau vers +X), +Z vers l'avant de la
// vue isométrique (côté des boutonnières). Axe de la calandre à y = 0.13.
// Encombrement ≈ 0.58 (X) × 0.42 (Y) × 0.26 (Z) m. Cotes estimées d'après les
// proportions de la vue (calandre Ø 6 po pour l'échelle, piquages -24).
import { IN, NPT, SAE, nptFitting, orbElbow, orient } from './_chassis.js';

export default function P224(api) {
  const { S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  const R = 3 * IN, L = 14 * IN, YA = 0.13;
  const RF = 4.5 * IN, TF = 0.75 * IN;
  const XL = -L / 2, XR = L / 2; // faces extérieures des brides de calandre
  const XP1 = XL + 0.07, XP2 = XR - 0.08; // piquages d'huile
  const rORB = (SAE[24].t * IN) / 2;

  // ---------------------------------------------------------------- 1 — échangeur
  {
    const black = [];
    black.push(S.cyl(R, L - 2 * TF, 'black', { axis: 'x', seg: 48, pos: [0, YA, 0] }));
    for (const s of [-1, 1]) {
      black.push(S.lathe([[R - 0.004, 0], [RF, 0], [RF, TF - 0.002], [RF - 0.002, TF], [R - 0.004, TF]], 'black', { axis: s > 0 ? 'x' : '-x', seg: 48, pos: [s * (L / 2 - TF), YA, 0] }));
    }
    // Couvercle bombé (gauche) et boîte à eau (droite), en fonte.
    const cast = [
      S.lathe([[0, 0], [RF, 0], [RF, TF * 0.8], [R * 1.05, TF * 1.0], [R * 0.95, TF * 1.8], [R * 0.6, TF * 2.4], [0, TF * 2.6]], 'castIron', { axis: '-x', seg: 48, pos: [XL, YA, 0] }),
      S.lathe([[0, 0], [RF, 0], [RF, TF * 0.8], [R * 1.08, TF], [R * 1.08, 2.6 * IN], [R * 0.96, 2.9 * IN], [0, 2.9 * IN]], 'castIron', { axis: 'x', seg: 48, pos: [XR, YA, 0] }),
    ];
    // Bossages des orifices d'eau sur le fond de la boîte.
    const xw = XR + 2.9 * IN;
    for (const [y, z] of [[YA + 0.035, 0.03], [YA - 0.03, -0.01]]) cast.push(S.cyl(0.024, 0.01, 'castIron', { axis: 'x', seg: 24, pos: [xw + 0.005, y, z] }));
    // Boulons de brides (8 par bride), têtes côté fonte.
    const steel = [
      S.boltCircle(8, RF - 0.012, 0.5 * IN, 2.2 * IN, 'zinc', { axis: 'x', pos: [XR + TF * 0.8, YA, 0], phase: Math.PI / 8 }),
      S.boltCircle(8, RF - 0.012, 0.5 * IN, 2.2 * IN, 'zinc', { axis: '-x', pos: [XL - TF * 0.8, YA, 0], phase: Math.PI / 8 }),
    ];
    // Pattes d'appui : plaque pliée en L (âme verticale soudée sous la bride, semelle à boutonnière).
    const feet = [];
    for (const s of [-1, 1]) {
      const x = s * (L / 2 - TF / 2);
      feet.push(S.box(0.25 * IN, YA - R * 0.6, 0.2, 'black', { r: 0.001, pos: [x, (YA - R * 0.6) / 2, 0] }));
      const sole = S.plate(0.05, 0.2, 0.25 * IN, 'black', { r: 0.004, cutouts: [[0, -0.065, 0.016, 0.04], [0, 0.065, 0.016, 0.04]] });
      sole.position.set(x + s * 0.025, 0.125 * IN, 0);
      feet.push(sole);
    }
    // Piquages d'huile : bossages soudés sur la calandre.
    for (const x of [XP1, XP2]) black.push(S.cyl(rORB * 1.45, 0.03, 'black', { seg: 28, pos: [x, YA + R - 0.005, 0] }));
    P('1', S.group(S.merged([...black, ...feet], 'black'), S.merged(cast, 'castIron'), S.merged(steel, 'zinc')), [0, 0, 0]);
  }

  // ---------------------------------------------------------------- piquage gauche : 9, 8, 3, 7, 2
  const yTop = YA + R + 0.01; // dessus des bossages
  const r20 = (NPT[20] * IN) / 2;
  // 9 — MORB -24 → FNPT -20 : queue ORB, six-pans 2 1/8 po, manchon taraudé.
  const hh9 = 0.025;
  P('9', S.at(S.group(
    S.merged([
      S.lathe([[0, -0.018], [rORB * 0.95, -0.018], [rORB, -0.015], [rORB, 0], [0, 0]], 'zinc', { seg: 24 }),
      S.nut(2.125 * IN, hh9, 'zinc', { pos: [0, hh9 / 2 + 0.001, 0] }),
      S.lathe([[r20 * 0.98, hh9], [r20 * 1.32, hh9], [r20 * 1.32, hh9 + 0.016], [r20 * 1.26, hh9 + 0.02], [r20 * 0.98, hh9 + 0.02], [r20 * 0.98, hh9]], 'zinc', { seg: 28 }),
    ], 'zinc'),
    S.torus(rORB * 1.04, 0.0018, 'rubber', { pos: [0, 0.001, 0] }),
  ), [XP1, yTop, 0]), [0, 0.1, 0]);
  // 8 — té de passage 1 1/4 NPT : queue mâle en bas, taraudages en haut et sur la branche (-X).
  const tb = r20 * 1.35, tl = 0.065;
  const y8 = yTop + hh9 + 0.006; // bas du corps
  const male = S.thread(r20 * 0.94, -0.022, 0, { r1: r20, pitch: r20 * 0.2, maxTurns: 6 });
  P('8', S.at(S.merged([
    S.lathe([[r20 * 0.7, -0.022], ...male, [r20 * 0.7, 0], [r20 * 0.7, -0.022]], 'zinc', { seg: 24 }),
    S.lathe([[r20 * 0.98, 0], [tb, 0], [tb, tl], [r20 * 0.98, tl], [r20 * 0.98, 0]], 'zinc', { seg: 28 }),
    S.lathe([[r20 * 0.98, 0], [tb, 0], [tb, tl * 0.55], [r20 * 0.98, tl * 0.55], [r20 * 0.98, 0]], 'zinc', { axis: '-x', seg: 28, pos: [-tb * 0.4, tl / 2, 0] }),
    S.box(tb * 2, tb * 1.4, tb * 1.6, 'zinc', { r: tb * 0.5, pos: [-tb * 0.3, tl / 2, 0] }),
  ], 'zinc'), [XP1, y8, 0]), [0, 0.2, 0]);
  // 3 — coude 45° dans la branche, sortie vers -X et le bas.
  const e3 = nptFitting(api, { npt: 20, jic: 20, angle: 45 });
  P('3', orient(api, e3.obj, [XP1 - tb * 0.4 - tl * 0.55, y8 + tl / 2, 0], [-1, 0, 0], [0, -1, 0]), [-0.1, 0.2, 0]);
  // 7 — réduction six-pans 1 1/4 MNPT × 1/2 FNPT sur le haut du té.
  const y7 = y8 + tl;
  const r8 = (NPT[8] * IN) / 2;
  P('7', S.at(S.merged([
    S.lathe([[r8 * 0.98, -0.018], ...S.thread(r20 * 0.94, -0.018, 0, { r1: r20, pitch: r20 * 0.2, maxTurns: 5 }), [r8 * 0.98, 0], [r8 * 0.98, -0.018]], 'zinc', { seg: 24 }),
    S.ring(1.375 * IN / Math.sqrt(3), r8 * 0.98, 0.014, 'zinc', { seg: 6, pos: [0, 0.007, 0] }),
  ], 'zinc'), [XP1, y7, 0]), [0, 0.3, 0]);
  // 2 — sonde de température : six-pans 7/8, col, tête de raccordement alu à couvercle vissé, presse-étoupe.
  const y2 = y7 + 0.014;
  P('2', S.at(S.group(
    S.merged([
      S.nut(0.875 * IN, 0.012, 'steel', { pos: [0, 0.006, 0] }),
      S.cyl(0.006, 0.05, 'steel', { seg: 14, pos: [0, 0.037, 0] }),
      S.nut(0.75 * IN, 0.01, 'steel', { pos: [0, 0.065, 0] }),
    ], 'steel'),
    S.merged([
      S.lathe([[0, 0.07], [0.018, 0.07], [0.026, 0.078], [0.026, 0.1], [0, 0.1]], 'castAlu', { seg: 28 }),
      S.lathe([[0, 0.1], [0.027, 0.1], [0.027, 0.11], [0.022, 0.116], [0, 0.116]], 'castAlu', { seg: 28 }),
      S.box(0.02, 0.006, 0.008, 'castAlu', { pos: [0, 0.119, 0] }),
      S.cyl(0.009, 0.014, 'castAlu', { axis: 'z', seg: 18, pos: [0, 0.088, 0.03] }),
    ], 'castAlu'),
    S.merged([S.nut(0.022, 0.008, 'plastic', { axis: 'z', pos: [0, 0.088, 0.041] }), S.cyl(0.0045, 0.01, 'plastic', { axis: 'z', seg: 12, pos: [0, 0.088, 0.05] })], 'plastic'),
  ), [XP1, y2, 0]), [0, 0.4, 0]);

  // ---------------------------------------------------------------- piquage droit : 6
  const e6 = orbElbow(api, 24, 20);
  P('6', orient(api, e6.obj, [XP2, yTop, 0], [0, 1, 0], [0, 0, -1]), [0, 0.15, -0.05]);

  // ---------------------------------------------------------------- boîte à eau : 4, 5
  const xw = XR + 2.9 * IN + 0.01;
  const e4 = nptFitting(api, { npt: 16, jic: 16, angle: 90 });
  P('4', orient(api, e4.obj, [xw, YA - 0.03, -0.01], [1, 0, 0], [0, -1, 0]), [0.12, 0, 0]);
  const a5 = nptFitting(api, { npt: 16, jic: 16 });
  P('5', orient(api, a5.obj, [xw, YA + 0.035, 0.03], [1, 0, 0]), [0.14, 0, 0]);

  return { view: { dir: [0.9, 0.75, 1.05] } };
}

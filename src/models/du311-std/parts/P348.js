// P348 — Tableau de manomètres : CX034749 rév. 0 « ASSY, GAUGE PANEL, DU311 »
// (page 348), repère 12 du porteur P208. Sur la tôle du tableau (porteur, non
// listée ici : 120 × 470 mm, 10 ga, échancrure en demi-cercle Ø 128 mm sur le
// bord avant, retour plié à l'arrière le long du bord avant), en deux colonnes
// décalées, de haut en bas (étiquettes de la page 348) : pression du système
// hydraulique, avance, rotation, retenue, tirage (manomètres Ø 2 1/2 po
// 0-5000 psi à bain de glycérine, 2) et pression d'eau (manomètre Ø 3 1/4 po,
// 1) ; boîtiers inox à lunette sertie, cadran blanc gradué, aiguille rouge,
// bouchon de remplissage, raccord arrière 1/4 NPT à six-pans de laiton. Au dos,
// sur chaque raccord, un coude 90° FNPT -04 → JIC -06 (3) tourné vers le bas.
// Le retour de la tôle est boulonné sur la console du porteur par trois vis H
// 3/8-16 × 1 po filetées jusqu'à la tête (4), six rondelles Grower (5, une
// sous la tête et une sous l'écrou) et trois écrous (6).
// Cotes : diamètres des cadrans (2 1/2 po) pour l'échelle de la page 348.
// Repère machine (layout.js), posé à l'identité par P208 : tableau sur le côté
// droit du pont avant, face des cadrans vers l'extérieur (+Z) dans le plan
// z = 0.93, tôle de x = 0.91 à 1.03, haut à y = 1.72 (FB.gauge de _frontb.js ;
// repère 12 de carrier.js). Châssis avant : corps « front » de la simulation.
import { FB, IN, NPT, fnptElbow, orient, boltAt, nutAt, splitWasher, front } from './_frontb.js';

const TP = 0.135 * IN; // tôle 10 ga
// Manomètres : [repère, x (colonne), distance sous le haut de la tôle, rayon du boîtier, pleine échelle].
const G = [
  ['2', 1, 0.033, 1.25 * IN, 50], ['2', -1, 0.086, 1.25 * IN, 50], ['2', 1, 0.14, 1.25 * IN, 50],
  ['2', -1, 0.194, 1.25 * IN, 50], ['2', 1, 0.378, 1.25 * IN, 50], ['1', -1, 0.43, 1.6 * IN, 30],
];

/** Manomètre à montage arrière : dos du boîtier à z = 0, cadran vers +Z, raccord selon −Z. */
function gaugeAt(api, R, n) {
  const { S, THREE } = api;
  const dz = R * 0.95; // profondeur du boîtier
  const zd = dz - R * 0.22; // cadran
  // Boîtier embouti : fond arrondi, fût, lunette sertie ; l'intérieur s'arrête au cadran.
  const caseM = S.lathe([[0, 0], [R * 0.86, 0], [R * 0.97, R * 0.06], [R, R * 0.16], [R, dz - R * 0.1], [R * 1.05, dz - R * 0.08], [R * 1.06, dz], [R * 1.03, dz + R * 0.06], [R * 0.93, dz + R * 0.07], [R * 0.92, dz - R * 0.02], [R * 0.92, zd - 0.001], [0, zd - 0.001]], 'chrome', { axis: 'z', seg: 36 });
  const dial = S.cyl(R * 0.915, 0.0008, 'white', { axis: 'z', seg: 36, pos: [0, 0, zd - 0.0004] });
  const glass = S.cyl(R * 0.93, 0.0012, 'glass', { axis: 'z', seg: 36, pos: [0, 0, dz + R * 0.035] });
  const black = [];
  const zt = zd + 0.0003;
  const N = n * 2; // graduations sur 270°
  for (let i = 0; i <= N; i++) {
    const a = (-135 + (i * 270) / N) * (Math.PI / 180);
    const major = i % 10 === 0, mid = i % 5 === 0;
    const l = R * (major ? 0.16 : mid ? 0.11 : 0.06);
    const rr = R * 0.82 - l / 2;
    black.push(S.box(R * (major ? 0.035 : 0.016), l, 0.0004, 'black', { pos: [Math.sin(a) * rr, Math.cos(a) * rr, zt], rot: [0, 0, -a] }));
    if (major) {
      // Chiffres suggérés : deux pavés courts à l'intérieur de la graduation.
      const rn = R * 0.55;
      for (const k of [-1, 1]) black.push(S.box(R * 0.05, R * 0.09, 0.0004, 'black', { pos: [Math.sin(a) * rn + k * R * 0.035 * Math.cos(a), Math.cos(a) * rn - k * R * 0.035 * Math.sin(a), zt], rot: [0, 0, -a] }));
    }
  }
  black.push(S.box(R * 0.32, R * 0.06, 0.0004, 'black', { pos: [0, -R * 0.38, zt] })); // « psi »
  black.push(S.box(R * 0.5, R * 0.05, 0.0004, 'black', { pos: [0, R * 0.3, zt] })); // marque
  black.push(S.cyl(R * 0.08, 0.003, 'black', { axis: 'z', seg: 16, pos: [0, 0, zt + 0.0015] }));
  const ang = -1.9;
  const needle = S.box(R * 0.05, R * 0.78, 0.0006, 'red', { pos: [Math.sin(-ang) * R * 0.28, Math.cos(-ang) * R * 0.28, zt + 0.0032], rot: [0, 0, ang] });
  const fill = S.cyl(R * 0.1, R * 0.12, 'rubber', { seg: 12, pos: [0, R * 1.02, dz * 0.55] });
  // Raccord arrière 1/4 NPT : six-pans de laiton et queue conique.
  const rn = (NPT[4] * IN) / 2;
  const stem = S.merged([
    S.nut((9 / 16) * IN, 0.006, 'brass', { axis: 'z', pos: [0, 0, -0.003] }),
    S.lathe([[0, -0.02], ...S.thread(rn * 0.94, -0.02, -0.006, { r1: rn, pitch: rn * 0.2 }), [0, -0.006]], 'brass', { axis: 'z', seg: 14 }),
  ], 'brass');
  void THREE;
  return { obj: S.group(caseM, dial, glass, S.merged(black, 'black'), needle, fill, stem), stemLen: 0.02 };
}

export default function P348(api) {
  const { S } = api;
  const P = (ref, obj, e) => api.part(ref, front(obj), e);
  const { x: xc, top, z: zp } = FB.gauge;
  for (const [ref, col, dy, R, n] of G) {
    const x = xc + col * 0.0286, y = top - dy;
    const g = gaugeAt(api, R, n);
    P(ref, S.at(g.obj, [x, y, zp]), [0, 0, 0.12]);
    // 3 — coude FNPT -04 → JIC -06 sur le raccord, derrière la tôle, sortie vers le bas.
    const e = fnptElbow(api, 4, 6);
    P('3', orient(api, e.obj, [x, y, zp - TP - 0.003], [0, 0, -1], [0, -1, 0]), [0, -0.03, -0.1]);
  }
  // 4, 5, 6 — fixation du retour de la tôle (bord avant, plié vers l'arrière) sur la console.
  const xf = xc + 0.06; // face extérieure du retour
  for (const y of [1.3, 1.485, 1.67]) {
    const b = boltAt(api, 0.375, 1.0, [xf, y, zp - 0.025], [1, 0, 0], { full: true });
    P('5', b.washer, [0.05, 0, 0]);
    P('4', b.bolt, [0.1, 0, 0]);
    const xn = xf - TP - 0.25 * IN; // dos de la console (tôle 1/4 po)
    P('5', orient(api, splitWasher(S, api.THREE, 0.375), [xn, y, zp - 0.025], [-1, 0, 0]), [-0.05, 0, 0]);
    P('6', nutAt(api, 0.375, [xn - 0.0024, y, zp - 0.025], [-1, 0, 0]), [-0.1, 0, 0]);
  }
  return { view: { dir: [0.5, 0.4, 1.2] } };
}

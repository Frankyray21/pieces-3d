// P192 — Tuyauterie d'air marche / arrêt « ASSY, AIR ON/OFF PIPING » CX035903
// rév. 0 (page 192, vue éclatée en ligne). Ligne 2 po NPT (mamelons SCH 80)
// de l'entrée d'air auxiliaire à la sortie d'air de forage : vanne à bille
// manuelle (5) – mamelon court (21) – support d'élingue anti-fouet (8) –
// clapet anti-retour à ressort (7) – mamelon 5 po (19) – té (18 ; branche :
// mamelon court, bride adaptatrice NPTF → code 61, 4, et trousse de bride
// fendue, 14 : arrivée du réservoir) – mamelon 5 po – clapet anti-retour –
// mamelon court – vanne à bille motorisée (5 : équerre d'actionneur 2, vis
// 22 et rondelles 23, accouplement 3, actionneur pneumatique 6 vissé par
// deux vis M8 (1) et rondelles (24), tés tournants 10 et coudes 11 sur ses
// orifices de pilotage) – mamelon court – té (18, bouchon carré forgé 17 :
// sortie d'échappement de la télécommande) – collecteur de refoulement
// mécano-soudé (9 : coude 11 de la prise du transmetteur de pression,
// bouchons NPT à six-pans creux 12 et 13) – coude femelle 90° (16) –
// mamelon 7 po (20) – support d'élingue (8) – coude femelle 45° (15) –
// mamelon court – bride adaptatrice (4) et trousse de bride fendue (14) :
// sortie d'air de forage.
// Repère : origine sur l'axe de la ligne au bout de la vanne d'entrée
// auxiliaire ; la ligne suit +Z, Y vers le haut, X vers l'avant ; colonne
// montante de sortie vers +Y au bout +Z, coude 45° vers −X (P188 la pose en
// PIPE, axes de la machine).
// Encombrement ≈ 0.25 (X) × 0.40 (Y) × 1.43 (Z) m.

import { IN, u, L, hexPrism, frame, along, hhcs, nordLock, splitWasher, nptElbow, jicElbow, nptPlug } from './_slide.js';

// Positions le long de la ligne (m) : début, fin.
const Z = {
  v1: [0, 0.16], n1: 0.172, c1: [0.185, 0.315], n5a: [0.315, 0.404], t1: [0.404, 0.514], n5b: [0.514, 0.603],
  c2: [0.603, 0.733], n2: 0.7455, v2: [0.758, 0.918], n3: 0.9305, t2: [0.943, 1.053], m: [1.053, 1.33], el: 1.38,
};
export const P192G = {
  tankBranch: [0, 4.55 * IN, (Z.t1[0] + Z.t1[1]) / 2], // face de bride de la branche du té (arrivée du réservoir)
  riser: Z.el, // axe de la colonne montante
  manifold: Z.m,
};

export default function P192(api) {
  const { THREE, S } = api;
  const { box, cyl, merged, group, at, ballValve } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const put = (obj, p, dir) => along(THREE, obj, dir, p);
  const zc = (r) => (r[0] + r[1]) / 2;

  // Mamelon 2 po (le long de +Y, centré, longueur l en po) : filets aux deux bouts.
  const nipple = (l) => L(S, [[0, -l / 2], ...S.thread(1.19, -l / 2, -l / 2 + 0.75, { r1: 1.15, pitch: 0.087, maxTurns: 6 }), [1.19, l / 2 - 0.75], ...S.thread(1.19, l / 2 - 0.75, l / 2, { r1: 1.15, pitch: 0.087, maxTurns: 6, chamferBottom: false }).slice(1), [0, l / 2]], 'steel', 24);
  const alongZ = (obj, z) => frame(THREE, obj, [0, 0, z], [1, 0, 0], [0, 0, 1], [0, -1, 0]);
  // Té femelle 2 po : corps (passage selon Y), branche selon +X local.
  const tee = () => group(merged([
    L(S, [[0, -2.15], [1.6, -2.15], [1.6, -1.75], [1.48, -1.65], [1.48, 1.65], [1.6, 1.75], [1.6, 2.15], [0, 2.15]], 'castIron', 28),
    at(L(S, [[0, 0], [1.48, 0], [1.48, 1.75], [1.6, 1.85], [1.6, 2.15], [0, 2.15]], 'castIron', 28), [0, 0, 0], [0, 0, -Math.PI / 2]),
  ], 'castIron'));
  // Clapet anti-retour 2 po : deux six-pans, corps renflé, flèche de sens moulée.
  const check = () => group(merged([
    hexPrism(S, THREE, 3.0, 0.9, -2.56, 0, 'brass'), hexPrism(S, THREE, 3.0, 0.9, 1.66, 0, 'brass'),
    L(S, [[0, -1.66], [1.5, -1.66], [1.9, -1.0], [1.95, 0], [1.9, 1.0], [1.5, 1.66], [0, 1.66]], 'brass', 28),
    at(box(u(0.12), u(1.6), u(0.5), 'brass'), [u(1.95), 0, 0]),
  ], 'brass'));
  // Coude femelle 2 po (angle deg) : entrée selon −Y local, sortie selon la direction tournée vers +X.
  const elbowF = (deg) => {
    const a = (deg * Math.PI) / 180;
    return group(merged([
      L(S, [[0, -1.9], [1.6, -1.9], [1.6, -1.6], [1.5, -1.5], [1.5, 0], [0, 0]], 'castIron', 24),
      at(S.ball(u(1.5), 'castIron'), [0, 0, 0]),
      at(L(S, [[0, 0], [1.5, 0], [1.5, 1.5], [1.6, 1.6], [1.6, 1.9], [0, 1.9]], 'castIron', 24), [0, 0, 0], [0, 0, -(Math.PI / 2 - (Math.PI / 2 - a))]),
    ], 'castIron'));
  };
  // Bride adaptatrice 2 po NPTF → code 61 (le long de +Y : taraudage en y = 0, face de bride en haut).
  const flangeAd = () => merged([hexPrism(S, THREE, 3.0, 0.9, 0, 1.0, 'steel'), L(S, [[1.0, 0.9], [1.35, 0.9], [1.35, 1.5], [1.53, 1.5], [1.53, 1.85], [1.0, 1.85], [1.0, 0.9]], 'steel', 32)], 'steel');
  const splitKit = () => group(
    merged([-1, 1].map((s) => at(box(u(1.6), u(0.62), u(4.0), 'zinc', { r: u(0.1) }), [s * u(0.85), u(1.5 + 0.31), 0])), 'zinc'),
    merged([-1, 1].flatMap((s) => [-1, 1].map((k) => at(hhcs(S, THREE, 0.5, 1.75), [s * u(0.85), u(1.5 + 0.62), k * u(1.6)]))), 'zinc'),
  );
  // Support d'élingue anti-fouet 2 po : collier en deux demi-coquilles, oreille percée.
  const whip = () => group(merged([
    S.slotted(u(1.55), u(1.2), -u(0.5), u(0.5), [{ a: Math.PI / 2, w: 0.15, y0: -u(0.6), y1: u(0.6) }], 'zinc', { seg: 28 }),
    ...[-1, 1].map((s) => at(box(u(0.9), u(1.0), u(0.25), 'zinc'), [u(1.9), 0, s * u(0.2)])),
    at(S.ring(u(0.75), u(0.35), u(0.25), 'zinc', { axis: 'x' }), [0, 0, 0]),
  ], 'zinc'), merged([at(hhcs(S, THREE, 0.375, 1.25), [u(2.0), 0, u(0.33)], [Math.PI / 2, 0, 0])], 'zinc'));
  // Vanne à bille 2 po sans levier (motorisée) : corps, embouts six-pans, carré de tige.
  const valveBody = () => group(merged([
    L(S, [[0, -3.15], [1.5, -3.15], [1.5, -2.2], [1.8, -2.0], [2.0, -1.2], [2.05, 0], [2.0, 1.2], [1.8, 2.0], [1.5, 2.2], [1.5, 3.15], [0, 3.15]], 'steel', 28),
    hexPrism(S, THREE, 3.0, 0.9, -3.15, 1.2, 'steel'), hexPrism(S, THREE, 3.0, 0.9, 2.25, 1.2, 'steel'),
    at(L(S, [[0, 0], [0.8, 0], [0.8, 0.7], [0, 0.7]], 'steel', 16), [u(1.9), 0, 0], [0, 0, -Math.PI / 2]),
  ], 'steel'));

  // ================================================================ vannes, clapets, tés, mamelons
  P('5', at(ballValve(0.08, 'steel', { axis: 'z' }), [0, 0, zc(Z.v1)]), [0, 0, -0.15]);
  P('21', alongZ(nipple(2.0), Z.n1), [0, 0.06, 0]);
  P('8', alongZ(whip(), Z.n1), [0.1, 0.06, 0]);
  P('7', alongZ(check(), zc(Z.c1)), [0, 0.1, 0]);
  P('19', alongZ(nipple(5.0), zc(Z.n5a)), [0, 0.08, 0]);
  // té de l'arrivée du réservoir : branche vers +Y
  P('18', frame(THREE, tee(), [0, 0, zc(Z.t1)], [0, 1, 0], [0, 0, 1], [1, 0, 0]), [0, 0.12, 0]);
  P('21', at(nipple(2.0), [0, u(2.15 + 0.3), zc(Z.t1)]), [0, 0.2, 0]);
  P('4', at(flangeAd(), [0, u(2.15 + 0.55), zc(Z.t1)]), [0, 0.26, 0]);
  P('14', at(splitKit(), [0, u(2.15 + 0.55), zc(Z.t1)]), [0, 0.32, 0]);
  P('19', alongZ(nipple(5.0), zc(Z.n5b)), [0, 0.08, 0]);
  P('7', alongZ(check(), zc(Z.c2)), [0, 0.1, 0]);
  P('21', alongZ(nipple(2.0), Z.n2), [0, 0.06, 0]);
  // vanne motorisée : corps, équerre, accouplement, actionneur vers l'avant (+X)
  P('5', alongZ(valveBody(), zc(Z.v2)), [0, 0.1, 0]);
  const zv = zc(Z.v2), xs = u(2.6);
  const bracket = group(merged([
    at(box(0.006, 0.07, 0.11, 'zinc'), [xs, 0, zv]),
    at(box(0.06, 0.006, 0.11, 'zinc'), [xs + 0.03, 0.032, zv]), at(box(0.06, 0.006, 0.11, 'zinc'), [xs + 0.03, -0.032, zv]),
    at(box(0.006, 0.07, 0.11, 'zinc'), [xs + 0.06, 0, zv]),
  ], 'zinc'));
  P('2', bracket, [0.12, 0, 0]);
  for (const [dy, dz] of [[0.025, -0.04], [-0.025, -0.04], [0.025, 0.04], [-0.025, 0.04]]) {
    P('23', frame(THREE, splitWasher(S, THREE, 0.3125), [xs - 0.003, dy, zv + dz], [0, 1, 0], [-1, 0, 0], [0, 0, 1]), [0.1, 0, 0]);
    P('22', frame(THREE, hhcs(S, THREE, 0.3125, 0.75), [xs - 0.0055, dy, zv + dz], [0, 1, 0], [-1, 0, 0], [0, 0, 1]), [0.06, 0, 0]);
  }
  P('3', at(cyl(0.008, 0.05, 'steel', { axis: 'x', seg: 12 }), [u(2.7) + 0.005, 0, zv]), [0.16, 0, 0]);
  // actionneur pneumatique à crémaillère : corps alu, couvercles, indicateur
  const xa = xs + 0.064;
  const act = group(
    merged([at(box(0.075, 0.075, 0.15, 'castAlu', { r: 0.008 }), [0.0375, 0, 0]), ...[-1, 1].map((s) => at(box(0.075, 0.08, 0.012, 'castAlu', { r: 0.004 }), [0.0375, 0, s * 0.081]))], 'castAlu'),
    at(S.cyl(0.018, 0.012, 'yellow', { axis: 'x', seg: 16 }), [0.081, 0, 0]),
  );
  P('6', at(act, [xa, 0, zv]), [0.22, 0, 0]);
  for (const s of [-1, 1]) {
    const p = [xa + 0.0375, 0.0405, zv + s * 0.04];
    P('24', put(nordLock(S, THREE, 0.3125), [xa - 0.0001, s * 0.02, zv + s * 0.03].map((v, i) => (i === 0 ? xs + 0.063 : v)), [-1, 0, 0]), [0.18, 0, 0]);
    P('1', put(hhcs(S, THREE, 0.315, 0.55), [xs + 0.0605, s * 0.02, zv + s * 0.03], [-1, 0, 0]), [0.14, 0, 0]);
    // orifices de pilotage sur le dessus : coude NPT 1/4 → JIC -6 (11), té tournant (10)
    P('11', put(nptElbow(S, THREE, 6, { male: true, nptDash: 4 }), p, [0, 1, 0]), [0.2, 0.08, 0]);
    P('10', frame(THREE, jicElbow(S, THREE, 6, { swivel: true, tee: true }), [p[0] + u(1.25), p[1] + u(0.55), p[2]], [0, 0, 1], [-1, 0, 0], [0, -1, 0]), [0.26, 0.1, 0]);
  }
  P('21', alongZ(nipple(2.0), Z.n3), [0, 0.06, 0]);
  // té d'échappement : branche vers le bas, bouchon carré forgé
  P('18', frame(THREE, tee(), [0, 0, zc(Z.t2)], [0, -1, 0], [0, 0, 1], [-1, 0, 0]), [0, -0.12, 0]);
  P('17', put(merged([at(box(u(1.4), u(1.0), u(1.4), 'steel', { r: u(0.08) }), [0, u(0.5), 0]), L(S, [[0, -0.9], ...S.thread(1.19, -0.9, 0, { r1: 1.25, pitch: 0.087, maxTurns: 5 }), [0, 0]], 'steel', 20)], 'steel'), [0, -u(2.15), zc(Z.t2)], [0, -1, 0]), [0, -0.2, 0]);
  // 9 — collecteur de refoulement : tube 2 po, manchons soudés, embouts filetés
  const zm = zc(Z.m), lm = Z.m[1] - Z.m[0];
  const cpl = (z, dir, r) => put(cyl(u(r), u(0.5), 'grey', { seg: 14 }), [dir[0] * u(1.35), dir[1] * u(1.35), z], dir);
  P('9', group(merged([
    alongZ(L(S, [[0, -lm / 2 / IN], ...S.thread(1.19, -lm / 2 / IN, -lm / 2 / IN + 0.75, { r1: 1.15, pitch: 0.087, maxTurns: 6 }), [1.19, lm / 2 / IN - 0.75], ...S.thread(1.19, lm / 2 / IN - 0.75, lm / 2 / IN, { r1: 1.15, pitch: 0.087, maxTurns: 6, chamferBottom: false }).slice(1), [0, lm / 2 / IN]], 'grey', 24), zm),
    cpl(zm - 0.08, [0, 1, 0], 0.55), cpl(zm, [0, 1, 0], 0.55), cpl(zm + 0.07, [1, 0, 0], 0.7), cpl(zm + 0.07, [0, 1, 0], 0.55),
  ], 'grey'), S.weldRing(u(0.6), 0.004, 'grey', { pos: [0, u(1.2), zm] })), [0, 0.15, 0]);
  P('12', put(nptPlug(S, THREE, 4), [0, u(1.6), zm - 0.08], [0, 1, 0]), [0, 0.22, 0]);
  P('12', put(nptPlug(S, THREE, 4), [0, u(1.6), zm + 0.07], [0, 1, 0]), [0, 0.22, 0]);
  P('11', put(nptElbow(S, THREE, 6, { male: true, nptDash: 4 }), [0, u(1.6), zm], [0, 1, 0]), [0, 0.25, 0]);
  P('13', put(nptPlug(S, THREE, 8), [u(1.6), 0, zm + 0.07], [1, 0, 0]), [0.2, 0, 0]);
  // 16 — coude 90° vers le haut, 20 — mamelon 7 po, 8 — support d'élingue, 15 — coude 45°, 21, 4, 14
  P('16', frame(THREE, elbowF(90), [0, 0, Z.el], [0, 1, 0], [0, 0, 1], [1, 0, 0]), [0, 0, 0.12]);
  const yN = u(1.9 + 3.5 - 1.5);
  P('20', at(nipple(7.0), [0, u(1.9 - 0.75) + u(3.5), Z.el]), [0, 0.15, 0.12]);
  P('8', at(whip(), [0, yN + 0.02, Z.el]), [0.1, 0.15, 0.12]);
  const y45 = u(1.9 - 0.75 + 7.0 - 0.75 + 1.9);
  // coude 45° : entrée vers le bas, sortie tournée vers −X à 45°
  P('15', frame(THREE, elbowF(45), [0, y45, Z.el], [-1, 0, 0], [0, 1, 0], [0, 0, -1]), [0, 0.25, 0.12]);
  const d45 = [-Math.SQRT1_2, Math.SQRT1_2, 0];
  const p21 = [d45[0] * u(1.9 + 0.3), y45 + d45[1] * u(1.9 + 0.3), Z.el];
  P('21', put(nipple(2.0), p21, d45), [0, 0.3, 0.12]);
  const p4 = [d45[0] * u(1.9 + 0.55), y45 + d45[1] * u(1.9 + 0.55), Z.el];
  P('4', put(flangeAd(), p4, d45), [-0.1, 0.35, 0.12]);
  P('14', put(splitKit(), p4, d45), [-0.15, 0.4, 0.12]);
  return { view: { dir: [1, 0.6, 1] } };
}

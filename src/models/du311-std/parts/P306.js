// P306 — Vérin de direction CX005497 (page 306) : « CYLINDER - 3.00" X 15"
// STROKE », alésage 3 po, course 15 po ; deux vérins en opposition entre les
// châssis arrière et avant du porteur (repère 29 de P292). Vérin soudé dessiné
// en coupe (tube rompu) :
// - tube soudé (14) : tube Ø 3 1/2 × 3 po (14.1), fond (14.2) et œil de fond
//   (14.3) soudés, deux bossages d'orifice SAE-6 ORB (14.4) près des deux
//   bouts ; cordons de soudure = repère 14 (l'ensemble) ;
// - tête (1) vissée au ras du tube, deux trous de clé sur la face : torique
//   et bague anti-extrusion (17.1 / 17.2) sur son pourtour, bague de guidage
//   (17.5), joint de tige (17.3) et racleur (17.4) dans l'alésage ;
// - tige (12.1) chromée Ø 1 3/4 po et œil de tige (12.2) soudé (cordon =
//   repère 12) ; piston (7) vissé sur la tige, collet six-pans côté fond, joint
//   de piston (17.6), bague de guidage (17.7) et torique intérieur (17.8) ;
// - rotules (13) Ø 2 po dans les deux œils (axes des expanseurs Ø 2 po du
//   porteur), bouchons de graissage à torique (16) sur le flanc des œils.
// Joints de la trousse 17 (« SEAL KIT », non vendus séparément) modélisés à
// leur place.
// Repère : origine au centre de l'œil de fond, +X le long de l'axe vers l'œil
// de tige ; axes des œils (rotules) selon Y ; bossages d'orifice et bouchons
// des œils vers +Z. Option { ext } : sortie de tige (m, 0 à la course) ;
// entraxe rentré 32,68 po (0,830 m), sorti 47,68 po (1,211 m).
// Encombrement (rentré) 0.890 (X, de -0.060 à +0.890) × 0.044 (Y) × 0.124 (Z) m.
// Cotes : liste (alésage, course) et coupe de la page 306 à l'échelle de
// l'alésage (≈ 71 px/po) : tube Ø 3 1/2, tige Ø 1 3/4, œils Ø 4 3/4 × 1 3/4,
// rotules Ø 3 1/8 × 1 1/2 alésées Ø 2. Entraxe rentré choisi pour que la course
// couvre les ±35° de braquage du porteur (voir CAR dans _carrier.js).
import { u, L, put, along } from './_carrier.js';
import { rodSide } from '../layout.js';

// Cotes axiales (po) depuis l'œil de fond, vérin rentré.
const X = {
  lugBase: 2.8, // pied de l'œil de fond (dessous du fond)
  floor: 3.3, // face intérieure du fond = pied du tube
  hexEnd: 4.2, // collet six-pans du piston
  pistonTop: 5.6,
  headBot: 20.6, // = pistonTop + course
  tubeTop: 23.35,
  rodEye: 32.68, // entraxe rentré
  eyeNeck: 29.08, // pied de l'œil de tige
};
const STROKE = 15;
const BORE = 1.5, TUBE = 1.75, ROD = 0.875; // rayons (po)
const EYE = { R: 2.375, w: 1.75, bore: 1.575 }; // œils : rayon, épaisseur (selon Y), logement de la rotule
const PORTS = [4.6, 21.9];

export const CYL306 = {
  retracted: u(X.rodEye),
  stroke: u(STROKE),
  eyeW: u(EYE.w),
  pinR: u(1.0),
};

export default function P306(api, opts = {}) {
  const { THREE, S } = api;
  const { merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const ext = Math.max(0, Math.min(u(STROKE), opts.ext ?? 0)) / 0.0254; // po
  // Pièce construite le long de +Y (profils de révolution), axe des œils selon X :
  // ramenée sur +X (axe du vérin), axe des œils selon -Y, +Z conservé.
  const ax = (obj) => { const g = group(obj); g.rotation.z = -Math.PI / 2; return g; };

  // Œil plat (po) : bloc de demi-largeur R terminé par un demi-cercle de centre
  // (yc), du pied yb ; épaisseur w selon X (axe de l'alésage), percé du logement.
  const eye = (yc, yb, sign, mat) => {
    const n = 18, pts = [[EYE.R * 0.62, yb], [EYE.R, yb + sign * 0.9], [EYE.R, yc]];
    for (let i = 1; i < n; i++) { const a = (i / n) * Math.PI; pts.push([EYE.R * Math.cos(a), yc + sign * EYE.R * Math.sin(a)]); }
    pts.push([-EYE.R, yc], [-EYE.R, yb + sign * 0.9], [-EYE.R * 0.62, yb]);
    const p = sign > 0 ? pts : pts.reverse();
    const m = S.extrude(p.map(([a, y]) => [u(a), u(y)]), u(EYE.w), mat, { holes: [[0, u(yc), u(EYE.bore)]] });
    m.rotation.y = Math.PI / 2; // épaisseur selon X, profil dans le plan (Z, Y)
    return m;
  };

  // ================================================ 14 — tube soudé
  const portBoss = (y) => along(THREE, L(S, [[0.3, 0], [0.55, 0], [0.55, 0.42], [0.5, 0.48], [0.3, 0.48], [0.3, 0]], 'black', 16), [0, u(y), u(TUBE - 0.25)], [0, 0, 1]);
  P('14.1', ax(group(
    S.shell(u(TUBE), u(BORE), u(X.tubeTop - X.floor), 'black', { pos: [0, u((X.floor + X.tubeTop) / 2), 0], seg: 36 }),
    // perçages des orifices (fond sombre) sous les bossages
    ...PORTS.map((y) => along(THREE, L(S, [[0, 0], [0.22, 0], [0.22, 0.04], [0, 0.04]], 'darkSteel', 10), [0, u(y), u(TUBE + 0.18)], [0, 0, 1])),
  )), [0, 0, 0]);
  P('14.2', ax(L(S, [[0, X.lugBase], [TUBE - 0.08, X.lugBase], [TUBE, X.lugBase + 0.08], [TUBE, X.floor], [BORE, X.floor], [BORE, X.floor + 0.05], [0, X.floor + 0.05]], 'black', 36)), [-0.05, 0, 0]);
  P('14.3', ax(eye(0, X.lugBase, -1, 'black')), [-0.11, 0, 0]);
  for (const y of PORTS) P('14.4', ax(portBoss(y)), [0, 0, 0.06]);
  // cordons : tube / fond, fond / œil, bossages
  const ww = u(EYE.w / 2 + 0.06), wz = u(EYE.R * 0.62 + 0.04);
  P('14', ax(group(
    S.weldRing(u(TUBE + 0.02), u(0.22), 'black', { pos: [0, u(X.floor + 0.02), 0] }),
    S.weld([[-ww, u(X.lugBase - 0.05), -wz], [ww, u(X.lugBase - 0.05), -wz], [ww, u(X.lugBase - 0.05), wz], [-ww, u(X.lugBase - 0.05), wz]], u(0.2), 'black', { closed: true }),
    ...PORTS.map((y) => S.weldRing(u(0.58), u(0.12), 'black', { axis: 'z', pos: [0, u(y), u(TUBE - 0.12)] })),
  )), [0, 0, 0.03]);

  // ================================================ 1 — tête, 17.1 à 17.5
  const R1 = ROD + 0.02;
  P('1', ax(group(
    L(S, [[R1, X.headBot], [BORE - 0.1, X.headBot], [BORE - 0.02, X.headBot + 0.08], [BORE - 0.02, X.tubeTop - 0.05], [TUBE - 0.05, X.tubeTop - 0.05],
      [TUBE - 0.05, X.tubeTop + 0.3], [TUBE - 0.12, X.tubeTop + 0.36], [1.12, X.tubeTop + 0.36], [1.12, X.tubeTop + 0.1], [R1, X.tubeTop + 0.1], [R1, X.headBot]], 'black', 36),
    merged([-1, 1].map((s) => L(S, [[0, X.tubeTop + 0.1], [0.12, X.tubeTop + 0.1], [0.12, X.tubeTop + 0.37], [0, X.tubeTop + 0.37]], 'darkSteel', 8, { pos: [s * u(1.42), 0, 0] })), 'darkSteel'),
  )), [0.14, 0, 0]);
  const ring = (ri, ro, y0, y1, mat, seg = 32) => L(S, [[ri, y0], [ro, y0], [ro, y1], [ri, y1], [ri, y0]], mat, seg);
  const oring = (R, r, y, mat = 'rubber', seg = 28) => L(S, Array.from({ length: 7 }, (_, i) => { const a = -Math.PI / 2 + (i / 6) * Math.PI * 2; return [R + r * Math.cos(a), y + r * Math.sin(a)]; }), mat, seg);
  P('17.1', ax(oring(BORE - 0.09, 0.07, X.headBot + 0.9)), [0.1, 0, 0.05]);
  P('17.2', ax(ring(BORE - 0.16, BORE - 0.02, X.headBot + 1.0, X.headBot + 1.07, 'cream', 36)), [0.11, 0, 0.06]);
  P('17.5', ax(ring(R1 - 0.02, R1 + 0.1, X.headBot + 0.3, X.headBot + 1.0, 'cream', 28)), [0.17, 0, 0.04]);
  P('17.3', ax(L(S, [[R1 - 0.02, X.headBot + 1.3], [R1 + 0.2, X.headBot + 1.3], [R1 + 0.2, X.headBot + 1.75], [R1 - 0.02, X.headBot + 1.75], [R1 + 0.02, X.headBot + 1.52], [R1 - 0.02, X.headBot + 1.3]], 'blue', 28)), [0.19, 0, 0.05]);
  P('17.4', ax(L(S, [[R1 - 0.02, X.tubeTop - 0.12], [1.1, X.tubeTop - 0.12], [1.1, X.tubeTop + 0.08], [0.98, X.tubeTop + 0.16], [R1 - 0.02, X.tubeTop + 0.13], [R1 - 0.02, X.tubeTop - 0.12]], 'rubber', 28)), [0.22, 0, 0.05]);

  // ================================================ côté tige (suit la sortie de tige)
  const R = (ref, obj, e) => P(ref, rodSide(at(group(obj), [u(ext), 0, 0])), e);
  // 12.1 — tige chromée, queue filetée dans le piston
  R('12.1', ax(group(
    L(S, [[0, X.pistonTop - 0.02], [ROD - 0.05, X.pistonTop - 0.02], [ROD, X.pistonTop + 0.03], [ROD, X.eyeNeck + 0.6], [0, X.eyeNeck + 0.6]], 'chrome', 32),
    L(S, [[0, X.hexEnd - 0.3], [0.6, X.hexEnd - 0.3], [0.62, X.pistonTop], [0, X.pistonTop]], 'steel', 14),
  )), [0.3, 0, 0]);
  // 12.2 — œil de tige (alésage de pied pour la tige), 12 — cordon de soudure
  R('12.2', ax(group(eye(X.rodEye, X.eyeNeck, 1, 'black'), L(S, [[ROD + 0.02, X.eyeNeck], [1.2, X.eyeNeck], [1.25, X.eyeNeck + 0.6], [ROD + 0.02, X.eyeNeck + 0.6], [ROD + 0.02, X.eyeNeck]], 'black', 24))), [0.4, 0, 0]);
  R('12', ax(S.weldRing(u(ROD + 0.06), u(0.2), 'black', { pos: [0, u(X.eyeNeck - 0.02), 0] })), [0.36, 0, 0.03]);
  // 7 — piston : collet six-pans côté fond, gorges des joints
  R('7', ax(group(
    L(S, [[0.63, X.hexEnd], [BORE - 0.06, X.hexEnd], [BORE - 0.02, X.hexEnd + 0.06], [BORE - 0.02, X.hexEnd + 0.3], [BORE - 0.22, X.hexEnd + 0.3], [BORE - 0.22, X.hexEnd + 0.9],
      [BORE - 0.02, X.hexEnd + 0.9], [BORE - 0.02, X.pistonTop - 0.06], [BORE - 0.08, X.pistonTop], [0.63, X.pistonTop], [0.63, X.hexEnd]], 'steel', 36),
    S.merged([(() => { const m = L(S, [[0.63, X.floor + 0.02], [1.05 / Math.cos(Math.PI / 6), X.floor + 0.02], [1.05 / Math.cos(Math.PI / 6), X.hexEnd], [0.63, X.hexEnd], [0.63, X.floor + 0.02]], 'steel', 6); m.children[0].rotation.y = Math.PI / 6; return m; })()], 'steel'),
  )), [0.24, 0, 0]);
  R('17.6', ax(group(ring(BORE - 0.21, BORE - 0.005, X.hexEnd + 0.36, X.hexEnd + 0.84, 'rubber', 36))), [0.24, 0, 0.06]);
  R('17.7', ax(ring(BORE - 0.06, BORE - 0.004, X.hexEnd + 1.0, X.pistonTop - 0.12, 'cream', 36)), [0.25, 0, 0.07]);
  R('17.8', ax(oring(0.66, 0.05, X.pistonTop - 0.25, 'rubber', 20)), [0.27, 0, 0.05]);

  // ================================================ 13 — rotules, 16 — bouchons de graissage
  const ball = () => {
    const ro = EYE.bore, w = 1.5, rb = 1.3, ri = 1.0, wb = 0.75;
    const a0 = Math.asin(wb / rb), prof = [];
    for (let i = 0; i <= 8; i++) { const a = -a0 + (2 * a0 * i) / 8; prof.push([rb * Math.cos(a), rb * Math.sin(a)]); }
    return group(L(S, [[rb * 0.9, -w / 2], [ro, -w / 2], [ro, w / 2], [rb * 0.9, w / 2], [rb * 0.9, -w / 2]], 'steel', 28), L(S, [[ri, -wb], ...prof, [ri, wb], [ri, -wb]], 'chrome', 28));
  };
  const plug = () => S.merged([
    L(S, [[0, 0], [0.31, 0], [0.31, 0.16], [0, 0.16]], 'zinc', 6),
    L(S, [[0, -0.32], [0.15, -0.32], [0.15, 0], [0, 0]], 'zinc', 8),
  ], 'zinc');
  // œil de fond (x = 0) fixe, œil de tige suit la tige ; axes des rotules selon Y
  P('13', put(THREE, ball(), [0, 0, 0], [0, 1, 0]), [-0.11, 0.08, 0]);
  P('16', put(THREE, plug(), [0, 0, u(EYE.R)], [0, 0, 1]), [-0.11, 0, 0.06]);
  P('13', rodSide(put(THREE, ball(), [u(X.rodEye + ext), 0, 0], [0, 1, 0])), [0.4, 0.08, 0]);
  P('16', rodSide(put(THREE, plug(), [u(X.rodEye + ext), 0, u(EYE.R)], [0, 0, 1])), [0.4, 0, 0.06]);

  return { view: { dir: [0.4, 0.9, 1.1] } };
}

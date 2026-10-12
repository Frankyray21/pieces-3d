// P062 — Plaque porte-tête CX036201 rév. 1 (page 62) : « ASSY, TOP DRIVE
// MOUNTING PLATE », repère 6 de l'avance P028. Plaque d'acier de 1 1/2 po (4)
// sur laquelle la bride arrière de la tête de rotation (P050) se boulonne
// (plusieurs jeux de trous : « INSTALL TOP DRIVE ON LOWEST HOLE SET »),
// fenêtre centrale, échancrure haute. Sur ses deux chants, une chape de
// glissière (5) en cornière de 3/4 po, sept vis H 3/4 × 2 (14, Nord-Lock 20),
// enveloppe l'arête extérieure de la barre de guidage (P060) : glissière en V
// de 26 1/2 po (1, polyéthylène) sur sa contre-plaque cornière (2), poussées
// par trois vis carrées 3/4 × 2 à bout pointu (16) bloquées par contre-écrou
// (22, rondelle 20). Quatre poches oblongues au droit des barres reçoivent un
// patin d'usure (6) et sa contre-plaque (7), serrés contre la face de guidage
// par deux vis de réglage entièrement filetées 1/2 × 1 1/4 (12, contre-écrous
// 21) au travers d'une plaque de retenue : deux hautes (9), deux basses (10),
// chacune vissée par cinq vis H 1/2 × 1 1/2 (13, Nord-Lock 19). Derrière la
// plaque, deux supports de tourillon (8) de 1 1/4 po à lumière oblongue
// portent les bagues du collier du vérin d'avance (P070) ; chacun tient par
// quatre vis H 3/4 × 9 (15, rondelles fendues 17) vissées dans la plaque
// depuis le dos du support. Collier Ø 9/16 po (3) en bas à droite, vis 3/8 ×
// 5/8 (11, Nord-Lock 18).
// Repère : celui de l'avance (FEED, placé à l'identité dans P028), tête en
// haut (course 0) : plaque de y = 2.22 à 3.0, faces en z = 0.232 et 0.27 ; tout
// l'ensemble suit la tête (corps « feed »). Encombrement ≈ 0.55 × 0.79 × 0.26 m.
// Cotes : visserie et glissières (liste) ; plaque, chapes et supports d'après
// les pages 62, 78 et 80 à l'échelle du mât.
import { body } from '../layout.js';
import {
  IN, u, BAR, CYL, PLATE, hhcs, hexNut, nordLock, splitWasher, slab, orient, rrect, obround, sqss, pClamp, M,
} from './_feed.js';

const { z0, z1, y0, y1, hw } = PLATE;
const HY = [2.6 - u(26.5) / 2, 2.6 + u(26.5) / 2]; // longueur des glissières (centrées en y = 2.6)
const P1 = [hw, hw + u(0.75)]; // chape : âme contre le chant
const ZC = [0.135, z1]; // profondeur de la chape
const SL = { a: BAR.xo + 0.002, b: BAR.xo + 0.002 + u(0.5), zf: BAR.z1 + 0.001 };

export default function P062(api) {
  const { THREE, S } = api;
  const { box, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (o) => body('feed', o);

  // ============================================================ 4 — plaque
  const c = 0.012;
  const outline = [[-hw + c, y0], [hw - c, y0], [hw, y0 + c], [hw, y1 - c], [hw - c, y1], [0.075, y1], [0.075, y1 - 0.035], [0.065, y1 - 0.045],
    [-0.065, y1 - 0.045], [-0.075, y1 - 0.035], [-0.075, y1], [-hw + c, y1], [-hw, y1 - c], [-hw, y0 + c]];
  const holes = [
    rrect(0, 2.36, 0.15, 0.18, 0.025),
    ...PLATE.pockets.map(([x, y]) => obround(x, y, 0.09, 0.045, 'y')),
  ];
  for (const x of [-0.12, 0.12]) for (const y of [2.505, 2.57, 2.635, 2.7, 2.765, 2.83]) holes.push([x, y, u(0.41)]);
  for (const x of [-0.06, 0.06]) for (const y of [2.535, 2.865]) holes.push([x, y, u(0.34)]);
  P('4', F(orient(slab(outline, holes, z1 - z0, 'grey'), [1, 0, 0], [0, 1, 0], [0, 0, (z0 + z1) / 2])), [0, 0, 0.35]);

  // ============================================================ 5 — chapes, 1 — glissières, 2 — contre-plaques
  const ext = (pts, mat, s) => {
    // profil (x, z) extrudé sur la longueur des glissières, miroir pour s = −1
    const q = s > 0 ? pts : pts.map(([x, z]) => [-x, z]).reverse();
    return orient(slab(q.map(([x, z]) => [x, -z]), [], HY[1] - HY[0], mat), [1, 0, 0], [0, 0, -1], [0, (HY[0] + HY[1]) / 2, 0]);
  };
  const BOLT14 = Array.from({ length: 7 }, (_, i) => HY[0] + 0.045 + i * ((HY[1] - HY[0] - 0.09) / 6));
  const SET16 = [HY[0] + 0.09, 2.6, HY[1] - 0.09];
  for (const s of [1, -1]) {
    const web = ext([[P1[0], ZC[0]], [P1[1], ZC[0]], [P1[1], ZC[1]], [P1[0], ZC[1]]], 'grey', s);
    const lipP = ext([[0.205, ZC[0]], [P1[0], ZC[0]], [P1[0], ZC[0] + u(0.75)], [0.205, ZC[0] + u(0.75)]], 'grey', s);
    const rib = ext([[P1[1], 0.16], [P1[1] + 0.012, 0.16], [P1[1] + 0.012, 0.2], [P1[1], 0.2]], 'grey', s);
    P('5', F(M([web, lipP, rib], 'grey')), [s * 0.3, 0, 0]);
    // glissière en V : aile contre le flanc de la barre, aile sur sa face avant, pan à 45° au droit du chanfrein
    const ch = u(0.35) + 0.001;
    P('1', F(ext([[SL.a, 0.157], [SL.b, 0.157], [SL.b, 0.199], [0.188, 0.199], [0.188, SL.zf], [BAR.xo - ch + 0.001, SL.zf], [SL.a, SL.zf - ch + 0.001]], 'white', s)), [s * 0.2, 0, 0]);
    P('2', F(ext([[SL.b, 0.157], [SL.b + u(0.25), 0.157], [SL.b + u(0.25), 0.199 + u(0.25)], [0.188, 0.199 + u(0.25)], [0.188, 0.199], [SL.b, 0.199]], 'steel', s)), [s * 0.25, 0, 0]);
    // 14 / 20 — vis de chape (dans le chant de la plaque)
    const nl = 2 * Math.max(0.0008, 0.75 * IN * 0.09) * 1.1;
    BOLT14.forEach((y) => {
      P('20', F(nordLock(0.75 * IN, [s * (P1[1] + nl / 2), y, (z0 + z1) / 2], [s, 0, 0])), [s * 0.4, 0, 0]);
      P('14', F(hhcs(0.75 * IN, u(2), [s * (P1[1] + nl), y, (z0 + z1) / 2], [s, 0, 0])), [s * 0.5, 0, 0]);
    });
    // 16 / 20 / 22 — vis de poussée de la contre-plaque, contre-écrou et rondelle
    const tip = SL.b + u(0.25);
    SET16.forEach((y) => {
      const zs = 0.178;
      P('20', F(nordLock(0.75 * IN, [s * (P1[1] + nl / 2), y, zs], [s, 0, 0])), [s * 0.4, 0, 0]);
      P('22', F(hexNut(0.75 * IN, [s * (P1[1] + nl + u(0.75) * 0.3), y, zs], [s, 0, 0], { jam: true })), [s * 0.45, 0, 0]);
      P('16', F(sqss(0.75, 2, [s * (tip + u(2)), y, zs], [s, 0, 0])), [s * 0.55, 0, 0]);
    });
  }

  // ============================================================ 6 / 7 — patins, 9 / 10 — plaques de retenue
  const zw = [SL.zf, 0.2425, 0.2552];
  const prism = (x, y, za, zb, mat) => orient(slab(obround(0, 0, 0.088, 0.043, 'y'), [], zb - za, mat), [1, 0, 0], [0, 1, 0], [x, y, (za + zb) / 2]);
  const nl5 = 2 * Math.max(0.0008, 0.5 * IN * 0.09) * 1.1;
  for (const [x, y, ref] of PLATE.pockets) {
    P('6', F(prism(x, y, zw[0], zw[1], 'cream')), [0, 0, 0.25]);
    P('7', F(prism(x, y, zw[1], zw[2], 'steel')), [0, 0, 0.3]);
    const top = ref === '9';
    const [rw, rh] = top ? [0.13, 0.13] : [0.085, 0.17];
    const sx = Math.sign(x);
    const B13 = top
      ? [[-0.05, -0.05], [0.05, -0.05], [-0.05, 0.05], [0.05, 0.05], [sx * 0.05, 0]]
      : [[-0.028, -0.07], [0.028, -0.07], [-0.028, 0.07], [0.028, 0.07], [sx * 0.028, 0]];
    const plateR = slab(rrect(0, 0, rw, rh, 0.008), [...B13.map(([a, b]) => [a, b, u(0.28)]), [0, -0.022, u(0.27)], [0, 0.022, u(0.27)]], u(0.375), 'grey');
    P(ref, F(orient(plateR, [1, 0, 0], [0, 1, 0], [x, y, z1 + u(0.1875)])), [0, 0, 0.45]);
    const zr = z1 + u(0.375);
    B13.forEach(([a, b]) => {
      P('19', F(nordLock(0.5 * IN, [x + a, y + b, zr + nl5 / 2], [0, 0, 1])), [0, 0, 0.55]);
      P('13', F(hhcs(0.5 * IN, u(1.5), [x + a, y + b, zr + nl5], [0, 0, 1])), [0, 0, 0.65]);
    });
    for (const b of [-0.022, 0.022]) {
      const nh = 0.5 * IN * 0.6;
      P('21', F(hexNut(0.5 * IN, [x, y + b, zr + nh / 2], [0, 0, 1], { jam: true })), [0, 0, 0.6]);
      P('12', F(hhcs(0.5 * IN, u(1.25), [x, y + b, zw[2] + u(1.25)], [0, 0, 1])), [0, 0, 0.72]);
    }
  }

  // ============================================================ 8 — supports de tourillon, 15 / 17
  const [mx0, mx1] = PLATE.mountX, [mz0, mz1] = PLATE.mountZ;
  const my = [CYL.yT - 0.15, CYL.yT + 0.15];
  const cm = 0.01;
  const mOutline = [[mz0 + cm, my[0]], [mz1, my[0]], [mz1, my[1]], [mz0 + cm, my[1]], [mz0, my[1] - cm], [mz0, my[0] + cm]];
  const BOLT15 = [-0.13, -0.085, 0.085, 0.13];
  for (const s of [-1, 1]) {
    const blk = slab(mOutline, [obround(CYL.z, CYL.yT, 0.11, 0.0665, 'y')], mx1 - mx0, 'grey');
    const dowels = [-0.1, 0.1].map((dy) => S.cyl(u(0.25), 0.012, 'steel', { axis: 'z', seg: 10, pos: [s * (mx0 + mx1) / 2, CYL.yT + dy, mz1 + 0.004] }));
    P('8', F(group(orient(blk, [0, 0, 1], [0, 1, 0], [s * (mx0 + mx1) / 2, 0, 0]), M(dowels, 'steel'))), [s * 0.2, 0, -0.15]);
    BOLT15.forEach((dy) => {
      const p = [s * (mx0 + mx1) / 2, CYL.yT + dy, mz0];
      const t = Math.max(0.0012, 0.75 * IN * 0.25);
      P('17', F(splitWasher(0.75 * IN, [p[0], p[1], mz0 - t / 2], [0, 0, -1])), [s * 0.2, 0, -0.3]);
      P('15', F(hhcs(0.75 * IN, u(9), [p[0], p[1], mz0 - t], [0, 0, -1])), [s * 0.2, 0, -0.42]);
    });
  }

  // ============================================================ 3 / 11 / 18 — collier Ø 9/16 po
  const pc = pClamp(0.5625);
  const pcPos = [0.13, 2.245, z1];
  P('3', F(group(place2(pc, pcPos))), [0.1, 0, 0.3]);
  const ph = [pcPos[0] + pc.userData.hole[0], pcPos[1], z1 + 0.0024];
  const nl3 = 2 * Math.max(0.0008, 0.375 * IN * 0.09) * 1.1;
  P('18', F(nordLock(0.375 * IN, [ph[0], ph[1], ph[2] + nl3 / 2], [0, 0, 1])), [0.1, 0, 0.4]);
  P('11', F(hhcs(0.375 * IN, u(0.625), [ph[0], ph[1], ph[2] + nl3], [0, 0, 1])), [0.1, 0, 0.5]);

  function place2(o, pos) {
    // patte à plat sur la face avant (y local → +Z), boucle d'axe vertical
    o.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, -1, 0)));
    o.position.set(...pos);
    return o;
  }
  void box;
  return { view: { dir: [0.9, 0.5, 1.2] } };
}

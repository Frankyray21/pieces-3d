// P070 — Vérin d'avance 6 pi STD CX036278 rév. 2 (coupe page 70, vue page
// 72) : « FEED CYLINDER ASSY - 6FT STD », repère 9 de l'avance P028. Vérin
// télescopique à tiges creuses (« ported rods »), fixe aux deux bouts du mât :
// en haut la tige 9 traverse la bride 10 vissée sur la plaque de tête (vis 13
// de P058) et reçoit le coude d'alimentation 13 ; en bas la tige 8 est
// forgée avec son bloc d'appui (vis 12 de P058), orifice latéral (réduction
// 16, adaptateur 14). Le tube central 11 (piston intégré, joint 22.10, bague
// 22.11) coulisse sur les deux tiges : petit piston Ø 3 1/8 po (1, joint 22.5,
// bague 22.6, torique 22.1) vissé au bout de la tige haute, deux presse-
// étoupes (2 : racleur 22.2, joint 22.3, bague 22.4, quad-ring 22.12 et
// anti-extrusion 22.14) vissés dans ses bouts. Le fût extérieur 7 coulisse sur
// le tube central : presse-étoupes 3 (racleur 22.7, joint 22.8, bague 22.9,
// quad-ring 22.13, anti-extrusion 22.15), collier à tourillons 6 en deux
// moitiés (six vis 1/2 × 3 noyées, 19, Nord-Lock 20), bagues d'usure 5 sur
// les tourillons, logées dans les supports de la plaque porte-tête (P062).
// Le flexible 17 (JIC-08, 31 1/2 po) relie l'orifice haut du fût (coude 45°
// 12) à l'orifice bas (adaptateur 15) en passant dans trois colliers Ø 13/16
// po (4, vis 18, Nord-Lock SP 21) sur la face avant du collier ; deux autres
// adaptateurs 15 sur les orifices −X. 22 : trousse de joints (ses joints sont
// posés un à un).
// Simulation : fût, collier, presse-étoupes 3 et flexible suivent la tête
// (corps « feed ») ; tube central et presse-étoupes 2 suivent la tête à 70 %
// de sa course (corps mixte ['ext', 'feed', 0.7] : deux étages de 1.26 et
// 0.54 m pour 1.8 m de course) ; tiges, bride, bloc et petit piston sont fixes.
// Repère : celui de l'avance (FEED, placé à l'identité dans P028), tête en
// haut : axe du vérin en x = 0, z = 0.065, de y = 0.038 (bloc) à 3.07 (coude) ;
// tourillons en y = 2.535. Encombrement ≈ 0.26 × 3.04 × 0.24 m.
// Cotes : piston 3 1/8 po (liste), tiges Ø 1 3/4 po, tube Ø 4 1/8 po, fût
// Ø 5 1/2 po, collier 7.4 po relevés sur la coupe à l'échelle du piston ;
// longueurs ajustées au mât de 3.0 m (la coupe est interrompue).
import { body } from '../layout.js';
import {
  IN, u, CYL, CYL_BOLTS, BLOCK_BOLTS, place, seat, hhcs, nordLock, slab, orient, pClamp, hoseEnd, seal, oring, wiper,
  adapter, elbowLite, M,
} from './_feed.js';

const Z = CYL.z;
const { rodR, rodBore, tubeR, tubeBore, barR, barBore, yT } = CYL;
const T0 = CYL.tubeC - CYL.tubeL / 2, T1 = CYL.tubeC + CYL.tubeL / 2; // tube central (presse-étoupes compris)
const B0 = yT - CYL.barL / 2, B1 = yT + CYL.barL / 2; // fût (presse-étoupes compris)
const GC = u(0.3), GL2 = 0.052, GL3 = 0.055; // collerettes, longueurs des presse-étoupes
const CB2 = u(3.75) / 2, CB3 = barBore + 0.0035; // lamages des bouts (tube, fût)
const YP = T0 + GL2 + 0.003; // dessous du petit piston (tête en haut)
const PL = u(1.75); // longueur du petit piston
const PR = u(3.125) / 2;
const IPR = barBore - 0.0005, IP = [CYL.tubeC - 0.03, CYL.tubeC + 0.03]; // piston intégré

export default function P070(api) {
  const { S } = api;
  const { group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const L = (prof, mat, seg = 40) => S.lathe(prof, mat, { seg, pos: [0, 0, Z] });
  const TUBE = ['ext', 'feed', CYL.w];
  const fb = (o) => body('feed', o), tb = (o) => body(TUBE, o);

  // ============================================================ 9 — tige haute, 10 — bride, 13 — coude
  const yTop = CYL.yFlange + u(1.0) + 0.004;
  const rn = u(1.25) / 2;
  P('9', L([[rodBore, YP], [rn, YP], [rn, YP + PL], [rodR - 0.0015, YP + PL + 0.001], [rodR, YP + PL + 0.003], [rodR, 2.955], [u(1.5) / 2, 2.957],
    [u(1.5) / 2, yTop - 0.001], [u(1.5) / 2 - 0.001, yTop], [rodBore + 0.002, yTop], [rodBore + 0.002, yTop - 0.012], [rodBore, yTop - 0.014], [rodBore, YP]], 'chrome', 36), [0, 0.45, 0]);
  P('10', L([[u(1.5) / 2 + 0.0003, 2.955], [u(3) / 2 - 0.0015, 2.955], [u(3) / 2, 2.9565], [u(3) / 2, CYL.yFlange], [u(6) / 2 - 0.002, CYL.yFlange], [u(6) / 2, CYL.yFlange + 0.002],
    [u(6) / 2, yTop - 0.006], [u(6) / 2 - 0.002, yTop - 0.004], [u(1.5) / 2 + 0.0003, yTop - 0.004], [u(1.5) / 2 + 0.0003, 2.955]], 'black', 48), [0, 0.35, 0]);
  P('13', place(elbowLite('orb', 10, 8), [0, yTop, Z], [0, 1, 0], [0, 0, -1]), [0, 0.6, -0.1]);

  // ============================================================ 8 — tige basse et son bloc, 16 / 14 — orifice
  const yb0 = CYL.yBlock, yb1 = yb0 + u(1.26), yb2 = yb1 + u(1.7);
  const flange = orient(slab(roundSq(u(6), 0.012), BLOCK_BOLTS.map(([x, z]) => [x, -z, u(0.34)]), yb1 - yb0, 'black'), [1, 0, 0], [0, 0, -1], [0, (yb0 + yb1) / 2, Z]);
  const rod8 = L([[0, yb1 - 0.002], [u(3.2) / 2, yb1 - 0.002], [u(3.2) / 2, yb2 - 0.003], [u(3.2) / 2 - 0.003, yb2], [rodR, yb2 + 0.004], [rodR, YP - 0.008],
    [rodR - 0.0015, YP - 0.0065], [rodBore, YP - 0.0065], [rodBore, yb1], [0, yb1]], 'chrome', 36);
  P('8', group(flange, rod8), [0, -0.3, 0]);
  const yPort = (yb0 + yb1) / 2;
  const red = place(adapter('orb', 10, 8, { mat: 'steel' }), [0, yPort, Z - u(3)], [0, 0, -1]);
  P('16', red, [0, 0, -0.1]);
  P('14', place(adapter('orb', 8, 8), [0, yPort, Z - u(3) - 0.028], [0, 0, -1]), [0, 0, -0.18]);

  // ============================================================ 1 — petit piston, 22.1 / 22.5 / 22.6
  const g1 = [YP + 0.01, YP + 0.02], g2 = [YP + 0.028, YP + 0.038];
  P('1', L([[rn + 0.0002, YP], [PR - 0.0015, YP], [PR, YP + 0.0015], [PR, g1[0]], [PR - 0.0045, g1[0]], [PR - 0.0045, g1[1]], [PR, g1[1]], [PR, g2[0]],
    [PR - 0.0035, g2[0]], [PR - 0.0035, g2[1]], [PR, g2[1]], [PR, YP + PL - 0.0015], [PR - 0.0015, YP + PL], [rn + 0.0002, YP + PL], [rn + 0.0002, YP]], 'steel', 40), [0.25, 0, 0]);
  P('22.1', oring(rn + 0.0004, 0.0009, YP + 0.022, 'rubber', 24), [0.32, 0, 0]);
  P('22.5', seal(PR - 0.0045, PR, g1[0], g1[1], 'rubber'), [0.38, 0, 0]);
  P('22.6', seal(PR - 0.0035, PR, g2[0], g2[1], 'cream'), [0.44, 0, 0]);

  // ============================================================ 11 — tube central, 22.10 / 22.11
  const t0 = T0 + GC, t1 = T1 - GC, tR = tubeR;
  const w1 = [IP[0] + 0.008, IP[0] + 0.02], w2 = [IP[1] - 0.02, IP[1] - 0.008];
  P('11', tb(L([[CB2, t0], [tR - 0.0015, t0], [tR, t0 + 0.0015], [tR, IP[0] - 0.004], [IPR, IP[0]], [IPR, w1[0]], [IPR - 0.004, w1[0]], [IPR - 0.004, w1[1]], [IPR, w1[1]],
    [IPR, w2[0]], [IPR - 0.004, w2[0]], [IPR - 0.004, w2[1]], [IPR, w2[1]], [IPR, IP[1]], [tR, IP[1] + 0.004], [tR, t1 - 0.0015], [tR - 0.0015, t1], [CB2, t1],
    [CB2, t1 - 0.04], [tubeBore, t1 - 0.042], [tubeBore, t0 + 0.042], [CB2, t0 + 0.04], [CB2, t0]], 'chrome', 48)), [0.45, 0, 0]);
  P('22.11', tb(seal(IPR - 0.004, IPR, w1[0], w1[1], 'cream', 40)), [0.6, 0, 0]);
  P('22.10', tb(seal(IPR - 0.004, IPR, w2[0], w2[1], 'rubber', 40)), [0.66, 0, 0]);

  // ============================================================ 2 — presse-étoupes du tube, joints 22.2 / 22.3 / 22.4 / 22.12 / 22.14
  // Profil construit pour le bout bas (collerette en y0, nez vers +s), inversé en haut.
  const gland = (y0, s, rOut, rCb, len, rBore, mat) => {
    const Y = (d) => y0 + s * d;
    const prof = [[rBore, Y(0)], [rOut - 0.0015, Y(0)], [rOut, Y(0.0015)], [rOut, Y(GC)], [rCb, Y(GC)], [rCb, Y(len - 0.002)], [rCb - 0.002, Y(len)], [rBore, Y(len)], [rBore, Y(0)]];
    return L(s > 0 ? prof : prof.slice().reverse(), mat, 40);
  };
  const glandSeals = (y0, s, rCb, rBore, refs, wrap) => {
    const Y = (d) => y0 + s * d;
    const yy = (a, b) => (s > 0 ? [Y(a), Y(b)] : [Y(b), Y(a)]);
    const [rw, rs, rr, rq, rbk] = refs;
    const out = [
      [rw, wiper(rBore, rBore + 0.0045, ...(s > 0 ? [Y(0.0005), Y(0.007)] : [Y(0.007), Y(0.0005)]))],
      [rs, seal(rBore, rBore + 0.005, ...yy(0.012, 0.02), 'rubber')],
      [rr, seal(rBore, rBore + 0.0028, ...yy(0.026, 0.038), 'cream')],
      [rq, oring(rCb - 0.0018, 0.0018, Y(GC + 0.012))],
      [rbk, seal(rCb - 0.0028, rCb, ...yy(GC + 0.016, GC + 0.0175), 'white')],
    ];
    out.forEach(([r, o], i) => P(r, wrap(o), [0.5 + i * 0.05, s * 0.05, 0]));
  };
  for (const [y0, s] of [[T0, 1], [T1, -1]]) {
    P('2', tb(gland(y0, s, tR, CB2, GL2, rodR + 0.0003, 'steel')), [0.5, s * -0.15, 0]);
    glandSeals(y0, s, CB2, rodR + 0.0003, ['22.2', '22.3', '22.4', '22.12', '22.14'], tb);
  }

  // ============================================================ 7 — fût, 3 — presse-étoupes, 22.7 / 22.8 / 22.9 / 22.13 / 22.15
  const b0 = B0 + GC, b1 = B1 - GC;
  const DG = [-Math.SQRT1_2, 0, Math.SQRT1_2]; // orifice haut en biais (le coude 45° reste derrière la plaque)
  const PORTS = [[2.85, DG], [2.85, [-1, 0, 0]], [2.30, [0, 0, 1]], [2.30, [-1, 0, 0]]];
  const bosses = PORTS.map(([y, d]) => place(S.lathe([[0, 0], [0.0155, 0], [0.0155, 0.007], [0.0135, 0.0085], [0, 0.0085]], 'black', { seg: 20 }), [d[0] * (barR - 0.0025), y, Z + d[2] * (barR - 0.0025)], d));
  const barrel = L([[CB3, b0], [barR - 0.002, b0], [barR, b0 + 0.002], [barR, b1 - 0.002], [barR - 0.002, b1], [CB3, b1], [CB3, b1 - 0.045], [barBore, b1 - 0.047],
    [barBore, b0 + 0.047], [CB3, b0 + 0.045], [CB3, b0]], 'black', 56);
  const bw = M(PORTS.map(([y, d]) => place(S.weldRing(0.0158, 0.004, 'black'), [d[0] * (barR - 0.001), y, Z + d[2] * (barR - 0.001)], d)), 'black');
  P('7', fb(group(M([barrel, ...bosses], 'black'), bw)), [-0.35, 0, 0]);
  for (const [y0, s] of [[B0, 1], [B1, -1]]) {
    P('3', fb(gland(y0, s, barR, CB3, GL3, tR + 0.0003, 'steel')), [-0.35, s * -0.12, 0]);
    glandSeals(y0, s, CB3, tR + 0.0003, ['22.7', '22.8', '22.9', '22.13', '22.15'], fb);
  }

  // ============================================================ 6 — collier à tourillons, 5 — bagues, 19 / 20
  const cw = CYL.clampW, cy0 = yT - u(2), cy1 = yT + u(2), rc = barR + 0.0006;
  const arcPts = (from, to, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const a = from + ((to - from) * i) / n; return [Math.cos(a) * rc, Math.sin(a) * rc]; });
  const BOLT19 = [-0.0815, 0.0815].flatMap((x) => [-0.03, 0, 0.03].map((dy) => [x, yT + dy]));
  const zb0 = -0.011 - Z, zf1 = 0.141 - Z; // demi-colliers (relatif à l'axe)
  const backHalf = [[-cw, zb0], [cw, zb0], [cw, 0], ...arcPts(0, -Math.PI).map(([x, z]) => [x, z]).slice(0), [-cw, 0]];
  const frontHalf = [[-cw, 0], ...arcPts(Math.PI, 0), [cw, 0], [cw, zf1], [-cw, zf1]];
  const halfMesh = (pts) => orient(slab(pts.map(([x, z]) => [x, -z]), [], cy1 - cy0, 'black'), [1, 0, 0], [0, 0, -1], [0, yT, Z]);
  // poches des têtes de vis dans la moitié avant
  const front = halfMesh(frontHalf);
  const pockets = BOLT19.map(([x, y]) => S.cyl(0.0146, 0.0012, 'darkSteel', { axis: 'z', seg: 16, pos: [x, y, 0.141 + 0.0004] }));
  const pins = [-1, 1].map((s) => S.cyl(0.0254, 0.036, 'steel', { axis: 'x', seg: 28, pos: [s * (cw + 0.018), yT, Z] }));
  P('6', fb(group(M([halfMesh(backHalf), front], 'black'), M(pins, 'steel'), M(pockets, 'darkSteel'))), [0, 0, 0.3]);
  for (const s of [-1, 1]) P('5', fb(S.lathe([[0.0256, 0], [0.0318, 0], [0.0318, 0.0317], [0.0256, 0.0317], [0.0256, 0]], 'brass', { seg: 28, axis: s > 0 ? 'x' : '-x', pos: [s * (PLATE_MX0()), yT, Z] })), [s * 0.2, 0, 0.3]);
  const nl20 = 2 * Math.max(0.0008, 0.5 * IN * 0.09) * 1.1;
  const zc = 0.141 - 0.028;
  BOLT19.forEach(([x, y]) => {
    P('20', fb(nordLock(0.5 * IN, [x, y, zc + nl20 / 2], [0, 0, 1])), [0, 0, 0.42]);
    P('19', fb(hhcs(0.5 * IN, u(3), [x, y, zc + nl20], [0, 0, 1])), [0, 0, 0.55]);
  });

  // ============================================================ 12 / 15 — raccords du fût, 4 / 18 / 21 — colliers, 17 — flexible
  const pp = (y, d, k) => [d[0] * (barR + 0.006 - k), y, Z + d[2] * (barR + 0.006 - k)];
  const e12 = place(elbowLite('orb', 10, 8, { angle: 45 }), pp(2.85, DG, 0), DG, [0, -1, 0]);
  P('12', fb(e12), [0, 0.1, 0.2]);
  const a15 = place(adapter('orb', 10, 8), pp(2.30, [0, 0, 1], 0), [0, 0, 1]);
  P('15', fb(a15), [0, -0.1, 0.2]);
  for (const y of [2.85, 2.30]) P('15', fb(place(adapter('orb', 10, 8), pp(y, [-1, 0, 0], 0), [-1, 0, 0])), [-0.15, 0, 0]);
  const x0 = 0.02, zl = 0.141;
  const CL = [yT - 0.04, yT, yT + 0.04];
  const pcs = CL.map((y) => {
    const pc = pClamp(13 / 16);
    pc.quaternion.setFromRotationMatrix(new api.THREE.Matrix4().makeBasis(new api.THREE.Vector3(1, 0, 0), new api.THREE.Vector3(0, 0, 1), new api.THREE.Vector3(0, -1, 0)));
    pc.position.set(x0, y, zl);
    return pc;
  });
  const yc = pcs[0].userData.yc, hx = pcs[0].userData.hole[0];
  const nl3 = 2 * Math.max(0.0008, 0.375 * IN * 0.09) * 1.1;
  pcs.forEach((pc, i) => {
    P('4', fb(pc), [0.15, 0, 0.25]);
    P('21', fb(nordLock(0.375 * IN, [x0 + hx, CL[i], zl + 0.0024 + nl3 / 2], [0, 0, 1], { sp: true })), [0.15, 0, 0.32]);
    P('18', fb(hhcs(0.375 * IN, u(0.75), [x0 + hx, CL[i], zl + 0.0024 + nl3], [0, 0, 1])), [0.15, 0, 0.4]);
  });
  // Flexible : embouts droits sur les deux sièges, passage dans les colliers.
  const R17 = u(0.88) / 2;
  const sa = seat(e12, 0), sb = seat(a15, 0);
  const endA = hoseEnd(R17, u(0.875), 'zinc'), endB = hoseEnd(R17, u(0.875), 'zinc');
  const ea = place(endA, sa.p, sa.d), eb = place(endB, sb.p, sb.d);
  const pa = sa.p.clone().addScaledVector(sa.d, endA.userData.len), pb = sb.p.clone().addScaledVector(sb.d, endB.userData.len);
  const zh = zl + yc;
  // (le bas du flexible passe dans la fenêtre de la plaque porte-tête, y 2.27 à 2.45)
  const pts = [pa.toArray(), pa.clone().addScaledVector(sa.d, 0.015).toArray(), [-0.07, 2.72, zh + 0.03], [x0 * 0.7, CL[2] + 0.025, zh + 0.002], [x0, CL[2], zh], [x0, CL[0], zh],
    [x0 * 0.8, 2.43, zh + 0.03], [0.006, 2.37, pb.z - 0.012], pb.clone().addScaledVector(sb.d, 0.004).add(new api.THREE.Vector3(0, 0.016, 0)).toArray(), pb.toArray()];
  const hoseBody = S.tube(pts, R17, 'hose', { seg: 64, ends: 'none', radial: 10, tension: 0.5 });
  P('17', fb(group(hoseBody, M([ea, eb], 'zinc'))), [0.1, 0, 0.35]);

  void CYL_BOLTS;
  return { view: { dir: [1, 0.35, 1.2] } };
}

// Carré à coins arrondis (semelle du bloc 8), centré.
function roundSq(a, r) {
  const pts = [], h = a / 2 - r;
  for (const [cx, cy, a0] of [[h, h, 0], [-h, h, 0.5], [-h, -h, 1], [h, -h, 1.5]]) {
    for (let i = 0; i <= 4; i++) { const t = (a0 + i / 8) * Math.PI; pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]); }
  }
  return pts;
}
// Face intérieure des supports de tourillon (bagues 5 logées dans leurs lumières).
function PLATE_MX0() { return u(3.7) + 0.0015; }

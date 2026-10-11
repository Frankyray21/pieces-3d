// P482 — Filtre à air et séparateur d'eau d'admission CX035759 « ASSY, AIR
// FILTER/WATER SEPARATOR » (pages 482 et 484, même dessin), repère 21 de
// P430. Ligne 3 po qui amène l'air du réseau de la mine aux trois culasses
// du surpresseur, de l'amont vers l'aval :
//   · entrée : coude femelle 90° 3 po (29) ouvert sur le côté, tube 3 po
//     (8, CX014375) montant, avec deux manchons 1 1/4 po soudés — coude
//     MNPT → JIC -20 (17, retour de la dérivation P462) et bouchon à tête
//     carrée 1 1/4 po (30) —, coude (29) et mamelon court (31) ;
//   · séparateur d'eau (3) : tête en fonte d'alu, bol nervuré ; purge sous
//     le bol : té de passage 1/2 po (23) avec adaptateur -08-06 (21) vers la
//     purge automatique P478, mamelon six-pans (22), robinet à bille (5) et
//     adaptateur -06 (20) ;
//   · tube 3 po (7, CX013206, manchon 3/8 po : adaptateur -06 20), bride
//     150 lb taraudée (6), vanne papillon motorisée (P486, 2 ; actionneur
//     sous la ligne) serrée entre les deux brides 6 par quatre vis H
//     5/8-11 × 5 po (32), huit rondelles (33) et quatre écrous (35) ; second
//     tube (7, coude -06 16 sur son manchon, bouchon affleurant 3/8 24 en
//     dessous) ;
//   · filtre 1 µm (4) : bride carrée 3 po taraudée (13), joint (12), tête,
//     joint (12), bride à collet fileté 3 po (10) tenue par deux demi-brides
//     de retenue (14) ; deux tiges filetées M12 (11) avec rondelles (34) et
//     écrous Nylstop (1) serrent l'ensemble ; purge sous le bol : mamelon
//     (22), robinet (5), adaptateur (20) ;
//   · sortie : coude (29) vers l'avant, tube 3 po (9, CX017595, manchon
//     1/4 po fermé par le bouchon à tête carrée 25), coude 45° (28) vers le
//     surpresseur, mamelon court (31), croix en fonte malléable 3 po (27) et
//     trois réductions six-pans 3 × 1 1/2 (26) : coudes 90° MNPT → JIC -24
//     (18) sur les bras haut et bas, coude 45° (15) au bout — départs des
//     flexibles d'aspiration (P430 rep. 22) ;
//   · distributeur de l'actionneur : trois adaptateurs 1/4 NPT → JIC -06 (19) ;
//     prise de manomètre de la tête du séparateur : adaptateur -06 (20).
// Repère : origine au centre de la tête du filtre 4, sur l'axe de la ligne ;
// X selon la ligne (+X vers l'amont, séparateur), Y vers le haut, +Z = X × Y
// (côté arrière de la machine une fois posé par P430).
// Encombrement ≈ 1.05 (X) × 0.78 (Y) × 0.34 (Z) m. Cotes : tuyauterie,
// brides 150 lb (ASME B16.5) et visserie normalisées ; têtes, bols et
// longueurs de tubes estimés d'après la page 482 et l'ensemble voisin TVK
// P314 (mêmes filtre et séparateur).
import { ACC, I, ENG, add, norm3, hexNipple, runTee, nptPlug, pipeR } from './_rearb.js';
import { ACT } from './P486.js';

const G12 = I(0.125); // joints 12
const E3 = I(1.0), E8 = ENG(8), E6 = ENG(6);
const HW = I(7.5), HH = I(6.0), HD = I(7.0); // têtes (X, Y, Z)
const BOWL = { 3: I(13.5), 4: I(19) }, RB = I(3.25);
const L7 = 0.11, L8 = 0.3, L9 = 0.12; // tubes 7, 8, 9
const T13 = I(1.25), T10 = I(0.75), N10 = I(0.8), T14 = I(0.75);
const HUB = I(1.19); // longueur d'une bride 150 lb à travers le moyeu
const R45 = Math.SQRT1_2;

// Positions le long de la ligne et points de raccordement (repère de P482).
function geom(S) {
  const g = {};
  const A = ACC.pipeElbow(S, 48).userData.a, A45 = ACC.pipeElbow(S, 48, { angle: 45 }).userData.a;
  const Ac = ACC.pipeTee(S, 48, { cross: true }).userData.a;
  const W = 2 * ACT.face;
  g.A = A;
  g.x13 = [HW / 2 + G12, HW / 2 + G12 + T13];
  g.p7b = g.x13[1] - E3;
  g.F6b = g.p7b + L7 + HUB - E3;
  g.xv = g.F6b + W / 2;
  g.F6a = g.F6b + W;
  g.p7a = g.F6a + HUB - E3;
  g.xs = [g.p7a + L7 - E3, g.p7a + L7 - E3 + HW];
  g.xsc = (g.xs[0] + g.xs[1]) / 2;
  g.p31a = g.xs[1] - E3;
  g.c29a = [g.p31a + I(3) - E3 + A, 0, 0];
  g.p8 = [g.c29a[0], -A + E3 - L8, 0];
  g.c29c = [g.c29a[0], -A + 2 * E3 - L8 - A, 0];
  // Aval : bride 10 (disque, col, filet), demi-brides 14, coude 29b vers −Z.
  g.x10 = -HW / 2 - G12; // face du disque 10 côté joint
  g.xb10 = g.x10 - T10; // dos du disque
  g.c29b = [g.xb10 - N10 - I(1.2) + E3 - A, 0, 0];
  g.p9 = [g.c29b[0], 0, -A + E3];
  const zf28 = -A + E3 - L9 + E3;
  g.c28 = [g.c29b[0], 0, zf28 - A45];
  g.dir28 = [-R45, 0, -R45];
  g.p31b = add(add(g.c28, g.dir28, A45), g.dir28, -E3);
  g.cc = add(add(g.p31b, g.dir28, I(3) - E3), g.dir28, Ac);
  g.Ac = Ac;
  // Croix : bras d'arrivée −dir28, bout +dir28, bras haut et bas ; réductions 26 et coudes 18 / 15.
  const hh26 = Math.max(I(0.25), (ACC.pipeOD(48) / 2) * 0.45);
  const arms = [{ n: g.dir28, k: '15' }, { n: [0, 1, 0], k: '18' }, { n: [0, -1, 0], k: '18' }];
  const want = [-1, 0, 0]; // sorties tournées vers les culasses (−X local)
  g.arms = arms.map(({ n, k }) => {
    const face = add(g.cc, n, Ac);
    const port = add(face, n, hh26);
    const e = ACC.elbow(S, { a: 24, b: 24, angle: k === '15' ? 45 : 90 }).userData;
    const dot = n[0] * want[0] + n[1] * want[1] + n[2] * want[2];
    const x = norm3(add(want, n, -dot));
    const tip = add(add(port, x, e.out[0]), n, e.out[1]);
    const dir = norm3(add(x, n, 0).map((v, i) => v * e.dir[0] + n[i] * e.dir[1]));
    return { k, n, face, port, x, tip, dir };
  });
  return g;
}

/** Bouts des trois départs -24 de la croix (repère de P482) : [{ tip, dir }], pour les flexibles P430 rep. 22. */
export function afwPorts(S) {
  return geom(S).arms.map(({ tip, dir }) => ({ tip, dir }));
}
/** Cotes des têtes de filtre (m). */
export const AFW = { HW, HH, HD };

export default function P482(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, extrude, washer, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);
  const g = geom(S);
  const X = [1, 0, 0], NX = [-1, 0, 0], Y = [0, 1, 0], NY = [0, -1, 0], Z = [0, 0, 1], NZ = [0, 0, -1];

  // ---------------------------------------------------------------- têtes et bols (3, 4)
  // Tête : bloc de fonte d'alu, passage Ø 4.8 po selon X, deux oreilles des
  // tiges en diagonale, collerette du bol ; bol nervuré, bossage de purge 1/2 NPT.
  const ears = (x0, x1, mat) => [-1, 1].map((s) => box(x1 - x0, I(1.0), I(1.6), mat, { r: I(0.2), pos: [(x0 + x1) / 2, s * I(2.9), -s * I(2.9)], rot: [Math.PI / 4, 0, 0] }));
  const filter = (xc, ref, kind, e) => {
    const x0 = xc - HW / 2, x1 = xc + HW / 2;
    const head = [
      box(HW - I(0.4), HH, HD, 'castAlu', { r: I(0.6), pos: [xc, 0, 0] }),
      O(cyl(I(2.4), HW, 'castAlu', { seg: 36 }), [xc, 0, 0], X, Y),
      ...ears(x0 + I(0.3), x1 - I(0.3), 'castAlu'),
      at(cyl(I(3.45), I(1.0), 'castAlu', { seg: 40 }), [xc, -HH / 2 - I(0.4), 0]),
      // Bossage de la prise de manomètre sur la face −Z.
      at(cyl(I(0.45), I(0.25), 'castAlu', { axis: 'z', seg: 16 }), [xc + I(1.6), I(1.6), -HD / 2 - I(0.12)]),
    ];
    const L = BOWL[kind];
    const yb = -HH / 2 - I(0.9) - L;
    const bowl = lathe([
      [0, yb], [I(1.0), yb], [RB - I(0.5), yb + I(0.15)], [RB, yb + I(0.7)],
      [RB, -HH / 2 - I(1.4)], [I(3.45), -HH / 2 - I(1.2)], [I(3.45), -HH / 2 - I(0.9)], [0, -HH / 2 - I(0.9)],
    ], 'castAlu', { seg: 40, pos: [xc, 0, 0] });
    const ribs = [];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      ribs.push(box(I(0.25), L - I(1.6), I(0.25), 'castAlu', { pos: [xc + Math.cos(a) * RB, -HH / 2 - I(1.2) - (L - I(1.6)) / 2 - I(0.2), Math.sin(a) * RB], rot: [0, -a, 0] }));
    }
    const boss = at(cyl(I(0.6), I(0.3), 'castAlu', { seg: 16 }), [xc, yb - I(0.15), 0]);
    // Indicateurs : dôme rouge de colmatage (filtre 4), coupelle à flèche de sens (séparateur 3).
    const ind = kind === 4
      ? merged([at(box(I(2.0), I(0.55), I(1.6), 'red', { r: I(0.15) }), [xc, HH / 2 + I(0.27), 0]), lathe([[0, 0], [I(0.55), 0], [I(0.55), I(0.45)], [I(0.3), I(0.65)], [0, I(0.7)]], 'red', { seg: 20, pos: [xc, HH / 2 + I(0.5), 0] })], 'red')
      : merged([lathe([[0, 0], [I(1.6), 0], [I(1.6), I(0.35)], [I(1.4), I(0.5)], [0, I(0.52)]], 'castAlu', { seg: 32, pos: [xc, HH / 2, 0] }),
        box(I(1.6), I(0.06), I(0.18), 'castAlu', { pos: [xc - I(0.15), HH / 2 + I(0.53), 0] }),
        at(cyl(I(0.3), I(0.06), 'castAlu', { r2: 0.0002, seg: 3 }), [xc + I(0.75), HH / 2 + I(0.53), 0], [0, 0, -Math.PI / 2])], 'castAlu');
    P(ref, group(merged([...head, bowl, ...ribs, boss], 'castAlu'), ind), e);
    return { yb: yb - I(0.3), gp: [xc + I(1.6), I(1.6), -HD / 2 - I(0.25)] };
  };
  const f4 = filter(0, '4', 4, [0, -0.08, -0.25]);
  const f3 = filter(g.xsc, '3', 3, [0.1, -0.08, -0.25]);

  // ---------------------------------------------------------------- 12, 13, 10, 14 — brides et joints du filtre
  const sealShape = (x) => {
    const m = extrude([[-2.7, -3.3], [-1.0, -4.8], [1.0, -4.8], [2.7, -3.3], [2.7, 3.3], [1.0, 4.8], [-1.0, 4.8], [-2.7, 3.3]].map(([u, v]) => [I(u), I(v)]), G12, 'rubber', { holes: [[0, 0, I(1.8)], [0, I(4.1), I(0.27)], [0, -I(4.1), I(0.27)]] });
    // Contour dans le plan (z, y) tourné de 45° pour suivre les tiges en diagonale.
    return at(group(at(group(m), [0, 0, 0], [0, 0, Math.PI / 4])), [x, 0, 0], [0, -Math.PI / 2, 0]);
  };
  P('12', sealShape(HW / 2 + G12 / 2), [0.05, 0.04, 0]);
  P('12', sealShape(-HW / 2 - G12 / 2), [-0.05, 0.04, 0]);
  P('13', group(merged([
    O(lathe([[pipeR(48) * 0.98, 0], [I(2.6), 0], [I(2.6), T13], [pipeR(48) * 0.98, T13], [pipeR(48) * 0.98, 0]], 'darkSteel', { seg: 4 }), [g.x13[0], 0, 0], X, Y),
    ...ears(g.x13[0], g.x13[1], 'darkSteel'),
  ], 'darkSteel')), [0.1, 0, 0]);
  {
    const r = pipeR(48);
    const disc = lathe([[r * 0.88, 0], [I(2.7), 0], [I(2.7), T10 - 0.002], [I(2.66), T10], [r * 0.88, T10], [r * 0.88, 0]], 'darkSteel', { seg: 40 });
    const neck = lathe([[r * 0.88, T10], [r * 1.02, T10], [r * 1.02, T10 + N10], [r * 0.88, T10 + N10]], 'darkSteel', { seg: 32 });
    const thr = at(lathe([[r * 0.88, 0], ...S.thread(r * 0.97, 0, I(1.2), { r1: r, pitch: I(1 / 8), maxTurns: 8 }).map(([rr, y]) => [rr, I(1.2) - y]).reverse(), [r * 0.88, I(1.2)], [r * 0.88, 0]], 'darkSteel', { seg: 32 }), [0, T10 + N10, 0]);
    P('10', O(merged([disc, neck, thr], 'darkSteel'), [g.x10, 0, 0], NX, Y), [-0.1, 0, 0]);
    // 14 — demi-brides de retenue sur le col, oreille percée pour la tige.
    for (const s of [-1, 1]) {
      const pts = [];
      const r0 = r * 1.05, r1 = I(2.9);
      for (let k = 0; k <= 12; k++) { const a = -Math.PI / 2 + (k / 12) * Math.PI; pts.push([r1 * Math.cos(a), r1 * Math.sin(a)]); }
      for (let k = 12; k >= 0; k--) { const a = -Math.PI / 2 + (k / 12) * Math.PI; pts.push([r0 * Math.cos(a), r0 * Math.sin(a)]); }
      const half = extrude(pts, T14, 'darkSteel');
      const ear = box(I(2.1), I(1.0), T14, 'darkSteel', { r: I(0.25), pos: [I(3.65), 0, 0] });
      const m = merged([half, ear], 'darkSteel');
      // Plan (z, y) : la demi-bride s'ouvre côté de sa tige (diagonale).
      const phi = s > 0 ? (3 * Math.PI) / 4 : -Math.PI / 4;
      const o = at(group(at(group(m), [0, 0, 0], [0, 0, phi])), [g.xb10 - T14 / 2, 0, 0], [0, -Math.PI / 2, 0]);
      P('14', o, [-0.12, s * 0.06, -s * 0.06]);
    }
  }

  // ---------------------------------------------------------------- 11, 34, 1 — tiges M12, rondelles, écrous Nylstop
  {
    const xa = g.xb10 - T14, xb = g.x13[1];
    const ra = xa - 0.0028 - 0.016, rb = xb + 0.0028 + 0.016;
    for (const s of [-1, 1]) {
      const yz = [0, s * I(2.9), -s * I(2.9)];
      P('11', O(lathe([[0, 0], [0.0058, 0], ...S.thread(0.006, 0.0005, rb - ra - 0.0005, { pitch: 0.00175, maxTurns: 40 }).slice(1), [0.0058, rb - ra], [0, rb - ra]], 'zinc', { seg: 10 }), [ra, yz[1], yz[2]], X, Y), [0, s * 0.1, -s * 0.1]);
      for (const [xx, d, e] of [[xa, NX, -0.16], [xb, X, 0.16]]) {
        P('34', O(washer(0.0125, 0.0068, 0.0028, 'zinc', { pos: [0, 0.0014, 0] }), [xx, yz[1], yz[2]], d, Y), [e, s * 0.1, -s * 0.1]);
        P('1', O(ACC.lockNut(S, 0.5), add([xx, yz[1], yz[2]], d, 0.0028), d, Y), [e + Math.sign(e) * 0.03, s * 0.1, -s * 0.1]);
      }
    }
  }

  // ---------------------------------------------------------------- 7 — tubes 3 po à manchon 3/8 ; 20, 16, 24
  const coupling3 = (x, dir) => O(lathe([[pipeR(6) * 0.98, pipeR(48) * 0.8], [pipeR(6) * 1.4, pipeR(48) * 0.8], [pipeR(6) * 1.4, pipeR(48) + 0.014], [pipeR(6) * 0.98, pipeR(48) + 0.014], [pipeR(6) * 0.98, pipeR(48) * 0.8]], 'darkSteel', { seg: 16 }), [x, 0, 0], dir, X);
  const yc = pipeR(48) + 0.014;
  const xm7b = g.p7b + L7 / 2 + 0.01, xm7a = g.p7a + L7 / 2 - 0.01;
  P('7', group(merged([O(ACC.nipple(S, 48, L7, 'darkSteel'), [g.p7b, 0, 0], X, Y), coupling3(xm7b, Y), coupling3(xm7b, NY)], 'darkSteel')), [0.1, 0.06, 0]);
  P('7', group(merged([O(ACC.nipple(S, 48, L7, 'darkSteel'), [g.p7a, 0, 0], X, Y), coupling3(xm7a, Y)], 'darkSteel')), [0.14, 0.06, 0]);
  P('20', O(ACC.straight(S, { a: 6, b: 6 }), [xm7a, yc, 0], Y, X), [0.14, 0.14, 0]);
  P('16', O(ACC.elbow(S, { a: 6, b: 6 }), [xm7b, yc, 0], Y, NZ), [0.1, 0.14, 0]);
  P('24', O(nptPlug(S, 6), [xm7b, -yc, 0], NY, X), [0.1, -0.1, 0]);

  // ---------------------------------------------------------------- 6, 2, 32, 33, 35 — brides 150 lb et vanne papillon
  const fl = ACC.flange150(S, 48);
  const TF = fl.userData.t, bc = fl.userData.bc;
  P('6', O(ACC.flange150(S, 48), [g.F6b, 0, 0], X, Y), [0.05, 0.1, 0]);
  P('6', O(ACC.flange150(S, 48), [g.F6a, 0, 0], NX, Y), [0.2, 0.1, 0]);
  P('2', at(api.sub('P486'), [g.xv, 0, 0], [Math.PI, 0, 0]), [0.12, -0.18, 0]);
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    const yz = [0, Math.cos(a) * bc / 2, Math.sin(a) * bc / 2];
    const xh = g.F6a + TF, xn = g.F6b - TF, wt = I(0.095);
    P('33', O(ACC.flatWasher(S, 0.625), [xh, yz[1], yz[2]], X, Y), [0.22, yz[1] * 0.6, yz[2] * 0.6]);
    P('32', O(ACC.hhcs(S, 0.625, 5), [xh + wt, yz[1], yz[2]], X, Y), [0.28, yz[1] * 0.6, yz[2] * 0.6]);
    P('33', O(ACC.flatWasher(S, 0.625), [xn, yz[1], yz[2]], NX, Y), [0.0, yz[1] * 0.6, yz[2] * 0.6]);
    P('35', O(ACC.hexNut(S, 0.625), [xn - wt, yz[1], yz[2]], NX, Y), [-0.04, yz[1] * 0.6, yz[2] * 0.6]);
  }
  // 19 — adaptateurs 1/4 NPT → JIC -06 sur les orifices du distributeur (vanne retournée : orifices vers le bas).
  for (const [px, py, pz] of ACT.ports) P('19', O(ACC.straight(S, { a: 4, b: 6 }), [g.xv + px, -py, -pz], NY, X), [0.12, -0.3, 0]);

  // ---------------------------------------------------------------- 31, 29, 8, 17, 30 — entrée
  P('31', O(ACC.nipple(S, 48, I(3), 'darkSteel'), [g.p31a, 0, 0], X, Y), [0.3, 0, 0]);
  P('29', O(ACC.pipeElbow(S, 48, { mat: 'blackCast' }), g.c29a, X, NY), [0.36, 0, 0]);
  {
    const yb1 = g.p8[1] + 0.09, r = pipeR(48);
    const b20 = (dir) => O(lathe([[pipeR(20) * 0.98, r * 0.8], [pipeR(20) * 1.35, r * 0.8], [pipeR(20) * 1.35, r + 0.02], [pipeR(20) * 0.98, r + 0.02], [pipeR(20) * 0.98, r * 0.8]], 'darkSteel', { seg: 18 }), [g.p8[0], yb1, 0], dir, Y);
    P('8', group(merged([O(ACC.nipple(S, 48, L8, 'darkSteel'), g.p8, Y, X), b20(NZ), b20(Z)], 'darkSteel')), [0.36, -0.1, 0]);
    P('17', O(ACC.elbow(S, { a: 20, b: 20 }), [g.p8[0], yb1, -r - 0.02], NZ, NY), [0.36, -0.1, -0.12]);
    P('30', O(nptPlug(S, 20, { kind: 'square', mat: 'blackCast' }), [g.p8[0], yb1, r + 0.02], Z, X), [0.36, -0.1, 0.12]);
  }
  P('29', O(ACC.pipeElbow(S, 48, { mat: 'blackCast' }), g.c29c, NY, X), [0.36, -0.2, 0]);

  // ---------------------------------------------------------------- 29, 9, 25, 28, 31, 27, 26, 18, 15 — sortie
  P('29', O(ACC.pipeElbow(S, 48, { mat: 'blackCast' }), g.c29b, NX, NZ), [-0.2, 0, 0]);
  {
    const zm = g.p9[2] - L9 / 2, r = pipeR(48);
    const boss = O(lathe([[pipeR(4) * 0.98, r * 0.8], [pipeR(4) * 1.45, r * 0.8], [pipeR(4) * 1.45, r + 0.012], [pipeR(4) * 0.98, r + 0.012], [pipeR(4) * 0.98, r * 0.8]], 'darkSteel', { seg: 14 }), [g.p9[0], 0, zm], NY, X);
    P('9', group(merged([O(ACC.nipple(S, 48, L9, 'darkSteel'), g.p9, NZ, X), boss], 'darkSteel')), [-0.2, 0, -0.08]);
    P('25', O(nptPlug(S, 4, { kind: 'square', mat: 'blackCast' }), [g.p9[0], -r - 0.012, zm], NY, X), [-0.2, -0.08, -0.08]);
  }
  P('28', O(ACC.pipeElbow(S, 48, { angle: 45, mat: 'blackCast' }), g.c28, NZ, NX), [-0.24, 0, -0.14]);
  P('31', O(ACC.nipple(S, 48, I(3), 'darkSteel'), g.p31b, g.dir28, Y), [-0.28, 0, -0.18]);
  P('27', O(ACC.pipeTee(S, 48, { cross: true, mat: 'blackCast' }), g.cc, g.dir28, Y), [-0.32, 0.04, -0.22]);
  for (const arm of g.arms) {
    const e = add([-0.32, 0.04, -0.22], arm.n, 0.08);
    P('26', O(ACC.hexBushing(S, 48, 24), arm.face, arm.n, arm.x), e);
    P(arm.k, O(ACC.elbow(S, { a: 24, b: 24, angle: arm.k === '15' ? 45 : 90 }), arm.port, arm.n, arm.x), add(e, arm.n, 0.06));
  }

  // ---------------------------------------------------------------- purges des bols : 23, 21, 22, 5, 20 ; prise du séparateur 20
  const drain = (xc, yb, tee) => {
    let y = yb; // face du bossage de purge
    if (tee) {
      const rt = runTee(S, 8).userData;
      const cy = y + E8 - rt.male;
      P('23', O(runTee(S, 8), [xc, cy, 0], NY, Z), [0, -0.12, 0]);
      P('21', O(ACC.straight(S, { a: 8, b: 6 }), [xc, cy, rt.a], Z, X), [0, -0.12, 0.08]);
      y = cy - rt.a;
    }
    const hn = hexNipple(S, 8, 6).userData;
    const hc = y + E8 - hn.ya;
    P('22', O(hexNipple(S, 8, 6), [xc, hc, 0], NY, X), [0, -0.16, 0]);
    const s = 0.024;
    const top = hc - hn.yb + E6;
    const vc = top - 1.15 * s;
    P('5', at(S.ballValve(s, 'brass', { axis: 'y' }), [xc, vc, 0]), [0, -0.2, 0]);
    P('20', O(ACC.straight(S, { a: 6, b: 6 }), [xc, vc - 1.15 * s, 0], NY, X), [0, -0.24, 0]);
  };
  drain(g.xsc, f3.yb, true);
  drain(0, f4.yb, false);
  P('20', O(ACC.straight(S, { a: 6, b: 6 }), f3.gp, NZ, Y), [0, 0, -0.1]);

  void THREE; void E6;
  return { view: { dir: [0.5, 0.5, -1.1] } };
}

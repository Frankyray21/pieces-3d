// P106 — Collecteur d'air de la boucle de boyaux CX037720 rév. 0 (page 106) :
// « PIPE ASSY, HOSE LOOP », repère 7 de la boucle P104. Ligne d'air 2 po NPT
// horizontale : émerillon tournant 90° 1 1/2 NPT / JIC-24 (1, arrivée d'air
// depuis le MCP), réduction six pans 2 × 1 1/2 po (12), manchon forgé 2 po
// classe 3000 (13), mamelon 2 × 3 po sch. 80 (15), collecteur (5, tube 2 po
// sch. 80 à manchon soudé, quatre piquages et patte d'ancrage), coude femelle
// 90° 2 po (14) dont la sortie, vers le haut, reçoit le boyau DTH (P138).
// Piquages : en haut, mamelon 1/2 NPT / JIC-08 (8), coude JIC-08 / NPT (10)
// et clapet 1/2 po (2) couché le long du tube, second mamelon (8) à son entrée
// (injection d'eau) ; côté −X, clapet taré (3) et adaptateur 3/8 NPT / JIC-06
// (7) ; côté +X, clapet 1/4 po (4) et coude 1/4 NPT femelle / JIC-06 (9), puis
// adaptateur 1/4 NPT / JIC-06 (6) ; côté −X près du coude, bouchon trempé 3/8 NPT (11).
// Repère : origine au centre de la face de sortie du coude 14 (haut), Y vers
// le haut, axe de la ligne 2 po en y = −0.06, vers −Z (l'émerillon au bout
// −Z, sortie vers −Y). Dans P104 : at(api.sub('P106'), [AIR.x, AIR.yOut,
// AIR.z]). Encombrement ≈ 0.16 × 0.17 × 0.50 m.
// Cotes : filetages NPT et raccords (liste) ; longueurs des pièces forgées
// d'après les normes (ASME B16.11 classe 3000) et la page 106.
import { u, size, place, seat, adapter, elbowLite, swivelNut, M } from './_feed.js';

const YE = 0.06; // axe de la ligne sous la sortie
const R2 = u(2.375) / 2; // tube 2 po (Ø ext.)

export default function P106(api) {
  const { S } = api;
  const { lathe, group, thread, nut } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const Lz = (prof, mat, seg = 32) => lathe(prof, mat, { seg, axis: 'z', pos: [0, -YE, 0] });
  const male = (r, z0, z1) => thread(r, z0, z1, { pitch: 0.0022, maxTurns: 8, chamferBottom: false });

  // ============================================================ 14 — coude femelle 90° 2 po
  const RS = u(3.3) / 2; // emboîtures
  P('14', group(M([
    S.cyl(RS, 0.06, 'steel', { axis: 'z', seg: 32, pos: [0, -YE, -0.03] }),
    S.cyl(RS, YE, 'steel', { seg: 32, pos: [0, -YE / 2, 0] }),
    S.ball(RS, 'steel', { pos: [0, -YE, 0] }),
    S.ring(RS + 0.002, RS - 0.004, 0.006, 'steel', { seg: 32, pos: [0, -0.003, 0] }),
    S.ring(RS + 0.002, RS - 0.004, 0.006, 'steel', { axis: 'z', seg: 32, pos: [0, -YE, -0.057] }),
  ], 'steel'), S.cyl(R2 * 0.85, 0.002, 'blackOxide', { seg: 24, pos: [0, -0.0005, 0] })), [0, 0.1, 0.12]);

  // ============================================================ 5 — collecteur (tube, manchon soudé, piquages, patte)
  const z5 = [-0.27, -0.04];
  const bosses = [
    [[0, 1, 0], -0.10, u(0.84) / 2 + 0.006], [[-1, 0, 0], -0.15, u(0.675) / 2 + 0.006],
    [[1, 0, 0], -0.15, u(0.54) / 2 + 0.006], [[1, 0, 0], -0.08, u(0.54) / 2 + 0.006], [[-1, 0, 0], -0.08, u(0.675) / 2 + 0.006],
  ];
  const bossObjs = bosses.map(([d, z, r]) => place(S.lathe([[0, 0], [r, 0], [r, 0.014], [r - 0.002, 0.016], [0, 0.016]], 'steel', { seg: 18 }), [d[0] * (R2 - 0.004), -YE + d[1] * (R2 - 0.004), z], d));
  const lug = S.box(0.006, 0.05, 0.03, 'steel', { pos: [0, -YE - RS - 0.02, -0.248] });
  P('5', group(M([
    Lz([[R2 - 0.006, z5[0] + 0.04], [R2, z5[0] + 0.04], [R2, z5[1] - 0.012], ...male(R2, z5[1] - 0.012, z5[1]).slice(0, -1), [R2 - 0.006, z5[1]], [R2 - 0.006, z5[0] + 0.04]], 'steel'),
    Lz([[R2, z5[0]], [RS, z5[0]], [RS, z5[0] + 0.044], [R2, z5[0] + 0.046], [R2, z5[0]]], 'steel'),
    ...bossObjs, lug,
  ], 'steel'), S.weldRing(R2, 0.005, 'steel', { axis: 'z', pos: [0, -YE, z5[0] + 0.047] })), [0, 0.05, 0]);

  // ============================================================ 15 — mamelon 2 × 3 po, 13 — manchon, 12 — réduction, 1 — émerillon
  const z15 = [-0.325, -0.249];
  P('15', Lz([[R2 - 0.007, z15[0]], ...male(R2, z15[0], z15[0] + 0.024), [R2, z15[1] - 0.024], ...male(R2, z15[1] - 0.024, z15[1]), [R2 - 0.007, z15[1]], [R2 - 0.007, z15[0]]], 'steel'), [0, 0, -0.06]);
  const z13 = [-0.36, -0.302];
  P('13', Lz([[R2, z13[0]], [u(3) / 2 - 0.002, z13[0]], [u(3) / 2, z13[0] + 0.002], [u(3) / 2, z13[1] - 0.002], [u(3) / 2 - 0.002, z13[1]], [R2, z13[1]], [R2, z13[0]]], 'steel'), [0, 0, -0.12]);
  const r15 = u(1.9) / 2;
  P('12', group(M([
    nut(u(2.75), 0.016, 'steel', { axis: 'z', pos: [0, -YE, z13[0] - 0.008] }),
    Lz([[r15, z13[0] + 0.025], [R2 * 0.97, z13[0] + 0.025], ...male(R2 * 0.97, z13[0] + 0.002, z13[0] + 0.024).reverse(), [R2, z13[0]], [r15, z13[0]], [r15, z13[0] + 0.025]], 'steel'),
  ], 'steel')), [0, 0, -0.18]);
  // émerillon : corps tournant le long de −Z, coude, sortie JIC-24 vers −Y
  const zs0 = z13[0] - 0.016;
  const sw = group(M([
    Lz([[0, zs0 - 0.022], [r15 * 0.95, zs0 - 0.022], ...male(r15, zs0 - 0.02, zs0).reverse(), [0, zs0]].map(([r, z]) => [r, z]), 'steel', 24),
    nut(u(2.25), 0.018, 'steel', { axis: 'z', pos: [0, -YE, zs0 - 0.03] }),
    Lz([[0, zs0 - 0.039], [0.034, zs0 - 0.039], [0.036, zs0 - 0.041], [0.036, zs0 - 0.085], [0.034, zs0 - 0.087], [0, zs0 - 0.087]], 'castIron', 28),
    S.ball(0.033, 'castIron', { pos: [0, -YE, zs0 - 0.105] }),
    S.cyl(0.033, 0.05, 'castIron', { axis: 'z', seg: 28, pos: [0, -YE, zs0 - 0.09] }),
    S.cyl(0.03, 0.05, 'castIron', { seg: 28, pos: [0, -YE - 0.025, zs0 - 0.105] }),
    S.torus(0.036, 0.0015, 'darkSteel', { axis: 'z', pos: [0, -YE, zs0 - 0.063] }),
  ], 'castIron'), M([place(S.lathe([[0, 0], [u(1.875) / 2 * 0.95, 0], ...thread(u(1.875) / 2, 0.006, 0.034, { pitch: 0.0028, maxTurns: 5, chamferBottom: false }), [u(1.875) / 2 * 0.7, 0.04], [0, 0.04]], 'steel', { seg: 24 }), [0, -YE - 0.05, zs0 - 0.105], [0, -1, 0])], 'steel'));
  P('1', sw, [0, -0.05, -0.25]);

  // ============================================================ piquage haut : 8, 10, 2, 8
  const top = [0, -YE + R2 + 0.012, -0.10];
  const n8a = place(adapter('npt', 8, 8), top, [0, 1, 0]);
  P('8', n8a, [0, 0.12, 0]);
  const s8 = seat(n8a, 0);
  // coude 10 : écrou tournant sur le mâle du 8, sortie mâle NPT vers −Z (dans le clapet 2)
  const e10 = group(M([
    place(swivelNut(8), s8.p, [0, 1, 0]),
    S.cyl(0.011, 0.024, 'zinc', { seg: 16, pos: [s8.p.x, s8.p.y + 0.02, s8.p.z] }),
    S.ball(0.011, 'zinc', { pos: [s8.p.x, s8.p.y + 0.032, s8.p.z] }),
    S.cyl(0.011, 0.02, 'zinc', { axis: 'z', seg: 16, pos: [s8.p.x, s8.p.y + 0.032, s8.p.z - 0.01] }),
    place(S.lathe([[0, 0], [u(0.84) / 2 * 0.95, 0], ...thread(u(0.84) / 2, 0.002, 0.016, { pitch: 0.0018, maxTurns: 5 }), [0, 0.017]], 'zinc', { seg: 14 }), [s8.p.x, s8.p.y + 0.032, s8.p.z - 0.02], [0, 0, -1]),
  ], 'zinc'));
  P('10', e10, [0, 0.16, 0.04]);
  const yv = s8.p.y + 0.032, zv0 = s8.p.z - 0.036;
  P('2', group(M([
    S.box(0.03, 0.03, 0.07, 'brass', { r: 0.002, pos: [0, yv, zv0 - 0.035] }),
    nut(u(1.125), 0.012, 'brass', { axis: 'z', pos: [0, yv, zv0 + 0.004] }),
  ], 'brass'), S.box(0.006, 0.0006, 0.02, 'blackOxide', { pos: [0, yv + 0.0153, zv0 - 0.035] })), [0, 0.2, 0]);
  P('8', place(adapter('npt', 8, 8), [0, yv, zv0 - 0.07], [0, 0, -1]), [0, 0.2, -0.08]);

  // ============================================================ côté −X : 3 clapet taré, 7 adaptateur
  const sideL = [-(R2 + 0.012), -YE, -0.15];
  P('3', group(M([
    place(S.lathe([[0, -0.012], [u(0.675) / 2 * 0.95, -0.012], ...thread(u(0.675) / 2, -0.012, -0.001, { pitch: 0.0018, maxTurns: 5 }), [u(0.675) / 2, 0], [0, 0]], 'steel', { seg: 16 }), sideL, [-1, 0, 0]),
    place(nut(u(1.25), 0.016, 'steel'), [sideL[0] - 0.008, sideL[1], sideL[2]], [-1, 0, 0]),
    place(S.lathe([[0, 0], [0.016, 0], [0.016, 0.034], [0.012, 0.04], [0, 0.04]], 'steel', { seg: 20 }), [sideL[0] - 0.016, sideL[1], sideL[2]], [-1, 0, 0]),
  ], 'steel')), [-0.12, 0, 0]);
  P('7', place(adapter('npt', 6, 6), [sideL[0] - 0.056 - u(0.675) * 0.6, sideL[1], sideL[2]], [-1, 0, 0]), [-0.2, 0, 0]);

  // ============================================================ côté +X : 4 clapet 1/4 po et 9 coude, 6 adaptateur
  const sideR = [R2 + 0.012, -YE, -0.15];
  P('4', group(M([
    place(S.lathe([[0, -0.01], [u(0.54) / 2 * 0.95, -0.01], ...thread(u(0.54) / 2, -0.01, -0.001, { pitch: 0.0014, maxTurns: 5 }), [u(0.54) / 2, 0], [0, 0]], 'brass', { seg: 14 }), sideR, [1, 0, 0]),
    place(nut(u(0.75), 0.018, 'brass'), [sideR[0] + 0.009, sideR[1], sideR[2]], [1, 0, 0]),
    place(S.lathe([[0, 0], [0.009, 0], [0.009, 0.026], [0, 0.026]], 'brass', { seg: 14 }), [sideR[0] + 0.018, sideR[1], sideR[2]], [1, 0, 0]),
  ], 'brass')), [0.12, 0, 0]);
  P('9', place(elbowLite('npt', 4, 6), [sideR[0] + 0.05, sideR[1], sideR[2]], [-1, 0, 0], [0, 1, 0]), [0.2, 0, 0]);
  P('6', place(adapter('npt', 4, 6), [R2 + 0.012, -YE, -0.08], [1, 0, 0]), [0.15, 0, 0.05]);

  // ============================================================ côté −X : 11 bouchon 3/8 NPT
  const bot = [-(R2 + 0.012), -YE, -0.08]; // côté −X
  P('11', group(M([
    place(S.lathe([[0, -0.013], [u(0.675) / 2 * 0.94, -0.013], ...thread(u(0.675) / 2, -0.013, -0.001, { r1: u(0.675) / 2 * 0.94, pitch: 0.0018, maxTurns: 5 }), [u(0.675) / 2, 0], [0, 0]], 'darkSteel', { seg: 16 }), bot, [-1, 0, 0]),
    place(S.box(u(0.375), 0.008, u(0.375), 'darkSteel', { r: 0.001 }), [bot[0] - 0.004, bot[1], bot[2]], [-1, 0, 0]),
  ], 'darkSteel')), [-0.12, 0, 0]);

  void size;
  return { view: { dir: [1, 0.6, 0.6] } };
}

// Sortie de l'émerillon 1 (repère de P106), pour l'ancrage de l'arrivée d'air dans P104.
export const SWIVEL_OUT = { p: [0, -0.15, -0.481], lug: [0, -0.06 - 0.0419 - 0.04, -0.248] };

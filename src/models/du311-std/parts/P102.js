// P102 — Arrêt d'urgence à câble CX037592 rév. 1 (page 102) : « ASSY,
// E-STOP », repère 19 de l'avance P028. Interrupteur à tirette (2,
// CP005966 : boîtier 40 × 40 × 120 mm, œil de traction en bas, voyant de
// tension, presse-étoupe en haut) vissé dans un support en U (9, CX037593)
// dont le bras à gousset se boulonne sur la patte du collier haut du vérin
// stinger côté -X (P068) par deux vis H 3/8-16 × 1 1/4 (13), rondelles
// Nord-Lock (15) et écrous (16) ; sous l'œil, guide-câble fixe (4,
// CP007712) vissé par une vis M8 × 16 (1) et sa rondelle (14) ; collier
// caoutchouté 3/8 po (3) du câble électrique, vis H 5/16-18 × 1/2 (11) et
// rondelle (14). Câble galvanisé Ø 3,2 mm (8) bouclé sur cosses aux deux
// bouts, deux serre-câbles 1/8 po (5) à chaque boucle ; en bas, ressort de
// rappel (6, CX002893) accroché à un crochet en J (7, CX002894) passé dans
// la patte du support coudé (10, CX037596), rondelles (14) et écrous du
// crochet de part et d'autre ; le support coudé est vissé sur le collier bas
// du vérin stinger par deux vis H 3/8-16 × 3/4 (12) et rondelles (15).
// Repère : celui de l'avance (placé à l'identité par P028). Câble vertical en
// x = -0,44, z = 0,07, à l'extérieur du vérin stinger côté -X
// (FEED.stingers[0]) ; supports posés sur ses colliers des hauteurs 0,6 et
// 1,6 m de ../feed.js (dessus des colliers à y = 0,64 et 1,64, patte du
// collier haut supposée de 1/2 po sous le bras du support 9).
// Encombrement ≈ 0.17 × 1.11 × 0.10 m.
// Cotes : coupe A-A et détails B / C de la page 102 (14 po mini entre la
// boucle haute et le ressort pour une avance de 4 pi : ici 0,4 m pour 6 pi).
import { FEED } from '../feed.js';
import { L, u, IN, along, hhcs, hexNut, nordLock } from '../../du311/parts/_avance_b.js';
import { basis, nlT, slabZ } from './_feedcent.js';

const CAB = 0.15; // distance de l'axe du stinger au câble (m), le long de X local
const Y = { plate: 0.56, hookTop: 0.69, spring: [0.70, 0.79], loopLow: 0.80, ring: 1.29, loopHigh: 1.42, sw: [1.45, 1.57], ch: [1.27, 1.62], collarLow: 0.64, collarHigh: 1.64 };

export default function P102(api) {
  const { THREE, S } = api;
  const { merged, group, at, box, tube } = S;
  const [sx, sz] = FEED.stingers[0];
  // Repère local : origine sur l'axe du stinger (y = 0), X vers le câble, Z = X × Y.
  const D = new THREE.Vector3(-0.8, 0, 0.6).normalize();
  const P = (ref, obj, e) => api.part(ref, basis(THREE, obj, D.toArray(), [0, 1, 0], [sx, 0, sz]), [D.x * e[0] + (e[2] ?? 0), e[1], D.z * e[0]]);
  const t = 0.1875 * IN, w = 1.25 * IN;
  // Plat de largeur w (selon Z local) entre deux points (x, y) du plan local.
  const strap = (a, b, th = t, ww = w) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const m = box(len + th, th, ww, 'grey');
    m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0);
    m.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]);
    return m;
  };

  // ================================================ 10 — support coudé (bas)
  const yp = Y.plate, yc = Y.collarLow;
  const b10 = merged([
    strap([0.055, yc + t / 2], [0.095, yc + t / 2]),
    strap([0.095, yc + t / 2], [0.115, yp + t / 2]),
    strap([0.115, yp + t / 2], [0.175, yp + t / 2]),
    strap([0.175, yp + t / 2], [0.183, yp + 0.025]),
  ], 'grey');
  P('10', b10, [0.04, -0.06]);
  for (const dz of [-0.013, 0.013]) {
    P('15', at(nordLock(S, THREE, 0.375), [0.07, yc + t, dz]), [0, 0.05]);
    P('12', at(hhcs(S, THREE, 0.375, 0.75), [0.07, yc + t + u(nlT(0.375)), dz]), [0, 0.09]);
  }

  // ================================================ 7 — crochet en J, rondelles 14
  const r7 = 0.15 * IN;
  const jPts = [[CAB, yp - 0.04, 0], [CAB, Y.hookTop - 0.012, 0], [CAB + 0.004, Y.hookTop + 0.002, 0], [CAB + 0.014, Y.hookTop, 0], [CAB + 0.016, Y.hookTop - 0.012, 0]];
  const hook = group(
    merged([
      tube(jPts, r7, 'zinc', { seg: 24, radial: 10, tension: 0.4 }),
      at(hexNut(S, THREE, 0.3125), [CAB, yp + t + u(nlT(0.3125)), 0]),
      along(THREE, hexNut(S, THREE, 0.3125), [0, -1, 0], [CAB, yp - u(nlT(0.3125)), 0]),
    ], 'zinc'),
  );
  P('7', hook, [0.03, -0.04]);
  P('14', at(nordLock(S, THREE, 0.3125), [CAB, yp + t, 0]), [0.03, 0.02]);
  P('14', along(THREE, nordLock(S, THREE, 0.3125), [0, -1, 0], [CAB, yp, 0]), [0.03, -0.08]);

  // ================================================ 6 — ressort de rappel
  const [s0, s1] = Y.spring;
  const coils = S.spring(0.28 * IN, 0.06 * IN, s1 - s0 - 0.02, 14, 'zinc', { pos: [CAB, s0 + 0.01, 0] });
  const loops = [s0 + 0.004, s1 - 0.004].map((y) => S.torus(0.24 * IN, 0.03 * IN, 'zinc', { axis: 'z', pos: [CAB, y, 0] }));
  P('6', group(merged([coils, ...loops], 'zinc')), [0.05, 0]);

  // ================================================ 8 — câble Ø 3,2 mm et boucles sur cosses
  const rc = 0.0016;
  const thimble = (y, up) => S.torus(0.3 * IN, 0.05 * IN, 'zinc', { axis: 'z', pos: [CAB, y + (up ? 0.008 : -0.008), 0] });
  const live = tube([[CAB, Y.loopLow + 0.016, 0], [CAB, Y.loopHigh - 0.016, 0]], rc, 'zinc', { seg: 4, radial: 8, sharp: true, ends: 'none' });
  const deadLow = tube([[CAB + 0.006, Y.loopLow + 0.012, 0], [CAB + 0.0035, Y.loopLow + 0.03, 0], [CAB + 0.0035, Y.loopLow + 0.085, 0]], rc, 'zinc', { seg: 12, radial: 8, ends: 'none' });
  const deadHigh = tube([[CAB + 0.006, Y.loopHigh - 0.012, 0], [CAB + 0.0035, Y.loopHigh - 0.03, 0], [CAB + 0.0035, Y.loopHigh - 0.1, 0]], rc, 'zinc', { seg: 12, radial: 8, ends: 'none' });
  P('8', group(merged([live, deadLow, deadHigh, thimble(Y.loopLow, true), thimble(Y.loopHigh, false)], 'zinc')), [0.08, 0]);

  // ================================================ 5 — serre-câbles 1/8 po
  // Étrier en U sur les deux brins, selle forgée, deux écrous.
  const clip = (y) => {
    const ub = tube([[CAB - 0.006, y - 0.005, -0.008], [CAB - 0.006, y - 0.005, 0.004], [CAB, y - 0.005, 0.009], [CAB + 0.009, y - 0.005, 0.004], [CAB + 0.009, y - 0.005, -0.008]].map(([a, b, c]) => [a, b, c]), 0.09 * IN, 'zinc', { seg: 16, radial: 8, tension: 0.4 });
    const saddle = box(0.024, 0.012, 0.007, 'zinc', { r: 0.002, pos: [CAB + 0.0015, y - 0.005, -0.006] });
    const nuts = [-0.006, 0.009].map((dx) => at(hexNut(S, THREE, 0.1875), [CAB + dx, y - 0.005, -0.0095], [-Math.PI / 2, 0, 0]));
    return group(merged([ub, saddle, ...nuts], 'zinc'));
  };
  for (const y of [Y.loopLow + 0.045, Y.loopLow + 0.07, Y.loopHigh - 0.045, Y.loopHigh - 0.07]) P('5', clip(y), [0.06, 0, 0]);

  // ================================================ 9 — support de l'interrupteur
  // U de 3/16 po (âme côté stinger, ailes vers le câble), bras à gousset et
  // patte boulonnée sur le collier haut, patte basse du guide-câble.
  const [c0, c1] = Y.ch, xw = CAB - 0.028, yh = Y.collarHigh;
  const ch = [
    box(t, c1 - c0, 0.05, 'grey', { pos: [xw, (c0 + c1) / 2, 0] }),
    ...[-1, 1].map((k) => box(0.032, c1 - c0, t, 'grey', { pos: [xw + 0.016, (c0 + c1) / 2, k * 0.025] })),
    strap([0.06, yh + t / 2], [xw, yh + t / 2], t, 0.05),
    slabZ(S, [[xw, yh], [0.075, yh], [xw, yh - 0.11]].map(([a, b]) => [a, b]), -t / 2, t / 2, 'grey'),
    box(0.022, t, 0.03, 'grey', { pos: [xw + 0.011, c0 + t / 2, 0] }),
  ];
  P('9', merged(ch, 'grey'), [-0.05, 0.05]);
  // 13 / 15 / 16 : vis par le dessus du bras, écrous sous la patte du collier.
  for (const dz of [-0.013, 0.013]) {
    P('15', at(nordLock(S, THREE, 0.375), [0.075, yh + t, dz]), [-0.05, 0.1]);
    P('13', at(hhcs(S, THREE, 0.375, 1.25), [0.075, yh + t + u(nlT(0.375)), dz]), [-0.05, 0.14]);
    P('15', along(THREE, nordLock(S, THREE, 0.375), [0, -1, 0], [0.075, yh - 0.5 * IN, dz]), [-0.05, -0.04]);
    P('16', along(THREE, hexNut(S, THREE, 0.375), [0, -1, 0], [0.075, yh - 0.5 * IN - u(nlT(0.375)), dz]), [-0.05, -0.08]);
  }

  // ================================================ 2 — interrupteur à tirette
  const [w0, w1] = Y.sw;
  const sw = group(
    merged([
      box(0.04, w1 - w0, 0.04, 'safety', { r: 0.003, pos: [CAB, (w0 + w1) / 2, 0] }),
      box(0.042, 0.035, 0.042, 'safety', { r: 0.004, pos: [CAB, w1 - 0.02, 0] }),
    ], 'safety'),
    // voyant de tension (fenêtre) et vis du couvercle
    box(0.012, 0.03, 0.002, 'glass', { pos: [CAB, (w0 + w1) / 2 - 0.01, 0.0205] }),
    merged([-1, 1].flatMap((k) => [w1 - 0.006, w0 + 0.008].map((y) => L(S, [[0, 0], [0.09, 0], [0.09, 0.03], [0, 0.05]], 'zinc', 10, { axis: 'z', pos: [CAB + k * 0.014, y, 0.02] }))), 'zinc'),
    // tige et œil de traction
    merged([
      L(S, [[0, -0.2], [0.18, -0.2], [0.18, 0], [0, 0]], 'zinc', 16, { pos: [CAB, w0, 0] }),
      S.torus(0.2 * IN, 0.05 * IN, 'zinc', { axis: 'z', pos: [CAB, Y.loopHigh, 0] }),
    ], 'zinc'),
    // presse-étoupe et départ du câble électrique (clipsé par le collier 3)
    L(S, [[0, 0], [0.28, 0], [0.28, 0.35], [0.2, 0.55], [0, 0.55]], 'black', 16, { pos: [CAB, w1, 0] }),
    tube([[CAB, w1 + u(0.55), 0], [CAB, w1 + 0.03, 0], [CAB - 0.01, w1 + 0.06, -0.01], [xw - 0.01, w1 + 0.07, -0.03], [xw - 0.03, w1 + 0.09, -0.05]], 0.0035, 'black', { seg: 24, radial: 8, ends: 'none' }),
  );
  P('2', sw, [0.08, 0.03]);

  // ================================================ 4 / 1 / 14 — guide-câble fixe
  const ring = group(merged([
    S.torus(0.2 * IN, 0.06 * IN, 'zinc', { axis: 'y', pos: [CAB, Y.ring, 0] }),
    box(0.024, 0.006, 0.014, 'zinc', { pos: [CAB - 0.016, Y.ring, 0] }),
    box(0.006, c0 - Y.ring + 0.004, 0.014, 'zinc', { pos: [xw + 0.006, (Y.ring + c0) / 2, 0] }),
  ], 'zinc'));
  P('4', ring, [0.05, -0.05]);
  P('14', along(THREE, nordLock(S, THREE, 0.3125), [-1, 0, 0], [xw - t / 2, c0 - 0.008, 0]), [-0.04, -0.05]);
  P('1', along(THREE, hhcs(S, THREE, 0.3125, 0.63), [-1, 0, 0], [xw - t / 2 - u(nlT(0.3125)), c0 - 0.008, 0]), [-0.07, -0.05]);

  // ================================================ 3 / 11 / 14 — collier du câble électrique
  // Collier caoutchouté 3/8 po sur l'aile -Z du support, vis 5/16 × 1/2.
  const yk = w1 + 0.07, zk = -0.025 - t / 2;
  const pc = group(
    merged([
      S.torus(0.25 * IN, 0.03 * IN, 'zinc', { axis: 'y', pos: [xw - 0.01, yk + 0.02, -0.035] }),
      box(0.016, 0.022, 0.002, 'zinc', { pos: [xw + 0.006, yk + 0.01, zk - 0.001] }),
    ], 'zinc'),
    S.torus(0.25 * IN, 0.05 * IN, 'rubber', { axis: 'y', pos: [xw - 0.01, yk + 0.02, -0.035] }),
  );
  P('3', pc, [0, 0.03, -0.04]);
  P('14', along(THREE, nordLock(S, THREE, 0.3125), [0, 0, -1], [xw + 0.006, yk + 0.01, zk - 0.002]), [0, 0, -0.06]);
  P('11', along(THREE, hhcs(S, THREE, 0.3125, 0.5), [0, 0, -1], [xw + 0.006, yk + 0.01, zk - 0.002 - u(nlT(0.3125))]), [0, 0, -0.09]);


  return { view: { dir: [-1, 0.4, 0.8] } };
}

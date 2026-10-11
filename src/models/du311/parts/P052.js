// P052 — Clapet de charge du basculeur de dérivation (sortie) : CX031935
// rév. 0 « ASSY, DIVERTER SW. OUT LOAD CHECK » (page 52), repère 12 de
// l'avance P032. Clapet double CP47573 (1) monté sur chant, cuvette gravée
// vers l'avant, fixé par deux vis H 5/16-18 × 2 po (7) à rondelle plate SAE
// (8) et rondelle fendue (9) ; orifices CYL en haut : adaptateur droit 1/4
// NPT / JIC-06 (6) et coude 90° (5) qui reçoit un té tournant (3, écrou sur le
// coude, branche vers le bas) suivi d'un coude tournant 90° (2) sur le
// passage ; orifices VALVE en bas : deux coudes 45° (4).
// Repère : origine au centre de la face d'appui du bloc (face arrière, contre
// la tôle), +Z vers l'avant (cuvette gravée, têtes des vis), Y vers le haut
// (orifices CYL), +X vers le bouchon de réglage. Encombrement ≈ 0.20 (X) ×
// 0.15 (Y) × 0.07 (Z) m.
import { IN, LCV, loadCheckValve, straight, elbow, tee, place, seat, hhcs, flatWasher, splitWasher } from './_avance_a.js';

export default function P052(api) {
  const { THREE } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v = loadCheckValve();
  // Bloc couché : son +Y (cuvette) vers +Z, son +Z (CYL) vers +Y.
  const g = place(v, [0, 0, 0], [0, 0, 1], [-1, 0, 0]);
  P('1', g, [0, 0, 0]);
  const T = (o) => {
    const q = o.clone().applyQuaternion(g.quaternion);
    return q;
  };
  const pt = v.userData.ports;
  const world = (k) => ({ p: T(pt[k].p), d: T(pt[k].d) });
  // CYL1 / CYL2 en haut.
  const c1 = world('CYL1'), c2 = world('CYL2');
  const [cA, cB] = c1.p.x < c2.p.x ? [c1, c2] : [c2, c1];
  P('6', place(straight('npt', 4, 6), cA.p, cA.d), [0, 0.06, 0]);
  // Coude 90° vers +X, té tournant (passage vers +X, branche vers le bas),
  // coude tournant au bout du passage, sortie vers le bas.
  const e5 = place(elbow('npt', 4, 6), cB.p, cB.d, [1, 0, 0]);
  P('5', e5, [0.02, 0.06, 0]);
  const s5 = seat(e5, 0);
  const t3 = place(tee('swivel', 6, 6), s5.p, s5.d, [0, -1, 0]);
  P('3', t3, [0.07, 0.06, 0]);
  const s3 = seat(t3, 0);
  P('2', place(elbow('swivel', 6, 6), s3.p, s3.d, [0, -1, 0]), [0.12, 0.06, 0]);
  // VALVE1 / VALVE2 en bas : coudes 45°, sorties vers le bas et l'avant.
  for (const k of ['VALVE1', 'VALVE2']) {
    const w = world(k);
    P('4', place(elbow('npt', 4, 6, { angle: 45 }), w.p, w.d, [0, 0, 1]), [0, -0.06, 0]);
  }
  // Vis selon −Z, têtes sur la face gravée.
  for (const h of v.userData.holes) {
    const c = T(h);
    const z = LCV.y;
    P('8', flatWasher(0.3125 * IN, [c.x, c.y, z + 0.0013], [0, 0, 1]), [0, 0, 0.05]);
    P('9', splitWasher(0.3125 * IN, [c.x, c.y, z + 0.0036], [0, 0, 1]), [0, 0, 0.08]);
    P('7', hhcs(0.3125 * IN, 2 * IN, [c.x, c.y, z + 0.0048], [0, 0, 1]), [0, 0, 0.13]);
  }
  void THREE;
  return { view: { dir: [-0.7, 0.5, 1.2] } };
}

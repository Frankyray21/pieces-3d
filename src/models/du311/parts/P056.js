// P056 — Clapet de charge de la plaque à coins : CX032429 rév. 0 « LOAD CHECK
// VALVE ASSY, SLIPPLATE » (page 56), repère de l'avance P032 (circuit des
// vérins de la plaque à coins P044). Clapet double CP47573 (1) posé à plat,
// cuvette gravée en haut, fixé par deux vis H 5/16-18 × 2 po (4) à rondelle
// plate SAE (5) et rondelle fendue (6) aux coins opposés ; coudes 90° 1/4 NPT /
// JIC-06 (3) sur les orifices VALVE (face −Z), sorties vers le haut ; coudes
// 45° (2) sur les orifices CYL (face +Z), sorties vers le haut et l'avant.
// Repère : origine au centre de la face inférieure du bloc (face d'appui), Y
// vers le haut, X le long du bloc (bouchon de réglage vers −X), orifices
// VALVE vers −Z, CYL vers +Z. Encombrement ≈ 0.064 × 0.075 × 0.12 m.
import { IN, LCV, loadCheckValve, elbow, place, hhcs, flatWasher, splitWasher } from './_avance_a.js';

export default function P056(api) {
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v = loadCheckValve();
  P('1', v, [0, 0, 0]);
  const pt = v.userData.ports;
  for (const k of ['VALVE1', 'VALVE2']) {
    const { p, d } = pt[k];
    // Coude 90° : bout NPT dans l'orifice, sortie (+X local) vers le haut.
    P('3', place(elbow('npt', 4, 6), p, d, [0, 1, 0]), [0, 0.02, -0.06]);
  }
  for (const k of ['CYL1', 'CYL2']) {
    const { p, d } = pt[k];
    P('2', place(elbow('npt', 4, 6, { angle: 45 }), p, d, [0, 1, 0]), [0, 0.02, 0.06]);
  }
  for (const h of v.userData.holes) {
    const y = LCV.y;
    P('5', flatWasher(0.3125 * IN, [h.x, y + 0.0013, h.z]), [0, 0.06, 0]);
    P('6', splitWasher(0.3125 * IN, [h.x, y + 0.0026 + 0.001, h.z]), [0, 0.09, 0]);
    P('4', hhcs(0.3125 * IN, 2 * IN, [h.x, y + 0.0026 + 0.002, h.z]), [0, 0.14, 0]);
  }
  return { view: { dir: [-0.8, 0.8, 1.1] } };
}

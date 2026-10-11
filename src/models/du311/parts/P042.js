// P042 — Clapets de charge, centreur / rallonge d'avance : CX029084 rév. 2
// « LOAD CHECK VALVE ASSY, CENT/FD EXT » (page 42), repère de l'avance P032.
// Deux clapets doubles CP47573 (1) empilés, tenus par deux vis H 5/16-18 ×
// 3 1/2 po (4) à rondelles Nord-Lock (5) passant aux coins opposés des deux
// blocs ; orifices 1/4 NPT : adaptateurs droits NPT / JIC-06 (2) sur les
// orifices VALVE des deux blocs et CYL du bloc inférieur, tés de passage
// NPT / JIC-06 (3) sur les orifices CYL du bloc supérieur (branche vers le
// haut, comme sur le dessin).
// Repère : origine au centre de la face inférieure du bloc du bas (face
// d'appui sur la tôle qui reçoit les vis), Y vers le haut ; X le long des
// blocs (bouchon de réglage vers −X), orifices VALVE vers −Z, CYL vers +Z.
// Encombrement ≈ 0.064 (X) × 0.090 (Y, tête des vis comprise) × 0.13 (Z) m.
import { IN, LCV, loadCheckValve, straight, tee, place, hhcs, nordLock } from './_avance_a.js';

export default function P042(api) {
  const P = (ref, obj, e) => api.part(ref, obj, e);

  for (const [k, y0] of [[0, 0], [1, LCV.y]]) {
    const v = loadCheckValve();
    v.position.y = y0;
    P('1', v, [0, k ? 0.06 : 0, 0]);
    const ports = v.userData.ports;
    const lift = k ? 0.06 : 0;
    // Orifices VALVE (−Z) : adaptateurs droits.
    for (const key of ['VALVE1', 'VALVE2']) {
      const { p, d } = ports[key];
      P('2', place(straight('npt', 4, 6), [p.x, p.y + y0, p.z], d), [0, lift, -0.06]);
    }
    // Orifices CYL (+Z) : tés de passage en haut, adaptateurs en bas.
    for (const key of ['CYL1', 'CYL2']) {
      const { p, d } = ports[key];
      if (k) P('3', place(tee('npt', 4, 6), [p.x, p.y + y0, p.z], d, [0, 1, 0]), [0, lift, 0.07]);
      else P('2', place(straight('npt', 4, 6), [p.x, p.y + y0, p.z], d), [0, 0, 0.06]);
    }
  }
  // 4 / 5 — vis traversant les deux blocs, Nord-Lock sous la tête.
  const yTop = 2 * LCV.y;
  for (const h of loadCheckValve().userData.holes) {
    P('5', nordLock(0.3125 * IN, [h.x, yTop + 0.0012, h.z]), [0, 0.13, 0]);
    P('4', hhcs(0.3125 * IN, 3.5 * IN, [h.x, yTop + 0.0025, h.z]), [0, 0.2, 0]);
  }
  return { view: { dir: [-0.8, 0.7, 1.1] } };
}

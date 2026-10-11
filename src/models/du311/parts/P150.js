// P150 — Clapets d'équilibrage du stinger (vérin +X) : CX035665 rév. 0
// « ASSY, STINGER - COUNTERBALANCE VALVE » (page 150), repère 36 de l'avance
// P032. Deux clapets CX000252 (1) empilés, tenus par deux vis H 1/4-20 × 3 po
// (5) à rondelle Nord-Lock SP (6) au travers des deux corps, vissées dans le
// support taraudé du vérin ; coudes 90° ORB / JIC-06 (3) sur les orifices 2
// et 3, tournés vers le bas, chacun prolongé d'un té tournant (2 : écrou sur
// le coude, passage vers le bas, branche vers l'extérieur) ; adaptateurs
// droits ORB / JIC-06 (4) sur les orifices 1 (dessous).
// Repère : origine au centre de la face d'appui du corps L (face +Z, contre le
// support), Y vers le haut, corps empilés vers −Z (faces gravées vers −Z),
// orifice 2 vers +X. Sur l'avance (repère de P032) : flanc extérieur arrière
// du vérin stinger +X, vers (0.496, 1.62, −0.035) d'après KIT054 (P054).
// Encombrement ≈ 0.19 (X) × 0.24 (Y) × 0.08 (Z) m.
import { IN, CBV, cbvStack, elbow, straight, tee, place, seat, hhcs, nordLock } from './_avance_a.js';

export default function P150(api) {
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const st = cbvStack(0);
  st.forEach(({ obj, ports }, k) => {
    const ez = -0.05 - k * 0.07;
    P('1', obj, [0, 0, ez]);
    for (const n of ['2', '3']) {
      const { p, d } = ports[n];
      const e = place(elbow('orb', 6, 6), p, d, [0, -1, 0]);
      P('3', e, [d.x * 0.06, 0, ez]);
      // Té tournant : écrou sur le coude, passage vers le bas, branche vers l'extérieur.
      const s = seat(e, 0);
      P('2', place(tee('swivel', 6, 6), s.p, s.d, [d.x, 0, 0]), [d.x * 0.06, -0.08, ez]);
    }
    const { p, d } = ports['1'];
    P('4', place(straight('orb', 6, 6), p, d), [0, -0.07, ez]);
  });
  const zr = -2 * CBV.z;
  for (const h of st[0].holes) {
    P('6', nordLock(0.25 * IN, [h.x, h.y, zr - 0.001], [0, 0, -1], { sp: true }), [0, 0, -0.17]);
    P('5', hhcs(0.25 * IN, 3 * IN, [h.x, h.y, zr - 0.002], [0, 0, -1]), [0, 0, -0.24]);
  }
  return { view: { dir: [0.8, 0.5, -1.1] } };
}

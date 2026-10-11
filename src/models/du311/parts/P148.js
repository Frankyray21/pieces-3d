// P148 — Clapets d'équilibrage du stinger (vérin −X) : CX035577 rév. 0
// « ASSY, STINGER - COUNTERBALANCE VALVE » (page 148), repère 35 de l'avance
// P032. Deux clapets CX000252 (1) empilés, tenus par deux vis H 1/4-20 × 3 1/4
// (5) au travers des deux corps et de la platine du support (2), rondelles
// Nord-Lock SP (6) sous la tête et sous l'écrou (7) ; coudes 90° ORB / JIC-06
// (3) sur les orifices 2 et 3, sorties vers le bas ; adaptateurs droits ORB /
// JIC-06 (4) sur les orifices 1 (dessous). Support (2, CX033390) : platine
// verticale 1/4 po à aile supérieure en berceau, collier à bande plate Ø 4 po
// autour du fût du vérin stinger, extrémités filetées 5/16 au travers de la
// platine avec rondelles et écrous.
// Repère : origine sur l'axe du fût du vérin stinger (Ø 4 po), à la hauteur
// du collier ; Y vers le haut (axe du vérin), −Z vers l'arrière (clapets
// derrière le fût, faces gravées vers −Z), orifice 2 vers +X. Sur l'avance
// (repère de P032) : vérin −X d'axe (−0.4, ·, 0.1), collier vers y = 1.72
// (voir KIT054 dans P054) ; P032 place P148 en [−0.4, 1.72, 0.1].
// Encombrement ≈ 0.16 (X) × 0.16 (Y) × 0.19 (Z) m.
import { IN, CBV, cbvStack, elbow, straight, place, hhcs, hexNut, nordLock } from './_avance_a.js';

const R = 2 * IN; // fût Ø 4 po
const GAP = 0.012; // jour fût / platine (place des écrous)
const T = 0.25 * IN; // platine
const ZP = -(R + GAP); // face arrière de la platine (côté fût : ZP, côté clapets : ZP − T)

export default function P148(api) {
  const { THREE, S } = api;
  const { box, extrude, merged, group, at, lathe } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // ------------------------------------------------------------- 2 — support
  const z0 = ZP - T; // face de la platine contre le corps L
  const yb = -0.02; // centre des corps
  const plate = extrude([[-0.06, -0.075], [0.06, -0.075], [0.06, 0.05], [-0.06, 0.05]], T, 'grey', {
    holes: [[-0.019, yb - 0.022, 0.0036], [0.019, yb - 0.022, 0.0036], [-0.048, 0.03, 0.0042], [0.048, 0.03, 0.0042]],
  });
  plate.position.z = ZP - T / 2;
  // Aile supérieure en berceau (vers le fût, encoche Ø 4 po).
  const Rr = R + 0.001, zc = -0.03, xc = Math.sqrt(Rr * Rr - zc * zc);
  const a0 = Math.atan2(zc, xc), a1 = Math.atan2(zc, -xc);
  const arc = [];
  for (let i = 0; i <= 16; i++) { const a = a0 + ((a1 - a0) * i) / 16; arc.push([Math.cos(a) * Rr, Math.sin(a) * Rr]); }
  const fl = [[-0.06, ZP - T], [0.06, ZP - T], [0.06, zc], ...arc, [-0.06, zc]];
  const flange = extrude(fl.map(([x, z]) => [x, -z]), T, 'grey');
  flange.rotation.x = -Math.PI / 2;
  flange.position.y = 0.05 + T / 2;
  // Bande plate (1 1/4 × 1/8 po) autour du fût, branches droites jusqu'à la
  // platine, extrémités filetées 5/16 au travers.
  const xb = 0.048, zt = -Math.sqrt(R * R - xb * xb);
  const band = [S.slotted(R + 0.0032, R, 0.014, 0.046, [{ a: Math.PI, w: 2 * Math.asin(xb / R), y0: 0, y1: 0.06 }], 'zinc', { seg: 40 })];
  for (const s of [-1, 1]) {
    band.push(at(S.box(0.0032, 0.032, Math.abs(ZP - zt), 'zinc'), [s * (xb + 0.0016), 0.03, (ZP + zt) / 2]));
    band.push(at(S.cyl(0.004, T + 0.016, 'zinc', { axis: 'z', seg: 12 }), [s * xb, 0.03, ZP - (T + 0.016) / 2 + 0.002]));
  }
  const nuts = [];
  for (const s of [-1, 1]) {
    nuts.push(at(S.washer(0.009, 0.0042, 0.0016, 'zinc', { axis: 'z' }), [s * 0.048, 0.03, ZP - T - 0.0008]));
    nuts.push(at(S.nut(0.5 * IN, 0.007, 'zinc', { axis: 'z' }), [s * 0.048, 0.03, ZP - T - 0.0016 - 0.0035]));
  }
  P('2', group(merged([plate, flange], 'grey'), merged(band, 'zinc'), merged(nuts, 'zinc')), [0, 0.12, 0.06]);

  // ------------------------------------------------------------- 1 — clapets
  const st = cbvStack(yb);
  st.forEach(({ obj }, k) => {
    obj.position.z += z0;
    P('1', obj, [0, 0, -0.06 - k * 0.07]);
  });
  const shift = (pt) => ({ p: pt.p.clone().add(new THREE.Vector3(0, 0, z0)), d: pt.d });
  st.forEach(({ ports }, k) => {
    for (const n of ['2', '3']) {
      const { p, d } = shift(ports[n]);
      P('3', place(elbow('orb', 6, 6), p, d, [0, -1, 0]), [d.x * 0.07, 0, -0.06 - k * 0.07]);
    }
    const { p, d } = shift(ports['1']);
    P('4', place(straight('orb', 6, 6), p, d), [0, -0.07, -0.06 - k * 0.07]);
  });

  // ------------------------------------------------------------- 5 / 6 / 7 — vis d'assemblage
  const zr = z0 - 2 * CBV.z; // face arrière du corps U
  for (const h of st[0].holes) {
    const x = h.x, y = h.y;
    P('6', nordLock(0.25 * IN, [x, y, zr - 0.001], [0, 0, -1], { sp: true }), [0, 0, -0.17]);
    P('5', hhcs(0.25 * IN, 3.25 * IN, [x, y, zr - 0.002], [0, 0, -1]), [0, 0, -0.24]);
    P('6', nordLock(0.25 * IN, [x, y, ZP + 0.001], [0, 0, 1], { sp: true }), [0, 0, 0.05]);
    P('7', hexNut(0.25 * IN, [x, y, ZP + 0.002 + 0.0028], [0, 0, 1]), [0, 0, 0.08]);
  }
  void box; void lathe;
  return { view: { dir: [0.8, 0.55, -1.1] } };
}

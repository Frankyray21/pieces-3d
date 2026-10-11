// P236 — Valve de séquence de retenue : CX033646 rév. 0 « HOLDBACK SEQUENCE
// VALVE » (page 236), repère 19 de P186. Bloc usiné (1, CP001058) 2 1/2 ×
// 1 3/4 × 3 1/4 po : cartouche de séquence vissée en façade (six-pans 1 1/4
// po, vis de réglage à contre-écrou), bouchon ORB de l'orifice de mesure au
// dos ; fixé par deux vis H 1/4-20 × 2 1/4 po (8) verticales aux coins
// arrière, rondelles plates SAE (9) et écrous (10) sous la tôle support de
// P186 (3/16 po, non comprise). Flanc gauche : adaptateur droit MORB -10 → JIC
// -12 (7) et adaptateur droit -06 (6) coiffé d'un coude tournant -06 (3).
// Flanc droit : coude MORB -10 → JIC -12 (5) tourné vers l'avant, té de
// passage à écrou tournant -12 (4), réduction FJIC -12 → MJIC -06 (2) sur la
// branche, coude tournant -06 (3) au bout. Positions d'après la vue de dessus
// et la vue isométrique éclatée de la page 236.
// Repère : origine au centre de la face inférieure du bloc ; Y vers le haut ;
// X selon la largeur (flanc droit et té vers +X) ; +Z vers la façade de la
// cartouche. Encombrement ≈ 0.30 (X) × 0.10 (Y) × 0.24 (Z) m.
import { IN, orbAdapter, orbElbow, swivelElbow, jicTee, orbPlug, orient, SAE } from './_chassis.js';

export default function P236(api) {
  const { S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const add = (a, b, k = 1) => a.map((x, i) => x + b[i] * k);

  const W = 2.5 * IN, H = 1.75 * IN, D = 3.25 * IN;
  const yc = H / 2;

  // ---------------------------------------------------------------- 1 — valve de séquence
  {
    // Bloc : perçages verticaux Ø 9/32 po des vis aux coins arrière (vrais trous).
    const holes = [[-1.0 * IN, -1.42 * IN], [1.0 * IN, -1.42 * IN]];
    const blk = S.extrude([[-W / 2, -D / 2], [W / 2, -D / 2], [W / 2, D / 2], [-W / 2, D / 2]].map(([x, z]) => [x, -z]), H, 'steel', {
      holes: holes.map(([x, z]) => [x, -z, (0.281 * IN) / 2]),
    });
    blk.rotation.x = -Math.PI / 2;
    blk.position.y = yc;
    // Lamages des orifices (faces latérales) et cartouche de séquence en façade.
    const spots = [
      S.ring(0.0175, 0.0112, 0.0006, 'steel', { axis: 'x', pos: [-W / 2 - 0.0003, yc, 0.15 * IN] }),
      S.ring(0.0175, 0.0112, 0.0006, 'steel', { axis: 'x', pos: [W / 2 + 0.0003, yc, -0.72 * IN] }),
      S.ring(0.012, 0.0072, 0.0006, 'steel', { axis: 'x', pos: [-W / 2 - 0.0003, yc, 1.25 * IN] }),
    ];
    const cx = 0.4 * IN;
    const cart = S.group(
      S.nut(1.25 * IN, 0.014, 'zinc', { pos: [0, 0.007, 0] }),
      S.lathe([[0, 0.014], [0.0135, 0.014], [0.0135, 0.03], [0.011, 0.034], [0.008, 0.034], [0, 0.034]], 'zinc', { seg: 24 }),
      S.nut(0.5625 * IN, 0.006, 'zinc', { pos: [0, 0.037, 0] }),
      S.lathe([[0, 0.034], [0.0055, 0.034], ...S.thread(0.0055, 0.034, 0.052, { pitch: 0.0012, chamferBottom: false }), [0.0055, 0.06], [0.0045, 0.062], [0, 0.062]], 'steel', { seg: 16 }),
    );
    const plug = orient(api, orbPlug(api, 0.028, 'zinc'), [-0.42 * IN, yc, -D / 2], [0, 0, -1]);
    P('1', S.group(blk, S.merged(spots, 'steel'), orient(api, cart, [cx, yc, D / 2], [0, 0, 1]), plug), [0, 0, 0]);
  }

  // ---------------------------------------------------------------- 8, 9, 10 — fixation
  const BRK = 0.1875 * IN; // tôle support (P186)
  for (const x of [-1.0 * IN, 1.0 * IN]) {
    const z = -1.42 * IN;
    P('8', S.bolt(0.25 * IN, 2.25 * IN, 'zinc', { pos: [x, H, z] }), [0, 0.12, 0]);
    const wt = 0.065 * IN;
    P('9', S.washer(0.3125 * IN, 0.14 * IN, wt, 'zinc', { pos: [x, -BRK - wt / 2, z] }), [0, -0.06, 0]);
    P('10', S.nut(0.4375 * IN, 0.226 * IN, 'zinc', { pos: [x, -BRK - wt - 0.113 * IN, z] }), [0, -0.1, 0]);
  }

  // ---------------------------------------------------------------- raccords, flanc gauche
  {
    const a7 = orbAdapter(api, 10, 12);
    P('7', orient(api, a7.obj, [-W / 2, yc, 0.15 * IN], [-1, 0, 0]), [-0.06, 0.04, -0.03]);
    const p6 = [-W / 2, yc, 1.25 * IN];
    const a6 = orbAdapter(api, 6, 6);
    P('6', orient(api, a6.obj, p6, [-1, 0, 0]), [-0.07, 0, 0]);
    const e3 = swivelElbow(api, 6);
    P('3', orient(api, e3.obj, add(p6, [-1, 0, 0], a6.tip), [-1, 0, 0], [0, 0, 1]), [-0.14, 0, 0.02]);
  }

  // ---------------------------------------------------------------- raccords, flanc droit
  {
    const p5 = [W / 2, yc, -0.72 * IN];
    const e5 = orbElbow(api, 10, 12);
    P('5', orient(api, e5.obj, p5, [1, 0, 0], [0, 0, 1]), [0.07, 0, 0]);
    // Bout mâle du coude : repère du coude (Y → +X, Z → +Z).
    const tip5 = [p5[0] + e5.out[1], yc, p5[2] + e5.out[2]];
    // 4 — té de passage -12, écrou tournant sur le coude, passage selon +Z, branche selon +X.
    const tee = jicTee(api, 12);
    const b12 = SAE[12];
    const nh = b12.t * IN * 0.75;
    const tc = add(tip5, [0, 0, 1], tee.reach + 0.004);
    const tObj = S.group(tee.obj, S.nut((b12.hex + 0.0625) * IN, nh, 'zinc', { pos: [0, -tee.reach + nh / 2 - 0.002, 0] }));
    P('4', orient(api, tObj, tc, [0, 0, 1], [1, 0, 0]), [0.1, 0, 0.1]);
    // 2 — réduction FJIC -12 → MJIC -06 sur la branche.
    const b6 = SAE[6];
    const rt6 = (b6.t * IN) / 2;
    const rn = (b12.hex + 0.0625) * IN;
    const red = S.merged([
      S.nut(rn, nh, 'zinc', { pos: [0, nh / 2, 0] }),
      S.lathe([[0, nh], [0.013, nh], [0.011, nh + 0.006], [b6.hex * IN * 0.5, nh + 0.006], [b6.hex * IN * 0.5, nh + 0.008], [0, nh + 0.008]], 'zinc', { seg: 20 }),
      S.nut(b6.hex * IN, 0.009, 'zinc', { pos: [0, nh + 0.0125, 0] }),
      S.lathe([[0, nh + 0.017], [rt6 * 0.85, nh + 0.017], ...S.thread(rt6, nh + 0.019, nh + 0.017 + rt6 * 2.4 - rt6 * 0.6, { pitch: rt6 * 0.22, chamferBottom: false }),
        [rt6 * 0.62, nh + 0.017 + rt6 * 2.4], [0, nh + 0.017 + rt6 * 2.4]], 'zinc', { seg: 16 }),
    ], 'zinc');
    const redTip = nh + 0.017 + rt6 * 2.4;
    const p2 = add(tc, [1, 0, 0], tee.reach - nh * 0.6);
    P('2', orient(api, red, p2, [1, 0, 0]), [0.16, 0, 0.1]);
    const e3 = swivelElbow(api, 6);
    P('3', orient(api, e3.obj, add(p2, [1, 0, 0], redTip), [1, 0, 0], [0, 0, 1]), [0.22, 0, 0.1]);
  }

  return { view: { dir: [0.7, 0.9, 1.0] } };
}

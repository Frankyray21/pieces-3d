// P352 — Électrovanne d'air : CX034752 rév. 0 « ASSY, SOL. VALVE, AIR,
// DU311 » (page 352), repère 14 du porteur P208. Cornière 2 × 2 × 1/4 po de
// 11 po (1, CX012879, peinte) : aile verticale vissée sur le flanc par deux vis
// H 1/4-20 × 5/8 po (4) et rondelles Grower (5), aile horizontale en haut,
// percée pour deux électrovannes ; l'électrovanne d'air 3 voies 1/4 NPT (2,
// P354 = P228 du TVK) y est suspendue par ses deux oreilles (deux vis 4 et
// rondelles 5 par dessous). Coudes 90° MNPT -04 → JIC -06 (3) sur les orifices
// P et A, tournés vers le bas. La seconde paire de trous de l'aile reçoit
// l'électrovanne du graissage des filetages de tiges (CX034901, autre
// ensemble).
// Repère machine (layout.js), posé à l'identité par P208 : cornière contre la
// face extérieure du flanc droit du châssis avant (z = 0.495), de x = 1.30 à
// 1.58, dessus à y = 1.0, au-dessus du tuyau d'air de la glissière ; corps de
// la vanne en (1.40, 0.956, 0.551), sans rotation (orifices P / E vers +X,
// bobine vers l'extérieur +Z, gaine vers le bas) (FB.airValve de _frontb.js ;
// repère 14 de carrier.js). Châssis avant : corps « front » de la simulation.
import { FB, IN, nptFitting, orient, boltAt, front } from './_frontb.js';
import { SOLV } from '../../du311/parts/P228.js';

const T = 0.25 * IN, LEG = 2 * IN, LEN = 0.28, X0 = 1.3;

export default function P352(api) {
  const { S } = api;
  const P = (ref, obj, e) => api.part(ref, front(obj), e);
  const O = FB.airValve;
  const add = (a, b) => a.map((v, i) => v + b[i]);
  const xm = X0 + LEN / 2, zs = FB.side;
  const lugs = SOLV.lugs.map((l) => add(O, l)); // dessus des oreilles = dessous de l'aile
  const lugs2 = lugs.map((p) => [p[0] + 0.1, p[1], p[2]]); // seconde vanne (autre ensemble)
  const wall = [[X0 + 0.02, 0.972], [X0 + LEN - 0.02, 0.972]];

  // 1 — cornière : aile horizontale (percée), aile verticale (percée), congé.
  {
    const hz = [...lugs, ...lugs2].map((p) => [p[0] - xm, p[2] - (zs + LEG / 2), 0.0036]);
    const top = S.plate(LEN, LEG, T, 'lightGrey', { holes: hz });
    top.position.set(xm, 1.0 - T / 2, zs + LEG / 2);
    const vt = S.plate(LEN, LEG, T, 'lightGrey', { holes: wall.map(([x, y]) => [x - xm, -(y - (1.0 - LEG / 2)), 0.0036]) });
    vt.rotation.x = Math.PI / 2;
    vt.position.set(xm, 1.0 - LEG / 2, zs + T / 2);
    const fillet = S.cyl(0.004, LEN, 'lightGrey', { axis: 'x', seg: 10, pos: [xm, 1.0 - T - 0.002, zs + T + 0.002] });
    P('1', S.group(S.merged([top, vt, fillet], 'lightGrey')), [0, 0.12, 0]);
  }
  // 2 — électrovanne (repère de P228 du TVK : centre du corps, oreilles en haut).
  P('2', S.at(api.sub('P354'), O), [0, -0.1, 0.06]);
  // 3 — coudes sur P et A, sorties vers le bas.
  for (const k of ['P', 'A']) {
    const { pos, dir } = SOLV[k];
    P('3', orient(api, nptFitting(api, { npt: 4, jic: 6, angle: 90 }).obj, add(O, pos), dir, [0, -1, 0]), [dir[0] * 0.05, -0.1, 0.06]);
  }
  // 4, 5 — vis des oreilles (par dessous, tête sous l'oreille de 12 mm) et vis de l'aile verticale.
  for (const p of lugs) {
    const b = boltAt(api, 0.25, 0.625, [p[0], p[1] - 0.012, p[2]], [0, -1, 0]);
    P('5', b.washer, [0, -0.05, 0]);
    P('4', b.bolt, [0, -0.08, 0]);
  }
  for (const [x, y] of wall) {
    const b = boltAt(api, 0.25, 0.625, [x, y, zs + T], [0, 0, 1]);
    P('5', b.washer, [0, 0, 0.05]);
    P('4', b.bolt, [0, 0, 0.08]);
  }
  return { view: { dir: [0.6, 0.4, 1.1] } };
}

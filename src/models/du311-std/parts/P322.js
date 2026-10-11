// P322 — Trousse de la jambe du stabilisateur CP007872 rév. 0 (page 322) :
// « OUTRIGGER LEG SERVICE KIT » (pièces non vendues séparément), joints de la
// jambe télescopique dessinés en coupe (stabilisateur rompu) :
// - chapeau du fût : torique (1) entre deux bagues anti-extrusion (2) sur son
//   pourtour, torique (3) et bague (4) dans son alésage, sur la tige ; anneau
//   d'arrêt de tige 2 po (5) sous le chapeau ; torique (6) en tête du tube
//   central d'alimentation ;
// - presse-étoupe en tête de la jambe mobile : anneau d'arrêt (7), joint
//   racleur (8), joint de tige (9), torique (10) et bague (11) sur son
//   pourtour ; deux bagues de guidage (12) sur la jambe, dans le fût ;
// - piston fixe au bas de la tige : joint de piston (13), torique (14) entre
//   deux bagues (15) dans son alésage, bague de guidage (16), bille de nylon
//   (17) et vis sans tête (18) qui bloquent le piston sur la tige.
// Repère du stabilisateur (ST de _carrier.js) : origine sur l'axe, face
// supérieure du fût, Y vers le haut ; options { ext } (sortie de la jambe, m :
// les joints du presse-étoupe et les bagues de la jambe suivent la jambe) et
// { body } (corps de simulation de la jambe).
// Encombrement 0.115 (X) × 0.58 (Y) × 0.115 (Z) m.
// Cotes : coupe de la page 322 à l'échelle de la tige Ø 2 po (fût Ø 5,
// jambe Ø 4 1/2 × 4, presse-étoupe et piston de 3 1/4 et 1 3/4 po de long).
import { u, L, put } from './_carrier.js';

export default function P322(api, opts = {}) {
  const { THREE, S } = api;
  const { group } = S;
  const e = (opts.ext ?? 0) / 0.0254;
  const P = (ref, obj, ex) => api.part(ref, obj, ex);
  const M = (ref, obj, ex) => { const g = group(obj); if (opts.body) g.userData.body = opts.body; return P(ref, g, ex); };
  const ring = (ri, ro, y0, y1, mat = 'cream', seg = 32) => L(S, [[ri, y0], [ro, y0], [ro, y1], [ri, y1], [ri, y0]], mat, seg);
  const oring = (R, r, y, seg = 32) => L(S, Array.from({ length: 7 }, (_, i) => { const a = -Math.PI / 2 + (i / 6) * Math.PI * 2; return [R + r * Math.cos(a), y + r * Math.sin(a)]; }), 'rubber', seg);
  const out = (dy, r = 0.12) => [r, dy, 0];

  // chapeau du fût (fixe)
  P('1', oring(2.18, 0.07, -0.7), out(0.05, 0.14));
  for (const y of [-0.82, -0.53]) P('2', ring(2.1, 2.25, y, y + 0.05), out(0.05 + (y + 0.7) * 0.2, 0.16));
  P('3', oring(1.07, 0.07, -0.42), out(0.07, 0.1));
  P('4', ring(1.0, 1.13, -0.6, -0.55), out(0.06, 0.11));
  // 5 — anneau d'arrêt de tige 2 po (ouvert, oreilles percées), sous le chapeau
  const rr = u(1.12), rw = u(0.12), rt = u(0.05);
  P('5', group(
    S.slotted(rr, rr - rw, -u(1.0) - rt, -u(1.0), [{ a: 0, w: 0.35, y0: -u(1.2), y1: -u(0.8) }], 'blackOxide', { seg: 28 }),
    S.merged([-1, 1].map((s) => { const a = s * 0.3; const c = S.cyl(u(0.1), rt, 'blackOxide', { seg: 10 }); c.position.set(Math.sin(a) * (rr - u(0.1)), -u(1.0) - rt / 2, Math.cos(a) * (rr - u(0.1))); return c; }), 'blackOxide'),
  ), out(-0.02, 0.1));
  P('6', oring(0.42, 0.05, 1.85, 20), out(0.12, 0.06));

  // presse-étoupe et bagues de la jambe (mobiles, décalés de la sortie e)
  M('7', ring(1.3, 1.9, -1.5 - e, -1.44 - e, 'blackOxide', 28), out(-0.04, 0.12));
  M('8', L(S, [[1.0, -1.75 - e], [1.35, -1.75 - e], [1.35, -1.5 - e], [1.2, -1.42 - e], [1.0, -1.45 - e], [1.0, -1.75 - e]], 'rubber', 28), out(-0.06, 0.14));
  M('9', L(S, [[1.0, -2.6 - e], [1.3, -2.6 - e], [1.3, -2.2 - e], [1.0, -2.2 - e], [1.04, -2.4 - e], [1.0, -2.6 - e]], 'blue', 28), out(-0.08, 0.15));
  M('10', oring(2.0, 0.07, -4.0 - e), out(-0.1, 0.16));
  M('11', ring(1.9, 2.0, -4.17 - e, -4.12 - e), out(-0.11, 0.17));
  for (const y of [-2.5, -4.3]) M('12', ring(2.2, 2.262, y - 0.3 - e, y + 0.3 - e), out(-0.06 + (y + 2.5) * 0.04, 0.2));

  // piston fixe
  P('13', ring(1.82, 1.998, -20.45, -20.0, 'rubber', 36), out(-0.2, 0.18));
  P('14', oring(1.07, 0.07, -19.95), out(-0.18, 0.1));
  for (const y of [-20.12, -19.83]) P('15', ring(1.0, 1.13, y, y + 0.05), out(-0.18 + (y + 19.95) * 0.2, 0.11));
  P('16', ring(1.9, 1.998, -20.95, -20.6, 'cream', 36), out(-0.22, 0.19));
  // 17 — bille de nylon Ø 3/16, 18 — vis sans tête 1/4-20 × 1/4 dans un trou radial (+X)
  P('17', put(THREE, S.ball(u(0.094), 'white'), [u(1.12), u(-20.75), 0], [1, 0, 0]), [0.12, 0, 0]);
  P('18', put(THREE, group(
    L(S, [[0, 0], [0.125, 0], [0.125, 0.25], [0, 0.25]], 'blackOxide', 12),
    L(S, [[0, 0.17], [0.07, 0.17], [0.07, 0.251], [0, 0.251]], 'darkSteel', 6),
  ), [u(1.72), u(-20.75), 0], [1, 0, 0]), [0.15, 0, 0]);
  return { view: { dir: [1, 0.4, 1.1] } };
}

// P320 — Trousse du bloc de valves d'équilibrage du stabilisateur CP005264
// rév. 1 (page 320) : « OUTRIGGER COUNTERBALANCE VALVE ASSY SERVICE KIT ».
// Bloc d'équilibrage double (1) posé sur le chapeau du fût, emmanché sur le
// bout de la tige creuse fixe ; dessiné en coupe sur le haut du stabilisateur :
// - bloc d'acier 3 × 3 × 3,2 po, arêtes cassées : orifices R et E (ORB -6,
//   lamés) sur la face opposée à la platine, logements des deux cartouches
//   d'équilibrage (P318) sur les faces latérales, deux orifices -6 sur le
//   dessus et deux orifices -4 de prise de pression (bouchons P318) ;
// - joints : anneau d'arrêt de tige 2 po (2) dans le lamage du dessous, joint
//   torique 226 (7) en joint de face sur le chapeau, torique 224 (6) et bague
//   anti-extrusion 224 (4) sur la tige Ø 2 po, torique 220 (5) entre deux
//   bagues anti-extrusion 220 (3) sur le bout réduit Ø 1 3/4 de la tige.
// Repère du stabilisateur (ST de _carrier.js) : origine sur l'axe, face
// supérieure du fût = dessous du bloc, Y vers le haut ; option { pz } : côté
// de la platine (−1 : -Z, P316 ; +1 : +Z, P324), orifices R et E du côté -pz.
// Encombrement 0.076 (X) × 0.081 (Y) × 0.081 (Z) m.
// Cotes : joints AS568 (220 : Ø int. 1,484 × 0,139 ; 224 : 1,984 × 0,139 ;
// 226 : 2,234 × 0,139 po), bloc d'après la coupe (échelle du fût Ø 5 po).
import { u, L, along } from './_carrier.js';

export default function P320(api, opts = {}) {
  const { THREE, S } = api;
  const { merged, group, box } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const pz = opts.pz ?? -1;
  const H = 3.2, A = 1.5;

  // 1 — bloc : corps, lamages des orifices R / E, logements des cartouches et des bouchons
  const spot = (pos, dir, r) => along(THREE, group(
    L(S, [[r * 0.62, 0], [r, 0], [r, 0.03], [r * 0.62, 0.03]], 'steel', 20),
    L(S, [[0, -0.02], [r * 0.62, -0.02], [r * 0.62, 0.0], [0, 0.0]], 'darkSteel', 14),
  ), pos.map(u), dir);
  P('1', group(
    box(u(2 * A), u(H), u(2 * A), 'steel', { r: u(0.08), pos: [0, u(H / 2), 0] }),
    // R et E (orifices -6), lettres frappées suggérées par un trait
    ...[-0.7, 0.7].map((x) => spot([x, 1.55, -pz * A], [0, 0, -pz], 0.5)),
    merged([-0.7, 0.7].map((x) => box(u(0.16), u(0.03), u(0.01), 'darkSteel', { pos: [u(x), u(0.85), -pz * u(A + 0.004)] })), 'darkSteel'),
    // logements des cartouches (faces ±X) et des bouchons (dessus, faces ±X)
    ...[-1, 1].map((s) => spot([s * A, 2.2, 0], [s, 0, 0], 0.72)),
    ...[-0.7, 0.7].map((x) => spot([x, H, pz * 0.5], [0, 1, 0], 0.42)),
    ...[-1, 1].map((s) => spot([s * A, 0.85, 0], [s, 0, 0], 0.36)),
  ), [0, 0.08, 0]);

  const ring = (ri, ro, y0, y1, mat) => L(S, [[ri, y0], [ro, y0], [ro, y1], [ri, y1], [ri, y0]], mat, 28);
  const oring = (R, r, y) => L(S, Array.from({ length: 7 }, (_, i) => { const a = -Math.PI / 2 + (i / 6) * Math.PI * 2; return [R + r * Math.cos(a), y + r * Math.sin(a)]; }), 'rubber', 28);
  // 2 — anneau d'arrêt de tige 2 po (ouvert, oreilles percées)
  const rr = u(1.12), rw = u(0.12), rt = u(0.06);
  P('2', group(
    S.slotted(rr, rr - rw, u(0.1), u(0.1) + rt, [{ a: Math.PI / 2, w: 0.35, y0: 0, y1: u(0.3) }], 'blackOxide', { seg: 28 }),
    merged([-1, 1].map((s) => { const a = Math.PI / 2 + s * 0.3; const c = S.cyl(u(0.1), rt, 'blackOxide', { seg: 10 }); c.position.set(Math.sin(a) * (rr - u(0.1)), u(0.1) + rt / 2, Math.cos(a) * (rr - u(0.1))); return c; }), 'blackOxide'),
  ), [0, -0.03, 0.06]);
  // 7 — torique 226 en joint de face ; 6 / 4 — torique et bague 224 ; 5 / 3 — torique et bagues 220
  P('7', oring(1.187, 0.07, 0.04), [0, -0.05, 0.1]);
  P('6', oring(1.062, 0.07, 0.45), [0, 0.03, 0.12]);
  P('4', ring(1.0, 1.13, 0.55, 0.6, 'cream'), [0, 0.03, 0.14]);
  P('5', oring(0.811, 0.07, 1.6), [0, 0.11, 0.12]);
  for (const y of [1.47, 1.68]) P('3', ring(0.875, 0.95, y, y + 0.05, 'cream'), [0, 0.11 + (y - 1.5) * 0.1, 0.14]);
  return { view: { dir: [-1, 0.8, -pz * 1.1] } };
}

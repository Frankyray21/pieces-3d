// P318 — Trousse des valves d'équilibrage du stabilisateur CP007870 rév. 0
// (page 318) : « OUTRIGGER COUNTERBALANCE VALVE SERVICE KIT » (pièces non
// vendues séparément) :
// - deux cartouches d'équilibrage à visser (1), rapport de pilotage 10:1 :
//   corps fileté 1 1/16-12 avec gorges de toriques dans le bloc, six-pans
//   1 1/4 po, chapeau du ressort, vis de réglage à six-pans creux et
//   contre-écrou ;
// - deux bouchons ORB -6 à six-pans creux (2) sur le dessus du bloc ;
// - deux bouchons ORB -4 à six-pans creux (3), prises de pression latérales.
// Posées dans le bloc P320 : repère du stabilisateur (ST de _carrier.js),
// origine au dessous du bloc sur l'axe, Y vers le haut ; cartouches dans les
// faces ±X à 2,2 po de haut ; option { pz } : côté de la platine (comme P320).
// Encombrement 0.155 (X) × 0.085 (Y) × 0.045 (Z) m.
// Cotes : filetages ORB (-6 : 9/16-18, -4 : 7/16-20), cartouche de taille 2
// (1 1/16-12) d'après la vue de la page 318.
import { u, L, put, orbPlug } from './_carrier.js';

export default function P318(api, opts = {}) {
  const { THREE, S } = api;
  const { merged, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const pz = opts.pz ?? -1;
  const A = 1.5, H = 3.2;

  // Cartouche le long de +Y : corps fileté (dans le bloc, sous y = 0), six-pans,
  // chapeau, contre-écrou et vis de réglage.
  const hex = (a, h, y0, mat) => { const R = a / 2 / Math.cos(Math.PI / 6); const m = L(S, [[0, y0], [R, y0], [R, y0 + h - 0.04], [R - 0.06, y0 + h], [0, y0 + h]], mat, 6); m.children[0].rotation.y = Math.PI / 6; return m; };
  const cartridge = () => group(
    merged([
      L(S, [[0, -2.3], [0.3, -2.3], [0.3, -1.95], [0.36, -1.95], [0.36, -1.6], [0.31, -1.55], [0.42, -1.5], [0.42, -1.15], [0.37, -1.1], [0.48, -1.05], [0.48, -0.55], [0.53, -0.5], [0.53, -0.1], [0.5, 0], [0, 0]], 'steel', 16),
      hex(1.25, 0.45, 0, 'steel'),
      L(S, [[0, 0.45], [0.4, 0.45], [0.4, 1.05], [0.36, 1.1], [0, 1.1]], 'steel', 16),
      hex(0.5625, 0.22, 1.1, 'zinc'),
      L(S, [[0, 1.32], [0.15, 1.32], [0.15, 1.55], [0.12, 1.58], [0, 1.58]], 'steel', 10),
    ], 'steel'),
    // toriques du corps et six-pans creux de la vis de réglage
    merged([-1.75, -1.33, -0.8].map((y) => L(S, [[0.3, y - 0.04], [0.4 + (y + 1.75) * 0.13, y - 0.04], [0.4 + (y + 1.75) * 0.13, y + 0.04], [0.3, y + 0.04], [0.3, y - 0.04]], 'rubber', 14)), 'rubber'),
    L(S, [[0, 1.5], [0.08, 1.5], [0.08, 1.585], [0, 1.585]], 'darkSteel', 6),
  );
  for (const s of [-1, 1]) P('1', put(THREE, cartridge(), [s * u(A), u(2.2), 0], [s, 0, 0]), [s * 0.08, 0, 0]);
  // 2 — bouchons -6 sur le dessus ; 3 — bouchons -4 des prises de pression (faces ±X)
  for (const x of [-0.7, 0.7]) P('2', put(THREE, orbPlug(S, THREE, 6), [u(x), u(H), pz * u(0.5)], [0, 1, 0]), [0, 0.06, 0]);
  for (const s of [-1, 1]) P('3', put(THREE, orbPlug(S, THREE, 4), [s * u(A), u(0.85), 0], [s, 0, 0]), [s * 0.06, 0, 0]);
  return { view: { dir: [-1, 0.8, -pz * 1.1] } };
}

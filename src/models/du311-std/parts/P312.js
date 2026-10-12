// P312 — Tuyauterie d'air avant du porteur CX035546 rév. 0 (page 312) :
// « PIPE ASSY, DU311 CARRIER, FRONT ». Conduite d'air comprimé 2 po (tube
// Ø 2 3/8 po cintré, collets et bloc de bride code 61 soudés) le long du flanc
// gauche du châssis avant, du flexible d'articulation au caisson de la
// glissière :
// - tube 1 : bride tournée vers le haut (flexible d'articulation), descente
//   et coude vers l'avant, bloc de bride de jonction ;
// - tube 2 : collet de jonction, longue ligne droite, double coude remontant
//   vers la bride avant tournée vers la glissière ;
// - trois trousses de bride fendue 2 po code 61 (3).
// Repère machine (../layout.js), posé à l'identité par P292 sur le châssis
// avant (corps « front ») : tube à 0,84 m du sol, z = -0,36 m ; brides F3
// (0,72 ; 0,99 ; -0,36) vers +Y et F4 (2,15 ; 0,90 ; -0,36) vers +X ; colliers
// (P292) aux points CLAMPS312.
// Encombrement 1.47 (X) × 0.19 (Y) × 0.10 (Z) m.
// Cotes : tube 2 po ; tracé d'après la vue de dessus de la page 296 (repère
// 67) et la vue isométrique de la page 312.
import { u, bentPipe, flangeHead, flangePad, splitFlangeKit, frameAt } from './_carrier.js';

const Y0 = 0.84, Z0 = -0.36;
export const PIPE312 = {
  F3: { pos: [0.72, 0.99, Z0], n: [0, 1, 0] },
  J3: { pos: [0.95, Y0, Z0], n: [-1, 0, 0] },
  F4: { pos: [2.15, 0.9, Z0], n: [1, 0, 0] },
};
/** Colliers de la tuyauterie avant (P292) : centre du tube et direction du tube. */
export const CLAMPS312 = [1.12, 1.45, 1.8].map((x) => ({ pos: [x, Y0, Z0], dir: [1, 0, 0] }));

export default function P312(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { F3, J3, F4 } = PIPE312;
  const c = u(1.6), pad = u(1.0);
  // 1 — tube d'articulation : collet (F3), coude, bloc (J3)
  P('1', S.group(
    bentPipe(api, [[0.72, F3.pos[1] - c, Z0], [0.72, Y0, Z0], [J3.pos[0] - pad, Y0, Z0]]),
    frameAt(THREE, flangeHead(api), F3.pos, F3.n, [1, 0, 0]),
    frameAt(THREE, flangePad(api), J3.pos, [1, 0, 0], [0, 1, 0]),
  ), [-0.1, 0.12, 0]);
  // 2 — tube du flanc gauche : collet (J3), ligne droite, double coude, collet (F4)
  P('2', S.group(
    bentPipe(api, [[J3.pos[0] + c, Y0, Z0], [1.95, Y0, Z0], [2.03, F4.pos[1], Z0], [F4.pos[0] - c, F4.pos[1], Z0]]),
    frameAt(THREE, flangeHead(api), J3.pos, J3.n, [0, 1, 0]),
    frameAt(THREE, flangeHead(api), F4.pos, F4.n, [0, 1, 0]),
  ), [0.1, 0, -0.08]);
  // 3 — trousses de bride fendue
  for (const [f, e1] of [[F3, [1, 0, 0]], [J3, [0, 1, 0]], [F4, [0, 1, 0]]]) {
    P('3', frameAt(THREE, splitFlangeKit(api), f.pos, f.n, e1), f.n.map((v) => -v * 0.1));
  }
  return { view: { dir: [0.4, 0.8, -1.1] } };
}

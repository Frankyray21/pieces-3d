// P314 — Tuyauterie d'air arrière du porteur CX035547 rév. 0 (page 314) :
// « PIPE ASSY, DU311 CARRIER, REAR ». Conduite d'air comprimé 2 po (tube
// Ø 2 3/8 po cintré, collets et blocs de bride code 61 soudés) qui amène l'air
// du compresseur du pont arrière vers l'articulation, sous le capot moteur :
// - tube 1 (bride arrière tournée vers le pont arrière, à travers la tôle de
//   bout du châssis, décroché en S) ; tube 3 (coudes à 90°, traverse vers la
//   droite) ; tube 2 (le long du flanc droit au-dessus de l'essieu, remonte
//   en bout vers la bride tournée vers le haut, raccordée au flexible
//   d'articulation) ;
// - quatre trousses de bride fendue 2 po code 61 (4) : deux aux bouts, deux
//   aux jonctions (collet du tube aval serré sur le bloc du tube amont).
// Repère machine (../layout.js), posé à l'identité par P292 (châssis arrière) :
// tube à 0,858 m du sol ; brides F1 (-2,78 ; 0,858 ; -0,11) vers -X et
// F2 (-1,19 ; 1,00 ; 0,38) vers +Y ; colliers (P292) aux points CLAMPS314.
// Encombrement 1.62 (X) × 0.21 (Y) × 0.57 (Z) m.
// Cotes : tube 2 po (liste « 2" CODE 61 ») ; tracé d'après la vue de dessus de
// la page 296 (repère 68) et la vue isométrique de la page 314.
import { u, PIPE_R, bentPipe, flangeHead, flangePad, splitFlangeKit, frameAt } from './_carrier.js';

const Y0 = 0.858;
export const PIPE314 = {
  F1: { pos: [-2.78, Y0, -0.11], n: [-1, 0, 0] },
  J1: { pos: [-2.25, Y0, -0.02], n: [-1, 0, 0] },
  J2: { pos: [-2.03, Y0, 0.38], n: [-1, 0, 0] },
  F2: { pos: [-1.19, 1.0, 0.38], n: [0, 1, 0] },
};
/** Colliers de la tuyauterie arrière (P292) : centre du tube et direction du tube. */
export const CLAMPS314 = [
  { pos: [-2.58, Y0, -0.11], dir: [1, 0, 0] },
  { pos: [-1.9, Y0, 0.38], dir: [1, 0, 0] },
  { pos: [-1.4, Y0, 0.38], dir: [1, 0, 0] },
];

export default function P314(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { F1, J1, J2, F2 } = PIPE314;
  const c = u(1.6); // longueur du collet
  const pad = u(1.0);
  // 1 — tube arrière : collet (F1), décroché en S, bloc de bride (J1)
  P('1', S.group(
    bentPipe(api, [[F1.pos[0] + c, Y0, -0.11], [-2.5, Y0, -0.11], [-2.4, Y0, -0.02], [J1.pos[0] - pad, Y0, -0.02]]),
    frameAt(THREE, flangeHead(api), F1.pos, F1.n, [0, 1, 0]),
    frameAt(THREE, flangePad(api), J1.pos, [1, 0, 0], [0, 1, 0]),
  ), [-0.12, 0, -0.1]);
  // 3 — tube de traverse : collet (J1), deux coudes à 90°, bloc (J2)
  P('3', S.group(
    bentPipe(api, [[J1.pos[0] + c, Y0, -0.02], [-2.15, Y0, -0.02], [-2.15, Y0, 0.38], [J2.pos[0] - pad, Y0, 0.38]]),
    frameAt(THREE, flangeHead(api), J1.pos, J1.n, [0, 1, 0]),
    frameAt(THREE, flangePad(api), J2.pos, [1, 0, 0], [0, 1, 0]),
  ), [0, 0.1, 0.05]);
  // 2 — tube du flanc droit : collet (J2), coude montant, collet (F2)
  P('2', S.group(
    bentPipe(api, [[J2.pos[0] + c, Y0, 0.38], [-1.19, Y0, 0.38], [-1.19, F2.pos[1] - c, 0.38]]),
    frameAt(THREE, flangeHead(api), J2.pos, J2.n, [0, 1, 0]),
    frameAt(THREE, flangeHead(api), F2.pos, F2.n, [1, 0, 0]),
  ), [0.12, 0.1, 0.1]);
  // 4 — trousses de bride fendue (aux bouts et aux jonctions)
  for (const [f, e1] of [[F1, [0, 1, 0]], [J1, [0, 1, 0]], [J2, [0, 1, 0]], [F2, [1, 0, 0]]]) {
    P('4', frameAt(THREE, splitFlangeKit(api), f.pos, f.n, e1), f.n.map((v) => -v * 0.1));
  }
  void PIPE_R;
  return { view: { dir: [0.5, 0.9, 1.1] } };
}

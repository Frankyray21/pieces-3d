// P023 — Piston et cylindre du serre-tiges Boyles 12HH, 55-0300 (dessin X-Spec C6035 rév. A, page 23 : coupe à
// l'échelle 1:3,25 et détail A).
//
// REPÈRE LOCAL : axe le long de X, origine sur l'axe au dessus du piston ; x = −u·IN où u (pouces) est la cote
// axiale de la coupe, comptée vers le bas depuis le dessus du piston ; +X = vers le haut du serre-tiges (carter,
// bague). Posé par P021 (repère 23). Angles φ depuis +Y vers +Z (colonne sx = −1, _boyles.js) ; raccord d'huile
// sur le dessus (φ = 0°).
//
// Cotes [mesure p. 23, 92,3 px/po, contrôlées sur le Ø 10 po] :
//   cylindre 55-0041 : Ø 12,14 de u 0,62 à 4,0 ; alésage Ø 10 (u 1,55 à 4,0) et Ø 8,34 (u 0,62 à 1,55) avec les
//     gorges de la bague d'usure et du joint en U Ø 8 1/4 ; 9 passages des vis 1/2-13 × 4 qui le tiennent au carter
//     (lamages des têtes en bas, u 3,4 à 4,0) et 9 taraudages des vis du chapeau, sur Ø 11,2 [mesure : taraudage
//     de la coupe à r 5,5] ;
//   piston 55-0042 : alésage Ø 5,3 (glisse sur le tube du carter), col Ø 8,24 (u 0 à 2,05), tête Ø 9,9 (u 2,05 à
//     2,98) avec joint en U et bague d'usure Ø 10, moyeu jusqu'à u 3,37.
import { IN } from '../layout.js';
import { colonne, uCup, wearRing, coudeJIC, deg } from './_boyles.js';

export const SHCS4 = Array.from({ length: 9 }, (_, k) => (10 + 40 * k) * deg); // vis 1/2-13 × 4 cylindre → carter
export const SHCS2 = Array.from({ length: 9 }, (_, k) => (30 + 40 * k) * deg); // vis 1/2-13 × 2 chapeau → cylindre

export default function P023(api) {
  const { S } = api;
  const C = colonne(api, -1);
  const W = (obj) => S.at(S.group(obj), [0, 0, 0], [0, 0, -Math.PI / 2]);
  const P = (ref, obj, ex) => api.part(ref, W(obj), ex);
  const X = (k) => [k, 0, 0];

  // 5 — Cylindre 55-0041.
  P('5', S.group(
    C.L([[4.17, 0.62], [4.6, 0.62], [4.6, 1.55], [4.17, 1.55], [4.17, 1.38], [4.42, 1.38], [4.42, 1.1], [4.17, 1.1], [4.17, 1.05], [4.3, 1.05], [4.3, 0.85], [4.17, 0.85]], 'red', 72),
    C.slab(6.07, 4.6, 0.62, 1.55, SHCS4.map((f) => [5.6, f, 0.28]), 'red', 96),
    C.slab(6.07, 4.97, 1.55, 3.4, [...SHCS4.map((f) => [5.6, f, 0.28]), ...SHCS2.map((f) => [5.6, f, 0.21])], 'red', 96),
    C.slab(6.07, 4.97, 3.4, 4.0, [...SHCS4.map((f) => [5.6, f, 0.42]), ...SHCS2.map((f) => [5.6, f, 0.21])], 'red', 96),
  ), X(0));

  // 6 — Piston 55-0042.
  P('6', C.L([[2.65, 0], [3.95, 0], [4.12, 0.17], [4.12, 2.05], [4.95, 2.05], [4.95, 2.1], [4.7, 2.1], [4.7, 2.38], [4.95, 2.38], [4.95, 2.45],
    [4.85, 2.45], [4.85, 2.72], [4.95, 2.72], [4.95, 2.9], [4.87, 2.98], [3.4, 2.98], [3.4, 3.37], [2.72, 3.37], [2.65, 3.3]], 'steel', 72), X(-0.2));

  // Joints : 2 et 4 dans le cylindre (Ø 8 1/4), 1 et 3 sur la tête du piston (Ø 10).
  P('2', wearRing(C, 4.18, 4.29, 0.86, 1.04), X(0.08));
  P('4', uCup(C, 4.18, 4.41, 1.11, 1.37, 1), X(0.11));
  P('3', uCup(C, 4.71, 4.96, 2.11, 2.37, -1), X(-0.12));
  P('1', wearRing(C, 4.86, 4.96, 2.46, 2.71), X(-0.15));

  // 7 — Raccord coudé M-JIC #6 / M-NPT #4 sur le dessus du cylindre, dans la chambre annulaire (u 1,8) ;
  // 8 — bouchon femelle JIC #6 sur sa sortie.
  P('7', C.radial(coudeJIC(S), 6.07, 0, 1.8), [0, 0.06, 0]);
  const bouchon = S.at(S.group(S.nut(0.0175, 0.012, 'steel'), S.cyl(0.0085, 0.003, 'steel', { pos: [0, 0.0065, 0], seg: 14 })), [0.036, 0.04, 0], [0, 0, -Math.PI / 2]);
  P('8', C.radial(S.group(bouchon), 6.07, 0, 1.8), [0, 0.06, 0.06]);
}

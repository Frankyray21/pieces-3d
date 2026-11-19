// P020 — Piston et cylindre du mandrin Boyles 12HH, 55-0200 (dessin X-Spec C5872 rév. C, page 20 : vue de face,
// coupe A-A à l'échelle 1:4 et détail B à 1:2).
//
// REPÈRE LOCAL : axe le long de X, origine sur l'axe ; x = u·IN où u (pouces) est la cote axiale relevée sur la coupe
// A-A (u = 0 : 0,12 po au-dessus du manchon d'actionnement) ; +X = vers la tête de forage (bride du cylindre et
// manchon vers −X côté carter du mandrin). Posé par P018 (repère 13) à x = CHUCK.x0 − (13,06 − 7,72 − u)… voir P018.
// Angles φ : depuis +Y vers +Z (colonne sx = +1, voir _boyles.js). Le raccord d'huile est du côté +Z (φ = 90°).
//
// Cotes [mesure p. 20, 75 px/po, contrôlées sur les bagues d'usure Ø 10 et Ø 8 1/4 po du manuel] :
//   cylindre 55-0007 : bride Ø 12,16 de u 0,83 à 3,73, 10 trous Ø 0,53 sur Ø 11,2 (vue de face), centrage Ø 10,66
//     de u 0,45 à 0,83, alésage Ø 10 (piston) puis Ø 8,3 (col du piston) avec les gorges du joint en U et de la
//     bague d'usure Ø 8 1/4 ;
//   piston 55-0010 : col Ø 8,26 (u 0,45 à 2,36), tête Ø 9,96 (u 2,36 à 3,25) avec joint en U et bague d'usure Ø 10,
//     logement de la butée (Ø 7,52), quatre goupilles fendues 3/8 × 1 3/4 sur Ø 8 vers la tête ;
//   manchon d'actionnement 55-0001 : alésage Ø 5,26, portée Ø 5,9 de la butée, collet fileté Ø 7,24 percé de
//     9 trous Ø 0,4 sur Ø 6,8 (entretoises du bas du mandrin) ;
//   butée 15-51130 : Ø 150 × 190 × 31 mm [norme, BEARINGS['51130'] de layout.js] ;
//   bague d'appui 55-0009 et anneau de retenue 55-0014 derrière la butée.
import { IN, BEARINGS } from '../layout.js';
import { colonne, uCup, wearRing, zerk, coudeJIC, deg } from './_boyles.js';

export default function P020(api) {
  const { S } = api;
  const C = colonne(api, 1);
  // Colonne → repère local : +Y local (u décroissant) vers −X.
  const W = (obj) => S.at(S.group(obj), [0, 0, 0], [0, 0, Math.PI / 2]);
  const P = (ref, obj, ex) => api.part(ref, W(obj), ex);
  const X = (k) => [k, 0, 0];

  // 2 — Cylindre 55-0007 : partie tournée (centrage, col Ø 8 1/4 et ses gorges) et bride percée.
  const holes = Array.from({ length: 10 }, (_, k) => [5.6, (36 * k) * deg, 0.265]);
  P('2', S.group(
    C.L([[4.32, 0.45], [5.08, 0.45], [5.33, 0.62], [5.33, 0.83], [5.0, 0.83], [5.0, 1.42], [4.15, 1.42], [4.15, 1.27], [4.42, 1.27],
      [4.42, 1.0], [4.15, 1.0], [4.15, 0.97], [4.3, 0.97], [4.3, 0.72], [4.15, 0.72], [4.15, 0.66], [4.32, 0.66]], 'yellow', 72),
    C.slab(6.08, 5.0, 0.83, 3.73, holes, 'yellow', 96),
  ), X(0));

  // 3 — Piston 55-0010 (goupilles : repère 10).
  P('3', C.L([[3.65, 0.45], [4.13, 0.45], [4.13, 2.36], [4.98, 2.36], [4.98, 2.42], [4.72, 2.42], [4.72, 2.72], [4.98, 2.72], [4.98, 2.8],
    [4.85, 2.8], [4.85, 3.08], [4.98, 3.08], [4.98, 3.17], [4.9, 3.25], [3.76, 3.25], [3.76, 2.2], [3.08, 2.2], [3.08, 1.55], [3.2, 1.4],
    [3.45, 1.3], [3.65, 1.22]], 'steel', 72), X(0.2));

  // Joints : 1 V-ring sur le col du piston, devant le centrage ; 4 et 5 dans le cylindre (Ø 8 1/4) ; 6 et 7 sur la
  // tête du piston (Ø 10).
  P('1', C.L([[4.13, 0.64], [4.13, 0.48], [4.22, 0.48], [4.38, 0.36], [4.42, 0.4], [4.3, 0.52], [4.3, 0.64]], 'rubber', 72), X(-0.15));
  P('4', uCup(C, 4.16, 4.41, 1.01, 1.26, 1), X(-0.11));
  P('5', wearRing(C, 4.16, 4.29, 0.73, 0.96), X(-0.08));
  P('6', uCup(C, 4.73, 4.99, 2.43, 2.71, -1), X(0.12));
  P('7', wearRing(C, 4.86, 4.99, 2.81, 3.07), X(0.15));

  // 13 — Manchon d'actionnement 55-0001 : collet percé (9 trous des entretoises), collet fileté, portée de la butée,
  // gorge de l'anneau de retenue.
  const thr = [];
  for (let u = 0.62; u < 1.2; u += 0.1) thr.push([3.62, u], [3.58, u + 0.05]);
  P('13', S.group(
    C.slab(3.62, 2.63, 0.12, 0.6, Array.from({ length: 9 }, (_, k) => [3.4, 40 * k * deg, 0.2]), 'steel'),
    C.L([[2.63, 0.6], ...thr, [3.62, 1.25], [2.95, 1.38], [2.95, 3.85], [2.85, 3.85], [2.85, 3.97], [2.95, 3.97], [2.95, 4.3], [2.88, 4.37], [2.63, 4.37]], 'steel', 72),
  ), X(-0.36));

  // 14 — Butée à billes 15-51130 (garnie de graisse au montage : note B du manuel).
  const [bi, bo, bw] = BEARINGS['51130'];
  P('14', C.put(S.bearing(bo / 2, bi / 2, bw, 'steel', { thrust: true }), 0, 0, 2.2 + bw / IN / 2), X(0.32));
  // 11 — Bague d'appui 55-0009 ; 12 — anneau de retenue 55-0014 (jonc à oreilles, fente en bas).
  P('11', C.L([[2.96, 3.43], [3.62, 3.43], [3.62, 3.85], [2.96, 3.85]], 'steel', 72), X(0.38));
  P('12', S.group(
    C.sector([[2.86, 3.86], [3.3, 3.86], [3.3, 3.96], [2.86, 3.96]], 190 * deg, 530 * deg, 'blackOxide', 40),
    ...[188, 172].map((a) => C.put(S.box(0.3 * IN, 0.1 * IN, 0.22 * IN, 'blackOxide'), 3.18, a * deg, 3.91)),
  ), X(0.43));

  // 10 — Goupilles élastiques fendues 3/8 × 1 3/4 (4) sur Ø 8, à φ = 45° + 90k : 0,6 po dans le piston.
  for (let k = 0; k < 4; k++) {
    P('10', C.put(C.L([[0.13, 0], [0.1875, 0], [0.1875, 1.75], [0.13, 1.75]], 'steel', 16), 4.0, (45 + 90 * k) * deg, 2.65), X(0.26));
  }

  // 8 — Raccord coudé M-JIC #6 / M-NPT #4 sur la bride, dans la chambre annulaire (u 1,9) ; 9 — graisseur 1/4-28.
  P('8', C.radial(coudeJIC(S), 6.08, 90 * deg, 1.9), [0, 0, 0.08]);
  P('9', C.radial(zerk(S), 6.08, 150 * deg, 3.0), [0, -0.04, 0.07]);

  return { view: { dir: [-1, 0.55, 0.9] } };
}

// P058 — Trousse de boyaux de la tête 6245, mât 10 pi HH : CX032537 rév. 2
// « HOSE KIT, 10' HH V30 6245 » (dessin page 58, liste page 59), repère 15 de
// l'avance P032. Seize lignes, vingt-quatre pièces : raccords zingués de la
// tête (tés tournants -12 (1), coudes tournants 90° -12 (2), coude ORB-06 (3),
// adaptateurs ORB-10 / JIC-12 courts (4) et longs (5)) et flexibles sertis
// deux tresses à écrou tournant JIC 37° (HA06…, HA08…, HA12… : -06, -08, -12 ;
// 000 = droit / droit, 001 = droit / 45°, 002 = droit / 90°, 020 / 022 = -12
// autre gamme droit / droit et droit / 90° ; suffixe = longueur hors tout, po).
// Repère : celui de P032 (feed.js, mast.js) — axe du mât selon +Y (pied à
// y = 0), face avant (tête de rotation) vers +Z, +X à gauche de la vue
// arrière de la page 32 ; P032 doit insérer la trousse à l'origine.
//
// Circuit lu sur le dessin (bulles) :
//   · Boucle de la tête (10 ×2, 13 ×2, 6, 8) : six flexibles verticaux qui
//     montent de la traversée de la boucle (P156, plaque du flanc −X du mât,
//     vers y = 2.06) au-dessus du mât et redescendent sur les six coudes de
//     traversée du support P046 (6 = -06, 7 = -08, 8 = -12 ×4). Ordre du
//     plancher P046 (local z −0.085 → +0.085) : -12 (13), -12 (13), -06 (6),
//     -08 (8, sortie basse bouchée par P046 rep. 9), -12 (10), -12 (10).
//   · Sous P046, vers la tête : 9 ×2 (23 po) des coudes -12 aux tés 1 (sur
//     adaptateurs longs 5) des orifices du moteur −X ; 11 ×2 (27 po, embout
//     45°) des branches des tés, en arceaux au-dessus de l'avant de la tête,
//     aux coudes 2 (sur adaptateurs 4, tournés vers le haut) du moteur +X ;
//     7 (-06, 35 po, embout 90°) du coude -06 au coude 3 (ORB-06, dessus du
//     carter, vidange). 15 (44 po) et 16 (80 po) des deux autres coudes -12
//     montent vers la tête supérieure du vérin d'avance.
//   · Flanc −X (vue de gauche) : 12 (67 po) et 14 (98 po) partent des tés de
//     la traversée P156 (FA01011-12 de P156) : 12 monte au chapeau du mât,
//     14 descend au pied du mât.
// Points de raccordement supposés (composants des autres assemblages, non
// dessinés ici) :
//   · P046 placé (P032 ne le place pas encore) platine contre la face avant
//     de la plaque porte-tête (z = plateZ + 0.02), côté −X (centre x = −0.44),
//     dessus du plancher à y = plateY + 0.20, potence vers l'avant (+Z) :
//     axes de P046 tournés de +90° autour de Y (local −X → +Z). Avec la
//     potence vers −X (axes de P046 inchangés), les coudes seraient à 0.4 m
//     du moteur −X, sorties vers l'extérieur : les 23 po des 9 ne suffisent
//     pas ; feed.js met un support provisoire à +X (rep. 9), le dessin P032
//     le montre à −X.
//   · Orifices des moteurs ME18 (topdrive.js : moteurs x = ±0.235, orifices
//     à ±0.035, face avant z = AX + 0.105, y = plateY + 0.205), ORB-10.
//   · Coude 3 sur le dessus du carter (y = plateY + 0.14), x = −0.10,
//     z = AX − 0.12, entre le moteur −X et l'émerillon.
//   · Tête supérieure du vérin d'avance P132 : deux orifices supposés par la
//     face avant du haut du mât, (∓0.06, 2.93, 0.235), vers +Z.
//   · Traversée P156 : rangée de six adaptateurs de traversée suivant Z à
//     x = −0.32 (entre le flanc du mât et le vérin stinger −X, derrière son
//     support), plaque à y = 2.06 ; sièges hauts vers +Y ; branches des tés
//     de P156 (z = −0.03 et −0.07) vers −X.
//   · 12 : orifice supposé au haut du flanc −X du mât (y = 3.0, z = −0.05),
//     vers −X ; 14 : traversée supposée du pied de mât (−0.30, 0.04, −0.12),
//     vers le haut.
// Tracés : boucle en arceau au-dessus du haut du mât (passage côté mât de la
// tige du stinger −X, derrière ses supports), 12 et 14 le long du flanc −X
// entre mât et vérin, derrière les supports ; chaque flexible a la longueur
// libre de la liste (flèche ajustée par hose()).
// Encombrement ≈ 1.0 (X, de −0.6 à 0.42) × 3.25 (Y, de 0.03 à 3.28) × 1.0
// (Z, de −0.25 à 0.95) m.
import { MAST } from '../mast.js';
import { IN, straight, elbow, tee } from './_avance_a.js';
import { hoseKit, S, E } from './_avance_a_hk1.js';

const AX = 0.565; // axe de forage (feed.js)
const TS = 0.375 * IN; // plancher de P046
// P046 dans le repère de P032 (axes de P046 inchangés) : origine, rangée
// des coudes de traversée selon X (x local = −0.40 + i·0.034), tailles.
const O46 = [-0.31, MAST.plateY + 0.25, MAST.plateZ + 0.1];
const XH = [0, 1, 2, 3, 4, 5].map((i) => -0.4 + i * 0.034);
const NH = [12, 12, 6, 12, 8, 12];
// Sièges des coudes de traversée de P046 (bulkheadElbow, plancher TS) : haut
// (+Y) et sortie basse (vers +Z) — cotes de _avance_a.js.
const BK_TOP = { 6: 0.0292, 8: 0.0355, 12: 0.0467 };
const BK_ARM = { 6: [0.0302, -0.0249], 8: [0.0383, -0.0291], 12: [0.0517, -0.036] };
// Moteurs ME18 : orifices (face avant), y et z.
const YM = MAST.plateY + 0.14 + 0.065, ZM = AX + 0.105;
// Traversée P156 (flanc −X).
const X156 = -0.32, Y156 = 1.8;
const Z156 = [-0.03, -0.07, -0.11, -0.15, -0.19, -0.23];

export default function P058(api) {
  const { fit, H } = hoseKit(api);
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
  const NX = [-1, 0, 0], NY = [0, -1, 0];

  // ------------------------------------------------ sièges de P046 (non dessiné)
  const b46 = XH.map((xl, i) => {
    const n = NH[i], x = O46[0] + xl, y0 = O46[1] - TS;
    return {
      n,
      top: S([x, y0 + BK_TOP[n], O46[2]], Y),
      arm: S([x, y0 + BK_ARM[n][1], O46[2] + BK_ARM[n][0]], Z),
    };
  });
  // ------------------------------------------------ sièges de P156 (non dessiné)
  const s156 = (i, n) => S([X156, Y156 + (n === 12 ? 0.05 : 0.04), Z156[i]], Y);
  const tee156 = (i) => S([X156 - 0.045, Y156 - 0.06, Z156[i]], NX);

  // ------------------------------------------------ raccords de la tête (moteurs)
  // Moteur −X : adaptateurs longs 5 (ORB-10 / JIC-12) puis tés tournants 1,
  // passage vers l'avant (arceaux des 11) ; branche du té extérieur vers −X,
  // du té intérieur vers le bas et −X à 45° (arrivées des 9).
  const xm = (s, k) => s * 0.235 + k * 0.035;
  const tees = [[-1, NX], [1, [-Math.SQRT1_2, -Math.SQRT1_2, 0]]].map(([k, br]) => {
    const [a] = fit('5', straight('orb', 10, 12, { long: true }), [xm(-1, k), YM, ZM], Z, null, [0, 0, 0.1]);
    const [run, b] = fit('1', tee('swivel', 12), a.p, Z, br, [0, 0, 0.2]);
    return { run, br: b };
  });
  // Moteur +X : adaptateurs courts 4 puis coudes tournants 2, sorties vers le haut.
  const elbows = [-1, 1].map((k) => {
    const [a] = fit('4', straight('orb', 10, 12), [xm(1, k), YM, ZM], Z, null, [0, 0, 0.1]);
    const [s] = fit('2', elbow('swivel', 12, 12), a.p, Z, Y, [0, 0, 0.2]);
    return s;
  });
  // Coude 3 (ORB-06 / JIC-06) sur le dessus du carter, sortie vers −X.
  const [s3] = fit('3', elbow('orb', 6, 6), [-0.1, MAST.plateY + 0.14, AX - 0.12], Y, NX, [0, 0.15, 0]);

  // ------------------------------------------------ boucle : P156 → P046
  // Arceau au-dessus du haut du mât : montée au droit de P046, passage devant
  // puis côté mât du chapeau de la tige du stinger −X, descente derrière ses
  // supports jusqu'à P156.
  const loop = (ref, L, n, i46, i156, apex, e) => {
    const a = b46[i46].top, b = s156(i156, n);
    const xa = a.p[0], zb = b.p[2];
    H(ref, L, n, a, b, {
      vias: [
        [xa, apex - 0.22, O46[2] + 0.02],
        [(xa + X156) / 2 - 0.04, apex, 0.3],
        [X156, apex - 0.04, 0.12],
        [X156, apex - 0.4, zb],
      ],
      sag: [0, 1, 0],
    }, e);
  };
  // Arceaux emboîtés : plus haut pour la sortie la plus en arrière sur P156.
  loop('10', 89, 12, 5, 0, 3.0, [-0.3, 0.25, -0.05]);
  loop('8', 89, 8, 4, 1, 3.02, [-0.32, 0.27, -0.05]);
  loop('10', 89, 12, 3, 2, 3.04, [-0.34, 0.29, -0.05]);
  loop('6', 90, 6, 2, 3, 3.06, [-0.36, 0.31, -0.05]);
  loop('13', 85, 12, 1, 4, 3.08, [-0.38, 0.33, -0.05]);
  loop('13', 85, 12, 0, 5, 3.1, [-0.4, 0.35, -0.05]);

  // ------------------------------------------------ P046 → tête
  // 9 : coudes -12 intérieurs → branches des tés du moteur −X.
  H('9', 23, 12, b46[3].arm, tees[0].br, { vias: [[-0.5, YM - 0.01, 0.62]], sag: NX }, [-0.05, 0, 0.3]);
  H('9', 23, 12, b46[5].arm, tees[1].br, { sag: NY }, [-0.05, -0.05, 0.35]);
  // 11 : passages des tés → coudes du moteur +X, arceaux devant l'émerillon.
  H('11', 27, 12, tees[0].run, E(elbows[0], '45', NX), { sag: Y }, [0, 0.3, 0.3]);
  H('11', 27, 12, tees[1].run, E(elbows[1], '45', NX), { sag: [0, 0.6, 0.8] }, [0, 0.22, 0.3]);
  // 7 : coude -06 de P046 → coude 3 (embout 90°, arrivée par le haut),
  // derrière le moteur −X.
  H('7', 35, 6, b46[2].arm, E(s3, '90', Y), {
    vias: [[-0.45, YM + 0.03, 0.43], [-0.22, YM + 0.12, 0.43]],
    sag: [0, 1, 0],
  }, [-0.1, 0.2, 0.2]);
  // 15 / 16 : coudes -12 extérieurs → tête du vérin d'avance (embouts 90°,
  // arrivée par le haut) ; 16, plus long, fait le tour par l'avant et le
  // côté +X de la tête.
  const cyl = (s) => S([s * 0.06, 2.93, 0.235], Z);
  H('15', 44, 12, b46[0].arm, E(cyl(-1), '90', Y), {
    vias: [[-0.6, 2.88, 0.45], [-0.2, 2.98, 0.3]],
    sag: [0, 1, 0],
  }, [-0.15, 0.3, 0.1]);
  H('16', 80, 12, b46[1].arm, E(cyl(1), '90', Y), {
    vias: [[-0.6, 2.9, 0.66], [0.0, 3.02, 0.74], [0.3, 3.02, 0.47], [0.2, 3.06, 0.3]],
    sag: [0, 1, 0],
  }, [0.1, 0.35, 0.15]);

  // ------------------------------------------------ flanc −X : 12 et 14
  // 12 : branche du té avant de P156 → haut du flanc −X du mât.
  H('12', 67, 12, tee156(0), S([-MAST.width / 2 - 0.015, 3.0, -0.05], NX), {
    vias: [[-0.38, 2.2, -0.04], [-0.37, 2.6, -0.045], [-0.34, 2.93, -0.05]],
    sag: NX,
  }, [-0.35, 0, -0.1]);
  // 14 : branche du second té → pied du mât, entre mât et vérin.
  H('14', 98, 12, tee156(1), S([-0.3, 0.04, -0.12], Y), {
    vias: [[-0.38, 1.85, -0.09], [-0.3, 1.5, -0.12], [-0.29, 0.8, -0.12]],
    sag: NX,
  }, [-0.35, 0, -0.15]);

  return { view: { dir: [-1.0, 0.5, 1.1] } };
}

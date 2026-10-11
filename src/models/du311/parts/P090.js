// P090 — Trousse de boyaux des raccords-unions aux traversées du mât :
// CX033199 « HOSE KIT, JIC JOINERS TO BLKHD » (page 90 : « NO ILLUSTRATION
// AVAILABLE »), repère 21 de l'avance P032. Douze flexibles -06 (3/8 po, deux
// tresses compact, Ø 19 mm, embouts sertis zingués droits à écrou tournant
// JIC 37°) HA06000-L, L = longueur hors tout en pouces : 1 = 60 1/2, 2 = 61,
// 3 = 61 1/2, 4 = 62, 5 = 69 (×4), 6 = 76, 7 = 78, 8 = 80, 9 = 82.
// Repère : celui de P032 (feed.js, mast.js) — axe du mât selon +Y (pied à
// y = 0), face avant vers +Z ; P032 insère la trousse à l'origine.
//
// Raccordements supposés (aucun dessin ni schéma) :
//   · côté mât : mamelons extérieurs des coudes de traversée du mât (P130
//     repère 7), six par flanc à y = 1.45 … 1.20 (TRAV.outer de
//     _avance_a_hk2.js : x = ±(W/2 + 0.036), z = 0.05, sortie selon ±X) ;
//   · 1 à 4 (longueurs en escalier de 1/2 po = décalage de 12 mm des unions) :
//     sièges inférieurs des quatre unions pendues du détail A de P084
//     (KIT084.unions : x 0.56 / 0.568, y 1.28 − i·0.012, z 0.24 … 0.33), depuis
//     les traversées +X 1.20 → union 0 … 1.35 → union 3 ;
//   · 5 (×4, longueurs égales : circuit symétrique) : traversées +X 1.45 /
//     1.40 et −X 1.25 / 1.20 → raccords-unions de la trousse du centreur fendu (P064, non
//     modélisée) supposés debout près des vérins du centreur, en
//     (±0.42, 0.50, 0.43 / 0.47) (KIT090.centralizer) ;
//   · 6 à 9 (pas de 2 po = entraxe des traversées) : traversées −X 1.30 …
//     1.45 → rangée de quatre raccords-unions de P064 debout à côté du bloc de
//     distribution du centreur (P126), en (−0.46, 0.30, 0.25 … 0.37)
//     (KIT090.manifold).
// Tracés : chaque boyau quitte son mamelon selon ±X, plonge aussitôt vers le
// bas derrière le bord intérieur du vérin stinger (couloir vertical
// x = ±0.35, z −0.02 … −0.125, un rang par boyau, derrière les supports
// stinger), revient vers l'avant par l'intervalle mât / vérin (x ±0.29 ;
// +X à y 0.84 … 1.06, −X à y 0.78 … 0.90, sous le support −X à y = 1.0),
// puis : 1 à 4 vers l'extérieur devant le vérin +X (z 0.175 … 0.235,
// devant le cadre de P070) et remontée en boucle dans les unions ; 5 et 6 à 9 descente devant le vérin et boucle
// de mou pendante avant l'entrée par le haut des raccords-unions. Le mou de
// chaque boyau est logé dans la boucle finale (slackHose de _avance_a_hk4.js).
// Écarts : le mamelon +X à y = 1.45 est dans le support stinger simplifié de
// feed.js (y 1.435 … 1.465) ; les raccords-unions de P064 ne sont pas dessinés
// (sièges seulement) ; répartition des lignes déduite des longueurs.
// Encombrement ≈ 1.35 (X, de −0.76 à 0.59) × 1.15 (Y, de 0.31 à 1.46) × 0.68
// (Z, de −0.18 à 0.50) m.
import { union } from './_avance_a.js';
import { TRAV, seatOf, v3 } from './_avance_a_hk2.js';
import { slackHose } from './_avance_a_hk4.js';
import { KIT084 } from './P084.js';

// Raccords-unions de P064 (estimés), axes verticaux, sièges hauts vers +Y.
const CENT = { x: 0.42, y: 0.5, z: [0.43, 0.47] };
const MANI = { x: -0.46, y: 0.3, z: [0.25, 0.29, 0.33, 0.37] };
// Couloir arrière et passage avant (|x|), hauteurs de retour vers l'avant.
const XB = 0.35, XG = 0.29, YF0 = 0.955, DYF = 0.024;

export const KIT090 = {
  centralizer: CENT, manifold: MANI,
  bulkheads: { '+X': [1.45, 1.4, 1.35, 1.3, 1.25, 1.2], '-X': [1.45, 1.4, 1.35, 1.3, 1.25, 1.2] },
};

export default function P090(api) {
  const Y = [0, 1, 0];
  const H = (ref, L, a, b, opts, e) => slackHose(api, ref, L, 6, a, b, opts, e);
  const up = (x, y, z) => seatOf(union(6), [x, y, z], Y, null, 0);
  const U = KIT084.unions;
  const un = U.z.map((z, i) => seatOf(union(6), [U.x + (i % 2) * 0.008, U.y - i * 0.012, z], Y, null, 1));

  // Rang j (0 = traversée du haut, 1.45) : couloir arrière z, hauteur de retour.
  const ys = TRAV.ys.slice(0, 6);
  const lane = (s, j, y0 = YF0) => {
    const z = -0.02 - 0.021 * (5 - j), yF = y0 - DYF * (5 - j);
    const run = ys[j] - 0.05 - (yF + 0.07) > 0.04 ? [[s * XB, yF + 0.07, z]] : [];
    return { yF, head: [[s * XB, ys[j] - 0.05, z], ...run, [s * XG, yF, 0.1]] };
  };

  // ------------------------------------------------ flanc +X
  // 1 à 4 : traversées 1.20 (j 5) … 1.35 (j 2) → unions 0 … 3.
  [['1', 60.5, 5, 0], ['2', 61, 4, 1], ['3', 61.5, 3, 2], ['4', 62, 2, 3]].forEach(([ref, L, j, i]) => {
    const { yF, head } = lane(1, j, 1.06);
    const zo = 0.175 + 0.02 * i, xu = un[i].p.x;
    H(ref, L, TRAV.outer(1, ys[j]), un[i], {
      vias: [...head, [0.33, yF, zo], [0.44, yF - 0.04, zo], [xu - 0.02, yF - 0.06, (zo + U.z[i]) / 2], [xu, yF + 0.04, U.z[i]]],
      move: [head.length + 1, head.length + 2, head.length + 3], dir: [0, -1, 0], w: [0.7, 1, 0.8],
    }, [0.25 + 0.02 * i, 0, 0.12]);
  });
  // 5 : traversées 1.45 / 1.40 → raccords-unions du vérin +X du centreur.
  [0, 1].forEach((j) => {
    const { yF, head } = lane(1, j), zc = CENT.z[j];
    H('5', 69, TRAV.outer(1, ys[j]), up(CENT.x, CENT.y, zc), {
      vias: [...head, [0.31, yF - 0.02, 0.2 + 0.02 * j], [0.36, 0.73, 0.25 + 0.02 * j], [CENT.x, 0.7, zc]],
      move: [4], dir: [1, 0, -0.3],
    }, [0.2, -0.05, 0.25]);
  });

  // ------------------------------------------------ flanc −X
  // 5 : traversées 1.20 / 1.25 (rangs avant) → raccords-unions du vérin −X du centreur.
  [5, 4].forEach((j, k) => {
    const { yF, head } = lane(-1, j, 0.9), zc = CENT.z[k];
    H('5', 69, TRAV.outer(-1, ys[j]), up(-CENT.x, CENT.y, zc), {
      vias: [...head, [-0.31, yF - 0.02, 0.2 + 0.02 * k], [-0.37, 0.72, 0.27], [-0.37, 0.6, 0.36], [-CENT.x, 0.66, zc]],
      move: [4, 5], dir: [-0.3, -1, 0], w: [0.6, 1],
    }, [-0.2, -0.05, 0.25]);
  });
  // 6 à 9 : traversées 1.30 (j 3) … 1.45 (j 0) → rangée de P064 près du bloc P126.
  [['6', 76, 3, 0], ['7', 78, 2, 1], ['8', 80, 1, 2], ['9', 82, 0, 3]].forEach(([ref, L, j, i]) => {
    const { yF, head } = lane(-1, j, 0.9), zm = MANI.z[i];
    H(ref, L, TRAV.outer(-1, ys[j]), up(MANI.x, MANI.y, zm), {
      vias: [...head, [-0.3, yF - 0.03, 0.19], [-0.31, 0.62, 0.19 + 0.01 * i], [-0.4, 0.5, zm], [MANI.x, 0.42, zm]],
      move: [4, 5], dir: [-1, -0.4, 0], w: [0.7, 1],
    }, [-0.25 - 0.02 * i, -0.05, 0.12]);
  });

  void v3;
  return { view: { dir: [0.2, 0.35, 1.2] } };
}

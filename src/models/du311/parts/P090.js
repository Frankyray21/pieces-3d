// P090 — Trousse de boyaux des raccords-unions aux traversées du mât :
// CX033199 « HOSE KIT, JIC JOINERS TO BLKHD » (page 90 : « NO ILLUSTRATION
// AVAILABLE »), repère 21 de l'avance P032. Douze flexibles -06 (3/8 po, deux
// tresses compact, Ø 19 mm, embouts sertis zingués droits à écrou tournant
// JIC 37°) HA06000-L, L = longueur hors tout en pouces : 1 = 60 1/2, 2 = 61,
// 3 = 61 1/2, 4 = 62, 5 = 69 (×4), 6 = 76, 7 = 78, 8 = 80, 9 = 82.
// Repère : celui de P032 (feed.js, mast.js) — axe du mât selon +Y (pied à
// y = 0), face avant vers +Z ; P032 insère la trousse à l'origine.
//
// Raccordements (aucun dessin ni schéma ; sièges réels des trousses voisines
// quand ils existent) :
//   · côté mât : mamelons extérieurs des coudes de traversée du mât (P130
//     repère 7), six par flanc à y = 1.45 … 1.20 (TRAV.outer de
//     _avance_a_hk2.js : x = ±(W/2 + 0.036), z = 0.05, sortie selon ±X) ;
//   · 1 à 4 (longueurs en escalier de 1/2 po = décalage de 12 mm des unions) :
//     sièges inférieurs des quatre unions pendues du détail A de P084
//     (KIT084.unions : x 0.56 / 0.568, y 1.28 − i·0.012, z 0.24 … 0.33), depuis
//     les traversées +X 1.20 → union 0 … 1.35 → union 3 ;
//   · 5 (×4) : deux depuis les traversées −X 1.20 / 1.25 → sièges hauts des
//     deux unions relais de P064 (repère 4) au coin avant du flanc −X,
//     (−0.30, 0.93, 0.172) et (−0.30, 0.95, 0.202) (cotes de P064, U) ; deux
//     depuis les traversées +X 1.45 / 1.40 → aucun raccord libre connu sur
//     ce flanc : bouts supposés sur deux unions relais debout près du vérin
//     +X du centreur, (0.42, 0.50, 0.43 / 0.47) (KIT090.relay, seul point
//     estimé de la trousse) ;
//   · 6 à 9 (pas de 2 po = entraxe des traversées) : traversées −X 1.30 …
//     1.45 → les quatre coudes libres du sélecteur P152 (repère 37 ; P060
//     occupe les deux du flanc +X) : 9 → flanc −X haut, 8 → flanc −X bas,
//     7 → face avant bas, 6 → face avant haut ; sélecteur posé par KIT060 en
//     (−0.4, 1.0, 0.1), sans rotation, coudes calculés comme dans P152.
// Tracés : chaque boyau quitte son mamelon selon ±X, plonge aussitôt vers le
// bas derrière le bord intérieur du vérin stinger (couloir vertical
// x = ±0.35, z −0.05 … −0.155, un rang par boyau, derrière les supports
// stinger) ; 1 à 4 et les 5 reviennent vers l'avant par l'intervalle mât /
// vérin (x ±0.29, y 1.04 … 1.16, entre le support −X à y = 1.0 et les
// mamelons de 1.20) : 1 à 4 vers l'extérieur devant le vérin +X (z 0.175 …
// 0.235, devant le cadre de P070) et remontée en boucle dans les unions ;
// 5 en boucle pendante devant le vérin avant l'entrée par le haut des
// unions. 6 à 9 sortent vers l'arrière et l'extérieur derrière le vérin −X,
// boucle de mou pendante derrière le sélecteur, entrée par le bas des coudes
// (par le haut pour le coude avant haut). Le mou de chaque boyau est logé
// dans sa boucle (slackHose de _avance_a_hk4.js).
// Écarts : le mamelon +X à y = 1.45 est dans le support stinger simplifié de
// feed.js (y 1.435 … 1.465) ; le couloir arrière croise par endroits les
// tracés estimés de P054 (même intervalle vérin / mât), et l'arrivée du 7
// sous le coude avant bas du sélecteur croise le 5 de P054 (C → 0.85) ; répartition des
// lignes déduite des longueurs ; les raccords d'arrivée ne sont pas dessinés
// ici (sièges seulement).
// Encombrement ≈ 1.22 (X, de −0.63 à 0.59) × 1.13 (Y, de 0.34 à 1.46) × 0.79
// (Z, de −0.29 à 0.49) m.
import { union, elbow } from './_avance_a.js';
import { TRAV, seatOf, v3 } from './_avance_a_hk2.js';
import { slackHose } from './_avance_a_hk4.js';
import { KIT084 } from './P084.js';
import { KIT060 } from './P060.js';

// Unions relais : P064 (U, coin avant −X) et estimées (+X).
const U064 = [[-0.3, 0.93, 0.172], [-0.3, 0.95, 0.202]];
const RELAY = { x: 0.42, y: 0.5, z: [0.43, 0.47] };
// Sélecteur P152 (cotes de son fichier) : corps 2 1/4 × 3 × 2 po, axe à
// y = −0.035 (local), plan médian zv derrière fût, platine et cale.
const VW = 2.25 * 0.0254, VD = 2.0 * 0.0254, YV = -0.035;
const ZV = -(2 * 0.0254 + 0.012) - 0.375 * 0.0254 - 1.0 * 0.0254 - VD / 2;
const SELP = [
  { p: [-VW / 2, YV + 0.018, ZV], d: [-1, 0, 0], o: [0, -1, -0.3] },
  { p: [-VW / 2, YV - 0.022, ZV], d: [-1, 0, 0], o: [0, -1, -0.3] },
  { p: [0, YV - 0.028, ZV - VD / 2], d: [0, 0, -1], o: [0.4, -1, 0] },
  { p: [0, YV + 0.012, ZV - VD / 2], d: [0, 0, -1], o: [0.4, 1, 0] },
];
// Couloir arrière et passage avant (|x|), hauteurs de retour vers l'avant.
const XB = 0.35, XG = 0.29, YF0 = 1.155, DYF = 0.024;

export const KIT090 = {
  relay: RELAY,
  bulkheads: { '+X': [1.45, 1.4, 1.35, 1.3, 1.25, 1.2], '-X': [1.45, 1.4, 1.35, 1.3, 1.25, 1.2] },
};

export default function P090(api) {
  const Y = [0, 1, 0];
  const H = (ref, L, a, b, opts, e) => slackHose(api, ref, L, 6, a, b, opts, e);
  const up = (x, y, z) => seatOf(union(6), [x, y, z], Y, null, 0);
  const U = KIT084.unions;
  const un = U.z.map((z, i) => seatOf(union(6), [U.x + (i % 2) * 0.008, U.y - i * 0.012, z], Y, null, 1));

  // Rang j (0 = traversée du haut, 1.45) : couloir arrière z (rang avant pour
  // la traversée la plus basse), hauteur de retour vers l'avant yF (la plus
  // haute pour le rang avant : aucun croisement dans le couloir). Passages
  // entre le support −X (y 1.0) et les mamelons de 1.20.
  const ys = TRAV.ys.slice(0, 6);
  const lane = (s, j) => {
    const z = -0.05 - 0.021 * (5 - j), yF = YF0 - DYF * (5 - j);
    const y1 = ys[j] - 0.045;
    const run = y1 - (yF + 0.05) > 0.04 ? [[s * XB, yF + 0.05, z]] : [];
    return { yF, head: [[s * XB, y1, z], ...run, [s * XG, yF, 0.1]] };
  };
  const at = (head, ...k) => k.map((i) => head.length + i);

  // ------------------------------------------------ flanc +X
  // 1 à 4 : traversées 1.20 (j 5) … 1.35 (j 2) → unions 0 … 3 ; boucle sous
  // les unions, devant le vérin et derrière le cadre de P070.
  [['1', 60.5, 5, 0], ['2', 61, 4, 1], ['3', 61.5, 3, 2], ['4', 62, 2, 3]].forEach(([ref, L, j, i]) => {
    const { yF, head } = lane(1, j);
    const zo = 0.175 + 0.02 * i, xu = un[i].p.x;
    H(ref, L, TRAV.outer(1, ys[j]), un[i], {
      vias: [...head, [0.34, yF - 0.01, zo], [0.45, 1.0, zo], [xu - 0.02, 0.96, (zo + U.z[i]) / 2], [xu, 1.06, U.z[i]]],
      move: at(head, 1, 2, 3), dir: [0, -1, 0], w: [0.7, 1, 0.8],
    }, [0.25 + 0.02 * i, 0, 0.12]);
  });
  // 5 : traversées 1.45 / 1.40 → raccords-unions du vérin +X du centreur,
  // descente devant le vérin.
  [0, 1].forEach((j) => {
    const { yF, head } = lane(1, j), zc = RELAY.z[j];
    H('5', 69, TRAV.outer(1, ys[j]), up(RELAY.x, RELAY.y, zc), {
      vias: [...head, [0.31, yF - 0.03, 0.2 + 0.02 * j], [0.31, 0.8, 0.21 + 0.02 * j], [0.36, 0.72, 0.27 + 0.02 * j], [RELAY.x, 0.68, zc]],
      move: at(head, 1, 2), dir: [[0, -1, 0.15], [1, -0.4, -0.2]], w: [0.4, 1],
    }, [0.2, -0.05, 0.25]);
  });

  // ------------------------------------------------ flanc −X
  // 5 : traversées 1.20 / 1.25 (rangs avant) → unions relais de P064.
  [5, 4].forEach((j, k) => {
    const { yF, head } = lane(-1, j), b = up(...U064[k]);
    H('5', 69, TRAV.outer(-1, ys[j]), b, {
      vias: [...head, [-0.33, yF - 0.03, 0.24 + 0.03 * k], [-0.44, 0.8, 0.27 + 0.02 * k], [b.p.x - 0.01, b.p.y + 0.12, b.p.z]],
      move: at(head, 1), dir: [-0.3, -1, 0.1],
    }, [-0.2, -0.05, 0.25]);
  });
  // 6 à 9 : traversées 1.30 (j 3) … 1.45 (j 0) → coudes libres du sélecteur.
  const sel = SELP.map(({ p, d, o }) => {
    const q = seatOf(elbow('orb', 6, 6), p, d, o);
    return { p: q.p.add(v3(KIT060.selector.at)), d: q.d };
  });
  [['9', 82, 0, 0], ['8', 80, 1, 1], ['7', 78, 2, 2], ['6', 76, 3, 3]].forEach(([ref, L, j, i]) => {
    const z = -0.05 - 0.021 * (5 - j), b = sel[i];
    const fromAbove = b.d.y > 0;
    H(ref, L, TRAV.outer(-1, ys[j]), b, {
      vias: [
        [-XB, ys[j] - 0.045, z], [-XB, 1.12 - 0.01 * i, z],
        [-0.46 - 0.012 * i, 1.0, -0.16 - 0.012 * i],
        [-0.48 - 0.012 * i, 0.7, -0.14 - 0.012 * i], // boucle
        fromAbove ? [b.p.x - 0.02, b.p.y + 0.13, b.p.z - 0.06] : [b.p.x - 0.01, b.p.y - 0.13, b.p.z - 0.04],
      ],
      move: [3], dir: [-0.3, -1, -0.3],
    }, [-0.25 - 0.02 * i, -0.05, -0.12]);
  });

  void v3;
  return { view: { dir: [0.2, 0.35, 1.2] } };
}

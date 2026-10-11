// P088 — Trousse de boyaux de la traversée du châssis au mât : CX033198
// « HOSE KIT, BULKHEAD TO MAST » (page 88 : « NO ILLUSTRATION AVAILABLE »),
// repère 20 de l'avance P032. Vingt-six flexibles sertis zingués à écrou
// tournant JIC 37° : vingt-deux -06 (3/8 po, deux tresses compact, Ø 19 mm)
// et quatre -12 (3/4 po, Ø 30 mm). HA06000-L droit / droit : 1 = 121 1/2,
// 2 = 122, 3 = 122 1/2, 4 = 123, 5 = 123 1/2, 6 = 124, 7 = 124 1/2, 8 = 125
// (×2 chacun), 9 = 140 (×2), 10 = 148 (×2), 11 = 180 ; HA06001-146 (12,
// droit / 45°) ; HA12001-154 (13 ×2) et HA12021-154 (14 ×2, autre gamme),
// -12 droit / 45° ; L = longueur hors tout en pouces.
// Repère : celui de P032 (feed.js, mast.js) — axe du mât selon +Y (pied à
// y = 0), face avant vers +Z ; P032 insère la trousse à l'origine.
//
// Raccordements supposés (aucun dessin ni schéma) :
//   · côté châssis : platine de traversée horizontale sous / derrière le
//     pied du mât, dessus à y = −0.30 (KIT088.chassis), unions de traversée
//     debout, sièges hauts vers +Y : deux rangées de cinq -06 par côté
//     (x = ±(0.26 … 0.364), z −0.40 / −0.44), une rangée de quatre -12 et
//     deux -06 côté −X (z −0.48 / −0.52). Embouts 45° de 12, 13 et 14 côté
//     châssis, inclinés vers le mât (+Z) ;
//   · 1 à 10 (×2 : un par flanc, circuit symétrique) : coudes de traversée du
//     mât (P130 repère 7), bouts côté mât (TRAV.inner de _avance_a_hk2.js :
//     x = ±(W/2 + 0.016), z = 0.008, sortie vers −Z) : 1 → 0.25, 2 → 0.30,
//     3 → 0.80, 4 → 0.85, 5 → 1.20, 6 → 1.25, 7 → 1.30, 8 → 1.35,
//     9 → 1.40, 10 → 1.45 ;
//   · 13 / 14 (-12) : unions de traversée -12 de la boucle de tête P156
//     (sièges inférieurs) ; 11 (-06) : sa traversée -06. P156 posé comme le
//     suppose P058 (rangée des -12 à x = −0.32, platine à y = 1.80) : origine
//     (−0.265, 1.80, −0.13), X local → −X, Z local → −Z (KIT088.p156) ;
//   · 12 (-06, 45°) : coude bas du flanc −X du sélecteur P152 (posé par
//     KIT060 en (−0.4, 1.0, 0.1)), tourné vers l'arrière.
// Tracés : faisceau le long des flancs du mât, entre le flanc et le bord
// intérieur du vérin stinger, derrière les mamelons des coudes de traversée :
// couloirs -06 en grille x = ±(0.262 … 0.328) × z (−0.07 … −0.136), le
// boyau du coude le plus bas dans le couloir le plus proche du coude, les
// suivants en diagonale (aucun croisement à la sortie) ; -12 derrière
// (x ±0.27 / ±0.305, z −0.165 / −0.195) jusqu'à y = 1.5 puis vers P156 ; 11
// et 12 derrière le vérin −X (x −0.38 / −0.45). En bas, le faisceau passe
// derrière les oreilles de pivot (z < −0.14 sous y = 0.2) puis descend
// vers la platine ; le mou de chaque boyau forme une boucle pendante derrière
// le pied du mât (boucle de pivot), d'autant plus grande que le boyau est long
// par rapport à son trajet.
// Écarts : les longueurs graduées de 1/2 po ne correspondent pas à l'écart
// des coudes (1.2 m) : le mou est très différent d'un boyau à l'autre ; la
// platine du châssis, P156 et P152 ne sont pas dessinés ici (sièges seuls).
// Encombrement : voir le contrôle (≈ 1.0 × 2.9 × 1.2 m).
import { IN, union, elbow } from './_avance_a.js';
import { TRAV, mount, xs, seatOf, v3 } from './_avance_a_hk2.js';
import { slackHose } from './_avance_a_hk4.js';
import { KIT060 } from './P060.js';

const YC = -0.3; // dessus de la platine du châssis
const T6 = 0.375 * IN; // platine de P156
const M156 = mount([-0.265, 1.8, -0.13], [-1, 0, 0], [0, 1, 0]);
// Unions de traversée de P156 (son repère).
const NB156 = [
  { n: 12, x: 0.055, z: -0.075 }, { n: 12, x: 0.055, z: -0.025 }, { n: 12, x: 0.055, z: 0.025 }, { n: 12, x: 0.055, z: 0.075 },
  { n: 6, x: 0.115, z: -0.03 },
];
// Sélecteur P152 (cotes de P060).
const P152_ZV = -(2 * IN + 0.012) - 0.375 * IN - 1.0 * IN - 1.0 * IN;
const P152_W = 2.25 * IN, P152_YV = -0.035;

// Couloirs -06 (|x|, z) en diagonale depuis le coin le plus proche des coudes.
const LX = [0.262, 0.284, 0.306, 0.328], LZ = [-0.07, -0.092, -0.114, -0.136];
const LANES = [[0, 0], [1, 0], [0, 1], [2, 0], [1, 1], [0, 2], [3, 0], [2, 1], [1, 2], [0, 3]];

export const KIT088 = {
  chassis: {
    y: YC,
    // -06 : x = ±(0.26 + 0.026·k), rangée z −0.40 (k pair) / −0.44 (k impair).
    row06: { x0: 0.26, dx: 0.026, z: [-0.4, -0.44] },
    row12: { x: [-0.27, -0.32, -0.37, -0.42], z: -0.48 },
    extra06: { x: [-0.3, -0.36], z: -0.52 },
  },
  p156: { at: [-0.265, 1.8, -0.13], X: [-1, 0, 0], Y: [0, 1, 0] },
};

export default function P088(api) {
  const Y = [0, 1, 0];
  const up = (n, x, z) => seatOf(union(n, { bulkhead: true }), [x, YC - 0.25 * IN, z], Y, null, 0);
  const tilt = (s, x, z) => ({ ...s, end: '45', t: v3([-x * 0.4, 0, 1]).normalize() });

  // Sièges inférieurs des traversées de P156, dans P032.
  const s156 = NB156.map((b) => xs(M156, seatOf(union(b.n, { bulkhead: true, t: T6 }), [b.x, -T6, b.z], Y, null, 1)));
  // Coude bas du flanc −X du sélecteur, sortie vers l'arrière.
  const sel = (() => {
    const s = seatOf(elbow('orb', 6, 6), [-P152_W / 2, P152_YV - 0.022, P152_ZV], [-1, 0, 0], [0, -0.3, -1]);
    return { p: s.p.add(v3(KIT060.selector.at)), d: s.d };
  })();

  // Boucle de pivot : point bas derrière le pied, déplacé selon LOOP.
  const LOOP = [0, -0.75, -0.66];

  // ------------------------------------------------ 1 à 10 : châssis → coudes du mât
  const refs = [['1', 121.5], ['2', 122], ['3', 122.5], ['4', 123], ['5', 123.5], ['6', 124], ['7', 124.5], ['8', 125], ['9', 140], ['10', 148]];
  const ys = [...TRAV.ys].sort((a, b) => a - b); // 0.25 … 1.45
  for (const s of [1, -1]) {
    refs.forEach(([ref, L], k) => {
      const y = ys[k];
      const [ix, iz] = LANES[k];
      const xl = s * LX[ix], zl = LZ[iz];
      const xb = s * (0.26 + 0.026 * k), zb = k % 2 ? -0.44 : -0.4;
      const a = up(6, xb, zb);
      const vias = [
        [xb, YC + 0.2, zb + 0.01],
        [(xb + xl) / 2, -0.02, -0.36 - 0.006 * k], // boucle
        [xl, 0.17, -0.2 - 0.004 * k],
      ];
      if (y > 0.5) vias.push([xl, 0.32, zl], [xl, y - 0.07, zl]);
      slackHose(api, ref, L, 6, a, TRAV.inner(s, y), { vias, move: [1], dir: LOOP }, [s * (0.12 + 0.012 * k), -0.1, -0.15]);
    });
  }

  // ------------------------------------------------ 13 / 14 : châssis → P156 (-12)
  const c12 = KIT088.chassis.row12;
  [['13', 0], ['13', 1], ['14', 2], ['14', 3]].forEach(([ref, i]) => {
    const xb = c12.x[i], a = tilt(up(12, xb, c12.z), xb, c12.z);
    const b = s156[i];
    const xl = i < 2 ? -0.305 : -0.27, zl = i % 2 ? -0.165 : -0.195;
    slackHose(api, ref, 154, 12, a, b, {
      vias: [
        [(xb + xl) / 2, -0.04, -0.42 - 0.01 * i], // boucle
        [xl, 0.17, -0.235],
        [xl, 0.32, zl], [xl, 1.45, zl], [b.p.x, 1.62, b.p.z],
      ],
      move: [0], dir: LOOP,
    }, [-0.3 - 0.03 * i, -0.1, -0.25]);
  });

  // ------------------------------------------------ 11 / 12 : -06 derrière le vérin −X
  const e06 = KIT088.chassis.extra06;
  const b11 = s156[4];
  slackHose(api, '11', 180, 6, up(6, e06.x[0], e06.z), b11, {
    vias: [
      [-0.36, -0.05, -0.5], // boucle
      [-0.37, 0.2, -0.2], [-0.38, 0.5, -0.1], [-0.38, 1.4, -0.1], [b11.p.x, 1.62, b11.p.z],
    ],
    move: [0], dir: LOOP,
  }, [-0.45, -0.1, -0.2]);
  slackHose(api, '12', 146, 6, tilt(up(6, e06.x[1], e06.z), e06.x[1], e06.z), sel, {
    vias: [
      [-0.42, -0.05, -0.5], // boucle
      [-0.43, 0.2, -0.2], [-0.45, 0.5, -0.12], [-0.46, 0.85, -0.12],
    ],
    move: [0], dir: LOOP,
  }, [-0.55, -0.1, -0.2]);

  return { view: { dir: [-0.9, 0.35, -1.1] } };
}

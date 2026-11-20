// P005 — Table de forage 1500M MA609 (page 5), repère local de la table (layout.js : origine au centre de la face de
// dessus de la plaque, axes du repère foreuse ; posée en TABLE.pos par P002).
// Plaque MA609 (rep. 1) de 1 1/4 po : huit trous des boulons de la tête (HEAD_BOLTS), six trous taraudés des vis de
// pression 1/2-13 × 1 po (rep. 9), deux oreilles à bagues A1412 (rep. 7) au bout arrière, deux butées carrées, bloc
// fendu du côté −Z au bout avant, deux pattes qui descendent entre les longerons du mât jusqu'à la plaque MP6018
// (rep. 5, quatre vis 1/2-13 × 1 po, rep. 12) posée sur la selle du vérin d'avance (P004 rep. 8). De chaque côté :
// côté de table MA613 (rep. 4, tôle pliée en U à bouts relevés, sous le bord de la plaque), téflon MP6021 (rep. 2,
// en L : son aile basse passe sous la semelle haute du mât et s'appuie contre l'âme extérieure), pousse-téflon
// MP6024 (rep. 3), trois vis de pression 1/2-13 × 2 1/2 po (rep. 11) et leurs écrous (rep. 10) à travers le côté.
// Boulons de la tête 3/4-10 × 5 po (rep. 8, têtes sur la semelle de la tête, à 5 po moins plaque et écrou au-dessus
// de la table) et écrous (rep. 13) sous la plaque.
// Cotes : layout.js (TABLE, HEAD_BOLTS, HEAD_BOLT, MAST) et _structure.js (MS, FEED, TB) ; le reste [estimé] en
// ligne. Éclaté comme la p. 5 : boulons et vis de pression vers le haut, côtés, téflons et pousse-téflons vers
// l'extérieur, plaque MP6018 et ses vis vers le bas, écrous des boulons sous la plaque.
import { IN, TABLE, HEAD_BOLTS, HEAD_BOLT } from '../layout.js';
import { MS, FEED, TB, rect, hull, circle, profilX, profilY, profilZ, boxAt, sleeve, setScrewSq, hexAF } from './_structure.js';

const T = TABLE.t;
const Z_WALL = [0.265, 0.275]; // paroi du côté MA613 [estimé]
const Y_FLOOR = -0.09; // dessous du fond du côté MA613 (repère de la table) [estimé]
const TEF = { zi: MS.zw + 0.003, zw: [0.238, 0.252], yLow: [Y_FLOOR + 0.01, 0] }; // téflon en L [estimé]
const PUSH = [0.2535, 0.2635]; // pousse-téflon (z) [estimé]
const SCREW_X = [-0.25, 0, 0.25]; // vis de pression, trois par côté [mesure p. 5]
const HANGER = { z: 0.055, t: 0.5 * IN, x: 0.11 }; // pattes de la plaque MP6018 (±z, épaisseur, demi-longueur) [estimé]

export default function P005(api) {
  const S = api.S;
  const { at, group, box, nut, bolt } = S;
  const hl = TB.hl, hw = TB.hw;
  const yLip = TB.yFlBot; // dessous de la semelle haute du mât (repère de la table)
  const y5 = FEED.saddleTop - TABLE.top; // dessous de la plaque MP6018 (sur la selle du vérin)
  const t5 = 0.5 * IN;

  // 1 — Table MA609.
  const p = [];
  {
    const holes = [...HEAD_BOLTS.map(([x, z]) => [x, z, HEAD_BOLT.d / 2 + 0.001]), ...[-1, 1].flatMap((s) => SCREW_X.map((x) => [x, s * 0.2425, 0.0064]))];
    p.push(profilY(api, rect(-hl, TABLE.z0, hl, TABLE.z1), holes, T, -T / 2)); // dissymétrique : porte toute la tête (TABLE.z0, z1)
  }
  // Oreilles de la charnière du boîtier (bout arrière, axe le long de Z) avec leurs bagues (rep. 7) ; butées carrées.
  const LUGY = 0.042, lugX = -hl + 0.045;
  for (const z of [-0.07, 0.07]) {
    p.push(profilZ(api, hull([[lugX - 0.035, 0], [lugX + 0.035, 0], ...circle([lugX, LUGY], 0.032, 20)]), [[lugX, LUGY, 0.0175]], 0.03, z));
  }
  for (const z of [-0.16, 0.16]) p.push(box(0.06, 0.06, 0.06, 'red', { r: 0.003, pos: [-hl + 0.11, 0.03, z] }));
  // Bloc fendu du côté −Z au bout avant (deux montants et leur entretoise).
  for (const dx of [-0.03, 0.03]) p.push(box(0.03, 0.07, 0.07, 'red', { r: 0.003, pos: [hl - 0.06 + dx, 0.035, -0.2] }));
  p.push(box(0.09, 0.02, 0.07, 'red', { r: 0.003, pos: [hl - 0.06, 0.01, -0.2] }));
  // Pattes de la plaque MP6018 (entre les longerons du mât, sous la plaque).
  for (const s of [-1, 1]) {
    p.push(profilZ(api, rect(-HANGER.x, y5 + t5, HANGER.x, -T), [], HANGER.t, s * HANGER.z));
    p.push(S.weld([[-HANGER.x, -T - 0.002, s * (HANGER.z + HANGER.t / 2 + 0.002)], [HANGER.x, -T - 0.002, s * (HANGER.z + HANGER.t / 2 + 0.002)]], 0.005, 'red'));
  }
  api.part('1', group(...p), [0, 0.15, 0]);

  // 7 — Bagues A1412 (×2, Ø 1,375 × 1,000 × 0,875 po) dans les oreilles arrière.
  for (const z of [-0.07, 0.07]) api.part('7', at(sleeve(api, 0.6875 * IN, 0.5 * IN, 0.875 * IN, 'brass'), [lugX, LUGY, z], [Math.PI / 2, 0, 0]), [-0.15, 0.45, z * 2]);

  for (const s of [-1, 1]) {
    const Z = (z) => s * z;
    // 4 — Côté de table MA613 : paroi, fond et bouts relevés, en une tôle pliée.
    const c = [
      boxAt(api, [-hl + 0.02, Y_FLOOR, Z(Z_WALL[0])], [hl - 0.02, -T, Z(Z_WALL[1])]),
      boxAt(api, [-hl + 0.02, Y_FLOOR, Z(MS.zw + 0.004)], [hl - 0.02, Y_FLOOR + 0.01, Z(Z_WALL[1])]),
      ...[-1, 1].map((u) => boxAt(api, [u * (hl - 0.02) - u * 0.01, Y_FLOOR, Z(MS.zw + 0.004)], [u * (hl - 0.02), Y_FLOOR + 0.035, Z(Z_WALL[0])])),
      S.weld([[-hl + 0.02, -T - 0.002, Z(Z_WALL[1] + 0.002)], [hl - 0.02, -T - 0.002, Z(Z_WALL[1] + 0.002)]], 0.006, 'red'),
    ];
    api.part('4', group(...c), [0, -0.05, s * 0.4]);
    // 2 — Téflon MP6021 en L (blanc) : aile basse sous la semelle haute, aile verticale contre le pousse-téflon.
    const prof = [[TEF.zi, Y_FLOOR + 0.01], [TEF.zw[1], Y_FLOOR + 0.01], [TEF.zw[1], -T - 0.001], [TEF.zw[0], -T - 0.001], [TEF.zw[0], yLip - 0.001], [TEF.zi, yLip - 0.001]];
    api.part('2', profilX(api, prof.map(([z, y]) => [s * z, y]), [], 2 * hl - 0.06, 0, 'white'), [0, -0.05, s * 0.24]);
    // 3 — Pousse-téflon MP6024 (plat d'acier).
    api.part('3', boxAt(api, [-hl + 0.03, Y_FLOOR + 0.012, Z(PUSH[0])], [hl - 0.03, -T - 0.004, Z(PUSH[1])], 'zinc', 0.0015), [0, -0.05, s * 0.32]);
    // 11 — Vis de pression 1/2-13 × 2 1/2 po à travers la paroi (bout sur le pousse-téflon) ; 10 — contre-écrous.
    for (const x of SCREW_X) {
      const yS = (Y_FLOOR + 0.01 - T) / 2;
      api.part('11', at(setScrewSq(api, 0.5 * IN, 2.5 * IN), [x, yS, Z(PUSH[1])], [0, 0, -s * Math.PI / 2]), [0, -0.05, s * 0.62], { noLabel: x !== 0 });
      api.part('10', at(nut(hexAF(0.5 * IN), 0.4375 * IN, 'zinc', { axis: 'z' }), [x, yS, Z(Z_WALL[1] + 0.0056)]), [0, -0.05, s * 0.5], { noLabel: x !== 0 });
    }
    // 9 — Vis de pression 1/2-13 × 1 po verticales (tête carrée sur la table, bout vers le téflon).
    for (const x of SCREW_X) {
      api.part('9', at(setScrewSq(api, 0.5 * IN, 1 * IN), [x, 0.001 - 1 * IN, Z(0.2425)]), [0, 0.35, s * 0.05], { noLabel: x !== 0 });
    }
  }

  // 5 — Plaque MP6018 sous les pattes (sur la selle du vérin d'avance) ; 12 — vis 1/2-13 × 1 po par-dessous.
  const holes5 = [-1, 1].flatMap((u) => [-1, 1].map((s) => [u * 0.08, s * HANGER.z, 0.0068]));
  api.part('5', at(S.plate(0.24, 0.16, t5, 'red', { holes: holes5, r: 0.006 }), [0, y5 + t5 / 2, 0]), [0, -0.4, 0]);
  for (const [x, z] of holes5) api.part('12', bolt(0.5 * IN, 1 * IN, 'zinc', { axis: '-y', pos: [x, y5, z] }), [0, -0.6, 0], { noLabel: !(x > 0 && z > 0) });

  // 8 — Boulons de la tête 3/4-10 × 5 po (tête au-dessus : appui sur la semelle de la tête) ; 13 — écrous dessous.
  const nh = 0.640 * IN; // écrou 3/4-10 [norme]
  const tip = -T - nh - 0.004;
  for (const [x, z] of HEAD_BOLTS) {
    api.part('8', bolt(HEAD_BOLT.d, HEAD_BOLT.len, 'zinc', { pos: [x, tip + HEAD_BOLT.len, z] }), [0, 0.5, 0], { noLabel: !(x > 0.2 && z > 0) });
    api.part('13', at(nut(hexAF(HEAD_BOLT.d), nh, 'zinc'), [x, -T - nh / 2, z]), [0, -0.22, 0], { noLabel: !(x > 0.2 && z > 0) });
  }
  return { view: { dir: [0.9, 0.9, -1.1] } };
}

// P254 — Panneau de coupure des batteries CX032935 rév. 0 (page 254) :
// « ASSY, BATTERY DISCONNECT PANEL », repère 9 de l'ensemble moteur diesel
// P242, posé au-dessus du sélecteur de frein (P252), au bout du caisson de
// batteries. Boîtier en tôle pliée soudée (7) : façade (deux écrous soudés),
// dos, dessus, fond et joue droite percée (interrupteur, contacteur), ouvert
// à gauche où se visse la plaque arrière (6, quatre vis 5/16-18 × 3/4 (9) et
// rondelles NL 5/16 (12)) qui porte à l'intérieur les trois disjoncteurs à
// réarmement : 150 A (2) en haut, deux 40 A (1) dessous. Sur la joue droite :
// coupe-batterie rotatif (3, clé rouge) fixé par deux vis 5/16-18 × 1 (10) et
// rondelles NL (12) ; plaque d'obturation (5) en haut, sur laquelle le
// contacteur 24 V NO/NC (4) est fixé par deux vis 1/4-20 × 1/2 (8) et
// rondelles (11).
// Repère : origine au centre de la face inférieure du boîtier 7 (face
// d'appui sur la plaque de montage formée P242 rep. 6) ; +X vers la joue
// droite (interrupteur, contacteur), Y vers le haut, +Z vers la façade (la
// grande face visible de la page 254). Boîtier 0.178 (X) × 0.216 (Y) ×
// 0.152 (Z) m, plaque arrière en x = -0.089.
// Encombrement ≈ 0.31 (X, de -0.093 à la clé du coupe-batterie) × 0.23 (Y)
// × 0.17 (Z) m.
// Cotes : visserie d'après la liste ; tôlerie et appareils estimés d'après les
// proportions de la page 254 (rien n'est coté). Les disjoncteurs n'ont pas de
// visserie propre dans la liste : fixés par leurs pattes (rivets) sur la face
// intérieure de la plaque 6.

import { ACC, IN } from './_moteur_surpresseur.js';

const I = (v) => v * IN;
const BX = I(7), BY = I(8.5), BZ = I(6), T = I(0.075); // boîtier 14 ga
const TP = I(0.1345); // plaque arrière 10 ga
const XL = -BX / 2; // bord ouvert (plaque 6)
const XR = BX / 2; // joue droite
const SW = [I(0), I(2.6)]; // centre du coupe-batterie (z, y) sur la joue droite
const CT = [I(0), I(6.4)]; // centre de la plaque 5 / du contacteur (z, y)

export const PANEL254 = { size: [BX, BY, BZ] };

export default function P254(api) {
  const { S } = api;
  const { box, cyl, plate, lathe, merged, weld, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);
  // Tôle dans le plan YZ (normale X), centre (x, y, z), trous [z, y, r], découpes [z, y, w, h].
  const wallYZ = (h, d, t, x, y, z, { holes = [], cutouts = [] } = {}) =>
    O(plate(d, h, t, 'grey', { holes, cutouts }), [x, y, z], [1, 0, 0], [0, 0, 1]);

  // ------------------------------------------------------------ 7 — boîtier soudé
  // Façade et dos (plan XY), dessus et fond (plan XZ), joue droite (plan YZ)
  // percée : découpe du coupe-batterie, découpe sous la plaque 5, trous des
  // vis ; pattes repliées à l'intérieur du bord gauche, taraudées pour la
  // plaque 6 ; deux écrous carrés soudés en façade.
  const body = [
    at(plate(BX, BY, T, 'grey'), [0, BY / 2, BZ / 2 - T / 2], [Math.PI / 2, 0, 0]),
    at(plate(BX, BY, T, 'grey'), [0, BY / 2, -BZ / 2 + T / 2], [Math.PI / 2, 0, 0]),
    at(plate(BX, BZ - 2 * T, T, 'grey', { holes: [[BX * 0.3, -BZ * 0.3, I(0.15)]] }), [0, BY - T / 2, 0]),
    at(plate(BX, BZ - 2 * T, T, 'grey'), [0, T / 2, 0]),
    wallYZ(BY, BZ - 2 * T, T, XR - T / 2, BY / 2, 0, {
      cutouts: [[SW[0], SW[1] - BY / 2, I(1.9), I(2.4)], [CT[0], CT[1] - BY / 2, I(1.1), I(2.6)]],
      holes: [[SW[0] - I(1.55), SW[1] - BY / 2, I(0.17)], [SW[0] + I(1.55), SW[1] - BY / 2, I(0.17)],
        [CT[0], CT[1] - BY / 2 + I(1.6), I(0.14)], [CT[0], CT[1] - BY / 2 - I(1.6), I(0.14)], [-I(1.8), I(0.5), I(0.45)], [-I(1.8), -I(1.6), I(0.45)]],
    }),
  ];
  // Pattes de fixation de la plaque 6 (retours de 3/4 po en haut et en bas du bord gauche).
  const tabs = [[I(2.2), I(0.8)], [-I(2.2), I(0.8)], [I(2.2), BY - I(0.8)], [-I(2.2), BY - I(0.8)]];
  for (const [z, y] of tabs) body.push(box(T * 2, I(0.9), I(0.9), 'grey', { pos: [XL + T, y, z] }));
  const nuts = [];
  for (const x of [-I(1.2), I(0.4)]) nuts.push(box(I(0.5), I(0.5), I(0.25), 'zinc', { pos: [x, BY * 0.45, BZ / 2 + I(0.125)] }));
  const beads = [];
  for (const sz of [-1, 1]) beads.push(weld([[XR - T, T, sz * (BZ / 2 - T)], [XR - T, BY - T, sz * (BZ / 2 - T)]], I(0.12), 'grey'));
  P('7', group(merged(body, 'grey'), merged(beads, 'grey'), merged(nuts, 'zinc')), [0, 0, 0]);

  // ------------------------------------------------------------ 6 — plaque arrière
  // 6 1/2 × 9 po, 10 ga, quatre trous 5/16 face aux pattes.
  const PZ = I(6.5), PY = I(9);
  P('6', wallYZ(PY, PZ, TP, XL - TP / 2, BY / 2, 0, { holes: tabs.map(([z, y]) => [z, y - BY / 2, I(0.17)]) }), [-0.24, 0, 0]);

  // ------------------------------------------------------------ 9, 12 — vis 5/16 × 3/4 et rondelles NL
  const nl = I(0.3125) * 0.24;
  for (const [z, y] of tabs) {
    P('12', O(ACC.nordLock(S, 0.3125), [XL - TP, y, z], [-1, 0, 0], [0, 0, 1]), [-0.28, 0, 0]);
    P('9', O(ACC.hhcs(S, 0.3125, 0.75), [XL - TP - nl, y, z], [-1, 0, 0], [0, 0, 1]), [-0.31, 0, 0]);
  }

  // ------------------------------------------------------------ 1, 2 — disjoncteurs (sur la face intérieure de la plaque 6)
  // Boîtier noir 2 1/4 × 1 1/2 × 1 1/8 po, pattes de fixation, deux bornes
  // filetées (écrous laiton), bouton de réarmement jaune.
  const breaker = (amp) => {
    const w = I(2.25), h = I(1.5), d = I(1.1);
    return group(
      merged([box(d, h, w * 0.78, 'plastic', { r: I(0.08), pos: [d / 2, 0, 0] }), box(I(0.08), h * 0.7, w, 'plastic', { pos: [I(0.04), 0, 0] })], 'plastic'),
      merged([-1, 1].flatMap((s) => [at(cyl(I(0.1), I(0.45), 'brass', { axis: 'x', seg: 10 }), [d + I(0.2), 0, s * I(0.48)]), at(S.nut(I(0.375), I(0.16), 'brass', { axis: 'x' }), [d + I(0.08), 0, s * I(0.48)])]), 'brass'),
      at(cyl(I(0.16), I(0.2), amp > 100 ? 'red' : 'safety', { axis: 'x', seg: 14 }), [d + I(0.1), h * 0.32, 0]),
    );
  };
  const xb = XL + I(0.02);
  P('2', at(breaker(150), [xb, I(6.6), -I(0.6)]), [-0.13, 0.03, 0.06]);
  P('1', at(breaker(40), [xb, I(4.6), -I(0.6)]), [-0.13, 0.03, 0.06]);
  P('1', at(breaker(40), [xb, I(2.6), -I(0.6)]), [-0.13, 0.03, 0.06]);

  // ------------------------------------------------------------ 3 — coupe-batterie rotatif
  // Embase moulée noire 4 × 3 po à deux oreilles, corps arrière à deux bornes
  // 3/8 dans le boîtier, clé rouge à ailettes en façade.
  const sw = group(
    merged([
      box(I(0.35), I(2.6), I(4.0), 'black', { r: I(0.25), pos: [I(0.175), 0, 0] }),
      box(I(0.7), I(1.8), I(2.2), 'black', { r: I(0.2), pos: [I(0.7), 0, 0] }),
      box(I(1.6), I(2.0), I(2.4), 'black', { r: I(0.15), pos: [-I(0.8), 0, 0] }),
    ], 'black'),
    merged([-1, 1].flatMap((s) => [at(cyl(I(0.19), I(0.7), 'copper', { axis: 'x', seg: 12 }), [-I(1.9), 0, s * I(0.6)]), at(S.nut(I(0.5625), I(0.3), 'copper', { axis: 'x' }), [-I(1.75), 0, s * I(0.6)])]), 'copper'),
    merged([
      lathe([[0, 0], [I(0.7), 0], [I(0.7), I(0.35)], [I(0.45), I(0.55)], [0, I(0.55)]], 'red', { axis: 'x', seg: 24, pos: [I(1.05), 0, 0] }),
      box(I(0.45), I(2.6), I(0.5), 'red', { r: I(0.12), pos: [I(1.75), 0, 0] }),
    ], 'red'),
  );
  P('3', at(sw, [XR, SW[1], SW[0]]), [0.12, 0, 0]);
  for (const s of [-1, 1]) {
    const p = [XR + I(0.35), SW[1], SW[0] + s * I(1.55)];
    P('12', O(ACC.nordLock(S, 0.3125), p, [1, 0, 0], [0, 0, 1]), [0.18, 0, 0]);
    P('10', O(ACC.hhcs(S, 0.3125, 1.0), [p[0] + nl, p[1], p[2]], [1, 0, 0], [0, 0, 1]), [0.22, 0, 0]);
  }

  // ------------------------------------------------------------ 5 — plaque d'obturation
  const t5 = I(0.075);
  P('5', wallYZ(I(4), I(2), t5, XR + t5 / 2, CT[1], CT[0], { holes: [[0, I(1.6), I(0.14)], [0, -I(1.6), I(0.14)], [-I(0.7), I(1.85), I(0.1)], [I(0.7), -I(1.85), I(0.1)]] }), [0.07, 0, 0]);

  // ------------------------------------------------------------ 4 — contacteur 24 V NO/NC
  // Bride en équerre à deux trous, boîtier cylindrique Ø 2 1/4, deux grosses
  // bornes 5/16 et deux cosses de bobine.
  const x4 = XR + t5;
  const ct = group(
    merged([
      box(I(0.1), I(4.0), I(1.0), 'zinc', { pos: [I(0.05), 0, 0] }),
      box(I(1.1), I(0.1), I(1.0), 'zinc', { pos: [I(0.55), I(1.1), 0] }),
    ], 'zinc'),
    merged([lathe([[0, -I(1.0)], [I(1.1), -I(1.0)], [I(1.12), I(0.9)], [I(0.95), I(1.05)], [0, I(1.05)]], 'black', { seg: 28, pos: [I(1.3), 0, 0] })], 'black'),
    merged([-1, 1].flatMap((s) => [at(cyl(I(0.16), I(0.55), 'copper', { seg: 10 }), [I(1.3), -I(1.25), s * I(0.5)]), at(S.nut(I(0.5), I(0.25), 'copper'), [I(1.3), -I(1.15), s * I(0.5)])]), 'copper'),
    merged([-1, 1].map((s) => at(cyl(I(0.08), I(0.35), 'brass', { seg: 8, axis: 'x' }), [I(2.5), -I(0.4), s * I(0.35)])), 'brass'),
  );
  P('4', at(ct, [x4, CT[1], CT[0]]), [0.16, 0, 0]);
  const tw = I(0.065);
  for (const s of [-1, 1]) {
    const p = [x4 + I(0.1), CT[1] + s * I(1.6), CT[0]];
    P('11', O(ACC.flatWasher(S, 0.25), p, [1, 0, 0], [0, 0, 1]), [0.21, 0, 0]);
    P('8', O(ACC.hhcs(S, 0.25, 0.5), [p[0] + tw, p[1], p[2]], [1, 0, 0], [0, 0, 1]), [0.25, 0, 0]);
  }

  return { view: { dir: [1.1, 0.6, 1.2] } };
}

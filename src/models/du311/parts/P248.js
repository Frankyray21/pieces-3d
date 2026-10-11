// P248 — Trousse de montage du moteur CX028488 rév. 0 (page 248) : « KIT,
// ENGINE MOUNTING », repère 5 de l'ensemble moteur diesel P242 (quatre
// trousses, une sous chacune des quatre pattes du moteur Deutz D914L04).
// Plot antivibratoire conique 270 lb (2) : embase losange en tôle emboutie à
// deux trous de 3/8 po, cône de caoutchouc surmonté d'une coupelle d'appui
// (la patte du moteur s'y pose), fût inférieur de caoutchouc qui traverse le
// support du châssis ; douille centrale pour la vis 1/2-13 × 4 po grade 8 (6)
// qui traverse patte, plot et rondelle de rebond (4) — Nord-Lock 1/2 (1) sous
// la tête et sous l'écrou 1/2-13 (8). L'embase est vissée au support par deux
// vis 3/8-16 × 2 1/4 (5), Nord-Lock 3/8 (3) sous chaque tête et sous chaque
// écrou 3/8-16 (7).
// Repère : origine sur l'axe du plot, au centre de la face inférieure de
// l'embase (face d'appui sur le support du châssis) ; Y vers le haut (le long
// de la vis centrale), X selon l'entraxe des deux trous de l'embase.
//   · Dessus de la coupelle (appui de la patte du moteur) : y = 0.041 ;
//     la patte (épaisseur estimée 3/8 po, non dessinée, P256) occupe
//     y = 0.041 à 0.0505 ; la Nord-Lock et la tête de la vis 6 sont posées
//     dessus.
//   · Support du châssis (non dessiné) estimé à 1 1/4 po d'épaisseur sous
//     l'embase (y = 0 à -0.032) : écrous 7 dessous, d'après la longueur des
//     vis 5 ; le fût inférieur du plot (Ø 2 5/8 po) y passe dans un trou.
// Encombrement ≈ 0.13 (X) × 0.11 (Y, de -0.050 à 0.055) × 0.089 (Z) m.
// Cotes : visserie d'après la liste ; plot proportionné au dessin de la page
// 248 (entraxe des trous de l'embase 3 3/4 po pris pour l'échelle).
// Emplacement dans P242 : sous les pattes du moteur (ENG.feet / ENG.footY de
// _moteur_surpresseur.js) : origine de chaque trousse à (x, ENG.footY - 0.041,
// z) d'une patte dans le repère du moteur, X selon la longueur du moteur.

import { ACC, IN } from './_moteur_surpresseur.js';

const I = (v) => v * IN;
const XH = I(3.75) / 2; // demi-entraxe des trous de l'embase
const TF = I(0.19); // embase
const YC = I(1.62); // dessus de la coupelle
const FOOT = I(0.375); // patte du moteur (non dessinée)
const YL = -I(1.1); // dessous du fût inférieur
const FRAME = I(1.25); // support du châssis (non dessiné)

export const MOUNT248 = { top: YC, foot: FOOT, frame: FRAME, holeX: XH };

export default function P248(api) {
  const { S } = api;
  const { extrude, lathe, at, group, merged } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // ------------------------------------------------------------ 2 — plot antivibratoire
  // Embase : enveloppe convexe d'un disque central et de deux bossages de trou.
  const pts = [];
  const circ = (cx, r, n) => { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; pts.push([cx + r * Math.cos(a), r * Math.sin(a)]); } };
  circ(0, I(1.75), 48); circ(-XH, I(0.55), 24); circ(XH, I(0.55), 24);
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const p of pts) { while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of [...pts].reverse()) { while (hi.length > 1 && cross(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
  const hull = [...lo.slice(0, -1), ...hi.slice(0, -1)];
  const flange = extrude(hull.map(([x, z]) => [x, -z]), TF, 'black', { holes: [[-XH, 0, I(0.205)], [XH, 0, I(0.205)], [0, 0, I(1.25)]] });
  flange.rotation.x = -Math.PI / 2;
  flange.position.y = TF / 2;
  // Cuvette emboutie de l'embase (bord relevé autour du caoutchouc).
  const cup = lathe([[I(1.25), TF * 0.5], [I(1.62), TF * 0.5], [I(1.62), TF + I(0.18)], [I(1.52), TF + I(0.22)], [I(1.25), TF + I(0.2)]], 'black', { seg: 40 });
  // Coupelle supérieure : disque Ø 2 1/2 po, bord rabattu, douille Ø 1/2 traversante.
  const cap = lathe([
    [I(0.27), YC - I(0.16)], [I(1.05), YC - I(0.16)], [I(1.22), YC - I(0.1)], [I(1.25), YC - I(0.03)],
    [I(1.22), YC], [I(0.36), YC], [I(0.36), YC + I(0.03)], [I(0.27), YC + I(0.03)],
  ], 'black', { seg: 40 });
  const sleeve = lathe([[I(0.265), YL + I(0.1)], [I(0.36), YL + I(0.1)], [I(0.36), YC - I(0.1)], [I(0.265), YC - I(0.1)]], 'steel', { seg: 20 });
  // Caoutchouc : cône (Ø 3 po → 2 1/4 po, flanc légèrement creux) et fût inférieur Ø 2 5/8.
  const cone = [[I(0.36), TF + I(0.05)], [I(1.5), TF + I(0.05)], [I(1.5), TF + I(0.2)]];
  for (let i = 1; i <= 8; i++) {
    const t = i / 8;
    cone.push([I(1.5) + (I(1.1) - I(1.5)) * t - I(0.05) * Math.sin(Math.PI * t), TF + I(0.2) + (YC - I(0.16) - TF - I(0.2)) * t]);
  }
  cone.push([I(0.36), YC - I(0.16)]);
  const lower = [[I(0.36), YL + I(0.06)], [I(1.2), YL + I(0.06)], [I(1.3), YL + I(0.16)], [I(1.31), -I(0.05)], [I(1.2), 0], [I(0.36), 0]];
  // Plaque du fond du fût (armature métallique noyée, bord visible).
  const plateB = lathe([[I(0.36), YL], [I(1.15), YL], [I(1.18), YL + I(0.06)], [I(0.36), YL + I(0.06)]], 'black', { seg: 40 });
  P('2', group(
    merged([flange, cup, cap, plateB], 'black'),
    merged([lathe(cone, 'rubber', { seg: 40 }), lathe(lower, 'rubber', { seg: 40 })], 'rubber'),
    sleeve,
  ), [0, 0, 0]);

  // ------------------------------------------------------------ 4 — rondelle de rebond
  // Disque Ø 2 3/4 × 3/16 po, trou Ø 17/32, sous le fût inférieur.
  const tw = I(0.1875);
  P('4', S.washer(I(1.375), I(0.27), tw, 'zinc', { pos: [0, YL - tw / 2, 0] }), [0, -0.05, 0]);

  // ------------------------------------------------------------ 6, 1, 8 — vis centrale 1/2-13 × 4 po
  const nl12 = I(0.5) * 0.24; // épaisseur d'une paire Nord-Lock 1/2
  const yTop = YC + FOOT; // dessus de la patte du moteur
  P('1', at(ACC.nordLock(S, 0.5), [0, yTop, 0]), [0, 0.07, 0]);
  P('6', at(ACC.hhcs(S, 0.5, 4, 'blackOxide'), [0, yTop + nl12, 0]), [0, 0.11, 0]);
  const yB = YL - tw; // dessous de la rondelle de rebond
  P('1', at(group(ACC.nordLock(S, 0.5)), [0, yB, 0], [Math.PI, 0, 0]), [0, -0.09, 0]);
  P('8', at(group(ACC.hexNut(S, 0.5, 'blackOxide')), [0, yB - nl12, 0], [Math.PI, 0, 0]), [0, -0.125, 0]);

  // ------------------------------------------------------------ 5, 3, 7 — vis de l'embase 3/8-16 × 2 1/4
  const nl38 = I(0.375) * 0.24;
  for (const s of [-1, 1]) {
    const x = s * XH;
    P('3', at(ACC.nordLock(S, 0.375), [x, TF, 0]), [0, 0.04, 0]);
    P('5', at(ACC.hhcs(S, 0.375, 2.25), [x, TF + nl38, 0]), [0, 0.08, 0]);
    P('3', at(group(ACC.nordLock(S, 0.375)), [x, -FRAME, 0], [Math.PI, 0, 0]), [s * 0.02, -0.03, 0]);
    P('7', at(group(ACC.hexNut(S, 0.375)), [x, -FRAME - nl38, 0], [Math.PI, 0, 0]), [s * 0.02, -0.055, 0]);
  }

  return { view: { dir: [1, 0.7, 1.3] } };
}

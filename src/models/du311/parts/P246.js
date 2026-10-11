// P246 — Caisson de batteries CX012730 rév. 1 (page 246) : « BATTERY BOX
// ASSEMBLY », repère 4 de l'ensemble moteur diesel P242. Bac en tôle pliée (1)
// — fond, haute paroi arrière percée de quatre boutonnières de fixation,
// petite rehausse avant, joues d'extrémité échancrées pour le passage des
// câbles — coiffé de son capot (1, même repère : dessus, façade et goussets
// d'extrémité en biais, ouvert à l'arrière où il chevauche la paroi du bac).
// Les deux batteries 750 CA (P242 repère 15, groupe 31 : 13 × 6,8 × 9,4 po,
// non dessinées ici) se logent bout à bout ; la bride en T (2 : deux cornières
// posées sur les arêtes des batteries, reliées par un plat transversal) les
// plaque au fond par la tige filetée 3/8-16 (3) qui traverse fond, bride et
// capot entre les deux batteries ; quatre écrous 3/8-16 (4) et quatre
// rondelles Grower 3/8 (5) : sous le fond, sur le fond (contre-écrou), sur la
// bride et sur le capot.
// Repère : origine au centre de la face inférieure du fond du bac (face
// d'appui sur la plaque de montage formée P242 repère 6) ; X le long du bac
// (bout à bout des batteries), Y vers le haut, +Z vers l'avant (côté de la
// rehausse basse et de la façade du capot), paroi arrière à z = -0.096.
// Encombrement ≈ 0.72 (X) × 0.31 (Y, de -0.024 au bout de la tige à 0.305) ×
// 0.20 (Z) m.
// Cotes : tige, écrous, rondelles d'après la liste ; bac et capot estimés
// d'après les batteries groupe 31 et les proportions de la page 246 (rien
// n'est coté).

import { ACC, IN } from './_moteur_surpresseur.js';

const I = (v) => v * IN;
const T = 0.105 * IN; // tôle 12 ga
const LI = I(27.25), WI = I(7.25), H = I(10.5); // intérieur du bac, hauteur paroi arrière
const LO = LI + 2 * T, WO = WI + 2 * T;
const LIP = I(2); // rehausse avant
const BAT = { l: I(13), w: I(6.8), h: I(9.4) };
const CLR = I(0.08); // jeu capot / bac
const LID_H = I(7); // hauteur de la façade du capot
const YT = H + CLR + T; // dessus du capot
const ROD = { y0: -I(0.95), y1: YT + I(0.95) };

// Positions des batteries (centre de leur face inférieure) pour P242.
export const BOX246 = {
  batteries: [[-(BAT.l / 2 + I(0.55)), T, 0], [BAT.l / 2 + I(0.55), T, 0]],
  battery: BAT,
  size: [LO, YT, WO],
};

export default function P246(api) {
  const { S } = api;
  const { plate, extrude, lathe, thread, merged, weld, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Tôle dans le plan XY (normale Z), centrée en (x, y, z) ; trous [x, y, r]
  // et découpes [x, y, w, h] en coordonnées du plan (Y vers le haut).
  const wallXY = (w, h, x, y, z, { holes = [], cutouts = [] } = {}) =>
    at(plate(w, h, T, 'grey', { holes: holes.map(([a, b, r]) => [a, -b, r]), cutouts: cutouts.map(([a, b, cw, ch]) => [a, -b, cw, ch]) }), [x, y, z], [Math.PI / 2, 0, 0]);
  // Tôle dans le plan YZ (normale X) : contour [[z, y], …] extrudé selon X.
  const wallYZ = (pts, x) => {
    const m = extrude(pts.map(([z, y]) => [-z, y]).reverse(), T, 'grey');
    m.rotation.y = Math.PI / 2;
    m.position.x = x;
    return m;
  };

  // ------------------------------------------------------------ 1 — bac
  // Joue d'extrémité : pleine hauteur, coins supérieurs chanfreinés,
  // échancrure en U (Ø 1 1/2 po au fond) au tiers arrière pour les câbles.
  const c = I(0.6), zn = -WO / 2 + WO * 0.36, nw = I(0.8), nd = I(3.4);
  const arcN = [];
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI + (i / 10) * Math.PI;
    arcN.push([zn + nw * Math.cos(a), H - nd + nw + nw * Math.sin(a)]);
  }
  const endWall = [
    [-WO / 2, 0], [WO / 2, 0], [WO / 2, H - c], [WO / 2 - c, H],
    [zn + nw, H], ...arcN.reverse(), [zn - nw, H], [-WO / 2 + c, H], [-WO / 2, H - c],
  ];
  // Boutonnières verticales de la paroi arrière (fixation sur la plaque de montage).
  const slots = [];
  for (const sx of [-1, 1]) for (const y of [I(3.2), I(7.6)]) slots.push([sx * (LI / 2 - I(4.5)), y - H / 2, I(0.42), I(1.0)]);
  const tray = [
    at(plate(LO, WO, T, 'grey', { holes: [[0, 0, I(0.22)]] }), [0, T / 2, 0]),
    wallXY(LO, H, 0, H / 2, -WO / 2 + T / 2, { cutouts: slots }),
    wallXY(LO, LIP, 0, LIP / 2, WO / 2 - T / 2),
    wallYZ(endWall, -LO / 2 + T / 2),
    wallYZ(endWall, LO / 2 - T / 2),
  ];
  // Cordons des angles verticaux (joues soudées au fond plié en U).
  const beads = [];
  for (const sx of [-1, 1]) {
    const x = sx * (LO / 2 - T);
    beads.push(weld([[x, T, -WO / 2 + T], [x, H - c, -WO / 2 + T]], I(0.16), 'grey'));
    beads.push(weld([[x, T, WO / 2 - T], [x, LIP, WO / 2 - T]], I(0.16), 'grey'));
  }

  // ------------------------------------------------------------ 1 — capot
  // Dessus percé au centre (tige 3), façade jusqu'à 7 po sous le dessus,
  // retour arrière de 1 po qui s'accroche sur la paroi du bac, goussets
  // d'extrémité en biais (du coin arrière haut au pied de la façade).
  const LL = LO + 2 * (CLR + T), WL = WO + 2 * CLR + T;
  const zf = WO / 2 + CLR + T / 2; // plan de la façade
  const zb = -WO / 2 - CLR, zF = zf + T / 2;
  const gusset = [[zb, YT], [zF, YT], [zF, YT - LID_H]];
  for (let i = 1; i <= 8; i++) {
    // Bord en biais légèrement creux, comme le trait courbe de la page 246.
    const t = i / 8;
    gusset.push([zF + (zb - zF) * t, YT - LID_H + (LID_H - I(1)) * t - I(0.5) * Math.sin(Math.PI * t)]);
  }
  const lid = [
    at(plate(LL, WL, T, 'grey', { holes: [[0, -(T / 2), I(0.22)]] }), [0, YT - T / 2, T / 2]),
    wallXY(LL, LID_H - T, 0, YT - T - (LID_H - T) / 2, zf),
    wallXY(LL, I(1), 0, YT - T - I(0.5), -WO / 2 - CLR - T / 2),
    wallYZ(gusset, -LL / 2 + T / 2),
    wallYZ(gusset, LL / 2 - T / 2),
  ];
  // Bac et capot : une seule pièce CM41413 (quantité 1), dessinée fermée ;
  // en vue éclatée, la bride, la tige et la visserie sortent par le haut.
  P('1', group(merged([...tray, ...lid], 'grey'), merged(beads, 'grey')), [0, 0, 0]);

  // ------------------------------------------------------------ 2 — bride de maintien
  // Deux cornières 1 1/2 × 1 1/2 × 3/16 po de 10 po, aile horizontale sur
  // l'arête haute des batteries, aile verticale le long de leur flanc ;
  // plat transversal 2 × 1/4 po soudé dessus, percé au centre.
  const yb = T + BAT.h; // dessus des batteries
  const ta = I(0.1875), la = I(1.5), lc = I(10);
  const bracket = [];
  for (const s of [-1, 1]) {
    const zo = s * (WI / 2 - I(0.02));
    // Section en L (aile haute de y = yb à yb + ta).
    const L = s > 0
      ? [[zo - la, yb], [zo - ta, yb], [zo - ta, yb - la + ta], [zo, yb - la + ta], [zo, yb + ta], [zo - la, yb + ta]]
      : [[zo, yb - la + ta], [zo + ta, yb - la + ta], [zo + ta, yb], [zo + la, yb], [zo + la, yb + ta], [zo, yb + ta]];
    const m = extrude(L.map(([z, y]) => [-z, y]).reverse(), lc, 'grey');
    m.rotation.y = Math.PI / 2;
    bracket.push(m);
  }
  const yc = yb + ta + I(0.125);
  bracket.push(at(plate(I(2), WI - I(0.4), I(0.25), 'grey', { holes: [[0, 0, I(0.22)]] }), [0, yc, 0]));
  const bw = [];
  for (const s of [-1, 1]) for (const sx of [-1, 1]) bw.push(weld([[sx * I(1.02), yb + ta + 0.001, s * (WI / 2 - I(1.2))], [sx * I(1.02), yb + ta + 0.001, s * (WI / 2 - I(0.3))]], I(0.18), 'grey'));
  P('2', group(merged(bracket, 'grey'), merged(bw, 'grey')), [0, 0.36, 0]);

  // ------------------------------------------------------------ 3 — tige filetée 3/8-16
  const rr = I(0.375) / 2;
  P('3', lathe([[0, ROD.y0], [rr * 0.85, ROD.y0], ...thread(rr, ROD.y0 + 0.0005, ROD.y1 - 0.0005, { pitch: IN / 16, maxTurns: 40 }), [rr * 0.85, ROD.y1], [0, ROD.y1]], 'zinc', { seg: 10 }), [0, 0.52, 0]);

  // ------------------------------------------------------------ 4, 5 — écrous et rondelles Grower
  const wt = I(0.375) * 0.24; // épaisseur de la rondelle Grower
  // [appui, sens (+1 : vers le haut, -1 : sous la tôle), éclaté]
  const stacks = [
    [0, -1, -0.06], // sous le fond
    [T, 1, 0.5], // contre-écrou sur le fond, à l'intérieur (sort avec la tige)
    [yc + I(0.125), 1, 0.4], // sur la bride
    [YT, 1, 0.62], // sur le capot
  ];
  for (const [y, s, e] of stacks) {
    const w = ACC.splitWasher(S, 0.375);
    const n = ACC.hexNut(S, 0.375);
    if (s > 0) {
      P('5', at(w, [0, y, 0]), [0, e, 0]);
      P('4', at(n, [0, y + wt, 0]), [0, e + 0.03, 0]);
    } else {
      P('5', at(w, [0, y - wt, 0]), [0, e, 0]);
      P('4', at(group(n), [0, y - wt, 0], [Math.PI, 0, 0]), [0, e - 0.03, 0]);
    }
  }

  return { view: { dir: [0.9, 0.75, 1.2] } };
}

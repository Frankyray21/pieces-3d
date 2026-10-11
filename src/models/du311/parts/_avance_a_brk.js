// Bibliothèque commune aux supports amovibles des vérins stinger 50/50 de
// l'avance V30 (P032, repères 23 / 24 / 25) : « REMOVABLE STINGER BRKT -
// HEAVY » CX005385 (P118), CX005391 (P120) et CX005389 (P122). Fichier préfixé
// « _ » : pas un assemblage, non inscrit dans parts/index.js.
//
// Pièce 1 (mécano-soudure peinte) : bras oxycoupé dans une tôle de 2 1/4 po —
// collier à alésage Ø 4 1/2 po (fût du vérin) fendu suivant le diamètre
// transversal, chapeau retenu par deux vis H 5/8 × 4 1/2 (3) vissées dans le
// bras ; flancs du collier rétrécis à 22° vers un bras de 4 po de large (congé
// concave), percé d'un trou de passage Ø 1 1/8 et de quatre taraudages 5/16
// (fixation du clapet d'équilibrage) ; plaque d'about de 1 po soudée au bout du
// bras, raidie par un gousset de 3/4 po dessus (et dessous selon la variante),
// boulonnée au flanc du mât par quatre vis H 5/8 × 2 1/2 (2), rondelles
// Nord-Lock (4) des deux côtés et écrous H (5).
// Variantes (pièce 1) :
//  - 'tall'  (CX005385, P118) : plaque de 8 3/4 po débordant dessus et dessous
//    le bras, gousset dessous, vis aux quatre coins (2 dessus, 2 dessous) ;
//  - 'lug'   (CX005391, P120) : même plaque, plus une oreille de 1 1/2 po à
//    trou Ø 1 1/8 sous le flanc du collier (côté −Z), juste après la fente ;
//  - 'short' (CX005389, P122) : plaque de 6 po débordant surtout au-dessus du
//    bras (1/2 po dessous), sans gousset inférieur, vis en carré 2 × 2 au-dessus
//    du bras.
//
// Repère commun : origine au centre de la face d'appui de la plaque d'about
// (face plaquée contre le mât), à mi-hauteur du bras ; +X le long du bras, de la
// plaque vers le collier (vers l'extérieur du mât) ; Y vers le haut (axe du
// vérin, parallèle à l'axe du mât) ; Z en travers (largeur de la plaque), −Z du
// côté de l'oreille de la variante 'lug'. Bras de y = −1 1/8 à +1 1/8 po ; axe de
// l'alésage (axe du vérin) à x = 12 1/2 po (0.3175 m), z = 0 ; bout du collier à
// x = 15.9 po. La semelle du mât (5/8 po, non modélisée) occupe x ∈ [−5/8, 0].
// Cotes relevées sur les vues isométriques des pages 118 / 120 / 122, échelle
// prise sur l'alésage (Ø 4 1/2 po = fût du vérin de P032) et contrôlée sur la
// boulonnerie 5/8 de la liste.
import * as S from '../../../viewer/shapes.js';
import { IN, hhcs, hexNut, nordLock } from './_avance_a.js';

const u = (v) => v * IN;

// Cotes en pouces
const H = 2.25; // épaisseur du bras (tôle oxycoupée)
const YT = H / 2; // dessus du bras
const TP = 1.0; // plaque d'about
const PW = 4.5; // largeur de la plaque (Z)
const XC = 12.5; // axe de l'alésage
const RB = 2.25; // rayon de l'alésage (fût Ø 4 1/2)
const XE = 15.9; // bout du collier (face des vis 3)
const HW = 4.125; // demi-largeur du collier (8 1/4 po)
const XT = 10.85; // début du rétrécissement des flancs
const AW = 2.0; // demi-largeur du bras (4 po)
const SLOPE = 0.406; // pente des flancs (≈ 22°)
const GAP = 0.06; // trait de scie de la fente du collier
const ZB3 = 3.3; // vis du chapeau, de part et d'autre de l'alésage
const GT = 0.75; // goussets
const GX = 7.9; // pointe du gousset supérieur
const GXL = 8.5; // pointe du gousset inférieur
const MF = 0.625; // semelle du mât (prise des vis 2)

export const BRK = {
  boreX: u(XC), // axe du vérin
  boreR: u(RB),
  endX: u(XE),
  armTop: u(YT),
  plateT: u(TP),
};

// Plaque et vis 2 selon la variante : [y bas, y haut], trous [y, z].
const PLATE = {
  tall: { y: [-4.375, 4.375], holes: [[3.75, -1.5], [3.75, 1.5], [-3.75, -1.5], [-3.75, 1.5]], lower: true },
  lug: { y: [-4.375, 4.375], holes: [[3.75, -1.5], [3.75, 1.5], [-3.75, -1.5], [-3.75, 1.5]], lower: true, lug: true },
  short: { y: [-1.625, 4.375], holes: [[3.75, -1.5], [3.75, 1.5], [2.3, -1.5], [2.3, 1.5]], lower: false },
};

/** Contour remis dans le sens trigonométrique (aire signée > 0). */
function ccw(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    a += x0 * y1 - x1 * y0;
  }
  return a < 0 ? pts.slice().reverse() : pts;
}

/** Arc (x, z) de centre c, rayon r, de a0 à a1 (rad), n pas. */
function arc(cx, cz, r, a0, a1, n) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    out.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
  }
  return out;
}

/**
 * Plaque extrudée selon Y (de y0 à y1, po) d'un contour en plan [[x, z], ...]
 * (po), trous [x, z, r] (po).
 */
function slabY(pts, y0, y1, holes = [], mat = 'grey') {
  const shape = ccw(pts.map(([x, z]) => [u(x), u(-z)]));
  const m = S.extrude(shape, u(y1 - y0), mat, { holes: holes.map(([x, z, r]) => [u(x), u(-z), u(r)]) });
  m.rotation.x = -Math.PI / 2;
  m.position.y = u((y0 + y1) / 2);
  return m;
}
/** Tôle extrudée selon Z (épaisseur t centrée en z = 0) d'un contour [[x, y], ...] (po). */
function slabZ(pts, t, mat = 'grey') {
  return S.extrude(ccw(pts.map(([x, y]) => [u(x), u(y)])), u(t), mat);
}
/** Plaque extrudée selon X (de x0 à x1) d'un contour [[z, y], ...], trous [z, y, r] (po). */
function slabX(pts, x0, x1, holes = [], mat = 'grey') {
  // rotation.y = +90° : x local → −z, z local (épaisseur) → +x.
  const shape = ccw(pts.map(([z, y]) => [u(-z), u(y)])).map((p) => p);
  const m = S.extrude(shape, u(x1 - x0), mat, { holes: holes.map(([z, y, r]) => [u(-z), u(y), u(r)]) });
  m.rotation.y = Math.PI / 2;
  m.position.x = u((x0 + x1) / 2);
  return m;
}
const W = (pts) => pts.map(([x, y, z]) => [u(x), u(y), u(z)]);

/** Flanc du bras côté +z (demi-contour, de la plaque vers le collier). */
function flank() {
  // Bras droit de 4 po, congé concave (Bézier quadratique) puis flanc à 22°.
  const pts = [[TP - 0.05, AW]];
  const p0 = [4.4, AW], c = [XT - (HW - AW) / SLOPE, AW], z1 = 2.56;
  const p1 = [XT - (HW - z1) / SLOPE, z1];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const x = (1 - t) ** 2 * p0[0] + 2 * t * (1 - t) * c[0] + t * t * p1[0];
    const z = (1 - t) ** 2 * p0[1] + 2 * t * (1 - t) * c[1] + t * t * p1[1];
    pts.push([x, z]);
  }
  pts.push([XT, HW]);
  return pts;
}

/**
 * Construit l'ensemble (pièces 1 à 5) dans le repère décrit en tête.
 * variant : 'tall' (P118), 'lug' (P120), 'short' (P122).
 */
export function stingerBracket(api, variant) {
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const V = PLATE[variant];
  const parts1 = [];
  const beads = [];
  const ws = 0.3; // cordons d'angle de 5/16 po

  // ---------------------------------------------------------------- 1 — support
  // Bras : contour en plan jusqu'à la fente (demi-alésage), symétrique en z.
  const fl = flank();
  const xs = XC - GAP / 2;
  const body = [
    ...fl,
    [xs, HW],
    ...arc(xs, 0, RB, Math.PI / 2, (3 * Math.PI) / 2, 24).map(([x, z]) => [x, z]),
    [xs, -HW],
    ...fl.slice().reverse().map(([x, z]) => [x, -z]),
  ];
  // Trou de passage Ø 1 1/8 devant la pointe du gousset, quatre taraudages 5/16.
  const holes = [[8.9, 0, 0.5625], [9.2, 2.55, 0.135], [9.2, -2.55, 0.135], [8.25, 2.0, 0.135], [8.25, -2.0, 0.135]];
  parts1.push(slabY(body, -YT, YT, holes));
  // Chapeau du collier (au-delà de la fente).
  const xk = XC + GAP / 2;
  parts1.push(slabY([
    [xk, -HW], [XE, -HW], [XE, HW], [xk, HW],
    ...arc(xk, 0, RB, Math.PI / 2, -Math.PI / 2, 24),
  ], -YT, YT));

  // Plaque d'about percée des quatre trous Ø 11/16.
  const [py0, py1] = V.y;
  parts1.push(slabX([[-PW / 2, py0], [PW / 2, py0], [PW / 2, py1], [-PW / 2, py1]], 0, TP,
    V.holes.map(([y, z]) => [z, y, 0.344])));

  // Gousset supérieur : pointe de 0,39 po sur le bras, monte jusqu'au haut de la plaque.
  parts1.push(slabZ([[TP, YT], [GX, YT], [GX, YT + 0.39], [TP, py1]], GT));
  for (const s of [-1, 1]) {
    beads.push(W([[TP + 0.1, YT, s * GT / 2], [GX - 0.1, YT, s * GT / 2]]));
    beads.push(W([[TP, YT + 0.1, s * GT / 2], [TP, py1 - 0.15, s * GT / 2]]));
  }
  // Gousset inférieur (variantes à grande plaque).
  if (V.lower) {
    parts1.push(slabZ([[TP, -YT], [TP, py0], [TP + 0.3, py0], [GXL, -YT - 0.3], [GXL, -YT]], GT));
    for (const s of [-1, 1]) {
      beads.push(W([[TP + 0.1, -YT, s * GT / 2], [GXL - 0.1, -YT, s * GT / 2]]));
      beads.push(W([[TP, -YT - 0.1, s * GT / 2], [TP, py0 + 0.15, s * GT / 2]]));
    }
  }
  // Bras soudé tout autour sur la plaque (cordon interrompu par les goussets).
  for (const y of [YT, -YT]) {
    for (const s of [-1, 1]) beads.push(W([[TP, y, s * (GT / 2 + 0.15)], [TP, y, s * (AW - 0.05)]]));
  }
  for (const s of [-1, 1]) beads.push(W([[TP, -YT + 0.1, s * AW], [TP, YT - 0.1, s * AW]]));

  // Oreille (variante 'lug') : tôle de 1 1/2 po sous le flanc −z du collier,
  // bout arrondi R 1 1/4, trou Ø 1 1/8 à 1.85 po du flanc.
  if (V.lug) {
    const xl = XT, zl = -(HW + 1.85), rl = 1.25, y0 = -YT + 0.25, y1 = y0 + 1.5;
    const zin = -(HW - 0.6);
    parts1.push(slabY([
      [xl - rl, zin], [xl + rl, zin],
      ...arc(xl, zl, rl, 0, -Math.PI, 20),
    ], y0, y1, [[xl, zl, 0.5625]]));
    // Cordons dessus et dessous le long du flanc (droit côté collier, à 22° ensuite).
    const zFl = (x) => -(x >= XT ? HW : HW - SLOPE * (XT - x));
    for (const y of [y1, y0]) {
      beads.push(W([[xl - rl + 0.1, y, zFl(xl - rl + 0.1) - 0.02], [XT, y, -HW - 0.02], [xl + rl - 0.1, y, -HW - 0.02]]));
    }
  }

  const welds = S.merged(beads.map((b) => S.weld(b, u(ws), 'grey')), 'grey');
  welds.geometry.userData.edgeAngle = 75;
  P('1', S.group(S.merged(parts1, 'grey'), welds), [0, 0, 0]);

  // ---------------------------------------------------------------- visserie
  const d = 0.625 * IN;
  const wt = u(0.125); // paire Nord-Lock (2 × 0,056 po + cames)
  // 3 — vis H 5/8 × 4 1/2 du chapeau, tête sur le bout du collier, axe X ;
  // 4 — Nord-Lock sous la tête.
  for (const z of [-ZB3, ZB3]) {
    P('3', hhcs(d, u(4.5), [u(XE) + wt, 0, u(z)], [1, 0, 0]), [0.16, 0, 0]);
    P('4', nordLock(d, [u(XE) + wt / 2, 0, u(z)], [1, 0, 0]), [0.08, 0, 0]);
  }
  // 2 — vis H 5/8 × 2 1/2 de la plaque d'about, tête côté bras (+X), écrou (5)
  // derrière la semelle du mât ; 4 — Nord-Lock sous la tête et sous l'écrou.
  const nh = d * 0.86;
  for (const [y, z] of V.holes) {
    const Y = u(y), Z = u(z);
    P('2', hhcs(d, u(2.5), [u(TP) + wt, Y, Z], [1, 0, 0]), [0.14, 0, 0]);
    P('4', nordLock(d, [u(TP) + wt / 2, Y, Z], [1, 0, 0]), [0.075, 0, 0]);
    P('4', nordLock(d, [-u(MF) - wt / 2, Y, Z], [-1, 0, 0]), [-0.075, 0, 0]);
    P('5', hexNut(d, [-u(MF) - wt - nh / 2, Y, Z], [-1, 0, 0]), [-0.13, 0, 0]);
  }
  return { view: { dir: [1, 0.85, -1.05] } };
}

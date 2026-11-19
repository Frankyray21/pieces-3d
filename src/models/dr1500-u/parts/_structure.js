// Assistants du lot A (structure de la DR1500-U) : tôles découpées et extrudées, visserie des listes, cotes
// internes partagées entre l'assise (P003), le mât (P004), la table (P005), le kit de poulie (P006) et les pièces de
// l'ensemble (ensemble-pieces.js). Les cotes d'interface communes aux autres lots restent dans ../layout.js ; ce
// fichier ne contient que des cotes propres au lot A (source en bout de ligne, comme dans layout.js).
import { IN, MAST, ASSISE, TABLE, POULIE } from '../layout.js';

// ---------------------------------------------------------------------------------------------------------
// Section du mât MA601 (P004), repère foreuse. Deux longerons-caissons ouverts entre eux (le vérin d'avance est
// logé au milieu, les pattes de la table y descendent) :
//   semelle basse |z| 0,11 à 0,23 (largeur hors tout MAST.w), débordant de 50 mm à l'extérieur de l'âme : c'est elle
//   que les clamps de l'assise (P003 rep. 2) crochètent ;
//   semelle haute |z| 0,11 à 0,205 (sous les plaques d'usure, débord extérieur de 25 mm : les téflons de la table
//   crochètent dessous) ; âmes |z| 0,11–0,12 et 0,17–0,18. [estimé : la vue p. 4 montre deux caissons à fond ouvert]
// La semelle haute s'arrête à 0,205 pour laisser passer sous la table les écrous des boulons de la tête
// (HEAD_BOLTS à |z| 0,22, layout.js).
export const MS = {
  fl: 0.75 * IN, // épaisseur des semelles [estimé]
  web: 0.375 * IN, // épaisseur des âmes [estimé]
  zi: 0.11, zw: 0.17, zt: 0.205, zb: MAST.w / 2, // âme intérieure, âme extérieure, bord des semelles haute et basse
  wear: { t: 0.5 * IN, w: 0.07 }, // plaques d'usure MP6019 (vis fraisées 1/2-13 × 3/4 po) [estimé]
  get yTop() { return MAST.top - this.wear.t; }, // dessus de la semelle haute
  get yTopB() { return this.yTop - this.fl; }, // dessous de la semelle haute
  get yBot() { return MAST.bottom + this.fl; }, // dessus de la semelle basse
  xWear: [MAST.xFoot - MAST.len + 0.03, MAST.xFoot - 0.52], // plaques d'usure, du bout arrière à la portée du serre-tiges
};

// Vérin d'avance DR-FE3560H (P004 rep. 8) : tige en avant sur la pin MA611, fût accroché sous la table par une
// selle (plaque MP6018, P005 rep. 5) ; vérin fermé quand la table est en avant (pose de la couverture).
export const FEED = {
  y: MAST.bottom + 0.07, // axe [estimé : la pin MA611 traverse le bas des longerons, p. 4]
  pinX: MAST.xFoot - 0.1, // axe de la pin MA611 [mesure p. 4]
  r: 0.054, // rayon du fût : alésage 3 1/2 po, tube de 4 1/4 po [estimé]
  rodR: 1.0 * IN, // tige Ø 2 po [estimé]
  closed: 73 * IN, // de l'axe de l'œil au fond, vérin fermé (course 60 + 13 po) [estimé, layout.js]
  get saddleTop() { return this.y + this.r + 0.015; }, // dessus de la selle du fût = dessous de la plaque MP6018
};

// Vérin d'avance du mât HCL-2548 / DR-HCL2536 (P003 rep. 8) : 2 1/2 po × 36 po, fermé (mât rentré), sous la tôle de
// dessus de l'assise ; fond sur la languette arrière de l'assise, tige sur la languette sous le mât (P004).
export const HCL = {
  y: ASSISE.top - 0.065, // axe [estimé : juste sous la tôle de 3/4 po]
  xBase: ASSISE.x0 + 0.1, // pin MA621 du fond [estimé]
  len: 48 * IN, // entraxe des pins, vérin fermé : course 36 + 12 po [estimé]
  get xRod() { return this.xBase + this.len; }, // pin MA621 de la tige (languette du mât)
  bore: 2.5 * IN, // [manuel : désignation]
};

// Kit de poulie (P006) : flasque principal MA616 du côté +Z des poulies, pivot (boulon rep. 14) dans deux oreilles
// soudées derrière la plaque d'about du mât (P004). Repère local de P006 (origine sur l'axe de la poulie avant).
export const PF = {
  z: [0.054, 0.054 + 0.5 * IN], // faces du flasque principal [estimé]
  lower: [-0.12, -1.03], // axe de la poulie arrière #2, sous le mât [mesure grossière sur la couverture]
  pivot: [0.01, -0.6], // axe du boulon de bascule (rep. 14) [estimé : mi-hauteur du mât]
  ears: [[0.041, 0.053], [0.07, 0.082]], // oreilles du mât qui encadrent le flasque (z) [estimé]
  springY: -0.4, // axe du fourreau du ressort (rep. 15), au-dessus du mât [estimé]
  get pivotAbs() { return [POULIE.pos[0] + this.pivot[0], POULIE.pos[1] + this.pivot[1]]; },
};
export const END_TOP = MAST.top + 0.2; // dessus de la plaque d'about arrière du mât (couverture) [mesure]

// Table (P005), repère local de la table : cotes du crochetage sous la semelle haute du mât.
export const TB = {
  get yMast() { return MAST.top - TABLE.top; }, // dessus des plaques d'usure (= dessous de la table)
  get yFlTop() { return MS.yTop - TABLE.top; },
  get yFlBot() { return MS.yTopB - TABLE.top; },
  hl: TABLE.len / 2, hw: TABLE.w / 2,
};

// ---------------------------------------------------------------------------------------------------------
// Géométrie plane.
export const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
/** Points d'un arc de cercle (centre c, rayon r, de a0 à a1 en radians, n segments). */
export const arc = (c, r, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, k) => {
  const a = a0 + ((a1 - a0) * k) / n;
  return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
});
export const circle = (c, r, n = 24) => arc(c, r, 0, 2 * Math.PI * (1 - 1 / n), n - 1);
/** Enveloppe convexe (sens trigonométrique). */
export function hull(pts) {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of [...p].reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
}
/** Trou oblong (polygone) d'axes c, demi-longueur l (le long de u = angle a), rayon r. */
export const slot = (c, l, r, a = 0) => {
  const u = [Math.cos(a), Math.sin(a)];
  const e1 = [c[0] + u[0] * l, c[1] + u[1] * l], e0 = [c[0] - u[0] * l, c[1] - u[1] * l];
  return [...arc(e1, r, a - Math.PI / 2, a + Math.PI / 2, 8), ...arc(e0, r, a + Math.PI / 2, a + 1.5 * Math.PI, 8)].reverse();
};
/** Polygone décalé (point par point) : sert aux tôles pliées tracées par leur ligne moyenne. */
export function band(line, t) {
  const n = line.length, off = [];
  for (let i = 0; i < n; i++) {
    const a = line[Math.max(0, i - 1)], b = line[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    off.push([line[i][0] - (dy / L) * t, line[i][1] + (dx / L) * t]);
  }
  return [...line, ...off.reverse()];
}

// ---------------------------------------------------------------------------------------------------------
// Tôles et profils extrudés (arêtes cassées par S.extrude).
/** Profil du plan XY extrudé selon Z (épaisseur t centrée en z) ; trous : cercles [x, y, r] ou polygones. */
export const profilZ = (api, outline, holes, t, z = 0, mat = 'red') => api.S.at(api.S.extrude(outline, t, mat, { holes }), [0, 0, z]);
/** Tôle de normale X (épaisseur t centrée en x) : contour et trous dans le plan (z, y). */
export const profilX = (api, outline, holes, t, x = 0, mat = 'red') => api.S.at(api.S.extrude(outline.map(([z, y]) => [-z, y]), t, mat,
  { holes: holes.map((h) => (Array.isArray(h[0]) ? h.map(([z, y]) => [-z, y]) : [-h[0], h[1], h[2]])) }), [x, 0, 0], [0, Math.PI / 2, 0]);
/** Tôle de normale Y (épaisseur t centrée en y) : contour et trous dans le plan (x, z). */
export const profilY = (api, outline, holes, t, y = 0, mat = 'red') => api.S.at(api.S.extrude(outline.map(([x, z]) => [x, -z]), t, mat,
  { holes: holes.map((h) => (Array.isArray(h[0]) ? h.map(([x, z]) => [x, -z]) : [h[0], -h[1], h[2]])) }), [0, y, 0], [-Math.PI / 2, 0, 0]);
/** Barre de section w × t (t selon Z) entre deux points du plan XY. */
export const strut = (api, p, q, w, t, z, mat = 'red', e = 0) => {
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
  return api.S.at(api.S.box(L + 2 * e, w, t, mat, { r: 0.003 }), [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, z], [0, 0, Math.atan2(q[1] - p[1], q[0] - p[0])]);
};
/** Boîte entre deux coins [x0, y0, z0] et [x1, y1, z1]. */
export const boxAt = (api, a, b, mat = 'red', r = 0.002) => api.S.box(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), Math.abs(b[2] - a[2]), mat,
  { r, pos: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2] });

// ---------------------------------------------------------------------------------------------------------
// Visserie des listes (pouces → mètres ; dimensions ASME B18 [norme]).
/** Surplat des écrous et têtes hexagonales selon le diamètre (1/2 → 3/4 po, 5/8 → 15/16, 3/4 → 1 1/8). */
export const hexAF = (d) => d * 1.5;
/** Vis à tête fraisée à six pans creux (tête affleurante à l'origine, tige vers −Y). */
export function flatHead(api, d, len, mat = 'blackOxide') {
  const r = d / 2, R = d; // tête Ø 2 d, angle 82°
  const h = (R - r) / Math.tan((41 * Math.PI) / 180);
  const g = api.S.group(
    api.S.lathe([[0, -len], [r * 0.92, -len], [r, -len + r * 0.15], [r, -h], [R, 0], [0, 0]], mat, { seg: 16 }),
    api.S.cyl(R * 0.42, 0.0008, 'black', { seg: 6, pos: [0, 0.0002, 0] }),
  );
  return g;
}
/** Vis de pression à tête carrée et bout cuvette (tête vers +Y, bout à l'origine). */
export function setScrewSq(api, d, len, mat = 'zinc') {
  const r = d / 2, a = d * 0.75, h = d * 0.75;
  return api.S.group(
    api.S.lathe([[0, 0.0015], [r * 0.6, 0], [r, 0.002], ...api.S.thread(r, 0.004, len - 0.001, { pitch: d * 0.15, maxTurns: 6 }), [r, len], [0, len]], mat, { seg: 12 }),
    api.S.box(2 * a * 0.72, h, 2 * a * 0.72, mat, { r: 0.0015, pos: [0, len + h / 2, 0] }),
  );
}
/** Douille lisse (bague) le long de Y, collerette optionnelle en haut. */
export function sleeve(api, rOut, rIn, len, mat = 'brass', { flange = 0, flangeT = 0 } = {}) {
  const p = [[rIn, -len / 2], [rOut, -len / 2], [rOut, len / 2 - flangeT]];
  if (flange) p.push([flange, len / 2 - flangeT], [flange, len / 2]); else p.push([rOut, len / 2]);
  p.push([rIn, len / 2], [rIn, -len / 2]);
  return api.S.lathe(p, mat, { seg: 28 });
}
/** Anneau élastique (circlip) le long de Y, avec ses deux oreilles. */
export function snapRing(api, rIn, w, t, mat = 'blackOxide') {
  return api.S.group(
    api.S.ring(rIn + w, rIn, t, mat, { seg: 28 }),
    api.S.box(w * 1.2, t, w * 1.6, mat, { r: 0.0005, pos: [-w * 0.2, 0, rIn + w * 0.4] }),
  );
}
/** Pin d'articulation le long de Y : tige de rayon r et longueur len (de y = 0 vers −Y), tête à collerette en haut. */
export function headPin(api, r, len, mat = 'steel', { headR = r * 1.6, headT = r * 0.6, hole = true } = {}) {
  const g = api.S.group(api.S.lathe([[0, -len], [r * 0.85, -len], [r, -len + r * 0.15], [r, 0], [headR, 0], [headR, headT * 0.8], [headR * 0.92, headT], [0, headT]], mat, { seg: 24 }));
  if (hole) g.add(api.S.cyl(r * 0.18, 2 * r + 0.002, 'black', { axis: 'x', seg: 8, pos: [0, -len + r * 1.2, 0] }));
  return g;
}

/**
 * Vérin entre deux axes d'articulation a et b du plan XY (à z), œil de fond en a, œil de tige en b ; hydCylinder
 * de la bibliothèque, mêmes bouts. rod : fraction de l'entraxe occupée par la tige sortie.
 */
export function verin(api, a, b, z, bore, { rodR, rod = 0.4, mat = 'black' } = {}) {
  const r = bore / 2;
  rodR = rodR ?? r * 0.55;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const len = L - 0.6 * r - 0.9 * rodR;
  const c = api.S.hydCylinder(len, bore, { material: mat, rodR, ext: rod, eyes: 'eye' });
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const g = api.S.group(api.S.at(c, [0.6 * r, 0, 0]));
  return api.S.at(g, [a[0], a[1], z], [0, 0, ang]);
}

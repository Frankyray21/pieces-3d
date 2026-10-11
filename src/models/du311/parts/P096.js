// P096 — Butée du centreur V30 CX030894 rév. 0 (page 96) : « ASSEMBLY, V30
// CENTRALIZER STOP ». Deux butées (repère 2 de P092) arrêtent le pivotement
// du centreur fendu sur le pied de mât. Mécano-soudure (1) : semelle de
// 1/2 po aux coins avant arrondis, dosseret arrondi en haut, deux goussets
// triangulaires et, au dos du dosseret, une contre-plaque plus large dont les
// oreilles reçoivent deux vis ; trois vis traversent la semelle. Cinq vis H
// 1/2-13 × 1 3/4 po (2), dix rondelles plates SAE 1/2 (3, sous chaque tête
// et sous chaque écrou), cinq écrous H 1/2-13 (4), tous zingués Gr 8.
// Repère : origine au centre de la face inférieure de la semelle (face
// d'appui), Y normal à la semelle vers le dosseret (haut du dessin) ; Z selon
// la profondeur de la semelle, dosseret et contre-plaque vers -Z, coins
// arrondis vers +Z ; X en travers, goussets à ±X. Encombrement ≈ 0.173 (X,
// contre-plaque) × 0.169 (Y, de -0.029 sous les écrous à +0.140) × 0.183
// (Z, de -0.113 aux écrous arrière à +0.070) m.
// Cotes : vis, rondelles, écrous (liste) ; mécano-soudure d'après les
// proportions de l'isométrie (tête de vis 3/4 po sur plat pour l'échelle) :
// semelle 4 1/2 × 5 1/2 po, dosseret 3 1/2 × 5 po, contre-plaque 6 3/4 × 3 po.
// Les pièces serrées (non fournies) sont supposées de 1/2 po.
import { u, along, hhcs, hexNut, flatWasher } from './_avance_b.js';

const T = 0.5; // tôles (po)
const W = 4.5, D = 5.5; // semelle
const ZB = -D / 2; // arrière de la semelle
const BP = { w: 3.5, h: 5.0 }; // dosseret, posé sur la semelle
const PAD = { w: 6.75, y0: 2.5, y1: 5.5 }; // contre-plaque au dos du dosseret
const BASE_HOLES = [[-0.85, -0.7], [0.85, -0.7], [0.55, 1.65]]; // [x, z] (po)
const PAD_HOLES = [-2.85, 2.85]; // x des trous des oreilles, à y = 4
const GRIP = 0.5; // pièce serrée supposée

export const STOP096 = {
  baseHoles: BASE_HOLES.map(([x, z]) => [u(x), 0, u(z)]), // axes selon Y
  padHoles: PAD_HOLES.map((x) => [u(x), u(4), u(ZB - T)]), // axes selon Z, face arrière
  backFaceZ: u(ZB - T), // dos de la contre-plaque (face d'appui arrière)
};

export default function P096(api) {
  const { THREE, S } = api;
  const { extrude, merged, group, at, weld } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v = (x, y, z) => [u(x), u(y), u(z)];
  const arc = (cx, cy, r, a0, a1, n = 8) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  // Contour [x, y] (po) extrudé selon Z, centré sur zc.
  const slabZ = (pts, zc, t, holes = []) => {
    const m = extrude(pts.map(([x, y]) => [u(x), u(y)]), u(t), 'grey', { holes: holes.map(([x, y, r]) => [u(x), u(y), u(r)]) });
    m.position.z = u(zc);
    return m;
  };
  // Contour [x, z] (po) extrudé selon Y de y0 à y0 + t.
  const slabY = (pts, y0, t, holes = []) => {
    const m = extrude(pts.map(([x, z]) => [u(x), -u(z)]), u(t), 'grey', { holes: holes.map(([x, z, r]) => [u(x), -u(z), u(r)]) });
    m.rotation.x = -Math.PI / 2;
    m.position.y = u(y0 + t / 2);
    return m;
  };
  // Contour [z, y] (po) extrudé selon X, centré sur xc.
  const slabX = (pts, xc, t) => {
    const m = extrude(pts.map(([z, y]) => [-u(z), u(y)]).reverse(), u(t), 'grey');
    m.rotation.y = Math.PI / 2;
    m.position.x = u(xc);
    return m;
  };

  // ------------------------------------------------ 1 — mécano-soudure
  const R = 0.75;
  const base = slabY([
    [-W / 2, ZB], [W / 2, ZB], ...arc(W / 2 - R, D / 2 - R, R, 0, Math.PI / 2), ...arc(-W / 2 + R, D / 2 - R, R, Math.PI / 2, Math.PI),
  ], 0, T, BASE_HOLES.map(([x, z]) => [x, z, 0.28]));
  const back = slabZ([
    [-BP.w / 2, T], [BP.w / 2, T], ...arc(BP.w / 2 - R, T + BP.h - R, R, 0, Math.PI / 2), ...arc(-BP.w / 2 + R, T + BP.h - R, R, Math.PI / 2, Math.PI),
  ], ZB + T / 2, T);
  const c = 0.5;
  const pad = slabZ([
    [-PAD.w / 2 + c, PAD.y0], [PAD.w / 2 - c, PAD.y0], [PAD.w / 2, PAD.y0 + c], [PAD.w / 2, PAD.y1 - c],
    [PAD.w / 2 - c, PAD.y1], [-PAD.w / 2 + c, PAD.y1], [-PAD.w / 2, PAD.y1 - c], [-PAD.w / 2, PAD.y0 + c],
  ], ZB - T / 2, T, PAD_HOLES.map((x) => [x, 4, 0.28]));
  // Goussets : pied le long de la semelle jusqu'à 1/2 po du bord avant,
  // dos contre le dosseret, hypoténuse et pointe adoucies.
  const gz0 = ZB + T, gz1 = D / 2 - 0.5, gy1 = T + BP.h - 0.4;
  const gusset = [[gz0, T], [gz1, T], [gz1, T + 0.6], ...arc(gz1 - 0.9, T + 0.6, 0.9, 0, Math.PI * 0.3, 4), [gz0 + 0.7, gy1], [gz0, gy1]];
  const gx = BP.w / 2 + T / 2;
  const gussets = [-gx, gx].map((x) => slabX(gusset, x, T));
  // Cordons : goussets / semelle et dosseret, dosseret / semelle.
  const s = 0.22;
  const welds = [];
  for (const x of [-gx, gx]) {
    for (const xi of [x - T / 2 - 0.08, x + T / 2 + 0.08]) {
      welds.push(weld([v(xi, T + 0.08, gz0 + 0.1), v(xi, T + 0.08, gz1 - 0.1)], u(s), 'grey'));
      welds.push(weld([v(xi, T + 0.1, gz0 + 0.08), v(xi, gy1 - 0.2, gz0 + 0.08)], u(s), 'grey'));
    }
  }
  welds.push(weld([v(-BP.w / 2 + T, T + 0.08, gz0 + 0.08), v(BP.w / 2 - T, T + 0.08, gz0 + 0.08)], u(s), 'grey'));
  welds.push(weld([v(-BP.w / 2, PAD.y0 - 0.08, ZB - 0.08), v(BP.w / 2, PAD.y0 - 0.08, ZB - 0.08)], u(s), 'grey'));
  const beads = merged(welds, 'grey');
  beads.geometry.userData.edgeAngle = 75;
  P('1', group(merged([base, back, pad, ...gussets], 'grey'), beads), [0, 0, 0]);

  // ------------------------------------------------ 2, 3, 4 — boulonnerie
  // Semelle : tête et rondelle dessus, rondelle et écrou sous la pièce
  // serrée ; contre-plaque : tête côté avant (+Z) sur l'oreille, écrou au dos.
  const wt = 0.065; // épaisseur des rondelles SAE 1/2 (po)
  const joints = [
    ...BASE_HOLES.map(([x, z]) => ({ dir: [0, 1, 0], p: (d) => v(x, T + d, z) })),
    ...PAD_HOLES.map((x) => ({ dir: [0, 0, 1], p: (d) => v(x, 4, ZB - T + T + d) })),
  ];
  for (const { dir, p } of joints) {
    const e = (k) => dir.map((a) => a * k);
    // dessous de tête sur la rondelle, face de serrage à d = 0
    P('3', along(THREE, flatWasher(S, THREE, 0.5), dir, p(0)), e(0.05));
    P('2', along(THREE, hhcs(S, THREE, 0.5, 1.75), dir, p(wt)), e(0.11));
    P('3', along(THREE, flatWasher(S, THREE, 0.5), dir.map((a) => -a), p(-T - GRIP)), e(-0.05));
    P('4', along(THREE, hexNut(S, THREE, 0.5), dir.map((a) => -a), p(-T - GRIP - wt)), e(-0.09));
  }

  return { view: { dir: [1, 0.75, 1.1] } };
}

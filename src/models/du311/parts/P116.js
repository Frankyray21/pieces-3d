// P116 — Pied de mât / support du centreur CX034985 rév. 0 (pages 116-117) :
// « ASSY, CS MOUNTING ». Mécano-soudure (4, « MAST FOOT ») : semelle épaisse
// portant aux deux coins avant les moyeux de pivot du centreur fendu, aux
// deux coins arrière les moyeux bas des axes de vérins ; dessous, deux blocs
// d'attache percés ; dessus, deux âmes ajourées qui portent la plaque en U
// (fente ouverte vers l'arrière), ses quatre patins (deux à téton) et, au
// droit des moyeux arrière, les moyeux hauts des axes de vérins.
// - 1 : deux axes de pivot Ø 2 × 17 7/16 po à plaquette d'arrêt, debout dans
//   les moyeux avant ; ils traversent les moyeux du châssis P102 ; chacun est
//   arrêté en bas par une vis H 3/8-16 × 3 1/2 (7) passée en corde dans le
//   moyeu (gorge de l'axe), rondelles (10) et écrou Nyloc (13) ;
// - 5 : deux axes Ø 1 × 6 1/4 po des œils de tige des vérins de pivotement
//   P094, chacun entre deux entretoises (2) au-dessous de la plaque en U,
//   arrêté par une vis H 1/4-20 × 2 1/4 (6) en corde dans le moyeu haut,
//   rondelles (9) et écrou Nyloc (12) ;
// - 3 : deux goupilles Ø 3/8 × 3/4 dans les patins arrière ;
// - 8 et 11 : quatre vis H 3/4-10 × 1 3/4 et leurs rondelles Nord-Lock, tête
//   en bas sous la plaque en U (butées réglables).
// Repère : origine au milieu des deux axes de pivot (1), sur le dessus des
// moyeux avant (appui du moyeu bas de P102), Y vers le haut (le long des
// tiges) ; X selon la ligne des pivots (axes à x = ±11 po) ; +Z vers le
// centreur et l'axe de forage (à z = +20.4 po, voir FRAME102), le pied
// s'étend vers -Z. Axes des vérins (5) à x = ±11.5, z = -13.5 po, œil de tige
// centré à y = 3.06 po. Encombrement ≈ 0.686 (X) × 0.521 (Y, de -0.203 sous
// les blocs à +0.318 en haut des axes) × 0.470 (Z, de -0.406 à +0.064) m.
// Cotes : liste (axes, vis, goupilles) ; entraxe des pivots repris de P102
// (22 po) ; la position des axes 5 met les œils des vérins P094 (13.95 po
// rentrés) à portée des chapes de P102 ; semelle, âmes, plaque en U et
// moyeux d'après les proportions de l'isométrie (Ø 2 po des axes 1 pour
// l'échelle). Les entretoises CM85611 (2) flanquent l'œil de vérin, comme
// les mêmes entretoises de P098 sur l'axe de l'œil de fond.
import { L, u, along, hhcs, nylocNut, flatWasher, nordLock, pin } from './_avance_b.js';

const PX = 11; // demi-entraxe des pivots
const P5 = { x: 11.5, z: -13.5 }; // axes des vérins (±x)
const LP = { y0: -2.0, y1: -0.75, x: 13.5, zf: 2.5, zb: -16.0, r: 2.6 }; // semelle
const PB = { ro: 1.75, ri: 1.02, y0: -5.0, y1: 0 }; // moyeux de pivot
const UP = { y0: 4.0, y1: 4.75, x: 12.5, zf: 0.5, zb: -15.5, slot: 4.25, slotZ: -6.0 }; // plaque en U
const WEB = { x: 5.0, t: 0.75, z0: -15.0, z1: 0.0 };
const B5 = { ro: 1.0, ri: 0.52, lowTop: 2.125, topH: 1.0 }; // moyeux des axes 5
const SP = { t: 0.5, ro: 1.0, ri: 0.52 }; // entretoises
const PADS = [[-7.6, -2.2], [7.6, -2.2], [-7.6, -11.2], [7.6, -11.2]]; // patins [x, z]
// Vis 8 sous les patins (à côté du téton à l'avant, de la goupille à l'arrière).
const STOPS = PADS.map(([x, z], i) => [x + Math.sign(x) * (i < 2 ? 1.2 : -1.1), z]);

export const MOUNT116 = {
  pivotX: u(PX), // axes de pivot (1) à x = ±pivotX, z = 0, appui à y = 0
  pin1Top: u(PB.y0 + 0.1 + 17.4375), // dessus de la plaquette d'arrêt
  cylPins: [[-u(P5.x), u(P5.z)], [u(P5.x), u(P5.z)]], // axes 5, selon Y
  cylEyeY: u(3.06), // milieu de l'œil de tige entre les entretoises
  uPlate: [u(UP.y0), u(UP.y1)],
  bottom: u(-8),
};

export default function P116(api) {
  const { THREE, S } = api;
  const { extrude, box, shell, merged, group, at, weld, weldRing } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v = (x, y, z) => [u(x), u(y), u(z)];
  const arc = (cx, cz, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.cos(a), cz + r * Math.sin(a)];
  });
  const rrect = (x0, z0, x1, z1, r, n = 5) => [
    ...arc(x1 - r, z0 + r, r, -Math.PI / 2, 0, n), ...arc(x1 - r, z1 - r, r, 0, Math.PI / 2, n),
    ...arc(x0 + r, z1 - r, r, Math.PI / 2, Math.PI, n), ...arc(x0 + r, z0 + r, r, Math.PI, 1.5 * Math.PI, n),
  ];
  // Contour [x, z] (po) extrudé selon Y de y0 à y1, trous [x, z, r].
  const slabY = (pts, y0, y1, holes = [], mat = 'grey') => {
    const m = extrude(pts.map(([x, z]) => [u(x), -u(z)]), u(y1 - y0), mat, { holes: holes.map(([x, z, r]) => [u(x), -u(z), u(r)]) });
    m.rotation.x = -Math.PI / 2;
    m.position.y = u((y0 + y1) / 2);
    return m;
  };
  // Contour [z, y] extrudé selon X, centré sur xc, trous [z, y, r].
  const slabX = (pts, xc, t, holes = []) => {
    const m = extrude(pts.map(([z, y]) => [-u(z), u(y)]).reverse(), u(t), 'grey', { holes: holes.map(([z, y, r]) => [-u(z), u(y), u(r)]) });
    m.rotation.y = Math.PI / 2;
    m.position.x = u(xc);
    return m;
  };

  // ================================================ 4 — pied de mât
  const parts = [], beads = [];
  // Semelle 1 1/4 po, coins arrondis autour des moyeux, deux trous d'allègement.
  parts.push(slabY(rrect(-LP.x, LP.zb, LP.x, LP.zf, LP.r), LP.y0, LP.y1, [
    ...[-1, 1].map((s) => [s * PX, 0, PB.ri]), [-5.6, 0.6, 0.9], [5.6, 0.6, 0.9],
  ]));
  for (const s of [-1, 1]) {
    // Moyeux de pivot (en saillie de 3/4 po dessus, 3 po dessous).
    parts.push(shell(u(PB.ro), u(PB.ri), u(PB.y1 - PB.y0), 'grey', { seg: 40, pos: v(s * PX, (PB.y0 + PB.y1) / 2, 0) }));
    beads.push(weldRing(u(PB.ro + 0.05), u(0.24), 'grey', { pos: v(s * PX, LP.y1 + 0.06, 0) }));
    beads.push(weldRing(u(PB.ro + 0.05), u(0.24), 'grey', { pos: v(s * PX, LP.y0 - 0.06, 0) }));
    // Moyeux des axes 5 : bas sur la semelle, haut sur la plaque en U.
    parts.push(shell(u(B5.ro), u(B5.ri), u(B5.lowTop - LP.y1), 'grey', { seg: 32, pos: v(s * P5.x, (B5.lowTop + LP.y1) / 2, P5.z) }));
    parts.push(shell(u(B5.ro), u(B5.ri), u(B5.topH), 'grey', { seg: 32, pos: v(s * P5.x, UP.y1 + B5.topH / 2, P5.z) }));
    beads.push(weldRing(u(B5.ro + 0.04), u(0.18), 'grey', { pos: v(s * P5.x, LP.y1 + 0.05, P5.z) }));
    beads.push(weldRing(u(B5.ro + 0.04), u(0.18), 'grey', { pos: v(s * P5.x, UP.y1 + 0.05, P5.z) }));
    // Âmes ajourées (quatre trous) entre semelle et plaque en U.
    parts.push(slabX([[WEB.z0, LP.y1], [WEB.z1, LP.y1], [WEB.z1, UP.y0], [WEB.z0, UP.y0]], s * WEB.x, WEB.t,
      [[-3.2, 0.85, 0.55], [-3.2, 2.45, 0.55], [-6.4, 0.85, 0.55], [-6.4, 2.45, 0.55]]));
    for (const sx of [-1, 1]) {
      const x = s * WEB.x + sx * (WEB.t / 2 + 0.07);
      beads.push(weld([v(x, LP.y1 + 0.07, WEB.z0 + 0.2), v(x, LP.y1 + 0.07, WEB.z1 - 0.2)], u(0.2), 'grey'));
      beads.push(weld([v(x, UP.y0 - 0.07, WEB.z0 + 0.2), v(x, UP.y0 - 0.07, WEB.z1 - 0.2)], u(0.2), 'grey'));
    }
    // Blocs d'attache sous la semelle : face avant percée (deux trous), corps en retrait.
    const bx0 = s > 0 ? 0.25 : -9.0, bx1 = s > 0 ? 9.0 : -0.25;
    const face = extrude([[bx0, -8], [bx1, -8], [bx1, LP.y0], [bx0, LP.y0]].map(([x, y]) => [u(x), u(y)]), u(0.75), 'grey',
      { holes: [[u((bx0 + bx1) / 2 - 2.2), u(-4.2), u(0.42)], [u((bx0 + bx1) / 2 + 2.2), u(-5.6), u(0.42)]] });
    face.position.z = u(-1.0 - 0.375);
    parts.push(face);
    parts.push(box(u(bx1 - bx0), u(6), u(10.25), 'grey', { pos: v((bx0 + bx1) / 2, -5, -1.75 - 5.125) }));
  }
  // Plaque en U : fente vers l'arrière (-Z), coins arrondis, trous des axes 5
  // et des goupilles.
  const su = UP.slot;
  const uOutline = [
    [-su, UP.zb], [-su, UP.slotZ], ...arc(0, UP.slotZ, su, Math.PI, 0, 18), [su, UP.zb],
    [UP.x - 1.5, UP.zb], ...arc(UP.x - 1.5, UP.zb + 1.5, 1.5, -Math.PI / 2, 0, 5), ...arc(UP.x - 1.5, UP.zf - 1.5, 1.5, 0, Math.PI / 2, 5),
    ...arc(-UP.x + 1.5, UP.zf - 1.5, 1.5, Math.PI / 2, Math.PI, 5), ...arc(-UP.x + 1.5, UP.zb + 1.5, 1.5, Math.PI, 1.5 * Math.PI, 5),
  ];
  parts.push(slabY(uOutline.slice().reverse(), UP.y0, UP.y1, [[-P5.x, P5.z, B5.ri], [P5.x, P5.z, B5.ri]]));
  // Patins (1/2 po) ; tétons Ø 1 1/4 × 1 1/2 sur les patins avant ; trous de goupille à l'arrière.
  for (const [i, [x, z]] of PADS.entries()) {
    const back = i >= 2;
    parts.push(slabY(rrect(x - 1.9, z - 1.1, x + 1.9, z + 1.1, 0.6), UP.y1, UP.y1 + 0.5, back ? [[x + Math.sign(x) * 0.9, z, 0.19]] : []));
    if (!back) parts.push(L(S, [[0, UP.y1 + 0.5], [0.625, UP.y1 + 0.5], [0.625, UP.y1 + 1.9], [0.56, UP.y1 + 2.0], [0, UP.y1 + 2.0]], 'grey', 24, { pos: v(x, 0, z) }));
  }
  const body = merged(parts, 'grey');
  body.userData.hasInterior = true;
  const bm = merged(beads, 'grey');
  bm.geometry.userData.edgeAngle = 75;
  P('4', group(body, bm), [0, 0, 0]);

  // ================================================ axes de pivot (1) et leur arrêt
  // Axe Ø 2, bas à 0.1 po au-dessus du dessous du moyeu, plaquette d'arrêt
  // 3 × 3 3/4 × 1/2 po soudée en tête (bout arrondi côté extérieur, méplat
  // côté intérieur).
  const shank = 17.4375 - 0.5;
  for (const s of [-1, 1]) {
    const y0 = PB.y0 + 0.1;
    const tab = extrude([...arc(0, 0, 1.5, -Math.PI / 2, Math.PI / 2, 14), [-2.25, 1.5], [-2.25, -1.5]].map(([x, z]) => [u(s * x), -u(z)]), u(0.5), 'steel', { holes: [] });
    tab.rotation.x = -Math.PI / 2;
    tab.position.set(u(s * PX), u(y0 + shank + 0.25), 0);
    const p1 = group(
      at(pin(S, THREE, 2.0, shank, { grooves: [-shank / 2 + 0.7] }), v(s * PX, y0 + shank / 2, 0)),
      merged([tab, weldRing(u(1.02), u(0.18), 'steel', { pos: v(s * PX, y0 + shank - 0.04, 0) })], 'steel'),
    );
    P('1', p1, [0, 0.42, 0]);
    // 7 — vis 3/8 × 3 1/2 en corde (z = +0.95) dans la gorge de l'axe, 10 — rondelles, 13 — Nyloc.
    const yb = y0 + 0.7, zb = 0.95, c = Math.sqrt(PB.ro ** 2 - zb ** 2);
    const wt = 0.065;
    P('10', along(THREE, flatWasher(S, THREE, 0.375), [-1, 0, 0], v(s * PX - c, yb, zb)), [-0.05, 0, 0]);
    P('7', along(THREE, hhcs(S, THREE, 0.375, 3.5), [-1, 0, 0], v(s * PX - c - wt, yb, zb)), [-0.14, 0, 0]);
    P('10', along(THREE, flatWasher(S, THREE, 0.375), [1, 0, 0], v(s * PX + c, yb, zb)), [0.05, 0, 0]);
    P('13', along(THREE, nylocNut(S, THREE, 0.375), [1, 0, 0], v(s * PX + c + wt, yb, zb)), [0.09, 0, 0]);
  }

  // ================================================ axes des vérins (5), entretoises, arrêts
  for (const s of [-1, 1]) {
    const x = s * P5.x, z = P5.z;
    const top = UP.y1 + B5.topH + 0.1;
    P('5', at(pin(S, THREE, 1.0, 6.25, { grooves: [6.25 / 2 - 0.55] }), v(x, top - 3.125, z)), [0, 0.26, 0]);
    // 2 — entretoises de part et d'autre de l'œil de tige (sortent vers l'extérieur).
    const spacer = (y) => L(S, [[SP.ri, y], [SP.ro - 0.04, y], [SP.ro, y + 0.04], [SP.ro, y + SP.t - 0.04], [SP.ro - 0.04, y + SP.t], [SP.ri, y + SP.t], [SP.ri, y]], 'steel', 32, { pos: v(x, 0, z) });
    P('2', spacer(B5.lowTop), [s * 0.1, 0, 0]);
    P('2', spacer(UP.y0 - SP.t), [s * 0.17, 0, 0]);
    // 6 — vis 1/4 × 2 1/4 en corde (z + 0.55) dans le moyeu haut, 9 — rondelles, 12 — Nyloc.
    const yb = top - 0.55, zb = z + 0.55, c = Math.sqrt(B5.ro ** 2 - 0.55 ** 2);
    const wt = 0.065;
    P('9', along(THREE, flatWasher(S, THREE, 0.25), [-1, 0, 0], v(x - c, yb, zb)), [-0.05, 0, 0]);
    P('6', along(THREE, hhcs(S, THREE, 0.25, 2.25), [-1, 0, 0], v(x - c - wt, yb, zb)), [-0.13, 0, 0]);
    P('9', along(THREE, flatWasher(S, THREE, 0.25), [1, 0, 0], v(x + c, yb, zb)), [0.05, 0, 0]);
    P('12', along(THREE, nylocNut(S, THREE, 0.25), [1, 0, 0], v(x + c + wt, yb, zb)), [0.1, 0, 0]);
  }

  // ================================================ goupilles (3), butées (8, 11)
  for (const [x, z] of PADS.slice(2)) {
    P('3', at(L(S, [[0, -0.375], [0.16, -0.375], [0.1875, -0.35], [0.1875, 0.35], [0.16, 0.375], [0, 0.375]], 'steel', 16), v(x + Math.sign(x) * 0.9, UP.y1 + 0.5, z)), [0, 0.1, 0]);
  }
  const nl = 2 * Math.max(0.05, 0.75 * 0.11);
  for (const [x, z] of STOPS) {
    const yh = UP.y0 - 0.385 - nl; // dessous de tête : vis de butée réglée, bout sous le dessus du patin
    P('11', along(THREE, nordLock(S, THREE, 0.75), [0, -1, 0], v(x, yh + nl, z)), [0, -0.05, 0]);
    P('8', along(THREE, hhcs(S, THREE, 0.75, 1.75), [0, -1, 0], v(x, yh, z)), [0, -0.1, 0]);
  }

  return { view: { dir: [1, 0.8, 1.15] } };
}

// P116 — Pied de mât / support du centreur CX034985 rév. 0 (pages 116-117) :
// « ASSY, CS MOUNTING ». Mécano-soudure (4, « MAST FOOT ») : semelle épaisse
// portant aux deux coins avant les moyeux de pivot du centreur fendu (réduits
// à Ø 2.9 po sous la semelle) et, à l'arrière, les moyeux bas des axes de
// vérins ; dessous, deux blocs d'attache percés ; dessus, deux âmes ajourées
// (six trous) qui portent la plaque en H : échancrure Ø 6 po à l'avant entre
// deux jambes, fente en U de 4 po à l'arrière entre les deux ailes des axes
// de vérins ; quatre patins sur la plaque.
// - 1 : deux axes de pivot Ø 2 × 17 7/16 po à plaquette d'arrêt, debout dans
//   les moyeux avant ; ils traversent les moyeux du châssis P102 et le
//   dépassent d'environ 1.3 po ; chacun est arrêté en bas par une vis H
//   3/8-16 × 3 1/2 (7) passée selon Z au travers du moyeu et de l'axe,
//   rondelles (10) et écrou Nyloc (13) ;
// - 5 : deux axes Ø 1 × 6 1/4 po des œils de fond des vérins de pivotement
//   P094, chacun entre deux entretoises (2) sous la plaque, arrêté en haut
//   par une vis H 1/4-20 × 2 1/4 (6) au travers du moyeu haut et de l'axe,
//   rondelles (9) et écrou Nyloc (12) ;
// - 3 : deux goupilles Ø 3/8 × 3/4 au bout intérieur des patins arrière ;
// - 8 et 11 : quatre vis H 3/4-10 × 1 3/4 et leurs rondelles Nord-Lock, une
//   au bout extérieur de chaque patin, tête sous la plaque, bout fileté en
//   saillie d'environ 0.85 po au-dessus du patin (butées de la semelle du
//   mât).
// Repère : origine au milieu des deux axes de pivot (1), sur le dessus des
// moyeux avant (appui du moyeu bas de P102), Y vers le haut (le long des
// tiges) ; X selon la ligne des pivots (axes à x = ±11 po) ; +Z vers le
// centreur et l'axe de forage (à z = +20.4 po, voir FRAME102), le pied
// s'étend vers -Z. Axes des vérins (5) à x = ±5, z = -15.63 po, œil de fond
// centré à y = 1.75 po (vérins P094 sortis, 18.45 po jusqu'aux chapes de
// P102). Encombrement ≈ 0.686 (X) × 0.58 (Y, de -0.12 sous les blocs à
// +0.46 en haut des axes 1) × 0.50 (Z, de -0.44 à +0.064) m.
// Cotes : liste (axes, vis, goupilles) ; entraxe des pivots repris de P102
// (22 po) ; plaque, âmes, patins, blocs et moyeux d'après les vues des pages
// 116 et 92 (Ø 2 po des axes 1 pour l'échelle). Les entretoises CM85611 (2)
// flanquent l'œil de vérin, comme les mêmes entretoises de P098 sur l'axe 7.
import { L, u, along, hhcs, nylocNut, flatWasher, nordLock } from './_avance_b.js';

const PX = 11; // demi-entraxe des pivots
const P5 = { x: 5.0, z: -15.63 }; // axes des vérins (±x)
const LP = { y0: -2.0, y1: -0.75, x: 13.5, zf: 2.5, zb: -17.0, r: 2.6 }; // semelle
const PB = { ro: 1.75, rl: 1.45, ri: 1.02, y0: -3.9, y1: 0 }; // moyeux de pivot (bas réduit à rl)
const UP = { y0: 4.0, y1: 4.5, x: 7.0, zf: 0.5, zb: -17.0, front: 3.0, slot: 2.0, slotZ: -9.0 }; // plaque en H
const PADT = 0.25; // patins
const WEB = { x: 3.2, t: 0.75, z0: -15.0, z1: 0.0 };
const B5 = { ro: 1.0, ri: 0.52, lowTop: 0.75, top: { ro: 0.9, h: 1.0 } }; // moyeux des axes 5
const SP = { t: 0.5, ro: 1.0, ri: 0.52 }; // entretoises
const EYE5 = 1.0; // épaisseur de l'œil de fond de P094
const PADS = [[-4.4, -2.0], [4.4, -2.0], [-4.4, -11.0], [4.4, -11.0]]; // patins [x, z], 3.6 × 1.8 po
const STOPS = PADS.map(([x, z]) => [x + Math.sign(x) * 1.2, z]); // vis 8 au bout extérieur
const DOWELS = PADS.slice(2).map(([x, z]) => [x - Math.sign(x) * 1.2, z]); // goupilles au bout intérieur

export const MOUNT116 = {
  pivotX: u(PX), // axes de pivot (1) à x = ±pivotX, z = 0, appui à y = 0
  pin1Top: u(PB.y0 + 0.1 + 17.4375), // dessus de la plaquette d'arrêt
  cylPins: [[-u(P5.x), u(P5.z)], [u(P5.x), u(P5.z)]], // axes 5, selon Y
  cylEyeY: u(B5.lowTop + SP.t + EYE5 / 2), // milieu de l'œil de fond entre les entretoises
  uPlate: [u(UP.y0), u(UP.y1)],
  bottom: u(-4.7),
};

export default function P116(api) {
  const { THREE, S } = api;
  const { extrude, box, shell, merged, group, at, weld, weldRing, slotted, roundHole } = S;
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
  // Tube (moyeu) le long de Y, de y0 à y1, percé en travers selon Z à yh (rh).
  const drilledHub = (ro, ri, y0, y1, x, z, yh, rh) => slotted(u(ro), u(ri), u(y0), u(y1), roundHole(0, u(yh), u(rh), u(ro), { through: true, steps: 6 }), 'grey', { seg: 28, pos: v(x, 0, z) });
  // Axe plein Ø d de y0 à y1, bouts chanfreinés, percé en travers selon Z à yh.
  const drilledPin = (d, y0, y1, yh, rh, x, z) => {
    const r = d / 2, c = 0.06, h0 = yh - rh - 0.15, h1 = yh + rh + 0.15;
    return merged([
      L(S, [[0, y0], [r - c, y0], [r, y0 + c], [r, h0], [0, h0]], 'steel', 24, { pos: v(x, 0, z) }),
      slotted(u(r), u(0.02), u(h0), u(h1), roundHole(0, u(yh), u(rh), u(r), { through: true, steps: 6 }), 'steel', { seg: 24, pos: v(x, 0, z) }),
      L(S, [[0, h1], [r, h1], [r, y1 - c], [r - c, y1], [0, y1]], 'steel', 24, { pos: v(x, 0, z) }),
    ], 'steel');
  };

  // ================================================ 4 — pied de mât
  const parts = [], beads = [];
  const Y1H = PB.y0 + 0.7; // trou de la vis 7 dans le bas des moyeux de pivot
  const top5 = UP.y1 + B5.top.h; // dessus des moyeux hauts des axes 5
  const Y6H = top5 - 0.5; // trou de la vis 6
  // Semelle 1 1/4 po, coins arrondis autour des moyeux, deux trous d'allègement.
  parts.push(slabY(rrect(-LP.x, LP.zb, LP.x, LP.zf, LP.r), LP.y0, LP.y1, [
    ...[-1, 1].map((s) => [s * PX, 0, PB.ri]), [-5.6, 0.6, 0.9], [5.6, 0.6, 0.9],
    ...[-1, 1].map((s) => [s * P5.x, P5.z, B5.ri]),
  ]));
  for (const s of [-1, 1]) {
    // Moyeux de pivot : Ø 3.5 de la semelle au-dessus, Ø 2.9 percé dessous.
    parts.push(shell(u(PB.ro), u(PB.ri), u(PB.y1 - LP.y0), 'grey', { seg: 36, pos: v(s * PX, (PB.y1 + LP.y0) / 2, 0) }));
    parts.push(drilledHub(PB.rl, PB.ri, PB.y0, LP.y0, s * PX, 0, Y1H, 0.2));
    beads.push(weldRing(u(PB.ro + 0.05), u(0.24), 'grey', { pos: v(s * PX, LP.y1 + 0.06, 0) }));
    beads.push(weldRing(u(PB.rl + 0.05), u(0.22), 'grey', { pos: v(s * PX, LP.y0 - 0.06, 0) }));
    // Moyeux des axes 5 : bas sur la semelle, haut sur la plaque (percé pour la vis 6).
    parts.push(shell(u(B5.ro), u(B5.ri), u(B5.lowTop - LP.y1), 'grey', { seg: 28, pos: v(s * P5.x, (B5.lowTop + LP.y1) / 2, P5.z) }));
    parts.push(drilledHub(B5.top.ro, B5.ri, UP.y1, top5, s * P5.x, P5.z, Y6H, 0.14));
    beads.push(weldRing(u(B5.ro + 0.04), u(0.18), 'grey', { pos: v(s * P5.x, LP.y1 + 0.05, P5.z) }));
    beads.push(weldRing(u(B5.top.ro + 0.04), u(0.18), 'grey', { pos: v(s * P5.x, UP.y1 + 0.05, P5.z) }));
    // Âmes ajourées (six trous, 3 × 2) entre semelle et plaque.
    const wh = [];
    for (const zz of [-3.4, -7.0, -10.6]) for (const yy of [0.75, 2.6]) wh.push([zz, yy, 0.55]);
    parts.push(slabX([[WEB.z0, LP.y1], [WEB.z1, LP.y1], [WEB.z1, UP.y0], [WEB.z0, UP.y0]], s * WEB.x, WEB.t, wh));
    for (const sx of [-1, 1]) {
      const x = s * WEB.x + sx * (WEB.t / 2 + 0.07);
      beads.push(weld([v(x, LP.y1 + 0.07, WEB.z0 + 0.2), v(x, LP.y1 + 0.07, WEB.z1 - 0.2)], u(0.2), 'grey'));
      beads.push(weld([v(x, UP.y0 - 0.07, WEB.z0 + 0.2), v(x, UP.y0 - 0.07, WEB.z1 - 0.2)], u(0.2), 'grey'));
    }
    // Blocs d'attache sous la semelle (2.7 po) : face avant percée de deux trous.
    const bx0 = s > 0 ? 0.25 : -9.0, bx1 = s > 0 ? 9.0 : -0.25;
    const face = extrude([[bx0, -4.7], [bx1, -4.7], [bx1, LP.y0], [bx0, LP.y0]].map(([x, y]) => [u(x), u(y)]), u(0.75), 'grey',
      { holes: [[u((bx0 + bx1) / 2 - 2.2), u(-3.0), u(0.42)], [u((bx0 + bx1) / 2 + 2.2), u(-3.9), u(0.42)]] });
    face.position.z = u(-1.0 - 0.375);
    parts.push(face);
    parts.push(box(u(bx1 - bx0), u(2.7), u(10.25), 'grey', { pos: v((bx0 + bx1) / 2, -3.35, -1.75 - 5.125) }));
  }
  // Plaque en H : échancrure Ø 6 ouverte vers l'avant entre les deux jambes,
  // fente en U de 4 po ouverte vers l'arrière entre les ailes des axes 5.
  const R = UP.front, sw = UP.slot, cr = 1.2;
  const hOutline = [
    // de l'avant gauche, sens horaire vu de dessus (x, z)
    [-UP.x + cr, UP.zf], [-R, UP.zf], ...arc(0, UP.zf, R, Math.PI, 2 * Math.PI, 18).slice(1, -1), [R, UP.zf],
    [UP.x - cr, UP.zf], ...arc(UP.x - cr, UP.zf - cr, cr, Math.PI / 2, 0, 4).slice(1),
    [UP.x, UP.zb + cr], ...arc(UP.x - cr, UP.zb + cr, cr, 0, -Math.PI / 2, 4).slice(1),
    [sw, UP.zb], [sw, UP.slotZ], ...arc(0, UP.slotZ, sw, 0, Math.PI, 12).slice(1, -1), [-sw, UP.slotZ], [-sw, UP.zb],
    [-UP.x + cr, UP.zb], ...arc(-UP.x + cr, UP.zb + cr, cr, -Math.PI / 2, -Math.PI, 4).slice(1),
    [-UP.x, UP.zf - cr], ...arc(-UP.x + cr, UP.zf - cr, cr, Math.PI, Math.PI / 2, 4).slice(1, -1),
  ];
  const plateHoles = [...[-1, 1].map((s) => [s * P5.x, P5.z, B5.ri]), ...STOPS.map(([x, z]) => [x, z, 0.4]), ...DOWELS.map(([x, z]) => [x, z, 0.19])];
  parts.push(slabY(hOutline, UP.y0, UP.y1, plateHoles));
  // Patins de 1/4 po, percés pour la vis 8 (bout extérieur) et la goupille (arrière).
  for (const [i, [x, z]] of PADS.entries()) {
    const holes = [[STOPS[i][0], z, 0.4], ...(i >= 2 ? [[DOWELS[i - 2][0], z, 0.19]] : [])];
    parts.push(slabY(rrect(x - 1.8, z - 0.9, x + 1.8, z + 0.9, 0.45), UP.y1, UP.y1 + PADT, holes));
  }
  const body = merged(parts, 'grey');
  body.userData.hasInterior = true;
  const bm = merged(beads, 'grey');
  bm.geometry.userData.edgeAngle = 75;
  P('4', group(body, bm), [0, 0, 0]);

  // ================================================ axes de pivot (1) et leur arrêt
  // Axe Ø 2, bas à 0.1 po au-dessus du dessous du moyeu, percé Ø 0.39 en
  // travers pour la vis 7 ; plaquette d'arrêt 3 × 3 3/4 × 1/2 po soudée en
  // tête (bout arrondi côté extérieur, méplat côté intérieur).
  const shank = 17.4375 - 0.5;
  for (const s of [-1, 1]) {
    const y0 = PB.y0 + 0.1;
    const tab = extrude([...arc(0, 0, 1.5, -Math.PI / 2, Math.PI / 2, 14), [-2.25, 1.5], [-2.25, -1.5]].map(([x, z]) => [u(s * x), -u(z)]), u(0.5), 'steel', { holes: [] });
    tab.rotation.x = -Math.PI / 2;
    tab.position.set(u(s * PX), u(y0 + shank + 0.25), 0);
    P('1', group(
      drilledPin(2.0, y0, y0 + shank, Y1H, 0.2, s * PX, 0),
      merged([tab, weldRing(u(1.02), u(0.18), 'steel', { pos: v(s * PX, y0 + shank - 0.04, 0) })], 'steel'),
    ), [0, 0.42, 0]);
    // 7 — vis 3/8 × 3 1/2 selon Z (tête vers +Z), 10 — rondelles, 13 — Nyloc.
    const wt = 0.065;
    P('10', along(THREE, flatWasher(S, THREE, 0.375), [0, 0, 1], v(s * PX, Y1H, PB.rl)), [0, 0, 0.05]);
    P('7', along(THREE, hhcs(S, THREE, 0.375, 3.5), [0, 0, 1], v(s * PX, Y1H, PB.rl + wt)), [0, 0, 0.14]);
    P('10', along(THREE, flatWasher(S, THREE, 0.375), [0, 0, -1], v(s * PX, Y1H, -PB.rl)), [0, 0, -0.05]);
    P('13', along(THREE, nylocNut(S, THREE, 0.375), [0, 0, -1], v(s * PX, Y1H, -PB.rl - wt)), [0, 0, -0.09]);
  }

  // ================================================ axes des vérins (5), entretoises, arrêts
  for (const s of [-1, 1]) {
    const x = s * P5.x, z = P5.z;
    const top = top5 + 0.1;
    P('5', drilledPin(1.0, top - 6.25, top, Y6H, 0.14, x, z), [0, 0.26, 0]);
    // 2 — entretoises de part et d'autre de l'œil de fond de P094.
    const spacer = (y) => L(S, [[SP.ri, y], [SP.ro - 0.04, y], [SP.ro, y + 0.04], [SP.ro, y + SP.t - 0.04], [SP.ro - 0.04, y + SP.t], [SP.ri, y + SP.t], [SP.ri, y]], 'steel', 28, { pos: v(x, 0, z) });
    P('2', spacer(B5.lowTop), [s * 0.1, 0, 0]);
    P('2', spacer(B5.lowTop + SP.t + EYE5), [s * 0.17, 0, 0]);
    // 6 — vis 1/4 × 2 1/4 selon Z au travers du moyeu haut, 9 — rondelles, 12 — Nyloc.
    const wt = 0.065;
    P('9', along(THREE, flatWasher(S, THREE, 0.25), [0, 0, 1], v(x, Y6H, z + B5.top.ro)), [0, 0, 0.05]);
    P('6', along(THREE, hhcs(S, THREE, 0.25, 2.25), [0, 0, 1], v(x, Y6H, z + B5.top.ro + wt)), [0, 0, 0.13]);
    P('9', along(THREE, flatWasher(S, THREE, 0.25), [0, 0, -1], v(x, Y6H, z - B5.top.ro)), [0, 0, -0.05]);
    P('12', along(THREE, nylocNut(S, THREE, 0.25), [0, 0, -1], v(x, Y6H, z - B5.top.ro - wt)), [0, 0, -0.1]);
  }

  // ================================================ goupilles (3), vis de butée (8, 11)
  for (const [x, z] of DOWELS) {
    P('3', at(L(S, [[0, -0.375], [0.16, -0.375], [0.1875, -0.35], [0.1875, 0.35], [0.16, 0.375], [0, 0.375]], 'steel', 16), v(x, UP.y1 + PADT, z)), [0, 0.1, 0]);
  }
  const nl = 2 * Math.max(0.05, 0.75 * 0.11);
  for (const [x, z] of STOPS) {
    // Tête et rondelle sous la plaque ; le bout fileté dépasse du patin.
    P('11', along(THREE, nordLock(S, THREE, 0.75), [0, -1, 0], v(x, UP.y0, z)), [0, -0.05, 0]);
    P('8', along(THREE, hhcs(S, THREE, 0.75, 1.75), [0, -1, 0], v(x, UP.y0 - nl, z)), [0, -0.1, 0]);
  }

  return { view: { dir: [1, 0.8, 1.15] } };
}

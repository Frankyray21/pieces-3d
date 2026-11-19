// P025 — Base du serre-tiges Boyles 12HH 55-4000 (page 25, plan coté X-Spec C6322), repère local de layout.js :
// origine au centre du gabarit des sept trous, sur la face de dessous de la plaque ; axes du repère foreuse ;
// posée en RCB.pos par P002 (sur la portée du mât, P004).
// Mécano-soudé B7157 (rep. 1, joues noires et plaque usinée grise comme le rendu X-Spec) : plaque de 3/4 po percée des sept trous Ø 0,688 po du plan (RCB.holes), lumière
// rectangulaire entre la joue arrière et le milieu (vue de dessus) ; deux joues de 1 po en berceau (cercle de
// l'axe de forage, rayon du corps du serre-tiges + 4 mm) avec l'oreille de la pin du côté +Z et, du côté −Z, un
// bloc percé pour la pin des boulons à œil ; oreille centrale entre les joues. Pin 55-0083 Ø 1 po (rep. 3) dans
// quatre bagues 25-886414 (rep. 5 : une par joue, deux dans l'oreille centrale), poignée à plaquette et gaine
// noire vers −X, vis 3/8-16 × 1 1/2 po (rep. 8) et écrou Nylstop (rep. 9) dans le trou du bout +X. Pin 90-132
// Ø 1/2 po (rep. 4, tête vers −X, écrou Nylstop 1/2-13 rep. 6 du côté +X) qui porte les deux boulons à œil
// 5/8-11 × 2 3/4 po (rep. 2) et leurs écrous à embase (rep. 7).
// Cotes : plan p. 25 (trous, entraxes, bagues, désignations) [manuel] ; contour de la plaque, joues, lumière, pins
// et hauteur des écrous relevés sur la vue de dessus (30,4 px/po) et la vue isométrique [mesure] ; RCB, RC et
// AXIS_Y de layout.js. Éclaté comme la p. 25 : pin vers −X, bagues le long de l'axe, boulons à œil et écrous vers
// le haut, pin des boulons à œil vers −X, son écrou vers +X.
import { IN, AXIS_Y, MAST, RCB, RC } from '../layout.js';
import { arc, hull, circle, profilX, sleeve, headPin } from './_structure.js';

const I = (v) => v * IN;
const T = I(0.75); // plaque [mesure]
const PL = { x: [-5.3, 5.35], z: 8.6, r: 0.5 }; // contour de la plaque, po [mesure, vue de dessus]
const WIN = { x: [-2.95, 0.83], z: 3.05 }; // lumière, po [mesure]
const CHEEK = { x: 3.55, t: 1.1 }; // joues (axe x, épaisseur), po [mesure]
const AX = (AXIS_Y - MAST.top) / IN; // axe de forage au-dessus du dessous de la plaque, po (≈ 10,2)
const CR = RC.d / 2 / IN + 0.15; // rayon du berceau, po
const PIN = { z: RCB.pinZ / IN, y: AX + RC.earY / IN, r: 0.5, ear: 1.125 }; // pin 55-0083 (po)
const EYE = { z: -7.04, y: 2.6, x: 1.65, top: 5.0 }; // pin des boulons à œil, boulons, dessus des blocs (po) [mesure]

export default function P025(api) {
  const S = api.S;
  const { at, group, box, cyl, nut, bolt } = S;
  const toX = [0, 0, -Math.PI / 2]; // axe Y local → +X

  // 1 — Mécano-soudé B7157.
  const w = [];
  {
    const [xa, xb] = PL.x, cx = (xa + xb) / 2;
    const holes = RCB.holes.map(([x, z]) => [x - I(cx), z, RCB.hole / 2]);
    const cut = [[I((WIN.x[0] + WIN.x[1]) / 2 - cx), 0, I(WIN.x[1] - WIN.x[0]), I(2 * WIN.z)]];
    w.push(at(S.plate(I(xb - xa), I(2 * PL.z), T, 'grey', { holes, cutouts: cut, r: I(PL.r) }), [I(cx), T / 2, 0]));
  }
  // Joues en berceau : oreille de la pin (+Z), arc du corps du serre-tiges, bloc des boulons à œil (−Z).
  const cradle = (z0, z1) => {
    const a0 = Math.atan2(-Math.sqrt(CR * CR - z0 * z0), z0), a1 = Math.atan2(-Math.sqrt(CR * CR - z1 * z1), z1);
    return arc([0, AX], CR, a0, a1, 24);
  };
  const cheek = [[7.45, 0.75], [7.45, PIN.y], ...arc([PIN.z, PIN.y], PIN.ear, 0, 2.2, 10).slice(1), ...cradle(5.25, -4.6), [-5.0, EYE.top], [-7.6, EYE.top], [-7.6, 0.75]]
    .map(([z, y]) => [I(z), I(y)]);
  for (const s of [-1, 1]) {
    w.push(profilX(api, cheek, [[I(PIN.z), I(PIN.y), I(0.6875)], [I(EYE.z), I(EYE.y), I(0.27)]], I(CHEEK.t), I(s * CHEEK.x), 'black'));
  }
  // Oreille centrale de la pin (entre les joues).
  w.push(profilX(api, hull([[I(5.2), I(0.75)], [I(7.45), I(0.75)], ...circle([I(PIN.z), I(PIN.y)], I(PIN.ear), 20)]), [[I(PIN.z), I(PIN.y), I(0.6875)]], I(2.0), 0, 'black'));
  // Entretoises basses entre les joues, de part et d'autre de la lumière (vue isométrique).
  for (const z of [-4.2, 4.0]) w.push(at(box(I(2 * CHEEK.x - CHEEK.t), I(1.0), I(0.75), 'black', { r: 0.002 }), [0, I(0.75 + 0.5), I(z)]));
  // Cordons de soudure au pied des joues.
  for (const s of [-1, 1]) for (const d of [-1, 1]) {
    const x = I(s * CHEEK.x + d * (CHEEK.t / 2 + 0.06));
    w.push(S.weld([[x, T + 0.002, I(-7.5)], [x, T + 0.002, I(7.35)]], 0.005, 'black'));
  }
  api.part('1', group(...w), [0, 0, 0]);

  // 5 — Bagues 25-886414 (×4, Ø 1,375 × 1,000 × 0,875 po) : dans chaque joue et aux deux faces de l'oreille centrale.
  const bush = [[-CHEEK.x, [-0.3, 0.06, 0]], [-0.5625, [-0.16, 0.12, 0]], [0.5625, [0.14, 0.12, 0]], [CHEEK.x, [0.28, 0.06, 0]]];
  for (const [x, ex] of bush) api.part('5', at(sleeve(api, I(0.6875), I(0.5), I(0.875), 'steel'), [I(x), I(PIN.y), I(PIN.z)], toX), ex);

  // 3 — Pin 55-0083 : tige Ø 1 po, plaquette de manœuvre et gaine noire vers −X, trou de la vis d'arrêt vers +X.
  {
    const x0 = -5.9, x1 = 5.6, len = I(x1 - x0);
    const p = group(
      at(cyl(I(PIN.r), len, 'steel', { axis: 'x', seg: 24 }), [I((x0 + x1) / 2), 0, 0]),
      at(cyl(I(PIN.r) + 0.0012, I(1.3), 'black', { axis: 'x', seg: 24 }), [I(x0 + 0.85), 0, 0]),
      at(box(I(0.25), I(1.6), I(2.6), 'steel', { r: 0.002 }), [I(x0 + 0.125), I(0.25), I(0.9)]),
      at(cyl(I(0.2), I(1.05), 'black', { seg: 10 }), [I(5.2), 0, 0]),
    );
    api.part('3', at(p, [0, I(PIN.y), I(PIN.z)]), [-0.42, 0.12, 0]);
    // 8 — Vis 3/8-16 × 1 1/2 po verticale dans le trou du bout ; 9 — écrou Nylstop 3/8-16 dessous.
    api.part('8', bolt(I(0.375), I(1.5), 'yellow', { pos: [I(5.2), I(PIN.y + 0.65), I(PIN.z)] }), [0, 0.2, 0]);
    api.part('9', nylstop(api, 0.375, [I(5.2), I(PIN.y - 0.85), I(PIN.z)]), [0, -0.12, 0]);
  }

  // 4 — Pin 90-132 Ø 1/2 po des boulons à œil (tête vers −X) ; 6 — écrou Nylstop 1/2-13 du côté +X.
  {
    const xh = -(CHEEK.x + CHEEK.t / 2) - 0.02, xe = CHEEK.x + CHEEK.t / 2 + 0.55;
    const pin = at(headPin(api, I(0.25), I(xe - xh), 'zinc', { headR: I(0.42), headT: I(0.32), hole: false }), [I(xh), I(EYE.y), I(EYE.z)], [0, 0, Math.PI / 2]);
    api.part('4', pin, [-0.32, 0, 0]);
    api.part('6', nylstop(api, 0.5, [I(CHEEK.x + CHEEK.t / 2 + 0.03), I(EYE.y), I(EYE.z)], 'x'), [0.18, 0, 0]);
  }

  // 2 — Boulons à œil 5/8-11 × 2 3/4 po sur la pin 90-132 ; 7 — écrous à embase 5/8-11 sur le dessus des pattes.
  for (const s of [-1, 1]) {
    const x = I(s * EYE.x), z = I(EYE.z), y0 = I(EYE.y);
    const e = group(
      at(S.ring(I(0.72), I(0.27), I(0.625), 'zinc', { axis: 'x', seg: 24 }), [0, 0, 0]),
      at(S.lathe([[0, 0], [I(0.3125), 0], ...S.thread(I(0.3125), I(1.0), I(3.4), { pitch: I(0.09), maxTurns: 12 }), [I(0.3125), I(3.45)], [0, I(3.45)]], 'zinc', { seg: 12 }), [0, I(0.62), 0]),
    );
    api.part('2', at(e, [x, y0, z]), [0, 0.12, 0]);
    const nf = group(
      at(S.lathe([[I(0.33), 0], [I(0.65), 0], [I(0.6), I(0.12)], [I(0.33), I(0.12)], [I(0.33), 0]], 'zinc', { seg: 24 }), [0, 0, 0]),
      at(nut(I(0.9375), I(0.5), 'zinc'), [0, I(0.12 + 0.25), 0]),
    );
    api.part('7', at(nf, [x, I(EYE.top + 0.42), z]), [0, 0.24, 0]);
  }
  return { view: { dir: [0.85, 0.75, -0.95] } };
}

/** Écrou Nylstop (frein nylon) de diamètre d po, axe Y (ou X), centré en pos. */
function nylstop(api, d, pos, axis = 'y') {
  const S = api.S, af = d * 1.5 * IN, h = d * 0.85 * IN;
  const g = S.group(S.nut(af, h * 0.72, 'zinc', { pos: [0, -h * 0.14, 0] }), S.cyl(af * 0.47, h * 0.3, 'white', { seg: 18, pos: [0, h * 0.36, 0] }));
  return S.at(axis === 'x' ? S.group(S.at(g, [0, 0, 0], [0, 0, -Math.PI / 2])) : g, pos);
}

// P064 — Vérin stinger 6 pi CX036209 rév. 2 (coupe page 64, vue page 66) :
// « STINGER CYLINDER - 6FT », repère 7 de l'avance P028 (deux vérins, de part
// et d'autre du mât). Vérin double tige : le fût 5 (mécano-soudé) porte au
// centre un bloc carré de 4 1/2 po où se vissent les quatre clapets
// d'équilibrage (2 : CP004070 côté orifices E, 4 : CP007511, pilotage
// 1500 / 3000 psi du schéma) et les orifices SAE-6 E1, E2 (face +Z), R1, R2
// (face −Z), deux orifices de liaison sur la face des clapets 2 ; deux tubes
// Ø 4 × 1/4 po soudés au bloc, orifices de fond de tige près des têtes. Dans
// chaque demi-vérin, du bloc vers la tête : écrou 1-12 UNF tout métal (1)
// dans le lamage du piston (8 : joint 13.2, bague 13.3, torique 13.1), tige
// chromée Ø 3 po (7 en haut, 6 en bas) à queue Ø 1 po, entretoise de course
// (10), tête (9) vissée sur le tube (torique 13.4 et anti-extrusion 13.5 au
// nez, bague 13.6, joint 13.8, racleur 13.7), bloquée par une vis de pression
// 1/4-28 à bout nylon (3) ; capuchon d'usure strié (11) au bout de la tige.
// Huit coudes 90° ORB-6 / JIC-6 (12). 13 : trousse de joints (ses joints sont
// posés un à un). Vérin dessiné rentré (pistons contre le bloc).
// Simulation : tige, piston, écrou, entretoise, capuchon et joints de piston
// du haut suivent « stingUp », ceux du bas « stingDn » ; fût, têtes et
// clapets restent sur l'avance.
// Repère : origine au centre du bloc, sur l'axe ; Y le long de l'axe (tige 7
// vers +Y) ; orifices E vers +Z, R vers −Z, clapets 2 vers +X, 4 vers −X.
// Placement dans P028 : STINGER_PLACES (centres des blocs à y = 1.5 sur les
// axes FEED.stingers, orifices E vers l'extérieur). Encombrement ≈ 0.25 (X,
// clapets) × 3.51 (Y, de −1.755 à 1.755 : dessous des patins bas à
// FEED.stingerFoot) × 0.17 (Z) m.
// Cotes : alésage 3 1/2 po et tige 3 po (trousse « 3.5X3.0 »), filets 1-12 et
// 1/4-28 (liste) ; tête, piston, entretoise et capuchon repris du vérin 50/50
// CX077007 (mêmes pièces CX077007-003 à -006) ; course 24 po par côté.
import { body } from '../layout.js';
import { FEED } from '../feed.js';
import { STINGER_Y, seal, oring, wiper, elbowLite, place } from './_feed.js';

const IN = 0.0254;
const u = (v) => v * IN;
const G = 0.02; // jeu radial (po)
const HP = 66.18; // face extérieure de la tête (po)
const Y = {
  block: 2.8, pistonIn: 2.86, nutIn: 2.92, cbore: 3.72, pistonOut: 4.56,
  spacerOut: HP - 2.46 - 24, pilot: HP - 2.46, hpIn: HP - 2.9, tubeEnd: HP - 1.8, hpOut: HP,
  rodStep: HP + 1.44, rodEnd: HP + 2.44, capTop: HP + 2.91, portD: HP - 3.54, setScrew: HP - 2.56, spanner: HP - 1.46,
};
const R = { tube: 2.0, bore: 1.75, rod: 1.5, hp: 2.25, pin: 0.5, blk: 2.25 };
const VY = 1.2, PY = 1.0; // clapets, orifices E / R (± depuis le centre)

// Poses dans le repère de l'avance : E vers −X (vérin −X), vers +X (vérin +X).
export const STINGER_PLACES = [
  { pos: [FEED.stingers[0][0], STINGER_Y, FEED.stingers[0][1]], rot: [0, -Math.PI / 2, 0] },
  { pos: [FEED.stingers[1][0], STINGER_Y, FEED.stingers[1][1]], rot: [0, Math.PI / 2, 0] },
];
export const STINGER = { barrelR: u(R.tube), headR: u(R.hp), faces: [-u(Y.hpOut), u(Y.hpOut)], ends: [-u(Y.capTop), u(Y.capTop)], stroke: u(24), blockHalf: u(Y.block), blockW: u(2 * R.blk) };

export default function P064(api) {
  const { S } = api;
  const { lathe, thread, slotted, roundHole, weldRing, merged, nut, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const L = (pts, mat, seg = 40, opts = {}) => lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg, ...opts });
  const half = (obj, s) => (s > 0 ? obj : at(group(obj), [0, 0, 0], [0, 0, Math.PI]));
  const E = (e, s) => (s > 0 ? e : [-e[0], -e[1], e[2]]);
  const mob = (o, s) => body(s > 0 ? 'stingUp' : 'stingDn', o);

  // ================================================ 5 — fût : bloc des clapets, tubes, orifices
  const b = u(R.blk), ch = u(0.25), hb = u(Y.block);
  const sq = [[-b + ch, -b], [b - ch, -b], [b, -b + ch], [b, b - ch], [b - ch, b], [-b + ch, b], [-b, b - ch], [-b, -b + ch]];
  const shape = new api.THREE.Shape(sq.map(([x, z]) => new api.THREE.Vector2(x, z)));
  const bg = new api.THREE.ExtrudeGeometry(shape, { depth: 2 * hb, bevelEnabled: true, bevelSize: 0.0015, bevelThickness: 0.0015, bevelOffset: -0.0015, bevelSegments: 1 });
  bg.translate(0, 0, -hb); bg.rotateX(Math.PI / 2);
  const blockM = new api.THREE.Mesh(bg);
  // lamages des orifices et des cavités : collerettes en saillie, alésages filetés
  const faceOf = (d, y, k = 0) => [d[0] * (b + k), y, d[2] * (b + k)];
  const spots = [], bores = [];
  const port = (d, y, r0, r1) => {
    spots.push(place(S.lathe([[r0, 0], [r1, 0], [r1, 0.0006], [r0, 0.0006], [r0, 0]], 'black', { seg: 20 }), faceOf(d, y), d));
    bores.push(place(S.lathe([[r0 * 0.98, 0.0004], ...thread(r0 * 0.96, -0.012, 0, { pitch: r0 * 0.25, maxTurns: 5, chamferBottom: false }).reverse(), [r0 * 0.96, -0.013], [0, -0.013]], 'steel', { seg: 16 }), faceOf(d, y), d));
  };
  for (const s of [1, -1]) {
    port([0, 0, 1], s * u(PY), u(0.28), u(0.42)); port([0, 0, -1], s * u(PY), u(0.28), u(0.42));
    port([1, 0, 0], s * u(2.2), u(0.28), u(0.42));
  }
  const tube = (s) => half(group(
    L([[R.bore, Y.block], [R.tube - 0.08, Y.block], [R.tube, Y.block + 0.1], [R.tube, Y.tubeEnd - 0.06], [R.tube - 0.06, Y.tubeEnd], [R.bore + 0.04, Y.tubeEnd], [R.bore, Y.tubeEnd - 0.04], [R.bore, Y.block]], 'black', 56),
    // bossage d'orifice de fond de tige (SAE-6), face vers +Z
    at(L([[0.3, 1.86], [0.5, 1.86], [0.5, 2.26], [0.46, 2.3], [0.3, 2.3], [0.3, 1.86]], 'black', 24, { axis: 'z' }), [0, u(Y.portD), 0]),
  ), s);
  const welds = merged([
    weldRing(u(R.tube), u(0.17), 'black', { pos: [0, hb, 0] }), weldRing(u(R.tube), u(0.17), 'black', { pos: [0, -hb, 0] }),
    ...[1, -1].map((s) => weldRing(u(0.52), u(0.12), 'black', { axis: 'z', pos: [0, s * u(Y.portD), u(1.93)] })),
  ], 'black');
  welds.geometry.userData.edgeAngle = 75;
  const fut = merged([blockM, ...spots, tube(1), tube(-1)], 'black');
  fut.userData.hasInterior = true;
  P('5', group(fut, merged(bores, 'steel'), welds), [0, 0, 0]);

  // ================================================ 2 / 4 — clapets d'équilibrage (cartouches)
  const cartridge = (big) => group(
    merged([
      L([[0, -1.1], ...thread(0.4, -1.1, -0.15, { pitch: 1 / 20, maxTurns: 10 }), [0.4, 0], [0.55, 0], [0.58, 0.03], [0.58, 0.17], [0.55, 0.2], [0, 0.2]], 'zinc', 24),
      at(nut(u(big ? 1.0 : 0.75), u(0.24), 'zinc'), [0, u(0.32), 0]),
      big ? L([[0, 0.44], [0.42, 0.44], [0.42, 0.9], [0.36, 0.96], [0, 0.96]], 'zinc', 24) : L([[0, 0.44], [0.3, 0.44], [0.3, 0.5], [0.22, 0.52], [0, 0.52]], 'zinc', 20),
    ], 'zinc'),
    merged(big
      ? [L([[0, 0.96], [0.14, 0.96], ...thread(0.14, 0.97, 1.3, { pitch: 1 / 24, maxTurns: 7 }), [0.12, 1.33], [0, 1.33]], 'steel', 16), at(nut(u(0.4375), u(0.16), 'steel'), [0, u(1.06), 0])]
      : [L([[0, 0.5], ...thread(0.16, 0.5, 0.92, { pitch: 1 / 24, maxTurns: 9, chamferBottom: false }), [0.16, 0.94], [0.13, 0.97], [0, 0.97]], 'steel', 16), at(nut(u(0.4375), u(0.16), 'steel'), [0, u(0.62), 0])], 'steel'),
    at(S.box(u(0.26), u(0.05), u(0.04), 'blackOxide'), [0, u(big ? 1.315 : 0.955), 0]),
  );
  for (const s of [1, -1]) {
    P('2', place(cartridge(false), [b, s * u(VY), 0], [1, 0, 0]), [0.1, 0, 0]);
    P('4', place(cartridge(true), [-b, s * u(VY), 0], [-1, 0, 0]), [-0.1, 0, 0]);
  }

  // ================================================ 12 — coudes ORB-6 / JIC-6
  const EL = [
    [[0, 0, 1], u(PY), [0, 1, 0]], [[0, 0, 1], -u(PY), [0, -1, 0]], [[0, 0, -1], u(PY), [0, 1, 0]], [[0, 0, -1], -u(PY), [0, -1, 0]],
    [[1, 0, 0], u(2.2), [0, 1, 0]], [[1, 0, 0], -u(2.2), [0, -1, 0]],
  ];
  EL.forEach(([d, y, out]) => P('12', place(elbowLite('orb', 6, 6), faceOf(d, y, 0.0006), d, out), [d[0] * 0.08, 0, d[2] * 0.08]));
  for (const s of [1, -1]) P('12', place(elbowLite('orb', 6, 6), [0, s * u(Y.portD), u(2.3)], [0, 0, 1], [0, s, 0]), [0, s * 0.05, 0.08]);

  // ================================================ têtes, tiges et pistons
  const DX = 0.16, LIFT = 0.3;
  const spannerHoles = [0, Math.PI].flatMap((a) => roundHole(a, u(Y.spanner), u(0.14), u(R.hp), { steps: 8 }));
  const setHole = roundHole(Math.PI, u(Y.setScrew), u(0.125), u(R.hp), { steps: 8 });
  for (const s of [1, -1]) {
    // 9 — tête
    const collar = slotted(u(R.hp), u(R.tube + G), u(Y.hpIn + 0.05), u(Y.hpOut - 0.05), [...spannerHoles, ...setHole], 'black', { seg: 64 });
    const turned = L([
      [R.rod + G, Y.pilot], [R.bore - G, Y.pilot], [R.bore - G, Y.pilot + 0.12], [R.bore - 0.14, Y.pilot + 0.12], [R.bore - 0.14, Y.pilot + 0.3], [R.bore - G, Y.pilot + 0.3],
      [R.bore - G, Y.tubeEnd], [R.tube + G, Y.tubeEnd], [R.tube + G, Y.hpOut - 0.05],
      [R.hp, Y.hpOut - 0.05], [R.hp - 0.04, Y.hpOut], [1.78, Y.hpOut], [1.78, Y.hpOut - 0.28], [R.rod + G, Y.hpOut - 0.28],
      [R.rod + G, Y.hpOut - 0.86], [1.68, Y.hpOut - 0.86], [1.68, Y.hpOut - 1.36], [R.rod + G, Y.hpOut - 1.36],
      [R.rod + G, Y.hpOut - 1.56], [1.62, Y.hpOut - 1.56], [1.62, Y.hpOut - 2.01], [R.rod + G, Y.hpOut - 2.01], [R.rod + G, Y.pilot],
    ], 'black', 64);
    const skirt = L([[R.tube + G, Y.hpIn], [R.hp - 0.04, Y.hpIn], [R.hp, Y.hpIn + 0.04], [R.hp, Y.hpIn + 0.05], [R.tube + G, Y.hpIn + 0.05], [R.tube + G, Y.hpIn]], 'black', 64);
    const hp = merged([collar, turned, skirt], 'black');
    hp.userData.hasInterior = true;
    P('9', half(hp, s), E([DX, LIFT + 0.12, 0], s));
    // joints de tête : torique + anti-extrusion au nez, bague, joint, racleur
    P('13.4', half(oring(u(R.bore - 0.14 + 0.07), u(0.07), u(Y.pilot + 0.17), 'rubber', 40), s), E([DX + 0.06, LIFT + 0.05, 0], s));
    P('13.5', half(seal(u(R.bore - 0.14), u(R.bore - G), u(Y.pilot + 0.25), u(Y.pilot + 0.3), 'white', 40), s), E([DX + 0.09, LIFT + 0.05, 0], s));
    P('13.6', half(seal(u(R.rod + G), u(1.62), u(Y.hpOut - 2.01), u(Y.hpOut - 1.56), 'cream', 40), s), E([DX + 0.12, LIFT + 0.1, 0], s));
    P('13.8', half(seal(u(R.rod + G), u(1.68), u(Y.hpOut - 1.36), u(Y.hpOut - 0.86), 'rubber', 40), s), E([DX + 0.15, LIFT + 0.1, 0], s));
    P('13.7', half(wiper(u(R.rod + G), u(1.78), u(Y.hpOut - 0.28), u(Y.hpOut), 'rubber', 40), s), E([DX + 0.18, LIFT + 0.14, 0], s));

    // 3 — vis de pression 1/4-28 × 5/16, bout nylon, vers −Z
    const ss = group(
      L([[0, 0.02], [0.1, 0.02], ...thread(0.125, 0.02, 0.3125, { pitch: 1 / 28, maxTurns: 7, chamferBottom: false }).slice(1), [0.07, 0.3125], [0.07, 0.2], [0, 0.2]], 'blackOxide', 12),
      L([[0, 0], [0.07, 0], [0.08, 0.01], [0.08, 0.03], [0, 0.03]], 'white', 12),
    );
    P('3', half(at(ss, [0, u(Y.setScrew), -u(2.24 - 0.3125)], [-Math.PI / 2, 0, 0]), s), E([DX, LIFT + 0.12, -0.05], s));

    // 7 (haut) / 6 (bas) — tige chromée Ø 3 po, queue filetée 1-12 UNF, lamage du capuchon
    const shaft = group(
      L([
        [0, Y.cbore - 0.25], [R.pin, Y.cbore - 0.25], [R.pin, Y.pistonOut], [R.rod - 0.05, Y.pistonOut], [R.rod, Y.pistonOut + 0.05],
        [R.rod, Y.rodStep - 0.05], [1.42, Y.rodStep], [1.42, Y.rodEnd - 0.04], [1.38, Y.rodEnd], [0.72, Y.rodEnd],
        [0.72, Y.rodEnd - 1.0], [0.6, Y.rodEnd - 1.0], [0, Y.rodEnd - 1.35],
      ], 'chrome', 48),
      L([[0, Y.nutIn], ...thread(R.pin, Y.nutIn, Y.cbore - 0.25, { pitch: 1 / 12, maxTurns: 10 }), [0, Y.cbore - 0.25]], 'steel', 20),
    );
    P(s > 0 ? '7' : '6', mob(half(shaft, s), s), E([DX, LIFT, 0], s));

    // 11 — capuchon d'usure strié
    const kn = [];
    for (let i = 0; i < 9; i++) { const r0 = 1.5 - i * 0.16; kn.push([r0, Y.capTop - 0.03], [r0 - 0.08, Y.capTop]); }
    P('11', mob(half(L([[0, Y.rodEnd - 0.9], [0.66, Y.rodEnd - 0.9], [0.7, Y.rodEnd - 0.86], [0.7, Y.rodEnd + 0.04], [1.46, Y.rodEnd + 0.04], [1.5, Y.rodEnd + 0.08], ...kn, [0, Y.capTop]], 'darkSteel', 48), s), s), E([DX, LIFT + 0.2, 0], s));

    // 10 — entretoise de course
    P('10', mob(half(L([[R.rod + G, Y.pistonOut + 0.02], [1.66, Y.pistonOut + 0.02], [1.69, Y.pistonOut + 0.05], [1.69, Y.spacerOut - 0.03], [1.66, Y.spacerOut], [R.rod + G, Y.spacerOut], [R.rod + G, Y.pistonOut + 0.02]], 'steel', 48), s), s), E([DX, LIFT + 0.06, 0], s));

    // 8 — piston, joints 13.1 / 13.2 / 13.3
    const LAND = R.bore - 0.03;
    P('8', mob(half(L([
      [0.9, Y.pistonIn], [LAND - 0.04, Y.pistonIn], [LAND, Y.pistonIn + 0.04], [LAND, 3.1], [1.62, 3.1], [1.62, 3.4], [LAND, 3.4],
      [LAND, 3.5], [1.45, 3.5], [1.45, 3.92], [LAND, 3.92], [LAND, 4.12], [1.6, 4.16], [1.6, Y.pistonOut - 0.04], [1.56, Y.pistonOut],
      [R.pin + G, Y.pistonOut], [R.pin + G, 4.25], [0.6, 4.25], [0.6, 4.12], [R.pin + G, 4.12], [R.pin + G, Y.cbore],
      [0.9, Y.cbore], [0.9, Y.pistonIn],
    ], 'steel', 48), s), s), E([DX, LIFT - 0.08, 0], s));
    P('13.3', mob(half(seal(u(1.62), u(R.bore - 0.005), u(3.1), u(3.4), 'cream', 40), s), s), E([DX + 0.06, LIFT - 0.08, 0], s));
    P('13.2', mob(half(seal(u(1.45), u(R.bore - 0.005), u(3.5), u(3.92), 'rubber', 40), s), s), E([DX + 0.1, LIFT - 0.08, 0], s));
    P('13.1', mob(half(oring(u(0.6 + 0.035), u(0.04), u(4.185), 'rubber', 24), s), s), E([DX + 0.14, LIFT - 0.08, 0], s));

    // 1 — écrou 1-12 UNF tout métal
    P('1', mob(half(group(merged([
      at(nut(u(1.5), u(0.62), 'zinc'), [0, u(Y.cbore - 0.31), 0]),
      L([[0.56, Y.nutIn], [0.68, Y.nutIn], [0.72, Y.nutIn + 0.18], [0.56, Y.nutIn + 0.18], [0.56, Y.nutIn]], 'zinc', 24),
    ], 'zinc')), s), s), E([DX, LIFT - 0.16, 0], s));
  }
  // 13 — trousse de joints : ses joints sont posés ci-dessus.
  return { view: { dir: [0.35, 0.15, 1] } };
}

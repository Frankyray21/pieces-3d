// P122 — Vérin du bras de tige CM78802 rév. 1 (page 122) : « CYLINDER - Ø3"
// X 6 1/8" STROKE », alésage 3 po, course 6 1/8 po. Il fait tourner l'arbre du
// bras de tige (11 de P116) par le bras de pivot P126 : œil de fond sur la
// chape haute du bras pivotant P130, œil de tige sur la chape du bras de pivot.
// Vérin soudé dessiné rentré en coupe A-A, avec une vue de dessus et une
// isométrique :
// - corps soudé (4) : tube Ø 3 1/2 × 1/4 po soudé sur un fond à collerette
//   (gorge de soudure en V), chape de fond à œil plat Ø 2.7 × 1 1/4 po percée
//   d'un trou de graissage, deux bossages d'orifice SAE -04 côté -X fermés par
//   des bouchons à six-pans creux et joint torique (8, FA01280-04) ;
// - tête (6) emmanchée au ras du bout du tube : torique et bague
//   anti-extrusion dans la gorge extérieure, joint de tige et racleur (trousse
//   9, dessinés et enregistrés sous le repère 9 avec ceux du piston) ;
// - tige soudée (7) : tige chromée Ø 1 1/4 po, queue 7/8-14 UNF sous le
//   piston, œil plat Ø 2.25 × 1 1/4 po soudé au bout (gorge de dégagement) ;
// - piston (5) à joint central et deux bagues de guidage, serré par l'écrou
//   frein 7/8-14 (1) ;
// - deux rotules Ø 1 po (2) et leurs anneaux d'arrêt (3), une dans chaque œil.
// Repère : origine sur l'axe de l'œil de fond, Y le long du vérin vers la
// tige ; Z selon les axes des deux œils (parallèles) ; X en travers, orifices
// et bouchons vers -X. Vérin rentré : entraxe 13.2 po (0.335 m), sorti 19.33
// po (0.491 m). Option { ext } : tige sortie de ext (m) (pièces côté tige
// marquées rodSide pour la simulation, voir ../layout.js).
// Encombrement rentré ≈ 0.11 (X, des bouchons à -0.065 au bord du fond à
// +0.05) × 0.37 (Y, de -0.034 à +0.364) × 0.099 (Z) m.
// Cotes : liste (alésage, course, écrou 7/8-14, bouchons -04) ; le reste relevé
// sur la coupe A-A à l'échelle de l'alésage (117 px/po sur l'agrandissement) :
// tube 3.47 po, tige 1.24 po, entraxe 13.2 po, œils R 1.33 / 1.12 po, rotules
// Ø 1.5 po ; orifices à 2.41 et 9.84 po, œils de 1 1/4 po (vue de dessus).
import { rodSide } from '../layout.js';
import { L, u, hex, orbPlug } from './_carousel.js';

// Cotes axiales (po) depuis l'œil de fond, vérin rentré.
const Y = {
  capTip: -1.35, // bout arrondi de la chape de fond
  capBot: 1.37, // pied du fond (fin de la chape)
  rim: 1.62, // collerette du fond
  tubeBot: 1.81, // bout du tube (gorge de soudure)
  nutBot: 2.05,
  pistonBot: 2.48,
  pistonTop: 3.56,
  headBot: 9.69, // dessous de la tête (= haut du piston + course)
  tubeTop: 11.47,
  rodEnd: 11.62, // fin de la tige Ø 1 1/4 (gorge)
  eyeBot: 11.74, // pied de l'œil de tige
  eye: 13.2,
};
const STROKE = 6.125;
const TUBE = 1.735, BORE = 1.5, ROD = 0.625, TH = 0.4375;
const EYE = { R: 1.35, rodR: 1.12, w: 1.25, bore: 0.75 };
const PORTS = [2.41, 9.84];
const BOSS = { r: 0.465, face: 2.36 };

export const CYL122 = {
  retracted: u(Y.eye),
  stroke: u(STROKE),
  eyeW: u(EYE.w),
  portX: -u(BOSS.face),
  portY: PORTS.map(u),
  tubeR: u(TUBE),
};

export default function P122(api, opts = {}) {
  const { THREE, S } = api;
  const { extrude, merged, group, at, slotted, roundHole, weldRing } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const ext = Math.max(0, Math.min(opts.ext ?? 0, u(STROKE)));
  const E = ext / 0.0254; // sortie de tige (po)

  // Œil plat (po) : bloc de demi-largeur R prolongé jusqu'au pied yb, bout en
  // demi-cercle autour de (0, yc), extrudé sur w selon Z, alésage de la rotule.
  const eyeBlock = (yc, yb, R, sign, mat) => {
    const n = 18, pts = [[R, yb], [R, yc]];
    for (let i = 1; i < n; i++) {
      const a = (i / n) * Math.PI;
      pts.push([R * Math.cos(a), yc + sign * R * Math.sin(a)]);
    }
    pts.push([-R, yc], [-R, yb]);
    const p = sign > 0 ? pts : pts.reverse();
    return extrude(p.map(([a, y]) => [u(a), u(y)]), u(EYE.w), mat, { holes: [[0, u(yc), u(EYE.bore)]] });
  };

  // ================================================ 4 — corps soudé
  const portHoles = PORTS.flatMap((y) => roundHole(-Math.PI / 2, u(y), u(0.2), u(TUBE), { steps: 6 }));
  const tube = slotted(u(TUBE), u(BORE), u(Y.tubeBot), u(Y.tubeTop - 0.06), portHoles, 'grey', { seg: 32 });
  const tubeEnd = L(api, [[BORE, Y.tubeTop - 0.06], [TUBE, Y.tubeTop - 0.06], [TUBE, Y.tubeTop - 0.05], [TUBE - 0.05, Y.tubeTop], [BORE, Y.tubeTop], [BORE, Y.tubeTop - 0.06]], 'grey', 32);
  // fond : collerette Ø 3.9, gorge en V vers le tube, face intérieure
  const cap = L(api, [[0, Y.capBot], [1.9, Y.capBot], [1.95, Y.capBot + 0.05], [1.95, Y.rim - 0.04], [1.9, Y.rim], [1.62, Y.rim + 0.12], [1.62, Y.tubeBot], [BORE, Y.tubeBot], [BORE, Y.tubeBot + 0.02], [0, Y.tubeBot + 0.02]], 'grey', 32);
  const lug = eyeBlock(0, Y.capBot + 0.05, EYE.R, -1, 'grey');
  const boss = (y) => L(api, [[0.2, 1.55], [BOSS.r, 1.55], [BOSS.r, BOSS.face - 0.04], [BOSS.r - 0.04, BOSS.face], [0.26, BOSS.face], [0.22, BOSS.face - 0.06], [0.2, BOSS.face - 0.08], [0.2, 1.55]], 'grey', 20, { axis: '-x', pos: [0, u(y), 0] });
  const greaseHole = L(api, [[0, 0], [0.09, 0], [0.09, 0.03], [0, 0.03]], 'darkSteel', 10, { axis: 'x', pos: [u(EYE.R - 0.02), 0, 0] });
  P('4', group(
    merged([tube, tubeEnd, cap, lug, ...PORTS.map(boss)], 'grey'),
    weldRing(u(1.7), u(0.2), 'grey', { pos: [0, u(Y.rim + 0.1), 0] }),
    ...PORTS.map((y) => weldRing(u(BOSS.r + 0.03), u(0.12), 'grey', { axis: 'x', pos: [-u(TUBE * 0.93), u(y), 0] })),
    greaseHole,
  ), [0, -0.04, 0]);

  // 8 — bouchons ORB -04 dans les deux bossages
  for (const y of PORTS) P('8', at(group(orbPlug(api, 4)), [-u(BOSS.face), u(y), 0], [0, 0, Math.PI / 2]), [-0.08, 0, 0]);

  // ================================================ 6 — tête
  const RG = ROD + 0.02;
  const head = L(api, [
    [RG, Y.headBot], [BORE - 0.1, Y.headBot], [BORE - 0.02, Y.headBot + 0.08], [BORE - 0.02, 10.95],
    [BORE - 0.16, 10.95], [BORE - 0.16, 11.2], [BORE - 0.02, 11.2], [BORE - 0.02, Y.tubeTop - 0.02],
    [BORE - 0.08, Y.tubeTop + 0.02], [0.95, Y.tubeTop + 0.02], [0.95, Y.tubeTop - 0.2], [RG, Y.tubeTop - 0.2],
    [RG, 10.8], [0.86, 10.8], [0.86, 10.35], [RG, 10.35], [RG, Y.headBot],
  ], 'darkSteel', 32);
  const keys = [-1, 1].map((s) => L(api, [[0, Y.tubeTop - 0.22], [0.12, Y.tubeTop - 0.22], [0.12, Y.tubeTop + 0.022], [0, Y.tubeTop + 0.022]], 'blackOxide', 10, { pos: [0, 0, s * u(1.2)] }));
  P('6', group(head, merged(keys, 'blackOxide')), [0, 0.12, 0]);

  // ================================================ 7 — tige soudée (côté tige)
  const rodEye = eyeBlock(Y.eye + E, Y.eyeBot + E, EYE.rodR, 1, 'grey');
  const neck = L(api, [[0, Y.rodEnd + E - 0.02], [0.5, Y.rodEnd + E - 0.02], [0.55, Y.eyeBot + E], [0.75, Y.eyeBot + E + 0.05], [0, Y.eyeBot + E + 0.05]], 'grey', 24);
  const rodBody = L(api, [[0, Y.pistonTop + E], [ROD - 0.04, Y.pistonTop + E], [ROD, Y.pistonTop + E + 0.04], [ROD, Y.rodEnd + E - 0.1], [ROD - 0.08, Y.rodEnd + E - 0.04], [0.5, Y.rodEnd + E - 0.02], [0, Y.rodEnd + E - 0.02]], 'chrome', 32);
  const thread = L(api, [[0, Y.nutBot + E - 0.06], [TH * 0.85, Y.nutBot + E - 0.06], ...S.thread(TH, Y.nutBot + E - 0.04, Y.pistonBot + E + 0.3, { pitch: 1 / 14, maxTurns: 6 }), [TH, Y.pistonTop + E], [0, Y.pistonTop + E]], 'steel', 14);
  const eyeGrease = L(api, [[0, 0], [0.09, 0], [0.09, 0.03], [0, 0.03]], 'darkSteel', 10, { axis: 'x', pos: [u(EYE.rodR - 0.02), u(Y.eye + E), 0] });
  P('7', rodSide(group(merged([rodEye, neck], 'grey'), rodBody, thread, weldRing(u(0.6), u(0.14), 'grey', { pos: [0, u(Y.eyeBot + E + 0.02), 0] }), eyeGrease)), [0, 0.3, 0]);

  // ================================================ 5 — piston (côté tige)
  const LAND = BORE - 0.02;
  P('5', rodSide(L(api, [
    [TH + 0.02, Y.pistonBot], [LAND - 0.05, Y.pistonBot], [LAND, Y.pistonBot + 0.05], [LAND, 2.7],
    [BORE - 0.25, 2.7], [BORE - 0.25, 3.34], [LAND, 3.34], [LAND, Y.pistonTop - 0.05], [LAND - 0.05, Y.pistonTop],
    [TH + 0.02, Y.pistonTop], [TH + 0.02, Y.pistonBot],
  ].map(([r, y]) => [r, y + E]), 'steel', 32)), [0, 0.12, 0.1]);

  // 1 — écrou frein 7/8-14 (six-pans 1 5/16, bague nylon)
  P('1', rodSide(group(
    hex(api, 1.3125, 0.32, Y.nutBot + E, 'zinc', TH * 0.95),
    L(api, [[TH * 0.95, Y.nutBot + E + 0.32], [0.6, Y.nutBot + E + 0.32], [0.58, Y.pistonBot + E - 0.01], [TH * 0.95, Y.pistonBot + E - 0.01], [TH * 0.95, Y.nutBot + E + 0.32]], 'zinc', 18),
  )), [0, 0.04, 0.1]);

  // ================================================ 9 — trousse de joints (dessinée)
  P('9', group(
    // tête : torique + bague anti-extrusion, joint de tige en U, racleur
    L(api, [[BORE - 0.15, 11.0], [BORE - 0.03, 11.0], [BORE - 0.03, 11.15], [BORE - 0.15, 11.15], [BORE - 0.15, 11.0]], 'rubber', 32),
    L(api, [[RG, 10.37], [0.84, 10.37], [0.84, 10.78], [RG, 10.78], [RG + 0.04, 10.57], [RG, 10.37]], 'blue', 28),
    L(api, [[RG, Y.tubeTop - 0.18], [0.93, Y.tubeTop - 0.18], [0.93, Y.tubeTop], [0.78, Y.tubeTop + 0.07], [RG, Y.tubeTop + 0.05], [RG, Y.tubeTop - 0.18]], 'rubber', 28),
  ), [0, 0.2, 0.12]);
  P('9', rodSide(group(
    L(api, [[BORE - 0.24, 2.76 + E], [BORE - 0.005, 2.76 + E], [BORE - 0.005, 3.28 + E], [BORE - 0.24, 3.28 + E], [BORE - 0.24, 2.76 + E]], 'rubber', 32),
    merged([2.56, 3.42].map((y) => L(api, [[BORE - 0.2, y + E - 0.06], [BORE - 0.005, y + E - 0.06], [BORE - 0.005, y + E + 0.06], [BORE - 0.2, y + E + 0.06], [BORE - 0.2, y + E - 0.06]], 'cream', 32)), 'cream'),
  )), [0, 0.12, 0.16]);

  // ================================================ 2 — rotules, 3 — anneaux d'arrêt
  const ball = () => {
    const ro = EYE.bore, ri = 0.5, w = 1.0, rb = 0.66;
    const g = new THREE.Group();
    g.add(L(api, [[rb * 0.92, -w / 2], [ro, -w / 2], [ro, w / 2], [rb * 0.92, w / 2], [rb * 0.92, -w / 2]], 'steel', 24));
    const prof = [];
    const a0 = Math.asin(0.6 / rb);
    for (let i = 0; i <= 8; i++) {
      const a = -a0 + (2 * a0 * i) / 8;
      prof.push([rb * Math.cos(a), rb * Math.sin(a)]);
    }
    g.add(L(api, [[ri, -0.6], ...prof, [ri, 0.6], [ri, -0.6]], 'chrome', 24));
    return g;
  };
  const clip = () => {
    const r = EYE.bore + 0.04, w = 0.09, t = 0.05;
    const ring = slotted(u(r), u(r - w), -u(t / 2), u(t / 2), [{ a: 0, w: 0.35, y0: -u(t), y1: u(t) }], 'blackOxide', { seg: 28 });
    const ears = [-1, 1].map((s) => at(S.cyl(u(0.07), u(t), 'blackOxide', { seg: 8 }), [u(r - 0.12) * Math.sin(s * 0.3), 0, u(r - 0.12) * Math.cos(s * 0.3)]));
    return merged([ring, ...ears], 'blackOxide');
  };
  const eyes = [{ y: 0, rod: false, e: [0, -0.06, 0.1] }, { y: Y.eye + E, rod: true, e: [0, 0.32, 0.1] }];
  for (const { y, rod, e } of eyes) {
    const b = at(group(ball()), [0, u(y), 0], [Math.PI / 2, 0, 0]);
    P('2', rod ? rodSide(b) : b, e);
    const c = at(group(clip()), [0, u(y), u(EYE.w / 2 - 0.06)], [Math.PI / 2, 0, 0]);
    P('3', rod ? rodSide(c) : c, [e[0], e[1], e[2] + 0.06]);
  }

  return { view: { dir: [-0.8, 0.5, 1] } };
}

// P114 — Vérin de verrouillage du centreur CX077813 (page 114) : « CYLINDER
// - Ø2.25 X 1.88 ST », alésage 2 1/4 po, course 1 7/8 po. Vérin compact à
// bride (P098 repère 13), fixé sous le caisson du châssis P102 par quatre
// vis CHC 3/8 (P098 repères 20 et 23) : sa tige, terminée en pêne conique,
// entre dans les bagues du verrou (P102 repère 2). Demi-coupe :
// - corps (1) : tube Ø 3 po à fond intégré, alésage étagé (Ø 2 1/4, puis
//   Ø 2 1/2 côté tête), bride ronde Ø 4.72 × 1/2 po soudée au bout et ses
//   quatre trous, deux bossages d'orifice SAE 9/16-18 (-06) ;
// - tige-pêne (2) Ø 1 1/2 po, bout conique, queue filetée dans le piston (3) ;
// - tête (4) logée dans l'alésage Ø 2 1/2, tenue par l'anneau d'arrêt (5) ;
// - joints de la trousse 6, dessinés un à un (7 à 11, NSS) : torique (7) et
//   bague anti-extrusion (8) sur la tête, joint de tige (9) et racleur (10)
//   dans la tête, joint de piston PSP (11).
// Repère : origine sur l'axe, face avant de la bride (côté tige, face
// d'appui sous le châssis), Y le long de l'axe vers le pêne (vers le haut
// dans P098) ; orifices vers +X. Tige rentrée : bout du pêne à y = 2.13 po
// (0.054 m), sortie : 4.01 po. Encombrement ≈ 0.120 (X, bride Ø 4.72 po) ×
// 0.173 (Y, de -0.119 au fond à +0.054) × 0.120 (Z) m.
// Cotes : liste (alésage, course) ; le reste relevé sur la coupe à l'échelle
// de l'alésage (258 px/po sur la vue agrandie) : tube Ø 3 × 5 po, tige
// Ø 1 1/2, piston 0.82 po, tête 1.63 po, bride Ø 4.72 × 0.5 po.
import { L, u, circlip } from './_avance_b.js';

const Y = {
  bot: -4.69, capIn: -4.19, pistonTop: -3.37, shoulder: -3.3, portA: -4.07,
  headBot: -1.55, step: -1.01, portB: -1.37, flange: -0.5, headTop: 0.08, tubeTop: 0.31,
  taper: 1.4, nose: 2.13,
};
const R = { tube: 1.51, bore: 1.125, bore2: 1.26, rod: 0.75, nose: 0.56, pilot: 0.48, flange: 2.36 };
const G = 0.015;
const STROKE = 1.88;
const BC = 1.95; // cercle des trous de bride (rayon)
const BOSS = { r: 0.475, face: 2.13 };

export const LOCK114 = {
  stroke: u(STROKE),
  noseRetracted: u(Y.nose), // bout du pêne, tige rentrée (m, depuis la face de bride)
  rodR: u(R.rod),
  flangeR: u(R.flange),
  flangeT: u(-Y.flange),
  boltHoles: [45, 135, 225, 315].map((a) => [u(BC * Math.cos((a * Math.PI) / 180)), u(BC * Math.sin((a * Math.PI) / 180))]), // [x, z]
  bottomY: u(Y.bot),
  ports: [[u(BOSS.face), u(Y.portA)], [u(BOSS.face), u(Y.portB)]], // [x, y], vers +X
};

export default function P114(api) {
  const { THREE, S } = api;
  const { extrude, slotted, roundHole, weldRing, merged, group, torus } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // ================================================ 1 — corps
  // Fond intégré (lamage chanfreiné à l'extérieur), alésage étagé, bout
  // chanfreiné ; trous d'orifice vers +X (angle π/2 de slotted()).
  const holes = [Y.portA, Y.portB].flatMap((y) => roundHole(Math.PI / 2, u(y), u(0.2), u(R.tube), { steps: 8 }));
  const wall = slotted(u(R.tube), u(R.bore), u(Y.capIn), u(Y.step), holes, 'grey', { seg: 48 });
  const turned = L(S, [
    [0, Y.bot], [1.2, Y.bot], [R.tube - 0.04, Y.bot + 0.0], [R.tube, Y.bot + 0.06], [R.tube, Y.capIn],
    [R.bore, Y.capIn], [0, Y.capIn],
  ], 'grey', 48);
  const front = L(S, [[R.bore, Y.step], [R.tube, Y.step], [R.tube, Y.tubeTop - 0.05], [R.tube - 0.05, Y.tubeTop], [R.bore2 + 0.04, Y.tubeTop], [R.bore2, Y.tubeTop - 0.04], [R.bore2, Y.step + 0.05], [R.bore, Y.step]], 'grey', 48);
  // Bride ronde, quatre trous Ø 13/32 à 45°.
  const fl = extrude(
    Array.from({ length: 48 }, (_, i) => [u(R.flange) * Math.cos((i / 48) * Math.PI * 2), u(R.flange) * Math.sin((i / 48) * Math.PI * 2)]),
    u(-Y.flange), 'grey',
    { holes: [[0, 0, u(R.tube - 0.01)], ...LOCK114.boltHoles.map(([x, z]) => [x, -z, u(0.203)])] },
  );
  fl.rotation.x = -Math.PI / 2;
  fl.position.y = u(Y.flange / 2);
  const boss = (y) => L(S, [
    [0.2, 1.2], [BOSS.r, 1.2], [BOSS.r, BOSS.face - 0.04], [BOSS.r - 0.04, BOSS.face],
    [0.33, BOSS.face], [0.28, BOSS.face - 0.05], [0.28, 1.6], [0.2, 1.55], [0.2, 1.2],
  ], 'grey', 24, { axis: 'x', pos: [0, u(y), 0] });
  const body = merged([wall, turned, front, fl, boss(Y.portA), boss(Y.portB)], 'grey');
  body.userData.hasInterior = true;
  const beads = merged([
    weldRing(u(R.tube + 0.04), u(0.16), 'grey', { pos: [0, u(Y.flange - 0.06), 0] }),
    ...[Y.portA, Y.portB].map((y) => weldRing(u(BOSS.r + 0.03), u(0.11), 'grey', { axis: 'x', pos: [u(1.45), u(y), 0] })),
  ], 'grey');
  beads.geometry.userData.edgeAngle = 75;
  P('1', group(body, beads), [0, 0, 0]);

  // ================================================ tige, piston
  // 2 — tige-pêne chromée, cône au bout, queue filetée.
  const rod = merged([
    L(S, [[0, Y.shoulder], [R.rod - 0.03, Y.shoulder], [R.rod, Y.shoulder + 0.03], [R.rod, Y.taper], [R.nose, Y.nose - 0.03], [R.nose - 0.03, Y.nose], [0, Y.nose]], 'chrome', 40),
  ], 'chrome');
  const tail = L(S, [[0, Y.capIn + 0.04], [R.pilot - 0.04, Y.capIn + 0.04], ...S.thread(R.pilot, Y.capIn + 0.08, Y.shoulder - 0.05, { pitch: 1 / 14, maxTurns: 12 }), [R.pilot, Y.shoulder], [0, Y.shoulder]], 'steel', 20);
  P('2', group(rod, tail), [0.1, 0.07, 0]);
  // 3 — piston : gorge du joint PSP, chanfreins.
  const land = R.bore - G - 0.01;
  P('3', L(S, [
    [R.pilot + G, Y.capIn], [land - 0.04, Y.capIn], [land, Y.capIn + 0.04], [land, -3.84],
    [1.0, -3.84], [1.0, -3.52], [land, -3.52], [land, Y.pistonTop - 0.04], [land - 0.04, Y.pistonTop],
    [R.pilot + G, Y.pistonTop], [R.pilot + G, Y.capIn],
  ], 'steel', 48), [0.1, 0.03, 0]);
  // 11 — joint de piston PSP (bague de glissement sur élastomère)
  P('11', L(S, [[1.01, -3.83], [R.bore - G, -3.8], [R.bore - G, -3.56], [1.01, -3.53], [1.01, -3.83]], 'blue', 48), [0.1, -0.02, 0]);

  // ================================================ tête et joints
  // 4 — tête : nez Ø 2 1/4 dans l'alésage étroit, corps Ø 2 1/2, gorges du
  // torique et de la bague anti-extrusion (extérieur), du joint de tige et
  // du racleur (intérieur).
  P('4', L(S, [
    [R.rod + G, Y.headBot], [R.bore - G - 0.04, Y.headBot], [R.bore - G, Y.headBot + 0.04], [R.bore - G, Y.step],
    [R.bore2 - G, Y.step + 0.02], [R.bore2 - G, -0.72], [1.12, -0.72], [1.12, -0.44], [R.bore2 - G, -0.44],
    [R.bore2 - G, Y.headTop - 0.03], [R.bore2 - 0.04, Y.headTop], [0.98, Y.headTop], [0.98, -0.28], [R.rod + G, -0.28],
    [R.rod + G, -0.6], [0.92, -0.6], [0.92, -0.83], [R.rod + G, -0.83], [R.rod + G, Y.headBot],
  ], 'grey', 48), [0, 0.17, 0]);
  // 7 — torique, 8 — bague anti-extrusion (côté tige)
  P('7', torus(u(1.185), u(0.065), 'rubber', { pos: [0, u(-0.64), 0] }), [0, 0.075, 0]);
  P('8', L(S, [[1.13, -0.54], [R.bore2 - G, -0.54], [R.bore2 - G, -0.45], [1.13, -0.45], [1.13, -0.54]], 'white', 48), [0, 0.1, 0]);
  // 9 — joint de tige en U, 10 — racleur à lèvre
  P('9', L(S, [[R.rod + G, -0.81], [0.91, -0.81], [0.91, -0.62], [0.86, -0.62], [0.83, -0.72], [0.8, -0.62], [R.rod + G, -0.62], [R.rod + G, -0.81]], 'blue', 40), [0, 0.13, 0]);
  P('10', L(S, [[R.rod + 0.005, -0.27], [0.97, -0.27], [0.97, Y.headTop + 0.02], [0.86, Y.headTop + 0.1], [R.rod + 0.005, Y.headTop + 0.12], [R.rod + 0.005, -0.27]], 'rubber', 40), [0, 0.21, 0]);
  // 5 — anneau d'arrêt intérieur dans la gorge du tube, au-dessus de la tête
  P('5', group(S.merged([circlip(S, THREE, 1.33, { t: 0.07, w: 0.12 })], 'blackOxide')).translateY(u(Y.headTop + 0.06)), [0, 0.25, 0]);

  return { view: { dir: [0.9, 0.55, 1.1] } };
}

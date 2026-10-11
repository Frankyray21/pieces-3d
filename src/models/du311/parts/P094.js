// P094 — Vérin de pivotement du centreur CX016039 rév. 0 (page 94) :
// « CYLINDER - Ø3" X 4 1/2" ST », alésage 3 po, course 4 1/2 po. Deux vérins
// (repère 1 de P092) font pivoter le centreur fendu sur les axes du pied de
// mât : œil de fond attelé aux chapes basses du châssis P102 (axe P098
// repère 7), œil de tige sur l'axe Ø 1 po du pied de mât (P116 repère 5).
// Vérin soudé à tête intérieure, dessiné rentré, demi-coupe à gauche :
// - tube soudé (15) : tube Ø 3 1/2 × 1/4 po, fond de 1/2 po (chanfrein de
//   soudure), chape de fond plate (œil Ø 2 3/4 po), deux bossages d'orifice
//   SAE 7/16-20 côté -X, chacun fermé par un bouchon à joint torique (16) ;
// - tête (1) dans l'alésage, affleurante au bout du tube (racleur et joints
//   de la trousse 18 suggérés) ; piston (6) à joint central, chambré dessous
//   pour l'écrou de blocage 1"-14 UNS (10) ;
// - tige chromée Ø 1 1/4 po (11), queue Ø 1 po filetée sous le piston, bout
//   fileté 1 1/8 po vissé dans la tête de tige (12) à fût rond Ø 1 3/4 po et
//   œil plat, bloquée par le contre-écrou (17) ;
// - deux rotules Ø 1 po (13, bague Ø 1.65 × 0.63 po) et leurs circlips (14),
//   une dans chaque œil : la liste nomme 13 et 14 deux fois, d'abord sous la
//   tête de tige (12), puis sous le tube (15). Les lignes répétées désignent
//   la pièce de la première (check-models, src/data/equipment.js) : les objets
//   13 et 14 sont ceux de la tête de tige (éclatés avec elle, puis selon Z) ;
//   la rotule et le circlip de l'œil de fond, identiques, sont dessinés en
//   place dans l'objet du tube soudé (15).
// Repère : origine sur l'axe de l'œil de fond, Y le long du vérin vers la
// tige ; Z selon les axes des deux œils (axes de pivot verticaux dans P092) ;
// X en travers, orifices et bouchons vers -X. Vérin rentré : entraxe des
// œils 13.95 po (0.354 m), sorti 18.45 po (0.469 m). Encombrement ≈ 0.109
// (X, de -0.064 aux bouchons à +0.045) × 0.424 (Y, de -0.035 à 0.389) ×
// 0.089 (Z, tube Ø 3 1/2 ; œils de 1 et 7/8 po) m.
// Cotes : liste (alésage, course, écrou 1"-14, bouchons 7/16-20) ; le reste
// relevé sur la coupe à l'échelle de l'alésage (38,7 px/po sur la page) :
// tube 8 po, tête 1.86 po, piston 1.05 po, œils R 1.35-1.38 po.
import { L, u, along, hexNut, sphericalBearing, circlip, orbPlug } from './_avance_b.js';

// Cotes axiales (po), vérin rentré, depuis l'axe de l'œil de fond.
const Y = {
  capTip: -1.38, // bout arrondi de la chape de fond
  capBot: 1.36, // dessous du fond (haut de la chape)
  tubeBot: 1.85, // face intérieure du fond = bout du tube
  nutBot: 2.03,
  pistonBot: 2.45,
  cbore: 2.9, // fond du chambrage de l'écrou
  pistonTop: 3.48,
  portA: 2.41,
  hpBot: 7.98, // dessous de la tête = haut du piston + course
  portB: 7.98,
  tubeTop: 9.84,
  shoulder: 10.36, // épaulement de la tige (début du filet 1 1/8)
  jamTop: 11.05,
  shankTop: 12.55,
  eye: 13.95, // axe de l'œil de tige (rentré)
  rodEnd: 12.4,
};
const STROKE = 4.5;
const TUBE = 1.75, BORE = 1.5, ROD = 0.625, PILOT = 0.5, TH = 0.5625; // rayons (po)
const G = 0.02; // jeu radial entre pièces emboîtées
const EYE = { R: 1.37, t: 1.0, rodR: 1.35, rodT: 0.875, hole: 0.835 };
const BRG = { rOut: 0.825, rIn: 0.5, w: 0.63 };
const BOSS = { r: 0.45, face: 2.38 };

export const CYL094 = {
  retracted: u(Y.eye), // entraxe des œils, vérin rentré (m)
  stroke: u(STROKE),
  pinD: u(1.0), // alésage des rotules
  capEyeW: u(EYE.t), // épaisseur de l'œil de fond (selon Z)
  rodEyeW: u(EYE.rodT),
  tubeR: u(TUBE),
  portX: -u(BOSS.face),
  portY: [u(Y.portA), u(Y.portB)],
};

export default function P094(api) {
  const { THREE, S } = api;
  const { extrude, slotted, roundHole, weldRing, merged, group, at, torus } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const circ = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  // Contour plan (po) extrudé selon Z, épaisseur t, alésage [x, y, r].
  const plateZ = (pts, t, mat, holes = []) => extrude(pts.map(([x, y]) => [u(x), u(y)]), u(t), mat, { holes: holes.map(([x, y, r]) => [u(x), u(y), u(r)]) });

  // ================================================ 15 — tube soudé
  // Chape de fond : bloc plat 2 3/4 po, bout arrondi R 1.38 centré sur l'œil,
  // pans coupés à 45° sous le fond.
  const capLug = plateZ([
    ...circ(0, 0, EYE.R, Math.PI, 2 * Math.PI, 20),
    [EYE.R, 1.1], [EYE.R - 0.26, Y.capBot], [-EYE.R + 0.26, Y.capBot], [-EYE.R, 1.1],
  ], EYE.t, 'grey', [[0, 0, EYE.hole]]);
  // Fond : disque Ø 3 1/2 × 1/2 po, gorge en V de la soudure du tube.
  const cap = L(S, [[0, Y.capBot], [1.71, Y.capBot], [TUBE, Y.capBot + 0.04], [TUBE, 1.58], [1.58, Y.tubeBot], [BORE - G, Y.tubeBot], [BORE - G, Y.tubeBot + 0.06], [0, Y.tubeBot + 0.06]], 'grey', 48);
  const portHoles = [Y.portA, Y.portB].flatMap((y) => roundHole(-Math.PI / 2, u(y), u(0.19), u(TUBE), { steps: 8 }));
  const tube = slotted(u(TUBE), u(BORE), u(Y.tubeBot), u(Y.tubeTop - 0.06), portHoles, 'grey', { seg: 48 });
  const tubeTop = L(S, [[BORE, Y.tubeTop - 0.06], [TUBE, Y.tubeTop - 0.06], [TUBE, Y.tubeTop - 0.03], [TUBE - 0.03, Y.tubeTop], [BORE + 0.03, Y.tubeTop], [BORE, Y.tubeTop - 0.03], [BORE, Y.tubeTop - 0.06]], 'grey', 48);
  const boss = (y) => L(S, [
    [0.19, 1.5], [BOSS.r, 1.5], [BOSS.r, BOSS.face - 0.04], [BOSS.r - 0.04, BOSS.face],
    [0.275, BOSS.face], [0.219, BOSS.face - 0.06], [0.219, 1.9], [0.19, 1.87], [0.19, 1.5],
  ], 'grey', 24, { axis: '-x', pos: [0, u(y), 0] });
  const body = merged([capLug, cap, tube, tubeTop, boss(Y.portA), boss(Y.portB)], 'grey');
  body.userData.hasInterior = true;
  const welds = merged([
    weldRing(u(1.68), u(0.24), 'grey', { pos: [0, u(Y.tubeBot - 0.15), 0] }),
    ...[Y.portA, Y.portB].map((y) => weldRing(u(BOSS.r + 0.03), u(0.12), 'grey', { axis: 'x', pos: [-u(1.68), u(y), 0] })),
  ], 'grey');
  welds.geometry.userData.edgeAngle = 75;
  // Cordon d'angle chape / fond (deux faces planes de la chape).
  const lugWeld = merged([-1, 1].map((s) => S.weld([[-1.1, Y.capBot - 0.05, s * (EYE.t / 2 + 0.05)], [1.1, Y.capBot - 0.05, s * (EYE.t / 2 + 0.05)]].map(([x, y, z]) => [u(x), u(y), u(z)]), u(0.14), 'grey')), 'grey');
  // Rotule et circlip de l'œil de fond (mêmes pièces que 13 et 14), en place.
  const brg = (y) => at(sphericalBearing(S, THREE, BRG.rOut, BRG.rIn, BRG.w), [0, u(y), 0], [Math.PI / 2, 0, 0]);
  const clip = (y, t) => at(circlip(S, THREE, 0.86, { t: 0.06 }), [0, u(y), u(t / 2 - 0.08)], [Math.PI / 2, 0, 0]);
  P('15', group(body, welds, lugWeld, brg(0), clip(0, EYE.t)), [0, 0, 0]);

  // 16 — bouchons ORB 7/16-20 à joint torique, tête vers -X
  for (const y of [Y.portA, Y.portB]) {
    P('16', along(THREE, orbPlug(S, THREE, 4), [-1, 0, 0], [-u(BOSS.face), u(y), 0]), [-0.07, 0, 0]);
  }

  // ================================================ 1 — tête (dans l'alésage)
  // Portée dans le tube, gorge extérieure du joint torique, gorges du joint
  // de tige et du racleur (lamage au sommet) ; arête du haut chanfreinée.
  const head = L(S, [
    [ROD + G, Y.hpBot], [BORE - G - 0.04, Y.hpBot], [BORE - G, Y.hpBot + 0.04], [BORE - G, 8.6],
    [1.4, 8.6], [1.4, 8.8], [BORE - G, 8.8], [BORE - G, Y.tubeTop - 0.06], [1.42, Y.tubeTop],
    [0.85, Y.tubeTop], [0.85, 9.62], [ROD + G, 9.62], // lamage du racleur
    [ROD + G, 9.3], [0.78, 9.3], [0.78, 8.95], [ROD + G, 8.95], // gorge du joint de tige
    [ROD + G, Y.hpBot],
  ], 'grey', 48);
  // Racleur : talon dans le lamage, lèvre sur la tige (trousse 18, suggéré).
  const wiper = L(S, [[ROD + G, 9.64], [0.84, 9.64], [0.84, Y.tubeTop + 0.04], [0.74, Y.tubeTop + 0.1], [ROD + 0.005, Y.tubeTop + 0.1], [ROD + 0.005, 9.64]], 'rubber', 32);
  const oring = torus(u(1.43), u(0.07), 'rubber', { pos: [0, u(8.7), 0] });
  P('1', group(head, wiper, oring), [0, 0.12, 0]);

  // ================================================ piston, tige, tête de tige
  // 6 — piston : portées en retrait dans le tube, joint central (bleu),
  // chambrage de l'écrou dessous.
  const LAND = BORE - 0.03;
  const piston = L(S, [
    [1.0, Y.pistonBot], [LAND - 0.04, Y.pistonBot], [LAND, Y.pistonBot + 0.04], [LAND, 2.75],
    [1.32, 2.75], [1.32, 3.18], [LAND, 3.18], [LAND, Y.pistonTop - 0.04], [LAND - 0.04, Y.pistonTop],
    [PILOT + G, Y.pistonTop], [PILOT + G, Y.cbore], [1.0, Y.cbore], [1.0, Y.pistonBot],
  ], 'steel', 48);
  const seal = L(S, [[1.33, 2.76], [BORE - G, 2.8], [BORE - G, 3.13], [1.33, 3.17], [1.33, 2.76]], 'blue', 48);
  P('6', group(piston, seal), [0.13, 0.03, 0]);

  // 10 — écrou de blocage 1"-14 UNS dans le chambrage
  P('10', at(hexNut(S, THREE, 1.0), [0, u(Y.nutBot), 0]), [0.13, -0.035, 0]);

  // 11 — tige : chromée Ø 1 1/4, queue Ø 1 filetée sous le piston, bout
  // fileté 1 1/8-12 vers la tête de tige.
  const rod = group(
    L(S, [[0, Y.pistonTop], [ROD - 0.03, Y.pistonTop], [ROD, Y.pistonTop + 0.03], [ROD, Y.shoulder - 0.04], [ROD - 0.04, Y.shoulder], [0, Y.shoulder]], 'chrome', 32),
    L(S, [[0, Y.nutBot - 0.08], [PILOT * 0.85, Y.nutBot - 0.08], ...S.thread(PILOT, Y.nutBot - 0.02, Y.cbore + 0.05, { pitch: 1 / 14, maxTurns: 14 }), [PILOT, Y.pistonTop], [0, Y.pistonTop]], 'steel', 20),
    L(S, [[0, Y.shoulder], ...S.thread(TH, Y.shoulder, Y.rodEnd - 0.06, { pitch: 1 / 12, maxTurns: 16, chamferBottom: false }), [TH - 0.06, Y.rodEnd], [0, Y.rodEnd]], 'steel', 20),
  );
  P('11', rod, [0.13, 0.09, 0]);

  // 17 — contre-écrou 1 1/8 sur le bout fileté, sous la tête de tige
  P('17', at(hexNut(S, THREE, 1.125, { jam: true }), [0, u(Y.shoulder + 0.02), 0]), [0.13, 0.15, 0]);

  // 12 — tête de tige : fût rond Ø 1 3/4 (taraudé), col, œil plat R 1.35
  // d'épaisseur 7/8 po, logement de rotule.
  const shank = L(S, [[TH + G, Y.jamTop], [0.83, Y.jamTop], [0.87, Y.jamTop + 0.04], [0.87, Y.shankTop], [0.55, Y.shankTop + 0.25], [TH + G, Y.shankTop + 0.25], [TH + G, Y.jamTop]], 'grey', 32);
  const a0 = Math.asin(0.62 / EYE.rodR);
  const eyeHead = plateZ([
    [0.62, Y.shankTop - 0.1], ...circ(0, Y.eye, EYE.rodR, -Math.PI / 2 + a0, 1.5 * Math.PI - a0, 28), [-0.62, Y.shankTop - 0.1],
  ], EYE.rodT, 'grey', [[0, Y.eye, EYE.hole]]);
  P('12', merged([shank, eyeHead], 'grey'), [0.13, 0.21, 0]);

  // 13 — rotule de l'œil de tige, 14 — son circlip intérieur (côté +Z) :
  // suivent la tête de tige puis sortent selon l'axe de l'œil.
  P('13', brg(Y.eye), [0.13, 0.21, 0.07]);
  P('14', clip(Y.eye, EYE.rodT), [0.13, 0.21, 0.13]);

  return { view: { dir: [-0.7, 0.35, 1] } };
}

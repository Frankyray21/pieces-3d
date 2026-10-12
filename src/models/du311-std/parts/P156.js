// P156 — MCP « ASSY, MCP - 6' FEED » CX036216 rév. 1 (page 156,
// isométrique). Plaque de liaison du mât (2, P160) vissée sur la bride de
// sortie de l'actionneur rotatif ; vérin d'extension de l'avance (1, P158)
// couché sur sa face avant entre les barres de guidage du cadre du
// carrousel : œil de fond dans la chape basse de la plaque, œil de tige dans
// la chape du haut du cadre du carrousel (avance, P098 rep. 5, EYE_TOP) : le
// vérin pousse l'avance vers le haut ; coudes 90° ORB → JIC (3) sur les
// orifices des valves d'équilibrage du fond-bloc et coude 45° à écrou
// tournant (4) sur le té de l'orifice de fond.
// Repère : celui du MCP simplifié de ../slide.js (inchangé, P010 le pose sur
// l'actionneur) : plaque dans le plan XY centrée à l'origine, longueur selon
// Y, face avant (vers le mât) selon +Z, face arrière à z = −MCP.t / 2 ;
// barres de guidage à x = ±0.265. Vérin d'axe (x = 0, z = 0.12) : œil de
// fond en y = −0.93 (chape de P160), œil de tige à la chape du cadre de
// l'avance au repos (≈ +1.08, entraxe ≈ 2.01 m, sorti de ≈ 0.25 m : extension
// de l'avance de −0.15 à +1.1 m dans la course de 1,372 m).
// Encombrement ≈ 0.73 × 2.2 × 0.24 m.
// Simulation : vérin détaillé « mcp » (œil de fond sur « roll » avec la
// plaque, œil de tige sur « ext ») ; coudes du fond-bloc sur « roll ».
import { body, ramDetailed } from '../layout.js';
import { IN, u, frame, jicElbow, hexPrism, L, SLIDE } from './_slide.js';
import { P160G } from './P160.js';
import { CYL158 } from './P158.js';
import { EYE_TOP } from './P098.js';
import { FEED_POS } from '../machine.js';

const CAP_Y = P160G.clevis.y; // œil de fond (chape basse de la plaque)
// Œil de tige : chape du haut du cadre du carrousel, avance au repos (repère du MCP).
const ROD_Y = EYE_TOP[1] + FEED_POS.y - SLIDE.rot.y;

export default function P156(api) {
  const { THREE, S } = api;
  const { group, at, merged } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { z: ZC } = P160G.clevis;
  const L0 = ROD_Y - CAP_Y;
  const ext = L0 - CYL158.retracted;

  // 2 — plaque de liaison du mât (même repère)
  P('2', api.sub('P160'), [0, 0, -0.35]);

  // 1 — vérin d'extension : axe +Y, axes des œils selon X, tube d'huile vers l'avant (+Z)
  const cylObj = frame(THREE, api.sub('P158', { ext }), [0, CAP_Y, ZC], [0, 1, 0], [0, 0, 1], [1, 0, 0]);
  P('1', ramDetailed('mcp', 'roll', 'ext', cylObj, { rear: [0, 0, 0], rod: [L0, 0, 0], stroke: CYL158.stroke, closed: CYL158.retracted }), [0, 0, 0.45]);

  // 3 — coudes 90° sur les orifices latéraux des valves d'équilibrage (faces ±X du fond-bloc), nez vers le bas
  for (const s of [-1, 1]) {
    const p = [s * u(2.25 + 0.95), CAP_Y + u(2.2), ZC + u(0.9)];
    const g = group(merged([hexPrism(S, THREE, 0.75, 0.3, 0, 0, 'zinc')], 'zinc'), at(jicElbow(S, THREE, 6), [0, u(0.62), 0]));
    P('3', body('roll', frame(THREE, g, p, [0, -1, 0], [0, 0, 1], [-1, 0, 0].map((v) => v * -1))), [s * 0.12, 0, 0.3]);
  }
  // 4 — coude 45° à écrou tournant sur la branche du té de fond (vers −X, incliné vers l'avant)
  {
    const p = [-u(1.75 + 0.75), CAP_Y + u(4.2), ZC + u(2.25 + 0.35 + 0.4 + 0.71)];
    const el = group(
      merged([hexPrism(S, THREE, 0.875, 0.55, 0, 0.18, 'zinc'), L(S, [[0, 0.55], [0.3, 0.55], [0.3, 0.9], [0, 0.9]], 'zinc', 14)], 'zinc'),
      at(merged([L(S, [[0, 0], [0.3, 0], [0.3, 0.5], [0, 0.5]], 'zinc', 14), hexPrism(S, THREE, 0.75, 0.25, 0.5, 0, 'zinc'), L(S, [[0, 0.75], [0.23, 0.75], ...S.thread(0.281, 0.8, 1.15, { pitch: 0.06, maxTurns: 4, chamferBottom: false }), [0.2, 1.3], [0, 1.3]], 'zinc', 14)], 'zinc'), [0, u(0.85), 0], [0, 0, Math.PI / 4]),
    );
    P('4', body('roll', frame(THREE, el, p, [0, 1, 0], [-1, 0, 0], [0, 0, 1])), [-0.15, 0, 0.3]);
  }
  void IN;
  return { view: { dir: [0.9, 0.5, 1.2] } };
}

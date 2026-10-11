// P196 — Distributeur auxiliaire du bras de tiges : CP006738 rév. 0 « AUX.
// VALVE, PIPE ARM » (page 196), repère 4 de P186. PVG 32 à deux sections :
// plaque d'extrémité à orifice LX (1) en bas, section (6), section (2),
// couvercle d'entrée P / T (4) en haut ; une poignée courte (3) côté -X et une
// électrovanne PVE à connecteur AMP (5) côté +X par section ; trois tirants à
// écrous (7, boulonnerie de la trousse de joints).
// Repère (commun aux PVG 32, voir _chassis.js) : origine au centre de la face
// inférieure de la plaque d'extrémité, Y vers le haut le long de l'empilage,
// X selon les tiroirs (poignées vers -X, PVE vers +X), +Z = face des orifices
// A / B et P / T. Encombrement ≈ 0.42 (X) × 0.19 (Y) × 0.11 (Z) m.
import { pvgValve } from './_chassis.js';

export default function P196(api) {
  pvgValve(api, {
    end: ['1', 'lx'],
    sections: [{ ref: '6', handle: '3', pve: '5' }, { ref: '2', handle: '3', pve: '5' }],
    inlet: '4',
    kit: '7',
  });
  return { view: { dir: [-0.6, 0.6, 1.1] } };
}

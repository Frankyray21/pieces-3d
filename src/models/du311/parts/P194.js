// P194 — Distributeur de forage, 6 sections : CP003709 rév. 2 « DRILLING
// VALVE - 6 SECTION - AMP » (page 194), repère 3 de P186. PVG 32 : plaque
// d'extrémité à orifice LX (2) en bas, puis de bas en haut les sections 4, 6,
// 3, 3, 5 et 7, couvercle d'entrée P / T (9) en haut ; une poignée courte (8)
// côté -X par section ; électrovannes PVE à connecteur AMP côté +X : CX002968
// (11) sur les quatre sections du bas, CX002967 (10) sur les deux du haut ;
// trois tirants à écrous (1, boulonnerie de la trousse de joints).
// Repère (commun aux PVG 32, voir _chassis.js) : origine au centre de la face
// inférieure de la plaque d'extrémité, Y vers le haut le long de l'empilage,
// X selon les tiroirs (poignées vers -X, PVE vers +X), +Z = face des orifices
// A / B et P / T. Encombrement ≈ 0.42 (X) × 0.38 (Y) × 0.11 (Z) m.
import { pvgValve } from './_chassis.js';

export default function P194(api) {
  const secs = [['4', '11'], ['6', '11'], ['3', '11'], ['3', '11'], ['5', '10'], ['7', '10']];
  pvgValve(api, {
    end: ['2', 'lx'],
    sections: secs.map(([ref, pve]) => ({ ref, handle: '8', pve })),
    inlet: '9',
    kit: '1',
  });
  return { view: { dir: [-0.6, 0.6, 1.1] } };
}

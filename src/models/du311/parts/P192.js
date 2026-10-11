// P192 — Distributeur de mise en place, 8 sections : CP003430 rév. 3 « SETUP
// VALVE - 8 SECTION - AMP » (page 192), repère 2 de P186. PVG 32 : plaque
// d'extrémité à orifice LX (2) en bas, section (3), section (4), section à
// tiroir PC (5), cinq sections (4), couvercle d'entrée P / T (7) en haut ; une
// poignée courte (6) côté -X et une électrovanne PVE à connecteur AMP (8) côté
// +X par section ; trois tirants à écrous (1, boulonnerie de la trousse de
// joints). Ordre des sections lu de bas en haut sur la vue éclatée.
// Repère (commun aux PVG 32, voir _chassis.js) : origine au centre de la face
// inférieure de la plaque d'extrémité, Y vers le haut le long de l'empilage,
// X selon les tiroirs (poignées vers -X, PVE vers +X), +Z = face des orifices
// A / B et P / T. Encombrement ≈ 0.42 (X) × 0.48 (Y) × 0.11 (Z) m.
import { pvgValve } from './_chassis.js';

export default function P192(api) {
  const refs = ['3', '4', '5', '4', '4', '4', '4', '4'];
  pvgValve(api, {
    end: ['2', 'lx'],
    sections: refs.map((ref) => ({ ref, handle: '6', pve: '8' })),
    inlet: '7',
    kit: '1',
  });
  return { view: { dir: [-0.6, 0.6, 1.1] } };
}

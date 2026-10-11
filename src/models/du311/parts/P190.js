// P190 — Distributeur de forage, avance : CP002322 rév. 0 « DRILLING VALVE,
// FEED » (page 190), repère 1 de P186. Distributeur proportionnel PVG 32 à une
// section (26 gal/min, vérin) : plaque d'extrémité pleine (2) en bas, section
// (3), couvercle d'entrée P / T (5) en haut ; poignée courte (4) côté -X,
// électrovanne PVE à connecteur AMP (6) côté +X ; trois tirants à écrous (1,
// boulonnerie fournie avec la trousse de joints, note 1 du dessin).
// Repère (commun aux PVG 32, voir _chassis.js) : origine au centre de la face
// inférieure de la plaque d'extrémité, Y vers le haut le long de l'empilage,
// X selon le tiroir (poignée vers -X, PVE vers +X), +Z = face des orifices
// A / B et P / T. Encombrement ≈ 0.38 (X) × 0.14 (Y) × 0.11 (Z) m.
import { pvgValve } from './_chassis.js';

export default function P190(api) {
  pvgValve(api, {
    end: ['2', 'cover'],
    sections: [{ ref: '3', handle: '4', pve: '6' }],
    inlet: '5',
    kit: '1',
  });
  return { view: { dir: [-0.6, 0.7, 1.1] } };
}

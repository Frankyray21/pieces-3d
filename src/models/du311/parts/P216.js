// P216 — Distributeur de translation, 7 sections : CP003431 rév. 1 « TRAM
// VALVE - 7 SECTION - AMP » (page 216), repère 1 de P214. PVG 32 : plaque
// d'extrémité pleine (2) en bas, puis de bas en haut la section 5, deux
// sections de translation (3), quatre sections (6), couvercle d'entrée P / T
// (8) en haut ; une poignée courte (7) côté -X par section ; électrovannes
// PVE à connecteur AMP (9) côté +X sur les six sections du haut, couvercle de
// ressort (4) sur celle du bas ; trois tirants à écrous (1, boulonnerie de la
// trousse de joints).
// Repère (commun aux PVG 32, voir _chassis.js) : origine au centre de la face
// inférieure de la plaque d'extrémité, Y vers le haut le long de l'empilage,
// X selon les tiroirs (poignées vers -X, PVE vers +X), +Z = face des orifices
// A / B et P / T. Encombrement ≈ 0.42 (X) × 0.43 (Y) × 0.11 (Z) m.
import { pvgValve } from './_chassis.js';

export default function P216(api) {
  const secs = [
    { ref: '5', handle: '7', spring: '4' },
    { ref: '3', handle: '7', pve: '9', tram: true },
    { ref: '3', handle: '7', pve: '9', tram: true },
    ...[0, 1, 2, 3].map(() => ({ ref: '6', handle: '7', pve: '9' })),
  ];
  pvgValve(api, { end: ['2', 'cover'], sections: secs, inlet: '8', kit: '1' });
  return { view: { dir: [-0.6, 0.6, 1.1] } };
}

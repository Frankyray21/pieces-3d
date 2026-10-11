// P364 — Vanne de translation gauche CX030864 rév. 0 (page 364), repère 31 du
// porteur P328. Même bloc d'équilibrage double 10:1 (1, CP000305) que la
// vanne droite P362, sans coude tournant : à chaque bout (V1 +X, V2 −X), un
// coude 90° -12 (4) vers le haut, un té tournant -12 (3) et une réduction
// tournante -12 / -06 (2) sur la branche de pilotage ; dessous, deux
// adaptateurs droits -12 (5). Le dessin montre le circuit du bout −X couché
// vers l'arrière-gauche : on garde ici le même montage qu'au bout +X (té
// vertical), faute de cotes.
// Repère : celui de P362 — origine au centre de la face arrière du corps (face
// d'appui), Y vers le haut, X le long du corps (+X côté V1), +Z vers l'avant.
// Encombrement ≈ 0.31 (X) × 0.17 (Y) × 0.05 (Z) m.
import { tramValve } from './P362.js';

export default function P364(api) {
  tramValve(api, { valve: '1', reducer: '2', tee: '3', elbow: '4', straight: '5' });
  return { view: { dir: [-0.9, 0.7, 1.1] } };
}

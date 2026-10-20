import { P010 } from './drill.js';
import { P048 } from './head.js';
import { P068, PP } from './powerpack.js';
import { P078 } from './console.js';

// Usinage Marcotte STM-1500 s/n STM-1500-128 (manuel de pièces de Machines
// Roger, 96 pages). En 3D : l'ensemble (P002), la foreuse (P010) et sa tête
// Boyles (P048), le groupe hydraulique 125 HP (P068) et la console (P078) ;
// les autres assemblages s'affichent avec les dessins du manuel.

// P002 — Ensemble, disposé comme sur le plan de l'atelier (vue de dessus :
// X vers la droite du plan, Z vers le bas) : foreuse à gauche, inclinée,
// l'avance pointée vers le bas à gauche (trou) ; console STM au centre en
// haut, commandes tournées vers la foreuse (les contrôles de la STM sont
// toujours à sa droite) ; groupe hydraulique en haut à droite, en long,
// interrupteur principal (porte de la boîte électrique) accessible sur le
// côté bas du plan, vers la gauche.
// Seul le matériel du manuel est modélisé (pas de grillages ni d'accessoires de chantier).
const DRILL_YAW = -1.84; // avance vers (−0,27 ; 0,96) dans le plan
function P002(api) {
  const { at } = api.S;
  api.part('1', at(api.sub('P010'), [-3.0, 0, 0.6], [0, DRILL_YAW, 0]), [-1.2, 0, 0]);
  api.part('3', at(api.sub('P078'), [0.0, 0, -1.7], [0, -Math.PI / 2, 0]), [0, 0, -0.8]);
  api.part('2', at(api.sub('P068'), [0.55 + PP.L / 2 + 0.3, 0, -1.7]), [1.2, 0, -0.6]);
  return { view: { dir: [0.35, 1.1, 1.0] } };
}

export default { P002, P010, P048, P068, P078 };

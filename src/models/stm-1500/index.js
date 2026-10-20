import { P010 } from './drill.js';
import { P048 } from './head.js';
import { P068, PP } from './powerpack.js';
import { P078, CON } from './console.js';

// Usinage Marcotte STM-1500 s/n STM-1500-128 (manuel de pièces de Machines
// Roger, 96 pages). En 3D : l'ensemble (P002), la foreuse (P010) et sa tête
// Boyles (P048), le groupe hydraulique 125 HP (P068) et la console (P078) ;
// les autres assemblages s'affichent avec les dessins du manuel.

// P002 — Ensemble : foreuse au centre, groupe hydraulique à sa gauche, console
// accrochée à l'avant du groupe (page 3.0), face des commandes vers la foreuse.
function P002(api) {
  const { at } = api.S;
  api.part('1', api.sub('P010'), [0, 0, 1.2]);
  const ppZ = -(0.864 / 2 + 1.1 + PP.W / 2);
  api.part('2', at(api.sub('P068'), [-0.9, 0, ppZ]), [0, 0, -1.2]);
  api.part('3', at(api.sub('P078'), [-0.9 + PP.L / 2 + 0.06 + CON.d / 2, 0, ppZ], [0, Math.PI / 2, 0]), [0.9, 0, -0.6]);
  return { view: { dir: [0.85, 0.55, 1.0] } };
}

export default { P002, P010, P048, P068, P078 };

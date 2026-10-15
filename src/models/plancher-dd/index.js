import { P02 } from './general.js';
import { P04, P07, P10, P12, P13, P14, P16, P17 } from './floor.js';
import { P18, P19 } from './site.js';

// Builders procéduraux par page de la procédure PRO-DD-ST-003 (voir
// src/viewer/assembly.js) ; plan.js donne les dimensions, le sol et l'ordre
// des étapes (userData.step sur chaque pièce).
export default { P02, P04, P07, P10, P12, P13, P14, P16, P17, P18, P19 };

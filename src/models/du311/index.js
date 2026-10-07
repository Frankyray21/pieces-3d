import { P130, P132, P134, P136 } from './mast.js';
import { P138, P140, P142 } from './topdrive.js';
import { P032 } from './feed.js';

// Builders procéduraux par feuille du manuel (voir src/viewer/assembly.js).
// Feuilles modélisées : avance V30 (P032) avec le mât 10 pi et ses
// sous-assemblages, et la tête de rotation.
// Les autres assemblages s'affichent avec les dessins du manuel.
export default { P032, P130, P132, P134, P136, P138, P140, P142 };

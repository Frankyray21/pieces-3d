import { P130, P132, P134, P136 } from './mast.js';
import { P138, P140, P142 } from './topdrive.js';
import { P032 } from './feed.js';
import { P186 } from './frame.js';
import { P010 } from './machine.js';
import parts from './parts/index.js';

// Builders procéduraux par feuille du manuel (voir src/viewer/assembly.js).
// Les premiers modèles (machine complète P010, châssis P186, avance V30 P032,
// mât 10 pi et tête de rotation) sont dans les fichiers par famille ci-dessus ;
// les autres assemblages ont chacun leur fichier dans parts/ (voir
// parts/README.md), qui l'emporte sur l'ancien builder du même numéro.
// Les assemblages sans builder s'affichent avec les dessins du manuel.
export default { P010, P032, P186, P130, P132, P134, P136, P138, P140, P142, ...parts };

// Scie alternative sans fil Makita DJR183Z (18 V LXT, outil seul).
//
// - scie.js : la scie elle-même (P01), d'après deux images du produit ;
//   dimensions estimées, données publiées par Makita reprises telles quelles.
// - sciage.js : la scène de sciage d'un 2 × 4, scie à l'horizontale (P02),
//   animée en trois étapes.
// - decoupe.js : la découpe libre d'un 3 × 8, scie à la verticale (P03) ; le
//   trait est tracé dans la vue 3D (fonction src/ui/features/decoupe.js).
import { P01 } from './scie.js';
import { P02, STEPS } from './sciage.js';
import { P03 } from './decoupe.js';

export { STEPS };
export default { P01, P02, P03 };

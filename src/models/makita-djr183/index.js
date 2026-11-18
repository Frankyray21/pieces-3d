// Scie alternative sans fil Makita DJR183Z (18 V LXT, outil seul).
//
// - scie.js : la scie elle-même (P01), d'après deux images du produit ;
//   dimensions estimées, données publiées par Makita reprises telles quelles.
// - sciage.js : la scène de sciage d'un 2 × 4 (P02), animée en trois étapes.
import { P01 } from './scie.js';
import { P02, STEPS } from './sciage.js';

export { STEPS };
export default { P01, P02 };

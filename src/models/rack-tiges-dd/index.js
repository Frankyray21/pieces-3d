// Support de tiges de forage (« rack à rods ») de Machines Roger International.
//
// - support.js : le support lui-même (P01), d'après les figures du rapport de
//   certification Forcetech P19113 ; dimensions estimées sur les vues.
// - installation.js : l'installation étape par étape (P02), d'après la
//   procédure PRO-DD-ST-008 ; chantier.js (paroi de mine, plancher), outils.js
//   (boulon à œil, tendeur, foreuse à percussion, tournevis), reperes.js (cotes,
//   angles, zones, niveau numérique), travailleur.js (silhouette).
//
// Contrôle chiffré contre la procédure : node scripts/check-rack.mjs
import { P01, NQ } from './support.js';
import { P02, STEPS, RETENUE } from './installation.js';
import { MINE } from './chantier.js';

export { NQ, STEPS, RETENUE, MINE };
export default { P01, P02 };

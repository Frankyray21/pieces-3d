import * as heads from './heads.js';
import * as overshots from './overshots.js';
import * as swivels from './swivels.js';
import * as tools from './tools.js';
import * as barrels from './barrels.js';
import { P002 } from './showcase.js';

// Catalogue Epiroc « Core Drilling Tools — In-The-Hole » : builders 3D par
// page du catalogue (voir src/viewer/assembly.js). Les pages sans builder
// s'affichent avec leurs dessins.
const pages = (mod) => Object.fromEntries(Object.entries(mod).filter(([k]) => /^P\d{3}/.test(k)));

export default { ...pages(heads), ...pages(overshots), ...pages(swivels), ...pages(tools), ...pages(barrels), P002 };

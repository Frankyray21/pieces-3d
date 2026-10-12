import tk from '../du311/index.js';
import { topdriveAssembly } from '../du311/topdrive.js';
import { reuse } from '../reuse.js';
import { P208 } from './carrier.js';
import { P416 } from './reardeck.js';
import { P164, P156 } from './slide.js';
import { P028 } from './feed.js';
import { P010, P020 } from './machine.js';
import { P022 } from './decals.js';
import parts from './parts/index.js';

// Sandvik DU311 s/n 10703. Machine complète (P010) modélisée : porteur sur
// roues (P208), pont arrière (P416), glissière (P164), MCP (P156), avance 6 pi
// à carrousel (P028) avec la tête de rotation (P050), extinction d'incendie
// (P012), finition (P020) et autocollants ISO (P022) ; repère commun dans layout.js.
// Les assemblages identiques au DU311-TVK (même numéro de pièce, même liste)
// reprennent ses modèles 3D détaillés (TVK ci-dessous) ; les assemblages
// détaillés propres au DU311 sur roues ont chacun leur fichier dans parts/
// (voir parts/README.md), qui l'emporte sur les builders simplifiés du même
// numéro ; les autres s'affichent avec les dessins du manuel.
const TVK = {
  // avance : centreur fixe, raccords rapides, vérin de bras, tête de rotation
  P036: 'P104', P038: 'P106', P040: 'P108', P042: 'P110', P044: 'P112', P052: 'P140', P054: 'P142',
  P096: 'P160', P124: 'P094', P134: 'P078',
  // glissière : laser d'alignement
  P182: 'P180', P184: 'P182',
  // porteur et pont avant : indicateur, pompe électrique, filtres, électrovanne, graisse,
  // boîtier de télésurveillance, raccords, traversée, raccords rapides
  P218: 'P342', P232: 'P356', P264: 'P352', P370: 'P352', P336: 'P210', P354: 'P228', P358: 'P370',
  P374: 'P384', P376: 'P272', P378: 'P388', P390: 'P162',
  // surpresseur Le Roi complet
  P434: 'P282', P438: 'P286', P440: 'P288', P442: 'P290', P446: 'P294', P448: 'P296', P450: 'P298',
  P452: 'P300', P454: 'P302', P456: 'P304', P458: 'P306',
};

// P050 — Tête de rotation RH6230-A-SP ME12-SS #24 (CX035575) : même
// construction que celle du TVK (P138), moteurs ME12 plus courts, raccord
// d'usure #24, sans bouchons M12 (repères 7 à 15 décalés d'un rang).
function P050(api) {
  return topdriveAssembly(api, {
    sub: { gearbox: 'P054', swivel: 'P052' },
    R: {
      piston: '1', spring: '2', saverSub: '3', swivel: '4', insert: '5', motor: '6',
      pistonRing: '7', swivelRing: '8', gearbox: '9', insertBolt: '10', flangeBolt: '11',
      motorBolt: '12', insertWasher: '13', motorWasher: '14', flangeWasher: '15',
    },
    k: 0.85,
    rSub: 0.045,
  });
}

export default {
  ...reuse(tk, TVK),
  P050,
  P208,
  P416,
  P164,
  P156,
  P028,
  P010,
  P020,
  P022,
  ...parts,
};

// Vue d'ensemble du site : les grands ensembles simplifiés (porteur, pont
// arrière, glissière, avance) s'affichent d'abord, puis src/main.js les
// remplace un à un par leurs versions détaillées (facettes allégées).
export const overview = { root: 'P010', quality: 0.5, builders: { P208, P416, P164, P028 } };

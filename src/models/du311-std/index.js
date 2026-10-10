import tk from '../du311/index.js';
import { topdriveAssembly } from '../du311/topdrive.js';
import { reuse } from '../reuse.js';
import { P208 } from './carrier.js';
import { P416 } from './reardeck.js';
import { P164, P156 } from './slide.js';
import { P028 } from './feed.js';
import { P010, P012, P020 } from './machine.js';

// Sandvik DU311 s/n 10703. Machine complète (P010) modélisée : porteur sur
// roues (P208), pont arrière (P416), glissière (P164), MCP (P156), avance 6 pi
// à carrousel (P028) avec la tête de rotation (P050), extinction d'incendie
// (P012) et finition (P020) ; repère commun dans layout.js.
// Les assemblages identiques au DU311-TVK (même numéro, même liste) reprennent
// ses modèles 3D ; les autres s'affichent avec les dessins du manuel.
//   P052 = TK P140 : émerillon à air CM16303
//   P054 = TK P142 : boîte d'engrenages RH6230-A CX024304

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
  ...reuse(tk, { P052: 'P140', P054: 'P142' }),
  P050,
  P208,
  P416,
  P164,
  P156,
  P028,
  P010,
  P012,
  P020,
};

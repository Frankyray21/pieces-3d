// P400 — Options du DU311-TVK n° 10680, CX036923 rév. 0 (page 400, sans
// illustration) : seau de graisse (1), clé de débrayage (2, P402) et sa
// chaîne (3, P404), épissure boulon-écrou (4) et chaîne de 2 maillons (5) de
// rechange, trousses d'outils du vérin de débrayage (6, P406), de la tête de
// rotation (7, P408) et du compresseur (8, P410), système d'extinction
// (9, P412).
// Repère : repère machine P010 (voir frame.js et machine.js) : X vers
// l'avant (côté mât), Y vers le haut, +Z côté enrouleur, pont à y = 0.76 ;
// P400 se place dans P010 sans déplacement (api.sub('P400') à l'origine).
// Implantation : coffre à outils à l'emplacement de machine.js (avant droit,
// x 1.35 à 2.01, z 0.71 à 1.15, porte-à-faux devant la chenille, à l'écart
// du boîtier du vérin de calage avant droit, z ≤ 0.70) : bac de
// la trousse P408 au fond (y 0.55), bacs des trousses P406 et P410 posés
// dessus, clé de débrayage (retournée, mâchoire vers l'extérieur +Z) et
// chaîne posées sur les bacs, épissure et chaîne de 2 maillons à côté de la
// chaîne ; seau de graisse sur le pont arrière gauche (x -0.85, z -0.42) ;
// système d'extinction réparti sur la machine (voir P412).
// Encombrement ≈ 4.49 (X, de -2.35 à 2.14) × 1.26 (Y, de 0.43 à 1.69) × 1.89 (Z) m.
// Chaque trousse est livrée dans son bac (tôle rouge), modélisé avec elle.

import { leafPlates, chainPin, splice } from './P404.js';

const IN = 0.0254;
const u = (v) => v * IN;

export default function P400(api) {
  const { S } = api;
  const { box, lathe, merged, at, group, torus, cyl, tube } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Bac à outils ouvert (tôle 2 mm, bords tombés) : centre du fond en (x, y, z).
  const tray = (w, d, h, [x, y, z]) => merged([
    at(box(w, 0.002, d, 'red'), [x, y + 0.001, z]),
    at(box(w, h, 0.002, 'red'), [x, y + h / 2, z - d / 2]),
    at(box(w, h, 0.002, 'red'), [x, y + h / 2, z + d / 2]),
    at(box(0.002, h, d, 'red'), [x - w / 2, y + h / 2, z]),
    at(box(0.002, h, d, 'red'), [x + w / 2, y + h / 2, z]),
    // poignées pliées aux deux bouts
    at(box(0.01, 0.006, d * 0.5, 'red'), [x - w / 2 - 0.005, y + h - 0.003, z]),
    at(box(0.01, 0.006, d * 0.5, 'red'), [x + w / 2 + 0.005, y + h - 0.003, z]),
  ], 'red');

  // ================================================ 1 — seau de graisse 16 kg
  {
    const [x, y, z] = [-0.85, 0.76, -0.42];
    P('1', group(
      lathe([[0, 0], [0.135, 0], [0.138, 0.01], [0.15, 0.36], [0.155, 0.365], [0.155, 0.375], [0, 0.375]], 'blue', { seg: 36, pos: [x, y, z] }),
      // couvercle à languettes et bec verseur
      lathe([[0, 0.372], [0.158, 0.372], [0.158, 0.39], [0.15, 0.392], [0, 0.392]], 'blue', { seg: 36, pos: [x, y, z] }),
      at(cyl(0.02, 0.012, 'plastic', { seg: 14 }), [x + 0.09, y + 0.398, z]),
      // étiquette blanche et anses
      at(cyl(0.1445, 0.16, 'white', { seg: 36, open: true, r2: 0.149 }), [x, y + 0.2, z]),
      merged([
        at(cyl(0.012, 0.02, 'zinc', { axis: 'z', seg: 10 }), [x, y + 0.33, z - 0.152]),
        at(cyl(0.012, 0.02, 'zinc', { axis: 'z', seg: 10 }), [x, y + 0.33, z + 0.152]),
        tube([[x, y + 0.33, z - 0.165], [x, y + 0.5, z - 0.12], [x, y + 0.56, z], [x, y + 0.5, z + 0.12], [x, y + 0.33, z + 0.165]], 0.003, 'zinc', { seg: 24, radial: 6 }),
      ], 'zinc'),
      at(cyl(0.012, 0.09, 'plastic', { axis: 'z', seg: 10 }), [x, y + 0.56, z]),
    ), [0, 0.35, 0]);
  }

  // ================================================ trousses dans leurs bacs (coffre avant droit)
  const T8 = [1.68, 0.55, 0.93], T6 = [1.47, 0.612, 0.87], T10 = [1.86, 0.612, 0.93];
  // 7 — tête de rotation (bac du fond, 0.66 × 0.44)
  P('7', group(tray(0.66, 0.44, 0.06, T8), at(api.sub('P408'), [T8[0], T8[1] + 0.002, T8[2]])), [0, 0, 0.5]);
  // 6 — vérin de débrayage (bac 0.45 × 0.24, posé sur le bac du fond)
  P('6', group(tray(0.45, 0.24, 0.055, T6), at(api.sub('P406'), [T6[0] - 0.01, T6[1] + 0.002, T6[2] + 0.005])), [-0.1, 0.3, 0.4]);
  // 8 — compresseur (bac 0.32 × 0.27)
  P('8', group(tray(0.32, 0.27, 0.055, T10), at(api.sub('P410'), [T10[0], T10[1] + 0.002, T10[2]])), [0.2, 0.3, 0.4]);

  // ================================================ 2 — clé de débrayage, 3 — chaîne
  // Clé retournée (rotation de 180° autour de X), pivot à x = 1.27 (mâchoire à
  // l'aplomb du bac arrière), manche vers +X posé sur les rebords des bacs,
  // mâchoire vers l'extérieur (+Z).
  const TOP = T6[1] + 0.055; // rebord des bacs supérieurs
  P('2', at(api.sub('P402'), [1.27, TOP + 0.020, 1.04], [Math.PI, 0, 0]), [0, 0.45, 0.25]);
  P('3', at(api.sub('P404'), [1.30, TOP + 0.021, 0.80]), [0, 0.55, 0.1]);

  // ================================================ 4 — épissure, 5 — chaîne de 2 maillons (rechange)
  P('4', at(group(splice(S, 0)), [1.93, TOP + 0.021, 0.80]), [0.1, 0.5, 0.05]);
  P('5', at(group(leafPlates(S, 2, 0), merged([0, 1, 2].map((k) => chainPin(S, k * 1.25)), 'steel')), [1.62, TOP + 0.02, 0.75]), [0.05, 0.5, -0.05]);

  // ================================================ 9 — système d'extinction (repère machine)
  P('9', api.sub('P412'), [0, 0, 0]);

  void torus; void u;
  return { view: { dir: [1.1, 0.8, 1.2] } };
}

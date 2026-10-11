// P168 — Glissière complète « CLTR ASSY, SLIDE DU311-TVK 10680 » CX036921
// rév. 0 (page 168, deux isométriques) : glissière (2, P170) avec son support
// de laser d'alignement (3, P180) sur les colonnes, et bloc de graissage
// centralisé (1) : barrette d'acier zingué à dix graisseurs, vissée sur la
// face arrière de la colonne +Z, d'où partent les lignes vers les paliers,
// bagues et axes de la glissière.
// Repère : celui de la machine P010 (X vers l'avant, Y vers le haut, +Z côté
// enrouleur) : P168 se place dans P010 sans déplacement. La glissière P170
// (et P180, dans le même repère) a son origine — centre de l'actionneur
// rotatif — en GLIS = (2.28, 1.2, 0) : bride de sortie de l'actionneur
// (face d'appui de la plaque de liaison du mât P024) à x = 2.577, barres de
// glissement à x = 2.12, y = 0.9 / 1.5, arbre de basculement à x = 2.08,
// y = 0.56, colonnes à z = ±0.62.
// Encombrement ≈ x 0.93 → 2.58, y 0.44 → 1.91, z ±0.99 (lasers compris) m.

import { SLIDE170 } from './P170.js';

const IN = 0.0254;
export const GLIS = [2.28, 1.2, 0];

export default function P168(api) {
  const { S } = api;
  const { box, lathe, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const [GX, GY, GZ] = GLIS;

  // 2 — glissière ; 3 — support du laser (repère de P170)
  P('2', at(api.sub('P170'), GLIS), [0, 0, 0]);
  P('3', at(api.sub('P180'), GLIS), [0, 0.25, 0]);

  // 1 — bloc de graissage : barrette 25 × 250 × 32 mm à deux vis CHC, dix
  // graisseurs droits 1/8 NPT sur la face arrière, en deux rangées.
  const zc = GZ + SLIDE170.colZ;
  const xb = GX - 0.30 - 0.016; // contre la face arrière de la colonne
  const body = [at(box(0.032, 0.25, 0.025, 'zinc', { r: 0.002 }), [0, 0, 0])];
  const nip = [];
  for (let i = 0; i < 10; i++) {
    const y = -0.105 + (i >> 1) * 0.0525, z = (i & 1 ? 1 : -1) * 0.006;
    nip.push(at(lathe([[0, 0], [0.0055, 0], [0.0055, 0.006], [0.0035, 0.006], [0.0035, 0.013], [0.0045, 0.0145], [0.0035, 0.018], [0, 0.0185]], 'brass', { seg: 8 }), [-0.016, y, z], [0, 0, Math.PI / 2]));
  }
  const screws = [-0.115, 0.115].map((y) => at(lathe([[0, 0], [0.0048, 0], [0.0048, 0.0064], [0, 0.0064]], 'blackOxide', { seg: 12 }), [-0.016, y, 0], [0, 0, Math.PI / 2]));
  P('1', at(group(merged(body, 'zinc'), merged(nip, 'brass'), merged(screws, 'blackOxide')), [xb, GY - 0.12, zc]), [-0.25, 0, 0.1]);
  void IN;

  return { view: { dir: [1.0, 0.55, 0.9] } };
}

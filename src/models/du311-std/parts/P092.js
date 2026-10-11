// P092 — Collecteur des centreurs CX036872 rév. 3 (page 92) : « ASSY,
// MANIFOLD - CENTRALIZERS », repère 15 de l'avance P028. Bloc d'équilibrage /
// diviseur de débit (1, P094, bouchons de transport retirés comme le dit la
// note) fixé au dos du mât par deux vis H 3/8-16 × 2 3/4 (3) et rondelles
// Nord-Lock (4) logées dans ses gradins d'angle ; six coudes 90° ORB-JIC
// SAE-6 (2, FA01052-06) dans les orifices R1, PB, R2 (nez vers le haut) et
// E1, PA, E2 (nez vers le bas), vers les vérins des centreurs et de la
// plaque à coins.
// Repère : celui de l'avance (placé à l'identité par P028) ; face d'appui du
// bloc contre le dos du mât (z = -FEED.D / 2), face des orifices vers -Z,
// bloc centré en x = -0,10, y = 0,22 (position du collecteur dans ../feed.js),
// cartouche du diviseur côté -X. Encombrement ≈ 0.18 × 0.17 × 0.11 m.
import { FEED } from '../feed.js';
import { u, along, hhcs, nordLock, jicElbow } from '../../du311/parts/_avance_b.js';
import { BLOCK094 } from './P094.js';
import { basis, nlT } from './_feedcent.js';

const POS = [-0.1, 0.22, -FEED.D / 2];

export default function P092(api) {
  const { THREE, S } = api;
  const { at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  // Pièce dans le repère du bloc (P094), portée au dos du mât (bloc retourné).
  const M = (obj) => at(group(obj), POS, [0, Math.PI, 0]);
  const v = (x, y, z) => [u(x), u(y), u(z)];
  const { H, step } = BLOCK094;

  P('1', M(api.sub('P094', { fitted: true })), [0, 0, -0.12]);
  // 2 — coudes : queue dans l'orifice (+Z du bloc), nez vers le haut ou le bas.
  for (const [name, [x, y]] of Object.entries(BLOCK094.ports)) {
    const up = name[0] === 'R' || name === 'PB';
    P('2', M(basis(THREE, jicElbow(S, THREE, 6), [0, up ? 1 : -1, 0], [0, 0, 1], v(x, y, H))), [0, up ? 0.04 : -0.04, -0.2]);
  }
  // 3 / 4 — vis de fixation dans les gradins : tête sur le fond du gradin.
  for (const [x, y] of BLOCK094.bolts) {
    const z = H - step;
    P('4', M(along(THREE, nordLock(S, THREE, 0.375), [0, 0, 1], v(x, y, z))), [0, 0, -0.18]);
    P('3', M(along(THREE, hhcs(S, THREE, 0.375, 2.75), [0, 0, 1], v(x, y, z + nlT(0.375)))), [0, 0, -0.26]);
  }
  return { view: { dir: [-0.6, 0.6, -1.2] } };
}

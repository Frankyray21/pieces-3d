// P104 — Tube de centreur équipé CX034987 rév. 0 (page 104) : « ASSY,
// CENTRALIZER TUBE », repère 9 du centreur fendu P098 (deux, un par bras).
// Le fourreau (1, P106, bagues comprises) et l'axe de mâchoire (2, CM45264,
// « PIN, 1" X 3.865 LG. ») : axe Ø 1 po à tête Ø 1 1/2, enfilé d'en haut au
// travers des bagues des deux tôles et de la mâchoire (P146), bout chanfreiné
// arrêté dans la bague basse.
// Repère : celui de P106 (origine sur l'axe de forage, mâchoires fermées, au
// dessus de la tôle basse ; +X vers l'extérieur le long du fourreau, Y vers
// le haut, Z en travers). Encombrement ≈ 0.224 (X) × 0.11 (Y, de -0.013 à
// 0.098) × 0.263 (Z) m.
import { u, pin } from './_avance_b.js';
import { TUBE106 } from './P106.js';

export default function P104(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  P('1', api.sub('P106'), [0, 0, 0]);
  // Axe Ø 1 × 3.865 po sous tête (tête Ø 1 1/2 × 1/4) : tête sur l'aile haute.
  const len = 3.865, yTop = TUBE106.gap + TUBE106.t;
  const p = pin(S, THREE, 1.0, len, { head: { r: 0.75, h: 0.25 } });
  p.position.set(TUBE106.pinX, yTop - u(len / 2), 0);
  P('2', p, [0, 0.12, 0]);
  return { view: { dir: [1, 0.8, 1.1] } };
}

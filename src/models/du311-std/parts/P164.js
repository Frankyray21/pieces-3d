// P164 — Glissière « CLTR ASSY, SLIDE DU311 10703 » CX038458 (pages 164 et
// 166) : ensemble de glissement (P168 : châssis avant de la glissière,
// paliers, cadre dressé basculant, chariot de translation, actionneur rotatif,
// vérins), support du laser d'alignement (P182, repris du TVK P180), support
// de la caméra de translation (P186), circuit d'air (P188), stabilisateurs
// avant (P194), graissage centralisé (P196), clapet de retenue de charge
// (P200), bloc d'alimentation de l'avance (P202) : tous dans le repère
// machine (../layout.js), posés à l'identité, sauf le support du laser.
// Le support du laser (repère du TVK P170 : origine au centre du carter de
// l'actionneur rotatif) est posé au centre du carter de cette glissière (AC
// de _slide.js) ; ses deux disques, un par colonne, sont ramenés sur les faces
// extérieures des colonnes de ce cadre (z = ±0.849 au lieu de ±0.67 sur le
// TVK) ; corps « tilt » (cadre dressé).
// 9, 10 — deux vis H 1 po × 3 3/4 et contre-écrous : butées réglables du cadre
// dressé, vissées verticalement dans les caissons latéraux du châssis avant
// de la glissière (P180), tête vers le haut sous les colonnes.
import { body } from '../layout.js';
import { AC } from './_slide.js';

const IN = 0.0254;
const COL_Z = 0.849; // faces extérieures des colonnes du cadre dressé (P170)
const TVK_Z = 0.658; // faces d'appui des disques sur le TVK (P180)

export default function P164(api) {
  const { THREE, S } = api;
  const { bolt, nut, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  P('1', api.sub('P168'), [0, 0, 0]);
  // 2 — support du laser : chaque pièce glissée vers sa colonne
  const laser = api.sub('P182');
  laser.updateMatrixWorld(true);
  for (const c of laser.children) {
    const z = new THREE.Box3().setFromObject(c).getCenter(new THREE.Vector3()).z;
    c.position.z += Math.sign(z) * (COL_Z - TVK_Z);
  }
  P('2', body('tilt', at(laser, AC)), [0, 0.3, 0]);
  P('3', api.sub('P186'), [0, 0.3, -0.3]);
  P('4', api.sub('P188'), [0, 0, 0.4]);
  P('5', api.sub('P194'), [0.3, -0.2, 0]);
  P('6', api.sub('P196'), [0, 0.3, 0.3]);
  P('7', api.sub('P200'), [0.2, 0, 0.3]);
  P('8', api.sub('P202'), [0.2, 0, -0.3]);
  // 9 / 10 — butées du cadre dressé (tête en haut, contre-écrou sur le dessus du caisson)
  for (const s of [1, -1]) {
    const p = [2.72, 1.366, s * 0.62];
    P('9', body('front', bolt(1 * IN, 3.75 * IN, 'zinc', { pos: [p[0], p[1] + 0.035, p[2]] })), [0, 0.35, 0]);
    P('10', body('front', nut(1.5 * IN, 0.025, 'zinc', { pos: [p[0], p[1] + 0.0125, p[2]] })), [0, 0.25, 0]);
  }
  return { view: { dir: [1.0, 0.7, 1.2] } };
}

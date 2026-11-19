// P002 — Foreuse DR1500-U (ensemble de la page 2, 14 repères), repère foreuse de layout.js, pose de référence de la
// couverture (page 1) : mât à 0° et rentré, table et tête en avant, juste derrière le serre-tiges.
// Sous-assemblages posés aux constantes de layout.js : assise P003 et mât P004 à l'identité, table P005 et tête P012
// (avec le kit d'adaptateur P011 et le mandrin P018) en TABLE.pos, kit de poulie P006 en POULIE.pos, base du
// serre-tiges P025 en RCB.pos, serre-tiges P021 en RC.pos, treuil P014 en HOIST.pos ; pièces sans page (frame skud,
// bloc I/O, pattes d'extension, plaque d'ancrage, vérins de tilt, pins) de ensemble-pieces.js, déjà en place.
// Éclaté comme la p. 2 (vue de l'avant gauche) : tête, table et serre-tiges en haut à gauche, mât au-dessus de
// l'assise, poulie en haut à droite, treuil, vérins de tilt et pattes à droite, frame skud en bas, plaque d'ancrage
// en bas à gauche.
import { TABLE, RCB, RC, POULIE, HOIST } from '../layout.js';
import { ensemblePieces, eclate } from './ensemble-pieces.js';

// Facettes allégées des sous-assemblages (vue d'ensemble : ≈ 0,6 million de triangles au lieu de 1,1) ; chaque
// sous-assemblage ouvert seul reste détaillé.
const QUALITY = 0.35;

export default function P002(api) {
  const { at } = api.S;
  const q = { quality: QUALITY };
  const sub = (id, pos) => (pos ? at(api.sub(id, q), pos) : api.sub(id, q));
  api.part('7', sub('P003'), [0, 0.35, 0]);
  api.part('5', sub('P004'), [0, 0.8, 0]);
  api.part('3', sub('P005', TABLE.pos), [0.2, 1.25, 0]);
  api.part('2', sub('P012', TABLE.pos), [0.2, 1.8, 0]);
  api.part('6', sub('P006', POULIE.pos), [-0.7, 1.2, 0]);
  api.part('16', sub('P025', RCB.pos), [0.75, 0.45, 0.35]);
  api.part('10', sub('P021', RC.pos), [1.15, 0.55, 0.75]);
  api.part('14', sub('P014', HOIST.pos), [-0.55, 0.6, -1.75]);
  const E = ensemblePieces(api);
  for (const [ref, objs] of Object.entries(E)) objs.forEach((o, i) => api.part(ref, o, eclate(ref, i)));
  return { view: { dir: [0.75, 0.45, -0.9] } };
}

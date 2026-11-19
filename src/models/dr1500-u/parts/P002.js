// BROUILLON JETABLE du lot A (contrôle d'emboîtement) — à supprimer, ne pas inscrire.
import { TABLE, POULIE, RCB, RC, HOIST } from '../layout.js';
import { ensemblePieces, eclate } from './ensemble-pieces.js';

export default function P002(api) {
  const S = api.S;
  const sub = (id, pos) => { try { return S.at(api.sub(id), pos); } catch (e) { console.warn(id, e.message); return null; } };
  const put = (ref, id, pos, ex) => { const o = sub(id, pos); if (o) api.part(ref, o, ex); };
  put('7', 'P003', [0, 0, 0], [0, 0.4, 0]);
  put('5', 'P004', [0, 0, 0], [0, 0.9, 0]);
  put('3', 'P005', TABLE.pos, [0, 1.3, 0]);
  put('6', 'P006', POULIE.pos, [-0.4, 1.3, 0]);
  put('16', 'P025', RCB.pos, [0.3, 1.2, 0]);
  put('2', 'P012', TABLE.pos, [0, 1.8, 0]);
  put('10', 'P021', RC.pos, [0.4, 1.7, 0]);
  put('14', 'P014', HOIST.pos, [-0.5, -0.3, 0.9]);
  const E = ensemblePieces(api);
  for (const [r, arr] of Object.entries(E)) arr.forEach((o, i) => api.part(r, o, eclate(r, i)));
  return { view: { dir: [0.8, 0.55, -1.1] } };
}

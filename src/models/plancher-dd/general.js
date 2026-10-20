// Vue d'ensemble (P02) : plancher complet de 16 × 32 pi dans sa galerie, avec
// le matériel de sécurité de la procédure (sans la foreuse). Les
// sous-assemblages sont construits dans le même repère et insérés tels quels.
import { L, W, DECK, ground, STEPS, NOTES } from './plan.js';
import { labeler } from './lumber.js';
import { gallery, paintLine, barricade, cabinet, extinguisher, guides, highPoint } from './site.js';
import { dimensions } from './dims.js';

const IN_PLACE = { inPlace: true };

export function P02(api) {
  const S = api.S;
  const put = labeler(api);
  put('G', gallery(S), [0, 0, 0], -1, { noLabel: true }); // décor : toujours affiché
  put('1', paintLine(S), [0, 0, 0], 1, { noDrop: true });
  put('2', api.sub('P04', IN_PLACE), [0, 0, 0], 5);
  put('3', api.sub('P07', IN_PLACE), [0, 1.1, 0], 8);
  put('4', api.sub('P10', IN_PLACE), [1.2, 0, 0], 11);
  put('5', api.sub('P13', IN_PLACE), [1.2, 1.1, 0], 13);
  put('6', api.sub('P14', IN_PLACE), [2.6, 0.6, 0], 14);
  put('7', api.sub('P16', IN_PLACE), [1.2, 2.2, 0], 17);
  put('8', api.sub('P17', IN_PLACE), [0, 2.4, -0.4], 18);
  // Barricade de panneaux suspendus en travers de la galerie, à l'entrée du chantier.
  const bar = barricade(S, L + 4.3);
  put('10', bar, [1.2, 0, 0], 0, { seq: 0 });
  // Armoire et extincteur au sol, à l'entrée du chantier (en place avant le plancher).
  const cab = cabinet(S);
  cab.position.set(L + 3.0, ground(L + 3.0, -3.6), -3.6);
  put('11', cab, [0.6, 0, 0], 0, { seq: 1 });
  const ext = extinguisher(S);
  ext.position.set(L + 3.65, ground(L + 3.65, -3.5), -3.5);
  put('12', ext, [0.6, 0, 0], 0, { seq: 2 });
  // Outils montrés seulement à leurs étapes (laser, niveau, coins de serrage).
  for (const g of guides(S, highPoint())) api.add(g);
  // Cotes et repères de mesure, affichés à leurs étapes.
  for (const d of dimensions()) api.add(d);
  // steps : montage par étapes proposé sur cette vue (bouton « Montage »).
  return { view: { dir: [1.05, 0.85, 1.2], steps: STEPS, notes: NOTES } };
}

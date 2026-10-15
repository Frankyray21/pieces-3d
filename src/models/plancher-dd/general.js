// Vue d'ensemble (P02) : plancher complet de 16 × 32 pi dans sa galerie, avec
// la foreuse en silhouette et le matériel de sécurité de la procédure. Les
// sous-assemblages sont construits dans le même repère et insérés tels quels.
import { L, W, DECK, ground } from './plan.js';
import { labeler } from './lumber.js';
import { gallery, paintLine, drill, barricade, cabinet, extinguisher } from './site.js';

const IN_PLACE = { inPlace: true };

export function P02(api) {
  const S = api.S;
  const put = labeler(api);
  put('G', gallery(S), [0, 0, 0], 0, { noLabel: true });
  put('1', paintLine(S), [0, 0, 0], 1);
  put('2', api.sub('P04', IN_PLACE), [0, 0, 0], 5);
  put('3', api.sub('P07', IN_PLACE), [0, 1.1, 0], 8);
  put('4', api.sub('P10', IN_PLACE), [1.2, 0, 0], 11);
  put('5', api.sub('P13', IN_PLACE), [1.2, 1.1, 0], 13);
  put('6', api.sub('P14', IN_PLACE), [2.6, 0.6, 0], 14);
  put('7', api.sub('P16', IN_PLACE), [1.2, 2.2, 0], 17);
  put('8', api.sub('P17', IN_PLACE), [0, 2.4, -0.4], 18);
  put('9', drill(S), [0, 3.4, 0], 18);
  const bar = barricade(S);
  bar.position.set(L + 4.3, ground(L + 4.3, -0.9), -0.9);
  put('10', bar, [1.2, 0, 0], 0);
  const cab = cabinet(S);
  cab.position.set(L - 0.75, DECK, W / 2 - 0.42);
  put('11', cab, [0, 2.6, 0.6], 18);
  const ext = extinguisher(S);
  ext.position.set(L - 1.35, DECK, W / 2 - 0.3);
  put('12', ext, [0, 2.6, 0.6], 18);
  return { view: { dir: [1.05, 0.85, 1.2] } };
}

// P396 — Clapet anti-retour d'injection de graisse V30 : CX036965 rév. 0
// « ASSY, CHECK VALVE - V30 GREASE INJECTION » (page 396), repère 34 de P186.
// Ligne de haut en bas comme sur le dessin : adaptateur droit NPT 3/8 → JIC
// -06 (3) dont la queue NPT monte vers l'injecteur, adaptateur droit NPT 1/4 →
// écrou tournant JIC -06 (4) vissé dans le haut du clapet, clapet anti-retour
// 1/4 NPT femelle à corps six-pans (1), coude 45° NPT 1/4 → JIC -06 (2) en bas.
// Repère : origine au centre du clapet, Y selon l'axe de la ligne (+Y vers
// l'adaptateur 3), sortie du coude 45° vers -Y / +Z. Corps du clapet six-pans
// 7/8 po × 2 po (proportions du dessin). Encombrement ≈ 0.03 × 0.17 × 0.04 m.
import { IN, nptFitting, inlineCheck } from './_chassis.js';

export default function P396(api) {
  const { S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const L = 2 * IN;
  P('1', inlineCheck(api, 4, L, 0.875 * IN, 'steel'), [0, 0, 0]);
  // 4 : queue NPT 1/4 dans le haut du clapet, écrou tournant -06 en haut.
  const f4 = nptFitting(api, { npt: 4, jic: 6, end: 'swivel' });
  P('4', S.at(f4.obj, [0, L / 2, 0]), [0, 0.04, 0]);
  const top4 = L / 2 + f4.out[1];
  // 3 : retourné, embout JIC engagé de 6 mm dans l'écrou de 4, queue NPT 3/8 en haut.
  const f3 = nptFitting(api, { npt: 6, jic: 6, end: 'jic' });
  P('3', S.at(f3.obj, [0, top4 - 0.006 + f3.out[1], 0], [Math.PI, 0, 0]), [0, 0.08, 0]);
  // 2 : retourné sous le clapet, sortie 45° vers -Y / +Z.
  const f2 = nptFitting(api, { npt: 4, jic: 6, angle: 45, end: 'jic' });
  P('2', S.at(f2.obj, [0, -L / 2, 0], [Math.PI, Math.PI, 0]), [0, -0.05, 0]);
  return { view: { dir: [1, 0.4, 0.9] } };
}

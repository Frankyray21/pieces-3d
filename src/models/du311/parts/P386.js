// P386 — Clapet navette LS CX034873 rév. 0 (page 386), repère 41 du porteur
// P328 (« FOR DA201/DA101 »). Clapet navette 1/4 NPT (1, CP17024, même corps
// que dans P358) : entrée −X par un coude 90° 1/4 NPT / JIC -06 (3, « FROM LS
// PORT OF CX030338 »), entrée +X par un coude 45° 1/4 NPT / JIC -06 (2),
// sortie sur la face avant par un adaptateur droit 1/4 NPT / écrou tournant
// JIC -06 (4, « CONNECT TO LS PORT OF DRILLING VALVE BANK »). Pas de fixation
// propre : le clapet est porté par ses flexibles.
// Repère : origine au centre de la face inférieure du corps, Y vers le haut,
// X selon l'axe des entrées (+X côté coude 45°), +Z vers la sortie (avant).
// Encombrement ≈ 0.09 (X) × 0.05 (Y) × 0.05 (Z) m.
import { RAC_IN as IN, racFactory, racBlock, racPose } from './_porteur.js';

const L = 1.5 * IN, C = 1.0 * IN;

export default function P386(api) {
  const { S, THREE } = api;
  const F = racFactory(S);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const rn = (0.54 * IN) / 2;

  const body = racBlock(S, THREE, L, C, C, [
    { p: [-L / 2, 0, 0], n: '-x', r: rn }, { p: [L / 2, 0, 0], n: '+x', r: rn }, { p: [0, 0, C / 2], n: '+z', r: rn },
  ], { material: 'castAlu' });
  P('1', S.at(body, [0, C / 2, 0]), [0, 0, 0]);
  // 3 — coude 90° (entrée −X), sortie vers le haut.
  P('3', racPose(THREE, F.elbow({ port: 'npt', pd: 4, jd: 6 }), [-L / 2, C / 2, 0], [-1, 0, 0], [0, 1, 0]), [-0.04, 0, 0]);
  // 2 — coude 45° (entrée +X), sortie inclinée vers l'arrière.
  P('2', racPose(THREE, F.elbow({ port: 'npt', pd: 4, jd: 6, angle: 45 }), [L / 2, C / 2, 0], [1, 0, 0], [0, 0, -1]), [0.04, 0, 0]);
  // 4 — adaptateur droit NPT / écrou tournant -06 sur la sortie.
  P('4', racPose(THREE, F.nptSwivel(4, 6), [0, C / 2, C / 2], [0, 0, 1]), [0, 0, 0.04]);

  return { view: { dir: [-0.6, 0.8, 1.2] } };
}

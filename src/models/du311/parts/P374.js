// P374 — Réducteur de pression des freins CX032616 rév. 0 (page 374), repère
// 36 du porteur P328. Réducteur de pression (1, CP17157) : corps d'acier
// 1 1/2 × 3 × 1 1/2 po, cartouche à six-pans et capuchon de réglage sur le
// dessus, bouchon d'essai six-pans en haut de la face avant, bossage sous le
// corps ; fixé par deux vis H 1/4-20 × 2 po (5) et rondelles (6) qui le
// traversent d'avant en arrière. Orifices SAE -06 : face avant, coude 90° (3)
// vers le bas ; flanc +X, adaptateur droit (4) portant un té tournant -06 (2,
// passage vers +X, branche vers le bas) et, plus bas, un coude 90° (3) vers
// le bas.
// Repère : origine au centre de la face arrière du corps (face d'appui), Y
// vers le haut, +X vers le flanc des orifices 4 et 3 bas, +Z vers l'avant
// (têtes des vis). Encombrement ≈ 0.09 (X) × 0.14 (Y) × 0.07 (Z) m.
import { RAC_IN as IN, racFactory, racBlock, racPose, racPort, racOut } from './_porteur.js';

const W = 1.5 * IN, H = 3 * IN, D = 1.5 * IN;

export default function P374(api) {
  const { S, THREE } = api;
  const { lathe, merged, group, at } = S;
  const F = racFactory(S);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const r6 = (0.5625 * IN) / 2, sp6 = 0.5 * IN;
  const bolts = [[-0.42 * IN, 0.15 * IN], [0.42 * IN, -1.0 * IN]];

  // 1 — corps et cartouche.
  const body = racBlock(S, THREE, W, H, D, [
    { p: [-0.2 * IN, 0.5 * IN, D / 2], n: '+z', r: r6, spot: sp6 },
    { p: [W / 2, 0.45 * IN, 0], n: '+x', r: r6, spot: sp6 },
    { p: [W / 2, -0.95 * IN, 0], n: '+x', r: r6, spot: sp6 },
    ...bolts.map(([x, y]) => ({ p: [x, y, D / 2], n: '+z', r: 0.14 * IN })),
  ], { material: 'darkSteel' });
  // Six-pans de la cartouche, capuchon de réglage, bouchon d'essai (face
  // avant, en haut à gauche), bossage du dessous.
  const hex = lathe([[0, 0], [0.65 * IN, 0], [0.65 * IN, 0.55 * IN], [0.55 * IN, 0.65 * IN], [0, 0.65 * IN]], 'zinc', { seg: 6, pos: [0, H / 2, 0] });
  const testPlug = lathe([[0, 0], [0.3 * IN, 0], [0.3 * IN, 0.22 * IN], [0, 0.22 * IN]], 'zinc', { axis: 'z', seg: 6, pos: [-0.5 * IN, H / 2 - 0.3 * IN, D / 2] });
  const cap = lathe([[0, 0.65 * IN], [0.47 * IN, 0.65 * IN], [0.47 * IN, 2.0 * IN], [0.42 * IN, 2.08 * IN], [0, 2.08 * IN]], 'black', { seg: 14, pos: [0, H / 2, 0] });
  const boss = lathe([[0, 0], [0.45 * IN, 0], [0.45 * IN, 0.3 * IN], [0, 0.3 * IN]], 'darkSteel', { axis: '-y', seg: 6, pos: [0, -H / 2 + 0.0005, 0] });
  const valve = group(body, merged([hex, testPlug], 'zinc'), cap, boss);
  P('1', at(valve, [0, 0, D / 2]), [0, 0, 0]);

  // 3 — coudes -06 : face avant et bas du flanc +X, sorties vers le bas.
  P('3', racPose(THREE, F.elbow({ pd: 6, jd: 6 }), [-0.2 * IN, 0.5 * IN, D], [0, 0, 1], [0, -1, 0]), [0, 0, 0.05]);
  P('3', racPose(THREE, F.elbow({ pd: 6, jd: 6 }), [W / 2, -0.95 * IN, D / 2], [1, 0, 0], [0, -1, 0]), [0.05, 0, 0]);
  // 4 — adaptateur droit -06 et 2 — té tournant (passage +X, branche vers le bas).
  const a4 = racPose(THREE, F.straight({ pd: 6, jd: 6 }), [W / 2, 0.45 * IN, D / 2], [1, 0, 0]);
  P('4', a4, [0.04, 0, 0]);
  const q = racPort(THREE, a4);
  P('2', racPose(THREE, F.swivel({ kind: 'tee', fd: 6 }), q.p, q.d, [0, -1, 0]), [0.08, 0, 0]);

  // 5 — vis H 1/4-20 × 2 po au travers du corps, 6 — rondelles sous la tête.
  const d = 0.25 * IN;
  for (const [x, y] of bolts) {
    P('6', racPose(THREE, group(F.washer(d)), [x, y, D], [0, 0, 1]), [0, 0, 0.06]);
    P('5', racPose(THREE, group(F.bolt(d, 2 * IN)), [x, y, D + d * 0.16], [0, 0, 1]), [0, 0, 0.1]);
  }

  return { view: { dir: [0.9, 0.6, 1.2] } };
}

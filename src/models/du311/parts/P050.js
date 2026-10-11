// P050 — Régulateur de débit du basculeur de dérivation (sortie) : CX031934
// rév. 0 « ASSY, DIVERTER SW. OUT FLOW CONTROL » (page 50), repère 11 de
// l'avance P032. Bloc régulateur de débit à cartouche CP17153 (1), alu, 2 ×
// 3 × 1 1/4 po, chapeau supérieur rapporté (trait de joint), deux trous de
// fixation Ø 9/32 au travers de l'épaisseur (vis H 1/4-20 × 1 1/2 (5) et
// rondelles fendues (6)) ; orifices SAE-6 : deux sur le flanc +X, chacun avec
// adaptateur droit ORB / JIC-06 (4) et réducteur calibré femelle tournant /
// mâle JIC (2) ; un sur le flanc −X avec coude 90° orientable ORB / JIC-06 (3),
// sortie vers le haut ; bouchon six pans du flanc −X et bouton de réglage
// de la cartouche dessous.
// Repère : origine au centre de la face d'appui (face arrière, −Z), +Z vers
// l'avant (têtes de vis), Y vers le haut, +X vers les deux orifices des
// réducteurs. Encombrement ≈ 0.16 (X) × 0.10 (Y) × 0.035 (Z) m.
import { IN, straight, elbow, union, swivelNut, place, seat, hhcs, splitWasher } from './_avance_a.js';

const W = 2 * IN, H = 3 * IN, D = 1.25 * IN;

export default function P050(api) {
  const { S } = api;
  const { box, lathe, nut, cyl, merged, group, at, extrude } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // 1 — bloc : corps et chapeau (2 1/2 po du bas / 1/2 po en haut, joint),
  // trous de fixation (extrusion percée selon Z), lamages des orifices.
  const holes = [[W / 2 - 0.3 * IN, H / 2 - 0.35 * IN], [-W / 2 + 0.3 * IN, -H / 2 + 0.35 * IN]];
  const body = extrude([[-W / 2, -H / 2], [W / 2, -H / 2], [W / 2, H / 2 - 0.55 * IN], [-W / 2, H / 2 - 0.55 * IN]], D, 'castAlu', { holes: holes.filter((h) => h[1] < 0).map(([x, y]) => [x, y, (9 / 64) * IN]) });
  const cap = extrude([[-W / 2, H / 2 - 0.54 * IN], [W / 2, H / 2 - 0.54 * IN], [W / 2, H / 2], [-W / 2, H / 2]], D, 'castAlu', { holes: holes.filter((h) => h[1] > 0).map(([x, y]) => [x, y, (9 / 64) * IN]) });
  const portsR = [H / 2 - 1.05 * IN, -H / 2 + 0.75 * IN];
  const yL = H / 2 - 1.05 * IN;
  const spots = [
    ...portsR.map((y) => at(cyl(0.45 * IN, 0.001, 'castAlu', { axis: 'x', seg: 20 }), [W / 2 + 0.0005, y, 0])),
    at(cyl(0.45 * IN, 0.001, 'castAlu', { axis: 'x', seg: 20 }), [-W / 2 - 0.0005, yL, 0]),
  ];
  // Bouchon du flanc −X (haut) et bouton de réglage dessous.
  const plug = at(nut(0.5 * IN, 0.006, 'steel', { axis: 'x' }), [-W / 2 - 0.003, H / 2 - 0.3 * IN, 0.1 * IN]);
  const knob = group(
    at(nut(0.875 * IN, 0.01, 'steel'), [0, -H / 2 - 0.005, 0]),
    lathe([[0, 0], [0.0075, 0], [0.0075, 0.012], [0.006, 0.014], [0, 0.014]], 'steel', { seg: 18, pos: [0, -H / 2 - 0.024, 0] }),
  );
  const blk = group(merged([body, cap, ...spots], 'castAlu'), plug, knob);
  blk.position.z = D / 2;
  P('1', blk, [0, 0, 0]);

  // 4 / 2 — orifices +X : adaptateur droit ORB / JIC-06, réducteur calibré.
  portsR.forEach((y, i) => {
    const a = place(straight('orb', 6, 6), [W / 2, y, D / 2], [1, 0, 0]);
    P('4', a, [0.05, 0, 0]);
    const s = seat(a, 0);
    // Réducteur : écrou tournant sur le cône de l'adaptateur, corps six pans,
    // mâle JIC (union -06 dont un bout reste dans l'écrou).
    const u = union(6);
    const r = group(at(u, [0, u.userData.ports[0].p.y, 0]), swivelNut(6, 'zinc'));
    P('2', place(r, s.p, s.d), [0.11 + i * 0.02, 0, 0]);
  });
  // 3 — coude orientable sur l'orifice −X, sortie vers le haut.
  P('3', place(elbow('orb', 6, 6), [-W / 2, yL, D / 2], [-1, 0, 0], [0, 1, 0]), [-0.06, 0, 0]);

  // 5 / 6 — vis selon −Z, têtes à l'avant.
  for (const [x, y] of holes) {
    P('6', splitWasher(0.25 * IN, [x, y, D + 0.001], [0, 0, 1]), [0, 0, 0.05]);
    P('5', hhcs(0.25 * IN, 1.5 * IN, [x, y, D + 0.002], [0, 0, 1]), [0, 0, 0.09]);
  }
  void box;
  return { view: { dir: [-0.8, 0.5, 1.2] } };
}

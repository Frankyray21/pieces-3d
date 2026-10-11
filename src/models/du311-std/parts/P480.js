// P480 — Pressostat différentiel CX035382 « ASSY, PRESSURE DIFF. SWITCH »
// (page 480), repère 20 de P430 : signale le colmatage du filtre 1 µm
// d'admission (prises de part et d'autre du filtre, P482 rep. 7 et 9).
// Pressostat (1, CP19021-9) : corps en alu à deux chambres, prise haute
// pression à droite (taraudage 1/4 NPT), prise basse pression à gauche
// (queue mâle 1/4 NPT), boîtier de contacts carré au-dessus avec molette de
// réglage et connecteur DIN ; té de branche 1/4 po (2) vissé dans la prise
// HP, coude 90° MNPT 1/4 → JIC -06 (3) au bout du passage du té ; coude 90°
// FNPT 1/4 → JIC -06 (4) sur la queue BP.
// Repère : origine au centre du corps ; X selon l'axe des prises (HP vers
// +X), Y vers le haut (boîtier de contacts), +Z face avant (connecteur).
// Encombrement ≈ 0.20 (X) × 0.13 (Y) × 0.07 (Z) m. Cotes : raccords 1/4 NPT
// de la liste ; pressostat aux proportions de la page 480.
import { ACC, I, ENG, runTee, pipeR, nptMale, hexProf } from './_rearb.js';

const E4 = ENG(4);

export default function P480(api) {
  const { S } = api;
  const { box, cyl, lathe, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);
  const X = [1, 0, 0], NX = [-1, 0, 0], Y = [0, 1, 0], NY = [0, -1, 0], Z = [0, 0, 1];
  const XR = 0.032, XL = -0.032; // faces des prises HP / BP

  // ---------------------------------------------------------------- 1 — pressostat
  {
    const r4 = pipeR(4);
    const alu = merged([
      box(0.05, 0.036, 0.04, 'castAlu', { r: 0.004 }),
      lathe([[r4 * 0.98, 0.025], ...hexProf(I(0.75), 0.025, XR).slice(1, -1), [r4 * 0.98, XR], [r4 * 0.98, 0.025]], 'castAlu', { axis: 'x', seg: 6 }),
      lathe(hexProf(I(0.625), -0.034, -0.025), 'castAlu', { axis: 'x', seg: 6 }),
    ], 'castAlu');
    const stub = at(group(lathe(nptMale(S, 4), 'steel', { seg: 14 })), [XL - 0.002, 0, 0], [0, 0, -Math.PI / 2]);
    const headB = merged([
      box(0.044, 0.044, 0.044, 'black', { r: 0.004, pos: [0, 0.042, 0] }),
      box(0.03, 0.03, 0.012, 'black', { r: 0.002, pos: [0, 0.044, 0.028] }),
      box(0.022, 0.022, 0.01, 'black', { r: 0.002, pos: [0, 0.044, 0.039] }),
    ], 'black');
    const knob = merged([lathe([[0, 0], [0.009, 0], [0.009, 0.008], [0.006, 0.01], [0, 0.01]], 'red', { seg: 16, pos: [0, 0.064, 0] })], 'red');
    const screws = merged([[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => at(S.bolt(0.003, 0.008, 'zinc', { axis: 'z' }), [a * 0.017, 0.042 + b * 0.017, 0.022])), 'zinc');
    P('1', group(alu, stub, headB, knob, screws), [0, 0.05, 0]);
  }

  // ---------------------------------------------------------------- 2, 3 — té de branche et coude côté HP
  {
    const rt = runTee(S, 4).userData;
    const c2 = [XR - E4 + rt.male, 0, 0];
    P('2', O(runTee(S, 4), c2, X, NY), [0.05, 0, 0]);
    P('3', O(ACC.elbow(S, { a: 4, b: 6 }), [c2[0] + rt.a, 0, 0], X, Y), [0.09, 0, 0]);
  }
  // ---------------------------------------------------------------- 4 — coude FNPT → JIC côté BP
  P('4', O(ACC.elbow(S, { a: 4, b: 6, female: true }), [XL - 0.004, 0, 0], NX, Y), [-0.06, 0, 0]);

  void cyl; void Z;
  return { view: { dir: [0.4, 0.5, 1.0] } };
}

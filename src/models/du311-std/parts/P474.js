// P474 — Arrivée d'eau CX034806 « ASSY, WATER INLET, DU311 » (page 474),
// repère 17 de P430 : eau de la mine vers le refroidisseur final et la
// ligne d'eau de forage. Ligne haute horizontale traversant l'équerre de
// cloison (P430 rep. 8, manchon 1 po soudé, « shown as a reference ») :
// côté extérieur, mamelon six-pans 1 po (6), robinet à bille 1 po (1) et
// coude 90° MNPT 1 → JIC -16 (2) tourné vers le bas (arrivée du flexible
// d'eau) ; côté intérieur, mamelon six-pans (6), second robinet (1) et coude
// FNPT-MNPT 1 po (5) vers le bas ; mamelon 1 × 6 po sch. 40 (8) vertical, té
// femelle 1 po (7) : adaptateur droit MNPT 1 → JIC -16 (3) sur la branche
// (vers le refroidisseur P466 rep. 8), adaptateur droit MNPT → JIC/JIC à
// branche (4) en bout (ligne d'eau de forage et prise auxiliaire).
// Repère : origine au centre du manchon de cloison ; X selon la ligne haute
// (+X côté extérieur, robinet de garde), Y vers le haut, +Z = X × Y (branche
// du té). Manchon de longueur WI.cpl, faces à x = ±WI.cpl / 2.
// Encombrement ≈ 0.42 (X) × 0.33 (Y) × 0.12 (Z) m. Cotes : tuyauterie 1 NPT
// et longueur du mamelon 8 (liste) ; robinets aux proportions de la page 474.
import { ACC, I, ENG, hexNipple, streetElbow, jicMale, jicLen, hexProf, add } from './_rearb.js';

const E16 = ENG(16);
const SV = 0.04; // taille de la vanne à bille (ballValve)
export const WI = { cpl: I(2.0) };

export default function P474(api) {
  const { S } = api;
  const { lathe, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);
  const X = [1, 0, 0], NX = [-1, 0, 0], Y = [0, 1, 0], NY = [0, -1, 0], Z = [0, 0, 1];
  const hn = hexNipple(S, 16).userData;
  const hv = 1.15 * SV; // centre → face d'orifice de la vanne

  for (const s of [1, -1]) {
    const d = [s, 0, 0];
    const c6 = WI.cpl / 2 - E16 + hn.ya;
    P('6', O(hexNipple(S, 16), [s * c6, 0, 0], d.map((v) => -v), Y), [s * 0.04, 0, 0]);
    const face = c6 + hn.yb - E16;
    P('1', at(S.ballValve(SV, 'brass', { handle: 'red' }), [s * (face + hv), 0, 0]), [s * 0.08, 0.02, 0]);
    const out = face + 2 * hv;
    if (s > 0) {
      P('2', O(ACC.elbow(S, { a: 16, b: 16 }), [out, 0, 0], X, NY), [0.14, 0, 0]);
    } else {
      const se = streetElbow(S, 16).userData;
      const c5 = [-(out - E16 + se.male), 0, 0];
      P('5', O(streetElbow(S, 16), c5, NX, NY), [-0.14, 0, 0]);
      const y8 = -se.a + E16;
      P('8', O(ACC.nipple(S, 16, I(6), 'darkSteel'), [c5[0], y8, 0], NY, X), [-0.14, -0.04, 0]);
      const A7 = ACC.pipeTee(S, 16).userData.a;
      const c7 = [c5[0], y8 - I(6) + E16 - A7, 0];
      P('7', O(ACC.pipeTee(S, 16), c7, NY, Z), [-0.14, -0.08, 0]);
      P('3', O(ACC.straight(S, { a: 16, b: 16 }), add(c7, Z, A7), Z, X), [-0.14, -0.08, 0.06]);
      // 4 — adaptateur MNPT 1 → JIC -16 en bout et JIC -16 en branche latérale.
      const st = ACC.straight(S, { a: 16, b: 16 });
      const T = I(1.3125), yb = st.userData.tip * 0.45;
      const side = at(group(lathe([[0, 0], [T * 0.5, 0], [T * 0.5, 0.02], [0, 0.02]], 'zinc', { seg: 14 }), lathe(jicMale(16, 0.02), 'zinc', { seg: 14 })), [0, yb, 0], [0, 0, -Math.PI / 2]);
      const body = lathe(hexProf(I(1.625), yb - 0.012, yb + 0.012), 'zinc', { seg: 6 });
      P('4', O(group(merged([st, side, body], 'zinc')), [c7[0], c7[1] - A7, 0], NY, NX), [-0.14, -0.14, 0]);
      void jicLen;
    }
  }

  return { view: { dir: [0.5, 0.4, 1.0] } };
}

// P462 — Dérivation du surpresseur CX027370 « ASSEMBLY, BYPASS VALVE »
// (page 462), repère 11 de P430. Deux groupes :
//   · ligne d'air (renvoi à l'aspiration de l'air refroidi pendant la marche
//     à vide), montée verticalement, l'air circulant vers le haut (« AIR FLOW
//     DIRECTION ») : coude 45° MNPT 1 1/4 → JIC -20 (7, arrivée), té de
//     passage 1 1/4 po (19) dont la branche porte la réduction 1 1/4 × 3/4
//     (18), le coude FNPT-MNPT 3/4 (14), la soupape de mise à vide à poignée
//     en T (5, CP18222-8) et son coude 3/4 NPT → JIC -06 (9) ; clapet
//     anti-retour inox 1 1/4 po (2), mamelon 1 1/4 × 4 po sch. 80 (21, tenu
//     par le collier P430 rep. 2), vanne 2/2 pilotée 1 1/4 po 500 psi (1) à
//     chambre de membrane, adaptateur 1/4 NPT → JIC -06 (11) et restricteur
//     (3) sur le couvercle de pilotage ; second té (19) : adaptateur droit
//     MNPT 1 1/4 → JIC -20 (13) sur la branche (retour vers P482 rep. 17),
//     réduction forgée 1 1/4 × 1/2 3000 lb (20) et coude 1/2 NPT → JIC -06
//     (8) au bout ;
//   · ligne d'eau (« WATER FLOW DIRECTION » vers le bas) : électrovanne 1 po
//     24 V CC (P464, 6) coiffée du coude MNPT 1 po → JIC -16 (10), mamelon
//     six-pans 1 po (16) vissé dans le manchon de l'équerre P430 rep. 13
//     (« shown as a reference »), réduction 1 × 1/2 (17), mamelon six-pans
//     1/2 po (15), pointeau 1/2 po à volant étoile (4) et mamelon six-pans
//     MNPT 1/2 → JIC -08 (12) en sortie.
// Repère : axes du repère machine (P430 pose l'ensemble en RB.byp sans
// rotation) ; origine au centre de la vanne 1, ligne d'air selon +Y ; ligne
// d'eau décalée de W462.off (centre de l'électrovanne P464, même axes),
// manchon de l'équerre 13 entre y = W462.cpl[1] et W462.cpl[1] − W462.L.
// Encombrement ≈ 0.40 (X) × 0.66 (Y) × 0.42 (Z) m. Cotes : raccords NPT / JIC
// de la liste ; vannes aux proportions de la page 462.
import { ACC, I, RB, ENG, sub3, runTee, streetElbow, hexNipple, checkValve, pipeR, hexProf, add } from './_rearb.js';
import { SV } from './P464.js';

const E20 = ENG(20), E16 = ENG(16), E12 = ENG(12), E8 = ENG(8);
const LV = 0.12; // vanne 1 : faces des orifices à y = ±LV / 2
const LC = 0.1; // clapet 2
const L21 = I(4);
const CPL = I(2.0); // manchon 1 po de l'équerre P430 rep. 13

function geom(S) {
  const g = {};
  const rt = runTee(S, 20).userData;
  g.c19b = [0, LV / 2 - E20 + rt.male, 0];
  g.top19b = g.c19b[1] + rt.a;
  g.p21 = [0, -LV / 2 + E20, 0];
  g.cv = [0, -LV / 2 + E20 - L21 + E20 - LC / 2, 0];
  g.c19a = [0, g.cv[1] - LC / 2 + E20 - rt.male, 0];
  g.bot19a = g.c19a[1] - rt.a;
  g.br19a = [rt.a, g.c19a[1], 0];
  g.a = rt.a;
  // Ligne d'eau : centre de l'électrovanne, puis vers le bas.
  g.off = sub3(RB.bypW.pos, RB.byp.pos);
  const o = g.off;
  const n16 = hexNipple(S, 16).userData;
  g.c16 = [o[0], o[1] - SV.port + E16 - n16.ya, o[2]];
  g.cplTop = g.c16[1] - n16.yb + E16;
  g.p17 = g.cplTop - CPL;
  const hh17 = Math.max(I(0.25), (ACC.pipeOD(16) / 2) * 0.45);
  const n15 = hexNipple(S, 8).userData;
  g.c15 = g.p17 - hh17 + E8 - n15.ya;
  g.nv = { top: g.c15 - n15.yb + E8, L: 0.062 };
  return g;
}

/** Manchon de l'équerre P430 rep. 13 : centre de sa face haute (repère de P462) et longueur. */
export function w462(S) {
  const g = geom(S);
  return { cpl: [g.off[0], g.cplTop, g.off[2]], L: CPL, n21: [0, g.p21[1] - L21 / 2, 0] };
}

export default function P462(api) {
  const { S } = api;
  const { box, cyl, lathe, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);
  const g = geom(S);
  const X = [1, 0, 0], NX = [-1, 0, 0], Y = [0, 1, 0], NY = [0, -1, 0], Z = [0, 0, 1], NZ = [0, 0, -1];
  const r20 = pipeR(20);

  // ---------------------------------------------------------------- 1 — vanne 2/2 pilotée 1 1/4 po
  // Corps bronze : bulbe, six-pans d'orifices, col vers −Z, chambre de membrane
  // (deux coquilles, six vis), couvercle à orifice de pilotage 1/4 NPT, plaque.
  {
    const hp = (y0, y1) => lathe([[r20 * 0.98, y0], ...hexProf(I(2.25), y0, y1).slice(1, -1), [r20 * 0.98, y1], [r20 * 0.98, y0]], 'brass', { seg: 6 });
    const body = [
      lathe([[0, -0.036], [0.026, -0.036], [0.036, -0.02], [0.038, 0], [0.036, 0.02], [0.026, 0.036], [0, 0.036]], 'brass', { seg: 28 }),
      hp(-LV / 2, -0.034), hp(0.034, LV / 2),
      cyl(0.026, 0.03, 'brass', { axis: 'z', seg: 24, pos: [0, 0, -0.035] }),
      cyl(0.058, 0.012, 'brass', { axis: 'z', seg: 36, pos: [0, 0, -0.054] }),
      cyl(0.058, 0.012, 'brass', { axis: 'z', seg: 36, pos: [0, 0, -0.067] }),
      lathe([[0, 0], [0.05, 0], [0.05, 0.008], [0.03, 0.016], [0.012, 0.018], [0, 0.018]], 'brass', { seg: 32, pos: [0, 0, -0.073] }),
    ];
    body[body.length - 1].rotation.x = -Math.PI / 2;
    const screws = [];
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.3;
      screws.push(at(S.bolt(0.006, 0.03, 'zinc', { axis: '-z' }), [Math.cos(a) * 0.05, Math.sin(a) * 0.05, -0.073]));
    }
    const tag = at(S.nameplate(0.04, 0.025), [0.0385, 0, 0], [0, Math.PI / 2, 0]);
    P('1', group(merged(body, 'brass'), merged(screws, 'zinc'), tag), [0, 0, -0.12]);
    // 11 — adaptateur 1/4 NPT → JIC -06 dans le couvercle ; 3 — restricteur sur son cône.
    const y11 = [0, 0, -0.091];
    const a11 = ACC.straight(S, { a: 4, b: 6 });
    P('11', O(a11, y11, NZ, X), [0, 0, -0.2]);
    const t11 = add(y11, NZ, a11.userData.tip);
    const T6 = I(9 / 16);
    P('3', O(group(merged([
      lathe(hexProf(I(11 / 16), -T6 * 0.35, T6 * 0.4), 'brass', { seg: 6 }),
      lathe([[0, T6 * 0.4], [T6 * 0.42, T6 * 0.4], [T6 * 0.42, T6 * 1.0], [0, T6 * 1.0]], 'brass', { seg: 14 }),
      lathe(hexProf(I(5 / 8), T6 * 1.0, T6 * 1.35), 'brass', { seg: 6 }),
      lathe([[0, T6 * 1.35], [T6 * 0.48, T6 * 1.35], [T6 * 0.48, T6 * 1.9], [T6 * 0.3, T6 * 2.05], [0, T6 * 2.05]], 'brass', { seg: 14 }),
    ], 'brass')), t11, NZ, X), [0, 0, -0.26]);
  }

  // ---------------------------------------------------------------- 19, 13, 20, 8 — té de sortie
  P('19', O(runTee(S, 20), g.c19b, Y, NX), [0, 0.1, 0]);
  P('13', O(ACC.straight(S, { a: 20, b: 20 }), add(g.c19b, NX, g.a), NX, Y), [-0.1, 0.1, 0]);
  P('20', O(ACC.hexBushing(S, 20, 8), [0, g.top19b, 0], Y, X), [0, 0.16, 0]);
  const hh20 = Math.max(I(0.25), r20 * 0.45);
  P('8', O(ACC.elbow(S, { a: 8, b: 6 }), [0, g.top19b + hh20, 0], Y, X), [0, 0.2, 0]);

  // ---------------------------------------------------------------- 21, 2 — mamelon, clapet
  P('21', O(ACC.nipple(S, 20, L21, 'darkSteel', { sch: 80 }), g.p21, NY, X), [0.08, -0.04, 0]);
  P('2', O(checkValve(S, 20, LC), g.cv, Y, X), [0.1, -0.1, 0]);

  // ---------------------------------------------------------------- 19, 7, 18, 14, 5, 9 — té d'arrivée
  P('19', O(runTee(S, 20), g.c19a, NY, X), [0, -0.16, 0]);
  P('7', O(ACC.elbow(S, { a: 20, b: 20, angle: 45 }), [0, g.bot19a, 0], NY, NZ), [0, -0.22, 0]);
  P('18', O(ACC.hexBushing(S, 20, 12), g.br19a, X, Y), [0.08, -0.16, 0]);
  {
    const hh18 = Math.max(I(0.25), r20 * 0.45);
    const se = streetElbow(S, 12).userData;
    const c14 = [g.br19a[0] + hh18 - E12 + se.male, g.c19a[1], 0];
    // Coude 14 : branche mâle dans la réduction (vers −X), branche femelle vers le haut.
    P('14', O(streetElbow(S, 12), c14, X, Y), [0.14, -0.14, 0]);
    // 5 — soupape de mise à vide : queue mâle 3/4 dans le coude, corps laiton, sortie latérale, vis de réglage à poignée en T.
    const yb = c14[1] + se.a; // face femelle du coude
    const r12 = pipeR(12);
    const prof = [[0, -E12], [r12 * 0.95, -E12], [r12, 0], [0, 0]];
    const body5 = merged([
      lathe(prof, 'brass', { seg: 16 }),
      lathe(hexProf(I(1.375), 0, 0.016), 'brass', { seg: 6 }),
      lathe([[0, 0.016], [0.017, 0.016], [0.017, 0.07], [0.012, 0.078], [0, 0.078]], 'brass', { seg: 24 }),
      lathe(hexProf(I(1.0), 0.078, 0.09), 'brass', { seg: 6 }),
      at(cyl(I(0.6), 0.016, 'brass', { axis: 'x', seg: 16 }), [0.022, 0.042, 0]),
    ], 'brass');
    const screw = merged([
      cyl(0.0045, 0.05, 'steel', { seg: 12, pos: [0, 0.112, 0] }),
      S.nut(I(0.5), 0.006, 'steel', { pos: [0, 0.094, 0] }),
      cyl(0.004, 0.07, 'steel', { axis: 'z', seg: 12, pos: [0, 0.137, 0] }),
      at(S.ball(0.0055, 'steel'), [0, 0.137, 0.035]), at(S.ball(0.0055, 'steel'), [0, 0.137, -0.035]),
    ], 'steel');
    P('5', at(group(body5, screw), [c14[0], yb, 0]), [0.18, -0.06, 0]);
    // 9 — coude 3/4 NPT → JIC -06 dans la sortie latérale, branche vers le bas.
    P('9', O(ACC.elbow(S, { a: 12, b: 6 }), [c14[0] + 0.03, yb + 0.042, 0], X, NY), [0.24, -0.06, 0]);
  }

  // ---------------------------------------------------------------- ligne d'eau : 6, 10, 16, 17, 15, 4, 12
  const o = g.off;
  P('6', at(api.sub('P464'), o), [0, 0, -0.12]);
  P('10', O(ACC.elbow(S, { a: 16, b: 16 }), [o[0], o[1] + SV.port, o[2]], Y, X), [0, 0.1, -0.12]);
  P('16', O(hexNipple(S, 16), g.c16, NY, X), [0, -0.06, -0.12]);
  P('17', O(ACC.hexBushing(S, 16, 8), [o[0], g.p17, o[2]], NY, X), [0, -0.12, -0.12]);
  P('15', O(hexNipple(S, 8), [o[0], g.c15, o[2]], NY, X), [0, -0.15, -0.12]);
  {
    // 4 — pointeau 1/2 po : corps laiton en ligne, chapeau latéral (+Z), presse-étoupe, volant étoile.
    const { top, L } = g.nv, yc = top - L / 2, r8 = pipeR(8);
    const hp = (y0, y1) => lathe([[r8 * 0.98, y0], ...hexProf(I(1.0), y0, y1).slice(1, -1), [r8 * 0.98, y1], [r8 * 0.98, y0]], 'brass', { seg: 6 });
    const body = merged([
      hp(-L / 2, -L / 2 + 0.016), hp(L / 2 - 0.016, L / 2),
      box(0.03, L - 0.03, 0.03, 'brass', { r: 0.004 }),
      cyl(0.011, 0.03, 'brass', { axis: 'z', seg: 18, pos: [0, 0, 0.028] }),
      at(S.nut(I(0.75), 0.01, 'brass', { axis: 'z' }), [0, 0, 0.046]),
    ], 'brass');
    const stem = cyl(0.0035, 0.03, 'steel', { axis: 'z', seg: 10, pos: [0, 0, 0.062] });
    const lobes = [lathe([[0, -0.006], [0.01, -0.006], [0.01, 0.006], [0, 0.006]], 'black', { seg: 16 })];
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      lobes.push(at(box(0.026, 0.01, 0.011, 'black', { r: 0.004 }), [Math.cos(a) * 0.016, 0, Math.sin(a) * 0.016], [0, -a, 0]));
    }
    const wheel = at(group(merged(lobes, 'black')), [0, 0, 0.075], [Math.PI / 2, 0, 0]);
    P('4', at(group(body, stem, wheel), [o[0], yc, o[2]]), [0, -0.2, -0.12]);
    const a12 = ACC.straight(S, { a: 8, b: 8 });
    P('12', O(a12, [o[0], top - L, o[2]], NY, X), [0, -0.25, -0.12]);
  }

  void Z; void E16;
  return { view: { dir: [0.9, 0.5, 1.0] } };
}

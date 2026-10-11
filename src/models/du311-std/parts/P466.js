// P466 — Refroidisseur final installé CX033894 « ASSY, AFTERCOOLER, DU311 »
// (page 466), repère 14 de P430. L'échangeur et sa platine (P468, 5) et la
// tuyauterie de ses quatre piquages 2 NPT (vue de la page 466) :
//   · F1 entrée d'air (en haut à droite) : adaptateur à bride 2 NPTF → 2 po
//     code 61 (1), qui reçoit la tête à bride du flexible inox venant du
//     collecteur de refoulement (P430 rep. 1) ;
//   · F4 sortie d'air (en haut à gauche) : té femelle 2 po (15) vissé par sa
//     branche ; côté gauche, mamelon court (16), coude femelle 2 po (14)
//     vers le haut, mamelon (16), clapet anti-retour à ressort 2 po (2,
//     flèche vers le haut) et coude 90° MNPT 2 po → JIC -32 (9) vers l'avant
//     (départ de l'air de forage, P430 rep. 3) ; côté droit, mamelon (16),
//     coude (14) vers le bas, adaptateur droit MNPT 2 po → JIC -24 (11) et
//     réduction JIC à écrou tournant -24 → -20 (7) : piquage de la
//     dérivation P462 ;
//   · F3 entrée d'eau (en bas à gauche) : manchon réducteur 2 × 1 NPT (4) et
//     coude 90° MNPT 1 po → JIC -16 (8) tourné vers le bas ;
//   · F2 sortie d'eau (en bas à droite) : manchon réducteur (4), coude
//     FNPT-MNPT 1 po (12) vers l'extérieur, té de passage 1 po (13) :
//     adaptateur droit MNPT → JIC -16 (10) sur la branche basse, réduction
//     six-pans 1 × 1/2 (3) et sonde de température −18 à 260 °C (6) au bout.
// Repère : celui de P468 (origine au centre de la face avant de la platine,
// X selon l'échangeur, F1 / F2 vers +X, Y haut, +Z côté piquages).
// Encombrement ≈ 0.75 (X) × 0.52 (Y) × 0.42 (Z) m. Cotes : raccords NPT et
// JIC de la liste (cotes normalisées) ; disposition d'après la page 466.
import { ACC, I, ENG, streetElbow, runTee, bellReducer, jicReducer, checkValve, tempTransducer, hexProf, add } from './_rearb.js';
import { AC } from './P468.js';

const E2 = ENG(32), E1 = ENG(16);
const L16 = I(2.625); // mamelon court 2 po

/** Points de raccordement (repère de P466), pour P430 : face de la bride F1, bouts des cônes. */
export function acPorts(S) {
  const g = geom(S);
  return { f1: g.f1, out9: g.out9, out7: g.out7, out8: g.out8, out10: g.out10 };
}

// Géométrie des chaînes de raccords (positions et orientations).
function geom(S) {
  const [x4, y4] = AC.ports.F4, [x3, y3] = AC.ports.F3, [x2, y2] = AC.ports.F2, [x1, y1] = AC.ports.F1;
  const zP = AC.zP;
  const A15 = ACC.pipeTee(S, 32).userData.a, A14 = ACC.pipeElbow(S, 32).userData.a;
  const g = {};
  // F1 : adaptateur à bride (corps taraudé de z0 à z0 + 0.04, bride de 0.022).
  g.z1 = zP - E2;
  g.f1 = { pos: [x1, y1, g.z1 + 0.064], dir: [0, 0, 1] };
  // F4 : té par sa branche (branche −Z), passage selon X.
  g.c15 = [x4, y4, zP - E2 + A15];
  // Côté −X : mamelon, coude vers le haut, mamelon, clapet, coude -32.
  g.n16a = [x4 - A15 + E2, y4, g.c15[2]];
  g.c14a = [g.n16a[0] - L16 + E2 - A14, y4, g.c15[2]];
  g.n16b = [g.c14a[0], y4 + A14 - E2, g.c15[2]];
  const Lcv = 0.13;
  g.cv = { pos: [g.c14a[0], g.n16b[1] + L16 - E2 + Lcv / 2, g.c15[2]], L: Lcv };
  g.p9 = [g.c14a[0], g.cv.pos[1] + Lcv / 2, g.c15[2]];
  const e9 = ACC.elbow(S, { a: 32, b: 32 }).userData.out;
  g.out9 = { pos: [g.p9[0], g.p9[1] + e9[1], g.p9[2] - e9[0]], dir: [0, 0, -1] };
  // Côté +X : mamelon, coude vers le bas, adaptateur -24, réduction -24 → -20.
  g.n16c = [x4 + A15 - E2, y4, g.c15[2]];
  g.c14b = [g.n16c[0] + L16 - E2 + A14, y4, g.c15[2]];
  g.p11 = [g.c14b[0], y4 - A14, g.c15[2]];
  const t11 = ACC.straight(S, { a: 32, b: 24 }).userData.tip;
  g.t11 = [g.p11[0], g.p11[1] - t11, g.p11[2]];
  const t7 = jicReducer(S, 24, 20).userData.tip;
  g.out7 = { pos: [g.t11[0], g.t11[1] - t7, g.t11[2]], dir: [0, -1, 0] };
  // F3 : réducteur, coude -16 vers le bas.
  const Lr = bellReducer(S, 32, 16).userData.L;
  g.r4 = [[x3, y3, zP - E2], [x2, y2, zP - E2]];
  g.p8 = [x3, y3, zP - E2 + Lr];
  const e8 = ACC.elbow(S, { a: 16, b: 16 }).userData.out;
  g.out8 = { pos: [x3, y3 - e8[0], g.p8[2] + e8[1]], dir: [0, -1, 0] };
  // F2 : réducteur, coude 12 vers +X, té 13, réduction 3 + sonde 6 vers +X, adaptateur 10 vers le bas.
  const se = streetElbow(S, 16).userData, rt = runTee(S, 16).userData;
  g.c12 = [x2, y2, zP - E2 + Lr - E1 + se.male];
  g.c13 = [x2 + se.a - E1 + rt.male, y2, g.c12[2]];
  g.p3 = [g.c13[0] + rt.a, y2, g.c12[2]];
  g.p10 = [g.c13[0], y2 - rt.a, g.c12[2]];
  const t10 = ACC.straight(S, { a: 16, b: 16 }).userData.tip;
  g.out10 = { pos: [g.p10[0], g.p10[1] - t10, g.p10[2]], dir: [0, -1, 0] };
  return g;
}

export default function P466(api) {
  const { THREE, S } = api;
  const { lathe, box, cyl, torus, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);
  const g = geom(S);
  const X = [1, 0, 0], NX = [-1, 0, 0], Y = [0, 1, 0], NY = [0, -1, 0], Z = [0, 0, 1], NZ = [0, 0, -1];

  // ---------------------------------------------------------------- 5 — échangeur et platine
  P('5', api.sub('P468'), [0, 0, -0.1]);

  // ---------------------------------------------------------------- 1 — adaptateur à bride F1
  {
    const [x, y] = AC.ports.F1;
    const z0 = g.z1, r2 = ACC.pipeOD(32) / 2;
    const body = lathe([[r2 * 0.98, 0], ...hexProf(I(3.0), 0, 0.03).slice(1, -1), [r2 * 1.3, 0.03], [r2 * 1.3, 0.042], [r2 * 0.98, 0.042], [r2 * 0.98, 0]], 'zinc', { seg: 6 });
    // Bride code 61 2 po : entraxes 3.062 × 1.688 po, quatre taraudages 1/2-13.
    const fl = S.extrude([[-0.055, -0.037], [0.055, -0.037], [0.055, 0.037], [-0.055, 0.037]], 0.022, 'zinc', {
      holes: [[0, 0, I(1.0)], ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => [sx * I(1.531), sy * I(0.844), I(0.21)])],
    });
    fl.position.z = 0.042 + 0.011;
    P('1', at(group(merged([body.children ? at(group(body), [0, 0, 0], [Math.PI / 2, 0, 0]) : body, fl], 'zinc'),
      torus(I(1.15), I(0.05), 'rubber', { axis: 'z', pos: [0, 0, 0.0645] })), [x, y, z0]), [0, 0, 0.14]);
  }

  // ---------------------------------------------------------------- F4 : 15, 16, 14, 2, 9, 11, 7
  P('15', O(ACC.pipeTee(S, 32), g.c15, X, NZ), [0, 0.05, 0.2]);
  P('16', O(ACC.nipple(S, 32, L16, 'darkSteel', { sch: 80 }), g.n16a, NX, Y), [-0.06, 0.05, 0.2]);
  P('14', O(ACC.pipeElbow(S, 32), g.c14a, NX, Y), [-0.1, 0.06, 0.2]);
  P('16', O(ACC.nipple(S, 32, L16, 'darkSteel', { sch: 80 }), g.n16b, Y, X), [-0.1, 0.1, 0.2]);
  P('2', O(checkValve(S, 32, g.cv.L, { mat: 'brass' }), g.cv.pos, Y, X), [-0.1, 0.16, 0.2]);
  P('9', O(ACC.elbow(S, { a: 32, b: 32 }), g.p9, Y, NZ), [-0.1, 0.22, 0.2]);
  P('16', O(ACC.nipple(S, 32, L16, 'darkSteel', { sch: 80 }), g.n16c, X, Y), [0.06, 0.05, 0.2]);
  P('14', O(ACC.pipeElbow(S, 32), g.c14b, X, NY), [0.1, 0.0, 0.2]);
  P('11', O(ACC.straight(S, { a: 32, b: 24 }), g.p11, NY, X), [0.1, -0.06, 0.2]);
  P('7', O(jicReducer(S, 24, 20), g.t11, NY, X), [0.1, -0.1, 0.2]);

  // ---------------------------------------------------------------- F3 : 4, 8 ; F2 : 4, 12, 13, 3, 6, 10
  P('4', O(bellReducer(S, 32, 16), g.r4[0], Z, X), [0, -0.03, 0.14]);
  P('8', O(ACC.elbow(S, { a: 16, b: 16 }), g.p8, Z, NY), [0, -0.08, 0.2]);
  P('4', O(bellReducer(S, 32, 16), g.r4[1], Z, X), [0, -0.03, 0.14]);
  P('12', O(streetElbow(S, 16), g.c12, Z, X), [0.02, -0.04, 0.2]);
  P('13', O(runTee(S, 16), g.c13, X, NY), [0.06, -0.04, 0.2]);
  P('3', O(ACC.hexBushing(S, 16, 8), g.p3, X, Y), [0.12, -0.04, 0.2]);
  const hh3 = Math.max(I(0.25), (ACC.pipeOD(16) / 2) * 0.45);
  P('6', O(tempTransducer(S), add(g.p3, X, hh3), X, NY), [0.2, -0.04, 0.2]);
  P('10', O(ACC.straight(S, { a: 16, b: 16 }), g.p10, NY, X), [0.06, -0.1, 0.2]);

  void THREE; void box; void cyl; void Z;
  return { view: { dir: [0.9, 0.5, 1.1] } };
}

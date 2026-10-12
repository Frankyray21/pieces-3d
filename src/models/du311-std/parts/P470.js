// P470 — Commande du compresseur CX033898 « ASSY, COMP. CONTROL, DU311 »
// (page 470), repère 15 de P430 : montée contre la face intérieure du flanc
// droit du châssis du pont, sous le plancher, à l'avant (vue de situation de
// la page 470). De gauche à droite sur la vue :
//   · bloc des capteurs (6, barre usinée vissée au flanc) : deux coudes ORB
//     -04 → JIC -06 (15) en façade, tés tournants (10) et capteurs de
//     pression 0-200 psi (P384, 5) suspendus dessous ;
//   · soupape pilote de mise à vide (4, CP48001-AUX) verticale, chapeau de
//     réglage en haut : coude de tuyauterie mâle 1/4 po (16) vers le sélecteur
//     de circuit (1) qui porte un coude 1/4 NPT → JIC -06 (11) et, dessous, un
//     adaptateur droit (13) coiffé d'un té tournant (10) ; sous la soupape,
//     adaptateur droit 1/2 NPT → JIC -06 (14) et coude à écrou tournant (9) ;
//   · vanne de décharge en marche (2, CP17057) : coude 1/2 NPT → JIC -06 (12)
//     à l'entrée, mamelon six-pans 3/4 × 1/2 (17) et silencieux (3) à la
//     sortie ; sous son pilote, té de passage 1/4 po (18) avec adaptateur
//     droit (13) et coude (11) ;
//   · électrovanne 3 voies 24 V CC (7, CX027465) : coudes 1/4 NPT → JIC -06
//     (11) sur deux orifices, té de branche à écrou tournant (8) sous l'un.
// Repère : origine au bout gauche de la barre 6, sur son axe, à la face
// d'appui (plan z = 0, flanc du châssis derrière) ; X vers la droite de la
// vue de la page 470, Y vers le haut, +Z vers l'observateur (intérieur du
// châssis). Capteurs P384 : repère TVK P394 (six-pans en haut, y = 0).
// Encombrement ≈ 0.66 (X) × 0.40 (Y) × 0.12 (Z) m. Cotes : raccords de la
// liste ; appareils aux proportions de la page 470 (silencieux Ø 3 1/2 po).
import { ACC, I, ENG, hexNipple, maleElbow, runTee, pipeR, hexProf, add } from './_rearb.js';
import { orbElbow } from '../../du311/parts/_chassis.js';

const E4 = ENG(4), E8 = ENG(8), E12 = ENG(12);
const BL = 0.27, BH = 0.04, BT = 0.025; // barre 6

export default function P470(api) {
  const { S } = api;
  const { box, cyl, lathe, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);
  const X = [1, 0, 0], NX = [-1, 0, 0], Y = [0, 1, 0], NY = [0, -1, 0], Z = [0, 0, 1];
  const r4 = pipeR(4), r8 = pipeR(8), r12 = pipeR(12);
  // Bossage taraudé (corps d'appareil) : six-pans de y0 à y1 le long de l'axe dir depuis c.
  const bossHex = (af, c, dir, L, mat = 'brass') => O(lathe(hexProf(af, 0, L), mat, { seg: 6 }), c, dir, dir[1] ? X : Y);

  // ---------------------------------------------------------------- 6 — bloc des capteurs
  {
    const holes = [0.075, 0.185].map((x) => S.ring(0.005, 0.0035, 0.0006, 'blackOxide', { axis: 'z', seg: 16, pos: [x, 0, BT + 0.0003] }));
    holes.push(S.ring(0.009, 0.0075, 0.0006, 'blackOxide', { axis: 'z', seg: 20, pos: [0.245, 0, BT + 0.0003] }));
    const screws = [0.075, 0.185].map((x) => at(S.bolt(I(0.25), I(1.25), 'zinc', { axis: 'z', head: 'socket' }), [x, 0, BT]));
    P('6', group(box(BL, BH, BT, 'castAlu', { r: 0.0015, pos: [BL / 2, 0, BT / 2] }), merged(holes, 'blackOxide'), merged(screws, 'zinc')), [0, 0, 0.05]);
  }
  // 15, 10, 5 — deux voies de capteur.
  for (const x of [0.025, 0.13]) {
    const el = orbElbow(api, 4, 6);
    P('15', O(el.obj, [x, -0.004, BT], Z, X), [0, 0, 0.08]);
    // orbElbow : sortie selon +Z local → ici vers −Y ; bout du cône.
    const tip = [x, -0.004 - el.out[2], BT + el.out[1]];
    const tee = ACC.swivelTee(S, 6);
    P('10', O(tee, tip, NY, X), [0, -0.04, 0.08]);
    const run = [tip[0], tip[1] - tee.userData.run[1], tip[2]];
    // P384 : face d'appui du six-pans sur le bout du té, embase vers +Y, corps vers −Y
    P('5', at(api.sub('P384'), run, [Math.PI, 0, 0]), [0, -0.1, 0.08]);
  }

  // ---------------------------------------------------------------- 4 — soupape pilote de mise à vide
  const X4 = 0.29, Z4 = 0.05;
  {
    const body = merged([
      lathe(hexProf(I(1.0), 0.03, 0.05), 'brass', { seg: 6 }),
      lathe([[0, 0.05], [0.015, 0.05], [0.015, 0.13], [0.018, 0.135], [0.018, 0.2], [0.015, 0.205], [0, 0.205]], 'brass', { seg: 24 }),
      lathe(hexProf(I(0.875), 0.205, 0.218), 'brass', { seg: 6 }),
      lathe([[0, 0.218], [0.012, 0.218], [0.012, 0.235], [0.008, 0.245], [0, 0.247]], 'brass', { seg: 20 }),
      at(cyl(0.008, 0.012, 'brass', { axis: 'x', seg: 16 }), [0.019, 0.17, 0]),
    ], 'brass');
    P('4', at(group(body), [X4, 0, Z4]), [0, 0.1, 0.06]);
  }
  // 16 — coude mâle 1/4 dans l'orifice latéral (+X), branche montante vers le sélecteur 1.
  {
    const me = maleElbow(S, 4).userData;
    const p16 = [X4 + 0.025, 0.17, Z4];
    const c16 = add(p16, X, -E4 + me.male);
    P('16', O(maleElbow(S, 4), c16, X, Y), [0.03, 0.1, 0.06]);
    // 1 — sélecteur de circuit : bloc laiton, entrées ±X, sortie dessous.
    const c1 = [c16[0], 0.17 + me.male - E4 + 0.0125, Z4];
    P('1', at(group(merged([box(0.036, 0.025, 0.025, 'brass', { r: 0.002 }), box(0.03, 0.002, 0.02, 'brass', { pos: [0, 0.0135, 0] })], 'brass')), c1), [0.04, 0.16, 0.06]);
    P('11', O(ACC.elbow(S, { a: 4, b: 6 }), [c1[0] + 0.018, c1[1], Z4], X, Y), [0.08, 0.16, 0.06]);
    P('13', O(ACC.straight(S, { a: 4, b: 6 }), [c1[0], c1[1] + 0.0125, Z4], Y, X), [0.04, 0.22, 0.06]);
    const t13 = c1[1] + 0.0125 + ACC.straight(S, { a: 4, b: 6 }).userData.tip;
    P('10', O(ACC.swivelTee(S, 6), [c1[0], t13, Z4], Y, X), [0.04, 0.26, 0.06]);
  }
  // 14, 9 — sous la soupape (orifice 1/2 NPT à y = 0.03).
  {
    const a14 = ACC.straight(S, { a: 8, b: 6 });
    P('14', O(a14, [X4, 0.03, Z4], NY, X), [0, -0.06, 0.06]);
    P('9', O(ACC.swivelTee(S, 6, { elbow: true }), [X4, 0.03 - a14.userData.tip, Z4], NY, Z), [0, -0.1, 0.06]);
  }

  // ---------------------------------------------------------------- 2 — vanne de décharge en marche ; 12, 17, 3 ; 18, 13, 11
  const X2 = 0.42, Y2 = 0.075;
  {
    const body = merged([
      box(0.05, 0.04, 0.036, 'brass', { r: 0.003, pos: [X2, Y2, Z4] }),
      bossHex(I(1.125), [X2 - 0.025, Y2, Z4], NX, 0.012), bossHex(I(1.125), [X2 + 0.025, Y2, Z4], X, 0.012),
      lathe(hexProf(I(1.25), 0, 0.016), 'brass', { seg: 6, pos: [X2, Y2 + 0.02, Z4] }),
      // Pilote : cylindre sous le corps, orifice 1/4 dessous.
      lathe([[0, Y2 - 0.075], [0.016, Y2 - 0.075], [0.016, Y2 - 0.02], [0, Y2 - 0.02]], 'brass', { seg: 20, pos: [X2, 0, Z4] }),
      // Flèche de sens coulée sur la face avant.
      box(0.026, 0.003, 0.002, 'brass', { pos: [X2 - 0.004, Y2, Z4 + 0.019] }),
      at(cyl(0.005, 0.002, 'brass', { r2: 0.0002, seg: 3, axis: 'z' }), [X2 + 0.012, Y2, Z4 + 0.019], [0, 0, -Math.PI / 2]),
    ], 'brass');
    P('2', group(body), [0, 0, 0.1]);
    P('12', O(ACC.elbow(S, { a: 8, b: 6 }), [X2 - 0.037, Y2, Z4], NX, Y), [-0.04, 0, 0.1]);
    // 17 — mamelon 3/4 × 1/2 : 1/2 dans la vanne, 3/4 dans le silencieux.
    const hn = hexNipple(S, 12, 8).userData;
    const c17 = [X2 + 0.037 - E8 + hn.yb, Y2, Z4];
    P('17', O(hexNipple(S, 12, 8), c17, NX, Y), [0.04, 0, 0.1]);
    // 3 — silencieux : bossage d'entrée 3/4 NPT, corps Ø 3 1/2 po à fonds sertis, embout de sortie.
    const xs = c17[0] + hn.ya - E12;
    const L3 = 0.17, R3 = I(1.75);
    const sil = merged([
      lathe([[r12 * 0.98, 0], [r12 * 1.35, 0], [r12 * 1.35, 0.016], [r12 * 0.98, 0.016]], 'steel', { axis: 'x', seg: 18 }),
      lathe([[0, 0.016], [R3 * 0.9, 0.016], [R3 + 0.003, 0.02], [R3 + 0.003, 0.026], [R3, 0.028], [R3, 0.016 + L3 - 0.012], [R3 + 0.003, 0.016 + L3 - 0.01], [R3 + 0.003, 0.016 + L3 - 0.004], [R3 * 0.9, 0.016 + L3], [0, 0.016 + L3]], 'black', { axis: 'x', seg: 36 }),
      lathe([[0, 0.016 + L3], [0.008, 0.016 + L3], [0.008, 0.03 + L3], [0, 0.03 + L3]], 'steel', { axis: 'x', seg: 14 }),
    ], 'black');
    P('3', at(group(sil), [xs, Y2, Z4]), [0.12, 0, 0.1]);
    // 18, 13, 11 — sous le pilote.
    const rt = runTee(S, 4).userData;
    const c18 = [X2, Y2 - 0.075 + E4 - rt.male, Z4];
    P('18', O(runTee(S, 4), c18, NY, X), [0, -0.08, 0.1]);
    P('13', O(ACC.straight(S, { a: 4, b: 6 }), add(c18, X, rt.a), X, Y), [0.04, -0.08, 0.1]);
    P('11', O(ACC.elbow(S, { a: 4, b: 6 }), add(c18, NY, rt.a), NY, X), [0, -0.12, 0.1]);
  }

  // ---------------------------------------------------------------- 7 — électrovanne 3 voies ; 11, 8
  const X7 = 0.56, Y7 = 0.24;
  {
    const body = merged([
      box(0.034, 0.05, 0.03, 'castAlu', { r: 0.003, pos: [X7, Y7, Z4] }),
      box(0.034, 0.008, 0.044, 'castAlu', { r: 0.002, pos: [X7, Y7 + 0.029, Z4 - 0.007] }),
    ], 'castAlu');
    const coilB = merged([
      box(0.036, 0.04, 0.034, 'plastic', { r: 0.003, pos: [X7, Y7 + 0.002, Z4 + 0.035] }),
      box(0.026, 0.028, 0.012, 'plastic', { r: 0.002, pos: [X7, Y7 + 0.002, Z4 + 0.058] }),
      lathe([[0, 0], [0.006, 0], [0.006, 0.02], [0, 0.02]], 'plastic', { seg: 12, pos: [X7, Y7 - 0.038, Z4 + 0.035] }),
    ], 'plastic');
    const nutC = S.nut(0.016, 0.006, 'zinc', { axis: 'z', pos: [X7, Y7 + 0.002, Z4 + 0.055] });
    P('7', group(body, coilB, nutC), [0, 0.06, 0.1]);
    P('11', O(ACC.elbow(S, { a: 4, b: 6 }), [X7 - 0.017, Y7 - 0.012, Z4], NX, NY), [-0.04, 0.06, 0.1]);
    const e11 = ACC.elbow(S, { a: 4, b: 6 });
    P('11', O(e11, [X7 + 0.017, Y7 - 0.012, Z4], X, NY), [0.04, 0.06, 0.1]);
    const tip = [X7 + 0.017 + e11.userData.out[1], Y7 - 0.012 - e11.userData.out[0], Z4];
    P('8', O(ACC.swivelTee(S, 6), tip, NY, X), [0.04, 0.0, 0.1]);
  }

  void r4; void r8; void E12;
  return { view: { dir: [0.3, 0.4, 1.0] } };
}

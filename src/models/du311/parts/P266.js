// P266 — Trousse d'échappement CX011553 rév. 3 (page 266) : « EXHAUST KIT,
// DEUTZ D914L04 ENGINE », repère 11 de P256. Depuis la sortie arrière du
// collecteur (P260 rep. 4) : adaptateur droit 1,875 → 2 po (5), épurateur
// catalytique (1), tuyau 2 po alu-revêtu (6), coude (2) qui remonte en
// cheminée, chapeau à clapet (4), tenue par la patte (7) et ses deux vis
// 5/16 × 2 (8, rondelles Grower 9) ; cinq colliers à étrier (3) aux jonctions.
// Repère : repère moteur ENG (_moteur_surpresseur.js) — trousse posée sur le
// moteur, insérée à l'origine par P256 : origine sur l'axe du vilebrequin au
// plan SAE du carter de volant, +X vers la soufflante, Y haut, +Z côté
// injection ; la ligne part de la bride de sortie du collecteur (x =
// ENG.exhaust.outX, y = ENG.exhaust.y, z = ENG.exhaust.z) vers −X, puis le
// coude remonte. Encombrement ≈ 0.68 (X, de −0.6 à 0.08) × 0.4 (Y, de 0.27 à
// 0.67) × 0.2 (Z) m.
// Cotes : diamètres de la liste (1,875 et 2 po, tôle 16 ga = 1,5 mm) ;
// épurateur Ø 8 po × 11 po, coude R 4 po, chapeau à clapet d'après les
// proportions de la page 266 ; vis 5/16-18 × 2 po.
import { ENG, IN } from './_moteur_surpresseur.js';

export default function P266(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, shell, tube, bolt, nut, washer, plate, merged, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const EX = ENG.exhaust;
  const Y = EX.y, Z = EX.z, X0 = EX.outX;
  const R2 = IN; // 2 po de Ø extérieur
  const T = 0.0015; // 16 ga

  // 5 — adaptateur droit 1,875 po → 2 po : emboîté sur la sortie du collecteur.
  const XA1 = X0 - 0.1;
  P('5', lathe([
    [0.938 * IN - T, X0], [0.938 * IN, X0], [0.938 * IN, X0 - 0.045], [R2, X0 - 0.055], [R2, XA1], [R2 - T, XA1], [R2 - T, X0 - 0.055], [0.938 * IN - T, X0 - 0.045],
  ].map(([r, x]) => [r, -x]), 'zinc', { axis: '-x', seg: 32, pos: [0, Y, Z] }), [0.06, 0, 0]);

  // 1 — épurateur : enveloppe Ø 8 po, cônes d'entrée et de sortie, tubulures
  // 2 po, deux pattes à goujons dessous, bouchon de prise de contre-pression.
  const XP0 = XA1 + 0.07, L1 = 0.28, RP = 4 * IN;
  const px = (x) => -x;
  const pur = lathe([
    [R2 - T, px(XP0)], [R2 + 0.002, px(XP0)], [R2 + 0.002, px(XP0 - 0.06)], [RP * 0.55, px(XP0 - 0.07)],
    [RP - 0.006, px(XP0 - 0.1)], [RP, px(XP0 - 0.106)], [RP, px(XP0 - 0.106 - L1 * 0.55)],
    [RP - 0.006, px(XP0 - 0.112 - L1 * 0.55)], [RP * 0.55, px(XP0 - 0.142 - L1 * 0.55)], [R2 + 0.002, px(XP0 - 0.152 - L1 * 0.55)],
    [R2 + 0.002, px(XP0 - 0.21 - L1 * 0.55)], [R2 - T, px(XP0 - 0.21 - L1 * 0.55)],
  ], 'zinc', { axis: '-x', seg: 48, pos: [0, Y, Z] });
  const XP1 = XP0 - 0.21 - L1 * 0.55;
  const bands = [XP0 - 0.106 - 0.004, XP0 - 0.106 - L1 * 0.55 + 0.004].map((x) => at(cyl(RP + 0.0015, 0.006, 'zinc', { axis: 'x', seg: 48 }), [x, Y, Z]));
  const pXm = XP0 - 0.106 - L1 * 0.275;
  const feet = [-1, 1].map((s) => group(
    at(box(0.03, 0.03, 0.06, 'zinc', { r: 0.003 }), [pXm + s * 0.05, Y - RP - 0.008, Z]),
    at(cyl(0.005, 0.04, 'steel', { seg: 10 }), [pXm + s * 0.05, Y - RP - 0.04, Z]),
  ));
  const plug = at(bolt(0.012, 0.01, 'steel', { axis: 'z' }), [pXm, Y, Z + RP + 0.004]);
  P('1', group(pur, merged(bands, 'zinc'), merged(feet, 'zinc'), plug), [0, -0.1, -0.15]);

  // 6 — tuyau 2 po, tôle 16 ga alu-revêtue, emboîté dans la sortie de
  // l'épurateur et dans le coude.
  const X6a = XP1 + 0.05, X6b = XP1 - 0.16;
  P('6', at(shell(R2, R2 - T, X6a - X6b, 'zinc', { axis: 'x', seg: 32 }), [(X6a + X6b) / 2, Y, Z]), [-0.08, 0, 0]);

  // 2 — coude 90° R 4 po : du tuyau 6 vers le haut, en cheminée.
  const RB = 4 * IN;
  const XE = X6b + 0.04; // départ du coude (emboîté sur 40 mm)
  const XC = XE - 0.05 - RB; // axe de la cheminée
  const elbowPts = [[XE, Y, Z], [XE - 0.05, Y, Z]];
  for (let i = 1; i <= 12; i++) {
    const a = (i / 12) * (Math.PI / 2);
    elbowPts.push([XE - 0.05 - RB * Math.sin(a), Y + RB * (1 - Math.cos(a)), Z]);
  }
  const YT = Y + RB + 0.09;
  elbowPts.push([XC, YT, Z]);
  const elbow = tube(elbowPts, R2 + 0.0015, 'zinc', { sharp: true, seg: 64, radial: 24 });
  P('2', elbow, [-0.12, 0.05, 0]);

  // 4 — chapeau de cheminée à clapet : manchon, charnière, clapet bombé.
  const YC = YT - 0.03;
  const capSleeve = at(shell(R2 + 0.003, R2 + 0.0015, 0.08, 'zinc', { seg: 32 }), [XC, YC + 0.04, Z]);
  const flap = lathe([[0, 0], [R2 + 0.008, 0], [R2 + 0.008, 0.004], [R2 * 0.6, 0.012], [0, 0.014]], 'zinc', { seg: 32 });
  const hinge = at(cyl(0.004, 0.03, 'steel', { axis: 'z', seg: 10 }), [XC - R2 - 0.006, YC + 0.082, Z]);
  const flapG = at(group(at(flap, [R2 + 0.006, 0, 0])), [XC - R2 - 0.006, YC + 0.082, Z], [0, 0, 0.18]);
  const counter = at(box(0.012, 0.02, 0.016, 'zinc', { r: 0.002 }), [XC - R2 - 0.014, YC + 0.074, Z]);
  P('4', group(capSleeve, flapG, hinge, counter), [0, 0.12, 0]);

  // 3 — colliers à étrier (U-bolt) : étrier fileté, selle emboutie, deux écrous.
  const clamp = (c, axis, rr, rot = 0) => {
    const ub = new THREE.Group();
    const r = rr + 0.002, d = 0.008, leg = rr + 0.03;
    const half = [];
    for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; half.push([r * Math.cos(a), r * Math.sin(a), 0]); }
    const u = tube([[-r, leg, 0], ...half.reverse().map(([x, y]) => [x, -y, 0]).reverse(), [r, leg, 0]].map(([x, y]) => [x, y, 0]), d / 2, 'steel', { seg: 32, radial: 8 });
    // Étrier : jambes vers +Y (au-dessus du tube), arc dessous.
    const arcPts = [[-r, leg, 0]];
    for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; arcPts.push([r * Math.cos(a), r * Math.sin(a), 0]); }
    arcPts.push([r, leg, 0]);
    ub.add(tube(arcPts, d / 2, 'steel', { seg: 40, radial: 8 }));
    ub.add(at(box(2 * r + 0.03, 0.006, 0.022, 'zinc', { r: 0.002 }), [0, rr + 0.006, 0]));
    for (const s of [-1, 1]) {
      ub.add(at(nut(0.014, 0.008, 'zinc'), [s * r, rr + 0.013, 0]));
    }
    void u;
    const g = group(ub);
    if (axis === 'y') { ub.rotation.x = Math.PI / 2; }
    else ub.rotation.y = Math.PI / 2;
    g.rotation.set(rot, 0, 0);
    if (axis === 'y') g.rotation.set(0, rot, 0);
    g.position.set(...c);
    return g;
  };
  const clamps = [
    [[X0 - 0.025, Y, Z], 'x', 0.938 * IN + T, [0.04, 0.05, 0]],
    [[XP0 - 0.035, Y, Z], 'x', R2 + 0.002, [0.02, 0.06, 0]],
    [[XP1 + 0.025, Y, Z], 'x', R2 + 0.002, [-0.02, 0.06, 0]],
    [[XE - 0.02, Y, Z], 'x', R2 + 0.0015, [-0.04, 0.06, 0]],
    [[XC, YC + 0.015, Z], 'y', R2 + 0.003, [0, 0, 0.08]],
  ];
  for (const [c, axis, rr, e] of clamps) P('3', clamp(c, axis, rr), e);

  // 7 — patte de cheminée : collier plat autour du chapeau, languette percée
  // de deux trous vers +X ; 8 — vis 5/16 × 2 po, 9 — rondelles Grower.
  const YM = YC + 0.015;
  const strap = [];
  for (let i = 0; i <= 16; i++) {
    const a = -Math.PI / 2 + (i / 16) * Math.PI;
    strap.push([XC - Math.cos(a) * (R2 + 0.006), YM - 0.04, Z + Math.sin(a) * (R2 + 0.006)]);
  }
  const band = tube(strap, 0.0025, 'black', { seg: 24, radial: 6 });
  const tab = at(plate(0.07, 0.035, 0.005, 'black', { holes: [[0.0, -0.008, 0.0045], [0.024, -0.008, 0.0045]] }), [XC + 0.035, YM - 0.04, Z]);
  tab.rotation.x = Math.PI / 2;
  const tabs = [-1, 1].map((s) => at(box(0.03, 0.035, 0.004, 'black'), [XC + R2 + 0.016, YM - 0.04 + 0.0, Z + s * 0.004]));
  P('7', group(merged([tab, ...tabs], 'black'), band), [0.06, 0, -0.05]);
  const D8 = 0.3125 * IN;
  for (const dx of [0.035, 0.059]) {
    const c = [XC + dx, YM - 0.04 - 0.008 + 0.0175 - 0.0175, Z + 0.0025];
    P('9', at(washer(D8 * 0.95, D8 * 0.53, D8 * 0.25, 'zinc', { axis: 'z' }), [c[0], YM - 0.048, Z + 0.0025 + D8 * 0.125]), [0, 0, 0.05]);
    P('8', at(bolt(D8, 2 * IN, 'zinc', { axis: 'z' }), [c[0], YM - 0.048, Z + 0.0025 + D8 * 0.25]), [0, 0, 0.09]);
  }

  return { view: { dir: [-0.9, 0.6, -1.0] } };
}

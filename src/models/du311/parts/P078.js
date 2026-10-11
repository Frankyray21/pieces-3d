// P078 — Vérin de la pince de tige CM78807 rév. 1 (page 78) : « CYLINDER -
// Ø3 1/2" X 2 29/32" STROKE », alésage 3 1/2 po, course 2 29/32 po, pression
// de service 2550 psi (note 2). Vérin soudé compact, dessiné rentré en coupe
// A-A, avec une vue de côté et une isométrique :
// - corps soudé (5) : tube Ø 4 × 1/4 po soudé sur un fond (disque Ø 4 po)
//   prolongé par une chape à œil simple (rotule 3 et circlip 2 dans l'œil),
//   deux bossages d'orifice SAE -04 côté -X, fermés par des bouchons à
//   six-pans creux et joint torique (9, FA01280-04) ;
// - tête (6) emmanchée au ras du tube : deux trous de clé à ergot sur la face,
//   joint torique et bague anti-extrusion (11.2/11.3) dans la gorge
//   extérieure, joint de tige (11.4) et racleur (11.5) dans l'alésage (joints
//   de la trousse 11, dessinés : modélisés avec la tête) ;
// - tige (7) chromée Ø 1 1/4 po, deux queues filetées 7/8-14 UNF : en bas le
//   piston (8, joint de piston 11.6 et torique 11.1, modélisés avec lui) serré
//   par l'écrou frein (1) ; en haut l'embout réglable (4) vissé, bloqué par le
//   contre-écrou (10), rotule (3) et circlip (2) dans son œil.
// Repère : origine au centre de l'œil de fond (rotule), Y le long de l'axe du
// vérin vers la tige ; l'axe de l'œil de fond est selon X, comme les orifices
// (bossages et bouchons vers -X, côté coupé du dessin) ; Z en travers.
// L'œil de l'embout réglable est dessiné tourné d'un quart de tour (axe selon
// Z) ; option { rodEye: 'x' } : embout vissé avec son axe parallèle à celui
// du fond (montage de P074, deux axes verticaux).
// Vérin rentré : entraxe 12.23 po (0.311 m), sorti 15.14 po (0.385 m).
// Encombrement ≈ 0.090 (X, de -0.067 au bout des bouchons à +0.051) × 0.375
// (Y, de -0.028 à +0.347) × 0.102 (Z) m.
// Cotes : liste (alésage, course, filets 7/8-14) ; le reste relevé sur la
// coupe A-A à l'échelle de l'alésage (≈ 126 px/po sur l'agrandissement) :
// paroi 1/4 po, tige Ø 1 1/4, œils Ø 2.9 po × 1 1/4, rotules Ø 1.6 × 1 po.
import { L, u, along, hexNut } from './_avance_b.js';

// Cotes axiales (po), vérin rentré, depuis l'œil de fond.
const Y = {
  lugTip: -1.1, // bout arrondi de la chape de fond
  capBot: 1.35, // dessous du fond
  floor: 1.83, // face intérieure du fond (pied du tube)
  nutBot: 1.88,
  pistonBot: 2.35,
  pistonTop: 3.54, // épaulement de la tige
  headBot: 6.40, // dessous de la tête (= pistonTop + course - jeu)
  tubeTop: 8.11,
  rodShoulder: 8.60, // fin de la tige Ø 1 1/4, début de la queue 7/8
  jamBot: 8.63,
  endBot: 9.13, // pied de l'embout réglable
  endNeck: 10.74, // pied de l'œil de l'embout
  eye: 12.23, // axe de l'œil de l'embout
};
const STROKE = 2.906;
const BORE = 1.75, TUBE = 2.0, ROD = 0.625, TH = 0.4375; // rayons (po)
const EYE = { R: 1.45, w: 1.25, bore: 0.8 }; // œils : rayon extérieur, épaisseur, alésage de la rotule
const PORTS = [2.47, 6.68];
const BOSS = { r: 0.44, face: 2.64 }; // bossage d'orifice selon -X

export const CYL078 = {
  retracted: u(Y.eye), // entraxe des œils, vérin rentré
  stroke: u(STROKE),
  eyeW: u(EYE.w), // épaisseur des œils (selon leur axe)
  eyeR: u(EYE.R),
  pinR: u(0.5), // axe Ø 1 po dans les rotules
  tubeR: u(TUBE),
  portX: -u(BOSS.face),
  portY: PORTS.map(u),
};

export default function P078(api, opts = {}) {
  const { THREE, S } = api;
  const { extrude, weldRing, slotted, roundHole, torus, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const rodEyeX = opts.rodEye === 'x';

  // Œil plat (po) : profil dans le plan (a, y) — bloc de demi-largeur R
  // terminé par un demi-cercle centré en (0, yc), de yb (pied) au bout —
  // extrudé sur l'épaisseur w, percé de l'alésage de la rotule. Axe de l'œil
  // selon Z local ; à tourner ensuite.
  const eyeBlock = (yc, yb, mat, sign = 1) => {
    const n = 20, pts = [];
    pts.push([EYE.R, yb], [EYE.R, yc]);
    for (let i = 1; i < n; i++) {
      const a = (i / n) * Math.PI;
      pts.push([EYE.R * Math.cos(a), yc + sign * EYE.R * Math.sin(a)]);
    }
    pts.push([-EYE.R, yc], [-EYE.R, yb]);
    const p = sign > 0 ? pts : pts.reverse();
    return extrude(p.map(([a, y]) => [u(a), u(y)]), u(EYE.w), mat, { holes: [[0, u(yc), u(EYE.bore)]] });
  };

  // ================================================ 5 — corps soudé
  // Tube percé des deux orifices (-X), fond tourné, chape de fond (œil selon
  // X), bossages d'orifice, cordons de soudure.
  const portHoles = PORTS.flatMap((y) => roundHole(-Math.PI / 2, u(y), u(0.2), u(TUBE), { steps: 6 }));
  const tube = slotted(u(TUBE), u(BORE), u(Y.floor), u(Y.tubeTop), portHoles, 'grey', { seg: 48 });
  const cap = L(S, [[0, Y.capBot], [TUBE - 0.08, Y.capBot], [TUBE, Y.capBot + 0.08], [TUBE, Y.floor], [BORE, Y.floor], [BORE, Y.floor + 0.02], [0, Y.floor + 0.02]], 'grey', 48);
  // Chape de fond : œil plat, axe selon X (bloc tourné d'un quart de tour autour de Y)
  const lug = eyeBlock(0, Y.capBot + 0.05, 'grey', -1);
  lug.rotation.y = Math.PI / 2;
  const boss = (y) => L(S, [
    [0.2, 1.6], [BOSS.r, 1.6], [BOSS.r, BOSS.face - 0.04], [BOSS.r - 0.04, BOSS.face],
    [0.28, BOSS.face], [0.24, BOSS.face - 0.04], [0.22, BOSS.face - 0.06], [0.22, 1.9], [0.2, 1.88], [0.2, 1.6],
  ], 'grey', 24, { axis: '-x', pos: [0, u(y), 0] });
  const ww = u(EYE.w / 2 + 0.05), wz = u(EYE.R + 0.03);
  P('5', group(
    merged([tube, cap, lug, ...PORTS.map(boss)], 'grey'),
    weldRing(u(TUBE - 0.02), u(0.16), 'grey', { pos: [0, u(Y.floor), 0] }),
    S.weld([[-ww, u(Y.capBot - 0.04), -wz], [ww, u(Y.capBot - 0.04), -wz], [ww, u(Y.capBot - 0.04), wz], [-ww, u(Y.capBot - 0.04), wz]], u(0.16), 'grey', { closed: true }),
    ...PORTS.map((y) => weldRing(u(BOSS.r + 0.03), u(0.1), 'grey', { axis: 'x', pos: [-u(1.95), u(y), 0] })),
  ), [0, -0.03, 0]);

  // 9 — bouchons d'orifice SAE -04 à six-pans creux et joint torique
  for (const y of PORTS) {
    P('9', at(S.group(plug()), [-u(BOSS.face), u(y), 0], [0, 0, Math.PI / 2]), [-0.08, 0, 0]);
  }
  function plug() {
    const r = 0.2185, R = 0.31, h = 0.14, hx = 0.0945 / Math.cos(Math.PI / 6);
    return group(
      merged([
        L(S, [[hx, h * 0.35], [hx, h], [R - 0.02, h], [R, h - 0.02], [R, 0.02], [R - 0.02, 0], [0, 0], [0, h * 0.35]].reverse(), 'zinc', 20),
        L(S, [[0, h * 0.35], [hx, h * 0.35], [hx, h], [0, h]].reverse(), 'zinc', 6),
        L(S, [[0, -0.36], ...S.thread(r, -0.36, -0.08, { pitch: 0.05, maxTurns: 5 }), [r * 0.9, 0], [0, 0]], 'zinc', 12),
      ], 'zinc'),
      torus(u(0.235), u(0.035), 'rubber', { pos: [0, -u(0.04), 0] }),
    );
  }

  // ================================================ 6 — tête et ses joints
  // Corps tourné au Ø de l'alésage, gorge extérieure (torique + anti-extrusion)
  // près du haut, lamage du racleur, gorge du joint de tige ; deux trous de clé.
  const RG = ROD + 0.02;
  const head = L(S, [
    [RG, Y.headBot], [BORE - 0.12, Y.headBot], [BORE - 0.02, Y.headBot + 0.1], [BORE - 0.02, 7.45],
    [BORE - 0.17, 7.45], [BORE - 0.17, 7.75], [BORE - 0.02, 7.75], [BORE - 0.02, Y.tubeTop - 0.06],
    [BORE - 0.08, Y.tubeTop], [0.98, Y.tubeTop], [0.98, Y.tubeTop - 0.22], [RG, Y.tubeTop - 0.22],
    [RG, 7.55], [0.86, 7.55], [0.86, 7.15], [RG, 7.15], [RG, Y.headBot],
  ], 'grey', 48);
  // trous de clé à ergot Ø 1/4 sur la face (fond plat suggéré)
  const keys = [-1, 1].map((s) => L(S, [[0, Y.tubeTop - 0.25], [0.13, Y.tubeTop - 0.25], [0.13, Y.tubeTop + 0.002], [0, Y.tubeTop + 0.002]], 'darkSteel', 12, { pos: [0, 0, s * u(1.3)] }));
  P('6', group(
    head,
    merged(keys, 'darkSteel'),
    // 11.2 / 11.3 : torique et bague anti-extrusion dans la gorge
    torus(u(BORE - 0.1), u(0.07), 'rubber', { pos: [0, u(7.66), 0] }),
    L(S, [[BORE - 0.16, 7.46], [BORE - 0.03, 7.46], [BORE - 0.03, 7.53], [BORE - 0.16, 7.53], [BORE - 0.16, 7.46]], 'cream', 48),
    // 11.4 : joint de tige en U ; 11.5 : racleur à lèvre
    L(S, [[RG, 7.17], [0.84, 7.17], [0.84, 7.53], [RG, 7.53], [RG + 0.04, 7.35], [RG, 7.17]], 'blue', 32),
    L(S, [[RG, Y.tubeTop - 0.2], [0.96, Y.tubeTop - 0.2], [0.96, Y.tubeTop - 0.02], [0.8, Y.tubeTop + 0.06], [RG, Y.tubeTop + 0.04], [RG, Y.tubeTop - 0.2]], 'rubber', 32),
  ), [0, 0.13, 0]);

  // ================================================ 7 — tige chromée
  P('7', group(
    L(S, [[0, Y.pistonTop], [ROD - 0.05, Y.pistonTop], [ROD, Y.pistonTop + 0.05], [ROD, Y.rodShoulder - 0.05], [ROD - 0.05, Y.rodShoulder], [0, Y.rodShoulder]], 'chrome', 32),
    // queues filetées 7/8-14 (piston en bas, embout en haut)
    L(S, [[0, Y.nutBot - 0.05], ...S.thread(TH, Y.nutBot - 0.05, Y.pistonBot + 0.4, { pitch: 1 / 14, maxTurns: 9 }), [TH, Y.pistonTop], [0, Y.pistonTop]], 'steel', 16),
    L(S, [[0, Y.rodShoulder], [TH, Y.rodShoulder], ...S.thread(TH, Y.rodShoulder + 0.05, Y.endNeck - 0.05, { pitch: 1 / 14, maxTurns: 12, chamferBottom: false }), [TH - 0.06, Y.endNeck], [0, Y.endNeck]], 'steel', 16),
  ), [0.14, 0.2, 0]);

  // ================================================ 8 — piston et ses joints
  // Portées Ø 3 1/2, gorge du joint de piston, alésage 7/8, lamage de l'écrou
  // en bas et chanfrein du torique (11.1) en haut.
  const LAND = BORE - 0.02;
  P('8', group(
    L(S, [
      [TH + 0.02, 2.66], [0.62, 2.66], [0.62, Y.pistonBot], [LAND - 0.05, Y.pistonBot], [LAND, Y.pistonBot + 0.05],
      [LAND, 2.62], [BORE - 0.28, 2.62], [BORE - 0.28, 3.24], [LAND, 3.24], [LAND, Y.pistonTop - 0.05], [LAND - 0.05, Y.pistonTop],
      [0.56, Y.pistonTop], [0.5, Y.pistonTop - 0.06], [TH + 0.02, Y.pistonTop - 0.06], [TH + 0.02, 2.66],
    ], 'steel', 48),
    // 11.6 — joint de piston (élément noir et deux bagues d'appui)
    L(S, [[BORE - 0.27, 2.72], [BORE - 0.01, 2.72], [BORE - 0.01, 3.14], [BORE - 0.27, 3.14], [BORE - 0.27, 2.72]], 'rubber', 48),
    merged([
      L(S, [[BORE - 0.27, 2.63], [BORE - 0.01, 2.63], [BORE - 0.01, 2.71], [BORE - 0.27, 2.71], [BORE - 0.27, 2.63]], 'cream', 48),
      L(S, [[BORE - 0.27, 3.15], [BORE - 0.01, 3.15], [BORE - 0.01, 3.23], [BORE - 0.27, 3.23], [BORE - 0.27, 3.15]], 'cream', 48),
    ], 'cream'),
    // 11.1 — torique tige / piston
    torus(u(0.5), u(0.035), 'rubber', { pos: [0, u(Y.pistonTop - 0.04), 0] }),
  ), [0.14, 0.12, 0]);

  // 1 — écrou frein 7/8-14 (six-pans 1 5/16, collerette)
  P('1', at(group(
    hexNut(S, THREE, 0.875, { mat: 'zinc' }),
    L(S, [[0.45, 0.76], [0.6, 0.76], [0.6, 0.86], [0.45, 0.86], [0.45, 0.76]], 'zinc', 20),
  ), [0, u(Y.nutBot), 0]), [0.14, 0.04, 0]);

  // ================================================ 4 — embout réglable
  // Col Ø 1 1/2 taraudé 7/8-14, œil plat Ø 2.9 × 1 1/4 et petit trou
  // latéral (vis de blocage) sur le flanc de l'œil, comme sur la coupe.
  const neck = L(S, [[TH + 0.01, Y.endBot], [0.7, Y.endBot], [0.75, Y.endBot + 0.05], [0.75, Y.endNeck + 0.1], [TH + 0.01, Y.endNeck + 0.1], [TH + 0.01, Y.endBot]], 'grey', 32);
  const eye = eyeBlock(Y.eye, Y.endNeck, 'grey', 1);
  const sideHole = L(S, [[0, 0], [0.12, 0], [0.12, 0.04], [0, 0.04]], 'darkSteel', 12, { axis: 'x', pos: [u(EYE.R - 0.02), u(Y.eye), 0] });
  const endPart = group(merged([neck, eye], 'grey'), sideHole);
  const rodEndRot = rodEyeX ? Math.PI / 2 : 0;
  endPart.rotation.y = rodEndRot;
  P('4', endPart, [0.14, 0.3, 0]);

  // 10 — contre-écrou 7/8-14 (jam)
  P('10', at(hexNut(S, THREE, 0.875, { mat: 'zinc', jam: true }), [0, u(Y.jamBot), 0]), [0.14, 0.24, 0]);

  // ================================================ 3 — rotules, 2 — circlips
  // Fond : axe de l'œil selon X ; embout : selon Z (ou X, option rodEye).
  const eyes = [
    { pos: [0, 0, 0], dir: [1, 0, 0], e: [0, -0.04, 0], out: [0.12, 0, 0] },
    { pos: [0, u(Y.eye), 0], dir: rodEyeX ? [1, 0, 0] : [0, 0, 1], e: [0.14, 0.3, 0], out: rodEyeX ? [0.12, 0, 0] : [0, 0, 0.12] },
  ];
  for (const { pos, dir, e, out } of eyes) {
    P('3', along(THREE, S.group(sphericalBall()), dir, pos), [e[0] + out[0] * 0.6, e[1] + out[1] * 0.6, e[2] + out[2] * 0.6]);
    const cp = pos.map((v, i) => v + dir[i] * u(EYE.w / 2 - 0.08));
    P('2', along(THREE, circlipObj(), dir, cp), [e[0] + out[0], e[1] + out[1], e[2] + out[2]]);
  }
  // Rotule : bague extérieure à gorge de circlip, rotule chromée Ø 1 po.
  function sphericalBall() {
    const ro = EYE.bore, ri = 0.5, w = 0.875, rb = 0.68;
    const g = new THREE.Group();
    g.add(L(S, [[rb * 0.9, -w / 2], [ro, -w / 2], [ro, w / 2], [rb * 0.9, w / 2], [rb * 0.9, -w / 2]], 'steel', 32));
    const prof = [];
    const a0 = Math.asin(0.62 / rb);
    for (let i = 0; i <= 10; i++) {
      const a = -a0 + (2 * a0 * i) / 10;
      prof.push([rb * Math.cos(a), rb * Math.sin(a)]);
    }
    g.add(L(S, [[ri, -0.62], ...prof, [ri, 0.62], [ri, -0.62]], 'chrome', 32));
    return g;
  }
  function circlipObj() {
    const r = EYE.bore + 0.04, w = 0.09, t = 0.05;
    const ring = S.slotted(u(r), u(r - w), -u(t / 2), u(t / 2), [{ a: 0, w: 0.35, y0: -u(t), y1: u(t) }], 'blackOxide', { seg: 32 });
    const ears = [-1, 1].map((s) => {
      const a = s * 0.3;
      const e = S.cyl(u(0.08), u(t), 'blackOxide', { seg: 10 });
      e.position.set(u(r - 0.12) * Math.sin(a), 0, u(r - 0.12) * Math.cos(a));
      return e;
    });
    return merged([ring, ...ears], 'blackOxide');
  }

  return { view: { dir: [-0.8, 0.45, 1] } };
}

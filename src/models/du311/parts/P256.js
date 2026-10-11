// P256 — Moteur équipé D914L04 CX033008 rév. 1 (pages 256-258) : « ASSY,
// ENGINE, D914L04 », repère 11 de P242. Le moteur Deutz (P260, 6) avec ses
// filtres déportés (P262, 10), sa ligne d'échappement (P266, 11) gainée d'un
// manchon isolant (3), son admission d'air (P268, 13) sur la console (15) ;
// refroidisseur d'huile hydraulique (7) devant la soufflante, coudes ORB-JIC
// -20/-16 (20) sur ses boîtes à eau, patte isolante (18) dessous ; cornière
// des filtres (8) en travers du carter de volant ; jauge d'huile déportée de
// 3 pi (9) tenue par la patte (14) et l'équerre soudée (12) ; câble
// d'accélérateur à chape (19) sur son équerre (16) ; quatre supports de
// pattes (17) qui reposent sur les plots antivibratoires (trousses P248 de P242).
// Visserie (affectation d'après les bulles des pages 256-258) :
//   1 M10×20 (rondelles 29, plates 30) — cornière 8 sur le carter de volant
//     (2), patte 18 sous le refroidisseur (2) ; 2 M10×25 (29) — pieds de la
//     console 15 ; 4 CHC M8×20 + 5 — patte 14 sur le capot d'air ;
//   21 1/4×1 (28, 32) — gaine du câble dans l'équerre 16 ; 22 1/4×2 (28, 32)
//     — chape du câble sur le levier de régulateur ;
//   23 5/16×1 3/4 (26 ×2, 27, 33) — équerre 12 sur la console 15 ;
//   24 3/8×1 1/4 (31, 34) — pieds des colliers du filtre sur la console 15 ;
//   25 1/2×1 3/4 (30 ×2, 35) — supports 17 sous les pattes du moteur.
// Repère : repère moteur ENG (_moteur_surpresseur.js) — origine sur l'axe du
// vilebrequin, dans le plan de la face SAE du carter de volant ; +X vers
// l'avant (soufflante), Y haut, +Z côté injection, −Z côté échappement.
// Dessous des supports 17 (appui sur les plots P248) à y = ENG.mountY = −0.35,
// aux quatre pattes ENG.feet (x, z) : (0.055, ∓0.25) et (0.6, ∓0.21).
// Encombrement ≈ 1.6 (X, de −0.60 à 0.97) × 1.45 (Y, de −0.35 à 1.1) × 0.75 (Z) m.
// Cotes : visserie de la liste ; refroidisseur, consoles et pattes d'après les
// proportions des pages 256-258.
import { ENG, IN } from './_moteur_surpresseur.js';

export default function P256(api) {
  const { box, cyl, lathe, shell, plate, extrude, tube, hose, cable, bolt, nut, washer, fitting, merged, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const bx = (x0, x1, y0, y1, z0, z1, mat, r = 0) => box(x1 - x0, y1 - y0, z1 - z0, mat, { r, pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  const lw = (d, c, axis = 'y') => at(washer(d * 0.95, d * 0.53, d * 0.25, 'zinc', { axis }), c); // Grower
  const fw = (d, c, axis = 'y') => at(washer(d * 1.05, d * 0.54, d * 0.16, 'zinc', { axis }), c); // plate
  const hn = (d, c, axis = 'y') => at(nut(d * 1.5, d * 0.85, 'zinc', { axis }), c);

  // ---------------------------------------------------------------- sous-assemblages
  P('6', api.sub('P260', { remoteFilters: true }), [0, 0, 0]);
  P('10', api.sub('P262'), [0, 0, 0.35]);
  P('11', api.sub('P266'), [-0.6, 0.15, -0.25]);
  P('13', api.sub('P268'), [0, 0.45, 0]);

  // ---------------------------------------------------------------- 7 — refroidisseur d'huile
  // Faisceau à ailettes verticales, boîtes à eau haut et bas, joues latérales
  // percées, orifices ORB au centre des boîtes.
  const C = ENG.cooler;
  const [cx, cy, cz] = [C.x, C.y, C.z];
  {
    const core = bx(cx - C.t / 2, cx + C.t / 2, cy - C.h / 2, cy + C.h / 2, cz - C.w / 2, cz + C.w / 2, 'black');
    const fins = [];
    for (let k = 0; k < 38; k++) {
      const z = cz - C.w / 2 + 0.008 + (k * (C.w - 0.016)) / 37;
      fins.push(bx(cx + C.t / 2, cx + C.t / 2 + 0.003, cy - C.h / 2 + 0.004, cy + C.h / 2 - 0.004, z - 0.0012, z + 0.0012, 'black'));
      fins.push(bx(cx - C.t / 2 - 0.003, cx - C.t / 2, cy - C.h / 2 + 0.004, cy + C.h / 2 - 0.004, z - 0.0012, z + 0.0012, 'black'));
    }
    const tanks = [-1, 1].map((s) => bx(cx - C.t / 2 - 0.006, cx + C.t / 2 + 0.006, cy + s * (C.h / 2 + 0.025) - 0.025, cy + s * (C.h / 2 + 0.025) + 0.025, cz - C.w / 2 + 0.01, cz + C.w / 2 - 0.01, 'black', 0.01));
    const cheeks = [-1, 1].map((s) => {
      const holes = [-0.15, 0, 0.15].map((y) => [0, y, 0.005]);
      const m = extrude([[-0.035, -C.h / 2 - 0.05], [0.035, -C.h / 2 - 0.05], [0.035, C.h / 2 + 0.05], [-0.035, C.h / 2 + 0.05]], 0.005, 'black', { holes });
      m.position.set(cx, cy, cz + s * (C.w / 2 + 0.0025));
      return m;
    });
    const bosses = [-1, 1].map((s) => at(cyl(0.022, 0.03, 'black', { seg: 20 }), [cx, cy + s * (C.h / 2 + 0.06), cz - C.w / 2 + 0.07]));
    P('7', group(core, merged([...fins, ...tanks, ...cheeks, ...bosses], 'black')), [0.3, 0, 0]);
  }
  // 20 — coudes 90° ORB -20 / JIC -16 dans les orifices des boîtes à eau,
  // tournés vers l'arrière (−X).
  for (const s of [-1, 1]) {
    const y = cy + s * (C.h / 2 + 0.075);
    P('20', at(fitting(0.04, 0.06, 'zinc', { axis: s > 0 ? 'y' : '-y', elbow: true }), [cx, y, cz - C.w / 2 + 0.07], [0, s > 0 ? Math.PI / 2 : -Math.PI / 2, 0]), [0.3, s * 0.08, 0]);
  }
  // 18 — patte isolante sous le refroidisseur : semelle et âme, deux vis 1.
  const Y18 = cy - C.h / 2 - 0.05;
  P('18', group(
    bx(cx - 0.06, cx + 0.06, Y18 - 0.008, Y18, cz - 0.1, cz + 0.1, 'black', 0.002),
    bx(cx - 0.004, cx + 0.004, ENG.mountY + 0.1, Y18 - 0.008, cz - 0.08, cz + 0.08, 'black'),
    bx(cx - 0.06, cx + 0.06, ENG.mountY + 0.092, ENG.mountY + 0.1, cz - 0.1, cz + 0.1, 'black', 0.002),
  ), [0.3, -0.12, 0]);
  const D10 = 0.01;
  for (const s of [-1, 1]) {
    const c = [cx, Y18 - 0.008, cz + s * 0.07];
    P('30', fw(0.0127, [c[0], c[1] - 0.001, c[2]]), [0.3, -0.18, 0]);
    P('29', lw(D10, [c[0], c[1] - 0.003, c[2]]), [0.3, -0.2, 0]);
    P('1', at(bolt(D10, 0.02, 'zinc', { axis: '-y' }), [c[0], c[1] - 0.0045, c[2]]), [0.3, -0.24, 0]);
  }

  // ---------------------------------------------------------------- 8 — cornière des filtres
  // Cornière en travers du carter de volant : aile horizontale sur le dessus
  // du carter, aile verticale (plan x = flangeX) qui porte les filtres P262.
  const F = ENG.filters;
  const Z8 = [-0.12, 0.46];
  P('8', group(merged([
    bx(F.flangeX, F.flangeX + 0.006, 0.17, 0.256, Z8[0], Z8[1], 'black', 0.002),
    bx(F.flangeX + 0.006, 0.062, 0.25, 0.256, Z8[0], Z8[1], 'black', 0.002),
  ], 'black')), [0, 0.2, 0.15]);
  for (const z of [-0.08, 0.1]) {
    P('30', fw(0.0127, [0.045, 0.257, z]), [0, 0.28, 0.15]);
    P('29', lw(D10, [0.045, 0.259, z]), [0, 0.3, 0.15]);
    P('1', at(bolt(D10, 0.02, 'zinc'), [0.045, 0.2615, z]), [0, 0.34, 0.15]);
  }

  // ---------------------------------------------------------------- 15 — console du filtre à air
  // Montant vertical sur la cornière, plateau en porte-à-faux sous les
  // colliers du filtre P268, jambe de force.
  const YS = 0.727 - 5.5 * IN - 0.012 - 0.006; // dessous des pieds de colliers P268
  const Z15 = ENG.intake.z;
  P('15', group(merged([
    bx(0.062, 0.1, 0.256, 0.262, Z15 - 0.07, Z15 + 0.07, 'black', 0.002), // pied
    bx(0.094, 0.1, 0.262, YS, Z15 - 0.07, Z15 + 0.07, 'black', 0.002), // montant
    bx(0.1, 0.5, YS - 0.006, YS, Z15 - 0.08, Z15 + 0.08, 'black', 0.002), // plateau
    tube([[0.1, 0.33, Z15 - 0.075], [0.3, YS - 0.006, Z15 - 0.075]], 0.008, 'black', { sharp: true, seg: 2, radial: 8 }),
    tube([[0.1, 0.33, Z15 + 0.075], [0.3, YS - 0.006, Z15 + 0.075]], 0.008, 'black', { sharp: true, seg: 2, radial: 8 }),
  ], 'black')), [0, 0.3, 0]);
  for (const z of [Z15 - 0.04, Z15 + 0.04]) {
    P('29', lw(D10, [0.08, 0.2635, z]), [0, 0.32, 0]);
    P('2', at(bolt(D10, 0.025, 'zinc'), [0.08, 0.265, z]), [0, 0.36, 0]);
  }
  // 24 — pieds des colliers du filtre (P268 rep. 2) sur le plateau : vis 3/8,
  // rondelles 31 sous la tête, écrous 34 sous le plateau.
  const D24 = 0.375 * IN;
  for (const x of [0.21, 0.33]) for (const s of [-1, 1]) {
    const z = Z15 + s * 0.065;
    P('24', at(bolt(D24, 1.25 * IN, 'zinc'), [x, YS + 0.006 + D24 * 0.25, z]), [0, 0.55, 0]);
    P('31', lw(D24, [x, YS + 0.006 + D24 * 0.125, z]), [0, 0.5, 0]);
    P('34', hn(D24, [x, YS - 0.006 - D24 * 0.425, z]), [0, 0.4, 0]);
  }

  // ---------------------------------------------------------------- 3 — manchon isolant d'échappement
  // Gaine tressée en fibre de verre enroulée sur le tuyau P266 rep. 6.
  {
    const EX = ENG.exhaust, r = IN + 0.0015;
    const turns = [];
    const x0 = -0.44, x1 = -0.3, n = 9;
    for (let k = 0; k < n; k++) {
      const x = x0 + ((x1 - x0) * (k + 0.5)) / n;
      turns.push(at(lathe([[r + 0.001, -0.008], [r + 0.005, -0.006], [r + 0.006, 0], [r + 0.005, 0.006], [r + 0.001, 0.008]], 'cream', { axis: 'x', seg: 28 }), [x, EX.y, EX.z]));
    }
    P('3', merged(turns, 'cream'), [-0.35, 0.2, -0.25]);
  }

  // ---------------------------------------------------------------- 9, 12, 14 — jauge déportée
  // Jauge de 3 pi : tube du carter (P260) prolongé jusqu'à la poignée, tenue
  // à mi-hauteur par la patte 14 (CHC M8 4, rondelle 5) sur le capot d'air
  // et en tête par l'équerre soudée 12, boulonnée à la console 15 (vis 23).
  const D0 = [0.24, 0.05, 0.31], D1 = [0.11, 0.72, 0.33];
  const dip = (t) => D0.map((v, i) => v + (D1[i] - v) * t);
  P('9', group(
    tube([D0, D1], 0.005, 'steel', { sharp: true, seg: 2, radial: 10 }),
    at(lathe([[0, 0], [0.012, 0], [0.012, 0.02], [0.006, 0.026], [0, 0.026]], 'yellow', { seg: 16 }), D1),
    at(S_torus(api, 0.016, 0.004, 'yellow'), [D1[0], D1[1] + 0.04, D1[2]]),
  ), [0, 0.35, 0.12]);
  const M14 = dip(0.4);
  P('14', group(merged([
    bx(M14[0] - 0.015, M14[0] + 0.015, M14[1] - 0.03, M14[1] + 0.01, 0.29, 0.293, 'black'),
    bx(M14[0] - 0.015, M14[0] + 0.015, M14[1] - 0.004, M14[1] + 0.002, 0.293, M14[2] + 0.012, 'black'),
  ], 'black')), [0, 0.15, 0.18]);
  P('5', lw(0.008, [M14[0], M14[1] - 0.018, 0.293 + 0.001], 'z'), [0, 0.15, 0.24]);
  P('4', at(bolt(0.008, 0.02, 'blackOxide', { axis: 'z', head: 'socket' }), [M14[0], M14[1] - 0.018, 0.293 + 0.002]), [0, 0.15, 0.3]);
  const M12 = dip(0.93);
  P('12', group(merged([
    bx(0.1, 0.13, M12[1] - 0.02, M12[1] + 0.02, Z15 + 0.08, M12[2] + 0.015, 'black', 0.002),
    bx(0.1, 0.106, M12[1] - 0.02, M12[1] + 0.02, Z15 + 0.05, Z15 + 0.08, 'black'),
  ], 'black')), [0, 0.3, 0.2]);
  // 23 — vis 5/16 de l'équerre 12 dans le montant de la console 15 : rondelles
  // plates 26 de part et d'autre, Grower 27, écrou 33.
  {
    const D = 0.3125 * IN, y = M12[1], z = Z15 + 0.065;
    P('26', fw(D, [0.09, y, z], 'x'), [-0.05, 0.3, 0.2]);
    P('23', at(bolt(D, 1.75 * IN, 'zinc', { axis: '-x' }), [0.089 - D * 0.08, y, z]), [-0.09, 0.3, 0.2]);
    P('26', fw(D, [0.107, y, z], 'x'), [0.03, 0.3, 0.2]);
    P('27', lw(D, [0.109, y, z], 'x'), [0.05, 0.3, 0.2]);
    P('33', hn(D, [0.115, y, z], 'x'), [0.07, 0.3, 0.2]);
  }

  // ---------------------------------------------------------------- 16, 19 — accélérateur
  // Équerre 16 boulonnée au carter de régulateur, gaine du câble serrée par
  // la vis 21 ; chape du câble sur le levier par la vis 22 ; le câble monte
  // puis file vers l'arrière le long du capot d'air (bout libre vers le pupitre).
  const T16 = [0.64, -0.02, 0.26];
  P('16', group(merged([
    bx(T16[0] - 0.03, T16[0] + 0.03, T16[1] - 0.004, T16[1] + 0.002, 0.2, T16[2] + 0.02, 'black'),
    bx(T16[0] - 0.03, T16[0] + 0.03, T16[1] + 0.002, T16[1] + 0.05, T16[2] + 0.014, T16[2] + 0.02, 'black'),
  ], 'black')), [0.1, 0, 0.2]);
  {
    const top = [T16[0] - 0.4, 0.36, T16[2] + 0.12];
    const clevis = group(
      at(box(0.024, 0.01, 0.018, 'zinc', { r: 0.002 }), [T16[0] - 0.01, T16[1] - 0.018, T16[2] - 0.02]),
      at(cyl(0.0025, 0.05, 'steel', { seg: 8 }), [T16[0] - 0.01, T16[1] - 0.0, T16[2] - 0.02]),
    );
    P('19', group(
      cable([[T16[0] - 0.01, T16[1] + 0.03, T16[2] + 0.017], [T16[0] - 0.01, 0.2, T16[2] + 0.06], [T16[0] - 0.08, 0.34, T16[2] + 0.1], top], 0.005),
      clevis,
    ), [0.15, 0.2, 0.2]);
    const D = 0.25 * IN;
    // 21 : serre-gaine dans l'aile verticale de l'équerre.
    P('21', at(bolt(D, 1.0 * IN, 'zinc', { axis: 'z' }), [T16[0] + 0.018, T16[1] + 0.03, T16[2] + 0.02 + D * 0.16]), [0.1, 0.05, 0.3]);
    P('28', fw(D, [T16[0] + 0.018, T16[1] + 0.03, T16[2] + 0.02 + D * 0.08], 'z'), [0.1, 0.05, 0.26]);
    P('32', hn(D, [T16[0] + 0.018, T16[1] + 0.03, T16[2] + 0.014 - D * 0.425], 'z'), [0.1, 0.05, 0.22]);
    // 22 : axe de chape sur le levier de régulateur.
    P('22', at(bolt(D, 2.0 * IN, 'zinc', { axis: 'z' }), [T16[0] - 0.01, T16[1] - 0.018, T16[2] - 0.01]), [0.1, -0.05, 0.3]);
    P('28', fw(D, [T16[0] - 0.01, T16[1] - 0.018, T16[2] - 0.0115], 'z'), [0.1, -0.05, 0.26]);
    P('32', hn(D, [T16[0] - 0.01, T16[1] - 0.018, T16[2] - 0.03 - D * 0.425 - 0.005], 'z'), [0.1, -0.05, 0.2]);
  }

  // ---------------------------------------------------------------- 17 — supports de pattes
  // Chaise soudée sous chaque patte du moteur : platine haute (vis 25 au
  // travers de la patte), deux joues, platine basse percée pour le goujon du
  // plot antivibratoire (P248).
  const D25 = 0.5 * IN, FY = ENG.footY, MY = ENG.mountY;
  for (const [x, z] of ENG.feet) {
    P('17', group(merged([
      bx(x - 0.05, x + 0.05, FY - 0.012, FY, z - 0.05, z + 0.05, 'black', 0.002),
      bx(x - 0.05, x - 0.038, MY + 0.012, FY - 0.012, z - 0.04, z + 0.04, 'black'),
      bx(x + 0.038, x + 0.05, MY + 0.012, FY - 0.012, z - 0.04, z + 0.04, 'black'),
      at(plate(0.1, 0.1, 0.012, 'black', { holes: [[0, 0, 0.0075]] }), [x, MY + 0.006, z]),
    ], 'black')), [0, -0.12, Math.sign(z) * 0.1]);
    // 25 : tête sur la patte (rondelle 30), rondelle 30 et écrou 35 sous la platine.
    const ys = FY + 0.014;
    P('30', fw(D25, [x, ys + D25 * 0.08, z]), [0, 0.1, 0]);
    P('25', at(bolt(D25, 1.75 * IN, 'zinc'), [x, ys + D25 * 0.16, z]), [0, 0.16, 0]);
    P('30', fw(D25, [x, FY - 0.012 - D25 * 0.08, z]), [0, -0.2, Math.sign(z) * 0.1]);
    P('35', hn(D25, [x, FY - 0.012 - D25 * 0.16 - D25 * 0.425, z]), [0, -0.24, Math.sign(z) * 0.1]);
  }

  return { view: { dir: [-0.85, 0.65, 1.1] } };
}

// Tore (poignée de jauge) dans le plan XY.
function S_torus(api, R, r, mat) {
  return api.S.torus(R, r, mat, { axis: 'z' });
}

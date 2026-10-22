// P068 — Groupe hydraulique 125 HP 600 V 60 Hz UM-064-FMX-005-100PPP (page 3.2)
// et son groupe moteur-pompes UM-064-STM-1500-600V (P069, page 3.3), posés sur
// leurs patins comme sur les pages 3.0 et 3.1 : 96 7/8 po hors oreilles et pattes,
// 60 15/16 po au sommet des oreilles, 48 1/4 po porte de la boîte électrique et
// poignée comprises. Cadre rouge en tube carré 2 po (corps de 2,18 × 1,12 m entre
// les faces des poteaux) : fourreaux de fourche dans les deux sens, prolongés aux
// bouts en pattes percées, oreilles de levage en goussets à deux lobes, deux
// capots du dessus à charnières. Moteur WEG gris foncé, cloche et pompes Rexroth
// en tandem (P069) ; réservoir 110 gal sous les capots ; boîte électrique Hoffman
// derrière la porte du cadre et transformateur sur le flanc −Z ; refroidisseurs
// superposés au-dessus du moteur, collecteur de retour et pompe de remplissage à
// main sur le flanc +Z ; panneaux rabattables au bout des pompes. Roues, moyeux
// et timon : options non montées (demande du client).
// Repère : origine au sol au centre du cadre, X vers le bout des pompes et des
// panneaux, Y vers le haut, Z vers le flanc des refoulements des pompes.
import { buildProcedural } from '../../viewer/assembly.js';
import { lister, each, grid, IN } from './layout.js';

// Cadre FMX-005-200PP : corps entre les faces extérieures des poteaux d'angle (85 11/16 × 44 po),
// dessus des longerons du haut (55 5/16 po), sommet des oreilles (60 15/16 po), tube carré 2 po.
export const PP = { L: 2.1765, W: 1.119, H: 1.405, ear: 1.548, t: 2 * IN };
const { L, W, H, t } = PP;
const X1 = L / 2, Z1 = W / 2;
// Base : fourreaux longitudinaux de 9 1/2 × 3 1/2 po intérieur (paroi 1/4 po, 10 po hors tout) de y 2 à
// 6 po, posés sur les patins 2 × 2 po (z0 : paroi intérieure) ; fourreaux transversaux à ±0,40 m (41 po
// hors tout, page 3.1).
const SL = { y0: 2 * IN, y1: 6 * IN, e: IN / 4, z0: 0.3055, fork: 0.4, w: 10 * IN };
const BASE = SL.y1; // dessus de la base
// Poteaux du milieu (deux flancs), poteau de la porte de la boîte électrique (flanc −Z), traverse des charnières.
const MID = -0.0925, DOOR = -0.167, HINGE = -0.175;

// Groupe moteur-pompes (P069) : axe commun à 0,461 m (pattes du moteur NEMA 444T, D = 11 po, sur la
// plaque moteur à 0,178 m), décalé de 5 cm vers +Z (page 3.01, vue de dessous).
const AX = { y: 0.461, z: 0.05 };
// Moteur : capot de ventilateur, carcasse à ailettes, bout D et bride C (page 3.0).
const MOTOR = { fan: -1.03, body: -0.86, end: -0.21, face: -0.10, r: 0.235, fin: 0.275, plate: BASE + IN };
// Pompes en tandem : bride avant, bout, section du corps (hauteur, largeur), carré de la bride.
const PUMPS = [
  { x0: 0.21, x1: 0.59, h: 0.24, w: 0.24, f: 0.26 }, // A11VO130
  { x0: 0.59, x1: 0.85, h: 0.152, w: 0.17, f: 0.18 }, // A10VO45K
  { x0: 0.85, x1: 1.02, h: 0.152, w: 0.17, f: 0.18 }, // A10VO45N
];
const SQ = Math.SQRT1_2;

// Raccords : rotation d'un raccord (axe +Y) vers l'axe donné, et vecteur de cet axe.
const ROT = { x: [0, 0, -Math.PI / 2], '-x': [0, 0, Math.PI / 2], y: null, '-y': [Math.PI, 0, 0], z: [Math.PI / 2, 0, 0], '-z': [-Math.PI / 2, 0, 0] };
const DIR = { x: [1, 0, 0], '-x': [-1, 0, 0], y: [0, 1, 0], '-y': [0, -1, 0], z: [0, 0, 1], '-z': [0, 0, -1] };
const add = (p, d, k = 1) => p.map((c, i) => c + d[i] * k);
/** Raccord vissé dans une face : six-pans posé sur la face au point F, sortie selon ax. */
const seated = (S, d, len, F, ax, mat = 'steel') => S.at(S.fitting(d, len, mat), add(F, DIR[ax], 0.14 * len), ROT[ax]);
/** Bout d'un raccord posé par seated(). */
const tipOf = (len, F, ax) => add(F, DIR[ax], 0.935 * len);

// Raccords du groupe moteur-pompes repris par les boyaux de P068 et de P002.
const zA = AX.z + PUMPS[0].w / 2, zK = AX.z + PUMPS[1].w / 2; // flancs +Z (les flancs −Z en miroir)
const PRESS = [0.42, AX.y, zA + 0.025]; // bride 449-74446-20 du refoulement de l'A11VO130
const PILOT = tipOf(0.04, [0.42, AX.y + 0.055, zA + 0.0125], 'y'); // 6801F-06-06 sur la bride
const N_DRAIN = tipOf(0.04, [0.95, AX.y + PUMPS[2].h / 2, AX.z], 'y'); // 6400-8-8 de l'A10VO45N
const N_ELBOW = add(N_DRAIN, [0, 0.14 * 0.045, 0]); // 6500-08-08 dessus, sortie vers −X
const DRAINS = [
  { p: tipOf(0.05, [0.30, AX.y + PUMPS[0].h / 2, AX.z], 'y'), n: [0, 1, 0] }, // 6400-12-12 de l'A11VO130
  { p: tipOf(0.04, [0.70, AX.y + PUMPS[1].h / 2, AX.z], 'y'), n: [0, 1, 0] }, // 6400-8-8 de l'A10VO45K
  { p: add(N_ELBOW, [-0.55 * 0.045, 0.7 * 0.045, 0]), n: [-1, 0, 0] },
];
// Aspirations sur les flancs −Z : coude de rue 3 po vers le bas à 45° vers le moteur et mamelon cannelé
// (A11VO130), 2501-24-24 (A10VO45K), coude 6801-24-24 sortie vers le haut (A10VO45N).
const SUC = (() => {
  const J = [0.40, AX.y, AX.z - PUMPS[0].w / 2 - 0.03 - 0.065], d = [-SQ, -SQ, 0];
  const kF = [0.72, AX.y, AX.z - PUMPS[1].w / 2 - 0.025];
  const nPos = [0.95, AX.y, AX.z - PUMPS[2].w / 2 - 0.14 * 0.07];
  return [
    { J, d, p: add(J, d, 0.195), n: d, r: 0.047 },
    { F: kF, p: tipOf(0.07, kF, '-z'), n: [0, 0, -1], r: 0.028 },
    { pos: nPos, p: add(nPos, [0, 0.55 * 0.07, -0.7 * 0.07]), n: [0, 1, 0], r: 0.028 },
  ];
})();

// Réservoir 110 gal : du poteau du milieu (bout arrière posé sur la traverse entre les poteaux du milieu)
// au poteau d'angle avant, dessus 0,17 m sous le dessus des longerons (pages 3.0 et 3.1).
const TANK = { x0: -0.105, x1: 1.03, y0: 0.825, y1: 1.235, w: 0.93 };
// Vannes d'aspiration sous le fond : 3 po (A11VO130) et 1 1/2 po (A10VO45), mamelon cannelé dessous.
const VALVES = [
  { x: 0.52, z: -0.25, s: 0.08, d: 0.08, len: 0.1, nr: 0.045 },
  { x: 0.72, z: -0.25, s: 0.05, d: 0.045, len: 0.08, nr: 0.03 },
  { x: 0.95, z: -0.1, s: 0.05, d: 0.045, len: 0.08, nr: 0.03 },
].map((v) => {
  const vy = TANK.y0 - 0.05 - 1.15 * v.s, F = [v.x, vy - 1.15 * v.s, v.z];
  return { ...v, vy, F, p: tipOf(v.len, F, '-y') };
});
// Filtres de retour RTF-47 sur le dessus, au bout arrière : entrée n° 1 vers −X, n° 2 vers +Z.
const FILTERS = [{ x: 0.02, z: -0.12 }, { x: 0.02, z: 0.205 }];
const F_IN = [[FILTERS[0].x - 0.065, 1.3, FILTERS[0].z], [FILTERS[1].x, 1.3, FILTERS[1].z + 0.065]];
const F_TIP = [tipOf(0.07, F_IN[0], '-x'), tipOf(0.07, F_IN[1], 'z')];
// Collecteur de retour UM-064-600PP dressé contre la platine du poteau du milieu (flanc +Z).
const COL = { x0: -0.189, x1: -0.124, y0: 0.56, y1: 0.85, z0: 0.43, z1: 0.495 };
const cx = (COL.x0 + COL.x1) / 2, cz = (COL.z0 + COL.z1) / 2;
const COL_DR = [0.6, 0.66, 0.72].map((y) => tipOf(0.04, [cx, y, COL.z0], '-z')); // drains des pompes
const COL_TOP = tipOf(0.045, [cx, COL.y1, cz], 'y'); // sortie vers le réservoir
const COL_IN = tipOf(0.04, [cx, 0.62, COL.z1], 'z'); // entrée du drain de la console
// Vanne de démarrage DTDA-MHN-GAI contre le collecteur : bloc GAI, cartouche dessous, raccords dessus.
const GAI = { x: COL.x0 - 0.025, y0: 0.78, y1: 0.83, z: cz };
const GAI_ELBOW = add(tipOf(0.035, [GAI.x, GAI.y1, GAI.z - 0.0125], 'y'), [0, 0.14 * 0.04, 0]);
const GAI_OUT = add(GAI_ELBOW, [0, 0.7 * 0.04, -0.55 * 0.04]);
// Boîte électrique Hoffman 30 × 24 × 12 po, porte vers −Z, sur le berceau du flanc −Z.
const BOX = { x: -0.575, y0: 0.5368, h: 0.762, w: 0.61, d: 0.305, z1: -0.538 };

// Raccords des boyaux de la console (P002), tous sortant du flanc +Z : pression → bride de refoulement
// de l'A11VO130 ; retour → entrée n° 2 du filtre RTF-47 ; drain → entrée du collecteur de retour.
export const PP_N = [0, 0, 1];
export const PP_PORTS = [PRESS, F_TIP[1], COL_IN];
// Aucun câble de commande au manuel : point gardé pour P002 (presse-étoupe sous la boîte électrique).
export const PP_CABLE = [BOX.x, BOX.y0 - 0.006, BOX.z1 + BOX.d / 2];

/** Tôle découpée : contour [[x, y], ...] dans le plan XY, trous (contours ou cercles [x, y, r]), épaisseur selon Z. */
function slab(api, outline, holes, th, mat) {
  const { THREE, S } = api;
  const V = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
  let out = V(outline);
  if (THREE.ShapeUtils.isClockWise(out)) out = out.reverse();
  const shape = new THREE.Shape(out);
  for (const h of holes) {
    const p = new THREE.Path();
    if (typeof h[0] === 'number') p.absarc(h[0], h[1], h[2], 0, Math.PI * 2, true);
    else {
      let q = V(h);
      if (!THREE.ShapeUtils.isClockWise(q)) q = q.reverse();
      p.setFromPoints(q);
    }
    shape.holes.push(p);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: th, bevelEnabled: false, curveSegments: 12 });
  geo.translate(0, 0, -th / 2);
  return S.merged([new THREE.Mesh(S.creaseNormals(geo))], mat);
}

/** Arc de cercle en points, de l'angle a0 à a1. */
const arc = (x, y, r, a0, a1, n = 10) => Array.from({ length: n + 1 }, (_, i) => {
  const a = a0 + ((a1 - a0) * i) / n;
  return [x + r * Math.cos(a), y + r * Math.sin(a)];
});

/** Lettres « UM » ajourées (contours de trous), hauteur h, centrées en (x, y). */
function letters(x, y, h) {
  const k = h / 0.16, s = (pts, dx) => pts.map(([u, v]) => [x + (u + dx) * k, y + v * k]);
  const U = [[-0.07, 0.08], [-0.07, -0.01], ...arc(0, -0.01, 0.07, Math.PI, 2 * Math.PI, 8), [0.07, 0.08], [0.035, 0.08],
    [0.035, -0.01], ...arc(0, -0.01, 0.035, 2 * Math.PI, Math.PI, 8), [-0.035, 0.08]];
  const M = [[-0.09, -0.08], [-0.09, 0.08], [-0.055, 0.08], [0, 0.02], [0.055, 0.08], [0.09, 0.08], [0.09, -0.08], [0.055, -0.08],
    [0.055, 0.025], [0, -0.035], [-0.055, 0.025], [-0.055, -0.08]];
  return [s(U, -0.1), s(M, 0.095)];
}

// ------------------------------------------------------------------ P069

/** P069 — Groupe moteur-pompes 125 HP (page 3.3), dans le repère du groupe hydraulique (P068). */
export function P069(api) {
  const S = api.S, { box, cyl, lathe, at, group, washer, torus, bolt, fitting, merged, gear } = S;
  const P = lister(api, 'P069');
  const ay = AX.y, az = AX.z, M = MOTOR;
  const ox = (x) => [x, ay, az]; // point de l'axe

  // 17 — Moteur WEG 125 HP gris foncé (fonte) : carcasse 444/5TC à ailettes, pattes sur la plaque moteur, capot de
  // ventilateur à grille, bout D et bride C, boîte à bornes WEG sur le flanc +Z, anneau de levage.
  const m = [at(cyl(M.r, M.end - M.body, 'castIron', { axis: 'x', seg: 48 }), ox((M.body + M.end) / 2))];
  for (let k = 0; k < 36; k++) {
    const a = (k / 36) * Math.PI * 2, sy = Math.sin(a), cz = Math.cos(a), rr = (M.r + M.fin) / 2;
    if (sy < -0.45 || Math.abs(Math.atan2(sy, cz)) < 0.8) continue; // ni entre les pattes, ni sous la boîte à bornes
    m.push(at(box(M.end - M.body - 0.06, M.fin - M.r + 0.004, 0.011, 'castIron'), [(M.body + M.end) / 2, ay + sy * rr, az + cz * rr], [Math.PI / 2 - a, 0, 0]));
  }
  m.push(at(lathe([[0, 0], [M.r, 0], [M.r - 0.02, 0.05], [0.21, 0.08], [0.21, M.face - M.end], [0, M.face - M.end]], 'castIron', { axis: 'x', seg: 48 }), ox(M.end)));
  m.push(at(lathe([[0, 0], [0.265, 0], [0.265, 0.13], [0.23, 0.165], [0, M.body - M.fan]], 'castIron', { axis: '-x', seg: 48 }), ox(M.body)));
  [0.2, 0.14, 0.08].forEach((r) => m.push(at(S.ring(r, r - 0.012, 0.004, 'castIron', { axis: 'x', seg: 40 }), ox(M.fan - 0.001))));
  const feet = [-0.745, -0.325].flatMap((x) => [-1, 1].map((s) => [x, az + s * 0.2285]));
  for (const [x, z] of feet) {
    m.push(at(box(0.1, 0.122, 0.04, 'castIron', { r: 0.004 }), [x, M.plate + 0.061, z]));
    m.push(at(box(0.08, 0.07, 0.13, 'castIron'), [x, M.plate + 0.1, az + Math.sign(z - az) * 0.165]));
  }
  // Boîte à bornes : socle dans les ailettes, caisson, couvercle et logo WEG en relief.
  const tb = { x: -0.535, z0: az + 0.225, z1: az + 0.375 };
  m.push(at(box(0.3, 0.3, 0.08, 'castIron'), [tb.x, ay, tb.z0 - 0.035]));
  m.push(at(box(0.38, 0.4, tb.z1 - tb.z0, 'castIron', { r: 0.02 }), [tb.x, ay, (tb.z0 + tb.z1) / 2]));
  m.push(at(box(0.34, 0.36, 0.012, 'castIron', { r: 0.012 }), [tb.x, ay, tb.z1 + 0.006]));
  const lz = tb.z1 + 0.012 + 0.0015, st = 0.012, logo = [
    [0, 0.06, 0.25, st], [0, -0.06, 0.25, st], [-0.119, 0, st, 0.12], [0.119, 0, st, 0.12], // cadre
    [-0.09, 0, st, 0.07], [-0.065, 0, st, 0.07], [-0.04, 0, st, 0.07], [-0.065, -0.029, 0.062, st], // W
    [-0.005, 0, st, 0.07], [0.012, 0.029, 0.04, st], [0.012, 0, 0.034, st], [0.012, -0.029, 0.04, st], // E
    [0.05, 0, st, 0.07], [0.073, 0.029, 0.05, st], [0.073, -0.029, 0.05, st], [0.092, -0.013, st, 0.038], [0.082, -0.002, 0.03, st], // G
  ];
  const lg = logo.map(([x, y, w, h]) => at(box(w, h, 0.003, 'charcoal'), [tb.x + x, ay + y, lz]));
  P('CT125504NPBBW22', group(
    merged(m, 'castIron'), merged(lg, 'charcoal'),
    at(cyl(0.022, 0.012, 'steel', { axis: 'y' }), [tb.x, ay + M.fin + 0.004, az]),
    at(torus(0.03, 0.008, 'steel', { axis: 'z' }), [tb.x, ay + M.fin + 0.04, az]),
    at(cyl(0.032, -0.06 - M.face, 'steel', { axis: 'x', seg: 20 }), ox((M.face - 0.06) / 2)),
  ), [-0.5, 0, 0]);

  // 13 — Cloche BH447-SAED-1 (fonte noire) : bride ronde côté moteur, fût Ø 0,28, bride côté pompe ;
  // 14 — chapeau cintré sur la fenêtre du dessus, 15 — vis et 16 — rondelles.
  P('BH447-SAED-1', at(lathe([[0.12, M.face], [0.2, M.face], [0.2, -0.07], [0.14, -0.07], [0.14, 0.18], [0.19, 0.18], [0.19, 0.21], [0.12, 0.21], [0.12, M.face]],
    'blackCast', { axis: 'x', seg: 48 }), [0, ay, az]), [0, 0.25, 0]);
  const { THREE } = api, capR = [0.14, 0.146], capA = 0.56;
  const capShape = new THREE.Shape([...arc(0, 0, capR[1], Math.PI / 2 - capA, Math.PI / 2 + capA, 12), ...arc(0, 0, capR[0], Math.PI / 2 + capA, Math.PI / 2 - capA, 12)]
    .map(([x, y]) => new THREE.Vector2(x, y)));
  const capGeo = new THREE.ExtrudeGeometry(capShape, { depth: 0.12, bevelEnabled: false });
  P('BH447-SAED-4', at(merged([new THREE.Mesh(S.creaseNormals(capGeo))], 'blackCast'), [0, ay, az], [0, Math.PI / 2, 0]), [0, 0.35, 0]);
  const capBolts = [0.012, 0.108].map((x) => [x, ay + capR[1], az]);
  each(P, 'W375', capBolts.map((p) => at(washer(0.011, 0.005, 0.002, 'steel'), add(p, [0, 0.001, 0]))), [0, 0.4, 0]);
  each(P, 'B375-750', capBolts.map((p) => at(bolt(0.0095, 0.019, 'steel'), add(p, [0, 0.002, 0]))), [0, 0.45, 0]);
  // Bride côté moteur : 8 — vis et 7 — rondelles frein dans la bride C du moteur.
  const ring4 = (r) => [0, 1, 2, 3].map((k) => [Math.sin(Math.PI / 4 + (k * Math.PI) / 2) * r, Math.cos(Math.PI / 4 + (k * Math.PI) / 2) * r]);
  const bm = ring4(0.17).map(([dy, dz]) => [-0.07, ay + dy, az + dz]);
  each(P, 'LC625', bm.map((p) => at(washer(0.016, 0.0085, 0.003, 'steel', { axis: 'x' }), add(p, [0.0015, 0, 0]))), [0.1, 0.1, 0]);
  each(P, 'B625-1750', bm.map((p) => at(bolt(0.0159, 0.0445, 'steel', { axis: 'x' }), add(p, [0.003, 0, 0]))), [0.15, 0.1, 0]);
  // 9 à 12 — Accouplement F81 dans la cloche : moyeu côté moteur, étoile F87U, moyeu côté pompe et sa goupille.
  P('UM-F81-31228', at(lathe([[0, -0.06], [0.05, -0.06], [0.05, -0.02], [0.085, -0.02], [0.085, 0.02], [0, 0.02]], 'steel', { axis: 'x' }), [0, ay, az]), [0, 0.3, 0.3]);
  P('F87U', at(gear(0.06, 0.08, 8, 0.025, 'rubber', { axis: 'x' }), ox(0.0325)), [0, 0.35, 0.35]);
  P('UM-F81-B1308C-1', at(lathe([[0, 0.045], [0.085, 0.045], [0.085, 0.085], [0.05, 0.085], [0.05, 0.15], [0, 0.15]], 'steel', { axis: 'x' }), [0, ay, az]), [0, 0.3, 0.4]);
  P('218P', at(cyl(0.004, 0.016, 'steel', { axis: 'y', seg: 10 }), [0.12, ay + 0.058, az]), [0, 0.45, 0.4]);

  // 21, 22, 27 — Pompes Rexroth (fonte noire) en tandem : A11VO130 (bride SAE D, régulateur LNSD sur le
  // dessus), A10VO45K et A10VO45N, chacune bridée sur le bout de la précédente ; 40, 41 — accouplements
  // des traversées dans l'alésage de centrage des brides.
  const [A, K, N] = PUMPS;
  P('A11VO130', group(
    at(box(0.03, A.f, A.f, 'blackCast', { r: 0.015 }), ox(A.x0 + 0.015)),
    at(box(0.3, A.h, A.w, 'blackCast', { r: 0.03 }), ox(A.x0 + 0.03 + 0.15)),
    at(box(A.x1 - A.x0 - 0.33, 0.2, 0.2, 'blackCast', { r: 0.02 }), ox((A.x0 + 0.33 + A.x1) / 2)),
    at(box(0.07, 0.03, 0.1, 'blackCast', { r: 0.008 }), [0.435, ay + A.h / 2 + 0.015, az - 0.02]),
    at(cyl(0.022, A.x0 - 0.15, 'steel', { axis: 'x', seg: 16 }), ox((A.x0 + 0.15) / 2)),
  ), [0.25, 0, 0]);
  const pumpBody = (p, label) => group(
    at(slab(api, [[-p.f / 2, -p.f / 2], [p.f / 2, -p.f / 2], [p.f / 2, p.f / 2], [-p.f / 2, p.f / 2]], [[0, 0, 0.035]], 0.03, 'blackCast'), ox(p.x0 + 0.015), [0, -Math.PI / 2, 0]),
    at(box(p.x1 - p.x0 - 0.03, p.h, p.w, 'blackCast', { r: 0.02 }), ox((p.x0 + 0.03 + p.x1) / 2)),
    label ? at(box(0.05, 0.03, 0.07, 'blackCast', { r: 0.006 }), [p.x1 - 0.06, ay + p.h / 2 + 0.015, az - 0.02]) : null,
  );
  P('A10VO45K', pumpBody(K, true), [0.4, 0, 0]);
  P('A10VO45N', pumpBody(N, false), [0.55, 0, 0]);
  P('02436083', at(cyl(0.03, 0.03, 'steel', { axis: 'x', seg: 20 }), ox(K.x0 + 0.015)), [0.3, 0.35, 0]);
  P('02436084', at(cyl(0.03, 0.03, 'steel', { axis: 'x', seg: 20 }), ox(N.x0 + 0.015)), [0.5, 0.35, 0]);
  // Pompe sur la cloche : 35 — vis par la bride de la cloche, 6 — rondelles.
  const bp = ring4(0.17).map(([dy, dz]) => [0.18, ay + dy, az + dz]);
  each(P, 'W750', bp.map((p) => at(washer(0.019, 0.01, 0.003, 'steel', { axis: 'x' }), add(p, [-0.0015, 0, 0]))), [0.15, 0.1, 0]);
  each(P, 'B750-2500', bp.map((p) => at(bolt(0.019, 0.0635, 'steel', { axis: '-x' }), add(p, [-0.003, 0, 0]))), [0.1, 0.1, 0]);

  // Refoulement de l'A11VO130 (flanc +Z) : 37 — bride fendue code 62 en deux demi-brides, 36 — joint,
  // 39 — vis et 38 — rondelles frein, 23 — raccord du pilotage de la vanne de démarrage sur la bride.
  each(P, '449-74446-20', [-1, 1].map((s) => at(box(0.0225, 0.11, 0.025, 'zinc', { r: 0.003 }), [PRESS[0] + s * 0.01125, ay, zA + 0.0125])), [0, 0, 0.2]);
  P('OR-222', at(torus(0.03, 0.0016, 'rubber', { axis: 'z' }), [PRESS[0], ay, zA]), [0, 0, 0.15]);
  const pb = [-1, 1].flatMap((s) => [-1, 1].map((u) => [PRESS[0] + s * 0.0113, ay + u * 0.045, PRESS[2]]));
  each(P, 'LC500', pb.map((p) => at(washer(0.0105, 0.006, 0.002, 'steel', { axis: 'z' }), add(p, [0, 0, 0.001]))), [0, 0, 0.25]);
  each(P, 'B437-1000', pb.map((p) => at(bolt(0.0111, 0.0254, 'steel', { axis: 'z' }), add(p, [0, 0, 0.002]))), [0, 0, 0.3]);
  P('6801F-06-06', seated(S, 0.016, 0.04, [PRESS[0], ay + 0.055, zA + 0.0125], 'y'), [0, 0.2, 0.2]);
  // Aspiration de l'A11VO130 (flanc −Z) : 18 — bride code 61, 24 — joint, 34 — vis CHC, 26 — coude de rue
  // 3 po vers le bas à 45° vers le moteur, 20 — mamelon cannelé 3 po.
  const zAm = az - A.w / 2, J = SUC[0].J, d = SUC[0].d, rd = [0, 0, (3 * Math.PI) / 4];
  P('SP43-24-24', at(box(0.13, 0.13, 0.03, 'zinc', { r: 0.015 }), [J[0], ay, zAm - 0.015]), [0, 0, -0.2]);
  P('568-237', at(torus(0.045, 0.0016, 'rubber', { axis: 'z' }), [J[0], ay, zAm]), [0, 0, -0.15]);
  const shcs = (dd, len) => lathe([[0, -len], [dd / 2, -len], [dd / 2, 0], [dd * 0.75, 0], [dd * 0.75, dd], [dd * 0.3, dd], [dd * 0.3, dd * 0.45], [0, dd * 0.45]], 'blackOxide', { axis: '-z', seg: 16 });
  each(P, 'SHCS625-2000', [-1, 1].flatMap((s) => [-1, 1].map((u) => at(shcs(0.0159, 0.0508), [J[0] + s * 0.05, ay + u * 0.05, zAm - 0.03]))), [0, 0, -0.3]);
  P('UM-064-276P', group(merged([
    at(cyl(0.048, zAm - 0.03 - J[2], 'zinc', { axis: 'z', seg: 28 }), [J[0], ay, (J[2] + zAm - 0.03) / 2]),
    at(S.ball(0.053, 'zinc'), J),
    at(cyl(0.048, 0.065, 'zinc', { seg: 28 }), add(J, d, 0.0325), rd),
    at(cyl(0.056, 0.012, 'zinc', { seg: 28 }), add(J, d, 0.059), rd),
  ], 'zinc')), [0, -0.1, -0.35]);
  P('UM-064-318TD', group(
    at(cyl(0.05, 0.03, 'steel', { seg: 6 }), add(J, d, 0.08), rd),
    at(lathe([[0, 0], [0.04, 0], ...[0, 1, 2, 3].flatMap((k) => [[0.044, 0.02 + k * 0.02], [0.038, 0.02 + k * 0.02 + 0.001]]), [0.038, 0.1], [0, 0.1]], 'steel', { seg: 24 }), add(J, d, 0.095), rd),
  ), [0, -0.15, -0.45]);

  // Refoulements des A10VO45 (flanc +Z) : 2 — brides fendues code 61, 1 — joint, 4 — vis et 3 — rondelles
  // frein, 31 — raccord sur la bride de l'A10VO45K.
  each(P, 'SF-COD61-16', [0.72, 0.95].map((x) => at(box(0.065, 0.085, 0.022, 'zinc', { r: 0.004 }), [x, ay, zK + 0.011])), [0, 0, 0.25]);
  P('OR-219', at(torus(0.02, 0.0015, 'rubber', { axis: 'z' }), [0.72, ay, zK]), [0, 0, 0.2]);
  const kb = [-1, 1].flatMap((s) => [-1, 1].map((u) => [0.72 + s * 0.022, ay + u * 0.03, zK + 0.022]));
  each(P, 'LC375', kb.map((p) => at(washer(0.0095, 0.0052, 0.002, 'steel', { axis: 'z' }), add(p, [0, 0, 0.001]))), [0, 0, 0.3]);
  each(P, 'B375-1250', kb.map((p) => at(bolt(0.0095, 0.0318, 'steel', { axis: 'z' }), add(p, [0, 0, 0.002]))), [0, 0, 0.35]);
  P('6400-12-16', seated(S, 0.03, 0.05, [0.72, ay, zK + 0.022], 'z'), [0, 0, 0.4]);
  // Aspiration de l'A10VO45K (flanc −Z) : 19 — bride à raccords code 61, 25 — joint, 33 — vis CHC,
  // 32 — raccord droit ; de l'A10VO45N : 30 — coude.
  const zKm = az - K.w / 2, kF = SUC[1].F;
  P('UM-064-250P', at(box(0.09, 0.09, 0.025, 'zinc', { r: 0.008 }), [kF[0], ay, zKm - 0.0125]), [0, 0, -0.2]);
  P('568-225', at(torus(0.03, 0.0016, 'rubber', { axis: 'z' }), [kF[0], ay, zKm]), [0, 0, -0.15]);
  each(P, 'SHCS500-1500', [-1, 1].flatMap((s) => [-1, 1].map((u) => at(shcs(0.0127, 0.038), [kF[0] + s * 0.032, ay + u * 0.032, kF[2]]))), [0, 0, -0.3]);
  P('2501-24-24', seated(S, 0.035, 0.07, kF, '-z'), [0, 0, -0.35]);
  P('6801-24-24', at(fitting(0.035, 0.07, 'steel', { elbow: true }), SUC[2].pos, [-Math.PI / 2, 0, 0]), [0, 0, -0.3]);
  // Drains des carters sur le dessus : 5 — A11VO130, 28 — A10VO45K et A10VO45N, 29 — coude orientable.
  P('6400-12-12', seated(S, 0.024, 0.05, [0.3, ay + A.h / 2, az], 'y'), [0, 0.3, 0]);
  each(P, '6400-8-8', [0.7, 0.95].map((x) => seated(S, 0.02, 0.04, [x, ay + K.h / 2, az], 'y')), [0, 0.3, 0]);
  P('6500-08-08', at(fitting(0.02, 0.045, 'steel', { elbow: true }), N_ELBOW, [0, -Math.PI / 2, 0]), [0, 0.4, 0]);
  return { view: { dir: [0.45, 0.4, 1] } };
}

/** Sous-assemblage P069 : celui de la liste des modèles s'il y est inscrit, sinon construit ici. */
function unit(api) {
  try {
    return api.sub('P069');
  } catch (err) {
    if (!/introuvable/.test(err.message)) throw err;
    const m = buildProcedural({ P069 }, 'P069');
    m.root.userData.view = m.view;
    return m.root;
  }
}

// ------------------------------------------------------------------ P068

export function P068(api) {
  const S = api.S, { box, cyl, ring, plate, bolt, group, at, lathe, torus, nut, enclosure, fitting, washer, merged, tube, hose } = S;
  const P = lister(api, 'P068');

  // 5 — Cadre FMX-005-200PP (pièce soudée, rouge).
  const red = [], zinc = [], rubber = [], grey = [];
  const hb = SL.y1 - SL.y0, yb = (SL.y0 + SL.y1) / 2, zs = (Z1 + SL.z0) / 2, xm = X1 - t / 2;
  const fork = (x) => [[x - SL.w / 2 + SL.e, SL.y0 + SL.e], [x + SL.w / 2 - SL.e, SL.y0 + SL.e], [x + SL.w / 2 - SL.e, SL.y1 - SL.e], [x - SL.w / 2 + SL.e, SL.y1 - SL.e]];
  const wall = () => slab(api, [[-X1, SL.y0], [X1, SL.y0], [X1, SL.y1], [-X1, SL.y1]], [fork(-SL.fork), fork(SL.fork)], SL.e, 'red');
  for (const s of [-1, 1]) {
    // Longeron du haut ; poteaux d'angle, du milieu et (flanc −Z) de la porte de la boîte électrique.
    red.push(at(box(L, t, t, 'red', { r: 0.004 }), [0, H - t / 2, s * (Z1 - t / 2)]));
    for (const x of [-xm, MID, xm, ...(s < 0 ? [DOOR] : [])]) red.push(at(box(t, H - t - BASE, t, 'red', { r: 0.004 }), [x, (H - t + BASE) / 2, s * (Z1 - t / 2)]));
    // Fourreau longitudinal : dessus, fond (lumière à chaque bout), parois percées des fourreaux transversaux.
    red.push(at(box(L, SL.e, SL.w, 'red'), [0, SL.y1 - SL.e / 2, s * zs]));
    red.push(at(plate(L, SL.w, SL.e, 'red', { cutouts: [-1, 1].map((e) => [e * (X1 - 0.1), s * (0.41 - zs), 0.15, 0.075]) }), [0, SL.y0 + SL.e / 2, s * zs]));
    red.push(at(wall(), [0, 0, s * (Z1 - SL.e / 2)]), at(wall(), [0, 0, s * (SL.z0 + SL.e / 2)]));
    // Patin 2 × 2 po sous le flanc, bouts chanfreinés à 45° sous la face des poteaux.
    red.push(at(slab(api, [[-X1 + t, 0], [X1 - t, 0], [X1, t], [-X1, t]], [], t, 'red'), [0, 0, s * (Z1 - t / 2)]));
    for (const e of [-1, 1]) {
      // Patte de bout : fond du fourreau prolongé de 0,142 m, relevé de 20°, percé près du bout.
      const a = e * 0.349, len = 0.148;
      red.push(at(plate(len, 0.2, SL.e, 'red', { holes: [[e * 0.02, 0, 0.0275]] }), [e * (X1 + (len / 2) * Math.cos(a)), SL.y0 + SL.e / 2 + (len / 2) * Math.sin(Math.abs(a)), s * 0.41], [0, 0, a]));
      // Oreille de levage : gousset de 3/4 po à fleur du flanc, deux lobes percés (trou du haut à 85 mm
      // en dedans de la face du poteau, trou de bout à 63 mm au-delà), chanfreins à 45° ; gousset d'angle
      // à bord en arc entre le poteau et le longeron.
      const X = (u) => e * (X1 + u), zg = s * (Z1 - 0.0095);
      const ab = [[0, 1.172], [0.119, 1.265], ...arc(0.063, 1.321, 0.079, -Math.PI / 4, Math.PI * 0.56), [0, 1.41],
        ...arc(-0.085, 1.468, 0.08, -0.3, Math.PI * 0.75, 14), [-0.237, 1.43], [-0.237, H], [0, H]];
      red.push(at(slab(api, ab.map(([u, v]) => [X(u), v]), [[X(-0.085), 1.468, 0.0275], [X(0.063), 1.321, 0.0275]], 0.019, 'red'), [0, 0, zg]));
      const c = [[-t, 1.168], [-t, H - t], ...arc(-0.2368, 1.168, 0.186, Math.PI / 2, 0.02, 10)];
      red.push(at(slab(api, c.map(([u, v]) => [X(u), v]), [], 0.019, 'red'), [0, 0, zg]));
    }
  }
  // Traverses du haut aux bouts et traverse des charnières des capots ; traverses de la base (bouts, plaque
  // moteur, support de pompe ; large sous le support de cloche) ; fourreaux transversaux.
  for (const x of [-xm, xm, HINGE]) red.push(at(box(t, t, W - 2 * t, 'red', { r: 0.004 }), [x, H - t / 2, 0]));
  for (const x of [-xm, xm, -0.88, -0.235, 0.76]) red.push(at(box(t, hb, 2 * SL.z0, 'red', { r: 0.003 }), [x, yb, 0]));
  red.push(at(box(0.21, t, 2 * SL.z0, 'red', { r: 0.003 }), [0.075, SL.y1 - t / 2, 0]));
  for (const x of [-SL.fork, SL.fork]) {
    for (const y of [SL.y0 + SL.e / 2, SL.y1 - SL.e / 2]) red.push(at(box(SL.w, SL.e, 2 * SL.z0, 'red'), [x, y, 0]));
    for (const s of [-1, 1]) red.push(at(box(SL.e, hb, 2 * SL.z0, 'red'), [x + s * (SL.w / 2 - SL.e / 2), yb, 0]));
  }
  // Fourreaux ronds soudés sur les fourreaux longitudinaux (axe des roues et goupilles du timon, options),
  // bouts à fleur des flancs, bague grise.
  for (const x of [-0.975, -0.57, 0.57, 0.975]) for (const s of [-1, 1]) {
    red.push(at(lathe([[0.0325, 0], [0.045, 0], [0.045, Z1 - SL.z0], [0.0325, Z1 - SL.z0], [0.0325, 0]], 'red', { axis: s > 0 ? 'z' : '-z', seg: 28 }), [x, BASE + 0.045, s * SL.z0]));
    zinc.push(at(ring(0.0325, 0.025, 0.01, 'zinc', { axis: 'z', seg: 24 }), [x, BASE + 0.045, s * (Z1 - 0.005)]));
  }
  // Plaque moteur de 1 po ajourée « UM », trous des pattes du moteur.
  const ftH = [-0.745, -0.325].flatMap((x) => [-1, 1].map((s) => [x + 0.565, -(AX.z + s * 0.2285), 0.011]));
  red.push(at(slab(api, [[-0.355, -0.3], [0.355, -0.3], [0.355, 0.3], [-0.355, 0.3]], [...letters(0, 0, 0.16), ...ftH], IN, 'red'), [-0.565, BASE + IN / 2, 0], [-Math.PI / 2, 0, 0]));
  // Support de cloche : plaque de 3/4 po sous la cloche, échancrure en U au pied.
  red.push(at(slab(api, [[-0.03, BASE], [0.025, BASE], [0.025, 0.1974], ...arc(0.075, 0.1974, 0.05, Math.PI, 0, 10), [0.125, BASE], [0.18, BASE],
    [0.18, AX.y - 0.14], [-0.03, AX.y - 0.14]], [], 0.019, 'red'), [0, 0, AX.z]));
  // Traverses d'appui du réservoir (poteaux d'angle avant, poteaux du milieu), bandes de caoutchouc.
  for (const x of [X1 - 1.5 * t, MID]) {
    red.push(at(box(t, t, W - 2 * t, 'red', { r: 0.003 }), [x, TANK.y0 - 0.006 - t / 2, 0]));
    rubber.push(at(box(t - 0.006, 0.006, W - 2 * t - 0.04, 'rubber'), [x, TANK.y0 - 0.003, 0]));
  }
  // Platine du collecteur de retour (face −X du poteau du milieu, flanc +Z).
  red.push(at(box(0.006, 0.42, 0.13, 'red'), [COL.x1 + 0.003, 0.74, 0.465]));
  // Patte du transformateur (poteau du milieu, flanc −Z) : bras et aile verticale.
  red.push(at(box(0.267, 0.006, 0.2365, 'red'), [0.0665, 0.683, -0.44125]));
  red.push(at(box(0.17, 0.041, 0.006, 'red'), [0.075, 0.6655, -0.324]));
  // Berceau de la boîte électrique : rail du flanc −Z et deux tubes en porte-à-faux sous la boîte.
  red.push(at(box(DOOR - t / 2 + xm - t / 2, t, t, 'red', { r: 0.003 }), [(-xm + t / 2 + DOOR - t / 2) / 2, 0.4606, -(Z1 - t / 2)]));
  for (const x of [-0.82, -0.33]) red.push(at(box(t, t, Z1 - 0.236, 'red', { r: 0.003 }), [x, BOX.y0 - t / 2, -(Z1 + 0.236) / 2]));
  // Porte de la boîte électrique : cadre rouge à charnières sur le poteau d'angle, remplissage gris perforé,
  // fenêtres des voyants et de la poignée du sectionneur ; elle déborde du flanc −Z de 7,8 cm (+2,8 cm de poignée).
  const dr = { x0: -1.03, x1: -0.165, y0: 0.47, y1: 1.385, z0: -Z1 - 0.078 }, dz = dr.z0 + 0.039, bw = 0.04;
  red.push(at(box(bw, dr.y1 - dr.y0, 0.078, 'red', { r: 0.004 }), [dr.x0 + bw / 2, (dr.y0 + dr.y1) / 2, dz]));
  red.push(at(box(bw, dr.y1 - dr.y0, 0.078, 'red', { r: 0.004 }), [dr.x1 - bw / 2, (dr.y0 + dr.y1) / 2, dz]));
  for (const y of [dr.y0 + bw / 2, dr.y1 - bw / 2]) red.push(at(box(dr.x1 - dr.x0 - 2 * bw, bw, 0.078, 'red'), [(dr.x0 + dr.x1) / 2, y, dz]));
  const win = [[-0.48, 0.59, -0.32, 1.15], [-0.93, 0.71, -0.75, 1.29]];
  const perf = [];
  for (let x = dr.x0 + bw + 0.03; x < dr.x1 - bw - 0.02; x += 0.05) for (let y = dr.y0 + bw + 0.03; y < dr.y1 - bw - 0.02; y += 0.05) {
    if (!win.some(([a, b, c, d]) => x > a - 0.02 && x < c + 0.02 && y > b - 0.02 && y < d + 0.02)) perf.push([x, y, 0.008]);
  }
  grey.push(at(slab(api, [[dr.x0 + bw, dr.y0 + bw], [dr.x1 - bw, dr.y0 + bw], [dr.x1 - bw, dr.y1 - bw], [dr.x0 + bw, dr.y1 - bw]],
    [...win.map(([a, b, c, d]) => [[a, b], [c, b], [c, d], [a, d]]), ...perf], 0.003, 'grey'), [0, 0, dr.z0 + 0.0015]));
  for (const [a, b, c, d] of win) {
    red.push(at(box(c - a + 0.03, 0.015, 0.006, 'red'), [(a + c) / 2, b - 0.0075, dr.z0 - 0.003]), at(box(c - a + 0.03, 0.015, 0.006, 'red'), [(a + c) / 2, d + 0.0075, dr.z0 - 0.003]));
    red.push(at(box(0.015, d - b, 0.006, 'red'), [a - 0.0075, (b + d) / 2, dr.z0 - 0.003]), at(box(0.015, d - b, 0.006, 'red'), [c + 0.0075, (b + d) / 2, dr.z0 - 0.003]));
  }
  for (const y of [0.62, 1.24]) zinc.push(at(cyl(0.008, 0.08, 'zinc', { axis: 'y', seg: 14 }), [-1.038, y, -Z1 - 0.008]));
  // Capots du dessus en tôle de 5 mm : côté moteur (jusqu'à la traverse des charnières) et côté pompes,
  // lumière-poignée près du bout libre ; charnières grises sur la traverse.
  const lidW = 1.07, l1 = [-X1, HINGE - 0.019], l2 = [HINGE + 0.019, X1];
  red.push(at(plate(l1[1] - l1[0], lidW, 0.005, 'red', { cutouts: [[-(l1[1] - l1[0]) / 2 + 0.093, 0, 0.016, 0.17]] }), [(l1[0] + l1[1]) / 2, H + 0.0025, 0]));
  red.push(at(plate(l2[1] - l2[0], lidW, 0.005, 'red', { cutouts: [[(l2[1] - l2[0]) / 2 - 0.097, 0, 0.016, 0.17]] }), [(l2[0] + l2[1]) / 2, H + 0.0025, 0]));
  for (const [z, x] of [[0.235, -0.21], [0.385, -0.14]]) for (const s of [-1, 1]) {
    zinc.push(at(box(0.052, 0.003, 0.15, 'zinc'), [x, H + 0.0065, s * z]));
    zinc.push(at(cyl(0.009, 0.15, 'zinc', { axis: 'z', seg: 14 }), [HINGE, H + 0.009, s * z]));
  }
  // Charnières du panneau inférieur (nœuds soudés sur la traverse basse du bout des pompes).
  for (const s of [-1, 1]) red.push(at(ring(0.013, 0.0062, 0.04, 'red', { axis: 'z', seg: 16 }), [xm, 0.166, s * 0.44]));
  P('FMX-005-200PP', group(merged(red, 'red'), merged(zinc, 'zinc'), merged(rubber, 'rubber'), ...grey,
    at(box(0.03, 0.1, 0.028, 'black', { r: 0.006 }), [-0.215, 0.93, dr.z0 - 0.014])), [0, -0.3, 0]);

  // 29 — Groupe moteur-pompes (P069).
  P('UM-064-STM-1500-600V', unit(api), [0, 0.25, 0]);

  // 38 — Support de pompe UM-064-102P-N sous l'A10VO45K, embase serrée sur la traverse de la base par ses
  // deux étriers (page 3.5) : fût, contre-écrou, vis, plaque de tête et patin à semelle noire.
  const sx = 0.76, sz = AX.z, sTop = BASE + 0.012, seat = AX.y - PUMPS[1].h / 2;
  const ux = t / 2 + 0.0048, ub = SL.y0 - 0.0048;
  P('UM-064-102P-N', group(
    at(box(0.1, 0.012, 0.1, 'red'), [sx, BASE + 0.006, sz]),
    at(cyl(0.0315, 0.105, 'red', { axis: 'y', seg: 20 }), [sx, sTop + 0.0525, sz]),
    at(nut(0.07, 0.02, 'red'), [sx, sTop + 0.115, sz]),
    at(cyl(0.019, 0.05, 'steel', { axis: 'y', seg: 18 }), [sx, sTop + 0.15, sz]),
    at(box(0.05, 0.01, 0.1, 'red'), [sx, seat - 0.045 - 0.005, sz]),
    at(box(0.055, 0.015, 0.1, 'black', { r: 0.003 }), [sx, seat - 0.0375, sz]),
    at(box(0.055, 0.03, 0.1, 'yellow', { r: 0.004 }), [sx, seat - 0.015, sz]),
    ...[-1, 1].map((u) => tube([[sx - ux, sTop + 0.006, sz + u * 0.035], [sx - ux, ub, sz + u * 0.035], [sx + ux, ub, sz + u * 0.035], [sx + ux, sTop + 0.006, sz + u * 0.035]], 0.0048, 'steel', { sharp: true, seg: 3 })),
    ...[-1, 1].flatMap((u) => [-1, 1].map((v) => group(at(washer(0.011, 0.005, 0.002, 'steel'), [sx + v * ux, sTop + 0.001, sz + u * 0.035]), at(nut(0.015, 0.009, 'steel'), [sx + v * ux, sTop + 0.0065, sz + u * 0.035])))),
  ), [0, -0.3, 0.4]);

  // 1 — Réservoir 110 gal (page 3.6) sur ses traverses : trappes d'inspection bombées, filtres de retour
  // RTF-47 (têtes sous les capots), bouchons (raccord 2501-16-20, reniflard), indicateur de niveau sur la
  // face avant ; dessous : vannes d'aspiration 3 po et 1 1/2 po, mamelons cannelés.
  const tt = TANK.y1, tx = (TANK.x0 + TANK.x1) / 2;
  const capAt = (x, z) => [at(box(0.15, 0.025, 0.15, 'red', { r: 0.006 }), [x, tt + 0.0125, z]), at(box(0.15, 0.006, 0.15, 'darkSteel', { r: 0.006 }), [x, tt + 0.028, z]),
    S.boltSet([-1, 1].flatMap((a) => [-1, 1].map((b) => [x + a * 0.055, tt + 0.031, z + b * 0.055])), 0.008, 0.02, 'steel')];
  P('FMX-005-300TD', group(
    at(box(TANK.x1 - TANK.x0, tt - TANK.y0, TANK.w, 'red', { r: 0.012 }), [tx, (tt + TANK.y0) / 2, 0]),
    ...[0.31, 0.79].flatMap((x) => [
      at(cyl(0.18, 0.025, 'red', { axis: 'y', seg: 40 }), [x, tt + 0.0125, 0]),
      at(lathe([[0, 0], [0.155, 0], [0.155, 0.008], [0.12, 0.022], [0.06, 0.03], [0, 0.032]], 'red', { seg: 40 }), [x, tt + 0.025, 0]),
      at(bolt(0.0127, 0.02, 'steel', { washer: true }), [x, tt + 0.057, 0]),
    ]),
    ...FILTERS.flatMap(({ x, z }) => [
      at(box(0.15, 0.025, 0.15, 'red', { r: 0.006 }), [x, tt + 0.0125, z]),
      at(box(0.13, 0.093, 0.13, 'castAlu', { r: 0.008 }), [x, tt + 0.025 + 0.0465, z]),
      S.boltSet([-1, 1].flatMap((a) => [-1, 1].map((b) => [x + a * 0.05, tt + 0.118, z + b * 0.05])), 0.008, 0.016, 'steel'),
    ]),
    seated(S, 0.04, 0.07, F_IN[0], '-x'), seated(S, 0.04, 0.07, F_IN[1], 'z'),
    ...capAt(0.32, 0.39), at(cyl(0.03, 0.03, 'steel', { axis: 'y', seg: 18 }), [0.32, tt + 0.046, 0.39]),
    at(fitting(0.03, 0.05, 'steel', { elbow: true }), [0.32, tt + 0.061 + 0.007, 0.39], [0, -Math.PI / 2, 0]),
    ...capAt(0.02, -0.33), at(cyl(0.022, 0.025, 'steel', { axis: 'y', seg: 18 }), [0.02, tt + 0.0435, -0.33]),
    at(lathe([[0, 0], [0.035, 0], [0.035, 0.05], [0.028, 0.065], [0, 0.068]], 'grey', { seg: 28 }), [0.02, tt + 0.056, -0.33]),
    at(box(0.012, 0.19, 0.05, 'darkSteel', { r: 0.004 }), [TANK.x1 + 0.006, TANK.y0 + 0.24, -0.4]),
    at(box(0.004, 0.15, 0.02, 'glass'), [TANK.x1 + 0.014, TANK.y0 + 0.24, -0.4]),
    ...VALVES.flatMap(({ x, z, s, d, len, nr, vy, F }) => [
      at(cyl(nr, 0.05, 'steel', { axis: 'y', seg: 20 }), [x, TANK.y0 - 0.025, z]),
      at(group(at(S.ballValve(s, 'brass'), [0, 0, 0], [0, 0, -Math.PI / 2])), [x, vy, z], [0, Math.PI / 2, 0]),
      seated(S, d, len, F, '-y'),
    ]),
  ), [0, 0.7, 0]);

  // 15 — Collecteur de retour (alu) dressé sur sa platine : drains des pompes sur la face −Z, drain de la
  // console sur la face +Z, sortie vers le réservoir dessus.
  P('UM-064-600PP', group(
    at(box(COL.x1 - COL.x0, COL.y1 - COL.y0, COL.z1 - COL.z0, 'castAlu', { r: 0.004 }), [cx, (COL.y0 + COL.y1) / 2, cz]),
    ...[0.6, 0.66, 0.72].map((y) => seated(S, 0.02, 0.04, [cx, y, COL.z0], '-z')),
    seated(S, 0.024, 0.04, [cx, 0.62, COL.z1], 'z'), seated(S, 0.024, 0.045, [cx, COL.y1, cz], 'y'),
  ), [0, 0, 0.4]);
  // 22 — Vanne de démarrage : bloc GAI contre le collecteur, cartouche DTDA-MHN et bobine dessous ;
  // 23 — raccords dessus, 24 — coude vers le pilotage de l'A11VO130.
  P('DTDA-MHN-GAI', group(
    at(box(0.05, GAI.y1 - GAI.y0, 0.05, 'zinc', { r: 0.003 }), [GAI.x, (GAI.y0 + GAI.y1) / 2, GAI.z]),
    at(cyl(0.011, 0.05, 'steel', { axis: 'y', seg: 16 }), [GAI.x, GAI.y0 - 0.025, GAI.z]),
    at(cyl(0.022, 0.034, 'black', { axis: 'y', seg: 20 }), [GAI.x, GAI.y0 - 0.025, GAI.z]),
  ), [-0.2, 0, 0.4]);
  each(P, '6400-6-6', [-0.0125, 0.0125].map((dz2) => seated(S, 0.016, 0.035, [GAI.x, GAI.y1, GAI.z + dz2], 'y')), [-0.2, 0.2, 0.4]);
  P('6500-06-06', at(fitting(0.016, 0.04, 'steel', { elbow: true }), GAI_ELBOW, [0, Math.PI, 0]), [-0.2, 0.3, 0.4]);

  // 30 — Boîte électrique Hoffman (porte vers −Z) sur son berceau, voyants et poignée du sectionneur derrière
  // les fenêtres de la porte du cadre.
  const bz = BOX.z1 + BOX.d / 2, by = BOX.y0 + BOX.h / 2, door = BOX.z1 - 0.008;
  P('A30HS2412GQRLP', group(
    at(enclosure(BOX.w, BOX.h, BOX.d, 'grey'), [BOX.x, by, bz], [0, Math.PI, 0]),
    at(box(0.06, 0.16, 0.025, 'black', { r: 0.008 }), [-0.84, 1.1, door - 0.0125]),
    at(box(0.018, 0.1, 0.02, 'lampRed', { r: 0.004 }), [-0.84, 1.13, door - 0.035]),
    ...[0.98, 0.9, 0.82].map((y, i) => at(cyl(0.012, 0.02, ['lampRed', 'lamp', 'lampAmber'][i], { axis: 'z', seg: 18 }), [-0.4, y, door - 0.01])),
    at(cyl(0.012, 0.02, 'black', { axis: 'z', seg: 18 }), [-0.4, 0.7, door - 0.01]),
  ), [0, 0.3, -0.5]);

  // 18 — Transformateur contre le flanc −Z, sous la patte du cadre ; 13 — adaptateur (plaque grise à lumière)
  // côté intérieur, vissé à la patte par 14 ; transformateur vissé sur l'adaptateur par 35 et 36 ; 11 — rondelles.
  const tr = { x0: -0.05, x1: 0.19, y0: 0.24, y1: 0.62, z0: -0.535, z1: -0.335 };
  P('DX3000', group(
    at(box(tr.x1 - tr.x0, tr.y1 - tr.y0, tr.z1 - tr.z0, 'lightGrey', { r: 0.008 }), [(tr.x0 + tr.x1) / 2, (tr.y0 + tr.y1) / 2, (tr.z0 + tr.z1) / 2]),
    at(box(tr.x1 - tr.x0 + 0.01, 0.025, tr.z1 - tr.z0 + 0.005, 'lightGrey', { r: 0.006 }), [(tr.x0 + tr.x1) / 2, tr.y1 + 0.0125, (tr.z0 + tr.z1 - 0.005) / 2]),
    ...[0.03, 0.11].map((x) => at(box(0.04, 0.025, 0.006, 'lightGrey'), [x, 0.222, tr.z1 - 0.003])),
  ), [0, 0, -0.5]);
  P('FMC-036-205P', at(slab(api, [[-0.005, 0.195], [0.145, 0.195], [0.145, 0.675], [-0.005, 0.675]], [[[0.055, 0.32], [0.085, 0.32], [0.085, 0.54], [0.055, 0.54]],
    [0.03, 0.222, 0.0055], [0.11, 0.222, 0.0055], ...[0.01, 0.05, 0.09, 0.13].map((x) => [x, 0.663, 0.0055])], 0.006, 'grey'), [0, 0, -0.33]), [0, 0, -0.3]);
  const tb4 = [0.01, 0.05, 0.09, 0.13].map((x) => [x, 0.663, -0.321]);
  each(P, 'B375-1250', tb4.map((p) => at(bolt(0.0095, 0.0318, 'steel', { axis: 'z' }), add(p, [0, 0, 0.002]))), [0, 0, 0.2]);
  const tb2 = [0.03, 0.11].map((x) => [x, 0.222]);
  each(P, 'B375-1000', tb2.map(([x, y]) => at(bolt(0.0095, 0.0254, 'steel', { axis: '-z' }), [x, y, tr.z1 - 0.008])), [0, 0, -0.35]);
  each(P, 'NC375', tb2.map(([x, y]) => at(nut(0.015, 0.009, 'steel', { axis: 'z' }), [x, y, -0.3205])), [0, 0, -0.2]);
  // Pompe à main au poteau d'angle côté moteur (flanc +Z) : 2 — Fill-Rite FR150 (corps rouge, levier à
  // poignée en D, colonne de sortie 19 à 21), 39 — équerre, 40 — étrier autour du poteau, 41 — écrous.
  const hp = { x: -0.965, y: 0.849, z: 0.43 };
  P('FR150', group(
    at(cyl(0.075, 0.09, 'red', { axis: 'z', seg: 36 }), [hp.x, hp.y, hp.z]),
    at(cyl(0.022, 0.02, 'black', { axis: 'z', seg: 18 }), [hp.x, hp.y, hp.z + 0.055]),
    at(box(0.022, 0.34, 0.012, 'steel', { r: 0.003 }), [hp.x, hp.y + 0.17, hp.z + 0.071]),
    at(box(0.08, 0.012, 0.012, 'black', { r: 0.004 }), [hp.x, hp.y + 0.346, hp.z + 0.071]),
    ...[-1, 1].map((s) => at(box(0.012, 0.035, 0.012, 'black', { r: 0.004 }), [hp.x + s * 0.034, hp.y + 0.3225, hp.z + 0.071])),
    at(cyl(0.012, 0.09, 'steel', { axis: 'y', seg: 14 }), [hp.x, hp.y - 0.075 - 0.045, hp.z]),
  ), [-0.2, 0, 0.35]);
  const shelf = { x0: -xm + t / 2, x1: -0.885, y: hp.y - 0.075 - 0.003, z0: 0.385, z1: Z1 - t - 0.006 };
  P('FBRA-002-204PP', group(
    at(box(0.21, 0.11, 0.006, 'red'), [-0.995, 0.715, Z1 - t - 0.003]),
    at(plate(shelf.x1 - shelf.x0, shelf.z1 - shelf.z0, 0.006, 'red', { holes: [[hp.x - (shelf.x0 + shelf.x1) / 2, hp.z - (shelf.z0 + shelf.z1) / 2, 0.014]] }),
      [(shelf.x0 + shelf.x1) / 2, shelf.y, (shelf.z0 + shelf.z1) / 2]),
  ), [-0.1, 0, 0.3]);
  const uA = -X1 - 0.0048, uB = -X1 + t + 0.0048, uy = 0.715, uz = Z1 - t - 0.008;
  P('FBRA-002-213P', tube([[uA, uy, uz - 0.014], [uA, uy, Z1 + 0.0048], [uB, uy, Z1 + 0.0048], [uB, uy, uz - 0.014]], 0.0048, 'steel', { sharp: true, seg: 3 }), [-0.2, 0, 0.35]);
  each(P, 'LN375NC', [uA, uB].map((x) => at(nut(0.015, 0.009, 'steel', { axis: 'z' }), [x, uy, uz - 0.0045])), [-0.25, 0, 0.35]);
  const hpTop = [hp.x, hp.y + 0.075, hp.z];
  P('5404-8-12', seated(S, 0.02, 0.03, hpTop, 'y'), [0, 0.25, 0.3]);
  P('HSP-1000-4-5', at(nut(0.025, 0.072, 'steel'), add(hpTop, [0, 0.026 + 0.036, 0])), [0, 0.3, 0.3]);
  P('2404-8-8', seated(S, 0.02, 0.04, add(hpTop, [0, 0.098, 0]), 'y'), [0, 0.35, 0.3]);
  // Rondelles 3/8 (11) : sous les têtes de 14, sous les têtes et les écrous de 35 (et entre l'oreille du
  // transformateur et l'adaptateur), sous les écrous de l'étrier.
  each(P, 'W375', [
    ...tb4.map((p) => at(washer(0.011, 0.005, 0.002, 'steel', { axis: 'z' }), add(p, [0, 0, 0.001]))),
    ...tb2.flatMap(([x, y]) => [tr.z1 - 0.007, tr.z1 + 0.001, -0.326].map((z) => at(washer(0.011, 0.005, 0.002, 'steel', { axis: 'z' }), [x, y, z]))),
    ...[uA, uB].map((x) => at(washer(0.011, 0.005, 0.002, 'steel', { axis: 'z' }), [x, uy, uz + 0.001])),
  ], [0, 0, 0.3]);

  // 27 — Refroidisseurs AB-1202 superposés au-dessus du moteur (flanc +Z), axe selon X : calandre, brides,
  // bonnets, pattes noires boulonnées aux flasques du support ; colonnes de raccords entre eux.
  const co = { x0: -0.876, x1: -0.264, z: 0.36, ys: [0.853, 1.258] };
  co.ys.forEach((y, i) => P('AB-1202', group(
    at(cyl(0.0775, 0.4, 'black', { axis: 'x', seg: 32 }), [-0.57, y, co.z]),
    ...[-0.78, -0.36].map((x) => at(cyl(0.1, 0.02, 'black', { axis: 'x', seg: 32 }), [x, y, co.z])),
    ...[-0.83, -0.31].map((x) => at(box(0.08, 0.19, 0.19, 'black', { r: 0.03 }), [x, y, co.z])),
    ...[co.x0 + 0.003, co.x1 - 0.003].map((x) => at(box(0.006, 0.18, 0.28, 'black'), [x, y, 0.365])),
    ...[-0.7, -0.44].map((x) => at(cyl(0.022, 0.02, 'black', { axis: 'y', seg: 18 }), [x, y + (i ? -0.0875 : 0.0875), co.z])),
    ...(i ? [] : [-0.7, -0.44].flatMap((x) => [
      at(cyl(0.012, 0.211, 'brass', { axis: 'y', seg: 16 }), [x, 1.0555, co.z]),
      ...[0.97, 1.0555, 1.14].map((yy) => at(nut(0.032, 0.02, 'brass'), [x, yy, co.z])),
    ])),
  ), [0, 0, 0.5]));
  // 28 — Support : flasques à lumières (bord plié contre le longeron du haut), cornières à lumières du haut et
  // du bas qui portent la plaque 12 ; 34 — vis des pattes, 16 — rondelles, 17 — écrous (deux à double écrou).
  const fl = (x) => at(slab(api, [[0.165, 0.72], [0.515, 0.72], [0.515, H - t], [0.165, H - t]], [0.25, 0.495].map((z) => [[z - 0.005, 0.78], [z + 0.005, 0.78], [z + 0.005, 1.33], [z - 0.005, 1.33]]), 0.008, 'red'), [x, 0, 0], [0, -Math.PI / 2, 0]);
  P('FMX-005-203PP', group(
    fl(co.x0 - 0.004), fl(co.x1 + 0.004),
    at(box(0.048, H - t - 0.72, 0.006, 'red'), [co.x0 + 0.024, (0.72 + H - t) / 2, 0.512]),
    at(box(0.048, H - t - 0.72, 0.006, 'red'), [co.x1 - 0.024, (0.72 + H - t) / 2, 0.512]),
    ...[1.315, 1.07].flatMap((y) => [
      at(slab(api, [[co.x0, y - 0.025], [co.x1, y - 0.025], [co.x1, y + 0.025], [co.x0, y + 0.025]], [[[-0.735, y - 0.007], [-0.435, y - 0.007], [-0.435, y + 0.007], [-0.735, y + 0.007]]], 0.006, 'red'), [0, 0, 0.217]),
      at(box(co.x1 - co.x0, 0.006, 0.034, 'red'), [(co.x0 + co.x1) / 2, y + 0.022, 0.197]),
    ]),
  ), [0, 0, 0.35]);
  const cb = co.ys.flatMap((y) => [co.x0, co.x1].flatMap((x) => [0.25, 0.495].map((z) => [x, y, z])));
  const sgn = (x) => (x < -0.6 ? 1 : -1); // tête côté refroidisseur
  each(P, 'B312-1250', cb.map(([x, y, z]) => at(bolt(0.0079, 0.032, 'steel', { axis: sgn(x) > 0 ? 'x' : '-x' }), [x + sgn(x) * 0.0076, y, z])), [0, 0, 0.5]);
  const out8 = cb.map(([x, y, z]) => [x - sgn(x) * 0.008, y, z]);
  each(P, 'W312', [
    ...cb.map(([x, y, z]) => at(washer(0.009, 0.004, 0.0016, 'steel', { axis: 'x' }), [x + sgn(x) * 0.0068, y, z])),
    ...out8.map(([x, y, z]) => at(washer(0.009, 0.004, 0.0016, 'steel', { axis: 'x' }), [x - sgn(x) * 0.0008, y, z])),
    ...out8.slice(0, 2).map(([x, y, z]) => at(washer(0.009, 0.004, 0.0016, 'steel', { axis: 'x' }), [x - sgn(x) * 0.0104, y, z])),
  ], [0, 0, 0.45]);
  each(P, 'LN312NC', [
    ...out8.map(([x, y, z]) => at(nut(0.013, 0.008, 'steel', { axis: 'x' }), [x - sgn(x) * 0.0056, y, z])),
    ...out8.slice(0, 2).map(([x, y, z]) => at(nut(0.013, 0.008, 'steel', { axis: 'x' }), [x - sgn(x) * 0.0152, y, z])),
  ], [0, 0, 0.4]);
  // 12 — Plaque grise ajourée « UM » derrière les refroidisseurs, vissée aux cornières du support (32 en haut,
  // 33 dans les lumières des jambes) avec 31 — rondelles sous les têtes et en entretoise.
  const um = { x0: -0.76, y0: 0.97, z: 0.2255 };
  const umOut = [[0, 0], [0.09, 0], [0.09, 0.15], ...arc(0.175, 0.15, 0.085, Math.PI, 0, 8), [0.26, 0], [0.35, 0], [0.35, 0.31], [0.33, 0.37], [0.27, 0.37], [0.25, 0.33],
    [0.1, 0.33], [0.08, 0.37], [0.02, 0.37], [0, 0.31]].map(([u, v]) => [um.x0 + u, um.y0 + v]);
  const slot = (u, v, w, h) => [[um.x0 + u - w / 2, um.y0 + v - h / 2], [um.x0 + u + w / 2, um.y0 + v - h / 2], [um.x0 + u + w / 2, um.y0 + v + h / 2], [um.x0 + u - w / 2, um.y0 + v + h / 2]];
  P('FMC-036-203P', at(slab(api, umOut, [...letters(um.x0 + 0.175, um.y0 + 0.282, 0.06), slot(0.05, 0.345, 0.04, 0.012), slot(0.3, 0.345, 0.04, 0.012),
    slot(0.045, 0.1, 0.012, 0.11), slot(0.305, 0.1, 0.012, 0.11)], 0.006, 'grey'), [0, 0, um.z]), [0, 0.1, 0.45]);
  const ub3 = [0.05, 0.3].map((u) => [um.x0 + u, um.y0 + 0.345]), ub1 = [0.045, 0.305].map((u) => [um.x0 + u, um.y0 + 0.1]);
  each(P, 'W500', [...ub3, ...ub1].flatMap(([x, y]) => [um.z + 0.0042, um.z - 0.0042].map((z) => at(washer(0.0135, 0.0068, 0.0025, 'steel', { axis: 'z' }), [x, y, z]))), [0, 0, 0.4]);
  each(P, 'B500-3000', ub3.map(([x, y]) => at(bolt(0.0127, 0.076, 'steel', { axis: 'z' }), [x, y, um.z + 0.0055])), [0, 0, 0.5]);
  each(P, 'B500-1250', ub1.map(([x, y]) => at(bolt(0.0127, 0.0318, 'steel', { axis: 'z' }), [x, y, um.z + 0.0055])), [0, 0, 0.5]);

  // 3 — Panneau grillagé inférieur et 7 — supérieur, fermés entre les poteaux d'angle du bout des pompes :
  // cadre en tube 1 po, barres intérieures, grillage ; bandes grises d'appui (inférieur) ; fenêtres carrées
  // près des nœuds (supérieur). 8 — axes du pied (sur la base) et 10 — axes entre panneaux, selon Z ;
  // 9 — goupilles fendues aux bouts ; 4 — broches de verrouillage au travers des poteaux d'angle.
  const pw = 1.01, b = IN;
  const panel = (y0, y1, mid) => {
    const h = y1 - y0, yc = (y0 + y1) / 2, fr = [
      ...[-1, 1].map((s) => at(box(b, h, b, 'red', { r: 0.003 }), [xm, yc, s * (pw / 2 - b / 2)])),
      ...[y0 + b / 2, y1 - b / 2].map((y) => at(box(b, b, pw - 2 * b, 'red', { r: 0.003 }), [xm, y, 0])),
      ...[-1, 1].map((s) => at(box(b * 0.8, h - 2 * b, b * 0.8, 'red'), [xm, yc, s * 0.25])),
      at(box(b * 0.8, b * 0.8, 0.5 - b * 0.8, 'red'), [xm, mid, 0]),
    ];
    return { fr, grid: at(grid(S, pw - 2 * b, h - 2 * b, 0.035, 'steel', 0.0018), [xm - 0.0122, yc, 0], [0, Math.PI / 2, 0]) };
  };
  const lo = panel(0.18, 0.72, 0.45), up = panel(0.72, 1.2, 0.96);
  P('UM-064-165TD', group(merged([...lo.fr, ...[-1, 1].map((s) => at(ring(0.013, 0.0062, 0.04, 'red', { axis: 'z', seg: 16 }), [xm, 0.166, s * 0.48])),
    ...[-1, 1].map((s) => at(ring(0.01, 0.0062, 0.04, 'red', { axis: 'z', seg: 16 }), [xm - b / 2 - 0.0102, 0.72, s * 0.44]))], 'red'),
  lo.grid, ...[-1, 1].map((s) => at(box(0.004, 0.54 - 2 * b, 0.03, 'grey'), [xm + b * 0.4 + 0.002, 0.45, s * 0.25]))), [0.4, 0, 0]);
  const wins = [-1, 1].flatMap((s) => [
    at(box(0.006, 0.11, 0.012, 'red'), [xm + b / 2 + 0.003, 0.835, s * 0.386 - 0.049]), at(box(0.006, 0.11, 0.012, 'red'), [xm + b / 2 + 0.003, 0.835, s * 0.386 + 0.049]),
    at(box(0.006, 0.012, 0.086, 'red'), [xm + b / 2 + 0.003, 0.786, s * 0.386]), at(box(0.006, 0.012, 0.086, 'red'), [xm + b / 2 + 0.003, 0.884, s * 0.386]),
  ]);
  P('UM-064-235TD', group(merged([...up.fr, ...wins, ...[-1, 1].map((s) => at(ring(0.01, 0.0062, 0.04, 'red', { axis: 'z', seg: 16 }), [xm - b / 2 - 0.0102, 0.72, s * 0.48]))], 'red'),
    up.grid, ...[-1, 1].map((s) => at(box(0.004, 0.086, 0.035, 'darkSteel', { r: 0.002 }), [xm + b / 2 + 0.004, 0.835, s * 0.386]))), [0.55, 0.1, 0]);
  const pins = [[xm, 0.166], [xm - b / 2 - 0.0102, 0.72]];
  each(P, 'UM-064-TD76', [-1, 1].map((s) => at(cyl(0.006, 0.094, 'steel', { axis: 'z', seg: 12 }), [pins[0][0], pins[0][1], s * 0.46])), [0.6, 0, 0]);
  each(P, 'UM-064-TD77', [-1, 1].map((s) => at(cyl(0.006, 0.094, 'steel', { axis: 'z', seg: 12 }), [pins[1][0], pins[1][1], s * 0.46])), [0.6, 0, 0]);
  each(P, 'CTP187-1250', pins.flatMap(([x, y]) => [-1, 1].flatMap((s) => [0.4155, 0.5045].map((z) => at(torus(0.0075, 0.0015, 'steel', { axis: 'z' }), [x, y, s * z])))), [0.7, 0, 0]);
  each(P, 'UM-064-TD29', [0.32, 0.58, 0.86, 1.1].flatMap((y) => [-1, 1].map((s) => group(
    at(cyl(0.007, 0.08, 'steel', { axis: 'z', seg: 12 }), [xm, y, s * (Z1 - 0.04)]),
    at(cyl(0.011, 0.003, 'steel', { axis: 'z', seg: 14 }), [xm, y, s * (Z1 + 0.0015)]),
    at(torus(0.014, 0.0025, 'zinc', { axis: 'z' }), [xm, y - 0.018, s * (Z1 + 0.0025)]),
  ))), [0.5, 0, 0]);

  // Boyaux du groupe (non repérés au manuel) : aspirations (vannes du réservoir → pompes, embouts serrés
  // sur les mamelons cannelés), drains des carters → collecteur, collecteur → filtre n° 1, pilotage
  // (vanne de démarrage → bride de refoulement de l'A11VO130).
  const out = (E, d, a = 0.03, b2 = 0.06) => [E, add(E, d, a), add(E, d, b2)];
  const into = (...args) => out(...args).reverse();
  // Boyau emmanché sur deux mamelons (bout E, sortie n, rayon du mamelon rm) : il recouvre chaque mamelon
  // sur o (2,8 cm par défaut), collier serré dessus.
  const clamp = (A, B, mid, r) => {
    const o = (X) => X.o ?? 0.028;
    const pts = [add(A.E, A.n, -o(A)), ...out(A.E, A.n, A.a ?? 0.03, A.b ?? 0.05), ...mid, ...into(B.E, B.n, B.a ?? 0.03, B.b ?? 0.05), add(B.E, B.n, -o(B))];
    const h = tube(pts, r, 'hose', { ends: 'none', seg: 56, radial: 24 });
    const ends = merged([A, B].map((X) => {
      const { E, n, rm } = X, g = at(ring(r + 0.004, rm, o(X), 'steel', { seg: 24 }), add(E, n, -o(X) / 2));
      g.quaternion.setFromUnitVectors(new api.THREE.Vector3(0, 1, 0), new api.THREE.Vector3(...n));
      return g;
    }), 'steel');
    ends.userData.isTubeEnds = true;
    h.add(ends);
    return h;
  };
  const [V0, V1, V2] = VALVES, [S0, S1, S2] = SUC;
  api.add(group(
    clamp({ E: V0.p, n: [0, -1, 0], rm: 0.0345, a: 0.05, b: 0.09 }, { E: S0.p, n: S0.n, rm: 0.0445, a: 0.05, b: 0.09 },
      [[0.505, 0.31, -0.245], [0.42, 0.23, -0.225], [0.29, 0.21, -0.195], [0.18, 0.225, -0.172]], S0.r),
    clamp({ E: S1.p, n: S1.n, rm: 0.0152 }, { E: V1.p, n: [0, -1, 0], rm: 0.0193 }, [[0.72, AX.y + 0.012, -0.215], [0.72, 0.5, -0.243]], S1.r),
    clamp({ E: S2.p, n: S2.n, rm: 0.0145, a: 0.015, b: 0.025, o: 0.016 }, { E: V2.p, n: [0, -1, 0], rm: 0.0193, a: 0.015, b: 0.025 }, [], S2.r),
    hose([...out(COL_DR[0], [0, 0, -1], 0.03, 0.05), [-0.05, 0.63, 0.31], [0.15, 0.665, 0.17], [0.27, 0.7, 0.07], ...into(DRAINS[0].p, DRAINS[0].n, 0.03, 0.06)], 0.014),
    hose([...out(COL_DR[1], [0, 0, -1], 0.03, 0.05), [0.0, 0.7, 0.33], [0.35, 0.715, 0.3], [0.6, 0.7, 0.12], ...into(DRAINS[1].p, DRAINS[1].n, 0.03, 0.06)], 0.012),
    hose([...out(COL_DR[2], [0, 0, -1], 0.03, 0.05), [0.0, 0.75, 0.37], [0.4, 0.765, 0.37], [0.8, 0.7, 0.15], ...into(DRAINS[2].p, DRAINS[2].n, 0.03, 0.06)], 0.012),
    hose([...out(COL_TOP, [0, 1, 0], 0.04, 0.08), [-0.2, 1.17, 0.3], [-0.23, 1.29, 0.0], ...into(F_TIP[0], [-1, 0, 0], 0.04, 0.08)], 0.016),
    hose([...out(GAI_OUT, [0, 0, -1], 0.03, 0.05), [-0.21, 0.8, 0.3], [-0.12, 0.745, 0.25], [0.1, 0.72, 0.24], [0.34, 0.66, 0.2], ...into(PILOT, [0, 1, 0], 0.03, 0.06)], 0.009),
  ));
  return { view: { dir: [1, 0.55, 0.9] } };
}

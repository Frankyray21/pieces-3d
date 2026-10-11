// P384 — Coffret DCU CX034726 rév. 0 (page 384), repère 4 de la trousse de
// télésurveillance P382 : coffret électrique en acier peint gris clair
// 12 × 10 × 6 po (1, « CUT-OUT » : coffret percé, porte à charnière piano à
// gauche et deux grenouillères à droite, quatre pattes de fixation au dos,
// contre-plaque intérieure blanche sur entretoises) renfermant l'ordinateur
// de collecte de données IP67 (2, boîtier fonte noire à ailettes, trois
// oreilles fixées par 3 vis CHC M6 × 8 (24) et rondelles fendues 1/4 (25)).
// Sur son embase X1 : connecteur 23 voies (3) à 5 contacts femelles dorés (4) ;
// sur la prise X8 (SMA) : cordon d'antenne SMA → N 12 po (5), traversée N
// femelle au milieu du fond du coffret. Sous le coffret, deux presse-étoupes
// 3/8 (17) avec joint (18) et contre-écrou nylon (19) : à gauche le câble
// SJOOW 2 × 16 AWG de 15 po (22, alimentation) terminé par l'embase Deutsch
// 2 voies à adaptateur thermo (6, PJ552), verrou (7) et 2 broches (10), sous
// gaine thermo 1/2 po de 1,5 po (20) ; à droite le câble CAN J1939/11 de 24 po
// (23) terminé par l'embase 3 voies (8, PJ552A), verrou vert (9), 3 broches
// (10), gaine thermo 3/4 po de 1,5 po (21). Dans le coffret, le câble CAN
// aboutit au Y CAN 3 voies (11) : fiche 3 voies (13) à verrou bleu (15) côté
// câble, fiche (13) à verrou orange (14) côté ordinateur (ses fils vers X1
// sont dessinés avec elle), bouchon de terminaison 120 Ω (12) sur
// la troisième branche ; 3 douilles taille 16 (16) par fiche. Étiquette
// « DCU — DATA COLLECTION UNIT » (26) sur la porte.
// Lignes en pouces (20 à 23, quantité = longueur) : un objet par ligne, de la
// longueur de la liste (câbles tracés et ajustés par cableFit) ; check-models
// --qty attend 15 et 24 objets pour 22 et 23 (quantités entières) : voir le
// rapport du coordinateur (qty3d: 1 à ajouter aux données).
// Tracés intérieurs, Y CAN et fils vers X1 estimés (non dessinés au manuel).
// Repère : origine au centre de la face arrière du coffret (face d'appui sur
// le support P382 repère 3), Y vers le haut, +Z vers la porte, X vers la
// droite vu de face (grenouillères à +X). Coffret x ±0.127, y ±0.1525,
// z 0 → 0.1525 ; trous des pattes Ø 7 mm en (±0.089, ±0.165, z 0) ;
// encombrement 0.26 (X) × 0.65 (Y, câbles et connecteurs compris, jusqu'à
// y −0.30) × 0.155 (Z) m.
import { IN, kit, cableFit } from './_porteur.js';

export const DCU = {
  W: 10 * IN, H: 12 * IN, D: 6 * IN, // coffret (X, Y, Z)
  tabs: [[-0.089, 0.165], [0.089, 0.165], [-0.089, -0.165], [0.089, -0.165]], // trous des pattes (z = 0)
  nJack: [0, -6 * IN - 0.024, 0.075], // bout de la traversée N femelle (sous le fond), axe −Y
};

export default function P384(api) {
  const { THREE, S } = api;
  const { box, lathe, merged, group, at, tube } = S;
  const K = kit(api);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  // Pavé sans arrondi (12 triangles) pour les petites pièces.
  const pb = (w, h, d, mat, { pos = [0, 0, 0] } = {}) => merged([at(new THREE.Mesh(new THREE.BoxGeometry(w, h, d)), pos)], mat);
  // Cylindre simple (axe Y, 4 × seg triangles) pour les petites pièces rondes.
  const cyl = (r, len, mat, { seg = 8, pos = [0, 0, 0] } = {}) => merged([at(new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg, 1)), pos)], mat);
  const { W, H, D } = DCU;
  const HY = H / 2;
  const ZG = 0.075; // axe des presse-étoupes (profondeur)
  const GX = 0.062; // presse-étoupes à x = ±GX
  const YIN = -HY + 0.0025; // face intérieure du fond
  const EX = 0.32; // éclaté de l'ordinateur (+Z)
  const EY = 0.12; // éclaté du Y CAN (+Z, et +X de EYX)
  const EYX = 0.24;

  // --------------------------------------------------------- 1 — coffret percé
  const grey = [
    box(W, H, 0.129, 'lightGrey', { r: 0.003, pos: [0, 0, 0.0645] }),
    pb(W - 0.003, H - 0.003, 0.023, 'lightGrey', { pos: [0, 0, 0.1295 + 0.0115] }),
  ];
  // Pattes de fixation au dos (haut et bas), percées.
  for (const [x, y] of DCU.tabs) grey.push(at(K.plate(0.036, 0.034, 0.0025, 'lightGrey', { holes: [[0, 0, 0.0035]], seg: 5 }), [x, y, 0.00125], [Math.PI / 2, 0, 0]));
  const steel = [
    cyl(0.0035, H * 0.92, 'steel', { seg: 6, pos: [-W / 2 - 0.0012, 0, 0.1295] }), // charnière piano
  ];
  for (const sy of [-1, 1]) {
    const y = sy * 0.095;
    steel.push(box(0.007, 0.03, 0.016, 'steel', { pos: [W / 2 + 0.0035, y, 0.118] }));
    steel.push(box(0.009, 0.018, 0.006, 'steel', { pos: [W / 2 + 0.004, y, 0.136], rot: [0, 0, 0] }));
  }
  // Contre-plaque intérieure sur 4 entretoises, vis de fixation.
  const zinc = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    zinc.push(at(cyl(0.0045, 0.015, 'zinc', { seg: 6 }), [sx * 0.095, sy * 0.122, 0.01], [Math.PI / 2, 0, 0])); // entretoise et tête de vis
  }
  P('1', group(merged(grey, 'lightGrey'), merged(steel, 'steel'), merged(zinc, 'zinc'),
    pb(0.214, 0.27, 0.0025, 'white', { pos: [0, 0, 0.01325] })), [0, 0, 0]);

  // --------------------------------------------------- 2 — ordinateur DCU IP67
  const ZB = 0.0145; // dos de l'ordinateur (sur la contre-plaque)
  const ZF = ZB + 0.04; // face avant du corps
  const ears = [[-0.087, 0.102], [-0.087, -0.104], [0.088, 0.001]];
  const cast = [pb(0.166, 0.231, 0.04, 'blackCast', { pos: [0, -0.002, ZB + 0.02] })];
  for (const [x, y] of ears) {
    cast.push(at(cyl(0.0085, 0.006, 'blackCast', { seg: 6 }), [x, y, ZB + 0.003], [Math.PI / 2, 0, 0]));
    cast.push(box(0.016, 0.012, 0.006, 'blackCast', { pos: [x - Math.sign(x) * 0.008, y, ZB + 0.003] }));
  }
  // Ailettes verticales au centre, pavé lisse à droite, platine ronde et sa langue.
  for (let i = 0; i < 5; i++) cast.push(box(0.004, 0.218, 0.006, 'blackCast', { pos: [-0.019 + i * 0.013, -0.002, ZF + 0.003] }));
  cast.push(pb(0.03, 0.19, 0.004, 'blackCast', { pos: [0.062, -0.002, ZF + 0.002] }));
  cast.push(at(cyl(0.04, 0.008, 'blackCast', { seg: 12 }), [0.006, 0, ZF + 0.006], [Math.PI / 2, 0, 0]));
  cast.push(pb(0.043, 0.06, 0.008, 'blackCast', { pos: [0.006, -0.05, ZF + 0.006] }));
  // Panneau des connecteurs à gauche, cadre des trois prises SMA.
  cast.push(pb(0.049, 0.181, 0.004, 'blackCast', { pos: [-0.0465, -0.0015, ZF + 0.002] }));
  cast.push(box(0.016, 0.048, 0.004, 'blackCast', { pos: [-0.0143, 0.062, ZF + 0.002] }));
  const plast = [pb(0.03, 0.056, 0.01, 'plastic', { pos: [-0.0475, 0.0556, ZF + 0.009] })]; // embase X1
  for (const [x, y] of [[-0.037, -0.041], [-0.058, -0.057], [-0.037, -0.076]]) plast.push(pb(0.012, 0.01, 0.004, 'plastic', { pos: [x, y, ZF + 0.004] }));
  const rub = [box(0.014, 0.012, 0.004, 'rubber', { pos: [-0.058, 0.0086, ZF + 0.005] }), at(cyl(0.006, 0.006, 'rubber', { seg: 6 }), [-0.059, -0.081, ZF + 0.006], [Math.PI / 2, 0, 0])];
  const brass = [];
  for (const y of [0.077, 0.062, 0.047]) {
    brass.push(at(cyl(0.0032, 0.007, 'brass', { seg: 6 }), [-0.0143, y, ZF + 0.01], [Math.PI / 2, 0, 0]));
  }
  const cSteel = [at(cyl(0.0075, 0.01, 'steel', { seg: 8 }), [-0.058, -0.0235, ZF + 0.007], [Math.PI / 2, 0, 0])];
  P('2', group(merged(cast, 'blackCast'), merged(plast, 'plastic'), merged(rub, 'rubber'), merged(brass, 'brass'), merged(cSteel, 'steel')), [0, 0, EX]);

  // 24 — vis CHC M6 × 8 (tête à six-pans creux), 25 — rondelles fendues 1/4.
  const shcs = () => lathe([[0, -0.008], [0.003, -0.008], [0.003, 0], [0.005, 0], [0.005, 0.0055], [0.0026, 0.006], [0.0026, 0.003], [0, 0.003]], 'blackOxide', { seg: 6 });
  for (const [x, y] of ears) {
    P('25', K.lock(0.00635, 'zinc', { pos: [x, y, ZB + 0.006], axis: 'z' }), [0, 0, EX + 0.03]);
    P('24', K.place(shcs(), { pos: [x, y, ZB + 0.0076], axis: 'z' }), [0, 0, EX + 0.055]);
  }

  // ------------------------------------- 3 — connecteur 23 voies sur X1, 4 — contacts
  const X1 = [-0.0475, 0.0556];
  const Z3 = [ZF + 0.0095, ZF + 0.0395]; // face d'accouplement, arrière
  const c3 = [
    pb(0.036, 0.064, 0.03, 'plastic', { pos: [X1[0], X1[1], (Z3[0] + Z3[1]) / 2] }),
    box(0.03, 0.006, 0.02, 'plastic', { pos: [X1[0], X1[1] + 0.035, Z3[0] + 0.014] }), // levier de verrouillage
  ];
  P('3', merged(c3, 'plastic'), [0, 0, EX + 0.075]);
  for (const [dx, dy] of [[-0.008, 0.02], [0, 0.02], [0.008, 0.02], [-0.008, -0.01], [0, -0.01]]) {
    P('4', at(cyl(0.0011, 0.0045, 'brass', { seg: 4 }), [X1[0] + dx, X1[1] + dy, Z3[1] + 0.002], [Math.PI / 2, 0, 0]), [0, 0, EX + 0.11]);
  }

  // ---------------------------------- 5 — cordon d'antenne SMA → N 12 po (X8)
  const SMA = [-0.0143, 0.077];
  const zs = ZF + 0.006;
  const ant = cableFit(THREE, [
    [SMA[0], SMA[1], zs + 0.014], [SMA[0], SMA[1], zs + 0.032], [-0.012, 0.03, 0.105], [-0.008, -0.05, 0.105],
    [0, -0.115, 0.088], [0, -0.13, 0.078], [0, YIN + 0.012, ZG],
  ], 12 * IN - 0.035, { move: [3], dir: [-0.8, 0, 0.6], max: 0.06 });
  const n5 = [
    K.hex(0.008, 0.008, 'steel', { pos: [SMA[0], SMA[1], zs + 0.004], axis: 'z' }), // écrou SMA
    at(cyl(0.0032, 0.006, 'steel', { seg: 6 }), [SMA[0], SMA[1], zs + 0.011], [Math.PI / 2, 0, 0]),
    // Traversée N femelle : corps intérieur, collerette, écrou et fût fileté extérieur.
    cyl(0.0055, 0.01, 'steel', { seg: 6, pos: [0, YIN + 0.006, ZG] }),
    K.hex(0.019, 0.004, 'steel', { pos: [0, YIN + 0.002, ZG] }),
    K.hex(0.022, 0.005, 'steel', { pos: [0, -HY - 0.0025, ZG] }),
    lathe([[0, -HY - 0.024], [0.007, -HY - 0.024], [0.008, -HY - 0.022], [0.008, -HY - 0.005], [0, -HY - 0.005]], 'steel', { seg: 6 }),
  ];
  P('5', group(merged(n5, 'steel'), tube(ant.pts, 0.0025, 'black', { seg: 20, radial: 4, ends: 'none' })), [0, -0.04, 0.17]);

  // --------------------- 17, 18, 19 — presse-étoupes 3/8, joints, contre-écrous
  for (const sx of [-1, 1]) {
    const x = sx * GX;
    const gl = merged([
      lathe([[0.0042, -0.013], [0.0083, -0.013], [0.0083, 0.0025], [0.0042, 0.0025]], 'plastic', { seg: 6 }),
      at(K.hex(0.022, 0.0075, 'plastic'), [0, 0.0063, 0]),
      lathe([[0.0046, 0.01], [0.0105, 0.01], [0.0105, 0.017], [0.0055, 0.0255], [0.0046, 0.0255]], 'plastic', { seg: 6 }),
    ], 'plastic');
    P('17', K.toward(gl, [0, -1, 0], [x, -HY, ZG]), [0, -0.06, 0]);
    P('18', K.toward(K.band(0.013, 0.0085, 0, 0.0022, 'rubber', 6), [0, -1, 0], [x, -HY, ZG]), [0, -0.035, 0]);
    P('19', K.hex(0.024, 0.006, 'white', { pos: [x, YIN + 0.003, ZG] }), [0, 0.05, 0]);
  }

  // ------------- 22 / 23 — câbles ; 20 / 21 — gaines ; 6 / 8 — embases Deutsch
  const YC = -0.252; // dessus des embases (côté câble)
  const ext = (x) => [[x, YC, ZG], [x, -0.2, ZG], [x, -HY - 0.01, ZG], [x, YIN + 0.012, ZG]];
  const c22 = cableFit(THREE, [
    ...ext(-GX), [-0.075, -0.1, 0.09], [-0.08, 0.0, 0.1], [-0.06, 0.06, 0.112], [-0.052, 0.074, 0.112], [-0.052, 0.074, Z3[1] + 0.001],
  ], 15 * IN, { move: [5], dir: [-1, 0, 0], max: 0.035 });
  // Lignes en pouces (quantité = longueur) : un tronçon de 1 po par unité,
  // bout à bout le long du tracé (check-models compte un objet par unité).
  const inches = (pts, n, r, mat) => {
    const c = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q)));
    return Array.from({ length: n }, (_, i) => tube([0, 0.5, 1].map((k) => c.getPointAt((i + k) / n).toArray()), r, mat, { seg: 2, radial: 5, ends: 'none' }));
  };
  for (const t of inches(c22.pts, 15, 0.0045, 'rubber')) P('22', t, [0, 0, 0]);

  const YK = [0.055, -0.035, 0.115]; // moyeu du Y CAN
  const c23 = cableFit(THREE, [
    ...ext(GX), [0.09, -0.11, 0.085], [0.108, -0.02, 0.09], [0.105, 0.115, 0.1], [0.06, 0.132, 0.11],
    [0.055, 0.07, 0.115], [YK[0], YK[1] + 0.077, YK[2]],
  ], 24 * IN, { move: [7], dir: [-1, 0, 0], max: 0.12 });
  for (const t of inches(c23.pts, 24, 0.0042, 'black')) P('23', t, [0, 0, 0]);

  // Gaines thermo (longueur 1,5 po) sur le raccord câble / adaptateur.
  const shrink = (r0, r1, len) => lathe([[r0 - 0.0007, 0], [r0, 0], [r0, len - 0.011], [r1, len - 0.006], [r1, len], [r1 - 0.0007, len]], 'hose', { seg: 7 });
  P('20', K.toward(shrink(0.006, 0.0083, 1.5 * IN), [0, -1, 0], [-GX, YC + 0.03, ZG]), [0, -0.035, 0]);
  P('21', K.toward(shrink(0.0062, 0.0104, 1.5 * IN), [0, -1, 0], [GX, YC + 0.03, ZG]), [0, -0.035, 0]);

  // Embase (le long de +Y local depuis le côté câble ; face d'accouplement en y = L).
  const recept = (w, d, rA) => merged([
    lathe([[0.004, 0], [rA - 0.0015, 0], [rA, 0.008], [rA, 0.015], [0.004, 0.015]], 'plastic', { seg: 7 }),
    pb(w, 0.026, d, 'plastic', { pos: [0, 0.027, 0] }),
    box(w + 0.004, 0.003, d + 0.004, 'plastic', { pos: [0, 0.018, 0] }),
  ], 'plastic');
  const LR = 0.04;
  P('6', K.toward(recept(0.02, 0.016, 0.0076), [0, -1, 0], [-GX, YC, ZG]), [0, -0.08, 0]);
  P('8', K.toward(recept(0.027, 0.018, 0.0097), [0, -1, 0], [GX, YC, ZG]), [0, -0.08, 0]);
  P('7', box(0.012, 0.002, 0.009, 'green', { pos: [-GX, YC - LR - 0.0008, ZG] }), [0, -0.11, 0]);
  P('9', box(0.018, 0.002, 0.009, 'green', { pos: [GX, YC - LR - 0.0008, ZG] }), [0, -0.11, 0]);
  // 10 — broches : 2 dans l'embase 6, 3 dans l'embase 8.
  for (const [x, dx] of [[-GX, -0.004], [-GX, 0.004], [GX, -0.006], [GX, 0], [GX, 0.006]]) {
    P('10', cyl(0.0008, 0.008, 'zinc', { seg: 4, pos: [x + dx, YC - LR - 0.003, ZG] }), [0, -0.135, 0]);
  }

  // ------------------------------------------ 11 à 16 — Y CAN et ses fiches
  const legs = [[0, 1, 0], [1, 0, 0], [0, -1, 0]]; // A : câble 23 (fiche bleue), B : bouchon 12, C : fiche orange (vers X1)
  const yk = [pb(0.02, 0.022, 0.014, 'plastic')];
  for (const d of legs) {
    yk.push(K.toward(cyl(0.005, 0.012, 'plastic', { seg: 6, pos: [0, 0.017, 0] }), d));
    yk.push(K.toward(pb(0.018, 0.022, 0.014, 'plastic', { pos: [0, 0.033, 0] }), d));
  }
  P('11', at(merged(yk, 'plastic'), YK), [EYX, 0, EY]);
  const face = (d, k) => YK.map((v, j) => v + d[j] * k);
  // Fiche 3 voies (le long de +Y local depuis la face d'accouplement).
  const plug = () => merged([pb(0.018, 0.03, 0.016, 'plastic', { pos: [0, 0.015, 0] }), cyl(0.0055, 0.004, 'plastic', { seg: 6, pos: [0, 0.031, 0] })], 'plastic');
  P('13', K.toward(plug(), legs[0], face(legs[0], 0.044)), [EYX, 0.035, EY]);
  // Fils de la fiche orange vers X1 (dessinés avec elle).
  const lead = tube([[-0.042, 0.04, Z3[1]], [-0.042, 0.04, 0.115], [-0.03, -0.02, 0.125], [-0.02, -0.128, 0.125], [0.04, -0.13, 0.12], [0.055, -0.124, 0.115], [0.055, -0.112, 0.115]], 0.002, 'black', { seg: 14, radial: 4, ends: 'none' });
  P('13', group(K.toward(plug(), legs[2], face(legs[2], 0.044)), lead), [EYX, -0.035, EY]);
  P('15', K.toward(box(0.0195, 0.003, 0.0175, 'blue', { pos: [0, 0.0045, 0] }), legs[0], face(legs[0], 0.044)), [EYX, 0.02, EY]);
  P('14', K.toward(box(0.0195, 0.003, 0.0175, 'orange', { pos: [0, 0.0045, 0] }), legs[2], face(legs[2], 0.044)), [EYX, -0.02, EY]);
  for (const [i, s] of [[0, 1], [2, -1]]) {
    for (const dx of [-0.005, 0, 0.005]) {
      P('16', K.toward(cyl(0.001, 0.005, 'zinc', { seg: 4, pos: [dx, 0.0335, 0] }), legs[i], face(legs[i], 0.044)), [EYX, s * 0.06, EY]);
    }
  }
  // 12 — bouchon de terminaison (fiche moulée borgne).
  const term = merged([pb(0.018, 0.016, 0.016, 'plastic', { pos: [0, 0.008, 0] }), cyl(0.007, 0.004, 'plastic', { seg: 6, pos: [0, 0.018, 0] })], 'plastic');
  P('12', K.toward(term, legs[1], face(legs[1], 0.044)), [EYX + 0.035, 0, EY]);

  // ---------------------------------------------------- 26 — étiquette DCU
  const ink = [
    box(0.024, 0.008, 0.0003, 'black', { pos: [0, 0.013, 0] }),
    box(0.09, 0.0007, 0.0003, 'black', { pos: [0, 0.005, 0] }),
    box(0.075, 0.0055, 0.0003, 'black', { pos: [0, -0.004, 0] }),
    box(0.032, 0.0055, 0.0003, 'black', { pos: [0, -0.014, 0] }),
  ];
  P('26', at(group(pb(0.106, 0.048, 0.0004, 'white'), at(merged(ink, 'black'), [0, 0, 0.0003])), [0, 0.062, D + 0.0002]), [0, 0, 0.06]);

  return { view: { dir: [0.75, 0.25, 1] } };
}

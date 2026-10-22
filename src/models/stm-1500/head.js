// P048 — Tête de forage souterraine Boyles UM-012-100UG (pages 2.1 à 2.4) :
// boîte à chaîne triple 1 po (pignon menant 12 dents sur l'arbre de sortie de
// la transmission, pignon mené 21 dents sur la broche creuse), transmission
// Funk 4 vitesses HMD-2355 sur sa plaque, adaptateur SAE D et moteur
// hydraulique Rexroth A6VM160 à axe brisé (noir), mandrin Boyles H derrière la
// boîte, empilement couvercle, bague, écrous et manchons BQ / NQ devant,
// pompe de lubrification au bout de l'arbre menant, filtre sous sa console en
// D, refroidisseur, levier de vitesses à boule rouge, poignée en U et patte à
// fentes sur le bout −Z, tubes de charnière sous la boîte. Raccords et boyaux
// de lubrification : sous-assemblage P049 (page 2.3).
// Cotes de la page 2.1 : 742 mm du bout des manchons au bout du mandrin, 1 182 mm
// des poignées de la vanne 3 voies à l'arrière du moteur, 725 mm du dessous des
// tubes de charnière au haut de la boule, 770 mm de large ; boîte de 209,55 mm le
// long de la broche, 667 × 370 mm de face (couvercle compris).
// Repère : origine sur la face de la table, au niveau du dessous des tubes de
// charnière, à l'aplomb de l'axe de la broche et au milieu de l'épaisseur de la
// boîte ; X le long de la broche vers le bout des manchons (pied d'avance de la
// foreuse), Y vers le haut, broche à y = SPY ; transmission, moteur, pompe,
// filtre et refroidisseur du côté +Z (à gauche vu du bout des manchons, page
// 2.1), mandrin et moteur vers −X.
import { buildProcedural } from '../../viewer/assembly.js';
import { lister, each } from './layout.js';

export const SPY = 0.228; // axe de la broche au-dessus de la face de la table (dessous des tubes de charnière)
// Boîte soudée UM-012-104A sans son couvercle : 209,55 le long de la broche, 667 × 361 de face.
const BOX = { x0: -0.105, x1: 0.105, z0: -0.181, z1: 0.486, y0: SPY - 0.181, y1: SPY + 0.18 };
const TOP = BOX.y1 + 0.009; // dessus du couvercle 113A
const WALL = 0.025; // parois avant et arrière (portées des roulements) ; côtés et fond de 19 mm
// Axe menant : pignon 103, pompe 139, sortie de la transmission et moteur, 45 mm au-dessus de la broche
// (ligne B-B de la page 2.4) ; entraxe de la chaîne 0,353.
const DR = { y: SPY + 0.045, z: 0.35 };
// Corps de la transmission (204 de large, 166 le long de la broche) derrière sa plaque, puis adaptateur SAE D.
const TR = { x0: -0.141, x1: -0.307, z0: 0.248, z1: 0.452, y0: SPY - 0.17, y1: SPY + 0.165 };
const AD = { x0: -0.307, x1: -0.481, y0: DR.y - 0.135, y1: DR.y + 0.135 };
// Bloc arrière du moteur à axe brisé (plaque à orifices), incliné de 11° : centre et angle autour de Z ;
// mb(u, v) : point du plan XY dans le repère du bloc (u vers l'avant du bloc, v vers son haut).
const MB = { x: -0.7146, y: SPY + 0.062, a: -0.19 };
const mb = (u, v) => [MB.x + u * Math.cos(MB.a) - v * Math.sin(MB.a), MB.y + u * Math.sin(MB.a) + v * Math.cos(MB.a)];
// Bouts des coudes laiton 290T des orifices A et B (un par flanc du bloc, z = 0,35 ∓ 0,157), tournés
// vers l'arrière et un peu vers le haut (HEAD_PORT_N) : branchement des boyaux de rotation de la console.
// Rang 0 : flanc côté broche (z = 0,193) ; rang 1 : flanc extérieur (z = 0,507).
export const HEAD_PORTS = [1, -1].map((s) => [...mb(-0.095, 0.01), DR.z + s * 0.157]);
export const HEAD_PORT_N = [-Math.cos(MB.a), -Math.sin(MB.a), 0];

// Refroidisseur d'huile (tube vertical à embouts, sans ligne propre) sur la face avant, côté +Z :
// axe, milieux des embouts bas et haut.
const COOL = { x: 0.153, z: 0.434, yb: SPY - 0.125, yt: SPY + 0.15 };
// Filtre de tête : axe de la cartouche et milieu de la tête 177 (sous la console en D).
const FIL = { x: 0.155, z: 0.225, y: SPY + 0.162 };
// Régulateur NDV-10-N au-dessus du couvercle (corps le long de Z) ; vanne 3 voies devant la pompe.
const REG = { x: 0.02, y: SPY + 0.245, z0: 0.2, z1: 0.27 };
const VAL = { x: 0.29, y: DR.y, z: DR.z };

/** Plaque verticale (normale X) d'épaisseur t centrée en x : rectangle z0..z1 × y0..y1, trous [z, y, r]. */
function plaqueX(S, x, t, z0, z1, y0, y1, mat, holes = []) {
  const pts = [[-z1, y0], [-z0, y0], [-z0, y1], [-z1, y1]];
  return S.at(S.extrude(pts, t, mat, { holes: holes.map(([z, y, r]) => [-z, y, r]) }), [x, 0, 0], [0, Math.PI / 2, 0]);
}

/** Pose d'un objet : axe local Y selon n, axe local Z selon o (rendu perpendiculaire), origine en p. */
function pose(THREE, obj, p, n, o) {
  const Y = new THREE.Vector3(...n).normalize();
  const Z = new THREE.Vector3(...(o ?? (Math.abs(n[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0])));
  Z.sub(Y.clone().multiplyScalar(Z.dot(Y))).normalize();
  const X = new THREE.Vector3().crossVectors(Y, Z);
  obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
  obj.position.set(...p);
  return obj;
}

/** Maillons d'un brin de chaîne à rouleaux (pas p) sur la boucle fermée pts [[z, y], …] à l'abscisse x. */
function brin(S, loop, x, p) {
  const len = [0];
  for (let i = 1; i <= loop.length; i++) len.push(len[i - 1] + Math.hypot(loop[i % loop.length][0] - loop[i - 1][0], loop[i % loop.length][1] - loop[i - 1][1]));
  const L = len[len.length - 1], n = Math.round(L / p), step = L / n;
  const at = (s) => {
    let k = 1;
    while (len[k] < s) k++;
    const a = loop[k - 1], b = loop[k % loop.length], t = (s - len[k - 1]) / (len[k] - len[k - 1]);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  };
  const parts = [];
  for (let i = 0; i < n; i++) {
    const [z0, y0] = at(i * step), [z1, y1] = at(((i + 1) % n) * step);
    const ang = Math.atan2(-(y1 - y0), z1 - z0);
    for (const s of [-1, 1]) parts.push(S.at(S.box(0.003, 0.022, p * 1.25, 'darkSteel'), [x + s * 0.0105, (y0 + y1) / 2, (z0 + z1) / 2], [ang, 0, 0]));
    parts.push(S.cyl(0.0079, 0.018, 'darkSteel', { axis: 'x', seg: 8, pos: [x, y0, z0] }));
  }
  return S.merged(parts, 'darkSteel');
}

export function P048(api) {
  const S = api.S, THREE = api.THREE;
  const { box, cyl, ring, shell, lathe, bolt, gear, group, at, washer, torus, merged, extrude, plate, rod, ball, bearing, nut, nameplate } = S;
  const P = lister(api, 'P048');
  // Vis à tête cylindrique dans l'axe X (s = +1 : tête vers +X, à l'origine ; tige vers l'autre côté).
  const vcx = (d, len, s, mat = 'blackOxide') => {
    const a = s > 0 ? 'x' : '-x';
    return group(cyl(d * 0.75, d * 0.65, mat, { axis: a, seg: 14, pos: [s * d * 0.325, 0, 0] }), cyl(d / 2, len, mat, { axis: a, seg: 10, pos: [-s * len / 2, 0, 0] }));
  };

  // 36 — Boîte soudée : fond, parois avant et arrière (portées des roulements de broche et de l'arbre
  // menant, logement du couvercle de vessie), côtés ; tubes de charnière dessous, poignée en U et patte à
  // fentes sur le bout −Z, console en D du filtre et pattes du refroidisseur sur la face avant, plaques.
  const fy0 = BOX.y0 + 0.019;
  const hz = BOX.z0 - 0.046, hy = SPY + 0.162, hy0 = SPY + 0.1; // barre : saillie 56 au dos
  const dShape = [[0.105, -0.165], [0.155, -0.165]];
  for (let k = 1; k < 16; k++) { const t = Math.PI / 2 - (k / 16) * Math.PI; dShape.push([0.155 + 0.06 * Math.cos(t), -FIL.z + 0.06 * Math.sin(t)]); }
  dShape.push([0.155, -0.285], [0.105, -0.285]);
  P('UM-012-104A', group(
    at(box(BOX.x1 - BOX.x0, 0.019, BOX.z1 - BOX.z0, 'red', { r: 0.003 }), [0, BOX.y0 + 0.0095, (BOX.z0 + BOX.z1) / 2]),
    plaqueX(S, BOX.x1 - WALL / 2, WALL, BOX.z0, BOX.z1, fy0, BOX.y1, 'red', [[0, SPY, 0.105], [DR.z, DR.y, 0.045]]),
    plaqueX(S, BOX.x0 + WALL / 2, WALL, BOX.z0, BOX.z1, fy0, BOX.y1, 'red', [[0, SPY, 0.1], [DR.z, DR.y, 0.045], [0.207, SPY - 0.06, 0.018]]),
    ...[BOX.z0 + 0.0095, BOX.z1 - 0.0095].map((z) => at(box(0.21 - 2 * WALL, BOX.y1 - fy0, 0.019, 'red'), [0, (fy0 + BOX.y1) / 2, z])),
    // Tubes de charnière Ø 50 sous le fond (« underground » à z = 0,284, « surface » à z = 0,208).
    ...[0.208, 0.284].map((z) => shell(0.025, 0.019, 0.21, 'red', { axis: 'x', pos: [0, SPY - 0.203, z] })),
    // Poignée en U (rond Ø 20, 170 × 68) relevée vers l'extérieur, et patte horizontale à fentes.
    ...[-1, 1].map((s) => rod([s * 0.085, hy0, BOX.z0 + 0.002], [s * 0.085, hy, hz], 0.01, 'red')),
    rod([-0.085, hy, hz], [0.085, hy, hz], 0.01, 'red'),
    ...[-1, 1].map((s) => at(ball(0.01, 'red'), [s * 0.085, hy, hz])),
    at(plate(0.133, 0.05, 0.01, 'red', { cutouts: [[-0.035, 0.006, 0.012, 0.026], [0.035, 0.006, 0.012, 0.026]], r: 0.004 }), [-0.0335, SPY - 0.15, BOX.z0 - 0.025]),
    at(extrude(dShape, 0.01, 'red'), [0, SPY + 0.18, 0], [-Math.PI / 2, 0, 0]),
    ...[COOL.yt + 0.019, COOL.yb - 0.019].map((y) => at(box(0.085, 0.008, 0.07, 'red', { r: 0.002 }), [0.1475, y, COOL.z])),
    at(nameplate(0.065, 0.025, { material: 'white' }), [0, SPY - 0.015, BOX.z0], [0, Math.PI, 0]), // « Oil level AT 90° / AT 45° »
    at(nameplate(0.045, 0.014), [BOX.x1, SPY + 0.16, -0.15], [0, Math.PI / 2, 0]), // numéro de série
  ), [0, 0, 0]);

  // 4 — Couvercle : tôle affleurante de 9 mm, logo UM en relief, deux plaques WARNING, petit bossage côté
  // +Z (raccord en té de l'évent, page 2.3) et bossage du bouchon 1 po (5).
  const cz = (BOX.z0 + BOX.z1) / 2;
  const logo = [
    [0.07, 0.012, 0, 0.255], [0.07, 0.012, 0, 0.205], [0.012, 0.062, -0.035, 0.23], // U
    [0.07, 0.012, 0, 0.175], [0.07, 0.012, 0, 0.115], [0.012, 0.062, 0.035, 0.145], [0.04, 0.012, 0.015, 0.145], // M
  ];
  P('UM-012-113A', group(
    at(box(0.2096, 0.009, BOX.z1 - BOX.z0, 'red', { r: 0.002 }), [0, BOX.y1 + 0.0045, cz]),
    ...logo.map(([w, d, x, z]) => at(box(w, 0.003, d, 'red', { r: 0.001 }), [x, TOP + 0.0015, z])),
    at(nameplate(0.075, 0.05, { material: 'white' }), [-0.045, TOP, -0.13], [-Math.PI / 2, 0, 0]),
    at(nameplate(0.07, 0.03, { material: 'white' }), [0.06, TOP, -0.13], [-Math.PI / 2, 0, Math.PI / 2]),
    cyl(0.02, 0.02, 'red', { pos: [0, TOP + 0.01, 0.42] }),
    cyl(0.021, 0.03, 'red', { pos: [0, TOP + 0.015, -0.05] }),
  ), [0, 0.3, 0]);
  // 25, 26 — Dix vis du couvercle (4 par grand côté, 1 par petit côté) ; les 6 autres tiennent le couvercle de pompe 111.
  const capBolts = [...[-1, 1].flatMap((s) => [-0.11, 0.05, 0.21, 0.37].map((z) => [s * 0.0925, z])), [0, BOX.z0 + 0.0095], [0, BOX.z1 - 0.0095]];
  const pumpBolts = Array.from({ length: 6 }, (_, i) => { const a = (i * Math.PI) / 3; return [DR.y + 0.0675 * Math.cos(a), DR.z + 0.0675 * Math.sin(a)]; });
  each(P, 'B375-1000', [
    ...capBolts.map(([x, z]) => at(bolt(0.0095, 0.0254, 'steel'), [x, TOP + 0.002, z])),
    ...pumpBolts.map(([y, z]) => at(bolt(0.0095, 0.0254, 'steel', { axis: 'x' }), [0.127, y, z])),
  ], (i) => (i < 10 ? [0, 0.38, 0] : [0.25, 0, 0.1]));
  each(P, 'W375', [
    ...capBolts.map(([x, z]) => at(washer(0.0105, 0.005, 0.002), [x, TOP + 0.001, z])),
    ...pumpBolts.map(([y, z]) => at(washer(0.0105, 0.005, 0.002, 'steel', { axis: 'x' }), [0.126, y, z])),
  ], (i) => (i < 10 ? [0, 0.35, 0] : [0.22, 0, 0.1]));
  // 5 — Bouchons 1 po carrés : l'un sur le bossage du couvercle, l'autre en bas du bout −Z (vidange).
  each(P, 'UM-012-131', [
    at(group(box(0.022, 0.012, 0.022, 'steel', { r: 0.002 }), cyl(0.016, 0.008, 'steel', { pos: [0, -0.01, 0] })), [0, TOP + 0.036, -0.05]),
    at(group(box(0.022, 0.022, 0.012, 'steel', { r: 0.002 }), cyl(0.016, 0.008, 'steel', { axis: 'z', pos: [0, 0, 0.01] })), [0.062, SPY - 0.15, BOX.z0 - 0.006]),
  ], (i) => (i ? [0, 0, -0.2] : [0, 0.45, 0]));
  // 12 — Bouchons 3/8 NPT (niveaux d'huile à 90° et à 45°) sous la plaque « Oil level » du bout −Z.
  each(P, 'UM-102-132', [-0.02, 0.02].map((x) => at(nut(0.016, 0.008, 'steel', { axis: 'z' }), [x, SPY - 0.045, BOX.z0 - 0.004])), [0, 0, -0.2]);

  // 37, 38 — Broche creuse : Ø 117 aux portées, Ø 125 sous le pignon, de l'intérieur du mandrin à l'écrou de
  // blocage 115 ; alésage Ø 98. Deux clavettes sous le pignon mené.
  P('UM-012-101', lathe([[0.049, -0.24], [0.0585, -0.24], [0.0585, -0.06], [0.0625, -0.06], [0.0625, 0.06], [0.0585, 0.06], [0.0585, 0.23], [0.049, 0.23], [0.049, -0.24]], 'steel', { axis: 'x', seg: 40, pos: [0, SPY, 0] }), [0, 0.55, -0.3]);
  each(P, 'UM-012-122', [1, -1].map((s) => at(box(0.08, 0.01, 0.016, 'darkSteel'), [0, SPY + s * 0.0625, 0])), [0, 0.62, -0.3]);
  // 39 — Pignon mené triple : 21 dents au pas de 1 po (Ø primitif 0,170) sur moyeu claveté.
  P('UM-012-102', at(group(
    ring(0.072, 0.0625, 0.088, 'darkSteel', { axis: 'x', seg: 40 }),
    ...[-0.029, 0, 0.029].map((x) => gear(0.0772, 0.0937, 21, 0.016, 'darkSteel', { axis: 'x', hole: 0.072, pos: [x, 0, 0] })),
  ), [0, SPY, 0]), [0, 0.72, -0.3]);
  // 40, 41 — Roulements de broche : arrière (« upper ») à deux rangées Ø 200 dans la paroi arrière et le
  // couvercle 121, avant (« lower ») Ø 210 dans la paroi avant.
  P('UM-012-128', group(...[-0.12875, -0.09625].map((x) => bearing(0.1, 0.0585, 0.0325, 'yellow', { axis: 'x', pos: [x, SPY, 0] }))), [-0.35, 0, -0.35]);
  P('UM-012-129', bearing(0.105, 0.0585, 0.045, 'yellow', { axis: 'x', pos: [0.0825, SPY, 0] }), [0.3, 0, -0.35]);

  // Côté mandrin (bande de 71 : 121 de 40, 120 de 31) : couvercle 121 (logement du roulement arrière),
  // adaptateur 120, joints 124 (l'un dans 120 contre le roulement, l'autre entre 120 et la chemise 107
  // trempée de la broche), chemise de réglage 106 dans le mandrin.
  P('UM-012-121', ring(0.18, 0.1, 0.04, 'red', { axis: 'x', seg: 48, pos: [-0.125, SPY, 0] }), [-0.45, 0, -0.2]);
  P('UM-012-120', ring(0.18, 0.075, 0.031, 'red', { axis: 'x', seg: 48, pos: [-0.1605, SPY, 0] }), [-0.55, 0, -0.2]);
  each(P, 'UM-012-124', [[-0.1475, 0.0585, 0.005], [-0.163, 0.068, 0.01]].map(([x, ri, t]) => ring(0.075, ri, t, 'rubber', { axis: 'x', pos: [x, SPY, 0] })), (i) => [-0.5 - i * 0.05, 0, -0.35]);
  P('UM-012-107', shell(0.068, 0.0585, 0.026, 'darkSteel', { axis: 'x', pos: [-0.163, SPY, 0] }), [-0.62, 0, -0.35]);
  P('UM-012-106', shell(0.077, 0.0585, 0.055, 'steel', { axis: 'x', pos: [-0.2075, SPY, 0] }), [-0.72, 0, -0.35]);
  // 29, 24 — Dix SHCS 1/2 × 4 po (cercle Ø 335) à travers 120 et 121 jusque dans la paroi, têtes côté
  // mandrin, avec dix des vingt rondelles W500 (les dix autres sont sous les têtes des B500-1750).
  const shcPts = Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 10 + (i * Math.PI) / 5; return [SPY + 0.1675 * Math.cos(a), 0.1675 * Math.sin(a)]; });
  each(P, 'SHC500-4000', shcPts.map(([y, z]) => at(vcx(0.0127, 0.1, -1), [-0.1785, y, z])), [-0.5, 0, 0]);

  // Devant : couvercle de broche 114 (joint 126 dans son alésage contre le roulement), bague d'étanchéité 119
  // (second joint 126), collet 117, écrou de serrage 118 (9 vis de pression), contre-écrou 115, jeu de 9 mm
  // (têtes des vis de 115), couvercle d'usure 116 ; manchons BQ (108, rouge) et NQ (110) logés dedans.
  P('UM-012-114', ring(0.181, 0.075, 0.025, 'red', { axis: 'x', seg: 48, pos: [0.1175, SPY, 0] }), [0.4, 0, 0]);
  each(P, 'UM-012-126', [[0.11, 0.0095], [0.134, 0.008]].map(([x, t]) => ring(0.075, 0.0585, t, 'rubber', { axis: 'x', pos: [x, SPY, 0] })), (i) => [0.45 + i * 0.05, 0, 0.15]);
  P('UM-012-119', lathe([[0.075, 0.13], [0.125, 0.13], [0.115, 0.148], [0.0585, 0.148], [0.0585, 0.138], [0.075, 0.138], [0.075, 0.13]], 'red', { axis: 'x', seg: 48, pos: [0, SPY, 0] }), [0.55, 0, 0]);
  P('UM-012-117', ring(0.0715, 0.0585, 0.006, 'red', { axis: 'x', pos: [0.151, SPY, 0] }), [0.62, 0, 0]);
  P('UM-012-118', lathe([[0.0585, 0.154], [0.0885, 0.154], [0.0885, 0.2], [0.085, 0.206], [0.0585, 0.206], [0.0585, 0.154]], 'red', { axis: 'x', seg: 40, pos: [0, SPY, 0] }), [0.7, 0, 0]);
  each(P, 'SS75-1250', Array.from({ length: 9 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 9;
    return at(group(cyl(0.0095, 0.03, 'blackOxide', { axis: 'x', seg: 12 }), cyl(0.0045, 0.002, 'black', { axis: 'x', seg: 6, pos: [0.0146, 0, 0] })), [0.1905, SPY + 0.075 * Math.cos(a), 0.075 * Math.sin(a)]);
  }), [0.78, 0, 0]);
  P('UM-012-115', ring(0.0725, 0.0585, 0.024, 'red', { axis: 'x', pos: [0.218, SPY, 0] }), [0.85, 0, 0]);
  P('UM-012-116', lathe([[0.043, 0.239], [0.0725, 0.239], [0.0725, 0.264], [0.0475, 0.264], [0.043, 0.2595], [0.043, 0.239]], 'red', { axis: 'x', seg: 40, pos: [0, SPY, 0] }), [1.0, 0, 0]);
  P('UM-012-110', lathe([[0.027, 0.239], [0.0425, 0.239], [0.0425, 0.2625], [0.031, 0.2625], [0.027, 0.2585], [0.027, 0.239]], 'steel', { axis: 'x', seg: 32, pos: [0, SPY, 0] }), [1.1, 0, 0]);
  P('UM-012-108', lathe([[0.027, 0.2], [0.049, 0.2], [0.049, 0.239], [0.027, 0.239], [0.027, 0.2]], 'red', { axis: 'x', seg: 32, pos: [0, SPY, 0] }), [0.92, 0, 0.12]);
  // 21 — SHCS 5/16 × 2 1/2 : trois têtes de 115 dans le jeu, trois sur la face de 116.
  each(P, 'SHCS312-1500', [
    ...[0, 1, 2].map((k) => { const a = Math.PI / 6 + (k * 2 * Math.PI) / 3; return at(vcx(0.0079, 0.0635, 1), [0.23, SPY + 0.0655 * Math.cos(a), 0.0655 * Math.sin(a)]); }),
    ...[0, 1, 2].map((k) => { const a = Math.PI / 2 + (k * 2 * Math.PI) / 3; return at(vcx(0.0079, 0.0635, 1), [0.264, SPY + 0.064 * Math.cos(a), 0.064 * Math.sin(a)]); }),
  ], (i) => [i < 3 ? 0.9 : 1.05, 0, 0.05]);
  // 23, 24 — Dix B500-1750 en axe X sur le couvercle 114 (cercle Ø 339), têtes devant, rondelles dessous.
  const b114 = Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5; return [SPY + 0.1695 * Math.cos(a), 0.1695 * Math.sin(a)]; });
  each(P, 'B500-1750', b114.map(([y, z]) => at(bolt(0.0127, 0.0445, 'steel', { axis: 'x' }), [0.1325, y, z])), [0.48, 0, 0]);
  each(P, 'W500', [
    ...b114.map(([y, z]) => at(washer(0.0135, 0.0068, 0.0025, 'steel', { axis: 'x' }), [0.13125, y, z])),
    ...shcPts.map(([y, z]) => at(washer(0.0135, 0.0068, 0.0025, 'steel', { axis: 'x' }), [-0.17725, y, z])),
  ], (i) => (i < 10 ? [0.46, 0, 0] : [-0.48, 0, 0]));

  // 47 — Mandrin Boyles H (pages 2.5 à 2.7) contre l'adaptateur 120 : tambour Ø 308 sur 261, gorge des
  // ressorts, rangée de têtes, disque Ø 240, têtes ; alésage Ø 98 (Ø 156 côté broche). Sur le dessus,
  // coude 2501-8-6 et graisseur (lignes de la page 2.7). Clés 189 et anneau 192 rangés à l'intérieur.
  const ressorts = [];
  for (let i = 0; i < 18; i++) { const a = (i * 2 * Math.PI) / 18; ressorts.push(cyl(0.0045, 0.042, 'steel', { axis: 'x', seg: 8, pos: [-0.3025, SPY + 0.1405 * Math.cos(a), 0.1405 * Math.sin(a)] })); }
  const coude = S.fitting(0.02, 0.044, 'steel', { elbow: true });
  const graisseur = group(nut(0.011, 0.007, 'brass'), cyl(0.0035, 0.01, 'brass', { pos: [0, 0.008, 0] }), at(ball(0.0045, 'brass'), [0, 0.014, 0]));
  P('UM-012-142', group(
    lathe([[0.049, -0.438], [0.148, -0.438], [0.154, -0.432], [0.154, -0.324], [0.136, -0.324], [0.136, -0.281], [0.154, -0.281], [0.154, -0.183], [0.148, -0.177], [0.078, -0.177], [0.078, -0.247], [0.049, -0.247], [0.049, -0.438]], 'red', { axis: 'x', seg: 56, pos: [0, SPY, 0] }),
    merged(ressorts, 'steel'),
    ...Array.from({ length: 8 }, (_, i) => { const a = Math.PI / 8 + (i * Math.PI) / 4; return at(nut(0.019, 0.012, 'blackOxide', { axis: 'x' }), [-0.444, SPY + 0.137 * Math.cos(a), 0.137 * Math.sin(a)]); }),
    ring(0.12, 0.049, 0.015, 'red', { axis: 'x', seg: 40, pos: [-0.4455, SPY, 0] }),
    ...Array.from({ length: 6 }, (_, i) => { const a = (i * Math.PI) / 3; const y = SPY + 0.09 * Math.cos(a), z = 0.09 * Math.sin(a); return group(cyl(0.013, 0.011, 'red', { axis: 'x', pos: [-0.4585, y, z] }), at(nut(0.019, 0.012, 'blackOxide', { axis: 'x' }), [-0.47, y, z])); }),
    pose(THREE, coude, [-0.262, SPY + 0.154 + 0.006, 0], [0, 1, 0], [-1, 0, 0]),
    pose(THREE, graisseur, [-0.215, SPY + 0.154 + 0.0035, 0], [0, 1, 0]),
  ), [-0.95, 0, 0]);
  each(P, 'UM-012-189', [0, 1, 2].map((i) => { const a = Math.PI / 2 + (i * 2 * Math.PI) / 3; return at(box(0.05, 0.012, 0.012, 'darkSteel'), [-0.41, SPY + 0.042 * Math.cos(a), 0.042 * Math.sin(a)], [a, 0, 0]); }), [-1.15, 0, 0]);

  // Pignon menant (59) : arbre et pignon triple 12 dents (Ø primitif 0,098), roulements 127 dans les
  // parois, joint 125 et siège 123 dans le passage de la plaque de transmission ; clavette de pompe 169.
  P('UM-012-103', at(group(
    lathe([[0, -0.15], [0.03, -0.15], [0.03, -0.105], [0.025, -0.105], [0.025, -0.08], [0.03, -0.08], [0.03, 0.08], [0.025, 0.08], [0.025, 0.105], [0.02, 0.105], [0.02, 0.122], [0, 0.122]], 'steel', { axis: 'x', seg: 24 }),
    ring(0.035, 0.03, 0.088, 'darkSteel', { axis: 'x' }),
    ...[-0.029, 0, 0.029].map((x) => gear(0.041, 0.055, 12, 0.016, 'darkSteel', { axis: 'x', hole: 0.035, pos: [x, 0, 0] })),
  ), [0, DR.y, DR.z]), [0, 0.72, 0.15]);
  each(P, 'UM-012-127', [0.095, -0.095].map((x) => bearing(0.045, 0.025, 0.02, 'yellow', { axis: 'x', pos: [x, DR.y, DR.z] })), (i) => [i ? -0.25 : 0.25, 0.5, 0.15]);
  P('UM-012-123', ring(0.055, 0.03, 0.015, 'blue', { axis: 'x', pos: [-0.1125, DR.y, DR.z] }), [-0.35, 0.3, 0.15]);
  P('UM-012-125', ring(0.045, 0.03, 0.012, 'rubber', { axis: 'x', pos: [-0.126, DR.y, DR.z] }), [-0.4, 0.3, 0.15]);
  P('UM-012-169', at(box(0.012, 0.005, 0.005, 'darkSteel'), [0.118, DR.y + 0.0225, DR.z]), [0.35, 0.2, 0.15]);
  // 6 — Chaîne triple 1 po (#80-3) : trois brins (pas transversal 29 mm) sur les deux pignons.
  const loop = (() => {
    const c1 = [0, SPY], r1 = 0.0852, c2 = [DR.z, DR.y], r2 = 0.049;
    const d = [c2[0] - c1[0], c2[1] - c1[1]], L = Math.hypot(...d), phi = Math.atan2(d[1], d[0]), beta = Math.acos((r1 - r2) / L);
    const pts = [];
    const arc = (c, r, a0, a1) => { const n = Math.max(4, Math.ceil(Math.abs(a1 - a0) / 0.12)); for (let k = 0; k <= n; k++) { const a = a0 + ((a1 - a0) * k) / n; pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); } };
    arc(c1, r1, phi + beta, phi + 2 * Math.PI - beta); // grand arc autour du pignon mené
    arc(c2, r2, phi - beta, phi + beta); // petit arc autour du pignon menant
    return pts;
  })();
  each(P, 'UM-012-130', [-0.029, 0, 0.029].map((x) => brin(S, loop, x, 0.0254)), [0, 0.85, 0.15]);

  // 2 — Transmission Funk 4 vitesses : plaque (passage de l'arbre menant, joint et siège), corps, tour de
  // sélection à dessus incliné, levier Ø 22 à boule Ø 57 articulé sur le flanc côté broche (biellette vers
  // la tour), bouchon de vidange ; adaptateur SAE D creux (accouplement 170 et anneau 192 dedans).
  const tower = [[-0.161, SPY + 0.165], [-0.307, SPY + 0.165], [-0.307, SPY + 0.17], [-0.22, SPY + 0.249], [-0.161, SPY + 0.249]];
  const lev = { x: -0.207, z: 0.22, y0: SPY + 0.1 };
  const tw = 0.012; // parois de l'adaptateur
  P('UM-012-143', group(
    plaqueX(S, -0.123, 0.036, 0.233, 0.467, SPY - 0.18, SPY + 0.175, 'red', [[DR.z, DR.y, 0.056]]),
    at(box(TR.x0 - TR.x1, TR.y1 - TR.y0, TR.z1 - TR.z0, 'red', { r: 0.012 }), [(TR.x0 + TR.x1) / 2, (TR.y0 + TR.y1) / 2, DR.z]),
    at(extrude(tower, 0.131, 'red'), [0, 0, 0.3525]),
    nut(0.022, 0.012, 'steel', { pos: [-0.224, TR.y0 - 0.006, DR.z] }),
    at(box(0.03, 0.04, 0.022, 'red', { r: 0.003 }), [lev.x, lev.y0, 0.237]),
    cyl(0.011, 0.36, 'red', { pos: [lev.x, lev.y0 + 0.18, lev.z], seg: 16 }),
    at(ball(0.0285, 'red'), [lev.x, SPY + 0.4675, lev.z]),
    rod([lev.x, SPY + 0.205, lev.z + 0.008], [lev.x, SPY + 0.205, 0.287], 0.006, 'steel'),
    cyl(0.019, 0.065, 'steel', { axis: 'x', pos: [-0.3395, DR.y, DR.z] }), // arbre d'entrée
    plaqueX(S, AD.x0 - 0.0075, 0.015, TR.z0, TR.z1, AD.y0, AD.y1, 'red', [[DR.z, DR.y, 0.025]]),
    plaqueX(S, AD.x1 + 0.0075, 0.015, TR.z0, TR.z1, AD.y0, AD.y1, 'red', [[DR.z, DR.y, 0.03]]),
    ...[AD.y0 + tw / 2, AD.y1 - tw / 2].map((y) => at(box(0.144, tw, TR.z1 - TR.z0, 'red'), [-0.394, y, DR.z])),
    ...[TR.z0 + tw / 2, TR.z1 - tw / 2].map((z) => at(box(0.144, AD.y1 - AD.y0 - 2 * tw, tw, 'red'), [-0.394, DR.y, z])),
  ), [-0.35, 0.25, 0.35]);
  P('UM-012-170', shell(0.05, 0.0195, 0.09, 'steel', { axis: 'x', pos: [-0.4, DR.y, DR.z] }), [-0.4, 0.45, 0.6]);
  P('UM-012-192', torus(0.0195, 0.0015, 'darkSteel', { axis: 'x', pos: [-0.437, DR.y, DR.z] }), [-0.45, 0.5, 0.7]);
  // 18, 19 — Cinq B437-1500 sur les bords de la plaque de transmission (quatre avec rondelle).
  const plateBolts = [[0.4615, SPY - 0.12], [0.4615, SPY - 0.01], [0.4615, SPY + 0.1], [0.2385, SPY - 0.1], [0.2385, SPY + 0.08]];
  // 17 — Moteur A6VM160 : bride carrée, corps Ø 190, bloc arrière incliné et son chapeau, coude de drain,
  // arbre dans l'accouplement ; 33, 32 — quatre B750-2000 à deux rondelles dans l'adaptateur.
  const blk = (w, h, d, u, v, z = DR.z) => at(box(w, h, d, 'blackCast', { r: 0.008 }), [...mb(u, v), z], [0, 0, MB.a]);
  const drain = S.fitting(0.022, 0.06, 'steel', { elbow: true });
  P('AA6VM', group(
    at(box(0.02, 0.204, 0.204, 'blackCast', { r: 0.012 }), [-0.491, DR.y, DR.z]),
    lathe([[0, -0.68], [0.088, -0.68], [0.095, -0.58], [0.095, -0.501], [0, -0.501]], 'blackCast', { axis: 'x', seg: 40, pos: [0, DR.y, DR.z] }),
    blk(0.09, 0.3, 0.2, 0, 0),
    blk(0.047, 0.13, 0.09, -0.0685, -0.03),
    at(cyl(0.012, 0.04, 'blackCast', { seg: 14 }), [...mb(0.01, 0.165), DR.z - 0.05], [0, 0, MB.a]),
    pose(THREE, drain, [-0.59, DR.y + 0.095 + 0.008, DR.z], [0, 1, 0], [-1, 0, 0]),
    cyl(0.019, 0.051, 'steel', { axis: 'x', pos: [-0.4555, DR.y, DR.z] }),
  ), [-0.85, 0.2, 0.35]);
  const motBolts = [-1, 1].flatMap((s) => [-1, 1].map((t) => [DR.y + s * 0.082, DR.z + t * 0.082]));
  each(P, 'B750-2000', motBolts.map(([y, z]) => at(bolt(0.019, 0.0508, 'steel', { axis: '-x' }), [-0.507, y, z])), [-0.7, 0.2, 0.35]);
  each(P, 'W750', motBolts.flatMap(([y, z]) => [-0.5025, -0.5055].map((x) => at(washer(0.02, 0.0105, 0.003, 'steel', { axis: 'x' }), [x, y, z]))), [-0.65, 0.2, 0.35]);
  // Orifices A et B sur les flancs du bloc : joint torique 208, coude à bride 290T serré par deux demi-brides
  // 289T et quatre B437-1500 + W437 (détail B de la page 2.2).
  const Pw = (u, v, s, w) => [...mb(u, v), DR.z + s * w];
  const elbows = [], halves = [], pBolts = [], pWash = [], orings = [];
  for (const s of [-1, 1]) {
    const pts = [];
    for (let k = 0; k <= 6; k++) { const t = (k / 6) * (Math.PI / 2); pts.push(Pw(-0.065 + 0.045 * Math.cos(t), 0.01, s, 0.112 + 0.045 * Math.sin(t))); }
    const segs = [cyl(0.02, 0.012, 'brass', { axis: 'z', pos: Pw(-0.02, 0.01, s, 0.106) })];
    pts.slice(1).forEach((q, k) => { segs.push(rod(pts[k], q, 0.016, 'brass', 14)); segs.push(at(ball(0.016, 'brass'), q)); });
    segs.push(rod(Pw(-0.065, 0.01, s, 0.157), Pw(-0.075, 0.01, s, 0.157), 0.016, 'brass', 14));
    segs.push(at(nut(0.036, 0.01, 'brass', { axis: 'x' }), Pw(-0.08, 0.01, s, 0.157), [0, 0, MB.a]));
    segs.push(at(cyl(0.012, 0.01, 'brass', { axis: 'x', seg: 16 }), Pw(-0.09, 0.01, s, 0.157), [0, 0, MB.a]));
    elbows.push(merged(segs, 'brass'));
    for (const v of [-0.025, 0.045]) halves.push(at(box(0.045, 0.034, 0.016, 'darkSteel', { r: 0.003 }), Pw(-0.02, v, s, 0.108), [0, 0, MB.a]));
    for (const du of [-0.016, 0.016]) for (const v of [-0.032, 0.052]) {
      pBolts.push(at(bolt(0.0111, 0.038, 'steel', { axis: s > 0 ? 'z' : '-z' }), Pw(-0.02 + du, v, s, 0.118)));
      pWash.push(at(washer(0.0115, 0.0058, 0.002, 'steel', { axis: 'z' }), Pw(-0.02 + du, v, s, 0.117)));
    }
    orings.push(torus(0.02, 0.0018, 'rubber', { axis: 'z', pos: Pw(-0.02, 0.01, s, 0.1005) }));
  }
  each(P, 'UM-063-290T', elbows, (i) => [-0.9, 0.2, i ? 0.7 : 0]);
  each(P, 'UM-063-289T', halves, (i) => [-0.9, 0.1, i < 2 ? 0.05 : 0.65]);
  each(P, 'UM-012-208', orings, (i) => [-0.9, 0.15, i ? 0.6 : 0.1]);
  each(P, 'B437-1500', [
    ...pBolts,
    ...plateBolts.map(([z, y]) => at(bolt(0.0111, 0.038, 'steel', { axis: '-x' }), [-0.143, y, z])),
  ], (i) => (i < 8 ? [-0.9, 0.05, i < 4 ? 0 : 0.7] : [-0.3, -0.15, 0.3]));
  each(P, 'W437', [
    ...pWash,
    ...plateBolts.slice(0, 4).map(([z, y]) => at(washer(0.0115, 0.0058, 0.002, 'steel', { axis: 'x' }), [-0.142, y, z])),
  ], (i) => (i < 8 ? [-0.88, 0.05, i < 4 ? 0 : 0.7] : [-0.28, -0.15, 0.3]));

  // Pompe de lubrification au bout de l'arbre menant, sur la face avant : couvercle 111 (6 B375-1000),
  // pompe à engrenages 139 (bride ronde, 4 B250-750 + W250), orifices d'aspiration devant et de refoulement dessus.
  P('UM-012-111', ring(0.08, 0.026, 0.02, 'red', { axis: 'x', seg: 40, pos: [0.115, DR.y, DR.z] }), [0.3, 0.1, 0.25]);
  P('UM-012-139', group(
    cyl(0.058, 0.012, 'blackCast', { axis: 'x', seg: 32, pos: [0.131, DR.y, DR.z] }),
    at(box(0.058, 0.08, 0.08, 'blackCast', { r: 0.008 }), [0.166, DR.y, DR.z]),
    cyl(0.014, 0.004, 'blackCast', { axis: 'x', pos: [0.197, DR.y, DR.z] }),
    cyl(0.012, 0.004, 'blackCast', { pos: [0.166, DR.y + 0.042, DR.z] }),
  ), [0.4, 0.1, 0.3]);
  const pmp = [[0.049, 0], [-0.049, 0], [0, 0.049], [0, -0.049]];
  const filt = [-0.025, 0.025];
  each(P, 'B250-750', [
    ...pmp.map(([dy, dz]) => at(bolt(0.0064, 0.019, 'steel', { axis: 'x' }), [0.1385, DR.y + dy, DR.z + dz])),
    ...filt.map((dz) => at(bolt(0.0064, 0.019, 'steel'), [FIL.x, SPY + 0.1865, FIL.z + dz])),
  ], (i) => (i < 4 ? [0.45, 0.1, 0.3] : [0.15, 0.3, 0.1]));
  each(P, 'W250', [
    ...pmp.map(([dy, dz]) => at(washer(0.007, 0.0033, 0.0015, 'steel', { axis: 'x' }), [0.13775, DR.y + dy, DR.z + dz])),
    ...filt.map((dz) => at(washer(0.007, 0.0033, 0.0015), [FIL.x, SPY + 0.18575, FIL.z + dz])),
  ], (i) => (i < 4 ? [0.43, 0.1, 0.3] : [0.15, 0.28, 0.1]));

  // 7, 8 — Filtre de tête : tête 177 sous la console en D (deux B250-750), orifices sur ses côtés ±Z ;
  // cartouche blanche Ø 80 × 89.
  P('UM-012-177', group(
    at(box(0.07, 0.026, 0.07, 'castAlu', { r: 0.006 }), [FIL.x, FIL.y, FIL.z]),
    ...[-1, 1].map((s) => cyl(0.011, 0.008, 'castAlu', { axis: 'z', pos: [FIL.x, FIL.y, FIL.z + s * 0.039] })),
  ), [0.25, 0.2, 0]);
  P('UM-012-178', lathe([[0, 0], [0.036, 0], [0.04, 0.008], [0.04, 0.083], [0.037, 0.089], [0, 0.089]], 'white', { seg: 32, pos: [FIL.x, SPY + 0.06, FIL.z] }), [0.3, -0.05, 0]);

  // Refroidisseur (sans ligne propre, dessiné aux pages 2.1 à 2.4) entre ses deux pattes ; 28, 27 — deux
  // B312-1000 + W312 par patte, deux autres sur le couvercle de vessie 121P.
  api.add(group(
    cyl(0.0265, 0.245, 'white', { pos: [COOL.x, SPY + 0.0125, COOL.z], seg: 24 }),
    ...[COOL.yb, COOL.yt].map((y) => at(box(0.07, 0.03, 0.07, 'white', { r: 0.006 }), [COOL.x, y, COOL.z])),
  ));
  const coolBolts = [[COOL.yt + 0.023, 1], [COOL.yb - 0.023, -1]].flatMap(([y, s]) => [0.13, 0.16].map((x) => [x, y, s]));
  const bladBolts = [SPY - 0.025, SPY - 0.095];
  each(P, 'B312-1000', [
    ...coolBolts.map(([x, y, s]) => at(bolt(0.0079, 0.0254, 'steel', { axis: s > 0 ? 'y' : '-y' }), [x, y + s * 0.0016, COOL.z])),
    ...bladBolts.map((y) => at(bolt(0.0079, 0.0254, 'steel', { axis: '-x' }), [BOX.x0 - 0.0016, y, 0.207])),
  ], (i) => (i < 4 ? [0.2, i < 2 ? 0.15 : -0.15, 0.1] : [-0.3, 0, 0.25]));
  each(P, 'W312', [
    ...coolBolts.map(([x, y, s]) => at(washer(0.009, 0.0042, 0.0016), [x, y + s * 0.0008, COOL.z])),
    ...bladBolts.map((y) => at(washer(0.009, 0.0042, 0.0016, 'steel', { axis: 'x' }), [BOX.x0 - 0.0008, y, 0.207])),
  ], (i) => (i < 4 ? [0.18, i < 2 ? 0.13 : -0.13, 0.1] : [-0.28, 0, 0.25]));
  // 16, 1 — Couvercle de vessie dans son logement de la face arrière, entre les passages de la broche et de
  // la transmission, et son joint torique.
  P('UM-1214-121P', group(
    cyl(0.018, 0.025, 'red', { axis: 'x', pos: [BOX.x0 + 0.0125, SPY - 0.06, 0.207] }),
    cyl(0.024, 0.008, 'red', { axis: 'x', pos: [BOX.x0 - 0.004, SPY - 0.06, 0.207] }),
  ), [-0.35, -0.05, 0.25]);
  P('UM-012-167', torus(0.0195, 0.0015, 'rubber', { axis: 'x', pos: [BOX.x0 - 0.0005, SPY - 0.06, 0.207] }), [-0.3, -0.05, 0.25]);

  // 9, 10, 11 — Charnière : bagues trempées aux bouts des deux tubes ; axe 105A dans le tube « underground »
  // (foreuse souterraine, z = 0,284 ; la page 2.1 le dessine dans l'autre tube), épingle devant, manche plat
  // coudé derrière (tourné vers l'extérieur, au-dessus de la table).
  each(P, 'UM-012-171', [0.208, 0.284].flatMap((z) => [-0.09, 0.09].map((x) => ring(0.019, 0.0127, 0.03, 'darkSteel', { axis: 'x', pos: [x, SPY - 0.203, z] }))), (i) => [i % 2 ? 0.2 : -0.2, -0.12, 0]);
  const pin = { y: SPY - 0.203, z: 0.284 };
  P('UM-012-105A', group(
    cyl(0.0127, 0.353, 'steel', { axis: 'x', pos: [-0.0235, pin.y, pin.z], seg: 18 }),
    at(box(0.006, 0.022, 0.052, 'steel', { r: 0.002 }), [-0.203, pin.y, pin.z + 0.026]),
    at(box(0.03, 0.022, 0.006, 'steel', { r: 0.002 }), [-0.218, pin.y, pin.z + 0.049]),
  ), [0, -0.15, 0.25]);
  P('HP1000', group(
    rod([0.14, pin.y + 0.022, pin.z], [0.14, pin.y - 0.022, pin.z], 0.0022, 'steel', 8),
    at(torus(0.0175, 0.0022, 'steel', { axis: 'x' }), [0.146, pin.y, pin.z]),
  ), [0.25, -0.15, 0.25]);

  // 63 — Raccords et boyaux de lubrification (page 2.3) : sous-assemblage P049, dans le même repère.
  const raccords = buildProcedural({ P049 }, 'P049');
  raccords.root.userData.view = raccords.view;
  P('UM-012-100UG-HC-04', raccords.root, [0.2, 0.35, 0.45]);
  return { view: { dir: [0.9, 0.55, 1.1] } };
}

// P049 — Raccords et boyaux de lubrification de la tête (page 2.3), dans le repère de P048. Circuit :
// carter → boyaux d'aspiration H15C (avant, forage vers le bas) et H16C (arrière, par le té du bout +Z,
// forage vers le haut) → vanne 3 voies BKH → pompe 139 → H20C → filtre → H17C → bas du refroidisseur →
// haut du refroidisseur → H18C → té avant du régulateur NDV-10-N (H21C vers la transmission) → régulateur →
// té arrière (H24C vers le roulement avant par le couvercle 114, H25C vers le roulement arrière par le
// couvercle 121). Transmission ↔ boîte : H22C, H10C, H11C ; évent : H23C (transmission → couvercle) et
// H08C (té du couvercle → reniflard). Boyaux 3/8 gris (H11C 1/2), raccords JIC laiton (2404, 2501, 2601,
// 5000) ou zingués (6402, 6500, 66xx, 6801).
export function P049(api) {
  const S = api.S, THREE = api.THREE;
  const { box, cyl, group, at, rod, ball, nut } = S;
  const P = lister(api, 'P049');
  const V = (a) => new THREE.Vector3(...a);
  // Diamètre de six-pans et longueur des raccords -6, -8 et du coude long -8.
  const DIM = { 6: [0.016, 0.036], 8: [0.02, 0.044], LL: [0.02, 0.06] };
  // Raccord droit ou coudé vissé dans un orifice : origine sur la face p, sortie selon n, coude tourné vers o.
  const fit = (pn, kind, size, mat, p, n, o) => {
    const [d, L] = DIM[size];
    const f = S.fitting(d, L, mat, { elbow: kind === 'coude' });
    const N = V(n).normalize();
    pose(THREE, f, V(p).addScaledVector(N, 0.14 * L).toArray(), n, o);
    P(pn, f, N.clone().multiplyScalar(0.06).toArray());
    if (kind === 'coude') return { tip: V(p).addScaledVector(N, 0.84 * L).addScaledVector(V(o).normalize(), 0.55 * L).toArray(), dir: o };
    return { tip: V(p).addScaledVector(N, 0.935 * L).toArray(), dir: n };
  };
  // Té JIC : corps cubique, écrou tournant vissé sur le bout p du raccord porteur (du côté b), embouts mâles
  // vers chacune des directions outs (passage ou branche).
  const te = (pn, size, mat, p, b, outs) => {
    const [d, L] = DIM[size];
    const B = V(b).normalize(), c = V(p).addScaledVector(B, -0.45 * L);
    const parts = [at(box(0.95 * d, 0.95 * d, 0.95 * d, mat, { r: d * 0.12 }), c.toArray()), pose(THREE, nut(d * 1.25, 0.3 * L, mat), V(p).addScaledVector(B, -0.08 * L).toArray(), b)];
    const tips = outs.map((o) => {
      const O = V(o).normalize();
      parts.push(pose(THREE, nut(d * 1.05, 0.12 * L, mat), c.clone().addScaledVector(O, 0.5 * d + 0.06 * L).toArray(), o));
      parts.push(pose(THREE, cyl(0.36 * d, 0.42 * L, mat, { seg: 12 }), c.clone().addScaledVector(O, 0.5 * d + 0.33 * L).toArray(), o));
      return { tip: c.clone().addScaledVector(O, 0.5 * d + 0.54 * L).toArray(), dir: o };
    });
    P(pn, group(...parts), B.clone().multiplyScalar(-0.06).toArray());
    return tips;
  };
  // Boyau entre deux bouts de raccords (sortie a.dir, entrée b.dir), passant par les points via.
  const boyau = (pn, a, b, via, r = 0.0095) => {
    const A = V(a.tip), B = V(b.tip);
    const pts = [A, A.clone().addScaledVector(V(a.dir).normalize(), 0.022), ...via.map(V), B.clone().addScaledVector(V(b.dir).normalize(), 0.022), B];
    P(pn, S.hose(pts.map((q) => q.toArray()), r, { material: 'grey', endMaterial: 'steel' }), [0, 0.12, 0.1]);
  };
  const Y = SPY;

  // Pompe → vanne 3 voies : 6402-8-8 dans l'orifice d'aspiration (devant la pompe), 2404-8-6 vissé dans la vanne.
  fit('6402-8-8', 'droit', 8, 'zinc', [0.199, DR.y, DR.z], [1, 0, 0]);
  fit('2404-8-6', 'droit', 6, 'brass', [VAL.x - 0.026, DR.y, DR.z], [-1, 0, 0]);
  // Vanne BKH 3/8 NPT : corps, entrées A (−Z) et B (+Z), tige et poignées en V jusqu'à x = 0,36.
  const hy = VAL.y + 0.045;
  P('UM-10B-TR#6', group(
    at(box(0.04, 0.04, 0.075, 'zinc', { r: 0.005 }), [VAL.x, VAL.y, VAL.z]),
    cyl(0.013, 0.008, 'zinc', { axis: 'x', pos: [VAL.x - 0.022, VAL.y, VAL.z] }),
    ...[-1, 1].map((s) => cyl(0.012, 0.01, 'zinc', { axis: 'z', pos: [VAL.x, VAL.y, VAL.z + s * 0.0425] })),
    cyl(0.006, 0.03, 'steel', { pos: [VAL.x, VAL.y + 0.033, VAL.z] }),
    ...[-1, 1].map((s) => rod([VAL.x, hy, VAL.z], [0.347, hy, VAL.z + s * 0.07], 0.005, 'steel', 10)),
    ...[-1, 1].map((s) => at(ball(0.008, 'black'), [0.351, hy, VAL.z + s * 0.072])),
  ), [0.35, 0, 0.05]);
  const vA = fit('2501-6-6', 'coude', 6, 'brass', [VAL.x, VAL.y, VAL.z - 0.0475], [0, 0, -1], [0, -1, 0]);
  const vB = fit('2501-6-6', 'coude', 6, 'brass', [VAL.x, VAL.y, VAL.z + 0.0475], [0, 0, 1], [0, -1, 0]);
  // Refoulement de la pompe (dessus) → H20C → entrée du filtre (côté +Z) ; sortie (côté −Z) → H17C → bas du refroidisseur.
  const ref = fit('6801-6-8', 'coude', 6, 'zinc', [0.166, DR.y + 0.044, DR.z], [0, 1, 0], [1, 0, 0]);
  const fIn = fit('2501-6-8', 'coude', 6, 'brass', [FIL.x, FIL.y, FIL.z + 0.043], [0, 0, 1], [1, 0, 0]);
  const fOut = fit('2501-6-8', 'coude', 6, 'brass', [FIL.x, FIL.y, FIL.z - 0.043], [0, 0, -1], [0, -1, 0]);
  const cBas = fit('2501-6-8', 'coude', 6, 'brass', [COOL.x + 0.035, COOL.yb, COOL.z], [1, 0, 0], [0, 0, -1]);
  const cHaut = fit('2501-6-8', 'coude', 6, 'brass', [COOL.x + 0.035, COOL.yt, COOL.z], [1, 0, 0], [0, 1, 0]);
  boyau('UM-012-H20C-UG', ref, fIn, [[0.215, Y + 0.124, 0.35], [0.245, Y + 0.14, 0.33], [0.235, Y + 0.16, 0.302]]);
  boyau('UM-012-H17C-UG', fOut, cBas, [[0.158, Y + 0.09, 0.153], [0.165, Y + 0.0, 0.16], [0.175, Y - 0.07, 0.19], [0.19, Y - 0.105, 0.26], [0.2, Y - 0.12, 0.33]]);
  // Régulateur NDV-10-N (corps noir, molette laiton) sur le couvercle, un té à chaque bout (vue de dessus de
  // la page 2.3) : devant (+Z), té de branche 6600 (H18C du refroidisseur, H21C vers la transmission) ;
  // derrière (−Z), té de passage 6602 (H24C vers le couvercle 114, H25C vers le couvercle 121).
  P('NDV-10-N', group(
    at(box(0.03, 0.03, REG.z1 - REG.z0, 'black', { r: 0.004 }), [REG.x, REG.y, (REG.z0 + REG.z1) / 2]),
    cyl(0.009, 0.02, 'black', { pos: [REG.x, REG.y + 0.025, 0.235] }),
    cyl(0.008, 0.022, 'brass', { pos: [REG.x, REG.y + 0.046, 0.235] }),
  ), [0, 0.15, 0]);
  const rIn = fit('6500-06-06', 'droit', 6, 'zinc', [REG.x, REG.y, REG.z1], [0, 0, 1]);
  const rOut = fit('6500-06-06', 'droit', 6, 'zinc', [REG.x, REG.y, REG.z0], [0, 0, -1]);
  const [t1av, t1ar] = te('6600-06-06-06', 6, 'zinc', rIn.tip, [0, 0, -1], [[1, 0, 0], [-1, 0, 0]]);
  const [t2ar, t2br] = te('6602-06-06-06', 6, 'zinc', rOut.tip, [0, 0, 1], [[0, 0, -1], [-1, 0, 0]]);
  boyau('UM-012-H18C-UG', cHaut, t1av, [[0.22, Y + 0.22, 0.432], [0.165, Y + 0.275, 0.37], [0.09, REG.y + 0.005, 0.32]]);
  // Transmission (devant de la tour) ← H21C ; couvercle 114 (roulement avant) ← H24C ; couvercle 121 (roulement arrière) ← H25C.
  const tIn = fit('2501-06-04', 'coude', 6, 'brass', [-0.161, Y + 0.21, 0.31], [1, 0, 0], [0, 1, 0]);
  const b114 = fit('2501-6-6', 'coude', 6, 'brass', [0.13, Y + 0.13, 0.05], [1, 0, 0], [0, 1, 0]);
  const b121 = fit('2404-6-4', 'droit', 6, 'brass', [-0.12, Y + 0.18, 0], [0, 1, 0]);
  boyau('UM-012-H21C-UG', t1ar, tIn, [[-0.07, REG.y + 0.008, 0.318], [-0.12, Y + 0.275, 0.312]]);
  boyau('UM-012-H24C-UG', t2ar, b114, [[REG.x + 0.01, REG.y, 0.09], [0.08, Y + 0.25, 0.06], [0.135, Y + 0.235, 0.05]]);
  boyau('UM-012-H25C-UG', t2br, b121, [[-0.06, Y + 0.25, 0.115], [-0.105, Y + 0.252, 0.04]]);
  // Évent : té 2601 sur le bossage +Z du couvercle ; H23C vers le dessus de la tour de transmission, H08C en
  // boucle haute jusqu'au reniflard A-1199-R-4048 (manchon 5000-6-6) qui dépasse du bout +Z.
  const [d6, L6] = DIM[6];
  const t2601 = S.fitting(d6, L6, 'brass', { tee: true });
  pose(THREE, t2601, [0, TOP + 0.02 + 0.14 * L6, 0.42], [0, 1, 0], [0, 0, 1]);
  P('2601-06-06-08', t2601, [0, 0.06, 0]);
  const cvH = { tip: [0, TOP + 0.02 + 0.935 * L6, 0.42], dir: [0, 1, 0] }, cvB = { tip: [-0.65 * L6, TOP + 0.02 + 0.44 * L6, 0.42], dir: [-1, 0, 0] };
  const tTour = fit('2404-6-4', 'droit', 6, 'brass', [-0.205, Y + 0.249, 0.385], [0, 1, 0]);
  boyau('UM-012-H23C-UG', cvB, tTour, [[-0.065, Y + 0.24, 0.42], [-0.13, Y + 0.305, 0.41], [-0.19, Y + 0.325, 0.395]]);
  const rn = { x: -0.07, y: Y + 0.215, z: 0.495 };
  P('5000-6-6', at(group(nut(0.022, 0.02, 'brass', { axis: 'z' }), cyl(0.0075, 0.006, 'brass', { axis: 'z', pos: [0, 0, -0.013] })), [rn.x, rn.y, rn.z + 0.012]), [0, 0, 0.1]);
  P('A-1199-R-4048', group(
    nut(0.022, 0.008, 'steel', { axis: 'z', pos: [rn.x, rn.y, rn.z + 0.026] }),
    cyl(0.013, 0.044, 'chrome', { axis: 'z', pos: [rn.x, rn.y, rn.z + 0.052], seg: 20 }),
    cyl(0.009, 0.004, 'white', { axis: 'z', pos: [rn.x, rn.y, rn.z + 0.076] }),
  ), [0, 0, 0.15]);
  boyau('UM-012-H08C', cvH, { tip: [rn.x, rn.y, rn.z - 0.004], dir: [0, 0, -1] }, [[0, Y + 0.3, 0.42], [-0.02, Y + 0.35, 0.405], [-0.055, Y + 0.335, 0.44], [-0.07, Y + 0.265, 0.455]]);
  // Transmission ↔ boîte, sur le flanc +Z de la transmission et le bout +Z de la boîte : té 6600 (H22C en
  // haut, H10C en bas), 6500 dans la boîte ; H11C 1/2 du coude 2501-8-8 de la transmission au té 6600-8-8-8,
  // porté par le coude long 2501LL-8-8 de la boîte, dont l'autre embout reçoit l'aspiration arrière H16C.
  const [tH, tB] = te('6600-06-06-06', 6, 'zinc', [-0.2, Y + 0.05, TR.z1], [0, 0, -1], [[0, 1, 0], [0, -1, 0]]);
  const bH = fit('6500-06-06', 'droit', 6, 'zinc', [-0.05, Y + 0.13, BOX.z1], [0, 0, 1]);
  const bM = fit('6500-06-06', 'droit', 6, 'zinc', [-0.08, Y - 0.035, BOX.z1], [0, 0, 1]);
  boyau('UM-012-H22C-UG', tH, bH, [[-0.2, Y + 0.115, 0.5], [-0.15, Y + 0.135, 0.545], [-0.085, Y + 0.13, 0.555]]);
  boyau('UM-012-H10C', tB, bM, [[-0.2, Y - 0.02, 0.49], [-0.15, Y - 0.035, 0.525], [-0.1, Y - 0.035, 0.54]]);
  const trB = fit('2501-8-8', 'coude', 8, 'brass', [-0.26, Y - 0.1, TR.z1], [0, 0, 1], [1, 0, 0]);
  const ll = fit('2501LL-8-8', 'coude', 'LL', 'brass', [-0.04, Y - 0.13, BOX.z1], [0, 0, 1], [-1, 0, 0]);
  const [t3h, t3b] = te('6600-8-8-8', 8, 'zinc', ll.tip, [1, 0, 0], [[0, 1, 0], [0, -1, 0]]);
  boyau('UM-012-H11C', trB, t3h, [[-0.19, Y - 0.1, 0.505], [-0.13, Y - 0.06, 0.53]], 0.011);
  // Aspiration : H15C de l'orifice bas de la face avant à l'entrée A, H16C du té arrière à l'entrée B.
  const cAv = fit('2404-6-4', 'droit', 6, 'brass', [BOX.x1, Y - 0.16, 0.26], [1, 0, 0]);
  boyau('UM-012-H15C-UG', vA, cAv, [[VAL.x - 0.002, Y - 0.04, 0.27], [0.262, Y - 0.13, 0.265], [0.19, Y - 0.163, 0.26]]);
  boyau('UM-012-H16C-UG', t3b, vB, [[-0.09, Y - 0.2, 0.54], [0.0, Y - 0.2, 0.535], [0.15, Y - 0.185, 0.525], [0.26, Y - 0.12, 0.48], [VAL.x - 0.002, Y - 0.03, 0.44]]);
  return { view: { dir: [0.9, 0.7, 1.0] } };
}

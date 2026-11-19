// P012 — Tête de rotation XBH 91-100 (Usinage X-Spec, dessin 091 « TÊTE XBH », page 2 de 2 ; éclaté p. 12,
// liste de 50 repères p. 13). Carter mécano-soudé ouvert en haut (couvercle 18 au logo XBH), broche principale
// creuse sur un roulement 6224 à l'avant (cage 6) et un roulement à contact oblique double rangée 3222 à l'arrière
// (logement 7, couvercle d'adaptation du mandrin 8), pignon mené 24 dents claveté sur la broche, arbre menant à
// pignon 12 dents taillé dans la masse sur deux 6213, chaîne triple au pas de 1 po (46 mailles + maille
// d'accouplement, note rouge), devant : manchon d'étanchéité, bague de poussée MP6104, bague de serrage à 9 vis de
// pression, bague de blocage, bague de broche NQ et chapeau de retenue ; pompe de circulation sur le couvercle de
// pompe au bout avant de l'arbre menant, filtre en ligne, vanne de dérivation, thermomètre, bouchons, raccord,
// graisseurs, supports de refroidisseur. Sous-assemblages : kit d'adaptateur transmission (p. 11, P011, derrière
// l'arbre menant) et mandrin Boyles 12HH (p. 18, P018, derrière la broche, face avant à CHUCK.x0).
//
// Repère et cotes communes : layout.js (HEAD, CHUCK, BEARINGS) et _tete.js (carter, chaîne, côté SD de l'arbre menant).
// Sources : roulements, joints toriques, visserie et chaîne [norme] ; carter et pièces tournées [mesuré sur l'éclaté
// p. 12, échelle tirée du 6213 Ø 120] ou [estimé] quand la pièce n'a pas de cote lisible.
// Lignes particulières de la liste : 24 (rayée, note rouge) — la bague de poussée 91-110 est remplacée sur la DR1500
// par MP6104 (« pour pouvoir compter les tours ») : c'est elle qui est modélisée, avec une couronne de 12 encoches
// (cibles du capteur de tours, forme [estimé]) ; 45 (échangeur de chaleur, rayé) : no3d, pas posé, ses deux supports
// 50 restent sur le carter. Les repères 46 à 50 ne sont pas dessinés à la page 12 (page 1 du dessin absente du
// manuel) : places [estimé] d'après la couverture (thermomètre et bouchons sur le bout du carter côté broche).
import { IN, BEARINGS, CHUCK } from '../layout.js';
import {
  SY, SD, DRV, pd, CAR, plaqueX, tour, bague, roulement, joint, denture, chaine, boucle,
  vchc, vpression, graisseur, bouchonCarre,
} from './_tete.js';

export default function P012(api) {
  const { S, THREE } = api;
  const { at, group, box, cyl, ring, lathe, bolt, rod, ball, torus, extrude } = S;
  const objs = [];
  const P = (ref, obj, ex) => { objs.push(obj); return api.part(ref, obj, ex); };
  const each = (ref, list, ex) => list.forEach((o, i) => P(ref, o, typeof ex === 'function' ? ex(i) : ex));
  const polar = (n, R, phase = 0) => Array.from({ length: n }, (_, i) => { const a = phase + (i * 2 * Math.PI) / n; return [R * Math.cos(a), R * Math.sin(a)]; });
  const { x0: X0, x1: X1, wall: WALL } = CAR;
  const PAD = 0.008; // portées dressées autour des alésages de broche, devant et derrière [mesuré]
  const zMid = (CAR.zLo + CAR.zHi) / 2, zLen = CAR.zHi - CAR.zLo;
  const sOut = -SD; // sens de la normale extérieure du bout côté broche (z)

  // ===================================================================================================== carter
  // 1 — Carter 91-101 : parois avant et arrière de 25 (alésages de la cage 6, du logement 7 et des 6213), bouts de
  // 19, fond de 25 ; portées circulaires dressées autour de la broche ; semelles à deux fentes en U sous chaque bout
  // (boulons 3/4-10 de la table, P005 rep. 8, aux x de HEAD_BOLTS) ; sur le bout côté broche : plaque rapportée,
  // poignée en U ; patin carré de la vanne de dérivation sur la face avant.
  const rect = [[CAR.zLo, 0], [CAR.zHi, 0], [CAR.zHi, CAR.y1], [CAR.zLo, CAR.y1]];
  const accesY = 0.09; // bouchon d'accès 43, bas de la face arrière sous l'arbre menant [estimé]
  const vDz = DRV.z * 0.42, vY = (SY + 0.17 + CAR.y1) / 2; // vanne de dérivation 49 [estimé]
  const footHoles = [-0.09, 0.09]; // fentes des semelles, aux x intérieurs de HEAD_BOLTS [layout]
  const foot = (zEnd, s) => {
    // Semelle : plaque horizontale de 25 dépassant le bout de 70, deux fentes en U ouvertes vers l'extérieur.
    const L = 0.07, w = 0.021;
    const pts = [[-0.13, 0], [0.13, 0], [0.13, L]];
    for (const xh of [0.09, -0.09]) {
      pts.push([xh + w / 2, L], [xh + w / 2, L - 0.035]);
      for (let k = 1; k < 8; k++) { const a = (k / 8) * Math.PI; pts.push([xh + (w / 2) * Math.cos(a), L - 0.035 - (w / 2) * Math.sin(a)]); }
      pts.push([xh - w / 2, L - 0.035], [xh - w / 2, L]);
    }
    pts.push([-0.13, L]);
    // contour dans (x, d) où d = distance hors du bout ; posé à plat (plan XZ)
    const pl = extrude(pts, 0.025, 'red');
    // extrude : plan XY, épaisseur Z → tourner pour mettre Y local selon ±Z monde et l'épaisseur selon Y
    return at(pl, [0, 0.0125, zEnd], [s > 0 ? Math.PI / 2 : -Math.PI / 2, 0, 0]);
  };
  const handle = (() => {
    const zf = CAR.zM + sOut * (CAR.side / 2 + 0.012), zo = zf + sOut * 0.055, y = CAR.y1 - 0.075;
    return group(
      ...[-0.06, 0.06].map((x) => rod([x, y, zf], [x, y, zo], 0.011, 'red')),
      rod([-0.06, y, zo], [0.06, y, zo], 0.011, 'red'),
      ...[-0.06, 0.06].map((x) => at(ball(0.011, 'red'), [x, y, zo])),
    );
  })();
  P('1', group(
    plaqueX(S, X1 - WALL / 2, WALL, rect, 'red', [[0, SY, 0.125], [DRV.z, DRV.y, 0.0605]]),
    plaqueX(S, X0 + WALL / 2, WALL, rect, 'red', [[0, SY, 0.12], [DRV.z, DRV.y, 0.0605], [DRV.z, accesY, 0.02]]),
    ...[CAR.zLo + CAR.side / 2, CAR.zHi - CAR.side / 2].map((z) => at(box(X1 - X0 - 2 * WALL, CAR.y1 - CAR.floor, CAR.side, 'red'), [0, (CAR.y1 + CAR.floor) / 2, z])),
    at(box(X1 - X0 - 2 * WALL, CAR.floor, zLen - 2 * CAR.side, 'red'), [0, CAR.floor / 2, zMid]),
    // portées dressées (r 0,2) autour de la cage 6 et du logement 7
    bague(S, 0.125, 0.2, X1, X1 + PAD, 'red'),
    bague(S, 0.12, 0.2, X0 - PAD, X0, 'red'),
    // plaque rapportée sur le bout côté broche (poignée, bouchons, thermomètre)
    at(box(X1 - X0 - 0.03, CAR.y1 - 0.06, 0.012, 'red', { r: 0.002 }), [0, (CAR.y1 + 0.03) / 2 + 0.015, CAR.zM + sOut * (CAR.side / 2 + 0.006)]),
    handle,
    foot(CAR.zM, sOut), foot(CAR.zD, SD),
    // patin carré de la vanne de dérivation (quatre trous taraudés, lumière carrée)
    at(box(0.008, 0.06, 0.07, 'red', { r: 0.002 }), [X1 + 0.004, vY, vDz]),
    // bossage du filtre (deux trous taraudés 1/4-20)
    at(box(0.016, 0.03, 0.05, 'red', { r: 0.002 }), [X1 + 0.008, DRV.y + 0.035, DRV.z + SD * 0.075]),
  ), [0, 0, 0]);

  // 18, 31 — Couvercle de tête 91-102 : tôle de 12 sur le dessus, ovale et lettres XBH en relief, reniflard ;
  // douze vis 3/8-16 × 1 (cinq sur chaque grand côté, une sur chaque bout).
  const TOPY = CAR.y1 + 0.012;
  const logo = [];
  {
    const cz = zMid, A = zLen * 0.3, B = 0.065;
    const ov = [], ovi = [];
    for (let k = 0; k < 48; k++) { const a = (k / 48) * 2 * Math.PI; ov.push([A * Math.cos(a), B * Math.sin(a)]); ovi.push([(A - 0.008) * Math.cos(-a), (B - 0.008) * Math.sin(-a)]); }
    logo.push(at(extrude(ov, 0.003, 'red', { holes: [ovi] }), [0, TOPY + 0.0015, cz], [-Math.PI / 2, 0, Math.PI / 2]));
    // Lettres X, B, H couchées le long de Z (barres de 8 mm de large, 70 de haut)
    const h = 0.07, t = 0.008, L = (dz, dx, w, d, a = 0) => at(box(w, 0.003, d, 'red', { r: 0.001 }), [dx, TOPY + 0.0015, cz + dz], [0, a, 0]);
    const s = A * 0.45;
    logo.push(L(-s, 0, t, h * 1.15, 0.55), L(-s, 0, t, h * 1.15, -0.55)); // X
    logo.push(L(0, 0, h, t, 0), ...[-1, 0, 1].map((k) => L(0.022, k * (h / 2 - t / 2), t, 0.04, Math.PI / 2)), L(0.042, -h / 4, h / 2 - 0.004, t), L(0.042, h / 4, h / 2 - 0.004, t)); // B
    logo.push(L(s - 0.02, 0, h, t), L(s + 0.02, 0, h, t), L(s, 0, t, 0.04)); // H
  }
  const capBolts = [...[-1, 1].flatMap((sx) => [0.06, 0.24, 0.42, 0.58, 0.76].map((f) => [sx * (X1 - WALL / 2), CAR.zLo + f * zLen])), [0, CAR.zLo + CAR.side / 2], [0, CAR.zHi - CAR.side / 2]];
  P('18', group(
    at(box(X1 - X0, 0.012, zLen, 'red', { r: 0.002 }), [0, CAR.y1 + 0.006, zMid]),
    ...logo,
    cyl(0.016, 0.012, 'black', { pos: [0, TOPY + 0.006, CAR.zLo + 0.82 * zLen], seg: 20 }), // reniflard
  ), [0, 0.55, 0]);
  each('31', capBolts.map(([x, z]) => bolt(0.0095, 0.0254, 'chaineOr', { pos: [x, TOPY, z] })), [0, 0.7, 0]);

  // ========================================================================================== broche principale
  // 9 — Broche principale XBH 91-112 : alésage Ø 100 ; filet arrière Ø 105 (dans le mandrin, jusqu'à x = −0,22),
  // portée du manchon 12 et du 3222 Ø 110, portée du pignon Ø 115 (deux rainures de clavette), collet Ø 130, portée
  // du 6224 et du manchon 11 Ø 120, filet avant Ø 118 des bagues 23 et 22 [norme pour les portées, le reste estimé].
  const xs = { tail: -0.22, b5: [-0.115, -0.0452], spr: [-0.0452, 0.04], col: [0.04, 0.046], b3: [0.046, 0.086], end: 0.196 };
  const spProf = [
    [0.05, xs.tail], [0.0505, xs.tail],
    ...S.thread(0.0525, xs.tail, -0.18, { pitch: 0.003, maxTurns: 14 }),
    [0.0525, -0.175], [0.055, -0.175], [0.055, xs.spr[0]], [0.0575, xs.spr[0]], [0.0575, xs.col[0]], [0.065, xs.col[0]], [0.065, xs.col[1]],
    [0.06, xs.col[1]], [0.06, 0.13], ...S.thread(0.059, 0.13, xs.end - 0.002, { pitch: 0.003, maxTurns: 20, chamferBottom: false }), [0.058, xs.end],
    [0.05, xs.end], [0.05, xs.tail],
  ];
  P('9', group(
    tour(S, spProf, 'steel', SY, 0, 56),
    // rainure de clavette du filet arrière (fente du dessin)
    at(box(0.04, 0.004, 0.012, 'darkSteel'), [-0.2, SY + 0.0515, 0]),
  ), [-1.15, 0, 0]);
  // 39 — Deux clavettes 91-122 du pignon mené, haut et bas (14 × 9 × 70) [estimé].
  each('39', [1, -1].map((s) => at(box(0.07, 0.009, 0.014, 'darkSteel', { r: 0.001 }), [0, SY + s * 0.0585, 0])), (i) => [-0.85, i ? -0.12 : 0.12, 0]);
  // 42 — Joints toriques 2-242 (Ø int. 107,5 × 3,53) dans les gorges sous les manchons 11 et 12.
  each('42', [[0.11, 0.0598], [-0.145, 0.0552]].map(([x, R]) => torus(R, 0.00176, 'rubber', { axis: 'x', pos: [x, SY, 0] })), (i) => [i ? -1.45 : -0.95, 0.1, 0]);

  // 10 — Pignon mené 24 dents 91-103 : moyeu Ø 170 claveté, denture triple au pas de 1 po (Ø primitif 194,6).
  P('10', at(group(
    ring(0.085, 0.0575, 0.08, 'darkSteel', { axis: 'x', seg: 48 }),
    denture(api, 24, 0.08),
  ), [0, SY, 0]), [-0.3, 0, 0]);

  // ====================================================================================== avant (côté +X)
  const C6 = { f0: X1 + PAD, f1: X1 + PAD + 0.025 }; // flasque de la cage 6
  // 3 — Roulement inférieur 6224 (120 × 215 × 40) dans la cage 6.
  const [b3i, b3o, b3w] = BEARINGS['6224'];
  P('3', roulement(api, { ri: b3i / 2, ro: b3o / 2, w: b3w, x: (xs.b3[0] + xs.b3[1]) / 2 }), [0.22, 0, 0]);
  // 6, 27, 28 — Cage du roulement inférieur 91-115 : nez Ø 250 dans l'alésage du carter, flasque Ø 340, portée du
  // 6224, alésage des deux joints 4 ; dix vis 1/2-13 × 2 1/4 et trois vis de pression d'extraction 1/2-13 × 1.
  P('6', tour(S, [
    [0.1075, 0.035], [0.125, 0.035], [0.125, C6.f0], [0.17, C6.f0], [0.17, C6.f1 - 0.002], [0.168, C6.f1], [0.0825, C6.f1],
    [0.0825, xs.b3[1]], [0.1075, xs.b3[1]], [0.1075, 0.035],
  ], 'red'), [0.42, 0, 0]);
  const c6Bolts = polar(10, 0.148, Math.PI / 10);
  each('27', c6Bolts.map(([y, z]) => bolt(0.0127, 0.0572, 'chaineOr', { axis: 'x', pos: [C6.f1, SY + y, z] })), [0.56, 0, 0]);
  each('28', [
    ...polar(3, 0.148, 0).map(([y, z]) => at(vpression(api, 0.0127, 0.0254, 1), [C6.f1 - 0.0254, SY + y, z])),
    ...polar(3, 0.15, Math.PI / 3).map(([y, z]) => at(vpression(api, 0.0127, 0.0254, -1), [CHUCK.x0 + 0.0254, SY + y, z])),
  ], (i) => (i < 3 ? [0.5, 0, 0] : [-1.0, 0, 0]));
  // 40 — Deux bagues pivot 25-886414 (Ø 1,375 × 1,000 × 0,875 po) logées dans des poches du nez de la cage 6, en
  // haut et en bas de l'alésage (p. 12 ; rôle non précisé au manuel).
  each('40', [1, -1].map((s) => S.shell(1.375 * IN / 2, 0.5 * IN, 0.875 * IN, 'brass', { axis: 'x', pos: [C6.f1 - 0.875 * IN / 2 - 0.0005, SY + s * 0.1, 0] })), (i) => [0.48, i ? -0.06 : 0.06, 0]);
  // 4 — Deux bagues d'étanchéité radiales 53 × 3062 dans la cage, lèvres vers l'intérieur, sur le manchon 11.
  each('4', [0.1, 0.114].map((x) => joint(api, { ri: 0.0675, ro: 0.0825, w: 0.012, x: x + 0.006, sgn: -1 })), (i) => [0.5 + i * 0.06, 0, 0]);
  // 11 — Manchon d'étanchéité inférieur 91-106 (Ø 135 × 120, trempé).
  P('11', bague(S, 0.06, 0.0675, xs.b3[1] + 0.001, 0.13, 'chrome'), [0.68, 0, 0]);
  // 24 — Bague de poussée MP6104 (remplace la 91-110 sur la DR1500, note rouge) : disque de 12, Ø 200, couronne de
  // 12 encoches lues par le capteur de tours [forme estimée].
  {
    const pts = [];
    const n = 12, R = 0.1, d = 0.007;
    for (let i = 0; i < n; i++) for (let k = 0; k < 8; k++) {
      const a = ((i + k / 8) * 2 * Math.PI) / n;
      const r = k >= 5 ? R - d : R;
      pts.push([r * Math.cos(a), r * Math.sin(a)]);
      if (k === 4 || k === 7) { const a2 = ((i + (k + 1) / 8) * 2 * Math.PI) / n; pts.push([r * Math.cos(a2), r * Math.sin(a2)]); }
    }
    P('24', at(extrude(pts, 0.012, 'steel', { holes: [[0, 0, 0.0598]] }), [0.136, SY, 0], [0, Math.PI / 2, 0]), [0.78, 0, 0]);
  }
  // 23, 29 — Bague de serrage 91-108 vissée sur la broche (Ø 216, 32 d'épaisseur) ; neuf vis de pression 3/4-10 × 1
  // à bout plat qui poussent la bague 24.
  const ring23 = [];
  for (let k = 0; k < 64; k++) { const a = (k / 64) * 2 * Math.PI; ring23.push([0.108 * Math.cos(a), 0.108 * Math.sin(a)]); }
  const ss29 = polar(9, 0.0835, 0);
  const sh30a = polar(3, 0.099, Math.PI / 9);
  P('23', at(extrude(ring23, 0.032, 'red', { holes: [[0, 0, 0.059], ...ss29.map(([u, v]) => [v, u, 0.0098])] }), [0.158, SY, 0], [0, Math.PI / 2, 0]), [0.95, 0, 0]);
  each('29', ss29.map(([y, z]) => at(vpression(api, 0.019, 0.0254, 1), [0.142, SY + y, z])), [0.88, 0, 0]);
  // 22 — Bague de blocage inférieure 91-107 (Ø 180, quatre encoches de clé) vissée contre la 23.
  {
    const pts = [];
    for (let i = 0; i < 4; i++) for (let k = 0; k <= 12; k++) {
      const a = ((i + k / 12) * Math.PI) / 2 + Math.PI / 4;
      const notch = k >= 5 && k <= 7;
      pts.push([(notch ? 0.082 : 0.09) * Math.cos(a), (notch ? 0.082 : 0.09) * Math.sin(a)]);
    }
    P('22', at(extrude(pts, 0.022, 'red', { holes: [[0, 0, 0.059]] }), [0.185, SY, 0], [0, Math.PI / 2, 0]), [1.1, 0, 0]);
  }
  // 26 — Bague de broche NQ 91-119 : douille dans l'alésage du bout de la broche (Ø 72 int.), collerette Ø 118.
  P('26', tour(S, [[0.036, 0.156], [0.05, 0.156], [0.05, xs.end], [0.059, xs.end], [0.059, xs.end + 0.008], [0.036, xs.end + 0.008], [0.036, 0.156]], 'darkSteel'), [1.2, 0, 0]);
  // 25 — Chapeau de retenue 91-117 (Ø 176) sur la bague 22, chambrage de la collerette de la 26.
  const x25 = [xs.end, xs.end + 0.02];
  P('25', tour(S, [[0.059, x25[0]], [0.088, x25[0]], [0.088, x25[1] - 0.002], [0.086, x25[1]], [0.04, x25[1]], [0.04, xs.end + 0.008], [0.059, xs.end + 0.008], [0.059, x25[0]]], 'red'), [1.3, 0, 0]);
  // 30 — Six SHCS 5/16-18 × 1 1/2 : trois à travers la 23 dans la bague de poussée, trois du chapeau 25 dans la 22.
  each('30', [
    ...sh30a.map(([y, z]) => at(vchc(api, 0.0079, 0.0381, 1), [0.174, SY + y, z])),
    ...polar(3, 0.074, Math.PI / 6).map(([y, z]) => at(vchc(api, 0.0079, 0.0381, 1), [x25[1], SY + y, z])),
  ], (i) => (i < 3 ? [1.03, 0, 0] : [1.42, 0, 0]));

  // ==================================================================================== arrière (côté −X)
  const H7 = { f0: X0 - PAD - 0.03, f1: X0 - PAD }; // flasque du logement 7
  // 5 — Roulement à contact oblique double rangée 3222 (110 × 200 × 69,8) dans le logement 7.
  const [b5i, b5o, b5w] = BEARINGS['3222'];
  P('5', roulement(api, { ri: b5i / 2, ro: b5o / 2, w: b5w, x: (xs.b5[0] + xs.b5[1]) / 2, rangs: 2 }), [-0.6, 0, 0]);
  // 7 — Logement de roulement 91-111 : cloche Ø 240 dans l'alésage arrière, flasque Ø 340 de 30, portée du 3222,
  // épaulement avant, logement du premier joint 2.
  P('7', tour(S, [
    [0.09, -0.04], [0.12, -0.04], [0.12, H7.f1], [0.17, H7.f1], [0.17, H7.f0 + 0.002], [0.168, H7.f0], [0.064, H7.f0],
    [0.064, H7.f0 + 0.004], [0.075, H7.f0 + 0.004], [0.075, xs.b5[0] - 0.001], [0.1, xs.b5[0] - 0.001], [0.1, xs.b5[1]], [0.09, xs.b5[1]], [0.09, -0.04],
  ], 'red'), [-0.45, 0, 0]);
  // 8 — Couvercle d'adaptation du mandrin 91-114 (Ø 340, de la flasque 7 à la face du mandrin x = CHUCK.x0) :
  // logement du second joint 2, chambrage Ø 272 × 10 du centrage Ø 10,66 po du cylindre 55-0007 (P020) [cote de P020].
  const x8 = [CHUCK.x0, H7.f0];
  P('8', tour(S, [
    [0.064, x8[0]], [0.136, x8[0]], [0.136, x8[0] + 0.01], [0.166, x8[0] + 0.01], [0.17, x8[0] + 0.014], [0.17, x8[1]],
    [0.075, x8[1]], [0.075, x8[1] - 0.016], [0.064, x8[1] - 0.016], [0.064, x8[0]],
  ], 'red'), [-0.9, 0, 0]);
  // 2 — Deux joints 53 × 2921 sur le manchon 12 : l'un dans le logement 7, l'autre dans le couvercle 8.
  each('2', [H7.f0 + 0.004 + 0.0055, x8[1] - 0.009].map((x) => joint(api, { ri: 0.0625, ro: 0.075, w: 0.011, x, sgn: 1 })), (i) => [i ? -0.8 : -0.68, 0, 0]);
  // 12 — Manchon d'étanchéité supérieur 91-105 (Ø 125 × 110), du 3222 à l'entretoise 37.
  P('12', bague(S, 0.055, 0.0625, xs.b5[0] - 0.001, CHUCK.x0 + 0.012, 'chrome'), [-1.55, 0, 0]);
  // 37 — Entretoise de mandrin 91-121 : bague mince à ergot, au ras de la face du couvercle 8.
  P('37', group(bague(S, 0.055, 0.0635, CHUCK.x0 + 0.0005, CHUCK.x0 + 0.012, 'darkSteel'), at(box(0.006, 0.006, 0.01, 'darkSteel'), [CHUCK.x0 + 0.0065, SY + 0.0655, 0])), [-1.7, 0, 0]);

  // ============================================================================================ arbre menant
  // 41 — Arbre menant 91-104A : pignon 12 dents taillé dans la masse (Ø primitif 98), portées des 6213 Ø 65, bout
  // arrière alésé cannelé (adaptateur 90-147 de P011), bout avant à tenon d'entraînement de la pompe.
  const dTour = (prof, mat) => tour(S, prof, mat, DRV.y, DRV.z, 32);
  const xb13 = [0.083, -0.083];
  P('41', group(
    dTour([[0.022, -0.118], [0.03, -0.118], [0.03, -0.095], [0.0325, -0.095], [0.0325, -0.0715], [0.038, -0.0715], [0.038, 0.0715],
      [0.0325, 0.0715], [0.0325, 0.095], [0.022, 0.095], [0.022, 0.118], [0.0, 0.118], [0, -0.06], [0.022, -0.06], [0.022, -0.118]], 'steel'),
    at(denture(api, 12, 0), [0, DRV.y, DRV.z]),
    at(box(0.008, 0.03, 0.009, 'steel'), [0.122, DRV.y, DRV.z]),
  ), [0.45, 0.05, 0]);
  // 13 — Deux roulements 6213 (65 × 120 × 23) dans les parois avant et arrière.
  const [b13i, b13o, b13w] = BEARINGS['6213'];
  each('13', xb13.map((x) => roulement(api, { ri: b13i / 2, ro: b13o / 2, w: b13w, x, y: DRV.y, z: DRV.z })), (i) => (i ? [-0.35, 0.18, 0] : [0.62, 0.05, 0]));
  // 19 — Chaîne triple 91-116 au pas de 1 po sur les deux pignons ; maille d'accouplement (plaques noires). Le nombre
  // de pas suit l'entraxe : 41 avec celui de layout.js (0,288 m) ; « 46 mailles + maille d'accouplement » (47 pas,
  // note rouge) correspondent à un entraxe de 0,365 m [norme : longueur de chaîne ANSI] — écart signalé.
  const loop = boucle([0, SY], pd(24) / 2, [DRV.z, DRV.y], pd(12) / 2);
  const ch = chaine(api, loop, { attache: 1 });
  P('19', ch.obj, [0, 0.35, 0]);

  // 14, 32, 33 — Couvercle de pompe 91-109 sur la paroi avant, au bout de l'arbre menant : flasque Ø 176 de 22,
  // six vis 3/8-16 × 1 1/2, quatre vis de pression 3/8-16 × 3/8 bouchant les perçages de graissage du pourtour.
  const x14 = [X1, X1 + 0.022];
  P('14', group(
    dTour([[0.028, x14[0]], [0.088, x14[0]], [0.088, x14[1] - 0.002], [0.086, x14[1]], [0.028, x14[1]], [0.028, x14[0]]], 'red'),
    dTour([[0.019, x14[1]], [0.03, x14[1]], [0.03, x14[1] + 0.004], [0.019, x14[1] + 0.004], [0.019, x14[1]]], 'red'),
  ), [0.75, 0.05, 0]);
  each('32', polar(6, 0.073, Math.PI / 6).map(([y, z]) => bolt(0.0095, 0.0381, 'chaineOr', { axis: 'x', pos: [x14[1], DRV.y + y, DRV.z + z] })), [0.85, 0.05, 0]);
  each('33', [0, 1, 2, 3].map((i) => {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    return at(group(cyl(0.0048, 0.0095, 'blackOxide', { seg: 12, pos: [0, 0.088 - 0.0045, 0] }), cyl(0.0022, 0.0006, 'black', { seg: 6, pos: [0, 0.0883, 0] })), [(x14[0] + x14[1]) / 2, DRV.y, DRV.z], [a, 0, 0]);
  }), (i) => [0.8, 0.05 + 0.1 * Math.cos(Math.PI / 4 + (i * Math.PI) / 2), 0.1 * Math.sin(Math.PI / 4 + (i * Math.PI) / 2)]);

  // 44, 34 — Pompe de circulation à engrenages MGG20016 sur le couvercle 14 (entraînée par le tenon de l'arbre) :
  // bride carrée, corps en huit, flasque arrière, orifices d'aspiration et de refoulement sur les côtés ; quatre vis
  // 1/4-20 × 3/4 dans la bride [dimensions estimées, groupe 1].
  const xp = x14[1] + 0.004;
  const huit = [];
  for (let k = 0; k <= 16; k++) { const a = -Math.PI / 2 + (k / 16) * Math.PI; huit.push([0.028 * Math.cos(a), 0.016 + 0.028 * Math.sin(a) + 0.012]); }
  for (let k = 0; k <= 16; k++) { const a = Math.PI / 2 + (k / 16) * Math.PI; huit.push([0.028 * Math.cos(a), -0.016 + 0.028 * Math.sin(a) - 0.012]); }
  const corps = (x, t) => plaqueX(S, x, t, huit.map(([u, v]) => [DRV.z + u, DRV.y + v]), 'blackCast');
  P('44', group(
    at(box(0.008, 0.07, 0.07, 'blackCast', { r: 0.004 }), [xp + 0.004, DRV.y, DRV.z]),
    corps(xp + 0.008 + 0.024, 0.048), corps(xp + 0.056 + 0.006, 0.012),
    cyl(0.01, 0.006, 'blackCast', { axis: 'x', pos: [xp + 0.071, DRV.y, DRV.z], seg: 16 }),
    ...[[1, 0.0125], [-1, 0.0105]].map(([s, r]) => cyl(r, 0.008, 'blackCast', { axis: s > 0 ? 'z' : '-z', seg: 16, pos: [xp + 0.035, DRV.y + s * 0.012, DRV.z + s * 0.032] })),
  ), [1.0, 0.05, 0]);
  each('34', [[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => bolt(0.0064, 0.019, 'chaineOr', { axis: 'x', pos: [xp + 0.008, DRV.y + a * 0.027, DRV.z + b * 0.027] })), [1.08, 0.05, 0]);

  // 20, 21, 36 — Filtre en ligne FMP038 : tête en fonte d'alu (entrée et sortie latérales) fixée sur le bossage de la
  // face avant par deux vis 1/4-20 × 2 1/2, cuve d'acier vissée dessous ; élément SME-015 dans la cuve.
  const F = { x: X1 + 0.016 + 0.025, y: DRV.y + 0.035, z: DRV.z + SD * 0.075 };
  P('20', group(
    at(box(0.05, 0.045, 0.05, 'castAlu', { r: 0.005 }), [F.x, F.y, F.z]),
    ...[-1, 1].map((s) => cyl(0.012, 0.01, 'castAlu', { axis: 'z', seg: 16, pos: [F.x, F.y + 0.004, F.z + s * 0.029] })),
    S.shell(0.024, 0.022, 0.1, 'darkSteel', { pos: [F.x, F.y - 0.0225 - 0.05, F.z] }),
    cyl(0.024, 0.004, 'darkSteel', { pos: [F.x, F.y - 0.0225 - 0.102, F.z] }),
    at(S.nut(0.014, 0.006, 'darkSteel'), [F.x, F.y - 0.0225 - 0.107, F.z]),
  ), [0.75, 0.15, SD * 0.12]);
  P('21', group(
    S.shell(0.019, 0.009, 0.085, 'cream', { pos: [F.x, F.y - 0.0225 - 0.049, F.z] }),
    ...[0.0055, 0.0905].map((d) => bague(S, 0.009, 0.0195, 0, 0.003, 'zinc', 0, 0)).map((o, i) => at(o, [F.x, F.y - 0.0225 - (i ? 0.0905 : 0.0055) - 0.0015, F.z], [0, 0, Math.PI / 2])),
  ), [0.75, -0.2, SD * 0.12]);
  each('36', [-1, 1].map((s) => bolt(0.0064, 0.0635, 'chaineOr', { axis: 'x', pos: [F.x + 0.025, F.y + s * 0.012, F.z] })), [0.9, 0.15, SD * 0.12]);

  // 49 — Vanne de dérivation Walvoil DF5/3 B12L à commande mécanique sur le patin de la face avant : corps, trois
  // orifices (P devant, A et B sur les côtés), levier à boule vers le haut [estimé].
  const V = { x: X1 + 0.008 + 0.022, y: vY, z: vDz };
  P('49', group(
    at(box(0.044, 0.05, 0.064, 'castIron', { r: 0.004 }), [V.x, V.y, V.z]),
    ...[-1, 1].map((s) => at(S.nut(0.022, 0.008, 'zinc', { axis: 'z' }), [V.x, V.y - 0.006, V.z + s * 0.036])),
    at(S.nut(0.022, 0.008, 'zinc', { axis: 'x' }), [V.x + 0.026, V.y - 0.006, V.z]),
    at(box(0.02, 0.012, 0.03, 'castIron', { r: 0.002 }), [V.x, V.y + 0.031, V.z]),
    rod([V.x, V.y + 0.035, V.z], [V.x + 0.03, V.y + 0.11, V.z], 0.004, 'black'),
    at(ball(0.009, 'black'), [V.x + 0.03, V.y + 0.11, V.z]),
  ), [0.5, 0.2, 0]);

  // 47 — Coude 90° JIC #6 / NPT #8 en bas de la face avant, sous l'arbre menant (sortie d'huile vers la pompe) [estimé].
  P('47', at(S.fitting(0.016, 0.045, 'zinc', { elbow: true }), [X1 + 0.03, 0.07, DRV.z], [0, 0, -Math.PI / 2]), [0.35, -0.05, 0]);

  // 48, 46 — Sur la plaque rapportée du bout côté broche : thermomètre GT200 (cadran Ø 63, plongeur dans le carter)
  // et deux bouchons carrés 1/2 NPT (remplissage et niveau).
  const zPl = CAR.zM + sOut * (CAR.side / 2 + 0.012);
  {
    const th = S.group();
    th.add(S.lathe([[0, 0], [0.0315, 0], [0.0315, 0.012], [0.03, 0.014], [0, 0.014]], 'chrome', { seg: 32 }));
    th.add(cyl(0.028, 0.002, 'white', { pos: [0, 0.0145, 0] }));
    th.add(at(box(0.0025, 0.001, 0.022, 'black'), [0.004, 0.016, 0.004], [0, 0.6, 0]));
    th.add(at(S.nut(0.016, 0.008, 'chrome'), [0, -0.004, 0]));
    th.add(cyl(0.004, 0.08, 'chrome', { pos: [0, -0.048, 0] }));
    // axe local Y → normale extérieure du bout (±Z)
    P('48', at(th, [0, 0.11, zPl], [sOut * Math.PI / 2, 0, 0]), [0, 0, sOut * 0.28]);
  }
  each('46', [-0.035, 0.035].map((x) => at(bouchonCarre(api, 'y'), [x, 0.2, zPl], [sOut * Math.PI / 2, 0, 0])), [0, 0, sOut * 0.32]);

  // 50 — Deux supports de refroidisseur 90-133 en crochet sur le haut du bout côté arbre menant (l'échangeur 45,
  // rayé au manuel, n'est plus monté).
  const zE = CAR.zD;
  each('50', [-0.065, 0.065].map((x) => {
    const d = SD; // vers l'extérieur
    const pts = [[0, -0.06], [0.055, -0.03], [0.055, 0.0], [0.045, 0.0], [0.045, -0.018], [0.03, -0.018], [0.03, 0.01], [0, 0.01]].map(([u, v]) => [zE + d * u, CAR.y1 + v]);
    return plaqueX(S, x, 0.012, d > 0 ? pts : pts.reverse(), 'red', [[zE + d * 0.015, CAR.y1 - 0.03, 0.006]]);
  }), (i) => [0, 0.12, SD * 0.25]);

  // 38 — Deux graisseurs 1/8 NPT à bille au-dessus des alésages de broche, sur les portées avant et arrière.
  each('38', [[X1 + PAD, 'x'], [X0 - PAD, '-x']].map(([x, ax]) => at(graisseur(api, ax), [x + (ax === 'x' ? 0.0035 : -0.0035), SY + 0.185, 0])), (i) => [i ? -0.3 : 0.3, 0.12, 0]);

  // 15, 16 — Cage du joint de transmission 90-112 sur la paroi arrière, au bout de l'arbre menant (centre la
  // transmission de P011) ; bague d'étanchéité 450621 sur l'arbre.
  const x15 = [X0 - 0.018, X0];
  P('15', dTour([[0.042, x15[0]], [0.08, x15[0]], [0.08, x15[1]], [0.06, x15[1]], [0.06, x15[1] + 0.002], [0.042, x15[1] + 0.002], [0.042, x15[0]]], 'red'), [-0.55, 0.22, 0]);
  P('16', joint(api, { ri: 0.03, ro: 0.042, w: 0.01, x: x15[0] + 0.007, y: DRV.y, z: DRV.z, sgn: 1 }), [-0.45, 0.2, 0]);

  // 43, 17, 35 — Bouchon d'accès 90-113 en bas de la face arrière : collerette Ø 80, centrage Ø 38 à joint torique
  // 2-224, quatre vis 5/16-18 × 3/4.
  const xa = X0;
  P('43', tour(S, [[0, xa - 0.01], [0.04, xa - 0.01], [0.04, xa], [0.019, xa], [0.019, xa + 0.014], [0, xa + 0.014]], 'red', accesY, DRV.z, 32), [-0.4, -0.05, 0]);
  P('17', torus(0.0206, 0.00176, 'rubber', { axis: 'x', pos: [xa + 0.006, accesY, DRV.z] }), [-0.3, -0.05, 0]);
  each('35', polar(4, 0.031, Math.PI / 4).map(([y, z]) => bolt(0.0079, 0.019, 'chaineOr', { axis: '-x', pos: [xa - 0.01, accesY + y, DRV.z + z] })), [-0.5, -0.05, 0]);

  // ====================================================================================== sous-assemblages
  // Kit d'adaptateur transmission (p. 11) derrière l'arbre menant, et mandrin Boyles 12HH (p. 18) derrière la
  // broche, dans le repère de la tête (posés à l'identité).
  P('p11', api.sub('P011'), [-0.55, 0.3, SD * 0.3]);
  P('p18', api.sub('P018'), [-0.7, 0, -SD * 0.65]);

  // Coupe : plan z = 0 (axe de la broche), parties côté caméra retirées.
  const bb = new THREE.Box3();
  objs.forEach((o) => { o.updateMatrixWorld(true); bb.expandByObject(o); });
  const pos = (0 - bb.min.z) / (bb.max.z - bb.min.z || 1);
  return { view: { dir: [1.0, 0.7, sOut * 0.95], section: { axis: 'z', pos } } };
}

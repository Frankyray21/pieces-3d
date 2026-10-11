// P032 — Centreur fixe CX030950 rév. 4 (page 32) : « ASSY, FIXED CENTRALIZER »,
// repère 1 de l'avance P028. Mécano-soudure (4, CX030952) au pied du mât :
// caisson avant centré sur l'axe de forage (tôles haute et basse percées du
// passage de tige Ø 8 1/2 po, âme avant à cinq trous d'allègement, âme
// arrière, flasques d'about épais où se boulonnent les supports des vérins),
// glissières de la plaque à coins sur le dessus, deux bras en caisson vers
// deux moyeux verticaux (axes 5, Ø 2 × 9 1/4 po, dans les chapes du pied de
// mât, chacun arrêté par une vis H 1/2-13 × 4 1/4 (12) et sa rondelle
// Nord-Lock (16) en travers du moyeu), plateau arrière sous le pied du mât
// fixé par quatre vis H 3/4-10 × 1 3/4 (13) et rondelles (17), deux goussets
// en Λ et un pied en U sous le plateau.
// Dans le caisson, les deux tubes de centreur (6, P036, mâchoires fermées)
// poussés par les vérins de centrage (2, CM47360) articulés dans les
// supports boulonnés aux flasques (7, P042 côté +X ; 8, P044 côté -X) ; sur
// les oreilles de P044, les deux vérins de coins (9, CX077208, modélisés ici
// pièce par pièce : fourche de fond, fond, tube, bague de guidage, tige
// chromée, piston, œil de tige vissé et contre-écrou) qui tirent la plaque à
// coins (P046, repère 2 de P028) ; axes de chape (3, CM77208-003) et vis FHC
// 3/8-16 × 5/8 (14) à leur fond. Raccords : sur chaque vérin de centrage un
// coude (10) et un adaptateur droit (11), orifices vers le bas ; sur chaque
// vérin de coins deux coudes (10), orifices vers le haut. Sous le caisson, le
// logement du racleur et son entonnoir dévieur (1, P034), plaque supérieure
// vissée sous le caisson par quatre vis FHC 1/2-13 × 1 (15).
// Lignes A / B (plaque à coins, jeu de mâchoires selon le diamètre de tige) :
// options posées par P028 (P046 et P048) ; pas d'objet ici.
// Repère : celui de l'avance (pied du mât à y = 0, axe du mât +Y, face +Z,
// carrousel +X ; axe de forage en x = 0, z = FEED.AX) ; placé à l'identité
// par P028. Cotes ci-dessous dans le repère du centreur (_feedcent.js : po,
// origine sur l'axe de forage au dessus du caisson, y = 0,095 m).
// Encombrement ≈ 1.07 (X, des oreilles de P044 au caisson de P042) × 0.45
// (Y, de -0.29 au bas de l'entonnoir à +0.16 au haut des axes) × 0.70 (Z) m.
// Cotes : caisson, supports, tubes et vérins de centrage comme le centreur
// fendu du TVK (même liste CX034987 / 88 / 89, CM47360, CX077208) ; moyeux,
// bras, plateau et pied d'après les vues des pages 30 et 32 (moyeux aux
// coins avant du pied de mât, entonnoir sortant côté -X). Vérins de coins :
// alésage 2 po, tige Ø 1 1/8 (alésage du modèle de simulation), course 4 po
// (la fente de 3 po de la plaque dégage la tige Ø 3 1/2 ; au-delà, la plaque
// ouverte toucherait les fûts).
// Simulation : vérins de coins étiquetés ramDetailed('slip' / 'slip2', 'ext',
// 'slip') — œil de fond sur l'oreille de P044 (corps « ext »), œil de tige
// dans la chape de la plaque à coins (corps « slip ») ; tige, piston, œil et
// contre-écrou marqués rodSide().
import { ramDetailed, rodSide } from '../layout.js';
import { L, u, IN, along, hhcs, fhcs, nordLock, jicAdapter, jicElbow, hexPrism } from '../../du311/parts/_avance_b.js';
import { BRACKET112 } from '../../du311/parts/P112.js';
import { CENT, SLIP, cp, slipClevis, basis, slabX, slabY, slabZ, sheet, arc, nlT } from './_feedcent.js';

const B = CENT.box;
const BX = CENT.pivotX, CY = CENT.cylY, TY = CENT.jawY;
const BS = CENT.boss, DK = CENT.deck;
const EP = { y0: CY - 3.75, y1: CY + 3.75, z: 6.75, c: 1.0 }; // flasques d'about (= semelle des supports)

export default function P032(api) {
  const { THREE, S } = api;
  const { merged, group, at, weld, weldRing, shell, box } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v = (x, y, z) => [u(x), u(y), u(z)];
  // Objet construit dans le repère du centreur (m), porté dans celui de l'avance.
  const C = (...objs) => at(group(...objs), [0, CENT.top, CENT.AX]);
  // Tôles en pouces (repère du centreur).
  const sY = (pts, y0, y1, holes = []) => slabY(S, pts.map(([x, z]) => [u(x), u(z)]), u(y0), u(y1), 'grey', holes.map(([x, z, r]) => [u(x), u(z), u(r)]));
  const sX = (pts, x0, x1, holes = []) => slabX(S, pts.map(([z, y]) => [u(z), u(y)]), u(x0), u(x1), 'grey', holes.map(([z, y, r]) => [u(z), u(y), u(r)]));
  const sZ = (pts, z0, z1, holes = []) => slabZ(S, pts.map(([x, y]) => [u(x), u(y)]), u(z0), u(z1), 'grey', holes.map(([x, y, r]) => [u(x), u(y), u(r)]));
  const rect = (a0, b0, a1, b1) => [[a0, b0], [a1, b0], [a1, b1], [a0, b1]];
  const W = (pts, size = 0.22) => weld(pts.map(([x, y, z]) => v(x, y, z)), u(size), 'grey');

  // ================================================ 4 — centreur fixe (mécano-soudure)
  const plates = [], beads = [];
  const yT = -B.t, yB0 = B.y0, yB1 = B.y0 + B.t; // dessous de la tôle haute, tôle basse
  // Tôle haute : passage de tige Ø 8 1/2, deux lumières de levage.
  const slotHole = (x, z, w, d) => rect(x - w / 2, z - d / 2, x + w / 2, z + d / 2).map(([a, b]) => [u(a), -u(b)]);
  const topPlate = sheet(S, THREE, rect(-B.xi, -B.z, B.xi, B.z).map(([x, z]) => [u(x), -u(z)]), u(B.t), 'grey', [
    [0, 0, u(4.25)], slotHole(-11.0, -3.6, 1.5, 0.5), slotHole(11.0, -3.6, 1.5, 0.5),
  ]);
  topPlate.rotation.x = -Math.PI / 2;
  topPlate.position.y = u(-B.t / 2);
  plates.push(topPlate);
  // Tôle basse : passage de tige, quatre taraudages 1/2-13 (vis 15 du logement P034).
  const FH = [[4.6, 1.6], [-4.6, 1.6], [3.6, -3.8], [-3.6, -3.8]];
  plates.push(sY(rect(-B.xi, -B.z, B.xi, B.z), yB0, yB1, [[0, 0, 4.25], ...FH.map(([x, z]) => [x, z, 0.21])]));
  // Âmes avant (cinq trous Ø 2 3/4) et arrière (trois trous).
  plates.push(sZ(rect(-B.xi, yB1, B.xi, yT), B.z - B.t, B.z, [0, 5, -5, 10, -10].map((x) => [x, -2.6, 1.375])));
  plates.push(sZ(rect(-B.xi, yB1, B.xi, yT), -B.z, -B.z + B.t, [0, 5, -5].map((x) => [x, -2.6, 1.375])));
  // Flasques d'about (3/4 po) : contour de la semelle des supports, fenêtre du
  // vérin de centrage, taraudages 3/4-10 des vis des supports ; côté -X, patte
  // haute de la quatrième vis de P044.
  for (const s of [1, -1]) {
    const c = EP.c, z = EP.z;
    const pts = [[-z + c, EP.y0], [z - c, EP.y0], [z, EP.y0 + c], [z, EP.y1 - c], [z - c, EP.y1]];
    if (s < 0) pts.push([5.8, EP.y1], ...arc(4.8, CY + 5.25, 1.0, 0, Math.PI, 10), [3.8, EP.y1]);
    pts.push([-z + c, EP.y1], [-z, EP.y1 - c], [-z, EP.y0 + c]);
    const holes = [[5.3, 2.3], [-5.3, -2.3], [-0.6, -2.95], ...(s < 0 ? [[4.8, 5.25]] : [])]
      .map(([xb, yb]) => [s > 0 ? -xb : xb, CY + yb, 0.33]);
    const win = rect(-1.75, CY - 1.75, 1.75, CY + 1.75).map(([zz, y]) => [-u(zz), u(y)]);
    const m = sheet(S, THREE, pts.map(([zz, y]) => [-u(zz), u(y)]), u(B.x - B.xi), 'grey', [...holes.map(([zz, y, r]) => [-u(zz), u(y), u(r)]), win]);
    m.rotation.y = Math.PI / 2;
    m.position.x = s * u((B.x + B.xi) / 2);
    plates.push(m);
    // Cordons flasque / caisson (dessus, dessous, arêtes verticales).
    const xw = s * (B.xi - 0.08);
    beads.push(W([[xw, 0.08, -B.z], [xw, 0.08, B.z]]), W([[xw, B.y0 - 0.08, -B.z], [xw, B.y0 - 0.08, B.z]]));
    for (const zs of [1, -1]) beads.push(W([[xw, B.y0, zs * (B.z + 0.08)], [xw, 0, zs * (B.z + 0.08)]]));
  }
  // Cordons des âmes sur les tôles (intérieur caché : seulement les arêtes vues).
  for (const zs of [1, -1]) {
    beads.push(W([[-B.xi, 0.08, zs * (B.z + 0.06)], [B.xi, 0.08, zs * (B.z + 0.06)]]));
    beads.push(W([[-B.xi, B.y0 - 0.08, zs * (B.z + 0.06)], [B.xi, B.y0 - 0.08, zs * (B.z + 0.06)]]));
  }
  // Glissières de la plaque à coins : plats 1/2 × 1 po le long de X, arête
  // intérieure chanfreinée ; côté +Z la glissière s'arrête à x = -8 (passage du
  // fût du vérin de coins avant).
  for (const zs of [-1, 1]) {
    const zi = zs * 5.225, zo = zs * 5.725;
    const prof = [[zi, 0], [zo, 0], [zo, 1.0], [zi + zs * 0.12, 1.0], [zi, 0.88]];
    const x0 = zs < 0 ? -B.xi : -8.0;
    plates.push(sX(zs > 0 ? prof : prof.slice().reverse(), x0, 6.0));
    beads.push(W([[x0, 0.07, zo + zs * 0.07], [6.0, 0.07, zo + zs * 0.07]], 0.2));
    beads.push(W([[x0, 0.07, zi - zs * 0.07], [6.0, 0.07, zi - zs * 0.07]], 0.2));
  }
  // Bras en caisson et moyeux arrière : deux âmes verticales, tôles haute et
  // basse, de l'âme arrière du caisson au moyeu (Ø 3 3/4, alésage 2 po).
  const zb = BS.z, xb = BS.x;
  const AW = 1.3; // demi-écart des âmes des bras
  const zArm = zb + Math.sqrt(BS.ro * BS.ro - AW * AW); // âmes arrêtées sur le moyeu
  for (const s of [1, -1]) {
    for (const dx of [-AW, AW]) {
      const x = s * xb + dx;
      plates.push(sX([[zArm, B.y0], [-B.z, B.y0], [-B.z, 0], [zArm, 0]].reverse(), x - 0.25, x + 0.25, [[(zArm - B.z) / 2, -2.6, 0.9]]));
      beads.push(W([[x + Math.sign(dx) * 0.33, -0.1, -B.z - 0.06], [x + Math.sign(dx) * 0.33, B.y0 + 0.1, -B.z - 0.06]]));
    }
    for (const [y0, y1] of [[-B.t, 0], [B.y0, B.y0 + B.t]]) {
      const pts = [[s * xb - 1.55, -B.z], [s * xb + 1.55, -B.z], [s * xb + 1.55, zb], ...arc(s * xb, zb, 1.55, 0, -Math.PI, 12).slice(1, -1), [s * xb - 1.55, zb]];
      plates.push(sY(pts, y0, y1, [[s * xb, zb, BS.ri]]));
    }
    plates.push(shell(u(BS.ro), u(BS.ri), u(-B.y0), 'grey', { seg: 40, pos: v(s * xb, B.y0 / 2, zb) }));
    beads.push(at(weldRing(u(BS.ro + 0.05), u(0.2), 'grey'), v(s * xb, 0.08, zb)));
    beads.push(at(weldRing(u(BS.ro + 0.05), u(0.2), 'grey'), v(s * xb, B.y0 - 0.08, zb)));
  }
  // Plateau arrière sous le pied du mât (3/4 po), entre les moyeux ; quatre
  // trous des vis 13.
  const DH = [[7, -15], [-7, -15], [7, -21], [-7, -21]];
  // Bord avant contourné derrière les moyeux ; flancs rentrés à |x| = 10,8 en
  // arrière (passage du vérin stinger côté -X).
  const ro = BS.ro;
  const deckPts = [
    [-xb + ro, zb], [xb - ro, zb], ...arc(xb, zb, ro, Math.PI, 2 * Math.PI, 14).slice(1),
    [xb + ro, -15.0], [10.8, -16.5], [10.8, DK.z1 + 0.8], [10.0, DK.z1],
    [-10.0, DK.z1], [-10.8, DK.z1 + 0.8], [-10.8, -16.5], [-xb - ro, -15.0],
    ...arc(-xb, zb, ro, Math.PI, 2 * Math.PI, 14).slice(0, -1),
  ];
  plates.push(sY(deckPts, DK.y0, DK.y1, DH.map(([x, z]) => [x, z, 0.406])));
  for (const s of [1, -1]) beads.push(W([[s * (xb - BS.ro - 0.05), DK.y0 - 0.08, zb - 0.6], [s * (xb - BS.ro - 0.05), DK.y0 - 0.08, zb - 2.2]]));
  // Pied : U 4 po (âme verticale côté +Z, ailes vers -Z) sous le plateau, et
  // deux goussets en Λ (1/2 po) entre le pied et le plateau.
  const FY0 = -12.2, FY1 = -8.2, FZ = -18.0, FL = 1.58, FT = 0.184;
  const chan = [[FZ, FY0], [FZ, FY1], [FZ - FL, FY1], [FZ - FL, FY1 - 0.3], [FZ - FT, FY1 - 0.3], [FZ - FT, FY0 + 0.3], [FZ - FL, FY0 + 0.3], [FZ - FL, FY0]];
  plates.push(sX(chan, -9.5, 9.5));
  for (const s of [1, -1]) {
    const tri = [[s * 2.0, FY1], [s * 9.2, FY1], [s * 6.2, DK.y0], [s * 5.0, DK.y0]];
    plates.push(sZ(s > 0 ? tri : tri.slice().reverse(), FZ - 0.9, FZ - 0.4));
    beads.push(W([[s * 2.2, FY1 + 0.08, FZ - 0.95], [s * 9.0, FY1 + 0.08, FZ - 0.95]], 0.2));
    beads.push(W([[s * 4.9, DK.y0 - 0.08, FZ - 0.95], [s * 6.3, DK.y0 - 0.08, FZ - 0.95]], 0.2));
  }
  const frame4 = merged(plates, 'grey');
  frame4.userData.hasInterior = true;
  const weld4 = merged(beads, 'grey');
  weld4.geometry.userData.edgeAngle = 75;
  P('4', C(frame4, weld4), [0, 0, 0]);

  // ================================================ 1 — logement du racleur et entonnoir
  P('1', at(api.sub('P034'), cp(0, B.y0, 0)), [0, -0.3, 0]);
  // 15 — vis FHC 1/2-13 × 1 : tête fraisée affleurant le dessous de la plaque du logement.
  for (const [x, z] of FH) P('15', along(THREE, fhcs(S, THREE, 0.5, 1.0), [0, -1, 0], cp(x, B.y0 - 0.375, z)), [0, -0.42, 0]);

  // ================================================ 6 — tubes de centreur (mâchoires fermées)
  for (const s of [1, -1]) P('6', at(api.sub('P036'), cp(0, TY, 0), s < 0 ? [0, Math.PI, 0] : null), [s * 0.2, 0.1, 0]);

  // ================================================ 7 / 8 — supports des vérins
  // Repère des supports : X selon l'axe d'articulation, Z de la semelle vers
  // l'ouverture du caisson (vers l'extérieur), Y vers le haut.
  P('7', basis(THREE, api.sub('P042'), [0, 0, -1], [0, 1, 0], cp(BX, CY, 0)), [0.22, 0, 0]);
  P('8', basis(THREE, api.sub('P044'), [0, 0, 1], [0, 1, 0], cp(-BX, CY, 0)), [-0.22, 0, 0]);

  // ================================================ 2 — vérins de centrage CM47360
  // Le long de +Y local, de l'œil de fond (axe selon X local = axe du support)
  // à l'œil de tige (axe selon Z local, vertical, dans la poche de la mâchoire).
  // Alésage 3 po (tube Ø 3 1/2), tige Ø 1 1/2, deux orifices vers +Z local.
  const centCyl = (len) => {
    const body = [
      L(S, [[0.64, -1.45], [1.12, -1.45], [1.12, 1.45], [0.64, 1.45], [0.64, -1.45]], 'grey', 32, { axis: 'x' }),
      L(S, [[0, 0.9], [1.6, 0.9], [1.75, 1.05], [1.75, 1.6], [0, 1.6]], 'grey', 40),
      S.shell(u(1.75), u(1.5), u(5.9), 'grey', { seg: 40, pos: [0, u(4.55), 0] }),
      L(S, [[0.78, 7.5], [1.8, 7.5], [1.8, 8.1], [1.72, 8.2], [0.78, 8.2], [0.78, 7.5]], 'grey', 40),
      box(u(0.7), u(0.8), u(1.6), 'grey', { pos: [0, u(0.45), 0] }),
    ];
    for (const y of [2.3, 6.9]) body.push(L(S, [[0.2, 1.5], [0.42, 1.5], [0.42, 2.0], [0.2, 2.0], [0.2, 1.5]], 'grey', 20, { axis: 'z', pos: [0, u(y), 0] }));
    const rodEye = [
      L(S, [[0.5, -0.375], [1.0, -0.375], [1.0, 0.375], [0.5, 0.375], [0.5, -0.375]], 'grey', 32, { axis: 'z', pos: [0, u(len), 0] }),
      L(S, [[0, len - 2.0], [0.6, len - 2.0], [0.62, len - 0.95], [0, len - 0.95]], 'grey', 24),
    ];
    return group(
      merged([...body, ...rodEye], 'grey'),
      L(S, [[0, 7.0], [0.75, 7.0], [0.75, len - 2.05], [0, len - 2.05]], 'chrome', 28),
      L(S, [[0.76, 8.2], [0.95, 8.2], [0.95, 8.3], [0.76, 8.35], [0.76, 8.2]], 'rubber', 28),
    );
  };
  const elbows = [];
  for (const s of [1, -1]) {
    const len = BX - 4.52; // axe du support → axe du tube
    P('2', basis(THREE, centCyl(len), [0, 0, s], [-s, 0, 0], cp(s * BX, CY, 0)), [s * 0.1, 0.22, 0]);
    // Orifices vers le bas : coude 10 côté fond, adaptateur droit 11 côté tige.
    elbows.push({ pos: cp(s * (BX - 2.3), CY - 2.0, 0), dir: [0, -1, 0], nose: [0, 0, s], e: [s * 0.1, -0.15, 0] });
    P('11', along(THREE, jicAdapter(S, THREE, 4, { jicDash: 4 }), [0, -1, 0], cp(s * (BX - 6.9), CY - 2.0, 0)), [s * 0.1, -0.15, 0]);
  }

  // ================================================ 9 — vérins de coins CX077208, 3 — axes, 14 — vis
  // Oreilles de P044 (repère du support : X → +Z, Y → Y, Z → -X), en m dans le
  // repère de l'avance.
  const lugs = BRACKET112.lugAxes.map(([x, y, z]) => [-u(BX) - z, CENT.top + u(CY) + y, CENT.AX + x]);
  const lt = BRACKET112.lugT / IN + 0.08; // jour de la fourche de fond (po)
  const CH = 0.375; // joues de la fourche
  const st = SLIP.stroke / IN;
  // Vérin le long de +Y local (po), de l'axe de fond (y = 0, axe selon X local)
  // à l'axe de l'œil de tige (y = len) ; orifices vers +Z local.
  const slipCyl = (len) => {
    const yb = 2.05; // départ du tube (fond soudé)
    const yH = yb + st + 2.25; // bout du tube : course + piston + bague
    const fork = [];
    for (const s of [-1, 1]) {
      const x0 = s * (lt / 2), x1 = s * (lt / 2 + CH);
      const cheek = [[-0.75, 1.4], ...arc(0, 0, 0.75, Math.PI, 2 * Math.PI, 12).slice(1, -1), [0.75, 1.4]];
      fork.push(slabX(S, cheek.map(([z, y]) => [u(z), u(y)]), u(Math.min(x0, x1)), u(Math.max(x0, x1)), 'grey', [[0, 0, u(0.39)]]));
    }
    fork.push(box(u(lt + 2 * CH), u(0.5), u(1.5), 'grey', { pos: [0, u(1.15), 0] }));
    const shellParts = [
      ...fork,
      // fond soudé (chanfreins), tube Ø 2 1/2 × 1/4, cordon fond / tube
      L(S, [[0, 1.4], [1.2, 1.4], [1.25, 1.45], [1.25, yb], [0, yb]], 'grey', 36),
      L(S, [[1.0, yb], [1.25, yb], [1.25, yH], [1.0, yH], [1.0, yb]], 'grey', 36),
      L(S, [[1.25, yb - 0.02], [1.33, yb + 0.04], [1.25, yb + 0.1]], 'grey', 36),
      // bossages des orifices SAE-4 (soudés sur le tube, vers +Z local)
      ...[2.55, yH - 0.75].map((y) => L(S, [[0.22, 1.0], [0.42, 1.0], [0.42, 1.62], [0.38, 1.66], [0.22, 1.66], [0.22, 1.0]], 'grey', 20, { axis: 'z', pos: [0, u(y), 0] })),
    ];
    // Bague de guidage vissée dans le tube : six pans de manœuvre, gorge du racleur.
    const gland = L(S, [[0.6, yH - 0.9], [0.98, yH - 0.9], [0.98, yH], [1.22, yH], [1.22, yH + 0.55], [1.15, yH + 0.62], [0.6, yH + 0.62], [0.6, yH - 0.9]], 'steel', 36);
    const wiper = L(S, [[0.565, yH + 0.62], [0.78, yH + 0.62], [0.78, yH + 0.7], [0.62, yH + 0.74], [0.565, yH + 0.7], [0.565, yH + 0.62]], 'rubber', 28);
    // Côté tige : piston (bagues d'usure), tige Ø 1 1/8, œil vissé et contre-écrou.
    const yP = yH - 0.9; // piston contre la bague, tige sortie
    const rodParts = group(
      L(S, [[0.3, yP - 1.0], [0.98, yP - 1.0], [0.98, yP], [0.3, yP], [0.3, yP - 1.0]], 'darkSteel', 28),
      L(S, [[0, yP - 1.1], [0.5625, yP - 1.1], [0.5625, len - 1.25], [0.5, len - 1.2], [0, len - 1.2]], 'chrome', 28),
      merged([
        L(S, [[0.39, -0.41], [0.75, -0.41], [0.75, 0.41], [0.39, 0.41], [0.39, -0.41]], 'grey', 28, { axis: 'x', pos: [0, u(len), 0] }),
        L(S, [[0, len - 1.55], [0.6, len - 1.55], [0.6, len - 0.95], [0.5, len - 0.6], [0, len - 0.6]], 'grey', 24),
      ], 'grey'),
      at(hexPrism(S, THREE, 1.125, 0.42, 0, 0.56, 'zinc'), [0, u(len - 2.0), 0]),
    );
    rodSide(rodParts);
    const g = group(merged(shellParts, 'grey'), gland, wiper, rodParts);
    g.userData.hasInterior = true;
    return g;
  };
  lugs.forEach((lp, i) => {
    const s = i === 0 ? -1 : 1; // oreille côté -Z (x = -2,0 po du support) puis côté +Z
    const cpv = slipClevis(s);
    const d = new THREE.Vector3(cpv[0] - lp[0], cpv[1] - lp[1], cpv[2] - lp[2]);
    const len = d.length() / IN;
    const Y = d.clone().normalize();
    const X = new THREE.Vector3(0, 0, 1).addScaledVector(Y, -Y.z).normalize();
    const cyl = basis(THREE, slipCyl(len), X.toArray(), Y.toArray(), lp);
    ramDetailed(i === 0 ? 'slip' : 'slip2', 'ext', 'slip', cyl, { rear: [0, 0, 0], rod: [0, u(len), 0], stroke: SLIP.stroke });
    P('9', cyl, [-0.08, 0.28, 0]);
    // Orifices vers +Z local (vers le haut) : deux coudes 10, nez vers l'autre orifice.
    const Zl = new THREE.Vector3().crossVectors(X, Y);
    const port = (y) => new THREE.Vector3(...lp).addScaledVector(Y, u(y)).addScaledVector(Zl, u(1.66));
    const yH = 2.05 + st + 2.25;
    elbows.push({ pos: port(2.55).toArray(), dir: Zl.toArray(), nose: Y.toArray(), e: [-0.08, 0.36, 0] });
    elbows.push({ pos: port(yH - 0.75).toArray(), dir: Zl.toArray(), nose: Y.clone().negate().toArray(), e: [-0.08, 0.36, 0] });
    // 3 — axe de chape Ø 3/4 (selon Z), tête Ø 1 po côté +Z ; 14 — vis FHC
    // 3/8-16 × 5/8 dans la joue de la fourche, tête sur la tête de l'axe.
    const half = lt / 2 + CH + 0.05;
    const pinObj = L(S, [[0, -half], [0.33, -half], [0.372, -half + 0.05], [0.372, half], [0.5, half], [0.5, half + 0.2], [0.46, half + 0.24], [0, half + 0.24]], 'steel', 20, { axis: 'z' });
    P('3', at(pinObj, lp), [0, 0, 0.12]);
    P('14', along(THREE, fhcs(S, THREE, 0.375, 0.625), [0, 0, 1], [lp[0], lp[1] + u(0.62), lp[2] + u(half)]), [0, 0, 0.16]);
  });

  // ================================================ 10 — coudes (vérins 2 et 9)
  elbows.forEach(({ pos, dir, nose, e }) => P('10', basis(THREE, jicElbow(S, THREE, 4), nose, dir, pos), e));

  // ================================================ 5 — axes des moyeux, 12 / 16 — vis d'arrêt
  // Axe Ø 2 × 9 1/4 po, bouts chanfreinés, trou transversal Ø 17/32 à 1 po du
  // bas du moyeu : dépasse de 2,6 po au-dessus (chape haute du pied de mât) et
  // de 1,45 po dessous. Vis H 1/2-13 × 4 1/4 en travers du moyeu et de l'axe
  // (selon X, tête à l'extérieur, filet dans la paroi opposée taraudée).
  for (const s of [1, -1]) {
    const yTop = 2.6, yBot = yTop - 9.25, yh = B.y0 + 1.0;
    // Fût percé de part en part (trou de la vis 12) entre deux bouts tournés.
    const pinS = merged([
      L(S, [[0, yBot], [0.94, yBot], [1.0, yBot + 0.06], [1.0, yh - 0.45], [0, yh - 0.45]], 'steel', 32),
      S.slotted(u(1.0), u(0.02), u(yh - 0.45), u(yh + 0.45), S.roundHole(Math.PI / 2, u(yh), u(0.27), u(1.0), { through: true, steps: 8 }), 'steel', { seg: 32 }),
      L(S, [[0, yh + 0.45], [1.0, yh + 0.45], [1.0, yTop - 0.06], [0.94, yTop], [0, yTop]], 'steel', 32),
    ], 'steel');
    P('5', C(at(pinS, v(s * xb, 0, zb))), [0, 0.3, 0]);
    const xo = s * (xb + BS.ro);
    P('16', C(along(THREE, nordLock(S, THREE, 0.5), [s, 0, 0], v(xo, yh, zb))), [s * 0.06, 0, 0]);
    P('12', C(along(THREE, hhcs(S, THREE, 0.5, 4.25), [s, 0, 0], v(xo + s * nlT(0.5), yh, zb))), [s * 0.14, 0, 0]);
  }

  // ================================================ 13 / 17 — vis du plateau sous le pied de mât
  for (const [x, z] of DH) {
    P('17', C(along(THREE, nordLock(S, THREE, 0.75), [0, -1, 0], v(x, DK.y0, z))), [0, -0.08, 0]);
    P('13', C(along(THREE, hhcs(S, THREE, 0.75, 1.75), [0, -1, 0], v(x, DK.y0 - nlT(0.75), z))), [0, -0.16, 0]);
  }

  return { view: { dir: [1, 0.6, 1.1] } };
}

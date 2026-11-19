// P016 — Vis d'enroulement (winding screw) 206-419 du treuil XW-2100 (dessin X-Spec C5181 rév. B, page 16,
// échelle 1:4,5, 59,103 lb ; liste et poids unitaires page 17). Posée par P014 (repère 6).
//
// REPÈRE LOCAL : origine sur l'axe de la vis, au milieu entre les deux porte-roulements ; axes du treuil P014
// (et de la foreuse) : Z le long de la vis (porte-roulement droit 206-001 côté +Z, côté de la plaque 206-415),
// Y vers le haut, X vers l'avant (vers le tambour, qui est à +X de la vis). P014 la pose à HOIST_SCREW.
// Option : suiveur (position du bloc suiveur le long de Z, en mètres ; 0 = au milieu).
//
// Ce que montre la page 16 : deux porte-roulements en tôle épaisse (pied et rebord), roulements 6006-2RS, vis
// à double filet croisé (une gorge à droite, une à gauche) retenue côté gauche par une vis à embase 1/2-13 et
// la rondelle 206-004, bout droit étagé (pignon 7 et volant 5 de P014), arbre de guidage 206-407 et plat 206-411
// entre les porte-roulements, bloc suiveur 206-005 (deux bagues en bronze 206-006 et joncs N5000-200 aux bouts
// de l'alésage de la vis ; suiveur 206-009 dans une bague Thordon 206-008 tenue par un jonc N5000-175, sous le
// chapeau 206-010 et ses deux vis), support des rouleaux 206-012 boulonné sur le bloc (4 vis 3/8 × 1 1/4 et
// rondelles Grower), deux rouleaux verticaux Ø 1 po (détail 206-013V) et deux rouleaux horizontaux Ø 2 po
// (détail 206-013H) sur boulons à épaulement 1/2 × 3 1/2 po, graisseurs 1/4-28, vis de pression 1/4-28.
//
// COTES (pouces) — sources :
//   [norme] roulement 6006 : Ø 30 × 55 × 13 mm (BEARINGS de layout.js) ; joncs Truarc N5000-200 / -175 :
//           alésages Ø 2 et 1 3/4 po ; visserie aux cotes de sa désignation.
//   [manuel] rouleaux Ø 1,000 et 2,000 po (titres des détails) ; boulons à épaulement 1/2 × 3 1/2.
//   [poids, p. 17] volume = poids / densité (acier 0,284 lb/po³, bronze 0,32, Thordon 0,047) :
//           arbre de guidage 7,95 lb → Ø 1 1/4 × ≈ 21 po ; plat 3,1 lb → 1 × 1/2 × ≈ 21 po (≈ 18 1/2 po entre
//           les porte-roulements + portées) ; porte-roulement 7 lb → 24,6 po³ (plaque 6 × 7 1/2 × 1/2 + pied et
//           rebord) ; bloc suiveur 12,9 lb → 45 po³ (4 × 3 1/2 × 3 3/4 + talon, moins les alésages) ; bague en
//           bronze 0,436 lb → Ø 2 × 1 1/2 × 1 po ; suiveur 0,486 lb, Thordon 0,091 lb, chapeau 0,672 lb → Ø 2 5/8 ×
//           0,45 po ; support des rouleaux 4,95 lb → 17,4 po³ ; vis 9,58 lb → Ø 1 1/2 sur ≈ 20 po.
//   [mesure, p. 16 et p. 14] entraxe vis / arbre de guidage (2,4 po), écartement des joues du support,
//           pas des gorges (≈ 7/8 po : une vingtaine de losanges sur la course), hauteur des rouleaux.
//   [estimé] tout le reste (épaisseurs, chanfreins, fentes des joues, place des graisseurs).
import { IN } from '../layout.js';
import { p3, kit, slot, crossScrewGeo } from './_treuil.js';

// Cotes de la vis (pouces), exportées pour P014 (pignon 7, volant 5 et leur visserie sur le bout droit).
export const VIS = {
  zHolder: 9.25, // face intérieure des porte-roulements (±) [mesure : course du suiveur = largeur utile du tambour]
  tHolder: 0.5, // [estimé]
  zEndL: -9.85, // bout gauche de la vis (rondelle 206-004 et vis à embase)
  zEndR: 14.84, // bout droit (bout du volant, P014) [estimé : traverse la plaque 206-415 et le carter 206-422]
  rCore: 0.75, // Ø 1 1/2 po [poids + bagues en bronze]
  rJournal: 30 / 25.4 / 2, // portées des 6006 [norme]
  rEnd: 0.5, // bout droit Ø 1 po (jonc extérieur 045100-0100, pignon 7) [manuel : jonc pour arbre de 1 po]
  guide: [-0.6, -2.4], // axe de l'arbre de guidage (x, y) [mesure]
  holder: { x: [-3, 3], y: [-4.5, 3.0] }, // contour des porte-roulements, pied posé sur le fond (y = −4,5) [poids, mesure]
  // Trous des pieds (x, décalage en z depuis le milieu du pied, vers l'extérieur positif) : vis P014 rep. 30.
  feet: [[-2.3, -0.3], [-1.0, -0.3], [-2.3, 0.3], [-1.0, 0.3]],
  get zFoot() { return this.zHolder - 0.625; }, // milieu du pied replié vers l'intérieur (1 1/4 po)
};

export default function P016(api, opts = {}) {
  const S = api.S, T = api.THREE;
  const { box, cyl, ring, lathe, bolt, washer, nut, group, at, merged, bearing } = S;
  const K = kit(api);
  const P = (ref, obj, ex) => api.part(ref, obj, ex && ex.map((v) => v * IN));
  const zf = (opts.suiveur ?? 0) / IN; // position du bloc suiveur (pouces)
  const v = VIS;
  const [gx, gy] = v.guide;

  // ---------------------------------------------------------------- 1, 3 — porte-roulements 206-001 (droit) et 206-002 (gauche)
  // Plaque verticale (plan XY) percée pour le 6006 (Ø 55 mm), pour le bout de l'arbre de guidage et pour la vis
  // 15057 ; rebord plié côté +X (raidisseur), pied replié vers l'intérieur, posé sur le fond 206-414 et boulonné
  // par quatre vis 3/8 × 1 3/4 (P014 rep. 30 et écrous rep. 28).
  const holder = (s) => {
    const zc = s * (v.zHolder + v.tHolder / 2);
    const { x, y } = v.holder;
    const outline = [[x[0], y[0]], [x[1], y[0]], [x[1], y[1] - 0.6], [x[1] - 0.6, y[1]], [x[0] + 0.6, y[1]], [x[0], y[1] - 0.6]];
    const holes = [[0, 0, 55 / 25.4 / 2 - 0.02], [gx, gy, 0.5], [1.9, -2.6, 0.2], [-2.2, 1.9, 0.2], [2.2, 1.9, 0.2]];
    const foot = s * v.zFoot;
    const footHoles = v.feet;
    return group(
      at(K.sheet(outline.map(([a, b]) => [a * IN, b * IN]), holes.map(([a, b, r]) => [a * IN, b * IN, r * IN]), v.tHolder * IN, 'grey', 0, 24), [0, 0, zc * IN]),
      // Pied : plaque horizontale percée de quatre trous de 3/8.
      at(S.plate((x[1] - x[0]) * IN, 1.25 * IN, 0.5 * IN, 'grey', { holes: footHoles.map(([a, b]) => [(a) * IN, b * IN * s, 0.21 * IN]) }), p3(0, y[0] + 0.25, foot)),
      // Rebord côté +X (raidisseur plié), sur la hauteur.
      at(box(0.5 * IN, (y[1] - y[0] - 1.1) * IN, 1.0 * IN, 'grey', { r: 0.002 }), p3(x[1] - 0.25, (y[0] + y[1] - 0.6) / 2 + 0.25, s * (v.zHolder - 0.5))),
    );
  };
  P('1', holder(1), [3, 2, 6]);
  P('3', holder(-1), [-2, 3, -6]);

  // ---------------------------------------------------------------- 2 — roulements 6006-2RS, logés dans les porte-roulements
  const [bi, bo, bw] = [30 / 25.4, 55 / 25.4, 13 / 25.4]; // [norme]
  for (const s of [1, -1]) P('2', at(bearing((bo / 2) * IN, (bi / 2) * IN, bw * IN, 'steel', { axis: 'z' }), p3(0, 0, s * (v.zHolder + v.tHolder / 2))), [0, 0, s * 4]);

  // ---------------------------------------------------------------- 4 — vis 206-403 à double filet croisé
  // Fût Ø 1 1/2 à gorges demi-rondes (largeur 0,32, profondeur 0,14 po, avance 7/8 po) sur la course du suiveur,
  // portées lisses, portées des 6006, bout droit Ø 1 po (gorge du jonc 32 de P014, trou de la goupille 34) jusqu'au
  // volant, trou taraudé 1/2-13 au bout gauche (vis à embase 6).
  const zG = v.zHolder - 0.55; // gorges de −zG à +zG
  const screwBody = new T.Mesh(crossScrewGeo(T, v.rCore * IN, -zG * IN, zG * IN, 0.875 * IN, 0.32 * IN, 0.14 * IN));
  const r0 = v.rCore, rj = v.rJournal, re = v.rEnd;
  const ends = lathe([
    [0, v.zEndL], [rj - 0.04, v.zEndL], [rj, v.zEndL + 0.04], [rj, -v.zHolder - 0.05], [r0, -v.zHolder + 0.05], [r0, -zG],
    [0, -zG],
  ].map(([r, z]) => [r * IN, z * IN]), 'steel', { axis: 'z', seg: 32 });
  const endR = lathe([
    [0, zG], [r0, zG], [r0, v.zHolder - 0.05], [rj, v.zHolder + 0.05], [rj, v.zHolder + v.tHolder + 0.08], [re, v.zHolder + v.tHolder + 0.1],
    [re, 9.86], [re - 0.04, 9.87], [re - 0.04, 9.92], [re, 9.93], // gorge du jonc extérieur (P014 rep. 32)
    [re, v.zEndR - 0.04], [re - 0.04, v.zEndR], [0, v.zEndR],
  ].map(([r, z]) => [r * IN, z * IN]), 'steel', { axis: 'z', seg: 32 });
  P('4', group(merged([screwBody], 'steel'), ends, endR), [0, -1.5, 0]);

  // ---------------------------------------------------------------- 5, 6 — rondelle 206-004 et vis à embase 1/2-13 × 1 1/4 au bout gauche
  P('5', at(ring(0.875 * IN, 0.27 * IN, 0.19 * IN, 'steel', { axis: 'z', seg: 32 }), p3(0, 0, v.zEndL - 0.095)), [0, 0, -5]);
  P('6', group(
    at(bolt(0.5 * IN, 1.25 * IN, 'zinc', { axis: '-z' }), p3(0, 0, v.zEndL - 0.19)),
    at(cyl(0.5 * IN, 0.08 * IN, 'zinc', { axis: 'z', seg: 24 }), p3(0, 0, v.zEndL - 0.23)), // embase (rondelle intégrée)
  ), [0, 0, -7]);

  // ---------------------------------------------------------------- 10 — arbre de guidage 206-407, Ø 1 1/4 po
  // Bouts réduits Ø 1 po logés dans les porte-roulements, taraudés 5/16-18 (vis 15057 rep. 22).
  P('10', lathe([
    [0, -v.zHolder - 0.5], [0.46, -v.zHolder - 0.5], [0.5, -v.zHolder - 0.46], [0.5, -v.zHolder], [0.625, -v.zHolder + 0.04],
    [0.625, v.zHolder - 0.04], [0.5, v.zHolder], [0.5, v.zHolder + 0.46], [0.46, v.zHolder + 0.5], [0, v.zHolder + 0.5],
  ].map(([r, z]) => [r * IN, z * IN]), 'steel', { axis: 'z', seg: 28, pos: p3(gx, gy, 0) }), [-1.5, -3, 0]);

  // ---------------------------------------------------------------- 16 — plat 206-411 (1 × 1/2 po) entre les pieds des porte-roulements
  // Trou au milieu et fentes aux bouts (page 16).
  const bar = K.sheet([[0, -0.5], [v.zHolder * 2, -0.5], [v.zHolder * 2, 0.5], [0, 0.5]].map(([a, b]) => [a * IN, b * IN]),
    [[v.zHolder, 0, 0.17], slot([0.9, 0], 0.9, 0.34).map(([a, b]) => [a, b]), slot([v.zHolder * 2 - 0.9, 0], 0.9, 0.34)]
      .map((h) => (Array.isArray(h[0]) ? h.map(([a, b]) => [a * IN, b * IN]) : [h[0] * IN, h[1] * IN, h[2] * IN])), 0.5 * IN, 'darkSteel', 0, 16);
  const barG = group(bar);
  // Plat couché : longueur (x local) selon Z, largeur (y local) selon X, épaisseur (z local) selon Y.
  barG.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(0, 0, 1), new T.Vector3(1, 0, 0), new T.Vector3(0, 1, 0)));
  barG.position.set(1.8 * IN, (v.holder.y[0] + 0.5 + 0.25) * IN, -v.zHolder * IN);
  P('16', group(barG), [-1, -4, 0]);

  // ---------------------------------------------------------------- 7 — bloc suiveur 206-005
  // Cube 4 (X) × 3 1/2 (Z) × 3 3/4 (Y) po et talon de l'arbre de guidage ; alésage Ø 2 de la vis le long de Z,
  // alésage Ø 1 1/4 du guidage dans le talon, alésage Ø 1 3/4 du suiveur sur la face −X (vers l'arrière),
  // quatre trous taraudés 3/8 sur le dessus (support des rouleaux).
  const BZ = 1.75, BY = [-1.75, 2.0], BX = [-2, 2];
  const blockFace = K.sheet(
    [[BX[0], BY[0]], [-1.6, BY[0]], [-1.6, -3.2], [0.4, -3.2], [0.4, BY[0]], [BX[1], BY[0]], [BX[1], BY[1]], [BX[0], BY[1]]].map(([a, b]) => [a * IN, b * IN]),
    [[0, 0, 1.0 * IN], [gx * IN, gy * IN, 0.64 * IN]], 2 * BZ * IN, 'grey', 0, 32);
  const block = group(
    blockFace,
    // Bossage de l'alésage du suiveur (face −X) avec les deux trous taraudés du chapeau.
    at(ring(1.25 * IN, 0.875 * IN, 0.05 * IN, 'grey', { axis: 'x', seg: 32 }), p3(BX[0] - 0.02, 0, 0)),
    // Fonds des trous taraudés du dessus (lecture des 4 vis 15107).
    ...[-1, 1].flatMap((a) => [-1, 1].map((b) => at(cyl(0.2 * IN, 0.02 * IN, 'blackOxide', { seg: 12 }), p3(a * 1.3, BY[1] + 0.005, b * 1.15)))),
  );
  P('7', at(block, p3(0, 0, zf)), [0, 0, 8]);

  // 8 — bagues en bronze 206-006 (Ø 2 × Ø 1 1/2 × 1 po) aux deux bouts de l'alésage ; 9 — joncs N5000-200.
  for (const s of [1, -1]) {
    P('8', at(ring(1.0 * IN, 0.755 * IN, 1.0 * IN, 'brass', { axis: 'z', seg: 32 }), p3(0, 0, zf + s * (BZ - 0.6))), [0, 0, s * 4 + 8]);
    P('9', at(api.S.torus(0.985 * IN, 0.035 * IN, 'blackOxide', { axis: 'z' }), p3(0, 0, zf + s * (BZ - 0.06))), [0, 0, s * 6 + 8]);
  }

  // 11 — bague Thordon 206-008 (Ø 1 3/4 × Ø 1 × 0,9 po), 12 — jonc N5000-175, 13 — suiveur 206-009 (bronze :
  // tige Ø 1 po à nez en lame qui suit la gorge, tête Ø 1 1/2), 14 — chapeau 206-010 (Ø 2 5/8 × 0,45) et ses
  // deux vis 15105 3/8 × 1 (rep. 15), le tout sur la face −X du bloc.
  P('11', at(ring(0.875 * IN, 0.5 * IN, 0.9 * IN, 'cream', { axis: 'x', seg: 28 }), p3(BX[0] + 0.5, 0, zf)), [-5, 0, 8]);
  P('12', at(api.S.torus(0.86 * IN, 0.03 * IN, 'blackOxide', { axis: 'x' }), p3(BX[0] + 0.06, 0, zf)), [-6.5, 0, 8]);
  const pawl = group(
    at(cyl(0.495 * IN, 1.15 * IN, 'brass', { axis: 'x', seg: 24 }), p3(-1.35, 0, 0)),
    at(cyl(0.72 * IN, 0.16 * IN, 'brass', { axis: 'x', seg: 28 }), p3(BX[0] + 0.08, 0, 0)),
    // Nez : lame dans le plan de la gorge (inclinée sur l'hélice), engagée de 0,13 po.
    at(box(0.3 * IN, 0.95 * IN, 0.2 * IN, 'brass', { r: 0.002 }), p3(-0.74, 0, 0), [Math.atan(0.875 / (Math.PI * 1.5)), 0, 0]),
  );
  P('13', at(pawl, p3(0, 0, zf)), [-8, 0, 8]);
  P('14', at(lathe([[0.15, 0], [1.31, 0], [1.31, 0.4], [1.25, 0.45], [0.15, 0.45]].map(([r, z]) => [r * IN, z * IN]), 'grey', { axis: '-x', seg: 36 }), p3(BX[0], 0, zf)), [-10, 0, 8]);
  for (const s of [1, -1]) P('15', at(bolt(0.375 * IN, 1.0 * IN, 'brass', { axis: '-x' }), p3(BX[0] - 0.45, 0, zf + s * 0.95)), [-12, 0, 8]);

  // 23 — graisseurs 1/4-28 : au centre du chapeau (suiveur) et sur la face +X du bloc (bagues en bronze).
  const fitting = (axis) => group(
    at(cyl(0.125 * IN, 0.25 * IN, 'zinc', { axis: 'y', seg: 12 }), p3(0, 0.125, 0)),
    at(S.nut(0.4375 * IN, 0.2 * IN, 'zinc'), p3(0, 0.33, 0)),
    at(cyl(0.1 * IN, 0.18 * IN, 'zinc', { axis: 'y', seg: 12 }), p3(0, 0.52, 0)),
    at(S.ball(0.11 * IN, 'zinc'), p3(0, 0.66, 0)),
  ).rotateOnAxis(new T.Vector3(...axis), Math.PI / 2);
  P('23', at(fitting([0, 0, 1]), p3(BX[0] - 0.45, 0, zf)), [-13, 0, 8]);
  P('23', at(fitting([0, 0, -1]), p3(BX[1], 0.9, zf)), [3, 0, 8]);
  // 24 — vis de pression 1/4-28 × 1/4 (bouchon du passage de graisse, coin du dessus).
  P('24', at(cyl(0.125 * IN, 0.25 * IN, 'blackOxide', { seg: 6 }), p3(1.65, BY[1] - 0.12, zf + 1.4)), [2, 4, 8]);

  // ---------------------------------------------------------------- 17 — support des rouleaux 206-012
  // Semelle 5 × 3 1/2 × 3/8 po boulonnée sur le bloc (débordant vers +X sous les rouleaux verticaux), deux joues
  // ajourées (deux fentes oblongues chacune, oreilles des rouleaux horizontaux aux bouts), traverse du haut qui
  // tient le haut des rouleaux verticaux.
  const SY = BY[1]; // dessus du bloc
  const cheekZ = 1.625; // axe des joues (t = 1/4)
  const cheek = [[-3.1, SY + 0.375], [3.4, SY + 0.375], [4.55, SY + 1.0], [4.55, SY + 2.3], [3.9, SY + 2.95], [-3.9, SY + 2.95], [-4.55, SY + 2.3], [-4.55, SY + 1.0]];
  const cheekHoles = [[-3.8, SY + 1.6, 0.26], [3.8, SY + 1.6, 0.26], slot([-1.55, SY + 1.55], 2.0, 0.55), slot([1.0, SY + 1.55], 2.0, 0.55)];
  const holesIn = cheekHoles.map((h) => (Array.isArray(h[0]) ? h.map(([a, b]) => [a * IN, b * IN]) : [h[0] * IN, h[1] * IN, h[2] * IN]));
  const support = group(
    at(S.plate(5.0 * IN, 3.5 * IN, 0.375 * IN, 'grey', { holes: [[-1.3, -1.15], [-1.3, 1.15], [1.3, -1.15], [1.3, 1.15]].map(([a, b]) => [(a - 0.5) * IN, b * IN, 0.2 * IN]).concat([[1.9 * IN, -0.625 * IN, 0.19 * IN], [1.9 * IN, 0.625 * IN, 0.19 * IN]]) }), p3(0.5, SY + 0.1875, 0)),
    ...[1, -1].map((s) => K.sheet(cheek.map(([a, b]) => [a * IN, b * IN]), holesIn, 0.25 * IN, 'grey', s * cheekZ * IN, 20)),
    at(box(1.6 * IN, 0.25 * IN, 3.5 * IN, 'grey', { r: 0.001 }), p3(2.4, SY + 3.075, 0)), // traverse du haut
  );
  P('17', at(support, p3(0, 0, zf)), [0, 6, 8]);

  // 18 — rouleaux verticaux 206-013V (Ø 1 po) : tube 206-013-3 entre deux bagues à collerette 206-013-2, de part
  // et d'autre du câble, entre la semelle et la traverse du haut ; 20 — boulons à épaulement 1/2 × 3 1/2 po.
  const rollV = (len) => group(
    at(ring(0.5 * IN, 0.33 * IN, (len - 0.25) * IN, 'steel', { axis: 'y', seg: 24 }), [0, 0, 0]),
    ...[1, -1].map((s) => group(
      at(ring(0.36 * IN, 0.25 * IN, 0.5 * IN, 'brass', { axis: 'y', seg: 20 }), p3(0, s * (len / 2 - 0.25), 0)),
      at(ring(0.56 * IN, 0.25 * IN, 0.06 * IN, 'brass', { axis: 'y', seg: 24 }), p3(0, s * (len / 2 - 0.03), 0)),
    )),
  );
  const yV = [SY + 0.375, SY + 2.95]; // de la semelle à la traverse
  const lenV = yV[1] - yV[0] - 0.02;
  for (const s of [1, -1]) {
    P('18', at(rollV(lenV), p3(1.9 + 0.5, (yV[0] + yV[1]) / 2, zf + s * 0.625)), [2, 9, 8 + s * 2]);
  }
  // 19 — rouleaux horizontaux 206-013H : rouleau 206-013-1 en diabolo (joues Ø 2 po, fût Ø 1 1/4) et deux bagues à
  // collerette 206-013-2, axe selon Z entre les joues.
  const lenH = 2 * cheekZ - 0.25 - 0.02;
  const rollH = group(
    lathe([[0.25, -lenH / 2 + 0.06], [1.0, -lenH / 2 + 0.06], [1.0, -lenH / 2 + 0.36], [0.625, -lenH / 2 + 0.7], [0.625, lenH / 2 - 0.7], [1.0, lenH / 2 - 0.36], [1.0, lenH / 2 - 0.06], [0.25, lenH / 2 - 0.06]]
      .map(([r, z]) => [r * IN, z * IN]), 'steel', { axis: 'z', seg: 36 }),
    ...[1, -1].map((s) => at(ring(0.38 * IN, 0.25 * IN, 0.06 * IN, 'brass', { axis: 'z', seg: 20 }), p3(0, 0, s * (lenH / 2 - 0.03)))),
  );
  const hx = [-3.8, 3.8];
  for (const x of hx) P('19', at(rollH.clone(), p3(x, SY + 1.6, zf)), [x * 1.4, 8, 8]);

  // 20 — boulons à épaulement 1/2 × 3 1/2 (filet 3/8-16) : deux verticaux (rouleaux V, tête sur la traverse, filet
  // dans la semelle) et deux selon Z (rouleaux H, tête côté +Z, écrou 37024 côté −Z, rep. 21).
  const shoulder = (axis) => group(
    at(cyl(0.375 * IN, 0.5 * IN, 'blackOxide', { axis: 'y', seg: 20 }), p3(0, 0.25, 0)),
    at(cyl(0.125 * IN, 0.06 * IN, 'gunmetal', { axis: 'y', seg: 6 }), p3(0, 0.48, 0)),
    at(cyl(0.25 * IN, 3.5 * IN, 'blackOxide', { axis: 'y', seg: 16 }), p3(0, -1.75, 0)),
    at(cyl(0.1875 * IN, 0.625 * IN, 'blackOxide', { axis: 'y', seg: 12 }), p3(0, -3.5 - 0.3125, 0)),
  );
  for (const s of [1, -1]) P('20', at(shoulder(), p3(2.4, yV[1] + 0.25, zf + s * 0.625)), [2, 13, 8 + s * 2]);
  for (const x of hx) {
    const sb = shoulder();
    sb.rotation.x = Math.PI / 2; // tête vers +Z
    P('20', at(group(sb), p3(x, SY + 1.6, zf + cheekZ + 0.125)), [x * 1.4, 8, 13]);
    P('21', at(nut(0.5625 * IN, 0.33 * IN, 'zinc', { axis: 'z' }), p3(x, SY + 1.6, zf - cheekZ - 0.125 - 0.165)), [x * 1.4, 8, 3]);
  }

  // 26 — vis 15107 3/8-16 × 1 1/4 (semelle → bloc), 25 — rondelles Grower 3/8 sous les têtes.
  const sp = [[-1.3, -1.15], [-1.3, 1.15], [1.3, -1.15], [1.3, 1.15]].map(([a, b]) => [a - 0.5 + 0.5, b]);
  for (const [a, b] of sp) {
    P('25', at(ring(0.34 * IN, 0.2 * IN, 0.09 * IN, 'zinc', { axis: 'y', seg: 16 }), p3(a, SY + 0.42, zf + b)), [0, 15, 8]);
    P('26', at(bolt(0.375 * IN, 1.25 * IN, 'brass'), p3(a, SY + 0.465, zf + b)), [0, 17, 8]);
  }

  // 22 — vis 15057 5/16-18 × 1 1/4 dans les bouts de l'arbre de guidage, 27 — rondelles Grower 5/16.
  for (const s of [1, -1]) {
    const zo = s * (v.zHolder + v.tHolder);
    P('27', at(ring(0.29 * IN, 0.17 * IN, 0.08 * IN, 'zinc', { axis: 'z', seg: 16 }), p3(gx, gy, zo + s * 0.04)), [0, -2, s * 9]);
    P('22', at(bolt(0.3125 * IN, 1.25 * IN, 'brass', { axis: s > 0 ? 'z' : '-z' }), p3(gx, gy, zo + s * 0.08)), [0, -2, s * 11]);
  }

  return { view: { dir: [-1, 0.75, 1.05] } };
}

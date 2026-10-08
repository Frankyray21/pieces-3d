// P208 — Porteur sur roues (« CLTR ASSY, FRAME ») : porteur articulé Pegasus
// à 4 roues (châssis avant et arrière, articulation centrale et vérins de
// direction, essieux, cabine de translation, capot du moteur diesel,
// stabilisateurs arrière) et équipements du pont avant, en formes simplifiées
// placées d'après les vues des pages 208, 210 et 212. Repère : voir layout.js.
import { WHEEL, AXLE, M, wheel, body, ram, flex } from './layout.js';

export function P208(api) {
  const { box, cyl, ring, tube, gauge, fitting, filterCanister, valveBank, enclosure, extrude, hydCylinder, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (ref, obj, e) => P(ref, body('front', obj), e); // pièce du châssis avant
  const { frameZ: FZ, frameBot: FB, frameTop: FT } = M;
  const C = M.cab, E = M.engine;
  const UP = (dx, h, dz) => [dx, h, dz];

  // Flanc de châssis : profil extrudé (épaisseur selon Z) avec trous d'allègement.
  const sidePlate = (pts, holes, z) => at(extrude(pts, 0.03, 'lightGrey', { holes }), [0, 0, z]);
  const frontSide = [[0.25, FB + 0.08], [0.25, FT - 0.05], [0.32, FT], [2.12, FT], [M.nose, FT - 0.08], [M.nose, FB], [0.4, FB]];
  const rearSide = [[-2.75, FB], [-2.75, FT], [-0.32, FT], [-0.25, FT - 0.05], [-0.25, FB + 0.08], [-0.4, FB]];
  // Stabilisateur : support et fût fixes, tige et patin mobiles (corps jackL / jackR).
  const jack = (x, z) => group(
    at(box(0.12, 0.16, Math.abs(z) - FZ + 0.06, 'lightGrey'), [x, FT - 0.08, Math.sign(z) * (FZ + Math.abs(z)) / 2]),
    at(box(0.2, 0.22, 0.2, 'lightGrey', { r: 0.01 }), [x, FT - 0.05, z]),
    at(cyl(0.075, 0.85, 'grey'), [x, 0.68, z]),
    body(z > 0 ? 'jackR' : 'jackL', group(
      at(cyl(0.05, 0.3, 'chrome'), [x, 0.22, z]),
      at(cyl(0.13, 0.03, 'darkSteel', { seg: 32 }), [x, 0.065, z]),
      at(cyl(0.15, 0.05, 'darkSteel', { seg: 32 }), [x, 0.025, z]),
    )),
  );
  const axle = (x) => group(
    at(box(0.22, 0.2, 1.42, 'charcoal', { r: 0.03 }), [x, AXLE.y, 0]),
    at(cyl(0.17, 0.36, 'charcoal', { axis: 'z', seg: 36 }), [x, AXLE.y, 0]),
    ...[1, -1].map((s) => at(cyl(0.17, 0.14, 'darkSteel', { axis: 'z', seg: 32 }), [x, AXLE.y, s * 0.64])),
  );
  const wheels = [[AXLE.front, 'wF'], [AXLE.rear, 'wR']].flatMap(([x, w]) => [1, -1].map((s) => body(w + (s > 0 ? 'R' : 'L'), at(wheel(api.S, { side: s }), [x, AXLE.y, s * WHEEL.z]))));

  // 7 — porteur Pegasus : châssis, articulation, essieux et roues, garde-boue,
  // réservoir hydraulique, cabine de translation, capot moteur, stabilisateurs, marchepied
  P('7', group(
    // châssis avant (corps « front », pivote autour de l'articulation) : flancs, bloc de nez,
    // traverses, garde-boue, chapes d'articulation, essieu avant, réservoir hydraulique
    body('front', group(
      ...[1, -1].map((s) => sidePlate(frontSide, [[0.75, 0.7, 0.09], [1.25, 0.72, 0.07]], s * FZ)),
      at(box(0.25, FT - FB, 2 * FZ - 0.03, 'lightGrey'), [M.nose - 0.125, (FT + FB) / 2, 0]),
      ...[1, -1].map((s) => at(cyl(0.07, 0.05, 'darkSteel', { axis: 'x' }), [M.nose + 0.02, 0.72, s * 0.25])),
      at(box(0.06, 0.12, 2 * FZ, 'lightGrey'), [0.3, FT - 0.06, 0]),
      at(box(0.06, 0.12, 2 * FZ, 'lightGrey'), [1.05, FB + 0.06, 0]),
      ...[1, -1].map((s) => group(
        at(box(1.2, 0.025, 1.04 - FZ, 'lightGrey'), [1.65, M.fender, s * (FZ + (1.04 - FZ) / 2)]),
        at(box(0.025, 0.12, 1.04 - FZ, 'lightGrey'), [2.25, M.fender - 0.05, s * (FZ + (1.04 - FZ) / 2)]),
        at(box(1.2, 0.1, 0.02, 'lightGrey'), [1.65, M.fender - 0.05, s * 1.03]),
        at(box(0.06, M.fender - FT, 0.06, 'lightGrey'), [1.1, (M.fender + FT) / 2, s * (FZ + 0.03)]),
      )),
      ...[FB + 0.04, FT - 0.04].map((y) => at(box(0.55, 0.05, 0.42, 'lightGrey'), [0.05, y, 0])),
      axle(AXLE.front),
      at(box(0.36, 0.55, 0.9, 'lightGrey', { r: 0.02 }), [0.46, FT + 0.275, 0]),
      at(cyl(0.05, 0.05, 'black'), [0.4, FT + 0.575, 0.25]),
      at(cyl(0.025, 0.08, 'darkSteel'), [0.52, FT + 0.59, -0.3]),
      at(box(0.01, 0.16, 0.04, 'glass'), [0.645, FT + 0.3, 0.3]),
    )),
    // châssis arrière
    ...[1, -1].map((s) => sidePlate(rearSide, [[-2.15, 0.7, 0.08], [-1.0, 0.7, 0.08]], s * FZ)),
    at(box(0.06, FT - FB, 2 * FZ, 'lightGrey'), [-2.72, (FT + FB) / 2, 0]),
    at(box(0.06, 0.12, 2 * FZ, 'lightGrey'), [-0.32, FT - 0.06, 0]),
    // articulation centrale : oreilles du châssis arrière, axes verticaux
    ...[FB + 0.1, FT - 0.1].map((y) => at(box(0.5, 0.05, 0.36, 'lightGrey'), [-0.12, y, 0])),
    ...[FB + 0.07, FT - 0.07].map((y) => at(cyl(0.085, 0.14, 'darkSteel', { seg: 32 }), [0, y, 0])),
    // essieu arrière et roues
    axle(AXLE.rear), ...wheels,
    // cabine de translation : caisse, montants, toit cintré, vitres, siège, volant, pupitre
    at(box(C.x1 - C.x0, 0.45, C.z1 - C.z0, 'lightGrey', { r: 0.02 }), [(C.x0 + C.x1) / 2, FT + 0.225, (C.z0 + C.z1) / 2]),
    ...[[C.x0, C.z0], [C.x0, C.z1], [C.x1, C.z0], [C.x1, C.z1]].map(([x, z]) => at(box(0.05, 0.68, 0.05, 'lightGrey'), [x + Math.sign((C.x0 + C.x1) / 2 - x) * 0.025, FT + 0.79, z + Math.sign((C.z0 + C.z1) / 2 - z) * 0.025])),
    at(extrude([[C.x0 - 0.05, 2.1], [C.x1 + 0.07, 2.1], [C.x1 + 0.09, 2.16], [C.x1 - 0.05, 2.23], [(C.x0 + C.x1) / 2, C.top + 0.04], [C.x0 - 0.05, C.top + 0.02]], C.z1 - C.z0 + 0.1, 'lightGrey'), [0, 0, (C.z0 + C.z1) / 2]),
    at(box(0.008, 0.6, C.z1 - C.z0 - 0.1, 'glass'), [C.x1 - 0.01, 1.77, (C.z0 + C.z1) / 2]),
    at(box(0.008, 0.6, C.z1 - C.z0 - 0.1, 'glass'), [C.x0 + 0.01, 1.77, (C.z0 + C.z1) / 2]),
    at(box(C.x1 - C.x0 - 0.1, 0.6, 0.008, 'glass'), [(C.x0 + C.x1) / 2, 1.77, C.z1 - 0.01]),
    at(box(C.x1 - C.x0 - 0.1, 0.6, 0.008, 'glass'), [(C.x0 + C.x1) / 2, 1.77, C.z0 + 0.01]),
    at(box(0.4, 0.08, 0.45, 'black', { r: 0.02 }), [-0.72, FT + 0.5, 0.45]),
    at(box(0.08, 0.5, 0.45, 'black', { r: 0.02 }), [-0.93, FT + 0.75, 0.45]),
    at(box(0.22, 0.3, 0.6, 'charcoal', { r: 0.02 }), [-0.3, FT + 0.6, 0.45]),
    at(api.S.torus(0.14, 0.012, 'black'), [-0.36, FT + 0.8, 0.45], [0, 0, 0.5]),
    // capot du moteur diesel : soubassement entre les roues, caisson, préfiltre, persiennes
    at(box(E.x1 - E.x0, 0.25, 1.24, 'lightGrey'), [(E.x0 + E.x1) / 2, FT + 0.1, 0]),
    at(box(E.x1 - E.x0, E.top - 1.2, 1.96, 'lightGrey', { r: 0.04 }), [(E.x0 + E.x1) / 2, (E.top + 1.2) / 2, 0]),
    at(cyl(0.15, 0.08, 'charcoal', { seg: 36 }), [-2.22, E.top + 0.04, -0.49]),
    at(cyl(0.13, 0.1, 'charcoal', { r2: 0.07, seg: 36 }), [-2.22, E.top + 0.13, -0.49]),
    ...Array.from({ length: 6 }, (_, i) => at(box(0.5, 0.02, 0.02, 'darkSteel'), [-2.3, 1.38 + i * 0.07, 0.99])),
    ...[-2.0, -1.5].map((x) => at(box(0.01, 0.6, 0.006, 'darkSteel'), [x, 1.58, 0.983])),
    // stabilisateurs arrière
    jack(M.jackX, 0.85), jack(M.jackX, -0.85),
    // marchepied de la cabine
    group(
      ...[-0.95, -0.55].map((x) => at(box(0.04, 0.7, 0.04, 'lightGrey'), [x, 0.68, 1.02])),
      ...[0.45, 0.68, 0.9].map((y) => at(box(0.44, 0.03, 0.18, 'safety'), [-0.75, y, 1.06])),
    ),
  ), [0, 0, 0]);

  // 3 — tôles de protection sous les châssis (avant, arrière, couvre-articulation)
  P('3', group(
    body('front', at(box(1.05, 0.02, 2 * FZ, 'grey'), [0.88, FB - 0.01, 0])),
    at(box(0.85, 0.02, 2 * FZ, 'grey'), [-2.3, FB - 0.01, 0]),
    at(box(1.0, 0.02, 2 * FZ, 'grey'), [-0.85, FB - 0.01, 0]),
    at(box(0.5, 0.015, 0.5, 'grey'), [0, FB - 0.03, 0]),
  ), [0, -0.45, 0]);

  // 8 — couvercle du pont avant (tôle pliée, caoutchoucs, goupilles)
  F('8', group(
    at(box(0.7, 0.02, 2 * FZ, 'grey'), [1.55, M.fender, 0]),
    ...[1, -1].map((s) => at(box(0.6, 0.012, 0.3, 'rubber'), [1.55, M.fender + 0.016, s * 0.24])),
    ...[[1.25, 0.4], [1.25, -0.4], [1.85, 0.4], [1.85, -0.4]].map(([x, z]) => at(cyl(0.012, 0.06, 'steel'), [x, M.fender + 0.03, z])),
  ), [0, 0.55, 0]);

  // 9 — groupe de pompage : moteur 60 HP horizontal entre les flancs, pompes 100 cc et 74 cc à l'avant
  F('9', group(
    at(cyl(0.22, 0.62, 'blue', { axis: 'x', seg: 40 }), [0.62, 0.74, 0]),
    ...[0.42, 0.52, 0.62, 0.72, 0.82].map((x) => at(ring(0.235, 0.21, 0.012, 'blue', { axis: 'x', seg: 40 }), [x, 0.74, 0])),
    at(box(0.46, 0.06, 0.36, 'blue'), [0.62, 0.5, 0]),
    at(box(0.12, 0.3, 0.3, 'blue', { r: 0.02 }), [0.62, 0.74, 0.26]),
    at(cyl(0.2, 0.1, 'darkSteel', { axis: 'x', r2: 0.15 }), [1.0, 0.74, 0]),
    at(box(0.2, 0.2, 0.2, 'black', { r: 0.015 }), [1.15, 0.74, 0]),
    at(box(0.17, 0.17, 0.17, 'black', { r: 0.015 }), [1.335, 0.74, 0]),
  ), UP(0, 0.55, 0));
  // 13 / 24 — adaptateurs d'aspiration (réservoir → pompes), 22 — adaptateurs de refoulement
  F('13', group(
    tube([[0.4, FT + 0.01, -0.33], [0.4, 0.9, -0.33], [1.15, 0.9, -0.33], [1.15, 0.86, -0.08]], 0.035, 'black', { sharp: true, seg: 6 }),
    at(fitting(0.06, 0.08, 'steel', { axis: '-y' }), [0.4, FT - 0.02, -0.33]),
  ), UP(0, 0.35, -0.2));
  F('24', group(
    tube([[0.52, FT + 0.01, 0.33], [0.52, 0.9, 0.33], [1.335, 0.9, 0.33], [1.335, 0.84, 0.07]], 0.03, 'black', { sharp: true, seg: 6 }),
    at(fitting(0.05, 0.07, 'steel', { axis: '-y' }), [0.52, FT - 0.02, 0.33]),
  ), UP(0, 0.35, 0.2));
  F('22', group(
    at(fitting(0.035, 0.06, 'steel', { axis: 'z' }), [1.15, 0.74, 0.11]),
    at(fitting(0.03, 0.06, 'steel', { axis: 'z' }), [1.335, 0.74, 0.095]),
  ), UP(0.2, 0.2, 0.35));

  // Bancs de vannes sur leur support transversal, leviers vers l'avant : 31 mise en place
  // (10 sections, côté droit) et 25 son couvercle, 32 forage (12 sections) et 26 son couvercle, 30 avance
  const bank = (n, z) => at(valveBank(n, { sw: 0.05, h: 0.15, d: 0.11 }), [0.82, 1.5, z], [0, -Math.PI / 2, 0]);
  F('7', group(
    ...[-0.85, 0, 0.85].map((z) => at(box(0.06, 0.42, 0.06, 'lightGrey'), [0.82, FT + 0.21, z])),
    at(box(0.12, 0.05, 1.86, 'lightGrey'), [0.82, FT + 0.395, 0]),
  ), UP(0, 0.3, 0));
  F('31', bank(10, 0.45), UP(0.2, 0.5, 0.2));
  F('32', bank(12, -0.5), UP(0.2, 0.5, -0.2));
  F('30', at(valveBank(3, { sw: 0.05, h: 0.15, d: 0.11 }), [0.82, 1.5, -0.02], [0, -Math.PI / 2, 0]), UP(0.2, 0.55, 0));
  F('25', group(
    at(box(0.26, 0.012, 0.66, 'grey'), [0.82, 1.77, 0.45]),
    at(box(0.012, 0.2, 0.66, 'grey'), [0.69, 1.67, 0.45]),
  ), UP(0, 0.8, 0.2));
  F('26', group(
    at(box(0.26, 0.012, 0.76, 'grey'), [0.82, 1.77, -0.5]),
    at(box(0.012, 0.2, 0.76, 'grey'), [0.69, 1.67, -0.5]),
  ), UP(0, 0.8, -0.2));

  // 12 — panneau de manomètres (côté droit, face vers l'extérieur)
  F('12', group(
    at(box(0.3, 0.7, 0.02, 'grey'), [0.97, 1.55, 0.93]),
    ...[0, 1, 2].flatMap((i) => [0.9, 1.04].map((x) => at(gauge(0.045, { axis: 'z' }), [x, 1.78 - i * 0.2, 0.95]))),
  ), [0, 0.2, 0.5]);
  // 23 — traversée de raccordement DA101 / DA201 (plaque à connecteurs)
  F('23', group(
    at(box(0.02, 0.22, 0.3, 'grey'), [1.0, 1.12, 0.75]),
    ...[-0.08, 0, 0.08].flatMap((z) => [1.07, 1.17].map((y) => at(cyl(0.018, 0.04, 'black', { axis: 'x' }), [1.02, y, 0.75 + z]))),
  ), [0.3, 0.2, 0.3]);

  // Côté droit, sous le pont : 17 collecteur de pression, 18 collecteur de retour, 20 filtres haute pression,
  // 27 bloc de capteurs et 28 raccords rapides 3/8, 16 électrovanne de détection de charge, 33 sélecteur
  F('17', group(
    at(box(0.22, 0.1, 0.12, 'steel', { r: 0.006 }), [0.45, 0.85, 0.66]),
    ...[-0.07, 0, 0.07].map((x) => at(fitting(0.022, 0.04, 'steel', { axis: 'z' }), [0.45 + x, 0.85, 0.73])),
  ), [0, 0, 0.5]);
  F('18', group(
    at(box(0.26, 0.1, 0.12, 'steel', { r: 0.006 }), [0.8, 0.62, 0.62]),
    ...[-0.08, 0, 0.08].map((x) => at(fitting(0.025, 0.045, 'steel', { axis: 'z' }), [0.8 + x, 0.62, 0.69])),
  ), [0, -0.1, 0.5]);
  F('20', group(
    at(filterCanister(0.06, 0.32), [0.85, 0.98, 0.67]),
    at(filterCanister(0.06, 0.32), [1.0, 0.98, 0.67]),
  ), [0.1, 0.1, 0.55]);
  F('27', group(
    at(box(0.14, 0.06, 0.08, 'steel', { r: 0.004 }), [0.4, 0.62, 0.62]),
    ...[-0.04, 0, 0.04].map((x) => at(cyl(0.012, 0.05, 'black', { axis: 'z' }), [0.4 + x, 0.62, 0.68])),
  ), [-0.2, -0.1, 0.5]);
  F('28', group(
    ...[-0.04, 0.04].map((x) => at(fitting(0.016, 0.04, 'brass', { axis: 'z' }), [0.4 + x, 0.53, 0.64])),
  ), [-0.2, -0.25, 0.5]);
  F('16', group(
    at(box(0.08, 0.08, 0.08, 'steel', { r: 0.004 }), [0.62, 0.5, 0.6]),
    at(cyl(0.025, 0.07, 'black', { axis: 'z' }), [0.62, 0.5, 0.67]),
  ), [0, -0.3, 0.5]);
  F('33', at(box(0.06, 0.06, 0.06, 'steel', { r: 0.004 }), [0.62, 0.64, 0.58]), [0, -0.15, 0.55]);
  // 14 — électrovannes d'air (rampe) sur le flanc droit avant
  F('14', group(
    at(box(0.3, 0.04, 0.1, 'grey'), [1.6, 0.85, 0.63]),
    ...[-0.1, 0, 0.1].map((x) => at(box(0.05, 0.08, 0.06, 'black'), [1.6 + x, 0.91, 0.63])),
  ), [0, 0.15, 0.45]);

  // Côté gauche, sous le pont : 2 support du réservoir et de la pompe de graisse, 15 injection
  // de graisse (réservoir + pompe), 5 indicateur de bas niveau, 6 support du boîtier de commande
  // de la pompe à huile, 10 bouton de la pompe de remplissage, 11 pompe à eau
  F('2', group(
    at(box(0.5, 0.03, 0.34, 'grey'), [0.8, 0.48, -0.66]),
    ...[0.57, 1.03].map((x) => at(box(0.03, 0.4, 0.03, 'grey'), [x, 0.68, -0.8])),
    at(box(0.5, 0.03, 0.03, 'grey'), [0.8, 0.88, -0.8]),
  ), [0, -0.2, -0.5]);
  F('15', group(
    at(cyl(0.11, 0.3, 'red', { seg: 32 }), [0.68, 0.645, -0.68]),
    at(box(0.12, 0.1, 0.1, 'darkSteel', { r: 0.008 }), [0.68, 0.84, -0.68]),
    at(cyl(0.03, 0.12, 'darkSteel'), [0.68, 0.95, -0.68]),
  ), [0, 0.1, -0.55]);
  F('5', group(
    at(cyl(0.02, 0.06, 'darkSteel'), [0.76, 0.82, -0.6]),
    at(cyl(0.012, 0.03, 'red'), [0.76, 0.86, -0.6]),
  ), [0, 0.35, -0.45]);
  F('6', group(
    at(box(0.03, 0.24, 0.2, 'grey'), [1.0, 0.7, -0.7]),
    at(enclosure(0.2, 0.2, 0.1, 'grey'), [0.9, 0.7, -0.66]),
  ), [0.1, 0, -0.55]);
  F('10', group(
    at(box(0.07, 0.07, 0.05, 'grey'), [1.02, 0.95, -0.77]),
    at(cyl(0.016, 0.02, 'green', { axis: 'z' }), [1.02, 0.95, -0.8]),
  ), [0.2, 0.15, -0.45]);
  F('11', group(
    at(box(0.36, 0.02, 0.22, 'grey'), [0.42, FT + 0.01, -0.72]),
    at(cyl(0.08, 0.18, 'blue', { axis: 'x' }), [0.36, FT + 0.11, -0.72]),
    at(cyl(0.09, 0.08, 'darkSteel', { axis: 'x' }), [0.52, FT + 0.11, -0.72]),
    at(fitting(0.03, 0.05, 'steel'), [0.52, FT + 0.22, -0.72]),
  ), [0, 0.4, -0.4]);

  // 34 — graissage centralisé du porteur (bloc distributeur dans la cabine, côté gauche)
  P('34', group(
    at(box(0.06, 0.24, 0.04, 'steel', { r: 0.004 }), [-0.62, 1.67, C.z0 + 0.04]),
    ...[0, 1, 2, 3, 4].map((i) => at(fitting(0.008, 0.02, 'brass', { axis: 'z' }), [-0.62, 1.58 + i * 0.045, C.z0 + 0.07])),
  ), [0, 0, -0.4]);
  // 29 — refroidisseur hydraulique à gauche de la cabine (grille sur le dessus)
  P('29', group(
    at(box(0.5, 0.5, 0.34, 'darkSteel', { r: 0.01 }), [-0.7, FT + 0.25, -0.8]),
    ...Array.from({ length: 8 }, (_, i) => at(box(0.012, 0.012, 0.3, 'black'), [-0.91 + i * 0.06, FT + 0.505, -0.8])),
    at(cyl(0.13, 0.04, 'black', { axis: 'x' }), [-0.43, FT + 0.25, -0.8]),
  ), [0, 0.5, -0.45]);
  // 21 — boîtier de télésurveillance (colonne à l'avant gauche de la cabine)
  P('21', group(
    at(cyl(0.06, 0.6, 'grey'), [-0.25, FT + 0.3, -0.55]),
    at(box(0.14, 0.12, 0.1, 'grey', { r: 0.01 }), [-0.25, FT + 0.66, -0.55]),
    at(cyl(0.008, 0.2, 'black'), [-0.25, FT + 0.82, -0.55]),
  ), [0.15, 0.3, -0.4]);
  // 19 — support du panneau ERIS (trappe sur le capot moteur)
  P('19', group(
    at(box(0.36, 0.02, 0.28, 'grey'), [-1.73, E.top + 0.01, -0.25]),
    at(box(0.28, 0.025, 0.2, 'darkSteel'), [-1.73, E.top + 0.03, -0.25]),
  ), [0, 0.4, 0]);

  // 4 — tuyauterie d'air vers la glissière (tube 2 po le long du flanc droit, flexible à l'articulation)
  P('4', group(
    tube([[-2.35, 0.88, FZ + 0.05], [-0.35, 0.88, FZ + 0.05]], 0.03, 'steel', { sharp: true, seg: 2 }),
    flex(api.S, [[-0.35, 0.88, FZ + 0.05], [-0.15, 0.96, FZ + 0.12], [0.15, 0.96, FZ + 0.12], [0.35, 0.88, FZ + 0.05]], ['chassis', 'chassis', 'front', 'front'], 0.035, 'black', { seg: 16 }),
    body('front', tube([[0.35, 0.88, FZ + 0.05], [M.nose, 0.88, FZ + 0.05]], 0.03, 'steel', { sharp: true, seg: 2 })),
  ), [0, 0, 0.45]);
  // Arrière gauche, sous le capot : 1 bride 2 po NPTF code 61, 35 coude 45°, 36 mamelon, 37 flexible à bride
  P('1', at(fitting(0.06, 0.08, 'steel', { axis: 'x' }), [-2.62, 0.74, -0.6]), [-0.35, 0, -0.3]);
  P('35', at(fitting(0.06, 0.08, 'steel', { axis: 'x', elbow: true }), [-2.5, 0.74, -0.6]), [-0.25, 0, -0.35]);
  P('36', at(cyl(0.032, 0.08, 'steel', { axis: 'x' }), [-2.4, 0.74, -0.6]), [-0.15, 0, -0.4]);
  P('37', tube([[-2.36, 0.74, -0.6], [-2.0, 0.66, -0.6], [-1.2, 0.6, -0.56], [-0.78, 0.62, -0.56]], 0.035, 'black', { seg: 32 }), [0, -0.1, -0.45]);

  // Vérins de direction de part et d'autre de l'articulation (inclus dans le porteur) :
  // axes à 0,95 m en arrière et 0,45 m en avant de l'articulation, à 0,62 m de l'axe :
  // ±35° de braquage pour une course de 0,74 m (contrôlé par scripts/check-sim.mjs).
  const ST = { a: -0.95, b: 0.45, y: 0.72, z: 0.62, bore: 0.09 };
  for (const s of [1, -1]) {
    const r = ST.bore / 2, len = ST.b - ST.a - 0.6 * r - 0.9 * 0.55 * r;
    P('7', group(
      ram(s > 0 ? 'steerR' : 'steerL', 'chassis', 'front', at(hydCylinder(len, ST.bore, { material: 'black', ext: 0.36 }), [ST.a + 0.6 * r, ST.y, s * ST.z])),
      at(box(0.1, 0.1, 0.14, 'lightGrey'), [ST.a, ST.y, s * (ST.z - 0.07)]),
      body('front', at(box(0.1, 0.1, 0.14, 'lightGrey'), [ST.b, ST.y, s * (ST.z - 0.07)])),
    ), [0, 0, s * 0.35]);
  }
  return { view: { dir: [1.0, 0.75, 1.25] } };
}

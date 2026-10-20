// P068 — Groupe hydraulique 125 HP 600 V 60 Hz UM-064-FMX-005-100PPP (page
// 3.2), posé sur ses patins : cadre rouge à oreilles de levage et passages de
// fourche (96 7/8 × 48 1/4 × 60 15/16 po, page 3.1), moteur WEG 125 HP
// (bleu) et pompes Rexroth en tandem (P069), réservoir 110 gal et filtres de
// retour (P072, P073) sur le dessus, boîte électrique Hoffman, transformateur,
// refroidisseurs, collecteur de retour, pompe de remplissage à main,
// planchers grillagés rabattables à l'avant. Roues, moyeux et timon : options
// non montées (demande du client). Couleurs : dessins du manuel (rouge).
// Repère : origine au sol au centre du cadre, X vers l'avant (côté pompes et
// console), Y vers le haut, Z vers la droite.
import { lister, each, grid, IN } from './layout.js';

export const PP = { L: 96.875 * IN, W: 48.25 * IN, H: 60.9375 * IN, skid: 3.5 * IN, t: 3 * IN };
const MOTOR = { x: -0.52, y: 0.43, r: 0.29, len: 0.86 }; // axe du moteur et des pompes
// Plaque de raccords rapides sur le côté droit (+Z), vers l'avant : pression, retour, drain, eau
// (repère du groupe ; les boyaux vers la console partent de là, voir P002).
export const PP_PORTS = [0, 1, 2].map((i) => [0.0 + i * 0.13, 0.3, PP.W / 2 + 0.07]);
// Sortie du câble de commande (vers la console) sous la boîte électrique.
export const PP_CABLE = [-PP.L / 2 + 0.45, 0.8, PP.W / 2 - 0.05];

export function P068(api) {
  const { box, cyl, ring, shell, tube, hose, rod, plate, bolt, boltSet, group, at, lathe, torus, nut, merged, enclosure, filterCanister, ballValve, gauge, fitting } = api.S;
  const P = lister(api, 'P068');
  const { L, W, H, skid, t } = PP;
  const x0 = -L / 2, x1 = L / 2, z0 = -W / 2, z1 = W / 2;
  const base = skid + t / 2;

  // 5 — Cadre : patins, base, poteaux, cadre du haut, oreilles de levage, passages de fourche, plancher.
  const fr = [];
  for (const z of [z0 + t / 2, z1 - t / 2]) {
    fr.push(at(box(L + 0.12, skid, 0.1, 'red', { r: 0.008 }), [0, skid / 2, z]));
    for (const s of [-1, 1]) fr.push(at(box(0.12, skid * 0.8, 0.1, 'red', { r: 0.006 }), [s * (L / 2 + 0.07), skid * 0.75, z], [0, 0, s * 0.5]));
    fr.push(at(box(L, t, t, 'red', { r: 0.006 }), [0, base, z]));
    fr.push(at(box(L, t, t, 'red', { r: 0.006 }), [0, H - t / 2, z]));
    // Poteaux arrêtés au milieu des longerons (pas de faces à fleur).
    for (const x of [x0 + t / 2, -0.12, x1 - t / 2]) fr.push(at(box(t * 0.98, H - t / 2 - base, t * 0.98, 'red', { r: 0.006 }), [x, (H - t / 2 + base) / 2, z]));
  }
  for (const x of [x0 + t / 2, x1 - t / 2]) {
    fr.push(at(box(t * 0.98, t * 0.98, W - t, 'red', { r: 0.006 }), [x, base, 0]));
    fr.push(at(box(t * 0.98, t * 0.98, W - t, 'red', { r: 0.006 }), [x, H - t / 2, 0]));
  }
  // Passages de fourche (9 1/2 po de large, à 41 po d'entraxe).
  for (const s of [-1, 1]) fr.push(at(shell(0.06, 0.05, W + 0.04, 'red', { axis: 'z', seg: 4 }), [s * 41 * IN / 2, skid + 0.05, 0], [0, 0, Math.PI / 4]));
  // Oreilles de levage arrondies aux quatre coins du haut.
  for (const x of [x0 + 0.06, x1 - 0.06]) for (const z of [z0 + 0.02, z1 - 0.02]) {
    fr.push(at(lathe([[0.03, -0.012], [0.09, -0.012], [0.09, 0.012], [0.03, 0.012]], 'red', { axis: 'z', seg: 28 }), [x, H + 0.06, z]));
    fr.push(at(box(0.18, 0.08, 0.024, 'red'), [x, H + 0.0, z]));
  }
  fr.push(at(plate(L - 2 * t, W - 2 * t, 0.006, 'red', { cutouts: [[0.6, 0, 0.5, 0.5]] }), [0, skid + t + 0.003, 0]));
  fr.push(at(box(0.12, 0.06, 0.06, 'red', { r: 0.004 }), [x1 + 0.02, H * 0.45, z0 + 0.15]));
  fr.push(at(box(0.12, 0.06, 0.06, 'red', { r: 0.004 }), [x1 + 0.02, H * 0.45, z1 - 0.15]));
  P('FMX-005-200PP', group(fr), [0, -0.4, 0]);

  // 29 — Groupe moteur-pompes : moteur WEG 125 HP (carcasse 444/5TC à ailettes, capot de ventilateur), cloche,
  // pompes A11VO130 + A10VO45 + A10VO45 en tandem vers l'avant.
  const m = [];
  const mx = MOTOR.x;
  m.push(at(cyl(MOTOR.r, MOTOR.len, 'blue', { axis: 'x', seg: 40 }), [mx, MOTOR.y, 0]));
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    if (Math.sin(a) < -0.6) continue;
    m.push(at(box(MOTOR.len - 0.08, 0.035, 0.012, 'blue'), [mx, MOTOR.y + Math.sin(a) * (MOTOR.r + 0.012), Math.cos(a) * (MOTOR.r + 0.012)], [a - Math.PI / 2, 0, 0]));
  }
  m.push(at(lathe([[0, 0], [MOTOR.r + 0.02, 0], [MOTOR.r + 0.02, 0.22], [MOTOR.r - 0.04, 0.3], [0, 0.31]], 'blue', { axis: '-x', seg: 40 }), [mx - MOTOR.len / 2, MOTOR.y, 0]));
  m.push(at(cyl(MOTOR.r + 0.03, 0.05, 'blue', { axis: 'x', seg: 40 }), [mx + MOTOR.len / 2, MOTOR.y, 0]));
  for (const s of [-1, 1]) m.push(at(box(0.62, 0.05, 0.12, 'blue', { r: 0.006 }), [mx, skid + t + 0.03, s * 0.2]));
  m.push(at(box(0.26, 0.2, 0.22, 'blue', { r: 0.02 }), [mx + 0.1, MOTOR.y + MOTOR.r + 0.08, 0.15]));
  m.push(at(torus(0.05, 0.013, 'blue', { axis: 'z' }), [mx, MOTOR.y + MOTOR.r + 0.08, 0]));
  m.push(at(api.S.nameplate(0.12, 0.08), [mx - 0.1, MOTOR.y + 0.1, MOTOR.r + 0.02]));
  const bx = mx + MOTOR.len / 2 + 0.03;
  m.push(at(shell(0.2, 0.17, 0.34, 'castAlu', { axis: 'x', r2Out: 0.14, r2In: 0.11 }), [bx + 0.17, MOTOR.y, 0]));
  // Pompes (fonte noire) : corps, brides, orifices, raccords d'aspiration et de refoulement.
  const pumps = [[bx + 0.42, 0.28, 0.13], [bx + 0.72, 0.22, 0.1], [bx + 0.95, 0.2, 0.1]];
  for (const [px, len, r] of pumps) {
    m.push(at(box(len * 0.75, r * 1.9, r * 1.9, 'blackCast', { r: 0.02 }), [px, MOTOR.y, 0]));
    m.push(at(box(0.03, r * 2.3, r * 2.3, 'blackCast', { r: 0.008 }), [px - len * 0.4, MOTOR.y, 0]));
    m.push(at(box(0.08, 0.08, 0.08, 'blackCast', { r: 0.006 }), [px, MOTOR.y + r + 0.03, 0.04]));
  }
  m.push(tube([[bx + 0.42, MOTOR.y - 0.08, 0.14], [bx + 0.42, MOTOR.y - 0.08, 0.3], [bx + 0.5, MOTOR.y + 0.2, 0.36]], 0.04, 'steel', { seg: 16 }));
  P('UM-064-STM-1500-600V', group(m), [-0.4, 0, 0.9]);

  // 38 — Support de pompe (vis de réglage et siège sous la pompe arrière).
  P('UM-064-102P-N', group(
    at(box(0.14, 0.012, 0.14, 'red'), [bx + 0.95, skid + t + 0.006, 0]),
    at(cyl(0.025, MOTOR.y - 0.1 - skid - t, 'steel', { axis: 'y', seg: 16 }), [bx + 0.95, (MOTOR.y - 0.1 + skid + t) / 2, 0]),
    at(nut(0.05, 0.03, 'red'), [bx + 0.95, skid + t + 0.08, 0]),
    at(box(0.12, 0.03, 0.06, 'yellow', { r: 0.004 }), [bx + 0.95, MOTOR.y - 0.105, 0]),
  ), [0, -0.3, 0.4]);
  P('FBRA-002-213P', group(
    tube([[bx + 0.95 - 0.04, skid + t, 0.05], [bx + 0.95 - 0.04, MOTOR.y - 0.06, 0.05], [bx + 0.95 + 0.04, MOTOR.y - 0.06, 0.05], [bx + 0.95 + 0.04, skid + t, 0.05]], 0.006, 'steel', { sharp: true, seg: 3 }),
  ), [0, -0.3, 0.6]);

  // 1 — Réservoir 110 gal US sur le dessus, côté avant, avec trappes d'inspection, filtres de retour et reniflard.
  const tL = 1.25, tW = W - 2 * t - 0.04, tH = 0.42;
  const tx = x1 - t - tL / 2 - 0.02, ty = H - t - tH / 2 - 0.02;
  P('FMX-005-300TD', group(
    at(box(tL, tH, tW, 'red', { r: 0.012 }), [tx, ty, 0]),
    ...[-0.3, 0.1].map((dx) => at(cyl(0.16, 0.025, 'red', { axis: 'y', seg: 36 }), [tx + dx, ty + tH / 2 + 0.012, -0.1])),
    ...[-0.3, 0.1].map((dx) => boltSet(Array.from({ length: 8 }, (_, i) => [tx + dx + Math.cos(i * 0.785) * 0.14, ty + tH / 2 + 0.025, -0.1 + Math.sin(i * 0.785) * 0.14]), 0.0095, 0.02, 'steel')),
    ...[0.4, 0.4].map((dx, i) => at(filterCanister(0.06, 0.32), [tx + dx, ty + tH / 2 + 0.07, i ? 0.25 : -0.05], [Math.PI, 0, 0])),
    at(box(0.12, 0.04, 0.12, 'darkSteel', { r: 0.008 }), [tx + 0.4, ty + tH / 2 + 0.02, -0.05]),
    at(box(0.12, 0.04, 0.12, 'darkSteel', { r: 0.008 }), [tx + 0.4, ty + tH / 2 + 0.02, 0.25]),
    at(cyl(0.035, 0.08, 'black', { axis: 'y' }), [tx - 0.5, ty + tH / 2 + 0.04, 0.3]),
    at(gauge(0.04, { axis: 'z' }), [tx - 0.3, ty, tW / 2 + 0.01]),
    at(box(0.02, 0.2, 0.05, 'glass'), [tx + 0.1, ty, tW / 2 + 0.012]),
    ...[-0.3, 0.1].map((dx) => at(ballValve(0.06, 'brass', { axis: 'y' }), [tx + dx, ty - tH / 2 - 0.06, -0.2])),
  ), [0, 0.7, 0]);

  // 15 — Collecteur de retour (alu) sous le réservoir, 20 — clapet, 22 — vanne de démarrage, raccords.
  const mfx = tx - 0.15, mfy = ty - tH / 2 - 0.1;
  P('UM-064-600PP', at(box(0.36, 0.08, 0.08, 'castAlu', { r: 0.006 }), [mfx, mfy, 0.2]), [0, -0.2, 0.4]);
  P('HSP-1000-4-5', at(cyl(0.022, 0.1, 'brass', { axis: 'x' }), [mfx + 0.24, mfy, 0.2]), [0.2, -0.2, 0.4]);
  P('DTDA-MHN-GAI', group(at(box(0.07, 0.07, 0.07, 'castAlu', { r: 0.005 }), [mfx - 0.25, mfy, 0.2]), at(cyl(0.02, 0.09, 'black', { axis: 'y' }), [mfx - 0.25, mfy - 0.08, 0.2])), [-0.2, -0.2, 0.4]);
  P('5404-8-12', at(fitting(0.022, 0.05, 'brass', { axis: 'x' }), [mfx + 0.32, mfy, 0.2]), [0.3, -0.2, 0.4]);
  P('2404-8-8', at(fitting(0.02, 0.05, 'steel', { axis: 'y' }), [mfx, mfy + 0.06, 0.2]), [0, 0.2, 0.4]);
  each(P, '6400-6-6', [-0.06, 0.06].map((dx) => at(fitting(0.016, 0.04, 'steel', { axis: 'z' }), [mfx + dx, mfy, 0.26])), [0, 0, 0.4]);
  P('6500-06-06', at(fitting(0.016, 0.05, 'steel', { axis: 'z', elbow: true }), [mfx - 0.25, mfy, 0.26]), [0, 0, 0.4]);
  api.add(group(
    hose([[mfx + 0.18, mfy, 0.2], [mfx + 0.3, mfy - 0.2, 0.3], [bx + 0.5, MOTOR.y + 0.16, 0.2]], 0.022),
    hose([[mfx - 0.18, mfy, 0.2], [mfx - 0.4, mfy - 0.15, 0.3], [bx + 0.72, MOTOR.y + 0.16, 0.1]], 0.016),
    hose([[mfx - 0.1, mfy, 0.16], [mfx, mfy - 0.3, -0.1], [bx + 0.95, MOTOR.y + 0.15, -0.05]], 0.016),
    hose([[bx + 0.42, MOTOR.y + 0.16, 0.04], [bx + 0.6, MOTOR.y + 0.5, -0.3], [x1 + 0.05, H * 0.55, z0 + 0.15]], 0.02),
    hose([[bx + 0.72, MOTOR.y + 0.14, 0.04], [bx + 0.8, MOTOR.y + 0.45, -0.25], [x1 + 0.05, H * 0.5, z0 + 0.25]], 0.016),
  ));

  // 30 — Boîte électrique Hoffman (600 V, 125 HP) au-dessus du moteur, 18 — transformateur, 12 — plaque support, 13 — adaptateur.
  // Porte de la boîte (interrupteur principal) sur le côté droit, accessible.
  P('A30HS2412GQRLP', at(enclosure(0.61, 0.61, 0.3, 'grey'), [x0 + 0.45, H - t - 0.33, z1 - 0.17]), [0, 0.3, 0.5]);
  api.add(group(
    at(box(0.06, 0.16, 0.05, 'black', { r: 0.008 }), [x0 + 0.62, H - t - 0.33, z1 + 0.005]),
    at(box(0.02, 0.1, 0.03, 'lampRed', { r: 0.004 }), [x0 + 0.62, H - t - 0.3, z1 + 0.04]),
  ));
  P('FMC-036-203P', at(plate(0.36, 0.3, 0.008, 'red'), [0.4, 0.9, z1 - t - 0.004], [Math.PI / 2, 0, 0]), [0, 0, 0.3]);
  P('FMC-036-205P', at(box(0.26, 0.04, 0.03, 'red', { r: 0.004 }), [0.4, 0.78, z1 - t - 0.025]), [0, 0, 0.35]);
  P('DX3000', group(at(box(0.24, 0.26, 0.2, 'lightGrey', { r: 0.01 }), [0.4, 0.92, z1 - t - 0.11]), at(box(0.26, 0.04, 0.22, 'grey'), [0.4, 1.07, z1 - t - 0.11])), [0, 0, 0.5]);
  each(P, 'B375-1250', [-1, 1].flatMap((s) => [-1, 1].map((u) => at(bolt(0.0095, 0.032, 'steel', { axis: 'z' }), [0.4 + s * 0.14, 0.9 + u * 0.11, z1 - t - 0.01]))), [0, 0, 0.6]);
  each(P, 'W375', Array.from({ length: 12 }, (_, i) => at(api.S.washer(0.011, 0.005, 0.002, 'steel', { axis: 'z' }), [0.25 + (i % 6) * 0.06, 0.72 + Math.floor(i / 6) * 0.36, z1 - t + 0.002])), [0, 0, 0.55]);

  // 27 — Refroidisseurs AB-1202 (2) sur leur support (28), en bas à l'avant.
  for (const s of [-1, 1]) P('AB-1202', group(
    at(cyl(0.085, 0.72, 'black', { axis: 'z', seg: 28 }), [x1 - 0.22, 0.25 + (s > 0 ? 0.2 : 0), 0]),
    ...[-1, 1].map((u) => at(cyl(0.1, 0.04, 'black', { axis: 'z', seg: 28 }), [x1 - 0.22, 0.25 + (s > 0 ? 0.2 : 0), u * 0.36])),
    at(cyl(0.025, 0.08, 'steel', { axis: 'y' }), [x1 - 0.22, 0.25 + (s > 0 ? 0.2 : 0) + 0.1, 0.3]),
  ), [0.3, 0, s * 0.3]);
  P('FMX-005-203PP', group(...[-1, 1].map((u) => at(box(0.05, 0.42, 0.06, 'red', { r: 0.004 }), [x1 - 0.22, 0.3, u * 0.42]))), [0.3, -0.2, 0]);

  // 2 — Pompe de remplissage à main Fill-Rite (39 — support), sur le flanc gauche.
  P('FR150', group(
    at(cyl(0.05, 0.16, 'blackCast', { axis: 'y' }), [0.55, 0.55, z0 + 0.03]),
    at(box(0.025, 0.25, 0.025, 'steel'), [0.55, 0.72, z0 + 0.0], [0, 0, 0.5]),
    at(cyl(0.012, 0.35, 'steel', { axis: 'y', seg: 12 }), [0.55, 0.3, z0 + 0.03]),
  ), [0, 0, -0.4]);
  P('FBRA-002-204PP', at(box(0.14, 0.18, 0.006, 'red'), [0.55, 0.55, z0 + t / 2 - 0.04]), [0, 0, -0.3]);

  // 3 — Plancher grillagé inférieur, 7 — supérieur (rabattables à l'avant, axes 8/10, goupilles 9, broches 4).
  const pw = W - 2 * t;
  const panel = (y, h) => group(
    ...[-1, 1].map((s) => at(box(0.03, h, 0.04, 'red', { r: 0.004 }), [0, y, s * (pw / 2 - 0.02)])),
    ...[-1, 1].map((s) => at(box(0.03, 0.04, pw, 'red', { r: 0.004 }), [0, y + s * (h / 2 - 0.02), 0])),
    at(grid(api.S, W - 2 * t - 0.06, h - 0.06, 0.04, 'steel', 0.002), [0.01, y, 0], [0, Math.PI / 2, 0]),
  );
  P('UM-064-165TD', at(panel(0.42, 0.62), [x1 - t / 2 + 0.03, 0, 0]), [0.4, 0, 0]);
  P('UM-064-235TD', at(panel(1.1, 0.68), [x1 - t / 2 + 0.03, 0, 0]), [0.55, 0, 0]);
  each(P, 'UM-064-TD76', [z0 + 0.1, z1 - 0.1].map((z) => at(cyl(0.012, 0.1, 'steel', { axis: 'x', seg: 12 }), [x1 + 0.03, 0.12, z])), [0.6, 0, 0]);
  each(P, 'UM-064-TD77', [z0 + 0.1, z1 - 0.1].map((z) => at(cyl(0.012, 0.1, 'steel', { axis: 'x', seg: 12 }), [x1 + 0.03, 1.45, z])), [0.6, 0, 0]);
  each(P, 'CTP187-1250', Array.from({ length: 8 }, (_, i) => at(torus(0.012, 0.0025, 'steel', { axis: 'x' }), [x1 + 0.09, i < 4 ? 0.12 + (i % 2) * 0.02 : 1.45 + (i % 2) * 0.02, i % 4 < 2 ? z0 + 0.1 : z1 - 0.1])), [0.7, 0, 0]);
  each(P, 'UM-064-TD29', Array.from({ length: 8 }, (_, i) => group(
    at(cyl(0.012, 0.1, 'steel', { axis: 'z', seg: 12 }), [x1 + 0.02, 0.3 + Math.floor(i / 2) * 0.33, (i % 2 ? z1 : z0) + (i % 2 ? 0.05 : -0.05)]),
    at(torus(0.02, 0.005, 'red', { axis: 'x' }), [x1 + 0.02, 0.3 + Math.floor(i / 2) * 0.33, (i % 2 ? z1 : z0) + (i % 2 ? 0.1 : -0.1)]),
  )), [0.5, 0, 0]);

  // Visserie du cadre : boulons, rondelles, écrous des supports (refroidisseurs, timon, panneaux).
  each(P, 'W312', Array.from({ length: 18 }, (_, i) => at(api.S.washer(0.009, 0.004, 0.0016, 'steel', { axis: 'x' }), [x1 - 0.18, 0.12 + (i % 9) * 0.04, (i < 9 ? -1 : 1) * 0.45])), [0.3, 0, 0]);
  each(P, 'B312-1250', Array.from({ length: 8 }, (_, i) => at(bolt(0.008, 0.032, 'steel', { axis: 'x' }), [x1 - 0.17, 0.14 + (i % 4) * 0.08, (i < 4 ? -1 : 1) * 0.45])), [0.35, 0, 0]);
  each(P, 'LN312NC', Array.from({ length: 10 }, (_, i) => at(nut(0.013, 0.008, 'steel', { axis: 'x' }), [x1 - 0.27, 0.14 + (i % 5) * 0.06, (i < 5 ? -1 : 1) * 0.45])), [0.25, 0, 0]);
  each(P, 'W500', Array.from({ length: 8 }, (_, i) => at(api.S.washer(0.014, 0.007, 0.0025, 'steel'), [x0 + 0.2 + i * 0.25, skid + t + 0.005, z0 + 0.12])), [0, 0.2, 0]);
  each(P, 'B500-3000', [0, 1].map((i) => at(bolt(0.0127, 0.076, 'steel'), [x0 + 0.3 + i * 0.4, skid + t + 0.01, z1 - 0.12])), [0, 0.3, 0]);
  each(P, 'B500-1250', [0, 1].map((i) => at(bolt(0.0127, 0.032, 'steel'), [x0 + 1.2 + i * 0.4, skid + t + 0.01, z1 - 0.12])), [0, 0.3, 0]);
  each(P, 'B375-1000', [0, 1].map((i) => at(bolt(0.0095, 0.025, 'steel', { axis: 'z' }), [0.5 + i * 0.1, 0.62, z0 + t / 2 - 0.04])), [0, 0, -0.3]);
  each(P, 'NC375', [0, 1].map((i) => at(nut(0.015, 0.009, 'steel', { axis: 'z' }), [0.5 + i * 0.1, 0.62, z0 + t / 2 + 0.04])), [0, 0, -0.2]);
  each(P, 'LN375NC', [0, 1].map((i) => at(nut(0.015, 0.01, 'steel', { axis: 'y' }), [bx + 0.95 + (i ? 0.04 : -0.04), skid + t - 0.01, 0.05])), [0, -0.3, 0.6]);

  // Plaque de raccords rapides (laiton) reliée aux pompes et au retour.
  api.add(group(
    at(box(0.44, 0.12, 0.012, 'red', { r: 0.004 }), [0.13, 0.3, z1 + 0.006]),
    ...PP_PORTS.map(([x, y, z], i) => group(
      at(cyl(i === 0 ? 0.024 : 0.019, 0.05, 'brass', { axis: 'z', seg: 18 }), [x, y, z - 0.04]),
      at(nut(i === 0 ? 0.05 : 0.042, 0.014, 'brass', { axis: 'z' }), [x, y, z - 0.055]),
    )),
    ...PP_PORTS.map(([x, y], i) => hose([[x, y, z1 - 0.01], [x, y + 0.05, z1 - 0.25], [bx + 0.42 + (i % 3) * 0.25, MOTOR.y - 0.15, 0.15]], i === 0 ? 0.02 : 0.016)),
  ));

  // Plaque UM sur le côté.
  api.add(at(box(0.26, 0.1, 0.004, 'white', { r: 0.01 }), [0.5, H - 0.25, z1 + 0.002]));
  return { view: { dir: [1, 0.55, 0.9] } };
}

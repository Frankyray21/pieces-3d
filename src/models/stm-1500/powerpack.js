// P068 — Groupe hydraulique 125 HP 600 V 60 Hz UM-064-FMX-005-100PPP (page
// 3.2), posé sur ses patins : cadre rouge à oreilles de levage et passages de
// fourche (96 7/8 × 48 1/4 × 60 15/16 po, page 3.1), moteur WEG 125 HP
// (bleu) et pompes Rexroth en tandem (P069), réservoir 110 gal et filtres de
// retour (P072, P073) sur le dessus, boîte électrique Hoffman, transformateur,
// refroidisseurs, collecteur de retour, pompe de remplissage à main,
// planchers grillagés rabattables à l'avant. Roues, moyeux et timon : options
// non montées (demande du client). Couleurs : dessins du manuel (rouge).
// Repère : origine au sol au centre du cadre, X vers l'avant (côté pompes et
// refroidisseurs) ; raccords et câble vers la console au bout arrière (−X, côté
// moteur et boîte électrique) ; Y vers le haut, Z vers la droite.
import { lister, each, grid, IN } from './layout.js';

export const PP = { L: 96.875 * IN, W: 48.25 * IN, H: 60.9375 * IN, skid: 3.5 * IN, t: 3 * IN };
// Axe du moteur et des pompes : pattes du moteur posées sur le plancher, carcasse et
// capot de ventilateur au-dessus du plancher, capot arrêté avant la traverse arrière.
const MOTOR = { x: -0.49, y: 0.5, r: 0.29, len: 0.86 };
// Raccords rapides au bout arrière du cadre (−X, côté moteur, vers la console), sur
// une plaque posée sur la traverse basse et soudée au poteau d'angle gauche, hors du
// capot de ventilateur du moteur : pression, retour, drain ; presse-étoupe du câble
// de commande sur une patte soudée au poteau. Bouts des raccords, sortie vers −X.
export const PP_PORTS = [-0.34, -0.42, -0.5].map((z) => [-PP.L / 2 - 0.07, 0.3, z]);
export const PP_CABLE = [-PP.L / 2 - 0.04, 0.95, -PP.W / 2 + PP.t + 0.035];
export const PP_N = [-1, 0, 0];

export function P068(api) {
  const { box, cyl, ring, shell, tube, hose, plate, bolt, boltSet, group, at, lathe, torus, nut, enclosure, filterCanister, ballValve, gauge, fitting, washer } = api.S;
  const P = lister(api, 'P068');
  const { L, W, H, skid, t } = PP;
  const x0 = -L / 2, x1 = L / 2, z0 = -W / 2, z1 = W / 2;
  const base = skid + t / 2;
  const floorTop = skid + t + 0.006; // dessus du plancher

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
  // Passages de fourche (9 1/2 po de large, à 41 po d'entraxe) : tubes carrés à dessus plat (y 0,096 à 0,181).
  const fork = 41 * IN / 2, forkTop = skid + 0.05 + 0.06 * Math.SQRT1_2;
  for (const s of [-1, 1]) fr.push(at(shell(0.06, 0.05, W + 0.04, 'red', { axis: 'z', seg: 4 }), [s * fork, skid + 0.05, 0], [0, 0, Math.PI / 4]));
  // Oreilles de levage arrondies aux quatre coins du haut.
  for (const x of [x0 + 0.06, x1 - 0.06]) for (const z of [z0 + 0.02, z1 - 0.02]) {
    fr.push(at(lathe([[0.03, -0.012], [0.09, -0.012], [0.09, 0.012], [0.03, 0.012]], 'red', { axis: 'z', seg: 28 }), [x, H + 0.06, z]));
    fr.push(at(box(0.18, 0.08, 0.024, 'red'), [x, H + 0.0, z]));
  }
  // Plancher découpé sous les pompes : le support de pompe y prend appui sur le passage de fourche avant.
  fr.push(at(plate(L - 2 * t, W - 2 * t, 0.006, 'red', { cutouts: [[0.6, 0, 0.5, 0.5]] }), [0, skid + t + 0.003, 0]));
  fr.push(at(box(0.12, 0.06, 0.06, 'red', { r: 0.004 }), [x1 + 0.02, H * 0.45, z0 + 0.15]));
  fr.push(at(box(0.12, 0.06, 0.06, 'red', { r: 0.004 }), [x1 + 0.02, H * 0.45, z1 - 0.15]));
  P('FMX-005-200PP', group(fr), [0, -0.4, 0]);

  // 29 — Groupe moteur-pompes : moteur WEG 125 HP (carcasse 444/5TC à ailettes, capot de ventilateur), cloche,
  // pompes A11VO130 + A10VO45 + A10VO45 en tandem vers l'avant.
  const m = [];
  const mx = MOTOR.x, my = MOTOR.y;
  m.push(at(cyl(MOTOR.r, MOTOR.len, 'blue', { axis: 'x', seg: 40 }), [mx, my, 0]));
  // Ailettes radiales (aucune sous la carcasse, entre les pattes).
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    if (Math.sin(a) < -0.6) continue;
    m.push(at(box(MOTOR.len - 0.08, 0.035, 0.012, 'blue'), [mx, my + Math.sin(a) * (MOTOR.r + 0.012), Math.cos(a) * (MOTOR.r + 0.012)], [Math.PI / 2 - a, 0, 0]));
  }
  // Capot de ventilateur, arrêté à 2,5 cm de la traverse basse arrière.
  m.push(at(lathe([[0, 0], [MOTOR.r + 0.02, 0], [MOTOR.r + 0.02, 0.13], [MOTOR.r - 0.04, 0.2], [0, 0.21]], 'blue', { axis: '-x', seg: 40 }), [mx - MOTOR.len / 2, my, 0]));
  m.push(at(cyl(MOTOR.r + 0.03, 0.05, 'blue', { axis: 'x', seg: 40 }), [mx + MOTOR.len / 2, my, 0]));
  // Pattes de la carcasse posées sur le plancher.
  for (const s of [-1, 1]) m.push(at(box(0.62, 0.14, 0.12, 'blue', { r: 0.006 }), [mx, floorTop + 0.07, s * 0.2]));
  m.push(at(box(0.26, 0.2, 0.22, 'blue', { r: 0.02 }), [mx + 0.1, my + MOTOR.r + 0.08, 0.15]));
  m.push(at(torus(0.05, 0.013, 'blue', { axis: 'z' }), [mx, my + MOTOR.r + 0.08, 0]));
  m.push(at(api.S.nameplate(0.12, 0.08), [mx - 0.1, my + 0.1, MOTOR.r + 0.02]));
  // Cloche vissée sur la bride du moteur.
  const bx = mx + MOTOR.len / 2 + 0.025;
  m.push(at(shell(0.2, 0.17, 0.34, 'castAlu', { axis: 'x', r2Out: 0.14, r2In: 0.11 }), [bx + 0.17, my, 0]));
  // Pompes (fonte noire) en tandem : la bride de la première sur la cloche, celle de chacune des
  // suivantes sur la face arrière de la précédente ; orifices de drain du carter sur le dessus.
  let face = bx + 0.34;
  const pumps = [[0.28, 0.13], [0.22, 0.1], [0.2, 0.1]].map(([len, r]) => {
    const bl = len * 0.75, p = { px: face + 0.03 + bl / 2, r, f: face };
    face += 0.03 + bl;
    m.push(at(box(bl, r * 1.9, r * 1.9, 'blackCast', { r: 0.02 }), [p.px, my, 0]));
    m.push(at(box(0.03, r * 2.3, r * 2.3, 'blackCast', { r: 0.008 }), [p.f + 0.015, my, 0]));
    m.push(at(box(0.08, 0.08, 0.08, 'blackCast', { r: 0.006 }), [p.px, my + r + 0.03, 0.04]));
    return p;
  });
  const p1 = pumps[0];
  // Pompe A11VO130 : bride de refoulement sous le corps (449-74446-20), raccord du boyau de pression
  // vers −Z et raccord 6801F-06-06 vers +Z (pilotage de la vanne de démarrage).
  const pPort = [p1.px - 0.06, my - p1.r * 0.95 - 0.0365]; // axe des raccords de la bride
  m.push(at(box(0.06, 0.05, 0.07, 'blackCast', { r: 0.004 }), [pPort[0], my - p1.r * 0.95 - 0.025, 0]));
  m.push(at(fitting(0.03, 0.06, 'steel'), [pPort[0], pPort[1], -0.035 - 0.0084], [-Math.PI / 2, 0, 0]));
  m.push(at(fitting(0.016, 0.04, 'steel', { axis: 'z' }), [pPort[0], pPort[1], 0.035 + 0.0056]));
  const pTip = -0.035 - 0.0084 - 0.06 * 0.795, dTip = 0.035 + 0.0056 + 0.04 * 0.795;
  // Aspirations sur le flanc −Z des pompes : coude de rue 3 po et mamelon cannelé 3 po (UM-064-276P,
  // UM-064-318TD) sur l'A11VO130, coudes 1 1/2 po sur les A10VO45 ; sortie vers le haut.
  const suction = pumps.map(({ px, r }, i) => {
    const d = i ? 0.05 : 0.08, len = i ? 0.08 : 0.12, zo = -r * 0.95 - len * 0.14;
    m.push(at(fitting(d, len, 'steel', { elbow: true }), [px, my, zo], [-Math.PI / 2, 0, 0]));
    return { x: px, z: zo - len * 0.7, tip: my + len * 0.55, d, len, rh: i ? 0.028 : 0.047, s: i ? 0.05 : 0.08 };
  });
  P('UM-064-STM-1500-600V', group(m), [-0.4, 0, 0.9]);

  // 38 — Support de pompe : semelle posée sur le passage de fourche avant (dans la découpe du plancher),
  // vis de réglage, contre-écrou et siège sous la pompe A11VO130 ; 40 — étrier autour du passage, 41 — écrous.
  const sx = fork, sTop = forkTop + 0.012, seat = my - p1.r * 0.95;
  P('UM-064-102P-N', group(
    at(box(0.14, 0.012, 0.14, 'red'), [sx, forkTop + 0.006, 0]),
    at(cyl(0.025, seat - 0.03 - sTop, 'steel', { axis: 'y', seg: 16 }), [sx, (seat - 0.03 + sTop) / 2, 0]),
    at(nut(0.05, 0.03, 'red'), [sx, sTop + 0.015, 0]),
    at(box(0.12, 0.03, 0.06, 'yellow', { r: 0.004 }), [sx, seat - 0.015, 0]),
  ), [0, -0.3, 0.4]);
  const ux = 0.0424 + 0.008, uz = 0.045, uBot = skid + 0.05 - 0.0424 - 0.008;
  P('FBRA-002-213P', group(
    tube([[sx - ux, sTop + 0.02, uz], [sx - ux, uBot, uz], [sx + ux, uBot, uz], [sx + ux, sTop + 0.02, uz]], 0.006, 'steel', { sharp: true, seg: 3 }),
  ), [0, -0.3, 0.6]);
  each(P, 'LN375NC', [-1, 1].map((s) => at(nut(0.015, 0.01, 'steel', { axis: 'y' }), [sx + s * ux, sTop + 0.005, uz])), [0, -0.3, 0.6]);

  // 1 — Réservoir 110 gal US sur le dessus, côté avant, avec trappes d'inspection, filtres de retour et
  // reniflard ; rebords du dessus posés sur les longerons du haut. Dessous : vannes d'aspiration (3 po et
  // 1 1/2 po, mamelons cannelés) ; bout −X : raccord du drain de la console.
  const tL = 1.25, tW = W - 2 * t - 0.04, tH = 0.42;
  const tx = x1 - t - tL / 2 - 0.02, ty = H + 0.01 - tH / 2, tb = ty - tH / 2;
  const lipIn = tW / 2 - 0.002, lipOut = z1 - 0.035; // rebord : du flanc du réservoir jusqu'avant les oreilles
  const drainPort = [tx - tL / 2 - 0.007, 1.24, -0.4];
  const valves = suction.map(({ x, z, d, len, s }) => {
    const vy = tb - 0.03 - s * 1.15, ky = vy - s * 1.15 - len * 0.14;
    return { x, z, d, len, s, vy, ky, tip: ky - len * 0.795 };
  });
  P('FMX-005-300TD', group(
    at(box(tL, tH, tW, 'red', { r: 0.012 }), [tx, ty, 0]),
    ...[-1, 1].map((s) => at(box(tL, 0.01, lipOut - lipIn, 'red'), [tx, H + 0.005, s * (lipIn + lipOut) / 2])),
    ...[-0.3, 0.1].map((dx) => at(cyl(0.16, 0.025, 'red', { axis: 'y', seg: 36 }), [tx + dx, ty + tH / 2 + 0.012, -0.1])),
    ...[-0.3, 0.1].map((dx) => boltSet(Array.from({ length: 8 }, (_, i) => [tx + dx + Math.cos(i * 0.785) * 0.14, ty + tH / 2 + 0.025, -0.1 + Math.sin(i * 0.785) * 0.14]), 0.0095, 0.02, 'steel')),
    ...[0.4, 0.4].map((dx, i) => at(filterCanister(0.06, 0.32), [tx + dx, ty + tH / 2 + 0.04, i ? 0.25 : -0.05], [Math.PI, 0, 0])),
    at(box(0.12, 0.04, 0.12, 'darkSteel', { r: 0.008 }), [tx + 0.4, ty + tH / 2 + 0.02, -0.05]),
    at(box(0.12, 0.04, 0.12, 'darkSteel', { r: 0.008 }), [tx + 0.4, ty + tH / 2 + 0.02, 0.25]),
    at(cyl(0.035, 0.08, 'black', { axis: 'y' }), [tx - 0.5, ty + tH / 2 + 0.04, 0.3]),
    at(gauge(0.04, { axis: 'z' }), [tx - 0.3, ty, tW / 2 + 0.01]),
    at(box(0.02, 0.2, 0.05, 'glass'), [tx + 0.1, ty, tW / 2 + 0.012]),
    at(fitting(0.03, 0.05, 'steel', { axis: '-x' }), drainPort),
    // Mamelon, vanne à bille (levier vers −Z, le long du passage) et mamelon cannelé sous chaque sortie.
    ...valves.flatMap(({ x, z, d, len, s, vy, ky }) => [
      at(cyl(d * 0.56, 0.03, 'steel', { axis: 'y', seg: 20 }), [x, tb - 0.015, z]),
      at(group(at(ballValve(s, 'brass'), [0, 0, 0], [0, 0, -Math.PI / 2])), [x, vy, z], [0, Math.PI / 2, 0]),
      at(fitting(d, len, 'steel', { axis: '-y' }), [x, ky, z]),
    ]),
  ), [0, 0.7, 0]);
  // Boyaux d'aspiration : vanne du réservoir → coude de la pompe, bouts emmanchés sur les mamelons cannelés
  // (douille de serrage de 3 cm à chaque bout, du bout du mamelon sur le boyau : embouts du boyau).
  api.add(group(valves.map(({ x, z, tip }, i) => {
    const { tip: bot, rh, d } = suction[i];
    const h = tube([[x, tip - 0.015, z], [x, bot + 0.015, z]], rh, 'hose', { ends: 'none', sharp: true, seg: 4, radial: 24 });
    const ends = api.S.merged([[tip, -1], [bot, 1]].map(([y, s]) => at(ring(rh + 0.004, d * 0.18, 0.03, 'steel', { seg: 24 }), [x, y + s * 0.015, z])), 'steel');
    ends.userData.isTubeEnds = true;
    h.add(ends);
    return h;
  })));

  // 15 — Collecteur de retour (alu) sous le réservoir : raccord du retour de la console (6400-16-16) sur la
  // face −Z ; 22 — vanne de démarrage et 20 — clapet vissés à ses bouts ; raccords.
  const mfx = tx - 0.15, mfy = tb - 0.1;
  const retPort = [mfx - 0.1, mfy, 0.16 - 0.007 - 0.05 * 0.795];
  P('UM-064-600PP', group(
    at(box(0.36, 0.08, 0.08, 'castAlu', { r: 0.006 }), [mfx, mfy, 0.2]),
    at(fitting(0.03, 0.05, 'steel'), [mfx - 0.1, mfy, 0.16 - 0.007], [-Math.PI / 2, 0, 0]),
  ), [0, -0.2, 0.4]);
  P('HSP-1000-4-5', at(cyl(0.022, 0.1, 'brass', { axis: 'x' }), [mfx + 0.23, mfy, 0.2]), [0.2, -0.2, 0.4]);
  P('DTDA-MHN-GAI', group(at(box(0.07, 0.07, 0.07, 'castAlu', { r: 0.005 }), [mfx - 0.215, mfy, 0.2]), at(cyl(0.02, 0.09, 'black', { axis: 'y' }), [mfx - 0.215, mfy - 0.08, 0.2])), [-0.2, -0.2, 0.4]);
  P('5404-8-12', at(fitting(0.022, 0.05, 'brass', { axis: 'x' }), [mfx + 0.31, mfy, 0.2]), [0.3, -0.2, 0.4]);
  P('2404-8-8', at(fitting(0.02, 0.05, 'steel', { axis: 'y' }), [mfx, mfy + 0.06, 0.2]), [0, 0.2, 0.4]);
  each(P, '6400-6-6', [-0.06, 0.06].map((dx) => at(fitting(0.016, 0.04, 'steel', { axis: 'z' }), [mfx + dx, mfy, 0.26])), [0, 0, 0.4]);
  P('6500-06-06', at(fitting(0.016, 0.05, 'steel', { axis: 'z', elbow: true }), [mfx - 0.215, mfy, 0.26]), [0, 0, 0.4]);
  const [, p2, p3] = pumps, drainTop = (p) => my + p.r + 0.07;
  // Bout de boyau droit sur la longueur de l'embout serti (raccord E, sortie selon d) : E, E + a·d, E + b·d.
  const out = ([x, y, z], [dx, dy, dz], a = 0.08, b = 0.12) => [[x, y, z], [x + dx * a, y + dy * a, z + dz * a], [x + dx * b, y + dy * b, z + dz * b]];
  const into = (...args) => out(...args).reverse();
  api.add(group(
    // Drains des carters → collecteur : 6400-6-6 (pompes 1 et 2) et 5404-8-12 par le clapet (pompe 3).
    hose([...out([mfx - 0.06, mfy, 0.292], [0, 0, 1]), [mfx - 0.04, 0.92, 0.4], [p1.px - 0.04, 0.82, 0.18], ...into([p1.px, drainTop(p1), 0.04], [0, 1, 0])], 0.016),
    hose([...out([mfx + 0.06, mfy, 0.292], [0, 0, 1]), [mfx + 0.12, 0.93, 0.41], [p2.px - 0.06, 0.84, 0.2], ...into([p2.px, drainTop(p2), 0.04], [0, 1, 0])], 0.016),
    hose([...out([mfx + 0.35, mfy, 0.2], [1, 0, 0]), [p3.px, 0.95, 0.13], ...into([p3.px, drainTop(p3), 0.04], [0, 1, 0])], 0.016),
    // Vanne de démarrage (coude 6500-06-06) → raccord 6801F-06-06 de la bride de refoulement de la pompe 1.
    hose([...out([mfx - 0.215, mfy - 0.0275, 0.295], [0, -1, 0], 0.05, 0.08), [0.16, 0.75, 0.31], [0.3, 0.47, 0.28], [pPort[0] - 0.01, 0.37, 0.2], ...into([pPort[0], pPort[1], dTip], [0, 0, 1], 0.05, 0.08)], 0.01),
  ));

  // 30 — Boîte électrique Hoffman (600 V, 125 HP) au-dessus du moteur, dessus contre le longeron du haut.
  // Porte de la boîte (interrupteur principal) sur le côté droit, accessible.
  const hy = H - t - 0.305;
  P('A30HS2412GQRLP', at(enclosure(0.61, 0.61, 0.3, 'grey'), [x0 + 0.45, hy, z1 - 0.17]), [0, 0.3, 0.5]);
  api.add(group(
    at(box(0.06, 0.16, 0.05, 'black', { r: 0.008 }), [x0 + 0.62, hy, z1 + 0.005]),
    at(box(0.02, 0.1, 0.03, 'lampRed', { r: 0.004 }), [x0 + 0.62, hy + 0.03, z1 + 0.04]),
  ));
  // 12 — Plaque support soudée contre la face intérieure du poteau du milieu (côté droit), 18 — transformateur
  // vissé dessus par 14 (rondelles 11 des deux côtés de la plaque), 13 — adaptateur sous le transformateur.
  const tpx = -0.12, tpz = z1 - t / 2 - t * 0.49; // face intérieure du poteau
  const tbz = tpz - 0.008 - 0.002; // face du transformateur côté plaque
  const pw2 = t * 0.49 + 0.002; // cordons le long des arêtes du poteau
  P('FMC-036-203P', group(
    at(plate(0.36, 0.3, 0.008, 'red'), [tpx, 0.9, tpz - 0.004], [Math.PI / 2, 0, 0]),
    ...[-1, 1].map((s) => api.S.weld([[tpx + s * pw2, 0.76, tpz + 0.002], [tpx + s * pw2, 1.04, tpz + 0.002]], 0.006)),
  ), [0, 0, 0.3]);
  P('FMC-036-205P', at(box(0.26, 0.04, 0.03, 'red', { r: 0.004 }), [tpx, 0.78, tpz - 0.008 - 0.015]), [0, 0, 0.35]);
  P('DX3000', group(at(box(0.24, 0.26, 0.2, 'lightGrey', { r: 0.01 }), [tpx, 0.92, tbz - 0.1]), at(box(0.26, 0.04, 0.22, 'grey'), [tpx, 1.07, tbz - 0.11])), [0, 0, 0.5]);
  const tBolts = [-1, 1].flatMap((s) => [-1, 1].map((u) => [tpx + s * 0.08, 0.92 + u * 0.09]));
  each(P, 'B375-1250', tBolts.map(([x, y]) => at(bolt(0.0095, 0.032, 'steel', { axis: 'z' }), [x, y, tpz + 0.002])), [0, 0, 0.6]);
  // Rondelles 3/8 : sous les têtes et côté transformateur (14), sous les têtes et les écrous des vis du support de la pompe à main (35, 36).
  const hpz = z0 + t / 2 - 0.04; // plan du support de la pompe à main
  const hpBolts = [0, 1].map((i) => [0.49 + i * 0.12, 0.6]);
  each(P, 'W375', [
    ...tBolts.flatMap(([x, y]) => [[x, y, tpz + 0.001], [x, y, tbz + 0.001]]),
    ...hpBolts.flatMap(([x, y]) => [[x, y, hpz + 0.004], [x, y, hpz - 0.004]]),
  ].map((p) => at(washer(0.011, 0.005, 0.002, 'steel', { axis: 'z' }), p)), [0, 0, 0.55]);

  // 27 — Refroidisseurs AB-1202 (2) superposés, embouts contre les flasques de leur support (28), le
  // refroidisseur du bas posé sur le plancher.
  const cx = x1 - 0.13;
  for (const s of [-1, 1]) {
    const cy = floorTop + 0.1 + (s > 0 ? 0.2 : 0);
    P('AB-1202', group(
      at(cyl(0.085, 0.72, 'black', { axis: 'z', seg: 28 }), [cx, cy, 0]),
      ...[-1, 1].map((u) => at(cyl(0.1, 0.04, 'black', { axis: 'z', seg: 28 }), [cx, cy, u * 0.36])),
      at(cyl(0.025, 0.08, 'steel', { axis: 'y' }), [cx, cy + 0.1, 0.3]),
    ), [0.3, 0, s * 0.3]);
  }
  // 28 — Support : deux flasques verticales contre les embouts, pieds boulonnés au plancher par 34
  // (16 — rondelles sous les têtes et sous le plancher, 17 — écrous ; deux vis à double écrou).
  const fz = 0.38 + 0.006, footZ = 0.392 + 0.03, footT = 0.005;
  P('FMX-005-203PP', group(...[-1, 1].flatMap((u) => [
    at(box(0.22, 0.42, 0.012, 'red', { r: 0.003 }), [1.09, floorTop + 0.21, u * fz]),
    at(box(0.22, footT, 0.06, 'red'), [1.09, floorTop + footT / 2, u * footZ]),
  ])), [0.3, -0.2, 0]);
  const cBolts = [-1, 1].flatMap((u) => [1.0, 1.04, 1.08, 1.12].map((x) => [x, u * footZ]));
  const under = skid + t; // dessous du plancher
  each(P, 'B312-1250', cBolts.map(([x, z]) => at(bolt(0.008, 0.032, 'steel'), [x, floorTop + footT + 0.0016, z])), [0.35, 0, 0]);
  each(P, 'W312', [
    ...cBolts.map(([x, z]) => [x, floorTop + footT + 0.0008, z]),
    ...cBolts.map(([x, z]) => [x, under - 0.0008, z]),
    ...cBolts.filter(([x]) => x === 1.0).map(([x, z]) => [x, under - 0.0016 - 0.008 - 0.0008, z]),
  ].map((p) => at(washer(0.009, 0.004, 0.0016, 'steel'), p)), [0.3, 0, 0]);
  each(P, 'LN312NC', [
    ...cBolts.map(([x, z]) => [x, under - 0.0016 - 0.004, z]),
    ...cBolts.filter(([x]) => x === 1.0).map(([x, z]) => [x, under - 0.0032 - 0.008 - 0.004, z]),
  ].map((p) => at(nut(0.013, 0.008, 'steel'), p)), [0.25, 0, 0]);

  // 2 — Pompe de remplissage à main Fill-Rite (39 — support), sur le flanc gauche.
  P('FR150', group(
    at(cyl(0.05, 0.16, 'blackCast', { axis: 'y' }), [0.55, 0.55, z0 + 0.03]),
    at(box(0.025, 0.25, 0.025, 'steel'), [0.55, 0.72, z0 + 0.0], [0, 0, 0.5]),
    at(cyl(0.012, 0.35, 'steel', { axis: 'y', seg: 12 }), [0.55, 0.3, z0 + 0.03]),
  ), [0, 0, -0.4]);
  P('FBRA-002-204PP', at(box(0.14, 0.18, 0.006, 'red'), [0.55, 0.55, hpz]), [0, 0, -0.3]);
  // Vis du support (têtes côté pompe) et écrous à l'extérieur.
  each(P, 'B375-1000', hpBolts.map(([x, y]) => at(bolt(0.0095, 0.025, 'steel', { axis: 'z' }), [x, y, hpz + 0.005])), [0, 0, -0.3]);
  each(P, 'NC375', hpBolts.map(([x, y]) => at(nut(0.015, 0.009, 'steel', { axis: 'z' }), [x, y, hpz - 0.005 - 0.0045])), [0, 0, -0.2]);

  // 3 — Plancher grillagé inférieur, 7 — supérieur (rabattables à l'avant, axes 8/10 et goupilles 9,
  // broches de verrouillage 4 au travers des poteaux d'angle avant).
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
  // Goupilles fendues : deux par axe, passées dans l'axe (devant le panneau et au bout).
  each(P, 'CTP187-1250', Array.from({ length: 8 }, (_, i) => at(torus(0.012, 0.0025, 'steel', { axis: 'x' }), [i % 2 ? x1 + 0.07 : x1 + 0.015, (i < 4 ? 0.12 : 1.45) + 0.012, i % 4 < 2 ? z0 + 0.1 : z1 - 0.1])), [0.7, 0, 0]);
  // Broches : au travers du poteau d'angle avant jusque dans le montant du panneau, anneau au bout extérieur.
  each(P, 'UM-064-TD29', Array.from({ length: 8 }, (_, i) => {
    const y = 0.3 + Math.floor(i / 2) * 0.33, s = i % 2 ? 1 : -1;
    return group(
      at(cyl(0.012, 0.14, 'steel', { axis: 'z', seg: 12 }), [x1 - 0.012, y, s * (z1 - 0.033)]),
      at(torus(0.02, 0.005, 'red', { axis: 'x' }), [x1 - 0.012, y - 0.02, s * (z1 + 0.029)]),
    );
  }), [0.5, 0, 0]);

  // Visserie posée sur le plancher (supports, timon non monté).
  each(P, 'W500', Array.from({ length: 8 }, (_, i) => at(washer(0.014, 0.007, 0.0025, 'steel'), [x0 + 0.2 + i * 0.25, skid + t + 0.005, z0 + 0.12])), [0, 0.2, 0]);
  each(P, 'B500-3000', [0, 1].map((i) => at(bolt(0.0127, 0.076, 'steel'), [x0 + 0.3 + i * 0.4, skid + t + 0.01, z1 - 0.12])), [0, 0.3, 0]);
  each(P, 'B500-1250', [0, 1].map((i) => at(bolt(0.0127, 0.032, 'steel'), [x0 + 1.2 + i * 0.4, skid + t + 0.01, z1 - 0.12])), [0, 0.3, 0]);

  // Plaque de raccords rapides (laiton) posée sur la traverse basse et soudée au poteau d'angle arrière
  // gauche. Boyaux intérieurs, chacun dans sa voie au-dessus du plancher et des passages de fourche :
  // pression → bride de refoulement de la pompe 1 ; retour → collecteur de retour (ces deux-là longent le
  // plancher) ; drain → réservoir, qui monte dès la sortie de son raccord, sans repasser par le plancher.
  // Câble de commande : du presse-étoupe sous la boîte électrique, au-dessus du moteur, à la patte du poteau.
  const low = (hr) => forkTop + hr + 0.008;
  const floorRun = (z, xa, xb, hr) => {
    const n = Math.max(1, Math.ceil((xb - xa) / 0.25));
    return Array.from({ length: n + 1 }, (_, k) => [xa + ((xb - xa) * k) / n, low(hr), z]);
  };
  // xb = null : pas de descente au plancher, le boyau monte dès la sortie du raccord.
  const lane = (i, hr, xb, rise) => {
    const z = PP_PORTS[i][2];
    const bas = xb === null ? [] : [[x0 + 0.24, 0.25, z], ...floorRun(z, x0 + 0.34, xb, hr)];
    return [...out([x0, PP_PORTS[i][1], z], [1, 0, 0], 0.1, 0.14), ...bas, ...rise];
  };
  const lanes = [
    lane(0, 0.02, 0.1, [[0.22, low(0.02) + 0.01, -0.34], [0.32, 0.28, -0.31], ...into([pPort[0], pPort[1], pTip], [0, 0, -1], 0.1, 0.14)]),
    lane(1, 0.016, 0.06, [[0.15, 0.34, -0.42], [0.19, 0.62, -0.39], [0.21, 0.86, -0.32], [0.23, 0.99, -0.2], ...into(retPort, [0, 0, -1])]),
    lane(2, 0.016, null, [[-0.97, 0.31, -0.498], [-0.86, 0.37, -0.49], [-0.76, 0.6, -0.47], [-0.6, 0.98, -0.45], [-0.42, 1.19, -0.42], ...into([drainPort[0] - 0.05 * 0.795, drainPort[1], drainPort[2]], [-1, 0, 0])]),
  ];
  const hgy = hy - 0.305 - 0.006; // bas des presse-étoupes de la boîte électrique
  api.add(group(
    at(box(0.012, 0.2, 0.27, 'red', { r: 0.004 }), [x0 - 0.006, 0.265, -0.435]),
    ...PP_PORTS.map(([x, y, z], i) => group(
      at(cyl(i === 0 ? 0.024 : 0.019, 0.05, 'brass', { axis: 'x', seg: 18 }), [x + 0.025, y, z]),
      at(nut(i === 0 ? 0.05 : 0.042, 0.014, 'brass', { axis: 'x' }), [x + 0.055, y, z]),
    )),
    ...lanes.map((pts, i) => hose(pts, i === 0 ? 0.02 : 0.016)),
    at(box(0.012, 0.1, 0.12, 'red', { r: 0.003 }), [x0 - 0.0055, PP_CABLE[1], z0 + t + 0.02]),
    at(cyl(0.016, 0.04, 'black', { axis: 'x', seg: 14 }), [PP_CABLE[0] + 0.02, PP_CABLE[1], PP_CABLE[2]]),
    api.S.cable([[x0 + 0.45, hgy, z1 - 0.17], [x0 + 0.45, hgy - 0.025, z1 - 0.17], [x0 + 0.42, 0.82, 0.36], [x0 + 0.3, 0.865, 0.1],
      [x0 + 0.1, 0.92, PP_CABLE[2] + 0.02], [x0 + 0.01, PP_CABLE[1], PP_CABLE[2]]], 0.012),
  ));

  // Plaque UM sur le flanc droit du réservoir, à côté du voyant.
  api.add(at(box(0.26, 0.1, 0.004, 'white', { r: 0.01 }), [tx + 0.39, ty, tW / 2 + 0.002]));
  return { view: { dir: [1, 0.55, 0.9] } };
}

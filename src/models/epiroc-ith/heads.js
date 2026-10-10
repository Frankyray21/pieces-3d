import { SIZES, SIDE, layout, prof } from './common.js';

// Têtes de carottier (head assemblies) : DiscovOre (verrou à ressort, sans
// lance), Excore (verrou à piston), OWL L-Latch (verrou à biellettes) et OWL
// standard (verrou à ressort de torsion), en versions de surface et
// souterraines (joints de propulsion ou de pompage). Un seul constructeur
// paramétré par la famille, la taille et la correspondance rôle → repère de la
// liste du catalogue ; proportions tirées des vues éclatées et des photos du
// catalogue (longueur hors tout ≈ 12 fois le diamètre du corps).
//
// Repère : axe X, chapeau de tube intérieur à x = 0, lance (ou boîtier de
// rappel DiscovOre) vers +X. Cotes du profil en multiples du diamètre D.

const PI = Math.PI;
const UP = 3 * PI / 2; // angle de paroi tourné vers +Y (voir shapes.slotted, axe X)
const DOWN = PI / 2;

const MAT = {
  discovore: { body: 'blackOxide', valve: 'yellow', seal: 'blue' },
  excore: { body: 'darkSteel', valve: 'rubber', seal: 'yellow' },
  owl: { body: 'black', valve: 'safety', seal: 'red' },
};

/**
 * cfg : { size: 'B'|'N'|'H'|'P', type: 'discovore'|'excore'|'lLatch'|'owl',
 *         ug: souterrain, R: { rôle: repère } }.
 * Rôles non listés : pièce absente de la liste (pas dessinée).
 */
export function head(api, cfg) {
  const S = api.S;
  const { size, type, ug = false } = cfg;
  const R = cfg.R;
  const D = SIZES[size].D;
  const sh = SIZES[size].shoulder / D / 2; // rayon de l'épaulement en D
  const owl = type === 'owl' || type === 'lLatch';
  const fam = type === 'discovore' ? 'discovore' : owl ? 'owl' : 'excore';
  const M = { ...MAT[fam], ...(cfg.mat || {}) };
  // Vue éclatée comme les dessins du catalogue : le corps sur l'axe (A), la pile
  // de l'axe sur sa rangée (S) dans l'ordre de montage (écrou bas, roulement,
  // ressort, boîtier, butée, clapets, axe, écrou), les petites pièces dessous
  // (B), la trousse du boîtier de rappel au-dessus (C).
  const L = layout(api, D, { rows: { A: 0, S: -2.3, B: -3.8, C: 2.1 }, minPitch: 0.75, anchor: true });
  const S_ = (order) => ({ row: 'S', order });
  const anchor = { latch: 0, top: 0 };
  const has = (role) => R[role] != null;
  const ref = (role, i = 0) => (Array.isArray(R[role]) ? R[role][Math.min(i, R[role].length - 1)] : R[role]);
  const X = (x, y = 0, z = 0) => [x * D, y * D, z * D];
  const lat = (pts, mat) => S.lathe(prof(D, pts), mat, { axis: 'x', seg: 40 });
  const th = (r, a, b, pitch = 0.07, o = {}) => S.thread(r, a, b, { pitch, maxTurns: 9, ...o });
  const win = (a, w, x0, x1) => ({ a, w, y0: x0 * D, y1: x1 * D });
  const hole = (a, x, r, wall, through = true) => S.roundHole(a, x * D, r * D, wall * D, { through });
  // Trous d'une goupille parallèle à Z décalée de yo (en D) du centre.
  const pinHoles = (x, yo, r, wall) => {
    const t = Math.asin(Math.max(-0.95, Math.min(0.95, -yo / wall)));
    return [...hole(t, x, r, wall, false), ...hole(PI - t, x, r, wall, false)];
  };
  const tube = (rO, rI, x0, x1, wins, mat) => S.slotted(rO * D, rI * D, x0 * D, x1 * D, wins, mat, { axis: 'x', seg: 56 });
  const pinZ = (r, len, x, y = 0, mat = 'steel') => S.cyl(r * D, len * D, mat, { axis: 'z', pos: X(x, y) });
  // Ressorts plus légers (fil fin : 10 segments par spire, 6 autour du fil suffisent).
  const spr = (r, wire, len, turns, mat, o = {}) => S.spring(r, wire, len, turns, mat, { perTurn: 10, radial: 6, ...o });
  const add = (role, obj, o) => { if (has(role)) L.add(ref(role, o?.i ?? 0), obj, o); return obj; };

  // ---------------------------------------------------------------- bas commun
  // Chapeau de tube intérieur : taraudé en bas (il se visse sur le filet mâle
  // du tube intérieur), alésage taraudé en haut (boîtier de roulement).
  // DiscovOre : fentes de lavage inclinées.
  const capTop = 3.0;
  const k0 = capTop - 2.35; // décalage des pièces logées dans le chapeau
  const itR = SIZES[size].inner[0] / 2 / D; // rayon du tube intérieur (en D)
  const cR = Math.max(0.5, itR + 0.012), bR = itR * 0.95; // chapeau, filet femelle du bas
  const capBox = th(bR, 0, 0.6, 0.07, { chamferBottom: false }).map(([r, y]) => [2 * bR - r, y]).reverse();
  if (has('cap')) {
    const pts = [[bR, 0], [cR - 0.03, 0], [cR, 0.03], [cR, capTop - 0.06], [cR - 0.03, capTop], [0.41, capTop], [0.41, 1.88 + k0], [0.37, 1.84 + k0], [0.37, 0.66], [bR - 0.02, 0.6], ...capBox];
    if (type === 'discovore') {
      // Quatre fentes inclinées (repère 25/27 des dessins), en gradins.
      const cs0 = 1.0, cs1 = capTop - 0.65, n = 6;
      const wins = [];
      for (let k = 0; k < 4; k++) for (let j = 0; j < n; j++) wins.push(win((k * PI) / 2 + 0.3 + j * 0.06, 0.13, cs0 + (j * (cs1 - cs0)) / n, cs0 + ((j + 1) * (cs1 - cs0)) / n + 0.02));
      const g = S.group(
        lat([[bR, 0], [cR - 0.03, 0], [cR, 0.03], [cR, 0.75], [0.37, 0.75], [0.37, 0.66], [bR - 0.02, 0.6], ...capBox], M.body),
        tube(cR, 0.37, 0.73, capTop - 0.5, wins, M.body),
        lat([[0.41, capTop - 0.52], [cR, capTop - 0.52], [cR, capTop - 0.06], [cR - 0.03, capTop], [0.41, capTop]], M.body),
      );
      add('cap', g, { row: 'A' });
    } else add('cap', lat(pts, M.body), { row: 'A' });
  }
  if (has('capGrease')) add('capGrease', S.at(S.fitting(0.13 * D, 0.26 * D, 'brass'), X(1.25 + k0, cR)), { follow: ref('cap'), extra: [0, 0.9, 0] });
  if (has('checkBody')) add('checkBody', lat([[0.12, -0.08], [0.36, -0.08], [0.36, 0.05], [0.3, 0.12], ...th(0.33, 0.12, 0.55), [0.12, 0.55]], M.body), { row: 'B' });
  if (has('capBall')) add('capBall', S.ball(0.011, 'chrome', { pos: X(0.75) }), { row: 'B' });
  if (has('capAdapter')) add('capAdapter', lat([[0.14, -0.55], [0.47, -0.55], [0.5, -0.5], [0.5, -0.12], ...th(0.44, -0.12, 0.25), [0.3, 0.25], [0.3, -0.2], [0.14, -0.25]], M.body), { row: 'A' });
  if (has('capValve')) add('capValve', lat([[0, -0.4], [0.16, -0.4], [0.2, -0.3], [0.2, -0.1], [0, -0.05]], 'steel'), { row: 'B' });
  // Protecteur de filet : bouchon à collerette enfoncé dans le filet femelle du chapeau.
  if (has('threadProtector')) add('threadProtector', lat([[bR - 0.12, -0.06], [cR, -0.06], [cR, 0], [bR - 0.01, 0], [bR - 0.01, 0.5], [bR - 0.12, 0.5]], 'rubber'), { row: 'B' });

  // Boîtier de roulement : filet mâle vissé dans le chapeau, flasque percée en haut.
  const hTop = 3.45 + k0;
  if (has('housing')) {
    const pts = [[0.33, 1.9 + k0], [0.37, 1.9 + k0], ...th(0.4, 1.9 + k0, capTop - 0.02), [0.4, capTop], [0.5, capTop + 0.04], [0.5, hTop - 0.05], [0.45, hTop], [0.19, hTop], [0.19, hTop - 0.2], [0.33, hTop - 0.26]];
    add('housing', lat(pts, M.body), S_(6));
  }
  const twoThrust = Array.isArray(R.thrust) && R.thrust.length > 1;
  if (has('thrust')) {
    L.add(ref('thrust', 0), S.bearing(0.3 * D, 0.155 * D, 0.15 * D, 'steel', { thrust: true, axis: 'x', pos: X(hTop - 0.3) }), S_(7));
    if (twoThrust || cfg.thrustAbove) L.add(ref('thrust', 1), S.bearing(0.3 * D, 0.155 * D, 0.13 * D, 'steel', { thrust: true, axis: 'x', pos: X(hTop + 0.07) }), S_(7.1));
  }
  if (has('hanger')) add('hanger', S.bearing(0.31 * D, 0.155 * D, 0.2 * D, 'steel', { axis: 'x', pos: X(hTop - 0.52) }), S_(5));
  if (has('ballBearing')) add('ballBearing', S.bearing(0.3 * D, 0.155 * D, 0.16 * D, 'steel', { axis: 'x', pos: X(1.72 + k0) }), S_(2));
  if (has('cushion')) add('cushion', spr(0.21 * D, 0.038 * D, 1.0 * D, 6.5, M.spring || 'green', { axis: 'x', pos: X(hTop - 0.62 - 0.5) }), S_(4));
  if (has('bearingWasher')) add('bearingWasher', S.washer(0.25 * D, 0.155 * D, 0.05 * D, 'steel', { axis: 'x', pos: X(1.58 + k0) }), S_(3));
  if (has('narrowWasher')) add('narrowWasher', S.washer(0.22 * D, 0.155 * D, 0.04 * D, 'steel', { axis: 'x', pos: X(1.53 + k0) }), S_(3.2));
  if (has('bottomNut')) add('bottomNut', S.nut(0.36 * D, 0.2 * D, cfg.bottomNutMat || 'steel', { axis: 'x', pos: X(1.4 + k0) }), S_(1));

  // Pile de clapets d'arrêt (shut-off valves) et rondelles de réglage sur l'axe.
  let vs = hTop + (twoThrust || cfg.thrustAbove ? 0.17 : 0.03);
  const stack = cfg.stack || ['valveWashers', 'valves', 'valveWashers', 'valves'];
  const seen = {};
  const stackStart = vs;
  stack.forEach((role, k) => {
    if (!has(role)) return;
    const i = (seen[role] = (seen[role] ?? -1) + 1);
    const o = { ...S_(8 + k * 0.01), gap: 0.2 };
    if (role === 'valves') {
      const t = 0.2;
      L.add(ref(role, i), lat([[0.17, vs], [0.38, vs], [0.47, vs + 0.04], [0.47, vs + 0.13], [0.42, vs + t], [0.17, vs + t]], M.valve), o);
      vs += t;
    } else if (role === 'taperWashers') {
      L.add(ref(role, i), lat([[0.17, vs], [0.3, vs], [0.38, vs + 0.08], [0.17, vs + 0.08]], 'steel'), o);
      vs += 0.08;
    } else {
      L.add(ref(role, i), S.washer(0.36 * D, 0.17 * D, 0.06 * D, 'steel', { axis: 'x', pos: X(vs + 0.03) }), o);
      vs += 0.06;
    }
  });
  if (!has('valves')) vs = stackStart + 0.5;

  // Axe (spindle) : bas fileté (écrou), haut fileté vissé dans le corps
  // inférieur (Excore, OWL) ou tête taraudée recevant le corps (DiscovOre).
  const spTop = vs + (type === 'discovore' ? 0.62 : 0.65);
  if (has('spindle')) {
    const pts = type === 'discovore'
      ? [[0, 1.25 + k0], [0.13, 1.25 + k0], ...th(0.155, 1.25 + k0, 1.6 + k0, 0.05), [0.155, stackStart], [0.24, stackStart], [0.24, vs], [0.42, vs], [0.42, spTop], [0.3, spTop], [0.3, spTop - 0.4], [0, spTop - 0.4]]
      : [[0, 1.25 + k0], [0.13, 1.25 + k0], ...th(0.155, 1.25 + k0, 1.6 + k0, 0.05), [0.155, stackStart - 0.02], [0.24, stackStart - 0.02], [0.24, stackStart], [0.155, stackStart], [0.155, vs], ...th(0.16, vs, spTop + 0.4, 0.06, { chamferBottom: false }), [0.12, spTop + 0.42], [0, spTop + 0.42]];
    add('spindle', lat(pts, 'steel'), S_(9));
  }
  // Écrou de blocage en haut de l'axe (laiton chez Excore / OWL).
  let lb0 = spTop;
  if (type === 'discovore') {
    if (has('topNut')) add('topNut', lat([[0.3, spTop], [0.43, spTop], [0.45, spTop + 0.03], [0.45, spTop + 0.27], [0.42, spTop + 0.3], [0.3, spTop + 0.3]], 'steel'), S_(10));
    lb0 = spTop + 0.3;
  } else {
    const nh = 0.24;
    if (has('nordLock')) { add('nordLock', S.washer(0.3 * D, 0.16 * D, 0.04 * D, 'steel', { axis: 'x', pos: X(vs + 0.02) }), S_(9.5)); }
    if (has('topNut')) add('topNut', S.nut(0.52 * D, nh * D, cfg.topNutMat || 'brass', { axis: 'x', pos: X(vs + 0.04 + nh / 2 + 0.02) }), S_(10));
    lb0 = vs + 0.32;
  }

  // ---------------------------------------------------------------- corps inférieur, bille, bague, épaulement
  const lbLen = type === 'discovore' ? 1.55 : 1.7;
  const lb1 = lb0 + lbLen; // haut du corps (siège de l'épaulement)
  if (has('lowerBody')) {
    const pin = type === 'discovore' ? [[0.17, lb0 - 0.38], [0.24, lb0 - 0.38], ...th(0.29, lb0 - 0.38, lb0), [0.46, lb0]] : [[0.17, lb0], [0.4, lb0], [0.46, lb0 + 0.06]];
    const pts = [...pin, [0.46, lb1 - 0.35], [0.42, lb1 - 0.3], [0.42, lb1], ...th(0.35, lb1, lb1 + 0.42, 0.06, { chamferBottom: false }), [0.3, lb1 + 0.42], [0.28, lb1 + 0.42], [0.28, lb0 + 0.55], [0.17, lb0 + 0.45]];
    const body = lat(pts, M.body);
    // Orifices de passage d'eau.
    const g = S.group(body);
    for (const a of [0, PI / 2, PI, -PI / 2]) {
      const port = S.cyl(0.075 * D, 0.03 * D, 'black', { axis: 'z', pos: [0, 0, 0] });
      port.position.set((lb0 + 0.55) * D, Math.sin(a) * 0.455 * D, Math.cos(a) * 0.455 * D);
      port.rotation.set(-a, 0, 0);
      g.add(port);
    }
    add('lowerBody', g, { row: 'A' });
  }
  if (has('ball')) {
    const br = cfg.bigBall ? 0.015875 : 0.011;
    add('ball', S.ball(br, 'chrome', { pos: [(lb1 - 0.2) * D - br, 0, 0] }), { row: 'B', i: 0 });
    if (cfg.bigBall && Array.isArray(R.ball)) L.add(ref('ball', 1), S.ball(br, 'chrome', { pos: X(1.0) }), { row: 'B' });
  }
  if (has('bushing')) add('bushing', lat([[0.13, lb1 - 0.2], [0.27, lb1 - 0.2], [0.27, lb1 + 0.12], [0.13, lb1 + 0.12]], 'lightGrey'), { row: 'B' });
  if (has('indicatorSpring')) add('indicatorSpring', spr(0.1 * D, 0.025 * D, 0.3 * D, 5, 'green', { axis: 'x', pos: X(lb1 + 0.3) }), { row: 'B' });
  if (has('shoulder')) {
    add('shoulder', lat([[0.425, lb1 - 0.02], [sh - 0.06, lb1 - 0.02], [sh, lb1 + 0.06], [sh, lb1 + 0.4], [sh - 0.03, lb1 + 0.43], [0.425, lb1 + 0.43]], 'steel'), { row: 'A' });
  }
  let up0 = lb1 + 0.43; // départ de la partie haute

  // Section de pompage souterraine : corps intermédiaire / raccord portant deux joints.
  if (ug) {
    const role = type === 'discovore' ? 'midBody' : owl ? 'adaptor' : 'coupler';
    const len = type === 'discovore' ? 1.55 : 1.25;
    const c0 = up0, c1 = up0 + len;
    if (has(role)) {
      add(role, lat([[0.3, c0 - 0.4], [0.33, c0 - 0.4], ...th(0.35, c0 - 0.4, c0), [0.4, c0], [0.4, c1 - 0.2], [0.47, c1 - 0.16], [0.47, c1], [0.3, c1]], type === 'discovore' ? M.body : owl ? 'lightGrey' : M.body), { row: 'A' });
    }
    if (has('sealSeat')) add('sealSeat', S.washer(0.47 * D, 0.4 * D, 0.08 * D, 'steel', { axis: 'x', pos: X(c0 + 0.04) }), { row: 'A', gap: 0.2 });
    // Joints de propulsion DiscovOre : joint bas bombé, joint haut en coupelle
    // à lèvre (dessus) ; joints à lèvre Excore / L-Latch identiques.
    const seals = type === 'discovore' ? ['propLower', 'propUpper'] : ['lipSeals', 'lipSeals'];
    seals.forEach((role2, k) => {
      if (!has(role2)) return;
      const s0 = c0 + 0.15 + k * 0.5, e = s0 + 0.44;
      const pts = role2 === 'propLower'
        ? [[0.4, s0], [sh - 0.06, s0], [sh + 0.01, s0 + 0.1], [sh + 0.04, s0 + 0.22], [sh + 0.01, s0 + 0.34], [sh - 0.06, e], [0.4, e]]
        : role2 === 'propUpper'
          ? [[0.4, s0], [sh - 0.05, s0], [sh - 0.03, s0 + 0.28], [sh + 0.05, e - 0.02], [sh + 0.02, e], [0.46, e], [0.44, s0 + 0.32], [0.4, s0 + 0.32]]
          : [[0.4, s0], [sh + 0.02, s0], [sh + 0.04, s0 + 0.06], [sh - 0.02, s0 + 0.42], [0.4, s0 + 0.42]];
      L.add(role2 === 'lipSeals' ? ref(role2, 0) : ref(role2), lat(pts, M.seal), { row: 'A', gap: 0.2 });
    });
    if (has('midSleeve')) add('midSleeve', lat([[0.4, c1 - 0.5], [0.46, c1 - 0.5], [0.46, c1 - 0.2], [0.4, c1 - 0.2]], 'steel'), { row: 'A' });
    up0 = c1;
  }
  if (has('indBushing')) add('indBushing', lat([[0.1, up0 - 0.1], [0.22, up0 - 0.1], [0.22, up0 + 0.15], [0.1, up0 + 0.15]], 'lightGrey'), { row: 'B' });

  // ---------------------------------------------------------------- partie haute
  if (type === 'discovore') discovoreTop();
  else spearTop();

  L.done();
  // Repères pour l'insertion dans un carottier (mètres, axe de la tête) :
  // face d'appui de l'épaulement, milieu des cliquets, bout de la tête.
  return { view: { ...SIDE, anchors: { shoulder: (lb1 - 0.02) * D, latch: anchor.latch * D, top: anchor.top * D } } };

  // DiscovOre : corps intermédiaire, corps de verrou à fenêtres, cliquets
  // poussés par un ressort, boîtier de rappel coiffant le tout (l'overshot
  // Arrow 3S le saisit), tige et ressort de rappel, boulon d'assemblage.
  function discovoreTop() {
    let m0 = up0;
    if (!ug && has('midBody')) {
      add('midBody', lat([[0.3, m0 - 0.4], [0.33, m0 - 0.4], ...th(0.35, m0 - 0.4, m0), [0.47, m0], [0.47, m0 + 0.95], [0.4, m0 + 1.0], [0.3, m0 + 1.0]], M.body), { row: 'A' });
      m0 += 1.0;
    }
    // Corps de verrou : filet mâle et collet hexagonal en bas, deux longues
    // lumières (cliquets) et quatre lumières étroites, trou de l'écrou-barillet
    // en haut (et en bas quand la tête a un second jeu de fixation).
    const lt0 = m0, lt1 = m0 + 3.2;
    const lw0 = lt0 + 0.6, lw1 = lt0 + 2.5;
    const nutTop = lt1 - 0.25, nutLow = lt0 + 0.55;
    const second = !!cfg.secondSet;
    if (has('latchBody')) {
      const wins = [win(UP, 0.75, lw0, lw1), win(DOWN, 0.75, lw0, lw1), ...[UP - 0.62, UP + 0.62, DOWN - 0.62, DOWN + 0.62].map((a) => win(a, 0.16, lt0 + 0.9, lt0 + 2.2)), ...hole(0, nutTop, 0.15, 0.46)];
      if (second) wins.push(...hole(0, nutLow, 0.15, 0.46));
      const g = S.group(
        tube(0.46, 0.3, lt0 + 0.35, lt1, wins, M.body),
        lat([[0.3, lt0 - 0.4], [0.33, lt0 - 0.4], ...th(0.35, lt0 - 0.4, lt0), [0.3, lt0], [0.3, lt0 + 0.35]], M.body),
        S.nut(0.98 * D, 0.35 * D, M.body, { axis: 'x', pos: X(lt0 + 0.175) }),
      );
      add('latchBody', g, { row: 'A' });
    }
    // Cliquets : plaques coudées (« dog-leg ») de toute la longueur des lumières,
    // bec en haut ; ressort entre les deux, qui les pousse vers l'extérieur.
    if (has('latches')) {
      for (const s of [1, -1]) {
        const pts = [[0.05, 0.08], [1.85, 0.08], [1.85, 0.45], [1.72, 0.62], [1.1, 0.5], [0.6, 0.5], [0.22, 0.36], [0.05, 0.3]].map(([u, v]) => [(lw0 + u) * D, s * v * D]);
        L.add(ref('latches'), S.extrude(s > 0 ? pts : pts.reverse(), 0.25 * D, M.body), { follow: ref('latchBody'), extra: [0, s * 1.0, 0] });
      }
    }
    if (has('latchSpring')) add('latchSpring', spr(0.07 * D, 0.015 * D, 0.55 * D, 8, 'steel', { axis: 'y', pos: X(lw0 + 0.9) }), { follow: ref('latchBody'), extra: [0, 0, 1.3] });
    // Boîtier de rappel : lumières ouvertes en bas (cliquets), trous par paires,
    // haut ouvert à gorge (saisie par l'overshot) et épaulement intérieur où
    // s'appuie la tête du boulon d'assemblage.
    const rc0 = lw0 - 0.1, rc1 = lt1 + 1.9;
    anchor.latch = (lw0 + lw1) / 2;
    anchor.top = rc1;
    if (has('retCase')) {
      const wins = [win(UP, 0.8, rc0 - 0.01, lw1 + 0.15), win(DOWN, 0.8, rc0 - 0.01, lw1 + 0.15)];
      for (const x of [rc0 + 2.3, rc0 + 2.85, rc0 + 3.4]) wins.push(...hole(0, x, 0.05, 0.5, false), ...hole(PI * 0.75, x + 0.2, 0.05, 0.5, false));
      wins.push(...hole(0, rc1 - 0.34, 0.06, 0.5));
      const g = S.group(
        tube(0.5, 0.465, rc0, rc1 - 0.62, wins, M.body),
        lat([[0.22, rc1 - 0.62], [0.5, rc1 - 0.62], [0.5, rc1 - 0.5], [0.42, rc1 - 0.42], [0.42, rc1 - 0.24], [0.5, rc1 - 0.16], [0.5, rc1 - 0.04], [0.46, rc1], [0.34, rc1], [0.34, rc1 - 0.5], [0.22, rc1 - 0.5]], M.body),
      );
      add('retCase', g, { row: 'A' });
    }
    // Fixation : boulon d'assemblage (tête sur l'épaulement du boîtier) vissé
    // dans un écrou-barillet transversal en haut du corps de verrou, ressort du
    // boîtier autour du boulon ; second jeu tête en bas (corps intermédiaire).
    const C = { row: 'C' };
    const nutRole = has('assemblyRod') ? 'assemblyRod' : 'assemblyPin';
    if (has('bolt')) L.add(ref('bolt'), S.bolt(0.12 * D, (rc1 - 0.46 - nutTop + 0.1) * D, cfg.boltMat || 'safety', { axis: 'x', pos: X(rc1 - 0.46) }), C);
    if (has('wedgeWasher')) L.add(ref('wedgeWasher'), S.washer(0.12 * D, 0.065 * D, 0.04 * D, 'steel', { axis: 'x', pos: X(rc1 - 0.48) }), C);
    if (has('caseSpring')) add('caseSpring', spr(0.17 * D, 0.03 * D, (rc1 - 0.66 - lt1) * D, 7, 'steel', { axis: 'x', pos: X((lt1 + rc1 - 0.62) / 2) }), C);
    if (has(nutRole)) L.add(ref(nutRole), pinZ(0.14, 0.92, nutTop), C);
    if (second) {
      if (has('bolt')) L.add(ref(has('bolt2') ? 'bolt2' : 'bolt'), S.bolt(0.12 * D, (nutLow + 0.1 - (lt0 - 0.38)) * D, cfg.boltMat || 'safety', { axis: '-x', pos: X(lt0 - 0.38) }), C);
      if (has('wedgeWasher')) L.add(ref('wedgeWasher'), S.washer(0.12 * D, 0.065 * D, 0.04 * D, 'steel', { axis: 'x', pos: X(lt0 - 0.36) }), C);
      if (has(nutRole)) L.add(ref(nutRole), pinZ(0.14, 0.92, nutLow), C);
    }
    if (has('safetyPin')) {
      const pin = S.group(
        pinZ(0.045, 1.25, rc1 - 0.34),
        S.torus(0.24 * D, 0.025 * D, 'steel', { axis: 'z', pos: X(rc1 - 0.34 - 0.25, 0, 0.7) }),
      );
      add('safetyPin', pin, { follow: ref('retCase'), extra: [0.4, 1.5, 0] });
    }
    if (has('tagHolder')) add('tagHolder', S.torus(0.14 * D, 0.02 * D, 'steel', { axis: 'z', pos: X(rc1 - 0.95, 0, 0.75) }), { follow: ref('retCase'), extra: [0, 2.0, 0.6] });
    for (const [role, dx, col] of [['tag', 0, 'orange'], ['tag2', 0.55, 'yellow']]) {
      if (has(role)) {
        const tag = S.box(0.42 * D, 0.62 * D, 0.012 * D, col, { pos: X(rc1 - 1.25 - dx, -0.4, 0.82) });
        add(role, tag, { follow: ref('retCase'), extra: [0, 2.2, 0.8] });
      }
    }
  }

  // Lance (Excore, OWL) : corps supérieur à fenêtres et cliquets, boîtier de
  // rappel, base de lance et lance que l'overshot saisit.
  function spearTop() {
    const u0 = up0, u1 = up0 + 3.25;
    const lw0 = u0 + 1.45, lw1 = u0 + 2.95; // fenêtres des cliquets
    const pivot = type === 'lLatch' ? lw1 - 0.15 : lw0 + 0.12;
    // Excore : deux goupilles de pivot décalées ; OWL et L-Latch : une seule
    // goupille traverse les deux cliquets, posés côte à côte (décalés en z).
    const yo = type === 'excore' ? 0.17 : 0;
    const zo = type === 'lLatch' ? 0.13 : 0;
    if (has('upperBody')) {
      const wins = [win(UP, 0.62, lw0, lw1), win(DOWN, 0.62, lw0, lw1)];
      if (yo) wins.push(...pinHoles(pivot, yo, 0.055, 0.475), ...pinHoles(pivot, -yo, 0.055, 0.475));
      else wins.push(...hole(0, pivot, 0.06, 0.475));
      if (type === 'excore') wins.push(...hole(0, u0 + 0.75, 0.06, 0.475));
      const g = S.group(
        tube(0.475, 0.36, u0 + 0.05, u1, wins, M.body),
        lat([[0.36, u0 - 0.03], [0.44, u0 - 0.03], [0.475, u0], [0.475, u0 + 0.05], [0.36, u0 + 0.05]], M.body),
      );
      add('upperBody', g, { row: 'A' });
    }
    // Cliquets : plaques pivotantes dont le bec sort des fenêtres.
    if (has('latches')) {
      for (const s of [1, -1]) {
        const base = type === 'lLatch'
          ? [[0.12, -0.1], [0.12, 0.14], [-0.95, 0.42], [-1.15, 0.6], [-1.32, 0.58], [-1.3, 0.3], [-1.0, 0.06], [-0.1, -0.12]]
          : [[-0.12, -0.1], [0.1, -0.14], [1.2, 0.04], [1.36, 0.26], [1.36, 0.6], [1.18, 0.62], [1.04, 0.36], [0.25, 0.16], [-0.12, 0.12]];
        const pts = base.map(([u, v]) => [(pivot + u) * D, s * (yo + v) * D]);
        const latch = S.extrude(s > 0 ? pts : pts.reverse(), 0.26 * D, owl ? 'black' : 'steel');
        latch.position.z += s * zo * D;
        L.add(ref('latches'), latch, { follow: ref('upperBody'), extra: [0, s * 1.35, 0] });
      }
    }
    if (has('latchPins')) {
      for (const s of yo ? [1, -1] : [0]) L.add(ref('latchPins'), pinZ(0.05, 0.95, pivot, s * yo), { follow: ref('upperBody'), extra: [0, s * 0.4, 1.3] });
    }
    // Excore : piston de verrouillage, ressort, guide et vis.
    if (type === 'excore') {
      if (has('piston')) add('piston', lat([[0, lw0 - 0.1], [0.27, lw0 - 0.1], [0.27, lw1 - 0.4], [0.12, lw1 - 0.1], [0, lw1 - 0.1]], 'steel'), { row: 'B' });
      if (has('pistonSpring')) add('pistonSpring', spr(0.21 * D, 0.04 * D, (lw0 - 0.1 - (u0 + 0.6)) * D, 6, 'green', { axis: 'x', pos: X((lw0 - 0.1 + u0 + 0.6) / 2) }), { row: 'B' });
      if (has('guide')) add('guide', lat([[0.07, u0 + 0.45], [0.25, u0 + 0.45], [0.25, u0 + 0.6], [0.14, u0 + 0.6], [0.14, u0 + 1.1], [0.07, u0 + 1.1]], 'steel'), { row: 'B' });
      if (has('hhcs')) add('hhcs', S.bolt(0.13 * D, 0.55 * D, 'steel', { axis: '-x', pos: X(u0 + 0.38) }), { row: 'B' });
    }
    // OWL L-Latch : vis, rondelle d'appui, ressort de compression, biellettes.
    if (type === 'lLatch') {
      if (has('hexBolt')) add('hexBolt', S.bolt(0.13 * D, 0.45 * D, 'steel', { axis: '-x', pos: X(u0 + 0.35) }), { row: 'B' });
      if (has('latchSpring')) add('latchSpring', spr(0.22 * D, 0.04 * D, 0.85 * D, 6, 'steel', { axis: 'x', pos: X(u0 + 1.0) }), { row: 'B' });
      if (has('latchWasher')) add('latchWasher', S.washer(0.3 * D, 0.08 * D, 0.06 * D, 'steel', { axis: 'x', pos: X(u0 + 1.46) }), { row: 'B' });
      if (has('pistonValve')) add('pistonValve', S.group(lat([[0, u0 + 0.1], [0.08, u0 + 0.1], [0.08, u0 + 0.9], [0, u0 + 0.9]], 'black'), S.ball(0.11 * D, 'black', { pos: X(u0 + 0.12) })), { row: 'B' });
      if (has('links')) {
        for (const s of [1, -1]) {
          const pts = [[u0 + 1.5, s * 0.06], [u0 + 1.62, s * 0.02], [lw1 - 1.1, s * 0.3], [lw1 - 1.2, s * 0.38]].map(([x, y]) => [x * D, y * D]);
          L.add(ref('links'), S.extrude(s > 0 ? pts : pts.reverse(), 0.2 * D, 'black'), { follow: ref('upperBody'), extra: [0, s * 0.85, 0] });
        }
      }
    }
    // OWL standard : ressort de torsion entre les deux cliquets.
    if (type === 'owl' && has('torsionSpring')) {
      add('torsionSpring', spr(0.09 * D, 0.02 * D, 0.32 * D, 4, 'steel', { axis: 'z', pos: X(pivot + 0.3) }), { follow: ref('upperBody'), extra: [0.3, 0, 1.5] });
    }
    // Boîtier de rappel (latch retracting case) et goupilles.
    const rc0 = u1 - 1.05, rc1 = u1 + 0.75;
    if (has('retCase')) {
      const wins = [win(UP, 0.7, rc0 - 0.01, rc0 + 0.75), win(DOWN, 0.7, rc0 - 0.01, rc0 + 0.75), ...hole(0, rc1 - 0.3, 0.08, 0.52), ...hole(0, rc0 + 0.95, 0.05, 0.52)];
      add('retCase', tube(0.52, 0.48, rc0, rc1, wins, M.body), { row: 'A' });
    }
    if (has('casePin')) add('casePin', pinZ(0.075, 1.15, rc1 - 0.3), { follow: ref('retCase'), extra: [0, 0, 1.6] });
    // Goupilles du boîtier : deux (B) ou une seule (N, H) selon la liste.
    if (has('casePins')) for (const s of (cfg.casePins === 1 ? [0] : [1, -1])) L.add(ref('casePins'), pinZ(0.045, 0.6, rc0 + 0.95, s * 0.22), { follow: ref('retCase'), extra: [0, s * 0.5, 1.4] });
    // Base de lance et lance.
    const b0 = rc1 - 0.55, b1 = rc1 + 0.62;
    anchor.latch = (lw0 + lw1) / 2;
    anchor.top = b1 + 0.95;
    if (has('spearBase')) {
      add('spearBase', lat([[0, b0], [0.47, b0], [0.47, rc1], [0.5, rc1 + 0.02], [0.5, rc1 + 0.14], [0.32, rc1 + 0.4], [0.3, b1], [0.13, b1], [0.13, b1 - 0.36], [0, b1 - 0.36]], M.body), { row: 'A' });
    }
    if (has('detent')) add('detent', lat([[0, b1 - 0.52], [0.07, b1 - 0.52], [0.07, b1 - 0.42], [0, b1 - 0.36]], 'steel'), { row: 'B' });
    if (has('detentSpring')) add('detentSpring', spr(0.055 * D, 0.012 * D, 0.2 * D, 6, 'steel', { axis: 'x', pos: X(b1 - 0.64) }), { row: 'B' });
    if (has('spearhead')) {
      const t = b1 + 0.95;
      add('spearhead', lat([[0, b1 - 0.34], [0.12, b1 - 0.34], [0.12, b1], [0.29, b1 + 0.02], [0.29, b1 + 0.12], [0.19, b1 + 0.18], [0.19, b1 + 0.4], [0.37, b1 + 0.48], [0.37, b1 + 0.54], [0.08, t - 0.04], [0, t]], cfg.spearMat || M.body), { row: 'A' });
    }
    if (has('spearPin')) add('spearPin', pinZ(0.06, 0.66, b1 - 0.16), { follow: ref('spearBase'), extra: [0, 0, 1.3] });
    if (has('spearPin2')) add('spearPin2', pinZ(0.04, 0.6, b0 + 0.3, 0.2), { follow: ref('spearBase'), extra: [0, 0.6, 1.3] });
    if (has('capPin')) add('capPin', pinZ(0.035, 0.9, 0.58), { follow: ref('cap'), extra: [0, 0, 1.3] });
  }
}

// ---------------------------------------------------------------- pages du catalogue
// Correspondance rôle → repère pour chaque liste (pages 7 à 92).

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String(a + i));
const H = (size, type, R, o = {}) => (api) => head(api, { size, type, R, ...o });

// DiscovOre de surface : 1 boîtier de rappel … 23/25 chapeau.
const DO_B = { retCase: '1', bolt: '2', wedgeWasher: '3', caseSpring: '4', assemblyRod: '5', latchSpring: '6', latches: '7', latchBody: '8', midBody: '9', shoulder: '10', ball: '11', bushing: '12', lowerBody: '13', topNut: '14', spindle: '15', valves: '16', valveWashers: '17', thrust: ['18', '18'], housing: '19', cushion: '20', ballBearing: '21', bottomNut: '22', cap: '23', safetyPin: '24' };
const DO_N = { ...DO_B, thrust: '18', housing: '19', hanger: '20', cushion: '21', bearingWasher: '22', ballBearing: '23', bottomNut: '24', cap: '25', safetyPin: '26' };
export const P007 = H('B', 'discovore', DO_B);
export const P019 = H('N', 'discovore', DO_N);
export const P035 = H('H', 'discovore', DO_N);
export const P050 = H('P', 'discovore', {
  retCase: '1', bolt: '2', wedgeWasher: '3', caseSpring: '4', assemblyRod: '5', latchSpring: '6', latches: '7', latchBody: '8', midBody: '9', shoulder: '10', bushing: '12', lowerBody: '13', topNut: '14', spindle: '15', valves: '16', taperWashers: '17', valveWashers: '18', thrust: ['19', '19'], housing: '20', hanger: '21', cushion: '22', bearingWasher: '23', ballBearing: '24', bottomNut: '25', cap: '26', ball: ['27', '27'], capAdapter: '28',
}, { bigBall: true, stack: ['valveWashers', 'taperWashers', 'valves', 'taperWashers', 'valves'] });

// DiscovOre souterrain : joints de propulsion sur le corps intermédiaire.
export const P065 = H('B', 'discovore', {
  retCase: '1', bolt: '2', wedgeWasher: '3', caseSpring: '4', assemblyPin: '5', latchSpring: '6', latches: '7', latchBody: '8', bolt2: '9', propUpper: '10', propLower: '11', midBody: '12', shoulder: '13', ball: '14', bushing: '15', lowerBody: '16', topNut: '17', spindle: '18', valves: '19', valveWashers: '20', thrust: ['21', '21'], housing: '22', cushion: '23', ballBearing: '24', bottomNut: '25', cap: '26', safetyPin: '27', threadProtector: '28',
}, { ug: true, secondSet: true });
const DO_NU = { retCase: '1', bolt: '2', wedgeWasher: '3', caseSpring: '4', assemblyRod: '5', latchSpring: '6', latches: '7', latchBody: '8', propUpper: '9', propLower: '10', midBody: '11', shoulder: '12', ball: '13', bushing: '14', lowerBody: '15', topNut: '16', spindle: '17', valves: '18', valveWashers: '19', thrust: '20', housing: '21', hanger: '22', cushion: '23', bearingWasher: '24', ballBearing: '25', bottomNut: '26', cap: '27' };
// Deux jeux boulon / rondelle / tige d'assemblage (repères 2, 3, 5 en quantité 2).
export const P074 = H('N', 'discovore', DO_NU, { ug: true, secondSet: true });
export const P083 = H('H', 'discovore', { ...DO_NU, thrust: ['20', '20'] }, { ug: true, secondSet: true });
export const P092 = H('P', 'discovore', {
  retCase: '1', bolt: '2', wedgeWasher: '3', caseSpring: '4', assemblyRod: '5', latchSpring: '6', latches: '7', latchBody: '8', midSleeve: '9', propUpper: '10', propLower: '11', midBody: '12', shoulder: '13', ball: ['14', '14'], bushing: '15', lowerBody: '16', topNut: '17', spindle: '18', taperWashers: '19', valves: '20', valveWashers: '21', thrust: ['22', '22'], housing: '23', hanger: '24', cushion: '25', cap: '26', bearingWasher: '27', ballBearing: '28', bottomNut: '29', capGrease: '30', capValve: '31', checkBody: '32', safetyPin: '33', tagHolder: '34', tag: '35', tag2: '36',
}, { ug: true, bigBall: true, stack: ['valveWashers', 'taperWashers', 'valves', 'taperWashers', 'valves'] });

// Excore de surface : 1 lance … 29/30 chapeau, 30/31 graisseur.
export const P010 = H('B', 'excore', {
  spearhead: '1', spearPin: '2', detentSpring: '3', detent: '4', spearBase: '5', retCase: '6', casePin: '7', casePins: '8', hhcs: '9', guide: '10', pistonSpring: '11', piston: '12', upperBody: '13', latches: '14', latchPins: '15', bushing: '16', shoulder: '17', ball: '18', lowerBody: '19', topNut: '20', spindle: '21', valves: '22', valveWashers: '23', thrust: ['26', '24'], housing: '25', cushion: '27', bottomNut: '28', cap: '29', capGrease: '30',
});
const EX_N = { spearhead: '1', spearPin: '2', detentSpring: '3', detent: '4', spearBase: '5', retCase: '6', casePin: '7', casePins: '8', spearPin2: '9', hhcs: '10', guide: '11', pistonSpring: '12', piston: '13', upperBody: '14', latches: '15', latchPins: '16', bushing: '17', shoulder: '18', ball: '19', lowerBody: '20', topNut: '21', spindle: '22', valves: '23', valveWashers: '24', thrust: '25', housing: '26', hanger: '27', cushion: '28', bottomNut: '29', cap: '30', capGrease: '31' };
export const P022 = H('N', 'excore', EX_N, { casePins: 1 });
export const P039 = H('H', 'excore', { ...EX_N, hanger: undefined, thrust: ['27', '25'] }, { casePins: 1 });
// Excore souterrain : joints de pompage sur le raccord du corps de verrou.
export const P068 = H('B', 'excore', {
  spearhead: '1', spearPin: '2', detentSpring: '3', detent: '4', spearBase: '5', retCase: '6', casePin: '7', casePins: '8', hhcs: '9', guide: '10', pistonSpring: '11', piston: '12', upperBody: '13', latches: '14', latchPins: '15', lipSeals: '16', coupler: '17', bushing: '18', shoulder: '19', ball: '20', lowerBody: '21', topNut: '22', spindle: '23', valves: '24', valveWashers: '25', thrust: ['26', '26'], housing: '27', cushion: '28', bottomNut: '29', cap: '30', capGrease: '31',
}, { ug: true });
export const P077 = H('N', 'excore', {
  spearhead: '1', spearPin: '2', detentSpring: '3', detent: '4', spearBase: '5', retCase: '6', casePin: '7', casePins: '8', hhcs: '9', guide: '10', pistonSpring: '11', piston: '12', upperBody: '13', latches: '14', latchPins: '15', lipSeals: '16', coupler: '17', bushing: '18', shoulder: '19', ball: '20', lowerBody: '21', topNut: '22', spindle: '23', valves: '24', valveWashers: '25', thrust: '26', housing: '27', hanger: '28', cushion: '29', bottomNut: '30', cap: '31', capGrease: '32',
}, { ug: true, casePins: 1 });
export const P086 = H('H', 'excore', {
  spearhead: '1', spearPin: '2', detentSpring: '3', detent: '4', spearBase: '5', retCase: '6', casePin: '7', casePins: '8', hhcs: '9', guide: '10', pistonSpring: '11', piston: '12', upperBody: '13', latches: '14', latchPins: '15', lipSeals: '16', coupler: '17', bushing: '18', shoulder: '19', ball: '20', lowerBody: '21', topNut: '22', spindle: '23', valves: '24', valveWashers: '25', thrust: ['26', '26'], housing: '27', hanger: '28', cushion: '29', bottomNut: '30', cap: '31', capGrease: '32',
}, { ug: true, casePins: 1 });

// OWL L-Latch.
const LL_B = { spearhead: '1', detentSpring: '2', detent: '3', spearPin: '4', spearBase: '5', retCase: '6', casePins: '7', hexBolt: '8', latchWasher: '9', latchSpring: '10', links: '11', latches: '12', upperBody: '13', latchPins: '14', shoulder: '15', bushing: '16', ball: '17', lowerBody: '18', topNut: '19', spindle: '20', valves: '21', valveWashers: '22', thrust: '23', housing: '24', cushion: '25', bottomNut: '26', cap: '27', capGrease: '28', capBall: '29', checkBody: '30' };
const LL_N = { ...LL_B, hanger: '25', cushion: '26', bottomNut: '27', cap: '28', capGrease: '29', capBall: '30', checkBody: '31' };
export const P013 = H('B', 'lLatch', LL_B);
export const P025 = H('N', 'lLatch', LL_N);
export const P042 = H('H', 'lLatch', LL_N);
export const P053 = H('P', 'lLatch', {
  spearhead: '1', detentSpring: '2', detent: '3', spearPin: '4', spearBase: '5', casePins: '6', retCase: '7', casePin: '8', hexBolt: '9', latchWasher: '10', latchSpring: '11', links: '12', latches: '13', latchPins: '14', upperBody: '15', pistonValve: '16', shoulder: '17', bushing: '18', indicatorSpring: '19', lowerBody: '20', nordLock: '21', topNut: '22', spindle: '23', valveWashers: '24', valves: '25', taperWashers: '26', thrust: ['27', '27'], housing: '28', capGrease: '29', cushion: '30', narrowWasher: '31', bottomNut: '32', capValve: '33', capBall: '34', checkBody: '35', capPin: '36', cap: '37',
}, { thrustAbove: true, stack: ['valveWashers', 'valves', 'taperWashers', 'valveWashers', 'valves'] });
const LL_UG = { spearhead: '1', detentSpring: '2', detent: '3', spearPin: '4', spearBase: '5', casePins: '6', retCase: '7', hexBolt: '8', casePin: '9', latchWasher: '10', latchSpring: '11', latchPins: '12', links: '13', latches: '14', upperBody: '15', pistonValve: '16', indBushing: '17', adaptor: '18', lipSeals: '19', sealSeat: '20', shoulder: '21', lowerBody: '22', topNut: '23', spindle: '24', valves: '25', valveWashers: '26', thrust: ['27', '27'], housing: '28', cushion: '29', bottomNut: '30', cap: '31', capGrease: '32', capBall: '33', checkBody: '34' };
export const P072 = H('B', 'lLatch', LL_UG, { ug: true });
// P081 : roulement de suspension 27 deux fois, au-dessus et au-dessous du boîtier 28.
export const P081 = H('N', 'lLatch', { ...LL_UG, thrust: '27', hanger: '27' }, { ug: true });
export const P090 = H('H', 'lLatch', { ...LL_UG, hanger: '29', cushion: '30', bottomNut: '31', cap: '32', capGrease: '33', capBall: '34', checkBody: '35' }, { ug: true });

// OWL standard.
const OW_B = { spearhead: '1', detentSpring: '2', detent: '3', spearPin: '4', spearBase: '5', casePins: '6', retCase: '7', torsionSpring: '8', latches: '9', latchPins: '10', upperBody: '11', shoulder: '12', bushing: '13', ball: '14', lowerBody: '15', topNut: '16', spindle: '17', valves: '18', valveWashers: '19', thrust: ['20', '20'], housing: '21', cushion: '22', bottomNut: '23', cap: '24', capGrease: '25', capBall: '26', checkBody: '27' };
const OW_N = { ...OW_B, thrust: '20', housing: '21', hanger: '22', cushion: '23', bottomNut: '24', cap: '25', capGrease: '26', capBall: '27', checkBody: '28' };
export const P015 = H('B', 'owl', OW_B);
export const P027 = H('N', 'owl', OW_N);
export const P029 = H('N', 'owl', { ...OW_N, spearBase: '4', spearPin: '5', retCase: '6', casePins: '7' });
export const P044 = H('H', 'owl', { ...OW_N, thrust: ['20', '20'] });
export const P046 = H('H', 'owl', { ...OW_N, thrust: ['20', '20'] });


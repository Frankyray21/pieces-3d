import { SIDE, layout, prof } from './common.js';

// Outils et accessoires du catalogue : raccords de verrouillage (surface et
// souterrain), trousse d'overshot à rouleaux, avance-tubage (casing advancer),
// coupe-tubage, outils de chargement DiscovOre et extracteur de bague
// indicatrice, carottier conventionnel 48TT et sa tête.
//
// Repère : axe X, haut du trou vers +X (les raccords sont présentés debout,
// côte à côte, comme sur la photo du catalogue). Cotes en millimètres,
// converties en mètres à la construction.

const PI = Math.PI;
const TAU = 2 * PI;
const UP = 3 * PI / 2; // paroi tournée vers +Y (voir shapes.slotted, axe X)
const DOWN = PI / 2;
const MM = 0.001;

// Normale de paroi à l'angle a (convention de shapes.slotted, axe X) et tangente.
const nrm = (a) => [0, -Math.sin(a), Math.cos(a)];
const tan = (a) => [0, Math.cos(a), Math.sin(a)];
const frac = (t) => t - Math.floor(t);

/** Outils de modélisation en millimètres ; D : unité (m) de la vue éclatée. */
function kit(api, D, lo) {
  const S = api.S;
  const { THREE } = api;
  const L = layout(api, D, lo);
  const X = (x, y = 0, z = 0) => [x * MM, y * MM, z * MM];
  const lat = (pts, mat, seg = 40) => S.lathe(prof(MM, pts), mat, { axis: 'x', seg });
  const th = (r, a, b, pitch = 3, o = {}) => S.thread(r, a, b, { pitch, maxTurns: 9, ...o });
  const win = (a, w, x0, x1) => ({ a, w, y0: x0 * MM, y1: x1 * MM });
  const hole = (a, x, r, wall, through = true) => S.roundHole(a, x * MM, r * MM, wall * MM, { through });
  const tube = (rO, rI, x0, x1, wins, mat, seg = 48) => S.slotted(rO * MM, rI * MM, x0 * MM, x1 * MM, wins || [], mat, { axis: 'x', seg });
  const pinZ = (r, len, x, y = 0, mat = 'steel') => S.cyl(r * MM, len * MM, mat, { axis: 'z', pos: X(x, y) });
  // Trous d'une goupille parallèle à Z décalée de yo du centre (paroi de rayon wall).
  const pinHoles = (x, yo, r, wall) => {
    const t = Math.asin(Math.max(-0.95, Math.min(0.95, -yo / wall)));
    return [...hole(t, x, r, wall, false), ...hole(PI - t, x, r, wall, false)];
  };
  // Objet construit selon Y, orienté selon dir, placé en p (mm).
  const along = (obj, dir, p) => {
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir).normalize());
    obj.position.set(...X(...p));
    return obj;
  };
  // Plaque (cliquet, lame) dans le plan XY, épaisseur t selon Z ; trous ronds [x, y, r] ou polygones.
  const plate = (pts, t, mat, holes = []) => {
    const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x * MM, y * MM)));
    for (const h of holes) {
      const p = new THREE.Path();
      if (typeof h[0] === 'number') p.absarc(h[0] * MM, h[1] * MM, h[2] * MM, 0, TAU, true);
      else p.setFromPoints(h.map(([x, y]) => new THREE.Vector2(x * MM, y * MM)));
      shape.holes.push(p);
    }
    const geo = new THREE.ExtrudeGeometry(shape, { depth: t * MM, bevelEnabled: false, curveSegments: 12 });
    geo.translate(0, 0, (-t * MM) / 2);
    return S.merged([new THREE.Mesh(geo)], mat);
  };
  // Trou débouchant suggéré (selon Z) : pastilles sombres sur les deux faces d'un corps de rayon R.
  const port = (r, x, R, y = 0) => S.group(
    S.cyl(r * MM, 1 * MM, 'black', { axis: 'z', seg: 16, pos: X(x, y, R - 0.35) }),
    S.cyl(r * MM, 1 * MM, 'black', { axis: 'z', seg: 16, pos: X(x, y, -(R - 0.35)) }),
  );
  // Vis CHC (tête cylindrique à six-pans creux) de diamètre d, tête en p, tige vers -dir.
  const capScrew = (d, len, p, dir, mat = 'steel') => along(S.group(
    S.lathe(prof(MM, [[0, -len], [d * 0.42, -len], [d * 0.5, -len + d * 0.1], [d * 0.5, 0], [d * 0.75, 0], [d * 0.75, d * 0.9], [d * 0.68, d], [0, d]]), mat, { seg: 20 }),
    S.cyl(d * 0.3 * MM, d * 0.12 * MM, 'black', { seg: 6, pos: X(0, d, 0) }),
  ), dir, p);
  return { S, L, X, lat, th, win, hole, tube, pinZ, pinHoles, along, plate, port, capScrew };
}

/**
 * Surface de révolution déformée autour de X (molette, cannelures, six-pans) :
 * rayon r + f(a, x) (mm), nA pas angulaires, nX pas axiaux.
 */
function band(api, r, x0, x1, nA, nX, f, mat) {
  const { THREE, S } = api;
  const pos = [], idx = [];
  for (let j = 0; j <= nX; j++) {
    const x = x0 + ((x1 - x0) * j) / nX;
    for (let i = 0; i <= nA; i++) {
      const a = (i / nA) * TAU;
      const rr = (r + f(a, x)) * MM;
      pos.push(x * MM, -rr * Math.sin(a), rr * Math.cos(a));
    }
  }
  for (let j = 0; j < nX; j++) {
    for (let i = 0; i < nA; i++) {
      const p = j * (nA + 1) + i, q = p + nA + 1;
      idx.push(p, p + 1, q, p + 1, q + 1, q);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const m = S.merged([new THREE.Mesh(geo)], mat);
  m.geometry.userData.edgeAngle = 75; // pas de contours sur le motif
  return m;
}

// ---------------------------------------------------------------- raccords de verrouillage
// Raccord de verrouillage (taille N) : tube court, filet mâle en haut ; bande
// de carbure moletée à cannelures hélicoïdales, bande diamantée, plots soudés
// ou corps six-pans « full hole » (alésage agrandi) ; ergot (tang) optionnel
// dressé sur l'épaulement, le long du filet. Construit selon X, bas à x = 0.

const CR = 36.5, CB = 30, CS = 235, CT = 280; // rayon, alésage, épaulement, haut du filet

function coupling(api, K, style, tang) {
  const { S, lat, th, X } = K;
  const dark = style === 'welded' || style === 'hex';
  const bore = style === 'hex' ? CB + 2 : CB;
  const g = S.group();
  const env = (x, x0, x1) => Math.max(0, Math.min(1, (x - x0) / 1.5, (x1 - x) / 1.5));
  if (style === 'hex') {
    // Six-pans aux arêtes arrondies par le rond d'origine ; raccords coniques aux bouts.
    g.add(lat([[bore, 0], [CR - 1.5, 0], [CR, 1.5], [CR, 46], [33.4, 56], [33.4, 194], [CR, 204], [CR, CS - 1], [CR - 1, CS], [bore, CS]], 'black'));
    const hexR = (a) => {
      const t = frac(a / (PI / 3)) * (PI / 3) - PI / 6;
      return Math.min(CR, 33.6 / Math.cos(t));
    };
    g.add(band(api, 0, 46, 204, 72, 1, hexR, 'black'));
  } else {
    g.add(lat([[bore, 0], [CR - 1.5, 0], [CR, 1.5], [CR, CS - 1], [CR - 1, CS], [bore, CS]], dark ? 'black' : 'lightGrey'));
  }
  // Filet mâle.
  g.add(lat([[bore, CS], [34, CS], ...th(34, CS, CT - 2.5, 4.2, { chamferBottom: false }), [32.5, CT], [bore, CT]], dark ? 'darkSteel' : 'steel'));
  if (style === 'carbide') {
    // Bande de carbure : molette en pointes de diamant, quatre cannelures hélicoïdales.
    const x0 = 120, x1 = 186;
    g.add(band(api, CR, x0, x1, 96, 28, (a, x) => {
      const u = (a / TAU) * 24, v = (x - x0) / 9.55;
      const c = (t) => 1 - 2 * Math.abs(frac(t) - 0.5);
      const flute = frac((a / TAU) * 4 + (x - x0) / 110) < 0.1;
      return env(x, x0, x1) * (flute ? 0.1 : 0.45 + 0.9 * Math.min(c(u + v), c(u - v)));
    }, 'steel'));
  } else if (style === 'diamond') {
    // Bande diamantée : segments séparés par des rainures obliques.
    const x0 = 120, x1 = 186;
    g.add(band(api, CR, x0, x1, 160, 12, (a, x) => env(x, x0, x1) * (frac((a / TAU) * 8 + (x - x0) / 90) < 0.07 ? 0.1 : 0.9), 'grey'));
  } else if (style === 'welded') {
    // Plots soudés oblongs : trois rangées de six.
    const pts = [];
    for (let k = 0; k <= 8; k++) { const t = -PI / 2 + (k * PI) / 8; pts.push([(11 + 6.5 * Math.cos(t)) * MM, 6.5 * Math.sin(t) * MM]); }
    for (let k = 0; k <= 8; k++) { const t = PI / 2 + (k * PI) / 8; pts.push([(-11 + 6.5 * Math.cos(t)) * MM, 6.5 * Math.sin(t) * MM]); }
    const pads = [];
    for (const x of [44, 106, 168]) {
      for (let k = 0; k < 6; k++) {
        const a = PI / 6 + (k * PI) / 3;
        const n = nrm(a);
        const p = S.extrude(pts, 2.2 * MM, 'steel', { bevel: 0.6 * MM });
        p.rotation.x = a;
        p.position.set(...X(x, (CR + 0.3) * n[1], (CR + 0.3) * n[2]));
        pads.push(p);
      }
    }
    g.add(S.merged(pads, 'steel'));
  } else if (style === 'hex') {
    // Rainures longitudinales du filet (passage « full hole »).
    for (let k = 0; k < 3; k++) {
      const a = 0.35 + (k * TAU) / 3, n = nrm(a);
      g.add(S.box(40 * MM, 2.4 * MM, 3 * MM, 'black', { pos: X(CS + 22, 33.4 * n[1], 33.4 * n[2]), rot: [a, 0, 0] }));
    }
  }
  if (tang) {
    // Ergot : languette dressée sur l'épaulement, à gauche (côté +Y local), un peu en avant.
    const a = UP + 0.35, n = nrm(a);
    g.add(S.box(57 * MM, 10 * MM, 2.5 * MM, dark ? 'darkSteel' : 'steel', { pos: X(CS + 28, 35.2 * n[1], 35.2 * n[2]), rot: [a, 0, 0] }));
  }
  return g;
}

function couplings(api, list) {
  const K = kit(api, 0.073, { gap: 2.6 });
  list.forEach(([ref, style, tang], i) => {
    const g = coupling(api, K, style, tang);
    g.rotation.z = PI / 2; // debout, filet en haut, comme sur la photo
    g.position.x = (i - (list.length - 1) / 2) * 0.17;
    K.L.add(ref, g, { row: 'A' });
  });
  K.L.done();
  return { view: SIDE };
}

export const P054 = (api) => couplings(api, [
  ['1', 'carbide', false], ['2', 'carbide', true], ['3', 'diamond', true], ['4', 'welded', false],
  ['5', 'welded', true], ['6', 'hex', false], ['7', 'hex', true],
]);
export const P096 = (api) => couplings(api, [['1', 'carbide', false], ['2', 'diamond', false], ['3', 'welded', false], ['4', 'hex', false]]);

// ---------------------------------------------------------------- overshot à rouleaux (P055)
// Trousse de conversion d'un overshot Excore II en overshot à rouleaux (taille
// N) : émerillon de câble, corps supérieur à trois rouleaux d'acier (axes =
// goupilles élastiques) et graisseur, tube et tige de coulisse, écrou, corps
// inférieur à rouleaux vissé sur la tête de l'overshot. Les rouleaux, à 120°,
// dépassent du corps pour centrer l'outil dans la tige. Repère : bas du corps
// inférieur à x = 0.

export function P055(api) {
  const K = kit(api, 0.05, { gap: 0.6, rows: { A: 0, B: -3.6, C: 3.6 } });
  const { S, X, lat, th, win, hole, tube, along, port } = K;
  // Vue éclatée en trois rangées, comme les trois colonnes du catalogue :
  // émerillon et corps supérieur (C), coulisse (A), écrou et corps inférieur
  // (B), ramenées au-dessus les unes des autres (décalages en D).
  const SH = { C: -20.4, B: 15.8 };
  const rowOf = { 2: 'C', 9: 'B' };
  const L = {
    add: (ref, obj, o = {}) => {
      const e = o.extra || [0, 0, 0];
      return K.L.add(ref, obj, { ...o, extra: [e[0] + (SH[o.row ?? rowOf[o.follow]] || 0), e[1], e[2]] });
    },
    done: () => K.L.done(),
  };
  const R = 25, RB = 12; // corps (overshot N) et alésage
  const AS = [UP, UP + (2 * PI) / 3, UP + (4 * PI) / 3]; // rouleaux à 120°
  const E = 8.5; // excentration de l'axe des rouleaux
  const PA = Math.atan2(Math.sqrt(R * R - E * E), E); // sortie de l'axe dans la paroi
  const rollerWins = (xs) => xs.flatMap((x, k) => [win(AS[k], 0.62, x - 25, x + 25), ...hole(AS[k] + PA, x, 6.6, R, false), ...hole(AS[k] - PA, x, 6.6, R, false)]);
  const rollers = (xs, host) => xs.forEach((x, k) => {
    const a = AS[k], n = nrm(a), t = tan(a);
    const c = [x, E * n[1], E * n[2]];
    const wheel = S.lathe(prof(MM, [[6.6, -6], [20.5, -6], [22, -4.5], [22, 4.5], [20.5, 6], [6.6, 6]]), 'steel', { seg: 32 });
    L.add('5', along(wheel, t, c), { follow: host, extra: [0, n[1] * 1.7, n[2] * 1.7] });
    const pin = S.cyl(6.35 * MM, 44 * MM, 'darkSteel', { seg: 16 });
    L.add('4', along(pin, t, c), { follow: host, extra: [0, n[1] * 1.7 + t[1] * 1.6, n[2] * 1.7 + t[2] * 1.6] });
  });

  // Corps inférieur : tige filetée (tête de l'overshot) en bas, taraudage de la tige de coulisse en haut.
  const x9 = [130, 230, 330];
  L.add('9', S.group(
    lat([[0, 0], [13.5, 0], [15, 1.5], ...th(15, 1.5, 38, 3.2, { chamferBottom: false }), [15, 40], [23, 40], [R, 42], [R, 60], [0, 60]], 'black'),
    tube(R, RB, 60, 400, rollerWins(x9), 'black'),
    lat([[9.5, 400], [R, 400], [R, 428], [R - 1.5, 430], [9.5, 430]], 'black'),
  ), { row: 'B' });
  rollers(x9, '9');
  L.add('8', S.nut(28.6 * MM, 16.7 * MM, 'steel', { axis: 'x', pos: X(439) }), { row: 'B' });
  // Tige de coulisse : filet en bas, tête retenue par la lèvre du tube (outil suspendu, coulisse ouverte).
  L.add('7', lat([[0, 405], [8, 405], [9.5, 406.5], ...th(9.5, 406.5, 468, 2.6, { chamferBottom: false }), [9.5, 470], [9, 472], [9, 998], [14, 1002], [14, 1022], [12.5, 1025], [0, 1025]], 'steel'), { row: 'A' });
  // Tube de coulisse : lèvre en bas, taraudage du corps supérieur en haut.
  L.add('6', S.group(
    lat([[10, 980], [R - 1.5, 980], [R, 981.5], [R, 1620], [21, 1620], [20.5, 1617], [20.5, 1590], [15.5, 1588], [15.5, 1000], [10, 1000]], 'charcoal'),
    port(3, 1060, R), port(3, 1545, R), port(3.5, 1572, R),
  ), { row: 'A' });
  // Corps supérieur : filet mâle dans le tube de coulisse, alésage de l'émerillon en haut.
  const x2 = [1780, 1935, 2090];
  L.add('2', S.group(
    lat([[0, 1588], [18.5, 1588], [20, 1589.5], ...th(20, 1589.5, 1618, 3.2, { chamferBottom: false }), [20, 1620], [23.5, 1620], [R, 1621.5], [R, 1650], [0, 1650]], 'charcoal'),
    tube(R, RB, 1650, 2210, rollerWins(x2), 'charcoal'),
    lat([[16, 2210], [R, 2210], [R, 2268], [R - 1.5, 2270], [16, 2270]], 'charcoal'),
  ), { row: 'C' });
  rollers(x2, '2');
  L.add('3', S.at(S.fitting(8 * MM, 18 * MM, 'brass'), X(2180, R + 3)), { follow: '2', extra: [0, 1.4, 0] });

  // Émerillon de câble Excore II : collet vissé, écrous et butée à billes, boulon à œil, manchons de sertissage.
  const c0 = 2240;
  L.add('1', lat([[9, c0], [14, c0], [15.5, c0 + 1.5], ...th(15.5, c0 + 1.5, c0 + 29, 3, { chamferBottom: false }), [15.5, c0 + 30], [21.5, c0 + 30], [23, c0 + 31.5], [23, c0 + 98], [21, c0 + 100], [9, c0 + 100], [9, c0 + 70], [19, c0 + 66], [19, c0 + 12], [9, c0 + 8]], 'darkSteel'), { row: 'C' });
  for (const k of [0, 1]) L.add('1', S.nut(24 * MM, 8 * MM, 'steel', { axis: 'x', pos: X(c0 + 40 + k * 8.5) }), { row: 'C', gap: 0.3 });
  L.add('1', S.bearing(18 * MM, 8.2 * MM, 9 * MM, 'steel', { thrust: true, axis: 'x', pos: X(c0 + 59) }), { row: 'C', gap: 0.3 });
  L.add('1', S.group(
    lat([[0, c0 + 28], [7, c0 + 28], [8, c0 + 29], ...th(8, c0 + 29, c0 + 54, 2.5, { chamferBottom: false }), [8, c0 + 141], [0, c0 + 141]], 'steel'),
    S.torus(14 * MM, 5 * MM, 'steel', { axis: 'z', pos: X(c0 + 158) }),
  ), { row: 'C' });
  for (const k of [0, 1]) L.add('1', lat([[3.5, c0 + 195 + k * 30], [7, c0 + 195 + k * 30], [7, c0 + 215 + k * 30], [3.5, c0 + 215 + k * 30]], 'steel', 24), { row: 'C' });
  L.done();
  return { view: SIDE };
}

// ---------------------------------------------------------------- avance-tubage (P060)
// Avance-tubage (casing advancer) HW : la tête de verrouillage (taille N,
// comme une tête Excore : lance, boîtier de rappel, piston, corps de verrou et
// cliquets) coiffe le corps d'entraînement, dont les lames pivotantes
// s'engagent dans les rainures du raccord d'entraînement vissé sous le tubage
// ; ressort, cales, adaptateur et tricône forent devant le sabot. Le raccord,
// le sabot et l'entonnoir de chargement forment l'enveloppe extérieure.
// Repère : bas du tricône à x = 0.

export function P060(api) {
  const K = kit(api, 0.06, { gap: 0.4, rows: { A: 0, B: -2.4, C: 3.3 } });
  const { S, L, X, lat, th, win, hole, tube, pinZ, pinHoles, plate, port } = K;
  const { THREE } = api;

  // Tricône (Ø 98,4) : corps jaune à trois bras, molettes dentées, queue filetée API.
  {
    const g = S.group(
      lat([[0, 86], [37, 86], [37, 92], [30, 95], ...th(29, 95, 146, 5, { r1: 23, chamferBottom: false }), [21, 150], [0, 150]], 'darkSteel'),
      lat([[0, 40], [30, 38], [44, 46], [49.2, 58], [49.2, 78], [42, 86], [0, 86]], 'yellow'),
    );
    for (let k = 0; k < 3; k++) {
      const f = PI / 6 + (k * TAU) / 3, n = nrm(f);
      g.add(S.box(44 * MM, 24 * MM, 12 * MM, 'yellow', { pos: X(52, 41 * n[1], 41 * n[2]), rot: [f, 0, 0] }));
      const b = 0.62; // inclinaison de l'axe de la molette
      const v = [-Math.sin(b), -Math.cos(b) * n[1], -Math.cos(b) * n[2]];
      const cone = S.group(
        S.cyl(21 * MM, 34 * MM, 'yellow', { r2: 5 * MM, seg: 24 }),
        S.gear(19 * MM, 24 * MM, 13, 6 * MM, 'yellow', { axis: 'y', pos: X(0, -11) }),
        S.gear(13 * MM, 17.5 * MM, 10, 6 * MM, 'yellow', { axis: 'y', pos: X(0, 0) }),
        S.gear(8 * MM, 11.5 * MM, 7, 5 * MM, 'yellow', { axis: 'y', pos: X(0, 10) }),
      );
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...v));
      const c = [38 + v[0] * 17, 36 * n[1] + v[1] * 17, 36 * n[2] + v[2] * 17];
      cone.position.set(...X(...c));
      g.add(cone);
    }
    L.add('23', g, { row: 'A' });
  }
  // Adaptateur de tricône : boîte conique en bas, trou de clé, col dans le corps d'entraînement.
  L.add('19', S.group(
    lat([[31, 90], [42, 90], [45, 93], [45, 150], [36, 160], [36, 215], [33, 218], [28, 218], [28, 252], [26, 255], [10, 255], [10, 152], [24, 152]], 'charcoal'),
    port(7, 190, 36),
  ), { row: 'A' });
  L.add('18', S.washer(32 * MM, 15 * MM, 4 * MM, 'steel', { axis: 'x', pos: X(257) }), { row: 'B' });
  L.add('17', S.spring(29.5 * MM, 3.2 * MM, 16 * MM, 4, 'steel', { axis: 'x', pos: X(267) }), { row: 'B' });

  // Corps d'entraînement : poches des lames (haut et bas), goupilles d'axe et d'arrêt.
  L.add('16', S.group(
    lat([[35, 222], [40, 222], [49, 238], [49, 280], [12, 280], [12, 275], [35, 275]], 'black'),
    tube(49, 12, 280, 400, [win(UP, 0.34, 284, 398), win(DOWN, 0.34, 284, 398), ...pinHoles(384, 32, 4.9, 49), ...pinHoles(384, -32, 4.9, 49), ...pinHoles(302, 36, 4.9, 49), ...pinHoles(302, -36, 4.9, 49)], 'black', 56),
    lat([[22, 400], [49, 400], [49, 410], [32, 432], [32, 440], [22, 440]], 'black'),
  ), { row: 'A' });
  for (const s of [1, -1]) {
    const pts = [[288, 24], [392, 24], [396, 28], [396, 40], [380, 46], [334, 46], [326, 52.5], [296, 52.5], [288, 46]].map(([x, y]) => [x, s * y]);
    L.add('14', plate(s > 0 ? pts : pts.reverse(), 14, 'darkSteel', [[384, s * 32, 4.9], [302, s * 36, 4.9]]), { follow: '16', extra: [0, s * 1.1, 0] });
    L.add('13', pinZ(4.75, 72, 384, s * 32), { follow: '16', extra: [0, s * 0.5, 1.7] });
    L.add('15', pinZ(4.75, 62, 302, s * 36), { follow: '16', extra: [0, s * 0.5, 1.7] });
  }

  // Corps de verrou supérieur : col fileté et collerette, fenêtres des cliquets, tube à lumière.
  L.add('10', S.group(
    lat([[10, 402], [19, 402], [21, 404], ...th(21, 404, 438, 3, { chamferBottom: false }), [21, 440], [30, 440], [30, 452], [10, 452]], 'charcoal'),
    tube(24, 13, 452, 556, [win(UP, 0.6, 466, 554), win(DOWN, 0.6, 466, 554), ...pinHoles(478, 9, 4.9, 24), ...pinHoles(478, -9, 4.9, 24)], 'charcoal'),
    tube(17, 11, 556, 702, [win(0, 0.6, 562, 668), win(PI, 0.6, 562, 668)], 'charcoal'),
  ), { row: 'A' });
  for (const s of [1, -1]) {
    const pts = [[468, 3], [490, 3], [538, 20], [552, 30], [566, 44], [560, 49], [548, 42], [532, 30], [484, 16], [468, 14]].map(([x, y]) => [x, s * y]);
    L.add('11', plate(s > 0 ? pts : pts.reverse(), 12, 'darkSteel', [[478, s * 9, 4.9]]), { follow: '10', extra: [0, s * 1.2, 0] });
    L.add('12', pinZ(4.75, 44, 478, s * 9), { follow: '10', extra: [0, s * 0.4, 1.6] });
  }
  // Piston de verrou, ressort, rondelle d'appui et vis (dans le boîtier de rappel).
  L.add('9', S.group(lat([[6, 705], [21, 705], [22, 707], [22, 733], [20.5, 735], [6, 735]], 'darkSteel'), port(3.5, 720, 22)), { row: 'B' });
  L.add('8', S.spring(15 * MM, 2.4 * MM, 40 * MM, 6, 'steel', { axis: 'x', pos: X(755) }), { row: 'B' });
  L.add('7', S.washer(20 * MM, 5.5 * MM, 3 * MM, 'steel', { axis: 'x', pos: X(776.5) }), { row: 'B' });
  L.add('6', S.bolt(9.5 * MM, 70 * MM, 'steel', { axis: 'x', pos: X(778) }), { row: 'B' });
  // Boîtier de rappel : encoches en haut, fenêtres des cliquets en bas, trous des goupilles.
  L.add('2', tube(28.5, 24.5, 545, 830, [
    win(UP, 0.56, 545, 592), win(DOWN, 0.56, 545, 592), win(0, 0.5, 812, 830), win(PI, 0.5, 812, 830),
    ...hole(0, 800, 6.5, 28.5), ...hole(0, 650, 4.9, 28.5), ...hole(0, 572, 3.3, 28.5),
  ], 'black', 56), { row: 'A' });
  L.add('3', pinZ(6.35, 60, 800), { follow: '2', extra: [0, 0.3, 1.7] });
  L.add('4', pinZ(4.75, 60, 650), { follow: '2', extra: [0, 0.3, 1.7] });
  L.add('5', pinZ(3.2, 60, 572), { follow: '2', extra: [0, 0.3, 1.7] });
  // Lance (avance-tubage standard / Excore).
  L.add('1A', lat([[0, 785], [24, 785], [24, 838], [20, 842], [9, 852], [9, 892], [7, 894], [7, 897], [16, 899], [16, 902], [0, 936]], 'black'), { row: 'A' });
  // Adaptateur DiscovOre (remplace la lance) : posé à côté de la tête.
  L.add('1B', S.group(
    lat([[19, 815], [26, 815], [26, 880], [23.5, 883], [23.5, 890], [26, 893], [26, 915], [19, 915]], 'black'),
    port(5, 840, 26, 0),
  ).translateY(140 * MM), { row: 'C' });

  // Enveloppe : sabot à dents, raccord d'entraînement (rainures internes), entonnoir de chargement.
  L.add('22', S.group(
    lat([[50.8, 80], [60.5, 80], [60.5, 178], [59, 180], [55.6, 180], [55.6, 140], [50.8, 138]], 'black', 56),
    tube(60.5, 51, 68, 80, Array.from({ length: 18 }, (_, k) => win((k * TAU) / 18, 0.17, 68, 74)), 'darkSteel', 72),
  ), { row: 'C' });
  L.add('20', S.group(
    lat([[50.8, 140], [53.5, 140], [55, 141.5], ...th(55, 141.5, 178, 4, { chamferBottom: false }), [55, 180], [57.15, 182], [57.15, 718], [55.5, 720], ...th(54, 720, 757, 4, { chamferBottom: false }), [52.5, 760], [50.8, 760], [50.8, 575], [53, 573], [53, 282], [50.8, 280]], 'black', 56),
    tube(53, 50.8, 282, 535, [win(UP, 0.34, 285, 402), win(DOWN, 0.34, 285, 402)], 'black', 56),
  ), { row: 'C' });
  L.add('21', lat([[54.5, 720], [57.5, 720], [58.5, 722], [58.5, 830], [61, 836], [61, 958], [59.5, 960], [58, 960], [51, 850], [51, 760], [54.5, 758]], 'black', 56), { row: 'C' });
  L.done();
  return { view: SIDE };
}

// ---------------------------------------------------------------- coupe-tubage (P061)
// Coupe-tubage et coupe-tiges NW (trois lames) : tube pilote en haut, boîtier
// à trois fenêtres où pivotent les lames sur des vis CHC, logement du piston
// vissé en bas. La pression d'eau pousse le piston dont la pointe ouvre les
// lames ; la bille et la tige de libération rétablissent la circulation.
// Repère : bas du logement de piston à x = 0.

export function P061(api) {
  const K = kit(api, 0.074, { gap: 0.4, rows: { A: 0, B: -2.2, C: 2.2 } });
  const { S, L, X, lat, th, win, hole, tube, pinZ, plate, port, capScrew } = K;
  const AS = [UP + 0.5, UP + 0.5 + TAU / 3, UP + 0.5 + (2 * TAU) / 3]; // lames à 120°
  const SP = Math.sqrt(37 * 37 - 26 * 26); // sortie de la vis d'axe dans la paroi

  L.add('11', lat([[24, 0], [33.5, 0], [35, 1.5], [35, 250], [32, 250], ...th(32, 250, 286, 4, { chamferBottom: false }), [30.5, 290], [24, 290]], 'black'), { row: 'A' });
  const wins = AS.flatMap((a) => {
    const t = Math.atan2(SP, 26);
    return [win(a, 0.4, 336, 452), ...hole(a + t, 436, 5, 37, false), ...hole(a - t, 436, 5, 37, false)];
  });
  L.add('10', S.group(
    lat([[32.2, 250], [35.5, 250], [37, 251.5], [37, 300], [24, 300], [24, 292], [32.2, 292]], 'black'),
    tube(37, 24, 300, 460, wins, 'black', 60),
    lat([[24, 460], [37, 460], [37, 518], [35.5, 520], [34.6, 520], [34.6, 480], [24, 478]], 'black'),
  ), { row: 'A' });
  L.add('1', lat([[28, 480], [33, 480], [34.5, 481.5], ...th(34.5, 481.5, 518, 4, { chamferBottom: false }), [34.5, 520], [36.9, 521.5], [36.9, 788], [35.4, 790], [28, 790]], 'black'), { row: 'A' });
  // Piston : base percée, tige à pointe conique ; goupille élastique, ressort, bille.
  L.add('9', S.ball(9.5 * MM, 'chrome', { pos: X(290) }), { row: 'B' });
  L.add('7', S.group(lat([[0, 300], [22, 300], [23.5, 301.5], [23.5, 346], [22, 348], [9, 348], [9, 440], [5, 448], [0, 448]], 'charcoal'), port(3, 322, 23.5)), { row: 'B' });
  L.add('8', pinZ(3.2, 30, 425), { follow: '7', extra: [0, 0.4, 1.4] });
  L.add('6', S.spring(15 * MM, 2.5 * MM, 60 * MM, 7, 'steel', { axis: 'x', pos: X(379) }), { row: 'B' });
  L.add('2', lat([[0, 470], [3.5, 470], [3.5, 560], [5, 565], [5, 780], [0, 780]], 'steel', 20), { row: 'B' });
  // Lames de coupe (pivot en haut, arête en bas) et vis d'axe.
  for (const a of AS) {
    const n = nrm(a), t = tan(a);
    const blade = plate([[404, 36.5], [400, 26], [442, 13], [449, 30], [440, 36.5]], 13, 'black', [[436, 26, 5]]);
    blade.rotation.x = a + PI / 2;
    L.add('5', blade, { follow: '10', extra: [0, n[1] * 1.3, n[2] * 1.3] });
    const p = [436, 26 * n[1] + SP * t[1], 26 * n[2] + SP * t[2]];
    L.add('3', capScrew(9.5, 38, p, t), { follow: '10', extra: [0, n[1] * 1.0 + t[1] * 1.0, n[2] * 1.0 + t[2] * 1.0] });
  }
  const a4 = 0.6, n4 = nrm(a4);
  L.add('4', capScrew(9.5, 19, [500, 37 * n4[1], 37 * n4[2]], n4), { follow: '10', extra: [0, n4[1] * 1.2, n4[2] * 1.2] });
  L.done();
  return { view: SIDE };
}

// ---------------------------------------------------------------- outils de chargement (P094)
// Outils de chargement DiscovOre souterrains (B et NH) : corps en aluminium
// (tube d'appui, corps fendu, collerettes, flasque d'appui sur la tige), deux
// cliquets pivotants écartés par un ressort, goupilles élastiques. Repère :
// bout du tube à x = 0, flasque vers +X.

const LT = {
  B: {
    D: 0.036, rs: 11, ri: 7.5, xs: 90, cone: null, rb: 18, xb1: 160, rings: [[112, 120, 23]], rf: 30, xf: [160, 170], w0: 78, t: 8,
    pivot: [148, 12], stop: 104, spring: 126,
    latch: [[80, 6], [155, 6], [158, 9], [158, 17], [154, 20], [120, 20], [106, 15], [96, 15], [93, 23], [86, 24], [80, 18]], cut: [],
  },
  NH: {
    D: 0.05, rs: 13, ri: 9, xs: 105, cone: [105, 120], rb: 24, xb1: 200, rings: [[140, 152, 30], [166, 171, 33], [171, 175, 31], [175, 180, 33]], rf: 44, xf: [200, 212], w0: 92, t: 10,
    pivot: [188, 14], stop: 112, spring: 133,
    latch: [[95, 7], [194, 7], [197, 10], [197, 26], [191, 30], [168, 30], [122, 17], [110, 17], [106, 27], [99, 28], [95, 21]], cut: [[140, 12], [176, 12], [176, 24]],
  },
};

function loadingTool(api, size) {
  const C = LT[size];
  const K = kit(api, C.D, { gap: 0.8, rows: { A: 0, B: -2.4, C: 2.4 } });
  const { S, L, X, lat, win, hole, tube, pinZ, pinHoles, plate } = K;
  const al = 'steel'; // aluminium usiné
  const slot = (r, x0, x1) => [win(UP, Math.min(1.2, (C.t + 2) / r), x0, x1), win(DOWN, Math.min(1.2, (C.t + 2) / r), x0, x1)];
  const xb0 = C.cone ? C.cone[1] : C.xs;
  const [px, py] = C.pivot;
  const body = S.group(
    tube(C.rs, C.ri, 0, C.xs, slot(C.rs, C.w0, C.xs), al),
    tube(C.rb, C.ri, xb0, C.xb1, [...slot(C.rb, xb0, C.xb1 - 1), ...pinHoles(px, py, 2.6, C.rb), ...pinHoles(px, -py, 2.6, C.rb), ...(C.stop > xb0 ? hole(0, C.stop, 2.6, C.rb) : [])], al, 56),
    lat([[C.ri, C.xf[0]], [C.rf - 1, C.xf[0]], [C.rf, C.xf[0] + 1], [C.rf, C.xf[1] - 1], [C.rf - 1, C.xf[1]], [C.ri, C.xf[1]]], al, 56),
    ...C.rings.map(([x0, x1, r]) => tube(r, C.rb, x0, x1, slot(r, x0, x1), al, 56)),
  );
  if (C.cone) body.add(lat([[C.ri, C.cone[0]], [C.rs, C.cone[0]], [C.rb, C.cone[1]], [C.ri, C.cone[1]]], al, 48));
  L.add('1', body, { row: 'A' });
  for (const s of [1, -1]) {
    const pts = C.latch.map(([x, y]) => [x, s * y]);
    const cut = C.cut.map(([x, y]) => [x, s * y]);
    const holes = [[px, s * py, 2.6], ...(cut.length ? [cut] : [])];
    L.add('2', plate(s > 0 ? pts : pts.reverse(), C.t, 'darkSteel', holes), { follow: '1', extra: [0, s * 0.9, 0] });
  }
  const ri = C.latch[0][1];
  L.add('3', S.spring(2.6 * MM, 0.5 * MM, 2 * ri * MM, 7, 'steel', { axis: 'y', pos: X(C.spring) }), { row: 'B' });
  const chord = (y, r) => 2 * Math.sqrt(r * r - y * y) - 1;
  for (const s of [1, -1]) L.add('4', pinZ(2.4, chord(py, C.rb), px, s * py), { follow: '1', extra: [0, s * 0.5, 1.8] });
  const rStop = C.stop < C.xs ? C.rs : C.cone && C.stop < C.cone[1] ? C.rs + ((C.stop - C.cone[0]) / (C.cone[1] - C.cone[0])) * (C.rb - C.rs) : C.rb;
  L.add('4', pinZ(2.4, 2 * rStop - 1, C.stop, 0), { follow: '1', extra: [0, 0, 1.8] });
  L.done();
  return { view: SIDE };
}

// Extracteur de bague indicatrice d'atterrissage : pince fendue au bout, cage,
// tige filetée, masse coulissante, écrous de butée et rondelle de pose.
function bushingPuller(api) {
  const K = kit(api, 0.03, { gap: 0.8, rows: { A: 0, B: -2.0 } });
  const { S, L, X, lat, th, win, tube } = K;
  const nut = (x) => S.nut(17 * MM, 8 * MM, 'cream', { axis: 'x', pos: X(x) });
  L.add('4', S.group(
    tube(12.5, 7, 4, 30, [0, 1, 2, 3].map((k) => win(PI / 4 + (k * PI) / 2, 0.22, 4, 22)), 'black'),
    lat([[7, 0], [13.5, 0], [14, 0.5], [14, 3.5], [12.5, 4], [7, 4]], 'black', 32),
    lat([[12.5, 10], [13.3, 10.5], [13.3, 12.5], [12.5, 13]], 'black', 32),
    lat([[12.5, 16], [13.3, 16.5], [13.3, 18.5], [12.5, 19]], 'black', 32),
  ), { row: 'A' });
  L.add('3', S.group(
    tube(11.5, 5.5, 30, 86, [0, 1, 2, 3].map((k) => win((k * PI) / 2, 0.55, 36, 80)), 'darkSteel', 40),
    lat([[5.5, 86], [11.5, 86], [11.5, 91], [10.5, 92], [5.5, 92]], 'darkSteel', 32),
  ), { row: 'A' });
  L.add('1', lat([[0, 20], [4.5, 20], [5, 21], ...th(5, 21, 120, 1.5, { chamferBottom: false }), [5, 360], ...th(5, 360, 420, 1.5, { chamferBottom: false }), [4, 421], [0, 421]], 'darkSteel', 20), { row: 'B' });
  for (const x of [97, 170, 378, 387]) L.add('6', nut(x), { row: 'A' });
  L.add('2', lat([[6.5, 180], [25, 180], [26, 181], [26, 185], [25, 186], [17, 188], [23, 222], [24, 246], [23, 270], [17, 304], [25, 306], [26, 307], [26, 311], [25, 312], [6.5, 312]], 'grey', 48), { row: 'A' });
  L.add('5', S.washer(14 * MM, 5.5 * MM, 2.5 * MM, 'steel', { axis: 'x', pos: X(393) }), { row: 'A' });
  L.add('6', nut(400), { row: 'A' });
  L.done();
  return { view: SIDE };
}

export const P094 = (api) => loadingTool(api, 'B');
/** Pages hors motif /^P\d{3}/ (à enregistrer par index.js) : outil NH et extracteur de bague. */
export const extra = {
  'P094-NH': (api) => loadingTool(api, 'NH'),
  'P094-LI': bushingPuller,
};

// ---------------------------------------------------------------- tête 48TT (P105)
// Tête de carottier conventionnel 48TT : raccord AWJ (vissé sous la tige et
// dans le tube extérieur), arbre de guidage suspendu par une vis CHC sur un
// ressort plastique, clapet d'arrêt, deux demi-boîtiers de roulement, arbre à
// roulements (butée, roulements à billes, joint) et adaptateur du tube
// intérieur. Repère : bas de l'adaptateur à x = 0.

export function P105(api) {
  const K = kit(api, 0.04, { gap: 0.5, rows: { A: 0, B: -2.3, C: 2.3 } });
  const { S, L, X, lat, th, win, tube, pinZ, port, capScrew } = K;
  const ax = (x) => ({ axis: 'x', pos: X(x) });
  L.add('20', S.group(
    lat([[6, 0], [16.5, 0], [17.6, 1.2], ...th(17.6, 1.2, 13, 2, { chamferBottom: false }), [17.6, 14], [19.5, 14], [19.5, 18], [18.5, 19], [18.5, 21], [19.5, 22], [19.5, 29], [18.5, 30], [8, 30], [8, 12], [6, 10]], 'darkSteel'),
  ), { row: 'A' });
  L.add('19', S.nut(24 * MM, 10 * MM, 'darkSteel', ax(35)), { row: 'B' });
  L.add('18', lat([[0, 12], [7, 12], [8, 13], ...th(8, 13, 41, 2, { chamferBottom: false }), [8, 42], [9, 43], [9, 100], [14, 100], [14, 110], [7.5, 110], [7.5, 158], [6, 159], ...th(6, 159, 177, 1.5, { chamferBottom: false }), [5, 178], [0, 178]], 'steel'), { row: 'B' });
  L.add('17', S.washer(14 * MM, 7.6 * MM, 4 * MM, 'yellow', ax(112)), { row: 'B' });
  L.add('13', S.bearing(14 * MM, 7.6 * MM, 8 * MM, 'steel', ax(120)), { row: 'B' });
  L.add('16', S.washer(11 * MM, 7.6 * MM, 1 * MM, 'steel', ax(124.6)), { row: 'B' });
  L.add('15', S.bearing(14 * MM, 7.6 * MM, 9 * MM, 'steel', { thrust: true, ...ax(130) }), { row: 'B' });
  L.add('13', S.bearing(14 * MM, 7.6 * MM, 8 * MM, 'steel', ax(154)), { row: 'B' });
  L.add('12', S.washer(12 * MM, 6.2 * MM, 1.5 * MM, 'steel', ax(158.8)), { row: 'B' });
  L.add('11', S.nut(18 * MM, 8 * MM, 'steel', ax(163.6)), { row: 'B' });
  // Boîtier de roulement : deux demi-coquilles (haut et bas) à lumière.
  L.add('14', tube(18, 14, 95, 160, [win(DOWN, PI, 94, 161), win(-0.6, 0.6, 112, 136)], 'charcoal'), { row: 'A', extra: [0, 0.6, 0] });
  L.add('14', tube(18, 14, 95, 160, [win(UP, PI, 94, 161), win(0.6, 0.6, 112, 136)], 'charcoal'), { follow: '14', extra: [0, -0.6, 0] });
  // Arbre de guidage : corps creux (écrou de blocage), collerette, col goupillé, tige.
  L.add('6', S.group(
    lat([[0, 185], [12, 185], [12, 159], [16, 159], [17, 160.5], [17, 226], [19, 226], [19, 231], [18, 232], [9, 232], [9, 262], [7, 264], [7, 335], [6, 336], [0, 336]], 'darkSteel'),
    port(2.6, 250, 9), port(3, 196, 17),
  ), { row: 'A' });
  L.add('7', pinZ(2.5, 26, 250), { follow: '6', extra: [0, 0.6, 1.2] });
  L.add('10', S.at(S.fitting(6 * MM, 12 * MM, 'brass', { axis: 'z' }), X(208, 0, 19)), { follow: '6', extra: [0, 0, 1.2] });
  L.add('9', lat([[9, 232], [19.5, 232], [20, 233], [20, 240], [19.5, 241], [9, 241]], 'yellow'), { row: 'C' });
  L.add('8', S.washer(17 * MM, 9 * MM, 2 * MM, 'steel', ax(242)), { row: 'C' });
  // Raccord AWJ : doigts en bas, filet du tube extérieur, boîte de la tige en haut.
  L.add('5', S.group(
    tube(20, 13, 250, 263, Array.from({ length: 6 }, (_, k) => win((k * TAU) / 6, 0.45, 250, 257)), 'charcoal'),
    lat([[13, 263], [20.5, 263], [21.5, 264], ...th(21.5, 264, 291, 3, { chamferBottom: false }), [21.5, 292], [22.3, 293], [22.3, 333], [23, 334], [23, 358], [22, 360], [19.6, 360], [19.6, 322], [17, 320], [8.5, 320], [8.5, 275], [13, 270]], 'charcoal', 48),
  ), { row: 'A' });
  // Vis CHC M8 × 20, rondelle d'extrémité, ressort plastique, rondelle.
  L.add('4', S.washer(15 * MM, 7.5 * MM, 2 * MM, 'steel', ax(321)), { row: 'C' });
  L.add('3', lat([[8, 322], [13, 322], [13, 340], [8, 340]], 'lightGrey'), { row: 'C' });
  L.add('2', S.washer(13 * MM, 4.5 * MM, 2.5 * MM, 'steel', ax(341.25)), { row: 'C' });
  L.add('1', capScrew(8, 20, [342.5, 0, 0], [1, 0, 0]), { row: 'C' });
  L.done();
  return { view: SIDE };
}

// ---------------------------------------------------------------- carottier 48TT (P104)
// Carottier conventionnel 48TT (trou Ø 48, carotte Ø 35,3) : émerillon d'eau
// AWJ, adaptateur, tige AWJ (raccourcie), stabilisateur, tête (sous-
// assemblage P105), tube extérieur et tube intérieur (raccourcis à 1 m),
// boîtier d'extracteur et extracteur. Repère : bas du boîtier d'extracteur à x = 0.

export function P104(api) {
  const K = kit(api, 0.046, { gap: 0.8, rows: { A: 0, B: -2.6, C: 2.4 } });
  const { S, L, X, lat, th, tube } = K;
  const IT = 500; // tube intérieur raccourci (0,5 m)
  // Boîtier d'extracteur et extracteur au bas du tube intérieur, sous le tube
  // extérieur (dans l'alésoir et la couronne, non listés), comme sur le dessin.
  const dz = -40;
  const it0 = 35 + dz, it1 = it0 + IT;
  const low = (o) => { o.position.x += dz * MM; return o; };
  L.add('7', low(lat([[16.8, 0], [18.5, 0], [20, 1.5], [20, 48.5], [19.6, 50], [19.25, 50], [19.25, 32], [18.6, 30], [17.7, 8], [16.8, 4]], 'darkSteel')), { row: 'B' });
  L.add('6', low(tube(18.4, 17.7, 10, 28, [{ a: 0, w: 0.15, y0: 0, y1: 1 }], 'charcoal', 32)), { row: 'B' });
  L.add('4', lat([[18, it0], [18.6, it0], [19, it0 + 0.5], [19, it1], [18, it1]], 'white', 48), { row: 'B' });
  // Tête : l'adaptateur se visse dans le haut du tube intérieur.
  const h0 = it1 - 14;
  const head = api.sub('P105');
  head.position.x = h0 * MM;
  L.add('9', head, { row: 'A' });
  // Tube extérieur : filet mâle en bas (alésoir), boîte du raccord AWJ en haut.
  const ot1 = h0 + 292;
  L.add('5', lat([[20.5, -10], [20.8, -10], [21.5, -8], ...th(21.5, -8, 22, 3, { chamferBottom: false }), [21.5, 24], [23, 26], [23, ot1], [21.6, ot1], [21.6, ot1 - 30], [20.5, ot1 - 32]], 'lightGrey', 48), { row: 'A' });
  // Stabilisateur : cannelures entre deux portées au diamètre du trou.
  const s0 = h0 + 320, s1 = s0 + 130;
  L.add('8', S.group(
    lat([[15, s0], [17, s0], [18.5, s0 + 1.5], ...th(18.5, s0 + 1.5, s0 + 38, 3, { chamferBottom: false }), [18.5, s0 + 40], [22.5, s0 + 40], [24, s0 + 42], [24, s0 + 54], [21, s0 + 56], [21, s1 - 26], [24, s1 - 24], [24, s1 - 2], [22.5, s1], [19.6, s1], [19.6, s1 - 40], [15, s1 - 43]], 'lightGrey', 48),
    band(api, 21, s0 + 56, s1 - 26, 80, 1, (a) => (frac((a / TAU) * 10) < 0.3 ? 0 : 3), 'lightGrey'),
  ), { row: 'A' });
  // Tige AWJ (raccourcie à 0,3 m).
  const r0 = s1 - 40, r1 = r0 + 300;
  L.add('3', lat([[16, r0], [17.8, r0], [19.3, r0 + 1.5], ...th(19.3, r0 + 1.5, r0 + 38, 3, { chamferBottom: false }), [19.3, r0 + 40], [21, r0 + 42], [22.25, r0 + 44], [22.25, r1], [19.6, r1], [19.6, r1 - 40], [17.45, r1 - 42], [17.45, r0 + 44], [16, r0 + 40]], 'grey', 48), { row: 'A' });
  // Adaptateur de broche, puis émerillon d'eau AWJ (six-pans, corps, embout de tuyau).
  const a0 = r1 - 40, a1 = r1 + 44;
  L.add('2', lat([[10, a0], [17.8, a0], [19.3, a0 + 1.5], ...th(19.3, a0 + 1.5, a0 + 38, 3, { chamferBottom: false }), [19.3, a0 + 40], [22.25, a0 + 42], [22.25, a1 - 2], [21, a1], [14.8, a1], [14.8, a1 - 30], [10, a1 - 33]], 'darkSteel', 48), { row: 'A' });
  const w0 = a1 - 30;
  L.add('1', S.group(
    lat([[0, w0], [13, w0], [14.5, w0 + 1.5], ...th(14.5, w0 + 1.5, w0 + 28, 3, { chamferBottom: false }), [14.5, w0 + 30], [0, w0 + 30]], 'steel'),
    S.lathe(prof(MM, [[0, w0 + 30], [21.5, w0 + 30], [23.6, w0 + 32], [23.6, w0 + 48], [21.5, w0 + 50], [0, w0 + 50]]), 'steel', { axis: 'x', seg: 6 }),
    lat([[0, w0 + 50], [19, w0 + 50], [19, w0 + 113], [17, w0 + 115], [16, w0 + 115], [16, w0 + 127], [11, w0 + 129], ...th(11, w0 + 129, w0 + 155, 2.5, { chamferBottom: false }), [11, w0 + 160], [9, w0 + 162], [0, w0 + 162]], 'steel'),
    S.at(S.fitting(7 * MM, 14 * MM, 'brass'), X(w0 + 85, 21)),
  ), { row: 'A' });
  L.done();
  return { view: SIDE };
}

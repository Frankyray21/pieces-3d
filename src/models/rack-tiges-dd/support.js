// Support de tiges de forage (« rack à rods ») : le support lui-même, d'après
// les figures du rapport de certification Forcetech P19113 (2019-11-27). Le
// rapport ne donne aucune cote : les dimensions sont estimées sur les vues, à
// partir de la seule mesure connue (23 tiges NQ de 69,9 mm par rangée entre
// les poteaux, figure 2 et schéma de la procédure).
// Peinture : tout le support en rouge (demande du client ; le rapport le montre gris, pattes rouges).
// Repère du support (debout) : X le long des traverses, Y le long des poteaux, +Z côté tiges, −Z côté mur.

export const IN = 0.0254;
export const T2 = 2 * IN, T15 = 1.5 * IN, T25 = 2.5 * IN; // profilés HSS carrés (estimés)
export const NQ = { od: 0.0699, id: 0.0603, len: 3, cols: 23, rows: 8 };
export const SIDE = 0.02; // jeu de chaque côté : les tiges ne s'appuient pas sur les côtés (étape 10)
export const CLEAR = 1.69; // entre les poteaux : 23 tiges NQ par rangée, en quinconce (23,5 diamètres), plus le jeu
export const XP = (CLEAR + T2) / 2; // axe des poteaux
export const H_TOP = 2.47, H_LOW = 0.96; // axes des traverses
export const POST = [0.3, 2.84]; // bas et haut du poteau
export const LEG = 0.65; // patte du bas
export const WALL = 0.49; // membrure (patte du haut), du poteau au mur
export const ARM = 0.38, EXT = 0.68; // côté tiges : bout de la membrure, bout des rallonges du haut et du bas
export const SPLIT = -0.19; // traverses : début du manchon (section extérieure, côté +X)
const INNER_END = 0.1; // traverses : bout de la section intérieure, glissée dans le manchon
const PIN_X = -0.05;
export const ROW = (NQ.od * Math.sqrt(3)) / 2; // pas des rangées en quinconce
export const FRONT = T2 / 2 + NQ.od + (NQ.rows - 1) * ROW; // devant du paquet de 8 rangées (Z, repère du support)

// Installation (procédure PRO-DD-ST-008, étape 5) : support incliné entre 75°
// et 80° ; les tiges s'appuient sur les traverses, donc au même angle.
export const ANGLE = 78;
export const TILT = ((90 - ANGLE) * Math.PI) / 180;
export const SIN = Math.sin(TILT), COS = Math.cos(TILT);
export const LIFT = (T25 / 2) * SIN; // la patte inclinée porte sur son arête côté mur
/** Point du repère du support (debout) → repère du chantier (support incliné vers le mur, pieds à Z = 0). */
export const W = (x, y, z) => [x, y * COS + z * SIN + LIFT, -y * SIN + z * COS];
export const HOOK = (69 * IN) / COS; // crochets fermés : 66 à 72 po du sol une fois le support incliné (procédure)
export const LUG = H_TOP - 0.38; // œillets d'ancrage (figure 3 du rapport)

/** Profilé carré creux de côté a, le long de l'axe donné, centré à l'origine. */
export function hss(S, a, len, material, axis = 'y', t = 0.0048) {
  const o = (a - t) / 2;
  const m = S.merged([
    S.box(a, len, t, material, { pos: [0, 0, o] }), S.box(a, len, t, material, { pos: [0, 0, -o] }),
    S.box(t, len, a - 2 * t, material, { pos: [o, 0, 0] }), S.box(t, len, a - 2 * t, material, { pos: [-o, 0, 0] }),
  ], material);
  if (axis === 'x') m.rotation.z = Math.PI / 2;
  if (axis === 'z') m.rotation.x = Math.PI / 2;
  return S.group(m);
}

/** Trous de goupille (pastilles sombres des deux côtés du profilé de côté a). */
function holes(S, points, a, axis) {
  return points.map((p) => S.cyl(0.008, a + 0.0012, 'blackOxide', { axis, pos: p, seg: 12 }));
}

/** Goupille à anneau, tige le long de l'axe donné, centrée à l'origine. */
function pin(S, a, axis) {
  const g = S.group(S.cyl(0.0065, a + 0.035, 'zinc', { seg: 12 }), S.cyl(0.011, 0.005, 'zinc', { pos: [0, a / 2 + 0.006, 0], seg: 12 }),
    S.at(S.torus(0.013, 0.002, 'zinc', { axis: 'z' }), [0, a / 2 + 0.024, 0]));
  if (axis === 'x') g.rotation.z = -Math.PI / 2;
  return g;
}

function post(S) {
  const len = POST[1] - POST[0];
  const g = hss(S, T2, len, 'red');
  g.position.y = POST[0] + len / 2;
  const pts = [];
  for (let y = 0.4; y < 1.95; y += 0.1) if (Math.abs(y - H_LOW) > 0.06) pts.push([0, y - g.position.y, 0]);
  g.add(...holes(S, pts, T2, 'x'));
  return g;
}

function leg(S) {
  const g = S.group(S.at(hss(S, T25, LEG, 'red'), [0, LEG / 2, 0]));
  // Appui court au pied, côté tiges : il reçoit la rallonge de la patte du bas.
  g.add(S.at(hss(S, T25, 0.14, 'red', 'z'), [0, 0.12, T25 / 2 + 0.07]));
  g.add(...holes(S, [[0, 0.55, 0]], T25, 'x'));
  return g;
}

/** Rallonge de la patte du bas : glissée dans l'appui du pied, sortie côté tiges comme celle du haut. */
function legExt(S) {
  const z0 = T25 / 2 + 0.02, len = EXT - z0;
  const g = S.at(hss(S, T2, len, 'red', 'z'), [0, 0.12, z0 + len / 2]);
  g.add(...holes(S, [[0, 0, 0.5 - g.position.z]], T2, 'y'));
  return g;
}

function beamInner(S) {
  const x0 = -CLEAR / 2, len = INNER_END - x0;
  const g = S.at(hss(S, T15, len, 'red', 'x'), [x0 + len / 2, 0, 0]);
  g.add(...holes(S, [-0.55, -0.3, PIN_X].map((x) => [x - g.position.x, 0, 0]), T15, 'y'));
  return g;
}

function beamOuter(S) {
  const len = CLEAR / 2 - SPLIT;
  const g = S.at(hss(S, T2, len, 'red', 'x'), [SPLIT + len / 2, 0, 0]);
  g.add(...holes(S, [[PIN_X - g.position.x, 0, 0]], T2, 'y'));
  return g;
}

/** Membrure d'appui au mur (« patte du haut ») : deux tronçons de part et d'autre du poteau. */
function arm(S) {
  const g = S.group(
    S.at(hss(S, T2, WALL - T2 / 2, 'red', 'z'), [0, 0, -(WALL + T2 / 2) / 2]),
    S.at(hss(S, T2, ARM - T2 / 2, 'red', 'z'), [0, 0, (ARM + T2 / 2) / 2]),
  );
  g.add(...holes(S, [[0, 0, -0.33], [0, 0, 0.3]], T2, 'y'));
  return g;
}

function armExt(S) {
  const z0 = 0.2, len = EXT - z0;
  const g = S.at(hss(S, T15, len, 'red', 'z'), [0, 0, z0 + len / 2]);
  g.add(...holes(S, [[0, 0, 0.5 - g.position.z]], T15, 'y'));
  return g;
}

/** Œillet d'ancrage en plaque, sur la face du poteau côté mur. */
function lug(S) {
  const pts = [[0, -0.05], [0.035, -0.05]];
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI; pts.push([0.05 + 0.04 * Math.cos(a), 0.04 * Math.sin(a) - 0.01]); }
  pts.push([0.035, 0.05], [0, 0.05]);
  const m = S.extrude(pts, 0.0095, 'red', { holes: [[0.055, -0.01, 0.02]] });
  m.rotation.y = Math.PI / 2; // la plaque sort vers −Z
  return S.group(m);
}

/** Chaîne à maillons le long d'un tracé de points (courbe lissée), en un seul maillage ; size : grosseur des maillons (1 = fil de 6 mm). */
export function chainAlong(api, points, material = 'zinc', size = 1) {
  const { S, THREE } = api;
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
  const n = Math.max(2, Math.round(curve.getLength() / (0.032 * size)));
  const geo = new THREE.TorusGeometry(0.0095 * size, 0.003 * size, 4, 8);
  geo.scale(0.7, 1.75, 1);
  const up = new THREE.Vector3(0, 1, 0), twist = new THREE.Quaternion().setFromAxisAngle(up, Math.PI / 2);
  const links = [];
  for (let i = 0; i <= n; i++) {
    const m = new THREE.Mesh(geo);
    m.position.copy(curve.getPointAt(i / n));
    m.quaternion.setFromUnitVectors(up, curve.getTangentAt(i / n));
    if (i % 2) m.quaternion.multiply(twist);
    links.push(m);
  }
  return S.merged(links, material);
}

export const CHAIN = 1.5; // grosseur des chaînes d'ancrage et de retenue (fil de 9 mm, comme sur les photos)

/** Longueur d'un tracé de points (ligne brisée). */
export const pathLength = (pts) => pts.slice(1).reduce((n, q, i) => n + Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1], q[2] - pts[i][2]), 0);

/** Crochet fermé de la chaîne de retenue, sur la face du poteau côté tiges. */
function hook(S) {
  return S.group(S.box(0.04, 0.07, 0.006, 'red', { pos: [0, 0, 0.003] }), S.torus(0.016, 0.005, 'red', { axis: 'x', pos: [0, 0, 0.022] }));
}

/** Chaîne suspendue à son crochet (figure 1 du rapport), origine au crochet. */
function hangingChain(api, len = 0.85) {
  return api.S.group(chainAlong(api, [[0, -0.01, 0.022], [0, -len / 2, 0.024], [0, -len, 0.022]], 'blue', CHAIN));
}

/** Support vide (figure 1 du rapport) ; opts.loaded : installé, sa chaîne de retenue ceinture les tiges. */
export function P01(api, opts = {}) {
  const S = api.S;
  const seen = new Set();
  const put = (ref, obj, pos, explode) => {
    S.at(obj, pos);
    api.part(ref, obj, explode, { noLabel: seen.has(ref) });
    seen.add(ref);
  };
  for (const s of [-1, 1]) {
    const x = s * XP;
    const p = post(S);
    put('1', p, [x, p.position.y, 0], [s * 0.25, 0, 0]);
    put('2', leg(S), [x, 0, 0], [s * 0.25, -0.5, 0]);
    const low = legExt(S);
    put('13', low, [x, low.position.y, low.position.z], [s * 0.25, -0.5, 0.5]);
    put('7', arm(S), [x, H_TOP, 0], [s * 0.25, 0.35, 0]);
    const ext = armExt(S); // sortie côté tiges, au-delà du paquet de 8 rangées
    put('8', ext, [x, H_TOP, ext.position.z], [s * 0.25, 0.35, 0.45]);
    put('9', pin(S, T2, 'y'), [x, H_TOP, 0.3], [s * 0.25, 0.75, 0.2]);
    put('9', pin(S, T25, 'x'), [x, 0.55, 0], [s * 0.6, -0.5, 0]);
    // Rallonge de la patte du bas goupillée dans l'appui du pied, comme celle du haut dans la membrure.
    put('9', pin(S, T25, 'y'), [x, 0.12, T25 / 2 + 0.09], [s * 0.25, -0.2, 0.5]);
    put('10', lug(S), [x, LUG, -T2 / 2], [s * 0.25, 0, -0.3]);
    put('11', hook(S), [x, HOOK, T2 / 2], [s * 0.25, 0, 0.3]);
    if (!opts.loaded) put('12', hangingChain(api), [x, HOOK, T2 / 2], [s * 0.25, 0, 0.55]);
  }
  for (const [h, a, b] of [[H_TOP, '3', '4'], [H_LOW, '5', '6']]) {
    const inner = beamInner(S), outer = beamOuter(S);
    put(a, inner, [inner.position.x, h, 0], [-0.3, 0, 0.3]);
    put(b, outer, [outer.position.x, h, 0], [0.3, 0, 0.3]);
    put('9', pin(S, T2, 'y'), [PIN_X, h, 0], [0, 0.4, 0.3]);
  }
  return { view: { dir: [0.9, 0.45, 1.25] } };
}

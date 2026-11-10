// Support de tiges de forage (« rack à rods ») : modèle 3D d'après les figures
// du rapport de certification Forcetech P19113 (2019-11-27). Le rapport ne
// donne aucune cote : les dimensions sont estimées sur les vues, à partir de
// la seule mesure connue (23 tiges NQ de 69,9 mm entre les poteaux, figure 2).
// Peinture : tout le support en rouge (demande du client ; le rapport le montre gris, pattes rouges).
// Repère : X le long des traverses, Y vers le haut, +Z côté tiges, −Z côté mur.

const IN = 0.0254;
const T2 = 2 * IN, T15 = 1.5 * IN, T25 = 2.5 * IN; // profilés HSS carrés (estimés)
const CLEAR = 1.62; // entre les poteaux : 23 tiges NQ
const XP = (CLEAR + T2) / 2; // axe des poteaux
const H_TOP = 2.47, H_LOW = 0.96; // axes des traverses
const POST = [0.3, 2.84]; // bas et haut du poteau
const LEG = 0.65; // patte rouge
const WALL = 0.49; // membrure, du poteau au mur
const ARM = 0.38, EXT = 0.68; // membrure côté tiges : bout du profilé, bout de la rallonge
const SPLIT = -0.19, INNER_END = 0.1; // traverses : début du manchon, bout de la section intérieure
const PIN_X = -0.05;

export const NQ = { od: 0.0699, id: 0.0603, len: 3, cols: 23, rows: 8 };
const ANGLE = (82 * Math.PI) / 180; // empilement à 80° et plus par rapport au sol

/** Profilé carré creux de côté a, le long de l'axe donné, centré à l'origine. */
function hss(S, a, len, material, axis = 'y', t = 0.0048) {
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
  // Appui court au pied, côté tiges.
  g.add(S.at(hss(S, T25, 0.14, 'red', 'z'), [0, 0.12, T25 / 2 + 0.07]));
  g.add(...holes(S, [[0, 0.55, 0]], T25, 'x'));
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

/** Membrure d'appui au mur : deux tronçons de part et d'autre du poteau. */
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

/** Anneau d'attache en plaque, sur la face du poteau côté mur. */
function lug(S) {
  const pts = [[0, -0.05], [0.035, -0.05]];
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI; pts.push([0.05 + 0.04 * Math.cos(a), 0.04 * Math.sin(a) - 0.01]); }
  pts.push([0.035, 0.05], [0, 0.05]);
  const m = S.extrude(pts, 0.0095, 'red', { holes: [[0.055, -0.01, 0.02]] });
  m.rotation.y = Math.PI / 2; // la plaque sort vers −Z
  return S.group(m);
}

/** Chaîne suspendue à sa patte d'accrochage, sur la face du poteau côté tiges. */
function chain(S, len = 0.85) {
  const pitch = 0.03, n = Math.round(len / pitch);
  const links = [];
  for (let i = 0; i < n; i++) {
    const l = S.torus(0.0095, 0.003, 'zinc', { axis: i % 2 ? 'x' : 'z' });
    l.scale.set(i % 2 ? 1 : 0.7, 1.75, i % 2 ? 0.7 : 1);
    links.push(S.at(l, [0, -0.02 - i * pitch, 0.016]));
  }
  const bracket = S.box(0.04, 0.07, 0.006, 'red', { pos: [0, 0, 0.003] });
  const hook = S.box(0.012, 0.012, 0.03, 'red', { pos: [0, -0.005, 0.018] });
  return S.group(bracket, hook, S.merged(links, 'zinc'));
}

/** Support vide (figure 1). */
function P01(api) {
  const S = api.S;
  const seen = new Set();
  const put = (ref, obj, pos, explode) => {
    S.at(obj, pos);
    api.part(ref, obj, explode, { noLabel: seen.has(ref) });
    seen.add(ref);
  };
  for (const s of [-1, 1]) {
    const x = s * XP;
    put('1', post(S), [x, post(S).position.y, 0], [s * 0.25, 0, 0]);
    put('2', leg(S), [x, 0, 0], [s * 0.25, -0.5, 0]);
    put('7', arm(S), [x, H_TOP, 0], [s * 0.25, 0.35, 0]);
    put('8', armExt(S), [x, H_TOP, 0], [s * 0.25, 0.35, 0.45]);
    put('9', pin(S, T2, 'y'), [x, H_TOP, 0.3], [s * 0.25, 0.75, 0.2]);
    put('9', pin(S, T25, 'x'), [x, 0.55, 0], [s * 0.6, -0.5, 0]);
    put('10', lug(S), [x, H_TOP - 0.38, -T2 / 2], [s * 0.25, 0, -0.3]);
    put('11', chain(S), [x, H_TOP - 0.36, T2 / 2], [s * 0.25, 0, 0.35]);
  }
  for (const [h, a, b] of [[H_TOP, '3', '4'], [H_LOW, '5', '6']]) {
    const inner = beamInner(S), outer = beamOuter(S);
    put(a, inner, [inner.position.x, h, 0], [-0.3, 0, 0.3]);
    put(b, outer, [outer.position.x, h, 0], [0.3, 0, 0.3]);
    put('9', pin(S, T2, 'y'), [PIN_X, h, 0], [0, 0.4, 0.3]);
  }
  return { view: { dir: [0.9, 0.45, 1.25] } };
}

// Tiges usagées : teinte choisie d'après la place de la tige (toujours la même pour une tige).
const ROD_TONES = ['rodWorn', 'rodRust', 'rodDull', 'rodWorn', 'rodRustDark', 'rodRust', 'rodDull'];
function rodTone(k, c) {
  const h = Math.sin(k * 127.1 + c * 311.7) * 43758.5453;
  return ROD_TONES[Math.floor((h - Math.floor(h)) * ROD_TONES.length)];
}

/** Support chargé de 184 tiges NQ, appuyé au mur (figures 2 et 3). */
function P02(api) {
  const S = api.S;
  api.part('1', api.sub('P01', { inPlace: true }), [0, 0, 0]);
  // Première rangée appuyée sur l'arête de la traverse supérieure ; les
  // suivantes s'empilent contre elle, pieds au sol.
  const r = NQ.od / 2, sin = Math.sin(ANGLE), cos = Math.cos(ANGLE);
  const tilt = Math.PI / 2 - ANGLE;
  for (let k = 0; k < NQ.rows; k++) {
    const y0 = H_TOP + T2 / 2 + (r + k * NQ.od) * cos;
    const z0 = T2 / 2 + (r + k * NQ.od) * sin;
    const s = (y0 - r * cos) / sin; // du point d'appui au pied, le long de la tige
    const mid = NQ.len / 2 - s;
    for (let c = 0; c < NQ.cols; c++) {
      const rod = S.shell(r, NQ.id / 2, NQ.len, rodTone(k, c), { seg: 14 });
      rod.rotation.x = -tilt;
      S.at(rod, [(c - (NQ.cols - 1) / 2) * NQ.od, y0 + mid * sin, z0 - mid * cos]);
      api.part('2', rod, [0, 0, 1.1 + k * 0.05], { noLabel: k + c > 0 });
    }
  }
  // Mur en panneau translucide : la vue de la figure 3 (côté mur) reste dégagée.
  const wall = S.box(3.6, 3.4, 0.05, 'glass', { pos: [0, 1.7, -WALL - 0.025] });
  api.part('M', wall, [0, 0, 0], { noLabel: true });
  const floor = S.box(3.6, 0.2, 2.6, 'rockFloor', { pos: [0, -0.1, 1.3 - WALL] });
  api.part('S', floor, [0, 0, 0], { noLabel: true });
  return { view: { dir: [-1.0, 0.55, -1.15] } };
}

export default { P01, P02 };

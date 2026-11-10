// Support de tiges de forage (« rack à rods ») : modèle 3D d'après les figures
// du rapport de certification Forcetech P19113 (2019-11-27). Le rapport ne
// donne aucune cote : les dimensions sont estimées sur les vues, à partir de
// la seule mesure connue (23 tiges NQ de 69,9 mm entre les poteaux, figure 2).
// Peinture : tout le support en rouge (demande du client ; le rapport le montre gris, pattes rouges).
// Installation (P02) d'après la procédure PRO-DD-ST-008 (révision août 2024) :
// support incliné entre 75° et 80°, boulon à œil et chaîne d'ancrage tendue,
// tiges en quinconce, chaîne de retenue aux crochets fermés.
// Repère : X le long des traverses, Y vers le haut, +Z côté tiges, −Z côté mur.

const IN = 0.0254;
const T2 = 2 * IN, T15 = 1.5 * IN, T25 = 2.5 * IN; // profilés HSS carrés (estimés)
const CLEAR = 1.66; // entre les poteaux : 23 tiges NQ par rangée, en quinconce (23,5 diamètres)
const XP = (CLEAR + T2) / 2; // axe des poteaux
const H_TOP = 2.47, H_LOW = 0.96; // axes des traverses
const POST = [0.3, 2.84]; // bas et haut du poteau
const LEG = 0.65; // patte rouge
const WALL = 0.49; // membrure, du poteau au mur
const ARM = 0.38, EXT = 0.68; // membrure côté tiges : bout du profilé, bout de la rallonge
const SPLIT = -0.19, INNER_END = 0.1; // traverses : début du manchon, bout de la section intérieure
const PIN_X = -0.05;

export const NQ = { od: 0.0699, id: 0.0603, len: 3, cols: 23, rows: 8 };
// Procédure, étape 5 : support incliné entre 75° et 80° ; les tiges s'appuient
// sur les traverses, donc au même angle.
const TILT = ((90 - 78) * Math.PI) / 180;
const SIN = Math.sin(TILT), COS = Math.cos(TILT);
const LIFT = (T25 / 2) * SIN; // la patte inclinée porte sur son arête côté mur
/** Point du repère du support (vertical) → repère du chantier (support incliné vers le mur). */
const W = (x, y, z) => [x, y * COS + z * SIN + LIFT, -y * SIN + z * COS];
const WALL_Z = W(0, H_TOP + T2 / 2, -WALL)[2]; // face du mur : bout des membrures
const HOOK = (69 * IN) / COS; // crochets fermés : 66 à 72 po du sol une fois le support incliné
const LUG = H_TOP - 0.38; // œillets d'ancrage
const FT5 = 60 * IN;

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

/** Chaîne à maillons le long d'un tracé de points (courbe lissée), en un seul maillage. */
function chainAlong(api, points, material = 'zinc') {
  const { S, THREE } = api;
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
  const n = Math.max(2, Math.round(curve.getLength() / 0.032));
  const geo = new THREE.TorusGeometry(0.0095, 0.003, 5, 10);
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

/** Crochet fermé de la chaîne de retenue, sur la face du poteau côté tiges. */
function hook(S) {
  return S.group(S.box(0.04, 0.07, 0.006, 'red', { pos: [0, 0, 0.003] }), S.torus(0.016, 0.005, 'red', { axis: 'x', pos: [0, 0, 0.022] }));
}

/** Chaîne suspendue à son crochet (figure 1 du rapport), origine au crochet. */
function hangingChain(api, len = 0.85) {
  return api.S.group(chainAlong(api, [[0, -0.01, 0.022], [0, -len / 2, 0.024], [0, -len, 0.022]]));
}

/** Support vide (figure 1). */
function P01(api, opts = {}) {
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
    const ext = armExt(S); // sortie côté tiges, au-delà du paquet de 8 rangées
    put('8', ext, [x, H_TOP, ext.position.z], [s * 0.25, 0.35, 0.45]);
    put('9', pin(S, T2, 'y'), [x, H_TOP, 0.3], [s * 0.25, 0.75, 0.2]);
    put('9', pin(S, T25, 'x'), [x, 0.55, 0], [s * 0.6, -0.5, 0]);
    put('10', lug(S), [x, LUG, -T2 / 2], [s * 0.25, 0, -0.3]);
    put('11', hook(S), [x, HOOK, T2 / 2], [s * 0.25, 0, 0.3]);
    // Chaîne au repos sur son crochet ; installée (opts.loaded), elle ceinture les tiges.
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


// Tiges usagées : teinte choisie d'après la place de la tige (toujours la même pour une tige).
const ROD_TONES = ['rodWorn', 'rodRust', 'rodDull', 'rodWorn', 'rodRustDark', 'rodRust', 'rodDull'];
function rodTone(k, c) {
  const h = Math.sin(k * 127.1 + c * 311.7) * 43758.5453;
  return ROD_TONES[Math.floor((h - Math.floor(h)) * ROD_TONES.length)];
}

const ROW = (NQ.od * Math.sqrt(3)) / 2; // pas des rangées en quinconce
const FRONT = T2 / 2 + NQ.od + (NQ.rows - 1) * ROW; // devant du paquet de tiges (repère du support)
const EYE = [0, FT5, WALL_Z + 0.045]; // œil du boulon, au centre du support, à ± 5 pi du plancher

/** Boulon à œil dans son trou de 18 po (étapes 2 et 3) : pas enfoncé jusqu'au fond. */
function eyeBolt(S) {
  const depth = 18 * IN;
  return S.group(
    S.shell(0.017, 0.0165, depth, 'rockFloor', { axis: 'z', pos: [0, FT5, WALL_Z - depth / 2], seg: 16 }),
    S.cyl(0.011, 0.4, 'zinc', { axis: 'z', pos: [0, FT5, WALL_Z - 0.4 / 2 + 0.018], seg: 14 }),
    S.torus(0.028, 0.008, 'zinc', { axis: 'x', pos: EYE }),
  );
}

/** Tendeur à cliquet de chaîne, le long de X, centré à l'origine (étape 8). */
function binder(S) {
  const g = S.group(
    S.cyl(0.015, 0.24, 'safety', { axis: 'x', seg: 14 }),
    S.box(0.05, 0.05, 0.04, 'darkSteel'),
    S.at(S.box(0.026, 0.3, 0.018, 'safety'), [0.02, 0.13, 0.03], [0.5, 0, -0.25]),
  );
  for (const s of [-1, 1]) g.add(S.torus(0.016, 0.005, 'darkSteel', { axis: 'z', pos: [s * 0.135, 0, 0] }));
  return g;
}

/**
 * Installation selon la procédure PRO-DD-ST-008 : support incliné appuyé au
 * mur, ancré au boulon à œil, chargé de 184 tiges NQ en quinconce, chaîne de
 * retenue en place. Chaque pièce porte le numéro de son étape (userData.step).
 */
function P02(api) {
  const S = api.S;
  const put = (ref, obj, explode, step, o = {}) => {
    obj.userData.step = step;
    if (o.seq !== undefined) obj.userData.seq = o.seq;
    return api.part(ref, obj, explode, { noLabel: !!o.noLabel });
  };
  // Décor : mur en panneau translucide (le trou et le boulon restent visibles), sol.
  const wall = S.box(3.6, 3.4, 0.5, 'glass', { pos: [0, 1.7, WALL_Z - 0.25] });
  put('M', wall, [0, 0, 0], -1, { noLabel: true });
  const floor = S.box(3.6, 0.2, 3.4, 'rockFloor', { pos: [0, -0.1, WALL_Z - 0.5 + 1.7] });
  put('S', floor, [0, 0, 0], -1, { noLabel: true });

  put('3', eyeBolt(S), [0, 0, 0.35], 3);

  const rack = api.sub('P01', { inPlace: true, loaded: true });
  rack.rotation.x = -TILT;
  rack.position.y = LIFT;
  put('1', rack, [0, 0, 0], 4);

  // Chaîne d'ancrage : passée dans le boulon à œil jusqu'à son milieu, chaque
  // bout dans un œillet du support, de l'extérieur vers l'intérieur.
  const lz = -T2 / 2 - 0.055, ly = LUG - 0.01;
  const half = (s) => [
    W(s * 0.15, ly, lz), W(s * (XP - 0.14), ly, lz), W(s * XP, ly, lz),
    W(s * (XP + 0.07), ly - 0.03, lz - 0.05),
    [s * XP * 0.55, (W(0, ly, lz)[1] + FT5) / 2 - 0.06, (W(0, ly, lz)[2] + EYE[2]) / 2],
  ];
  put('4', S.group(chainAlong(api, [...half(-1), EYE, ...half(1).reverse()])), [0, 0.35, 0.2], 6);
  const b = binder(S);
  S.at(b, W(0, ly, lz));
  put('5', b, [0, 0.6, 0.2], 8);

  // Tiges en quinconce, par rangée à partir de la gauche, appuyées sur les
  // traverses (et non sur les côtés), pieds au sol.
  for (let k = 0; k < NQ.rows; k++) {
    const z = T2 / 2 + NQ.od / 2 + k * ROW;
    const yb = -((z - NQ.od / 2) * SIN + LIFT) / COS; // bas de la tige : son arête touche le sol
    for (let c = 0; c < NQ.cols; c++) {
      const rod = S.shell(NQ.od / 2, NQ.id / 2, NQ.len, rodTone(k, c), { seg: 14 });
      rod.rotation.x = -TILT;
      S.at(rod, W(-CLEAR / 2 + NQ.od / 2 + c * NQ.od + (k % 2 ? NQ.od / 2 : 0), yb + NQ.len / 2, z));
      put('2', rod, [0, 0, 1.2 + k * 0.05], 9, { seq: k, noLabel: k + c > 0 });
    }
  }

  // Chaîne de retenue : d'un crochet fermé à l'autre, devant les tiges, jamais
  // à moins de 5 pi du sol au centre.
  const zf = FRONT + 0.02, yh = HOOK - 0.02;
  const side = (s) => [W(s * XP, yh, T2 / 2 + 0.03), W(s * XP, yh - 0.03, zf * 0.55), W(s * (XP - 0.02), yh - 0.06, zf)];
  put('6', S.group(chainAlong(api, [...side(-1), W(0, yh - 0.16, zf + 0.004), ...side(1).reverse()], 'blue')), [0, 0, 1.9], 11);

  // Marques à 5 pi du sol sur les poteaux.
  for (const s of [-1, 1]) {
    const m = S.box(T2 + 0.003, 0.03, T2 + 0.003, 'white');
    m.rotation.x = -TILT;
    S.at(m, W(s * XP, (FT5 - LIFT) / COS, 0));
    put('7', m, [0, 0, 0], 12, { noLabel: s > 0 });
  }
  return { view: { dir: [-1.0, 0.55, -1.15], steps: STEPS, notes: NOTES } };
}

const CAM = {
  wide: { pos: [3.3, 2.3, 3.6], tgt: [0, 1.4, -0.3] },
  wall: { pos: [1.5, 1.9, 1.5], tgt: [0, 1.5, WALL_Z] },
  side: { pos: [4.4, 1.5, -0.3], tgt: [0, 1.4, -0.4] },
  anchor: { pos: [1.5, 3.2, 0.9], tgt: [0, 1.8, -0.7] },
  front: { pos: [2.5, 1.9, 3.2], tgt: [0, 1.5, 0.3] },
};

// Étapes de la procédure PRO-DD-ST-008 (l'indice est le numéro de l'étape).
export const STEPS = [
  { n: 0, cam: CAM.wide, page: 'P07', title: 'Avant de commencer', text: "La mine fore les trous de service pour les boulons à œil. Le travailleur respecte la quantité et l'angle d'empilage ; le superviseur fait reprendre toute installation non conforme." },
  { n: 1, cam: CAM.wide, page: 'P07', title: "Choisir l'endroit", text: 'Près du mur et loin de la ligne de tir des trous de forage (voir les exemples de positionnement).' },
  { n: 2, cam: CAM.wall, page: 'P08', title: 'Percer le trou au mur', text: 'Situer le centre du support et faire un trou de 18 po de profond avec la foreuse à percussion électrique, à ± 5 pi du plancher.' },
  { n: 3, cam: CAM.wall, page: 'P08', title: 'Insérer le boulon à œil', text: "Insérer le eye bolt, mais ne pas l'enfoncer jusqu'au fond du trou." },
  { n: 4, cam: CAM.wide, page: 'P08', title: 'Lever le support à deux', text: "À deux, soulever le support et positionner les pattes du haut pour qu'elles soient bien appuyées au mur." },
  { n: 5, cam: CAM.side, page: 'P08', title: "Vérifier l'angle", text: "S'assurer d'avoir un angle entre 75° et 80°." },
  { n: 6, cam: CAM.anchor, page: 'P08', title: 'Passer la chaîne dans le boulon à œil', text: "Passer une chaîne dans le eye bolt jusqu'à son milieu." },
  { n: 7, cam: CAM.anchor, page: 'P08', title: 'Passer la chaîne dans les œillets', text: "Passer chaque bout de chaîne dans l'œillet du support qui lui est destiné, de l'extérieur vers l'intérieur." },
  { n: 8, cam: CAM.anchor, page: 'P08', title: 'Tendre la chaîne', text: 'Relier les deux bouts avec un tendeur à cliquet de chaîne et serrer au maximum, ou avec un tendeur de type « bear trap ».' },
  { n: 9, cam: CAM.wide, page: 'P09', title: 'Placer les tiges en quinconce', text: 'Par rangée, à partir de la gauche.' },
  { n: 10, cam: CAM.side, page: 'P09', title: 'Appuyer les tiges au fond', text: 'Sur la barre transversale du fond, et non sur les côtés.' },
  { n: 11, cam: CAM.front, page: 'P09', title: 'Placer la chaîne de retenue', text: 'Accrochée solidement dans les 2 crochets fermés de chaque côté du support.' },
  { n: 12, cam: CAM.front, page: 'P09', title: 'Ajuster la chaîne', text: "Les tiges ne doivent pas pouvoir dépasser 80° si elles chutent vers un travailleur. Crochets entre 66 et 72 po du sol : la chaîne n'est jamais à moins de 5 pi du sol au centre." },
  { n: 13, cam: CAM.front, page: 'P09', title: 'Chaîne en tout temps', text: "La chaîne de retenue est utilisée en tout temps, sauf pendant l'ajout et le retrait des tiges en continu." },
  { n: 14, cam: CAM.front, page: 'P10', title: 'Prendre les tiges', text: 'La graisse peut rendre les tiges difficiles à prendre : un tournevis plat aide à les séparer.' },
  { n: 15, cam: CAM.wide, page: 'P10', title: 'Capacité maximale', text: 'HQ : 108 tiges (324 m). NQ : 184 tiges (552 m). BQ : 240 tiges (720 m).' },
];

const NOTES = [
  { steps: [2, 3], pos: [0, FT5 + 0.25, WALL_Z], text: 'Trou de 18 po, à ± 5 pi du plancher' },
  { steps: [4], pos: [0, 2.75, WALL_Z + 0.1], text: 'Pattes du haut bien appuyées au mur' },
  { steps: [5], pos: [XP, 1.2, -0.1], text: 'Entre 75° et 80° (ici 78°)' },
  { steps: [7], pos: [XP, W(0, LUG, 0)[1] + 0.25, W(0, LUG, -0.1)[2]], text: "Œillet : de l'extérieur vers l'intérieur" },
  { steps: [8], pos: [0, W(0, LUG, 0)[1] + 0.35, W(0, LUG, -0.1)[2]], text: 'Tendeur serré au maximum' },
  { steps: [9], pos: [-XP, 3.1, 0], text: '23 tiges par rangée, 8 rangées : 184 tiges NQ' },
  { steps: [11, 12], pos: [XP, 69 * IN + 0.2, 0.2], text: 'Crochets fermés : 66 à 72 po du sol' },
  { steps: [12], pos: [0, FT5 - 0.05, 0.75], text: 'Jamais à moins de 5 pi du sol au centre' },
];

export default { P01, P02 };

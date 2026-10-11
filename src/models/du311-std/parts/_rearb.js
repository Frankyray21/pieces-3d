// Cotes et fonctions communes du lot « installation du surpresseur et air »
// du DU311 sur roues (P430 et ses sous-assemblages P432 à P486).
// Fichier partagé (préfixe « _ ») : pas un assemblage, jamais inscrit dans
// parts/index.js.
//
// Raccords, tuyauterie NPT et visserie : bibliothèque ACC du TVK
// (../../du311/parts/_moteur_surpresseur.js), pièces construites le long de
// +Y local puis orientées par ACC.orient(api, obj, pos, y, x).

import { ACC, LR, IN } from '../../du311/parts/_moteur_surpresseur.js';

export { ACC, LR, IN };
export const I = (v) => v * IN;

// ---------------------------------------------------------------- implantation dans P430
// Repère machine (../layout.js) : X vers l'avant, Y haut, Z à droite. Pont
// arrière : dessus du châssis à y = 1.0, capot du surpresseur de x = −4.38 à
// −3.6, côtés à z = ±0.96, toit à 1.95 ; enrouleur (REEL, x = −3.08) libre.
// Chaque sous-assemblage est posé par P430 en [pos, rot] (rot : angles
// d'Euler XYZ, radians) ; ses cotes locales sont décrites en tête de son
// fichier.
export const RB = {
  deckY: 1.0,
  // P432 — module surpresseur : repère du bloc Le Roi (LR) ; vilebrequin
  // selon Z machine sur la ligne (DRIVE.x, DRIVE.yComp) de ../reardeck.js,
  // poulie (LR x = 0.215) dans le plan des courroies z = DRIVE.z = −0.55.
  // Rotation de +90° autour de Y : LR +X → −Z, LR +Z → +X.
  boost: { pos: [-3.95, 1.36, -0.335], rot: [0, Math.PI / 2, 0] },
  // P482 — filtre / séparateur d'admission : ligne 3 po selon Z, à l'arrière
  // (local +X → machine +Z, local +Z → machine −X).
  afw: { pos: [-4.19, 1.7, 0.2], rot: [0, -Math.PI / 2, 0] },
  // P466 — refroidisseur final contre la paroi avant du capot, piquages
  // tournés vers l'arrière (local +Z → −X, local +X → +Z).
  ac: { pos: [-3.72, 1.19, 0.47], rot: [0, -Math.PI / 2, 0] },
  // P476 — collecteur de refoulement couché selon X, sous la croix d'aspiration.
  man: { pos: [-3.98, 1.13, 0.1], rot: [0, 0, 0] },
  // P462 — dérivation (ligne d'air) et électrovanne d'eau.
  byp: { pos: [-4.0, 1.42, 0.62], rot: [0, 0, 0] },
  bypW: { pos: [-3.93, 1.18, 0.8], rot: [0, -Math.PI / 2, 0] },
  // P470 — commande du compresseur, au-dessus du refroidisseur.
  ctl: { pos: [-3.66, 1.62, 0.45], rot: [0, -Math.PI / 2, 0] },
  // P472 — panneau de manomètres arrière, cadrans vers −X.
  gp: { pos: [-4.33, 1.5, -0.68], rot: [0, -Math.PI / 2, 0] },
  // P474 — arrivée d'eau, au pied du refroidisseur côté −Z.
  wi: { pos: [-3.86, 1.2, 0.17], rot: [0, -Math.PI / 2, 0] },
  // P478 — purge automatique, sous la vanne papillon d'admission.
  adv: { pos: [-4.3, 1.12, 0.54], rot: [0, -Math.PI / 2, 0] },
  // P480 — pressostat différentiel du filtre.
  pds: { pos: [-4.04, 1.86, 0.36], rot: [0, -Math.PI / 2, 0] },
};

// ---------------------------------------------------------------- géométrie
/** Transformation d'un point local → parent pour un placement [pos, rot]. */
export function xf(api, { pos, rot = [0, 0, 0] }) {
  const { THREE } = api;
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot));
  const p = new THREE.Vector3(...pos);
  return {
    pt: (v) => new THREE.Vector3(...v).applyQuaternion(q).add(p).toArray(),
    dir: (v) => new THREE.Vector3(...v).applyQuaternion(q).toArray(),
  };
}

/** Pose un objet construit en repère local selon un placement [pos, rot]. */
export function put(S, obj, { pos, rot = [0, 0, 0] }) {
  return S.at(S.group(obj), pos, rot);
}

export const add = (a, b, k = 1) => a.map((v, i) => v + b[i] * k);
export const sub3 = (a, b) => a.map((v, i) => v - b[i]);
export const norm3 = (a) => { const l = Math.hypot(...a) || 1; return a.map((v) => v / l); };
export const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** Vecteur unitaire perpendiculaire à n. */
export const perp3 = (n) => norm3(Math.abs(n[1]) < 0.9 ? cross3(n, [0, 1, 0]) : cross3(n, [1, 0, 0]));

/**
 * Points de passage d'un flexible de longueur len (m) entre deux embouts :
 * a, b (bout des cônes mâles qui le reçoivent), da, db (direction de sortie
 * de chaque embout, vers le flexible). Départs droits dans l'axe des
 * raccords, flèche vers sag (vecteur, défaut vers le bas) ajustée par
 * dichotomie pour retrouver la longueur.
 */
export function hosePath(api, a, da, b, db, len, { sag = [0, -1, 0], lead = 0.06 } = {}) {
  const { THREE } = api;
  const A1 = add(a, da, lead), B1 = add(b, db, lead);
  const mid = add(A1, sub3(B1, A1), 0.5);
  const make = (k) => [a, A1, add(mid, sag, k), B1, b];
  const L = (pts) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'centripetal').getLength();
  let lo = 0, hi = len;
  if (L(make(0)) >= len) return make(0);
  for (let i = 0; i < 30; i++) {
    const m = (lo + hi) / 2;
    if (L(make(m)) < len) lo = m; else hi = m;
  }
  return make((lo + hi) / 2);
}

// ---------------------------------------------------------------- appareillage
/**
 * Bobine d'électrovanne 24 V CC (carrée, surmoulée noire) sur son tube
 * culasse, axe +Y depuis y = 0 : écrou de bobine, plaque de raccordement et
 * connecteur DIN 43650 (forme A) sur la face +Z, presse-étoupe. Côté c (m).
 */
export function coil(S, c = 0.04, { mat = 'plastic' } = {}) {
  const h = c * 1.1;
  return S.group(
    S.merged([
      S.box(c, h, c, mat, { r: c * 0.08, pos: [0, h / 2, 0] }),
      S.box(c * 0.7, c * 0.75, c * 0.22, mat, { r: c * 0.04, pos: [0, h * 0.55, c / 2 + c * 0.11] }),
      S.box(c * 0.5, c * 0.5, c * 0.12, mat, { r: c * 0.04, pos: [0, h * 0.55, c / 2 + c * 0.27] }),
      S.cyl(c * 0.12, c * 0.18, mat, { axis: 'y', seg: 12, pos: [0, h * 0.55 - c * 0.42, c / 2 + c * 0.11] }),
    ], mat),
    S.merged([
      S.nut(c * 0.38, c * 0.14, 'zinc', { pos: [0, h + c * 0.07, 0] }),
      S.cyl(c * 0.04, c * 0.12, 'zinc', { seg: 8, pos: [0, h * 0.55, c / 2 + c * 0.39] }),
    ], 'zinc'),
  );
}

/**
 * Collier de tuyau à deux demi-coquilles moulées (type Stauff série lourde)
 * autour d'un tube de rayon r, axe Z, centré : plaque de dessus, deux vis CHC,
 * plaque à souder dessous (sous y = −r − hs).
 */
export function stauff(S, r, { w = null, mat = 'black' } = {}) {
  const t = Math.max(r * 0.75, 0.012), W = w ?? r * 2 + t * 2.4, d = Math.max(r * 1.0, 0.026);
  const hs = t;
  const halves = S.merged([
    S.box(W, t, d, mat, { r: 0.003, pos: [0, r + t / 2 - 0.002, 0] }),
    S.box(W, t, d, mat, { r: 0.003, pos: [0, -r - t / 2 + 0.002, 0] }),
    S.box(W - r * 2 - 0.004, r * 2, d, mat, { r: 0.002, pos: [0, 0, 0] }),
  ], mat);
  const top = S.box(W * 1.02, 0.004, d * 0.85, 'zinc', { pos: [0, r + t + 0.002, 0] });
  const weld = S.box(W * 1.05, 0.005, d * 1.05, 'zinc', { pos: [0, -r - hs - 0.0025, 0] });
  const xb = (W - r * 2) / 4 + r;
  const bolts = S.boltSet([[-xb, r + t + 0.004, 0], [xb, r + t + 0.004, 0]], Math.max(0.006, r * 0.3), r * 2 + t * 2.2, 'zinc', { head: 'socket', washer: false });
  return S.group(halves, S.merged([top, weld], 'zinc'), bolts);
}

/** Pattes et vis d'une platine : trous [x, z] de rayon rh pour plate(). */
export const holesOf = (pts, rh) => pts.map(([x, z]) => [x, z, rh]);

// ---------------------------------------------------------------- raccords complémentaires
// Profils repris de la bibliothèque ACC (non exportés là-bas) : six-pans,
// filet mâle NPT conique, embout mâle JIC 37°. Tailles par numéro de tiret.
const JIC = ACC.JIC, NPT = ACC.NPT;
const jic = (n) => JIC[n] || JIC[6];
const npt = (n) => NPT[n] || NPT[8];
export const hexProf = (af, y0, y1) => {
  const R = af / 2 / Math.cos(Math.PI / 6), c = Math.min(R * 0.12, (y1 - y0) * 0.25);
  return [[0, y0], [R - c, y0], [R, y0 + c * 0.6], [R, y1 - c * 0.6], [R - c, y1], [0, y1]];
};
/** Filet mâle NPT de y = 0 (épaulement) à y = −L (bout), axe −Y. */
export const nptMale = (S, n, L = I(npt(n)[1])) => {
  const r = I(npt(n)[0]) / 2, r0 = r - L / 32;
  return [[0, -L * 0.85], [r * 0.6, -L * 0.85], [r * 0.6, -L], ...S.thread(r0, -L, 0, { r1: r, pitch: I(n >= 24 ? 1 / 11.5 : n >= 12 ? 1 / 14 : 1 / 18), maxTurns: 6 })];
};
/** Embout mâle JIC le long de +Y depuis y0 (filet, cône 37°, alésage). */
export const jicMale = (n, y0) => {
  const T = I(jic(n)[0]), r = T / 2, L = T * 0.85;
  return [
    [r * 0.82, y0], [r * 0.82, y0 + L * 0.15], [r, y0 + L * 0.2], [r * 0.96, y0 + L * 0.3], [r, y0 + L * 0.4],
    [r * 0.96, y0 + L * 0.5], [r, y0 + L * 0.6], [r * 0.95, y0 + L * 0.68], [r * 0.95, y0 + L * 0.74],
    [r * 0.6, y0 + L], [r * 0.42, y0 + L], [r * 0.42, y0 + L * 0.8], [0, y0 + L * 0.8],
  ];
};
export const jicLen = (n) => I(jic(n)[0]) * 0.85;
export const pipeR = (n) => I(npt(n)[0]) / 2;
export const nptLen = (n) => I(npt(n)[1]);
/** Engagement d'un filet NPT mâle dans un taraudage (m). */
export const ENG = (n) => I(npt(n)[1]) * 0.75;

/** Bras femelle de raccord de tuyauterie, du centre (y = 0) à la face (y = A), taraudé. */
const femArm = (S, r, A, mat, seg = 24) => {
  const R = r * 1.28;
  return S.lathe([[0, 0], [R, 0], [R, A * 0.76], [R * 1.06, A * 0.84], [R * 1.06, A], [r * 0.98, A], [r * 0.98, A * 0.55], [0, A * 0.55]], mat, { seg });
};
/** Bras mâle (filet NPT) du centre à l'épaulement y = A, filet au-delà jusqu'à A + Lt. */
const maleArm = (S, n, A, mat, seg = 20) => {
  const r = pipeR(n), R = r * 1.28, Lt = nptLen(n);
  return S.group(
    S.lathe([[0, 0], [R, 0], [R, A * 0.8], [r * 1.02, A], [0, A]], mat, { seg }),
    S.at(S.lathe(nptMale(S, n, Lt), mat, { seg }), [0, A, 0], [Math.PI, 0, 0]),
  );
};
export const armA = (n) => pipeR(n) * 1.85 + I(0.12);

/**
 * Coude 90° de tuyauterie à une branche mâle (street elbow FNPT-MNPT) :
 * centre à l'origine, branche femelle vers +X (face à userData.a), branche
 * mâle vers −Y (épaulement à −a, bout du filet à −userData.male).
 */
export function streetElbow(S, n, mat = 'darkSteel') {
  const A = armA(n), r = pipeR(n);
  const a1 = S.at(maleArm(S, n, A, mat), [0, 0, 0], [Math.PI, 0, 0]);
  const a2 = S.at(femArm(S, r, A, mat), [0, 0, 0], [0, 0, -Math.PI / 2]);
  const o = S.group(S.merged([a1, a2, S.ball(r * 1.3, mat)], mat));
  o.userData = { a: A, male: A + nptLen(n) };
  return o;
}

/**
 * Té de passage à une extrémité mâle (run tee MNPT-FNPT/FNPT) : centre à
 * l'origine, passage selon Y — mâle vers −Y, femelle vers +Y —, branche
 * femelle vers +X. maleBranch : branche mâle, passage femelle (FA01201).
 */
export function runTee(S, n, { mat = 'darkSteel', maleBranch = false } = {}) {
  const A = armA(n), r = pipeR(n);
  const list = [
    S.at(maleBranch ? femArm(S, r, A, mat) : maleArm(S, n, A, mat), [0, 0, 0], [Math.PI, 0, 0]),
    femArm(S, r, A, mat),
    S.at(maleBranch ? maleArm(S, n, A, mat) : femArm(S, r, A, mat), [0, 0, 0], [0, 0, -Math.PI / 2]),
    S.ball(r * 1.32, mat),
  ];
  const o = S.group(S.merged(list, mat));
  o.userData = { a: A, male: A + nptLen(n) };
  return o;
}

/** Coude 90° mâle-mâle (FA01205) : centre à l'origine, branches mâles vers −Y et +X. */
export function maleElbow(S, n, mat = 'zinc') {
  const A = armA(n) * 0.8, r = pipeR(n);
  const o = S.group(S.merged([
    S.at(maleArm(S, n, A, mat), [0, 0, 0], [Math.PI, 0, 0]),
    S.at(maleArm(S, n, A, mat), [0, 0, 0], [0, 0, -Math.PI / 2]),
    S.ball(r * 1.3, mat),
  ], mat));
  o.userData = { a: A, male: A + nptLen(n) };
  return o;
}

/** Manchon réducteur femelle-femelle (bell reducer) n → m : grande face à y = 0 (ouverture −Y), petite face à y = L. */
export function bellReducer(S, n, m, mat = 'darkSteel') {
  const r1 = pipeR(n), r2 = pipeR(m), L = r1 * 1.6 + I(0.6);
  const o = S.group(S.lathe([[r1 * 0.98, 0], [r1 * 1.3, 0], [r1 * 1.3, L * 0.45], [r2 * 1.36, L * 0.78], [r2 * 1.36, L], [r2 * 0.98, L], [r2 * 0.98, L * 0.6], [r1 * 0.98, L * 0.45], [r1 * 0.98, 0]], mat, { seg: 28 }));
  o.userData.L = L;
  return o;
}

/** Mamelon six-pans NPT (hex nipple, FA01207) n × m : six-pans centré à l'origine, filet n vers −Y, m vers +Y. */
export function hexNipple(S, n, m = n, mat = 'zinc') {
  const af = Math.max(pipeR(n), pipeR(m)) * 2.3, hh = af * 0.42;
  const o = S.group(S.merged([
    S.lathe(hexProf(af, -hh / 2, hh / 2), mat, { seg: 6 }),
    S.at(S.lathe(nptMale(S, n), mat, { seg: 16 }), [0, -hh / 2, 0]),
    S.at(S.lathe(nptMale(S, m), mat, { seg: 16 }), [0, hh / 2, 0], [Math.PI, 0, 0]),
  ], mat));
  o.userData = { hh, ya: hh / 2 + nptLen(n), yb: hh / 2 + nptLen(m) };
  return o;
}

/** Adaptateur droit FNPT n → MJIC m (FA01039) : face femelle à y = 0 (ouverture −Y), cône vers +Y ; userData.tip. */
export function femJic(S, n, m, mat = 'zinc') {
  const rn = pipeR(n), af = Math.max(rn * 2.5, I(jic(m)[1])), L = nptLen(n) * 1.15;
  const hp = hexProf(af, 0, L);
  const o = S.group(S.merged([
    S.lathe([[rn * 0.98, 0], ...hp.slice(1, -1), [rn * 0.98, L], [rn * 0.98, 0]], mat, { seg: 6 }),
    S.lathe(jicMale(m, L), mat, { seg: 14 }),
  ], mat));
  o.userData.tip = L + jicLen(m);
  return o;
}

/**
 * Réduction JIC à écrou tournant FJIC n → MJIC m (FA01006) : écrou femelle
 * à l'origine (ouverture −Y, siège sur le cône qui le reçoit), cône mâle m
 * vers +Y ; userData.tip.
 */
export function jicReducer(S, n, m, mat = 'zinc') {
  const T = I(jic(n)[0]), h = T * 0.75, af = I(jic(n)[2]), afb = I(jic(m)[1]);
  const y0 = -T * 0.35, y1 = y0 + h, y2 = y1 + afb * 0.4;
  const hp = hexProf(af, y0, y1);
  const o = S.group(S.merged([
    S.lathe([[T * 0.48, y0], ...hp.slice(1, -1), [T * 0.3, y1], [T * 0.48, y0]], mat, { seg: 6 }),
    S.lathe(hexProf(afb, y1, y2), mat, { seg: 6 }),
    S.lathe(jicMale(m, y2), mat, { seg: 14 }),
  ], mat));
  o.userData.tip = y2 + jicLen(m);
  return o;
}

/** Bouchon NPT n : six-pans creux affleurant (FA01215) ou tête carrée (square). Épaulement à y = 0, filet vers −Y. */
export function nptPlug(S, n, { kind = 'countersunk', mat = 'zinc' } = {}) {
  const r = pipeR(n);
  if (kind === 'square') {
    const s = r * 1.15, h = r * 1.0;
    return S.group(S.merged([
      S.lathe(nptMale(S, n), mat, { seg: 16 }),
      S.lathe([[0, 0], [r * 1.12, 0], [r * 1.12, r * 0.25], [0, r * 0.25]], mat, { seg: 20 }),
      S.box(s, h, s, mat, { r: s * 0.06, pos: [0, r * 0.25 + h / 2, 0] }),
    ], mat));
  }
  // Bouchon conique affleurant : seule la face dépasse, empreinte six-pans.
  return S.group(
    S.merged([S.lathe(nptMale(S, n), mat, { seg: 16 }), S.lathe([[r * 0.42, 0], [r * 0.98, 0], [r * 0.98, r * 0.1], [r * 0.42, r * 0.1]], mat, { seg: 20 })], mat),
    S.lathe(hexProf(r * 0.72, -r * 0.3, r * 0.04), 'blackOxide', { seg: 6 }),
  );
}

/**
 * Sonde de température −18 à 260 °C (CX035806) : filet 1/2 NPT sous y = 0
 * (gaine plongeante vers −Y), six-pans 7/8 po, col, tête de raccordement
 * ronde en alu (couvercle vissé, deux vis), presse-étoupe de câble vers +X.
 */
export function tempTransducer(S) {
  const gland = S.group(
    S.lathe(hexProf(0.016, 0, 0.008), 'plastic', { seg: 6 }),
    S.lathe([[0, 0.008], [0.0075, 0.008], [0.006, 0.018], [0, 0.019]], 'plastic', { seg: 12 }),
  );
  return S.group(
    S.merged([
      S.lathe(nptMale(S, 8), 'steel', { seg: 16 }),
      S.lathe([[0, -0.06], [0.0035, -0.06], [0.0035, -0.012], [0, -0.012]], 'steel', { seg: 10 }),
      S.lathe(hexProf(I(0.875), 0, 0.012), 'steel', { seg: 6 }),
      S.lathe([[0, 0.012], [0.008, 0.012], [0.008, 0.045], [0, 0.045]], 'steel', { seg: 16 }),
      S.cyl(0.003, 0.004, 'steel', { seg: 8, pos: [0.018, 0.086, 0] }),
      S.cyl(0.003, 0.004, 'steel', { seg: 8, pos: [-0.018, 0.086, 0] }),
    ], 'steel'),
    S.merged([
      S.lathe([[0, 0.045], [0.026, 0.045], [0.03, 0.05], [0.03, 0.07], [0.028, 0.072], [0, 0.072]], 'castAlu', { seg: 28 }),
      S.lathe([[0, 0.072], [0.029, 0.072], [0.029, 0.08], [0.025, 0.085], [0, 0.086]], 'castAlu', { seg: 28 }),
    ], 'castAlu'),
    S.merged([S.at(gland, [0.029, 0.06, 0], [0, 0, -Math.PI / 2])], 'plastic'),
  );
}

/**
 * Clapet anti-retour en ligne taraudé NPT n aux deux bouts : six-pans aux
 * extrémités, renflement central, flèche de sens coulée vers +Y. Centré, axe
 * Y, longueur L.
 */
export function checkValve(S, n, L, { mat = 'steel' } = {}) {
  const r = pipeR(n), af = r * 2.45, R = r * 1.55, he = L * 0.18;
  const h0 = hexProf(af, -L / 2, -L / 2 + he), h1 = hexProf(af, L / 2 - he, L / 2);
  const o = S.group(S.merged([
    S.lathe([[r * 0.98, -L / 2], ...h0.slice(1, -1), [r * 0.98, -L / 2 + he], [r * 0.98, -L / 2]], mat, { seg: 6 }),
    S.lathe([[r * 0.98, L / 2 - he], ...h1.slice(1, -1), [r * 0.98, L / 2], [r * 0.98, L / 2 - he]], mat, { seg: 6 }),
    S.lathe([[0, -L / 2 + he], [R * 0.85, -L / 2 + he], [R, -L / 2 + he + L * 0.08], [R, L / 2 - he - L * 0.08], [R * 0.85, L / 2 - he], [0, L / 2 - he]], mat, { seg: 28 }),
    S.box(R * 0.18, L * 0.3, R * 0.08, mat, { pos: [0, 0, R * 0.98] }),
    S.at(S.cyl(R * 0.2, R * 0.08, mat, { r2: 0.0001, seg: 3 }), [0, L * 0.19, R * 0.98]),
  ], mat));
  o.userData.L = L;
  return o;
}

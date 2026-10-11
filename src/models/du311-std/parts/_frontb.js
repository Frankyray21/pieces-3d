// Fonctions communes du lot « pont avant B » du DU311 sur roues (vannes,
// collecteurs, filtres et instruments du châssis avant : P348 à P410) :
// emplacements dans le repère machine, raccords SAE complémentaires de ceux
// du TVK (coude ORB 45°, tés à écrou tournant, réduction, raccords NPT 1/8 de
// graissage), quincaillerie en pouces, distributeurs proportionnels PVG 32
// détaillés pièce par pièce (corps de section de base, PC et LS-PC, couvercle
// d'entrée, plaques d'extrémité, tiroirs, embases de poignée, électro-
// commandes proportionnelles et tout-ou-rien à connecteur AMP, tirants),
// capteur de pression, clapet navette 1/4 NPT, bloc collecteur CP000407 et
// adaptateurs d'aspiration à bride code 61. Fichier préfixé « _ » : pas un
// assemblage. Cotes en mètres (pouces convertis par IN).
import { IN, SAE, NPT, orbAdapter, orbElbow, nptFitting, orient, orientPoint, capScrew, socketPlug, orbPlug as hexPlugTVK, j518, flangeHead, splitFlange } from '../../du311/parts/_chassis.js';
import { hexPrism, L as Lin, splitWasher, nordLock, flatWasher, hexNut } from '../../du311/parts/_avance_b.js';
import { body } from '../layout.js';

export { IN, SAE, NPT, orbAdapter, orbElbow, nptFitting, orient, orientPoint, capScrew, socketPlug, j518, splitFlange, splitWasher, nordLock, flatWasher, hexNut };

// ============================================================================
// Emplacements (repère machine de layout.js : origine au sol sous
// l'articulation, X vers l'avant, Y vers le haut, Z vers la droite).
// Côté droit du châssis avant : face extérieure du flanc droit à z = 0.495
// (flanc M.frameZ = 0.48, tôle de 30 mm) ; tuyau d'air de la glissière le long
// du flanc (y 0.85 → 0.91, z 0.50 → 0.56) et vérin de direction (x < 0.5,
// y ≈ 0.72) à éviter. Les supports (consoles, tablettes, platine des bancs,
// tôle du tableau de manomètres) font partie du porteur Pegasus (P208 rep. 7)
// et ne sont pas dessinés ici.
// ============================================================================
export const FB = {
  side: 0.495, // face extérieure du flanc droit du châssis avant
  // Bancs PVG 32 : tiroirs verticaux (poignées en haut, électrocommandes en
  // bas), faces des orifices vers l'avant (+X), face de fixation (dos) sur la
  // platine support à x = bank.x, empilage selon +Z (plaque d'extrémité à −Z,
  // couvercle d'entrée à +Z), axe des corps à y = bank.y.
  bank: { x: 0.74, y: 1.5, z0: { drill: -0.7, feed: -0.12, setup: 0.17 } },
  gauge: { x: 0.97, top: 1.72, z: 0.93 }, // tableau de manomètres : tôle (P208), face des cadrans +Z
  pressure: [0.43, 0.92, 0.5768], // collecteur de pression P364 (centre du dessous du bloc)
  ret: [1.0, 0.5, 0.5768], // collecteur de retour P366
  filters: [[0.62, 0.945, 0.6], [0.86, 0.945, 0.6]], // filtres HP (repère P264 = TVK P352)
  transducers: [0.734, 0.78, 0.495], // bloc des capteurs P382 (centre du dos de la barre)
  lsValve: [0.56, 0.555, 0.495], // électrovanne LS P362 (centre du dos du bloc)
  shuttle: [0.665, 0.56, 0.495], // clapet navette P408 (centre du dos du bloc)
  airValve: [1.4, 0.9561, 0.551], // électrovanne d'air P354 (centre du corps) dans P352
  tank: { x: 0.64, z: -0.22, y: [1.085, 1.205] }, // sorties du réservoir hydraulique (face avant)
  // Orifices des pompes du groupe P334 (estimés : pompes 100 cm³ à x 1.15 et
  // 74 cm³ à x 1.335 sur l'axe y 0.74, z 0, flancs à z −0.10 et −0.085) :
  pumps: {
    s1: { p: [1.15, 0.74, -0.1], d: [0, 0, -1] }, // aspiration 2 1/2 po code 61 (100 cm³)
    s2: { p: [1.335, 0.74, -0.085], d: [0, 0, -1] }, // aspiration 2 po code 61 (74 cm³)
    d1: { p: [1.12, 0.84, 0.04], d: [0, 1, 0] }, // drain de carter -12 (100 cm³)
    d2: { p: [1.31, 0.825, 0.035], d: [0, 1, 0] }, // drain de carter -10 (74 cm³)
    x1: { p: [1.2, 0.68, 0.1], d: [0, 0, 1] }, // pilotage LS -04 (100 cm³)
    x2: { p: [1.38, 0.69, 0.085], d: [0, 0, 1] }, // pilotage LS -04 (74 cm³)
  },
};

/** Objet du châssis avant (corps « front » de la simulation). */
export const front = (o) => body('front', o);

// ============================================================================
// Quincaillerie (pouces)
// ============================================================================
const AF = { 0.25: 0.4375, 0.3125: 0.5, 0.375: 0.5625, 0.4375: 0.625, 0.5: 0.75, 0.625: 0.9375 };
const af = (d) => AF[d] ?? d * 1.5;

/**
 * Vis H (HHCS) d × len (po) : tête vers +Y, dessous de tête à y = 0, tige
 * vers −Y, filet jusqu'à la tête si full (« FULL THR. »). Zinguée.
 */
export function hhcs(api, d, len, { full = false, mat = 'zinc' } = {}) {
  const { S, THREE } = api;
  const r = d / 2, a = af(d), hh = d * 0.62;
  const th = full ? len - d * 0.08 : Math.min(len, Math.max(d * 2 + 0.25, len * 0.5));
  return S.merged([
    hexPrism(S, THREE, a, hh, 0.02 * d, 0, mat),
    Lin(S, [[0, 0], [a * 0.48, 0], [a * 0.48, 0.03 * d], [0, 0.03 * d]], mat, 18),
    Lin(S, [[0, -len], [r * 0.8, -len], ...S.thread(r, -len + r * 0.2, -len + th, { pitch: d * 0.15, maxTurns: full ? 9 : 6 }), [r, 0], [0, 0]], mat, 12),
  ], mat);
}

/**
 * Vis + rondelle posées : face d'appui en pos, axe de la vis selon dir (tête
 * du côté +dir, tige vers −dir). washer : 'split' (Grower), 'nl' (Nord-Lock),
 * 'flat' ou null. Retourne { bolt, washer } (objets orientés).
 */
export function boltAt(api, d, len, pos, dir, { washer = 'split', full = false } = {}) {
  const { S, THREE } = api;
  let w = null, t = 0;
  if (washer === 'split') { w = splitWasher(S, THREE, d); t = Math.max(0.06, d * 0.25) * IN; }
  else if (washer === 'nl') { w = nordLock(S, THREE, d); t = 2 * Math.max(0.05, d * 0.11) * IN; }
  else if (washer === 'flat') { w = flatWasher(S, THREE, d); t = Math.max(0.065, d * 0.13) * IN; }
  const n = new THREE.Vector3(...dir).normalize();
  const p1 = new THREE.Vector3(...pos).addScaledVector(n, t).toArray();
  return {
    washer: w ? orient(api, w, pos, dir) : null,
    bolt: orient(api, hhcs(api, d, len, { full }), p1, dir),
  };
}

/** Écrou H (d po) posé sur sa face d'appui en pos, vers +dir. */
export function nutAt(api, d, pos, dir) {
  return orient(api, hexNut(api.S, api.THREE, d), pos, dir);
}

// ============================================================================
// Raccords SAE complémentaires (convention TVK : origine au centre de la
// face de l'orifice, +Y sortant ; pour un raccord à écrou tournant, origine au
// bout du nez mâle qu'il coiffe, +Y dans le prolongement de ce nez).
// ============================================================================
// Lamages des orifices SAE J1926 (Ø en po) par taille.
export const SPOT = { 2: 0.75, 4: 0.875, 5: 0.938, 6: 1.0, 8: 1.188, 10: 1.375, 12: 1.625, 16: 1.938, 20: 2.188 };
const rt = (dash) => (SAE[dash].t * IN) / 2;

/** Profil de nez mâle JIC 37° de y0 à y0 + len (rayon de filet r), fermé sur l'axe. */
function jicNose(S, r, y0, len, base = 0.85) {
  const yc = y0 + len - r * 0.55;
  return [[0, y0], [r * base, y0], [r * base, y0 + 0.0025],
    ...S.thread(r, y0 + 0.0025, yc, { pitch: r * 0.22, maxTurns: 6, chamferBottom: false }),
    [r * 0.92, yc + r * 0.05], [r * 0.62, y0 + len], [r * 0.42, y0 + len], [r * 0.42, y0 + len - 0.002], [0, y0 + len - 0.002]];
}

/** Lamage usiné (anneau d'acier très mince) d'un orifice SAE, posé sur la face (pos, dir). */
export function spotFace(api, dash, pos, dir, { npt = false } = {}) {
  const { S } = api;
  const ro = npt ? (NPT[dash] * IN) * 0.8 : (SPOT[dash] * IN) / 2;
  const ri = npt ? (NPT[dash] * IN) / 2 : rt(dash);
  return orient(api, S.lathe([[ri, 0], [ro, 0], [ro, 0.0005], [ri, 0.0005], [ri, 0]], 'steel', { seg: 24 }), pos, dir);
}

/** Coude ORB → JIC à 45° (FA01051) : nez incliné de +Y vers +Z. Retourne { obj, out, dir }. */
export function orbElbow45(api, orb, jic = orb, material = 'zinc') {
  const { S, THREE } = api;
  const a = SAE[orb], b = SAE[jic];
  const rj = rt(jic), ro = rt(orb);
  const afa = a.hex * IN, hh = afa * 0.36;
  const s = Math.max(a.hex, b.hex) * IN * 0.78;
  const yb = hh + 0.0025 + s * 0.55;
  const len = rj * 2.4;
  const dir = new THREE.Vector3(0, Math.SQRT1_2, Math.SQRT1_2);
  const c = new THREE.Vector3(0, yb, 0);
  const nose = S.lathe(jicNose(S, rj, 0, len), material, { seg: 16 });
  const p0 = c.clone().addScaledVector(dir, s * 0.55);
  nose.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  nose.position.copy(p0);
  const parts = [
    S.lathe([[0, -ro * 1.5], [ro * 0.95, -ro * 1.5], [ro, -ro * 1.3], [ro, 0], [0, 0]], material, { seg: 14 }),
    S.cyl(afa * 0.5, 0.0012, material, { seg: 18, pos: [0, 0.0006, 0] }),
    S.nut(afa, hh, material, { pos: [0, 0.0012 + hh / 2, 0] }),
    S.cyl(ro * 0.95, yb - hh, material, { seg: 16, pos: [0, hh + (yb - hh) / 2, 0] }),
    S.ball(s * 0.5, material, { pos: c.toArray() }),
    S.rod(c.toArray(), p0.toArray(), s * 0.46, material, 18),
    nose,
  ];
  const g = S.group(S.merged(parts, material), S.torus(ro * 1.05, ro * 0.08, 'rubber', { pos: [0, 0.0005, 0] }));
  return { obj: g, out: p0.clone().addScaledVector(dir, len).toArray(), dir: dir.toArray() };
}

/** Écrou tournant JIC femelle (six-pans) de y0 à y0 + h. */
function swivelNut(S, dash, y0, material) {
  const b = SAE[dash];
  const a = (b.hex + 0.0625) * IN, h = b.t * IN * 0.75;
  return { obj: S.nut(a, h, material, { pos: [0, y0 + h / 2, 0] }), h, a };
}

/**
 * Té à écrou tournant sur le passage (FA01011, SFJIC-MJIC-MJIC) : écrou
 * coiffant le nez mâle (bout à l'origine), corps cubique, passage mâle selon
 * +Y, branche mâle selon +Z. Retourne { obj, run, branch } (bouts des nez).
 */
export function swivelRunTee(api, dash, material = 'zinc') {
  const { S } = api;
  const b = SAE[dash];
  const r = rt(dash);
  const nut0 = -b.t * IN * 0.75 * 0.6;
  const nut = swivelNut(S, dash, nut0, material);
  const s = b.hex * IN * 0.92;
  const yc = nut0 + nut.h + 0.002 + s / 2;
  const len = r * 2.4;
  const parts = [
    nut.obj,
    S.cyl(r * 0.9, 0.004, material, { seg: 16, pos: [0, nut0 + nut.h + 0.001, 0] }),
    S.box(s, s, s, material, { r: s * 0.16, pos: [0, yc, 0] }),
    S.lathe(jicNose(S, r, yc + s / 2, len), material, { seg: 16 }),
    S.at(S.lathe(jicNose(S, r, 0, len), material, { seg: 16 }), [0, yc, s / 2], [Math.PI / 2, 0, 0]),
  ];
  return { obj: S.merged(parts, material), run: [0, yc + s / 2 + len, 0], branch: [0, yc, s / 2 + len] };
}

/** Réduction FJIC → MJIC (FA01006) : écrou tournant (from), six-pans, nez mâle (to) selon +Y. */
export function jicReducer(api, from, to, material = 'zinc') {
  const { S } = api;
  const nut0 = -SAE[from].t * IN * 0.75 * 0.6;
  const nut = swivelNut(S, from, nut0, material);
  const hx = SAE[to].hex * IN, hh = hx * 0.45;
  const y1 = nut0 + nut.h + 0.002;
  const r = rt(to), len = r * 2.6;
  const parts = [
    nut.obj,
    S.cyl(rt(from) * 0.7, 0.003, material, { seg: 16, pos: [0, y1 - 0.001, 0] }),
    S.nut(hx, hh, material, { pos: [0, y1 + hh / 2, 0] }),
    S.lathe(jicNose(S, r, y1 + hh, len), material, { seg: 16 }),
  ];
  return { obj: S.merged(parts, material), tip: [0, y1 + hh + len, 0] };
}

/**
 * Coude 90° FNPT → MJIC (FA01036) : manchon taraudé NPT femelle (bouche à
 * l'origine, la queue mâle qu'il reçoit entre selon −Y), six-pans, corps
 * coudé, nez JIC selon +Z. Retourne { obj, out }.
 */
export function fnptElbow(api, npt, jic, material = 'zinc') {
  const { S } = api;
  const rn = (NPT[npt] * IN) / 2;
  const a = Math.max(SAE[jic].hex * IN, rn * 2.3), h = a * 0.7;
  const s = a * 0.82;
  const yb = h + s * 0.48;
  const r = rt(jic), len = r * 2.4;
  const parts = [
    // Six-pans percé (alésage taraudé visible), corps, nez.
    S.lathe([[rn * 0.92, h], [rn * 0.92, 0], [rn * 1.25, 0], [rn * 1.25, 0.001], [rn * 0.92, 0.001]], material, { seg: 18 }),
    S.nut(a, h, material, { pos: [0, h / 2, 0] }),
    S.box(s, s, s, material, { r: s * 0.28, pos: [0, yb, 0] }),
    S.at(S.lathe(jicNose(S, r, 0, len), material, { seg: 16 }), [0, yb, s * 0.46], [Math.PI / 2, 0, 0]),
  ];
  return { obj: S.merged(parts, material), out: [0, yb, s * 0.46 + len] };
}

/** Bouchon ORB à tête six-pans (FA01279, CP…) : tête de y = 0 vers +Y, joint torique. */
export function orbPlugHex(api, dash, material = 'zinc') {
  return hexPlugTVK(api, SAE[dash].hex * IN * 0.92, material);
}

/** Bouchon ORB affleurant à six-pans creux (« countersunk », FA01280). */
export function orbPlugFlush(api, dash, material = 'zinc') {
  return socketPlug(api, rt(dash) * 1.18, material);
}

// ---------------------------------------------------------- graissage NPT 1/8
const R18 = (NPT[2] * IN) / 2; // 1/8 NPT

/** Graisseur droit 1/8 NPT (CP004817) : queue conique, six-pans 7/16, tête à bille, selon +Y. */
export function greaseNipple18(api, material = 'brass') {
  const { S, THREE } = api;
  return S.merged([
    S.lathe([[0, -0.009], ...S.thread(R18 * 0.94, -0.009, 0, { r1: R18, pitch: 0.0011, maxTurns: 6 }), [0, 0]], material, { seg: 12 }),
    hexPrism(S, THREE, 7 / 16, 0.22, 0, 0, material),
    S.lathe([[0, 0.0056], [0.0035, 0.0056], [0.0035, 0.0095], [0.0052, 0.0115], [0.0052, 0.0145], [0.0042, 0.0165], [0.0018, 0.0172], [0, 0.0172]], material, { seg: 14 }),
  ], material);
}

/** Raccord droit à écrou tournant FNPT → MNPT 1/8 (FA01220) selon +Y ; retourne { obj, tip }. */
export function swivelStraight18(api, material = 'zinc') {
  const { S, THREE } = api;
  return {
    obj: S.merged([
      S.lathe([[0, -0.009], ...S.thread(R18 * 0.94, -0.009, 0, { r1: R18, pitch: 0.0011, maxTurns: 6 }), [0, 0]], material, { seg: 12 }),
      hexPrism(S, THREE, 7 / 16, 0.24, 0, 0, material),
      S.cyl(0.004, 0.004, material, { seg: 12, pos: [0, 0.0081, 0] }),
      hexPrism(S, THREE, 0.5, 0.3, 0.4, 0.13, material),
    ], material),
    tip: [0, 0.7 * IN, 0],
  };
}

/** Coude 90° à écrou tournant FNPT → MNPT 1/8 (FA01217) : queue selon −Y, écrou selon +Z ; retourne { obj, out }. */
export function swivelElbow18(api, material = 'zinc') {
  const { S, THREE } = api;
  const s = 0.0105, yb = 0.0062 + s / 2;
  const nut = hexPrism(S, THREE, 0.5, 0.3, 0, 0.13, material);
  nut.rotation.x = Math.PI / 2;
  nut.position.set(0, yb, s / 2 + 0.002);
  return {
    obj: S.merged([
      S.lathe([[0, -0.009], ...S.thread(R18 * 0.94, -0.009, 0, { r1: R18, pitch: 0.0011, maxTurns: 6 }), [0, 0]], material, { seg: 12 }),
      hexPrism(S, THREE, 7 / 16, 0.2, 0, 0, material),
      S.box(s, s, s, material, { r: 0.003, pos: [0, yb, 0] }),
      S.cyl(0.004, 0.003, material, { axis: 'z', seg: 12, pos: [0, yb, s / 2 + 0.001] }),
      nut,
    ], material),
    out: [0, yb, s / 2 + 0.002 + 0.3 * IN],
  };
}

/** Bouchon NPT 1/8 affleurant à six-pans creux (FA01215). */
export function nptPlug18(api, material = 'zinc') {
  return socketPlug(api, R18 * 1.05, material);
}

// ============================================================================
// Distributeur proportionnel PVG 32 (Danfoss), repère commun de P396, P400,
// P404 : origine au centre de la face extérieure (inférieure) de la plaque
// d'extrémité ; +Y le long de l'empilage vers le couvercle d'entrée ; X selon
// les tiroirs, embases de poignée (PVM) vers +X, électrocommandes (PVE) vers
// −X ; +Z = face des orifices de travail A / B et P / T ; −Z = face de fixation
// (taraudages M8 du couvercle d'entrée et de la plaque d'extrémité) et des
// orifices LSa / LSb des sections LS. Cotes d'après les vues des pages 396,
// 400 et 406 (épaisseur de section PVG 32 : 48 mm) : corps 110 (X) × 48 (Y) ×
// 108 (Z) mm, couvercle d'entrée 52 mm, plaque d'extrémité LX 30 mm, couvercle
// d'extrémité 22 mm ; PVE 84 mm (proportionnelle) / 74 mm (tout-ou-rien),
// PVM 45 mm plus le levier.
// Orifices : A / B #10 ORB (7/8-14), P / T #12 ORB, LS, manomètre, LX, LSa /
// LSb #5 ORB (1/2-20).
// ============================================================================
export const PV = {
  L: 0.11, D: 0.108, sec: 0.048, inlet: 0.052, cover: 0.022, lx: 0.03,
  rods: [[-0.047, -0.042], [0.047, -0.042], [0, 0.04]], // tirants [x, z]
  AB: { B: -0.024, A: 0.024 }, // X des orifices de travail (face +Z)
  PT: { T: -0.034, P: 0.034 }, // X des orifices du couvercle d'entrée (face +Z)
  LS: { LSb: -0.016, LSa: 0.032 }, // X des orifices LS A / B (face −Z)
  bolt: 0.032, // ±X des taraudages de fixation (face −Z)
  zs: 0.004, // Z de l'axe des tiroirs
  pad: 0.0016, // saillie du bossage des orifices A / B
};

/** Positions des orifices d'un PVG 32 (spec de pvgValve), repère du distributeur. */
export function pvgLayout(spec) {
  const { L, D, sec, inlet } = PV;
  const et = spec.end.kind === 'lx' ? PV.lx : PV.cover;
  const n = spec.sections.length;
  const ys = spec.sections.map((_, i) => et + sec * (i + 0.5));
  const H = et + n * sec + inlet;
  const yi = H - inlet / 2;
  const zf = D / 2 + PV.pad;
  return {
    H, ys, yi, et,
    sec: ys.map((y) => ({ A: [PV.AB.A, y, zf], B: [PV.AB.B, y, zf], LSa: [PV.LS.LSa, y, -D / 2], LSb: [PV.LS.LSb, y, -D / 2] })),
    P: [PV.PT.P, yi - 0.004, D / 2], T: [PV.PT.T, yi - 0.004, D / 2],
    LS: [-L / 2, yi + 0.008, -0.02], G: [L / 2, yi, -0.02], LX: [-L / 2, et / 2, 0],
    bolts: [[-PV.bolt, et / 2], [PV.bolt, et / 2], [-PV.bolt, yi], [PV.bolt, yi]].map(([x, y]) => [x, y, -D / 2]),
  };
}

/** Corps moulé d'une tranche (bloc à arêtes adoucies, joints d'empilage visibles). */
function slab(api, t, material = 'castIron') {
  return api.S.box(PV.L, t - 0.0005, PV.D, material, { r: 0.0022 });
}

/** Corps de section PVB : kind 'basic' | 'pc' | 'lspc' ; lsPlugs : bouchons sur LSa / LSb. Centré (y = 0). */
function pvgBody(api, kind, { lsPlugs = false } = {}) {
  const { S, THREE } = api;
  const { L, D, sec } = PV;
  // Bossage en « 8 » autour des orifices A / B (face +Z).
  const r = 0.0186, xa = PV.AB.A, xb = PV.AB.B;
  const sh = new THREE.Shape();
  sh.moveTo(xb, -r); sh.lineTo(xa, -r); sh.absarc(xa, 0, r, -Math.PI / 2, Math.PI / 2, false);
  sh.lineTo(xb, r); sh.absarc(xb, 0, r, Math.PI / 2, Math.PI * 1.5, false);
  const pg = new THREE.ExtrudeGeometry(sh, { depth: PV.pad, bevelEnabled: false, curveSegments: 10 });
  pg.translate(0, 0, D / 2);
  const cast = [slab(api, sec), new THREE.Mesh(pg)];
  // Bossages ronds des bouts de tiroir (faces ±X, sous la PVM et la PVE).
  for (const s of [-1, 1]) cast.push(S.cyl(0.017, 0.0015, 'castIron', { axis: 'x', seg: 20, pos: [s * (L / 2 + 0.0007), 0, PV.zs] }));
  const g = S.group(S.merged(cast, 'castIron'));
  const steel = [];
  for (const x of [xa, xb]) steel.push(spotFace(api, 10, [x, 0, D / 2 + PV.pad], [0, 0, 1]));
  // Clapets antichoc / anticavitation (PVLP) : bouchons ronds de part et d'autre.
  for (const s of [-1, 1]) steel.push(orient(api, socketPlug(api, 0.0068), [s * 0.047, 0, D / 2], [0, 0, 1]));
  if (kind !== 'basic') {
    // Bouchon du compensateur de pression (face −Z, côté PVE).
    steel.push(orient(api, hexPlugTVK(api, 0.019), [-0.043, 0, -D / 2], [0, 0, -1]));
  }
  if (kind === 'lspc') {
    for (const x of [PV.LS.LSa, PV.LS.LSb]) {
      steel.push(spotFace(api, 5, [x, 0, -D / 2], [0, 0, -1]));
      if (lsPlugs) steel.push(orient(api, orbPlugHex(api, 5), [x, 0, -D / 2], [0, 0, -1]));
    }
  }
  g.add(S.merged(steel, 'steel'));
  return g;
}

/** Couvercle d'entrée PVP (CP47505-IC) centré : P / T (+Z), LS (−X), manomètre (+X), plateau gravé dessus. */
function pvgInlet(api, { gaugePlug = false } = {}) {
  const { S, THREE } = api;
  const { L, D, inlet } = PV;
  const lay = { P: [PV.PT.P, -0.004, D / 2], T: [PV.PT.T, -0.004, D / 2] };
  const cast = [slab(api, inlet)];
  // Plateau gravé de la face extérieure (+Y) : cadre en relief, motif en sablier.
  const yt = inlet / 2 - 0.0002;
  const fw = 0.074, fd = 0.066, b = 0.0028;
  cast.push(S.box(fw, 0.0008, b, 'castIron', { pos: [0.006, yt + 0.0004, 0.01 + fd / 2 - b / 2] }));
  cast.push(S.box(fw, 0.0008, b, 'castIron', { pos: [0.006, yt + 0.0004, 0.01 - fd / 2 + b / 2] }));
  cast.push(S.box(b, 0.0008, fd, 'castIron', { pos: [0.006 + fw / 2 - b / 2, yt + 0.0004, 0.01] }));
  cast.push(S.box(b, 0.0008, fd, 'castIron', { pos: [0.006 - fw / 2 + b / 2, yt + 0.0004, 0.01] }));
  const hg = new THREE.Shape([[-0.024, -0.017], [0.024, -0.017], [0.024, -0.006], [0.008, 0], [0.024, 0.006], [0.024, 0.017], [-0.024, 0.017], [-0.024, 0.006], [-0.008, 0], [-0.024, -0.006]].map(([x, y]) => new THREE.Vector2(x, y)));
  const hgeo = new THREE.ExtrudeGeometry(hg, { depth: 0.0006, bevelEnabled: false });
  hgeo.rotateX(-Math.PI / 2);
  hgeo.translate(0.006, yt, 0.01);
  cast.push(new THREE.Mesh(hgeo));
  // Lettres « LS », « T », « P » en relief (traits).
  const stroke = (x, z, w, d) => cast.push(S.box(w, 0.0007, d, 'castIron', { pos: [x, yt + 0.0004, z] }));
  stroke(-0.03, 0.035, 0.0012, 0.006); stroke(-0.0285, 0.0322, 0.004, 0.0012); // L
  stroke(-0.024, 0.0352, 0.004, 0.0012); stroke(-0.024, 0.0322, 0.004, 0.0012); stroke(-0.024, 0.0337, 0.0012, 0.003); // S (simplifié)
  stroke(0.036, 0.034, 0.005, 0.0012); stroke(0.036, 0.0315, 0.0012, 0.005); // T
  stroke(0.036, -0.016, 0.0012, 0.006); stroke(0.0375, -0.0145, 0.003, 0.003); // P
  const g = S.group(S.merged(cast, 'castIron'));
  const steel = [
    spotFace(api, 12, lay.P, [0, 0, 1]), spotFace(api, 12, lay.T, [0, 0, 1]),
    orient(api, socketPlug(api, 0.0075), [0, 0.016, D / 2], [0, 0, 1]), // orifice M
    spotFace(api, 5, [-L / 2, 0.008, -0.02], [-1, 0, 0]),
    spotFace(api, 5, [L / 2, 0, -0.02], [1, 0, 0]),
    orient(api, socketPlug(api, 0.006), [L / 2, 0.012, 0.03], [1, 0, 0]), // limiteur de pression pilote
  ];
  if (gaugePlug) steel.push(orient(api, orbPlugHex(api, 5), [L / 2, 0, -0.02], [1, 0, 0]));
  g.add(S.merged(steel, 'steel'));
  return g;
}

/** Plaque d'extrémité : 'lx' (CP003744, orifice LX #5 sur la face −X) ou 'cover' (CP004208). Centrée. */
function pvgEnd(api, kind) {
  const { S } = api;
  const { L, D } = PV;
  const t = kind === 'lx' ? PV.lx : PV.cover;
  const g = S.group(S.merged([slab(api, t)], 'castIron'));
  const steel = [orient(api, socketPlug(api, 0.0062), [0.03, 0, D / 2], [0, 0, 1])];
  if (kind === 'lx') steel.push(spotFace(api, 5, [-L / 2, 0, 0], [-1, 0, 0]));
  g.add(S.merged(steel, 'steel'));
  return g;
}

/**
 * Tiroir (CP005724, CP006699…) : barreau chromé à portées et gorges (gorges
 * plus nombreuses pour un tiroir de moteur « MOT », fente LS pour « LS »),
 * ressort de rappel, coupelles et chape d'entraînement côté +X. Centré sur
 * la section, axe X à z = PV.zs.
 */
function pvgSpool(api, kind = 'mot') {
  const { S } = api;
  const { L } = PV;
  const r = 0.008, x0 = -L / 2 - 0.004, x1 = L / 2 + 0.006;
  const grooves = kind.startsWith('cyl') ? [-0.03, -0.012, 0.012, 0.03] : [-0.036, -0.022, -0.008, 0.008, 0.022, 0.036];
  const prof = [[0, x0], [r * 0.8, x0], [r, x0 + 0.0012]];
  for (const gx of grooves) prof.push([r, gx - 0.004], [r * 0.74, gx - 0.0032], [r * 0.74, gx + 0.0032], [r, gx + 0.004]);
  prof.push([r, x1 - 0.001], [r * 0.5, x1], [r * 0.5, x1 + 0.016], [0, x1 + 0.016]);
  const spool = S.lathe(prof, 'chrome', { seg: 18 });
  spool.rotation.z = -Math.PI / 2; // axe Y du profil → +X
  const parts = [spool];
  if (kind.endsWith('ls')) parts.push(S.box(0.012, 0.0016, 0.004, 'chrome', { pos: [0.0, r - 0.0004, 0] })); // méplat LS
  const steel = [
    S.cyl(0.0115, 0.0012, 'steel', { axis: 'x', seg: 18, pos: [x1 + 0.0006, 0, 0] }),
    S.cyl(0.0115, 0.0012, 'steel', { axis: 'x', seg: 18, pos: [x1 + 0.0146, 0, 0] }),
    S.spring(0.0098, 0.0012, 0.013, 4, 'steel', { axis: 'x', pos: [x1 + 0.0076, 0, 0], perTurn: 12, radial: 5 }),
    S.box(0.006, 0.012, 0.009, 'steel', { pos: [x1 + 0.019, 0, 0] }), // chape
  ];
  const g = S.group(S.merged(parts, 'chrome'), S.merged(steel, 'steel'));
  g.position.z = PV.zs;
  return g;
}

/**
 * Embase de poignée PVM (CP002749) contre la face +X : semelle et carter en
 * fonte d'aluminium, bossage de l'axe du levier (axe Y) avec écrou, deux vis
 * de butée à contre-écrou, quatre vis CHC ; levier d'acier incliné de 15° vers
 * +Z et pommeau noir. Centrée sur la section (y = 0).
 */
function pvgHandle(api) {
  const { S } = api;
  const { L } = PV;
  const x0 = L / 2;
  const prof = [[0, -0.036], [0.03, -0.031], [0.037, -0.014], [0.037, 0.012], [0.026, 0.03], [0, 0.036]];
  const housing = S.extrude(prof, 0.031, 'castAlu');
  housing.rotation.x = Math.PI / 2;
  housing.position.x = x0 + 0.008;
  const alu = [
    S.box(0.008, 0.04, 0.084, 'castAlu', { r: 0.002, pos: [x0 + 0.004, 0, 0] }),
    housing,
    S.cyl(0.0115, 0.037, 'castAlu', { seg: 20, pos: [x0 + 0.027, 0, -0.018] }), // bossage de l'axe
    S.cyl(0.0085, 0.006, 'castAlu', { axis: 'x', seg: 16, pos: [x0 + 0.04, 0, 0.0] }), // nez du carter
  ];
  const steel = [
    S.nut(0.013, 0.006, 'steel', { pos: [x0 + 0.027, 0.0215, -0.018] }),
    S.cyl(0.0035, 0.004, 'steel', { seg: 10, pos: [x0 + 0.027, 0.0265, -0.018] }),
  ];
  for (const z of [-0.026, 0.022]) {
    steel.push(S.cyl(0.0025, 0.014, 'steel', { axis: 'x', seg: 8, pos: [x0 + 0.039, 0, z] }));
    steel.push(S.nut(0.008, 0.004, 'steel', { axis: 'x', pos: [x0 + 0.039, 0, z] }));
  }
  for (const y of [-0.0145, 0.0145]) for (const z of [-0.035, 0.035]) steel.push(S.at(capScrew(api, 0.005, 0.012, 'steel'), [x0 + 0.008, y, z], [0, 0, -Math.PI / 2]));
  // Levier : moyeu, tige inclinée vers +Z, bout fileté, pommeau.
  const ang = 0.26, Ll = 0.13;
  const p0 = [x0 + 0.043, 0, 0];
  const p1 = [p0[0] + Ll * Math.cos(ang), 0, Ll * Math.sin(ang)];
  steel.push(S.box(0.012, 0.014, 0.014, 'steel', { r: 0.002, pos: [x0 + 0.044, 0, 0] }));
  steel.push(S.rod(p0, p1, 0.005, 'steel', 14));
  const knob = S.lathe([[0, 0], [0.008, 0], [0.012, 0.01], [0.0145, 0.026], [0.0135, 0.036], [0.009, 0.042], [0, 0.043]], 'plastic', { seg: 20 });
  knob.quaternion.setFromUnitVectors(new api.THREE.Vector3(0, 1, 0), new api.THREE.Vector3(Math.cos(ang), 0, Math.sin(ang)));
  knob.position.set(p1[0] - 0.012 * Math.cos(ang), 0, p1[2] - 0.012 * Math.sin(ang));
  return S.group(S.merged(alu, 'castAlu'), S.merged(steel, 'steel'), knob);
}

/**
 * Électrocommande PVE à connecteur AMP contre la face −X : 'fine'
 * (CP007816, proportionnelle fine : boîtier de 72 mm à ailettes en bout) ou
 * 'onoff' (CP007817, tout-ou-rien : boîtier de 62 mm lisse à deux nervures).
 * Embase alu, boîtier noir, quatre vis en bout, connecteur JPT 4 voies
 * tourné vers +Z (côté orifices). Centrée (y = 0).
 */
function pvgPVE(api, kind = 'fine') {
  const { S } = api;
  const { L } = PV;
  const x0 = -L / 2;
  const Lh = kind === 'fine' ? 0.072 : 0.062;
  const xe = x0 - 0.012 - Lh; // bout du boîtier
  const alu = [S.box(0.012, 0.0435, 0.1, 'castAlu', { r: 0.002, pos: [x0 - 0.006, 0, 0] })];
  const pl = [S.box(Lh, 0.042, 0.094, 'plastic', { r: 0.004, pos: [x0 - 0.012 - Lh / 2, 0, -0.002] })];
  if (kind === 'fine') {
    for (let i = 0; i < 6; i++) pl.push(S.box(0.004, 0.0026, 0.068, 'plastic', { r: 0.001, pos: [xe - 0.0018, -0.0125 + i * 0.005, -0.008] }));
  } else {
    for (const z of [-0.022, 0.012]) pl.push(S.box(0.003, 0.036, 0.004, 'plastic', { r: 0.001, pos: [xe - 0.0012, 0, z] }));
    pl.push(S.box(0.016, 0.03, 0.01, 'plastic', { r: 0.003, pos: [xe + 0.01, 0, -0.049] })); // presse-étoupe moulé
  }
  // Connecteur AMP JPT 4 voies : embase, jupe, verrou, broches.
  const xc = xe + 0.019, zc = 0.045;
  pl.push(S.box(0.022, 0.03, 0.016, 'plastic', { r: 0.002, pos: [xc, 0, zc + 0.006] }));
  pl.push(S.box(0.022, 0.0025, 0.008, 'plastic', { pos: [xc, 0.01375, zc + 0.018] }));
  pl.push(S.box(0.022, 0.0025, 0.008, 'plastic', { pos: [xc, -0.01375, zc + 0.018] }));
  pl.push(S.box(0.0025, 0.03, 0.008, 'plastic', { pos: [xc + 0.00975, 0, zc + 0.018] }));
  pl.push(S.box(0.0025, 0.03, 0.008, 'plastic', { pos: [xc - 0.00975, 0, zc + 0.018] }));
  pl.push(S.box(0.008, 0.012, 0.003, 'plastic', { r: 0.001, pos: [xc - 0.014, 0, zc + 0.012] })); // verrou
  const brass = [];
  for (const y of [-0.0075, -0.0025, 0.0025, 0.0075]) brass.push(S.cyl(0.0008, 0.006, 'brass', { axis: 'z', seg: 6, pos: [xc, y, zc + 0.017] }));
  const steel = [];
  for (const y of [-0.0145, 0.0145]) for (const z of [-0.04, 0.036]) steel.push(S.at(capScrew(api, 0.004, 0.01, 'steel'), [xe, y, z], [0, 0, Math.PI / 2]));
  if (kind === 'fine') steel.push(S.box(0.0008, 0.014, 0.02, 'steel', { r: 0.0003, pos: [xe - 0.0034, 0, 0.034] })); // plaque Danfoss
  return S.group(S.merged(alu, 'castAlu'), S.merged(pl, 'plastic'), S.merged(brass, 'brass'), S.merged(steel, 'steel'));
}

/** Tirant M8 et ses écrous (trousse de joints) entre y = 0 et y = H, en (x, z). */
function pvgRod(api, x, z, H) {
  const { S } = api;
  return S.merged([
    S.cyl(0.004, H + 0.018, 'zinc', { seg: 10, pos: [x, H / 2, z] }),
    S.nut(0.013, 0.0065, 'zinc', { pos: [x, -0.0033 - 0.0012, z] }),
    S.nut(0.013, 0.0065, 'zinc', { pos: [x, H + 0.0033 + 0.0012, z] }),
    S.washer(0.0078, 0.0043, 0.0012, 'zinc', { pos: [x, -0.0006, z] }),
    S.washer(0.0078, 0.0043, 0.0012, 'zinc', { pos: [x, H + 0.0006, z] }),
  ], 'zinc');
}

/**
 * Distributeur PVG 32 complet, une pièce par objet. spec = {
 *   end: { ref, kind: 'lx' | 'cover' },
 *   sections: [{ body, kind, spool, spoolKind, handle, act, actKind, lsPlugs }] (du bas vers le haut),
 *   inlet: { ref, gaugePlug }, kit: ref (tirants de la trousse de joints) }.
 */
export function pvgValve(api, spec) {
  const { S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const lay = pvgLayout(spec);
  const g = 0.03;
  P(spec.end.ref, S.at(pvgEnd(api, spec.end.kind), [0, lay.et / 2, 0]), [0, 0, 0]);
  spec.sections.forEach((s, i) => {
    const y = lay.ys[i], ey = (i + 1) * g;
    P(s.body, S.at(pvgBody(api, s.kind, s), [0, y, 0]), [0, ey, 0]);
    P(s.spool, S.at(pvgSpool(api, s.spoolKind), [0, y, 0]), [0.22, ey, 0]);
    P(s.handle, S.at(pvgHandle(api), [0, y, 0]), [0.1, ey, 0]);
    P(s.act, S.at(pvgPVE(api, s.actKind), [0, y, 0]), [-0.11, ey, 0]);
  });
  P(spec.inlet.ref, S.at(pvgInlet(api, spec.inlet), [0, lay.yi, 0]), [0, (spec.sections.length + 1) * g, 0]);
  if (spec.kit) PV.rods.forEach(([x, z]) => P(spec.kit, pvgRod(api, x, z, lay.H), [0, -0.5 * lay.H - 0.08, 0]));
  return lay;
}

/**
 * Pose d'un distributeur PVG 32 dans la machine : tiroirs verticaux (X du
 * distributeur → +Y), empilage selon +Z (Y → +Z), orifices vers l'avant
 * (Z → +X) ; o = position machine de l'origine du distributeur. Retourne
 * { W(obj) : objet du repère du distributeur placé dans la machine, p(pt),
 * d(dir) : point / direction convertis }.
 */
export function bankFrame(api, o) {
  const { THREE, S } = api;
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(
    new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0)));
  const O = new THREE.Vector3(...o);
  return {
    q,
    W: (obj) => { const w = S.group(obj); w.quaternion.copy(q); w.position.copy(O); return w; },
    p: (pt) => new THREE.Vector3(...pt).applyQuaternion(q).add(O).toArray(),
    d: (v) => new THREE.Vector3(...v).applyQuaternion(q).toArray(),
  };
}

/**
 * Raccords et fixation d'un banc PVG 32 (P394, P398, P402) dans le repère
 * du distributeur : adaptateur sur un orifice (dir = normale de la face),
 * vis de fixation par l'arrière au travers de la platine (tôle 1/4 po).
 */
export function bankKit(api, F) {
  const { D } = PV;
  const P = (ref, obj, e) => api.part(ref, front(F.W(obj)), F.d(e));
  return {
    straight(ref, pos, dir, orb, jic, e = 0.06) {
      const a = orbAdapter(api, orb, jic);
      P(ref, orient(api, a.obj, pos, dir), dir.map((v) => v * e));
      return a;
    },
    elbow(ref, pos, dir, side, orb, jic, e = 0.06) {
      const a = orbElbow(api, orb, jic);
      P(ref, orient(api, a.obj, pos, dir, side), dir.map((v) => v * e));
      return { ...a, outW: orientPoint(api, a.out, pos, dir, side) };
    },
    bolts(boltRef, washerRef, pts) {
      const T = 0.25 * IN;
      for (const [x, y] of pts.map((p) => [p[0], p[1]])) {
        const b = boltAt(api, 0.3125, 0.75, [x, y, -D / 2 - T], [0, 0, -1], { washer: 'nl' });
        P(washerRef, b.washer, [0, 0, -0.05]);
        P(boltRef, b.bolt, [0, 0, -0.09]);
      }
    },
  };
}

// ============================================================================
// Capteur de pression (P384, P386, P388) : repère commun décrit dans P384.
// ============================================================================
export const XDCR = { len: 0.088, hex: 0.011 };

/** Capteur inox à embase ORB -04 et connecteur Deutsch DT04-3P ; origine sur la face d'appui, queue vers −Y, corps vers +Y. */
export function transducerBody(api) {
  const { S, THREE } = api;
  const r = 0.01125;
  const steel = S.merged([
    S.lathe([[0, -0.0105], [0.0042, -0.0105], [0.0052, -0.0095], ...S.thread(0.00555, -0.0085, -0.0032, { pitch: 0.0013, maxTurns: 4, chamferBottom: false }), [0.0048, -0.0026], [0.0048, -0.0004], [0.0062, -0.0004], [0.0062, 0], [0, 0]], 'steel', { seg: 16 }),
    hexPrism(S, THREE, 7 / 8, 0.43, 0, 0, 'steel'),
    S.lathe([[0, XDCR.hex], [r, XDCR.hex], [r, 0.03], [r - 0.0006, 0.0306], [r - 0.0006, 0.0322], [r, 0.0328], [r, 0.052], [r - 0.0015, 0.0535], [0.0094, 0.0535], [0.0094, 0.058], [0, 0.058]], 'steel', { seg: 24 }),
  ], 'steel');
  // Connecteur DT04-3P : embase ronde, boîtier carré, verrou (cale orange) et clip.
  const pl = S.merged([
    S.cyl(0.0094, 0.008, 'plastic', { seg: 20, pos: [0, 0.062, 0] }),
    S.box(0.021, 0.022, 0.021, 'plastic', { r: 0.0025, pos: [0, 0.077, 0] }),
    S.box(0.006, 0.016, 0.004, 'plastic', { r: 0.001, pos: [0, 0.078, 0.0118] }),
    S.box(0.009, 0.003, 0.003, 'plastic', { pos: [0, 0.0858, 0.0125] }),
  ], 'plastic');
  const wedge = S.box(0.012, 0.0015, 0.012, 'orange', { pos: [0, 0.0882, 0] });
  return S.group(steel, pl, wedge);
}

/** Joint torique 3-904 (ORB -04) logé sous le six-pans du capteur. */
export function transducerOring(api) {
  return api.S.torus(0.00537, 0.00092, 'rubber', { pos: [0, -0.0012, 0] });
}

// ============================================================================
// Clapet navette 1/4 NPT CP17024 (P382, P402) : bloc d'aluminium 1.5 × 1 × 1
// po, entrées sur les faces ±X, sortie sur la face +Y, deux trous de fixation
// selon Z. Repère : centre du bloc.
// ============================================================================
export const SH17 = { L: 1.5 * IN, C: 1.0 * IN };
export function shuttle17024(api) {
  const { S } = api;
  const { L, C } = SH17;
  const rn = (NPT[4] * IN) / 2;
  const blk = S.group(S.merged([S.box(L, C, C, 'castAlu', { r: 0.0015 })], 'castAlu'));
  const steel = [
    ...[[-1, 0, 0], [1, 0, 0], [0, 1, 0]].map((d) => spotFace(api, 4, d.map((v, i) => v * (i === 0 ? L / 2 : C / 2)), d, { npt: true })),
  ];
  for (const x of [-0.012, 0.012]) for (const s of [-1, 1]) steel.push(S.ring(0.0042, 0.0034, 0.0005, 'steel', { axis: 'z', seg: 16, pos: [x, -0.004, s * (C / 2 + 0.0002)] }));
  // Flèche d'écoulement gravée (face +Z).
  steel.push(S.box(0.018, 0.0012, 0.0004, 'steel', { pos: [0, 0.006, C / 2 + 0.0002] }));
  steel.push(S.box(0.0012, 0.008, 0.0004, 'steel', { pos: [0, 0.009, C / 2 + 0.0002] }));
  blk.add(S.merged(steel, 'steel'));
  void rn;
  return blk;
}

// ============================================================================
// Bloc collecteur CP000407 (P364, P366) : bloc d'acier 5 1/2 × 2 1/2 × 2 1/2 po
// (proportions des vues des pages 364 et 366, lamages des orifices pour
// l'échelle) : orifices -16 aux deux bouts, -12 en deux colonnes (x = ±1 1/4
// po) sur le dessus, l'avant et l'arrière ; deux trous de vis verticaux au
// milieu. Repère : centre de la face inférieure, Y vers le haut, X selon la
// longueur, +Z = face avant.
// ============================================================================
export const M407 = { L: 5.5 * IN, H: 2.5 * IN, W: 2.5 * IN, xp: 1.25 * IN, zb: 0.88 * IN };
export function m407Ports() {
  const { L, H, W, xp } = M407;
  return {
    endL: { p: [-L / 2, H / 2, 0], d: [-1, 0, 0], dash: 16 }, endR: { p: [L / 2, H / 2, 0], d: [1, 0, 0], dash: 16 },
    topL: { p: [-xp, H, 0], d: [0, 1, 0], dash: 12 }, topR: { p: [xp, H, 0], d: [0, 1, 0], dash: 12 },
    frontL: { p: [-xp, H / 2, W / 2], d: [0, 0, 1], dash: 12 }, frontR: { p: [xp, H / 2, W / 2], d: [0, 0, 1], dash: 12 },
    backL: { p: [-xp, H / 2, -W / 2], d: [0, 0, -1], dash: 12 }, backR: { p: [xp, H / 2, -W / 2], d: [0, 0, -1], dash: 12 },
  };
}
export function manifold407(api) {
  const { S } = api;
  const { L, H, W, zb } = M407;
  const g = S.group(S.merged([S.box(L, H, W, 'darkSteel', { r: 0.0016, pos: [0, H / 2, 0] })], 'darkSteel'));
  const steel = Object.values(m407Ports()).map((q) => spotFace(api, q.dash, q.p, q.d));
  for (const s of [-1, 1]) {
    steel.push(S.ring(0.0062, 0.0037, 0.0005, 'steel', { seg: 18, pos: [0, H + 0.00025, s * zb] }));
    steel.push(S.ring(0.0062, 0.0037, 0.0005, 'steel', { seg: 18, pos: [0, -0.00025, s * zb] }));
  }
  // Repères frappés des orifices (traits) sur la face avant.
  for (const x of [-M407.xp, M407.xp]) steel.push(S.box(0.004, 0.0008, 0.0003, 'steel', { pos: [x, H - 0.006, W / 2 + 0.00015] }));
  g.add(S.merged(steel, 'steel'));
  return g;
}

// ============================================================================
// Adaptateurs d'aspiration (P350, P380) : collet J518 code 61 (dash), col,
// coude optionnel (angle°, de +Y vers +Z), douille cannelée pour un flexible
// de Ø intérieur hoseIn (po) avec butée. Collier à boulon en T.
// ============================================================================
export function suctionAdapter(api, dash, angle, hoseIn, { straight = 0.026 } = {}) {
  const { THREE, S } = api;
  const f = j518(dash, 61);
  const rh = (hoseIn * IN) / 2;
  const rtb = Math.max(rh * 0.98, f.rn * 0.92);
  const wall = 0.004;
  const parts = [flangeHead(api, dash, 61, 0.012, 'steel')];
  const y0 = f.hc + 0.012;
  parts.push(S.lathe([[f.rb, y0], [f.rn, y0], [rtb, y0 + 0.01], [rtb, y0 + straight], [rtb - wall, y0 + straight], [f.rb, y0]], 'steel', { seg: 32 }));
  // Cordon de soudure collet / tube.
  parts.push(S.torus(f.rn + 0.0008, 0.0016, 'steel', { pos: [0, y0 + 0.0008, 0] }));
  let c = new THREE.Vector3(0, y0 + straight, 0);
  let dir = new THREE.Vector3(0, 1, 0);
  if (angle) {
    const a = (angle * Math.PI) / 180, R = rtb * 2.6;
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const t = (i / 16) * a;
      pts.push([0, c.y + Math.sin(t) * R, R - Math.cos(t) * R]);
    }
    parts.push(S.tube(pts, rtb, 'steel', { seg: 24, ends: 'none', radial: 24 }));
    c = new THREE.Vector3(...pts[16]);
    dir = new THREE.Vector3(0, Math.cos(a), Math.sin(a));
  }
  const len = hoseIn * IN * 1.25;
  const prof = [[rh - wall, 0], [rtb * 1.12, 0], [rtb * 1.12, 0.006], [rh * 0.97, 0.006]];
  const n = 4, pch = (len * 0.78) / n;
  for (let i = 0; i < n; i++) {
    const y = 0.006 + len * 0.12 + i * pch;
    prof.push([rh * 0.97, y], [rh * 1.05, y + pch * 0.18], [rh * 0.95, y + pch * 0.95]);
  }
  prof.push([rh * 0.95, len - 0.003], [rh * 0.88, len], [rh - wall, len], [rh - wall, 0]);
  const tail = S.lathe(prof, 'steel', { seg: 32 });
  tail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  tail.position.copy(c);
  parts.push(tail);
  return {
    obj: S.merged(parts, 'steel'),
    tip: c.clone().addScaledVector(dir, len),
    dir,
    clamp: c.clone().addScaledVector(dir, 0.006 + len * 0.5),
  };
}

/** Collier à boulon en T autour d'un flexible (rayon intérieur rc), axe +Y, centré. */
export function tBoltClamp(api, rc, w = 0.019) {
  const { S } = api;
  const zb = rc + 0.0105;
  return S.merged([
    S.shell(rc + 0.0013, rc, w, 'zinc', { seg: 40 }),
    S.box(0.026, w * 0.85, 0.0026, 'zinc', { pos: [0.006, 0, rc + 0.003] }),
    S.box(0.01, w * 0.8, 0.012, 'zinc', { r: 0.002, pos: [0.019, 0, zb - 0.002] }), // pont du T
    S.box(0.012, w * 0.8, 0.012, 'zinc', { r: 0.002, pos: [-0.016, 0, zb - 0.002] }), // tourillon
    S.cyl(0.0032, 0.052, 'zinc', { axis: 'x', seg: 10, pos: [0.002, 0, zb] }),
    S.box(0.004, 0.014, 0.016, 'zinc', { pos: [0.026, 0, zb] }), // tête en T
    S.nut(0.011, 0.007, 'zinc', { axis: 'x', pos: [-0.0255, 0, zb] }),
  ], 'zinc');
}

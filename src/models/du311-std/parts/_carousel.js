// Fonctions et cotes communes du lot « carrousel » du DU311 sur roues
// (P108 à P150) : position du carrousel et du bras de tige dans le repère de
// l'avance, hauteurs des cadres, des couvercles et des bras pivotants,
// géométrie du vérin du bras (P122), quincaillerie légère en pouces, raccords
// JIC légers, colliers de support, prismes de tôle. Fichier préfixé « _ » :
// non inscrit comme assemblage.
//
// Repère de l'avance (../feed.js) : pied du mât à y = 0, axe du mât +Y, face
// (axe de forage) +Z, carrousel côté +X. Angles « en plan » φ : point =
// centre + r (cos φ, sin φ) dans le plan (x, z) ; un objet dont le +X local
// doit pointer vers φ reçoit rotation.y = -φ.
// Carrousel : axe vertical en (FEED.car.x, FEED.car.z), 17 alvéoles Ø 4 po
// au rayon FEED.car.rp (alvéole k à l'angle FEED.pocketA0 + k·2π/17 au sens
// des rotations three.js, soit φ = -a) ; alvéole de transfert (k = 0) en
// face du portillon, côté mât (φ ≈ -177.6°).
// Bras de tige : arbre vertical en (FEED.clamp.x, FEED.clamp.z) ; deux bras
// pivotants (P128 bas, P130 haut) le relient aux bossages des couvercles du
// carrousel (axe du carrousel) ; bras de serrage (13 de P108) sur l'arbre aux
// hauteurs FEED.clamp.arms, mâchoires sur l'axe de forage à la valeur 0 du
// corps « clamp » (rotation autour de l'arbre).

import { FEED } from '../feed.js';

export const IN = 0.0254;
export const u = (v) => v * IN;
export const DEG = Math.PI / 180;

// ---------------------------------------------------------------- plan

export const C = [FEED.car.x, FEED.car.z]; // axe du carrousel (x, z)
export const K = [FEED.clamp.x, FEED.clamp.z]; // axe de l'arbre du bras de tige
export const polar = (r, phi, c = C) => [c[0] + r * Math.cos(phi), c[1] + r * Math.sin(phi)];

// Bras pivotants : du bossage du couvercle (axe du carrousel) à l'arbre du bras.
const SWX = K[0] - C[0], SWZ = K[1] - C[1];
export const SWING = {
  L: Math.hypot(SWX, SWZ), // entraxe des moyeux (0.462 m)
  phi: Math.atan2(SWZ, SWX), // direction en plan (≈ 111.6°)
};

// Cadre du carrousel (cotes en m, en plan autour de l'axe du carrousel).
export const RING = {
  rp: FEED.car.rp, // rayon des alvéoles
  pocket: u(2.0), // rayon d'une alvéole (Ø 4 po)
  Ri: 0.322, // paroi circulaire des logements (tôle 3/8 po roulée)
  Ro: 0.322 + u(0.375),
  plate: 0.35, // rayon des plaques de fond et de dessus
  gate: -FEED.pocketA0, // angle du portillon (alvéole de transfert)
  gateHalf: 14 * DEG, // demi-ouverture de la paroi au portillon
  // montants (repères 2, 3, 4 de P136) : rayon et angle en plan
  posts: { r: 0.375, a: { 4: 222 * DEG, 3: 282 * DEG, 2: 342 * DEG }, w: u(3.0) },
  backZ: -0.30, // face arrière des brides de fixation sur le cadre de montage P098
};

// ---------------------------------------------------------------- hauteurs

const baseTop = FEED.car.y0; // dessus de la plaque de fond du cadre bas (pose de la rampe P076)
const lowCoverTop = baseTop - u(0.5);
const lowCoverBot = lowCoverTop - u(0.375);
const topBot = 2.36; // dessous de la plaque de dessus du cadre haut
const topTop = topBot + u(0.5);
const chamberTop = 2.44; // dessus de la paroi du carter d'indexage
const upCoverTop = chamberTop + u(0.375);
export const H = {
  baseTop, lowCoverTop, lowCoverBot,
  lowRingTop: 0.5, // haut de la paroi du logement bas
  upRingBot: 2.16, // bas de la paroi du logement haut (bouts des tiges : 2.23)
  topBot, topTop, chamberTop, upCoverTop,
  // bras pivotants (moyeux de 2 1/2 po)
  armUp: upCoverTop + 0.003, // dessous des moyeux du bras haut
  armLow: lowCoverBot - 0.003 - u(2.5), // dessous des moyeux du bras bas
  hub: u(2.5),
  // vérins de pivotement (P124) : axes des œils, au-dessus du couvercle haut et sous le couvercle bas
  swingCylUp: 2.50,
  swingCylLow: 0.228,
  // bras de pivot (P126) et vérin du bras (P122)
  pivot: upCoverTop + 0.003 + u(2.5) + 0.003, // dessous du moyeu du bras de pivot
  arms: FEED.clamp.arms,
};
H.armCyl = H.pivot + 0.036; // axe du vérin P122 (œils verticaux)

// Vérin du bras de tige P122 (Ø 3 × 6 1/8 po) : œil de fond sur la chape haute
// du bras pivotant haut (près du bossage du couvercle), œil de tige sur le bras
// de pivot calé sur l'arbre. Position de l'œil de fond en plan (repère de
// l'avance), rayon et angle du bras de pivot à la valeur 0 (bras sur l'axe de
// forage) : le vérin est presque rentré sur l'axe de forage et presque sorti
// à l'alvéole de transfert (course balayée 151 mm sur 156).
const SU = [SWX / SWING.L, SWZ / SWING.L]; // direction des bras pivotants
const SN = [SU[1], -SU[0]]; // perpendiculaire (côté +X)
export const ARMCYL = {
  rear: [C[0] + 0.10 * SU[0] + 0.09 * SN[0], C[1] + 0.10 * SU[1] + 0.09 * SN[1]],
  lever: 0.145, // rayon de l'axe de tige sur le bras de pivot
  psi0: -10 * DEG, // angle (sens three.js) du bras de pivot à la valeur 0
  stroke: u(6.125),
  retracted: u(13.2), // entraxe des œils rentré (coupe A-A de P122)
};
/** Axe de l'œil de tige (x, z) pour une rotation t du corps « clamp ». */
export function armCylRod(t = 0) {
  const a = ARMCYL.psi0 + t;
  return [K[0] + ARMCYL.lever * Math.cos(a), K[1] - ARMCYL.lever * Math.sin(a)];
}
// Bras pivotants : position des axes en repère local du bras (x de l'axe du
// carrousel vers l'arbre, z = côté mât).
export const SWLOCAL = {
  cylRear: [0.10, -0.09], // chape haute de P130 (œil de fond de P122)
  swingRod: [SWING.L - 0.115, 0.075], // chape d'œil de tige de P124 (P128 et P130)
  swingRear: [-0.003, 0.125], // chape du couvercle (œil de fond de P124), à 0.354 m
};

/** Convertit un point local d'un bras pivotant (x, z) en plan (repère de l'avance). */
export function swingToPlan([x, z]) {
  return [C[0] + x * SU[0] - z * SN[0], C[1] + x * SU[1] - z * SN[1]];
}

// ---------------------------------------------------------------- formes

/** Arc de points [x, z] (rayon r, de a0 à a1 rad, n segments) autour de (cx, cz). */
export function arc(cx, cz, r, a0, a1, n) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.cos(a), cz + r * Math.sin(a)];
  });
}
export const circle = (cx, cz, r, n = 24) => arc(cx, cz, r, 0, 2 * Math.PI, n).slice(0, n);
/** Rectangle à coins arrondis [x0, z0] – [x1, z1]. */
export function rrect(x0, z0, x1, z1, r, n = 3) {
  return [
    ...arc(x1 - r, z0 + r, r, -Math.PI / 2, 0, n), ...arc(x1 - r, z1 - r, r, 0, Math.PI / 2, n),
    ...arc(x0 + r, z1 - r, r, Math.PI / 2, Math.PI, n), ...arc(x0 + r, z0 + r, r, Math.PI, 1.5 * Math.PI, n),
  ];
}

/**
 * Prisme vertical : contour en plan [[x, z], …] (m) extrudé de y0 à y1, trous
 * ronds [x, z, r] ou contours [[x, z], …]. Arêtes cassées ≈ 1 mm. Maillage.
 */
export function prism(api, outline, y0, y1, mat, holes = []) {
  const { THREE, S } = api;
  const t = y1 - y0;
  const mb = Math.min(0.0012, t * 0.15);
  const sh = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x, -z)));
  for (const h of holes) {
    const p = new THREE.Path();
    if (typeof h[0] === 'number') p.absarc(h[0], -h[1], h[2], 0, Math.PI * 2, true);
    else { p.moveTo(h[0][0], -h[0][1]); for (const [x, z] of h.slice(1)) p.lineTo(x, -z); p.closePath(); }
    sh.holes.push(p);
  }
  const geo = new THREE.ExtrudeGeometry(sh, {
    depth: Math.max(t - 2 * mb, 1e-4), bevelEnabled: mb > 0.0003, bevelSize: mb, bevelThickness: mb, bevelOffset: -mb, bevelSegments: 1, curveSegments: 12,
  });
  geo.translate(0, 0, mb);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y0, 0);
  return S.merged([new THREE.Mesh(S.creaseNormals(geo))], mat);
}

/**
 * Tôle de profil : contour [[a, y], …] (m) dans un plan vertical, extrudé
 * selon la normale du plan sur l'épaisseur t (centrée), trous ronds [a, y, r].
 * Le plan passe par (x, z) = org et contient la direction en plan phi.
 */
export function profilePlate(api, pts, t, mat, { org = [0, 0], phi = 0, holes = [] } = {}) {
  const { S } = api;
  const m = S.extrude(pts, t, mat, { holes });
  const g = S.group(m);
  g.position.set(org[0], 0, org[1]);
  g.rotation.y = -phi;
  return g;
}

/** Objet orienté : +Y local amené sur dir, tourné de spin autour de dir, placé en pos. */
export function place(api, obj, pos, dir = [0, 1, 0], spin = 0) {
  const { THREE } = api;
  const g = new THREE.Group();
  g.add(obj);
  const d = new THREE.Vector3(...dir).normalize();
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  if (spin) g.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(d, spin));
  g.position.set(...pos);
  return g;
}

/** Objet dans un repère (X, Y) donné (vecteurs unitaires), placé en pos. */
export function frame(api, obj, X, Y, pos) {
  const { THREE } = api;
  const x = new THREE.Vector3(...X).normalize(), y = new THREE.Vector3(...Y).normalize();
  const z = new THREE.Vector3().crossVectors(x, y);
  const g = new THREE.Group();
  g.add(obj);
  g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  g.position.set(...pos);
  return g;
}

// ---------------------------------------------------------------- quincaillerie légère (po)

// Profil de révolution en pouces [r, y] → lathe en mètres.
export const L = (api, pts, mat = 'zinc', seg = 12, opts = {}) => api.S.lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg, ...opts });
const AF = { 0.25: 0.4375, 0.3125: 0.5, 0.375: 0.5625, 0.5: 0.75, 0.625: 0.9375, 0.75: 1.125, 0.875: 1.3125, 1.0: 1.5 };
export const af = (d) => AF[d] ?? d * 1.5;

/** Prisme hexagonal (surplat a, hauteur h, po) de y0 à y0 + h, chanfrein du dessus, percé r0. */
export function hex(api, a, h, y0, mat = 'zinc', r0 = 0) {
  const R = a / 2 / Math.cos(Math.PI / 6), c = Math.min(a * 0.06, h * 0.25);
  const side = [[R, y0], [R, y0 + h - c], [R - c * 1.6, y0 + h]];
  const m = L(api, r0 > 0 ? [[r0, y0], ...side, [r0, y0 + h], [r0, y0]] : [[0, y0], ...side, [0, y0 + h]], mat, 6);
  m.children[0].rotation.y = Math.PI / 6;
  return m;
}

/** Vis H d × len (po) : dessous de tête à y = 0, tête vers +Y, tige vers -Y, filet suggéré. */
export function bolt(api, d, len, mat = 'zinc') {
  const r = d / 2, a = af(d);
  const th = Math.min(len, Math.max(d * 2 + 0.25, len * 0.55));
  const turns = Math.max(2, Math.min(5, Math.round(th / (d * 0.3))));
  const shank = [[0, -len], [r * 0.8, -len], [r, -len + r * 0.2]];
  for (let i = 0; i < turns; i++) {
    const y = -len + r * 0.2 + ((th - r * 0.2) * (i + 0.5)) / turns;
    shank.push([r * 0.93, y - d * 0.04], [r, y + d * 0.04]);
  }
  shank.push([r, 0], [0, 0]);
  return api.S.merged([
    hex(api, a, d * 0.62, 0.02 * d, mat),
    L(api, [[0, 0], [a * 0.47, 0], [a * 0.47, 0.03 * d], [0, 0.03 * d]], mat, 12),
    L(api, shank, mat, d >= 0.5 ? 12 : 10),
  ], mat);
}

/** Vis sans tête carrée (SQSS) d × len (po) : tête carrée vers +Y (dessous à y = 0), bout pointu. */
export function sqss(api, d, len, mat = 'steel') {
  const r = d / 2;
  const head = api.S.box(u(d), u(d * 0.75), u(d), mat, { r: u(d * 0.05) });
  head.position.y = u(d * 0.375);
  return api.S.merged([head, L(api, [[0, -len], [r * 0.5, -len + r * 0.4], [r * 0.93, -len + r], [r, -len + r * 1.2], [r * 0.93, -len * 0.6], [r, -len * 0.5], [r, 0], [0, 0]], mat, 10)], mat);
}

/** Écrou H (d po) de y = 0 à h, axe Y ; jam : écrou mince. */
export function nut(api, d, { jam = false, mat = 'zinc' } = {}) {
  return hex(api, af(d), d * (jam ? 0.6 : 0.875), 0, mat, d * 0.45);
}
/** Rondelle plate (d po) de y = 0 à t. */
export function washer(api, d, { od, t, mat = 'zinc' } = {}) {
  const ro = (od ?? (d <= 0.5 ? d * 2.1 : d * 1.95)) / 2, th = t ?? Math.max(0.065, d * 0.13);
  return L(api, [[d * 0.53, 0], [ro, 0], [ro, th], [d * 0.53, th], [d * 0.53, 0]], mat, 16);
}
/** Rondelle fendue (Grower) légère (d po) : anneau à coupure en biais, de y = 0 à t. */
export function lockWasher(api, d, mat = 'zinc') {
  const ro = u(d * 0.88), ri = u(d * 0.53), t = u(Math.max(0.06, d * 0.25));
  return api.S.slotted(ro, ri, 0, t, [{ a: 0, w: 0.1, y0: 0, y1: t }], mat, { seg: 16 });
}
/** Rondelles autobloquantes Nord-Lock (paire) légères, de y = 0 à 2t. */
export function nordLock(api, d, mat = 'zinc') {
  const ri = d * 0.53, ro = d * 0.92, t = Math.max(0.05, d * 0.11);
  return api.S.merged([
    L(api, [[ri, 0], [ro, 0], [ro, t], [ri, t], [ri, 0]], mat, 14),
    L(api, [[ri, t + 0.005], [ro, t + 0.005], [ro, 2 * t], [ri, 2 * t], [ri, t + 0.005]], mat, 14),
  ], mat);
}

/**
 * Pile vis + rondelle(s) (+ écrou) le long de dir : tête côté pos (face d'appui),
 * tige vers -dir sur grip (po) ; retourne { bolt, washer, nut, washer2 } placés
 * (objets séparés, à enregistrer chacun sous son repère).
 */
export function boltStack(api, pos, dir, d, len, { washer: w = 'flat', grip = 0, nutSide = false, mat = 'zinc' } = {}) {
  const D = dir.map((v) => v / Math.hypot(...dir));
  const at = (k) => pos.map((p, i) => p + D[i] * u(k));
  const wt = w === 'flat' ? Math.max(0.065, d * 0.13) : w === 'lock' ? Math.max(0.06, d * 0.25) : w === 'nord' ? 2 * Math.max(0.05, d * 0.11) : 0;
  const out = {};
  if (w === 'flat') out.washer = place(api, washer(api, d, { mat }), pos, D);
  if (w === 'lock') out.washer = place(api, lockWasher(api, d, mat), pos, D);
  if (w === 'nord') out.washer = place(api, nordLock(api, d, mat), pos, D);
  out.bolt = place(api, bolt(api, d, len + wt, mat), at(wt), D);
  if (nutSide) {
    const back = at(-grip);
    const nd = D.map((v) => -v);
    if (w === 'flat') out.washer2 = place(api, washer(api, d, { mat }), back, nd);
    const w2 = w === 'flat' ? Math.max(0.065, d * 0.13) : 0;
    out.nut = place(api, nut(api, d, { mat }), back.map((p, i) => p + nd[i] * u(w2)), nd);
  }
  return out;
}

// ---------------------------------------------------------------- raccords JIC légers

// Tailles SAE : rayon du filet JIC / ORB (po), surplat d'un adaptateur.
const JIC = { 4: [0.2185, 0.5625], 5: [0.25, 0.625], 6: [0.281, 0.6875], 8: [0.375, 0.875], 10: [0.4375, 1.0], 12: [0.531, 1.25], 16: [0.656, 1.5] };
const jr = (n) => (JIC[n] ?? JIC[6])[0];
const jhex = (n) => (JIC[n] ?? JIC[6])[1];

/** Nez JIC 37° (filet suggéré) de y0 vers +Y, taille n. */
function jicNose(api, n, y0) {
  const r = jr(n);
  return L(api, [[0, y0], [r * 0.85, y0], [r * 0.85, y0 + r * 0.25], [r, y0 + r * 0.35], [r * 0.93, y0 + r * 0.7], [r, y0 + r * 1.0], [r * 0.93, y0 + r * 1.35], [r * 0.7, y0 + r * 1.75], [r * 0.45, y0 + r * 1.75], [0, y0 + r * 1.75]], 'zinc', 10);
}
/** Queue ORB (filet droit + torique) ou NPT (conique) sous y = 0, taille n. */
function jicTail(api, n, npt = false) {
  const r = jr(n);
  return npt
    ? L(api, [[0, -r * 1.8], [r * 0.82, -r * 1.8], [r * 0.95, -r * 0.9], [r * 1.0, 0], [0, 0]], 'zinc', 10)
    : L(api, [[0, -r * 1.5], [r * 0.85, -r * 1.5], [r, -r * 1.3], [r * 0.93, -r * 0.8], [r, -r * 0.5], [r * 0.85, -r * 0.35], [r * 0.85, 0], [0, 0]], 'zinc', 10);
}

/** Raccord droit ORB (ou NPT) n → JIC m le long de +Y : queue sous y = 0, six-pans, nez. */
export function fitStraight(api, n, m = n, { npt = false } = {}) {
  const a = Math.max(jhex(n), jhex(m)), hh = a * 0.4;
  return api.S.merged([jicTail(api, n, npt), hex(api, a, hh, 0), jicNose(api, m, hh)], 'zinc');
}

/**
 * Coude JIC le long de +Y puis nez vers +X : queue ORB / NPT (ou écrou
 * tournant JIC femelle si swivel) sous y = 0, corps forgé, nez JIC m.
 * angle : 90 ou 45 (nez incliné dans le plan X-Y) ; tee : second nez vers -X.
 */
export function fitElbow(api, n, m = n, { swivel = false, npt = false, angle = 90, tee = false } = {}) {
  const { S, THREE } = api;
  const r = Math.max(jr(n), jr(m)), a = r * 2.5, B = r * 2.1;
  const parts = [L(api, [[0, 0], [a * 0.5, 0], [a * 0.5, B], [a * 0.42, B + a * 0.22], [0, B + a * 0.22]], 'zinc', 10)];
  const arm = (sgn) => {
    const g = new THREE.Group();
    g.add(L(api, [[0, 0], [a * 0.44, 0], [a * 0.44, B], [0, B]], 'zinc', 10), jicNose(api, m, B));
    g.rotation.z = -sgn * (angle * DEG);
    g.position.y = u(B * 0.62);
    return g;
  };
  parts.push(arm(1));
  if (tee) parts.push(arm(-1));
  if (swivel) parts.push(hex(api, jhex(n) + 0.12, r * 1.8, -r * 1.8, 'zinc', r * 0.7));
  else parts.push(hex(api, jhex(n), r * 0.7, -r * 0.7), S.group(at0(jicTail(api, n, npt), [0, -u(r * 0.7), 0])));
  return S.merged(parts, 'zinc');
}
function at0(obj, pos) { obj.position.set(...pos); return obj; }

/** Té tournant JIC (FA01011) : écrou tournant sous y = 0, corps, nez vers ±X. */
export function fitTee(api, n) {
  return fitElbow(api, n, n, { swivel: true, tee: true });
}

/** Coude de traversée de cloison JIC (FA01000) : nez long fileté sous y = 0 + contre-écrou, coude vers +X. */
export function fitBulkhead(api, n, t = 0.25) {
  const { S } = api;
  const r = jr(n), len = t + r * 2.6;
  return S.merged([
    fitElbow(api, n, n, { swivel: false }),
    L(api, [[0, -len], [r * 0.85, -len], [r, -len + 0.1], [r * 0.95, -len * 0.6], [r, -len * 0.3], [r, 0], [0, 0]], 'zinc', 10),
    hex(api, jhex(n) + 0.12, r * 0.8, -t - r * 0.8, 'zinc', r * 0.9),
  ], 'zinc');
}

/** Bouchon ORB à six-pans creux et torique (FA01280), tête de y = 0 vers +Y. */
export function orbPlug(api, n = 4, { countersunk = false } = {}) {
  const r = jr(n), R = r * 1.45, h = countersunk ? r * 0.08 : r * 0.6, hx = (r * 0.55) / Math.cos(Math.PI / 6);
  const { S } = api;
  const g = S.group(S.merged([
    countersunk ? L(api, [[hx, -r * 0.5], [hx, h], [r * 1.1, h], [r, -0.05], [0, -0.05]].reverse(), 'zinc', 14)
      : L(api, [[hx, h * 0.3], [hx, h], [R - 0.02, h], [R, h - 0.02], [R, 0.02], [R - 0.02, 0], [0, 0], [0, h * 0.3]].reverse(), 'zinc', 14),
    L(api, [[0, h * 0.3 - (countersunk ? r * 0.6 : 0)], [hx, h * 0.3 - (countersunk ? r * 0.6 : 0)], [hx, h], [0, h]].reverse(), 'blackOxide', 6),
    L(api, [[0, -r * 1.4], [r * 0.85, -r * 1.4], [r, -r * 1.2], [r * 0.92, -r * 0.6], [r, -r * 0.3], [r * 0.9, 0], [0, 0]], 'zinc', 10),
  ], 'zinc'));
  if (!countersunk) g.add(L(api, [[r * 0.96, -0.07], [r * 1.12, -0.07], [r * 1.12, -0.02], [r * 0.96, -0.02], [r * 0.96, -0.07]], 'rubber', 14));
  return g;
}

/** Graisseur droit 1/8 NPT (CP004817) le long de +Y : queue conique, six-pans 7/16, tête à bille. */
export function greaseNipple(api) {
  return api.S.merged([
    L(api, [[0, -0.3], [0.17, -0.3], [0.2, 0], [0, 0]], 'brass', 10),
    hex(api, 0.4375, 0.18, 0, 'brass'),
    L(api, [[0, 0.18], [0.1, 0.18], [0.1, 0.34], [0.14, 0.37], [0.14, 0.46], [0.08, 0.52], [0, 0.52]], 'brass', 12),
  ], 'brass');
}

/**
 * Collier de support à coussin caoutchouc (série CP001250 / CP006016) pour un
 * tube de diamètre d (po) : boucle de feuillard zingué garnie de caoutchouc,
 * patte double tangente. Boucle autour de +Y (axe du tube) ; patte sous la
 * boucle vers -X, face d'appui dans le plan z = -(d/2 + 0.2 po), trou à
 * x = -(d/2 + 0.6 po) ; origine sur l'axe du tube. Voir clampHole().
 */
export function supportClamp(api, d, { w = 0.5 } = {}) {
  const { S } = api;
  const r = d / 2, t = 0.06, rb = 0.08;
  const loop = S.slotted(u(r + rb + t), u(r + rb), -u(w / 2), u(w / 2), [{ a: Math.PI + 0.45, w: 0.55, y0: -u(w), y1: u(w) }], 'zinc', { seg: 20 });
  const rub = S.slotted(u(r + rb), u(r), -u(w / 2) * 1.08, u(w / 2) * 1.08, [{ a: Math.PI + 0.45, w: 0.6, y0: -u(w), y1: u(w) }], 'rubber', { seg: 20 });
  // patte : les deux bouts du feuillard superposés, tangents sous la boucle, vers -X
  const tab = S.box(u(1.0), u(w), u(2 * t), 'zinc', { pos: [-u(r * 0.55 + 0.5), 0, -u(r + rb + t)] });
  const hole = S.cyl(u(0.21), u(2 * t) + 0.0006, 'darkSteel', { axis: 'z', seg: 12, pos: [-u(r + 0.6), 0, -u(r + rb + t)] });
  return S.group(S.merged([loop, tab], 'zinc'), rub, hole);
}
/** Trou de patte d'un collier supportClamp(d) : [x, z] (m) et face supérieure de la patte (z). */
export const clampHole = (d) => ({ x: -u(d / 2 + 0.6), zFace: -u(d / 2 + 0.2), zIn: -u(d / 2 + 0.08) });

/**
 * Bras pivotant : bagues (bushing), axes à plaquette, vis d'arrêt + rondelles,
 * entretoises de chape, colliers de flexibles 1 po et leurs vis + rondelles
 * Nord-Lock, posés sur le corps du bras (repère local de swingArmBody).
 * refs = { bushing, pin, pinBolt, pinWasher, spacer, clamp, clampBolt, clampWasher }.
 */
export function swingArmKit(api, kind, refs, pins) {
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { S } = api;
  const hH = H.hub;
  for (const xc of [0, SWING.L]) {
    const len = hH + 0.0023;
    const b = flangedBushing(api, ARM.jourR, ARM.boreR, len, ARM.flangeR, ARM.flangeT);
    P(refs.bushing, S.at(S.group(b), [xc, hH - 0.0005, 0], [Math.PI, 0, 0]), [0, -0.12, 0]);
  }
  for (const pn of pins) {
    const [x, y, z] = pn.pos;
    P(refs.pin, S.at(S.group(tabPin(api)), [x, y, z]), [0, 0.12, 0]);
    const s = boltStack(api, [x + u(1.1), y + u(0.25), z], [0, 1, 0], 0.375, 0.75, { washer: 'lock' });
    P(refs.pinWasher, s.washer, [0, 0.14, 0]);
    P(refs.pinBolt, s.bolt, [0, 0.17, 0]);
    // entretoises au-dessus et au-dessous de l'œil
    for (const ys of [pn.y0, pn.y0 + pn.gap - ARM.spacer]) {
      P(refs.spacer, S.lathe([[u(0.52), ys], [u(0.875), ys], [u(0.875), ys + ARM.spacer], [u(0.52), ys + ARM.spacer], [u(0.52), ys]], 'zinc', { seg: 20, pos: [x, 0, z] }), [0, ys > pn.y0 ? 0.06 : -0.06, 0]);
    }
  }
  // colliers 1 po sur le dessus de la poutre (flexibles des mâchoires le long du bras)
  const top = kind === 'upper' ? ARM.beamY[1] : ARM.beamY[0];
  const up = kind === 'upper' ? 1 : -1;
  const ch = clampHole(1.0);
  for (const x of [0.2, 0.31]) {
    const pos = [x, top - up * ch.zFace, 0];
    // repère du collier : X → +Z du bras, Y (axe du tube) → +X du bras, Z → vers le dessus (up)
    const c = frame(api, supportClamp(api, 1.0), [0, 0, up], [1, 0, 0], pos);
    P(refs.clamp, c, [0, up * 0.08, 0]);
    const hp = [x, top - up * (ch.zFace - ch.zIn), up * ch.x];
    const s = boltStack(api, hp, [0, up, 0], 0.375, 0.625, { washer: 'nord' });
    P(refs.clampWasher, s.washer, [0, up * 0.12, 0]);
    P(refs.clampBolt, s.bolt, [0, up * 0.16, 0]);
  }
}

/** Bague lisse à collerette (bronze) : alésage ri, ext. ro, longueur len, collerette (rf, tf) en +Y (m). */
export function flangedBushing(api, ri, ro, len, rf, tf, mat = 'brass') {
  return api.S.lathe([[ri, 0], [ro - 0.0008, 0], [ro, 0.0008], [ro, len - tf], [rf - 0.001, len - tf], [rf, len - tf + 0.001], [rf, len], [ri + 0.001, len], [ri, len - 0.001], [ri, 0]], mat, { seg: 32 });
}

/**
 * Axe Ø 1 × 3 po à plaquette d'arrêt (CX016274) : tige verticale de y = -3
 * po à 0 (sous la plaquette), plaquette soudée sur le dessus percée pour la
 * vis d'arrêt 3/8 vers +X à 1.1 po de l'axe.
 */
export function tabPin(api) {
  const { S } = api;
  const plate = S.extrude([...arc(0, 0, u(0.75), Math.PI / 2, 1.5 * Math.PI, 8), ...arc(u(1.1), 0, u(0.45), -Math.PI / 2, Math.PI / 2, 8)].map(([x, z]) => [x, -z]), u(0.25), 'steel', { holes: [[u(1.1), 0, u(0.2)]] });
  plate.rotation.x = -Math.PI / 2;
  plate.position.y = u(0.125);
  return S.merged([
    L(api, [[0, -3.0], [0.44, -3.0], [0.5, -2.94], [0.5, 0], [0, 0]], 'steel', 20),
    plate,
  ], 'steel');
}

// ---------------------------------------------------------------- bras pivotants (P128, P132)

// Moyeux fendus des bras pivotants : bague à collerette Ø 3 1/2 × 4 (CX036643),
// moyeu Ø 6 1/2 × 2 1/2 po, chapeau boulonné côté extérieur (4 vis 1/2 po).
export const ARM = {
  hubR: u(3.25), boreR: u(2.0), jourR: u(1.75), flangeR: u(2.375), flangeT: u(0.1875),
  earZ: u(3.25) + u(1.4), earT: u(1.0), bodyEarT: u(1.75),
  beamW: u(2.5), beamY: [u(0.25), u(2.25)],
  bolts: [u(0.65), u(1.85)], // hauteurs des vis de chapeau
  spacer: u(0.125), // entretoises CM85611 (Ø 1 × 1 3/4 × 1/8 po)
};

/**
 * Corps mécano-soudé d'un bras pivotant (repère local : axe du bossage du
 * couvercle à l'origine, dessous des moyeux à y = 0, +X vers l'arbre du bras
 * à x = SWING.L, +Z côté mât). kind 'upper' : chape haute du vérin P122 près
 * du moyeu du carrousel et chape de l'œil de tige de P124 près de l'arbre ;
 * 'lower' : chape de P124 près de l'arbre (sous le moyeu). Retourne
 * { body, bolts: [{ pos, dir, len }], nipples: [{ pos, dir }], pins: [{ pos, gap, y0 }] }.
 */
export function swingArmBody(api, kind, mat = 'grey') {
  const { S } = api;
  const { merged, group, weld } = S;
  const Ls = SWING.L, A = ARM, hH = H.hub;
  const half = (xc, a0, a1) => [...arc(xc, 0, A.hubR, a0, a1, 14), ...arc(xc, 0, A.boreR, a1, a0, 14)];
  const g = [];
  const bolts = [], nipples = [], pins = [];
  for (const [xc, s, blen] of [[0, -1, 3.0], [Ls, 1, 2.75]]) {
    // moitié corps (côté poutre) et chapeau (côté extérieur), jeu de 0.6 mm au plan de joint
    const bodyHalf = s < 0 ? half(xc + 0.0003, -Math.PI / 2, Math.PI / 2) : half(xc - 0.0003, Math.PI / 2, 1.5 * Math.PI);
    const capHalf = s < 0 ? half(xc - 0.0003, Math.PI / 2, 1.5 * Math.PI) : half(xc + 0.0003, -Math.PI / 2, Math.PI / 2);
    g.push(prism(api, bodyHalf, 0, hH, mat), prism(api, capHalf, 0, hH, mat));
    for (const sz of [-1, 1]) {
      const z0 = sz * A.hubR * 0.92, z1 = sz * A.earZ;
      const zr = [Math.min(z0, z1), Math.max(z0, z1)];
      // oreille du corps (épaisse, taraudée) et oreille du chapeau
      const bx = s < 0 ? [xc + 0.0003, xc + A.bodyEarT] : [xc - A.bodyEarT, xc - 0.0003];
      const cx = s < 0 ? [xc - A.earT, xc - 0.0003] : [xc + 0.0003, xc + A.earT];
      g.push(prism(api, rrect(bx[0], zr[0], bx[1], zr[1], 0.003, 2), 0, hH, mat));
      g.push(prism(api, rrect(cx[0], zr[0], cx[1], zr[1], 0.003, 2), 0, hH, mat));
      const zb = sz * (A.hubR + (A.earZ - A.hubR) * 0.55);
      for (const yb of A.bolts) bolts.push({ pos: [s < 0 ? cx[0] : cx[1], yb, zb], dir: [s, 0, 0], len: blen });
    }
    nipples.push({ pos: [xc + s * A.hubR, hH / 2, 0], dir: [s, 0, 0] });
  }
  // poutre : section 2 1/2 × 2 po, dessous relevé au milieu (ventre)
  const bx0 = A.hubR * 0.8, bx1 = Ls - A.hubR * 0.8;
  const prof = [[bx0, A.beamY[0]], [bx0 + 0.06, A.beamY[0]], [Ls * 0.5, A.beamY[0] + u(0.5)], [bx1 - 0.06, A.beamY[0]], [bx1, A.beamY[0]], [bx1, A.beamY[1]], [bx0, A.beamY[1]]];
  const beam = S.extrude(prof, A.beamW, mat);
  g.push(beam);
  // cordons de soudure poutre / moyeux (dessus)
  const welds = [];
  for (const x of [A.hubR * 0.98, Ls - A.hubR * 0.98]) {
    for (const sz of [-1, 1]) welds.push(weld([[x, A.beamY[0] + 0.004, sz * A.beamW / 2], [x, A.beamY[1], sz * A.beamW / 2]], 0.006, mat));
    welds.push(weld([[x, A.beamY[1], -A.beamW / 2], [x, A.beamY[1], A.beamW / 2]], 0.006, mat));
  }
  // chape (deux joues percées Ø 1 po reliées par une âme côté poutre) autour d'un axe vertical
  const clevis = (cx, cz, yPin, gap, cheekT, riseFrom) => {
    const sz = Math.sign(cz), R = u(1.35);
    const zIn = sz * (A.beamW / 2 - 0.002);
    const ol = sz > 0
      ? [[cx - R, zIn], [cx + R, zIn], ...arc(cx, cz, R, 0, Math.PI, 12)]
      : [[cx + R, zIn], [cx - R, zIn], ...arc(cx, cz, R, Math.PI, 2 * Math.PI, 12)];
    const holes = [[cx, cz, u(0.52)]];
    const y1 = yPin - gap / 2, y2 = yPin + gap / 2;
    const parts = [prism(api, ol, y1 - cheekT, y1, mat, holes), prism(api, ol, y2, y2 + cheekT, mat, holes)];
    // âme verticale côté poutre, de la poutre à la joue haute
    const zw = [zIn, zIn + sz * u(1.0)].sort((a, b) => a - b);
    parts.push(prism(api, rrect(cx - R, zw[0], cx + R, zw[1], 0.002, 2), Math.min(riseFrom, y1 - cheekT), y2 + cheekT, mat));
    pins.push({ pos: [cx, y2 + cheekT, cz], gap, y0: y1 });
    return parts;
  };
  if (kind === 'upper') {
    const [cx, cz] = SWLOCAL.cylRear;
    g.push(...clevis(cx, cz, H.armCyl - H.armUp, u(1.25) + 2 * A.spacer, u(0.75), A.beamY[1]));
    const [rx, rz] = SWLOCAL.swingRod;
    g.push(...clevis(rx, rz, H.swingCylUp - H.armUp, u(0.875) + 2 * A.spacer, u(0.5), A.beamY[0]));
  } else {
    const [rx, rz] = SWLOCAL.swingRod;
    g.push(...clevis(rx, rz, H.swingCylLow - H.armLow, u(0.875) + 2 * A.spacer, u(0.5), A.beamY[0]));
  }
  return { body: group(merged(g, mat), merged(welds, mat)), bolts, nipples, pins };
}

// Chapes des couvercles (œil de fond des vérins de pivotement P124, axe
// vertical Ø 1 po) : position en plan, joues de 3/4 po de part et d'autre d'un
// jeu de 1.06 po (œil de 1 po). Haut : axe de l'œil à H.swingCylUp ; bas : à
// H.swingCylLow (axe monté par-dessous).
export const COVER_CLEVIS = { gap: u(1.06), cheek: u(0.75), R: u(1.4) };
COVER_CLEVIS.plan = swingToPlan(SWLOCAL.swingRear);

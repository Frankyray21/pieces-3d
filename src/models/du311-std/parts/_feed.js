// Bibliothèque partagée du lot « mât d'avance » du DU311 sur roues (P058 mât,
// P060 barres de guidage, P062 plaque porte-tête, P064 vérins stinger, P068
// supports des stinger, P070 vérin d'avance, P074 clapet de charge, P078
// capteur de longueur, P100 support latéral, P104 / P106 boucle de boyaux,
// P138 boyau d'air DTH). Fichier préfixé « _ » : pas un assemblage, non
// inscrit dans parts/index.js.
//
// Cotes communes dans le repère de l'avance (../feed.js, FEED) : pied du mât à
// y = 0, axe du mât +Y, face avant (côté axe de forage) +Z, carrousel côté +X ;
// toutes les positions sont données tête de rotation en haut (course
// « feed » = 0, tête à FEED.tdY). Le manuel ne cote pas le mât : ses
// proportions (pages 58, 78, 80, 82) sont mises à l'échelle de l'enveloppe
// FEED (0.40 × 0.32 × 3.0 m) ; les pièces du commerce (glissières 26 1/2 po,
// visserie, raccords, piston 3 1/8 po) gardent leurs cotes réelles.
import * as THREE from 'three';
import * as S from '../../../viewer/shapes.js';
import { FEED } from '../feed.js';
import { place, size } from '../../du311/parts/_avance_a.js';

export { FEED };
export {
  IN, size, place, seat, straight, elbow, tee, union, bulkheadElbow, capNut, swivelNut, hose,
  hhcs, hexNut, flatWasher, splitWasher, nordLock, loadCheckValve, LCV,
} from '../../du311/parts/_avance_a.js';

export const u = (v) => v * 0.0254;

// ------------------------------------------------------------------ mât (P058)
// Deux profilés en C (âmes 1/2 po, ailes avant de 60 mm qui forment les lèvres
// de la fente avant), tôle de dos 3/8 po, plaque de tête 1 1/2 po, pied
// mécano-soudé ; vérin d'avance dans la fente avant.
export const MAST = {
  W: FEED.W, D: FEED.D, L: FEED.L,
  hw: FEED.W / 2, hd: FEED.D / 2,
  tw: u(0.5), // âme des profilés (flancs)
  lip: 0.06, tl: u(0.5), // lèvres avant : largeur, épaisseur
  tb: u(0.375), // tôle de dos
  yBase: u(1.5), // dessus de la semelle du pied (semelle de y = 0 à yBase)
  yTop: FEED.L - u(1.5), // dessous de la plaque de tête
  baseX: 0.255, baseZ: [-0.2, 0.2], // semelle : demi-largeur, profondeur
};
// Barres de guidage (P060) : plat 1 × 2 3/4 po posé sur les lèvres avant,
// débordant de 1/2 po hors des flancs (crochet des glissières).
export const BAR = {
  w: u(2.75), t: u(1.0), y0: 0.2, L: 2.76,
  xc: MAST.hw + u(0.5) - u(2.75) / 2, // centre de la barre (|x|)
  z0: MAST.hd, // face d'appui (devant des lèvres)
};
BAR.xo = BAR.xc + BAR.w / 2; // arête extérieure
BAR.z1 = BAR.z0 + BAR.t; // face de guidage avant

// ------------------------------------------------------------------ vérin d'avance (P070)
// Vérin télescopique à tiges creuses : tiges fixes en haut (bride 10 sur la
// plaque de tête) et en bas (bloc 8 sur la semelle) ; tube central 11 (piston
// intégré) coulissant sur les tiges ; fût extérieur 7 coulissant sur le tube,
// porté par la plaque porte-tête (tourillons). Le tube central suit la tête à
// la fraction w de sa course (corps mixte ['ext', 'feed', w]).
export const CYL = {
  z: 0.065, // axe (x = 0)
  yT: 2.535, // axe des tourillons, tête en haut
  w: 0.7,
  rodR: u(1.75) / 2, rodBore: u(0.75) / 2,
  tubeR: u(4.125) / 2, tubeBore: u(3.125) / 2, tubeL: 1.40, tubeC: 2.25,
  barR: u(5.5) / 2, barBore: u(4.875) / 2, barL: 0.72,
  yFlange: FEED.L, // dessous du disque de la bride 10 (sur la plaque de tête)
  yBlock: u(1.5), // dessous de la semelle du bloc 8 (sur la semelle du pied)
  clampW: u(7.4) / 2, // demi-largeur du collier à tourillons
};
// Carré des vis de bride (haut, repère 13 de P058) et du bloc (bas, repère 12).
export const CYL_BOLTS = [[-0.05, -0.035], [0.05, -0.035], [-0.05, 0.035], [0.05, 0.035]];
export const BLOCK_BOLTS = [[-0.056, -0.056], [0.056, -0.056], [-0.056, 0.056], [0.056, 0.056]];

// ------------------------------------------------------------------ plaque porte-tête (P062)
export const PLATE = {
  z0: 0.27 - u(1.5), z1: 0.27, // la bride arrière de la tête (P050) porte en z = 0.27
  y0: 2.22, y1: 3.0, hw: 0.237,
  // poches des patins d'usure (au droit des barres) et plaques de retenue
  pockets: [[-BAR.xc, 2.94, '9'], [BAR.xc, 2.94, '9'], [-BAR.xc, 2.30, '10'], [BAR.xc, 2.30, '10']],
  mountX: [u(3.7) + 0.0015, u(3.7) + 0.0015 + u(1.25)], // supports de tourillon (|x|)
  mountZ: [0.27 - u(1.5) - u(8.25), 0.27 - u(1.5)],
};

// ------------------------------------------------------------------ stinger (P064 / P068)
export const STINGER_Y = 1.5; // centre du bloc central (repère de l'avance)

// ------------------------------------------------------------------ boucle de boyaux (P104)
// Boucle roulante dans le plan x = LOOP.x : brin fixe A (support bas 8 sur le
// flanc −X) en z = zA, brin mobile B (support 6 sur la plaque porte-tête) en
// z = zB, crosse de rayon (zB − zA) / 2 ; câbles de 96 po à ± LOOP.dx.
export const LOOP = { x: -0.41, dx: 0.12, zA: 0.10, zB: 0.38, yA: 1.92, yB: 3.06, cable: 96 * 0.0254 };
LOOP.r = (LOOP.zB - LOOP.zA) / 2;
// Hauteur du départ de la crosse, tête en haut (longueur des câbles constante).
LOOP.yArch = (LOOP.cable - Math.PI * LOOP.r + LOOP.yA + LOOP.yB) / 2;
// Collecteur d'air (P106) sur le support bas : sortie du coude 2 po vers le haut.
export const AIR = { x: -0.47, z: 0.25, yOut: 2.02 };

// ------------------------------------------------------------------ formes

/** Points d'un rectangle à coins arrondis (centre cx, cy ; w × h ; rayon r). */
export function rrect(cx, cy, w, h, r, n = 4) {
  const pts = [];
  const c = [[cx + w / 2 - r, cy + h / 2 - r, 0], [cx - w / 2 + r, cy + h / 2 - r, 0.5], [cx - w / 2 + r, cy - h / 2 + r, 1], [cx + w / 2 - r, cy - h / 2 + r, 1.5]];
  for (const [x, y, a0] of c) {
    for (let i = 0; i <= n; i++) {
      const a = (a0 + (i / n) * 0.5) * Math.PI;
      pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
    }
  }
  return pts;
}
/** Boutonnière (oblong) : centre, longueur hors tout, largeur, axe 'x' ou 'y'. */
export function obround(cx, cy, len, w, axis = 'y', n = 8) {
  const r = w / 2, h = len / 2 - r;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI;
    pts.push(axis === 'y' ? [cx + Math.cos(a) * r, cy + h + Math.sin(a) * r] : [cx + h + Math.sin(a) * r, cy - Math.cos(a) * r]);
  }
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (i / n) * Math.PI;
    pts.push(axis === 'y' ? [cx + Math.cos(a) * r, cy - h + Math.sin(a) * r] : [cx - h + Math.sin(a) * r, cy - Math.cos(a) * r]);
  }
  return pts;
}
/** Cercle en points (trou polygonal pour slab). */
export function circle(cx, cy, r, n = 16) {
  return Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * r]);
}

/**
 * Tôle découpée : contour [[x, y], ...] dans le plan XY, trous (contours de
 * points ou cercles [x, y, r]), épaisseur t selon Z centrée sur z = 0, arêtes
 * cassées (≈ 1 mm) comme une tôle oxycoupée et ébavurée.
 */
export function slab(outline, holes, t, mat, { seg = 16 } = {}) {
  const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
  for (const h of holes || []) {
    const p = new THREE.Path();
    if (h.length === 3 && typeof h[0] === 'number') p.absarc(h[0], h[1], h[2], 0, Math.PI * 2, true);
    else { const q = h.map(([x, y]) => new THREE.Vector2(x, y)); p.setFromPoints(THREE.ShapeUtils.isClockWise(q) ? q : q.reverse()); }
    shape.holes.push(p);
  }
  const mb = Math.min(t * 0.16, 0.0016);
  const geo = mb >= 0.0005
    ? new THREE.ExtrudeGeometry(shape, { depth: t - 2 * mb, bevelEnabled: true, bevelSize: mb, bevelThickness: mb, bevelOffset: -mb, bevelSegments: 1, curveSegments: seg })
    : new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: seg });
  geo.translate(0, 0, mb >= 0.0005 ? -(t - 2 * mb) / 2 : -t / 2);
  return S.merged([new THREE.Mesh(geo)], mat);
}

/**
 * Oriente une tôle construite par slab() : son plan local (u, v) devient le
 * plan (U, V) du repère de l'avance, l'épaisseur suit U × V ; centre à pos.
 */
export function orient(obj, U, V, pos = [0, 0, 0]) {
  const a = new THREE.Vector3(...U).normalize(), b = new THREE.Vector3(...V).normalize();
  const c = new THREE.Vector3().crossVectors(a, b);
  const g = S.group(obj);
  g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(a, b, c));
  g.position.set(...pos);
  g.updateMatrixWorld(true);
  return g;
}

/**
 * Tube rigide cintré (tuyauterie 3/8 po, conduites) : polyligne aux angles
 * arrondis de rayon rb, section ronde de rayon r.
 */
export function bentTube(points, r, rb, mat = 'steel', { radial = 10 } = {}) {
  const P = points.map((p) => new THREE.Vector3(...p));
  const path = new THREE.CurvePath();
  let cur = P[0].clone();
  for (let i = 1; i < P.length - 1; i++) {
    const a = P[i - 1], b = P[i], c = P[i + 1];
    const d1 = b.clone().sub(a), d2 = c.clone().sub(b);
    const l1 = d1.length(), l2 = d2.length();
    const k = Math.min(rb, l1 * 0.45, l2 * 0.45);
    const p1 = b.clone().addScaledVector(d1.normalize(), -k), p2 = b.clone().addScaledVector(d2.normalize(), k);
    if (cur.distanceTo(p1) > 1e-6) path.add(new THREE.LineCurve3(cur, p1));
    path.add(new THREE.QuadraticBezierCurve3(p1, b.clone(), p2));
    cur = p2;
  }
  path.add(new THREE.LineCurve3(cur, P[P.length - 1]));
  const n = Math.max(8, Math.min(160, Math.round(path.getLength() / 0.02)));
  const geo = new THREE.TubeGeometry(path, n, r, radial, false);
  geo.userData.edgeAngle = 70;
  return S.merged([new THREE.Mesh(geo)], mat);
}

/** Bague d'étanchéité rectangulaire (joint, bague de guidage) de rIn à rOut, y0 → y1, axe Y. */
export function seal(rIn, rOut, y0, y1, mat = 'rubber', seg = 32) {
  return S.lathe([[rIn, y0], [rOut, y0], [rOut, y1], [rIn, y1], [rIn, y0]], mat, { seg });
}
/** Joint torique (rayon moyen R, section ronde de rayon cs) dans le plan XZ à la hauteur y. */
export function oring(R, cs, y = 0, mat = 'rubber', seg = 32) {
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const a = -Math.PI / 2 + (i / 8) * Math.PI * 2;
    pts.push([R + cs * Math.cos(a), y + cs * Math.sin(a)]);
  }
  return S.lathe(pts, mat, { seg });
}
/** Racleur de tige à lèvre (profil en coin), alésage rIn, de y0 à y1 (lèvre en y1). */
export function wiper(rIn, rOut, y0, y1, mat = 'rubber', seg = 32) {
  const h = y1 - y0;
  return S.lathe([[rIn + (rOut - rIn) * 0.35, y0], [rOut, y0], [rOut, y1 - h * 0.25], [rIn + (rOut - rIn) * 0.45, y1], [rIn, y1], [rIn, y1 - h * 0.3], [rIn + (rOut - rIn) * 0.35, y0]], mat, { seg });
}

/** Vis à tête carrée à bout pointu (SQSS) d × len (po) : tête à pos, tige selon −axis. */
export function sqss(d, len, pos, axis, mat = 'steel') {
  const r = u(d) / 2, a = u(d), h = u(d) * 0.75;
  const parts = [
    S.box(a, h, a, mat, { r: u(d) * 0.05, pos: [0, h / 2, 0] }),
    S.lathe([[0, -u(len)], [r * 0.5, -u(len) + r * 0.4], ...S.thread(r, -u(len) + r * 0.6, 0, { pitch: u(d) * 0.15, maxTurns: 12 }), [r, 0], [0, 0]], mat, { seg: 14 }),
  ];
  return place(S.merged(parts, mat), pos, axis);
}

/**
 * Collier en P (« P-clamp ») d'alésage d (po) : boucle de feuillard gainée
 * (axe de la boucle selon Z, centre en y = yc) et patte double vers +X posée à
 * plat sur y = 0 ; userData.hole : axe du trou de la patte, userData.yc.
 */
export function pClamp(d, { w = 0.0127, mat = 'zinc', cushion = true } = {}) {
  const r = u(d) / 2 + (cushion ? 0.0025 : 0), t = 0.0012;
  const yc = r + t;
  const g = S.group(S.merged([
    S.ring(r + t, r, w, mat, { axis: 'z', seg: 20, pos: [0, yc, 0] }),
    S.box(r * 2.2, t * 2, w, mat, { pos: [r * 1.3, t, 0] }),
  ], mat));
  if (cushion) g.add(S.ring(r, r - 0.0022, w * 1.1, 'rubber', { axis: 'z', seg: 18, pos: [0, yc, 0] }));
  g.userData.hole = [r * 2.0, 0, 0];
  g.userData.yc = yc;
  return g;
}

/** Sertissage de flexible et écrou tournant JIC (gros diamètre), le long de +Y depuis le siège. */
export function hoseEnd(R, nutAF, mat = 'steel') {
  const nh = nutAF * 0.62;
  const prof = [[0, nh * 0.8], [R * 0.85, nh * 0.8], [R * 0.85, nh + 0.006], [R * 1.12, nh + 0.008]];
  const L = R * 4.2;
  for (const t of [0.3, 0.55, 0.8]) {
    const y = nh + 0.008 + L * t;
    prof.push([R * 1.12, y - 0.006], [R * 1.05, y - 0.003], [R * 1.05, y + 0.003], [R * 1.12, y + 0.006]);
  }
  prof.push([R * 1.12, nh + 0.008 + L], [R * 1.02, nh + 0.012 + L], [0, nh + 0.012 + L]);
  const g = S.group(S.merged([S.nut(nutAF, nh, mat, { pos: [0, nh / 2, 0] }), S.lathe(prof, mat, { seg: 24 })], mat));
  g.userData.len = nh + 0.012 + L;
  return g;
}

/**
 * Cordons de soudure le long de segments [[a, b], ...] (merged), matériau de
 * la pièce ; pas de contours sur les écailles.
 */
export function welds(segs, size, mat) {
  const m = S.merged(segs.map(([a, b]) => S.weld([a, b], size, mat)), mat);
  m.geometry.userData.edgeAngle = 75;
  return m;
}

/** Fusion de pièces de même matériau tout en gardant le groupe vide d'enfants (raccourci). */
export const M = (objs, mat) => S.merged(objs.filter(Boolean), mat);

/** Vecteur. */
export const v3 = (...a) => new THREE.Vector3(...a);

// ------------------------------------------------------------------ raccords allégés

/** Mâle JIC 37° de taille n le long de +Y depuis y0 (collerette, filet, cône), profil de lathe. */
function jicMale(n, y0) {
  const r = size(n).jic / 2, L = size(n).jic * 0.95 + 0.004;
  return [[0, y0], [r * 0.95, y0], [r * 0.95, y0 + 0.002], [r * 0.8, y0 + 0.002], [r * 0.8, y0 + L * 0.2],
    ...S.thread(r, y0 + L * 0.22, y0 + L * 0.74, { pitch: r * 0.22, maxTurns: 3, chamferBottom: false }),
    [r * 0.86, y0 + L * 0.8], [r * 0.68, y0 + L], [r * 0.42, y0 + L], [0, y0 + L]];
}
export const jicLen = (n) => size(n).jic * 0.95 + 0.004;

/**
 * Coude de traversée 90° JIC (FA01001 / FA01000) allégé : même repère et mêmes
 * sièges que bulkheadElbow() de _avance_a.js (tôle en y ∈ [0, t], mâle JIC
 * extérieur selon +Y avec contre-écrou, coude intérieur dont le mâle sort
 * selon +X) ; ports : [extérieur, intérieur].
 */
export function bulkElbow(n, { t = 0.25 * 0.0254, mat = 'zinc' } = {}) {
  const s = size(n);
  const rb = s.jic * 0.62 + 0.003, nh = s.hex * 0.38, af = s.hex * 1.15;
  const len = t + nh + 0.004, rc = s.jic * 0.62, yc = -0.003 - rc * 1.4;
  const body = S.lathe([[0, yc - rc], [rc * 0.7, yc - rc * 0.9], [rc * 1.05, yc - rc * 0.4], [rc * 1.05, -0.003], [rb, -0.003],
    ...S.thread(rb, 0, len, { pitch: rb * 0.3, maxTurns: 5, chamferBottom: false }), ...jicMale(n, len + 0.001).slice(1)], mat, { seg: 12 });
  const arm = S.lathe([[0, 0], [rc, 0], [rc, rc * 1.2], ...jicMale(n, rc * 1.2 + 0.002).slice(1)], mat, { seg: 12 });
  const g = S.group(S.merged([
    body, S.nut(af, nh, mat, { pos: [0, t + nh / 2, 0] }),
    S.ring(af * 0.55, rb, 0.002, mat, { seg: 16, pos: [0, -0.001, 0] }),
    place(arm, [0, yc, 0], [1, 0, 0]),
  ], mat));
  g.userData.ports = [
    { p: v3(0, len + 0.001 + jicLen(n), 0), d: v3(0, 1, 0) },
    { p: v3(rc * 1.2 + 0.002 + jicLen(n), yc, 0), d: v3(1, 0, 0) },
  ];
  return g;
}

/**
 * Adaptateur droit allégé (FA01055 / FA01033) : bout fileté (ORB à joint ou
 * NPT conique) vissé selon −Y sous y = 0, six pans, mâle JIC (taille nB)
 * selon +Y ; port : bout du cône.
 */
export function adapter(kind, nA, nB, { mat = 'zinc', long = 0 } = {}) {
  const a = size(nA), b = size(nB);
  const af = Math.max(a.hex, b.hex), hh = af * 0.42;
  const ra = (kind === 'npt' ? a.npt : a.jic) / 2, La = ra * 1.7 + 0.003;
  const tail = kind === 'npt'
    ? [[ra * 0.55, -La], ...S.thread(ra * 0.94, -La, -0.002, { r1: ra, pitch: ra * 0.26, maxTurns: 4 }), [ra * 0.9, 0]]
    : [[ra * 0.45, -La], [ra * 0.85, -La], ...S.thread(ra, -La + 0.0006, -La * 0.3, { pitch: ra * 0.22, maxTurns: 4 }), [ra * 0.82, -La * 0.25], [ra * 0.82, 0]];
  const y1 = hh + long;
  const g = S.group(S.merged([
    S.lathe([[0, -La], ...tail, [af * 0.4, 0], [af * 0.4, hh], [b.jic * 0.42, hh], [b.jic * 0.42, y1], ...jicMale(nB, y1).slice(1)], mat, { seg: 12 }),
    S.nut(af, hh * 0.9, mat, { pos: [0, hh * 0.5, 0] }),
  ], mat));
  if (kind === 'orb') g.add(S.torus(ra * 0.95, Math.max(0.0008, ra * 0.1), 'rubber', { pos: [0, -0.001, 0] }));
  g.userData.ports = [{ p: v3(0, y1 + jicLen(nB), 0), d: v3(0, 1, 0) }];
  return g;
}

/**
 * Coude 90° (ou 45°) allégé ORB / NPT → JIC (FA01052, FA01051, FA01032,
 * FA01031) : bout fileté selon −Y, corps forgé, mâle JIC sortant vers +X (90°)
 * ou à 45° dans le plan XY ; port : bout du cône.
 */
export function elbowLite(kind, nA, nB, { angle = 90, mat = 'zinc' } = {}) {
  const a = size(nA), b = size(nB);
  const rbd = Math.max(a.jic, b.jic) * 0.55;
  const ra = (kind === 'npt' ? a.npt : a.jic) / 2, La = ra * 1.7 + 0.003;
  const parts = [];
  let y0 = 0;
  if (kind === 'orb') {
    const nh = a.hex * 0.42;
    parts.push(S.nut(a.hex, nh, mat, { pos: [0, 0.0016 + nh / 2, 0] }), S.ring(a.hex * 0.62, a.jic * 0.5, 0.0016, mat, { seg: 16, pos: [0, 0.0008, 0] }));
    parts.push(S.lathe([[ra * 0.45, -La], [ra * 0.85, -La], ...S.thread(ra, -La + 0.0006, -La * 0.3, { pitch: ra * 0.22, maxTurns: 4 }), [ra * 0.82, 0], [ra * 0.8, nh + 0.005], [0, nh + 0.005]], mat, { seg: 12 }));
    y0 = nh + 0.005;
  } else {
    parts.push(S.lathe([[ra * 0.55, -La], ...S.thread(ra * 0.94, -La, -0.002, { r1: ra, pitch: ra * 0.26, maxTurns: 4 }), [ra, 0], [ra, 0.004], [0, 0.004]], mat, { seg: 12 }));
    y0 = 0.004;
  }
  const yc = y0 + rbd * 1.1;
  parts.push(S.lathe([[0, y0], [rbd, y0], [rbd, yc], [rbd * 0.7, yc + rbd * 0.7], [0, yc + rbd]], mat, { seg: 12 }));
  const t = (angle * Math.PI) / 180;
  const dir = v3(Math.sin(t), Math.cos(t), 0);
  const arm = S.lathe([[0, 0], [rbd * 0.92, 0], [rbd * 0.92, rbd * 1.2], [b.jic * 0.42, rbd * 1.2 + 0.002], ...jicMale(nB, rbd * 1.2 + 0.002).slice(1)], mat, { seg: 12 });
  parts.push(place(arm, [0, yc, 0], dir.toArray()));
  const g = S.group(S.merged(parts, mat));
  if (kind === 'orb') g.add(S.torus(ra * 0.95, Math.max(0.0008, ra * 0.1), 'rubber', { pos: [0, 0.0004, 0] }));
  g.userData.ports = [{ p: v3(0, yc, 0).addScaledVector(dir, rbd * 1.2 + 0.002 + jicLen(nB)), d: dir }];
  return g;
}

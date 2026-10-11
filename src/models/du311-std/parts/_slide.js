// Aides partagées du lot « glissière et MCP » du DU311 sur roues (P156 à
// P204) : cotes communes tirées de ../slide.js (SLIDE, MCP), repères des
// composants, quincaillerie en pouces et raccords NPT / JIC. Fichier préfixé
// « _ » : non inscrit comme assemblage.
//
// Repères :
// - machine (../layout.js) : origine au sol sous l'articulation, X vers
//   l'avance, Y vers le haut, Z à droite. P168, P186, P188, P196, P200, P202
//   y sont dessinés (placés à l'identité par P164).
// - P170 (glissière) : origine au centre du carter de l'actionneur rotatif
//   (AC), axes de la machine, cadre dressé (basculement nul).
// - P180 (châssis avant) : origine au milieu de la face arrière (appui sur le
//   nez du porteur), au niveau du dessous du châssis (DECK), axes de la
//   machine.
import { SLIDE, MCP } from '../slide.js';
import { M } from '../layout.js';

export { IN, u, L, along, hexPrism, hhcs, shcs, sqss, setScrew, hexNut, flatWasher, splitWasher, nordLock, jicAdapter, jicElbow, orbPlug, sphericalBearing, greaseNipple, bushing, pin, oring } from '../../du311/parts/_avance_b.js';
export { hexScrew, socketScrew, washerD, pose } from '../../du311/parts/P172.js';
export { cbValve, zerk } from '../../du311/parts/P176.js';
export { SLIDE, MCP };

const IN_ = 0.0254;

// Centre du carter de l'actionneur rotatif (repère machine) : la bride de
// sortie (face d'appui du MCP) est à 0.297 m du centre, sur SLIDE.face.
export const AC = [SLIDE.face - 0.297, SLIDE.rot.y, 0];

// Cotes de la glissière P170 dans son repère (origine AC).
export const G = {
  // barres de glissement Ø 4 po (bagues Garlock 4 × 4 1/2 × 6), devant les tubes de l'actionneur
  barX: 0.13, barY: 0.36, barR: 2 * IN_,
  // colonnes du cadre (caissons d'about) : plan médian ±colZ, largeur colW
  colZ: 0.77, colW: 0.14, colTop: 0.45, colBot: -0.45, colFront: 0.215, colRear: -0.37,
  // arbre de basculement (axe SLIDE.pivot), Ø 3 1/2 po
  pivot: [SLIDE.pivot.x - AC[0], SLIDE.pivot.y - AC[1]], pivotR: 1.75 * IN_,
  // vérins de translation : axes à ±cylY, devant ; œil de fond sur la colonne −Z,
  // œil de tige sur les bras de la plaque RH (glissière au milieu)
  cylX: 0.13, cylY: 0.51, cylZ0: -0.77, rodZ: 0.50,
  // axes des œils de tige des vérins de basculement (SLIDE.dump.b)
  dumpPin: [SLIDE.dump.b[0] - AC[0], SLIDE.dump.b[1] - AC[1]], dumpZ: SLIDE.dump.z,
  // plaques porte-actionneur : face intérieure contre le carter, épaisseur 1 po, bossages 6 po
  plateZ: 0.166, plateT: IN_, bossL: 6 * IN_, bossR: 0.08,
  flangeX: 0.297,
};

// Origine de P180 (repère machine) : milieu de la face arrière, dessous du châssis.
export const DECK = [M.nose, 0.5, 0];

// Vis de fixation du châssis avant sur le nez du porteur (P168 rep. 7) : douze
// vis 1 po dans la paroi arrière de P180, en deux groupes de deux colonnes (repère machine).
export const DECK_BOLTS = [-0.3, -0.2, 0.2, 0.3].flatMap((z) => [0.62, 0.76, 0.9].map((y) => [M.nose + 0.032, y, z]));

/** Point du repère de P170 → repère machine (cadre dressé). */
export const g2m = ([x, y, z]) => [AC[0] + x, AC[1] + y, AC[2] + z];

/** Pose un objet dont les axes locaux (x, y, z) deviennent ex, ey, ez. */
export function frame(THREE, obj, p, ex, ey, ez) {
  const g = new THREE.Group();
  g.add(obj);
  g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...ex), new THREE.Vector3(...ey), new THREE.Vector3(...ez)));
  g.position.set(...p);
  return g;
}

/** Arc de cercle (cx, cy, r) de a0 à a1, n segments, en points [x, y]. */
export const arc = (cx, cy, r, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, i) => {
  const a = a0 + ((a1 - a0) * i) / n;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});

/** Aire signée d'un contour (sens trigonométrique > 0). */
export function ccw(pts) {
  let a = 0;
  pts.forEach(([x0, y0], i) => { const [x1, y1] = pts[(i + 1) % pts.length]; a += x0 * y1 - x1 * y0; });
  return a < 0 ? pts.slice().reverse() : pts;
}

/** Tôle découpée selon Z : contour [[x, y], …] extrudé de z0 à z1, trous [x, y, r]. */
export function slabZ(S, pts, z0, z1, mat, holes = []) {
  const m = S.extrude(ccw(pts), Math.abs(z1 - z0), mat, { holes });
  m.position.z = (z0 + z1) / 2;
  return m;
}

/** Tôle découpée selon X : contour [[z, y], …] (z vers la droite) extrudé de x0 à x1. */
export function slabX(S, pts, x0, x1, mat, holes = []) {
  // contour dans le plan (u = −z, v = y) puis rotation : +Z local → +X
  const m = S.extrude(ccw(pts.map(([z, y]) => [-z, y])), Math.abs(x1 - x0), mat, { holes: holes.map(([z, y, r]) => [-z, y, r]) });
  m.geometry.rotateY(Math.PI / 2);
  m.position.x = (x0 + x1) / 2;
  return m;
}

/** Tôle découpée selon Y : contour [[x, z], …] extrudé de y0 à y1. */
export function slabY(S, pts, y0, y1, mat, holes = []) {
  const m = S.extrude(ccw(pts.map(([x, z]) => [x, -z])), Math.abs(y1 - y0), mat, { holes: holes.map(([x, z, r]) => [x, -z, r]) });
  m.geometry.rotateX(-Math.PI / 2);
  m.position.y = (y0 + y1) / 2;
  return m;
}

/** Tube (bossage, bague) le long de Z de z0 à z1, centré en (x, y). */
export const tubeZ = (S, ro, ri, z0, z1, mat, x = 0, y = 0, seg = 32) =>
  S.at(S.lathe([[ri, z0], [ro, z0], [ro, z1], [ri, z1], [ri, z0]], mat, { axis: 'z', seg }), [x, y, 0]);

/** Boîte de x0..x1, y0..y1, z0..z1 (arêtes adoucies r). */
export const bx = (S, x0, x1, y0, y1, z0, z1, mat, r = 0) =>
  S.at(S.box(x1 - x0, y1 - y0, z1 - z0, mat, r ? { r } : {}), [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2]);

// ---------------------------------------------------------------- raccords NPT / JIC (le long de +Y)

const JR = { 2: 0.156, 4: 0.2185, 6: 0.281, 8: 0.375, 12: 0.531, 16: 0.656, 24: 0.938, 32: 1.25 }; // rayon du filet JIC (po)
const NR = { 2: 0.2, 4: 0.27, 6: 0.34, 8: 0.42, 12: 0.525, 16: 0.66, 24: 0.95, 32: 1.19 }; // rayon du filet NPT (po)

/** Nez JIC 37° (po) de y0 vers +Y, rayon rj. */
function jicNose(S, rj, y0) {
  return [[0, y0], [rj * 0.8, y0], [rj * 0.8, y0 + 0.06], ...S.thread(rj, y0 + 0.06, y0 + rj * 1.6, { pitch: 0.06, maxTurns: 5, chamferBottom: false }), [rj * 0.72, y0 + rj * 2.0], [rj * 0.45, y0 + rj * 2.0], [0, y0 + rj * 2.0]];
}

/**
 * Raccord de traversée de cloison (FA01035, MNPT → MJIC) le long de +Y : nez JIC
 * vers +Y, contre-écrou six-pans posé sur la face de la tôle à y = 0, corps
 * fileté à travers la tôle (épaisseur t, po), six-pans d'appui sous la tôle,
 * queue NPT vers −Y. En mètres, axe Y.
 */
export function bulkhead(S, THREE, dash = 6, { t = 0.375, mat = 'zinc', hexes } = {}) {
  const rj = JR[dash], rn = NR[dash] ?? rj;
  const a = Math.max(rj * 2.6 + 0.1, 0.5);
  const g = [];
  g.push(hexes ?? null);
  // contre-écrou dessus
  g.push(hexPrismIn(S, THREE, a + 0.12, rj * 1.0, 0, rj * 0.95, mat));
  // corps fileté à travers la tôle et nez JIC
  g.push(lin(S, [[0, -t - 0.02], [rj * 1.02, -t - 0.02], ...S.thread(rj * 1.02, -t, rj * 1.0 + 0.1, { pitch: 0.07, maxTurns: 4, chamferBottom: false }), ...jicNose(S, rj, rj * 1.0 + 0.1).slice(1)], mat, 14));
  // six-pans d'appui sous la tôle et queue NPT
  g.push(hexPrismIn(S, THREE, a + 0.06, rj * 0.8, -t - rj * 0.8, 0, mat));
  g.push(lin(S, [[0, -t - rj * 0.8 - rn * 1.7], ...S.thread(rn * 0.95, -t - rj * 0.8 - rn * 1.7, -t - rj * 0.8, { r1: rn * 1.05, pitch: 0.06, maxTurns: 5 }), [0, -t - rj * 0.8]], mat, 14));
  return S.merged(g.filter(Boolean), mat);
}

/**
 * Coude 90° NPT femelle → JIC mâle (FA01036, FA01032) le long de +Y : corps
 * taraudé posé à y = 0 (vissé sur une queue NPT), nez JIC vers +X.
 * male : queue NPT mâle (FA01032) au lieu du taraudage.
 */
export function nptElbow(S, THREE, dash = 6, { male = false, nptDash, mat = 'zinc' } = {}) {
  const rj = JR[dash], rn = NR[nptDash ?? dash];
  const a = Math.max(rn, rj) * 2.4 + 0.08;
  const B = Math.max(rn, rj) * 1.9;
  const g = [];
  g.push(lin(S, [[male ? 0 : rn * 0.9, 0], [a * 0.5, 0], [a * 0.5, B + a * 0.3], [a * 0.42, B + a * 0.5], [0, B + a * 0.5]], mat, 20));
  if (!male) g.push(hexPrismIn(S, THREE, a, a * 0.45, 0, rn * 0.9, mat));
  else g.push(lin(S, [[0, -rn * 1.6], ...S.thread(rn * 0.95, -rn * 1.6, 0, { r1: rn * 1.05, pitch: 0.06, maxTurns: 5 }), [0, 0]], mat, 14));
  const arm = lin(S, [[0, 0], [a * 0.45, 0], [a * 0.45, B * 0.9], [0, B * 0.9]], mat, 20);
  arm.rotation.z = -Math.PI / 2;
  arm.position.y = u_(B * 0.75);
  g.push(arm);
  const nose = lin(S, jicNose(S, rj, B * 0.9), mat, 16);
  nose.rotation.z = -Math.PI / 2;
  nose.position.y = u_(B * 0.75);
  g.push(nose);
  return S.merged(g, mat);
}

/**
 * Union coudée 90° de traversée (FA01001, MJIC → MJIC à contre-écrou) le long de
 * +Y : branche droite traversant la tôle (face à y = 0, épaisseur t, po) avec son
 * contre-écrou, nez JIC sous la tôle vers −Y, coude dessus et nez JIC vers +X.
 */
export function bulkheadElbow(S, THREE, dash = 6, { t = 0.375, mat = 'zinc' } = {}) {
  const rj = JR[dash];
  const a = rj * 2.6 + 0.1;
  const g = [];
  g.push(hexPrismIn(S, THREE, a + 0.12, rj * 1.0, 0, rj * 0.95, mat));
  // traversée et nez JIC sous la tôle
  const below = jicNose(S, rj, 0).map(([r, y]) => [r, -y - t - 0.1]).reverse();
  g.push(lin(S, [...below.slice(0, -1), [rj * 1.02, -t - 0.1], ...S.thread(rj * 1.02, -t, rj, { pitch: 0.07, maxTurns: 3, chamferBottom: false }), [rj * 1.02, rj * 1.0], [0, rj * 1.0]], mat, 14));
  // corps coudé au-dessus du contre-écrou
  const B = rj * 1.9;
  g.push(lin(S, [[0, rj], [a * 0.48, rj], [a * 0.48, rj + B + a * 0.25], [a * 0.4, rj + B + a * 0.45], [0, rj + B + a * 0.45]], mat, 20));
  const arm = lin(S, [[0, 0], [a * 0.44, 0], [a * 0.44, B * 0.9], [0, B * 0.9]], mat, 20);
  arm.rotation.z = -Math.PI / 2;
  arm.position.y = u_(rj + B * 0.75);
  g.push(arm);
  const nose = lin(S, jicNose(S, rj, B * 0.9), mat, 16);
  nose.rotation.z = -Math.PI / 2;
  nose.position.y = u_(rj + B * 0.75);
  g.push(nose);
  return S.merged(g, mat);
}

/** Réduction JIC femelle → JIC mâle (FA01006) le long de +Y : écrou tournant à y = 0, nez JIC plus petit vers +Y. */
export function jicReducer(S, THREE, dash = 8, small = 6, { mat = 'zinc' } = {}) {
  const rf = JR[dash], rs = JR[small];
  const a = rf * 2.6 + 0.12;
  return S.merged([
    hexPrismIn(S, THREE, a, rf * 1.5, 0, rf * 0.7, mat),
    hexPrismIn(S, THREE, rs * 2.6 + 0.1, rs * 0.9, rf * 1.5, 0, mat),
    lin(S, jicNose(S, rs, rf * 1.5 + rs * 0.9), mat, 14),
  ], mat);
}

/** Écrou tournant JIC femelle seul (bout de tube ou de flexible), de y = 0 à +Y, alésage rj. */
export function jicNut(S, THREE, dash = 6, { mat = 'zinc' } = {}) {
  const rj = JR[dash];
  return hexPrismIn(S, THREE, rj * 2.6 + 0.12, rj * 1.6, 0, rj * 0.75, mat);
}

/** Bouchon NPT à six-pans creux noyé (FA01215) : tête affleurante à y = 0, queue conique vers −Y. */
export function nptPlug(S, THREE, dash = 2, { mat = 'zinc' } = {}) {
  const rn = NR[dash];
  const hx = rn * 0.45 / Math.cos(Math.PI / 6);
  return S.merged([
    lin(S, [[hx, -rn * 0.5], [rn * 1.05, -rn * 0.5], [rn * 1.05, 0.02], [hx, 0.02]], mat, 16),
    lin(S, [[0, -rn * 1.6], ...S.thread(rn * 0.95, -rn * 1.6, -rn * 0.5, { r1: rn * 1.05, pitch: 0.06, maxTurns: 4 }), [rn * 1.05, -rn * 0.5], [hx, -rn * 0.5], [0, -rn * 0.7]], mat, 14),
  ], mat);
}

/** Bouchon NPT à tête six-pans pleine (FA04027) : tête de y = 0 à +Y, queue conique vers −Y. */
export function hexPlug(S, THREE, dash = 8, { mat = 'steel' } = {}) {
  const rn = NR[dash];
  return S.merged([
    hexPrismIn(S, THREE, rn * 2.3, rn * 0.9, 0, 0, mat),
    lin(S, [[0, -rn * 1.4], ...S.thread(rn * 0.95, -rn * 1.4, 0, { r1: rn * 1.05, pitch: 0.07, maxTurns: 5 }), [0, 0]], mat, 16),
  ], mat);
}

// Aides internes (po → m).
const u_ = (v) => v * IN_;
function lin(S, pts, mat, seg = 24) {
  return S.lathe(pts.map(([r, y]) => [u_(r), u_(y)]), mat, { seg });
}
function hexPrismIn(S, THREE, a, h, y0, r0, mat) {
  const R = a / 2 / Math.cos(Math.PI / 6);
  const c = Math.min(a * 0.05, h * 0.25);
  const side = [[R, y0], [R, y0 + h - c], [R - c * 1.7, y0 + h]];
  const m = lin(S, r0 > 0 ? [[r0, y0], ...side, [r0, y0 + h], [r0, y0]] : [[0, y0], ...side, [0, y0 + h]], mat, 6);
  m.children[0].rotation.y = Math.PI / 6;
  return m;
}

/** Graisseur droit 1/8 NPT (CP004817) le long de +Y : queue sous y = 0, six-pans 7/16, tête à bille. */
export function grease18(S, THREE, { mat = 'brass' } = {}) {
  return S.merged([
    lin(S, [[0, -0.28], ...S.thread(0.19, -0.28, -0.02, { r1: 0.205, pitch: 0.055, maxTurns: 4 }), [0, -0.02]], mat, 10),
    hexPrismIn(S, THREE, 0.4375, 0.2, 0, 0, mat),
    lin(S, [[0, 0.2], [0.11, 0.2], [0.11, 0.36], [0.15, 0.4], [0.15, 0.48], [0.08, 0.54], [0, 0.55]], mat, 12),
  ], mat);
}

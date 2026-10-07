import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mat } from '../../viewer/materials.js';

// Chenille (F05), maillons (F06) et moteur hydraulique OMS 100 (F07).
// Repère de la chenille : X vers l'avant, Y vers le haut, +Z vers l'extérieur.

const PI = Math.PI;

// ------------------------------------------------------------ aides géométriques
// Géométries non indexées (position + normale), fusionnées par matériau.
// Exportées pour general.js.

/** Normales lissées entre faces voisines d'angle < deg (arêtes vives conservées), pondérées par l'aire. */
export function crease(geo, deg = 35) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const p = g.attributes.position.array;
  const nt = p.length / 9;
  const fu = new Float32Array(nt * 3), fa = new Float32Array(nt * 3);
  const map = new Map();
  // Clé numérique : position quantifiée à 0,2 mm (|coord| < 6,5 m).
  const key = (i) => (Math.round(p[i] * 5e3) + 32768) * 4294967296 + (Math.round(p[i + 1] * 5e3) + 32768) * 65536 + (Math.round(p[i + 2] * 5e3) + 32768);
  const keys = new Float64Array(nt * 3);
  for (let t = 0; t < nt; t++) {
    const o = t * 9;
    const ux = p[o + 3] - p[o], uy = p[o + 4] - p[o + 1], uz = p[o + 5] - p[o + 2];
    const vx = p[o + 6] - p[o], vy = p[o + 7] - p[o + 1], vz = p[o + 8] - p[o + 2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    const l = Math.hypot(cx, cy, cz) || 1;
    fa[t * 3] = cx; fa[t * 3 + 1] = cy; fa[t * 3 + 2] = cz;
    fu[t * 3] = cx / l; fu[t * 3 + 1] = cy / l; fu[t * 3 + 2] = cz / l;
    for (let k = 0; k < 3; k++) {
      const kk = key(o + k * 3);
      keys[t * 3 + k] = kk;
      let a = map.get(kk);
      if (!a) map.set(kk, (a = []));
      a.push(t);
    }
  }
  const cosT = Math.cos((deg * PI) / 180);
  const out = new Float32Array(p.length);
  for (let t = 0; t < nt; t++) {
    for (let k = 0; k < 3; k++) {
      let sx = 0, sy = 0, sz = 0;
      for (const u of map.get(keys[t * 3 + k])) {
        if (fu[t * 3] * fu[u * 3] + fu[t * 3 + 1] * fu[u * 3 + 1] + fu[t * 3 + 2] * fu[u * 3 + 2] >= cosT) {
          sx += fa[u * 3]; sy += fa[u * 3 + 1]; sz += fa[u * 3 + 2];
        }
      }
      const l = Math.hypot(sx, sy, sz) || 1;
      const o = t * 9 + k * 3;
      out[o] = sx / l; out[o + 1] = sy / l; out[o + 2] = sz / l;
    }
  }
  for (const k of Object.keys(g.attributes)) if (k !== 'position') g.deleteAttribute(k);
  g.setAttribute('normal', new THREE.BufferAttribute(out, 3));
  return g;
}

/** Position / rotation (radians) / échelle appliquées à une géométrie. */
export function tf(geo, pos = null, rot = null, scl = null) {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...(pos || [0, 0, 0])),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rot || [0, 0, 0]))),
    new THREE.Vector3(...(scl || [1, 1, 1])),
  );
  return geo.applyMatrix4(m);
}

function clean(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
  if (!g.attributes.normal) g.computeVertexNormals();
  return g;
}

/** Fusionne une liste (imbriquée) de géométries. */
export function merge(...list) {
  const src = list.flat(Infinity).filter(Boolean);
  // Seuil des contours (ressorts, flexibles) conservé.
  const ea = Math.max(0, ...src.map((g) => g.userData.edgeAngle || 0));
  const geos = src.map(clean);
  const out = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
  if (ea) out.userData.edgeAngle = ea;
  return out;
}

/** Un maillage d'un seul matériau à partir de géométries placées. */
export function M(material, ...geos) {
  return new THREE.Mesh(merge(geos), mat(material));
}

export function G(...children) {
  const g = new THREE.Group();
  children.flat().forEach((c) => c && g.add(c));
  return g;
}

/** Révolution autour de Y d'un profil [[r, y], ...] (centre bas → extérieur → centre haut). */
export function revolve(profile, seg = 24, deg = 35) {
  const pos = [];
  const P = (r, y, a) => [r * Math.sin(a), y, r * Math.cos(a)];
  for (let i = 0; i < profile.length - 1; i++) {
    const [r0, y0] = profile[i], [r1, y1] = profile[i + 1];
    if (Math.hypot(r1 - r0, y1 - y0) < 1e-9) continue;
    for (let j = 0; j < seg; j++) {
      const a0 = (j / seg) * 2 * PI, a1 = ((j + 1) / seg) * 2 * PI;
      const A = P(r0, y0, a0), B = P(r0, y0, a1), C = P(r1, y1, a0), D = P(r1, y1, a1);
      if (r0 > 1e-9) pos.push(...A, ...B, ...C);
      if (r1 > 1e-9) pos.push(...B, ...D, ...C);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return crease(g, deg);
}

/** Oriente une géométrie construite selon Y vers l'axe donné. */
export function axis(geo, a) {
  if (a === 'x') geo.rotateZ(-PI / 2);
  else if (a === '-x') geo.rotateZ(PI / 2);
  else if (a === 'z') geo.rotateX(PI / 2);
  else if (a === '-z') geo.rotateX(-PI / 2);
  else if (a === '-y') geo.rotateX(PI);
  return geo;
}

/** Points d'un cercle (ou d'un arc a0 → a1). */
export function circ(cx, cy, r, n = 16, a0 = 0, a1 = 2 * PI) {
  const pts = [];
  const full = Math.abs(a1 - a0 - 2 * PI) < 1e-9;
  const m = full ? n : n + 1;
  for (let i = 0; i < m; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

/** Rectangle à coins arrondis centré en (cx, cy). */
export function rrect(cx, cy, w, h, r, n = 3) {
  r = Math.min(r, w / 2, h / 2);
  const pts = [];
  const c = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, PI / 2], [-w / 2 + r, -h / 2 + r, PI], [w / 2 - r, -h / 2 + r, 1.5 * PI]];
  for (const [x, y, a] of c) {
    if (r <= 0) { pts.push([cx + x, cy + y]); continue; }
    for (let i = 0; i <= n; i++) {
      const t = a + (i / n) * (PI / 2);
      pts.push([cx + x + Math.cos(t) * r, cy + y + Math.sin(t) * r]);
    }
  }
  return pts;
}

function toShape(outer, holes = []) {
  const v2 = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
  const o = v2(outer);
  if (THREE.ShapeUtils.isClockWise(o)) o.reverse();
  const s = new THREE.Shape(o);
  for (const h of holes) {
    const hp = v2(h);
    if (!THREE.ShapeUtils.isClockWise(hp)) hp.reverse();
    s.holes.push(new THREE.Path(hp));
  }
  return s;
}

/**
 * Contour [[x, y]] extrudé selon Z (centré), trous éventuels, arêtes chanfreinées
 * (bevel : faces au contour nominal, flancs débordant du chanfrein).
 */
export function ext(outer, depth, { holes = [], bevel = 0, bevelSeg = 1, deg = 30 } = {}) {
  const core = depth - 2 * bevel;
  const g = new THREE.ExtrudeGeometry(toShape(outer, holes), {
    depth: core, steps: 1, curveSegments: 4,
    bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelOffset: 0, bevelSegments: bevelSeg,
  });
  g.translate(0, 0, -core / 2);
  return crease(g, deg);
}

/** Plaque de contour [[x, z]] (plan XZ) d'épaisseur selon Y, de y0 à y1. */
export function slabXZ(outer, y0, y1, o = {}) {
  const flipZ = (pts) => pts.map(([x, z]) => [x, -z]);
  const g = ext(flipZ(outer), Math.abs(y1 - y0), { ...o, holes: (o.holes || []).map(flipZ) });
  g.rotateX(-PI / 2);
  g.translate(0, (y0 + y1) / 2, 0);
  return g;
}

/** Plaque de contour [[x, y]] (plan XY) d'épaisseur selon Z, de z0 à z1. */
export function slabXY(outer, z0, z1, o = {}) {
  const g = ext(outer, Math.abs(z1 - z0), o);
  g.translate(0, 0, (z0 + z1) / 2);
  return g;
}

/** Prisme de section [[z, y]] (plan ZY) extrudé selon X, de x0 à x1. */
export function prismX(outer, x0, x1, o = {}) {
  const flip = (pts) => pts.map(([z, y]) => [-z, y]);
  const g = ext(flip(outer), Math.abs(x1 - x0), { ...o, holes: (o.holes || []).map(flip) });
  g.rotateY(PI / 2);
  g.translate((x0 + x1) / 2, 0, 0);
  return g;
}

/** Boîte à arêtes adoucies (chanfrein bevel). */
export function boxG(w, h, d, bevel = 0.002, pos = null) {
  const b = Math.min(bevel, w / 3, h / 3, d / 3);
  const g = ext(rrect(0, 0, w, h, b * 1.2, 1), d, { bevel: b, deg: 40 });
  return pos ? g.translate(...pos) : g;
}

/** Cylindre chanfreiné selon Y. */
export function cylG(r, len, seg = 20, c = 0.0015, r2 = r) {
  const h = len / 2;
  c = Math.min(c, r * 0.2, len * 0.2);
  return revolve([[0, -h], [r - c, -h], [r, -h + c], [r2, h - c], [r2 - c, h], [0, h]], seg, 40);
}

/** Tube creux (paroi visible en coupe) selon Y. */
export function tubeG(rOut, rIn, len, seg = 24, c = 0.0015) {
  const h = len / 2;
  return revolve([[rIn, -h], [rOut - c, -h], [rOut, -h + c], [rOut, h - c], [rOut - c, h], [rIn, h], [rIn, -h]], seg, 40);
}

/** Six-pans (écrou si hole > 0) chanfreiné, axe Y, centré. */
export function hexG(af, h, hole = 0) {
  const R = af / Math.sqrt(3);
  const c = R * 0.13, cy = c * 0.6;
  const prof = hole > 0
    ? [[hole, -h / 2], [R - c, -h / 2], [R, -h / 2 + cy], [R, h / 2 - cy], [R - c, h / 2], [hole, h / 2], [hole, -h / 2]]
    : [[0, -h / 2], [R - c, -h / 2], [R, -h / 2 + cy], [R, h / 2 - cy], [R - c, h / 2], [0, h / 2]];
  return revolve(prof, 6, 30).rotateY(PI / 6);
}

/** Tête de vis six-pans avec rondelle, posée sur le plan y = 0 (vers +Y). */
export function boltHeadG(af, h, washer = true) {
  const w = washer ? af * 0.08 : 0;
  const geos = [tf(hexG(af, h), [0, h / 2 + w, 0])];
  if (washer) geos.push(revolve([[0, 0], [af * 0.95, 0], [af * 0.95, w], [0, w]], 12, 40));
  return merge(geos);
}

/** Copie miroir selon Z (ordre des sommets rétabli). */
export function mirrorZ(geo) {
  const g = clean(geo.clone());
  g.scale(1, 1, -1);
  const arrs = [g.attributes.position.array, g.attributes.normal.array];
  for (const a of arrs) {
    for (let i = 0; i < a.length; i += 9) {
      for (let k = 0; k < 3; k++) { const t = a[i + 3 + k]; a[i + 3 + k] = a[i + 6 + k]; a[i + 6 + k] = t; }
    }
  }
  return g;
}

/** Ressort hélicoïdal le long de X (spires d'extrémité rapprochées). */
export function springG(r, wire, len, turns, seg = 18) {
  const pts = [];
  const n = Math.round(turns * seg);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    // Pas réduit aux extrémités (spires jointives meulées).
    const e = 0.75 / turns;
    const u = t < e ? (t / e) * e * 0.35 : t > 1 - e ? 1 - ((1 - t) / e) * e * 0.35 : e * 0.35 + ((t - e) / (1 - 2 * e)) * (1 - 2 * e * 0.35);
    const a = t * turns * 2 * PI;
    pts.push(new THREE.Vector3(-len / 2 + wire + u * (len - 2 * wire), Math.cos(a) * r, Math.sin(a) * r));
  }
  const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n, wire, 7, false);
  g.userData.edgeAngle = 70;
  return g;
}

/** Flexible (boyau) suivant des points, avec embouts sertis et écrous tournants. */
export function hoseParts(points, r, { ferrule = 2.2, seg = 40 } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
  const hose = new THREE.TubeGeometry(curve, seg, r, 10, false);
  hose.userData.edgeAngle = 70;
  const metal = [];
  for (const end of [0, 1]) {
    const p = curve.getPointAt(end);
    const t = curve.getTangentAt(end).multiplyScalar(end ? 1 : -1); // vers l'extérieur
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), t);
    const L = r * 5;
    const f = merge(
      tf(cylG(r * 1.45, L, 14, r * 0.25), [0, -L * 0.5 + r * 0.6, 0]),
      // Sertissage : léger bourrelet.
      tf(cylG(r * 1.55, L * 0.18, 14, r * 0.1), [0, -L * 0.75 + r * 0.6, 0]),
      tf(hexG(r * ferrule * 1.25, r * 1.6), [0, r * 1.5, 0]),
    );
    f.applyQuaternion(q);
    f.translate(p.x, p.y, p.z);
    metal.push(f);
  }
  return { hose, metal: merge(metal) };
}

// ------------------------------------------------------------ chaîne

export const TRACK = {
  wheelY: 0.31, // hauteur des centres barbotin / roue folle
  pinR: 0.225, // rayon du trajet des axes de maillons autour des roues
  half: 1.05, // demi-entraxe barbotin ↔ roue folle
  shoes: 36,
  width: 0.42,
};
TRACK.loop = 4 * TRACK.half + 2 * PI * TRACK.pinR;
TRACK.pitch = TRACK.loop / TRACK.shoes;

// Maillon (vue de côté, axe des articulations y = 0) et patin, en mètres.
const LK = {
  h: TRACK.pitch / 2, // demi-pas : bague en x = -h, axe en x = +h
  top: 0.04, // portée du patin
  rail: 0.055, // bande de roulement (vers l'intérieur)
  t: 0.026, // épaisseur d'un flasque
  zIn: 0.06, // flasque côté bague (intérieur)
  zOut: 0.086, // flasque côté axe (extérieur), maillons coudés
  bushR: 0.027,
  pinR: 0.019,
};
const SH = { y: 0.041, t: 0.012, gh: 0.03, half: 0.077, w: TRACK.width, gx: [-0.062, 0, 0.062] };
// Boulons de patin : [x, z] (z côté droit ; symétriques en -z).
const BOLTS = [[-0.031, LK.zIn], [0.031, LK.zOut]];
// Position de F06 dans F05 et demi-écart de ses deux ensembles (5 pas entre eux).
const F06_AT = [0.08, 0.51];
const F06_X = 2.5 * TRACK.pitch;
// F07 : centre du clapet navette (z local) et sortie du raccord 7 vers le frein.
const F07_VALVE_Z = -0.078;
const F07_OUT = [-0.035, 0.114, F07_VALVE_Z - 0.068];

function stadium(s) {
  const { half, pinR: R, wheelY } = TRACK;
  const straight = 2 * half, arc = PI * R, L = TRACK.loop;
  s = ((s % L) + L) % L;
  if (s < straight) return [-half + s, wheelY - R];
  s -= straight;
  if (s < arc) { const a = -PI / 2 + s / R; return [half + Math.cos(a) * R, wheelY + Math.sin(a) * R]; }
  s -= arc;
  if (s < straight) return [half - s, wheelY + R];
  s -= straight;
  const a = PI / 2 + s / R;
  return [-half + Math.cos(a) * R, wheelY + Math.sin(a) * R];
}

/**
 * Repères des paires de maillons : chaque paire est rigide entre deux
 * articulations (cordes sur les roues). Repère local : X de l'axe vers la
 * bague, Y vers l'extérieur (patin), Z = +Z. Sur le brin supérieur, ce repère
 * est celui de F06. La phase place deux paires exactement sur les ensembles F06.
 */
function chainLayout() {
  const { pitch: p, shoes, half, pinR } = TRACK;
  const S1 = 2 * half + PI * pinR;
  const xs = F06_AT[0] - F06_X;
  const phase = ((((S1 + half - xs - 0.5 * p) % p) + p) % p);
  const frames = [];
  for (let i = 0; i < shoes; i++) {
    const a = stadium(phase + i * p), b = stadium(phase + (i + 1) * p);
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const t = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
    const n = [t[1], -t[0]];
    const c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const gap = n[1] > 0.99 && [xs, xs + 5 * p].some((x) => Math.abs(c[0] - x) < p / 2);
    frames.push({ a, b, c, t, n, gap });
  }
  return { phase, frames };
}

function frameMatrix(f) {
  return new THREE.Matrix4().makeBasis(
    new THREE.Vector3(-f.t[0], -f.t[1], 0), new THREE.Vector3(f.n[0], f.n[1], 0), new THREE.Vector3(0, 0, 1),
  ).setPosition(f.c[0], f.c[1], 0);
}

// Contours des demi-maillons (bague à gauche, axe à droite), joint coudé en x = ±0.012.
function linkHalfOutlines() {
  const { h, top, rail } = LK;
  const left = [[-0.012, top]];
  for (const a of [124, 145, 168, 190, 212, 235]) left.push([-h + Math.cos((a * PI) / 180) * 0.048, Math.sin((a * PI) / 180) * 0.048]);
  left.push([-h + 0.012, -rail], [-0.012, -rail]);
  const right = [[0.012, -rail], [h - 0.012, -rail]];
  for (const a of [-55, -30, -5, 20, 45, 68]) right.push([h + Math.cos((a * PI) / 180) * 0.042, Math.sin((a * PI) / 180) * 0.042]);
  right.push([h + 0.0157, top], [0.012, top]);
  return { left, right };
}

/** Flasque de maillon côté droit (+Z) : demi bague (intérieur) + coude + demi axe (extérieur). */
function linkGeo(detail) {
  const { h, top, rail, t, zIn, zOut, bushR, pinR } = LK;
  const { left, right } = linkHalfOutlines();
  const win = (x) => rrect(x, -0.006, 0.022, 0.04, 0.008, detail ? 3 : 1);
  const o = { bevel: detail ? 0.0015 : 0, deg: 35 };
  // Alésages seulement en détail (dans la chaîne, axe et bague les remplissent).
  const L = slabXY(left, zIn - t / 2, zIn + t / 2, { ...o, holes: detail ? [circ(-h, 0, bushR, 16), win(-0.031)] : [win(-0.031)] });
  const R = slabXY(right, zOut - t / 2, zOut + t / 2, { ...o, holes: detail ? [circ(h, 0, pinR, 16), win(0.031)] : [win(0.031)] });
  // Coude : prisme cisaillé (transformation affine, faces planes).
  const B = slabXY([[-0.013, -rail], [0.013, -rail], [0.013, top], [-0.013, top]], zIn - t / 2, zIn + t / 2, { deg: 35 });
  const p = B.attributes.position.array;
  for (let i = 0; i < p.length; i += 3) p[i + 2] += ((p[i] + 0.013) / 0.026) * (zOut - zIn);
  B.computeVertexNormals();
  return merge(L, B, R);
}

/** Patin à trois crampons (face d'appui y = 0, crampons vers +Y). */
function shoeGeo(detail) {
  const { t, gh, half, w } = SH;
  const holes = [];
  if (detail) for (const [x, z] of BOLTS) for (const s of [1, -1]) holes.push(circ(x, s * z, 0.0085, 12));
  for (const x of [-0.031, 0.031]) holes.push(rrect(x, 0, 0.016, 0.05, 0.0079, detail ? 3 : 2));
  const geos = [slabXZ(rrect(0, 0, 2 * half, w, 0.006, 1), 0, t, { holes, bevel: detail ? 0.0015 : 0, deg: 35 })];
  // Crampons : section trapézoïdale à sommet arrondi, sur toute la largeur.
  const gp = [[-0.012, t - 0.001], [0.012, t - 0.001], [0.0088, t + gh - 0.004], [0.0068, t + gh - 0.001], [0.004, t + gh], [-0.004, t + gh], [-0.0068, t + gh - 0.001], [-0.0088, t + gh - 0.004]];
  for (const gx of SH.gx) geos.push(slabXY(gp.map(([x, y]) => [x + gx, y]), -w / 2, w / 2, { deg: 50 }));
  // Lèvre avant relevée (recouvre le patin voisin).
  geos.push(slabXY([[half - 0.003, 0], [half + 0.004, 0.003], [half + 0.0085, 0.011], [half + 0.0085, 0.02], [half + 0.005, 0.024], [half + 0.0015, 0.021], [half + 0.0015, 0.014], [half - 0.003, t]], -w / 2, w / 2, { deg: 50 }));
  // Trois grandes languettes arrière cintrées (F06) : arc centré sur l'articulation,
  // elles passent sous le patin voisin et ferment le vide à l'enroulement.
  const cx = -LK.h, cy = -SH.y, r0 = SH.y, r1 = SH.y + t, te = (48 * PI) / 180, n = detail ? 8 : 4;
  const arc = (r, a0, a1) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx - r * Math.sin(a), cy + r * Math.cos(a)]; });
  const tip = [1, 2, 3].map((k) => {
    const f = (k * PI) / 4, rm = (r0 + r1) / 2;
    const u = [-Math.sin(te), Math.cos(te)], d = [-Math.cos(te), -Math.sin(te)];
    return [cx + u[0] * rm + (t / 2) * (u[0] * Math.cos(f) + d[0] * Math.sin(f)), cy + u[1] * rm + (t / 2) * (u[1] * Math.cos(f) + d[1] * Math.sin(f))];
  });
  const tab = [[-half + 0.004, t], ...arc(r1, 0, te), ...tip, ...arc(r0, te, 0), [-half + 0.004, 0]];
  // Languettes extérieures en retrait de 3 mm des bouts (pas de faces confondues avec le voisin).
  for (const [z0, z1] of [[-0.207, -0.113], [-0.035, 0.035], [0.113, 0.207]]) geos.push(slabXY(tab, z0, z1, { deg: 50 }));
  return merge(geos);
}

/** Vis de patin à tête bombée (tête sur y = 0, tige vers -Y). */
function shoeBoltGeo(detail, len = 0.06) {
  const r = 0.008;
  if (!detail) {
    return merge(
      revolve([[0.0122, 0], [0.0108, 0.0038], [0.0065, 0.0062], [0, 0.0068]], 8, 50),
    );
  }
  const shank = [[0, -len], [r - 0.001, -len], [r, -len + 0.001]];
  for (let i = 0; i < 6; i++) { const y = -len + 0.002 + i * 0.0045; shank.push([r, y + 0.0022], [r - 0.0009, y + 0.0045]); }
  shank.push([r, -len * 0.4], [r, 0], [0, 0]);
  return merge(
    revolve([[0.0052, 0.0068], [0.0083, 0.0062], [0.0112, 0.0045], [0.0124, 0.0015], [0.0125, 0], [0, 0]].reverse(), 16, 40),
    revolve([[0.0052, 0.0068], [0.0052, 0.0025], [0, 0.0025]], 6, 30),
    revolve(shank, 12, 40),
  );
}

/** Paire de maillons complète (repère de paire), par matériau. */
function pairGeos(detail = false) {
  const { h, zIn, bushR, pinR } = LK;
  const link = linkGeo(detail);
  const yellow = merge(
    tf(shoeGeo(detail), [0, SH.y, 0]),
    link, mirrorZ(link),
    // Bague (partie visible entre flasques intérieurs).
    tf(axis(revolve([[bushR, -(zIn - LK.t / 2)], [bushR, zIn - LK.t / 2]], 10, 40), 'z'), [-h, 0, 0]),
    // Axe (peint avec la chaîne), bouts chanfreinés dépassant des flasques extérieurs.
    tf(axis(revolve([[0, -0.103], [pinR - 0.003, -0.103], [pinR, -0.1], [pinR, 0.1], [pinR - 0.003, 0.103], [0, 0.103]], 12, 40), 'z'), [h, 0, 0]),
  );
  yellow.userData.edgeAngle = 55;
  const steel = [];
  for (const [x, z] of BOLTS) {
    for (const s of [1, -1]) {
      steel.push(tf(shoeBoltGeo(false), [x, SH.y + SH.t, s * z]));
      steel.push(tf(revolve([[0, -0.0065], [0.0115, -0.0065], [0.0115, 0.0065], [0, 0.0065]], 6, 30).rotateY(PI / 6), [x, 0.0075, s * z]));
    }
  }
  const dark = merge(steel);
  dark.userData.edgeAngle = 55;
  return { yellow, dark };
}

let pairCache = null; // géométries partagées par les deux chenilles de la vue générale

/** Chaîne simplifiée en instances ; les paires `gap` sont fournies par F06. */
function chain() {
  const { frames } = chainLayout();
  const list = frames.filter((f) => !f.gap);
  const { yellow, dark } = (pairCache ??= pairGeos(false));
  const ym = new THREE.InstancedMesh(yellow, mat('yellow'), list.length);
  const dm = new THREE.InstancedMesh(dark, mat('darkSteel'), list.length);
  list.forEach((f, i) => { const m = frameMatrix(f); ym.setMatrixAt(i, m); dm.setMatrixAt(i, m); });
  for (const im of [ym, dm]) { im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); im.computeBoundingBox?.(); }
  return G(ym, dm);
}

/** Barbotin à denture « chasseuse » (un creux sur deux reçoit une bague). */
function sprocketGeo(phase) {
  const nT = 18, rPin = TRACK.pinR, rGap = 0.0275, rTip = 0.246; // sommet sous les languettes
  const step = (2 * PI) / nT, N = nT * 12;
  const pts = [];
  for (let k = 0; k < N; k++) {
    const th = phase + (k / N) * 2 * PI;
    let d = (((th - phase) % step) + step) % step;
    if (d > step / 2) d -= step;
    const s = Math.abs(d) * rPin;
    const r = Math.min(rTip, s < rGap ? rPin - Math.sqrt(rGap * rGap - s * s) : rPin + (s - rGap) * 3.2);
    pts.push([r * Math.cos(th), r * Math.sin(th)]);
  }
  return ext(pts, 0.04, { holes: [circ(0, 0, 0.17, 36)], bevel: 0.003, deg: 40 });
}

// ------------------------------------------------------------ F05

export function F05(api, opts = {}) {
  const { wheelY: Y0, half, pinR } = TRACK;
  const P = (ref, obj, e, o) => api.part(ref, obj, e, o);
  const sx = -half, ix = half;
  const Z = (g) => axis(g, 'z');
  const X = (g) => axis(g, 'x');

  // 1 — Chaîne : instances + une paire standard et une paire maîtresse détaillées (F06)
  // sur le brin supérieur, éclatables sur place.
  const links = api.sub('F06');
  links.position.set(F06_AT[0], F06_AT[1], 0);
  const ch = chain();
  ch.position.set(-F06_AT[0], -F06_AT[1], 0);
  links.add(ch);
  P('1', links, [0, 0, 0.95]);

  // 18 — Cadre : deux poutres caissons chanfreinées, traverses, cloison de butée,
  // cales vers les plaques de fixation, fourche avant (glissières de roue folle).
  // Poutre caisson mécano-soudée : flasque extérieur percé (trous de décrottage),
  // tôle chanfreinée, dessus, flasque intérieur, semelle.
  const mud = [-0.51, -0.17, 0.17, 0.51].map((x) => rrect(x, 0.335, 0.09, 0.045, 0.0225, 4));
  const beam = (s) => [
    slabXY([[-0.79, 0.25], [0.78, 0.25], [0.78, 0.44], [-0.79, 0.44]], s * 0.13, s * 0.14, { holes: mud, bevel: 0.002 }),
    prismX([[s * 0.13, 0.44], [s * 0.14, 0.44], [s * 0.12, 0.465], [s * 0.112, 0.458]], -0.79, 0.78),
    prismX([[s * 0.085, 0.455], [s * 0.118, 0.455], [s * 0.12, 0.465], [s * 0.085, 0.465]], -0.79, 0.78),
    prismX([[s * 0.085, 0.262], [s * 0.095, 0.262], [s * 0.095, 0.455], [s * 0.085, 0.455]], -0.79, 0.78),
    prismX([[s * 0.085, 0.25], [s * 0.13, 0.25], [s * 0.13, 0.262], [s * 0.085, 0.262]], -0.79, 0.78),
    // Tôles d'extrémité.
    ...[-0.79, 0.77].map((x) => slabXY([[x, 0.262], [x + 0.012, 0.262], [x + 0.012, 0.455], [x, 0.455]], s * 0.095, s * 0.13)),
  ];
  const fork = [[0.62, 0.25], [1.115, 0.25], [1.135, 0.265], [1.135, 0.275], [0.99, 0.275], [0.978, 0.287], [0.978, 0.333], [0.99, 0.345], [1.135, 0.345], [1.135, 0.36], [1.11, 0.375], [0.95, 0.41], [0.62, 0.43]];
  const frameGeos = [...beam(1), ...beam(-1)];
  for (const s of [1, -1]) {
    frameGeos.push(slabXY(fork, s > 0 ? 0.156 : -0.172, s > 0 ? 0.172 : -0.156, { bevel: 0.002 }));
    frameGeos.push(boxG(0.17, 0.17, 0.016, 0.002, [0.705, 0.34, s * 0.148]));
  }
  for (const [x0, x1] of [[-0.79, -0.5], [0.5, 0.78]]) frameGeos.push(boxG(x1 - x0, 0.013, 0.17, 0.002, [(x0 + x1) / 2, 0.4585, 0]));
  for (const x of [-0.525, 0.525]) frameGeos.push(boxG(0.07, 0.012, 0.17, 0.002, [x, 0.256, 0]));
  frameGeos.push(prismX([[-0.085, 0.25], [0.085, 0.25], [0.085, 0.452], [-0.085, 0.452]], -0.29, -0.275, { holes: [circ(0, Y0, 0.03, 16)] }));
  // Cales intérieures (vers plaques 23 et 25).
  for (const [x0, x1] of [[-0.76, -0.5], [0.42, 0.68]]) frameGeos.push(boxG(x1 - x0, 0.115, 0.0475, 0.003, [(x0 + x1) / 2, 0.3375, -0.16375]));
  // Cordons de soudure (cales, doubleurs de fourche, traverses).
  const bead = (a, b) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const g = cylG(0.004, A.distanceTo(B), 6, 0.001);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()));
    return g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  };
  for (const [x0, x1] of [[-0.76, -0.5], [0.42, 0.68]]) {
    frameGeos.push(bead([x0, 0.393, -0.142], [x1, 0.393, -0.142]), bead([x0, 0.282, -0.142], [x1, 0.282, -0.142]));
  }
  for (const s of [1, -1]) frameGeos.push(bead([0.62, 0.427, s * 0.156], [0.78, 0.427, s * 0.156]), bead([0.62, 0.255, s * 0.156], [0.78, 0.255, s * 0.156]));
  const frame = G(
    M('black', frameGeos),
    // Plaque signalétique vierge rivetée sur le flasque extérieur.
    M('lightGrey', boxG(0.09, 0.05, 0.0015, 0.0005, [0.3, 0.395, 0.14075])),
    M('steel', ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => tf(axis(revolve([[0, 0], [0.0035, 0], [0.003, 0.0012], [0, 0.0018]], 8, 40), 'z'), [0.3 + a * 0.039, 0.395 + b * 0.019, 0.1415]))),
  );
  frame.userData.hasInterior = true;
  P('18', frame, [0, 0, 0]);

  // 17 — Roue folle : jante à boudin central, voile ajouré, moyeu, axe ; 16 — paliers coulissants.
  const idlerRim = [[0.14, -0.105], [0.15, -0.105], [0.156, -0.099], [0.156, -0.045], [0.165, -0.04], [0.183, -0.036], [0.19, -0.03], [0.19, 0.03], [0.183, 0.036], [0.165, 0.04], [0.156, 0.045], [0.156, 0.099], [0.15, 0.105], [0.14, 0.105], [0.14, -0.105]];
  const idler = G(
    M('blackCast',
      Z(revolve(idlerRim, 40, 30)),
      Z(revolve([[0.03, -0.115], [0.068, -0.115], [0.075, -0.108], [0.075, 0.108], [0.068, 0.115], [0.03, 0.115], [0.03, -0.115]], 24, 40)),
      slabXY(circ(0, 0, 0.146, 40), -0.02, 0.02, { holes: [circ(0, 0, 0.07, 20), ...[0, 1, 2, 3].map((i) => circ(Math.cos(i * PI / 2 + PI / 4) * 0.108, Math.sin(i * PI / 2 + PI / 4) * 0.108, 0.022, 14))] }),
    ),
    M('darkSteel', Z(cylG(0.03, 0.324, 16, 0.002))),
    M('steel', ...[1, -1].map((s) => tf(Z(revolve([[0, 0], [0.006, 0], [0.006, 0.006], [0.0035, 0.009], [0.0045, 0.012], [0, 0.013]], 8, 40)), [0, 0, s * 0.162], s > 0 ? null : [0, PI, 0]))),
  );
  P('17', at(idler, [ix, Y0, 0]), [0.85, 0.15, 0]);
  for (const s of [1, -1]) {
    const blk = G(
      M('black',
        boxG(0.1, 0.1, 0.03, 0.003, [0, 0, s * 0.137]),
        boxG(0.12, 0.062, 0.016, 0.002, [0.01, 0, s * 0.16]),
        boxG(0.02, 0.1, 0.012, 0.002, [-0.04, 0, s * 0.116]),
      ),
      M('steel', ...[[-0.03, 0.035], [-0.03, -0.035], [0.03, 0.035], [0.03, -0.035]].map(([x, y]) => tf(boltHeadG(0.014, 0.007, false), [x, y, s * 0.122], [s > 0 ? -PI / 2 : PI / 2, 0, 0]))),
    );
    P('16', at(blk, [ix, Y0, 0]), [0.85, 0.15, s * 0.32]);
  }

  // Tendeur (axe Y0) : 15 fourche + tige, 14 vérin à graisse (fût, bride, tige arrière),
  // 13 graisseur, 12 ressort, 11 entretoise, 10 écrou, 9 rondelle, 8 vis, 20 butées.
  const yokeOutline = [[0.70, -0.035], [0.77, -0.06], [0.83, -0.138], [1.0, -0.138], [1.0, -0.118], [0.845, -0.118], [0.80, -0.05], [0.79, 0], [0.80, 0.05], [0.845, 0.118], [1.0, 0.118], [1.0, 0.138], [0.83, 0.138], [0.77, 0.06], [0.70, 0.035]];
  P('15', G(
    M('black',
      slabXZ(yokeOutline, Y0 - 0.03, Y0 + 0.03, { bevel: 0.003 }),
      ...[1, -1].map((s) => slabXY([[0.95, -0.045], [1.0, -0.045], [1.0, 0.045], [0.95, 0.045]].map(([x, y]) => [x, y + Y0]), s * 0.12, s * 0.138, { holes: [circ(0.975, Y0 + 0.03, 0.006, 8), circ(0.975, Y0 - 0.03, 0.006, 8)] })),
    ),
    M('darkSteel', tf(X(cylG(0.022, 0.32, 16, 0.002)), [0.56, Y0, 0])),
  ), [0.45, 0.42, 0]);
  const cyl14 = G(
    M('black',
      tf(X(tubeG(0.045, 0.036, 0.185, 28)), [0.3175, Y0, 0]),
      tf(X(revolve([[0, -0.0125], [0.068, -0.0125], [0.072, -0.0085], [0.072, 0.0085], [0.068, 0.0125], [0, 0.0125]], 32, 40)), [0.2125, Y0, 0]),
      tf(X(revolve([[0.023, -0.006], [0.046, -0.006], [0.049, -0.003], [0.049, 0.006], [0.023, 0.006]], 28, 40)), [0.414, Y0, 0]),
      // Bossage du graisseur.
      tf(cylG(0.012, 0.012, 12, 0.001), [0.3, Y0 + 0.047, 0]),
    ),
    M('darkSteel', tf(X(revolve([[0, -0.23], [0.021, -0.23], [0.024, -0.227], [0.024, 0.09], [0.032, 0.096], [0.032, 0.23], [0, 0.23]], 20, 40)), [-0.03, Y0, 0])),
  );
  cyl14.userData.hasInterior = true;
  P('14', cyl14, [0.3, 0.62, 0]);
  P('13', G(M('steel', tf(hexG(0.014, 0.006), [0, 0.003, 0]), revolve([[0, 0.006], [0.004, 0.006], [0.004, 0.012], [0.0055, 0.014], [0.0035, 0.019], [0, 0.0195]], 10, 40))).translateX(0.3).translateY(Y0 + 0.053), [0.3, 0.85, 0]);
  P('12', M('black', tf(springG(0.062, 0.012, 0.35, 6.5), [0.025, Y0, 0])), [-0.2, 0.62, 0]);
  P('11', M('black', tf(X(revolve([[0.026, -0.035], [0.06, -0.035], [0.065, -0.03], [0.065, 0.03], [0.06, 0.035], [0.026, 0.035], [0.026, -0.035]], 28, 40)), [-0.185, Y0, 0])), [-0.27, 0.62, 0]);
  P('10', M('darkSteel', tf(X(hexG(0.046, 0.028, 0.0245)), [-0.236, Y0, 0])), [-0.37, 0.62, 0]);
  P('9', M('steel', tf(X(revolve([[0.0065, -0.002], [0.026, -0.002], [0.026, 0.002], [0.0065, 0.002], [0.0065, -0.002]], 20, 40)), [-0.252, Y0, 0])), [-0.46, 0.62, 0]);
  P('8', M('darkSteel', tf(axis(merge(boltHeadG(0.017, 0.008, false), tf(cylG(0.006, 0.03, 10), [0, -0.015, 0])), '-x'), [-0.254, Y0, 0])), [-0.55, 0.62, 0]);
  for (const s of [1, -1]) {
    const stop = [[-0.27, Y0 - 0.04], [-0.222, Y0 - 0.04], [-0.222, Y0 - 0.012], [-0.235, Y0 + 0.012], [-0.235, Y0 + 0.04], [-0.27, Y0 + 0.04]];
    P('20', M('darkSteel', slabXY(stop, s > 0 ? 0.045 : -0.085, s > 0 ? 0.085 : -0.045, { holes: [circ(-0.252, Y0 - 0.02, 0.006, 8), circ(-0.252, Y0 + 0.02, 0.006, 8)], bevel: 0.002 })), [-0.25, 0.38, s * 0.12]);
  }

  // Tôles pliées : 4 garde supérieure (patin de glissement du brin supérieur, ouverture
  // d'accès), 3 couvercle d'accès boulonné, 2 garde de roue folle.
  const hat = (x0, x1, zw, yTop, yLow, holes = [], notches = []) => {
    const t = 0.006, r = 0.008;
    // Jupe : contour XY avec échancrures arrondies (dégagements, comme sur la feuille F05).
    const skirt = [[x0, yTop - r], [x0, yLow]];
    for (const [a, b, yN] of notches) skirt.push([a, yLow], [a, yN + 0.008], [a + 0.0025, yN + 0.0025], [a + 0.008, yN], [b - 0.008, yN], [b - 0.0025, yN + 0.0025], [b, yN + 0.008], [b, yLow]);
    skirt.push([x1, yLow], [x1, yTop - r]);
    const geos = [slabXZ(rrect((x0 + x1) / 2, 0, x1 - x0, 2 * (zw - r), 0.004, 1), yTop - t, yTop, { holes })];
    for (const s of [1, -1]) {
      const bend = [];
      for (let i = 0; i <= 4; i++) {
        const a = (i / 4) * (PI / 2);
        bend.push([s * (zw - r + Math.sin(a) * r), yTop - r + Math.cos(a) * r]);
      }
      for (let i = 4; i >= 0; i--) {
        const a = (i / 4) * (PI / 2);
        bend.push([s * (zw - r + Math.sin(a) * (r - t)), yTop - r + Math.cos(a) * (r - t)]);
      }
      geos.push(prismX(bend, x0, x1, { deg: 40 }));
      geos.push(slabXY(skirt, s > 0 ? zw - t : -zw, s > 0 ? zw : -zw + t));
    }
    return geos;
  };
  const g4Bolts = [[-0.6, 0.12], [-0.6, -0.12], [0.45, 0.12], [0.45, -0.12]];
  P('4', G(
    M('black', hat(-0.8, 0.6, 0.15, 0.472, 0.4, [rrect(0.21, 0, 0.2, 0.13, 0.015, 2)], [[-0.17, -0.07, 0.437], [0.36, 0.46, 0.437]])),
    // Vis de fixation sur le dessus des poutres (hors du passage des maillons).
    M('steel', ...g4Bolts.map(([x, z]) => tf(boltHeadG(0.013, 0.0055), [x, 0.472, z]))),
  ), [0, 0.95, 0]);
  P('3', G(
    M('black', slabXZ(rrect(0.21, 0, 0.26, 0.27, 0.012, 2), 0.472, 0.478, { bevel: 0.0015 }), slabXZ(rrect(0.21, 0, 0.19, 0.12, 0.01, 2), 0.44, 0.472)),
    M('steel', ...[[0.1, 0.118], [0.1, -0.118], [0.32, 0.118], [0.32, -0.118]].map(([x, z]) => tf(boltHeadG(0.013, 0.0055), [x, 0.478, z]))),
  ), [0, 1.2, 0]);
  const g2 = hat(0.6, 0.9, 0.18, 0.472, 0.39);
  g2.push(slabXY([[0.896, 0.43], [0.902, 0.43], [0.902, 0.466], [0.896, 0.466]], -0.172, 0.172));
  g2.push(slabXY([[0.62, 0.39], [0.68, 0.39], [0.68, 0.36], [0.65, 0.345], [0.62, 0.36]], 0.18, 0.186, { holes: [circ(0.65, 0.368, 0.008, 10)] }));
  P('2', M('black', g2), [0.35, 0.95, 0]);

  // 22 — Galets inférieurs à double boudin, axe et pattes de fixation boulonnées sous le cadre.
  const rollerProf = [[0.022, -0.115], [0.055, -0.115], [0.062, -0.11], [0.062, -0.102], [0.058, -0.098], [0.045, -0.094], [0.045, -0.05], [0.04, -0.045], [0.04, 0.045], [0.045, 0.05], [0.045, 0.094], [0.058, 0.098], [0.062, 0.102], [0.062, 0.11], [0.055, 0.115], [0.022, 0.115], [0.022, -0.115]];
  const rollerY = Y0 - pinR + LK.rail + 0.045;
  for (const x of [-0.68, -0.34, 0, 0.34, 0.68]) {
    const roller = G(
      M('blackCast',
        Z(revolve(rollerProf, 24, 30)),
        ...[1, -1].map((s) => boxG(0.055, 0.095, 0.025, 0.003, [0, 0.0175, s * 0.1275])),
      ),
      M('darkSteel', Z(cylG(0.02, 0.28, 10)), ...[1, -1].map((s) => tf(Z(revolve([[0.02, -0.003], [0.03, -0.003], [0.03, 0.003], [0.02, 0.003]], 12, 40)), [0, 0, s * 0.118]))),
      M('steel', ...[1, -1].flatMap((s) => [-0.016, 0.016].map((dx) => tf(boltHeadG(0.013, 0.006), [dx, -0.03, s * 0.1275], [PI, 0, 0])))),
    );
    P('22', at(roller, [x, rollerY, 0]), [0, -0.12, 1.45]);
  }

  // Entraînement arrière (phase du barbotin calée sur les bagues de la chaîne).
  const { frames } = chainLayout();
  let best = null;
  for (const f of frames) {
    const a = Math.atan2(f.b[1] - Y0, f.b[0] - sx);
    if (f.b[0] < sx - 0.01 && (best === null || Math.abs(Math.abs(a) - PI) < Math.abs(Math.abs(best) - PI))) best = a;
  }
  // 6 — Barbotin : couronne dentée, moyeu épaulé, 12 vis.
  const sprocket = G(
    M('black',
      sprocketGeo(best ?? 0),
      Z(revolve([[0.135, -0.026], [0.182, -0.026], [0.187, -0.021], [0.187, 0.021], [0.182, 0.026], [0.135, 0.026], [0.135, -0.026]], 40, 40)),
    ),
    M('steel', ...Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * 2 * PI;
      return tf(boltHeadG(0.022, 0.011), [Math.cos(a) * 0.16, Math.sin(a) * 0.16, 0.026], [PI / 2, 0, 0]);
    })),
  );
  P('6', at(sprocket, [sx, Y0, 0]), [-0.5, 0, 0.5]);

  // 7 — Moyeu réducteur : bride fixe à nervures, tambour, bride tournante, couvercle boulonné.
  const hubProf = [[0, -0.1875], [0.156, -0.1875], [0.16, -0.1835], [0.16, -0.172], [0.156, -0.168], [0.12, -0.168], [0.118, -0.165], [0.118, -0.065], [0.121, -0.06], [0.121, -0.048], [0.146, -0.046], [0.15, -0.042], [0.15, -0.03], [0.146, -0.026], [0.134, -0.026], [0.134, 0.022], [0.13, 0.026], [0.112, 0.026], [0.112, 0.05], [0.106, 0.056], [0.06, 0.056], [0.056, 0.06], [0.056, 0.066], [0.05, 0.07], [0, 0.07]];
  const hub = G(
    M('blackCast', Z(revolve(hubProf, 32, 35)),
      ...[0, 1, 2, 3].map((i) => slabXZ([[0.117, -0.168], [0.152, -0.168], [0.117, -0.128]], -0.006, 0.006).rotateZ((i * PI) / 2))),
    M('steel',
      ...Array.from({ length: 8 }, (_, i) => { const a = ((i + 0.5) / 8) * 2 * PI; return tf(boltHeadG(0.022, 0.011), [Math.cos(a) * 0.14, Math.sin(a) * 0.14, -0.168], [PI / 2, 0, 0]); }),
      ...Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * 2 * PI; return tf(boltHeadG(0.015, 0.0075), [Math.cos(a) * 0.09, Math.sin(a) * 0.09, 0.056], [PI / 2, 0, 0]); }),
      ...[0.4, PI + 0.4].map((a) => tf(Z(hexG(0.016, 0.006)), [Math.cos(a) * 0.035, Math.sin(a) * 0.035, 0.073])),
    ),
  );
  P('7', at(hub, [sx, Y0, 0]), [-0.5, 0, 0.2]);

  // 27 — Accouplement cannelé, 28 — frein Ausco (bride carrée, couvercle boulonné, orifice de desserrage),
  // 29 — plaque d'adaptation, 30 — moteur OMS 100 (F07).
  P('27', M('steel', tf(Z(revolve([[0.012, -0.03], [0.023, -0.03], [0.025, -0.028], [0.025, 0.028], [0.023, 0.03], [0.012, 0.03], [0.012, -0.03]], 20, 40)), [sx, Y0, -0.295])), [-0.3, 0, -0.78]);
  const zM = -0.408; // origine du moteur F07 (bride contre la plaque 29)
  const brakePort = [sx, Y0 + 0.086, -0.27];
  const brake = G(
    M('blackCast',
      tf(slabXY(rrect(0, 0, 0.17, 0.17, 0.02, 3), -0.2265, -0.2125, { holes: [circ(0, 0, 0.03, 16)], bevel: 0.002 }), [sx, Y0, 0]),
      tf(Z(revolve([[0, -0.0525], [0.074, -0.0525], [0.078, -0.0485], [0.078, 0.03], [0.082, 0.034], [0.082, 0.046], [0.078, 0.0505], [0.03, 0.0525], [0, 0.0525]], 36, 35)), [sx, Y0, -0.279]),
      tf(boxG(0.03, 0.02, 0.03, 0.003), [sx, Y0 + 0.08, -0.27]),
    ),
    M('steel',
      ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => tf(boltHeadG(0.017, 0.009), [sx + a * 0.065, Y0 + b * 0.065, -0.2265], [-PI / 2, 0, 0])),
      ...Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * 2 * PI + 0.3; return tf(boltHeadG(0.013, 0.007), [sx + Math.cos(a) * 0.06, Y0 + Math.sin(a) * 0.06, -0.3315], [-PI / 2, 0, 0]); }),
      tf(merge(hexG(0.018, 0.008), tf(cylG(0.0065, 0.016, 10), [0, 0.012, 0])), [brakePort[0], brakePort[1] + 0.008, brakePort[2]]),
    ),
  );
  // Flexible de desserrage du frein : de la sortie du clapet navette (F07, réf. 7) à l'orifice du frein.
  // Repère F07 tourné de -90° autour de Y : (x, y, z) local → (sx - z, Y0 + y, zM + x).
  const f7 = [sx - F07_OUT[2], Y0 + F07_OUT[1], zM + F07_OUT[0]];
  const hp = hoseParts([
    [f7[0] + 0.008, f7[1], f7[2]], [f7[0] + 0.04, f7[1] + 0.012, f7[2] + 0.01], [f7[0] + 0.05, f7[1] + 0.05, f7[2] + 0.1],
    [brakePort[0] + 0.035, brakePort[1] + 0.085, brakePort[2]], [brakePort[0], brakePort[1] + 0.04, brakePort[2]],
  ], 0.0055);
  brake.add(M('hose', hp.hose), M('steel', hp.metal));
  P('28', brake, [-0.3, 0, -0.98]);
  P('29', G(
    M('black', tf(slabXY(rrect(0, 0, 0.19, 0.19, 0.01, 2), zM + 0.062, zM + 0.078, { holes: [circ(0, 0, 0.047, 24), ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => circ(a * 0.07, b * 0.07, 0.009, 12))], bevel: 0.0015 }), [sx, Y0, 0])),
    M('steel', ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => tf(hexG(0.017, 0.009, 0.006), [sx + a * 0.07, Y0 + b * 0.07, zM + 0.0825], [PI / 2, 0, 0]))),
  ), [-0.3, 0, -1.18]);
  if (!opts.noMotor) {
    const motor = api.sub('F07', { noPlate: true });
    motor.rotation.y = -PI / 2;
    motor.position.set(sx, Y0, zM);
    P('30', motor, [-0.3, 0, -1.42]);
  }

  // Plaques de fixation au châssis (côté intérieur) : 25 arrière (palier du moyeu), 23 avant.
  const rear = [...circ(sx, Y0, 0.2, 18, PI / 2, 1.5 * PI), [-0.52, Y0 - 0.2], [-0.47, Y0 - 0.15], [-0.47, Y0 + 0.15], [-0.52, Y0 + 0.2]];
  const rearHoles = [circ(sx, Y0, 0.065, 28), ...Array.from({ length: 8 }, (_, i) => circ(sx + Math.cos(((i + 0.5) / 8) * 2 * PI) * 0.14, Y0 + Math.sin(((i + 0.5) / 8) * 2 * PI) * 0.14, 0.009, 10))];
  const plateBolts = (pts) => pts.map(([x, y]) => tf(boltHeadG(0.019, 0.01), [x, y, -0.2125], [-PI / 2, 0, 0]));
  P('25', G(
    M('black',
      slabXY(rear, -0.2125, -0.1875, { holes: [...rearHoles, ...[[-0.72, 0.3], [-0.72, 0.37], [-0.55, 0.3], [-0.55, 0.37]].map(([x, y]) => circ(x, y, 0.009, 10))], bevel: 0.002 }),
      // Selle d'appui sur le châssis de la foreuse.
      slabXY([[-0.86, 0.45], [-0.58, 0.45], [-0.58, 0.49], [-0.61, 0.515], [-0.83, 0.515], [-0.86, 0.49]], -0.229, -0.2125, { bevel: 0.002 }),
    ),
    M('steel', ...plateBolts([[-0.72, 0.3], [-0.72, 0.37], [-0.55, 0.3], [-0.55, 0.37]]),
      ...Array.from({ length: 8 }, (_, i) => { const a = ((i + 0.5) / 8) * 2 * PI; return tf(hexG(0.022, 0.011, 0.008), [sx + Math.cos(a) * 0.14, Y0 + Math.sin(a) * 0.14, -0.218], [PI / 2, 0, 0]); })),
  ), [0.1, -0.1, -0.55]);
  const fx = [0.44, 0.55, 0.66], fy = [0.3, 0.37];
  P('23', G(
    M('black',
      slabXY(rrect(0.55, 0.31, 0.3, 0.32, 0.012, 2), -0.2125, -0.1875, { holes: fx.flatMap((x) => fy.map((y) => circ(x, y, 0.009, 10))), bevel: 0.002 }),
      slabXY([[0.47, 0.41], [0.63, 0.41], [0.63, 0.47], [0.6, 0.47], [0.6, 0.44], [0.5, 0.44], [0.5, 0.47], [0.47, 0.47]], -0.229, -0.2125, { bevel: 0.002 }),
      ...[0.47, 0.63].map((x) => slabXY([[x - 0.006, 0.39], [x + 0.006, 0.39], [x + 0.006, 0.41], [x - 0.006, 0.41]], -0.229, -0.2125)),
    ),
    M('steel', ...plateBolts(fx.flatMap((x) => fy.map((y) => [x, y])))),
  ), [0, -0.1, -0.55]);

  // Vue de trois quarts arrière, côté extérieur : barbotin et entraînement au premier plan.
  return { view: { dir: [-0.9, 0.6, 1.0] } };
}

function at(obj, pos) {
  obj.position.set(...pos);
  return obj;
}

// ------------------------------------------------------------ F06

export function F06(api) {
  const P = (ref, obj, e, o) => api.part(ref, obj, e, o);
  const { h, zIn, zOut, t, bushR, pinR } = LK;
  const y0 = 0.025; // axe des articulations
  const shoe = shoeGeo(true);
  const link = linkGeo(true);
  const bolt = (len) => shoeBoltGeo(true, len);
  const pinG = revolve([[0, -0.103], [0.016, -0.103], [0.019, -0.1], [0.019, 0.1], [0.016, 0.103], [0.0052, 0.103], [0.0052, 0.093], [0, 0.093]], 20, 40);
  const bushG = revolve([[0.0195, -0.073], [0.025, -0.073], [0.027, -0.071], [0.027, 0.071], [0.025, 0.073], [0.0195, 0.073], [0.0195, -0.073]], 24, 40);
  const pinAt = (x) => M('yellow', tf(axis(pinG.clone(), 'z'), [x, y0, 0]));
  const bushAt = (x) => M('yellow', tf(axis(bushG.clone(), 'z'), [x, y0, 0]));

  // Ensemble standard (à gauche) : patin, 4 vis + écrous, flasques RH / LH coudés, axe, bague,
  // bague d'appui, joint, bouchon.
  const X = -F06_X;
  P('1', M('yellow', tf(shoe.clone(), [X, y0 + SH.y, 0])), [0, 0.5, 0]);
  for (const [bx, bz] of BOLTS) {
    for (const s of [1, -1]) {
      P('2', M('darkSteel', tf(bolt(0.06), [X + bx, y0 + SH.y + SH.t, s * bz])), [0, 0.76, 0]);
      P('8', M('darkSteel', tf(hexG(0.02, 0.013, 0.0068), [X + bx, y0 + 0.0075, s * bz])), [0, 0, s * 0.32]);
    }
  }
  P('7', M('yellow', tf(link.clone(), [X, y0, 0])), [0, 0, 0.2]);
  P('9', M('yellow', tf(mirrorZ(link), [X, y0, 0])), [0, 0, -0.2]);
  P('5', pinAt(X + h), [0, 0, 0.42]);
  P('6', bushAt(X - h), [0, 0.13, 0]);
  P('16', M('darkSteel', tf(axis(revolve([[0.021, -0.002], [0.03, -0.002], [0.03, 0.002], [0.021, 0.002], [0.021, -0.002]], 24, 40), 'z'), [X + h, y0, 0.075])), [0, 0, 0.58]);
  P('15', M('rubber', tf(new THREE.TorusGeometry(0.026, 0.0032, 8, 28), [X + h, y0, 0.0785])), [0, 0, 0.52]);
  P('14', M('yellow', tf(axis(revolve([[0, -0.016], [0.0045, -0.016], [0.0045, 0], [0.015, 0], [0.017, 0.002], [0.017, 0.005], [0.014, 0.0065], [0, 0.0065]], 20, 40), 'z'), [X + h, y0, 0.103])), [0, 0, 0.62]);

  // Ensemble maître (à droite) : patin maître, 4 vis maîtresses, demi-maillons à denture.
  const Xm = F06_X;
  P('3', M('yellow', tf(shoe.clone(), [Xm, y0 + SH.y, 0])), [0, 0.5, 0]);
  for (const [bx, bz] of BOLTS) for (const s of [1, -1]) P('4', M('darkSteel', tf(bolt(0.05), [Xm + bx, y0 + SH.y + SH.t, s * bz])), [0, 0.76, 0]);
  const { top, rail } = LK;
  const split = [[0.012, top], [0.006, 0.015], [0.0, 0.0], [0.003, -0.005], [-0.006, -0.012], [-0.002, -0.019], [-0.01, -0.026], [-0.006, -0.033], [-0.014, -0.04], [-0.01, -0.047], [-0.016, -rail]];
  const pinEnd = [...split, [h - 0.012, -rail]];
  for (const a of [-55, -30, -5, 20, 45, 68]) pinEnd.push([h + Math.cos((a * PI) / 180) * 0.042, Math.sin((a * PI) / 180) * 0.042]);
  pinEnd.push([h + 0.0157, top]);
  const bushEnd = [[0.012, top], [-h - 0.0265, top]];
  for (const a of [145, 168, 190, 212, 235]) bushEnd.push([-h + Math.cos((a * PI) / 180) * 0.048, Math.sin((a * PI) / 180) * 0.048]);
  bushEnd.push([-h + 0.012, -rail], ...[...split].reverse());
  const half = (pts, z, hole, boss) => {
    const geos = [slabXY(pts, z - t / 2, z + t / 2, { holes: [hole], bevel: 0.0015, deg: 35 })];
    if (boss) geos.push(tf(axis(revolve([[0.028, -0.002], [0.04, -0.002], [0.038, 0.004], [0.028, 0.004], [0.028, -0.002]], 28, 40), 'z'), [-h, 0, z + Math.sign(z) * (t / 2 + 0.002)]));
    return merge(geos);
  };
  const pinHalf = half(pinEnd, zOut, circ(h, 0, pinR, 16), false);
  const bushHalf = half(bushEnd, zIn, circ(-h, 0, bushR, 16), false);
  // Demi-maillons écartés en croix autour de l'axe et de la bague restés en place :
  // côté axe (10, 11) vers l'avant, côté bague (12, 13) vers l'arrière, aucun sous le patin.
  P('10', M('yellow', tf(pinHalf.clone(), [Xm, y0, 0])), [0.12, 0, 0.2]);
  P('11', M('yellow', tf(mirrorZ(pinHalf), [Xm, y0, 0])), [0.16, 0, -0.2]);
  P('13', M('yellow', tf(bushHalf.clone(), [Xm, y0, 0])), [-0.12, 0, 0.2]);
  P('12', M('yellow', tf(mirrorZ(bushHalf), [Xm, y0, 0])), [-0.16, 0, -0.2]);
  // Axe et bague de la paire maîtresse (mêmes pièces que 5 et 6).
  P('5', pinAt(Xm + h), [0, 0, 0], { noLabel: true });
  P('6', bushAt(Xm - h), [0, 0, 0], { noLabel: true });
  return { view: { dir: [0.6, 0.9, 1.1] } };
}

// ------------------------------------------------------------ F07

export function F07(api, opts = {}) {
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const X = (g) => axis(g, 'x');
  // Moteur OMS 100 : arbre selon +X ; face de bride en x = 0.061 (contre la plaque 1).
  const sq = (w, r) => rrect(0, 0, w, w, r, 3);
  // Corps de distribution : poches latérales venues de fonderie.
  const valve = [[-0.065, -0.065], [0.065, -0.065], [0.065, -0.05], [0.054, -0.042], [0.054, 0.032], [0.065, 0.042], [0.065, 0.065], [-0.065, 0.065], [-0.065, 0.042], [-0.054, 0.032], [-0.054, -0.042], [-0.065, -0.05]];
  const bodyGeos = [
    prismX(sq(0.128, 0.018), -0.152, -0.131, { bevel: 0.003 }),
    prismX(sq(0.126, 0.016), -0.131, -0.103, { bevel: 0.0015 }),
    prismX(valve, -0.103, -0.008, { bevel: 0.003, deg: 40 }),
    prismX(sq(0.13, 0.02), -0.008, 0.033, { bevel: 0.003 }),
    // Bride carrée 4 trous (alignée sur la plaque d'adaptation).
    prismX(rrect(0, 0, 0.17, 0.17, 0.022, 3), 0.033, 0.047, { holes: [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => circ(a * 0.07, b * 0.07, 0.009, 12)), bevel: 0.002 }),
    tf(X(revolve([[0, -0.007], [0.045, -0.007], [0.045, 0.012], [0.043, 0.014], [0, 0.014]], 32, 40)), [0.054, 0, 0]),
    // Bossages des orifices A / B et du drain.
    ...[[-0.035, 0.032], [-0.08, -0.032], [-0.08, 0.034]].map(([x, z]) => tf(cylG(0.016, 0.006, 20, 0.0012), [x, 0.067, z])),
  ];
  // Arbre cannelé 16 dents.
  const spl = [];
  for (let i = 0; i < 32; i++) { const a = (i / 32) * 2 * PI; const r = i % 2 ? 0.0148 : 0.0165; spl.push([Math.cos(a) * r, Math.sin(a) * r]); }
  const shaft = merge(
    tf(X(cylG(0.0175, 0.014, 20, 0.001)), [0.068, 0, 0]),
    prismX(spl, 0.075, 0.125, { bevel: 0.001, deg: 25 }),
  );
  const corners = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  P('2', G(
    M('blackCast', bodyGeos),
    M('darkSteel', shaft,
      // Vis de fermeture arrière (tirants) et vis de bride.
      ...corners.map(([a, b]) => tf(axis(boltHeadG(0.017, 0.011), '-x'), [-0.152, a * 0.046, b * 0.046])),
      ...corners.map(([a, b]) => tf(axis(boltHeadG(0.017, 0.01), '-x'), [0.033, a * 0.07, b * 0.07])),
      tf(merge(hexG(0.02, 0.008), tf(cylG(0.0065, 0.004, 12), [0, 0.006, 0])), [-0.08, 0.074, 0.034]),
    ),
    // Plaque signalétique (vierge).
    M('lightGrey', boxG(0.05, 0.026, 0.0012, 0.0004, [-0.055, -0.005, 0.0545])),
  ), [0, 0, 0]);
  if (!opts.noPlate) {
    P('1', M('black', prismX(rrect(0, 0, 0.2, 0.2, 0.006, 1), 0.061, 0.079, { holes: [circ(0, 0, 0.047, 28), ...corners.map(([a, b]) => circ(a * 0.07, b * 0.07, 0.011, 14))], bevel: 0.0015 })), [0.25, 0, 0]);
  }
  // Raccords : 3 adaptateurs droits sur A / B, 4 tés orientables, 5 union, 6 clapet navette, 7 mâle NPT.
  const yP = 0.07; // face des orifices
  const adapter = merge(
    revolve([[0, -0.012], [0.0075, -0.012], [0.0082, -0.004], [0.0082, 0], [0, 0]], 12, 40),
    tf(hexG(0.022, 0.009), [0, 0.0045, 0]),
    revolve([[0, 0.009], [0.0075, 0.009], [0.0075, 0.024], [0.0055, 0.03], [0.0035, 0.03], [0, 0.03]], 12, 40),
  );
  const nose = (len) => revolve([[0, 0], [0.0072, 0], [0.0072, len - 0.006], [0.0052, len], [0.0032, len], [0, len]], 12, 40);
  const tee = merge(
    boxG(0.022, 0.02, 0.022, 0.003),
    tf(hexG(0.024, 0.014), [0, -0.017, 0]),
    tf(axis(nose(0.028), 'z'), [0, 0, 0.011]),
    tf(axis(nose(0.028), '-z'), [0, 0, -0.011]),
  );
  const ports = [[-0.035, 0.032], [-0.08, -0.032]];
  ports.forEach(([x, z], i) => P('3', M('steel', tf(adapter.clone(), [x, yP, z])), [0, 0.08, i ? -0.03 : 0.03]));
  ports.forEach(([x, z], i) => P('4', M('steel', tf(tee.clone(), [x, yP + 0.044, z])), [0, 0.16, i ? -0.06 : 0.06]));
  const yT = yP + 0.044;
  // Ligne du clapet : té A (-Z) → union 5 → clapet 6 → raccord 7 (vers le frein).
  const zA = 0.032 - 0.039;
  P('5', M('steel', tf(merge(
    axis(hexG(0.022, 0.014), 'z'),
    tf(axis(hexG(0.019, 0.012), 'z'), [0, 0, -0.013]),
    tf(axis(nose(0.012), '-z'), [0, 0, -0.019]),
  ), [-0.035, yT, zA - 0.007])), [0, 0.24, -0.05]);
  const zV = F07_VALVE_Z; // centre du clapet
  const valveBody = G(
    M('brass', boxG(0.03, 0.03, 0.06, 0.003, [0, 0, 0]), tf(cylG(0.009, 0.008, 14), [0, -0.019, 0])),
    M('steel',
      tf(axis(hexG(0.022, 0.008), 'z'), [0, 0, 0.034]),
      tf(axis(hexG(0.022, 0.008), 'z'), [0, 0, -0.034]),
      tf(hexG(0.016, 0.006), [0, -0.026, 0]),
    ),
  );
  // Tube rigide : té B (-Z) → entrée inférieure du clapet.
  const tb = hoseParts([[-0.08, yT, -0.075], [-0.08, yT - 0.006, -0.087], [-0.07, yT - 0.03, -0.094], [-0.048, yT - 0.043, -0.088], [-0.035, yT - 0.043, zV - 0.002], [-0.035, yT - 0.031, zV]], 0.0035, { ferrule: 2.6, seg: 28 });
  valveBody.add(at(G(M('steel', tb.hose, tb.metal)), [0.035, -yT, -zV]));
  P('6', at(valveBody, [-0.035, yT, zV]), [0, 0.32, -0.08]);
  P('7', M('steel', tf(merge(
    axis(hexG(0.019, 0.01), 'z'),
    tf(axis(revolve([[0, 0], [0.0075, 0], [0.0068, 0.003], [0.0075, 0.006], [0.0068, 0.009], [0.0075, 0.012], [0.0068, 0.015], [0.0055, 0.018], [0, 0.018]], 12, 40), '-z'), [0, 0, -0.005]),
    tf(axis(nose(0.014), 'z'), [0, 0, 0.005]),
  ), [-0.035, yT, zV - 0.045])), [0, 0.4, -0.12]);
  return { view: { dir: [0.9, 0.7, 1.1] } };
}

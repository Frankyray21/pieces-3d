import * as THREE from 'three';
import { mat } from '../../viewer/materials.js';
import { creaseNormals } from '../../viewer/shapes.js';

// Mât et tables (F14), mât (F15), table supérieure / chariot (F16),
// table inférieure / avance d'extension (F17), tête de rotation (F18).
// Repère du mât : axe du mât selon +X (pied à x = 0, sommet à x = 2.9),
// face de la tête de rotation vers +Y. L'axe des tiges de forage est à y = ROD_Y.
// Côté -Z : vérin du stinger et câble d'arrêt d'urgence (côté opérateur).

export const MAST = { length: 2.9, rodY: 0.59, carriageX: 2.0, extFeedX: 0.6 };

// ------------------------------------------------------------------ outils

function mk(geo, material) {
  if (geo.type === 'ExtrudeGeometry') geo = creaseNormals(geo);
  const m = new THREE.Mesh(geo, mat(material));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Fusionne les maillages d'un ou plusieurs objets : un maillage par matériau. */
function fuse(S, ...objs) {
  const list = objs.flat().filter(Boolean);
  const byMat = new Map();
  let inner = false;
  for (const o of list) {
    o.updateMatrixWorld(true);
    o.traverse((c) => {
      if (c.userData.hasInterior) inner = true;
      if (!c.isMesh) return;
      if (!byMat.has(c.material)) byMat.set(c.material, []);
      byMat.get(c.material).push(c);
    });
  }
  const g = new THREE.Group();
  for (const [m, meshes] of byMat) g.add(S.merged(meshes, m));
  if (inner) g.userData.hasInterior = true;
  return g;
}

const V2 = (pts) => pts.map(([u, v]) => new THREE.Vector2(u, v));

/** Arc de points [u, v] autour de (cu, cv), de a0 à a1 (radians), n segments. */
function arc(cu, cv, r, a0, a1, n = 10) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cu + Math.cos(a) * r, cv + Math.sin(a) * r];
  });
}

/** Lumière oblongue (trou de flottement) centrée en (cu, cv), demi-largeur w, demi-hauteur h. */
function slot(cu, cv, w, h) {
  return [...arc(cu, cv + h - w, w, 0, Math.PI, 8), ...arc(cu, cv - h + w, w, Math.PI, Math.PI * 2, 8)];
}

/**
 * Profil plan [[u, v]] extrudé selon l'axe local Z (centré). Trous : [u, v, r]
 * (ronds) ou listes de points. Chanfrein / arrondi d'arête optionnel (bevel).
 */
function slab(outer, depth, material, { holes = [], bevel = 0, curve = 12 } = {}) {
  let pts = V2(outer);
  if (THREE.ShapeUtils.isClockWise(pts)) pts = pts.reverse();
  const shape = new THREE.Shape(pts);
  for (const h of holes) {
    const p = new THREE.Path();
    if (typeof h[0] === 'number') p.absarc(h[0], h[1], h[2], 0, Math.PI * 2, true);
    else p.setFromPoints(V2(h));
    shape.holes.push(p);
  }
  const d = Math.max(depth - 2 * bevel, 0.001);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: curve,
  });
  geo.translate(0, 0, -d / 2);
  return mk(geo, material);
}

const mirrorHoles = (holes, f) => holes.map((h) => (typeof h[0] === 'number' ? [...f(h[0], h[1]), h[2]] : h.map(([u, v]) => f(u, v))));

/** Prisme d'axe X : profil [[z, y]] extrudé de x0 à x1. */
function prismX(prof, x0, x1, material, o = {}) {
  const f = (z, y) => [-z, y];
  const m = slab(prof.map(([z, y]) => f(z, y)), x1 - x0, material, { ...o, holes: mirrorHoles(o.holes || [], f) });
  m.rotation.y = Math.PI / 2;
  m.position.x = (x0 + x1) / 2;
  return m;
}

/** Prisme d'axe Y : profil [[x, z]] extrudé de y0 à y1. */
function prismY(prof, y0, y1, material, o = {}) {
  const m = slab(prof, y1 - y0, material, o);
  m.rotation.x = Math.PI / 2;
  m.position.y = (y0 + y1) / 2;
  return m;
}

/** Prisme d'axe Z : profil [[x, y]] extrudé de z0 à z1. */
function prismZ(prof, z0, z1, material, o = {}) {
  const m = slab(prof, z1 - z0, material, o);
  m.position.z = (z0 + z1) / 2;
  return m;
}

/**
 * Pièce de révolution d'axe X. Profil [[x, r, lisse?]] parcouru matière à
 * gauche : surfaces extérieures vers +X, alésages vers -X. Arêtes franches
 * sauf aux points marqués lisses.
 */
function lathe(prof, material, seg = 28) {
  const pts = [];
  prof.forEach(([x, r, smooth], i) => {
    const v = new THREE.Vector2(Math.max(r, 0), x);
    pts.push(v);
    if (!smooth && i > 0 && i < prof.length - 1) pts.push(v.clone());
  });
  const m = mk(new THREE.LatheGeometry(pts, seg), material);
  m.rotation.z = -Math.PI / 2;
  return m;
}

/** Pièce de révolution d'axe Y (même convention de profil, x → y). */
function latheY(prof, material, seg = 28) {
  const m = lathe(prof, material, seg);
  m.rotation.z = 0;
  return m;
}

/** Filets (profil en dents de scie) de x0 à x1 entre rIn et rOut, n filets. */
function threads(x0, x1, rIn, rOut, n) {
  const out = [];
  const p = (x1 - x0) / n;
  for (let i = 0; i < n; i++) out.push([x0 + i * p, rIn], [x0 + (i + 0.5) * p, rOut]);
  out.push([x1, rIn]);
  return out;
}

/** Prisme hexagonal d'axe X (surplat af), percé optionnellement. */
function hexX(af, len, material, hole = 0) {
  const R = af / Math.sqrt(3);
  const pts = Array.from({ length: 6 }, (_, i) => { const a = (i * Math.PI) / 3; return [Math.cos(a) * R, Math.sin(a) * R]; });
  return prismX(pts, -len / 2, len / 2, material, { holes: hole ? [[0, 0, hole]] : [], bevel: Math.min(af * 0.04, len * 0.15) });
}

// Fonctions de distance 2D (profils lobés échantillonnés en polaire).
const sdCircle = (cu, cv, r) => (u, v) => Math.hypot(u - cu, v - cv) - r;
const sdBox = (cu, cv, hw, hh, r = 0) => (u, v) => {
  const qx = Math.abs(u - cu) - hw + r, qy = Math.abs(v - cv) - hh + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};
/** Boîte arrondie posée radialement à la distance d, angle a compté depuis +v vers +u. */
const sdRadial = (d, a, ht, hr, r) => {
  const su = Math.sin(a), sv = Math.cos(a);
  const f = sdBox(0, 0, ht, hr, r);
  return (u, v) => { const du = u - su * d, dv = v - sv * d; return f(du * sv - dv * su, du * su + dv * sv); };
};
const sUnion = (k, ...fs) => (u, v) => fs.reduce((d, f) => {
  const b = f(u, v);
  const h = Math.max(k - Math.abs(d - b), 0) / k;
  return Math.min(d, b) - h * h * k * 0.25;
}, Infinity);

/** Contour d'une forme étoilée autour de l'origine (recherche radiale). */
function starOutline(sdf, n = 128, rMax = 1) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    let lo = 0, hi = rMax;
    for (let k = 0; k < 26; k++) { const m = (lo + hi) / 2; if (sdf(c * m, s * m) < 0) lo = m; else hi = m; }
    pts.push([c * lo, s * lo]);
  }
  return pts;
}

/** Oriente un objet construit selon +X vers la direction donnée. */
function along(obj, dir) {
  const g = new THREE.Group();
  g.add(obj);
  if (dir === '-x') obj.rotation.y = Math.PI;
  else if (dir === 'y') obj.rotation.z = Math.PI / 2;
  else if (dir === '-y') obj.rotation.z = -Math.PI / 2;
  else if (dir === 'z') obj.rotation.y = -Math.PI / 2;
  else if (dir === '-z') obj.rotation.y = Math.PI / 2;
  if (obj.userData.hasInterior) g.userData.hasInterior = true;
  return g;
}

const bolts = (S, pts, d, len, material = 'steel', o = {}) => S.merged(pts.map((p) => S.bolt(d, len, material, { ...o, pos: p })), material);
const washers = (S, pts, rOut, rIn, t, material = 'steel', axis = 'y', seg = 16) => S.merged(pts.map((p) => S.ring(rOut, rIn, t, material, { axis, seg, pos: p })), material);
const nuts = (S, pts, size, h, material = 'steel', axis = 'y') => S.merged(pts.map((p) => S.nut(size, h, material, { axis, pos: p })), material);

/**
 * Vérin le long de +X, de l'axe arrière (x = 0) à l'axe de tige (x = len).
 * back / front : 'eye' (œil), 'clevis' (chape) ou 'none' ; pin : axe des œils
 * ('z' ou 'y') ; neck : distance axe arrière → fond du fût. Fût creux (coupe).
 */
function ram(S, len, bore, { material = 'red', ext = 0.4, rodR, back = 'eye', front = 'eye', pin = 'z', neck, ports = true, rodMat = 'chrome' } = {}) {
  const { at, box, cyl, ring } = S;
  const r = bore / 2, ro = r * 1.2;
  rodR = rodR ?? r * 0.5;
  const eR = Math.max(ro * 0.78, rodR * 1.55), pinR = eR * 0.42, w = eR * 1.1;
  const off = back === 'none' ? 0 : neck ?? eR * 1.25;
  const offF = front === 'none' ? 0 : eR * 1.3;
  const xb0 = off, xr1 = len - offF;
  const xb1 = xb0 + (xr1 - xb0) * (1 - ext);
  const cap = Math.min(r * 1.3, (xb1 - xb0) * 0.12);
  const parts = [
    lathe([
      [xb0, 0], [xb0, ro * 0.9], [xb0 + cap * 0.25, ro * 1.07], [xb0 + cap, ro * 1.07], [xb0 + cap, ro],
      [xb1 - cap, ro], [xb1 - cap, ro * 1.07], [xb1 - cap * 0.25, ro * 1.07], [xb1, ro * 0.9],
      [xb1, rodR * 1.06], [xb1 - cap, rodR * 1.06], [xb1 - cap, r], [xb0 + cap, r], [xb0 + cap, 0],
    ], material, 28),
  ];
  const px = xb0 + cap + (xb1 - xb0 - 2 * cap) * 0.3;
  parts.push(at(cyl(r * 0.97, r * 0.7, 'darkSteel', { axis: 'x' }), [px, 0, 0]));
  parts.push(at(cyl(rodR, xr1 - px, rodMat, { axis: 'x' }), [(px + xr1) / 2, 0, 0]));
  const across = (lx, ly, lp) => (pin === 'z' ? [lx, ly, lp] : [lx, lp, ly]);
  if (back === 'eye') {
    parts.push(ring(eR, pinR, w, material, { axis: pin, pos: [0, 0, 0] }));
    if (off > eR * 0.7) parts.push(at(box(off - eR * 0.6, ...across(0, eR * 1.25, w).slice(1), material), [(off + eR * 0.6) / 2, 0, 0]));
  } else if (back === 'clevis') {
    for (const s of [1, -1]) {
      const p = s * (w * 0.5 + w * 0.22);
      parts.push(ring(eR, pinR, w * 0.42, material, { axis: pin, pos: pin === 'z' ? [0, 0, p] : [0, p, 0] }));
      parts.push(at(box(off, ...across(0, eR * 1.6, w * 0.42).slice(1), material), pin === 'z' ? [off / 2, 0, p] : [off / 2, p, 0]));
    }
  }
  if (front === 'eye') {
    parts.push(ring(eR, pinR, w, 'darkSteel', { axis: pin, pos: [len, 0, 0] }));
    parts.push(at(cyl(rodR * 1.25, offF - eR * 0.6, 'darkSteel', { axis: 'x' }), [xr1 + (offF - eR * 0.6) / 2, 0, 0]));
  } else if (front === 'clevis') {
    const base = eR * 0.7;
    parts.push(at(box(base, ...across(0, eR * 2, w * 1.9).slice(1), 'darkSteel'), [xr1 + base / 2, 0, 0]));
    for (const s of [1, -1]) {
      const p = s * (w * 0.5 + w * 0.22);
      const l = len - xr1 - base;
      parts.push(ring(eR, pinR, w * 0.42, 'darkSteel', { axis: pin, pos: pin === 'z' ? [len, 0, p] : [len, p, 0] }));
      parts.push(at(box(l, ...across(0, eR * 2, w * 0.42).slice(1), 'darkSteel'), pin === 'z' ? [xr1 + base + l / 2, 0, p] : [xr1 + base + l / 2, p, 0]));
    }
  }
  if (ports) {
    for (const x of [xb0 + cap + r * 0.9, xb1 - cap - r * 0.9]) {
      parts.push(at(cyl(r * 0.42, r * 0.5, material, { axis: 'y' }), [x, ro + r * 0.15, 0]));
      parts.push(at(S.nut(r * 0.55, r * 0.3, 'steel'), [x, ro + r * 0.5, 0]));
    }
  }
  const g = fuse(S, parts);
  g.userData.hasInterior = true;
  return g;
}

// ------------------------------------------------------- F18 tête de rotation

export function F18(api) {
  const S = api.S;
  const { box, cyl, at, plate } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // 3 — Carter : roue centrale, lobes des pignons en bas, nervure supérieure,
  // nervures d'épaule ; couvercle avant étagé, semelle boulonnée.
  const prof = starOutline(sUnion(0.012,
    sdCircle(0, 0, 0.19),
    sdBox(0, -0.115, 0.198, 0.088, 0.035),
    sdBox(0, 0.17, 0.074, 0.056, 0.018),
    sdRadial(0.17, 1.08, 0.048, 0.046, 0.014),
    sdRadial(0.17, -1.08, 0.048, 0.046, 0.014),
  ), 144, 0.4);
  const holes = [];
  for (const s of [1, -1]) for (const x of [-0.16, -0.08, 0, 0.08, 0.16]) holes.push([x, s * 0.228, 0.011]);
  P('3', fuse(S,
    prismX(prof, -0.088, 0.212, 'red', { bevel: 0.009 }),
    // Tambour avant (roue dentée) et lobes inférieurs jusqu'à la face avant
    lathe([[-0.118, 0], [-0.118, 0.186], [-0.112, 0.194, 1], [-0.1, 0.196], [-0.08, 0.196], [-0.08, 0]], 'red', 56),
    prismX(starOutline(sdBox(0, -0.115, 0.198, 0.088, 0.035), 96, 0.4), -0.112, -0.08, 'red', { bevel: 0.006 }),
    lathe([
      [-0.196, 0.07], [-0.196, 0.116], [-0.19, 0.123], [-0.172, 0.123], [-0.172, 0.148], [-0.166, 0.155],
      [-0.152, 0.155], [-0.152, 0.176], [-0.144, 0.184], [-0.112, 0.184], [-0.112, 0.07], [-0.196, 0.07],
    ], 'red', 40),
    at(cyl(0.07, 0.004, 'charcoal', { axis: 'x' }), [-0.121, 0, 0]),
    at(plate(0.42, 0.5, 0.03, 'red', { holes }), [0, -0.22, 0]),
    // Portées des moteurs et du joint tournant (face arrière)
    ...[1, -1].map((s) => at(cyl(0.08, 0.016, 'red', { axis: 'x' }), [0.218, -0.03, s * 0.165])),
    lathe([[0.212, 0.055], [0.212, 0.122], [0.222, 0.122], [0.227, 0.117], [0.227, 0.055], [0.212, 0.055]], 'red', 48),
    // Trous de manutention des lobes
    ...[1, -1].map((s) => at(cyl(0.019, 0.004, 'charcoal', { axis: 'x' }), [-0.12, -0.15, s * 0.152])),
    ...[1, -1].map((s) => at(cyl(0.019, 0.004, 'charcoal', { axis: 'x' }), [0.214, -0.15, s * 0.152])),
  ), [0, 0, 0]);

  // 2 — Déflecteur de poussière (disque à gradin)
  P('2', lathe([
    [-0.213, 0.071], [-0.213, 0.106], [-0.207, 0.112], [-0.207, 0.165], [-0.203, 0.17], [-0.197, 0.17], [-0.197, 0.071], [-0.213, 0.071],
  ], 'red', 48), [-0.32, 0, 0]);

  // 1 — Raccord d'usure (saver sub) : six pans, collet, filetage mâle, alésage
  P('1', fuse(S,
    lathe([
      [-0.304, 0.042], [-0.304, 0.066], [-0.296, 0.075], [-0.228, 0.075], [-0.228, 0.08], [-0.213, 0.08], [-0.213, 0.062],
      ...threads(-0.207, -0.13, 0.062, 0.068, 9), [-0.124, 0.06], [-0.124, 0.042], [-0.304, 0.042],
    ], 'black', 32),
    at(hexX(0.165, 0.066, 'black', 0.05), [-0.262, 0, 0]),
    at(cyl(0.0415, 0.004, 'charcoal', { axis: 'x', open: true }), [-0.25, 0, 0]),
  ), [-0.6, 0, 0]);

  // 4 — Moteurs de rotation (bride ovale 2 trous, bloc de distribution, cloche à fond plat)
  const flange = starOutline(sUnion(0.03, sdCircle(0, 0, 0.07), sdBox(0, 0, 0.032, 0.108, 0.03)), 72, 0.2);
  for (const s of [1, -1]) {
    const m = fuse(S,
      lathe([
        [0.17, 0], [0.17, 0.015], [0.2, 0.015], [0.2, 0.034], [0.244, 0.034], [0.244, 0.062], [0.256, 0.07],
        [0.3, 0.07], [0.3, 0.073], [0.31, 0.073], [0.31, 0.07], [0.372, 0.07], [0.384, 0.067, 1], [0.392, 0.06, 1], [0.396, 0.05], [0.396, 0.042], [0.398, 0.04], [0.398, 0],
      ], 'black', 32),
      prismX(flange, 0.224, 0.244, 'black', { bevel: 0.004 }),
      ...[1, -1].map((k) => at(S.nut(0.022, 0.012, 'darkSteel', { axis: 'x' }), [0.25, k * 0.088, 0])),
      at(box(0.058, 0.04, 0.1, 'black', { r: 0.008 }), [0.282, 0.078, 0]),
      ...[1, -1].map((k) => at(cyl(0.017, 0.016, 'black'), [0.282, 0.104, k * 0.025])),
    );
    m.position.set(0, -0.03, s * 0.165);
    P('4', m, [0.42, 0, s * 0.2]);
  }

  // 6 — Joint tournant (eau) : nez fileté, corps, bride boulonnée, carré d'entraînement
  P('6', fuse(S,
    lathe([
      [0.2, 0], [0.2, 0.05], ...threads(0.2, 0.236, 0.05, 0.055, 4), [0.236, 0.07], [0.242, 0.076], [0.394, 0.076],
      [0.4, 0.07], [0.4, 0.09], [0.42, 0.09], [0.42, 0.06], [0.432, 0.06], [0.432, 0],
    ], 'red', 40),
    S.merged(Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      return S.nut(0.018, 0.01, 'red', { axis: 'x', pos: [0.425, Math.cos(a) * 0.076, Math.sin(a) * 0.076] });
    }), 'red'),
    at(box(0.125, 0.072, 0.072, 'red', { r: 0.006 }), [0.49, 0, 0]),
    at(cyl(0.017, 0.004, 'charcoal', { axis: 'z' }), [0.5, 0, -0.036]),
    at(cyl(0.01, 0.006, 'charcoal', { axis: 'x' }), [0.553, 0, 0]),
    at(box(0.07, 0.003, 0.05, 'redDark'), [0.3, 0.0755, 0]),
  ), [0.62, 0, 0]);
  // 7 — Raccord droit (entrée d'eau, face latérale du carré) ; 5 — coude (sur le carré)
  P('7', at(S.fitting(0.024, 0.055, 'red', { axis: 'z' }), [0.462, 0, 0.044]), [0.62, 0, 0.3]);
  P('5', at(S.fitting(0.018, 0.04, 'red', { elbow: true }), [0.535, 0.044, 0]), [0.66, 0.28, 0]);

  // 9 — Vis 3/4" (5 par côté) ; 8 — rondelles Nord-Lock (paire de rondelles)
  for (const s of [1, -1]) {
    const pts = [-0.16, -0.08, 0, 0.08, 0.16].map((x) => [x, -0.199, s * 0.228]);
    P('8', S.merged(pts.flatMap(([x, y, z]) => [
      S.ring(0.019, 0.0105, 0.003, 'steel', { seg: 16, pos: [x, y - 0.0045, z] }),
      S.ring(0.019, 0.0105, 0.003, 'darkSteel', { seg: 16, pos: [x, y - 0.0015, z] }),
    ]), 'steel'), [0, 0.12, s * 0.12]);
    P('9', bolts(S, pts, 0.019, 0.064), [0, 0.3, s * 0.2]);
  }
  return { view: { dir: [-0.9, 0.6, 1.0] } };
}

// ------------------------------------------- F16 table supérieure (chariot)

export function F16(api) {
  const S = api.S;
  const { box, cyl, ring, at, tube } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const cups = [];
  for (const sx of [1, -1]) for (const sz of [1, -1]) cups.push([sx * 0.295, sz * 0.2]);

  // 1 — Plaque de montage : plaque à languette (+X, côté joint tournant),
  // caissons latéraux en C sur les barres de guidage, rambardes, 4 godets.
  const outline = [[-0.35, -0.265], [0.35, -0.265], [0.35, -0.12], [0.41, -0.07], [0.56, -0.07], [0.56, 0.265], [-0.35, 0.265]];
  const pHoles = cups.map(([x, z]) => [x, z, 0.04]);
  for (const x of [-0.2, -0.1, 0, 0.1, 0.2]) pHoles.push([x, 0.0, 0.009]);
  for (const x of [-0.06, 0.06]) for (const z of [-0.06, 0.06]) pHoles.push([x, z, 0.012]);
  const housing = (s, x0, x1) => prismX([[0.205, -0.075], [0.262, -0.075], [0.262, 0.016], [0.241, 0.016], [0.241, -0.06], [0.205, -0.06]].map(([z, y]) => [s * z, y]), x0, x1, 'red');
  const rail = (s, x0, x1) => tube([[x0, 0.05, s * 0.252], [x0 + 0.03, 0.088, s * 0.252], [x1 - 0.03, 0.088, s * 0.252], [x1, 0.05, s * 0.252]], 0.007, 'red', { sharp: true, seg: 6 });
  P('1', fuse(S,
    prismY(outline, 0.016, 0.05, 'red', { holes: pHoles }),
    housing(1, -0.35, 0.56), housing(-1, -0.35, 0.35),
    rail(1, -0.33, 0.54), rail(-1, -0.33, 0.33),
    ...cups.map(([x, z]) => S.ring(0.056, 0.041, 0.045, 'red', { pos: [x, 0.0725, z] })),
    // Bossages des vis de réglage latérales
    ...[1, -1].flatMap((s) => [-0.2, 0, 0.2].map((x) => at(box(0.05, 0.05, 0.012, 'red'), [x, -0.02, s * 0.268]))),
  ), [0, 0, 0]);

  // 2 — Entretoise de la tête : semelle, âmes, bracons, plateau percé (10 vis de la tête)
  const topHoles = [];
  for (const s of [1, -1]) for (const x of [-0.16, -0.08, 0, 0.08, 0.16]) topHoles.push([x, s * 0.228, 0.011]);
  const botHoles = [];
  for (const s of [1, -1]) for (const x of [-0.18, -0.06, 0.06, 0.18]) botHoles.push([x, s * 0.165, 0.013]);
  P('2', fuse(S,
    prismY([[-0.24, -0.19], [0.24, -0.19], [0.24, 0.19], [-0.24, 0.19]], 0.05, 0.074, 'red', { holes: botHoles }),
    prismY([[-0.24, -0.25], [0.24, -0.25], [0.24, 0.25], [-0.24, 0.25]], 0.19, 0.215, 'red', { holes: topHoles }),
    ...[1, -1].map((s) => at(box(0.44, 0.116, 0.02, 'red'), [0, 0.132, s * 0.11])),
    ...[1, -1].map((s) => prismZ([[s * 0.21, 0.074], [s * 0.17, 0.074], [s * 0.02, 0.19], [s * 0.06, 0.19]], -0.012, 0.012, 'red')),
  ), [0, 0.85, 0]);

  // 3 — Couvercles de retenue (bouts des caissons) + 11 vis + 13 rondelles
  const ends = [[-0.356, -1, -1], [0.356, 1, -1], [-0.356, -1, 1], [0.566, 1, 1]];
  for (const [x, sx, sz] of ends) {
    const x0 = sx > 0 ? x - 0.006 : x - 0.006, x1 = x0 + 0.012;
    P('3', prismX([[0.19, -0.082], [0.268, -0.082], [0.268, 0.03], [0.25, 0.05], [0.19, 0.05]].map(([z, y]) => [sz * z, y]), x0, x1, 'red'), [sx * 0.3, 0, 0]);
    const pts = [[0.205, -0.065], [0.255, -0.065], [0.205, 0.03], [0.255, 0.03]].map(([z, y]) => [x + sx * 0.006, y, sz * z]);
    P('11', bolts(S, pts, 0.012, 0.03, 'steel', { axis: sx > 0 ? 'x' : '-x' }), [sx * 0.48, 0, 0]);
    P('13', washers(S, pts.map(([px, y, z]) => [px + sx * 0.0015, y, z]), 0.013, 0.007, 0.003, 'steel', 'x'), [sx * 0.4, 0, 0]);
  }

  // 4 — Glissières téflon (profil en L sur la barre) ; 5 — porte-glissières (C noir)
  for (const s of [1, -1]) {
    const x1 = s > 0 ? 0.555 : 0.345;
    P('4', prismX([[0.17, 0.0], [0.17, 0.008], [0.233, 0.008], [0.233, -0.05], [0.225, -0.05], [0.225, 0.0]].map(([z, y]) => [s * z, y]), -0.345, x1, 'lightGrey'), [0, -0.34, s * 0.5]);
    P('5', prismX([[0.17, 0.016], [0.241, 0.016], [0.241, -0.06], [0.205, -0.06], [0.205, -0.052], [0.233, -0.052], [0.233, 0.008], [0.17, 0.008]].map(([z, y]) => [s * z, y]), -0.345, x1, 'black'), [0, -0.34, s * 0.3]);
  }

  // 6 — Flottants : semelle 4 trous + oreille à lumière (tourillons du vérin d'avance)
  const lug = [[-0.11, -0.014], [0.11, -0.014], [0.055, -0.12], ...arc(0, -0.15, 0.055, 0, -Math.PI, 12), [-0.055, -0.12]];
  for (const s of [1, -1]) {
    P('6', fuse(S,
      at(box(0.24, 0.03, 0.09, 'red', { r: 0.006 }), [0, 0.001, s * 0.1]),
      prismZ(lug, s * 0.0925 - 0.0125, s * 0.0925 + 0.0125, 'red', { holes: [slot(0, -0.14, 0.02, 0.034)] }),
    ), [0, -0.32, s * 0.2]);
    const pts = [[-0.09, -0.014, s * 0.072], [0.09, -0.014, s * 0.072], [-0.09, -0.014, s * 0.128], [0.09, -0.014, s * 0.128]];
    P('16', bolts(S, pts, 0.019, 0.064, 'steel', { axis: '-y' }), [0, -0.55, s * 0.2]);
    P('17', washers(S, pts.map(([x, y, z]) => [x, y - 0.002, z]), 0.021, 0.0105, 0.004), [0, -0.46, s * 0.2]);
  }

  // 7 — Support de boyaux (sur la languette) + 12 vis + 13 rondelles
  P('7', fuse(S,
    prismX([[0.08, 0.05], [0.25, 0.05], [0.25, 0.27], [0.22, 0.3], [0.08, 0.3]], 0.42, 0.432, 'red', { holes: [[0.125, 0.235, 0.03], [0.2, 0.235, 0.03], [0.165, 0.15, 0.012]] }),
    at(box(0.098, 0.012, 0.17, 'red'), [0.481, 0.056, 0.165]),
    prismZ([[0.432, 0.062], [0.515, 0.062], [0.432, 0.19]], 0.159, 0.171, 'red'),
  ), [0.25, 0.25, 0.1]);
  const hp = [[0.47, 0.062, 0.11], [0.47, 0.062, 0.22], [0.51, 0.062, 0.11], [0.51, 0.062, 0.22]];
  P('12', bolts(S, hp.map(([x, y, z]) => [x, y + 0.003, z]), 0.012, 0.03), [0.25, 0.45, 0.1]);
  P('13', washers(S, hp.map(([x, y, z]) => [x, y + 0.0015, z]), 0.013, 0.007, 0.003), [0.25, 0.37, 0.1]);

  // Poussoirs aux 4 godets : 8 rondelle téflon, 9 plaque de poussée, 10 couvercle
  // (8 vis 21 + rondelles 20), 18 vis de réglage à tête carrée au centre.
  for (const [x, z] of cups) {
    P('8', cyl(0.038, 0.054, 'grey', { pos: [x, 0.043, z] }), [0, 0.12, 0]);
    P('9', cyl(0.04, 0.01, 'white', { pos: [x, 0.075, z] }), [0, 0.2, 0]);
    P('10', fuse(S, ring(0.058, 0.012, 0.012, 'lightGrey', { pos: [x, 0.101, z] })), [0, 0.28, 0]);
    const bp = Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return [x + Math.cos(a) * 0.047, 0.1085, z + Math.sin(a) * 0.047]; });
    P('20', washers(S, bp, 0.0075, 0.0035, 0.0015, 'steel', 'y', 10), [0, 0.35, 0]);
    P('21', bolts(S, bp.map(([px, , pz]) => [px, 0.109, pz]), 0.0058, 0.016), [0, 0.42, 0]);
    P('18', S.bolt(0.019, 0.05, 'steel', { head: 'square', pos: [x, 0.125, z] }), [0, 0.53, 0]);
  }

  // Entretoise : 14 vis 1" + 15 rondelles (sur la semelle) ; par côté
  for (const s of [1, -1]) {
    const pts = [-0.18, -0.06, 0.06, 0.18].map((x) => [x, 0.077, s * 0.165]);
    P('15', washers(S, pts.map(([x, , z]) => [x, 0.0755, z]), 0.03, 0.013, 0.003), [0, 1.2, 0]);
    P('14', bolts(S, pts, 0.025, 0.09), [0, 1.38, 0]);
  }

  // 19 — Vis de réglage latérales à tête carrée (3 par côté) + 22 contre-écrous
  for (const s of [1, -1]) {
    const pts = [-0.2, 0, 0.2].map((x) => [x, -0.02, s * 0.292]);
    P('19', bolts(S, pts, 0.019, 0.07, 'steel', { axis: s > 0 ? 'z' : '-z', head: 'square' }), [0, 0, s * 0.3]);
    P('22', nuts(S, pts.map(([x, y]) => [x, y, s * 0.283]), 0.029, 0.017, 'steel', 'z'), [0, 0, s * 0.16]);
  }
  return { view: { dir: [0.9, 0.9, 1.0] } };
}

// ------------------------------- F17 table inférieure (avance d'extension)

export function F17(api) {
  const S = api.S;
  const { box, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const bx = [-0.25, -0.15, -0.05, 0.05, 0.15, 0.25];

  // 1 — Plaque : patte d'ancrage du vérin d'extension (+Z), couronnes de trous
  const outline = [[-0.35, -0.3], [0.35, -0.3], [0.35, 0.3], [0.1, 0.3], [0.06, 0.34], ...arc(0, 0.36, 0.06, -0.32, Math.PI + 0.32, 12), [-0.06, 0.34], [-0.1, 0.3], [-0.35, 0.3]];
  const holes = [[0, 0, 0.05], [0, 0.36, 0.016]];
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; holes.push([Math.cos(a) * 0.088, Math.sin(a) * 0.088, 0.009]); }
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; holes.push([Math.cos(a) * 0.14, Math.sin(a) * 0.14, 0.011]); }
  for (const s of [1, -1]) for (const x of bx) holes.push([x, s * 0.265, 0.007]);
  P('1', prismY(outline, -0.015, 0.015, 'red', { holes }), [0, 0, 0]);

  for (const s of [1, -1]) {
    // 2 — Glissière téflon (feuille noire sous la semelle du mât)
    P('2', at(box(0.64, 0.008, 0.1, 'black'), [0, 0.019, s * 0.215]), [0, 0.1, 0]);
    // 3 — Butée : cornière noire à bouts recourbés
    P('3', fuse(S,
      prismX([[0.245, 0.023], [0.29, 0.023], [0.29, 0.031], [0.253, 0.031], [0.253, 0.045], [0.245, 0.045]].map(([z, y]) => [s * z, y]), -0.35, 0.35, 'black'),
      ...[1, -1].map((k) => at(box(0.01, 0.046, 0.045, 'black'), [k * 0.355, 0.008, s * 0.2675])),
    ), [0, 0.2, 0]);
    // 4 — Téflon (orange) à talons d'extrémité
    P('4', fuse(S,
      at(box(0.6, 0.015, 0.075, 'orange'), [0, 0.0525, s * 0.2525]),
      ...[1, -1].map((k) => prismX([[0.245, 0.045], [0.29, 0.045], [0.29, 0.085], [0.262, 0.085], [0.262, 0.07], [0.245, 0.07]].map(([z, y]) => [s * z, y]), k > 0 ? 0.3 : -0.34, k > 0 ? 0.34 : -0.3, 'orange')),
    ), [0, 0.32, 0]);
    // 5 — Bloc de poussée (gris) à gradin intérieur
    P('5', prismX([[0.218, 0.07], [0.218, 0.1], [0.294, 0.1], [0.3, 0.094], [0.3, 0.06], [0.235, 0.06], [0.235, 0.07]].map(([z, y]) => [s * z, y]), -0.3, 0.3, 'lightGrey', { bevel: 0.002 }), [0, 0.45, 0]);
    // 7 vis, 8 rondelles (dessus / dessous), 9 écrous — 6 par côté
    const top = bx.map((x) => [x, 0.1, s * 0.265]);
    P('8', washers(S, top.map(([x, y, z]) => [x, y + 0.0015, z]), 0.013, 0.0065, 0.003), [0, 0.56, 0]);
    P('7', bolts(S, top.map(([x, y, z]) => [x, y + 0.003, z]), 0.012, 0.15), [0, 0.85, 0]);
    P('8', washers(S, top.map(([x, , z]) => [x, -0.0165, z]), 0.013, 0.0065, 0.003), [0, -0.12, 0]);
    P('9', nuts(S, top.map(([x, , z]) => [x, -0.024, z]), 0.019, 0.011), [0, -0.2, 0]);
  }
  // 6 — Anneau de centrage (sous la plaque, sur la bride de l'actionneur)
  P('6', at(latheY([[-0.02, 0.055], [-0.02, 0.085], [-0.015, 0.09], [0.015, 0.09], [0.02, 0.085], [0.02, 0.055], [-0.02, 0.055]], 'steel', 40), [0, -0.035, 0]), [0, -0.32, 0]);
  return { view: { dir: [0.8, 0.9, 1.0] } };
}

// ----------------------------------------------------------------- F15 mât

export function F15(api) {
  const S = api.S;
  const { box, cyl, ring, tube, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { length: L, rodY } = MAST;
  const red = 'red';

  // M — Corps du mât : flancs percés, semelles grises (glissement sur la table
  // inférieure), traverses en T, cloison haute à encoche, gousset ; bloc de
  // pied (charnières des tables, pattes des vérins) ; supports du stinger.
  const fr = [];
  const sideHoles = [];
  // Flancs pleins : rangée de trous près du bord supérieur, petits groupes de
  // trous de fixation (comme sur le dessin F15).
  for (let x = 0.5; x < 2.8; x += 0.22) sideHoles.push([x, 0.042, 0.014]);
  for (const x of [0.75, 1.62, 2.25]) for (const dx of [0, 0.03]) for (const y of [-0.02, -0.05]) sideHoles.push([x + dx, y, 0.006]);
  for (const s of [1, -1]) {
    fr.push(prismZ([[0.32, -0.105], [L, -0.105], [L, 0.078], [0.32, 0.078]], s > 0 ? 0.16 : -0.18, s > 0 ? 0.18 : -0.16, red, { holes: sideHoles }));
    fr.push(at(box(L - 0.32, 0.012, 0.05, red), [(L + 0.32) / 2, 0.084, s * 0.175]));
    fr.push(at(box(L - 0.32, 0.022, 0.095, 'grey'), [(L + 0.32) / 2, -0.116, s * 0.1975]));
    // Goussets horizontaux du sommet
    for (const y of [-0.06, 0.035]) fr.push(prismY([[2.64, s * 0.16], [2.8, s * 0.16], [2.8, s * 0.1]], y, y + 0.012, red));
  }
  for (const x of [0.75, 1.3, 1.85, 2.4]) {
    fr.push(at(box(0.08, 0.016, 0.32, red), [x, -0.097, 0]));
    fr.push(at(box(0.012, 0.022, 0.32, red), [x, -0.078, 0]));
  }
  // Cloison haute : encoche en U pour la tige supérieure du vérin d'avance
  fr.push(prismX([[-0.16, -0.105], [0.16, -0.105], [0.16, 0.078], [0.036, 0.078], ...arc(0, 0, 0.036, 0, -Math.PI, 10), [-0.036, 0.078], [-0.16, 0.078]], 2.8, 2.83, red));
  // Bloc de pied
  fr.push(at(box(0.7, 0.025, 0.43, red), [-0.03, 0.0725, 0]));
  fr.push(at(box(0.7, 0.022, 0.43, red), [-0.03, -0.116, 0]));
  for (const s of [1, -1]) {
    fr.push(prismZ([[-0.38, -0.105], [0.32, -0.105], [0.32, 0.06], [-0.38, 0.06]], s > 0 ? 0.195 : -0.215, s > 0 ? 0.215 : -0.195, red, { holes: [[-0.25, -0.03, 0.032], [0.0, -0.03, 0.032], [0.2, -0.045, 0.015], [0.24, -0.045, 0.015]] }));
    // Charnières (axes 21) : 3 chapes par côté
    for (const [x0, x1] of [[-0.3, -0.22], [-0.12, -0.06], [0.04, 0.12]]) {
      fr.push(ring(0.042, 0.023, x1 - x0, red, { axis: 'x', pos: [(x0 + x1) / 2, 0.13, s * 0.2] }));
      fr.push(at(box(x1 - x0, 0.045, 0.07, red), [(x0 + x1) / 2, 0.1075, s * 0.2]));
    }
    // Pattes des vérins de tables (axes 17 / 27)
    for (const dx of [0.035, -0.035]) {
      fr.push(at(box(0.015, 0.06, 0.115, red), [-0.16 + dx, -0.1, s * 0.2725]));
      fr.push(ring(0.03, 0.012, 0.015, red, { axis: 'x', pos: [-0.16 + dx, -0.1, s * 0.33] }));
    }
  }
  fr.push(at(box(0.02, 0.165, 0.39, red), [-0.37, -0.0225, 0]));
  // Platine de jonction des boyaux (flanc +Z, grille de trous)
  const grid = [];
  for (const x of [-0.06, -0.02, 0.02, 0.06]) for (const y of [-0.02, 0.02]) grid.push([1.15 + x, y, 0.007]);
  fr.push(prismZ([[1.06, -0.05], [1.24, -0.05], [1.24, 0.05], [1.06, 0.05]], 0.18, 0.192, red, { holes: grid }));
  for (const [x, z0, z1] of [[0.6, 0.18, 0.19], [2.0, 0.18, 0.19], [1.4, -0.19, -0.18]]) {
    fr.push(prismZ([[x - 0.025, -0.06], [x + 0.025, -0.06], [x + 0.025, 0.01], [x - 0.025, 0.01]], z0, z1, 'redDark', { holes: [[x, -0.04, 0.006], [x, -0.01, 0.006]] }));
  }
  fr.push(prismX([[-0.195, -0.105], [0.195, -0.105], [0.195, 0.06], [-0.195, 0.06]], 0.3, 0.32, red, { holes: [[0, 0, 0.031]] }));
  // Patte du vérin d'extension (sous le bloc, côté +Z)
  fr.push(at(box(0.1, 0.0455, 0.045, red), [0.02, -0.14975, 0.1925]));
  fr.push(prismY([[-0.03, 0.17], [0.07, 0.17], ...arc(0.02, 0.36, 0.05, 0, Math.PI, 10), [-0.03, 0.17]].map(([x, z]) => [x, z]), -0.1975, -0.1725, red, { holes: [[0.02, 0.36, 0.016]] }));
  // Supports du stinger (côté -Z) : oreilles à demi-lunette + âme + gousset
  for (const x of [1.05, 2.45]) {
    fr.push(prismX([[-0.2, -0.083], [-0.27, -0.083], [-0.27, -0.046], ...arc(-0.27, 0, 0.046, -Math.PI / 2, Math.PI / 2, 12), [-0.27, 0.078], [-0.2, 0.078]], x - 0.025, x + 0.025, red));
    fr.push(at(box(0.05, 0.02, 0.022, red), [x, 0, -0.19]));
    fr.push(prismX([[-0.18, -0.083], [-0.2, -0.083], [-0.18, -0.035]], x - 0.006, x + 0.006, red));
  }
  P('M', fuse(S, fr), [0, 0, 0]);

  // 24 — Barres de guidage (sur les flancs)
  for (const s of [1, -1]) P('24', box(2.6, 0.05, 0.05, 'grey', { r: 0.005, pos: [1.5, 0.115, s * 0.2] }), [0, 0.3, s * 0.12]);
  // 25 — Couvercle supérieur : bac à rebord, raidisseurs, chape en U du stinger
  const tray = (xFace, sx, h0, h1, lugU) => {
    const out = [];
    const x0 = xFace, xr = xFace + sx * 0.012, xe = xFace + sx * 0.04;
    out.push(prismX([[-0.215, h0], [0.215, h0], [0.215, h1], [-0.215, h1]], Math.min(x0, xr), Math.max(x0, xr), red));
    const rim = [[-0.215, h0], [0.215, h0], [0.215, h1], [-0.215, h1]];
    const inner = [[-0.2, h0 + 0.015], [-0.2, h1 - 0.015], [0.2, h1 - 0.015], [0.2, h0 + 0.015]];
    out.push(prismX(rim, Math.min(xr, xe), Math.max(xr, xe), red, { holes: [inner] }));
    out.push(prismX([[-0.2, h0 + 0.015], [-0.13, h0 + 0.015], [-0.2, h0 + 0.09]], Math.min(xr, xe), Math.max(xr, xe), red));
    out.push(prismX([[0.2, h1 - 0.015], [0.13, h1 - 0.015], [0.2, h1 - 0.09]], Math.min(xr, xe), Math.max(xr, xe), red));
    if (lugU) out.push(prismX([[-0.215, -0.045], [-0.215, 0.06], [-0.249, 0.06], [-0.249, 0], ...arc(-0.27, 0, 0.021, 0, -Math.PI, 8), [-0.291, 0], [-0.291, 0.06], [-0.315, 0.06], [-0.315, -0.045]], Math.min(x0, xe), Math.max(x0, xe), red));
    return out;
  };
  P('25', fuse(S, tray(L, 1, -0.127, 0.11, true),
    bolts(S, [[-0.1, -0.097], [0.1, -0.097], [-0.1, 0.08], [0.1, 0.08]].map(([z, y]) => [L + 0.012, y, z]), 0.012, 0.03, 'steel', { axis: 'x' })), [0.35, 0, 0]);
  // 29 — Couvercle inférieur (bout du bloc de pied)
  P('29', fuse(S, tray(-0.38, -1, -0.127, 0.06, false),
    bolts(S, [[-0.1, -0.097], [0.1, -0.097], [-0.1, 0.03], [0.1, 0.03]].map(([z, y]) => [-0.392, y, z]), 0.012, 0.03, 'steel', { axis: '-x' })), [-0.35, 0, 0]);

  // Tables au pied du mât : 26 table droite (+Z), 12 table gauche (-Z),
  // logement des mâchoires ouvert vers le haut. Montrées ouvertes sur leurs
  // charnières (axes 21), comme sur les dessins F04 et F14.
  const OPEN = 0.7;
  const hinge = (s) => new THREE.Vector3(0, 0.13, s * 0.2);
  const rot = (s, [x, y, z]) => { const a = s * OPEN; return [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)]; };
  const add = (a, b) => a.map((v, i) => v + b[i]);
  /** Pièce portée par la table s : pivote avec elle autour de la charnière. */
  const tilt = (s, obj) => {
    const g = new THREE.Group();
    g.position.copy(hinge(s));
    g.rotation.x = s * OPEN;
    obj.position.sub(hinge(s));
    g.add(obj);
    if (obj.userData.hasInterior) g.userData.hasInterior = true;
    return g;
  };
  const onTable = (s, local) => add([-0.05, 0.05, s * 0.55], rot(s, local));
  const tableProf = [[0, 0.3], [0, 0.46], [0.13, 0.46], [0.13, 0.72], [0.27, 0.72], [0.3, 0.69], [0.3, 0.3], [0.25, 0.18], [0.15, 0.18], [0.1, 0.24], [0.04, 0.3]];
  const inset = [[0, 0.3], [0, 0.46], [0.13, 0.46], [0.13, 0.71], [0.265, 0.71], [0.29, 0.685], [0.29, 0.3], [0.245, 0.19], [0.155, 0.19], [0.1, 0.25], [0.04, 0.3]];
  const table = (s) => {
    const m = (pr) => pr.map(([z, y]) => [s * z, y]);
    const t = [prismX(m(inset), -0.355, 0.015, red)];
    for (const [x0, x1] of [[-0.37, -0.35], [-0.2, -0.18], [0.01, 0.03]]) t.push(prismX(m(tableProf), x0, x1, red, { bevel: 0.003 }));
    for (const [x0, x1] of [[-0.37, -0.31], [-0.21, -0.13], [-0.05, 0.03]]) {
      t.push(ring(0.042, 0.023, x1 - x0, red, { axis: 'x', pos: [(x0 + x1) / 2, 0.13, s * 0.2] }));
      t.push(at(box(x1 - x0, 0.06, 0.07, red), [(x0 + x1) / 2, 0.16, s * 0.2]));
    }
    // Oreilles du vérin de table, bossages des vérins de mâchoires
    for (const dx of [0.035, -0.035]) {
      t.push(at(box(0.015, 0.06, 0.05, red), [-0.16 + dx, 0.26, s * 0.31]));
      t.push(ring(0.028, 0.012, 0.015, red, { axis: 'x', pos: [-0.16 + dx, 0.26, s * 0.33] }));
    }
    for (const x of [-0.3, -0.07]) t.push(cyl(0.022, 0.035, red, { pos: [x, 0.7375, s * 0.28] }));
    return fuse(S, t);
  };
  P('26', tilt(1, table(1)), onTable(1, [0, 0, 0]));
  P('12', tilt(-1, table(-1)), onTable(-1, [0, 0, 0]));

  // Mâchoires (slip plates 1/2, gris) et centreurs (3/4, gris clair) : blocs à
  // demi-alésage logés dans les tables, bossage d'attache du vérin sur le dessus.
  const insert = (s, x0, x1, rs, material) => {
    const seat = arc(0, rodY, rs, Math.PI / 2, -Math.PI / 2, 14);
    const prof = [[0, 0.46], [0.128, 0.46], [0.128, 0.72], [0, 0.72], ...seat].map(([z, y]) => [s * z, y]);
    return tilt(s, fuse(S,
      prismX(prof, x0, x1, material, { bevel: 0.003 }),
      cyl(0.02, 0.035, material, { pos: [(x0 + x1) / 2, 0.7375, s * 0.1] }),
    ));
  };
  P('1', insert(1, -0.35, -0.25, 0.052, 'grey'), onTable(1, [0, 0.3, 0.02]));
  P('2', insert(-1, -0.35, -0.25, 0.075, 'grey'), onTable(-1, [0, 0.3, -0.02]));
  P('3', insert(1, -0.11, -0.03, 0.05, 'lightGrey'), onTable(1, [0, 0.3, 0.02]));
  P('4', insert(-1, -0.11, -0.03, 0.072, 'lightGrey'), onTable(-1, [0, 0.3, -0.02]));

  // Vérins de mâchoires (6) et de centreurs (8) couchés sur les tables,
  // axes 5 / 10 (courts) et 7 (longs), bagues 9 et 11.
  for (const s of [1, -1]) {
    for (const [ref, xc] of [['6', -0.3], ['8', -0.07]]) {
      const c = along(ram(S, 0.18, 0.04, { material: 'black', pin: 'y', ext: 0.35, ports: false }), s > 0 ? '-z' : 'z');
      c.position.set(xc, 0.765, s * 0.28);
      P(ref, tilt(s, c), onTable(s, [0, 0.5, s * 0.05]));
      const pinLen = ref === '8' ? 0.075 : 0.06;
      const pin = (z) => tilt(s, cyl(0.008, pinLen, 'steel', { pos: [xc, 0.75 + pinLen / 2 - 0.02, z] }));
      P(ref === '8' ? '7' : (s > 0 ? '5' : '10'), pin(s * 0.28), onTable(s, [0, 0.72, s * 0.05]));
      P(ref === '8' ? '7' : (s > 0 ? '10' : '5'), pin(s * 0.1), onTable(s, [0, 0.72, s * 0.05]));
      P(ref === '8' ? '11' : '9', tilt(s, ring(0.014, 0.0085, 0.01, 'brass', { pos: [xc, 0.784, s * 0.1] })), onTable(s, [0, 0.64, s * 0.05]));
    }
  }

  // Vérins de tables (20) entre la patte du bloc de pied et l'oreille de la
  // table ouverte ; axes 14 (haut) / 17 et 27 (bas), bagues 15 16 (haut),
  // 18 19 28 (bas).
  for (const s of [1, -1]) {
    const A = new THREE.Vector3(-0.16, -0.1, s * 0.33);
    const B = new THREE.Vector3(-0.16, 0.26, s * 0.33).sub(hinge(s)).applyAxisAngle(new THREE.Vector3(1, 0, 0), s * OPEN).add(hinge(s));
    const d = B.clone().sub(A);
    const c = along(ram(S, d.length(), 0.07, { material: 'black', pin: 'y', ext: 0.12 }), 'y');
    c.rotation.x = Math.atan2(d.z, d.y);
    c.position.copy(A);
    P('20', c, [0, -0.1, s * 0.6]);
    const pinX = (y) => group(cyl(0.012, 0.12, 'steel', { axis: 'x' }), at(cyl(0.02, 0.008, 'steel', { axis: 'x' }), [-0.064, 0, 0])).translateX(-0.16).translateY(y).translateZ(s * 0.33);
    P('14', tilt(s, pinX(0.26)), [-0.45, -0.1, s * 0.6]);
    P('15', tilt(s, cyl(0.019, 0.022, 'brass', { axis: 'x', pos: [-0.137, 0.26, s * 0.33] })), [-0.3, -0.1, s * 0.6]);
    P('16', tilt(s, cyl(0.019, 0.016, 'brass', { axis: 'x', pos: [-0.183, 0.26, s * 0.33] })), [0.22, -0.1, s * 0.6]);
    P(s > 0 ? '17' : '27', pinX(-0.1), [-0.45, -0.1, s * 0.6]);
    P(s > 0 ? '18' : '28', cyl(0.019, 0.02, 'brass', { axis: 'x', pos: [-0.138, -0.1, s * 0.33] }), [-0.3, -0.1, s * 0.6]);
    P('19', cyl(0.019, 0.02, 'brass', { axis: 'x', pos: [-0.182, -0.1, s * 0.33] }), [0.22, -0.1, s * 0.6]);
  }
  // 21 — Axes de charnière des tables (tête + écrou) ; 13 / 22 — bagues à collerette
  for (const s of [1, -1]) {
    P('21', fuse(S,
      lathe([[-0.415, 0], [-0.415, 0.032], [-0.4, 0.035], [-0.4, 0.022], [0.155, 0.022], [0.16, 0]], 'steel', 24),
      at(hexX(0.05, 0.026, 'steel', 0.022), [0.143, 0, 0]),
    ).translateY(0.13).translateZ(s * 0.2), [-0.55, 0, 0]);
    for (const x of [-0.37, -0.21, -0.05]) {
      P(s > 0 ? '13' : '22', at(lathe([[0, 0.0225], [0, 0.031], [0.006, 0.031], [0.006, 0.0285], [0.058, 0.0285], [0.058, 0.0225], [0, 0.0225]], 'brass', 20), [x - 0.006, 0.13, s * 0.2]), [-0.05, 0.35, s * 0.95]);
    }
  }

  // 23 — Support de jonction des boyaux (flanc +Z)
  P('23', fuse(S,
    prismZ([[1.42, -0.09], [1.58, -0.09], [1.58, 0.05], [1.42, 0.05]], 0.18, 0.192, red, { holes: [[1.44, -0.07, 0.007], [1.56, -0.07, 0.007], [1.44, 0.03, 0.007], [1.56, 0.03, 0.007]] }),
    prismX([[0.192, -0.02], [0.29, -0.02], [0.29, 0.06], [0.192, 0.06]], 1.494, 1.506, red, { holes: [[0.225, 0.02, 0.008], [0.255, 0.02, 0.008]] }),
    ring(0.026, 0.014, 0.05, red, { axis: 'x', pos: [1.5, 0.02, 0.305] }),
    prismY([[1.43, 0.192], [1.494, 0.192], [1.494, 0.26]], -0.02, -0.01, red),
  ), [0, 0, 0.35]);

  // Câble d'arrêt d'urgence (côté -Z) : 30 support bas, 31 attache, 32 ressort,
  // 34 support haut, 33 garde, 35 câble + interrupteur jaune.
  const zc = -0.35;
  const bracket = (x, h, w) => [
    at(box(w, 0.07, 0.012, red), [x, 0.035, -0.186]),
    at(box(w, 0.012, 0.17, red), [x, 0.068, -0.277]),
    prismX([[zc - 0.024, 0.074], [zc + 0.024, 0.074], [zc + 0.012, h], [zc - 0.012, h]], x - 0.006, x + 0.006, red, { holes: h < 0.2 ? [[zc, h - 0.012, 0.005]] : [] }),
    prismZ([[x + 0.006, 0.074], [x + 0.05, 0.074], [x + 0.006, 0.15]], zc - 0.005, zc + 0.005, red),
  ];
  P('30', fuse(S, bracket(0.5, 0.195, 0.06)), [0, 0.2, -0.35]);
  P('31', fuse(S, at(cyl(0.004, 0.032, 'steel', { axis: 'x' }), [0.52, 0.183, zc]), S.torus(0.008, 0.002, 'steel', { axis: 'z', pos: [0.543, 0.183, zc] })), [0.05, 0.3, -0.45]);
  P('32', tube(Array.from({ length: 121 }, (_, i) => { const a = (i / 120) * 10 * Math.PI * 2; return [0.55 + (i / 120) * 0.1, 0.183 + Math.cos(a) * 0.011, zc + Math.sin(a) * 0.011]; }), 0.0018, 'steel', { seg: 150 }), [0.1, 0.36, -0.5]);
  P('34', fuse(S, bracket(2.62, 0.2, 0.07), at(box(0.17, 0.01, 0.07, red), [2.585, 0.205, zc])), [0, 0.2, -0.35]);
  P('33', fuse(S,
    at(box(0.04, 0.005, 0.064, red), [2.52, 0.2525, zc]),
    ...[1, -1].map((k) => at(box(0.04, 0.045, 0.005, red), [2.52, 0.2325, zc + k * 0.0295])),
    ...[1, -1].map((k) => at(box(0.04, 0.005, 0.018, red), [2.52, 0.2125, zc + k * 0.041])),
  ), [-0.1, 0.45, -0.45]);
  P('35', fuse(S,
    tube([[0.65, 0.183, zc], [1.6, 0.2, zc], [2.555, 0.222, zc]], 0.0025, 'black', { seg: 8 }),
    at(box(0.1, 0.018, 0.065, 'black', { r: 0.004 }), [2.62, 0.219, zc]),
    at(box(0.1, 0.046, 0.065, 'safety', { r: 0.007 }), [2.62, 0.251, zc]),
    at(cyl(0.008, 0.012, 'black'), [2.62, 0.279, zc]),
    at(cyl(0.017, 0.012, 'red'), [2.62, 0.289, zc]),
    at(cyl(0.009, 0.016, 'black', { axis: 'x' }), [2.562, 0.222, zc]),
  ), [0, 0.4, -0.6]);

  // 38 — Vérin du stinger : fût le long du flanc -Z, téton haut dans la chape
  // du couvercle 25, tige vers le pied ; 41 brides, 37 étriers en U, 36 vis,
  // 39 rondelles, 40 écrous.
  const sy = 0, sz = -0.27;
  const st = fuse(S,
    lathe([
      [0.47, 0], [0.47, 0.04], [0.48, 0.05], [0.53, 0.05], [0.53, 0.045], [2.36, 0.045], [2.36, 0.052], [2.38, 0.052], [2.38, 0.045],
      [2.53, 0.045], [2.53, 0.052], [2.55, 0.052], [2.55, 0.045], [2.77, 0.045], [2.78, 0.05], [2.8, 0.05], [2.81, 0.04], [2.81, 0],
    ], red, 28),
    lathe([[0.1, 0], [0.1, 0.022, 1], [0.106, 0.028, 1], [0.12, 0.028], [0.48, 0.028], [0.48, 0]], 'chrome', 24),
    lathe([[2.8, 0], [2.8, 0.02], [2.945, 0.02], [2.95, 0.016], [2.95, 0]], 'darkSteel', 20),
    ...[0.72, 2.72].flatMap((x) => [at(cyl(0.011, 0.022, red), [x, 0.052, 0]), at(S.nut(0.02, 0.01, 'steel'), [x, 0.066, 0])]),
  );
  st.position.set(0, sy, sz);
  st.userData.hasInterior = true;
  P('38', st, [0, 0, -0.45]);
  for (const x of [1.05, 2.45]) {
    P('41', prismX([[-0.27, -0.083], [-0.27, -0.046], ...arc(-0.27, 0, 0.046, -Math.PI / 2, -Math.PI * 1.5, 12), [-0.27, 0.078], [-0.34, 0.078], [-0.34, -0.083]], x - 0.025, x + 0.025, red, { bevel: 0.002 }), [0, 0, -0.9]);
    const yy = [0.062, -0.062];
    P('36', bolts(S, yy.map((y) => [x, y, -0.34]), 0.014, 0.15, 'steel', { axis: '-z' }), [0, 0, -1.1]);
    P('39', washers(S, yy.map((y) => [x, y, -0.1985]), 0.014, 0.0075, 0.003, 'steel', 'z'), [0, 0.22, -1.05]);
    P('40', nuts(S, yy.map((y) => [x, y, -0.191]), 0.021, 0.012, 'steel', 'z'), [0, 0.22, -1.15]);
    // Étrier en U autour du fût, branches vers le flanc
    const ux = x + 0.055, ur = 0.051;
    const u = [[ur, -0.205], [ur, sz]];
    for (let i = 1; i < 12; i++) { const a = (i / 12) * Math.PI; u.push([Math.cos(a) * ur, sz - Math.sin(a) * ur]); }
    u.push([-ur, sz], [-ur, -0.205]);
    P('37', tube(u.map(([y, z]) => [ux, sy + y, z]), 0.006, 'steel', { seg: 40, tension: 0.1 }), [0, 0, -0.7]);
  }
  return { view: { dir: [0.35, 0.75, -1.0] } };
}

function group(...children) {
  const g = new THREE.Group();
  children.flat().forEach((c) => c && g.add(c));
  return g;
}

// ----------------------------------------------------- F14 mât et tables

export function F14(api) {
  const S = api.S;
  const { box, cyl, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { rodY, carriageX: cx, extFeedX } = MAST;
  P('4', api.sub('F15'), [0, 0, 0]);
  P('F16', at(api.sub('F16'), [cx, 0.14, 0]), [0, 0.75, 0]);
  P('1', at(api.sub('F18'), [cx, rodY, 0]), [0, 1.35, 0]);

  // 2 — Support du joint tournant : semelle sur la languette du chariot,
  // plaque à encoche en U qui retient le carré du joint, gousset.
  P('2', fuse(S,
    at(box(0.1, 0.012, 0.1, 'red'), [cx + 0.48, 0.196, 0]),
    prismX([[-0.035, 0.19], [0.035, 0.19], [0.035, 0.47], [0.056, 0.51], [0.056, 0.655], [0.039, 0.655], [0.039, 0.55], [-0.039, 0.55], [-0.039, 0.655], [-0.056, 0.655], [-0.056, 0.51], [-0.035, 0.47]], cx + 0.495, cx + 0.51, 'red', { bevel: 0.002 }),
    prismZ([[cx + 0.435, 0.202], [cx + 0.495, 0.202], [cx + 0.495, 0.3]], -0.006, 0.006, 'red'),
    bolts(S, [[cx + 0.455, 0.202, 0.03], [cx + 0.455, 0.202, -0.03]], 0.012, 0.03),
  ), [0.3, 1.5, 0]);

  // 3 — Vérin d'avance à double tige : fût solidaire du chariot (tourillons
  // dans les flottants), tiges fixées au bloc de pied et à la cloison haute.
  const xb0 = cx - 0.55, xb1 = cx + 0.55, ro = 0.06, ri = 0.05, rr = 0.03;
  const feed = fuse(S,
    lathe([
      [xb0, rr * 1.1], [xb0, ro * 0.92], [xb0 + 0.012, ro * 1.08], [xb0 + 0.06, ro * 1.08], [xb0 + 0.06, ro],
      [cx - 0.035, ro], [cx - 0.035, 0.074], [cx + 0.035, 0.074], [cx + 0.035, ro],
      [xb1 - 0.06, ro], [xb1 - 0.06, ro * 1.08], [xb1 - 0.012, ro * 1.08], [xb1, ro * 0.92], [xb1, rr * 1.1],
      [xb1 - 0.06, rr * 1.1], [xb1 - 0.06, ri], [xb0 + 0.06, ri], [xb0 + 0.06, rr * 1.1], [xb0, rr * 1.1],
    ], 'red', 32),
    at(cyl(ri * 0.97, 0.06, 'darkSteel', { axis: 'x' }), [cx, 0, 0]),
    at(cyl(rr, cx - 0.27, 'chrome', { axis: 'x' }), [(0.27 + cx) / 2, 0, 0]),
    at(cyl(rr, 2.87 - cx, 'chrome', { axis: 'x' }), [(cx + 2.87) / 2, 0, 0]),
    at(cyl(0.018, 0.25, 'darkSteel', { axis: 'z' }), [cx, 0, 0]),
    at(hexX(0.07, 0.028, 'steel'), [0.285, 0, 0]),
    at(hexX(0.07, 0.028, 'steel'), [2.845, 0, 0]),
    at(cyl(0.011, 0.025, 'steel'), [xb0 + 0.09, ro + 0.01, 0]), at(S.nut(0.022, 0.012, 'steel'), [xb0 + 0.09, ro + 0.026, 0]),
    at(cyl(0.011, 0.025, 'steel'), [xb1 - 0.09, ro + 0.01, 0]), at(S.nut(0.022, 0.012, 'steel'), [xb1 - 0.09, ro + 0.026, 0]),
  );
  feed.userData.hasInterior = true;
  P('3', feed, [0, 0.4, 0]);

  P('5', at(api.sub('F17'), [extFeedX, -0.15, 0]), [0, -0.55, 0]);

  // 6 — Vérin d'avance d'extension (côté +Z, sous la table inférieure) : œil
  // sous la patte de la plaque F17, chape sur la patte du bloc de pied.
  const ext = along(ram(S, extFeedX - 0.02, 0.08, { material: 'red', pin: 'y', ext: 0.35, back: 'eye', front: 'clevis', neck: 0.1 }), '-x');
  const e6 = fuse(S,
    at(ext, [extFeedX, -0.185, 0.36]),
    S.bolt(0.016, 0.075, 'steel', { pos: [extFeedX, -0.135, 0.36] }),
    at(cyl(0.012, 0.085, 'steel'), [0.02, -0.185, 0.36]),
  );
  e6.userData.hasInterior = true;
  P('6', e6, [-0.25, -0.5, 0.45]);
  return { view: { dir: [0.45, 0.7, 1.0] } };
}

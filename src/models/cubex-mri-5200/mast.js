import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mat } from '../../viewer/materials.js';

// Mât et tables (F14), mât (F15), table supérieure / chariot (F16),
// table inférieure / avance d'extension (F17), tête de rotation (F18).
// Repère du mât : axe du mât selon +X (pied à x = 0, sommet à x = 2.9),
// face de la tête de rotation vers +Y. L'axe des tiges de forage est à y = ROD_Y.
// Côté -Z : vérin du stinger et câble d'arrêt d'urgence (côté opérateur).

// Chariot (tête de rotation) vers mi-hauteur du mât, comme sur F01, F03 et F04.
export const MAST = { length: 2.9, rodY: 0.59, carriageX: 1.45, extFeedX: 0.6 };
// Patte du vérin d'extension sur la plaque F17 : décalée vers le sommet du mât (dessins F14 / F17)
const EXT_TAB_X = 0.17;

// ------------------------------------------------------------------ outils

function mk(geo, material) {
  return new THREE.Mesh(geo, mat(material));
}

/** Fusionne des maillages (repère monde) en un seul, position + normale. */
function mergeMeshes(meshes, material) {
  const geos = meshes.map((c) => {
    let g = c.geometry.clone().applyMatrix4(c.matrixWorld);
    if (g.index) g = g.toNonIndexed();
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    return g;
  });
  return new THREE.Mesh(geos.length === 1 ? geos[0] : mergeGeometries(geos, false), material);
}

/**
 * Fusionne les maillages d'un ou plusieurs objets : un maillage par matériau
 * (et par seuil de contour : cordons, ressorts gardent le leur).
 */
function fuse(S, ...objs) {
  const list = objs.flat().filter(Boolean);
  const byKey = new Map();
  let inner = false;
  for (const o of list) {
    o.updateMatrixWorld(true);
    o.traverse((c) => {
      if (c.userData.hasInterior) inner = true;
      if (!c.isMesh) return;
      const ea = c.geometry.userData.edgeAngle;
      const k = c.material.uuid + (ea ? `|${ea}` : '');
      if (!byKey.has(k)) byKey.set(k, { m: c.material, ea, meshes: [] });
      byKey.get(k).meshes.push(c);
    });
  }
  const g = new THREE.Group();
  for (const { m, ea, meshes } of byKey.values()) {
    const merged = mergeMeshes(meshes, m);
    if (ea) merged.geometry.userData.edgeAngle = ea;
    g.add(merged);
  }
  if (inner) g.userData.hasInterior = true;
  return g;
}

/**
 * Cordon de soudure le long d'une ligne brisée [[x, y, z], ...] : bourrelet
 * à écailles (rayon modulé), extrémités effilées. Densité modérée (budget).
 */
function beadGeo(points, size, closed = false) {
  const pts = points.map((p) => new THREE.Vector3(...p));
  const path = new THREE.CurvePath();
  const n = pts.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) path.add(new THREE.LineCurve3(pts[i], pts[(i + 1) % n]));
  const r = size / 2, radial = 5;
  const seg = Math.max(3, Math.min(180, Math.round(path.getLength() / (r * 2.4))));
  const geo = new THREE.TubeGeometry(path, seg, r, radial, closed);
  const p = geo.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) {
    path.getPointAt(Math.min(i / seg, 1), c);
    let k = i % 2 ? 1.06 : 0.9;
    if (!closed) k *= Math.min(1, 0.3 + Math.min(i, seg - i) * 0.45);
    for (let j = 0; j <= radial; j++) {
      const id = i * (radial + 1) + j;
      v.fromBufferAttribute(p, id).sub(c).multiplyScalar(k).add(c);
      p.setXYZ(id, v.x, v.y, v.z);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Cordons de soudure d'angle le long de lignes brisées [[x, y, z], ...] (à
 * poser dans l'angle rentrant entre deux tôles), fusionnés en un maillage.
 */
function beads(S, lines, size = 0.008, material = 'red') {
  const geos = lines.filter((l) => l && l.length > 1).map((l) => {
    let g = beadGeo(l, size);
    if (g.index) g = g.toNonIndexed();
    g.deleteAttribute('uv');
    return g;
  });
  const out = mk(mergeGeometries(geos, false), material);
  out.geometry.userData.edgeAngle = 75;
  return out;
}

/** Cordon circulaire de rayon R autour de l'axe X (fond de vérin, bossage), centré en x. */
function beadRingX(x, R, size, material = 'red', n = 28) {
  const pts = Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return new THREE.Vector3(x, Math.cos(a) * R, Math.sin(a) * R); });
  const path = new THREE.CatmullRomCurve3(pts, true);
  const geo = new THREE.TubeGeometry(path, n, size / 2, 5, true);
  geo.userData.edgeAngle = 75;
  return mk(geo, material);
}

/** Cordon circulaire de rayon R dans un plan horizontal (axe Y), centré en pos. */
function beadRingY(pos, R, size, material = 'red', n = 28) {
  const m = beadRingX(0, R, size, material, n);
  m.rotation.z = Math.PI / 2;
  m.position.set(...pos);
  return m;
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
 * (ronds) ou listes de points. Arrondi d'arête (bevel) pris dans
 * l'encombrement ; sans bevel, arêtes cassées d'environ 1 mm (tôle ébavurée).
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
  const b = bevel > 0 ? bevel : Math.min(depth * 0.12, 0.002);
  const seg = bevel > 0 ? 2 : 1;
  const d = Math.max(depth - 2 * b, 0.0005);
  const geo = b >= 0.0004
    ? new THREE.ExtrudeGeometry(shape, {
      depth: d, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelOffset: -b, bevelSegments: seg, curveSegments: curve,
    })
    : new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: curve });
  geo.translate(0, 0, -(b >= 0.0004 ? d : depth) / 2);
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

/**
 * Paroi d'un trou lamé d'axe Z (centre x, y) dans une tôle de faces z0 < z1 :
 * lamage de rayon rc et de profondeur dep côté face lamée (zc = z0 ou z1),
 * trou de rayon r. La tôle est percée au rayon rc ; cette paroi la complète.
 */
function cbore(x, y, z0, z1, zc, r, rc, dep, material, seg = 20) {
  const R = rc * 0.985;
  const prof = zc === z1
    ? [[z1, R], [z1 - dep, R], [z1 - dep, r], [z0, r], [z0, R]]
    : [[z1, R], [z1, r], [z0 + dep, r], [z0 + dep, R], [z0, R]];
  const g = new THREE.Group();
  g.add(lathe(prof, material, seg));
  g.rotation.y = -Math.PI / 2;
  g.position.set(x, y, 0);
  return g;
}

/** Écrou à créneaux d'axe X (surplat af, hauteur h, couronne vers +X) avec goupille fendue. */
function castleNut(S, x, af, h, material = 'steel') {
  const hh = h * 0.62, cr = af * 0.43;
  const crown = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + Math.PI / 6;
    const t = S.box(h - hh, af * 0.16, af * 0.2, material);
    t.position.set(x + hh / 2, Math.cos(a) * cr * 0.92, Math.sin(a) * cr * 0.92);
    t.rotation.x = a;
    crown.push(t);
  }
  return [
    at0(hexX(af, hh, material), [x - (h - hh) / 2, 0, 0]),
    at0(S.ring(cr * 1.08, af * 0.3, h - hh, material, { axis: 'x', seg: 24 }), [x + hh / 2, 0, 0]),
    ...crown,
    // Goupille fendue dans un créneau (tête en boucle, branches rabattues)
    at0(S.cyl(af * 0.035, af * 1.05, 'zinc', { seg: 8 }), [x + hh / 2, 0, 0]),
    S.torus(af * 0.06, af * 0.03, 'zinc', { axis: 'z', pos: [x + hh / 2, af * 0.58, 0] }),
  ];
}

function at0(obj, pos) {
  obj.position.set(...pos);
  return obj;
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

/** Graisseur (six-pans, col, tête bombée) sortant de pos selon l'axe donné ('y', 'z', '-z'). */
function nipple(S, pos, axis = 'y') {
  const d = { y: [0, 1, 0], z: [0, 0, 1], '-z': [0, 0, -1] }[axis];
  const o = (t) => pos.map((v, i) => v + d[i] * t);
  const ax = axis;
  return [
    S.cyl(0.0062, 0.005, 'brass', { axis: ax, seg: 6, pos: o(0.0025) }),
    S.cyl(0.0026, 0.005, 'brass', { axis: ax, seg: 12, pos: o(0.0075) }),
    S.cyl(0.0034, 0.004, 'brass', { axis: ax, seg: 12, r2: 0.0022, pos: o(0.0115) }),
  ];
}

/** Ressort hélicoïdal d'axe X de x0 à x1 (centre y, z), rayon R, fil w, n spires. */
function coil(x0, x1, y, z, R, w, n, material) {
  const k = Math.round(n * 12);
  const pts = Array.from({ length: k + 1 }, (_, i) => {
    const t = i / k, a = t * n * Math.PI * 2;
    return new THREE.Vector3(x0 + (x1 - x0) * t, y + Math.cos(a) * R, z + Math.sin(a) * R);
  });
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), k, w, 6, false);
  geo.userData.edgeAngle = 60;
  return mk(geo, material);
}

/**
 * Stries circonférentielles (dents de mâchoire) tapissant un demi-alésage
 * d'axe X centré en (y = yc, z = 0), ouvert côté s·Z : dents en dents de scie
 * de rs (crête) à rs + depth (fond), pas pitch, de x0 à x1.
 */
function wickers(x0, x1, yc, rs, s, material, { depth = 0.003, pitch = 0.007, n = 18 } = {}) {
  const nt = Math.max(2, Math.round((x1 - x0) / pitch));
  const p = (x1 - x0) / nt;
  const st = [];
  for (let i = 0; i < nt; i++) st.push([x0 + i * p, rs + depth], [x0 + (i + 0.35) * p, rs]);
  st.push([x1, rs + depth]);
  const pos = [], nor = [], idx = [];
  const w = n + 1;
  for (let b = 0; b < st.length - 1; b++) {
    const [xa, ra] = st[b], [xb, rb] = st[b + 1];
    const l = Math.hypot(xb - xa, rb - ra);
    const nx = (rb - ra) / l, nr = -(xb - xa) / l; // normale vers l'axe
    const base = pos.length / 3;
    for (const [x, r] of [[xa, ra], [xb, rb]]) {
      for (let j = 0; j <= n; j++) {
        const a = -Math.PI / 2 + (Math.PI * j) / n;
        const cy = Math.sin(a), cz = s * Math.cos(a);
        pos.push(x, yc + cy * r, cz * r);
        nor.push(nx, nr * cy, nr * cz);
      }
    }
    for (let j = 0; j < n; j++) {
      const a0 = base + j, a1 = a0 + 1, b0 = a0 + w, b1 = b0 + 1;
      idx.push(a0, b0, a1, a1, b0, b1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  // Sens des triangles accordé aux normales (faces avant vers l'axe)
  const v = (i) => new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
  const t = new THREE.Vector3().crossVectors(v(idx[1]).sub(v(idx[0])), v(idx[2]).sub(v(idx[0])));
  if (t.dot(new THREE.Vector3(nor[0], nor[1], nor[2])) < 0) for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
  geo.setIndex(idx);
  geo.userData.edgeAngle = 89;
  return mk(geo, material);
}

const bolts = (S, pts, d, len, material = 'steel', o = {}) => (S.boltSet
  ? S.boltSet(pts, d, len, material, { washer: false, ...o })
  : S.merged(pts.map((p) => S.bolt(d, len, material, { ...o, pos: p })), material));
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
  // Cordons de soudure des fonds sur le fût
  for (const x of [xb0 + cap, xb1 - cap]) parts.push(beadRingX(x, ro, Math.max(r * 0.14, 0.003), material, 24));
  if (ports) {
    // Bossages des orifices et raccords (six-pans, cône 37°, filetage)
    for (const x of [xb0 + cap + r * 0.9, xb1 - cap - r * 0.9]) {
      parts.push(at(cyl(r * 0.42, r * 0.5, material, { axis: 'y' }), [x, ro + r * 0.15, 0]));
      const fl = r * 0.9;
      parts.push(at(S.fitting(r * 0.5, fl, 'steel'), [x, ro + r * 0.4 + fl * 0.14, 0]));
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

  // 3 — Carter (fonte) : roue centrale, lobes des pignons en bas, nervure
  // supérieure, nervures d'épaule à faces planes usinées et petits congés ;
  // couvercle avant étagé, semelle boulonnée.
  const lobes = sdBox(0, -0.118, 0.198, 0.091, 0.02);
  const prof = starOutline(sUnion(0.005,
    sdCircle(0, 0, 0.19),
    lobes,
    sdBox(0, 0.17, 0.074, 0.056, 0.01),
    sdRadial(0.17, 1.08, 0.048, 0.046, 0.008),
    sdRadial(0.17, -1.08, 0.048, 0.046, 0.008),
  ), 240, 0.4);
  const holes = [];
  for (const s of [1, -1]) for (const x of [-0.16, -0.08, 0, 0.08, 0.16]) holes.push([x, s * 0.228, 0.011]);
  P('3', fuse(S,
    prismX(prof, -0.088, 0.212, 'red', { bevel: 0.006 }),
    // Tambour avant (roue dentée) et lobes inférieurs jusqu'à la face avant
    lathe([[-0.118, 0], [-0.118, 0.186], [-0.112, 0.194, 1], [-0.1, 0.196], [-0.08, 0.196], [-0.08, 0]], 'red', 56),
    prismX(starOutline(lobes, 128, 0.4), -0.112, -0.08, 'red', { bevel: 0.005 }),
    lathe([
      [-0.196, 0.07], [-0.196, 0.116], [-0.19, 0.123], [-0.172, 0.123], [-0.172, 0.148], [-0.166, 0.155],
      [-0.152, 0.155], [-0.152, 0.176], [-0.144, 0.184], [-0.112, 0.184], [-0.112, 0.07], [-0.196, 0.07],
    ], 'red', 40),
    at(cyl(0.07, 0.004, 'charcoal', { axis: 'x' }), [-0.121, 0, 0]),
    at(plate(0.42, 0.5, 0.03, 'red', { holes }), [0, -0.22, 0]),
    // Face arrière plane : alésages des pilotes des moteurs, portée du joint tournant
    ...[1, -1].map((s) => at(cyl(0.019, 0.004, 'charcoal', { axis: 'x', seg: 20 }), [0.2135, -0.03, s * 0.165])),
    lathe([[0.212, 0.055], [0.212, 0.122], [0.222, 0.122], [0.227, 0.117], [0.227, 0.055], [0.212, 0.055]], 'red', 48),
    // Trous de manutention des lobes
    ...[1, -1].map((s) => at(cyl(0.019, 0.004, 'charcoal', { axis: 'x' }), [-0.12, -0.15, s * 0.152])),
    ...[1, -1].map((s) => at(cyl(0.017, 0.004, 'charcoal', { axis: 'x' }), [0.214, -0.172, s * 0.152])),
    // Congé de fonderie entre le carter et la semelle
    beads(S, [[[-0.112, -0.205, -0.198], [0.212, -0.205, -0.198], [0.212, -0.205, 0.198], [-0.112, -0.205, 0.198], [-0.112, -0.205, -0.198]]], 0.012),
    // Plaque signalétique générique (côté opérateur)
    S.nameplate ? at(S.nameplate(0.09, 0.055), [0.07, -0.12, -0.1985], [0, Math.PI, 0]) : null,
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
  // Flexibles (photo F01) : coudes 37° sur les orifices A / B, par-dessus le
  // moteur, derrière lui puis à travers les deux trous du support de boyaux du
  // chariot (F16 7) ; ceux du moteur -Z passent sous le joint tournant.
  // Points [x, y, z] du repère F18 ; départ au bout du coude, vers +X.
  const tail = (z) => [[0.426, -0.215, z], [0.452, -0.224, z], [0.48, -0.226, z], [0.54, -0.226, z]];
  const routes = {
    1: [
      [[0.287, 0.1156, 0.19], [0.335, 0.114, 0.19], [0.38, 0.095, 0.195], [0.402, 0.04, 0.2], [0.4, -0.1, 0.205], [0.403, -0.16, 0.21], ...tail(0.2125)],
      [[0.287, 0.1156, 0.14], [0.335, 0.116, 0.15], [0.38, 0.097, 0.165], [0.403, 0.04, 0.178], [0.4, -0.1, 0.185], [0.403, -0.16, 0.1875], ...tail(0.1875)],
    ],
    '-1': [
      [[0.287, 0.1156, -0.14], [0.335, 0.114, -0.14], [0.38, 0.095, -0.14], [0.4, 0.04, -0.14], [0.4, -0.09, -0.13], [0.397, -0.122, -0.09], [0.395, -0.14, 0], [0.397, -0.155, 0.08], [0.41, -0.19, 0.1125], ...tail(0.1125)],
      [[0.287, 0.1156, -0.19], [0.335, 0.114, -0.19], [0.38, 0.095, -0.192], [0.402, 0.04, -0.195], [0.402, -0.1, -0.19], [0.398, -0.165, -0.13], [0.395, -0.185, -0.02], [0.397, -0.19, 0.08], [0.41, -0.205, 0.1375], ...tail(0.1375)],
    ],
  };
  const flange = starOutline(sUnion(0.03, sdCircle(0, 0, 0.07), sdBox(0, 0, 0.032, 0.108, 0.03)), 72, 0.2);
  for (const s of [1, -1]) {
    const m = fuse(S,
      lathe([
        [0.17, 0], [0.17, 0.015], [0.2, 0.015], [0.2, 0.034], [0.244, 0.034], [0.244, 0.062], [0.256, 0.07],
        [0.3, 0.07], [0.3, 0.073], [0.31, 0.073], [0.31, 0.07], [0.372, 0.07], [0.384, 0.067, 1], [0.392, 0.06, 1], [0.396, 0.05], [0.396, 0.042], [0.398, 0.04], [0.398, 0],
      ], 'black', 32),
      prismX(flange, 0.224, 0.244, 'black', { bevel: 0.004 }),
      // Vis de bride (tête hexagonale + rondelle)
      bolts(S, [1, -1].map((k) => [0.244, k * 0.088, 0]), 0.014, 0.05, 'darkSteel', { axis: 'x', washer: true }),
      at(box(0.058, 0.04, 0.1, 'black', { r: 0.008 }), [0.282, 0.078, 0]),
      ...[1, -1].map((k) => at(cyl(0.017, 0.016, 'black'), [0.282, 0.104, k * 0.025])),
      // Coudes orientables (six-pans, cône 37°) sortant vers l'arrière
      ...[1, -1].map((k) => at(S.fitting(0.022, 0.04, 'steel', { elbow: true }), [0.282, 0.1176, k * 0.025], [0, Math.PI / 2, 0])),
    );
    // Bride directement sur la face arrière du carter (x = 0.212)
    m.position.set(-0.012, -0.03, s * 0.165);
    const hoses = fuse(S, routes[s].map((pts) => S.hose(pts, 0.011)));
    P('4', group(m, hoses), [0.42, 0, s * 0.2]);
  }

  // 6 — Joint tournant (eau) : nez fileté, corps, bride boulonnée, carré d'entraînement
  P('6', fuse(S,
    lathe([
      [0.2, 0], [0.2, 0.05], ...threads(0.2, 0.236, 0.05, 0.055, 4), [0.236, 0.07], [0.242, 0.076], [0.394, 0.076],
      [0.4, 0.07], [0.4, 0.09], [0.42, 0.09], [0.42, 0.06], [0.432, 0.06], [0.432, 0],
    ], 'red', 40),
    // 8 vis à tête hexagonale de la bride (peintes avec le corps)
    bolts(S, Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      return [0.42, Math.cos(a) * 0.076, Math.sin(a) * 0.076];
    }), 0.012, 0.03, 'red', { axis: 'x' }),
    at(box(0.125, 0.072, 0.072, 'red', { r: 0.006 }), [0.49, 0, 0]),
    at(cyl(0.017, 0.004, 'charcoal', { axis: 'z' }), [0.5, 0, -0.036]),
    at(cyl(0.01, 0.006, 'charcoal', { axis: 'x' }), [0.553, 0, 0]),
    at(box(0.07, 0.003, 0.05, 'redDark'), [0.3, 0.0755, 0]),
  ), [0.62, 0, 0]);
  // 7 — Raccord droit (entrée d'eau, face latérale du carré) ; 5 — coude (sur le carré)
  P('7', at(S.fitting(0.024, 0.055, 'red', { axis: 'z' }), [0.462, 0, 0.044]), [0.62, 0, 0.17]);
  P('5', at(S.fitting(0.018, 0.04, 'red', { elbow: true }), [0.535, 0.044, 0]), [0.66, 0.15, 0]);

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
  // Rambarde sur le chant de la plaque, à l'extérieur des godets
  const rail = (s, x0, x1) => tube([[x0, 0.05, s * 0.266], [x0 + 0.03, 0.088, s * 0.266], [x1 - 0.03, 0.088, s * 0.266], [x1, 0.05, s * 0.266]], 0.0065, 'red', { sharp: true, seg: 6 });
  P('1', fuse(S,
    prismY(outline, 0.016, 0.05, 'red', { holes: pHoles }),
    housing(1, -0.35, 0.56), housing(-1, -0.35, 0.35),
    rail(1, -0.33, 0.54), rail(-1, -0.33, 0.33),
    ...cups.map(([x, z]) => S.ring(0.056, 0.041, 0.045, 'red', { pos: [x, 0.0725, z] })),
    // Bossages des vis de réglage latérales
    ...[1, -1].flatMap((s) => [-0.2, 0, 0.2].map((x) => at(box(0.05, 0.05, 0.012, 'red'), [x, -0.02, s * 0.268]))),
    // Cordons : caissons sous la plaque, godets, bossages
    beads(S, [
      [[-0.35, 0.016, 0.241], [0.56, 0.016, 0.241]], [[-0.35, 0.016, -0.241], [0.35, 0.016, -0.241]],
      ...[1, -1].flatMap((s) => [-0.2, 0, 0.2].map((x) => [[x - 0.025, -0.045, s * 0.262], [x + 0.025, -0.045, s * 0.262], [x + 0.025, 0.005, s * 0.262], [x - 0.025, 0.005, s * 0.262], [x - 0.025, -0.045, s * 0.262]])),
    ], 0.007),
    ...cups.map(([x, z]) => beadRingY([x, 0.05, z], 0.056, 0.007)),
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
    // Cordons des âmes sur la semelle et sous le plateau
    beads(S, [1, -1].flatMap((s) => [0.074, 0.19].flatMap((y) => [-0.01, 0.01].map((e) => [[-0.22, y, s * 0.11 + e], [0.22, y, s * 0.11 + e]]))), 0.007),
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
      beads(S, [-0.0125, 0.0125].map((e) => [[-0.1, -0.014, s * 0.0925 + e], [0.1, -0.014, s * 0.0925 + e]]), 0.007),
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
    beads(S, [[[0.432, 0.062, 0.082], [0.432, 0.062, 0.248]], [[0.432, 0.062, 0.159], [0.5, 0.062, 0.159]], [[0.432, 0.062, 0.171], [0.5, 0.062, 0.171]]], 0.006),
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
  // Vue du dessin F16 : languette et support de boyaux à gauche
  return { view: { dir: [0.9, 0.9, -1.0] } };
}

// ------------------------------- F17 table inférieure (avance d'extension)

export function F17(api) {
  const S = api.S;
  const { box, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const bx = [-0.25, -0.15, -0.05, 0.05, 0.15, 0.25];

  // 1 — Plaque : patte d'ancrage du vérin d'extension (-Z, côté stinger comme
  // sur les dessins F14 / F15), couronnes de trous
  const tx = EXT_TAB_X;
  const outline = [[-0.35, -0.3], [0.35, -0.3], [0.35, 0.3], [tx + 0.1, 0.3], [tx + 0.06, 0.34], ...arc(tx, 0.36, 0.06, -0.32, Math.PI + 0.32, 12), [tx - 0.06, 0.34], [tx - 0.1, 0.3], [-0.35, 0.3]]
    .map(([x, z]) => [x, -z]);
  const holes = [[0, 0, 0.05], [tx, -0.36, 0.016]];
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
    // (trous taraudés sur la face extérieure)
    P('5', fuse(S,
      prismX([[0.218, 0.07], [0.218, 0.1], [0.294, 0.1], [0.3, 0.094], [0.3, 0.06], [0.235, 0.06], [0.235, 0.07]].map(([z, y]) => [s * z, y]), -0.3, 0.3, 'lightGrey', { bevel: 0.002 }),
      ...[-0.2, 0, 0.2].map((x) => S.cyl(0.0065, 0.002, 'charcoal', { axis: 'z', seg: 12, pos: [x, 0.079, s * 0.3005] })),
    ), [0, 0.45, 0]);
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
  // Trous lamés (lamage côté extérieur, comme sur le dessin F15)
  const cbX = [];
  for (let x = 0.5; x < 2.8; x += 0.22) { sideHoles.push([x, 0.024, 0.0235]); cbX.push(x); }
  for (const x of [0.75, 1.62, 2.25]) for (const dx of [0, 0.03]) for (const y of [-0.02, -0.05]) sideHoles.push([x + dx, y, 0.006]);
  for (const s of [1, -1]) {
    fr.push(prismZ([[0.32, -0.105], [L, -0.105], [L, 0.078], [0.32, 0.078]], s > 0 ? 0.16 : -0.18, s > 0 ? 0.18 : -0.16, red, { holes: sideHoles }));
    for (const x of cbX) fr.push(cbore(x, 0.024, s > 0 ? 0.16 : -0.18, s > 0 ? 0.18 : -0.16, s * 0.18, 0.016, 0.0235, 0.005, red));
    fr.push(at(box(L - 0.32, 0.012, 0.05, red, { r: 0.0025 }), [(L + 0.32) / 2, 0.084, s * 0.175]));
    fr.push(at(box(L - 0.32, 0.022, 0.095, 'grey', { r: 0.003 }), [(L + 0.32) / 2, -0.116, s * 0.1975]));
    // Goussets horizontaux du sommet
    for (const y of [-0.06, 0.035]) fr.push(prismY([[2.64, s * 0.16], [2.8, s * 0.16], [2.8, s * 0.1]], y, y + 0.012, red));
    // Blocs d'extrémité (butées des barres de guidage), plus hauts que les barres
    fr.push(prismZ([[2.8, 0.078], [L, 0.078], [L, 0.15], [L - 0.018, 0.168], [2.8, 0.168]], s > 0 ? 0.15 : -0.238, s > 0 ? 0.238 : -0.15, red, { bevel: 0.006 }));
  }
  // Traverses en U (ailes relevées, sous le vérin d'avance)
  for (const x of [0.75, 1.3, 1.85, 2.4]) {
    fr.push(prismZ([[x - 0.05, -0.105], [x + 0.05, -0.105], [x + 0.05, -0.072], [x + 0.04, -0.072], [x + 0.04, -0.093], [x - 0.04, -0.093], [x - 0.04, -0.072], [x - 0.05, -0.072]], -0.16, 0.16, red));
  }
  // Cloison haute : encoche en U pour la tige supérieure du vérin d'avance
  fr.push(prismX([[-0.16, -0.105], [0.16, -0.105], [0.16, 0.078], [0.036, 0.078], ...arc(0, 0, 0.036, 0, -Math.PI, 10), [-0.036, 0.078], [-0.16, 0.078]], 2.8, 2.83, red));
  // Bloc de pied
  fr.push(at(box(0.7, 0.025, 0.43, red), [-0.03, 0.0725, 0]));
  fr.push(at(box(0.7, 0.022, 0.43, red), [-0.03, -0.116, 0]));
  for (const s of [1, -1]) {
    // Flancs du bloc de pied : alésages, trous de fixation et motif carré à 4 trous
    const fh = [[-0.25, -0.03, 0.032], [0.0, -0.03, 0.032], [0.2, -0.065, 0.015], [0.26, -0.065, 0.015], [0.15, 0.0, 0.016]];
    for (const [du, dv] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) fh.push([0.15 + du * 0.028, dv * 0.028, 0.005]);
    for (const x of [-0.33, 0.29]) fh.push([x, 0.035, 0.005], [x, -0.08, 0.005]);
    fr.push(prismZ([[-0.38, -0.105], [0.32, -0.105], [0.32, 0.06], [-0.38, 0.06]], s > 0 ? 0.195 : -0.215, s > 0 ? 0.215 : -0.195, red, { holes: fh }));
    // Clavette sur le dessus du bloc
    fr.push(at(box(0.07, 0.012, 0.022, red), [0.22, 0.091, s * 0.1]));
    // Charnières (axes 21) : 3 chapes par côté, oreilles en goutte (tôle
    // épaisse à bout arrondi autour de l'axe, flanc incliné vers l'intérieur)
    const knuckle = [[0.12, 0.085], [0.242, 0.085], ...arc(0.2, 0.13, 0.042, 0, 2.558, 12)].map(([z, y]) => [s * z, y]);
    for (const [x0, x1] of [[-0.3, -0.22], [-0.12, -0.06], [0.04, 0.12]]) {
      fr.push(prismX(knuckle, x0, x1, red, { holes: [[s * 0.2, 0.13, 0.023]], bevel: 0.003, curve: 16 }));
      // Graisseur de la chape (face extérieure)
      fr.push(...nipple(S, [(x0 + x1) / 2, 0.11, s * 0.242], s > 0 ? 'z' : '-z'));
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
  // Patte du vérin d'extension (sous le bloc, côté -Z comme sur le dessin F15)
  fr.push(at(box(0.1, 0.0455, 0.045, red), [0.02, -0.14975, -0.1925]));
  fr.push(prismY([[-0.03, 0.17], [0.07, 0.17], ...arc(0.02, 0.36, 0.05, 0, Math.PI, 10), [-0.03, 0.17]].map(([x, z]) => [x, -z]), -0.1975, -0.1725, red, { holes: [[0.02, -0.36, 0.016]] }));
  // Supports du stinger (côté -Z) : oreilles à demi-lunette + âme + gousset,
  // patte percée des étriers en U (37)
  for (const x of [1.05, 2.45]) {
    fr.push(prismX([[-0.2, -0.083], [-0.27, -0.083], [-0.27, -0.046], ...arc(-0.27, 0, 0.046, -Math.PI / 2, Math.PI / 2, 12), [-0.27, 0.078], [-0.2, 0.078]], x - 0.025, x + 0.025, red));
    fr.push(at(box(0.05, 0.08, 0.022, red), [x, 0, -0.19]));
    fr.push(prismX([[-0.18, -0.083], [-0.2, -0.083], [-0.18, -0.035]], x - 0.006, x + 0.006, red));
    fr.push(prismZ([[x + 0.025, -0.075], [x + 0.072, -0.075], [x + 0.08, -0.067], [x + 0.08, 0.067], [x + 0.072, 0.075], [x + 0.025, 0.075]], -0.215, -0.203, red,
      { holes: [[x + 0.055, 0.051, 0.0068], [x + 0.055, -0.051, 0.0068]] }));
  }

  // Cordons de soudure d'angle (tôles mécano-soudées)
  const wl = [];
  for (const s of [1, -1]) {
    // Semelle haute / flancs (sous la semelle, intérieur et extérieur)
    wl.push([[0.32, 0.078, s * 0.16], [2.8, 0.078, s * 0.16]], [[0.32, 0.078, s * 0.18], [L, 0.078, s * 0.18]]);
    // Flancs du mât sur la cloison du bloc de pied (x = 0.32) et sur la cloison haute
    for (const z of [0.16, 0.18]) wl.push([[0.32, -0.105, s * z], [0.32, 0.06, s * z]]);
    for (const x of [2.8, 2.83]) wl.push([[x, -0.105, s * 0.16], [x, 0.078, s * 0.16]]);
    // Traverses en U sur les flancs
    for (const x of [0.75, 1.3, 1.85, 2.4]) {
      wl.push([[x - 0.05, -0.105, s * 0.16], [x - 0.05, -0.072, s * 0.16]], [[x + 0.05, -0.105, s * 0.16], [x + 0.05, -0.072, s * 0.16]]);
      wl.push([[x - 0.04, -0.072, s * 0.16], [x - 0.04, -0.093, s * 0.16], [x + 0.04, -0.093, s * 0.16], [x + 0.04, -0.072, s * 0.16]]);
    }
    // Goussets du sommet
    for (const y of [-0.06, -0.048, 0.035, 0.047]) wl.push([[2.64, y, s * 0.16], [2.8, y, s * 0.16]]);
    // Chapes de charnière sur le dessus du bloc de pied
    for (const [x0, x1] of [[-0.3, -0.22], [-0.12, -0.06], [0.04, 0.12]]) {
      for (const x of [x0, x1]) wl.push([[x, 0.085, s * 0.215], [x, 0.085, s * 0.125]]);
    }
    // Pattes des vérins de tables sur les flancs du bloc
    for (const dx of [0.035, -0.035]) for (const e of [-0.0075, 0.0075]) wl.push([[-0.16 + dx + e, -0.127, s * 0.215], [-0.16 + dx + e, -0.07, s * 0.215]]);
  }
  // Supports du stinger : âme sur le flanc -Z
  for (const x of [1.05, 2.45]) {
    wl.push([[x - 0.025, -0.04, -0.18], [x - 0.025, 0.04, -0.18], [x + 0.025, 0.04, -0.18], [x + 0.025, -0.04, -0.18], [x - 0.025, -0.04, -0.18]]);
    wl.push([[x + 0.025, -0.075, -0.203], [x + 0.025, 0.075, -0.203]]);
  }
  // Patte du vérin d'extension sous le bloc
  wl.push([[-0.03, -0.1725, -0.215], [0.07, -0.1725, -0.215]]);
  fr.push(beads(S, wl, 0.009));
  P('M', fuse(S, fr), [0, 0, 0]);

  // 24 — Barres de guidage (sur les flancs), acier nu poli par le chariot
  for (const s of [1, -1]) {
    P('24', fuse(S,
      box(2.6, 0.05, 0.05, 'steel', { r: 0.005, pos: [1.5, 0.115, s * 0.2] }),
      cyl(0.0065, 0.002, 'charcoal', { seg: 16, pos: [2.765, 0.1395, s * 0.2] }),
    ), [0, 0.3, s * 0.12]);
  }
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
    // Cordon intérieur du rebord sur la plaque
    out.push(beads(S, [[...inner, inner[0]].map(([z, y]) => [xr, y, z])], 0.007));
    return out;
  };
  // Vis dans les chants des flancs du mât (z = ±0.17), hors des raidisseurs
  P('25', fuse(S, tray(L, 1, -0.127, 0.11, true),
    bolts(S, [[-0.17, -0.045], [0.17, -0.045], [-0.17, 0.03], [0.17, 0.03]].map(([z, y]) => [L + 0.012, y, z]), 0.012, 0.03, 'steel', { axis: 'x', washer: true })), [0.6, 0.12, 0]);
  // 29 — Couvercle inférieur (bout du bloc de pied)
  P('29', fuse(S, tray(-0.38, -1, -0.127, 0.06, false),
    bolts(S, [[-0.1, -0.097], [0.1, -0.097], [-0.1, 0.03], [0.1, 0.03]].map(([z, y]) => [-0.392, y, z]), 0.012, 0.03, 'steel', { axis: '-x', washer: true })), [-0.8, -0.2, 0]);

  // Tables au pied du mât : 12 table gauche (+Z), 26 table droite (-Z, côté
  // stinger, comme sur le dessin F15), logement des mâchoires ouvert vers le haut. Montrées ouvertes sur leurs
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
  // Flasques pleines à échancrure demi-ronde autour de la tige (dessin F15)
  const tableProf = [[0, 0.3], [0, rodY - 0.088], ...arc(0, rodY, 0.088, -Math.PI / 2, Math.PI / 2, 14).slice(1, -1), [0, rodY + 0.088], [0, 0.72],
    [0.27, 0.72], [0.3, 0.69], [0.3, 0.3], [0.25, 0.18], [0.15, 0.18], [0.1, 0.24], [0.04, 0.3]];
  // Corps en retrait des flasques (les 3 flasques ressortent comme sur le dessin)
  const inset = [[0, 0.31], [0, 0.46], [0.13, 0.46], [0.13, 0.7], [0.258, 0.7], [0.278, 0.68], [0.278, 0.3], [0.236, 0.2], [0.162, 0.2], [0.11, 0.255], [0.045, 0.31]];
  const table = (s) => {
    const m = (pr) => pr.map(([z, y]) => [s * z, y]);
    const t = [prismX(m(inset), -0.355, 0.015, red, { bevel: 0.005 })];
    for (const [x0, x1] of [[-0.37, -0.35], [-0.2, -0.18], [0.01, 0.03]]) t.push(prismX(m(tableProf), x0, x1, red, { bevel: 0.004 }));
    // Cordons des flasques sur le corps (dessus et flanc extérieur) et des oreilles
    const seam = [[0.13, 0.7], [0.258, 0.7], [0.278, 0.68], [0.278, 0.3], [0.236, 0.2]];
    const wt = [-0.35, -0.2, -0.18, 0.01].map((x) => seam.map(([z, y]) => [x, y, s * z]));
    for (const dx of [0.035, -0.035]) for (const e of [-0.0075, 0.0075]) wt.push([[-0.16 + dx + e, 0.215, s * 0.278], [-0.16 + dx + e, 0.33, s * 0.278]]);
    t.push(beads(S, wt, 0.008));
    // Chapes de charnière : oreilles à fond arrondi sous le corps
    const lug = [...arc(0.2, 0.13, 0.042, Math.PI, Math.PI * 2, 12), [0.244, 0.215], [0.156, 0.215]].map(([z, y]) => [s * z, y]);
    for (const [x0, x1] of [[-0.37, -0.31], [-0.21, -0.13], [-0.05, 0.03]]) {
      t.push(prismX(lug, x0, x1, red, { holes: [[s * 0.2, 0.13, 0.023]], bevel: 0.003, curve: 16 }));
      t.push(...nipple(S, [(x0 + x1) / 2, 0.175, s * 0.235], s > 0 ? 'z' : '-z'));
    }
    // Oreilles du vérin de table, bossages des vérins de mâchoires
    for (const dx of [0.035, -0.035]) {
      t.push(prismX(m([[0.236, 0.2], [0.26, 0.2], [0.33, 0.232], [0.33, 0.288], [0.278, 0.33], [0.236, 0.33]]), -0.16 + dx - 0.0075, -0.16 + dx + 0.0075, red));
      t.push(ring(0.028, 0.012, 0.015, red, { axis: 'x', pos: [-0.16 + dx, 0.26, s * 0.33] }));
    }
    for (const x of [-0.3, -0.07]) {
      t.push(at(box(0.05, 0.04, 0.06, red), [x, 0.7, s * 0.268]));
      t.push(cyl(0.022, 0.035, red, { pos: [x, 0.7375, s * 0.28] }));
    }
    return fuse(S, t);
  };
  P('12', tilt(1, table(1)), onTable(1, [0, 0, 0]));
  P('26', tilt(-1, table(-1)), onTable(-1, [0, 0, 0]));

  // Mâchoires (slip plates 1/2, acier coulé gris foncé) et centreurs (3/4, gris) : blocs à
  // demi-alésage logés dans les tables, bossage d'attache du vérin sur le dessus.
  // Mâchoires : alésage strié (dents en acier nu) ; centreurs : alésage lisse.
  const insert = (s, x0, x1, rs, material, teeth = false) => {
    const dep = teeth ? 0.003 : 0;
    const seat = arc(0, rodY, rs + dep, Math.PI / 2, -Math.PI / 2, 18);
    // Centreurs : feuillures le long des arêtes de la face d'appui (dessin F15)
    const body = teeth
      ? [[0, 0.46], [0.128, 0.46], [0.128, 0.72], [0, 0.72]]
      : [[0, 0.476], [0.014, 0.476], [0.014, 0.46], [0.128, 0.46], [0.128, 0.72], [0.014, 0.72], [0.014, 0.704], [0, 0.704]];
    const prof = [...body, ...seat].map(([z, y]) => [s * z, y]);
    return tilt(s, fuse(S,
      prismX(prof, x0, x1, material, { bevel: 0.003 }),
      teeth ? wickers(x0 + 0.004, x1 - 0.004, rodY, rs, s, 'darkSteel', { depth: dep }) : null,
      cyl(0.02, 0.035, material, { pos: [(x0 + x1) / 2, 0.7375, s * 0.1] }),
    ));
  };
  P('1', insert(1, -0.35, -0.25, 0.052, 'castIron', true), onTable(1, [0, 0.3, 0.02]));
  P('2', insert(-1, -0.35, -0.25, 0.075, 'castIron', true), onTable(-1, [0, 0.3, -0.02]));
  P('3', insert(1, -0.11, -0.03, 0.05, 'grey'), onTable(1, [0, 0.3, 0.02]));
  P('4', insert(-1, -0.11, -0.03, 0.072, 'grey'), onTable(-1, [0, 0.3, -0.02]));

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
    // Axes à tête, arrêtés par une goupille bêta (fil zingué) au bout opposé
    const pinX = (y) => fuse(S,
      cyl(0.012, 0.12, 'steel', { axis: 'x' }), at(cyl(0.02, 0.008, 'steel', { axis: 'x' }), [-0.064, 0, 0]),
      S.torus(0.0142, 0.0016, 'zinc', { axis: 'x', pos: [0.051, 0, 0] }), cyl(0.0016, 0.03, 'zinc', { seg: 8, pos: [0.051, 0.002, 0] }),
    ).translateX(-0.16).translateY(y).translateZ(s * 0.33);
    P('14', tilt(s, pinX(0.26)), [-0.45, -0.1, s * 0.6]);
    P('15', tilt(s, ring(0.019, 0.012, 0.022, 'brass', { axis: 'x', seg: 20, pos: [-0.137, 0.26, s * 0.33] })), [-0.3, -0.1, s * 0.6]);
    P('16', tilt(s, ring(0.019, 0.012, 0.016, 'brass', { axis: 'x', seg: 20, pos: [-0.183, 0.26, s * 0.33] })), [0.22, -0.1, s * 0.6]);
    P(s > 0 ? '17' : '27', pinX(-0.1), [-0.45, -0.1, s * 0.6]);
    P(s > 0 ? '18' : '28', ring(0.019, 0.012, 0.02, 'brass', { axis: 'x', seg: 20, pos: [-0.138, -0.1, s * 0.33] }), [-0.3, -0.1, s * 0.6]);
    P('19', ring(0.019, 0.012, 0.02, 'brass', { axis: 'x', seg: 20, pos: [-0.182, -0.1, s * 0.33] }), [0.22, -0.1, s * 0.6]);
  }
  // 21 — Axes de charnière des tables (tête + écrou) ; 13 / 22 — bagues à collerette
  for (const s of [1, -1]) {
    // Axe à tête bombée, bout fileté réduit, écrou à créneaux + goupille fendue
    P('21', fuse(S,
      lathe([[-0.415, 0], [-0.415, 0.026, 1], [-0.412, 0.032, 1], [-0.405, 0.035], [-0.4, 0.035], [-0.4, 0.022], [0.125, 0.022], [0.13, 0.016],
        ...threads(0.13, 0.176, 0.0145, 0.016, 8), [0.179, 0.013], [0.179, 0]], 'steel', 24),
      castleNut(S, 0.143, 0.05, 0.03),
    ).translateY(0.13).translateZ(s * 0.2), [-0.55, 0, 0]);
    // Bagues à collerette des chapes de la table et du bloc de pied (en
    // alternance) : deux gorges de graissage, chanfreins
    const bush = [[0, 0.0225], [0, 0.0295], [0.0015, 0.031], [0.0055, 0.031], [0.006, 0.0285], [0.018, 0.0285], [0.019, 0.0265], [0.025, 0.0265], [0.026, 0.0285],
      [0.036, 0.0285], [0.037, 0.0265], [0.043, 0.0265], [0.044, 0.0285], [0.056, 0.0285], [0.058, 0.0265], [0.058, 0.0225], [0, 0.0225]];
    for (const x of [-0.37, -0.3, -0.21, -0.12, -0.05, 0.04]) {
      P(s > 0 ? '13' : '22', at(lathe(bush, 'brass', 16), [x - 0.006, 0.13, s * 0.2]), [0, 0.03, s * 0.28]);
    }
  }

  // 23 — Support de jonction des boyaux (flanc +Z)
  P('23', fuse(S,
    prismZ([[1.424, -0.09], [1.576, -0.09], [1.576, 0.05], [1.424, 0.05]], 0.18, 0.192, red, { holes: [[1.44, -0.07, 0.007], [1.56, -0.07, 0.007], [1.44, 0.03, 0.007], [1.56, 0.03, 0.007]] }),
    prismX([[0.192, -0.02], [0.29, -0.02], [0.29, 0.06], [0.192, 0.06]], 1.494, 1.506, red, { holes: [[0.225, 0.02, 0.008], [0.255, 0.02, 0.008]] }),
    ring(0.026, 0.014, 0.05, red, { axis: 'x', pos: [1.5, 0.02, 0.305] }),
    prismY([[1.43, 0.192], [1.494, 0.192], [1.494, 0.26]], -0.02, -0.01, red),
    // Vis de fixation sur le flanc (têtes hexagonales + rondelles)
    bolts(S, [[1.44, -0.07], [1.56, -0.07], [1.44, 0.03], [1.56, 0.03]].map(([x, y]) => [x, y, 0.192]), 0.012, 0.03, 'steel', { axis: 'z', washer: true }),
    // Cordons : patte et gousset sur la plaque
    beads(S, [[[1.494, -0.02, 0.192], [1.494, 0.06, 0.192]], [[1.506, -0.02, 0.192], [1.506, 0.06, 0.192]], [[1.43, -0.02, 0.192], [1.494, -0.02, 0.192]]], 0.006),
  ), [0, 0, 0.35]);

  // Câble d'arrêt d'urgence (côté -Z) : 30 support bas, 31 attache, 32 ressort,
  // 34 support haut, 33 garde, 35 câble + interrupteur jaune.
  const zc = -0.35;
  const bracket = (x, h, w) => [
    at(box(w, 0.07, 0.012, red), [x, 0.035, -0.186]),
    at(box(w, 0.012, 0.17, red), [x, 0.068, -0.277]),
    prismX([[zc - 0.024, 0.074], [zc + 0.024, 0.074], [zc + 0.012, h], [zc - 0.012, h]], x - 0.006, x + 0.006, red, { holes: h < 0.2 ? [[zc, h - 0.012, 0.005]] : [] }),
    prismZ([[x + 0.006, 0.074], [x + 0.05, 0.074], [x + 0.006, 0.15]], zc - 0.005, zc + 0.005, red),
    // Cordons : bras sous la semelle, montant et gousset sur le bras
    beads(S, [
      [[x - w / 2, 0.062, -0.192], [x + w / 2, 0.062, -0.192]],
      ...[-0.006, 0.006].map((e) => [[x + e, 0.074, zc - 0.024], [x + e, 0.074, zc + 0.024]]),
      ...[-0.005, 0.005].map((e) => [[x + 0.006, 0.074, zc + e], [x + 0.05, 0.074, zc + e]]),
    ], 0.005),
  ];
  P('30', fuse(S, bracket(0.5, 0.195, 0.06)), [0, 0.2, -0.35]);
  // 31 — Œil à tige filetée dans le support, deux écrous de blocage
  P('31', fuse(S,
    at(cyl(0.004, 0.05, 'steel', { axis: 'x' }), [0.511, 0.183, zc]),
    nuts(S, [[0.489, 0.183, zc], [0.511, 0.183, zc]], 0.011, 0.0055, 'steel', 'x'),
    S.torus(0.008, 0.002, 'steel', { axis: 'z', pos: [0.543, 0.183, zc] }),
  ), [0.05, 0.3, -0.45]);
  // 32 — Ressort de traction à boucles
  P('32', fuse(S,
    coil(0.555, 0.639, 0.183, zc, 0.011, 0.0018, 11, 'steel'),
    ...[0.548, 0.646].map((x) => S.torus(0.0075, 0.0018, 'steel', { axis: 'y', pos: [x, 0.183, zc] })),
  ), [0.1, 0.36, -0.5]);
  P('34', fuse(S, bracket(2.62, 0.2, 0.07), at(box(0.17, 0.01, 0.07, red), [2.585, 0.205, zc])), [0, 0.2, -0.35]);
  // 33 — Garde (tôle pliée en U, vissée sur le support)
  P('33', fuse(S,
    at(box(0.04, 0.005, 0.064, red), [2.52, 0.2525, zc]),
    ...[1, -1].map((k) => at(box(0.04, 0.045, 0.005, red), [2.52, 0.2325, zc + k * 0.0295])),
    ...[1, -1].map((k) => at(box(0.04, 0.005, 0.018, red), [2.52, 0.2125, zc + k * 0.041])),
    bolts(S, [1, -1].map((k) => [2.52, 0.215, zc + k * 0.043]), 0.006, 0.016, 'steel', { washer: true }),
  ), [-0.1, 0.45, -0.45]);
  // 35 — Câble (gaine noire, manchons sertis) et interrupteur à tirette :
  // socle noir, boîtier jaune à couvercle vissé, bouton coup-de-poing rouge,
  // œil de traction côté câble, bouchon de presse-étoupe, plaque signalétique.
  P('35', fuse(S,
    tube([[0.65, 0.183, zc], [1.6, 0.2013, zc], [2.548, 0.222, zc]], 0.0025, 'black', { seg: 24, radial: 8 }),
    at(cyl(0.0042, 0.018, 'steel', { axis: 'x', seg: 12 }), [0.663, 0.1831, zc]),
    at(cyl(0.0042, 0.018, 'steel', { axis: 'x', seg: 12 }), [2.537, 0.2217, zc]),
    at(box(0.1, 0.018, 0.065, 'black', { r: 0.004 }), [2.62, 0.219, zc]),
    at(box(0.1, 0.046, 0.065, 'safety', { r: 0.007 }), [2.62, 0.251, zc]),
    at(box(0.092, 0.006, 0.058, 'safety', { r: 0.003 }), [2.62, 0.2765, zc]),
    ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => at(cyl(0.0035, 0.002, 'steel', { seg: 12 }), [2.62 + a * 0.04, 0.2805, zc + b * 0.024])),
    at(cyl(0.009, 0.012, 'black', { seg: 20 }), [2.62, 0.285, zc]),
    at(latheY([[0.291, 0], [0.291, 0.018], [0.294, 0.0195, 1], [0.3, 0.016, 1], [0.304, 0.009, 1], [0.3055, 0]], 'red', 28), [0, 0, zc]).translateX(2.62),
    at(cyl(0.008, 0.008, 'black', { axis: 'x', seg: 16 }), [2.566, 0.222, zc]),
    at(cyl(0.0035, 0.012, 'steel', { axis: 'x', seg: 12 }), [2.558, 0.222, zc]),
    S.torus(0.0055, 0.0016, 'steel', { axis: 'y', pos: [2.551, 0.222, zc] }),
    at(hexX(0.018, 0.007, 'black'), [2.6735, 0.245, zc]),
    at(cyl(0.007, 0.006, 'black', { axis: 'x', seg: 16 }), [2.68, 0.245, zc]),
    S.nameplate ? at(S.nameplate(0.05, 0.022, { material: 'white' }), [2.62, 0.248, zc - 0.0326], [0, Math.PI, 0]) : null,
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
    // Bossages et raccords des orifices, cordons des fonds
    ...[0.72, 2.72].flatMap((x) => [at(cyl(0.012, 0.016, red), [x, 0.049, 0]), at(S.fitting(0.016, 0.03, 'steel'), [x, 0.0612, 0])]),
    ...[0.53, 2.77].map((x) => beadRingX(x, 0.045, 0.006, red)),
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
    // Étrier en U autour du fût, branches à travers la patte, rondelles et écrous
    const ux = x + 0.055, ur = 0.051;
    const u = [[ur, -0.188], [ur, sz]];
    for (let i = 1; i < 12; i++) { const a = (i / 12) * Math.PI; u.push([Math.cos(a) * ur, sz - Math.sin(a) * ur]); }
    u.push([-ur, sz], [-ur, -0.188]);
    const legs = [ur, -ur].map((y) => [ux, sy + y, -0.2]);
    P('37', fuse(S,
      tube(u.map(([y, z]) => [ux, sy + y, z]), 0.006, 'steel', { seg: 48, tension: 0.1, radial: 12 }),
      washers(S, legs.map(([a, b]) => [a, b, -0.202]), 0.0105, 0.0065, 0.002, 'steel', 'z'),
      nuts(S, legs.map(([a, b]) => [a, b, -0.197]), 0.017, 0.008, 'steel', 'z'),
    ), [0, 0, -0.7]);
  }
  // Vue du dessin F15 : pied et tables à droite, stinger devant à gauche
  return { view: { dir: [-0.55, 0.75, -1.0] } };
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
    bolts(S, [[cx + 0.455, 0.202, 0.03], [cx + 0.455, 0.202, -0.03]], 0.012, 0.03, 'steel', { washer: true }),
    // Cordons : plaque sur la semelle, gousset
    beads(S, [
      [[cx + 0.495, 0.202, -0.035], [cx + 0.495, 0.202, 0.035]],
      [[cx + 0.51, 0.202, -0.035], [cx + 0.51, 0.202, 0.035]],
      ...[-0.006, 0.006].map((e) => [[cx + 0.437, 0.202, e], [cx + 0.495, 0.202, e], [cx + 0.495, 0.298, e]]),
    ], 0.006),
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
    // Bossages soudés des orifices, raccords six-pans ; cordons des têtes et du collier
    ...[xb0 + 0.09, xb1 - 0.09].flatMap((x) => [
      at(cyl(0.016, 0.02, 'red'), [x, ro + 0.004, 0]),
      at(S.fitting(0.022, 0.04, 'steel'), [x, ro + 0.014 + 0.0056, 0]),
      beadRingY([x, ro - 0.001, 0], 0.016, 0.005),
    ]),
    ...[xb0 + 0.06, xb1 - 0.06, cx - 0.035, cx + 0.035].map((x) => beadRingX(x, ro, 0.007)),
  );
  feed.userData.hasInterior = true;
  P('3', feed, [0, 0.4, 0]);

  P('5', at(api.sub('F17'), [extFeedX, -0.15, 0]), [0, -0.55, 0]);

  // 6 — Vérin d'avance d'extension (côté -Z, sous la table inférieure) : œil
  // sous la patte de la plaque F17, chape sur la patte du bloc de pied.
  const tabX = extFeedX + EXT_TAB_X;
  const ext = along(ram(S, tabX - 0.02, 0.08, { material: 'red', pin: 'y', ext: 0.35, back: 'eye', front: 'clevis', neck: 0.1 }), '-x');
  const e6 = fuse(S,
    at(ext, [tabX, -0.185, -0.36]),
    S.bolt(0.016, 0.075, 'steel', { pos: [tabX, -0.135, -0.36] }),
    at(cyl(0.012, 0.085, 'steel'), [0.02, -0.185, -0.36]),
  );
  e6.userData.hasInterior = true;
  P('6', e6, [-0.25, -0.5, -0.45]);
  // Vue du dessin F14 (éclaté) : pied devant à gauche, tête de rotation en haut
  return { view: { dir: [-0.5, 0.75, 1.0] } };
}

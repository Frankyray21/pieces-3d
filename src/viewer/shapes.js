import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mat } from './materials.js';

// Bibliothèque de formes paramétriques (unités : mètres, Y vers le haut).
// Chaque fonction retourne un Mesh ou un Group prêt à positionner.
// Les pièces d'un même matériau d'une forme composée sont fusionnées en un
// seul maillage (moins d'appels de dessin) ; arêtes adoucies ou chanfreinées
// pour accrocher la lumière, comme une pièce usinée (tôles et profils
// extrudés : arêtes cassées d'environ 1 mm, encombrement inchangé).
// Détails réalistes : hose() flexible à embouts sertis, cable() à
// presse-étoupes, weld() / weldRing() cordons de soudure, boltSet() /
// boltCircle() boulons à rondelles, stud() goujon + écrou, nameplate()
// plaque signalétique neutre. Aucune ombre : pas de castShadow / receiveShadow.

const V = (a) => (a instanceof THREE.Vector3 ? a : new THREE.Vector3(...a));
const TAN30 = Math.tan(Math.PI / 6);
const COS30 = Math.cos(Math.PI / 6);

function orient(obj, axis) {
  if (axis === 'x') obj.rotation.z = -Math.PI / 2;
  else if (axis === 'z') obj.rotation.x = Math.PI / 2;
  else if (axis === '-x') obj.rotation.z = Math.PI / 2;
  else if (axis === '-z') obj.rotation.x = -Math.PI / 2;
  else if (axis === '-y') obj.rotation.x = Math.PI;
  return obj;
}

/**
 * Normales lissées entre faces voisines faisant un angle inférieur à crease
 * (radians) : les parois courbes d'une extrusion (lobes, trous, arrondis)
 * deviennent lisses au lieu de facettées ; arêtes et chanfreins restent vifs.
 * Moyenne pondérée par l'aire des faces ; sommets soudés à 0,05 mm près.
 */
export function creaseNormals(geometry, crease = 0.5) {
  const geo = geometry.index ? geometry.toNonIndexed() : geometry;
  const pos = geo.attributes.position.array;
  const nv = pos.length / 3, nf = nv / 3, q = 2e4;
  const key = new Float64Array(nv);
  for (let i = 0; i < nv; i++) {
    key[i] = (Math.round(pos[i * 3] * q) * 2097152 + Math.round(pos[i * 3 + 1] * q)) * 2097152 + Math.round(pos[i * 3 + 2] * q);
  }
  const fw = new Float32Array(nf * 3); // normale × aire
  const fn = new Float32Array(nf * 3); // normale unitaire
  const at = new Map();
  for (let f = 0; f < nf; f++) {
    const a = f * 9;
    const ux = pos[a + 3] - pos[a], uy = pos[a + 4] - pos[a + 1], uz = pos[a + 5] - pos[a + 2];
    const vx = pos[a + 6] - pos[a], vy = pos[a + 7] - pos[a + 1], vz = pos[a + 8] - pos[a + 2];
    const x = uy * vz - uz * vy, y = uz * vx - ux * vz, z = ux * vy - uy * vx;
    const l = Math.hypot(x, y, z) || 1;
    fw.set([x, y, z], f * 3);
    fn.set([x / l, y / l, z / l], f * 3);
    for (let k = 0; k < 3; k++) {
      const id = key[f * 3 + k];
      const list = at.get(id);
      if (list) list.push(f); else at.set(id, [f]);
    }
  }
  const cos = Math.cos(crease);
  const out = new Float32Array(nv * 3);
  for (let i = 0; i < nv; i++) {
    const f = (i / 3) | 0;
    let x = 0, y = 0, z = 0;
    for (const g of at.get(key[i])) {
      if (fn[f * 3] * fn[g * 3] + fn[f * 3 + 1] * fn[g * 3 + 1] + fn[f * 3 + 2] * fn[g * 3 + 2] < cos) continue;
      x += fw[g * 3]; y += fw[g * 3 + 1]; z += fw[g * 3 + 2];
    }
    const l = Math.hypot(x, y, z);
    if (l > 0) out.set([x / l, y / l, z / l], i * 3);
    else out.set([fn[f * 3], fn[f * 3 + 1], fn[f * 3 + 2]], i * 3);
  }
  geo.setAttribute('normal', new THREE.BufferAttribute(out, 3));
  return geo;
}

function mesh(geometry, material) {
  // Extrusions : three.js calcule des normales par face (parois courbes facettées).
  if (geometry.type === 'ExtrudeGeometry') geometry = creaseNormals(geometry);
  return new THREE.Mesh(geometry, mat(material));
}

// ------------------------------------------------------------ géométries de base

/**
 * Révolution autour de Y d'un profil [[r, y], ...] parcouru du centre bas
 * vers le centre haut par l'extérieur. Normales franches entre segments du
 * profil (chanfreins nets), lisses autour de l'axe — ou facettées (hexagone).
 */
function revolveGeo(profile, seg, faceted = false) {
  const pos = [], nor = [], uv = [], idx = [];
  for (let i = 0; i < profile.length - 1; i++) {
    const [r0, y0] = profile[i];
    const [r1, y1] = profile[i + 1];
    const dr = r1 - r0, dy = y1 - y0;
    const l = Math.hypot(dr, dy);
    if (l < 1e-9) continue;
    const nr = dy / l, ny = -dr / l;
    const base = pos.length / 3;
    for (let j = 0; j <= seg; j++) {
      const t = (j / seg) * Math.PI * 2;
      const s = Math.sin(t), c = Math.cos(t);
      pos.push(r0 * s, y0, r0 * c, r1 * s, y1, r1 * c);
      nor.push(nr * s, ny, nr * c, nr * s, ny, nr * c);
      uv.push(j / seg, i / profile.length, j / seg, (i + 1) / profile.length);
    }
    for (let j = 0; j < seg; j++) {
      const a = base + j * 2, b = a + 2, c = a + 1, d = a + 3;
      if (r0 > 1e-9) idx.push(a, b, c);
      if (r1 > 1e-9) idx.push(b, d, c);
    }
  }
  let geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  if (faceted) {
    geo = geo.toNonIndexed();
    geo.computeVertexNormals();
  }
  return geo;
}

/** Profil de cylindre (ou cône) à arêtes chanfreinées à 30° (une seule arête vive vue de face). */
function cylProfile(rb, rt, len, cMax = 0.004) {
  const h = len / 2;
  const rmin = Math.min(rb > 0 ? rb : Infinity, rt > 0 ? rt : Infinity);
  const c = Math.min(rmin * 0.1, len * 0.12, cMax);
  if (!(c > 0.0012)) return [[0, -h], [rb, -h], [rt, h], [0, h]];
  const cy = c * TAN30;
  const p = [[0, -h]];
  if (rb > 0) p.push([rb - c, -h], [rb, -h + cy]);
  if (rt > 0) p.push([rt, h - cy], [rt - c, h]);
  p.push([0, h]);
  return p;
}

function cylGeo(r, len, { r2, seg = 28, open = false } = {}) {
  const rt = r2 ?? r;
  if (open) return new THREE.CylinderGeometry(rt, r, len, seg, 1, true);
  return revolveGeo(cylProfile(r, rt, len), seg, seg <= 8);
}

/** Boîte à arêtes arrondies (2 facettes par arrondi, 108 triangles). */
function roundBoxGeo(w, h, d, r) {
  const H = [w / 2, h / 2, d / 2];
  const I = H.map((x) => Math.max(x - r, 0));
  const pos = [], nor = [], uv = [], idx = [];
  // [axe normal, axe u, axe v, sens]
  const faces = [[0, 1, 2, 1], [0, 1, 2, -1], [1, 2, 0, 1], [1, 2, 0, -1], [2, 0, 1, 1], [2, 0, 1, -1]];
  const p = [0, 0, 0], q = [0, 0, 0], n = [0, 0, 0];
  for (const [k, u, v, s] of faces) {
    const base = pos.length / 3;
    const cu = [-H[u], -I[u], I[u], H[u]], cv = [-H[v], -I[v], I[v], H[v]];
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 4; i++) {
        p[k] = s * H[k]; p[u] = cu[i]; p[v] = cv[j];
        for (let a = 0; a < 3; a++) { q[a] = Math.max(-I[a], Math.min(I[a], p[a])); n[a] = p[a] - q[a]; }
        const l = Math.hypot(n[0], n[1], n[2]) || 1;
        for (let a = 0; a < 3; a++) { n[a] /= l; pos.push(q[a] + n[a] * r); nor.push(n[a]); }
        uv.push(i / 3, j / 3);
      }
    }
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 3; i++) {
        const a = base + j * 4 + i, b = a + 1, c = a + 4, e = a + 5;
        if (s > 0) idx.push(a, b, e, a, e, c);
        else idx.push(a, e, b, a, c, e);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  return geo;
}

function boxGeo(w, h, d, r = 0) {
  if (r > 0) return roundBoxGeo(w, h, d, Math.min(r, w / 2, h / 2, d / 2));
  // Arrondi automatique très léger : un reflet le long des arêtes.
  const ra = Math.min(Math.min(w, h, d) * 0.08, 0.0035);
  return ra >= 0.002 ? roundBoxGeo(w, h, d, ra) : new THREE.BoxGeometry(w, h, d);
}

/** Hexagone (surplat af, hauteur h) chanfreiné à 30° ; trou rond optionnel. Axe Y, centré. */
function hexGeo(af, h, { hole = 0, top = true, bottom = true } = {}) {
  const R = af / 2 / COS30;
  if (hole > 0) {
    // Écrou : extrusion d'un hexagone percé, chanfreins des deux faces (et fraisure du trou).
    const b = Math.min(af * 0.06, h * 0.2);
    const bt = b * TAN30;
    const rs = R - b / COS30;
    const shape = new THREE.Shape();
    for (let i = 0; i <= 6; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 3;
      if (i === 0) shape.moveTo(Math.cos(a) * rs, Math.sin(a) * rs);
      else shape.lineTo(Math.cos(a) * rs, Math.sin(a) * rs);
    }
    const p = new THREE.Path();
    p.absarc(0, 0, hole + b, 0, Math.PI * 2, true);
    shape.holes.push(p);
    const depth = Math.max(h - 2 * bt, h * 0.2);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth, bevelEnabled: true, bevelSize: b, bevelThickness: bt, bevelSegments: 1, curveSegments: 10,
    });
    geo.translate(0, 0, -depth / 2);
    geo.rotateX(-Math.PI / 2);
    geo.scale(1, h / (depth + 2 * bt), 1);
    return geo;
  }
  const c = R * 0.14, cy = c * TAN30;
  const y0 = -h / 2, y1 = h / 2;
  const prof = [[0, y0]];
  if (bottom) prof.push([R - c, y0], [R, y0 + cy]); else prof.push([R, y0]);
  if (top) prof.push([R, y1 - cy], [R - c, y1]); else prof.push([R, y1]);
  prof.push([0, y1]);
  return revolveGeo(prof, 6, true);
}

/**
 * Filetage suggéré : profil ondulé peu profond (reflets en bandes) de y0 à y1,
 * rayon r, conique jusqu'à r1 ; chanfrein en bas. Côté droit d'un profil de révolution.
 */
function threadProfile(r, y0, y1, { r1 = r, pitch, maxTurns = 7, chamferBottom = true } = {}) {
  const len = y1 - y0;
  const n = Math.max(1, Math.min(maxTurns, Math.round(len / (pitch || r * 0.3))));
  const p = len / n;
  const depth = Math.min(p * 0.17, r * 0.06);
  const out = [];
  const c = Math.min(r * 0.15, len * 0.1);
  if (chamferBottom) out.push([r - c, y0], [r, y0 + c * TAN30]);
  else out.push([r, y0]);
  for (let i = 0; i < n; i++) {
    const ya = y0 + p * i;
    const rr = r + (r1 - r) * ((i + 0.5) / n);
    if (i > 0 || !chamferBottom) out.push([rr, ya]);
    out.push([rr - depth, ya + p * 0.5]);
  }
  out.push([r1, y1]);
  return out;
}

/** Applique position / rotation à une géométrie. */
function place(geo, pos = [0, 0, 0], rot = null) {
  const m = new THREE.Matrix4().compose(
    V(pos),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rot || [0, 0, 0]))),
    new THREE.Vector3(1, 1, 1),
  );
  return geo.applyMatrix4(m);
}

/** Oriente une géométrie construite selon Y vers l'axe donné. */
function alongAxis(geo, axis) {
  if (axis === 'x') geo.rotateZ(-Math.PI / 2);
  else if (axis === '-x') geo.rotateZ(Math.PI / 2);
  else if (axis === 'z') geo.rotateX(Math.PI / 2);
  else if (axis === '-z') geo.rotateX(-Math.PI / 2);
  else if (axis === '-y') geo.rotateX(Math.PI);
  return geo;
}

/** Fusionne des géométries placées (position, normal, uv) en une seule. */
function mergeGeo(list) {
  const geos = list.filter(Boolean).map((g) => {
    const x = g.index ? g.toNonIndexed() : g;
    if (!x.attributes.uv) x.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(x.attributes.position.count * 2), 2));
    if (!x.attributes.normal) x.computeVertexNormals();
    for (const k of Object.keys(x.attributes)) if (!['position', 'normal', 'uv'].includes(k)) x.deleteAttribute(k);
    return x;
  });
  return geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
}

/** Un seul maillage à partir de plusieurs géométries placées. */
function solid(material, ...geos) {
  return mesh(mergeGeo(geos.flat()), material);
}

// ------------------------------------------------------------------ API

/** Positionne / oriente un objet. rot en radians [x, y, z]. */
export function at(obj, pos = [0, 0, 0], rot = null, scale = null) {
  obj.position.copy(V(pos));
  if (rot) obj.rotation.set(...rot);
  if (scale) typeof scale === 'number' ? obj.scale.setScalar(scale) : obj.scale.set(...scale);
  return obj;
}

export function group(...children) {
  const g = new THREE.Group();
  children.flat().forEach((c) => c && g.add(c));
  return g;
}

export function box(w, h, d, material = 'red', { r = 0, pos, rot } = {}) {
  const m = mesh(boxGeo(w, h, d, r), material);
  if (pos) at(m, pos, rot);
  return m;
}

/** Cylindre de rayon r, longueur len, le long de l'axe donné, centré à l'origine. */
export function cyl(r, len, material = 'steel', { axis = 'y', r2, seg = 28, pos, open = false } = {}) {
  const inner = mesh(cylGeo(r, len, { r2, seg, open }), material);
  orient(inner, axis);
  const g = group(inner);
  if (pos) g.position.copy(V(pos));
  return g;
}

function ringGeo(rOut, rIn, thick, seg) {
  const h = thick / 2;
  const c = Math.min((rOut - rIn) * 0.18, thick * 0.3, 0.003);
  const prof = c > 0.0003
    ? [[rIn, -h], [rOut - c, -h], [rOut, -h + c * TAN30], [rOut, h - c * TAN30], [rOut - c, h], [rIn, h], [rIn, -h]]
    : [[rIn, -h], [rOut, -h], [rOut, h], [rIn, h], [rIn, -h]];
  return revolveGeo(prof, seg, seg <= 8);
}

/** Anneau épais (rondelle, bride) : rayon ext., rayon int., épaisseur. */
export function ring(rOut, rIn, thick, material = 'steel', { axis = 'y', seg = 32, pos } = {}) {
  const m = mesh(ringGeo(rOut, rIn, thick, seg), material);
  orient(m, axis);
  const g = group(m);
  if (pos) g.position.copy(V(pos));
  return g;
}

/** Rondelle plate (épaisseur selon l'axe), chanfreinée. */
export function washer(rOut, rIn, thick, material = 'steel', { axis = 'y', pos } = {}) {
  return ring(rOut, rIn, thick, material, { axis, seg: 24, pos });
}

/** Tore (joint torique, anneau de levage). Plan perpendiculaire à l'axe. */
export function torus(R, r, material = 'rubber', { axis = 'y', pos } = {}) {
  const geo = new THREE.TorusGeometry(R, r, 10, 36);
  geo.rotateX(Math.PI / 2);
  const m = mesh(geo, material);
  orient(m, axis);
  const g = group(m);
  if (pos) g.position.copy(V(pos));
  return g;
}

function flipGeometry(geo) {
  const idx = geo.index.array;
  for (let i = 0; i < idx.length; i += 3) { const t = idx[i]; idx[i] = idx[i + 2]; idx[i + 2] = t; }
  const n = geo.attributes.normal.array;
  for (let i = 0; i < n.length; i++) n[i] = -n[i];
  return geo;
}

/**
 * Tube à paroi épaisse (fût de vérin, cuve de filtre, cloche) le long de
 * l'axe donné : intérieur creux visible en vue coupée. r2Out / r2In : rayons
 * à l'extrémité +axe (pour une forme conique).
 */
export function shell(rOut, rIn, len, material = 'steel', { axis = 'y', r2Out, r2In, seg = 32, pos } = {}) {
  const ro2 = r2Out ?? rOut, ri2 = r2In ?? rIn;
  const outer = new THREE.CylinderGeometry(ro2, rOut, len, seg, 1, true);
  const inner = flipGeometry(new THREE.CylinderGeometry(ri2, rIn, len, seg, 1, true));
  const top = new THREE.RingGeometry(ri2, ro2, seg);
  top.rotateX(-Math.PI / 2);
  top.translate(0, len / 2, 0);
  const bottom = new THREE.RingGeometry(rIn, rOut, seg);
  bottom.rotateX(Math.PI / 2);
  bottom.translate(0, -len / 2, 0);
  const m = mesh(mergeGeometries([outer, inner, top, bottom]), material);
  orient(m, axis);
  const g = group(m);
  g.userData.hasInterior = true;
  if (pos) g.position.copy(V(pos));
  return g;
}

/**
 * Embout serti de flexible le long de +Y, de l'extrémité (y=0) vers le
 * flexible : écrou tournant six-pans, collet, douille sertie (empreintes des
 * mors) qui recouvre le bout du flexible et se raccorde à lui par un cône.
 */
function ferruleGeo(r) {
  const R = r * 1.38;
  const nutH = r * 1.1, neck = r * 0.35, sleeve = r * 3.4;
  const y0 = nutH + neck, y1 = y0 + sleeve;
  const prof = [[0, nutH], [r * 0.9, nutH], [r * 0.9, y0 - r * 0.08], [R - r * 0.12, y0], [R, y0 + r * 0.1]];
  // Trois sillons de sertissage.
  for (let k = 0; k < 3; k++) {
    const yc = y0 + sleeve * (0.3 + k * 0.22);
    prof.push([R, yc - r * 0.22], [R - r * 0.07, yc - r * 0.1], [R - r * 0.07, yc + r * 0.1], [R, yc + r * 0.22]);
  }
  prof.push([R, y1 - r * 0.3], [r * 1.02, y1], [0, y1]);
  return mergeGeo([
    revolveGeo(prof, 16),
    place(hexGeo(r * 2.5, nutH), [0, nutH / 2, 0]),
  ]);
}

/** Presse-étoupe de câble le long de +Y : écrou six-pans puis dôme serrant le câble. */
function glandGeo(r) {
  const h = r * 1.6;
  return mergeGeo([
    place(hexGeo(r * 3.6, h * 0.45), [0, h * 0.225, 0]),
    revolveGeo([[0, h * 0.45], [r * 1.6, h * 0.45], [r * 1.55, h * 0.9], [r * 1.25, h * 1.3], [r * 1.05, h * 1.6], [0, h * 1.6]], 16),
  ]);
}

/**
 * Tube suivant une suite de points (boyau, tuyau, cadre tubulaire).
 * ends : 'ferrule' (embouts sertis aux deux bouts), 'gland' (presse-étoupes)
 * ou 'none' ; par défaut des embouts sertis pour les matériaux 'hose' / 'rubber'.
 * Les embouts forment un maillage enfant (endMaterial) qui suit le tube.
 */
export function tube(points, r, material = 'black', { seg = 48, closed = false, tension = 0.5, sharp = false, ends, endMaterial = 'steel', radial = 12 } = {}) {
  const pts = points.map(V);
  let curve;
  if (sharp) {
    curve = new THREE.CurvePath();
    for (let i = 0; i < pts.length - 1; i++) curve.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
  } else {
    curve = new THREE.CatmullRomCurve3(pts, closed, 'catmullrom', tension);
  }
  const m = mesh(new THREE.TubeGeometry(curve, seg, r, radial, closed), material);
  const kind = ends ?? ((material === 'hose' || material === 'rubber') && !sharp && !closed && r >= 0.003 ? 'ferrule' : 'none');
  if (kind !== 'none' && !closed && pts.length > 1) addEnds(m, curve, r, kind, endMaterial);
  return m;
}

/** Embouts (sertis ou presse-étoupes) aux deux bouts d'une courbe, en maillage enfant. */
function addEnds(m, curve, r, kind, endMaterial) {
  const Y = new THREE.Vector3(0, 1, 0);
  const parts = [];
  for (const [t, sgn] of [[0, 1], [1, -1]]) {
    const g = kind === 'gland' ? glandGeo(r) : ferruleGeo(r);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Y, curve.getTangentAt(t).multiplyScalar(sgn).normalize()));
    g.translate(...curve.getPointAt(t).toArray());
    parts.push(g);
  }
  const e = mesh(mergeGeo(parts), kind === 'gland' && endMaterial === 'steel' ? 'black' : endMaterial);
  e.userData.isTubeEnds = true;
  m.add(e);
  return m;
}

/** Flexible hydraulique : courbe centripète (sans boucle) entre ses raccords, embouts sertis. */
export function hose(points, r, { material = 'hose', endMaterial = 'steel' } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(V), false, 'centripetal');
  const n = Math.max(12, Math.min(120, Math.round(curve.getLength() / (r * 1.6))));
  const geo = new THREE.TubeGeometry(curve, n, r, 14, false);
  geo.userData.edgeAngle = 70;
  return addEnds(mesh(geo, material), curve, r, 'ferrule', endMaterial);
}

/** Câble électrique souple avec presse-étoupe à chaque bout. */
export function cable(points, r, { material = 'black', seg = 32 } = {}) {
  return tube(points, r, material, { seg, ends: 'gland', endMaterial: 'black', radial: 8, tension: 0.4 });
}

/**
 * Cordon de soudure le long d'une ligne brisée [[x,y,z], ...] (angle entre
 * deux tôles) : bourrelet à écailles régulières, cratères aux extrémités.
 * size = largeur du cordon. Peint comme la pièce par défaut.
 */
export function weld(points, size = 0.006, material = 'red', { closed = false } = {}) {
  const pts = points.map(V);
  const path = new THREE.CurvePath();
  const n = pts.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) path.add(new THREE.LineCurve3(pts[i], pts[(i + 1) % n]));
  const L = path.getLength();
  const r = size / 2;
  const seg = Math.max(4, Math.min(400, Math.round(L / (r * 1.25))));
  const radial = 6;
  const geo = new THREE.TubeGeometry(path, seg, r, radial, closed);
  // Écailles : rayon modulé d'un anneau à l'autre ; extrémités effilées.
  const p = geo.attributes.position;
  const c = new THREE.Vector3(), v = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) {
    path.getPointAt(Math.min(i / seg, 1), c);
    let k = 0.9 + 0.14 * Math.abs(Math.sin(i * 1.15));
    if (!closed) k *= Math.min(1, 0.35 + Math.min(i, seg - i) * 0.33);
    for (let j = 0; j <= radial; j++) {
      const idx = i * (radial + 1) + j;
      v.fromBufferAttribute(p, idx).sub(c).multiplyScalar(k).add(c);
      p.setXYZ(idx, v.x, v.y, v.z);
    }
  }
  geo.computeVertexNormals();
  geo.userData.edgeAngle = 75; // pas de contours sur les écailles
  return mesh(geo, material);
}

/** Cordon de soudure circulaire (tube sur une tôle, bossage) de rayon R, plan perpendiculaire à l'axe. */
export function weldRing(R, size = 0.006, material = 'red', { axis = 'y', pos } = {}) {
  const n = Math.max(12, Math.min(64, Math.round((R * 2 * Math.PI) / (size * 1.2))));
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([Math.cos(a) * R, 0, Math.sin(a) * R]);
  }
  const m = weld(pts, size, material, { closed: true });
  orient(m, axis);
  const g = group(m);
  if (pos) g.position.copy(V(pos));
  return g;
}

/** Barre droite entre deux points (cylindre orienté). */
export function rod(a, b, r, material = 'steel', seg = 16) {
  const A = V(a), B = V(b);
  const len = A.distanceTo(B);
  const m = mesh(cylGeo(r, len, { seg }), material);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return m;
}

/** Profil 2D extrudé. points : [[x, y], ...] dans le plan XY, épaisseur selon Z. */
export function extrude(points, depth, material = 'red', { holes = [], bevel = 0, center = true } = {}) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  holes.forEach(([x, y, r]) => {
    const p = new THREE.Path();
    p.absarc(x, y, r, 0, Math.PI * 2, true);
    shape.holes.push(p);
  });
  let geo;
  const mb = microBevel(depth);
  if (bevel > 0 || !mb) {
    geo = new THREE.ExtrudeGeometry(shape, {
      depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 20,
    });
    if (center) geo.translate(0, 0, -depth / 2);
  } else {
    // Arêtes cassées (≈1 mm) sans changer l'encombrement : un filet de lumière
    // le long des bords, comme une tôle découpée et ébavurée.
    geo = new THREE.ExtrudeGeometry(shape, {
      depth: depth - 2 * mb, bevelEnabled: true, bevelSize: mb, bevelThickness: mb, bevelOffset: -mb, bevelSegments: 1, curveSegments: 20,
    });
    geo.translate(0, 0, center ? -(depth - 2 * mb) / 2 : mb);
  }
  return mesh(geo, material);
}

/** Chanfrein d'arête des tôles et profils extrudés selon l'épaisseur (0 : aucun). */
function microBevel(t) {
  const b = Math.min(t * 0.16, 0.0016);
  return b >= 0.0005 ? b : 0;
}

/** Plaque rectangulaire (dans le plan XZ) percée de trous ronds [x, z, r] et de découpes [x, z, w, d]. */
export function plate(w, d, t, material = 'red', { holes = [], cutouts = [], r = 0 } = {}) {
  const shape = roundedRectShape(w, d, r);
  holes.forEach(([x, z, hr]) => {
    const p = new THREE.Path();
    p.absarc(x, -z, hr, 0, Math.PI * 2, true);
    shape.holes.push(p);
  });
  cutouts.forEach(([x, z, cw, cd]) => {
    const p = new THREE.Path();
    p.moveTo(x - cw / 2, -z - cd / 2);
    p.lineTo(x - cw / 2, -z + cd / 2);
    p.lineTo(x + cw / 2, -z + cd / 2);
    p.lineTo(x + cw / 2, -z - cd / 2);
    p.closePath();
    shape.holes.push(p);
  });
  const mb = microBevel(t);
  const geo = mb
    ? new THREE.ExtrudeGeometry(shape, { depth: t - 2 * mb, bevelEnabled: true, bevelSize: mb, bevelThickness: mb, bevelOffset: -mb, bevelSegments: 1, curveSegments: 16 })
    : new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: 16 });
  geo.translate(0, 0, -(t - 2 * mb) / 2);
  geo.rotateX(-Math.PI / 2);
  return mesh(geo, material);
}

function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  if (r) s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  if (r) s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  if (r) s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  if (r) s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Roue dentée (pignon, barbotin). Axe de rotation selon l'axe donné. */
export function gear(rRoot, rTip, teeth, thick, material = 'black', { axis = 'z', hole = 0, pos } = {}) {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts = [
      [rRoot, a], [rTip, a + step * 0.22], [rTip, a + step * 0.48], [rRoot, a + step * 0.7],
    ];
    pts.forEach(([r, ang], k) => {
      const x = Math.cos(ang) * r, y = Math.sin(ang) * r;
      if (i === 0 && k === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    });
  }
  shape.closePath();
  if (hole) {
    const p = new THREE.Path();
    p.absarc(0, 0, hole, 0, Math.PI * 2, true);
    shape.holes.push(p);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false });
  geo.translate(0, 0, -thick / 2);
  const m = mesh(geo, material);
  if (axis === 'x') m.rotation.y = Math.PI / 2;
  else if (axis === 'y') m.rotation.x = Math.PI / 2;
  const g = group(m);
  if (pos) g.position.copy(V(pos));
  return g;
}

/** Écrou hexagonal (surplat size, hauteur h) : chanfreins 30° et trou taraudé. */
export function nut(size, h, material = 'steel', { axis = 'y', pos } = {}) {
  const m = mesh(hexGeo(size, h, { hole: size * 0.29 }), material);
  orient(m, axis);
  const g = group(m);
  if (pos) g.position.copy(V(pos));
  return g;
}

/**
 * Boulon à tête hexagonale le long de -axe (tête en haut à l'origine).
 * washer : rondelle plate sous la tête (la tête est alors relevée de son épaisseur).
 */
export function bolt(d, len, material = 'steel', { axis = 'y', head = 'hex', pos, washer = false } = {}) {
  const inner = group(mesh(boltGeo(d, len, head, washer), material));
  orient(inner, axis);
  const g = group(inner);
  if (pos) g.position.copy(V(pos));
  return g;
}

/** Épaisseur de la rondelle d'un boulon de diamètre d. */
const washerT = (d) => Math.max(d * 0.16, 0.0012);

/** Géométrie d'un boulon (tête à l'origine, tige vers -Y), rondelle optionnelle. */
function boltGeo(d, len, head = 'hex', washer = false) {
  const geo = boltCore(d, len, head);
  if (!washer) return geo;
  const t = washerT(d);
  geo.translate(0, t, 0);
  return mergeGeo([geo, place(ringGeo(d * 1.05, d * 0.54, t, 16), [0, t / 2, 0])]);
}

/**
 * Jeu de boulons (têtes hexagonales + rondelles) aux positions données, en un
 * seul maillage. Têtes vers +axe, posées sur le plan des positions.
 */
export function boltSet(points, d, len, material = 'steel', { axis = 'y', head = 'hex', washer = true } = {}) {
  const src = boltGeo(d, len, head, washer);
  alongAxis(src, axis);
  return mesh(mergeGeo(points.map((p) => src.clone().translate(...V(p).toArray()))), material);
}

/**
 * Couronne de n boulons (rayon R) dans le plan perpendiculaire à l'axe, têtes
 * vers +axe, en un seul maillage. phase : angle du premier boulon (rad).
 */
export function boltCircle(n, R, d, len, material = 'steel', { axis = 'y', pos, phase = 0, head = 'hex', washer = true } = {}) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = phase + (i / n) * Math.PI * 2;
    pts.push([Math.cos(a) * R, 0, Math.sin(a) * R]);
  }
  const m = boltSet(pts, d, len, material, { head, washer });
  orient(m, axis);
  const g = group(m);
  if (pos) g.position.copy(V(pos));
  return g;
}

/**
 * Goujon fileté sortant de la surface selon +axe (pied à l'origine), avec
 * rondelle et écrou chanfreiné ; le filet dépasse de l'écrou.
 */
export function stud(d, len, material = 'steel', { axis = 'y', pos, nut: withNut = true, washer = true } = {}) {
  const r = d / 2;
  const t = washer ? washerT(d) : 0;
  const nh = d * 0.8;
  // Filet du pied vers le bout, chanfrein au bout libre (profil retourné).
  const thread = threadProfile(r, 0, len, { pitch: d * 0.2, maxTurns: 12 }).map(([x, y]) => [x, len - y]).reverse();
  const geos = [revolveGeo([[0, 0], ...thread, [0, len]], 10)];
  if (washer) geos.push(place(ringGeo(d * 1.05, d * 0.54, t, 16), [0, t / 2, 0]));
  if (withNut) geos.push(place(hexGeo(d * 1.6, nh, { hole: d * 0.4 }), [0, t + nh / 2, 0]));
  const m = mesh(mergeGeo(geos), material);
  orient(m, axis);
  const g = group(m);
  if (pos) g.position.copy(V(pos));
  return g;
}

/**
 * Plaque signalétique générique (sans marque) : alu brossé, rebord, lignes
 * de texte suggérées et quatre rivets. Face selon +Z, centrée, épaisseur 1,5 mm.
 */
export function nameplate(w, h, { material = 'zinc', ink = 'black' } = {}) {
  const t = 0.0015;
  const g = new THREE.Group();
  g.add(solid(material, place(boxGeo(w, h, t, Math.min(w, h) * 0.06), [0, 0, t / 2])));
  // Texte suggéré : lignes de « mots » de longueurs variées (titre plus
  // haut), cadre imprimé en retrait du bord.
  const lines = [];
  const z = t + 0.0004;
  const n = Math.max(2, Math.min(6, Math.floor(h / 0.012)));
  const th = Math.min(h * 0.05, 0.0028);
  let s = 11;
  for (let i = 0; i < n; i++) {
    const y = h * 0.24 - (i * h * 0.48) / Math.max(1, n - 1);
    const x1 = -w * 0.36 + w * (i === 0 ? 0.5 : 0.4 + ((i * 37) % 32) / 100);
    const hh = i === 0 ? th * 1.4 : th;
    for (let x = -w * 0.36; x < x1 - hh;) {
      s = (s * 16807) % 2147483647;
      const ww = Math.min(w * (0.04 + ((s % 1000) / 1000) * 0.12), x1 - x);
      lines.push(place(new THREE.PlaneGeometry(ww, hh), [x + ww / 2, y, z]));
      x += ww + hh * 1.3;
    }
  }
  const rv = Math.min(w, h) * 0.05;
  const fw = w - rv * 8, fh = h - rv * 8, ft = Math.max(0.0006, th * 0.25);
  for (const sy of [-1, 1]) lines.push(place(new THREE.PlaneGeometry(fw, ft), [0, sy * fh / 2, z]));
  for (const sx of [-1, 1]) lines.push(place(new THREE.PlaneGeometry(ft, fh), [sx * fw / 2, 0, z]));
  g.add(solid(ink, lines));
  const rivets = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    rivets.push(place(new THREE.SphereGeometry(rv, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2), [sx * (w / 2 - rv * 2.2), sy * (h / 2 - rv * 2.2), t]));
  }
  g.add(solid('steel', rivets));
  return g;
}

function boltCore(d, len, head) {
  const hh = d * 0.65;
  let headGeo;
  if (head === 'square') {
    headGeo = revolveGeo([[0, 0], [d * 0.8 * Math.SQRT2, 0], [d * 0.8 * Math.SQRT2, hh * 0.8], [d * 0.95, hh], [0, hh]], 4, true);
    headGeo.rotateY(Math.PI / 4);
  } else if (head === 'button') {
    headGeo = new THREE.SphereGeometry(d * 0.95, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  } else {
    const R = d * 0.95, c = R * 0.16;
    // Tête hexagonale chanfreinée sur une portée ronde.
    headGeo = mergeGeo([
      revolveGeo([[0, hh * 0.1], [R, hh * 0.1], [R, hh - c * TAN30], [R - c, hh], [0, hh]], 6, true),
      revolveGeo([[0, 0], [R * COS30 * 0.98, 0], [R * COS30 * 0.98, hh * 0.1], [0, hh * 0.1]], 12),
    ]);
  }
  const r = d / 2;
  // Tige : lisse sous la tête, filetée vers le bout (filet suggéré si la vis est visible).
  const threadLen = Math.min(len * 0.6, Math.max(d * 2.5, len * 0.4));
  const prof = d >= 0.012 && len > d * 1.5
    ? [[0, -len], ...threadProfile(r, -len, -len + threadLen, { pitch: d * 0.2, maxTurns: 7 }), [r, 0], [0, 0]]
    : cylProfile(r, r, len).map(([x, y]) => [x, y - len / 2]);
  return len > 0 ? mergeGeo([headGeo, revolveGeo(prof, 10)]) : mergeGeo([headGeo]);
}

/** Ressort hélicoïdal le long de l'axe. */
export function spring(r, wire, len, turns, material = 'black', { axis = 'y', pos } = {}) {
  const pts = [];
  const n = Math.max(24, Math.round(turns * 24));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = t * turns * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * r, t * len - len / 2, Math.sin(a) * r));
  }
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, wire, 8, false);
  geo.userData.edgeAngle = 60; // pas de contours le long du fil
  const m = mesh(geo, material);
  orient(m, axis);
  const g = group(m);
  if (pos) g.position.copy(V(pos));
  return g;
}

/**
 * Vérin hydraulique le long de +X, de l'œil arrière (x=0) à l'œil de tige (x=len).
 * Retourne un Group.
 */
export function hydCylinder(len, bore, { material = 'red', rodR, ext = 0.45, eyes = 'eye', axis = 'x' } = {}) {
  const r = bore / 2;
  rodR = rodR ?? r * 0.55;
  const barrelLen = len * (1 - ext);
  const g = new THREE.Group();
  const X = (geo) => alongAxis(geo, 'x');
  // Fût creux, fond fermé, presse-étoupe percé, piston et tige à l'intérieur.
  g.add(at(shell(r, r * 0.8, barrelLen - r, material, { axis: 'x' }), [barrelLen / 2, 0, 0]));
  const body = [
    place(X(cylGeo(r * 1.12, r * 0.5)), [r * 0.25, 0, 0]),
    place(X(ringGeo(r * 1.12, rodR * 1.04, r * 0.5, 32)), [barrelLen - r * 0.25, 0, 0]),
    // Cordons de soudure fond / tête.
    place(X(ringGeo(r * 1.03, r * 0.9, r * 0.08, 32)), [r * 0.54, 0, 0]),
    place(X(ringGeo(r * 1.03, r * 0.9, r * 0.08, 32)), [barrelLen - r * 0.54, 0, 0]),
  ];
  // Bossages des orifices d'alimentation (côté fond et côté tige), raccords sur le dessus.
  const steel = [];
  const ports = barrelLen > r * 3.2 ? [r * 1.05, barrelLen - r * 1.1] : [];
  for (const px of ports) {
    body.push(place(boxGeo(r * 0.55, r * 0.36, r * 0.55, r * 0.06), [px, r * 1.0, 0]));
    steel.push(place(hexGeo(r * 0.34, r * 0.14), [px, r * 1.25, 0]));
    steel.push(place(cylGeo(r * 0.12, r * 0.16), [px, r * 1.38, 0]));
  }
  const dark = [];
  const pistonX = barrelLen * 0.42;
  dark.push(place(X(cylGeo(r * 0.79, r * 0.5)), [pistonX, 0, 0]));
  const rubber = [place(new THREE.TorusGeometry(r * 0.79, r * 0.05, 8, 32).rotateY(Math.PI / 2), [pistonX, 0, 0])];
  // Racleur de tige à la sortie du presse-étoupe.
  rubber.push(place(X(ringGeo(rodR * 1.25, rodR * 1.0, r * 0.06, 24)), [barrelLen + r * 0.03, 0, 0]));
  const rodLen = len - pistonX;
  g.add(at(cyl(rodR, rodLen, 'chrome', { axis: 'x' }), [pistonX + rodLen / 2, 0, 0]));
  g.userData.hasInterior = true;
  if (eyes === 'eye') {
    body.push(place(alongAxis(ringGeo(r * 0.75, r * 0.32, r * 0.7, 28), 'z'), [-r * 0.6, 0, 0]));
    dark.push(place(alongAxis(ringGeo(r * 0.33, r * 0.22, r * 0.72, 20), 'z'), [-r * 0.6, 0, 0]));
    // Œil de tige vissé + contre-écrou.
    dark.push(place(alongAxis(ringGeo(rodR * 1.5, rodR * 0.6, rodR * 1.3, 28), 'z'), [len + rodR * 0.9, 0, 0]));
    dark.push(place(X(hexGeo(rodR * 1.7, rodR * 0.45)), [len - rodR * 0.95, 0, 0]));
    steel.push(place(alongAxis(ringGeo(rodR * 0.62, rodR * 0.42, rodR * 1.34, 20), 'z'), [len + rodR * 0.9, 0, 0]));
  } else if (eyes === 'clevis') {
    body.push(place(boxGeo(r * 0.6, r * 1.2, r * 1.6), [-r * 0.3, 0, 0]));
    const fx = len + rodR * 1.2;
    dark.push(place(boxGeo(rodR * 3, rodR * 2.2, rodR * 0.6), [fx, 0, rodR * 0.9]));
    dark.push(place(boxGeo(rodR * 3, rodR * 2.2, rodR * 0.6), [fx, 0, -rodR * 0.9]));
  }
  g.add(solid(material, body), solid('darkSteel', dark), solid('rubber', rubber));
  if (steel.length) g.add(solid('steel', steel));
  if (axis !== 'x') {
    const outer = new THREE.Group();
    outer.add(g);
    if (axis === 'y') g.rotation.z = Math.PI / 2;
    else if (axis === 'z') g.rotation.y = -Math.PI / 2;
    else if (axis === '-x') g.rotation.y = Math.PI;
    return outer;
  }
  return g;
}

/** Vanne à bille : corps + levier (jaune comme sur les dessins). Axe de passage selon l'axe donné. */
export function ballValve(size, material = 'brass', { axis = 'x', handle = 'safety' } = {}) {
  const s = size, r = s / 2;
  const X = (geo) => alongAxis(geo, 'x');
  const g = new THREE.Group();
  // Corps : boisseau renflé, embouts filetés, écrous hexagonaux, bossage de tige.
  g.add(solid(material,
    X(revolveGeo([[0, -0.47 * s], [r * 1.2, -0.47 * s], [r * 1.42, -0.32 * s], [r * 1.45, 0], [r * 1.42, 0.32 * s], [r * 1.2, 0.47 * s], [0, 0.47 * s]], 20)),
    X(cylGeo(r * 1.15, s * 1.9)),
    place(X(hexGeo(s * 1.05, s * 0.3)), [s * 1.0, 0, 0]),
    place(X(hexGeo(s * 1.05, s * 0.3)), [-s * 1.0, 0, 0]),
    place(cylGeo(r * 0.55, s * 0.22), [0, s * 0.74, 0]),
  ));
  // Tige et écrou de manœuvre.
  g.add(solid('steel',
    place(cylGeo(r * 0.35, s * 0.7, { seg: 16 }), [0, r * 1.6, 0]),
    place(hexGeo(s * 0.36, s * 0.12), [0, s * 1.09, 0]),
  ));
  // Levier plat avec poignée gainée.
  g.add(solid(handle,
    place(boxGeo(s * 2.6, s * 0.1, s * 0.3, s * 0.03), [s * 1.1, r * 1.95, 0]),
    place(new THREE.BoxGeometry(s * 0.5, s * 0.1, s * 0.36), [0, r * 1.95, 0]),
    place(boxGeo(s * 1.0, s * 0.16, s * 0.38, s * 0.07), [s * 1.88, r * 1.95, 0]),
  ));
  return axisWrap(g, axis);
}

function axisWrap(g, axis) {
  if (axis === 'x') return g;
  const outer = new THREE.Group();
  outer.add(g);
  if (axis === 'y') g.rotation.z = Math.PI / 2;
  else if (axis === 'z') g.rotation.y = Math.PI / 2;
  return outer;
}

/** Embout fileté avec cône d'étanchéité 37° (JIC), de y0 à y1 le long de +Y, rayon de base rb. */
function nippleProfile(rb, y0, y1, neck = 0.18) {
  const L = y1 - y0;
  const yThread = y0 + L * neck;
  const yCone = y1 - L * 0.22;
  return [
    [0, y0], [rb * 0.82, y0], [rb * 0.82, yThread],
    ...threadProfile(rb, yThread, yCone, { pitch: rb * 0.3, maxTurns: 6, chamferBottom: false }),
    [rb * 0.66, y1], [rb * 0.42, y1], [rb * 0.42, y1 - L * 0.04], [0, y1 - L * 0.04],
  ];
}

/** Raccord hydraulique simple (hexagone + embout), le long de +Y. */
export function fitting(d, len, material = 'steel', { axis = 'y', tee = false, elbow = false } = {}) {
  const g = new THREE.Group();
  const L = len;
  const geos = [
    // Six-pans central.
    hexGeo(d * 1.25, L * 0.28),
    // Embout supérieur fileté à cône 37°.
    revolveGeo(nippleProfile(d * 0.42, L * 0.12, elbow ? L * 0.7 : L * 0.795), 10),
    // Queue inférieure : filetage conique (NPT / BSPT).
    revolveGeo([[0, -L * 0.65],
      ...threadProfile(d * 0.36, -L * 0.65, -L * 0.18, { r1: d * 0.4, pitch: d * 0.12, maxTurns: 7 }),
      [d * 0.32, -L * 0.18], [d * 0.32, -L * 0.12], [0, -L * 0.12]], 10),
  ];
  if (tee) {
    geos.push(place(boxGeo(d * 0.95, d * 0.95, d * 0.95, d * 0.12), [0, L * 0.3, 0]));
    geos.push(place(alongAxis(revolveGeo(nippleProfile(d * 0.4, d * 0.3, L * 0.65), 10), 'x'), [0, L * 0.3, 0]));
  }
  if (elbow) {
    geos.push(place(boxGeo(d * 0.95, d * 0.95, d * 0.95, d * 0.2), [0, L * 0.7, 0]));
    geos.push(place(alongAxis(revolveGeo(nippleProfile(d * 0.4, d * 0.3, L * 0.55), 10), 'z'), [0, L * 0.7, 0]));
  }
  g.add(solid(material, geos));
  return axis === 'y' ? g : axisWrapY(g, axis);
}

function axisWrapY(g, axis) {
  const outer = new THREE.Group();
  outer.add(g);
  if (axis === 'x') g.rotation.z = -Math.PI / 2;
  else if (axis === 'z') g.rotation.x = Math.PI / 2;
  else if (axis === '-y') g.rotation.x = Math.PI;
  return outer;
}

/** Manomètre : boîtier + cadran blanc, face selon +axe. */
export function gauge(r, { axis = 'z', face = 'white' } = {}) {
  const g = new THREE.Group();
  const Z = (geo) => alongAxis(geo, 'z');
  // Boîtier inox embouti avec lunette sertie.
  g.add(solid('chrome', Z(revolveGeo([
    [0, -r * 0.275], [r * 0.9, -r * 0.275], [r * 0.98, -r * 0.2], [r * 0.98, r * 0.2],
    [r, r * 0.22], [r, r * 0.29], [r * 0.95, r * 0.33], [r * 0.88, r * 0.33], [r * 0.87, r * 0.27], [0, r * 0.27],
  ], 24))));
  g.add(at(cyl(r * 0.86, r * 0.05, face, { axis: 'z' }), [0, 0, r * 0.28]));
  // Graduations sur 270°, moyeu, aiguille.
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const a = (-135 + i * 27) * (Math.PI / 180);
    const major = i % 2 === 0;
    const l = r * (major ? 0.16 : 0.08);
    const rr = r * 0.74 - l / 2;
    ticks.push(place(new THREE.BoxGeometry(r * (major ? 0.035 : 0.018), l, r * 0.01), [Math.sin(a) * rr, Math.cos(a) * rr, r * 0.31], [0, 0, -a]));
  }
  ticks.push(place(Z(cylGeo(r * 0.07, r * 0.04, { seg: 16 })), [0, 0, r * 0.33]));
  g.add(solid('black', ticks));
  g.add(solid('red', place(new THREE.BoxGeometry(r * 0.045, r * 0.7, r * 0.012), [Math.sin(0.6) * r * 0.25, Math.cos(0.6) * r * 0.25, r * 0.322], [0, 0, -0.6])));
  // Raccord inférieur : six-pans + queue filetée.
  g.add(solid('brass',
    place(hexGeo(r * 0.42, r * 0.2), [0, -r * 1.0, 0]),
    revolveGeo([[0, -r * 1.4], ...threadProfile(r * 0.17, -r * 1.4, -r * 1.1, { maxTurns: 3 }), [r * 0.17, -r * 0.9], [0, -r * 0.9]], 12),
  ));
  return axisWrapZ(g, axis);
}

function axisWrapZ(g, axis) {
  if (axis === 'z') return g;
  const outer = new THREE.Group();
  outer.add(g);
  if (axis === 'x') g.rotation.y = Math.PI / 2;
  else if (axis === '-x') g.rotation.y = -Math.PI / 2;
  else if (axis === '-z') g.rotation.y = Math.PI;
  else if (axis === 'y') g.rotation.x = -Math.PI / 2;
  return outer;
}

/** Filtre (tête + cuve), cuve vers le bas, hauteur h. */
export function filterCanister(r, h, material = 'black', { head = 'darkSteel' } = {}) {
  const g = new THREE.Group();
  const X = (geo) => alongAxis(geo, 'x');
  // Tête usinée : orifices entrée / sortie sur les côtés, indicateur de colmatage en façade.
  g.add(solid(head,
    place(boxGeo(r * 2.4, r * 0.9, r * 2.0, r * 0.15), [0, -r * 0.45, 0]),
    place(X(cylGeo(r * 0.36, r * 2.52)), [0, -r * 0.45, 0]),
    place(alongAxis(cylGeo(r * 0.22, r * 2.1), 'z'), [0, -r * 0.45, 0]),
  ));
  g.add(solid('steel',
    place(X(hexGeo(r * 0.42, r * 0.1)), [r * 1.31, -r * 0.45, 0]),
    place(X(hexGeo(r * 0.42, r * 0.1)), [-r * 1.31, -r * 0.45, 0]),
    place(alongAxis(cylGeo(r * 0.14, r * 0.12), 'z'), [0, -r * 0.45, r * 1.08]),
  ));
  const bodyLen = h - r * 1.3;
  g.add(at(shell(r, r * 0.86, bodyLen, material), [0, -r * 0.9 - bodyLen / 2, 0]));
  // Collerette de vissage, fond bombé et six-pans de démontage.
  g.add(solid(material,
    place(ringGeo(r * 1.05, r * 0.86, r * 0.1, 32), [0, -r * 0.95, 0]),
    place(cylGeo(r * 0.85, r * 0.28, { r2: r }), [0, -h + r * 0.26, 0]),
    place(hexGeo(r * 0.5, r * 0.12, { top: false }), [0, -h + r * 0.06, 0]),
  ));
  // Élément filtrant plissé (visible en coupe).
  const pleats = 20, ro = r * 0.78, ri = r * 0.6;
  const pts = [];
  for (let i = 0; i < pleats * 2; i++) {
    const a = (i / (pleats * 2)) * Math.PI * 2;
    const rr = i % 2 ? ri : ro;
    pts.push(new THREE.Vector2(Math.cos(a) * rr, Math.sin(a) * rr));
  }
  const elemLen = bodyLen * 0.88;
  const elemShape = new THREE.Shape(pts);
  const hole = new THREE.Path();
  hole.absarc(0, 0, r * 0.4, 0, Math.PI * 2, true);
  elemShape.holes.push(hole);
  const elem = new THREE.ExtrudeGeometry(elemShape, { depth: elemLen, bevelEnabled: false, curveSegments: 12 });
  elem.translate(0, 0, -elemLen / 2);
  elem.rotateX(Math.PI / 2);
  const elemY = -r * 0.9 - bodyLen / 2;
  g.add(solid('cream', place(elem, [0, elemY, 0])));
  g.add(solid('steel',
    place(ringGeo(r * 0.8, r * 0.4, r * 0.05, 20), [0, elemY + elemLen / 2 + r * 0.025, 0]),
    place(ringGeo(r * 0.8, r * 0.4, r * 0.05, 20), [0, elemY - elemLen / 2 - r * 0.025, 0]),
  ));
  g.userData.hasInterior = true;
  return g;
}

/** Banc de distributeurs (sections empilées selon X) avec leviers. */
export function valveBank(n, { sw = 0.05, h = 0.16, d = 0.12, levers = true, material = 'black' } = {}) {
  const g = new THREE.Group();
  const total = n * sw + 0.08;
  const Z = (geo) => alongAxis(geo, 'z');
  const X = (geo) => alongAxis(geo, 'x');
  const body = [
    place(boxGeo(0.04, h * 1.1, d * 1.05, 0.004), [-total / 2 + 0.02, 0, 0]),
    place(boxGeo(0.04, h * 1.1, d * 1.05, 0.004), [total / 2 - 0.02, 0, 0]),
  ];
  const caps = [], steel = [], knobs = [];
  const capR = Math.min(sw * 0.3, h * 0.16);
  const plug = Math.min(sw * 0.42, d * 0.22, 0.03);
  for (let i = 0; i < n; i++) {
    const x = -total / 2 + 0.04 + sw * (i + 0.5);
    body.push(place(boxGeo(sw * 0.92, h, d, 0.004), [x, 0, 0]));
    // Chapeau de tiroir (ressort de rappel) côté face, embout côté levier.
    caps.push(place(boxGeo(sw * 0.74, h * 0.36, d * 0.05, 0.002), [x, h * 0.2, d * 0.525]));
    caps.push(place(Z(cylGeo(capR, d * 0.2)), [x, h * 0.2, d * 0.65]));
    caps.push(place(Z(cylGeo(capR * 0.55, d * 0.12, { seg: 16 })), [x, h * 0.2, -d * 0.5]));
    // Orifices de travail A / B (bouchons six-pans) sur le dessus.
    for (const z of [-d * 0.22, d * 0.22]) steel.push(place(hexGeo(plug, plug * 0.4), [x, h / 2 + plug * 0.2, z]));
    if (levers) {
      // Levier incliné vers l'arrière, pommeau enfilé sur son extrémité.
      const a = -0.25, ly = Math.cos(a), lz = Math.sin(a);
      const yTop = h * 0.925 + h * 0.425 * ly, zTop = -d * 0.2 + h * 0.425 * lz;
      steel.push(place(cylGeo(0.006, h * 0.85, { seg: 12 }), [x, h * 0.925, -d * 0.2], [a, 0, 0]));
      knobs.push(place(revolveGeo([[0, -0.02], [0.009, -0.02], [0.014, -0.008], [0.015, 0.006], [0.011, 0.018], [0, 0.021]], 16), [x, yTop + 0.012 * ly, zTop + 0.012 * lz], [a, 0, 0]));
    }
  }
  // Tirants et écrous sur les flasques d'extrémité, orifices P / T.
  for (const sx of [-1, 1]) {
    for (const [y, z] of [[h * 0.32, d * 0.3], [-h * 0.32, d * 0.3], [h * 0.32, -d * 0.3], [-h * 0.32, -d * 0.3]]) {
      steel.push(place(X(hexGeo(0.016, 0.006)), [sx * (total / 2 + 0.003), y, z]));
    }
    steel.push(place(X(hexGeo(plug * 1.1, 0.008)), [sx * (total / 2 + 0.004), -h * 0.05, 0]));
  }
  g.add(solid(material, body), solid('darkSteel', caps), solid('steel', steel));
  if (knobs.length) g.add(solid('black', knobs));
  return g;
}

/** Boîtier électrique avec couvercle. */
export function enclosure(w, h, d, material = 'grey') {
  const g = new THREE.Group();
  // Caisson + porte (joint visible au pourtour).
  g.add(solid(material,
    boxGeo(w, h, d, 0.01),
    place(boxGeo(w * 0.94, h * 0.94, 0.008, 0.004), [0, 0, d / 2 + 0.004]),
  ));
  // Vis de porte, charnières côté gauche.
  const steel = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    steel.push(place(alongAxis(cylGeo(0.008, 0.01, { seg: 16 }), 'z'), [sx * (w / 2 - 0.03), sy * (h / 2 - 0.03), d / 2 + 0.01]));
  }
  const hl = Math.min(h * 0.14, 0.06);
  for (const sy of [-1, 1]) {
    steel.push(place(cylGeo(0.0055, hl, { seg: 12 }), [-w * 0.47 - 0.004, sy * h * 0.3, d / 2 + 0.006]));
  }
  g.add(solid('steel', steel));
  // Serrure quart de tour côté droit, presse-étoupes sous le caisson.
  const blk = [place(alongAxis(cylGeo(0.011, 0.008, { seg: 16 }), 'z'), [w * 0.4, 0, d / 2 + 0.012])];
  blk.push(place(new THREE.BoxGeometry(0.014, 0.004, 0.003), [w * 0.4, 0, d / 2 + 0.017]));
  const ng = Math.max(1, Math.min(3, Math.floor(w / 0.09)));
  const gs = Math.min(0.02, d * 0.3, w * 0.15);
  for (let i = 0; i < ng; i++) {
    const x = (i - (ng - 1) / 2) * (w / (ng + 1));
    blk.push(place(hexGeo(gs, gs * 0.3), [x, -h / 2 - gs * 0.15, 0]));
    blk.push(place(revolveGeo([[0, 0], [gs * 0.42, 0], [gs * 0.42, -gs * 0.14], [gs * 0.3, -gs * 0.3], [0, -gs * 0.3]], 14), [x, -h / 2 - gs * 0.3, 0]));
  }
  g.add(solid('black', blk));
  return g;
}

/** Fusionne les géométries d'un groupe en un seul mesh (objets répétés nombreux). */
export function merged(objects, material) {
  const geos = [];
  objects.forEach((o) => {
    o.updateMatrixWorld(true);
    o.traverse((c) => {
      if (c.isMesh) {
        const g = c.geometry.clone();
        g.applyMatrix4(c.matrixWorld);
        geos.push(g.index ? g.toNonIndexed() : g);
      }
    });
  });
  geos.forEach((g) => { Object.keys(g.attributes).forEach((k) => { if (!['position', 'normal'].includes(k)) g.deleteAttribute(k); }); });
  return mesh(mergeGeometries(geos, false), material);
}

/** Répète un objet sur une liste de positions (instances groupées). */
export function repeat(factory, positions) {
  return group(positions.map((p, i) => at(factory(i), p)));
}

// ------------------------------------------------------------------ contours

const edgeCache = new WeakMap();

/**
 * Arêtes vives d'une géométrie (angle entre faces > seuil, bords libres),
 * en paires de points [x0, y0, z0, x1, y1, z1, ...]. Les sommets confondus
 * sont soudés (0,05 mm). Résultat mis en cache par géométrie.
 */
export function featureEdges(geo, thresholdDeg = 40) {
  const posAttr = geo.attributes.position;
  if (!posAttr) return new Float32Array(0);
  thresholdDeg = geo.userData.edgeAngle ?? thresholdDeg;
  const hit = edgeCache.get(geo);
  if (hit && hit.version === posAttr.version && hit.angle === thresholdDeg) return hit.edges;
  const pos = posAttr.array;
  const idx = geo.index ? geo.index.array : null;
  const nv = posAttr.count;
  const triCount = idx ? idx.length / 3 : nv / 3;
  const weld = new Int32Array(nv);
  const map = new Map();
  let nu = 0;
  const q = 2e4;
  for (let i = 0; i < nv; i++) {
    const k = (Math.round(pos[i * 3] * q) * 2097152 + Math.round(pos[i * 3 + 1] * q)) * 2097152 + Math.round(pos[i * 3 + 2] * q);
    let w = map.get(k);
    if (w === undefined) { w = nu++; map.set(k, w); }
    weld[i] = w;
  }
  const cosT = Math.cos((thresholdDeg * Math.PI) / 180);
  const normals = new Float32Array(triCount * 3);
  const edges = new Map();
  const out = [];
  const vs = [0, 0, 0];
  for (let t = 0; t < triCount; t++) {
    const a = idx ? idx[t * 3] : t * 3, b = idx ? idx[t * 3 + 1] : t * 3 + 1, c = idx ? idx[t * 3 + 2] : t * 3 + 2;
    const ax = pos[a * 3], ay = pos[a * 3 + 1], az = pos[a * 3 + 2];
    const ux = pos[b * 3] - ax, uy = pos[b * 3 + 1] - ay, uz = pos[b * 3 + 2] - az;
    const vx = pos[c * 3] - ax, vy = pos[c * 3 + 1] - ay, vz = pos[c * 3 + 2] - az;
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz);
    if (l < 1e-14) continue; // triangle dégénéré
    nx /= l; ny /= l; nz /= l;
    normals[t * 3] = nx; normals[t * 3 + 1] = ny; normals[t * 3 + 2] = nz;
    vs[0] = a; vs[1] = b; vs[2] = c;
    for (let j = 0; j < 3; j++) {
      const p = vs[j], r = vs[(j + 1) % 3];
      const wp = weld[p], wr = weld[r];
      if (wp === wr) continue;
      const key = wp < wr ? wp * nu + wr : wr * nu + wp;
      const o = edges.get(key);
      if (o === undefined) edges.set(key, t * 4 + j);
      else if (o >= 0) {
        const t2 = Math.floor(o / 4);
        const dot = nx * normals[t2 * 3] + ny * normals[t2 * 3 + 1] + nz * normals[t2 * 3 + 2];
        if (dot <= cosT) out.push(pos[p * 3], pos[p * 3 + 1], pos[p * 3 + 2], pos[r * 3], pos[r * 3 + 1], pos[r * 3 + 2]);
        edges.set(key, -1);
      }
    }
  }
  // Bords libres (tubes ouverts, demi-sphères…).
  for (const o of edges.values()) {
    if (o < 0) continue;
    const t = Math.floor(o / 4), j = o % 4;
    const tri = [idx ? idx[t * 3] : t * 3, idx ? idx[t * 3 + 1] : t * 3 + 1, idx ? idx[t * 3 + 2] : t * 3 + 2];
    const p = tri[j], r = tri[(j + 1) % 3];
    out.push(pos[p * 3], pos[p * 3 + 1], pos[p * 3 + 2], pos[r * 3], pos[r * 3 + 1], pos[r * 3 + 2]);
  }
  const res = new Float32Array(out);
  edgeCache.set(geo, { version: posAttr.version, angle: thresholdDeg, edges: res });
  return res;
}

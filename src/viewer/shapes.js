import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mat } from './materials.js';

// Bibliothèque de formes paramétriques (unités : mètres, Y vers le haut).
// Chaque fonction retourne un Mesh ou un Group prêt à positionner.

const V = (a) => (a instanceof THREE.Vector3 ? a : new THREE.Vector3(...a));

function orient(obj, axis) {
  if (axis === 'x') obj.rotation.z = -Math.PI / 2;
  else if (axis === 'z') obj.rotation.x = Math.PI / 2;
  else if (axis === '-x') obj.rotation.z = Math.PI / 2;
  else if (axis === '-z') obj.rotation.x = -Math.PI / 2;
  else if (axis === '-y') obj.rotation.x = Math.PI;
  return obj;
}

function mesh(geometry, material) {
  const m = new THREE.Mesh(geometry, mat(material));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

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
  const geo = r > 0
    ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2))
    : new THREE.BoxGeometry(w, h, d);
  const m = mesh(geo, material);
  if (pos) at(m, pos, rot);
  return m;
}

/** Cylindre de rayon r, longueur len, le long de l'axe donné, centré à l'origine. */
export function cyl(r, len, material = 'steel', { axis = 'y', r2, seg = 28, pos, open = false } = {}) {
  const geo = new THREE.CylinderGeometry(r2 ?? r, r, len, seg, 1, open);
  const inner = mesh(geo, material);
  orient(inner, axis);
  const g = group(inner);
  if (pos) g.position.copy(V(pos));
  return g;
}

/** Anneau épais (rondelle, bride) : rayon ext., rayon int., épaisseur. */
export function ring(rOut, rIn, thick, material = 'steel', { axis = 'y', seg = 32, pos } = {}) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, rOut, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, rIn, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false, curveSegments: seg });
  geo.translate(0, 0, -thick / 2);
  geo.rotateX(Math.PI / 2); // épaisseur selon Y
  const m = mesh(geo, material);
  orient(m, axis);
  const g = group(m);
  if (pos) g.position.copy(V(pos));
  return g;
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

/** Tube suivant une suite de points (boyau, tuyau, cadre tubulaire). */
export function tube(points, r, material = 'black', { seg = 48, closed = false, tension = 0.5, sharp = false } = {}) {
  const pts = points.map(V);
  let curve;
  if (sharp) {
    curve = new THREE.CurvePath();
    for (let i = 0; i < pts.length - 1; i++) curve.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
  } else {
    curve = new THREE.CatmullRomCurve3(pts, closed, 'catmullrom', tension);
  }
  const geo = new THREE.TubeGeometry(curve, seg, r, 12, closed);
  return mesh(geo, material);
}

/** Barre droite entre deux points (cylindre orienté). */
export function rod(a, b, r, material = 'steel', seg = 16) {
  const A = V(a), B = V(b);
  const len = A.distanceTo(B);
  const geo = new THREE.CylinderGeometry(r, r, len, seg);
  const m = mesh(geo, material);
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
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 20,
  });
  if (center) geo.translate(0, 0, -depth / 2);
  return mesh(geo, material);
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
  const geo = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: 16 });
  geo.translate(0, 0, -t / 2);
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

/** Écrou hexagonal. */
export function nut(size, h, material = 'steel', { axis = 'y', pos } = {}) {
  const g = cyl(size / 2 / Math.cos(Math.PI / 6), h, material, { axis, seg: 6, pos });
  return g;
}

/** Boulon à tête hexagonale le long de -axe (tête en haut à l'origine). */
export function bolt(d, len, material = 'steel', { axis = 'y', head = 'hex', pos } = {}) {
  const hh = d * 0.65;
  const headGeo = head === 'square'
    ? new THREE.BoxGeometry(d * 1.6, hh, d * 1.6)
    : head === 'button'
      ? new THREE.SphereGeometry(d * 0.95, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2)
      : new THREE.CylinderGeometry(d * 0.95, d * 0.95, hh, 6);
  const h = mesh(headGeo, material);
  h.position.y = head === 'button' ? 0 : hh / 2;
  const s = mesh(new THREE.CylinderGeometry(d / 2, d / 2, len, 12), material);
  s.position.y = -len / 2;
  const inner = group(h, s);
  orient(inner, axis);
  const g = group(inner);
  if (pos) g.position.copy(V(pos));
  return g;
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
  const m = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, wire, 8, false), material);
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
  const barrel = cyl(r, barrelLen, material, { axis: 'x' });
  barrel.position.x = barrelLen / 2;
  const capA = cyl(r * 1.12, r * 0.5, material, { axis: 'x' });
  capA.position.x = r * 0.25;
  const capB = cyl(r * 1.12, r * 0.5, material, { axis: 'x' });
  capB.position.x = barrelLen - r * 0.25;
  const rodLen = len - barrelLen;
  const rd = cyl(rodR, rodLen, 'chrome', { axis: 'x' });
  rd.position.x = barrelLen + rodLen / 2;
  g.add(barrel, capA, capB, rd);
  if (eyes === 'eye') {
    g.add(at(ring(r * 0.75, r * 0.32, r * 0.7, material, { axis: 'z' }), [-r * 0.6, 0, 0]));
    g.add(at(ring(rodR * 1.5, rodR * 0.6, rodR * 1.3, 'darkSteel', { axis: 'z' }), [len + rodR * 0.9, 0, 0]));
  } else if (eyes === 'clevis') {
    g.add(at(box(r * 0.6, r * 1.2, r * 1.6, material), [-r * 0.3, 0, 0]));
    const fork = group(
      at(box(rodR * 3, rodR * 2.2, rodR * 0.6, 'darkSteel'), [0, 0, rodR * 0.9]),
      at(box(rodR * 3, rodR * 2.2, rodR * 0.6, 'darkSteel'), [0, 0, -rodR * 0.9]),
    );
    fork.position.x = len + rodR * 1.2;
    g.add(fork);
  }
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

/** Vanne à bille : corps + leviers. Axe de passage selon l'axe donné. */
export function ballValve(size, material = 'brass', { axis = 'x', handle = 'red' } = {}) {
  const r = size / 2;
  const g = new THREE.Group();
  g.add(cyl(r * 1.15, size * 1.9, material, { axis: 'x' }));
  g.add(cyl(r * 1.45, size * 0.9, material, { axis: 'x' }));
  g.add(at(nut(size * 1.05, size * 0.3, material, { axis: 'x' }), [size * 1.0, 0, 0]));
  g.add(at(nut(size * 1.05, size * 0.3, material, { axis: 'x' }), [-size * 1.0, 0, 0]));
  g.add(at(cyl(r * 0.35, size * 0.7, 'steel'), [0, r * 1.6, 0]));
  g.add(at(box(size * 2.6, size * 0.12, size * 0.35, handle), [size * 1.1, r * 1.95, 0]));
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

/** Raccord hydraulique simple (hexagone + embout), le long de +Y. */
export function fitting(d, len, material = 'steel', { axis = 'y', tee = false, elbow = false } = {}) {
  const g = new THREE.Group();
  g.add(at(nut(d * 1.25, len * 0.28, material), [0, 0, 0]));
  g.add(at(cyl(d * 0.42, len * 0.75, material), [0, len * 0.42, 0]));
  g.add(at(cyl(d * 0.38, len * 0.6, material), [0, -len * 0.35, 0]));
  if (tee) g.add(at(cyl(d * 0.4, len * 0.7, material, { axis: 'x' }), [len * 0.3, len * 0.3, 0]));
  if (elbow) g.add(at(cyl(d * 0.4, len * 0.6, material, { axis: 'z' }), [0, len * 0.7, len * 0.25]));
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
  g.add(cyl(r, r * 0.55, 'steel', { axis: 'z' }));
  g.add(at(cyl(r * 0.86, r * 0.05, face, { axis: 'z' }), [0, 0, r * 0.28]));
  g.add(at(box(r * 0.08, r * 0.7, r * 0.02, 'black'), [0, r * 0.25, r * 0.31], [0, 0, -0.6]));
  g.add(at(cyl(r * 0.18, r * 0.5, 'brass', { axis: 'y' }), [0, -r * 1.15, 0]));
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
  g.add(at(box(r * 2.4, r * 0.9, r * 2.0, head, { r: r * 0.15 }), [0, -r * 0.45, 0]));
  g.add(at(cyl(r, h - r * 1.3, material), [0, -r * 0.9 - (h - r * 1.3) / 2, 0]));
  g.add(at(cyl(r * 0.85, r * 0.4, material, { r2: r }), [0, -h + r * 0.2, 0]));
  return g;
}

/** Banc de distributeurs (sections empilées selon X) avec leviers. */
export function valveBank(n, { sw = 0.05, h = 0.16, d = 0.12, levers = true, material = 'black' } = {}) {
  const g = new THREE.Group();
  const total = n * sw + 0.08;
  g.add(at(box(0.04, h * 1.1, d * 1.05, material), [-total / 2 + 0.02, 0, 0]));
  g.add(at(box(0.04, h * 1.1, d * 1.05, material), [total / 2 - 0.02, 0, 0]));
  for (let i = 0; i < n; i++) {
    const x = -total / 2 + 0.04 + sw * (i + 0.5);
    g.add(at(box(sw * 0.92, h, d, material, { r: 0.004 }), [x, 0, 0]));
    g.add(at(box(sw * 0.7, h * 0.35, d * 0.25, 'darkSteel'), [x, h * 0.2, d * 0.62]));
    if (levers) {
      g.add(at(cyl(0.006, h * 0.9, 'steel'), [x, h * 0.95, -d * 0.2], [0.25, 0, 0]));
      g.add(at(cyl(0.012, 0.04, 'black'), [x, h * 1.4, -d * 0.31]));
    }
  }
  return g;
}

/** Boîtier électrique avec couvercle. */
export function enclosure(w, h, d, material = 'grey') {
  const g = new THREE.Group();
  g.add(box(w, h, d, material, { r: 0.01 }));
  g.add(at(box(w * 0.94, h * 0.94, 0.008, material, { r: 0.004 }), [0, 0, d / 2 + 0.004]));
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    g.add(at(cyl(0.008, 0.01, 'steel', { axis: 'z' }), [sx * (w / 2 - 0.03), sy * (h / 2 - 0.03), d / 2 + 0.01]));
  }
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

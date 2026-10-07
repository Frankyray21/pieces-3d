// Réservoir hydraulique (F11) et pompe à eau + moteur (F12).
// Repère du réservoir : base à y = 0, centré en X/Z (0,84 × 0,9 × 1,24 m).
// Comme aux dessins F04 / F11 : face inclinée (pompe à eau sur tablette) côté +X,
// vers l'avant de la foreuse ; panneau électrique principal sur la face arrière
// (-X) ; filtres d'air et ligne d'eau côté -Z ; réservoir d'huile de marteau côté +Z.
// La trousse de modélisation (géométries fusionnées par matériau, boulonnerie,
// soudures, boyaux, tuyaux cintrés) est partagée avec le toit (F13).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mat } from '../../viewer/materials.js';
import * as SH from '../../viewer/shapes.js';

// ------------------------------------------------------------ matériaux propres

let OWN = null;
function own(name) {
  if (!OWN) {
    const off = { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 };
    const mk = (Ctor, n, p) => { const m = new Ctor({ ...p, ...off }); m.name = n; return m; };
    OWN = {
      // Aluminium moulé (têtes de filtre, régulateurs, pompe à huile).
      alu: mk(THREE.MeshStandardMaterial, 'alu', { color: 0xbcc1c6, metalness: 0.62, roughness: 0.42 }),
      // Plastique blanc (boîtes de prises).
      plastic: mk(THREE.MeshPhysicalMaterial, 'plastic', { color: 0xe4e2da, metalness: 0, roughness: 0.5, clearcoat: 0.15, clearcoatRoughness: 0.5 }),
      // Pistons céramique de la pompe CAT.
      ceramic: mk(THREE.MeshPhysicalMaterial, 'ceramic', { color: 0xf0eee6, metalness: 0, roughness: 0.16, clearcoat: 0.7, clearcoatRoughness: 0.1 }),
      // Plaque signalétique (alu brossé, sans inscription).
      tag: mk(THREE.MeshStandardMaterial, 'tag', { color: 0xd6d9dc, metalness: 0.8, roughness: 0.32 }),
      // Huile vue au travers des voyants.
      oil: mk(THREE.MeshPhysicalMaterial, 'oil', { color: 0xc7901f, metalness: 0, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }),
      // Boyau caoutchouc (gaine extérieure), légèrement satiné.
      hose: mk(THREE.MeshStandardMaterial, 'hose', { color: 0x1c1d20, metalness: 0, roughness: 0.6 }),
      // Tamis inox des crépines.
      mesh: mk(THREE.MeshStandardMaterial, 'mesh', { color: 0x8e949b, metalness: 0.75, roughness: 0.55 }),
      // Uréthane noir mat (croisillon d'accouplement, joints).
      urethane: mk(THREE.MeshStandardMaterial, 'urethane', { color: 0x202124, metalness: 0, roughness: 0.75 }),
    };
  }
  return OWN[name];
}
/** Matériau : nom de la palette commune, '~nom' pour un matériau propre, ou instance. */
const M = (m) => (typeof m === 'string' && m[0] === '~' ? own(m.slice(1)) : mat(m));

// ------------------------------------------------------------ géométrie

const V3 = (a) => (a && a.isVector3 ? a.clone() : new THREE.Vector3(...a));
const UPV = new THREE.Vector3(0, 1, 0);

/** Oriente une géométrie construite selon +Y vers l'axe donné. */
function toAxis(geo, axis) {
  if (axis === 'x') geo.rotateZ(-Math.PI / 2);
  else if (axis === '-x') geo.rotateZ(Math.PI / 2);
  else if (axis === 'z') geo.rotateX(Math.PI / 2);
  else if (axis === '-z') geo.rotateX(-Math.PI / 2);
  else if (axis === '-y') geo.rotateX(Math.PI);
  return geo;
}
/** Rotation (Euler XYZ) puis translation. */
function xf(geo, pos = [0, 0, 0], rot = null) {
  if (rot) geo.applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)));
  return geo.translate(...V3(pos).toArray());
}
/** Axe +Y de la géométrie dirigé selon dir, puis translation. */
function aim(geo, pos, dir) {
  geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UPV, V3(dir).normalize()));
  return geo.translate(...V3(pos).toArray());
}

const box = (w, h, d, r = 0) => SH.box(w, h, d, 'red', { r }).geometry;
const cyl = (r, len, o = {}) => SH.cyl(r, len, 'steel', o).children[0].geometry;
const ring = (ro, ri, t, seg = 24) => SH.ring(ro, ri, t, 'steel', { seg }).children[0].geometry;

/**
 * Révolution autour de Y d'un profil [[r, y, lisse?], ...] parcouru du centre
 * bas vers le centre haut par l'extérieur. Arêtes vives sauf points « lisses ».
 */
function revolve(profile, seg = 24, faceted = false) {
  const P = profile;
  const sn = [];
  for (let i = 0; i < P.length - 1; i++) {
    const dr = P[i + 1][0] - P[i][0], dy = P[i + 1][1] - P[i][1];
    const l = Math.hypot(dr, dy) || 1;
    sn.push([dy / l, -dr / l]);
  }
  const avg = (a, b) => { const x = a[0] + b[0], y = a[1] + b[1], l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
  const pos = [], nor = [], idx = [];
  for (let i = 0; i < P.length - 1; i++) {
    const [r0, y0] = P[i], [r1, y1] = P[i + 1];
    if (Math.hypot(r1 - r0, y1 - y0) < 1e-9) continue;
    const n0 = P[i][2] && i > 0 ? avg(sn[i - 1], sn[i]) : sn[i];
    const n1 = P[i + 1][2] && i + 1 < P.length - 1 ? avg(sn[i], sn[i + 1]) : sn[i];
    const base = pos.length / 3;
    for (let j = 0; j <= seg; j++) {
      const t = (j / seg) * Math.PI * 2, s = Math.sin(t), c = Math.cos(t);
      pos.push(r0 * s, y0, r0 * c, r1 * s, y1, r1 * c);
      nor.push(n0[0] * s, n0[1], n0[0] * c, n1[0] * s, n1[1], n1[0] * c);
    }
    for (let j = 0; j < seg; j++) {
      const a = base + j * 2, b = a + 2, c = a + 1, d = a + 3;
      if (r0 > 1e-9) idx.push(a, b, c);
      if (r1 > 1e-9) idx.push(b, d, c);
    }
  }
  let g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  if (faceted) { g = g.toNonIndexed(); g.computeVertexNormals(); }
  return g;
}

/** Prisme hexagonal chanfreiné (surplat af, hauteur h), axe Y, centré. */
function hex(af, h) {
  const R = af / 2 / Math.cos(Math.PI / 6), c = Math.min(h * 0.18, R * 0.12);
  return revolve([[0, -h / 2], [R - c, -h / 2], [R, -h / 2 + c * 0.6], [R, h / 2 - c * 0.6], [R - c, h / 2], [0, h / 2]], 6, true);
}

/** Contour (x, y) extrudé selon Z (centré) ; trous ronds [x, y, r] et polygones. */
function shapeGeo(outline, depth, { holes = [], polys = [], bevel = 0 } = {}) {
  const sh = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
  holes.forEach(([x, y, r]) => {
    const n = Math.max(8, Math.min(28, Math.round(r * 700)));
    sh.holes.push(new THREE.Path(Array.from({ length: n }, (_, i) => {
      const a = -(i / n) * Math.PI * 2;
      return new THREE.Vector2(x + Math.cos(a) * r, y + Math.sin(a) * r);
    })));
  });
  polys.forEach((pts) => sh.holes.push(new THREE.Path(pts.map(([x, y]) => new THREE.Vector2(x, y)))));
  const d = Math.max(depth - 2 * bevel, depth * 0.2);
  const g = new THREE.ExtrudeGeometry(sh, {
    depth: d, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 8,
  });
  g.translate(0, 0, -d / 2);
  return g;
}
/** Contour (z, y) extrudé selon X (centré). */
const extX = (outline, depth, o) => shapeGeo(outline, depth, o).rotateY(-Math.PI / 2);
/** Contour (x, z) extrudé selon Y (centré). */
const extY = (outline, depth, o) => shapeGeo(outline, depth, o).rotateX(Math.PI / 2);

/** Arrondit les sommets d'un polygone (distance de coupe r, n segments par congé). */
function roundPoly(pts, r, n = 3, closed = true) {
  const out = [], N = pts.length;
  for (let i = 0; i < N; i++) {
    const p = pts[i];
    if (!closed && (i === 0 || i === N - 1)) { out.push(p); continue; }
    const a = pts[(i - 1 + N) % N], b = pts[(i + 1) % N];
    const da = Math.hypot(a[0] - p[0], a[1] - p[1]), db = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const k = Math.min(Array.isArray(r) ? r[i] : r, da * 0.45, db * 0.45);
    if (k <= 1e-5) { out.push(p); continue; }
    const p1 = [p[0] + ((a[0] - p[0]) / da) * k, p[1] + ((a[1] - p[1]) / da) * k];
    const p2 = [p[0] + ((b[0] - p[0]) / db) * k, p[1] + ((b[1] - p[1]) / db) * k];
    for (let j = 0; j <= n; j++) {
      const t = j / n, u = 1 - t;
      out.push([u * u * p1[0] + 2 * u * t * p[0] + t * t * p2[0], u * u * p1[1] + 2 * u * t * p[1] + t * t * p2[1]]);
    }
  }
  return out;
}

/** Décalage d'un polygone direct (sens trigo) : d > 0 vers l'extérieur ; d par arête possible. */
function offsetPoly(pts, d) {
  const n = pts.length;
  const L = pts.map((p, i) => {
    const q = pts[(i + 1) % n], ex = q[0] - p[0], ey = q[1] - p[1], l = Math.hypot(ex, ey);
    const di = Array.isArray(d) ? d[i] : d;
    return { px: p[0] + (ey / l) * di, py: p[1] - (ex / l) * di, ex: ex / l, ey: ey / l };
  });
  return pts.map((_, i) => {
    const a = L[(i - 1 + n) % n], b = L[i];
    const den = a.ex * b.ey - a.ey * b.ex;
    if (Math.abs(den) < 1e-9) return [b.px, b.py];
    const t = ((b.px - a.px) * b.ey - (b.py - a.py) * b.ex) / den;
    return [a.px + a.ex * t, a.py + a.ey * t];
  });
}

/** Tôle pliée : contour fermé d'une ligne ouverte épaissie de t (côté gauche), plis arrondis. */
function strip(pts, t, rb = t * 1.5) {
  const a = roundPoly(pts, rb, 3, false);
  const off = [];
  for (let i = 0; i < a.length; i++) {
    const p = a[i], q = a[Math.min(i + 1, a.length - 1)], o = a[Math.max(i - 1, 0)];
    let ex = q[0] - o[0], ey = q[1] - o[1];
    const l = Math.hypot(ex, ey) || 1;
    ex /= l; ey /= l;
    off.push([p[0] - ey * t, p[1] + ex * t]);
  }
  return [...a, ...off.reverse()];
}

/** Tube rigide cintré (droites + coudes de rayon rb) suivant une ligne brisée. */
function pipe(points, r, rb = r * 2.5, radial = 14) {
  const P = points.map(V3);
  const path = new THREE.CurvePath();
  let prev = P[0].clone();
  for (let i = 1; i < P.length - 1; i++) {
    const d0 = P[i].clone().sub(P[i - 1]).normalize();
    const d1 = P[i + 1].clone().sub(P[i]).normalize();
    const k = Math.min(rb, P[i].distanceTo(P[i - 1]) * 0.45, P[i].distanceTo(P[i + 1]) * 0.45);
    const s = P[i].clone().addScaledVector(d0, -k), e = P[i].clone().addScaledVector(d1, k);
    if (prev.distanceTo(s) > 1e-5) path.add(new THREE.LineCurve3(prev, s));
    path.add(new THREE.QuadraticBezierCurve3(s, P[i].clone(), e));
    prev = e;
  }
  path.add(new THREE.LineCurve3(prev, P[P.length - 1].clone()));
  const L = path.getLength();
  return new THREE.TubeGeometry(path, Math.max(8, Math.min(80, Math.round(L / 0.015))), r, radial, false);
}

/** Cordon de soudure ondulé (demi-noyé dans l'angle) de a à b. */
function weld(a, b, r = 0.0035) {
  const A = V3(a), B = V3(b), L = A.distanceTo(B);
  const n = Math.max(2, Math.round(L / 0.008));
  const prof = [[0, -L / 2]];
  for (let i = 0; i <= n; i++) {
    const k = i === 0 || i === n ? 0.55 : i % 2 ? 0.82 : 1;
    prof.push([r * k, -L / 2 + (L * i) / n, true]);
  }
  prof.push([0, L / 2]);
  return aim(revolve(prof, 6), A.clone().add(B).multiplyScalar(0.5), B.clone().sub(A));
}

// ------------------------------------------------------------ sacs de géométries

/**
 * Sac de géométries par matériau → un maillage par matériau (moins d'appels
 * de dessin). add : arêtes dessinées ; soft : sans contours (soudures, boyaux).
 * Accepte des BufferGeometry ou des objets de la bibliothèque (matériaux gardés).
 */
function bag() {
  const lists = new Map();
  const push = (material, g, soft) => {
    let x = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(x.attributes)) if (k !== 'position' && k !== 'normal') x.deleteAttribute(k);
    if (!x.attributes.normal) x.computeVertexNormals();
    x.clearGroups();
    const key = `${material.uuid}:${soft ? 1 : 0}`;
    if (!lists.has(key)) lists.set(key, { material, soft, geos: [] });
    lists.get(key).geos.push(x);
  };
  const take = (m, items, soft) => {
    for (const it of items.flat(4)) {
      if (!it) continue;
      if (it.isBufferGeometry) push(M(m), it, soft);
      else {
        it.updateMatrixWorld(true);
        it.traverse((o) => { if (o.isMesh) push(m ? M(m) : o.material, o.geometry.clone().applyMatrix4(o.matrixWorld), soft); });
      }
    }
  };
  const b = {
    add(m, ...items) { take(m, items, false); return b; },
    soft(m, ...items) { take(m, items, true); return b; },
    /** Groupe de maillages ; interior : pièce à montrer en coupe. */
    group({ interior = false } = {}) {
      const g = new THREE.Group();
      for (const { material, soft, geos } of lists.values()) {
        const m = new THREE.Mesh(geos.length === 1 ? geos[0] : mergeGeometries(geos, false), material);
        if (soft) m.userData.noEdges = true;
        g.add(m);
      }
      if (interior) g.userData.hasInterior = true;
      return g;
    },
  };
  return b;
}

// ------------------------------------------------------------ boulonnerie, boyaux

/** Tête hexagonale + rondelle (+ bout de filet) posées sur une face, selon dir. */
function bolt(pos, dir, d, { washer = true, stud = 0 } = {}) {
  const p = V3(pos), n = V3(dir).normalize(), out = [];
  let off = 0;
  if (washer) {
    const t = d * 0.18;
    out.push(aim(ring(d * 1.05, d * 0.55, t, 14), p.clone().addScaledVector(n, t / 2), n));
    off = t;
  }
  const h = d * 0.65;
  out.push(aim(hex(d * 1.55, h), p.clone().addScaledVector(n, off + h / 2), n));
  if (stud > 0) out.push(aim(cyl(d * 0.46, stud, { seg: 10 }), p.clone().addScaledVector(n, off + h + stud / 2 - d * 0.1), n));
  return out;
}
/** Vis à tête cylindrique six-pans creux (CHC), selon dir. */
function capScrew(pos, dir, d) {
  return aim(revolve([[0, 0], [d * 0.72, 0], [d * 0.78, d * 0.1], [d * 0.78, d * 0.88], [d * 0.68, d], [d * 0.38, d], [d * 0.38, d * 0.62], [0, d * 0.62]], 14), pos, dir);
}
/** Vis à tête bombée (tôles), selon dir. */
function buttonHead(pos, dir, d) {
  return aim(revolve([[0, 0], [d * 0.95, 0], [d * 0.9, d * 0.18, true], [d * 0.62, d * 0.42, true], [0, d * 0.5]], 12), pos, dir);
}

/**
 * Boyau hydraulique : gaine souple courbe entre deux raccords, douilles serties
 * (empreintes de sertissage) et écrous tournants. a, b : faces des raccords ;
 * da, db : directions de sortie ; mid : points de passage.
 */
function hose(B, a, da, b, db, mid, r, { cover = '~hose', fit = 'steel' } = {}) {
  const A = V3(a), Bp = V3(b), dA = V3(da).normalize(), dB = V3(db).normalize();
  const Ln = r * 1.3, Lf = r * 3.2, rf = r * 1.32;
  const at = (P, d, s) => P.clone().addScaledVector(d, s);
  const pts = [at(A, dA, Ln + Lf * 0.9), at(A, dA, Ln + Lf + r * 3), ...mid.map(V3), at(Bp, dB, Ln + Lf + r * 3), at(Bp, dB, Ln + Lf * 0.9)];
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const L = curve.getLength();
  B.soft(cover, new THREE.TubeGeometry(curve, Math.max(16, Math.min(90, Math.round(L / 0.016))), r, 12, false));
  for (const [P, d] of [[A, dA], [Bp, dB]]) {
    B.add(fit, aim(hex(r * 2.6, Ln), at(P, d, Ln / 2), d));
    B.add(fit, aim(revolve([[0, 0], [rf * 0.92, 0], [rf, Lf * 0.06], [rf, Lf * 0.3], [rf * 0.94, Lf * 0.36], [rf, Lf * 0.42],
      [rf, Lf * 0.58], [rf * 0.94, Lf * 0.64], [rf, Lf * 0.7], [rf, Lf * 0.94], [r * 1.04, Lf], [0, Lf]], 14), at(P, d, Ln), d));
  }
}

/** Câble électrique souple (sans embouts). */
function cable(B, pts, r = 0.006) {
  const curve = new THREE.CatmullRomCurve3(pts.map(V3), false, 'centripetal');
  B.soft('rubber', new THREE.TubeGeometry(curve, Math.max(12, Math.round(curve.getLength() / 0.02)), r, 8, false));
}

/** Presse-étoupe (écrou + dôme) sur une face, selon dir. */
function gland(pos, dir, d) {
  return [
    aim(hex(d * 1.25, d * 0.35), V3(pos).addScaledVector(V3(dir).normalize(), d * 0.17), dir),
    aim(revolve([[0, 0], [d * 0.5, 0], [d * 0.5, d * 0.2], [d * 0.42, d * 0.5, true], [d * 0.3, d * 0.62], [0, d * 0.62]], 14), V3(pos).addScaledVector(V3(dir).normalize(), d * 0.34), dir),
  ];
}

/** Plaque signalétique rivetée (sans inscription), posée sur une face de normale n. */
function nameplate(B, pos, n, up, w, h) {
  const N = V3(n).normalize(), U = V3(up).normalize(), R = new THREE.Vector3().crossVectors(U, N);
  const m = new THREE.Matrix4().makeBasis(R, U, N).setPosition(V3(pos).addScaledVector(N, 0.0008));
  B.add('~tag', box(w, h, 0.0016, 0.0006).applyMatrix4(m));
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    B.add('steel', aim(revolve([[0, 0], [0.0022, 0], [0.0016, 0.0009, true], [0, 0.0012]], 8), V3([sx * (w / 2 - 0.005), sy * (h / 2 - 0.005), 0.0016]).applyMatrix4(m), N));
  }
}

/** Trousse partagée avec le toit (F13). */
export const KIT = {
  V3, M, own, toAxis, xf, aim, box, cyl, ring, revolve, hex, shapeGeo, extX, extY,
  roundPoly, offsetPoly, strip, pipe, weld, bag, bolt, capScrew, buttonHead, hose, cable, gland, nameplate,
};

// ------------------------------------------------------------ éléments communs

/**
 * Corps de filtre à cuve (séparateur d'eau, filtre à air) : tête moulée à
 * orifices selon X (axe à y = 0), cuve creuse vissée, collerette, purge.
 * Retourne la hauteur du fond de cuve (y négatif).
 */
function filterBody(B, { r, h, body, head = body, portR, top = 'round' }) {
  const hw = r * 1.18;
  // Tête : bloc arrondi, bossages d'orifices, chapeau supérieur.
  B.add(head, xf(box(hw * 2, r * 1.25, r * 2.05, r * 0.28), [0, r * 0.06, 0]));
  B.add(head, xf(toAxis(revolve([[0, 0], [portR * 1.45, 0], [portR * 1.45, r * 0.12], [portR * 1.3, r * 0.16], [0, r * 0.16]], 24), 'x'), [hw - 0.002, 0, 0]));
  B.add(head, xf(toAxis(revolve([[0, 0], [portR * 1.45, 0], [portR * 1.45, r * 0.12], [portR * 1.3, r * 0.16], [0, r * 0.16]], 24), '-x'), [-hw + 0.002, 0, 0]));
  if (top === 'round') B.add(head, xf(toAxis(cyl(r * 0.62, r * 0.35, { seg: 24 }), 'z'), [0, r * 0.08, -r * 1.02 - r * 0.12]));
  else B.add(head, xf(box(r * 0.6, r * 0.3, r * 0.6, r * 0.06), [0, r * 0.82, 0]));
  // Collerette de vissage et cuve creuse à fond bombé (visible en coupe).
  const y0 = -r * 0.56, yb = -h;
  B.add(head, xf(revolve([[r * 0.9, 0], [r * 1.1, 0], [r * 1.12, r * 0.05], [r * 1.12, r * 0.2], [r * 1.08, r * 0.24], [r * 0.9, r * 0.24]], 32), [0, y0 - r * 0.24, 0]));
  const t = r * 0.09, k = r * 0.35;
  B.add(body, revolve([
    [0, yb], [r * 0.55, yb, true], [r * 0.88, yb + k * 0.45, true], [r, yb + k], [r, y0 - r * 0.24], [r - t, y0 - r * 0.24],
    [r - t, yb + k + t * 0.3], [r * 0.85 - t, yb + k * 0.45 + t, true], [r * 0.5, yb + t, true], [0, yb + t],
  ], 32));
  // Bague de prise (méplats) et bossage de purge.
  B.add(body, xf(revolve([[r * 1.0, 0], [r * 1.05, r * 0.03], [r * 1.05, r * 0.16], [r * 1.0, r * 0.19]], 32, false), [0, y0 - r * 0.62, 0]));
  B.add(body, xf(cyl(r * 0.22, r * 0.18, { seg: 16 }), [0, yb - r * 0.06, 0]));
  return yb - r * 0.15;
}

/** Cartouche filtrante plissée (crème) avec flasques ; axe Y, centrée. */
function element(B, r, len, { cap = 'darkSteel', crown = false } = {}) {
  const n = 22, ro = r, ri = r * 0.84, pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? ri : ro;
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  B.add('cream', extY(pts, len * 0.9, { holes: [[0, 0, r * 0.5]] }));
  for (const s of [1, -1]) B.add(cap, xf(ring(r * 1.04, r * 0.45, len * 0.05, 28), [0, s * len * 0.475, 0]));
  B.add('steel', cyl(r * 0.48, len * 0.9, { seg: 16 }));
  if (crown) {
    // Couronne crénelée (élément du séparateur, comme au dessin).
    const c = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2, rr = i % 2 ? r * 0.92 : r * 1.04;
      c.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    B.add('cream', xf(extY(c, len * 0.06, { holes: [[0, 0, r * 0.4]] }), [0, len * 0.53, 0]));
  }
}

/** Bloc de serrage fendu (deux demi-blocs bleus + platine) autour d'un tuyau selon X. */
function splitBloc(B, c, { rp, w, hh, len, plate = 0.012 }) {
  // Profil (z relatif, y) du demi-bloc côté paroi (z > 0) avec encoche demi-ronde.
  const g = 0.0012, arc = [];
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI / 2 + (i / 10) * Math.PI;
    arc.push([g + Math.cos(a) * rp, Math.sin(a) * rp]);
  }
  const half = [[w / 2, -hh], [w / 2, hh], [g, hh], ...arc.reverse(), [g, -hh]];
  const C = V3(c);
  B.add('blue', xf(extX(roundPoly(half, 0.004, 1), len), [C.x, C.y, C.z]));
  B.add('blue', xf(extX(roundPoly(half, 0.004, 1), len).rotateY(Math.PI), [C.x, C.y, C.z]));
  // Platine soudable côté paroi, vis CHC traversantes côté extérieur.
  B.add('darkSteel', xf(box(len * 1.12, hh * 2.15, plate, 0.002), [C.x, C.y, C.z + w / 2 + plate / 2]));
  for (const s of [-1, 1]) B.add('darkSteel', capScrew([C.x, C.y + s * (hh - 0.012), C.z - w / 2], [0, 0, -1], Math.min(0.012, len * 0.16)));
}

// ------------------------------------------------------------ F12 pompe à eau

// Repère F12 : carter de la pompe CAT centré à l'origine (axe de l'arbre en
// y = z = 0), arbre selon +X vers l'accouplement et le moteur hydraulique
// (jusqu'à x ≈ 0,46), pistons et culasse selon +Z, semelles à y = -0,1.

export function F12(api) {
  const P = (ref, g, e) => api.part(ref, g, e);
  const yF = -0.1; // dessous des semelles

  // 8 — Pompe à pistons CAT : carter, paliers, corps de pistons, culasse, garde tubulaire.
  {
    const B = bag();
    const prof = roundPoly([[-0.1, -0.075], [0.07, -0.075], [0.07, 0.085], [-0.055, 0.085], [-0.1, 0.035]], 0.012, 3);
    B.add('blue', extX(prof, 0.2, { bevel: 0.005 }));
    // Plan de joint carter / corps de pistons (léger épaulement).
    B.add('blue', xf(box(0.168, 0.135, 0.012, 0.003), [0, 0.003, 0.072]));
    // Palier côté opposé : couvercle et embout d'arbre protégé ; côté entraînement : couvercle et arbre claveté.
    B.add('blue', xf(toAxis(revolve([[0, 0], [0.05, 0], [0.05, 0.009], [0.044, 0.012], [0.034, 0.012], [0.034, 0.022], [0.021, 0.024], [0.021, 0.052], [0.016, 0.058], [0, 0.058]], 28), '-x'), [-0.1, 0, 0]));
    B.add('blue', xf(toAxis(revolve([[0, 0], [0.048, 0], [0.048, 0.01], [0.042, 0.013], [0.03, 0.013], [0.03, 0.024], [0, 0.024]], 28), 'x'), [0.1, 0, 0]));
    B.add('steel', xf(toAxis(cyl(0.0125, 0.085, { seg: 20 }), 'x'), [0.162, 0, 0]));
    B.add('darkSteel', xf(box(0.06, 0.004, 0.0045), [0.17, 0.0115, 0]));
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      B.add('darkSteel', capScrew([0.1 + 0.01, Math.sin(a) * 0.04, Math.cos(a) * 0.04], [1, 0, 0], 0.007));
      B.add('darkSteel', capScrew([-0.1 - 0.009, Math.sin(a) * 0.042, Math.cos(a) * 0.042], [-1, 0, 0], 0.007));
    }
    // Couvercle rond (jauge) sur le dessus, vis de vidange, semelles boulonnées.
    B.add('blue', xf(revolve([[0, 0], [0.026, 0], [0.026, 0.008], [0.023, 0.012], [0.018, 0.012], [0.018, 0.016], [0, 0.016]], 24), [0, 0.085, 0.04]));
    B.add('steel', xf(toAxis(hex(0.016, 0.008), '-x'), [-0.104, -0.055, 0.04]));
    for (const z of [-0.085, 0.045]) {
      B.add('blue', xf(box(0.19, 0.025, 0.03, 0.004), [0, yF + 0.0125, z]));
      for (const x of [-0.075, 0.075]) B.add('steel', bolt([x, yF + 0.025, z], [0, 1, 0], 0.008));
    }
    // Corps de pistons, joints et pistons céramique.
    B.add('blue', xf(box(0.15, 0.11, 0.03, 0.008), [0, 0, 0.093]));
    for (const x of [-0.045, 0, 0.045]) {
      B.add('blue', xf(toAxis(cyl(0.017, 0.014, { seg: 20 }), 'z'), [x, -0.004, 0.115]));
      B.add('~ceramic', xf(toAxis(cyl(0.0105, 0.085, { seg: 18 }), 'z'), [x, -0.004, 0.152]));
      B.add('blue', xf(toAxis(cyl(0.016, 0.012, { seg: 20 }), 'z'), [x, -0.004, 0.188]));
    }
    // Culasse (collecteur) : vis CHC en façade, bouchon laiton, orifices.
    B.add('blue', xf(box(0.16, 0.1, 0.058, 0.008), [0, -0.008, 0.223]));
    for (const [x, y] of [[-0.064, 0.03], [0.064, 0.03], [-0.064, -0.046], [0.064, -0.046], [0, 0.03], [0, -0.046]]) B.add('darkSteel', capScrew([x, y, 0.252], [0, 0, 1], 0.007));
    B.add('brass', xf(toAxis(revolve([[0, 0], [0.011, 0], [0.011, 0.006], [0.008, 0.008], [0.008, 0.016], [0.005, 0.02], [0, 0.02]], 16), 'z'), [-0.03, -0.008, 0.252]));
    B.add('blue', xf(cyl(0.014, 0.008, { seg: 16 }), [0.045, 0.046, 0.215]));
    B.add('blue', xf(cyl(0.014, 0.008, { seg: 16 }), [0, -0.062, 0.215]));
    B.add('blue', xf(toAxis(cyl(0.012, 0.008, { seg: 16 }), '-x'), [-0.084, -0.01, 0.215]));
    // Garde tubulaire : deux cadres et quatre longerons.
    const fr = (z) => [[-0.092, -0.07, z], [0.092, -0.07, z], [0.092, 0.058, z], [-0.092, 0.058, z], [-0.092, -0.07, z]];
    B.add('steel', pipe(fr(0.108), 0.005, 0.014, 8), pipe(fr(0.258), 0.005, 0.014, 8));
    for (const [x, y] of [[-0.092, -0.07], [0.092, -0.07], [-0.092, 0.058], [0.092, 0.058]]) B.add('steel', xf(toAxis(cyl(0.005, 0.15, { seg: 10 }), 'z'), [x, y, 0.183]));
    nameplate(B, [-0.1005, 0.05, -0.05], [-1, 0, 0], [0, 1, 0], 0.04, 0.022);
    P('8', B.group(), [0, 0, 0]);
  }

  // 7 — Bouchon de remplissage laiton (moleté).
  {
    const B = bag();
    const pr = [[0, 0], [0.03, 0]];
    for (let i = 0; i < 1; i++) pr.push([0.031, 0.004], [0.031, 0.026], [0.028, 0.03], [0.02, 0.032, true], [0, 0.033]);
    B.add('brass', revolve(pr, 24, false));
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      B.add('brass', xf(box(0.004, 0.02, 0.003, 0.001), [Math.cos(a) * 0.031, 0.015, Math.sin(a) * 0.031], [0, -a, 0]));
    }
    P('7', xf0(B.group(), [0, 0.085, -0.022]), [0, 0.2, 0]);
  }

  // Accouplement à griffes : 6 moyeu côté pompe, 5 croisillon, 4 moyeu côté moteur.
  const jaws = (B, a0, x0, x1) => {
    for (let i = 0; i < 3; i++) {
      const a = a0 + (i * Math.PI * 2) / 3, w = (34 * Math.PI) / 180, pts = [];
      for (let k = 0; k <= 5; k++) { const t = a - w / 2 + (w * k) / 5; pts.push([Math.cos(t) * 0.032, Math.sin(t) * 0.032]); }
      for (let k = 5; k >= 0; k--) { const t = a - w / 2 + (w * k) / 5; pts.push([Math.cos(t) * 0.0185, Math.sin(t) * 0.0185]); }
      B.add('steel', xf(shapeGeo(pts, x1 - x0, { bevel: 0.0012 }).rotateY(Math.PI / 2), [(x0 + x1) / 2, 0, 0]));
    }
  };
  const hub = (B, x0, x1, dir) => {
    const L = x1 - x0;
    B.add('steel', xf(toAxis(revolve([[0.0125, 0], [0.03, 0], [0.033, 0.003], [0.033, L - 0.003], [0.03, L], [0.0125, L], [0.0125, 0]], 32), dir > 0 ? 'x' : '-x'), [dir > 0 ? x0 : x1, 0, 0]));
    B.add('darkSteel', xf(cyl(0.004, 0.004, { seg: 10 }), [(x0 + x1) / 2, 0.033, 0]));
  };
  {
    const B = bag();
    hub(B, 0.164, 0.2, 1);
    jaws(B, Math.PI / 2, 0.2, 0.229);
    P('6', B.group(), [-0.06, 0, 0]);
  }
  {
    const B = bag(), pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3, w = (22 * Math.PI) / 180;
      pts.push([Math.cos(a - w) * 0.017, Math.sin(a - w) * 0.017], [Math.cos(a - w * 0.55) * 0.0335, Math.sin(a - w * 0.55) * 0.0335],
        [Math.cos(a + w * 0.55) * 0.0335, Math.sin(a + w * 0.55) * 0.0335], [Math.cos(a + w) * 0.017, Math.sin(a + w) * 0.017]);
    }
    B.add('~urethane', xf(shapeGeo(pts, 0.027, { holes: [[0, 0, 0.0095]], bevel: 0.002 }).rotateY(Math.PI / 2), [0.2145, 0, 0]));
    P('5', B.group(), [0.05, 0.12, 0]);
  }
  {
    const B = bag();
    hub(B, 0.229, 0.266, -1);
    jaws(B, Math.PI / 2 + Math.PI / 3, 0.2, 0.229);
    P('4', B.group(), [0.14, 0, 0]);
  }

  // 3 — Bride de moteur en L (rouge) : flasque arrondi percé, semelle boulonnée.
  {
    const B = bag();
    const arc = [];
    for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; arc.push([Math.cos(a) * 0.075, Math.sin(a) * 0.075]); }
    const tomb = [[-0.075, yF + 0.012], [0.075, yF + 0.012], ...arc.slice(1, -1).map(([z, y]) => [z, y]), [-0.075, 0]];
    tomb.splice(2, 0, [0.075, 0]);
    B.add('red', xf(extX(tomb, 0.012, { holes: [[0, 0, 0.042], [0.053, 0, 0.0065], [-0.053, 0, 0.0065]] }), [0.284, 0, 0]));
    B.add('red', xf(box(0.17, 0.012, 0.15, 0.002), [0.363, yF + 0.006, 0]));
    B.soft('red', weld([0.29, yF + 0.012, -0.072], [0.29, yF + 0.012, 0.072], 0.004));
    for (const x of [0.32, 0.42]) for (const z of [-0.055, 0.055]) B.add('steel', bolt([x, yF + 0.012, z], [0, 1, 0], 0.009));
    P('3', B.group(), [0.3, 0, 0]);
  }

  // 2 — Moteur hydraulique orbital (noir) : bride 2 trous, corps à orifices, carter arrière.
  {
    const B = bag();
    const st = [];
    for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + (i / 10) * Math.PI; st.push([0.053 + Math.cos(a) * 0.022, Math.sin(a) * 0.022]); }
    const dia = [...st, [0.02, 0.042], [-0.02, 0.042], ...st.map(([z, y]) => [-z, -y]), [-0.02, -0.042], [0.02, -0.042]];
    B.add('black', xf(extX(roundPoly(dia, 0.006, 2), 0.012, { holes: [[0.053, 0, 0.0065], [-0.053, 0, 0.0065]], bevel: 0.0015 }), [0.296, 0, 0]));
    B.add('black', xf(toAxis(revolve([[0, 0], [0.0405, 0], [0.0405, 0.011], [0.036, 0.013], [0, 0.013]], 32), '-x'), [0.29, 0, 0]));
    B.add('steel', xf(toAxis(cyl(0.0125, 0.075, { seg: 20 }), 'x'), [0.24, 0, 0]));
    B.add('black', xf(box(0.072, 0.1, 0.1, 0.012), [0.338, 0, 0]));
    B.add('black', xf(toAxis(revolve([[0, 0], [0.052, 0], [0.058, 0.006], [0.058, 0.078], [0.054, 0.084], [0.04, 0.088], [0, 0.088]], 32), 'x'), [0.372, 0, 0]));
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      B.add('darkSteel', capScrew([0.46, Math.sin(a) * 0.042, Math.cos(a) * 0.042], [1, 0, 0], 0.0065));
    }
    // Orifices A / B côté +Z (bouchons six-pans) et boulons de bride.
    for (const x of [0.322, 0.356]) {
      B.add('black', xf(toAxis(cyl(0.012, 0.006, { seg: 16 }), 'z'), [x, 0.012, 0.053]));
      B.add('steel', xf(toAxis(hex(0.019, 0.012), 'z'), [x, 0.012, 0.062]));
      B.add('steel', xf(toAxis(cyl(0.0065, 0.014, { seg: 12 }), 'z'), [x, 0.012, 0.075]));
    }
    for (const z of [-0.053, 0.053]) {
      B.add('steel', bolt([0.302, 0, z], [1, 0, 0], 0.011));
      B.add('steel', xf(toAxis(hex(0.017, 0.009), '-x'), [0.2735, 0, z]));
    }
    nameplate(B, [0.338, 0.05, 0], [0, 1, 0], [1, 0, 0], 0.045, 0.025);
    P('2', B.group(), [0.42, 0, 0]);
  }

  // 1 — Garde d'accouplement : tôle pliée en U à pans coupés, pattes boulonnées.
  {
    const B = bag();
    const u = [[-0.088, yF], [-0.062, yF], [-0.062, 0.048], [-0.042, 0.068], [0.042, 0.068], [0.062, 0.048], [0.062, yF], [0.088, yF]];
    B.add('black', xf(extX(strip(u, 0.0025, 0.004), 0.108), [0.21, 0, 0]));
    for (const z of [-0.077, 0.077]) for (const x of [0.17, 0.25]) B.add('steel', buttonHead([x, yF + 0.0025, z], [0, 1, 0], 0.006));
    P('1', B.group(), [0, 0.32, 0]);
  }

  // 9 — Soupape de décharge laiton (té, corps de réglage, goupille).
  {
    const B = bag();
    B.add('brass', xf(hex(0.022, 0.01), [0.045, 0.055, 0.215]));
    B.add('brass', xf(cyl(0.012, 0.03, { seg: 16 }), [0.045, 0.068, 0.215]));
    B.add('brass', xf(toAxis(revolve([[0, 0], [0.017, 0], [0.018, 0.004], [0.018, 0.06], [0.014, 0.066], [0.0125, 0.066], [0.0125, 0.12], [0.011, 0.124], [0, 0.124]], 20), '-x'), [0.07, 0.088, 0.215]));
    B.add('brass', xf(toAxis(hex(0.024, 0.012), '-x'), [-0.002, 0.088, 0.215]));
    B.add('steel', xf(toAxis(cyl(0.0035, 0.03, { seg: 8 }), '-x'), [-0.068, 0.088, 0.215]));
    B.add('steel', xf(toAxis(cyl(0.0014, 0.034, { seg: 6 }), 'z'), [-0.074, 0.088, 0.215]));
    B.add('steel', xf(new THREE.TorusGeometry(0.006, 0.0012, 5, 12), [-0.074, 0.088, 0.234]));
    P('9', B.group(), [0, 0.14, 0.06]);
  }

  // 12 — Valve ASCO laiton sous la culasse (chapeau rond 4 vis), 13 — bobine.
  {
    const B = bag();
    B.add('steel', xf(hex(0.022, 0.01), [0, -0.07, 0.215]));
    B.add('brass', xf(box(0.048, 0.05, 0.044, 0.006), [0, -0.105, 0.215]));
    B.add('brass', xf(hex(0.03, 0.014), [0, -0.075, 0.215]), xf(hex(0.03, 0.014), [0, -0.135, 0.215]));
    B.add('brass', xf(toAxis(revolve([[0, 0], [0.03, 0], [0.031, 0.004], [0.031, 0.011], [0.026, 0.014], [0.018, 0.016, true], [0, 0.018]], 24), 'z'), [0, -0.105, 0.237]));
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      B.add('brass', xf(toAxis(cyl(0.0055, 0.012, { seg: 10 }), 'z'), [Math.cos(a) * 0.031, -0.105 + Math.sin(a) * 0.031, 0.244]));
      B.add('steel', capScrew([Math.cos(a) * 0.031, -0.105 + Math.sin(a) * 0.031, 0.25], [0, 0, 1], 0.005));
    }
    B.add('steel', xf(cyl(0.008, 0.02, { seg: 12 }), [0, -0.152, 0.215]));
    P('12', B.group(), [0, -0.18, 0.08]);
  }
  {
    const B = bag();
    B.add('lightGrey', xf(box(0.026, 0.044, 0.04, 0.004), [-0.038, -0.105, 0.215]));
    B.add('black', gland([-0.038, -0.127, 0.215], [0, -1, 0], 0.012));
    P('13', B.group(), [-0.12, -0.12, 0.08]);
  }

  // 10 — Pointeau 1/2" (corps six-pans noir, tige et volant à 4 branches), 11 — clapet anti-retour.
  {
    const B = bag();
    B.add('steel', xf(toAxis(hex(0.022, 0.012), '-x'), [-0.092, -0.01, 0.215]));
    B.add('steel', xf(toAxis(cyl(0.009, 0.014, { seg: 12 }), '-x'), [-0.104, -0.01, 0.215]));
    B.add('black', xf(hex(0.028, 0.055), [-0.125, -0.012, 0.215]));
    B.add('steel', xf(toAxis(hex(0.02, 0.022), '-x'), [-0.15, -0.012, 0.215]));
    B.add('steel', xf(toAxis(cyl(0.004, 0.05, { seg: 10 }), '-x'), [-0.183, -0.012, 0.215]));
    const star = [];
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const c = Math.cos(a), s = Math.sin(a);
      for (const [r, w] of [[0.007, 0.007], [0.022, 0.006], [0.022, -0.006], [0.007, -0.007]]) star.push([c * r - s * w, s * r + c * w]);
    }
    B.add('lightGrey', xf(extX(roundPoly(star, 0.003, 1), 0.008), [-0.21, -0.012, 0.215]));
    B.add('brass', xf(toAxis(hex(0.008, 0.005), '-x'), [-0.2165, -0.012, 0.215]));
    P('10', B.group(), [-0.2, 0.06, 0.05]);
  }
  {
    const B = bag();
    B.add('steel', xf(hex(0.018, 0.012), [-0.125, -0.046, 0.215]));
    B.add('black', xf(hex(0.025, 0.07), [-0.125, -0.088, 0.215]));
    B.add('black', xf(cyl(0.009, 0.006, { seg: 12 }), [-0.125, -0.126, 0.215]));
    P('11', B.group(), [-0.2, -0.16, 0.05]);
  }
  return { view: { dir: [0.55, 0.62, 1.1] } };
}

/** Positionne un groupe. */
function xf0(g, pos, rot) {
  g.position.set(...pos);
  if (rot) g.rotation.set(...rot);
  return g;
}

// ------------------------------------------------------------ F11 réservoir

const H = 0.9, HX = 0.42, ZW = 0.6, TW = 0.006;
// Profil (X, Y) de la cuve, sens trigo : fond, lèvre avant, face inclinée,
// dessus, face arrière, chanfrein arrière bas (comme au dessin).
const PROF = [[-0.2, 0], [HX, 0], [HX, 0.03], [0.1, H], [-HX, H], [-HX, 0.065]];
const sx = (y) => HX - ((y - 0.03) * (HX - 0.1)) / (H - 0.03); // X de la face inclinée à la hauteur y
const PHI = Math.atan2(HX - 0.1, H - 0.03); // inclinaison de la face
const SN = [Math.cos(PHI), Math.sin(PHI), 0]; // normale sortante de la face inclinée
/** Point sur la face inclinée (hauteur y, côte z), décalé de off selon la normale. */
const onS = (y, z, off = 0) => [sx(y) + SN[0] * off, y + SN[1] * off, z];
const ROT_S = [0, 0, PHI]; // repère local (X sortant, Y montant) → face inclinée
// Toit de protection / banc de translation (dessus, vers l'arrière).
const RX = -0.25, RZ = -0.14;
// Ligne d'air 2" (côté -Z) et ligne d'eau 1".
const YA = 0.8, ZA = -0.695, YWL = 0.14, ZWL = -0.69;

export function F11(api) {
  const P = (ref, g, e) => api.part(ref, g, e);

  // 36 — Réservoir : enveloppe pliée creuse, flancs soudés (flanc -Z débordant),
  // tablette de pompe, pattes, semelles, piquages ; intérieur visible en coupe.
  {
    const B = bag();
    const outer = roundPoly(PROF, 0.016, 3);
    const inner = roundPoly(offsetPoly(PROF, -TW), 0.01, 3);
    B.add('red', shapeGeo(outer, 2 * ZW, { polys: [inner] }));
    const sideR = roundPoly(offsetPoly(PROF, [0, 0.004, 0.004, 0.004, 0.004, 0.004]), 0.012, 2);
    B.add('red', xf(shapeGeo(sideR, 0.01, { bevel: 0.0015 }), [0, 0, ZW + 0.005]));
    const sideL = roundPoly(offsetPoly(PROF, [0, 0.03, 0.03, 0.05, 0.004, 0.004]), 0.012, 2);
    B.add('red', xf(shapeGeo(sideL, 0.01, { bevel: 0.0015 }), [0, 0, -ZW - 0.005]));
    // Cordons de soudure flancs / enveloppe.
    for (const z of [ZW, -ZW]) {
      for (let i = 1; i < PROF.length; i++) {
        const a = PROF[i], b = PROF[(i + 1) % PROF.length];
        const ex = b[0] - a[0], ey = b[1] - a[1], l = Math.hypot(ex, ey), nx = ey / l, ny = -ex / l;
        const k = 0.016 / l;
        const o = (p, t) => [p[0] + ex * t + nx * 0.0015, p[1] + ey * t + ny * 0.0015, z + Math.sign(z) * 0.0005];
        B.soft('red', weld(o(a, k), o(a, 1 - k), 0.0038));
      }
    }
    // Dessus : semelles soudées du toit de protection et du banc, étriers des projecteurs.
    for (const z of [RZ + 0.245, RZ - 0.245]) B.add('red', xf(box(0.14, 0.008, 0.075, 0.002), [RX, H + 0.004, z]));
    for (const z of [RZ + 0.075, RZ - 0.085]) B.add('red', xf(box(0.11, 0.008, 0.05, 0.002), [RX + 0.01, H + 0.004, z]));
    for (const z of [0.47, -0.52]) {
      B.add('red', xf(extX(strip([[-0.05, 0], [-0.05, 0.07], [0.05, 0.07], [0.05, 0]], 0.005, 0.006), 0.055), [0.0, H, z]));
      for (const s of [-1, 1]) B.soft('red', weld([-0.027, H + 0.002, z + s * 0.056], [0.027, H + 0.002, z + s * 0.056], 0.003));
    }
    // Côté +Z : plats d'appui du réservoir d'huile de marteau.
    for (const y of [0.33, 0.75]) {
      B.add('red', xf(box(0.42, 0.05, 0.012, 0.002), [-0.21, y, ZW + 0.016]));
      B.soft('red', weld([-0.415, y + 0.026, ZW + 0.011], [-0.005, y + 0.026, ZW + 0.011], 0.003));
    }
    // Piquages : aspirations 2" et 1 1/2" (bas +Z), retour (filtre 29), bouchons rouges.
    for (const [x, y, r] of [[-0.06, 0.12, 0.05], [0.16, 0.12, 0.043], [0.12, 0.56, 0.034]]) {
      B.add('red', xf(toAxis(revolve([[0, 0], [r, 0], [r, 0.02], [r - 0.003, 0.024], [0, 0.024]], 28), 'z'), [x, y, ZW + 0.01]));
      B.soft('red', xf(toAxis(new THREE.TorusGeometry(r, 0.0035, 5, 28).rotateX(Math.PI / 2), 'z'), [x, y, ZW + 0.011]));
    }
    for (const [x, y, r] of [[0.06, 0.74, 0.028], [-0.0, 0.22, 0.022]]) {
      B.add('red', xf(toAxis(revolve([[0, 0], [r, 0], [r, 0.022], [r * 0.85, 0.028], [0, 0.028]], 24), 'z'), [x, y, ZW + 0.01]));
    }
    // Tablette de la pompe à eau (dessus à y = 0,60) et goussets.
    const xs0 = sx(0.6) - 0.004;
    B.add('red', xf(box(0.47 - xs0, 0.012, 0.64, 0.002), [(0.47 + xs0) / 2, 0.594, -0.01]));
    for (const z of [-0.27, 0.25]) {
      B.add('red', xf(shapeGeo([[sx(0.588) - 0.003, 0.588], [0.45, 0.588], [sx(0.36) - 0.003, 0.36]], 0.01), [0, 0, z]));
      B.soft('red', weld([sx(0.588), 0.586, z + 0.006], [sx(0.37), 0.37, z + 0.006], 0.003));
    }
    B.soft('red', weld([sx(0.6) + 0.001, 0.6015, -0.325], [sx(0.6) + 0.001, 0.6015, 0.305], 0.0035));
    B.soft('red', weld([sx(0.588) + 0.002, 0.587, -0.325], [sx(0.588) + 0.002, 0.587, 0.305], 0.0035));
    // Face inclinée : plats de rive, patte à deux trous, agrafes du tuyau d'eau.
    for (const z of [0.5, -0.5]) B.add('red', xf(box(0.008, 0.2, 0.04, 0.002), onS(0.72, z, 0.004), ROT_S));
    B.add('red', xf(extX([[-0.05, -0.02], [0.05, -0.02], [0.05, 0.02], [-0.05, 0.02]], 0.008, { holes: [[-0.028, 0, 0.006], [0.028, 0, 0.006]] }), onS(0.12, -0.12, 0.004), ROT_S));
    for (const z of [-0.07, -0.035]) B.add('red', xf(box(0.022, 0.035, 0.006, 0.0015), onS(0.27, z, 0.011), ROT_S));
    // Côté -Z : pattes des blocs de serrage (ligne d'air et ligne d'eau).
    for (const [x, y, hh, zc, w] of [[-0.36, YA, 0.05, ZA, 0.1], [0.24, YA, 0.05, ZA, 0.1], [-0.3, YWL, 0.035, ZWL, 0.07], [0.2, YWL, 0.035, ZWL, 0.07]]) {
      const t = -ZW - 0.01 - (zc + w / 2 + 0.012);
      B.add('red', xf(box(0.07, hh * 2 + 0.015, t, 0.002), [x, y, -ZW - 0.01 - t / 2]));
    }
    // Bouchon de vidange (chanfrein arrière) et plaque signalétique.
    const ch = new THREE.Vector3(0.22, -0.065, 0).normalize();
    const dn = [ch.y, -ch.x, 0];
    B.add('steel', aim(hex(0.03, 0.014), [-0.31 + dn[0] * 0.007, 0.0325 + dn[1] * 0.007, 0.35], dn));
    nameplate(B, [-0.02, 0.845, ZW + 0.01], [0, 0, 1], [0, 1, 0], 0.1, 0.055);
    // Intérieur (visible en coupe) : chicane à fenêtres côté -Z, tubes d'aspiration
    // à crépines (vers le centre), descente de retour à diffuseur.
    const baf = roundPoly(offsetPoly(PROF, -TW - 0.004).map(([x, y]) => [x, Math.min(y, 0.72)]), 0.01, 2);
    const win = (x0, x1) => roundPoly([[x0, 0.25], [x1, 0.25], [x1, 0.55], [x0, 0.55]], 0.03, 3);
    B.add('red', xf(shapeGeo(baf, 0.005, { polys: [win(-0.34, -0.1), win(-0.02, 0.2), [[-0.1, 0.012], [0.08, 0.012], [0.08, 0.07], [-0.1, 0.07]]] }), [0, 0, -0.35]));
    for (const [x, y, r] of [[-0.06, 0.12, 0.03], [0.16, 0.12, 0.024]]) {
      B.add('steel', xf(toAxis(cyl(r, 0.6, { seg: 20 }), 'z'), [x, y, ZW - 0.3]));
      B.add('darkSteel', xf(toAxis(cyl(r * 1.25, 0.016, { seg: 20 }), 'z'), [x, y, -0.008]));
      B.add('~mesh', xf(toAxis(cyl(r * 1.45, 0.22, { seg: 20 }), 'z'), [x, y, -0.126]));
      B.add('darkSteel', xf(toAxis(cyl(r * 1.52, 0.012, { seg: 20 }), 'z'), [x, y, -0.242]));
      for (let k = 1; k < 4; k++) B.add('darkSteel', xf(toAxis(ring(r * 1.5, r * 1.4, 0.005, 20), 'z'), [x, y, -0.016 - k * 0.055]));
    }
    B.add('steel', pipe([[0.12, 0.56, ZW - 0.004], [0.12, 0.56, -0.1], [0.12, 0.26, -0.1]], 0.018, 0.05, 14));
    B.add('steel', xf(revolve([[0.018, 0], [0.034, -0.035], [0.032, -0.039], [0.016, -0.006]], 16), [0.12, 0.26, -0.1]));
    P('36', B.group({ interior: true }), [0, 0, 0]);
  }

  // 35 — Pompe à eau (F12) sur la tablette : arbre vers -Z, culasse vers l'avant.
  const wp = api.sub('F12');
  xf0(wp, [0.335, 0.7, 0.15], [0, Math.PI / 2, 0]);
  P('35', wp, [0.55, 0.28, 0]);

  // 18 — Panneau électrique principal (face arrière) : porte, charnières, serrures, presse-étoupes.
  {
    const B = bag();
    const x0 = -0.638, x1 = -0.432, y0 = 0.1, y1 = 0.88, z0 = -0.6, z1 = 0.02;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
    B.add('grey', xf(box(x1 - x0, y1 - y0, z1 - z0, 0.012), [cx, cy, cz]));
    B.add('grey', xf(box(0.008, y1 - y0 - 0.03, z1 - z0 - 0.03, 0.005), [x0 - 0.003, cy, cz]));
    for (const y of [0.2, 0.49, 0.78]) {
      B.add('steel', xf(cyl(0.0065, 0.05, { seg: 12 }), [x0 - 0.006, y, z0 + 0.004]));
      B.add('grey', xf(box(0.004, 0.044, 0.03), [x0 - 0.003, y, z0 + 0.02]));
    }
    for (const y of [0.3, 0.68]) {
      B.add('black', xf(toAxis(revolve([[0, 0], [0.016, 0], [0.016, 0.006], [0.012, 0.009], [0, 0.009]], 18), '-x'), [x0 - 0.007, y, z1 - 0.05]));
      B.add('steel', xf(box(0.004, 0.018, 0.004), [x0 - 0.017, y, z1 - 0.05]));
    }
    nameplate(B, [x0 - 0.007, 0.8, cz], [-1, 0, 0], [0, 1, 0], 0.16, 0.05);
    // Pattes de fixation murale (aux 4 coins) boulonnées sur la face arrière.
    for (const y of [y0 + 0.04, y1 - 0.04]) {
      for (const z of [z0 - 0.022, z1 + 0.022]) {
        B.add('grey', xf(box(0.012, 0.05, 0.05, 0.003), [x1 + 0.006, y, z]));
        B.add('steel', bolt([x1, y, z], [-1, 0, 0], 0.009));
      }
    }
    // Entrée de câble (dessus, bouchon) et presse-étoupes inférieurs avec câbles.
    B.add('black', gland([cx, y1, z0 + 0.08], [0, 1, 0], 0.04));
    const G = bag();
    [-0.2, -0.32, -0.44].forEach((z, i) => {
      G.add('black', gland([cx + 0.02, y0, z], [0, -1, 0], 0.022));
      cable(G, [[cx + 0.02, y0 - 0.014, z], [cx + 0.02, y0 - 0.05, z], [cx + 0.07, y0 - 0.085, z + 0.01 * i], [-0.37 + i * 0.02, 0.013, z + 0.05]], 0.008);
    });
    const g = B.group();
    G.group().children.forEach((m) => g.add(m));
    P('18', g, [-0.75, 0.1, 0]);
  }

  // 19 — Transformateur (boîtier gris à pattes) et câble vers le panneau.
  {
    const B = bag();
    const x0 = -0.585, x1 = -0.438, cy = 0.62, cz = 0.17;
    B.add('grey', xf(box(x1 - x0, 0.25, 0.2, 0.01), [(x0 + x1) / 2, cy, cz]));
    B.add('grey', xf(box(0.006, 0.23, 0.18, 0.004), [x0 - 0.002, cy, cz]));
    for (const [y, z] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) B.add('steel', xf(toAxis(cyl(0.006, 0.004, { seg: 12 }), '-x'), [x0 - 0.006, cy + y * 0.1, cz + z * 0.075]));
    for (const y of [cy - 0.105, cy + 0.105]) {
      B.add('grey', xf(box(0.01, 0.03, 0.26, 0.002), [x1 + 0.006, y, cz]));
      for (const z of [cz - 0.115, cz + 0.115]) B.add('steel', bolt([x1, y, z], [-1, 0, 0], 0.008));
    }
    nameplate(B, [x0 - 0.005, cy + 0.05, cz], [-1, 0, 0], [0, 1, 0], 0.08, 0.045);
    B.add('black', gland([(x0 + x1) / 2, cy - 0.125, cz - 0.05], [0, -1, 0], 0.02));
    cable(B, [[(x0 + x1) / 2, cy - 0.14, cz - 0.05], [(x0 + x1) / 2, cy - 0.2, cz - 0.05], [-0.53, 0.36, 0.06], [-0.53, 0.33, 0.035]], 0.008);
    B.add('black', gland([-0.53, 0.33, 0.02], [0, 0, 1], 0.02));
    P('19', B.group(), [-0.6, -0.02, 0.08]);
  }

  // Réservoir d'huile de marteau (côté +Z) : 26 cuve, 20 pompe, 22 bouchon crépine,
  // 21 régulateur d'air, 23 manomètre, 24 niveau, 25 vanne 3/4", 27 clapet 1/4".
  const OX0 = -0.39, OX1 = -0.08, OY0 = 0.3, OY1 = 0.7, OZ0 = 0.634, OZ1 = 0.784;
  const OZ = (OZ0 + OZ1) / 2;
  const EZ = 0.55; // éclatement commun côté +Z
  {
    const B = bag();
    // Plaque de fixation (bord supérieur replié) boulonnée sur les plats d'appui.
    B.add('black', xf(box(0.38, 0.52, 0.01, 0.003), [-0.23, 0.52, ZW + 0.029]));
    B.add('black', xf(box(0.38, 0.008, 0.035, 0.002), [-0.23, 0.776, ZW + 0.045]));
    for (const x of [-0.408, -0.055]) for (const y of [0.33, 0.75]) B.add('steel', bolt([x, y, ZW + 0.034], [0, 0, 1], 0.009));
    B.add('black', xf(box(OX1 - OX0, OY1 - OY0, OZ1 - OZ0, 0.008), [(OX0 + OX1) / 2, (OY0 + OY1) / 2, OZ]));
    // Cordons verticaux de la cuve soudée et trappe de visite boulonnée.
    for (const x of [OX0, OX1]) B.soft('black', weld([x, OY0 + 0.01, OZ1 - 0.0005], [x, OY1 - 0.01, OZ1 - 0.0005], 0.003));
    B.add('lightGrey', xf(box(0.085, 0.004, 0.075, 0.002), [-0.24, OY1 + 0.002, OZ + 0.01]));
    for (const [dx, dz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) B.add('steel', buttonHead([-0.24 + dx * 0.033, OY1 + 0.004, OZ + 0.01 + dz * 0.028], [0, 1, 0], 0.005));
    B.add('black', xf(cyl(0.03, 0.012, { seg: 24 }), [-0.335, OY1 + 0.006, OZ + 0.01]));
    B.add('black', xf(cyl(0.012, 0.012, { seg: 16 }), [-0.3, OY0 - 0.006, OZ]));
    B.add('black', xf(toAxis(cyl(0.01, 0.012, { seg: 16 }), 'x'), [OX1 + 0.006, 0.56, OZ + 0.02]));
    nameplate(B, [-0.23, 0.42, OZ1], [0, 0, 1], [0, 1, 0], 0.08, 0.045);
    P('26', B.group(), [0, 0, EZ]);
  }
  {
    // 20 — Pompe à huile de marteau (pneumatique, verticale sur la cuve).
    const B = bag(), px = -0.13, pz = 0.69;
    B.add('steel', xf(box(0.06, 0.008, 0.06, 0.002), [px, OY1 + 0.004, pz]));
    for (const [dx, dz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) B.add('steel', bolt([px + dx * 0.022, OY1 + 0.008, pz + dz * 0.022], [0, 1, 0], 0.006));
    B.add('steel', xf(cyl(0.016, 0.1, { seg: 20 }), [px, OY1 + 0.058, pz]));
    B.add('~urethane', xf(cyl(0.02, 0.014, { seg: 20 }), [px, OY1 + 0.08, pz]));
    B.add('~alu', xf(box(0.046, 0.032, 0.046, 0.004), [px, OY1 + 0.124, pz]));
    B.add('steel', xf(toAxis(hex(0.02, 0.012), 'x'), [px + 0.029, OY1 + 0.124, pz]));
    B.add('steel', SH.fitting(0.016, 0.03, 'steel', { axis: 'x', elbow: true }).translateX(px + 0.05).translateY(OY1 + 0.124).translateZ(pz));
    for (const y of [OY1 + 0.144, OY1 + 0.27]) B.add('~alu', xf(box(0.062, 0.01, 0.062, 0.003), [px, y, pz]));
    B.add('~alu', xf(cyl(0.024, 0.12, { seg: 24 }), [px, OY1 + 0.207, pz]));
    for (const [dx, dz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      B.add('steel', xf(cyl(0.003, 0.13, { seg: 8 }), [px + dx * 0.025, OY1 + 0.207, pz + dz * 0.025]));
      B.add('steel', xf(hex(0.008, 0.005), [px + dx * 0.025, OY1 + 0.278, pz + dz * 0.025]));
    }
    B.add('~alu', xf(box(0.058, 0.045, 0.05, 0.008), [px, OY1 + 0.3, pz]));
    B.add('~alu', xf(revolve([[0, 0], [0.016, 0], [0.016, 0.012], [0.012, 0.02, true], [0, 0.024]], 16), [px, OY1 + 0.322, pz]));
    B.add('steel', SH.fitting(0.012, 0.026, 'steel', { axis: 'x' }).translateX(px + 0.04).translateY(OY1 + 0.3).translateZ(pz));
    P('20', B.group(), [0, 0.45, EZ]);
  }
  {
    // 22 — Bouchon crépine de remplissage (cannelé).
    const B = bag(), cx = -0.335, cz = OZ + 0.01, y = OY1 + 0.012;
    B.add('steel', xf(revolve([[0, 0], [0.026, 0], [0.026, 0.006], [0.022, 0.008], [0, 0.008]], 24), [cx, y, cz]));
    B.add('black', xf(revolve([[0, 0], [0.028, 0], [0.03, 0.004], [0.03, 0.026], [0.026, 0.032], [0.018, 0.036, true], [0, 0.037]], 24), [cx, y + 0.008, cz]));
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      B.add('black', xf(box(0.006, 0.02, 0.004, 0.0015), [cx + Math.cos(a) * 0.03, y + 0.022, cz + Math.sin(a) * 0.03], [0, -a, 0]));
    }
    P('22', B.group(), [0, 0.32, EZ]);
  }
  {
    // 21 — Régulateur de pression d'air (chapeau rond, purge) sur la tête de pompe.
    const B = bag(), x = -0.2, y = OY1 + 0.285, z = 0.69;
    B.add('steel', xf(toAxis(cyl(0.007, 0.03, { seg: 10 }), 'x'), [x + 0.035, y, z]));
    B.add('~alu', xf(box(0.034, 0.034, 0.034, 0.005), [x, y, z]));
    B.add('~alu', xf(revolve([[0, 0], [0.021, 0], [0.022, 0.006], [0.022, 0.03], [0.018, 0.036, true], [0, 0.04]], 20), [x, y + 0.017, z]));
    B.add('~alu', xf(revolve([[0, 0], [0.012, 0], [0.014, -0.03], [0.012, -0.034], [0, -0.034]], 16), [x, y - 0.017, z]));
    B.add('steel', xf(box(0.018, 0.003, 0.003), [x, y - 0.054, z]));
    B.add('steel', xf(cyl(0.0025, 0.012, { seg: 8 }), [x, y - 0.048, z]));
    P('21', B.group(), [-0.15, 0.45, EZ]);
  }
  {
    // 23 — Manomètre du régulateur.
    const B = bag();
    B.add(null, SH.gauge(0.02, { axis: 'z' }).translateX(-0.2).translateY(OY1 + 0.285).translateZ(0.69 + 0.04));
    P('23', B.group(), [-0.15, 0.45, EZ + 0.2]);
  }
  {
    // 24 — Indicateur de niveau d'huile de marteau (face -X de la cuve).
    const B = bag(), x = OX0 - 0.007, z = OZ + 0.01;
    B.add('black', xf(box(0.014, 0.22, 0.032, 0.004), [x, 0.5, z]));
    B.add('glass', xf(box(0.004, 0.17, 0.016, 0.0015), [x - 0.008, 0.5, z]));
    B.add('~oil', xf(box(0.004, 0.11, 0.012, 0.001), [x - 0.006, 0.47, z]));
    for (const y of [0.405, 0.595]) B.add('steel', bolt([x - 0.007, y, z], [-1, 0, 0], 0.008));
    P('24', B.group(), [-0.25, 0, EZ]);
  }
  {
    // 25 — Vanne 3/4" de vidange sous la cuve (mamelon + vanne verticale).
    const B = bag();
    B.add('steel', xf(cyl(0.01, 0.03, { seg: 12 }), [-0.3, OY0 - 0.02, OZ]));
    B.add(null, SH.ballValve(0.024, 'brass', { axis: 'y' }).translateX(-0.3).translateY(OY0 - 0.06).translateZ(OZ));
    P('25', B.group(), [0, -0.25, EZ]);
  }
  {
    // 27 — Clapet anti-retour 1/4" (face +X de la cuve) sur coude.
    const B = bag();
    B.add('steel', xf(toAxis(hex(0.018, 0.01), 'x'), [OX1 + 0.005, 0.56, OZ + 0.02]));
    B.add('steel', pipe([[OX1 + 0.01, 0.56, OZ + 0.02], [OX1 + 0.034, 0.56, OZ + 0.02], [OX1 + 0.034, 0.53, OZ + 0.02]], 0.0065, 0.012, 12));
    B.add('black', xf(hex(0.022, 0.06), [OX1 + 0.034, 0.5, OZ + 0.02]));
    B.add('steel', xf(hex(0.016, 0.01), [OX1 + 0.034, 0.465, OZ + 0.02]));
    P('27', B.group(), [0.2, 0, EZ]);
  }

  // 28 — Niveau d'huile hydraulique (face +Z) : cadre noir, voyant, vis creuses.
  {
    const B = bag(), x = 0.0, z = ZW + 0.01;
    B.add('black', xf(box(0.034, 0.21, 0.014, 0.004), [x, 0.48, z + 0.007]));
    B.add('glass', xf(box(0.016, 0.16, 0.004, 0.0015), [x, 0.48, z + 0.015]));
    B.add('~oil', xf(box(0.012, 0.1, 0.004, 0.001), [x, 0.45, z + 0.013]));
    for (const y of [0.39, 0.57]) B.add('steel', bolt([x, y, z + 0.014], [0, 0, 1], 0.01));
    P('28', B.group(), [0, 0, 0.3]);
  }

  // 29 — Tête du filtre de retour (alu) sur le piquage +Z, 30 — cartouche vissée.
  {
    const B = bag(), x = 0.12, y = 0.56, z = ZW + 0.034;
    B.add('~alu', xf(box(0.076, 0.06, 0.072, 0.008), [x, y, z + 0.036]));
    B.add('~alu', xf(toAxis(cyl(0.024, 0.016, { seg: 20 }), 'x'), [x + 0.044, y + 0.006, z + 0.036]));
    B.add(null, SH.fitting(0.026, 0.05, 'steel', { axis: 'x', elbow: true }).translateX(x + 0.06).translateY(y + 0.006).translateZ(z + 0.036));
    B.add('~alu', xf(cyl(0.014, 0.012, { seg: 16 }), [x - 0.02, y + 0.036, z + 0.036]));
    B.add('red', xf(cyl(0.008, 0.012, { seg: 12 }), [x - 0.02, y + 0.046, z + 0.036]));
    B.add('steel', xf(cyl(0.012, 0.012, { seg: 16 }), [x, y - 0.034, z + 0.036]));
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B.add('steel', capScrew([x + dx * 0.028, y + dy * 0.021, z + 0.072], [0, 0, 1], 0.006));
    P('29', B.group(), [0, 0.15, 0.35]);
  }
  {
    const B = bag(), x = 0.12, z = ZW + 0.07;
    B.add('white', xf(revolve([[0, 0], [0.036, 0], [0.042, 0.008, true], [0.044, 0.02], [0.044, 0.12], [0.041, 0.128], [0.038, 0.13], [0, 0.13]], 28), [x, 0.39, z]));
    B.add('darkSteel', xf(revolve([[0.03, 0], [0.04, 0], [0.04, 0.005], [0.03, 0.005]], 28), [x, 0.52, z]));
    B.add('~tag', xf(revolve([[0.0442, 0], [0.0442, 0.05]], 28).translate(0, 0, 0), [x, 0.43, z]));
    P('30', B.group(), [0, -0.3, 0.35]);
  }

  // Aspirations (bas +Z) : coudes noirs et 1 — vanne 2", 31 — vanne 1 1/2".
  for (const [ref, x, r, zr, sz, xv] of [['1', -0.06, 0.03, 0.81, 0.05, 0.2], ['31', 0.16, 0.024, 0.7, 0.042, 0.27]]) {
    const B = bag();
    B.add('black', pipe([[x, 0.12, ZW + 0.034], [x, 0.12, zr], [xv - sz * 1.15, 0.12, zr]], r, r * 2.2, 18));
    B.add('black', xf(toAxis(hex(r * 2.3, 0.014), 'z'), [x, 0.12, ZW + 0.04]));
    B.add(null, SH.ballValve(sz, 'brass', { axis: 'x' }).translateX(xv).translateY(0.12).translateZ(zr));
    P(ref, B.group(), [0.18, -0.08, 0.42]);
  }

  // Côté -Z, ligne d'air 2" : 1 — vanne, 2 — blocs fendus, 3 — séparateur d'eau
  // (+4 élément), 5/6 — raccords, 7 — filtre à air (+9 élément), 8 — purges.
  const EA = -0.5; // éclatement commun (vers -Z)
  {
    const B = bag();
    B.add(null, SH.ballValve(0.05, 'brass', { axis: 'x' }).translateX(-0.505).translateY(YA).translateZ(ZA));
    B.add('black', xf(toAxis(cyl(0.03, 0.17, { seg: 24 }), 'x'), [-0.37, YA, ZA]));
    P('1', B.group(), [-0.32, 0.2, EA]);
  }
  for (const [x, ex] of [[-0.36, -0.12], [0.24, 0.3]]) {
    const B = bag();
    splitBloc(B, [x, YA, ZA], { rp: 0.031, w: 0.1, hh: 0.05, len: 0.075 });
    if (x > 0) {
      // Manchon noir après le filtre à air, coude caoutchouc et collier.
      B.add('black', xf(toAxis(cyl(0.03, 0.12, { seg: 24 }), 'x'), [0.23, YA, ZA]));
      B.soft('~hose', pipe([[0.285, YA, ZA], [0.37, YA, ZA], [0.37, YA + 0.11, ZA]], 0.036, 0.06, 18));
      B.add('steel', xf(toAxis(ring(0.04, 0.036, 0.012, 24), 'x'), [0.3, YA, ZA]));
      B.add('steel', xf(ring(0.04, 0.036, 0.012, 24), [0.37, YA + 0.1, ZA]));
    }
    P('2', B.group(), [ex, 0.2, EA]);
  }
  {
    const B = bag();
    const yb = filterBody(B, { r: 0.065, h: 0.38, body: 'black', portR: 0.03, top: 'round' });
    const g = B.group({ interior: true });
    P('3', xf0(g, [-0.2, YA, ZA]), [0, 0.2, EA]);
    void yb;
  }
  {
    const B = bag();
    element(B, 0.045, 0.24, { cap: 'cream', crown: true });
    P('4', xf0(B.group(), [-0.2, YA - 0.2, ZA]), [0, 0.78, EA]);
  }
  {
    // 5 — Union 2" (écrou à oreilles six-pans) ; 6 — mamelon 2".
    const B = bag();
    B.add('steel', xf(toAxis(revolve([[0, 0], [0.036, 0], [0.036, 0.012], [0.032, 0.014], [0.032, 0.03], [0, 0.03]], 24), 'x'), [-0.118, YA, ZA]));
    B.add('steel', xf(toAxis(hex(0.084, 0.024), 'x'), [-0.098, YA, ZA]));
    P('5', B.group(), [0.06, 0.2, EA]);
  }
  {
    const B = bag();
    B.add('steel', xf(toAxis(hex(0.07, 0.018), 'x'), [-0.055, YA, ZA]));
    B.add('steel', xf(toAxis(revolve([[0, 0], [0.032, 0], [0.031, 0.006], [0.033, 0.01], [0.031, 0.014], [0.033, 0.018], [0.031, 0.022], [0.03, 0.026], [0, 0.026]], 24), 'x'), [-0.046, YA, ZA]));
    B.add('steel', xf(toAxis(revolve([[0, 0], [0.032, 0], [0.031, 0.006], [0.033, 0.01], [0.031, 0.014], [0.033, 0.018], [0.031, 0.022], [0.03, 0.026], [0, 0.026]], 24), '-x'), [-0.064, YA, ZA]));
    P('6', B.group(), [0.14, 0.2, EA]);
  }
  {
    const B = bag();
    filterBody(B, { r: 0.07, h: 0.41, body: 'red', portR: 0.03, top: 'square' });
    P('7', xf0(B.group({ interior: true }), [0.085, YA, ZA]), [0.22, 0.2, EA]);
  }
  {
    const B = bag();
    element(B, 0.048, 0.26, { cap: 'cream', crown: true });
    P('9', xf0(B.group(), [0.085, YA - 0.21, ZA]), [0.22, 0.8, EA]);
  }
  for (const [x, yb] of [[-0.2, YA - 0.38 - 0.01], [0.085, YA - 0.41 - 0.01]]) {
    const B = bag();
    B.add('brass', xf(cyl(0.006, 0.02, { seg: 10 }), [x, yb - 0.004, ZA]));
    B.add(null, SH.ballValve(0.014, 'brass', { axis: 'y' }).translateX(x).translateY(yb - 0.03).translateZ(ZA));
    P('8', B.group(), [x < 0 ? 0 : 0.22, -0.12, EA]);
  }

  // Ligne d'eau 1" (bas -Z) : 14 — vannes 1" (collecteur arrière), 13 — blocs fendus,
  // 10 — régulateur / crépine (cloche conique).
  const EW = -0.42;
  [[0.215, true], [0.075, false]].forEach(([y, header]) => {
    const B = bag();
    if (header) {
      B.add('black', xf(cyl(0.0167, 0.2, { seg: 16 }), [-0.47, 0.145, ZWL]));
      B.add('black', xf(cyl(0.02, 0.012, { seg: 16 }), [-0.47, 0.25, ZWL]), xf(cyl(0.02, 0.012, { seg: 16 }), [-0.47, 0.04, ZWL]));
      B.add('black', xf(toAxis(cyl(0.0167, 0.04, { seg: 16 }), 'x'), [-0.45, YWL, ZWL]));
    }
    B.add('black', xf(toAxis(cyl(0.0167, 0.03, { seg: 16 }), 'x'), [-0.49, y, ZWL]));
    B.add(null, SH.ballValve(0.03, 'brass', { axis: 'x' }).translateX(-0.535).translateY(y).translateZ(ZWL));
    P('14', B.group(), [-0.3, header ? 0.02 : -0.1, EW]);
  });
  for (const [x, a, b] of [[-0.3, -0.43, -0.088], [0.2, -0.012, 0.31]]) {
    const B = bag();
    splitBloc(B, [x, YWL, ZWL], { rp: 0.0175, w: 0.07, hh: 0.035, len: 0.06 });
    B.add('black', xf(toAxis(cyl(0.0167, b - a, { seg: 16 }), 'x'), [(a + b) / 2, YWL, ZWL]));
    if (x > 0) B.add(null, SH.fitting(0.03, 0.05, 'steel', { axis: 'x' }).translateX(0.33).translateY(YWL).translateZ(ZWL));
    P('13', B.group(), [x < 0 ? -0.12 : 0.12, -0.12, EW]);
  }
  {
    const B = bag(), x = -0.05;
    B.add('lightGrey', xf(box(0.07, 0.05, 0.05, 0.01), [x, YWL, ZWL]));
    for (const s of [-1, 1]) B.add('lightGrey', xf(toAxis(hex(0.04, 0.012), 'x'), [x + s * 0.041, YWL, ZWL]));
    B.add('lightGrey', xf(revolve([[0, 0], [0.036, 0], [0.037, 0.008], [0.03, 0.02], [0.016, 0.07, true], [0.011, 0.085], [0, 0.088]], 24), [x, YWL + 0.024, ZWL]));
    B.add('steel', xf(cyl(0.004, 0.02, { seg: 8 }), [x, YWL + 0.118, ZWL]));
    B.add('steel', xf(hex(0.012, 0.006), [x, YWL + 0.11, ZWL]));
    B.add('lightGrey', xf(revolve([[0, 0], [0.02, 0], [0.022, -0.035], [0.018, -0.04], [0, -0.04]], 20), [x, YWL - 0.024, ZWL]));
    B.add('steel', xf(hex(0.014, 0.008), [x, YWL - 0.068, ZWL]));
    P('10', B.group(), [0, -0.15, EW]);
  }

  // 11 — Boîtes de prises (plastique blanc) et 12 — capteur de niveau d'huile (côté -Z).
  const outlet = (B) => {
    B.add('~plastic', toAxis(revolve([[0, 0], [0.05, 0], [0.052, 0.006], [0.052, 0.06], [0.049, 0.064], [0, 0.064]], 28), 'z'));
    B.add('~plastic', xf(toAxis(revolve([[0, 0], [0.056, 0], [0.056, 0.01], [0.052, 0.014], [0, 0.014]], 28), 'z'), [0, 0, 0.064]));
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      B.add('steel', capScrew([Math.cos(a) * 0.044, Math.sin(a) * 0.044, 0.078], [0, 0, 1], 0.004));
    }
    B.add('black', gland([0, -0.05, 0.034], [0, -1, 0], 0.016));
  };
  {
    const B = bag();
    outlet(B);
    const g = B.group();
    P('11', xf0(g, [0.18, 0.3, -ZW - 0.01], [0, Math.PI, 0]), [0, 0, -0.45]);
  }
  {
    const B = bag();
    outlet(B);
    const g = B.group();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...SN));
    g.quaternion.copy(q);
    g.position.set(...onS(0.83, -0.2, 0.002));
    P('11', g, [0.32, 0.12, 0]);
  }
  {
    const B = bag(), x = 0.18, y = 0.3;
    B.add('steel', xf(toAxis(hex(0.03, 0.012), '-z'), [x, y, -ZW - 0.016]));
    B.add('black', xf(toAxis(cyl(0.016, 0.03, { seg: 18 }), '-z'), [x, y, -ZW - 0.037]));
    B.add('steel', xf(toAxis(cyl(0.006, 0.16, { seg: 10 }), 'z'), [x, y - 0.0, -ZW + 0.07]));
    B.add('black', xf(toAxis(cyl(0.012, 0.03, { seg: 14 }), 'z'), [x, y, -ZW + 0.13]));
    P('12', B.group(), [0, 0, -0.27]);
  }

  // Face inclinée : 32 collecteur de retour, 33 valve ASCO d'eau, 34 refroidisseur d'huile.
  {
    // 32 — Collecteur de retour (bloc noir) sur deux pattes, raccords et boyaux du moteur.
    const B = bag();
    const loc = (o) => (Array.isArray(o) ? o.map(loc) : xf(o, onS(0.15, 0.3), ROT_S));
    B.add('black', loc(xf(box(0.07, 0.065, 0.3, 0.006), [0.042, 0, 0])));
    for (const z of [-0.11, 0.11]) B.add('black', loc(xf(box(0.008, 0.08, 0.03, 0.002), [0.004, 0, z])));
    for (const z of [-0.09, 0, 0.09]) B.add('steel', loc(xf(toAxis(hex(0.024, 0.012), 'x'), [0.082, -0.008, z])));
    for (const z of [-0.06, 0.03]) B.add('steel', loc(xf(hex(0.026, 0.014), [0.042, 0.039, z])));
    // Boyaux du moteur hydraulique de la pompe à eau (orifices A / B).
    const top = (z) => { const p = new THREE.Vector3(0.042, 0.046, z).applyEuler(new THREE.Euler(...ROT_S)); return p.add(V3(onS(0.15, 0.3))); };
    const up = V3([0, 1, 0]).applyEuler(new THREE.Euler(...ROT_S));
    const m1 = [0.335 + 0.077, 0.712, 0.15 - 0.322], m2 = [0.335 + 0.077, 0.712, 0.15 - 0.356];
    hose(B, m1, [1, 0, 0], top(-0.06), up, [[0.52, 0.66, -0.18], [0.52, 0.42, -0.06], [0.42, 0.3, 0.24]], 0.0105);
    hose(B, m2, [1, 0, 0], top(0.03), up, [[0.54, 0.64, -0.21], [0.55, 0.4, -0.04], [0.45, 0.29, 0.33]], 0.0105);
    P('32', B.group(), [0.35, 0.13, 0.06]);
  }
  {
    // 33 — Valve ASCO d'eau (verte) sur agrafes, boyaux : ligne d'eau → valve → pompe.
    const B = bag();
    const S = (o) => (Array.isArray(o) ? o.map(S) : xf(o, onS(0.31, 0.0, 0.0), ROT_S));
    B.add('green', S(xf(box(0.04, 0.045, 0.06, 0.006), [0.028, 0, 0])));
    B.add('green', S(xf(toAxis(revolve([[0, 0], [0.019, 0], [0.019, 0.04], [0.016, 0.046, true], [0, 0.048]], 20), 'x'), [0.048, 0, 0])));
    B.add('steel', S(xf(toAxis(hex(0.012, 0.008), 'x'), [0.1, 0, 0])));
    for (const s of [-1, 1]) {
      B.add('steel', S(xf(toAxis(hex(0.024, 0.012), s > 0 ? 'z' : '-z'), [0.028, 0, s * 0.036])));
      B.add('steel', S(xf(toAxis(cyl(0.008, 0.014, { seg: 12 }), s > 0 ? 'z' : '-z'), [0.028, 0, s * 0.049])));
    }
    const pt = (z) => V3([0.028, 0, z]).applyEuler(new THREE.Euler(...ROT_S)).add(V3(onS(0.31, 0)));
    hose(B, [0.37, YWL, ZWL], [1, 0, 0], pt(-0.056), [0, 0, -1], [[0.47, 0.17, -0.62], [0.47, 0.26, -0.35], [0.4, 0.31, -0.14]], 0.012);
    hose(B, pt(0.056), [0, 0, 1], [0.55, 0.535, 0.15], [0, -1, 0], [[0.39, 0.33, 0.13], [0.5, 0.4, 0.15]], 0.011);
    P('33', B.group(), [0.33, 0.12, 0]);
  }
  {
    // 34 — Refroidisseur d'huile (calandre noire) parallèle à la face, pattes et coudes.
    const B = bag();
    const S = (o) => (Array.isArray(o) ? o.map(S) : xf(o, onS(0.12, -0.42, 0.0), ROT_S));
    const off = 0.068, L = 0.44;
    B.add('black', S(xf(cyl(0.037, L - 0.06, { seg: 28 }), [off, L / 2, 0])));
    for (const s of [0, 1]) {
      const y = s ? L - 0.02 : 0.02;
      B.add('black', S(xf(revolve([[0, -0.02], [0.04, -0.02], [0.042, -0.017], [0.042, 0.017], [0.04, 0.02], [0, 0.02]], 28), [off, y, 0])));
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        B.add('steel', S(aim(hex(0.01, 0.006), [off + Math.cos(a) * 0.035, s ? L + 0.003 : -0.003, Math.sin(a) * 0.035], [0, s ? 1 : -1, 0])));
      }
      B.add('steel', S(aim(cyl(0.008, 0.03, { seg: 12 }), [off, s ? L + 0.012 : -0.012, 0], [0, 1, 0])));
      // Orifices d'huile : coudes gris sur le côté de la calandre.
      B.add('lightGrey', S(xf(toAxis(cyl(0.013, 0.02, { seg: 14 }), '-z'), [off, s ? L - 0.07 : 0.07, -0.042])));
      B.add('lightGrey', S(xf(toAxis(pipe([[0, 0, 0], [0, 0, -0.025], [0.03, 0, -0.025]], 0.011, 0.012, 12), 'y'), [off, s ? L - 0.07 : 0.07, -0.05])));
    }
    // Pattes : plaque large en haut, semelle en bas (sur entretoises boulonnées).
    for (const [y, w] of [[L - 0.08, 0.13], [0.09, 0.09]]) {
      B.add('black', S(xf(box(0.006, 0.04, w, 0.002), [0.006, y, 0])));
      B.add('black', S(xf(box(0.034, 0.012, 0.03, 0.002), [0.024, y, 0])));
      for (const z of [-w / 2 + 0.014, w / 2 - 0.014]) B.add('steel', S(bolt([0.009, y, z], [1, 0, 0], 0.007)));
    }
    P('34', B.group(), [0.38, 0.14, -0.05]);
  }

  // Dessus : 15 projecteurs DEL sur étriers (vers l'avant).
  for (const z of [0.47, -0.52]) {
    const B = bag(), y = H + 0.075 + 0.05;
    B.add('black', xf(extX(strip([[-0.054, -0.05], [-0.054, 0], [0.054, 0], [0.054, -0.05]], 0.004, 0.005), 0.025).rotateZ(Math.PI), [0.0, y - 0.044, z]));
    B.add('steel', bolt([0.0, y - 0.044, z], [0, 1, 0], 0.008));
    for (const s of [-1, 1]) B.add('black', xf(toAxis(revolve([[0, 0], [0.011, 0], [0.011, 0.008], [0.008, 0.012], [0, 0.012]], 14), s > 0 ? 'z' : '-z'), [0.0, y, z + s * 0.058]));
    B.add('black', xf(toAxis(revolve([[0, -0.03], [0.02, -0.03, true], [0.036, -0.022, true], [0.044, -0.008], [0.045, 0.014], [0.048, 0.018], [0.048, 0.026], [0.04, 0.028], [0, 0.028]], 28), 'x'), [0.0, y, z]));
    B.add('lamp', xf(toAxis(revolve([[0, 0], [0.039, 0], [0.039, 0.002], [0.03, 0.005, true], [0, 0.006]], 28), 'x'), [0.028, y, z]));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      B.add('steel', xf(toAxis(cyl(0.0025, 0.003, { seg: 6 }), 'x'), [0.028, y + Math.sin(a) * 0.043, z + Math.cos(a) * 0.043]));
    }
    B.add('black', gland([-0.03, y, z], [-1, 0, 0], 0.012));
    cable(B, [[-0.036, y, z], [-0.06, y - 0.01, z], [-0.075, H + 0.02, z + 0.03], [-0.12, H + 0.006, z + 0.06]], 0.004);
    P('15', B.group(), [0.25, 0.32, z * 0.25]);
  }

  // 16 — Banc de distributeurs de translation (sections empilées selon Z, leviers vers l'arrière).
  {
    const B = bag();
    const y0 = H + 0.022, h = 0.145, cyB = y0 + h / 2, d = 0.12;
    const secs = [[0.12, 0.055, 'in'], [0.065, 0.05, 's'], [0.015, 0.05, 's'], [-0.035, 0.045, 'out'], [-0.08, 0.04, 'pb']];
    // Cornières d'appui boulonnées sur les semelles.
    for (const z of [RZ + 0.075, RZ - 0.085]) {
      B.add('black', xf(box(0.1, 0.014, 0.04, 0.002), [RX + 0.01, H + 0.015, z]));
      for (const x of [RX - 0.025, RX + 0.045]) B.add('steel', bolt([x, H + 0.022, z], [0, 1, 0], 0.007));
    }
    for (const [zc, w, kind] of secs) {
      const z = RZ + zc - w / 2 + 0.02;
      const hh = kind === 's' ? h : kind === 'pb' ? h * 0.75 : h * 1.06;
      B.add('black', xf(box(d, hh, w - 0.002, 0.005), [RX, y0 + hh / 2, z]));
      if (kind === 's') {
        // Chapeau de ressort (avant), étrier de levier (arrière), orifices A / B.
        B.add('darkSteel', xf(box(0.012, 0.05, w * 0.72, 0.004), [RX + d / 2 + 0.006, cyB + 0.01, z]));
        B.add('darkSteel', xf(toAxis(cyl(0.012, 0.03, { seg: 16 }), 'x'), [RX + d / 2 + 0.025, cyB + 0.01, z]));
        B.add('darkSteel', xf(box(0.024, 0.026, 0.026, 0.003), [RX - d / 2 - 0.012, cyB + 0.035, z]));
        for (const dx of [-0.026, 0.026]) {
          B.add('steel', xf(hex(0.024, 0.012), [RX + dx, y0 + h + 0.006, z]));
          B.add('steel', xf(cyl(0.008, 0.014, { seg: 12 }), [RX + dx, y0 + h + 0.018, z]));
        }
        const a = V3([RX - d / 2 - 0.018, cyB + 0.04, z]), b = V3([RX - 0.17, cyB + 0.2, z]);
        B.add('steel', aim(cyl(0.0055, a.distanceTo(b), { seg: 10 }), a.clone().add(b).multiplyScalar(0.5), b.clone().sub(a)));
        B.add('black', aim(revolve([[0, -0.022], [0.009, -0.022], [0.0135, -0.008, true], [0.0145, 0.008, true], [0.011, 0.02, true], [0, 0.023]], 16), b, b.clone().sub(a)));
      } else if (kind === 'in') {
        // Orifices P / T (bouchons) et cartouche de limiteur de pression sur le dessus.
        for (const dy of [-0.025, 0.025]) B.add('steel', xf(toAxis(hex(0.03, 0.014), 'z'), [RX, cyB + dy, z + w / 2 + 0.006]));
        B.add('steel', xf(hex(0.026, 0.014), [RX + 0.02, y0 + hh + 0.007, z]));
        B.add('darkSteel', xf(revolve([[0, 0], [0.011, 0], [0.011, 0.03], [0.009, 0.034], [0, 0.034]], 14), [RX + 0.02, y0 + hh + 0.014, z]));
        B.add('steel', xf(hex(0.016, 0.008), [RX + 0.02, y0 + hh + 0.052, z]));
      }
    }
    // Tirants et écrous.
    const zA = RZ + 0.14, zB = RZ - 0.1;
    for (const [dx, dy] of [[-0.035, -0.04], [0.035, -0.04], [-0.035, 0.045], [0.035, 0.045]]) {
      B.add('steel', xf(toAxis(cyl(0.004, zA - zB + 0.02, { seg: 8 }), 'z'), [RX + dx, cyB + dy, (zA + zB) / 2]));
      B.add('steel', xf(toAxis(hex(0.012, 0.008), 'z'), [RX + dx, cyB + dy, zA + 0.004]), xf(toAxis(hex(0.012, 0.008), 'z'), [RX + dx, cyB + dy, zB - 0.004]));
    }
    nameplate(B, [RX + d / 2, cyB - 0.03, RZ + 0.112], [1, 0, 0], [0, 1, 0], 0.035, 0.03);
    P('16', B.group(), [0, 0.32, 0]);
  }

  // 17 — Toit de protection (tôle rouge, pieds en U à semelles, poignée tubulaire).
  {
    const B = bag();
    const yT = H + 0.3, z0 = RZ - 0.27, z1 = RZ + 0.27;
    const lip = [[-0.12, -0.022], [-0.12, 0], [0.12, 0], [0.12, -0.022]];
    B.add('red', xf(shapeGeo(strip(lip, 0.005, 0.006), z1 - z0), [RX, yT - 0.005, RZ]));
    for (const z of [RZ + 0.245, RZ - 0.245]) {
      B.add('red', xf(extY(strip([[-0.035, -0.012], [-0.035, 0.012], [0.035, 0.012], [0.035, -0.012]], 0.004, 0.005), yT - H - 0.016), [RX, (yT + H + 0.006) / 2, z]));
      B.add('red', xf(extY([[-0.07, -0.0375], [0.07, -0.0375], [0.07, 0.0375], [-0.07, 0.0375]], 0.008, { holes: [[-0.048, 0, 0.0065], [0.048, 0, 0.0065]] }), [RX, H + 0.012, z]));
      for (const x of [RX - 0.048, RX + 0.048]) B.add('steel', bolt([x, H + 0.016, z], [0, 1, 0], 0.008));
      for (const s of [-1, 1]) B.soft('red', weld([RX - 0.036, H + 0.017, z + s * 0.016], [RX + 0.036, H + 0.017, z + s * 0.016], 0.0028));
    }
    B.add('red', pipe([[RX - 0.02, yT - 0.012, z1 - 0.01], [RX - 0.02, yT - 0.012, z1 + 0.06], [RX - 0.02, yT - 0.15, z1 + 0.06], [RX - 0.02, yT - 0.15, z1 - 0.026]], 0.0075, 0.025, 10));
    P('17', B.group(), [0, 0.65, 0]);
  }

  return { view: { dir: [1.0, 0.72, 0.95], section: { axis: 'z', pos: 0.55 } } };
}

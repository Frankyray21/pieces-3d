// Plancher / plaque principale (F09) et moteur principal 115 HP + pompes (F10).
// Repère du plancher : dessus de la plaque à y = 0, X vers l'avant, +Z à droite.
// Les aides de modélisation (boulonnerie, boyaux tressés, soudures, lofts)
// sont partagées avec le châssis (F08).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mat } from '../../viewer/materials.js';

const AXIS_Y = 0.26; // hauteur de l'axe du moteur au-dessus de ses pattes

/** Repères partagés avec le châssis : boulons plancher ↔ traverses (repère plancher). */
export const FLOOR = {
  boltX: [-1.06, -0.62, -0.18, 0.26, 0.7],
  boltZ: 0.4,
};

// ------------------------------------------------------------ matériaux propres

let CUSTOM = null;

/** Tresse inox (carte de normales générée) : torons croisés dessus / dessous. */
function braidTexture() {
  const N = 64, k = 4;
  const H = new Float32Array(N * N);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const u = i / N, v = j / N;
      const s = (u + v) * k, t = (u - v) * k;
      const fs = s - Math.floor(s), ft = t - Math.floor(t);
      const ws = Math.sin(Math.PI * fs) * (0.78 + 0.22 * Math.abs(Math.sin(Math.PI * fs * 3)));
      const wt = Math.sin(Math.PI * ft) * (0.78 + 0.22 * Math.abs(Math.sin(Math.PI * ft * 3)));
      const aOver = ((Math.floor(s) + Math.floor(t)) & 1) === 0;
      H[j * N + i] = aOver ? Math.max(ws, wt * 0.5) : Math.max(wt, ws * 0.5);
    }
  }
  const data = new Uint8Array(N * N * 4);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const hx = H[j * N + ((i + 1) % N)] - H[j * N + ((i - 1 + N) % N)];
      const hy = H[((j + 1) % N) * N + i] - H[((j - 1 + N) % N) * N + i];
      let nx = -hx * 2.4, ny = -hy * 2.4, nz = 1;
      const l = Math.hypot(nx, ny, nz);
      nx /= l; ny /= l; nz /= l;
      const o = (j * N + i) * 4;
      data[o] = (nx * 0.5 + 0.5) * 255;
      data[o + 1] = (ny * 0.5 + 0.5) * 255;
      data[o + 2] = (nz * 0.5 + 0.5) * 255;
      data[o + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

function custom() {
  if (CUSTOM) return CUSTOM;
  const off = { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 };
  const m = (Ctor, name, p) => {
    const x = new Ctor({ ...p, ...off });
    x.name = name;
    return x;
  };
  CUSTOM = {
    // Aluminium moulé satiné (cloche d'accouplement).
    alu: m(THREE.MeshPhysicalMaterial, 'alu', { color: 0xc9cdd2, metalness: 0.72, roughness: 0.36, clearcoat: 0.15, clearcoatRoughness: 0.45 }),
    // Fonte usinée grise (poulie, moyeux).
    castIron: m(THREE.MeshStandardMaterial, 'castIron', { color: 0xa9adb3, metalness: 0.55, roughness: 0.4 }),
    braid: m(THREE.MeshStandardMaterial, 'braid', { color: 0xc4c8ce, metalness: 0.92, roughness: 0.32, normalMap: braidTexture(), normalScale: new THREE.Vector2(1.1, 1.1) }),
    // Zingage jaune bichromaté (blocs de valves).
    zinc: m(THREE.MeshStandardMaterial, 'zinc', { color: 0xc7a640, metalness: 0.75, roughness: 0.34 }),
  };
  return CUSTOM;
}

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

/** Position + rotation (Euler XYZ). */
function xf(geo, pos = [0, 0, 0], rot = null) {
  if (rot) geo.applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)));
  return geo.translate(...V3(pos).toArray());
}

/** Axe +Y de la géométrie dirigé selon dir, puis translation. */
function aim(geo, pos, dir) {
  geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UPV, V3(dir).normalize()));
  return geo.translate(...V3(pos).toArray());
}

/** Repère quelconque : colonnes ex, ey, ez (vecteurs unitaires), origine pos. */
function frameXf(geo, pos, ex, ey, ez) {
  return geo.applyMatrix4(new THREE.Matrix4().makeBasis(V3(ex), V3(ey), V3(ez)).setPosition(V3(pos)));
}

/**
 * Révolution autour de Y d'un profil [[r, y, lisse?], ...] (sens trigonométrique
 * dans le plan r-y = normales vers l'extérieur). Arêtes vives sauf points « lisses ».
 */
function lathe(profile, seg = 32) {
  const pts = [];
  profile.forEach(([r, y, smooth], i) => {
    const p = new THREE.Vector2(Math.max(r, 0), y);
    pts.push(p);
    if (!smooth && i > 0 && i < profile.length - 1) pts.push(p.clone());
  });
  const g = new THREE.LatheGeometry(pts, seg);
  const n = g.attributes.normal, v = new THREE.Vector3();
  for (let i = 0; i < n.count; i++) {
    v.fromBufferAttribute(n, i).normalize();
    n.setXYZ(i, v.x, v.y, v.z);
  }
  return g;
}

/** Prisme hexagonal chanfreiné (surplat af, hauteur h), axe Y, centré. */
function hexGeo(af, h) {
  const R = af / 2 / Math.cos(Math.PI / 6);
  const c = Math.min(h * 0.14, R * 0.12);
  const g = lathe([[0, -h / 2], [R * 0.86, -h / 2], [R, -h / 2 + c], [R, h / 2 - c], [R * 0.86, h / 2], [0, h / 2]], 6).toNonIndexed();
  g.computeVertexNormals();
  return g;
}

/** Contour extrudé selon Z (centré) : trous ronds [x, y, r], oblongs [x, y, l, h], polygones. */
function shapeGeo(outline, depth, { holes = [], slots = [], polys = [], bevel = 0, curve = 14, holeSeg = 0 } = {}) {
  const sh = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
  holes.forEach(([x, y, r]) => {
    // Petits trous : polygone à nombre de côtés réduit (moins de triangles).
    const n = holeSeg || Math.max(8, Math.min(28, Math.round(r * 900)));
    sh.holes.push(new THREE.Path(Array.from({ length: n }, (_, i) => {
      const a = -(i / n) * Math.PI * 2;
      return new THREE.Vector2(x + Math.cos(a) * r, y + Math.sin(a) * r);
    })));
  });
  slots.forEach(([x, y, w, h]) => sh.holes.push(stadiumPath(x, y, w, h)));
  polys.forEach((pts) => sh.holes.push(new THREE.Path(pts.map(([x, y]) => new THREE.Vector2(x, y)))));
  const d = Math.max(depth - 2 * bevel, depth * 0.2);
  const g = new THREE.ExtrudeGeometry(sh, {
    depth: d, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: curve,
  });
  g.translate(0, 0, -d / 2);
  return g;
}

function stadiumPath(x, y, w, h) {
  const p = new THREE.Path();
  if (w >= h) {
    const r = h / 2;
    p.moveTo(x - w / 2 + r, y - r);
    p.lineTo(x + w / 2 - r, y - r);
    p.absarc(x + w / 2 - r, y, r, -Math.PI / 2, Math.PI / 2, false);
    p.lineTo(x - w / 2 + r, y + r);
    p.absarc(x - w / 2 + r, y, r, Math.PI / 2, Math.PI * 1.5, false);
  } else {
    const r = w / 2;
    p.moveTo(x + r, y - h / 2 + r);
    p.lineTo(x + r, y + h / 2 - r);
    p.absarc(x, y + h / 2 - r, r, 0, Math.PI, false);
    p.lineTo(x - r, y - h / 2 + r);
    p.absarc(x, y - h / 2 + r, r, Math.PI, Math.PI * 2, false);
  }
  return p;
}

/** Rectangle à coins arrondis (contour 2D). */
function roundRect(w, h, r, n = 4) {
  const out = [];
  const cs = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 90], [-w / 2 + r, -h / 2 + r, 180], [w / 2 - r, -h / 2 + r, 270]];
  for (const [cx, cy, a0] of cs) {
    for (let i = 0; i <= n; i++) {
      const a = ((a0 + (i / n) * 90) * Math.PI) / 180;
      out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  return out;
}

/** Secteur annulaire extrudé selon Z (griffes d'accouplement, cintrages). */
function sectorGeo(rIn, rOut, a0, a1, depth, n = 6) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; pts.push([Math.cos(a) * rOut, Math.sin(a) * rOut]); }
  for (let i = n; i >= 0; i--) { const a = a0 + ((a1 - a0) * i) / n; pts.push([Math.cos(a) * rIn, Math.sin(a) * rIn]); }
  return shapeGeo(pts, depth);
}

/** Facettes orientées automatiquement (normales attendues fournies). */
function soup() {
  const pos = [], nor = [];
  const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), c = new THREE.Vector3();
  const tri = (a, b, d, na, nb, nd, expect) => {
    e1.subVectors(b, a); e2.subVectors(d, a); c.crossVectors(e1, e2);
    if (c.dot(expect) < 0) { [b, d] = [d, b]; [nb, nd] = [nd, nb]; }
    for (const [p, n] of [[a, na], [b, nb], [d, nd]]) { pos.push(p.x, p.y, p.z); nor.push(n.x, n.y, n.z); }
  };
  return {
    quad(a, b, d, e, na, nb, nd, ne, expect) {
      tri(a, b, d, na, nb, nd, expect);
      tri(a, d, e, na, nd, ne, expect);
    },
    geo() {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      return g;
    },
  };
}

/** Géométries (position + normale) fusionnées par matériau → maillages. */
function makeBag() {
  const lists = new Map();
  const push = (m, g) => {
    const key = mat(m);
    if (!lists.has(key)) lists.set(key, []);
    let x = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(x.attributes)) if (k !== 'position' && k !== 'normal') x.deleteAttribute(k);
    if (!x.attributes.normal) x.computeVertexNormals();
    x.clearGroups();
    lists.get(key).push(x);
  };
  const bag = {
    add(m, ...items) {
      for (const it of items.flat(3)) {
        if (!it) continue;
        if (it.isBufferGeometry) push(m, it);
        else {
          it.updateMatrixWorld(true);
          it.traverse((o) => { if (o.isMesh) push(m || o.material, o.geometry.clone().applyMatrix4(o.matrixWorld)); });
        }
      }
      return bag;
    },
    /** Maillages (un par matériau). noEdges : pas de contours dessinés (ailettes, soudures). */
    build({ noEdges = false } = {}) {
      const out = [];
      for (const [material, geos] of lists) {
        const mesh = new THREE.Mesh(geos.length === 1 ? geos[0] : mergeGeometries(geos, false), material);
        if (noEdges) mesh.userData.noEdges = true;
        out.push(mesh);
      }
      return out;
    },
    group(opts) {
      const g = new THREE.Group();
      bag.build(opts).forEach((m) => g.add(m));
      return g;
    },
  };
  return bag;
}

/**
 * Trousse de modélisation partagée (plancher, moteur, châssis) : primitives
 * de la bibliothèque converties en géométries, boulonnerie, boyaux, soudures.
 */
export function kit(api) {
  const S = api.S;
  const M = custom();
  const G = {
    box: (w, h, d, r = 0) => S.box(w, h, d, 'red', { r }).geometry.clone(),
    cyl: (r, len, o = {}) => S.cyl(r, len, 'steel', o).children[0].geometry.clone(),
    ring: (ro, ri, t, seg = 32) => S.ring(ro, ri, t, 'steel', { seg }).children[0].geometry.clone(),
    torus: (R, r, seg = 28, tube = 8) => new THREE.TorusGeometry(R, r, tube, seg).rotateX(Math.PI / 2),
    hex: hexGeo,
    lathe,
    shape: shapeGeo,
    sector: sectorGeo,
    roundRect,
    toAxis,
    xf,
    aim,
    frame: frameXf,
  };

  /** Tête hexagonale + rondelle (+ bout de tige) posées sur une face, selon dir. */
  function boltGeo(pos, dir, d, { washer = true, stud = 0, nut = false } = {}) {
    const p = V3(pos), n = V3(dir).normalize();
    const out = [];
    let off = 0;
    if (washer) {
      const t = d * 0.16;
      out.push(aim(G.ring(d * 1.05, d * 0.55, t, 16), p.clone().addScaledVector(n, t / 2), n));
      off = t;
    }
    const h = nut ? d * 0.8 : d * 0.62;
    out.push(aim(hexGeo(d * 1.5, h), p.clone().addScaledVector(n, off + h / 2), n));
    if (stud > 0) out.push(aim(G.cyl(d * 0.48, stud, { seg: 10 }), p.clone().addScaledVector(n, off + h + stud / 2 - d * 0.1), n));
    return out;
  }

  /** Vis à tête cylindrique (CHC), tête de hauteur d, selon dir. */
  function capScrewGeo(pos, dir, d) {
    const p = V3(pos), n = V3(dir).normalize();
    return [
      aim(lathe([[0, 0], [d * 0.72, 0], [d * 0.78, d * 0.08], [d * 0.78, d * 0.9], [d * 0.7, d], [d * 0.36, d], [d * 0.36, d * 0.7], [0, d * 0.7]], 16), p, n),
    ];
  }

  /** Cordon de soudure (demi-rond) le long d'une arête a → b. */
  function weldGeo(a, b, r = 0.0045) {
    const A = V3(a), B = V3(b);
    const len = A.distanceTo(B);
    const g = new THREE.CylinderGeometry(r, r, len, 6, 1, true);
    return aim(g, A.clone().add(B).multiplyScalar(0.5), B.clone().sub(A));
  }

  /**
   * Boyau tressé avec embouts sertis et écrous JIC. a, b : faces des raccords ;
   * da, db : directions de sortie du boyau ; mid : points de passage.
   */
  function hose(a, da, b, db, mid, r, { cover = 'braid', fit = 'steel' } = {}) {
    const A = V3(a), B = V3(b), dA = V3(da).normalize(), dB = V3(db).normalize();
    const Ln = r * 1.25, Lf = r * 3.4, rf = r * 1.28;
    const at = (P, d, s) => P.clone().addScaledVector(d, s);
    const pts = [at(A, dA, Ln + Lf * 0.85), at(A, dA, Ln + Lf + r * 2.5), ...mid.map(V3), at(B, dB, Ln + Lf + r * 2.5), at(B, dB, Ln + Lf * 0.85)];
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const L = curve.getLength();
    const g = new THREE.TubeGeometry(curve, Math.max(24, Math.min(110, Math.round(L / 0.018))), r, 14, false);
    const isBraid = cover === 'braid';
    if (isBraid) {
      const uv = g.attributes.uv;
      const around = Math.max(3, Math.round((Math.PI * 2 * r) / 0.014));
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (L / 0.014), uv.getY(i) * around);
    }
    const body = new THREE.Mesh(g, isBraid ? M.braid : mat(cover));
    body.userData.noEdges = true;
    const fits = makeBag();
    for (const [P, d] of [[A, dA], [B, dB]]) {
      // Écrou tournant JIC, douille sertie (empreintes de sertissage), embout.
      fits.add(fit, aim(hexGeo(r * 2.5, Ln), at(P, d, Ln / 2), d));
      fits.add(fit, aim(lathe([[0, 0], [rf * 0.92, 0], [rf, Lf * 0.06], [rf, Lf * 0.3], [rf * 0.95, Lf * 0.36], [rf, Lf * 0.42], [rf, Lf * 0.58], [rf * 0.95, Lf * 0.64], [rf, Lf * 0.7], [rf, Lf * 0.94], [r * 1.05, Lf], [0, Lf]], 16), at(P, d, Ln), d));
      fits.add(fit, aim(G.cyl(r * 0.85, r * 0.6, { seg: 14 }), at(P, d, -r * 0.2), d));
    }
    const grp = new THREE.Group();
    grp.add(body);
    fits.build().forEach((m) => grp.add(m));
    return grp;
  }

  /** Tube rigide cintré (droites + coudes) : liste de points, rayon de cintrage rb. */
  function bentTubeGeo(points, r, rb = r * 3, radial = 14) {
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
    return new THREE.TubeGeometry(path, Math.max(16, Math.round(L / 0.012)), r, radial, false);
  }

  return { S, G, M, bag: makeBag, boltGeo, capScrewGeo, weldGeo, hose, bentTubeGeo, soup, V3 };
}

/**
 * Raccord à brides séparées (Code 61) sur un orifice de pompe : joint torique,
 * tête de l'adaptateur, deux demi-brides (2 vis chacune).
 * c : centre de l'orifice (face) ; n : normale sortante ; u : grand axe des brides.
 */
function splitPort(K, c, n, u, sz) {
  const { G } = K;
  const C = K.V3(c), N = K.V3(n).normalize(), U = K.V3(u).normalize();
  const W = new THREE.Vector3().crossVectors(N, U).normalize();
  const { tr, cr, ch, L, Wd, t, bd } = sz;
  const oring = K.bag().add('rubber', K.G.aim(G.torus(cr * 0.74, cr * 0.09, 28, 6), C.clone().addScaledVector(N, 0.0008), N)).group();
  const zH = ch; // tête d'adaptateur
  const halves = [1, -1].map((s) => {
    const b = K.bag();
    // Demi-bride : barreau à encoche demi-ronde, 2 trous.
    const r = Math.min(Wd * 0.18, 0.006);
    const g = shapeGeo([[-L / 2 + r, 0], [-tr - 0.002, 0], ...Array.from({ length: 9 }, (_, i) => {
      const a = Math.PI - (i / 8) * Math.PI;
      return [Math.cos(a) * (tr + 0.002), Math.sin(a) * (tr + 0.002)];
    }).slice(1, 8), [tr + 0.002, 0], [L / 2 - r, 0], [L / 2, r], [L / 2, Wd / 2 - r], [L / 2 - r, Wd / 2], [-L / 2 + r, Wd / 2], [-L / 2, Wd / 2 - r], [-L / 2, r]], t, {
      holes: [[-L / 2 + bd * 1.3, Wd / 4, bd * 0.55], [L / 2 - bd * 1.3, Wd / 4, bd * 0.55]],
    });
    // repère local : x → U, y → s·W, z → N
    const ey = W.clone().multiplyScalar(s);
    const ez = new THREE.Vector3().crossVectors(U, ey);
    const org = C.clone().addScaledVector(N, zH + t / 2);
    G.frame(g, org, U, ey, ez);
    b.add('steel', g);
    for (const k of [-1, 1]) {
      const p = org.clone().addScaledVector(U, k * (L / 2 - bd * 1.3)).addScaledVector(W, s * Wd / 4).addScaledVector(N, t / 2);
      b.add('steel', K.boltGeo(p, N, bd));
    }
    return b.group();
  });
  return { oring, halves, head: C.clone().addScaledVector(N, zH) };
}

/** Adaptateur coudé à tête de bride : tête, tube cintré, collet d'extrémité. */
function flangeAdaptor(K, c, n, pts, sz) {
  const { G } = K;
  const C = K.V3(c), N = K.V3(n).normalize();
  const b = K.bag();
  b.add('steel', G.aim(G.lathe([[0, 0], [sz.cr * 0.96, 0], [sz.cr, sz.ch * 0.15], [sz.cr, sz.ch * 0.85], [sz.cr * 0.94, sz.ch], [sz.tr * 1.05, sz.ch], [sz.tr * 1.05, sz.ch * 1.3], [0, sz.ch * 1.3]], 28), C, N));
  const path = [C.clone().addScaledVector(N, sz.ch * 1.2), ...pts.map(K.V3)];
  b.add('steel', K.bentTubeGeo(path, sz.tr, sz.tr * 2.6));
  const end = path[path.length - 1];
  const dEnd = end.clone().sub(path[path.length - 2]).normalize();
  b.add('steel', G.aim(G.lathe([[0, -0.004], [sz.tr * 1.05, -0.004], [sz.tr * 1.05, 0], [sz.cr * 0.94, 0], [sz.cr, sz.ch * 0.15], [sz.cr, sz.ch * 0.85], [sz.cr * 0.94, sz.ch], [sz.tr * 0.7, sz.ch], [0, sz.ch]], 28), end, dEnd));
  return b.group();
}

// Tailles de raccords à brides séparées (rayons : tube, collet ; brides L × l × ép. ; vis).
const PORT = {
  32: { tr: 0.03, cr: 0.042, ch: 0.016, L: 0.112, Wd: 0.072, t: 0.016, bd: 0.012 },
  20: { tr: 0.021, cr: 0.031, ch: 0.014, L: 0.088, Wd: 0.056, t: 0.014, bd: 0.01 },
  16: { tr: 0.017, cr: 0.026, ch: 0.013, L: 0.076, Wd: 0.048, t: 0.013, bd: 0.009 },
};

// ================================================================== F10

export function F10(api) {
  const K = kit(api);
  const { S, G, M } = K;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const y = AXIS_Y;
  const R = 0.2; // rayon de la carcasse

  // ---------------------------------------------------- 5 — moteur 115 HP
  const motor = new THREE.Group();
  // Carcasse creuse (coupe : stator, bobinages, rotor visibles).
  motor.add(S.at(S.shell(R, 0.186, 0.5, 'blue', { axis: 'x', seg: 40 }), [0, y, 0]));
  const blue = K.bag(), fins = K.bag(), steel = K.bag(), inner = K.bag(), misc = K.bag();

  // Ailettes de refroidissement coulées : parallèles par quartier, effilées.
  const fin = (len, root, tip, depth) => {
    const g = new THREE.BoxGeometry(len, root, depth);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) if (p.getZ(i) > 0) p.setY(i, (p.getY(i) * tip) / root);
    g.computeVertexNormals();
    return g;
  };
  const env = 0.248, chamf = 0.338;
  const sideY = Array.from({ length: 11 }, (_, i) => -0.085 + i * 0.021);
  for (const s of [1, -1]) {
    for (const yr of sideY) {
      const z0 = Math.sqrt(R * R - yr * yr) - 0.004, z1 = Math.min(env, chamf - Math.abs(yr));
      // Plaque signalétique côté -Z : ailettes interrompues.
      const spans = s < 0 && yr > -0.03 && yr < 0.06 ? [[-0.22, -0.105], [0.075, 0.22]] : [[-0.22, 0.22]];
      for (const [xa, xb] of spans) {
        const g = fin(xb - xa, 0.009, 0.005, z1 - z0);
        if (s < 0) g.rotateX(Math.PI);
        fins.add('blue', g.translate((xa + xb) / 2, y + yr, s * (z0 + z1) / 2));
      }
    }
  }
  for (let i = 0; i < 13; i++) {
    const zr = -0.132 + i * 0.022;
    if (Math.abs(zr) < 0.01) continue; // bossage de l'anneau de levage
    const y0 = Math.sqrt(R * R - zr * zr) - 0.004, y1 = Math.min(env, chamf - Math.abs(zr));
    const [xa, xb] = Math.abs(zr) < 0.115 ? [-0.22, 0.004] : [-0.22, 0.22];
    const g = fin(xb - xa, 0.009, 0.005, y1 - y0).rotateX(-Math.PI / 2);
    fins.add('blue', g.translate((xa + xb) / 2, y + (y0 + y1) / 2, zr));
  }

  // Pattes : semelles percées + voiles avec lumière oblongue.
  for (const s of [1, -1]) {
    blue.add('blue', S.at(S.plate(0.5, 0.12, 0.04, 'blue', { r: 0.012, holes: [[-0.205, -0.025, 0.011], [-0.165, 0.025, 0.011], [0.205, -0.025, 0.011], [0.165, 0.025, 0.011]] }), [0, 0.02, s * 0.19]));
    blue.add('blue', G.xf(G.shape([[-0.24, 0.035], [0.24, 0.035], [0.215, 0.09], [0.17, 0.2], [-0.17, 0.2], [-0.215, 0.09]], 0.028, { slots: [[0, 0.1, 0.12, 0.036]], bevel: 0.003 }), [0, 0, s * 0.16]));
    // Goussets d'extrémité, boulons de fixation sur le plancher (rondelles).
    for (const x of [-0.235, 0.235]) blue.add('blue', G.xf(G.box(0.02, 0.07, 0.07, 0.004), [x, 0.07, s * 0.19]));
    for (const [x, dz] of [[-0.205, -0.025], [0.205, -0.025], [-0.165, 0.025], [0.165, 0.025]]) steel.add('steel', K.boltGeo([x, 0.04, s * 0.19 + dz], [0, 1, 0], 0.018, { stud: 0.008 }));
  }

  // Flasque arrière + capot de ventilateur à grille (côté poulie, -X).
  blue.add('blue', G.xf(G.toAxis(G.cyl(0.207, 0.035, { seg: 40 }), 'x'), [-0.2675, y, 0]));
  blue.add('blue', G.xf(G.toAxis(G.lathe([[0, -0.398], [0.171, -0.398], [0.171, -0.403], [0.196, -0.404, 1], [0.216, -0.396, 1], [0.228, -0.379, 1], [0.233, -0.354], [0.233, -0.281], [0.224, -0.276], [0, -0.276]], 48), 'x'), [0, y, 0]));
  misc.add('charcoal', G.xf(G.toAxis(G.cyl(0.171, 0.004, { seg: 40 }), 'x'), [-0.401, y, 0]));
  for (const [ro, ri] of [[0.171, 0.158], [0.136, 0.123], [0.101, 0.088], [0.066, 0.053]]) {
    blue.add('blue', G.xf(G.toAxis(G.ring(ro, ri, 0.004, 40), 'x'), [-0.4045, y, 0]));
  }
  blue.add('blue', G.xf(G.toAxis(G.cyl(0.04, 0.006), 'x'), [-0.4055, y, 0]));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    blue.add('blue', G.xf(G.box(0.004, 0.012, 0.132), [-0.4045, y + Math.sin(a) * 0.105, Math.cos(a) * 0.105], [-a, 0, 0]));
  }
  // Flasque avant à bride (côté pompes, +X) : bride, creux nervuré, chapeau de roulement.
  blue.add('blue', G.xf(G.toAxis(G.lathe([[0, 0.249], [0.205, 0.249], [0.207, 0.252], [0.207, 0.262], [0.218, 0.266], [0.218, 0.302], [0.214, 0.305], [0.13, 0.305], [0.125, 0.29], [0.072, 0.29], [0.072, 0.3], [0.068, 0.304], [0.036, 0.304], [0.036, 0.296], [0, 0.296]], 48), 'x'), [0, y, 0]));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    blue.add('blue', G.xf(G.box(0.012, 0.007, 0.054), [0.296, y + Math.sin(a) * 0.098, Math.cos(a) * 0.098], [-a, 0, 0]));
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    steel.add('steel', K.boltGeo([0.304, y + Math.sin(a) * 0.052, Math.cos(a) * 0.052], [1, 0, 0], 0.008, { washer: false }));
  }
  // Oreilles de tirants aux quatre coins, aux deux extrémités.
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const yy = y + Math.sin(a) * 0.212, zz = Math.cos(a) * 0.212;
      blue.add('blue', G.xf(G.box(0.05, 0.042, 0.042, 0.006), [sx * 0.245, yy, zz], [-a, 0, 0]));
      steel.add('steel', K.boltGeo([sx * 0.27, yy, zz], [sx, 0, 0], 0.014));
    }
  }

  // Boîte à bornes : socle, boîte, couvercle vissé, presse-étoupes et câbles.
  blue.add('blue', G.xf(G.box(0.2, 0.075, 0.2, 0.012), [0.115, y + 0.215, 0]));
  blue.add('blue', G.xf(G.box(0.24, 0.12, 0.22, 0.016), [0.115, y + 0.31, 0]));
  blue.add('blue', G.xf(G.box(0.25, 0.022, 0.232, 0.01), [0.115, y + 0.381, 0]));
  for (const [dx, dz] of [[-0.105, -0.095], [0.105, -0.095], [-0.105, 0.095], [0.105, 0.095]]) {
    steel.add('steel', K.boltGeo([0.115 + dx, y + 0.392, dz], [0, 1, 0], 0.008));
  }
  for (const x of [0.07, 0.16]) {
    misc.add('black', G.xf(G.toAxis(G.hex(0.036, 0.012), '-z'), [x, y + 0.3, -0.116]));
    misc.add('black', G.xf(G.toAxis(G.lathe([[0, 0], [0.015, 0], [0.015, 0.012], [0.012, 0.024], [0.008, 0.028], [0, 0.028]], 16), '-z'), [x, y + 0.3, -0.122]));
  }
  misc.add('rubber', new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0.07, y + 0.3, -0.148], [0.07, y + 0.28, -0.2], [0.05, y + 0.12, -0.26], [0.02, 0.06, -0.29]].map(K.V3)), 24, 0.0075, 8));
  misc.add('rubber', new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0.16, y + 0.3, -0.148], [0.16, y + 0.27, -0.21], [0.13, y + 0.1, -0.27], [0.1, 0.06, -0.29]].map(K.V3)), 24, 0.0065, 8));
  // Anneau de levage, plaque signalétique (lisse) rivetée.
  blue.add('blue', G.xf(G.cyl(0.016, 0.06), [-0.12, y + 0.225, 0]));
  steel.add('steel', G.xf(G.cyl(0.022, 0.007), [-0.12, y + 0.258, 0]));
  steel.add('steel', G.xf(G.toAxis(G.torus(0.028, 0.0075, 28, 8), 'z'), [-0.12, y + 0.295, 0]));
  blue.add('blue', G.xf(G.box(0.17, 0.08, 0.02, 0.004), [-0.015, y + 0.015, -0.205]));
  misc.add('lightGrey', G.xf(G.box(0.14, 0.06, 0.002), [-0.015, y + 0.015, -0.2155]));
  for (const [dx, dy] of [[-0.062, -0.024], [0.062, -0.024], [-0.062, 0.024], [0.062, 0.024]]) {
    steel.add('steel', G.xf(G.toAxis(G.cyl(0.003, 0.003, { seg: 8 }), 'z'), [-0.015 + dx, y + 0.015 + dy, -0.2172]));
  }

  // Intérieur (vue en coupe) : arbre traversant, stator, têtes de bobines, rotor, ventilateur.
  steel.add('steel', G.xf(G.toAxis(G.cyl(0.03, 0.905), 'x'), [-0.0675, y, 0]));
  inner.add('darkSteel', G.xf(G.toAxis(G.ring(0.186, 0.116, 0.32, 40), 'x'), [0, y, 0]));
  inner.add('darkSteel', G.xf(G.toAxis(G.cyl(0.112, 0.32, { seg: 32 }), 'x'), [0, y, 0]));
  for (const sx of [-1, 1]) {
    inner.add('copper', G.xf(G.toAxis(G.torus(0.15, 0.03, 32, 10), 'x'), [sx * 0.185, y, 0]));
    inner.add(M.alu, G.xf(G.toAxis(G.ring(0.112, 0.06, 0.02), 'x'), [sx * 0.17, y, 0]));
  }
  misc.add('black', G.xf(G.toAxis(G.cyl(0.07, 0.03), 'x'), [-0.33, y, 0]));
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    misc.add('black', G.xf(G.box(0.045, 0.004, 0.13), [-0.33, y + Math.sin(a) * 0.13, Math.cos(a) * 0.13], [-a, 0, 0.35]));
  }
  [blue.group(), fins.group({ noEdges: true }), steel.group(), inner.group(), misc.group()].forEach((g) => motor.add(g));
  motor.userData.hasInterior = true;
  P('5', motor, [0, 0, 0]);

  // ------------------------------------- côté poulie (-X) : 4, 1, 2, 3
  // 4 — Poulie 9" à 3 gorges (fonte usinée).
  const sheave = [[0.06, -0.505], [0.108, -0.505], [0.114, -0.499]];
  for (const c of [-0.4825, -0.46, -0.4375]) sheave.push([0.114, c - 0.0095], [0.096, c - 0.0035], [0.096, c + 0.0035], [0.114, c + 0.0095]);
  sheave.push([0.114, -0.421], [0.108, -0.415], [0.088, -0.415], [0.084, -0.42], [0.066, -0.42], [0.06, -0.415], [0.06, -0.505]);
  P('4', K.bag().add(M.castIron, G.xf(G.toAxis(G.lathe(sheave, 56), 'x'), [0, y, 0])).group(), [-0.32, 0, 0]);
  // 1 — Moyeu amovible conique (QD) : collerette, fût, fente.
  P('1', K.bag().add('darkSteel', G.xf(G.toAxis(G.lathe([[0.03, -0.52], [0.072, -0.52], [0.076, -0.516], [0.076, -0.506], [0.06, -0.506], [0.057, -0.44], [0.03, -0.44], [0.03, -0.52]], 40), 'x'), [0, y, 0])).group(), [-0.48, 0, 0]);
  // 2 — Vis de serrage (3).
  [0.5, 2.6, 4.7].forEach((a) => {
    P('2', K.bag().add('steel', S.bolt(0.011, 0.05, 'steel', { axis: '-x', pos: [-0.52, y + Math.cos(a) * 0.054, Math.sin(a) * 0.054] })).group(), [-0.62, 0, 0]);
  });
  // 3 — Clavette 5/8".
  P('3', K.bag().add('steel', G.xf(G.box(0.07, 0.014, 0.014, 0.002), [-0.47, y + 0.031, 0])).group(), [-0.26, 0.22, 0]);

  // --------------------------- côté pompes (+X) : accouplement, cloche, pompes
  P('6', K.bag().add('steel', G.xf(G.box(0.05, 0.013, 0.012, 0.002), [0.358, y + 0.031, 0])).group(), [0.06, 0.22, 0]);
  // 7 — Moyeu à griffes côté moteur ; 9 — étoile élastique ; 8 — moyeu cannelé côté pompe.
  // Secteurs extrudés selon Z, ramenés selon l'axe X de l'arbre.
  const jaws = (x0, x1, a0) => [0, 1, 2].map((k) => G.xf(G.sector(0.03, 0.055, a0 + k * 2.094 - 0.43, a0 + k * 2.094 + 0.43, x1 - x0).rotateY(Math.PI / 2), [(x0 + x1) / 2, y, 0]));
  const hub7 = K.bag();
  hub7.add(M.castIron, G.xf(G.toAxis(G.lathe([[0.03, 0.325], [0.052, 0.325], [0.056, 0.329], [0.056, 0.361], [0.052, 0.365], [0.03, 0.365], [0.03, 0.325]], 32), 'x'), [0, y, 0]));
  hub7.add(M.castIron, jaws(0.365, 0.392, 0));
  P('7', hub7.group(), [0.2, 0, 0]);
  const spider = K.bag();
  spider.add('rubber', G.xf(G.toAxis(G.ring(0.031, 0.02, 0.027, 24), 'x'), [0.3785, y, 0]));
  for (let k = 0; k < 6; k++) spider.add('rubber', G.xf(G.sector(0.029, 0.053, k * 1.047 + 0.524 - 0.09, k * 1.047 + 0.524 + 0.09, 0.027, 2).rotateY(Math.PI / 2), [0.3785, y, 0]));
  P('9', spider.group(), [0.3, 0, 0]);
  const hub8 = K.bag();
  hub8.add(M.castIron, G.xf(G.toAxis(G.lathe([[0.022, 0.392], [0.052, 0.392], [0.056, 0.396], [0.056, 0.428], [0.052, 0.432], [0.022, 0.432], [0.022, 0.392]], 32), 'x'), [0, y, 0]));
  hub8.add(M.castIron, jaws(0.365, 0.392, 1.047));
  P('8', hub8.group(), [0.4, 0, 0]);

  // 11 — Cloche d'accouplement aluminium : bride moteur, corps conique carré
  // avec fenêtre de visite (dessus), bride de pompe, nervures d'angle.
  const bell = K.bag();
  const flHoles = Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; return [Math.cos(a) * 0.196, Math.sin(a) * 0.196, 0.0085]; });
  const ringPts = Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2; return [Math.cos(a) * 0.218, Math.sin(a) * 0.218]; });
  const innerPts = Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [Math.cos(a) * 0.15, Math.sin(a) * 0.15]; });
  bell.add(M.alu, G.xf(G.shape(ringPts, 0.02, { holes: flHoles, polys: [innerPts] }).rotateY(Math.PI / 2), [0.315, y, 0]));
  bell.add(M.alu, bellLoft(K, [0.325, 0.362, 0.452, 0.48], y));
  bell.add(M.alu, G.xf(G.shape(roundRect(0.25, 0.25, 0.03), 0.02, { holes: [[0, 0, 0.074], [0.09, 0.09, 0.008], [-0.09, 0.09, 0.008], [0.09, -0.09, 0.008], [-0.09, -0.09, 0.008]] }).rotateY(Math.PI / 2), [0.49, y, 0]));
  for (let i = 0; i < 4; i++) bell.add(M.alu, G.xf(rib(G, (i / 4) * Math.PI * 2 + Math.PI / 4), [0, y, 0]));
  const bellG = bell.group();
  bellG.userData.hasInterior = true;
  P('11', bellG, [0.65, 0, 0]);
  // 10 — Couvercle orange de la fenêtre (suivant la pente du dessus).
  const slope = Math.atan((0.112 - 0.135) / 0.155);
  const hTop = 0.135 + (0.405 - 0.325) * ((0.112 - 0.135) / 0.155);
  const cover = K.bag().add('orange', G.xf(G.box(0.118, 0.006, 0.15, 0.003), [0.405, y + hTop + 0.003, 0], [0, 0, slope]));
  for (const [dx, dz] of [[-0.048, -0.062], [0.048, -0.062], [-0.048, 0.062], [0.048, 0.062]]) {
    cover.add('steel', G.xf(G.cyl(0.0045, 0.004, { seg: 10 }), [0.405 + dx, y + hTop + 0.0075 - dx * Math.tan(-slope), dz], [0, 0, slope]));
  }
  P('10', cover.group(), [0.65, 0.32, 0]);
  // 12 — Vis CHC de la cloche sur la bride moteur (4).
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 8;
    P('12', K.bag().add('darkSteel', K.capScrewGeo([0.325, y + Math.sin(a) * 0.196, Math.cos(a) * 0.196], [1, 0, 0], 0.013)).group(), [0.5, 0.22, 0]);
  }

  // 16 — Pompe Rexroth A10VO71 (à travers d'arbre) ; 23 — A10VO28 accolée.
  const p71 = K.bag();
  p71.add('black', G.xf(G.box(0.022, 0.18, 0.235, 0.025), [0.511, y, 0]));
  p71.add('black', G.xf(G.toAxis(G.cyl(0.063, 0.02), 'x'), [0.49, y, 0]));
  // Carter d'entraînement moulé (cylindrique, nervures), berceau de plateau, bloc de distribution.
  p71.add('black', G.xf(G.toAxis(G.lathe([[0, 0.522], [0.078, 0.522], [0.086, 0.53, 1], [0.088, 0.545], [0.09, 0.6], [0.094, 0.61], [0.094, 0.655], [0, 0.655]], 36), 'x'), [0, y, 0]));
  for (const a of [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4]) p71.add('black', G.xf(G.box(0.12, 0.016, 0.03, 0.004), [0.59, y + Math.sin(a) * 0.09, Math.cos(a) * 0.09], [-a, 0, 0]));
  p71.add('black', G.xf(G.box(0.07, 0.03, 0.13, 0.01), [0.6, y + 0.088, -0.005]));
  p71.add('black', G.xf(G.box(0.05, 0.19, 0.12, 0.018), [0.63, y, 0]));
  p71.add('black', G.xf(G.box(0.075, 0.19, 0.19, 0.016), [0.69, y, 0]));
  p71.add('black', G.xf(G.box(0.02, 0.152, 0.152, 0.02), [0.7375, y, 0]));
  p71.add('black', G.xf(G.toAxis(G.cyl(0.05, 0.02), 'z'), [0.69, y, -0.105]));
  p71.add('black', G.xf(G.cyl(0.032, 0.012), [0.69, y + 0.101, 0.035]));
  // Régulateur (DFR) et vis de réglage à contre-écrou.
  p71.add('black', G.xf(G.box(0.07, 0.055, 0.08, 0.006), [0.575, y + 0.11, -0.03]));
  const s71 = K.bag();
  s71.add('steel', G.xf(G.toAxis(G.cyl(0.022, 0.022), 'x'), [0.5, y, 0]));
  s71.add('steel', G.xf(G.toAxis(G.cyl(0.022, 0.07), 'x'), [0.465, y, 0]));
  for (const x of [0.558, 0.592]) {
    s71.add('steel', G.xf(G.toAxis(G.hex(0.02, 0.01), '-z'), [x, y + 0.112, -0.075]));
    s71.add('steel', G.xf(G.toAxis(G.cyl(0.006, 0.03, { seg: 10 }), '-z'), [x, y + 0.112, -0.09]));
    s71.add('black', G.xf(G.toAxis(G.lathe([[0, 0], [0.011, 0], [0.011, 0.014, 1], [0.008, 0.02, 1], [0, 0.021]], 14), '-z'), [x, y + 0.112, -0.083]));
  }
  for (const [yy, zz] of [[0.075, 0.075], [-0.075, 0.075], [0.075, -0.075], [-0.075, -0.075]]) s71.add('darkSteel', K.capScrewGeo([0.7275, y + yy, zz], [1, 0, 0], 0.012));
  for (const z of [0.095, -0.095]) s71.add('steel', K.boltGeo([0.522, y, z], [1, 0, 0], 0.016));
  for (const [x, yy] of [[0.6, 0.04], [0.69, -0.05]]) s71.add('steel', G.xf(G.toAxis(G.hex(0.022, 0.008), 'z'), [x, y + yy, 0.099]));
  s71.add('lightGrey', G.xf(G.box(0.05, 0.03, 0.002), [0.565, y - 0.03, 0.0885]));
  P('16', group2(p71, s71), [0.95, 0, 0]);

  const p28 = K.bag(), s28 = K.bag();
  p28.add('black', G.xf(G.box(0.016, 0.135, 0.175, 0.02), [0.755, y, 0]));
  p28.add('black', G.xf(G.toAxis(G.lathe([[0, 0.763], [0.06, 0.763], [0.067, 0.769, 1], [0.069, 0.78], [0.071, 0.82], [0.074, 0.826], [0.074, 0.833], [0, 0.833]], 32), 'x'), [0, y, 0]));
  for (const a of [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4]) p28.add('black', G.xf(G.box(0.06, 0.012, 0.024, 0.003), [0.795, y + Math.sin(a) * 0.07, Math.cos(a) * 0.07], [-a, 0, 0]));
  p28.add('black', G.xf(G.box(0.05, 0.024, 0.1, 0.008), [0.8, y + 0.07, 0.0]));
  p28.add('black', G.xf(G.box(0.06, 0.15, 0.15, 0.014), [0.863, y, 0]));
  p28.add('black', G.xf(G.box(0.03, 0.12, 0.12, 0.02), [0.908, y, 0]));
  p28.add('black', G.xf(G.toAxis(G.cyl(0.036, 0.015), 'z'), [0.863, y - 0.01, -0.0825]));
  p28.add('black', G.xf(G.cyl(0.028, 0.01), [0.863, y + 0.08, 0]));
  p28.add('black', G.xf(G.box(0.06, 0.07, 0.05, 0.006), [0.885, y + 0.02, 0.1]));
  for (const yy of [0.008, 0.035]) {
    s28.add('steel', G.xf(G.toAxis(G.hex(0.018, 0.009), 'x'), [0.92, y + yy, 0.1]));
    s28.add('steel', G.xf(G.toAxis(G.cyl(0.0055, 0.03, { seg: 10 }), 'x'), [0.935, y + yy, 0.1]));
    s28.add('black', G.xf(G.toAxis(G.lathe([[0, 0], [0.0095, 0], [0.0095, 0.012, 1], [0.007, 0.017, 1], [0, 0.018]], 14), 'x'), [0.936, y + yy, 0.1]));
  }
  for (const z of [0.07, -0.07]) s28.add('steel', K.boltGeo([0.763, y, z], [1, 0, 0], 0.013));
  s28.add('lightGrey', G.xf(G.box(0.04, 0.025, 0.002), [0.8, y - 0.03, -0.0685]));
  for (const [yy, zz] of [[0.055, 0.055], [-0.055, 0.055], [0.055, -0.055], [-0.055, -0.055]]) s28.add('darkSteel', K.capScrewGeo([0.923, y + yy, zz], [1, 0, 0], 0.01));
  P('23', group2(p28, s28), [1.35, 0, 0]);

  // Raccords : brides séparées (2 demi-brides + 4 vis), joint torique, adaptateur coudé.
  // Éclaté : avec la pompe (base), puis le long de la normale de l'orifice.
  const port = (c, n, u, size, ends, [rO, rF, rA], base) => {
    const sz = PORT[size];
    const sp = splitPort(K, c, n, u, sz);
    const N = K.V3(n), W = new THREE.Vector3().crossVectors(N, K.V3(u)).normalize();
    const ex = (k, w = 0) => K.V3(base).addScaledVector(N, k).addScaledVector(W, w).toArray();
    P(rO, sp.oring, ex(0.08));
    sp.halves.forEach((h, i) => P(rF, h, ex(0.36, i ? -0.06 : 0.06)));
    P(rA, flangeAdaptor(K, c, n, ends, sz), ex(0.2));
  };
  // Pompe 71 — aspiration #32 (côté -Z, adaptateur 45°) : 15, 14, 13
  port([0.69, y, -0.115], [0, 0, -1], [0, 1, 0], 32, [[0.69, y, -0.2], [0.69, y - 0.11, -0.31]], ['15', '14', '13'], [0.95, 0, 0]);
  // Pompe 71 — refoulement #16 (dessus, adaptateur 90°) : 17, 18, 19
  port([0.69, y + 0.107, 0.035], [0, 1, 0], [0, 0, 1], 16, [[0.69, y + 0.2, 0.035], [0.69, y + 0.2, 0.15]], ['17', '18', '19'], [0.95, 0, 0]);
  // Pompe 28 — aspiration #20 (côté -Z, adaptateur 45°) : 24, 25, 26
  port([0.863, y - 0.01, -0.09], [0, 0, -1], [0, 1, 0], 20, [[0.863, y - 0.01, -0.15], [0.863, y + 0.08, -0.24]], ['24', '25', '26'], [1.35, 0, 0]);
  // Pompe 28 — refoulement (dessus, adaptateur 90°) : 22, 21, 20
  port([0.863, y + 0.085, 0], [0, 1, 0], [0, 0, 1], 16, [[0.863, y + 0.17, 0], [0.863, y + 0.17, 0.12]], ['22', '21', '20'], [1.35, 0, 0]);

  return { view: { dir: [0.62, 0.52, 1.15] } };

  function group2(a, b) {
    const g = a.group();
    b.build().forEach((m) => g.add(m));
    return g;
  }
}

/** Nervure d'angle de la cloche (triangle dans le plan axe-rayon), angle a autour de X. */
function rib(G, a) {
  const g = G.shape([[0.325, 0.163], [0.325, 0.206], [0.36, 0.16]], 0.016, { bevel: 0.002 });
  // plan X-Y (x = axe, y = rayon), épaisseur selon Z ; rotation autour de X
  g.rotateX(a);
  return g;
}

/**
 * Corps de cloche : section carrée à coins arrondis, conique, paroi de 12 mm,
 * fenêtre de visite sur le dessus entre les sections 1 et 2.
 */
function bellLoft(K, xs, y) {
  const wall = 0.012, wz = 0.06;
  const hAt = (x) => 0.135 + ((x - xs[0]) / (xs[xs.length - 1] - xs[0])) * (0.112 - 0.135);
  const rAt = (x) => 0.055 + ((x - xs[0]) / (xs[xs.length - 1] - xs[0])) * (0.032 - 0.055);
  // Pourtour (z, y) parcouru de z+ vers z- par le dessus ; win : le segment suivant est la fenêtre.
  const perim = (h, rc) => {
    const pts = [];
    const add = (z, yy, nz, ny, win = false) => pts.push({ z, y: yy, nz, ny, win });
    const arc = (cz, cy, a0, n = 4) => {
      for (let i = 1; i <= n; i++) {
        const a = ((a0 + i * 22.5) * Math.PI) / 180;
        add(cz + Math.cos(a) * rc, cy + Math.sin(a) * rc, Math.cos(a), Math.sin(a));
      }
    };
    const k = h - rc;
    add(k, h, 0, 1);
    add(wz, h, 0, 1, true);
    add(-wz, h, 0, 1);
    add(-k, h, 0, 1);
    arc(-k, k, 90);
    add(-h, -k, -1, 0);
    arc(-k, -k, 180);
    add(k, -h, 0, -1);
    arc(k, -k, 270);
    add(h, k, 1, 0);
    arc(k, k, 0, 3);
    return pts;
  };
  const S = K.soup();
  const P = (x, p) => new THREE.Vector3(x, y + p.y, p.z);
  const Nv = (p, s = 1) => new THREE.Vector3(0, p.ny * s, p.nz * s);
  const outer = xs.map((x) => perim(hAt(x), rAt(x)));
  const inner = xs.map((x) => perim(hAt(x) - wall, Math.max(rAt(x) - wall, 0.008)));
  const n = outer[0].length;
  const winBand = 1;
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < n; j++) {
      const j2 = (j + 1) % n;
      if (i === winBand && outer[i][j].win) continue;
      const a = outer[i][j], b = outer[i][j2], c = outer[i + 1][j2], d = outer[i + 1][j];
      S.quad(P(xs[i], a), P(xs[i], b), P(xs[i + 1], c), P(xs[i + 1], d), Nv(a), Nv(b), Nv(c), Nv(d), Nv(a).add(Nv(b)));
      const ai = inner[i][j], bi = inner[i][j2], ci = inner[i + 1][j2], di = inner[i + 1][j];
      S.quad(P(xs[i], ai), P(xs[i], bi), P(xs[i + 1], ci), P(xs[i + 1], di), Nv(ai, -1), Nv(bi, -1), Nv(ci, -1), Nv(di, -1), Nv(ai, -1).add(Nv(bi, -1)));
    }
  }
  // Faces d'extrémité.
  for (const [i, sx] of [[0, -1], [xs.length - 1, 1]]) {
    const nx = new THREE.Vector3(sx, 0, 0);
    for (let j = 0; j < n; j++) {
      const j2 = (j + 1) % n;
      S.quad(P(xs[i], outer[i][j]), P(xs[i], outer[i][j2]), P(xs[i], inner[i][j2]), P(xs[i], inner[i][j]), nx, nx, nx, nx, nx);
    }
  }
  // Chants de la fenêtre.
  const jw = outer[0].findIndex((p) => p.win);
  const jw2 = jw + 1;
  const i0 = winBand, i1 = winBand + 1;
  const px = new THREE.Vector3(1, 0, 0), mx = new THREE.Vector3(-1, 0, 0);
  S.quad(P(xs[i0], outer[i0][jw]), P(xs[i0], outer[i0][jw2]), P(xs[i0], inner[i0][jw2]), P(xs[i0], inner[i0][jw]), px, px, px, px, px);
  S.quad(P(xs[i1], outer[i1][jw]), P(xs[i1], outer[i1][jw2]), P(xs[i1], inner[i1][jw2]), P(xs[i1], inner[i1][jw]), mx, mx, mx, mx, mx);
  const mz = new THREE.Vector3(0, 0, -1), pz = new THREE.Vector3(0, 0, 1);
  S.quad(P(xs[i0], outer[i0][jw]), P(xs[i1], outer[i1][jw]), P(xs[i1], inner[i1][jw]), P(xs[i0], inner[i0][jw]), mz, mz, mz, mz, mz);
  S.quad(P(xs[i0], outer[i0][jw2]), P(xs[i1], outer[i1][jw2]), P(xs[i1], inner[i1][jw2]), P(xs[i0], inner[i0][jw2]), pz, pz, pz, pz, pz);
  return S.geo();
}

// ================================================================== F09

export function F09(api) {
  const K = kit(api);
  const { S, G, M } = K;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const bx = -0.32, bz = -0.44, yc = 0.29; // surpresseur : axe du vilebrequin

  // ------------------------------------------- 1 — plaque principale
  const pl = K.bag();
  // Tôle de 25 mm oxycoupée : arêtes adoucies, découpes à coins arrondis (repère (x, -z)).
  const cut = (x, z, w, d) => G.roundRect(w, d, 0.012, 3).map(([u, v]) => [x + u, -z + v]).reverse();
  const holesXZ = [[-0.74, -0.08, 0.042], [1.06, 0.62, 0.009], [1.06, -0.62, 0.009], [-1.08, 0.66, 0.009], [-1.08, -0.66, 0.009], [0.2, 0.66, 0.009], [-0.4, 0.66, 0.009]];
  pl.add('red', G.shape(G.roundRect(2.3, 1.5, 0.045, 6), 0.025, {
    polys: [[0.8, -0.2, 0.24, 0.4], [bx, bz, 0.34, 0.34], [0.98, 0.16, 0.07, 0.15], [0.98, -0.3, 0.07, 0.15]].map((c) => cut(...c)),
    holes: holesXZ.map(([x, z, r]) => [x, -z, r]),
    bevel: 0.002,
  }).rotateX(-Math.PI / 2).translate(0, -0.0125, 0));
  // Plats de renfort soudés le long de la grande découpe avant.
  for (const s of [1, -1]) pl.add('red', G.xf(G.box(0.3, 0.012, 0.04, 0.003), [0.8, 0.006, -0.2 + s * 0.225]));
  // Butées de tension du moteur (cornières soudées + vis-vérins).
  const welds = K.bag();
  for (const z of [-0.48, -0.12]) {
    pl.add('red', G.xf(G.box(0.012, 0.07, 0.07, 0.003), [0.715, 0.035, z]));
    pl.add('red', G.xf(G.box(0.05, 0.012, 0.07, 0.003), [0.74, 0.006, z]));
    welds.add('red', K.weldGeo([0.709, 0.001, z - 0.035], [0.709, 0.001, z + 0.035]));
  }
  // Butée de tension de l'embase du surpresseur.
  pl.add('red', G.xf(G.box(0.012, 0.07, 0.08, 0.003), [-0.6, 0.035, bz]));
  pl.add('red', G.xf(G.box(0.05, 0.012, 0.08, 0.003), [-0.625, 0.006, bz]));
  const plS = K.bag();
  for (const z of [-0.48, -0.12]) {
    plS.add('steel', K.boltGeo([0.721, 0.045, z], [1, 0, 0], 0.016, { washer: false }));
    plS.add('steel', G.xf(G.toAxis(G.cyl(0.008, 0.11, { seg: 10 }), 'x'), [0.69, 0.045, z]));
    plS.add('steel', G.xf(G.toAxis(G.hex(0.024, 0.012), 'x'), [0.7, 0.045, z]));
  }
  plS.add('steel', K.boltGeo([-0.606, 0.045, bz], [-1, 0, 0], 0.016, { washer: false }));
  plS.add('steel', G.xf(G.toAxis(G.cyl(0.008, 0.06, { seg: 10 }), 'x'), [-0.58, 0.045, bz]));
  // Boulons de fixation du plancher sur les traverses du châssis.
  for (const x of FLOOR.boltX) for (const z of [FLOOR.boltZ, -FLOOR.boltZ]) plS.add('steel', K.boltGeo([x, 0, z], [0, 1, 0], 0.016, { stud: 0 }));
  // Traversée de cloison du boyau de refoulement (vers le collecteur du réservoir).
  // (sous la plaque : contre-écrou et tétine vers le collecteur 8 du réservoir, F08)
  plS.add('steel', G.xf(G.hex(0.075, 0.018), [-0.74, 0.009, -0.08]));
  plS.add('steel', G.xf(G.cyl(0.03, 0.04), [-0.74, 0.035, -0.08]));
  plS.add('steel', G.xf(G.hex(0.075, 0.016), [-0.74, -0.033, -0.08]));
  plS.add('steel', G.xf(G.cyl(0.03, 0.03), [-0.74, -0.055, -0.08]));
  const plate = pl.group();
  plS.build().forEach((m) => plate.add(m));
  welds.build({ noEdges: true }).forEach((m) => plate.add(m));
  P('1', plate, [0, 0, 0]);

  // ---------------------- moteur principal (F10), axe selon Z (poulie à -Z)
  const motor = api.sub('F10');
  motor.rotation.y = -Math.PI / 2;
  motor.position.set(0.4, 0, -0.3);
  P('F10', motor, [0, 0.75, 0]);

  // --------------------------------- 22 — embase du surpresseur (oblongs de tension)
  const base = K.bag();
  base.add('red', S.at(S.plate(0.5, 0.5, 0.02, 'red', { r: 0.012, cutouts: [[-0.19, -0.2, 0.06, 0.022], [0.19, -0.2, 0.06, 0.022], [-0.19, 0.2, 0.06, 0.022], [0.19, 0.2, 0.06, 0.022]] }), [bx, 0.01, bz]));
  for (const [dx, dz] of [[-0.19, -0.2], [0.19, -0.2], [-0.19, 0.2], [0.19, 0.2]]) base.add('steel', K.boltGeo([bx + dx, 0.02, bz + dz], [0, 1, 0], 0.016));
  P('22', base.group(), [0, 0.32, 0]);

  // ----------------------------------- 21 — surpresseur en W (3 cylindres)
  P('21', booster(K, bx, yc, bz), [0, 0.9, 0]);

  // ------------------------- 24 — volant (poulie du surpresseur) à 3 gorges
  const fwz = -0.76;
  const fw = K.bag();
  const rim = [[0.205, -0.035], [0.232, -0.035], [0.24, -0.029]];
  for (const c of [-0.0225, 0, 0.0225]) rim.push([0.24, c - 0.0095], [0.22, c - 0.0035], [0.22, c + 0.0035], [0.24, c + 0.0095]);
  rim.push([0.24, 0.029], [0.232, 0.035], [0.205, 0.035], [0.2, 0.03], [0.2, -0.03], [0.205, -0.035]);
  fw.add('black', G.xf(G.toAxis(G.lathe(rim, 64), 'z'), [bx, yc, fwz]));
  fw.add('black', G.xf(G.toAxis(G.lathe([[0.025, -0.055], [0.052, -0.055], [0.058, -0.048], [0.058, 0.04], [0.052, 0.046], [0.025, 0.046], [0.025, -0.055]], 28), 'z'), [bx, yc, fwz]));
  for (let k = 0; k < 3; k++) {
    const a0 = (k / 3) * Math.PI * 2 + 0.3;
    const L = [], Rr = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, r = 0.05 + t * 0.158, a = a0 + 0.55 * t * t, w = 0.03 - t * 0.011;
      const c = [Math.cos(a) * r, Math.sin(a) * r], n = [-Math.sin(a), Math.cos(a)];
      L.push([c[0] + n[0] * w, c[1] + n[1] * w]);
      Rr.unshift([c[0] - n[0] * w, c[1] - n[1] * w]);
    }
    fw.add('black', G.xf(G.shape([...L, ...Rr], 0.03, { bevel: 0.005 }), [bx, yc, fwz]));
  }
  fw.add('steel', G.xf(G.toAxis(G.hex(0.026, 0.012), '-z'), [bx, yc + 0.04, fwz - 0.03]));
  P('24', fw.group(), [0, 0.9, -0.5]);

  // ----------------------------------------- 29 — garde de courroie
  P('29', beltGuard(K, [bx, yc], [0.4, AXIS_Y]), [0, 0.06, -0.78]);

  // ------------------------------------------- distributeurs et supports
  // (bande arrière x < -0.93 laissée libre : équipements de la face avant du réservoir F11)
  const zc = 0.32, x14 = -0.41, x19 = -0.76;
  P('14', cSupport(K, x14, zc), [0, 0.3, 0.6]);
  P('16', valveBank(K, x14, zc, 7), [0, 0.75, 0.6]);
  P('19', cSupport(K, x19, zc), [0, 0.3, 0.6]);
  P('20', valveBank(K, x19, zc, 6), [0, 0.75, 0.6]);
  // 9 / 10 — boîtes de jonction électriques sur le bord droit, porte vers l'extérieur (+Z).
  P('9', junctionBox(K, x14 + 0.03, 0.6), [0, 0.25, 1.0]);
  P('10', junctionBox(K, x19 + 0.04, 0.6), [0, 0.25, 1.0]);
  // 11-13 — manifolds retenue/descente (×2) sur le support de forage : bloc, cartouche, bobine.
  [x14 - 0.07, x14 + 0.06].forEach((x) => {
    const z = zc - 0.06;
    P('13', K.bag().add(M.zinc, G.xf(G.box(0.08, 0.08, 0.08, 0.004), [x, 0.515, z])).add('steel', [[0.025, 0.025], [-0.025, -0.025]].map(([a, b]) => G.xf(G.toAxis(G.hex(0.018, 0.006), 'x'), [x + 0.043, 0.515 + a, z + b]))).group(), [0, 1.0, 0.45]);
    P('11', K.bag().add('steel', [
      G.xf(G.toAxis(G.hex(0.03, 0.012), '-z'), [x, 0.52, z - 0.046]),
      G.xf(G.toAxis(G.cyl(0.011, 0.075, { seg: 14 }), '-z'), [x, 0.52, z - 0.08]),
      G.xf(G.toAxis(G.hex(0.016, 0.008), '-z'), [x, 0.52, z - 0.122]),
    ]).group(), [0, 1.0, 0.3]);
    P('12', K.bag().add('darkSteel', G.xf(G.toAxis(G.cyl(0.026, 0.045, { seg: 24 }), '-z'), [x, 0.52, z - 0.085])).add('black', G.xf(G.box(0.03, 0.03, 0.022, 0.003), [x, 0.554, z - 0.085])).group(), [0, 1.0, 0.15]);
  });
  // 15 — lubrificateur de la pompe à huile de perforatrice.
  P('15', K.bag().add('grey', [G.xf(G.box(0.07, 0.05, 0.06, 0.006), [x14, 0.495, zc + 0.08]), G.xf(G.cyl(0.028, 0.06, { seg: 20 }), [x14, 0.545, zc + 0.08])]).add('black', G.xf(G.cyl(0.012, 0.03), [x14, 0.59, zc + 0.08])).add('steel', [G.xf(G.toAxis(G.hex(0.016, 0.01), 'x'), [x14 + 0.04, 0.495, zc + 0.08]), G.xf(G.toAxis(G.hex(0.016, 0.01), '-x'), [x14 - 0.04, 0.495, zc + 0.08])]).group(), [0, 1.0, 0.75]);
  // 18 — valves charge/décharge Rexroth (×2) sur le support de mise en place.
  [x19 - 0.07, x19 + 0.07].forEach((x) => {
    const b = K.bag();
    b.add('black', G.xf(G.box(0.06, 0.02, 0.09, 0.003), [x, 0.48, zc]));
    b.add('black', G.xf(G.box(0.05, 0.055, 0.05, 0.005), [x, 0.5175, zc + 0.012]));
    b.add('black', G.xf(G.toAxis(G.cyl(0.024, 0.05, { seg: 20 }), '-z'), [x, 0.52, zc - 0.035]));
    b.add('grey', G.xf(G.box(0.03, 0.035, 0.022, 0.004), [x, 0.552, zc - 0.035]));
    b.add('steel', G.xf(G.toAxis(G.hex(0.02, 0.009), '-z'), [x, 0.52, zc - 0.064]));
    for (const dz of [-0.035, 0.035]) b.add('steel', K.boltGeo([x - 0.02, 0.49, zc + dz], [0, 1, 0], 0.006, { washer: false }));
    P('18', b.group(), [0, 1.0, 0.6]);
  });
  // 8 — valve de séquence de retenue + 7 cartouche.
  P('8', K.bag().add('grey', G.xf(G.box(0.1, 0.06, 0.08, 0.005), [-0.88, 0.03, -0.06])).add('steel', [G.xf(G.toAxis(G.hex(0.02, 0.008), 'z'), [-0.9, 0.035, -0.016]), G.xf(G.toAxis(G.hex(0.02, 0.008), 'z'), [-0.86, 0.035, -0.016])]).group(), [-0.3, 0.35, 0.1]);
  P('7', K.bag().add('steel', [
    G.xf(G.toAxis(G.hex(0.028, 0.012), 'x'), [-0.824, 0.032, -0.06]),
    G.xf(G.toAxis(G.cyl(0.01, 0.05, { seg: 14 }), 'x'), [-0.81, 0.032, -0.06]),
    G.xf(G.toAxis(G.hex(0.016, 0.008), 'x'), [-0.78, 0.032, -0.06]),
  ]).group(), [-0.15, 0.35, 0.1]);

  // --------------------------- admission d'air (25), filtre (26) et élément (27)
  // Silencieux d'admission couché côté gauche, filtre posé dessus, rampe vers les orifices
  // -Z des deux culasses BP.
  const iz = -0.55, iy = 0.075, fx = -0.78;
  const ib = K.bag();
  ib.add('black', G.xf(G.toAxis(G.lathe([[0, -0.15], [0.026, -0.15, 1], [0.044, -0.141, 1], [0.053, -0.125, 1], [0.055, -0.11], [0.055, 0.11], [0.053, 0.125, 1], [0.044, 0.141, 1], [0.026, 0.15, 1], [0, 0.15]], 32), 'x'), [-0.73, iy, iz]));
  for (const x of [-0.84, -0.66]) {
    ib.add('black', G.xf(G.box(0.06, 0.006, 0.08, 0.002), [x, 0.003, iz]));
    ib.add('black', G.xf(G.box(0.06, 0.02, 0.008, 0.002), [x, 0.016, iz]));
    ib.add('black', G.xf(G.toAxis(G.ring(0.061, 0.055, 0.026, 32), 'x'), [x, iy, iz]));
    for (const dz of [-0.026, 0.026]) ib.add('steel', K.boltGeo([x, 0.006, iz + dz], [0, 1, 0], 0.008));
  }
  ib.add('black', G.xf(G.cyl(0.03, 0.04), [fx, 0.14, iz]));
  ib.add('black', G.xf(G.cyl(0.075, 0.01), [fx, 0.16, iz]));
  ib.add('steel', K.bentTubeGeo([[-0.62, 0.12, iz], [-0.62, 0.47, iz], [-0.62, 0.47, -0.62]], 0.022, 0.05));
  ib.add('steel', K.bentTubeGeo([[-0.62, 0.47, -0.62], [-0.041, 0.47, -0.62], [-0.041, 0.451, -0.53]], 0.022, 0.05));
  ib.add('steel', K.bentTubeGeo([[-0.6, 0.47, -0.62], [-0.6, 0.451, -0.6], [-0.6, 0.451, -0.53]], 0.02, 0.03));
  P('25', ib.group(), [0, 0.42, 0.25]);
  const fl = new THREE.Group();
  fl.add(S.at(S.shell(0.11, 0.104, 0.15, 'black', { seg: 40 }), [fx, 0.24, iz]));
  fl.add(K.bag().add('black', G.xf(G.lathe([[0, 0], [0.113, 0], [0.114, 0.012, 1], [0.106, 0.026, 1], [0.08, 0.034, 1], [0, 0.036]], 40), [fx, 0.315, iz])).add('steel', [G.xf(G.cyl(0.008, 0.02, { seg: 12 }), [fx, 0.355, iz]), G.xf(G.box(0.04, 0.012, 0.006, 0.002), [fx, 0.368, iz])]).group());
  P('26', fl, [0, 0.75, 0]);
  const el = K.bag();
  const pleats = [];
  for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2; const r = i % 2 ? 0.088 : 0.098; pleats.push([Math.cos(a) * r, Math.sin(a) * r]); }
  const ring = Array.from({ length: 36 }, (_, i) => { const a = -(i / 36) * Math.PI * 2; return [Math.cos(a) * 0.05, Math.sin(a) * 0.05]; });
  el.add('cream', G.xf(G.shape(pleats, 0.13, { polys: [ring] }).rotateX(Math.PI / 2), [fx, 0.24, iz]));
  el.add('darkSteel', [G.xf(G.ring(0.1, 0.05, 0.006, 36), [fx, 0.308, iz]), G.xf(G.ring(0.1, 0.05, 0.006, 36), [fx, 0.172, iz])]);
  P('27', el.group(), [0, 0.5, 0]);

  // ----------------------------- boyaux tressés : 17 (refoulement), 23 (avant)
  P('17', K.hose([bx, 0.648, bz], [0, 1, 0], [-0.74, 0.055, -0.08], [0, 1, 0], [[bx - 0.08, 0.79, bz + 0.07], [-0.62, 0.76, -0.2]], 0.024), [0, 1.15, 0.1]);
  P('23', K.hose([0.98, -0.205, 0.0], [0, -1, 0], [0.98, -0.205, -0.16], [0, -1, 0], [[0.98, -0.477, -0.023], [0.98, -0.5, -0.08], [0.98, -0.477, -0.137]], 0.03), [0.45, -0.3, 0]);

  // --------------- avant : 4 vanne 2" HP + 2 clapet ; 28 vanne 3 voies ; actionneurs
  // Vannes sous la plaque ; actionneurs sur le dessus, accouplés au travers des lumières.
  P('4', valve2(K, [0.98, -0.14, 0.16]), [0.45, -0.3, 0]);
  P('2', K.bag().add('steel', [
    G.xf(G.toAxis(G.lathe([[0, 0], [0.05, 0], [0.052, 0.005], [0.052, 0.055], [0.05, 0.06], [0, 0.06]], 24), 'z'), [0.98, -0.14, 0.27]),
    G.xf(G.toAxis(G.hex(0.1, 0.025), 'z'), [0.98, -0.14, 0.3425]),
    G.xf(G.toAxis(G.hex(0.1, 0.025), 'z'), [0.98, -0.14, 0.3675]),
  ]).add('darkSteel', G.xf(G.toAxis(G.ring(0.042, 0.03, 0.016, 24), 'z'), [0.98, -0.14, 0.388])).group(), [0.45, -0.3, 0.28]);
  P('28', triValve(K, [0.98, -0.14, -0.3]), [0.45, -0.3, 0]);
  [[0.98, 0.16], [0.98, -0.3]].forEach(([x, z]) => {
    P('6', K.bag().add('steel', [G.xf(G.cyl(0.018, 0.075, { seg: 18 }), [x, -0.025, z]), G.xf(G.box(0.012, 0.03, 0.012, 0.002), [x, -0.06, z])]).group(), [0.45, 0.42, 0]);
    P('5', K.bag().add('grey', G.shape(roundRect(0.08, 0.08, 0.006), 0.05, { holes: [[0, 0, 0.022]] }).rotateX(Math.PI / 2).translate(x, 0.025, z)).add('steel', [[0.03, 0.03], [-0.03, 0.03], [0.03, -0.03], [-0.03, -0.03]].map(([a, b]) => K.boltGeo([x + a, 0.05, z + b], [0, 1, 0], 0.007, { washer: false }))).group(), [0.45, 0.62, 0]);
    const ac = K.bag();
    ac.add('blue', G.xf(G.box(0.1, 0.09, 0.1, 0.01), [x, 0.095, z]));
    ac.add('blue', G.xf(G.box(0.03, 0.02, 0.03, 0.004), [x, 0.15, z]));
    ac.add('steel', [G.xf(G.toAxis(G.hex(0.018, 0.012), 'x'), [x + 0.056, 0.08, z - 0.025]), G.xf(G.toAxis(G.hex(0.018, 0.012), 'x'), [x + 0.056, 0.08, z + 0.025])]);
    ac.add('steel', [[0.04, 0.04], [-0.04, 0.04], [0.04, -0.04], [-0.04, -0.04]].map(([a, b]) => K.boltGeo([x + a, 0.14, z + b], [0, 1, 0], 0.006, { washer: false })));
    P('3', ac.group(), [0.45, 0.85, 0]);
  });

  return { view: { dir: [1.0, 0.85, -1.05] } };
}

// ------------------------------------------------------------ sous-ensembles F09

/** Surpresseur en W : carter, 2 cylindres BP à ±60°, cylindre HP vertical, refroidisseur intermédiaire. */
function booster(K, bx, yc, bz) {
  const { G } = K;
  const blk = K.bag(), fins = K.bag(), st = K.bag(), tubes = K.bag();
  // Carter (profil latéral extrudé selon Z), pattes, couvercles.
  const prof = [[-0.16, -0.22], [0.16, -0.22], [0.16, -0.02], [0.137, -0.0075], [0.062, 0.1225], [0.06, 0.125], [-0.06, 0.125], [-0.062, 0.1225], [-0.137, -0.0075], [-0.16, -0.02]];
  blk.add('black', G.xf(G.shape(prof, 0.22, { bevel: 0.007 }), [bx, yc, bz]));
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      blk.add('black', G.xf(G.box(0.07, 0.05, 0.06, 0.008), [bx + sx * 0.15, 0.045, bz + sz * 0.08]));
      blk.add('black', G.xf(G.box(0.09, 0.016, 0.07, 0.004), [bx + sx * 0.16, 0.028, bz + sz * 0.08]));
      st.add('steel', K.boltGeo([bx + sx * 0.185, 0.036, bz + sz * 0.08], [0, 1, 0], 0.014, { stud: 0.012, nut: true }));
    }
  }
  // Palier côté volant (-Z) : couvercle carré boulonné, bossage, bout de vilebrequin.
  blk.add('black', G.xf(G.box(0.13, 0.13, 0.014, 0.01), [bx, yc, bz - 0.124]));
  blk.add('black', G.xf(G.toAxis(G.cyl(0.05, 0.04), 'z'), [bx, yc, bz - 0.15]));
  for (const [dx, dy] of [[0.05, 0.05], [-0.05, 0.05], [0.05, -0.05], [-0.05, -0.05]]) st.add('steel', K.boltGeo([bx + dx, yc + dy, bz - 0.131], [0, 0, -1], 0.009));
  st.add('steel', G.xf(G.toAxis(G.cyl(0.024, 0.24), 'z'), [bx, yc, bz - 0.29]));
  // Trappe de visite (+Z), voyant d'huile et bouchon de vidange (+X), jauge.
  blk.add('black', G.xf(G.box(0.16, 0.1, 0.01, 0.008), [bx, yc - 0.1, bz + 0.12]));
  for (const dx of [-0.065, 0, 0.065]) for (const dy of [-0.038, 0.038]) st.add('steel', K.boltGeo([bx + dx, yc - 0.1 + dy, bz + 0.125], [0, 0, 1], 0.007, { washer: false }));
  st.add('chrome', G.xf(G.toAxis(G.cyl(0.016, 0.01), 'x'), [bx + 0.172, yc - 0.15, bz + 0.05]));
  st.add('steel', G.xf(G.toAxis(G.hex(0.022, 0.01), 'x'), [bx + 0.172, yc - 0.195, bz - 0.05]));
  st.add('steel', G.xf(G.cyl(0.006, 0.2, { seg: 8 }), [bx + 0.12, yc + 0.1, bz + 0.08], [0, 0, -0.35]));
  st.add('red', G.xf(G.toAxis(G.torus(0.012, 0.003, 16, 6), 'z'), [bx + 0.085, yc + 0.2, bz + 0.08]));
  st.add('lightGrey', G.xf(G.box(0.004, 0.05, 0.08), [bx + 0.169, yc - 0.08, bz - 0.03]));
  // Cylindres : barils à ailettes rondes, brides de pied, culasses carrées.
  const cyls = [[Math.PI / 3, 0.115, 0.056, 0.088, 0.17, 0.155], [-Math.PI / 3, 0.115, 0.056, 0.088, 0.17, 0.155], [0, 0.125, 0.043, 0.066, 0.14, 0.12]];
  const heads = [];
  for (const [phi, dk, rb, rf, len, hw] of cyls) {
    const a = new THREE.Vector3(Math.sin(phi), Math.cos(phi), 0);
    const tq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), a);
    const at = (s, g) => { g.applyQuaternion(tq); return g.translate(bx + a.x * s, yc + a.y * s, bz); };
    blk.add('black', at(dk + 0.008, G.box(hw, 0.016, hw, 0.008)));
    blk.add('black', at(dk + len / 2, G.cyl(rb, len, { seg: 28 })));
    const n = Math.round((len - 0.04) / 0.017);
    for (let i = 0; i < n; i++) fins.add('black', at(dk + 0.03 + i * 0.017, G.ring(rf, rb - 0.004, 0.0055, 32)));
    const hh = rb > 0.05 ? 0.075 : 0.065;
    blk.add('black', at(dk + len + hh / 2, G.box(hw, hh, hw, 0.013)));
    blk.add('black', at(dk + len + hh + 0.006, G.box(hw * 0.7, 0.012, hw * 0.7, 0.006)));
    // Brides d'orifice sur les côtés de la culasse.
    for (const sz of [-1, 1]) {
      const g = G.box(0.055, 0.04, 0.012, 0.004);
      blk.add('black', at(dk + len + hh / 2, g.translate(0, 0, sz * (hw / 2 + 0.006))));
    }
    // Goujons et écrous : pied de cylindre et culasse.
    for (const [u, w] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const off = new THREE.Vector3(u * hw * 0.38, 0, w * hw * 0.38).applyQuaternion(tq);
      const p1 = new THREE.Vector3(bx, yc, bz).addScaledVector(a, dk + len + hh + 0.012).add(off);
      st.add('steel', K.boltGeo(p1, a, 0.01, { washer: false }));
      const p0 = new THREE.Vector3(bx, yc, bz).addScaledVector(a, dk + 0.016).add(off.clone().multiplyScalar(1.12));
      st.add('steel', K.boltGeo(p0, a, 0.011, { washer: false, stud: 0.01, nut: true }));
    }
    heads.push(new THREE.Vector3(bx, yc, bz).addScaledVector(a, dk + len + hh / 2));
  }
  // Refroidisseur intermédiaire : tubes cintrés des brides latérales des culasses BP
  // vers celles de la culasse HP, par-dessus ; bossage de refoulement sur la culasse HP.
  const [h1, h2, h0] = heads;
  for (const [hA, sx, sz] of [[h1, 1, 1], [h2, -1, -1]]) {
    const pts = [
      [hA.x, hA.y, hA.z + 0.088], [hA.x, hA.y + 0.01, hA.z + 0.115],
      [hA.x - sx * 0.04, hA.y + 0.12, hA.z + 0.11],
      [h0.x + sx * 0.08, h0.y + 0.08, h0.z + sz * 0.02], [h0.x + sx * 0.012, h0.y + 0.005, h0.z + sz * 0.1], [h0.x, h0.y, h0.z + sz * 0.068],
    ];
    for (const dd of [-0.012, 0.012]) {
      tubes.add('darkSteel', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p, i) => K.V3([p[0] + (i > 0 && i < 5 ? dd : 0), p[1] + (i > 0 && i < 5 ? dd * 0.5 : 0), p[2]])), false, 'centripetal'), 40, 0.0075, 8));
    }
  }
  st.add('steel', G.xf(G.hex(0.042, 0.016), [h0.x, h0.y + 0.0505, h0.z]));
  const g = blk.group();
  fins.build({ noEdges: true }).forEach((m) => g.add(m));
  st.build().forEach((m) => g.add(m));
  tubes.build({ noEdges: true }).forEach((m) => g.add(m));
  return g;
}

/** Garde de courroie : enveloppe (deux arcs + tangentes, fond plat), faces, disque gris. */
function beltGuard(K, [fx, fy], [sx, sy]) {
  const { G } = K;
  const pts = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    pts.push([fx + Math.cos(a) * 0.275, Math.max(fy + Math.sin(a) * 0.275, 0.006)]);
    pts.push([sx + Math.cos(a) * 0.15, Math.max(sy + Math.sin(a) * 0.15, 0.006)]);
  }
  pts.push([fx - 0.12, 0.006], [sx + 0.08, 0.006]);
  const hull = convexHull(pts);
  // Contour intérieur (tôle de 3 mm) : retrait le long des normales.
  const n = hull.length;
  const inset = hull.map((p, i) => {
    const a = hull[(i - 1 + n) % n], b = hull[(i + 1) % n];
    const t = [b[0] - a[0], b[1] - a[1]];
    const l = Math.hypot(t[0], t[1]) || 1;
    return [p[0] - (t[1] / l) * 0.004, p[1] + (t[0] / l) * 0.004];
  });
  const z0 = -0.716, z1 = -0.864;
  const b = K.bag(), st = K.bag();
  b.add('black', G.xf(G.shape(hull, z0 - z1, { polys: [inset] }), [0, 0, (z0 + z1) / 2]));
  b.add('black', G.xf(G.shape(hull, 0.004), [0, 0, z1 + 0.002]));
  b.add('black', G.xf(G.shape(hull, 0.004, { holes: [[fx, fy, 0.075], [sx, sy, 0.128]] }), [0, 0, z0 - 0.002]));
  // Pied boulonné sur la plaque.
  const xa = Math.min(...hull.map((p) => p[0])) + 0.1, xb = Math.max(...hull.map((p) => p[0])) - 0.06;
  b.add('black', G.xf(G.box(xb - xa, 0.004, 0.04, 0.001), [(xa + xb) / 2, 0.002, z0 + 0.02]));
  for (const x of [xa + 0.05, (xa + xb) / 2, xb - 0.05]) st.add('steel', K.boltGeo([x, 0.004, z0 + 0.024], [0, 1, 0], 0.009));
  // Disque de visite gris (face extérieure) et vis de tôle.
  const disc = K.bag().add('lightGrey', G.xf(G.toAxis(G.cyl(0.172, 0.004, { seg: 56 }), 'z'), [fx, fy, z1 - 0.003]));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    st.add('steel', G.xf(G.toAxis(G.cyl(0.006, 0.004, { seg: 10 }), 'z'), [fx + Math.cos(a) * 0.155, fy + Math.sin(a) * 0.155, z1 - 0.0055]));
  }
  const g = b.group();
  disc.build().forEach((m) => g.add(m));
  st.build().forEach((m) => g.add(m));
  return g;
}

function convexHull(points) {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const q of p) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
  for (const q of p.reverse()) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

/** Support en C (tôle pliée noire) : dos percé d'allégements côté +Z, dessus en tablette. */
function cSupport(K, x, zc) {
  const { G } = K;
  const b = K.bag(), st = K.bag();
  const H = 0.47, D = 0.26, W = 0.3, t = 0.01, rb = 0.018;
  const zo = zc + D / 2; // face extérieure du dos
  const cz = zo - t - rb; // centre des pliages
  // Dos (plan X-Y) avec trous d'allègement.
  const hb = H - 2 * (t + rb);
  const holes = [];
  for (const yy of [-0.12, 0, 0.12]) for (const xx of [-0.075, 0.075]) holes.push([xx, yy, 0.022]);
  b.add('black', G.xf(G.shape(roundRect(W, hb, 0.002), t, { holes }), [x, H / 2, zo - t / 2]));
  // Dessus (tablette) et semelle boulonnée.
  const lz = cz - (zc - D / 2);
  b.add('black', G.xf(G.box(W, t, lz, 0.002), [x, H - t / 2, zc - D / 2 + lz / 2]));
  b.add('black', G.xf(G.box(W, t, lz, 0.002), [x, t / 2, zc - D / 2 + lz / 2]));
  // Pliages : quarts d'anneau dans le plan (z, y), extrudés selon X.
  b.add('black', G.xf(G.sector(rb, rb + t, 0, Math.PI / 2, W, 5).rotateY(-Math.PI / 2), [x, H - t - rb, cz]));
  b.add('black', G.xf(G.sector(rb, rb + t, -Math.PI / 2, 0, W, 5).rotateY(-Math.PI / 2), [x, t + rb, cz]));
  for (const dx of [-0.11, 0.11]) for (const dz of [-0.08, 0.0]) st.add('steel', K.boltGeo([x + dx, t, zc + dz], [0, 1, 0], 0.01));
  const g = b.group();
  st.build().forEach((m) => g.add(m));
  return g;
}

/** Banc de distributeurs vertical (sections empilées selon Y), opérateurs vers -Z. */
function valveBank(K, x, zc, n) {
  const { G } = K;
  const b = K.bag(), st = K.bag(), cap = K.bag();
  const sh = 0.045, end = 0.05, z0 = zc + 0.075;
  let yy = 0.03;
  b.add('black', G.xf(G.box(0.16, end, 0.11, 0.006), [x, yy + end / 2, z0]));
  yy += end;
  for (let i = 0; i < n; i++) {
    const yc = yy + sh / 2;
    b.add('black', G.xf(G.box(0.15, sh - 0.002, 0.1, 0.004), [x, yc, z0]));
    // Opérateur électro-hydraulique : corps, bobine, connecteur.
    b.add('black', G.xf(G.box(0.07, sh * 0.78, 0.035, 0.005), [x - 0.025, yc, z0 - 0.067]));
    cap.add('darkSteel', G.xf(G.toAxis(G.cyl(0.013, 0.03, { seg: 16 }), '-z'), [x + 0.03, yc, z0 - 0.065]));
    cap.add('grey', G.xf(G.box(0.022, 0.026, 0.016, 0.003), [x - 0.025, yc, z0 - 0.092]));
    // Orifices de travail A / B (bouchons) sur +X.
    for (const dz of [-0.025, 0.025]) st.add('steel', G.xf(G.toAxis(G.hex(0.022, 0.008), 'x'), [x + 0.079, yc, z0 + dz]));
    yy += sh;
  }
  b.add('black', G.xf(G.box(0.16, end, 0.11, 0.006), [x, yy + end / 2, z0]));
  const top = yy + end;
  // Tirants et écrous.
  for (const [dx, dz] of [[0.06, 0.035], [-0.06, 0.035], [0.06, -0.035], [-0.06, -0.035]]) {
    st.add('steel', G.xf(G.cyl(0.005, top - 0.03 + 0.016, { seg: 8 }), [x + dx, (top + 0.03) / 2, z0 + dz]));
    st.add('steel', G.xf(G.hex(0.014, 0.008), [x + dx, top + 0.004, z0 + dz]));
    st.add('steel', G.xf(G.hex(0.014, 0.008), [x + dx, 0.026, z0 + dz]));
  }
  // Levier de secours en tête.
  st.add('steel', G.xf(G.cyl(0.005, 0.07, { seg: 10 }), [x - 0.03, top + 0.035, z0 - 0.04], [-0.5, 0, 0]));
  cap.add('black', G.xf(G.lathe([[0, -0.02], [0.008, -0.02], [0.012, -0.008, 1], [0.013, 0.008, 1], [0.009, 0.018, 1], [0, 0.02]], 14), [x - 0.03, top + 0.07, z0 - 0.058]));
  const g = b.group();
  st.build().forEach((m) => g.add(m));
  cap.build().forEach((m) => g.add(m));
  return g;
}

/** Boîte de jonction (porte vers +Z, bord droit) sur pieds en cornière ; câbles plongeant au plancher. */
function junctionBox(K, x, z) {
  const { S, G } = K;
  const g = new THREE.Group();
  const e = S.enclosure(0.3, 0.36, 0.14, 'grey');
  e.position.set(x, 0.25, z);
  g.add(e);
  const b = K.bag(), st = K.bag(), cab = K.bag();
  for (const dx of [-0.12, 0.12]) {
    b.add('black', G.xf(G.box(0.03, 0.07, 0.03, 0.002), [x + dx, 0.035, z - 0.045]));
    b.add('black', G.xf(G.box(0.05, 0.006, 0.08, 0.002), [x + dx, 0.003, z - 0.045]));
    st.add('steel', K.boltGeo([x + dx, 0.006, z - 0.07], [0, 1, 0], 0.008));
  }
  b.add('black', G.xf(G.box(0.28, 0.006, 0.03, 0.002), [x, 0.067, z - 0.045]));
  // Câbles sous gaine : des presse-étoupes vers les passe-fils du plancher.
  for (const dx of [-0.075, 0, 0.075]) {
    const pts = [[x + dx, 0.06, z], [x + dx, 0.035, z - 0.005], [x + dx * 0.8, 0.012, z - 0.03], [x + dx * 0.6, 0.0, z - 0.075]];
    cab.add('rubber', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(K.V3), false, 'centripetal'), 16, 0.0065, 8));
    b.add('black', G.xf(G.ring(0.016, 0.007, 0.006, 16), [x + dx * 0.6, 0.003, z - 0.075]));
  }
  b.build().forEach((m) => g.add(m));
  st.build().forEach((m) => g.add(m));
  cab.build({ noEdges: true }).forEach((m) => g.add(m));
  return g;
}

/** Coude fonte 90° (2") : départ p selon d0, sortie selon d1 ; six-pans à l'entrée. */
function castElbow(G, p, d0, d1, l0, l1) {
  const P0 = new THREE.Vector3(...p), D0 = new THREE.Vector3(...d0), D1 = new THREE.Vector3(...d1);
  const C = P0.clone().addScaledVector(D0, l0);
  return [
    G.aim(G.hex(0.085, 0.02), P0.clone().addScaledVector(D0, 0.01), D0),
    G.aim(G.cyl(0.035, l0 - 0.02, { seg: 20 }), P0.clone().addScaledVector(D0, 0.01 + l0 / 2), D0),
    new THREE.SphereGeometry(0.039, 20, 12).translate(C.x, C.y, C.z),
    G.aim(G.cyl(0.035, l1, { seg: 20 }), C.clone().addScaledVector(D1, l1 / 2), D1),
    G.aim(G.cyl(0.04, 0.012, { seg: 20 }), C.clone().addScaledVector(D1, l1 - 0.006), D1),
  ];
}

/** Vanne à bille 2" HP actionnée (axe Z) : corps laiton, écrous six-pans, platine ISO. */
function valve2(K, [x, y, z]) {
  const { G } = K;
  const b = K.bag();
  b.add('brass', G.xf(G.toAxis(G.lathe([[0, -0.07], [0.05, -0.07], [0.058, -0.05, 1], [0.062, 0], [0.058, 0.05, 1], [0.05, 0.07], [0, 0.07]], 28), 'z'), [x, y, z]));
  for (const s of [-1, 1]) b.add('brass', G.xf(G.toAxis(G.hex(0.1, 0.028), 'z'), [x, y, z + s * 0.08]));
  for (const s of [-1, 1]) b.add('brass', G.xf(G.toAxis(G.cyl(0.042, 0.02), 'z'), [x, y, z + s * 0.1]));
  // Tige vers le haut et platine de montage de l'actionneur.
  b.add('brass', G.xf(G.cyl(0.024, 0.04), [x, y + 0.075, z]));
  b.add('steel', G.xf(G.box(0.07, 0.008, 0.07, 0.003), [x, y + 0.095, z]));
  // Coude de sortie vers le bas (boyau 23).
  b.add('steel', castElbow(G, [x, y, z - 0.105], [0, 0, -1], [0, -1, 0], 0.055, 0.065));
  for (const [a, c] of [[0.026, 0.026], [-0.026, 0.026], [0.026, -0.026], [-0.026, -0.026]]) b.add('steel', K.boltGeo([x + a, y + 0.099, z + c], [0, 1, 0], 0.006, { washer: false }));
  return b.group();
}

/** Vanne 3 voies 2" HP (corps acier, 2 orifices en ligne selon Z + 1 latéral vers +X). */
function triValve(K, [x, y, z]) {
  const { G } = K;
  const b = K.bag();
  b.add('steel', G.xf(G.toAxis(G.lathe([[0, -0.085], [0.042, -0.085], [0.046, -0.08], [0.046, -0.06], [0.058, -0.055], [0.058, 0.055], [0.046, 0.06], [0.046, 0.08], [0.042, 0.085], [0, 0.085]], 28), 'z'), [x, y, z]));
  b.add('steel', G.xf(G.toAxis(G.lathe([[0, 0], [0.046, 0], [0.046, 0.05], [0.05, 0.055], [0.05, 0.07], [0.046, 0.075], [0, 0.075]], 28), '-x'), [x, y, z]));
  b.add('darkSteel', G.xf(G.toAxis(G.ring(0.04, 0.03, 0.006, 24), 'z'), [x, y, z - 0.087]));
  b.add('darkSteel', G.xf(G.toAxis(G.ring(0.04, 0.03, 0.006, 24), 'z'), [x, y, z + 0.087]));
  b.add('darkSteel', G.xf(G.toAxis(G.ring(0.04, 0.03, 0.006, 24), 'x'), [x - 0.077, y, z]));
  b.add('steel', G.xf(G.cyl(0.024, 0.04), [x, y + 0.075, z]));
  b.add('steel', G.xf(G.box(0.07, 0.008, 0.07, 0.003), [x, y + 0.095, z]));
  // Coude de sortie vers le bas (boyau 23).
  b.add('steel', castElbow(G, [x, y, z + 0.09], [0, 0, 1], [0, -1, 0], 0.05, 0.065));
  // Patte de fixation latérale.
  b.add('steel', G.xf(G.box(0.012, 0.06, 0.08, 0.003), [x + 0.066, y + 0.01, z]));
  for (const [a, c] of [[0.026, 0.026], [-0.026, 0.026], [0.026, -0.026], [-0.026, -0.026]]) b.add('steel', K.boltGeo([x + a, y + 0.099, z + c], [0, 1, 0], 0.006, { washer: false }));
  return b.group();
}

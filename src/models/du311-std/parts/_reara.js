// Cotes et fonctions communes du lot « pont arrière A » du DU311 sur roues
// (s/n 10703) : transmission par courroies P418, capot du compresseur P422 et
// ses trois portes P424 / P426 / P428, accessoires du pont P488. Fichier
// préfixé « _ » : pas un assemblage, jamais inscrit dans parts/index.js.
//
// Tôlerie : contours plans [[x, y], …] en mètres, extrudés ou balayés dans un
// repère de tôle (x, y dans le plan, z = profondeur), puis portés dans le
// repère de la pièce par une matrice (xform) qui retourne les faces si la
// matrice est un miroir. Aucune couleur assombrie : le relief vient des plis
// arrondis, des bords tombés, des chants et des matériaux.

import { M } from '../layout.js';

export const IN = 0.0254;
export const I = (v) => v * IN;
export const DEG = Math.PI / 180;

// ------------------------------------------------------------------ châssis du pont
// Châssis du pont arrière (P420 rep. 1) tel que le pose ../reardeck.js :
// flancs de 25 mm à z = ±0.86 (face extérieure à ±0.8725), de y = 0.48 à
// 1.0, du pare-chocs (x = M.rear) au capot moteur (x = M.engine.x0) ; plancher
// dessus à y = 0.50 ; traverse avant (x = -2.755 … -2.805).
export const DECK = {
  x0: M.rear, x1: M.engine.x0, top: M.frameTop, bot: 0.48, floor: 0.5,
  z: 0.86, zo: 0.8725, front: [-2.805, -2.755],
};

// ------------------------------------------------------------------ capot du compresseur
// Capot P422 (repère machine) mesuré sur les pages 416, 422, 424 et 428 à
// l'échelle de la poulie 10,3 po du moteur et du châssis : 1,37 m de long
// (face avant à x = xf contre le capot moteur, arrière des retours de portes à
// x = xr), 1,92 m de large (peau des portes latérales à z = ±zo), portes
// posées à y = yb au-dessus du châssis, dessus incliné de 4,8° vers l'arrière
// (y = yf à l'avant, yr à l'arrière). Charnières des portes latérales : axe
// vertical en x = hx, z = ±hz (nœud devant la face avant) ; porte du dessus :
// axe le long de Z en x = hx, y = hy. Tôle des portes 12 ga (t), plis de
// rayon extérieur ro, bords tombés de ret.
export const CAN = (() => {
  const xf = -2.79, xr = -4.16, yb = 1.01, yf = 1.975, yr = 1.86;
  const L = xf - xr;
  return {
    xf, xr, L, zo: 0.96, yb, yf, yr,
    vF: yf - yb, vR: yr - yb, slope: Math.atan2(yf - yr, L),
    hx: xf + 0.008, hz: 0.926, hy: yf - 0.034,
    t: 0.0027, ro: 0.006, ret: 0.032,
    topZ: [-0.91, 0.42], // porte du dessus (P426) entre le retour de la porte gauche et la baie ouverte
    bayZ: [0.42, 0.76], // baie d'évacuation d'air, ouverte, sous laquelle passe la tuyauterie
    rightTop: 0.2, // retour supérieur et aile arrière de la porte droite (P428)
    leftWing: 0.5, // aile arrière de la porte gauche (P424)
    leftTop: 0.05, // retour supérieur de la porte gauche
    post: 0.898, // axe des montants avant (10, 11) : face intérieure contre le châssis
    beam: { x: [-2.8458, -2.795], y: [1.863, 1.939] }, // traverse avant (P422 rep. 9)
    fan: { x: -3.39, y: 1.34, r: 0.33 }, // ouverture ronde de la porte gauche (axe du volant ventilé)
  };
})();
/** Hauteur du dessus du capot (plan des retours supérieurs) à l'abscisse machine x. */
export const topY = (x) => CAN.yr + ((x - CAN.xr) * (CAN.yf - CAN.yr)) / CAN.L;

// ------------------------------------------------------------------ contours plans
export const arcPts = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
  const a = a0 + ((a1 - a0) * i) / n;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});
export const area2 = (p) => {
  let s = 0;
  for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; }
  return s / 2;
};
export const ccw = (p) => (area2(p) < 0 ? p.slice().reverse() : p);
/** Rectangle à coins arrondis (rayon r, n segments par coin), sens trigonométrique. */
export function rrect(w, h, r, n = 4, cx = 0, cy = 0) {
  r = Math.min(r, w / 2, h / 2);
  if (r <= 0) return [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]];
  return [
    ...arcPts(cx + w / 2 - r, cy - h / 2 + r, r, -Math.PI / 2, 0, n),
    ...arcPts(cx + w / 2 - r, cy + h / 2 - r, r, 0, Math.PI / 2, n),
    ...arcPts(cx - w / 2 + r, cy + h / 2 - r, r, Math.PI / 2, Math.PI, n),
    ...arcPts(cx - w / 2 + r, cy - h / 2 + r, r, Math.PI, Math.PI * 1.5, n),
  ];
}
/** Cercle (polygone de n côtés), sens trigonométrique. */
export const circ = (cx, cy, r, n = 24) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * 2 * Math.PI), cy + r * Math.sin((i / n) * 2 * Math.PI)]);

/** Contour fermé décalé de d vers l'intérieur (onglets aux sommets, bornés). */
export function inset(pts, d) {
  const n = pts.length;
  const s = Math.sign(area2(pts)) * d;
  return pts.map((p, i) => {
    const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    const l1 = Math.hypot(p[0] - a[0], p[1] - a[1]) || 1, l2 = Math.hypot(b[0] - p[0], b[1] - p[1]) || 1;
    const n1 = [-(p[1] - a[1]) / l1, (p[0] - a[0]) / l1], n2 = [-(b[1] - p[1]) / l2, (b[0] - p[0]) / l2];
    const mx = n1[0] + n2[0], my = n1[1] + n2[1], ml = Math.hypot(mx, my) || 1;
    const c = Math.max(0.25, (mx * n1[0] + my * n1[1]) / ml);
    return [p[0] + ((mx / ml) * s) / c, p[1] + ((my / ml) * s) / c];
  });
}

/**
 * Découpe en « Ω » d'une tôle (porte gauche) : cercle (cx, cy, r) qui débouche
 * sur le bord y = 0 par deux congés convexes de rayon rf, tangents au bord en
 * cx ± b. d : décalage vers la matière (mousse posée en retrait). Points du
 * pied gauche au pied droit en passant par le haut (sens d'un contour
 * trigonométrique qui longe le bord inférieur vers +x).
 */
export function omega(cx, cy, r, b, d = 0, n = 28) {
  const rf = (b * b + cy * cy - r * r) / (2 * (cy + r)); // congé tangent au bord et au cercle
  const a1 = Math.atan2(cy - rf, b); // direction congé gauche → centre
  const out = [];
  out.push(...arcPts(cx - b, rf, rf - d, -Math.PI / 2, a1, 8));
  out.push(...arcPts(cx, cy, r + d, Math.PI + a1, -a1, n).slice(1, -1));
  out.push(...arcPts(cx + b, rf, rf - d, Math.PI - a1, Math.PI * 1.5, 8));
  return out;
}

/**
 * Trous oblongs en quinconce (grille « brique » des portes) dans le rectangle
 * [x0, x0 + w] × [y0, y0 + h] : rangées de trous sw × sh au pas px × py,
 * rangées paires décalées d'un demi-pas avec demi-trous aux extrémités.
 */
export function bricks(x0, y0, w, h, { sw = 0.085, sh = 0.028, px = 0.091, py = 0.0425, r = 0.009, n = 3 } = {}) {
  const holes = [];
  const rows = Math.floor((h - sh) / py) + 1;
  const cols = Math.floor((w - sw) / px) + 1;
  const ox = x0 + (w - ((cols - 1) * px + sw)) / 2;
  for (let j = 0; j < rows; j++) {
    const y = y0 + sh / 2 + j * py;
    if (j % 2 === 0) {
      for (let i = 0; i < cols; i++) holes.push(rrect(sw, sh, r, n, ox + sw / 2 + i * px, y));
    } else {
      const hw = (sw - (px - sw)) / 2; // demi-trou : la moitié d'un trou moins le demi-entre-deux
      holes.push(rrect(hw, sh, r, n, ox + hw / 2, y));
      for (let i = 0; i < cols - 1; i++) holes.push(rrect(sw, sh, r, n, ox + sw / 2 + px / 2 + i * px, y));
      holes.push(rrect(hw, sh, r, n, ox + (cols - 1) * px + sw - hw / 2, y));
    }
  }
  return holes;
}

// ------------------------------------------------------------------ géométries de tôle
/**
 * Tôle plane : contour extérieur et contours intérieurs (ouvertures) dans le
 * plan XY, extrudée selon +Z de z0 à z0 + t ; arêtes cassées (bevel) sauf
 * bevel: false (tôle raccordée à des plis).
 */
export function sheetGeo(THREE, out, holes = [], t = CAN.t, { z0 = 0, bevel = true, curve = 12 } = {}) {
  const v = (p) => p.map(([x, y]) => new THREE.Vector2(x, y));
  const sh = new THREE.Shape(v(ccw(out)));
  holes.forEach((h) => sh.holes.push(new THREE.Path(v(ccw(h).slice().reverse()))));
  const mb = bevel ? Math.min(t * 0.25, 0.0007) : 0;
  const geo = new THREE.ExtrudeGeometry(sh, mb
    ? { depth: t - 2 * mb, bevelEnabled: true, bevelSize: mb, bevelThickness: mb, bevelOffset: -mb, bevelSegments: 1, curveSegments: curve }
    : { depth: t, bevelEnabled: false, curveSegments: curve });
  geo.translate(0, 0, z0 + mb);
  return geo;
}

/**
 * Balayage d'un profil fermé [[a, z], …] le long des sommets i0 … i1 d'un
 * contour plan pts (a : décalage dans le plan vers la gauche du parcours —
 * l'intérieur d'un contour trigonométrique —, z : profondeur). loop : contour
 * fermé (onglets calculés avec les voisins, indices modulo) ; closed : le
 * balayage fait tout le tour (sans fonds). Fonds plats aux extrémités sinon.
 */
export function sweepGeo(THREE, pts, profile, { i0 = 0, i1 = pts.length - 1, loop = false, closed = false } = {}) {
  const n = pts.length;
  const idx = [];
  if (closed) for (let i = 0; i < n; i++) idx.push(i);
  else for (let i = i0; ; i = (i + 1) % n) { idx.push(i); if (i === i1 % n) break; if (idx.length > n) break; }
  const nrm = (i) => {
    const p = pts[i];
    const hasA = loop || closed || i > 0, hasB = loop || closed || i < n - 1;
    const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    let n1 = null, n2 = null;
    if (hasA) { const l = Math.hypot(p[0] - a[0], p[1] - a[1]) || 1; n1 = [-(p[1] - a[1]) / l, (p[0] - a[0]) / l]; }
    if (hasB) { const l = Math.hypot(b[0] - p[0], b[1] - p[1]) || 1; n2 = [-(b[1] - p[1]) / l, (b[0] - p[0]) / l]; }
    if (!n1) return n2;
    if (!n2) return n1;
    const mx = n1[0] + n2[0], my = n1[1] + n2[1], ml = Math.hypot(mx, my) || 1;
    const c = Math.max(0.25, (mx * n1[0] + my * n1[1]) / ml);
    return [mx / ml / c, my / ml / c];
  };
  // Profil remis dans le sens trigonométrique du plan (a, z) : avec un parcours
  // de tangente T et de normale gauche N (T × N = +z), la face R0[j] → R1[j2] →
  // R1[j] a alors sa normale vers l'extérieur du profil.
  const prof = area2(profile) < 0 ? profile.slice().reverse() : profile;
  const m = prof.length, rings = idx.map((i) => { const p = pts[i], q = nrm(i); return prof.map(([a, z]) => [p[0] + q[0] * a, p[1] + q[1] * a, z]); });
  const pos = [];
  const tri = (A, B, C) => pos.push(...A, ...B, ...C);
  const K = rings.length;
  const segs = closed ? K : K - 1;
  for (let k = 0; k < segs; k++) {
    const R0 = rings[k], R1 = rings[(k + 1) % K];
    for (let j = 0; j < m; j++) {
      const j2 = (j + 1) % m;
      tri(R0[j], R1[j2], R1[j]);
      tri(R0[j], R0[j2], R1[j2]);
    }
  }
  if (!closed) {
    const faces = THREE.ShapeUtils.triangulateShape(prof.map(([a, z]) => new THREE.Vector2(a, z)), []);
    for (let [a, b, c] of faces) {
      const A = prof[a], B = prof[b], C = prof[c];
      if ((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]) < 0) [b, c] = [c, b];
      // (a, b, c) trigonométrique dans (a, z) : normale +T. Fond de départ vers -T.
      tri(rings[0][a], rings[0][c], rings[0][b]);
      tri(rings[K - 1][a], rings[K - 1][b], rings[K - 1][c]);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return geo;
}

/** Retourne l'ordre des sommets de chaque triangle (géométrie non indexée). */
export function flipGeo(geo) {
  if (geo.index) {
    const a = geo.index.array;
    for (let i = 0; i < a.length; i += 3) { const t = a[i + 1]; a[i + 1] = a[i + 2]; a[i + 2] = t; }
    return geo;
  }
  const p = geo.attributes.position.array;
  for (let i = 0; i < p.length; i += 9) for (let k = 0; k < 3; k++) { const t = p[i + 3 + k]; p[i + 3 + k] = p[i + 6 + k]; p[i + 6 + k] = t; }
  return geo;
}

/** Applique une matrice (THREE.Matrix4) à une géométrie ; faces retournées si la matrice est un miroir. */
export function xform(geo, m) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  g.applyMatrix4(m);
  if (m.determinant() < 0) flipGeo(g);
  return g;
}

/** Maillage d'un matériau à partir de géométries brutes (normales lissées sous l'angle crease). */
export function meshOf(api, geos, mat, crease = 0.5) {
  const { THREE, S } = api;
  return S.merged(geos.map((g) => new THREE.Mesh(S.creaseNormals(g.index ? g.toNonIndexed() : g, crease))), mat);
}

/**
 * Profil d'un bord tombé (pour sweepGeo) : pli de rayon extérieur ro depuis
 * la tôle (z de 0 à t, tôle arrêtée à a = ro), retour de profondeur D (z)
 * et, s'il y a lieu, rebord de largeur lip (a) au bout du retour, replié vers
 * l'intérieur ; nb segments par pli.
 */
export function flangeProfile(t, ro, D, { lip = 0, nb = 3 } = {}) {
  const ri = ro - t, p = [];
  for (let k = 0; k <= nb; k++) { const a = -Math.PI / 2 - (Math.PI / 2) * (k / nb); p.push([ro + ro * Math.cos(a), ro + ro * Math.sin(a)]); }
  if (lip > 0) {
    p.push([0, D - ro]);
    for (let k = 1; k <= nb; k++) { const a = Math.PI + (Math.PI / 2) * (k / nb); p.push([ro + ro * Math.cos(a), D - ro - ro * Math.sin(a)]); }
    p.push([lip, D], [lip, D - t], [ro, D - t]);
    for (let k = 1; k < nb; k++) { const a = Math.PI * 1.5 - (Math.PI / 2) * (k / nb); p.push([ro + ri * Math.cos(a), D - ro + ri * Math.sin(a) * -1]); }
    p.push([t, D - ro]);
  } else {
    p.push([0, D], [t, D]);
  }
  p.push([t, ro]);
  for (let k = 1; k < nb; k++) { const a = Math.PI + (Math.PI / 2) * (k / nb); p.push([ro + ri * Math.cos(a), ro + ri * Math.sin(a)]); }
  p.push([ro, t]);
  return p;
}

/** Profil en U (profilé plié, ouverture vers +z) : largeur w (a), ailes h (z), épaisseur t, centré sur a = 0. */
export const channelProfile = (w, h, t) => [[-w / 2, 0], [w / 2, 0], [w / 2, h], [w / 2 - t, h], [w / 2 - t, t], [-w / 2 + t, t], [-w / 2 + t, h], [-w / 2, h]];
/** Profil oméga (raidisseur chapeau) : semelles de largeur f, âme w × h, épaisseur t, centré sur a = 0. */
export const hatProfile = (w, h, f, t) => [
  [-w / 2 - f, 0], [-w / 2, 0], [-w / 2, h - t], [w / 2, h - t], [w / 2, 0], [w / 2 + f, 0],
  [w / 2 + f, t], [w / 2 + t, t], [w / 2 + t, h], [-w / 2 - t, h], [-w / 2 - t, t], [-w / 2 - f, t],
];

// ------------------------------------------------------------------ orientation
/** Place obj en pos, son axe local +Y selon y et son axe local +X selon x (vecteurs perpendiculaires). */
export function orient(THREE, obj, pos, y, x) {
  const Y = new THREE.Vector3(...y).normalize(), X = new THREE.Vector3(...x).normalize();
  const Z = new THREE.Vector3().crossVectors(X, Y);
  const g = new THREE.Group();
  g.add(obj);
  g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
  g.position.set(...pos);
  return g;
}

// ------------------------------------------------------------------ quincaillerie
/** Vis à tête bombée à six-pans creux (BHCS) d × len (po), dessous de tête à y = 0, tige vers -Y. */
export function bhcs(S, d, len, mat = 'zinc') {
  const r = I(d) / 2, R = I(d) * 0.95, H = I(d) * 0.55, hx = I(d) * 0.32;
  return S.merged([
    S.lathe([[0, -I(len)], [r * 0.8, -I(len)], [r, -I(len) + r * 0.3], [r, 0], [R, 0], [R * 0.96, H * 0.35], [R * 0.75, H * 0.8], [hx * 1.25, H], [hx, H], [hx, H * 0.45], [0, H * 0.35]], mat, { seg: 16 }),
  ], mat);
}
/** Vis à tête bombée carrée sous tête (boulon de carrosserie) d × len (po), dessous de tête à y = 0. */
export function carriage(S, d, len, mat = 'zinc') {
  const r = I(d) / 2, R = I(d) * 1.1, H = I(d) * 0.5;
  const g = [S.lathe([[0, -I(len)], [r * 0.8, -I(len)], [r, -I(len) + r * 0.3], [r, 0], [R, 0], [R * 0.95, H * 0.4], [R * 0.7, H * 0.85], [0, H]], mat, { seg: 16 })];
  return S.merged(g, mat);
}
/** Rivet pop (tête plate Ø 2 d) vu de la tête, tête à y = 0 … 0.3 d, corps vers -Y. */
export function rivet(S, d, len, mat = 'zinc') {
  const r = I(d) / 2;
  return S.lathe([[0, -I(len)], [r, -I(len)], [r, 0], [r * 2, 0], [r * 1.9, r * 0.45], [r * 1.2, r * 0.7], [r * 0.45, r * 0.7], [r * 0.45, r * 0.2], [0, r * 0.2]], mat, { seg: 12 });
}

/**
 * Ressort à gaz entre deux points : corps noir côté a (bas, « tige en bas »
 * inversé possible), tige chromée, embouts à œil zingués. a, b : points
 * d'articulation (m) ; bodyL : longueur du corps ; rB / rR : rayons du corps
 * et de la tige ; ends : 'eye' (œillets) ou 'ball' (rotules à rotule de 10 mm).
 * rodDown : tige vers a.
 */
export function gasSpring(api, a, b, { bodyL, rB = 0.011, rR = 0.004, ends = 'eye', rodDown = true } = {}) {
  const { THREE, S } = api;
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const len = A.distanceTo(B);
  const e = ends === 'ball' ? 0.03 : 0.022; // embout : de l'axe d'articulation au bout du corps / de la tige
  const L = len - 2 * e;
  const bl = Math.min(bodyL ?? L * 0.6, L - 0.02);
  // Construit le long de +Y de 0 (point bas) à len (point haut) ; tige en bas si rodDown.
  const y0 = rodDown ? len - e - bl : e, y1 = y0 + bl;
  const body = S.lathe([
    [0, y0], [rB * 0.55, y0], [rB * 0.92, y0 + 0.002], [rB, y0 + 0.006], [rB, y1 - 0.006], [rB * 0.92, y1 - 0.002], [rB * 0.5, y1], [0, y1],
  ], 'black', { seg: 18 });
  const rodA = rodDown ? e : y1, rodB = rodDown ? y0 : len - e;
  const rod = S.lathe([[0, rodA], [rR, rodA], [rR, rodB], [0, rodB]], 'chrome', { seg: 12 });
  const seal = S.ring(rB * 0.7, rR * 1.1, 0.004, 'black', { seg: 16, pos: [0, rodDown ? y0 - 0.002 : y1 + 0.002, 0] });
  // Embouts : œillet (anneau d'axe Z et col) ou rotule (bille sur goujon et cuvette).
  const end = (y, dir) => (ends === 'ball'
    ? S.merged([
      S.at(S.ball(0.0065, 'zinc'), [0, y, 0]),
      S.at(S.cyl(0.0075, 0.013, 'zinc', { seg: 14 }), [0, y + dir * 0.013, 0]),
      S.at(S.cyl(0.0042, 0.012, 'zinc', { seg: 10 }), [0, y + dir * 0.022, 0]),
    ], 'zinc')
    : S.merged([
      S.at(S.ring(0.009, 0.0045, 0.008, 'zinc', { axis: 'z', seg: 18 }), [0, y, 0]),
      S.at(S.cyl(0.005, 0.014, 'zinc', { seg: 12 }), [0, y + dir * 0.015, 0]),
    ], 'zinc'));
  const g = S.group(body, rod, seal, end(0, 1), end(len, -1));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  const o = new THREE.Group();
  o.add(g);
  o.quaternion.copy(q);
  o.position.copy(A);
  return o;
}

/**
 * Charnière de porte CX007248 (P424, P426, P428 rep. 2) : deux ailes en tôle
 * 3/16 po (0.075 × 0.03) de part et d'autre d'un nœud Ø 16 mm en trois
 * charnons, axe en acier à tête et goupille ; quatre vis H 1/4 po par aile
 * avec écrous à freinage côté opposé. Repère : axe du nœud selon Y, origine
 * au milieu de sa hauteur ; ailes dans le plan x ∈ [-0.008, -0.0032]
 * (appliquées contre une face d'appui x = -0.008, nœud devant), aile A vers
 * +Z (bâti), aile B vers -Z (porte) — inversées si sz = -1 ; dA / dB décalent
 * les ailes en x (faces d'appui en retrait ou en saillie).
 */
export function hinge(api, { dA = 0, dB = 0, h = 0.076, wA = 0.042, wB = 0.026, nutsA = true, nutsB = true, sz = 1 } = {}) {
  const { S } = api;
  const r = 0.008, tl = I(3 / 16), x0 = -r;
  const leafA = S.box(tl, h, wA, 'zinc', { r: 0.0015, pos: [x0 + tl / 2 + dA, 0, sz * (r * 0.6 + wA / 2)] });
  const leafB = S.box(tl, h * 0.94, wB, 'zinc', { r: 0.0015, pos: [x0 + tl / 2 + dB, 0, -sz * (r * 0.6 + wB / 2)] });
  const k = h / 3;
  const knuckles = [-1, 0, 1].map((i) => S.lathe([[0, -k / 2 + 0.0006], [r - 0.0008, -k / 2 + 0.0006], [r, -k / 2 + 0.0014], [r, k / 2 - 0.0014], [r - 0.0008, k / 2 - 0.0006], [0, k / 2 - 0.0006]], 'zinc', { seg: 20, pos: [0, i * k, 0] }));
  const pin = S.lathe([[0, -h / 2 - 0.004], [0.0028, -h / 2 - 0.004], [0.0028, h / 2], [0.0055, h / 2], [0.0055, h / 2 + 0.003], [0.0045, h / 2 + 0.0038], [0, h / 2 + 0.0038]], 'steel', { seg: 14 });
  const parts = [leafA, leafB, ...knuckles];
  // Vis à tête bombée 1/4 po (tête sur l'aile, côté +X) et écrous derrière la face d'appui.
  const fast = [];
  for (const [w, zc, dx, nuts] of [[wA, sz * (r * 0.6 + wA / 2), dA, nutsA], [wB, -sz * (r * 0.6 + wB / 2), dB, nutsB]]) {
    const zs = w > 0.03 ? [zc - w * 0.22, zc + w * 0.22] : [zc];
    for (const y of [-h * 0.3, h * 0.3]) {
      for (const zz of zs) {
        fast.push(S.at(S.group(bhcs(S, 0.25, 0.75)), [x0 + tl + dx, y, zz], [0, 0, -Math.PI / 2]));
        if (nuts) fast.push(S.at(S.nut(I(7 / 16), I(0.22), 'zinc', { axis: 'x' }), [x0 + dx - 0.006 - I(0.11), y, zz]));
      }
    }
  }
  return S.group(S.merged(parts, 'zinc'), pin, S.merged(fast, 'zinc'));
}

/**
 * Serrure rotative à pêne fourchu (« ROTARY LATCH ») CP001104 / CP001105 :
 * boîtier en deux flasques d'acier zingué 3,4 × 2,1 po rivetés sur entretoises,
 * fente en U ouverte vers +Y, rotor fourchu (noir) visible dans la fente,
 * levier de déclenchement sortant à droite (RH, hand = 1) ou à gauche (LH,
 * hand = -1), deux vis de fixation. Repère : plan du boîtier = plan XY,
 * appliqué contre la face z = 0 (boîtier vers +Z), fente centrée sur x = 0,
 * fond de fente (axe de la gâche) à y = 0.
 */
export function rotaryLatch(api, hand = 1) {
  const { THREE, S } = api;
  const W = I(2.1), H = I(3.4), tp = I(0.075), gap = I(0.32), sw = I(0.42);
  const outline = [[-W / 2, -H + I(0.6)], [W / 2, -H + I(0.6)], [W / 2, I(0.55)], [sw / 2, I(0.55)], ...arcPts(0, 0, sw / 2, 0, -Math.PI, 8).slice(1, -1), [-sw / 2, I(0.55)], [-W / 2, I(0.55)]];
  const holes = [circ(-W * 0.3, -H + I(1.0), I(0.13), 12), circ(W * 0.3, -H + I(1.0), I(0.13), 12)];
  const plate = (z0) => sheetGeo(THREE, outline, holes, tp, { z0 });
  const zinc = meshOf(api, [plate(0), plate(tp + gap)], 'zinc');
  // Entretoises rivetées (trois) et rivets.
  const spacers = [[-W * 0.36, -H * 0.55], [W * 0.36, -H * 0.55], [hand * W * 0.36, I(0.2)]].map(([x, y]) => S.at(S.cyl(I(0.12), gap + 2 * tp + 0.002, 'steel', { axis: 'z', seg: 12 }), [x, y, (gap + 2 * tp) / 2]));
  // Rotor fourchu dans la fente (fourche ouverte vers le haut : position ouverte).
  const rotOut = [...arcPts(0, -I(0.55), I(0.62), -Math.PI * 0.15, Math.PI * 1.15, 14)];
  const rotor = S.extrude([...rotOut, [-I(0.16), -I(0.05)], [I(0.16), -I(0.05)]], gap * 0.8, 'blackOxide');
  rotor.position.set(0, 0, tp + gap / 2);
  // Levier de déclenchement.
  const lever = S.box(I(1.1), I(0.28), I(0.09), 'zinc', { r: 0.0008, pos: [hand * (W / 2 + I(0.35)), -H * 0.45, tp + gap + tp + I(0.05)] });
  const tab = S.box(I(0.09), I(0.28), I(0.5), 'zinc', { pos: [hand * (W / 2 + I(0.85)), -H * 0.45, tp + gap + tp + I(0.25)] });
  const screws = [-1, 1].map((sx) => S.at(S.group(bhcs(S, 0.25, 0.625)), [sx * W * 0.3, -H + I(1.0), 2 * tp + gap], [Math.PI / 2, 0, 0]));
  return S.group(zinc, S.merged([...spacers, lever, tab], 'zinc'), rotor, S.merged(screws, 'zinc'));
}

/**
 * Poignée à palette encastrée (« DOOR PADDLE HANDLE » CP001102) : collerette
 * inox 4,6 × 3,4 po, cuvette emboutie de 1 po de profondeur, palette inox
 * articulée en haut, boîtier arrière et levier d'actionnement. Repère :
 * collerette sur la face extérieure z = 0 (vers +Z), cuvette vers -Z ; X le
 * long de la porte, Y vers le haut ; levier à l'arrière (z ≈ -0.03), vers +X.
 */
export function paddleHandle(api) {
  const { THREE, S } = api;
  const W = I(4.6), H = I(3.4), d = I(1.05);
  const rim = sheetGeo(THREE, rrect(W, H, I(0.4), 5), [rrect(W - I(0.7), H - I(0.7), I(0.25), 5)], I(0.06));
  // Cuvette : parois (balayage d'un profil fin le long du contour) et fond.
  const cup = rrect(W - I(0.7), H - I(0.7), I(0.25), 5);
  const wall = sweepGeo(THREE, cup, [[0, 0], [I(0.04), 0], [I(0.04), -d], [0, -d]], { closed: true, loop: true });
  const bottom = sheetGeo(THREE, cup, [], I(0.04), { z0: -d });
  const steel = meshOf(api, [rim, wall, bottom], 'steel');
  // Palette : plaque bombée articulée en haut (axe X), légèrement inclinée.
  const pad = S.box(W - I(1.3), H - I(1.35), I(0.09), 'steel', { r: I(0.15) });
  const padG = S.group(S.at(pad, [0, -(H - I(1.35)) / 2, 0]), S.at(S.cyl(I(0.09), W - I(1.2), 'steel', { axis: 'x', seg: 12 }), [0, 0, 0]));
  padG.position.set(0, H / 2 - I(0.55), -I(0.18));
  padG.rotation.x = 0.08;
  // Boîtier arrière et levier.
  const box = S.box(I(1.6), I(1.2), I(0.6), 'zinc', { r: I(0.06), pos: [I(0.4), I(0.3), -d - I(0.3)] });
  const lever = S.box(I(1.4), I(0.35), I(0.1), 'zinc', { r: I(0.03), pos: [I(1.5), I(0.3), -d - I(0.5)] });
  const studs = [[-W / 2 + I(0.35), H / 2 - I(0.35)], [W / 2 - I(0.35), -H / 2 + I(0.35)]].map(([x, y]) => S.at(S.group(S.stud(I(0.19), I(0.9), 'zinc', { axis: '-z' })), [x, y, -I(0.1)]));
  return S.group(steel, padG, S.merged([box, lever], 'zinc'), ...studs);
}

/**
 * Gâche (P422 rep. 3 + 12) : plaque 2 1/2 × 2 × 3/16 po à deux boutonnières
 * (vis H 5/16 po à rondelle) et goupille sans tête Ø 1/2 × 1 1/4 po emmanchée
 * au centre. Repère : plaque dans le plan XY appliquée sur z = 0, côté +Z ;
 * goupille selon +Z. Rend { plate, pin }.
 */
export function striker(api, { pinLen = 1.25 } = {}) {
  const { THREE, S } = api;
  const w = I(2.5), h = I(2), t = I(3 / 16);
  const slot = (x) => rrect(I(0.36), I(0.7), I(0.17), 4, x, 0);
  const plate = meshOf(api, [sheetGeo(THREE, rrect(w, h, I(0.2), 3), [slot(-I(0.8)), slot(I(0.8))], t)], 'zinc');
  const bolts = [-1, 1].map((s) => S.at(S.group(S.bolt(I(5 / 16), I(0.75), 'zinc', { washer: true })), [s * I(0.8), I(0.1), t], [Math.PI / 2, 0, 0]));
  const plateG = S.group(plate, S.merged(bolts, 'zinc'));
  const r = I(0.25), L = I(pinLen);
  const pin = S.lathe([[0, 0], [r, 0], [r, L - r * 0.25], [r * 0.75, L], [0, L]], 'steel', { seg: 18 });
  pin.rotation.x = Math.PI / 2;
  pin.position.z = 0;
  return { plate: plateG, pin: S.group(pin) };
}

/**
 * Panneau de mousse acoustique (« ACOUSTICAL FOAM PANEL ») : mousse de 1 po
 * à pellicule de mylar argenté (alu brut 'castAlu'), contour et ouvertures
 * dans le plan XY, de z = z0 à z0 + tf. Rend la géométrie brute.
 */
export function foamGeo(THREE, out, holes = [], z0 = 0, tf = I(1)) {
  return sheetGeo(THREE, out, holes, tf, { z0, bevel: false, curve: 10 });
}
/**
 * Ruban de mylar de 2 po (« 2" WIDE SILVER MYLAR TAPE ») autour d'un panneau
 * de mousse : bande pliée sur le chant, 1 po sur la face et 1 po sur la tôle
 * (géométrie brute, contour du panneau, mousse de z0 à z0 + tf).
 */
export function tapeGeo(THREE, out, z0 = 0, tf = I(1), { hole = false } = {}) {
  const e = 0.0004, b = I(1);
  return sweepGeo(THREE, hole ? ccw(out).slice().reverse() : ccw(out), [[-b, z0], [-b, z0 + e], [-e, z0 + e], [-e, z0 + tf + e], [b, z0 + tf + e], [b, z0 + tf], [0, z0 + tf], [0, z0 + e * 0.5]], { closed: true, loop: true });
}

// ------------------------------------------------------------------ repères des portes
/**
 * Porte latérale (P424 : s = -1, gauche ; P428 : s = +1, droite). Tôlerie
 * décrite en (u, v, w) : u le long de la porte depuis son chant avant (côté
 * charnières) vers l'arrière, v vers le haut depuis le bas de la porte, w
 * profondeur vers l'intérieur du capot depuis la face extérieure de la peau.
 * Repère de l'assemblage : origine sur l'axe des charnières (x = CAN.hx,
 * z = s·CAN.hz) au niveau du bas de la porte (y = CAN.yb), axes parallèles au
 * repère machine. Rend la matrice (u, v, w) → repère, la fonction de point P
 * et les directions D.u, D.v, D.w (vecteurs du repère).
 */
export function doorFrame(THREE, s) {
  const x0 = CAN.xf - CAN.hx, z0 = s * (CAN.zo - CAN.hz);
  const m = new THREE.Matrix4().set(-1, 0, 0, x0, 0, 1, 0, 0, 0, 0, -s, z0, 0, 0, 0, 1);
  return { m, P: (u, v, w) => [x0 - u, v, z0 - s * w], D: { u: [-1, 0, 0], v: [0, 1, 0], w: [0, 0, -s] } };
}
/**
 * Porte du dessus (P426) : (u, v, w) avec u le long de la pente depuis le
 * chant avant (charnières) vers l'arrière, v = z machine, w vers le bas depuis
 * le dessus de la peau. Repère de l'assemblage : origine sur l'axe des
 * charnières (x = CAN.hx, y = CAN.hy, z = 0), axes parallèles au repère
 * machine porte posée à plat ; P422 l'incline de CAN.slope autour de Z.
 */
export function topFrame(THREE) {
  const x0 = CAN.xf - CAN.hx, y0 = CAN.yf - CAN.hy;
  const m = new THREE.Matrix4().set(-1, 0, 0, x0, 0, 0, -1, y0, 0, 1, 0, 0, 0, 0, 0, 1);
  return { m, P: (u, v, w) => [x0 - u, y0 - w, v], D: { u: [-1, 0, 0], v: [0, 0, 1], w: [0, -1, 0] } };
}
/** Point machine d'un point (u, v, w) de la porte du dessus posée sur le capot (P422). */
export function topToMachine(u, v, w) {
  const x = CAN.xf - CAN.hx - u, y = CAN.yf - CAN.hy - w, c = Math.cos(CAN.slope), sn = Math.sin(CAN.slope);
  return [CAN.hx + x * c - y * sn, CAN.hy + x * sn + y * c, v];
}
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const neg = (a) => a.map((v) => -v);
/** Matrice d'un repère de tôle secondaire (aile, patte) : (x, y, z) local → (u, v, w) = o + x·ex + y·ey + z·ez. */
export function basis(THREE, o, ex, ey, ez) {
  return new THREE.Matrix4().set(ex[0], ey[0], ez[0], o[0], ex[1], ey[1], ez[1], o[1], ex[2], ey[2], ez[2], o[2], 0, 0, 0, 1);
}

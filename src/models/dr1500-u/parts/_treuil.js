// Assistants du lot C (treuil Hoist XW-2100 P014 et vis d'enroulement 206-419 P016).
// Unités : mètres ; les cotes du manuel sont en pouces (IN de layout.js).
import { IN } from '../layout.js';

/** Point en pouces → mètres. */
export const p3 = (x, y, z) => [x * IN, y * IN, z * IN];

/**
 * Tangente commune d'un brin qui va du cercle A au cercle B (plan XY) ;
 * sa, sb : sens d'enroulement sur chaque cercle (+1 trigonométrique, −1 horaire).
 * Renvoie les points de tangence p (sur A) et q (sur B). (Même méthode que le treuil du STM-1500.)
 */
export function tangente(A, ra, sa, B, rb, sb) {
  const dx = B[0] - A[0], dy = B[1] - A[1], D = Math.hypot(dx, dy);
  const g = Math.atan2(dy, dx) - Math.asin((sb * rb - sa * ra) / D);
  const L = [-Math.sin(g), Math.cos(g)];
  return { p: [A[0] - sa * ra * L[0], A[1] - sa * ra * L[1]], q: [B[0] - sb * rb * L[0], B[1] - sb * rb * L[1]] };
}

/** Arc du cercle (c, r) de p0 à p1 dans le sens s (+1 trigo, −1 horaire), pas d'environ step. */
export function arcPts(c, r, p0, p1, s, step = 0.005) {
  const a0 = Math.atan2(p0[1] - c[1], p0[0] - c[0]);
  let a1 = Math.atan2(p1[1] - c[1], p1[0] - c[0]);
  if (s > 0) { while (a1 < a0) a1 += 2 * Math.PI; } else { while (a1 > a0) a1 -= 2 * Math.PI; }
  const n = Math.max(2, Math.ceil((Math.abs(a1 - a0) * r) / step));
  const out = [];
  for (let k = 0; k <= n; k++) { const a = a0 + ((a1 - a0) * k) / n; out.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); }
  return out;
}

/**
 * Boucle fermée d'une chaîne sur une suite de pignons [{ c, r, s }] (rayons primitifs, s : sens
 * d'enroulement, +1 pour les pignons pris par l'intérieur de la boucle, −1 pour un tendeur poussant
 * de l'extérieur). Renvoie la polyligne fermée (dense) et sa longueur.
 */
export function chainPath(wheels) {
  const n = wheels.length;
  const t = wheels.map((w, i) => { const v = wheels[(i + 1) % n]; return tangente(w.c, w.r, w.s, v.c, v.r, v.s); });
  const pts = [];
  for (let i = 0; i < n; i++) {
    const w = wheels[i];
    const inQ = t[(i - 1 + n) % n].q, outP = t[i].p;
    pts.push(...arcPts(w.c, w.r, inQ, outP, w.s, 0.002).slice(0, -1));
    pts.push(outP);
  }
  let len = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; len += Math.hypot(b[0] - a[0], b[1] - a[1]); }
  return { pts, len };
}

/** Points espacés de pas égaux (abscisse curviligne) le long d'une polyligne fermée : n points. */
export function resample(pts, n, phase = 0) {
  const seg = [];
  let L = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push([a, b, L, l]); L += l; }
  const out = [];
  let k = 0;
  for (let i = 0; i < n; i++) {
    const s = ((phase + (i * L) / n) % L + L) % L;
    while (k < seg.length - 1 && seg[k][2] + seg[k][3] < s) k++;
    if (seg[k][2] > s) k = 0;
    while (k < seg.length - 1 && seg[k][2] + seg[k][3] < s) k++;
    const [a, b, s0, l] = seg[k];
    const u = l ? (s - s0) / l : 0;
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  return out;
}

/** Contour d'un cercle (polygone de n côtés). */
export const circle = (c, r, n = 32, a0 = 0) => Array.from({ length: n }, (_, k) => [c[0] + r * Math.cos(a0 + (k / n) * 2 * Math.PI), c[1] + r * Math.sin(a0 + (k / n) * 2 * Math.PI)]);

/** Arc de cercle (c, r) de l'angle a0 à a1 (degrés), n segments, extrémités comprises. */
export const arc = (c, r, a0, a1, n = 16) => Array.from({ length: n + 1 }, (_, k) => {
  const a = ((a0 + ((a1 - a0) * k) / n) * Math.PI) / 180;
  return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
});

/** Fente oblongue (polygone) de centre c, longueur totale L le long de l'angle ang (rad), largeur w. */
export function slot(c, L, w, ang = 0, n = 8) {
  const r = w / 2, h = L / 2 - r, ca = Math.cos(ang), sa = Math.sin(ang);
  const loc = [...arc([h, 0], r, -90, 90, n), ...arc([-h, 0], r, 90, 270, n)];
  return loc.map(([x, y]) => [c[0] + x * ca - y * sa, c[1] + x * sa + y * ca]);
}

/**
 * Perforations en quinconce (trous hexagonaux de rayon r, pas p) dans le rectangle [u0, u1] × [v0, v1]
 * d'une tôle : polygones de trous pour sheet(). Une tôle perforée en vrais trous, mais peu de facettes.
 */
export function perfs(u0, u1, v0, v1, r, p, keep = () => true) {
  const out = [];
  let row = 0;
  for (let v = v0 + r; v <= v1 - r + 1e-9; v += p * 0.866, row++) {
    for (let u = u0 + r + (row % 2) * (p / 2); u <= u1 - r + 1e-9; u += p) {
      if (!keep(u, v)) continue;
      out.push(Array.from({ length: 6 }, (_, k) => { const a = (k / 6) * Math.PI * 2 + Math.PI / 6; return [u + Math.cos(a) * r, v + Math.sin(a) * r]; }));
    }
  }
  return out;
}

/** Outils de modelage qui ont besoin de three.js (via api.THREE) et de la bibliothèque de formes. */
export function kit(api) {
  const S = api.S, T = api.THREE;
  const shapeOf = (outline, holes) => {
    const sh = new T.Shape(outline.map(([x, y]) => new T.Vector2(x, y)));
    for (const h of holes) {
      if (h.length === 3 && !Array.isArray(h[0])) {
        const p = new T.Path();
        p.absarc(h[0], h[1], h[2], 0, Math.PI * 2, true);
        sh.holes.push(p);
      } else sh.holes.push(new T.Path(h.map(([x, y]) => new T.Vector2(x, y))));
    }
    return sh;
  };
  const self = {
    /**
     * Tôle plane extrudée : contour et trous dans le plan XY local (trous ronds [x, y, r] ou polygones),
     * épaisseur t selon Z, centrée sur z.
     */
    sheet(outline, holes, t, mat, z = 0, seg = 16) {
      const geo = new T.ExtrudeGeometry(shapeOf(outline, holes), { depth: t, bevelEnabled: false, curveSegments: seg });
      geo.translate(0, 0, z - t / 2);
      return S.merged([new T.Mesh(geo)], mat);
    },
    /**
     * Pan de tôle plat de p à q (plan XY), de z0 à z1, épaisseur t (du côté gauche de p→q si side = +1),
     * trous dans le repère du pan (u le long de p→q depuis p, v = z).
     */
    panel(p, q, z0, z1, t, mat, holes = [], side = 1) {
      const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const geo = new T.ExtrudeGeometry(shapeOf([[0, z0], [L, z0], [L, z1], [0, z1]], holes), { depth: t, bevelEnabled: false, curveSegments: 8 });
      if (side < 0) geo.translate(0, 0, -t);
      const ex = new T.Vector3((q[0] - p[0]) / L, (q[1] - p[1]) / L, 0), ey = new T.Vector3(0, 0, 1);
      const ez = new T.Vector3().crossVectors(ex, ey);
      const m = new T.Matrix4().makeBasis(ex, ey, ez).setPosition(p[0], p[1], 0);
      geo.applyMatrix4(m);
      return S.merged([new T.Mesh(geo)], mat);
    },
    /** Géométrie brute (sans matériau) d'une tôle plane, pour des fusions. */
    sheetGeo(outline, holes, t, z = 0, seg = 12) {
      const geo = new T.ExtrudeGeometry(shapeOf(outline, holes), { depth: t, bevelEnabled: false, curveSegments: seg });
      geo.translate(0, 0, z - t / 2);
      return geo;
    },
  };
  return self;
}

/**
 * Vis à double filet croisé (vis d'enroulement) le long de Z, de z0 à z1 : rayon r, pas (avance) lead,
 * gorges demi-rondes de largeur w et de profondeur d (une hélice à droite et une à gauche ; elles se
 * croisent en losanges, le suiveur passe de l'une à l'autre aux bouts). Géométrie de révolution déformée.
 */
export function crossScrewGeo(T, r, z0, z1, lead, w, d, { nA = 36, dz = 0.0012 } = {}) {
  const nZ = Math.max(2, Math.ceil((z1 - z0) / dz));
  const pos = [], idx = [];
  const groove = (s) => { const x = Math.abs(s) / (w / 2); return x >= 1 ? 0 : d * Math.sqrt(1 - x * x); };
  const wrap = (u) => u - lead * Math.round(u / lead);
  for (let j = 0; j <= nZ; j++) {
    const z = z0 + ((z1 - z0) * j) / nZ;
    // Gorges amorties aux deux bouts (raccord sur le fût lisse).
    const fade = Math.min(1, (z - z0) / (w * 0.6), (z1 - z) / (w * 0.6));
    for (let i = 0; i <= nA; i++) {
      const a = (i / nA) * Math.PI * 2;
      const u = (a / (Math.PI * 2)) * lead;
      const g = Math.max(groove(wrap(z - u)), groove(wrap(z + u))) * Math.max(0, fade);
      const rr = r - g;
      pos.push(rr * Math.cos(a), rr * Math.sin(a), z);
    }
  }
  for (let j = 0; j < nZ; j++) {
    for (let i = 0; i < nA; i++) {
      const a = j * (nA + 1) + i, b = a + 1, c = a + nA + 1, e = c + 1;
      idx.push(a, b, e, a, e, c);
    }
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new T.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/** Enveloppe convexe (chaîne monotone, sens trigonométrique) d'une liste de points 2D. */
export function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

/** Polygone convexe (sens trigonométrique) décalé vers l'intérieur de d (intersection des côtés décalés). */
export function offsetConvex(poly, d) {
  const n = poly.length;
  const lines = poly.map((a, i) => {
    const b = poly[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L; // normale intérieure (à gauche)
    return [[a[0] + nx * d, a[1] + ny * d], [(b[0] - a[0]) / L, (b[1] - a[1]) / L]];
  });
  return lines.map((l1, i) => {
    const l0 = lines[(i - 1 + n) % n];
    const [p0, u0] = l0, [p1, u1] = l1;
    const den = u0[0] * u1[1] - u0[1] * u1[0];
    if (Math.abs(den) < 1e-9) return p1;
    const t = ((p1[0] - p0[0]) * u1[1] - (p1[1] - p0[1]) * u1[0]) / den;
    return [p0[0] + u0[0] * t, p0[1] + u0[1] * t];
  });
}

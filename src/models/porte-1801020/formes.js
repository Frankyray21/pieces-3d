// Formes de la porte 1801020 : profilés balayés le long d'un tracé plan, à coins d'onglet
// (tube carré du cadre et du battant) ou à coudes arrondis (rond de la poignée, anneaux).
import * as THREE from 'three';
import { creaseNormals } from '../../viewer/shapes.js';

/** Carré de côté c à coins de rayon r, en points [a, b] dans le sens trigonométrique. */
export function carreArrondi(c, r, n = 3) {
  const h = c / 2 - r, pts = [];
  [[h, h], [-h, h], [-h, -h], [h, -h]].forEach(([x, y], q) => {
    for (let i = 0; i <= n; i++) {
      const a = (q + i / n) * (Math.PI / 2);
      pts.push([x + r * Math.cos(a), y + r * Math.sin(a)]);
    }
  });
  return pts;
}

/** Cercle de rayon r à n côtés, sens trigonométrique. */
export function cercle(r, n = 10) {
  return Array.from({ length: n }, (_, i) => [r * Math.cos((i / n) * 2 * Math.PI), r * Math.sin((i / n) * 2 * Math.PI)]);
}

/** Aire d'un polygone régulier à n côtés rapportée à celle de son cercle circonscrit. */
export const tauxPolygone = (n) => (n / (2 * Math.PI)) * Math.sin((2 * Math.PI) / n);

/**
 * Balaie un profil fermé [a, b] le long d'un tracé contenu dans un plan de normale B.
 * L'axe a du profil est la normale au tracé dans son plan (B × tangente), l'axe b est B.
 * À chaque sommet, le profil est posé dans le plan bissecteur : coin d'onglet exact, volume
 * égal à la section fois la longueur du tracé. ferme : tracé bouclé (sinon bouts fermés à plat).
 */
export function balayer(points, profil, B, { ferme = false } = {}) {
  const n = points.length, m = profil.length;
  const nseg = ferme ? n : n - 1;
  const dirs = [];
  for (let i = 0; i < nseg; i++) dirs.push(points[(i + 1) % n].clone().sub(points[i]).normalize());
  const normale = (d) => new THREE.Vector3().crossVectors(B, d);
  const anneaux = points.map((p, i) => {
    const n0 = normale(ferme ? dirs[(i - 1 + nseg) % nseg] : dirs[Math.max(i - 1, 0)]);
    const n1 = normale(ferme ? dirs[i % nseg] : dirs[Math.min(i, nseg - 1)]);
    const mv = n0.clone().add(n1).multiplyScalar(1 / (1 + n0.dot(n1)));
    return profil.map(([a, b]) => p.clone().addScaledVector(mv, a).addScaledVector(B, b));
  });
  const pos = [];
  const tri = (a, b, c) => pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  for (let i = 0; i < nseg; i++) {
    const A = anneaux[i], C = anneaux[(i + 1) % n];
    for (let j = 0; j < m; j++) {
      const k = (j + 1) % m;
      tri(A[j], A[k], C[j]);
      tri(A[k], C[k], C[j]);
    }
  }
  if (!ferme) {
    const centre = (r) => r.reduce((s, v) => s.add(v), new THREE.Vector3()).multiplyScalar(1 / m);
    const A = anneaux[0], Z = anneaux[n - 1], ca = centre(A), cz = centre(Z);
    for (let j = 0; j < m; j++) {
      const k = (j + 1) % m;
      tri(ca, A[k], A[j]);
      tri(cz, Z[j], Z[k]);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return creaseNormals(geo, 0.6);
}

/** Tracé plan [u, v] : suite de sommets dont les coins sont remplacés par un arc de rayon r. */
export function arrondir(sommets, r, n = 6) {
  const out = [];
  sommets.forEach((p, i) => {
    if (i === 0 || i === sommets.length - 1) { out.push(p); return; }
    const a = sommets[i - 1], b = sommets[i + 1];
    const da = [a[0] - p[0], a[1] - p[1]], db = [b[0] - p[0], b[1] - p[1]];
    const la = Math.hypot(...da), lb = Math.hypot(...db);
    const ua = [da[0] / la, da[1] / la], ub = [db[0] / lb, db[1] / lb];
    // Coin droit : l'arc part à r du sommet sur chaque côté, centre sur la bissectrice.
    const c = [p[0] + r * (ua[0] + ub[0]), p[1] + r * (ua[1] + ub[1])];
    const a0 = Math.atan2(p[1] + r * ua[1] - c[1], p[0] + r * ua[0] - c[0]);
    let a1 = Math.atan2(p[1] + r * ub[1] - c[1], p[0] + r * ub[0] - c[0]);
    if (a1 - a0 > Math.PI) a1 -= 2 * Math.PI;
    if (a0 - a1 > Math.PI) a1 += 2 * Math.PI;
    for (let k = 0; k <= n; k++) {
      const t = a0 + ((a1 - a0) * k) / n;
      out.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]);
    }
  });
  return out;
}

/** Axe d'un anneau ovale (long × large hors tout, rond de diamètre d) en points [u, v]. */
export function ovale(long, large, d, n = 8) {
  const r = (large - d) / 2, s = (long - large) / 2, pts = [];
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i / n) * Math.PI; pts.push([s + r * Math.cos(a), r * Math.sin(a)]); }
  for (let i = 0; i < n; i++) { const a = Math.PI / 2 + (i / n) * Math.PI; pts.push([-s + r * Math.cos(a), r * Math.sin(a)]); }
  // Les demi-cercles s'arrêtent un cran avant leur fin : les deux droites ferment la boucle.
  pts.splice(n, 0, [s, r]);
  pts.push([-s, -r]);
  return pts;
}

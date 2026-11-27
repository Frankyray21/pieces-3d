// Géométries propres au lot de sécurité : bande plate balayée le long d'une
// courbe (sangles du harnais, ruban de barricade), tige cintrée (mousquetons,
// anses de cadenas), outils de pose.
import * as THREE from 'three';

export const IN = 0.0254;
export const RAD = Math.PI / 180;

/** Tableau de points [x, y, z] (ou Vector3) → Vector3. */
const v3 = (p) => (p.isVector3 ? p.clone() : new THREE.Vector3(...p));

/**
 * Bande plate (sangle, ruban) de largeur w et d'épaisseur e balayée le long de la
 * courbe passant par points. normale(p, t) donne la direction de l'épaisseur
 * (face extérieure) en chaque point ; la largeur est portée par tangente × normale.
 * U : longueur (en mètres / periode), V : travers de 0 à 1. Retourne un Mesh.
 */
export function bande(points, w, e, material, { normale, closed = false, seg = null, periode = null, tension = 0.5, curve = null } = {}) {
  const c = curve || new THREE.CatmullRomCurve3(points.map(v3), closed, 'catmullrom', tension);
  const L = c.getLength();
  const n = seg || Math.max(8, Math.ceil(L / 0.012));
  const per = periode || w * 2;
  const P = [], N = [], UV = [], I = [];
  const pts = c.getSpacedPoints(n);
  const frames = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = pts[i];
    const T = c.getTangentAt(Math.min(t, 1)).normalize();
    let nr = normale ? normale(p, t).clone() : new THREE.Vector3(0, 1, 0);
    nr.addScaledVector(T, -nr.dot(T));
    if (nr.lengthSq() < 1e-8) nr = frames.length ? frames[frames.length - 1].nr.clone() : new THREE.Vector3(1, 0, 0);
    nr.normalize();
    const b = new THREE.Vector3().crossVectors(T, nr).normalize();
    frames.push({ p, nr, b, s: (t * L) / per });
  }
  if (closed) frames[n] = { ...frames[0], s: L / per };
  // Quatre faces : dessus (+nr), dessous (-nr), deux chants (±b).
  const faces = [
    { o: [1, 0], d: [0, 1], nrm: [1, 0], v: [0, 1] },
    { o: [-1, 0], d: [0, -1], nrm: [-1, 0], v: [1, 0] },
    { o: [0, 1], d: [-1, 0], nrm: [0, 1], v: [0.98, 1] },
    { o: [0, -1], d: [1, 0], nrm: [0, -1], v: [0, 0.02] },
  ];
  for (const f of faces) {
    const base = P.length / 3;
    for (const fr of frames) {
      const nn = new THREE.Vector3().addScaledVector(fr.nr, f.nrm[0]).addScaledVector(fr.b, f.nrm[1]);
      for (const k of [-1, 1]) {
        // Coin : centre de la face + demi-étendue le long de la face.
        const off = new THREE.Vector3()
          .addScaledVector(fr.nr, (f.o[0] * e) / 2 + (f.d[0] * k * e) / 2)
          .addScaledVector(fr.b, (f.o[1] * w) / 2 + (f.d[1] * k * w) / 2);
        const q = fr.p.clone().add(off);
        P.push(q.x, q.y, q.z);
        N.push(nn.x, nn.y, nn.z);
        UV.push(fr.s, k < 0 ? 1 - f.v[0] : 1 - f.v[1]);
      }
    }
    for (let i = 0; i < n; i++) {
      const a = base + i * 2;
      I.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  // Bouts fermés si la bande est ouverte.
  if (!closed) {
    for (const [fr, sgn] of [[frames[0], -1], [frames[n], 1]]) {
      const base = P.length / 3;
      const T = (sgn < 0 ? c.getTangentAt(0) : c.getTangentAt(1)).multiplyScalar(sgn);
      for (const [a, bb] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const q = fr.p.clone().addScaledVector(fr.nr, (a * e) / 2).addScaledVector(fr.b, (bb * w) / 2);
        P.push(q.x, q.y, q.z); N.push(T.x, T.y, T.z); UV.push(fr.s, (bb + 1) / 2);
      }
      if (sgn < 0) I.push(base, base + 2, base + 1, base, base + 3, base + 2);
      else I.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
  g.setIndex(I);
  const m = new THREE.Mesh(g, material);
  m.userData.longueur = L;
  return m;
}

/** Tige ronde cintrée de rayon r le long des points (tube fermé aux bouts). */
export function tige(points, r, material, { closed = false, radial = 12, tension = 0.5, seg = null } = {}) {
  const c = new THREE.CatmullRomCurve3(points.map(v3), closed, 'catmullrom', tension);
  const n = seg || Math.max(8, Math.ceil(c.getLength() / 0.003));
  const g = new THREE.TubeGeometry(c, n, r, radial, closed);
  const grp = new THREE.Group();
  grp.add(new THREE.Mesh(g, material));
  if (!closed) {
    for (const t of [0, 1]) {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(r, radial, Math.max(4, radial / 2)), material);
      cap.position.copy(c.getPointAt(t));
      grp.add(cap);
    }
  }
  return grp;
}

/** Arc de cercle (centre c, rayon R, dans le plan donné par deux axes unitaires) → points. */
export function arc(c, R, a0, a1, n = 12, ax = [1, 0, 0], ay = [0, 1, 0]) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = (a0 + ((a1 - a0) * i) / n) * RAD;
    out.push([c[0] + R * (Math.cos(a) * ax[0] + Math.sin(a) * ay[0]), c[1] + R * (Math.cos(a) * ax[1] + Math.sin(a) * ay[1]), c[2] + R * (Math.cos(a) * ax[2] + Math.sin(a) * ay[2])]);
  }
  return out;
}

/** Pose un objet : position (m), rotation en degrés [x, y, z]. */
export function pose(obj, pos = [0, 0, 0], rotDeg = null) {
  obj.position.set(...pos);
  if (rotDeg) obj.rotation.set(rotDeg[0] * RAD, rotDeg[1] * RAD, rotDeg[2] * RAD);
  return obj;
}

/** Plaque mince (w × h, épaisseur t) découpée dans un contour 2D (plan XY), centrée en Z. */
export function plaque(contour, t, material, trous = []) {
  const s = new THREE.Shape(contour.map(([x, y]) => new THREE.Vector2(x, y)));
  for (const h of trous) {
    const p = new THREE.Path();
    if (h.r) p.absarc(h.x, h.y, h.r, 0, Math.PI * 2, true);
    else p.setFromPoints(h.pts.map(([x, y]) => new THREE.Vector2(x, y)));
    s.holes.push(p);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 24 });
  g.translate(0, 0, -t / 2);
  // UV planaires (mètres) des faces : x, y du contour, rapportés à la boîte.
  g.computeBoundingBox();
  const bb = g.boundingBox, uv = g.attributes.uv, pos = g.attributes.position;
  const sx = bb.max.x - bb.min.x || 1, sy = bb.max.y - bb.min.y || 1;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) - bb.min.x) / sx, (pos.getY(i) - bb.min.y) / sy);
  return new THREE.Mesh(g, material);
}

/** Contour d'un rectangle w × h à coins arrondis de rayon r, centré. */
export function rectArrondi(w, h, r, n = 6) {
  const out = [];
  const c = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 90], [-w / 2 + r, -h / 2 + r, 180], [w / 2 - r, -h / 2 + r, 270]];
  for (const [cx, cy, a0] of c) for (let i = 0; i <= n; i++) {
    const a = (a0 + (90 * i) / n) * RAD;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

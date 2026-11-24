// Repères de mesure et d'angle du montage par étapes (cotes, arcs, zones
// permises, limites, flèches). Le niveau de l'étape 5 est celui de l'équipement
// « niveau-a-degres » (src/models/niveau-a-degres). Les
// couleurs disent toujours la même chose : orange = mesure, vert = permis,
// rouge = limite ou interdit, bleu = sens du geste.
import * as THREE from 'three';

const rad = (deg) => (deg * Math.PI) / 180;

/** Cote : trait de a à b, avec un trait de rappel à chaque bout (direction `side`, demi-longueur `tick`). */
export function cote(S, a, b, { material = 'fluoOrange', r = 0.005, tick = 0.06, side = [1, 0, 0] } = {}) {
  const g = S.group(S.rod(a, b, r, material, 8));
  for (const p of [a, b]) g.add(S.rod(p.map((v, i) => v - side[i] * tick), p.map((v, i) => v + side[i] * tick), r, material, 8));
  return g;
}

/** Trait pointillé de a à b (tirets de `dash` m, espacés de `gap` m), en un seul maillage. */
export function pointille(S, a, b, { material = 'fluoRed', r = 0.005, dash = 0.12, gap = 0.08 } = {}) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const len = A.distanceTo(B), dir = B.clone().sub(A).normalize();
  const rods = [];
  for (let d = 0; d < len; d += dash + gap) {
    const p = A.clone().addScaledVector(dir, d), q = A.clone().addScaledVector(dir, Math.min(len, d + dash));
    rods.push(S.rod(p.toArray(), q.toArray(), r, material, 6));
  }
  return S.merged(rods, material);
}

/** Point du plan vertical X = x : à la distance R du centre c = [y, z], à l'angle a (degrés) au-dessus du sol, côté dir (−1 : vers la paroi). */
export const polar = (x, c, R, a, dir = -1) => [x, c[0] + R * Math.sin(rad(a)), c[1] + dir * R * Math.cos(rad(a))];

/** Arc d'angle dans le plan vertical X = x, centré en c = [y, z], de a0 à a1 degrés au-dessus du sol. */
export function arc(S, x, c, R, a0, a1, { material = 'fluoOrange', r = 0.006, dir = -1 } = {}) {
  const pts = [];
  const n = Math.max(6, Math.round(Math.abs(a1 - a0) / 4));
  for (let i = 0; i <= n; i++) pts.push(polar(x, c, R, a0 + ((a1 - a0) * i) / n, dir));
  return S.tube(pts, r, material, { seg: n * 2, radial: 6 });
}

/** Rayon d'angle : trait du centre c jusqu'à la distance R, à l'angle a. */
export function rayon(S, x, c, R, a, { material = 'fluoOrange', r = 0.005, dir = -1, from = 0 } = {}) {
  return S.rod(polar(x, c, from, a, dir), polar(x, c, R, a, dir), r, material, 8);
}

/** Zone pleine entre deux angles (secteur d'anneau de R0 à R1, mince) dans le plan vertical X = x. */
export function secteur(S, x, c, R0, R1, a0, a1, { material = 'zoneVerte', dir = -1 } = {}) {
  const pts = [];
  const n = Math.max(4, Math.round(Math.abs(a1 - a0) / 2));
  for (let i = 0; i <= n; i++) { const a = rad(a0 + ((a1 - a0) * i) / n); pts.push([dir * R1 * Math.cos(a), R1 * Math.sin(a)]); }
  for (let i = n; i >= 0; i--) { const a = rad(a0 + ((a1 - a0) * i) / n); pts.push([dir * R0 * Math.cos(a), R0 * Math.sin(a)]); }
  const m = S.extrude(pts, 0.003, material);
  m.rotation.y = -Math.PI / 2; // X local → Z du chantier, épaisseur selon X
  m.position.set(x, c[0], c[1]);
  return m;
}

/** Flèche de a vers b : tige et pointe conique. */
export function fleche(S, a, b, { material = 'blue', r = 0.01, head = 0.11 } = {}) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const dir = B.clone().sub(A).normalize();
  const neck = B.clone().addScaledVector(dir, -head);
  const tip = S.group(S.cyl(r * 3.4, head, material, { r2: 0.0006, pos: [0, head / 2, 0], seg: 16 }));
  tip.position.copy(neck);
  tip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  return S.group(S.rod(a, neck.toArray(), r, material, 10), tip);
}

/** Bande d'une couleur autour d'un profilé carré de côté a (repère de hauteur sur un poteau), de hauteur h. */
export function bande(S, a, h, material = 'repereVert') {
  return S.box(a + 0.004, h, a + 0.004, material);
}

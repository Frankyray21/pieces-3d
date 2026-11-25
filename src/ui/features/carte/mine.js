// Mine de la carte 3D : galerie principale, baie de forage (plancher 16 × 32 pi
// de la procédure PRO-DD-ST-003, tel quel), refuge, conduite de ventilation et
// support de terrain — les éléments nommés au formulaire MA4657078 « Forage au
// diamant sous-terre » (analyse de risque sur le terrain, questions 14, 15 et 18).
//
// Repère : celui du plancher (src/models/plancher-dd/plan.js), en mètres. X le
// long de la baie (front de taille à X ≈ 0, entrée vers X positif), Z en travers,
// Y vers le haut. La galerie principale croise l'entrée de la baie, selon Z.
//
// Le plan de la mine est un champ de distance signé en 2D (négatif dans les
// galeries) : les murs suivent le contour d = 0 (carrés marchants), la voûte
// s'arrondit avec la distance au mur, et le même champ sert aux collisions, à la
// minicarte et au calcul d'itinéraire (GPS).
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mat } from '../../../viewer/materials.js';
import { L, W, DECK, GAL, GAL_X1, FACE_X, ground, STAIR } from '../../../models/plancher-dd/plan.js';
import { stairPlan, guardSegments, secondaryPlan } from '../../../models/plancher-dd/floor.js';

// ------------------------------------------------------------------ plan

/** Axe de la galerie principale (X) et sa demi-largeur. */
export const XD = GAL_X1 + 2.6;
const HD = 2.6;
const Z_SUD = -62, Z_NORD = 46;
/** Rampe d'accès : de l'extrémité nord de la galerie vers X négatif, en montée. */
const RAMPE = { a: [XD, Z_NORD], b: [XD - 24, Z_NORD + 13], h: 2.3, pente: 0.11 };
/** Recoupe du refuge, côté X positif de la galerie principale. */
export const REFUGE_Z = -38;
const RECOUPE = { x0: XD, x1: XD + 11.5, hz: 2.4 };
/** Refuge (caisson) dans sa recoupe : porte tournée vers la galerie (X négatif). */
export const REFUGE = { x0: XD + 4.2, x1: XD + 10.3, hz: 1.25, h: 2.55, porte: 0.95 };

const MUR_H = 3.0; // hauteur des parois au-dessus de la base de la voûte
const FLECHE = 0.85; // montée de la voûte au centre

// Bornes du plan (grille des carrés marchants, minicarte).
export const BORNES = { x0: -6, x1: XD + 14, z0: Z_SUD - 5, z1: RAMPE.b[1] + 5 };

const smin = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};
function sdSeg(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - ax - t * dx, pz - az - t * dz);
}
function sdBox(px, pz, cx, cz, hx, hz) {
  const qx = Math.abs(px - cx) - hx, qz = Math.abs(pz - cz) - hz;
  return Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0);
}

/** Distance signée au mur le plus proche (négative dans les galeries). */
export function sdf(x, z) {
  // Baie de forage : rectangle, front de taille plat au fond.
  const baie = sdBox(x, z, (FACE_X + XD) / 2, 0, (XD - FACE_X) / 2, GAL + 0.05);
  const galerie = sdSeg(x, z, XD, Z_SUD, XD, Z_NORD) - HD;
  const rampe = sdSeg(x, z, ...RAMPE.a, ...RAMPE.b) - RAMPE.h;
  const recoupe = sdBox(x, z, (RECOUPE.x0 + RECOUPE.x1) / 2, REFUGE_Z, (RECOUPE.x1 - RECOUPE.x0) / 2, RECOUPE.hz);
  let d = smin(galerie, baie, 1.2);
  d = smin(d, rampe, 2.0);
  return smin(d, recoupe, 1.0);
}

/** Gradient du champ (normale horizontale du mur, vers l'extérieur). */
export function gradient(x, z) {
  const e = 0.02;
  const gx = sdf(x + e, z) - sdf(x - e, z), gz = sdf(x, z + e) - sdf(x, z - e);
  const n = Math.hypot(gx, gz) || 1;
  return [gx / n, gz / n];
}

// ------------------------------------------------------------------ hauteurs

const Y0 = ground(GAL_X1, 0); // sol à l'entrée de la baie = sol de la galerie principale
const smooth = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };

/** Montée de la rampe au point (0 hors de la rampe). */
function monteeRampe(x, z) {
  const [ax, az] = RAMPE.a, [bx, bz] = RAMPE.b;
  const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
  const t = ((x - ax) * dx + (z - az) * dz) / l2;
  if (t <= 0) return 0;
  // Départ en douceur (raccord parabolique), puis pente constante.
  const s = Math.min(t, 1.1);
  return RAMPE.pente * Math.sqrt(l2) * (s < 0.15 ? (s * s) / 0.3 : s - 0.075);
}

/** Base de la voûte (sol moyen, sans les creux). */
function baseVoute(x, z) {
  return Y0 + 0.15 + monteeRampe(x, z);
}

const bruit = (x, y, z) => Math.sin(1.7 * x + 2.1 * y + 0.3 * z) * Math.cos(0.9 * x - 1.3 * y + 1.7 * z)
  + 0.5 * Math.sin(4.1 * x + 0.7 * z) * Math.sin(3.3 * y + 1.1 * z + 0.4)
  + 0.25 * Math.sin(7.3 * z + 2.9 * y) * Math.cos(6.1 * x - 1.7 * y);

/** Sol brut (roche concassée) : celui du plancher dans la baie, raccordé à la galerie. */
export function sol(x, z) {
  const enBaie = x < GAL_X1 && Math.abs(z) < GAL + 0.6;
  const g = ground(Math.min(x, GAL_X1), z);
  if (enBaie) return g;
  const t = smooth((x - GAL_X1) / 1.5);
  const loin = Y0 + monteeRampe(x, z) + 0.012 * bruit(x * 1.3, 0, z * 1.3);
  return x < GAL_X1 + 1.5 && Math.abs(z) < GAL + 0.6 ? g + (loin - g) * t : loin;
}

/** Hauteur de la voûte au point (x, z). */
export function voute(x, z) {
  const d = sdf(x, z);
  const t = Math.min(1, Math.max(0, -d / 2.4));
  return baseVoute(x, z) + MUR_H + FLECHE * Math.sqrt(t) + 0.06 * bruit(x * 0.8, 3, z * 0.8);
}

// ------------------------------------------------------------------ plancher, escalier, refuge

const ESC = (() => {
  const { n } = stairPlan();
  return { n, x0: L, x1: L + (n - 1) * STAIR.tread, z0: STAIR.z0, z1: STAIR.z0 + STAIR.w };
})();
const RISE = stairPlan().rise;

const surPlancher = (x, z) => x >= 0 && x <= L && Math.abs(z) <= W / 2;
const surEscalier = (x, z) => x > ESC.x0 && x <= ESC.x1 && z >= ESC.z0 && z <= ESC.z1;
const dansRefuge = (x, z) => x >= REFUGE.x0 && x <= REFUGE.x1 && Math.abs(z - REFUGE_Z) <= REFUGE.hz;

/** Hauteur du sol où l'on marche : plancher, marches, plancher du refuge ou roche. */
const SEC = secondaryPlan();
export function marche(x, z) {
  if (x >= SEC.x0 && x <= SEC.x1 && z >= SEC.z0 && z <= SEC.z1) return DECK + 9 * 0.0254;
  if (surPlancher(x, z)) return DECK;
  if (surEscalier(x, z)) {
    const i = Math.ceil((x - ESC.x0) / STAIR.tread - 1e-6);
    return Math.max(sol(x, z), DECK - i * RISE);
  }
  if (dansRefuge(x, z)) return Y0 + 0.18;
  return sol(x, z);
}

/**
 * Obstacles en plan (segments épais) : garde-corps du plancher, mains courantes
 * de l'escalier, parois du refuge (porte ouverte). Les objets posés (foreuse,
 * armoire, extincteur) s'ajoutent à la construction de la scène (boîtes).
 */
export function segments() {
  const out = [];
  for (const s of guardSegments()) {
    if (s.axis === 'x') out.push({ a: [s.a, s.side * W / 2], b: [s.b, s.side * W / 2], e: 0.06 });
    else out.push({ a: [L, s.a], b: [L, s.b], e: 0.06 });
  }
  for (const z of [ESC.z0 - 0.04, ESC.z1 + 0.04]) out.push({ a: [ESC.x0, z], b: [ESC.x1 + 0.1, z], e: 0.05 });
  const { x0, x1, hz, porte } = REFUGE;
  const zc = REFUGE_Z;
  out.push({ a: [x0, zc - hz], b: [x1, zc - hz], e: 0.06 }, { a: [x0, zc + hz], b: [x1, zc + hz], e: 0.06 }, { a: [x1, zc - hz], b: [x1, zc + hz], e: 0.06 });
  out.push({ a: [x0, zc - hz], b: [x0, zc - porte / 2], e: 0.06 }, { a: [x0, zc + porte / 2], b: [x0, zc + hz], e: 0.06 });
  return out;
}

// ------------------------------------------------------------------ maillages

/** Contour d = 0 par carrés marchants : segments [[x, z], [x, z]] orientés (intérieur à gauche). */
function contour(h) {
  const { x0, x1, z0, z1 } = BORNES;
  const nx = Math.ceil((x1 - x0) / h), nz = Math.ceil((z1 - z0) / h);
  const v = new Float32Array((nx + 1) * (nz + 1));
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) v[j * (nx + 1) + i] = sdf(x0 + i * h, z0 + j * h);
  const at = (i, j) => v[j * (nx + 1) + i];
  const segs = [];
  const lerp = (pa, pb, da, db) => {
    const t = da / (da - db);
    return [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t];
  };
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const P = [[x0 + i * h, z0 + j * h], [x0 + (i + 1) * h, z0 + j * h], [x0 + (i + 1) * h, z0 + (j + 1) * h], [x0 + i * h, z0 + (j + 1) * h]];
    const D = [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)];
    const pts = [];
    for (let k = 0; k < 4; k++) {
      const a = k, b = (k + 1) % 4;
      if ((D[a] < 0) !== (D[b] < 0)) pts.push(lerp(P[a], P[b], D[a], D[b]));
    }
    // Cas ambigus (2 paires) : appariement dans l'ordre du tour de la cellule.
    for (let k = 0; k + 1 < pts.length; k += 2) segs.push([pts[k], pts[k + 1]]);
  }
  return segs;
}

/** Déplacement de la paroi vers l'extérieur (jamais vers l'intérieur : le plancher et son grillage restent dégagés). */
const relief = (x, y, z) => 0.05 + 0.09 * (bruit(x * 0.9, y * 0.9, z * 0.9) * 0.5 + 0.5) + 0.05 * (bruit(x * 2.7, y * 2.3, z * 2.9) * 0.5 + 0.5);

/** Point de la paroi au contour (x, z), à la fraction t de sa hauteur. */
export function pointParoi(x, z, t) {
  const [gx, gz] = gradient(x, z);
  const yb = sol(x, z) - 0.08, yh = baseVoute(x, z) + MUR_H;
  const y = yb + (yh - yb) * t;
  const r = relief(x, y, z) + 0.06 * (1 - t) ** 3;
  return [x + gx * r, y, z + gz * r, gx, gz];
}

function parois() {
  const segs = contour(0.25);
  const ROWS = 9;
  const pos = [];
  for (const [a, b] of segs) {
    const colA = [], colB = [];
    for (let r = 0; r <= ROWS; r++) {
      const t = r / ROWS;
      colA.push(pointParoi(a[0], a[1], t));
      colB.push(pointParoi(b[0], b[1], t));
    }
    // Orientation : la face regarde l'intérieur (-gradient).
    const [gx, gz] = gradient((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    const ux = b[0] - a[0], uz = b[1] - a[1];
    // Normale d'un quad (a bas, b bas, a haut) = (b - a) × (haut) ; signe selon l'intérieur.
    const nx = -uz, nz = ux; // (u × y) dans le repère main droite : (uy*0 - uz*1, ..., ux*1) -> (-uz, 0, ux)
    const flip = nx * gx + nz * gz < 0; // normale vers l'extérieur → inverser
    for (let r = 0; r < ROWS; r++) {
      const a0 = colA[r], a1 = colA[r + 1], b0 = colB[r], b1 = colB[r + 1];
      const tri = (p, q, s) => pos.push(p[0], p[1], p[2], q[0], q[1], q[2], s[0], s[1], s[2]);
      if (!flip) { tri(a0, a1, b0); tri(b0, a1, b1); } else { tri(a0, b0, a1); tri(b0, b1, a1); }
    }
  }
  let geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo = mergeVertices(geo, 1e-3);
  geo.computeVertexNormals();
  return geo;
}

/** Grille (sol ou voûte) sur les cellules dans les galeries ou au ras des murs. */
function grille(h, hauteur, versLeBas, marge = 0.4, garder = null) {
  const { x0, x1, z0, z1 } = BORNES;
  const nx = Math.ceil((x1 - x0) / h), nz = Math.ceil((z1 - z0) / h);
  const idx = new Int32Array((nx + 1) * (nz + 1)).fill(-1);
  const pos = [];
  const sommet = (i, j) => {
    const k = j * (nx + 1) + i;
    if (idx[k] < 0) {
      const x = x0 + i * h, z = z0 + j * h;
      idx[k] = pos.length / 3;
      pos.push(x, hauteur(x, z), z);
    }
    return idx[k];
  };
  const index = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const cx = x0 + (i + 0.5) * h, cz = z0 + (j + 0.5) * h;
    const dc = sdf(cx, cz);
    if (garder ? !garder(dc) : dc > marge) continue;
    const a = sommet(i, j), b = sommet(i + 1, j), c = sommet(i + 1, j + 1), d = sommet(i, j + 1);
    if (versLeBas) index.push(a, b, d, b, c, d);
    else index.push(a, d, b, b, d, c);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

/** Texture de grillage soudé (support de terrain sous la voûte), mailles de 4 po. */
function textureGrillage() {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  x.clearRect(0, 0, 64, 64);
  x.fillStyle = '#fff';
  x.fillRect(0, 0, 64, 4);
  x.fillRect(0, 0, 4, 64);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** Plaques de boulons d'ancrage (support de terrain) au toit et en haut des parois. */
function boulons() {
  const pts = [];
  const { x0, x1, z0, z1 } = BORNES;
  const pas = 1.2;
  for (let x = x0; x <= x1; x += pas) for (let z = z0; z <= z1; z += pas) {
    const xx = x + 0.15 * Math.sin(z * 3.1), zz = z + 0.15 * Math.cos(x * 2.3);
    if (sdf(xx, zz) > -0.6) continue;
    pts.push({ p: [xx, voute(xx, zz) - 0.035, zz], n: [0, -1, 0] });
  }
  const plaque = new THREE.BoxGeometry(0.15, 0.012, 0.15);
  const tige = new THREE.CylinderGeometry(0.016, 0.016, 0.05, 6).translate(0, -0.03, 0);
  const m = new THREE.MeshStandardMaterial({ color: 0x8e9296, metalness: 0.55, roughness: 0.6 });
  const g = new THREE.Group();
  const p1 = new THREE.InstancedMesh(plaque, m, pts.length);
  const p2 = new THREE.InstancedMesh(tige, m, pts.length);
  const o = new THREE.Object3D();
  pts.forEach((q, i) => {
    o.position.set(...q.p);
    o.rotation.set(0.05 * Math.sin(i), i * 0.7, 0.05 * Math.cos(i));
    o.updateMatrix();
    p1.setMatrixAt(i, o.matrix);
    p2.setMatrixAt(i, o.matrix);
  });
  g.add(p1, p2);
  return g;
}

/** Texture de panneau (canevas). */
export function texturePanneau(w, h, dessin) {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  dessin(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Panneau mural (plaque et image), face tournée selon l'angle ry. */
export function panneau(w, h, tex, { pos, ry = 0, emissif = 0.12 } = {}) {
  const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: emissif });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  const g = new THREE.Group();
  g.add(p);
  const dos = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, h + 0.02, 0.01), new THREE.MeshStandardMaterial({ color: 0x2a2d31, roughness: 0.7 }));
  dos.position.z = -0.008;
  g.add(dos);
  g.position.set(...pos);
  g.rotation.y = ry;
  return g;
}

const fleche = (x, cx, cy, s, dir) => {
  x.save();
  x.translate(cx, cy);
  x.rotate(dir);
  x.beginPath();
  x.moveTo(s, 0); x.lineTo(-s * 0.1, -s * 0.75); x.lineTo(-s * 0.1, -s * 0.3); x.lineTo(-s, -s * 0.3);
  x.lineTo(-s, s * 0.3); x.lineTo(-s * 0.1, s * 0.3); x.lineTo(-s * 0.1, s * 0.75); x.closePath();
  x.fill();
  x.restore();
};

/** Panneau vert d'issue : « REFUGE » et flèche. */
function texRefuge(sens, texte = 'REFUGE') {
  return texturePanneau(512, 200, (x, w, h) => {
    x.fillStyle = '#0d7a3a'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#fff'; x.lineWidth = 10; x.strokeRect(9, 9, w - 18, h - 18);
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '900 92px "Arial Black", Arial, sans-serif';
    x.fillText(texte, sens ? w * 0.42 : w / 2, h * 0.52);
    if (sens) fleche(x, w * 0.86, h * 0.5, 44, sens > 0 ? 0 : Math.PI);
  });
}

// ------------------------------------------------------------------ refuge

function refuge() {
  const g = new THREE.Group();
  const { x0, x1, hz, h, porte } = REFUGE;
  const zc = REFUGE_Z, yb = Y0 + 0.18;
  const tole = new THREE.MeshStandardMaterial({ color: 0xe9ebe6, metalness: 0.35, roughness: 0.45 });
  const vert = new THREE.MeshStandardMaterial({ color: 0x149a4b, metalness: 0.2, roughness: 0.5 });
  const sombre = new THREE.MeshStandardMaterial({ color: 0x2a2e33, metalness: 0.4, roughness: 0.6 });
  const B = (w, hh, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), m); b.position.set(x, y, z); g.add(b); return b; };
  const lx = x1 - x0, t = 0.06;
  // Patins, plancher, toit.
  for (const s of [-1, 1]) B(lx, 0.18, 0.2, sombre, (x0 + x1) / 2, Y0 + 0.09, zc + s * (hz - 0.15));
  B(lx, 0.04, 2 * hz, sombre, (x0 + x1) / 2, yb - 0.02, zc);
  B(lx + 0.06, 0.08, 2 * hz + 0.06, tole, (x0 + x1) / 2, yb + h + 0.04, zc);
  // Parois longues et fond.
  for (const s of [-1, 1]) {
    B(lx, h, t, tole, (x0 + x1) / 2, yb + h / 2, zc + s * hz);
    B(lx, 0.22, t + 0.01, vert, (x0 + x1) / 2, yb + h * 0.62, zc + s * hz);
  }
  B(t, h, 2 * hz, tole, x1, yb + h / 2, zc);
  // Façade avec porte ouverte (battant rabattu contre la façade).
  const cote = (hz - porte / 2);
  for (const s of [-1, 1]) B(t, h, cote, tole, x0, yb + h / 2, zc + s * (porte / 2 + cote / 2));
  B(t, h - 2.05, porte, tole, x0, yb + 2.05 + (h - 2.05) / 2, zc);
  const battant = B(0.05, 2.0, porte - 0.04, tole, x0 - 0.04 - (porte - 0.04) / 2, yb + 1.0, zc - porte / 2 - 0.03);
  battant.rotation.y = Math.PI / 2;
  battant.position.set(x0 - (porte - 0.04) / 2, yb + 1.0, zc - porte / 2 - 0.05);
  // Bancs intérieurs et réserve d'air (bouteilles).
  for (const s of [-1, 1]) B(lx - 1.2, 0.06, 0.45, sombre, (x0 + x1) / 2 + 0.3, yb + 0.45, zc + s * (hz - 0.3));
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.4, 16), vert);
    c.position.set(x1 - 0.2, yb + 0.7, zc - 0.5 + i * 0.33);
    g.add(c);
  }
  // Éclairage intérieur et gyrophare vert sur le toit.
  const plaf = new THREE.Mesh(new THREE.BoxGeometry(lx - 0.8, 0.03, 0.12), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xdff4ff, emissiveIntensity: 0.9 }));
  plaf.position.set((x0 + x1) / 2, yb + h - 0.03, zc);
  g.add(plaf);
  const li = new THREE.PointLight(0xd8f0ff, 1.8, 6, 1.8);
  li.position.set((x0 + x1) / 2, yb + h - 0.4, zc);
  g.add(li);
  const gyro = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.16, 16), new THREE.MeshStandardMaterial({ color: 0x22ff77, emissive: 0x22ff77, emissiveIntensity: 3 }));
  gyro.position.set(x0 + 0.3, yb + h + 0.16, zc + hz - 0.3);
  g.add(gyro);
  const lg = new THREE.PointLight(0x33ff88, 4, 9, 1.5);
  lg.position.copy(gyro.position).add(new THREE.Vector3(-0.3, 0, 0));
  g.add(lg);
  // Panneau « REFUGE » au-dessus de la porte.
  const tex = texRefuge(0);
  if (tex) g.add(panneau(1.3, 0.5, tex, { pos: [x0 - 0.04, yb + 2.3, zc], ry: -Math.PI / 2, emissif: 0.5 }));
  g.userData.gyro = { mesh: gyro, light: lg };
  return g;
}

// ------------------------------------------------------------------ ventilation

/** Tracé de la conduite de ventilation : de la rampe, le long de la galerie, jusqu'au front de la baie. */
export function traceVentilation() {
  const yv = (x, z) => baseVoute(x, z) + MUR_H - 0.05;
  const zb = GAL - 0.55; // le long de la paroi Z positive de la baie
  const xg = XD - 1.55; // côté de la baie, dans la galerie
  const P = [
    [RAMPE.b[0] + 2, RAMPE.b[1] - 1.0],
    [XD - 8, Z_NORD + 3.2],
    [xg, Z_NORD - 2],
    [xg, 6],
    [xg - 0.4, zb + 1.2],
    [XD - 3.2, zb],
    [GAL_X1 - 2, zb],
    [4.2, zb],
  ];
  return P.map(([x, z]) => new THREE.Vector3(x, yv(x, z), z));
}

function ventilation() {
  const pts = traceVentilation();
  const courbe = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.15);
  const long = courbe.getLength();
  const geo = new THREE.TubeGeometry(courbe, Math.ceil(long * 3), 0.3, 18, false);
  const tex = texturePanneau(8, 64, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#c99a12'); gr.addColorStop(0.15, '#f2c230'); gr.addColorStop(0.85, '#e8b61f'); gr.addColorStop(1, '#a87d0b');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
  });
  if (tex) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(long / 0.22, 1); tex.rotation = 0; }
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, roughness: 0.62, side: THREE.DoubleSide });
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, m));
  // Câble porteur et attaches sous la voûte.
  const n = Math.floor(long / 2.5);
  const att = new THREE.MeshStandardMaterial({ color: 0x5c6066, metalness: 0.6, roughness: 0.5 });
  for (let i = 1; i < n; i++) {
    const p = courbe.getPointAt(i / n);
    const top = voute(p.x, p.z);
    const hgt = Math.max(0.05, top - (p.y + 0.3));
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, hgt, 5), att);
    c.position.set(p.x, p.y + 0.3 + hgt / 2, p.z);
    g.add(c);
  }
  const fin = pts[pts.length - 1];
  g.userData.sortie = fin;
  g.userData.direction = pts[pts.length - 1].clone().sub(pts[pts.length - 2]).normalize();
  return g;
}

// ------------------------------------------------------------------ panneaux de direction

function signalisation() {
  const g = new THREE.Group();
  const mural = (x, z, tex, w = 1.1, h = 0.43, y = 1.9) => {
    const [gx, gz] = gradient(x, z);
    const yy = sol(x, z) + y;
    const px = x - gx * 0.02, pz = z - gz * 0.02;
    const ry = Math.atan2(-gx, -gz);
    g.add(panneau(w, h, tex, { pos: [px, yy, pz], ry, emissif: 0.35 }));
  };
  const texte = (lignes, fond = '#f2f2ef', encre = '#111', bande = null) => texturePanneau(512, 200, (x, w, h) => {
    x.fillStyle = fond; x.fillRect(0, 0, w, h);
    if (bande) { x.fillStyle = bande; x.fillRect(0, 0, w, h * 0.28); }
    x.strokeStyle = bande || encre; x.lineWidth = 8; x.strokeRect(4, 4, w - 8, h - 8);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    for (const [t, s, y, c] of lignes) {
      x.fillStyle = c || encre;
      x.font = `900 ${s}px "Arial Black", Arial, sans-serif`;
      const k = Math.min(1, (w * 0.9) / x.measureText(t).width);
      x.save(); x.translate(w / 2, y * h); x.scale(k, 1); x.fillText(t, 0, 0); x.restore();
    }
  });
  const t1 = texRefuge(1, 'REFUGE');
  // Galerie principale : refuge au sud (Z négatif). Panneau sur la paroi X positive,
  // lu en remontant vers le sud : la flèche pointe dans le sens de la marche.
  if (t1) {
    mural(XD + HD - 0.02, 8, texRefuge(-1, 'REFUGE'));
    mural(XD - HD + 0.02, -12, texRefuge(1, 'REFUGE'));
    mural(XD + HD - 0.02, 30, texRefuge(-1, 'REFUGE'));
  }
  const tb = texte([['PLACE DE TRAVAIL', 54, 0.48], ['FORAGE AU DIAMANT', 42, 0.75]], '#f2f2ef', '#111', null);
  if (tb) mural(XD - HD + 0.02, GAL + 2.0, tb, 1.2, 0.47, 2.0);
  const tr = texte([['RAMPE D’ACCÈS', 60, 0.42], ['VERS LA SURFACE', 40, 0.74]]);
  if (tr) mural(XD + HD - 0.02, Z_NORD - 3, tr, 1.2, 0.47, 2.0);
  return g;
}

// ------------------------------------------------------------------ assemblage

/**
 * Construit la mine. Retourne { group, gyro, sortieVent, directionVent }.
 * Les maillages de roche reçoivent userData.roche (pour la caméra et la carte).
 */
export function construireMine() {
  const g = new THREE.Group();
  g.name = 'mine';
  const roche = mat('rock');
  const murs = new THREE.Mesh(parois(), roche);
  const toit = new THREE.Mesh(grille(0.5, voute, true, 0.5), roche);
  const fond = new THREE.Mesh(grille(0.25, (x, z) => sol(x, z) - 0.008, false, 0.5), mat('rockFloor'));
  for (const m of [murs, toit, fond]) { m.userData.roche = true; m.receiveShadow = true; g.add(m); }
  // Grillage du support de terrain, juste sous la voûte.
  const tg = textureGrillage();
  let grillage = null;
  if (tg) {
    const geo = grille(0.5, (x, z) => voute(x, z) - 0.03, true, -0.15);
    const p = geo.attributes.position;
    const uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) { uv[2 * i] = p.getX(i) / 0.1016; uv[2 * i + 1] = p.getZ(i) / 0.1016; }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    const gm = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: 0.6, roughness: 0.55, alphaMap: tg, transparent: false, alphaTest: 0.5, side: THREE.DoubleSide });
    // L'alphaMap lit le canal vert : la texture blanche sur fond transparent donne les fils.
    gm.map = null;
    grillage = new THREE.Mesh(geo, gm);
    g.add(grillage);
  }
  const plaques = boulons();
  g.add(plaques);
  // Crête des parois (carte 3D, vue de dessus, toit enlevé) : bande de roc à la
  // hauteur du haut des murs, autour des galeries.
  // Massif rocheux autour des galeries, à la hauteur du haut des murs : plus clair au
  // bord des galeries, plus sombre au loin.
  const geoCretes = grille(0.5, (x, z) => baseVoute(x, z) + MUR_H + 0.02, false, 0, (d) => d > -0.25);
  {
    const p = geoCretes.attributes.position;
    const col = new Float32Array(p.count * 3);
    const pres = new THREE.Color(0x6a645b), loin = new THREE.Color(0x262422), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const d = sdf(p.getX(i), p.getZ(i));
      c.copy(pres).lerp(loin, Math.min(1, Math.max(0, (d - 0.2) / 3.5)));
      const v = 0.92 + 0.08 * bruit(p.getX(i) * 0.7, 0, p.getZ(i) * 0.7);
      col[3 * i] = c.r * v; col[3 * i + 1] = c.g * v; col[3 * i + 2] = c.b * v;
    }
    geoCretes.setAttribute('color', new THREE.BufferAttribute(col, 3));
  }
  const cretes = new THREE.Mesh(geoCretes, new THREE.MeshLambertMaterial({ vertexColors: true }));
  cretes.visible = false;
  g.add(cretes);
  const vent = ventilation();
  g.add(vent);
  const ref = refuge();
  g.add(ref);
  g.add(signalisation());
  return { group: g, gyro: ref.userData.gyro, sortieVent: vent.userData.sortie, directionVent: vent.userData.direction, toit: [toit, grillage, plaques].filter(Boolean), cretes };
}

export { Y0, ESC, surPlancher };

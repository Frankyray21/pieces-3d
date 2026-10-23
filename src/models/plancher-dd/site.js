// Environnement et équipements autour du plancher : galerie (sol de roche
// concassée, murs coupés en écorché, cibles des fonds de trous), ligne de
// peinture, foreuse aux diamants en silhouette, barricade avec flasher,
// armoire de premiers soins, extincteur ; grillage ; démantèlement (P18) et
// critères de choix des planchers (P19).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mat } from '../../viewer/materials.js';
import { IN, FT, B66, P3, P8, W, L, DECK, GAL, GAL_X0, GAL_X1, FACE_X, WALL_H, ground, DRILL, plankX, TIGHT } from './plan.js';
import { lumber, between, labeler } from './lumber.js';

// Petit générateur pseudo-aléatoire reproductible.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const meshOf = (geo, material) => new THREE.Mesh(geo, mat(material));

/** Grillage soudé (fils de 3 mm) dans le plan XY, centré : longueur selon X, hauteur selon Y. */
export function wireMesh(S, len, h, pitch, material = 'zinc', wire = 0.003) {
  const geos = [];
  const v = new THREE.BoxGeometry(wire, h, wire);
  const hz = new THREE.BoxGeometry(len, wire, wire);
  for (let x = -len / 2; x <= len / 2 + 1e-6; x += pitch) geos.push(v.clone().translate(x, 0, 0));
  for (let y = -h / 2; y <= h / 2 + 1e-6; y += pitch) geos.push(hz.clone().translate(0, y, wire));
  return S.group(meshOf(mergeGeometries(geos, false), material));
}

// ------------------------------------------------------------------ galerie

// Relief des murs : bosses de roche autour du plan du mur (vers l'intérieur positif).
const bulge = (x, y, s) => 0.07 * Math.sin(1.7 * x + 2.1 * y + s) * Math.cos(0.9 * x - 1.3 * y) + 0.035 * Math.sin(4.1 * x + 0.7 * s) * Math.sin(3.3 * y + 1.1);
/** Position Z de la face du mur (côté s = ±1) au point (x, y). */
export const wallZ = (s, x, y) => s * (GAL + 0.05 - bulge(x, y, s));

function groundMesh() {
  const nx = 180, nz = 50;
  const z0 = -GAL - 0.25, z1 = GAL + 0.25;
  const geo = new THREE.PlaneGeometry(GAL_X1 - GAL_X0, z1 - z0, nx, nz);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  const r = rng(7);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + (GAL_X0 + GAL_X1) / 2;
    const z = p.getZ(i);
    p.setXYZ(i, x, ground(x, z) - 0.004 - r() * 0.012, z);
  }
  geo.computeVertexNormals();
  return meshOf(geo, 'rockFloor');
}

function wallMesh(s) {
  const nx = 150, ny = 30;
  const geo = new THREE.PlaneGeometry(GAL_X1 - GAL_X0, 1, nx, ny);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + (GAL_X0 + GAL_X1) / 2;
    const t = p.getY(i) + 0.5;
    const g = ground(x, s * GAL) - 0.02;
    const y = g + t * (WALL_H - g);
    p.setXYZ(i, x, y, wallZ(s, x, y) + s * 0.04 * (1 - t) ** 3);
  }
  // Face tournée vers l'intérieur de la galerie.
  if (s > 0) geo.index.array.reverse();
  geo.computeVertexNormals();
  return meshOf(geo, 'rock');
}

function rocks() {
  const r = rng(11);
  const geos = [];
  const base = new THREE.IcosahedronGeometry(1, 0);
  for (let k = 0; k < 140; k++) {
    const x = GAL_X0 + 0.3 + r() * (GAL_X1 - GAL_X0 - 0.6);
    const z = (r() * 2 - 1) * (GAL - 0.12);
    // Roches hors de l'emprise du plancher, des marches et de la barricade.
    if (x > -0.25 && x < L + 1.4 && Math.abs(z) < W / 2 + 0.1) continue;
    // Aire du matériel étalé derrière la barricade (présentation de la vidéo).
    if (x > L + 4.4 && x < L + 8.4) continue;
    const sc = 0.025 + r() ** 2 * 0.09;
    const g = base.clone().scale(sc * (0.8 + r() * 0.5), sc * (0.5 + r() * 0.4), sc * (0.8 + r() * 0.5));
    g.rotateY(r() * 6.28).rotateX(r() * 0.6);
    g.translate(x, ground(x, z) + sc * 0.2, z);
    geos.push(g);
  }
  return meshOf(mergeGeometries(geos, false), 'rock');
}

/** Morceau du sol de la galerie (vue d'un sous-assemblage seul). */
export function groundPatch(S, x0, x1, z0, z1) {
  const nx = Math.ceil((x1 - x0) / 0.06), nz = Math.ceil((z1 - z0) / 0.06);
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + (x0 + x1) / 2, z = p.getZ(i) + (z0 + z1) / 2;
    p.setXYZ(i, x, ground(x, z) - 0.006, z);
  }
  geo.computeVertexNormals();
  return S.group(meshOf(geo, 'rockFloor'));
}

/** Position X du front de taille (fond de la galerie) au point (z, y). */
export const faceX = (z, y) => FACE_X - bulge(z * 1.3, y, 5);

/** Front de taille : paroi rocheuse du fond de la galerie, vue de l'intérieur seulement. */
function faceMesh() {
  const nz = 60, ny = 30;
  const geo = new THREE.PlaneGeometry(2 * GAL + 0.3, 1, nz, ny);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const z = p.getX(i);
    const t = p.getY(i) + 0.5;
    const g = ground(FACE_X, z) - 0.02;
    const y = g + t * (WALL_H - g);
    p.setXYZ(i, faceX(z, y) - 0.04 * (1 - t) ** 3, y, z);
  }
  geo.index.array.reverse();
  geo.computeVertexNormals();
  return meshOf(geo, 'rock');
}

/** Cible peinte d'un fond de trou sur le front de taille. */
function target(S, z, y) {
  const g = S.group(
    S.ring(0.17, 0.145, 0.006, 'fluoRed', { axis: 'x' }),
    S.ring(0.095, 0.07, 0.006, 'fluoRed', { axis: 'x' }),
    S.cyl(0.025, 0.006, 'fluoRed', { axis: 'x' }),
  );
  g.position.set(faceX(z, y) + 0.012, y, z);
  return g;
}

/** Galerie (contexte) : sol, murs coupés, front de taille, roches, cibles des fonds de trous. */
export function gallery(S) {
  const g = S.group(groundMesh(), wallMesh(-1), wallMesh(1), faceMesh(), rocks());
  g.add(target(S, DRILL.z, DRILL.frontY + 0.25));
  g.add(target(S, DRILL.z + 1.3, DRILL.frontY + 0.45));
  return g;
}

/** Ligne de référence en peinture (étape 1) : rive du premier madrier (en travers, X = 0), rive du plancher et repères de 16 et 32 pi. */
export function paintLine(S) {
  const geos = [];
  const seg = (xa, za, xb, zb, w) => {
    const a = new THREE.Vector3(xa, 0, za), b = new THREE.Vector3(xb, 0, zb);
    const n = Math.max(2, Math.ceil(a.distanceTo(b) / 0.08));
    for (let i = 0; i < n; i++) {
      const p = a.clone().lerp(b, (i + 0.5) / n);
      const d = b.clone().sub(a);
      const box = new THREE.BoxGeometry(d.length() / n + 0.004, 0.004, w);
      box.rotateY(-Math.atan2(d.z, d.x));
      box.translate(p.x, ground(p.x, p.z) + 0.003, p.z);
      geos.push(box);
    }
  };
  // Ligne du premier madrier, en travers de la galerie.
  seg(0, -W / 2 - 0.4, 0, W / 2 + 0.4, 0.05);
  // Rive du plancher le long de la galerie, avec repères à 16 et 32 pi.
  seg(-0.3, -W / 2, L + 0.3, -W / 2, 0.035);
  for (const x of [16 * FT, L]) seg(x, -W / 2 - 0.35, x, -W / 2 + 0.35, 0.04);
  return S.group(meshOf(mergeGeometries(geos, false), 'fluoRed'));
}

// ------------------------------------------------------------------ foreuse

/**
 * Foreuse aux diamants en silhouette (repère de position, pas un modèle de
 * pièces) : patins dans le sens du forage (ils croisent les 6 × 6), tour
 * inclinée vers le mur, tête de rotation, tige dans le trou, groupe moteur.
 */
export function drill(S) {
  const x = DRILL.x;
  const g = S.group();
  const sz0 = -0.45, sz1 = 2.3;
  for (const s of [-1, 1]) g.add(S.box(0.12, 0.16, sz1 - sz0, 'darkSteel', { pos: [x + s * 0.45, DECK + 0.08, (sz0 + sz1) / 2] }));
  for (const z of [sz0 + 0.1, 0.9, sz1 - 0.1]) g.add(S.box(1.02, 0.1, 0.1, 'darkSteel', { pos: [x, DECK + 0.21, z] }));
  g.add(S.box(1.02, 0.025, sz1 - sz0 - 0.1, 'darkSteel', { pos: [x, DECK + 0.272, (sz0 + sz1) / 2] }));
  // Groupe moteur et pompes, pupitre de commande.
  g.add(S.box(0.92, 0.82, 1.1, 'red', { r: 0.02, pos: [x, DECK + 0.285 + 0.41, 1.6] }));
  g.add(S.box(0.94, 0.05, 1.12, 'black', { pos: [x, DECK + 0.285 + 0.845, 1.6] }));
  g.add(S.box(0.06, 0.9, 0.06, 'black', { pos: [x + 0.4, DECK + 0.73, 0.55] }));
  g.add(S.box(0.12, 0.42, 0.55, 'grey', { r: 0.01, pos: [x + 0.4, DECK + 1.3, 0.55] }));
  // Tour : du pied (devant le mur) vers l'arrière, inclinée de DRILL.tilt.
  const mast = S.group();
  const len = DRILL.len;
  mast.add(S.box(0.2, 0.24, len, 'red', { pos: [0, 0, len / 2] }));
  mast.add(S.box(0.3, 0.3, 0.2, 'darkSteel', { pos: [0, 0.2, 0.12] })); // mâchoires de pied
  mast.add(S.box(0.44, 0.36, 0.5, 'red', { r: 0.02, pos: [0, 0.3, len * 0.55] })); // tête de rotation
  mast.add(S.cyl(0.1, 0.26, 'black', { pos: [0, 0.6, len * 0.55] }));
  mast.add(S.cyl(0.035, len * 0.55 + 0.45, 'steel', { axis: 'z', pos: [0, 0.2, (len * 0.55 - 0.45) / 2] })); // tige dans le trou
  mast.position.set(x, DRILL.frontY, DRILL.front);
  mast.rotation.x = DRILL.tilt;
  g.add(mast);
  mast.updateMatrixWorld(true);
  const w = (lz, ly = -0.12) => mast.localToWorld(new THREE.Vector3(0, ly, lz)).toArray();
  for (const s of [-1, 1]) {
    const top = w(0.65);
    top[0] += s * 0.08;
    const foot = [x + s * 0.14, DECK + 0.02, top[2] + 0.18];
    g.add(between(S, top, foot, 0.07, 0.07, 'darkSteel'));
    g.add(S.box(0.14, 0.02, 0.2, 'darkSteel', { pos: [foot[0], DECK + 0.01, foot[2]] }));
  }
  const rear = w(len - 0.15);
  g.add(between(S, rear, [x, DECK + 0.29, rear[2] + 0.05], 0.16, 0.12, 'darkSteel'));
  const head = w(len * 0.55, 0.45);
  g.add(S.hose([[x - 0.3, DECK + 1.0, 1.05], [x - 0.35, DECK + 1.3, 0.6], head], 0.016));
  g.add(S.hose([[x + 0.3, DECK + 1.0, 1.05], [x + 0.35, DECK + 1.35, 0.5], head], 0.016));
  return g;
}

// ------------------------------------------------------------------ sécurité

// Panneaux de la barricade, d'après les photos du chantier : jaune-vert à
// bordure blanche réfléchissante, texte noir bilingue ; panneaux muraux blancs
// à bandeau rouge. Texture dessinée sur un canevas (gris uni hors navigateur).
const SIGN_YELLOW = '#d8df2a';
function signTexture(wPx, hPx, draw) {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = wPx; c.height = hPx;
  const x = c.getContext('2d');
  draw(x, wPx, hPx);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function lines(x, w, rows) {
  // rows : [texte, taille (px), graisse, y]
  x.fillStyle = '#111';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  for (const [txt, size, weight, y] of rows) {
    x.font = `${weight} ${size}px "Arial Black", Arial, Helvetica, sans-serif`;
    // Texte tassé pour tenir dans la largeur, comme sur les vrais panneaux.
    const m = x.measureText(txt).width;
    const k = Math.min(1, (w * 0.9) / m);
    x.save(); x.translate(w / 2, y); x.scale(k, 1); x.fillText(txt, 0, 0); x.restore();
  }
}
const yellowSign = (rows) => signTexture(512, Math.round(512 * rows.ratio), (x, w, h) => {
  x.fillStyle = SIGN_YELLOW; x.fillRect(0, 0, w, h);
  x.strokeStyle = '#f4f6f0'; x.lineWidth = w * 0.035; x.strokeRect(x.lineWidth / 2, x.lineWidth / 2, w - x.lineWidth, h - x.lineWidth);
  lines(x, w, rows.text.map(([t, s, g, y]) => [t, s, g, y * h]));
});

/** Panneau suspendu (larg. w, haut. h) : plaque mince, image recto (vers l'entrée) et verso. */
function hangingSign(S, w, h, tex) {
  const g = S.group(S.box(0.006, h, w, 'yellow'));
  if (tex) {
    const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0 });
    for (const s of [1, -1]) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
      p.position.x = s * 0.0035;
      p.rotation.y = s * Math.PI / 2;
      g.add(p);
    }
  }
  return g;
}

const SIGNS = {
  forage: { w: 0.62, h: 0.3, ratio: 0.48, text: [['FORAGE EN COURS', 50, 700, 0.3], ['DRILLING IN PROGRESS', 44, 700, 0.56], ['MACHINES ROGER', 30, 900, 0.8]] },
  attention: { w: 0.62, h: 0.3, ratio: 0.48, text: [['ATTENTION', 66, 900, 0.28], ['PERSONNE AU TRAVAIL', 42, 700, 0.56], ['PERSONNEL AT WORK', 42, 700, 0.78]] },
  fumer: { w: 0.56, h: 0.28, ratio: 0.5, text: [['DÉFENSE DE FUMER', 54, 900, 0.36], ['NO SMOKING', 54, 900, 0.7]] },
  autorise: { w: 0.66, h: 0.92, ratio: 1.39, text: [
    ['PERSONNE', 74, 900, 0.09], ['AUTORISÉE', 74, 900, 0.17], ['SEULEMENT', 74, 900, 0.25],
    ['VOUS DEVEZ AVOIR', 26, 400, 0.32], ['L\u2019AUTORISATION DE L\u2019OPÉRATEUR', 26, 400, 0.36], ['AVANT DE FRANCHIR LA BARRICADE', 26, 400, 0.40],
    ['AUTHORIZED', 74, 900, 0.5], ['PERSONNEL', 74, 900, 0.58], ['ONLY', 74, 900, 0.66],
    ['YOU MUST HAVE AUTHORIZATION', 26, 400, 0.74], ['FROM OPERATOR BEFORE', 26, 400, 0.78], ['CROSSING BARRICADE', 26, 400, 0.82]] },
};

function wallSign(S) {
  const tex = signTexture(512, 336, (x, w, h) => {
    x.fillStyle = '#f2f2ef'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#c8141c'; x.fillRect(0, 0, w, h * 0.3);
    x.strokeStyle = '#c8141c'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10);
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '900 64px "Arial Black", Arial, sans-serif'; x.fillText('ATTENTION', w / 2, h * 0.16);
    x.fillStyle = '#111'; x.font = '700 62px Arial, sans-serif';
    x.fillText('HOMMES', w / 2, h * 0.5); x.fillText('AU TRAVAIL', w / 2, h * 0.76);
  });
  const g = S.group(S.box(0.006, 0.36, 0.55, 'white'));
  if (tex) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.36), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }));
    p.position.x = 0.0035; p.rotation.y = Math.PI / 2;
    g.add(p);
  }
  // Feu rouge clignotant sur le panneau.
  g.add(S.cyl(0.03, 0.05, 'lampRed', { pos: [0, 0.21, 0.2] }), S.cyl(0.034, 0.015, 'black', { pos: [0, 0.18, 0.2] }));
  return g;
}

/**
 * Barricade de forage, d'après les photos du chantier : câble tendu d'un mur à
 * l'autre, rangée de panneaux suspendus (forage en cours, personne au travail,
 * défense de fumer) et grand panneau « Personne autorisée seulement » au centre,
 * plus un panneau « Attention hommes au travail » avec feu rouge sur chaque mur.
 * Posée à l'abscisse x (repère de la galerie), panneaux tournés vers l'entrée.
 */
export function barricade(S, x) {
  const g = S.group();
  const g0 = ground(x, 0);
  const yc = g0 + 2.15;
  const zA = wallZ(-1, x, yc) + 0.05, zB = wallZ(1, x, yc) - 0.05;
  g.add(S.cyl(0.006, zB - zA, 'black', { axis: 'z', pos: [x, yc, (zA + zB) / 2] }));
  for (const z of [zA, zB]) g.add(S.cyl(0.02, 0.08, 'steel', { axis: 'z', pos: [x, yc, z] }));
  // De gauche à droite vu de l'entrée (Z décroissant).
  const order = ['forage', 'attention', 'fumer', 'autorise', 'attention', 'forage'];
  const total = order.reduce((n, k) => n + SIGNS[k].w, 0) + 0.04 * (order.length - 1);
  let z = total / 2;
  for (const k of order) {
    const sp = SIGNS[k];
    const sign = hangingSign(S, sp.w, sp.h, yellowSign(sp));
    sign.position.set(x, yc - 0.02 - sp.h / 2, z - sp.w / 2);
    g.add(sign);
    z -= sp.w + 0.04;
  }
  for (const s of [-1, 1]) {
    const xs = x + 1.1, ys = ground(xs, s * GAL) + 1.55;
    const w = wallSign(S);
    w.position.set(xs, ys, wallZ(s, xs, ys) - s * 0.34);
    g.add(w);
  }
  return g;
}

/** Armoire : trousse de premiers soins et deux lave-yeux. */
export function cabinet(S) {
  const g = S.group();
  g.add(S.box(0.6, 0.85, 0.32, 'white', { r: 0.01, pos: [0, 0.425, 0] }));
  g.add(S.box(0.18, 0.05, 0.005, 'green', { pos: [0, 0.6, -0.163] }), S.box(0.05, 0.18, 0.005, 'green', { pos: [0, 0.6, -0.163] }));
  g.add(S.box(0.025, 0.08, 0.02, 'steel', { pos: [0.24, 0.42, -0.17] }));
  for (const s of [-1, 1]) {
    g.add(S.cyl(0.045, 0.2, 'green', { pos: [s * 0.12, 0.95, 0] }));
    g.add(S.cyl(0.025, 0.05, 'white', { pos: [s * 0.12, 1.075, 0] }));
  }
  g.add(S.box(0.5, 0.02, 0.2, 'white', { pos: [0, 0.86, 0] }));
  return g;
}

/** Extincteur portatif. */
export function extinguisher(S) {
  const g = S.group();
  g.add(S.cyl(0.08, 0.46, 'red', { pos: [0, 0.25, 0] }));
  g.add(S.cyl(0.08, 0.04, 'red', { r2: 0.03, pos: [0, 0.5, 0] }));
  g.add(S.cyl(0.02, 0.06, 'steel', { pos: [0, 0.55, 0] }));
  g.add(S.box(0.14, 0.015, 0.03, 'black', { pos: [0.03, 0.59, 0] }));
  g.add(S.hose([[0.02, 0.56, 0.02], [0.1, 0.5, 0.07], [0.09, 0.2, 0.09]], 0.01));
  return g;
}

// ------------------------------------------------------------------ démantèlement (P18)

function tagTexture() {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512; c.height = 300;
  const x = c.getContext('2d');
  x.fillStyle = '#d6201b'; x.fillRect(0, 0, 512, 300);
  x.strokeStyle = '#fff'; x.lineWidth = 6; x.strokeRect(10, 10, 492, 280);
  x.fillStyle = '#fff'; x.textAlign = 'center';
  x.font = 'bold 40px sans-serif';
  x.fillText('TROU NON ARPENTÉ', 256, 70);
  x.fillText('ET NON CIMENTÉ', 256, 118);
  x.font = '30px sans-serif'; x.textAlign = 'left';
  x.fillText('Date : ____________', 40, 190);
  x.fillText('Superviseur : ________', 40, 245);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Après le démantèlement : clôture orange et carte de ruban rouge devant le collet du trou. */
export function P18(api) {
  const S = api.S;
  const put = labeler(api);
  const g0 = S.group();
  g0.add(S.box(3.2, 0.06, 2.6, 'rockFloor', { pos: [0, -0.03, 0.2] }));
  g0.add(S.box(3.2, 2.3, 0.4, 'rock', { pos: [0, 1.15, -1.3] }));
  put('G', g0, [0, 0, 0], 19, { noLabel: true });
  // Collet du trou dans le mur (tubage).
  const collar = S.group(S.cyl(0.045, 0.32, 'darkSteel', { axis: 'z' }), S.ring(0.06, 0.045, 0.02, 'darkSteel', { axis: 'z', pos: [0, 0, 0.16] }));
  collar.position.set(0, 1.35, -0.96);
  collar.rotation.x = -0.21;
  put('1', collar, [0, 0, 0.3], 19);
  // Clôture orange en U devant le trou, sur piquets.
  const fx = 0.9, fz = 0.9, h = 1.0;
  const posts = [[-fx, -1.08], [-fx, fz / 2], [-fx, fz], [0, fz], [fx, fz], [fx, fz / 2], [fx, -1.08]];
  posts.forEach(([x, z]) => put('3', S.box(0.04, 1.2, 0.04, 'darkSteel', { pos: [x, 0.6, z] }), [0, 0.3, 0.15], 19));
  const side = (len) => wireMesh(S, len, h, 0.07, 'fluoOrange', 0.012);
  const f1 = side(2 * fx); f1.position.set(0, h / 2 + 0.1, fz);
  const f2 = side(fz + 1.08); f2.position.set(-fx, h / 2 + 0.1, (fz - 1.08) / 2); f2.rotation.y = Math.PI / 2;
  const f3 = side(fz + 1.08); f3.position.set(fx, h / 2 + 0.1, (fz - 1.08) / 2); f3.rotation.y = Math.PI / 2;
  put('2', S.group(f1, f2, f3), [0, 0, 0.45], 19);
  // Carte : ruban rouge noué sur la clôture, carte inscrite.
  const tex = tagTexture();
  const card = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.19), tex ? new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, side: THREE.DoubleSide }) : mat('fluoRed'));
  card.position.set(0.15, 0.82, fz + 0.03);
  const ribbon = S.box(0.02, 0.2, 0.004, 'fluoRed', { pos: [0.15, 1.01, fz + 0.025] });
  const tie = S.box(0.5, 0.025, 0.006, 'fluoRed', { pos: [0.15, 1.1, fz + 0.02] });
  put('4', S.group(card, ribbon, tie), [0, 0.15, 0.6], 19);
  return { view: { dir: [0.35, 0.35, 1] } };
}

// ------------------------------------------------------------------ critères (P19)

/** Plancher simplifié len × wid pi (sol plat) : 6 × 6 en long, 3 × 8 en travers. */
function simpleFloor(S, lenFt, widFt) {
  const g = S.group();
  const Lx = lenFt * FT, Wz = widFt * FT;
  const n = Math.max(2, Math.round((Wz - B66) / (32 * IN)) + 1);
  for (let k = 0; k < n; k++) g.add(lumber(S, [Lx, B66, B66], [Lx / 2, B66 / 2, -Wz / 2 + B66 / 2 + (k * (Wz - B66)) / (n - 1)]));
  const np = Math.round(Lx / P8);
  for (let i = 0; i < np; i++) g.add(lumber(S, [P8, P3, Wz], [(i + 0.5) * P8, B66 + P3 / 2, 0], i % 3 ? 'wood' : 'woodDark'));
  return g;
}

/** Support à tiges debout (largeur minimale) : cadre et quelques tiges. */
function rodRack(S) {
  const g = S.group();
  const h = 2.4;
  for (const s of [-1, 1]) g.add(S.box(0.06, h, 0.06, 'yellow', { pos: [s * 0.3, h / 2, 0] }));
  g.add(S.box(0.66, 0.06, 0.06, 'yellow', { pos: [0, h - 0.03, 0] }));
  g.add(S.box(0.66, 0.06, 0.25, 'yellow', { pos: [0, 0.03, 0] }));
  for (let i = 0; i < 6; i++) g.add(S.cyl(0.035, 3.0, 'steel', { pos: [-0.22 + i * 0.088, 1.5, 0.02], r2: 0.035 }));
  return g;
}

export function P19(api) {
  const S = api.S;
  const put = labeler(api);
  const a = simpleFloor(S, 10, 8);
  a.position.set(0, 0, 0);
  put('1', a, [0, 0, 0], 0, { caption: '0 à 49 m : 10 × 8 pi' });
  const b = simpleFloor(S, 10, 16);
  const rack = rodRack(S);
  rack.position.set(10 * FT - 0.5, DECK, 16 * FT / 2 - 0.4);
  b.add(rack);
  b.position.set(10 * FT + 1.5, 0, 0);
  put('2', b, [0, 0, 0], 0, { caption: '49 à 499 m : 10 × 16 pi + support à tiges' });
  const c = simpleFloor(S, 32, 16);
  c.position.set(20 * FT + 3.0, 0, 0);
  put('3', c, [0, 0, 0], 0, { caption: '500 m et plus : 16 × 32 pi' });
  return { view: { dir: [0.15, 0.9, 1] } };
}

export { GAL };

// ------------------------------------------------------------------ outils du montage par étapes

/**
 * Outils et repères montrés seulement à certaines étapes du montage
 * (userData.stepOnly) : plan du niveau au laser (étapes 2 et 3 sur la
 * section 1, 9 et 10 sur la section 2), point le plus haut, niveau de 48 po
 * sur un 3 × 8 de 8 pi (étape 5), coins de serrage entre deux planches (étape 7).
 */
export function guides(S, high) {
  const out = [];
  const only = (o, steps) => { o.userData.stepOnly = steps; o.visible = false; out.push(o); return o; };
  const laserMat = new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false });
  const plane = (x0, x1) => {
    const g = S.group();
    const geo = new THREE.PlaneGeometry(x1 - x0, W + 0.4);
    const p = new THREE.Mesh(geo, laserMat);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0xff3020 }));
    for (const m of [p, e]) { m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0.003, 0); g.add(m); }
    return g;
  };
  const tool = (x, z) => {
    const g = S.group(
      S.box(0.11, 0.13, 0.1, 'blue', { r: 0.01, pos: [0, 0.065, 0] }),
      S.box(0.112, 0.05, 0.06, 'fluoRed', { pos: [0, 0.1, 0] }),
      S.box(0.09, 0.02, 0.09, 'black', { pos: [0, 0.14, 0] }),
    );
    g.position.set(x, ground(x, z), z);
    return g;
  };
  only(S.group(plane(-0.4, 16 * FT + 0.3), tool(-0.35, -W / 2 + 0.6)), [2, 3]);
  only(S.group(plane(16 * FT - 0.1, L + 0.3), tool(16 * FT - 0.05, W / 2 + 0.05)), [9, 10]);
  const mark = S.group(
    S.box(0.36, 0.006, 0.04, 'fluoRed'),
    S.box(0.04, 0.006, 0.36, 'fluoRed'),
    S.cyl(0.05, 0.12, 'fluoRed', { r2: 0.001, pos: [0, 0.18, 0] }),
    S.cyl(0.012, 0.25, 'fluoRed', { pos: [0, 0.36, 0] }),
  );
  mark.children[2].rotation.x = Math.PI;
  mark.position.set(high.x, high.y + 0.004, high.z);
  only(mark, [2, 3]);
  const level = S.group(
    S.box(0.2, P3, 8 * FT, 'woodLight', { pos: [0, P3 / 2, 0] }),
    S.box(0.045, 0.07, 48 * IN, 'blue', { pos: [0, P3 + 0.035, 0] }),
    S.box(0.047, 0.02, 0.07, 'lampAmber', { pos: [0, P3 + 0.06, 0] }),
  );
  level.position.set(2.3, B66, -0.4);
  only(level, [5]);
  // Coins de serrage entre la planche vissée devant les coins et la suivante (planches selon Z).
  const wedges = S.group();
  for (const z of [-1.65, -0.55, 0.55, 1.65]) {
    const w = S.extrude([[0, 0], [0.025, 0], [0.012, -0.2]], 0.09, 'woodWedge');
    const r = S.group(w);
    r.position.set(plankX(TIGHT) + P8 / 2 + 0.0125 - 0.0125, B66 + P3 + 0.03, z);
    wedges.add(r);
  }
  only(wedges, [7]);
  return out;
}

/** Point le plus haut du sol sous la section 1 (étape 2). */
export function highPoint() {
  let best = { y: -Infinity };
  for (let x = 0; x <= 16 * FT; x += 0.05) for (let z = -W / 2; z <= W / 2; z += 0.05) {
    const y = ground(x, z);
    if (y > best.y) best = { x, z, y };
  }
  return best;
}

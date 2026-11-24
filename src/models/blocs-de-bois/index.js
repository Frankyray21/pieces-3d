// Blocs de bois pour boîte à carottes TIME Limited 92-1500 (« Core blocks
// 2" × 3/4" × 3/4" ») : les petits blocs sur lesquels on écrit le métrage et
// qu'on pose dans la boîte à carottes, au bout de chaque course. Reconstitués
// d'après la page du produit fournie par le client (P01). Aucun plan.
//
// Publié par TIME Limited, repris tel quel : le numéro 92-1500 et les cotes
// 2 po × 3/4 po × 3/4 po ; vendus en vrac, au sac (le sac n'est pas modélisé,
// à la demande du client ; le nombre de blocs par sac n'est pas publié).
//
// Relevé sur la photo : sept blocs debout sur leur bout à côté du sac, quatre
// derrière et trois devant, le dernier de la rangée du fond tourné d'environ
// 25° ; bois résineux clair, scié (bouts rugueux). Essence non publiée.
//
// Repère d'un bloc, en millimètres : z le long du bloc (fil du bois), x et y
// en travers, origine au centre.
// Modèle : blocs debout sur le sol (y vers le haut), mètres.
import * as THREE from 'three';
import { withFinish } from '../../viewer/materials.js';

const MM = 0.001;
const RAD = Math.PI / 180;
export const IN = 25.4;

// ------------------------------------------------------------------ cotes (mm)

/** Bloc : cotes publiées (2 po × 3/4 po × 3/4 po). */
export const BLOC = { long: 2 * IN, cote: 0.75 * IN };
/** Masse volumique supposée (épinette sèche), pour la masse calculée d'un bloc. */
export const MASSE_VOLUMIQUE = 0.42; // g/cm³
/**
 * Place des sept blocs de la photo, debout : centre [x, z] sur le sol (x vers
 * la droite, z vers l'avant) et angle autour de la verticale, en degrés.
 * Relevé sur la photo, à quelques millimètres près.
 */
export const POSES = [
  { x: -30.3, z: -10.2, angle: 2 },
  { x: -9.9, z: -10.6, angle: -3 },
  { x: 10.4, z: -11.4, angle: 1.5 },
  { x: 34.6, z: -14.4, angle: 25 },
  { x: -13.0, z: 11.6, angle: -2 },
  { x: 7.4, z: 12.2, angle: 3 },
  { x: 27.7, z: 11.4, angle: -1.5 },
];

/** Volume (cm³) et masse calculée (g) d'un bloc. */
export function bloc() {
  const volume = (BLOC.long * BLOC.cote * BLOC.cote) / 1000;
  return { volume, masse: volume * MASSE_VOLUMIQUE };
}

/** Les quatre coins d'un bloc posé debout, vus de dessus (mm). */
export function coins(pose) {
  const c = Math.cos(pose.angle * RAD), s = Math.sin(pose.angle * RAD), h = BLOC.cote / 2;
  return [[-h, -h], [h, -h], [h, h], [-h, h]].map(([u, v]) => [pose.x + u * c + v * s, pose.z - u * s + v * c]);
}

/** Jeu entre deux blocs debout, vus de dessus (mm) : négatif s'ils se pénètrent (axes séparateurs). */
export function jeu(a, b) {
  const A = coins(a), B = coins(b);
  let mieux = -Infinity;
  for (const P of [A, B]) {
    for (let i = 0; i < 2; i++) {
      const ax = P[i + 1][0] - P[i][0], az = P[i + 1][1] - P[i][1], n = Math.hypot(ax, az);
      const pa = A.map((p) => (p[0] * ax + p[1] * az) / n), pb = B.map((p) => (p[0] * ax + p[1] * az) / n);
      mieux = Math.max(mieux, Math.min(...pb) - Math.max(...pa), Math.min(...pa) - Math.max(...pb));
    }
  }
  return mieux;
}

/** Plus petit jeu entre deux blocs de la disposition (mm). */
export function jeuMinimal() {
  let m = Infinity;
  for (let i = 0; i < POSES.length; i++) for (let j = i + 1; j < POSES.length; j++) m = Math.min(m, jeu(POSES[i], POSES[j]));
  return m;
}

/** Encombrement de la disposition (mm) : largeur, profondeur, hauteur. */
export function horsTout() {
  const pts = POSES.flatMap(coins);
  const xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
  return { large: Math.max(...xs) - Math.min(...xs), profond: Math.max(...zs) - Math.min(...zs), haut: BLOC.long };
}

// ------------------------------------------------------------------ bois

/** Suite pseudo-aléatoire reproductible (chaque bloc garde ses cernes d'un affichage à l'autre). */
function suite(graine) {
  let s = graine >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/** Bruit de valeur en 3D, lissé, entre 0 et 1. */
function bruit(x, y, z, g) {
  const h = (i, j, k) => {
    let n = (i * 374761393 + j * 668265263 + k * 2147483647 + g * 362437) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const l = (t) => t * t * (3 - 2 * t);
  const u = l(x - xi), v = l(y - yi), w = l(z - zi);
  const m = (a, b, t) => a + (b - a) * t;
  return m(
    m(m(h(xi, yi, zi), h(xi + 1, yi, zi), u), m(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), u), v),
    m(m(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), u), m(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), u), v),
    w,
  );
}

/**
 * Bois d'un bloc : couleur [r, v, b] (0 à 255) au point (x, y, z) du bloc, en
 * mm. Les cernes sont des cylindres autour du cœur de l'arbre, qui passe à
 * côté du bloc : les six faces montrent donc le même bois (cernes en arcs sur
 * les bouts, veines le long des côtés).
 */
function essence(graine) {
  const h = suite(graine * 7919 + 13);
  const dir = h() * 2 * Math.PI, dist = 28 + h() * 60;
  const cx = Math.cos(dir) * dist, cy = Math.sin(dir) * dist;
  const penteX = (h() - 0.5) * 0.05, penteY = (h() - 0.5) * 0.05; // fil légèrement en biais
  const pas = 2.1 + h() * 2.4, phase = h(); // largeur des cernes (mm)
  const ton = 0.94 + h() * 0.1; // blocs plus ou moins clairs
  const clair = [232, 211, 170], fonce = [196, 158, 104];
  return (x, y, z, bout) => {
    let r = Math.hypot(x - cx + penteX * z, y - cy + penteY * z);
    r += (bruit(x * 0.16, y * 0.16, z * 0.035, graine) - 0.5) * 1.5;
    const t = r / pas + phase, f = t - Math.floor(t);
    // Bois d'été : bande foncée étroite à la fin du cerne.
    const ete = Math.min(1, Math.max(0, (f - 0.55) / 0.36)) ** 2 * (1 - Math.min(1, Math.max(0, (f - 0.95) / 0.05)));
    // Fibres : stries fines étirées le long du bloc ; trait de scie sur les bouts.
    const fibre = bruit(x * 3.2, y * 3.2, z * 0.12, graine + 1) - 0.5;
    const scie = bout ? bruit(x * 5, y * 5, z * 5, graine + 2) - 0.5 + (bruit(x * 0.9 + y * 0.5, y * 2.2, 0, graine + 3) - 0.5) * 0.7 : 0;
    const k = ton * (1 + fibre * 0.09 + scie * 0.13) * (bout ? 0.97 : 1);
    const w = ete * (bout ? 0.62 : 0.5);
    return [0, 1, 2].map((c) => Math.min(255, Math.max(0, (clair[c] + (fonce[c] - clair[c]) * w) * k)));
  };
}

// Atlas d'un bloc : quatre bandes pour les côtés, deux carrés pour les bouts.
const PX = { long: 256, cote: 96, marge: 4 };
const ATLAS = { w: PX.long + 2 * PX.marge, h: 512 };
const bande = (i) => ({ u0: PX.marge, v0: PX.marge + i * (PX.cote + 2 * PX.marge), w: PX.long, h: PX.cote });
const carre = (i) => ({ u0: PX.marge + i * (PX.cote + 2 * PX.marge), v0: PX.marge + 4 * (PX.cote + 2 * PX.marge), w: PX.cote, h: PX.cote });

/**
 * Faces d'un bloc : zone de l'atlas et point du bloc (mm) en fonction de (s, t)
 * entre 0 et 1 dans cette zone ; n : normale de la face.
 */
function faces() {
  const a = BLOC.cote / 2, L = BLOC.long / 2;
  const c = (s) => (s - 0.5) * BLOC.cote, l = (s) => (s - 0.5) * BLOC.long;
  return [
    { zone: bande(0), n: [1, 0, 0], p: (s, t) => [a, c(t), l(s)] },
    { zone: bande(1), n: [-1, 0, 0], p: (s, t) => [-a, c(t), l(s)] },
    { zone: bande(2), n: [0, 1, 0], p: (s, t) => [c(t), a, l(s)] },
    { zone: bande(3), n: [0, -1, 0], p: (s, t) => [c(t), -a, l(s)] },
    { zone: carre(0), n: [0, 0, 1], bout: true, p: (s, t) => [c(s), c(t), L] },
    { zone: carre(1), n: [0, 0, -1], bout: true, p: (s, t) => [c(s), c(t), -L] },
  ];
}

const textures = new Map();
function textureBloc(graine) {
  let tex = textures.get(graine);
  if (tex) return tex;
  const bois = essence(graine), px = new Uint8Array(ATLAS.w * ATLAS.h * 4);
  for (const f of faces()) {
    const { u0, v0, w, h } = f.zone, m = PX.marge;
    // La marge répète le bord de la face, pour que les niveaux réduits de la texture ne bavent pas.
    for (let j = -m; j < h + m; j++) {
      for (let i = -m; i < w + m; i++) {
        const s = (Math.min(w - 1, Math.max(0, i)) + 0.5) / w, t = (Math.min(h - 1, Math.max(0, j)) + 0.5) / h;
        const coul = bois(...f.p(s, t), !!f.bout), k = ((v0 + j) * ATLAS.w + u0 + i) * 4;
        px[k] = coul[0]; px[k + 1] = coul[1]; px[k + 2] = coul[2]; px[k + 3] = 255;
      }
    }
  }
  tex = new THREE.DataTexture(px, ATLAS.w, ATLAS.h, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  textures.set(graine, tex);
  return tex;
}

const matieres = new Map();
/** Bois scié du bloc : mat, grain fin (traits de scie), sans reflets. */
function boisScie(graine) {
  let m = matieres.get(graine);
  if (!m) {
    m = withFinish(new THREE.MeshStandardMaterial({ color: 0xffffff, map: textureBloc(graine), metalness: 0, roughness: 0.88 }),
      'plastic', { fine: 0.06, wave: 0.006, rough: 0.12, tint: 0.05, env: 0.4 });
    m.name = `bloc-bois-${graine}`;
    m.polygonOffset = true;
    m.polygonOffsetFactor = 1;
    m.polygonOffsetUnits = 1;
    matieres.set(graine, m);
  }
  return m;
}

// ------------------------------------------------------------------ pièces

/** Géométrie d'un bloc (fil le long de z), faces repérées dans l'atlas. */
let geo = null;
function geometrie() {
  if (geo) return geo;
  const p = [], n = [], uv = [], idx = [];
  for (const f of faces()) {
    const { u0, v0, w, h } = f.zone, base = p.length / 3;
    const pts = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([s, t]) => {
      p.push(...f.p(s, t).map((v) => v * MM));
      n.push(...f.n);
      uv.push((u0 + s * w) / ATLAS.w, (v0 + t * h) / ATLAS.h);
      return new THREE.Vector3(...f.p(s, t));
    });
    // Sens des triangles : face tournée vers la normale.
    const dehors = new THREE.Vector3().subVectors(pts[1], pts[0]).cross(new THREE.Vector3().subVectors(pts[2], pts[0])).dot(new THREE.Vector3(...f.n)) > 0;
    idx.push(...(dehors ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2]).map((i) => base + i));
  }
  geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  return geo;
}

/** Repère 1 : un bloc debout sur son bout, à sa place de la photo. */
function blocDebout(i) {
  const pose = POSES[i];
  const m = new THREE.Mesh(geometrie(), boisScie(i + 1));
  m.rotation.set(-Math.PI / 2, 0, (i % 4) * (Math.PI / 2)); // fil vertical ; une face différente vers l'avant d'un bloc à l'autre
  const g = new THREE.Group();
  g.add(m);
  g.position.set(pose.x * MM, (BLOC.long / 2) * MM, pose.z * MM);
  g.rotation.y = pose.angle * RAD;
  return g;
}

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  // Vue éclatée : les blocs s'écartent du centre du groupe, la rangée du fond monte un peu.
  const cx = POSES.reduce((s, p) => s + p.x, 0) / POSES.length, cz = POSES.reduce((s, p) => s + p.z, 0) / POSES.length;
  POSES.forEach((pose, i) => {
    const dx = pose.x - cx, dz = pose.z - cz;
    api.part('1', blocDebout(i), [dx * 1.3 * MM, pose.z < 0 ? 0.03 : 0, dz * 1.6 * MM], { noLabel: i !== 5 });
  });
  // Vue de la photo : de face, un peu de la droite et du dessus.
  return { view: { dir: [0.38, 0.4, 0.83] } };
}

export default { P01 };

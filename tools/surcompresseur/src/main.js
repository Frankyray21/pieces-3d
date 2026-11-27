// Surcompresseur (booster) des Cubex : première version, sans plans.
// Contenu tiré de la procédure PRO-OP-ITH-004 : refroidisseur d'eau, filtre à air,
// receiver (réservoir d'air) et raccords de 2 po ; placé à 7 m de la foreuse.
// Toutes les cotes sont provisoires (à corriger avec photos ou plans).
// Unités : MÈTRES (export GLB direct pour Unreal). X = longueur du patin, Y = hauteur (0 = sol), Z = largeur.
// Bout -X = entrée d'air (côté réseau de la mine), bout +X = sortie vers la foreuse. Côté -Z = garde-courroie.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { wornSet } from './textures.js';

// ---------- Scène ----------
const app = document.getElementById('viewport');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2b2e32);
scene.fog = new THREE.Fog(0x2b2e32, 9, 22);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.45;

const camera = new THREE.PerspectiveCamera(35, 1, 0.02, 100);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 0.4;
controls.maxDistance = 14;

scene.add(new THREE.HemisphereLight(0xdfe6ee, 0x3a3630, 0.7));
const sun = new THREE.DirectionalLight(0xfff4e6, 2.6);
sun.position.set(3, 5.5, 3.5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 15 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.01;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xc8d6ff, 0.7);
fill.position.set(-4, 2, -3);
scene.add(fill);

// sol de galerie (béton/roc compacté, humide par endroits) : décor de la page, pas exporté
{
  const t = wornSet({ base: 0x56524c, wear: 0, rust: 0.05, oil: 0.5, rough: 0.9, seed: 3, N: 512 });
  Object.values(t).forEach(x => x.repeat.set(10, 10));
  const g = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshStandardMaterial({ ...t, metalnessMap: null, metalness: 0 }));
  g.rotation.x = -Math.PI / 2; g.receiveShadow = true;
  scene.add(g);
}

const root = new THREE.Group();
root.name = 'Surcompresseur';
scene.add(root);

// ---------- Matériaux (usés, sans poussière) ----------
const TILE = 0.9; // une tuile de texture = 0,9 m
const SETS = {};
function set(name, o) { return SETS[name] ??= wornSet(o); }
const MATS = {
  rouge: () => new THREE.MeshStandardMaterial({ name: 'M_Peinture_Rouge_Use', ...set('rouge', { base: 0x8f1c16, wear: 0.65, rust: 0.55, oil: 0.35, rough: 0.5, seed: 11 }) }),
  jaune: () => new THREE.MeshStandardMaterial({ name: 'M_Peinture_Jaune_Use', ...set('jaune', { base: 0xc99a12, wear: 0.75, rust: 0.45, oil: 0.4, rough: 0.48, seed: 23 }) }),
  gris: () => new THREE.MeshStandardMaterial({ name: 'M_Peinture_Grise_Use', ...set('gris', { base: 0x6f7477, wear: 0.45, rust: 0.4, oil: 0.25, rough: 0.52, seed: 31 }) }),
  bleu: () => new THREE.MeshStandardMaterial({ name: 'M_Moteur_Bleu_Use', ...set('bleu', { base: 0x2c4660, wear: 0.4, rust: 0.25, oil: 0.55, rough: 0.45, seed: 41 }) }),
  bloc: () => new THREE.MeshStandardMaterial({ name: 'M_Fonte_Peinte_Huileuse', ...set('bloc', { base: 0x2a2d30, wear: 0.35, rust: 0.2, oil: 0.85, rough: 0.5, seed: 53 }) }),
  tole: () => new THREE.MeshStandardMaterial({ name: 'M_Tole_Larmee', ...set('tole', { base: 0x5b5d5e, metal: true, wear: 0.6, rust: 0.6, oil: 0.5, rough: 0.55, seed: 61, checker: true }) }),
  galva: () => new THREE.MeshStandardMaterial({ name: 'M_Tuyau_Galvanise', ...set('galva', { base: 0x80868a, metal: true, wear: 0.3, rust: 0.35, oil: 0.3, rough: 0.42, seed: 71 }) }),
  acier: () => new THREE.MeshStandardMaterial({ name: 'M_Acier_Nu', ...set('acier', { base: 0x6d7073, metal: true, wear: 0.4, rust: 0.45, oil: 0.4, rough: 0.45, seed: 83 }) }),
  laiton: () => new THREE.MeshStandardMaterial({ name: 'M_Laiton_Terni', ...set('laiton', { base: 0x9c7a3a, metal: true, wear: 0.2, rust: 0.05, oil: 0.2, rough: 0.38, seed: 97 }) }),
  caoutchouc: () => new THREE.MeshStandardMaterial({ name: 'M_Caoutchouc', color: 0x141414, roughness: 0.92, metalness: 0 }),
  verre: () => new THREE.MeshStandardMaterial({ name: 'M_Verre_Cadran', color: 0xeef3f5, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.25 }),
  cadran: () => new THREE.MeshStandardMaterial({ name: 'M_Cadran', color: 0xf0eee6, roughness: 0.5, metalness: 0 }),
  noir: () => new THREE.MeshStandardMaterial({ name: 'M_Plastique_Noir', color: 0x1a1a1a, roughness: 0.6, metalness: 0 }),
  vert: () => new THREE.MeshStandardMaterial({ name: 'M_Bouton_Vert', color: 0x1f7a33, roughness: 0.35, metalness: 0 }),
  rougeVif: () => new THREE.MeshStandardMaterial({ name: 'M_Bouton_Rouge', color: 0xb8160f, roughness: 0.35, metalness: 0 }),
  plaque: () => new THREE.MeshStandardMaterial({ name: 'M_Plaque_Signaletique', ...plateTex(), roughness: 0.4, metalness: 0.6 }),
};
const matCache = {};
const M = k => (matCache[k] ??= MATS[k]());

// Plaque signalétique (texte gravé)
function plateTex() {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256;
  const c = cv.getContext('2d');
  c.fillStyle = '#b9bcbd'; c.fillRect(0, 0, 512, 256);
  c.fillStyle = '#2a2c2e'; c.font = '700 40px Arial'; c.fillText('SURCOMPRESSEUR', 24, 58);
  c.font = '26px Arial';
  ['Pression max. de service : ___ psi', 'Débit : ___ pi³/min', 'Moteur : ___ HP  600 V', 'N° de série : ______'].forEach((t, i) => c.fillText(t, 24, 108 + i * 38));
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return { map: t };
}

// ---------- Registre des pièces ----------
const PARTS = [];
const partById = {};
function part(id, info, explode = [0, 0, 0]) {
  const g = new THREE.Group();
  g.name = id;
  g.userData = { id, ...info, explode: new THREE.Vector3(...explode) };
  root.add(g);
  PARTS.push(g);
  partById[id] = g;
  return g;
}
// UV par projection selon la normale dominante : densité de texture constante en mètres.
function boxUV(geo) {
  const p = geo.attributes.position, n = geo.attributes.normal;
  if (!n) geo.computeVertexNormals();
  const N = geo.attributes.normal;
  const uv = new Float32Array(p.count * 2);
  const ox = Math.random() * 7, oy = Math.random() * 7;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(N.getX(i)), ay = Math.abs(N.getY(i)), az = Math.abs(N.getZ(i));
    let u, v;
    if (ay >= ax && ay >= az) { u = p.getX(i); v = p.getZ(i); }
    else if (ax >= az) { u = p.getZ(i); v = p.getY(i); }
    else { u = p.getX(i); v = p.getY(i); }
    uv[i * 2] = u / TILE + ox; uv[i * 2 + 1] = v / TILE + oy;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}
function add(g, geo, m, x = 0, y = 0, z = 0, keepUV = false) {
  if (!keepUV) boxUV(geo);
  const mesh = new THREE.Mesh(geo, typeof m === 'string' ? M(m) : m);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.partId = g.userData?.id ?? g.name;
  g.add(mesh);
  return mesh;
}
const box = (w, h, d, r = 0.004) => r > 0 ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.1, h / 2.1, d / 2.1)) : new THREE.BoxGeometry(w, h, d);
const cyl = (r, h, s = 32) => new THREE.CylinderGeometry(r, r, h, s);
// cylindre orienté selon un axe
function cylAx(r, h, axis, s = 32, r2 = r) {
  const g = new THREE.CylinderGeometry(r2, r, h, s);
  if (axis === 'x') g.rotateZ(-Math.PI / 2);
  if (axis === 'z') g.rotateX(Math.PI / 2);
  return g;
}
function hexNut(af, h, axis = 'y') {
  return cylAx(af / Math.sqrt(3), h, axis, 6);
}
// Tuyau suivant une polyligne, coudes au rayon rb
function pipeGeo(points, r, rb = r * 3, radial = 18) {
  const P = points.map(p => new THREE.Vector3(...p));
  const path = new THREE.CurvePath();
  let prev = P[0].clone();
  for (let i = 1; i < P.length - 1; i++) {
    const a = P[i - 1], b = P[i], c = P[i + 1];
    const d1 = b.clone().sub(a).normalize(), d2 = c.clone().sub(b).normalize();
    const k = Math.min(rb, a.distanceTo(b) / 2, b.distanceTo(c) / 2);
    const p1 = b.clone().addScaledVector(d1, -k), p2 = b.clone().addScaledVector(d2, k);
    path.add(new THREE.LineCurve3(prev, p1));
    path.add(new THREE.QuadraticBezierCurve3(p1, b, p2));
    prev = p2;
  }
  path.add(new THREE.LineCurve3(prev, P[P.length - 1]));
  return new THREE.TubeGeometry(path, Math.max(24, P.length * 24), r, radial, false);
}
// Bride avec boulons, perpendiculaire à l'axe
function flange(g, m, at, axis, R, t, nb = 4, br = R * 0.75) {
  const [x, y, z] = at;
  add(g, cylAx(R, t, axis, 40), m, x, y, z);
  for (let i = 0; i < nb; i++) {
    const a = (i + 0.5) / nb * Math.PI * 2;
    const c = Math.cos(a) * br, s = Math.sin(a) * br;
    const pos = axis === 'x' ? [x, y + c, z + s] : axis === 'y' ? [x + c, y, z + s] : [x + c, y + s, z];
    const off = { x: [t / 2 + 0.005, 0, 0], y: [0, t / 2 + 0.005, 0], z: [0, 0, t / 2 + 0.005] }[axis];
    for (const sg of [-1, 1]) add(g, hexNut(R * 0.16 + 0.006, 0.01, axis), 'acier', pos[0] + off[0] * sg, pos[1] + off[1] * sg, pos[2] + off[2] * sg);
  }
}
// Manomètre (cadran face à la direction n)
function gauge(g, at, face, d = 0.064) {
  const grp = new THREE.Group(); grp.position.set(...at);
  grp.lookAt(new THREE.Vector3(...at).add(new THREE.Vector3(...face)));
  g.add(grp);
  const body = add(grp, cylAx(d / 2, 0.028, 'z', 40), 'acier'); body.userData.partId = g.userData.id;
  const f = add(grp, new THREE.CircleGeometry(d / 2 - 0.003, 40), 'cadran', 0, 0, 0.0145, true); f.userData.partId = g.userData.id;
  const n = add(grp, box(0.0015, d * 0.38, 0.001, 0), 'noir', 0.004, 0.005, 0.0155); n.rotation.z = -0.9; n.userData.partId = g.userData.id;
  const gl = add(grp, new THREE.CircleGeometry(d / 2 - 0.002, 40), 'verre', 0, 0, 0.017, true); gl.castShadow = false; gl.userData.partId = g.userData.id;
  const st = add(grp, cylAx(0.006, 0.03, 'z', 12), 'laiton', 0, 0, -0.028); st.userData.partId = g.userData.id;
  return grp;
}
// Vanne à bille avec levier (le long d'un axe X ou Y), poignée de couleur c
function ballValve(g, at, axis, size = 0.06, handle = 'jaune') {
  const [x, y, z] = at;
  add(g, cylAx(size * 0.62, size * 1.1, axis, 6), 'laiton', x, y, z);
  add(g, box(size * 0.95, size * 0.95, size * 0.95, size * 0.2), 'laiton', x, y, z);
  const stemUp = axis === 'y' ? [0, 0, 1] : [0, 1, 0];
  const sx = x + stemUp[0] * size * 0.6, sy = y + stemUp[1] * size * 0.6, sz = z + stemUp[2] * size * 0.6;
  add(g, cylAx(size * 0.12, size * 0.35, axis === 'y' ? 'z' : 'y', 12), 'acier', sx, sy, sz);
  const L = size * 3.2;
  const lever = axis === 'y' ? box(0.008, L, size * 0.28, 0.003) : axis === 'x' ? box(L, 0.008, size * 0.28, 0.003) : box(size * 0.28, 0.008, L, 0.003);
  const h = add(g, lever, handle,
    sx + (axis === 'x' ? L / 2 - size * 0.2 : 0) + stemUp[0] * size * 0.2,
    sy + (axis === 'y' ? L / 2 - size * 0.2 : 0) + stemUp[1] * size * 0.2,
    sz + (axis === 'z' ? L / 2 - size * 0.2 : 0) + stemUp[2] * size * 0.2);
  // vinyle de la poignée
  const grip = axis === 'x' ? box(L * 0.45, 0.016, size * 0.36, 0.006) : axis === 'y' ? box(0.016, L * 0.45, size * 0.36, 0.006) : box(size * 0.36, 0.016, L * 0.45, 0.006);
  add(g, grip, 'rougeVif', h.position.x + (axis === 'x' ? L * 0.25 : 0), h.position.y + (axis === 'y' ? L * 0.25 : 0), h.position.z + (axis === 'z' ? L * 0.25 : 0));
}

// ---------- Cotes provisoires ----------
const L = 2.44;          // longueur du patin (8 pi)
const W = 1.12;          // largeur du patin
const RAIL_H = 0.2;      // hauteur des longerons (profilé en C de 8 po)
const Y0 = RAIL_H + 0.006; // dessus du plancher en tôle larmée
const XM = -0.62, YM = Y0 + 0.07 + 0.21; // moteur (axe Z)
const XB = 0.08, YB = Y0 + 0.06;          // bloc du surcompresseur
const YC = YB + 0.17 + 0.0;               // axe du vilebrequin
const ZP = -0.47;                          // plan des poulies
const PIPE_R = 0.0302;                     // tuyau de 2 po (Ø ext. 60,3 mm)

// =====================================================
// 1. PATIN (skid)
// =====================================================
{
  const g = part('patin', {
    titre: 'Patin (base)', num: '—', fidele: false,
    mat: 'Profilés en C 8 po, tôle larmée 1/4 po',
    note: 'Base soudée de 8 pi x 44 po avec pochettes de fourche et quatre oreilles de levage. Cotes provisoires.'
  }, [0, -0.35, 0]);
  // longerons en C (âme vers l'extérieur)
  for (const s of [-1, 1]) {
    const z = s * (W / 2 - 0.004);
    // âme découpée aux pochettes de fourche
    const cuts = [-L / 2, -0.67, -0.43, 0.43, 0.67, L / 2];
    for (let k = 0; k < cuts.length - 1; k += 2) add(g, box(cuts[k + 1] - cuts[k], RAIL_H, 0.008, 0.002), 'rouge', (cuts[k] + cuts[k + 1]) / 2, RAIL_H / 2, z);
    for (const xc of [-0.55, 0.55]) add(g, box(0.24, RAIL_H - 0.116, 0.008, 0.002), 'rouge', xc, 0.116 + (RAIL_H - 0.116) / 2, z);
    for (const y of [0.006, RAIL_H - 0.006]) add(g, box(L, 0.011, 0.075, 0.003), 'rouge', 0, y, z - s * 0.037);
    // bouts fermés
  }
  for (const sx of [-1, 1]) add(g, box(0.008, RAIL_H, W, 0.002), 'rouge', sx * (L / 2 - 0.004), RAIL_H / 2, 0);
  // traverses
  for (const x of [-0.95, -0.3, 0.3, 0.95]) add(g, box(0.075, RAIL_H - 0.03, W - 0.16, 0.003), 'rouge', x, RAIL_H / 2, 0);
  // pochettes de fourche (tubes rectangulaires traversants)
  for (const x of [-0.55, 0.55]) {
    for (const [yy, hh] of [[0.012, 0.012], [0.104, 0.012]]) add(g, box(0.24, hh, W + 0.02, 0.003), 'rouge', x, yy + hh / 2, 0);
    for (const dx of [-0.114, 0.114]) add(g, box(0.012, 0.104, W + 0.02, 0.003), 'rouge', x + dx, 0.064, 0);
  }
  // plancher en tôle larmée
  add(g, box(L - 0.02, 0.006, W - 0.02, 0.001), 'tole', 0, RAIL_H + 0.003, 0);
  // oreilles de levage aux 4 coins
  const ear = new THREE.Shape();
  ear.moveTo(-0.06, 0); ear.lineTo(0.06, 0); ear.lineTo(0.045, 0.07); ear.absarc(0, 0.07, 0.045, 0, Math.PI, false); ear.closePath();
  ear.holes.push(new THREE.Path().absarc(0, 0.07, 0.022, 0, Math.PI * 2, true));
  const eg = new THREE.ExtrudeGeometry(ear, { depth: 0.019, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002, bevelSegments: 1 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(g, eg.clone(), 'jaune', sx * (L / 2 - 0.12), Y0, sz * (W / 2 - 0.03) - 0.0095);
  }
  // plaque signalétique sur le longeron
  const pl = add(g, new THREE.PlaneGeometry(0.2, 0.1), 'plaque', -0.25, RAIL_H / 2, W / 2 + 0.0005, true);
  pl.castShadow = false;
}

// =====================================================
// 2. MOTEUR ÉLECTRIQUE
// =====================================================
{
  const g = part('moteur', {
    titre: 'Moteur électrique', num: '—', fidele: false,
    mat: 'Moteur TEFC 600 V (puissance à confirmer)',
    note: 'Entraîne le surcompresseur par courroies en V sous le garde. Forme et taille provisoires.'
  }, [0, 0.1, 0.45]);
  const R = 0.19, Lm = 0.56, z0 = 0.05;
  add(g, cylAx(R, Lm, 'z', 48), 'bleu', XM, YM, z0);
  // ailettes de refroidissement
  for (let i = 0; i < 20; i++) {
    const a = i / 20 * Math.PI * 2;
    if (Math.sin(a) < -0.6) continue;
    const f = add(g, box(0.006, 0.03, Lm * 0.92, 0.002), 'bleu', XM + Math.cos(a) * (R + 0.012), YM + Math.sin(a) * (R + 0.012), z0);
    f.rotation.z = a - Math.PI / 2;
  }
  // flasques et capot de ventilateur
  add(g, cylAx(R + 0.012, 0.04, 'z', 48), 'bleu', XM, YM, z0 - Lm / 2 - 0.01);
  add(g, cylAx(R + 0.005, 0.12, 'z', 48), 'bleu', XM, YM, z0 + Lm / 2 + 0.06);
  for (let i = 0; i < 9; i++) add(g, box(0.006, 0.3, 0.006, 0), 'acier', XM - 0.12 + i * 0.03, YM, z0 + Lm / 2 + 0.123);
  // pattes
  for (const z of [z0 - 0.2, z0 + 0.2]) add(g, box(0.36, 0.07, 0.06, 0.006), 'bleu', XM, Y0 + 0.035 + 0.06, z);
  add(g, box(0.42, 0.06, 0.52, 0.004), 'rouge', XM, Y0 + 0.03, z0); // embase avec glissières de tension
  for (const sx of [-1, 1]) for (const z of [z0 - 0.2, z0 + 0.2]) add(g, hexNut(0.024, 0.014), 'acier', XM + sx * 0.15, Y0 + 0.137, z);
  // boîte à bornes
  add(g, box(0.15, 0.1, 0.17, 0.01), 'bleu', XM, YM + R + 0.05, z0 + 0.08);
  add(g, cylAx(0.022, 0.06, 'x', 16), 'noir', XM + 0.1, YM + R + 0.05, z0 + 0.08);
  // arbre et poulie (3 gorges)
  add(g, cylAx(0.024, 0.2, 'z', 20), 'acier', XM, YM, z0 - Lm / 2 - 0.1);
  add(g, cylAx(0.075, 0.07, 'z', 40), 'acier', XM, YM, ZP);
  // plaque moteur
  const pl = add(g, new THREE.PlaneGeometry(0.09, 0.05), 'plaque', XM - R - 0.001, YM, z0 - 0.1, true);
  pl.rotation.y = -Math.PI / 2;
}

// =====================================================
// 3. BLOC DU SURCOMPRESSEUR (2 cylindres en V)
// =====================================================
{
  const g = part('bloc', {
    titre: 'Bloc du surcompresseur', num: '—', fidele: false,
    mat: 'Fonte, cylindres à ailettes',
    note: 'Bloc à pistons qui relève la pression de l\'air de la mine pour le marteau fond de trou. Deux cylindres en V : forme provisoire.'
  }, [0, 0.45, 0]);
  // carter
  add(g, box(0.42, 0.26, 0.34, 0.03), 'bloc', XB, YB + 0.13, 0);
  add(g, box(0.5, 0.025, 0.4, 0.006), 'bloc', XB, YB + 0.0125, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(g, hexNut(0.024, 0.014), 'acier', XB + sx * 0.22, YB + 0.032, sz * 0.17);
  // jauge d'huile et bouchon de vidange
  add(g, cylAx(0.03, 0.012, 'x', 24), 'verre', XB + 0.212, YB + 0.07, 0.08);
  add(g, cylAx(0.034, 0.01, 'x', 24), 'acier', XB + 0.208, YB + 0.07, 0.08);
  add(g, cylAx(0.008, 0.08, 'y', 12), 'jaune', XB - 0.15, YB + 0.29, 0.12);
  // cylindres en V à ±45°
  for (const s of [-1, 1]) {
    const cg = new THREE.Group();
    cg.position.set(XB, YB + 0.24, 0);
    cg.rotation.z = s * Math.PI / 4;
    cg.userData.id = 'bloc';
    g.add(cg);
    const rc = s < 0 ? 0.085 : 0.065; // 1er étage plus gros
    add(cg, cyl(rc, 0.22, 40), 'bloc', 0, 0.13, 0);
    for (let i = 0; i < 9; i++) add(cg, cyl(rc + 0.035, 0.007, 40), 'bloc', 0, 0.045 + i * 0.022, 0);
    add(cg, box(rc * 2 + 0.06, 0.06, rc * 2 + 0.06, 0.012), 'bloc', 0, 0.27, 0);
    for (const dx of [-1, 1]) for (const dz of [-1, 1]) add(cg, hexNut(0.019, 0.016), 'acier', dx * (rc + 0.015), 0.305, dz * (rc + 0.015));
  }
  // volant-poulie à ailettes (côté garde)
  add(g, cylAx(0.03, 0.26, 'z', 20), 'acier', XB, YC, -0.3);
  add(g, cylAx(0.25, 0.065, 'z', 64), 'bloc', XB, YC, ZP);
  for (let i = 0; i < 6; i++) { const sp = add(g, box(0.02, 0.2, 0.03, 0.004), 'bloc', XB, YC, ZP + 0.05); sp.rotation.z = i * Math.PI / 3; sp.position.x += Math.sin(-i * Math.PI / 3) * 0.12; sp.position.y += Math.cos(i * Math.PI / 3) * 0.12; }
  // courroies (3) entre les poulies
  const belts = [];
  for (const dz of [-0.02, 0, 0.02]) {
    const pts = [];
    const r1 = 0.07, r2 = 0.245, a = new THREE.Vector2(XM, YM), b = new THREE.Vector2(XB, YC);
    const d = b.clone().sub(a), Ld = d.length(), ang = Math.atan2(d.y, d.x), beta = Math.asin((r2 - r1) / Ld);
    for (let k = 0; k <= 40; k++) { const t = ang + Math.PI / 2 + beta + k / 40 * (Math.PI - 2 * beta); pts.push(new THREE.Vector3(a.x + Math.cos(t) * r1, a.y + Math.sin(t) * r1, ZP + dz)); }
    for (let k = 0; k <= 60; k++) { const t = ang - Math.PI / 2 - beta + k / 60 * (Math.PI + 2 * beta); pts.push(new THREE.Vector3(b.x + Math.cos(t + Math.PI) * -r2, b.y + Math.sin(t + Math.PI) * -r2, ZP + dz)); }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    belts.push(new THREE.TubeGeometry(curve, 160, 0.0075, 6, true));
  }
  add(g, mergeGeometries(belts), 'caoutchouc', 0, 0, 0, true);
}

// =====================================================
// 4. GARDE-COURROIE
// =====================================================
{
  const g = part('garde', {
    titre: 'Garde-courroie', num: '—', fidele: false,
    mat: 'Tôle 12 ga, peinte jaune sécurité',
    note: 'Couvre les poulies et les courroies. Ne jamais faire fonctionner sans garde. Forme provisoire.'
  }, [0, 0, -0.4]);
  const s = new THREE.Shape();
  const r1 = 0.13, r2 = 0.31;
  // enveloppe des deux poulies
  const a = new THREE.Vector2(XM, YM), b = new THREE.Vector2(XB, YC);
  const d = b.clone().sub(a), ang = Math.atan2(d.y, d.x), beta = Math.asin((r2 - r1) / d.length());
  s.absarc(a.x, a.y, r1, ang + Math.PI / 2 + beta, ang + 3 * Math.PI / 2 - beta, false);
  s.absarc(b.x, b.y, r2, ang - Math.PI / 2 - beta, ang + Math.PI / 2 + beta, false);
  s.closePath();
  const depth = 0.16;
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2, curveSegments: 40 });
  add(g, geo, 'jaune', 0, 0, ZP - 0.1);
  // ouïes de ventilation (plaque avant)
  for (let i = 0; i < 5; i++) add(g, box(0.18, 0.012, 0.004, 0.002), 'bloc', XB - 0.02, YC - 0.12 + i * 0.05, ZP - 0.109);
  // boulons de fixation
  for (const [x, y] of [[XM - 0.08, YM + 0.08], [XB + 0.2, YC + 0.12], [XB + 0.2, YC - 0.15], [XM + 0.1, YM - 0.12]]) add(g, hexNut(0.019, 0.012, 'z'), 'acier', x, y, ZP - 0.114);
  // pattes vers le patin
  for (const x of [XM, XB]) add(g, box(0.05, 0.25, 0.006, 0.002), 'jaune', x, Y0 + 0.125, ZP - 0.09);
  // autocollant de danger (rectangle)
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 192;
  const c = cv.getContext('2d');
  c.fillStyle = '#f4f1e8'; c.fillRect(0, 0, 512, 192);
  c.fillStyle = '#c4161c'; c.fillRect(0, 0, 512, 60);
  c.fillStyle = '#fff'; c.font = '900 46px Arial'; c.fillText('DANGER', 160, 47);
  c.fillStyle = '#111'; c.font = '700 30px Arial'; c.fillText('Pièces en mouvement.', 26, 108); c.fillText('Cadenasser avant d\'ouvrir.', 26, 150);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const lab = add(g, new THREE.PlaneGeometry(0.21, 0.079), new THREE.MeshStandardMaterial({ name: 'M_Etiquette_Danger', map: t, roughness: 0.55 }), (XM + XB) / 2 - 0.02, (YM + YC) / 2 + 0.06, ZP - 0.1095, true);
  lab.rotation.y = Math.PI; lab.castShadow = false;
}

// =====================================================
// 5. FILTRE À AIR (admission, 2 po)
// =====================================================
const XF = -1.0, ZF = 0.3;
{
  const g = part('filtre', {
    titre: 'Filtre à air (admission)', num: '—', fidele: false,
    mat: 'Tête en fonte d\'alu, cuve métallique avec voyant, purge au bas',
    note: 'Filtre l\'air de la mine avant le surcompresseur. Purger l\'eau au robinet du bas. Forme provisoire.'
  }, [0, 0.4, 0.2]);
  const yTop = Y0 + 0.62;
  add(g, box(0.13, 0.11, 0.13, 0.015), 'gris', XF, yTop, ZF);
  add(g, cyl(0.07, 0.05, 40), 'gris', XF, yTop - 0.075, ZF);
  add(g, cyl(0.062, 0.3, 40), 'gris', XF, yTop - 0.25, ZF);
  add(g, box(0.02, 0.18, 0.004, 0.002), 'verre', XF, yTop - 0.24, ZF + 0.063); // voyant
  add(g, cyl(0.03, 0.05, 20), 'gris', XF, yTop - 0.42, ZF);
  ballValve(g, [XF, yTop - 0.47, ZF], 'y', 0.018, 'jaune');
  // support du filtre (cornière boulonnée au plancher)
  add(g, box(0.05, yTop - Y0 - 0.05, 0.006, 0.002), 'rouge', XF, Y0 + (yTop - Y0 - 0.05) / 2, ZF - 0.07);
  add(g, box(0.08, 0.006, 0.06, 0.002), 'rouge', XF, Y0 + 0.003, ZF - 0.07);
  // conduite filtre -> bloc (1er étage)
  add(g, pipeGeo([[XF + 0.065, yTop, ZF], [XB - 0.35, yTop, ZF], [XB - 0.35, yTop, 0.0], [XB - 0.23, YB + 0.47, 0]], PIPE_R, 0.09), 'galva', 0, 0, 0, false);
}

// =====================================================
// 6. REFROIDISSEUR D'EAU (après-refroidisseur à faisceau)
// =====================================================
const XC0 = 0.3, XC1 = 1.05, YCO = Y0 + 0.78, ZCO = 0.34, RCO = 0.09;
{
  const g = part('refroidisseur', {
    titre: 'Refroidisseur d\'eau', num: '—', fidele: false,
    mat: 'Calandre acier, faisceau de tubes, eau de la mine',
    note: 'Refroidit l\'air comprimé avec l\'eau de la mine (entrée et sortie d\'eau en 3/4 po sur le dessus, purge au bas). Forme provisoire.'
  }, [0, 0.35, 0.35]);
  const xc = (XC0 + XC1) / 2, len = XC1 - XC0;
  add(g, cylAx(RCO, len, 'x', 48), 'gris', xc, YCO, ZCO);
  for (const x of [XC0 - 0.012, XC1 + 0.012]) flange(g, 'gris', [x, YCO, ZCO], 'x', RCO + 0.03, 0.022, 8, RCO + 0.012);
  for (const [x, s] of [[XC0 - 0.05, -1], [XC1 + 0.05, 1]]) add(g, cylAx(RCO * 0.85, 0.06, 'x', 40, RCO * 0.85), 'gris', x, YCO, ZCO);
  // berceaux et poteaux
  for (const x of [XC0 + 0.1, XC1 - 0.1]) {
    add(g, box(0.06, YCO - RCO - Y0, 0.06, 0.004), 'rouge', x, Y0 + (YCO - RCO - Y0) / 2, ZCO);
    add(g, box(0.08, 0.03, 0.2, 0.004), 'rouge', x, YCO - RCO - 0.012, ZCO);
    const strap = new THREE.TorusGeometry(RCO + 0.004, 0.005, 8, 40, Math.PI);
    strap.rotateY(Math.PI / 2);
    add(g, strap, 'acier', x, YCO, ZCO);
    add(g, box(0.12, 0.008, 0.12, 0.002), 'rouge', x, Y0 + 0.004, ZCO);
  }
  // entrées / sorties d'eau (3/4 po) avec vannes à bille bleues... poignées jaunes ici
  for (const [x, lbl] of [[XC0 + 0.18, 'in'], [XC1 - 0.18, 'out']]) {
    add(g, cyl(0.014, 0.08, 16), 'galva', x, YCO + RCO + 0.04, ZCO);
    ballValve(g, [x, YCO + RCO + 0.1, ZCO], 'y', 0.026, 'jaune');
    add(g, cyl(0.012, 0.06, 16), 'laiton', x, YCO + RCO + 0.16, ZCO);
    for (let i = 0; i < 3; i++) add(g, cyl(0.0135, 0.006, 16), 'laiton', x, YCO + RCO + 0.15 + i * 0.012, ZCO);
  }
  // purge
  add(g, cyl(0.01, 0.05, 12), 'galva', xc, YCO - RCO - 0.025, ZCO + 0.05);
  ballValve(g, [xc, YCO - RCO - 0.06, ZCO + 0.05], 'y', 0.014, 'jaune');
  // conduite bloc (2e étage) -> refroidisseur
  add(g, pipeGeo([[XB + 0.2, YB + 0.47, 0], [XB + 0.12, YB + 0.62, 0], [XC0 - 0.12, YB + 0.62, 0], [XC0 - 0.12, YCO, ZCO], [XC0 - 0.07, YCO, ZCO]], PIPE_R * 0.8, 0.08), 'galva');
  // soupape de sûreté inter-étage
  add(g, cyl(0.014, 0.06, 16), 'laiton', XC0 - 0.12, YB + 0.66, 0.04);
  add(g, cyl(0.02, 0.05, 16), 'laiton', XC0 - 0.12, YB + 0.71, 0.04);
  add(g, cyl(0.004, 0.03, 8), 'laiton', XC0 - 0.12, YB + 0.75, 0.04);
}

// =====================================================
// 7. RECEIVER (réservoir d'air vertical)
// =====================================================
const XR = 0.72, ZR = -0.22, RR = 0.24, YR0 = Y0 + 0.18, YR1 = Y0 + 1.05;
{
  const g = part('receiver', {
    titre: 'Receiver (réservoir d\'air)', num: '—', fidele: false,
    mat: 'Réservoir sous pression (ASME), soupape de sûreté, manomètre, purge',
    note: 'Accumule l\'air surcomprimé et amortit les pulsations. Purger chaque quart. Ne jamais boucher la soupape. Volume et pression à confirmer.'
  }, [0.25, 0.3, -0.2]);
  const h = YR1 - YR0;
  add(g, cyl(RR, h, 56), 'gris', XR, (YR0 + YR1) / 2, ZR);
  for (const [y, s] of [[YR1, 1], [YR0, -1]]) {
    const head = new THREE.SphereGeometry(RR, 56, 20, 0, Math.PI * 2, 0, Math.PI / 2);
    head.scale(1, 0.5, 1);
    if (s < 0) head.rotateX(Math.PI);
    add(g, head, 'gris', XR, y, ZR);
  }
  // pattes
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * Math.PI * 2 + 0.5;
    const lx = XR + Math.cos(a) * RR * 0.8, lz = ZR + Math.sin(a) * RR * 0.8;
    add(g, box(0.05, YR0 - Y0 + 0.02, 0.05, 0.004), 'gris', lx, Y0 + (YR0 - Y0 + 0.02) / 2, lz);
    add(g, box(0.1, 0.01, 0.1, 0.002), 'gris', lx, Y0 + 0.005, lz);
    add(g, hexNut(0.024, 0.014), 'acier', lx + 0.035, Y0 + 0.017, lz);
  }
  // soupape de sûreté (dessus)
  const yt = YR1 + RR * 0.5;
  add(g, cyl(0.018, 0.05, 16), 'galva', XR, yt + 0.02, ZR);
  add(g, cyl(0.03, 0.06, 20), 'laiton', XR, yt + 0.07, ZR);
  add(g, new THREE.CylinderGeometry(0.012, 0.024, 0.06, 16), 'laiton', XR, yt + 0.13, ZR);
  const ring = new THREE.TorusGeometry(0.013, 0.003, 8, 20); add(g, ring, 'laiton', XR, yt + 0.175, ZR);
  // manomètre
  add(g, pipeGeo([[XR - RR + 0.01, YR1 - 0.12, ZR], [XR - RR - 0.06, YR1 - 0.12, ZR]], 0.008, 0.02), 'laiton');
  gauge(g, [XR - RR - 0.08, YR1 - 0.12, ZR], [-1, 0, -0.3], 0.1);
  // purge au bas
  add(g, pipeGeo([[XR, YR0 - RR * 0.5, ZR], [XR, Y0 + 0.07, ZR], [XR - 0.15, Y0 + 0.07, ZR]], 0.011, 0.03), 'galva');
  ballValve(g, [XR - 0.17, Y0 + 0.07, ZR], 'x', 0.022, 'jaune');
  // entrée depuis le refroidisseur
  add(g, pipeGeo([[XC1 + 0.07, YCO, ZCO], [XC1 + 0.14, YCO, ZCO], [XC1 + 0.14, YCO, ZR], [XR + RR - 0.01, YCO, ZR]], PIPE_R, 0.09), 'galva');
  // plaque de conformité
  const pl = add(g, new THREE.PlaneGeometry(0.12, 0.06), 'plaque', XR, (YR0 + YR1) / 2, ZR - RR - 0.001, true);
  pl.rotation.y = Math.PI; pl.castShadow = false;
}

// =====================================================
// 8. RACCORDS DE 2 PO (entrée et sortie)
// =====================================================
// Raccord à griffes (« pied de poule ») 2 po, tourné vers dir (±1 en X)
function clawCoupling(g, x, y, z, dir) {
  add(g, cylAx(0.042, 0.05, 'x', 32), 'acier', x, y, z);
  add(g, hexNut(0.075, 0.03, 'x'), 'acier', x - dir * 0.03, y, z);
  for (const s of [-1, 1]) {
    const lug = add(g, box(0.03, 0.022, 0.03, 0.005), 'acier', x + dir * 0.03, y + s * 0.045, z);
    lug.rotation.x = s * 0.05;
  }
  add(g, cylAx(0.04, 0.012, 'x', 32), 'caoutchouc', x + dir * 0.028, y, z);
  // goupille de sécurité
  add(g, cylAx(0.004, 0.07, 'z', 8), 'acier', x + dir * 0.01, y + 0.045, z);
}
// Câble de sécurité (fouet) en boucle autour du raccord
function whipCheck(g, x, y, z, dir) {
  const pts = [];
  for (let k = 0; k <= 30; k++) {
    const t = k / 30;
    pts.push(new THREE.Vector3(x - dir * 0.08 + dir * 0.28 * t, y - 0.01 - Math.sin(t * Math.PI) * 0.05, z + Math.sin(t * Math.PI * 2) * 0.03));
  }
  add(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.004, 6), 'galva');
  for (const t of [0, 1]) add(g, new THREE.TorusGeometry(0.05, 0.005, 8, 24), 'galva', x - dir * 0.08 + dir * 0.28 * t, y, z).rotation.y = Math.PI / 2;
}
{
  const g = part('raccords', {
    titre: 'Raccords de 2 po', num: '—', fidele: false,
    mat: 'Tuyau 2 po, vannes à bille 2 po, raccords à griffes avec câbles de sécurité',
    note: 'Entrée (bout -X, air du réseau de la mine) et sortie (bout +X, vers la foreuse à 7 m). Vanne fermée et purgée avant de débrancher ; câble de sécurité à chaque raccord.'
  }, [0, 0.2, 0]);
  // entrée
  const yi = Y0 + 0.62;
  add(g, pipeGeo([[-L / 2 - 0.16, yi, ZF], [XF - 0.065, yi, ZF]], PIPE_R), 'galva');
  ballValve(g, [-L / 2 + 0.05, yi, ZF], 'x', 0.07, 'jaune');
  clawCoupling(g, -L / 2 - 0.19, yi, ZF, -1);
  whipCheck(g, -L / 2 - 0.19, yi, ZF, -1);
  // sortie depuis le dessus du receiver
  const yo = YR1 + 0.04;
  add(g, pipeGeo([[XR + 0.08, YR1 + RR * 0.35, ZR], [XR + 0.08, yo + 0.12, ZR], [XR + 0.3, yo + 0.12, ZR], [XR + 0.3, yo - 0.25, ZR], [L / 2 + 0.16, yo - 0.25, ZR]], PIPE_R, 0.08), 'galva');
  ballValve(g, [L / 2 - 0.02, yo - 0.25, ZR], 'x', 0.07, 'jaune');
  clawCoupling(g, L / 2 + 0.19, yo - 0.25, ZR, 1);
  whipCheck(g, L / 2 + 0.19, yo - 0.25, ZR, 1);
  // collier de support de la sortie
  add(g, box(0.05, yo - 0.25 - Y0 - PIPE_R, 0.05, 0.004), 'rouge', L / 2 - 0.12, Y0 + (yo - 0.25 - Y0 - PIPE_R) / 2, ZR);
  const cl = new THREE.TorusGeometry(PIPE_R + 0.005, 0.005, 8, 24, Math.PI); cl.rotateY(Math.PI / 2);
  add(g, cl, 'acier', L / 2 - 0.12, yo - 0.25, ZR);
  // manomètres entrée / sortie
  add(g, cyl(0.007, 0.06, 10), 'laiton', -L / 2 + 0.17, yi + 0.06, ZF);
  gauge(g, [-L / 2 + 0.17, yi + 0.12, ZF], [0, 0.15, 1], 0.064);
}

// =====================================================
// 9. DÉMARREUR ÉLECTRIQUE
// =====================================================
{
  const g = part('demarreur', {
    titre: 'Démarreur et sectionneur', num: '—', fidele: false,
    mat: 'Boîtier NEMA 4, poignée de sectionneur cadenassable, boutons marche / arrêt',
    note: 'Point de cadenassage du surcompresseur. Câble d\'alimentation 600 V par presse-étoupe au bas. Forme provisoire.'
  }, [0, 0, -0.35]);
  const x = -0.98, z = -0.3, yb = Y0 + 1.0;
  // poteau
  add(g, box(0.08, yb - Y0, 0.04, 0.003), 'rouge', x, Y0 + (yb - Y0) / 2, z);
  add(g, box(0.18, 0.01, 0.14, 0.002), 'rouge', x, Y0 + 0.005, z);
  // boîtier
  add(g, box(0.4, 0.5, 0.22, 0.01), 'gris', x, yb, z - 0.13);
  add(g, box(0.37, 0.47, 0.012, 0.004), 'gris', x, yb, z - 0.245);
  for (const dy of [-0.18, 0, 0.18]) add(g, cylAx(0.012, 0.03, 'y', 12), 'acier', x + 0.19, yb + dy, z - 0.245);
  // poignée du sectionneur
  add(g, box(0.05, 0.12, 0.03, 0.006), 'noir', x + 0.14, yb + 0.05, z - 0.265);
  add(g, box(0.025, 0.14, 0.04, 0.008), 'rougeVif', x + 0.14, yb + 0.1, z - 0.285);
  // boutons
  add(g, cylAx(0.017, 0.025, 'z', 24), 'vert', x - 0.08, yb + 0.12, z - 0.262);
  add(g, cylAx(0.019, 0.025, 'z', 24), 'rougeVif', x - 0.08, yb + 0.04, z - 0.262);
  add(g, cylAx(0.016, 0.02, 'z', 24), 'cadran', x - 0.08, yb - 0.04, z - 0.258);
  // presse-étoupe et câble
  add(g, cyl(0.025, 0.04, 16), 'noir', x - 0.05, yb - 0.27, z - 0.13);
  add(g, pipeGeo([[x - 0.05, yb - 0.29, z - 0.13], [x - 0.05, Y0 + 0.2, z - 0.13], [x - 0.2, Y0 + 0.05, z - 0.2], [-L / 2 - 0.25, 0.03, z - 0.25]], 0.018, 0.12, 12), 'caoutchouc');
  // câble démarreur -> moteur
  add(g, pipeGeo([[x + 0.05, yb - 0.29, z - 0.13], [x + 0.05, Y0 + 0.12, z - 0.13], [XM + 0.1, Y0 + 0.12, 0.13], [XM + 0.1, YM + 0.19 + 0.05, 0.13]], 0.012, 0.08, 10), 'caoutchouc');
}

// ---------- Cotes hors-tout ----------
const dims = new THREE.Group();
scene.add(dims);
function label(text) {
  const cv = document.createElement('canvas'); const ctx = cv.getContext('2d');
  ctx.font = '600 44px system-ui, sans-serif';
  const w = ctx.measureText(text).width + 36; cv.width = w; cv.height = 68;
  ctx.font = '600 44px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.strokeStyle = '#1a4d8f'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(2, 2, w - 4, 64, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1a4d8f'; ctx.textBaseline = 'middle'; ctx.fillText(text, 18, 36);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
  sp.scale.set(w / 68 * 0.09, 0.09, 1); sp.renderOrder = 10;
  return sp;
}
function dimLine(a, b, text, off) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), O = new THREE.Vector3(...off);
  const pts = [A, A.clone().add(O), A.clone().add(O), B.clone().add(O), B.clone().add(O), B];
  const l = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x6fa0e8, depthTest: false }));
  l.renderOrder = 9; dims.add(l);
  const s = label(text); s.position.copy(A.clone().add(B).multiplyScalar(0.5).add(O).add(O.clone().normalize().multiplyScalar(0.06)));
  dims.add(s);
}
const bb = new THREE.Box3().setFromObject(root);
const fmt = v => `${v.toFixed(2).replace('.', ',')} m`;
dimLine([bb.min.x, 0.002, bb.max.z], [bb.max.x, 0.002, bb.max.z], `${fmt(bb.max.x - bb.min.x)} hors-tout (provisoire)`, [0, 0, 0.3]);
dimLine([bb.max.x, 0.002, bb.min.z], [bb.max.x, 0.002, bb.max.z], fmt(bb.max.z - bb.min.z), [0.3, 0, 0]);
dimLine([bb.max.x, 0, bb.min.z], [bb.max.x, bb.max.y, bb.min.z], fmt(bb.max.y), [0.25, 0, 0]);
dims.visible = false;
document.getElementById('dimtxt').textContent = `${fmt(bb.max.x - bb.min.x)} × ${fmt(bb.max.z - bb.min.z)} × ${fmt(bb.max.y)} (provisoire)`;

// ---------- Interface ----------
const list = document.getElementById('parts');
const info = document.getElementById('info');
let selected = null;
PARTS.forEach(g => {
  g.userData.base = g.position.clone();
  const d = g.userData;
  const li = document.createElement('li');
  li.innerHTML = `<label><input type="checkbox" checked><span class="dot ${d.fidele ? 'ok' : 'approx'}"></span><span class="t">${d.titre}</span></label><span class="n">${d.mat}</span>`;
  li.querySelector('input').addEventListener('change', e => { g.visible = e.target.checked; });
  li.addEventListener('click', e => { if (e.target.tagName !== 'INPUT') select(d.id, true); });
  li.dataset.id = d.id;
  list.appendChild(li);
});
// matériaux propres à chaque pièce pour la surbrillance (partagés à l'export)
const origMat = new Map();
function setHighlight(g, on) {
  g.traverse(o => {
    if (!o.isMesh) return;
    if (on) { origMat.set(o, o.material); const m = o.material.clone(); if (m.emissive) { m.emissive.setHex(0x3a6fd8); m.emissiveIntensity = 0.35; } o.material = m; }
    else if (origMat.has(o)) { o.material.dispose(); o.material = origMat.get(o); origMat.delete(o); }
  });
}
function select(id, focus) {
  if (selected) setHighlight(partById[selected], false);
  document.querySelectorAll('#parts li').forEach(li => li.classList.toggle('sel', li.dataset.id === id));
  selected = id;
  if (!id) { info.hidden = true; return; }
  const g = partById[id]; setHighlight(g, true);
  const d = g.userData;
  info.hidden = false;
  info.innerHTML = `<button class="x" aria-label="Fermer">×</button>
    <div class="badge ${d.fidele ? 'ok' : 'approx'}">${d.fidele ? 'D\'après les plans' : 'Forme provisoire'}</div>
    <h3>${d.titre}</h3>
    <dl><dt>N° de pièce</dt><dd>${d.num}</dd>${d.mat ? `<dt>Matériel</dt><dd>${d.mat}</dd>` : ''}
    <dt>Source</dt><dd>PRO-OP-ITH-004 (aucun plan)</dd></dl>
    <p>${d.note}</p>`;
  info.querySelector('.x').onclick = () => select(null);
  if (focus) {
    const b = new THREE.Box3().setFromObject(g); const c = b.getCenter(new THREE.Vector3());
    tweenTo(c, camera.position.clone().sub(controls.target).add(c));
  }
}
const ray = new THREE.Raycaster(); const mouse = new THREE.Vector2();
let down = null;
renderer.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
  const r = renderer.domElement.getBoundingClientRect();
  mouse.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects(root.children, true).find(h => h.object.isMesh && isVisible(h.object));
  select(hit ? findPart(hit.object) : null, false);
});
const isVisible = o => { while (o) { if (!o.visible) return false; o = o.parent; } return true; };
const findPart = o => { while (o) { if (PARTS.includes(o)) return o.name; o = o.parent; } return null; };

const slider = document.getElementById('explode');
let explodeT = 0;
slider.addEventListener('input', () => { explodeT = +slider.value; applyExplode(); });
function applyExplode() { PARTS.forEach(g => g.position.copy(g.userData.base).addScaledVector(g.userData.explode, explodeT)); }

document.querySelectorAll('[data-toggle]').forEach(btn => {
  btn.addEventListener('click', () => {
    const k = btn.dataset.toggle; const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', on);
    if (k === 'cotes') dims.visible = on;
    if (k === 'garde') { partById.garde.visible = on; const li = document.querySelector('#parts li[data-id="garde"] input'); if (li) li.checked = on; }
  });
});

const VIEWS = {
  iso: [[3.1, 2.0, 3.0], [0, 0.6, 0]],
  cote: [[0, 0.8, 4.4], [0, 0.6, 0]],
  garde: [[0, 0.9, -4.2], [0, 0.6, 0]],
  entree: [[-4.4, 0.9, 0.3], [0, 0.6, 0]],
  dessus: [[0, 5, 0.01], [0, 0, 0]],
  operateur: [[-2.2, 1.65, -2.0], [-0.6, 0.8, -0.2]],
};
let tween = null;
function tweenTo(target, pos, ms = 700) { tween = { t0: performance.now(), ms, fromP: camera.position.clone(), fromT: controls.target.clone(), toP: pos, toT: target }; }
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {
  const [p, t] = VIEWS[b.dataset.view]; tweenTo(new THREE.Vector3(...t), new THREE.Vector3(...p));
}));

// ---------- Export GLB (mètres, pour Unreal) ----------
async function exportGLB() {
  const t = explodeT; explodeT = 0; applyExplode();
  if (selected) select(null);
  const vis = PARTS.map(g => g.visible); PARTS.forEach(g => (g.visible = true));
  root.updateMatrixWorld(true);
  const glb = await new GLTFExporter().parseAsync(root, { binary: true, onlyVisible: true, maxTextureSize: 1024 });
  PARTS.forEach((g, i) => (g.visible = vis[i]));
  explodeT = t; applyExplode();
  return glb;
}
document.getElementById('glb').addEventListener('click', async e => {
  e.target.disabled = true; e.target.textContent = 'Export…';
  const glb = await exportGLB();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([glb], { type: 'model/gltf-binary' }));
  a.download = 'SM_Surcompresseur.glb'; a.click();
  e.target.disabled = false; e.target.textContent = 'GLB pour Unreal';
});

controls.target.set(...VIEWS.iso[1]);
camera.position.set(...VIEWS.iso[0]);
function resize() { const w = app.clientWidth, h = app.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
window.addEventListener('resize', resize); resize();
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
renderer.setAnimationLoop(now => {
  if (tween) {
    const k = Math.min(1, (now - tween.t0) / tween.ms), e = ease(k);
    camera.position.lerpVectors(tween.fromP, tween.toP, e);
    controls.target.lerpVectors(tween.fromT, tween.toT, e);
    if (k >= 1) tween = null;
  }
  controls.update();
  renderer.render(scene, camera);
});
window.__scene = { scene, root, camera, controls, select, VIEWS, tweenTo, renderer, exportGLB, PARTS };

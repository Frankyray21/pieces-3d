// Compresseur simple R-55 (MRI) : modèle 3D bâti à partir des plans
// Unités : pouces. Axe X = longueur, Y = hauteur (0 = dessus du frame), Z = largeur.
// Côté -Z = côté garde-courroie et cadrans (vue du plan 35290000).
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// ---------- Scène ----------
const app = document.getElementById('viewport');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe9ebee);
scene.fog = new THREE.Fog(0xe9ebee, 600, 1400);

scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;
const camera = new THREE.PerspectiveCamera(35, 1, 1, 5000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 12, 0);
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 60;
controls.maxDistance = 900;

scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f98, 1.1));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(120, 220, 160);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, near: 10, far: 600 });
sun.shadow.bias = -0.0005;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xffffff, 0.6);
fill.position.set(-160, 90, -140);
scene.add(fill);

const GROUND_Y = -28.5;
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(420, 64),
  new THREE.MeshStandardMaterial({ color: 0xd9dce0, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = GROUND_Y;
ground.receiveShadow = true;
scene.add(ground);
const grid = new THREE.GridHelper(480, 40, 0xb8bcc2, 0xc9ccd1);
grid.position.y = GROUND_Y + 0.05;
scene.add(grid);

const root = new THREE.Group();
scene.add(root);

// ---------- Matériaux ----------
const COLORS = {
  rouge: 0xa8201a, acier: 0x3a3f45, gris: 0x8d939a, noir: 0x161718,
  inox: 0xc4c9ce, blanc: 0xf2f2ee, laiton: 0xb08d3c, jaune: 0xe0b020,
};
function mat(c, o = {}) {
  return new THREE.MeshStandardMaterial({ color: COLORS[c] ?? c, metalness: 0.35, roughness: 0.55, ...o });
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
function add(g, geo, material, x = 0, y = 0, z = 0, edges = true) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  m.userData.partId = g.name;
  g.add(m);
  if (edges) {
    const e = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo, 35),
      new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 })
    );
    e.userData.isEdge = true;
    m.add(e);
  }
  return m;
}
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (r, h, s = 32) => new THREE.CylinderGeometry(r, r, h, s);
function extrudeXY(pts, depth, holes = []) {
  const s = new THREE.Shape(pts.map(p => new THREE.Vector2(...p)));
  holes.forEach(h => s.holes.push(h));
  return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
}
// Forme en plan (x, z) extrudée verticalement : la plaque va de y=0 vers le bas (épaisseur t)
function plateXZ(pts, t) {
  const g = extrudeXY(pts, t);
  g.rotateX(Math.PI / 2);
  return g;
}
function roundedRectPath(x, y, w, h, r) {
  const p = new THREE.Path();
  p.moveTo(x + r, y);
  p.lineTo(x + w - r, y); p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r); p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h); p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r); p.quadraticCurveTo(x, y, x + r, y);
  return p;
}

// ---------- Cotes principales (plans 35290100, 35283110, 351233100) ----------
const XR = -47.5;      // bout arrière (côté réservoir et cadrans)
const XF = 47.4;       // bout avant (compartiment avant, 94 7/8 po)
const XC = 30.9;       // début du chanfrein / compartiment avant (78 3/8 po)
const ZS = 28.375;     // demi-largeur structure (56 3/4 po)
const ZF = 19;         // demi-largeur du bout avant chanfreiné
const H = 54.125;      // hauteur de la structure au-dessus du frame (54 1/8 po)
const SKID_H = 9;      // hauteur du frame aux bouts
const PLAN = [[XR, -ZS], [XC, -ZS], [XF, -ZF], [XF, ZF], [XC, ZS], [XR, ZS]];
const PLAN_SKID = [[XR, -27.5], [XC + 1, -27.5], [XF, -18.5], [XF, 18.5], [XC + 1, 27.5], [XR, 27.5]];

// =====================================================
// 1. FRAME R-55 (351233100)
// =====================================================
{
  const g = part('frame', {
    titre: 'Frame R-55 (base)', num: '351233100', plan: 'FRAME/351233100.pdf',
    mat: 'Acier 44W, plaques 1/4 à 1 po', poids: '2314,9 lb', fidele: true,
    note: 'Base soudée de 94 7/8 po. Le ventre descend vers le centre (vue de côté du plan 35290000).'
  }, [0, -18, 0]);
  const m = mat('rouge');
  add(g, plateXZ(PLAN_SKID, SKID_H), m, 0, 0, 0);
  // ventre en V
  const belly = extrudeXY([[XR + 1, -SKID_H], [-6, -12.5], [6, -12.5], [XF - 1, -SKID_H]], 38);
  add(g, belly, m, 0, 0, -19);
  // plaque de dessus (pontage)
  add(g, plateXZ(PLAN_SKID, 0.5), mat('acier', { roughness: 0.8 }), 0, 0.5, 0);
  // oreilles avec trou aux bouts
  const tab = extrudeXY([[0, 0], [6, 0], [6, 3], [0, 3]], 1, [roundedRectPath(3.6, 0.8, 1.4, 1.4, 0.7)]);
  for (const sx of [-1, 1]) for (const z of [-22, 22]) {
    const t = add(g, tab, m, sx < 0 ? XR - 6 : XF, -6, z - 0.5);
  }
}

// =====================================================
// 2. STRUCTURE (35283110)
// =====================================================
{
  const g = part('structure', {
    titre: 'Structure', num: '35283110', plan: 'FRAME/35283110.pdf',
    mat: 'Acier 44W', poids: '3160,3 lb', fidele: true,
    note: 'Cage soudée : 95 x 56 3/4 po, 54 1/8 po de haut. Bout avant chanfreiné (compartiment de 18 po).'
  });
  const m = mat('rouge');
  const P = 3; // poteaux carrés 3 po
  const posts = [[XR + 1.5, -ZS + 1.5], [XR + 1.5, ZS - 1.5], [XC, -ZS + 1.5], [XC, ZS - 1.5], [XF - 1.5, -ZF + 1.5], [XF - 1.5, ZF - 1.5]];
  posts.forEach(([x, z]) => add(g, box(P, H, P), m, x, H / 2, z));
  // lisse du haut (4 po, de 50 1/8 à 54 1/8) côtés + bouts + chanfreins
  const rail = (x1, z1, x2, z2, h, y, th = 0.5) => {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const r = add(g, box(len, h, th), m, (x1 + x2) / 2, y, (z1 + z2) / 2);
    r.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
  };
  const outline = [...PLAN, PLAN[0]];
  for (let i = 0; i < outline.length - 1; i++) {
    const [x1, z1] = outline[i], [x2, z2] = outline[i + 1];
    rail(x1, z1, x2, z2, 4, H - 2, 0.75);
    rail(x1, z1, x2, z2, 3, 1.5, 0.75); // lisse du bas
  }
  // traverses du dessus
  rail(XC, -ZS, XC, ZS, 4, H - 2, 0.75);
  // tablettes du compartiment avant (24 1/2 et 34 3/4 po)
  for (const y of [24.5, 34.75]) {
    add(g, plateXZ([[XC + 1.5, -ZS + 1], [XC + 1.5, ZS - 1], [XF - 1, ZF], [XF - 1, -ZF]].map(([x, z]) => [x, z]), 0.25), m, 0, y, 0);
  }
  // murs des bouts avec grandes ouvertures (coupe A-A)
  const endWall = (w, h) => extrudeXY([[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]], 0.5, [
    roundedRectPath(-w / 2 + 4, 5, w - 8, h * 0.42, 6),
    roundedRectPath(-w / 2 + 4, h * 0.42 + 10, w - 8, h * 0.58 - 15, 6),
  ]);
  const wr = add(g, endWall(2 * ZS - 6, H - 4), m, XR + 0.5, 0, 0);
  wr.rotation.y = Math.PI / 2;
  // goussets triangulaires aux coins du bas
  const gus = extrudeXY([[0, 0], [9, 0], [0, 18]], 0.5, [(() => { const p = new THREE.Path(); p.moveTo(1.5, 2.5); p.lineTo(5.5, 2.5); p.lineTo(1.5, 11); p.closePath(); return p; })()]);
  for (const z of [-ZS + 0.25, ZS - 0.75]) {
    add(g, gus, m, XR + 3, 0, z);
    const gb = add(g, gus, m, XC - 1.5, 0, z); gb.rotation.y = Math.PI; gb.position.z = z + 0.5;
  }
}

// =====================================================
// 3. POUTRES (35283130 x2, 35283131)
// =====================================================
{
  const g = part('poutres', {
    titre: 'Poutres (beams)', num: '35283130 (x2) et 35283131', plan: 'FRAME/35283130.pdf',
    mat: 'Acier 44W', poids: '56 lb ch.', fidele: true,
    note: '77 3/8 po de long, 6 1/2 po de haut. Les deux poutres de côté sont à 24 1/2 po ; la 35283131 supporte le joint du toit.'
  }, [0, 6, 0]);
  const m = mat('rouge');
  const L = 77.375, x0 = XR + 1.5 + L / 2;
  for (const z of [-ZS + 2, ZS - 2]) add(g, box(L, 6.5, 2), m, x0, 24.5 + 3.25, z);
  add(g, box(L, 6.5, 2), m, x0, H - 3.25 - 4, 0);
}

// =====================================================
// 4. TOIT (35283132 x4 + boulons 60030601)
// =====================================================
{
  const g = part('toit', {
    titre: 'Plaques de toit', num: '35283132 (x4) + 16 boulons 60030601', plan: 'FRAME/35283132.pdf',
    mat: 'Acier 44W 1/8 po', poids: '39,7 lb ch.', fidele: true,
    note: 'Quatre plaques de 39 11/16 x 28 1/4 po boulonnées sur la structure, plus les pièces du chanfrein avant.'
  }, [0, 30, 0]);
  const m = mat('rouge', { roughness: 0.6 });
  const pw = 39.6875, pd = 28.25, y = H + 0.25;
  for (const sx of [0, 1]) for (const sz of [-1, 1]) {
    const x = XR + pw / 2 + sx * (pw + 0.05) - 0.2;
    add(g, box(pw - 0.1, 0.125, pd - 0.1), m, x, y, sz * pd / 2);
  }
  const xs = XR + 2 * pw;
  const zx = ZS - (xs - XC) / (XF - XC) * (ZS - ZF);
  add(g, plateXZ([[xs, -zx], [XF, -ZF], [XF, ZF], [xs, zx]], 0.125), m, 0, y + 0.0625, 0);
  const bolt = cyl(0.45, 0.4, 12);
  const bm = mat('acier', { metalness: 0.7 });
  for (let i = 0; i < 4; i++) for (const z of [-ZS + 1.5, -0.8, 0.8, ZS - 1.5])
    if (Math.abs(z) > 1 || i % 2 === 0) add(g, bolt, bm, XR + 6 + i * 22, y + 0.25, z, false);
}

// =====================================================
// 5. ANNEAUX DE LEVAGE (0106037 x4)
// =====================================================
{
  const g = part('anneaux', {
    titre: 'Anneaux de levage 3/8', num: '0106037 (x4)', plan: 'FRAME/35283110.pdf (item 20)',
    mat: 'Acier 44W', poids: '', fidele: true, note: 'Aux quatre coins du haut. Points de levage du compresseur.'
  }, [0, 10, 0]);
  const m = mat('jaune', { metalness: 0.5 });
  const eye = extrudeXY([[0, -2.2], [4, -2.2], [5.2, 0], [4, 2.2], [0, 2.2]], 0.75, [roundedRectPath(2.4, -1.1, 2.2, 2.2, 1.1)]);
  for (const [x, z, flip] of [[XR, -ZS + 3, 1], [XR, ZS - 3.75, 1], [XF, -ZF + 3, 0], [XF, ZF - 3.75, 0]]) {
    const e = add(g, eye, m, x, H - 2, z);
    if (flip) { e.rotation.y = Math.PI; e.position.z += 0.75; }
  }
}

// =====================================================
// 6. VÉRINS / JACKS (35060501 x4)
// =====================================================
{
  const g = part('jacks', {
    titre: 'Jacks assemblés', num: '35060501 (x4)', plan: 'PLATE JACK/35060501.pdf',
    mat: 'Jack 3112815, plaque 3112650, cornière 35060502', poids: '189,3 lb ch.', fidele: true,
    note: 'Un jack à chaque coin, fixé sur la structure par une plaque boulonnée. Manivelle sur le dessus.'
  });
  const m = mat('acier', { color: 0x2c3035 });
  const mp = mat('rouge');
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const jg = new THREE.Group();
    const x = sx < 0 ? XR - 2.6 : XF + 2.6, z = sz * (sx < 0 ? 18 : 13);
    jg.position.set(x, 0, z);
    jg.userData.explodeDir = sx;
    g.add(jg);
    const sub = { name: 'jacks', add: o => jg.add(o) };
    add(jg, box(3, 22, 3), m, 0, 5, 0).userData.partId = 'jacks';
    add(jg, box(2.4, (-4 - (GROUND_Y + 0.6)), 2.4), mat('gris', { metalness: 0.6 }), 0, (-4 + GROUND_Y + 0.6) / 2, 0).userData.partId = 'jacks';
    add(jg, box(7, 0.6, 7), m, 0, GROUND_Y + 0.3, 0).userData.partId = 'jacks';
    add(jg, box(0.5, 12, 6), mp, -sx * 1.75, 4, 0).userData.partId = 'jacks'; // plaque 3112650
    // manivelle
    const crank = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 16, 0), new THREE.Vector3(0, 18.5, 0), new THREE.Vector3(sx * 3, 19, 0),
      new THREE.Vector3(sx * 7, 18.5, 0), new THREE.Vector3(sx * 7.5, 14, 0), new THREE.Vector3(sx * 10, 13.5, 0)
    ]), 24, 0.45, 8), m);
    crank.castShadow = true; crank.userData.partId = 'jacks';
    jg.add(crank);
  }
  g.children.forEach(c => c.traverse(o => { if (o.isMesh) o.userData.partId = 'jacks'; }));
}

// =====================================================
// 7. BOÎTE À CADRANS (3110010)
// =====================================================
{
  const g = part('cadrans', {
    titre: 'Boîte à cadrans', num: '3110010', plan: 'BOITE CADRAN/3110010.pdf',
    mat: 'Acier 44W 1/4 po (35280801 à 35280803)', poids: '53,2 lb', fidele: true,
    note: 'Boîte de 19 x 18 1/2 x 8 po en haut du bout arrière, avec 4 manomètres (vue 35290000).'
  }, [0, 0, -18]);
  const m = mat('rouge');
  const x0 = XR + 2 + 9.5, y0 = 31 + 9.25, z0 = -ZS + 2 + 4;
  add(g, box(19, 18.5, 8), m, x0, y0, z0);
  const face = mat('blanc', { metalness: 0.1, roughness: 0.4 });
  const ring = mat('inox', { metalness: 0.8, roughness: 0.25 });
  for (let i = 0; i < 4; i++) {
    const gx = x0 - 6.6 + i * 4.4, gy = y0 + 4.5;
    const r = add(g, cyl(1.9, 0.8, 32), ring, gx, gy, z0 - 4.3, false); r.rotation.x = Math.PI / 2;
    const f = add(g, cyl(1.6, 0.85, 32), face, gx, gy, z0 - 4.35, false); f.rotation.x = Math.PI / 2;
    const n = add(g, box(0.12, 1.3, 0.1), mat('noir'), gx + 0.3, gy + 0.4, z0 - 4.85, false); n.rotation.z = -0.6 - i * 0.3;
  }
  const sw = add(g, cyl(1.1, 1.2, 24), mat('noir'), x0 + 5.5, y0 - 4.5, z0 - 4.4, false); sw.rotation.x = Math.PI / 2;
  add(g, box(3.5, 2.5, 1.2), mat('gris'), x0 - 5, y0 - 5, z0 - 4.3, false);
}

// =====================================================
// 8. SUPPORT + COMPRESSEUR (approx.)
// =====================================================
const COMP_X = -20, COMP_Z = 2;
{
  const g = part('support', {
    titre: 'Support compresseur', num: '352100300', plan: 'FRAME/SUPPORT COMPRESSEUR PROT/352100300.pdf',
    mat: 'Acier 44W + barres rondes 352100301', poids: '24,0 lb', fidele: true,
    note: 'Base de 17 1/8 x 10 3/4 po soudée sur le frame, sous le compresseur.'
  }, [0, -6, 0]);
  add(g, box(17.125, 2.25, 10.75), mat('rouge'), COMP_X, 1.6, COMP_Z);
}
{
  const g = part('compresseur', {
    titre: 'Compresseur (bloc)', num: '—', plan: 'FRAME/35290000.pdf (vue générale)',
    mat: '', poids: '', fidele: false,
    note: 'Forme simplifiée : le bloc n\'a pas de plan dans le dossier R-55. Position et volume pris sur la vue générale 35290000 (cylindres à ailettes en éventail derrière le volant).'
  }, [0, 22, 0]);
  const m = mat('acier', { color: 0x30353b });
  const fin = mat('acier', { color: 0x484e55, metalness: 0.6 });
  add(g, new RoundedBoxGeometry(15, 11, 13, 3, 1.5), m, COMP_X, 2.75 + 5.5, COMP_Z);
  for (const a of [-0.75, 0, 0.75]) {
    const cg = new THREE.Group();
    cg.position.set(COMP_X, 12, COMP_Z);
    cg.rotation.z = a;
    g.add(cg);
    const c = add(cg, cyl(3, 9, 24), m, 0, 6, 0); c.userData.partId = 'compresseur';
    for (let i = 0; i < 6; i++) { const f = add(cg, cyl(4.3, 0.35, 24), fin, 0, 3.5 + i * 1.15, 0, false); f.userData.partId = 'compresseur'; }
    const hd = add(cg, new RoundedBoxGeometry(7.5, 2.2, 7.5, 2, 0.6), m, 0, 11.5, 0); hd.userData.partId = 'compresseur';
  }
  // volant (caché par le garde)
  const fw = add(g, cyl(9, 2, 40), mat('gris'), COMP_X, 13, -14); fw.rotation.x = Math.PI / 2;
  const sh = add(g, cyl(1.2, 10, 16), mat('gris'), COMP_X, 13, -9, false); sh.rotation.x = Math.PI / 2;
}

// =====================================================
// 9. MOTEUR ÉLECTRIQUE (approx.)
// =====================================================
{
  const g = part('moteur', {
    titre: 'Moteur électrique', num: '—', plan: 'FRAME/35290000.pdf (vue générale)',
    mat: '', poids: '', fidele: false,
    note: 'Forme simplifiée : entraîne le compresseur par courroies sous le garde. Position déduite du bout arrondi du garde-courroie.'
  }, [0, 0, 22]);
  const m = mat(0x2f4a63, { metalness: 0.4 });
  const x = 9.5, y = 10;
  const body = add(g, cyl(8, 20, 40), m, x, y, 0); body.rotation.x = Math.PI / 2;
  for (let i = 0; i < 9; i++) { const r = add(g, cyl(8.4, 0.4, 40), m, x, y, -8 + i * 2, false); r.rotation.x = Math.PI / 2; }
  add(g, box(14, 2, 18), mat('acier'), x, 1.5, 0);
  add(g, box(6, 5, 7), m, x, y + 9, 3);
  const sh = add(g, cyl(1, 10, 16), mat('gris'), x, y, -14, false); sh.rotation.x = Math.PI / 2;
  const pul = add(g, cyl(3.5, 2.5, 32), mat('gris'), x, y, -15.5); pul.rotation.x = Math.PI / 2;
}

// =====================================================
// 10. GARDE-COURROIE (approx., vue 35290000)
// =====================================================
{
  const g = part('garde', {
    titre: 'Garde-courroie', num: '—', plan: 'FRAME/35290000.pdf (vue générale)',
    mat: 'Tôle', poids: '', fidele: false,
    note: 'Contour pris sur la vue générale : 50 po de long, 24 po de haut, grille ronde devant le volant. Les plans du garde sont dans 65 COMPRESSEUR/GARDE COMPRESEUR.'
  }, [0, 0, -26]);
  const s = new THREE.Shape();
  s.moveTo(-32.5, 0.5); s.lineTo(17.5, 0.5); s.lineTo(17.5, 14);
  s.quadraticCurveTo(17.5, 24, 5, 24); s.lineTo(-30, 24);
  s.quadraticCurveTo(-32.5, 24, -32.5, 21.5); s.closePath();
  s.holes.push(new THREE.Path().absarc(-20, 13, 8.8, 0, Math.PI * 2, true));
  const geo = new THREE.ExtrudeGeometry(s, { depth: 6, bevelEnabled: true, bevelSize: 0.4, bevelThickness: 0.4, bevelSegments: 2 });
  const gm = mat(0x1d1f22, { roughness: 0.7 });
  add(g, geo, gm, 0, 0, -22);
  // grille du volant (disque perforé de 3 trous)
  const grille = new THREE.Shape(); grille.absarc(0, 0, 8.8, 0, Math.PI * 2, false);
  [[-3.2, -2.6, 3.1], [0.6, 0.4, 2.6], [3.6, 3.6, 2.6]].forEach(([hx, hy, r]) => grille.holes.push(new THREE.Path().absarc(hx, hy, r, 0, Math.PI * 2, true)));
  const gr = add(g, new THREE.ExtrudeGeometry(grille, { depth: 0.3, bevelEnabled: false }),
    mat(0x26292d, { wireframe: false, roughness: 0.9 }), -20, 13, -21.4);
  // logo MRI peint
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#f4f4f0'; cx.font = '900 190px Arial Black, Arial, sans-serif'; cx.textBaseline = 'middle';
  cx.fillText('MRI', 20, 136);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(18, 9), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  logo.position.set(-1, 9.5, -22.45); logo.rotation.y = Math.PI; logo.userData.partId = 'garde';
  g.add(logo);
}

// =====================================================
// 11. RÉSERVOIR D'AIR + SUPPORT (MR000020-90)
// =====================================================
{
  const g = part('reservoir', {
    titre: 'Réservoir d\'air et support', num: 'Support MR000020-90', plan: 'FRAME/351233100.pdf (item 19)',
    mat: 'Support acier 44W 1/4 po', poids: '', fidele: false,
    note: 'Le support est sur le plan du frame. Le réservoir est simplifié : position et diamètre pris sur la vue générale (bout arrière, 16 po de diamètre).'
  }, [-20, 0, 0]);
  const m = mat('inox', { metalness: 0.55, roughness: 0.4 });
  const r = 8, x0 = XR + 3, x1 = XR + 12;
  const t = add(g, cyl(r, x1 - x0, 40), m, (x0 + x1) / 2, 9.5, 0); t.rotation.z = Math.PI / 2;
  const dome = add(g, new THREE.SphereGeometry(r, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), m, x1, 9.5, 0, false);
  dome.rotation.z = -Math.PI / 2; dome.scale.set(1, 0.55, 1);
  for (const x of [x0 + 1.5, x1 - 1.5]) add(g, box(1.5, 2, 12), mat('rouge'), x, 0.9, 0);
  // sortie d'air vers l'extérieur
  const p = add(g, cyl(1.25, 12, 20), mat('gris', { metalness: 0.7 }), XR - 3, 11, 0, false); p.rotation.z = Math.PI / 2;
  const v = add(g, box(2.6, 2.6, 2.6), mat('laiton', { metalness: 0.8 }), XR - 7, 11, 0, false);
  const h = add(g, cyl(0.5, 3, 12), mat('rouge'), XR - 7, 13.2, 0, false);
  // tuyau compresseur -> réservoir
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(COMP_X - 5, 18, COMP_Z), new THREE.Vector3(COMP_X - 12, 21, 0),
    new THREE.Vector3(x1 + 4, 16, 0), new THREE.Vector3(x1 + 4.5, 9.5, 0)
  ]), 40, 1, 12), mat('gris', { metalness: 0.7 }));
  tube.castShadow = true; tube.userData.partId = 'reservoir'; g.add(tube);
}

// =====================================================
// 12. BOÎTE ÉLECTRIQUE + ADMISSION D'AIR (Détail A)
// =====================================================
{
  const g = part('electrique', {
    titre: 'Boîte électrique', num: '1418N4SSM8', plan: 'FRAME/35290000.pdf (détail A)',
    mat: 'Boîtier NEMA 4 inox', poids: '', fidele: false,
    note: 'Numéro tiré du détail A. Dimensions approximatives (18 x 14 x 8 po), dans le compartiment avant.'
  }, [20, 0, 0]);
  const m = mat('inox', { metalness: 0.7, roughness: 0.3 });
  const x = XC + 6.5;
  add(g, box(8, 18, 14), m, x, 31 + 9, 0);
  add(g, box(0.3, 16, 12), mat('inox', { metalness: 0.75, roughness: 0.22 }), x - 4.1, 40, 0, false);
  for (const y of [34, 46]) add(g, box(0.6, 1.4, 0.8), mat('gris'), x - 4.4, y, 5.8, false);
  // plaque de montage avec 4 trous (14 5/16 po)
  add(g, box(0.5, 14.3, 12), mat('rouge'), x + 1, 16.5 + 7.15, 0);
}
{
  const g = part('admission', {
    titre: 'Admission d\'air (Détail A)', num: 'Adapteur 45° 4546S, connecteur 8346-202', plan: 'FRAME/35290000.pdf (détail A)',
    mat: '', poids: '', fidele: false,
    note: 'Filtre et réducteur fixés sur la plaque de 14 5/16 po (4 trous Ø 0,3437). Boyau vers le compresseur ajouté pour la lecture du modèle.'
  }, [18, 0, -8]);
  const x = XC + 3.5;
  const m = mat('noir', { roughness: 0.8 });
  add(g, cyl(3.2, 9, 32), m, x, 20, 0);
  for (const y of [16.2, 23.8]) add(g, cyl(3.5, 0.9, 32), mat('inox', { metalness: 0.8 }), x, y, 0, false);
  add(g, new THREE.CylinderGeometry(3.2, 1.6, 6, 32), m, x, 12.5, 0);
  add(g, cyl(1.8, 1.5, 24), mat('inox', { metalness: 0.8 }), x, 9, 0, false);
  const hose = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(x, 8.5, 0), new THREE.Vector3(x - 3, 4, 2), new THREE.Vector3(10, 22, 10),
    new THREE.Vector3(COMP_X + 8, 25, COMP_Z + 4), new THREE.Vector3(COMP_X + 5, 22, COMP_Z + 2)
  ]), 60, 1.5, 14), mat('noir', { roughness: 0.95 }));
  hose.castShadow = true; hose.userData.partId = 'admission'; g.add(hose);
}

// =====================================================
// 13. ESSIEU + ROUES (3110110-ASS)
// =====================================================
const AXLE_Y = -15, WHEEL_R = 13.5;
{
  const g = part('essieu', {
    titre: 'Essieu assemblé', num: '3110110-ASS', plan: 'ESSIEUX ASSEMBLER/3110110-ASS.pdf',
    mat: 'Shaft 3110110-10, roues 3115010 (x2), hubs 35270204-2 (x2)', poids: '1155,8 lb', fidele: false,
    note: 'Arbre soudé de 56 1/8 po. Le diamètre des roues (27 po) est estimé : le plan de la roue 3115010 n\'est pas dans le dossier.'
  }, [0, -14, 0]);
  const m = mat('rouge');
  add(g, box(4, 4, 56.125), m, 0, AXLE_Y, 0);
  for (const z of [-20, 20]) add(g, box(12, 0.75, 8), m, 0, AXLE_Y + 2.4, z);
  for (const z of [-21, 21]) add(g, box(3, 2.2, 3), m, 0, AXLE_Y + 3.9, z, false);
  const tire = new THREE.TorusGeometry(WHEEL_R - 3.4, 3.6, 20, 48);
  for (const sz of [-1, 1]) {
    const z = sz * 33;
    const t = add(g, tire, mat('noir', { roughness: 0.9, metalness: 0 }), 0, AXLE_Y, z, false);
    t.scale.set(1, 1, 1.25);
    const rim = add(g, cyl(9.2, 7, 40), mat('rouge'), 0, AXLE_Y, z); rim.rotation.x = Math.PI / 2;
    const hub = add(g, cyl(3, 9, 24), mat('gris', { metalness: 0.7 }), 0, AXLE_Y, z); hub.rotation.x = Math.PI / 2;
    const sp = add(g, cyl(1.92 / 2, 12.5, 16), mat('gris'), 0, AXLE_Y, sz * 30.5, false); sp.rotation.x = Math.PI / 2;
  }
}
{
  const g = part('timon', {
    titre: 'Timon', num: '—', plan: 'FRAME/P015125-C002-F01@F31-01.pdf (vue iso)',
    mat: 'Tube carré (approx.)', poids: '', fidele: false,
    note: 'Ajouté d\'après la vue isométrique de Forcetech (projet CUBEX / MRI R-55). Longueur et angle approximatifs.'
  }, [16, 0, 0]);
  const m = mat('rouge');
  const a = new THREE.Vector3(XF - 2, -6, 0), b = new THREE.Vector3(XF + 44, -10, 0);
  const len = a.distanceTo(b);
  const bar = add(g, box(len, 4, 4), m, (a.x + b.x) / 2, (a.y + b.y) / 2, 0);
  bar.rotation.z = Math.atan2(b.y - a.y, b.x - a.x);
  const eye = add(g, new THREE.TorusGeometry(2.6, 0.9, 12, 32), mat('acier'), b.x + 3, b.y, 0, false); eye.rotation.x = Math.PI / 2;
  for (const z of [-6, 6]) { const br = add(g, box(16, 2, 1), m, XF + 6, -7, z * 0.6); br.rotation.y = z > 0 ? -0.35 : 0.35; }
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
  sp.scale.set(w / 68 * 6, 6, 1); sp.renderOrder = 10;
  return sp;
}
function dimLine(a, b, text, off) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), O = new THREE.Vector3(...off);
  const pts = [A, A.clone().add(O), A.clone().add(O), B.clone().add(O), B.clone().add(O), B];
  const l = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: 0x1a4d8f, depthTest: false }));
  l.renderOrder = 9; dims.add(l);
  const s = label(text); s.position.copy(A.clone().add(B).multiplyScalar(0.5).add(O).add(O.clone().normalize().multiplyScalar(3.5)));
  dims.add(s);
}
dimLine([XR - 9.5, GROUND_Y + 0.2, ZS + 6], [XF + 9.5, GROUND_Y + 0.2, ZS + 6], '113 3/8 po (hors-tout)', [0, 0, 14]);
dimLine([XR - 4, GROUND_Y + 0.2, -ZS], [XR - 4, GROUND_Y + 0.2, ZS], '57 po', [-16, 0, 0]);
dimLine([XF + 4, -SKID_H, -ZF - 2], [XF + 4, H + 0.3, -ZF - 2], '67 1/4 po', [14, 0, 0]);

// ---------- Interface ----------
const list = document.getElementById('parts');
const info = document.getElementById('info');
let selected = null;
PARTS.forEach(g => {
  g.userData.base = g.position.clone();
  g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.userData.baseEmissive = o.material.emissive?.getHex?.() ?? 0; } });
  const d = g.userData;
  const li = document.createElement('li');
  li.innerHTML = `<label><input type="checkbox" checked><span class="dot ${d.fidele ? 'ok' : 'approx'}"></span><span class="t">${d.titre}</span></label><span class="n">${d.num}</span>`;
  li.querySelector('input').addEventListener('change', e => { g.visible = e.target.checked; });
  li.addEventListener('click', e => { if (e.target.tagName !== 'INPUT') select(d.id, true); });
  li.dataset.id = d.id;
  list.appendChild(li);
});

function setHighlight(g, on) {
  g.traverse(o => { if (o.isMesh && o.material.emissive) { o.material.emissive.setHex(on ? 0x3a6fd8 : 0x000000); o.material.emissiveIntensity = on ? 0.45 : 0; } });
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
    <div class="badge ${d.fidele ? 'ok' : 'approx'}">${d.fidele ? 'D\'après les plans' : 'Forme simplifiée'}</div>
    <h3>${d.titre}</h3>
    <dl><dt>N° de pièce</dt><dd>${d.num}</dd>
    ${d.mat ? `<dt>Matériel</dt><dd>${d.mat}</dd>` : ''}
    ${d.poids ? `<dt>Poids</dt><dd>${d.poids}</dd>` : ''}
    <dt>Plan source</dt><dd class="mono">${d.plan}</dd></dl>
    <p>${d.note}</p>`;
  info.querySelector('.x').onclick = () => select(null);
  if (focus) {
    const b = new THREE.Box3().setFromObject(g); const c = b.getCenter(new THREE.Vector3());
    tweenTo(c, camera.position.clone().sub(controls.target).add(c));
  }
}

// clic dans la vue
const ray = new THREE.Raycaster(); const mouse = new THREE.Vector2();
let down = null;
renderer.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
  const r = renderer.domElement.getBoundingClientRect();
  mouse.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects(root.children, true).find(h => h.object.isMesh && h.object.visible && isVisible(h.object));
  select(hit ? findPart(hit.object) : null, false);
});
const isVisible = o => { while (o) { if (!o.visible) return false; o = o.parent; } return true; };
const findPart = o => { while (o) { if (o.userData.partId && partById[o.userData.partId]) return o.userData.partId; if (partById[o.name] && PARTS.includes(o)) return o.name; o = o.parent; } return null; };

// vue éclatée
const slider = document.getElementById('explode');
let explodeT = 0;
slider.addEventListener('input', () => { explodeT = +slider.value; applyExplode(); });
function applyExplode() {
  PARTS.forEach(g => {
    g.position.copy(g.userData.base).addScaledVector(g.userData.explode, explodeT);
    if (g.name === 'jacks') g.children.forEach(j => { j.position.x = (j.userData.baseX ??= j.position.x) + j.userData.explodeDir * 14 * explodeT; });
  });
}

// bascules
const toggles = {
  toit: ['toit'], roues: ['essieu', 'timon'], cotes: null, filaire: null,
};
document.querySelectorAll('[data-toggle]').forEach(btn => {
  btn.addEventListener('click', () => {
    const k = btn.dataset.toggle; const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', on);
    if (k === 'cotes') dims.visible = on;
    else if (k === 'transparent') PARTS.filter(g => ['structure', 'toit', 'poutres', 'garde'].includes(g.name)).forEach(g => g.traverse(o => {
      if (o.isMesh) { o.material.transparent = on; o.material.opacity = on ? 0.18 : 1; o.material.depthWrite = !on; }
    }));
    else toggles[k].forEach(id => {
      partById[id].visible = on;
      const li = document.querySelector(`#parts li[data-id="${id}"] input`); if (li) li.checked = on;
    });
  });
});

// vues
const VIEWS = {
  iso: [[190, 120, 210], [0, 12, 0]],
  cote: [[0, 14, -290], [0, 14, 0]],
  avant: [[300, 16, 0], [0, 14, 0]],
  dessus: [[0, 330, 0.1], [0, 0, 0]],
  operateur: [[-150, 60, -170], [-15, 18, -10]],
};
let tween = null;
function tweenTo(target, pos, ms = 700) {
  tween = { t0: performance.now(), ms, fromP: camera.position.clone(), fromT: controls.target.clone(), toP: pos, toT: target };
}
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {
  const [p, t] = VIEWS[b.dataset.view]; tweenTo(new THREE.Vector3(...t), new THREE.Vector3(...p));
}));


camera.position.set(...VIEWS.iso[0]);
function resize() {
  const w = app.clientWidth, h = app.clientHeight;
  renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
}
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
window.__scene = { scene, camera, controls, select, VIEWS, tweenTo, renderer };

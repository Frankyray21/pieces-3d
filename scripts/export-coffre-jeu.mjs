// Exporte le coffre à outils ITH (coffre-dd) en glTF binaire prêt pour un
// moteur de jeu (Unreal Engine, Unity, Godot) : un maillage par élément mobile,
// origine de chaque maillage sur son pivot (pentures des portes, boulon de la
// barre de verrouillage, façade du tiroir), matériaux PBR nommés, logo en
// texture incorporée, unités en mètres. Voir docs/coffre-unreal.md.
//
// Usage : node scripts/export-coffre-jeu.mjs [sortie.glb] [--ucx]
//   --ucx : ajoute des volumes de collision convexes nommés UCX_<maillage>_NN.
import { readFileSync, writeFileSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders, { build, doorFrame, RIG } from '../src/models/coffre-dd/index.js';

// Node n'a pas de FileReader : l'exportateur s'en sert pour lire ses tampons.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then((b) => { this.result = b; this.onloadend?.(); }); }
};

const args = process.argv.slice(2);
const ucx = args.includes('--ucx');
const out = args.find((a) => !a.startsWith('--')) || 'public/equipment/coffre-dd/coffre-ith.glb';

// Coffre fermé, avec les ajouts de la photo (tiroir, panier, crochets).
const model = buildProcedural({ ...builders, JEU: (api) => { build(api, [0, 0], true); } }, 'JEU');
model.root.updateMatrixWorld(true);
const ref = (r, i) => (i === undefined ? model.refs.get(r) || [] : [model.refs.get(r)[i]]);

const T = (v) => new THREE.Matrix4().makeTranslation(...v);
const doorG = doorFrame(THREE, -1, 0), doorD = doorFrame(THREE, 1, 0);
const { W, D, H, Y0, YK, ZT, T: TH, L } = RIG.size;
const IN = 0.0254;

// Éléments : nom, pivot (matrice monde), pièces, parent, mouvement (axes du fichier glTF, Y vers le haut).
const ELEMENTS = [
  { name: 'SM_Coffre_Caisse', pivot: new THREE.Matrix4(), parts: ['1', '2', '3', '4', '5', '7', '8', '9', '10', '11', '12', '18', '20', '21'].flatMap((r) => ref(r)),
    extras: { role: 'caisse fixe', origine: 'au sol, au centre du coffre' } },
  { name: 'SM_Coffre_Porte_G', pivot: doorG, parts: [...ref('6', 0), ...ref('13', 0), ...ref('15'), ...ref('16'), ...ref('17'), ...ref('22'), ...ref('24')],
    extras: { role: 'porte gauche', mouvement: 'rotation', axe_local: 'Y', angle_ferme_deg: 0, angle_ouvert_deg: -110 } },
  { name: 'SM_Coffre_Barre', parent: 'SM_Coffre_Porte_G', pivot: doorG.clone().multiply(T(RIG.barPivot)), parts: ref('14'),
    extras: { role: 'barre de verrouillage, tourne à plat sur la porte', mouvement: 'rotation', axe_local: 'Z', angle_ferme_deg: 0, angle_ouvert_deg: 180 } },
  { name: 'SM_Coffre_Porte_D', pivot: doorD, parts: [...ref('6', 1), ...ref('13', 1)],
    extras: { role: 'porte droite', mouvement: 'rotation', axe_local: 'Y', angle_ferme_deg: 0, angle_ouvert_deg: 110 } },
  { name: 'SM_Coffre_Tiroir', pivot: T(RIG.drawer), parts: ref('19'),
    extras: { role: 'tiroir', mouvement: 'translation', axe_local: 'Z', course_m: +RIG.drawerTravel.toFixed(3) } },
  { name: 'SM_Coffre_Support_Tube', pivot: T(RIG.support), parts: ref('23'),
    extras: { role: 'support de tube D-D (dessin 0102803), fixe', origine: 'sous la base du support' } },
  { name: 'SM_Coffre_Boite_Cle', pivot: T(RIG.keyBox), parts: ref('25'),
    extras: { role: 'boîte à clés (dessin C16062863), fixe', origine: 'haut de la plaque, contre le côté gauche' } },
];

// Contenu du coffre (liste de matériel) : un maillage par pièce, origine au centre de la pièce.
const CONTENU = { 30: ['Tete_Excore', '3760016030'], 31: ['Overshot_Excore_II', '3760016279'], 32: ['Core_Lifter', '3760006241'], 33: ['Core_Lifter_Case', '3760006242'], 34: ['Stop_Ring', '3760006240'], 35: ['Landing_Ring', '3760006243'] };
for (const [r, [nom, pn]] of Object.entries(CONTENU)) {
  ref(r).forEach((obj, i, all) => {
    const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
    ELEMENTS.push({ name: `SM_Contenu_${nom}${all.length > 1 ? `_${i + 1}` : ''}`, pivot: T(c.toArray()), parts: [obj],
      extras: { role: 'contenu du coffre, objet à prendre', numero_de_piece: pn, calibre: 'N' } });
  });
}

// Matériaux PBR simples, un par couleur de la palette.
const NAMES = { red: 'M_Coffre_Rouge', white: 'M_Coffre_Blanc', black: 'M_Coffre_Noir', logo: 'M_Coffre_Logo' };
const materials = new Map();
function material(src) {
  let m = materials.get(src.name);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: src.name === 'logo' ? 0xffffff : src.color, roughness: src.roughness, metalness: src.metalness });
    m.name = NAMES[src.name] || `M_Coffre_${src.name}`;
    materials.set(src.name, m);
  }
  return m;
}

/** Fusionne les pièces d'un élément en un seul maillage, exprimé dans le repère de son pivot. */
function bake(el) {
  const inv = el.pivot.clone().invert();
  const byMat = new Map();
  for (const part of el.parts) {
    part.traverse((o) => {
      if (!o.isMesh) return;
      let g = o.geometry.clone();
      g.applyMatrix4(inv.clone().multiply(o.matrixWorld));
      if (g.index) g = g.toNonIndexed();
      const n = g.attributes.position.count;
      const uv = g.attributes.uv ? g.attributes.uv.clone() : new THREE.BufferAttribute(new Float32Array(n * 2), 2);
      // glTF : v = 0 en haut de l'image (three.js : en bas).
      if (o.material.name === 'logo') for (let i = 0; i < n; i++) uv.setY(i, 1 - uv.getY(i));
      const clean = new THREE.BufferGeometry();
      clean.setAttribute('position', g.attributes.position);
      clean.setAttribute('normal', g.attributes.normal);
      clean.setAttribute('uv', uv);
      if (!byMat.has(o.material.name)) byMat.set(o.material.name, { src: o.material, geos: [] });
      byMat.get(o.material.name).geos.push(clean);
    });
  }
  const groups = [...byMat.values()];
  const geo = mergeGeometries(groups.map((x) => mergeGeometries(x.geos, false)), true);
  geo.name = el.name;
  const mesh = new THREE.Mesh(geo, groups.map((x) => material(x.src)));
  mesh.name = el.name;
  mesh.userData = el.extras;
  return mesh;
}

const scene = new THREE.Scene();
const root = new THREE.Group();
root.name = 'Coffre_ITH';
scene.add(root);
const nodes = new Map();
let tris = 0;
for (const el of ELEMENTS) {
  const mesh = bake(el);
  tris += mesh.geometry.attributes.position.count / 3;
  const parent = el.parent ? ELEMENTS.find((e) => e.name === el.parent) : null;
  const local = parent ? parent.pivot.clone().invert().multiply(el.pivot) : el.pivot;
  local.decompose(mesh.position, mesh.quaternion, mesh.scale);
  (parent ? nodes.get(parent.name) : root).add(mesh);
  nodes.set(el.name, mesh);
}

// Volumes de collision convexes (convention de nommage UCX_), dans le repère du maillage.
if (ucx) {
  const hull = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  hull.name = 'M_Collision';
  const add = (name, boxes) => boxes.forEach(([size, pos], i) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(...size), hull);
    m.position.set(...pos);
    m.name = `UCX_${name}_${String(i).padStart(2, '0')}`;
    nodes.get(name).add(m);
  });
  const hb = H - Y0, c = 0.02; // épaisseur des parois de collision
  add('SM_Coffre_Caisse', [
    [[W, hb, c], [0, Y0 + hb / 2, -D / 2 + c / 2]], // derrière
    [[W, c, D], [0, Y0 + c / 2, 0]], // fond
    [[W, c, ZT + D / 2], [0, H - c / 2, (ZT - D / 2) / 2]], // dessus
    [[W, YK - Y0, c], [0, (YK + Y0) / 2, D / 2 - c / 2]], // devant
    [[c, YK - Y0, D], [-W / 2 + c / 2, (YK + Y0) / 2, 0]], [[c, YK - Y0, D], [W / 2 - c / 2, (YK + Y0) / 2, 0]], // côtés, bas
    [[c, H - YK, ZT + D / 2], [-W / 2 + c / 2, (H + YK) / 2, (ZT - D / 2) / 2]], [[c, H - YK, ZT + D / 2], [W / 2 - c / 2, (H + YK) / 2, (ZT - D / 2) / 2]], // côtés, haut
    [[Y0, Y0, D], [-18 * IN, Y0 / 2, 0]], [[Y0, Y0, D], [18 * IN, Y0 / 2, 0]], // tubes de base
    [[W, c, 16 * IN], [0, H - 12 * IN, -D / 2 + 8 * IN]], [[W, c, 16 * IN], [0, H - 24 * IN, -D / 2 + 8 * IN]], // tablettes
  ]);
  add('SM_Coffre_Porte_G', [[[W / 2, L, c], [W / 4, L / 2, TH + c / 2]]]);
  add('SM_Coffre_Porte_D', [[[W / 2, L, c], [-W / 4, L / 2, TH + c / 2]]]);
  add('SM_Coffre_Tiroir', [[[0.58, 0.1, 0.38], [0, 0.05, -0.19]]]);
  add('SM_Coffre_Support_Tube', [[[3 * IN, 0.5 * IN, 8 * IN], [0, 0.25 * IN, 0]], [[0.75 * IN, 17 * IN, 12 * IN], [-1.125 * IN, 9 * IN, 0]]]);
}

const glb = Buffer.from(await new GLTFExporter().parseAsync(scene, { binary: true }));

// Incorpore le logo (PNG) et le relie au matériau M_Coffre_Logo.
const jsonLen = glb.readUInt32LE(12);
const json = JSON.parse(glb.subarray(20, 20 + jsonLen).toString('utf8'));
const binLen = glb.readUInt32LE(20 + jsonLen);
const pad = (b, fill) => Buffer.concat([b, Buffer.alloc((4 - (b.length % 4)) % 4, fill)]);
const png = readFileSync(new URL('../public/equipment/coffre-dd/logo.png', import.meta.url));
const bin = Buffer.concat([glb.subarray(28 + jsonLen, 28 + jsonLen + binLen), pad(png, 0)]);
json.bufferViews.push({ buffer: 0, byteOffset: binLen, byteLength: png.length });
json.buffers[0].byteLength = bin.length;
json.images = [{ name: 'T_Coffre_Logo', mimeType: 'image/png', bufferView: json.bufferViews.length - 1 }];
json.samplers = [{ magFilter: 9729, minFilter: 9987, wrapS: 33071, wrapT: 33071 }];
json.textures = [{ name: 'T_Coffre_Logo', source: 0, sampler: 0 }];
const logo = json.materials.find((m) => m.name === 'M_Coffre_Logo');
logo.pbrMetallicRoughness.baseColorTexture = { index: 0 };
json.asset.generator = 'pieces-3d scripts/export-coffre-jeu.mjs';
const jsonBuf = pad(Buffer.from(JSON.stringify(json), 'utf8'), 0x20);
const head = Buffer.alloc(12);
head.writeUInt32LE(0x46546c67, 0);
head.writeUInt32LE(2, 4);
head.writeUInt32LE(12 + 8 + jsonBuf.length + 8 + bin.length, 8);
const chunk = (len, type) => { const b = Buffer.alloc(8); b.writeUInt32LE(len, 0); b.writeUInt32LE(type, 4); return b; };
writeFileSync(out, Buffer.concat([head, chunk(jsonBuf.length, 0x4e4f534a), jsonBuf, chunk(bin.length, 0x004e4942), bin]));

console.log(`${out} : ${ELEMENTS.length} maillages, ${Math.round(tris)} triangles, ${json.materials.length} matériaux, ${(Buffer.byteLength(jsonBuf) + bin.length) / 1e3 | 0} ko${ucx ? ', collisions UCX' : ''}`);
for (const n of json.nodes) if (n.mesh !== undefined) console.log(`  ${n.name}${n.extras?.mouvement ? ` — ${n.extras.mouvement} sur ${n.extras.axe_local}` : ''}`);

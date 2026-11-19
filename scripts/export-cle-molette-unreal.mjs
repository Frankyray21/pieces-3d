// Exporte pour Unreal Engine (ou Blender, ou tout logiciel qui lit le glTF) les clés à molette du site.
//
//   public/equipment/cle-a-molette/unreal/
//     SM_Cles_A_Molette.glb   les sept grandeurs (6 à 24 po), couchées à plat côte à côte ; par clé, trois
//                             maillages à l'échelle 1 (corps, mâchoire mobile, molette), la mâchoire et la
//                             molette enfants du corps, chacune avec son pivot ; un matériau et trois
//                             textures partagés
//
// Le modèle et ses textures (couleur, normales, rugosité-métal, 1 024 px) sont ceux du « Tool Pack 1 »
// d'OpenGameArt (CC0, https://opengameart.org/content/tool-pack-1, LonesomeDucky). Les textures ne sont pas
// dans le dépôt en PNG : --textures donne le dossier qui contient diff.png, nor.png et mr.png, écrits par
//   node tools/cle_molette_mesh.mjs <adjustable_wrench.glb> --textures <dossier>
// (adjustable_wrench.glb vient de https://opengameart.org/sites/default/files/tool_pack_1.zip).
//
// Usage : node scripts/export-cle-molette-unreal.mjs --textures <dossier>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { base, dims, SIZES } from '../src/models/cle-a-molette/forme.js';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : def; };
const texDir = opt('--textures', null);
if (!texDir) throw new Error('--textures <dossier> manquant : voir l\'en-tête du script.');
const TEX = Object.fromEntries(['diff', 'nor', 'mr'].map((k) => [k, readFileSync(join(texDir, `${k}.png`))]));

// ------------------------------------------------------------------ écriture d'un .glb

const json = {
  asset: { version: '2.0', generator: 'pieces-3d scripts/export-cle-molette-unreal.mjs', copyright: 'Modèle et textures : LonesomeDucky, « Tool Pack 1 », OpenGameArt — CC0 1.0' },
  scene: 0, scenes: [{ name: 'Scene', nodes: [] }], nodes: [], meshes: [], materials: [], accessors: [], bufferViews: [], buffers: [{}],
};
const chunks = []; let length = 0;
const view = (bytes, target) => {
  const pad = (4 - (length % 4)) % 4;
  if (pad) { chunks.push(Buffer.alloc(pad)); length += pad; }
  const v = { buffer: 0, byteOffset: length, byteLength: bytes.byteLength };
  if (target) v.target = target;
  chunks.push(Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)); length += bytes.byteLength;
  return json.bufferViews.push(v) - 1;
};
const accessor = (array, type, target, bounds = false) => {
  const size = { SCALAR: 1, VEC2: 2, VEC3: 3 }[type];
  const a = { bufferView: view(array, target), componentType: array instanceof Float32Array ? 5126 : 5123, count: array.length / size, type };
  if (bounds) {
    a.min = [Infinity, Infinity, Infinity]; a.max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < array.length; i++) { a.min[i % 3] = Math.min(a.min[i % 3], array[i]); a.max[i % 3] = Math.max(a.max[i % 3], array[i]); }
  }
  return json.accessors.push(a) - 1;
};

// Matériau texturé : rugosité dans le vert, métal dans le bleu (le rouge, plein, ne sert pas), normales OpenGL.
json.samplers = [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }];
json.images = ['diff', 'nor', 'mr'].map((k) => ({ name: `T_Cle_A_Molette_${k}`, mimeType: 'image/png', bufferView: view(TEX[k]) }));
json.textures = json.images.map((_, i) => ({ sampler: 0, source: i }));
json.materials.push({
  name: 'M_Cle_A_Molette', doubleSided: true,
  pbrMetallicRoughness: { baseColorTexture: { index: 0 }, metallicRoughnessTexture: { index: 2 } },
  normalTexture: { index: 1 },
});

// ------------------------------------------------------------------ les sept grandeurs

const b = base(), NOMS = { corps: 'Corps', machoire: 'Machoire', molette: 'Molette' };
// Normales, UV et triangles : les mêmes pour toutes les grandeurs ; seules les positions changent d'échelle.
const commun = Object.fromEntries(Object.entries(b.pieces).map(([nom, p]) => [nom, { NORMAL: accessor(p.N, 'VEC3', 34962), TEXCOORD_0: accessor(p.uv, 'VEC2', 34962), indices: accessor(p.I, 'SCALAR', 34963) }]));
const r4 = (x) => +x.toFixed(4), r1 = (x) => +x.toFixed(1);
let x = 0, triangles = 0;
for (const size of SIZES) {
  const d = dims(size), po = String(size).padStart(2, '0');
  const noeud = {};
  for (const [nom, p] of Object.entries(b.pieces)) {
    const name = `SM_Cle_A_Molette_${po}po_${NOMS[nom]}`, c = commun[nom];
    const mesh = json.meshes.push({ name, primitives: [{ attributes: { POSITION: accessor(p.P.map((v) => v * d.s), 'VEC3', 34962, true), NORMAL: c.NORMAL, TEXCOORD_0: c.TEXCOORD_0 }, indices: c.indices, material: 0 }] }) - 1;
    noeud[nom] = { name: `Cle_A_Molette_${po}po_${NOMS[nom]}`, mesh, translation: p.t.map((v) => r4(v * d.s)), rotation: p.q };
    triangles += p.I.length / 3;
  }
  // Couchée à plat sur Y = 0, manche le long de Z, bouts de manche alignés en Z = 0, rangée par grandeur le long de X.
  Object.assign(noeud.corps, {
    name: `Cle_A_Molette_${po}po`, translation: [r4(x - d.min[0]), r4(d.T / 2), r4(-d.max[2])], rotation: undefined,
    extras: { grandeur_po: size, longueur_mm: r1(d.L * 1000), largeur_de_tete_mm: r1(d.W * 1000), epaisseur_mm: r1(d.T * 1000), ouverture_mm: r1(d.ouverture * 1000), masse_calculee_kg: +d.kg.toFixed(3), echelle_du_modele_d_origine: +d.s.toFixed(4), source: 'OpenGameArt « Tool Pack 1 », LonesomeDucky, CC0' },
  });
  noeud.machoire.extras = { coulisse: 'axe X du nœud ; vers −X la mâchoire s\'ouvre, vers +X elle se ferme', course_de_fermeture_mm: r1(d.ouverture * 1000) };
  noeud.molette.extras = { axe_de_rotation: 'axe X du nœud' };
  const iM = json.nodes.push(noeud.machoire) - 1, iV = json.nodes.push(noeud.molette) - 1;
  json.scenes[0].nodes.push(json.nodes.push({ ...noeud.corps, children: [iM, iV] }) - 1);
  x += d.max[0] - d.min[0] + 0.03;
}

const out = 'public/equipment/cle-a-molette/unreal';
mkdirSync(out, { recursive: true });
const pad = (4 - (length % 4)) % 4, bin = Buffer.concat([...chunks, Buffer.alloc(pad)]);
json.buffers[0].byteLength = bin.length;
let text = JSON.stringify(json);
while (Buffer.byteLength(text) % 4) text += ' ';
const jb = Buffer.from(text), head = Buffer.alloc(12), jh = Buffer.alloc(8), bh = Buffer.alloc(8);
head.writeUInt32LE(0x46546c67, 0); head.writeUInt32LE(2, 4); head.writeUInt32LE(28 + jb.length + bin.length, 8);
jh.writeUInt32LE(jb.length, 0); jh.writeUInt32LE(0x4e4f534a, 4);
bh.writeUInt32LE(bin.length, 0); bh.writeUInt32LE(0x004e4942, 4);
writeFileSync(join(out, 'SM_Cles_A_Molette.glb'), Buffer.concat([head, jh, jb, bh, bin]));
console.log(`${join(out, 'SM_Cles_A_Molette.glb')} : ${((28 + jb.length + bin.length) / 1e6).toFixed(2)} Mo, ${SIZES.length} clés, ${triangles} triangles`);

// Exporte pour Unreal Engine (ou Blender, ou tout logiciel qui lit le glTF) l'étui en cuir de la clé à molette.
//
//   public/equipment/etui-cle-molette/unreal/
//     SM_Etui_Cle_A_Molette.glb   l'étui seul, en un maillage à deux matériaux (cuir, rivets) ; UV en projection
//                                 par boîte (1 unité = 10 cm), pour y poser un cuir qui se répète
//     etui-avec-cle.glb           l'étui et la clé à molette de 12 po rangée dedans, mâchoires fermées (corps,
//                                 mâchoire et molette de la clé, avec leurs textures)
//
// Repère des deux fichiers : celui de l'étui tel qu'il est porté, en mètres. Y vers le haut depuis le bord du
// bas, X largeur, Z vers l'extérieur ; l'origine est au milieu du bord du bas, sur la face avant du dos.
//
// La clé et ses textures sont celles du « Tool Pack 1 » d'OpenGameArt (CC0, LonesomeDucky) : --textures donne
// le dossier qui contient diff.png, nor.png et mr.png (voir scripts/export-cle-molette-unreal.mjs).
//
// Usage : node scripts/export-etui-unreal.mjs --textures <dossier>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders, { H, LARGEUR, PROFONDEUR, CUIR, PASSANT, AVANT, CEINTURE, pose } from '../src/models/etui-cle-molette/index.js';
import { base, dims } from '../src/models/cle-a-molette/forme.js';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : def; };
const texDir = opt('--textures', null);
if (!texDir) throw new Error('--textures <dossier> manquant : voir l\'en-tête du script.');
const TEX = Object.fromEntries(['diff', 'nor', 'mr'].map((k) => [k, readFileSync(join(texDir, `${k}.png`))]));

// ------------------------------------------------------------------ écriture d'un .glb

function glb() {
  const json = { asset: { version: '2.0', generator: 'pieces-3d scripts/export-etui-unreal.mjs' }, scene: 0, scenes: [{ name: 'Scene', nodes: [] }], nodes: [], meshes: [], materials: [], accessors: [], bufferViews: [], buffers: [{}] };
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
    const a = { bufferView: view(array, target), componentType: array instanceof Float32Array ? 5126 : array instanceof Uint32Array ? 5125 : 5123, count: array.length / size, type };
    if (bounds) {
      a.min = [Infinity, Infinity, Infinity]; a.max = [-Infinity, -Infinity, -Infinity];
      for (let i = 0; i < array.length; i++) { a.min[i % 3] = Math.min(a.min[i % 3], array[i]); a.max[i % 3] = Math.max(a.max[i % 3], array[i]); }
    }
    return json.accessors.push(a) - 1;
  };
  return {
    json,
    material(def) { return json.materials.push(def) - 1; },
    /** Matériau texturé de la clé : rugosité dans le vert, métal dans le bleu, normales OpenGL. */
    cleMaterial() {
      json.samplers = [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }];
      json.images = ['diff', 'nor', 'mr'].map((k) => ({ name: `T_Cle_A_Molette_${k}`, mimeType: 'image/png', bufferView: view(TEX[k]) }));
      json.textures = json.images.map((_, i) => ({ sampler: 0, source: i }));
      return json.materials.push({ name: 'M_Cle_A_Molette', doubleSided: true, pbrMetallicRoughness: { baseColorTexture: { index: 0 }, metallicRoughnessTexture: { index: 2 } }, normalTexture: { index: 1 } }) - 1;
    },
    /** Maillage à une ou plusieurs parties [{ P, N, uv, I, material }]. */
    mesh(name, parts) {
      return json.meshes.push({ name, primitives: parts.map((g) => ({ attributes: { POSITION: accessor(g.P, 'VEC3', 34962, true), NORMAL: accessor(g.N, 'VEC3', 34962), TEXCOORD_0: accessor(g.uv, 'VEC2', 34962) }, indices: accessor(g.I, 'SCALAR', 34963), material: g.material })) }) - 1;
    },
    node(def, root = true) { const i = json.nodes.push(def) - 1; if (root) json.scenes[0].nodes.push(i); return i; },
    write(file) {
      const pad = (4 - (length % 4)) % 4, bin = Buffer.concat([...chunks, Buffer.alloc(pad)]);
      json.buffers[0].byteLength = bin.length;
      let text = JSON.stringify(json);
      while (Buffer.byteLength(text) % 4) text += ' ';
      const jb = Buffer.from(text), head = Buffer.alloc(12), jh = Buffer.alloc(8), bh = Buffer.alloc(8);
      head.writeUInt32LE(0x46546c67, 0); head.writeUInt32LE(2, 4); head.writeUInt32LE(28 + jb.length + bin.length, 8);
      jh.writeUInt32LE(jb.length, 0); jh.writeUInt32LE(0x4e4f534a, 4);
      bh.writeUInt32LE(bin.length, 0); bh.writeUInt32LE(0x004e4942, 4);
      writeFileSync(file, Buffer.concat([head, jh, jb, bh, bin]));
      return 28 + jb.length + bin.length;
    },
  };
}

// ------------------------------------------------------------------ géométries

/** L'étui (page P001) : sommets dans son repère, regroupés par matériau ; UV en projection par boîte (1 unité = 10 cm). */
function etui() {
  const model = buildProcedural(builders, 'P001');
  model.root.updateMatrixWorld(true);
  const groupes = new Map();
  const v = new THREE.Vector3(), nrm = new THREE.Vector3(), n3 = new THREE.Matrix3();
  model.root.traverse((o) => {
    if (!o.isMesh) return;
    const cle = o.material.name === 'etui-cuir' ? 'cuir' : 'rivets';
    if (!groupes.has(cle)) groupes.set(cle, { P: [], N: [], uv: [] });
    const out = groupes.get(cle), g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry;
    if (!g.attributes.normal) g.computeVertexNormals();
    n3.getNormalMatrix(o.matrixWorld);
    for (let i = 0; i < g.attributes.position.count; i++) {
      v.fromBufferAttribute(g.attributes.position, i).applyMatrix4(o.matrixWorld);
      nrm.fromBufferAttribute(g.attributes.normal, i).applyMatrix3(n3).normalize();
      out.P.push(v.x, v.y, v.z); out.N.push(nrm.x, nrm.y, nrm.z);
      const ax = Math.abs(nrm.x), ay = Math.abs(nrm.y), az = Math.abs(nrm.z);
      if (ax >= ay && ax >= az) out.uv.push(v.z * 10, v.y * 10); else if (ay >= az) out.uv.push(v.x * 10, v.z * 10); else out.uv.push(v.x * 10, v.y * 10);
    }
  });
  const fini = (g) => { const n = g.P.length / 3; return { P: new Float32Array(g.P), N: new Float32Array(g.N), uv: new Float32Array(g.uv), I: Uint32Array.from({ length: n }, (_, i) => i), tris: n / 3 }; };
  return { cuir: fini(groupes.get('cuir')), rivets: fini(groupes.get('rivets')) };
}

const CUIR_BRUN = { name: 'M_Etui_Cuir', pbrMetallicRoughness: { baseColorFactor: [0.102, 0.044, 0.018, 1], metallicFactor: 0, roughnessFactor: 0.8 } };
const RIVET = { name: 'M_Etui_Rivet', pbrMetallicRoughness: { baseColorFactor: [0.565, 0.604, 0.644, 1], metallicFactor: 1, roughnessFactor: 0.34 } };
const r4 = (x) => +x.toFixed(4), r1 = (x) => +x.toFixed(1);
const q = pose(), e = etui();
const extras = {
  hauteur_mm: r1(H), largeur_haut_mm: r1(LARGEUR.haut), largeur_bas_mm: r1(LARGEUR.bas), profondeur_mm: r1(PROFONDEUR),
  origine: 'milieu du bord du bas, sur la face avant du dos ; Y vers le haut, Z vers l\'extérieur',
  ceinture: { axe: 'X', centre_m: [0, r4((H - CUIR - 1 - CEINTURE.large / 2) / 1000), r4((-CUIR - PASSANT / 2) / 1000)], largeur_supposee_mm: r1(CEINTURE.large) },
  provenance: 'reconstitution d\'après une photo de 44 × 96 pixels ; dos, passant et profondeur supposés',
};
const out = 'public/equipment/etui-cle-molette/unreal';
mkdirSync(out, { recursive: true });
const report = [];
{
  const f = glb();
  f.node({ name: 'SM_Etui_Cle_A_Molette', mesh: f.mesh('SM_Etui_Cle_A_Molette', [{ ...e.cuir, material: f.material(CUIR_BRUN) }, { ...e.rivets, material: f.material(RIVET) }]), extras });
  report.push(['SM_Etui_Cle_A_Molette.glb', f.write(join(out, 'SM_Etui_Cle_A_Molette.glb'))]);
}
{
  const f = glb(), b = base(), d = dims();
  f.node({ name: 'SM_Etui_Cle_A_Molette', mesh: f.mesh('SM_Etui_Cle_A_Molette', [{ ...e.cuir, material: f.material(CUIR_BRUN) }, { ...e.rivets, material: f.material(RIVET) }]), extras });
  const mat = f.cleMaterial(), NOMS = { corps: 'Corps', machoire: 'Machoire', molette: 'Molette' }, noeud = {};
  for (const [k, p] of Object.entries(b.pieces)) {
    const uv = p.uv, I = p.I, P = p.P.map((x) => x * d.s);
    noeud[k] = { name: `Cle_A_Molette_12po_${NOMS[k]}`, mesh: f.mesh(`SM_Cle_A_Molette_12po_${NOMS[k]}`, [{ P, N: p.N, uv, I, material: mat }]), translation: p.t.map((x) => x * d.s), rotation: p.q };
  }
  // Mâchoires fermées : la mâchoire mobile recule de l'ouverture du modèle, à l'opposé du sens d'ouverture.
  noeud.machoire.translation = noeud.machoire.translation.map((x, i) => r4(x - b.ouvre[i] * d.ouverture));
  noeud.molette.translation = noeud.molette.translation.map(r4);
  const enfants = [f.node(noeud.machoire, false), f.node(noeud.molette, false)];
  // Clé debout dans l'étui : (x, y, z) de la clé → (X, Y = −z, Z = y), soit un quart de tour autour de X.
  const t = [q.x / 1000, (H + q.z) / 1000, (AVANT - CUIR) / 2000].map(r4);
  f.node({ name: 'Cle_A_Molette_12po', mesh: noeud.corps.mesh, children: enfants, translation: t, rotation: [r4(Math.SQRT1_2), 0, 0, r4(Math.SQRT1_2)], extras: { machoires: 'fermées', tete_au_dessus_de_l_etui_mm: r1(q.dessus), manche_sous_l_etui_mm: r1(q.dessous), pose: 'calculée : les épaules de la tête s\'appuient sur la gueule du fourreau' } });
  report.push(['etui-avec-cle.glb', f.write(join(out, 'etui-avec-cle.glb'))]);
}
console.log(`étui : ${e.cuir.tris + e.rivets.tris} triangles (cuir ${e.cuir.tris}, rivets ${e.rivets.tris})`);
for (const [file, bytes] of report) console.log(`${join(out, file)} : ${(bytes / 1e6).toFixed(2)} Mo`);

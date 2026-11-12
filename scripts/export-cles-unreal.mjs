// Exporte pour Unreal Engine (ou Blender, ou tout logiciel qui lit le glTF) les clés à tuyau droites et le
// support à pipewrench 0102806, à partir des modèles du site.
//
//   public/equipment/cles-a-tuyau/unreal/
//     SM_Cles_A_Tuyau.glb        les neuf grandeurs (6 à 60 po), mâchoires presque fermées, un maillage par
//                                grandeur à l'échelle 1, un seul matériau texturé partagé
//   public/equipment/support-pipewrench/unreal/
//     SM_Support_Pipewrench.glb  le support seul, en un maillage peint en rouge ; origine au sol, au milieu de la base
//     support-avec-cles.glb      le support, les clés de 18, 24 et 36 po posées en contre-clé (mâchoires vers le
//                                haut, ouvertes pour la tige NQ) et la tige de chacune : les trois mises en
//                                situation sont superposées, on garde celle qu'on veut
//     support-avec-cles.json     pose de chaque clé et de sa tige (mètres du glTF et centimètres d'Unreal)
//
// Les textures de la clé (couleur, normales, occlusion-rugosité-métal) sont celles de Poly Haven (CC0,
// https://polyhaven.com/a/pipe_wrench). Elles ne sont pas dans le dépôt : --textures donne le dossier qui
// contient pipe_wrench_diff_2k.jpg, pipe_wrench_nor_gl_2k.jpg et pipe_wrench_arm_2k.jpg, téléchargés de
// https://dl.polyhaven.org/file/ph-assets/Models/jpg/2k/pipe_wrench/ (--res 4k pour les fichiers 4k).
//
// Usage : node scripts/export-cles-unreal.mjs --textures <dossier> [--res 2k]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import supportBuilders from '../src/models/support-pipewrench/index.js';
import { pose, NQ } from '../src/models/support-pipewrench/situation.js';
import { base, shape, SPECS, SIZES, IN } from '../src/models/cles-a-tuyau/forme.js';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : def; };
const texDir = opt('--textures', null), res = opt('--res', '2k');
if (!texDir) throw new Error('--textures <dossier> manquant : voir l\'en-tête du script pour les trois fichiers à télécharger de Poly Haven.');
const texture = (kind) => readFileSync(join(texDir, `pipe_wrench_${kind}_${res}.jpg`));
const TEX = { diff: texture('diff'), nor: texture('nor_gl'), arm: texture('arm') };

// ------------------------------------------------------------------ écriture d'un .glb

/** Petit écrivain de glTF binaire : maillages (positions, normales, UV, triangles), matériaux, images JPEG incluses. */
function glb() {
  const json = { asset: { version: '2.0', generator: 'pieces-3d scripts/export-cles-unreal.mjs' }, scene: 0, scenes: [{ name: 'Scene', nodes: [] }], nodes: [], meshes: [], materials: [], accessors: [], bufferViews: [], buffers: [{}] };
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
    /** Matériau texturé de la clé (ORM : occlusion R, rugosité V, métal B, comme le fichier de Poly Haven). */
    wrenchMaterial() {
      json.samplers = [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }];
      json.images = ['diff', 'nor', 'arm'].map((k) => ({ name: `T_Cle_A_Tuyau_${k}`, mimeType: 'image/jpeg', bufferView: view(TEX[k]) }));
      json.textures = json.images.map((_, i) => ({ sampler: 0, source: i }));
      return json.materials.push({
        name: 'M_Cle_A_Tuyau', doubleSided: true,
        pbrMetallicRoughness: { baseColorTexture: { index: 0 }, metallicRoughnessTexture: { index: 2 } },
        normalTexture: { index: 1 }, occlusionTexture: { index: 2 },
      }) - 1;
    },
    mesh(name, g, material) {
      const attributes = { POSITION: accessor(g.P, 'VEC3', 34962, true), NORMAL: accessor(g.N, 'VEC3', 34962) };
      if (g.uv) attributes.TEXCOORD_0 = accessor(g.uv, 'VEC2', 34962);
      return json.meshes.push({ name, primitives: [{ attributes, indices: accessor(g.I, 'SCALAR', 34963), material }] }) - 1;
    },
    node(def) { const i = json.nodes.push(def) - 1; json.scenes[0].nodes.push(i); return i; },
    write(file) {
      const pad = (4 - (length % 4)) % 4;
      const bin = Buffer.concat([...chunks, Buffer.alloc(pad)]);
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

/** Clé de grandeur « size » ; open : ouverture des mâchoires en mètres (null : comme le modèle). */
function cle(size, open = null) {
  const m = base(), w = shape(size, open);
  return { P: w.P, N: w.N, uv: m.uv, I: m.I, w };
}

/** Support complet (P001) en un seul maillage : sommets dans le repère du modèle, UV en projection par boîte (1 unité = 1 m). */
function support() {
  const model = buildProcedural(supportBuilders, 'P001');
  model.root.updateMatrixWorld(true);
  const P = [], N = [], uv = [];
  const v = new THREE.Vector3(), nrm = new THREE.Vector3(), n3 = new THREE.Matrix3();
  model.root.traverse((o) => {
    if (!o.isMesh) return;
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry;
    if (!g.attributes.normal) g.computeVertexNormals();
    n3.getNormalMatrix(o.matrixWorld);
    for (let i = 0; i < g.attributes.position.count; i++) {
      v.fromBufferAttribute(g.attributes.position, i).applyMatrix4(o.matrixWorld);
      nrm.fromBufferAttribute(g.attributes.normal, i).applyMatrix3(n3).normalize();
      P.push(v.x, v.y, v.z); N.push(nrm.x, nrm.y, nrm.z);
      const ax = Math.abs(nrm.x), ay = Math.abs(nrm.y), az = Math.abs(nrm.z);
      if (ax >= ay && ax >= az) uv.push(v.z, v.y); else if (ay >= az) uv.push(v.x, v.z); else uv.push(v.x, v.y);
    }
  });
  const count = P.length / 3;
  return { P: new Float32Array(P), N: new Float32Array(N), uv: new Float32Array(uv), I: Uint32Array.from({ length: count }, (_, i) => i), tris: count / 3 };
}

/** Tronçon de tige : tube le long de Z, centré à l'origine. */
function tige() {
  const seg = 48, P = [], N = [], I = [];
  const ring = (r, z, nr, nz) => { const b = P.length / 3; for (let i = 0; i <= seg; i++) { const t = (i / seg) * 2 * Math.PI; P.push(r * Math.cos(t), r * Math.sin(t), z); N.push(nr * Math.cos(t), nr * Math.sin(t), nz); } return b; };
  const band = (a, b, flip) => { for (let i = 0; i < seg; i++) { const q = [a + i, a + i + 1, b + i + 1, b + i]; I.push(...(flip ? [q[0], q[2], q[1], q[0], q[3], q[2]] : [q[0], q[1], q[2], q[0], q[2], q[3]])); } };
  const ro = NQ.od / 2, ri = NQ.id / 2, h = NQ.len / 2;
  band(ring(ro, -h, 1, 0), ring(ro, h, 1, 0), false);
  band(ring(ri, -h, -1, 0), ring(ri, h, -1, 0), true);
  band(ring(ri, h, 0, 1), ring(ro, h, 0, 1), true);
  band(ring(ri, -h, 0, -1), ring(ro, -h, 0, -1), false);
  return { P: new Float32Array(P), N: new Float32Array(N), I: new Uint16Array(I) };
}

const ROUGE = { name: 'M_Support_Rouge', pbrMetallicRoughness: { baseColorFactor: [0.462, 0.006, 0.0103, 1], metallicFactor: 0, roughnessFactor: 0.45 } };
const ACIER = { name: 'M_Tige_Acier', pbrMetallicRoughness: { baseColorFactor: [0.33, 0.31, 0.29, 1], metallicFactor: 1, roughnessFactor: 0.55 } };
const r4 = (x) => +x.toFixed(4), r2 = (x) => +x.toFixed(2);
const po = (m) => r2(m / IN);
const report = [];

// ------------------------------------------------------------------ 1. les neuf grandeurs

{
  const out = 'public/equipment/cles-a-tuyau/unreal';
  mkdirSync(out, { recursive: true });
  const f = glb(), mat = f.wrenchMaterial();
  let x = 0;
  for (const size of SIZES) {
    const g = cle(size), w = g.w, name = `SM_Cle_A_Tuyau_${String(size).padStart(2, '0')}po`;
    // couchée à plat, manche le long de Z, bouts de manche alignés, rangée par grandeur le long de X
    f.node({ name, mesh: f.mesh(name, g, mat), rotation: [Math.SQRT1_2, 0, 0, Math.SQRT1_2], translation: [r4(x - w.min[0]), r4(w.max[2]), r4(-w.min[1])], extras: { grandeur_po: size, catalogue: SPECS[size].pn, longueur_po: po(w.max[1] - w.min[1]), largeur_po: po(w.max[0] - w.min[0]), epaisseur_po: po(w.max[2] - w.min[2]), masse_lb: r2(w.kg / 0.45359237) } });
    x += w.max[0] - w.min[0] + 0.04;
  }
  report.push([join(out, 'SM_Cles_A_Tuyau.glb'), f.write(join(out, 'SM_Cles_A_Tuyau.glb'))]);
}

// ------------------------------------------------------------------ 2. le support, seul puis avec les clés

{
  const out = 'public/equipment/support-pipewrench/unreal';
  mkdirSync(out, { recursive: true });
  const sup = support();
  {
    const f = glb();
    f.node({ name: 'SM_Support_Pipewrench', mesh: f.mesh('SM_Support_Pipewrench', sup, f.material(ROUGE)) });
    report.push([join(out, 'SM_Support_Pipewrench.glb'), f.write(join(out, 'SM_Support_Pipewrench.glb'))]);
  }
  const f = glb(), matCle = f.wrenchMaterial(), rod = f.mesh('SM_Tige_NQ', tige(), f.material(ACIER));
  f.node({ name: 'SM_Support_Pipewrench', mesh: f.mesh('SM_Support_Pipewrench', sup, f.material(ROUGE)) });
  const ue = (p) => ({ X: r2(p[0] * 100), Y: r2(p[2] * 100), Z: r2(p[1] * 100) });
  const fiche = {
    unites: 'glTF : mètres, Y vers le haut, +Z vers l\'avant du support (côté goupille). Unreal : centimètres, X = X du glTF, Y = Z du glTF, Z = Y du glTF.',
    origine: 'au sol, au milieu de la base du support',
    tige: { calibre: 'NQ', diametre_exterieur_mm: NQ.od * 1000, diametre_interieur_mm: NQ.id * 1000, longueur_m: NQ.len, axe: 'Z du glTF (Y d\'Unreal)' },
    cles: {},
  };
  for (const size of [18, 24, 36]) {
    const p = pose(size), g = cle(size, NQ.od), h = Math.PI / 4 - p.phi / 2;
    const tCle = [(p.ox - 12.75) * IN, p.oy * IN, 0], tTige = [(p.rod[0] - 12.75) * IN, p.rod[1] * IN, 0];
    // Clé : X vers le haut (ouverture des mâchoires), Y du manche vers la tête en descendant la pente, Z vers l'arrière.
    const name = `SM_Cle_A_Tuyau_${size}po_NQ`;
    f.node({ name: `Cle_${size}po`, mesh: f.mesh(name, g, matCle), rotation: [r4(Math.cos(h)), r4(Math.sin(h)), 0, 0], translation: tCle.map(r4), extras: { grandeur_po: size, catalogue: SPECS[size].pn, ouverture_mm: NQ.od * 1000 } });
    f.node({ name: `Tige_NQ_${size}po`, mesh: rod, translation: tTige.map(r4), extras: { pour: `clé de ${size} po` } });
    fiche.cles[`${size} po`] = {
      maillage: name, catalogue: SPECS[size].pn,
      angle_du_manche_deg: r2((p.phi * 180) / Math.PI), sens: 'positif : la tête descend vers le bout du support',
      manche: p.slid > 0.01 ? `descendu de ${r2(p.slid)} po dans la pente` : 'contre la butée du haut',
      tenue: p.held ? 'bascule sans goupille : montrée tenue dans la chape du haut' : 'au repos par gravité',
      cle: { gltf_m: tCle.map(r4), rotation_gltf_xyzw: [r4(Math.cos(h)), r4(Math.sin(h)), 0, 0], unreal_cm: ue(tCle) },
      tige: { gltf_m: tTige.map(r4), unreal_cm: ue(tTige), distance_du_bout_plie_po: r2(p.rod[0]), hauteur_de_l_axe_po: r2(p.rod[1]) },
    };
  }
  report.push([join(out, 'support-avec-cles.glb'), f.write(join(out, 'support-avec-cles.glb'))]);
  writeFileSync(join(out, 'support-avec-cles.json'), `${JSON.stringify(fiche, null, 1)}\n`);
  report.push([join(out, 'support-avec-cles.json'), JSON.stringify(fiche, null, 1).length]);
  console.log(`support : ${sup.tris} triangles en un maillage`);
}
for (const [file, bytes] of report) console.log(`${file} : ${(bytes / 1e6).toFixed(2)} Mo`);

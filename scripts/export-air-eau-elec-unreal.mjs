// Exporte le lot air, eau et électricité (air-eau-electricite) en glTF binaire pour Unreal Engine :
//
//   public/equipment/air-eau-electricite/unreal/
//     SM_AEE_P00_Place_de_travail.glb   les quatre lots posés ensemble (mur à z = 0)
//     SM_AEE_P01_Air.glb                boyaux d'air de 2 po, tressé 800 °F, raccords, whip checks
//     SM_AEE_P02_Eau.glb                boyau d'eau de 1 po, raccords, whip check
//     SM_AEE_P03_Electricite.glb        câble 600 V, crochets, boîte de défaut à la terre, console, arrêt d'urgence
//     SM_AEE_P04_Balisage.glb           trépieds, bidons, banderole DANGER
//
// Mètres, Y vers le haut (Unreal convertit à l'import). Un nœud par pièce de la liste (nommé d'après la fiche),
// matériaux PBR nommés M_AEE_<nom> avec leurs textures (couleur sale et normales, JPEG) incorporées : les mêmes
// que le site (tools/air_eau_elec_textures.mjs). Voir docs/air-eau-elec-unreal.md.
//
// Usage : node scripts/export-air-eau-elec-unreal.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders, { MATERIAUX } from '../src/models/air-eau-electricite/index.js';

globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then((b) => { this.result = b; this.onloadend?.(); }); }
};

const EQ = new URL('../public/equipment/air-eau-electricite/', import.meta.url);
const data = JSON.parse(readFileSync(new URL('data.json', EQ), 'utf8'));
const OUT = new URL('unreal/', EQ);
mkdirSync(OUT, { recursive: true });
const FICHIERS = { P00: 'Place_de_travail', P01: 'Air', P02: 'Eau', P03: 'Electricite', P04: 'Balisage' };

const ascii = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
/** Nom court d'une ligne de la liste : ce qui précède la première virgule. */
const nomLigne = (asm, ref) => {
  const l = data.assemblies[asm].parts.find((p) => p[0] === ref);
  return l ? ascii(l[3].split(/[,(]/)[0]).slice(0, 48) : `Ref_${ref}`;
};

async function exporter(id) {
  const model = buildProcedural(builders, id);
  const scene = new THREE.Scene();
  scene.add(model.root);
  model.root.updateMatrixWorld(true);
  // Noms des nœuds : SM_AEE_<page>_<repère>_<nom>_<n>, sous-assemblages de P00 nommés d'après leur page.
  const compte = new Map();
  const nommer = (o, asm) => {
    const ref = o.userData.partRef;
    const k = `${asm}|${ref}`;
    compte.set(k, (compte.get(k) || 0) + 1);
    o.name = `SM_AEE_${asm}_${ref.padStart(2, '0')}_${nomLigne(asm, ref)}_${compte.get(k)}`;
  };
  for (const p of model.parts) {
    if (id === 'P00') {
      const lien = data.assemblies.P00.parts.find((l) => l[0] === p.userData.partRef)[4].link;
      p.name = `AEE_${lien}_${FICHIERS[lien]}`;
      p.traverse((o) => { if (o !== p && o.userData.partRef && o.parent === p) nommer(o, lien); });
    } else nommer(p, id);
  }
  scene.traverse((o) => { const n = o.name; o.userData = {}; o.name = n; });
  const glb = Buffer.from(await new GLTFExporter().parseAsync(scene, { binary: true, onlyVisible: true }));

  // Relit le .glb, ajoute les textures du site aux matériaux M_AEE_<nom>.
  const jl = glb.readUInt32LE(12);
  const json = JSON.parse(glb.subarray(20, 20 + jl).toString('utf8'));
  const bl = glb.readUInt32LE(20 + jl);
  const parts = [glb.subarray(28 + jl, 28 + jl + bl)];
  let longueur = bl;
  const ajouter = (buf) => {
    const pad = (4 - (longueur % 4)) % 4;
    if (pad) { parts.push(Buffer.alloc(pad)); longueur += pad; }
    json.bufferViews.push({ buffer: 0, byteOffset: longueur, byteLength: buf.length });
    parts.push(buf); longueur += buf.length;
    return json.bufferViews.length - 1;
  };
  json.images ||= []; json.textures ||= []; json.samplers ||= [];
  const sRep = json.samplers.push({ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }) - 1;
  const sBord = json.samplers.push({ magFilter: 9729, minFilter: 9987, wrapS: 33071, wrapT: 33071 }) - 1;
  const deja = new Map();
  const tex = (nom, fixe) => {
    if (deja.has(nom)) return deja.get(nom);
    const buf = readFileSync(new URL(`textures/${nom}.jpg`, EQ));
    const img = json.images.push({ name: `T_AEE_${nom}`, mimeType: 'image/jpeg', bufferView: ajouter(buf) }) - 1;
    const t = json.textures.push({ sampler: fixe ? sBord : sRep, source: img }) - 1;
    deja.set(nom, t);
    return t;
  };
  for (const m of json.materials || []) {
    const d = MATERIAUX[m.name.replace(/^M_AEE_/, '')];
    if (!d?.tex) continue;
    m.pbrMetallicRoughness ||= {};
    const a = m.pbrMetallicRoughness.baseColorFactor?.[3] ?? 1;
    m.pbrMetallicRoughness.baseColorFactor = [1, 1, 1, a];
    m.pbrMetallicRoughness.baseColorTexture = { index: tex(d.tex, d.uvFixe) };
    if (d.n) m.normalTexture = { index: tex(`${d.tex}-n`, false) };
  }
  json.asset.generator = 'pieces-3d scripts/export-air-eau-elec-unreal.mjs';
  json.scenes[0].extras = { source: 'Pièces 3D, air-eau-electricite', unites: 'mètres, Y vers le haut', page: id };
  const bin = Buffer.concat([...parts, Buffer.alloc((4 - (longueur % 4)) % 4)]);
  json.buffers[0].byteLength = bin.length;
  let texte = JSON.stringify(json);
  while (Buffer.byteLength(texte) % 4) texte += ' ';
  const jb = Buffer.from(texte), tete = Buffer.alloc(12), jh = Buffer.alloc(8), bh = Buffer.alloc(8);
  tete.writeUInt32LE(0x46546c67, 0); tete.writeUInt32LE(2, 4); tete.writeUInt32LE(28 + jb.length + bin.length, 8);
  jh.writeUInt32LE(jb.length, 0); jh.writeUInt32LE(0x4e4f534a, 4);
  bh.writeUInt32LE(bin.length, 0); bh.writeUInt32LE(0x004e4942, 4);
  const nom = `SM_AEE_${id}_${FICHIERS[id]}.glb`;
  writeFileSync(new URL(nom, OUT), Buffer.concat([tete, jh, jb, bh, bin]));
  let tris = 0;
  for (const me of json.meshes) for (const pr of me.primitives) tris += (pr.indices !== undefined ? json.accessors[pr.indices].count : json.accessors[pr.attributes.POSITION].count) / 3;
  console.log(`${nom} : ${json.nodes.length} nœuds, ${Math.round(tris)} triangles, ${json.materials.length} matériaux, ${json.images.length} textures, ${((28 + jb.length + bin.length) / 1e6).toFixed(1)} Mo`);
}

for (const id of Object.keys(FICHIERS)) await exporter(id);

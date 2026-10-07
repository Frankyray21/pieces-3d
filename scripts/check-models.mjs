// Contrôle des modèles 3D procéduraux (exécuté dans Node, sans navigateur).
// Pour chaque assemblage du manuel : construit le modèle, vérifie que chaque
// ligne de la liste de pièces a un objet 3D (ou une pièce symétrique), et
// mesure la taille du modèle (maillages, triangles).
//
// Les trousses (« SEAL KIT », « REPLACEMENT KIT »…) peuvent rester sans objet 3D.
// Pour un équipement modélisé en partie, seuls les assemblages qui ont un
// builder sont contrôlés.
//
// Usage : node scripts/check-models.mjs [--eq du311] [F05 F08 ...]
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';

const args = process.argv.slice(2);
const at = args.indexOf('--eq');
const eq = at >= 0 ? args.splice(at, 2)[1] : 'cubex-mri-5200';
const { default: builders } = await import(`../src/models/${eq}/index.js`);
const data = JSON.parse(readFileSync(new URL(`../public/equipment/${eq}/data.json`, import.meta.url), 'utf8'));
const only = args;
const partial = Object.keys(data.assemblies).some((id) => !builders[id]);
let failed = false;

function stats(root) {
  let meshes = 0, tris = 0;
  root.traverse((o) => {
    if (!o.isMesh) return;
    meshes++;
    const g = o.geometry;
    const n = g.index ? g.index.count / 3 : g.attributes.position.count / 3;
    tris += n * (o.isInstancedMesh ? o.count : 1);
  });
  return { meshes, tris: Math.round(tris) };
}

for (const [id, asm] of Object.entries(data.assemblies)) {
  if (only.length && !only.includes(id)) continue;
  if (partial && !builders[id]) continue;
  let model;
  try {
    model = buildProcedural(builders, id);
  } catch (err) {
    console.log(`✕ ${id} : erreur de construction — ${err.stack.split('\n').slice(0, 3).join(' | ')}`);
    failed = true;
    continue;
  }
  if (!model) { console.log(`✕ ${id} : aucun builder`); failed = true; continue; }
  const missing = [];
  const rows = asm.parts.map(([ref, , , desc, extra = {}]) => ({ ref: String(ref), desc, ...extra }));
  for (const r of rows) {
    const target = r.mirrorOf || r.ref;
    if (!model.refs.has(target) && !/\bKIT\b/i.test(r.desc)) missing.push(r.ref);
  }
  const extra = [...model.refs.keys()].filter((k) => !rows.some((r) => r.ref === k));
  const nan = [];
  model.root.updateMatrixWorld(true);
  model.parts.forEach((p) => {
    const b = new THREE.Box3().setFromObject(p);
    if (!Number.isFinite(b.min.x) || !Number.isFinite(b.max.y)) nan.push(p.userData.partRef);
  });
  const s = stats(model.root);
  const size = new THREE.Box3().setFromObject(model.root).getSize(new THREE.Vector3());
  const ok = !missing.length && !extra.length && !nan.length;
  if (!ok) failed = true;
  console.log(`${ok ? '✓' : '✕'} ${id} : ${model.parts.length} objets, ${s.meshes} maillages, ${s.tris.toLocaleString('fr-CA')} triangles, ` +
    `taille ${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)} m` +
    `${missing.length ? ` — SANS 3D : ${missing.join(', ')}` : ''}${extra.length ? ` — repères inconnus : ${extra.join(', ')}` : ''}${nan.length ? ` — boîtes invalides : ${nan.join(', ')}` : ''}`);
}
process.exit(failed ? 1 : 0);

// Contrôle de la disposition d'un ensemble (vue de dessus) : distance minimale
// au sol entre les pièces de premier niveau (sommets des maillages projetés sur
// XZ, hors boyaux ajoutés hors liste), direction de la face de chaque pièce.
// Usage : node scripts/check-layout.mjs --eq stm-1500 P002 [--min 3] [--ref 1]
// --ref : la distance minimale ne s'applique qu'aux paires qui comprennent ce repère.
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args.splice(i, 2)[1] : d; };
const eq = opt('--eq', 'stm-1500');
const min = Number(opt('--min', '0'));
const only = opt('--ref', null);
const id = args[0] || 'P002';
const { default: builders } = await import(`../src/models/${eq}/index.js`);
const data = (await import(`../public/equipment/${eq}/data.json`, { with: { type: 'json' } })).default;
const model = buildProcedural(builders, id);
model.root.updateMatrixWorld(true);
const rows = new Map(data.assemblies[id].parts.map((r) => [String(r[0]), r[3]]));

// Points au sol (XZ) de chaque pièce, sous-échantillonnés sur une grille de 2 cm.
const pts = new Map();
for (const [ref, objs] of model.refs) {
  const set = new Map();
  const v = new THREE.Vector3();
  for (const o of objs) o.traverse((m) => {
    if (!m.isMesh) return;
    const p = m.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld);
      const k = `${Math.round(v.x / 0.02)},${Math.round(v.z / 0.02)}`;
      if (!set.has(k)) set.set(k, [v.x, v.z]);
    }
  });
  pts.set(ref, [...set.values()]);
}
const refs = [...pts.keys()];
let fail = false;
for (let a = 0; a < refs.length; a++) for (let b = a + 1; b < refs.length; b++) {
  const A = pts.get(refs[a]), B = pts.get(refs[b]);
  let best = Infinity, pa, pb;
  for (const p of A) for (const q of B) {
    const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
    if (d < best) { best = d; pa = p; pb = q; }
  }
  const d = Math.sqrt(best);
  const bad = min && d < min && (!only || refs[a] === only || refs[b] === only);
  if (bad) fail = true;
  console.log(`${bad ? '✕' : '✓'} ${refs[a]} (${rows.get(refs[a])}) ↔ ${refs[b]} (${rows.get(refs[b])}) : ${d.toFixed(2)} m` +
    ` entre (${pa.map((x) => x.toFixed(2)).join(', ')}) et (${pb.map((x) => x.toFixed(2)).join(', ')})`);
}
// Face de chaque pièce : +Z local dans le repère de l'ensemble (vue de dessus).
for (const [ref, objs] of model.refs) {
  const dir = new THREE.Vector3(0, 0, 1).transformDirection(objs[0].matrixWorld);
  const box = new THREE.Box3().setFromObject(objs[0]);
  const c = box.getCenter(new THREE.Vector3());
  console.log(`  ${ref} centre (${c.x.toFixed(2)}, ${c.z.toFixed(2)}), +Z local → (${dir.x.toFixed(2)}, ${dir.z.toFixed(2)})`);
}
process.exit(fail ? 1 : 0);

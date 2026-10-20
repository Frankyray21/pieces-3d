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

// Points au sol (XZ) de chaque pièce : sommets et points le long des arêtes des
// triangles tous les 2 cm (une grande face plane compte aussi), un point par case de 1 cm.
const pts = new Map();
for (const [ref, objs] of model.refs) {
  const set = new Map();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), q = new THREE.Vector3();
  const add = (v) => {
    const k = `${Math.round(v.x / 0.01)},${Math.round(v.z / 0.01)}`;
    if (!set.has(k)) set.set(k, [v.x, v.z]);
  };
  for (const o of objs) o.traverse((m) => {
    if (!m.isMesh) return;
    const p = m.geometry.attributes.position;
    const idx = m.geometry.index;
    const n = idx ? idx.count : p.count;
    const at = (i) => (idx ? idx.getX(i) : i);
    for (let t = 0; t + 2 < n; t += 3) {
      for (let e = 0; e < 3; e++) {
        a.fromBufferAttribute(p, at(t + e)).applyMatrix4(m.matrixWorld);
        b.fromBufferAttribute(p, at(t + ((e + 1) % 3))).applyMatrix4(m.matrixWorld);
        const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.02));
        for (let s = 0; s <= steps; s++) add(q.lerpVectors(a, b, s / steps));
      }
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

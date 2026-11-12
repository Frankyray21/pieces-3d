// Écrit src/models/cles-a-tuyau/mesh.js à partir de la clé à tuyau de Poly Haven (CC0,
// https://polyhaven.com/a/pipe_wrench, auteur Will Evarts) : sommets, normales, UV, triangles et
// îlot de chaque sommet (0 crochet, 1 corps du manche, 2 écrou, 3 garniture du crochet, 4 garniture du talon).
// Usage : node tools/cle_polyhaven_mesh.mjs <dossier contenant pipe_wrench_2k.gltf et pipe_wrench.bin>
import { readFileSync, writeFileSync } from 'node:fs';
const dir = process.argv[2];
const gltf = JSON.parse(readFileSync(`${dir}/pipe_wrench_2k.gltf`, 'utf8'));
const bin = readFileSync(`${dir}/${gltf.buffers[0].uri}`);
const view = (k, T, size) => { const a = gltf.accessors[k], v = gltf.bufferViews[a.bufferView]; return new T(bin.buffer.slice(bin.byteOffset + v.byteOffset, bin.byteOffset + v.byteOffset + a.count * size * T.BYTES_PER_ELEMENT)); };
const at = gltf.meshes[0].primitives[0];
const P = view(at.attributes.POSITION, Float32Array, 3), N = view(at.attributes.NORMAL, Float32Array, 3), UV = view(at.attributes.TEXCOORD_0, Float32Array, 2), I = view(at.indices, Uint16Array, 1);
const n = P.length / 3;
const parent = new Int32Array(n).map((_, i) => i);
const find = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
const byPos = new Map();
for (let i = 0; i < n; i++) {
  const k = `${Math.round(P[i * 3] * 1e5)},${Math.round(P[i * 3 + 1] * 1e5)},${Math.round(P[i * 3 + 2] * 1e5)}`;
  if (byPos.has(k)) parent[find(i)] = find(byPos.get(k)); else byPos.set(k, i);
}
for (let t = 0; t < I.length; t += 3) { parent[find(I[t])] = find(I[t + 1]); parent[find(I[t])] = find(I[t + 2]); }
const comps = new Map();
for (let i = 0; i < n; i++) { const r = find(i); if (!comps.has(r)) comps.set(r, []); comps.get(r).push(i); }
const order = [...comps.values()].sort((a, b) => b.length - a.length);
if (order.length !== 5) throw new Error(`5 îlots attendus, ${order.length} trouvés`);
const isl = new Uint8Array(n);
order.forEach((ids, k) => ids.forEach((i) => { isl[i] = k; }));
const b64 = (a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64');
const nq = Int8Array.from(N, (v) => Math.round(v * 127));
writeFileSync(new URL('../src/models/cles-a-tuyau/mesh.js', import.meta.url), `// Fichier produit par tools/cle_polyhaven_mesh.mjs — ne pas modifier à la main.
// Clé à tuyau de Poly Haven (CC0, https://polyhaven.com/a/pipe_wrench, Will Evarts) : ${n} sommets, ${I.length / 3} triangles.
// p : Float32 xyz (m) ; n : Int8 normalisé ; uv : Float32 ; i : Uint16 ; isl : Uint8 (îlot du sommet).
export default {
  p: '${b64(P)}',
  n: '${b64(nq)}',
  uv: '${b64(UV)}',
  i: '${b64(I)}',
  isl: '${b64(isl)}',
};
`);
console.log(`${n} sommets, ${I.length / 3} triangles, îlots : ${order.map((o) => o.length).join(', ')}`);

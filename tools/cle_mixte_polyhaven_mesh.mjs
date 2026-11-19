// Écrit src/models/cles-mixtes/mesh.js à partir de la clé mixte de Poly Haven (CC0,
// https://polyhaven.com/a/combination_wrench, auteur BKS) : sommets, normales, UV, triangles, et les
// repères mesurés sur le maillage (fourche, œil 12 pans) dont forme.js a besoin pour l'ajuster.
// Repère du fichier : X largeur, Y épaisseur (œil relevé vers +Y), Z longueur (fourche vers −Z).
// Usage : node tools/cle_mixte_polyhaven_mesh.mjs <dossier contenant combination_wrench_2k.gltf et combination_wrench.bin>
import { readFileSync, writeFileSync } from 'node:fs';
const dir = process.argv[2];
const gltf = JSON.parse(readFileSync(`${dir}/combination_wrench_2k.gltf`, 'utf8'));
const bin = readFileSync(`${dir}/${gltf.buffers[0].uri}`);
const view = (k, T, size) => { const a = gltf.accessors[k], v = gltf.bufferViews[a.bufferView]; return new T(bin.buffer.slice(bin.byteOffset + v.byteOffset, bin.byteOffset + v.byteOffset + a.count * size * T.BYTES_PER_ELEMENT)); };
const at = gltf.meshes[0].primitives[0];
const P = view(at.attributes.POSITION, Float32Array, 3), N = view(at.attributes.NORMAL, Float32Array, 3), UV = view(at.attributes.TEXCOORD_0, Float32Array, 2), I = view(at.indices, Uint16Array, 1);
const n = P.length / 3;
const ext = (k, keep = () => true) => { let a = 1e9, b = -1e9; for (let i = 0; i < n; i++) if (keep(i)) { a = Math.min(a, P[i * 3 + k]); b = Math.max(b, P[i * 3 + k]); } return [a, b]; };

// --- Fourche : les deux plats des mâchoires, relevés sur la face du dessus (sommet le plus proche de chaque bout).
const yTop = ext(1, (i) => P[i * 3 + 2] < -0.13)[1];
const pick = (x, z) => { let best = -1, d = 1e9; for (let i = 0; i < n; i++) { if (P[i * 3 + 2] > -0.13 || P[i * 3 + 1] < yTop - 2e-4) continue; const e = Math.hypot(P[i * 3] - x, P[i * 3 + 2] - z); if (e < d) { d = e; best = i; } } return [P[best * 3], P[best * 3 + 2]]; };
const flats = [[pick(0.0085, -0.171), pick(0.0114, -0.1544)], [pick(-0.0168, -0.1672), pick(-0.0138, -0.1502)]];
const angles = flats.map(([a, b]) => Math.atan2(b[0] - a[0], b[1] - a[1])); // angle du plat par rapport à Z
if (Math.abs(angles[0] - angles[1]) > 0.01) throw new Error('plats des mâchoires non parallèles');
const jaw = (angles[0] + angles[1]) / 2, cj = Math.cos(jaw), sj = Math.sin(jaw);
// v : distance au plat, perpendiculaire à l'axe de la fourche ; u : le long de cet axe (vers le manche)
const v = ([x, z]) => x * cj - z * sj, u = ([x, z]) => x * sj + z * cj;
const vs = flats.map(([a, b]) => (v(a) + v(b)) / 2);
const opening = vs[0] - vs[1], vc = (vs[0] + vs[1]) / 2;
const uc = Math.max(...flats.flat().map(u)); // fond des plats, côté gorge
const open = { jaw, opening, c: [vc * cj + uc * sj, -vc * sj + uc * cj], width: ext(0, (i) => P[i * 3 + 2] < -0.125).reduce((a, b) => b - a), thick: ext(1, (i) => P[i * 3 + 2] < -0.13).reduce((a, b) => b - a) };

// --- Œil : inclinaison et centre d'après les deux couronnes de pointes des 12 pans (rayon mini).
const ring = (i) => P[i * 3 + 2] > 0.126;
const ex = ext(0, ring), ey = ext(1, ring), ez = ext(2, ring);
let tilt = 0.19, c0 = [(ex[0] + ex[1]) / 2, (ey[0] + ey[1]) / 2, ez[1] - (ex[1] - ex[0]) / 2]; // départ : boîte de l'anneau
let inner = [];
for (let pass = 0; pass < 6; pass++) {
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  const loc = (i) => { const x = P[i * 3] - c0[0], y = P[i * 3 + 1] - c0[1], z = P[i * 3 + 2] - c0[2]; return [x, z * ct + y * st, -z * st + y * ct]; };
  inner = []; for (let i = 0; i < n; i++) { if (P[i * 3 + 2] < 0.12) continue; const l = loc(i); if (Math.hypot(l[0], l[1]) < 0.0141 && Math.abs(l[2]) < 0.012) inner.push(i); }
  const hs = inner.map((i) => loc(i)[2]), mid = (Math.min(...hs) + Math.max(...hs)) / 2;
  // pente y(z) de chaque couronne (moindres carrés), puis moyenne
  const slope = (ids) => { const mz = ids.reduce((a, i) => a + P[i * 3 + 2], 0) / ids.length, my = ids.reduce((a, i) => a + P[i * 3 + 1], 0) / ids.length; let sn = 0, sd = 0; for (const i of ids) { sn += (P[i * 3 + 2] - mz) * (P[i * 3 + 1] - my); sd += (P[i * 3 + 2] - mz) ** 2; } return sn / sd; };
  const lo = inner.filter((i) => loc(i)[2] < mid), hi = inner.filter((i) => loc(i)[2] >= mid);
  tilt = Math.atan((slope(lo) + slope(hi)) / 2);
  // centre : cercle ajusté aux pointes (moindres carrés), valable même si la sélection est incomplète
  const c2 = Math.cos(tilt), s2 = Math.sin(tilt);
  const pq = inner.map((i) => { const x = P[i * 3] - c0[0], y = P[i * 3 + 1] - c0[1], z = P[i * 3 + 2] - c0[2]; return [x, z * c2 + y * s2, -z * s2 + y * c2]; });
  const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], B = [0, 0, 0];
  for (const [x, q] of pq) { const row = [x, q, 1], w = -(x * x + q * q); for (let a = 0; a < 3; a++) { B[a] += row[a] * w; for (let b = 0; b < 3; b++) A[a][b] += row[a] * row[b]; } }
  const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const col = (k) => A.map((r, a) => r.map((x, b) => (b === k ? B[a] : x)));
  const dx = -det(col(0)) / det(A) / 2, dq = -det(col(1)) / det(A) / 2, dh = pq.reduce((a, l) => a + l[2], 0) / pq.length;
  c0 = [c0[0] + dx, c0[1] + dq * s2 + dh * c2, c0[2] + dq * c2 - dh * s2];
}
const ct = Math.cos(tilt), st = Math.sin(tilt);
const loc = (i) => { const x = P[i * 3] - c0[0], y = P[i * 3 + 1] - c0[1], z = P[i * 3 + 2] - c0[2]; return [x, z * ct + y * st, -z * st + y * ct]; };
const rInner = inner.map((i) => Math.hypot(...loc(i).slice(0, 2)));
const rOut = (ex[1] - ex[0]) / 2; // demi-largeur de l'anneau (le col, plus loin du centre, ne compte pas)
let hMin = 1e9, hMax = -1e9;
for (let i = 0; i < n; i++) { if (!ring(i)) continue; const l = loc(i); if (Math.hypot(l[0], l[1]) > rOut + 2e-4) continue; hMin = Math.min(hMin, l[2]); hMax = Math.max(hMax, l[2]); }
const eye = {
  tilt, c: c0, rOut, thick: hMax - hMin, hMid: (hMax + hMin) / 2,
  rPoint: rInner.reduce((a, b) => a + b, 0) / rInner.length, // pointes des 12 pans
  af: 2 * Math.cos(Math.PI / 12) * (rInner.reduce((a, b) => a + b, 0) / rInner.length), // sur plats de l'hexagone
};

const b64 = (a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64');
const nq = Int8Array.from(N, (x) => Math.round(x * 127));
const r6 = (o) => JSON.stringify(o, (k, x) => (typeof x === 'number' ? Math.round(x * 1e6) / 1e6 : x));
writeFileSync(new URL('../src/models/cles-mixtes/mesh.js', import.meta.url), `// Fichier produit par tools/cle_mixte_polyhaven_mesh.mjs — ne pas modifier à la main.
// Clé mixte de Poly Haven (CC0, https://polyhaven.com/a/combination_wrench, BKS) : ${n} sommets, ${I.length / 3} triangles.
// p : Float32 xyz (m) ; n : Int8 normalisé ; uv : Float32 ; i : Uint16.
// open : fourche (angle des mâchoires en rad, ouverture, point de l'axe au fond des plats [x, z], largeur et épaisseur de tête).
// eye : œil (inclinaison en rad, centre, rayon extérieur, épaisseur, rayon des pointes des 12 pans, cote sur plats).
export default {
  open: ${r6(open)},
  eye: ${r6(eye)},
  p: '${b64(P)}',
  n: '${b64(nq)}',
  uv: '${b64(UV)}',
  i: '${b64(I)}',
};
`);
const mm = (x) => (x * 1000).toFixed(2), deg = (x) => (x * 180 / Math.PI).toFixed(2);
console.log(`${n} sommets, ${I.length / 3} triangles`);
console.log(`fourche : ouverture ${mm(open.opening)} mm, mâchoires à ${deg(jaw)}°, tête ${mm(open.width)} × ${mm(open.thick)} mm`);
console.log(`œil : ${mm(eye.af)} mm sur plats, Ø ext. ${mm(2 * rOut)} mm, épaisseur ${mm(eye.thick)} mm, incliné de ${deg(tilt)}°, ${inner.length} pointes`);
console.log(`longueur ${mm(ext(2).reduce((a, b) => b - a))} mm`);

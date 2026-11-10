// Exporte la foreuse STM-1500 (P010) animée en glTF binaire (.glb) pour Unreal Engine, Blender ou tout logiciel 3D :
// un maillage à squelette (un os par corps mobile, voir src/models/stm-1500/rig.js), une section par matériau, et
// une animation par séquence (clés à 30 images/s sur les os). Les boyaux et le câble sont pondérés entre les deux
// corps qu'ils relient : ils suivent le mât sans se détacher. Une tige de forage (taille B), absente du manuel et du
// site, est ajoutée entre l'émerillon et le serre-tiges pour montrer le forage ; elle a son os et son matériau.
//
// Usage : node scripts/export-anim.mjs [sortie.glb] [--fps 30]
// Écrit aussi sortie.json (os, séquences et résumés). FBX : tools/blender_fbx.py.
import { writeFileSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { buildProcedural } from '../src/viewer/assembly.js';
import { mat } from '../src/viewer/materials.js';
import builders from '../src/models/stm-1500/index.js';
import { resolve, pose, CLIPS, REST, ROD } from '../src/models/stm-1500/rig.js';

// Node n'a pas de FileReader : l'exportateur s'en sert pour lire ses tampons.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then((b) => { this.result = b; this.onloadend?.(); }); }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((b) => { this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(b).toString('base64')}`; this.onloadend?.(); });
  }
};

const args = process.argv.slice(2);
const fi = args.indexOf('--fps');
const fps = fi >= 0 ? Number(args.splice(fi, 2)[1]) : 30;
const out = args[0] || 'stm-1500-foreuse-animee.glb';

const model = buildProcedural(builders, 'P010');
const root = model.root;
const bones = resolve(root);
const boneIndex = new Map(bones.map((b, i) => [b.name, i]));
root.updateMatrixWorld(true);

// ---------------------------------------------------------------- maillage pondéré

const sections = new Map(); // matériau → { material, position[], normal[], index[], joints[], weights[] }
const section = (material) => {
  const key = material.name || material.uuid;
  if (!sections.has(key)) sections.set(key, { material, position: [], normal: [], index: [], joints: [], weights: [], count: 0 });
  return sections.get(key);
};
const smooth = (t) => { const k = Math.min(1, Math.max(0, t)); return k * k * (3 - 2 * k); };
const up = (o, key) => { for (let p = o; p; p = p.parent) if (p.userData[key] !== undefined) return [p.userData[key], p]; return [undefined, null]; };
const idx = (name) => { if (!boneIndex.has(name)) throw new Error(`Corps inconnu : ${name}`); return boneIndex.get(name); };
const usage = new Map();
const v = new THREE.Vector3(), n = new THREE.Vector3(), nm = new THREE.Matrix3();

/** Ajoute une géométrie (repère de la foreuse) ; weight(i, x, y, z) → [osA, osB, poids de B]. */
function push(geo, matrixWorld, material, weight) {
  const g = geo.index || geo.attributes.normal ? geo : geo.clone();
  if (!g.attributes.normal) g.computeVertexNormals();
  const s = section(material);
  const pos = g.attributes.position, nor = g.attributes.normal;
  nm.getNormalMatrix(matrixWorld);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(matrixWorld);
    n.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
    s.position.push(v.x, v.y, v.z);
    s.normal.push(n.x, n.y, n.z);
    const [a, b, w] = weight(i, v);
    // Un os de poids nul doit porter l'indice 0 (règle du glTF).
    if (w < 1e-4 || a === b) { s.joints.push(a, 0, 0, 0); s.weights.push(1, 0, 0, 0); }
    else if (w > 1 - 1e-4) { s.joints.push(b, 0, 0, 0); s.weights.push(1, 0, 0, 0); }
    else { s.joints.push(a, b, 0, 0); s.weights.push(1 - w, w, 0, 0); }
    usage.set(a, (usage.get(a) || 0) + 1);
  }
  if (g.index) for (let i = 0; i < g.index.count; i++) s.index.push(s.count + g.index.getX(i));
  else for (let i = 0; i < pos.count; i++) s.index.push(s.count + i);
  s.count += pos.count;
}

let tris = 0;
root.traverse((o) => {
  if (!o.isMesh || !o.visible) return;
  tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
  const [skin, owner] = up(o, 'skin');
  const [body] = up(o, 'body');
  if (!skin) { const b = idx(body || 'Traineau'); push(o.geometry, o.matrixWorld, o.material, () => [b, b, 0]); return; }
  const a = idx(skin.a), b = idx(skin.b), [u0, u1] = skin.u;
  if (o === owner) {
    // Tube : poids selon la position le long du boyau (coordonnée u de la géométrie).
    const uv = o.geometry.attributes.uv;
    push(o.geometry, o.matrixWorld, o.material, (i) => [a, b, smooth((uv.getX(i) - u0) / (u1 - u0))]);
  } else {
    // Embouts : chacun avec le corps de son bout (le plus proche).
    const uv = owner.geometry.attributes.uv, p = owner.geometry.attributes.position;
    const ends = [new THREE.Vector3(), new THREE.Vector3()], cnt = [0, 0];
    for (let i = 0; i < p.count; i++) {
      const k = uv.getX(i) < 1e-6 ? 0 : uv.getX(i) > 1 - 1e-6 ? 1 : -1;
      if (k >= 0) { ends[k].add(v.fromBufferAttribute(p, i).applyMatrix4(owner.matrixWorld)); cnt[k]++; }
    }
    ends.forEach((e, k) => e.divideScalar(cnt[k]));
    push(o.geometry, o.matrixWorld, o.material, (i, w) => (w.distanceToSquared(ends[0]) < w.distanceToSquared(ends[1]) ? [a, a, 0] : [b, b, 0]));
  }
});

// Tige de forage : cylindre dont le bout arrière suit l'émerillon et le bout avant reste dans le serre-tiges.
{
  const rodMat = mat('steel').clone();
  rodMat.name = 'tige_de_forage';
  const geo = new THREE.CylinderGeometry(ROD.r, ROD.r, ROD.x1 - ROD.x0, 32, 1, false).rotateZ(-Math.PI / 2).translate((ROD.x0 + ROD.x1) / 2, ROD.y, 0);
  const mid = (ROD.x0 + ROD.x1) / 2, ar = idx('Tige_Arriere'), av = idx('Tige_Avant');
  push(geo, new THREE.Matrix4(), rodMat, (i, w) => (w.x < mid ? [ar, ar, 0] : [av, av, 0]));
}

const geometry = new THREE.BufferGeometry();
const materials = [];
const P = [], N = [], I = [], Jn = [], W = [];
let base = 0, start = 0;
const ranges = []; // sommets de chaque section : contigus dans les tampons
for (const s of sections.values()) {
  ranges.push({ base, count: s.count });
  geometry.addGroup(start, s.index.length, materials.length);
  materials.push(s.material);
  for (const x of s.position) P.push(x);
  for (const x of s.normal) N.push(x);
  for (const x of s.joints) Jn.push(x);
  for (const x of s.weights) W.push(x);
  for (const i of s.index) I.push(base + i);
  base += s.count; start += s.index.length;
}
geometry.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
geometry.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(Jn, 4));
geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(W, 4));
geometry.setIndex(new THREE.Uint32BufferAttribute(I, 1));

/**
 * L'exportateur fait partager à toutes les sections les mêmes tableaux de sommets : un logiciel qui importe chaque
 * section à part (Unreal) recopierait tous les sommets pour chacune. Chaque section reçoit ici ses propres accesseurs,
 * limités à ses sommets (contigus), et ses indices sont ramenés à ce début.
 */
function compact(glb, ranges) {
  const dv = new DataView(glb);
  const jsonLen = dv.getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(new Uint8Array(glb, 20, jsonLen)));
  const binStart = 20 + jsonLen + 8, binLen = dv.getUint32(20 + jsonLen, true);
  const SIZE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }, BYTES = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
  const at = (acc) => binStart + (json.bufferViews[acc.bufferView].byteOffset || 0) + (acc.byteOffset || 0);
  const prims = json.meshes[0].primitives;
  if (prims.length !== ranges.length) throw new Error('sections et matériaux ne correspondent pas');
  const shared = new Set();
  prims.forEach((pr, k) => {
    const { base, count } = ranges[k];
    for (const [name, id] of Object.entries(pr.attributes)) {
      shared.add(id);
      const a = { ...json.accessors[id] };
      a.byteOffset = (a.byteOffset || 0) + base * SIZE[a.type] * BYTES[a.componentType];
      a.count = count;
      delete a.min; delete a.max;
      if (name === 'POSITION') {
        const o = at(a), min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
        for (let i = 0; i < count; i++) for (let c = 0; c < 3; c++) { const x = dv.getFloat32(o + (i * 3 + c) * 4, true); if (x < min[c]) min[c] = x; if (x > max[c]) max[c] = x; }
        a.min = min; a.max = max;
      }
      pr.attributes[name] = json.accessors.push(a) - 1;
    }
    const ia = json.accessors[pr.indices];
    if (ia.componentType !== 5125) throw new Error('indices attendus sur 32 bits');
    const o = at(ia);
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < ia.count; i++) { const x = dv.getUint32(o + i * 4, true) - base; dv.setUint32(o + i * 4, x, true); if (x < lo) lo = x; if (x > hi) hi = x; }
    if (lo < 0 || hi >= count) throw new Error(`section ${k} : indices hors de ses sommets`);
    if (ia.min) { ia.min = [lo]; ia.max = [hi]; }
  });
  // Les accesseurs partagés ne servent plus : retirés, les autres renumérotés partout où ils sont cités.
  const map = new Map();
  json.accessors = json.accessors.filter((acc, id) => { if (shared.has(id)) return false; map.set(id, map.size); return true; });
  for (const pr of prims) {
    pr.indices = map.get(pr.indices);
    for (const name of Object.keys(pr.attributes)) pr.attributes[name] = map.get(pr.attributes[name]);
  }
  for (const sk of json.skins || []) if (sk.inverseBindMatrices !== undefined) sk.inverseBindMatrices = map.get(sk.inverseBindMatrices);
  for (const an of json.animations || []) for (const sm of an.samplers) { sm.input = map.get(sm.input); sm.output = map.get(sm.output); }
  let text = JSON.stringify(json);
  while (new TextEncoder().encode(text).length % 4) text += ' ';
  const jb = new TextEncoder().encode(text);
  const outBuf = new ArrayBuffer(12 + 8 + jb.length + 8 + binLen), o = new DataView(outBuf), u8 = new Uint8Array(outBuf);
  o.setUint32(0, 0x46546c67, true); o.setUint32(4, 2, true); o.setUint32(8, outBuf.byteLength, true);
  o.setUint32(12, jb.length, true); o.setUint32(16, 0x4e4f534a, true); u8.set(jb, 20);
  o.setUint32(20 + jb.length, binLen, true); o.setUint32(24 + jb.length, 0x004e4942, true);
  u8.set(new Uint8Array(glb, binStart, binLen), 28 + jb.length);
  return outBuf;
}

// ---------------------------------------------------------------- squelette

const nodes = bones.map((b) => Object.assign(new THREE.Bone(), { name: b.name }));
bones.forEach((b, i) => {
  const o = new THREE.Vector3(...b.origin);
  if (b.parent) { nodes[idx(b.parent)].add(nodes[i]); o.sub(new THREE.Vector3(...bones[idx(b.parent)].origin)); }
  nodes[i].position.copy(o);
});
const scene = new THREE.Scene();
scene.name = 'STM1500_Foreuse';
scene.add(nodes[0]);
const mesh = new THREE.SkinnedMesh(geometry, materials);
mesh.name = 'STM1500';
scene.add(mesh);
scene.updateMatrixWorld(true);
mesh.bind(new THREE.Skeleton(nodes));

// ---------------------------------------------------------------- animations

const rest = bones.map((b) => new THREE.Matrix4().makeTranslation(...b.origin));
const restLocal = nodes.map((nd) => nd.position.clone());
const clips = [];
const report = [];
const mW = new THREE.Matrix4(), mP = new THREE.Matrix4();
for (const c of CLIPS) {
  const frames = Math.round(c.duration * fps);
  const times = Array.from({ length: frames + 1 }, (_, k) => k / fps);
  const data = bones.map(() => ({ p: [], q: [], s: [], moved: false, scaled: false }));
  const lastQ = bones.map(() => new THREE.Quaternion());
  const rams = new Map();
  for (const t of times) {
    const J = pose(bones, { ...REST, ...c.values(Math.min(t, c.duration)) });
    bones.forEach((b, i) => {
      mW.multiplyMatrices(J.get(b.name), rest[i]);
      if (b.parent) { const k = idx(b.parent); mP.multiplyMatrices(J.get(b.parent), rest[k]).invert(); mW.premultiply(mP); }
      const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
      mW.decompose(p, q, s);
      if (q.dot(lastQ[i]) < 0) q.set(-q.x, -q.y, -q.z, -q.w); // même hémisphère d'une clé à l'autre
      lastQ[i].copy(q);
      const d = data[i];
      d.p.push(p.x, p.y, p.z); d.q.push(q.x, q.y, q.z, q.w); d.s.push(s.x, s.y, s.z);
      if (p.distanceTo(restLocal[i]) > 1e-6 || Math.abs(q.w) < 1 - 1e-9) d.moved = true;
      if (Math.abs(s.x - 1) > 1e-6) d.scaled = true;
      if (b.type === 'aim' && b.side === 'fut') { const r = rams.get(b.name) || [Infinity, -Infinity]; rams.set(b.name, [Math.min(r[0], b.length), Math.max(r[1], b.length)]); }
    });
  }
  const tracks = [];
  bones.forEach((b, i) => {
    const d = data[i];
    if (d.moved) {
      tracks.push(new THREE.VectorKeyframeTrack(`${b.name}.position`, times, d.p));
      tracks.push(new THREE.QuaternionKeyframeTrack(`${b.name}.quaternion`, times, d.q));
    }
    if (d.scaled) tracks.push(new THREE.VectorKeyframeTrack(`${b.name}.scale`, times, d.s));
  });
  clips.push(new THREE.AnimationClip(c.name, c.duration, tracks));
  report.push({ name: c.name, duration: c.duration, frames: frames + 1, loop: c.loop, summary: c.summary, bones: bones.filter((b, i) => data[i].moved || data[i].scaled).map((b) => b.name),
    verins: Object.fromEntries([...rams].map(([k, r]) => [k, r.map((x) => +x.toFixed(3))])) });
}

const glb = compact(await new GLTFExporter().parseAsync(scene, { binary: true, animations: clips, onlyVisible: true }), ranges);
writeFileSync(out, Buffer.from(glb));
writeFileSync(out.replace(/\.glb$/, '.json'), JSON.stringify({
  source: 'Usinage Marcotte STM-1500, assemblage P010 (FBRA-002-100AS)', unite: 'mètre, Y vers le haut, X vers le pied de l\'avance', fps,
  triangles: Math.round(tris), sommets: base, materiaux: materials.map((m) => m.name),
  os: bones.map((b) => ({ nom: b.name, parent: b.parent, liaison: b.type, origine: b.origin.map((x) => +x.toFixed(4)), sommets: usage.get(idx(b.name)) || 0 })),
  sequences: report,
}, null, 1));
console.log(`${out} : ${(glb.byteLength / 1e6).toFixed(1)} Mo, ${Math.round(tris)} triangles, ${base} sommets, ${materials.length} matériaux, ${bones.length} os, ${clips.length} séquences à ${fps} images/s`);
for (const r of report) console.log(`  ${r.name} : ${r.duration} s, ${r.bones.length} os animés${Object.keys(r.verins).length ? ` ; vérins de bascule ${JSON.stringify(Object.values(r.verins)[0])} m` : ''}`);
const vides = bones.filter((b) => !usage.get(idx(b.name)) && b.name !== 'PivotAvant');
if (vides.length) console.log('  os sans sommet :', vides.map((b) => b.name).join(', '));

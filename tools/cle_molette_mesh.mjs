// Écrit src/models/cle-a-molette/mesh.js à partir de la clé à molette du « Tool Pack 1 » d'OpenGameArt
// (CC0, https://opengameart.org/content/tool-pack-1, auteur LonesomeDucky) : les trois pièces du fichier
// (corps, mâchoire mobile, molette), chacune dans son repère, avec la position et l'orientation de ce repère.
// Avec --textures <dossier>, écrit aussi les trois images du fichier (couleur, normales, rugosité-métal) en PNG,
// telles quelles ; celles du site (public/equipment/cle-a-molette/textures/*.webp) en sont des copies en WebP.
// Usage : node tools/cle_molette_mesh.mjs <adjustable_wrench.glb> [--textures <dossier>]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const at = args.indexOf('--textures'), texDir = at >= 0 ? args.splice(at, 2)[1] : null;
const b = readFileSync(args[0]);
if (b.readUInt32LE(0) !== 0x46546c67) throw new Error('Fichier .glb attendu');
const jl = b.readUInt32LE(12), gltf = JSON.parse(b.subarray(20, 20 + jl).toString()), bin = b.subarray(20 + jl + 8);
const bytes = (v) => bin.subarray(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength);
const acc = (k, T, size) => {
  const a = gltf.accessors[k], v = gltf.bufferViews[a.bufferView], o = bin.byteOffset + (v.byteOffset || 0) + (a.byteOffset || 0);
  return new T(bin.buffer.slice(o, o + a.count * size * T.BYTES_PER_ELEMENT));
};
const NOMS = { Wrench: 'corps', Claw: 'machoire', WormGear: 'molette' };
const b64 = (a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64');
const r = (v) => +v.toFixed(7);
const pieces = [];
let sommets = 0, triangles = 0;
for (const node of gltf.nodes) {
  const nom = NOMS[node.name];
  if (!nom) throw new Error(`Nœud inattendu : ${node.name}`);
  const p = gltf.meshes[node.mesh].primitives[0];
  const P = acc(p.attributes.POSITION, Float32Array, 3), N = acc(p.attributes.NORMAL, Float32Array, 3), UV = acc(p.attributes.TEXCOORD_0, Float32Array, 2), I = acc(p.indices, Uint16Array, 1);
  sommets += P.length / 3; triangles += I.length / 3;
  pieces.push(`  ${nom}: {\n    t: [${(node.translation || [0, 0, 0]).map(r).join(', ')}],\n    q: [${(node.rotation || [0, 0, 0, 1]).map(r).join(', ')}],\n    p: '${b64(P)}',\n    n: '${b64(N)}',\n    uv: '${b64(UV)}',\n    i: '${b64(I)}',\n  },`);
}
if (pieces.length !== 3) throw new Error(`3 pièces attendues, ${pieces.length} trouvées`);
writeFileSync(new URL('../src/models/cle-a-molette/mesh.js', import.meta.url), `// Fichier produit par tools/cle_molette_mesh.mjs — ne pas modifier à la main.
// Clé à molette du « Tool Pack 1 » d'OpenGameArt (CC0, https://opengameart.org/content/tool-pack-1, LonesomeDucky) :
// ${sommets} sommets, ${triangles} triangles en trois pièces.
// Par pièce : t position et q orientation (quaternion) de son repère dans celui du corps ; p : Float32 xyz (m) ;
// n : Float32 ; uv : Float32 ; i : Uint16.
export default {
${pieces.join('\n')}
};
`);
console.log(`${sommets} sommets, ${triangles} triangles`);
if (texDir) {
  mkdirSync(texDir, { recursive: true });
  const m = gltf.materials[0], tex = (t) => gltf.images[gltf.textures[t.index].source];
  for (const [nom, im] of [['diff', tex(m.pbrMetallicRoughness.baseColorTexture)], ['nor', tex(m.normalTexture)], ['mr', tex(m.pbrMetallicRoughness.metallicRoughnessTexture)]]) {
    if (im.mimeType !== 'image/png') throw new Error(`Image PNG attendue : ${im.name}`);
    writeFileSync(join(texDir, `${nom}.png`), bytes(gltf.bufferViews[im.bufferView]));
    console.log(`${nom}.png : ${im.name}`);
  }
}

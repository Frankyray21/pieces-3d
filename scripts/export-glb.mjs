// Exporte un assemblage procédural en glTF binaire (.glb), pour un rendu
// réaliste dans Blender (tools/blender_render.py) ou un autre logiciel 3D.
// Les matériaux de la palette passent en PBR glTF (couleur, métal, rugosité,
// vernis) ; chaque pièce garde son repère dans son nom (« ref-12 »).
//
// Usage : node scripts/export-glb.mjs --eq stm-1500 P002 sortie.glb
import { writeFileSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { buildProcedural } from '../src/viewer/assembly.js';

// Node n'a pas de FileReader : l'exportateur s'en sert pour lire ses tampons.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then((b) => { this.result = b; this.onloadend?.(); }); }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((b) => { this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(b).toString('base64')}`; this.onloadend?.(); });
  }
};

const args = process.argv.slice(2);
const i = args.indexOf('--eq');
const eq = i >= 0 ? args.splice(i, 2)[1] : 'stm-1500';
const [id, out = `${id}.glb`] = args;
const { default: builders } = await import(`../src/models/${eq}/index.js`);
const model = buildProcedural(builders, id);
const scene = new THREE.Scene();
scene.add(model.root);
model.root.updateMatrixWorld(true);
scene.traverse((o) => {
  const ref = o.userData?.partRef;
  o.userData = {};
  if (ref && !o.name) o.name = `ref-${ref}`;
});
const glb = await new GLTFExporter().parseAsync(scene, { binary: true, onlyVisible: true });
writeFileSync(out, Buffer.from(glb));
console.log(`${out} : ${(glb.byteLength / 1e6).toFixed(1)} Mo`);

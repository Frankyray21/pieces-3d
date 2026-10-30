// Exporte la vue d'ensemble du plancher (P02) pour l'outil « Voir en 3D » de
// l'app Procédures (dépôt Procedures-Forage-MRI) : un .glb où chaque pièce
// garde son étape de montage dans ses extras glTF, et un .json des étiquettes
// (annotations NOTES et textes des cotes) avec leurs étapes.
//
// Extras des nœuds : s = étape (pièce posée à cette étape, puis gardée),
// q = ordre de pose (seq), nd = pas de chute à la pose, o = étapes où l'objet
// seul s'affiche (outils, laser, cotes), d = cote (dessinée par-dessus).
//
// Usage : node scripts/export-plancher-app.mjs sortie.glb etiquettes.json
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders from '../src/models/plancher-dd/index.js';

globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then((b) => { this.result = b; this.onloadend?.(); }); }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((b) => { this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(b).toString('base64')}`; this.onloadend?.(); });
  }
};

const [out = 'plancher.glb', outLabels = 'plancher-etiquettes.json'] = process.argv.slice(2);
const model = buildProcedural(builders, 'P02');
const root = model.root;
const scene = new THREE.Scene();
scene.add(root);
root.updateMatrixWorld(true);

const r3 = (v) => v.toArray().map((x) => Math.round(x * 1000) / 1000);
const hasStepBelow = (o) => o.children.some((c) => c.userData.step !== undefined || hasStepBelow(c));
const onlyOf = (o) => { for (let p = o; p; p = p.parent) if (p.userData.stepOnly !== undefined) return [].concat(p.userData.stepOnly); return null; };

// Textes des cotes (étiquettes dessinées sur canevas dans le site) : sortis du .glb.
const dims = [];
const drop = [];
root.traverse((o) => {
  if (o.userData.dimText === undefined) return;
  dims.push({ steps: onlyOf(o), pos: r3(o.getWorldPosition(new THREE.Vector3())), text: o.userData.dimText, kind: 'cote' });
  drop.push(o);
});
drop.forEach((o) => o.removeFromParent());

const notes = (model.view.notes || []).map((n) => ({ steps: [].concat(n.steps), pos: n.pos.map((x) => Math.round(x * 1000) / 1000), text: n.text, kind: 'note' }));

let leaves = 0;
const dimRoots = new Set();
root.traverse((o) => { if (o.userData.dimSteps) dimRoots.add(o); });
root.traverse((o) => {
  const u = o.userData;
  const x = {};
  if (u.stepOnly !== undefined) x.o = [].concat(u.stepOnly);
  else if (o !== root && u.step !== undefined && !hasStepBelow(o)) {
    x.s = u.step;
    if (u.seq) x.q = u.seq;
    if (u.noDrop) x.nd = 1;
    leaves++;
  }
  if (dimRoots.has(o)) x.d = 1;
  o.userData = x;
  o.visible = true;
  if (o.isMesh) for (const m of [].concat(o.material)) if (!m.name) m.name = `c${m.color?.getHexString?.() ?? ''}`;
});
// Allègement : pas de texture, donc pas d'UV ; géométries identiques partagées
// (l'exportateur écrit alors un seul maillage glTF pour toutes leurs instances).
const shared = new Map();
root.traverse((o) => {
  if (!o.isMesh && !o.isLine) return;
  const g = o.geometry;
  g.deleteAttribute('uv');
  const h = createHash('sha1');
  for (const k of Object.keys(g.attributes).sort()) h.update(k).update(Buffer.from(g.attributes[k].array.buffer, g.attributes[k].array.byteOffset, g.attributes[k].array.byteLength));
  if (g.index) h.update(Buffer.from(g.index.array.buffer, g.index.array.byteOffset, g.index.array.byteLength));
  const key = h.digest('hex');
  if (shared.has(key)) o.geometry = shared.get(key);
  else shared.set(key, g);
});
const glb = await new GLTFExporter().parseAsync(scene, { binary: true, onlyVisible: false });
writeFileSync(out, Buffer.from(glb));
writeFileSync(outLabels, JSON.stringify([...notes, ...dims], null, 1));
console.log(`${out} : ${(glb.byteLength / 1e6).toFixed(2)} Mo, ${leaves} pièces d'étape ; ${notes.length} notes, ${dims.length} cotes`);

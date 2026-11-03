// Exporte la vue d'ensemble du plancher (P02) pour l'outil « Voir en 3D » de
// l'app Procédures (dépôt Procedures-Forage-MRI) : un .glb où chaque pièce
// garde son étape de montage dans ses extras glTF, et un .json des étiquettes
// (annotations NOTES et textes des cotes) avec leurs étapes.
//
// Extras des nœuds : s = étape (pièce posée à cette étape, puis gardée),
// q = ordre de pose (seq), nd = pas de chute à la pose, o = étapes où l'objet
// seul s'affiche (outils, laser, cotes), d = cote (dessinée par-dessus).
// Variante « 6 × 6 de 8 pi » (écran après l'étape 11) : v8 = pièce de la variante
// (ordre de pose), cachée ailleurs ; x8 = pièce de 16 pi remplacée par la variante
// (même liste que v8Old de la vidéo, src/video/plancher-video.js) ; pl = planche
// (P07, P13), enlevée sur cet écran pour voir la structure. grp = groupe montré seulement
// sur l'écran « cas » du même nom (marches : cas = nombre de marches, posées au bout du vrai plancher). ord = rang de pose d'une
// planche de la section 1 (animation du serrage de l'étape 7, comme la vidéo).
//
// Usage : node scripts/export-plancher-app.mjs sortie.glb etiquettes.json
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders from '../src/models/plancher-dd/index.js';
import * as shapes from '../src/viewer/shapes.js';
import { variante8, jonction8, variante8Sec2, eclisses8, marchesCas, secondaireCas, stairPlan, JOINT8_X, JOINT8_X2 } from '../src/models/plancher-dd/floor.js';
import { L, ground, STAIR, setFond } from '../src/models/plancher-dd/plan.js';

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

// Repère de chaque pièce : sous-assemblage (P04, P10…) et repère de la pièce.
for (const p of root.userData.parts || []) {
  if (!p.userData.isAssembly) continue;
  for (const c of p.userData.parts) c.traverse((o) => { o.userData.asm = p.userData.assemblyId; o.userData.ref = c.userData.partRef; });
}
const ctr = new THREE.Vector3(), bx = new THREE.Box3();
function remplacee8(o) {
  const { asm, ref } = o.userData;
  bx.setFromObject(o).getCenter(ctr);
  const near = (x, d) => Math.abs(ctr.x - x) < d;
  return (asm === 'P04' && ['1', '2', '7', '8'].includes(ref))
    || (asm === 'P10' && ['1', '2', '7'].includes(ref))
    || (asm === 'P04' && ['3', '4', '5'].includes(ref) && near(JOINT8_X, 0.2))
    || (asm === 'P10' && ['3', '4', '5', '6'].includes(ref) && near(JOINT8_X2, 0.45));
}

let leaves = 0, x8 = 0;
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
    if (u.asm === 'P07' && u.ref === '1' && u.order !== undefined) x.ord = u.order; // rang de pose (serrage, étape 7)
    if (u.asm === 'P07' || u.asm === 'P13') x.pl = 1;
    else if (remplacee8(o)) { x.x8 = 1; x8++; }
    leaves++;
  }
  if (dimRoots.has(o)) x.d = 1;
  o.userData = x;
  o.visible = true;
  if (o.isMesh) for (const m of [].concat(o.material)) if (!m.name) m.name = `c${m.color?.getHexString?.() ?? ''}`;
});
// Pièces de la variante 8 pi, dans l'ordre de pose de la vidéo : section 1, jonction, section 2.
const v1 = variante8(shapes), v2 = variante8Sec2(shapes);
const v8 = new THREE.Group();
v8.name = 'variante-8pi';
let k8 = 0;
for (const g of [v1.appuis, v1.madriers, jonction8(shapes), v2.appuis, v2.soutiens, v2.madriers, eclisses8(shapes)]) {
  for (const c of [...g.children]) { c.userData = { v8: ++k8 }; c.traverse((m) => { if (m !== c) m.userData = {}; }); v8.add(c); }
}
root.add(v8);
// Écrans « cas » de l'app (grp) : affichés seulement sur l'écran qui les nomme.
const cas = new THREE.Group();
cas.name = 'cas';
const casLabels = [];
// Marches à 2, 3 et 4 marches : posées à la place des vraies marches, au bout du plancher
// (X = L, centrées sur l'escalier), sur le sol à cet endroit ; l'app monte ou descend le
// plancher pour que son dessus soit à n × 9 po de ce sol (cas = nombre de marches).
{
  const { zc } = stairPlan();
  let y = -Infinity;
  for (let dx = 0; dx <= 3 * STAIR.tread + 0.01; dx += 0.1) for (let dz = -STAIR.w / 2; dz <= STAIR.w / 2 + 0.01; dz += 0.1) y = Math.max(y, ground(L + dx, zc + dz));
  for (const n of [2, 3, 4]) {
    const g = marchesCas(shapes, n, [L, y, zc]);
    for (const c of [...g.children]) {
      const u = c.userData;
      if (u.plancher) continue;                       // pas de bout de plancher : c'est le vrai plancher qui sert
      c.userData = { grp: 'marches', cas: n, m: u.module };
      c.traverse((k) => { if (k !== c) k.userData = {}; });
      cas.add(c);
    }
    // Appuis du plancher pour ce cas : le modèle est reconstruit sur un sol creusé de façon que
    // le sol aux marches soit à (n - 1) × 9 po sous le dessous des madriers (plancher à n × 9 po),
    // avec les mêmes règles de montage (blocages, 6 × 6, coins). Pièces d'étape sous les madriers.
    setFond(((n - 1) * 9 * 0.0254) / -y);
    const m2 = buildProcedural(builders, 'P02');
    m2.root.updateMatrixWorld(true);
    const bxA = new THREE.Box3();
    const app = [];
    m2.root.traverse((o) => {
      const u = o.userData;
      if (u.stepOnly !== undefined || u.step === undefined || u.step < 1 || u.step > 14 || hasStepBelow(o)) return;
      if (bxA.setFromObject(o).max.y > 0.003) return;
      app.push(o);
    });
    for (const o of app) {
      o.updateMatrixWorld(true);
      o.matrixWorld.decompose(o.position, o.quaternion, o.scale);
      o.userData = { grp: 'marches', cas: n, ap: 1 };
      o.traverse((k) => { if (k !== o) k.userData = {}; });
      cas.add(o);
    }
    setFond(1);
    casLabels.push({ steps: ['marches'], cas: n, pos: [L - 0.25, y + n * 9 * 0.0254 + 0.06, zc], text: `${n} marches : plancher à ${n * 9} po du sol`, kind: 'note' });
  }
}
// Plancher secondaire : 2 marches, côté sans marche avec garde-corps, contre la foreuse.
const titres = { marches: '2 marches : plancher à 18 po, 1re marche 16 po × 9 po', garde: 'Côté sans marche : garde-corps', foreuse: 'Contre la foreuse : dernière planche à 3 po de la tour' };
[['marches', -1.75], ['garde', 0.15], ['foreuse', 2.0]].forEach(([kind, z]) => {
  const x = L + 6.2;
  let y = -Infinity;
  for (let dx = -1.0; dx <= 1.0; dx += 0.1) for (let dz = -0.6; dz <= 0.6; dz += 0.1) y = Math.max(y, ground(x + dx, z + dz));
  const g = secondaireCas(shapes, kind, [x, y, z]);
  for (const c of [...g.children]) {
    const u = c.userData;
    c.userData = u.plancher ? { grp: 'secondaire', b: 1 } : { grp: 'secondaire', m: u.module };
    c.traverse((k) => { if (k !== c) k.userData = {}; });
    cas.add(c);
  }
  casLabels.push({ steps: ['secondaire'], pos: [x, y + (kind === 'marches' ? 0.46 : 0.23) + 0.05, z], text: titres[kind], kind: 'note' });
});
root.add(cas);
root.updateMatrixWorld(true);

// Allègement : pas de texture, donc pas d'UV ; géométries identiques partagées
// (l'exportateur écrit alors un seul maillage glTF pour toutes leurs instances).
const shared = new Map();
// Géométrie recentrée sur son origine (le décalage passe dans la position du nœud) :
// deux pièces identiques posées à des endroits différents partagent alors leur maillage.
const ctrG = new THREE.Vector3();
root.traverse((o) => {
  if (!o.isMesh && !o.isLine) return;
  let g = o.geometry;
  g.deleteAttribute('uv');
  g.computeBoundingBox();
  g.boundingBox.getCenter(ctrG);
  if (ctrG.lengthSq() > 1e-10) {
    g = o.geometry = g.clone().translate(-ctrG.x, -ctrG.y, -ctrG.z);
    o.position.add(ctrG.clone().multiply(o.scale).applyQuaternion(o.quaternion));
  }
  const pa = g.attributes.position.array;
  for (let i = 0; i < pa.length; i++) pa[i] = Math.round(pa[i] * 1e5) / 1e5;
  const h = createHash('sha1');
  for (const k of Object.keys(g.attributes).sort()) h.update(k).update(Buffer.from(g.attributes[k].array.buffer, g.attributes[k].array.byteOffset, g.attributes[k].array.byteLength));
  if (g.index) h.update(Buffer.from(g.index.array.buffer, g.index.array.byteOffset, g.index.array.byteLength));
  const key = h.digest('hex');
  if (shared.has(key)) o.geometry = shared.get(key);
  else shared.set(key, g);
});
const glb = await new GLTFExporter().parseAsync(scene, { binary: true, onlyVisible: false });
writeFileSync(out, Buffer.from(glb));
writeFileSync(outLabels, JSON.stringify([...notes, ...dims, ...casLabels], null, 1));
console.log(`${out} : ${(glb.byteLength / 1e6).toFixed(2)} Mo, ${leaves} pièces d'étape (${x8} remplacées en 8 pi), ${k8} pièces de 8 pi ; ${notes.length} notes, ${dims.length} cotes`);

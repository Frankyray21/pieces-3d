// Exporte la foreuse STM-1500 (P010) allégée pour l'outil « Voir en 3D » de l'app Procédures
// (plancher PRO-DD-ST-003, étape 18 : plancher secondaire à côté de la tour). Pour le cellulaire
// hors ligne : sans la petite visserie (pièces de moins de MIN de long), formes simplifiées
// (SimplifyModifier), un seul maillage par matériau, posée sur le plancher à sa place (STM, plan.js).
// Trois groupes, pour lever l'avance dans l'app : « stm-fixe » (traîneau, treuil, vérins de bascule),
// « stm-support » (support d'avance et vérin de relevage), origine sur l'axe de bascule arrière (tubes
// de pivot dans les paliers des poteaux arrière, PIVOT.x[1], 598 mm du sol : 45° vers le haut au plus),
// et « stm-poutre » (poutre, pied, serre-tiges, table, tête, poulie), enfant du support : elle pivote
// avec lui et coulisse le long de l'avance (vérin de relevage).
// Jambes UM-064-400D (P020, page 1.10, deux) : ajustables, posées seulement quand l'avance est levée
// (pas à 0°, page 1.01). Points d'ancrage exportés comme nœuds vides : « jambe-bas-g/d » dans
// stm-fixe (oreille de la face avant des poteaux avant, axe à 455 mm du sol) et « jambe-haut-g/d »
// dans stm-poutre (flasques latéraux de la plateforme avant de la poutre) ; l'app trace les jambes.
//
// Usage : node scripts/export-stm-app.mjs sortie.glb [MIN en m] [part gardée]
import { writeFileSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier.js';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { buildProcedural } from '../src/viewer/assembly.js';
import { STM, DECK } from '../src/models/plancher-dd/plan.js';
import { PIVOT, BEAM } from '../src/models/stm-1500/layout.js';

globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then((b) => { this.result = b; this.onloadend?.(); }); }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((b) => { this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(b).toString('base64')}`; this.onloadend?.(); });
  }
};

const [out = 'stm1500.glb', minArg = '0.1', keepArg = '0.3'] = process.argv.slice(2);
const MIN = +minArg, KEEP = +keepArg;
const { default: builders } = await import('../src/models/stm-1500/index.js');
const model = buildProcedural(builders, 'P010');
const pose = new THREE.Group();
pose.add(model.root);
// Traîneau en travers des madriers (étape 3) : l'avant (+X du modèle) vers la paroi Z négative.
pose.rotation.y = STM.yaw;
pose.position.set(STM.x, DECK, STM.z);
pose.updateMatrixWorld(true);
// Groupe de chaque pièce de premier niveau de P010 (repère du manuel ou sous-assemblage).
const FIXE = new Set(['1', '18', 'P042']), SUPPORT = new Set(['5', '12']);
const groupe = new Map();
for (const p of model.root.userData.parts || []) {
  const id = p.userData.isAssembly ? p.userData.assemblyId : p.userData.partRef;
  const g = FIXE.has(id) ? 'fixe' : SUPPORT.has(id) ? 'support' : 'poutre';
  p.traverse((o) => groupe.set(o, g));
}
const pivot = pose.localToWorld(new THREE.Vector3(PIVOT.x[1], PIVOT.y, 0));
const JAMBE_BAS = [1.035, 0.455, 0.397], JAMBE_HAUT = [BEAM.x1 - 0.25, 0.8, 0.3];

const parMat = new Map();
const bb = new THREE.Box3(), sz = new THREE.Vector3();
const simp = new SimplifyModifier();
let gardees = 0, tri0 = 0, tri1 = 0;
pose.traverse((o) => {
  if (!o.isMesh || !o.visible) return;
  bb.setFromObject(o).getSize(sz);
  if (sz.length() < MIN) return;
  const mats = [].concat(o.material);
  if (mats.length > 1) return; // pièces à plusieurs matériaux : rares, gardées simples
  const m = mats[0];
  const n = o.isInstancedMesh ? o.count : 1;
  for (let i = 0; i < n; i++) {
    let g = o.geometry.clone();
    for (const k of Object.keys(g.attributes)) if (k !== 'position') g.deleteAttribute(k);
    g = mergeVertices(g, 1e-5);
    const t = (g.index ? g.index.count : g.attributes.position.count) / 3;
    tri0 += t;
    if (t > 400) {
      try { g = simp.modify(g, Math.floor(g.attributes.position.count * (1 - KEEP))); } catch (e) { /* forme gardée telle quelle */ }
    }
    const mat = new THREE.Matrix4();
    if (o.isInstancedMesh) { o.getMatrixAt(i, mat); mat.premultiply(o.matrixWorld); } else mat.copy(o.matrixWorld);
    g.applyMatrix4(mat);
    g = g.index ? g.toNonIndexed() : g;
    g.computeVertexNormals();
    tri1 += g.attributes.position.count / 3;
    const gr = groupe.get(o) || 'fixe';
    if (gr !== 'fixe') g.translate(-pivot.x, -pivot.y, -pivot.z);   // relatif à l'axe de bascule
    const cle = gr + (m.color ? m.color.getHexString() : 'x') + (m.metalness ?? '') + (m.roughness ?? '');
    if (!parMat.has(cle)) parMat.set(cle, { m, gr, geos: [] });
    parMat.get(cle).geos.push(g);
    gardees++;
  }
});
const scene = new THREE.Scene();
const racine = new THREE.Group();
racine.name = 'stm1500';
scene.add(racine);
const noeuds = { fixe: new THREE.Group(), support: new THREE.Group(), poutre: new THREE.Group() };
for (const [k, n] of Object.entries(noeuds)) n.name = 'stm-' + k;
racine.add(noeuds.fixe, noeuds.support);
noeuds.support.add(noeuds.poutre);
noeuds.support.position.copy(pivot);
for (const [s, c] of [[-1, 'g'], [1, 'd']]) {
  const bas = new THREE.Object3D();
  bas.name = 'jambe-bas-' + c;
  bas.position.copy(pose.localToWorld(new THREE.Vector3(JAMBE_BAS[0], JAMBE_BAS[1], s * JAMBE_BAS[2])));
  noeuds.fixe.add(bas);
  const haut = new THREE.Object3D();
  haut.name = 'jambe-haut-' + c;
  haut.position.copy(pose.localToWorld(new THREE.Vector3(JAMBE_HAUT[0], JAMBE_HAUT[1], s * JAMBE_HAUT[2]))).sub(pivot);
  noeuds.poutre.add(haut);
}
for (const { m, gr, geos } of parMat.values()) {
  let g = mergeGeometries(geos, false);
  const pa = g.attributes.position.array;
  for (let i = 0; i < pa.length; i++) pa[i] = Math.round(pa[i] * 2e3) / 2e3; // au demi-millimètre
  const na = g.attributes.normal.array;
  for (let i = 0; i < na.length; i++) na[i] = Math.round(na[i] * 100) / 100;
  g = mergeVertices(g, 1e-4); // sommets partagés là où la normale est la même (arêtes vives gardées)
  const mat = new THREE.MeshStandardMaterial({ color: m.color, metalness: m.metalness ?? 0.3, roughness: m.roughness ?? 0.6 });
  mat.name = m.name || 'stm';
  noeuds[gr].add(new THREE.Mesh(g, mat));
}
const glb = await new GLTFExporter().parseAsync(scene, { binary: true });
writeFileSync(out, Buffer.from(glb));
console.log(`${out} : ${(glb.byteLength / 1e6).toFixed(2)} Mo, ${gardees} pièces gardées, ${Math.round(tri0)} → ${Math.round(tri1)} triangles, ${parMat.size} matériaux`);

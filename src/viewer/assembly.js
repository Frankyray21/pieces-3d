import * as THREE from 'three';
import * as shapes from './shapes.js';

/**
 * Construit le modèle 3D d'un assemblage à partir d'un « builder » procédural.
 *
 * Un builder est une fonction (api) => { view? } qui crée des objets avec
 * api.S (bibliothèque de formes) puis les enregistre avec
 *   api.part(ref, objet, [dx, dy, dz])
 * où ref est le numéro de la liste de pièces et [dx, dy, dz] le déplacement
 * de l'objet en vue éclatée (mètres). api.sub('F05', options) insère un
 * sous-assemblage complet (assemblé) que l'on enregistre ensuite comme une
 * seule pièce du niveau courant.
 */
export function buildProcedural(builders, id, opts = {}) {
  const builder = builders[id];
  if (!builder) return null;
  const root = new THREE.Group();
  root.name = id;
  const parts = [];
  const api = {
    S: shapes,
    THREE,
    part(ref, obj, explode = null, opts = {}) {
      obj.userData.partRef = String(ref);
      obj.userData.explode = explode ? new THREE.Vector3(...explode) : null;
      obj.userData.noLabel = !!opts.noLabel;
      root.add(obj);
      parts.push(obj);
      return obj;
    },
    sub(childId, childOpts = {}) {
      const child = buildProcedural(builders, childId, childOpts);
      if (!child) throw new Error(`Sous-assemblage introuvable : ${childId}`);
      return child.root;
    },
  };
  const meta = builder(api, opts) || {};
  return finalize({ id, root, parts, view: meta.view || {} });
}

/**
 * Construit un modèle à partir d'une scène glTF/GLB (export CAO). Chaque
 * nœud de premier niveau nommé « ref-12 », « REF_12 » ou « 12 » devient la
 * pièce 12 de la liste. Les déplacements éclatés sont calculés
 * automatiquement (radialement depuis le centre de l'assemblage).
 */
export function buildFromGltf(id, scene) {
  const root = new THREE.Group();
  root.name = id;
  const parts = [];
  [...scene.children].forEach((node) => {
    const m = /^(?:ref[-_ ]?)?([A-Za-z0-9.]+)/i.exec(node.name || '');
    if (!m) return;
    node.userData.partRef = m[1];
    node.userData.explode = null;
    node.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    root.add(node);
    parts.push(node);
  });
  return finalize({ id, root, parts, view: {} });
}

function finalize(model) {
  const { root, parts } = model;
  root.updateMatrixWorld(true);
  const total = new THREE.Box3().setFromObject(root);
  const center = total.getCenter(new THREE.Vector3());
  const size = total.getSize(new THREE.Vector3()).length() || 1;
  const refs = new Map();
  parts.forEach((p) => {
    p.userData.basePos = p.position.clone();
    if (!p.userData.explode) {
      // Éclatement automatique : radial depuis le centre de l'assemblage.
      const c = new THREE.Box3().setFromObject(p).getCenter(new THREE.Vector3());
      const dir = c.sub(center);
      if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
      p.userData.explode = dir.normalize().multiplyScalar(size * 0.25);
    }
    const r = p.userData.partRef;
    if (!refs.has(r)) refs.set(r, []);
    refs.get(r).push(p);
  });
  model.refs = refs;
  // Chaque assemblage (et chaque sous-assemblage inséré par api.sub) est un
  // « groupe » éclatable sur place par la visionneuse.
  root.userData.isAssembly = true;
  root.userData.assemblyId = model.id;
  root.userData.parts = parts;
  return model;
}

export function disposeObject(obj) {
  obj.traverse((o) => {
    if (o.isMesh) o.geometry?.dispose();
  });
}

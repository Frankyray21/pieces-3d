// Table à carottes C16080960 (Foresco pour Machines Roger) : la géométrie vient
// de la CAO SolidWorks (tools/solidworks_asm.py), montée et lissée dans Blender
// (tools/blender_table_core.py), qui écrit mesh.js. Repères = articles de la
// nomenclature du plan ; le contreplaqué du modèle, absent de la liste, est le 8.
import * as THREE from 'three';
import { mat } from '../../viewer/materials.js';
import MESH from './mesh.js';

const bytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

// Aluminium 6061-T6 nu (matériau de la nomenclature) ; contreplaqué en bois.
const MATERIAL = { 8: 'woodPlaned' };
// Déplacement en vue éclatée (m ; X largeur, Y haut, Z vers le devant).
const EXPLODE = { 1: [0, -0.3, 0.45], 2: [0, 0, 1.15], 3: [0, 0, -0.55], 4: [0, 0.4, 0.25], 5: [0, 0.45, -0.3], 6: [0, -0.5, 0], 7: [0, -0.32, 0], 8: [0, 0.1, 0.45] };

function geometry(d) {
  const g = new THREE.BufferGeometry();
  const p = new Float32Array(bytes(d.p).buffer);
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(new Int8Array(bytes(d.n).buffer), 3, true));
  g.setIndex(new THREE.BufferAttribute(new Uint16Array(bytes(d.i).buffer), 1));
  if (d.ref === '8') {
    // Veines du contreplaqué dans la largeur de la table.
    const a = new Float32Array(p.length);
    for (let i = 0; i < a.length; i += 3) a[i] = 1;
    g.setAttribute('aGrain', new THREE.BufferAttribute(a, 3));
  }
  return g;
}

export function P001(api) {
  for (const d of MESH) {
    const mesh = new THREE.Mesh(geometry(d), mat(MATERIAL[d.ref] || 'zinc'));
    mesh.name = d.piece;
    api.part(d.ref, mesh, EXPLODE[d.ref]);
  }
  return { view: { dir: [-0.72, 0.5, 1] } };
}

export default { P001 };

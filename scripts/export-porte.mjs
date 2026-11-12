// Exporte la porte assemblée 1801020 pour Unreal Engine (ou Blender, ou tout logiciel qui lit le glTF) :
// trois maillages statiques, un par corps mobile (src/models/porte-1801020/index.js), chacun avec son
// pivot à l'origine de son fichier, une section par matériau et des UV en projection par boîte
// (1 unité = 1 m).
//
//   SM_Porte_Cadre.glb    cadre, trépied, butées, moitié basse des pentures, tête d'interverrouillage
//                         origine : au plancher, au milieu de la largeur, dans le plan milieu du cadre
//   SM_Porte_Battant.glb  battant, poignée, moitié haute des pentures, socle de la barrure
//                         origine : sur l'axe des pentures, au plancher (le battant tourne autour de l'axe vertical)
//   SM_Porte_Verrou.glb   barre de la barrure, bouton, languette
//                         origine : sur l'axe du bouton, à la face avant du battant (le verrou coulisse en X)
//   porte-1801020.glb     les trois maillages montés (Cadre > Battant > Verrou) et les animations
//                         Porte_Ouvrir, Porte_Fermer, Verrou_Tirer, Battant_Ouvrir
//   porte-1801020.json    pivots, courses, sections, unités (mètres du glTF et centimètres d'Unreal)
// Chaque nœud porte son mouvement dans ses « extras » (mouvement, axe_local, angle_ouvert_deg, course_m), comme le
// coffre à outils (scripts/export-coffre-jeu.mjs) ; public/equipment/porte-1801020/essai.html les essaie.
//
// Usage : node scripts/export-porte.mjs [dossier de sortie] [--fps 30] [--metal-max 0.3]
// --metal-max : plafonne le caractère métallique des matériaux (un métal pur sort noir dans une scène
// sans ciel ni captures de reflets, comme une galerie de mine). FBX : tools/blender_porte_fbx.py.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders from '../src/models/porte-1801020/index.js';
import { IN, L, FACE, BARRURE } from '../src/models/porte-1801020/plan.js';
import { AXE, OUVERTURE } from '../src/models/porte-1801020/cinematique.js';

// Node n'a pas de FileReader : l'exportateur s'en sert pour lire ses tampons.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then((b) => { this.result = b; this.onloadend?.(); }); }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((b) => { this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(b).toString('base64')}`; this.onloadend?.(); });
  }
};

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? Number(args.splice(i, 2)[1]) : def; };
const fps = opt('--fps', 30);
const metalMax = opt('--metal-max', 1);
const out = args[0] || 'public/equipment/porte-1801020/unreal';
mkdirSync(out, { recursive: true });

const model = buildProcedural(builders, 'P01');
model.root.updateMatrixWorld(true);

// Origine de chaque corps dans le repère du modèle (m).
const PIVOT = {
  Cadre: new THREE.Vector3(0, 0, 0),
  Battant: new THREE.Vector3(AXE.x, 0, AXE.z),
  Verrou: new THREE.Vector3((BARRURE.bouton.x - L / 2) * IN, BARRURE.y * IN, FACE * IN),
};
const PARENT = { Cadre: null, Battant: 'Cadre', Verrou: 'Battant' };
// Valeurs de mouvement inscrites dans les « extras » de chaque nœud du glTF (axes du fichier, Y vers le haut).
const EXTRAS = {
  Cadre: { role: 'cadre fixe', origine: 'au plancher, au milieu de la largeur, dans le plan milieu du cadre' },
  Battant: { role: 'battant', origine: 'sur l\'axe des pentures, au plancher', mouvement: 'rotation', axe_local: 'Y', angle_ferme_deg: 0, angle_ouvert_deg: OUVERTURE.usage, butee_deg: OUVERTURE.max },
  Verrou: { role: 'verrou de la barrure', origine: 'sur l\'axe du bouton, à la face avant du battant', mouvement: 'translation', axe_local: 'X', course_m: +(BARRURE.course * IN).toFixed(4), condition: 'le battant ne tourne que verrou tiré' },
};
const NOM = (corps) => `SM_Porte_${corps}`;

/** Section de matériau d'un maillage : son lot, précisé par le matériau pour la barrure ; la visserie zinguée ensemble. */
function sectionDe(lot, matiere) {
  if (matiere === 'zinc' && lot !== 'Grillage') return 'Visserie';
  if (lot === 'Barrure') return { castAlu: 'Barrure_Corps', steel: 'Barrure_Barre', blackOxide: 'Barrure_Voyant' }[matiere] || `Barrure_${matiere}`;
  if (lot === 'Bouton') return 'Barrure_Bouton';
  return lot;
}

// ---------------------------------------------------------------- géométrie par corps et par section

const corps = new Map(); // corps → Map(section → { material, pos[], nor[], uv[], idx[], cle Map })
const up = (o, key) => { for (let p = o; p; p = p.parent) if (p.userData[key] !== undefined) return p.userData[key]; return undefined; };
const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), fn = new THREE.Vector3(), nm = new THREE.Matrix3(), n = new THREE.Vector3();
let tris = 0;
model.root.traverse((o) => {
  if (!o.isMesh || !o.visible) return;
  const body = up(o, 'body'), lot = up(o, 'lot');
  if (!body || !lot) throw new Error(`Maillage sans corps ou sans lot : ${o.name || o.parent?.name || o.uuid}`);
  const nomSection = sectionDe(lot, o.material.name);
  if (!corps.has(body)) corps.set(body, new Map());
  const sections = corps.get(body);
  if (!sections.has(nomSection)) sections.set(nomSection, { material: o.material, pos: [], nor: [], uv: [], idx: [], cle: new Map() });
  const s = sections.get(nomSection);
  const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry;
  if (!g.attributes.normal) g.computeVertexNormals();
  const P = g.attributes.position, N = g.attributes.normal, piv = PIVOT[body];
  nm.getNormalMatrix(o.matrixWorld);
  for (let i = 0; i < P.count; i += 3) {
    a.fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld);
    b.fromBufferAttribute(P, i + 1).applyMatrix4(o.matrixWorld);
    c.fromBufferAttribute(P, i + 2).applyMatrix4(o.matrixWorld);
    fn.crossVectors(b.clone().sub(a), c.clone().sub(a));
    if (fn.lengthSq() < 1e-18) continue; // triangle dégénéré
    // Projection par boîte : chaque triangle sur le plan le plus proche de sa face.
    const ax = Math.abs(fn.x), ay = Math.abs(fn.y), az = Math.abs(fn.z);
    const proj = ax >= ay && ax >= az ? (v) => [v.z, v.y] : ay >= az ? (v) => [v.x, v.z] : (v) => [v.x, v.y];
    [a, b, c].forEach((v, k) => {
      n.fromBufferAttribute(N, i + k).applyMatrix3(nm).normalize();
      const [u, w] = proj(v);
      const p = [v.x - piv.x, v.y - piv.y, v.z - piv.z];
      const cle = [...p, n.x, n.y, n.z, u, w].map((x) => Math.round(x * 1e5)).join(',');
      let id = s.cle.get(cle);
      if (id === undefined) {
        id = s.pos.length / 3;
        s.cle.set(cle, id);
        s.pos.push(...p); s.nor.push(n.x, n.y, n.z); s.uv.push(u, w);
      }
      s.idx.push(id);
    });
    tris++;
  }
});

const materiaux = new Map(); // un matériau par section, partagé entre les corps
function materiau(nomSection, src) {
  if (!materiaux.has(nomSection)) {
    const m = new THREE.MeshStandardMaterial({ color: src.color.clone(), metalness: Math.min(src.metalness ?? 0, metalMax), roughness: src.roughness ?? 0.5 });
    m.name = `M_Porte_${nomSection}`;
    materiaux.set(nomSection, m);
  }
  return materiaux.get(nomSection);
}

/** Maillage d'un corps : un groupe de triangles par section, sommets propres à chaque section. */
function maillage(nomCorps) {
  const sections = [...corps.get(nomCorps)].sort(([x], [y]) => x.localeCompare(y));
  const pos = [], nor = [], uv = [], idx = [], mats = [];
  const geo = new THREE.BufferGeometry();
  let base = 0;
  for (const [nomSection, s] of sections) {
    geo.addGroup(idx.length, s.idx.length, mats.length);
    mats.push(materiau(nomSection, s.material));
    for (const x of s.pos) pos.push(x);
    for (const x of s.nor) nor.push(x);
    for (const x of s.uv) uv.push(x);
    for (const i of s.idx) idx.push(base + i);
    base += s.pos.length / 3;
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(new THREE.Uint32BufferAttribute(idx, 1));
  geo.computeBoundingBox();
  const m = new THREE.Mesh(geo, mats);
  m.name = NOM(nomCorps);
  m.userData = { ...EXTRAS[nomCorps] };
  return m;
}

/**
 * L'exportateur fait partager à toutes les sections d'un maillage les mêmes tableaux de sommets : un logiciel qui
 * importe chaque section à part (Unreal) recopierait tous les sommets pour chacune. Chaque section reçoit ici ses
 * propres accesseurs, limités à ses sommets (contigus), et ses indices sont ramenés à ce début.
 */
function compact(glb) {
  const dv = new DataView(glb);
  const jsonLen = dv.getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(new Uint8Array(glb, 20, jsonLen)));
  const binStart = 20 + jsonLen + 8, binLen = dv.getUint32(20 + jsonLen, true);
  const SIZE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }, BYTES = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
  const at = (acc) => binStart + (json.bufferViews[acc.bufferView].byteOffset || 0) + (acc.byteOffset || 0);
  const shared = new Set();
  for (const mesh of json.meshes) {
    for (const pr of mesh.primitives) {
      const ia = json.accessors[pr.indices];
      if (ia.componentType !== 5125) throw new Error('indices attendus sur 32 bits');
      const o = at(ia);
      let lo = Infinity, hi = -Infinity;
      for (let i = 0; i < ia.count; i++) { const x = dv.getUint32(o + i * 4, true); if (x < lo) lo = x; if (x > hi) hi = x; }
      const count = hi - lo + 1;
      for (let i = 0; i < ia.count; i++) dv.setUint32(o + i * 4, dv.getUint32(o + i * 4, true) - lo, true);
      if (ia.min) { ia.min = [0]; ia.max = [count - 1]; }
      for (const [name, id] of Object.entries(pr.attributes)) {
        shared.add(id);
        const acc = { ...json.accessors[id] };
        acc.byteOffset = (acc.byteOffset || 0) + lo * SIZE[acc.type] * BYTES[acc.componentType];
        acc.count = count;
        delete acc.min; delete acc.max;
        if (name === 'POSITION') {
          const p = at(acc), min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
          for (let i = 0; i < count; i++) for (let k = 0; k < 3; k++) { const x = dv.getFloat32(p + (i * 3 + k) * 4, true); if (x < min[k]) min[k] = x; if (x > max[k]) max[k] = x; }
          acc.min = min; acc.max = max;
        }
        pr.attributes[name] = json.accessors.push(acc) - 1;
      }
    }
  }
  // Les accesseurs partagés ne servent plus : retirés, les autres renumérotés partout où ils sont cités.
  const map = new Map();
  json.accessors = json.accessors.filter((acc, id) => { if (shared.has(id)) return false; map.set(id, map.size); return true; });
  for (const mesh of json.meshes) for (const pr of mesh.primitives) {
    pr.indices = map.get(pr.indices);
    for (const name of Object.keys(pr.attributes)) pr.attributes[name] = map.get(pr.attributes[name]);
  }
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

async function ecrire(nomFichier, scene, animations = []) {
  scene.updateMatrixWorld(true);
  const glb = compact(await new GLTFExporter().parseAsync(scene, { binary: true, animations, onlyVisible: true }));
  writeFileSync(join(out, nomFichier), Buffer.from(glb));
  return glb.byteLength;
}

const ORDRE = ['Cadre', 'Battant', 'Verrou'];
const rapport = { fichiers: {}, corps: {} };

// ---------------------------------------------------------------- un fichier par corps (pivot à l'origine)

for (const nomCorps of ORDRE) {
  const m = maillage(nomCorps);
  const scene = new THREE.Scene();
  scene.name = NOM(nomCorps);
  scene.add(m);
  const taille = await ecrire(`${NOM(nomCorps)}.glb`, scene);
  const bb = m.geometry.boundingBox;
  rapport.fichiers[`${NOM(nomCorps)}.glb`] = taille;
  rapport.corps[nomCorps] = { maillage: m, boite: bb, triangles: m.geometry.index.count / 3, sommets: m.geometry.attributes.position.count, sections: m.material.map((x) => x.name) };
}

// ---------------------------------------------------------------- fichier complet, monté et animé

const scene = new THREE.Scene();
scene.name = 'Porte_1801020';
const noeud = {};
for (const nomCorps of ORDRE) {
  const m = maillage(nomCorps);
  noeud[nomCorps] = m;
  const parent = PARENT[nomCorps];
  m.position.copy(PIVOT[nomCorps]).sub(parent ? PIVOT[parent] : new THREE.Vector3());
  (parent ? noeud[parent] : scene).add(m);
}

const smooth = (t) => { const k = Math.min(1, Math.max(0, t)); return k * k * (3 - 2 * k); };
const Y = new THREE.Vector3(0, 1, 0);
const repos = noeud.Verrou.position.clone();
const course = BARRURE.course * IN;
/** Séquence : valeurs(t) → { angle (degrés), course (0 à 1) } ; clés à chaque image. */
function sequence(nomSeq, duree, valeurs) {
  const images = Math.round(duree * fps);
  const temps = Array.from({ length: images + 1 }, (_, k) => k / fps);
  const q = [], p = [], quat = new THREE.Quaternion();
  let tourne = false, glisse = false;
  for (const t of temps) {
    const v = valeurs(t);
    quat.setFromAxisAngle(Y, (v.angle * Math.PI) / 180);
    q.push(quat.x, quat.y, quat.z, quat.w);
    p.push(repos.x + v.course * course, repos.y, repos.z);
    if (Math.abs(v.angle) > 1e-9) tourne = true;
    if (Math.abs(v.course) > 1e-9) glisse = true;
  }
  const pistes = [];
  if (tourne) pistes.push(new THREE.QuaternionKeyframeTrack(`${NOM('Battant')}.quaternion`, temps, q));
  if (glisse) pistes.push(new THREE.VectorKeyframeTrack(`${NOM('Verrou')}.position`, temps, p));
  return new THREE.AnimationClip(nomSeq, duree, pistes);
}
const T_VERROU = 0.6, T_BATTANT = 2.4, A = OUVERTURE.usage;
const SEQUENCES = [
  ['Porte_Ouvrir', T_VERROU + T_BATTANT, (t) => ({ course: smooth(t / T_VERROU), angle: A * smooth((t - T_VERROU) / T_BATTANT) }), 'Le verrou se tire, puis le battant s\'ouvre de 90°'],
  ['Porte_Fermer', T_VERROU + T_BATTANT, (t) => ({ course: 1 - smooth((t - T_BATTANT) / T_VERROU), angle: A * (1 - smooth(t / T_BATTANT)) }), 'Le battant se referme, puis le verrou s\'engage'],
  ['Verrou_Tirer', T_VERROU, (t) => ({ course: smooth(t / T_VERROU), angle: 0 }), 'Le verrou seul, de engagé à tiré'],
  ['Battant_Ouvrir', T_BATTANT, (t) => ({ course: 1, angle: A * smooth(t / T_BATTANT) }), 'Le battant seul, de 0 à 90°, verrou tiré'],
];
const clips = SEQUENCES.map(([nomSeq, duree, valeurs]) => sequence(nomSeq, duree, valeurs));
rapport.fichiers['porte-1801020.glb'] = await ecrire('porte-1801020.glb', scene, clips);

// ---------------------------------------------------------------- fiche des pivots et des courses

const r4 = (x) => +x.toFixed(4), r2 = (x) => +x.toFixed(2);
// Unreal (import glTF) : centimètres, Z vers le haut ; X d'Unreal = X du glTF, Y d'Unreal = Z du glTF, Z d'Unreal = Y du glTF.
const ue = (v) => ({ X: r2(v.x * 100), Y: r2(v.z * 100), Z: r2(v.y * 100) });
const m3 = (v) => ({ x: r4(v.x), y: r4(v.y), z: r4(v.z) });
const rel = (nomCorps) => PIVOT[nomCorps].clone().sub(PARENT[nomCorps] ? PIVOT[PARENT[nomCorps]] : new THREE.Vector3());
const fiche = {
  source: 'Machines Roger International, plans 1801020 « PORTE ASSEMBLÉ » et 15250402 « TREPIED » (2022-04-05)',
  unites: {
    gltf: 'mètres, Y vers le haut, +Z vers l\'avant (côté où la porte s\'ouvre), pentures du côté +X',
    unreal: 'centimètres, Z vers le haut ; X = X du glTF, Y = Z du glTF, Z = Y du glTF (conversion de l\'import glTF d\'Unreal) : la porte s\'ouvre vers +Y',
  },
  triangles: tris,
  materiaux: [...materiaux.values()].map((m) => ({ nom: m.name, couleur: `#${m.color.getHexString()}`, metal: r2(m.metalness), rugosite: r2(m.roughness) })),
  corps: ORDRE.map((nomCorps) => {
    const c0 = rapport.corps[nomCorps], bb = c0.boite;
    return {
      nom: NOM(nomCorps), fichier: `${NOM(nomCorps)}.glb`, parent: PARENT[nomCorps] ? NOM(PARENT[nomCorps]) : null,
      triangles: c0.triangles, sommets: c0.sommets, sections: c0.sections,
      pivot_dans_le_parent: { gltf_m: m3(rel(nomCorps)), unreal_cm: ue(rel(nomCorps)) },
      boite_autour_du_pivot: { gltf_m: { min: m3(bb.min), max: m3(bb.max) }, unreal_cm: { min: ue(bb.min), max: ue(bb.max) } },
    };
  }),
  mouvements: {
    battant: {
      liaison: 'pivot autour de l\'axe vertical des pentures (origine de SM_Porte_Battant)',
      gltf: `rotation autour de +Y, de 0 à ${A}° (butée calculée : ${OUVERTURE.max}°, contre le ${OUVERTURE.butee})`,
      unreal: `lacet (Yaw) de 0 à -${A}° ; butée à -${OUVERTURE.max}°`,
      usage_deg: A, butee_deg: OUVERTURE.max,
    },
    verrou: {
      liaison: 'glissière le long du battant, vers les pentures (X local de SM_Porte_Verrou)',
      course_m: r4(course), course_cm: r2(course * 100),
      note: 'Course estimée d\'après la lumière oblongue de la barre sur le plan. Verrou engagé à 0 : le battant ne doit pas tourner.',
    },
  },
  sequences: SEQUENCES.map(([nomSeq, duree, , resume]) => ({ nom: nomSeq, duree_s: duree, images: Math.round(duree * fps) + 1, resume })),
  fps,
  fichiers: rapport.fichiers,
};
writeFileSync(join(out, 'porte-1801020.json'), JSON.stringify(fiche, null, 1));

console.log(`${out} : ${tris} triangles, ${materiaux.size} matériaux, ${clips.length} séquences à ${fps} images/s`);
for (const cp of fiche.corps) {
  const { min, max } = cp.boite_autour_du_pivot.unreal_cm;
  console.log(`  ${cp.fichier} : ${(rapport.fichiers[cp.fichier] / 1e3).toFixed(0)} ko, ${cp.triangles} triangles, ${cp.sommets} sommets, ${cp.sections.length} sections ; pivot dans le parent (cm Unreal) ${JSON.stringify(cp.pivot_dans_le_parent.unreal_cm)} ; boîte X ${min.X}..${max.X}, Y ${min.Y}..${max.Y}, Z ${min.Z}..${max.Z}`);
}
console.log(`  porte-1801020.glb : ${(rapport.fichiers['porte-1801020.glb'] / 1e3).toFixed(0)} ko`);

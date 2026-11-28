// Exporte pour Unreal Engine (ou Blender, ou tout logiciel qui lit le glTF) chaque pièce du train de forage ITH
// (src/models/train-forage-ith/forme.js) en glTF binaire, en mètres, avec des textures PBR usées.
//
//   public/equipment/train-forage-ith/unreal/
//     SM_<pièce>.glb   une pièce par fichier : maillage(s), matériau(x) et textures inclus
//     pieces.json      liste des pièces : fichier, masse à donner à la physique, taille, triangles
//
// Textures : tools/textures_train_ith.py (Python 3, numpy et Pillow), appelé par ce script. Une pièce tournée a sa
// propre texture (u autour de l'axe, v le long du profil) : peinture partie aux arêtes, rayures, rouille, filets
// graissés, crasse. Le chariot, la chaîne et les boutons de carbure ont des textures répétées (tuile de 500 mm).
//
// Usage : node scripts/export-train-ith-unreal.mjs [--qualite 1024] [filtre…]
import { writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import * as F from '../src/models/train-forage-ith/forme.js';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : def; };
const MAX = +opt('--qualite', 1024);
const filtres = args;
const OUT = new URL('../public/equipment/train-forage-ith/unreal/', import.meta.url).pathname;
const TMP = join(tmpdir(), 'train-ith-textures');
mkdirSync(OUT, { recursive: true });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

// ------------------------------------------------------------------ pièces

const lb = (x) => x * 0.45359237;
const pow2 = (x) => 2 ** Math.round(Math.log2(Math.max(64, x)));
const CLAMP = (x) => Math.min(MAX, pow2(x));

/** Texture propre d'une pièce tournée : taille d'après sa longueur développée et sa circonférence. */
function travailPiece(nom, t) {
  const C = 2 * Math.PI * t.rmax;
  // Environ 1 px/mm le long, autant autour, bornés à MAX.
  let h = CLAMP(t.S * 1.0), w = CLAMP(C * 1.0);
  if (h / w > 8) w = h / 8;
  return {
    type: 'piece', nom, h, w, L: t.S, C,
    aretes: t.aretes.map((a) => a / t.S),
    bandes: t.bandes.map((b) => ({ v0: b.s0 / t.S, v1: b.s1 / t.S, zone: b.zone, y0: b.y0, y1: b.y1, r: b.r })),
    ymin: Math.min(...t.bandes.map((b) => Math.min(b.y0, b.y1))), ymax: Math.max(...t.bandes.map((b) => Math.max(b.y0, b.y1))),
  };
}
const TUILES = new Set();
const tuile = (zone) => { TUILES.add(zone); return `T_Train_${zone}`; };

/**
 * Pièces : nom, maillages [{ nom, surfaces, tex: 'piece' | zone de tuile }], masse (kg), note.
 * Une pièce tournée : toutes ses zones en un seul maillage et un seul matériau (sa texture propre).
 */
const pieces = [];
const ajoute = (p) => { if (!filtres.length || filtres.some((f) => p.nom.includes(f))) pieces.push(p); };
const kgModele = (ss) => F.volume(ss) * 7850;

for (const diam of ['3-1-2', '5-1-2']) for (const pieds of [4, 5, 6]) {
  for (const couleur of F.TIGE.couleurs) {
    const t = F.tige(pieds, couleur, diam);
    // Tiges de 3 1/2 po : noms d'origine (SM_Tige_6pi_Jaune) ; 5 1/2 po : SM_Tige_5_1_2po_6pi_Jaune.
    const nom = `SM_Tige_${diam === '3-1-2' ? '' : '5_1_2po_'}${pieds}pi_${couleur === 'jaune' ? 'Jaune' : 'Noire'}`;
    ajoute({ nom, maillages: [{ nom, t }], kg: kgModele(t.surfaces), source: 'masse calculée (acier 7 850 kg/m³)' });
  }
}
for (const [taille, M] of Object.entries(F.MARTEAUX)) {
  const t = F.marteau(+taille);
  ajoute({ nom: `SM_Marteau_${taille}po`, maillages: [{ nom: `SM_Marteau_${taille}po`, t }], kg: M.kg, source: `masse publiée (PRO-OP-ITH-016) : ${Math.round(M.kg / 0.45359237)} lb, sans bit ni driver sub` });
  const d = F.driverSub(+taille);
  ajoute({ nom: `SM_DriverSub_${taille}po`, maillages: [{ nom: `SM_DriverSub_${taille}po`, t: d }], kg: kgModele(d.surfaces), source: 'masse calculée' });
  const a = F.anneaux(+taille);
  ajoute({ nom: `SM_Anneaux_${taille}po`, maillages: [{ nom: `SM_Anneau_${taille}po_A`, surfaces: a.gauche, tex: tuile('anneau') }, { nom: `SM_Anneau_${taille}po_B`, surfaces: a.droite, tex: tuile('anneau') }], kg: kgModele([...a.gauche, ...a.droite]), source: 'masse calculée (les deux moitiés)' });
}
for (const b of F.BITS) {
  const x = F.bit(b);
  const nom = `SM_Bit_${b.id.replace(/-/g, '_')}po`;
  ajoute({
    nom, maillages: [{ nom, t: x.corps }, { nom: `${nom}_Boutons`, surfaces: x.boutons, tex: tuile('carbure') }, { nom: `${nom}_TubeDePied`, surfaces: x.tube, tex: tuile('plastique') }],
    kg: kgModele([...x.corps.surfaces]), source: 'masse calculée',
  });
  // Bit avec son chuck (driver sub) et ses anneaux, comme on le manipule au changement de bit.
  const a = F.bitAvecChuck(b), nc = `${nom}_AvecChuck`;
  ajoute({
    nom: nc,
    maillages: [
      { nom: `${nc}_Bit`, t: a.bit.corps }, { nom: `${nc}_Boutons`, surfaces: a.bit.boutons, tex: tuile('carbure') },
      { nom: `${nc}_TubeDePied`, surfaces: a.bit.tube, tex: tuile('plastique') },
      { nom: `${nc}_Chuck`, t: a.driver }, { nom: `${nc}_Anneaux`, surfaces: a.anneaux, tex: tuile('anneau') },
    ],
    kg: kgModele([...a.bit.corps.surfaces, ...a.driver.surfaces, ...a.anneaux]), source: 'masse calculée (bit, chuck et anneaux)',
  });
}
F.SAVER_SUBS.forEach((s, i) => {
  const t = F.saverSub(i);
  ajoute({ nom: `SM_SaverSub_${s.id.replace(/-/g, '_')}`, maillages: [{ nom: `SM_SaverSub_${s.id.replace(/-/g, '_')}`, t }], kg: kgModele(t.surfaces), source: 'masse calculée' });
});
F.CASSE_BITS.forEach((C, i) => {
  const x = F.casseBit(i);
  const nom = `SM_CasseBit_${C.id.replace(/-/g, '_')}po`;
  ajoute({ nom, maillages: [{ nom, t: x.corps }, { nom: `${nom}_Ergots`, surfaces: x.ergots, tex: tuile('casse') }], kg: kgModele([...x.corps.surfaces, ...x.ergots]), source: 'masse calculée' });
});
{
  const c = F.chariot();
  const parZone = (ss) => ss.map((s) => ({ s, tex: tuile(s.zone) }));
  const m = [];
  for (const [nom, ss] of [['Cadre', c.cadre], ['Roue_G', c.roues[0]], ['Roue_D', c.roues[1]], ['Poignee_G', c.poignees[0]], ['Poignee_D', c.poignees[1]]]) {
    for (const { s, tex } of parZone(ss)) m.push({ nom: `SM_Chariot_${nom}_${s.zone}`, surfaces: [s], tex });
  }
  ajoute({ nom: 'SM_Chariot_Marteau', maillages: m, kg: 25, source: 'masse estimée (chariot à bouteille en tube d\'acier)' });
  ajoute({ nom: 'SM_Chariot_Chaine', maillages: [{ nom: 'SM_Chariot_Chaine', surfaces: c.chaine, tex: tuile('chaine') }], kg: 0.8, source: 'masse estimée' });
}

// ------------------------------------------------------------------ textures

const travaux = [];
for (const p of pieces) for (const m of p.maillages) if (m.t) travaux.push(travailPiece(`T_${m.nom.slice(3)}`, m.t));
for (const z of TUILES) travaux.push({ type: 'tuile', nom: `T_Train_${z}`, zone: z, taille: Math.min(MAX, 512) });
writeFileSync(join(TMP, 'travaux.json'), JSON.stringify(travaux));
execFileSync('python3', [new URL('../tools/textures_train_ith.py', import.meta.url).pathname, join(TMP, 'travaux.json'), TMP], { stdio: ['ignore', 'ignore', 'inherit'] });

// ------------------------------------------------------------------ écriture d'un .glb

function glb() {
  const json = { asset: { version: '2.0', generator: 'pieces-3d scripts/export-train-ith-unreal.mjs' }, scene: 0, scenes: [{ name: 'Scene', nodes: [] }], nodes: [], meshes: [], materials: [], textures: [], images: [], samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }], accessors: [], bufferViews: [], buffers: [{}] };
  const chunks = []; let length = 0;
  const view = (bytes, target) => {
    const pad = (4 - (length % 4)) % 4;
    if (pad) { chunks.push(Buffer.alloc(pad)); length += pad; }
    const v = { buffer: 0, byteOffset: length, byteLength: bytes.byteLength };
    if (target) v.target = target;
    chunks.push(Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)); length += bytes.byteLength;
    return json.bufferViews.push(v) - 1;
  };
  const accessor = (array, type, target, bounds = false) => {
    const size = { SCALAR: 1, VEC2: 2, VEC3: 3 }[type];
    const a = { bufferView: view(array, target), componentType: array instanceof Float32Array ? 5126 : 5125, count: array.length / size, type };
    if (bounds) {
      a.min = [Infinity, Infinity, Infinity]; a.max = [-Infinity, -Infinity, -Infinity];
      for (let i = 0; i < array.length; i++) { a.min[i % 3] = Math.min(a.min[i % 3], array[i]); a.max[i % 3] = Math.max(a.max[i % 3], array[i]); }
    }
    return json.accessors.push(a) - 1;
  };
  const mats = new Map();
  return {
    json,
    /** Matériau à trois textures (couleur, normales, ORM) du jeu « tex ». */
    material(tex) {
      if (mats.has(tex)) return mats.get(tex);
      const img = (k) => {
        const bytes = readFileSync(join(TMP, `${tex}_${k}.jpg`));
        const i = json.images.push({ name: `${tex}_${k}`, mimeType: 'image/jpeg', bufferView: view(new Uint8Array(bytes)) }) - 1;
        return json.textures.push({ sampler: 0, source: i }) - 1;
      };
      const c = img('C'), n = img('N'), orm = img('ORM');
      const i = json.materials.push({
        name: `M_${tex.slice(2)}`,
        pbrMetallicRoughness: { baseColorTexture: { index: c }, metallicRoughnessTexture: { index: orm }, metallicFactor: 1, roughnessFactor: 1 },
        normalTexture: { index: n }, occlusionTexture: { index: orm },
      }) - 1;
      mats.set(tex, i);
      return i;
    },
    mesh(nom, surfaces, material) {
      const P = [], N = [], UV = [], I = [];
      for (const s of surfaces) {
        const base = P.length / 3;
        P.push(...s.pos); N.push(...s.nor); UV.push(...s.uv);
        for (const k of s.idx) I.push(k + base);
      }
      const attributes = { POSITION: accessor(new Float32Array(P), 'VEC3', 34962, true), NORMAL: accessor(new Float32Array(N), 'VEC3', 34962), TEXCOORD_0: accessor(new Float32Array(UV), 'VEC2', 34962) };
      const m = json.meshes.push({ name: nom, primitives: [{ attributes, indices: accessor(new Uint32Array(I), 'SCALAR', 34963), material }] }) - 1;
      const node = json.nodes.push({ name: nom.replace(/^SM_/, ''), mesh: m }) - 1;
      json.scenes[0].nodes.push(node);
      return I.length / 3;
    },
    write(file) {
      const pad = (4 - (length % 4)) % 4;
      const bin = Buffer.concat([...chunks, Buffer.alloc(pad)]);
      json.buffers[0].byteLength = bin.length;
      let text = JSON.stringify(json);
      while (Buffer.byteLength(text) % 4) text += ' ';
      const jb = Buffer.from(text), head = Buffer.alloc(12), jh = Buffer.alloc(8), bh = Buffer.alloc(8);
      head.writeUInt32LE(0x46546c67, 0); head.writeUInt32LE(2, 4); head.writeUInt32LE(28 + jb.length + bin.length, 8);
      jh.writeUInt32LE(jb.length, 0); jh.writeUInt32LE(0x4e4f534a, 4);
      bh.writeUInt32LE(bin.length, 0); bh.writeUInt32LE(0x004e4942, 4);
      writeFileSync(file, Buffer.concat([head, jh, jb, bh, bin]));
      return 28 + jb.length + bin.length;
    },
  };
}

// ------------------------------------------------------------------ écriture

const liste = [];
for (const p of pieces) {
  const g = glb();
  let tris = 0;
  const toutes = [];
  for (const m of p.maillages) {
    const ss = m.t ? m.t.surfaces : m.surfaces;
    toutes.push(...ss);
    tris += g.mesh(m.nom, ss, g.material(m.t ? `T_${m.nom.slice(3)}` : m.tex));
  }
  const taille = g.write(join(OUT, `${p.nom}.glb`));
  const b = F.boiteEnglobante(toutes);
  liste.push({ fichier: `${p.nom}.glb`, kg: +p.kg.toFixed(1), lb: +(p.kg / 0.45359237).toFixed(0), masse: p.source, tailleM: b.taille.map((x) => +x.toFixed(3)), triangles: tris, mo: +(taille / 1e6).toFixed(2) });
  console.log(`${p.nom}.glb : ${(taille / 1e6).toFixed(2)} Mo, ${tris} triangles, ${b.taille.map((x) => (x * 1000).toFixed(0)).join(' × ')} mm, ${p.kg.toFixed(1)} kg`);
}
if (!filtres.length) {
  writeFileSync(join(OUT, 'pieces.json'), JSON.stringify({
    note: 'Train de forage ITH des Cubex (PRO-OP-ITH-001, 004, 016). glTF en mètres, Y vers le haut, origine au centre de la face du bas de chaque pièce (pièce debout). Unreal : centimètres, Z vers le haut, à l\'import.',
    pieces: liste,
  }, null, 1) + '\n');
}
void lb;

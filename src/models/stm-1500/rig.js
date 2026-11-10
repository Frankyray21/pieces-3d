// Squelette et séquences d'animation de la foreuse STM-1500 (assemblage P010).
//
// Mécanique, d'après le manuel de pièces :
// — bascule (pages 1.01, 1.2, 1.9) : le support d'avance porte deux tubes de pivot posés dans les paliers fendus des
//   poteaux du traîneau. Il pivote sur le tube avant (pied vers le bas) ou sur le tube arrière (pied vers le haut),
//   poussé par les deux vérins HBU-3010 (course de 10 po) ; les jambes UM-064-400D, non montées en 3D, tiennent le
//   mât à l'angle voulu ;
// — relevage (pages 1.2, 1.9) : la poutre coulisse dans les brides du support, tirée par le vérin HBU 2536, pour
//   appuyer la plaque de pied contre le rocher ;
// — avance (pages 1.01, 1.8, 1.11) : la table et la tête coulissent sur la poutre, course de 1 808 mm. Vérin
//   télescopique à tiges fixes : le tube central glisse sur les tiges (1,198 m), le cylindre principal, accroché sous
//   la table, glisse sur le tube (0,610 m) ;
// — rotation (pages 2.2, 2.4) : moteur A6VM160 → transmission Funk 4 vitesses → pignon de 12 dents → chaîne triple →
//   pignon de 21 dents claveté sur la broche creuse, qui entraîne le mandrin (1 200 tr/min au plus) ;
// — mandrin Boyles H et serre-tiges 12HH (pages 2.5, 1.18) : fermés par leurs ressorts, ouverts par la pression
//   d'huile ; leurs mors, dans le carter, ne sont pas animés ;
// — tête basculante (pages 1.8, 2.1) : boulons à œil desserrés, la tête pivote sur son axe de charnière pour dégager
//   l'axe du trou ;
// — treuil (pages 8.0 à 8.4) : moteur White → chaîne 80 (14 → 28 dents) → tambour ; chaîne 35 (11 → 70 dents) →
//   vis-mère à double filet qui promène le guide-câble d'un flasque à l'autre (trancannage).
//
// Les corps mobiles sont posés par le modèle (userData.body dans drill.js et head.js) et par les règles ci-dessous
// (pièces entières, désignées par leur numéro). La tige de forage (taille B, Ø 55,6 mm) ne figure pas au manuel :
// elle n'est ajoutée qu'à l'export animé (scripts/export-anim.mjs), jamais au modèle du site.
import * as THREE from 'three';
import REFS from './refs.js';
import { MECA } from './drill.js';

const DEG = Math.PI / 180;
const { pivots: PV, feed: FEED, headX: HX, swivelX: SWX, footX: FX, axisY: AY } = MECA;

/** Rayon et bouts de la tige de forage ajoutée à l'export (repos : de l'émerillon à 5 cm devant la plaque de pied). */
export const ROD = { r: 0.0278, x0: SWX, x1: FX + 0.05, y: AY };
const CABLE_PITCH = 0.008; // pas de trancannage : un diamètre de câble par tour de tambour
const R_PACK = 0.2; // rayon d'enroulement du câble sur le tambour (winch.js)

/**
 * Corps du squelette : nom (sans accent ni espace, pour Unreal), parent, liaison et point d'origine au repos.
 * q(v) : valeur de la liaison d'après les grandeurs animées v (angles en radians, courses en mètres).
 */
export const BONES = [
  { name: 'Traineau', parent: null, type: 'fixed', origin: [0, 0, 0] },
  // Bascule vers le bas sur le tube avant, vers le haut sur le tube arrière.
  { name: 'PivotAvant', parent: 'Traineau', type: 'rev', axis: [0, 0, 1], origin: [PV.x[0], PV.y, 0], q: (v) => -v.basculeBas },
  { name: 'Support', parent: 'PivotAvant', type: 'rev', axis: [0, 0, 1], origin: [PV.x[1], PV.y, 0], q: (v) => v.basculeHaut },
  { name: 'Mat', parent: 'Support', type: 'pri', axis: [1, 0, 0], origin: [-0.24, 0.84, 0], q: (v) => v.relevage },
  { name: 'Table', parent: 'Mat', type: 'pri', axis: [-1, 0, 0], origin: [HX, 0.95, 0], q: (v) => v.avance },
  { name: 'VerinAvance_Tube', parent: 'Mat', type: 'pri', axis: [-1, 0, 0], origin: [0.5, 0.845, 0], q: (v) => (v.avance * FEED.tube) / FEED.stroke },
  { name: 'Tete', parent: 'Table', type: 'rev', axis: [1, 0, 0], origin: [HX, MECA.hinge[0], MECA.hinge[1]], q: (v) => v.ouverture },
  { name: 'Broche', parent: 'Tete', type: 'rev', axis: [1, 0, 0], origin: [HX, AY, 0], q: (v) => v.rotation },
  { name: 'PignonMoteur', parent: 'Tete', type: 'rev', axis: [1, 0, 0], origin: [HX, MECA.drive[0], MECA.drive[1]], q: (v) => v.rotation / MECA.ratio },
  // Tige de forage : bout arrière (avec l'émerillon) et bout avant, dans le serre-tiges.
  { name: 'Tige_Arriere', parent: 'Mat', type: 'pri', axis: [1, 0, 0], origin: [SWX, AY, 0], q: (v) => v.tige },
  { name: 'Emerillon', parent: 'Tige_Arriere', type: 'fixed', origin: [SWX - 0.12, AY, 0], scale: (v) => v.emerillon },
  { name: 'Emerillon_Rotor', parent: 'Emerillon', type: 'rev', axis: [1, 0, 0], origin: [SWX - 0.03, AY, 0], q: (v) => v.rotation },
  { name: 'Tige_Avant', parent: 'Mat', type: 'fixed', origin: [ROD.x1, AY, 0] },
  // Poulies du câble sur la rallonge.
  { name: 'Rea_Bas', parent: 'Mat', type: 'rev', axis: [0, 0, 1], origin: [...MECA.sheaves[0], 0], q: (v) => (v.treuil * R_PACK) / MECA.sheaveR },
  { name: 'Rea_Haut', parent: 'Mat', type: 'rev', axis: [0, 0, 1], origin: [...MECA.sheaves[1], 0], q: (v) => (v.treuil * R_PACK) / MECA.sheaveR },
  // Vérins de bascule : le fût pivote sur la chape du longeron, la tige suit la patte du support.
  ...['D', 'G'].flatMap((c) => {
    const z = (c === 'D' ? 1 : -1) * MECA.tilt.z;
    const ram = { a: [...MECA.tilt.foot, z], b: [...MECA.tilt.head, z], on: 'Support' };
    return [
      { name: `VerinBascule_${c}_Fut`, parent: 'Traineau', type: 'aim', side: 'fut', origin: ram.a, ram },
      { name: `VerinBascule_${c}_Tige`, parent: 'Traineau', type: 'aim', side: 'tige', origin: ram.b, ram },
    ];
  }),
  // Treuil : axes relevés sur le modèle (resolve), rapports des chaînes 80 et 35.
  { name: 'Treuil_Tambour', parent: 'Traineau', type: 'rev', axis: [0, 0, 1], origin: [...MECA.winch.drum, 0], q: (v) => v.treuil },
  { name: 'Treuil_Moteur', parent: 'Traineau', type: 'rev', axis: [0, 0, 1], origin: 'P042/UM-032-111F', q: (v) => (v.treuil * 28) / 14 },
  { name: 'Treuil_VisMere', parent: 'Traineau', type: 'rev', axis: [0, 0, 1], origin: 'P041/UM-032-226F', q: (v) => (v.treuil * 11) / 70 },
  { name: 'Treuil_Guide', parent: 'Traineau', type: 'pri', axis: [0, 0, 1], origin: 'P041/UM-041-020F', q: (v) => trancannage(v.treuil) },
];

/** Grandeurs animées et leur valeur de repos. */
export const REST = { basculeBas: 0, basculeHaut: 0, relevage: 0, avance: 0, ouverture: 0, rotation: 0, tige: 0, emerillon: 1, treuil: 0 };

/** Va-et-vient du guide-câble entre les flasques (z de −0,17 à +0,22 m), un diamètre de câble par tour. */
function trancannage(angle) {
  const z0 = -0.17, z1 = 0.22, span = z1 - z0;
  const d = (((angle / (2 * Math.PI)) * CABLE_PITCH - z0) % (2 * span) + 2 * span) % (2 * span);
  return (d < span ? z0 + d : z1 - (d - span));
}

/** Pièces entières rattachées à un corps : assemblage, numéros de pièce, corps. */
export const RULES = [
  ['P010', ['FBRA-002-600BB'], 'Support'],
  ['P010', ['FBRA-002-300BB', 'FBRA-002-305BB', 'FTD-148-300TF', 'UM-079-100A-12', 'UM-064-800B', 'UM-064-200C'], 'Mat'],
  ['P010', ['UM-064-200DS'], 'Table'],
  ['P010', ['UM-012-100UG'], 'Tete'],
  // Ce qui tourne avec la broche : pignon mené, chemises, écrous, couvercle d'usure, manchons, clés du mandrin.
  ['P048', ['UM-012-101', 'UM-012-122', 'UM-012-102', 'UM-012-107', 'UM-012-106', 'UM-012-117', 'UM-012-118', 'SS75-1250', 'UM-012-115',
    'UM-012-116', 'UM-012-110', 'UM-012-108', 'SHCS312-1500', 'UM-012-189'], 'Broche'],
  ['P048', ['UM-012-103', 'UM-012-169'], 'PignonMoteur'],
  // Treuil : tambour et ses pignons, pignon du moteur, vis-mère avec son pignon et son volant, guide-câble.
  ['P042', ['UM-032-102A', 'UM-032-112F'], 'Treuil_Tambour'],
  ['P040', ['UM-032-162F', 'UM-032-109F'], 'Treuil_Tambour'],
  ['P042', ['UM-032-111F'], 'Treuil_Moteur'],
  ['P041', ['UM-032-226F'], 'Treuil_VisMere'],
  ['P040', ['UM-032-110F'], 'Treuil_VisMere'],
  ['P039', ['UM-032-169F', 'UM-032-102F', 'SP250-1250', 'SP375-3000'], 'Treuil_VisMere'],
  ['P041', ['UM-041-164F', 'UM-041-106F', 'UM-041-155F', 'UM-041-020F', 'UM-041-176F', 'UM-041-174F', 'CTP-125-2250', ''], 'Treuil_Guide'],
  // Réas de la poulie pivotante.
  ['P017', ['UM-064-119C', 'UM-064-118C'], (o, c) => (Math.hypot(c.x - MECA.sheaves[0][0], c.y - MECA.sheaves[0][1]) < 0.05 ? 'Rea_Bas' : 'Rea_Haut')],
];

/**
 * Pose les étiquettes de corps des règles sur un modèle P010 construit, et relève les axes du treuil.
 * Renvoie les corps avec leur origine en coordonnées (repère de la foreuse).
 */
export function resolve(root) {
  root.updateMatrixWorld(true);
  const center = (o) => new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
  // Pièces par (assemblage, numéro).
  const index = new Map();
  root.traverse((o) => {
    if (o.userData.partRef === undefined) return;
    let asm = o.parent;
    while (asm && !asm.userData.isAssembly) asm = asm.parent;
    const key = `${asm?.userData.assemblyId}/${o.userData.partRef}`;
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(o);
  });
  const find = (asm, pn) => {
    const ref = REFS[asm]?.[pn];
    const objs = ref === undefined ? [] : index.get(`${asm}/${ref}`) || [];
    if (!objs.length) throw new Error(`rig : pièce ${asm}/${pn} introuvable`);
    return objs;
  };
  for (const [asm, pns, body] of RULES) {
    for (const pn of pns) for (const o of find(asm, pn)) o.userData.body = typeof body === 'function' ? body(o, center(o)) : body;
  }
  return BONES.map((b) => {
    if (typeof b.origin !== 'string') return { ...b };
    const [asm, pn] = b.origin.split('/');
    return { ...b, origin: center(find(asm, pn)[0]).toArray() };
  });
}

/**
 * Déplacement de chaque corps (matrice appliquée à sa géométrie de repos, repère de la foreuse) pour les grandeurs v.
 * bones : résultat de resolve().
 */
export function pose(bones, values) {
  const v = { ...REST, ...values };
  const J = new Map();
  const m = new THREE.Matrix4();
  for (const b of bones) {
    if (b.type === 'aim') continue;
    const out = new THREE.Matrix4();
    const o = new THREE.Vector3(...b.origin);
    if (b.type === 'rev') {
      out.makeTranslation(o.x, o.y, o.z).multiply(m.makeRotationAxis(new THREE.Vector3(...b.axis), b.q(v))).multiply(m.makeTranslation(-o.x, -o.y, -o.z));
    } else if (b.type === 'pri') {
      const q = b.q(v);
      out.makeTranslation(b.axis[0] * q, b.axis[1] * q, b.axis[2] * q);
    }
    if (b.scale) {
      const s = b.scale(v);
      out.multiply(m.makeTranslation(o.x, o.y, o.z)).multiply(new THREE.Matrix4().makeScale(s, s, s)).multiply(m.makeTranslation(-o.x, -o.y, -o.z));
    }
    if (b.parent) out.premultiply(J.get(b.parent));
    J.set(b.name, out);
  }
  // Vérins : fût sur son axe de fond, pointé vers l'œil de tige ; tige posée sur la patte, même orientation.
  for (const b of bones) {
    if (b.type !== 'aim') continue;
    const A = new THREE.Vector3(...b.ram.a), B0 = new THREE.Vector3(...b.ram.b);
    const B = B0.clone().applyMatrix4(J.get(b.ram.on));
    const a0 = Math.atan2(B0.y - A.y, B0.x - A.x), a = Math.atan2(B.y - A.y, B.x - A.x);
    const R = new THREE.Matrix4().makeRotationZ(a - a0);
    const P = b.side === 'fut' ? A : B, P0 = b.side === 'fut' ? A : B0;
    J.set(b.name, new THREE.Matrix4().makeTranslation(P.x, P.y, P.z).multiply(R).multiply(m.makeTranslation(-P0.x, -P0.y, -P0.z)));
    b.length = A.distanceTo(B);
  }
  return J;
}

// ---------------------------------------------------------------- séquences

const ease = (t) => t * t * (3 - 2 * t);
/** Valeur d'une piste [[t, valeur], …] au temps t (passage adouci d'une clé à l'autre ; 'lin' en 3e position : linéaire). */
function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, mode] = keys[i], [t0, v0] = keys[i - 1];
    if (t <= t1) { const k = (t - t0) / (t1 - t0); return v0 + (v1 - v0) * (mode === 'lin' ? k : ease(k)); }
  }
  return keys[keys.length - 1][1];
}
/** Angle parcouru (rad) pour une vitesse en tr/s donnée par une piste [[t, tr/s], …] : intégrale par pas de 1/240 s. */
function integrate(keys, t) {
  let a = 0;
  const dt = 1 / 240;
  for (let s = 0; s < t - 1e-9; s += dt) a += track(keys, s + dt / 2) * Math.min(dt, t - s);
  return a * 2 * Math.PI;
}

const S = FEED.stroke; // 1,808 m
const ROD_L = 3.048; // tige de 10 pi
const S2 = ROD_L - S; // seconde course : 1,240 m

/**
 * Séquences : nom, durée (s), boucle, résumé, puis grandeurs animées en fonction du temps.
 * Les vitesses sont ralenties pour la lecture (rotation à 60 tr/min au lieu de plusieurs centaines).
 */
export const CLIPS = [
  {
    name: 'Forage_Tige_10pi', duration: 28, loop: false,
    summary: 'Forage d\'une tige de 10 pi en deux courses : rotation et avance de 1 808 mm, reprise de course (serre-tiges fermé, mandrin ouvert, la tête recule le long de la tige), puis fin de la tige.',
    values: (t) => ({
      rotation: integrate([[0, 0], [1, 1], [11, 1], [12, 0], [19, 0], [20, 1], [27, 1], [28, 0]], t),
      avance: track([[0, S], [1, S], [11, 0], [13, 0], [18, S2], [20, S2], [27, 0]], t),
      tige: track([[0, -ROD_L], [1, -ROD_L], [11, -S2], [20, -S2], [27, 0]], t),
    }),
  },
  {
    name: 'Course_Avance', duration: 14, loop: true,
    summary: 'Course complète de la tête sur la poutre (1 808 mm), mandrin fermé sur la tige : le vérin télescopique se déploie en deux étages.',
    values: (t) => ({ avance: track([[0, 0], [6, S], [8, S], [14, 0]], t), tige: -track([[0, 0], [6, S], [8, S], [14, 0]], t) }),
  },
  {
    name: 'Rotation_Broche', duration: 4, loop: true,
    summary: 'Rotation seule : pignon menant de 12 dents, chaîne triple, pignon de 21 dents claveté sur la broche, disque du mandrin et rallonge de l\'émerillon (4 tours de broche pour 7 tours du pignon menant).',
    values: (t) => ({ rotation: (t / 4) * 2 * Math.PI * 4 }),
  },
  {
    name: 'Bascule_Bas_45', duration: 20, loop: true,
    summary: 'Bascule de 45° vers le bas : le support pivote sur le tube avant, poussé par les deux vérins de bascule ; le tube arrière quitte ses paliers.',
    values: (t) => ({ basculeBas: track([[0, 0], [9, 45 * DEG], [11, 45 * DEG], [20, 0]], t) }),
  },
  {
    name: 'Bascule_Bas_90', duration: 30, loop: true,
    summary: 'Bascule jusqu\'à la verticale, pied vers le bas (page 1.01, « drill 90° down »).',
    values: (t) => ({ basculeBas: track([[0, 0], [14, 90 * DEG], [16, 90 * DEG], [30, 0]], t) }),
  },
  {
    name: 'Relevage_Mat', duration: 12, loop: true,
    summary: 'Relevage : la poutre coulisse de 250 mm dans les brides du support pour appuyer la plaque de pied.',
    values: (t) => ({ relevage: track([[0, 0], [5, 0.25], [7, 0.25], [12, 0]], t) }),
  },
  {
    name: 'Treuil_Enroulement', duration: 12, loop: false,
    summary: 'Treuil : le moteur entraîne le tambour par la chaîne 80 (2 tours de moteur par tour de tambour), la vis-mère promène le guide-câble d\'un diamètre de câble par tour ; les réas de la poulie tournent avec le câble.',
    values: (t) => ({ treuil: integrate([[0, 0], [1.5, 1], [10.5, 1], [12, 0]], t) }),
  },
  {
    name: 'Tete_Ouverture', duration: 12, loop: true,
    summary: 'Tête ouverte : tige retenue par le serre-tiges et émerillon retiré, la tête pivote de 65° sur son axe de charnière pour dégager l\'axe du trou.',
    values: (t) => ({ ouverture: track([[0, 0], [5, 65 * DEG], [7, 65 * DEG], [12, 0]], t), tige: 1.05, emerillon: 0.001 }),
  },
];

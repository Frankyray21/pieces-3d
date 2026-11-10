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
// — trou ascendant (page 1.01, « drill 45° up ») : le treuil recule derrière le traîneau, la rallonge et sa poulie
//   sont retirées, le vérin de relevage avance le mât de 0,6 m dans son support, les vérins de bascule sont reportés
//   sur les pattes arrière du support, le mât bascule de 45° sur le tube arrière et les deux jambes UM-064-400D
//   (page 1.10) le tiennent, des paliers avant libérés aux trous du flanc de la poutre. Le bas du mât descend alors
//   15 cm sous le traîneau (9 cm sur le dessin du manuel) : la foreuse se pose sur son plancher ;
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

/**
 * Position de trou ascendant à 45° (page 1.01) : recul du treuil, avance du mât, et jambes. Une jambe va du palier
 * avant du traîneau (a) au trou du flanc de la poutre (b, au repos) ; rest : pied de la jambe couchée au sol.
 */
export const UP = { angle: 45 * DEG, relevage: 0.6, treuil: 1.48 };
export const LEG = (() => {
  const a = [PV.x[0], PV.y, 0.4], b = [1.18, 0.88, 0.31];
  const c = Math.cos(UP.angle), s = Math.sin(UP.angle), dx = b[0] + UP.relevage - PV.x[1], dy = b[1] - PV.y;
  const top = [PV.x[1] + dx * c - dy * s, PV.y + dx * s + dy * c, b[2]]; // trou de la poutre, mât avancé et basculé
  return { a, b, top, L: Math.hypot(top[0] - a[0], top[1] - a[1], top[2] - a[2]), rest: [-0.25, 0.04, 0.72] };
})();

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
  // Rallonge du mât (guide de tiges, pivot et poulie), retirée pour les trous ascendants ; poulies du câble.
  { name: 'Rallonge', parent: 'Mat', type: 'fixed', origin: [-1.9, 0.9, 0], scale: (v) => v.rallonge },
  { name: 'Rea_Bas', parent: 'Rallonge', type: 'rev', axis: [0, 0, 1], origin: [...MECA.sheaves[0], 0], q: (v) => (v.treuil * R_PACK) / MECA.sheaveR },
  { name: 'Rea_Haut', parent: 'Rallonge', type: 'rev', axis: [0, 0, 1], origin: [...MECA.sheaves[1], 0], q: (v) => (v.treuil * R_PACK) / MECA.sheaveR },
  // Vérins de bascule : le fût pivote sur la chape du longeron, la tige suit la patte du support.
  ...['D', 'G'].flatMap((c) => {
    const z = (c === 'D' ? 1 : -1) * MECA.tilt.z;
    // b : patte avant du support (bascule vers le bas) ; b2 : patte arrière (bascule vers le haut, vérin reporté).
    const ram = { a: [...MECA.tilt.foot, z], b: [...MECA.tilt.head, z], b2: [MECA.tilt.lugs[1], MECA.tilt.lugY, z], on: 'Support' };
    return [
      { name: `VerinBascule_${c}_Fut`, parent: 'Traineau', type: 'aim', side: 'fut', origin: ram.a, ram },
      { name: `VerinBascule_${c}_Tige`, parent: 'Traineau', type: 'aim', side: 'tige', origin: ram.b, ram },
    ];
  }),
  // Treuil : axes relevés sur le modèle (resolve), rapports des chaînes 80 et 35.
  { name: 'Treuil', parent: 'Traineau', type: 'pri', axis: [-1, 0, 0], origin: [MECA.winch.x, 0.15, 0], q: (v) => v.treuilRecul },
  { name: 'Cable', parent: 'Treuil', type: 'fixed', origin: [MECA.winch.drum[0], MECA.winch.drum[1] + 0.2, 0], scale: (v) => v.cable },
  { name: 'Treuil_Tambour', parent: 'Treuil', type: 'rev', axis: [0, 0, 1], origin: [...MECA.winch.drum, 0], q: (v) => v.treuil },
  { name: 'Treuil_Moteur', parent: 'Treuil', type: 'rev', axis: [0, 0, 1], origin: 'P042/UM-032-111F', q: (v) => (v.treuil * 28) / 14 },
  { name: 'Treuil_VisMere', parent: 'Treuil', type: 'rev', axis: [0, 0, 1], origin: 'P041/UM-032-226F', q: (v) => (v.treuil * 11) / 70 },
  { name: 'Treuil_Guide', parent: 'Treuil', type: 'pri', axis: [0, 0, 1], origin: 'P041/UM-041-020F', q: (v) => trancannage(v.treuil) },
  // Jambes UM-064-400D : couchées au sol le long du traîneau, puis posées entre le palier avant et la poutre.
  ...['D', 'G'].map((c) => ({ name: `Jambe_${c}`, parent: 'Traineau', type: 'leg', side: c === 'D' ? 1 : -1, origin: [LEG.rest[0], LEG.rest[1], (c === 'D' ? 1 : -1) * LEG.rest[2]] })),
];

/** Grandeurs animées et leur valeur de repos. */
export const REST = { basculeBas: 0, basculeHaut: 0, relevage: 0, avance: 0, ouverture: 0, rotation: 0, tige: 0, emerillon: 1, treuil: 0,
  treuilRecul: 0, rallonge: 1, cable: 1, report: 0, jambes: 0 };

/** Va-et-vient du guide-câble entre les flasques (z de −0,17 à +0,22 m), un diamètre de câble par tour. */
function trancannage(angle) {
  const z0 = -0.17, z1 = 0.22, span = z1 - z0;
  const d = (((angle / (2 * Math.PI)) * CABLE_PITCH - z0) % (2 * span) + 2 * span) % (2 * span);
  return (d < span ? z0 + d : z1 - (d - span));
}

/** Pièces entières rattachées à un corps : assemblage, numéros de pièce, corps. */
export const RULES = [
  ['P010', ['FBRA-002-600BB'], 'Support'],
  ['P010', ['FBRA-002-300BB', 'FBRA-002-305BB', 'FTD-148-300TF', 'UM-079-100A-12', 'UM-064-800B'], 'Mat'],
  ['P010', ['UM-064-200C'], 'Rallonge'],
  ['P010', ['FBRA-002-400HH'], 'Treuil'],
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
    if (b.type === 'aim' || b.type === 'leg') continue;
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
    const a0 = Math.atan2(B0.y - A.y, B0.x - A.x);
    let a = Math.atan2(B.y - A.y, B.x - A.x);
    if (v.report > 0) {
      // Vérin reporté sur la patte arrière : il tourne sur son axe de fond, de l'une à l'autre (angle et longueur).
      const B2 = new THREE.Vector3(...b.ram.b2).applyMatrix4(J.get(b.ram.on));
      const a2 = Math.atan2(B2.y - A.y, B2.x - A.x), L = A.distanceTo(B) + (A.distanceTo(B2) - A.distanceTo(B)) * v.report;
      a += (a2 - a) * v.report;
      B.set(A.x + L * Math.cos(a), A.y + L * Math.sin(a), A.z);
    }
    const R = new THREE.Matrix4().makeRotationZ(a - a0);
    const P = b.side === 'fut' ? A : B, P0 = b.side === 'fut' ? A : B0;
    J.set(b.name, new THREE.Matrix4().makeTranslation(P.x, P.y, P.z).multiply(R).multiply(m.makeTranslation(-P0.x, -P0.y, -P0.z)));
    b.length = A.distanceTo(B);
  }
  // Jambes : du sol (couchées le long du traîneau) à leur place, en arc au-dessus des poteaux.
  for (const b of bones) {
    if (b.type !== 'leg') continue;
    const k = Math.min(1, Math.max(0, v.jambes)), e = k * k * (3 - 2 * k);
    const S0 = new THREE.Vector3(...b.origin);
    const A = new THREE.Vector3(LEG.a[0], LEG.a[1], b.side * LEG.a[2]);
    const B = new THREE.Vector3(LEG.b[0], LEG.b[1], b.side * LEG.b[2]).applyMatrix4(J.get('Mat'));
    const q = new THREE.Quaternion().slerp(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), B.sub(A).normalize()), e);
    const P = S0.clone().lerp(A, e);
    P.y += 0.9 * Math.sin(Math.PI * e);
    J.set(b.name, new THREE.Matrix4().makeTranslation(P.x, P.y, P.z).multiply(m.makeRotationFromQuaternion(q)).multiply(new THREE.Matrix4().makeTranslation(-S0.x, -S0.y, -S0.z)));
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
const ROD5 = 1.524, S_UP = 1.25; // trou ascendant : tige de 5 pi, course limitée par le moteur de la tête au-dessus du traîneau
const HAUT_SANS_RALLONGE = { rallonge: 0.001, cable: 0.001 }; // rallonge, poulie et câble retirés

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
    name: 'Ascendant_45_Mise_En_Place', duration: 36, loop: false,
    summary: 'Mise en position de trou ascendant à 45° (page 1.01) : le treuil recule derrière le traîneau, le mât avance de 0,6 m dans son support, les vérins de bascule sont reportés sur les pattes arrière, le mât bascule sur le tube arrière, puis les deux jambes sont posées.',
    values: (t) => ({
      ...HAUT_SANS_RALLONGE,
      treuilRecul: track([[0, 0], [5, UP.treuil]], t),
      relevage: track([[5, 0], [11, UP.relevage]], t),
      report: track([[11, 0], [15, 1]], t),
      basculeHaut: track([[15, 0], [27, UP.angle]], t),
      jambes: track([[27, 0], [33, 1]], t),
    }),
  },
  {
    name: 'Ascendant_45_Forage', duration: 20, loop: false,
    summary: 'Forage ascendant à 45°, tige de 5 pi : course de 1,25 m (la tête ne recule pas davantage, son moteur toucherait le traîneau), reprise de course, puis fin de la tige.',
    values: (t) => ({
      ...HAUT_SANS_RALLONGE, treuilRecul: UP.treuil, relevage: UP.relevage, report: 1, basculeHaut: UP.angle, jambes: 1,
      rotation: integrate([[0, 0], [1, 1], [9, 1], [10, 0], [14.5, 0], [15.5, 1], [18, 1], [19, 0]], t),
      avance: track([[0, S_UP], [1, S_UP], [9, 0], [11, 0], [13.5, ROD5 - S_UP], [15.5, ROD5 - S_UP], [18, 0]], t),
      tige: track([[0, -ROD5], [1, -ROD5], [9, S_UP - ROD5], [15.5, S_UP - ROD5], [18, 0]], t),
    }),
  },
  {
    name: 'Tete_Ouverture', duration: 12, loop: true,
    summary: 'Tête ouverte : tige retenue par le serre-tiges et émerillon retiré, la tête pivote de 65° sur son axe de charnière pour dégager l\'axe du trou.',
    values: (t) => ({ ouverture: track([[0, 0], [5, 65 * DEG], [7, 65 * DEG], [12, 0]], t), tige: 1.05, emerillon: 0.001 }),
  },
];

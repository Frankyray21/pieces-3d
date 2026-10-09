// Description mécanique du DU311 s/n 10703 pour la simulation (hors site) :
// corps mobiles et liaisons, commandes (débattements, vitesses), verrouillages,
// positions prédéfinies et translation du porteur articulé. Les axes viennent des
// constantes des modèles (layout.js, slide.js, feed.js, reardeck.js) : modifier un
// modèle déplace la liaison correspondante.
// Vitesses : elles découlent du circuit hydraulique (débits des tiroirs, sections
// des vérins, cylindrées) ; données du manuel de pièces quand il les donne, sinon
// estimations signalées comme telles.
import { AXLE, WHEEL } from '../models/du311-std/layout.js';
import { SLIDE } from '../models/du311-std/slide.js';
import { FEED } from '../models/du311-std/feed.js';
import { feedToMachine as fm } from '../models/du311-std/machine.js';
import { REEL, DRIVE } from '../models/du311-std/reardeck.js';
import { IN, LPM } from './hydraulics.js';

const DEG = Math.PI / 180;
const C = FEED.car, K = FEED.clamp;

// ---------------------------------------------------------------- géométrie du carrousel

const T = FEED.transfer; // alvéole atteinte par les bras de serrage (repère de l'avance)
// Angle d'un vecteur (x, z) autour de +Y, dans le sens des rotations three.js.
const ang = (x, z) => Math.atan2(-z, x);
const CLAMP_IN = ang(T[0] - K.x, T[1] - K.z) - ang(0 - K.x, FEED.AX - K.z); // bras dans le carrousel
/** Rotation du carrousel qui amène l'alvéole k au point de transfert (alvéole 1 : 0). */
export const carouselAngle = (k) => -(k * 2 * Math.PI) / 17;

// ---------------------------------------------------------------- corps et liaisons

export const BODIES = [
  // porteur : articulation centrale (braquage), roues, stabilisateurs
  { name: 'front', parent: 'chassis', type: 'rev', axis: [0, 1, 0], origin: [0, 0, 0], min: -35 * DEG, max: 35 * DEG },
  ...[['wFL', 'front', AXLE.front, -1], ['wFR', 'front', AXLE.front, 1], ['wRL', 'chassis', AXLE.rear, -1], ['wRR', 'chassis', AXLE.rear, 1]]
    .map(([name, parent, x, s]) => ({ name, parent, type: 'rev', axis: [0, 0, 1], origin: [x, AXLE.y, s * WHEEL.z] })),
  { name: 'jackL', parent: 'chassis', type: 'pri', axis: [0, 1, 0], min: 0, max: 0.18 },
  { name: 'jackR', parent: 'chassis', type: 'pri', axis: [0, 1, 0], min: 0, max: 0.18 },
  { name: 'outL', parent: 'front', type: 'pri', axis: [0, 1, 0], min: 0, max: 0.24 },
  { name: 'outR', parent: 'front', type: 'pri', axis: [0, 1, 0], min: 0, max: 0.24 },
  // glissière : basculement du cadre, translation latérale, actionneur rotatif
  { name: 'tilt', parent: 'front', type: 'rev', axis: [0, 0, 1], origin: [SLIDE.pivot.x, SLIDE.pivot.y, 0], min: -15 * DEG, max: 85 * DEG },
  { name: 'shift', parent: 'tilt', type: 'pri', axis: [0, 0, 1], min: -0.25, max: 0.25 },
  { name: 'roll', parent: 'shift', type: 'rev', axis: [1, 0, 0], origin: [SLIDE.rot.x, SLIDE.rot.y, 0], min: -180 * DEG, max: 180 * DEG },
  // avance : extension sur le MCP, course de la tête, rotation de la broche
  { name: 'ext', parent: 'roll', type: 'pri', axis: [0, 1, 0], min: -0.15, max: 0.55 },
  { name: 'feed', parent: 'ext', type: 'pri', axis: [0, 1, 0], min: -2.05, max: 0 },
  { name: 'spin', parent: 'feed', type: 'rev', axis: [0, 1, 0], origin: fm([0, 0, FEED.AX]) },
  // carrousel, bras de serrage, stinger, plaque à coins
  { name: 'carousel', parent: 'ext', type: 'rev', axis: [0, 1, 0], origin: fm([C.x, 0, C.z]) },
  { name: 'clamp', parent: 'ext', type: 'rev', axis: [0, 1, 0], origin: fm([K.x, 0, K.z]), min: Math.min(CLAMP_IN, 0), max: Math.max(CLAMP_IN, 0) },
  { name: 'stingUp', parent: 'ext', type: 'pri', axis: [0, 1, 0], min: 0, max: 0.5 },
  { name: 'stingDn', parent: 'ext', type: 'pri', axis: [0, -1, 0], min: 0, max: 0.5 },
  { name: 'slip', parent: 'ext', type: 'pri', axis: [0, 0, 1], min: 0, max: 0.22 }, // vers -X de l'avance
  // pont arrière : enrouleur de câble, volant du surpresseur, poulie du moteur
  { name: 'reel', parent: 'chassis', type: 'rev', axis: [1, 0, 0], origin: [REEL.x, REEL.y, 0] },
  { name: 'flywheel', parent: 'chassis', type: 'rev', axis: [0, 0, 1], origin: [DRIVE.x, DRIVE.yComp, DRIVE.z] },
  { name: 'sheave', parent: 'chassis', type: 'rev', axis: [0, 0, 1], origin: [DRIVE.x, DRIVE.yMotor, DRIVE.z] },
];

// Pièces de la tête de rotation (sous-assemblage P050 repris du TVK) qui tournent
// avec la broche : raccord d'usure, insert cannelé, piston cannelé.
export const RULES = [
  { path: ['8', '4', '3'], body: 'spin' },
  { path: ['8', '4', '5'], body: 'spin' },
  { path: ['8', '4', '1'], body: 'spin' },
];

// ---------------------------------------------------------------- commandes

// Une commande pilote un ou plusieurs corps vers une consigne ; chaque corps est
// une fonction hydraulique (section de distributeur, voir HYDRAULICS). scale / unit :
// affichage (degrés, mm…).
export const CONTROLS = [
  { group: 'Porteur', items: [
    { id: 'front', label: 'Direction (articulation)', scale: 1 / DEG, unit: '°', digits: 0 },
    { id: 'jacks', label: 'Stabilisateurs arrière (levée)', bodies: ['jackL', 'jackR'], scale: 1000, unit: 'mm', digits: 0 },
    { id: 'outriggers', label: 'Stabilisateurs avant (levée)', bodies: ['outL', 'outR'], scale: 1000, unit: 'mm', digits: 0 },
  ] },
  { group: 'Glissière', items: [
    { id: 'tilt', label: 'Basculement du cadre', scale: 1 / DEG, unit: '°', digits: 0 },
    { id: 'shift', label: 'Translation latérale', scale: 1000, unit: 'mm', digits: 0 },
    { id: 'roll', label: "Rotation de l'avance", scale: 1 / DEG, unit: '°', digits: 0 },
  ] },
  { group: 'Avance', items: [
    { id: 'ext', label: "Extension de l'avance (MCP)", scale: 1000, unit: 'mm', digits: 0 },
    { id: 'feed', label: 'Course de la tête de rotation', scale: 1000, unit: 'mm', digits: 0 },
    { id: 'stingers', label: 'Vérins stinger', bodies: ['stingUp', 'stingDn'], scale: 1000, unit: 'mm', digits: 0 },
    { id: 'slip', label: 'Plaque à coins (ouverture)', scale: 1000, unit: 'mm', digits: 0 },
  ] },
  { group: 'Carrousel', items: [
    { id: 'clamp', label: 'Bras de serrage (vers le carrousel)', scale: -1 / DEG, unit: '°', digits: 0 },
  ] },
];

export const SPEEDS = {
  sheave: 2 * Math.PI * 2, // rad/s affichés (vitesse réelle ~30 tr/s, trop rapide à l'écran)
};

// ---------------------------------------------------------------- verrouillages

// Chaque règle peut bloquer un sens de mouvement d'une commande ; message affiché.
// v(id) : valeur courante d'un corps.
export const INTERLOCKS = [
  { cmd: 'drive', when: (v) => v('jackL') < 0.17 || v('jackR') < 0.17 || v('outL') < 0.23 || v('outR') < 0.23,
    msg: 'Translation bloquée : relever les stabilisateurs avant et arrière.' },
  { cmd: 'feed', dir: -1, when: (v) => v('feed') <= -0.2 && Math.abs(v('clamp')) < Math.abs(CLAMP_IN) * 0.6,
    msg: "Tête bloquée : écarter les bras de serrage de l'axe de forage avant de descendre." },
  { cmd: 'clamp', dir: 1, when: (v) => v('feed') < -0.2 && Math.abs(v('clamp')) < Math.abs(CLAMP_IN) * 0.6 + 0.01,
    msg: "Bras bloqués : remonter la tête de rotation avant de ramener les bras sur l'axe." },
  { cmd: 'carousel', when: (v) => Math.abs(v('clamp')) > Math.abs(CLAMP_IN) * 0.4,
    msg: 'Indexage bloqué : bras de serrage engagés dans le carrousel.' },
  { cmd: 'tilt', dir: 1, when: (v) => v('tilt') >= 20 * DEG && (v('stingUp') > 0.02 || v('feed') < -0.05 || v('slip') > 0.02),
    msg: "Basculement au-delà de 20° bloqué : rentrer les stinger, monter la tête, fermer la plaque à coins." },
];
export const CLAMP_STROKE = CLAMP_IN;

// ---------------------------------------------------------------- circuit hydraulique

// Groupes de pompage (manuel : P334 groupe électrique, P246 moteur diesel), pompes,
// distributeurs Danfoss PVG 32 (P396, P400, P404, P148 ; débit nominal de chaque
// tiroir : 34,3 / 26,4 / 10,6 / 6,6 / 2,6 / 1,3 gal/min = 130 / 100 / 40 / 25 / 10 /
// 5 L/min) et actionneurs. L'affectation des sections aux fonctions n'est pas
// donnée par le manuel de pièces : elle est déduite des tiroirs (débit, type
// moteur ou vérin, commande proportionnelle ou tout-ou-rien) et des organes.
// src : origine de chaque valeur ; « estimé » quand le manuel ne la donne pas.
const ROT = 2 * Math.PI;
export const HYDRAULICS = {
  drivers: [
    { id: 'elec', label: 'Groupe de pompage électrique', kW: 44.7, rpm: 1780, src: 'P334 : moteur 60 HP, 575 V, 60 Hz (4 pôles, 1780 tr/min)' },
    { id: 'diesel', label: 'Moteur diesel Mercedes 904', kW: 130, rpm: 2000, src: 'Spécifications : 174 HP ; régime de travail estimé' },
  ],
  pumps: [
    { id: 'P1', label: 'Pompe 100 cm³ (forage)', driver: 'elec', cc: 100, pMax: 210, margin: 20, standby: 25, src: 'P334 : CP001047 ; pression maximale estimée (3000 psi)' },
    { id: 'P2', label: 'Pompe 74 cm³ (mise en place)', driver: 'elec', cc: 74, pMax: 210, margin: 20, standby: 25, src: 'P334 : CP001048 ; pression maximale estimée (3000 psi)' },
    { id: 'D1', label: 'Pompe 90 cm³ (translation)', driver: 'diesel', cc: 90, pMax: 414, margin: 0, standby: 20, src: 'P246 : CP000392 ; limiteurs 6000 psi' },
    { id: 'D2', label: 'Pompe 32 cm³ (direction)', driver: 'diesel', cc: 32, pMax: 175, margin: 10, standby: 15, src: 'P246 : CP000413 ; pression estimée' },
  ],
  // spool : débit nominal du tiroir (L/min) ; prop : commande proportionnelle (sinon tout-ou-rien)
  functions: [
    // distributeur de forage (pompe 100 cm³)
    { id: 'spin', label: 'Rotation de la tête', body: 'spin', pump: 'P1', spool: 130, prop: true, gravity: false,
      act: { type: 'mot', disp: 1.08e-3 / ROT }, src: '2 moteurs ME12 sur roue dentée (P050) ; cylindrée à la broche estimée (120 tr/min à 130 L/min)' },
    { id: 'slip', label: 'Plaque à coins', body: 'slip', pump: 'P1', spool: 10, prop: false, gravity: false,
      act: { type: 'cyl', n: 2, bore: 0.05, rod: 0.028, ram: 'slip' }, src: '2 vérins de plaque à coins (P032) ; alésage du modèle 3D' },
    // distributeur d'avance
    { id: 'feed', label: "Vérin d'avance", body: 'feed', pump: 'P1', spool: 100, prop: true,
      act: { type: 'cyl', ported: true, bore: 3.125 * IN, rod: 1.75 * IN, g: 1 }, src: 'P070 : vérin à tiges creuses, piston Ø 3 1/8 po ; tiges estimées' },
    // distributeur de mise en place (pompe 74 cm³)
    { id: 'tilt', label: 'Basculement du cadre', body: 'tilt', pump: 'P2', spool: 25, prop: true,
      act: { type: 'cyl', n: 2, bore: 0.1, rod: 0.055, ram: 'dumpR' }, src: '2 vérins de basculement CX000675 (P168) ; alésage du modèle 3D' },
    { id: 'shift', label: 'Translation latérale', body: 'shift', pump: 'P2', spool: 25, prop: true,
      act: { type: 'cyl', n: 2, bore: 3.25 * IN, rod: 1.75 * IN, ram: 'shift' }, src: 'P178 : 2 vérins Ø 3,25 po × 30 po ; tige estimée' },
    { id: 'roll', label: "Rotation de l'avance", body: 'roll', pump: 'P2', spool: 5, prop: true,
      act: { type: 'mot', disp: 5e-3 / ROT }, src: 'Actionneur rotatif à crémaillères (P174), tiroir 1,3 gal/min ; cylindrée estimée (5 L/tour)' },
    { id: 'ext', label: "Extension de l'avance", body: 'ext', pump: 'P2', spool: 25, prop: true,
      act: { type: 'cyl', n: 1, bore: 4 * IN, rod: 2 * IN, ram: 'mcp' }, src: 'P158 : vérin Ø 4,00 po ; tige estimée' },
    { id: 'stingUp', label: 'Stinger haut', body: 'stingUp', pump: 'P2', spool: 25, prop: true,
      act: { type: 'cyl', n: 2, bore: 3.5 * IN, rod: 2.25 * IN, g: 1 }, src: 'P064 : 2 vérins stinger Ø 3,5 po (joints 3,5 × 2,25 po)' },
    { id: 'stingDn', label: 'Stinger bas', body: 'stingDn', pump: 'P2', spool: 25, prop: true,
      act: { type: 'cyl', n: 2, bore: 3.5 * IN, rod: 2.25 * IN, g: 1 }, src: 'P064 : 2 vérins stinger Ø 3,5 po (joints 3,5 × 2,25 po)' },
    ...[['outL', 'Stabilisateur avant gauche'], ['outR', 'Stabilisateur avant droit'], ['jackL', 'Stabilisateur arrière gauche'], ['jackR', 'Stabilisateur arrière droit']]
      .map(([id, label]) => ({ id, label, body: id, pump: 'P2', spool: 25, prop: true, gravity: false, support: true,
        act: { type: 'cyl', n: 1, bore: 4 * IN, rod: 2.5 * IN, g: -1 }, src: 'P316, P324 (stabilisateurs avant) ; alésage estimé' })),
    // distributeur du carrousel (tout-ou-rien)
    { id: 'carousel', label: 'Indexage du carrousel', body: 'carousel', pump: 'P2', spool: 25, prop: false, gravity: false,
      act: { type: 'mot', disp: (25 * LPM) / (90 * DEG) }, src: 'Moteur Ross MG24 (P108) ; réduction estimée (90°/s)' },
    { id: 'clamp', label: 'Bras de serrage', body: 'clamp', pump: 'P2', spool: 25, prop: false, gravity: false,
      act: { type: 'cyl', n: 1, bore: 3 * IN, rod: 1.5 * IN, g: -(6.125 * IN) / Math.abs(CLAMP_IN) }, src: 'P122 : vérin Ø 3 po × 6 1/8 po ; levier d\'après la course' },
    // moteur diesel : translation hydrostatique et direction
    { id: 'drive', label: 'Translation', pump: 'D1', spool: 180, prop: true, gravity: false,
      act: { type: 'mot', disp: (180 * LPM) / 1.4 }, src: 'Pompe 90 cm³ (P246), moteur P310, boîte CP000397 ; 5 km/h estimé' },
    { id: 'front', label: 'Direction', body: 'front', pump: 'D2', spool: 60, prop: true, gravity: false,
      act: { type: 'cyl', crossed: true, bore: 3 * IN, rod: 1.5 * IN, ram: 'steerR' }, src: 'P306 : 2 vérins Ø 3 po × 15 po en opposition ; débit de l\'orbitrol estimé' },
  ],
  // Distributeurs (affichage) : sections dans l'ordre du manuel ; fn : fonction simulée.
  banks: [
    { label: 'Distributeur de forage', ref: 'P404', pump: 'P1', sections: [
      { fn: 'spin', spool: '34,3 MOT-LS' }, { fn: 'slip', spool: '2,6 CYL' },
      { label: 'Pompe à eau (P338)', spool: '10,6 MOT' }, { label: 'Centreur (P032)', spool: '6,6 MOT-LS' },
      { label: 'Section non identifiée', spool: '6,6 MOT' }, { label: 'Section non identifiée', spool: '6,6 MOT' }] },
    { label: "Distributeur d'avance", ref: 'P396', pump: 'P1', sections: [{ fn: 'feed', spool: '26,4 CYL-LS' }] },
    { label: 'Distributeur de mise en place', ref: 'P400', pump: 'P2', sections: [
      ...['tilt', 'shift'].map((fn) => ({ fn, spool: '6,6 MOT' })), { fn: 'roll', spool: '1,3 MOT' },
      ...['ext', 'stingUp', 'stingDn', 'outL', 'outR', 'jackL', 'jackR'].map((fn) => ({ fn, spool: '6,6 MOT' }))] },
    { label: 'Distributeur du carrousel', ref: 'P148', pump: 'P2', sections: [
      { fn: 'carousel', spool: '6,6 MOT-LS' }, { fn: 'clamp', spool: '6,6 MOT-LS' }, { label: 'Mâchoires des bras', spool: '2,6 CYL-LS' }] },
    { label: 'Translation et direction', ref: 'P246, P292', pump: 'D1', sections: [{ fn: 'drive', spool: 'hydrostatique' }, { fn: 'front', spool: 'orbitrol' }] },
  ],
  // Masses des corps (kg, estimées ; poids total de la machine : 50 809 lb, vue générale).
  masses: { tilt: 650, shift: 450, roll: 300, ext: 1100, feed: 120, spin: 230, carousel: 160, clamp: 70, stingUp: 30, stingDn: 30, slip: 25 },
};
export const MACHINE_MASS = 50809 * 0.4536;
// Part du poids de la machine reprise par chaque stabilisateur en appui (estimée),
// et levée en deçà de laquelle le stabilisateur porte la machine.
export const SUPPORT = { share: { outL: 0.275, outR: 0.275, jackL: 0.225, jackR: 0.225 }, contact: 0.03 };
export const ROLLING = 0.03; // résistance au roulement (fraction du poids)

// ---------------------------------------------------------------- contact au sol

/** Bas du taillant du marteau fond-de-trou rangé dans le centreur (repère de l'avance). */
export const HAMMER_STOW = -0.2;

// Points qui ne doivent pas passer sous le sol (repère machine au repos) : patins
// des stinger bas, bas du centreur, taillant du marteau rangé, pied du mât, bas du
// carrousel. Une commande qui en ferait descendre un sous le sol s'arrête au contact
// (pendant le forage, le marteau est dans le trou mais les commandes sont verrouillées).
export const GROUND = [
  ...FEED.stingers.map(([x, z]) => ({ body: 'stingDn', p: fm([x, FEED.stingerFoot, z]) })),
  { body: 'ext', p: fm([0, -0.11, FEED.AX]) },
  { body: 'ext', p: fm([0, HAMMER_STOW, FEED.AX]) },
  ...[[-0.25, -0.2], [0.25, -0.2], [-0.25, 0.25], [0.25, 0.25]].map(([x, z]) => ({ body: 'ext', p: fm([x, 0, z]) })),
  { body: 'ext', p: fm([C.x, C.y0 - 0.05, C.z]) },
];

/** Hauteur du point de contact le plus bas pour les valeurs courantes (sol à y = 0). */
export function groundClearance(rig) {
  rig.computeJ();
  let min = Infinity;
  for (const g of GROUND) {
    const e = rig.bodies.get(g.body).J.elements;
    min = Math.min(min, e[1] * g.p[0] + e[5] * g.p[1] + e[9] * g.p[2] + e[13]);
  }
  return min;
}

// ---------------------------------------------------------------- positions

// Étapes successives (chaque étape attend que les consignes soient atteintes).
export const PRESETS = {
  forage: { label: 'Position de forage', stages: [
    { tilt: 0, roll: 0, shift: 0 },
    { ext: 0, feed: 0, slip: 0, clamp: 0 },
    { outriggers: 0, jacks: 0 },
  ] },
  translation: { label: 'Position de translation', stages: [
    { stingers: 0, slip: 0, clamp: 0 },
    { feed: 0, ext: 0.3 },
    { roll: 0, shift: 0 },
    { tilt: 80 * DEG },
    { outriggers: 0.24, jacks: 0.18 },
  ] },
  calage: { label: 'Calage (stinger au toit et au sol)', stages: [
    { outriggers: 0, jacks: 0 },
    { tilt: 0 },
    { stingers: 0.35 },
  ] },
};

// ---------------------------------------------------------------- translation

/**
 * Translation du porteur articulé : la pose est celle de l'articulation au sol
 * (x, z, cap θ du châssis arrière). Le milieu de l'essieu arrière avance de ds
 * selon le cap ; le cap tourne de ds·sin γ / (Lf + Lr·cos γ) (articulation
 * centrale, roues sans glissement). Retourne ds pour faire tourner les roues.
 */
export function driveStep(pose, gamma, ds) {
  const Lr = -AXLE.rear, Lf = AXLE.front;
  const h = (t) => [Math.cos(t), -Math.sin(t)];
  let [hx, hz] = h(pose.heading);
  const rx = pose.x - Lr * hx + ds * hx, rz = pose.z - Lr * hz + ds * hz;
  pose.heading += (ds * Math.sin(gamma)) / (Lf + Lr * Math.cos(gamma));
  [hx, hz] = h(pose.heading);
  pose.x = rx + Lr * hx;
  pose.z = rz + Lr * hz;
  return ds;
}

export const WHEEL_R = WHEEL.r;
export const REEL_DRUM = 0.3; // rayon moyen d'enroulement du câble
export const RATIO = 0.131 / 0.28; // poulie moteur / volant du surpresseur

// Description mécanique du DU311 s/n 10703 pour la simulation (hors site) :
// corps mobiles et liaisons, commandes (débattements, vitesses), verrouillages,
// positions prédéfinies et translation du porteur articulé. Les axes viennent des
// constantes des modèles (layout.js, slide.js, feed.js, reardeck.js) : modifier un
// modèle déplace la liaison correspondante.
// Vitesses : ordres de grandeur d'une foreuse de cette taille, pas des valeurs
// du constructeur (le manuel de pièces n'en donne pas).
import { AXLE, WHEEL } from '../models/du311-std/layout.js';
import { SLIDE } from '../models/du311-std/slide.js';
import { FEED } from '../models/du311-std/feed.js';
import { feedToMachine as fm } from '../models/du311-std/machine.js';
import { REEL, DRIVE } from '../models/du311-std/reardeck.js';

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
  { name: 'feed', parent: 'ext', type: 'pri', axis: [0, 1, 0], min: -1.75, max: 0 },
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

// Une commande pilote un corps à vitesse limitée vers une consigne. scale / unit :
// affichage (degrés, mm…). Les commandes « continues » n'ont pas de butée.
export const CONTROLS = [
  { group: 'Porteur', items: [
    { id: 'front', label: 'Direction (articulation)', speed: 12 * DEG, scale: 1 / DEG, unit: '°', digits: 0 },
    { id: 'jacks', label: 'Stabilisateurs arrière (levée)', bodies: ['jackL', 'jackR'], speed: 0.06, scale: 1000, unit: 'mm', digits: 0 },
    { id: 'outriggers', label: 'Stabilisateurs avant (levée)', bodies: ['outL', 'outR'], speed: 0.06, scale: 1000, unit: 'mm', digits: 0 },
  ] },
  { group: 'Glissière', items: [
    { id: 'tilt', label: 'Basculement du cadre', speed: 6 * DEG, scale: 1 / DEG, unit: '°', digits: 0 },
    { id: 'shift', label: 'Translation latérale', speed: 0.08, scale: 1000, unit: 'mm', digits: 0 },
    { id: 'roll', label: "Rotation de l'avance", speed: 15 * DEG, scale: 1 / DEG, unit: '°', digits: 0 },
  ] },
  { group: 'Avance', items: [
    { id: 'ext', label: "Extension de l'avance (MCP)", speed: 0.1, scale: 1000, unit: 'mm', digits: 0 },
    { id: 'feed', label: 'Course de la tête de rotation', speed: 0.25, scale: 1000, unit: 'mm', digits: 0 },
    { id: 'stingers', label: 'Vérins stinger', bodies: ['stingUp', 'stingDn'], speed: 0.1, scale: 1000, unit: 'mm', digits: 0 },
    { id: 'slip', label: 'Plaque à coins (ouverture)', speed: 0.1, scale: 1000, unit: 'mm', digits: 0 },
  ] },
  { group: 'Carrousel', items: [
    { id: 'clamp', label: 'Bras de serrage (vers le carrousel)', speed: 40 * DEG, scale: -1 / DEG, unit: '°', digits: 0 },
  ] },
];

export const SPEEDS = {
  carousel: 90 * DEG, // indexage
  spinRpm: 120, // rotation maximale de la broche
  drive: 1.4, // m/s en translation (5 km/h)
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

// ---------------------------------------------------------------- contact au sol

// Points qui ne doivent pas passer sous le sol (repère machine au repos) : patins
// des stinger bas, bas du centreur, pied du mât, bas du carrousel. Une commande
// qui en ferait descendre un sous le sol s'arrête au contact.
export const GROUND = [
  ...FEED.stingers.map(([x, z]) => ({ body: 'stingDn', p: fm([x, FEED.stingerFoot, z]) })),
  { body: 'ext', p: fm([0, -0.11, FEED.AX]) },
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

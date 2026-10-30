// Encart « Variante : 6 × 6 de 8 pi » de la vidéo du plancher (étape 11).
//
// Variante courante sur le chantier, pas décrite dans la procédure : les madriers
// des deux sections faits de deux 6 × 6 de 8 pi bout à bout, parfaitement de niveau,
// le joint sur un blocage (section 1) ou sur un soutien (section 2) ; jonction des
// sections doublée (un 6 × 6 sous chaque section) ; bout de 6 × 6 de 24 po le long des
// madriers de rive, comme dans la vidéo.
//
// L'encart s'insère dans l'enregistrement principal à l'instant V8.v (silence ajouté
// de la durée de l'encart) : la scène y est figée, l'encart remplace la caméra, la
// visibilité de certaines pièces et les annotations, puis tout revient à l'état de la
// vidéo. Sa voix (8 répliques) est un fichier à part, V8.file.
import { B66, P3, W, SEC, joistZ, JOINT_X } from '../models/plancher-dd/plan.js';
import { JOINT8_X, JOINT8_X2 } from '../models/plancher-dd/floor.js';

// Répliques de l'encart : [début, fin] dans V8.file (s). Estimations tant que la voix
// n'est pas enregistrée (V8.estime) : les plans suivent ces instants.
const LINES = [
  [0.0, 2.6], // Pis si on a juste des six par six de huit pieds ?
  [3.3, 9.8], // C'est correct, c'est courant… dans les deux sections.
  [10.5, 13.9], // Le joint tombe toujours sur un blocage, jamais dans le vide.
  [14.6, 24.6], // Pis dans une section… à cheval sur le joint.
  [25.3, 31.8], // À la jonction, on double le six par six…
  [32.5, 37.0], // Dans la deuxième section, le joint tombe sur un soutien…
  [37.7, 43.5], // Le long des madriers de rive…
  [44.2, 48.4], // Le reste ne change pas…
];
const LEAD = 0.4; // première réplique 0,4 s après le début de l'encart
const TAIL = 1.4; // temps laissé après la dernière réplique (vue d'ensemble)
const r24 = (x) => Math.round(x * 24) / 24;

export const V8 = {
  v: 221.6, // instant de l'enregistrement principal (après « …parfaitement égales »)
  file: 'video/plancher/voix-8pi.mp3',
  estime: true,
  lines: LINES,
  lead: LEAD,
  dur: r24(LEAD + LINES.at(-1)[1] - LINES[0][0] + TAIL),
};
/** Instant (dans l'encart) où commence la réplique i. */
const L = (i) => LEAD + LINES[i][0] - LINES[0][0];
V8.at = LINES.map((_, i) => L(i));

// ------------------------------------------------------------------ caméra

const T20 = Math.tan((20 * Math.PI) / 180);
// Cadrage donné pour un champ de fov degrés, ramené au champ de la vidéo (40°).
const pose = (pos, tgt, fov = 40) => {
  const k = Math.tan((fov * Math.PI) / 360) / T20;
  return { pos: pos.map((p, i) => tgt[i] + (p - tgt[i]) * k), tgt };
};
const ZE = joistZ.at(-1);
export const V8_CAM = {
  jblock: pose([SEC + 0.6, 0.6, -1.4], [SEC, 0.07, -2.2]),
  large: pose([SEC + 2.4, 2.3, 3.3], [SEC - 0.2, -0.1, -0.2], 42),
  joint: pose([JOINT8_X + 0.55, 0.3, ZE + 0.72], [JOINT8_X - 0.02, -0.04, ZE - 0.05], 36),
  niveau: pose([JOINT8_X + 1.0, 0.8, ZE + 1.4], [JOINT8_X, 0.12, ZE]),
  jonction: pose([SEC + 1.3, 1.5, 1.9], [SEC, -0.12, 0.3]),
  sec2: pose([JOINT8_X2 + 0.75, 0.35, ZE + 0.95], [JOINT8_X2, -0.14, ZE - 0.1], 38),
  ensemble: pose([SEC + 0.3, 3.4, 4.6], [SEC + 0.3, -0.25, -0.6], 50),
};
const MOVE = 1.7; // durée d'un déplacement de caméra (s)
// Images clés : [instant, cadrage, coupe] ; coupe = changement de plan sans déplacement.
export const V8_KEYS = [
  [0, 'jblock'],
  [L(1) - 0.35, 'large', true],
  [L(2), 'large'], [L(2) + MOVE, 'joint'],
  [L(3), 'joint'], [L(3) + MOVE, 'niveau'],
  [L(4), 'niveau'], [L(4) + MOVE, 'jonction'],
  [L(5), 'jonction'], [L(5) + MOVE, 'sec2'],
  [L(6), 'sec2'], [L(6) + MOVE, 'jblock'],
  [L(7), 'jblock'], [L(7) + MOVE, 'ensemble'],
  [V8.dur - 0.35, 'jblock', true],
];

// ------------------------------------------------------------------ pièces

// Phases (instants dans l'encart) : planches et pièces de 16 pi retirées au changement
// de plan ; les 6 × 6 de 8 pi posés pendant la deuxième réplique ; niveau posé pendant
// la quatrième ; retour à la vidéo à la dernière coupe.
export const V8_PHASE = {
  cut: L(1) - 0.35, // planches et pièces de 16 pi enlevées (changement de plan)
  out: L(1) + 0.15, // les pièces de 16 pi se lèvent et disparaissent (0,6 s)
  drop: L(1) + 0.8, // pose des 6 × 6 de 8 pi, en ordre
  dropSpan: 3.6,
  level: L(3) + 1.9, // niveau de 48 po sur le joint
  levelOut: L(4) + 1.2,
  back: V8.dur - 0.35, // retour à la vidéo
};

// ------------------------------------------------------------------ annotations

// Notes : instants dans l'encart (u0, u1), point 3D, texte, côté préféré.
const ZN = -(W / 2 - B66 * 1.5); // bout de 6 × 6 de rive, côté Z négatif
export const V8_NOTES = [
  { u0: L(1) + 0.1, u1: L(1) + 2.6, at: [SEC * 0.35, B66, joistZ[3]], text: 'Planches enlevées pour voir la structure', dir: 'up' },
  { u0: L(1) + 3.0, u1: L(2) + 0.4, at: [JOINT8_X, B66, joistZ[5]], text: 'Deux 6 × 6 de 8 pi bout à bout', dir: 'up' },
  { u0: L(2) + MOVE - 0.3, u1: L(3) + 0.4, at: [JOINT8_X, -0.03, ZE], text: 'Joint sur un blocage, jamais dans le vide', dir: 'right' },
  { u0: L(3) + 2.4, u1: L(4) + 0.3, at: [JOINT8_X + 0.35, B66 + P3 + 0.07, ZE], text: 'Niveau de 48 po sur un 3 × 8 de 8 pi, à cheval sur le joint', dir: 'up' },
  { u0: L(3) + 4.0, u1: L(4) + 0.3, at: [JOINT8_X - 0.9, B66 * 0.5, ZE + B66 / 2], text: 'Les deux 6 × 6 de 8 pi parfaitement de niveau', dir: 'down' },
  { u0: L(4) + MOVE - 0.2, u1: L(5) + 0.3, at: [JOINT_X, -B66 / 2, joistZ[3] + 0.4], text: 'Jonction doublée : un 6 × 6 sous chaque section', dir: 'down' },
  { u0: L(5) + MOVE - 0.2, u1: L(6) + 0.3, at: [JOINT8_X2, -0.02, ZE], text: 'Section 2 : joint sur un soutien', dir: 'right' },
  { u0: L(6) + MOVE - 0.2, u1: L(7) + 0.3, at: [JOINT_X, B66 * 0.7, ZN], text: 'Bout de 6 × 6 de 24 po le long des madriers de rive', dir: 'up' },
  { u0: L(6) + MOVE + 0.6, u1: L(7) + 0.3, at: [JOINT_X, -B66 / 2, -1.6], text: '6 × 6 doublé', dir: 'down' },
  { u0: L(7) + MOVE - 0.1, u1: V8.dur - 0.6, at: [JOINT8_X, B66, ZE], text: 'Joints à 8 pi', dir: 'up' },
  { u0: L(7) + MOVE + 0.3, u1: V8.dur - 0.6, at: [JOINT_X, B66, ZE], text: 'Jonction doublée', dir: 'up' },
  { u0: L(7) + MOVE + 0.7, u1: V8.dur - 0.6, at: [JOINT8_X2, B66, ZE], text: 'Joints à 24 pi', dir: 'up' },
];

// ------------------------------------------------------------------ bandeau

export const V8_BAND = {
  label: 'Variante',
  title: '6 × 6 de 8 pi',
  text: 'Deux 6 × 6 de 8 pi bout à bout par ligne, parfaitement de niveau, le joint toujours sur un blocage ou un soutien. Jonction des deux sections doublée : un 6 × 6 sous chaque section.',
  detail: 'Variante courante sur le chantier · les deux sections en 8 pi, soutiens compris · même cadrage 16 × 16 pi, 32 po centre',
};


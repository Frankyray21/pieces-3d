// Cotes et repères de mesure du plancher (PRO-DD-ST-003), affichés à leurs
// étapes : sur le site (montage par étapes, userData.stepOnly) et dans la
// vidéo de formation (userData.dimSteps). Lignes de cote jaunes avec flèches
// et étiquettes toujours lisibles (dessinées par-dessus la scène, taille
// fixe à l'écran).
import * as THREE from 'three';
import {
  IN, FT, B66, P3, P8, W, L, SEC, DECK, joistZ, GAL, STAIR, SUPPORTS_S1, ground, deckHeight,
} from './plan.js';
import { stairPlan, secondaryPlan } from './floor.js';

const YELLOW = 0xf2c230;
const FONT = '"Barlow Condensed", "IBM Plex Sans", "Arial Narrow", Arial, sans-serif';
const labels = [];
// Taille des étiquettes (fraction de la hauteur de la vue) : réduite sur le site,
// pleine dans la vidéo (setLabelScale(1)).
let K = 0.55;

const lineMat = () => new THREE.MeshBasicMaterial({ color: YELLOW, depthTest: false, depthWrite: false, transparent: true, toneMapped: false });
const noPick = (o) => { o.traverse((c) => { c.raycast = () => {}; }); return o; };

/** Étiquette (sprite de taille fixe à l'écran) : texte jaune sur fond sombre. */
function label(text, { h = 0.042, color = '#f2c230', anchor = [0.5, 0.5], pointer = false } = {}) {
  if (typeof document === 'undefined') return new THREE.Group(); // contrôle des modèles (Node)
  const canvas = document.createElement('canvas');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, depthWrite: false, transparent: true, toneMapped: false, sizeAttenuation: false });
  const sp = new THREE.Sprite(mat);
  sp.center.set(...anchor);
  sp.renderOrder = 1001;
  const draw = () => {
    const fs = 60, padX = 26, padY = 12, ptr = pointer ? 18 : 0;
    const ctx = canvas.getContext('2d');
    ctx.font = `700 ${fs}px ${FONT}`;
    const w = Math.ceil(ctx.measureText(text).width) + 2 * padX;
    const hh = fs + 2 * padY;
    canvas.width = w;
    canvas.height = hh + ptr;
    ctx.font = `700 ${fs}px ${FONT}`;
    ctx.fillStyle = 'rgba(14,17,20,0.88)';
    ctx.beginPath();
    ctx.roundRect(1, 1, w - 2, hh - 2, 12);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();
    if (ptr) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 14, hh - 2);
      ctx.lineTo(w / 2 + 14, hh - 2);
      ctx.lineTo(w / 2, hh + ptr);
      ctx.fill();
    }
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, padX, hh / 2 + 3);
    tex.needsUpdate = true;
    sp.scale.set((K * h * canvas.width) / canvas.height, K * h, 1);
  };
  draw();
  labels.push(draw);
  return sp;
}

// Polices du site chargées après la construction : étiquettes redessinées.
if (typeof document !== 'undefined' && document.fonts) document.fonts.ready.then(() => labels.forEach((d) => d()));
export const redrawLabels = () => labels.forEach((d) => d());
export const setLabelScale = (k) => { K = k; redrawLabels(); };

/** Tige entre deux points (rayon r), dessinée par-dessus la scène. */
function rod(a, b, r = 0.011) {
  const d = new THREE.Vector3().subVectors(b, a);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 8), lineMat());
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  m.renderOrder = 1000;
  return m;
}

function arrow(tip, dir) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.11, 12), lineMat());
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  m.position.copy(tip).addScaledVector(dir.clone().normalize(), -0.055);
  m.renderOrder = 1000;
  return m;
}

/**
 * Cote entre a et b (mesurés sur la pièce), décalée de off : ligne de cote
 * fléchée, lignes d'attache vers les points mesurés, étiquette au milieu.
 */
function dim(a, b, text, off = [0, 0, 0], opts = {}) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), O = new THREE.Vector3(...off);
  const a2 = A.clone().add(O), b2 = B.clone().add(O);
  const g = new THREE.Group();
  const d = new THREE.Vector3().subVectors(b2, a2);
  g.add(rod(a2, b2), arrow(b2, d), arrow(a2, d.clone().negate()));
  if (O.lengthSq() > 1e-6) {
    const e = O.clone().normalize().multiplyScalar(0.06);
    g.add(rod(A, b2.clone().sub(B).add(A).add(e), 0.006), rod(B, b2.clone().add(e), 0.006));
  }
  const lb = label(text, opts);
  lb.position.copy(a2).addScaledVector(d, opts.at ?? 0.5);
  if (opts.lift) lb.position.add(new THREE.Vector3(...opts.lift));
  g.add(lb);
  return g;
}

/** Repère simple : étiquette avec pointe posée sur un point (annotations de la vidéo). */
export function tag(pos, text, opts = {}) {
  const lb = label(text, { anchor: [0.5, 0], pointer: true, ...opts });
  lb.position.set(...pos);
  return lb;
}

/** Grosse flèche au sol (sens du forage). */
function bigArrow(from, to, text) {
  const g = new THREE.Group();
  const A = new THREE.Vector3(...from), B = new THREE.Vector3(...to);
  const d = new THREE.Vector3().subVectors(B, A);
  g.add(rod(A, B, 0.03));
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 16), lineMat());
  head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  head.position.copy(B);
  head.renderOrder = 1000;
  g.add(head);
  const lb = label(text);
  lb.position.copy(A).addScaledVector(d, 0.45).add(new THREE.Vector3(0, 0.12, 0));
  g.add(lb);
  return g;
}

const po = (m) => `${Math.round(m / IN)} po`;

/** Cotes du plancher, chacune avec les étapes où elle s'affiche. */
export function dimensions() {
  const out = [];
  const at = (steps, obj) => {
    obj.userData.stepOnly = steps;
    obj.userData.dimSteps = steps;
    obj.visible = false;
    out.push(noPick(obj));
  };
  const zN = -W / 2, zP = W / 2;
  // Étape 1 : emprise du plancher.
  at([1], dim([0, 0.03, zP], [L, 0.03, zP], '32 pi', [0, 0, 0.45]));
  at([1], dim([0, 0.03, zN], [0, 0.03, zP], '16 pi', [-0.45, 0, 0]));
  // Étape 3 : sens du forage (les patins de la foreuse croisent les 6 × 6).
  at([3], bigArrow([SEC * 0.55, B66 + 0.05, 1.2], [SEC * 0.55, B66 + 0.05, -1.9], 'Sens du forage'));
  at([3], dim([-0.02, 0, zN], [-0.02, B66, zN], '6 po', [-0.3, 0, 0]));
  // Étape 4 : cadrage 16 × 16 pi, madriers à environ 32 po centre.
  at([4], dim([0, B66, zN], [0, B66, zP], '16 pi', [-0.45, 0, 0]));
  at([4], dim([0, B66, zP], [SEC, B66, zP], '16 pi', [0, 0, 0.45]));
  at([4, 11], dim([SEC * 0.5, B66 + 0.02, joistZ[2]], [SEC * 0.5, B66 + 0.02, joistZ[3]], '≈ 32 po c/c', [0, 0.12, 0]));
  // Étape 5 : niveau de 48 po sur un 3 × 8 de 8 pi, appuis.
  at([5], dim([2.3, B66 + P3 + 0.08, -0.4 - 24 * IN], [2.3, B66 + P3 + 0.08, -0.4 + 24 * IN], 'Niveau 48 po', [0, 0.16, 0]));
  at([5], dim([2.3, B66 + P3, -0.4 - 4 * FT], [2.3, B66 + P3, -0.4 + 4 * FT], '3 × 8 de 8 pi min.', [0.28, 0, 0]));
  at([5], dim([SUPPORTS_S1[1], 0, zP], [SUPPORTS_S1[2], 0, zP], '≈ 3 pi', [0, 0, 0.35]));
  at([5], tag([SUPPORTS_S1[3], B66 + 0.05, zP - B66 / 2], '6 appuis min. par madrier', { h: 0.04, color: '#ffffff' }));
  // Étape 6 : épaisseurs, 9 po en tout.
  at([6], dim([0, 0, zP], [0, B66, zP], '6 × 6', [-0.35, 0, 0.1], { h: 0.04 }));
  at([6], dim([0, B66, zP], [0, DECK, zP], '3 × 8', [-0.35, 0, 0.1], { h: 0.04, lift: [0, 0.07, 0] }));
  at([6], dim([0, 0, zP], [0, DECK, zP], 'Plancher 9 po', [-0.85, 0, 0.1]));
  at([6], dim([0, DECK, zN], [P8, DECK, zN], '8 po', [0, 0, -0.35], { h: 0.04 }));
  // Étape 7 : environ 50 % de la section couverte avant de resserrer.
  at([7], dim([0, DECK, zP], [11 * P8, DECK, zP], '≈ 50 % de la section', [0, 0, 0.4]));
  // Étape 8 : deux planches libres (16 po).
  at([8], dim([SEC - 2 * P8, B66, zP], [SEC, B66, zP], '2 planches = 16 po', [0, 0, 0.4]));
  // Étapes 9 et 10 : hauteur à soutenir au bout de la section 2, madrier guide à 16 pi.
  const gL = ground(L - 0.05, zP - 0.05);
  at([9, 10], dim([L - 0.05, gL, zP], [L - 0.05, 0, zP], `Hauteur à soutenir ≈ ${po(-gL)}`, [0.35, 0, 0.25]));
  at([10], dim([SEC, 0, zN], [L, 0, zN], '16 pi', [0, 0, -0.45]));
  // Étape 14 : marches.
  const { n, rise } = stairPlan();
  const z0 = STAIR.z0, z1 = STAIR.z0 + STAIR.w;
  const t1 = DECK - rise;
  at([14], dim([L, t1, z1], [L + STAIR.tread, t1, z1], 'Giron 16 po min.', [0, 0, 0.3]));
  at([14], dim([L + 0.02, t1, z0], [L + 0.02, DECK, z0], `Hauteur ${po(rise)} (12 po max.)`, [0, 0, -0.3]));
  at([14], dim([L + STAIR.tread * (n - 1), DECK - (n - 1) * rise, z0], [L + STAIR.tread * (n - 1), DECK - (n - 1) * rise, z1], 'Largeur 48 po (36 à 60 po)', [0.3, 0, 0], { h: 0.04 }));
  // Étape 15 : plus de 12 po de haut au bout, garde-corps (RSST art. 12).
  const zg = -1.5;
  at([14, 15], dim([L, ground(L, zg - 0.75), zg - 0.75], [L, DECK, zg - 0.75], `${po(deckHeight(L, zg - 0.75))} : plus de 12 po`, [0.45, 0, 0]));
  at([15], dim([L, DECK, zg], [L, DECK + 1.07, zg], '1 m à 1,2 m', [0.35, 0, 0]));
  // Étape 17 : écart plancher-mur et grillage.
  const xg = 6.0;
  at([17], dim([xg, DECK + 0.02, zN], [xg, DECK + 0.02, -GAL], 'Écart 12 po', [0, 0.25, 0]));
  at([17], dim([xg + 0.8, DECK - 0.3, -GAL + 0.06], [xg + 0.8, DECK - 0.3 + 24 * IN, -GAL + 0.06], 'Grillage 24 po', [0, 0, 0.25]));
  // Plancher secondaire : 32 × 72 po, 12 po de haut au plus.
  const sp = secondaryPlan();
  const top = DECK + B66 + P3;
  at([18], dim([sp.x0, top, sp.z1], [sp.x1, top, sp.z1], '32 po min.', [0, 0, 0.3]));
  at([18], dim([sp.x1, top, sp.z0], [sp.x1, top, sp.z1], '72 po min.', [0.3, 0, 0]));
  at([18], dim([sp.x0, DECK, sp.z0 - 0.02], [sp.x0, top, sp.z0 - 0.02], '9 po (12 po max.)', [0, 0, -0.3], { h: 0.04 }));
  return out;
}

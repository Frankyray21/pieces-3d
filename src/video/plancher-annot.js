// Calque d'annotations de la vidéo du plancher : cotes et notes dessinées en 2D
// par-dessus la 3D (Canvas 2D), à partir de points 3D projetés par la caméra.
//
// Chaque annotation apparaît au moment où la voix en parle (v : instant dans
// l'enregistrement), au plus 3 à la fois (la plus ancienne s'efface). Les
// étiquettes cherchent une place libre : pas de chevauchement entre elles, ni
// avec l'encadré « Pourquoi », l'étiquette PRO-DD-ST-003 ou le carton d'étape,
// toujours entières dans le cadre. Une annotation dont le point est hors champ
// s'efface au lieu d'être coupée.
import * as THREE from 'three';
import { IN, FT, B66, P3, P8, W, L, SEC, DECK, joistZ, GAL, STAIR, SUPPORTS_X, SLEEPERS_X, GUIDE_X, JOINT_X, DIP, DRILL, FACE_X, ground, deckHeight, plankX, TIGHT, stack } from '../models/plancher-dd/plan.js';
import { stairPlan, secondaryPlan } from '../models/plancher-dd/floor.js';
import { vt } from './plancher-script.js';
import { MAT } from './plancher-materiel.js';

const YEL = '#f2c230';
const INK = '#f4f6f7';
const BG = 'rgba(12,14,16,0.9)';
const DISPLAY = '"Barlow Condensed", "Arial Narrow", sans-serif';
const BODY = '"IBM Plex Sans", Arial, sans-serif';
const MAX_ON = 3;

// ------------------------------------------------------------------ annotations

const zN = -W / 2, zP = W / 2;
const po = (m) => `${Math.round(m / IN)} po`;
const { n: STN, rise } = stairPlan();
const sp = secondaryPlan();
const HIGH = (() => {
  let b = { y: -Infinity };
  for (let x = 0; x <= SEC; x += 0.05) for (let z = -W / 2; z <= W / 2; z += 0.05) { const y = ground(x, z); if (y > b.y) b = { x, z, y }; }
  return b;
})();
const gEnd = ground(L - 0.05, zP - 0.05);
const zg = -1.5;
const t1 = DECK - rise;
// Cage de l'étape 11 (sous le soutien, au croisement du creux), calculée comme dans le modèle.
const CRIB = (() => { const st = stack(DIP.x, DIP.z, -B66, 'x'); const lay = (k) => st.pieces.filter((p) => p.kind === 'crib')[k]; return { x: DIP.x, z: DIP.z, g: st.ground, top: -B66, y1: lay(0).pos[1], y2: lay(2).pos[1], h2: lay(2).size[1] }; })();
const ANCHOR_X = plankX(TIGHT + 1) + TIGHT * 0.015 + 0.05; // dernier 3 × 8 posé plus loin (étape 7)
const zJ = joistZ[joistZ.length - 1]; // madrier de la rive Z positive

// dim : cote entre a et b décalée de off (m) ; note : texte relié au point at ;
// arrow : flèche épaisse de a vers b. dir : côté préféré de l'étiquette d'une note.
// until : instant (voix) où l'annotation s'efface avant la fin de la partie.
export const ANNOTATIONS = {
  materiel: [
    { v: 19.7, type: 'note', at: [L + 4.3, 2.0, -0.4], text: 'Barricade « travaux en cours » et flasher orange', dir: 'down', until: 22.4 },
    { v: 22.9, type: 'note', at: [L + 3.0, 0.95, 2.25], text: 'Armoire : premiers soins et 2 lave-yeux', dir: 'left', until: 27.0 },
    { v: 26.1, type: 'note', at: [L + 3.65, 0.5, 2.35], text: 'Extincteur', dir: 'right', until: 27.0 },
    { v: 28.3, type: 'note', at: MAT.b66.at, text: MAT.b66.text, dir: 'up', until: 33.6 },
    { v: 29.9, type: 'note', at: MAT.b38.at, text: MAT.b38.text, dir: 'up', until: 33.6 },
    { v: 30.9, type: 'note', at: MAT.s24.at, text: MAT.s24.text, dir: 'up', until: 33.6 },
    { v: 31.5, type: 'note', at: MAT.coins.at, text: MAT.coins.text, dir: 'down', until: 36.4 },
    { v: 32.6, type: 'note', at: MAT.tirefonds.at, text: MAT.tirefonds.text, dir: 'down', until: 36.4 },
    { v: 39.6, type: 'note', at: MAT.laser.at, text: MAT.laser.text, dir: 'up', until: 42.6 },
    { v: 40.2, type: 'note', at: MAT.biche.at, text: MAT.biche.text, dir: 'down', until: 43.2 },
    { v: 40.8, type: 'note', at: MAT.niveau.at, text: MAT.niveau.text, dir: 'down', until: 43.8 },
    { v: 42.8, type: 'note', at: MAT.masse.at, text: MAT.masse.text, dir: 'right', until: 45.6 },
    { v: 43.4, type: 'note', at: MAT.marteau.at, text: MAT.marteau.text, dir: 'right', until: 46.2 },
    { v: 44.8, type: 'note', at: MAT.pingouin.at, text: MAT.pingouin.text, dir: 'down', until: 47.6 },
    { v: 46.4, type: 'note', at: MAT.sciotte.at, text: MAT.sciotte.text, dir: 'up', until: 49.0 },
    { v: 46.9, type: 'note', at: MAT.pinces.at, text: MAT.pinces.text, dir: 'up', until: 49.5 },
    { v: 47.4, type: 'note', at: MAT.scie.at, text: MAT.scie.text, dir: 'down', until: 50.0 },
    { v: 49.1, type: 'note', at: MAT.barres.at, text: MAT.barres.text, dir: 'up' },
    { v: 49.6, type: 'note', at: MAT.epi.at, text: MAT.epi.text, dir: 'down' },
  ],
  inspection: [
    { v: 41.0, type: 'note', at: [2.6, 0.02, 0.6], text: 'Sol sans débris et plat', dir: 'down' },
    { v: 44.8, type: 'note', at: [FACE_X + 0.02, DRILL.frontY + 0.25, DRILL.z], text: 'Fonds de trous trouvés et marqués au front', dir: 'right' },
  ],
  e1: [
    { v: 50.2, type: 'note', at: [0, 0.02, -1.0], text: 'Ligne de référence en peinture', dir: 'up' },
    { v: 55.0, type: 'dim', a: [0, 0.02, zP], b: [L, 0.02, zP], off: [0, 0, 0.45], text: '32 pi', sub: 'longueur' },
    { v: 57.4, type: 'dim', a: [0, 0.02, zN], b: [0, 0.02, zP], off: [-0.45, 0, 0], text: '16 pi', sub: 'largeur' },
  ],
  e2: [
    { v: 60.8, type: 'note', at: [-0.35, 0.15, -W / 2 + 0.6], text: 'Niveau au laser Bosch', dir: 'up' },
    { v: 62.6, type: 'note', at: [HIGH.x, HIGH.y + 0.05, HIGH.z], text: 'Point le plus haut du sol', dir: 'up' },
    { v: 65.2, type: 'note', at: [0.08, ground(0.08, 0.6) + 0.02, 0.6], text: 'Le 1er madrier repose ici, sur le sol', dir: 'down' },
  ],
  e3: [
    { v: 72.6, type: 'arrow', a: [2.6, B66 + 0.05, 0.9], b: [-0.6, B66 + 0.05, 0.9], text: 'Sens du forage : vers le front' },
    { v: 74.0, type: 'dim', a: [0, 0, zN], b: [0, B66, zN], off: [-0.3, 0, -0.1], text: '6 po', sub: 'madrier 6 × 6' },
    { v: 76.8, type: 'note', at: [1.6, B66, joistZ[0]], text: '1er madrier le long de la galerie, sur la ligne', dir: 'up' },
  ],
  e4: [
    { v: 89.0, type: 'dim', a: [0, B66, zN], b: [0, B66, zP], off: [-0.45, 0, 0], text: '16 pi', sub: '1er madrier → dernier' },
    { v: 91.6, type: 'dim', a: [0, B66, zP], b: [SEC, B66, zP], off: [0, 0, 0.45], text: '16 pi', sub: 'cadrage 16 × 16' },
    { v: 94.6, type: 'dim', a: [2.0, B66 + 0.02, joistZ[2]], b: [2.0, B66 + 0.02, joistZ[3]], off: [0, 0.1, 0], text: '32 po', sub: 'centre à centre' },
  ],
  e5: [
    { v: 100.4, type: 'dim', a: [2.3, B66 + P3 + 0.08, -0.4 - 24 * IN], b: [2.3, B66 + P3 + 0.08, -0.4 + 24 * IN], off: [0, 0.14, 0], text: '48 po', sub: 'niveau', until: 105.0 },
    { v: 102.8, type: 'dim', a: [2.3, B66 + P3, -0.4 - 4 * FT], b: [2.3, B66 + P3, -0.4 + 4 * FT], off: [0.3, 0, 0], text: '8 pi min.', sub: '3 × 8 de portée', until: 106.0 },
    { v: 106.4, type: 'note', at: [SUPPORTS_X[2], 0.02, joistZ[4]], text: 'Blocages et coins dans le sens contraire', dir: 'down' },
    { v: 111.0, type: 'note', at: [2.8, B66, joistZ[5]], text: 'Au moins 6 appuis par madrier', dir: 'up' },
  ],
  e5b: [
    { v: 114.6, type: 'note', at: [JOINT_X, -0.05, joistZ[4]], text: '6 × 6 de jonction, d’un seul bout : porte les 2 sections', dir: 'up' },
  ],
  e6: [
    { v: 124.6, type: 'dim', a: [0, 0, zN], b: [0, DECK, zN], off: [-0.35, 0, -0.1], text: '9 po', sub: '6 × 6 + 3 × 8' },
    { v: 128.8, type: 'note', at: [plankX(0), DECK, joistZ[0]], text: '1re planche : tire-fonds aux 2 bouts', dir: 'left' },
    { v: 133.6, type: 'note', at: [plankX(4), DECK, 0.6], text: 'Avancer sur la surface déjà couverte', dir: 'up' },
  ],
  e7: [
    { v: 143.6, type: 'dim', a: [0, DECK, zP], b: [plankX(TIGHT) + P8 / 2, DECK, zP], off: [0, 0, 0.3], text: '≈ 50 %', sub: 'de la section', until: 146.6 },
    { v: 145.8, type: 'note', at: [ANCHOR_X, DECK, zJ], text: 'Dernier 3 × 8 vissé (temporaire)', dir: 'right', until: 152.8 },
    { v: 147.6, type: 'note', at: [plankX(TIGHT) + P8 / 2 + 0.05, DECK + 0.06, 1.65], text: 'Coins enfoncés entre les planches', dir: 'up', until: 151.6 },
    { v: 149.0, type: 'arrow', a: [plankX(10), DECK + 0.1, zP + 0.12], b: [plankX(1), DECK + 0.1, zP + 0.12], text: 'Tension : les écarts se ferment', until: 153.0 },
    { v: 151.2, type: 'note', at: [plankX(TIGHT), DECK, zJ], text: 'Planche devant les coins vissée', dir: 'right' },
    { v: 153.4, type: 'note', at: [ANCHOR_X, DECK + 0.05, joistZ[0]], text: 'Tire-fonds du dernier 3 × 8 retirés', dir: 'up' },
  ],
  e8: [
    { v: 159.8, type: 'dim', a: [SEC - 2 * P8, B66, zP - 0.4], b: [SEC, B66, zP - 0.4], off: [0, 0, 0.5], text: '16 po', sub: '2 planches libres' },
    { v: 163.0, type: 'note', at: [SEC - P8, B66, -0.6], text: 'Jonction : la section 2 part d’ici', dir: 'up' },
  ],
  e9: [
    { v: 171.6, type: 'dim', a: [L - 0.05, gEnd, zP], b: [L - 0.05, 0, zP], off: [0.35, 0, 0.25], text: `≈ ${po(-gEnd)}`, sub: 'hauteur à soutenir' },
    { v: 175.4, type: 'note', at: [SEC * 1.5, ground(SEC * 1.5, 0) + 0.02, 0], text: 'Le sol descend : il faut monter', dir: 'up' },
  ],
  e10: [
    { v: 181.4, type: 'dim', a: [SEC, 0, zN], b: [L, 0, zN], off: [0, 0, -0.45], text: '16 pi', sub: 'madrier guide' },
    { v: 186.6, type: 'note', at: [SLEEPERS_X[1], -B66 / 2, joistZ[1]], text: 'Soutiens 6 × 6 de 16 pi, sens contraire', dir: 'down' },
  ],
  e11: [
    { v: 195.0, type: 'dim', a: [SEC * 1.5, B66 + 0.02, joistZ[2]], b: [SEC * 1.5, B66 + 0.02, joistZ[3]], off: [0, 0.1, 0], text: '32 po', sub: 'centre à centre' },
    { v: 197.4, type: 'note', at: [JOINT_X + 0.15, B66, joistZ[2]], text: 'Dans le prolongement de la section 1', dir: 'up', until: 202.0 },
    { v: 199.4, type: 'note', at: [SLEEPERS_X[2], -B66, joistZ[2]], text: 'Soutiens vis-à-vis les croisements', dir: 'up' },
    // Cage, montée couche par couche.
    { v: 204.8, type: 'note', at: [CRIB.x - 0.305, CRIB.y1, CRIB.z - 0.3], text: 'Couche 1 : deux 6 × 6 parallèles', dir: 'down', until: 209.6 },
    { v: 207.4, type: 'note', at: [CRIB.x, CRIB.y2, CRIB.z + 0.38], text: 'Couche 2 : croisée', dir: 'right', until: 212.4 },
    { v: 211.0, type: 'dim', a: [CRIB.x - 0.381, CRIB.y2 + CRIB.h2 / 2, CRIB.z + 0.385], b: [CRIB.x + 0.381, CRIB.y2 + CRIB.h2 / 2, CRIB.z + 0.385], off: [0, 0.3, 0.15], text: '30 po', sub: 'pièces de 24 à 36 po' },
    { v: 213.8, type: 'note', at: [CRIB.x, CRIB.top - 0.05, CRIB.z], text: 'Coin de bois : ajuste le niveau', dir: 'up' },
    { v: 215.4, type: 'dim', a: [CRIB.x + 0.42, CRIB.g, CRIB.z + 0.4], b: [CRIB.x + 0.42, CRIB.top, CRIB.z + 0.4], off: [0.15, 0, 0.12], text: po(CRIB.top - CRIB.g), sub: 'trop haut pour un blocage : cage' },
  ],
  e12: [
    { v: 213.4, type: 'note', at: [SEC * 1.5, DECK, 0.6], text: 'Étapes 6 et 7 répétées', dir: 'up' },
    { v: 217.4, type: 'note', at: [SEC - P8, DECK, joistZ[1]], text: 'Planches de jonction vissées', dir: 'up' },
  ],
  e13: [
    { v: 223.8, type: 'note', at: [6.4, DECK, zP], text: 'Bouts coupés carrés, au ras du plancher', dir: 'up' },
  ],
  e14: [
    { v: 233.8, type: 'dim', a: [L, ground(L, zg - 0.75), zg - 0.75], b: [L, DECK, zg - 0.75], off: [0.45, 0, 0], text: po(deckHeight(L, zg - 0.75)), sub: 'plus de 12 po : marches' },
    { v: 238.0, type: 'dim', a: [L, t1, STAIR.z0 + STAIR.w], b: [L + STAIR.tread, t1, STAIR.z0 + STAIR.w], off: [0, 0, 0.3], text: '16 po', sub: 'profondeur min.' },
    { v: 240.2, type: 'dim', a: [L + STAIR.tread * (STN - 1), DECK - (STN - 1) * rise, STAIR.z0], b: [L + STAIR.tread * (STN - 1), DECK - (STN - 1) * rise, STAIR.z0 + STAIR.w], off: [0.3, 0, 0], text: '48 po', sub: 'largeur 36 à 60 po' },
    { v: 242.8, type: 'dim', a: [L + 0.02, t1, STAIR.z0], b: [L + 0.02, DECK, STAIR.z0], off: [0, 0, -0.3], text: po(rise), sub: 'hauteur 12 po max.' },
  ],
  e15: [
    { v: 248.4, type: 'dim', a: [L, ground(L, zg - 0.75), zg - 0.75], b: [L, DECK, zg - 0.75], off: [0.45, 0, 0], text: po(deckHeight(L, zg - 0.75)), sub: 'plus de 12 po + vide' },
    { v: 253.4, type: 'dim', a: [L, DECK, zg], b: [L, DECK + 1.07, zg], off: [0.35, 0, 0], text: '1 à 1,2 m', sub: 'lisse supérieure' },
    { v: 256.4, type: 'note', at: [L + 0.05, DECK + 0.535, -0.6], text: 'Lisse intermédiaire à mi-hauteur', dir: 'right' },
    { v: 258.4, type: 'note', at: [L + 0.03, DECK + 0.06, -2.0], text: 'Plinthe : 90 mm min.', dir: 'right' },
  ],
  e16: [
    { v: 262.0, type: 'note', at: [L + 0.5, DECK + 0.9, STAIR.z0 - 0.05], text: 'Main courante de chaque côté', dir: 'up' },
  ],
  e17: [
    { v: 267.2, type: 'dim', a: [6.0, DECK + 0.02, zN], b: [6.0, DECK + 0.02, -GAL], off: [0, 0.2, 0], text: '12 po', sub: 'écart plancher-mur' },
    { v: 270.4, type: 'dim', a: [6.8, DECK - 0.3, -GAL + 0.06], b: [6.8, DECK - 0.3 + 24 * IN, -GAL + 0.06], off: [0, 0, 0.25], text: '24 po', sub: 'grillage' },
  ],
  sec: [
    { v: 279.6, type: 'dim', a: [sp.x1, DECK + B66 + P3, sp.z0], b: [sp.x1, DECK + B66 + P3, sp.z1], off: [0.3, 0, 0], text: '32 po', sub: 'largeur min.' },
    { v: 281.0, type: 'dim', a: [sp.x0, DECK + B66 + P3, sp.z1], b: [sp.x1, DECK + B66 + P3, sp.z1], off: [0, 0, 0.3], text: '72 po', sub: 'longueur min.' },
    { v: 283.0, type: 'dim', a: [sp.x1 + 0.02, DECK, sp.z1], b: [sp.x1 + 0.02, DECK + B66 + P3, sp.z1], off: [0.25, 0, 0.2], text: '9 po', sub: '12 po max.' },
    { v: 284.8, type: 'note', at: [(sp.x0 + sp.x1) / 2, DECK + B66 + P3, sp.z1], text: 'Aucun morceau en porte-à-faux', dir: 'down' },
    { v: 287.2, type: 'note', at: [sp.x0 + B66 / 2, DECK + B66 + P3, sp.z0 + P8 / 2], text: '2 planches vissées près de la foreuse', dir: 'up' },
  ],
};

// ------------------------------------------------------------------ dessin

const V3 = (a) => new THREE.Vector3(...a);
const ease = (x) => 1 - (1 - x) ** 3;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const SAFE = { x0: 18, y0: 14, x1: 1262, y1: 526 };

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function overlap(a, b) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

function outside(r) {
  const ox = Math.max(0, SAFE.x0 - r.x) + Math.max(0, r.x + r.w - SAFE.x1);
  const oy = Math.max(0, SAFE.y0 - r.y) + Math.max(0, r.y + r.h - SAFE.y1);
  return ox * r.h + oy * r.w;
}

/** Coupe une note en lignes de largeur max. */
function wrap(ctx, text, max) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > max && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  lines.push(cur);
  return lines;
}

export class Annotator {
  constructor(canvas, camera, segs, size) {
    // Canevas logiciel : avec l'accélération, un canevas vidé pouvait renvoyer
    // (toDataURL) une ancienne image, d'où des étiquettes qui restaient et clignotaient.
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    this.canvas = canvas;
    this.camera = camera;
    this.W = size[0];
    this.H = size[1];
    this.items = [];
    for (const s of segs) {
      const list = (ANNOTATIONS[s.id] || []).map((a) => ({ ...a, seg: s, t0: vt(s, a.v) }));
      list.sort((a, b) => a.t0 - b.t0);
      const end = s.start + s.dur - 0.5; // effacée avant la partie suivante
      list.forEach((a, i) => {
        a.t1 = Math.min(end, a.until != null ? vt(s, a.until) : Infinity, list[i + MAX_ON] ? list[i + MAX_ON].t0 : Infinity);
        this.items.push(a);
      });
    }
    this.state = new Map();
    this.lastT = -1;
  }

  project(p) {
    const v = V3(p).project(this.camera);
    return { x: (v.x + 1) / 2 * this.W, y: (1 - v.y) / 2 * this.H, ok: v.z < 1 && v.z > -1 };
  }

  /** Dessine les annotations à l'instant t ; avoid : rectangles interdits (écran). */
  draw(t, avoid = []) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    const jump = Math.abs(t - this.lastT) > 0.2;
    this.lastT = t;
    const active = this.items.filter((a) => t >= a.t0 && t <= a.t1 + 0.4);
    const placed = avoid.map((r) => ({ ...r }));
    // Géométrie projetée et visibilité.
    const draws = [];
    for (const a of active) {
      const st = this.state.get(a) || { vis: 0, pos: null, cand: -1 };
      this.state.set(a, st);
      const life = Math.min(clamp01((t - a.t0) / 0.35), clamp01((a.t1 + 0.4 - t) / 0.4));
      let g;
      if (a.type === 'note') {
        const p = this.project(a.at);
        g = { p, ok: p.ok && p.x > SAFE.x0 && p.x < SAFE.x1 && p.y > SAFE.y0 && p.y < SAFE.y1 };
      } else {
        const off = V3(a.off || [0, 0, 0]);
        const A = this.project(a.a), B = this.project(a.b);
        const P = this.project(V3(a.a).add(off).toArray()), Q = this.project(V3(a.b).add(off).toArray());
        const len = Math.hypot(Q.x - P.x, Q.y - P.y);
        const mid = { x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 };
        const inside = (q) => q.x > SAFE.x0 - 8 && q.x < SAFE.x1 + 8 && q.y > SAFE.y0 - 8 && q.y < SAFE.y1 + 8;
        g = { A, B, P, Q, len, mid, ok: A.ok && B.ok && P.ok && Q.ok && len > 34 && inside(P) && inside(Q) };
      }
      // Visibilité lissée (hors champ : s'efface).
      const target = g.ok ? 1 : 0;
      st.vis = jump ? target : st.vis + (target - st.vis) * 0.3;
      const alpha = life * st.vis;
      if (alpha < 0.02) { if (!g.ok) st.pos = null; continue; }
      draws.push({ a, g, st, alpha, grow: ease(clamp01((t - a.t0) / 0.6)) });
    }
    // Les lignes de cote et de rappel sont aussi des obstacles (sauf pour leur propre étiquette).
    for (const d of draws) {
      if (d.a.type === 'note') { placed.push({ x: d.g.p.x - 12, y: d.g.p.y - 12, w: 24, h: 24, owner: d.a }); continue; }
      const { P, Q } = d.g;
      const n = Math.max(2, Math.ceil(Math.hypot(Q.x - P.x, Q.y - P.y) / 18));
      for (let i = 0; i <= n; i++) placed.push({ x: P.x + (Q.x - P.x) * i / n - 5, y: P.y + (Q.y - P.y) * i / n - 5, w: 10, h: 10, owner: d.a });
    }
    // Place les étiquettes (ordre d'apparition), puis dessine.
    for (const d of draws) this.layout(d, placed, jump);
    for (const d of draws) this.render(d);
  }

  labelBox(d) {
    const ctx = this.ctx;
    const { a } = d;
    if (a.type === 'note') {
      ctx.font = `600 19px ${BODY}`;
      const lines = wrap(ctx, a.text, 300);
      const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 30;
      return { w, h: lines.length * 24 + 14, lines };
    }
    ctx.font = `700 30px ${DISPLAY}`;
    const w1 = ctx.measureText(a.text).width;
    ctx.font = `600 14px ${BODY}`;
    const w2 = a.sub ? ctx.measureText(a.sub).width : 0;
    return { w: Math.max(w1, w2) + 26, h: a.sub ? 58 : 40 };
  }

  layout(d, placed, jump) {
    const { a, g, st } = d;
    const box = this.labelBox(d);
    d.box = box;
    const cands = [];
    if (a.type === 'note') {
      const order = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      const pref = order[a.dir || 'up'];
      const dirs = [pref, [pref[0] || 0.7, pref[1] || -0.7], [pref[0] || -0.7, pref[1] || -0.7], [0, -1], [1, -0.4], [-1, -0.4], [0, 1], [1, 0.5], [-1, 0.5]];
      for (const dist of [64, 104, 150]) {
        for (const [dx, dy] of dirs) {
          const n = Math.hypot(dx, dy);
          const cx = g.p.x + (dx / n) * (dist + Math.abs(dx / n) * box.w / 2);
          const cy = g.p.y + (dy / n) * (dist * 0.8 + Math.abs(dy / n) * box.h / 2);
          cands.push({ x: cx - box.w / 2, y: cy - box.h / 2 });
        }
      }
    } else {
      const nx = -(g.Q.y - g.P.y) / g.len, ny = (g.Q.x - g.P.x) / g.len;
      // Flèche : étiquette près de la queue, la pointe reste visible.
      for (const s of a.type === 'arrow' ? [0.06, 0.18, 0.3] : [0.5, 0.36, 0.64, 0.24, 0.76]) {
        const cx = g.P.x + (g.Q.x - g.P.x) * s, cy = g.P.y + (g.Q.y - g.P.y) * s;
        cands.push({ x: cx - box.w / 2, y: cy - box.h / 2 });
      }
      for (const k of [1, -1]) for (const dist of [box.h / 2 + 16, box.h / 2 + 52]) {
        cands.push({ x: g.mid.x + nx * k * dist * 1.4 - box.w / 2, y: g.mid.y + ny * k * dist - box.h / 2 });
      }
    }
    // Score d'une place : chevauchements et débordement du cadre.
    const score = (c) => {
      let s = outside({ x: c.x, y: c.y, w: box.w, h: box.h }) * 50;
      const r = { x: Math.min(SAFE.x1 - box.w, Math.max(SAFE.x0, c.x)), y: Math.min(SAFE.y1 - box.h, Math.max(SAFE.y0, c.y)), w: box.w, h: box.h };
      for (const p of placed) if (p.owner !== a) s += overlap(r, p) * 4;
      return s;
    };
    // Place précédente gardée tant qu'elle est libre (pas de sauts d'une image à l'autre).
    let best = -1;
    if (st.cand >= 0 && st.cand < cands.length && score(cands[st.cand]) < 200) best = st.cand;
    if (best < 0) {
      let bestScore = Infinity;
      cands.forEach((c, i) => {
        const s = score(c) + i * 60;
        if (s < bestScore) { bestScore = s; best = i; }
      });
    }
    st.cand = best;
    // Toujours entière dans le cadre.
    const x = Math.min(SAFE.x1 - box.w, Math.max(SAFE.x0, cands[best].x));
    const y = Math.min(SAFE.y1 - box.h, Math.max(SAFE.y0, cands[best].y));
    if (!st.pos || jump) st.pos = { x, y };
    else { st.pos.x += (x - st.pos.x) * 0.3; st.pos.y += (y - st.pos.y) * 0.3; }
    // Les suivantes évitent la place visée (et la place affichée, encore en mouvement).
    placed.push({ x: x - 8, y: y - 8, w: box.w + 16, h: box.h + 16 });
    if (Math.abs(st.pos.x - x) + Math.abs(st.pos.y - y) > 4) placed.push({ x: st.pos.x - 8, y: st.pos.y - 8, w: box.w + 16, h: box.h + 16 });
  }

  render(d) {
    const ctx = this.ctx;
    const { a, g, st, box } = d;
    const { x, y } = st.pos;
    ctx.save();
    ctx.globalAlpha = d.alpha;
    if (a.type === 'note') {
      // Ligne de rappel vers le point, pastille au point.
      const cx = Math.min(Math.max(g.p.x, x), x + box.w), cy = Math.min(Math.max(g.p.y, y), y + box.h);
      this.line(g.p, { x: cx, y: cy }, INK, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath(); ctx.arc(g.p.x, g.p.y, 7.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.arc(g.p.x, g.p.y, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = BG;
      rrect(ctx, x, y, box.w, box.h, 6); ctx.fill();
      ctx.fillStyle = YEL;
      rrect(ctx, x, y, 5, box.h, [6, 0, 0, 6]); ctx.fill();
      ctx.fillStyle = INK;
      ctx.font = `600 19px ${BODY}`;
      ctx.textBaseline = 'top';
      box.lines.forEach((l, i) => ctx.fillText(l, x + 17, y + 8 + i * 24));
    } else if (a.type === 'arrow') {
      const P = g.A, Q = g.B;
      const k = d.grow;
      const E = { x: P.x + (Q.x - P.x) * k, y: P.y + (Q.y - P.y) * k };
      this.line(P, E, YEL, 7);
      if (k > 0.3) this.head(P, E, YEL, 26, 18);
      this.pill(x, y, box, a);
    } else {
      // Cote : lignes d'attache, ligne de cote qui se trace du centre vers les bouts, flèches.
      const k = d.grow;
      const m = g.mid;
      const P = { x: m.x + (g.P.x - m.x) * k, y: m.y + (g.P.y - m.y) * k };
      const Q = { x: m.x + (g.Q.x - m.x) * k, y: m.y + (g.Q.y - m.y) * k };
      ctx.globalAlpha = d.alpha * 0.8;
      if (Math.hypot(g.P.x - g.A.x, g.P.y - g.A.y) > 4) {
        this.ext(g.A, g.P);
        this.ext(g.B, g.Q);
      }
      ctx.globalAlpha = d.alpha;
      this.line(P, Q, YEL, 3);
      if (k > 0.85) { this.head(Q, P, YEL, 15, 11); this.head(P, Q, YEL, 15, 11); }
      ctx.globalAlpha = d.alpha * clamp01((k - 0.5) / 0.5);
      this.pill(x, y, box, a);
    }
    ctx.restore();
  }

  pill(x, y, box, a) {
    const ctx = this.ctx;
    ctx.fillStyle = BG;
    rrect(ctx, x, y, box.w, box.h, 7); ctx.fill();
    ctx.strokeStyle = YEL;
    ctx.lineWidth = 2;
    rrect(ctx, x + 1, y + 1, box.w - 2, box.h - 2, 6); ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = YEL;
    ctx.font = `700 30px ${DISPLAY}`;
    ctx.fillText(a.text, x + box.w / 2, y + 5);
    if (a.sub) {
      ctx.fillStyle = INK;
      ctx.font = `600 14px ${BODY}`;
      ctx.fillText(a.sub, x + box.w / 2, y + 38);
    }
    ctx.textAlign = 'left';
  }

  line(p, q, color, w) {
    const ctx = this.ctx;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = w + 4;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
  }

  ext(p, q) {
    // Ligne d'attache, prolongée un peu au-delà de la ligne de cote.
    const ctx = this.ctx;
    const dx = q.x - p.x, dy = q.y - p.y, n = Math.hypot(dx, dy) || 1;
    const e = { x: q.x + (dx / n) * 8, y: q.y + (dy / n) * 8 };
    ctx.setLineDash([5, 4]);
    this.line(p, e, YEL, 1.5);
    ctx.setLineDash([]);
  }

  head(from, tip, color, len, wid) {
    const ctx = this.ctx;
    const dx = tip.x - from.x, dy = tip.y - from.y, n = Math.hypot(dx, dy) || 1;
    const ux = dx / n, uy = dy / n;
    const bx = tip.x - ux * len, by = tip.y - uy * len;
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(bx - uy * wid / 2, by + ux * wid / 2);
    ctx.lineTo(bx + uy * wid / 2, by - ux * wid / 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.stroke();
    ctx.fillStyle = color;
    ctx.fill();
  }
}

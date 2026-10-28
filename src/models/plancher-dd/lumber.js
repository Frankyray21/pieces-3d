// Pièces de bois du plancher : madriers, planches, blocages, coins, tire-fonds,
// et pose des empilements calculés par plan.js.
import * as THREE from 'three';
import { WEDGE, B66, IN, S24 } from './plan.js';

// Bois brut de chantier : neuf, plus foncé, plus pâle ou grisé par l'usage,
// choisi d'après la position de la pièce (toujours le même pour une pièce).
const TONES = ['wood', 'wood', 'woodLight', 'woodDark', 'woodGrey', 'wood', 'woodLight'];
function tone(pos) {
  const h = Math.sin(pos[0] * 127.1 + pos[1] * 311.7 + pos[2] * 74.7) * 43758.5453;
  return TONES[Math.floor((h - Math.floor(h)) * TONES.length)];
}

/** Axe des veines (le plus long côté de la pièce), en attribut de la géométrie (ombrage du bois). */
export function grain(mesh, axis) {
  const g = mesh.geometry;
  if (!g || g.getAttribute('aGrain')) return mesh;
  const v = [0, 0, 0];
  v[axis] = 1;
  const n = g.getAttribute('position').count;
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) a.set(v, i * 3);
  g.setAttribute('aGrain', new THREE.BufferAttribute(a, 3));
  return mesh;
}

/** Pièce de bois rectangulaire centrée en pos (tailles en X, Y, Z) ; « wood » prend une teinte variée. */
export function lumber(S, size, pos, material = 'wood') {
  const m = S.box(size[0], size[1], size[2], material === 'wood' ? tone(pos) : material, { pos });
  return grain(m, size.indexOf(Math.max(...size)));
}

/** Pièce de section w × h (Y) tendue entre deux points a et b (lisses, jambes de force). */
export function between(S, a, b, w, h, material = 'woodPlaned') {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const len = A.distanceTo(B);
  const m = grain(S.box(len, h, w, material), 0);
  const g = S.group(m);
  g.position.copy(A).add(B).multiplyScalar(0.5);
  // Axe X de la pièce sur AB, son « haut » le plus près possible de Y.
  const dir = B.clone().sub(A).normalize();
  const ref = Math.abs(dir.y) > 0.99 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
  const up = ref.clone().sub(dir.clone().multiplyScalar(ref.dot(dir))).normalize();
  const third = dir.clone().cross(up);
  g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(dir, up, third));
  return g;
}

/** Profil d'un coin de bois (longueur selon X local, épaisseur selon Y, largeur selon Z). */
function wedgeMesh(S, points) {
  return S.extrude(points, WEDGE.w, 'woodWedge');
}

/**
 * Coin (ou paire de coins opposés) posé sur un blocage dont le dessus est à
 * w.pos[1], sous un appui large de 6 po, pour combler w.thick.
 */
export function wedge(S, w) {
  const { len, t } = WEDGE;
  const tip = 0.003;
  const g = S.group();
  if (!w.pair) {
    // Le coin touche l'appui à son bord, côté gros bout.
    const s = Math.min(len, (w.thick / t) * len);
    const m = wedgeMesh(S, [[0, 0], [len, 0], [len, t], [0, tip]]);
    m.position.x = B66 / 2 - s;
    g.add(m);
  } else {
    // Coins opposés : hauteur constante h = t (1 + d / len) sur leur recouvrement.
    const d = Math.min(len * 0.75, (w.thick / t - 1) * len);
    const h = t * (1 + d / len);
    const x0 = -(len + d) / 2;
    const lower = wedgeMesh(S, [[0, 0], [len, 0], [len, t], [0, tip]]);
    lower.position.x = x0;
    const upper = wedgeMesh(S, [[0, (t * d) / len], [len, h - tip], [len, h], [0, h]]);
    upper.position.x = x0 + d;
    g.add(lower, upper);
  }
  if (w.along === 'z') g.rotation.y = -Math.PI / 2;
  g.position.set(...w.pos);
  return g;
}

/** Tire-fonds de 6 po (tête hexagonale et rondelle) aux points donnés, têtes sur le plan des points. */
export function lagScrews(S, points) {
  return S.boltSet(points, 0.375 * IN, 6 * IN, 'zinc', { washer: true });
}

const KIND = { b38: 'wood', b66: 'wood', crib: 'woodDark' };

/**
 * Pose un empilement (plan.stack) : chaque pièce devient une pièce de la liste
 * (ref selon le genre), la première de chaque repère porte la bulle.
 * refs : { b38, b66, crib, wedge } ; labeled : Set des repères déjà étiquetés.
 * group : regroupe tout l'empilement sous un seul repère (cage, jonction).
 */
export function placeStack(api, st, { refs, labeled, step, explode = {}, group = null, seq }) {
  const S = api.S;
  const objs = st.pieces.map((p) => {
    const o = p.kind === 'wedge' ? wedge(S, p) : lumber(S, p.size, p.pos, KIND[p.kind]);
    o.userData.step = step;
    if (seq !== undefined) o.userData.seq = seq;
    o.userData.kind = p.kind;
    return o;
  });
  if (group) {
    if (!objs.length) return [];
    const g = S.group(objs);
    g.userData.step = step;
    if (seq !== undefined) g.userData.seq = seq;
    const lab = labeled.has(group.ref);
    labeled.add(group.ref);
    return [api.part(group.ref, g, group.explode || [0, 0, 0], { noLabel: lab })];
  }
  return objs.map((o) => {
    const ref = refs[o.userData.kind];
    const lab = labeled.has(ref);
    labeled.add(ref);
    return api.part(ref, o, explode[o.userData.kind] || [0, 0, 0], { noLabel: lab });
  });
}

/** Petit utilitaire : bulle seulement sur le premier exemplaire d'un repère. */
export function labeler(api) {
  const seen = new Set();
  // opts.seq : ordre de pose dans l'étape (montage par étapes) ; opts.noDrop : apparaît sans descendre.
  return (ref, obj, explode, step, opts = {}) => {
    obj.userData.step = step;
    if (opts.seq !== undefined) obj.userData.seq = opts.seq;
    if (opts.noDrop) obj.userData.noDrop = true;
    const noLabel = seen.has(ref) || !!opts.noLabel;
    seen.add(ref);
    return api.part(ref, obj, explode, { ...opts, noLabel });
  };
}

export { S24 };

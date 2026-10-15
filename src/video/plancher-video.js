// Vidéo de formation du plancher (PRO-DD-ST-003) : le modèle 3D du site
// (src/models/plancher-dd) monté pièce par pièce dans l'ordre de la
// procédure, caméra animée, bandeau avec le texte de la procédure, encadrés
// « Pourquoi », cartons de titre et de fin. Chaque image est calculée par
// window.__render(t) (t en secondes), sans horloge : la capture est
// reproductible. Format : 1280 × 720, 3D 1280 × 590, bandeau de 130 px.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import './plancher-video.css';
import { buildProcedural } from '../viewer/assembly.js';
import * as S from '../viewer/shapes.js';
import models from '../models/plancher-dd/index.js';
import { IN, P3, P8, B66, W, L, SEC, ground } from '../models/plancher-dd/plan.js';
import { timeline, RETENIR } from './plancher-script.js';

const VW = 1280, VH = 590;
const SEGS = timeline();
export const DURATION = SEGS.at(-1).start + SEGS.at(-1).dur;

// ------------------------------------------------------------------ scène

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
// ?scale=0.5 : aperçu rapide (rendu en demi-résolution, agrandi au montage).
const SCALE = Number(new URLSearchParams(location.search).get('scale')) || 1;
renderer.setPixelRatio(SCALE);
renderer.setSize(VW, VH);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.78;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('stage').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x30353a);
scene.fog = new THREE.Fog(0x30353a, 14, 34);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.35;
scene.add(new THREE.HemisphereLight(0xf2f0ea, 0x3a3631, 0.7));
const key = new THREE.DirectionalLight(0xfff1df, 1.7);
key.position.set(6, 9, 7);
const fill = new THREE.DirectionalLight(0xdfe8ff, 0.7);
fill.position.set(-6, 4, 5);
scene.add(key, fill);
// Lampes de galerie (lumière chaude au-dessus du plancher).
for (const x of [1.5, 5, 8.5]) {
  const l = new THREE.PointLight(0xffd9a0, 3, 8, 1.6);
  l.position.set(x, 2.6, 0.8);
  scene.add(l);
}

const camera = new THREE.PerspectiveCamera(40, VW / VH, 0.05, 80);

const model = buildProcedural(models, 'P02');
scene.add(model.root);
model.root.updateMatrixWorld(true);

// ------------------------------------------------------------------ pièces et repères de montage

/** Feuilles : pièces des sous-assemblages et pièces directes de la vue d'ensemble. */
const leaves = [];
for (const p of model.root.userData.parts) {
  if (p.userData.isAssembly) {
    for (const c of p.userData.parts) leaves.push({ obj: c, asm: p.userData.assemblyId, ref: c.userData.partRef });
  } else leaves.push({ obj: p, asm: 'P02', ref: p.userData.partRef });
}

const joistFarZ = W / 2 - B66 / 2;
function cueOf({ asm, ref, obj }) {
  const R = {
    P02: { G: 'always', 1: 'line', 9: 'drill', 10: 'barricade', 11: 'cabinet', 12: 'ext' },
    P04: { 1: 'joist1', 2: 'joists1', 3: 'support1', 5: 'support1', 6: 'joint1' },
    P07: { 1: 'deck1', 2: 'joinPlanks', 3: 'screws1', 4: 'screwsT', 5: 'joinScrews' },
    P10: { 1: 'joists2', 2: 'sleepers', 3: 'support2', 4: 'support2', 5: 'support2', 6: 'crib' },
    P13: { 1: 'deck2', 2: 'screws2', 3: 'screws2' },
    P14: { 1: 'stairs', 2: 'stairs', 3: 'stairs', 4: 'handrails', 5: 'handrails' },
    P16: { 1: 'guards', 2: 'guards', 3: 'guards', 4: 'guards', 5: 'guards', 6: 'grille' },
  };
  if (asm === 'P17') return 'secondary';
  let c = R[asm]?.[ref];
  if (c === 'joists1' && Math.abs(obj.position.z - joistFarZ) < 0.01) c = 'joistFar';
  return c || 'always';
}

const box = new THREE.Box3(), ctr = new THREE.Vector3();
const cues = new Map();
for (const lf of leaves) {
  lf.cue = cueOf(lf);
  lf.base = lf.obj.position.clone();
  box.setFromObject(lf.obj).getCenter(ctr);
  lf.c = ctr.clone();
  lf.t0 = lf.cue === 'always' ? -Infinity : Infinity;
  lf.drop = ['line', 'grille'].includes(lf.cue) ? 0 : lf.cue === 'drill' ? 0.9 : ['deck1', 'deck2', 'joinPlanks', 'secondary'].includes(lf.cue) ? 0.35 : 0.5;
  if (!cues.has(lf.cue)) cues.set(lf.cue, []);
  cues.get(lf.cue).push(lf);
}
// Ordre de pose dans un repère : le long du plancher, puis en travers, puis de bas en haut.
const REF_ORDER = (lf) => ({ 1: 0, 2: 2, 3: 3, 4: 4, 5: 1 })[lf.ref] ?? 0;
for (const [name, list] of cues) {
  list.sort((a, b) => {
    if (name === 'guards' && REF_ORDER(a) !== REF_ORDER(b)) return REF_ORDER(a) - REF_ORDER(b);
    if (name.startsWith('joists')) return a.c.z - b.c.z;
    return a.c.x - b.c.x || a.c.z - b.c.z || a.c.y - b.c.y;
  });
}

// Instants d'apparition, d'après le scénario.
for (const s of SEGS) {
  for (const r of s.reveal || []) {
    const list = (cues.get(r.cue) || []).slice(r.from ?? 0, r.to ?? undefined);
    list.forEach((lf, i) => { lf.t0 = s.start + s.dur * (r.at + (list.length > 1 ? (r.span * i) / (list.length - 1) : 0)); });
  }
}
// Armoire et extincteur : au sol à l'entrée du chantier (la vidéo les montre avant le plancher).
for (const [name, x, z, ry] of [['cabinet', L + 3.0, 2.25, 0], ['ext', L + 3.65, 2.35, 0]]) {
  for (const lf of cues.get(name) || []) { lf.base.set(x, ground(x, z), z); lf.obj.rotation.y = ry; }
}
const unused = [...cues].filter(([n, l]) => n !== 'always' && l.some((lf) => lf.t0 === Infinity)).map(([n]) => n);
if (unused.length) console.warn('Pièces jamais montrées :', unused.join(', '));

// ------------------------------------------------------------------ objets propres à la vidéo

const high = (() => {
  let best = { y: -Infinity };
  for (let x = 0; x <= SEC; x += 0.05) for (let z = -W / 2; z <= W / 2; z += 0.05) {
    const y = ground(x, z);
    if (y > best.y) best = { x, z, y };
  }
  return best;
})();

const laserMat = new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false });
function laserPlane(x0, x1) {
  const g = new THREE.Group();
  const p = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, W + 0.4), laserMat);
  p.rotation.x = -Math.PI / 2;
  p.position.set((x0 + x1) / 2, 0.003, 0);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(x1 - x0, W + 0.4)), new THREE.LineBasicMaterial({ color: 0xff3020 }));
  edge.rotation.x = -Math.PI / 2;
  edge.position.copy(p.position);
  g.add(p, edge);
  return g;
}
function laserTool(x, z) {
  const g = S.group(
    S.box(0.11, 0.13, 0.1, 'blue', { r: 0.01, pos: [0, 0.065, 0] }),
    S.box(0.112, 0.05, 0.06, 'fluoRed', { pos: [0, 0.1, 0] }),
    S.box(0.09, 0.02, 0.09, 'black', { pos: [0, 0.14, 0] }),
  );
  g.position.set(x, ground(x, z), z);
  return g;
}
const extras = {
  laser: S.group(laserPlane(-0.4, SEC + 0.3), laserTool(-0.35, -W / 2 + 0.6)),
  laser2: S.group(laserPlane(SEC - 0.1, L + 0.3), laserTool(SEC - 0.05, W / 2 + 0.05)),
  highMark: S.group(
    S.box(0.36, 0.006, 0.04, 'fluoRed', { pos: [0, 0, 0] }),
    S.box(0.04, 0.006, 0.36, 'fluoRed', { pos: [0, 0, 0] }),
    S.cyl(0.05, 0.12, 'fluoRed', { r2: 0.001, pos: [0, 0.18, 0] }),
    S.cyl(0.012, 0.25, 'fluoRed', { pos: [0, 0.36, 0] }),
  ),
  level: S.group(
    S.box(P3 * 0 + 0.2, P3, 8 * 12 * IN, 'woodLight', { pos: [0, P3 / 2, 0] }),
    S.box(0.045, 0.07, 48 * IN, 'blue', { pos: [0, P3 + 0.035, 0] }),
    S.box(0.047, 0.02, 0.07, 'lampAmber', { pos: [0, P3 + 0.06, 0] }),
  ),
  tightWedges: S.group(),
};
extras.highMark.position.set(high.x, high.y + 0.004, high.z);
extras.highMark.children[2].rotation.x = Math.PI; // pointe vers le sol
extras.level.position.set(2.3, B66, -0.4);
// Coins de serrage enfoncés entre deux planches (étape 7), pointe en bas.
for (const z of [-1.6, -0.4, 0.8, 2.0]) {
  const w = S.extrude([[0, 0], [0.025, 0], [0.012, -0.2]], 0.09, 'woodWedge');
  w.position.set(11 * P8, B66 + P3 + 0.12, z);
  extras.tightWedges.add(w);
}
for (const o of Object.values(extras)) { o.visible = false; scene.add(o); }
const shows = [];
for (const s of SEGS) for (const sh of s.show || []) shows.push({ obj: extras[sh.obj], name: sh.obj, a: s.start + s.dur * sh.from, b: s.start + s.dur * sh.to });

// ------------------------------------------------------------------ caméra

const ease = (x) => x * x * x * (x * (x * 6 - 15) + 10);
const V = (a) => new THREE.Vector3(...a);
// Trajectoire continue : chaque segment part de la dernière image clé du précédent.
const path = [];
let last = null;
for (const s of SEGS) {
  const keys = s.cams.map((k) => ({ time: s.start + s.dur * k.t, pos: V(k.pos), tgt: V(k.tgt) }));
  if (last && keys[0].time > s.start) path.push({ time: s.start, pos: last.pos, tgt: last.tgt });
  path.push(...keys);
  last = keys.at(-1);
}
function cameraAt(t) {
  let i = path.findIndex((k) => k.time > t);
  if (i === -1) i = path.length;
  const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i)];
  const u = b.time > a.time ? ease(Math.min(1, Math.max(0, (t - a.time) / (b.time - a.time)))) : 1;
  camera.position.copy(a.pos).lerp(b.pos, u);
  camera.lookAt(a.tgt.clone().lerp(b.tgt, u));
}

// ------------------------------------------------------------------ calques

const $ = (id) => document.getElementById(id);
const STEPS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'];
$('bar').innerHTML = STEPS.map((n) => `<i data-n="${n}">${n}</i>`).join('');
let shownSeg = null;

function fit(el, max, min) {
  let s = max;
  el.style.fontSize = `${s}px`;
  while (s > min && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)) { s -= 0.5; el.style.fontSize = `${s}px`; }
}

function showSegment(s) {
  shownSeg = s;
  const b = s.band;
  $('num').textContent = b.n === '' ? '' : b.n === '0' ? 'Avant' : b.n === '18' ? 'Plancher secondaire' : `Étape ${b.n}`;
  $('num').hidden = b.n === '';
  $('title').textContent = b.n === '18' ? '' : b.title;
  $('text').textContent = b.text;
  $('detail').textContent = b.detail;
  fit($('text'), 17, 12);
  fit($('detail'), 14, 10.5);
  const n = Number(b.n);
  for (const i of $('bar').children) {
    const k = Number(i.dataset.n);
    i.className = b.n !== '' && k === n ? 'on' : b.n !== '' && k < n ? 'done' : (s.id === 'demont' || s.id === 'fin') ? 'done' : '';
  }
  $('why').hidden = !s.why;
  if (s.why) $('why').querySelector('span').textContent = s.why;
  const card = $('card');
  card.hidden = !s.card;
  if (s.card === 'title') {
    card.className = 'title';
    card.innerHTML = `<small>Procédure de travail · PRO-DD-ST-003</small><h1>Fabrication d’un plancher pour foreuse aux diamants sous terre</h1><p>Machines Roger International · révision juillet 2026</p>`;
  } else if (s.card === 'end') {
    card.className = 'end';
    card.innerHTML = `<h2>À retenir</h2><ol>${RETENIR.map((r) => `<li>${r}</li>`).join('')}</ol><p>Procédure PRO-DD-ST-003 · Modèle 3D : reconstitution d’après la procédure</p>`;
  }
}

/** Opacités des calques à l'instant t (bandeau, texte du bandeau, « Pourquoi », carton). */
function levels(t, s) {
  const u = t - s.start;
  const clamp = (x) => Math.min(1, Math.max(0, x));
  return {
    text: clamp(u / 0.35),
    why: s.why ? clamp((u - 0.8) / 0.5) * clamp((s.dur - u) / 0.4) : 0,
    card: s.card === 'title' ? (u < s.dur * 0.55 ? 1 : clamp(1 - (u - s.dur * 0.55) / 0.6)) : s.card === 'end' ? clamp((u - 1.2) / 0.6) : 0,
    band: s.card === 'title' ? clamp((u - s.dur * 0.55) / 0.6) : 1,
  };
}

function overlays(t, s) {
  if (shownSeg !== s) showSegment(s);
  const lv = levels(t, s);
  for (const id of ['num', 'title', 'text', 'detail']) $(id).style.opacity = lv.text;
  $('why').style.opacity = lv.why;
  $('card').style.opacity = lv.card;
  $('band').style.opacity = lv.band;
  return lv;
}

// ------------------------------------------------------------------ rendu d'une image

function segAt(t) {
  return SEGS.find((s) => t < s.start + s.dur) || SEGS.at(-1);
}

function render(t) {
  const s = segAt(t);
  for (const lf of leaves) {
    const e = (t - lf.t0) / 0.55;
    lf.obj.visible = e >= 0;
    if (!lf.obj.visible) continue;
    const k = ease(Math.min(1, e));
    if (lf.cue === 'line') {
      lf.obj.scale.set(Math.max(0.001, k), 1, 1);
      lf.obj.visible = true;
    }
    lf.obj.position.set(lf.base.x, lf.base.y + lf.drop * (1 - k), lf.base.z);
  }
  // La ligne de peinture se trace plus lentement (2,5 s).
  for (const lf of cues.get('line') || []) {
    const k = ease(Math.min(1, Math.max(0, (t - lf.t0) / 2.5)));
    lf.obj.visible = t >= lf.t0;
    lf.obj.scale.set(Math.max(0.001, k), 1, 1);
    lf.obj.position.copy(lf.base);
  }
  for (const o of Object.values(extras)) o.visible = false;
  for (const sh of shows) {
    if (t < sh.a || t > sh.b) continue;
    sh.obj.visible = true;
    if (sh.name === 'tightWedges') {
      // Enfoncés en 1,2 s, puis retirés à la fin.
      const k = ease(Math.min(1, (t - sh.a) / 1.2));
      sh.obj.position.y = 0.2 * (1 - k);
    }
  }
  cameraAt(t);
  overlays(t, s);
  renderer.render(scene, camera);
}

window.__video = { duration: DURATION, fps: 24, segments: SEGS.map(({ id, start, dur, band, lines }) => ({ id, start, dur, band, lines })) };
window.__render = (t) => { render(t); return true; };
// Capture rapide : la 3D seule (JPEG) et les opacités des calques ; les calques
// eux-mêmes sont capturés une fois par segment (__layer), puis composés à part.
window.__frame = (t) => {
  render(t);
  const s = segAt(t);
  return { seg: SEGS.indexOf(s), ...levels(t, s), img: renderer.domElement.toDataURL('image/jpeg', 0.93) };
};
window.__layer = (i, which) => {
  const s = SEGS[i];
  showSegment(s);
  document.documentElement.style.background = 'transparent';
  document.body.style.background = 'transparent';
  $('frame').style.background = 'transparent';
  $('stage').style.visibility = 'hidden';
  for (const id of ['band', 'why', 'card', 'tag']) {
    const el = $(id);
    el.style.visibility = id === which ? 'visible' : 'hidden';
    el.style.opacity = 1;
  }
  for (const id of ['num', 'title', 'text', 'detail']) $(id).style.opacity = 1;
  return { why: !!s.why, card: !!s.card };
};
// Aperçu dans le navigateur : lecture en temps réel (ou ?t=12.5 pour une image).
const q = new URLSearchParams(location.search);
if (q.has('t')) render(Number(q.get('t')));
else if (!q.has('capture')) {
  const t0 = performance.now() - (Number(q.get('from')) || 0) * 1000;
  const loop = (now) => { render(((now - t0) / 1000) % DURATION); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
document.fonts.ready.then(() => { window.__ready = true; });

// Vidéo de formation du plancher (PRO-DD-ST-003) : le modèle 3D du site
// (src/models/plancher-dd) monté pièce par pièce dans l'ordre de la
// procédure, caméra animée, bandeau avec le texte de la procédure, encadrés
// « Pourquoi », cartons de titre et de fin. Chaque image est calculée par
// window.__render(t) (t en secondes), sans horloge : la capture est
// reproductible. Format : 1280 × 720, 3D 1280 × 540, bandeau de 180 px.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import './plancher-video.css';
import { buildProcedural } from '../viewer/assembly.js';
import * as S from '../viewer/shapes.js';
import models from '../models/plancher-dd/index.js';
import { IN, FT, P3, P8, B66, W, L, SEC, DECK, ground, plankZ, TIGHT, joistX, GUIDE_Z, DIP } from '../models/plancher-dd/plan.js';
import { lagScrews } from '../models/plancher-dd/lumber.js';
import { timeline, RETENIR, stepCard, STEP_CARD, vt } from './plancher-script.js';
import { Annotator } from './plancher-annot.js';

const VW = 1280, VH = 540;
const SEGS = timeline();
export const DURATION = SEGS.at(-1).start + SEGS.at(-1).dur;

// ------------------------------------------------------------------ scène

// ?scale=0.5 : aperçu rapide (rendu en demi-résolution, agrandi au montage) ;
// ?aa=0 : sans anticrénelage matériel (plus rapide en rendu logiciel).
const QS = new URLSearchParams(location.search);
const SCALE = Number(QS.get('scale')) || 1;
// ?fxaa=1 : anticrénelage FXAA en post-traitement (bien moins coûteux que le MSAA en rendu logiciel).
const FXAA = QS.get('fxaa') === '1';
const renderer = new THREE.WebGLRenderer({ antialias: !FXAA && QS.get('aa') !== '0', preserveDrawingBuffer: true });
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
// Ombres douces de la lumière principale (?shadows=0 pour les couper).
const SHADOWS = QS.get('shadows') !== '0';
if (SHADOWS) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.target.position.set(L / 2, 0, 0);
  key.position.set(L / 2 + 3.5, 9, 6);
  Object.assign(key.shadow.camera, { left: -11, right: 11, top: 8, bottom: -8, near: 1, far: 26 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 3;
  scene.add(key.target);
}
scene.add(key, fill);
// Lampes de galerie (lumière chaude au-dessus du plancher).
for (const x of [1.5, 5, 8.5]) {
  const l = new THREE.PointLight(0xffd9a0, 3, 8, 1.6);
  l.position.set(x, 2.6, 0.8);
  scene.add(l);
}

const camera = new THREE.PerspectiveCamera(40, VW / VH, 0.05, 80);

let composer = null;
if (FXAA) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new OutputPass());
  const fx = new ShaderPass(FXAAShader);
  fx.material.uniforms.resolution.value.set(1 / (VW * SCALE), 1 / (VH * SCALE));
  composer.addPass(fx);
}

const model = buildProcedural(models, 'P02');
scene.add(model.root);
model.root.updateMatrixWorld(true);
if (SHADOWS) model.root.traverse((o) => { if (o.isMesh) { o.castShadow = !o.material?.transparent; o.receiveShadow = true; } });

// ------------------------------------------------------------------ pièces et repères de montage

/** Feuilles : pièces des sous-assemblages et pièces directes de la vue d'ensemble. */
const leaves = [];
// Cage de bois focalisée (étape 11) : montée pièce par pièce, en gros plan.
const CRIB_FOCUS = new THREE.Vector3(DIP.x, -0.45, DIP.z);
for (const p of model.root.userData.parts) {
  if (p.userData.isAssembly) {
    for (const c of p.userData.parts) {
      if (p.userData.assemblyId === 'P10' && c.userData.partRef === '6') {
        // Cages : chaque pièce devient une « feuille » (couche par couche).
        c.updateMatrixWorld(true);
        const near = new THREE.Box3().setFromObject(c).distanceToPoint(CRIB_FOCUS) < 0.05;
        for (const k of c.children) leaves.push({ obj: k, asm: 'P10', ref: '6', crib: near ? 'cribFocus' : 'cribOther' });
      } else leaves.push({ obj: c, asm: p.userData.assemblyId, ref: c.userData.partRef });
    }
  } else leaves.push({ obj: p, asm: 'P02', ref: p.userData.partRef });
}

const ANCHOR = TIGHT + 1; // dernier 3 × 8, vissé le temps du serrage (étape 7)
function cueOf({ asm, ref, obj, crib }) {
  if (crib) return crib;
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
  if (c === 'joists1' && Math.abs(obj.position.x - joistX.at(-1)) < 0.01) c = 'joistFar';
  if (c === 'sleepers' && Math.abs(obj.position.z - GUIDE_Z) < 0.01) c = 'guide';
  if (c === 'deck1') { const i = obj.userData.order; c = i === ANCHOR ? 'anchor' : i > ANCHOR ? 'deck1b' : 'deck1'; }
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
  lf.drop = lf.cue.startsWith('crib') ? 0.35 : ['line', 'grille'].includes(lf.cue) ? 0 : lf.cue === 'drill' ? 0.9 : ['deck1', 'deck1b', 'anchor', 'deck2', 'joinPlanks', 'secondary'].includes(lf.cue) ? 0.35 : 0.5;
  if (!cues.has(lf.cue)) cues.set(lf.cue, []);
  cues.get(lf.cue).push(lf);
}
// Ordre de pose dans un repère : le long du plancher, puis en travers, puis de bas en haut.
const REF_ORDER = (lf) => ({ 1: 0, 2: 2, 3: 3, 4: 4, 5: 1 })[lf.ref] ?? 0;
for (const [name, list] of cues) {
  list.sort((a, b) => {
    if (name === 'guards' && REF_ORDER(a) !== REF_ORDER(b)) return REF_ORDER(a) - REF_ORDER(b);
    if (name.startsWith('joists')) return a.c.x - b.c.x;
    if (name.startsWith('deck')) return (a.obj.userData.order ?? 0) - (b.obj.userData.order ?? 0) || a.c.x - b.c.x;
    if (name.startsWith('crib')) return a.c.y - b.c.y || a.c.x - b.c.x || a.c.z - b.c.z;
    if (name === 'support2' || name === 'sleepers') return a.c.z - b.c.z || a.c.x - b.c.x || a.c.y - b.c.y;
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
for (const [name, x, z, ry] of [['cabinet', L + 3.0, -3.6, 0], ['ext', L + 3.65, -3.5, 0]]) {
  for (const lf of cues.get(name) || []) { lf.base.set(x, ground(x, z), z); lf.obj.rotation.y = ry; }
}
const unused = [...cues].filter(([n, l]) => n !== 'always' && l.some((lf) => lf.t0 === Infinity)).map(([n]) => n);
if (unused.length) console.warn('Pièces jamais montrées :', unused.join(', '));

// ------------------------------------------------------------------ objets propres à la vidéo

const high = (() => {
  let best = { y: -Infinity };
  for (let x = 0; x <= SEC; x += 0.05) for (let z = -W / 2; z <= 0; z += 0.05) {
    const y = ground(x, z);
    if (y > best.y) best = { x, z, y };
  }
  return best;
})();

const laserMat = new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false });
// Plan du laser au-dessus d'une section (emprise z0 à z1 en travers de la galerie).
function laserPlane(z0, z1) {
  const g = new THREE.Group();
  const p = new THREE.Mesh(new THREE.PlaneGeometry(L + 0.7, z1 - z0), laserMat);
  p.rotation.x = -Math.PI / 2;
  p.position.set(L / 2 - 0.05, 0.003, (z0 + z1) / 2);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(L + 0.7, z1 - z0)), new THREE.LineBasicMaterial({ color: 0xff3020 }));
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
  laser: S.group(laserPlane(-W / 2 - 0.3, 0.3), laserTool(-0.35, -W / 2 + 0.6)),
  laser2: S.group(laserPlane(-0.1, W / 2 + 0.3), laserTool(L + 0.12, 0.05)),
  highMark: S.group(
    S.box(0.36, 0.006, 0.04, 'fluoRed', { pos: [0, 0, 0] }),
    S.box(0.04, 0.006, 0.36, 'fluoRed', { pos: [0, 0, 0] }),
    S.cyl(0.05, 0.12, 'fluoRed', { r2: 0.001, pos: [0, 0.18, 0] }),
    S.cyl(0.012, 0.25, 'fluoRed', { pos: [0, 0.36, 0] }),
  ),
  // Niveau de 48 po sur un 3 × 8 de 8 pi posé en travers des madriers (selon X).
  level: S.group(
    S.box(8 * FT, P3, 0.2, 'woodLight', { pos: [0, P3 / 2, 0] }),
    S.box(48 * IN, 0.07, 0.045, 'blue', { pos: [0, P3 + 0.035, 0] }),
    S.box(0.07, 0.02, 0.047, 'lampAmber', { pos: [0, P3 + 0.06, 0] }),
  ),
};
extras.highMark.position.set(high.x, high.y + 0.004, high.z);
extras.highMark.children[2].rotation.x = Math.PI; // pointe vers le sol
extras.level.position.set(2.3, B66, -2.0);
for (const o of Object.values(extras)) { o.visible = false; scene.add(o); }

// ------------------------------------------------------------------ serrage des planches (étape 7)

// Les planches 1 à TIGHT sont posées sans serrage : un petit écart (exagéré pour
// la vidéo) reste entre chacune. À environ 50 %, le dernier 3 × 8 (ANCHOR) est posé
// plus loin et vissé ; des coins enfoncés entre lui et la planche TIGHT poussent
// les planches posées vers la première (vissée) : les écarts se ferment. La
// planche devant les coins est vissée, puis les tire-fonds du dernier 3 × 8 sont
// retirés, les coins enlevés, et le dernier 3 × 8 reprend sa place.
const GAP = 0.015; // écart entre deux planches non serrées (exagéré pour être visible)
const WG = 0.05; // espace pour les coins
const TSEG = SEGS.find((x) => x.tighten);
const TT = Object.fromEntries(Object.entries(TSEG.tighten).map(([k, v]) => [k, Array.isArray(v) ? v.map((x) => vt(TSEG, x)) : vt(TSEG, v)]));
const span01 = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const anchorZ0 = plankZ(ANCHOR);
const anchorScrews = lagScrews(S, [B66 / 2, SEC - B66 / 2].map((x) => [x, DECK, 0]));
const wedgeXs = [0.75, 1.85, 2.95, 4.05];
const tightWedges = S.group();
for (const x of wedgeXs) {
  // Coin pointe en bas, épaisseur selon Z (mise à l'échelle selon l'écart à combler).
  const w = S.extrude([[0, 0], [1, 0], [0.62, -0.26], [0.38, -0.26]], 0.1, 'woodWedge');
  w.position.set(-0.5, 0, -0.05);
  const holder = S.group(w);
  holder.rotation.y = -Math.PI / 2;
  const g = S.group(holder);
  g.position.x = x;
  tightWedges.add(g);
}
scene.add(anchorScrews, tightWedges);
anchorScrews.visible = tightWedges.visible = false;
const deckLeaves = leaves.filter((lf) => ['deck1', 'anchor'].includes(lf.cue));
/** Décalage (selon Z) des planches non serrées et du dernier 3 × 8 à l'instant t. */
function tighten(t) {
  const drive = span01(t, TT.drive[0], TT.drive[1]);
  const k = drive * drive * (3 - 2 * drive);
  const loose = (i) => i * GAP * (1 - k);
  const back = span01(t, TT.back[0], TT.back[1]);
  const anchorOff = (TIGHT * GAP + WG) * (1 - back * back * (3 - 2 * back));
  for (const lf of deckLeaves) {
    const i = lf.obj.userData.order;
    if (i === 0) continue;
    lf.obj.position.z = lf.base.z + (i === ANCHOR ? anchorOff : loose(i));
  }
  // Tire-fonds temporaires du dernier 3 × 8 : posés, puis retirés (ils remontent).
  const up = span01(t, TT.unscrew, TT.unscrew + 0.6);
  anchorScrews.visible = t >= TT.anchorScrews && up < 1;
  anchorScrews.position.set(0, 0.25 * (1 - span01(t, TT.anchorScrews, TT.anchorScrews + 0.4)) + 0.12 * up, anchorZ0 + anchorOff);
  // Coins : insérés au-dessus de l'écart, enfoncés, puis enlevés.
  const out = span01(t, TT.wedgesOut, TT.wedgesOut + 0.5);
  tightWedges.visible = t >= TT.wedgesIn && out < 1;
  const zFront = plankZ(TIGHT) + loose(TIGHT) + P8 / 2; // face de la planche devant les coins
  const zBack = anchorZ0 + anchorOff - P8 / 2; // face du dernier 3 × 8
  const gap = Math.max(0.004, zBack - zFront);
  const ins = span01(t, TT.wedgesIn, TT.wedgesIn + 0.5);
  for (const g of tightWedges.children) {
    g.position.z = (zFront + zBack) / 2;
    g.position.y = DECK + 0.14 + 0.25 * (1 - ins) - 0.1 * k + 0.35 * out;
    g.children[0].scale.x = gap; // épaisseur du coin = écart comblé (axe X local du profil)
  }
}
const shows = [];
for (const s of SEGS) for (const sh of s.show || []) shows.push({ obj: extras[sh.obj], name: sh.obj, a: s.start + s.dur * sh.from, b: s.start + s.dur * sh.to });

// ------------------------------------------------------------------ transparence (cage)

// Pendant le gros plan sur la cage, le bois autour devient transparent :
// matériaux propres aux pièces concernées (les cages gardent les leurs).
const ghostMats = new Map(), nearMats = new Map();
for (const lf of leaves) {
  if (lf.cue.startsWith('crib') || ['always', 'line', 'barricade', 'cabinet', 'ext', 'grille'].includes(lf.cue)) continue;
  // Le soutien et le madrier portés par la cage restent visibles en transparence.
  const near = (lf.cue === 'sleepers' && Math.abs(lf.c.z - CRIB_FOCUS.z) < 0.2) || (['joists2', 'guide'].includes(lf.cue) && Math.abs(lf.c.x - CRIB_FOCUS.x) < 0.2);
  const map = near ? nearMats : ghostMats;
  lf.obj.traverse((o) => {
    if (!o.isMesh) return;
    const swap = (m) => { if (!map.has(m)) map.set(m, m.clone()); return map.get(m); };
    o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material);
  });
}
const ghosts = SEGS.filter((s) => s.ghost).map((s) => ({ a: s.start + s.dur * s.ghost.from, b: s.start + s.dur * s.ghost.to }));
function ghost(t) {
  let k = 0;
  for (const g of ghosts) k = Math.max(k, Math.min(1, Math.max(0, (t - g.a) / 0.8)) * Math.min(1, Math.max(0, (g.b - t) / 0.8)));
  for (const [map, min] of [[ghostMats, 0], [nearMats, 0.3]]) {
    for (const m of map.values()) {
      m.transparent = k > 0;
      m.opacity = 1 - (1 - min) * k;
      m.depthWrite = k < 0.5;
      m.visible = m.opacity > 0.01;
    }
  }
}

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
  fit($('text'), 22, 15);
  fit($('detail'), 17, 13);
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

// Calque d'annotations 2D (cotes, notes), au-dessus de la 3D.
const annotCanvas = document.createElement('canvas');
annotCanvas.width = VW;
annotCanvas.height = VH;
annotCanvas.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none';
document.getElementById('stage').appendChild(annotCanvas);
const annot = new Annotator(annotCanvas, camera, SEGS, [VW, VH]);
window.__annotObj = annot;
// Zones interdites aux étiquettes : étiquette PRO-DD-ST-003, encadré « Pourquoi »,
// carton d'étape (début de partie).
function avoidAt(t, s, lv) {
  const r = [{ x: 1090, y: 6, w: 190, h: 46 }];
  if (lv.why > 0.01) {
    const el = $('why');
    r.push({ x: 10, y: 8, w: el.offsetWidth + 16, h: el.offsetHeight + 16 });
  }
  if (stepCard(s) && t - s.start < STEP_CARD.dur + 0.3) r.push(STEP_CARD.rect);
  if (s.card) r.push({ x: 0, y: 0, w: VW, h: VH });
  return r;
}
function drawAnnotations(t) {
  const s = segAt(t);
  const lv = overlays(t, s);
  annot.draw(t, avoidAt(t, s, lv));
}

// Carte d'ombres recalculée seulement quand une pièce bouge, apparaît ou
// disparaît (la lumière ne bouge pas) : même image, moins de calcul.
const SHADOW_CACHE = SHADOWS && QS.get('shadowcache') !== '0';
let shadowSig = '';
function shadowSignature() {
  let n = 0, s = 0;
  for (const lf of leaves) {
    if (!lf.obj.visible) continue;
    const p = lf.obj.position;
    n++;
    s += n * (p.x * 1.31 + p.y * 7.13 + p.z * 3.77 + lf.obj.scale.x * 0.53);
  }
  return `${n}|${s.toFixed(6)}`;
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
  tighten(t);
  cameraAt(t);
  ghost(t);
  overlays(t, s);
  if (SHADOW_CACHE) {
    renderer.shadowMap.autoUpdate = false;
    const sig = shadowSignature();
    if (sig !== shadowSig) { renderer.shadowMap.needsUpdate = true; shadowSig = sig; }
  }
  if (composer) composer.render(); else renderer.render(scene, camera);
}

window.__video = { duration: DURATION, fps: 24, segments: SEGS.map(({ id, start, dur, band, lines }) => ({ id, start, dur, band, lines })) };
window.__render = (t) => { render(t); return true; };
// Image fixe (validation) : l'état de l'instant t, vu d'une caméra donnée.
window.__still = (t, pos, tgt, fov) => {
  render(t);
  camera.position.set(...pos);
  if (fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  camera.lookAt(...tgt);
  camera.updateMatrixWorld(true);
  if (composer) composer.render(); else renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/jpeg', 0.95);
};
// Capture rapide : la 3D seule (JPEG) et les opacités des calques ; les calques
// eux-mêmes sont capturés une fois par segment (__layer), puis composés à part.
window.__frame = (t) => {
  render(t);
  const s = segAt(t);
  return { seg: SEGS.indexOf(s), ...levels(t, s), img: renderer.domElement.toDataURL('image/jpeg', 0.96) };
};
// Calque d'annotations à l'instant t (PNG transparent), sans rendu 3D : la
// caméra suffit. À appeler dans l'ordre des images (lissage des positions).
window.__annot = (t) => {
  cameraAt(t);
  camera.updateMatrixWorld(true);
  drawAnnotations(t);
  return annotCanvas.toDataURL('image/png');
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
  return { why: !!s.why, card: !!s.card, text: parseFloat($('text').style.fontSize), detail: parseFloat($('detail').style.fontSize) };
};
// Aperçu dans le navigateur : lecture en temps réel (ou ?t=12.5 pour une image).
const q = new URLSearchParams(location.search);
if (q.has('t')) { render(Number(q.get('t'))); drawAnnotations(Number(q.get('t'))); }
else if (!q.has('capture')) {
  const t0 = performance.now() - (Number(q.get('from')) || 0) * 1000;
  const loop = (now) => { const t = ((now - t0) / 1000) % DURATION; render(t); drawAnnotations(t); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
Promise.all([document.fonts.load('700 30px "Barlow Condensed"'), document.fonts.load('600 19px "IBM Plex Sans"')]).then(() => document.fonts.ready).then(() => { window.__ready = true; });

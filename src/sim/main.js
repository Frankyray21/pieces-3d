// Simulation mécanique du DU311 (page de développement sim.html, hors site).
// Le modèle 3D est celui du site (P010) ; le rig le rend articulé. Chaque
// commande amène un corps vers sa consigne à vitesse limitée, sous réserve des
// verrouillages ; les positions prédéfinies enchaînent des étapes. Le cycle de
// forage (drilling.js) pilote lui-même l'avance, le carrousel et les bras ; pendant
// qu'il tient des tiges, les commandes manuelles sont verrouillées.
import * as THREE from 'three';
import './sim.css';
import { Viewer } from '../viewer/Viewer.js';
import { buildProcedural } from '../viewer/assembly.js';
import * as shapes from '../viewer/shapes.js';
import builders from '../models/du311-std/index.js';
import { Rig } from './kinematics.js';
import { createDrilling } from './drilling.js';
import {
  BODIES, RULES, CONTROLS, SPEEDS, INTERLOCKS, PRESETS, carouselAngle, driveStep, groundClearance, WHEEL_R, REEL_DRUM, RATIO,
} from './du311-std.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------------------------------------------------------------- modèle et rig

const model = buildProcedural(builders, 'P010');
const rig = new Rig(model.root, { bodies: BODIES, rules: RULES }, shapes);
rig.sweepRams();
rig.buildRams();
rig.apply();

const viewer = new Viewer($('#viewport'), { onHover: showHover, onSelect: () => {} });
viewer.setLabels(false);
// La visionneuse replace les pièces à leur position d'éclaté (cadrage, coupe) :
// le rig repasse derrière pour garder la pose courante.
let drill = null;
const applyAll = viewer._applyAll.bind(viewer);
viewer._applyAll = () => { applyAll(); rig.apply(); drill?.place(); };
viewer.setModel(model);
const grid0 = viewer.grid.position.clone();
// Roue de rechange, télécommande ERIS et câble CAN, livrés avec la machine et posés
// au sol : ils restent sur place quand la machine se déplace.
for (const p of model.root.userData.parts) if (['3', '4', '5'].includes(p.userData.partRef)) viewer.scene.attach(p);

// ---------------------------------------------------------------- état des commandes

const items = CONTROLS.flatMap((g) => g.items);
const bodiesOf = (it) => it.bodies || [it.id];
const valueOf = (it) => rig.get(bodiesOf(it)[0]);
const range = (it) => { const b = rig.bodies.get(bodiesOf(it)[0]); return [b.min, b.max]; };
const state = {
  target: new Map(items.map((it) => [it.id, valueOf(it)])),
  jog: new Map(),
  carousel: { index: 0, target: 0 },
  rpm: 0,
  drive: 0,
  compressor: false,
  pose: { x: 0, z: 0, heading: 0 },
  stages: null,
  follow: true,
  timeScale: 5, // accélération du cycle de forage
  msg: '',
  msgT: 0,
};
const flash = (msg) => { state.msg = msg; state.msgT = performance.now(); };
const v = (name) => rig.get(name);

// Cycle de forage : tiges au carrousel, marteau dans le centreur, trous dans la scène.
drill = createDrilling({ rig, root: model.root, scene: viewer.scene, S: shapes, setAir });
function setAir(on) {
  state.compressor = on;
  const c = $('#comp');
  if (c) c.checked = on;
}
const LOCKED = 'Cycle de forage en cours : commandes manuelles verrouillées (Recommencer pour tout ramener).';

function blocked(cmd, dir) {
  const rule = INTERLOCKS.find((r) => r.cmd === cmd && (!r.dir || r.dir === dir) && r.when(v));
  return rule ? rule.msg : '';
}

// ---------------------------------------------------------------- panneau

function buildPanel() {
  const fmt = (it, x) => `${(x * it.scale).toFixed(it.digits)} ${it.unit}`;
  const rows = (g) => g.items.map((it) => {
    const [lo, hi] = range(it).map((x) => x * it.scale).sort((a, b) => a - b);
    return `<div class="ctl" data-id="${it.id}">
      <div class="ctl-h"><span>${esc(it.label)}</span><output id="o-${it.id}">${fmt(it, valueOf(it))}</output></div>
      <div class="ctl-r">
        <button type="button" class="jog" data-jog="-1" aria-label="${esc(it.label)} : moins">−</button>
        <input type="range" id="r-${it.id}" min="${lo}" max="${hi}" step="${(hi - lo) / 400}" value="${valueOf(it) * it.scale}" aria-label="${esc(it.label)}">
        <button type="button" class="jog" data-jog="1" aria-label="${esc(it.label)} : plus">+</button>
      </div></div>`;
  }).join('');
  $('#panel').innerHTML = `
    <section><h2>Positions</h2><div class="btns">
      ${Object.entries(PRESETS).map(([k, p]) => `<button type="button" class="btn" data-preset="${k}">${esc(p.label)}</button>`).join('')}
      <button type="button" class="btn stop" id="stop">Arrêt</button>
    </div></section>
    <section class="drill"><h2>Cycle de forage</h2>
      <dl class="readout">
        <div><dt>Au carrousel</dt><dd id="d-car"></dd></div>
        <div><dt>Dans le trou</dt><dd id="d-hole"></dd></div>
        <div><dt>Profondeur</dt><dd id="d-depth"></dd></div>
        <div><dt>Temps simulé</dt><dd id="d-time"></dd></div>
      </dl>
      <p class="step" id="d-step"></p>
      <div class="btns">
        <button type="button" class="btn" data-drill="collar">Enfoncer le marteau</button>
        <span class="combo"><button type="button" class="btn" data-drill="add">Forer</button><select id="d-n" aria-label="Nombre de tiges à forer">
          ${Array.from({ length: 17 }, (_, i) => `<option value="${i + 1}">${i + 1} tige${i ? 's' : ''}</option>`).join('')}</select></span>
        <button type="button" class="btn" data-drill="pull">Remonter le train</button>
      </div>
      <div class="btns">
        <button type="button" class="btn" id="d-pause">Pause</button>
        <button type="button" class="btn" id="d-reset">Recommencer</button>
        <span class="seg" role="radiogroup" aria-label="Accélération du cycle">${[1, 5, 20, 60].map((k) => `<label><input type="radio" name="d-speed" value="${k}"${k === state.timeScale ? ' checked' : ''}><span>×${k}</span></label>`).join('')}</span>
      </div>
      <ol class="log" id="d-log" aria-label="Étapes terminées"></ol>
      <p class="note">Mettre la machine en position de forage, puis enfoncer le marteau. Tiges Ø 3½ po × 6 pi, pénétration 0,6 m/min (ordre de grandeur), vissage à 30 tr/min, forage à 50 tr/min.</p>
    </section>
    <section><h2>Translation</h2>
      <div class="btns"><button type="button" class="btn hold" data-drive="-1">◀ Reculer</button><button type="button" class="btn hold" data-drive="1">Avancer ▶</button></div>
      <p class="note">Clavier : ↑ ↓ avancer / reculer, ← → braquer. <label><input type="checkbox" id="follow" checked> Caméra qui suit</label></p>
    </section>
    ${CONTROLS.map((g) => `<section><h2>${esc(g.group)}</h2>${rows(g)}${g.group === 'Carrousel' ? `
      <div class="ctl"><div class="ctl-h"><span>Alvéole au transfert</span><output id="o-index">1 / 17</output></div>
        <div class="btns"><button type="button" class="btn" data-index="-1">◀ Précédente</button><button type="button" class="btn" data-index="1">Suivante ▶</button></div></div>` : ''}${g.group === 'Avance' ? `
      <div class="ctl"><div class="ctl-h"><span>Rotation de la broche</span><output id="o-rpm">0 tr/min</output></div>
        <div class="ctl-r"><input type="range" id="r-rpm" min="0" max="${SPEEDS.spinRpm}" step="1" value="0" aria-label="Rotation de la broche"></div></div>` : ''}</section>`).join('')}
    <section><h2>Surpresseur</h2><label class="sw"><input type="checkbox" id="comp"> Moteur 75 HP en marche</label></section>
    <section><h2>Vérins</h2><table class="rams"><thead><tr><th>Vérin</th><th>Entre axes</th><th>Course</th></tr></thead><tbody>
      ${rig.rams.map((r) => `<tr><td>${esc(r.id)}</td><td id="L-${r.id}"></td><td><span class="gauge"><i id="g-${r.id}"></i></span></td></tr>`).join('')}
    </tbody></table><p class="note">Fûts et tiges dimensionnés sur les longueurs extrêmes entre axes (balayage des débattements).</p></section>`;

  $('#panel').addEventListener('input', (e) => {
    const id = e.target.id;
    if (e.target.name === 'd-speed') { state.timeScale = Number(e.target.value); return; }
    if (id === 'follow' || id === 'd-n') return;
    if (id === 'comp') { state.compressor = e.target.checked; return; }
    if (drill.engaged()) { flash(LOCKED); return; }
    if (id === 'r-rpm') { state.rpm = Number(e.target.value); return; }
    const it = items.find((x) => `r-${x.id}` === id);
    if (it) { state.stages = null; state.target.set(it.id, Number(e.target.value) / it.scale); }
  });
  $('#follow').addEventListener('change', (e) => { state.follow = e.target.checked; });
  $('#comp').addEventListener('change', (e) => { state.compressor = e.target.checked; });
  $('#stop').addEventListener('click', stopAll);
  $('#d-pause').addEventListener('click', () => drill.pause(!drill.state.paused));
  $('#d-reset').addEventListener('click', resetDrilling);
  $('#panel').addEventListener('click', (e) => {
    const d = e.target.closest('[data-drill]');
    if (d) { startDrilling(d.dataset.drill); return; }
    const p = e.target.closest('[data-preset]');
    if (p) { startPreset(p.dataset.preset); return; }
    const k = e.target.closest('[data-index]');
    if (k) indexCarousel(Number(k.dataset.index));
  });
  // Boutons à maintenir : pas à pas d'une commande, translation.
  const hold = (el, on, off) => {
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.setPointerCapture(e.pointerId); on(); });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(ev, off);
  };
  document.querySelectorAll('.jog').forEach((b) => {
    const id = b.closest('.ctl').dataset.id;
    hold(b, () => { state.stages = null; state.jog.set(id, Number(b.dataset.jog)); }, () => { state.jog.delete(id); const it = items.find((x) => x.id === id); state.target.set(id, valueOf(it)); });
  });
  document.querySelectorAll('[data-drive]').forEach((b) => hold(b, () => { state.drive = Number(b.dataset.drive); }, () => { state.drive = 0; }));
}

function stopAll() {
  if (drill.state.running) drill.pause(true);
  state.stages = null;
  state.jog.clear();
  items.forEach((it) => state.target.set(it.id, valueOf(it)));
  state.carousel.target = v('carousel');
  state.rpm = 0; $('#r-rpm').value = 0;
  state.drive = 0;
}

function startPreset(key) {
  if (drill.engaged()) { flash(LOCKED); return; }
  state.jog.clear();
  state.stages = PRESETS[key].stages.map((s) => ({ ...s }));
  applyStage();
}

function applyStage() {
  const st = state.stages?.[0];
  if (!st) { state.stages = null; return; }
  for (const [id, x] of Object.entries(st)) state.target.set(id, x);
}

function indexCarousel(step) {
  if (drill.engaged()) { flash(LOCKED); return; }
  const msg = blocked('carousel');
  if (msg) { flash(msg); return; }
  state.carousel.index = (state.carousel.index + step + 17) % 17;
  // chemin le plus court vers l'angle de l'alvéole demandée
  const cur = v('carousel');
  let d = carouselAngle(state.carousel.index) - cur;
  d = Math.atan2(Math.sin(d), Math.cos(d));
  state.carousel.target = cur + d;
}
state.carousel.target = 0;

/** Lance un programme du cycle de forage ('collar', 'add', 'pull'). */
function startDrilling(kind) {
  if (state.stages) { flash('Attendre la fin de la position en cours.'); return; }
  stopManual();
  const msg = drill.start(kind, kind === 'add' ? Number($('#d-n').value) : 1);
  if (msg) flash(msg);
}

/** Ramène les tiges au carrousel et le marteau au centreur, efface les trous. */
function resetDrilling() {
  if (drill.state.running && !drill.state.paused) { flash("Mettre le cycle en pause avant de recommencer."); return; }
  // les corps pilotés par le cycle reviennent à leur position de repos
  for (const b of ['feed', 'clamp', 'slip']) rig.set(b, 0);
  rig.set('carousel', carouselAngle(0));
  state.carousel.index = 0;
  drill.reset();
  stopManual();
  setAir(false);
  rig.apply();
  drill.place();
  viewer.invalidate(true);
}

// Consignes manuelles calées sur la pose courante (pendant ou après le cycle).
function stopManual() {
  state.stages = null;
  state.jog.clear();
  items.forEach((it) => state.target.set(it.id, valueOf(it)));
  state.carousel.target = v('carousel');
  state.rpm = 0;
  state.drive = 0;
}

// Clavier : translation et braquage.
const keys = new Set();
window.addEventListener('keydown', (e) => {
  if (e.target.matches('input')) return;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) { keys.add(e.key); e.preventDefault(); }
});
window.addEventListener('keyup', (e) => keys.delete(e.key));

// ---------------------------------------------------------------- boucle

/** Un pas de simulation de dt secondes (logique seule, sans rendu). */
function tick(dt) {
  let moved = drill.update(dt * state.timeScale);
  let msg = '';
  // surpresseur : poulie du moteur et volant
  if (state.compressor) {
    rig.set('sheave', v('sheave') - SPEEDS.sheave * dt);
    rig.set('flywheel', v('flywheel') - SPEEDS.sheave * RATIO * dt);
    moved = true;
  }

  // cycle de forage engagé : il pilote seul ; les consignes manuelles suivent la pose
  if (drill.engaged()) {
    if (state.jog.size || state.drive || state.stages || keys.size) msg = LOCKED;
    stopManual();
    state.keySteer = false;
    if (msg) flash(msg);
    return moved;
  }

  // braquage au clavier (← à gauche, → à droite)
  const steerKey = (keys.has('ArrowLeft') ? 1 : 0) - (keys.has('ArrowRight') ? 1 : 0);
  if (steerKey) { state.jog.set('front', steerKey); state.keySteer = true; } else if (state.keySteer) {
    state.keySteer = false;
    state.jog.delete('front');
    state.target.set('front', v('front'));
  }

  // commandes à consigne
  for (const it of items) {
    const jog = state.jog.get(it.id);
    const [lo, hi] = range(it);
    // (le bouton + augmente la valeur affichée, même si l'échelle d'affichage est négative)
    if (jog) state.target.set(it.id, Math.min(hi, Math.max(lo, valueOf(it) + jog * Math.sign(it.scale) * it.speed * dt * 1.5)));
    const cur = valueOf(it);
    const tgt = state.target.get(it.id);
    const d = tgt - cur;
    if (Math.abs(d) < 1e-6) continue;
    const dir = Math.sign(d);
    const why = blocked(it.id, dir);
    if (why) { msg = why; state.target.set(it.id, cur); continue; }
    // la tête de rotation descend au plus jusqu'au marteau rangé dans le centreur
    const floor = it.id === 'feed' ? drill.feedFloor() : -Infinity;
    if (dir < 0 && cur <= floor + 1e-6) { msg = 'Tête en butée sur le marteau rangé dans le centreur.'; state.target.set(it.id, cur); continue; }
    const nv = Math.max(floor, cur + dir * Math.min(Math.abs(d), it.speed * dt));
    const before = groundClearance(rig);
    bodiesOf(it).forEach((b) => rig.set(b, nv));
    const after = groundClearance(rig);
    if (after < -0.002 && after < before) {
      // contact au sol : on s'arrête là
      bodiesOf(it).forEach((b) => rig.set(b, cur));
      state.target.set(it.id, cur);
      msg = `${it.label} : contact au sol.`;
      continue;
    }
    moved = true;
  }

  // carrousel (indexage à vitesse limitée)
  {
    const cur = v('carousel'), d = state.carousel.target - cur;
    if (Math.abs(d) > 1e-5) { rig.set('carousel', cur + Math.sign(d) * Math.min(Math.abs(d), SPEEDS.carousel * dt)); moved = true; }
  }
  // broche
  if (state.rpm) { rig.set('spin', v('spin') + (state.rpm * 2 * Math.PI / 60) * dt); moved = true; }
  // translation
  const driveCmd = state.drive || ((keys.has('ArrowUp') ? 1 : 0) - (keys.has('ArrowDown') ? 1 : 0));
  if (driveCmd) {
    const why = blocked('drive');
    if (why) msg = why;
    else {
      const p0 = new THREE.Vector3(state.pose.x, 0, state.pose.z);
      const ds = driveStep(state.pose, v('front'), driveCmd * SPEEDS.drive * dt);
      for (const w of ['wFL', 'wFR', 'wRL', 'wRR']) rig.set(w, v(w) - ds / WHEEL_R);
      rig.set('reel', v('reel') + ds / REEL_DRUM);
      model.root.position.set(state.pose.x, 0, state.pose.z);
      model.root.rotation.y = state.pose.heading;
      const delta = new THREE.Vector3(state.pose.x, 0, state.pose.z).sub(p0);
      if (state.follow) { viewer.camera.position.add(delta); viewer.controls.target.add(delta); }
      viewer.grid.position.set(grid0.x + state.pose.x, grid0.y, grid0.z + state.pose.z);
      viewer.grid.material.uniforms.uCenter.value.set(grid0.x + state.pose.x, grid0.z + state.pose.z);
      moved = true;
    }
  }

  // étapes d'une position prédéfinie : une étape est finie quand ses commandes sont
  // arrêtées (consigne atteinte, ou arrêtée au contact du sol ou par un verrouillage)
  if (state.stages) {
    const st = state.stages[0];
    const done = Object.keys(st).every((id) => Math.abs(valueOf(items.find((i) => i.id === id)) - state.target.get(id)) < 1e-4);
    if (done) { state.stages.shift(); applyStage(); }
  }

  if (msg) flash(msg);
  return moved;
}

let last = performance.now();
let uiLast = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (tick(dt) || rig.dirty) { rig.apply(); drill.place(); viewer.invalidate(true); }
  if (now - uiLast > 100) { uiLast = now; refreshUI(); }
  requestAnimationFrame(frame);
}

/** Avance la simulation de t secondes d'un coup (essais automatisés). */
function advance(t, dt = 1 / 60) {
  for (let k = 0; k < Math.round(t / dt); k++) tick(dt);
  rig.apply();
  drill.place();
  viewer.invalidate(true);
  refreshUI();
}

function refreshUI() {
  for (const it of items) {
    const x = valueOf(it);
    $(`#o-${it.id}`).textContent = `${(x * it.scale).toFixed(it.digits)} ${it.unit}`;
    const r = $(`#r-${it.id}`);
    if (document.activeElement !== r) r.value = x * it.scale;
  }
  const busy = drill.engaged();
  const ds = drill.state;
  $('#o-index').textContent = `${state.carousel.index + 1} / 17`;
  $('#o-rpm').textContent = `${busy ? Math.abs(ds.rpm) : state.rpm} tr/min`;
  if (busy) $('#r-rpm').value = Math.abs(ds.rpm);
  document.querySelectorAll('.ctl[data-id] input, .ctl[data-id] .jog, #r-rpm, [data-preset], [data-drive], [data-index]').forEach((el) => { el.disabled = busy; });
  // cycle de forage
  const n = drill.inHole();
  $('#d-car').textContent = `${drill.inCarousel()} tiges / 17`;
  $('#d-hole').textContent = ds.string.length ? `marteau${n ? ` + ${n} tige${n > 1 ? 's' : ''}` : ''}` : '—';
  $('#d-depth').textContent = `${ds.depth.toFixed(2).replace('.', ',')} m${ds.holes.length > 1 ? ` (trou ${ds.holes.length})` : ''}`;
  const sec = Math.floor(ds.time);
  $('#d-time').textContent = `${Math.floor(sec / 60)} min ${String(sec % 60).padStart(2, '0')} s`;
  $('#d-step').textContent = ds.running ? `${ds.paused ? 'En pause — ' : ''}${drill.current()}` : (ds.started ? 'Marteau dans le trou, train tenu par la plaque à coins.' : 'Marteau rangé dans le centreur.');
  $('#d-step').classList.toggle('on', ds.running && !ds.paused);
  const idle = !ds.running;
  $('[data-drill="collar"]').disabled = !idle || ds.started;
  $('[data-drill="add"]').disabled = !idle || !ds.started || !drill.inCarousel();
  $('[data-drill="pull"]').disabled = !idle || !ds.started;
  $('#d-pause').disabled = idle;
  $('#d-pause').textContent = ds.paused ? 'Reprendre' : 'Pause';
  $('#d-reset').disabled = ds.running && !ds.paused;
  const log = ds.log.slice(-6).reverse();
  const key = `${ds.log.length}:${log[0] || ''}`;
  if (key !== refreshUI.logKey) { refreshUI.logKey = key; $('#d-log').innerHTML = log.map((l) => `<li>${esc(l)}</li>`).join(''); }
  for (const r of rig.rams) {
    const k = (r.L - r.Lmin) / (r.Lmax - r.Lmin || 1);
    $(`#L-${r.id}`).textContent = `${Math.round(r.L * 1000)} mm`;
    $(`#g-${r.id}`).style.width = `${Math.round(Math.min(1, Math.max(0, k)) * 100)}%`;
  }
  const deg = (x) => `${(x * 180 / Math.PI).toFixed(0)}°`;
  $('#pose').textContent = `x ${state.pose.x.toFixed(2)} m · z ${state.pose.z.toFixed(2)} m · cap ${deg(state.pose.heading)}`;
  $('#status').textContent = performance.now() - state.msgT < 2500 ? state.msg : '';
}

// ---------------------------------------------------------------- survol : nom de la pièce

let data = null;
fetch('equipment/du311-std/data.json').then((r) => r.json()).then((d) => { data = d; }).catch(() => {});
function showHover(path) {
  const el = $('#hover');
  if (!path || !data) { el.hidden = true; return; }
  let asm = data.assemblies.P010, row = null;
  for (const ref of path) {
    row = asm?.parts.find((p) => String(p[0]) === ref);
    asm = row?.[4]?.link ? data.assemblies[row[4].link] : null;
  }
  if (!row) { el.hidden = true; return; }
  el.textContent = `${path.join(' › ')} — ${row[3]} (${row[1]})`;
  el.hidden = false;
}

buildPanel();
refreshUI();
requestAnimationFrame(frame);
// Accès pour les essais automatisés (page de développement seulement).
window.__sim = { rig, viewer, state, drill, startPreset, startDrilling, resetDrilling, indexCarousel, stopAll, advance };

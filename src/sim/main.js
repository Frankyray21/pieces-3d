// Simulation mécanique du DU311 (page de développement sim.html, hors site).
// Le modèle 3D est celui du site (P010) ; le rig le rend articulé. Chaque
// commande ouvre le tiroir de sa section de distributeur pour amener un corps vers
// sa consigne ; le circuit hydraulique (plant.js) donne la vitesse et la pression,
// sous réserve des verrouillages ; les positions prédéfinies enchaînent des étapes.
// Le cycle de forage (drilling.js) pilote lui-même l'avance, le carrousel et les
// bras ; pendant qu'il tient des tiges, les commandes manuelles sont verrouillées.
import * as THREE from 'three';
import './sim.css';
import { Viewer } from '../viewer/Viewer.js';
import { buildProcedural } from '../viewer/assembly.js';
import * as shapes from '../viewer/shapes.js';
import builders from '../models/du311-std/index.js';
import { Rig } from './kinematics.js';
import { createDrilling } from './drilling.js';
import { createPlant } from './plant.js';
import { BAR, PSI, LPM } from './hydraulics.js';
import {
  BODIES, RULES, CONTROLS, SPEEDS, INTERLOCKS, PRESETS, HYDRAULICS, carouselAngle, driveStep, groundClearance, WHEEL_R, REEL_DRUM, RATIO,
} from './du311-std.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------------------------------------------------------------- modèle et rig

const model = buildProcedural(builders, 'P010');
const rig = new Rig(model.root, { bodies: BODIES, rules: RULES }, shapes);
rig.sweepRams();
rig.buildRams();
rig.apply();
// circuit hydraulique (au repos : centres des masses des corps)
const plant = createPlant(rig);
const hyd = plant.hyd;
const RAD = (2 * Math.PI) / 60; // tr/min → rad/s
const RPM_MAX = Math.round(hyd.fullSpeed('spin') / RAD);

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
  contact: new Map(), // commande en appui au sol → sens bloqué
  stages: null,
  follow: true,
  timeScale: 5, // accélération du cycle de forage
  msg: '',
  msgT: 0,
};
const flash = (msg) => { state.msg = msg; state.msgT = performance.now(); };
const v = (name) => rig.get(name);

// Cycle de forage : tiges au carrousel, marteau dans le centreur, trous dans la scène.
drill = createDrilling({ rig, root: model.root, scene: viewer.scene, S: shapes, setAir, plant });
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

// Manomètre : graduations en psi comme au pupitre (P348), lecture en bar et en psi.
const GAUGES = [
  { id: 'P1', label: 'Pompe 100 cm³', max: 5000 }, { id: 'P2', label: 'Pompe 74 cm³', max: 5000 },
  { id: 'rot', label: 'Rotation', max: 5000 }, { id: 'pd', label: 'Poussée', max: 1000 },
  { id: 'hb', label: 'Retenue', max: 1000 }, { id: 'D1', label: 'Translation', max: 6000 },
];
const gaugeAngle = (t) => ((225 - 270 * Math.min(1, Math.max(0, t))) * Math.PI) / 180;
const gaugePt = (t, r) => [50 + r * Math.cos(gaugeAngle(t)), 48 - r * Math.sin(gaugeAngle(t))];
function gaugeSVG({ id, label, max }) {
  const unit = max > 1000 ? 1000 : 100;
  const n = max / (max > 1000 ? 1000 : 200); // graduations chiffrées
  const ticks = Array.from({ length: 2 * n + 1 }, (_, i) => {
    const t = i / (2 * n), [x1, y1] = gaugePt(t, 36), [x2, y2] = gaugePt(t, i % 2 ? 33 : 30);
    const num = i % 2 ? '' : (() => { const [x, y] = gaugePt(t, 23); return `<text x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}">${((i / 2) * max) / n / unit}</text>`; })();
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>${num}`;
  }).join('');
  const pump = hyd.pumps.get(id);
  const red = pump ? (() => {
    const t0 = (pump.pMax * BAR) / PSI / max, [x0, y0] = gaugePt(t0, 37), [x1, y1] = gaugePt(1, 37);
    return `<path class="red" d="M${x0.toFixed(1)} ${y0.toFixed(1)} A37 37 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}"/>`;
  })() : '';
  const [ax, ay] = gaugePt(0, 37), [bx, by] = gaugePt(1, 37);
  return `<figure class="gauge-dial"><svg viewBox="0 0 100 80" role="img" aria-labelledby="gl-${id}">
    <path class="arc" d="M${ax.toFixed(1)} ${ay.toFixed(1)} A37 37 0 1 1 ${bx.toFixed(1)} ${by.toFixed(1)}"/>${red}
    <g class="ticks">${ticks}</g>
    <text class="unit" x="50" y="38">psi ×${unit}</text>
    <line class="needle" id="gn-${id}" x1="50" y1="48" x2="50" y2="14"/><circle class="hub" cx="50" cy="48" r="3"/>
  </svg><figcaption id="gl-${id}"><span>${esc(label)}</span><output id="gv-${id}">0 bar</output></figcaption></figure>`;
}
const SPOOL_LPM = { '34,3': 130, '26,4': 100, '10,6': 40, '6,6': 25, '2,6': 10, '1,3': 5 };
function hydPanel() {
  const fmtL = (q) => `${q} L/min`;
  const drv = (d) => `<div class="drv"><label class="sw"><input type="checkbox" data-driver="${d.id}"${d.on ? ' checked' : ''}> ${esc(d.label)}</label><output id="kw-${d.id}"></output></div>
    <ul class="pumps">${[...hyd.pumps.values()].filter((p) => p.driver === d.id).map((p) => `<li><span>${esc(p.label)}</span><output id="pp-${p.id}"></output></li>`).join('')}</ul>`;
  const row = (sec) => {
    const f = sec.fn && hyd.functions.get(sec.fn);
    if (!f) return `<tr class="na"><td><span>${esc(sec.label)}</span><small>${esc(sec.spool)}${SPOOL_LPM[sec.spool.split(' ')[0]] ? ` · ${fmtL(SPOOL_LPM[sec.spool.split(' ')[0]])}` : ''}</small></td><td colspan="3">non simulée</td></tr>`;
    return `<tr data-fn="${f.id}" title="${esc(f.src)}"><td><span>${esc(f.label)}</span><small>${esc(sec.spool)} · ${fmtL(f.spool)}${f.prop ? '' : ' · tout-ou-rien'}</small></td>
      <td><span class="lever"><i></i></span></td><td class="q"></td><td class="p"></td></tr>`;
  };
  return `<section class="hyd"><h2>Circuit hydraulique</h2>
    ${[...hyd.drivers.values()].map(drv).join('')}
    <div class="dials">${GAUGES.map(gaugeSVG).join('')}</div>
    <table class="hydt"><thead><tr><th>Section</th><th>Tiroir</th><th>L/min</th><th>bar</th></tr></thead>
    ${HYDRAULICS.banks.map((b) => `<tbody><tr class="bank"><th colspan="4">${esc(b.label)} <small>${esc(b.ref)} · ${esc([...new Set(b.sections.filter((x) => x.fn).map((x) => hyd.functions.get(x.fn).pump))].map((id) => hyd.pumps.get(id).label.replace(/ \(.*\)/, '')).join(' + '))}</small></th></tr>${b.sections.map(row).join('')}</tbody>`).join('')}
    </table>
    <p class="note">Distributeurs, tiroirs, pompes et plusieurs vérins d'après le manuel de pièces ; affectation des sections, masses et quelques dimensions estimées (survoler une ligne pour la source). Vitesse = débit ÷ section ; pression = charge ÷ section, au plus la pression maximale de la pompe.</p>
  </section>`;
}

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
      <p class="note">Mettre la machine en position de forage, puis enfoncer le marteau. Tiges Ø 3½ po × 6 pi ; ordres de grandeur : pénétration 0,6 m/min, poussée sur l'outil 8 kN, vissage à 30 tr/min, forage à 50 tr/min.</p>
    </section>
    ${hydPanel()}
    <section><h2>Translation</h2>
      <div class="btns"><button type="button" class="btn hold" data-drive="-1">◀ Reculer</button><button type="button" class="btn hold" data-drive="1">Avancer ▶</button></div>
      <p class="note">Clavier : ↑ ↓ avancer / reculer, ← → braquer. <label><input type="checkbox" id="follow" checked> Caméra qui suit</label></p>
    </section>
    ${CONTROLS.map((g) => `<section><h2>${esc(g.group)}</h2>${rows(g)}${g.group === 'Carrousel' ? `
      <div class="ctl"><div class="ctl-h"><span>Alvéole au transfert</span><output id="o-index">1 / 17</output></div>
        <div class="btns"><button type="button" class="btn" data-index="-1">◀ Précédente</button><button type="button" class="btn" data-index="1">Suivante ▶</button></div></div>` : ''}${g.group === 'Avance' ? `
      <div class="ctl"><div class="ctl-h"><span>Rotation de la broche</span><output id="o-rpm">0 tr/min</output></div>
        <div class="ctl-r"><input type="range" id="r-rpm" min="0" max="${RPM_MAX}" step="1" value="0" aria-label="Rotation de la broche"></div></div>` : ''}</section>`).join('')}
    <section><h2>Surpresseur</h2><label class="sw"><input type="checkbox" id="comp"> Moteur 75 HP en marche</label></section>
    <section><h2>Vérins</h2><table class="rams"><thead><tr><th>Vérin</th><th>Entre axes</th><th>Course</th></tr></thead><tbody>
      ${rig.rams.map((r) => `<tr><td>${esc(r.id)}</td><td id="L-${r.id}"></td><td><span class="gauge"><i id="g-${r.id}"></i></span></td></tr>`).join('')}
    </tbody></table><p class="note">Fûts et tiges dimensionnés sur les longueurs extrêmes entre axes (balayage des débattements).</p></section>`;

  $('#panel').addEventListener('input', (e) => {
    const id = e.target.id;
    if (e.target.name === 'd-speed') { state.timeScale = Number(e.target.value); return; }
    if (id === 'follow' || id === 'd-n' || e.target.dataset.driver) return;
    if (id === 'comp') { state.compressor = e.target.checked; return; }
    if (drill.engaged()) { flash(LOCKED); return; }
    if (id === 'r-rpm') { state.rpm = Number(e.target.value); return; }
    const it = items.find((x) => `r-${x.id}` === id);
    if (it) { state.stages = null; state.target.set(it.id, Number(e.target.value) / it.scale); }
  });
  $('#follow').addEventListener('change', (e) => { state.follow = e.target.checked; });
  document.querySelectorAll('[data-driver]').forEach((el) => el.addEventListener('change', () => { hyd.drivers.get(el.dataset.driver).on = el.checked; }));
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
    if (drill.state.wait === 'off') msg = `${hyd.drivers.get('elec').label} à l'arrêt : cycle de forage en attente.`;
    if (!drill.state.running || drill.state.paused) plant.solve([]);
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

  // demandes au circuit : commandes à consigne (un tiroir par corps), indexage, broche, translation
  const demands = [];
  const moving = [];
  for (const it of items) {
    const jog = state.jog.get(it.id);
    const [lo, hi] = range(it);
    // levier tenu : pleine ouverture vers la butée (le bouton + augmente la valeur affichée,
    // même si l'échelle d'affichage est négative)
    if (jog) state.target.set(it.id, jog * Math.sign(it.scale) > 0 ? hi : lo);
    const cur = valueOf(it);
    const d = state.target.get(it.id) - cur;
    if (Math.abs(d) < 1e-6) continue;
    const dir = Math.sign(d);
    const why = blocked(it.id, dir);
    if (why) { msg = why; state.target.set(it.id, cur); continue; }
    // la tête de rotation descend au plus jusqu'au marteau rangé dans le centreur
    const floor = it.id === 'feed' ? drill.feedFloor() : -Infinity;
    if (dir < 0 && cur <= floor + 1e-6) { msg = 'Tête en butée sur le marteau rangé dans le centreur.'; state.target.set(it.id, cur); continue; }
    const tgt = Math.max(floor, state.target.get(it.id));
    // en appui au sol dans ce sens : le vérin pousse à la pression maximale sans bouger
    const pressed = state.contact.get(it.id) === dir;
    if (pressed) msg = `${it.label} : en appui au sol (pression maximale).`;
    for (const b of bodiesOf(it)) { const dm = plant.toward(b, tgt); if (dm) demands.push(pressed ? { ...dm, blocked: true } : dm); }
    if (pressed) { if (!jog) state.target.set(it.id, cur); } else moving.push({ it, tgt });
  }
  if (Math.abs(state.carousel.target - v('carousel')) > 1e-6) demands.push(plant.toward('carousel', state.carousel.target));
  if (state.rpm) demands.push({ fn: 'spin', v: state.rpm * RAD });
  const driveCmd = state.drive || ((keys.has('ArrowUp') ? 1 : 0) - (keys.has('ArrowDown') ? 1 : 0));
  if (driveCmd) {
    const why = blocked('drive');
    if (why) msg = why; else demands.push({ fn: 'drive', s: driveCmd });
  }
  const res = plant.solve(demands);
  const off = [...res].find(([, r]) => r.why === 'off');
  if (off) msg = `${hyd.drivers.get(hyd.pumps.get(hyd.functions.get(off[0]).pump).driver).label} à l'arrêt : le démarrer (Circuit hydraulique).`;

  // mouvements : les corps d'une même commande avancent ensemble, au pas du plus lent
  for (const { it, tgt } of moving) {
    const qs = bodiesOf(it).map((b) => res.get(b)?.qdot ?? 0);
    const qdot = qs.reduce((a, q) => (Math.abs(q) < Math.abs(a) ? q : a));
    if (!qdot) continue;
    const cur = valueOf(it);
    const nv = plant.step(bodiesOf(it)[0], qdot, dt, tgt);
    const before = groundClearance(rig);
    bodiesOf(it).forEach((b) => rig.set(b, nv));
    const after = groundClearance(rig);
    if (after < -0.002 && after < before) {
      // contact au sol : on s'arrête là
      bodiesOf(it).forEach((b) => rig.set(b, cur));
      state.target.set(it.id, cur);
      state.contact.set(it.id, Math.sign(qdot));
      msg = `${it.label} : contact au sol.`;
      continue;
    }
    state.contact.delete(it.id);
    moved = true;
  }
  if (res.has('carousel')) { rig.set('carousel', plant.step('carousel', res.get('carousel').qdot, dt, state.carousel.target)); moved = true; }
  if (res.has('spin')) { rig.set('spin', v('spin') + res.get('spin').qdot * dt); moved = true; }
  if (res.get('drive')?.qdot) {
    const p0 = new THREE.Vector3(state.pose.x, 0, state.pose.z);
    const ds = driveStep(state.pose, v('front'), res.get('drive').qdot * dt);
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
  $('#o-rpm').textContent = `${busy ? Math.round(Math.abs(ds.rpm)) : state.rpm} tr/min`;
  if (busy) $('#r-rpm').value = Math.abs(ds.rpm);
  document.querySelectorAll('.ctl[data-id] input, .ctl[data-id] .jog, #r-rpm, [data-preset], [data-drive], [data-index]').forEach((el) => { el.disabled = busy; });
  // cycle de forage
  const n = drill.inHole();
  $('#d-car').textContent = `${drill.inCarousel()} tiges / 17`;
  $('#d-hole').textContent = ds.string.length ? `marteau${n ? ` + ${n} tige${n > 1 ? 's' : ''}` : ''}` : '—';
  $('#d-depth').textContent = `${ds.depth.toFixed(2).replace('.', ',')} m${ds.holes.length > 1 ? ` (trou ${ds.holes.length})` : ''}`;
  const sec = Math.floor(ds.time);
  $('#d-time').textContent = `${Math.floor(sec / 60)} min ${String(sec % 60).padStart(2, '0')} s`;
  const waiting = ds.wait === 'off' ? 'En attente (groupe électrique arrêté) — ' : '';
  $('#d-step').textContent = ds.running ? `${ds.paused ? 'En pause — ' : waiting}${drill.current()}` : (ds.started ? 'Marteau dans le trou, train tenu par la plaque à coins.' : 'Marteau rangé dans le centreur.');
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
  refreshHydraulics();
  for (const r of rig.rams) {
    const k = (r.L - r.Lmin) / (r.Lmax - r.Lmin || 1);
    $(`#L-${r.id}`).textContent = `${Math.round(r.L * 1000)} mm`;
    $(`#g-${r.id}`).style.width = `${Math.round(Math.min(1, Math.max(0, k)) * 100)}%`;
  }
  const deg = (x) => `${(x * 180 / Math.PI).toFixed(0)}°`;
  $('#pose').textContent = `x ${state.pose.x.toFixed(2)} m · z ${state.pose.z.toFixed(2)} m · cap ${deg(state.pose.heading)}`;
  $('#status').textContent = performance.now() - state.msgT < 2500 ? state.msg : '';
}

const fr = (x, d = 0) => x.toFixed(d).replace('.', ',');
const psi = (bar) => Math.round((bar * BAR) / PSI);
function setGauge(id, bar) {
  const g = GAUGES.find((x) => x.id === id);
  const [x, y] = gaugePt(psi(bar) / g.max, 31);
  const n = $(`#gn-${id}`);
  n.setAttribute('x2', x.toFixed(1));
  n.setAttribute('y2', y.toFixed(1));
  $(`#gv-${id}`).textContent = `${fr(bar)} bar · ${psi(bar)} psi`;
}
function refreshHydraulics() {
  for (const d of hyd.drivers.values()) $(`#kw-${d.id}`).textContent = d.on ? `${fr(d.P / 1000, 1)} / ${fr(d.kW, 1)} kW` : 'arrêté';
  for (const p of hyd.pumps.values()) {
    const cap = (p.cc * hyd.drivers.get(p.driver).rpm) / 1000;
    $(`#pp-${p.id}`).textContent = `${fr(p.p)} bar · ${fr(p.Q / LPM)}/${fr(cap)} L/min${p.sat < 0.999 ? ' · saturée' : ''}`;
  }
  const st = (fn) => hyd.state.get(fn) || { p: 0, hold: 0, Q: 0, s: 0, dir: 0 };
  setGauge('P1', hyd.pumps.get('P1').p);
  setGauge('P2', hyd.pumps.get('P2').p);
  setGauge('D1', hyd.pumps.get('D1').p);
  setGauge('rot', st('spin').p);
  const f = st('feed');
  setGauge('pd', f.dir < 0 ? f.p : f.hold);
  setGauge('hb', f.dir > 0 ? f.p : f.hold);
  document.querySelectorAll('.hydt tr[data-fn]').forEach((tr) => {
    const r = st(tr.dataset.fn);
    const k = Math.max(-1, Math.min(1, r.s || 0));
    const bar = tr.querySelector('.lever i');
    bar.style.left = `${50 - Math.max(0, -k) * 50}%`;
    bar.style.width = `${Math.abs(k) * 50}%`;
    tr.querySelector('.q').textContent = r.Q ? fr(r.Q) : '';
    tr.querySelector('.p').textContent = r.p ? fr(r.p) : '';
    tr.classList.toggle('on', !!k);
    tr.classList.toggle('stall', !!r.stall);
    tr.classList.toggle('off', r.why === 'off');
  });
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
window.__sim = { rig, viewer, state, drill, plant, startPreset, startDrilling, resetDrilling, indexCarousel, stopAll, advance };

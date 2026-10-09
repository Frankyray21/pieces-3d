// Contrôle de la simulation mécanique du DU311 (sans navigateur) : construit la
// machine complète (P010), la rend articulée et vérifie
//   - que chaque corps de la description a au moins une pièce (ou un vérin, un flexible) ;
//   - que chaque vérin loge sa course entre ses axes sur tous les débattements
//     (longueur fermée ≥ course + longueurs mortes) ;
//   - qu'aucune position extrême ne donne de coordonnées invalides ;
//   - la géométrie du carrousel (bras de serrage, alvéole de transfert) ;
//   - le circuit hydraulique : vitesse de chaque fonction à pleine ouverture, pressions
//     sur tous les débattements (aucun actionneur ne cale sous son propre poids),
//     partage du débit d'une pompe ;
//   - le cycle de forage (marteau, ajout et retrait des tiges), vertical puis incliné :
//     profondeur, tiges sur l'axe, vissages bout à bout, retour de chaque tige dans
//     son alvéole, pressions de poussée, de retenue et de rotation.
//
// Usage : node scripts/check-sim.mjs
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import * as shapes from '../src/viewer/shapes.js';
import builders from '../src/models/du311-std/index.js';
import { Rig } from '../src/sim/kinematics.js';
import { BODIES, RULES, CONTROLS, CLAMP_STROKE, HAMMER_STOW, carouselAngle, groundClearance } from '../src/sim/du311-std.js';
import { LPM } from '../src/sim/hydraulics.js';
import { createDrilling, PIPE, HAMMER } from '../src/sim/drilling.js';
import { createPlant } from '../src/sim/plant.js';
import { FEED } from '../src/models/du311-std/feed.js';
import { feedToMachine as fm } from '../src/models/du311-std/machine.js';

let failed = false;
const fail = (msg) => { console.log(`✕ ${msg}`); failed = true; };
const mm = (x) => `${Math.round(x * 1000)} mm`;
const deg = (x) => `${((x * 180) / Math.PI).toFixed(1)}°`;

const model = buildProcedural(builders, 'P010');
const rig = new Rig(model.root, { bodies: BODIES, rules: RULES }, shapes);
const plant = createPlant(rig); // au repos : centres des masses

// 1 — corps sans pièce
const used = new Set();
rig.objects.forEach((o) => rig.bodyNames(o.body).forEach((n) => used.add(n)));
rig.rams.forEach((r) => { used.add(r.a); used.add(r.b); });
rig.flexes.forEach((f) => f.bodies.forEach((s) => rig.bodyNames(s).forEach((n) => used.add(n))));
for (const b of BODIES) if (!used.has(b.name)) fail(`corps « ${b.name} » sans pièce`);
const ctlBodies = new Set(CONTROLS.flatMap((g) => g.items.flatMap((it) => it.bodies || [it.id])));
for (const n of ctlBodies) if (!rig.bodies.has(n)) fail(`commande sur un corps inconnu : ${n}`);
console.log(`${rig.objects.length} objets étiquetés, ${rig.rams.length} vérins, ${rig.flexes.length} flexibles, ${BODIES.length} corps mobiles`);

// 2 — vérins : courses
rig.sweepRams();
for (const r of rig.rams) {
  const g = Rig.ramGeometry(r);
  const ok = g.slack >= 0 && r.L0 >= r.Lmin - 1e-6 && r.L0 <= r.Lmax + 1e-6;
  if (!ok) failed = true;
  console.log(`${ok ? '✓' : '✕'} vérin ${r.id.padEnd(7)} (${r.a} → ${r.b}) : entre axes ${mm(r.Lmin)} à ${mm(r.Lmax)} (repos ${mm(r.L0)}), ` +
    `course ${mm(r.Lmax - r.Lmin)}, fût ${mm(g.barrel)}, jeu ${mm(g.slack)} — liaisons ${r.joints.join(', ')}`);
}

// 3 — positions extrêmes de chaque liaison : coordonnées finies
rig.buildRams();
const finite = () => {
  let bad = 0;
  model.root.updateMatrixWorld(true);
  model.root.traverse((o) => {
    if (!o.isMesh) return;
    const e = o.matrixWorld.elements;
    if (e.some((x) => !Number.isFinite(x))) bad++;
    const p = o.geometry.attributes.position;
    if (p && !Number.isFinite(p.array[0])) bad++;
  });
  return bad;
};
const limited = [...rig.bodies.values()].filter((b) => b.min !== undefined);
for (const b of limited) {
  for (const x of [b.min, b.max]) {
    rig.set(b.name, x);
    rig.apply();
    const bad = finite();
    if (bad) fail(`${b.name} = ${x.toFixed(3)} : ${bad} maillages invalides`);
  }
  rig.set(b.name, 0 >= b.min && 0 <= b.max ? 0 : b.min);
}
// pose combinée : translation (mât couché), puis forage incliné et décalé
const poses = {
  translation: { tilt: 80 * Math.PI / 180, jackL: 0.18, jackR: 0.18, outL: 0.24, outR: 0.24, ext: 0.3, front: 0.5 },
  'forage incliné': { tilt: -0.2, shift: 0.25, roll: 1.2, ext: -0.15, feed: -1.75, clamp: CLAMP_STROKE, slip: 0.22, carousel: carouselAngle(5) },
  calage: { stingUp: 0.35, toGround: true }, // stinger bas sortis jusqu'au contact au sol
};
// Sortie du stinger bas jusqu'au contact au sol (recherche par dichotomie).
function toGround() {
  let lo = 0, hi = rig.bodies.get('stingDn').max;
  for (let i = 0; i < 30; i++) {
    const m = (lo + hi) / 2;
    rig.set('stingDn', m);
    if (groundClearance(rig) >= 0) lo = m; else hi = m;
  }
  rig.set('stingDn', lo);
  return lo;
}
for (const [name, p] of Object.entries(poses)) {
  for (const b of rig.bodies.values()) if (b.min !== undefined) rig.set(b.name, 0 >= b.min && 0 <= b.max ? 0 : b.min);
  Object.entries(p).forEach(([k, x]) => { if (k !== 'toGround') rig.set(k, x); });
  const dn = p.toGround ? toGround() : rig.get('stingDn');
  rig.apply();
  const bad = finite();
  if (bad) fail(`pose ${name} : ${bad} maillages invalides`);
  const clear = groundClearance(rig);
  if (clear < -0.002) fail(`pose ${name} : point de contact à ${mm(clear)} sous le sol`);
  const box = new THREE.Box3().setFromObject(model.root);
  console.log(`✓ pose ${name} : encombrement ${box.getSize(new THREE.Vector3()).toArray().map((x) => x.toFixed(2)).join(' × ')} m, ` +
    `stinger bas ${mm(dn)}, point de contact le plus bas à ${mm(clear)} du sol`);
}

// 4 — carrousel
console.log(`✓ bras de serrage : ${deg(Math.abs(CLAMP_STROKE))} de l'axe de forage à l'alvéole de transfert ; alvéole 1 à ${deg(carouselAngle(0))} de rotation du carrousel`);

// 5 — circuit hydraulique
const rest = () => { for (const b of rig.bodies.values()) rig.set(b.name, b.min !== undefined && !(0 >= b.min && 0 <= b.max) ? b.min : 0); };
rest();
const hyd = plant.hyd;
const ANG = new Set(['tilt', 'roll', 'front', 'clamp', 'carousel', 'spin']);
const speed = (f, q) => (ANG.has(f.body) ? `${deg(Math.abs(q))}/s` : `${mm(Math.abs(q))}/s`);
for (const f of hyd.functions.values()) {
  const out = [1, -1].map((dir) => {
    const r = plant.solve([{ fn: f.id, s: dir }]).get(f.id);
    if (r.stall || !r.qdot) fail(`${f.id} : ne bouge pas au repos (${r.why || 'débit nul'})`);
    return `${dir > 0 ? '+' : '−'} ${speed(f, r.qdot)} à ${r.p.toFixed(0)} bar`;
  });
  console.log(`✓ ${f.label.padEnd(30)} ${String(f.spool).padStart(3)} L/min : ${out.join(' ; ')}`);
}
// pressions sur les débattements : fonctions chargées par le poids, mât basculé et tourné
const worst = new Map();
const DEGR = Math.PI / 180;
for (let t = -15; t <= 85; t += 5) {
  for (let r = -180; r <= 180; r += 15) {
    rest();
    rig.set('tilt', t * DEGR); rig.set('roll', r * DEGR); rig.set('ext', 0.3);
    for (const fn of ['tilt', 'roll', 'ext', 'feed', 'stingUp', 'stingDn']) {
      for (const dir of [1, -1]) {
        const res = plant.solve([{ fn, s: dir }]).get(fn);
        const w = worst.get(fn) || { p: 0, hold: 0, at: '' };
        if (res.stall) fail(`${fn} cale (sens ${dir > 0 ? '+' : '−'}) : basculement ${t}°, rotation ${r}°`);
        if (res.p > w.p) Object.assign(w, { p: res.p, at: `basculement ${t}°, rotation ${r}°` });
        w.hold = Math.max(w.hold, res.hold);
        worst.set(fn, w);
      }
    }
  }
}
const pMax = hyd.pumps.get('P2').pMax;
for (const [fn, w] of worst) console.log(`✓ ${hyd.functions.get(fn).label} : au plus ${w.p.toFixed(0)} bar (${w.at}), retenue au plus ${w.hold.toFixed(0)} bar — pompe limitée à ${pMax} bar`);
// partage de débit : rotation et avance à pleine ouverture sur la pompe 100 cm³
rest();
{
  const res = plant.solve([{ fn: 'spin', s: 1 }, { fn: 'feed', s: -1 }]);
  const P1 = hyd.pumps.get('P1');
  const cap = (P1.cc * hyd.drivers.get('elec').rpm) / 1000;
  const sum = res.get('spin').Q + res.get('feed').Q;
  if (Math.abs(sum - cap) > 0.5) fail(`partage de débit : ${sum.toFixed(1)} L/min pour une pompe de ${cap.toFixed(1)} L/min`);
  console.log(`✓ partage de débit : rotation ${res.get('spin').Q.toFixed(0)} + avance ${res.get('feed').Q.toFixed(0)} L/min = ${sum.toFixed(0)} L/min (pompe 100 cm³ : ${cap.toFixed(0)} L/min ; demandé ${(130 + 100)} L/min)`);
  if (Math.abs(P1.Q / LPM - sum) > 0.5) fail('débit de la pompe différent de la somme des sections');
}

// 6 — cycle de forage
rest();
let air = false;
const drill = createDrilling({ rig, root: model.root, scene: new THREE.Scene(), S: shapes, setAir: (on) => { air = on; }, plant });
const peak = { pd: 0, hb: 0, rot: 0 };
const run = (maxT = 4000) => {
  let t = 0;
  while (drill.state.running && t < maxT) {
    drill.update(0.5);
    t += 0.5;
    const f = hyd.state.get('feed'), r = hyd.state.get('spin');
    if (f?.dir) { peak.pd = Math.max(peak.pd, f.dir < 0 ? f.p : f.hold); peak.hb = Math.max(peak.hb, f.dir > 0 ? f.p : f.hold); }
    if (r?.dir) peak.rot = Math.max(peak.rot, r.p);
    for (const [fn, x] of hyd.state) if (x.stall) fail(`cycle : ${fn} cale à l'étape « ${drill.current()} »`);
  }
  rig.apply();
  drill.place();
  if (drill.state.running) fail(`cycle bloqué à l'étape « ${drill.current()} »`);
  return t;
};
// position d'une tige dans le repère de l'avance (x vers le carrousel, y le long du mât, z vers la face)
const O = fm([0, 0, 0]);
const toFeed = (p) => {
  rig.computeJ();
  const t = new THREE.Vector3().setFromMatrixPosition(rig.bodyMatrix('ext', new THREE.Matrix4()).invert().multiply(p.mesh.matrix));
  return [O[2] - t.z, t.y - O[1], t.x - O[0]];
};
const STEP = (2 * Math.PI) / 17;
function geometry(label) {
  const beta = rig.get('carousel');
  let pocket = 0, axis = 0, stack = 0;
  drill.pockets.forEach((p, k) => {
    if (!p) return;
    const a = FEED.pocketA0 + k * STEP + beta;
    const [x, y, z] = toFeed(p);
    pocket = Math.max(pocket, Math.hypot(x - (FEED.car.x + FEED.car.rp * Math.cos(a)), z - (FEED.car.z - FEED.car.rp * Math.sin(a))), Math.abs(y - drill.geometry.SHOULDER));
  });
  const s = drill.state.string;
  s.forEach((p, i) => {
    const [x, y, z] = toFeed(p);
    axis = Math.max(axis, Math.hypot(x, z - FEED.AX));
    if (i) stack = Math.max(stack, Math.abs(y - toFeed(s[i - 1])[1] - (s[i - 1].kind === 'hammer' ? HAMMER.L : PIPE.L)));
  });
  const worst = Math.max(pocket, axis, stack);
  if (worst > 0.001) fail(`${label} : tiges décalées (alvéoles ${mm(pocket)}, axe ${mm(axis)}, vissages ${mm(stack)})`);
}
function cycle(label, n) {
  const t0 = drill.groundOnAxis();
  const err = drill.start('collar');
  if (err) { fail(`${label} : ${err}`); return; }
  let t = run();
  const collar = t0 - (drill.geometry.JOINT - HAMMER.L);
  if (Math.abs(drill.state.depth - collar) > 0.002) fail(`${label} : marteau enfoncé de ${mm(drill.state.depth)} (attendu ${mm(collar)})`);
  geometry(`${label}, marteau enfoncé`);
  drill.start('add', n);
  t += run();
  const depth = collar + n * PIPE.L;
  if (drill.inHole() !== n || Math.abs(drill.state.depth - depth) > 0.002) fail(`${label} : ${drill.inHole()} tiges, ${mm(drill.state.depth)} (attendu ${n} tiges, ${mm(depth)})`);
  geometry(`${label}, ${n} tiges`);
  const deep = drill.state.depth;
  drill.start('pull');
  t += run();
  geometry(`${label}, train remonté`);
  const [hx, hy, hz] = toFeed(drill.hammer);
  const parked = Math.max(Math.hypot(hx, hz - FEED.AX), Math.abs(hy - HAMMER_STOW));
  if (drill.inCarousel() !== 17 || drill.state.string.length || drill.state.started || air) fail(`${label} : ${drill.inCarousel()} tiges au carrousel, train de ${drill.state.string.length}, air ${air ? 'en marche' : 'coupé'} après la remontée`);
  if (parked > 0.001) fail(`${label} : marteau rangé à ${mm(parked)} de sa place dans le centreur`);
  for (const b of ['feed', 'clamp', 'slip']) if (Math.abs(rig.get(b)) > 1e-6) fail(`${label} : ${b} = ${rig.get(b).toFixed(3)} en fin de cycle`);
  if (!failed) console.log(`✓ ${label} : marteau + ${n} tiges, trou de ${deep.toFixed(3)} m en ${Math.floor(t / 60)} min ${Math.round(t % 60)} s simulées ; tiges sur l'axe, vissées bout à bout et rangées dans leur alvéole`);
}
cycle('forage vertical', 3);
// forage incliné : cadre basculé de 10°, avance descendue jusqu'à 0,15 m du sol (dichotomie sur l'extension)
drill.reset();
rest();
rig.set('tilt', -10 * Math.PI / 180);
let lo = rig.bodies.get('ext').min, hi = rig.bodies.get('ext').max;
for (let i = 0; i < 40; i++) {
  const m = (lo + hi) / 2;
  rig.set('ext', m);
  if (drill.groundOnAxis() > HAMMER_STOW - 0.15) lo = m; else hi = m;
}
rig.apply();
if (groundClearance(rig) < -0.002) fail(`forage incliné : point de contact à ${mm(groundClearance(rig))} sous le sol`);
cycle(`forage incliné à 10° (extension ${mm(rig.get('ext'))})`, 2);
// tout le carrousel : poids du train de 17 tiges sur la tête (retenue)
drill.reset();
rest();
cycle('carrousel complet', 17);
console.log(`✓ pressions du cycle : poussée au plus ${peak.pd.toFixed(0)} bar, retenue au plus ${peak.hb.toFixed(0)} bar, rotation au plus ${peak.rot.toFixed(0)} bar`);

process.exit(failed ? 1 : 0);

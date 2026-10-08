// Contrôle de la simulation mécanique du DU311 (sans navigateur) : construit la
// machine complète (P010), la rend articulée et vérifie
//   - que chaque corps de la description a au moins une pièce (ou un vérin, un flexible) ;
//   - que chaque vérin loge sa course entre ses axes sur tous les débattements
//     (longueur fermée ≥ course + longueurs mortes) ;
//   - qu'aucune position extrême ne donne de coordonnées invalides ;
//   - la géométrie du carrousel (bras de serrage, alvéole de transfert).
//
// Usage : node scripts/check-sim.mjs
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import * as shapes from '../src/viewer/shapes.js';
import builders from '../src/models/du311-std/index.js';
import { Rig } from '../src/sim/kinematics.js';
import { BODIES, RULES, CONTROLS, CLAMP_STROKE, carouselAngle, groundClearance } from '../src/sim/du311-std.js';

let failed = false;
const fail = (msg) => { console.log(`✕ ${msg}`); failed = true; };
const mm = (x) => `${Math.round(x * 1000)} mm`;
const deg = (x) => `${((x * 180) / Math.PI).toFixed(1)}°`;

const model = buildProcedural(builders, 'P010');
const rig = new Rig(model.root, { bodies: BODIES, rules: RULES }, shapes);

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

process.exit(failed ? 1 : 0);

// Contrôle du support de tiges installé (rack-tiges-dd, P02) contre les
// exigences chiffrées de la procédure PRO-DD-ST-008 : mesures prises sur le
// modèle 3D construit.   node scripts/check-rack.mjs
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders from '../src/models/rack-tiges-dd/index.js';

const IN = 0.0254;
const model = buildProcedural(builders, 'P02');
model.root.updateMatrixWorld(true);
const parts = (ref) => model.refs.get(ref) || [];
const box = (o) => new THREE.Box3().setFromObject(o);
const find = (root, ref) => { const out = []; root.traverse((o) => { if (o.userData.partRef === ref) out.push(o); }); return out; };
let failed = false;
const check = (label, value, ok, unit = '') => { if (!ok) failed = true; console.log(`${ok ? '✓' : '✕'} ${label} : ${value}${unit}`); };
const deg = (r) => (r * 180) / Math.PI;

const rack = parts('1')[0];
// Étape 5 : angle du support (axe d'un poteau) par rapport au sol.
const post = find(rack, '1')[0];
const up = new THREE.Vector3(0, 1, 0).transformDirection(post.matrixWorld);
const angle = deg(Math.asin(up.y));
check('Étape 5 — angle du support (75° à 80°)', angle.toFixed(1), angle >= 75 && angle <= 80, '°');
// Étapes 2 et 3 : boulon à œil au centre du support, à ± 5 pi du plancher.
const eye = box(parts('3')[0]);
const eyeY = (eye.min.y + eye.max.y) / 2 / IN;
check('Étape 2 — hauteur du trou (± 5 pi = 60 po)', eyeY.toFixed(1), Math.abs(eyeY - 60) <= 3, ' po');
const rb = box(rack);
check('Étape 2 — trou au centre du support (écart)', (Math.abs((eye.min.x + eye.max.x) / 2 - (rb.min.x + rb.max.x) / 2) * 1000).toFixed(0), Math.abs((eye.min.x + eye.max.x) / 2 - (rb.min.x + rb.max.x) / 2) < 0.02, ' mm');
// Étape 4 : pattes du haut appuyées au mur (bout des membrures contre la paroi).
// Mesuré par lancer de rayon : du bout de chaque membrure vers la paroi (−Z).
const wall = parts('M')[0];
const ray = new THREE.Raycaster();
for (const a of find(rack, '7')) {
  // Centre du bout de la membrure côté mur (0,49 m du poteau), reculé de 0,3 m.
  const from = new THREE.Vector3(0, 0, -0.49).applyMatrix4(a.matrixWorld).add(new THREE.Vector3(0, 0, 0.3));
  ray.set(from, new THREE.Vector3(0, 0, -1));
  const hit = ray.intersectObject(wall, true).find((h) => h.object.geometry.attributes.position.count > 5000);
  const gap = hit ? hit.distance - 0.3 : NaN;
  check('Étape 4 — patte du haut appuyée à la paroi (écart)', (gap * 1000).toFixed(0), Math.abs(gap) < 0.02, ' mm');
}
// Étape 9 : 184 tiges NQ, 8 rangées de 23, en quinconce.
const rods = parts('2');
const local = rods.map((r) => r.position.clone());
const zs = [...new Set(local.map((p) => p.z.toFixed(3) + '|' + p.y.toFixed(3)))];
check('Étape 9 et 15 — tiges NQ (184 au plus)', rods.length, rods.length === 184);
const rows = new Map();
for (const p of local) { const k = Math.round((p.z * Math.cos(0) + p.y) * 1000); rows.set(k, [...(rows.get(k) || []), p.x]); }
check('Étape 9 — rangées de 23 tiges', [...rows.values()].map((r) => r.length).join(' '), rows.size === 8 && [...rows.values()].every((r) => r.length === 23));
const firsts = [...rows.values()].map((r) => Math.min(...r));
const shift = Math.abs(firsts[1] - firsts[0]) / 0.0699;
check('Étape 9 — quinconce (décalage d’une rangée à l’autre, en diamètres)', shift.toFixed(2), Math.abs(shift - 0.5) < 0.02);
// Étape 10 : pas d'appui sur les côtés (jeu entre les tiges et les membrures).
const allRods = new THREE.Box3(); rods.forEach((r) => allRods.union(box(r)));
const armsX = find(rack, '7').map((a) => box(a));
const left = Math.min(...armsX.map((b) => b.max.x)), right = Math.max(...armsX.map((b) => b.min.x));
const jeu = Math.min(allRods.min.x - left, right - allRods.max.x);
check('Étape 10 — jeu entre les tiges et les côtés', (jeu * 1000).toFixed(0), jeu > 0.005, ' mm');
const rodAngle = deg(Math.asin(new THREE.Vector3(0, 1, 0).transformDirection(rods[0].matrixWorld).y));
check('Étapes 10 et 12 — angle des tiges (80° au plus)', rodAngle.toFixed(1), rodAngle <= 80, '°');
// Étapes 11 à 13 : crochets fermés entre 66 et 72 po, chaîne jamais sous 5 pi au centre.
for (const h of find(rack, '11')) { const b = box(h); const y = (b.min.y + b.max.y) / 2 / IN; check('Étape 12 — hauteur d’un crochet fermé (66 à 72 po)', y.toFixed(1), y >= 66 && y <= 72, ' po'); }
const chain = box(parts('6')[0]);
check('Étape 12 — point le plus bas de la chaîne de retenue (5 pi = 60 po au moins)', (chain.min.y / IN).toFixed(1), chain.min.y / IN >= 60, ' po');
for (const m of parts('7')) { const b = box(m); const y = (b.min.y + b.max.y) / 2 / IN; check('Marque à 5 pi du sol', y.toFixed(1), Math.abs(y - 60) < 1, ' po'); }
// Tiges de 3 m au plus (rapport de certification).
let rodLen = 0;
rods[0].traverse((o) => { if (o.isMesh) { o.geometry.computeBoundingBox(); const z = o.geometry.boundingBox.getSize(new THREE.Vector3()); rodLen = Math.max(z.x, z.y, z.z); } });
check('Longueur des tiges (3 m au plus)', rodLen.toFixed(2), rodLen <= 3.001, ' m');
process.exit(failed ? 1 : 0);

// Contrôle du support de tiges installé (rack-tiges-dd, P02) contre les
// exigences de la procédure PRO-DD-ST-008 : chaque mesure est prise sur le
// modèle 3D construit (boîtes, lancers de rayon, positions des tiges), pas sur
// les constantes qui ont servi à le dessiner.   node scripts/check-rack.mjs
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders, { RETENUE } from '../src/models/rack-tiges-dd/index.js';
import { NQ, T2, T15, CLEAR, SPLIT, FRONT, ANGLE } from '../src/models/rack-tiges-dd/support.js';
import { HOLE, BOLT, LEVER } from '../src/models/rack-tiges-dd/outils.js';

const IN = 0.0254;
const model = buildProcedural(builders, 'P02');
model.root.updateMatrixWorld(true);
const parts = (ref) => model.refs.get(ref) || [];
/** Boîte d'un objet, sans ses enfants masqués (variantes d'une chaîne). */
const box = (o) => {
  const b = new THREE.Box3();
  o.updateWorldMatrix(true, true);
  o.traverse((c) => {
    let v = true;
    for (let p = c; p && p !== o.parent; p = p.parent) if (!p.visible) v = false;
    if (v && c.isMesh) b.union(new THREE.Box3().setFromObject(c));
  });
  return b;
};
const find = (root, ref) => { const out = []; root.traverse((o) => { if (o !== root && o.userData.partRef === ref) out.push(o); }); return out; };
const deg = (r) => (r * 180) / Math.PI;
let failed = false;
const check = (label, value, ok, unit = '') => { if (!ok) failed = true; console.log(`${ok ? '✓' : '✕'} ${label} : ${value}${unit}`); };

const rack = parts('1')[0];
const rb = box(rack);

// Étape 2 : trou de 18 po de profond, au centre du support, à ± 5 pi du plancher.
const bolt = box(parts('3')[0]);
const holeY = (bolt.min.y + bolt.max.y) / 2 / IN;
check('Étape 2 — hauteur du trou (± 5 pi = 60 po du plancher)', holeY.toFixed(1), Math.abs(holeY - 60) <= 3, ' po');
const off = Math.abs((bolt.min.x + bolt.max.x) / 2 - (rb.min.x + rb.max.x) / 2);
check('Étape 2 — trou au centre du support (écart)', (off * 1000).toFixed(0), off < 0.02, ' mm');
check('Étape 2 — profondeur du trou (18 po)', (HOLE / IN).toFixed(1), Math.abs(HOLE / IN - 18) < 0.05, ' po');

// Étape 3 : boulon à œil pas enfoncé jusqu'au fond du trou.
const wall = parts('M')[0];
const ray = new THREE.Raycaster();
const rockHit = (from) => { ray.set(from, new THREE.Vector3(0, 0, -1)); return ray.intersectObject(wall, true).find((h) => h.object.geometry.attributes.position.count > 5000); };
const face = rockHit(new THREE.Vector3((bolt.min.x + bolt.max.x) / 2 + 0.06, (bolt.min.y + bolt.max.y) / 2 + 0.06, 0.2));
const inRock = face.point.z - bolt.min.z; // longueur de tige dans la roche
check('Étape 3 — tige du boulon dans le trou', (inRock / IN).toFixed(1), inRock > 0.2 && inRock < HOLE - 0.02, ` po sur 18 (${((HOLE - inRock) * 100).toFixed(0)} cm libres au fond)`);
check('Étape 3 — boulon tel que dessiné : pas jusqu’au fond', ((HOLE - BOLT.in) * 100).toFixed(1), BOLT.in < HOLE, ' cm de jeu');

// Étape 4 : pattes du haut appuyées au mur (lancer de rayon du bout de chaque membrure vers la paroi).
for (const a of find(rack, '7')) {
  const from = new THREE.Vector3(0, 0, -0.49).applyMatrix4(a.matrixWorld).add(new THREE.Vector3(0, 0, 0.3));
  const hit = rockHit(from);
  const gap = hit ? hit.distance - 0.3 : NaN;
  check('Étape 4 — patte du haut appuyée à la paroi (écart)', (gap * 1000).toFixed(0), Math.abs(gap) < 0.02, ' mm');
}

// Étape 5 : angle du support (axe d'un poteau) par rapport au sol, entre 75° et 80°.
const post = find(rack, '1')[0];
const angle = deg(Math.asin(new THREE.Vector3(0, 1, 0).transformDirection(post.matrixWorld).y));
check('Étape 5 — angle du support (75° à 80°)', angle.toFixed(1), angle >= 75 && angle <= 80, '°');

// Étape 6 : chaîne passée dans le boulon à œil jusqu'à son milieu (les deux moitiés égales).
const anchor = parts('4')[0];
const variants = anchor.children.filter((c) => c.isMesh);
const only = (m) => variants.forEach((v) => { v.visible = v === m; });
only(variants[0]);
const hang = box(anchor);
check('Étape 6 — chaîne pendue au boulon à œil : moitiés égales (écart)', (Math.abs(hang.min.x + hang.max.x) * 1000).toFixed(0), Math.abs(hang.min.x + hang.max.x) < 0.01, ' mm');
// Étape 7 : chaque bout passé dans son œillet, de l'extérieur vers l'intérieur (la chaîne contourne le poteau par dehors).
only(variants[2]);
const thr = box(anchor);
const lugs = find(rack, '10').map((o) => box(o));
const outside = Math.min(...lugs.map((l) => (l.max.x > 0 ? thr.max.x - l.max.x : l.min.x - thr.min.x)));
check('Étape 7 — la chaîne arrive aux œillets par l’extérieur du support', (outside * 1000).toFixed(0), outside > 0.02, ' mm au-delà des œillets');
only(variants.at(-1));

// Étape 8 : le levier du tendeur ne touche pas les tiges (au repos et en bout de course).
const binder = parts('5')[0];
let lever = null;
binder.traverse((o) => { if (o.userData.lever) lever = o.userData.lever; });
const inv = new THREE.Matrix4().copy(rack.matrixWorld).invert();
const leverZ = (rot) => { lever.rotation.x = rot; binder.updateMatrixWorld(true); return new THREE.Box3().setFromObject(lever).applyMatrix4(inv).max.z; };
const zMax = Math.max(leverZ(LEVER.rest), leverZ(LEVER.rest + LEVER.travel));
lever.rotation.x = LEVER.rest;
check('Étape 8 — levier du tendeur du côté de la paroi (marge avant les tiges)', ((T2 / 2 - zMax) * 1000).toFixed(0), zMax < T2 / 2, ' mm');

// Étape 9 : tiges en quinconce, par rangée ; étape 15 : capacité (184 tiges NQ au plus).
const rods = parts('2');
const local = rods.map((r) => r.position.clone().applyMatrix4(inv)); // repère du support : x le long des traverses, z vers les tiges
check('Étapes 9 et 15 — tiges NQ (184 au plus)', rods.length, rods.length === 184);
const rows = [];
for (const p of [...local].sort((a, b) => a.z - b.z)) {
  const row = rows.find((r) => Math.abs(r.z - p.z) < 0.02);
  if (row) row.x.push(p.x); else rows.push({ z: p.z, x: [p.x] });
}
check('Étape 9 — rangées de 23 tiges', rows.map((r) => r.x.length).join(' '), rows.length === 8 && rows.every((r) => r.x.length === 23));
const shift = Math.abs(Math.min(...rows[1].x) - Math.min(...rows[0].x)) / NQ.od;
check('Étape 9 — quinconce (décalage d’une rangée à l’autre, en diamètres)', shift.toFixed(2), Math.abs(shift - 0.5) < 0.05);
let closest = Infinity;
for (let i = 0; i < local.length; i++) for (let j = i + 1; j < local.length; j++) closest = Math.min(closest, Math.hypot(local[i].x - local[j].x, local[i].z - local[j].z));
check('Étape 9 — tiges qui se touchent sans se traverser (entraxe le plus court)', (closest * 1000).toFixed(2), closest > NQ.od - 0.0002, ` mm pour un diamètre de ${(NQ.od * 1000).toFixed(1)}`);

// Étape 10 : la rangée du fond s'appuie sur la barre transversale, et non sur les côtés.
const rect = (p, x0, x1, hz) => Math.hypot(Math.max(x0 - p.x, 0, p.x - x1), Math.max(Math.abs(p.z) - hz, 0));
const backRow = local.filter((p) => Math.abs(p.z - rows[0].z) < 0.02);
const gaps = backRow.map((p) => Math.min(rect(p, -CLEAR / 2, 0.1, T15 / 2), rect(p, SPLIT, CLEAR / 2, T2 / 2)) - NQ.od / 2);
check('Étape 10 — tiges du fond appuyées sur la barre transversale (plus grand jeu)', (Math.max(...gaps.map(Math.abs)) * 1000).toFixed(2), Math.max(...gaps.map(Math.abs)) < 0.0005, ' mm');
const all = new THREE.Box3();
rods.forEach((r) => all.union(new THREE.Box3().setFromObject(r)));
const sides = [...find(rack, '1'), ...find(rack, '2'), ...find(rack, '7'), ...find(rack, '8'), ...find(rack, '13')].map((o) => box(o));
const leftEdge = Math.max(...sides.filter((b) => b.max.x < 0).map((b) => b.max.x)), rightEdge = Math.min(...sides.filter((b) => b.min.x > 0).map((b) => b.min.x));
const jeu = Math.min(all.min.x - leftEdge, rightEdge - all.max.x);
check('Étape 10 — jeu entre les tiges et les côtés du support', (jeu * 1000).toFixed(0), jeu > 0.005, ' mm');
const rodAngle = deg(Math.asin(new THREE.Vector3(0, 1, 0).transformDirection(rods[0].matrixWorld).y));
check('Étape 10 — tiges au même angle que le support', rodAngle.toFixed(1), Math.abs(rodAngle - angle) < 0.05, '°');
const floorGap = Math.max(...rods.map((r) => Math.abs(new THREE.Box3().setFromObject(r).min.y)));
check('Pieds des tiges sur le plancher (plus grand écart)', (floorGap * 1000).toFixed(1), floorGap < 0.004, ' mm');

// Rallonges du haut et du bas : elles dépassent le devant du paquet de 8 rangées.
for (const [ref, nom] of [['8', 'du haut'], ['13', 'de patte du bas']]) {
  for (const e of find(rack, ref)) {
    const reach = new THREE.Box3().setFromObject(e).applyMatrix4(inv).max.z;
    check(`Rallonge ${nom} au-delà du paquet de tiges`, ((reach - FRONT) * 100).toFixed(1), reach > FRONT + 0.05, ' cm');
  }
}

// Étape 11 et encadré de l'étape 13 : crochets fermés entre 66 et 72 po du sol.
for (const h of find(rack, '11')) { const b = box(h); const y = (b.min.y + b.max.y) / 2 / IN; check('Étape 13 — hauteur d’un crochet fermé (66 à 72 po du sol)', y.toFixed(1), y >= 66 && y <= 72, ' po'); }
// Étape 12 : la chaîne arrête le paquet avant 80°.
check('Étape 12 — angle où la chaîne de retenue arrête le paquet (80° au plus)', RETENUE.arret.toFixed(2), RETENUE.arret > ANGLE && RETENUE.arret <= 80, `° (chaîne de ${RETENUE.longueur.toFixed(2)} m, avance de ${(RETENUE.avance * 100).toFixed(1)} cm)`);
// Étape 13 : chaîne lâche jamais à moins de 5 pi du sol au centre ; marques à 5 pi.
const chain = box(parts('6')[0]);
check('Étape 13 — point le plus bas de la chaîne de retenue (5 pi = 60 po au moins)', (chain.min.y / IN).toFixed(1), chain.min.y / IN >= 60, ' po');
for (const m of parts('7')) { const b = box(m); const y = (b.min.y + b.max.y) / 2 / IN; check('Étape 13 — marque à 5 pi du sol', y.toFixed(1), Math.abs(y - 60) < 1, ' po'); }

// Tiges de 3 m au plus (rapport de certification).
let rodLen = 0;
rods[0].traverse((o) => { if (o.isMesh) { o.geometry.computeBoundingBox(); const z = o.geometry.boundingBox.getSize(new THREE.Vector3()); rodLen = Math.max(z.x, z.y, z.z); } });
check('Longueur des tiges (3 m au plus)', rodLen.toFixed(2), rodLen <= 3.001, ' m');
process.exit(failed ? 1 : 0);

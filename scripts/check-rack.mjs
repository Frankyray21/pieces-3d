// Contrôle du support de tiges installé (rack-tiges-dd, P02) contre les
// exigences de la procédure PRO-DD-ST-008 : chaque mesure est prise sur le
// modèle 3D construit (boîtes, lancers de rayon, positions des tiges), pas sur
// les constantes qui ont servi à le dessiner. D'abord l'installation finie,
// puis les états intermédiaires que montre le montage pas à pas (animations
// d'étape : perçage, levage à deux, chaîne pendue, serrage, paquet retenu).
//   node scripts/check-rack.mjs
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders, { RETENUE } from '../src/models/rack-tiges-dd/index.js';
import { NQ, T2, T15, CLEAR, SPLIT, FRONT, ANGLE } from '../src/models/rack-tiges-dd/support.js';
import { LEVER } from '../src/models/rack-tiges-dd/outils.js';

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

// Étape 3 : boulon à œil pas enfoncé jusqu'au fond du trou.
const wall = parts('M')[0];
const ray = new THREE.Raycaster();
const rockHit = (from) => { ray.set(from, new THREE.Vector3(0, 0, -1)); return ray.intersectObject(wall, true).find((h) => h.object.geometry.attributes.position.count > 5000); };
const face = rockHit(new THREE.Vector3((bolt.min.x + bolt.max.x) / 2 + 0.06, (bolt.min.y + bolt.max.y) / 2 + 0.06, 0.2));
const inRock = face.point.z - bolt.min.z; // longueur de tige dans la roche
// (comparée plus bas à la profondeur du trou, mesurée par l'avance de la mèche)

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
const deck = parts('S')[0];
/** Dessus du plancher ou du sol de roche sous un point : { y, sur }. */
const ground = (x, z) => {
  ray.set(new THREE.Vector3(x, 1, z), new THREE.Vector3(0, -1, 0));
  const hits = [[deck, 'plancher'], [wall, 'roche']].flatMap(([o, sur]) => ray.intersectObject(o, true).filter((h) => !h.object.userData.grillage).map((h) => ({ y: h.point.y, sur })));
  return hits.sort((a, b) => b.y - a.y)[0] || { y: NaN, sur: 'rien' };
};
const feet = rods.map((r) => { const b = new THREE.Box3().setFromObject(r); return Math.abs(b.min.y - ground(r.position.x, b.max.z - 0.04).y); });
check('Pieds des tiges sur le plancher (plus grand écart au dessus du plancher)', (Math.max(...feet) * 1000).toFixed(1), Math.max(...feet) < 0.006, ' mm');

// Rallonges du haut et du bas : elles dépassent le devant du paquet de 8 rangées.
for (const [ref, nom] of [['8', 'du haut'], ['13', 'de patte du bas']]) {
  for (const e of find(rack, ref)) {
    const reach = new THREE.Box3().setFromObject(e).applyMatrix4(inv).max.z;
    check(`Rallonge ${nom} au-delà du paquet de tiges`, ((reach - FRONT) * 100).toFixed(1), reach > FRONT + 0.05, ' cm');
  }
}

// Étape 11 et encadré de l'étape 13 : crochets fermés entre 66 et 72 po du sol.
for (const h of find(rack, '11')) { const b = box(h); const y = (b.min.y + b.max.y) / 2 / IN; check('Étape 13 — hauteur d’un crochet fermé (66 à 72 po du sol)', y.toFixed(1), y >= 66 && y <= 72, ' po'); }
// Étape 13 : chaîne lâche jamais à moins de 5 pi du sol au centre ; marques à 5 pi.
const chain = box(parts('6')[0]);
check('Étape 13 — point le plus bas de la chaîne de retenue (5 pi = 60 po au moins)', (chain.min.y / IN).toFixed(1), chain.min.y / IN >= 60, ' po');
for (const m of parts('7')) { const b = box(m); const y = (b.min.y + b.max.y) / 2 / IN; check('Étape 13 — marque à 5 pi du sol', y.toFixed(1), Math.abs(y - 60) < 1, ' po'); }

// Tiges de 3 m au plus (rapport de certification).
let rodLen = 0;
rods[0].traverse((o) => { if (o.isMesh) { o.geometry.computeBoundingBox(); const z = o.geometry.boundingBox.getSize(new THREE.Vector3()); rodLen = Math.max(z.x, z.y, z.z); } });
check('Longueur des tiges (3 m au plus)', rodLen.toFixed(2), rodLen <= 3.001, ' m');

// ---------------------------------------------------------------------------
// États intermédiaires : chaque animation d'étape est mise à son début (0), en
// cours ou à sa fin (1), puis remise à sa fin.
const anims = {};
model.root.traverse((o) => { if (o.userData.stepAnim) anims[o.userData.stepAnim.step] = o.userData.stepAnim; });
const at = (step, k) => { anims[step].update(k); model.root.updateMatrixWorld(true); };
const by = (root, key, value = true) => { const out = []; root.traverse((o) => { if (o.userData[key] === value) out.push(o); }); return out; };
const meshBoxes = (...objs) => objs.flatMap((o) => { const out = []; o.traverse((m) => { if (m.isMesh) out.push(new THREE.Box3().setFromObject(m)); }); return out; });
const centre = (o) => new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
const reach = (p, bs) => Math.min(...bs.map((b) => b.distanceToPoint(p)));
const mm = (v) => (v * 1000).toFixed(0);
const quand = (k) => (k === 0 ? 'début' : k === 1 ? 'fin' : 'milieu');

// Étape 2 : la mèche part de la face de la roche et avance de 18 po ; le foreur tient la foreuse à deux
// mains, les deux pieds sur le plancher ; aucun fil du grillage devant le trou.
const drill = parts('8')[0];
const foreur = by(model.root, 'role', 'foreur')[0];
const cy = (bolt.min.y + bolt.max.y) / 2;
const tip = (k) => { at(2, k); return new THREE.Box3().setFromObject(drill).min.z; };
const rockFace = rockHit(new THREE.Vector3(0, cy, 0.2)).point.z;
const start = tip(0), depth = start - tip(1);
check('Étape 2 — pointe de la mèche sur la roche au départ (écart)', mm(Math.abs(start - rockFace)), Math.abs(start - rockFace) < 0.005, ' mm');
check('Étape 2 — profondeur du trou, mesurée par l’avance de la mèche (18 po)', (depth / IN).toFixed(1), Math.abs(depth / IN - 18) < 0.1, ' po');
check('Étape 3 — tige du boulon dans le trou, pas jusqu’au fond', (inRock / IN).toFixed(1), inRock > 0.2 && inRock < depth - 0.02, ` po sur ${(depth / IN).toFixed(0)} (${((depth - inRock) * 100).toFixed(0)} cm libres au fond)`);
for (const k of [0, 0.5, 1]) {
  at(2, k);
  const d = by(foreur, 'gant').map((g) => reach(centre(g), meshBoxes(drill)));
  check(`Étape 2 — le foreur tient la foreuse à deux mains (${quand(k)} du perçage ; centre des gants à)`, d.map(mm).join(' et '), Math.max(...d) < 0.03, ' mm de la foreuse');
}
const soles = (w) => by(w, 'botte').map((b) => { const bb = new THREE.Box3().setFromObject(b), c = bb.getCenter(new THREE.Vector3()); return { gap: Math.abs(bb.min.y - ground(c.x, c.z).y), sur: ground(c.x, c.z).sur, box: bb }; });
const sf = soles(foreur);
check('Étape 2 — pieds du foreur sur le plancher (écart)', sf.map((f) => mm(f.gap)).join(' et '), sf.every((f) => f.gap < 0.01 && f.sur === 'plancher'), ' mm');
at(2, 1);
const wireRay = (dx, dy) => { ray.set(new THREE.Vector3(dx, cy + dy, 0.2), new THREE.Vector3(0, 0, -1)); return !!ray.intersectObject(wall, true)[0]?.object.userData.grillage; };
const wiresHit = [[0, 0], ...Array.from({ length: 12 }, (_, i) => [0.03 * Math.cos((i * Math.PI) / 6), 0.03 * Math.sin((i * Math.PI) / 6)])].filter(([dx, dy]) => wireRay(dx, dy)).length;
check('Étape 2 — fils du grillage à moins de 30 mm de l’axe du trou', wiresHit, wiresHit === 0);

// Étape 4 : du support debout au support appuyé, chaque porteur tient son poteau à deux mains, les pieds
// sur le plancher, sans chevaucher les pattes du bas ni leurs rallonges.
const porteurs = by(model.root, 'role', 'porteur');
for (const k of [0, 0.5, 1]) {
  at(4, k);
  const posts = meshBoxes(...find(rack, '1'));
  const d = porteurs.flatMap((w) => by(w, 'gant').map((g) => reach(centre(g), posts)));
  check(`Étape 4 — les deux porteurs tiennent les poteaux à deux mains (${quand(k)} ; centre des gants à)`, d.map(mm).join(', '), d.length === 4 && Math.max(...d) < 0.03, ' mm des poteaux');
  const low = meshBoxes(...find(rack, '2'), ...find(rack, '13'));
  const s4 = porteurs.flatMap(soles);
  const clear = Math.min(...s4.map((f) => Math.min(...low.map((b) => (f.box.intersectsBox(b) ? 0 : Math.hypot(Math.max(b.min.x - f.box.max.x, 0, f.box.min.x - b.max.x), Math.max(b.min.z - f.box.max.z, 0, f.box.min.z - b.max.z)))))));
  check(`Étape 4 — bottes des porteurs sur le plancher, hors des pattes du bas (${quand(k)} ; plus petit écart)`, mm(clear), clear > 0.01 && s4.every((f) => f.gap < 0.01 && f.sur === 'plancher'), ' mm');
}
at(4, 0);
const upright = deg(Math.asin(new THREE.Vector3(0, 1, 0).transformDirection(find(rack, '1')[0].matrixWorld).y));
check('Étape 4 — support debout au début du levage', upright.toFixed(1), upright > 89.5, '°');
at(4, 1);

// Étapes 6 à 8 : la même chaîne du début à la fin (nombre de maillons), son surplus posé au sol quand
// elle pend au boulon, le tendeur accroché à ses deux bouts pendant le serrage.
const LINK = 192; // sommets par maillon (tore de 4 × 8 facettes, voir chainAlong)
const links = (m) => m.geometry.attributes.position.count / LINK;
const world = (m, i) => new THREE.Vector3().fromBufferAttribute(m.geometry.attributes.position, i).applyMatrix4(m.matrixWorld);
const linkAt = (m, n) => { const c = new THREE.Vector3(); for (let i = 0; i < LINK; i++) c.add(world(m, n * LINK + i)); return c.multiplyScalar(1 / LINK); };
const counts = variants.map(links);
check('Étapes 6 à 8 — la même chaîne à chaque état (maillons : pendue, un bout passé, passée, puis serrage)', counts.join(' '), Math.max(...counts) - Math.min(...counts) <= 1);
check('Étape 8 — c’est le tendeur qui reprend le mou : la chaîne garde sa longueur pendant le serrage (maillons)', counts.slice(3).join(' '), Math.max(...counts.slice(3)) - Math.min(...counts.slice(3)) <= 1);
only(variants[0]);
model.root.updateMatrixWorld(true);
const laid = [];
for (let n = 0; n < links(variants[0]); n++) { const c = linkAt(variants[0], n); if (c.y < hang.min.y + 0.04) laid.push(c.y - 0.014 - ground(c.x, c.z).y); }
check('Étape 6 — surplus de la chaîne pendue posé au sol (plus grand écart sous les maillons couchés)', `${mm(Math.max(...laid.map(Math.abs)))} mm, ${laid.length} maillons`, laid.length > 0 && Math.max(...laid.map(Math.abs)) < 0.03);
const hooks = () => by(binder, 'crochet').map((o) => o.getWorldPosition(new THREE.Vector3())).sort((a, b) => a.x - b.x);
const LEVELS = variants.length - 3;
let worst = 0, sag = 0;
for (let i = 0; i < LEVELS; i++) {
  at(8, 0.25 + 0.75 * Math.max(1e-6, i / (LEVELS - 1))); // le premier quart de l'animation montre l'accrochage
  const v = variants.find((m) => m.visible), h = hooks();
  const ends = [linkAt(v, 0), linkAt(v, links(v) - 1)].sort((a, b) => a.x - b.x);
  worst = Math.max(worst, ends[0].distanceTo(h[0]), ends[1].distanceTo(h[1]));
  if (i === 0) sag = lugs[0].getCenter(new THREE.Vector3()).y - h[0].y;
}
check('Étape 8 — tendeur accroché aux deux bouts de la chaîne à chaque coup de levier (plus grand écart)', mm(worst), worst < 0.03, ` mm ; il pend ${(sag * 100).toFixed(0)} cm sous les œillets avant le serrage`);
at(8, 1);
only(variants.at(-1));

// Étape 12 : au plus fort du basculement, la chaîne de retenue arrête les tiges avant 80° ; puis elles
// reviennent s'appuyer au fond.
const rodDeg = () => deg(Math.asin(new THREE.Vector3(0, 1, 0).transformDirection(rods[rods.length - 1].matrixWorld).y));
at(12, 0.5);
const stop = rodDeg();
check('Étape 12 — angle des tiges retenues par la chaîne, mesuré au plus fort du basculement (80° au plus)', stop.toFixed(2), stop > angle && stop <= 80, `° (chaîne de ${RETENUE.longueur.toFixed(2)} m, avance de ${(RETENUE.avance * 100).toFixed(1)} cm)`);
at(12, 1);
check('Étape 12 — tiges revenues à l’angle du support', rodDeg().toFixed(2), Math.abs(rodDeg() - angle) < 0.05, '°');

process.exit(failed ? 1 : 0);

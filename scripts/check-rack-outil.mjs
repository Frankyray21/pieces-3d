// Contrôle chiffré du rack à outils 15083000 contre son plan : encombrement et
// position de chaque pièce (cotes du plan, en pouces) et masse d'acier du
// modèle, à comparer aux 11,2 lb du cartouche. Les cordons de soudure ne sont
// comptés ni dans les cotes ni dans la masse.
//
// Usage : node scripts/check-rack-outil.mjs
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders from '../src/models/rack-outil/index.js';

const IN = 0.0254;
const ACIER = 0.2836; // lb/po³
const X0 = -15 * IN; // bord gauche du plan (modèle centré)
const model = buildProcedural(builders, 'P01');
model.root.updateMatrixWorld(true);

const cordon = (o) => !!o.userData.soudure;

/** Boîte d'une pièce en pouces, dans le repère du plan (x du bord gauche, y du bas, z de la face avant). */
function boite(p) {
  const b = new THREE.Box3();
  p.traverse((o) => { if (o.isMesh && !cordon(o)) b.expandByObject(o); });
  return { x0: (b.min.x - X0) / IN, x1: (b.max.x - X0) / IN, y0: b.min.y / IN, y1: b.max.y / IN, z0: b.min.z / IN, z1: b.max.z / IN };
}

/** Volume d'acier d'une pièce (po³), par somme de tétraèdres signés. */
function volume(p) {
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  let v = 0;
  p.traverse((o) => {
    if (!o.isMesh || cordon(o)) return;
    const pos = o.geometry.attributes.position, idx = o.geometry.index;
    const n = idx ? idx.count : pos.count;
    for (let i = 0; i < n; i += 3) {
      const k = idx ? [idx.getX(i), idx.getX(i + 1), idx.getX(i + 2)] : [i, i + 1, i + 2];
      a.fromBufferAttribute(pos, k[0]).applyMatrix4(o.matrixWorld);
      b.fromBufferAttribute(pos, k[1]).applyMatrix4(o.matrixWorld);
      c.fromBufferAttribute(pos, k[2]).applyMatrix4(o.matrixWorld);
      v += a.dot(b.cross(c)) / 6;
    }
  });
  return v / IN ** 3;
}

let failed = false;
let n = 0;
/** Mesure comparée à la cote du plan (tolérance en pouces ; plan : ± 1/16). */
function cote(nom, mesure, attendu, tol = 0.01) {
  n++;
  const ok = Math.abs(mesure - attendu) <= tol;
  if (!ok) failed = true;
  console.log(`${ok ? '✓' : '✕'} ${nom} : ${mesure.toFixed(3)} po (plan : ${attendu})`);
}

const P = (ref) => model.refs.get(ref).map(boite).sort((a, b) => a.x0 - b.x0);
const f = (a, b) => a + b / 16; // pouces et seizièmes

const [pl] = P('1');
cote('Plaque, largeur', pl.x1 - pl.x0, 30);
cote('Plaque, hauteur', pl.y1 - pl.y0, 14.5);
cote('Plaque, épaisseur (relevée)', pl.z1 - pl.z0, f(0, 3));
cote('Plaque, face avant à z = 0', pl.z1, 0);

const tubes = P('2');
cote('Tube rond 1, axe', (tubes[0].x0 + tubes[0].x1) / 2, f(1, 7));
cote('Tube rond 2, axe', (tubes[1].x0 + tubes[1].x1) / 2, f(5, 1));
cote('Tube rond 2, bord gauche', tubes[1].x0, f(3, 10));
cote('Jeu entre les deux tubes', tubes[1].x0 - tubes[0].x1, 0.75);
cote('Tubes ronds, appui sur la face avant', tubes[0].z0, 0);

const acc = P('3');
cote('Crochet d\'accrochage 1, bord gauche', acc[0].x0, f(0, 2));
cote('Crochet d\'accrochage 2, bord droit', acc[1].x1, f(2, 6));
cote('Crochet d\'accrochage 3, bord gauche', acc[2].x0, f(27, 10));
cote('Crochet d\'accrochage 4, bord droit', acc[3].x1, f(29, 14));
cote('Crochet d\'accrochage, hauteur', acc[0].y1 - acc[0].y0, 3);
cote('Crochet d\'accrochage, dessus au ras de la plaque', acc[0].y1, 14.5);
// Fente : du dos de la plaque (z = -3/16) à la face intérieure de la patte (patte de 1/4 po).
cote('Crochet d\'accrochage, fente derrière la plaque', -acc[0].z0 - 0.25 - f(0, 3), 0.25);

const [t4] = P('4');
cote('Tuyau couché, axe', (t4.x0 + t4.x1) / 2, 28.75);
cote('Tuyau couché, diamètre', t4.x1 - t4.x0, 1.9);
cote('Tuyau couché, longueur', t4.z1 - t4.z0, 2.25);
cote('Tuyau couché, jeu au bord droit', 30 - t4.x1, f(0, 5), 0.02);
cote('Tuyau couché, jeu au bas', t4.y0, f(0, 5), 0.02);

const [t5] = P('5');
cote('Tuyau debout, axe', (t5.x0 + t5.x1) / 2, 24.25, 0.03);
cote('Tuyau debout, diamètre', t5.x1 - t5.x0, 1.05);
cote('Du tuyau debout au tuyau couché', t4.x0 - t5.x1, 3);

const cr = P('6');
[f(8, 3), f(10, 7), f(12, 11), f(14, 15), f(17, 3), f(19, 7), f(21, 11)].forEach((x, i) => cote(`Crochet en L ${i + 1}, bord gauche`, cr[i].x0, x));
cote('Crochet en L, épaisseur', cr[0].x1 - cr[0].x0, 0.375);
cote('Crochet en L, saillie', cr[0].z1, 2);
cote('Crochet en L, dessous', cr[0].y0, f(1, 1));
cote('Du tube rond 2 au premier crochet', cr[0].x0 - tubes[1].x1, f(1, 11));
cote('Du dernier crochet au tuyau debout', t5.x0 - cr[6].x1, f(1, 11));

const dos = Math.max(...acc.map((b) => -b.z0)), devant = Math.max(...tubes.map((b) => b.z1));
cote('Profondeur hors tout', dos + devant, f(3, 9));

const masse = model.parts.reduce((s, p) => s + volume(p) * ACIER, 0);
n++;
const okMasse = Math.abs(masse - 11.2) <= 0.15;
if (!okMasse) failed = true;
console.log(`${okMasse ? '✓' : '✕'} Masse d'acier du modèle : ${masse.toFixed(2)} lb (cartouche du plan : 11,2 lb)`);
console.log(`${failed ? 'ÉCHEC' : 'Conforme'} — ${n} mesures`);
process.exit(failed ? 1 : 0);

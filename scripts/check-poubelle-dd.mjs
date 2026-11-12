// Contrôle chiffré de la poubelle DD contre ses plans : encombrement et position
// de chaque pièce (cotes des plans et relevés à l'échelle, en pouces), maillages
// fermés, et masse d'acier du modèle à comparer aux cartouches (47,9 lb pour la
// poubelle 154011700, 6,9 lb pour le couvercle 0103001). Les cordons de soudure
// ne sont comptés ni dans les cotes ni dans la masse.
//
// Usage : node scripts/check-poubelle-dd.mjs
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders, { VIROLE, FOND, ENCOCHE, COUVERCLE } from '../src/models/poubelle-dd/index.js';

const IN = 0.0254;
const ACIER = 0.2836; // lb/po³
const model = buildProcedural(builders, 'P01');
model.root.updateMatrixWorld(true);

const cordon = (o) => !!o.userData.soudure;
const mailles = (p) => { const l = []; p.traverse((o) => { if (o.isMesh && !cordon(o)) l.push(o); }); return l; };

/** Sommets d'un objet en pouces, dans le repère de l'ensemble. */
function sommets(p) {
  const out = [], v = new THREE.Vector3();
  for (const o of mailles(p)) {
    const pos = o.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      out.push([v.x / IN, v.y / IN, v.z / IN]);
    }
  }
  return out;
}
const etendue = (pts, k) => { const l = pts.map((p) => p[k]); return [Math.min(...l), Math.max(...l)]; };
const rayon = ([x, , z]) => Math.hypot(x, z);

/** Volume d'acier d'un objet (po³), par somme de tétraèdres signés (maillages fermés). */
function volume(p) {
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  let v = 0;
  for (const o of mailles(p)) {
    const pos = o.geometry.attributes.position, idx = o.geometry.index;
    const n = idx ? idx.count : pos.count;
    for (let i = 0; i < n; i += 3) {
      const k = idx ? [idx.getX(i), idx.getX(i + 1), idx.getX(i + 2)] : [i, i + 1, i + 2];
      a.fromBufferAttribute(pos, k[0]).applyMatrix4(o.matrixWorld);
      b.fromBufferAttribute(pos, k[1]).applyMatrix4(o.matrixWorld);
      c.fromBufferAttribute(pos, k[2]).applyMatrix4(o.matrixWorld);
      v += a.dot(b.cross(c)) / 6;
    }
  }
  return v / IN ** 3;
}

/** Arêtes libres d'un objet : 0 si chaque arête est partagée par deux triangles de sens opposés. */
function aretesLibres(p) {
  const v = new THREE.Vector3();
  let libres = 0;
  for (const o of mailles(p)) {
    const pos = o.geometry.attributes.position, idx = o.geometry.index;
    const n = idx ? idx.count : pos.count;
    const cle = (i) => { v.fromBufferAttribute(pos, idx ? idx.getX(i) : i); return `${Math.round(v.x * 2e4)},${Math.round(v.y * 2e4)},${Math.round(v.z * 2e4)}`; };
    const sens = new Map();
    for (let i = 0; i < n; i += 3) {
      const k = [cle(i), cle(i + 1), cle(i + 2)];
      for (let j = 0; j < 3; j++) {
        const a = k[j], b = k[(j + 1) % 3];
        if (a === b) continue;
        sens.set(`${a}|${b}`, (sens.get(`${a}|${b}`) || 0) + 1);
      }
    }
    for (const [e, c] of sens) {
      const [a, b] = e.split('|');
      if ((sens.get(`${b}|${a}`) || 0) !== c) libres++;
    }
  }
  return libres;
}

let failed = false;
let n = 0;
/** Mesure comparée à la valeur attendue (tolérance en pouces ; plan de la poubelle : ± 1/32). */
function cote(nom, mesure, attendu, tol = 0.01, source = 'plan') {
  n++;
  const ok = Math.abs(mesure - attendu) <= tol;
  if (!ok) failed = true;
  console.log(`${ok ? '✓' : '✕'} ${nom} : ${mesure.toFixed(3)} po (${source} : ${attendu})`);
}
const releve = (nom, mesure, attendu, tol = 0.01) => cote(nom, mesure, attendu, tol, 'relevé');
const f = (a, b) => a + b / 16; // pouces et seizièmes

const P = (ref) => model.refs.get(ref)[0];
const poubelle = P('1'), couvercle = P('2');
const piece = (asm, ref) => asm.userData.parts.find((p) => p.userData.partRef === ref);
const viroleObj = piece(poubelle, '1'), fondObj = piece(poubelle, '2');
const sv = sommets(viroleObj), sf = sommets(fondObj);

// Plan 154011700 : virole.
const rv = sv.map(rayon);
cote('Virole, rayon extérieur', Math.max(...rv), f(7, 2));
releve('Virole, épaisseur', Math.max(...rv) - Math.min(...rv), 0.125, 0.002);
const [vy0, vy1] = etendue(sv, 1);
cote('Virole, hauteur', vy1 - vy0, 27);
// Joint à l'arrière (−Z) : écart entre les deux bords de la plaque roulée.
const bords = sv.filter(([x, , z]) => z < 0 && Math.abs(x) < 0.1);
releve('Virole, joint', Math.min(...bords.filter((p) => p[0] > 0).map((p) => p[0])) - Math.max(...bords.filter((p) => p[0] < 0).map((p) => p[0])), 1 / 32, 0.002);
// Encoches : sommets du bas de la virole les plus proches de l'axe X, de chaque côté.
for (const [nom, s] of [['à droite (+X)', 1], ['à gauche (−X)', -1]]) {
  const bas = sv.filter(([x, y]) => s * x > 0 && y < 1e-4);
  const zHaut = Math.min(...bas.filter((p) => p[2] > 0).map((p) => p[2])), zBas = Math.max(...bas.filter((p) => p[2] < 0).map((p) => p[2]));
  releve(`Encoche ${nom}, largeur`, zHaut - zBas, f(0, 5), 0.003);
  releve(`Encoche ${nom}, centrée sur l'axe`, (zHaut + zBas) / 2, 0, 0.001);
}
// Haut de l'encoche : sommets de ses deux flancs au-dessus du bord du bas.
const dessus = sv.filter(([x, y, z]) => Math.abs(z) < ENCOCHE.w / 2 + 0.001 && y > 0.01 && y < 1 && x > 0).map((p) => p[1]);
releve('Encoche, profondeur (3/16 po vus à la coupe, plus l\'épaisseur du fond)', Math.min(...dessus) - vy0, f(0, 5));

// Plan 154011700 : fond.
const [fy0, fy1] = etendue(sf, 1);
cote('Fond, retrait depuis le bord du bas', fy0 - vy0, f(0, 3));
releve('Fond, épaisseur', fy1 - fy0, 0.125);
const disque = sf.filter(([, , z]) => Math.abs(z) > FOND.tenon.w / 2 + 0.01).map(rayon);
releve('Fond, diamètre du disque', 2 * Math.max(...disque), 14, 0.01);
const [fx0, fx1] = etendue(sf, 0);
releve('Fond, hors tout sur les tenons', fx1 - fx0, 14.375);
releve('Tenons, saillie hors de la virole', fx1 - VIROLE.r, f(0, 1));
const tenon = sf.filter(([x]) => x > VIROLE.r - VIROLE.t + 0.02);
releve('Tenons, largeur', etendue(tenon, 2)[1] - etendue(tenon, 2)[0], f(0, 3));
releve('Tenons, centrés sur l\'axe', (etendue(tenon, 2)[1] + etendue(tenon, 2)[0]) / 2, 0, 0.001);

// Jeux : rien ne se traverse.
const jeu = (nom, v) => { n++; const ok = v >= -1e-6; if (!ok) failed = true; console.log(`${ok ? '✓' : '✕'} ${nom} : ${v.toFixed(3)} po`); };
jeu('Jeu de chaque côté d\'un tenon dans son encoche', (ENCOCHE.w - FOND.tenon.w) / 2);
jeu('Jeu du tenon sous le haut de l\'encoche', Math.min(...dessus) - fy1);
jeu('Jeu radial, disque dans la virole (sur les arêtes des facettes)', Math.min(...rv) - Math.max(...disque));

// Plan 0103001 : couvercle, posé sur la poubelle.
const [anneauObj, jupeObj, dessusObj, poigneeObj] = ['1', '2', '3', '4'].map((r) => piece(couvercle, r));
const sa = sommets(anneauObj), sj = sommets(jupeObj), sd = sommets(dessusObj), sp = sommets(poigneeObj);
const ra = sa.map(rayon), rj = sj.map(rayon), rd = sd.map(rayon);
const [ay0, ay1] = etendue(sa, 1), [jy0, jy1] = etendue(sj, 1), [dy0, dy1] = etendue(sd, 1);
const [px0, px1] = etendue(sp, 0), [py0, py1] = etendue(sp, 1), [pz0, pz1] = etendue(sp, 2);
cote('Dessus, diamètre', 2 * Math.max(...rd), 15);
releve('Dessus, épaisseur', dy1 - dy0, f(0, 1), 0.002);
cote('Jupe, diamètre intérieur', 2 * Math.min(...rj), f(14, 10));
releve('Jupe, épaisseur', Math.max(...rj) - Math.min(...rj), f(0, 1), 0.002);
releve('Jupe, hauteur', jy1 - jy0, 4);
releve('Jupe, appuyée sous le dessus', dy0 - jy1, 0, 0.001);
releve('Anneau, diamètre extérieur', 2 * Math.max(...ra), f(14, 10));
releve('Anneau, diamètre intérieur', 2 * Math.min(...ra), f(13, 14));
releve('Anneau, épaisseur', ay1 - ay0, f(0, 1), 0.002);
cote('Entre l\'anneau et le dessus', dy0 - ay1, f(0, 2), 0.002);
cote('Poignée, de son côté au bord du dessus', px0 + COUVERCLE.dessus.d / 2, 2.5);
cote('Poignée, de son bout au bord du dessus', COUVERCLE.dessus.d / 2 - pz1, 4.5);
releve('Poignée, longueur', pz1 - pz0, 6);
releve('Poignée, largeur', px1 - px0, 1);
releve('Poignée, hauteur', py1 - py0, 2);
releve('Poignée, pieds sur le dessus', py0 - dy1, 0, 0.001);
releve('Poignée, centrée sur la longueur', (pz0 + pz1) / 2, 0, 0.001);
// Dessous de la bande : sommets du dessus de la poignée, entre les deux plis.
const epPoignee = py1 - Math.max(...sp.filter(([, , z]) => Math.abs(z) < COUVERCLE.poignee.len / 2 - 0.1).map((p) => p[1]).filter((y) => y < py1 - 0.03));
releve('Poignée, épaisseur de la bande', epPoignee, f(0, 1), 0.002);

// Couvercle sur la poubelle.
releve('Anneau posé sur le bord de la poubelle', ay0 - vy1, 0, 0.001);
jeu('Portée de l\'anneau sur le bord (vers l\'intérieur)', Math.min(...rv) - Math.min(...ra));
jeu('Portée de l\'anneau sur le bord (vers l\'extérieur)', Math.max(...ra) - Math.max(...rv));
releve('Jeu radial, jupe autour de la poubelle', Math.min(...rj) - Math.max(...rv), f(0, 3), 0.002);
releve('Jupe, descente le long de la poubelle', vy1 - jy0, 4 - f(0, 3), 0.002);
releve('Hauteur hors tout, poubelle et couvercle', py1 - vy0, 27 + f(0, 4) + 2, 0.002);

// Maillages fermés : condition du calcul de volume.
for (const [nom, o] of [['Virole', viroleObj], ['Fond', fondObj], ['Anneau', anneauObj], ['Jupe', jupeObj], ['Dessus', dessusObj], ['Poignée', poigneeObj]]) {
  n++;
  const libres = aretesLibres(o);
  if (libres) failed = true;
  console.log(`${libres ? '✕' : '✓'} ${nom} : maillage fermé (${libres} arête${libres > 1 ? 's' : ''} libre${libres > 1 ? 's' : ''})`);
}

// Masses.
const lb = (o) => volume(o) * ACIER;
const mVirole = lb(viroleObj), mFond = lb(fondObj), mCouvercle = lb(couvercle);
const masse = (nom, v, attendu, tol) => {
  n++;
  const ok = Math.abs(v - attendu) <= tol;
  if (!ok) failed = true;
  console.log(`${ok ? '✓' : '✕'} ${nom} : ${v.toFixed(2)} lb (cartouche : ${String(attendu.toFixed(1)).replace('.', ',')} lb)`);
};
masse('Masse de la poubelle', mVirole + mFond, 47.9, 0.1);
masse('Masse du couvercle', mCouvercle, 6.9, 0.1);
console.log(`  Virole : ${mVirole.toFixed(2)} lb ; fond : ${mFond.toFixed(2)} lb`);
console.log(`  Anneau : ${lb(anneauObj).toFixed(2)} lb ; jupe : ${lb(jupeObj).toFixed(2)} lb ; dessus : ${lb(dessusObj).toFixed(2)} lb ; poignée : ${lb(poigneeObj).toFixed(2)} lb`);
console.log(`  Poubelle avec son couvercle : ${(mVirole + mFond + mCouvercle).toFixed(2)} lb`);
console.log(`${failed ? 'ÉCHEC' : 'Conforme'} — ${n} mesures`);
process.exit(failed ? 1 : 0);

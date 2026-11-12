// Contrôle chiffré du tube à l'eau 1524010812 et de sa flotte 152042600 contre
// leurs plans : encombrement et position de chaque pièce (cotes du plan du bac,
// relevés sur son tracé vectoriel et sur la vue du plan de la flotte, en pouces),
// jeux de la flotte dans le bac, et masse d'acier du modèle à comparer aux
// cartouches (443,9 lb pour le bac, 8,9 lb pour la flotte). Les cordons de
// soudure ne sont comptés ni dans les cotes ni dans la masse.
//
// Usage : node scripts/check-tube-eau.mjs
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders from '../src/models/tube-eau/index.js';

const IN = 0.0254;
const ACIER = 0.2836; // lb/po³
const model = buildProcedural(builders, 'P01');
model.root.updateMatrixWorld(true);
const flotte = buildProcedural(builders, 'P02');
flotte.root.updateMatrixWorld(true);

const cordon = (o) => !!o.userData.soudure;

/** Boîte d'un objet en pouces ; repere : objet dont on prend le repère (monde par défaut). */
function boite(p, repere = null) {
  const b = new THREE.Box3(), v = new THREE.Vector3();
  const inv = repere ? repere.matrixWorld.clone().invert() : new THREE.Matrix4();
  p.traverse((o) => {
    if (!o.isMesh || cordon(o)) return;
    const pos = o.geometry.attributes.position;
    const mat = inv.clone().multiply(o.matrixWorld);
    for (let i = 0; i < pos.count; i++) b.expandByPoint(v.fromBufferAttribute(pos, i).applyMatrix4(mat));
  });
  return { x0: b.min.x / IN, x1: b.max.x / IN, y0: b.min.y / IN, y1: b.max.y / IN, z0: b.min.z / IN, z1: b.max.z / IN };
}

/** Volume d'acier d'un objet (po³), par somme de tétraèdres signés (maillages fermés). */
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
/** Mesure comparée à la valeur attendue (tolérance en pouces ; plan du bac : ± 1/32). */
function cote(nom, mesure, attendu, tol = 0.005, source = 'plan') {
  n++;
  const ok = Math.abs(mesure - attendu) <= tol;
  if (!ok) failed = true;
  console.log(`${ok ? '✓' : '✕'} ${nom} : ${mesure.toFixed(3)} po (${source} : ${attendu})`);
}
const releve = (nom, mesure, attendu, tol = 0.005) => cote(nom, mesure, attendu, tol, 'relevé');
const f = (a, b) => a + b / 16; // pouces et seizièmes

const P = (ref) => model.refs.get(ref).map((o) => boite(o));
const [p1] = P('1'), [p2] = P('2'), [p3] = P('3'), [p4] = P('4');
const barres = P('5').sort((a, b) => a.z0 - b.z0);
const pieds = P('6').sort((a, b) => a.x0 - b.x0);
const manchons = P('7').sort((a, b) => a.z0 - b.z0);
const brides = P('8').sort((a, b) => a.x0 - b.x0);
const [fl] = P('10');
const arriere = p1.z0; // face arrière du bac (haut de la vue de dessus du plan)

console.log('— Tube à l\'eau 1524010812');
cote('Longueur hors tout', p2.x1 - p3.x0, f(45, 6));
cote('Profondeur hors tout', p1.z1 - p1.z0, 35.25);
cote('Hauteur, pieds compris', p1.y1 - pieds[0].y0, f(33, 15));
cote('Pied gauche, du bout gauche', pieds[0].x0 - p3.x0, 3);
cote('Pied droit, du bout droit', p2.x1 - pieds[1].x1, 3);
cote('Traverse, de la retombée du bout droit', p2.x0 - p4.x1, 6);
cote('Raccords de 1 po, saillie', p3.x0 - manchons[0].x0, 0.75);
releve('Plaque 1, longueur entre les bouts', p1.x1 - p1.x0, 45);
releve('Bouts, épaisseur de tôle (joint d\'angle ouvert)', p1.x0 - p3.x0, 0.1875);
releve('Bouts, en retrait d\'une épaisseur des grandes faces', p3.z0 - p1.z0, 0.1875);
releve('Bouts, bas au niveau du dessus du fond', p3.y0 - p1.y0, 0.1875);
releve('Bac seul, hauteur', p1.y1 - p1.y0, f(30, 3));
releve('Rebord des bouts, largeur', p3.x1 - p3.x0, f(2, 3));
releve('Rebord des bouts, au niveau du dessus du bac', p3.y1 - p1.y1, 0);
releve('Pieds, largeur', pieds[0].x1 - pieds[0].x0, 8);
releve('Pieds, hauteur', pieds[0].y1 - pieds[0].y0, 3.75);
releve('Pieds, longueur', pieds[0].z1 - pieds[0].z0, 35.25);
releve('Pieds, soudés sous le fond', p1.y0 - pieds[0].y1, 0);
releve('Traverse, largeur aux ailes', p4.x1 - p4.x0, f(17, 7));
releve('Traverse, creux', p4.y1 - p4.y0, f(2, 3));
releve('Traverse, ailes au niveau du dessus du bac', p4.y1 - p1.y1, 0);
releve('Traverse, d\'une grande face à l\'autre', p4.z1 - p4.z0, 34.875);
releve('Traverse, du bout gauche', p4.x0 - p3.x0, 19.75);
releve('Barres, longueur', barres[0].x1 - barres[0].x0, 17.375);
releve('Barres, largeur', barres[0].z1 - barres[0].z0, 1);
releve('Barres, épaisseur', barres[0].y1 - barres[0].y0, 0.1875);
releve('Barres, posées sur les ailes de la traverse', barres[0].y0 - p4.y1, 0);
releve('Barre arrière, de la face arrière', barres[0].z0 - arriere, f(7, 1));
releve('Barre avant, de la face avant', p1.z1 - barres[1].z1, f(7, 1));
releve('Barres, centrées sur la traverse', (barres[0].x0 + barres[0].x1 - p4.x0 - p4.x1) / 2, 0);
releve('Raccords de 1 po, diamètre', manchons[0].y1 - manchons[0].y0, 1.5);
releve('Raccords de 1 po, axe sous le dessus du bac', p1.y1 - (manchons[0].y0 + manchons[0].y1) / 2, 4);
releve('Premier raccord, axe depuis la face arrière', (manchons[0].z0 + manchons[0].z1) / 2 - arriere, f(26, 9));
releve('Second raccord, axe depuis la face arrière', (manchons[1].z0 + manchons[1].z1) / 2 - arriere, f(31, 9));
releve('Brides de 2 po, diamètre', brides[0].y1 - brides[0].y0, f(3, 11));
releve('Bride gauche, saillie', p3.x0 - brides[0].x0, 0.3125);
releve('Bride droite, saillie', brides[1].x1 - p2.x1, 0.3125);
releve('Brides, axe au-dessus du dessous du bac', (brides[0].y0 + brides[0].y1) / 2 - p1.y0, f(1, 11));
releve('Brides, axe depuis la face arrière', (brides[0].z0 + brides[0].z1) / 2 - arriere, f(2, 11));
releve('Bride droite, vis-à-vis de la gauche', (brides[1].z0 + brides[1].z1 - brides[0].z0 - brides[0].z1) / 2, 0);

// Flotte 152042600, dans le repère de la pièce (X et Y selon les faces du bras, Z selon l'axe).
console.log('— Flotte 152042600 (relevés sur la vue du plan, échelle 1:3)');
const corps = flotte.refs.get('1')[0];
const soude = corps.children[0]; // cylindre, joue avant, joue arrière, bras, raccord
const [cyl, joueAv, joueAr, bras] = soude.children.map((o) => boite(o, corps));
const boulons = flotte.refs.get('2').map((o) => boite(o, o)).sort((a, b) => a.z0 - b.z0);
const cap = boite(flotte.refs.get('3')[0], flotte.refs.get('3')[0]);
releve('Cylindre, diamètre', cyl.x1 - cyl.x0, 6);
releve('Cylindre, longueur', cyl.z1 - cyl.z0, 12);
releve('Joues, épaisseur', joueAv.z1 - joueAv.z0, 0.125);
releve('Joues, cercle de Ø 6 1/4 po (du bas de la joue à l\'axe)', -joueAv.y0, 3.125);
releve('Joues, arrondi de 1 po autour du bras (largeur)', joueAv.x1 - joueAv.x0, 3.125 + 2.5 + 1);
releve('Joues, hauteur', joueAv.y1 - joueAv.y0, 3.125 + 3.125 + 1);
releve('Longueur sur les joues', joueAv.z1 - joueAr.z0, 12.25);
releve('Bras, largeur du tube carré', bras.x1 - bras.x0, 1);
releve('Bras, hauteur du tube carré', bras.y1 - bras.y0, 1);
releve('Bras, longueur', bras.z1 - bras.z0, 20);
releve('Bras, axe à 4 po de celui du cylindre', Math.hypot((bras.x0 + bras.x1) / 2, (bras.y0 + bras.y1) / 2), 4, 0.01);
releve('Bras, saillie de la joue arrière', joueAr.z0 - bras.z0, 7.625);
releve('Bras, saillie de la joue avant', bras.z1 - joueAv.z1, 0.125);
releve('Premier boulon, du bout du bras', (boulons[0].z0 + boulons[0].z1) / 2 - bras.z0, 0.625);
releve('Second boulon, du bout du bras', (boulons[1].z0 + boulons[1].z1) / 2 - bras.z0, 2.5);
releve('Boulons, longueur sous tête', bras.y1 - boulons[0].y0, 1.25);
releve('Capuchon, bout à 0,9 po de la joue avant', cap.z1 - joueAv.z1, 0.9);

// Flotte dans le bac : position supposée, mais rien ne doit se traverser.
console.log('— Flotte dans le bac (position supposée)');
const jeu = (nom, v) => { n++; const ok = v >= 0.25; if (!ok) failed = true; console.log(`${ok ? '✓' : '✕'} ${nom} : ${v.toFixed(3)} po`); };
jeu('Jeu sous le fond de la traverse', p4.y0 - fl.y1);
jeu('Jeu au bout gauche', fl.x0 - (p3.x0 + 0.1875));
jeu('Jeu à la face avant', p1.z1 - 0.1875 - fl.z1);
jeu('Jeu au-dessus du fond', fl.y0 - (p1.y0 + 0.1875));

// Masses.
console.log('— Masses');
const lb = (o) => volume(o) * ACIER;
const masse = (nom, v, attendu, tol) => {
  n++;
  const ok = Math.abs(v - attendu) <= tol;
  if (!ok) failed = true;
  console.log(`${ok ? '✓' : '✕'} ${nom} : ${v.toFixed(1)} lb (cartouche : ${String(attendu).replace('.', ',')} lb)`);
};
const parRef = (ref) => model.refs.get(ref).reduce((s, o) => s + lb(o), 0);
const detail = ['1', '2', '3', '4', '5', '6', '7', '8'].map((r) => [r, parRef(r)]);
masse('Masse du tube à l\'eau (repères 1 à 8)', detail.reduce((s, [, v]) => s + v, 0), 443.9, 4.5);
console.log(`  ${detail.map(([r, v]) => `repère ${r} : ${v.toFixed(1)} lb`).join(' ; ')}`);
masse('Masse de la flotte (cylindre en tôle de calibre 16)', [...flotte.refs.values()].flat().reduce((s, o) => s + lb(o), 0), 8.9, 0.3);
console.log(`${failed ? 'ÉCHEC' : 'Conforme'} — ${n} mesures`);
process.exit(failed ? 1 : 0);

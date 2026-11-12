// Contrôle chiffré de la porte assemblée 1801020 contre ses plans (1801020 et 15250402) :
// cotes inscrites aux plans, cotes relevées à l'échelle, volume de matière et mouvements.
//
// Les masses des cartouches (19,74 lb pour la porte, 5,42 lb pour le trépied) sont calculées
// par SolidWorks avec sa densité par défaut (1 g/cm³, matériau non assigné) : elles donnent le
// volume de matière, comparé ici à celui du modèle. Un maillage plein qui représente un tube
// creux ou un fil rond porte userData.kVolume (section réelle / section du maillage).
//
// Usage : node scripts/check-porte.mjs
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders from '../src/models/porte-1801020/index.js';
import { IN, L, FACE, BARRURE, PENTURE, DENSITE_DEFAUT, ACIER, MASSE_PLAN } from '../src/models/porte-1801020/plan.js';
import { poser, contact, OUVERTURE, AXE } from '../src/models/porte-1801020/cinematique.js';

const model = buildProcedural(builders, 'P01');
const trepied = buildProcedural(builders, 'P02');
model.root.updateMatrixWorld(true);
trepied.root.updateMatrixWorld(true);

/** Boîte d'un objet en pouces, dans le repère du plan (x du bord gauche, y du plancher, z du plan milieu du cadre). */
function boite(...objs) {
  const b = new THREE.Box3();
  for (const o of objs) { o.updateWorldMatrix(true, true); b.expandByObject(o); }
  return { x0: b.min.x / IN + L / 2, x1: b.max.x / IN + L / 2, y0: b.min.y / IN, y1: b.max.y / IN, z0: b.min.z / IN, z1: b.max.z / IN };
}

/** Volume de matière (po³) : somme de tétraèdres signés, fois le facteur de volume du maillage. */
function volume(root) {
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  let total = 0;
  root.traverse((o) => {
    if (!o.isMesh) return;
    const pos = o.geometry.attributes.position, idx = o.geometry.index;
    const n = idx ? idx.count : pos.count;
    let v = 0;
    for (let i = 0; i < n; i += 3) {
      const k = idx ? [idx.getX(i), idx.getX(i + 1), idx.getX(i + 2)] : [i, i + 1, i + 2];
      a.fromBufferAttribute(pos, k[0]).applyMatrix4(o.matrixWorld);
      b.fromBufferAttribute(pos, k[1]).applyMatrix4(o.matrixWorld);
      c.fromBufferAttribute(pos, k[2]).applyMatrix4(o.matrixWorld);
      v += a.dot(b.cross(c)) / 6;
    }
    total += (v / IN ** 3) * (o.userData.kVolume ?? 1);
  });
  return total;
}

let failed = false, n = 0;
/** Mesure comparée à sa cote (tolérance en pouces ; plans : ± 1/16). */
function cote(nom, mesure, attendu, tol = 0.01, unite = 'po') {
  n++;
  const ok = Math.abs(mesure - attendu) <= tol;
  if (!ok) failed = true;
  console.log(`${ok ? '✓' : '✕'} ${nom} : ${mesure.toFixed(3)} ${unite} (attendu : ${attendu})`);
}
function vrai(nom, ok, detail = '') {
  n++;
  if (!ok) failed = true;
  console.log(`${ok ? '✓' : '✕'} ${nom}${detail ? ` : ${detail}` : ''}`);
}

const ref = (m, r) => m.refs.get(r);
const nomme = (root, name) => { const out = []; root.traverse((o) => { if (o.name === name) out.push(o); }); return out; };
const f = (a, num, den) => a + num / den;

console.log('— Plan 15250402 (trépied)');
const tb = boite(trepied.root);
cote('Trépied, largeur hors tout', tb.x1 - tb.x0, 42);
cote('Trépied, longueur des pieds', tb.z1 - tb.z0, 36);
const douilles = ref(trepied, '2').map((o) => boite(o)).sort((a, b) => a.x0 - b.x0 || a.z0 - b.z0);
cote('Douille, dessus au-dessus du plancher', douilles[0].y1, f(7, 3, 8));
cote('Douille, jeu entre les deux plaques', douilles[1].z0 - douilles[0].z1, 1.5);
cote('Du bout du pied à la plaque de douille', douilles[0].z1 - tb.z0, 17.25);
const goussets = ref(trepied, '3').map((o) => boite(o)).sort((a, b) => a.x0 - b.x0);
cote('Du bord du pied au gousset', goussets[0].x0 - tb.x0, f(0, 9, 16));
vrai('Nomenclature du trépied', ref(trepied, '1').length === 3 && ref(trepied, '2').length === 4 && ref(trepied, '3').length === 4, '3 plaques 15250408, 4 plaques 15250411, 4 plaques 15250412');
const vT = volume(trepied.root);
cote('Trépied, masse à la densité du plan (1 g/cm³)', vT * DENSITE_DEFAUT, MASSE_PLAN.trepied, 0.03, 'lb');

console.log('— Plan 1801020 (porte assemblée)');
const cadre = ref(model, '3')[0], battant = ref(model, '1')[0];
const ct = boite(...nomme(cadre, 'tube'));
cote('Largeur hors tout (cadre)', ct.x1 - ct.x0, 42);
cote('Hauteur hors tout (plancher au dessus du cadre)', ct.y1, f(88, 3, 8));
cote('Cadre, tube (relevé)', ct.z1 - ct.z0, 1.5);
const pied = boite(ref(model, '2')[0]);
cote('Pieds, longueur', pied.z1 - pied.z0, 36);
cote('Pieds, centrés sur le cadre', (pied.z0 + pied.z1) / 2, 0);
const bt = boite(...nomme(battant, 'tube'));
cote('Battant, largeur (relevée)', bt.x1 - bt.x0, 38);
cote('Battant, hauteur (relevée)', bt.y1 - bt.y0, 85.5);
cote('Battant, tube (relevé)', bt.z1 - bt.z0, 1);
cote('Battant à fleur de la face avant du cadre', bt.z1 - ct.z1, 0);
cote('Jeu du battant, côté loquet', bt.x0 - (ct.x0 + 1.5), 0.5);
cote('Jeu du battant, côté pentures', (ct.x1 - 1.5) - bt.x1, 0.5);
cote('Jeu du battant, en haut', (ct.y1 - 1.5) - bt.y1, 0.5);
cote('Jeu du battant, sur la traverse du trépied', bt.y0 - f(0, 3, 8), 0.5);
const gr = boite(...nomme(battant, 'grillage'));
cote('Grillage, largeur entre montants', gr.x1 - gr.x0, 36);
cote('Grillage, dans le plan milieu du tube', (gr.z0 + gr.z1) / 2, (bt.z0 + bt.z1) / 2, 0.005);
// 18 fils verticaux sur les deux panneaux et 42 fils horizontaux de 36 po, fil de 3/16 po.
const lgFil = 18 * (bt.y1 - bt.y0 - 3) + 42 * 36;
cote('Grillage, volume de fil (60 fils de 3/16 po au pas de 2 po)', volume(nomme(battant, 'grillage')[0]), lgFil * Math.PI * (3 / 32) ** 2, 0.2, 'po³');
const po = boite(...nomme(battant, 'poignee'));
cote('Poignée, saillie devant le battant (axe, relevée)', po.z1 - 0.25 - FACE, 4, 0.02);
cote('Poignée, entraxe des pattes (relevé)', (po.y1 - po.y0) - 0.5, 6, 0.02);

const pent = ref(model, '6').map((o) => boite(...nomme(o, 'demi-basse'))).sort((a, b) => a.y1 - b.y1);
[f(13, 1, 8), f(48, 3, 8), 81].forEach((y, i) => cote(`Penture ${i + 1}, joint au-dessus des pieds`, pent[i].y1 - f(0, 3, 8), y));
cote('Pentures, fût devant la face avant', pent[0].z0 - FACE, 0, 0.005);
cote('Pentures, axe au milieu du jeu', (pent[0].x0 + pent[0].x1) / 2, 40.25);
const p6 = boite(ref(model, '6')[0]);
cote('Penture, longueur hors tout (« 6 po »)', p6.y1 - p6.y0, 6, 0.15);

const butees = ref(model, '4').map((o) => boite(o));
cote('Plaque de butée, retrait de la face arrière du cadre', butees[0].z0 - ct.z0, 0.25);
cote('Plaque de butée, appui au dos du battant', bt.z0 - butees[0].z1, 0, 0.005);
const anneaux = nomme(cadre, 'anneau');
vrai('Anneaux du cadre', anneaux.length === 11, `${anneaux.length} (3 en haut, 4 de chaque côté)`);
const an = boite(anneaux[0]);
cote('Anneau du haut, hauteur', an.y1 - ct.y1, 1.25, 0.02);
cote('Anneau, longueur', an.z1 - an.z0, 2, 0.02);

const boulons = ref(model, '8').map((o) => boite(o));
cote('Boulon de douille, longueur sous tête (1/2-13 × 2 3/4)', douilles[1].z1 - boulons[0].z0, 2.75, 0.01);
vrai('Nomenclature de la porte', ['1', '2', '3', '5'].every((r) => ref(model, r).length === 1) && ref(model, '4').length === 2 && ref(model, '6').length === 3
  && ref(model, '7').length === 2 && ref(model, '8').length === 2 && ref(model, '9').length === 4, '1 battant, 1 trépied, 1 cadre, 2 butées, 1 barrure, 3 pentures, 2 écrous, 2 + 4 boulons');

const vP = volume(model.root);
cote('Porte assemblée, masse à la densité du plan (1 g/cm³)', vP * DENSITE_DEFAUT, MASSE_PLAN.porte, 0.4, 'lb');
console.log(`  volume de matière : ${vP.toFixed(1)} po³ (plan : ${(MASSE_PLAN.porte / DENSITE_DEFAUT).toFixed(1)} po³) ; en acier : ${(vP * ACIER).toFixed(0)} lb (${(vP * ACIER * 0.4536).toFixed(0)} kg)`);

console.log('— Mouvements (corps Cadre, Battant, Verrou)');
const corps = { Cadre: 0, Battant: 0, Verrou: 0 };
let sans = 0;
model.root.traverse((o) => {
  if (!o.isMesh) return;
  let b;
  for (let p = o; p && !b; p = p.parent) b = p.userData.body;
  if (b) corps[b] += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; else sans++;
});
vrai('Chaque maillage appartient à un corps', sans === 0, Object.entries(corps).map(([k, v]) => `${k} ${v} triangles`).join(', '));
const barrure = ref(model, '5')[0];
const tete = boite(...nomme(barrure, 'tete'));
const lang = () => boite(...nomme(barrure, 'languette'));
vrai('Verrou engagé : la languette est dans la tête', lang().x0 < tete.x1 - 0.3 && lang().x0 > tete.x0, `bout à ${lang().x0.toFixed(2)} po, face de la tête à ${tete.x1.toFixed(2)} po`);
poser(model.root, 0, BARRURE.course);
vrai('Verrou tiré : la languette est sortie de la tête', lang().x0 > tete.x1 + 0.2, `bout à ${lang().x0.toFixed(2)} po, ${(lang().x0 - tete.x1).toFixed(2)} po de jeu`);
vrai('Verrou tiré : la barre reste dans son socle', boite(...nomme(barrure, 'barre')).x1 < 14.5);
vrai('Porte fermée : le battant ne touche rien', contact(0) === null);
vrai(`Ouverture d'usage de ${OUVERTURE.usage}° : le battant ne touche rien`, contact(OUVERTURE.usage) === null);
vrai('Butée d\'ouverture', OUVERTURE.max > 95 && OUVERTURE.max < 120 && contact(OUVERTURE.max) === null && contact(OUVERTURE.max + 0.2) !== null, `${OUVERTURE.max}°, contre : ${OUVERTURE.butee}`);
poser(model.root, 90, BARRURE.course);
const b90 = boite(...nomme(battant, 'tube'));
cote('À 90°, le battant est perpendiculaire au cadre (épaisseur vue de face)', b90.x1 - b90.x0, 1, 0.01);
cote('À 90°, le bord libre est devant le cadre', b90.z1 - FACE, 38 + PENTURE.x - 40 + 0.4, 0.02);
cote('À 90°, la moitié haute des pentures reste sur l\'axe', (() => { const h = boite(...nomme(ref(model, '6')[0], 'demi-haute')); return (h.x0 + h.x1) / 2; })(), PENTURE.x, 0.005);
vrai('Axe des pentures (repère du modèle, m)', Math.abs(AXE.x - (PENTURE.x - L / 2) * IN) < 1e-9, `x = ${AXE.x.toFixed(4)}, z = ${AXE.z.toFixed(4)}`);
poser(model.root, 0, 0);

console.log(`${failed ? 'ÉCHEC' : 'Conforme'} — ${n} contrôles`);
process.exit(failed ? 1 : 0);

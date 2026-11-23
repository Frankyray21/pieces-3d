// Contrôle du mécanisme de la clé à tube (exécuté dans Node, sans navigateur) :
// prise du nez, enveloppement des mâchoires, ouverture de la mâchoire crochet,
// passage du tube, animation (src/models/cle-a-tube/index.js).
// Usage : node scripts/check-cle-a-tube.mjs
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders, {
  R, TUBE, AXE_A, AXE_B, LIAISON, CROCHET, DENTS, OUVERT, RELACHE, COURSE, JEU_RETOUR, ENVELOPPE, PRESSION, STEPS,
  contourCrochet, contourJoue, contourSabot, contourManche, pointCrochet, pointManche, jeuNez, jeuCrochet, passage, dent, etat, momentFrottement,
} from '../src/models/cle-a-tube/index.js';

const RAD = Math.PI / 180;
let echecs = 0;
const proche = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;
function controle(nom, ok, detail = '') {
  if (!ok) echecs++;
  console.log(`${ok ? '✓' : '✕'} ${nom}${detail ? ` — ${detail}` : ''}`);
}
const rayon = (p) => Math.hypot(p[0], p[1]);
const polaire = (p) => Math.atan2(p[1], p[0]) / RAD;

// Mâchoires : arcs de prise au rayon du tube, rien dans le tube.
controle('rayon de prise = rayon du tube', proche(R, TUBE.d / 2) && proche(jeuCrochet(0), 0) && Math.min(...contourSabot().map(rayon)) >= R - 1e-9);
controle('joues en retrait du tube', proche(Math.min(...contourJoue().map(rayon)), R + LIAISON.retrait, 1e-6));
controle('enveloppement des deux mâchoires', ENVELOPPE === (LIAISON.de - LIAISON.a) + (CROCHET.de - CROCHET.a) && ENVELOPPE > 240 && ENVELOPPE < 300, `${ENVELOPPE}°`);
// L'arc du crochet commence avant le boulon (vu du tube) : il s'écarte du tube dès qu'il s'ouvre.
const dirB = Math.atan2(AXE_B.y, AXE_B.x) / RAD;
controle('arc du crochet du côté du boulon qui s\'écarte', CROCHET.de <= dirB, `début à ${CROCHET.de}°, boulon à ${dirB.toFixed(1)}°`);
let pire = Infinity;
for (let phi = 0.5; phi <= OUVERT; phi += 0.5) pire = Math.min(pire, jeuCrochet(phi));
controle('crochet hors du tube sur toute son ouverture', pire > 0, `jeu minimal ${pire.toFixed(3)} mm`);
// Ouvert, il ne heurte ni le sabot ni la tête du manche.
const dansSabot = (p) => rayon(p) > R && rayon(p) < R + LIAISON.ep && polaire(p) > LIAISON.a && polaire(p) < LIAISON.de;
let heurt = false;
for (let phi = 0; phi <= OUVERT; phi += 1) if (contourCrochet().some((p) => dansSabot(pointCrochet(p, phi)))) heurt = true;
controle('crochet et sabot ne se heurtent pas', !heurt);

// Nez du manche : la dent du milieu touche le tube, les autres non ; relevé, tout est dégagé.
const jeux = DENTS.map((_, i) => rayon(dent(i)) - R);
controle('dent du milieu en prise, les deux autres dégagées', proche(jeux[1], 0, 1e-9) && jeux[0] > 0.5 && jeux[2] > 0.5, jeux.map((j) => j.toFixed(2)).join(' / '));
controle('nez en prise sans entrer dans le tube', proche(jeuNez(0), 0, 1e-9));
controle('manche relevé : nez dégagé', jeuNez(RELACHE) > 1, `${jeuNez(RELACHE).toFixed(2)} mm`);
// En appuyant (rotation inverse du relevé), la dent en prise s'enfonce : elle coince.
controle('la dent se coince quand on appuie', rayon(dent(1, -1)) < R && rayon(dent(1, 1)) > R);
controle('angle de pression sous l\'angle de frottement (acier sur acier, 0,3)', PRESSION < Math.atan(0.3) / RAD, `${PRESSION.toFixed(1)}° < ${(Math.atan(0.3) / RAD).toFixed(1)}°`);
// La dent du bas prend le relais plus loin.
let relais = null;
for (let a = 0; a <= 20 && relais == null; a += 0.05) if (rayon(dent(2, -a)) <= R) relais = a;
controle('dent du bas en relais', relais != null && relais > 4 && relais < 12, `${relais?.toFixed(1)}°`);
// Sens de travail : du côté de son bout, le frottement du tube referme le crochet.
controle('frottement qui referme le crochet vers son bout', momentFrottement(CROCHET.a) < 0 && momentFrottement(-90) < 0 && momentFrottement(CROCHET.de) > 0,
  `${momentFrottement(CROCHET.a).toFixed(0)} mm au bout, ${momentFrottement(CROCHET.de).toFixed(0)} mm au boulon`);

// Passage du tube, crochet ouvert et manche relevé ; fermé, le tube est pris.
controle('le tube passe, crochet ouvert et manche relevé', passage() >= 0.9, `${passage().toFixed(2)} mm`);
controle('le tube ne passe pas, crochet fermé', passage(0, RELACHE) < 0);

// Manche et crochet : pièces rigides (longueurs gardées par la cinématique).
const A = [AXE_A.x, AXE_A.y], B = [AXE_B.x, AXE_B.y];
const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
controle('rotations autour des axes', contourManche().every((p) => proche(d(pointManche(p, 13), A), d(p, A), 1e-9)) && contourCrochet().every((p) => proche(d(pointCrochet(p, 47), B), d(p, B), 1e-9)));

// Animation : états de départ et de fin de chaque étape.
const e0 = etat([0, 0, 0, 0, 0]), e1 = etat([1, 0, 0, 0, 0]), e2 = etat([1, 1, 0, 0, 0]), e3 = etat([1, 1, 1, 0, 0]), e4 = etat([1, 1, 1, 1, 0]), e5 = etat([1, 1, 1, 1, 1]);
controle('départ : clé reculée, crochet ouvert, manche relevé', e0.recul > 100 && proche(e0.phi, OUVERT) && proche(e0.psi, RELACHE) && proche(e0.tube, 0));
controle('étape 1 : clé sur le tube', proche(e1.recul, 0) && proche(e1.phi, OUVERT));
controle('étape 2 : crochet fermé', proche(e2.phi, 0) && proche(e2.psi, RELACHE));
controle('étape 3 : nez en prise, tube entraîné', proche(e3.psi, 0) && proche(e3.tour, COURSE) && proche(e3.tube, COURSE));
controle('étape 4 : retour, le tube reste', proche(e4.tour, 0) && proche(e4.tube, COURSE) && proche(e4.psi, RELACHE) && proche(e4.phi, JEU_RETOUR));
controle('étape 5 : deuxième course', proche(e5.tour, COURSE) && proche(e5.tube, 2 * COURSE) && proche(e5.psi, 0) && proche(e5.phi, 0));
// Pendant qu'elle entraîne le tube, la clé est en prise ; pendant le retour, le nez est dégagé.
let prise = true, libre = true;
for (let k = 0.31; k <= 1; k += 0.03) { const e = etat([1, 1, k, 0, 0]); if (e.psi > 1e-9 || !proche(e.tour, e.tube)) prise = false; }
for (let k = 0.26; k <= 1; k += 0.03) { const e = etat([1, 1, 1, k, 0]); if (!proche(e.psi, RELACHE) || !proche(e.tube, COURSE)) libre = false; }
controle('course de travail en prise, retour dégagé', prise && libre);
controle('une légende par étape', STEPS.length === 6 && STEPS.every((s) => s.title && s.text));

// Modèle : pièces des deux pages, tube de la scène au bon diamètre.
const m1 = buildProcedural(builders, 'P01'), m2 = buildProcedural(builders, 'P02');
controle('pièces de la page P01', ['1', '2', '3', '4', '5', '6', '7'].every((r) => m1.refs.get(r)?.length === 1) && m1.refs.size === 7);
controle('pièces de la page P02', ['1', '2', '3', '4', '5', '6', '7', '8'].every((r) => m2.refs.get(r)?.length === 1));
const boite = new THREE.Box3().setFromObject(m2.refs.get('8')[0]), t = boite.getSize(new THREE.Vector3());
controle('tube de la scène, debout sur le plan', proche(t.x * 1000, TUBE.d, 0.1) && boite.min.y > -1e-6, `Ø ${(t.x * 1000).toFixed(1)} mm, ${(t.y * 1000).toFixed(0)} mm de haut`);
controle('clé posée sur le plan', new THREE.Box3().setFromObject(m1.root).min.y >= 0);

console.log(echecs ? `${echecs} contrôle(s) en échec` : 'Tout est conforme.');
process.exit(echecs ? 1 : 0);

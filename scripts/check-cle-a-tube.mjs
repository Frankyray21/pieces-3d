// Contrôle du mécanisme de la clé à tube (exécuté dans Node, sans navigateur) :
// enveloppement des mâchoires, ergot du crochet et coche du manche, ouverture
// de la mâchoire crochet, passage du tube, animation (src/models/cle-a-tube/index.js).
// Usage : node scripts/check-cle-a-tube.mjs
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders, {
  R, TUBE, AXE_A, AXE_B, LIAISON, CROCHET, COCHE, CARBURE, MANCHE, OUVERT, RELACHE, LEVE, COURSE, JEU_RETOUR, ENVELOPPE, R_ERGOT, PAS_ERGOT, APPUI,
  BRAS, LEVIER, POUSSEE, MOMENT_COCHE, STEPS, contourCrochet, contourJoue, contourSabot, contourManche, pointCrochet, pointManche,
  jeuNez, jeuCrochet, jeuCoche, heurt, passage, etat,
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
let touche = false;
for (let phi = 0; phi <= OUVERT; phi += 1) if (contourCrochet().some((p) => dansSabot(pointCrochet(p, phi)))) touche = true;
controle('crochet et sabot ne se heurtent pas', !touche);

// Ergot du crochet : au bout, sur le dos ; mâchoire fermée, il est au fond de la coche du manche.
const ergot = contourCrochet().filter((p) => rayon(p) > R + CROCHET.ep + 0.5 && polaire(p) < CROCHET.a + PAS_ERGOT + 1);
controle('ergot au bout du crochet, sur son dos', ergot.length >= 4 && proche(Math.max(...ergot.map(rayon)), R_ERGOT, 1e-6) && proche(rayon(APPUI), R_ERGOT, 1e-9), `dessus à ${R_ERGOT.toFixed(1)} mm du centre, ${PAS_ERGOT.toFixed(1)}° de large`);
controle('en prise, le fond de la coche porte sur l\'ergot', proche(jeuCoche(0), 0, 1e-9) && !heurt(0, 0));
controle('la coche bute sur l\'ergot : le manche ne peut pas descendre plus', heurt(0, -1) && heurt(0, -3));
controle('manche relevé : la coche a quitté l\'ergot', jeuCoche(RELACHE) > 3 && jeuCoche(LEVE) > jeuCoche(RELACHE), `${jeuCoche(RELACHE).toFixed(1)} mm à ${RELACHE}°, ${jeuCoche(LEVE).toFixed(1)} mm à ${LEVE}°`);
// La coche presse l'ergot vers le centre du tube, et cette poussée referme le crochet.
controle('la coche presse l\'ergot droit sur le tube', POUSSEE < 15, `à ${POUSSEE.toFixed(1)}° de la droite ergot–centre`);
controle('la poussée de la coche referme le crochet', MOMENT_COCHE < 0, `moment de ${MOMENT_COCHE.toFixed(1)} mm par unité d'effort autour du boulon`);
controle('bras de levier du manche', proche(BRAS, Math.hypot(APPUI[0] - AXE_A.x, APPUI[1] - AXE_A.y), 1e-9) && LEVIER > 8 && LEVIER < 20, `${BRAS.toFixed(1)} mm, rapport ${LEVIER.toFixed(1)}`);
// Le nez du manche longe le tube sans le toucher, à toutes ses positions.
let nez = Infinity;
for (let psi = 0; psi <= LEVE; psi += 0.5) nez = Math.min(nez, jeuNez(psi));
controle('le manche ne touche jamais le tube', proche(jeuNez(0), COCHE.nez, 1e-6) && nez > 1, `${jeuNez(0).toFixed(2)} mm en prise, ${nez.toFixed(2)} mm au plus près`);
// Manche relevé, la mâchoire crochet s'ouvre et se referme sans le toucher.
let libre = true;
for (const psi of [RELACHE, LEVE]) for (let phi = 0; phi <= OUVERT; phi += 0.5) if (heurt(phi, psi)) libre = false;
controle('manche relevé : le crochet s\'ouvre sans toucher la coche', libre);
controle('manche appuyé : le crochet est tenu fermé par la coche', [1, 2, 4, 8].every((phi) => heurt(phi, 0)));
// Dents de carbure : dans les arcs de prise, en saillie sur la face.
controle('dents de carbure dans les arcs de prise', CARBURE.liaison.every((a) => a < LIAISON.de - 4 && a > LIAISON.a + 4) && CARBURE.crochet.every((a) => a < CROCHET.de - 4 && a > CROCHET.a + 4) && CARBURE.saillie > 0 && CARBURE.saillie < 1.5,
  `${CARBURE.liaison.length} + ${CARBURE.crochet.length}, saillie de ${CARBURE.saillie} mm`);

// Passage du tube, crochet ouvert et manche relevé ; fermé, le tube est pris.
controle('le tube passe, crochet ouvert et manche relevé', passage() >= 0.9, `${passage().toFixed(2)} mm`);
controle('le tube ne passe pas, crochet fermé', passage(0, RELACHE) < 0);

// Manche et crochet : pièces rigides (longueurs gardées par la cinématique).
const A = [AXE_A.x, AXE_A.y], B = [AXE_B.x, AXE_B.y];
const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
controle('rotations autour des axes', contourManche().every((p) => proche(d(pointManche(p, 13), A), d(p, A), 1e-9)) && contourCrochet().every((p) => proche(d(pointCrochet(p, 47), B), d(p, B), 1e-9)));

// Animation : états de départ et de fin de chaque étape.
const e0 = etat([0, 0, 0, 0, 0]), e1 = etat([1, 0, 0, 0, 0]), e2 = etat([1, 1, 0, 0, 0]), e3 = etat([1, 1, 1, 0, 0]), e4 = etat([1, 1, 1, 1, 0]), e5 = etat([1, 1, 1, 1, 1]);
controle('départ : clé reculée, crochet ouvert, manche relevé', e0.recul > 100 && proche(e0.phi, OUVERT) && proche(e0.psi, LEVE) && proche(e0.tube, 0));
controle('étape 1 : clé sur le tube', proche(e1.recul, 0) && proche(e1.phi, OUVERT));
controle('étape 2 : crochet fermé', proche(e2.phi, 0) && proche(e2.psi, LEVE));
controle('étape 3 : coche sur l\'ergot, tube entraîné', proche(e3.psi, 0) && proche(e3.tour, COURSE) && proche(e3.tube, COURSE));
controle('étape 4 : retour, le tube reste', proche(e4.tour, 0) && proche(e4.tube, COURSE) && proche(e4.psi, RELACHE) && proche(e4.phi, JEU_RETOUR));
controle('étape 5 : deuxième course', proche(e5.tour, COURSE) && proche(e5.tube, 2 * COURSE) && proche(e5.psi, 0) && proche(e5.phi, 0));
// Pendant qu'elle entraîne le tube, la clé est en prise ; pendant le retour, la coche est dégagée.
let prise = true, degage = true;
for (let k = 0.31; k <= 1; k += 0.03) { const e = etat([1, 1, k, 0, 0]); if (e.psi > 1e-9 || e.phi > 1e-9 || !proche(e.tour, e.tube)) prise = false; }
for (let k = 0.31; k <= 1; k += 0.03) { const e = etat([1, 1, 1, k, 0]); if (!proche(e.psi, RELACHE) || !proche(e.tube, COURSE)) degage = false; }
controle('course de travail en prise, retour dégagé', prise && degage);
// À aucun moment le manche et la mâchoire crochet ne se pénètrent, ni le manche ne touche le tube.
let heurts = 0, pres = Infinity, entre = Infinity;
for (let e = 0; e < 5; e++) for (let t = 0; t <= 1.0001; t += 0.005) {
  const s = etat([0, 0, 0, 0, 0].map((_, i) => (i < e ? 1 : i === e ? t : 0)));
  if (heurt(s.phi, s.psi)) heurts++;
  pres = Math.min(pres, jeuNez(s.psi));
  entre = Math.min(entre, jeuCrochet(s.phi)); // 0 quand la mâchoire porte sur le tube
}
controle('animation sans pénétration entre les pièces', heurts === 0 && pres > 1 && entre > -1e-6, `${heurts} heurt(s) ; le manche reste à ${pres.toFixed(2)} mm du tube au moins`);
controle('une légende par étape', STEPS.length === 6 && STEPS.every((s) => s.title && s.text));

// Modèle : pièces des deux pages, tube de la scène au bon diamètre.
const m1 = buildProcedural(builders, 'P01'), m2 = buildProcedural(builders, 'P02');
const nDents = CARBURE.liaison.length + CARBURE.crochet.length;
controle('pièces de la page P01', ['1', '2', '3', '4', '5', '6', '7'].every((r) => m1.refs.get(r)?.length === 1) && m1.refs.get('8')?.length === nDents && m1.refs.size === 8);
controle('pièces de la page P02', ['1', '2', '3', '4', '5', '6', '7', '9'].every((r) => m2.refs.get(r)?.length === 1) && m2.refs.get('8')?.length === nDents);
const boite = new THREE.Box3().setFromObject(m2.refs.get('9')[0]), t = boite.getSize(new THREE.Vector3());
controle('tube de la scène, debout sur le plan', proche(t.x * 1000, TUBE.d, 0.1) && boite.min.y > -1e-6, `Ø ${(t.x * 1000).toFixed(1)} mm, ${(t.y * 1000).toFixed(0)} mm de haut`);
controle('clé posée sur le plan', new THREE.Box3().setFromObject(m1.root).min.y >= 0);

console.log(echecs ? `${echecs} contrôle(s) en échec` : 'Tout est conforme.');
process.exit(echecs ? 1 : 0);

// Contrôle du fonctionnement du niveau à degrés (exécuté dans Node, sans navigateur) :
// angle lu sous l'aiguille, place de la bulle dans la fiole, pose de l'outil sur une
// pente (src/models/niveau-a-degres/index.js).
// Usage : node scripts/check-niveau-degres.mjs
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders, { L, H, RAPPORT, COURBURE, FIOLE, RACK, AIMANT, lecture, bulle, graduation, regler, mobiles, verdictRack } from '../src/models/niveau-a-degres/index.js';

const RAD = Math.PI / 180;
let echecs = 0;
const proche = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;
function controle(nom, ok, detail = '') {
  if (!ok) echecs++;
  console.log(`${ok ? '✓' : '✕'} ${nom}${detail ? ` — ${detail}` : ''}`);
}
/** Verticale dans le repère de l'outil posé sur une pente de p degrés. */
const haut = (p) => [Math.sin(p * RAD), Math.cos(p * RAD), 0];

// Cadran : 0 en haut et en bas, 90 aux côtés ; pente de 12 po par pied à 45°.
controle('graduations', proche(graduation(90), 0) && proche(graduation(270), 0) && proche(graduation(0), 90) && proche(graduation(180), 90) && proche(graduation(90 - 37), 37));
controle('lecture sous l\'aiguille', proche(lecture(0).deg, 0) && proche(lecture(-23).deg, 23) && proche(lecture(23).deg, 23) && proche(lecture(90).deg, 90) && proche(lecture(135).deg, 45) && proche(lecture(180).deg, 0));
controle('pente à 45° : 12 po par pied, 100 %', proche(lecture(45).pente, 12, 1e-9) && proche(lecture(45).pourcent, 100, 1e-9));

// Bulle : au milieu quand la fiole est de niveau, quelle que soit la pente de la surface.
let pire = 0;
for (let p = -90; p <= 90; p += 0.5) pire = Math.max(pire, Math.abs(bulle(haut(p), -p).x));
controle('bulle centrée quand le tambour rattrape la pente', pire < 1e-9, `écart maximal ${pire.toExponential(1)} mm`);
// Et la lecture est alors la pente de la surface.
let faux = 0;
for (let p = -90; p <= 90; p += 0.5) if (!proche(lecture(-p).deg, Math.abs(p), 1e-9)) faux++;
controle('lecture = pente de la surface, bulle centrée', faux === 0);
// Elle monte vers le bout le plus haut, de COURBURE × tan(écart), et bute au bout.
const b3 = bulle(haut(3), 0), b20 = bulle(haut(20), 0), bm3 = bulle(haut(-3), 0);
controle('bulle vers le bout le plus haut', b3.x > 0 && bm3.x < 0 && proche(b3.x, -bm3.x) && proche(b3.x, COURBURE * Math.tan(3 * RAD), 1e-9), `${b3.x.toFixed(2)} mm à 3°`);
controle('bulle en butée', proche(b20.x, b20.course) && proche(b20.course, (FIOLE.vue + 3) / 2 - FIOLE.bulle.long / 2), `course ${b20.course} mm`);
// Contre la paroi du haut ; outil à plat (face vers le ciel) : au milieu, contre la face.
const plat = bulle([0, 0, 1], 0), retourne = bulle(haut(0), 180);
controle('bulle contre la paroi du haut', bulle(haut(0), 0).y > 0 && retourne.y < 0 && proche(retourne.x, 0) && proche(plat.x, 0) && plat.z > 0 && proche(plat.y, 0));
// Fiole debout : la bulle au bout du haut, au centre du tube.
const debout = bulle(haut(0), 90);
controle('fiole debout', proche(debout.x, debout.course) && proche(debout.y, 0, 1e-9));

// Rack à tiges : plage fermée de 75° à 80°, lue bulle centrée sur le support penché.
controle('plage du rack à tiges', RACK.min === 75 && RACK.max === 80 && verdictRack(74.9) === 'couche' && verdictRack(75) === 'conforme' && verdictRack(77.5) === 'conforme'
  && verdictRack(80) === 'conforme' && verdictRack(80.1) === 'debout' && verdictRack(lecture(-RACK.pose).deg) === 'conforme' && verdictRack(lecture(-72).deg) === 'couche' && verdictRack(lecture(-84).deg) === 'debout');

// Modèle : pièces mobiles présentes, pose sur une pente.
const model = buildProcedural(builders, 'P01');
const m = mobiles(model.root);
controle('pièces mobiles du modèle', !!(m.tambour && m.fiole && m.molette && m.bulle));
// Bande aimantée : sous la règle de base, en retrait de la face de mesure (l'outil porte sur l'aluminium).
const boiteAimant = new THREE.Box3().setFromObject(model.refs.get('9')[0]);
// Sommets en simple précision : contrôle au micromètre.
controle('bande aimantée en retrait de la face de mesure', proche(boiteAimant.min.y, AIMANT.retrait / 1000, 1e-6) && boiteAimant.max.y <= AIMANT.ep / 1000 + 1e-6 && proche(boiteAimant.max.x - boiteAimant.min.x, L / 1000, 1e-6));
for (const [pente, cadran] of [[30, -30], [-47.5, 47.5], [90, -90], [0, 12]]) {
  regler(model.root, { pente, cadran });
  // Axe de la fiole dans le monde : horizontal si le tambour rattrape la pente.
  const axe = new THREE.Vector3(1, 0, 0).transformDirection(m.fiole.matrixWorld);
  const attendu = Math.sin((pente + cadran) * RAD);
  // L'outil reste posé : son coin le plus bas touche le sol.
  const coins = [[0, 0], [L, 0], [L, H], [0, H]].map(([x, y]) => model.root.localToWorld(new THREE.Vector3(x / 1000, y / 1000, 0)).y);
  controle(`pose : pente ${pente}°, tambour ${cadran}°`, proche(axe.y, attendu, 1e-9) && proche(Math.min(...coins), 0, 1e-9)
    && proche(m.molette.rotation.z, -cadran * RAD * RAPPORT, 1e-12) && proche(m.tambour.rotation.z, cadran * RAD, 1e-12));
}

console.log(echecs ? `${echecs} contrôle(s) en échec` : 'Tout est conforme.');
process.exit(echecs ? 1 : 0);

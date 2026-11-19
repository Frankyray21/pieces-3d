// Contrôle chiffré de la pompe Bean 420 (American Manufacturing AL0918B) contre son
// manuel : cotes de la figure 7, du tableau 8 et de la section 2.0 (« cote »), et
// relevés sur le tracé des figures 2A, 2B et 3 (« relevé »), en pouces. Puis sa pose
// sur le tube à l'eau 1524010812 : pose supposée, mais rien ne doit se traverser.
//
// Usage : node scripts/check-pompe-bean-420.mjs
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders, { COTE, RELEVE, DENTURE } from '../src/models/pompe-bean-420/index.js';
import bac, { POSE_POMPE } from '../src/models/tube-eau/index.js';

const IN = 0.0254;
const meca = buildProcedural(builders, 'P02');
const hydro = buildProcedural(builders, 'P03');
for (const m of [meca, hydro]) m.root.updateMatrixWorld(true);

/** Boîte d'un objet (ou d'une liste d'objets) en pouces. */
function boite(objs) {
  const b = new THREE.Box3();
  [objs].flat().forEach((o) => b.expandByObject(o));
  return { x0: b.min.x / IN, x1: b.max.x / IN, y0: b.min.y / IN, y1: b.max.y / IN, z0: b.min.z / IN, z1: b.max.z / IN };
}
const milieu = (b, k) => (b[`${k}0`] + b[`${k}1`]) / 2;
const M = (ref) => meca.refs.get(ref), H = (ref) => hydro.refs.get(ref);

let failed = false, n = 0;
function mesure(nom, v, attendu, tol, source) {
  n++;
  const ok = Math.abs(v - attendu) <= tol;
  if (!ok) failed = true;
  console.log(`${ok ? '✓' : '✕'} ${nom} : ${v.toFixed(3)} po (${source} : ${attendu})`);
}
const cote = (nom, v, attendu, tol = 0.005) => mesure(nom, v, attendu, tol, 'cote');
const releve = (nom, v, attendu, tol = 0.005) => mesure(nom, v, attendu, tol, 'relevé');
const compte = (nom, v, attendu) => { n++; const ok = v === attendu; if (!ok) failed = true; console.log(`${ok ? '✓' : '✕'} ${nom} : ${v} (attendu : ${attendu})`); };

console.log('— Encombrement (figure 7)');
const goujons = boite([...H('58'), ...H('59')]);
const couvercle = boite(M('15'));
const arbre = boite(M('3'));
const tout = boite([...meca.parts.filter((p) => p.userData.partRef !== '19'), ...hydro.parts]);
cote('Longueur hors tout, du bout des goujons au couvercle arrière', couvercle.x1 - goujons.x0, COTE.long);
cote('Largeur hors tout, du bout de l\'arbre aux vis du côté borgne', tout.z1 - tout.z0, COTE.large, 0.02);
cote('Hauteur hors tout, au bout des goujons de couvercle de clapet', boite(H('52')).y1 - tout.y0, COTE.haut);
cote('Dessous des pattes à la base', tout.y0, 0);
const robinet = boite(M('19'));
console.log(`  Le robinet de niveau dépasse du couvercle arrière de ${(robinet.x1 - couvercle.x1).toFixed(2)} po (hors cote).`);

console.log('— Arbre d\'entrée et refoulement');
cote('Arbre d\'entrée, hauteur de l\'axe', milieu(arbre, 'y'), COTE.arbre.y);
cote('Arbre d\'entrée, depuis l\'axe des clapets', milieu(arbre, 'x'), COTE.arbre.x);
cote('Arbre d\'entrée, bout depuis l\'axe de la pompe', -arbre.z0, COTE.arbre.bout);
cote('Arbre d\'entrée, saillie du boîtier', boite(M('17')).z0 - arbre.z0, COTE.arbre.saillie);
cote('Clavette, largeur', boite(M('26')).x1 - boite(M('26')).x0, COTE.arbre.clavette.w);
const boiteClapets = H('38')[0];
const orifices = boiteClapets.children.slice(-2).map((o) => boite(o));
cote('Refoulement de 1 po NPT, hauteur de l\'axe', milieu(orifices[0], 'y'), COTE.refoulement);
releve('Refoulement, sur l\'axe des clapets', milieu(orifices[0], 'x'), 0);
releve('Collecteur de refoulement, largeur', orifices[1].z1 - orifices[0].z0, 12.5, 0.03);

console.log('— Cylindres et pistons');
const chemises = H('56').map((o) => boite(o)).sort((a, b) => a.z0 - b.z0);
releve('Cylindres, entraxe', milieu(chemises[1], 'z') - milieu(chemises[0], 'z'), RELEVE.pas);
releve('Cylindres, entraxe (suite)', milieu(chemises[2], 'z') - milieu(chemises[1], 'z'), RELEVE.pas);
releve('Cylindre du milieu, sur l\'axe de la pompe', milieu(chemises[1], 'z'), 0);
releve('Axe des cylindres, hauteur', milieu(chemises[1], 'y'), RELEVE.axeCyl);
releve('Chemise, diamètre extérieur', chemises[0].y1 - chemises[0].y0, 2 * RELEVE.chemise.ro);
releve('Chemise, longueur', chemises[0].x1 - chemises[0].x0, RELEVE.chemise.x1 - RELEVE.chemise.x0);
const coupelle = boite(H('40')[0]);
cote('Coupelle de piston, diamètre (alésage de 2,25 po)', coupelle.y1 - coupelle.y0, COTE.alesage, 0.02);
const billes = H('62').map((o) => boite(o));
releve('Bille de clapet, diamètre', billes[0].y1 - billes[0].y0, RELEVE.bille);
compte('Billes de clapet', billes.length, 6);
// Course : les trois pistons sont calés à 120° ; celui du milieu est au point mort arrière.
const pieds = M('6').map((o) => boite(o)).sort((a, b) => a.z0 - b.z0);
cote('Axe de pied de bielle, diamètre', pieds[0].y1 - pieds[0].y0, COTE.axePied);
const reculs = pieds.map((p) => milieu(pieds[1], 'x') - milieu(p, 'x'));
releve('Piston du milieu au point mort arrière (recul des deux autres, 1,60 po à 120°)', reculs[0], 1.6045, 0.002);
releve('Pistons 1 et 3 à la même cote (calage symétrique)', reculs[0] - reculs[2], 0);
const crosses = M('7').map((o) => boite(o));
cote('Crosse, diamètre', crosses[0].z1 - crosses[0].z0, COTE.crosse);
const coussinet = boite(M('5')[0]);
cote('Coussinet de bielle, sur un maneton de Ø 2,874 po', coussinet.y1 - coussinet.y0 - 0.13, COTE.maneton);

console.log('— Goujons de culasse (grille relevée)');
const pos = [...H('58'), ...H('59')].map((o) => boite(o)).map((b) => [milieu(b, 'z'), milieu(b, 'y') - RELEVE.axeCyl]);
compte('Goujons de culasse', pos.length, 8);
compte('Goujons sur la grille de 3 × 3 po', pos.filter(([z, y]) => RELEVE.goujon.z.some((g) => Math.abs(g - z) < 0.005) && Math.abs(Math.abs(y) - RELEVE.goujon.y) < 0.005).length, 8);
const coins = H('59').map((o) => boite(o)).map((b) => [Math.sign(milieu(b, 'z')), Math.sign(milieu(b, 'y') - RELEVE.axeCyl)]);
compte('Goujons d\'angle aux coins opposés', coins[0][0] * coins[1][0] + coins[0][1] * coins[1][1], -2);
compte('Écrous des goujons de culasse', H('61').length, 8);

console.log('— Réducteur (calculé : entraxe relevé, rapport de 3,6:1)');
const vilebrequin = boite(M('2'));
releve('Vilebrequin, derrière l\'arbre d\'entrée', RELEVE.vilebrequin - COTE.arbre.x, 3.558);
releve('Entraxe pignon–roue', DENTURE.pignon + DENTURE.roue, +Math.hypot(RELEVE.vilebrequin - COTE.arbre.x, COTE.arbre.y - RELEVE.axeCyl).toFixed(3), 0.001);
compte('Rapport de réduction (× 1000)', Math.round((1000 * DENTURE.roue) / DENTURE.pignon), 1000 * COTE.rapport);
releve('Vilebrequin, sur l\'axe des cylindres (milieu de la roue)', milieu(vilebrequin, 'x'), RELEVE.vilebrequin, 0.2);

console.log('— Pattes de fixation (trous 1/2-13 non percés dans le modèle)');
// Un rayon tiré vers le haut depuis la base, à l'aplomb de chaque trou, doit toucher une patte du bâti à y = 0.
const bati = M('1')[0];
const rayon = new THREE.Raycaster();
const f = COTE.fixation;
for (const [nom, x, z] of [['avant gauche', f.avant.x, -f.avant.z], ['avant droit', f.avant.x, f.avant.z], ['arrière gauche', f.arriere.x, -f.arriere.z], ['arrière droit', f.arriere.x, f.arriere.z], ['arrière milieu', f.arriere.x, 0]]) {
  rayon.set(new THREE.Vector3(x * IN, -0.05, z * IN), new THREE.Vector3(0, 1, 0));
  const touche = rayon.intersectObject(bati, true)[0];
  cote(`Trou ${nom} : patte à la base`, touche ? touche.point.y / IN : NaN, 0, 0.002);
}

console.log('— Pose sur le tube à l\'eau 1524010812 (supposée)');
const tub = buildProcedural(bac, 'P01');
tub.root.updateMatrixWorld(true);
const T = (ref) => tub.refs.get(ref);
const traverse = boite(T('4')), plaque1 = boite(T('1'));
const pompe = T('11')[0];
const bp = boite(pompe);
const jeu = (nom, v, min = 0.25) => { n++; const ok = v >= min; if (!ok) failed = true; console.log(`${ok ? '✓' : '✕'} ${nom} : ${v.toFixed(3)} po (au moins ${min})`); };
releve('Pattes de la pompe sur le fond de la traverse', bp.y0 - (traverse.y0 + 0.1875), 0);
const origine = pompe.getWorldPosition(new THREE.Vector3()); // axe des clapets, base et axe de la pompe
releve('Axe de la pompe sur celui de la traverse', origine.x / IN - milieu(traverse, 'x'), 0);
releve('Axe des clapets, derrière la barre avant', origine.z / IN - milieu(boite(T('5')[1]), 'z'), POSE_POMPE.barre);
jeu('Jeu des goujons de culasse à la face avant du bac', plaque1.z1 - bp.z1);
jeu('Jeu du robinet de niveau à la face arrière du bac', bp.z0 - plaque1.z0);
// Chaque maillage de la pompe contre chaque barre : boîtes disjointes, à 0,1 po près.
const barres = T('5').map((o) => new THREE.Box3().setFromObject(o).expandByScalar(0.1 * IN));
let touches = 0;
const mb = new THREE.Box3();
pompe.traverse((o) => { if (o.isMesh && barres.some((b) => b.intersectsBox(mb.setFromObject(o)))) touches++; });
compte('Maillages de la pompe qui touchent une barre', touches, 0);
// Sous le niveau du dessus du bac, la pompe tient entre les flancs de la traverse.
const flancs = { x0: traverse.x0 + 1 + 0.1875, x1: traverse.x1 - 1 - 0.1875 };
let hors = 0;
pompe.traverse((o) => {
  if (!o.isMesh) return;
  const b = boite(o);
  if (b.y0 < traverse.y1 - 0.01 && (b.x0 < flancs.x0 || b.x1 > flancs.x1)) hors++;
});
compte('Maillages de la pompe hors des flancs de la traverse, sous le dessus du bac', hors, 0);

console.log(`${failed ? 'ÉCHEC' : 'Conforme'} — ${n} mesures`);
process.exit(failed ? 1 : 0);

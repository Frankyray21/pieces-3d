// Contrôle chiffré de la pompe Bean 420 (American Manufacturing AL0918B) contre son
// manuel : cotes de la figure 7, du tableau 8 et de la section 2.0 (« cote »), et
// relevés sur le tracé des figures 2A, 2B et 3 (« relevé »), en pouces. Puis sa
// fixation sur le tube à l'eau 1524010812 sans le modifier : l'embase proposée doit
// remplir le logement du bac, tenir sous ses barres et porter le gabarit de la pompe.
// Enfin l'entraînement et le circuit d'eau (indicatifs) : jeux de l'aspiration, du
// moteur et de la cloche, et aucune pièce ni aucun boyau qui traverse le bac, la pompe
// ou une autre pièce (test de parité d'un rayon sur les sommets).
//
// Usage : node scripts/check-pompe-bean-420.mjs
import * as THREE from 'three';
import { buildProcedural } from '../src/viewer/assembly.js';
import builders, { COTE, RELEVE, DENTURE } from '../src/models/pompe-bean-420/index.js';
import bac, { POSE_POMPE, EMBASE, TROUS_POMPE, D, L, PIED, T as TOLE, TRAV, geometrieCircuit } from '../src/models/tube-eau/index.js';
import { PALIER } from '../src/models/pompe-bean-420/index.js';

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

console.log('— Fixation sur le tube à l\'eau 1524010812, sans le modifier (embase proposée)');
const tub = buildProcedural(bac, 'P01');
tub.root.updateMatrixWorld(true);
const T = (ref) => tub.refs.get(ref);
const traverse = boite(T('4')), plaque1 = boite(T('1'));
const barres = T('5').map((o) => boite(o)).sort((a, b) => a.z0 - b.z0);
const pompe = T('11')[0];
const bp = boite(pompe);
const jeu = (nom, v, min = 0.25) => { n++; const ok = v >= min; if (!ok) failed = true; console.log(`${ok ? '✓' : '✕'} ${nom} : ${v.toFixed(3)} po (au moins ${min})`); };
// Le logement qu'offre le bac : entre les flancs de la traverse, sous les barres.
const fond = traverse.y0 + 0.1875;
const flancs = { x0: traverse.x0 + 1 + 0.1875, x1: traverse.x1 - 1 - 0.1875 };
releve('Logement du bac, largeur entre les flancs de la traverse', flancs.x1 - flancs.x0, 15.0625);
releve('Logement du bac, hauteur sous les barres', barres[0].y0 - fond, 2);
releve('Barres, d\'axe en axe', milieu(barres[1], 'z') - milieu(barres[0], 'z'), 20.125);
// L'embase : cadre (deux traverses, deux longerons) puis plaque.
const pieces = T('12')[0].children[0].children.map((o) => boite(o));
const cadre = pieces.slice(0, 4), plaque = pieces[4];
const e = boite(T('12'));
releve('Embase, posée sur le fond de la traverse', e.y0 - fond, 0);
releve('Embase, largeur', e.x1 - e.x0, EMBASE.large);
releve('Embase, jeu à chaque flanc', e.x0 - flancs.x0, EMBASE.jeu);
releve('Embase, jeu à l\'autre flanc', flancs.x1 - e.x1, EMBASE.jeu);
releve('Embase, longueur hors tout', e.z1 - e.z0, 21.125);
releve('Cadre, hauteur égale à celle du logement', cadre[0].y1 - cadre[0].y0, 2);
releve('Barre arrière posée sur la traverse du cadre', barres[0].y0 - cadre[0].y1, 0);
releve('Barre avant posée sur la traverse du cadre', barres[1].y0 - cadre[1].y1, 0);
releve('Traverse arrière du cadre, à l\'aplomb de sa barre', milieu(cadre[0], 'z') - milieu(barres[0], 'z'), 0);
releve('Traverse avant du cadre, à l\'aplomb de sa barre', milieu(cadre[1], 'z') - milieu(barres[1], 'z'), 0);
releve('Longerons de l\'embase, à 5 po de part et d\'autre de l\'axe', (milieu(cadre[3], 'x') - milieu(cadre[2], 'x')) / 2, EMBASE.longeron);
releve('Plaque, épaisseur', plaque.y1 - plaque.y0, EMBASE.plaque);
releve('Plaque, jeu à la barre arrière', plaque.z0 - barres[0].z1, EMBASE.jeu);
releve('Plaque, jeu à la barre avant', barres[1].z0 - plaque.z1, EMBASE.jeu);
releve('Pattes de la pompe sur la plaque', bp.y0 - plaque.y1, 0);
const origine = pompe.getWorldPosition(new THREE.Vector3()); // axe des clapets, base et axe de la pompe
releve('Axe de la pompe sur celui de la traverse, en travers', origine.z / IN - milieu(traverse, 'z'), 0);
releve('Pompe en long : trous centrés sur l\'axe de la traverse', (TROUS_POMPE[0][0] + TROUS_POMPE[2][0]) / 2 - TRAV.xc, 0);
// Boulons de la pompe : à l'aplomb de ses trous taraudés (gabarit du manuel porté dans le repère du bac).
const boulons = T('13').map((o) => boite(o));
compte('Boulons 1/2-13 de la pompe', boulons.length, 5);
let racine = null; // l'assemblage de la pompe, sous ses groupes de pose
pompe.traverse((o) => { if (!racine && o.userData.isAssembly) racine = o; });
const gabarit = [[f.avant.x, -f.avant.z], [f.avant.x, f.avant.z], [f.arriere.x, -f.arriere.z], [f.arriere.x, f.arriere.z], [f.arriere.x, 0]]
  .map(([x, z]) => new THREE.Vector3(x * IN, 0, z * IN).applyMatrix4(racine.matrixWorld));
const ecart = Math.max(...gabarit.map((g) => Math.min(...boulons.map((b) => Math.hypot(milieu(b, 'x') - g.x / IN, milieu(b, 'z') - g.z / IN)))));
releve('Boulons de la pompe, écart au gabarit du manuel', ecart, 0, 0.001);
// Trous de la plaque (repère du bac : X depuis le bout gauche, Z depuis la face arrière) : sur la plaque, hors des tubes du cadre.
const ox = plaque1.x0 - 0.1875, oz = plaque1.z0; // la plaque 1 commence à une épaisseur de tôle du bout gauche
const ecartTrous = Math.max(...gabarit.map((g) => Math.min(...TROUS_POMPE.map(([x, z]) => Math.hypot(x + ox - g.x / IN, z + oz - g.z / IN)))));
releve('Trous de la plaque, écart au gabarit du manuel', ecartTrous, 0, 0.001);
compte('Trous de la plaque sur la plaque', TROUS_POMPE.filter(([x, z]) => x + ox > plaque.x0 + 0.5 && x + ox < plaque.x1 - 0.5 && z + oz > plaque.z0 + 0.5 && z + oz < plaque.z1 - 0.5).length, 5);
// Têtes des boulons (Ø 1 1/16 po avec rondelle) entre les longerons et les flancs de la traverse.
const tetes = boulons.map((b) => Math.min(...cadre.slice(2).map((c) => Math.max(c.x0 - b.x1, b.x0 - c.x1))));
jeu('Têtes des boulons de la pompe, jeu aux longerons de l\'embase', Math.min(...tetes), 0.2);
jeu('Têtes des boulons de la pompe, jeu aux flancs de la traverse', Math.min(...boulons.map((b) => Math.min(b.x0 - flancs.x0, flancs.x1 - b.x1))), 0.2);
// Prise des boulons de 1 po : 1 po moins la rondelle et la plaque de 3/8 po ; les taraudages ont 5/8 po de profond.
const prise = boulons[0].y1 - plaque.y1;
jeu('Boulons de la pompe, prise dans les pattes', prise, 0.5);
jeu('Boulons de la pompe, garde au fond du taraudage de 5/8 po', 0.625 - prise, 0.05);
// Boulons des barres : un à chaque bout.
const vis = T('9').map((o) => boite(o));
compte('Boulons 1/4-20 des barres', vis.length, 4);
releve('Boulons des barres, du bout de la barre', milieu(vis[0], 'x') - barres[0].x0, 0.375);
// Rien ne se traverse : chaque maillage de la pompe contre chaque barre, à 0,1 po près.
const zones = T('5').map((o) => new THREE.Box3().setFromObject(o).expandByScalar(0.1 * IN));
let touches = 0;
const mb = new THREE.Box3();
pompe.traverse((o) => { if (o.isMesh && zones.some((b) => b.intersectsBox(mb.setFromObject(o)))) touches++; });
compte('Maillages de la pompe qui touchent une barre', touches, 0);
jeu('Pompe au-dessus du rebord du bac', bp.y0 - plaque1.y1);
jeu('Jeu des goujons de culasse au bout gauche du bac', bp.x0 - plaque1.x0, 10);

console.log('— Entraînement et circuit d\'eau (indicatifs)');
const G = geometrieCircuit();
const C = (ref) => T('14')[0].userData.parts.filter((p) => p.userData.partRef === ref);
const tc = (pt) => [pt[0] - L / 2, pt[1], pt[2] - D / 2]; // repère du bac → repère du modèle (pouces)
// Aspiration : droite dans le compartiment ouvert, entre la traverse et la flotte, au-dessus du fond.
const flotte = boite(T('10'));
const A = G.ASP;
releve('Aspiration, tuyau de 1 1/2 po (Ø ext. 1,9 po)', 2 * A.r, 1.9);
jeu('Aspiration, jeu du raccord union au flanc de la traverse', (traverse.x0 + L / 2) - (A.x + 1.3), 1);
jeu('Aspiration, jeu de la crépine à la flotte', (flotte.z0 + D / 2) - (A.z + A.rCrepine), 0.5);
jeu('Aspiration, crépine au-dessus du fond du bac', A.crepine - (PIED.h + TOLE), 1.5);
// Moteur et cloche : dans l'axe de l'arbre, au-dessus du rebord arrière ; cloche loin des vis du palier du vilebrequin (12).
const moteur = boite(C('1')), cloche = boite(C('2'));
releve('Moteur, dans l\'axe de l\'arbre d\'entrée (hauteur)', milieu(moteur, 'y'), G.ya, 0.01);
releve('Cloche, appuyée sur la bride du boîtier d\'entraînement', cloche.z1 + D / 2, G.zFace);
jeu('Moteur, au-dessus du rebord arrière du bac', moteur.y0 - plaque1.y1, 1);
const [xv, yv] = [RELEVE.vilebrequin - COTE.arbre.x, RELEVE.axeCyl - COTE.arbre.y];
const visPalier = Math.min(...PALIER.angles.map((a) => Math.hypot(xv + PALIER.r * Math.cos((a * Math.PI) / 180), yv + PALIER.r * Math.sin((a * Math.PI) / 180)))) - 0.33;
jeu('Cloche (Ø 4 1/2 po), jeu aux têtes des vis du palier du vilebrequin', visPalier - G.LANT.r, 0.25);
let vis27 = 0;
pompe.traverse((o) => { if (o.userData.partRef === '27' && !o.userData.isAssembly) vis27++; });
compte('Vis 27 de la pompe et vis de la cloche (les trois du boîtier d\'entraînement remplacées)', `${vis27} + ${C('4').length}`, '9 + 3');
jeu('Accouplement, jeu à la cloche (rayon)', G.LANT.rInt - 1.5, 0.25);
// Rien ne se traverse : sommets des boyaux et des pièces du circuit testés contre les solides du bac, de la pompe et du
// circuit (parité des traversées d'un rayon vers +X), hors des contacts voulus (pièces vissées, appuis).
const solides = [];
const ajoute = (racineObj, ref) => racineObj.traverse((o) => {
  if (!o.isMesh || o.userData.soudure || o.userData.isTubeEnds) return;
  const dbl = new THREE.Mesh(o.geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  dbl.matrixWorld.copy(o.matrixWorld);
  dbl.matrixAutoUpdate = false;
  solides.push({ ref, mesh: dbl, box: new THREE.Box3().setFromObject(o) });
});
for (const [ref, objs] of tub.refs) if (!['11', '14'].includes(ref)) objs.forEach((o) => ajoute(o, `bac ${ref}`));
// Pièces de la pompe : enfants directs de ses assemblages (le groupe de pose, repère 11 du bac, n'en est pas une).
pompe.traverse((o) => { if (o !== pompe && o.userData.partRef && o.parent?.userData.isAssembly && !o.userData.isAssembly) ajoute(o, `pompe ${o.userData.partRef}`); });
for (const ref of ['1', '2', '10', '11', '14', '15', '19', '20', '21']) C(ref).forEach((o) => ajoute(o, `circuit ${ref}`));
const rayonParite = new THREE.Raycaster();
const dedans = (p, s) => {
  if (!s.box.containsPoint(p)) return false;
  rayonParite.set(p, new THREE.Vector3(1, 0.0137, 0.0071).normalize());
  const d = rayonParite.intersectObject(s.mesh, false).map((h) => h.distance).sort((a, b) => a - b);
  let k = 0, last = -1;
  for (const v of d) if (v - last > 1e-6) { k++; last = v; }
  return k % 2 === 1;
};
// Contacts voulus : la pièce est vissée dans l'autre ou appuyée sur elle.
const permis = {
  2: ['pompe 17', 'pompe 3'], 3: ['pompe 3', 'pompe 26', 'circuit 1'], 4: ['pompe 17', 'pompe 1', 'pompe 20', 'circuit 2'],
  5: ['circuit 2'], 10: ['pompe 38'], 13: ['pompe 38', 'bac 7', 'bac 3', 'circuit 14'], 18: ['pompe 38', 'circuit 19'],
  1: ['circuit 2'], 6: ['circuit 1'], 11: ['circuit 10'], 12: ['circuit 11'], 14: ['circuit 15'], 15: ['circuit 14'],
  16: ['circuit 14'], 19: ['circuit 20'], 20: ['circuit 19', 'circuit 21'], 21: ['circuit 20'],
};
const v = new THREE.Vector3();
for (const [ref, objs] of [...T('14')[0].userData.parts.reduce((m, p) => m.set(p.userData.partRef, [...(m.get(p.userData.partRef) || []), p]), new Map())]) {
  let pts = 0;
  const heurts = new Map();
  for (const o of objs) o.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const pos = mesh.geometry.attributes.position;
    const pas = Math.max(1, Math.floor(pos.count / 1500));
    for (let i = 0; i < pos.count; i += pas) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
      pts++;
      for (const s of solides) {
        if (s.ref === `circuit ${ref}` || (permis[ref] || []).includes(s.ref)) continue;
        if (dedans(v, s)) heurts.set(s.ref, (heurts.get(s.ref) || 0) + 1);
      }
    }
  });
  const ok = heurts.size === 0;
  n++;
  if (!ok) failed = true;
  console.log(`${ok ? '✓' : '✕'} Circuit, repère ${ref} : ${pts} sommets, ${ok ? 'aucun dans une autre pièce' : `dans ${[...heurts].map(([k, c]) => `${k} (${c})`).join(', ')}`}`);
}

console.log(`${failed ? 'ÉCHEC' : 'Conforme'} — ${n} mesures`);
process.exit(failed ? 1 : 0);

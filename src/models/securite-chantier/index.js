// Lot de sécurité de la place de travail (poste ITH Cubex) : barricade, affiches,
// ce qui se pose au sol, cadenassage, protection contre les chutes, extincteur et
// trousse de premiers soins (repris du poste de secours, src/models/poste-secours).
//
// Sources : six photos de places de travail fournies par le client (PH1 à PH6),
// aucune fiche de fabricant. Les cotes sont celles des articles courants du
// commerce (ruban de 3 po, affiche de 12 × 18 po, cône de 18 po, tube de 8 5/8 po,
// cadenas et moraillons de cadenassage, harnais et longe de 6 pi) ou relevées à
// l'œil sur les photos ; tout est en mètres, Y vers le haut, sol à y = 0.
// Textures d'usure : textures.js ; export pour Unreal : scripts/export-securite-unreal.mjs.
import * as THREE from 'three';
import { IN, RAD, pose } from './geo.js';
import { RUBAN, AFFICHE, FIL, CARTE, ruban, noeud, fil, carte, affiche, attache } from './signalisation.js';
import { cone, casing, couvercle, monterie, CASING } from './sol.js';
import { BOITE, boite, cadenas, etiquette, pince } from './cadenassage.js';
import { harnais, longe, blocRetractable, SRL } from './antichute.js';
import { extincteur, trousse } from '../poste-secours/index.js';

export { RUBAN, AFFICHE, FIL, CARTE, CASING, BOITE, SRL };

/** Enregistreur de pièces : la bulle de repère ne s'affiche qu'une fois par repère. */
function poseur(api) {
  const vu = new Set();
  return (ref, obj, explode) => {
    api.part(ref, obj, explode, { noLabel: vu.has(ref) });
    vu.add(ref);
    return obj;
  };
}

// ------------------------------------------------------------------ barricade

/** Hauteur du ruban à l'abscisse x (portée centrée en x = 0). */
export function yRuban(x) {
  const t = (x + RUBAN.portee / 2) / RUBAN.portee;
  return RUBAN.haut - RUBAN.fleche * 4 * t * (1 - t);
}

/** P02 — barricade : ruban tendu entre deux fils du grillage, nœuds, carte d'identification. */
export function P02(api) {
  const put = poseur(api);
  const L = RUBAN.portee / 2, y = RUBAN.haut;
  put('1', ruban([-L, y, 0], [L, y, 0]), [0, 0.25, 0]);
  put('2', noeud([-L, y, 0], 1, 1), [-0.2, 0.1, 0.1]);
  put('2', noeud([L, y, 0], -1, 2), [0.2, 0.1, 0.1]);
  const xc = 0.55;
  put('3', pose(carte(), [xc, yRuban(xc) - 0.9 * IN - CARTE.h / 2 + 0.4 * IN, 0.004], [0, 0, 4]), [0, -0.15, 0.25]);
  put('4', fil([-L, y, -0.008]), [-0.35, 0, -0.1]);
  put('4', fil([L, y, -0.008]), [0.35, 0, -0.1]);
  return { view: { dir: [0.2, 0.25, 1] } };
}

// ------------------------------------------------------------------ affiches

const AFFICHES = ['acces-interdit', 'forage-en-cours', 'forage-distance'];

/** Une affiche pendue au ruban par deux attaches (centre du haut de l'affiche en x, au point y du ruban). */
function afficheSurRuban(id, i, x, z = 0.006) {
  const g = new THREE.Group();
  const yh = yRuban(x) - 0.045; // haut de l'affiche : 4,5 cm sous le ruban
  const a = affiche(id, i);
  a.position.set(x, yh - AFFICHE.h / 2, z);
  a.rotation.set(-2 * RAD, (i - 1) * 4 * RAD, (i - 1) * 1.5 * RAD);
  g.add(a);
  const dx = AFFICHE.w / 2 - AFFICHE.marge;
  for (const s of [-1, 1]) g.add(attache([x + s * dx, yh - AFFICHE.marge, z], AFFICHE.marge + 0.06));
  return g;
}

/** P03 — affiches : « Accès interdit », « Forage en cours », « Forage à distance ». */
export function P03(api) {
  const put = poseur(api);
  AFFICHES.forEach((id, i) => {
    const a = affiche(id, i);
    a.position.set((i - 1) * 0.4, AFFICHE.h / 2, 0);
    put(String(i + 1), a, [(i - 1) * 0.1, 0, 0.05]);
  });
  return { view: { dir: [0, 0.1, 1] } };
}

// ------------------------------------------------------------------ sol

/** P04 — cône rouge de collet. */
export function P04(api) {
  api.part('1', cone(), null);
  return { view: { dir: [0.6, 0.45, 1] } };
}

/** P05 — casings rouges : trois tubes de 8 5/8 po enfoncés dans le roc (sorties différentes). */
export function P05(api) {
  const put = poseur(api);
  [[0, 0.15, 0], [0.32, 0.1, 0.18], [-0.3, 0.2, 0.12]].forEach(([x, s, z], i) => put('1', pose(casing(s, i), [x, 0, z], [0, i * 70, 0]), [x * 0.6, 0.25 + i * 0.05, 0]));
  return { view: { dir: [0.4, 0.8, 1] } };
}

/** P06 — couvercle de trou en acier rouillé. */
export function P06(api) {
  api.part('1', couvercle(), null);
  return { view: { dir: [0.3, 1, 0.8] } };
}

/** P07 — couvercle de monterie. */
export function P07(api) {
  api.part('1', monterie(), null);
  return { view: { dir: [0.5, 0.9, 1] } };
}

// ------------------------------------------------------------------ cadenassage

const COULEURS = [0xc8161c, 0xc8161c, 0xc8161c, 0x1f5fb4];

/**
 * P08 — cadenassage : boîte de groupe montée au mur (bas à 0,9 m), pince
 * multi-lock dans un trou de la patte, trois cadenas dans la pince et un
 * cadenas directement dans la patte, chacun avec son étiquette.
 */
export function P08(api) {
  const put = poseur(api);
  const Y0 = 0.9;
  const b = boite();
  b.position.y = Y0;
  put('1', b, [0, 0.12, -0.1]);
  // Pince dans le trou 3 : anneau dans le plan YZ, poignée qui pend.
  const t3 = b.userData.trou(2);
  const p = pince();
  const R = (1 * IN + 0.25 * IN) / 2;
  p.position.set(t3[0], Y0 + t3[1] - R, t3[2]);
  p.rotation.y = 90 * RAD;
  put('2', p, [-0.05, -0.05, 0.15]);
  p.updateMatrixWorld(true);
  // Trois cadenas dans la pince (trous du haut et du milieu), face vers +Z.
  [0, 1, 3].forEach((k, i) => {
    const q = new THREE.Vector3(...p.userData.trou(k)).applyMatrix4(p.matrixWorld);
    const c = cadenas(COULEURS[i], i);
    c.position.copy(q);
    c.rotation.set(0, 0, (i - 1) * 6 * RAD);
    put('3', c, [-0.05 + (i - 1) * 0.06, -0.08 - i * 0.02, 0.3]);
    const e = etiquette(i);
    // Étiquette passée dans l'anse, pendue derrière le cadenas (le cadenas reste visible devant).
    e.position.set(q.x + (i - 1) * 0.01, q.y - 0.004, q.z - 0.014 - i * 0.004);
    e.rotation.set(5 * RAD, (i - 1) * 12 * RAD, (i - 1) * 10 * RAD);
    put('4', e, [-0.05 + (i - 1) * 0.06, -0.12 - i * 0.02, 0.42]);
  });
  // Un cadenas bleu directement dans la patte (trou 8), de côté (anse dans le trou).
  const t8 = b.userData.trou(7);
  const c = cadenas(COULEURS[3], 3);
  c.position.set(t8[0], Y0 + t8[1], t8[2]);
  c.rotation.y = 90 * RAD;
  put('3', c, [0.04, -0.08, 0.25]);
  const e = etiquette(3);
  e.position.set(t8[0] - 0.014, Y0 + t8[1] - 0.004, t8[2] + 0.012);
  e.rotation.set(0, -70 * RAD, -5 * RAD);
  put('4', e, [0.1, -0.12, 0.25]);
  return { view: { dir: [0.35, 0.15, 1] } };
}

// ------------------------------------------------------------------ antichute

/** P09 — protection contre les chutes : harnais porté, longe accrochée à l'anneau dorsal, bloc rétractable. */
export function P09(api) {
  const put = poseur(api);
  const h = harnais();
  put('1', h.sangles, [0, 0, 0]);
  put('2', h.dRing, [0, 0.05, -0.18]);
  put('3', h.boucles, [0, 0, 0.12]);
  put('4', h.plaque, [0, 0.02, -0.1]);
  put('5', longe(h.ancrage), [0.1, 0, -0.35]);
  const b = blocRetractable();
  b.position.set(0.75, 1.25, -0.1);
  put('6', b, [0.3, 0.1, 0]);
  return { view: { dir: [-0.8, 0.2, -1] } };
}

// ------------------------------------------------------------------ lot complet

/**
 * P01 — le lot complet, disposé comme sur une place de travail : barricade et
 * affiches au fond, cône, casings et couvercles au sol, cadenassage au mur à
 * gauche, extincteur et trousse, protection antichute à droite.
 */
export function P01(api) {
  const put = poseur(api);
  const S = api.S;
  const place = (o, pos, rot) => pose(o, pos, rot);
  put('1', place(api.sub('P02'), [0, 0, -1.6]), [0, 0.3, -0.6]);
  // Affiches pendues au ruban de la barricade (même repère que P02).
  const aff = new THREE.Group();
  [-1.15, 0, 1.15].forEach((x, i) => aff.add(afficheSurRuban(AFFICHES[i], i, x)));
  put('2', place(aff, [0, 0, -1.6]), [0, 0.4, 0.2]);
  put('3', place(api.sub('P04'), [-1.3, 0, 0.1]), [-0.3, 0.3, 0.3]);
  [[-0.55, 0.12, 0.35, 0], [-0.1, 0.18, -0.25, 1], [0.35, 0.1, 0.45, 2]].forEach(([x, s, z, i]) => put('4', place(casing(s, i), [x, 0, z], [0, i * 50, 0]), [0, 0.35, 0.1]));
  // Couvercle de trou posé sur un casing ras du sol, près de la foreuse.
  put('5', place(api.sub('P06'), [1.15, 0, 0.35], [0, 25, 0]), [0, 0.4, 0.3]);
  put('6', place(api.sub('P07'), [2.75, 0, 0.5]), [0.3, 0.3, 0.4]);
  put('7', place(api.sub('P08'), [-2.75, 0, -1.5]), [-0.4, 0.2, 0.2]);
  // Extincteur debout au sol et trousse couchée, à côté du cadenassage (repris du poste de secours).
  put('9', place(extincteur(S), [-3.3, 0.0006, -0.5], [0, 30, 0]), [-0.3, 0.2, 0.3]);
  put('10', place(trousse(S), [-2.8, 1.75 * IN, -0.35], [-90, 0, 15]), [-0.2, 0.3, 0.4]);
  put('8', place(api.sub('P09'), [4.1, 0, -1.2], [0, -20, 0]), [0.5, 0.2, 0]);
  return { view: { dir: [0.15, 0.55, 1] } };
}

export default { P01, P02, P03, P04, P05, P06, P07, P08, P09 };

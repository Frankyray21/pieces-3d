// Coupleur de câble 600 V (fiche mâle et fiche femelle accouplées, câble à
// câble) dans son support en inox, d'après la photo fournie par le client
// (galerie souterraine, coupleur suspendu à la verticale).
//
// Identification : corps en caoutchouc noir (néoprène / EPDM) coniques, bague
// d'accouplement entre les deux fiches (recouverte de ruban blanc), presse-étoupe
// côté câble : c'est la construction des connecteurs Quik-Loc 600 V de
// Crouse-Hinds (Eaton), série standard, homologués MSHA pour les mines
// souterraines. Taille : 4/0 AWG, 325 A (X8347-1D femelle, X8347-2D mâle),
// déduite de l'échelle de la photo — boulons de 3/8 po et pattes de 1 po du
// support, diamètre du câble (≈ 57 mm, celui d'un câble portatif 3 × 4/0) — et
// cohérente avec la longueur visible des deux fiches. Le numéro est imprimé ou
// moulé sur chaque corps : à lire sur place pour confirmer.
//
// Cotes publiées (catalogue Crouse-Hinds, tableau des fiches 600 V, en pouces,
// « approximatives ») : diamètre hors tout A = 6 7/16 po, longueur B =
// 21 15/16 po pour chaque fiche 4/0. Formes (conicité des corps, bague,
// presse-étoupe) relevées sur la photo, par proportion avec ce diamètre. Les
// contacts (3 broches de phase et une de mise à la terre) sont supposés.
//
// Support : fabriqué à la mine (pas une pièce du catalogue), relevé sur la
// photo : collier supérieur et collier intermédiaire en deux demi-colliers à
// oreilles, deux tiges à crochet de 1/2 po, deux pattes plates de 1 × 1/4 po
// percées, boulons de 3/8 po. Ruban isolant blanc et attache autobloquante tels
// qu'on les voit sur la photo.
//
// Repère, en millimètres : y vers le haut, 0 à la face inférieure de la bague
// d'accouplement (épaulement de la fiche mâle), x vers la droite de la photo,
// z vers l'avant (côté de la photo). Modèle en mètres.
import * as THREE from 'three';
import { withFinish } from '../../viewer/materials.js';

const MM = 0.001;
const PO = 25.4;

// ------------------------------------------------------------------ cotes (mm)

/** Cotes publiées des fiches Quik-Loc 600 V (pouces), par grosseur de câble. */
export const CATALOGUE = [
  { awg: '#8', amp: 75, male: 'X8343-5D', femelle: 'X8343-4D', A: null, B: 13 + 7 / 16 },
  { awg: '#4', amp: 125, male: 'X8344-5D', femelle: 'X8344-4D', A: 3 + 7 / 8, B: 13 },
  { awg: '#2', amp: 160, male: 'X8345-5D', femelle: 'X8345-6D', A: 4 + 3 / 16, B: 14 + 1 / 16 },
  { awg: '4/0', amp: 325, male: 'X8347-2D', femelle: 'X8347-1D', A: 6 + 7 / 16, B: 21 + 15 / 16 },
];
/** Taille retenue (échelle de la photo) : 4/0 AWG, 325 A. */
export const TAILLE = CATALOGUE[3];
/** Diamètre hors tout et longueur d'une fiche (mm). */
export const D = TAILLE.A * PO;
export const L = TAILLE.B * PO;
const R = D / 2;

/** Échelle de la photo : mm par pixel (corps de la fiche mâle de 215 px pour Ø 155 mm). */
export const ECHELLE = 0.72;

/** Câble portatif 3 × 4/0 AWG, 2 kV (diamètre supposé, ≈ 2,25 po). */
export const CABLE = { r: 28.5 };

/** Bague d'accouplement (bronze au manganèse, sous le ruban) : y de 0 à haut. */
export const BAGUE = { rInt: 63.5, rExt: 72, haut: 62 };
/** Nez de la fiche mâle engagé dans la bague, face des contacts de la femelle. */
export const NEZ = { r: 62, haut: 85 };
/** Contacts (supposés) : 3 phases sur un cercle, mise à la terre au centre. */
export const CONTACTS = { rayon: 34, broche: 7.5, douilleExt: 11, long: 75, terre: 6 };

/** Fiche femelle (supérieure) : profil relevé sur la photo, longueur publiée. */
export const FEMELLE = {
  col: { r: 70, y: 96 },          // sous le collier intermédiaire
  cone: { r0: 71, r1: R, y1: 324 }, // corps conique (poussiéreux sur la photo), plus large en haut
  corps: { y1: 470 },             // partie cylindrique noire au-dessus du collier supérieur
  bout: L,                        // presse-étoupe côté câble (hors photo, supposé)
};
/** Fiche mâle (inférieure) : du nez jusqu'au presse-étoupe. */
export const MALE = {
  r0: 77.5, r1: 66.5, y1: -209,   // corps noir, légèrement conique
  presse: { r: 43, y: -300 },     // presse-étoupe sous le ruban
  bout: { r: 31, y: NEZ.haut - L }, // sortie du câble
};

/** Support en inox (fabriqué à la mine) : colliers, tiges, pattes. */
export const COLLIER = { large: 32, ep: 4, oreille: 135, haut: { y: 332, rInt: R }, milieu: { y: 80, rInt: FEMELLE.col.r } };
export const TIGE = { r: PO / 4, x: 118, z: 19, yBas: 14 };
export const PATTE = { large: PO, ep: PO / 4, x: 118, yHaut: 100, yBas: -290 };
/** Trous des pattes relevés sur la photo (y, mm) ; le premier reçoit la tige, celui du haut le boulon du collier. */
export const TROUS = { gauche: [-176, -273], droite: [-144, -209], r: 6.5 };
export const BOULON = { d: (3 / 8) * PO, xSerrage: 95 };

// ------------------------------------------------------------------ matériaux

const perso = new Map();
function teinte(nom, creer) {
  let m = perso.get(nom);
  if (!m) {
    m = creer();
    m.name = nom;
    perso.set(nom, m);
  }
  return m;
}
/** Inox brossé du support. */
const inox = () => teinte('coupleur-inox', () => withFinish(new THREE.MeshPhysicalMaterial({
  color: 0xc2c6ca, metalness: 1, roughness: 0.36,
}), 'machined'));
/** Caoutchouc des corps (néoprène noir). */
const caoutchouc = () => teinte('coupleur-caoutchouc', () => withFinish(new THREE.MeshPhysicalMaterial({
  color: 0x1d1e20, metalness: 0, roughness: 0.74, specularIntensity: 0.5,
}), 'rubber'));
/** Corps de la fiche femelle, couvert de poussière de roche sèche. */
const caoutchoucSale = () => teinte('coupleur-caoutchouc-sale', () => withFinish(new THREE.MeshPhysicalMaterial({
  color: 0x55534d, metalness: 0, roughness: 0.9, specularIntensity: 0.3,
}), 'rubber'));
/** Gaine jaune du câble portatif 600 V (précision du client : « le câble 600 V est jaune »). */
const gaineJaune = () => teinte('coupleur-gaine-jaune', () => withFinish(new THREE.MeshPhysicalMaterial({
  color: 0xd9a90f, metalness: 0, roughness: 0.62, specularIntensity: 0.45,
}), 'rubber'));
/** Ruban isolant blanc (vinyle). */
const ruban = () => teinte('coupleur-ruban', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0xf0efea, metalness: 0, roughness: 0.5,
}), 'plastic'));
/** Attache autobloquante en nylon naturel. */
const nylon = () => teinte('coupleur-nylon', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0xe4e1d4, metalness: 0, roughness: 0.42,
}), 'plastic'));

// ------------------------------------------------------------------ outils

const P = (pts) => pts.map(([r, y]) => [r * MM, y * MM]);
const V3 = (x, y, z) => [x * MM, y * MM, z * MM];

/** Positions (x, z) des contacts de phase, à 120°. */
const phases = () => [90, 210, 330].map((a) => [CONTACTS.rayon * Math.cos((a * Math.PI) / 180), CONTACTS.rayon * Math.sin((a * Math.PI) / 180)]);

// ------------------------------------------------------------------ pièces

/** Repère 1 : fiche femelle X8347-1D — corps, bague d'accouplement, douilles. */
function femelle(S) {
  const F = FEMELLE, N = NEZ, B = BAGUE;
  const corps = S.lathe(P([
    [0, N.haut], [B.rInt, N.haut], [B.rInt, B.haut], [F.col.r, B.haut], [F.col.r, F.col.y],
    [F.cone.r0, F.col.y + 4], [F.cone.r1 - 1, F.cone.y1 - 4], [F.cone.r1, F.cone.y1],
  ]).concat(P([[F.cone.r1, F.corps.y1], [R - 10, F.corps.y1 + 20], [48, F.bout - 22], [44, F.bout - 12], [CABLE.r + 4, F.bout - 6], [CABLE.r + 4, F.bout], [0, F.bout]])), caoutchouc(), { seg: 48 });
  // La partie conique est couverte de poussière : une peau mince par-dessus.
  const peau = S.lathe(P([
    [F.cone.r0, F.col.y + 4], [F.cone.r0 + 0.8, F.col.y + 4], [F.cone.r1 + 0.8, F.cone.y1 - 4],
    [F.cone.r1 - 0.2, F.cone.y1 - 4], [F.cone.r0, F.col.y + 4],
  ]), caoutchoucSale(), { seg: 48 });
  // Bague d'accouplement en bronze (cachée par le ruban), lèvre en bas.
  const bague = S.lathe(P([[B.rInt, 0], [B.rExt, 0], [B.rExt, B.haut], [B.rInt, B.haut], [B.rInt, 0]]), 'brass', { seg: 48 });
  // Douilles des contacts, noyées dans le corps.
  const douilles = [...phases(), [0, 0]].map(([x, z], i) => S.ring((i < 3 ? CONTACTS.douilleExt : CONTACTS.terre + 3) * MM, (i < 3 ? CONTACTS.broche : CONTACTS.terre) * MM, CONTACTS.long * MM, 'brass', { pos: V3(x, N.haut + CONTACTS.long / 2, z), seg: 16 }));
  const g = S.group(corps, peau, bague, ...douilles);
  g.userData.hasInterior = true;
  return g;
}

/** Repère 2 : fiche mâle X8347-2D — corps, nez engagé dans la bague, broches. */
function male(S) {
  const M = MALE, N = NEZ;
  const corps = S.lathe(P([
    [0, M.bout.y], [M.bout.r, M.bout.y], [M.bout.r, M.presse.y - 40], [M.presse.r, M.presse.y],
    [58, -215], [M.r1, M.y1], [M.r0 - 1, -10], [M.r0, -6], [M.r0, 0], [N.r, 0], [N.r, N.haut - 3], [N.r - 3, N.haut], [0, N.haut],
  ]), caoutchouc(), { seg: 48 });
  const broches = [...phases(), [0, 0]].map(([x, z], i) => {
    const r = i < 3 ? CONTACTS.broche - 0.6 : CONTACTS.terre - 0.6;
    const h = i < 3 ? CONTACTS.long - 6 : CONTACTS.long;
    return S.cyl(r * MM, h * MM, 'brass', { pos: V3(x, N.haut + h / 2, z), seg: 16 });
  });
  const g = S.group(corps, ...broches);
  g.userData.hasInterior = true;
  return g;
}

/**
 * Demi-collier à oreilles en inox (largeur selon y) : demi-anneau de rayon
 * intérieur rInt côté z ≥ 0 (avant) ou z ≤ 0 (arrière), oreilles jusqu'à ±oreille.
 */
function demiCollier(S, rInt, y, avant) {
  const C = COLLIER, e = C.ep, rExt = rInt + e, s = avant ? 1 : -1, n = 24;
  const pts = [[C.oreille, 0], [C.oreille, e]];
  const xe = Math.sqrt(rExt * rExt - e * e);
  const a0 = Math.asin(e / rExt);
  pts.push([xe, e]);
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((Math.PI - 2 * a0) * i) / n;
    pts.push([rExt * Math.cos(a), rExt * Math.sin(a)]);
  }
  pts.push([-xe, e], [-C.oreille, e], [-C.oreille, 0], [-rInt, 0]);
  for (let i = 1; i < n; i++) {
    const a = Math.PI - (Math.PI * i) / n;
    pts.push([rInt * Math.cos(a), rInt * Math.sin(a)]);
  }
  pts.push([rInt, 0]);
  // Contour (x, z) dans le plan de l'extrusion, couché ensuite : y du contour → −z.
  const m = S.extrude(pts.map(([x, z]) => [x * MM, -s * z * MM]), C.large * MM, inox());
  m.rotation.x = -Math.PI / 2;
  m.position.y = y * MM;
  return m;
}

/** Repères 3 et 4 : collier en deux demi-colliers à oreilles. */
function collier(S, rInt, y) {
  return S.group(demiCollier(S, rInt, y, true), demiCollier(S, rInt, y, false));
}

/** Repère 5 : tige à crochet de 1/2 po — crochet sur l'oreille du collier supérieur, bout fileté dans la patte. */
function tige(S, cote) {
  const T = TIGE, x = cote * T.x, yH = COLLIER.haut.y + COLLIER.large / 2;
  const pts = [
    [x, T.yBas, -22], [x, T.yBas, 2], [x, T.yBas + 7, T.z - 1], [x, T.yBas + 22, T.z], [x, 200, T.z],
    [x, yH - 12, T.z], [x, yH + 6, T.z - 3], [x, yH + 11, 0], [x, yH + 6, -T.z + 3], [x, yH - 14, -T.z],
  ];
  return S.tube(pts.map(([a, b, c]) => V3(a, b, c)), T.r * MM, inox(), { seg: 64, radial: 14, ends: 'none', tension: 0.35 });
}

/** Repère 6 : patte plate de 1 × 1/4 po, bout arrondi, percée (trous relevés sur la photo). */
function patte(S, cote) {
  const Pt = PATTE, w = Pt.large / 2, n = 10;
  const pts = [[-w, Pt.yHaut], [-w, Pt.yBas + w]];
  for (let i = 1; i < n; i++) {
    const a = Math.PI + (Math.PI * i) / n;
    pts.push([w * Math.cos(a), Pt.yBas + w + w * Math.sin(a)]);
  }
  pts.push([w, Pt.yBas + w], [w, Pt.yHaut]);
  const ys = [COLLIER.milieu.y, TIGE.yBas, ...(cote < 0 ? TROUS.gauche : TROUS.droite)];
  const trous = ys.map((y) => [0, y * MM, (y === TIGE.yBas ? TIGE.r + 0.5 : TROUS.r) * MM]);
  const m = S.extrude(pts.map(([a, b]) => [a * MM, b * MM]), Pt.ep * MM, inox(), { holes: trous });
  m.position.set(cote * Pt.x * MM, 0, zPatte() * MM);
  return m;
}
/** Pattes derrière les oreilles du collier intermédiaire. */
const zPatte = () => -COLLIER.ep - PATTE.ep / 2 - 0.5;

/** Repère 7 : boulon de 3/8 po, tête à l'avant, écrou à l'arrière. */
function boulon(S, x, y, zArr) {
  const d = BOULON.d * MM, long = (COLLIER.ep + 4 - zArr + 6) * MM;
  return S.group(
    S.bolt(d, long, inox(), { axis: 'z', pos: V3(x, y, COLLIER.ep), washer: true }),
    S.nut(d * 1.5, d * 0.85, inox(), { axis: 'z', pos: V3(x, y, zArr - 0.5 - BOULON.d * 0.42) }),
  );
}

/** Repère 8 : écrou de 1/2 po sur le bout fileté d'une tige, derrière la patte. */
function ecrouTige(S, cote) {
  const d = 2 * TIGE.r * MM;
  return S.nut(d * 1.5, d * 0.85, inox(), { axis: 'z', pos: V3(cote * TIGE.x, TIGE.yBas, zPatte() - PATTE.ep / 2 - TIGE.r * 0.85) });
}

/** Repère 9 : ruban isolant blanc — sur la bague d'accouplement ou sur le presse-étoupe de la fiche mâle. */
function rubanBague(S) {
  const r = BAGUE.rExt;
  return S.lathe(P([[r, 1], [r + 5, 1], [r + 5, 7], [r + 2.5, 11], [r + 2.5, BAGUE.haut - 2], [r, BAGUE.haut - 2], [r, 1]]), ruban(), { seg: 48 });
}
function rubanPresse(S) {
  const M = MALE;
  return S.lathe(P([
    [M.bout.r, M.bout.y + 12], [M.bout.r + 3, M.bout.y + 12], [M.bout.r + 3, M.presse.y - 40], [M.presse.r + 3, M.presse.y],
    [61, -219], [70, -213], [69.5, M.y1], [M.r1, M.y1], [58, -215], [M.presse.r, M.presse.y], [M.bout.r, M.presse.y - 40], [M.bout.r, M.bout.y + 12],
  ]), ruban(), { seg: 48 });
}

/** Rayon du ruban du presse-étoupe à la hauteur y (pour l'attache). */
function rayonRuban(y) {
  const M = MALE;
  const t = (y - M.presse.y) / (-215 - M.presse.y);
  return M.presse.r + t * (58 - M.presse.r) + 3;
}
/** Hauteur de l'attache autobloquante (relevée sur la photo). */
export const ATTACHE = { y: -250, r: 1.4 };

/** Repère 10 : attache autobloquante — autour du presse-étoupe, puis par le trou bas de la patte droite. */
function attache(S) {
  const y = ATTACHE.y, R0 = rayonRuban(y) + ATTACHE.r, yt = TROUS.droite[1], x = PATTE.x, zp = zPatte(), b = PATTE.large / 2;
  const boucle = S.torus(R0 * MM, ATTACHE.r * MM, nylon(), { axis: 'y', pos: V3(0, y, 0) });
  const queue = S.tube([
    [R0, y, 0], [R0 + 18, y + 10, 9], [x - 12, yt - 5, 8], [x, yt, zp + 6], [x, yt, zp - 6],
    [x + b + 2, yt + 2, zp - 6], [x + b + 3, yt + 1, zp + 6], [x - 4, yt - 9, 12], [R0 + 10, y + 3, 9], [R0 + 1, y, 3],
  ].map(([a, c, d]) => V3(a, c, d)), ATTACHE.r * MM, nylon(), { seg: 64, radial: 8, ends: 'none', tension: 0.4 });
  return S.group(boucle, queue);
}

/** Repère 11 : amorce de câble portatif 3 × 4/0 AWG à gaine jaune, en haut (alimentation) et en bas. */
function cableHaut(S) {
  return S.tube([V3(0, FEMELLE.bout - 4, 0), V3(0, FEMELLE.bout + 120, 0), V3(0, FEMELLE.bout + 240, -6)], CABLE.r * MM, gaineJaune(), { ends: 'none', radial: 20 });
}
function cableBas(S) {
  const y0 = MALE.bout.y + 4;
  return S.tube([V3(0, y0, 0), V3(0, y0 - 70, 0), V3(-25, y0 - 150, 4), V3(-90, y0 - 205, 8)], CABLE.r * MM, gaineJaune(), { ends: 'none', radial: 20 });
}

// ------------------------------------------------------------------ assemblage

/** P01 : le coupleur accouplé dans son support, et sa vue éclatée. */
export function P01(api) {
  const { S } = api;
  const C = COLLIER;
  api.part('1', femelle(S), [0, 0.3, 0], { labelAt: V3(0, 400, R) });
  api.part('2', male(S), [0, -0.3, 0], { labelAt: V3(0, -120, MALE.r0) });
  api.part('3', collier(S, C.haut.rInt, C.haut.y), [0, 0.3, 0.2], { labelAt: V3(0, C.haut.y, C.haut.rInt + C.ep) });
  api.part('4', collier(S, C.milieu.rInt, C.milieu.y), [0, 0.06, 0.22], { labelAt: V3(0, C.milieu.y, C.milieu.rInt + C.ep) });
  api.part('5', tige(S, -1), [-0.16, 0.12, 0.12], { labelAt: V3(-TIGE.x, 200, TIGE.z) });
  api.part('5', tige(S, 1), [0.16, 0.12, 0.12], { noLabel: true });
  api.part('6', patte(S, -1), [-0.2, -0.05, -0.12], { labelAt: V3(0, -60, 0) });
  api.part('6', patte(S, 1), [0.2, -0.05, -0.12], { noLabel: true });
  // Boulons : serrage des deux colliers près du corps, et pattes sur les oreilles du collier intermédiaire.
  const boulons = [
    [-BOULON.xSerrage, C.haut.y, -C.ep, [0, 0.3, 0.32]], [BOULON.xSerrage, C.haut.y, -C.ep, [0, 0.3, 0.32]],
    [-BOULON.xSerrage + 5, C.milieu.y, -C.ep, [0, 0.06, 0.34]], [BOULON.xSerrage - 5, C.milieu.y, -C.ep, [0, 0.06, 0.34]],
    [-PATTE.x, C.milieu.y, zPatte() - PATTE.ep / 2, [-0.2, 0.06, 0.3]], [PATTE.x, C.milieu.y, zPatte() - PATTE.ep / 2, [0.2, 0.06, 0.3]],
  ];
  boulons.forEach(([x, y, z, ex], i) => api.part('7', boulon(S, x, y, z), ex, { noLabel: i > 0 }));
  api.part('8', ecrouTige(S, -1), [-0.2, -0.05, -0.2]);
  api.part('8', ecrouTige(S, 1), [0.2, -0.05, -0.2], { noLabel: true });
  api.part('9', rubanBague(S), [0, 0.1, 0.12], { labelAt: V3(0, 30, BAGUE.rExt + 3) });
  api.part('9', rubanPresse(S), [0, -0.42, 0.1], { noLabel: true });
  api.part('10', attache(S), [0.08, -0.36, 0.16]);
  api.part('11', cableHaut(S), [0, 0.42, 0], { labelAt: V3(0, FEMELLE.bout + 120, CABLE.r) });
  api.part('11', cableBas(S), [0, -0.5, 0], { noLabel: true });
  // Vue de la photo : de face, un peu de trois quarts. Coupe proposée : par l'axe.
  return { view: { dir: [0.35, 0.12, 1], section: { axis: 'z', pos: 0.5 } } };
}

export default { P01 };

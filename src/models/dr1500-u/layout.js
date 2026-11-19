// Repères et cotes communes de la foreuse DR Fabrication DR1500-U (manuel de pièces MRI, 25 pages).
//
// UNITÉS : mètres (IN = 0,0254 m pour les cotes du manuel, données en pouces). Angles en radians.
//
// REPÈRE FOREUSE (P002, et P001 pour la foreuse) :
//   origine au sol (dessous des patins du frame skud), au milieu de la longueur du skid, dans le plan
//   vertical de l'axe de forage (z = 0) ;
//   X vers l'avant, côté trou (plaque de pied du mât, serre-tiges) ; Y vers le haut ; Z vers la droite
//   quand on regarde le trou (repère direct, comme le STM-1500).
//   Pose de référence = celle de la couverture (page 1) : mât à 0° (horizontal), mât rentré sur l'assise,
//   table et tête vers l'avant, juste derrière le serre-tiges.
//
// Toutes les pièces d'un assemblage sont construites dans son REPÈRE LOCAL (décrit ci-dessous, axes
// parallèles au repère foreuse sauf mention) ; c'est le parent qui le pose avec les constantes de pose
// (champ `pos`). Les fichiers parts/Pxxx.js n'écrivent jamais de coordonnées absolues en dur : ils lisent
// ce fichier. Une cote à changer se change ICI (et se signale), jamais dans un parts/.
//
// SOURCES ET CONFIANCE (mention en bout de ligne) :
//   [manuel]  cote écrite dans le manuel (plan coté p. 25, désignations de visserie, de roulements, de vérins) ;
//   [norme]   dimension normalisée d'une pièce désignée dans le manuel (roulement 6224, NEMA 444TC, tige NQ…) ;
//   [STM]     cote relevée sur le STM-1500 pour une pièce de même numéro Boyles (src/models/stm-1500/) ;
//   [mesure]  proportion mesurée sur un dessin (couverture p. 1, éclatés p. 2 et 4) à partir d'une cote sûre :
//             la couverture est une vue dimétrique (axes horizontaux à ±15° environ, réduction ≈ 0,73 sur X et Z,
//             ≈ 0,96 sur Y), échelle tirée de la longueur du mât ; précision de l'ordre de 10 à 15 % ;
//   [estimé]  choix raisonné faute de cote : à confirmer, mais à garder tant qu'il n'est pas remplacé ici.
//
// Ce que les dessins ne donnent pas (ESTIMÉ) : longueur et section du mât, hauteurs de l'assise, du mât et de
// l'axe de forage, largeur du skid, places des pivots de tilt, du treuil et des pattes. Ce qui est SÛR : plan de
// la base du serre-tiges (p. 25), diamètres des pièces Boyles (mandrin et serre-tiges, même numéros que le
// STM-1500), roulements et visserie désignés, chaîne RS40 de 43 po du treuil.

export const IN = 0.0254;
const deg = Math.PI / 180;

// ---------------------------------------------------------------------------------------------------------
// Frame skud FA601 (P002 rep. 13, fichier parts/ensemble-pieces.js, agent A).
// Repère local = repère foreuse (posé à l'identité).
// Deux patins (longerons) le long de X, relevés en ski aux deux bouts (couverture), traverses entre eux, poteaux
// avant et arrière qui portent les split-blocs de l'assise, oreilles de remorquage arrière.
export const SKID = {
  x0: -1.45, x1: 1.45, // bouts des patins (2,9 m) [mesure : 0,88 × la longueur du mât sur la couverture]
  railZ: 0.48, // axe des patins (±) [estimé : le skid déborde de l'assise sur la couverture]
  railW: 0.1, railH: 0.15, // section des patins [estimé]
  top: 0.15, // dessus des patins et des traverses : appui du treuil [estimé]
};

// ---------------------------------------------------------------------------------------------------------
// Assise 1500 GA601 (P003, agent A) et bascule (tilt).
// Repère local de P003 = repère foreuse (posé à l'identité, pose de référence à 0°).
// L'assise repose sur le skid par quatre tourillons Ø 2 po dans des split-blocs (bushing C4038 et snap-ring 2 po,
// P003 rep. 3 et 4) : deux à l'avant, deux à l'arrière ; elle bascule autour de l'un ou l'autre axe. Le mât est
// tenu sur son dessus par les six clamps de mât GP6009 (rep. 2, 4 vis 5/8-11 chacun) et avancé par le vérin
// HCL (rep. 8, pins MA621 rep. 6).
export const TILT = {
  pin: 2 * IN, // tourillons Ø 2 po [manuel : snap-ring B27.1-NA1-200 « 2" »]
  x: [0.55, -0.81], // axes des split-blocs avant et arrière (entraxe 1,36 m) [mesure]
  y: 0.7, // hauteur des axes [estimé]
  z: 0.34, // tourillons de chaque côté de l'assise (±) [estimé]
  // Vérins de tilt HBU3532 (P002 rep. 12, ×2) : pin GA608 côté frame (rep. 15), pin GA610 côté assise (P003 rep. 7,
  // Ø 1 1/4 po d'après les paliers 6391K295 rep. 5). Points d'attache à z = ±cylZ, dans le repère foreuse.
  cylPin: 1.25 * IN, // [manuel : « pour pin 1-1/4po »]
  cylFrame: [-1.0, 0.25], // [x, y] de la pin GA608 sur le frame [estimé d'après la couverture]
  cylAssise: [-0.55, 0.8], // [x, y] de la pin GA610 sur l'assise [estimé d'après la couverture]
  cylZ: 0.37, // [estimé]
};
export const ASSISE = {
  x0: -1.05, x1: 0.85, // bouts de l'assise [mesure, ±0,15 m]
  w: 0.62, // largeur hors tout [estimé]
  top: 0.84, // face d'appui du mât (= dessous du mât) [estimé]
  // Vérin d'avance du mât HCL-2548 / DR-HCL2536 (rep. 8) : 2 1/2 po d'alésage d'après la désignation ;
  // course 48 ou 36 po selon la colonne lue (le manuel se contredit). Pins MA621 Ø 1 1/4 po [manuel].
  mastCylPin: 1.25 * IN,
};

// ---------------------------------------------------------------------------------------------------------
// Mât 1500M MA601 (P004, agent A).
// Repère local de P004 = repère foreuse, mât rentré (posé à l'identité). Le mât glisse le long de X sur l'assise
// (avance du mât) : un parent qui le sort le décale de dx > 0 avec tout ce qu'il porte (table, tête, serre-tiges,
// poulie). Section : deux longerons et leurs plaques d'usure MP6019 (rep. 2, 19 vis fraisées 1/2-13 chacune),
// plaque de pied verticale à l'avant (pin MA611 Ø 2 1/2 po du vérin d'avance, paliers 6391K688), bout arrière qui
// porte le kit de poulie. Vérin d'avance DR-FE3560H (rep. 8) dans le mât : 3 1/2 po × 60 po d'après la désignation
// (« 61" » dans la description), tige vers l'avant sur la pin MA611, corps sous la table (plaque MP6018, P005 rep. 5).
export const MAST = {
  xFoot: 1.2, // face avant de la plaque de pied [mesure]
  len: 3.3, // de la plaque de pied au bout arrière [mesure : le vérin d'avance fermé (≈ 73 po = course 60 + 13) fait 0,56 × le mât, p. 4]
  get xRear() { return this.xFoot - this.len; },
  bottom: ASSISE.top, // dessous du mât sur l'assise
  h: 0.2, // hauteur des longerons sous les plaques d'usure [estimé]
  get top() { return this.bottom + this.h; }, // dessus des plaques d'usure : glissement de la table
  w: 0.46, // largeur hors tout (la base du serre-tiges, 15 1/4 po entre trous, s'y boulonne) [estimé]
  wearZ: 0.17, // axe des deux plaques d'usure (±) [estimé]
  feedPin: 2.5 * IN, // pin MA611 [manuel : palier « SHAFT 2-1/2" »]
  feedBore: 3.5 * IN, feedStroke: 60 * IN, // vérin DR-FE3560H [estimé d'après la désignation ; « 61" » au manuel]
  footPlate: { h: 0.75, w: 0.55, t: 0.025 }, // plaque de pied hexagonale (couverture) [mesure / estimé]
};

// ---------------------------------------------------------------------------------------------------------
// Axe de forage : y = AXIS_Y, z = 0, parallèle à X. Commun à la tête, au mandrin, au serre-tiges, à la base du
// serre-tiges et au guide de la poulie.
export const AXIS_Y = 1.3; // [estimé : MAST.top + table + 0,23 m ; STM-1500 : 1,235 m]

// ---------------------------------------------------------------------------------------------------------
// Table de forage 1500M MA609 (P005, agent A).
// Repère local de P005 : origine sur la face de dessus de la plaque MA609, en son centre ; axes du repère foreuse.
// Pose : TABLE.pos (table en avant, comme sur la couverture) ; course vers l'arrière TABLE.travel.
// Plaque sur les plaques d'usure du mât, côtés MA613 (rep. 4) qui crochètent les longerons avec téflons MP6021
// (rep. 2) poussés par MP6024 (rep. 3) et vis de pression (rep. 9 à 11). La tête s'y fixe par 8 boulons
// 3/4-10 × 5 po (rep. 8) et écrous (rep. 13) : HEAD_BOLTS.
export const TABLE = {
  len: 0.8, w: 0.6, t: 1.25 * IN, // [estimé ; épaisseur supposée 1 1/4 po]
  get top() { return MAST.top + this.t; }, // face de pose de la tête (repère foreuse)
  get x() { return MAST.xFoot - 0.95; }, // centre de la table, table en avant [mesure]
  get pos() { return [this.x, this.top, 0]; },
  travel: 60 * IN, // course de la table vers −X [estimé = course du vérin]
};
// Trous des 8 boulons 3/4-10 de la tête, dans le repère local de la table (= repère local de la tête) : [x, z].
export const HEAD_BOLTS = [-0.27, -0.09, 0.09, 0.27].flatMap((x) => [-0.22, 0.22].map((z) => [x, z])); // [estimé]
export const HEAD_BOLT = { d: 0.75 * IN, len: 5 * IN }; // [manuel : HFBOLT 0.75-10x5]

// ---------------------------------------------------------------------------------------------------------
// Tête XBH 91-100 (P012, agent B), kit d'adaptateur transmission (P011), mandrin 12HH (P018, P020).
// Repère local de P012 = repère local de la table (origine sur la face de pose, au centre de la table, sous
// l'axe de la broche) : broche principale à y = HEAD.spindleY, z = 0, le long de X ; bout des manchons (sortie des
// tiges, spindle bushing NQ 91-119) vers +X (serre-tiges) ; mandrin derrière la tête (vers −X) ; arbre menant
// (12T, 91-104A) au-dessus de la broche, décalé de côté (couverture), qui porte transmission et moteur (P011).
// P011, P018 : posés par P012 ; leur repère local est celui de P012 (posés à l'identité).
export const HEAD = {
  get spindleY() { return AXIS_Y - TABLE.top; }, // ≈ 0,23 m
  frontX: 0.17, // face avant du carter (côté +X) [estimé]
  rearX: -0.17, // face arrière du carter : appui du mandrin (chuck spacer 91-121, chuck adapter cover 91-114) [estimé]
  drive: { dy: 0.16, dz: -0.24 }, // arbre menant par rapport à la broche [mesure sur la couverture, côté à confirmer p. 11]
  // Chaîne triple 91-116 : 46 mailles + maille d'accouplement [manuel, note rouge p. 12] sur pignons 24T et 12T [manuel] ;
  // pas non donné : 3/4 po donne un entraxe ≈ 0,27 m, cohérent avec le décalage mesuré (0,29 m) [estimé].
  chainPitch: 0.75 * IN,
};
// Roulements et pièces normalisées désignés dans les listes (diamètre intérieur, extérieur, largeur) [norme].
export const BEARINGS = {
  '6224': [0.12, 0.215, 0.04], // tête rep. 3, roulement inférieur de broche
  '6213': [0.065, 0.12, 0.023], // tête rep. 13 (×2), arbre menant
  '3222': [0.11, 0.2, 0.0698], // tête rep. 5, à contact oblique double rangée
  '51130': [0.15, 0.19, 0.031], // butée du mandrin 15-51130 (P020 rep. 14)
  '6018': [0.09, 0.14, 0.024], // plaque support de la bague de guidage (P024 rep. 2)
  '6006': [0.03, 0.055, 0.013], // vis d'enroulement (P016 rep. 2)
};
export const RODS = { NQ: 0.0699, HQ: 0.0889, BQ: 0.0556 }; // diamètres extérieurs des tiges Q [norme]

// Mandrin Boyles 12HH 055A (P018) : mêmes numéros Boyles (Atlas Copco) que le mandrin du STM-1500 (3506870,
// 3506909…) : tambour Ø 308 × 261 mm, alésage Ø 98 mm [STM, src/models/stm-1500/head.js] ; piston à bagues
// d'usure Ø 10 po et Ø 8 1/4 po [manuel p. 20] ; 18 ressorts verts, 9 mâchoires.
export const CHUCK = {
  d: 0.308, len: 0.261, bore: 0.098, // [STM]
  pistonOD: 10 * IN, pistonID: 8.25 * IN, // [manuel]
  get x0() { return HEAD.rearX; }, // face avant du mandrin contre la tête (repère de P012) ; il s'étend vers −X
};

// ---------------------------------------------------------------------------------------------------------
// Serre-tiges Boyles 12HH 055B (P021, P023, P024 ; agent B) sur sa base 55-4000 (P025, agent A).
// Repère local de P025 (base) : origine au centre du gabarit des 7 trous Ø 0,688 po, sur la face de dessous de
// la plaque (= dessus du mât) ; axes du repère foreuse. Pose : RCB.pos.
// Plan coté p. 25 [manuel] : 7 trous Ø 0,688 po sur une grille de 15,25 po (2 × 7,625, en travers de l'axe de
// forage) sur 9,25 po (2 × 4,625, le long de l'axe) : les quatre coins, le milieu des deux côtés longs et le
// milieu d'un côté court (l'autre côté court a une encoche, pas de trou). La pin 55-0083 (rep. 3, Ø 1 po dans
// quatre bagues 25-886414 Ø 1,375 × 1,000 × 0,875 po) est parallèle à l'axe de forage, à 1,3 po à l'intérieur de
// la rangée de trous du côté +Z (≈ 160 mm de l'axe, comme l'oreille du serre-tiges du STM-1500) ; les deux boulons
// à œil 5/8-11 (rep. 2) sont du côté −Z, sur la pin 90-132 (rep. 4). Le sens (pin à +Z, encoche et poignée de la
// pin vers −X) est un choix [estimé] : la vue de dessus du plan ne dit pas où est l'avant.
// Repère local de P021 (serre-tiges) : origine sur l'axe de forage au milieu de la longueur du corps ; X le long
// de l'axe (côté +X = dessus du serre-tiges, plaque support P024, vers le trou) ; oreille du corps 55-0040 (rep. 22)
// côté +Z sur la pin de la base, pattes des boulons à œil côté −Z. Pose : RC.pos (dans le repère foreuse ; dans
// le repère de la base : RC.inBase).
export const RCB = {
  get x() { return MAST.xFoot - 0.35; }, // [mesure]
  get pos() { return [this.x, MAST.top, 0]; },
  // [x, z] des 7 trous dans le repère de la base [manuel p. 25 ; sens : voir ci-dessus].
  holes: [[-4.625, -7.625], [-4.625, 7.625], [0, 7.625], [0, -7.625], [4.625, 7.625], [4.625, 0], [4.625, -7.625]]
    .map(([x, z]) => [x * IN, z * IN]),
  hole: 0.688 * IN, // [manuel]
  pinZ: (7.625 - 1.3) * IN, // axe de la pin 55-0083 [mesure sur la vue de dessus p. 25, 47 px/po]
  pin: 1.0 * IN, bushingOD: 1.375 * IN, bushingLen: 0.875 * IN, // [manuel, rep. 5]
  eyeBolt: 0.625 * IN, // boulons à œil 5/8-11 × 2 3/4 po [manuel]
};
export const RC = {
  d: 0.313, len: 0.343, hubD: 0.24, // corps Ø 313, longueur hors moyeux 343 mm, moyeux Ø 240 [STM]
  get axisAboveBase() { return AXIS_Y - MAST.top; }, // axe au-dessus du dessous de la base (≈ 0,26 m)
  get inBase() { return [0, this.axisAboveBase, 0]; },
  get pos() { return [RCB.x, AXIS_Y, 0]; },
  earZ: 0.16, earY: -0.105, // oreille d'articulation sur la pin de la base, par rapport à l'axe [STM : 160 mm de côté, 105 mm sous l'axe ; p. 25 : 6,3 po]
};

// ---------------------------------------------------------------------------------------------------------
// Kit de poulie bascule MA616 (P006, agent A).
// Repère local : origine sur l'axe de la poulie avant MP0028 (rep. 2, arbre MP0059 rep. 4) ; axe des poulies le
// long de Z ; frame MA616 vers −X. Pose : POULIE.pos (au-dessus du bout arrière du mât, couverture : la poulie
// haute dépasse le dessus du mât d'environ 0,5 m). Le câble du treuil y monte par l'arrière.
export const POULIE = {
  get pos() { return [MAST.xRear - 0.05, MAST.top + 0.5, 0]; }, // [mesure, grossière]
  r: 0.1, // rayon à fond de gorge des poulies [estimé]
};

// ---------------------------------------------------------------------------------------------------------
// Treuil Hoist XW-2100 206-400 (P014, P016 ; agent C).
// Repère local de P014 : origine au sol du treuil (dessous de l'assemblage fond 206-414), sous le milieu du
// tambour ; axes du repère foreuse : AXE DU TAMBOUR LE LONG DE Z (couverture : le tambour est en travers, sous
// l'assise, entre les patins) ; plaque de côté droite 206-415 du côté +Z ; vis d'enroulement 206-419 parallèle
// au tambour. Pose : HOIST.pos. Encombrement à respecter : |z| ≤ HOIST.maxZ (entre les patins), dessus ≤
// HOIST.maxTop (sous l'assise).
// Cotes sûres : chaîne RS40 (pas 1/2 po) de 43 po, 1 maille patente et une demi-maille [manuel p. 14] ; pignon
// 40BS14 (14 dents, alésage 1 po) [manuel] ; poids 477,18 lb [manuel] ; roulements 6006-2RS de la vis [norme].
export const HOIST = {
  pos: [-0.35, SKID.top, 0], // [estimé d'après la couverture]
  drumY: 0.3, // axe du tambour au-dessus du dessous du treuil [estimé]
  maxZ: SKID.railZ - SKID.railW / 2 - 0.01,
  get maxTop() { return TILT.y - 0.12 - SKID.top; }, // hauteur max du treuil (sous l'assise) [estimé]
  chainPitch: 0.5 * IN, chainLen: 43 * IN, // [manuel]
};

// ---------------------------------------------------------------------------------------------------------
// Pièces de l'ensemble sans page propre (P002, parts/ensemble-pieces.js, agent A), repère foreuse.
export const PATTE = { // pattes d'extension ×2 (rep. 8) : de la plaque de pied du mât au sol, de chaque côté
  z: 0.24, // [estimé]
  get top() { return [MAST.xFoot - 0.05, MAST.bottom]; }, // [x, y] de l'attache haute [estimé]
  foot: [MAST.xFoot + 0.1, 0], // [x, y] du pied, sur la plaque d'ancrage [estimé]
};
export const ANCRAGE = { pos: [MAST.xFoot + 0.1, 0, 0], len: 0.9, w: 0.2, t: 0.025 }; // plaque MA617 (rep. 9), au sol en travers [estimé]
export const BLOC_IO = { pos: [ASSISE.x1 - 0.15, ASSISE.top - 0.12, -(ASSISE.w / 2 + 0.06)] }; // MA618 (rep. 1) [estimé]

// ---------------------------------------------------------------------------------------------------------
// Racine P001 : foreuse, groupe hydraulique et waterpack posés au sol (intégration).
// Repère local du groupe hydraulique P007 (et P008, posé à l'identité par P007) et du waterpack P009 (et P010,
// posé par P009 sur son support PA037) : origine au sol, sous le centre du cadre ; X le long du cadre ; Y vers
// le haut. Groupe : moteur 444TC (axe à 11,0 po au-dessus de ses pattes [norme NEMA]) vers −X, pompes vers +X.
export const ROOT = {
  DRILL: { pos: [0, 0, 0], yaw: 0 },
  PACK: { pos: [0.2, 0, -2.6], yaw: 0 }, // [estimé, disposition libre]
  WATER: { pos: [-2.4, 0, -2.6], yaw: 0 }, // [estimé, disposition libre]
};

/** Pose un objet : position [x, y, z] et rotation autour de Y (lacet) ; renvoie l'objet. */
export function pose(api, obj, pos, yaw = 0) {
  return api.S.at(obj, pos, yaw ? [0, yaw, 0] : null);
}

export { deg };

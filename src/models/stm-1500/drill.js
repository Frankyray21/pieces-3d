// P010 — Foreuse STM-1500 complète FBRA-002-100AS (page 1.0), avance à 0° comme sur la page 1.01.
// Traîneau FBRA-002-150BM (P011) de 3,32 m : longerons en tube 7 × 5 po sur semelle (1 067 mm hors tout),
// dessous chanfreiné aux deux bouts, deux passages de fourche par longeron (7 1/2 × 3 1/2 po, entraxe 31 1/2 po),
// oreilles avant, oreilles de remorquage arrière, bossages tubulaires, caisson central entre les passages de
// fourche, plat transversal sous les bouts arrière ; quatre poteaux coiffés de paliers fendus (brides UM-064-108B,
// vis B750-3000 et rondelles LC750, graisseurs Z250NF, chaînettes), traverse entre les poteaux avant,
// contrefiches, oreilles d'ancrage des jambes (face avant des poteaux avant, chapes des bras des poteaux
// arrière) ; deux sélecteurs mât / treuil DF10-6B-12L posés sur le caisson contre les poteaux avant (raccords
// 6400-8-8 dans leurs six orifices ; sur celui de gauche, côté −Z, les deux vannes à bille BKH-12NPT de l'avance
// sur 6505-8-8) ; bandes de roulement à l'arrière des longerons et quatre crapauds FMC-014-303D (vis B625-2750,
// rondelles W625, chaînettes) sur le bâti du treuil. Support d'avance FBRA-002-600BB (P012) :
// cadre de deux HSS 5 × 3 po couchés (plats d'usure 218B) sur deux tubes de pivot 3 po sch. 80 posés dans les
// paliers, cornières 207B, plaque centrale 201B, quatre brides 211B sur barres 204B (chaînettes) contre la semelle
// de la poutre, quatre pattes de vérin (détail B), chapes 213B du vérin de relevage sur la plaque 220B. Poutre
// d'avance (P013) posée sur les plats d'usure : deux longerons-caissons, fond ouvert à traverses et diagonales,
// plateforme avant (oreilles, pattes des tirants, flasques), cadre en U arrière et plaque d'extrémité (mast end
// plate) ; plaque de pied 181 mm derrière la pointe du traîneau, reliée à la poutre par ses flasques et deux tirants ;
// base pivotante du serre-tiges (P014), boîte et serre-tiges Boyles 12HH ; rallonge rentrée : connecteur, guides,
// pivot de poulie et poulie pivotante (P015, P017), guide de tiges (P016) ; table (P018) et tête Boyles (P048) à
// l'avant de la course comme à la page 1.01, vérin d'avance double logé dans la poutre (P021). Vérins de bascule HBU-3010 (P019) de la chape du longeron à la patte
// avant du support, avec bloc YEJ, deux clapets d'équilibrage, support 505Z, colliers et tube 507Z ; vérin de
// relevage HBU 2536 couché entre les HSS du support, des chapes 213B à une patte sous la poutre (il fait coulisser la
// poutre), avec son bloc YEJ côté fond ; émerillon d'eau (P029). Les jambes et l'attelage (P020) ne sont pas posés
// à 0° (page 1.01). Treuil de câble 10 000 pi (P042) posé sur l'arrière du traîneau (pages 1.00 et 1.01) : bâti
// et cadre « underground » devant lui (page 8.0) entre les longerons, longerons supérieurs sur les bandes de roulement, tenus par les crapauds, axe du tambour
// à 355 mm devant l'œil de remorquage arrière, capot en position haute (42°, bras boulonnés dans le trou n° 4 du
// 115F, pages 8.3 et P043), volant sous la poutre ; transmission, carters et volant du côté console (−Z). Câble :
// couche extérieure du tambour, rouleaux du guide-câble, presque à plat sous la poutre jusqu'au réa bas de la
// poulie, réa haut, rouleau du guide de tiges. Boyaux : console → raccords avant des deux sélecteurs ; sélecteur
// gauche → vannes de l'avance (tiges creuses du vérin d'avance) et moteur White du treuil ; sélecteur droit → blocs
// YEJ des vérins de bascule (le second branchement d'un vérin à l'autre) et du vérin de relevage. Sans le
// garde-corps grillagé (P023) ni le vérin supérieur (P022, P028). Tout en rouge comme le groupe hydraulique, vérins
// et moteurs hydrauliques noirs. Repère : layout.js.
import { lister, each, entretien, SLED, AXIS_Y, BEAM, PIVOT, FOOT_X } from './layout.js';
import { SPY, HEAD_PORTS as HEAD_LOCAL, HEAD_PORT_N } from './head.js';
import { BASE as WB, AXE as W_AXE, PAD as W_PAD, MOTOR_PORTS, CAPOT_HAUT, cableGuide, tangente, arcPts, hull, circle } from './winch.js';

// Table et tête à l'avant de la course (page 1.01, vue à 0° : table de 0,848 à 1,669 m de la pointe du traîneau, soit
// 1,074 m de son milieu à la face du pied ; course de 1 808 mm vers l'arrière).
const HEAD_X = FOOT_X - 1.074; // milieu de la table et de la tête le long de l'avance
const SW_X = HEAD_X - 0.55; // nez de l'émerillon d'eau, abouté au bout arrière de la broche (x = −0,55 dans la tête)
const by0 = BEAM.top - BEAM.h; // dessous de la poutre (bande basse des longerons)
const LZ = [0.167, 0.277]; // faces intérieure et extérieure des longerons
// Plaque de la table (P005, vue à 0°) : 34 mm d'épaisseur, dessus à 1,000 m du sol, soit 235 mm sous l'axe de la broche ;
// demi-longueur, demi-largeur. HB : dessous des tubes de charnière de la tête (sa face d'appui), posé pour que la
// broche tombe sur l'axe AXIS_Y ; il coïncide avec le dessus de la table quand SPY (head.js) vaut 0,235.
const TBL = { y0: AXIS_Y - 0.235 - 0.034, y1: AXIS_Y - 0.235, hl: 0.41, hw: 0.345 };
const HB = AXIS_Y - SPY;
const FC = { y: 0.845, r: 0.0254, x0: BEAM.x0 + 0.022, x1: BEAM.x1 - 0.02 }; // tiges du vérin d'avance : axe, rayon, plaques d'ancrage
const HX = FOOT_X - 0.3985; // axe de la boîte du serre-tiges (plaques d'about à 0,224 et 0,567 m de la face du pied)

// Traîneau (page 1.01, vue à 0° ; X = 1,660 − S, S depuis la pointe de l'oreille avant).
const RAIL_Z = SLED.w / 2 - SLED.railW / 2; // axe des longerons (±0,444)
const RZ = [RAIL_Z - SLED.railW / 2, RAIL_Z + SLED.railW / 2]; // faces intérieure et extérieure (0,355 ; 0,533)
const RT = SLED.railH; // dessus des longerons
const BANDE = { x: [-1.537, -0.056], t: 0.018 }; // bandes de roulement, de la face arrière des poteaux arrière au bout
const BT = RT + BANDE.t; // dessus des bandes, appui des longerons supérieurs du treuil
const FENETRES = [[0.688, 0.879], [0.079, 0.269]]; // passages de fourche (7 1/2 po, entraxe 31 1/2 po)
const FEN_Y = [0.029, 0.117]; // 3 1/2 po
// Fourreau vertical dans la moitié extérieure de chaque longeron (pages 1.02, 1.03 et 1.1) : X et |z| de la boîte, axe.
const FOUR = { x: [-0.56, -0.41], z: [0.473, RZ[1]], xc: -0.485, zc: (0.473 + RZ[1]) / 2 };
const POTEAU = { w: 0.102, z: [0.36, 0.434], top: 0.531 }; // poteaux (axes en X : PIVOT.x) ; 34 po hors tout
const PZ = (POTEAU.z[0] + POTEAU.z[1]) / 2;
const PALIER = { w: 0.159, y1: 0.66, r: 0.0452, z: [0.37, 0.434] }; // paliers fendus (moitié haute : bride UM-064-108B),
// à l'extérieur des HSS du support d'avance
const PLZ = (PALIER.z[0] + PALIER.z[1]) / 2;
const OEIL_AR = [-1.6, 0.089]; // œil des oreilles de remorquage arrière
// Sélecteurs mât / treuil DF10-6B-12L sur le caisson, contre les poteaux avant (page 1.01, vue de bout : corps à
// |z| 0,19–0,35) : corps gris d'axe Z, orifices deux à deux (±0,035 du milieu) dessus, devant et derrière.
const DF = { x: 0.83, y: [0.135, 0.185], z: 0.27, hz: 0.08, hx: 0.035, p: 0.035 };
const DF_TOP = DF.y[1] + 0.03, DF_MID = (DF.y[0] + DF.y[1]) / 2; // bout des raccords 6400-8-8 du dessus ; axe des orifices avant et arrière
const BKH_TOP = DF_TOP + 0.083; // dessus des vannes à bille de l'avance (6505-8-8 et BKH-12NPT sur les 6400-8-8)
const dfZ = (s, k) => s * (DF.z + (k ? DF.p : -DF.p)); // orifice intérieur (k = 0) ou extérieur (k = 1)

// Support d'avance (page 1.01, P012) : HSS de 1 196 mm (X −0,119 à 1,077) à |z| 0,305, dessus sous les plats d'usure.
const SUP = { x: [-0.119, 1.077], z: 0.305, w: 0.127, h: 0.076, top: by0 - 0.016 };
const SUP_BOT = SUP.top - SUP.h;
const PATTES = [0.812, 0.15], PATTE_Y = 0.575; // axes des pattes de vérin (détail B), à |z| TILT.z

// Vérins de bascule HBU-3010 (P019, page 1.01) : fond sur la chape soudée au longeron (axe à 171 mm du sol, 483 mm
// derrière l'axe du palier avant), tige sur la patte avant du support ; entraxe 0,524 m, incliné de 50°, tige presque
// rentrée. Repère du vérin : s le long de l'axe depuis l'axe du fond, t perpendiculaire (côté du bloc YEJ, vers le
// haut et l'arrière). a, b : bouts du hydCylinder (fût à 60 mm de l'axe du fond, au-dessus des joues de la chape ; œil de tige).
const TILT = (() => {
  const foot = [0.478, 0.171], head = [PATTES[0], PATTE_Y];
  const L = Math.hypot(head[0] - foot[0], head[1] - foot[1]), d = [(head[0] - foot[0]) / L, (head[1] - foot[1]) / L];
  const n = [-d[1], d[0]], rodR = 0.019;
  const pt = (s, t) => [foot[0] + s * d[0] + t * n[0], foot[1] + s * d[1] + t * n[1]];
  const len = L - 0.06 - 0.9 * rodR; // fût de s 0,06 (bloc du fond) à 0,44 (presse-étoupe), tige sortie de 84 mm
  return { foot, head, d, n, pt, L, z: 0.455, bore: 0.09, rodR, a: pt(0.06, 0), b: pt(L - 0.9 * rodR, 0), len, ext: 1 - 0.38 / len };
})();
// Bloc YEJ du vérin de bascule (s, t du milieu ; demi-longueur, demi-hauteur) et bouts des raccords 6801F des
// boyaux (face intérieure, coudés vers le bas) : repère de la foreuse, pour le vérin du côté s.
const YEJ = { s: 0.35, t: 0.12, hs: 0.05, ht: 0.025 };
const yejPorts = (s) => [YEJ.s - 0.025, YEJ.s + 0.025].map((u) => { const [x, y] = TILT.pt(u, YEJ.t - 0.01); return [x, y - 0.03, s * (TILT.z - 0.05)]; });
// Vérin de relevage HBU 2536 (P019, page 1.01) : couché entre les HSS du support, fond sur les chapes 213B (derrière le
// tube de pivot avant), fût jusque devant le tube de pivot arrière, tige au-dessus de ce tube puis 0,885 m au-delà du
// bout du cadre jusqu'à la patte sous la poutre ; axe à 672 mm du sol (le fût passe entre les tubes de pivot, la tige
// juste au-dessus du tube arrière, sous la semelle de la poutre). Orifices vers +Z.
const DUMP = (() => {
  const foot = [0.804, 0.672], head = [-1.004, 0.672], bore = 0.076, rodR = 0.018;
  const a = [foot[0] - 0.75 * bore / 2, foot[1]], b = [head[0] + 0.9 * rodR, head[1]]; // fût contre l'œil du fond
  const len = a[0] - b[0];
  return { foot, head, bore, rodR, a, b, len, ext: 1 - (a[0] - 0.06) / len };
})();
const DUMP_PF = DUMP.a[0] - 1.05 * DUMP.bore / 2; // orifice du fond (X)
const DUMP_YEJ = { x: [DUMP_PF - 0.05, DUMP_PF + 0.05], y: [DUMP.foot[1] - 0.025, DUMP.foot[1] + 0.025], z: [0.06, 0.11], ports: [DUMP_PF - 0.025, DUMP_PF + 0.025] };

// Orifices de branchement de P002 (repère de la foreuse) : raccords avant des deux sélecteurs (sortie +X ; tracés
// SLED_VIA : du sol, côté −Z, par-dessus le longeron gauche, devant les poteaux avant), moteur de la tête (rotation
// A et B, sortie −Z) et entrée d'eau de l'émerillon (sortie +Y, sur le dessus).
export const SLED_PORTS = [[-1, 0], [-1, 1], [1, 0], [1, 1]].map(([s, k]) => [DF.x + DF.hx + 0.03, DF_MID, dfZ(s, k)]);
export const SLED_VIA = (() => {
  const fl = 0.041; // sol + rayon du boyau
  const [p0, p1, p2, p3] = SLED_PORTS;
  const down = (x, y) => [[x, fl, -0.7], [x, 0.11, -0.645], [x, y - 0.01, -0.575], [x, y, -0.5]];
  return [
    [...down(1.06, 0.2), [1.06, 0.2, -0.36], [1.05, 0.195, -0.28], [1.0, 0.178, -0.24], [0.94, 0.165, p0[2]], p0],
    [...down(1.14, 0.24), [1.14, 0.24, -0.38], [1.08, 0.235, -0.31], [0.98, 0.21, p1[2]], [0.93, 0.172, p1[2]], p1],
    [...down(1.22, 0.28), [1.22, 0.28, 0.2], [1.15, 0.26, 0.235], [0.99, 0.2, p2[2]], [0.93, 0.168, p2[2]], p2],
    [...down(1.3, 0.32), [1.3, 0.32, 0.25], [1.22, 0.3, p3[2]], [1.01, 0.21, p3[2]], [0.93, 0.168, p3[2]], p3],
  ];
})();
export const HEAD_PORTS = HEAD_LOCAL.map(([x, y, z]) => [HEAD_X + x, HB + y, z]);
// Boyaux de rotation (console → coudes A et B du moteur, côté +Z, tournés vers l'arrière) : sortie dans l'axe du
// coude, vers l'arrière au-dessus de la poutre, passage par-dessus la poutre derrière le moteur et l'émerillon (le
// boyau du flanc côté broche en arrière, celui du flanc extérieur en avant et plus haut, qui passe par-dessus
// l'autre : au sol, ils arrivent dans l'ordre des raccords de la console), puis descente côté console (−Z) à
// l'extérieur du traîneau, devant le treuil, jusqu'au sol (tracés imposés, du sol vers le raccord).
export const HEAD_VIA = HEAD_PORTS.map((p, i) => {
  const [nx, ny] = HEAD_PORT_N, fl = 0.047; // sol + rayon du boyau (1 po)
  const xc = p[0] - (i ? 0.3 : 0.38), yc = p[1] + (i ? 0.1 : 0.01), zd = i ? -0.66 : -0.73;
  const xs = i ? 0 : -0.1; // pied de la descente du boyau arrière écarté vers l'arrière (voies parallèles au sol)
  return [[xc + xs, fl, zd - 0.12], [xc + xs / 2, 0.35, zd - 0.06], [xc, 0.9, zd], [xc, yc - 0.1, -0.52], [xc, yc, -0.3],
    [xc, yc, p[2] - 0.12], [xc + 0.07, p[1] + 0.03, p[2]], [p[0] + nx * 0.06, p[1] + ny * 0.06, p[2]], p];
});
// Entrée d'eau axiale au bout du chapeau de l'émerillon (page 1.16), raccord laiton tourné vers l'arrière (−X).
export const SWIVEL_PORT = [SW_X - 0.255, AXIS_Y, 0];

// Treuil de câble (P042) sur l'arrière du traîneau (pages 1.00 et 1.01) : bâti entre les longerons, longerons
// supérieurs posés sur les bandes de roulement, axe du tambour 355 mm devant l'œil arrière (pages 1.01 et 1.02) ;
// capot en position haute comme à la page 1.01 (bras boulonnés dans le trou n° 4 du 115F, volant juste sous la
// poutre), guide-câble au milieu de la vis, dans le plan des réas de la poulie (z = 0).
const WINCH = { x: OEIL_AR[0] + 0.355 - W_AXE[0], y: BT - WB.h, capot: CAPOT_HAUT, guide: 0 };

// Rallonge (P013), rentrée comme à la page 1.01 (4 202 mm hors tout) et à la page 1.02 : la rallonge réglable
// UM-064-116C, le raccord de mât UM-064-160C et la broche 125C ne servent qu'à la cote « with extension » de
// 5 608 mm ; rentrée, la plaque de base du pivot de poulie se visse sur la plaque arrière du connecteur
// UM-064-150C_R1 (page 1.02 : deux plaques seulement derrière les coulisses). Pivot de poulie UM-064-1000DD (P015),
// poulie pivotante UM-064-180C_R1 (P017) et guide de tiges UM-064-200C (P016) sont des sous-assemblages.
// Cotes relevées sur la page 1.02 (rallonge rentrée, 1,693 mm/px) et recoupées sur la page 1.01, en distance d
// derrière la face arrière de la plaque d'extrémité (XR) :
// — connecteur UM-064-150C_R1 : deux semelles grises à lobes (d 0 à 0,018, |z| 0,100 à 0,172, deux B750-2000 et
//   LC750 chacune à |z| 0,142), deux flancs (corps en U ouvert dessus et dessous, |z| 0,100 à 0,112, y 0,768 à
//   0,921), coulisses des montants du guide de tiges (d 0,158 à 0,262, y 0,78 à 1,05), plaque arrière (d 0,262 à
//   0,279, y 0,75 à 0,935) ; guides UM-064-195C (|z| 0,138 à 0,151) serrés par deux B750-2000 à y 0,81 et 0,90 ;
// — guide de tiges (P016) : rouleau d'axe à d 0,21 et y 1,175, montants à |z| 0,126 à 0,138 ;
// — pivot de poulie (P015) : plaque de base d 0,279 à 0,299 (y 0,62 à 0,927), charnière à d 0,300 et y 0,638,
//   plaque mobile inclinée à 61,5°, fourreau du ressort d'axe X à y 0,722 et z +0,17 (vue de dessous) ;
// — poulie (P017) : réa bas à d 0,423 et y 0,580, réa haut 0,525 plus loin, ligne des centres à 25° de la
//   verticale (haut vers l'arrière) ; réas Ø 200, entretoises à 0,113 des axes.
const XR = BEAM.x0;
const dX = (d) => XR - d; // abscisse à la distance d derrière la plaque d'extrémité
const CON = { y: [0.768, 0.921], zi: 0.1, zo: 0.112, zl: 0.1257, zg: 0.1384, tg: 0.013, g: [0.158, 0.262], gy: [0.78, 1.05], bp: [0.262, 0.279], by: [0.75, 0.935] };
const ROLLER = [dX(0.21), 1.175]; // axe du rouleau diabolo du guide de tiges
const RR = 0.0375; // centre du câble posé sur le col du rouleau (rayon 0,033)
const PV = { pin: [dX(0.3), 0.638], a: (61.5 * Math.PI) / 180, base: [0.279, 0.299], y: [0.665, 0.927], sy: 0.722, sz: 0.17 };
const PV_U = [-Math.cos(PV.a), Math.sin(PV.a)], PV_N = [-Math.sin(PV.a), -Math.cos(PV.a)]; // le long de la plaque mobile, normale vers la poulie
/** Point de la plaque mobile (u le long depuis l'axe de la charnière, n vers la poulie) → repère de la foreuse. */
const pp = (u, n) => [PV.pin[0] + u * PV_U[0] + n * PV_N[0], PV.pin[1] + u * PV_U[1] + n * PV_N[1]];
const PUL = { L: [dX(0.423), 0.58], a: (65 * Math.PI) / 180, E: 0.525 };
const PUL_D = [-Math.cos(PUL.a), Math.sin(PUL.a)], PUL_N = [Math.sin(PUL.a), Math.cos(PUL.a)]; // le long de la poulie, normale vers le pivot
/** Point de la poulie (s le long de la ligne des centres depuis le réa bas, n vers le pivot) → repère de la foreuse. */
const fr = (s, n) => [PUL.L[0] + s * PUL_D[0] + n * PUL_N[0], PUL.L[1] + s * PUL_D[1] + n * PUL_N[1]];
const SHEAVE_R = 0.087; // rayon du centre du câble posé au fond de la gorge des réas (fond Ø 0,165, jante Ø 0,200)
const SHEAVE_E = PUL.E; // entraxe des réas
const SHEAVES = [fr(0, 0), fr(SHEAVE_E, 0)]; // réa bas, réa haut
const SPC = [[-0.112, -0.018], [0, -0.114], [SHEAVE_E, -0.114], [SHEAVE_E + 0.112, -0.018]]; // entretoises 131C (s, n)
const FOOT_U = [0.07, 0.23]; // pied de la poulie sur la plaque mobile (le long de la plaque)

/** Rééchantillonne une ligne brisée 3D tous les `step` m (courbe lisse sans boucle). */
function resample(poly, step) {
  const out = [poly[0]];
  let carry = 0;
  for (let i = 1; i < poly.length; i++) {
    const a = poly[i - 1], b = poly[i], L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    let s = step - carry;
    while (s < L) { const t = s / L; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]); s += step; }
    carry = L - (s - step);
  }
  const last = poly[poly.length - 1], prev = out[out.length - 1];
  if (Math.hypot(last[0] - prev[0], last[1] - prev[1], last[2] - prev[2]) > step * 0.3) out.push(last); else out[out.length - 1] = last;
  return out;
}

/**
 * Câble du treuil (repère de la foreuse, plan z = 0 du guide-câble et des réas) : départ tangent sur la
 * couche extérieure du tambour (côté arrière), derrière le rouleau de retenue du guide-câble, autour du
 * rouleau d'enroulement, puis presque à plat sous la poutre jusqu'au dessous du réa bas de la poulie, par
 * l'arrière des deux réas jusqu'au-dessus du réa haut, et vers l'avant jusqu'au rouleau diabolo du guide de
 * tiges, où il repose sur le col et retombe d'un doigt avant l'embout serti. Renvoie la courbe et le bout
 * (centre de l'embout).
 */
function wirePath() {
  const off = ([x, y]) => [x + WINCH.x, y + WINCH.y];
  const [L, H] = SHEAVES;
  const c = cableGuide(WINCH.capot, [L[0] - WINCH.x, L[1] - WINCH.y], SHEAVE_R, -1); // tambour → guide → réa bas
  const t2 = tangente(L, SHEAVE_R, -1, H, SHEAVE_R, -1); // réa bas → réa haut, côté arrière
  const t3 = tangente(H, SHEAVE_R, -1, ROLLER, RR, -1); // par-dessus le réa haut → rouleau du guide de tiges
  const tip = [ROLLER[0] + RR, ROLLER[1] - 0.018, 0];
  const poly = [
    ...c.pts.map(off),
    ...arcPts(L, SHEAVE_R, off(c.q), t2.p, -1),
    ...arcPts(H, SHEAVE_R, t2.q, t3.p, -1),
    ...arcPts(ROLLER, RR, t3.q, [ROLLER[0] + RR, ROLLER[1]], -1, 0.006),
  ].map(([x, y]) => [x, y, 0]);
  poly.push(tip);
  return { pts: resample(poly, 0.01), tip };
}

/**
 * Orifices d'un vérin hydCylinder posé de a à b dans le plan XY puis tourné sur son axe pour que ses
 * orifices regardent vers ±Z (s) : bouts des raccords (fond, tige), décalage z relatif au vérin.
 */
function cylPortsZ(a, b, bore, ext, s) {
  const r = bore / 2, len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len], barrel = len * (1 - ext);
  return [r * 1.05, barrel - r * 1.1].map((u) => [a[0] + u * d[0], a[1] + u * d[1], s * r * 1.46]);
}

/** Tôle ou profil extrudé selon Z (épaisseur t, centré) : contour et trous (polygones, ou cercles [x, y, r]). */
function profil(api, outline, holes, t, mat = 'red') {
  const T = api.THREE;
  const sh = new T.Shape(outline.map(([x, y]) => new T.Vector2(x, y)));
  for (const h of holes) {
    const p = new T.Path();
    if (Array.isArray(h[0])) p.setFromPoints(h.map(([x, y]) => new T.Vector2(x, y)));
    else p.absarc(h[0], h[1], h[2], 0, Math.PI * 2, true);
    sh.holes.push(p);
  }
  const geo = new T.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false, curveSegments: 20 });
  geo.translate(0, 0, -t / 2);
  return api.S.merged([new T.Mesh(geo)], mat);
}
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const arc = (c, r, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + ((a1 - a0) * k) / n; return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; });
/** Tôle verticale de normale X (épaisseur t, centrée en x) : contour et trous dans le plan (z, y). */
const profilXa = (api, outline, holes, t, x, mat = 'red') => api.S.at(profil(api, outline.map(([z, y]) => [-z, y]),
  holes.map((h) => (Array.isArray(h[0]) ? h.map(([z, y]) => [-z, y]) : [-h[0], h[1], h[2]])), t, mat), [x, 0, 0], [0, Math.PI / 2, 0]);
/** Tôle horizontale (épaisseur t, centrée en y) : contour et trous dans le plan (x, z). */
const profilYa = (api, outline, holes, t, y, mat = 'red') => api.S.at(profil(api, outline.map(([x, z]) => [x, -z]),
  holes.map((h) => (Array.isArray(h[0]) ? h.map(([x, z]) => [x, -z]) : [h[0], -h[1], h[2]])), t, mat), [0, y, 0], [-Math.PI / 2, 0, 0]);

export function P010(api) {
  const { box, cyl, ring, shell, tube, hose, rod, plate, extrude, hydCylinder, bolt, boltSet, boltCircle, group, at, lathe, torus, nut, merged, washer } = api.S;
  const P = lister(api, 'P010');
  const profilX = (...args) => profilXa(api, ...args), profilY = (...args) => profilYa(api, ...args);
  const wire = wirePath();
  // Barre de section w × t (t selon Z) d'un point à l'autre du plan XY, bouts prolongés de e (noyés dans les pièces voisines).
  const strut = (p, q, w, t, z, e = 0, mat = 'red') => {
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
    return at(box(L + 2 * e, w, t, mat, { r: 0.003 }), [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, z], [0, 0, Math.atan2(q[1] - p[1], q[0] - p[0])]);
  };
  // Chaînette de n maillons (3/16 po) d'un point vers le bas, en un seul maillage léger.
  const chainette = (p, n, dz = 0) => merged(Array.from({ length: n }, (_, k) => {
    const m = new api.THREE.Mesh(new api.THREE.TorusGeometry(0.0045, 0.0013, 4, 10));
    m.scale.set(1, 1.35, 1);
    if (k % 2) m.rotation.y = Math.PI / 2;
    return at(m, [p[0], p[1] - k * 0.0085, p[2] + (dz * k) / n]);
  }), 'zinc');

  // 1 — Traîneau FBRA-002-150BM (page 1.1).
  const sled = [];
  for (const s of [-1, 1]) {
    const zc = s * RAIL_Z;
    // Longeron : dessus droit d'un bout à l'autre, dessous chanfreiné (avant 130 × 94 mm, arrière 131 × 90 mm),
    // deux passages de fourche traversants à cadre ; semelle de 11 mm dessous.
    // Le tube est fait de deux tranches : la moitié extérieure est interrompue au droit du fourreau (voir plus bas).
    const fen = FENETRES.map(([x0, x1]) => rect(x0, FEN_Y[0], x1, FEN_Y[1]).reverse());
    const contour = [[1.617, RT], [-1.537, RT], [-1.537, 0.09], [-1.406, 0], [1.487, 0], [1.617, 0.094]];
    sled.push(at(profil(api, contour, fen, FOUR.z[0] - RZ[0]), [0, 0, s * (RZ[0] + FOUR.z[0]) / 2]));
    const zo = s * (FOUR.z[0] + RZ[1]) / 2, eo = RZ[1] - FOUR.z[0];
    sled.push(at(profil(api, [[1.617, RT], [FOUR.x[1], RT], [FOUR.x[1], 0], [1.487, 0], [1.617, 0.094]], fen, eo), [0, 0, zo]));
    sled.push(at(profil(api, [[FOUR.x[0], RT], [-1.537, RT], [-1.537, 0.09], [-1.406, 0], [FOUR.x[0], 0]], [], eo), [0, 0, zo]));
    sled.push(at(box(2.893, 0.011, SLED.railW + 0.004, 'red'), [0.0405, 0.006, zc]));
    for (const [x0, x1] of FENETRES) {
      sled.push(at(profil(api, rect(x0 - 0.008, FEN_Y[0] - 0.008, x1 + 0.008, FEN_Y[1] + 0.008), [rect(x0, FEN_Y[0], x1, FEN_Y[1]).reverse()], 0.006), [0, 0, s * (RZ[1] + 0.003)]));
    }
    // Oreille avant : plaque verticale sur la moitié intérieure du longeron, sommet arrondi à 277 mm, œil Ø 63.
    sled.push(at(profil(api, [[1.353, RT], [1.617, RT], [1.617, 0.1], [1.66, 0.1], ...arc([1.577, 0.195], 0.082, 0, 1.92, 14)], [[1.577, 0.195, 0.0315]], 0.025), [0, 0, s * 0.39]));
    // Oreille de remorquage arrière : plaque soudée dans le bout du tube, bout arrondi, œil Ø 65.
    sled.push(at(profil(api, [[-1.455, 0.025], ...arc(OEIL_AR, 0.064, -Math.PI / 2, -1.5 * Math.PI, 16), [-1.537, 0.153], [-1.537, RT], [-1.455, RT]], [[...OEIL_AR, 0.0325]], 0.025), [0, 0, zc]));
    // Bossages tubulaires Ø 89 / 64 traversant le longeron (deux sous le treuil, un sous la chape du vérin de
    // bascule), petit pied dessous et vis de blocage.
    for (const x of [-0.961, -1.364, TILT.foot[0]]) {
      sled.push(at(ring(0.0445, 0.032, 0.186, 'red', { axis: 'z', seg: 28 }), [x, 0.074, zc]));
      sled.push(at(box(0.05, 0.02, 0.006, 'red'), [x, 0.021, s * (RZ[1] + 0.003)]));
      sled.push(at(bolt(0.0095, 0.02, 'steel'), [x + 0.02, 0.074 + Math.sqrt(0.0445 ** 2 - 0.02 ** 2) + 0.004, s * (RZ[1] + 0.002)]));
    }
    // Plaque surélevée sur la bande de roulement, derrière le poteau arrière (pages 1.01, 1.02 et 1.1 : 460 × 50 mm,
    // de 1 827 à 2 287 mm de la pointe avant), percée Ø 52 au droit du fourreau vertical. Fourreau : boîte creuse de
    // 150 mm logée dans la moitié extérieure du longeron, face affleurant la face extérieure du tube (pages 1.02 et
    // 1.03 : rien ne dépasse du longeron en vue de dessus), trou Ø 36 sur le dessus et Ø 40 sur la face (page 1.1) ;
    // les trous de la plaque, de la bande et du fourreau sont sur le même axe vertical.
    sled.push(at(plate(0.46, SLED.railW, 0.05, 'red', { r: 0.004, holes: [[FOUR.xc + 0.397, s * (FOUR.zc - RAIL_Z), 0.026]] }), [-0.397, BT + 0.025, zc]));
    {
      const lx = FOUR.x[1] - FOUR.x[0], h0 = 0.0115; // fond : semelle du longeron
      sled.push(at(plate(lx, FOUR.z[1] - FOUR.z[0], 0.008, 'red', { holes: [[0, 0, 0.018]] }), [FOUR.xc, RT - 0.004, s * FOUR.zc]));
      sled.push(at(profil(api, rect(FOUR.x[0], h0, FOUR.x[1], RT - 0.008), [[FOUR.xc, 0.065, 0.02]], 0.008), [0, 0, s * (RZ[1] - 0.004)]));
      for (const x of [FOUR.x[0] + 0.004, FOUR.x[1] - 0.004]) {
        sled.push(at(box(0.008, RT - 0.008 - h0, FOUR.z[1] - FOUR.z[0] - 0.008, 'red'), [x, (h0 + RT - 0.008) / 2, s * (FOUR.z[0] + FOUR.z[1] - 0.008) / 2]));
      }
    }
    // Bande de roulement (appui du treuil), de la face arrière du poteau arrière au bout du tube.
    const bx = (BANDE.x[0] + BANDE.x[1]) / 2; // percée Ø 36 au droit du fourreau
    sled.push(at(plate(BANDE.x[1] - BANDE.x[0], SLED.railW, BANDE.t, 'red', { r: 0.002, holes: [[FOUR.xc - bx, s * (FOUR.zc - RAIL_Z), 0.018]] }), [bx, RT + BANDE.t / 2, zc]));
    // Chape du fond du vérin de bascule : deux plaques triangulaires sur le longeron, au-dessus du bossage.
    for (const dz of [-0.028, 0.028]) {
      sled.push(at(profil(api, hull([[0.391, RT], [0.569, RT], ...circle(TILT.foot, 0.03, 20)]), [[...TILT.foot, 0.0127]], 0.0127), [0, 0, s * (TILT.z + dz)]));
    }
    // Poteaux, paliers fendus (moitié basse soudée, bride UM-064-108B, deux vis B750-3000 et rondelles LC750,
    // graisseur Z250NF, chaînette) et contrefiches vers le milieu du longeron.
    for (const px of PIVOT.x) {
      sled.push(at(box(POTEAU.w, POTEAU.top - RT, POTEAU.z[1] - POTEAU.z[0], 'red', { r: 0.004 }), [px, (RT + POTEAU.top) / 2, s * PZ]));
      const c = [px, PIVOT.y], hw = PALIER.w / 2, e = 0.02;
      const bas = [[px - hw, POTEAU.top], [px + hw, POTEAU.top], [px + hw, c[1] - 0.001], ...arc(c, PALIER.r, -e, -Math.PI + e, 24), [px - hw, c[1] - 0.001]];
      const haut = [[px - hw, c[1] + 0.001], ...arc(c, PALIER.r, Math.PI - e, e, 24), [px + hw, c[1] + 0.001], [px + hw, PALIER.y1], [px - hw, PALIER.y1]];
      sled.push(at(profil(api, bas, [], PALIER.z[1] - PALIER.z[0]), [0, 0, s * PLZ]));
      sled.push(at(profil(api, haut, [], PALIER.z[1] - PALIER.z[0]), [0, 0, s * PLZ]));
      for (const dx of [-0.055, 0.055]) {
        sled.push(at(washer(0.016, 0.0102, 0.005, 'steel'), [px + dx, PALIER.y1 + 0.0025, s * PLZ]));
        sled.push(at(bolt(0.019, 0.076, 'steel'), [px + dx, PALIER.y1 + 0.005, s * PLZ]));
      }
      sled.push(entretien(at(cyl(0.0045, 0.014, 'zinc', { seg: 10 }), [px, PALIER.y1 + 0.007, s * PLZ]), 'graisseur', 'E')); // page 1.04, détail E
      sled.push(chainette([px + 0.06, PALIER.y1 - 0.012, s * (POTEAU.z[1] + 0.006)], 4));
    }
    sled.push(strut([0.905, 0.464], [0.586, RT], 0.07, 0.06, s * PZ, 0.05));
    sled.push(strut([0.046, 0.457], [0.374, RT], 0.07, 0.06, s * PZ, 0.05));
    // Oreille d'ancrage de la jambe sur la face avant du poteau avant (axe à 455 mm du sol).
    sled.push(at(profil(api, [[1.011, 0.42], [1.035, 0.42], ...arc([1.035, 0.455], 0.035, -Math.PI / 2, Math.PI / 2), [1.011, 0.49]], [[1.035, 0.455, 0.0105]], 0.02), [0, 0, s * PZ]));
    // Bras du poteau arrière vers l'intérieur, chape d'ancrage de la jambe (axe 71 mm derrière le poteau, à 457 mm
    // du sol) et diagonale jusqu'au pied du poteau.
    sled.push(at(box(0.1, 0.1, POTEAU.z[0] - 0.17, 'red', { r: 0.004 }), [PIVOT.x[1], 0.4, s * (POTEAU.z[0] + 0.17) / 2]));
    for (const dz of [-0.027, 0.027]) {
      sled.push(at(profil(api, hull([[-0.053, 0.4], [-0.053, 0.49], ...circle([-0.075, 0.457], 0.032, 16)]), [[-0.075, 0.457, 0.0105]], 0.012), [0, 0, s * (0.19 + dz)]));
    }
    {
      const p = [0.19, 0.35], q = [0.36, 0.17], L = Math.hypot(q[0] - p[0], q[1] - p[1]);
      sled.push(at(box(0.05, L + 0.04, 0.04, 'red', { r: 0.003 }), [PIVOT.x[1], (p[1] + q[1]) / 2, (s * (p[0] + q[0])) / 2], [s * Math.atan2(q[0] - p[0], q[1] - p[1]), 0, 0]));
    }
    // Crapauds FMC-014-303D du treuil (deux par longeron, page 1.01 : à 2 394 et 3 103 mm de la pointe avant), vis
    // B625-2750 et rondelle W625, chaînette. À l'avant, devant les montants du bâti : bloc sur la bande et bec à plat
    // sur le tube de côté du cadre du bas (à fleur de la bande). À l'arrière : semelle sur la bande, montant et bec sur
    // la plaque d'appui du palier du tambour.
    {
      const x = WINCH.x + WB.L / 2 - 0.03;
      sled.push(at(box(0.04, 0.05, 0.06, 'red', { r: 0.004 }), [x, BT + 0.025, s * 0.44]));
      sled.push(at(box(0.04, 0.014, 0.1, 'red', { r: 0.003 }), [x, BT + 0.007, s * 0.36]));
      sled.push(at(bolt(0.0159, 0.07, 'steel', { washer: true }), [x, BT + 0.05, s * 0.448]));
      sled.push(chainette([x + 0.024, BT + 0.03, s * 0.474], 4));
    }
    {
      const x = WINCH.x - WB.L / 2 + 0.065, wTop = WINCH.y + W_PAD;
      sled.push(at(box(0.06, 0.025, 0.06, 'red', { r: 0.004 }), [x, BT + 0.0125, s * 0.44]));
      sled.push(at(box(0.06, wTop + 0.014 - BT, 0.014, 'red', { r: 0.003 }), [x, (wTop + 0.014 + BT) / 2, s * 0.403]));
      sled.push(at(box(0.06, 0.014, 0.034, 'red', { r: 0.003 }), [x, wTop + 0.007, s * 0.38]));
      sled.push(at(bolt(0.0159, 0.07, 'steel', { washer: true }), [x, BT + 0.025, s * 0.448]));
      sled.push(chainette([x + 0.034, BT + 0.006, s * (RZ[1] + 0.0065)], 5)); // pend contre la face extérieure du longeron
    }
  }
  // Caisson central entre les longerons, d'un passage de fourche à l'autre (les fourches le traversent).
  sled.push(at(profil(api, rect(0.071, 0.02, 0.887, 0.135), FENETRES.map(([x0, x1]) => rect(x0, FEN_Y[0], x1, FEN_Y[1]).reverse()), 2 * RZ[0]), [0, 0, 0]));
  // Traverse entre les poteaux avant, juste sous les paliers ; plat transversal sous les bouts arrière.
  sled.push(at(box(POTEAU.w, 0.1, 2 * POTEAU.z[0], 'red', { r: 0.004 }), [PIVOT.x[0], 0.48, 0]));
  // Le plat (1/2 po) suit le dessous chanfreiné des longerons (page 1.1), sans descendre sous le chanfrein (page 1.01),
  // et s'arrête sous la traverse arrière du bâti du treuil.
  {
    const yc = (x) => (0.09 * (-1.406 - x)) / 0.131; // dessous chanfreiné à l'abscisse x
    const [xa, xb, e] = [-1.412, -1.463, 0.0127];
    sled.push(at(profil(api, [[xa, yc(xa)], [xa, yc(xa) + e], [xb, yc(xb) + e], [xb, yc(xb)]], [], 2 * RZ[0]), [0, 0, 0]));
  }
  // Sélecteurs mât / treuil DF10-6B-12L (détail A) : corps gris, couvercle du tiroir côté poteau, levier vertical à
  // poignée noire et poignée en T, bouchon au bout intérieur ; raccords 6400-8-8 dans les six orifices (dessus,
  // avant vers la console, arrière). Sur le sélecteur gauche (−Z), les vannes à bille BKH-12NPT de l'avance sur les
  // orifices du dessus (6400-8-8 et 6505-8-8), levier à boule vers l'avant.
  for (const s of [-1, 1]) {
    const zc = s * DF.z, zo = s * (DF.z + DF.hz);
    sled.push(at(box(2 * DF.hx, DF.y[1] - DF.y[0], 2 * DF.hz, 'grey', { r: 0.006 }), [DF.x, DF_MID, zc]));
    sled.push(at(box(0.06, 0.046, 0.012, 'grey', { r: 0.004 }), [DF.x, DF_MID, zo + s * 0.006]));
    sled.push(at(cyl(0.014, 0.02, 'darkSteel', { axis: 'z', seg: 16 }), [DF.x, DF_MID, s * (DF.z - DF.hz - 0.01)]));
    sled.push(at(box(0.02, 0.025, 0.012, 'darkSteel', { r: 0.003 }), [DF.x + 0.02, DF.y[1] + 0.0125, zo - s * 0.008]));
    sled.push(at(cyl(0.0045, 0.18, 'steel', { seg: 10 }), [DF.x + 0.02, DF.y[1] + 0.115, zo - s * 0.008]));
    sled.push(at(cyl(0.009, 0.055, 'black', { seg: 14 }), [DF.x + 0.02, DF.y[1] + 0.2225, zo - s * 0.008]));
    sled.push(at(cyl(0.008, 0.05, 'black', { axis: 'x', seg: 12 }), [DF.x - DF.hx - 0.02, DF_MID, zo + s * 0.006]));
    for (const k of [0, 1]) {
      const z = dfZ(s, k);
      for (const [p, ax] of [[[DF.x, DF.y[1], z], 'y'], [[DF.x + DF.hx, DF_MID, z], 'x'], [[DF.x - DF.hx, DF_MID, z], '-x']]) {
        const dir = ax === 'y' ? [0, 1, 0] : ax === 'x' ? [1, 0, 0] : [-1, 0, 0];
        const q = (u) => [p[0] + dir[0] * u, p[1] + dir[1] * u, p[2]];
        sled.push(at(nut(0.022, 0.008, 'brass', { axis: ax === 'y' ? 'y' : 'x' }), q(0.004)));
        sled.push(at(cyl(0.008, 0.022, 'brass', { axis: ax === 'y' ? 'y' : 'x', seg: 12 }), q(0.019)));
      }
      if (s < 0) {
        sled.push(at(nut(0.022, 0.01, 'brass'), [DF.x, DF_TOP + 0.005, z]));
        sled.push(at(cyl(0.01, 0.018, 'brass', { seg: 12 }), [DF.x, DF_TOP + 0.019, z]));
        sled.push(at(box(0.034, 0.045, 0.034, 'zinc', { r: 0.004 }), [DF.x, DF_TOP + 0.0505, z]));
        sled.push(at(nut(0.026, 0.01, 'zinc'), [DF.x, DF_TOP + 0.078, z]));
        sled.push(rod([DF.x + 0.017, DF_TOP + 0.055, z], [DF.x + 0.05, DF_TOP + 0.11, z], 0.003, 'steel', 8));
        sled.push(at(api.S.ball(0.007, 'steel'), [DF.x + 0.052, DF_TOP + 0.113, z]));
      }
    }
  }
  P('FBRA-002-150BM', group(sled), [0, -0.35, 0]);

  // 5 — Support d'avance FBRA-002-600BB (page 1 de FBRA-001-200B) : deux HSS 5 × 3 po couchés à |z| 0,305 (plats d'usure
  // 218B sur leur bord intérieur, sous la semelle de la poutre), deux tubes de pivot 3 po sch. 80 dans les paliers,
  // cornières 207B de part et d'autre des tubes, plaque centrale 201B percée, plaque 220B et chapes 213B du vérin de
  // relevage, brides 211B sur barres 204B (5 vis, chaînette de 5 maillons) le long de la semelle de la poutre, pattes des
  // vérins de bascule (détail B : barre 202B sous le HSS, goussets 203B, joues 101B).
  const sup = [];
  const lx = SUP.x[1] - SUP.x[0], sxm = (SUP.x[0] + SUP.x[1]) / 2;
  for (const s of [-1, 1]) {
    const hss = profil(api, rect(-SUP.w / 2, -SUP.h / 2, SUP.w / 2, SUP.h / 2), [rect(-SUP.w / 2 + 0.0064, -SUP.h / 2 + 0.0064, SUP.w / 2 - 0.0064, SUP.h / 2 - 0.0064).reverse()], lx);
    sup.push(at(group(hss), [sxm, SUP.top - SUP.h / 2, s * SUP.z], [0, Math.PI / 2, 0]));
    sup.push(at(box(lx - 0.002, 0.016, 0.038, 'red', { r: 0.002 }), [sxm, SUP.top + 0.008, s * (SUP.z - SUP.w / 2 + 0.019)]));
    for (const xc of [0.9495, 0.0085]) {
      sup.push(at(box(0.241, by0 + 0.016 - SUP.top, 0.076, 'red', { r: 0.003 }), [xc, (by0 + 0.016 + SUP.top) / 2, s * (SUP.z + SUP.w / 2 - 0.038)]));
      sup.push(at(box(0.241, 0.038, 0.114, 'red', { r: 0.004 }), [xc, by0 + 0.035, s * (BEAM.w / 2 + 0.001 + 0.057)]));
      sup.push(boltSet([-0.09, -0.045, 0, 0.045, 0.09].map((dx) => [xc + dx, by0 + 0.054, s * (BEAM.w / 2 + 0.058)]), 0.019, 0.09, 'steel'));
      sup.push(chainette([xc + (xc > 0.5 ? -0.115 : 0.115), by0 + 0.03, s * (BEAM.w / 2 + 0.118)], 5));
    }
    for (const px of PATTES) {
      sup.push(at(box(0.0635, 0.0127, 0.273, 'red', { r: 0.002 }), [px, SUP_BOT - 0.00635, s * 0.3865]));
      for (const dz of [-0.028, 0.028]) sup.push(at(profil(api, rect(px - 0.03175, SUP_BOT - 0.0127 - 0.0635, px + 0.03175, SUP_BOT - 0.0127), [[px, PATTE_Y, 0.0127]], 0.0127), [0, 0, s * (TILT.z + dz)]));
      for (const dx of [-0.025, 0.025]) {
        const g = profil(api, [[0, 0], [0, 0.065], [0.13, 0]], [], 0.0127);
        sup.push(at(group(g), [px + dx, SUP_BOT, s * (SUP.z + SUP.w / 2)], [0, s > 0 ? -Math.PI / 2 : Math.PI / 2, 0]));
      }
    }
  }
  for (const px of PIVOT.x) {
    sup.push(at(cyl(0.04445, 0.848, 'red', { axis: 'z', seg: 32 }), [px, PIVOT.y, 0]));
    for (const u of [-1, 1]) {
      const xe = px + u * (0.04445 + 0.0005 + 0.03175);
      sup.push(at(box(0.0635, 0.0127, 0.699, 'red', { r: 0.002 }), [xe, SUP_BOT - 0.00635, 0]));
      sup.push(at(box(0.0127, 0.0635, 0.699, 'red', { r: 0.002 }), [xe + u * 0.02540, SUP_BOT - 0.03175, 0]));
    }
  }
  sup.push(at(plate(0.33, 0.584, 0.019, 'red', { cutouts: [[0, 0, 0.25, 0.1]] }), [0.445, SUP_BOT - 0.0095, 0]));
  sup.push(at(box(0.137, 0.0127, 0.216, 'red', { r: 0.002 }), [0.8485, SUP_BOT + 0.00635, 0]));
  for (const dz of [-0.026, 0.026]) sup.push(at(profil(api, rect(DUMP.foot[0] - 0.0255, SUP_BOT + 0.0127, DUMP.foot[0] + 0.0255, SUP_BOT + 0.0127 + 0.054), [[...DUMP.foot, 0.0127]], 0.019), [0, 0, dz]));
  P('FBRA-002-600BB', group(sup), [0, -0.15, 0.5]);

  // 2 — Poutre d'avance FBRA-002-300BB (P013, page 1.01) : deux longerons-caissons (bande basse serrée par les brides
  // du support, âme en retrait, aile haute où glissent les guides de la table), fond ouvert à traverses et diagonales
  // en zigzag (la traverse arrière porte la patte du vérin de relevage) ; plateforme avant : flasque avant percé pour
  // la bague UM-064-317B de la tige avant du vérin d'avance, plaque du dessus à deux oreilles percées, deux flasques à
  // deux grands trous dessous, pattes du bas des tirants ; flasques latéraux à trois trous ; pattes avant où se
  // boulonnent les flasques du pied (B750-5000, NC750) ; cadre en U arrière portant la plaque d'extrémité UM-064-120C
  // (6 B625-1750 et W625, bague 317B de la tige arrière) ; deux petites plaques percées sur le flanc −Z et plaque à six
  // trous en saillie sur le flanc +Z, à mi-longueur. Les tirants FBRA-002-310BB (embouts à œil, axes B625-4000 et
  // W625) relient l'oreille du pied à la patte de la plateforme.
  const bx0 = BEAM.x0, EP_T = 0.022, bx1 = BEAM.x1, xu = bx0 + EP_T + 0.02; // bout des longerons (face avant du cadre en U)
  const bl = bx1 - xu, bxc = (bx1 + xu) / 2, yb = 0.789, ya = 0.93; // longueur ; dessus de la bande basse, dessous de l'aile haute
  const beam = [];
  for (const s of [-1, 1]) {
    const zm = (s * (LZ[0] + LZ[1])) / 2, lw = LZ[1] - LZ[0];
    beam.push(at(box(bl, yb - by0, lw, 'red', { r: 0.003 }), [bxc, (by0 + yb) / 2, zm]));
    beam.push(at(box(bl, ya - yb, 0.087, 'red'), [bxc, (yb + ya) / 2, s * 0.2185]));
    beam.push(at(box(bl, BEAM.top - ya, lw, 'red', { r: 0.003 }), [bxc, (ya + BEAM.top) / 2, zm]));
  }
  const TRAV = [bx1 - 0.1, 0.45, -0.3, DUMP.head[0], xu + 0.06]; // traverses du fond
  for (const x of TRAV) beam.push(at(box(0.1, 0.045, 2 * LZ[0], 'red', { r: 0.003 }), [x, by0 + 0.0225, 0]));
  for (let k = 0; k + 1 < TRAV.length; k++) {
    const s = k % 2 ? -1 : 1, a = [TRAV[k] - 0.04, s * (LZ[0] - 0.03)], b = [TRAV[k + 1] + 0.04, -s * (LZ[0] - 0.03)];
    beam.push(at(box(Math.hypot(b[0] - a[0], b[1] - a[1]), 0.04, 0.05, 'red', { r: 0.003 }), [(a[0] + b[0]) / 2, by0 + 0.02, (a[1] + b[1]) / 2], [0, -Math.atan2(b[1] - a[1], b[0] - a[0]), 0]));
  }
  // Plateforme avant.
  const PF0 = bx1 - 0.42, PFT = 0.032, TIR = { lo: [FOOT_X - 0.53, 1.05], hi: [FOOT_X - 0.1, 1.39], z: 0.28 };
  const BF = [[bx1 + 0.058, 0.84], [bx1 + 0.058, 0.92]]; // boulons B750-5000 des flasques du pied dans les pattes avant
  beam.push(profilX(rect(-LZ[1], by0, LZ[1], BEAM.top), [[0, FC.y, 0.042]], 0.02, bx1 - 0.01));
  const lobe = (s) => circle([bx1 - 0.05, s * 0.29], 0.05, 16);
  beam.push(profilY(hull([[PF0, -LZ[1]], [bx1, -LZ[1]], [bx1, LZ[1]], [PF0, LZ[1]], ...lobe(-1), ...lobe(1)]), [[bx1 - 0.05, -0.29, 0.022], [bx1 - 0.05, 0.29, 0.022]], PFT, BEAM.top + PFT / 2));
  for (const s of [-1, 1]) {
    beam.push(at(profil(api, rect(PF0 + 0.05, 0.87, bx1 - 0.02, BEAM.top), [[PF0 + 0.14, 0.92, 0.03], [bx1 - 0.11, 0.92, 0.03]], 0.016), [0, 0, s * 0.1]));
    const [px, py] = TIR.lo, pt = BEAM.top + PFT;
    beam.push(at(profil(api, [[px - 0.04, pt], [px + 0.04, pt], [px + 0.04, py], ...arc([px, py], 0.04, 0, Math.PI, 10).slice(1, -1), [px - 0.04, py]], [[px, py, 0.0085]], 0.016), [0, 0, s * 0.2595]));
    // Flasque latéral à trois trous sur le flanc avant du longeron ; patte avant (flasque du pied boulonné contre).
    beam.push(at(profil(api, rect(bx1 - 0.35, 0.79, bx1, 0.96), [1.26, 1.18, 1.11].map((x) => [x - (1.299 - bx1), 0.88, 0.0275]), 0.016), [0, 0, s * (LZ[1] + 0.008)]));
    // Plaque rapportée à deux trous en diagonale, en arrière des trois trous (page 1.01, vue à 0°).
    beam.push(at(profil(api, rect(bx1 - 0.337, 0.835, bx1 - 0.208, 0.938), [[bx1 - 0.315, 0.919, 0.007], [bx1 - 0.232, 0.855, 0.007]], 0.008), [0, 0, s * (LZ[1] + 0.02)]));
    beam.push(at(profil(api, rect(bx1, 0.8, bx1 + 0.1, 0.96), BF.map(([x, y]) => [x, y, 0.0105]), 0.018), [0, 0, s * 0.261]));
  }
  // Cadre en U arrière (deux montants percés, barre basse) et plaque d'extrémité UM-064-120C.
  beam.push(profilX([[-LZ[1], by0], [LZ[1], by0], [LZ[1], BEAM.top], [LZ[0], BEAM.top], [LZ[0], by0 + 0.05], [-LZ[0], by0 + 0.05], [-LZ[0], BEAM.top], [-LZ[1], BEAM.top]],
    [-1, 1].flatMap((s) => [0.82, 0.91].map((y) => [s * 0.222, y, 0.0085])), 0.02, bx0 + EP_T + 0.01));
  const EPB = [-1, 1].flatMap((s) => [0.78, 0.85, 0.92].map((y) => [s * 0.2, y]));
  const CNB = [-1, 1].flatMap((s) => [0.785, 0.915].map((y) => [s * 0.142, y, 0.0105])); // boulons B750-2000 des semelles du connecteur
  beam.push(profilX(rect(-0.231, 0.74, 0.231, 0.965), [[0, FC.y, 0.042], ...EPB.map(([z, y]) => [z, y, 0.0085]), ...CNB], EP_T, bx0 + EP_T / 2));
  beam.push(boltSet(EPB.map(([z, y]) => [bx0, y, z]), 0.0159, 0.05, 'steel', { axis: '-x' }));
  // Bagues GSM UM-064-317B des tiges du vérin d'avance (plaque d'extrémité, flasque avant).
  beam.push(at(ring(0.042, FC.r, EP_T + 0.01, 'black', { axis: 'x', seg: 28 }), [bx0 + EP_T / 2 + 0.005, FC.y, 0]));
  beam.push(at(ring(0.042, FC.r, 0.03, 'black', { axis: 'x', seg: 28 }), [bx1 - 0.015, FC.y, 0]));
  // Plaques percées du flanc −Z, posées sur l'âme juste au-dessus de la bande basse (page 1.01, vue à 0° ; P013) :
  // plaque avant à deux trous côte à côte, plaque arrière à deux trous l'un au-dessus de l'autre sur son bord avant.
  beam.push(at(profil(api, rect(-0.44, yb, -0.22, 0.843), [[-0.293, 0.814, 0.007], [-0.369, 0.814, 0.007]], 0.008), [0, 0, -0.266]));
  beam.push(at(profil(api, rect(-0.97, yb, -0.72, 0.855), [[-0.735, 0.801, 0.007], [-0.735, 0.843, 0.007]], 0.008), [0, 0, -0.266]));
  // Plaque du bout arrière du flanc −Z (page 1.01, vue à 0°) : juste en avant de la plaque d'extrémité, contre la face
  // extérieure du longeron (z −0,277 à −0,285), à cheval sur la bande basse ; deux trous en diagonale, le haut en
  // arrière, le bas en avant.
  beam.push(at(profil(api, rect(bx0, 0.723, bx0 + 0.127, 0.831), [[bx0 + 0.025, 0.809, 0.007], [bx0 + 0.107, 0.746, 0.007]], 0.008), [0, 0, -(LZ[1] + 0.004)]));
  // Plaque en saillie sur le flanc +Z (vue de bout de la page 1.01) : col étroit soudé à l'âme, tête à coins arrondis
  // de z 0,36 à 0,54 percée de huit trous en quinconce (trois rangées).
  {
    const R = 0.02, Y0 = 0.743, Y1 = 0.872, Z1 = 0.54;
    const out = [[0.262, 0.797], [0.36, 0.797], [0.36, Y0], ...arc([Z1 - R, Y0 + R], R, -Math.PI / 2, 0, 4), ...arc([Z1 - R, Y1 - R], R, 0, Math.PI / 2, 4), [0.36, Y1], [0.36, 0.829], [0.262, 0.829]];
    const trous = [[0.513, 0.847, 0.016], [0.452, 0.847, 0.011], [0.388, 0.847, 0.011], [0.483, 0.808, 0.011], [0.419, 0.808, 0.016],
      [0.513, 0.768, 0.016], [0.452, 0.768, 0.011], [0.388, 0.768, 0.011]];
    beam.push(profilX(out, trous, 0.016, -0.25));
  }
  // Tirants FBRA-002-310BB : rond Ø 1 po entre deux embouts à œil, axes B625-4000 et rondelles W625.
  {
    const [a, b] = [TIR.lo, TIR.hi], L = Math.hypot(b[0] - a[0], b[1] - a[1]), d = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    for (const s of [-1, 1]) {
      const z = s * TIR.z;
      beam.push(rod([a[0] + d[0] * 0.024, a[1] + d[1] * 0.024, z], [b[0] - d[0] * 0.024, b[1] - d[1] * 0.024, z], 0.0124, 'red', 14));
      for (const p of [a, b]) {
        beam.push(at(ring(0.025, 0.0085, 0.023, 'red', { axis: 'z', seg: 20 }), [...p, z]));
        beam.push(at(washer(0.017, 0.0085, 0.003, 'steel', { axis: 'z' }), [...p, s * (TIR.z + 0.014)]));
        beam.push(at(bolt(0.0159, 0.045, 'steel', { axis: s > 0 ? 'z' : '-z' }), [...p, s * (TIR.z + 0.0155)]));
      }
    }
  }
  P('FBRA-002-300BB', group(beam), [0, 0.35, 0]);

  // 3 — Plaque de pied FBRA-002-305BB (P013, page 1.01) : plaque à coins chanfreinés, trou en serrure au passage des
  // tiges, deux fentes, quatre trous, oreilles des tirants sur les côtés hauts, six têtes B750-2500 ; deux flasques
  // de chant, boulonnés aux pattes avant de la poutre par les B750-5000 et NC750.
  {
    const FT = 0.03, kr = 0.0835, kw = 0.02, a0 = Math.asin(kw / kr);
    const out = [[-0.172, 0.595], [0.172, 0.595], [0.232, 0.659], [0.232, 1.33], [0.2675, 1.33], [0.2675, 1.44], [0.232, 1.469], [0.178, 1.524],
      [-0.178, 1.524], [-0.232, 1.469], [-0.2675, 1.44], [-0.2675, 1.33], [-0.232, 1.33], [-0.232, 0.659]];
    const key = [...arc([0, AXIS_Y], kr, -Math.PI / 2 + a0, 1.5 * Math.PI - a0, 40), ...arc([0, 1.07], kw, Math.PI, 2 * Math.PI, 8)];
    const fente = (y) => [...arc([0, y + 0.035], 0.015, 0, Math.PI, 8), ...arc([0, y - 0.035], 0.015, Math.PI, 2 * Math.PI, 8)];
    const trous = [-1, 1].flatMap((s) => [1.137, 1.333].map((y) => [s * 0.12, y, 0.01]));
    const foot = [profilX(out, [key, fente(1.433), fente(0.7), ...trous], FT, FOOT_X - FT / 2)];
    const fl = [[FOOT_X, 0.61], [FOOT_X, 1.3], [FOOT_X - 0.06, 1.3], [FOOT_X - 0.06, 1.14], [FOOT_X - 0.165, 1.1], [FOOT_X - 0.165, 0.74], [FOOT_X - 0.1, 0.66], [FOOT_X - FT, 0.61]];
    for (const s of [-1, 1]) {
      foot.push(at(profil(api, fl, BF.map(([x, y]) => [x, y, 0.0105]), 0.02), [0, 0, s * 0.242]));
      const ex = TIR.hi[0], ey = TIR.hi[1];
      foot.push(at(profil(api, [[FOOT_X - FT, ey - 0.055], [FOOT_X - FT, ey + 0.055], [ex, ey + 0.055], ...arc([ex, ey], 0.055, Math.PI / 2, 1.5 * Math.PI, 12).slice(1, -1), [ex, ey - 0.055]], [[ex, ey, 0.0085]], 0.016), [0, 0, s * 0.2595]));
      for (const [x, y] of BF) {
        foot.push(at(bolt(0.019, 0.06, 'steel', { axis: s > 0 ? 'z' : '-z', washer: true }), [x, y, s * 0.27]));
        foot.push(at(nut(0.029, 0.016, 'steel', { axis: 'z' }), [x, y, s * 0.224]));
      }
    }
    foot.push(boltSet([-1, 1].flatMap((s) => [0.8, 0.87, 0.935].map((y) => [FOOT_X, y, s * 0.196])), 0.019, 0.028, 'steel', { axis: 'x', washer: false }));
    P('FBRA-002-305BB', group(...foot), [0.45, 0, 0]);
  }

  // 7 — Boîte du serre-tiges FTD-148-300TF (P013) : U renversé, plaque du dessus 301TF (4 boutonnières, 8 B375-1500),
  // plaque avant 302TF (grande ouverture, 9 B500-3000 et W500) et plaque arrière 303TF (ouverture à encoche, 9 B500-2750
  // dans des trous oblongs), sans fond ni côtés : le serre-tiges se voit par les côtés.
  const HT = 1.437; // dessous de la plaque du dessus
  const about = [[-0.19, HT], [-0.19, 1.3], [-0.175, 1.252], ...arc([0, 1.252], 0.175, Math.PI, 2 * Math.PI, 28).slice(1, -1), [0.175, 1.252], [0.19, 1.3], [0.19, HT]];
  const encoche = [...arc([0, AXIS_Y], 0.125, Math.PI / 2 + 0.17, 2.5 * Math.PI - 0.17, 36), [0.021, AXIS_Y + 0.155], [-0.021, AXIS_Y + 0.155]];
  const ring9 = (x, ax) => boltCircle(9, 0.147, 0.0127, 0.019, 'steel', { axis: ax, pos: [x, AXIS_Y, 0], phase: ax === 'x' ? Math.PI : 0 }); // un boulon en haut
  P('FTD-148-300TF', group(
    profilX(about, [[0, AXIS_Y, 0.13]], 0.02, HX + 0.155),
    profilX(about, [encoche], 0.02, HX - 0.155),
    at(plate(0.33, 0.38, 0.015, 'red', { r: 0.004, cutouts: [-1, 1].flatMap((s) => [-1, 1].map((u) => [s * 0.07, u * 0.1, 0.05, 0.014])) }), [HX, HT + 0.0075, 0]),
    boltSet([-1, 1].flatMap((s) => [-0.15, -0.06, 0.06, 0.15].map((z) => [HX + s * 0.155, HT + 0.015, z])), 0.0095, 0.03, 'steel'),
    ring9(HX + 0.165, 'x'), ring9(HX - 0.165, '-x'),
  ), [0.25, 0.4, 0]);

  // 16 — Serre-tiges Boyles 12HH UM-079-100A-12 (P031, P032) : corps Ø 313 mm entre les plaques d'about, moyeux dans
  // leurs ouvertures, bride avant à trois têtes B750 ; poignée en U et levier côté −Z, deux pattes de pied (boulons à
  // œil de la base), oreille d'articulation à 160 mm de l'axe et 105 mm sous l'axe, sur l'axe 850B de la base (+Z) ;
  // graisseur du dessus du corps (page 1.04, détail F : sous la plaque qui porte le support du vérin supérieur).
  const CR = 0.1565, PATTE_Z = -0.22;
  P('UM-079-100A-12', group(
    at(lathe([[0.049, -0.1715], [0.12, -0.1715], [0.12, -0.144], [CR - 0.01, -0.144], [CR, -0.134], [CR, 0.134], [CR - 0.01, 0.144], [0.12, 0.144], [0.12, 0.1715], [0.049, 0.1715]], 'red', { axis: 'x', seg: 48 }), [HX, AXIS_Y, 0]),
    boltCircle(3, 0.085, 0.019, 0.02, 'steel', { axis: 'x', pos: [HX + 0.1715, AXIS_Y, 0], phase: Math.PI / 2, washer: false }),
    ...[-1, 1].map((s) => rod([HX + s * 0.075, 1.3, -0.135], [HX + s * 0.075, 1.3, -0.215], 0.01, 'red', 10)),
    rod([HX - 0.075, 1.3, -0.215], [HX + 0.075, 1.3, -0.215], 0.01, 'red', 10),
    rod([HX, 1.2, -0.13], [HX, 1.225, -0.25], 0.008, 'darkSteel', 10),
    at(api.S.ball(0.016, 'black'), [HX, 1.227, -0.258]),
    ...[-1, 1].map((s) => profilY(rect(HX + s * 0.045 - 0.02, -0.255, HX + s * 0.045 + 0.02, -0.09), [[HX + s * 0.0475, PATTE_Z, 0.007]], 0.03, 1.115)),
    at(ring(0.03, 0.0135, 0.2, 'red', { axis: 'x', seg: 24 }), [HX, AXIS_Y - 0.105, 0.16]),
    at(box(0.2, 0.03, 0.03, 'red'), [HX, AXIS_Y - 0.105, 0.122]),
    // Graisseur ZNPT250 (P032, repère 17) sur le dessus du corps, sous la plaque du boîtier : page 1.04, détail F.
    entretien(at(group(nut(0.011, 0.007, 'brass'), cyl(0.0035, 0.01, 'brass', { pos: [0, 0.008, 0] }), at(api.S.ball(0.0045, 'brass'), [0, 0.014, 0])), [HX, AXIS_Y + CR, 0]), 'graisseur', 'F'),
  ), [0.35, 0.6, 0]);

  // 15 — Base pivotante du serre-tiges UM-064-800B (P014) : table 807B en travers de la poutre sur la plateforme, deux
  // joues en berceau (plans YZ) prolongées côté +Z par les oreilles de l'axe 850B (bagues 806B, poignée en L,
  // épingle HP1000), parallèle à la poutre ; côté −Z, montants fendus, deux boulons à œil 656B articulés sur le boulon
  // B625-7000GR8 (écrou NC625), écrous à embase 657B sur les pattes du serre-tiges.
  {
    const yb0 = BEAM.top + PFT, yb1 = yb0 + 0.03, ER = [0.16, AXIS_Y - 0.105]; // dessus de la table, axe de l'oreille
    const berceau = [];
    for (let k = 0; k <= 16; k++) { const z = 0.125 - (0.275 * k) / 16; berceau.push([z, AXIS_Y - Math.sqrt(0.16 ** 2 - z ** 2)]); }
    const joue = [[-0.2, yb1 - 0.002], [0.19, yb1 - 0.002], [0.195, ER[1]], ...arc(ER, 0.035, 0, Math.PI, 10).slice(1, -1), ...berceau, [-0.2, berceau[16][1]]];
    const base = [
      at(plate(0.33, 0.45, 0.03, 'red', { r: 0.01, holes: [-1, 1].flatMap((s) => [-1, 1].map((u) => [s * 0.14, u * 0.19 - 0.025, 0.009])) }), [HX, yb0 + 0.015, -0.025]),
      ...[-1, 1].map((s) => profilX(joue, [[...ER, 0.0127]], 0.016, HX + s * 0.115)),
      ...[-1, 1].map((s) => at(ring(0.02, 0.0127, 0.022, 'steel', { axis: 'x', seg: 18 }), [HX + s * 0.115, ER[1], ER[0]])),
      at(cyl(0.0127, 0.3, 'steel', { axis: 'x', seg: 16 }), [HX, ER[1], ER[0]]),
      at(box(0.012, 0.07, 0.03, 'red', { r: 0.002 }), [HX + 0.156, ER[1] - 0.032, ER[0]]),
      at(torus(0.012, 0.0018, 'steel', { axis: 'x' }), [HX - 0.14, ER[1] - 0.012, ER[0]]),
      ...[[-0.1, -0.07], [-0.025, 0.025], [0.07, 0.1]].map(([a, b]) => at(box(b - a, 0.064, 0.06, 'red', { r: 0.003 }), [HX + (a + b) / 2, yb1 + 0.032, -0.22])),
      at(cyl(0.008, 0.2, 'steel', { axis: 'x', seg: 12 }), [HX, yb1 + 0.03, PATTE_Z]),
      at(nut(0.022, 0.012, 'steel', { axis: 'x' }), [HX - 0.106, yb1 + 0.03, PATTE_Z]),
      at(nut(0.024, 0.014, 'steel', { axis: 'x' }), [HX + 0.107, yb1 + 0.03, PATTE_Z]),
    ];
    for (const s of [-1, 1]) {
      const x = HX + s * 0.0475;
      base.push(at(ring(0.016, 0.008, 0.016, 'steel', { axis: 'x', seg: 18 }), [x, yb1 + 0.03, PATTE_Z]));
      base.push(rod([x, yb1 + 0.045, PATTE_Z], [x, 1.162, PATTE_Z], 0.0055, 'steel', 10));
      base.push(at(washer(0.018, 0.006, 0.003, 'steel'), [x, 1.1315, PATTE_Z]));
      base.push(at(nut(0.024, 0.012, 'steel'), [x, 1.139, PATTE_Z]));
    }
    P('UM-064-800B', group(...base), [0.2, 0.3, 0]);
  }

  // 11 — Table UM-064-200DS (P018) à l'avant de la course : plaque à ouverture rectangulaire sur les guides noirs 219D
  // posés sur l'aile haute des longerons ; barres latérales hors des longerons (B750-6000 et LN750NC, B625-2500), plaques
  // de poussée grises 225D et arrêtoirs rouges 224D sous les barres, arrêtoirs d'about 613BA aux quatre coins ; côté
  // +Z, pattes 616BA à bagues trempées encadrant le tube de charnière de la tête (l'axe à poignée en L et épingle,
  // 250D à la page 1.8, est posé avec la tête : UM-012-105A de la page 2.1) ; côté
  // −Z, bloc en U à deux boulons à œil 656B (axe B625-2750) et écrous à embase 657B sur la patte à fentes de la tête ;
  // dessous, deux brides 205DS et blocs 204DS sur la barre du cylindre du vérin d'avance.
  {
    const tx0 = HEAD_X - TBL.hl, tl = 2 * TBL.hl, yBar = 0.925, y224 = 0.877, y225 = 0.905, zb = 0.315;
    const PIN = [HB + 0.025, 0.284]; // axe du tube de charnière « underground » de la tête (y, z)
    const OEIL = [-0.0685, 0.0015].map((dx) => HEAD_X + dx), zo = -0.2; // boulons à œil sous les fentes de la patte de la tête
    const t = [
      profilY(rect(tx0, -TBL.hw, tx0 + tl, TBL.hw), [rect(HEAD_X + 0.05, -0.06, HEAD_X + 0.25, 0.06)], TBL.y1 - TBL.y0, (TBL.y0 + TBL.y1) / 2),
      boltSet([-1, 1].flatMap((s) => [-0.33, -0.2, 0.2, 0.33].map((dx) => [HEAD_X + dx, TBL.y1, s * zb])), 0.019, TBL.y1 - y224 + 0.01, 'steel'),
    ];
    for (const s of [-1, 1]) {
      t.push(at(box(tl, 0.015, 0.09, 'black', { r: 0.002 }), [HEAD_X, BEAM.top + 0.0075, s * 0.225]));
      t.push(at(box(tl, TBL.y0 - yBar, 0.06, 'red', { r: 0.003 }), [HEAD_X, (yBar + TBL.y0) / 2, s * zb]));
      t.push(at(box(tl, yBar - y225, 0.083, 'grey', { r: 0.002 }), [HEAD_X, (y225 + yBar) / 2, s * 0.3035]));
      t.push(at(box(tl, y225 - y224, 0.06, 'red', { r: 0.002 }), [HEAD_X, (y224 + y225) / 2, s * zb]));
      t.push(boltSet([-0.33, -0.2, 0.2, 0.33].map((dx) => [HEAD_X + dx, y224, s * zb]), 0.019, 0.001, 'steel', { axis: '-y', washer: false }));
      t.push(boltSet([-0.36, -0.26, -0.16, -0.06, 0.06, 0.16, 0.26, 0.36].map((dx) => [HEAD_X + dx, 0.952, s * TBL.hw]), 0.0159, 0.03, 'steel', { axis: s > 0 ? 'z' : '-z' }));
      for (const u of [-1, 1]) t.push(at(box(0.015, TBL.y0 - y224, 0.06, 'red', { r: 0.002 }), [HEAD_X + u * (TBL.hl + 0.0075), (y224 + TBL.y0) / 2, s * zb]));
    }
    for (const u of [-1, 1]) {
      t.push(at(profil(api, [[-0.02, TBL.y1], [0.02, TBL.y1], [0.02, PIN[0]], ...arc([0, PIN[0]], 0.0185, 0, Math.PI, 10).slice(1, -1), [-0.02, PIN[0]]], [[0, PIN[0], 0.0175]], 0.02), [HEAD_X + u * 0.12, 0, PIN[1]], [0, Math.PI / 2, 0]));
      t.push(at(ring(0.0175, 0.0135, 0.024, 'steel', { axis: 'x', seg: 18 }), [HEAD_X + u * 0.12, PIN[0], PIN[1]]));
    }
    // Bloc en U des boulons à œil (axe B625-2750 et écrou LN625NC).
    for (const [a, b] of [[-0.11, -0.0795], [-0.0575, -0.0095], [0.0125, 0.04]]) t.push(at(box(b - a, 0.038, 0.05, 'red', { r: 0.003 }), [HEAD_X + (a + b) / 2, TBL.y1 + 0.019, -0.206]));
    t.push(at(cyl(0.0079, 0.15, 'steel', { axis: 'x', seg: 12 }), [HEAD_X - 0.035, TBL.y1 + 0.019, zo]));
    t.push(at(nut(0.024, 0.01, 'steel', { axis: 'x' }), [HEAD_X - 0.115, TBL.y1 + 0.019, zo]));
    t.push(at(nut(0.024, 0.01, 'steel', { axis: 'x' }), [HEAD_X + 0.045, TBL.y1 + 0.019, zo]));
    for (const x of OEIL) {
      t.push(at(ring(0.014, 0.0079, 0.014, 'steel', { axis: 'x', seg: 16 }), [x, TBL.y1 + 0.019, zo]));
      t.push(rod([x, TBL.y1 + 0.033, zo], [x, 1.11, zo], 0.0055, 'steel', 10));
      t.push(at(washer(0.016, 0.006, 0.003, 'steel'), [x, 1.0915, zo]));
      t.push(at(nut(0.022, 0.01, 'steel'), [x, 1.098, zo]));
    }
    // Brides 205DS et blocs 204DS sur la barre du cylindre principal.
    for (const dx of [0, 0.3]) { // sur le cylindre principal (X HEAD_X − 0,105 à + 0,395)
      t.push(at(box(0.1, 0.012, 0.08, 'red', { r: 0.002 }), [HEAD_X + dx, TBL.y0 - 0.006, 0]));
      for (const u of [-1, 1]) t.push(at(box(0.012, 0.022, 0.08, 'red', { r: 0.002 }), [HEAD_X + dx + u * 0.044, TBL.y0 - 0.023, 0]));
      t.push(at(box(0.07, 0.022, 0.05, 'grey', { r: 0.003 }), [HEAD_X + dx, TBL.y0 - 0.023, 0]));
    }
    P('UM-064-200DS', group(...t), [0, 0.25, 0]);
  }

  // 9 — Tête de forage Boyles sur la table, broche dans l'axe de l'avance.
  P('UM-012-100UG', at(api.sub('P048'), [HEAD_X, HB, 0]), [0, 0.7, 0]);

  // 17 — Vérin d'avance double UM-064-100Z (P021), logé dans la poutre : deux tiges creuses 119Z Ø 2 po ancrées dans la
  // plaque d'extrémité et le flasque avant de la plateforme (bagues 317B, écrous 128Z et contre-écrous 127Z à
  // l'extérieur, coude 6801-12-12 au bout de chaque tige : l'huile passe par les tiges ; recul à l'arrière, avance à
  // l'avant), tube central 122Z gris Ø 4 po de part et d'autre du cylindre principal 150Z noir (alésage 5 po) accroché
  // sous la table, avec sa barre et son bloc supérieur à deux coudes 6801-12-12.
  // Course de 1 808 mm (page 1.01) : l'ensemble mobile (tube central et cylindre, 1,198 m) part à 9 mm de la bague du
  // flasque avant (tête à l'avant de la course) et s'arrête à 3 mm de la bague de la plaque d'extrémité ; cylindre
  // principal de 0,5 m sous l'arrière de la table, tube central de part et d'autre (page 1.11 : vue d'ensemble).
  // Le vérin supérieur « bazooka » (6) et sa console (8) ne sont pas montés sur cette foreuse.
  const FEED_STROKE = 1.808, CYL_C = HEAD_X + 0.145, CYL_HL = 0.25;
  const cy0 = CYL_C - CYL_HL, cy1 = CYL_C + CYL_HL, tb1 = bx1 - 0.039, tb0 = bx0 + 0.035 + FEED_STROKE;
  const RX = bx0 - 0.075, FX = bx1 + 0.075; // coudes des tiges arrière et avant
  P('UM-064-100Z', group(
    at(lathe([[0.0508, -CYL_HL], [0.083, -CYL_HL], [0.083, 0.04 - CYL_HL], [0.078, 0.04 - CYL_HL], [0.078, CYL_HL - 0.04], [0.083, CYL_HL - 0.04], [0.083, CYL_HL], [0.0508, CYL_HL]], 'black', { axis: 'x', seg: 40 }), [CYL_C, FC.y, 0]),
    at(box(2 * CYL_HL - 0.06, 0.025, 0.03, 'black', { r: 0.003 }), [CYL_C, 0.9325, 0]),
    at(box(0.06, 0.03, 0.07, 'black', { r: 0.004 }), [HEAD_X + 0.15, 0.96, 0]),
    ...[-0.02, 0.02].flatMap((z) => [
      at(cyl(0.009, 0.02, 'brass', { seg: 12 }), [HEAD_X + 0.15, 0.985, z]),
      at(box(0.016, 0.016, 0.016, 'brass', { r: 0.003 }), [HEAD_X + 0.15, 0.997, z]),
      at(cyl(0.008, 0.02, 'brass', { axis: 'x', seg: 12 }), [HEAD_X + 0.168, 0.997, z]),
    ]),
    ...[[tb0, cy0], [cy1, tb1]].map(([a, b]) => at(cyl(0.0508, b - a, 'grey', { axis: 'x', seg: 32 }), [(a + b) / 2, FC.y, 0])),
    ...[[bx0 - 0.06, tb0], [tb1, bx1 + 0.06]].map(([a, b]) => at(cyl(FC.r, b - a, 'chrome', { axis: 'x', seg: 24 }), [(a + b) / 2, FC.y, 0])),
    ...[[bx0 - 0.015, bx0 - 0.04], [bx1 + 0.015, bx1 + 0.04]].flatMap(([a, b]) => [at(nut(0.075, 0.03, 'darkSteel', { axis: 'x' }), [a, FC.y, 0]), at(nut(0.075, 0.02, 'darkSteel', { axis: 'x' }), [b, FC.y, 0])]),
    at(box(0.03, 0.03, 0.03, 'brass', { r: 0.006 }), [RX, FC.y, 0]),
    at(cyl(0.013, 0.103, 'brass', { axis: 'z', seg: 14 }), [RX, FC.y, -0.0665]), // à travers le flanc −Z du connecteur
    at(box(0.03, 0.03, 0.03, 'brass', { r: 0.006 }), [FX, FC.y, 0]),
    at(cyl(0.013, 0.035, 'brass', { seg: 14 }), [FX, FC.y - 0.0325, 0]),
  ), [0, -0.45, 0]);

  // 18 — Vérins de bascule FBRA-002-515ZZ (P019, page 1.01), un par côté au-dessus du longeron : vérin HBU-3010 noir,
  // fond en bloc à tube transversal sur la chape du longeron (axe UM-064-553D, épingle HP1000, graisseur Z125-S),
  // œil de tige dans les joues de la patte avant du support ; orifices dans le plan du vérin, côté haut. Bloc YEJ
  // gris sur l'orifice de la tige (2404-8-8, 6402-8-8), boulonné (B312-2500) sur le support FBRA-002-505Z que serrent
  // sur le fût les colliers J000228-2 et J000228-1 ; deux clapets d'équilibrage CBCA-LHN debout ; tube FBRA-002-507Z
  // du bloc (6801F-8-8) à l'orifice du fond (coude 2501F-08-08) ; deux 6801F-8-8 coudés vers le bas pour les boyaux.
  const angT = Math.atan2(TILT.d[1], TILT.d[0]);
  for (const s of [-1, 1]) {
    const z = s * TILT.z, rr = TILT.rodR;
    const W = (u, t, dz = 0) => [...TILT.pt(u, t), z + dz];
    const R = (obj, u, t, dz = 0) => at(obj, W(u, t, dz), [0, 0, angT]);
    const yejIn = z - s * 0.025; // face intérieure du bloc (50 mm de large, centré sur le vérin)
    const vc = group(
      at(group(hydCylinder(TILT.len, TILT.bore, { material: 'black', rodR: rr, ext: TILT.ext, eyes: 'none' })), [...TILT.a, z], [0, 0, angT]),
      R(box(0.05, 0.06, 0.036, 'black', { r: 0.004 }), 0.037, 0),
      at(ring(0.025, 0.0128, 0.036, 'black', { axis: 'z', seg: 24 }), [...TILT.foot, z]),
      at(cyl(0.0127, 0.09, 'steel', { axis: 'z', seg: 14 }), [...TILT.foot, z]),
      at(torus(0.012, 0.0018, 'steel', { axis: 'z' }), [TILT.foot[0], TILT.foot[1] - 0.012, z + s * 0.042]),
      entretien(R(cyl(0.004, 0.012, 'zinc', { seg: 8 }), 0.03, 0.034), 'graisseur', 'B'), // page 1.04, détail B
      entretien(at(ring(rr * 1.5, rr * 0.68, rr * 1.3, 'darkSteel', { axis: 'z', seg: 24 }), [...TILT.head, z]), 'graisseur', 'A'), // page 1.04, détail A
      R(nut(rr * 1.7, rr * 0.45, 'darkSteel', { axis: 'x' }), TILT.L - 0.9 * rr - rr * 0.95, 0),
      at(cyl(0.0127, 0.085, 'steel', { axis: 'z', seg: 14 }), [...TILT.head, z]),
    );
    const yej = group(
      R(box(2 * YEJ.hs, 2 * YEJ.ht, 0.05, 'grey', { r: 0.004 }), YEJ.s, YEJ.t),
      // Adaptateurs 2404-8-8 et 6402-8-8 de l'orifice de la tige au dessous du bloc.
      rod([...TILT.pt(0.3905, 0.064), z], [...TILT.pt(YEJ.s + 0.03, YEJ.t - YEJ.ht), z], 0.009, 'brass', 12),
      // Clapets d'équilibrage CBCA-LHN debout sur le bloc.
      ...[YEJ.s - 0.025, YEJ.s + 0.025].flatMap((u) => [
        R(nut(0.024, 0.012, 'steel'), u, YEJ.t + YEJ.ht + 0.006),
        R(cyl(0.0105, 0.06, 'darkSteel', { seg: 14 }), u, YEJ.t + YEJ.ht + 0.042),
      ]),
      // Support FBRA-002-505Z (tôle rouge à boutonnières) sur la face extérieure du bloc, vis B312-2500 et écrous NFC375.
      R(box(0.12, 0.105, 0.005, 'red', { r: 0.002 }), YEJ.s, 0.0925, s * 0.0275),
      ...[YEJ.s - 0.03, YEJ.s + 0.03].map((u) => R(bolt(0.0079, 0.065, 'steel', { axis: s > 0 ? 'z' : '-z', washer: true }), u, YEJ.t + 0.015, s * 0.03)),
      ...[YEJ.s - 0.03, YEJ.s + 0.03].map((u) => R(nut(0.0143, 0.008, 'steel', { axis: 'z' }), u, YEJ.t + 0.015, -s * 0.029)),
      // Colliers J000228-2 (étrier) et J000228-1 sur le fût.
      at(torus(0.05, 0.004, 'zinc', { axis: 'x' }), W(YEJ.s - 0.075, 0), [0, 0, angT]),
      at(ring(0.0505, 0.0452, 0.016, 'black', { axis: 'x', seg: 32 }), W(YEJ.s - 0.02, 0), [0, 0, angT]),
      // Raccords 6801F-8-8 : un vers le tube (face arrière du bloc), deux coudés vers le bas (face intérieure).
      R(cyl(0.008, 0.014, 'brass', { axis: 'x', seg: 12 }), YEJ.s - YEJ.hs - 0.007, YEJ.t),
      ...yejPorts(s).flatMap(([x, y]) => [
        at(cyl(0.008, 0.02, 'brass', { axis: 'z', seg: 12 }), [x, y + 0.03, yejIn - s * 0.01]),
        at(box(0.016, 0.016, 0.016, 'brass', { r: 0.003 }), [x, y + 0.03, z - s * 0.05]),
        at(cyl(0.008, 0.024, 'brass', { seg: 12 }), [x, y + 0.012, z - s * 0.05]),
      ]),
      // Coude 2501F-08-08 sur l'orifice du fond et tube FBRA-002-507Z le long du fût.
      R(box(0.016, 0.016, 0.016, 'brass', { r: 0.003 }), 0.10725, 0.074),
      R(cyl(0.007, 0.022, 'brass', { axis: 'x', seg: 12 }), 0.124, 0.074),
      tube([[0.135, 0.074], [0.17, 0.076], [0.22, 0.08], [0.25, 0.098], [0.27, 0.115], [YEJ.s - YEJ.hs - 0.014, YEJ.t]].map(([u, t]) => W(u, t)), 0.006, 'steel', { seg: 40 }),
    );
    P('FBRA-002-515ZZ', group(vc, yej), [0, 0, s * 0.45]);
  }

  // 12 — Vérin de relevage UM-064-300Z (HBU 2536, P019) : couché entre les HSS du support, fond (axe UM-064-550D) sur les
  // chapes 213B, tige 0,885 m au-delà du bout du cadre jusqu'à la patte sous la poutre (axe UM-064-575D, épingles
  // HP1000) : il fait coulisser la poutre dans le support. Orifices vers +Z ; bloc YEJ côté fond (2404-8-8, 6402-8-8),
  // deux clapets CBCA-LHN, trois 6801F-8-8 (deux coudés vers le bas pour les boyaux, un vers l'orifice de la tige,
  // coude 2501F-08-08).
  {
    const { a, b, bore, rodR, ext } = DUMP, r = bore / 2, len = DUMP.len;
    const c = hydCylinder(len, bore, { material: 'black', rodR, ext, eyes: 'none' });
    c.rotation.x = Math.PI / 2;
    const ey = DUMP.foot[1], Y = DUMP_YEJ, yx = (Y.x[0] + Y.x[1]) / 2, yz = (Y.z[0] + Y.z[1]) / 2;
    const [pf, pt] = cylPortsZ(a, b, bore, ext, 1); // orifices du fond et de la tige
    const vd = group(
      at(group(c), [a[0], a[1], 0], [0, 0, Math.PI]),
      at(ring(r * 0.75, r * 0.34, r * 0.7, 'black', { axis: 'z', seg: 28 }), [...DUMP.foot, 0]),
      at(ring(rodR * 1.5, rodR * 0.71, rodR * 1.3, 'darkSteel', { axis: 'z', seg: 24 }), [...DUMP.head, 0]),
      at(nut(rodR * 1.7, rodR * 0.45, 'darkSteel', { axis: 'x' }), [DUMP.head[0] + 0.9 * rodR + 0.95 * rodR, ey, 0]),
      at(cyl(0.0127, 0.085, 'steel', { axis: 'z', seg: 14 }), [...DUMP.foot, 0]),
      at(cyl(0.0127, 0.062, 'steel', { axis: 'z', seg: 14 }), [...DUMP.head, 0]),
      ...[[DUMP.foot, 0.04], [DUMP.head, 0.028]].map(([p, dz]) => at(torus(0.012, 0.0018, 'steel', { axis: 'z' }), [p[0], p[1] - 0.012, dz])),
      // Patte à chape sous la semelle de la poutre.
      at(box(0.08, 0.01, 0.06, 'red', { r: 0.002 }), [DUMP.head[0], by0 - 0.005, 0]),
      ...[-1, 1].map((u) => at(box(0.05, by0 - 0.01 - (ey - 0.022), 0.008, 'red', { r: 0.002 }), [DUMP.head[0], (by0 - 0.01 + ey - 0.022) / 2, u * 0.019])),
    );
    const yej = group(
      at(box(Y.x[1] - Y.x[0], Y.y[1] - Y.y[0], Y.z[1] - Y.z[0], 'grey', { r: 0.004 }), [yx, ey, yz]),
      at(cyl(0.009, Y.z[0] - pf[2] + 0.002, 'brass', { axis: 'z', seg: 12 }), [pf[0], ey, (Y.z[0] + pf[2]) / 2]),
      ...Y.ports.flatMap((x) => [
        at(nut(0.024, 0.012, 'steel', { axis: 'z' }), [x, ey, Y.z[1] + 0.006]),
        at(cyl(0.0105, 0.055, 'darkSteel', { axis: 'z', seg: 14 }), [x, ey, Y.z[1] + 0.0395]),
        at(cyl(0.008, 0.027, 'brass', { seg: 12 }), [x, Y.y[0] - 0.0135, yz]),
        at(nut(0.02, 0.008, 'brass'), [x, Y.y[0] - 0.006, yz]),
      ]),
      at(cyl(0.008, 0.027, 'brass', { axis: 'x', seg: 12 }), [Y.x[0] - 0.0135, ey, yz]),
      // Coude 2501F-08-08 sur l'orifice de la tige, tourné vers le fond.
      at(box(0.016, 0.016, 0.016, 'brass', { r: 0.003 }), [pt[0], ey, 0.065]),
      at(cyl(0.007, 0.022, 'brass', { axis: 'x', seg: 12 }), [pt[0] + 0.019, ey, 0.065]),
    );
    P('UM-064-300Z', group(vd, yej), [0, -0.3, 0]);
  }

  // 10 — Rallonge rentrée (P013, pages 1.01 et 1.02) : connecteur UM-064-150C_R1 (semelles grises à lobes boulonnées
  // sur la plaque d'extrémité par des B750-2000 et LC750 ; deux flancs, corps en U ouvert dessus et dessous où logent
  // les écrous de la tige arrière du vérin d'avance, flanc −Z percé pour le boyau de recul ; coulisses des montants
  // du guide de tiges ; plaque arrière) ; guides UM-064-195C serrés par deux B750-2000 et LC750 chacun à travers les
  // boutonnières des montants ; guide de tiges UM-064-200C (P016) dans les coulisses ; pivot de poulie UM-064-1000DD
  // (P015) vissé sur la plaque arrière ; poulie pivotante UM-064-180C_R1 (P017) sur la plaque mobile du pivot.
  {
    const c = [];
    const [g0, g1] = CON.g.map(dX), gx = (g0 + g1) / 2, gl = g0 - g1, gyc = (CON.gy[0] + CON.gy[1]) / 2, gh = CON.gy[1] - CON.gy[0];
    const CNY = [0.785, 0.915]; // boulons des semelles (|z| 0,142)
    for (const s of [-1, 1]) {
      const lobes = hull([...CNY.flatMap((y) => circle([0.142, y], 0.026, 14)), [CON.zi, CON.y[0]], [CON.zi, CON.y[1]]]);
      c.push(profilX(lobes.map(([z, y]) => [s * z, y]), CNY.map((y) => [s * 0.142, y, 0.0105]), 0.018, dX(0.009), 'grey'));
      c.push(at(profil(api, [[dX(0.018), CON.y[0]], [g1, CON.y[0]], [g1, CON.gy[1]], [g0, CON.gy[1]], [g0, CON.y[1]], [dX(0.018), CON.y[1]]],
        s < 0 ? [[RX, FC.y, 0.022]] : [], CON.zo - CON.zi), [0, 0, s * (CON.zi + CON.zo) / 2]));
      // Coulisse : fond plein derrière le montant, deux barres devant et derrière lui.
      c.push(at(box(gl, gh, CON.zl - CON.zo, 'red', { r: 0.002 }), [gx, gyc, s * (CON.zo + CON.zl) / 2]));
      for (const [d0, d1] of [[CON.g[0], 0.17], [0.25, CON.g[1]]]) c.push(at(box(d1 - d0, gh, CON.zg - CON.zl, 'red', { r: 0.002 }), [dX((d0 + d1) / 2), gyc, s * (CON.zl + CON.zg) / 2]));
      // Guide 195C percé de deux trous, B750-2000 et LC750 à travers la boutonnière du montant.
      c.push(at(profil(api, rect(dX(0.259), CON.gy[0], g0, CON.gy[1]), [0.81, 0.9].map((y) => [ROLLER[0], y, 0.0105]), CON.tg), [0, 0, s * (CON.zg + CON.tg / 2)]));
      for (const y of [0.81, 0.9]) c.push(at(bolt(0.019, 0.05, 'steel', { axis: s > 0 ? 'z' : '-z', washer: true }), [ROLLER[0], y, s * (CON.zg + CON.tg)]));
    }
    c.push(boltSet([-1, 1].flatMap((s) => CNY.map((y) => [dX(0.018), y, s * 0.142])), 0.019, 0.05, 'steel', { axis: '-x' }));
    c.push(at(box(CON.bp[1] - CON.bp[0], CON.by[1] - CON.by[0], 2 * CON.zo, 'red', { r: 0.003 }), [dX((CON.bp[0] + CON.bp[1]) / 2), (CON.by[0] + CON.by[1]) / 2, 0]));
    c.push(at(api.sub('P016'), [...ROLLER, 0]), at(api.sub('P015'), [...PV.pin, 0]), at(api.sub('P017'), [...PUL.L, 0]));
    P('UM-064-200C', group(c), [-0.6, 0.3, 0]);
  }

  // 20 — Émerillon d'eau UM-106-100AA (page 1.16) au bout arrière de la broche : rallonge de broche 104A en acier
  // (Ø 45 × 67) contre la broche, corps 105A (Ø 86 × 73), chapeau souterrain 100A-UG (Ø 71) à bout bombé et deux
  // méplats, entrée d'eau axiale taraudée au bout (raccord laiton vers −X).
  P('UM-106-100AA', group(
    at(lathe([[0.012, 0.158], [0.0225, 0.158], [0.0225, 0.225], [0.012, 0.225]], 'steel', { axis: 'x', seg: 24 }), [SW_X - 0.225, AXIS_Y, 0]),
    at(lathe([[0.011, 0], [0.022, 0.003], [0.027, 0.008], [0.028, 0.012], [0.028, 0.046], [0.0355, 0.05], [0.0355, 0.085], [0.043, 0.085], [0.043, 0.158], [0.011, 0.158]], 'red', { axis: 'x', seg: 32 }), [SW_X - 0.225, AXIS_Y, 0]),
    at(box(0.034, 0.068, 0.058, 'red', { r: 0.01 }), [SW_X - 0.196, AXIS_Y, 0]), // bout à deux méplats (z ±0,029)
    at(cyl(0.011, 0.03, 'brass', { axis: 'x', seg: 14 }), [SW_X - 0.24, AXIS_Y, 0]),
    at(nut(0.026, 0.01, 'brass', { axis: 'x' }), [SW_X - 0.232, AXIS_Y, 0]),
  ), [-0.4, 0.2, 0]);

  // 4 — Treuil de câble 10 000 pi (P042) sur l'arrière du traîneau, capot en position haute, avec son cadre
  // « option underground » posé entre les longerons devant le bâti (pages 1.00, 1.01 et 8.0).
  P('FBRA-002-400HH', at(api.sub('P042', { capot: WINCH.capot, guide: WINCH.guide, cable: false, cadre: true }), [WINCH.x, WINCH.y, 0]), [-0.2, 0.5, 0]);
  // Câble du treuil (tambour → guide-câble → poulie double → rouleau du guide de tiges) et son embout serti.
  api.add(group(
    tube(wire.pts, 0.004, 'darkSteel', { seg: wire.pts.length, tension: 0.5 }),
    at(cyl(0.007, 0.016, 'darkSteel', { axis: 'y', seg: 12 }), [wire.tip[0], wire.tip[1] - 0.008, 0]),
  ));

  // Boyaux de la foreuse, des sélecteurs DF10 aux appareils (les raccords sont décrits avec leurs pièces).
  const [l0, l1] = [0, 1].map((k) => dfZ(-1, k)), [r0, r1] = [0, 1].map((k) => dfZ(1, k));
  const back = DF.x - DF.hx - 0.03; // bout des raccords arrière des sélecteurs
  // Vérin d'avance (vannes à bille du sélecteur gauche). Recul (tige arrière) sur la vanne intérieure : du coude, dans
  // le connecteur de la rallonge, sortie par son flanc −Z, le long du flanc −Z de la poutre au-dessus des brides du
  // support, descente derrière le support et sous la poutre, puis vers l'avant entre les HSS jusqu'au-dessus des vannes.
  // Avance (tige avant) sur la vanne extérieure : du coude, entre la poutre et la plaque de pied, descente devant le
  // support, puis vers l'arrière sous la traverse des poteaux avant.
  const feedRecul = hose([[RX, FC.y, -0.118], [RX, FC.y, -0.15], [RX + 0.005, FC.y - 0.005, -0.22], [bx0 - 0.02, 0.837, -0.3], [bx0 + 0.08, 0.835, -0.31],
    [-1.3, 0.835, -0.31], [-0.7, 0.835, -0.31], [-0.36, 0.82, -0.31], [-0.3, 0.7, -0.305], [-0.28, 0.55, -0.27], [-0.24, 0.45, -0.17], [-0.15, 0.415, -0.12],
    [0.1, 0.41, -0.12], [0.45, 0.41, -0.13], [0.65, 0.41, -0.18], [0.77, 0.4, l0], [DF.x, 0.36, l0], [DF.x, BKH_TOP + 0.012, l0], [DF.x, BKH_TOP, l0]], 0.014);
  const feedAvance = hose([[FX, FC.y - 0.05, 0], [FX, FC.y - 0.1, 0], [FX, 0.62, -0.01], [FX - 0.01, 0.5, -0.05], [FX - 0.06, 0.43, -0.15], [1.2, 0.405, -0.25],
    [1.02, 0.4, l1], [0.9, 0.395, l1], [DF.x + 0.005, 0.36, l1], [DF.x, BKH_TOP + 0.012, l1], [DF.x, BKH_TOP, l1]], 0.014);
  // Moteur White du treuil (raccords 6400-12-12 sur le dessus) : au-dessus du moteur, vers l'avant par-dessus les
  // montants du bâti, le long du longeron gauche sous les bras des poteaux arrière, sur le caisson, jusqu'aux raccords
  // arrière du sélecteur gauche.
  const [mB, mA] = MOTOR_PORTS.map(([x, y, z]) => [WINCH.x + x, WINCH.y + y, z]); // orifice arrière, orifice avant
  const motorHoses = [
    hose([mA, [mA[0], mA[1] + 0.03, mA[2]], [mA[0] + 0.008, 0.385, -0.205], [-0.75, 0.37, -0.205], [-0.55, 0.33, -0.205], [-0.35, 0.24, -0.205], [-0.1, 0.188, -0.205],
      [0.3, 0.172, -0.205], [0.62, 0.165, -0.215], [0.72, 0.162, l0], [back, DF_MID, l0]], 0.014),
    hose([mB, [mB[0], mB[1] + 0.03, mB[2]], [mB[0] + 0.005, 0.4, -0.22], [mB[0] + 0.05, 0.44, -0.255], [-0.75, 0.42, -0.255], [-0.55, 0.36, -0.255], [-0.35, 0.27, -0.255],
      [-0.1, 0.198, -0.255], [0.3, 0.18, -0.26], [0.62, 0.17, -0.285], [0.72, 0.162, l1], [back, DF_MID, l1]], 0.014),
  ];
  // Vérins de bascule (sélecteur droit) : raccord extérieur du dessus → bloc YEJ droit, raccord intérieur → bloc YEJ
  // gauche (par-dessus le sélecteur gauche) ; le second raccord de chaque bloc relie les deux vérins sous le support.
  const [yr0, yr1] = yejPorts(1), [yl0, yl1] = yejPorts(-1);
  const tiltHoses = [
    hose([[DF.x, DF_TOP, r1], [DF.x, DF_TOP + 0.03, r1], [0.81, 0.31, 0.31], [0.7, 0.37, 0.35], [0.63, 0.4, 0.385], [yr0[0], yr0[1] - 0.04, yr0[2]], yr0], 0.012),
    hose([[DF.x, DF_TOP, r0], [DF.x, DF_TOP + 0.03, r0], [0.835, 0.36, 0.21], [0.825, 0.465, 0.1], [0.8, 0.47, -0.1], [0.74, 0.47, -0.28], [0.65, 0.44, -0.38],
      [yl0[0], yl0[1] - 0.04, yl0[2]], yl0], 0.012),
    hose([yr1, [yr1[0] + 0.002, yr1[1] - 0.035, 0.4], [0.64, 0.465, 0.32], [0.645, 0.47, 0], [0.64, 0.465, -0.32], [yl1[0] + 0.002, yl1[1] - 0.035, -0.4], yl1], 0.012),
  ];
  // Vérin de relevage (sélecteur droit) : raccords arrière → dessous du bloc YEJ ; orifice de la tige → bloc YEJ.
  const ey = DUMP.foot[1], [px0, px1] = DUMP_YEJ.ports, pyz = (DUMP_YEJ.z[0] + DUMP_YEJ.z[1]) / 2, py = DUMP_YEJ.y[0] - 0.027;
  const dumpHoses = [
    hose([[px0, py, pyz], [px0, py - 0.035, pyz], [px0 - 0.012, 0.45, 0.13], [px0 - 0.02, 0.28, 0.2], [0.7, 0.19, r0], [0.73, 0.163, r0], [back, DF_MID, r0]], 0.012),
    hose([[px1, py, pyz], [px1, py - 0.035, pyz + 0.005], [px1 - 0.022, 0.45, 0.18], [px1 - 0.04, 0.3, 0.27], [0.7, 0.2, r1], [0.73, 0.163, r1], [back, DF_MID, r1]], 0.012),
    hose([[0.132, ey, 0.065], [0.2, ey, 0.068], [0.45, ey, 0.08], [DUMP_YEJ.x[0] - 0.06, ey, pyz], [DUMP_YEJ.x[0] - 0.027, ey, pyz]], 0.012),
  ];
  // Étiquettes de circuit hydraulique (outil « Circuits » de l'interface ; sans effet sur la géométrie).
  const circ = (t, circuit, circuitLabel, circuitFrom, circuitTo) => Object.assign(t.userData, { circuit, circuitLabel, circuitFrom, circuitTo });
  // Les deux sélecteurs sont des « SWITCH VALVE MAST TO WIRE LINE » (page 1.1) ; le manuel n'a pas de schéma
  // hydraulique : les branches bascule et relevage du sélecteur droit sont une hypothèse du modèle.
  const SG = 'Sélecteur DF10-6B-12L gauche', SD = 'Sélecteur DF10-6B-12L droit';
  circ(feedRecul, 'recul', 'Recul : sélecteur gauche → tige arrière du vérin d\'avance', `${SG} : vanne à bille intérieure BKH-12NPT`, 'Vérin d\'avance UM-064-100Z : tige creuse arrière (raccord du connecteur)');
  circ(feedAvance, 'avance', 'Avance : sélecteur gauche → tige avant du vérin d\'avance', `${SG} : vanne à bille extérieure BKH-12NPT`, 'Vérin d\'avance UM-064-100Z : tige creuse avant (raccord de la plaque de pied)');
  circ(motorHoses[0], 'treuil', 'Treuil : moteur White ↔ sélecteur gauche (orifice avant)', `${SG} : raccord arrière intérieur (6400-8-8)`, 'Moteur White du treuil : orifice avant (6400-12-12)');
  circ(motorHoses[1], 'treuil', 'Treuil : moteur White ↔ sélecteur gauche (orifice arrière)', `${SG} : raccord arrière extérieur (6400-8-8)`, 'Moteur White du treuil : orifice arrière (6400-12-12)');
  circ(tiltHoses[0], 'bascule', 'Bascule (hypothèse du modèle) : sélecteur droit → vérin de bascule droit', `${SD} : raccord extérieur du dessus (6400-8-8)`, 'Vérin de bascule droit : bloc YEJ (6801F-8-8)');
  circ(tiltHoses[1], 'bascule', 'Bascule (hypothèse du modèle) : sélecteur droit → vérin de bascule gauche', `${SD} : raccord intérieur du dessus (6400-8-8)`, 'Vérin de bascule gauche : bloc YEJ (6801F-8-8)');
  circ(tiltHoses[2], 'bascule', 'Bascule (hypothèse du modèle) : liaison entre les deux vérins', 'Vérin de bascule droit : bloc YEJ, second raccord (6801F-8-8)', 'Vérin de bascule gauche : bloc YEJ, second raccord (6801F-8-8)');
  circ(dumpHoses[0], 'relevage', 'Relevage (hypothèse du modèle) : sélecteur droit → bloc YEJ du vérin de relevage', `${SD} : raccord arrière intérieur (6400-8-8)`, 'Vérin de relevage UM-064-300Z : dessous du bloc YEJ (6801F-8-8)');
  circ(dumpHoses[1], 'relevage', 'Relevage (hypothèse du modèle) : sélecteur droit → bloc YEJ du vérin de relevage', `${SD} : raccord arrière extérieur (6400-8-8)`, 'Vérin de relevage UM-064-300Z : dessous du bloc YEJ (6801F-8-8)');
  circ(dumpHoses[2], 'relevage', 'Relevage (hypothèse du modèle) : bloc YEJ → orifice de la tige', 'Vérin de relevage UM-064-300Z : bloc YEJ (6801F-8-8)', 'Vérin de relevage UM-064-300Z : orifice de la tige (coude 2501F-08-08)');
  api.add(group(feedRecul, feedAvance, ...motorHoses, ...tiltHoses, ...dumpHoses));
  return { view: { dir: [0.75, 0.5, 1.0] } };
}

// P015 — Pivot de poulie UM-064-1000DD (page 1.5), repère : axe de la charnière (X vers l'avant de la foreuse, Y vers
// le haut). Plaque de base 1002DD verticale (vissée par quatre CS750-1500 sur la plaque arrière du connecteur), deux
// nœuds de charnière en bas, lobe côté +Z portant le fourreau rouge à six pans dirigé vers l'avant ; plaque mobile
// 1001DD inclinée à 61,5°, nœud central, oreille côté +Z sur laquelle s'appuie le ressort 1009D ; tige de réglage
// 1003DD grise (six pans à l'avant, vissée dans le fourreau, bout réduit dans le ressort) et goupille 1015D ; axe
// 1004DD à collerette, graisseur 1014D et épingle 1017D.
export function P015(api) {
  const { box, cyl, ring, nut, torus, spring, plate, group, at } = api.S;
  const P = lister(api, 'P015');
  const [ox, oy] = PV.pin;
  const lx = (d) => dX(d) - ox, ly = (y) => y - oy; // distance derrière la plaque d'extrémité, hauteur → repère local
  const L = ([x, y]) => [x - ox, y - oy];
  const [xf, xr] = PV.base.map(lx), xm = (xf + xr) / 2; // faces avant et arrière de la plaque de base
  const S = [ly(PV.sy), PV.sz]; // axe du fourreau, de la tige et du ressort (y, z)
  const base = [
    profilXa(api, [[-0.1, ly(PV.y[0])], [0.15, ly(PV.y[0])], ...arc([PV.sz, S[0]], 0.04, -1.2, Math.PI / 2, 12), [0.1, S[0] + 0.076], [0.1, ly(PV.y[1])], [-0.1, ly(PV.y[1])]],
      [[PV.sz, S[0], 0.0135]], xf - xr, xm),
    ...[-1, 1].flatMap((s) => [
      at(ring(0.024, 0.0128, 0.04, 'red', { axis: 'z', seg: 24 }), [0, 0, s * 0.08]),
      at(box(xf - xr, 0.032, 0.04, 'red'), [xm, 0.033, s * 0.08]),
    ]),
    at(ring(0.032, 0.0135, 0.099, 'red', { axis: 'x', seg: 24 }), [xf + 0.0495, S[0], S[1]]),
    at(nut(0.068, 0.035, 'red', { axis: 'x' }), [xf + 0.1165, S[0], S[1]]),
  ];
  P('UM-064-1002DD', group(base), [0.15, 0, 0]);
  const rot = [0, 0, Math.atan2(PV_U[1], PV_U[0])]; // X de la tôle le long de la plaque mobile, Y selon sa normale
  P('UM-064-1001DD', group(
    at(plate(0.255, 0.2, 0.016, 'red', { r: 0.004, holes: [-0.0625, 0.0375].flatMap((x) => [-0.05, 0.05].map((z) => [x, z, 0.0105])) }), L(pp(0.1625, 0)), rot),
    at(box(0.03, 0.016, 0.114, 'red'), [...L(pp(0.025, 0)), 0], rot), // col étroit entre les nœuds de la plaque de base
    at(plate(0.08, 0.105, 0.016, 'red', { r: 0.004 }), [...L(pp(0.095, 0)), 0.1525], rot),
    at(ring(0.022, 0.0128, 0.114, 'red', { axis: 'z', seg: 24 }), [0, 0, 0]),
  ), [-0.15, -0.05, 0]);
  each(P, 'CS750-1500', [0.152, 0.262].flatMap((y) => [-0.065, 0.065].map((z) => at(cyl(0.017, 0.0015, 'darkSteel', { axis: 'x', seg: 18 }), [xr - 0.00075, y, z]))), [-0.1, 0, 0]);
  P('UM-064-1004DD', group(at(cyl(0.0125, 0.215, 'steel', { axis: 'z', seg: 16 }), [0, 0, -0.0075]), at(cyl(0.02, 0.008, 'steel', { axis: 'z', seg: 20 }), [0, 0, 0.104])), [0, 0, 0.25]);
  P('UM-064-1014D', entretien(at(cyl(0.004, 0.01, 'zinc', { axis: 'z', seg: 10 }), [0, 0, 0.113]), 'graisseur', 'pivot-poulie'), [0, 0, 0.35]);
  P('UM-064-1017D', at(torus(0.0142, 0.0015, 'steel', { axis: 'z' }), [0, 0, -0.108]), [0, 0, -0.25]);
  P('UM-064-1003DD', group(
    at(nut(0.03, 0.016, 'grey', { axis: 'x' }), [lx(0.097), S[0], S[1]]),
    at(cyl(0.0125, lx(0.105) - lx(0.3), 'grey', { axis: 'x', seg: 16 }), [(lx(0.105) + lx(0.3)) / 2, S[0], S[1]]),
    at(cyl(0.008, lx(0.3) - lx(0.328), 'grey', { axis: 'x', seg: 12 }), [(lx(0.3) + lx(0.328)) / 2, S[0], S[1]]),
  ), [0.25, 0, 0]);
  P('UM-064-1015D', at(cyl(0.0024, 0.0254, 'steel', { axis: 'y', seg: 8 }), [lx(0.125), S[0], S[1]]), [0.25, 0.05, 0]);
  P('UM-064-1009D', at(spring(0.016, 0.003, 0.0235, 4, 'red', { axis: 'x' }), [xr - 0.0005 - 0.01175, S[0], S[1]]), [-0.1, 0, 0.1]);
  return { view: { dir: [-0.6, 0.4, 1.0] } };
}

// P016 — Guide de tiges UM-064-200C (page 1.6), repère : axe du rouleau. Cadre 100C : deux montants plats 3 × 1/2 po
// à bout arrondi (le grand côté +Z, le petit finit juste au-dessus de l'axe), boutonnières en bas, bossage autour
// du trou d'axe du grand montant, traverse sous le rouleau ; axe 130C, épingle 102C et graisseur 140C ; rouleau
// diabolo 500GR en caoutchouc noir qui remplit l'écart entre les montants.
export function P016(api) {
  const { box, cyl, ring, lathe, torus, group, at } = api.S;
  const P = lister(api, 'P016');
  const H = 0.038, yb = CON.gy[0] - ROLLER[1], zc = (CON.zl + CON.zg) / 2, t = CON.zg - CON.zl;
  const leg = (top) => [[-H, yb], [H, yb], [H, top - H], ...arc([0, top - H], H, 0, Math.PI, 14).slice(1, -1), [-H, top - H]];
  const slot = [...arc([0, -0.145], 0.01, 0, Math.PI, 6), ...arc([0, -0.375], 0.01, Math.PI, 2 * Math.PI, 6)];
  P('UM-064-100C', group(
    at(profil(api, leg(1.372 - ROLLER[1]), [slot, [0, 0, 0.0105]], t), [0, 0, zc]),
    at(profil(api, leg(1.222 - ROLLER[1]), [slot, [0, 0, 0.0105]], t), [0, 0, -zc]),
    at(ring(0.022, 0.0105, 0.008, 'red', { axis: 'z', seg: 20 }), [0, 0, CON.zg + 0.004]),
    at(box(2 * H, 0.0125, 2 * CON.zl, 'red', { r: 0.002 }), [0, -0.086 - 0.00625, 0]),
  ), [0, 0.3, 0]);
  P('UM-064-130C', at(cyl(0.01, 0.3, 'steel', { axis: 'z', seg: 14 }), [0, 0, 0]), [0, 0, 0.3]);
  P('UM-064-140C', entretien(at(cyl(0.004, 0.012, 'zinc', { axis: 'z', seg: 8 }), [0, 0, 0.156]), 'graisseur', 'guide-tiges'), [0, 0, 0.4]);
  P('UM-064-102C', at(torus(0.0117, 0.0015, 'steel', { axis: 'z' }), [0, 0, -0.145]), [0, 0, -0.35]);
  P('UM-066-500GR', at(lathe([[0.0105, -0.125], [0.042, -0.125], [0.0445, -0.122], [0.0445, -0.095], [0.033, -0.004], [0.033, 0.004], [0.0445, 0.095],
    [0.0445, 0.122], [0.042, 0.125], [0.0105, 0.125], [0.0105, -0.125]], 'rubber', { axis: 'z', seg: 36 }), [0, 0, 0]), [0, 0.15, 0]);
  return { view: { dir: [0.6, 0.35, 1.0] } };
}

// P017 — Poulie pivotante UM-064-180C_R1 (page 1.7), repère : axe du réa bas. Deux cadres 124C (flasques longs à
// bossages aux axes, bord arrière droit, lobe avant jusqu'au demi-pied soudé, percé de deux trous, posé sur la plaque
// mobile du pivot) ; deux réas 119C Ø 200 à gorge et voile à gradins, chacun sur deux roulements 6209 2RS (118C) ;
// axes 127C Ø 45 à collerette côté +Z, rondelle spéciale 128C et vis B750-2250 côté −Z ; quatre entretoises 131C
// (au-delà de chaque réa et à l'arrière de chaque axe : elles retiennent le câble dans les gorges), B500-4000,
// LC500 et NC500.
export function P017(api) {
  const { ring, cyl, lathe, bolt, nut, washer, plate, extrude, group, at } = api.S;
  const P = lister(api, 'P017');
  const [ox, oy] = PUL.L, L = ([x, y]) => [x - ox, y - oy], f = (s, n) => L(fr(s, n));
  const axes = [f(0, 0), f(SHEAVE_E, 0)];
  // Contour du cadre 124C relevé en (s, n) sur la vue de côté (pages 1.02 et 1.7) : bord arrière droit à n −0,1285,
  // bouts arrondis autour des axes jusqu'aux entretoises d'extrémité ; bord avant passant par les centres des axes
  // (seul le bossage Ø 80 dépasse, la moitié avant de chaque réa reste visible), lobe jusqu'au pied soudé et
  // encoche en V entre le pied et le réa bas.
  const arc = (cs, cn, r, a0, a1, n = 10) => Array.from({ length: n + 1 }, (_, k) => {
    const a = ((a0 + ((a1 - a0) * k) / n) * Math.PI) / 180;
    return [cs + r * Math.cos(a), cn + r * Math.sin(a)];
  });
  const sn = ([x, y]) => { const dx = x - ox, dy = y - oy; return [dx * PUL_D[0] + dy * PUL_D[1], dx * PUL_N[0] + dy * PUL_N[1]]; };
  const RB = 0.1285, E = SHEAVE_E, [S0, S3] = [SPC[0], SPC[3]];
  const outSN = [
    ...arc(0, 0, RB, 270, 190, 12), // bout bas, autour de l'axe du réa bas
    ...arc(S0[0], S0[1], 0.016, 190, 90, 8), // bossage de l'entretoise basse
    ...arc(0, 0, 0.04, 160, 0, 12), // bossage de l'axe bas (bord avant)
    [0.12, 0], // fond de l'encoche en V
    ...FOOT_U.map((u) => sn(pp(u, 0.0245))), // lobe : coins du pied soudé sur la plaque mobile
    [0.42, 0], // retour du lobe sur la ligne des centres
    ...arc(E, 0, 0.04, 180, 20, 12), // bossage de l'axe haut
    ...arc(S3[0], S3[1], 0.016, 90, -10, 8), // bossage de l'entretoise haute
    ...arc(E, 0, RB, -10, -90, 12), // bout haut, puis bord arrière droit jusqu'au bout bas
  ];
  const out = outSN.map(([s, n]) => f(s, n));
  const holes = [...axes.map((c) => [...c, 0.023]), ...SPC.map((c) => [...f(...c), 0.0066])];
  const rot = [0, 0, Math.atan2(PV_U[1], PV_U[0])];
  for (const s of [-1, 1]) {
    P('UM-064-124C', group(
      at(extrude(out, 0.012, 'red', { holes }), [0, 0, s * 0.036]),
      ...axes.map((c) => at(ring(0.04, 0.023, 0.008, 'red', { axis: 'z', seg: 28 }), [...c, s * 0.046])),
      at(plate(FOOT_U[1] - FOOT_U[0], 0.1, 0.016, 'red', { r: 0.003, holes: [[-0.05, 0, 0.0105], [0.05, 0, 0.0105]] }), [...L(pp((FOOT_U[0] + FOOT_U[1]) / 2, 0.0165)), s * 0.05], rot),
    ), [0, 0, s * 0.2]);
  }
  const prof = [[0.0426, -0.019], [0.056, -0.019], [0.058, -0.012], [0.068, -0.012], [0.07, -0.019], [0.097, -0.019], [0.1, -0.016], [0.1, -0.011], [0.0825, -0.003],
    [0.0825, 0.003], [0.1, 0.011], [0.1, 0.016], [0.097, 0.019], [0.07, 0.019], [0.068, 0.012], [0.058, 0.012], [0.056, 0.019], [0.0426, 0.019], [0.0426, -0.019]]; // alésage fermé
  axes.forEach((c, k) => {
    const e = k ? [-0.12, 0.1, 0] : [0.12, -0.1, 0];
    P('UM-064-119C', at(lathe(prof, 'red', { axis: 'z', seg: 56 }), [...c, 0]), e);
    for (const z of [-0.0095, 0.0095]) P('UM-064-118C', at(ring(0.0425, 0.0225, 0.019, 'steel', { axis: 'z', seg: 32 }), [...c, z]), [e[0], e[1], Math.sign(z) * 0.12]);
    P('UM-064-127C', group(at(cyl(0.0224, 0.1, 'steel', { axis: 'z', seg: 24 }), [...c, 0]), at(cyl(0.032, 0.008, 'steel', { axis: 'z', seg: 28 }), [...c, 0.054])), [0, 0, 0.3]);
    P('UM-064-128C', at(washer(0.0375, 0.0105, 0.006, 'grey', { axis: 'z' }), [...c, -0.053]), [0, 0, -0.25]);
    P('B750-2250', at(bolt(0.019, 0, 'steel', { axis: '-z' }), [...c, -0.056]), [0, 0, -0.35]);
  });
  for (const c of SPC) {
    const p = f(...c);
    P('UM-064-131C', at(ring(0.0115, 0.0066, 0.06, 'red', { axis: 'z', seg: 18 }), [...p, 0]), [0, 0, 0.1]);
    P('B500-4000', at(bolt(0.0127, 0.1016, 'steel', { axis: 'z' }), [...p, 0.0425]), [0, 0, 0.3]);
    P('LC500', at(washer(0.012, 0.0066, 0.003, 'steel', { axis: 'z' }), [...p, -0.0435]), [0, 0, -0.2]);
    P('NC500', at(nut(0.022, 0.011, 'steel', { axis: 'z' }), [...p, -0.0505]), [0, 0, -0.28]);
  }
  return { view: { dir: [-0.5, 0.3, 1.0] } };
}

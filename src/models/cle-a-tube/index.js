// Clé à tube « pleine prise » (full grip tube wrench), grosseur N, pour le tube
// intérieur d'un carottier N (Ø 55,6 mm) : manche forgé à coche, mâchoire de
// liaison en fourche et mâchoire crochet à ergot, articulés sur un axe et un
// boulon ; dents de carbure dans les faces de prise.
//
// Sources : une photo du client (deux clés pendues à un mur, vues presque par
// la tranche, manches coupés par le bas de la photo) et la photo du même type
// de clé publiée par TIME Limited (« Tube wrenches », vue à plat, mâchoire
// crochet ouverte), que le client a reconnue. Aucun plan, aucune cote publiée,
// aucune marque lisible. La seule cote sûre est celle du tube : Ø 55,6 mm
// (2 3/16 po) pour le tube intérieur N.
//
// - Photo du client : épaisseurs (crochet, joues, manche), fourche de la
//   mâchoire de liaison à cheval sur la tête du manche et sur l'œil du crochet,
//   boulon à tête hexagonale, rondelle et écrou à l'articulation des mâchoires,
//   axe à tête ronde du manche, creux du manche, plaquette de carbure dans sa
//   cuvette au bas de l'anneau.
// - Photo de référence, redressée et mise à l'échelle du tube : place des deux
//   articulations, étendue et épaisseur des arcs, ergot au bout du crochet,
//   tête du manche à bossages, manche à âme creusée et trou d'accrochage.
// - Indications du client : la coche qui permet de serrer, les dents de
//   carbure à l'intérieur des mâchoires.
// - Supposé et signalé : longueur du manche (hors de la photo du client), dos
//   de la clé, bout riveté de l'axe, forme exacte de la coche (aucune photo ne
//   la montre de face), nombre et place des dents de carbure.
//
// Mécanisme (indication du client, mise en forme par le tracé) : les deux
// mâchoires enveloppent le tube sur environ 280° ; le bout de la mâchoire
// crochet porte un ergot sur son dos. Le manche tourne sur son axe entre les
// joues de la mâchoire de liaison ; quand on appuie, la coche de sa tête vient
// coiffer l'ergot et le presse sur le tube, à 33 mm de l'axe pour un manche de
// 450 mm : les mâchoires serrent le tube sur tout son tour et les dents de
// carbure mordent. Dans l'autre sens, la coche quitte l'ergot, les mâchoires
// prennent du jeu et la clé reprend sa course sans quitter le tube. Pour
// tourner dans l'autre sens, on retourne la clé.
//
// Repère de l'outil, en millimètres, clé en prise sur son tube : origine au
// centre du tube, x le long du manche (le manche part vers −x), y dans le plan
// de la clé (l'arc de la mâchoire de liaison du côté +y), z le long du tube.
// Modèle en mètres.
import * as THREE from 'three';
import { mat, withFinish } from '../../viewer/materials.js';
import { creaseNormals } from '../../viewer/shapes.js';

const MM = 0.001;
const RAD = Math.PI / 180;
export const IN = 25.4;

// ------------------------------------------------------------------ cotes (mm)

/** Tube intérieur N : Ø extérieur de 2 3/16 po (donnée publiée), Ø intérieur de 50 mm. */
export const TUBE = { d: 55.6, di: 50 };
/** Rayon de prise des mâchoires : celui du tube. */
export const R = TUBE.d / 2;
/**
 * Épaisseurs le long du tube (photo du client, à l'échelle du tube) : mâchoire
 * crochet, chaque joue de la mâchoire de liaison, jour de la fourche, manche.
 */
export const EP = { crochet: 22, joue: 8, fourche: 23, manche: 19, ame: 8 };
/** Largeur hors tout de la mâchoire de liaison (deux joues et la fourche). */
export const LARGEUR = EP.fourche + 2 * EP.joue;
/** Axe du manche (A) et boulon des mâchoires (B) : place (photo de référence), diamètre de 1/2 po (boulon de la photo du client), rayon des œils. */
export const AXE_A = { x: -57.5, y: -13.5, d: 12.7, oeil: 13 };
export const AXE_B = { x: 48.5, y: 15.8, d: 12.7, oeil: 13 };
const A = [AXE_A.x, AXE_A.y];
const B = [AXE_B.x, AXE_B.y];
const JEU_AXE = 0.3;
/**
 * Mâchoire de liaison : arc de prise du sabot central (degrés autour du tube),
 * épaisseur radiale ; les joues sont en retrait de `retrait` côté tube et
 * dépassent le sabot de `creux` au dos ; leur arc va jusqu'à `joue`.
 */
export const LIAISON = { de: 158, a: 34, ep: 16, retrait: 1, creux: 1.2, joue: 40 };
/** Mâchoire crochet : arc de prise, épaisseur radiale, ergot du bout (largeur le long de l'arc, hauteur). */
export const CROCHET = { de: 16, a: -141, ep: 19, ergot: { large: 13, haut: 8 } };
/**
 * Manche : longueur de l'axe au bout (supposée : proportions de la photo de
 * référence), largeur à la tête et au bout, décalage de sa ligne médiane sous
 * l'axe, bossage de l'axe, creux des deux faces, trou d'accrochage oblong.
 */
export const MANCHE = {
  long: 450, large: 35, bout: 31, decale: 9, bossage: 13.5,
  creux: { debut: 46, fin: 52, bord: 4.5 },
  trou: { long: 28, large: 10, duBout: 30 },
};
/**
 * Tête du manche : son nez longe le tube sans le toucher (à `nez` mm, de
 * `haut` à `bas` degrés autour du tube), puis s'en écarte pour laisser passer
 * le bout du crochet quand le manche se relève ; sa
 * coche coiffe l'ergot de la mâchoire crochet, avec `garde` degrés de jeu du
 * côté du nez et `apres` du côté de la dent ; `fond` : matière sous la coche
 * (mm) ; la dent qui ferme la coche passe à `jeu` mm du dos du crochet.
 * Forme supposée : aucune photo ne montre la coche de face.
 */
export const COCHE = { nez: 2.5, haut: -178, bas: -162, garde: 2.5, apres: 4, fond: 7, dent: { long: 9.5, jeu: 2.5 } };
/**
 * Dents de carbure des faces de prise : plaquettes brasées dans une cuvette
 * (photo du client : une plaquette claire dans une cuvette sombre, au bas de
 * l'anneau). Place autour du tube (degrés), taille et saillie supposées.
 */
export const CARBURE = { liaison: [136, 96, 56], crochet: [-8, -52, -96, -130], large: 10, long: 4.5, saillie: 0.9, cuvette: 1.4 };
/** Visserie de l'articulation des mâchoires (photo du client) : boulon de 1/2 po, rondelle sous la tête, écrou. */
export const BOULON = { d: 12.7, long: 57.15, plats: 19.05, ecrou: 11.1, rondelle: { d: 27, ep: 2.5 } };
/** Axe du manche : tête ronde (photo du client), bout riveté (supposé). */
export const AXE = { tete: { d: 22, haut: 6.5 }, rivet: { d: 17, haut: 2.5 } };

/** Ouverture de la mâchoire crochet (degrés), telle que sur la photo de référence : assez pour coiffer le tube. */
export const OUVERT = 100;
/** Relevé du manche (degrés) : pendant le retour de la clé, et en grand pour ouvrir la mâchoire crochet. */
export const RELACHE = 18;
export const LEVE = 24;
/** Jeu de la mâchoire crochet pendant le retour (degrés). */
export const JEU_RETOUR = 3;
/** Course de travail montrée dans l'animation (degrés). */
export const COURSE = 35;
/** Place du trait de repère du tube au départ (degrés, repère de l'outil) : il reste en vue pendant les deux courses. */
const REPERE = -150;
/** Direction (degrés, repère de l'outil) d'où la clé vient coiffer le tube, mâchoire ouverte. */
export const APPROCHE = 105;

// ------------------------------------------------------------------ outils de tracé

const pol = (r, deg, c = [0, 0]) => [c[0] + r * Math.cos(deg * RAD), c[1] + r * Math.sin(deg * RAD)];
/** Arc de centre c et de rayon r, de a0 à a1 (degrés), un point tous les 3° environ. */
function arc(c, r, a0, a1, n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 3))) {
  return Array.from({ length: n + 1 }, (_, i) => pol(r, a0 + ((a1 - a0) * i) / n, c));
}
/** Arc parcouru dans le sens trigonométrique de a0 jusqu'à a1 (ramené au premier angle suivant a0). */
const arcTrigo = (c, r, a0, a1) => arc(c, r, a0, a1 + 360 * Math.ceil((a0 - a1) / 360));
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const angle = (de, vers) => Math.atan2(vers[1] - de[1], vers[0] - de[0]) / RAD;
/** Tourne le point p de `deg` degrés autour de c (sens trigonométrique). */
export function tourner(p, c, deg) {
  const co = Math.cos(deg * RAD), si = Math.sin(deg * RAD), x = p[0] - c[0], y = p[1] - c[1];
  return [c[0] + x * co - y * si, c[1] + x * si + y * co];
}
/** Angle (autour de c) du point de tangence de la droite menée de p au cercle (c, r) ; cote = 1 : tangence à gauche de c→p. */
const tangence = (p, c, r, cote) => angle(c, p) + cote * Math.acos(r / dist(p, c)) / RAD;
/** Demi-angle (vu du tube) sous lequel le cercle d'un œil (centre c, rayon r) coupe le cercle de rayon ro autour du tube. */
const coupe = (c, r, ro) => { const d = Math.hypot(c[0], c[1]); return Math.acos((d * d + ro * ro - r * r) / (2 * d * ro)) / RAD; };
const DIR_A = angle([0, 0], A);
const DIR_B = angle([0, 0], B);

// ------------------------------------------------------------------ ergot et coche

const OA = Math.hypot(A[0], A[1]);
/** Dos de la mâchoire crochet, dessus de son ergot (= fond de la coche du manche), étendue de l'ergot autour du tube (degrés). */
const R_DOS = R + CROCHET.ep;
export const R_ERGOT = R_DOS + CROCHET.ergot.haut;
export const PAS_ERGOT = (CROCHET.ergot.large / (R_DOS + CROCHET.ergot.haut / 2)) / RAD;
/** Milieu du dessus de l'ergot, mâchoire fermée : là où le fond de la coche appuie. */
export const APPUI = pol(R_ERGOT, CROCHET.a + PAS_ERGOT / 2);

// ------------------------------------------------------------------ contours (mm, clé en prise)

/** Mâchoire crochet fermée : arc de prise, bout à ergot, dos, œil du boulon et flanc jusqu'au début de l'arc. */
export function contourCrochet() {
  const k = CROCHET, ro = R_DOS, d = coupe(B, AXE_B.oeil, ro);
  const debut = pol(R, k.de);
  const t = tangence(debut, B, AXE_B.oeil, -1);
  return [
    ...arc([0, 0], R, k.de, k.a + 3), // arc de prise, du boulon vers le bout
    pol(R + 0.6, k.a + 1), pol(R + 2.2, k.a), // bout cassé
    pol(R_ERGOT - 1.2, k.a), // face du bout, puis ergot au ras du bout, sur le dos
    ...arc([0, 0], R_ERGOT, k.a + 1.2, k.a + PAS_ERGOT - 1.2, 5),
    pol(R_ERGOT - 1.2, k.a + PAS_ERGOT),
    pol(ro + 1.5, k.a + PAS_ERGOT), pol(ro, k.a + PAS_ERGOT + 2),
    ...arc([0, 0], ro, k.a + PAS_ERGOT + 4, DIR_B - d), // dos
    ...arcTrigo(B, AXE_B.oeil, angle(B, pol(ro, DIR_B - d)) + 4, t), // œil, puis flanc jusqu'au début de l'arc
  ];
}

/** Joue de la mâchoire de liaison : arc en retrait du tube, bras vers l'axe du manche, oreille du boulon. */
export function contourJoue() {
  const k = LIAISON, ri = R + k.retrait, ro = R + k.ep;
  const d = coupe(B, AXE_B.oeil, ro);
  // Tangente commune au dos et à l'œil de l'axe A, du côté du dos.
  const ta = DIR_A - Math.acos((ro - AXE_A.oeil) / OA) / RAD;
  const debut = pol(ri, k.de), fin = pol(ri, k.joue);
  const tb = tangence(debut, A, AXE_A.oeil, -1);
  const tc = tangence(fin, B, AXE_B.oeil, 1);
  return [
    ...arcTrigo([0, 0], ro, DIR_B + d, ta), // dos
    ...arcTrigo(A, AXE_A.oeil, ta, tb), // œil de l'axe du manche
    ...arc([0, 0], ri, k.de, k.joue), // côté tube
    ...arcTrigo(B, AXE_B.oeil, tc, angle(B, pol(ro, DIR_B + d)) - 4), // oreille du boulon
  ];
}

/** Sabot central de la mâchoire de liaison : secteur qui porte sur le tube, entre les deux joues. */
export function contourSabot() {
  const k = LIAISON, ro = R + k.ep - k.creux;
  return [...arc([0, 0], ro, k.a, k.de), ...arc([0, 0], R, k.de, k.a)];
}

/** Ligne médiane et demi-largeur du manche à l'abscisse x. */
const Y_MANCHE = AXE_A.y - MANCHE.decale;
export const BOUT = AXE_A.x - MANCHE.long;
const demi = (x) => {
  const t = Math.max(0, Math.min(1, (AXE_A.x - 52 - x) / (AXE_A.x - 52 - BOUT)));
  return (MANCHE.large + (MANCHE.bout - MANCHE.large) * t) / 2;
};

/**
 * Manche en prise : corps, bossage de l'axe, nez qui longe le tube, coche qui
 * coiffe l'ergot du crochet et dent qui la ferme, talon sous la coche, bout arrondi.
 */
export function contourManche() {
  const rb = MANCHE.bout / 2, h = MANCHE.large / 2;
  const haut = Y_MANCHE + h, bas = Y_MANCHE - h;
  const k = COCHE, rn = R + k.nez, rf = R_ERGOT, rd = R_DOS + k.dent.jeu, rx = rf + k.fond;
  const a0 = CROCHET.a - k.garde; // flanc de la coche du côté du nez
  const a1 = CROCHET.a + PAS_ERGOT + k.apres; // flanc du côté de la dent
  const a2 = a1 + k.dent.long; // bout de la dent
  // Le dessous du talon rejoint le chant du manche là où il le croise.
  const at = -180 + Math.asin((bas - 5.2) / -rx) / RAD;
  const coin = pol(27, 33, A); // coin du haut du nez
  const b0 = Math.asin((haut - AXE_A.y) / MANCHE.bossage) / RAD;
  return [
    ...arc([BOUT + rb, Y_MANCHE], rb, 90, 270, 16), // bout arrondi
    [AXE_A.x - 52, bas], [-84, bas], [-68, bas - 1.4], [pol(rx, at)[0] - 9, bas - 4.4],
    ...arc([0, 0], rx, at, a2 - 2.5), // dessous du talon
    pol(rx - 2.2, a2), pol(rd + 2.2, a2), // bout de la dent
    ...arc([0, 0], rd, a2 - 2.5, a1 + 2, 3), // dessus de la dent
    pol(rd + 1.5, a1), pol(rf - 1.2, a1), // flanc de la coche, côté dent
    ...arc([0, 0], rf, a1 - 1.2, a0 + 1.2, 8), // fond de la coche : il appuie sur l'ergot
    pol(rf - 1.2, a0), // flanc de la coche, côté nez : il s'écarte du bout du crochet en remontant vers le nez
    ...arc([0, 0], rn, k.bas, k.haut, 5), // nez : il longe le tube sans le toucher
    pol(rn + 2.2, k.haut - 6),
    coin, [(coin[0] + AXE_A.x) / 2 - 2, AXE_A.y + MANCHE.bossage + 0.6],
    ...arc(A, MANCHE.bossage, 90, 180 - b0, 6), // bossage de l'axe
    [AXE_A.x - 52, haut],
  ];
}

/** Creux d'une face du manche (âme mise à nu), du côté de la tête vers le bout ; agrandi de `plus` mm. */
export function contourCreux(plus = 0) {
  const c = MANCHE.creux, x0 = AXE_A.x - c.debut, x1 = BOUT + c.fin;
  const b = c.bord - plus;
  return [
    [x1 - plus, Y_MANCHE - demi(x1) + b], [x0 - 9 + plus, Y_MANCHE - demi(x0) + b],
    [x0 + plus, Y_MANCHE + demi(x0) - b], [x1 - plus, Y_MANCHE + demi(x1) - b],
  ];
}

/** Trou d'accrochage oblong, au bout du manche. */
export function contourTrou() {
  const t = MANCHE.trou, r = t.large / 2, x = BOUT + t.duBout, l = t.long / 2 - r;
  return [...arc([x + l, Y_MANCHE], r, -90, 90, 8), ...arc([x - l, Y_MANCHE], r, 90, 270, 8)];
}

// ------------------------------------------------------------------ cinématique

/** Point du manche (donné en prise), manche relevé de psi degrés : le nez s'écarte du tube. */
export const pointManche = (p, psi) => tourner(p, A, -psi);
/** Point de la mâchoire crochet (donné fermée), ouverte de phi degrés autour du boulon. */
export const pointCrochet = (p, phi) => tourner(p, B, phi);

/** Jeu entre le nez du manche et le tube (mm), manche relevé de psi degrés ; négatif : le nez entre dans le tube. */
export function jeuNez(psi = 0) {
  return Math.min(...contourManche().filter((p) => p[0] > AXE_A.x).map((p) => Math.hypot(...pointManche(p, psi)) - R));
}
/** Jeu entre la mâchoire crochet et le tube (mm), ouverte de phi degrés. */
export function jeuCrochet(phi = 0) {
  return Math.min(...contourCrochet().map((p) => Math.hypot(...pointCrochet(p, phi)) - R));
}
/**
 * Passage laissé au tube (mm) quand la clé le quitte dans la direction
 * APPROCHE, mâchoire crochet ouverte de phi et manche relevé de psi : plus
 * petite distance entre les pièces et le cylindre balayé par le tube.
 * Négatif : la clé accroche le tube.
 */
export function passage(phi = OUVERT, psi = LEVE) {
  // Vu de la clé, le tube s'en va dans la direction opposée à l'approche.
  const u = pol(1, APPROCHE + 180);
  const libre = (p) => {
    const le = p[0] * u[0] + p[1] * u[1], tr = Math.abs(p[0] * u[1] - p[1] * u[0]);
    return le <= 0 ? Math.hypot(p[0], p[1]) - R : tr - R;
  };
  const pts = [
    ...contourCrochet().map((p) => pointCrochet(p, phi)),
    ...contourManche().filter((p) => p[0] > AXE_A.x).map((p) => pointManche(p, psi)),
    ...contourJoue(),
  ];
  return Math.min(...pts.map(libre));
}

/** Vrai si le point p est dans le polygone (hors d'une marge de `marge` mm le long de son bord). */
function dedans(p, poly, marge = 0.05) {
  let in_ = false, pres = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) in_ = !in_;
    const dx = xj - xi, dy = yj - yi, l = dx * dx + dy * dy || 1;
    const u = Math.max(0, Math.min(1, ((p[0] - xi) * dx + (p[1] - yi) * dy) / l));
    pres = Math.min(pres, Math.hypot(p[0] - xi - u * dx, p[1] - yi - u * dy));
  }
  return in_ && pres > marge;
}
/**
 * Vrai si le manche (relevé de psi degrés) et la mâchoire crochet (ouverte de
 * phi degrés) se pénètrent ; un simple contact (ergot au fond de la coche) ne compte pas.
 */
export function heurt(phi = 0, psi = 0) {
  const m = contourManche().filter((p) => p[0] > AXE_A.x - 30).map((p) => pointManche(p, psi));
  const c = contourCrochet().map((p) => pointCrochet(p, phi));
  // Points intermédiaires : un coin peut entrer entre deux sommets de l'autre contour.
  const dense = (l) => l.flatMap((p, i) => { const q = l[(i + 1) % l.length]; return [p, [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]]; });
  return dense(c).some((p) => dedans(p, m)) || dense(m).some((p) => dedans(p, c));
}
/**
 * Jeu entre le fond de la coche et le dessus de l'ergot (mm), manche relevé de
 * psi degrés et mâchoire fermée : 0 en prise, positif quand la coche a quitté l'ergot.
 */
export function jeuCoche(psi = 0) {
  const fond = arc([0, 0], R_ERGOT, CROCHET.a, CROCHET.a + PAS_ERGOT, 12).map((p) => pointManche(p, psi));
  return Math.min(...fond.map((p) => Math.hypot(p[0], p[1]) - R_ERGOT));
}
/** Bras de levier : distance de l'axe du manche à l'appui de la coche sur l'ergot (mm), et rapport avec la longueur du manche. */
export const BRAS = dist(A, APPUI);
export const LEVIER = (MANCHE.long - MANCHE.trou.duBout) / BRAS;
/**
 * Direction dans laquelle le fond de la coche pousse l'ergot quand on appuie
 * sur le manche, mesurée depuis la droite ergot–centre du tube (degrés) :
 * proche de 0, la coche presse l'ergot droit sur le tube.
 */
export const POUSSEE = (() => {
  const v = angle(APPUI, pointManche(APPUI, -1)), r = angle(APPUI, [0, 0]);
  let a = Math.abs(v - r) % 360;
  if (a > 180) a = 360 - a;
  return a;
})();
/** Moment de cette poussée autour du boulon B, par unité d'effort (mm) : négatif, elle referme la mâchoire crochet. */
export const MOMENT_COCHE = (() => {
  const n = pol(1, angle(APPUI, pointManche(APPUI, -1)));
  return (APPUI[0] - B[0]) * n[1] - (APPUI[1] - B[1]) * n[0];
})();
/** Enveloppement du tube par les deux mâchoires (degrés). */
export const ENVELOPPE = (LIAISON.de - LIAISON.a) + (CROCHET.de - CROCHET.a);
/** Longueur hors tout de la clé fermée sur son tube (mm). */
export const HORS_TOUT = Math.max(...contourCrochet().map((p) => p[0]), ...contourJoue().map((p) => p[0])) - BOUT;

// ------------------------------------------------------------------ matériaux

const perso = new Map();
function teinte(nom, creer) {
  let m = perso.get(nom);
  if (!m) {
    m = creer();
    m.polygonOffset = true;
    m.polygonOffsetFactor = 1;
    m.polygonOffsetUnits = 1;
    m.name = nom;
    perso.set(nom, m);
  }
  return m;
}
/** Acier forgé nu, patiné et gras (photo du client : aucune peinture, sauf une trace de bleu). */
const forge = () => teinte('cle-tube-forge', () => withFinish(new THREE.MeshStandardMaterial({ color: 0x6f6a62, metalness: 0.82, roughness: 0.5 }), 'cast', { fine: 0.07, env: 1.9 }));
/** Faces de prise et dents, polies par le tube. */
const poli = () => teinte('cle-tube-poli', () => withFinish(new THREE.MeshStandardMaterial({ color: 0xa9a59c, metalness: 0.95, roughness: 0.36, side: THREE.DoubleSide }), 'machined'));
/** Plaquette de carbure, claire et brillante, et fond sombre de sa cuvette (brasure). */
const carbure = () => teinte('cle-tube-carbure', () => withFinish(new THREE.MeshStandardMaterial({ color: 0xc3c6ca, metalness: 1, roughness: 0.22 }), 'machined'));
const brasure = () => teinte('cle-tube-brasure', () => new THREE.MeshStandardMaterial({ color: 0x2a2623, metalness: 0.4, roughness: 0.7 }));
/** Tube intérieur : acier étiré, gris clair. */
const acierTube = () => teinte('cle-tube-tube', () => withFinish(new THREE.MeshStandardMaterial({ color: 0x8e9499, metalness: 0.9, roughness: 0.4 }), 'machined'));
/** Paroi intérieure du tube, vue par les bouts. */
const dedansTube = () => teinte('cle-tube-tube-dedans', () => new THREE.MeshStandardMaterial({ color: 0x5d6266, metalness: 0.8, roughness: 0.55, side: THREE.BackSide }));
/** Trait de repère tracé sur le tube, pour le voir tourner. */
const trait = () => teinte('cle-tube-trait', () => new THREE.MeshStandardMaterial({ color: 0xf2c200, emissive: 0x4a3a00, emissiveIntensity: 0.6, roughness: 0.6 }));

// ------------------------------------------------------------------ pièces (repère de l'outil, clé en prise)

/**
 * Plaque découpée : contour [x, y] (mm) entre z0 et z1, arêtes cassées de
 * `casse` mm ; trous ronds [x, y, r] ou découpes en polygone.
 */
function plaque(contour, z0, z1, matiere, { trous = [], casse = 1.2 } = {}) {
  const v = ([x, y]) => new THREE.Vector2(x * MM, y * MM);
  const shape = new THREE.Shape(contour.map(v));
  for (const t of trous) {
    const p = new THREE.Path();
    if (Array.isArray(t[0])) p.setFromPoints(t.map(v));
    else p.absarc(t[0] * MM, t[1] * MM, t[2] * MM, 0, 2 * Math.PI, true);
    shape.holes.push(p);
  }
  const ep = (z1 - z0) * MM, b = Math.min(ep * 0.16, casse * MM);
  const geo = b > 0
    ? new THREE.ExtrudeGeometry(shape, { depth: ep - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelOffset: -b, bevelSegments: 2, curveSegments: 24 })
    : new THREE.ExtrudeGeometry(shape, { depth: ep, bevelEnabled: false, curveSegments: 24 });
  geo.translate(0, 0, z0 * MM + b);
  return new THREE.Mesh(creaseNormals(geo), matiere);
}

/** Bande cylindrique posée sur une face de prise (rayon r, de a0 à a1, largeur le long du tube) : acier poli par le tube. */
function prise(r, a0, a1, large) {
  const n = Math.max(4, Math.ceil(Math.abs(a1 - a0) / 3)), h = large / 2;
  const pos = [], nor = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const a = (a0 + ((a1 - a0) * i) / n) * RAD, c = Math.cos(a), s = Math.sin(a);
    for (const z of [-h, h]) { pos.push(r * c * MM, r * s * MM, z * MM); nor.push(-c, -s, 0); }
  }
  const sens = a1 > a0;
  for (let i = 0; i < n; i++) {
    const a = 2 * i, b = a + 1, c = a + 2, d = a + 3;
    if (sens) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setIndex(idx);
  geo.userData.edgeAngle = 180;
  const m = new THREE.Mesh(geo, poli());
  m.userData.noEdges = true;
  return m;
}

/** Repère 1 : manche forgé à coche — cadre percé de l'axe, du trou d'accrochage et du creux, âme au fond du creux. */
function manche() {
  const h = EP.manche / 2;
  const g = new THREE.Group();
  g.add(plaque(contourManche(), -h, h, forge(), { trous: [[...A, AXE_A.d / 2 + JEU_AXE], contourTrou(), contourCreux()], casse: 1.6 }));
  // Âme : ses chants sont noyés dans le cadre, seules ses deux faces se voient au fond des creux.
  const ame = plaque(contourCreux(0.5), -EP.ame / 2, EP.ame / 2, forge(), { casse: 0 });
  ame.userData.noEdges = true;
  g.add(ame);
  return g;
}

/** Repère 2 : mâchoire de liaison — deux joues, de l'axe du manche au boulon, et le sabot central qui porte sur le tube. */
function liaison() {
  const g = new THREE.Group();
  const f = EP.fourche / 2, trous = [[...A, AXE_A.d / 2 + JEU_AXE], [...B, AXE_B.d / 2 + JEU_AXE]];
  for (const s of [1, -1]) {
    const z = [s * f, s * (f + EP.joue)].sort((a, b) => a - b);
    g.add(plaque(contourJoue(), z[0], z[1], forge(), { trous }));
  }
  // Sabot : à peine plus large que la fourche, ses flancs sont noyés dans les joues.
  g.add(plaque(contourSabot(), -f - 0.3, f + 0.3, forge(), { casse: 0 }));
  g.add(prise(R - 0.3, LIAISON.de - 1.5, LIAISON.a + 1.5, EP.fourche - 2));
  return g;
}

/** Repère 3 : mâchoire crochet, d'une pièce, percée pour le boulon ; ergot au bout. */
function crochet() {
  const g = new THREE.Group();
  const h = EP.crochet / 2;
  g.add(plaque(contourCrochet(), -h, h, forge(), { trous: [[...B, AXE_B.d / 2 + JEU_AXE]], casse: 1.5 }));
  g.add(prise(R - 0.3, CROCHET.de - 1.5, CROCHET.a + 6.5, EP.crochet - 4));
  return g;
}

/**
 * Repère 8 : dent de carbure à l'angle `deg` d'une face de prise — plaquette à
 * section en trapèze, couchée le long du tube, qui dépasse de la face ; autour
 * d'elle, le fond sombre de sa cuvette.
 */
function dentCarbure(deg) {
  const k = CARBURE, g = new THREE.Group();
  // Repère local : u le long de l'arc, v vers l'extérieur (0 à la face de prise), épaisseur le long du tube.
  const dent = plaque([[-k.long / 2, 0.8], [k.long / 2, 0.8], [k.long / 4, -k.saillie], [-k.long / 4, -k.saillie]], -k.large / 2, k.large / 2, carbure(), { casse: 0.25 });
  const u = k.long / 2 + k.cuvette, h = k.large / 2 + k.cuvette;
  const cuvette = plaque([[-u, 0.5], [u, 0.5], [u, -0.42], [-u, -0.42]], -h, h, brasure(), { casse: 0 });
  cuvette.userData.noEdges = true;
  g.add(cuvette, dent);
  const p = pol(R, deg);
  g.position.set(p[0] * MM, p[1] * MM, 0);
  g.rotation.z = (deg - 90) * RAD;
  return g;
}

/** Repère 4 : axe du manche — tête ronde d'un côté (photo du client), bout riveté de l'autre (supposé). */
function axe(S) {
  const h = LARGEUR / 2, r = AXE_A.d / 2, t = AXE.tete, v = AXE.rivet;
  const profil = [
    [0, -h - v.haut], [v.d / 2 - 1.2, -h - v.haut], [v.d / 2, -h - v.haut + 1.2], [v.d / 2, -h], [r, -h],
    [r, h], [t.d / 2, h], [t.d / 2, h + 1.5], [t.d / 2 - 1.6, h + t.haut - 2], [t.d / 2 - 5.5, h + t.haut], [0, h + t.haut],
  ].map(([x, y]) => [x * MM, y * MM]);
  return S.lathe(profil, 'darkSteel', { axis: 'z', seg: 28, pos: [A[0] * MM, A[1] * MM, 0] });
}

/** Repères 5, 6 et 7 : boulon à tête hexagonale, rondelle sous la tête, écrou (tête du côté +z). */
function boulon(S) {
  const h = LARGEUR / 2, k = BOULON;
  return S.bolt(k.d * MM, k.long * MM, 'zinc', { axis: 'z', pos: [B[0] * MM, B[1] * MM, (h + k.rondelle.ep) * MM] });
}
function rondelle(S) {
  const h = LARGEUR / 2, k = BOULON.rondelle;
  return S.washer((k.d / 2) * MM, (BOULON.d / 2 + 0.6) * MM, k.ep * MM, 'zinc', { axis: 'z', pos: [B[0] * MM, B[1] * MM, (h + k.ep / 2) * MM] });
}
function ecrou(S) {
  const h = LARGEUR / 2, k = BOULON;
  return S.nut(k.plats * MM, k.ecrou * MM, 'zinc', { axis: 'z', pos: [B[0] * MM, B[1] * MM, -(h + k.ecrou / 2) * MM] });
}

/** Tronçon de tube intérieur N debout (axe z de l'outil), avec un trait de repère pour le voir tourner. */
function tube(S, long) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(R * MM, R * MM, long * MM, 64, 1, true), acierTube());
  const dedans = new THREE.Mesh(new THREE.CylinderGeometry((TUBE.di / 2) * MM, (TUBE.di / 2) * MM, long * MM, 48, 1, true), dedansTube());
  const bout = (y) => {
    const a = new THREE.Mesh(new THREE.RingGeometry((TUBE.di / 2) * MM, R * MM, 64), acierTube());
    a.rotation.x = y > 0 ? -Math.PI / 2 : Math.PI / 2;
    a.position.y = y;
    return a;
  };
  const corps = new THREE.Group();
  corps.add(m, dedans, bout((long / 2) * MM), bout(-(long / 2) * MM));
  corps.rotation.x = Math.PI / 2; // axe du cylindre (y) couché le long de z
  g.add(corps);
  // Trait de repère : le long du tube et sur la tranche du bout, du côté tourné vers l'observateur.
  const ep = (TUBE.d - TUBE.di) / 2;
  const repere = new THREE.Group();
  for (const [l, pos] of [[[0.8, 5, long - 30], [R + 0.3, 0, 0]], [[ep + 0.6, 5, 0.8], [R - ep / 2, 0, long / 2 + 0.3]]]) {
    const ligne = S.box(l[0] * MM, l[1] * MM, l[2] * MM, trait());
    ligne.position.set(pos[0] * MM, pos[1] * MM, pos[2] * MM);
    ligne.traverse((o) => { o.userData.noEdges = true; });
    repere.add(ligne);
  }
  repere.rotation.z = REPERE * RAD;
  g.add(repere);
  return g;
}

// ------------------------------------------------------------------ assemblage

// Clé à plat : x de l'outil vers +X, y vers −Z, z (le long du tube) vers le haut.
const A_PLAT = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0)));
/** Hauteur du plan médian de la clé couchée : le bout du boulon et son écrou ne touchent pas la table. */
const HAUT = BOULON.long - (LARGEUR / 2 + BOULON.rondelle.ep) + 1;

/**
 * Monte la clé et enregistre ses pièces. `haut` : hauteur du plan médian (mm).
 * Retourne poser({ phi, psi, tour, recul }) : mâchoire crochet ouverte de phi
 * degrés, manche relevé de psi degrés, clé entière tournée de `tour` degrés
 * autour du tube et reculée de `recul` mm dans la direction APPROCHE.
 */
function assemblage(api, haut, eclate = true) {
  const S = api.S;
  const mobiles = [];
  const put = (ref, obj, explode, suit = 'liaison', opts = {}) => {
    const pose = S.group(obj); // mouvement propre de la pièce (manche, crochet)
    const cle = S.group(pose); // mouvement de la clé entière autour du tube
    const g = S.group(cle);
    g.quaternion.copy(A_PLAT);
    g.position.y = haut * MM;
    mobiles.push({ pose, cle, suit });
    api.part(ref, g, eclate ? explode : [0, 0, 0], opts);
    return g;
  };
  const ECL = { crochet: [0.075, 0, 0.03] };
  put('1', manche(), [-0.09, 0, 0.012], 'manche');
  put('2', liaison(), [0, 0, 0]);
  put('3', crochet(), ECL.crochet, 'crochet');
  put('4', axe(S), [0, 0.085, 0]);
  put('5', boulon(S), [0, 0.12, 0]);
  put('6', rondelle(S), [0, 0.075, 0]);
  put('7', ecrou(S), [0, -0.035, 0.07]);
  // Dents de carbure : en vue éclatée, chacune sort de sa cuvette vers le centre de sa mâchoire
  // (celle du crochet est ouverte de OUVERT degrés sur la page des pièces).
  const sortie = (deg, tourne, base) => {
    const d = tourner(pol(-24, deg), [0, 0], tourne);
    return [base[0] + d[0] * MM, base[1], base[2] - d[1] * MM];
  };
  CARBURE.liaison.forEach((a, i) => put('8', dentCarbure(a), sortie(a, 0, [0, 0, 0]), 'liaison', { noLabel: i > 0 }));
  CARBURE.crochet.forEach((a) => put('8', dentCarbure(a), sortie(a, OUVERT, ECL.crochet), 'crochet', { noLabel: true }));

  const autour = (g, c, deg) => {
    const p = tourner([0, 0], c, deg);
    g.rotation.z = deg * RAD;
    g.position.set(p[0] * MM, p[1] * MM, 0);
  };
  return ({ phi = 0, psi = 0, tour = 0, recul = 0 } = {}) => {
    const d = pol(recul, APPROCHE);
    for (const { pose, cle, suit } of mobiles) {
      // La bulle de repère, posée par la visionneuse sur la pièce telle qu'elle était, passe sur le
      // groupe mobile sans changer de place, puis suit le mouvement.
      const bulles = cle.parent.children.filter((c) => c.isCSS2DObject);
      if (bulles.length) {
        cle.parent.updateWorldMatrix(true, true);
        for (const c of bulles) pose.attach(c);
      }
      if (suit === 'manche') autour(pose, A, -psi);
      else if (suit === 'crochet') autour(pose, B, phi);
      cle.rotation.z = tour * RAD;
      cle.position.set(d[0] * MM, d[1] * MM, 0);
    }
  };
}

/** P01 : la clé à plat, mâchoire crochet ouverte comme sur la photo de référence. */
export function P01(api) {
  const poser = assemblage(api, HAUT);
  poser({ phi: OUVERT });
  // Coupe proposée : à mi-épaisseur (plan horizontal de la clé couchée).
  return { view: { dir: [0.25, 1, 0.8], section: { axis: 'y', pos: 0.5 } } };
}

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const smooth = (u) => u * u * (3 - 2 * u);
const part = (k, a, b) => smooth(Math.max(0, Math.min(1, (k - a) / (b - a))));

export const STEPS = [
  { label: 'Départ', title: 'Clé ouverte, à côté du tube', text: `La mâchoire crochet est ouverte en grand (${OUVERT}° autour de son boulon) et le manche relevé de ${LEVE}° : la coche de sa tête est hors du chemin du tube et de l'ergot.` },
  { title: 'Coiffer le tube', text: 'La clé vient de côté sur le tube, jusqu\'à ce que le sabot de la mâchoire de liaison porte sur lui. Mâchoire ouverte et manche relevé, rien n\'accroche le tube.' },
  { title: 'Refermer la mâchoire crochet', text: `La mâchoire crochet tourne sur son boulon et vient épouser le tube : avec la mâchoire de liaison, elle l'enveloppe sur ${fr(ENVELOPPE)}°. C'est la « pleine prise » : l'effort se répartit sur tout le tour, sans écraser le tube mince. L'ergot de son bout se présente devant la coche du manche.` },
  { title: 'Appuyer sur le manche : la coche prend l\'ergot, la clé serre', text: `Le manche pivote sur son axe et la coche de sa tête vient coiffer l'ergot de la mâchoire crochet. Son fond presse l'ergot droit sur le tube, à ${fr(BRAS)} mm de l'axe pour un manche de ${fr(MANCHE.long)} mm : l'effort de la main est multiplié par ${fr(LEVIER)} environ. Les deux mâchoires serrent le tube sur tout son tour, les dents de carbure mordent, et le tube tourne avec la clé (trait jaune).` },
  { title: 'Ramener le manche : la clé glisse', text: `Dans l'autre sens, le manche pivote d'abord sur son axe : la coche quitte l'ergot (${RELACHE}° suffisent), la mâchoire crochet prend du jeu et la clé glisse autour du tube, qui ne bouge pas. Pas besoin d'enlever la clé pour reprendre sa course.` },
  { title: 'Reprendre : deuxième course', text: 'On appuie de nouveau : la coche reprend l\'ergot, les mâchoires se resserrent et le tube avance d\'une autre course. Pour visser au lieu de dévisser, on retourne la clé : elle ne serre que dans un sens.' },
];

/** Hauteur du plan médian de la clé sur le tube debout, et longueur du tronçon de tube (mm). */
const SCENE = { haut: 205, tube: 260 };

/**
 * État du mécanisme pendant l'animation : k[i] est l'avancement (0 à 1) de
 * l'étape i + 1. Retourne { phi, psi, tour, recul, tube } (degrés et mm).
 */
export function etat(k) {
  const [k1, k2, k3, k4, k5] = k;
  const recul = 115 * (1 - smooth(k1));
  // Mâchoire crochet : fermée à l'étape 2 ; un peu de jeu pendant le retour, une fois la coche partie, repris avant qu'elle revienne.
  const phi = OUVERT * (1 - smooth(k2)) + JEU_RETOUR * (part(k4, 0.18, 0.3) - part(k5, 0, 0.12));
  // Manche : relevé en grand, puis appuyé (étape 3), relevé pour le retour (4), appuyé de nouveau (5).
  const psi = LEVE * (1 - part(k3, 0, 0.3)) + RELACHE * (part(k4, 0, 0.2) - part(k5, 0.12, 0.3));
  const tour = COURSE * (part(k3, 0.3, 1) - part(k4, 0.3, 1) + part(k5, 0.3, 1));
  const tube = COURSE * (part(k3, 0.3, 1) + part(k5, 0.3, 1));
  return { phi, psi, tour, recul, tube };
}

/** P02 : la même clé sur un tronçon de tube intérieur N debout, animée en cinq temps. */
export function P02(api) {
  const S = api.S;
  const poser = assemblage(api, SCENE.haut, false);
  const t = tube(S, SCENE.tube);
  const pied = S.group(t);
  pied.quaternion.copy(A_PLAT);
  pied.position.y = (SCENE.tube / 2) * MM;
  api.part('9', pied, [0, 0, 0]);
  const k = [0, 0, 0, 0, 0];
  const maj = () => {
    const e = etat(k);
    poser(e);
    t.rotation.z = e.tube * RAD;
  };
  k.forEach((_, i) => {
    const g = S.group();
    g.userData.stepAnim = { step: i + 1, delay: 300, dur: i === 0 || i === 1 ? 2200 : 3600, update: (v) => { k[i] = v; maj(); } };
    api.add(g);
  });
  maj();
  // Même point de vue à toutes les étapes : de dessus, du côté du manche, assez large pour la course de la clé.
  const cible = [-0.07, SCENE.haut * MM, 0.045], recul = [-0.03, 0.4, 0.2];
  const cam = { pos: cible.map((v, i) => v + recul[i]), tgt: cible };
  return { view: { dir: [-0.1, 1, 0.7], steps: STEPS.map((s) => ({ ...s, cam })), stepsAuto: true } };
}

export default { P01, P02 };

// Pistolet à graisse à levier Lincoln 1142 (« Heavy-Duty Lever-Type Grease
// Gun ») : tête de pompe en fonte, levier embouti, corps (réservoir) bleu-gris,
// tige de poussoir à poignée en T, rallonge rigide de 6 po et coupleur
// hydraulique. Reconstitué d'après la photo du produit fournie par le client
// (P01) et les données publiées par les détaillants : longueur hors tout de
// 21 3/4 po (552 mm), 10 000 psi, cartouche de 14,5 oz ou 16 oz en vrac ;
// rallonge 62028 et coupleur 5852 (guide d'installation Lincoln des modèles
// 1142, 1147 et 1151, non consulté en entier). Aucun plan : les cotes sont
// relevées sur la photo, mise à l'échelle par la longueur hors tout (voir ECHELLE).
//
// Repère, en millimètres : x le long de l'axe du corps, vers la tête (0 au bout
// avant du corps, dans le collet de la tête) ; y vers le levier ; z sur le côté.
// Modèle en mètres.
import * as THREE from 'three';
import { withFinish } from '../../viewer/materials.js';

const MM = 0.001;
const RAD = Math.PI / 180;
export const IN = 25.4;

// ------------------------------------------------------------------ cotes (mm)

/**
 * Échelle de la photo : la longueur hors tout publiée (21 3/4 po, du bout de la
 * poignée en T au bout du coupleur) couvre 694 pixels le long de l'axe ; le
 * corps mesure 70 pixels de diamètre et 373 pixels de long (bouchon compris).
 */
export const ECHELLE = { horsToutPo: 21.75, horsToutPx: 694, corpsPx: 70, corpsLongPx: 373 };
/** mm par pixel le long de l'axe. */
export const mmParPixel = () => (ECHELLE.horsToutPo * IN) / ECHELLE.horsToutPx;

/** Corps (réservoir) : tube d'acier roulé, Ø 2 1/4 po (mesuré : 56 mm), du bouchon au collet de la tête. */
export const CORPS = {
  d: 57,
  tole: 0.8,
  x0: -278,
  x1: 0,
  /** Gorges roulées relevées sur la photo : abscisses (mm). */
  gorges: [-258, -252, -140, -134],
};
/** Bouchon arrière (« container cap ») vissé sur le corps. */
export const BOUCHON = { d: 61, long: 22, fond: 6, trou: 5.6, x0: -296 };
/** Tige du poussoir : Ø 3/8 po ; poignée en T. Pistolet vide (comme vendu) : la poignée est près du bouchon. */
export const TIGE = { d: 9.5, poignee: { long: 60, d: 13, moyeu: 17 }, xT: -326 };
/** Poussoir (« follower ») : coupelle de cuir entre deux rondelles, à l'avant du corps (pistolet vide). */
export const POUSSOIR = { d: 55, long: 14, x: -6 };
/** Ressort du poussoir, du bouchon au poussoir. */
export const RESSORT = { d: 46, fil: 1.6, spires: 16 };

/** Tête de pompe en fonte : collet taraudé sur le corps, corps avant, tour du piston, oreille de la biellette. */
export const TETE = { collet: { d: 68, x0: -22, x1: 6 }, avant: { d: 44, x1: 42 } };
/**
 * Articulations, dans le plan du levier (x, y) : A au bout du levier (biellette),
 * B sur le piston, C sur l'oreille de la tête. A et C relevés sur la photo ;
 * B à 36 mm de A le long du levier.
 */
export const LEVIER = { A: [52, 62], angle: 4, long: 316, large: 23, tole: 2, poignee: { d: 19, de: 190 }, B: [36, -9] };
export const C = [58, 14];
/** Piston de pompe (Ø 3/8 po supposé) : course pour 28 coups à l'once (donnée publiée). */
export const PISTON = { d: 9.5, coupsOnce: 28 };
/** Axes des articulations : Ø 1/4 po (supposé). */
export const AXE = { d: 6.35 };
/** Bouchon six pans de la tête, sous la sortie (relevé sur la photo) : 7/16 po sur plats. */
export const SIXPANS = { af: 11.1, long: 9, y: -26 };
/** Sortie de la tête et rallonge rigide 62028 (tube de 5/16 po), coudée comme sur la photo. */
export const SORTIE = { x: 50, y: -12 };
export const RALLONGE = { d: 7.9, pts: [[50, -12], [57, -12], [140, -10], [186.7, -19.6]], ecrou: 11.1 };
/** Coupleur hydraulique 5852 à quatre mâchoires : six pans de 9/16 po, nez Ø 15. */
export const COUPLEUR = { af: 14.3, long: 34, d: 15 };

// ------------------------------------------------------------------ géométrie dérivée

/** Point du levier (u le long du levier vers la poignée, v vers le dessus) en coordonnées (x, y). */
export function surLevier(u, v, angle = LEVIER.angle * RAD, A = LEVIER.A) {
  const X = -u, Y = v, c = Math.cos(angle), s = Math.sin(angle);
  return [A[0] + X * c + Y * s, A[1] - X * s + Y * c];
}
export const B = () => surLevier(...LEVIER.B);
/** Longueur de la biellette (entraxe A–C). */
export const BIELLETTE = () => Math.hypot(LEVIER.A[0] - C[0], LEVIER.A[1] - C[1]);

/** Direction du dernier tronçon de la rallonge. */
function dirBout() {
  const p = RALLONGE.pts, a = p[p.length - 2], b = p[p.length - 1];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
}
/** Longueur développée de la rallonge (mm). */
export function longRallonge() {
  const p = RALLONGE.pts;
  let L = 0;
  for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
  return L;
}
/** Bout du coupleur (mm). */
export function boutCoupleur() {
  const p = RALLONGE.pts[RALLONGE.pts.length - 1], d = dirBout();
  return [p[0] + d[0] * COUPLEUR.long, p[1] + d[1] * COUPLEUR.long];
}
/** Encombrement (mm) : longueur hors tout (poignée en T au coupleur), hauteur (sous le corps au-dessus du levier). */
export function horsTout() {
  const arriere = TIGE.xT - TIGE.poignee.d / 2;
  const bout = boutCoupleur();
  const fin = surLevier(LEVIER.long, -1);
  return {
    long: bout[0] - arriere,
    haut: Math.max(fin[1] + LEVIER.poignee.d / 2, LEVIER.A[1] + 9) + CORPS.d / 2,
    large: TIGE.poignee.long,
    levier: fin,
  };
}
/** Volume intérieur du corps, du bouchon au collet (cm³). */
export function volumeCorps() {
  const r = CORPS.d / 2 - CORPS.tole;
  return (Math.PI * r * r * (CORPS.x1 - (BOUCHON.x0 + BOUCHON.fond))) / 1000;
}
/** Course du piston pour 28 coups à l'once (graisse de densité 0,9) (mm). */
export function course() {
  const cm3 = 28.35 / PISTON.coupsOnce / 0.9;
  return (cm3 * 1000) / (Math.PI * (PISTON.d / 2) ** 2);
}

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
/** Peinture bleu-gris du corps et du bouchon (relevée sur la photo). */
const bleuGris = () => teinte('graisseur-bleu-gris', () => withFinish(new THREE.MeshPhysicalMaterial({
  color: 0x4a5672, metalness: 0, roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.18,
}), 'paint'));
/** Poignée en T et tige : peinture presque noire, bleutée. */
const marine = () => teinte('graisseur-marine', () => withFinish(new THREE.MeshPhysicalMaterial({
  color: 0x1d2230, metalness: 0, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.2,
}), 'paintDark'));
/** Tête en fonte peinte alu, levier et biellette zingués. */
const fonte = () => teinte('graisseur-fonte', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0xd2d5d8, metalness: 0.5, roughness: 0.5,
}), 'cast', { fine: 0.035, wave: 0.008 }));
const zingue = () => teinte('graisseur-zingue', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0xdfe2e5, metalness: 0.55, roughness: 0.36,
}), 'machined'));
const cuir = () => teinte('graisseur-cuir', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0x6b4a2e, metalness: 0, roughness: 0.8,
}), 'rubber'));

// ------------------------------------------------------------------ outils de forme

const v2 = (pts) => pts.map(([a, b]) => [a * MM, b * MM]);

/** Révolution d'un profil [[r, x], …] (mm) autour de l'axe x. */
function tourX(S, profil, matiere, seg = 48) {
  return S.lathe(v2(profil), matiere, { axis: 'x', seg });
}

/** Plaque à bouts ronds de p à q (mm, plan x-y), rayon r, épaisseur e, percée de trous de rayon t aux deux centres. */
function flasque(S, p, q, r, e, t, matiere) {
  const a = Math.atan2(q[1] - p[1], q[0] - p[0]);
  const pts = [];
  for (let i = 0; i <= 16; i++) { const b = a + Math.PI / 2 + (i / 16) * Math.PI; pts.push([p[0] + r * Math.cos(b), p[1] + r * Math.sin(b)]); }
  for (let i = 0; i <= 16; i++) { const b = a - Math.PI / 2 + (i / 16) * Math.PI; pts.push([q[0] + r * Math.cos(b), q[1] + r * Math.sin(b)]); }
  return S.extrude(v2(pts), e * MM, matiere, { holes: [[p[0] * MM, p[1] * MM, t * MM], [q[0] * MM, q[1] * MM, t * MM]] });
}

// ------------------------------------------------------------------ pièces

/** Repère 1 : tête de pompe — collet taraudé, corps avant, tour du piston, oreille de la biellette, bossage de sortie. */
function tete(S) {
  const g = S.group();
  const rc = TETE.collet.d / 2, ra = TETE.avant.d / 2, ri = CORPS.d / 2 + 0.1;
  g.add(tourX(S, [
    [0, 3], [ri, 3], [ri, TETE.collet.x0], [rc - 1.5, TETE.collet.x0], [rc, TETE.collet.x0 + 1.5],
    [rc, TETE.collet.x1 - 2], [rc - 3, TETE.collet.x1 + 2], [ra + 1, 10], [ra, 13],
    [ra - 1, TETE.avant.x1 - 6], [ra - 6, TETE.avant.x1], [0, TETE.avant.x1],
  ], fonte(), 64));
  // Tour du piston, de la tête jusque sous le levier.
  const b = B();
  const haut = b[1] - 15;
  const tour = S.cyl(12 * MM, (haut - 8) * MM, fonte(), { seg: 36 });
  tour.position.set(b[0] * MM, ((haut + 8) / 2) * MM, 0);
  g.add(tour);
  // Âme qui relie la tour à l'oreille de la biellette.
  g.add(S.extrude(v2([[b[0], 8], [b[0] + 8, haut - 2], [44, 26], [62, 24], [67, 16], [64, 7], [36, 4], [20, 6]]), 16 * MM, fonte()));
  // Oreille de l'axe C, aussi large que le levier.
  g.add(flasque(S, [C[0] - 6, C[1] - 4], C, 9, LEVIER.large, AXE.d / 2 + 0.1, fonte()));
  // Bossage de sortie (vers la rallonge) et bossage du bouchon six pans.
  const sortie = S.cyl(7.5 * MM, 14 * MM, fonte(), { axis: 'x', seg: 28 });
  sortie.position.set((SORTIE.x - 7) * MM, SORTIE.y * MM, 0);
  g.add(sortie);
  const bossage = S.cyl(8.5 * MM, 10 * MM, fonte(), { axis: 'x', seg: 28 });
  bossage.position.set((TETE.collet.x1 + 5) * MM, SIXPANS.y * MM, 0);
  g.add(bossage);
  return g;
}

/** Repère 2 : levier embouti en U (ouvert vers le corps), roulé en poignée tubulaire au bout. */
function levier(S) {
  const L = LEVIER, demi = L.large / 2, e = L.tole;
  const local = S.group();
  // Joues : profil dans (X = −u, Y = v), A à l'origine, trous A et B.
  const joue = [[-205, 8.5], [-218, 2], [-218, -6], [-120, -9.5], [-62, -17], [-8, -17], [6, -13.5], [10, -6], [10, 2], [7, 7], [1, 8.5]];
  const [bu, bv] = L.B;
  for (const cote of [1, -1]) {
    const j = S.extrude(v2(joue), e * MM, zingue(), { holes: [[0, 0, (AXE.d / 2 + 0.1) * MM], [-bu * MM, bv * MM, (AXE.d / 2 + 0.1) * MM]] });
    j.position.z = cote * (demi - e / 2) * MM;
    local.add(j);
  }
  // Dos du U.
  local.add(S.box(214 * MM, e * MM, L.large * MM, zingue(), { pos: [-103 * MM, 7.5 * MM, 0] }));
  // Poignée roulée, ouverte au bout.
  const p = L.poignee, lg = L.long - p.de;
  const tube = S.shell((p.d / 2) * MM, (p.d / 2 - 1.2) * MM, lg * MM, zingue(), { axis: 'x', seg: 32 });
  tube.position.set(-(p.de + lg / 2) * MM, -1 * MM, 0);
  local.add(tube);
  // Pose : rotation de l'angle du levier, A en place.
  local.rotation.z = -L.angle * RAD;
  local.position.set(L.A[0] * MM, L.A[1] * MM, 0);
  return S.group(local);
}

/** Repère 3 : flasque de biellette, de A à C (une de chaque côté). */
function biellette(S, cote) {
  const f = flasque(S, LEVIER.A, C, 6.5, 2.5, AXE.d / 2 + 0.1, zingue());
  f.position.z = cote * (LEVIER.large / 2 + 1.35) * MM;
  return f;
}

/** Repère 4 : piston de pompe trempé, à œil pour l'axe B. */
function piston(S) {
  const b = B(), g = S.group();
  const tige = S.cyl((PISTON.d / 2) * MM, (b[1] - 4 - 6) * MM, 'chrome', { seg: 24 });
  tige.position.set(b[0] * MM, ((b[1] - 4 + 6) / 2) * MM, 0);
  const oeil = S.cyl(6 * MM, 14 * MM, zingue(), { axis: 'z', seg: 24 });
  oeil.position.set(b[0] * MM, b[1] * MM, 0);
  g.add(tige, oeil);
  return g;
}

/** Repère 5 : axe d'articulation à tête, le long de z, en (x, y), longueur lg. */
function axe(S, p, lg) {
  const g = S.group();
  const corps = S.cyl((AXE.d / 2) * MM, lg * MM, zingue(), { axis: 'z', seg: 20 });
  const tete1 = S.cyl((AXE.d / 2 + 1.6) * MM, 1.6 * MM, zingue(), { axis: 'z', seg: 20 });
  tete1.position.z = (lg / 2) * MM;
  const tete2 = S.cyl((AXE.d / 2 + 1.2) * MM, 1.2 * MM, zingue(), { axis: 'z', seg: 20 });
  tete2.position.z = -(lg / 2) * MM;
  g.add(corps, tete1, tete2);
  g.position.set(p[0] * MM, p[1] * MM, 0);
  return g;
}

/** Repère 6 : bouchon six pans de la tête, sous la sortie. */
function sixPans(S) {
  const r = SIXPANS.af / 2 / Math.cos(30 * RAD);
  const g = S.group();
  const tete6 = S.cyl(r * MM, SIXPANS.long * MM, zingue(), { axis: 'x', seg: 6 });
  tete6.position.set((TETE.collet.x1 + 10 + SIXPANS.long / 2) * MM, SIXPANS.y * MM, 0);
  const collerette = S.cyl((r + 0.6) * MM, 1.2 * MM, zingue(), { axis: 'x', seg: 28 });
  collerette.position.set((TETE.collet.x1 + 10.6) * MM, SIXPANS.y * MM, 0);
  g.add(tete6, collerette);
  return g;
}

/** Repère 7 : corps (réservoir), tube roulé avec ses gorges. */
function corps(S) {
  const ro = CORPS.d / 2, ri = ro - CORPS.tole;
  const dehors = [[ri, CORPS.x0], [ro, CORPS.x0]];
  for (const x of CORPS.gorges) dehors.push([ro, x - 1.4], [ro - 0.6, x], [ro, x + 1.4]);
  dehors.push([ro, CORPS.x1], [ri, CORPS.x1], [ri, CORPS.x0]);
  return tourX(S, dehors, bleuGris(), 64);
}

/** Repère 8 : bouchon arrière, percé pour la tige (avec l'encoche de verrouillage de la tige). */
function bouchon(S) {
  const r = BOUCHON.d / 2, ri = CORPS.d / 2 + 0.1, x0 = BOUCHON.x0, x1 = x0 + BOUCHON.long, t = BOUCHON.trou;
  return tourX(S, [
    [t, x0], [r - 3, x0], [r, x0 + 3], [r, x1 - 1], [r - 1, x1], [ri, x1], [ri, x0 + BOUCHON.fond], [t, x0 + BOUCHON.fond], [t, x0],
  ], bleuGris(), 64);
}

/** Repère 9 : tige du poussoir et sa poignée en T. */
function tige(S) {
  const g = S.group(), T = TIGE, p = T.poignee;
  const x1 = POUSSOIR.x - POUSSOIR.long;
  const r = S.cyl((T.d / 2) * MM, (x1 - T.xT) * MM, marine(), { axis: 'x', seg: 20 });
  r.position.x = ((x1 + T.xT) / 2) * MM;
  const barre = S.cyl((p.d / 2) * MM, p.long * MM, marine(), { axis: 'z', seg: 24 });
  barre.position.x = T.xT * MM;
  const moyeu = S.cyl((p.moyeu / 2) * MM, 10 * MM, marine(), { axis: 'x', seg: 24 });
  moyeu.position.x = (T.xT + 6) * MM;
  g.add(r, barre, moyeu);
  return g;
}

/** Repère 10 : poussoir — coupelle de cuir entre deux rondelles d'acier, écrou de tige. */
function poussoir(S) {
  const P = POUSSOIR, r = P.d / 2, x0 = P.x - P.long;
  const g = S.group();
  g.add(tourX(S, [[0, x0 + 3], [r - 0.6, x0 + 3], [r, x0 + 5], [r, P.x - 4], [r - 4, P.x - 3], [0, P.x - 3]], cuir(), 48));
  g.add(tourX(S, [[0, x0], [r - 5, x0], [r - 5, x0 + 3], [0, x0 + 3]], 'steel', 48));
  g.add(tourX(S, [[0, P.x - 3], [r - 6, P.x - 3], [r - 6, P.x], [0, P.x]], 'steel', 48));
  const ecrou = S.cyl(8 * MM, 6 * MM, 'steel', { axis: 'x', seg: 6 });
  ecrou.position.x = (x0 - 3) * MM;
  g.add(ecrou);
  return g;
}

/** Repère 11 : ressort du poussoir, du fond du bouchon au poussoir. */
function ressort(S) {
  const xa = BOUCHON.x0 + BOUCHON.fond, xb = POUSSOIR.x - POUSSOIR.long - 1;
  const s = S.spring((RESSORT.d / 2) * MM, (RESSORT.fil / 2) * MM, (xb - xa) * MM, RESSORT.spires, 'darkSteel', { axis: 'x' });
  s.position.x = ((xa + xb) / 2) * MM;
  return s;
}

/** Repère 12 : rallonge rigide 62028 coudée, écrou de raccord vissé dans la tête. */
function rallonge(S) {
  const g = S.group();
  const pts = RALLONGE.pts.map(([x, y]) => [x * MM, y * MM, 0]);
  g.add(S.tube(pts, (RALLONGE.d / 2) * MM, zingue(), { seg: 64, tension: 0.2, ends: 'none' }));
  const r = RALLONGE.ecrou / 2 / Math.cos(30 * RAD);
  const ecrou = S.cyl(r * MM, 7 * MM, zingue(), { axis: 'x', seg: 6 });
  ecrou.position.set((SORTIE.x + 3.5) * MM, SORTIE.y * MM, 0);
  g.add(ecrou);
  return g;
}

/** Repère 13 : coupleur hydraulique 5852 (six pans, corps, nez à mâchoires). */
function coupleur(S) {
  const r6 = COUPLEUR.af / 2 / Math.cos(30 * RAD), rn = COUPLEUR.d / 2, L = COUPLEUR.long;
  const local = S.group();
  const six = S.cyl(r6 * MM, 10 * MM, 'steel', { axis: 'x', seg: 6 });
  six.position.x = 5 * MM;
  local.add(six);
  local.add(tourX(S, [[0, 10], [rn - 0.5, 10], [rn, 11], [rn, 17], [rn - 0.8, 18], [rn - 0.8, 20], [rn, 21], [rn, L - 6], [rn - 2, L - 1],
    [rn - 2.6, L], [3.4, L], [3.4, L - 4], [0, L - 4]], 'steel', 32));
  const d = dirBout(), p = RALLONGE.pts[RALLONGE.pts.length - 1];
  local.rotation.z = Math.atan2(d[1], d[0]);
  local.position.set(p[0] * MM, p[1] * MM, 0);
  return S.group(local);
}

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  const S = api.S;
  const b = B();
  api.part('1', tete(S), [0.07, 0, 0], { labelAt: [20 * MM, -20 * MM, (TETE.collet.d / 2) * MM] });
  api.part('2', levier(S), [0.03, 0.1, 0], { labelAt: [...surLevier(150, 8).map((v) => v * MM), 0] });
  api.part('3', biellette(S, 1), [0.07, 0.08, 0.05]);
  api.part('3', biellette(S, -1), [0.07, 0.08, -0.05], { noLabel: true });
  api.part('4', piston(S), [0.06, 0.06, 0], { labelAt: [b[0] * MM, (b[1] - 12) * MM, 0] });
  api.part('5', axe(S, LEVIER.A, LEVIER.large + 6), [0.07, 0.1, 0.09]);
  api.part('5', axe(S, b, LEVIER.large + 2), [0.06, 0.08, 0.09], { noLabel: true });
  api.part('5', axe(S, C, LEVIER.large + 6), [0.08, 0.07, 0.09], { noLabel: true });
  api.part('6', sixPans(S), [0.1, -0.03, 0]);
  api.part('7', corps(S), [0, 0, 0], { labelAt: [-200 * MM, 0, (CORPS.d / 2) * MM] });
  api.part('8', bouchon(S), [-0.06, 0, 0], { labelAt: [(BOUCHON.x0 + 10) * MM, 0, (BOUCHON.d / 2) * MM] });
  api.part('9', tige(S), [-0.2, 0, 0], { labelAt: [TIGE.xT * MM, 0, (TIGE.poignee.long / 2) * MM] });
  api.part('10', poussoir(S), [-0.04, -0.1, 0], { labelAt: [(POUSSOIR.x - 7) * MM, 0, (POUSSOIR.d / 2) * MM] });
  api.part('11', ressort(S), [0, -0.17, 0], { labelAt: [-150 * MM, 0, (RESSORT.d / 2) * MM] });
  api.part('12', rallonge(S), [0.16, 0, 0], { labelAt: [100 * MM, -11 * MM, 0] });
  api.part('13', coupleur(S), [0.22, -0.01, 0]);
  // Vue de la photo : de trois quarts, côté du levier. Coupe proposée : par l'axe, pour voir le poussoir et le ressort.
  return { view: { dir: [0.15, 0.35, 1], section: { axis: 'z', pos: 0.5 } } };
}

export default { P01 };

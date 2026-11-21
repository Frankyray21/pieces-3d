// Visseuse à chocs sans fil Milwaukee M18 2656-20 (1/4 po hexagonal, une
// vitesse, outil seul) : vue éclatée de la liste de pièces de service
// 54-26-2503 (à partir du numéro de série F26D).
//
// Sources :
//   P01 : liste de pièces de service, page 1 (vue éclatée et liste) ;
//   P02 : page 2 (câblage) ;
//   P03 : vue de côté du fabricant, cotée (5,5 po de long) : c'est elle qui
//         donne le profil du boîtier ;
//   P04 : photo de trois quarts avant ;
//   P05 : manuel de l'utilisateur 58-14-2613d5, description fonctionnelle.
//
// Données publiées par Milwaukee, reprises telles quelles : longueur de 5,5 po
// (139,7 mm), hauteur de 7,6 po sans batterie, largeur de 2,4 po, 2,3 lb sans
// batterie, 0 à 2 750 tr/min, 0 à 3 450 coups/min, 1 500 lb-po. Le profil est
// relevé sur la vue P03 mise à l'échelle des 5,5 po ; les largeurs viennent de
// la photo P04 et de la largeur publiée (estimées à environ 10 % près). Les
// pièces internes sont dessinées d'après la vue éclatée, proportions relevées
// sur le dessin : leurs cotes sont estimées.
//
// Repère de l'outil, en millimètres : X de l'avant du manchon (x = 0) vers
// l'arrière, le long de l'axe de l'enclume ; Y vers le haut depuis cet axe ;
// Z vers le flanc gauche de l'outil (celui de la vue P03, demi-coque 35) ;
// z = 0 est le plan de joint des deux demi-coques. Modèle : outil debout, nez
// vers −X, bas de l'agrafe de ceinture (point le plus bas) à Y = 0, en mètres.
import * as THREE from 'three';
import { mat, withFinish } from '../../viewer/materials.js';
import { geometrie, oriente, pointSection, corps, bande, relief } from '../makita-djr183/scie.js';

const MM = 0.001;
const RAD = Math.PI / 180;
const P = (x, y, z = 0) => [x * MM, y * MM, z * MM];

// ------------------------------------------------------------------ données publiées

export const PUBLIE = { longueur: 139.7, hauteur: 7.6 * 25.4, largeur: 2.4 * 25.4, masse: 2.3, tours: 2750, coups: 3450, couple: 1500, tension: 18 };

// ------------------------------------------------------------------ relevé de la vue P03

// Vue de côté de 1 080 px : la cote « 5.5" IN LENGTH » va de x = 292 à 786 px
// (avant du manchon à l'arrière du carter). Axe de l'enclume à y = 361 px.
const ECH = PUBLIE.longueur / 494;
const U0 = 290, V0 = 361;
/** Point (mm) d'un pixel (u, v) de la vue P03. */
const ip = (u, v) => [(u - U0) * ECH, (V0 - v) * ECH];
/** Section relevée en pixels [u haut, v haut, u bas, v bas, largeur (mm), exposant] → millimètres. */
const sec = ([uh, vh, ub, vb, w, e]) => [...ip(uh, vh), ...ip(ub, vb), w, e];

// Carter du moteur (cordes verticales) : de l'arrière du carter d'engrenages au capot arrière.
const CARTER = [
  [452, 264, 452, 466, 52, 2.4],
  [462, 262, 462, 476, 54, 2.5],
  [490, 260, 490, 482, 56, 2.6],
  [560, 257, 560, 482, 57, 2.6],
  [650, 256, 650, 482, 57, 2.6],
  [720, 258, 720, 478, 57, 2.6],
  [752, 261, 752, 464, 56, 2.6],
  [772, 270, 772, 448, 54, 2.6],
  [783, 288, 783, 425, 50, 2.6],
  [788, 310, 788, 400, 44, 2.4],
].map(sec);
// Menton rouge sous le carter d'engrenages (porte la DEL), cordes verticales.
const MENTON = [
  [413, 452, 413, 476, 26, 2.2],
  [420, 448, 420, 490, 34, 2.4],
  [432, 444, 432, 494, 40, 2.5],
  [448, 440, 448, 508, 46, 2.5],
  [462, 440, 462, 520, 50, 2.5],
  [482, 440, 482, 524, 50, 2.5],
].map(sec);
// Poignée (cordes horizontales, « haut » = dos de la poignée, « bas » = avant).
const POIGNEE = [
  [712, 470, 490, 470, 50, 2.6],
  [700, 500, 520, 500, 48, 2.6],
  [692, 540, 528, 540, 45, 2.5],
  [695, 578, 530, 578, 43, 2.4],
  [700, 602, 506, 602, 42, 2.3], // lèvre sous la gâchette
  [708, 622, 536, 622, 41, 2.3],
  [716, 650, 551, 650, 40, 2.3],
  [724, 700, 565, 700, 40, 2.3],
  [730, 750, 582, 750, 41, 2.3],
  [731, 795, 590, 795, 44, 2.4],
  [736, 834, 572, 834, 52, 2.8],
].map(sec);
// Pied (embase de la batterie), cordes verticales ; largeur publiée de 2,4 po.
const PIED = [
  [469, 845, 469, 896, 50, 3],
  [474, 834, 474, 914, 58, 3.5],
  [486, 829, 486, 920, 61, 4],
  [600, 828, 600, 920, 61, 4],
  [740, 828, 740, 920, 61, 4],
  [758, 834, 758, 918, 60, 3.5],
  [765, 848, 765, 910, 54, 3],
].map(sec);
const PIED_BAS = ip(0, 931)[1]; // dessous des glissières
/** Hauteur de l'axe de l'enclume au-dessus du point le plus bas de l'outil : le bas de l'agrafe, qui dépasse sous le pied. */
export const AXE = -ip(0, 1014)[1];

// Reliefs du flanc (contours en pixels de la vue P03).
const PLAQUE = [497, 300, 655, 405]; // plaque rouge de la marque (sans inscription)
const GRILLE = [657, 302, 745, 410]; // grille d'aération rouge, 4 fentes noires
const NERVURES = { u0: 640, u1: 694, v0: 640, pas: 16, n: 8 }; // nervures du surmoulage

// Gâchette, vue de côté (px) ; épaisseur supposée.
const GACHETTE = [[470, 522], [467, 545], [465, 568], [467, 584], [476, 594], [500, 598], [530, 593], [532, 520], [500, 520]];
const DEL = ip(412, 468);
const INVERSEUR = ip(577, 462);
const AGRAFE = { contour: [[642, 868], [736, 868], [746, 888], [744, 1002], [732, 1014], [640, 1014], [628, 1000], [630, 900]], vis: ip(706, 880) };

// ------------------------------------------------------------------ outils

// Matériaux hors palette, créés une fois.
const perso = new Map();
function teinte(nom, params, finition = null) {
  let m = perso.get(nom);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ metalness: 0, roughness: 0.55, ...params });
    m.polygonOffset = true;
    m.polygonOffsetFactor = 1;
    m.polygonOffsetUnits = 1;
    m.name = nom;
    if (finition) withFinish(m, finition);
    perso.set(nom, m);
  }
  return m;
}
const ROUGE = 0xc3161d; // rouge du boîtier, relevé sur les photos
const rouge = () => teinte('m2656-rouge', { color: ROUGE, roughness: 0.42 }, 'plastic');
const fente = () => teinte('m2656-fente', { color: 0x0d0d0f, roughness: 0.85 });
const carterGris = () => teinte('m2656-carter', { color: 0xb3b6ba, metalness: 0.75, roughness: 0.42 }, 'cast');
const circuit = () => teinte('m2656-circuit', { color: 0x1f5a35, roughness: 0.6 });
const fil = (c) => teinte(`m2656-fil-${c}`, { color: c, roughness: 0.5 }, 'rubber');

// Coques, calculées une fois (les reliefs s'appuient dessus).
let COQUES = null;
function coques() {
  if (!COQUES) {
    COQUES = {
      carter: corps(CARTER, { k: 3, n: 48 }),
      menton: corps(MENTON, { k: 3, n: 40 }),
      poignee: corps(POIGNEE, { k: 3, n: 44 }),
      pied: corps(PIED, { k: 3, n: 44 }),
    };
  }
  return COQUES;
}
/** Demi-largeur du boîtier (mm) au point (x, y) : la plus grande des coques qui le contiennent. */
function demiLargeur(x, y) {
  let z = 0;
  for (const c of Object.values(coques())) {
    try { z = Math.max(z, c.z(x, y)); } catch { /* point hors de cette coque */ }
  }
  return z;
}

/**
 * Demi-coque fermée d'un côté du plan de joint (cote = +1 : flanc +Z) : la
 * coque passe par les sections de 0 (haut) à 180° (bas) ; la face de joint
 * (z = 0) et les deux bouts sont fermés.
 */
function demiVolume(c, cote, { s0 = 0, s1 = null } = {}) {
  const m = c.n / 2;
  const fin = s1 ?? c.secs.length - 1;
  const idx = [];
  for (let s = s0; s < fin - 1e-6; s = Math.min(fin, Math.floor(s) + 1)) idx.push(s);
  idx.push(fin);
  const rings = idx.map((s) => Array.from({ length: m + 1 }, (_, j) => {
    const p = pointSection(c.en(s), (j / m) * Math.PI);
    return [p[0], p[1], cote * p[2]];
  }));
  const t = [];
  const tri = (a, b, d) => t.push(...a, ...b, ...d);
  for (let i = 0; i < rings.length - 1; i++) {
    const A = rings[i], B = rings[i + 1];
    for (let j = 0; j < m; j++) { tri(A[j], A[j + 1], B[j + 1]); tri(A[j], B[j + 1], B[j]); }
    tri(A[0], B[m], B[0]); tri(A[0], A[m], B[m]); // face de joint
  }
  for (const [ring, debut] of [[rings[0], true], [rings[rings.length - 1], false]]) {
    const o = [(ring[0][0] + ring[m][0]) / 2, (ring[0][1] + ring[m][1]) / 2, 0];
    for (let j = 0; j < m; j++) if (debut) tri(o, ring[j + 1], ring[j]); else tri(o, ring[j], ring[j + 1]);
  }
  return geometrie(oriente(t));
}

/** Bande en relief d'un côté : angles de 0 (haut) à 180° (bas) du flanc de ce côté. */
const bandeCote = (c, s0, s1, a0, a1, ep, cote) => (cote > 0 ? bande(c, s0, s1, a0, a1, ep) : bande(c, s0, s1, -a1, -a0, ep));
/** Indice de section d'une coque au pixel (u, v) de la vue P03. */
const indice = (c, u, v) => c.indice(...ip(u, v));
/** Rectangle aux coins arrondis, en pixels → contour en mm. */
function rectArrondi(u0, v0, u1, v1, r = 6, n = 4) {
  const pts = [];
  const coins = [[u1 - r, v0 + r, -90], [u1 - r, v1 - r, 0], [u0 + r, v1 - r, 90], [u0 + r, v0 + r, 180]];
  for (const [cu, cv, a] of coins) {
    for (let i = 0; i <= n; i++) {
      const t = (a + (90 * i) / n) * RAD;
      pts.push(ip(cu + r * Math.cos(t), cv + r * Math.sin(t)));
    }
  }
  return pts;
}

// ------------------------------------------------------------------ boîtier (demi-coques 35 et 49)

/** Repères 35 et 49 : demi-coque gauche (cote = +1) ou droite (−1) du boîtier. */
function demiCoque(cote) {
  const { carter, menton, poignee, pied } = coques();
  const g = new THREE.Group();
  const capot = indice(carter, 752, 360);
  // Carter du moteur : rouge, capot arrière noir.
  g.add(new THREE.Mesh(demiVolume(carter, cote, { s1: capot }), rouge()));
  g.add(new THREE.Mesh(demiVolume(carter, cote, { s0: capot }), mat('plastic')));
  // Panneau noir du flanc, plaque rouge et grille d'aération.
  g.add(new THREE.Mesh(bandeCote(carter, indice(carter, 470, 360), capot, 38, 132, 0.6, cote), mat('plastic')));
  const [a0, b0, a1, b1] = PLAQUE;
  g.add(new THREE.Mesh(geometrie(relief(carter, rectArrondi(a0, b0, a1, b1, 10), 1.4, cote)), rouge()));
  const [c0, d0, c1, d1] = GRILLE;
  g.add(new THREE.Mesh(geometrie(relief(carter, rectArrondi(c0, d0, c1, d1, 8), 1.3, cote)), rouge()));
  const fentes = [];
  for (let i = 0; i < 4; i++) {
    const v = d0 + 18 + i * 24;
    fentes.push(...relief(carter, rectArrondi(c0 + 12, v - 6, c1 - 10, v + 6, 5, 2), 1.4, cote, 0.2));
  }
  const geoF = geometrie(fentes);
  geoF.userData.edgeAngle = 180;
  g.add(new THREE.Mesh(geoF, fente()));
  // Menton rouge, sous le carter d'engrenages.
  g.add(new THREE.Mesh(demiVolume(menton, cote), rouge()));
  // Poignée : rouge, surmoulage noir sur le dos et les flancs, nervures.
  g.add(new THREE.Mesh(demiVolume(poignee, cote), rouge()));
  g.add(new THREE.Mesh(bandeCote(poignee, indice(poignee, 620, 540), poignee.secs.length - 1, 0, 118, 0.8, cote), mat('rubber')));
  const nerv = [];
  const { u0, u1, v0, pas, n } = NERVURES;
  for (let i = 0; i < n; i++) {
    const v = v0 + i * pas, du = i * 2.2;
    nerv.push(...relief(poignee, rectArrondi(u0 + du, v - 3, u1 + du, v + 3, 3, 2), 1.8, cote));
  }
  g.add(new THREE.Mesh(geometrie(nerv), mat('rubber')));
  // Pied : noir, jupe rouge en bas ; glissières de la batterie dessous.
  g.add(new THREE.Mesh(demiVolume(pied, cote), mat('plastic')));
  g.add(new THREE.Mesh(bandeCote(pied, 0, pied.secs.length - 1, 97, 180, 0.7, cote), rouge()));
  const [xg0] = ip(492, 0), [xg1] = ip(738, 0);
  const yBas = ip(0, 920)[1];
  g.add(new THREE.Mesh(new THREE.BoxGeometry((xg1 - xg0) * MM, (yBas - PIED_BAS) * MM, 7 * MM).translate(
    ((xg0 + xg1) / 2) * MM, ((yBas + PIED_BAS) / 2) * MM, cote * 24.5 * MM), mat('plastic')));
  return g;
}

/** Repère 48 : plaque signalétique de service, sur le flanc droit du carter (place supposée). */
function plaqueService(S) {
  const [x, y] = ip(600, 352);
  const p = S.nameplate(34 * MM, 20 * MM, { material: 'lightGrey', ink: 'black' });
  p.rotation.y = Math.PI; // face vers −Z
  p.position.set(...P(x, y, -(demiLargeur(x, y) + 0.9)));
  return p;
}

/** Vis traversant les demi-coques, tête du côté droit (−Z) ; d : diamètre, long : longueur (mm). */
function visCoque(S, u, v, d, long) {
  const [x, y] = ip(u, v);
  const z = demiLargeur(x, y);
  const g = S.group();
  g.add(S.cyl(d * 0.95 * MM, 2.2 * MM, 'blackOxide', { axis: 'z', pos: P(x, y, -z - 0.6), seg: 16 }));
  g.add(S.cyl(d * 0.42 * MM, long * MM, 'blackOxide', { axis: 'z', pos: P(x, y, -z + long / 2), seg: 10 }));
  g.add(S.box(d * 0.9 * MM, 0.5 * MM, 0.4 * MM, fente(), { pos: P(x, y, -z - 1.75) })); // empreinte Torx suggérée
  return g;
}

// Vis 50 (M3 × 16, ×8) et 62 (4-20 × 3/4 po) : places supposées le long du plan de joint.
const VIS50 = [[480, 290], [740, 290], [770, 420], [440, 478], [640, 560], [660, 760], [500, 880], [748, 878]];
const VIS62 = [612, 470];
// Patins en caoutchouc 25 : 4 par demi-coque (places supposées, cf. encadré de la page P01).
const PATINS = [[56, 21], [56, -23], [124, 20], [124, -24]];

// ------------------------------------------------------------------ nez (manchon, enclume, carter d'engrenages)

/** Repère 1 : jonc d'arrêt du manchon, au bout de l'enclume. */
const jonc = (S) => S.ring(6.1 * MM, 4.9 * MM, 0.9 * MM, 'blackOxide', { axis: 'x', pos: P(1.2, 0), seg: 28 });
/** Repère 2 : rondelle, derrière le jonc. */
const rondelle = (S) => S.ring(7.6 * MM, 5.6 * MM, 0.8 * MM, 'steel', { axis: 'x', pos: P(2.3, 0), seg: 28 });
/** Repère 3 : ressort du manchon, autour de l'enclume. */
const ressortManchon = (S) => S.spring(6.6 * MM, 0.55 * MM, 7 * MM, 5, 'steel', { axis: 'x', pos: P(6.5, 0) });

/** Repère 4 : manchon (bague que l'on tire pour libérer l'embout), moleté. */
function manchon(S) {
  const prof = [[6.3, 0.6], [8, 0.6], [10.5, 3], [10.5, 9.5], [9.6, 10.4], [10.4, 11.4], [10.4, 13.6], [6.3, 13.6]];
  const g = S.group(S.lathe(prof.map(([r, x]) => [r * MM, x * MM]), 'plastic', { axis: 'x', seg: 40 }));
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * 2 * Math.PI;
    g.add(S.box(5.5 * MM, 0.7 * MM, 0.9 * MM, 'plastic', { pos: P(6.2, 10.5 * Math.cos(a), 10.5 * Math.sin(a)), rot: [a, 0, 0] }));
  }
  return g;
}

/** Repère 54 : carter d'engrenages avec sa bague (gris, logo M18 sans inscription), creux. */
function carterEngrenages(S) {
  const ext = [[7.2, 13.6], [15, 13.6], [16.5, 16], [20, 24], [24, 33], [27, 41], [27.7, 45], [27.5, 47], [26, 47.5], [26, 54]];
  const int = [[23.5, 54], [23.5, 46], [21, 40], [17, 30], [13.5, 22], [7.2, 19]];
  const prof = [...ext, ...int, [7.2, 13.6]];
  const g = S.group(S.lathe(prof.map(([r, x]) => [r * MM, x * MM]), carterGris(), { axis: 'x', seg: 48 }));
  // Bague de l'enclume, dans le nez.
  g.add(S.ring(7.4 * MM, 6.15 * MM, 6 * MM, 'brass', { axis: 'x', pos: P(17, 0), seg: 28 }));
  // Écusson « M18 » du dessus (inscription non reproduite).
  g.add(S.box(10 * MM, 0.8 * MM, 9 * MM, 'plastic', { r: 0.3 * MM, pos: P(32, 23.8), rot: [0, 0, 21 * RAD] })); // à plat sur le cône
  return g;
}

/** Repère 8 : rondelle en nylon, entre la bague du carter et le plateau de l'enclume. */
const rondelleNylon = (S) => S.ring(15.5 * MM, 6.4 * MM, 1.2 * MM, 'white', { axis: 'x', pos: P(23, 0), seg: 36 });

/** Repère 10 : enclume hexagonale de 1/4 po (douille à six pans, plateau à deux becs). */
function enclume(S) {
  const g = S.group();
  g.add(S.cyl(6 * MM, 23.5 * MM, 'darkSteel', { axis: 'x', pos: P(12.25, 0), seg: 28 }));
  g.add(S.cyl(3.7 * MM, 0.3 * MM, fente(), { axis: 'x', pos: P(0.4, 0), seg: 6 })); // empreinte de 1/4 po (6,35 mm sur plats)
  g.add(S.cyl(15 * MM, 5 * MM, 'darkSteel', { axis: 'x', pos: P(26.5, 0), seg: 36 }));
  for (const s of [1, -1]) g.add(S.box(5 * MM, 9 * MM, 6 * MM, 'darkSteel', { pos: P(31, s * 10) }));
  g.add(S.cyl(3 * MM, 4 * MM, 'darkSteel', { axis: 'x', pos: P(31, 0), seg: 16 }));
  return g;
}
/** Repère 9 : bille de 4 mm de l'enclume (retient l'embout) ; s = ±1. */
const billeEnclume = (S, s) => S.ball(2 * MM, 'chrome', { pos: P(8.5, s * 5.4) });
/** Repère 11 : bille de 5 mm, entre l'enclume et l'arbre du mécanisme. */
const billeCentre = (S) => S.ball(2.5 * MM, 'chrome', { pos: P(34.5, 0) });

// ------------------------------------------------------------------ mécanisme de frappe et réducteur

/** Repère 58 : mécanisme de frappe (marteau à deux becs, ressort, arbre et porte-satellites). */
function mecanisme(S) {
  const g = S.group();
  g.add(S.cyl(14 * MM, 9 * MM, 'darkSteel', { axis: 'x', pos: P(40.5, 0), seg: 36 }));
  for (const s of [1, -1]) g.add(S.box(4 * MM, 8 * MM, 6 * MM, 'darkSteel', { pos: P(34.5, 0, s * 10) }));
  g.add(S.spring(9 * MM, 1.1 * MM, 6 * MM, 3, 'blackOxide', { axis: 'x', pos: P(47, 0) }));
  g.add(S.cyl(5.5 * MM, 18 * MM, 'steel', { axis: 'x', pos: P(41, 0), seg: 24 })); // arbre à rainures en V
  g.add(S.cyl(15.5 * MM, 2.5 * MM, 'steel', { axis: 'x', pos: P(50.5, 0), seg: 36 })); // flasque du porte-satellites
  for (const s of [1, -1]) {
    g.add(S.gear(5.2 * MM, 6.2 * MM, 13, 6 * MM, 'steel', { axis: 'x', hole: 1.2 * MM, pos: P(54.8, s * 9.4) }));
  }
  return g;
}
/** Repère 16 : bille de came de 4,7 mm, entre l'arbre et le marteau ; s = ±1. */
const billeCame = (S, s) => S.ball(2.35 * MM, 'chrome', { pos: P(42, 0, s * 7.2) });

/** Repère 22 : couronne dentée (denture intérieure). */
function couronne(S) {
  const ext = Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * 2 * Math.PI; return [21.5 * MM * Math.cos(a), 21.5 * MM * Math.sin(a)]; });
  const dents = [];
  const n = 33;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * Math.PI, d = (2 * Math.PI) / n;
    for (const [r, f] of [[17, 0], [15.6, 0.25], [15.6, 0.5], [17, 0.72]]) dents.push([r * MM * Math.cos(a + f * d), r * MM * Math.sin(a + f * d)]);
  }
  const m = S.extrude(ext, 6 * MM, 'darkSteel', { holes: [dents.reverse()] });
  m.rotation.y = Math.PI / 2;
  m.position.set(...P(54.8, 0));
  return S.group(m);
}

/** Repère 24 : couvercle arrière du carter d'engrenages, avec roulement à billes. */
function couvercle(S) {
  const g = S.group();
  g.add(S.ring(25.5 * MM, 5 * MM, 4 * MM, carterGris(), { axis: 'x', pos: P(60, 0), seg: 48 }));
  g.add(S.ring(21 * MM, 9 * MM, 2.5 * MM, carterGris(), { axis: 'x', pos: P(63, 0), seg: 40 }));
  g.add(S.bearing(9 * MM, 4 * MM, 4 * MM, 'steel', { axis: 'x', pos: P(61, 0) }));
  return g;
}
/** Repère 80 : joint torique du couvercle (le carter d'engrenages s'emboîte dessus). */
const torique = (S) => S.torus(24.6 * MM, 0.9 * MM, 'rubber', { axis: 'x', pos: P(57.8, 0) });

// ------------------------------------------------------------------ moteur

/** Repère 26 : inducteur (carcasse et aimants permanents). */
function inducteur(S) {
  const g = S.group(S.shell(23.5 * MM, 21.5 * MM, 32 * MM, 'blackOxide', { axis: 'x', pos: P(86, 0), seg: 48 }));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * 2 * Math.PI + Math.PI / 4;
    const m = S.box(30 * MM, 3.2 * MM, 15 * MM, 'gunmetal', { pos: P(86, 19.6 * Math.cos(a), 19.6 * Math.sin(a)) });
    m.rotation.x = a;
    g.add(m);
  }
  return g;
}

/** Repère 59 : induit (pignon, ventilateur, paquet de tôles bobiné, collecteur). */
function induit(S) {
  const g = S.group();
  g.add(S.cyl(2.5 * MM, 70 * MM, 'steel', { axis: 'x', pos: P(88, 0), seg: 16 }));
  g.add(S.gear(3 * MM, 3.9 * MM, 9, 6 * MM, 'steel', { axis: 'x', pos: P(55, 0) })); // pignon (planétaire)
  // Ventilateur.
  g.add(S.cyl(8 * MM, 3 * MM, 'plastic', { axis: 'x', pos: P(67, 0), seg: 24 }));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * 2 * Math.PI;
    const p = S.box(4.5 * MM, 9 * MM, 0.9 * MM, 'plastic', { pos: P(68, 13 * Math.cos(a), 13 * Math.sin(a)) });
    p.rotation.x = a + Math.PI / 2;
    g.add(p);
  }
  // Paquet de tôles et bobinage.
  g.add(S.cyl(16.5 * MM, 26 * MM, 'darkSteel', { axis: 'x', pos: P(86, 0), seg: 40 }));
  for (const x of [71.5, 100.5]) g.add(S.cyl(14 * MM, 3 * MM, 'copper', { axis: 'x', pos: P(x, 0), seg: 32 }));
  // Collecteur.
  g.add(S.cyl(6 * MM, 8 * MM, 'copper', { axis: 'x', pos: P(108, 0), seg: 24 }));
  return g;
}

/** Repère 31 : porte-balais (plaque, quatre cages et leurs balais). */
function porteBalais(S) {
  const g = S.group(S.ring(21 * MM, 7.5 * MM, 2.5 * MM, 'plastic', { axis: 'x', pos: P(114, 0), seg: 40 }));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * 2 * Math.PI + Math.PI / 4;
    const c = S.box(5 * MM, 9 * MM, 7 * MM, 'brass', { pos: P(111.5, 11 * Math.cos(a), 11 * Math.sin(a)) });
    c.rotation.x = a;
    g.add(c);
  }
  g.add(S.bearing(6 * MM, 2.5 * MM, 4 * MM, 'steel', { axis: 'x', pos: P(119, 0) }));
  return g;
}
/** Repères 73 et 74 : ressort de balai (torsion), à un des quatre coins du porte-balais. */
function ressortBalai(S, i) {
  const a = (i / 4) * 2 * Math.PI + Math.PI / 4 + 0.5;
  return S.spring(2.2 * MM, 0.4 * MM, 3 * MM, 3, 'steel', { axis: 'x', pos: P(111.8, 16.5 * Math.cos(a), 16.5 * Math.sin(a)) });
}
// Bornes des fils sur le porte-balais (côté gauche, rouge, +Z ; côté droit, noir, −Z).
const BORNE = (cote) => [116.2, -15.5, cote * 5.5];
/** Repère 32 : rondelle élastique d'une borne. */
const rondelleBorne = (S, cote) => S.ring(2.9 * MM, 1.6 * MM, 0.6 * MM, 'zinc', { axis: 'x', pos: P(...BORNE(cote)) });
/** Repère 33 : vis M3 × 5 mm à tête cylindrique T-10 d'une borne. */
function visBorne(S, cote) {
  const [x, y, z] = BORNE(cote);
  return S.group(S.cyl(2.7 * MM, 2 * MM, 'zinc', { axis: 'x', pos: P(x + 1.4, y, z), seg: 16 }), S.cyl(1.5 * MM, 5 * MM, 'zinc', { axis: 'x', pos: P(x - 2, y, z), seg: 10 }));
}
/** Repères 71 (noir, droite) et 72 (rouge, gauche) : fil du porte-balais à l'interrupteur. */
function filBalai(S, cote) {
  const [x, y, z] = BORNE(cote);
  const pts = [[x, y, z], [x - 4, y - 8, z], [x - 14, y - 18, z * 1.3], [x - 26, y - 30, z * 1.4], [ip(600, 0)[0], -38, z * 1.2]];
  const t = S.tube(pts.map((p) => P(...p)), 0.9 * MM, fil(cote > 0 ? 0xb01c1c : 0x161616), { seg: 24, radial: 8 });
  // Cosse à œillet sous la vis.
  return S.group(t, S.ring(2.8 * MM, 1.6 * MM, 0.5 * MM, 'copper', { axis: 'x', pos: P(x - 0.6, y, z) }));
}

// ------------------------------------------------------------------ commande et électronique

/** Repère 40 : inverseur (marche avant, arrière, verrouillage), traversant au-dessus de la gâchette. */
function inverseur(S) {
  const [x, y] = INVERSEUR;
  const long = 2 * (demiLargeur(x, y) + 3.2);
  const g = S.group(S.box(15 * MM, 4.5 * MM, long * MM, 'plastic', { r: 1.4 * MM, pos: P(x, y) }));
  g.add(S.box(9 * MM, 6 * MM, 6 * MM, 'plastic', { pos: P(x, y - 4) })); // doigt vers l'interrupteur
  return g;
}

/**
 * Repère 57 : ensemble électronique (une vitesse) — interrupteur et gâchette,
 * carte électronique, DEL et bornier de la batterie, avec leurs fils.
 */
function electronique(S) {
  const g = S.group();
  // Gâchette (profil relevé sur la vue P03 ; épaisseur supposée).
  const trig = S.extrude(GACHETTE.map(([u, v]) => ip(u, v).map((c) => c * MM)), 15 * MM, 'plastic', { bevel: 1.2 * MM });
  g.add(trig);
  // Interrupteur, dans le haut de la poignée.
  const [xi0, yi0] = ip(530, 492), [xi1, yi1] = ip(625, 575);
  g.add(S.box((xi1 - xi0) * MM, (yi0 - yi1) * MM, 22 * MM, 'plastic', { r: 1.5 * MM, pos: P((xi0 + xi1) / 2, (yi0 + yi1) / 2) }));
  g.add(S.box(8 * MM, 10 * MM, 23 * MM, 'white', { pos: P(xi1 - 6, yi0 - 6) }));
  // Carte électronique, dans le pied.
  const [xc0] = ip(500, 0), [xc1] = ip(735, 0);
  const yc = ip(0, 880)[1];
  g.add(S.box((xc1 - xc0) * MM, 1.6 * MM, 44 * MM, circuit(), { pos: P((xc0 + xc1) / 2, yc) }));
  for (const [dx, dz] of [[-20, -10], [-6, 8], [10, -12], [24, 6]]) g.add(S.box(7 * MM, 3 * MM, 5 * MM, 'plastic', { pos: P((xc0 + xc1) / 2 + dx, yc + 2.3, dz) }));
  // Bornier de la batterie, sous la carte, entre les glissières.
  const [xb0] = ip(560, 0), [xb1] = ip(700, 0);
  const yb = ip(0, 912)[1];
  g.add(S.box((xb1 - xb0) * MM, 9 * MM, 26 * MM, 'plastic', { r: 1 * MM, pos: P((xb0 + xb1) / 2, yb) }));
  for (const z of [-8, -3, 3, 8]) g.add(S.box(18 * MM, 2 * MM, 1 * MM, 'brass', { pos: P(xb0 + 14, yb - 5, z) }));
  // DEL, sur le devant du menton, tournée vers l'embout.
  const [xl, yl] = DEL;
  const del = S.group(S.cyl(2.6 * MM, 2.2 * MM, 'lamp', { axis: 'x', seg: 20 }), S.ring(3.6 * MM, 2.6 * MM, 2.4 * MM, 'plastic', { axis: 'x', seg: 20 }));
  del.position.set(...P(xl + 1, yl));
  del.rotation.z = 20 * RAD;
  g.add(del);
  // Fils : DEL et bornier vers l'interrupteur, interrupteur vers la carte.
  const lumineux = [[xl + 2, yl, 0], [xl + 14, yl - 4, 2], [xi0 + 2, yi0 - 6, 4]];
  g.add(S.tube(lumineux.map((p) => P(...p)), 0.5 * MM, fil(0xe0e0e0), { seg: 16, radial: 6 }));
  for (const [z, c] of [[-6, 0x161616], [6, 0xb01c1c]]) {
    const pts = [[xi1 - 10, yi1 + 2, z], [xi1 - 6, yi1 - 30, z], [xi1 - 2, yc + 6, z], [xc1 - 20, yc + 1.5, z]];
    g.add(S.tube(pts.map((p) => P(...p)), 0.9 * MM, fil(c), { seg: 20, radial: 8 }));
  }
  return g;
}

/** Repère 34 : ressort du bornier (pousse le bornier vers la batterie). */
function ressortBornier(S) {
  const [x] = ip(640, 0);
  return S.spring(2.8 * MM, 0.45 * MM, 7 * MM, 5, 'steel', { axis: 'y', pos: P(x, ip(0, 893)[1]) });
}

/** Repère 25 : patin en caoutchouc entre le boîtier et le carter d'engrenages ou le moteur. */
const patin = (S, x, y, cote) => S.cyl(2.6 * MM, 4 * MM, 'rubber', { axis: 'z', pos: P(x, y, cote * 20), seg: 14 });

// ------------------------------------------------------------------ agrafe de ceinture

/** Repère 37 : agrafe de ceinture (acier plié, deux ajours), sur le flanc gauche du pied. */
function agrafe(S) {
  const pts = AGRAFE.contour.map(([u, v]) => ip(u, v).map((c) => c * MM));
  const tri = [ip(668, 912), ip(712, 905), ip(700, 945)].map((p) => p.map((c) => c * MM));
  const rect = [ip(660, 962), ip(722, 958), ip(722, 990), ip(660, 990)].map((p) => p.map((c) => c * MM));
  const [xs, ys] = AGRAFE.vis;
  const z = demiLargeur(xs, ys);
  const g = S.group();
  const plat = S.extrude(pts, 1.8 * MM, 'zinc', { holes: [tri, rect] });
  plat.position.z = (z + 4.5) * MM;
  g.add(plat);
  // Patte repliée vers le flanc du pied, vissée.
  const [xa0, ya] = ip(650, 872), [xa1] = ip(740, 0);
  g.add(S.box((xa1 - xa0) * MM, 1.8 * MM, 4 * MM, 'zinc', { pos: P((xa0 + xa1) / 2, ya, z + 2.4) }));
  g.add(S.box((xa1 - xa0) * MM, 10 * MM, 1.6 * MM, 'zinc', { pos: P((xa0 + xa1) / 2, ya - 5, z + 0.6) }));
  return g;
}
/** Repère 38 : vis 6-32 × 5/16 po à tête cylindrique T-15 de l'agrafe. */
function visAgrafe(S) {
  const [x, y] = AGRAFE.vis;
  const z = demiLargeur(x, y) + 4.5 + 0.9;
  return S.group(
    S.cyl(2.9 * MM, 2.2 * MM, 'blackOxide', { axis: 'z', pos: P(x, y, z + 1.1), seg: 16 }),
    S.cyl(1.7 * MM, 7.9 * MM, 'blackOxide', { axis: 'z', pos: P(x, y, z - 3.9), seg: 10 }),
  );
}

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  const S = api.S;
  const vus = new Set();
  // Pose : repère de l'outil relevé pour que le bas de l'agrafe touche le sol.
  const put = (ref, obj, explode) => {
    const g = S.group(obj);
    g.position.y = AXE * MM;
    api.part(ref, g, explode, { noLabel: vus.has(ref) });
    vus.add(ref);
  };

  // Nez : de l'avant vers l'arrière, dans l'ordre de la vue éclatée.
  put('1', jonc(S), [-0.2, 0, 0]);
  put('2', rondelle(S), [-0.185, 0, 0]);
  put('3', ressortManchon(S), [-0.168, 0, 0]);
  put('4', manchon(S), [-0.148, 0, 0]);
  put('54', carterEngrenages(S), [-0.105, 0, 0]);
  put('8', rondelleNylon(S), [-0.078, 0, 0]);
  put('10', enclume(S), [-0.064, 0, 0]);
  for (const s of [1, -1]) put('9', billeEnclume(S, s), [-0.064, s * 0.018, 0]);
  put('11', billeCentre(S), [-0.05, 0, 0]);
  for (const s of [1, -1]) put('16', billeCame(S, s), [-0.04, 0.028, s * 0.012]);
  put('58', mecanisme(S), [-0.03, 0, 0]);
  put('22', couronne(S), [-0.016, 0, 0]);
  put('80', torique(S), [-0.006, 0, 0]);
  put('24', couvercle(S), [0, 0, 0]);
  // Moteur.
  put('59', induit(S), [0.012, 0, 0]);
  put('26', inducteur(S), [0.012, 0.075, 0]);
  put('31', porteBalais(S), [0.04, 0, 0]);
  for (let i = 0; i < 4; i++) put(i % 2 ? '74' : '73', ressortBalai(S, [0, 2, 1, 3][i]), [0.055, 0, 0]);
  for (const cote of [1, -1]) {
    put('32', rondelleBorne(S, cote), [0.068, -0.01, cote * 0.012]);
    put('33', visBorne(S, cote), [0.078, -0.01, cote * 0.012]);
  }
  put('72', filBalai(S, 1), [0.04, 0, 0.02]);
  put('71', filBalai(S, -1), [0.04, 0, -0.02]);
  // Commande et électronique.
  put('40', inverseur(S), [0, 0.03, 0]);
  put('57', electronique(S), [0, -0.05, 0]);
  put('34', ressortBornier(S), [0, -0.075, 0]);
  // Boîtier.
  put('35', demiCoque(1), [0, 0, 0.09]);
  put('49', demiCoque(-1), [0, 0, -0.09]);
  for (const cote of [1, -1]) for (const [x, y] of PATINS) put('25', patin(S, x, y, cote), [0, 0, cote * 0.055]);
  put('48', plaqueService(S), [0, 0, -0.13]);
  for (const [u, v] of VIS50) put('50', visCoque(S, u, v, 3, 16), [0, 0, -0.15]);
  put('62', visCoque(S, ...VIS62, 2.9, 19), [0, 0, -0.15]);
  put('37', agrafe(S), [0, 0, 0.14]);
  put('38', visAgrafe(S), [0, 0, 0.17]);

  // Vue de la photo P04 : de trois quarts avant, du côté du flanc gauche (+Z) ; coupe dans le plan de joint.
  return { view: { dir: [-0.75, 0.35, 1], section: { axis: 'z', pos: 0.5 } } };
}

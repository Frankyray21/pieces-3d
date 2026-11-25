// Boîte à lunch de mineur en tôle d'acier galvanisé, d'après une photo du
// client (P01) : vue de face, cotes hors tout écrites sur la photo,
// 12 po de long × 4 1/2 po de large × 7 1/4 po de haut. Logo « Canada Tuff »
// en filigrane sur la photo. Aucun plan.
//
// Relevé sur la photo (vue de face, environ 1,83 pixel par millimètre, échelle
// tirée des 12 po de long) : hauteur du caisson et de la jupe du couvercle,
// hauteur du pan incliné, poignée (pieds, montée, barre du haut), pattes de
// poignée, place et taille des deux fermoirs, deux rivets sur la jupe du
// couvercle. Supposé (ne se voit pas sur la photo) : la largeur du dessus plat
// du couvercle, l'épaisseur de la tôle, la charnière du dos, le dedans.
//
// Repère, en millimètres : y vers le haut (0 sous le caisson), x le long de la
// boîte (vers la droite de la photo), z vers l'observateur (face avant à
// +P/2). Modèle en mètres.
import * as THREE from 'three';
import { withFinish } from '../../viewer/materials.js';
import { creaseNormals } from '../../viewer/shapes.js';

const MM = 0.001;
export const IN = 25.4;

// ------------------------------------------------------------------ cotes (mm)

/** Hors tout, écrit sur la photo : 12" L × 4 1/2" W × 7 1/4" H (sans la poignée). */
export const BOITE = { L: 12 * IN, P: 4.5 * IN, H: 7.25 * IN };
/** Tôle d'acier galvanisé : épaisseur supposée (calibre 24) ; pli des arêtes. */
export const TOLE = { ep: 0.6, pli: 2.5 };
/** Caisson (bas) : hauteur relevée sur la photo, jusqu'au joint du couvercle. */
export const CAISSON = { haut: 78 };
/** Jeu au joint entre le caisson et le couvercle. */
export const JEU = 0.5;
/** Couvercle : jupe droite (relevée), dessus plat (largeur supposée) ; pans inclinés devant et derrière. */
export const COUVERCLE = { jupe: 64, dessus: 50 };
/** Poignée : tige chromée ; pieds dans les pattes, montée, barre du haut (relevés). */
export const POIGNEE = { d: 8, pied: 82, montee: 57, barre: 39, haut: 40, axe: 5, pli: 9 };
/** Pattes de poignée : centre (±x), longueur le long de la boîte, largeur, épaisseur. */
export const PATTE = { x: 73, long: 18, large: 22, ep: 0.9 };
/** Fermoirs : centre (±x), largeur des platines, hauteur de la gâche et de la platine du bas, épaisseur. */
export const FERMOIR = { x: 95, large: 36, gache: 23, platine: 34, levier: 41, ep: 1 };
/** Rivets de la jupe du couvercle (fonction non visible) : ±x, hauteur depuis le dessous, Ø. */
export const RIVET = { x: 84.5, y: 102, d: 3 };
/** Charnière continue au dos : longueur, Ø du nœud, hauteur de chaque aile (supposées). */
export const CHARNIERE = { long: 250, d: 5, aile: 12, ep: 0.8 };

/** Hauteur du couvercle, du joint au dessus. */
export const hautCouvercle = () => BOITE.H - CAISSON.haut - JEU;
/** Pan incliné : montée, avancée, angle sur l'horizontale (degrés). */
export function pan() {
  const montee = hautCouvercle() - COUVERCLE.jupe, avancee = (BOITE.P - COUVERCLE.dessus) / 2;
  return { montee, avancee, angle: (Math.atan2(montee, avancee) * 180) / Math.PI };
}
/** Volume intérieur (litres) : caisson et couvercle. */
export function volume() {
  const t = TOLE.ep, L = BOITE.L - 2 * t, P = BOITE.P - 2 * t, p = pan();
  const caisson = L * P * (CAISSON.haut - t);
  const couv = L * (P * (COUVERCLE.jupe) + ((P + COUVERCLE.dessus - 2 * t) / 2) * (p.montee - t));
  return { caisson: caisson / 1e6, couvercle: couv / 1e6, total: (caisson + couv) / 1e6 };
}
/** Hauteur hors tout avec la poignée levée. */
export const hautAvecPoignee = () => BOITE.H + POIGNEE.haut + POIGNEE.d / 2;

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

/** Tôle d'acier galvanisé : gris clair satiné, à peine bleuté. */
const galva = () => teinte('lunch-galva', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0xd3d7db, metalness: 0.5, roughness: 0.5,
}), 'paintSatin', { tint: 0.05 }));
/** Quincaillerie nickelée (fermoirs, rivets, pattes) : gris chaud, poli. */
const nickel = () => teinte('lunch-nickel', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0xd6d2c6, metalness: 0.75, roughness: 0.3,
}), 'machined'));

// ------------------------------------------------------------------ profils 2D

/** Arrondit les sommets intérieurs d'une ligne brisée [[a, b], ...] (rayon r). */
function arrondir(pts, r, n = 5, ferme = false) {
  const out = [], N = pts.length;
  for (let i = 0; i < N; i++) {
    const p = pts[i];
    if (!ferme && (i === 0 || i === N - 1)) { out.push(p); continue; }
    const a = pts[(i - 1 + N) % N], b = pts[(i + 1) % N];
    const u = [a[0] - p[0], a[1] - p[1]], v = [b[0] - p[0], b[1] - p[1]];
    const lu = Math.hypot(...u), lv = Math.hypot(...v);
    const ang = Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (lu * lv))));
    const d = Math.min(r / Math.tan(ang / 2), lu * 0.45, lv * 0.45);
    const p0 = [p[0] + (u[0] / lu) * d, p[1] + (u[1] / lu) * d], p1 = [p[0] + (v[0] / lv) * d, p[1] + (v[1] / lv) * d];
    // Courbe de Bézier quadratique entre les deux points de tangence.
    for (let k = 0; k <= n; k++) {
      const t = k / n, s = 1 - t;
      out.push([s * s * p0[0] + 2 * s * t * p[0] + t * t * p1[0], s * s * p0[1] + 2 * s * t * p[1] + t * t * p1[1]]);
    }
  }
  return out;
}

/** Donne une épaisseur t à une ligne brisée ouverte : polygone fermé, épaisseur du côté de `vers`. */
function epaissir(pts, t, vers) {
  const N = pts.length, nrm = [];
  for (let i = 0; i < N - 1; i++) {
    const dx = pts[i + 1][0] - pts[i][0], dy = pts[i + 1][1] - pts[i][1], l = Math.hypot(dx, dy);
    nrm.push([-dy / l, dx / l]);
  }
  // Côté : la normale du premier segment pointe-t-elle vers `vers` ?
  const m = [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2];
  const s = Math.sign((vers[0] - m[0]) * nrm[0][0] + (vers[1] - m[1]) * nrm[0][1]) || 1;
  const dedans = pts.map((p, i) => {
    const n1 = nrm[Math.max(0, i - 1)], n2 = nrm[Math.min(N - 2, i)];
    let nx = n1[0] + n2[0], ny = n1[1] + n2[1];
    const l = Math.hypot(nx, ny);
    nx /= l; ny /= l;
    const k = (s * t) / Math.max(0.3, nx * n1[0] + ny * n1[1]);
    return [p[0] + nx * k, p[1] + ny * k];
  });
  return [...pts, ...dedans.reverse()];
}

/** Extrusion d'un contour [[x, y], ...] (mm) sur `ep` mm selon z, sans chanfrein (tôle mince). */
function prisme(contour, ep, material, trous = []) {
  const forme = new THREE.Shape(contour.map(([x, y]) => new THREE.Vector2(x * MM, y * MM)));
  for (const h of trous) forme.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x * MM, y * MM))));
  const geo = new THREE.ExtrudeGeometry(forme, { depth: ep * MM, bevelEnabled: false, curveSegments: 12 });
  return new THREE.Mesh(creaseNormals(geo, 0.6), material);
}

/**
 * Coque de tôle : section [[z, y], ...] (ligne brisée ouverte, côté extérieur)
 * repliée et tirée sur toute la longueur L de la boîte, fermée aux deux bouts
 * par des flancs de la forme de la section.
 */
function coque(section, centre) {
  const t = TOLE.ep, L = BOITE.L;
  const ext = arrondir(section, TOLE.pli);
  // Le profil est dessiné en (−z, y) : après rotation d'un quart de tour autour
  // de y, l'extrusion (z local) suit +x et −z local redevient +z.
  const vers2d = ([z, y]) => [-z, y];
  const paroi = prisme(epaissir(ext, t, centre).map(vers2d), L - 2 * t, galva());
  paroi.rotation.y = Math.PI / 2;
  paroi.position.x = -L / 2 * MM + t * MM;
  const g = new THREE.Group().add(paroi);
  for (const s of [-1, 1]) {
    const flanc = prisme(ext.map(vers2d), t, galva());
    flanc.rotation.y = Math.PI / 2;
    flanc.position.x = (s < 0 ? -L / 2 : L / 2 - t) * MM;
    g.add(flanc);
  }
  g.userData.hasInterior = true;
  return g;
}

/** Tête de rivet bombée, posée sur une face de normale +z (ou autre axe). */
function rivet(S, d, h, pos, axis = 'z', material = nickel()) {
  const r = d / 2;
  const prof = [[0, 0], [r, 0], [r * 0.92, h * 0.45], [r * 0.62, h * 0.85], [0, h]].map(([a, b]) => [a * MM, b * MM]);
  return S.lathe(prof, material, { axis, seg: 16, pos: pos.map((v) => v * MM) });
}

// ------------------------------------------------------------------ pièces

/** Repère 1 : caisson (bas de la boîte), fond et quatre côtés d'une pièce. */
function caisson() {
  const { P } = BOITE, H = CAISSON.haut;
  return coque([[P / 2, H], [P / 2, 0], [-P / 2, 0], [-P / 2, H]], [0, H / 2]);
}

/** Repère 2 : couvercle — jupe droite, pans inclinés devant et derrière, dessus plat ; flancs en pentagone. */
function couvercle() {
  const { P } = BOITE, j = COUVERCLE.jupe, h = hautCouvercle(), w = COUVERCLE.dessus / 2;
  const g = coque([[P / 2, 0], [P / 2, j], [w, h], [-w, h], [-P / 2, j], [-P / 2, 0]], [0, j / 2]);
  return g;
}

/** Repère 3 : poignée, tige chromée cintrée ; ses bouts couchés tournent dans les pattes. */
function poignee(S, yDessus) {
  const Q = POIGNEE;
  const brisee = [[-Q.pied, Q.axe], [-Q.montee, Q.axe], [-Q.barre, Q.haut], [Q.barre, Q.haut], [Q.montee, Q.axe], [Q.pied, Q.axe]];
  const pts = arrondir(brisee, Q.pli, 8).map(([x, y]) => [x * MM, (yDessus + y) * MM, 0]);
  const m = S.tube(pts, (Q.d / 2) * MM, 'chrome', { sharp: true, radial: 18, ends: 'none' });
  const g = new THREE.Group().add(m);
  // Bouts arrondis de la tige.
  for (const s of [-1, 1]) g.add(S.lathe([[0, 0], [Q.d / 2, 0], [Q.d / 2 * 0.7, 1.6], [0, 2.4]].map(([a, b]) => [a * MM, b * MM]), 'chrome', { axis: s < 0 ? '-x' : 'x', seg: 18, pos: [s * Q.pied * MM, (yDessus + Q.axe) * MM, 0] }));
  return g;
}

/** Repère 4 : patte de poignée — feuillard nickelé en selle sur la tige, deux rivets sur le dessus du couvercle. */
function patte(S, x, yDessus) {
  const P = PATTE, r = POIGNEE.d / 2 + 0.3, yc = POIGNEE.axe;
  const arc = [];
  for (let k = 0; k <= 10; k++) { const a = Math.PI - (k / 10) * Math.PI; arc.push([r * Math.cos(a), yc + r * Math.sin(a)]); }
  const ligne = [[-P.large / 2, 0], [-r, 0], [-r, yc], ...arc.slice(1, -1), [r, yc], [r, 0], [P.large / 2, 0]];
  // Profil dessiné en (−z, y), tiré sur la longueur de la patte le long de x.
  const m = prisme(epaissir(ligne, P.ep, [0, 30]).map(([z, y]) => [-z, y]), P.long, nickel());
  m.rotation.y = Math.PI / 2;
  m.position.set((x - P.long / 2) * MM, yDessus * MM, 0);
  const g = new THREE.Group().add(m);
  for (const s of [-1, 1]) g.add(rivet(S, 4, 1.3, [x, yDessus + P.ep, s * (P.large / 2 - 3.5)], 'y'));
  return g;
}

/** Repère 5 : charnière continue au dos (supposée : le dos ne se voit pas sur la photo). */
function charniere(S) {
  const C = CHARNIERE, z = -BOITE.P / 2, y = CAISSON.haut + JEU / 2;
  const g = new THREE.Group();
  g.add(S.cyl((C.d / 2) * MM, C.long * MM, nickel(), { axis: 'x', pos: [0, y * MM, (z - C.d / 2) * MM], seg: 16 }));
  for (const s of [-1, 1]) {
    const aile = S.box(C.long * MM, C.aile * MM, C.ep * MM, nickel(), { pos: [0, (y + s * (C.aile / 2 + 0.6)) * MM, (z - C.ep / 2) * MM] });
    g.add(aile);
    for (let i = 0; i < 5; i++) g.add(rivet(S, 3.5, 1, [-C.long / 2 + 15 + (i * (C.long - 30)) / 4, y + s * (C.aile / 2 + 0.6), z - C.ep], '-z'));
  }
  return g;
}

/** Contour d'une platine de fermoir (en x, y ; y = 0 au joint, sens s = +1 vers le haut). */
function contourPlatine(haut, s, pointe) {
  const w = FERMOIR.large / 2;
  const brut = [[-w, 0.6], [w, 0.6], [w, haut * 0.42], [w * 0.72, haut * 0.74], [w * 0.3, haut * 0.97], [0, haut * (pointe ? 1 : 0.99)], [-w * 0.3, haut * 0.97], [-w * 0.72, haut * 0.74], [-w, haut * 0.42]];
  return arrondir(brut, 3, 4, true).map(([x, y]) => [x, s * y]);
}

/** Repère 6 : fermoir à levier (sur le caisson) — platine, levier à bout relevé, boucle de fil qui prend la gâche. */
function fermoir(S, x) {
  const F = FERMOIR, z0 = BOITE.P / 2, y0 = CAISSON.haut;
  const g = new THREE.Group();
  const pl = prisme(contourPlatine(F.platine, -1, false).reverse(), F.ep, nickel());
  pl.position.set(x * MM, y0 * MM, z0 * MM);
  g.add(pl);
  for (const s of [-1, 1]) g.add(rivet(S, 5, 1.4, [x + s * 12, y0 - 7, z0 + F.ep]));
  // Charnière du levier, sous le joint.
  g.add(S.cyl(2.2 * MM, 15 * MM, nickel(), { axis: 'x', pos: [x * MM, (y0 - 5) * MM, (z0 + F.ep + 2.2) * MM], seg: 14 }));
  // Levier : langue qui s'amincit vers le bas, écartée de la platine en bas, bout relevé.
  const lev = prisme(arrondir([[-7, 0], [7, 0], [6, -32], [4.5, -F.levier + 4], [-4.5, -F.levier + 4], [-6, -32]], 3, 4, true), 1.2, nickel());
  lev.position.set(x * MM, (y0 - 4) * MM, (z0 + F.ep + 3.4) * MM);
  lev.rotation.x = -0.09; // le bas s'écarte de la platine
  g.add(lev);
  const bout = S.box(9 * MM, 1.2 * MM, 5 * MM, nickel(), { r: 0.0005 });
  bout.position.set(x * MM, (y0 - F.levier - 0.5) * MM, (z0 + F.ep + 7.6) * MM);
  bout.rotation.x = -0.9;
  g.add(bout);
  // Boucle de fil : du levier jusque par-dessus le crochet de la gâche.
  const boucle = arrondir([[-8.5, -14], [8.5, -14], [8.5, 9], [-8.5, 9]], 3, 5, true).map(([bx, by]) => [(x + bx) * MM, (y0 + by) * MM, (z0 + F.ep + 4.6) * MM]);
  g.add(S.tube([...boucle, boucle[0]], 1.1 * MM, nickel(), { sharp: true, radial: 8 }));
  return g;
}

/** Repère 7 : gâche (sur le couvercle) — platine en ogive, crochet embouti, deux rivets. */
function gache(S, x) {
  const F = FERMOIR, z0 = BOITE.P / 2, y0 = CAISSON.haut + JEU;
  const g = new THREE.Group();
  const pl = prisme(contourPlatine(F.gache, 1, true), F.ep, nickel());
  pl.position.set(x * MM, y0 * MM, z0 * MM);
  g.add(pl);
  for (const s of [-1, 1]) g.add(rivet(S, 5, 1.4, [x + s * 12, y0 + 10, z0 + F.ep]));
  // Crochet : bosse emboutie où s'accroche la boucle.
  const crochet = S.box(11 * MM, 7 * MM, 4.2 * MM, nickel(), { r: 0.0018 });
  crochet.position.set(x * MM, (y0 + 5.5) * MM, (z0 + F.ep + 1.6) * MM);
  g.add(crochet);
  return g;
}

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  const { S } = api;
  const yc = CAISSON.haut + JEU, yDessus = yc + hautCouvercle();
  const z0 = BOITE.P / 2;

  api.part('1', caisson(), [0, 0, 0], { labelAt: [(-BOITE.L / 2 + 40) * MM, 35 * MM, z0 * MM] });
  const c = couvercle();
  c.position.y = yc * MM;
  api.part('2', c, [0, 0.12, 0], { labelAt: [0, (yc + 30) * MM, z0 * MM] });
  api.part('3', poignee(S, yDessus), [0, 0.2, 0], { labelAt: [0, (yDessus + POIGNEE.haut) * MM, 0] });
  for (const s of [-1, 1]) api.part('4', patte(S, s * PATTE.x, yDessus), [0, 0.16, 0], { labelAt: [s * PATTE.x * MM, (yDessus + 9) * MM, 0] });
  api.part('5', charniere(S), [0, 0.06, -0.07], { labelAt: [(BOITE.L / 2 - 50) * MM, yc * MM, -z0 * MM] });
  for (const s of [-1, 1]) {
    api.part('6', fermoir(S, s * FERMOIR.x), [0, 0, 0.07], { labelAt: [s * FERMOIR.x * MM, (CAISSON.haut - 30) * MM, (z0 + 8) * MM] });
    api.part('7', gache(S, s * FERMOIR.x), [0, 0.12, 0.07], { labelAt: [s * FERMOIR.x * MM, (yc + 18) * MM, (z0 + 3) * MM] });
  }
  for (const s of [-1, 1]) api.part('8', rivet(S, RIVET.d, 1, [s * RIVET.x, RIVET.y, z0]), [0, 0.12, 0.05]);
  // Vue de la photo : de face, un peu au-dessus. Coupe proposée : en travers, par le milieu de la boîte.
  return { view: { dir: [0.32, 0.36, 0.88], section: { axis: 'x', pos: 0.5 } } };
}

export default { P01 };

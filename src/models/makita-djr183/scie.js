// Scie alternative sans fil Makita DJR183Z (18 V LXT, outil seul) :
// reconstitution d'après deux images du produit, sans plan ni cote.
//   P01 : photo du produit (vue de trois quarts avant, sans batterie) ;
//   P02 : vue de côté d'une scie de même forme, avec batterie (vignette coupée
//         en bas) : c'est elle qui donne le profil.
//
// Données publiées par Makita, reprises telles quelles : longueur hors tout de
// 398 mm (15 5/8 po), course de 13 mm (1/2 po), 0 à 3 000 courses/min,
// capacité de 50 mm (tuyau et bois), 18 V. Tout le reste est estimé : le
// profil est relevé sur la vue de côté P02, mise à l'échelle pour que la
// batterie (non modélisée) finisse à 398 mm du patin. Précision : environ 15 %.
//
// Repère de l'outil, en millimètres : X du patin (x = 0, face avant) vers
// l'arrière, Y vers le haut depuis l'axe du coulisseau, Z vers le flanc de la
// photo ; z = 0 est le plan de symétrie. Modèle : outil en position de travail,
// lame vers −X, point le plus bas (avant de l'embase) à Y = 0, en mètres.
// Les scènes de sciage (sciage.js, decoupe.js) reprennent cet assemblage et l'animent.
import * as THREE from 'three';
import { mat, withFinish } from '../../viewer/materials.js';
import { creaseNormals } from '../../viewer/shapes.js';

const MM = 0.001;
const RAD = Math.PI / 180;
const P = (x, y, z = 0) => [x * MM, y * MM, z * MM];

// ------------------------------------------------------------------ données publiées

export const PUBLIE = { longueur: 398, course: 13, cadence: 3000, capacite: 50, tension: 18 };

// ------------------------------------------------------------------ cotes (mm, estimées)

// Coques : sections de contrôle [x haut, y haut, x bas, y bas, largeur, exposant
// de la super-ellipse], relevées sur le contour de la vue de côté.
const NEZ = [
  [42, 43, 28, -43, 46, 5], // capot avant et mâchoire du bas, face inclinée
  [50, 43.5, 38, -42, 47, 5],
  [56, 41, 50, -37, 48.5, 4.6],
  [62, 35.5, 60, -32.5, 50.5, 4],
  [69, 30, 70, -31.5, 52.5, 3.6],
  [82, 29, 80, -31.5, 55.5, 3.4],
  [101, 29, 87, -32, 58, 3.3],
  [119, 29.5, 91, -33, 60, 3.2], // joint incliné avec le carter
];
const CARTER = [
  [119, 29.5, 91, -33, 60, 3.2],
  [127, 31, 101, -39.5, 62.5, 3.2],
  [138, 31, 116, -42.5, 64, 3.2],
  [150, 27.5, 140, -43, 64, 3.2],
  [165, 25.5, 163, -42.5, 64, 3.2],
  [186, 24, 185, -42, 64, 3.2],
  [210, 23, 210, -42, 64, 3.2],
  [236, 23, 236, -42, 64, 3.2],
];
// Poignée et corps noir de l'embase, d'un seul tenant : les sections tournent
// de la verticale (joint avec le carter) au plan de l'embase.
const POIGNEE = [
  [236, 23, 236, -42, 64, 3.2],
  [250, 23, 245, -45, 60, 3.1],
  [262, 22.5, 253, -49.5, 54, 3.0],
  [270, 18.5, 260, -53.5, 49, 2.9],
  [276, 12, 267, -57, 45, 2.8],
  [281, 4, 274, -59, 42, 2.7],
  [289, -6, 281, -60, 40, 2.6],
  [299, -15.5, 288, -63, 38.5, 2.6],
  [311, -25.5, 295, -67.5, 38, 2.6],
  [323, -37, 300.5, -71.5, 38, 2.6],
  [335, -50.5, 305, -75, 39.5, 2.7],
  [346, -62, 308.5, -78, 43, 2.9], // bas de la prise
  [355, -65.5, 303, -83.5, 54, 3.4],
  [362, -69, 294.5, -89.5, 66, 4.2],
  [367.9, -72.4, 285.3, -94.5, 75, 5.5], // dessus du corps de l'embase
  [373.9, -83.2, 286.9, -106.5, 76, 6], // dessous, plan de la jupe
];
const LEVIER = [
  [113, -38, 112, -44, 16, 3],
  [117, -38, 116.5, -47.5, 23, 4],
  [124, -38, 124, -49, 26, 4],
  [160, -38, 160, -49, 26, 4],
  [185, -38, 185, -47.5, 26, 4],
  [196, -38, 196, -46, 25, 4],
  [201, -38, 201, -46.5, 28, 4],
  [206, -38, 206, -52, 31, 4],
  [216, -38, 216, -53, 32, 4],
  [224, -38, 224, -50, 32, 4],
  [229, -38, 229, -44.5, 29, 3.5],
];

export const LAME = { long: 152, haut: 19, ep: 0.9, soie: 12.7, x1: 26, pas: 4.2, dent: 2.2 }; // lame de 6 po à soie universelle de 1/2 po (supposée)
export const PATIN = { haut: 86, large: 46, ep: 2.5, rebord: 4.5, ouvH: 62, ouvL: 34 };
const PIED_PATIN = { x0: 3, x1: 52, y0: -40, y1: -24, large: 20 };
export const MANCHON = { x0: 10, x1: 26, r: 15, col: 9.5, xCol: 34 }; // manchon, puis col arrière plus étroit
const ERGOT = { x: 19, y: 19, long: 11, haut: 10, large: 9 };
const COULISSEAU = { x0: 34, x1: 66, r: 6.5 };
const CREUX = { echelle: 0.8, fond: 12 }; // face avant du nez, en creux
const BOULON = { x: 44, y: -39.5, r: 4.25, tete: 5 };
const LAMPE = { x: 44.4, y: -15, r: 2.6 };
const FENETRE = { x0: 60, x1: 75.5, y0: -13, y1: 2.4 }; // carré turquoise du flanc du nez
const PLAQUE = { x0: 160, x1: 236, y0: -18, y1: 0.5, cadreX: 145.2, cadreY0: -26.3, cadreY1: 9.3, bras: 206 };
// Ouïes d'aération d'un flanc : [x, y, colonnes, rangées, long, haut, pas x, pas y].
const OUIES_CARTER = [
  [135.5, 0.5, 4, 3, 2.6, 1.1, 3.4, 2.3],
  [135.5, -19, 4, 3, 2.6, 1.1, 3.4, 2.3],
  [214, 6.5, 4, 1, 1.1, 3.2, 2.6, 0],
  [212, -24.4, 3, 1, 1.1, 3.2, 2.6, 0],
  [232.5, -9.5, 1, 3, 1.4, 1.4, 0, 5],
];
const OUIES_POIGNEE = [[244.5, 10.5, 4, 2, 2.6, 1.1, 3.4, 2.4]];
const BERCEAU = { x0: 204, x1: 222, a0: 124, a1: 236, ep: 1.8 }; // articulation du levier, qui remonte sur les flancs
const SECURITE = { x: 131, y: -50, long: 30, haut: 3.2, large: 9 };
const CHAPEAU = { x0: 208, x1: 236, a: 58, ep: 1.8 }; // dessus noir du carter, devant la poignée
const SEMELLE = { x1: 270, y1: -57.5, a0: 131, a1: 229, ep: 0.9 }; // dessous turquoise de la poignée
const FLECHE = { a: [290, -25], b: [331, -69] }; // bande turquoise du flanc de la poignée
const GACHETTE = { x: 251, y: -49.6, long: 17, haut: 8, large: 12, angle: -28 };
const BOUTON = { x: 241, y: -25, r: 4.5, saillie: 2.5 };
// Embase : plan incliné de 15° (arrière relevé), origine à l'avant ; au-dessus,
// le corps noir (fin de la coque de la poignée) ; en dessous, la jupe turquoise.
export const EMBASE = { x: 285, y: -107, angle: 15, long: 92, large: 76, jupe: 9, paroi: 6 };

/** Hauteur de l'axe du coulisseau au-dessus du point le plus bas de l'outil (avant de la jupe). */
export const AXE = -EMBASE.y + EMBASE.jupe * Math.cos(EMBASE.angle * RAD);

// ------------------------------------------------------------------ outils

/** Triangles orientés vers l'extérieur (volume signé positif), en place. */
export function oriente(t) {
  let vol = 0;
  for (let i = 0; i < t.length; i += 9) {
    vol += t[i] * (t[i + 4] * t[i + 8] - t[i + 5] * t[i + 7])
      - t[i + 1] * (t[i + 3] * t[i + 8] - t[i + 5] * t[i + 6])
      + t[i + 2] * (t[i + 3] * t[i + 7] - t[i + 4] * t[i + 6]);
  }
  if (vol < 0) for (let i = 0; i < t.length; i += 9) for (let k = 0; k < 3; k++) { const v = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = v; }
  return t;
}

/** Géométrie (mètres) d'une liste de triangles en millimètres ; arêtes de moins de 32° lissées. */
export function geometrie(t, angle = 32) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(t.map((v) => v * MM), 3));
  return creaseNormals(geo, angle * RAD);
}

/** Point de la section sec à l'angle th (0 = haut, 90° = flanc +Z), décalé de off vers l'extérieur. */
function pointSection(sec, th, off = 0) {
  const [xh, yh, xb, yb, w, e] = sec;
  let dx = xh - xb, dy = yh - yb;
  const L = Math.hypot(dx, dy);
  dx /= L; dy /= L;
  const c = Math.cos(th), s = Math.sin(th);
  const r = (Math.abs(c) ** e + Math.abs(s) ** e) ** (-1 / e);
  const u = r * c * (L / 2 + off);
  return [(xh + xb) / 2 + dx * u, (yh + yb) / 2 + dy * u, r * s * (w / 2 + off)];
}

/**
 * Coque profilée : sections de contrôle interpolées en douceur (Catmull-Rom),
 * k sections par intervalle, n points par section.
 */
function corps(ctrl, { k = 4, n = 56 } = {}) {
  const cr = (a, b, c, d, t) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
  const secs = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p = [ctrl[Math.max(0, i - 1)], ctrl[i], ctrl[i + 1], ctrl[Math.min(ctrl.length - 1, i + 2)]];
    for (let j = 0; j < k; j++) secs.push(ctrl[i].map((_, c) => cr(p[0][c], p[1][c], p[2][c], p[3][c], j / k)));
  }
  secs.push([...ctrl[ctrl.length - 1]]);
  /** Section à l'indice fractionnaire s. */
  const en = (s) => {
    const i = Math.max(0, Math.min(secs.length - 2, Math.floor(s))), t = s - i;
    return secs[i].map((v, c) => v + (secs[i + 1][c] - v) * t);
  };
  const cote = (sec, x, y) => (x - sec[2]) * (sec[1] - sec[3]) - (y - sec[3]) * (sec[0] - sec[2]);
  /** Indice fractionnaire de la section dont la droite haut-bas passe par (x, y). */
  const indice = (x, y) => {
    for (let i = 0; i < secs.length - 1; i++) {
      const a = cote(secs[i], x, y), b = cote(secs[i + 1], x, y);
      if (a === 0) return i;
      if (a * b <= 0) {
        let t0 = 0, t1 = 1;
        for (let q = 0; q < 24; q++) {
          const tm = (t0 + t1) / 2;
          if (cote(en(i + tm), x, y) * a > 0) t0 = tm; else t1 = tm;
        }
        return i + (t0 + t1) / 2;
      }
    }
    throw new Error(`Point (${x}, ${y}) hors de la coque`);
  };
  /** Demi-largeur de la coque (z du flanc) au point (x, y) de la vue de côté. */
  const z = (x, y) => {
    const sec = en(indice(x, y));
    const dx = sec[0] - sec[2], dy = sec[1] - sec[3];
    const u = (2 * ((x - sec[2]) * dx + (y - sec[3]) * dy)) / (dx * dx + dy * dy) - 1;
    if (Math.abs(u) >= 1) throw new Error(`Point (${x}, ${y}) hors du contour de la coque`);
    return (sec[4] / 2) * (1 - Math.abs(u) ** sec[5]) ** (1 / sec[5]);
  };
  return { secs, n, en, indice, z };
}

/** Volume fermé d'une coque ; creux : face avant en retrait (rebord, parois en pente, fond). */
function volume(c, { creux = null } = {}) {
  const { secs, n } = c;
  const rings = secs.map((sec) => Array.from({ length: n }, (_, j) => pointSection(sec, (j / n) * 2 * Math.PI)));
  const t = [];
  const tri = (a, b, d) => t.push(...a, ...b, ...d);
  const entre = (A, B) => {
    for (let j = 0; j < n; j++) {
      const q = (j + 1) % n;
      tri(A[j], A[q], B[q]);
      tri(A[j], B[q], B[j]);
    }
  };
  const centre = (ring) => ring.reduce((s, p) => [s[0] + p[0] / n, s[1] + p[1] / n, s[2] + p[2] / n], [0, 0, 0]);
  const bouche = (ring, debut) => {
    const o = centre(ring);
    for (let j = 0; j < n; j++) {
      const q = (j + 1) % n;
      if (debut) tri(o, ring[q], ring[j]); else tri(o, ring[j], ring[q]);
    }
  };
  for (let i = 0; i < rings.length - 1; i++) entre(rings[i], rings[i + 1]);
  let premier = rings[0];
  if (creux) {
    // Fond du creux : contour réduit autour du centre, reculé le long de la normale au plan de la face.
    const o = centre(premier), o1 = centre(rings[1]);
    const dx = secs[0][0] - secs[0][2], dy = secs[0][1] - secs[0][3], L = Math.hypot(dx, dy);
    let nx = dy / L, ny = -dx / L;
    if (nx * (o1[0] - o[0]) + ny * (o1[1] - o[1]) < 0) { nx = -nx; ny = -ny; }
    const fond = premier.map((p) => [
      o[0] + (p[0] - o[0]) * creux.echelle + nx * creux.fond,
      o[1] + (p[1] - o[1]) * creux.echelle + ny * creux.fond,
      p[2] * creux.echelle,
    ]);
    entre(fond, premier);
    premier = fond;
  }
  bouche(premier, true);
  bouche(rings[rings.length - 1], false);
  return geometrie(oriente(t));
}

/**
 * Bande en relief sur une coque : de l'indice s0 à s1, de l'angle a0 à a1
 * (degrés), en saillie de ep ; volume fermé, légèrement engagé dans la coque.
 */
function bande(c, s0, s1, a0, a1, ep, { na = 20, engage = 0.6 } = {}) {
  const ns = Math.max(2, Math.ceil((s1 - s0) * 1.5));
  const grille = (off) => Array.from({ length: ns + 1 }, (_, i) => Array.from({ length: na + 1 }, (_, j) =>
    pointSection(c.en(s0 + ((s1 - s0) * i) / ns), (a0 + ((a1 - a0) * j) / na) * RAD, off)));
  const H = grille(ep), B = grille(-engage);
  const t = [];
  const tri = (a, b, d) => t.push(...a, ...b, ...d);
  for (let i = 0; i < ns; i++) for (let j = 0; j < na; j++) {
    tri(H[i][j], H[i][j + 1], H[i + 1][j + 1]); tri(H[i][j], H[i + 1][j + 1], H[i + 1][j]);
    tri(B[i][j], B[i + 1][j + 1], B[i][j + 1]); tri(B[i][j], B[i + 1][j], B[i + 1][j + 1]);
  }
  for (let i = 0; i < ns; i++) {
    tri(B[i][0], H[i][0], H[i + 1][0]); tri(B[i][0], H[i + 1][0], B[i + 1][0]);
    tri(B[i][na], B[i + 1][na], H[i + 1][na]); tri(B[i][na], H[i + 1][na], H[i][na]);
  }
  for (let j = 0; j < na; j++) {
    tri(B[0][j], B[0][j + 1], H[0][j + 1]); tri(B[0][j], H[0][j + 1], H[0][j]);
    tri(B[ns][j], H[ns][j], H[ns][j + 1]); tri(B[ns][j], H[ns][j + 1], B[ns][j + 1]);
  }
  return geometrie(oriente(t));
}

/**
 * Triangles (mm) d'un relief posé sur un flanc de coque : contour [[x, y], ...]
 * de la vue de côté, en saillie de ep ; cote = +1 (flanc +Z) ou −1.
 */
function relief(c, contour, ep, cote = 1, engage = 0.6) {
  const pts = contour.map(([x, y]) => new THREE.Vector2(x, y));
  if (THREE.ShapeUtils.isClockWise(pts)) pts.reverse();
  const haut = pts.map((p) => [p.x, p.y, cote * (c.z(p.x, p.y) + ep)]);
  const bas = pts.map((p) => [p.x, p.y, cote * (c.z(p.x, p.y) - engage)]);
  const t = [];
  const tri = (a, b, d) => t.push(...a, ...b, ...d);
  for (const [a, b, d] of THREE.ShapeUtils.triangulateShape(pts, [])) {
    tri(haut[a], haut[b], haut[d]);
    tri(bas[a], bas[d], bas[b]);
  }
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    tri(haut[i], bas[i], bas[j]);
    tri(haut[i], bas[j], haut[j]);
  }
  return oriente(t);
}

const rectangle = (x, y, w, h) => [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]];
/** Arc de cercle en points, de l'angle a0 à a1 (degrés). */
const arc = (cx, cy, r, a0, a1, n = 16) => Array.from({ length: n + 1 }, (_, i) => {
  const a = (a0 + ((a1 - a0) * i) / n) * RAD;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});

/** Ouïes d'un flanc : petites fentes sombres à fleur de la coque. */
function ouies(c, groupes, cote) {
  const t = [];
  for (const [x, y, cols, rangs, long, haut, px, py] of groupes) {
    for (let i = 0; i < cols; i++) for (let j = 0; j < rangs; j++) {
      t.push(...relief(c, rectangle(x + (i - (cols - 1) / 2) * px, y + (j - (rangs - 1) / 2) * py, long, haut), 0.12, cote, 0.2));
    }
  }
  const geo = geometrie(t);
  geo.userData.edgeAngle = 180; // pas de contours autour des fentes
  return new THREE.Mesh(geo, ouie());
}

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
const TURQUOISE = 0x1f8390; // turquoise du carter, relevé sur la photo
const TEINTE_LAME = 0x2d97a3;
const turquoise = () => teinte('djr183-turquoise', { color: TURQUOISE, roughness: 0.5 }, 'plastic');
const ouie = () => teinte('djr183-ouie', { color: 0x0b1f23, roughness: 0.85 });
const bleu = () => teinte('djr183-bleu', { color: 0x4a59a6, roughness: 0.5 }, 'plastic');
const peintureLame = () => teinte('djr183-lame', { color: TEINTE_LAME, roughness: 0.42, metalness: 0.3 });

/** Image dessinée sur un canevas (aucune hors navigateur : la couleur unie reste). */
function image(nom, w, h, dessin) {
  if (typeof document === 'undefined') return null;
  if (perso.has(`img:${nom}`)) return perso.get(`img:${nom}`);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  dessin(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  perso.set(`img:${nom}`, t);
  return t;
}

/** Plan imprimé sur un flanc (cote = ±1), centré en (x, y), à la cote z. */
function imprime(nom, map, w, h, x, y, z, cote) {
  const m = teinte(nom, { map, alphaTest: 0.4, roughness: 0.5 });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w * MM, h * MM), m);
  if (cote < 0) p.rotation.y = Math.PI; // lisible depuis le flanc −Z
  p.position.set(...P(x, y, cote * z));
  return p;
}

// Coques, calculées une fois (les reliefs s'appuient dessus).
let COQUES = null;
function coques() {
  if (!COQUES) COQUES = { nez: corps(NEZ), carter: corps(CARTER, { k: 3 }), poignee: corps(POIGNEE), levier: corps(LEVIER, { k: 2, n: 32 }) };
  return COQUES;
}

// ------------------------------------------------------------------ pièces (repère de l'outil)

/** Repère 1 : lame de scie alternative de 6 po, dents vers le bas, soie universelle de 1/2 po. */
function lame(S) {
  const { long, haut, ep, soie, x1, pas, dent } = LAME;
  const dos = soie / 2, bas = dos - haut, x0 = x1 - long;
  const pts = [[x1, dos], [x0, dos], [x0 + 5, bas]];
  // Dents : flanc d'attaque raide, dos de dent en pente.
  let x = x0 + 5;
  for (; x + pas <= -2; x += pas) pts.push([x + pas * 0.78, bas + dent], [x + pas, bas]);
  pts.push([4, bas], [10, -dos], [x1, -dos]); // épaulement, puis soie
  const g = S.group(S.extrude(pts.map(([px, py]) => [px * MM, py * MM]), ep * MM, peintureLame(), { holes: [[(x1 - 6) * MM, 0, 2 * MM]] }));
  // Marquage blanc (illisible sur la photo : cadre et lignes de texte suggérés).
  const map = image('djr183-lame', 512, 96, (c, w, h) => {
    c.strokeStyle = '#eef4f4'; c.fillStyle = '#eef4f4'; c.lineWidth = h * 0.06;
    c.strokeRect(w * 0.04, h * 0.2, w * 0.13, h * 0.6);
    c.fillRect(w * 0.21, h * 0.24, w * 0.42, h * 0.3);
    c.fillRect(w * 0.21, h * 0.64, w * 0.3, h * 0.1);
    for (let i = 0; i < 3; i++) c.fillRect(w * (0.7 + i * 0.09), h * 0.3, w * 0.06, h * 0.4);
  });
  if (map) for (const cote of [1, -1]) g.add(imprime('djr183-lame-marquage', map, 64, 12, -62, 0.4, ep / 2 + 0.03, cote));
  return g;
}

/** Contour en super-ellipse [[z, y], ...] de demi-axes a (largeur) et b (hauteur). */
function ovale(a, b, e, n = 56) {
  return Array.from({ length: n }, (_, i) => {
    const th = (i / n) * 2 * Math.PI, c = Math.cos(th), s = Math.sin(th);
    const r = (Math.abs(c) ** e + Math.abs(s) ** e) ** (-1 / e);
    return [a * r * c * MM, b * r * s * MM];
  });
}

/** Repère 2 : patin fixe en tôle noire (cadre ovale à rebord, grande ouverture) et son pied. */
function patin(S) {
  const { haut, large, ep, rebord, ouvH, ouvL } = PATIN;
  const ext = ovale(large / 2, haut / 2, 2.8), ouv = ovale(ouvL / 2, ouvH / 2, 2.6, 40);
  const g = S.group();
  const face = S.extrude(ext, ep * MM, 'black', { holes: [ouv] });
  face.rotation.y = Math.PI / 2; // épaisseur le long de X
  face.position.x = (ep / 2) * MM;
  g.add(face);
  // Rebord replié vers l'arrière, tout autour.
  const bord = S.extrude(ext, rebord * MM, 'black', { holes: [ovale(large / 2 - 2.5, haut / 2 - 2.5, 2.8)] });
  bord.rotation.y = Math.PI / 2;
  bord.position.x = (ep + rebord / 2) * MM;
  g.add(bord);
  // Pied : il entre dans la mâchoire du nez, où le boulon le serre.
  const { x0, x1, y0, y1, large: lp } = PIED_PATIN;
  g.add(S.box((x1 - x0) * MM, (y1 - y0) * MM, lp * MM, 'black', { pos: P((x0 + x1) / 2, (y0 + y1) / 2) }));
  return g;
}

/** Repère 3 : boulon du patin, à six pans creux, sous la mâchoire du nez (emplacement supposé). */
function boulon(S) {
  const { x, y, r, tete } = BOULON;
  const g = S.group();
  g.add(S.cyl(r * MM, tete * MM, 'blackOxide', { pos: P(x, y - tete / 2 + 0.5), seg: 24 }));
  g.add(S.cyl(2.5 * MM, 14 * MM, 'blackOxide', { pos: P(x, y + 7), seg: 16 }));
  g.add(S.cyl(2.3 * MM, 0.4 * MM, ouie(), { pos: P(x, y - tete + 0.4), seg: 6 })); // empreinte à six pans
  return g;
}

/** Repère 4 : manchon du serre-lame (il tourne pour libérer la lame) et son ergot bleu. */
function manchon(S) {
  const { x0, x1, r, col, xCol } = MANCHON;
  const g = S.group();
  const profil = [[0, x0], [8, x0], [11, x0 + 2], [r, x0 + 5], [r, x1 - 2], [r - 1.5, x1], [col, x1], [col, xCol], [0, xCol]];
  g.add(S.lathe(profil.map(([rr, x]) => [rr * MM, x * MM]), 'plastic', { axis: 'x', seg: 36 }));
  const { x, y, long, haut, large } = ERGOT;
  g.add(S.box(long * MM, haut * MM, large * MM, bleu(), { r: 1.5 * MM, pos: P(x, y) }));
  return g;
}

/** Repère 5 : coulisseau (tige porte-lame), montré sorti (bout de course avant). */
function coulisseau(S) {
  const { x0, x1, r } = COULISSEAU;
  return S.cyl(r * MM, (x1 - x0) * MM, 'steel', { axis: 'x', pos: P((x0 + x1) / 2, 0), seg: 28 });
}

/** Repère 6 : nez, gaine avant en caoutchouc noir (capot, mâchoire du bas, face en creux). */
function nez(S) {
  const c = coques().nez;
  const g = S.group(new THREE.Mesh(volume(c, { creux: CREUX }), mat('rubber')));
  // Bague de guidage du coulisseau, au fond du creux.
  g.add(S.ring(9.5 * MM, COULISSEAU.r * MM + 0.0003, 3 * MM, 'darkSteel', { axis: 'x', pos: P(46.6, 0) }));
  // Carré turquoise du flanc (visible sur les deux images) ; flanc opposé supposé symétrique.
  const { x0, x1, y0, y1 } = FENETRE;
  for (const cote of [1, -1]) {
    g.add(new THREE.Mesh(geometrie(relief(c, rectangle((x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0), 0.3, cote)), turquoise()));
  }
  return g;
}

/** Repère 7 : lampe à DEL, sous le coulisseau (emplacement supposé). */
function lampe(S) {
  const { x, y, r } = LAMPE;
  const g = S.group();
  g.add(S.ring((r + 1.1) * MM, r * MM, 2.4 * MM, 'plastic', { axis: 'x', pos: P(x, y), seg: 24 }));
  g.add(S.cyl(r * MM, 2 * MM, 'lamp', { axis: 'x', pos: P(x, y), seg: 20 }));
  return g;
}

/** Repère 8 : carter du moteur, turquoise, et ses ouïes d'aération. */
function carter(S) {
  const c = coques().carter;
  const g = S.group(new THREE.Mesh(volume(c), turquoise()));
  for (const cote of [1, -1]) g.add(ouies(c, OUIES_CARTER, cote));
  return g;
}

/** Repère 9 : plaque d'un flanc (cadre noir en C, panneau turquoise) ; sans inscription, à la demande du client. */
function plaque(cote) {
  const c = coques().carter;
  const { x0, x1, y0, y1, cadreX, cadreY0, cadreY1, bras } = PLAQUE;
  const g = new THREE.Group();
  // Cadre en C, ouvert vers l'arrière : contour extérieur, puis retour par l'intérieur.
  const ym = (cadreY0 + cadreY1) / 2, R = (cadreY1 - cadreY0) / 2, r = (y1 - y0) / 2 + 0.4;
  const cadre = [
    [bras, cadreY1], ...arc(cadreX + R, ym, R, 90, 270),
    [bras, cadreY0], [bras, y0 - 0.4], ...arc(x0 + r + 1, (y0 + y1) / 2, r, 270, 90), [bras, y1 + 0.4],
  ];
  g.add(new THREE.Mesh(geometrie(relief(c, cadre, 1, cote)), mat('plastic')));
  g.add(new THREE.Mesh(geometrie(relief(c, rectangle((x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0), 1.6, cote)), turquoise()));
  return g;
}

/** Repère 10 : levier d'interrupteur, sous le carter, articulé à l'arrière. */
function levier() {
  const { levier: c, carter: k } = coques();
  const g = new THREE.Group();
  g.add(new THREE.Mesh(volume(c), mat('plastic')));
  const { x0, x1, a0, a1, ep } = BERCEAU;
  g.add(new THREE.Mesh(bande(k, k.indice(x0, -7), k.indice(x1, -7), a0, a1, ep), mat('plastic')));
  return g;
}

/** Repère 11 : levier de sécurité du levier d'interrupteur (forme supposée : deux bossages visibles). */
function securite(S) {
  const { x, y, long, haut, large } = SECURITE;
  const g = S.group(S.box(long * MM, haut * MM, large * MM, 'plastic', { r: 1.2 * MM, pos: P(x, y) }));
  for (const dx of [-12, 12]) g.add(S.box(5 * MM, 3.4 * MM, large * MM, 'plastic', { r: 1.2 * MM, pos: P(x + dx, y - 1.5) }));
  return g;
}

/** Repère 12 : poignée arrière surmoulée de caoutchouc noir, jusqu'au corps de l'embase ; dessus du carter, dessous et bande turquoise. */
function poignee() {
  const { poignee: c, carter: k } = coques();
  const g = new THREE.Group();
  g.add(new THREE.Mesh(volume(c), mat('rubber')));
  g.add(new THREE.Mesh(bande(k, k.indice(CHAPEAU.x0, -7), k.secs.length - 1, -CHAPEAU.a, CHAPEAU.a, CHAPEAU.ep), mat('rubber')));
  g.add(new THREE.Mesh(bande(c, 0, c.indice(SEMELLE.x1, SEMELLE.y1), SEMELLE.a0, SEMELLE.a1, SEMELLE.ep), turquoise()));
  // Bande turquoise du flanc : droite, pointe en flèche vers l'embase.
  const [ax, ay] = FLECHE.a, [bx, by] = FLECHE.b;
  const L = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L;
  const demi = (t) => (t < 0.7 ? 3.4 - 0.5 * (t / 0.7) : 5 * (1 - (t - 0.7) / 0.3) + 0.3);
  const bord = (s) => Array.from({ length: 21 }, (_, i) => {
    const t = i / 20, h = demi(t) * s;
    return [ax + ux * L * t - uy * h, ay + uy * L * t + ux * h];
  });
  const fleche = [...bord(1), ...bord(-1).reverse()];
  for (const cote of [1, -1]) {
    g.add(new THREE.Mesh(geometrie(relief(c, fleche, 0.25, cote)), turquoise()));
    g.add(ouies(c, OUIES_POIGNEE, cote));
  }
  return g;
}

/** Repère 13 : gâchette, sous la poignée. */
function gachette(S) {
  const { x, y, long, haut, large, angle } = GACHETTE;
  const g = S.box(long * MM, haut * MM, large * MM, 'plastic', { r: 2 * MM });
  g.rotation.z = angle * RAD;
  g.position.set(...P(x, y));
  return g;
}

/** Repère 14 : bouton de sécurité de la gâchette, traversant (il se pousse d'un côté ou de l'autre). */
function bouton(S) {
  const { x, y, r, saillie } = BOUTON;
  return S.cyl(r * MM, 2 * (coques().poignee.z(x, y) + saillie) * MM, 'plastic', { axis: 'z', pos: P(x, y), seg: 24 });
}

/** Repère 15 : embase de la batterie, sous le corps noir (jupe turquoise en U, plafond, glissières et bornier). */
function embase(S) {
  const { x, y, angle, long, large, jupe, paroi } = EMBASE;
  const g = S.group();
  // Repère de l'embase : x le long du plan (vers l'arrière), y perpendiculaire (jupe en y négatif).
  // Jupe ouverte à l'arrière : la batterie s'y engage par là.
  for (const s of [1, -1]) {
    g.add(S.box(long * MM, jupe * MM, paroi * MM, turquoise(), { r: 1.5 * MM, pos: P(long / 2, -jupe / 2, s * (large - paroi) / 2) }));
    g.add(S.box((long - 14) * MM, 1.8 * MM, 4 * MM, turquoise(), { pos: P(long / 2 + 5, -jupe + 0.9, s * (large / 2 - paroi - 1.5)) })); // glissière
  }
  g.add(S.box(paroi * MM, jupe * MM, (large - 2) * MM, turquoise(), { r: 1.5 * MM, pos: P(paroi / 2, -jupe / 2) }));
  g.add(S.box((long - 4) * MM, 1.5 * MM, (large - 8) * MM, 'plastic', { pos: P(long / 2, -0.75) })); // plafond
  // Bornier et ses trois lames de contact (interface des batteries LXT ; non visible sur les images).
  g.add(S.box(22 * MM, 5.5 * MM, 30 * MM, 'plastic', { pos: P(paroi + 11, -4.2) }));
  for (const z of [-9.5, 0, 9.5]) g.add(S.box(12 * MM, 4 * MM, 0.8 * MM, 'zinc', { pos: P(paroi + 27, -4.2, z) }));
  g.rotation.z = angle * RAD;
  g.position.set(...P(x, y));
  return g;
}

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  const S = api.S;
  const seen = new Set();
  // Pose : repère de l'outil relevé pour que l'avant de l'embase touche le sol.
  const put = (ref, obj, explode) => {
    const g = S.group(obj);
    g.position.y = AXE * MM;
    api.part(ref, g, explode, { noLabel: seen.has(ref) });
    seen.add(ref);
  };

  put('1', lame(S), [-0.2, 0, 0]);
  put('2', patin(S), [-0.14, 0, 0]);
  put('3', boulon(S), [-0.04, -0.07, 0]);
  put('4', manchon(S), [-0.1, 0, 0]);
  put('5', coulisseau(S), [-0.065, 0, 0]);
  put('6', nez(S), [-0.035, 0, 0]);
  put('7', lampe(S), [-0.06, -0.035, 0]);
  put('8', carter(S), [0, 0, 0]);
  put('9', plaque(1), [0, 0, 0.05]);
  put('9', plaque(-1), [0, 0, -0.05]);
  put('10', levier(), [0, -0.05, 0]);
  put('11', securite(S), [0, -0.085, 0]);
  put('12', poignee(), [0.05, 0, 0]);
  put('13', gachette(S), [0.05, -0.05, 0]);
  put('14', bouton(S), [0.05, 0.06, 0]);
  put('15', embase(S), [0.085, -0.045, 0]);

  // Vue de la photo : de trois quarts avant, du côté du flanc +Z ; coupe proposée dans le plan de symétrie.
  return { view: { dir: [-0.6, 0.45, 1], section: { axis: 'z', pos: 0.5 } } };
}


// Pince pour tube intérieur de carottier, à mâchoires rondes : pince-étau en C
// (« locking C-clamp ») dont chaque bec porte une demi-coquille ronde soudée,
// pour saisir le tube intérieur sans l'écraser. Reconstitution d'après deux
// images du client, sans plan ni cote :
//  - la page du produit TIME Limited « Pinces pour tubes intérieurs »
//    (92-1005 simple, 92-1006 double) : pince orange à patins carrés ;
//  - une photo d'atelier d'une pince du même genre dont les patins sont deux
//    coquilles rondes (bouts de tuyau fendu) soudées aux becs.
// Demande du client : la pince de la page TIME, mais à patins ronds, et de
// couleur métallique (acier nu, comme sur sa photo d'atelier) plutôt qu'orange.
//
// Rien n'est publié sur les dimensions. La pince de la photo TIME est prise
// pour une pince-étau en C de 11 po (280 mm), la grandeur courante : c'est
// l'échelle de tout le relevé (environ 0,57 mm par pixel de la capture).
// Places des rivets, forme des bras et des poignées : relevées sur la photo.
// Supposés : les épaisseurs, la visserie, le mécanisme caché dans le corps
// (celui, usuel, d'une pince-étau : genouillère à vis de réglage) et le
// calibre des coquilles, faites ici pour le tube intérieur NQ (Ø 55,6 mm).
//
// Repère de l'outil, en millimètres : x le long de la pince, des becs vers la
// vis de réglage ; y vers la mâchoire mobile ; z en travers (axe du tube).
// Modèle : pince couchée à plat sur le bout de ses coquilles, mètres.
import * as THREE from 'three';
import { mat, withFinish } from '../../viewer/materials.js';
import { creaseNormals } from '../../viewer/shapes.js';

const MM = 0.001;
const RAD = Math.PI / 180;

// ------------------------------------------------------------------ cotes (mm)

export const L = 280; // longueur hors tout supposée : pince-étau en C de 11 po
/** Tube intérieur saisi (supposé : NQ) et son axe dans le repère de l'outil. */
export const TUBE = { nom: 'NQ', d: 55.6, x: 25, y: 13 };
/** Demi-coquille : jeu sur le tube, épaisseur, angle couvert, longueur le long du tube (relevés en proportion sur la photo d'atelier, puis arrondis). */
export const COQUILLE = { jeu: 0.5, ep: 4.8, angle: 120, long: 70 };
export const R_INT = TUBE.d / 2 + COQUILLE.jeu;
export const R_EXT = R_INT + COQUILLE.ep;
/** Épaisseurs (supposées) : mâchoires, tôle emboutie du corps et de la poignée, largeur du profilé, biellette, levier. */
export const EP = { machoire: 8, tole: 2.5, large: 14, biellette: 3, levier: 5 };
const BRAS = 17; // largeur des bras en C
// Articulations, pince serrée sur le tube (relevées sur la photo, à 1 mm près) :
export const A = [120, 1]; // pivot de la mâchoire mobile dans le corps
export const B0 = [120.5, 27]; // poignée mobile sur la mâchoire mobile
export const FIXES = [[104, -8], [97, 1]]; // rivets de la mâchoire fixe
export const D = [207, -1]; // bout de la vis de réglage : appui de la biellette
const R_BC = 29.5; // de l'articulation de la poignée à celle de la biellette
const SURCENTRE = 1.5; // la biellette dépasse l'alignement de 1,5 mm : la pince reste verrouillée
/** Articulation biellette-poignée, pince verrouillée : presque alignée entre B et D, un peu passée du côté du corps. */
export const C0 = (() => {
  const d = Math.hypot(D[0] - B0[0], D[1] - B0[1]), u = [(D[0] - B0[0]) / d, (D[1] - B0[1]) / d];
  const a = Math.sqrt(R_BC * R_BC - SURCENTRE * SURCENTRE);
  return [B0[0] + a * u[0] + SURCENTRE * u[1], B0[1] + a * u[1] - SURCENTRE * u[0]];
})();
export const BIELLETTE = Math.hypot(D[0] - C0[0], D[1] - C0[1]);
const R_AB = Math.hypot(B0[0] - A[0], B0[1] - A[1]);
export const LEVIER = [204, 17.5]; // pivot du levier de déverrouillage dans la poignée
const RESSORT = { machoire: [136, 13], corps: [166, 1.5], r: 2.2, fil: 0.55 };
export const VIS = { d: 9.5, bouton: 16, longBouton: 13, y: D[1], bague: 7 }; // vis de réglage (3/8 po supposé)
export const RIVET = { d: 6, tete: 10 };
const HAUT = COQUILLE.long / 2; // plan médian de la pince au-dessus de la table

// ------------------------------------------------------------------ cinématique (plan x, y)

const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const ANGLE_BIELLETTE0 = Math.atan2(C0[1] - D[1], C0[0] - D[0]);
const ANGLE_B0 = Math.atan2(B0[1] - A[1], B0[0] - A[0]);
const ANGLE_POIGNEE0 = Math.atan2(C0[1] - B0[1], C0[0] - B0[0]);

/**
 * État du mécanisme quand la biellette a tourné de t (radians, 0 = pince
 * verrouillée) autour du bout de la vis : articulations B et C, angle theta
 * dont la mâchoire mobile s'est ouverte autour de A, angle psi dont la
 * poignée s'est levée. Retourne null si le mécanisme ne peut pas se monter.
 */
export function etat(t) {
  const a = ANGLE_BIELLETTE0 - t;
  const C = [D[0] + BIELLETTE * Math.cos(a), D[1] + BIELLETTE * Math.sin(a)];
  // B : rencontre du cercle (A, R_AB) et du cercle (C, R_BC), du côté gauche de A → C.
  const dx = C[0] - A[0], dy = C[1] - A[1], d = Math.hypot(dx, dy);
  const k = (R_AB * R_AB - R_BC * R_BC + d * d) / (2 * d), h2 = R_AB * R_AB - k * k;
  if (h2 < 0) return null;
  const h = Math.sqrt(h2);
  const B = [A[0] + (k * dx - h * dy) / d, A[1] + (k * dy + h * dx) / d];
  const theta = ANGLE_B0 - Math.atan2(B[1] - A[1], B[0] - A[0]);
  const psi = Math.atan2(C[1] - B[1], C[0] - B[0]) - ANGLE_POIGNEE0;
  return { t, B, C, theta, psi };
}

/** Point de la mâchoire mobile (donné pince serrée) quand elle s'est ouverte de theta. */
export const pointMachoire = (p, theta) => { const d = rot([p[0] - A[0], p[1] - A[1]], -theta); return [A[0] + d[0], A[1] + d[1]]; };
/** Point de la poignée mobile (donné pince serrée) dans l'état e. */
export const pointPoignee = (p, e) => { const d = rot([p[0] - B0[0], p[1] - B0[1]], e.psi); return [e.B[0] + d[0], e.B[1] + d[1]]; };

/** Jour entre les deux coquilles, mesuré sur l'axe de serrage (mm), pour une ouverture theta. */
export function jour(theta) {
  const haut = pointMachoire([TUBE.x, TUBE.y + R_INT], theta);
  return Math.hypot(haut[0] - TUBE.x, haut[1] - (TUBE.y - R_INT));
}

/** Point mort : rotation de la biellette pour laquelle B, C et D sont alignés (mâchoire la plus fermée). */
export const T_MORT = (() => {
  let a = 0, b = 10 * RAD;
  const f = (t) => etat(t).theta;
  for (let i = 0; i < 60; i++) { const m1 = a + (b - a) / 3, m2 = b - (b - a) / 3; if (f(m1) < f(m2)) b = m2; else a = m1; }
  return (a + b) / 2;
})();
/** Pince ouverte : la mâchoire mobile a tourné de 24° (valeur du modèle, pas du fabricant). */
export const THETA_MAX = 24 * RAD;
export const T_MAX = (() => {
  let a = T_MORT, b = 80 * RAD;
  for (let i = 0; i < 50; i++) { const m = (a + b) / 2, e = etat(m); if (e && e.theta < THETA_MAX) a = m; else b = m; }
  return (a + b) / 2;
})();

// ------------------------------------------------------------------ outils de tracé

/** Arc de centre (cx, cy), rayon r, de l'angle a0 à a1 (degrés). */
function arc(cx, cy, r, a0, a1, n = 12) {
  const out = [];
  for (let i = 0; i <= n; i++) { const a = (a0 + ((a1 - a0) * i) / n) * RAD; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return out;
}
/** Courbe lisse passant par des points [x, y], rendue en n segments. */
function lisse(pts, n) {
  const c = new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, 'centripetal');
  return c.getPoints(n).map((p) => [p.x, p.y]);
}
/** Arrondit les sommets [x, y, r] d'un contour fermé (r absent ou nul : sommet vif). */
function arrondir(pts) {
  const out = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const p = pts[i], a = pts[(i + n - 1) % n], b = pts[(i + 1) % n], r = p[2] || 0;
    if (!r) { out.push([p[0], p[1]]); continue; }
    const va = [a[0] - p[0], a[1] - p[1]], vb = [b[0] - p[0], b[1] - p[1]];
    const la = Math.hypot(...va), lb = Math.hypot(...vb);
    const demi = Math.acos(Math.max(-1, Math.min(1, (va[0] * vb[0] + va[1] * vb[1]) / (la * lb)))) / 2;
    const t = Math.min(r / Math.tan(demi), la * 0.45, lb * 0.45);
    const p0 = [p[0] + (va[0] / la) * t, p[1] + (va[1] / la) * t], p1 = [p[0] + (vb[0] / lb) * t, p[1] + (vb[1] / lb) * t];
    for (let k = 0; k <= 6; k++) {
      const u = k / 6, w = 1 - u;
      out.push([w * w * p0[0] + 2 * w * u * p[0] + u * u * p1[0], w * w * p0[1] + 2 * w * u * p[1] + u * u * p1[1]]);
    }
  }
  return out;
}
/**
 * Contour d'un ruban : ligne médiane [x, y] et largeur(i) ; bouts ronds.
 * cote : 0 = ruban entier ; sinon bande de `bande` mm le long du bord gauche (1) ou droit (−1), bouts droits.
 */
function ruban(axe, largeur, cote = 0, bande = 0) {
  const n = axe.length, g = [], d = [];
  for (let i = 0; i < n; i++) {
    const a = axe[Math.max(0, i - 1)], b = axe[Math.min(n - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / l, ny = (b[0] - a[0]) / l, w = largeur(i) / 2;
    if (cote) {
      g.push([axe[i][0] + cote * nx * w, axe[i][1] + cote * ny * w]);
      d.push([axe[i][0] + cote * nx * (w - bande), axe[i][1] + cote * ny * (w - bande)]);
    } else {
      g.push([axe[i][0] + nx * w, axe[i][1] + ny * w]);
      d.push([axe[i][0] - nx * w, axe[i][1] - ny * w]);
    }
  }
  if (cote) return cote > 0 ? [...d, ...g.reverse()] : [...g, ...d.reverse()];
  const bout = (i, j) => {
    const c = axe[i], v = [axe[i][0] - axe[j][0], axe[i][1] - axe[j][1]], a0 = Math.atan2(v[1], v[0]) / RAD;
    return arc(c[0], c[1], largeur(i) / 2, a0 - 90, a0 + 90, 8).slice(1, -1);
  };
  return [...d, ...bout(n - 1, n - 2), ...g.reverse(), ...bout(0, 1)];
}

/** Plaque découpée : contour [x, y] (mm) entre z0 et z1, arêtes arrondies (rayon `arrondi`, au plus 30 % de l'épaisseur) ; trous ronds [x, y, r]. */
function plaque(contour, z0, z1, matiere, trous = [], arrondi = 1) {
  const shape = new THREE.Shape(contour.map(([x, y]) => new THREE.Vector2(x * MM, y * MM)));
  for (const [x, y, r] of trous) {
    const p = new THREE.Path();
    p.absarc(x * MM, y * MM, r * MM, 0, 2 * Math.PI, true);
    shape.holes.push(p);
  }
  const t = (z1 - z0) * MM, b = Math.min(t * 0.3, arrondi * MM);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: t - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelOffset: -b, bevelSegments: 3, curveSegments: 20 });
  geo.translate(0, 0, z0 * MM + b);
  const lisse = creaseNormals(geo, 50 * RAD);
  lisse.userData.edgeAngle = 60; // pas de contours sur les arrondis
  return new THREE.Mesh(lisse, typeof matiere === 'string' ? mat(matiere) : matiere);
}

/**
 * Profilé embouti en U à dos rond, balayé le long d'une ligne du plan de
 * l'outil : axe [x, y] (mm), hauteur(i) dans le plan, dos du côté gauche de la
 * marche (cote = 1) ou droit (−1), ouvert de l'autre. echelle(i) rétrécit la
 * section (bout en cuiller). Bouts fermés.
 */
function profile(axe, hauteur, cote, matiere, { rayon = 5, echelle = () => 1 } = {}) {
  const W = EP.large / 2, t = EP.tole, n = axe.length, pos = [], idx = [];
  // Section (u vers le dos, z en travers) : contour extérieur puis intérieur, sens constant.
  const section = (h) => {
    const moitie = (w, haut, r) => {
      const pts = [[-h / 2, -w]];
      for (let k = 0; k <= 6; k++) { const a = Math.PI - (k / 6) * (Math.PI / 2); pts.push([haut - r + r * Math.sin(a), -w + r + r * Math.cos(a)]); }
      for (let k = 0; k <= 6; k++) { const a = Math.PI / 2 - (k / 6) * (Math.PI / 2); pts.push([haut - r + r * Math.sin(a), w - r + r * Math.cos(a)]); }
      pts.push([-h / 2, w]);
      return pts;
    };
    const r = Math.min(rayon, h / 2 - 0.5, W);
    return [...moitie(W, h / 2, r), ...moitie(W - t, h / 2 - t, Math.max(0.6, r - t)).reverse()];
  };
  let m = 0;
  for (let i = 0; i < n; i++) {
    const a = axe[Math.max(0, i - 1)], b = axe[Math.min(n - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = (-(b[1] - a[1]) / l) * cote, ny = ((b[0] - a[0]) / l) * cote, e = echelle(i);
    const sec = section(hauteur(i));
    m = sec.length;
    for (const [u, z] of sec) pos.push((axe[i][0] + nx * u * e) * MM, (axe[i][1] + ny * u * e) * MM, z * e * MM);
  }
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < m; j++) {
    const a = i * m + j, b = i * m + ((j + 1) % m), c = a + m, d = b + m;
    idx.push(a, b, d, a, d, c);
  }
  const faces = THREE.ShapeUtils.triangulateShape(section(hauteur(0)).map(([u, z]) => new THREE.Vector2(u, z)), []);
  for (const f of faces) { idx.push(f[0], f[1], f[2]); idx.push((n - 1) * m + f[0], (n - 1) * m + f[2], (n - 1) * m + f[1]); }
  let geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo = geo.toNonIndexed();
  // Faces vers l'extérieur : flancs et bouts orientés chacun par son volume signé.
  const p = geo.attributes.position.array;
  const retourner = (i0, i1) => {
    let vol = 0;
    for (let i = i0; i < i1; i += 9) vol += p[i] * (p[i + 4] * p[i + 8] - p[i + 5] * p[i + 7]) - p[i + 1] * (p[i + 3] * p[i + 8] - p[i + 5] * p[i + 6]) + p[i + 2] * (p[i + 3] * p[i + 7] - p[i + 4] * p[i + 6]);
    return vol;
  };
  const tourne = (i0, i1) => { for (let i = i0; i < i1; i += 9) for (let k = 0; k < 3; k++) { const v = p[i + 3 + k]; p[i + 3 + k] = p[i + 6 + k]; p[i + 6 + k] = v; } };
  if (retourner(0, p.length) < 0) tourne(0, p.length);
  geo = creaseNormals(geo, 50 * RAD);
  geo.userData.edgeAngle = 75;
  return new THREE.Mesh(geo, matiere);
}

// Acier nu de la pince (demande du client : garder la couleur métallique de sa photo d'atelier, pas l'orange de la page TIME), créé une fois.
let metal = null;
function acier() {
  if (!metal) {
    metal = new THREE.MeshPhysicalMaterial({ color: 0x9a9ea3, metalness: 1, roughness: 0.4 });
    metal.polygonOffset = true;
    metal.polygonOffsetFactor = 1;
    metal.polygonOffsetUnits = 1;
    metal.name = 'pince-tube-acier';
    withFinish(metal, 'machined');
  }
  return metal;
}

// ------------------------------------------------------------------ pièces (repère de l'outil, pince serrée sur le tube)

const JEU = RIVET.d / 2 + 0.2; // rayon des trous de rivet
const zTole = [[-EP.large / 2, -EP.large / 2 + EP.tole], [EP.large / 2 - EP.tole, EP.large / 2]];

// Corps : dessus et dessous du profilé selon x, en arrière des mâchoires.
const JOINT_CORPS = 128;
const dessusCorps = (x) => (x < 136 ? 11 - (x - 128) * 0.06 : x < 156 ? 10.5 - 4.5 * (((x - 136) / 20) ** 2 * (3 - 2 * ((x - 136) / 20))) : 6);
const dessousCorps = (x) => (x < 185 ? -16.3 + 8.3 * ((x - 128) / 57) : -8);

/** Repère 1 : corps (poignée fixe) embouti en U à dos rond, ouvert vers la poignée mobile, bague taraudée au bout. */
function corps(S) {
  const g = new THREE.Group(), m = acier();
  // Devant : deux joues plates qui tiennent les mâchoires (le dos s'arrête là, où sort la mâchoire fixe).
  const flanc = arrondir([[88, 11, 4], [88, -19, 5], [112, -17.6, 6], [JOINT_CORPS, dessousCorps(JOINT_CORPS)], [JOINT_CORPS, dessusCorps(JOINT_CORPS)]]);
  const trous = [[...A, JEU], ...FIXES.map((p) => [...p, JEU])];
  for (const [z0, z1] of zTole) g.add(plaque(flanc, z0, z1, m, trous));
  // Derrière : la poignée, à dos rond.
  const axe = [], haut = [];
  for (let x = JOINT_CORPS; x <= 256.01; x += 4) { axe.push([x, (dessusCorps(x) + dessousCorps(x)) / 2]); haut.push(dessusCorps(x) - dessousCorps(x)); }
  g.add(profile(axe, (i) => haut[i], -1, m, { rayon: 6 }));
  g.add(S.cyl(VIS.bague * MM, 14 * MM, m, { axis: 'x', pos: [251 * MM, VIS.y * MM, 0] }));
  return g;
}

/** Demi-coquille ronde (cote = 1 : mâchoire mobile, −1 : fixe), soudée par son sommet au bec. */
function coquille(cote) {
  const g = new THREE.Group(), demi = COQUILLE.angle / 2, a0 = cote * 90 - demi, a1 = cote * 90 + demi;
  const contour = [...arc(TUBE.x, TUBE.y, R_EXT, a0, a1, 28), ...arc(TUBE.x, TUBE.y, R_INT, a1, a0, 28)];
  g.add(plaque(contour, -COQUILLE.long / 2, COQUILLE.long / 2, acier(), [], 1.4));
  // Intérieur plus clair : acier poli par le frottement du tube.
  const r = R_INT - 0.12, h = COQUILLE.long / 2 - 1.8, n = 28, pos = [], nor = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const a = (a0 + 1.5 + ((a1 - a0 - 3) * i) / n) * RAD, c = Math.cos(a), s = Math.sin(a);
    for (const z of [-h, h]) { pos.push((TUBE.x + r * c) * MM, (TUBE.y + r * s) * MM, z * MM); nor.push(-c, -s, 0); }
  }
  for (let i = 0; i < n; i++) { const a = 2 * i; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setIndex(idx);
  geo.userData.edgeAngle = 180;
  g.add(new THREE.Mesh(geo, mat('steel')));
  return g;
}

/** Repère 2 : mâchoire fixe en C, rivée dans le corps ; bec appuyé au sommet de sa coquille. */
function machoireFixe() {
  const bec = TUBE.y - R_EXT + 0.6, h = BRAS / 2;
  const contour = arrondir([
    [88, 7, 2], [88, -10, 3], [91, -20, 4], [91, -38.5, 6], [TUBE.x + h, -38.5, 8], [TUBE.x + h, bec], [TUBE.x - h, bec],
    [TUBE.x - h, -38.5 - BRAS, 16], [108.5, -38.5 - BRAS, 9], [108.5, -22, 6],
  ]);
  // Dégagement rond autour du moyeu de la mâchoire mobile.
  contour.push(...arc(A[0], A[1], 10.5, 262, 145.2, 14));
  return plaque(contour, -EP.machoire / 2, EP.machoire / 2, acier(), FIXES.map((p) => [...p, JEU]), 2.2);
}

/** Repère 3 : mâchoire mobile en C — moyeu percé pour son pivot (A), pour la poignée (B) et pour le ressort. */
function machoireMobile() {
  const bec = TUBE.y + R_EXT - 0.6, h = BRAS / 2;
  const contour = arrondir([
    [141, 8, 3], [141, 18, 3], [130, 36, 7], [116, 43.5, 6], [TUBE.x - h, 96.9, 13], [TUBE.x - h, bec], [TUBE.x + h, bec],
    [TUBE.x + h, 68.5, 5], [108, 28.5, 6], [109.5, 12, 3],
  ]);
  contour.push(...arc(A[0], A[1], 9, 140, 330, 16));
  return plaque(contour, -EP.machoire / 2, EP.machoire / 2, acier(), [[...A, JEU], [...B0, JEU], [...RESSORT.machoire, 1.4]], 2.2);
}

// Ligne médiane de la poignée mobile, de son articulation sur la mâchoire jusqu'au bout relevé.
const AXE_POIGNEE = lisse([B0, [134, 22.5], [148, 19.5], [181, 17.5], [215, 18.5], [244, 25], [266, 34]], 48);
const largeurPoignee = (i) => {
  const u = i / (AXE_POIGNEE.length - 1);
  return u < 0.3 ? 16 - 6 * (u / 0.3) : u > 0.8 ? 10 + 3 * ((u - 0.8) / 0.2) : 10;
};

/** Repère 4 : poignée mobile emboutie en U à dos rond, ouverte vers le corps ; sa chape plate chevauche la mâchoire mobile ; bout en cuiller. */
function poignee() {
  const g = new THREE.Group(), m = acier();
  const i0 = AXE_POIGNEE.findIndex((p) => p[0] > 140);
  // Chape : deux joues plates, rondes autour de l'articulation, jusqu'au départ du dos.
  const devant = AXE_POIGNEE.slice(0, i0 + 1), joue = ruban(devant, largeurPoignee);
  const k = devant.length; // ruban : bord droit (k points), bout rond (7), bord gauche (k), bout rond (7) ; le bout du côté du dos reste droit
  const contour = [...joue.slice(0, k), ...joue.slice(k + 7)];
  for (const [z0, z1] of zTole) g.add(plaque(contour, z0, z1, m, [[...B0, JEU]]));
  const axe = AXE_POIGNEE.slice(i0);
  // Bout en cuiller : la section rétrécit en rond sur les 12 derniers millimètres.
  const fin = axe[axe.length - 1][0];
  const echelle = (i) => { const u = Math.max(0, 1 - (fin - axe[i][0]) / 12); return Math.max(0.3, Math.sqrt(1 - u * u * 0.92)); };
  g.add(profile(axe, (i) => largeurPoignee(i + i0), 1, m, { rayon: 4.5, echelle }));
  return g;
}

/** Repère 5 : biellette de la genouillère, de la poignée mobile au bout de la vis de réglage. */
function biellette() {
  const axe = [C0, [(C0[0] + D[0]) / 2, (C0[1] + D[1]) / 2], [D[0] - 3.5, D[1] + 3.5 * (C0[1] - D[1]) / BIELLETTE]];
  return plaque(ruban(axe, () => 7), -EP.biellette / 2, EP.biellette / 2, 'zinc', [[...C0, JEU]]);
}

/** Repère 6 : levier de déverrouillage, logé dans la poignée mobile ; son bout dépasse sous celui de la poignée. */
function levier() {
  const axe = lisse([[194, 14.5], LEVIER.map((v, i) => v - (i ? 2.5 : 0)), [228, 15], [248, 18.5], [263, 25]], 24);
  return plaque(ruban(axe, (i) => 5 + 4 * (i / 24)), -EP.levier / 2, EP.levier / 2, acier(), [[LEVIER[0], LEVIER[1] - 2.5, JEU]]);
}

/** Repère 7 : vis de réglage à bouton moleté ; son bout pousse la biellette. */
function vis(S) {
  const g = new THREE.Group(), x1 = L - VIS.longBouton;
  g.add(S.cyl((VIS.d / 2) * MM, (x1 - D[0]) * MM, 'zinc', { axis: 'x', pos: [((D[0] + x1) / 2) * MM, VIS.y * MM, 0] }));
  // Bouton moleté : cannelures le long de l'axe.
  const n = 40, pts = [];
  for (let i = 0; i < 2 * n; i++) { const a = (i / (2 * n)) * 2 * Math.PI, r = VIS.bouton / 2 - (i % 2 ? 0.45 : 0); pts.push([r * Math.cos(a), r * Math.sin(a)]); }
  const bouton = plaque(pts, 0, VIS.longBouton, 'zinc');
  bouton.rotation.y = Math.PI / 2;
  bouton.position.set(x1 * MM, VIS.y * MM, 0);
  g.add(bouton);
  return g;
}

/** Repère 8 : ressort de rappel, tendu du corps à la mâchoire mobile (il ouvre la mâchoire) ; long. au repos donnée par la pince serrée. */
function ressort(S) {
  const g = new THREE.Group(), long = Math.hypot(RESSORT.machoire[0] - RESSORT.corps[0], RESSORT.machoire[1] - RESSORT.corps[1]);
  g.add(S.spring(RESSORT.r * MM, RESSORT.fil * MM, long * MM, 20, 'zinc', { axis: 'x', pos: [(long / 2) * MM, 0, 0] }));
  g.userData.long = long;
  return g;
}

/** Repère 9 : rivet à deux têtes bombées, en travers (serrage : largeur prise entre les têtes). */
function rivet(S, [x, y], serrage = EP.large) {
  const g = new THREE.Group();
  g.add(S.cyl((RIVET.d / 2) * MM, serrage * MM, 'zinc', { axis: 'z', pos: [x * MM, y * MM, 0] }));
  for (const c of [1, -1]) {
    const tete = new THREE.Mesh(new THREE.SphereGeometry((RIVET.tete / 2) * MM, 20, 8, 0, 2 * Math.PI, 0, Math.PI / 2), mat('zinc'));
    tete.scale.y = 0.42;
    tete.rotation.x = (c * Math.PI) / 2;
    tete.position.set(x * MM, y * MM, c * (serrage / 2) * MM);
    g.add(tete);
  }
  return g;
}

// ------------------------------------------------------------------ assemblage

// Pince couchée : x de l'outil vers +X, y vers −Z, z (axe du tube) vers le haut.
const A_PLAT = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0)));

/**
 * Monte la pince et enregistre ses pièces. Retourne poser(t), qui met le
 * mécanisme dans l'état où la biellette a tourné de t (0 = verrouillée).
 */
function assemblage(api) {
  const S = api.S;
  const seen = new Set();
  const mobiles = [];
  // suit : 'fixe', 'machoire', 'poignee', 'biellette', 'B', 'C' ou 'ressort'.
  const put = (ref, obj, explode, suit = 'fixe') => {
    const pose = S.group(obj);
    const g = S.group(pose);
    g.quaternion.copy(A_PLAT);
    g.position.y = HAUT * MM;
    if (suit !== 'fixe') mobiles.push({ pose, suit, obj });
    api.part(ref, g, explode, { noLabel: seen.has(ref) });
    seen.add(ref);
  };
  put('1', corps(S), [0.03, 0, 0.05]);
  put('2', machoireFixe(), [-0.03, 0, 0.09]);
  put('10', coquille(-1), [-0.08, 0, 0.13]);
  put('3', machoireMobile(), [-0.04, 0, -0.06], 'machoire');
  put('10', coquille(1), [-0.09, 0, -0.1], 'machoire');
  put('4', poignee(), [0.05, 0, -0.1], 'poignee');
  put('6', levier(), [0.13, 0, -0.15], 'poignee');
  put('5', biellette(), [0.05, 0.05, -0.02], 'biellette');
  put('7', vis(S), [0.1, 0, 0.05]);
  put('8', ressort(S), [0, 0.085, 0.01], 'ressort');
  for (const p of FIXES) put('9', rivet(S, p), [0.03, 0.12, 0.05]);
  put('9', rivet(S, A), [0.03, 0.12, 0.05]);
  put('9', rivet(S, B0), [0.05, 0.12, -0.1], 'B');
  put('9', rivet(S, C0), [0.05, 0.12, -0.1], 'C');
  put('9', rivet(S, [LEVIER[0], LEVIER[1] - 2.5]), [0.05, 0.12, -0.1], 'poignee');

  /** Pose p ↦ centre + R(angle)·(p − origine), dans le plan de l'outil (mm). */
  const placer = (pose, origine, centre, angle) => {
    const o = rot(origine, angle);
    pose.rotation.z = angle;
    pose.position.set((centre[0] - o[0]) * MM, (centre[1] - o[1]) * MM, 0);
  };
  const poser = (t) => {
    const e = etat(t);
    for (const { pose, suit, obj } of mobiles) {
      // La bulle de repère, posée par la visionneuse sur la pièce, passe sur le groupe mobile pour le suivre.
      for (const c of [...pose.parent.children]) if (c.isCSS2DObject) pose.add(c);
      if (suit === 'machoire') placer(pose, A, A, -e.theta);
      else if (suit === 'poignee') placer(pose, B0, e.B, e.psi);
      else if (suit === 'biellette') placer(pose, D, D, -t);
      else if (suit === 'B') placer(pose, B0, e.B, 0);
      else if (suit === 'C') placer(pose, C0, e.C, 0);
      else {
        // Ressort : du crochet du corps au trou de la mâchoire, étiré selon l'ouverture.
        const bout = pointMachoire(RESSORT.machoire, e.theta), dx = bout[0] - RESSORT.corps[0], dy = bout[1] - RESSORT.corps[1];
        pose.position.set(RESSORT.corps[0] * MM, RESSORT.corps[1] * MM, 0);
        pose.rotation.z = Math.atan2(dy, dx);
        pose.scale.x = Math.hypot(dx, dy) / obj.userData.long;
        // Sa bulle de repère reste au milieu du ressort.
        for (const c of pose.children) if (c.isCSS2DObject) c.position.set((obj.userData.long / 2) * MM, 0, 0);
      }
    }
  };
  poser(0);
  return poser;
}

/** P01 : la pince serrée sur le tube, et sa vue éclatée. */
export function P01(api) {
  assemblage(api);
  // Coupe proposée : à mi-épaisseur (plan horizontal de la pince couchée), pour voir la genouillère dans le corps.
  return { view: { dir: [-0.3, 1, 0.8], section: { axis: 'y', pos: 0.5 } } };
}

const smooth = (u) => u * u * (3 - 2 * u);
const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
export const STEPS = [
  { label: 'Départ', title: 'Pince verrouillée sur le tube', text: `Les deux coquilles rondes enveloppent le tube intérieur (${TUBE.nom}, Ø ${fr(TUBE.d, 1)} mm sur le modèle) : l'effort se répartit sur le tour du tube au lieu de l'écraser. La biellette a passé de ${fr(SURCENTRE, 1)} mm l'alignement de ses deux articulations : la pince reste serrée sans qu'on la tienne.` },
  { title: 'Déverrouiller et ouvrir', text: `Le levier logé dans la poignée mobile fait repasser la biellette par son point mort ; le ressort ouvre alors la mâchoire mobile. Sur le modèle, elle tourne de ${fr(THETA_MAX / RAD)}° et la poignée de ${fr(etat(T_MAX).psi / RAD)}° : le jour entre les coquilles passe de ${fr(jour(0), 1)} à ${fr(jour(THETA_MAX))} mm, de quoi dégager le tube.` },
  { title: 'Refermer : la genouillère verrouille', text: 'En refermant la poignée, la biellette se réaligne entre la poignée et le bout de la vis de réglage : l\'effort de serrage est maximal au point mort, juste avant le verrouillage. La vis moletée du bout du corps déplace l\'appui de la biellette : c\'est elle qui règle la pince à la grandeur du tube et la force du serrage.' },
];

/** P02 : la même pince, animée en trois temps (verrouillée, ouverte, refermée). */
export function P02(api) {
  const poser = assemblage(api);
  const k = [0, 0];
  const maj = () => poser(T_MAX * (smooth(k[0]) - smooth(k[1])));
  k.forEach((_, i) => {
    const g = api.S.group();
    g.userData.stepAnim = { step: i + 1, delay: 300, dur: 2600, update: (v) => { k[i] = v; maj(); } };
    api.add(g);
  });
  // Même point de vue aux trois étapes, assez large pour la pince ouverte : de dessus.
  const cible = [0.14, HAUT * MM, -0.045], recul = [0.02, 0.4, 0.14];
  const cam = { pos: cible.map((v, i) => v + recul[i]), tgt: cible };
  return { view: { dir: [0.05, 1, 0.4], steps: STEPS.map((s) => ({ ...s, cam })), stepsAuto: true } };
}

export default { P01, P02 };

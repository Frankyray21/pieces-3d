// Pince-monseigneur Garant CB60PC (série Pro, 60 po, pointe en biseau) : barre
// forgée d'une seule pièce, reconstituée d'après une photo du produit (P01 :
// barre debout, pointe en bas ; 546 pixels pour 60 po, soit 2,79 mm par pixel).
//
// Données publiées par Garant, reprises telles quelles : longueur de 60 po,
// lame de 1 1/8 po (côté du pied carré), acier forgé et trempé, tête en biseau,
// masse de 18 lb (non imposée au modèle : elle sert de contrôle, voir masse()).
// Tout le reste est relevé sur la photo, à un demi-pixel près (1,4 mm) sur les
// largeurs et un pixel (2,8 mm) sur les longueurs, puis arrondi au 1/8 po :
// longueurs des trois tronçons, diamètre de la poignée, longueur du biseau
// (laissé en acier nu).
//
// Demandes du client : pas d'étiquette (la photo en montre une, enroulée sur le
// pied carré), et une barre qui a servi — peinture usée jusqu'à l'acier sur les
// arêtes, au bout de la poignée et près de la pointe, taches de rouille. La
// photo montre une barre neuve : l'usure est une mise en apparence, elle ne
// change aucune cote.
//
// Repère de la barre, en millimètres : s le long de l'axe, de 0 (bout de la
// poignée) à L (tranchant) ; u et v en travers. La face v = +h est la face
// plate, qui file jusqu'au tranchant ; le biseau entame la face opposée.
// Modèle : barre couchée sur le sol (Y = 0), pointe vers −X, face plate vers
// le haut, mètres.
import * as THREE from 'three';
import { withFinish } from '../../viewer/materials.js';
import { creaseNormals } from '../../viewer/shapes.js';

const MM = 0.001;
export const IN = 25.4;

// ------------------------------------------------------------------ cotes (mm)

export const L = 60 * IN; // donnée publiée
export const CARRE = (1 + 1 / 8) * IN; // côté du pied carré : la « lame de 1 1/8 po » publiée
/** Poignée ronde : Ø relevé 22,3 mm (8,0 px), longueur relevée 578 mm (207 px). */
export const POIGNEE = { d: (7 / 8) * IN, long: (22 + 3 / 4) * IN, chanfrein: 1.5 };
/** Fût octogonal : 29 à 33 mm de large sur la photo (un octogone de 1 1/8 po sur plats en montre 28,6 à 30,9). */
export const FUT = { plats: CARRE, long: (23 + 3 / 8) * IN };
/** Pied carré, biseau compris. */
export const PIED = { long: L - POIGNEE.long - FUT.long };
/** Biseau : 25 à 26 px sur la photo, où la peinture s'arrête à son départ ; le tranchant émoussé de 2 mm est supposé. */
export const BISEAU = { long: (2 + 3 / 4) * IN, tranchant: 2 };
/** Épaulements : poignée → fût (flare d'environ 2,5 px), fût → pied (1 à 2 px). */
export const EPAULE = { fut: 8, pied: 6 };
/** Masse volumique de l'acier (kg/m³), pour le contrôle de la masse. */
export const ACIER = 7850;

const h = CARRE / 2;
const S_FUT = POIGNEE.long; // début du fût octogonal
const S_PIED = POIGNEE.long + FUT.long; // début du pied carré
const S_BISEAU = L - BISEAU.long; // début du biseau, fin de la peinture

// ------------------------------------------------------------------ sections

const N = 64; // points par section : sommets de l'octogone (tous les 8) et du carré (tous les 16) compris
const S01 = (t) => { const u = Math.max(0, Math.min(1, t)); return u * u * (3 - 2 * u); };
/** Rayon polaire d'un polygone régulier de n côtés et d'apothème a, une face tournée vers l'angle 0. */
function polygone(n, a) {
  const pas = (2 * Math.PI) / n;
  return (phi) => a / Math.cos(phi - Math.round(phi / pas) * pas);
}
const rond = (r) => () => r;
const octogone = polygone(8, FUT.plats / 2);
const carre = polygone(4, h);
/** Section [u, v] de rayon polaire rho(phi). */
function section(rho) {
  const pts = [];
  for (let j = 0; j < N; j++) { const phi = (j / N) * 2 * Math.PI, r = rho(phi); pts.push([r * Math.cos(phi), r * Math.sin(phi)]); }
  return pts;
}
/** Section intermédiaire entre deux formes (t de 0 à 1). */
const entre = (a, b, t) => section((phi) => a(phi) + (b(phi) - a(phi)) * S01(t));

/**
 * Usure par point d'une section (attribut aWear, voir withFinish) : fond partout, 1 sur les
 * arêtes (un sommet tous les `pas` points) et `voisin` sur les points d'à côté.
 */
function usure(fond, pas = 0, voisin = 0) {
  const w = new Array(N).fill(fond);
  if (pas) for (let j = pas / 2; j < N; j += pas) { w[j] = 1; for (const k of [j - 1, j + 1]) w[(k + N) % N] = Math.max(fond, voisin); }
  return w;
}
const melange = (a, b, t) => a.map((v, j) => v + (b[j] - v) * S01(t));
/** Fond d'usure des trois tronçons (mains sur la poignée, travail près de la pointe) et arêtes. */
const USURE = { bout: 1, poignee: 0.42, fut: 0.12, pied: 0.16, pointe: 0.6, coupe: 0 };
const usurePoignee = () => usure(USURE.poignee);
const usureFut = () => usure(USURE.fut, 8, 0.45);
const usurePied = (fond = USURE.pied) => usure(fond, 16, Math.max(0.35, fond));

/**
 * Volume fermé passant par des sections [{ s, pts, w }] de N points (w : usure
 * par point), dans le repère du modèle : s le long de −X (pointe à gauche),
 * u le long de −Z, v le long de Y, axe à h du sol. bouts : usure des deux
 * faces d'extrémité. Arêtes de moins de 30° lissées.
 */
function volume(sections, bouts = [USURE.coupe, USURE.coupe]) {
  const rings = sections.map(({ s, pts, w }) => pts.map(([u, v], j) => ({ p: place(s, u, v), w: w[j] })));
  const pos = [], wear = [];
  const tri = (...abc) => abc.forEach(({ p, w }) => { pos.push(...p); wear.push(w); });
  for (let i = 0; i < rings.length - 1; i++) {
    const A = rings[i], B = rings[i + 1];
    for (let j = 0; j < N; j++) {
      const k = (j + 1) % N;
      tri(A[j], A[k], B[k]);
      tri(A[j], B[k], B[j]);
    }
  }
  const bouche = (ring, sens, w) => {
    const c = { p: [0, 0, 0], w };
    ring.forEach(({ p }) => { c.p[0] += p[0] / N; c.p[1] += p[1] / N; c.p[2] += p[2] / N; });
    const bord = ring.map(({ p }) => ({ p, w }));
    for (let j = 0; j < N; j++) {
      const k = (j + 1) % N;
      if (sens) tri(c, bord[k], bord[j]); else tri(c, bord[j], bord[k]);
    }
  };
  bouche(rings[0], true, bouts[0]);
  bouche(rings[rings.length - 1], false, bouts[1]);
  return solide(pos, wear);
}

/** Point du repère de la barre (s, u, v en mm) dans le repère du modèle (m). */
function place(s, u, v) {
  return [(L / 2 - s) * MM, (h + v) * MM, -u * MM];
}

/** Géométrie fermée à partir de triangles : faces tournées vers l'extérieur, normales lissées sous 30°, usure par sommet. */
function solide(pos, wear) {
  if (volumeSigne(pos) < 0) {
    for (let i = 0; i < pos.length; i += 9) for (let k = 0; k < 3; k++) { const t = pos[i + 3 + k]; pos[i + 3 + k] = pos[i + 6 + k]; pos[i + 6 + k] = t; }
    for (let i = 0; i < wear.length; i += 3) { const t = wear[i + 1]; wear[i + 1] = wear[i + 2]; wear[i + 2] = t; }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('aWear', new THREE.Float32BufferAttribute(wear, 1));
  return creaseNormals(geo, (30 * Math.PI) / 180);
}

function volumeSigne(pos) {
  let vol = 0;
  for (let i = 0; i < pos.length; i += 9) {
    vol += pos[i] * (pos[i + 4] * pos[i + 8] - pos[i + 5] * pos[i + 7])
      - pos[i + 1] * (pos[i + 3] * pos[i + 8] - pos[i + 5] * pos[i + 6])
      + pos[i + 2] * (pos[i + 3] * pos[i + 7] - pos[i + 4] * pos[i + 6]);
  }
  return vol / 6;
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
/**
 * Peinture rouge orangé de la photo (teinte relevée sur les faces éclairées), ternie par l'usage :
 * moins de vernis, salissures, taches de rouille, acier à nu où l'usure du maillage est forte.
 */
const rouge = () => teinte('pince-monseigneur-rouge', () => withFinish(new THREE.MeshPhysicalMaterial({
  color: 0xb9280d, metalness: 0, roughness: 0.5, specularIntensity: 1, clearcoat: 0.45, clearcoatRoughness: 0.3,
}), 'paint', { tint: 0.15, rough: 0.24, rust: 0.17, rs: 26, wear: 0.5 }));
/** Acier nu de la pointe : gris mat sur la photo, piqué de rouille. */
const acierNu = () => teinte('pince-monseigneur-acier', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0x9c968c, metalness: 0.9, roughness: 0.5,
}), 'machined', { rust: 0.3, rs: 30 }));

// ------------------------------------------------------------------ zones de la barre

/** Repère 1 : poignée ronde, bout coupé droit à arête cassée ; le bout est le plus usé. */
function poignee() {
  const r = POIGNEE.d / 2, c = POIGNEE.chanfrein;
  return new THREE.Mesh(volume([
    { s: 0, pts: section(rond(r - c)), w: usure(USURE.bout) },
    { s: c, pts: section(rond(r)), w: usure(USURE.bout) },
    { s: 45, pts: section(rond(r)), w: usurePoignee() },
    { s: S_FUT - EPAULE.fut, pts: section(rond(r)), w: usurePoignee() },
  ], [USURE.bout, USURE.coupe]), rouge());
}

/** Repère 2 : fût octogonal, avec l'épaulement qui le raccorde à la poignée. */
function fut() {
  const r = rond(POIGNEE.d / 2);
  const sections = [];
  for (let k = 0; k <= 6; k++) sections.push({ s: S_FUT - EPAULE.fut * (1 - k / 6), pts: entre(r, octogone, k / 6), w: melange(usurePoignee(), usureFut(), k / 6) });
  sections.push({ s: S_PIED - EPAULE.pied, pts: section(octogone), w: usureFut() });
  return new THREE.Mesh(volume(sections), rouge());
}

/** Repère 3 : pied carré peint, avec l'épaulement où les pans coupés du fût s'effacent ; plus usé vers la pointe. */
function pied() {
  const sections = [];
  for (let k = 0; k <= 4; k++) sections.push({ s: S_PIED - EPAULE.pied * (1 - k / 4), pts: entre(octogone, carre, k / 4), w: melange(usureFut(), usurePied(), k / 4) });
  sections.push({ s: S_BISEAU - 90, pts: section(carre), w: usurePied() });
  sections.push({ s: S_BISEAU, pts: section(carre), w: usurePied(USURE.pointe) });
  return new THREE.Mesh(volume(sections), rouge());
}

/** Repère 4 : pointe en biseau, acier nu ; la face plate (v = +h) file jusqu'au tranchant. */
function pointe() {
  const e = BISEAU.tranchant;
  // Quatre coins par section : [u, v] = (−h, bas), (h, bas), (h, h), (−h, h).
  const coins = (s, bas) => [place(s, -h, bas), place(s, h, bas), place(s, h, h), place(s, -h, h)];
  const A = coins(S_BISEAU, -h), C = coins(L, h - e);
  const pos = [];
  const quad = (a, b, c, d) => pos.push(...a, ...b, ...c, ...a, ...c, ...d);
  quad(A[0], A[1], A[2], A[3]); // coupe côté peinture
  quad(C[0], C[1], C[2], C[3]); // tranchant émoussé
  quad(A[3], A[2], C[2], C[3]); // face plate
  quad(A[0], A[1], C[1], C[0]); // biseau
  quad(A[0], C[0], C[3], A[3]); // flancs
  quad(A[1], C[1], C[2], A[2]);
  // Solide convexe : chaque triangle tourné à l'opposé du centre. Faces planes, une normale par face.
  const centre = [0, 1, 2].map((k) => [...A, ...C].reduce((t, q) => t + q[k] / 8, 0));
  for (let i = 0; i < pos.length; i += 9) {
    const a = pos.slice(i, i + 3), b = pos.slice(i + 3, i + 6), c = pos.slice(i + 6, i + 9);
    const ab = b.map((q, k) => q - a[k]), ac = c.map((q, k) => q - a[k]);
    const n = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
    if (n.reduce((t, q, k) => t + q * (a[k] - centre[k]), 0) < 0) pos.splice(i + 3, 6, ...c, ...b);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, acierNu());
}

// ------------------------------------------------------------------ contrôle

/** Volume d'acier du modèle (m³) et masse à 7 850 kg/m³, à comparer aux 18 lb publiées. */
export function masse() {
  let vol = 0;
  for (const m of [poignee(), fut(), pied(), pointe()]) vol += Math.abs(volumeSigne(m.geometry.attributes.position.array));
  const kg = vol * ACIER;
  return { vol, kg, lb: kg / 0.45359237 };
}

/** Angle du biseau avec l'axe de la barre (degrés). */
export const angleBiseau = () => (Math.atan((CARRE - BISEAU.tranchant) / BISEAU.long) * 180) / Math.PI;

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  // Barre forgée d'une seule pièce : les repères 1 à 4 désignent ses zones. En vue éclatée, elles
  // s'écartent le long de l'axe pour montrer les trois sections (ronde, octogonale, carrée).
  api.part('1', poignee(), [0.16, 0, 0]);
  api.part('2', fut(), [0, 0, 0]);
  api.part('3', pied(), [-0.16, 0, 0]);
  api.part('4', pointe(), [-0.26, 0, 0]);
  // Coupe proposée : en travers du fût octogonal.
  return { view: { dir: [-0.45, 0.5, 1], section: { axis: 'x', pos: 0.5 } } };
}

export default { P01 };

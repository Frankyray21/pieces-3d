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
// (laissé en acier nu), place de l'étiquette.
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
/** Étiquette enroulée sur le pied carré : distances au tranchant relevées sur la photo. */
export const ETIQUETTE = { bas: (4 + 5 / 8) * IN, haut: 10 * IN, blanc: 0.27 };
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
 * Volume fermé passant par des sections [{ s, pts }] de N points, dans le
 * repère du modèle : s le long de −X (pointe à gauche), u le long de −Z,
 * v le long de Y, axe à h du sol. Arêtes de moins de 30° lissées.
 */
function volume(sections) {
  const rings = sections.map(({ s, pts }) => pts.map(([u, v]) => place(s, u, v)));
  const pos = [];
  const tri = (a, b, c) => pos.push(...a, ...b, ...c);
  for (let i = 0; i < rings.length - 1; i++) {
    const A = rings[i], B = rings[i + 1];
    for (let j = 0; j < N; j++) {
      const k = (j + 1) % N;
      tri(A[j], A[k], B[k]);
      tri(A[j], B[k], B[j]);
    }
  }
  const bouche = (ring, sens) => {
    const c = [0, 0, 0];
    ring.forEach((p) => { c[0] += p[0] / N; c[1] += p[1] / N; c[2] += p[2] / N; });
    for (let j = 0; j < N; j++) {
      const k = (j + 1) % N;
      if (sens) tri(c, ring[k], ring[j]); else tri(c, ring[j], ring[k]);
    }
  };
  bouche(rings[0], true);
  bouche(rings[rings.length - 1], false);
  return solide(pos);
}

/** Point du repère de la barre (s, u, v en mm) dans le repère du modèle (m). */
function place(s, u, v) {
  return [(L / 2 - s) * MM, (h + v) * MM, -u * MM];
}

/** Géométrie fermée à partir de triangles : faces tournées vers l'extérieur, normales lissées sous 30°. */
function solide(pos) {
  if (volumeSigne(pos) < 0) for (let i = 0; i < pos.length; i += 9) for (let k = 0; k < 3; k++) { const t = pos[i + 3 + k]; pos[i + 3 + k] = pos[i + 6 + k]; pos[i + 6 + k] = t; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
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
/** Peinture rouge orangé brillante de la photo (teinte relevée sur les faces éclairées). */
const rouge = () => teinte('pince-monseigneur-rouge', () => withFinish(new THREE.MeshPhysicalMaterial({
  color: 0xc22a0d, metalness: 0, roughness: 0.4, specularIntensity: 1, clearcoat: 0.75, clearcoatRoughness: 0.14,
}), 'paint'));
/** Acier nu de la pointe : gris mat sur la photo. */
const acierNu = () => teinte('pince-monseigneur-acier', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0x9c968c, metalness: 0.9, roughness: 0.5,
}), 'machined'));

/** Image dessinée sur un canevas (aucune hors navigateur : la couleur unie reste). */
function image(nom, w, ht, dessin) {
  if (typeof document === 'undefined') return null;
  if (perso.has(`img:${nom}`)) return perso.get(`img:${nom}`);
  const c = document.createElement('canvas');
  c.width = w; c.height = ht;
  dessin(c.getContext('2d'), w, ht);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  perso.set(`img:${nom}`, t);
  return t;
}

// ------------------------------------------------------------------ zones de la barre

/** Repère 1 : poignée ronde, bout coupé droit à arête cassée. */
function poignee() {
  const r = POIGNEE.d / 2, c = POIGNEE.chanfrein;
  return new THREE.Mesh(volume([
    { s: 0, pts: section(rond(r - c)) },
    { s: c, pts: section(rond(r)) },
    { s: S_FUT - EPAULE.fut, pts: section(rond(r)) },
  ]), rouge());
}

/** Repère 2 : fût octogonal, avec l'épaulement qui le raccorde à la poignée. */
function fut() {
  const r = rond(POIGNEE.d / 2);
  const sections = [];
  for (let k = 0; k <= 6; k++) sections.push({ s: S_FUT - EPAULE.fut * (1 - k / 6), pts: entre(r, octogone, k / 6) });
  sections.push({ s: S_PIED - EPAULE.pied, pts: section(octogone) });
  return new THREE.Mesh(volume(sections), rouge());
}

/** Repère 3 : pied carré peint, avec l'épaulement où les pans coupés du fût s'effacent. */
function pied() {
  const sections = [];
  for (let k = 0; k <= 4; k++) sections.push({ s: S_PIED - EPAULE.pied * (1 - k / 4), pts: entre(octogone, carre, k / 4) });
  sections.push({ s: S_BISEAU, pts: section(carre) });
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

/** Dessin de l'étiquette déroulée : quatre faces côte à côte, le haut vers la poignée. */
function dessinEtiquette(x, w, ht) {
  const f = w / 4, y1 = ht * (1 - ETIQUETTE.blanc);
  x.fillStyle = '#2b2420'; x.fillRect(0, 0, w, y1);
  x.fillStyle = '#f1efe9'; x.fillRect(0, y1, w, ht - y1);
  const lignes = (x0, y0, n, large, couleur) => {
    x.fillStyle = couleur;
    for (let i = 0; i < n; i++) x.fillRect(x0, y0 + i * ht * 0.03, large * (0.95 - (i % 3) * 0.17), ht * 0.007);
  };
  // Face plate : pastille jaune en haut à gauche, texte suggéré, rond du bas de l'étiquette.
  x.fillStyle = '#e0b01f'; x.fillRect(f * 0.08, ht * 0.02, f * 0.42, ht * 0.14);
  lignes(f * 0.13, ht * 0.045, 3, f * 0.3, '#2b2420');
  lignes(f * 0.1, ht * 0.21, 14, f * 0.8, '#857e74');
  x.strokeStyle = '#1d1a18'; x.lineWidth = f * 0.07;
  x.beginPath(); x.arc(f * 0.3, (y1 + ht) / 2, f * 0.2, 0, 2 * Math.PI); x.stroke();
  x.strokeStyle = '#b3221a'; x.lineWidth = f * 0.05;
  x.beginPath(); x.arc(f * 0.3, (y1 + ht) / 2, f * 0.1, 0.25 * Math.PI, 1.75 * Math.PI); x.stroke();
  // Face voisine : cartouche blanc en haut, texte suggéré.
  x.fillStyle = '#f1efe9'; x.fillRect(f * 1.3, ht * 0.02, f * 0.6, ht * 0.17);
  lignes(f * 1.36, ht * 0.04, 4, f * 0.48, '#2b2420');
  lignes(f * 1.1, ht * 0.24, 13, f * 0.8, '#857e74');
  // Faces cachées sur la photo : texte suggéré seulement.
  for (const k of [2, 3]) lignes(f * (k + 0.1), ht * 0.05, 19, f * 0.8, '#857e74');
}

/** Repère 5 : étiquette enroulée sur les quatre faces du pied carré. */
function etiquette() {
  const sa = L - ETIQUETTE.haut, sb = L - ETIQUETTE.bas; // haut (vers la poignée) et bas
  const d = h + 0.06; // à peine décollée de la peinture
  const pos = [], uv = [], idx = [];
  // Faces dans l'ordre de l'étiquette déroulée : plate (v+), voisine (u−, vers l'avant du modèle), opposée, arrière.
  const faces = [[[0, 1], [-1, 0]], [[-1, 0], [0, -1]], [[0, -1], [1, 0]], [[1, 0], [0, 1]]]; // [normale, droite] en (u, v)
  faces.forEach(([n, t], k) => {
    const base = pos.length / 3;
    for (const [c, s, v] of [[-1, sb, 0], [1, sb, 0], [1, sa, 1], [-1, sa, 1]]) {
      pos.push(...place(s, n[0] * d + t[0] * c * h, n[1] * d + t[1] * c * h));
      uv.push((k + (c + 1) / 2) / 4, v);
    }
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const haut = ETIQUETTE.haut - ETIQUETTE.bas;
  const map = image('pince-monseigneur-etiquette', 1024, Math.round((1024 * haut) / (4 * CARRE)), dessinEtiquette);
  const m = teinte('pince-monseigneur-etiquette', () => new THREE.MeshStandardMaterial(map ? { map, metalness: 0, roughness: 0.5 } : { color: 0x2b2420, metalness: 0, roughness: 0.5 }));
  return new THREE.Mesh(geo, m);
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
  // Barre forgée d'une seule pièce : les repères 1 à 4 désignent ses zones, qui ne se séparent pas.
  api.part('1', poignee(), [0, 0, 0]);
  api.part('2', fut(), [0, 0, 0]);
  api.part('3', pied(), [0, 0, 0]);
  api.part('4', pointe(), [0, 0, 0]);
  api.part('5', etiquette(), [0, 0.09, 0]);
  // Coupe proposée : en travers du fût octogonal.
  return { view: { dir: [-0.45, 0.5, 1], section: { axis: 'x', pos: 0.5 } } };
}

export default { P01 };

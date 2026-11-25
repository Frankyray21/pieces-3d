// Mini bac de rétention 100 L en PEHD jaune, à poser, avec caillebotis amovible
// (réf. PF100006F sans caillebotis, PFCP100006F avec caillebotis), d'après la
// page du produit fournie par le client (capture de la fiche du distributeur
// neatfx) : photo du bac (P01) et caractéristiques techniques (P02). Aucun plan
// lisible (le dessin coté de la galerie n'est qu'une vignette).
//
// Cotes publiées : 990 × 645 × 145 mm hors tout, caillebotis de 930 × 525 mm,
// jaune TEIN006 (proche RAL 1028), rétention de 100 L, charge admissible de
// 150 kg. Relevé sur la photo, par proportion avec la longueur hors tout : la
// lèvre du bord, la ceinture sous la lèvre, les passages (encoches) au pied des
// parois, le pas de la grille du caillebotis. L'intérieur (épaulement qui porte
// le caillebotis, profondeur de la cuve) est supposé.
//
// Affiche « MAX 100 LITRES » : ajoutée à la demande du client, collée au milieu
// de la ceinture, côté long avant.
//
// Repère, en millimètres : y vers le haut (0 au sol), x le long du bac, z vers
// l'avant (côté de la photo). Modèle en mètres.
import * as THREE from 'three';
import { withFinish } from '../../viewer/materials.js';

const MM = 0.001;

// ------------------------------------------------------------------ cotes (mm)

/** Encombrement publié (L × l × h). */
export const HORS_TOUT = { L: 990, P: 645, H: 145 };
/** Lèvre du bord, sur tout le pourtour, au-dessus de la ceinture (relevée sur la photo). */
export const LEVRE = { haut: 18, r: 22 };
/** Paroi sous la lèvre : retrait de la lèvre, rayon des angles. */
export const PAROI = { retrait: 6, r: 18 };
/** Ceinture : bande pleine sous la lèvre, au-dessus des passages (bas à y). */
export const CEINTURE = { y: 82 };
/** Passages au pied des parois (relevés sur la photo) : centres, largeur, profondeur. */
export const PASSAGES = {
  long: { x: [-330, -110, 110, 330], large: 118, prof: 30 },
  court: { z: [-150, 150], large: 118, prof: 18 },
};
/** Ouverture de la cuve sous la lèvre : 5 mm de jeu autour du caillebotis (supposé). */
export const OUVERTURE = { L: 940, P: 535, r: 14 };
/** Épaulement qui porte le caillebotis, et cuve sous l'épaulement (supposés). */
export const EPAULEMENT = { y: 108, retrait: 15 };
/** Fond de la cuve (épaisseur sous la cuve, supposée). */
export const FOND = { ep: 14 };
/** Caillebotis publié : 930 × 525 mm ; hauteur et grille relevées sur la photo (30 × 13 alvéoles). */
export const CAILLEBOTIS = { L: 930, P: 525, haut: 30, cadre: 8, barre: 4, nx: 30, nz: 13 };
/** Données publiées. */
export const PUBLIE = { retention: 100, charge: 150 };
/** Affiche « MAX 100 LITRES » (demande du client) : sur la ceinture, côté long avant. */
export const AFFICHE = { L: 300, H: 38, ep: 0.4 };

// ------------------------------------------------------------------ géométrie dérivée

/** Dessus du caillebotis (5 mm sous le haut de la lèvre). */
export const dessusCaillebotis = () => EPAULEMENT.y + CAILLEBOTIS.haut;
/** Cuve sous l'épaulement (mm). */
export const cuve = () => ({ L: OUVERTURE.L - 2 * EPAULEMENT.retrait, P: OUVERTURE.P - 2 * EPAULEMENT.retrait });

/** Volume du rectangle à angles arrondis (L × P, rayon r) sur la hauteur h (litres). */
const volRect = (L, P, r, h) => ((L * P - (4 - Math.PI) * r * r) * h) / 1e6;
/** Volume (litres) du caillebotis : cadre et barres. */
export function volumeCaillebotis() {
  const C = CAILLEBOTIS, l = C.L - 2 * C.cadre, p = C.P - 2 * C.cadre;
  const cadre = C.L * C.P - l * p;
  const barres = (C.nx - 1) * C.barre * p + (C.nz - 1) * C.barre * l - (C.nx - 1) * (C.nz - 1) * C.barre * C.barre;
  return ((cadre + barres) * C.haut) / 1e6;
}
/**
 * Volume de rétention du modèle (litres), jusqu'au haut de la lèvre :
 * cuve sous l'épaulement et ouverture au-dessus, moins le caillebotis en place.
 */
export function volumeRetention() {
  const c = cuve();
  const bas = volRect(c.L, c.P, OUVERTURE.r, EPAULEMENT.y - FOND.ep);
  const haut = volRect(OUVERTURE.L, OUVERTURE.P, OUVERTURE.r, HORS_TOUT.H - EPAULEMENT.y);
  return { brut: bas + haut, net: bas + haut - volumeCaillebotis() };
}
/** Volume de l'encombrement publié (litres) : plafond de tout volume de rétention. */
export const volumeEncombrement = () => (HORS_TOUT.L * HORS_TOUT.P * HORS_TOUT.H) / 1e6;

// ------------------------------------------------------------------ matériaux

const perso = new Map();
function teinte(nom, creer) {
  let m = perso.get(nom);
  if (!m) {
    m = creer();
    if (m.isMaterial) {
      m.polygonOffset = true;
      m.polygonOffsetFactor = 1;
      m.polygonOffsetUnits = 1;
      m.name = nom;
    }
    perso.set(nom, m);
  }
  return m;
}

/** PEHD jaune TEIN006 (proche RAL 1028, jaune melon) : satiné. */
const jaune = () => teinte('bac-pehd-jaune', () => withFinish(new THREE.MeshPhysicalMaterial({
  color: 0xf2a81d, metalness: 0, roughness: 0.48, clearcoat: 0.15, clearcoatRoughness: 0.5,
}), 'plastic'));
/** Caillebotis noir (PP ou PEHD selon la fiche). */
const noir = () => teinte('bac-caillebotis-noir', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0x232428, metalness: 0, roughness: 0.62,
}), 'plastic'));

/**
 * Affiche « MAX 100 LITRES » dessinée sur un canevas : fond blanc, cadre rouge,
 * texte noir. Sans navigateur (contrôles dans Node), fond blanc uni.
 */
function papier() {
  let map = null;
  if (typeof document !== 'undefined') {
    map = teinte('img:bac-affiche', () => {
      const k = 8; // pixels par mm
      const c = document.createElement('canvas');
      c.width = AFFICHE.L * k;
      c.height = AFFICHE.H * k;
      const g = c.getContext('2d');
      g.fillStyle = '#c8211c';
      g.fillRect(0, 0, c.width, c.height);
      const b = 2.2 * k;
      g.fillStyle = '#ffffff';
      g.fillRect(b, b, c.width - 2 * b, c.height - 2 * b);
      g.fillStyle = '#111111';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const police = '"Arial Black", "Helvetica Neue", Helvetica, Arial, sans-serif';
      const titre = 'MAX 100 LITRES';
      let corps = c.height * 0.62;
      g.font = `900 ${corps}px ${police}`;
      const w = g.measureText(titre).width;
      if (w > c.width * 0.9) { corps *= (c.width * 0.9) / w; g.font = `900 ${corps}px ${police}`; }
      g.fillText(titre, c.width / 2, c.height * 0.53);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    });
  }
  return teinte('bac-affiche', () => new THREE.MeshStandardMaterial(
    map ? { map, metalness: 0, roughness: 0.55 } : { color: 0xffffff, metalness: 0, roughness: 0.55 },
  ));
}

// ------------------------------------------------------------------ contours

/** Arc d'angle : centre (cx, cz), rayon r, de a0 à a1 (radians). */
function arc(pts, cx, cz, r, a0, a1, n = 6) {
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
  }
}

/**
 * Contour (x, z) d'un rectangle L × P à angles de rayon r, sens trigonométrique,
 * avec, si `encoches`, les passages au pied des parois (rentrants).
 */
function contour(L, P, r, encoches = false) {
  const a = L / 2, b = P / 2, pts = [];
  const pl = PASSAGES.long, pc = PASSAGES.court;
  const creux = (centres, large, prof, cote) => {
    // cote : 'bas' (z = −b, x croissant), 'droite' (x = a, z croissant), 'haut' (z = b, x décroissant), 'gauche' (x = −a, z décroissant)
    const liste = [...centres].sort((u, v) => u - v);
    if (cote === 'haut' || cote === 'gauche') liste.reverse();
    for (const c of liste) {
      const s = cote === 'haut' || cote === 'gauche' ? -1 : 1;
      const u0 = c - s * large / 2, u1 = c + s * large / 2;
      if (cote === 'bas') pts.push([u0, -b], [u0, -b + prof], [u1, -b + prof], [u1, -b]);
      if (cote === 'haut') pts.push([u0, b], [u0, b - prof], [u1, b - prof], [u1, b]);
      if (cote === 'droite') pts.push([a, u0], [a - prof, u0], [a - prof, u1], [a, u1]);
      if (cote === 'gauche') pts.push([-a, u0], [-a + prof, u0], [-a + prof, u1], [-a, u1]);
    }
  };
  arc(pts, -a + r, -b + r, r, Math.PI, 1.5 * Math.PI);
  if (encoches) creux(pl.x, pl.large, pl.prof, 'bas');
  arc(pts, a - r, -b + r, r, 1.5 * Math.PI, 2 * Math.PI);
  if (encoches) creux(pc.z, pc.large, pc.prof, 'droite');
  arc(pts, a - r, b - r, r, 0, 0.5 * Math.PI);
  if (encoches) creux(pl.x, pl.large, pl.prof, 'haut');
  arc(pts, -a + r, b - r, r, 0.5 * Math.PI, Math.PI);
  if (encoches) creux(pc.z, pc.large, pc.prof, 'gauche');
  return pts;
}

/** Galette horizontale : contour extérieur (x, z), trou éventuel (x, z), de y0 à y1 (mm). */
function galette(S, dehors, trou, y0, y1, matiere) {
  // Le contour (x, z) est extrudé dans le plan (x, y) puis couché : y du contour → −z.
  const flip = (pts) => pts.map(([x, z]) => [x * MM, -z * MM]);
  const m = S.extrude(flip(dehors), (y1 - y0) * MM, matiere, { holes: trou ? [flip(trou).reverse()] : [] });
  m.rotation.x = -Math.PI / 2;
  m.position.y = ((y0 + y1) / 2) * MM;
  return S.group(m);
}

// ------------------------------------------------------------------ pièces

/** Repère 1 : bac en PEHD jaune (rotomoulé) — lèvre, ceinture, passages au pied, épaulement, cuve. */
function bac(S) {
  const H = HORS_TOUT, Lp = H.L - 2 * PAROI.retrait, Pp = H.P - 2 * PAROI.retrait;
  const ouv = contour(OUVERTURE.L, OUVERTURE.P, OUVERTURE.r);
  const c = cuve(), bas = contour(c.L, c.P, OUVERTURE.r);
  // Une galette par hauteur de la face extérieure (pied à passages, ceinture, lèvre) ;
  // fond et épaulement à l'intérieur, pour ne pas marquer de joint sur les parois.
  const g = S.group(
    galette(S, contour(Lp, Pp, PAROI.r, true), bas, 0, CEINTURE.y, jaune()),
    galette(S, contour(Lp, Pp, PAROI.r), ouv, CEINTURE.y, H.H - LEVRE.haut, jaune()),
    galette(S, contour(H.L, H.P, LEVRE.r), ouv, H.H - LEVRE.haut, H.H, jaune()),
    galette(S, bas, null, 0, FOND.ep, jaune()),
    galette(S, ouv, bas, CEINTURE.y, EPAULEMENT.y, jaune()),
  );
  g.userData.hasInterior = true;
  return g;
}

/** Repère 2 : caillebotis amovible — cadre et grille de 30 × 13 alvéoles, posé sur l'épaulement. */
function caillebotis(S) {
  const C = CAILLEBOTIS, h = C.haut * MM, y = (EPAULEMENT.y + C.haut / 2) * MM;
  const l = C.L - 2 * C.cadre, p = C.P - 2 * C.cadre;
  const pieces = [
    S.box(C.L * MM, h, C.cadre * MM, noir(), { pos: [0, y, ((C.P - C.cadre) / 2) * MM] }),
    S.box(C.L * MM, h, C.cadre * MM, noir(), { pos: [0, y, (-(C.P - C.cadre) / 2) * MM] }),
    S.box(C.cadre * MM, h, p * MM, noir(), { pos: [((C.L - C.cadre) / 2) * MM, y, 0] }),
    S.box(C.cadre * MM, h, p * MM, noir(), { pos: [(-(C.L - C.cadre) / 2) * MM, y, 0] }),
  ];
  for (let i = 1; i < C.nx; i++) {
    pieces.push(S.box(C.barre * MM, h, p * MM, noir(), { pos: [(-l / 2 + (l * i) / C.nx) * MM, y, 0] }));
  }
  // Barres longues un peu plus basses que les barres courtes, comme sur un caillebotis moulé.
  for (let j = 1; j < C.nz; j++) {
    pieces.push(S.box(l * MM, (C.haut - 6) * MM, C.barre * MM, noir(), { pos: [0, y + 3 * MM, (-p / 2 + (p * j) / C.nz) * MM] }));
  }
  const m = S.merged(pieces, noir());
  return S.group(m);
}

/** Repère 3 : affiche « MAX 100 LITRES » collée au milieu de la ceinture, côté avant. */
function affiche() {
  const A = AFFICHE, zf = (HORS_TOUT.P / 2 - PAROI.retrait + A.ep) * MM;
  const y = ((CEINTURE.y + HORS_TOUT.H - LEVRE.haut) / 2) * MM;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(A.L * MM, A.H * MM), papier());
  m.position.set(0, y, zf);
  m.userData.noEdges = true;
  return new THREE.Group().add(m);
}

// ------------------------------------------------------------------ assemblage

/** P01 : le bac, son caillebotis et l'affiche, et leur vue éclatée. */
export function P01(api) {
  const { S } = api, H = HORS_TOUT;
  api.part('1', bac(S), [0, 0, 0], { labelAt: [(-H.L / 2 + 40) * MM, 60 * MM, (H.P / 2 - PAROI.retrait) * MM] });
  api.part('2', caillebotis(S), [0, 0.22, 0], { labelAt: [(CAILLEBOTIS.L / 4) * MM, dessusCaillebotis() * MM, (CAILLEBOTIS.P / 4) * MM] });
  api.part('3', affiche(), [0, 0, 0.12], { labelAt: [(AFFICHE.L / 2) * MM, ((CEINTURE.y + H.H) / 2) * MM, (H.P / 2) * MM] });
  // Vue de la photo : de trois quarts, côté long avant, un peu au-dessus. Coupe proposée : par le milieu.
  return { view: { dir: [0.45, 0.5, 0.75], section: { axis: 'z', pos: 0.5 } } };
}

export default { P01 };

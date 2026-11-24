// Graisse à filets des tiges de forage : bidon de fer-blanc à anneau (type
// bidon de peinture), rempli de graisse, avec le pinceau qui sert à graisser
// les filets. Reconstitué d'après deux photos du client (P01), sans plan ni
// étiquette : ni la marque de la graisse ni celle du bidon ne sont lisibles.
//
// Échelle : sur la photo d'ensemble, deux clés à tuyau de 18 et de 24 po sont
// accrochées à la traverse (voir ECHELLE). Elles donnent environ 1,5 mm par
// pixel, soit un bidon d'environ 150 mm de diamètre, à 10 % près (le bidon
// n'est pas tout à fait à la même distance que les clés). Deux bidons du
// commerce encadrent cette mesure : le demi-gallon (Ø 137 mm) et le gallon US
// (Ø 165 mm). Le gallon est retenu parce que le bidon porte les deux oreilles
// d'une anse, que les bidons plus petits n'ont pas d'ordinaire. À vérifier
// sur place : changer BIDON.d et BIDON.h suffit, tout le reste suit.
//
// Relevé sur les photos : l'anneau du dessus et sa gorge, l'agrafe du flanc,
// les deux oreilles (l'anse n'y est plus), la rouille, le niveau et le
// monticule de graisse, la position du pinceau, sa bande et son bout blancs.
//
// Repère, en millimètres : y vers le haut (0 sous le bidon), x par les deux
// oreilles, +z vers l'observateur de la photo (l'agrafe est de ce côté).
// Modèle en mètres.
import * as THREE from 'three';
import { withFinish } from '../../viewer/materials.js';

const MM = 0.001;
const RAD = Math.PI / 180;
export const IN = 25.4;

// ------------------------------------------------------------------ cotes (mm)

/**
 * Échelle de la photo d'ensemble : longueur en pixels des deux clés à tuyau
 * (de la mâchoire au bout du manche) et longueur réelle, entre la longueur
 * mâchoires fermées (16,0 et 22,3 po, voir cles-a-tuyau) et la grandeur
 * nominale (18 et 24 po). Ø du bidon et largeur du poteau en pixels.
 */
export const ECHELLE = {
  cles: [{ po: 24, ferme: 22.3, px: 384 }, { po: 18, ferme: 16.0, px: 297 }],
  bidonPx: 103,
  poteauPx: 59,
};
/** mm par pixel à la distance des clés : [mini, moyen, maxi]. */
export function mmParPixel() {
  const v = ECHELLE.cles.flatMap((c) => [(c.ferme * IN) / c.px, (c.po * IN) / c.px]);
  return [Math.min(...v), v.reduce((a, b) => a + b, 0) / v.length, Math.max(...v)];
}
/** Ø du bidon mesuré sur la photo, à la distance des clés (mm) : [mini, moyen, maxi]. */
export const bidonMesure = () => mmParPixel().map((k) => k * ECHELLE.bidonPx);

/**
 * Bidon rond de 1 gallon US à anneau : Ø du corps de 6 1/2 po et hauteur de
 * 7 1/2 po (grandeurs courantes du commerce, retenues d'après l'échelle de la
 * photo). Tôle : épaisseur dessinée. Anneau, fond et oreilles relevés sur la photo.
 */
export const BIDON = {
  d: 6.5 * IN,
  h: 7.5 * IN,
  tole: 0.3,
  /** Sertis du haut et du bas : dépassement sur le rayon, hauteur. */
  serti: { saillie: 1.5, haut: 5 },
  /** Fond rentré. */
  fond: 5,
  /** Anneau du dessus : largeur sur le rayon (du corps à l'ouverture), profondeur de la gorge où s'enfonce le couvercle. */
  anneau: { large: 11, gorge: 10 },
  /** Oreilles de l'anse : Ø de la pastille, saillie du bossage, distance sous le dessus. */
  oreille: { d: 18, saillie: 5, sousDessus: 24 },
  /** Agrafe du flanc : largeur, angle depuis +z vers +x (degrés). */
  agrafe: { large: 5, angle: 8 },
};
/** Ø de l'ouverture du bidon (mm). */
export const ouverture = () => BIDON.d - 2 * BIDON.anneau.large;

/**
 * Pinceau plat de 2 po (grandeur prise d'après le manche : environ 19 mm de
 * large et 160 mm hors du bidon sur la photo). Soies et virole sont enfouies
 * dans la graisse : leurs cotes sont celles d'un pinceau courant.
 */
export const PINCEAU = {
  soies: { long: 55, large: 50, epais: 11 },
  virole: { long: 28, large: 52, epais: 13 },
  manche: { long: 185, large: 19, epais: 13 },
  /** Bande blanche du manche : début et fin, mesurés depuis la virole. Bout blanc : longueur. */
  bande: [100, 143],
  bout: 6,
  /** Pose : le manche repose sur le serti, à `hors` mm de son bout ; il monte de `pente` degrés et part à `angle` degrés de +x vers l'arrière. */
  hors: 160,
  pente: 18,
  angle: 25,
};
/** Longueur totale du pinceau (mm). */
export const longPinceau = () => PINCEAU.soies.long + PINCEAU.virole.long + PINCEAU.manche.long;

/** Graisse : niveau courant sous le dessus du bidon, relief de la surface (mm). */
export const GRAISSE = { sousDessus: 24, relief: 2.2 };

const R = BIDON.d / 2;
const H = BIDON.h;

// ------------------------------------------------------------------ pose du pinceau

/** Axe du pinceau : direction (vers le bout du manche), point d'appui sur le serti, bout des soies. */
function axePinceau() {
  const e = PINCEAU.pente * RAD, a = PINCEAU.angle * RAD;
  const d = new THREE.Vector3(Math.cos(e) * Math.cos(a), Math.sin(e), -Math.cos(e) * Math.sin(a));
  const rAppui = R - 1;
  const appui = new THREE.Vector3(rAppui * Math.cos(a), H + PINCEAU.manche.epais / 2 + 0.3, -rAppui * Math.sin(a));
  const origine = appui.clone().addScaledVector(d, -(longPinceau() - PINCEAU.hors)); // bout des soies
  return { d, appui, origine };
}

/** Volume de graisse (litres) : du fond au niveau courant, monticule non compté. */
export function volumeGraisse() {
  const r = R - BIDON.tole;
  return (Math.PI * r * r * (H - GRAISSE.sousDessus - BIDON.fond)) / 1e6;
}

/** Encombrement (mm) : bidon seul, puis bidon et pinceau (long. × larg. × haut.). */
export function horsTout() {
  const { d, origine } = axePinceau();
  const bout = origine.clone().addScaledVector(d, longPinceau());
  const rS = R + BIDON.serti.saillie, o = BIDON.oreille;
  return {
    bidon: { d: 2 * rS, oreilles: 2 * (R + o.saillie + 2), h: H },
    long: Math.max(bout.x, rS) + R + o.saillie + 2,
    large: 2 * rS,
    haut: bout.y + PINCEAU.manche.epais / 2,
    bout: [bout.x, bout.y, bout.z],
  };
}

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

/** Suite pseudo-aléatoire reproductible. */
function suite(graine) {
  let s = graine;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/** Bruit de valeur périodique (période `p` cases) à plusieurs octaves : (u, v) dans [0, 1[ → [0, 1]. */
function bruit(graine, p, octaves = 4) {
  const tables = [];
  for (let o = 0; o < octaves; o++) {
    const n = p << o, h = suite(graine + o * 977), t = new Float32Array(n * n);
    for (let i = 0; i < t.length; i++) t[i] = h();
    tables.push({ n, t });
  }
  const lisse = (x) => x * x * (3 - 2 * x);
  return (u, v) => {
    let somme = 0, poids = 0, amp = 1;
    for (const { n, t } of tables) {
      const x = (((u % 1) + 1) % 1) * n, y = (((v % 1) + 1) % 1) * n;
      const i = Math.floor(x), j = Math.floor(y), fx = lisse(x - i), fy = lisse(y - j);
      const i1 = (i + 1) % n, j1 = (j + 1) % n;
      const a = t[j * n + i] + (t[j * n + i1] - t[j * n + i]) * fx;
      const b = t[j1 * n + i] + (t[j1 * n + i1] - t[j1 * n + i]) * fx;
      somme += (a + (b - a) * fy) * amp;
      poids += amp;
      amp *= 0.5;
    }
    return somme / poids;
  };
}

const melange = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const seuil = (x, a, b) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function texture(nom, N, pixel, repete = true) {
  return teinte(nom, () => {
    const px = new Uint8Array(N * N * 4);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const c = pixel((i + 0.5) / N, (j + 0.5) / N);
        for (let k = 0; k < 3; k++) px[(j * N + i) * 4 + k] = Math.round(Math.min(255, Math.max(0, c[k])));
        px[(j * N + i) * 4 + 3] = 255;
      }
    }
    const t = new THREE.DataTexture(px, N, N, THREE.RGBAFormat);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = repete ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
  });
}

/** Fer-blanc terni et rouillé par plaques, comme sur la photo. */
const ferBlanc = () => teinte('graisse-fer-blanc', () => {
  const gris = bruit(11, 3), tache = bruit(29, 4, 5), grain = bruit(53, 32, 2);
  const map = texture('img:graisse-rouille', 256, (u, v) => {
    let c = melange([118, 119, 115], [176, 178, 174], gris(u, v));
    const r = seuil(tache(u, v) + (grain(u, v) - 0.5) * 0.2, 0.54, 0.68);
    c = melange(c, melange([160, 102, 62], [112, 72, 46], grain(u + 0.3, v)), r * 0.8);
    return c;
  });
  return new THREE.MeshStandardMaterial({ color: 0xffffff, map, metalness: 0.5, roughness: 0.6 });
});
/** Agrafe et oreilles : même tôle, plus sombre et plus rouillée. */
const tolerie = () => teinte('graisse-tolerie', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0x7c6a5b, metalness: 0.5, roughness: 0.66,
}), 'machined'));
const trou = () => teinte('graisse-trou', () => new THREE.MeshStandardMaterial({ color: 0x1b1714, metalness: 0.2, roughness: 0.9 }));
/** Bois du manche, taché de graisse et de rouille (couleur relevée sur la photo). */
const bois = () => teinte('graisse-bois', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0xa85a30, metalness: 0, roughness: 0.62,
}), 'plastic', { fine: 0.02, wave: 0.004, rough: 0.1, tint: 0.1, env: 0.5 }));
const blanc = () => teinte('graisse-blanc', () => new THREE.MeshStandardMaterial({ color: 0xe9e5d8, metalness: 0, roughness: 0.6 }));
const acierVirole = () => teinte('graisse-virole', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0xa7a59c, metalness: 0.7, roughness: 0.42,
}), 'machined'));
const soiesMat = () => teinte('graisse-soies', () => new THREE.MeshStandardMaterial({ color: 0x3a3128, metalness: 0, roughness: 0.85 }));

// ------------------------------------------------------------------ surface de la graisse

/**
 * Hauteur de la surface de la graisse au point (x, z), en mm : niveau courant,
 * relief de pâte brassée, et monticule qui recouvre la tête du pinceau
 * (virole et soies) jusqu'à hauteur du dessus du bidon, comme sur la photo.
 */
const surface = (() => {
  const relief = bruit(71, 5, 3);
  const { d, origine } = axePinceau();
  const tete = PINCEAU.soies.long + PINCEAU.virole.long;
  const rOuv = ouverture() / 2;
  return (x, z) => {
    const r = Math.hypot(x, z);
    const base = H - GRAISSE.sousDessus + (relief(x / 150 + 0.5, z / 150 + 0.5) - 0.5) * 2 * GRAISSE.relief;
    // Distance horizontale au tronçon enfoui du pinceau, et hauteur de son axe à cet endroit.
    const dh = Math.hypot(d.x, d.z);
    const s = Math.min(tete + 6, Math.max(-4, ((x - origine.x) * d.x + (z - origine.z) * d.z) / (dh * dh)));
    const px = origine.x + d.x * s, pz = origine.z + d.z * s, py = origine.y + d.y * s;
    const ecart = Math.hypot(x - px, z - pz);
    const dessus = py + PINCEAU.virole.epais / 2 + 3 + (relief(x / 60, z / 60) - 0.5) * 5;
    const k = 1 - seuil(ecart, PINCEAU.virole.large / 2 + 4, PINCEAU.virole.large / 2 + 24); // dessus plat sur la largeur de la tête
    // Sous l'anneau, la graisse reste au niveau courant (elle ne traverse pas la tôle).
    const libre = 1 - seuil(r, rOuv - 13, rOuv - 2);
    return base + Math.max(0, dessus - base) * k * libre;
  };
})();

/** Couleur de la graisse selon la hauteur : pâte jaunâtre en couche mince, crème pâle en épaisseur. */
function textureGraisse() {
  const Ri = R - BIDON.tole, base = H - GRAISSE.sousDessus;
  const grain = bruit(97, 6, 3);
  return texture('img:graisse-pate', 128, (u, v) => {
    const x = (u - 0.5) * 2 * Ri, z = (v - 0.5) * 2 * Ri;
    const k = seuil(surface(x, z) - base + (grain(u, v) - 0.5) * 6, -1, 9);
    return melange([216, 200, 148], [240, 235, 216], k);
  }, false);
}
const pate = () => teinte('graisse-pate', () => new THREE.MeshPhysicalMaterial({
  color: 0xffffff, map: textureGraisse(), metalness: 0, roughness: 0.36, clearcoat: 0.5, clearcoatRoughness: 0.35,
}));
const pateUnie = () => teinte('graisse-pate-unie', () => new THREE.MeshPhysicalMaterial({
  color: 0xeee7d0, metalness: 0, roughness: 0.36, clearcoat: 0.5, clearcoatRoughness: 0.35,
}));

// ------------------------------------------------------------------ formes

/** Ajoute un point près de chaque bout des longs segments : les arêtes restent franches à l'ombrage. */
function affine(pts) {
  const out = [];
  pts.forEach((p, i) => {
    out.push(p);
    const q = pts[i + 1];
    if (!q) return;
    const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy);
    if (L > 3) {
      out.push([p[0] + (dx / L) * 0.35, p[1] + (dy / L) * 0.35]);
      out.push([q[0] - (dx / L) * 0.35, q[1] - (dy / L) * 0.35]);
    }
  });
  return out;
}

/** Ligne décalée de t vers la gauche du sens de parcours (l'intérieur de la tôle). */
function decale(pts, t) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    return [Math.max(0, p[0] - (dy / L) * t), p[1] + (dx / L) * t];
  });
}

/**
 * Solide de révolution autour de y à partir d'un profil [[r, y], …] en mm.
 * Les coordonnées de texture suivent les longueurs réelles : `pas` mm par
 * répétition le long du profil, `tours` répétitions autour.
 */
function tour(profil, matiere, { seg = 96, pas = 0, tours = 3 } = {}) {
  const g = new THREE.LatheGeometry(profil.map(([r, y]) => new THREE.Vector2(r * MM, y * MM)), seg);
  if (pas) {
    const uv = g.attributes.uv, n = profil.length;
    const s = [0];
    for (let j = 1; j < n; j++) s.push(s[j - 1] + Math.hypot(profil[j][0] - profil[j - 1][0], profil[j][1] - profil[j - 1][1]));
    for (let i = 0; i <= seg; i++) for (let j = 0; j < n; j++) uv.setXY(i * n + j, (i / seg) * tours, s[j] / pas);
  }
  return new THREE.Mesh(g, matiere);
}

/** Profil extérieur de la tôle du bidon, du centre du fond au bord de l'ouverture (mm). */
function profilBidon() {
  const s = BIDON.serti, a = BIDON.anneau, rO = ouverture() / 2;
  return [
    [0, BIDON.fond], [R - 4, BIDON.fond], [R - 4, 0.6], [R - 3, 0],
    [R + s.saillie - 0.4, 0], [R + s.saillie, 0.6], [R + s.saillie, s.haut - 0.8], [R, s.haut + 0.8],
    [R, H - s.haut - 0.8], [R + s.saillie, H - s.haut + 0.8], [R + s.saillie, H - 0.6], [R + s.saillie - 0.5, H],
    [R - 2.4, H], [R - 3, H - 0.8], [R - 3, H - 4.6], [R - 3.6, H - 5.2],
    // Gorge de l'anneau, puis bourrelet du bord de l'ouverture.
    [rO + 5.2, H - 5.2], [rO + 4.6, H - a.gorge], [rO + 2.4, H - a.gorge], [rO + 1.8, H - 4.4],
    [rO + 1, H - 3.6], [rO + 0.3, H - 4.2], [rO, H - 5.6],
  ];
}

/** Repère 1 : bidon de fer-blanc, anneau, agrafe et deux oreilles (anse absente, comme sur la photo). */
function bidon() {
  const g = new THREE.Group();
  const dehors = affine(profilBidon());
  const dedans = decale(dehors, BIDON.tole).reverse();
  g.add(tour([...dehors, ...dedans], ferBlanc(), { seg: 128, pas: 175 }));
  // Agrafe du flanc.
  const ag = BIDON.agrafe, hs = BIDON.serti.haut;
  const agrafe = new THREE.Mesh(new THREE.BoxGeometry(ag.large * MM, (H - 2 * hs - 2) * MM, 0.9 * MM), tolerie());
  agrafe.position.set(R * Math.sin(ag.angle * RAD) * MM, (H / 2) * MM, R * Math.cos(ag.angle * RAD) * MM);
  agrafe.rotation.y = ag.angle * RAD;
  g.add(agrafe);
  // Oreilles de l'anse, sur l'axe x.
  const o = BIDON.oreille;
  for (const cote of [1, -1]) {
    const oreille = new THREE.Group();
    const pastille = new THREE.Mesh(new THREE.CylinderGeometry((o.d / 2) * MM, (o.d / 2) * MM, 1.6 * MM, 28), tolerie());
    const bossage = new THREE.Mesh(new THREE.CylinderGeometry(4.2 * MM, 6 * MM, o.saillie * MM, 24), tolerie());
    bossage.position.y = (o.saillie / 2) * MM;
    const oeil = new THREE.Mesh(new THREE.CylinderGeometry(2 * MM, 2 * MM, 0.4 * MM, 16), trou());
    oeil.position.y = o.saillie * MM;
    oeil.userData.noEdges = true;
    oreille.add(pastille, bossage, oeil);
    oreille.rotation.z = -cote * 90 * RAD; // l'axe de la pastille le long du rayon
    oreille.position.set(cote * (R + 0.4) * MM, (H - o.sousDessus) * MM, 0);
    g.add(oreille);
  }
  return g;
}

/** Repère 2 : graisse, du fond du bidon à sa surface brassée, et bavures sur l'anneau. */
function graisse() {
  const g = new THREE.Group();
  const Ri = R - BIDON.tole - 0.05, y0 = BIDON.fond + BIDON.tole + 0.05;
  const SEG = 120, ANN = 34;
  // Dessus : grille polaire, hauteur donnée par surface().
  const p = [], uv = [], idx = [];
  p.push(0, surface(0, 0) * MM, 0);
  uv.push(0.5, 0.5);
  for (let j = 1; j <= ANN; j++) {
    const r = (j / ANN) * Ri;
    for (let i = 0; i < SEG; i++) {
      const a = (i / SEG) * 2 * Math.PI, x = r * Math.cos(a), z = r * Math.sin(a);
      p.push(x * MM, surface(x, z) * MM, z * MM);
      uv.push(x / (2 * (R - BIDON.tole)) + 0.5, z / (2 * (R - BIDON.tole)) + 0.5);
    }
  }
  const at = (j, i) => 1 + (j - 1) * SEG + (i % SEG);
  for (let i = 0; i < SEG; i++) idx.push(0, at(1, i + 1), at(1, i));
  for (let j = 1; j < ANN; j++) for (let i = 0; i < SEG; i++) idx.push(at(j, i), at(j, i + 1), at(j + 1, i + 1), at(j, i), at(j + 1, i + 1), at(j + 1, i));
  const dessus = new THREE.BufferGeometry();
  dessus.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  dessus.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  dessus.setIndex(idx);
  dessus.computeVertexNormals();
  g.add(new THREE.Mesh(dessus, pate()));
  // Flanc (contre la tôle) et fond.
  const q = [], n = [], k = [];
  for (let i = 0; i <= SEG; i++) {
    const a = (i / SEG) * 2 * Math.PI, c = Math.cos(a), s = Math.sin(a);
    q.push(Ri * c * MM, surface(Ri * c, Ri * s) * MM, Ri * s * MM, Ri * c * MM, y0 * MM, Ri * s * MM);
    n.push(c, 0, s, c, 0, s);
    if (i) k.push(2 * i - 2, 2 * i, 2 * i + 1, 2 * i - 2, 2 * i + 1, 2 * i - 1);
  }
  const centre = q.length / 3;
  q.push(0, y0 * MM, 0);
  n.push(0, -1, 0);
  for (let i = 0; i < SEG; i++) {
    const a0 = (i / SEG) * 2 * Math.PI, a1 = ((i + 1) / SEG) * 2 * Math.PI, b = q.length / 3;
    q.push(Ri * Math.cos(a0) * MM, y0 * MM, Ri * Math.sin(a0) * MM, Ri * Math.cos(a1) * MM, y0 * MM, Ri * Math.sin(a1) * MM);
    n.push(0, -1, 0, 0, -1, 0);
    k.push(centre, b, b + 1);
  }
  const flanc = new THREE.BufferGeometry();
  flanc.setAttribute('position', new THREE.Float32BufferAttribute(q, 3));
  flanc.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3));
  flanc.setIndex(k);
  const corps = new THREE.Mesh(flanc, pateUnie());
  corps.userData.noEdges = true;
  g.add(corps);
  // Bavures de graisse sur l'anneau, devant le pinceau (relevées sur la photo).
  const hasard = suite(420), rO = ouverture() / 2;
  for (let i = 0; i < 6; i++) {
    const a = (-PINCEAU.angle + 14 + i * 7 + hasard() * 3) * RAD, long = 7 + hasard() * 6;
    const bavure = new THREE.Mesh(new THREE.SphereGeometry(1 * MM, 12, 8), pateUnie());
    bavure.scale.set(long / 2, 0.9, 1.3 + hasard() * 0.8);
    const r = rO + 1 + long / 2;
    bavure.position.set(r * Math.cos(a) * MM, (H - 3.4 + (r - rO) * 0.3) * MM, r * Math.sin(a) * MM);
    bavure.rotation.y = -a;
    bavure.userData.noEdges = true;
    g.add(bavure);
  }
  return g;
}

/** Demi-largeur du manche à la distance s de la virole (mm) : col, renflement, bout aminci. */
function rayonManche(s) {
  const m = PINCEAU.manche, t = s / m.long;
  const col = 1 - 0.2 * Math.exp(-(((t - 0.16) / 0.12) ** 2));
  const fin = 1 - 0.22 * seuil(t, 0.6, 1);
  const arrondi = Math.sqrt(Math.max(0, 1 - Math.max(0, (s - (m.long - 5)) / 5) ** 2));
  return (m.large / 2) * col * fin * (0.25 + 0.75 * arrondi);
}

/** Repère 3 : pinceau plat, dans son repère propre (x du bout des soies au bout du manche, y l'épaisseur, z la largeur). */
function pinceauLocal() {
  const g = new THREE.Group();
  const so = PINCEAU.soies, vi = PINCEAU.virole, ma = PINCEAU.manche;
  const soies = new THREE.Mesh(new THREE.BoxGeometry(so.long * MM, so.epais * MM, so.large * MM), soiesMat());
  soies.position.x = (so.long / 2) * MM;
  const virole = new THREE.Mesh(new THREE.BoxGeometry(vi.long * MM, vi.epais * MM, vi.large * MM), acierVirole());
  virole.position.x = (so.long + vi.long / 2) * MM;
  g.add(soies, virole);
  // Manche : trois tronçons de bois et deux blancs (bande et bout), tournés puis aplatis.
  const x0 = so.long + vi.long;
  const coupes = [0, PINCEAU.bande[0], PINCEAU.bande[1], ma.long - PINCEAU.bout, ma.long];
  for (let i = 0; i < coupes.length - 1; i++) {
    const a = coupes[i], b = coupes[i + 1], N = Math.max(4, Math.round((b - a) / 3));
    const profil = [[0, a]];
    for (let j = 0; j <= N; j++) { const s = a + ((b - a) * j) / N; profil.push([rayonManche(s), s]); }
    profil.push([0, b]);
    const m = tour(profil, i % 2 ? blanc() : bois(), { seg: 28 });
    m.rotation.z = -90 * RAD; // l'axe du tour le long de x
    m.scale.set(ma.epais / ma.large, 1, 1); // après rotation, l'axe x du tour devient l'épaisseur
    m.position.x = x0 * MM;
    g.add(m);
  }
  return g;
}

function pinceau() {
  const { d, origine } = axePinceau();
  const zl = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0)).normalize();
  const yl = new THREE.Vector3().crossVectors(zl, d).normalize();
  const g = pinceauLocal();
  g.applyMatrix4(new THREE.Matrix4().makeBasis(d, yl, zl).setPosition(origine.clone().multiplyScalar(MM)));
  return g;
}

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  const { d, appui } = axePinceau();
  const bulle = appui.clone().addScaledVector(d, PINCEAU.hors * 0.3).multiplyScalar(MM);
  api.part('1', bidon(), [0, 0, 0], { labelAt: [0, (H * 0.45) * MM, R * MM] });
  api.part('2', graisse(), [0, 0.17, 0], { labelAt: [-R * 0.45 * MM, (H - GRAISSE.sousDessus) * MM, R * 0.2 * MM] });
  // Le pinceau garde sa pose : labelAt est exprimé dans le repère de l'objet, ici celui du pinceau.
  const p = api.part('3', pinceau(), [0.1, 0.3, -0.045]);
  p.updateMatrixWorld(true);
  p.userData.labelAt = p.worldToLocal(bulle.clone());
  // Vue de la photo : de face, en plongée d'environ 30°. Coupe proposée : par l'axe, à travers la graisse et le pinceau.
  return { view: { dir: [0.3, 0.6, 0.85], section: { axis: 'z', pos: 0.5 } } };
}

export default { P01 };

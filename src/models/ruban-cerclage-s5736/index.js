// Ruban de cerclage à filaments de verre Uline S-5736 (« Economy Strapping
// Tape », 1 po × 60 verges) : un rouleau, reconstitué d'après la photo de la
// fiche du produit fournie par le client (P01) et les données publiées. Aucun
// plan.
//
// Données publiées par Uline, reprises telles quelles : largeur de 1 po,
// longueur de 60 verges, épaisseur de 4,0 mil, résistance à la traction de
// 100 lb, renfort de filaments de verre, 36 rouleaux par caisse.
//
// Calculé : le diamètre extérieur. 60 verges de ruban de 4,0 mil enroulées sur
// le mandrin occupent une couronne de longueur × épaisseur (voir rouleau()).
//
// Relevé sur la photo : le mandrin de carton (Ø intérieur pris à 3 po, paroi
// d'environ 2,4 mm), son intérieur blanc imprimé de logos bleus, le nombre de
// mèches de filaments (15 en travers du ruban), le trajet de l'amorce
// déroulée. Le rapport Ø du mandrin / Ø du rouleau mesuré sur la photo (0,70)
// s'accorde avec celui du calcul (0,69) : c'est ce qui confirme le mandrin de
// 3 po, qui n'est pas publié.
//
// Repère du rouleau, en millimètres : z le long de l'axe du rouleau (0 à
// mi-largeur, +z vers la face que montre la photo), y vers le haut (0 au sol),
// x vers l'amorce déroulée (0 à l'axe). Angles autour de l'axe comptés depuis
// +x, dans le sens trigonométrique vu de +z.
// Modèle : rouleau debout sur sa tranche, comme sur la photo, mètres.
import * as THREE from 'three';
import { withFinish } from '../../viewer/materials.js';

const MM = 0.001;
const RAD = Math.PI / 180;
export const IN = 25.4;
export const VERGE = 914.4;
export const MIL = 0.0254;

// ------------------------------------------------------------------ cotes (mm)

/** Largeur, longueur et épaisseur du ruban : données publiées (1 po, 60 verges, 4,0 mil). */
export const LARGEUR = 1 * IN;
export const LONGUEUR = 60 * VERGE;
export const EPAISSEUR = 4.0 * MIL;
/** Mandrin de carton : Ø intérieur pris à 3 po (confirmé par les proportions de la photo), paroi relevée de 2,1 à 2,4 mm. */
export const MANDRIN = { dInt: 3 * IN, paroi: 2.4 };
/** Mèches de filaments de verre en travers du ruban : 15 périodes comptées sur la photo (à une près). */
export const MECHES = 15;
/** Logos de l'intérieur du mandrin : rectangle bleu (long. le long de la circonférence × haut. le long de l'axe), nombre par tour, angle du premier. */
export const LOGO = { long: 28, haut: 11, nombre: 4, angle: 50 };
/**
 * Amorce déroulée : elle quitte le rouleau à `angle` degrés au-dessus de
 * l'horizontale, descend droit, se couche sur le sol par un arc de rayon
 * `rayon` et y reste à plat sur `plat`. Relevé sur la photo, à 15 % près.
 */
export const AMORCE = { angle: 15, rayon: 25, plat: 25 };

/** Trajet de la fibre moyenne de l'amorce pour un rouleau de rayon R (plan x, y). */
function trajet(R) {
  const t = EPAISSEUR, phi = AMORCE.angle * RAD, rho = AMORCE.rayon;
  const rm = R - t / 2; // la dernière spire, à mi-épaisseur
  const depart = [rm * Math.cos(phi), R + rm * Math.sin(phi)];
  const yArc = t / 2 + rho * (1 - Math.sin(phi));
  const droit = (depart[1] - yArc) / Math.cos(phi);
  const debutArc = [depart[0] + droit * Math.sin(phi), yArc];
  const centre = [debutArc[0] + rho * Math.cos(phi), t / 2 + rho];
  const arc = rho * (Math.PI / 2 - phi);
  return { depart, droit, debutArc, centre, arc, plat: AMORCE.plat, contact: centre[0], bout: centre[0] + AMORCE.plat, longueur: droit + arc + AMORCE.plat };
}

/**
 * Rouleau : Ø du mandrin, Ø extérieur calculé, nombre de spires, longueur
 * enroulée. La section de la couronne de ruban vaut longueur × épaisseur :
 * π/4 × (D² − d²) = L × e, avec L la longueur encore enroulée (60 verges
 * moins l'amorce).
 */
export function rouleau() {
  const dMandrin = MANDRIN.dInt + 2 * MANDRIN.paroi;
  let dExt = 0, libre = 0;
  for (let k = 0; k < 3; k++) {
    dExt = Math.sqrt(dMandrin ** 2 + (4 * EPAISSEUR * (LONGUEUR - libre)) / Math.PI);
    libre = trajet(dExt / 2).longueur;
  }
  return { dMandrin, dExt, tours: (dExt - dMandrin) / 2 / EPAISSEUR, enroule: LONGUEUR - libre };
}

/** Amorce déroulée : départ, tronçon droit, arc, plat, point de contact avec le sol, bout (mm). */
export function amorce() {
  return trajet(rouleau().dExt / 2);
}

/** Encombrement du modèle (mm) : longueur (rouleau et amorce), hauteur, largeur. */
export function horsTout() {
  const r = rouleau();
  return { long: r.dExt / 2 + amorce().bout, haut: r.dExt, large: LARGEUR };
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

/** Suite pseudo-aléatoire reproductible (les mèches gardent la même place d'un affichage à l'autre). */
function suite(graine) {
  let s = graine;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/**
 * Texture d'une ligne en travers du ruban : `MECHES` mèches de filaments,
 * de largeur et de place légèrement inégales. fond et meche : [r, v, b, a]
 * (0 à 255) du film entre les mèches et des mèches.
 */
function textureMeches(nom, fond, meche) {
  return teinte(nom, () => {
    const N = 512, hasard = suite(5736);
    const centres = [], largeurs = [];
    for (let i = 0; i < MECHES; i++) {
      centres.push((i + 0.5 + (hasard() - 0.5) * 0.22) / MECHES);
      largeurs.push((0.58 + hasard() * 0.16) / MECHES);
    }
    const px = new Uint8Array(N * 4);
    for (let k = 0; k < N; k++) {
      const u = (k + 0.5) / N;
      let w = 0;
      for (let i = 0; i < MECHES; i++) {
        const d = Math.abs(u - centres[i]) / (largeurs[i] / 2);
        const bord = Math.min(1, Math.max(0, (1.25 - d) / 0.5)); // bords doux
        w = Math.max(w, bord * bord * (3 - 2 * bord));
      }
      for (let c = 0; c < 4; c++) px[k * 4 + c] = Math.round(fond[c] + (meche[c] - fond[c]) * w);
    }
    const t = new THREE.DataTexture(px, N, 1, THREE.RGBAFormat);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
  });
}

/** Dos du ruban enroulé : blanc (toutes les spires superposées), mèches plus claires que le film. */
const dosEnroule = () => teinte('ruban-dos-enroule', () => new THREE.MeshPhysicalMaterial({
  color: 0xffffff, map: textureMeches('img:ruban-meches', [203, 208, 208, 255], [246, 246, 241, 255]),
  metalness: 0, roughness: 0.34, clearcoat: 0.35, clearcoatRoughness: 0.3,
}));
/** Ruban en une seule épaisseur (amorce) : film translucide, mèches blanches presque opaques. */
const rubanSimple = () => teinte('ruban-simple', () => new THREE.MeshPhysicalMaterial({
  color: 0xffffff, map: textureMeches('img:ruban-meches-film', [214, 221, 224, 105], [244, 244, 240, 232]),
  metalness: 0, roughness: 0.3, clearcoat: 0.3, clearcoatRoughness: 0.3, transparent: true, depthWrite: false,
}));
/** Tranches du ruban enroulé (flancs du rouleau) : blanc légèrement satiné. */
const tranche = () => teinte('ruban-tranche', () => withFinish(new THREE.MeshPhysicalMaterial({
  color: 0xefefea, metalness: 0, roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.4,
}), 'plastic'));
/** Carton kraft du mandrin (couleur relevée sur la photo) : mat, grain fin, peu de reflets. */
const kraft = () => teinte('ruban-kraft', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0xcfb58c, metalness: 0, roughness: 0.94,
}), 'plastic', { fine: 0.022, wave: 0.003, rough: 0.08, tint: 0.07, env: 0.45 }));

/**
 * Intérieur du mandrin : papier blanc imprimé du logo (rectangle bleu, « ULINE »
 * en blanc), dessiné sur un canevas pour un quart de tour. Sans navigateur
 * (contrôles dans Node), papier blanc uni.
 */
function papierInterieur() {
  let map = null;
  if (typeof document !== 'undefined') {
    map = teinte('img:ruban-logo', () => {
      const pas = (Math.PI * MANDRIN.dInt) / LOGO.nombre; // mm de circonférence par logo
      const k = 12; // pixels par mm
      const c = document.createElement('canvas');
      c.width = Math.round(pas * k);
      c.height = Math.round(LARGEUR * k);
      const g = c.getContext('2d');
      g.fillStyle = '#f4f3ee';
      g.fillRect(0, 0, c.width, c.height);
      const w = LOGO.long * k, h = LOGO.haut * k;
      g.translate(c.width / 2, c.height / 2);
      g.fillStyle = '#0b3f94';
      g.fillRect(-w / 2, -h / 2, w, h);
      g.fillStyle = '#ffffff';
      g.font = `900 ${Math.round(h * 0.86)}px "Arial Black", "Helvetica Neue", Helvetica, Arial, sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'alphabetic';
      const m = g.measureText('ULINE');
      // Le mot remplit le rectangle : 84 % de sa longueur, capitales à 66 % de sa hauteur.
      const haut = m.actualBoundingBoxAscent || h * 0.62;
      g.scale((w * 0.84) / m.width, (h * 0.66) / haut);
      g.fillText('ULINE', 0, haut / 2);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = THREE.RepeatWrapping;
      t.anisotropy = 8;
      return t;
    });
  }
  return teinte(map ? 'ruban-papier-logo' : 'ruban-papier', () => new THREE.MeshStandardMaterial(
    map ? { map, metalness: 0, roughness: 0.8 } : { color: 0xf4f3ee, metalness: 0, roughness: 0.8 },
  ));
}

// ------------------------------------------------------------------ maillages

/** Maillage indexé construit sommet par sommet (cotes en mm, converties en mètres). */
class Maillage {
  constructor() { this.p = []; this.n = []; this.uv = []; this.i = []; }
  sommet(x, y, z, nx, ny, nz, u, v) {
    this.p.push(x * MM, y * MM, z * MM);
    this.n.push(nx, ny, nz);
    this.uv.push(u, v);
    return this.p.length / 3 - 1;
  }
  quad(a, b, c, d) { this.i.push(a, b, c, a, c, d); }
  geometrie() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setIndex(this.i);
    return g;
  }
}

const SEG = 144; // facettes par tour
const H = LARGEUR / 2;

/**
 * Surface cylindrique d'axe z et de rayon r, sur toute la largeur du ruban.
 * dedans : face tournée vers l'axe. uv(angle en degrés, côté) → [u, v], côté
 * valant 1 en z = +H et 0 en z = −H.
 */
function cylindre(M, r, dedans, uv) {
  let avant = null;
  for (let k = 0; k <= SEG; k++) {
    const deg = (k / SEG) * 360, a = deg * RAD, c = Math.cos(a), s = Math.sin(a), n = dedans ? -1 : 1;
    const paire = [M.sommet(r * c, r * s, H, n * c, n * s, 0, ...uv(deg, 1)), M.sommet(r * c, r * s, -H, n * c, n * s, 0, ...uv(deg, 0))];
    if (avant) {
      if (dedans) M.quad(avant[0], paire[0], paire[1], avant[1]);
      else M.quad(avant[0], avant[1], paire[1], paire[0]);
    }
    avant = paire;
  }
}

/** Couronne plane entre les rayons r0 et r1, en z = sens × H, face tournée vers sens × z. */
function couronne(M, r0, r1, sens) {
  let avant = null;
  for (let k = 0; k <= SEG; k++) {
    const a = (k / SEG) * 2 * Math.PI, c = Math.cos(a), s = Math.sin(a);
    const paire = [M.sommet(r0 * c, r0 * s, sens * H, 0, 0, sens, 0, k / SEG), M.sommet(r1 * c, r1 * s, sens * H, 0, 0, sens, 1, k / SEG)];
    if (avant) {
      if (sens > 0) M.quad(avant[0], avant[1], paire[1], paire[0]);
      else M.quad(avant[0], paire[0], paire[1], avant[1]);
    }
    avant = paire;
  }
}

const maille = (M, matiere) => new THREE.Mesh(M.geometrie(), matiere);
/** Place l'axe du rouleau à sa hauteur (le rouleau repose sur le sol). */
const surAxe = (o) => { o.position.y = (rouleau().dExt / 2) * MM; return o; };

// ------------------------------------------------------------------ pièces

/** Repère 1 : mandrin de carton, intérieur blanc imprimé. */
function mandrin() {
  const g = new THREE.Group();
  const rInt = MANDRIN.dInt / 2, rExt = rouleau().dMandrin / 2;
  const carton = new Maillage();
  cylindre(carton, rExt, false, (deg, cote) => [deg / 360, cote]);
  couronne(carton, rInt, rExt, 1);
  couronne(carton, rInt, rExt, -1);
  g.add(maille(carton, kraft()));
  // Logos : un par quart de tour, lus dans le sens trigonométrique vu de +z, haut des lettres vers −z.
  const pas = 360 / LOGO.nombre;
  const papier = new Maillage();
  cylindre(papier, rInt, true, (deg, cote) => [(deg - LOGO.angle) / pas + 0.5, 1 - cote]);
  const dedans = maille(papier, papierInterieur());
  dedans.userData.noEdges = true; // mêmes bords que le carton
  g.add(dedans);
  return surAxe(g);
}

/** Points de la fibre moyenne de l'amorce : [{ x, y, nx, ny, s }], la normale du côté du dos du ruban. */
function fibre() {
  const a = amorce(), phi = AMORCE.angle * RAD, pts = [];
  const dx = Math.sin(phi), dy = -Math.cos(phi);
  pts.push({ x: a.depart[0], y: a.depart[1], nx: Math.cos(phi), ny: Math.sin(phi), s: 0 });
  const N = 28;
  for (let k = 0; k <= N; k++) {
    const b = Math.PI + phi + (k / N) * (Math.PI / 2 - phi);
    pts.push({ x: a.centre[0] + AMORCE.rayon * Math.cos(b), y: a.centre[1] + AMORCE.rayon * Math.sin(b), nx: -Math.cos(b), ny: -Math.sin(b), s: a.droit + (k / N) * a.arc });
  }
  pts.push({ x: a.bout, y: EPAISSEUR / 2, nx: 0, ny: 1, s: a.longueur });
  return { pts, sens: [dx, dy] };
}

/** Amorce déroulée : ruban d'une seule épaisseur (épaisseur réelle), du rouleau au sol. */
function rubanDeroule() {
  const { pts, sens } = fibre(), e = EPAISSEUR / 2, M = new Maillage();
  const R = rouleau().dExt / 2;
  let avant = null;
  pts.forEach((p, j) => {
    const v = p.s / LARGEUR;
    const y = p.y - R; // le groupe est placé à la hauteur de l'axe
    const dos = [M.sommet(p.x + p.nx * e, y + p.ny * e, H, p.nx, p.ny, 0, 1, v), M.sommet(p.x + p.nx * e, y + p.ny * e, -H, p.nx, p.ny, 0, 0, v)];
    const colle = [M.sommet(p.x - p.nx * e, y - p.ny * e, H, -p.nx, -p.ny, 0, 1, v), M.sommet(p.x - p.nx * e, y - p.ny * e, -H, -p.nx, -p.ny, 0, 0, v)];
    // Chants (z = ±H) : sommets à part, pour des normales franches.
    const chant = [1, -1].map((sg) => [M.sommet(p.x + p.nx * e, y + p.ny * e, sg * H, 0, 0, sg, sg > 0 ? 1 : 0, v), M.sommet(p.x - p.nx * e, y - p.ny * e, sg * H, 0, 0, sg, sg > 0 ? 1 : 0, v)]);
    if (avant) {
      M.quad(avant.dos[0], dos[0], dos[1], avant.dos[1]);
      M.quad(avant.colle[0], avant.colle[1], colle[1], colle[0]);
      M.quad(avant.chant[0][0], avant.chant[0][1], chant[0][1], chant[0][0]);
      M.quad(avant.chant[1][0], chant[1][0], chant[1][1], avant.chant[1][1]);
    }
    avant = { dos, colle, chant };
    // Bouts : au départ (caché dans la dernière spire) et à la coupe.
    if (j === 0 || j === pts.length - 1) {
      const d = j === 0 ? [-sens[0], -sens[1]] : [1, 0];
      const b = [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([cote, sg]) => M.sommet(p.x + cote * p.nx * e, y + cote * p.ny * e, sg * H, d[0], d[1], 0, sg > 0 ? 1 : 0, v));
      if (j === 0) M.quad(b[0], b[1], b[2], b[3]);
      else M.quad(b[0], b[3], b[2], b[1]);
    }
  });
  return maille(M, rubanSimple());
}

/** Repère 2 : ruban enroulé sur le mandrin et son amorce déroulée. */
function ruban() {
  const g = new THREE.Group();
  const r0 = rouleau().dMandrin / 2, r1 = rouleau().dExt / 2;
  // Dos de la dernière spire : mèches de filaments autour du rouleau.
  const dos = new Maillage();
  cylindre(dos, r1, false, (deg, cote) => [cote, (deg * RAD * r1) / LARGEUR]);
  const peau = maille(dos, dosEnroule());
  peau.userData.noEdges = true; // mêmes bords que les flancs
  g.add(peau);
  // Flancs (tranches des spires) et alésage, contre le mandrin.
  const flancs = new Maillage();
  couronne(flancs, r0, r1, 1);
  couronne(flancs, r0, r1, -1);
  cylindre(flancs, r0, true, (deg, cote) => [0, cote]);
  g.add(maille(flancs, tranche()));
  g.add(rubanDeroule());
  return surAxe(g);
}

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  const r = rouleau(), a = amorce();
  // Bulles de repère : sur la paroi du mandrin qu'on voit par le trou (entre deux logos) et sur le dos du ruban.
  api.part('1', mandrin(), [0, 0, 0.075], { labelAt: [-(MANDRIN.dInt / 2) * MM, 0, 0] });
  api.part('2', ruban(), [0, 0, 0], { labelAt: [0, (r.dExt / 2) * MM, 0] });
  // Vue de la photo : face +z à gauche, dos du ruban et amorce à droite. Coupe proposée : par l'axe du rouleau.
  return { view: { dir: [0.78, 0.42, 0.47], section: { axis: 'x', pos: (r.dExt / 2) / (r.dExt / 2 + a.bout) } } };
}

export default { P01 };

// Trousse de déversement universelle Zenith, baril de 30 gal US (Tenaquip
// SEJ274, « Premium Shop Spill Kit, Universal, Drum, 30 US gal. ») : baril de
// polyéthylène bleu à ouverture totale, couvercle, cerceau de fermeture,
// étiquette et contenu. Reconstituée d'après la photo du produit (P01) et la
// photo du chantier (P02) fournies par le client. Aucun plan.
//
// Le fabricant ne publie pas les cotes du baril. Elles sont celles d'un baril
// de plastique à ouverture totale de 30 gal US du commerce (29 7/8 po de haut
// avec le couvercle, Ø 18 3/4 po, couvercle et cerceau de Ø 18 1/8 po), et la
// photo du chantier les confirme : voir ECHELLE.
//
// Relevé sur la photo du produit : la silhouette du baril (pied conique,
// ceinture large, épaulement), l'étiquette, les quatre boudins, la pile de
// feuilles, la liasse noire, les gants, le sachet. Supposé : l'épaisseur des
// parois, le levier du cerceau (caché sur les deux photos), le rangement du
// contenu dans le baril (feuilles pliées en deux sur les boudins).
//
// Repère, en millimètres : y vers le haut (0 au sol), axe du baril en x = z =
// 0, étiquette vers +z, levier du cerceau vers −z. Modèle en mètres.
import * as THREE from 'three';
import { withFinish } from '../../viewer/materials.js';
import * as S from '../../viewer/shapes.js';

const MM = 0.001;
export const IN = 25.4;

// ------------------------------------------------------------------ cotes (mm)

/**
 * Baril : cotes d'un baril de plastique à ouverture totale de 30 gal US du
 * commerce. h : hauteur sans le couvercle ; hCouvercle : avec le couvercle ;
 * d : Ø à la ceinture ; dCerceau : Ø du couvercle, cerceau compris. Parois et
 * fond : épaisseurs supposées.
 */
export const BARIL = { h: 29.5 * IN, hCouvercle: 29.875 * IN, d: 18.75 * IN, dCerceau: 18.125 * IN, paroi: 3, fond: 4 };
/**
 * Silhouette relevée sur la photo du produit, en parts de la hauteur ou du
 * rayon : le pied conique finit à `pied` de la hauteur, la ceinture large
 * (Ø 18 3/4 po) monte jusqu'à `ceinture`, puis le haut est en retrait.
 */
export const SILHOUETTE = { pied: 0.123, ceinture: 0.787, rBase: 0.86, rPied: 0.93, rHaut: 0.97, rCol: 0.905 };
/** Étiquette blanche, relevée sur la photo du produit : largeur développée × hauteur, hauteur de son centre. */
export const ETIQUETTE = { large: 250, haut: 150, y: 455 };
/** Boudin absorbant : Ø 3 po × 48 po (contenu publié), enroulé à plat en spirale. */
export const BOUDIN = { d: 3 * IN, long: 48 * IN, nombre: 4, ecrase: 0.945, rDebut: 30 };
/** Feuilles absorbantes : 15 × 17 po, 50 par trousse (contenu publié) ; pliées en deux dans le baril, pile de hauteur supposée. */
export const FEUILLES = { large: 15 * IN, long: 17 * IN, nombre: 50, pile: 360 };
/** Sacs d'élimination : 26 × 36 po, 5 par trousse (contenu publié) ; liasse pliée, cotes relevées sur la photo. */
export const SACS = { large: 26 * IN, long: 36 * IN, nombre: 5, plie: [300, 20, 230] };
/** Gants de nitrile : longueur et largeur relevées sur la photo ; épaisseur à plat. */
export const GANT = { long: 318, large: 105, epais: 4 };
/** Sachet transparent (mastic de colmatage et notice) : relevé sur la photo. */
export const SACHET = { large: 230, long: 150, epais: 6 };

/**
 * Mise à l'échelle par la photo du chantier (pixels de la photo agrandie
 * quatre fois). Le baril y mesure `d` de large ; du bord avant du couvercle au
 * bas, `h` ; l'ellipse du couvercle fait `ellipse` de haut pour `dCouvercle` de
 * large, ce qui donne l'angle de plongée de la prise de vue. Le seau de 5 gal
 * voisin (Ø 11,9 po au bord, un peu plus loin de l'appareil) mesure `seau`.
 */
export const ECHELLE = { d: 495, h: 725, ellipse: 145, dCouvercle: 500, seau: 305, dSeau: 11.9 * IN };

/** Ce que la photo du chantier dit du baril : angle de plongée, rapport hauteur / Ø, Ø d'après le seau. */
export function echelle() {
  const plongee = Math.asin(ECHELLE.ellipse / ECHELLE.dCouvercle);
  const rapportPhoto = ECHELLE.h / Math.cos(plongee) / ECHELLE.d;
  return {
    plongee: (plongee * 180) / Math.PI,
    rapportPhoto,
    rapportModele: BARIL.hCouvercle / BARIL.d,
    hPhoto: rapportPhoto * BARIL.d,
    // Seau et baril pris à la même distance : le seau est un peu plus loin, le Ø réel du baril est donc un peu moindre.
    dSeau: (ECHELLE.d / ECHELLE.seau) * ECHELLE.dSeau,
  };
}

/** Profil extérieur du baril, du centre du fond au bord du haut : [rayon, hauteur] en mm. */
export function profilBaril() {
  const R = BARIL.d / 2, H = BARIL.h, s = SILHOUETTE;
  const yPied = s.pied * BARIL.hCouvercle, yCeint = s.ceinture * BARIL.hCouvercle;
  const p = [[0, 0], [R * s.rBase - 10, 0]];
  // Arrondi du bas (quart de cercle de 10 mm).
  for (let k = 1; k <= 6; k++) { const a = (k / 6) * (Math.PI / 2); p.push([R * s.rBase - 10 + 10 * Math.sin(a), 10 - 10 * Math.cos(a)]); }
  p.push([R * s.rPied, yPied - 6], [R, yPied + 4], [R, yCeint - 4], [R * s.rHaut, yCeint + 6], [R * s.rHaut, H - 62]);
  // Épaulement : le haut se resserre vers le col.
  for (let k = 1; k <= 8; k++) { const t = k / 8; p.push([R * (s.rHaut - (s.rHaut - s.rCol) * (1 - Math.cos((t * Math.PI) / 2))), H - 62 + 40 * Math.sin((t * Math.PI) / 2)]); }
  // Bourrelet du bord, que coiffe le couvercle.
  p.push([R * s.rCol, H - 14], [R * s.rCol + 7, H - 10], [R * s.rCol + 7, H]);
  return p;
}

/** Rayon intérieur du baril à la hauteur y (mm). */
export function rayonInterieur(y) {
  const p = profilBaril();
  for (let i = 1; i < p.length; i++) {
    const [r0, y0] = p[i - 1], [r1, y1] = p[i];
    if (y1 > y0 && y >= y0 && y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0) - BARIL.paroi;
  }
  return p[p.length - 1][0] - BARIL.paroi;
}

/** Spirale d'un boudin : pas, rayon de fin de la fibre moyenne, rayon hors tout, nombre de tours. */
export function spirale() {
  const r = BOUDIN.d / 2, pas = BOUDIN.d * BOUDIN.ecrase;
  const long = BOUDIN.long - 2 * r; // les deux bouts sont des calottes
  const rFin = Math.sqrt(BOUDIN.rDebut ** 2 + (long * pas) / Math.PI);
  return { pas, rFin, rHorsTout: rFin + r, tours: (rFin - BOUDIN.rDebut) / pas, haut: BOUDIN.d * BOUDIN.ecrase };
}

/** Rangement dans le baril : hauteurs (mm) du bas de chaque élément, du fond vers le haut. */
export function rangement() {
  const s = spirale();
  const boudins = Array.from({ length: BOUDIN.nombre }, (_, i) => BARIL.fond + i * s.haut);
  const feuilles = BARIL.fond + BOUDIN.nombre * s.haut;
  const sacs = feuilles + FEUILLES.pile;
  const sachet = sacs + SACS.plie[1];
  const gants = sachet + SACHET.epais;
  const dessus = gants + 2 * GANT.epais;
  return { boudins, feuilles, sacs, sachet, gants, dessus, libre: BARIL.h - 12 - dessus };
}

/** Encombrement de la trousse fermée (mm). */
export function horsTout() {
  return { haut: BARIL.hCouvercle, d: BARIL.d };
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

/** Polyéthylène bleu du baril et du couvercle (couleur relevée sur la photo du produit). */
const pehd = () => teinte('trousse-pehd-bleu', () => withFinish(new THREE.MeshPhysicalMaterial({
  color: 0x0d5fc4, metalness: 0, roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.45, side: THREE.DoubleSide,
}), 'plastic'));
/** Acier galvanisé du cerceau. */
const galva = () => teinte('trousse-galva', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0xc4c8cb, metalness: 0.85, roughness: 0.36,
}), 'machined'));
/** Fibre grise des boudins et des feuilles (polypropylène soufflé). */
const fibre = () => teinte('trousse-fibre', () => withFinish(new THREE.MeshStandardMaterial({
  color: 0x8e9493, metalness: 0, roughness: 0.97,
}), 'plastic', { fine: 0.03, wave: 0.006, rough: 0.05, tint: 0.09, env: 0.3 }));
const noir = () => teinte('trousse-sac-noir', () => new THREE.MeshPhysicalMaterial({
  color: 0x17181a, metalness: 0, roughness: 0.38, clearcoat: 0.4, clearcoatRoughness: 0.35,
}));
const nitrile = () => teinte('trousse-nitrile', () => new THREE.MeshStandardMaterial({ color: 0x5fd0b0, metalness: 0, roughness: 0.6 }));
const film = () => teinte('trousse-film', () => new THREE.MeshPhysicalMaterial({
  color: 0xe9eef2, metalness: 0, roughness: 0.2, transparent: true, opacity: 0.38, depthWrite: false, clearcoat: 0.6,
}));
const papier = () => teinte('trousse-papier', () => new THREE.MeshStandardMaterial({ color: 0xf2f1ec, metalness: 0, roughness: 0.85 }));
const rouge = () => teinte('trousse-rouge', () => new THREE.MeshStandardMaterial({ color: 0xc8202a, metalness: 0, roughness: 0.6 }));

/** Texture de données (sRVB, répétée). */
function donnees(px, w, h) {
  const t = new THREE.DataTexture(px, w, h, THREE.RGBAFormat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

/** Tranches de la pile de feuilles : une ligne sombre entre deux feuilles (texture d'une colonne). */
const tranches = () => teinte('trousse-tranches', () => {
  const N = 16, px = new Uint8Array(N * 4);
  for (let k = 0; k < N; k++) {
    const v = k < 3 ? 128 : k < 5 ? 160 : 188;
    px.set([v, v + 2, v + 1, 255], k * 4);
  }
  const map = donnees(px, 1, N);
  map.repeat.set(1, FEUILLES.nombre * 2);
  return new THREE.MeshStandardMaterial({ map, metalness: 0, roughness: 0.97 });
});

/** Dessus d'une feuille : gaufrage en points, comme sur la photo (un point tous les 12 mm environ). */
const gaufrage = () => teinte('trousse-gaufrage', () => {
  const N = 32, px = new Uint8Array(N * N * 4);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const d = Math.hypot(i - N / 2 + 0.5, j - N / 2 + 0.5);
      const v = Math.round(184 - 62 * Math.min(1, Math.max(0, (5.5 - d) / 2.5)));
      px.set([v, v + 2, v + 1, 255], (j * N + i) * 4);
    }
  }
  const map = donnees(px, N, N);
  map.repeat.set(Math.round(FEUILLES.large / 12), Math.round(FEUILLES.long / 2 / 12));
  return new THREE.MeshStandardMaterial({ map, metalness: 0, roughness: 0.97 });
});

/**
 * Étiquette : papier blanc, marque, désignation dans les deux langues et code à
 * barres, d'après la photo du produit (texte peu lisible : lecture probable).
 * Sans navigateur (contrôles dans Node), papier blanc uni.
 */
function imprime() {
  let map = null;
  if (typeof document !== 'undefined') {
    map = teinte('img:trousse-etiquette', () => {
      const k = 6, c = document.createElement('canvas'); // pixels par mm
      c.width = ETIQUETTE.large * k;
      c.height = ETIQUETTE.haut * k;
      const g = c.getContext('2d');
      const police = '"Helvetica Neue", Helvetica, Arial, sans-serif';
      g.fillStyle = '#f7f7f4';
      g.fillRect(0, 0, c.width, c.height);
      g.textAlign = 'center';
      g.fillStyle = '#4a4d52';
      g.font = `700 ${23 * k}px ${police}`;
      g.fillText('ZENITH', c.width / 2, 36 * k);
      g.fillStyle = '#16181b';
      g.font = `700 ${10.5 * k}px ${police}`;
      g.fillText('UNIVERSAL SPILL KIT, 30-GALLON', c.width / 2, 58 * k);
      g.fillRect(22 * k, 65 * k, c.width - 44 * k, 0.6 * k);
      g.fillText('TROUSSE DE DÉVERSEMENT', c.width / 2, 82 * k);
      g.fillText('UNIVERSELLE, 30 GALLONS', c.width / 2, 96 * k);
      // Code à barres.
      const barres = [2, 1, 1, 2, 3, 1, 1, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 1, 1, 3, 1, 2];
      let x = c.width / 2 - 16 * k;
      barres.forEach((w, i) => { if (i % 2 === 0) g.fillRect(x, 112 * k, w * 0.62 * k, 24 * k); x += w * 0.62 * k; });
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    });
  }
  return teinte(map ? 'trousse-etiquette-imprimee' : 'trousse-etiquette', () => new THREE.MeshStandardMaterial(
    map ? { map, metalness: 0, roughness: 0.7 } : { color: 0xf7f7f4, metalness: 0, roughness: 0.7 },
  ));
}

// ------------------------------------------------------------------ maillages

const SEG = 96; // facettes sur le tour

/** Pièce de révolution d'axe y : profil [[r, y], ...] en mm ; arêtes vives gardées, courbes lissées. */
function tourne(profil, matiere, seg = SEG) {
  const pts = profil.map(([r, y]) => new THREE.Vector2(Math.max(r, 0) * MM, y * MM));
  const geo = S.creaseNormals(new THREE.LatheGeometry(pts, seg), 0.6);
  return new THREE.Mesh(geo, matiere);
}

/** Pavé en mm, centré en x et z, posé sur y = 0. */
function pave(l, h, p, matiere) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(l * MM, h * MM, p * MM), matiere);
  m.position.y = (h / 2) * MM;
  return m;
}

// ------------------------------------------------------------------ pièces

/** Repère 1 : baril de polyéthylène, ouvert en haut. */
function baril() {
  const ext = profilBaril(), t = BARIL.paroi;
  // Intérieur : même profil, décalé de l'épaisseur de la paroi, parcouru du haut vers le fond.
  const int = ext.slice(1).reverse().map(([r, y]) => [r - t, Math.max(y, BARIL.fond)]);
  const m = tourne([...ext, ...int, [0, BARIL.fond]], pehd());
  m.userData.hasInterior = true;
  return m;
}

/** Repère 2 : couvercle, cuvette au centre, bord qui coiffe le bourrelet du baril. */
function couvercle() {
  const rBord = BARIL.dCerceau / 2 - 3, H = BARIL.h, top = BARIL.hCouvercle - 1.5, t = 3;
  const profil = [
    [0, H - 6], [rBord - 34, H - 6], [rBord - 26, top - t], [rBord - t, top - t], [rBord - t, H - 12],
    [rBord, H - 12], [rBord, top], [rBord - 28, top], [rBord - 36, H - 6 + t], [0, H - 6 + t],
  ];
  return tourne(profil, pehd());
}

/** Repère 3 : cerceau de fermeture en U, et son levier (supposé : caché sur les photos). */
function cerceau() {
  const g = new THREE.Group();
  const R = BARIL.dCerceau / 2, y0 = BARIL.h - 16, y1 = BARIL.hCouvercle, t = 1.5, aile = 9;
  g.add(tourne([
    [R - aile, y0], [R, y0], [R, y1], [R - aile, y1], [R - aile, y1 - t], [R - t, y1 - t], [R - t, y0 + t], [R - aile, y0 + t], [R - aile, y0],
  ], galva()));
  // Levier rabattu le long du cerceau, du côté −z, et sa chape.
  const ym = (y0 + y1) / 2 - 8;
  const chape = pave(46, 16, 7, galva());
  chape.position.set(0, ym * MM, -(R + 3.5) * MM);
  const levier = new THREE.Mesh(new THREE.CylinderGeometry((R + 9) * MM, (R + 9) * MM, 15 * MM, 24, 1, true, Math.PI - 0.07, 0.46), teinte('trousse-galva-2', () => { const m = galva().clone(); m.side = THREE.DoubleSide; return m; }));
  levier.position.y = (ym + 8) * MM;
  g.add(chape, levier);
  return g;
}

/** Repère 4 : étiquette collée sur la ceinture du baril, face à +z. */
function etiquette() {
  const R = BARIL.d / 2 + 0.3, angle = ETIQUETTE.large / R;
  const geo = new THREE.CylinderGeometry(R * MM, R * MM, ETIQUETTE.haut * MM, 32, 1, true, -angle / 2, angle);
  const m = new THREE.Mesh(geo, imprime());
  m.position.y = ETIQUETTE.y * MM;
  m.userData.noEdges = true;
  return m;
}

/** Repère 5 : boudin absorbant enroulé à plat en spirale, posé à la hauteur y (mm), tourné de `tour` radians. */
function boudin(y, tour) {
  const s = spirale(), r = BOUDIN.d / 2;
  const fin = ((s.rFin - BOUDIN.rDebut) / s.pas) * 2 * Math.PI;
  const pts = [];
  const n = 90;
  for (let k = 0; k <= n; k++) {
    // Pas constant le long de la fibre : l'angle croît comme la racine de la longueur parcourue.
    const rr = Math.sqrt(BOUDIN.rDebut ** 2 + (k / n) * (s.rFin ** 2 - BOUDIN.rDebut ** 2));
    const a = ((rr - BOUDIN.rDebut) / s.pas) * 2 * Math.PI;
    pts.push(new THREE.Vector3(rr * Math.cos(a) * MM, 0, rr * Math.sin(a) * MM));
  }
  const courbe = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.TubeGeometry(courbe, 120, r * MM, 14, false), fibre()));
  for (const p of [pts[0], pts[n]]) {
    const bout = new THREE.Mesh(new THREE.SphereGeometry(r * MM, 14, 10), fibre());
    bout.position.copy(p);
    bout.userData.noEdges = true;
    g.add(bout);
  }
  g.scale.y = BOUDIN.ecrase; // le boudin s'écrase un peu sous la pile
  g.rotation.y = tour;
  g.position.y = (y + s.haut / 2) * MM;
  g.userData.fin = fin;
  return g;
}

/** Repère 6 : pile de feuilles absorbantes pliées en deux (pli du côté −z). */
function feuilles(y) {
  const l = FEUILLES.large, p = FEUILLES.long / 2, h = FEUILLES.pile;
  // Pavé aux tranches rayées, et une feuille gaufrée posée dessus (un seul matériau par maillage, pour la coupe).
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.BoxGeometry(l * MM, h * MM, p * MM), tranches()));
  const dessus = new THREE.Mesh(new THREE.PlaneGeometry(l * MM, p * MM), gaufrage());
  dessus.rotation.x = -Math.PI / 2;
  dessus.position.y = (h / 2 + 0.3) * MM;
  dessus.userData.noEdges = true;
  g.add(dessus);
  g.position.y = (y + h / 2) * MM;
  return g;
}

/** Repère 7 : liasse de sacs d'élimination noirs, pliée. */
function sacs(y) {
  const [l, h, p] = SACS.plie;
  const m = pave(l, h, p, noir());
  m.position.y += y * MM;
  return m;
}

/** Contour d'un gant à plat (mm) : manchette en bas, doigts en haut, pouce à droite. */
const CONTOUR_GANT = [
  [-48, 0], [48, 0], [50, 150], [60, 165], [90, 218], [93, 232], [86, 241], [74, 236], [53, 208],
  [53, 292], [48, 300], [33, 300], [28, 292], [28, 240], [26, 240], [26, 310], [21, 318], [7, 318], [2, 310], [2, 240],
  [0, 240], [0, 297], [-5, 305], [-19, 305], [-24, 297], [-24, 238], [-26, 238], [-26, 262], [-31, 270], [-45, 270], [-50, 262], [-52, 150],
];

/** Repère 8 : un gant de nitrile à plat ; `miroir` : gant de l'autre main. */
function gant(y, miroir, angle, dx, dz) {
  const pts = CONTOUR_GANT.map(([x, v]) => [(miroir ? -x : x) * MM, (v - GANT.long / 2) * MM]);
  const m = S.extrude(miroir ? pts.reverse() : pts, GANT.epais * MM, nitrile());
  m.rotation.x = -Math.PI / 2; // à plat, doigts vers −z
  const g = new THREE.Group();
  g.add(m);
  g.rotation.y = angle;
  g.position.set(dx * MM, (y + GANT.epais / 2) * MM, dz * MM);
  return g;
}

/** Repère 9 : sachet transparent, notice et bâton de mastic de colmatage. */
function sachet(y) {
  const g = new THREE.Group();
  const notice = pave(SACHET.large - 50, 1, SACHET.long - 40, papier());
  notice.position.set(-8 * MM, 1 * MM, 0);
  const mastic = new THREE.Mesh(new THREE.CylinderGeometry(2.4 * MM, 2.4 * MM, 60 * MM, 12), rouge());
  mastic.rotation.z = Math.PI / 2;
  mastic.position.set(-40 * MM, 3.6 * MM, -30 * MM);
  const poche = pave(SACHET.large, SACHET.epais, SACHET.long, film());
  poche.renderOrder = 2;
  g.add(notice, mastic, poche);
  g.position.y = y * MM;
  return g;
}

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  const r = rangement(), H = BARIL.hCouvercle * MM, R = (BARIL.d / 2) * MM;
  // Vue éclatée : la disposition de la photo du produit — couvercle et cerceau levés, boudins à gauche,
  // feuilles et gants à droite, sacs et sachet devant, tous posés au sol.
  api.part('1', baril(), [0, 0, 0], { labelAt: [-R * 0.7, 0.2, R * 0.72] });
  api.part('2', couvercle(), [0, 0.42, 0], { labelAt: [0, H, 0] });
  api.part('3', cerceau(), [0, 0.2, 0], { labelAt: [(BARIL.dCerceau / 2) * MM, H - 0.012, 0] });
  api.part('4', etiquette(), [0, 0, 0.09]);
  r.boudins.forEach((y, i) => api.part('5', boudin(y, i * 1.9), [-0.56, -BARIL.fond * MM, 0.1], { noLabel: i < BOUDIN.nombre - 1 }));
  api.part('6', feuilles(r.feuilles), [0.56, -r.feuilles * MM, 0.12]);
  api.part('7', sacs(r.sacs), [0.02, -r.sacs * MM, 0.52], { labelAt: [0.13, 0, 0.1] });
  api.part('9', sachet(r.sachet), [0.02, -(r.sachet - SACS.plie[1]) * MM, 0.52]);
  const auSol = FEUILLES.pile - r.gants; // les gants finissent sur la pile de feuilles
  api.part('8', gant(r.gants, false, 0.5, -40, 10), [0.56, auSol * MM, 0.12], { noLabel: true });
  api.part('8', gant(r.gants + GANT.epais, true, -0.35, 45, -5), [0.56, auSol * MM, 0.12]);
  // Vue de la photo du produit : étiquette de face, vue d'un peu plus haut. Coupe proposée : par l'axe.
  return { view: { dir: [0.2, 0.3, 0.93], section: { axis: 'x', pos: 0.5 } } };
}

export default { P01 };

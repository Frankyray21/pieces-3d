// Pince à sertir manuelle de 30 po pour manchons de câble d'acier (câble du
// « wire line »), à 3 empreintes — produit VEVOR. Reconstitution d'après les
// vignettes d'une recherche d'images (capture d'écran reçue, 639 × 1 147 px :
// la pince y mesure environ 180 pixels de long), sans plan ni cote. Quatre
// vignettes montrent la pince à trois empreintes ; les autres, d'autres modèles.
//
// Données publiées par le fabricant et ses détaillants, reprises telles
// quelles : longueur de 30 po, trois empreintes pour câble de 5/32, 1/4 et
// 5/16 po (4, 6 et 8 mm), acier allié, mâchoires forgées et trempées, poignées
// en acier tubulaire, manchons de poignée en caoutchouc. Tout le reste est
// relevé en proportion sur la vue de face, à environ 4,3 mm par pixel, ou
// supposé (épaisseurs, visserie, diamètre des empreintes).
//
// Mécanisme, lu sur les photos : celui d'un coupe-boulons. Chaque mâchoire
// tourne sur son boulon, tenu par deux éclisses ; sa queue est articulée dans
// la tête d'une poignée ; les deux poignées tournent l'une sur l'autre autour
// du boulon central. Fermées, les trois boulons des poignées sont presque
// alignés (genouillère) : c'est là que l'effort sur le manchon est le plus grand.
//
// Repère de l'outil, en millimètres : x vers la droite de la pince vue de face
// (tête en haut), s le long de l'axe depuis le bout des mâchoires vers les
// poignées, z vers l'observateur. Modèle : pince couchée à plat, bout des
// mâchoires vers −X, face avant vers le haut, mètres.
import * as THREE from 'three';
import { mat, withFinish } from '../../viewer/materials.js';
import { creaseNormals } from '../../viewer/shapes.js';

const MM = 0.001;
const RAD = Math.PI / 180;

// ------------------------------------------------------------------ cotes (mm)

export const L = 762; // longueur hors tout : 30 po, donnée publiée
/** Empreintes, du bout vers les éclisses : câble (publié), diamètre et place (estimés). */
export const EMPREINTES = [
  { cable: '5/32', mm: 4, d: 8, s: 10 },
  { cable: '1/4', mm: 6, d: 12, s: 23 },
  { cable: '5/16', mm: 8, d: 16, s: 40 },
];
export const TETE = { large: 96, bout: 28, long: 169 }; // tête noire : largeur, méplat du bout, longueur jusqu'au bout des queues
export const EP = { machoire: 16, eclisse: 6, joue: 6.7, tete: 30 }; // épaisseurs (supposées : cachées sur les vues de face)
export const PIVOT = { x: 25, s: 65 }; // boulon de chaque mâchoire, dans les éclisses
export const ECLISSE = { long: 78, large: 26, r: 6 };
export const ARTIC = { x: 30, s: 157, r: 13 }; // boulon mâchoire-poignée ; rayon de l'oreille de la poignée
export const CENTRE = { s: 161, r: 13, jeu: 1.5 }; // boulon central des poignées ; rayon de la patte ; jeu autour
const QUEUE = 12; // rayon du bout de la queue de mâchoire
export const BOULON = { d: 12, plats: 19, ecrou: 10 }; // visserie M12 supposée
export const BRAS = { r0: 14, r1: 11, s0: 212, fin: L - 4 }; // bras tubulaire : rayon à la tête puis courant
export const MANCHON = { s0: 628, s1: L, r: 15.5, garde: 18.5, bosse: 2.6 }; // manchon de caoutchouc
const TROU = { s: 184, r: 10, fente: 6, fond: 210 }; // jour en trou de serrure entre les têtes des poignées
// Demi-écartement de l'axe d'un bras selon s, relevé sur la vue de face.
const AXE_BRAS = [[30, 212], [30.3, 240], [33.5, 290], [38, 345], [43.5, 410], [48.5, 480], [52, 550], [54, 620], [55, 690], [56, L]]; // [x, s]
const HAUT = 28; // hauteur du plan médian de la pince au-dessus de la table (les écrous ne la touchent pas)

// ------------------------------------------------------------------ cinématique (plan x, y = −s)

const rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const P0 = [PIVOT.x, -PIVOT.s], J0 = [ARTIC.x, -ARTIC.s], C0 = [0, -CENTRE.s];
/** Longueur de la bielle : distance du boulon central au boulon mâchoire-poignée. */
export const BIELLE = Math.hypot(J0[0] - C0[0], J0[1] - C0[1]);
const ANGLE0 = Math.atan2(J0[1] - C0[1], J0[0] - C0[0]);

/**
 * État du mécanisme pour un angle d'ouverture phi de chaque mâchoire (radians,
 * 0 = fermé), côté droit ; le gauche est symétrique. Retourne le boulon
 * mâchoire-poignée J, le boulon central C (sur l'axe) et l'angle psi dont la
 * poignée a tourné autour de C.
 */
export function etat(phi) {
  const d = rot([J0[0] - P0[0], J0[1] - P0[1]], -phi);
  const J = [P0[0] + d[0], P0[1] + d[1]];
  const C = [0, J[1] - Math.sqrt(Math.max(0, BIELLE * BIELLE - J[0] * J[0]))];
  const psi = Math.atan2(J[1] - C[1], J[0] - C[0]) - ANGLE0;
  return { phi, J, C, psi };
}

/** Ouverture maximale : les oreilles des deux poignées se touchent presque sur l'axe (1 mm de jeu chacune). */
export const PHI_MAX = (() => {
  let a = 0, b = 20 * RAD;
  for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (etat(m).J[0] > ARTIC.r + 1) a = m; else b = m; }
  return (a + b) / 2;
})();

/** Point de la mâchoire droite (x, s en position fermée) une fois la mâchoire ouverte de phi : [x, s]. */
export function pointMachoire(x, s, phi) {
  const d = rot([x - P0[0], -s - P0[1]], -phi);
  return [P0[0] + d[0], -(P0[1] + d[1])];
}
/** Point de la poignée droite (x, s en position fermée) pour l'ouverture phi : [x, s]. */
export function pointPoignee(x, s, phi) {
  const e = etat(phi), d = rot([x - C0[0], -s - C0[1]], e.psi);
  return [e.C[0] + d[0], -(e.C[1] + d[1])];
}

// ------------------------------------------------------------------ outils de tracé

/** Courbe lisse passant par des points [x, s], rendue en n segments (plan de l'outil : y = −s). */
function lisse(pts, n) {
  const c = new THREE.CatmullRomCurve3(pts.map(([x, s]) => new THREE.Vector3(x, s, 0)), false, 'centripetal');
  return c.getPoints(n).map((p) => [p.x, p.y]);
}
/** Arc de centre (cx, cs), rayon r, de l'angle a0 à a1 (degrés ; 0 = vers +x, 90 = vers +s). */
function arc(cx, cs, r, a0, a1, n = 12) {
  const out = [];
  for (let i = 0; i <= n; i++) { const a = (a0 + ((a1 - a0) * i) / n) * RAD; out.push([cx + r * Math.cos(a), cs + r * Math.sin(a)]); }
  return out;
}
const milieu = (pts) => pts.slice(1, -1);

/**
 * Plaque découpée : contour [x, s] (mm, côté droit ; cote = −1 le reflète),
 * entre z0 et z1, arêtes cassées d'environ 1 mm ; trous ronds [x, s, r].
 */
function plaque(contour, z0, z1, matiere, cote = 1, trous = []) {
  const v = ([x, s]) => new THREE.Vector2(cote * x * MM, -s * MM);
  const shape = new THREE.Shape(contour.map(v));
  for (const [x, s, r] of trous) {
    const p = new THREE.Path();
    p.absarc(cote * x * MM, -s * MM, r * MM, 0, 2 * Math.PI, true);
    shape.holes.push(p);
  }
  const t = (z1 - z0) * MM, b = Math.min(t * 0.16, 0.0012);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: t - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelOffset: -b, bevelSegments: 1, curveSegments: 24 });
  geo.translate(0, 0, z0 * MM + b);
  return new THREE.Mesh(creaseNormals(geo), typeof matiere === 'string' ? mat(matiere) : matiere);
}

/**
 * Corps balayé le long d'une ligne du plan de l'outil : axe [x, s] (mm), rayon
 * rayon(i, a) en mm selon le rang et l'angle a autour de l'axe (a = 0 vers +z,
 * a = 90° vers la droite de la marche) ; bouts fermés.
 */
function balayage(axe, rayon, matiere, cote = 1, radial = 24) {
  const n = axe.length, pos = [], idx = [];
  const P = axe.map(([x, s]) => new THREE.Vector3(cote * x * MM, -s * MM, 0));
  const Z = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i < n; i++) {
    const T = P[Math.min(n - 1, i + 1)].clone().sub(P[Math.max(0, i - 1)]).normalize();
    const B = T.clone().cross(Z).normalize();
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * 2 * Math.PI, r = rayon(i, a, B) * MM;
      pos.push(P[i].x + (Z.x * Math.cos(a) + B.x * Math.sin(a)) * r, P[i].y + (Z.y * Math.cos(a) + B.y * Math.sin(a)) * r, Math.cos(a) * r);
    }
  }
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < radial; j++) {
    const a = i * radial + j, b = i * radial + ((j + 1) % radial), c = a + radial, d = b + radial;
    idx.push(a, b, d, a, d, c);
  }
  for (const [i, sens] of [[0, 1], [n - 1, -1]]) {
    const centre = pos.length / 3;
    pos.push(P[i].x, P[i].y, 0);
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j, b = i * radial + ((j + 1) % radial);
      if (sens > 0) idx.push(centre, b, a); else idx.push(centre, a, b);
    }
  }
  let geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo = geo.toNonIndexed();
  // Faces vers l'extérieur : volume signé positif, sinon triangles retournés.
  const p = geo.attributes.position.array;
  let vol = 0;
  for (let i = 0; i < p.length; i += 9) {
    vol += p[i] * (p[i + 4] * p[i + 8] - p[i + 5] * p[i + 7]) - p[i + 1] * (p[i + 3] * p[i + 8] - p[i + 5] * p[i + 6]) + p[i + 2] * (p[i + 3] * p[i + 7] - p[i + 4] * p[i + 6]);
  }
  if (vol < 0) for (let i = 0; i < p.length; i += 9) for (let k = 0; k < 3; k++) { const t = p[i + 3 + k]; p[i + 3 + k] = p[i + 6 + k]; p[i + 6 + k] = t; }
  geo = creaseNormals(geo, 40 * RAD);
  geo.userData.edgeAngle = 70; // pas de contours le long du corps
  return new THREE.Mesh(geo, typeof matiere === 'string' ? mat(matiere) : matiere);
}

// Matériaux hors palette, créés une fois.
const perso = new Map();
function teinte(nom, params, finition) {
  let m = perso.get(nom);
  if (!m) {
    m = new THREE.MeshPhysicalMaterial({ metalness: 0, roughness: 0.42, ...params });
    m.polygonOffset = true;
    m.polygonOffsetFactor = 1;
    m.polygonOffsetUnits = 1;
    m.name = nom;
    withFinish(m, finition);
    perso.set(nom, m);
  }
  return m;
}
// Rouge vif des poignées (plus clair que le rouge de la palette) et noir mat des mâchoires forgées.
const rouge = () => teinte('pince-rouge', { color: 0xd0201b, clearcoat: 0.7, clearcoatRoughness: 0.16 }, 'paint');
const forge = () => teinte('pince-forge', { color: 0x25272a, metalness: 0.3, roughness: 0.6, clearcoat: 0.15, clearcoatRoughness: 0.5 }, 'paintSatin');

// ------------------------------------------------------------------ pièces (repère de l'outil, position fermée)

/** Contour de la mâchoire droite fermée : bout, flanc, queue, jour entre les queues, plan de joint et demi-empreintes. */
function contourMachoire() {
  const h = TETE.large / 2;
  const pts = [[0, 0]];
  // Bout à méplat, nez en ogive, flanc droit puis queue qui se resserre jusqu'à l'articulation.
  pts.push(...lisse([[TETE.bout / 2, 0], [19, 1.2], [23, 3.8], [26.5, 7.5], [31, 14], [36, 23], [40.5, 32], [44, 41], [46.5, 50], [h, 60]], 30));
  pts.push(...lisse([[h, 118], [46, 132], [43.5, 146], [ARTIC.x + QUEUE, ARTIC.s]], 12));
  pts.push(...milieu(arc(ARTIC.x, ARTIC.s, QUEUE, 0, 180, 16)));
  // Bord intérieur de la queue : le jour s'ouvre derrière les éclisses et se referme vers le pivot.
  pts.push(...lisse([[ARTIC.x - QUEUE, ARTIC.s], [17.5, 148], [15, 130], [12, 110], [9, 93]], 12));
  pts.push([4.2, 86], [2.2, 76], [0.8, 66], [0, 60]);
  // Plan de joint, du pivot vers le bout, creusé des trois demi-empreintes.
  for (const e of [...EMPREINTES].reverse()) pts.push(...arc(0, e.s, e.d / 2, 90, -90, 14));
  return pts;
}

/** Fond usiné, clair, d'une demi-empreinte (demi-cylindre tourné vers l'axe de l'empreinte). */
function fondEmpreinte(e, cote) {
  const r = e.d / 2 - 0.15, h = EP.machoire / 2 - 1.4, n = 14;
  const pos = [], nor = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const a = (90 - (180 * i) / n) * RAD, c = Math.cos(a), sn = Math.sin(a);
    for (const z of [-h, h]) {
      pos.push(cote * r * c * MM, -(e.s + r * sn) * MM, z * MM);
      nor.push(-cote * c, sn, 0);
    }
  }
  for (let i = 0; i < n; i++) {
    const a = 2 * i, b = a + 1, c = a + 2, d = a + 3;
    if (cote > 0) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setIndex(idx);
  geo.userData.edgeAngle = 180;
  return new THREE.Mesh(geo, mat('steel'));
}

/** Repère 1 : mâchoire forgée (cote = 1 à droite, −1 à gauche), percée pour son pivot et son articulation. */
function machoire(cote) {
  const g = new THREE.Group();
  const trous = [[PIVOT.x, PIVOT.s, BOULON.d / 2 + 0.3], [ARTIC.x, ARTIC.s, BOULON.d / 2 + 0.3]];
  g.add(plaque(contourMachoire(), -EP.machoire / 2, EP.machoire / 2, forge(), cote, trous));
  for (const e of EMPREINTES) g.add(fondEmpreinte(e, cote));
  return g;
}

/** Repère 2 : éclisse (devant = 1, derrière = −1) qui porte les pivots des deux mâchoires. */
function eclisse(face) {
  const { long, large, r } = ECLISSE, a = long / 2, s0 = PIVOT.s - large / 2, s1 = PIVOT.s + large / 2;
  const contour = [
    ...arc(a - r, s0 + r, r, -90, 0, 5), ...arc(a - r, s1 - r, r, 0, 90, 5),
    ...arc(-a + r, s1 - r, r, 90, 180, 5), ...arc(-a + r, s0 + r, r, 180, 270, 5),
  ];
  const z0 = EP.machoire / 2 + 0.2;
  const trous = [-1, 1].map((c) => [c * PIVOT.x, PIVOT.s, BOULON.d / 2 + 0.3]);
  return face > 0 ? plaque(contour, z0, z0 + EP.eclisse, 'blackOxide', 1, trous) : plaque(contour, -z0 - EP.eclisse, -z0, 'blackOxide', 1, trous);
}

/** Contour de la tête forgée d'une poignée (côté droit, fermée) : creux de l'oreille, dégagement du boulon central, trou de serrure, butée. */
function contourTete() {
  const R = CENTRE.r + CENTRE.jeu;
  // Rencontre du dégagement (rayon R autour du boulon central) et du rond du trou de serrure.
  const d = TROU.s - CENTRE.s, k = (R * R - TROU.r * TROU.r + d * d) / (2 * d);
  const u0 = Math.acos(k / R) / RAD, v0 = Math.atan2(Math.sqrt(R * R - k * k), d - k) / RAD;
  const v1 = 180 - Math.asin(TROU.fente / TROU.r) / RAD;
  return [
    ...arc(ARTIC.x, ARTIC.s, ARTIC.r, 15, 160, 18), // creux où s'appuient les oreilles
    ...arc(0, CENTRE.s, R, 5, 90 - u0, 10), // dégagement autour du boulon central
    ...milieu(arc(0, TROU.s, TROU.r, v0 - 90, v1 - 90, 14)), // rond du trou de serrure
    [TROU.fente, TROU.s + TROU.r * Math.cos((180 - v1) * RAD)], [TROU.fente, TROU.fond], // fente
    [4.5, 213.5], [0.4, 215.5], [0.4, 224], // butée : les deux têtes s'y touchent, pince fermée
    ...lisse([[3, 227], [9, 229.5], [14, 233], [16.5, 238], [20, 241.5], [30, 243.5], [40, 241.5], [43.5, 236], [43, 226]], 20),
    [43, 164],
  ];
}

/** Patte du boulon central : demi-épaisseur, ronde, raccordée à la tête par le secteur du dégagement. */
function contourPatte() {
  const R = CENTRE.r + CENTRE.jeu;
  const d = TROU.s - CENTRE.s, k = (R * R - TROU.r * TROU.r + d * d) / (2 * d);
  const u0 = Math.acos(k / R) / RAD;
  return [...arc(0, CENTRE.s, R, 5, 90 - u0, 10), ...arc(0, CENTRE.s, CENTRE.r, 90 - u0 + 6, 365 - 6, 40)];
}

/** Rayon du bras à l'abscisse s : fort à la sortie de la tête, puis tube courant. */
const rayonBras = (s) => { const t = Math.max(0, Math.min(1, (s - 242) / 90)); return BRAS.r0 + (BRAS.r1 - BRAS.r0) * t * t * (3 - 2 * t); };
/** Axe d'un bras entre deux abscisses, par pas d'environ 6 mm. */
function axeBras(s0, s1) {
  const tout = lisse(AXE_BRAS, 160);
  const x = (s) => { let i = 0; while (i < tout.length - 2 && tout[i + 1][1] < s) i++; const [xa, sa] = tout[i], [xb, sb] = tout[i + 1]; return xa + ((xb - xa) * (s - sa)) / (sb - sa || 1); };
  const n = Math.max(2, Math.round((s1 - s0) / 6)), out = [];
  for (let i = 0; i <= n; i++) { const s = s0 + ((s1 - s0) * i) / n; out.push([x(s), s]); }
  return out;
}

/**
 * Repère 4 : poignée (cote = 1 à droite, −1 à gauche) — tête forgée à deux
 * oreilles qui chevauchent la queue de la mâchoire, patte du boulon central
 * (à l'arrière pour la droite, à l'avant pour la gauche : assemblage à
 * mi-épaisseur) et bras tubulaire.
 */
function poignee(cote) {
  const g = new THREE.Group(), h = EP.tete / 2, m = rouge();
  g.add(plaque(contourTete(), -h, h, m, cote));
  const jeu = BOULON.d / 2 + 0.3;
  for (const f of [1, -1]) {
    const z = [h - EP.joue, h].map((v) => f * v).sort((a, b) => a - b);
    g.add(plaque(arc(ARTIC.x, ARTIC.s, ARTIC.r, 0, 348, 44), z[0], z[1], m, cote, [[ARTIC.x, ARTIC.s, jeu]]));
  }
  const zp = cote > 0 ? [-h, -0.2] : [0.2, h];
  g.add(plaque(contourPatte(), zp[0], zp[1], m, cote, [[0, CENTRE.s, jeu]]));
  const axe = axeBras(BRAS.s0, BRAS.fin);
  g.add(balayage(axe, (i) => rayonBras(axe[i][1]), m, cote));
  return g;
}

/**
 * Repère 8 : manchon en caoutchouc — garde au départ, quatre bossages pour les
 * doigts du côté intérieur (vers l'autre poignée), bout évasé et arrondi.
 */
function manchon(cote) {
  const { s0, s1, r, garde, bosse } = MANCHON, long = s1 - s0;
  // Sections tous les 2 mm, tous les 0,75 mm sur l'arrondi du bout.
  const brut = axeBras(s0, s1), axe = [];
  const x = (s) => { let i = 0; while (i < brut.length - 2 && brut[i + 1][1] < s) i++; const [xa, sa] = brut[i], [xb, sb] = brut[i + 1]; return xa + ((xb - xa) * (s - sa)) / (sb - sa); };
  for (let s = s0; s < s1 - 9; s += 2) axe.push([x(s), s]);
  for (let s = s1 - 9; s <= s1 + 1e-6; s += 0.75) axe.push([x(Math.min(s, s1)), Math.min(s, s1)]);
  const base = (u) => {
    if (u < 3) return BRAS.r1 + 1.5 + (garde - BRAS.r1 - 1.5) * Math.sin((u / 3) * 90 * RAD);
    if (u < 8) return garde;
    if (u < 16) return r + (garde - r) * (0.5 + 0.5 * Math.cos(((u - 8) / 8) * Math.PI));
    if (u > long - 9) return (r + 1.5) * Math.sqrt(Math.max(0, 1 - ((u - (long - 9)) / 9) ** 4));
    if (u > long - 27) return r + 1.5 * (0.5 - 0.5 * Math.cos(((u - (long - 27)) / 18) * Math.PI));
    return r;
  };
  const rayon = (i, a, B) => {
    const u = axe[i][1] - s0;
    // Bossages : seulement entre la garde et le bout, et du côté tourné vers l'axe de la pince.
    const dedans = Math.max(0, -cote * B.x * Math.sin(a));
    const onde = u > 20 && u < long - 28 ? 0.5 - 0.5 * Math.cos(((u - 20) / (long - 48)) * 4 * 2 * Math.PI) : 0;
    return Math.max(0.05, base(u) + bosse * onde * dedans ** 1.5);
  };
  return balayage(axe, rayon, 'rubber', cote, 28);
}

/** Boulon à tête hexagonale, tête devant (repères 3, 5 et 6) ; serrage : épaisseur prise entre tête et écrou. */
function boulon(S, x, s, serrage) {
  const z = serrage / 2;
  return S.bolt(BOULON.d * MM, (serrage + BOULON.ecrou + 3) * MM, 'blackOxide', { axis: 'z', pos: [x * MM, -s * MM, z * MM] });
}
/** Repère 7 : écrou hexagonal, derrière. */
function ecrou(S, x, s, serrage) {
  return S.nut(BOULON.plats * MM, BOULON.ecrou * MM, 'blackOxide', { axis: 'z', pos: [x * MM, -s * MM, -(serrage / 2 + BOULON.ecrou / 2) * MM] });
}

// ------------------------------------------------------------------ assemblage

// Pince couchée : x de l'outil vers −Z, s vers +X, z vers le haut.
const A_PLAT = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, -1), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 1, 0)));

/**
 * Monte la pince et enregistre ses pièces. Retourne poser(phi), qui met tout
 * le mécanisme à l'ouverture phi (radians) : mâchoires autour de leur pivot,
 * poignées autour du boulon central, boulons et écrous avec leur pièce.
 */
function assemblage(api) {
  const S = api.S;
  const seen = new Set();
  const mobiles = [];
  // suit : 'fixe', 'machoire', 'poignee', 'J' (boulon mâchoire-poignée) ou 'C' (boulon central) ; cote : 1 à droite, −1 à gauche.
  const put = (ref, obj, explode, suit = 'fixe', cote = 1) => {
    const pose = S.group(obj);
    const g = S.group(pose);
    g.quaternion.copy(A_PLAT);
    g.position.y = HAUT * MM;
    if (suit !== 'fixe') mobiles.push({ pose, suit, cote });
    api.part(ref, g, explode, { noLabel: seen.has(ref) });
    seen.add(ref);
  };
  const serrePivot = EP.machoire + 2 * (EP.eclisse + 0.2), serreTete = EP.tete;

  for (const c of [1, -1]) {
    put('1', machoire(c), [-0.03, 0, -c * 0.06], 'machoire', c);
    put('3', boulon(S, c * PIVOT.x, PIVOT.s, serrePivot), [0, 0.12, 0]);
    put('7', ecrou(S, c * PIVOT.x, PIVOT.s, serrePivot), [0, -0.11, 0]);
    put('4', poignee(c), [0.07, 0, -c * 0.07], 'poignee', c);
    put('5', boulon(S, c * ARTIC.x, ARTIC.s, serreTete), [0, 0.1, 0], 'J', c);
    put('7', ecrou(S, c * ARTIC.x, ARTIC.s, serreTete), [0, -0.09, 0], 'J', c);
    put('8', manchon(c), [0.24, 0, -c * 0.07], 'poignee', c);
  }
  put('2', eclisse(1), [0, 0.065, 0]);
  put('2', eclisse(-1), [0, -0.065, 0]);
  put('6', boulon(S, 0, CENTRE.s, serreTete), [0, 0.14, 0], 'C');
  put('7', ecrou(S, 0, CENTRE.s, serreTete), [0, -0.13, 0], 'C');

  /** Pose p ↦ centre + R(angle)·(p − origine), dans le plan de l'outil (mm). */
  const placer = (pose, origine, centre, angle) => {
    const o = rot(origine, angle);
    pose.rotation.z = angle;
    pose.position.set((centre[0] - o[0]) * MM, (centre[1] - o[1]) * MM, 0);
  };
  const poser = (phi) => {
    const e = etat(phi);
    for (const { pose, suit, cote } of mobiles) {
      const mir = ([x, y]) => [cote * x, y];
      // La bulle de repère, posée par la visionneuse sur la pièce, passe sur le groupe mobile pour le suivre.
      for (const c of [...pose.parent.children]) if (c.isCSS2DObject) pose.add(c);
      if (suit === 'machoire') placer(pose, mir(P0), mir(P0), -cote * phi);
      else if (suit === 'poignee') placer(pose, C0, mir(e.C), cote * e.psi);
      else if (suit === 'J') placer(pose, mir(J0), mir(e.J), 0);
      else placer(pose, C0, e.C, 0);
    }
  };
  poser(0);
  return poser;
}

/** P01 : la pince fermée, comme sur les photos. */
export function P01(api) {
  assemblage(api);
  // Coupe proposée : à mi-épaisseur (plan horizontal de la pince couchée).
  return { view: { dir: [-0.35, 1, 0.75], section: { axis: 'y', pos: 0.5 } } };
}

/** Écartement des bouts des poignées (hors tout, mm) pour l'ouverture phi. */
export function ecartement(phi) {
  let x = 0;
  for (const s of [MANCHON.s1 - 30, MANCHON.s1 - 6]) x = Math.max(x, pointPoignee(AXE_BRAS[AXE_BRAS.length - 1][0] + MANCHON.r + 1.5, s, phi)[0]);
  return 2 * x;
}
/** Jour entre les deux mâchoires au droit d'une empreinte (mm), pour l'ouverture phi. */
export const jour = (e, phi) => e.d + 2 * pointMachoire(0, e.s, phi)[0];

const smooth = (u) => u * u * (3 - 2 * u);
const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const GROS = EMPREINTES[EMPREINTES.length - 1];
export const STEPS = [
  { label: 'Départ', title: 'Pince fermée', text: 'Les deux mâchoires se touchent, les têtes des poignées sont en butée. Les trois boulons des poignées sont presque alignés : c\'est la position où la pince serre le plus fort.' },
  { title: 'Ouvrir les poignées', text: `Les têtes des poignées tournent autour du boulon central et tirent les queues des mâchoires l'une vers l'autre : les mâchoires s'écartent. Sur le modèle, les poignées s'ouvrent d'environ ${fr(etat(PHI_MAX).psi / RAD)}° chacune (${fr(ecartement(PHI_MAX) / 10)} cm d'un bout à l'autre) et l'empreinte de ${GROS.cable} po laisse un jour d'environ ${fr(jour(GROS, PHI_MAX))} mm pour y poser le manchon.` },
  { title: 'Refermer : le sertissage', text: 'En refermant, les trois boulons se réalignent (genouillère) : la course des mâchoires devient très petite pour un grand mouvement des poignées, et l\'effort sur le manchon est maximal en fin de course. Le manchon se place dans l\'empreinte de la grandeur du câble.' },
];

/** P02 : la même pince, animée en trois temps (fermée, ouverte, refermée). */
export function P02(api) {
  const poser = assemblage(api);
  const k = [0, 0];
  const maj = () => poser(PHI_MAX * (smooth(k[0]) - smooth(k[1])));
  k.forEach((_, i) => {
    const g = api.S.group();
    g.userData.stepAnim = { step: i + 1, delay: 300, dur: 2600, update: (v) => { k[i] = v; maj(); } };
    api.add(g);
  });
  // Même point de vue aux trois étapes, assez large pour la pince ouverte : de dessus, du côté des poignées.
  const cible = [0.44, HAUT * MM, 0], recul = [0.5, 1.15, 0];
  const cam = { pos: cible.map((v, i) => v + recul[i]), tgt: cible };
  return { view: { dir: [0.4, 1, 0.001], steps: STEPS.map((s) => ({ ...s, cam })), stepsAuto: true } };
}

export default { P01, P02 };

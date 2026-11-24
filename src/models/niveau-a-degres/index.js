// Niveau à degrés (rapporteur d'angle à fiole pivotante), d'après deux photos
// du client : boîtier noir, deux règles d'aluminium d'équerre (base et bout),
// cadran fixe gradué en degrés (0 à 90 dans chaque quart, « PLUMB » à 90) et en
// pente (« PITCH », pouces par pied), fiole verte montée en travers d'un
// tambour pivotant qui porte une aiguille rouge, molette bleue, trou de main.
// Le logo, lisible en partie (« Ta… », « SLA… »), est celui d'un Tajima SLANT ;
// les fiches du SLANT 100 (SLT-100) décrivent le même outil : boîtier d'ABS,
// molette au pouce, fiole à deux paires de traits, 10 po × 4 3/4 po.
//
// Première photo, de près : les 150 premiers millimètres, côté cadran, à
// l'échelle du couvercle du cadran pris à 100 mm (ce qui redonne la hauteur
// publiée de 4 3/4 po) — cadran, tambour, fiole, règles, molette, début du
// trou de main et du logo. Seconde photo : l'outil entier, petit (1,4 mm par
// pixel), collé au poteau du rack à tiges — elle donne la forme du bout :
// chant du haut en biseau après la molette, trou de main en trapèze, bout
// tronqué, et une longueur d'environ 9 po (229 mm à 6 mm près), et non les
// 10 po d'un détaillant. L'épaisseur, le dos et l'entraînement du tambour par
// la molette restent supposés et signalés.
//
// Indiqué par le client : l'outil sert à vérifier l'angle du support de tiges
// de forage (rack à tiges, équipement « rack-tiges-dd »), qui doit être entre
// 75° et 80° (procédure PRO-DD-ST-008, étape 5), et il est aimanté : sur la
// seconde photo, il tient seul par sa règle de base contre la face avant du
// poteau du rack, cadran vers le haut. Les aimants sont cachés : une bande
// aimantée dans la face de mesure de la règle de base est supposée.
//
// L'outil fonctionne (src/ui/features/niveau-degres.js) : regler() pose
// l'outil sur une pente, tourne le tambour et la molette ; bulle() donne la
// place de la bulle dans la fiole ; lecture() l'angle sous l'aiguille ;
// verdictRack() dit si l'angle lu convient au rack à tiges.
//
// Repère de l'outil, en millimètres : x le long de la règle de base (0 au bout
// du cadran), y vers le haut (0 sous la face de mesure), z en travers (0 au
// milieu de l'épaisseur, la face du cadran vers +z). Modèle en mètres, outil
// debout sur sa règle de base.
import * as THREE from 'three';
import { mat, withFinish } from '../../viewer/materials.js';

const MM = 0.001;
const RAD = Math.PI / 180;
export const IN = 25.4;

// ------------------------------------------------------------------ cotes (mm)

/**
 * Longueur hors tout : environ 9 po, mesurés sur la seconde photo (229 mm à 6 mm près, du
 * bout du cadran au bout tronqué, à l'échelle de l'entraxe cadran–molette de la première) ;
 * un détaillant annonce 10 po. Hauteur : 4 3/4 po publiés, que les deux photos confirment.
 */
export const L = 9 * IN;
export const H = 4.75 * IN;
/** Épaisseur du boîtier : supposée (l'emballage fait environ 1 po). */
export const T = 25;
/** Règles d'aluminium : largeur vue de face (photo), rainures près de l'arête (place et taille estimées). */
export const REGLE = { ep: 8.5, rainures: [1.4, 2.6, 3.8], creux: 0.45, haut: 104 };
/**
 * Bande aimantée de la règle de base : l'aimantation est indiquée par le client,
 * la forme, la taille et la place sont supposées (cachées sur la photo). En
 * retrait de la face de mesure, pour que l'outil porte sur l'aluminium.
 */
export const AIMANT = { large: 6, ep: 1.5, retrait: 0.2 };
/**
 * Usage indiqué par le client : angle du rack à tiges, entre 75° et 80° par
 * rapport au sol (procédure PRO-DD-ST-008, étape 5) ; `pose` : angle du support
 * dans la scène d'installation du site (src/models/rack-tiges-dd/support.js).
 */
export const RACK = { min: 75, max: 80, pose: 78 };
/** Coins du boîtier : au-dessus de la règle de bout (première photo), à l'épaule et au bout tronqué (seconde photo, estimés). */
export const COINS = { bout: 14, epaule: 4, fin: 7, bas: 3 };
/**
 * Chant du haut, après la molette (seconde photo) : il descend en biseau vers le bout, en
 * passant par (x, y) avec la pente donnée (environ 21°) ; `epaule` : où le chant quitte la
 * pleine hauteur, et où le biseau commence, sous la molette qui cache le décrochement.
 */
export const BISEAU = { x: 150, y: 95.9, pente: 0.382, epaule: [137, 147] };
/** Hauteur du chant en biseau à la distance x du bout du cadran (mm). */
export const biseau = (x) => BISEAU.y - BISEAU.pente * (x - BISEAU.x);
/**
 * Cadran (photo) : centre, rayon du couvercle (échelle : Ø 100 mm), méplat du
 * côté de la règle de base, arc des graduations, chiffres, fenêtre du tambour.
 */
export const CADRAN = {
  x: 63, y: 51, rCouvercle: 50, rPlaque: 48.4, rTrou: 31.9, meplat: 9.2,
  rArc: 38.2, rChiffres: 33.8, rPente: 45.7, rPlumb: 44.3, epPlaque: 0.8,
  couvercle: { ep: 2.2, jour: 2, rTrou: 31.6, jupe: 1.4 },
};
/** Tambour pivotant (porte-fiole) : cuvette noire, collerette et aiguille rouge sous le couvercle. */
export const TAMBOUR = { rExt: 31.2, rInt: 28.6, fond: 1.5, saillie: 3.8, collerette: 33, aiguille: { de: 31, a: 38.4, large: 0.7, ep: 0.4 } };
/** Fiole : tube, partie vue entre les embouts, deux paires de traits, embouts noirs, recul sous la face. */
export const FIOLE = { d: 11, vue: 27, traits: [6, 7.6], embout: { d: 14 }, recul: 5, bulle: { long: 10.5, haut: 4.2, large: 6.4 } };
/** Molette bleue (photo) : centre, diamètre, cannelures (nombre estimé), saillie sur la face (supposée). */
export const MOLETTE = { x: 130, y: 108, d: 29, cannelures: 28, saillie: 8 };
/**
 * Trou de main, en trapèze : bord du côté du cadran (x0), bas (y0) et coin du haut sur la
 * première photo ; côté du haut en pente, parallèle au biseau, et bout étroit (x1) sur la
 * seconde. y1 : hauteur du côté en pente au bord x0 ; r : coins du côté du cadran, puis du bout.
 */
export const TROU = { x0: 131, x1: 212, y0: 40, y1: 88.2, pente: 0.469, r: [12, 5] };
/** Marquage entre la règle de base et le trou de main : cadre du logo (début sur la première photo, longueur sur la seconde). */
export const MARQUE = { x0: 133, x1: 183, y0: 17.5, y1: 28, r: 2.5, trait: 0.6 };
/** Graduation de pente, en pouces par pied : traits, et valeurs chiffrées (lues sur la photo). */
export const PENTES = [...Array.from({ length: 20 }, (_, i) => i + 1), 22, 24, 26, 28, 30, 32, 34, 36, 38, 40];
export const PENTES_CHIFFREES = [2, 3, 4, 6, 7, 8, 10, 12, 14, 20, 30, 40];

/** Démultiplication molette → tambour : supposée (le mécanisme est caché). */
export const RAPPORT = 3;
/**
 * Fiole en tonneau : rayon de courbure de la paroi (mm), supposé — la bulle
 * glisse d'environ 1,2 mm par degré et bute au bout à environ 7°.
 */
export const COURBURE = 70;

const ZF = T / 2; // face avant du boîtier
const ZV = ZF - FIOLE.recul; // axe de la fiole
const P = (x, y, z) => [x * MM, y * MM, z * MM];
const mm = (pts) => pts.map(([x, y]) => [x * MM, y * MM]);

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
/** ABS noir du boîtier, du tambour et des embouts. */
const noir = () => teinte('niveau-degres-noir', () => withFinish(new THREE.MeshStandardMaterial({ color: 0x1b1c1f, metalness: 0, roughness: 0.52 }), 'plastic'));
/** Aluminium des règles (extrusion anodisée). */
const alu = () => teinte('niveau-degres-alu', () => withFinish(new THREE.MeshStandardMaterial({ color: 0xc6cace, metalness: 1, roughness: 0.34 }), 'machined'));
/** Bleu de la molette. */
const bleu = () => teinte('niveau-degres-bleu', () => withFinish(new THREE.MeshStandardMaterial({ color: 0x1f6fd0, metalness: 0, roughness: 0.45 }), 'plastic'));
/** Rouge de l'aiguille. */
const rouge = () => teinte('niveau-degres-rouge', () => new THREE.MeshStandardMaterial({ color: 0xd3221c, emissive: 0x4a0604, emissiveIntensity: 0.5, roughness: 0.5 }));
/** Gris du cadre du marquage. */
const grisMarque = () => teinte('niveau-degres-marque', () => new THREE.MeshStandardMaterial({ color: 0x8b8f93, metalness: 0, roughness: 0.6 }));
/** Liquide vert de la fiole. */
const liquide = () => teinte('niveau-degres-liquide', () => new THREE.MeshPhysicalMaterial({
  color: 0x86d81f, emissive: 0x244a00, emissiveIntensity: 0.65, roughness: 0.15, transparent: true, opacity: 0.62, depthWrite: false,
}));
/** Bulle d'air. */
const air = () => teinte('niveau-degres-bulle', () => new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: 0xeaf4d2, emissiveIntensity: 0.6, roughness: 0.1 }));
/** Couvercle transparent du cadran. */
const verre = () => teinte('niveau-degres-verre', () => new THREE.MeshPhysicalMaterial({
  color: 0xe6f0f6, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.2, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.03,
}));

// ------------------------------------------------------------------ graduations

/** Valeur lue (degrés, 0 à 90) au point du cadran d'angle polaire beta (degrés depuis +x) : 0 en haut et en bas, 90 aux côtés. */
export function graduation(beta) {
  const a = ((beta % 180) + 180) % 180;
  return Math.abs(90 - a);
}

/**
 * Image du cadran (aucune hors navigateur : la plaque reste blanche) : arc,
 * traits des degrés aux 2° vers l'intérieur, chiffres aux 10° (90 en rouge),
 * traits de pente vers l'extérieur, « PLUMB » aux 90, « ANGLE » et « PITCH ».
 */
function imageCadran() {
  if (typeof document === 'undefined') return null;
  if (perso.has('img:cadran')) return perso.get('img:cadran');
  const N = 2048;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d');
  const k = N / (2 * CADRAN.rPlaque); // px par mm
  g.fillStyle = '#eceee9';
  g.fillRect(0, 0, N, N);
  g.translate(N / 2, N / 2);
  const encre = '#22262a';
  const pt = (r, beta) => [r * Math.cos(beta * RAD) * k, -r * Math.sin(beta * RAD) * k];
  const trait = (beta, r0, r1, large, couleur = encre) => {
    g.strokeStyle = couleur;
    g.lineWidth = large * k;
    g.beginPath();
    g.moveTo(...pt(r0, beta));
    g.lineTo(...pt(r1, beta));
    g.stroke();
  };
  /** Texte tangent au rayon r ; dehors : haut des lettres vers l'extérieur (chiffres), sinon vers le centre. */
  const texte = (s, beta, r, haut, { couleur = encre, dehors = true, gras = 600 } = {}) => {
    g.save();
    g.translate(...pt(r, beta));
    g.rotate((90 - beta) * RAD + (dehors ? 0 : Math.PI));
    g.fillStyle = couleur;
    g.font = `${gras} ${haut * 1.38 * k}px Arial, Helvetica, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(s, 0, 0);
    g.restore();
  };
  const A = CADRAN.rArc;
  // Place des mots « ANGLE » et « PITCH » : quart bas gauche, entre 30 et 40.
  const MOTS = 235;
  g.strokeStyle = encre;
  g.lineWidth = 0.2 * k;
  g.beginPath();
  g.arc(0, 0, A * k, 0, Math.PI * 2);
  g.stroke();
  for (let b = 0; b < 360; b += 2) {
    const v = Math.round(graduation(b));
    if (Math.abs(b - MOTS) < 4.5) continue; // les mots prennent la place des traits
    trait(b, A, A - (v % 10 === 0 ? 2.3 : 1.1), v % 10 === 0 ? 0.2 : 0.14);
  }
  for (let b = 0; b < 360; b += 10) {
    const v = Math.round(graduation(b));
    texte(String(v), b, CADRAN.rChiffres, 2.3, { couleur: v === 90 ? '#c8202a' : encre });
  }
  // Pente : de part et d'autre de chaque zéro (haut et bas), jusqu'à 40 po par pied.
  for (const zero of [90, 270]) for (const s of [-1, 1]) for (const p of PENTES) {
    const b = zero + s * Math.atan(p / 12) / RAD;
    const chiffre = PENTES_CHIFFREES.includes(p);
    trait(b, A, A + (chiffre ? 4.2 : 2.3), 0.13);
    if (chiffre) texte(String(p), b, CADRAN.rPente, 1.3, { gras: 500 });
  }
  for (const b of [0, 180]) {
    trait(b, A, A + 4.4, 0.2);
    texte('PLUMB', b, CADRAN.rPlumb + 1.4, 1.6, { gras: 700 });
  }
  texte('ANGLE', MOTS, A - 1.5, 1.4, { dehors: false });
  texte('PITCH', MOTS, A + 1.7, 1.4, { dehors: false });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  perso.set('img:cadran', t);
  return t;
}
/** Face imprimée du cadran. */
const facePlaque = () => teinte('niveau-degres-cadran', () => {
  const map = imageCadran();
  return new THREE.MeshStandardMaterial({ color: map ? 0xffffff : 0xeceee9, map, metalness: 0, roughness: 0.55 });
});
/** Chant et dos de la plaque du cadran. */
const blanc = () => teinte('niveau-degres-blanc', () => new THREE.MeshStandardMaterial({ color: 0xe3e5e0, metalness: 0, roughness: 0.6 }));

// ------------------------------------------------------------------ contours

/** Rectangle aux coins arrondis [x, y] (mm), parcouru dans le sens trigonométrique. */
function rectRond(x0, y0, x1, y1, r, n = 8) {
  r = Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2);
  const pts = [];
  const coins = [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]];
  for (const [ox, oy, a0] of coins) for (let i = 0; i <= n; i++) {
    const a = (a0 + (i / n) * 90) * RAD;
    pts.push([ox + r * Math.cos(a), oy + r * Math.sin(a)]);
  }
  return pts;
}
/** Arc de cercle [x, y] (mm) de a0 à a1 (degrés), n segments. */
function arc(cx, cy, r, a0, a1, n) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = (a0 + ((a1 - a0) * i) / n) * RAD;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
}
/**
 * Disque de rayon r centré sur le cadran et coupé par un méplat à la hauteur y
 * (mm, repère de l'outil), dans le repère du cadran (origine au centre).
 */
function disqueMeplat(r, y, n = 96) {
  const s = Math.max(-1, (y - CADRAN.y) / r);
  if (s <= -1) return arc(0, 0, r, 0, 360 - 360 / n, n - 1);
  const a = Math.asin(s) / RAD; // négatif : le méplat est sous le centre
  return arc(0, 0, r, a, 180 - a, n);
}

/**
 * Polygone aux sommets arrondis : sommets [x, y, r] (r : rayon du congé, 0 ou absent : angle
 * vif), saillants ou rentrants ; retourne les points [x, y], dans l'ordre des sommets.
 */
function arrondir(sommets, n = 6) {
  const pts = [];
  const N = sommets.length;
  for (let i = 0; i < N; i++) {
    const [x, y, r = 0] = sommets[i];
    if (!r) { pts.push([x, y]); continue; }
    const [xa, ya] = sommets[(i + N - 1) % N], [xb, yb] = sommets[(i + 1) % N];
    let ax = xa - x, ay = ya - y, bx = xb - x, by = yb - y;
    const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by);
    ax /= la; ay /= la; bx /= lb; by /= lb;
    const demi = Math.acos(Math.max(-1, Math.min(1, ax * bx + ay * by))) / 2;
    // Le congé ne mange pas plus de la moitié de chaque côté.
    const t = Math.min(r / Math.tan(demi), la / 2, lb / 2);
    const rr = t * Math.tan(demi), d = rr / Math.sin(demi);
    const lm = Math.hypot(ax + bx, ay + by);
    const cx = x + ((ax + bx) / lm) * d, cy = y + ((ay + by) / lm) * d;
    const a0 = Math.atan2(y + ay * t - cy, x + ax * t - cx);
    let da = Math.atan2(y + by * t - cy, x + bx * t - cx) - a0;
    da = Math.atan2(Math.sin(da), Math.cos(da)); // par le plus court
    for (let k = 0; k <= n; k++) pts.push([cx + rr * Math.cos(a0 + (da * k) / n), cy + rr * Math.sin(a0 + (da * k) / n)]);
  }
  return pts;
}

/**
 * Contour du boîtier (mm) : au-dessus de la règle de base, à droite de la règle de bout, qu'il
 * coiffe au coin ; pleine hauteur jusqu'à la molette, épaule, biseau jusqu'au bout tronqué.
 */
export function contourBoitier() {
  const e = REGLE.ep;
  const [x0, x1] = BISEAU.epaule;
  return arrondir([
    [e, e], [L, e, COINS.bas], [L, biseau(L), COINS.fin], [x1, biseau(x1), COINS.epaule], [x0, H, COINS.epaule],
    [0, H, COINS.bout], [0, REGLE.haut], [e, REGLE.haut],
  ]);
}

/** Contour du trou de main (mm) : trapèze aux coins arrondis, large du côté du cadran, étroit au bout. */
export function contourTrou() {
  const t = TROU;
  return arrondir([[t.x0, t.y0, t.r[0]], [t.x1, t.y0, t.r[1]], [t.x1, t.y1 - t.pente * (t.x1 - t.x0), t.r[1]], [t.x0, t.y1, t.r[0]]], 8);
}

// ------------------------------------------------------------------ pièces

/** Repère 1 : boîtier d'ABS noir, percé du logement du tambour et du trou de main ; cadre du marquage. */
function boitier(S) {
  const g = S.group();
  const trous = [[CADRAN.x * MM, CADRAN.y * MM, (TAMBOUR.rExt + 0.5) * MM], mm(contourTrou())];
  g.add(S.extrude(mm(contourBoitier()), T * MM, noir(), { holes: trous }));
  // Marquage : seul le cadre est fait, le logo n'est lisible qu'en partie sur la photo.
  const q = MARQUE;
  const cadre = S.extrude(mm(rectRond(q.x0, q.y0, q.x1, q.y1, q.r)), 0.3 * MM, grisMarque(), {
    holes: [mm(rectRond(q.x0 + q.trait, q.y0 + q.trait, q.x1 - q.trait, q.y1 - q.trait, q.r - q.trait))],
  });
  cadre.position.z = (ZF + 0.15) * MM;
  g.add(cadre);
  return g;
}

/**
 * Section d'une règle (mm) : u en travers de l'épaisseur, v depuis la face de
 * mesure ; trois rainures près de l'arête, sur les deux faces (dos supposé pareil).
 */
function sectionRegle(aimant = false) {
  const d = T / 2, c = REGLE.creux, l = 0.3;
  const face = (s) => REGLE.rainures.flatMap((v) => [[s * d, v - l], [s * (d - c), v - l / 3], [s * (d - c), v + l / 3], [s * d, v + l]]);
  // Logement de la bande aimantée, au milieu de la face de mesure.
  const a = AIMANT.large / 2;
  const logement = aimant ? [[-a, 0], [-a, AIMANT.ep], [a, AIMANT.ep], [a, 0]] : [];
  return [[-d, 0], ...logement, [d, 0], ...face(1), [d, REGLE.ep], [-d, REGLE.ep], ...face(-1).reverse()];
}

/** Repère 2 : règle de base, sur toute la longueur ; sa face du dessous est la face de mesure. */
function regleBase(S) {
  const m = S.extrude(mm(sectionRegle(true)), L * MM, alu());
  // Section (u, v) → (z, y) ; extrusion le long de x.
  m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0)));
  m.position.set((L / 2) * MM, 0, 0);
  return S.group(m);
}

/** Repère 3 : règle de bout, d'équerre avec la base, du dessus de celle-ci jusqu'au coin du boîtier. */
function regleBout(S) {
  const long = REGLE.haut - REGLE.ep;
  const m = S.extrude(mm(sectionRegle()), long * MM, alu());
  // Section (u, v) → (z, x) ; extrusion le long de y.
  m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)));
  m.position.set(0, (REGLE.ep + long / 2) * MM, 0);
  return S.group(m);
}

/** Repère 9 : bande aimantée, dans son logement sous la règle de base (forme supposée). */
function aimant(S) {
  const a = AIMANT, h = a.ep - a.retrait;
  return S.group(S.box(L * MM, h * MM, (a.large - 0.2) * MM, 'blackOxide', { pos: P(L / 2, a.retrait + h / 2, 0) }));
}

/** Repère 4 : cadran fixe, plaque blanche imprimée, à méplat, autour du tambour (origine au centre du cadran). */
function cadran(S) {
  const c = CADRAN;
  const contour = disqueMeplat(c.rPlaque, c.meplat);
  const g = S.group(S.extrude(mm(contour), c.epPlaque * MM, blanc(), { holes: [[0, 0, c.rTrou * MM]] }));
  // Face imprimée : même contour, image posée à plat (0 à 1 sur le carré du disque).
  const forme = new THREE.Shape(contour.map(([x, y]) => new THREE.Vector2(x * MM, y * MM)));
  const trou = new THREE.Path();
  trou.absarc(0, 0, c.rTrou * MM, 0, Math.PI * 2, true);
  forme.holes.push(trou);
  const geo = new THREE.ShapeGeometry(forme, 48);
  const uv = geo.attributes.uv, pos = geo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / (2 * c.rPlaque * MM) + 0.5, pos.getY(i) / (2 * c.rPlaque * MM) + 0.5);
  const face = new THREE.Mesh(geo, facePlaque());
  face.position.z = (c.epPlaque / 2 + 0.03) * MM;
  g.add(face);
  return g;
}

/** Repère 5 : couvercle transparent du cadran, anneau à méplat et jupe qui porte sur le boîtier (origine au centre du cadran). */
function couvercle(S) {
  const c = CADRAN, k = c.couvercle;
  const dehors = disqueMeplat(c.rCouvercle, REGLE.ep + 0.2);
  const dedans = disqueMeplat(c.rCouvercle - k.jupe, REGLE.ep + 0.2 + k.jupe);
  const glace = S.extrude(mm(dehors), k.ep * MM, verre(), { holes: [[0, 0, k.rTrou * MM]] });
  glace.position.z = (k.jour + k.ep / 2) * MM;
  const jupe = S.extrude(mm(dehors), k.jour * MM, verre(), { holes: [mm(dedans)] });
  jupe.position.z = (k.jour / 2) * MM;
  return S.group(glace, jupe);
}

/**
 * Repère 6 : tambour pivotant (origine au centre du cadran, sur la face du
 * boîtier) : cuvette noire qui traverse le boîtier, collerette sous le
 * couvercle et aiguille rouge, vers +y au repos (zéro du haut).
 */
function tambour(S) {
  const t = TAMBOUR, a = t.aiguille;
  const dos = -T + 0.4; // fond presque au ras du dos (supposé)
  const g = S.group(S.lathe([[0, dos], [t.rExt, dos], [t.rExt, t.saillie], [t.rInt, t.saillie], [t.rInt, dos + t.fond], [0, dos + t.fond]].map(([r, z]) => [r * MM, z * MM]), noir(), { axis: 'z', seg: 72 }));
  g.add(S.ring(t.collerette * MM, (t.rExt - 0.2) * MM, 0.6 * MM, noir(), { axis: 'z', seg: 72, pos: P(0, 0, CADRAN.epPlaque + 0.5) }));
  g.add(S.box(a.large * MM, (a.a - a.de) * MM, a.ep * MM, rouge(), { pos: P(0, (a.de + a.a) / 2, CADRAN.epPlaque + 0.5) }));
  return g;
}

/**
 * Repère 7 : fiole (origine au centre du cadran, sur l'axe de la fiole, le long
 * de x) : tube de liquide vert, deux paires de traits, embouts noirs jusqu'à la
 * paroi du tambour, bulle (userData.bulle) déplacée par bulle().
 */
function fiole(S) {
  const f = FIOLE, r = f.d / 2;
  const g = S.group(S.cyl(r * MM, (f.vue + 3) * MM, liquide(), { axis: 'x', seg: 32 }));
  for (const s of [-1, 1]) {
    for (const x of f.traits) g.add(S.cyl((r + 0.2) * MM, 0.35 * MM, noir(), { axis: 'x', seg: 32, pos: P(s * x, 0, 0) }));
    const x0 = f.vue / 2, x1 = TAMBOUR.rInt + 0.3;
    g.add(S.cyl((f.embout.d / 2) * MM, (x1 - x0) * MM, noir(), { axis: 'x', seg: 32, pos: P(s * (x0 + x1) / 2, 0, 0) }));
  }
  const b = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14), air());
  b.scale.set((f.bulle.long / 2) * MM, (f.bulle.haut / 2) * MM, (f.bulle.large / 2) * MM);
  b.name = 'bulle';
  g.add(b);
  g.userData.bulle = b;
  placerBulle(b, bulle([0, 1, 0], 0));
  return g;
}

/** Repère 8 : molette bleue cannelée, sur la face (origine sur son axe, au ras du boîtier). */
function molette(S) {
  const m = MOLETTE, r = m.d / 2, n = m.cannelures;
  // Cannelures arrondies : le rayon ondule de 1,1 mm autour de la molette.
  const tour = Array.from({ length: n * 8 }, (_, i) => {
    const a = (i / (n * 8)) * Math.PI * 2;
    const rr = r - 0.55 * (1 + Math.cos(a * n));
    return [rr * Math.cos(a), rr * Math.sin(a)];
  });
  const corps = S.extrude(mm(tour), m.saillie * MM, bleu());
  corps.position.z = (m.saillie / 2) * MM;
  const g = S.group(corps);
  // Moyeu en léger relief et repère d'un tour (une nervure, pour voir la molette tourner).
  g.add(S.cyl((r - 3.5) * MM, 0.6 * MM, bleu(), { axis: 'z', seg: 40, pos: P(0, 0, m.saillie + 0.3) }));
  g.add(S.box(1.2 * MM, (r - 5) * MM, 0.5 * MM, bleu(), { pos: P(0, (r - 5) / 2 + 1, m.saillie + 0.8) }));
  return g;
}

// ------------------------------------------------------------------ fonctionnement

/**
 * Angle lu sous l'aiguille pour le tambour tourné de `cadran` degrés (sens
 * trigonométrique vu de face ; 0 : fiole parallèle à la base, aiguille au zéro
 * du haut). Retourne les degrés (0 à 90), la pente en pouces par pied et en
 * pour cent (Infinity à 90°).
 */
export function lecture(cadran) {
  const deg = graduation(90 + cadran);
  const t = deg >= 90 ? Infinity : Math.tan(deg * RAD);
  return { deg, pente: 12 * t, pourcent: 100 * t };
}

/**
 * Angle lu (degrés, 0 à 90) comparé à la plage du rack à tiges (RACK) :
 * 'conforme', 'couche' (moins de 75° : trop couché) ou 'debout' (plus de 80°).
 * La plage est fermée : 75° et 80° conviennent.
 */
export function verdictRack(deg) {
  const e = 1e-9;
  return deg < RACK.min - e ? 'couche' : deg > RACK.max + e ? 'debout' : 'conforme';
}

/**
 * Place de repos de la bulle (mm, repère de la fiole : x le long du tube) pour
 * la verticale `haut` ([x, y, z] unitaire, repère de l'outil) et le tambour
 * tourné de `cadran` degrés. La bulle monte le long de la paroi en tonneau
 * (COURBURE) vers le bout le plus haut, bute au bout, et se tient contre la
 * paroi du côté du haut. Retourne aussi `ecart` : l'inclinaison de la fiole
 * (degrés, positive si le bout +x est le plus haut).
 */
export function bulle(haut, cadran) {
  const c = Math.cos(cadran * RAD), s = Math.sin(cadran * RAD);
  // Verticale dans le repère de la fiole (tambour tourné de `cadran` autour de z).
  const ux = haut[0] * c + haut[1] * s, uy = -haut[0] * s + haut[1] * c, uz = haut[2];
  const lat = Math.hypot(uy, uz);
  const f = FIOLE, course = (f.vue + 3) / 2 - f.bulle.long / 2;
  const x = lat < 1e-4 ? Math.sign(ux) * course : Math.max(-course, Math.min(course, (COURBURE * ux) / lat));
  // Contre la paroi, du côté du haut ; au centre du tube quand la fiole est debout.
  const jeu = (f.d / 2 - f.bulle.haut / 2 - 0.3) * Math.min(1, lat * 4);
  return { x, y: lat < 1e-4 ? 0 : (uy / lat) * jeu, z: lat < 1e-4 ? 0 : (uz / lat) * jeu, ecart: Math.atan2(ux, lat) / RAD, course };
}

/** Pose la bulle (maillage de la fiole) à la place { x, y, z } (mm). */
export function placerBulle(maillage, p) {
  maillage.position.set(p.x * MM, p.y * MM, p.z * MM);
}

/** Pièces mobiles d'un modèle construit par P01 : { tambour, fiole, molette, bulle }. */
export function mobiles(racine) {
  const m = {};
  for (const o of racine.children) if (o.userData.mobile) m[o.userData.mobile] = o;
  m.bulle = m.fiole?.userData.bulle || null;
  return m;
}

/**
 * Règle le modèle : outil posé sur une surface en pente de `pente` degrés (il
 * pivote autour du milieu de sa règle de base et reste posé au sol), tambour
 * tourné de `cadran` degrés, molette entraînée en sens contraire (RAPPORT).
 * La bulle se pose avec placerBulle().
 */
export function regler(racine, { pente = 0, cadran = 0 } = {}) {
  const m = mobiles(racine);
  const a = pente * RAD;
  // Pivot : milieu de la face de mesure ; relevé pour que le coin le plus bas touche le sol.
  const px = (L / 2) * MM;
  racine.rotation.set(0, 0, a);
  const coins = [[0, 0], [L, 0], [L, H], [0, H]].map(([x, y]) => (x * MM - px) * Math.sin(a) + y * MM * Math.cos(a));
  racine.position.set(px - px * Math.cos(a), -px * Math.sin(a) - Math.min(...coins), 0);
  if (m.tambour) m.tambour.rotation.z = cadran * RAD;
  if (m.fiole) m.fiole.rotation.z = cadran * RAD;
  if (m.molette) m.molette.rotation.z = -cadran * RAD * RAPPORT;
  racine.updateMatrixWorld(true);
  return m;
}

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  const S = api.S;
  const c = CADRAN;
  const mobile = (o, nom) => { o.userData.mobile = nom; return o; };
  const auCadran = (o, z) => { o.position.set(c.x * MM, c.y * MM, z * MM); return o; };
  api.part('1', boitier(S), [0, 0, 0]);
  api.part('2', regleBase(S), [0, -0.03, 0]);
  api.part('3', regleBout(S), [-0.03, 0, 0]);
  api.part('9', aimant(S), [0, -0.055, 0]);
  // Pièces concentriques : les bulles de repère sont écartées du milieu, où se lit la bulle de la fiole.
  const pol = (r, a, z) => ({ labelAt: P(r * Math.cos(a * RAD), r * Math.sin(a * RAD), z) });
  // Le cadran est sous le couvercle : sa bulle de repère se tient juste au-dessus de la glace, sans quoi elle serait masquée.
  api.part('4', auCadran(cadran(S), ZF + c.epPlaque / 2), [0, 0, 0.03], pol(43, 135, c.couvercle.jour + c.couvercle.ep + 0.3 - c.epPlaque / 2));
  api.part('5', auCadran(couvercle(S), ZF), [0, 0, 0.095], pol(c.rCouvercle - 2, 35, c.couvercle.jour + c.couvercle.ep));
  api.part('6', mobile(auCadran(tambour(S), ZF), 'tambour'), [0, 0, 0.06], pol((TAMBOUR.rExt + TAMBOUR.rInt) / 2, -90, TAMBOUR.saillie));
  api.part('7', mobile(auCadran(fiole(S), ZV), 'fiole'), [0, 0, 0.14], pol(21, 0, FIOLE.embout.d / 2));
  const m = molette(S);
  m.position.set(MOLETTE.x * MM, MOLETTE.y * MM, ZF * MM);
  api.part('8', mobile(m, 'molette'), [0, 0.02, 0.05]);
  // Coupe proposée : en travers, par l'axe du cadran (boîtier, tambour, fiole, couvercle).
  return { view: { dir: [0.35, 0.3, 1], section: { axis: 'x', pos: c.x / L } } };
}

export default { P01 };

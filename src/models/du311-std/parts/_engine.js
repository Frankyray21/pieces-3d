// Cotes et fonctions communes du lot « moteur » du DU311 sur roues : groupe
// moteur P246 (Mercedes OM904 LA / MBE904, pompes, radiateur P266,
// refroidisseur P270, carter de courroie P268, échappement P272, tuyauterie
// CAC et refroidissement P274, flexibles P276, collecteur de translation
// P260, distributeur P262) et capot moteur P240. Fichier partagé (préfixe
// « _ ») : pas un assemblage, jamais inscrit dans parts/index.js.
//
// IMPLANTATION (repère machine de ../layout.js : origine au sol sous
// l'articulation, X vers l'avant, Y vers le haut, Z à droite), relevée sur la
// vue de dessus de la page 252 (canevas du capot de 1,96 m de large pour
// l'échelle) et la vue de dessus de la page 12 : moteur TRANSVERSAL sur le
// châssis arrière, sous le capot M.engine (x −2.75 → −1.1) ; vilebrequin
// selon Z, poulie et carter de courroie à droite (+Z), carter de volant et
// pompes en tandem à gauche (−Z) ; radiateur (eau + air de suralimentation)
// debout en travers à l'arrière du compartiment, ventilateur hydraulique
// Ø 24 po tourné vers le moteur ; refroidisseur d'huile hydraulique (P270)
// suspendu côté droit derrière la porte à persiennes ; filtre à air couché
// côté gauche sous l'entrée d'air du toit (x −2.22, z −0.49, comme le
// préfiltre de ../carrier.js), collecteur de translation P260 sous lui ;
// distributeur de translation P262 et bloc surpresseur au-dessus des pompes ;
// silencieux couché entre les longerons sous le radiateur.

export const IN = 0.0254;
export const MM = 0.001;
export const u = (v) => v * IN;

// ---------------------------------------------------------------- moteur OM904 LA
// REPÈRE MOTEUR (pièces dessinées sur le moteur dans P246) : origine sur
// l'axe du vilebrequin dans le plan de la face SAE du carter de volant
// (face d'appui de la pompe 90 cc) ; +x vers l'avant du moteur (poulie,
// carter de courroie) ; y vers le haut ; +z à droite en regardant vers
// l'avant (côté échappement, turbocompresseur et radiateur) ; −z côté
// admission, calculateur, filtres et démarreur.
// Passage au repère machine : x → +Z, y → +Y, z → −X ; origine en
// (ENG.x, ENG.y, ENG.zSae). Encombrement d'après les données Mercedes
// (≈ 0,82 × 0,69 × 0,78 m sans pompes), proportions des pages 246 à 254.
export const ENG = {
  x: -1.62, // axe du vilebrequin (machine)
  y: 1.32,
  zSae: -0.3, // face SAE (machine)
  blockX: [0.115, 0.665], // carter-cylindres (repère moteur)
  cylX: [0.6, 0.47, 0.34, 0.21], // cylindres 1 (avant) à 4
  bore: 0.102,
  skirtY: -0.1, // plan de joint du carter d'huile
  deckY: 0.29, // plan de joint de culasse
  headY: 0.4, // plan de joint du couvre-culasse
  coverY: 0.5, // dessus du couvre-culasse
  panY: -0.22, // dessous du carter d'huile
  frontX: 0.715, // face avant du carter de distribution
  pulleyX: [0.72, 0.8], // amortisseur / poulie de vilebrequin
  sae: { outR: 0.255, boltR: 0.2143, boreR: 0.2048, n: 12 }, // carter de volant SAE 3
  // Pattes : avant sur le carter de distribution, arrière par les consoles
  // du kit de suspension vissées sur le carter de volant (dessous à footY).
  footY: -0.15,
  feet: [[0.62, -0.25], [0.62, 0.25], [0.055, -0.3], [0.055, 0.3]], // [x, z]
  // Turbocompresseur (côté +z) : centre du corps, roue de compresseur vers −x.
  turbo: { x: 0.3, y: 0.26, z: 0.3 },
  intake: { x: 0.13, y: 0.43, z: -0.22 }, // entrée de la tubulure d'admission (vers +y)
  thermo: { x: 0.69, y: 0.44, z: 0.07 }, // sortie du boîtier de thermostat (vers +z)
  pumpIn: { x: 0.69, y: 0.06, z: 0.15 }, // entrée de la pompe à eau (vers +z)
};

/** Point du repère moteur → repère machine. */
export const e2m = ([x, y, z]) => [ENG.x - z, ENG.y + y, ENG.zSae + x];
/** Direction du repère moteur → repère machine. */
export const e2mDir = ([x, y, z]) => [-z, y, x];
/** Enveloppe un objet construit dans le repère moteur pour le poser dans le repère machine. */
export function inEngine(S, ...objs) {
  return S.at(S.group(...objs), [ENG.x, ENG.y, ENG.zSae], [0, -Math.PI / 2, 0]);
}

// Pompes en tandem sur la face SAE (vers −Z machine) : 90 cc, 60 cc, 32 cc.
export const PUMP = {
  p90: { z0: -0.3, z1: -0.55 },
  p60: { z0: -0.55, z1: -0.75 },
  p32: { z0: -0.75, z1: -0.87 },
};

// ---------------------------------------------------------------- radiateur P266
// Debout en travers à l'arrière du compartiment ; repère local de P266 :
// origine au milieu du bord inférieur de la face avant du faisceau (côté
// ventilateur), +X vers le moteur, Y vers le haut, Z selon la largeur.
export const RAD = {
  x: -2.57, y: 1.0, // position de l'origine de P266 (machine)
  w: 1.08, h: 0.885, // largeur hors montants, hauteur hors tout
  core: 0.12, // épaisseur faisceaux + boîtes (vers −X)
  shroud: 0.095, // profondeur du carénage (vers +X)
  fan: { y: 0.44, z: 0.16, r: 0.305 }, // ventilateur Ø 24 po
  cool: [-0.08, 0.5], // faisceau d'eau (z)
  cac: [-0.5, -0.12], // faisceau d'air de suralimentation (z)
  tankY: [0.04, 0.12, 0.765, 0.845], // boîte inférieure, boîte supérieure (y)
  // Piquages (repère P266) : eau entrée / sortie Ø 2 po, air Ø 3 po, vers +X.
  waterIn: [0.0, 0.805, 0.34], waterOut: [0.0, 0.08, 0.34],
  cacIn: [0.0, 0.08, -0.31], cacOut: [0.0, 0.805, -0.31],
};
export const radToM = ([x, y, z]) => [RAD.x + x, RAD.y + y, z];

// ---------------------------------------------------------------- refroidisseur P270
// Suspendu par sa charnière haute, faisceau dans un plan XY côté droit ;
// repère local de P270 : origine sur l'axe de la charnière à mi-longueur,
// X selon la longueur (X machine), Y vers le haut, +Z vers l'extérieur
// (ailettes vers la porte droite).
export const HC = { x: -2.07, y: 1.855, z: 0.94, L: 0.98, H: 0.6 };

// ---------------------------------------------------------------- filtre à air (P274 rep. 7)
// Couché selon Z côté gauche ; piquage d'entrée vertical sous l'entrée d'air
// du toit, sortie axiale côté +Z vers le turbocompresseur, couvercle vers −Z.
export const AIR = { x: -2.22, y: 1.62, z0: -0.4, z1: -0.82, r: 0.14, inZ: -0.5, inR: u(2.5) };

// ---------------------------------------------------------------- collecteur P260 et support
// Collecteur de translation posé sur le support P274 rep. 28 (dos contre la
// tôle verticale du support, face des cartouches vers −Z) ; repère local de
// P260 : origine au centre de la face de fixation (dos), +Z = face avant,
// Y vers le haut, X selon la longueur.
export const TMAN = { x: -2.3, y: 1.33, z: -0.585 };
export const STAND = { x0: -2.44, x1: -2.0, zPlate: -0.575 };

// ---------------------------------------------------------------- distributeur P262 et platine P246 rep. 40
// Distributeur PVG 32 debout sur la platine au-dessus des pompes, poignées
// vers la porte gauche (−Z), électrovannes vers le moteur, orifices vers
// l'avant (+X). Platine rep. 40 : tôle horizontale portée par la console
// rep. 30 vissée sur le carter de volant.
export const PLATE = { y: 1.465, t: 0.012, x0: -1.86, x1: -1.32, z0: -0.42, z1: -0.9 };
export const TVALVE = { x: -1.545, z: -0.62 }; // centre du distributeur (y = dessus de la platine)
export const BOOST = { x: -1.76, z: -0.74, w: 0.1, h: 0.15, d: 0.09 }; // bloc surpresseur rep. 21
export const HPF = { x: -1.915, z: [-0.5, -0.64], y: 1.69 }; // filtres HP (origine de P264 / P352)
export const INTENS = { x: -1.39, y: 1.355, z0: -0.47, z1: -0.88, r: 0.05 }; // multiplicateur rep. 16
export const RFILT = { x: -2.39, y: 1.72, z: 0.36 }; // filtre de retour (dessous de la tête)

// ---------------------------------------------------------------- silencieux P272
export const MUF = { x: -2.24, y: 0.75, z0: -0.3, z1: 0.3, r: 0.12 };

// ---------------------------------------------------------------- quincaillerie légère
// Vis H, écrous et rondelles (cotes en pouces) en peu de facettes : ces
// pièces sont nombreuses ; filets suggérés seulement sur le bout libre.
const AFT = { 0.25: 0.4375, 0.3125: 0.5, 0.375: 0.5625, 0.4375: 0.625, 0.5: 0.75, 0.625: 0.9375, 0.75: 1.125 };
const afOf = (d) => AFT[d] ?? d * 1.5;

function hexHead(S, a, h, y0, mat) {
  const R = a / 2 / Math.cos(Math.PI / 6), c = Math.min(a * 0.06, h * 0.25);
  const m = S.lathe([[0, y0], [R, y0], [R, y0 + h - c], [R - c * 1.7, y0 + h], [0, y0 + h]], mat, { seg: 6 });
  m.children[0].rotation.y = Math.PI / 6;
  return m;
}

/**
 * Vis H (HHCS) d × len (po) : dessous de tête à y = 0, tête vers +Y, tige
 * vers −Y ; collerette d'appui, chanfrein, deux gorges de filet au bout.
 * socket : vis CHC (tête cylindrique à six-pans creux).
 */
export function bolt(S, d, len, { mat = 'zinc', socket = false, flat = false } = {}) {
  const r = u(d / 2), L = u(len), a = u(afOf(d));
  const parts = [];
  if (flat) {
    // Tête fraisée à six-pans creux (FHCS) : dessus à y = 0.
    const R = u(d), hk = (R - r) / Math.tan(41 * Math.PI / 180);
    parts.push(S.lathe([[0, -L], [r * 0.85, -L], [r, -L + r * 0.2], [r, -hk], [R, 0], [r * 0.62, 0], [r * 0.62, -r * 0.6], [0, -r * 0.7]], mat, { seg: 12 }));
    return S.merged(parts, mat);
  }
  if (socket) {
    const R = u(d * 0.75), H = u(d), hx = r * 0.58;
    parts.push(S.lathe([[0, 0], [R - 0.0006, 0], [R, 0.0006], [R, H - 0.0008], [R - 0.0008, H], [hx, H], [hx, H * 0.45], [0, H * 0.45]], mat, { seg: 14 }));
  } else {
    const hh = u(d * 0.62);
    parts.push(hexHead(S, a, hh, u(0.02 * d), mat));
    parts.push(S.lathe([[0, 0], [a * 0.47, 0], [a * 0.47, u(0.02 * d) + 0.0002], [0, u(0.02 * d) + 0.0002]], mat, { seg: 12 }));
  }
  const g = Math.min(L * 0.3, r * 1.6);
  parts.push(S.lathe([[0, -L], [r * 0.82, -L], [r, -L + r * 0.18], [r, -L + g * 0.45], [r * 0.9, -L + g * 0.55], [r, -L + g * 0.65], [r * 0.9, -L + g * 0.85], [r, -L + g], [r, 0], [0, 0]], mat, { seg: 8 }));
  return S.merged(parts, mat);
}

/** Écrou H d (po), de y = 0 à h ; jam : contre-écrou ; nylon : bague blanche. */
export function nut(S, d, { mat = 'zinc', jam = false, nylon = false } = {}) {
  const a = u(afOf(d)), h = u(d * (jam ? 0.6 : 0.875));
  const g = S.group(hexHead(S, a, nylon ? h * 0.75 : h, 0, mat));
  if (nylon) {
    g.add(S.lathe([[u(d * 0.45), h * 0.75], [a * 0.46, h * 0.75], [a * 0.43, h], [u(d * 0.45), h]], mat, { seg: 12 }));
    g.add(S.lathe([[u(d * 0.44), h * 0.78], [a * 0.36, h * 0.78], [a * 0.36, h * 0.97], [u(d * 0.44), h * 0.97]], 'white', { seg: 12 }));
  }
  return g;
}

/** Rondelle d (po) : 'flat' (plate SAE), 'split' (Grower), 'nl' (paire Nord-Lock), de y = 0 à t. */
export function washer(S, d, kind = 'flat', { mat = 'zinc' } = {}) {
  if (kind === 'split') {
    const ro = u(d * 0.9), ri = u(d * 0.53), t = u(Math.max(0.06, d * 0.25));
    return S.slotted(ro, ri, 0, t, [{ a: 0, w: 0.12, y0: 0, y1: t }], mat, { seg: 16 });
  }
  if (kind === 'nl') {
    const ro = u(d * 0.92), ri = u(d * 0.53), t = u(Math.max(0.05, d * 0.11));
    return S.merged([
      S.lathe([[ri, 0], [ro, 0], [ro, t], [ri, t], [ri, 0]], mat, { seg: 16 }),
      S.lathe([[ri, t + 0.0003], [ro, t + 0.0003], [ro, 2 * t], [ri, 2 * t], [ri, t + 0.0003]], mat, { seg: 16 }),
    ], mat);
  }
  const ro = u(d <= 0.5 ? d * 1.05 : d * 0.98), t = u(Math.max(0.065, d * 0.13));
  const c = Math.min(t * 0.3, 0.0005);
  return S.lathe([[u(d * 0.53), 0], [ro, 0], [ro, t - c], [ro - c, t], [u(d * 0.53), t], [u(d * 0.53), 0]], mat, { seg: 16 });
}

/** Épaisseur (m) d'une rondelle d (po) selon son type. */
export const washerT = (d, kind = 'flat') => u(kind === 'split' ? Math.max(0.06, d * 0.25) : kind === 'nl' ? 2 * Math.max(0.05, d * 0.11) : Math.max(0.065, d * 0.13));

/** Objet construit le long de +Y local, amené sur la direction dir et posé en pos. */
export function pose(THREE, obj, pos, dir = [0, 1, 0], spin = 0) {
  const g = new THREE.Group();
  if (spin) obj.rotation.y += spin;
  g.add(obj);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir).normalize());
  g.position.set(...pos);
  return g;
}

/** Point p décalé de k fois la direction unitaire de dir. */
export function offset(p, dir, k) {
  const n = Math.hypot(...dir) || 1;
  return p.map((v, i) => v + (dir[i] / n) * k);
}

// ---------------------------------------------------------------- colliers
/**
 * Collier à tourillon (« T-bolt ») pour durite de Ø D (m) : bande inox,
 * pont, tourillon et vis à écrou nylstop, autour de l'axe Y (bande de
 * largeur w), vis tangente selon Z côté +X. Centré sur l'origine.
 */
export function tBoltClamp(S, D, { w = 0.019, mat = 'steel' } = {}) {
  const R = D / 2, t = 0.0012;
  const seg = Math.max(20, Math.min(40, Math.round(R * 300)));
  const band = S.ring(R + t, R, w, mat, { seg });
  const lug = [];
  for (const s of [-1, 1]) lug.push(S.box(0.006, w * 0.9, 0.004, mat, { pos: [R + 0.006, 0, s * 0.008] }));
  lug.push(S.box(0.004, w * 0.9, 0.024, mat, { pos: [R + 0.003, 0, 0] }));
  const trun = S.cyl(0.0045, w * 0.8, mat, { seg: 10, pos: [R + 0.0115, 0, -0.012] });
  const screw = S.cyl(0.0027, 0.05, mat, { axis: 'z', seg: 8, pos: [R + 0.0115, 0, 0.008] });
  const nt = S.at(S.nut(0.0095, 0.008, mat), [R + 0.0115, 0, 0.032], [Math.PI / 2, 0, 0]);
  return S.group(S.merged([band, ...lug, trun, screw, nt], mat));
}

/** Collier à vis sans fin (bande perforée suggérée, boîtier de vis) pour Ø D, axe Y. */
export function wormClamp(S, D, { w = 0.012, mat = 'steel' } = {}) {
  const R = D / 2;
  const seg = Math.max(16, Math.min(32, Math.round(R * 300)));
  return S.merged([
    S.ring(R + 0.001, R, w, mat, { seg }),
    S.box(0.007, w * 1.05, 0.016, mat, { r: 0.001, pos: [R + 0.0035, 0, 0] }),
    S.cyl(0.0028, 0.022, mat, { axis: 'z', seg: 8, pos: [R + 0.007, 0, 0] }),
    S.at(S.nut(0.007, 0.004, mat), [R + 0.007, 0, 0.012], [Math.PI / 2, 0, 0]),
  ], mat);
}

/** Collier en V (V-band) pour bride de Ø D : anneau à section en V, verrou à vis selon Z côté +X ; axe Y. */
export function vBandClamp(S, D, { mat = 'steel' } = {}) {
  const R = D / 2;
  const prof = [[R + 0.002, -0.009], [R + 0.008, -0.006], [R + 0.009, 0], [R + 0.008, 0.006], [R + 0.002, 0.009], [R + 0.004, 0.003], [R + 0.004, -0.003], [R + 0.002, -0.009]];
  return S.merged([
    S.lathe(prof, mat, { seg: 32 }),
    S.box(0.012, 0.014, 0.03, mat, { r: 0.002, pos: [R + 0.014, 0, 0] }),
    S.cyl(0.003, 0.05, mat, { axis: 'z', seg: 8, pos: [R + 0.016, 0, 0.004] }),
    S.at(S.nut(0.01, 0.006, mat), [R + 0.016, 0, 0.03], [Math.PI / 2, 0, 0]),
  ], mat);
}

/**
 * Bride en U (U-bolt) autour d'un tube de Ø D (axe Z), tige Ø d (m) : arc au-
 * dessus (+Y), branches vers −Y de longueur leg, écrous sous l'appui (y = −D/2 − base).
 */
export function uBolt(S, THREE, D, d, { leg = 0.05, base = 0.008, mat = 'zinc', band = false } = {}) {
  const R = D / 2 + d / 2, pts = [];
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * Math.PI;
    pts.push(new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0));
  }
  const parts = [S.tube(pts.map((v) => v.toArray()), d / 2, mat, { seg: 16, radial: 8 })];
  for (const s of [-1, 1]) {
    parts.push(S.cyl(d / 2, leg, mat, { seg: 8, pos: [s * R, -leg / 2, 0] }));
    parts.push(S.nut(d * 1.6, d * 0.85, mat, { pos: [s * R, -D / 2 - base - d * 0.45, 0] }));
  }
  if (band) parts.push(S.box(2 * R + d * 2.2, 0.003, d * 2.6, mat, { pos: [0, -D / 2 - base + 0.0015, 0] }));
  return S.merged(parts, mat);
}

/** Collier de flexible à coussin caoutchouc (P-clamp) pour Ø D, axe Z, patte de fixation vers −Y. */
export function pClamp(S, D, { mat = 'zinc' } = {}) {
  const R = D / 2;
  return S.group(
    S.merged([
      S.ring(R + 0.004, R + 0.0025, 0.012, mat, { axis: 'z', seg: 18 }),
      S.box(0.0015, R + 0.012, 0.012, mat, { pos: [-0.0012, -R - 0.006, 0] }),
      S.box(0.0015, R + 0.012, 0.012, mat, { pos: [0.0012, -R - 0.006, 0] }),
    ], mat),
    S.ring(R + 0.0025, R, 0.013, 'rubber', { axis: 'z', seg: 18 }),
  );
}

// ---------------------------------------------------------------- formes de tôlerie
/** Cornière d'aile a × b, épaisseur t, longueur L selon X, coin à l'origine, ailes vers +Y et +Z. */
export function angle(S, L, a, b, t, mat) {
  return S.merged([
    S.box(L, a, t, mat, { pos: [0, a / 2, t / 2] }),
    S.box(L, t, b, mat, { pos: [0, t / 2, b / 2] }),
  ], mat);
}

/** Tube rectangulaire w (Z) × h (Y), paroi t, longueur L selon X, centré ; extrémités fermées par des tôles. */
export function rectTube(S, L, w, h, t, mat) {
  return S.merged([
    S.box(L, t, w, mat, { pos: [0, h / 2 - t / 2, 0] }),
    S.box(L, t, w, mat, { pos: [0, -h / 2 + t / 2, 0] }),
    S.box(L, h - 2 * t, t, mat, { pos: [0, 0, w / 2 - t / 2] }),
    S.box(L, h - 2 * t, t, mat, { pos: [0, 0, -w / 2 + t / 2] }),
    S.box(t, h, w, mat, { pos: [-L / 2 + t / 2, 0, 0] }),
    S.box(t, h, w, mat, { pos: [L / 2 - t / 2, 0, 0] }),
  ], mat);
}

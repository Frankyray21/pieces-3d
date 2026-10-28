// Matériel et outils de la procédure PRO-DD-ST-003 (page 1), étalés au sol
// derrière la barricade pour la présentation du début de la vidéo : bois
// (6 × 6 brut, 3 × 8 brut, 2 × 4 planés ou bruts), coins de bois, tire-fonds
// de 6 po, outils (pied de biche, masse, marteau, sciotte, pinces à billots,
// niveau au laser Bosch, niveau de 48 po,
// pingouin (gratte minière de 32 po, sert de pelle), scie va-et-vient et
// lames à bois) et ÉPI de base. Silhouettes simples : ce
// sont des repères pour la formation, pas des modèles de pièces.
import { IN, FT, B66, P3, P8, S24, L, ground, WEDGE } from '../models/plancher-dd/plan.js';
import { lumber, between, lagScrews, wedge } from '../models/plancher-dd/lumber.js';

const X0 = L + 4.75; // première rangée, juste derrière la barricade (L + 4,3)
const g0 = (x, z) => ground(x, z);
// Bois en quantité estimée pour le plancher principal de 16 × 32 pi (liste des pièces du
// modèle) : au fond de l'aire, en travers de la galerie, les 6 × 6 et les 3 × 8 de 16 pi ;
// devant, les blocages courts, les 2 × 4, les coins ; et un bout de chaque bois, seul,
// pour en voir la grosseur.
const L16 = 16 * FT;
const BIG = {
  b66: { x0: L + 7.18, w: B66, h: B66, nx: 4, ny: 5, extra: 1 }, // 14 madriers, 1 jonction, 6 soutiens
  b38: { x0: L + 7.96, w: P8, h: P3, nx: 3, ny: 16, extra: 0 }, // 48 planches
};
const bigBase = (k) => {
  const p = BIG[k];
  let m = -Infinity;
  for (let i = 0; i <= 4; i++) for (const z of [-2.3, 0, 2.3]) m = Math.max(m, ground(p.x0 + (i / 4) * p.nx * p.w, z));
  return m + 0.05;
};
// Bouts seuls (échantillons), près de la barricade : 6 × 6, 3 × 8, 2 × 4.
const SAMPLE = { b66: { z: -2.2, w: B66, h: B66 }, b38: { z: -1.82, w: P8, h: P3 }, s24: { z: -1.5, w: S24.w, h: S24.t } };
const SX0 = X0 + 0.35, SLEN = 0.6;
// Barres d'écaillage le long de la paroi Z positive, selon X (au-delà du bout des piles de 16 pi).
const BARS_Z = 2.52;
/** Bout (côté barricade) de l'échantillon de bois k. */
export function woodEnd(k) {
  const p = SAMPLE[k];
  return { x: SX0, yb: ground(SX0, p.z), h: p.h, w: p.w, z: p.z };
}

// Points d'attache des étiquettes (repère de la galerie), par article.
export const MAT = {
  b66: { at: [L + 7.5, 0, -1.2], text: '6 × 6 brut' },
  b38: { at: [L + 8.27, 0, -0.6], text: '3 × 8 brut' },
  s24: { at: [X0 + 1.2, 0, -0.95], text: '2 × 4 planés (ou bruts)' },
  blocs: { at: [X0 + 1.6, 0, -1.95], text: 'Blocages 6 × 6 et 3 × 8' },
  coins: { at: [X0 + 0.15, 0, -0.45], text: 'Coins de bois' },
  tirefonds: { at: [X0 + 0.1, 0, 0.35], text: 'Tire-fonds de 6 po' },
  laser: { at: [X0 + 0.1, 0, 1.0], text: 'Niveau au laser Bosch' },
  biche: { at: [X0 + 1.0, 0, 0.0], text: 'Pied de biche' },
  niveau: { at: [X0 + 1.0, 0, 1.2], text: 'Niveau de 48 po' },
  sciotte: { at: [X0 + 1.0, 0, 2.1], text: 'Sciotte (scie à main)' },
  masse: { at: [X0 + 1.8, 0, 0.0], text: 'Masse' },
  marteau: { at: [X0 + 1.8, 0, 0.85], text: 'Marteau' },
  pinces: { at: [X0 + 1.8, 0, 1.5], text: 'Pinces à billots' },
  scie: { at: [X0 + 1.8, 0, 2.25], text: 'Scie va-et-vient et lames à bois' },
  pingouin: { at: [X0 + 2.25, 0, 0.55], text: 'Pingouin (gratte minière 32 po)' },
  barres: { at: [X0 + 1.5, 0, BARS_Z], text: 'Barres d’écaillage 6, 8 et 10 pi' },
  epi: { at: [X0 + 0.1, 0, 1.85], text: 'ÉPI : équipement de base' },
};
for (const m of Object.values(MAT)) m.at[1] = g0(m.at[0], m.at[2]) + 0.12;
MAT.b66.at[1] = bigBase('b66') + (BIG.b66.ny + 1) * B66;
MAT.b38.at[1] = bigBase('b38') + BIG.b38.ny * P3;

/** Pièce posée au sol (dessous à y), boîte de taille [sx, sy, sz]. */
function onGround(S, obj, x, z, dy = 0) {
  obj.position.set(x, g0(x, z) + dy, z);
  return obj;
}

export function materielGroup(S) {
  const g = S.group();
  // Piles de 16 pi en travers de la galerie, sur trois lambourdes.
  for (const k of ['b66', 'b38']) {
    const p = BIG[k], base = bigBase(k), depth = p.nx * (p.w + 0.004);
    for (const z of [-1.9, 0, 1.9]) g.add(lumber(S, [depth + 0.06, 0.05, 0.08], [p.x0 + depth / 2, base - 0.025, z], 'woodGrey'));
    for (let j = 0; j < p.ny; j++) for (let i = 0; i < p.nx; i++) {
      g.add(lumber(S, [p.w, p.h, L16], [p.x0 + p.w / 2 + i * (p.w + 0.004), base + p.h / 2 + j * p.h, 0], 'wood'));
    }
    for (let i = 0; i < p.extra; i++) g.add(lumber(S, [p.w, p.h, L16], [p.x0 + depth / 2, base + p.h / 2 + p.ny * p.h, 0], 'wood'));
  }
  // 2 × 4 (garde-corps, mains courantes) : 15 pièces de 7 pi, selon X, sur deux lambourdes.
  {
    const len = 7 * FT, xc = X0 + 0.25 + len / 2, zc = -0.95, nz = 5, ny = 3;
    const base = Math.max(g0(xc - len / 2, zc), g0(xc + len / 2, zc)) + 0.05;
    for (const x of [xc - len / 3, xc + len / 3]) g.add(lumber(S, [0.08, 0.05, nz * S24.w + 0.06], [x, base - 0.025, zc], 'woodGrey'));
    for (let j = 0; j < ny; j++) for (let i = 0; i < nz; i++) g.add(lumber(S, [len, S24.t, S24.w], [xc, base + S24.t / 2 + j * S24.t, zc + (i - (nz - 1) / 2) * (S24.w + 0.004)], 'woodPlaned'));
  }
  // Blocages courts empilés : 25 bouts de 6 × 6 de 18 po, 30 bouts de 3 × 8 de 24 po.
  const blocs = (xc, len, w, h, nz, ny, zc) => {
    const base = g0(xc, zc) + 0.01;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nz; i++) g.add(lumber(S, [len, h, w], [xc, base + h / 2 + j * h, zc + (i - (nz - 1) / 2) * (w + 0.006)], 'wood'));
  };
  blocs(X0 + 1.35, 18 * IN, B66, B66, 5, 5, -1.95);
  blocs(X0 + 2.0, 24 * IN, P8, P3, 3, 10, -1.95);
  // Échantillons : un bout de chaque bois, seul, pour la grosseur.
  for (const [k, p] of Object.entries(SAMPLE)) g.add(lumber(S, [SLEN, p.h, p.w], [SX0 + SLEN / 2, g0(SX0 + SLEN / 2, p.z) + p.h / 2, p.z], k === 's24' ? 'woodPlaned' : 'wood'));
  // Barres d'écaillage de 6, 8 et 10 pi (alu, pointe d'acier), couchées le long de la paroi.
  [6, 8, 10].forEach((ft, k) => {
    const len = ft * FT, z = BARS_Z + (k - 1) * 0.07, x0 = X0 + 0.05;
    const bar = S.group(S.cyl(0.017, len - 0.12, 'castAlu', { axis: 'x', pos: [(len - 0.12) / 2, 0.02, 0] }), S.cyl(0.017, 0.12, 'darkSteel', { axis: 'x', r2: 0.006, pos: [len - 0.06, 0.02, 0] }));
    g.add(onGround(S, bar, x0, z, Math.max(0, g0(x0 + len, z) - g0(x0, z))));
  });
  // Coins de bois en tas (environ 80).
  for (let k = 0; k < 80; k++) {
    const layer = Math.floor(k / 20), i = k % 20;
    const x = X0 - 0.05 + (i % 5) * 0.09 + (layer % 2) * 0.03, z = -0.62 + Math.floor(i / 5) * 0.1 + (layer % 2) * 0.02;
    g.add(wedge(S, { pos: [x, g0(x, z) + layer * WEDGE.t * 0.55, z], along: (i + layer) % 2 ? 'z' : 'x', pair: false, thick: WEDGE.t }));
  }
  // Seau de tire-fonds.
  const tf = MAT.tirefonds.at;
  const bucket = S.group(S.cyl(0.13, 0.26, 'grey', { pos: [0, 0.13, 0], open: true, r2: 0.15 }), S.cyl(0.12, 0.01, 'darkSteel', { pos: [0, 0.2, 0] }));
  g.add(onGround(S, bucket, tf[0], tf[2]));
  const yb = g0(tf[0], tf[2]);
  g.add(lagScrews(S, [[tf[0] - 0.03, yb + 0.32, tf[2] - 0.03], [tf[0] + 0.04, yb + 0.33, tf[2] + 0.04], [tf[0] + 0.01, yb + 0.31, tf[2] + 0.06]]));
  // Niveau au laser Bosch sur son trépied.
  const laser = S.group(
    S.box(0.11, 0.13, 0.1, 'blue', { r: 0.01, pos: [0, 0.6, 0] }),
    S.box(0.112, 0.05, 0.06, 'fluoRed', { pos: [0, 0.63, 0] }),
  );
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3;
    laser.add(S.rod([0, 0.54, 0], [0.22 * Math.cos(a), 0, 0.22 * Math.sin(a)], 0.009, 'black'));
  }
  g.add(onGround(S, laser, MAT.laser.at[0], MAT.laser.at[2]));
  // Pied de biche (arrache-clous), selon Z.
  const biche = S.group(S.box(0.025, 0.025, 0.82, 'red', { pos: [0, 0.0125, 0] }), S.box(0.025, 0.07, 0.025, 'red', { pos: [0, 0.035, -0.41] }));
  g.add(onGround(S, biche, MAT.biche.at[0], MAT.biche.at[2]));
  // Niveau de 48 po (couché, selon Z).
  g.add(onGround(S, S.group(S.box(0.045, 0.07, 48 * IN, 'blue', { pos: [0, 0.035, 0] }), S.box(0.047, 0.02, 0.07, 'lampAmber', { pos: [0, 0.06, 0] })), MAT.niveau.at[0], MAT.niveau.at[2]));
  // Sciotte : arc de métal et lame.
  const arc = [];
  for (let i = 0; i <= 12; i++) { const a = Math.PI * (i / 12); arc.push([0.2 * Math.sin(a), 0.012, -0.38 * Math.cos(a)]); }
  const sciotte = S.group(S.tube(arc, 0.011, 'orange'), S.box(0.03, 0.003, 0.76, 'steel', { pos: [0.01, 0.012, 0] }));
  g.add(onGround(S, sciotte, MAT.sciotte.at[0] - 0.1, MAT.sciotte.at[2]));
  // Masse : manche et tête.
  const masse = S.group(S.cyl(0.018, 0.85, 'woodLight', { axis: 'z', pos: [0, 0.04, 0] }), S.box(0.2, 0.09, 0.09, 'darkSteel', { pos: [0, 0.045, -0.42] }));
  g.add(onGround(S, masse, MAT.masse.at[0], MAT.masse.at[2]));
  // Marteau.
  const marteau = S.group(S.cyl(0.014, 0.33, 'woodLight', { axis: 'z', pos: [0, 0.02, 0] }), S.box(0.12, 0.035, 0.035, 'darkSteel', { pos: [0, 0.02, -0.17] }));
  g.add(onGround(S, marteau, MAT.marteau.at[0], MAT.marteau.at[2]));
  // Pinces à billots : deux bras croisés sur un pivot, poignée en T, crochets vers l'intérieur.
  const arm = (k) => S.tube([[k * 0.15, 0.02, -0.25], [k * 0.05, 0.02, -0.08], [0, 0.02, 0], [-k * 0.13, 0.02, 0.17], [-k * 0.14, 0.02, 0.3], [-k * 0.04, 0.02, 0.37]], 0.011, 'darkSteel');
  const pinces = S.group(arm(1), arm(-1), S.cyl(0.018, 0.4, 'black', { axis: 'x', pos: [0, 0.02, -0.26] }), S.cyl(0.02, 0.03, 'darkSteel', { pos: [0, 0.02, 0] }));
  g.add(onGround(S, pinces, MAT.pinces.at[0], MAT.pinces.at[2]));
  // Scie va-et-vient (scie alternative à fil) et lames à bois de rechange : modèle
  // générique, sans marque. Construite selon X (lame vers -X), puis tournée selon Z.
  const lame = (len, h) => {
    const pts = [[0, h], [len, h], [len, 0.004]];
    const n = Math.floor(len / 0.008);
    for (let i = n; i > 0; i--) pts.push([i * 0.008 - 0.004, 0], [(i - 1) * 0.008 + 0.002, 0.004]);
    pts.push([0, 0.004]);
    return pts;
  };
  const scie = S.group(
    // Moteur (gris) et poignée avant (caoutchouc noir), posés sur la poignée et le pied.
    S.box(0.24, 0.088, 0.078, 'grey', { r: 0.025, pos: [0.14, 0.074, 0] }),
    S.box(0.12, 0.012, 0.08, 'orange', { r: 0.004, pos: [0.09, 0.105, 0] }),
    S.box(0.15, 0.074, 0.07, 'rubber', { r: 0.028, pos: [-0.06, 0.07, 0] }),
    S.box(0.035, 0.05, 0.055, 'blackCast', { r: 0.01, pos: [-0.15, 0.068, 0] }),
    // Pied d'appui (acier) et porte-lame.
    S.box(0.006, 0.075, 0.05, 'darkSteel', { r: 0.003, pos: [-0.172, 0.06, 0] }),
    S.box(0.03, 0.012, 0.012, 'steel', { pos: [-0.18, 0.074, 0] }),
    // Grilles d'aération du moteur.
    ...[0, 1, 2, 3].map((i) => S.box(0.006, 0.05, 0.08, 'blackCast', { pos: [0.2 + i * 0.014, 0.078, 0] })),
    // Poignée arrière fermée en D : barre du haut dans le prolongement du moteur,
    // poignée inclinée gainée de caoutchouc, barre du bas qui rejoint le moteur ;
    // gâchette sous la barre du haut, bouton de blocage sur le côté.
    S.box(0.13, 0.036, 0.05, 'grey', { r: 0.012, pos: [0.315, 0.104, 0] }),
    S.box(0.038, 0.115, 0.048, 'grey', { r: 0.014, pos: [0.371, 0.062, 0], rot: [0, 0, 0.34] }),
    S.box(0.042, 0.085, 0.052, 'rubber', { r: 0.016, pos: [0.374, 0.055, 0], rot: [0, 0, 0.34] }),
    S.box(0.16, 0.028, 0.046, 'grey', { r: 0.01, pos: [0.31, 0.018, 0] }),
    S.box(0.016, 0.03, 0.022, 'orange', { r: 0.004, pos: [0.3, 0.075, 0] }),
    S.cyl(0.006, 0.054, 'blackCast', { axis: 'z', pos: [0.335, 0.104, 0] }),
  );
  const blade = S.extrude(lame(0.2, 0.025), 0.0015, 'steel');
  blade.position.set(-0.39, 0.06, 0);
  scie.add(blade);
  // Fil d'alimentation, au sol.
  scie.add(S.tube([[0.39, 0.01, 0], [0.43, 0.008, 0.02], [0.5, 0.008, 0.09], [0.52, 0.008, 0.2]], 0.006, 'hose', { ends: 'none' }));
  // Deux lames à bois de rechange, à plat à côté de la scie.
  [0.12, 0.17].forEach((z, k) => {
    const sp = S.extrude(lame(0.2, 0.02), 0.0015, 'steel');
    sp.rotation.x = -Math.PI / 2;
    sp.position.set(-0.12 + k * 0.03, 0.002 + k * 0.0016, z);
    scie.add(sp);
  });
  scie.rotation.y = -Math.PI / 2;
  g.add(onGround(S, scie, MAT.scie.at[0], MAT.scie.at[2]));
  // Pingouin : gratte minière de 32 po (manche de bois, lame d'acier jaune
  // recourbée, embout jaune), couchée selon Z, lame vers le fond de l'aire.
  {
    const len = 32 * IN;
    const p = S.group(
      S.cyl(0.019, len, 'woodLight', { axis: 'z', pos: [0, 0.022, 0] }),
      S.box(0.045, 0.04, 0.12, 'yellow', { r: 0.008, pos: [0, 0.022, len / 2 - 0.05] }),
      S.box(0.07, 0.07, 0.09, 'yellow', { r: 0.008, pos: [0, 0.035, -len / 2 + 0.03] }),
      S.tube([[0, 0.03, -len / 2 + 0.02], [-0.12, 0.03, -len / 2 + 0.06], [-0.26, 0.03, -len / 2 + 0.14], [-0.36, 0.03, -len / 2 + 0.26]], 0.012, 'yellow'),
      S.extrude([[0, 0], [-0.12, 0.035], [-0.26, 0.07], [-0.37, 0.15], [-0.25, 0.04], [-0.1, -0.01]], 0.012, 'yellow'),
    );
    p.children[4].rotation.x = Math.PI / 2;
    p.children[4].position.set(0, 0.035, -len / 2 + 0.04);
    g.add(onGround(S, p, MAT.pingouin.at[0], MAT.pingouin.at[2]));
  }
  // ÉPI de base : casque avec lampe, lunettes et gants.
  const casque = S.group(
    S.lathe([[0, -0.008], [0.16, -0.008], [0.16, 0.0], [0.135, 0.02], [0.13, 0.07], [0.11, 0.13], [0.07, 0.165], [0, 0.17]], 'yellow', { pos: [0, 0.01, 0] }),
    S.cyl(0.03, 0.04, 'black', { axis: 'x', pos: [0.13, 0.1, 0] }),
    S.cyl(0.026, 0.005, 'lamp', { axis: 'x', pos: [0.152, 0.1, 0] }),
  );
  g.add(onGround(S, casque, X0 + 0.05, 1.75));
  const lunettes = S.group(S.box(0.025, 0.04, 0.15, 'glass', { pos: [0, 0.02, 0] }), S.box(0.12, 0.008, 0.005, 'black', { pos: [-0.06, 0.02, 0.075] }), S.box(0.12, 0.008, 0.005, 'black', { pos: [-0.06, 0.02, -0.075] }));
  g.add(onGround(S, lunettes, X0 + 0.1, 2.15));
  for (const z of [1.5, 1.38]) g.add(onGround(S, S.box(0.2, 0.025, 0.1, 'orange', { r: 0.01, pos: [0, 0.0125, 0] }), X0 + 0.3, z));
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

// ------------------------------------------------------------------ outils de près
// Après la narration du matériel, la caméra s'approche des outils, par groupes,
// dans l'ordre de la liste de la procédure (p. 1) : un court arrêt sur chaque groupe.
// c : point visé, d : recul de la caméra ; keys : étiquettes affichées.
const G = (x, z, dy = 0.05) => [x, g0(x, z) + dy, z];
// Bois de près (bout de la pièce, pour voir la grosseur), puis vue des piles avec les
// quantités du plancher de 16 × 32 pi.
const WOOD = (k, dims) => {
  const e = woodEnd(k);
  const c = [e.x, e.yb + e.h / 2, e.z];
  return { wood: k, dims, e, c, pos: [e.x - 0.42, e.yb + e.h / 2 + 0.3, e.z + 0.5] };
};
export const TOUR = [
  WOOD('b66', ['6 po', '6 po']),
  WOOD('b38', ['8 po', '3 po']),
  WOOD('s24', ['3 ½ po', '1 ½ po']),
  { qty: ['b66', 'b38', 'blocs'], c: [L + 7.4, 0.1, -0.6], pos: [L + 4.85, 2.0, 1.6], hold: 4.2 },
  { keys: ['biche', 'masse', 'marteau'], c: G(X0 + 1.4, 0.4), pos: [X0 + 0.45, ground(X0 + 1.4, 0.4) + 1.35, 1.25] },
  { keys: ['sciotte', 'pinces'], c: G(X0 + 1.4, 1.8), d: 1.15 },
  { keys: ['laser', 'niveau'], c: G(X0 + 0.6, 1.1, 0.2), d: 1.75 },
  { keys: ['pingouin'], c: G(X0 + 2.0, 0.55), pos: [X0 + 1.25, ground(X0 + 2.0, 0.55) + 0.95, 1.3] },
  { keys: ['barres'], c: G(X0 + 1.55, BARS_Z), pos: [X0 + 0.9, ground(X0 + 1.55, BARS_Z) + 1.45, 0.95] },
  { keys: ['scie'], c: G(X0 + 1.8, 2.25), d: 0.7 },
  { keys: ['epi'], c: G(X0 + 0.2, 1.75, 0.08), d: 1.0 },
];
export const TOUR_STEP = { go: 0.8, hold: 1.7 }; // approche, arrêt (s)

/** Images clés (en temps v de l'enregistrement) des arrêts sur les outils, à partir de v0. */
export function tourCams(v0) {
  const cams = [];
  let v = v0;
  for (const s of TOUR) {
    const pos = s.pos || [s.c[0] + 0.78 * s.d, s.c[1] + 0.72 * s.d, s.c[2] + 0.3 * s.d];
    const hold = s.hold || TOUR_STEP.hold;
    cams.push({ v: v + TOUR_STEP.go, pos, tgt: s.c });
    cams.push({ v: v + TOUR_STEP.go + hold, pos, tgt: s.c });
    s.v = v; // début de l'approche (pour les étiquettes)
    s.end = v + TOUR_STEP.go + hold;
    v = s.end;
  }
  return cams;
}
export function tourEnd(v0) { return v0 + TOUR.reduce((n, s) => n + TOUR_STEP.go + (s.hold || TOUR_STEP.hold), 0); }


// Matériel et outils de la procédure PRO-DD-ST-003 (page 1), étalés au sol
// derrière la barricade pour la présentation du début de la vidéo : bois
// (6 × 6 brut, 3 × 8 brut, 2 × 4 planés ou bruts), coins de bois, tire-fonds
// de 6 po, outils (pied de biche, masse, marteau, sciotte, pinces à billots,
// niveau au laser Bosch, niveau de 48 po, barres d'écaillage de 6, 8 et 10 pi,
// pingouin (gratte minière de 32 po, sert de pelle), scie va-et-vient et
// lames à bois) et ÉPI de base. Silhouettes simples : ce
// sont des repères pour la formation, pas des modèles de pièces.
import { IN, FT, B66, P3, P8, S24, L, ground, WEDGE } from '../models/plancher-dd/plan.js';
import { lumber, between, lagScrews, wedge } from '../models/plancher-dd/lumber.js';

const X0 = L + 4.75; // première rangée, juste derrière la barricade (L + 4,3)
const g0 = (x, z) => ground(x, z);
const LEN = 10 * FT; // longueurs de présentation (le chantier utilise aussi du 16 pi)
// Piles de bois le long de la galerie, contre la paroi Z négative.
const PILES = { b66: -2.2, b38: -1.6, s24: -1.05 };
// Barres d'écaillage en travers de la galerie, au fond de l'aire.
const BARS_X = X0 + 2.75;

// Points d'attache des étiquettes (repère de la galerie), par article.
export const MAT = {
  b66: { at: [X0 + 1.0, 0, PILES.b66], text: '6 × 6 brut' },
  b38: { at: [X0 + 1.6, 0, PILES.b38], text: '3 × 8 brut' },
  s24: { at: [X0 + 2.2, 0, PILES.s24], text: '2 × 4 planés (ou bruts)' },
  coins: { at: [X0 + 0.1, 0, -0.3], text: 'Coins de bois' },
  tirefonds: { at: [X0 + 0.1, 0, 0.35], text: 'Tire-fonds de 6 po' },
  laser: { at: [X0 + 0.1, 0, 1.0], text: 'Niveau au laser Bosch' },
  biche: { at: [X0 + 1.0, 0, 0.0], text: 'Pied de biche' },
  niveau: { at: [X0 + 1.0, 0, 1.2], text: 'Niveau de 48 po' },
  sciotte: { at: [X0 + 1.0, 0, 2.1], text: 'Sciotte' },
  masse: { at: [X0 + 1.8, 0, 0.0], text: 'Masse' },
  marteau: { at: [X0 + 1.8, 0, 0.85], text: 'Marteau' },
  pinces: { at: [X0 + 1.8, 0, 1.5], text: 'Pinces à billots' },
  scie: { at: [X0 + 1.8, 0, 2.25], text: 'Scie va-et-vient et lames à bois' },
  barres: { at: [BARS_X, 0, 0.3], text: 'Barres d’écaillage 6, 8 et 10 pi' },
  pingouin: { at: [X0 + 2.25, 0, 0.55], text: 'Pingouin (gratte minière 32 po)' },
  epi: { at: [X0 + 0.1, 0, 1.85], text: 'ÉPI : équipement de base' },
};
for (const m of Object.values(MAT)) m.at[1] = g0(m.at[0], m.at[2]) + 0.12;

/** Pièce posée au sol (dessous à y), boîte de taille [sx, sy, sz]. */
function onGround(S, obj, x, z, dy = 0) {
  obj.position.set(x, g0(x, z) + dy, z);
  return obj;
}

export function materielGroup(S) {
  const g = S.group();
  // Piles de bois sur deux lambourdes : 6 × 6, 3 × 8, 2 × 4 (selon X).
  const x0 = X0 + 0.3, xc = x0 + LEN / 2;
  const pile = (zc, w, h, nz, ny, material) => {
    const base = g0(xc, zc) + 0.05;
    for (const x of [xc - LEN / 3, xc + LEN / 3]) g.add(lumber(S, [0.08, 0.05, nz * w + 0.06], [x, base - 0.025, zc], 'woodGrey'));
    for (let j = 0; j < ny; j++) for (let i = 0; i < nz; i++) {
      g.add(lumber(S, [LEN, h, w], [xc, base + h / 2 + j * h, zc + (i - (nz - 1) / 2) * (w + 0.004)], material));
    }
  };
  pile(PILES.b66, B66, B66, 3, 2, 'wood');
  pile(PILES.b38, P8, P3, 2, 3, 'wood');
  pile(PILES.s24, S24.w, S24.t, 4, 2, 'woodPlaned');
  // Coins de bois en tas.
  for (let k = 0; k < 5; k++) {
    const x = X0 + (k % 3) * 0.1, z = -0.4 + Math.floor(k / 3) * 0.16;
    g.add(wedge(S, { pos: [x, g0(x, z) + (k > 2 ? WEDGE.t * 0.5 : 0), z], along: k % 2 ? 'z' : 'x', pair: false, thick: WEDGE.t }));
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
  // Scie va-et-vient et lames à bois de rechange.
  const scie = S.group(
    S.box(0.09, 0.1, 0.42, 'blue', { r: 0.02, pos: [0, 0.05, 0] }),
    S.box(0.002, 0.03, 0.2, 'steel', { pos: [0, 0.05, -0.3] }),
    S.box(0.07, 0.003, 0.22, 'steel', { pos: [0.14, 0.0015, -0.05] }),
    S.box(0.07, 0.003, 0.22, 'steel', { pos: [0.14, 0.0045, 0.05] }),
  );
  g.add(onGround(S, scie, MAT.scie.at[0], MAT.scie.at[2]));
  // Barres d'écaillage de 6, 8 et 10 pi (alu, pointe d'acier), en travers (selon Z).
  [6, 8, 10].forEach((ft, k) => {
    const len = ft * FT;
    const x = BARS_X + (k - 1) * 0.13;
    const z0 = -0.75;
    const bar = S.group(S.cyl(0.017, len - 0.12, 'castAlu', { axis: 'z', pos: [0, 0.02, (len - 0.12) / 2] }), S.cyl(0.017, 0.12, 'darkSteel', { axis: 'z', r2: 0.006, pos: [0, 0.02, len - 0.06] }));
    g.add(onGround(S, bar, x, z0));
  });
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

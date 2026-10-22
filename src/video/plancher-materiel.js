// Matériel et outils de la procédure PRO-DD-ST-003 (page 1), étalés au sol
// derrière la barricade pour la présentation du début de la vidéo : bois
// (6 × 6 brut, 3 × 8 brut, 2 × 4 planés ou bruts), coins de bois, tire-fonds
// de 6 po, outils (pied de biche, masse, marteau, sciotte, pinces à billots,
// niveau au laser Bosch, niveau de 48 po, barres d'écaillage de 6, 8 et 10 pi,
// scie va-et-vient et lames à bois) et ÉPI de base. Silhouettes simples : ce
// sont des repères pour la formation, pas des modèles de pièces.
import { IN, FT, B66, P3, P8, S24, L, ground, WEDGE } from '../models/plancher-dd/plan.js';
import { lumber, between, lagScrews, wedge } from '../models/plancher-dd/lumber.js';

const X0 = L + 4.75; // première rangée, juste derrière la barricade (L + 4,3)
const g0 = (x, z) => ground(x, z);

// Points d'attache des étiquettes (repère de la galerie), par article.
export const MAT = {
  b66: { at: [X0 + 0.25, 0, -2.5], text: '6 × 6 brut' },
  b38: { at: [X0 + 0.95, 0, -2.5], text: '3 × 8 brut' },
  s24: { at: [X0 + 1.55, 0, -2.5], text: '2 × 4 planés (ou bruts)' },
  coins: { at: [X0, 0, -0.5], text: 'Coins de bois' },
  tirefonds: { at: [X0, 0, 0.15], text: 'Tire-fonds de 6 po' },
  laser: { at: [X0, 0, 0.85], text: 'Niveau au laser Bosch' },
  niveau: { at: [X0 + 0.7, 0, 0.9], text: 'Niveau de 48 po' },
  biche: { at: [X0 + 0.7, 0, -0.35], text: 'Pied de biche' },
  masse: { at: [X0 + 1.35, 0, -0.35], text: 'Masse' },
  marteau: { at: [X0 + 1.35, 0, 0.5], text: 'Marteau' },
  sciotte: { at: [X0 + 0.75, 0, 2.2], text: 'Sciotte' },
  pinces: { at: [X0 + 1.35, 0, 1.2], text: 'Pinces à billots' },
  scie: { at: [X0 + 1.35, 0, 2.15], text: 'Scie va-et-vient et lames à bois' },
  barres: { at: [X0 + 1.0, 0, 3.0], text: 'Barres d’écaillage 6, 8 et 10 pi' },
  epi: { at: [X0, 0, 1.95], text: 'ÉPI : équipement de base' },
};
for (const m of Object.values(MAT)) m.at[1] = g0(m.at[0], m.at[2]) + 0.12;

/** Pièce posée au sol (dessous à y), boîte de taille [sx, sy, sz]. */
function onGround(S, obj, x, z, dy = 0) {
  obj.position.set(x, g0(x, z) + dy, z);
  return obj;
}

export function materielGroup(S) {
  const g = S.group();
  const LEN = 10 * FT; // longueurs de présentation (le chantier utilise aussi du 16 pi)
  const zc = -2.6;
  // Piles de bois sur deux lambourdes : 6 × 6, 3 × 8, 2 × 4.
  const pile = (x, w, h, nx, ny, material) => {
    const base = g0(x, zc) + 0.05;
    for (const z of [zc - LEN / 3, zc + LEN / 3]) g.add(lumber(S, [nx * w + 0.06, 0.05, 0.08], [x, base - 0.025, z], 'woodGrey'));
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      g.add(lumber(S, [w, h, LEN], [x + (i - (nx - 1) / 2) * (w + 0.004), base + h / 2 + j * h, zc], material));
    }
  };
  pile(X0 + 0.25, B66, B66, 3, 2, 'wood');
  pile(X0 + 0.95, P8, P3, 2, 3, 'wood');
  pile(X0 + 1.55, S24.w, S24.t, 4, 2, 'woodPlaned');
  // Coins de bois en tas.
  for (let k = 0; k < 5; k++) {
    const x = X0 - 0.12 + (k % 3) * 0.1, z = -0.5 + Math.floor(k / 3) * 0.16;
    const w = wedge(S, { pos: [x, g0(x, z) + (k > 2 ? WEDGE.t * 0.5 : 0), z], along: k % 2 ? 'z' : 'x', pair: false, thick: WEDGE.t });
    g.add(w);
  }
  // Seau de tire-fonds.
  const bucket = S.group(S.cyl(0.13, 0.26, 'grey', { pos: [0, 0.13, 0], open: true, r2: 0.15 }), S.cyl(0.12, 0.01, 'darkSteel', { pos: [0, 0.2, 0] }));
  g.add(onGround(S, bucket, X0, 0.15));
  g.add(lagScrews(S, [[X0 - 0.03, g0(X0, 0.15) + 0.32, 0.12], [X0 + 0.04, g0(X0, 0.15) + 0.33, 0.19], [X0 + 0.01, g0(X0, 0.15) + 0.31, 0.21]]));
  // Niveau au laser Bosch sur son trépied.
  const laser = S.group(
    S.box(0.11, 0.13, 0.1, 'blue', { r: 0.01, pos: [0, 0.6, 0] }),
    S.box(0.112, 0.05, 0.06, 'fluoRed', { pos: [0, 0.63, 0] }),
  );
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3;
    laser.add(S.rod([0, 0.54, 0], [0.22 * Math.cos(a), 0, 0.22 * Math.sin(a)], 0.009, 'black'));
  }
  g.add(onGround(S, laser, X0, 0.85));
  // Niveau de 48 po (couché, selon Z).
  g.add(onGround(S, S.group(S.box(0.045, 0.07, 48 * IN, 'blue', { pos: [0, 0.035, 0] }), S.box(0.047, 0.02, 0.07, 'lampAmber', { pos: [0, 0.06, 0] })), X0 + 0.7, 0.9));
  // Pied de biche (arrache-clous).
  const biche = S.group(S.box(0.025, 0.025, 0.82, 'red', { pos: [0, 0.0125, 0] }), S.box(0.025, 0.07, 0.025, 'red', { pos: [0, 0.035, -0.41] }));
  g.add(onGround(S, biche, X0 + 0.7, -0.35));
  // Masse : manche et tête.
  const masse = S.group(S.cyl(0.018, 0.85, 'woodLight', { axis: 'z', pos: [0, 0.04, 0] }), S.box(0.09, 0.09, 0.2, 'darkSteel', { pos: [0, 0.045, -0.42] }));
  masse.children[1].rotation.y = Math.PI / 2;
  g.add(onGround(S, masse, X0 + 1.35, -0.35));
  // Marteau.
  const marteau = S.group(S.cyl(0.014, 0.33, 'woodLight', { axis: 'z', pos: [0, 0.02, 0] }), S.box(0.12, 0.035, 0.035, 'darkSteel', { pos: [0, 0.02, -0.17] }));
  g.add(onGround(S, marteau, X0 + 1.35, 0.5));
  // Sciotte : arc de métal et lame.
  const arc = [];
  for (let i = 0; i <= 12; i++) { const a = Math.PI * (i / 12); arc.push([0.2 * Math.sin(a), 0.012, -0.38 * Math.cos(a)]); }
  const sciotte = S.group(S.tube(arc, 0.011, 'orange'), S.box(0.03, 0.003, 0.76, 'steel', { pos: [0.01, 0.012, 0] }));
  g.add(onGround(S, sciotte, X0 + 0.65, 2.2));
  // Pinces à billots : deux bras croisés sur un pivot, poignée en T, crochets vers l'intérieur.
  const arm = (k) => S.tube([[k * 0.15, 0.02, -0.25], [k * 0.05, 0.02, -0.08], [0, 0.02, 0], [-k * 0.13, 0.02, 0.17], [-k * 0.14, 0.02, 0.3], [-k * 0.04, 0.02, 0.37]], 0.011, 'darkSteel');
  const pinces = S.group(arm(1), arm(-1), S.cyl(0.018, 0.4, 'black', { axis: 'x', pos: [0, 0.02, -0.26] }), S.cyl(0.02, 0.03, 'darkSteel', { pos: [0, 0.02, 0] }));
  g.add(onGround(S, pinces, X0 + 1.35, 1.2));
  // Scie va-et-vient et lames à bois de rechange.
  const scie = S.group(
    S.box(0.09, 0.1, 0.42, 'blue', { r: 0.02, pos: [0, 0.05, 0] }),
    S.box(0.002, 0.03, 0.2, 'steel', { pos: [0, 0.05, -0.3] }),
    S.box(0.07, 0.003, 0.22, 'steel', { pos: [0.14, 0.0015, -0.05] }),
    S.box(0.07, 0.003, 0.22, 'steel', { pos: [0.14, 0.0045, 0.05] }),
  );
  g.add(onGround(S, scie, X0 + 1.35, 2.15));
  // Barres d'écaillage de 6, 8 et 10 pi (alu, pointe d'acier), selon X.
  [6, 8, 10].forEach((ft, k) => {
    const len = ft * FT;
    const z = 2.85 + k * 0.13;
    const x0 = X0 - 0.55;
    const bar = S.group(S.cyl(0.017, len - 0.12, 'castAlu', { axis: 'x', pos: [(len - 0.12) / 2, 0.02, 0] }), S.cyl(0.017, 0.12, 'darkSteel', { axis: 'x', r2: 0.006, pos: [len - 0.06, 0.02, 0] }));
    g.add(onGround(S, bar, x0, z));
  });
  // ÉPI de base : casque avec lampe, lunettes et gants.
  const casque = S.group(
    S.lathe([[0, -0.008], [0.16, -0.008], [0.16, 0.0], [0.135, 0.02], [0.13, 0.07], [0.11, 0.13], [0.07, 0.165], [0, 0.17]], 'yellow', { pos: [0, 0.01, 0] }),
    S.cyl(0.03, 0.04, 'black', { axis: 'x', pos: [0.13, 0.1, 0] }),
    S.cyl(0.026, 0.005, 'lamp', { axis: 'x', pos: [0.152, 0.1, 0] }),
  );
  g.add(onGround(S, casque, X0 - 0.05, 1.8));
  const lunettes = S.group(S.box(0.025, 0.04, 0.15, 'glass', { pos: [0, 0.02, 0] }), S.box(0.12, 0.008, 0.005, 'black', { pos: [-0.06, 0.02, 0.075] }), S.box(0.12, 0.008, 0.005, 'black', { pos: [-0.06, 0.02, -0.075] }));
  g.add(onGround(S, lunettes, X0 + 0.0, 2.15));
  for (const z of [1.62, 1.74]) g.add(onGround(S, S.box(0.2, 0.025, 0.1, 'orange', { r: 0.01, pos: [0, 0.0125, 0] }), X0 + 0.25, z));
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

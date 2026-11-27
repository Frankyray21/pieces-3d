// Rack de transport du bois 156072000 (Machines Roger International) :
// assemblage soudé, d'après le plan du 2026-08-06 (2 pages, échelle 1:12,
// coupe A-A à 1:8). Page 1 : vues de dessus, de face et coupe A-A, liste de
// 7 lignes (dont les 15 pièces de bois de la charge) ; page 2 : vue
// isométrique et liste détaillée (plaques, tubes, crochets, tendeurs).
//
// Le plan dessine le rack À L'ENVERS (poteaux vers le bas, charge sous le
// plateau). Le modèle est posé à l'endroit : pochettes de fourche au sol,
// poteaux vers le haut, bois couché entre les deux parois en croix.
//
// Cotes du plan reprises telles quelles : 56 1/2 po hors tout en largeur
// (poteaux de 3/4 à 55 3/4 po), 54 1/2 po de long avec les oreilles (51 1/2 po
// de cadre), 24 po de poteau au-dessus du plateau, angles de 70° des
// croisillons, croisillons arrêtés à 4 po du bout des poteaux. Ce que le plan
// ne cote pas est relevé à l'échelle sur ses vues (pochettes de 7 3/4 × 3 3/4
// po, tubes de 2 et 4 po, plaque perforée de 34 × 32 1/2 po, diamètre des
// pièces de bois).
// Repère : X largeur (centre du rack), Y vers le haut (0 au sol), Z le long
// du bois (centre du rack). Mètres.

const IN = 0.0254;

// ------------------------------------------------------------------ cotes (po)
export const RACK = {
  large: 56.5, // hors tout, poteaux compris (plan)
  long: 51.5, // cadre (plan) ; 54 1/2 po avec les oreilles de levage
  longOreilles: 54.5,
  poteau: { cote: 2, x0: 0.75, au: 24 }, // tube carré, face extérieure à 3/4 po, 24 po au-dessus du plateau (plan)
  pochette: { l: 7.75, h: 3.75, ep: 0.25, x0: 2.8 }, // tube rectangulaire (relevé) ; bord intérieur du poteau à 2 13/16 po (plan)
  traverse: { l: 7.5, h: 3.75 }, // tube de travers (relevé)
  rail: { cote: 4 }, // tubes carrés du plateau (relevés sur la coupe A-A)
  plaque: { l: 34, p: 32.5, ep: 0.25 }, // plaque perforée (relevée)
  croisillon: { cote: 2, angle: 70, arret: 4 }, // tubes de la paroi : 70° et 4 po (plan)
};
// Dessus du plateau (où pose la charge) : pochette + tube du plateau.
export const PLATEAU = (RACK.pochette.h + RACK.rail.cote) * IN;
// Largeur libre entre les parois (entre les croisillons).
export const LIBRE = (RACK.large - 2 * (RACK.poteau.x0 + RACK.poteau.cote + RACK.croisillon.cote * 0.1)) * IN;
// Haut des poteaux.
export const HAUT = PLATEAU + RACK.poteau.au * IN;

const TOLE = 'red';

/** Tube rectangulaire creux, de section w × h (épaisseur t), long de len selon l'axe donné. */
function tubeRect(S, w, h, t, len, axis, material = TOLE) {
  const o = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => [x * IN, y * IN]);
  const i = [[-w / 2 + t, -h / 2 + t], [-w / 2 + t, h / 2 - t], [w / 2 - t, h / 2 - t], [w / 2 - t, -h / 2 + t]].map(([x, y]) => [x * IN, y * IN]);
  const m = S.extrude(o, len * IN, material, { holes: [i] });
  if (axis === 'x') m.rotation.y = Math.PI / 2;
  else if (axis === 'y') m.rotation.x = Math.PI / 2;
  return S.group(m);
}

/** Pochette de fourche (TUBE ASS) avec les croisillons de sa paroi. */
function tubeAss(S, cote) {
  const { pochette: P, poteau: Po, croisillon: C } = RACK;
  const x = cote * (RACK.large / 2 - P.x0 - P.l / 2);
  const g = S.group(S.at(tubeRect(S, P.l, P.h, P.ep, RACK.long, 'z'), [x * IN, (P.h / 2) * IN, 0]));
  // Croisillons : deux tubes en X entre le poteau avant et le poteau arrière, de 70° sur le plateau,
  // jusqu'à 4 po du bout des poteaux (plan).
  const xc = cote * (RACK.large / 2 - Po.x0 - Po.cote / 2);
  const y0 = PLATEAU / IN, y1 = (HAUT / IN) - C.arret, z1 = RACK.long / 2 - Po.cote;
  for (const s of [-1, 1]) {
    const a = [xc * IN, y0 * IN, -s * z1 * IN], b = [xc * IN, y1 * IN, s * z1 * IN];
    g.add(barreCarree(S, a, b, C.cote));
  }
  return g;
}

/** Tube carré entre deux points (section cote × cote). */
function barreCarree(S, a, b, cote) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const len = Math.hypot(dx, dy, dz);
  const m = tubeRect(S, cote, cote, 0.125, len / IN, 'y');
  m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  m.rotation.x = Math.atan2(dz, dy); // tube dans le plan YZ
  return m;
}

/** Patte (PATTE ASS) : plaque de bout percée de la pochette, poteau de 24 po et oreille de levage. */
function patteAss(S, cx, cz) {
  const { pochette: P, poteau: Po } = RACK;
  const g = S.group();
  // Plaque de bout de 3/8 po autour de l'ouverture de la pochette (vue de face du plan), coin
  // extérieur du haut abattu ; u = distance au bord extérieur du rack (po).
  const w = P.x0 + P.l + 0.75, h = P.h + 2.75, ep = 0.375, H = RACK.large / 2;
  const X = (u) => cx * (H - u) * IN;
  const pts = (l) => { const q = l.map(([u, y]) => [X(u), y * IN]); return cx > 0 ? q : q.reverse(); };
  const contour = pts([[0, 0], [w, 0], [w, h], [1, h], [0, h - 1]]);
  const trou = pts([[P.x0, 0.05], [P.x0, P.h - 0.05], [P.x0 + P.l, P.h - 0.05], [P.x0 + P.l, 0.05]]);
  const pl = S.extrude(cx > 0 ? contour : contour, ep * IN, TOLE, { holes: [trou] });
  pl.position.z = cz * (RACK.long / 2 + ep / 2) * IN;
  g.add(pl);
  // Poteau : tube carré de 2 po, du dessus de la pochette au bout (24 po au-dessus du plateau).
  const xp = cx * (H - Po.x0 - Po.cote / 2), zp = cz * (RACK.long / 2 - Po.cote / 2);
  const hp = HAUT / IN - P.h;
  g.add(S.at(tubeRect(S, Po.cote, Po.cote, 0.1875, hp, 'y'), [xp * IN, (P.h + hp / 2) * IN, zp * IN]));
  g.add(S.box(Po.cote * IN, 0.25 * IN, Po.cote * IN, TOLE, { pos: [xp * IN, HAUT + 0.125 * IN, zp * IN] }));
  // Oreille de levage au coin (vue de dessus : de 51 1/2 à 54 1/2 po), plaque de 1/2 po percée, à plat.
  const or = S.extrude([[-0.9, 0], [0.9, 0], [0.9, 1.6], [0, 2.6], [-0.9, 1.6]].map(([x, y]) => [x * IN, y * IN]), 0.5 * IN, TOLE, { holes: [[0, 1.55 * IN, 0.45 * IN]] });
  or.rotation.x = cz > 0 ? Math.PI / 2 : -Math.PI / 2;
  or.position.set(cx * (H - 0.9) * IN, (h - 0.25) * IN, cz * (RACK.long / 2 + ep) * IN);
  g.add(or);
  return g;
}

/** Tube de travers (TUBE TRAVERS ASS) : au bout du cadre, entre les deux pochettes. */
function traverseAss(S, cz) {
  const { pochette: P, traverse: T } = RACK;
  const span = RACK.large - 2 * (P.x0 + P.l);
  const z = cz * (RACK.long / 2 - T.l / 2);
  return S.group(S.at(tubeRect(S, span, T.h, 0.25, T.l, 'z'), [0, (T.h / 2) * IN, z * IN]));
}

/** Tube carré du plateau, en travers (selon X), sur un tube de travers. */
function railTravers(S, cz, n) {
  const { pochette: P, poteau: Po, rail: R } = RACK;
  const span = RACK.large - 2 * (Po.x0 + Po.cote + R.cote);
  const z = cz * (RACK.long / 2 - (n === 0 ? R.cote / 2 : 12));
  return S.group(S.at(tubeRect(S, span, R.cote, 0.1875, R.cote, 'z'), [0, (P.h + R.cote / 2) * IN, z * IN]));
}

/** Tube carré du plateau, en long (selon Z), sur la pochette, au ras de la paroi. */
function railLong(S, cote) {
  const { pochette: P, poteau: Po, rail: R } = RACK;
  const xr = cote * (RACK.large / 2 - Po.x0 - Po.cote - R.cote / 2);
  return S.group(S.at(tubeRect(S, R.cote, R.cote, 0.1875, RACK.long - 2 * Po.cote, 'z'), [xr * IN, (P.h + R.cote / 2) * IN, 0]));
}

/** Plaque perforée (fentes oblongues en quinconce, vue de dessus). */
function plaquePerforee(S) {
  const { l, p, ep } = RACK.plaque;
  const contour = [[-l / 2, -p / 2], [l / 2, -p / 2], [l / 2, p / 2], [-l / 2, p / 2]].map(([x, y]) => [x * IN, y * IN]);
  const fentes = [];
  const fl = 1.75, fw = 0.7; // fente de 1 3/4 × 0,7 po (relevée)
  for (let i = 0; i < 16; i++) {
    const x = -l / 2 + 2 + i * ((l - 4) / 15);
    const decal = i % 2 ? 1.9 : 0;
    for (let j = 0; j < 8; j++) {
      const y = -p / 2 + 2.5 + decal + j * 3.8;
      if (y + fl / 2 > p / 2 - 1.2) continue;
      fentes.push([[x - fw / 2, y - fl / 2], [x - fw / 2, y + fl / 2], [x + fw / 2, y + fl / 2], [x + fw / 2, y - fl / 2]].map(([a, b]) => [a * IN, b * IN]));
    }
  }
  const m = S.extrude(contour, ep * IN, TOLE, { holes: fentes });
  m.rotation.x = -Math.PI / 2;
  return S.group(S.at(m, [0, PLATEAU - (RACK.rail.cote * 0.75) * IN, 0]));
}

/** Pièce de bois de la charge : cylindre comme au plan (diamètre relevé, longueur non cotée). */
export const BOIS = { d: 10, long: 60, rangs: [5, 5, 5] };
function bois(S, i) {
  const { d, long, rangs } = BOIS;
  let k = i, r = 0;
  while (k >= rangs[r]) { k -= rangs[r]; r++; }
  const n = rangs[r];
  const x = (k - (n - 1) / 2) * d + (r % 2 ? 0 : 0);
  const y = PLATEAU / IN + d / 2 + r * d * 0.98;
  return S.cyl((d / 2) * IN, long * IN, 'wood', { axis: 'z', seg: 24, pos: [x * IN, y * IN, 0] });
}

export function P01(api) {
  const S = api.S;
  const seen = new Set();
  const put = (ref, obj, explode) => {
    api.part(ref, obj, explode, { noLabel: seen.has(ref) });
    seen.add(ref);
  };
  for (const c of [-1, 1]) put('1', tubeAss(S, c), [c * 0.25, 0, 0]);
  for (const cx of [-1, 1]) for (const cz of [-1, 1]) put('2', patteAss(S, cx, cz), [cx * 0.3, 0.1, cz * 0.3]);
  for (const cz of [-1, 1]) put('3', traverseAss(S, cz), [0, -0.15, cz * 0.35]);
  for (const cz of [-1, 1]) put('4', railTravers(S, cz, 1), [0, 0.1, cz * 0.2]);
  for (const cz of [-1, 1]) put('5', railTravers(S, cz, 0), [0, 0.15, cz * 0.45]);
  for (const c of [-1, 1]) put('5', railLong(S, c), [c * 0.15, 0.15, 0]);
  put('6', plaquePerforee(S), [0, 0.2, 0]);
  for (let i = 0; i < 15; i++) put('7', bois(S, i), [0, 0.6 + Math.floor(i / 5) * 0.1, 0]);
  return { view: { dir: [-0.9, 0.6, 1] } };
}

export default { P01 };

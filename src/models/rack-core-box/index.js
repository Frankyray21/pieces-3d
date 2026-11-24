// Rack de boîtes à carottes (core box) : plate-forme d'acier à passages de
// fourche, bordée de chaque côté par deux arceaux de tube séparés (chacun :
// deux montants, une traverse haute, une diagonale) ; les côtés ne sont pas
// continus (précision du client). On y empile les boîtes à carottes pleines.
// Reconstitué d'après une photo du client, prise sous terre (P01) : la photo
// ne montre qu'une portion du rack. Aucun plan, aucune cote publiée.
//
// Donné par le client : une boîte à carottes fait au moins 1,5 m de long
// (seule cote sûre, elle sert d'échelle à tout le reste) ; il entre cinq boîtes
// de large dans le rack ; les côtés ne sont pas continus.
//
// Relevé sur la photo, à cette échelle (à ± 10 % environ) : les boîtes sont
// couchées en travers, bouts vers le côté des fourches, en colonnes côte à
// côte entre les arceaux ; les colonnes visibles ont quatre boîtes et sont
// décalées d'une colonne à l'autre ; plate-forme pâle, arceaux bleus d'environ
// 0,5 m de large, passages de fourche sous la plate-forme (deux sont visibles,
// sous la première et la troisième colonne).
//
// Supposé : la largeur et la hauteur d'une boîte (boîte de bois à quatre
// rangées), les sections des tubes, l'épaisseur de la tôle, le sens de la
// diagonale des arceaux que la photo ne montre pas en entier, le troisième
// passage de fourche (sous la cinquième colonne, par symétrie).
//
// Repère : X dans la largeur du rack (d'un côté à l'autre), Y vers le haut
// (sol à 0), Z le long des boîtes, +Z du côté des bouts de boîtes visibles sur
// la photo (côté des fourches). Cotes en millimètres, modèle en mètres.
import * as THREE from 'three';

const MM = 0.001;
export const IN = 25.4;

// ------------------------------------------------------------------ cotes (mm)

/** Boîte à carottes de bois, à quatre rangées. Longueur donnée par le client ; le reste est supposé. */
export const BOITE = {
  long: 1500, // donnée par le client (minimum)
  large: 300, // supposée, d'après les proportions des bouts sur la photo
  haut: 60, // supposée (sans le couvercle)
  rangees: 4, // supposé
  paroi: 12, // côtés et bouts
  fond: 6,
  separation: 9,
  couvercle: 6,
};
/** Empilement : cinq colonnes côte à côte (donné par le client) ; boîtes par colonne et décalage en Z de chaque colonne relevés sur la photo (colonnes cachées : supposé). */
export const PILE = { colonnes: 5, etages: 4, jeu: 10, decalage: [-45, 0, 45, 15, -25] };

/** Tube carré des arceaux et tube de la diagonale (supposés). */
export const TUBE = { cote: 2 * IN, diagonale: 1.5 * IN };
/** Plate-forme : cadre de tube rectangulaire couvert d'une tôle (sections supposées). */
export const BASE = {
  jeuCote: 30, // jeu entre la pile et les arceaux
  profond: 1600, // le long des boîtes : 1,5 m plus le décalage des colonnes
  cadre: { haut: 3 * IN, large: 2 * IN },
  tole: 3 / 16 * IN,
};
/**
 * Passages de fourche sous la plate-forme, le long des boîtes : un sous une colonne sur deux
 * (relevé sur la photo pour les deux premiers ; le troisième et la section sont supposés).
 */
export const FOURCHE = { large: 7 * IN, haut: 3 * IN, paroi: 3 / 16 * IN, entraxe: 2 * (BOITE.large + PILE.jeu), nombre: 3 };
/** Abscisses des passages de fourche (mm), rack centré. */
export const passages = () => Array.from({ length: FOURCHE.nombre }, (_, i) => (i - (FOURCHE.nombre - 1) / 2) * FOURCHE.entraxe);
/** Arceaux : hauteur au-dessus de la tôle et largeur hors tout, le long des boîtes (relevées sur la photo) ; deux par côté. */
export const CADRE = { haut: 800, large: 500, parCote: 2 };

/** Largeur de la pile de boîtes. */
export const largeurPile = () => PILE.colonnes * BOITE.large + (PILE.colonnes - 1) * PILE.jeu;
/** Largeur hors tout de la plate-forme (d'un côté à l'autre, tubes compris). */
export const largeurBase = () => largeurPile() + 2 * BASE.jeuCote + 2 * TUBE.cote;
/** Hauteur du dessus de la tôle au-dessus du sol. */
export const dessusTole = () => FOURCHE.haut + BASE.cadre.haut + BASE.tole;
/** Hauteur d'une boîte fermée. */
export const hautBoite = () => BOITE.haut + BOITE.couvercle;
/** Largeur d'une rangée (le logement de la carotte). */
export const largeurRangee = () => (BOITE.large - 2 * BOITE.paroi - (BOITE.rangees - 1) * BOITE.separation) / BOITE.rangees;
/** Encombrement du rack (mm). */
export function horsTout() {
  return { large: largeurBase(), profond: BASE.profond, haut: dessusTole() + CADRE.haut };
}
/** Nombre de boîtes du modèle. */
export const nombreBoites = () => PILE.colonnes * PILE.etages;

// ------------------------------------------------------------------ pièces

/** Axe des veines du bois (le plus long côté), en attribut de la géométrie. */
function veines(mesh, axe) {
  const g = mesh.geometry;
  if (!g || g.getAttribute('aGrain')) return mesh;
  const v = [0, 0, 0];
  v[axe] = 1;
  const n = g.getAttribute('position').count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) a.set(v, i * 3);
  g.setAttribute('aGrain', new THREE.BufferAttribute(a, 3));
  return mesh;
}

/** Pavé de x0 à x1, y0 à y1, z0 à z1 (mm). */
function pave(S, x0, x1, y0, y1, z0, z1, matiere, r = 0) {
  return S.box((x1 - x0) * MM, (y1 - y0) * MM, (z1 - z0) * MM, matiere, { r: r * MM, pos: [((x0 + x1) / 2) * MM, ((y0 + y1) / 2) * MM, ((z0 + z1) / 2) * MM] });
}
/** Planche de bois : pavé dont les veines suivent le plus long côté. */
function planche(S, x0, x1, y0, y1, z0, z1, matiere) {
  const t = [x1 - x0, y1 - y0, z1 - z0];
  return veines(pave(S, x0, x1, y0, y1, z0, z1, matiere), t.indexOf(Math.max(...t)));
}

/** Repère 1 : plate-forme (cadre de tube, traverses, tôle). Origine au centre, dessous du cadre à y = 0. */
function plateForme(S, matiere) {
  const W = largeurBase() / 2, D = BASE.profond / 2, h = BASE.cadre.haut, l = BASE.cadre.large;
  const g = S.group(
    pave(S, -W, W, 0, h, D - l, D, matiere, 4),
    pave(S, -W, W, 0, h, -D, -D + l, matiere, 4),
    pave(S, -W, -W + l, 0, h, -D + l, D - l, matiere, 4),
    pave(S, W - l, W, 0, h, -D + l, D - l, matiere, 4),
    // Deux traverses sous la tôle, au tiers de la profondeur.
    pave(S, -W + l, W - l, 0, h, -D / 3 - l / 2, -D / 3 + l / 2, matiere, 4),
    pave(S, -W + l, W - l, 0, h, D / 3 - l / 2, D / 3 + l / 2, matiere, 4),
    pave(S, -W, W, h, h + BASE.tole, -D, D, matiere),
  );
  return g;
}

/** Repère 2 : passage de fourche, tube rectangulaire le long de Z. Origine au centre, dessous à y = 0. */
function passage(S, matiere) {
  const w = FOURCHE.large, h = FOURCHE.haut, e = FOURCHE.paroi;
  const contour = [[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]].map(([x, y]) => [x * MM, y * MM]);
  const trou = [[-w / 2 + e, e], [w / 2 - e, e], [w / 2 - e, h - e], [-w / 2 + e, h - e]].map(([x, y]) => [x * MM, y * MM]);
  return S.group(S.extrude(contour, BASE.profond * MM, matiere, { holes: [trou] }));
}

/** Repère 3 : montant d'un arceau, debout sur la tôle. */
function montant(S, matiere) {
  const c = TUBE.cote / 2;
  return S.group(pave(S, -c, c, 0, CADRE.haut - TUBE.cote, -c, c, matiere, 3));
}

/** Repère 4 : traverse haute d'un arceau, posée sur ses deux montants. */
function traverse(S, matiere) {
  const c = TUBE.cote / 2, D = CADRE.large / 2;
  return S.group(pave(S, -c, c, CADRE.haut - TUBE.cote, CADRE.haut, -D, D, matiere, 3));
}

/** Repère 5 : diagonale d'un arceau, du pied du montant avant à la tête du montant arrière. */
function diagonale(S, matiere) {
  const c = TUBE.cote, d = TUBE.diagonale / 2;
  const z0 = CADRE.large / 2 - c, z1 = -CADRE.large / 2 + c, y0 = 0, y1 = CADRE.haut - c;
  // Coupes droites contre la face des montants ; vy : épaisseur du tube mesurée à la verticale.
  const vy = (2 * d) / Math.cos(Math.atan2(y1 - y0, z0 - z1));
  const profil = [[z0, y0], [z0, y0 + vy], [z1, y1], [z1, y1 - vy]].map(([z, y]) => [z * MM, y * MM]);
  const p = S.extrude(profil, 2 * d * MM, matiere);
  p.rotation.y = -Math.PI / 2; // profil dessiné dans le plan (Z, Y)
  return S.group(p);
}

/** Repère 6 : boîte à carottes ouverte (fond, côtés, bouts, séparations). Origine au centre, dessous à y = 0. */
function boite(S) {
  const W = BOITE.large / 2, L = BOITE.long / 2, p = BOITE.paroi, f = BOITE.fond, h = BOITE.haut, r = largeurRangee();
  const g = S.group(
    planche(S, -W, W, 0, f, -L, L, 'woodPlaned'),
    planche(S, -W, -W + p, f, h, -L, L, 'woodLight'),
    planche(S, W - p, W, f, h, -L, L, 'woodLight'),
    planche(S, -W + p, W - p, f, h, L - p, L, 'wood'),
    planche(S, -W + p, W - p, f, h, -L, -L + p, 'wood'),
  );
  for (let i = 1; i < BOITE.rangees; i++) {
    const x = -W + p + i * r + (i - 1) * BOITE.separation;
    g.add(planche(S, x, x + BOITE.separation, f, h - 4, -L + p, L - p, 'woodLight'));
  }
  return g;
}

/** Repère 7 : couvercle de contreplaqué, posé sur la boîte. */
function couvercle(S) {
  return S.group(planche(S, -BOITE.large / 2, BOITE.large / 2, 0, BOITE.couvercle, -BOITE.long / 2, BOITE.long / 2, 'woodPlaned'));
}

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  const S = api.S;
  const PLATE = 'lightGrey', BLEU = 'bleuRoi';
  const vus = new Set();
  const put = (ref, obj, eclate, premier = true) => {
    api.part(ref, obj, eclate, { noLabel: vus.has(ref) || !premier });
    if (premier) vus.add(ref);
  };
  const yBase = FOURCHE.haut, yTole = dessusTole(), W = largeurBase() / 2, D = BASE.profond / 2, c = TUBE.cote / 2;

  put('1', S.at(plateForme(S, PLATE), [0, yBase * MM, 0]), [0, 0, 0]);
  for (const x of passages()) put('2', S.at(passage(S, PLATE), [x * MM, 0, 0]), [0, -0.25, 0]);
  // Deux arceaux par côté : un au bord avant, un au bord arrière de la plate-forme.
  const L = CADRE.large / 2;
  for (const s of [-1, 1]) {
    const x = s * (W - c) * MM;
    for (const b of [1, -1]) {
      const zc = b * (D - L), e = [s * 0.35, 0, b * 0.12];
      for (const z of [1, -1]) put('3', S.at(montant(S, BLEU), [x, yTole * MM, (zc + z * (L - c)) * MM]), [e[0], 0, e[2] + z * 0.06]);
      put('4', S.at(traverse(S, BLEU), [x, yTole * MM, zc * MM]), [e[0], 0.25, e[2]]);
      put('5', S.at(diagonale(S, BLEU), [x, yTole * MM, zc * MM]), e);
    }
  }

  const pas = BOITE.large + PILE.jeu, x0 = -largeurPile() / 2 + BOITE.large / 2, haut = hautBoite();
  for (let col = 0; col < PILE.colonnes; col++) {
    for (let et = 0; et < PILE.etages; et++) {
      const pos = [(x0 + col * pas) * MM, (yTole + et * haut) * MM, PILE.decalage[col] * MM];
      // Vue éclatée : la pile monte et s'étage ; le couvercle de chaque boîte se soulève et recule.
      const e = [0, 0.35 + et * 0.2, 0.25 + col * 0.05];
      const etiquette = col === PILE.colonnes - 1 && et === PILE.etages - 1;
      put('6', S.at(boite(S), pos), e, etiquette);
      put('7', S.at(couvercle(S), [pos[0], pos[1] + BOITE.haut * MM, pos[2]]), [e[0], e[1] + 0.07, e[2] - 0.45], etiquette);
    }
  }
  // Vue de la photo : du côté des bouts de boîtes, à gauche et au-dessus.
  return { view: { dir: [-0.75, 0.6, 1] } };
}

export default { P01 };

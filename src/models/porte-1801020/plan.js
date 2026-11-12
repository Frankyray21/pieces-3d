// Porte assemblée 1801020 (Machines Roger International) : cotes des plans 1801020 (porte assemblée,
// 2022-04-05, échelle 1:16) et 15250402 (trépied, échelle 1:10), en pouces.
//
// Cotes inscrites aux plans : 42 po de large, 88 3/8 po de haut, pieds de 36 po, joints des pentures
// à 13 1/8, 48 3/8 et 81 po du dessus des pieds, plaques de butée à 1/4 po de la face arrière du
// cadre ; trépied : 42 po, 7 3/8 po, 17 1/4 po, 1 1/2 po, 9/16 po. Tout le reste est relevé à
// l'échelle sur les tracés vectoriels des PDF (tubes, grillage, anneaux, poignée, loquet).
//
// Repère du plan : x de 0 (bord gauche, côté loquet) à 42 (côté pentures), y depuis le plancher,
// z depuis le plan milieu du cadre, positif vers l'avant (côté des pentures, du loquet et de la
// poignée : c'est de ce côté que la porte s'ouvre).

export const IN = 0.0254;

export const L = 42; // largeur hors tout
export const H = 88 + 3 / 8; // hauteur hors tout, plaque du pied comprise

// Trépied 15250402 : trois plaques identiques (deux pieds, une traverse), deux douilles de deux
// plaques debout qui serrent le montant, quatre goussets à 45°.
export const TREPIED = {
  plaque: { long: 36, large: 3, ep: 3 / 8 }, // 15250408
  douille: { large: 1.5, ep: 3 / 8, haut: 7, jeu: 1.5 }, // 15250411 : dessus à 7 3/8 po du plancher
  gousset: { ep: 3 / 8, cote: 4.5, large: 2, bord: 9 / 16 }, // 15250412 : plat de 2 po à 45°
};

// Cadre 15250413 : tube carré de 1 1/2 po, coins d'onglet en haut, montants dans les douilles.
export const CADRE = { tube: 1.5, paroi: 1 / 8, rayon: 1 / 8 };
export const FACE = CADRE.tube / 2; // z de la face avant du cadre et du battant

// Anneaux ovales soudés au cadre (attaches) : rond de 1/4 po, 2 × 1 1/4 po hors tout.
export const ANNEAU = { rond: 1 / 4, long: 2, large: 1.25, haut: [1 + 13 / 16, 20 + 13 / 16, 39 + 13 / 16], cote: [15 + 3 / 16, 39 + 3 / 16, 63 + 3 / 16, 87 + 3 / 16] };

// Patte du loquet, soudée au montant gauche (porte l'interverrouillage).
export const PATTE = { x: -1.48, y0: 43.89, y1: 51.89, chanfrein: 1.42, ep: 1 / 4 };

// Battant 15250400 : tube carré de 1 po à fleur de la face avant, jeu de 1/2 po tout le tour.
export const BATTANT = {
  tube: 1, paroi: 1 / 8, rayon: 1 / 8,
  x0: 2, x1: 40, y0: 7 / 8, y1: 86 + 3 / 8,
  traverse: 43 + 5 / 8, // axe de la traverse du milieu
  // Grillage soudé : fil de 3/16 po au pas de 2 po, dans le plan milieu du tube.
  fil: 3 / 16, pas: 2, filX: [4, 38], filBas: [2.5, 42.5], filHaut: [44.75, 84.75],
  // Plaque du loquet, au-dessus de la traverse (épaisseur estimée : la vis de 3/4 po la traverse).
  plaque: { x0: 3, x1: 12.5, y0: 44 + 1 / 8, y1: 47 + 1 / 8, ep: 1 / 4 },
  // Poignée en rond de 1/2 po sur le montant du côté loquet.
  poignee: { x: 2.5, y0: 50 + 1 / 8, y1: 56 + 1 / 8, saillie: 4, rond: 1 / 2, coude: 1 / 2 },
};

// Plaques de butée 15250417 : triangles de 1/4 po derrière le battant, aux coins du côté loquet.
export const BUTEE = { cote: 2.83, coin: 0.71, ep: 1 / 4, retrait: 1 / 4, bas: 0.52 };

// Pentures à souder de 6 po 0105233 : fût de 0,8 po devant le jeu entre le battant et le cadre.
// Le joint entre les deux moitiés est coté depuis le dessus des pieds (3/8 po).
export const PENTURE = { r: 0.4, demi: 2.53, x: 40.25, z: FACE + 0.4, joints: [13 + 1 / 8, 48 + 3 / 8, 81].map((y) => y + 3 / 8) };

// Barrure 2210300 (verrou à coulisse Fortress Interlocks, d'après le marquage du dessin) : coulisse
// et bouton sur le battant, tête d'interverrouillage sur la patte du cadre. Formes relevées sur le
// plan ; course estimée d'après la lumière oblongue de la barre.
export const BARRURE = {
  y: 45.62, z: FACE + 0.76, // axe de la barre et de la languette
  socle: { x0: 6.61, x1: 12.5, y0: 44.34, y1: 46.91, ep: 0.5, chanfrein: 0.4 },
  barre: { x0: 3.8, x1: 13.0, haut: 0.7, ep: 0.5 },
  bouton: { x: 7.52, r: 0.785, tige: 0.38, bout: FACE + 3.1 },
  bloc: { x0: 2.59, x1: 4.1, y0: 44.26, y1: 47.0, ep: 1.0 },
  languette: { x: 0.9, ep: 0.2 },
  vis: { x: [6.98, 11.5], y: [44.72, 46.52] },
  tete: { x0: -0.85, x1: 1.52, y0: 45.1, y1: 46.7 },
  boitier: { x0: -0.83, x1: 0.72, y0: 46.7, y1: 50.6 },
  prof: 1.52, // profondeur de la tête et du boîtier (40 mm)
  course: 1,
};

// Boulons des douilles : 1/2-13 × 2 3/4 po, tête devant, écrou derrière.
export const BOULON = { d: 0.5, long: 2.75, y: 5.875, ecrou: 0.44 };

// Densité par défaut de SolidWorks (matériau non assigné : 1 g/cm³), en lb/po³. Les masses des
// cartouches (19,74 lb et 5,42 lb) sont calculées avec elle : elles donnent le volume de matière.
export const DENSITE_DEFAUT = 0.036127;
export const ACIER = 0.2836; // lb/po³
export const MASSE_PLAN = { porte: 19.74, trepied: 5.42 };

/** Section réelle d'un tube carré à coins arrondis, rapportée à la section pleine du maillage. */
export function tauxCreux({ tube, paroi, rayon }) {
  const plein = tube * tube - (4 - Math.PI) * rayon * rayon;
  return (plein - (tube - 2 * paroi) ** 2) / plein;
}

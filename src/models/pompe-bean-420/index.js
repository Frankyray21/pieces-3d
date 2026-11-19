// Pompe triplex à pistons Bean 420 (FMC L0918), dans sa version American
// Manufacturing AL0918B à clapets à billes : « Operation And Maintenance Manual »
// (48 pages), figures 2A, 2B et 3 (coupes repérées), tableau 4 (62 repères) et
// figure 7 (plan coté). La vue éclatée du catalogue TIME Ltd (FMC L09-420, page
// PU4) sert à comprendre la forme des pièces que les coupes ne montrent pas.
//
// Cotes inscrites au manuel (figure 7, tableau 8, section 2.0) : 23,219 × 15 ×
// 11,375 po hors tout, refoulement de 1 po NPT à 8,375 po de la base, arbre
// d'entrée à 8,062 po de la base et à 11,875 po de l'axe des clapets, bout de
// l'arbre à 8,750 po de l'axe de la pompe (saillie de 2,536 po), trous de
// fixation 1/2-13 à 5,00 et 17,687 po de l'axe des clapets, entraxes de 8,500 po
// à l'avant et de 8,563 po à l'arrière, alésage et course de 2,25 po, arbre de
// Ø 1 1/8 po à clavette de 1/4 po, maneton de Ø 2,874 po, crosse de Ø 2,750 po,
// axe de pied de bielle de Ø 1,000 po. Tout le reste est relevé sur le tracé
// vectoriel des figures (échelles calées sur ces cotes) : axe des cylindres à
// 5,25 po de la base, cylindres au pas de 3 po, goujons de culasse sur une
// grille de 3 × 3 po, vilebrequin à 3,56 po derrière l'arbre d'entrée.
// La denture n'est dessinée nulle part : pignon et roue sont calculés d'après
// l'entraxe relevé (4,54 po) et le rapport publié de 3,6:1.
// Contrôle : scripts/check-pompe-bean-420.mjs.
//
// Repère (pouces dans ce fichier) : X le long de la pompe, 0 à l'axe des clapets,
// positif vers l'arrière (carter) ; Y vers le haut, 0 sous les pattes ; Z en
// travers, 0 à l'axe de la pompe ; l'arbre d'entrée sort du côté −Z (à gauche
// quand on regarde la pompe depuis les culasses, comme sur la photo du manuel).

const IN = 0.0254;

// ------------------------------------------------------------------ cotes

/** Cotes inscrites au manuel (pouces). */
export const COTE = {
  long: 23.219, large: 15, haut: 11.375,
  refoulement: 8.375, // hauteur de l'axe du refoulement de 1 po NPT
  arbre: { x: 11.875, y: 8.062, d: 1.125, bout: 8.75, saillie: 2.536, clavette: { w: 0.25, len: 1.812 } },
  fixation: { avant: { x: 5, z: 4.25 }, arriere: { x: 17.687, z: 4.2815 }, filet: 0.5 },
  alesage: 2.25, course: 2.25,
  maneton: 2.874, crosse: 2.75, axePied: 1,
  rapport: 3.6,
};

/** Relevés sur le tracé des figures (pouces). */
export const RELEVE = {
  axeCyl: 5.25, // hauteur de l'axe des cylindres
  pas: 3, // entraxe des cylindres
  goujon: { z: [-4.5, -1.5, 1.5, 4.5], y: 1.5, d: 0.5 }, // grille des goujons de culasse, autour de l'axe des cylindres
  vilebrequin: 15.433, // axe du vilebrequin, depuis l'axe des clapets
  avant: -3.86, // bout des goujons de culasse (l'arrière en découle : 23,219 po plus loin)
  bloc: { x0: -1.17, x1: 3.65, y0: 3.06, y1: 7.54, z: 5.24 }, // bloc des cylindres de la boîte à clapets
  collecteur: { x: 1.72, y0: 6.57, y1: 9.25, z: 6.25, r: 0.55 }, // collecteur de refoulement
  colonne: { r: 1.37, collet: 1.5, y0: 1.25, y1: 1.93 }, // bas des colonnes de clapets
  chemise: { x0: 1, x1: 4.3, ro: 1.375 },
  bati: { x0: 3.92, bride: 17.83, x1: 18.43, z: 5.48, haut: 9.85, fond: 0.65, tronc: { x1: 10.4, y0: 3.13, y1: 7.4, z: 5.3 } },
  bille: 15 / 16,
};

const CY = RELEVE.axeCyl;
const ZC = [-RELEVE.pas, 0, RELEVE.pas]; // axes des trois cylindres
const XV = RELEVE.vilebrequin;
const AR = COTE.arbre;
const ENTRAXE = Math.hypot(XV - AR.x, AR.y - CY); // arbre d'entrée → vilebrequin
/** Denture calculée : rayons primitifs du pignon et de la roue, nombres de dents au module de 1/10 po (pas diamétral 10). */
export const DENTURE = { pignon: ENTRAXE / (1 + COTE.rapport), roue: (ENTRAXE * COTE.rapport) / (1 + COTE.rapport), z1: 20, z2: 72, largeur: 1 };
const ZROUE = -1.5; // la roue passe entre les bielles des cylindres 1 et 2
/** Longueur de bielle, d'axe en axe (figure 2B). */
export const BIELLE = 5.75;
const EXC = COTE.course / 2;

// Peinture : bleu des photos du manuel (pages 1 et 7).
const PEINT = 'bleuRoi', ACIER = 'steel', SOMBRE = 'darkSteel', VIS = 'zinc';

// ------------------------------------------------------------------ outils

const m = (pts) => pts.map(([a, b]) => [a * IN, b * IN]);
const pos = (x, y, z) => [x * IN, y * IN, z * IN];

/** Arc de cercle en points [a, b], de l'angle a0 à a1 (degrés). */
function arc(ca, cb, r, a0, a1, n = 8) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    pts.push([ca + r * Math.cos(a), cb + r * Math.sin(a)]);
  }
  return pts;
}

/** Rectangle [a0, a1] × [b0, b1] aux coins arrondis au rayon r. */
function rect(a0, a1, b0, b1, r = 0) {
  if (!r) return [[a0, b0], [a1, b0], [a1, b1], [a0, b1]];
  return [...arc(a1 - r, b0 + r, r, -90, 0, 5), ...arc(a1 - r, b1 - r, r, 0, 90, 5), ...arc(a0 + r, b1 - r, r, 90, 180, 5), ...arc(a0 + r, b0 + r, r, 180, 270, 5)];
}

/** Profil [x, y] extrudé le long de Z, de z0 à z1. Trous ronds [x, y, r] ou polygones. */
function selonZ(S, profil, z0, z1, material, holes = []) {
  const p = S.extrude(m(profil), (z1 - z0) * IN, material, { holes: trous(holes), center: false });
  p.position.z = z0 * IN;
  return p;
}

/** Profil [z, y] extrudé le long de X, de x0 à x1. */
function selonX(S, profil, x0, x1, material, holes = []) {
  const miroir = (pts) => pts.map(([z, y]) => [-z, y]);
  const h = holes.map((t) => (Array.isArray(t[0]) ? miroir(t) : [-t[0], t[1], t[2]]));
  const p = S.extrude(m(miroir(profil)), (x1 - x0) * IN, material, { holes: trous(h), center: false });
  p.rotation.y = Math.PI / 2;
  p.position.x = x0 * IN;
  return p;
}

/** Profil [x, z] à plat, épaisseur vers le haut de y0 à y1. */
function aPlat(S, profil, y0, y1, material, holes = []) {
  const p = S.extrude(m(profil), (y1 - y0) * IN, material, { holes: trous(holes), center: false });
  p.rotation.x = Math.PI / 2;
  p.position.y = y1 * IN;
  return p;
}

const trous = (holes) => holes.map((t) => (Array.isArray(t[0]) ? m(t) : t.map((v) => v * IN)));

/** Pièce tournée d'axe X : profil [[rayon, x], ...], axe à la hauteur y et à la cote z. */
function tourX(S, profil, material, y = CY, z = 0, seg = 36) {
  return S.lathe(m(profil), material, { axis: 'x', seg, pos: pos(0, y, z) });
}

/** Pièce tournée d'axe Y : profil [[rayon, y], ...], axe en (x, z). */
function tourY(S, profil, material, x = 0, z = 0, seg = 36) {
  return S.lathe(m(profil), material, { axis: 'y', seg, pos: pos(x, 0, z) });
}

/** Pièce tournée d'axe Z : profil [[rayon, z], ...], axe en (x, y). */
function tourZ(S, profil, material, x, y, seg = 36) {
  return S.lathe(m(profil), material, { axis: 'z', seg, pos: pos(x, y, 0) });
}

/** Six-pans plein (tête, écrou borgne) : surplat af, de a0 à a1 le long de l'axe. */
function sixPans(S, af, a0, a1, material, axis, x, y, z) {
  const R = af / 2 / Math.cos(Math.PI / 6);
  const p = S.lathe(m([[0, a0], [R, a0], [R, a1], [0, a1]]), material, { axis, seg: 6 });
  p.position.set(...pos(x, y, z));
  return p;
}

/** Triangle aux coins arrondis (bride de boîtier à trois vis) : sommets au rayon R, aux angles donnés (degrés). */
function triangle(R, angles, r) {
  const out = [];
  [...angles].sort((p, q) => p - q).forEach((a) => {
    const c = [(R - r * 0.2) * Math.cos((a * Math.PI) / 180), (R - r * 0.2) * Math.sin((a * Math.PI) / 180)];
    out.push(...arc(c[0], c[1], r, a - 62, a + 62, 6));
  });
  return out;
}

// ------------------------------------------------------------------ extrémité hydraulique

const GOUJONS = RELEVE.goujon.z.flatMap((z) => [1, -1].map((s) => ({ z, y: CY + s * RELEVE.goujon.y, haut: s > 0 })));
// Brides de culasse en diagonale : du goujon du bas d'une colonne au goujon du haut de la colonne voisine (photo du
// manuel et vue de dessous de la figure 7). Les deux goujons des coins opposés restent sans bride : leurs écrous
// serrent la boîte à clapets directement (section 9.0, étape 4).
const BRIDES = ZC.map((z) => ({ z, bas: z + 1.5, haut: z - 1.5 }));
const AVEC_BRIDE = (g) => BRIDES.some((b) => (g.haut ? b.haut : b.bas) === g.z);
const X_BRIDE = { x0: -3.07, x1: -1.92 }; // épaisseur de la bride (figure 3)
const X_FACE = RELEVE.bloc.x0; // face avant de la boîte à clapets
const X_COUVERCLE = -1.5; // face avant des culasses de cylindre

/** Trous de passage des huit goujons, [z, y, r]. */
const trousGoujons = (r = 0.28) => GOUJONS.map((g) => [g.z, g.y, r]);

/** Boîte à clapets (38) : bloc des trois cylindres, colonnes de clapets et collecteur de refoulement, en fonte. */
function boiteAClapets(S, material) {
  const b = RELEVE.bloc, c = RELEVE.collecteur, col = RELEVE.colonne;
  const g = S.group();
  const face = rect(-b.z, b.z, b.y0, b.y1, 0.3);
  // Bloc en deux longueurs : alésage du cylindre à l'avant, lamage de la chemise à l'arrière.
  g.add(selonX(S, face, b.x0, RELEVE.chemise.x0, material, [...ZC.map((z) => [z, CY, COTE.alesage / 2]), ...trousGoujons()]));
  g.add(selonX(S, face, RELEVE.chemise.x0, b.x1, material, [...ZC.map((z) => [z, CY, RELEVE.chemise.ro + 0.025]), ...trousGoujons()]));
  // Collecteur de refoulement : caisson arrondi en travers, au-dessus des trois colonnes.
  g.add(S.box(2 * c.x * IN, (c.y1 - c.y0) * IN, 2 * c.z * IN, material, { r: c.r * IN, pos: pos(0, (c.y0 + c.y1) / 2, 0) }));
  for (const z of ZC) {
    // Colonne du bas : orifice d'aspiration de 1 1/2 po NPT, chambre et portée conique du siège.
    g.add(tourY(S, [
      [0.95, col.y0], [col.collet, col.y0], [col.collet, col.y1 - 0.12], [col.collet - 0.12, col.y1], [col.r, col.y1], [col.r, 3.2], [1.1, 3.2], [1.1, 4.05],
      [0.72, 4.05], [0.72, 2.75], [1.05, 2.75], [1.05, 1.85], [0.95, 1.85], [0.95, col.y0],
    ], material, 0, z, 40));
    // Colonne du haut (dans le bloc et le collecteur) : siège de refoulement, chambre de la bille, col du couvercle.
    g.add(tourY(S, [
      [0.72, 6.45], [1.1, 6.45], [1.1, c.y1 - 0.001], [0.68, c.y1 - 0.001], [0.68, 8.75], [0.9, 8.75], [0.9, 7.15], [0.72, 7.15], [0.72, 6.45],
    ], material, 0, z, 40));
  }
  // Orifices de refoulement de 1 po NPT, un à chaque bout du collecteur.
  for (const s of [-1, 1]) g.add(S.cyl(0.575 * IN, 0.06 * IN, 'blackOxide', { axis: 'z', seg: 28, pos: pos(0, COTE.refoulement, s * (c.z - 0.02)) }));
  return g;
}

/** Culasse de cylindre (54) : collet et corps qui entre dans la boîte, d'axe X. */
function culasse(S, material, z) {
  return tourX(S, [
    [0, X_COUVERCLE], [0.5, X_COUVERCLE], [0.6, X_COUVERCLE + 0.06], [1.36, X_COUVERCLE + 0.06], [1.4, X_COUVERCLE + 0.1], [1.4, X_FACE - 0.03],
    [0.97, X_FACE - 0.03], [0.97, 0.37], [0.91, 0.43], [0, 0.43],
  ], material, CY, z, 40);
}

/** Bride de culasse (57) : barre en diagonale entre deux goujons, patin au centre sur la culasse. */
function brideCulasse(S, material, b) {
  const g = S.group();
  const dz = b.haut - b.bas, dy = 2 * RELEVE.goujon.y; // du goujon du bas vers celui du haut
  const len = Math.hypot(dz, dy), a = Math.atan2(dy, dz);
  const r = 0.68, t = X_BRIDE.x1 - X_BRIDE.x0;
  // Barre aux bouts ronds, percée pour les deux goujons (profil dans le plan de la face avant).
  const half = len / 2;
  const contour = [...arc(half, 0, r, -90, 90, 10), ...arc(-half, 0, r, 90, 270, 10)];
  const barre = S.extrude(m(contour), t * IN, material, { holes: trous([[half, 0, 0.28], [-half, 0, 0.28]]), center: false });
  // Plan du profil (x', y') → plan ZY de la pompe : x' selon la diagonale, épaisseur vers −X.
  const pivot = S.group(barre);
  pivot.rotation.z = a;
  const face = S.group(pivot);
  face.rotation.y = -Math.PI / 2; // +Z du profil → −X de la pompe, +X du profil → +Z
  face.position.set(...pos(X_BRIDE.x1, CY, (b.bas + b.haut) / 2));
  g.add(face);
  // Patin conique qui appuie sur la culasse.
  g.add(tourX(S, [[0, X_BRIDE.x1 - 0.02], [0.62, X_BRIDE.x1 - 0.02], [0.36, X_COUVERCLE], [0, X_COUVERCLE]], material, CY, b.z, 24));
  return g;
}

/** Goujon de culasse (58, long) ou d'angle (59, court) : vissé dans le bâti, il traverse la boîte à clapets. */
function goujon(S, material, g, long) {
  const x1 = RELEVE.bati.x0 + 0.62; // fond du taraudage du bâti
  const x0 = long ? RELEVE.avant : X_FACE - 0.82;
  return S.cyl((RELEVE.goujon.d / 2) * IN, (x1 - x0) * IN, material, { axis: 'x', seg: 14, pos: pos((x0 + x1) / 2, g.y, g.z) });
}

/** Écrou 1/2-13 (61, 53), surplat de 3/4 po, d'axe X ou Y. */
function ecrou(S, material, axis, x, y, z) {
  return S.nut(0.75 * IN, 0.44 * IN, material, { axis, pos: pos(x, y, z) });
}

/** Chemise (56) : cylindre en céramique entre la boîte à clapets et le bâti. */
function chemise(S, z) {
  const c = RELEVE.chemise;
  return S.shell(c.ro * IN, (COTE.alesage / 2) * IN, (c.x1 - c.x0) * IN, 'white', { axis: 'x', seg: 44, pos: pos((c.x0 + c.x1) / 2, CY, z) });
}

/** Joint de chemise (46) : rondelle de cuivre à chaque bout. */
function jointChemise(S, x, z) {
  return S.ring((RELEVE.chemise.ro + 0.02) * IN, (COTE.alesage / 2 + 0.02) * IN, 0.04 * IN, 'copper', { axis: 'x', seg: 40, pos: pos(x, CY, z) });
}

/** Position du piston (bout de la tige) selon l'angle du vilebrequin (radians). */
function xPied(angle) {
  // Bielle-manivelle en ligne : maneton à EXC de l'axe, pied de bielle sur l'axe du cylindre.
  return XV + EXC * Math.cos(angle) - Math.sqrt(BIELLE ** 2 - (EXC * Math.sin(angle)) ** 2);
}
/** Calage des trois excentriques (120°) ; le cylindre du milieu est au point mort arrière, comme sur la figure 3. */
const CALAGE = [(2 * Math.PI) / 3, 0, (-2 * Math.PI) / 3];
const X_PIED0 = xPied(0); // pied de bielle du cylindre du milieu
/** Décalage du piston du cylindre i par rapport à celui du milieu. */
const recul = (i) => xPied(CALAGE[i]) - X_PIED0;
// Au point mort arrière, l'épaulement de la tige (appui du porte-piston) est à 4,15 po de l'axe des clapets (figure 3).
const X_EPAULE = 4.15;

/** Pièces du piston, en place sur le bout de la tige (dx : recul du cylindre). */
const piston = {
  /** Porte-piston (41) : moyeu et collerette conique qui épaule la coupelle. */
  porte: (S, z, dx) => tourX(S, [
    [0.26, 3.02], [0.44, 3.02], [0.44, 3.55], [0.62, 3.55], [1.02, 3.86], [1.02, X_EPAULE - 0.1], [0.5, X_EPAULE - 0.1], [0.26, X_EPAULE - 0.1], [0.26, 3.02],
  ].map(([r, x]) => [r, x + dx]), ACIER, CY, z, 32),
  /** Coupelle (40) : caoutchouc, lèvre vers l'avant. */
  coupelle: (S, z, dx) => tourX(S, [
    [0.45, 3.2], [0.95, 3.2], [1.118, 3.08], [1.118, 3.6], [0.66, 3.6], [0.45, 3.6], [0.45, 3.2],
  ].map(([r, x]) => [r, x + dx]), 'rubber', CY, z, 40),
  /** Rondelle de retenue (44). */
  retenue: (S, z, dx) => tourX(S, [[0.45, 3.02], [0.82, 3.02], [0.9, 3.1], [0.9, 3.19], [0.45, 3.19], [0.45, 3.02]].map(([r, x]) => [r, x + dx]), ACIER, CY, z, 32),
  /** Écrou de retenue à fentes (43), vissé sur le porte-piston. */
  ecrouRetenue: (S, z, dx) => {
    const g = S.group(tourX(S, [[0.45, 2.72], [0.68, 2.72], [0.68, 3.01], [0.45, 3.01], [0.45, 2.72]].map(([r, x]) => [r, x + dx]), SOMBRE, CY, z, 28));
    // Quatre fentes pour l'outil à ergots (A5049).
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      g.add(S.box(0.1 * IN, 0.16 * IN, 0.16 * IN, 'blackOxide', { pos: pos(2.725 + dx, CY + 0.6 * Math.sin(a), z + 0.6 * Math.cos(a)) }));
    }
    return g;
  },
  /** Écrou six pans 1/2-13 du bout de la tige (42). */
  ecrou: (S, z, dx) => ecrou(S, VIS, 'x', 2.5 + dx, CY, z),
  /** Joint torique de tige (45) et sa bague porte-joint (60), derrière le porte-piston. */
  torique: (S, z, dx) => S.torus(0.281 * IN, 0.031 * IN, 'rubber', { axis: 'x', pos: pos(X_EPAULE - 0.05 + dx, CY, z) }),
  porteJoint: (S, z, dx) => tourX(S, [[0.32, X_EPAULE - 0.1], [0.52, X_EPAULE - 0.1], [0.52, X_EPAULE + 0.08], [0.385, X_EPAULE + 0.08], [0.385, X_EPAULE], [0.32, X_EPAULE], [0.32, X_EPAULE - 0.1]].map(([r, x]) => [r, x + dx]), 'brass', CY, z, 28),
};

/** Siège de clapet (39) : douille conique et cage ouverte à quatre doigts ; pied du siège à la hauteur y. */
function siege(S, material, y, z) {
  const g = S.group(tourY(S, [[0.4, y], [0.66, y], [0.7, y + 0.5], [0.7, y + 0.6], [0.48, y + 0.6], [0.4, y + 0.52], [0.4, y]], material, 0, z, 32));
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + Math.PI / 4;
    g.add(S.box(0.1 * IN, 0.6 * IN, 0.2 * IN, material, { pos: pos(0.6 * Math.cos(a), y + 0.9, z + 0.6 * Math.sin(a)), rot: [0, -a, 0] }));
  }
  return g;
}
const Y_SIEGE = { aspiration: 2.77, refoulement: 6.62 };
/** Centre de la bille posée sur son siège (portée de Ø 0,8 po). */
const yBille = (y) => y + 0.52 + Math.sqrt((RELEVE.bille / 2) ** 2 - 0.4 ** 2);

/** Couvercle de clapet (49) : chapeau et tige qui limite la levée de la bille. */
function couvercleClapet(S, material, z) {
  const y1 = RELEVE.collecteur.y1;
  return tourY(S, [[0, y1 - 1.25], [0.5, y1 - 1.25], [0.5, y1 - 0.5], [0.66, y1 - 0.5], [0.66, y1 + 0.03], [0.93, y1 + 0.03], [0.93, y1 + 0.32], [0.8, y1 + 0.38], [0, y1 + 0.38]], material, 0, z, 36);
}
const Y_BRIDE_CLAPET = { y0: RELEVE.collecteur.y1 + 0.48, y1: RELEVE.collecteur.y1 + 1.48 };
const X_GOUJON_CLAPET = 0.97;

/** Bride de couvercle de clapet (51) : barre le long de la pompe, deux trous de goujon, bossage d'appui dessous. */
function brideClapet(S, material, z) {
  const { y0, y1 } = Y_BRIDE_CLAPET;
  const g = S.group(aPlat(S, rect(-1.53, 1.53, z - 0.62, z + 0.62, 0.3), y0, y1, material, [[-X_GOUJON_CLAPET, z, 0.28], [X_GOUJON_CLAPET, z, 0.28]]));
  g.add(tourY(S, [[0, RELEVE.collecteur.y1 + 0.38], [0.3, RELEVE.collecteur.y1 + 0.38], [0.55, y0 + 0.02], [0, y0 + 0.02]], material, 0, z, 20));
  return g;
}

/** Bouchon d'aspiration 1 1/2 po NPT (48), tête six pans en dessous. */
function bouchonAspiration(S, material, z) {
  return S.group(
    tourY(S, [[0, 1.02], [0.93, 1.02], [0.94, 1.8], [0, 1.8]], material, 0, z, 28),
    sixPans(S, 1.75, 0.67, 1.02, material, 'y', 0, 0, z),
  );
}

/** Bouchon de tuyau (47), vissé dans la face avant de la boîte vis-à-vis d'un siège de clapet. */
function bouchonTuyau(S, material, y, z) {
  return S.group(
    S.cyl(0.27 * IN, 0.5 * IN, material, { axis: 'x', seg: 16, pos: pos(X_FACE + 0.24, y, z) }),
    sixPans(S, 0.5625, X_FACE - 0.26, X_FACE - 0.01, material, 'x', 0, y, z),
  );
}

/**
 * Extrémité hydraulique (figure 3) : boîte à clapets, clapets à billes, culasses et leurs brides, chemises et pistons.
 */
export function P03(api) {
  const S = api.S;
  const seen = new Set();
  const put = (ref, obj, explode) => { api.part(ref, obj, explode, { noLabel: seen.has(ref) }); seen.add(ref); };
  const AV = -1, HAUT = 1;

  put('38', boiteAClapets(S, PEINT), [0, 0, 0]);
  ZC.forEach((z, i) => {
    const dx = recul(i);
    const e = (z / RELEVE.pas) * 0.03; // les trois cylindres s'écartent un peu en travers
    put('54', culasse(S, PEINT, z), [AV * 0.2, 0, e]);
    put('55', S.ring(1.42 * IN, 1.0 * IN, 0.03 * IN, 'copper', { axis: 'x', seg: 36, pos: pos(X_FACE - 0.015, CY, z) }), [AV * 0.15, 0, e]);
    put('56', chemise(S, z), [0.2, 0, e]);
    put('46', jointChemise(S, RELEVE.chemise.x0 - 0.02, z), [0.14, 0, e]);
    put('46', jointChemise(S, RELEVE.chemise.x1 + 0.02, z), [0.26, 0, e]);
    // Piston, sorti par l'avant du cylindre.
    put('42', piston.ecrou(S, z, dx), [AV * 0.27, 0, e]);
    put('43', piston.ecrouRetenue(S, z, dx), [AV * 0.33, 0, e]);
    put('44', piston.retenue(S, z, dx), [AV * 0.38, 0, e]);
    put('40', piston.coupelle(S, z, dx), [AV * 0.43, 0, e]);
    put('41', piston.porte(S, z, dx), [AV * 0.5, 0, e]);
    put('45', piston.torique(S, z, dx), [AV * 0.56, 0, e]);
    put('60', piston.porteJoint(S, z, dx), [AV * 0.6, 0, e]);
    // Clapets : aspiration en bas, refoulement en haut ; siège, bille, et bouchon de tuyau en face.
    put('39', siege(S, 'steel', Y_SIEGE.aspiration, z), [0, -0.22, e]);
    put('62', S.ball((RELEVE.bille / 2) * IN, 'chrome', { pos: pos(0, yBille(Y_SIEGE.aspiration), z) }), [0, -0.13, e]);
    put('39', siege(S, 'steel', Y_SIEGE.refoulement, z), [0, HAUT * 0.13, e]);
    put('62', S.ball((RELEVE.bille / 2) * IN, 'chrome', { pos: pos(0, yBille(Y_SIEGE.refoulement), z) }), [0, HAUT * 0.2, e]);
    put('47', bouchonTuyau(S, VIS, yBille(Y_SIEGE.aspiration) + 0.05, z), [AV * 0.12, -0.03, e]);
    put('47', bouchonTuyau(S, VIS, yBille(Y_SIEGE.refoulement) - 0.25, z), [AV * 0.12, 0.03, e]);
    // Couvercle de clapet, joint, bride, goujons et écrous.
    put('50', S.ring(0.95 * IN, 0.68 * IN, 0.03 * IN, 'copper', { axis: 'y', seg: 32, pos: pos(0, RELEVE.collecteur.y1 + 0.015, z) }), [0, HAUT * 0.25, e]);
    put('49', couvercleClapet(S, PEINT, z), [0, HAUT * 0.3, e]);
    put('51', brideClapet(S, PEINT, z), [0, HAUT * 0.4, e]);
    for (const s of [-1, 1]) {
      const x = s * X_GOUJON_CLAPET, y0 = RELEVE.collecteur.y1 - 0.6;
      put('52', S.cyl(0.25 * IN, (COTE.haut - y0) * IN, VIS, { axis: 'y', seg: 14, pos: pos(x, (COTE.haut + y0) / 2, z) }), [0, HAUT * 0.12, e]);
      put('53', ecrou(S, VIS, 'y', x, Y_BRIDE_CLAPET.y1 + 0.22, z), [0, HAUT * 0.5, e]);
    }
  });
  // Bouchons d'aspiration : deux des trois orifices sont bouchés (celui du milieu reçoit la conduite).
  for (const z of [ZC[0], ZC[2]]) put('48', bouchonAspiration(S, VIS, z), [0, -0.25, 0]);
  // Brides de culasse, goujons et écrous.
  for (const b of BRIDES) put('57', brideCulasse(S, PEINT, b), [AV * 0.32, 0, (b.z / RELEVE.pas) * 0.03]);
  for (const g of GOUJONS) {
    const long = AVEC_BRIDE(g);
    put(long ? '58' : '59', goujon(S, VIS, g, long), [0.1, 0, 0]);
    put('61', ecrou(S, VIS, 'x', (long ? X_BRIDE.x0 : X_FACE) - 0.22, g.y, g.z), [AV * (long ? 0.42 : 0.1), 0, 0]);
  }
  return { view: { dir: [-1, 0.55, -0.9] } };
}

// ------------------------------------------------------------------ extrémité mécanique

const B = RELEVE.bati;
// Boîtiers de palier : vis sur un cercle, bride en triangle (vue de côté de la figure 7).
const PALIER = { r: 2.35, angles: [180, 60, -60], trou: 1.9, jeu: 0.06, bride: 0.32 }; // jeu : joint et cales
const BOITIER = { r: 1.55, angles: [150, 30, 270], trou: 1.12 };
const X_FOND = 6.05; // cloison entre le berceau des garnitures et les glissières de crosse
const R_GLISSIERE = COTE.crosse / 2 + 0.012;

/** Bâti (1) : bride avant, berceau des garnitures, glissières des crosses, carter à joues, bride arrière et pattes. */
function bati(S, material) {
  const t = B.tronc, g = S.group();
  const face = rect(-t.z, t.z, t.y0, t.y1, 0.25);
  const alesages = ZC.map((z) => [z, CY, R_GLISSIERE + 0.01]);
  // Bride avant : lamages des chemises.
  g.add(selonX(S, face, B.x0, 4.87, material, ZC.map((z) => [z, CY, RELEVE.chemise.ro + 0.025])));
  // Berceau : auge ouverte vers le haut (sous la plaque de visite), où l'on atteint les écrous de garniture.
  g.add(selonX(S, [[-t.z, t.y0], [t.z, t.y0], [t.z, t.y1], [4.85, t.y1], [4.85, 3.85], [-4.85, 3.85], [-4.85, t.y1], [-t.z, t.y1]], 4.87, X_FOND, material));
  // Glissières des crosses, jusque dans le carter.
  g.add(selonX(S, face, X_FOND, t.x1, material, alesages));
  // Carter : paroi du dessus et de l'avant, fond incliné ; ouvert vers l'arrière.
  const zi = B.z - 0.35;
  g.add(selonZ(S, [[B.bride, B.haut], [11.6, B.haut], [9.85, 9.3], [9.75, t.y1], [10.1, t.y1], [10.2, 9.08], [11.72, 9.5], [B.bride, 9.5]], -zi, zi, material));
  g.add(selonZ(S, [[t.x1, t.y0], [11.3, t.y0], [13.3, B.fond], [B.bride, B.fond], [B.bride, 1], [13.45, 1], [11.45, 3.48], [t.x1, 3.48]], -zi, zi, material));
  // Joues : silhouette du carter, percées pour les paliers du vilebrequin et de l'arbre d'entrée.
  const joue = [[B.bride, B.haut], [11.6, B.haut], [9.85, 9.3], [9.75, t.y1], [9.75, t.y0], [11.3, t.y0], [13.3, B.fond], [B.bride, B.fond]];
  for (const s of [-1, 1]) {
    const z0 = s > 0 ? zi : -B.z;
    g.add(selonZ(S, joue, z0, z0 + 0.35, material, [[XV, CY, PALIER.trou], [AR.x, AR.y, BOITIER.trou]]));
  }
  // Bride arrière, autour de l'ouverture du carter.
  g.add(selonX(S, rect(-5.93, 5.93, 0.12, 10.43, 0.45), B.bride, B.x1, material, [rect(-4.95, 4.95, 1, 9.5, 0.5)]));
  // Pattes : deux pieds à l'avant, un talon sur toute la largeur à l'arrière, nervures sous les glissières.
  const fa = COTE.fixation.avant;
  for (const s of [-1, 1]) {
    g.add(selonZ(S, [[4.32, 0], [5.84, 0], [6.4, t.y0], [4.1, t.y0]], s * fa.z - 0.675, s * fa.z + 0.675, material));
    g.add(selonZ(S, [[6.3, t.y0], [11.3, t.y0], [13.3, B.fond], [13, 0.75], [6.5, 2.75]], s * fa.z - 0.2, s * fa.z + 0.2, material));
  }
  g.add(selonZ(S, [[16.3, B.fond], [16.9, 0], [B.x1, 0], [B.x1, B.fond]], -B.z, B.z, material));
  // Goulot de remplissage, au-dessus du vilebrequin.
  g.add(tourY(S, [[0.6, B.haut - 0.05], [0.86, B.haut - 0.05], [0.86, 10.46], [0.6, 10.46], [0.6, B.haut - 0.05]], material, XV, 0, 28));
  return g;
}

/** Garniture de tige (8 à 11) : porte-joint à collerette dans la cloison, deux joints à lèvre, écrou et joint plat. */
const garniture = {
  porte: (S, z) => tourX(S, [[0.75, 5.3], [0.9, 5.3], [0.9, X_FOND - 0.02], [R_GLISSIERE, X_FOND - 0.02], [R_GLISSIERE, X_FOND + 0.2], [0.42, X_FOND + 0.2], [0.42, X_FOND - 0.05], [0.75, X_FOND - 0.05], [0.75, 5.3]], ACIER, CY, z, 32),
  joint: (S, z, x) => S.ring(0.74 * IN, 0.375 * IN, 0.22 * IN, 'rubber', { axis: 'x', seg: 28, pos: pos(x, CY, z) }),
  ecrou: (S, z) => tourX(S, [[0.42, 5.0], [0.95, 5.0], [0.95, 5.28], [0.42, 5.28], [0.42, 5.0]], SOMBRE, CY, z, 12),
  plat: (S, z) => S.ring((R_GLISSIERE - 0.02) * IN, 0.82 * IN, 0.03 * IN, 'cream', { axis: 'x', seg: 32, pos: pos(X_FOND - 0.035, CY, z) }),
};

/** Crosse et tige (7) : crosse creuse de Ø 2,750 po, tige de 3/4 po, bout fileté 1/2-13 pour le piston. */
function crosse(S, z, i) {
  const xp = xPied(CALAGE[i]); // axe de pied de bielle
  const dx = recul(i);
  const R = COTE.crosse / 2;
  const g = S.group(tourX(S, [
    [0, xp - 1.5], [R - 0.06, xp - 1.5], [R, xp - 1.44], [R, xp + 0.6], [R - 0.3, xp + 0.6], [R - 0.3, xp - 0.95], [0, xp - 0.95],
  ], ACIER, CY, z, 44));
  g.userData.hasInterior = true;
  g.add(tourX(S, [[0, 2.3 + dx], [0.25, 2.3 + dx], [0.25, X_EPAULE + dx], [0.375, X_EPAULE + dx], [0.375, xp - 1.49], [0, xp - 1.49]], 'chrome', CY, z, 24));
  // Bossages de l'axe de pied de bielle, de part et d'autre de la bielle.
  for (const s of [-1, 1]) g.add(S.cyl(0.8 * IN, 0.42 * IN, ACIER, { axis: 'z', seg: 24, pos: pos(xp, CY, z + s * 0.86) }));
  return g;
}

/** Bielle (4) : œil de pied bagué, corps en I, tête en deux moitiés serrées par deux boulons de 7/16 po. */
function bielle(S, z, i) {
  const a = CALAGE[i];
  const xp = xPied(a), xm = XV + EXC * Math.cos(a), ym = CY + EXC * Math.sin(a);
  const inc = Math.atan2(ym - CY, xm - xp);
  const L = BIELLE, r1 = 0.82, r2 = COTE.maneton / 2 + 0.36;
  // Profil dans le repère de la bielle : pied à l'origine, tête en (L, 0).
  const corps = [...arc(0, 0, r1, 270, 90, 12), ...arc(L, 0, r2, 150, -150, 22)];
  const g = S.group(S.extrude(m(corps), 1.25 * IN, SOMBRE, { holes: trous([[0, 0, COTE.axePied / 2 + 0.06], [L, 0, COTE.maneton / 2 + 0.07]]) }));
  // Boulons du chapeau, parallèles au corps, de part et d'autre du maneton.
  for (const s of [-1, 1]) {
    g.add(S.cyl(0.22 * IN, 2.9 * IN, VIS, { axis: 'x', seg: 12, pos: pos(L + 0.15, s * (r2 + 0.32), 0) }));
    g.add(S.box(2.3 * IN, 0.62 * IN, 0.9 * IN, SOMBRE, { pos: pos(L + 0.1, s * (r2 + 0.3), 0) }));
    g.add(S.nut(0.6875 * IN, 0.38 * IN, VIS, { axis: 'x', pos: pos(L + 1.5, s * (r2 + 0.32), 0) }));
  }
  const pose = S.group(g);
  pose.rotation.z = inc;
  pose.position.set(...pos(xp, CY, z));
  return pose;
}

/** Coussinet de tête de bielle (5), autour de l'excentrique. */
function coussinet(S, z, i) {
  const a = CALAGE[i];
  return S.shell((COTE.maneton / 2 + 0.065) * IN, (COTE.maneton / 2 + 0.004) * IN, 1.25 * IN, 'brass', { axis: 'z', seg: 44, pos: pos(XV + EXC * Math.cos(a), CY + EXC * Math.sin(a), z) });
}

/** Vilebrequin (2) : arbre, trois excentriques de Ø 2,874 po calés à 120°, roue dentée et portées des roulements coniques. */
function vilebrequin(S) {
  const g = S.group();
  const disque = (r, z0, z1, material = ACIER) => g.add(S.cyl(r * IN, (z1 - z0) * IN, material, { axis: 'z', seg: 48, pos: pos(XV, CY, (z0 + z1) / 2) }));
  // Tourillons des roulements coniques et flasques (les manetons débordent de l'axe : pas d'arbre traversant).
  const lm = 1.3, rf = EXC + COTE.maneton / 2 + 0.05;
  disque(0.75, -5.2, -(RELEVE.pas + lm / 2));
  disque(0.75, RELEVE.pas + lm / 2, 5.2);
  disque(rf, -4.5, -(RELEVE.pas + lm / 2));
  disque(rf, RELEVE.pas + lm / 2, 4.5);
  disque(rf, -(RELEVE.pas - lm / 2), -lm / 2);
  disque(rf, lm / 2, RELEVE.pas - lm / 2);
  ZC.forEach((z, i) => {
    const a = CALAGE[i];
    g.add(S.cyl((COTE.maneton / 2) * IN, (lm + 0.02) * IN, ACIER, { axis: 'z', seg: 48, pos: pos(XV + EXC * Math.cos(a), CY + EXC * Math.sin(a), z) }));
  });
  const d = DENTURE, mod = (2 * d.pignon) / d.z1;
  g.add(S.gear((d.roue - 1.25 * mod) * IN, (d.roue + mod) * IN, d.z2, d.largeur * IN, SOMBRE, { axis: 'z', pos: pos(XV, CY, ZROUE) }));
  return g;
}

/** Arbre d'entrée (3) : pignon taillé dans l'arbre, portées des roulements, bout de Ø 1 1/8 po à rainure de clavette. */
function arbreEntree(S) {
  const d = DENTURE, mod = (2 * d.pignon) / d.z1;
  const g = S.group(tourZ(S, [
    [0, -AR.bout], [AR.d / 2 - 0.04, -AR.bout], [AR.d / 2, -AR.bout + 0.04], [AR.d / 2, -5.75], [0.689, -5.75], [0.689, -4.85], [0.78, -4.85],
    [0.78, 4.85], [0.689, 4.85], [0.689, 5.5], [0, 5.5],
  ], ACIER, AR.x, AR.y, 32));
  g.add(S.gear((d.pignon - 1.25 * mod) * IN, (d.pignon + mod) * IN, d.z1, (d.largeur + 0.25) * IN, ACIER, { axis: 'z', hole: 0.7 * IN, pos: pos(AR.x, AR.y, ZROUE) }));
  return g;
}

/** Clavette (26) : 1/4 × 1/4 po, dans la rainure de 1,812 po du bout de l'arbre. */
function clavette(S) {
  const c = AR.clavette;
  return S.box(c.w * IN, c.w * IN, (c.len - 0.2) * IN, SOMBRE, { r: 0.02 * IN, pos: pos(AR.x, AR.y + AR.d / 2, -AR.bout + c.len / 2 + 0.05) });
}

/** Boîtier de palier du vilebrequin (12), borgne : bride en triangle à trois vis, cuvette du roulement. s : côté (±1). */
function boitierPalier(S, material, s) {
  const z0 = B.z + PALIER.jeu, z1 = z0 + PALIER.bride;
  const g = S.group();
  g.add(selonZ(S, triangle(PALIER.r, PALIER.angles, 0.62).map(([x, y]) => [XV + x, CY + y]), s > 0 ? z0 : -z1, s > 0 ? z1 : -z0, material,
    PALIER.angles.map((a) => [XV + PALIER.r * Math.cos((a * Math.PI) / 180), CY + PALIER.r * Math.sin((a * Math.PI) / 180), 0.2])));
  // Cuvette engagée dans la joue, qui porte la cuvette du roulement ; bossage central de la vis.
  g.add(S.shell((PALIER.trou - 0.02) * IN, 1.62 * IN, 1.0 * IN, material, { axis: 'z', seg: 40, pos: pos(XV, CY, s * (z0 - 0.5)) }));
  g.add(S.cyl(0.7 * IN, 0.05 * IN, material, { axis: 'z', seg: 24, pos: pos(XV, CY, s * (z1 + 0.025)) }));
  return g;
}

/** Roulement conique du vilebrequin : cuvette (24) dans le boîtier, cône (23) sur l'arbre. */
const palier = {
  cuvette: (S, s) => S.shell(1.6 * IN, 1.34 * IN, 0.68 * IN, ACIER, { axis: 'z', seg: 40, pos: pos(XV, CY, s * (B.z - 0.5)) }),
  cone: (S, s) => S.bearing(1.3 * IN, 0.75 * IN, 0.7 * IN, ACIER, { axis: 'z', pos: pos(XV, CY, s * (B.z - 0.62)) }),
};

/** Boîtier de l'arbre d'entrée : côté entraînement (17, traversé par l'arbre) ou borgne (18). */
function boitierArbre(S, material, s, borgne) {
  const z0 = B.z + 0.04, z1 = z0 + 0.34;
  const g = S.group();
  const centre = borgne ? [] : [[AR.x, AR.y, AR.d / 2 + 0.03]];
  g.add(selonZ(S, triangle(BOITIER.r, BOITIER.angles, 0.5).map(([x, y]) => [AR.x + x, AR.y + y]), s > 0 ? z0 : -z1, s > 0 ? z1 : -z0, material,
    [...centre, ...BOITIER.angles.map((a) => [AR.x + BOITIER.r * Math.cos((a * Math.PI) / 180), AR.y + BOITIER.r * Math.sin((a * Math.PI) / 180), 0.2])]));
  // Portée du roulement, engagée dans la joue.
  g.add(S.shell((BOITIER.trou - 0.02) * IN, 1.03 * IN, 0.4 * IN, material, { axis: 'z', seg: 36, pos: pos(AR.x, AR.y, s * (z0 - 0.2)) }));
  // Côté entraînement : nez du joint d'arbre, jusqu'à la face d'où l'arbre sort de 2,536 po.
  if (!borgne) g.add(S.shell(0.95 * IN, (AR.d / 2 + 0.03) * IN, (AR.bout - AR.saillie - z1) * IN, material, { axis: 'z', seg: 32, pos: pos(AR.x, AR.y, s * ((AR.bout - AR.saillie + z1) / 2)) }));
  else g.add(S.cyl(0.9 * IN, 0.1 * IN, material, { axis: 'z', seg: 32, pos: pos(AR.x, AR.y, s * (z1 + 0.05)) }));
  return g;
}

/** Vis à tête hexagonale 3/8-16 × 3/4 po (27), tête vers l'extérieur du côté s. */
function visBoitier(S, centre, c, angle, s, zTete) {
  const a = (angle * Math.PI) / 180;
  return S.bolt(0.375 * IN, 0.75 * IN, VIS, { axis: s > 0 ? 'z' : '-z', pos: pos(centre[0] + c.r * Math.cos(a), centre[1] + c.r * Math.sin(a), s * zTete) });
}

const BOMBE = { y0: 2.3, y1: 9.5, x0: B.x1 + 0.15, x1: RELEVE.avant + COTE.long }; // sommet du bombé : arrière hors tout
/** Profil du bombé du couvercle arrière : abscisse de la tôle à la hauteur y. */
const xBombe = (y) => BOMBE.x0 + (BOMBE.x1 - BOMBE.x0) * (1 - Math.abs((2 * (y - BOMBE.y0)) / (BOMBE.y1 - BOMBE.y0) - 1) ** 4);

/** Couvercle arrière (15) : tôle emboutie, bride plate et bombé qui dégage la roue dentée. */
function couvercleArriere(S, material) {
  const x0 = B.x1 + 0.03, x1 = BOMBE.x0;
  const g = S.group(selonX(S, rect(-5.9, 5.9, 0.25, 10.35, 0.45), x0, x1, material, [rect(-4.6, 4.6, 2.3, 9.5, 0.6)]));
  // Bombé en cuvette dans le plan XY (profil relevé sur la figure 2B), fermé par deux flasques.
  const ext = [], int = [];
  for (let k = 0; k <= 24; k++) {
    const y = BOMBE.y0 + ((BOMBE.y1 - BOMBE.y0) * k) / 24;
    ext.push([xBombe(y), y]);
    int.unshift([Math.max(x1, xBombe(y) - 0.1), y]);
  }
  g.add(selonZ(S, [...ext, ...int], -4.6, 4.6, material));
  for (const s of [-1, 1]) g.add(selonZ(S, ext, s > 0 ? 4.6 : -4.7, s > 0 ? 4.7 : -4.6, material));
  return g;
}

/** Positions des 14 vis du couvercle arrière, [z, y]. */
const VIS_COUVERCLE = [
  ...[-4.5, -1.5, 1.5, 4.5].flatMap((z) => [[z, 9.95], [z, 0.6]]),
  ...[2.8, 5.3, 7.8].flatMap((y) => [[-5.45, y], [5.45, y]]),
];

/** Robinet de niveau d'huile (19), vissé au bas du couvercle arrière. */
function robinet(S, x) {
  const y = 3.37;
  return S.group(
    sixPans(S, 0.5625, x, x + 0.3, 'brass', 'x', 0, y, 0),
    S.cyl(0.16 * IN, 0.75 * IN, 'brass', { axis: 'x', seg: 16, pos: pos(x + 0.65, y, 0) }),
    S.cyl(0.22 * IN, 0.5 * IN, 'brass', { axis: 'y', seg: 16, pos: pos(x + 0.72, y + 0.05, 0) }),
    S.box(0.1 * IN, 0.1 * IN, 0.8 * IN, 'brass', { pos: pos(x + 0.72, y + 0.34, 0.1) }),
  );
}

/**
 * Extrémité mécanique (figures 2A et 2B) : bâti, vilebrequin à excentriques, arbre d'entrée à pignon, bielles,
 * crosses, garnitures de tige, paliers et couvercles.
 */
export function P02(api) {
  const S = api.S;
  const seen = new Set();
  const put = (ref, obj, explode) => { api.part(ref, obj, explode, { noLabel: seen.has(ref) }); seen.add(ref); };
  const AR_ = 1; // vers l'arrière

  put('1', bati(S, PEINT), [0, 0, 0]);
  put('2', vilebrequin(S), [AR_ * 0.62, 0, 0]);
  put('3', arbreEntree(S), [0, 0.02, -0.5]);
  put('26', clavette(S), [0, 0.1, -0.5]);
  ZC.forEach((z, i) => {
    const e = (z / RELEVE.pas) * 0.04;
    put('4', bielle(S, z, i), [AR_ * 0.62, 0, e]);
    put('5', coussinet(S, z, i), [AR_ * 0.62, -0.18, e]);
    put('6', S.cyl((COTE.axePied / 2) * IN, 2.2 * IN, 'chrome', { axis: 'z', seg: 24, pos: pos(xPied(CALAGE[i]), CY, z) }), [AR_ * 0.5, 0.2, e]);
    put('30', S.cyl(0.156 * IN, 0.5 * IN, 'blackOxide', { axis: 'y', seg: 10, pos: pos(xPied(CALAGE[i]), CY - 1.02, z) }), [AR_ * 0.5, -0.12, e]);
    put('7', crosse(S, z, i), [AR_ * 0.38, 0, e]);
    // Garniture de tige, sortie par le berceau (vers le haut).
    put('8', garniture.porte(S, z), [0, 0.2, e]);
    put('9', garniture.joint(S, z, 5.55), [-0.02, 0.27, e]);
    put('9', garniture.joint(S, z, 5.82), [0.02, 0.27, e]);
    put('10', garniture.ecrou(S, z), [-0.06, 0.2, e]);
    put('11', garniture.plat(S, z), [-0.03, 0.14, e]);
    // Graisseur, sur le porte-joint, sous la plaque de visite.
    put('22', S.group(
      S.cyl(0.11 * IN, 0.3 * IN, 'brass', { axis: 'y', seg: 10, pos: pos(5.68, CY + 0.95, z) }),
      sixPans(S, 0.4375, CY + 1.1, CY + 1.28, 'brass', 'y', 5.68, 0, z),
      S.ball(0.1 * IN, 'brass', { pos: pos(5.68, CY + 1.36, z) }),
    ), [0, 0.42, e]);
  });
  // Paliers du vilebrequin : boîtier borgne, joint, cales, cuvette et cône, des deux côtés.
  let cales = 0;
  for (const s of [-1, 1]) {
    const ext = [0, 0, s * 0.3];
    put('12', boitierPalier(S, PEINT, s), ext);
    put('14', selonZ(S, triangle(PALIER.r, PALIER.angles, 0.62).map(([x, y]) => [XV + x, CY + y]), s > 0 ? B.z : -B.z - 0.02, s > 0 ? B.z + 0.02 : -B.z, 'cream', [[XV, CY, PALIER.trou]]), [0, 0, s * 0.2]);
    // Cinq cales de réglage au total : trois d'un côté, deux de l'autre.
    for (let k = 0; k < (s < 0 ? 3 : 2); k++, cales++) {
      const z = B.z + 0.02 + k * 0.013;
      put('13', selonZ(S, triangle(PALIER.r, PALIER.angles, 0.62).map(([x, y]) => [XV + x, CY + y]), s > 0 ? z : -z - 0.012, s > 0 ? z + 0.012 : -z, 'brass', [[XV, CY, PALIER.trou]]), [0, 0, s * (0.23 + k * 0.012)]);
    }
    put('24', palier.cuvette(S, s), [0, 0, s * 0.42]);
    put('23', palier.cone(S, s), [0, 0, s * 0.5]);
    put('34', S.bolt(0.5 * IN, 0.75 * IN, VIS, { axis: s > 0 ? 'z' : '-z', pos: pos(XV, CY, s * (B.z + PALIER.jeu + PALIER.bride + 0.05)) }), [0, 0, s * 0.36]);
    for (const a of PALIER.angles) put('27', visBoitier(S, [XV, CY], PALIER, a, s, B.z + PALIER.jeu + PALIER.bride), [0, 0, s * 0.36]);
    // Boîtiers de l'arbre d'entrée : côté entraînement (−Z) et côté borgne (+Z).
    put(s < 0 ? '17' : '18', boitierArbre(S, PEINT, s, s > 0), [0, 0, s * 0.3]);
    put('20', selonZ(S, triangle(BOITIER.r, BOITIER.angles, 0.5).map(([x, y]) => [AR.x + x, AR.y + y]), s > 0 ? B.z : -B.z - 0.04, s > 0 ? B.z + 0.04 : -B.z, 'cream', [[AR.x, AR.y, BOITIER.trou]]), [0, 0, s * 0.22]);
    put('25', S.bearing(1.1 * IN, 0.689 * IN, 0.55 * IN, ACIER, { axis: 'z', pos: pos(AR.x, AR.y, s * (B.z - 0.2)) }), [0, 0, s * 0.42]);
    for (const a of BOITIER.angles) put('27', visBoitier(S, [AR.x, AR.y], BOITIER, a, s, B.z + 0.38), [0, 0, s * 0.36]);
    // Bouchon de vidange, au bas de chaque joue.
    put('32', sixPans(S, 0.875, 0, 0.32, VIS, s > 0 ? 'z' : '-z', XV + 1.5, 1.45, s * B.z), [0, -0.05, s * 0.15]);
  }
  // Couvercle arrière, joint, vis et robinet de niveau.
  put('16', selonX(S, rect(-5.9, 5.9, 0.25, 10.35, 0.45), B.x1, B.x1 + 0.03, 'cream', [rect(-4.95, 4.95, 1, 9.5, 0.5)]), [AR_ * 0.2, 0, 0]);
  put('15', couvercleArriere(S, PEINT), [AR_ * 0.3, 0, 0]);
  for (const [z, y] of VIS_COUVERCLE) put('29', S.bolt(0.375 * IN, 0.5 * IN, VIS, { axis: 'x', pos: pos(B.x1 + 0.15, y, z) }), [AR_ * 0.4, 0, 0]);
  put('19', robinet(S, xBombe(3.37) - 0.04), [AR_ * 0.42, 0, 0]);
  // Dessus : bouchon de remplissage, plaque de visite et ses deux vis, plaque signalétique.
  put('33', S.group(
    tourY(S, [[0, 10.47], [1.18, 10.47], [1.18, 10.7], [1.05, COTE.haut - 0.595], [0, COTE.haut - 0.595]], 'blackOxide', XV, 0, 24),
    S.cyl(0.58 * IN, 0.5 * IN, 'blackOxide', { axis: 'y', seg: 20, pos: pos(XV, 10.22, 0) }),
  ), [0, 0.2, 0]);
  const t = B.tronc;
  put('31', aPlat(S, rect(B.x0 + 0.05, X_FOND + 0.25, -5.0, 5.0, 0.15), t.y1, t.y1 + 0.1, PEINT, [[5.1, -3.2, 0.11], [5.1, 3.2, 0.11]]), [0, 0.5, 0]);
  for (const z of [-3.2, 3.2]) put('28', S.bolt(0.19 * IN, 0.4 * IN, VIS, { axis: 'y', pos: pos(5.1, t.y1 + 0.1, z) }), [0, 0.6, 0]);
  const plaque = S.nameplate(3.2 * IN, 1.5 * IN);
  plaque.rotation.x = -Math.PI / 2;
  plaque.position.set(...pos(13, B.haut, -2.6));
  put('21', plaque, [0, 0.3, 0]);
  return { view: { dir: [-0.6, 0.6, -1] } };
}

/**
 * Pompe complète : extrémité mécanique et extrémité hydraulique, sur leurs goujons communs.
 */
export function P01(api) {
  api.part('A', api.sub('P02'), [0.12, 0, 0]);
  api.part('B', api.sub('P03'), [-0.22, 0, 0]);
  return { view: { dir: [-1, 0.6, -0.95] } };
}

export default { P01, P02, P03 };

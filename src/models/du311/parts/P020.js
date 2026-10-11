// P020 — Trousse de décalques ISO CP13001-DK1-ISO « ISO DECAL KIT ORION »
// (page 20 : « NO ILLUSTRATION AVAILABLE »), repère 7 de la finition P012.
// 25 lignes, 53 décalques adhésifs (0,4 mm) : pictogrammes ISO 3864 sans
// texte — triangle d'avertissement jaune bordé de noir en haut, rond bleu
// d'obligation ou rond rouge barré d'interdiction en bas, sur fond blanc
// (≈ 80 × 160 mm) ; carrés d'information jaunes (fluide hydraulique, air
// comprimé, remplissage d'huile, coupe-batterie, gazole) ; lettrage découpé
// (logos et « DU311-T », blancs côté −Z, gris côté +Z) et bandeau de l'avance
// ACCRA.
// Repère : celui de la machine P010 (frame.js, machine.js) — X vers l'avant
// (côté avance), Y vers le haut, +Z côté enrouleur ; pont du porteur à
// y = 0.76, mât dressé de x = 2.62 à 3.04 (pied à y = 0.6), flancs du mât à
// z = ±0.23. P012 insère la trousse à l'origine, P010 insère P012 à l'origine.
// Encombrement : x −2.01 à 2.78 (glissière : x 1.98–2.15), y 0.58 à 3.28, z −0.70 à 0.70.
// Faute de dessin, les emplacements sont estimés d'après le danger signalé et
// posés à plat sur les formes simplifiées de frame.js et machine.js :
//  · mât (flancs ±Z, colonne libre x 2.64–2.84) : entraînement en rotation,
//    pincement, éloignement du personnel, bandeau ACCRA ;
//  · glissière P168 (colonnes en caisson z = ±0.62 ± 0.05, x 1.98–2.24,
//    y 0.68–1.72) : laser sur la face extérieure (z = ±0.67) au-dessus du
//    disque du support de laser (y 1.13–1.27) et sous le bossage de la barre
//    haute (y 1.41) ; pincement sur la face arrière (x 1.98) des colonnes ;
//    plaque de liaison du mât P024 (face d'appui x 2.577, contre la bride de
//    l'actionneur) : pincement au-dessus des colonnes ;
//  · stabilisateurs : face extérieure du boîtier haut de chaque vérin ;
//  · réservoir hydraulique (face arrière x −2.0, face +Z, dessus), moteur
//    (face +Z, dessus), surpresseur (face −Z, dessus, carter de courroie),
//    réservoir d'air (Ø 0.5, flanc −Z et dessus) : chaleur, huile, air ;
//  · armoires électriques 18 (porte, flancs ±X) et porte-fiche 20 : haute
//    tension, coupe-batterie, arrêt d'urgence, lavage haute pression interdit ;
//  · longerons (faces z = ±0.68, au-dessus des chenilles) : logos, modèle,
//    gazole, flammes, fuite haute pression, opérateur qualifié, inhalation.

import { etiquettes } from './_glissiere_options.js';

const DECK = 0.76;
const MX = 2.74, MZ = 0.23; // colonne libre et flancs du mât
const RAIL = 0.68, RY = 0.665; // faces des longerons, milieu en hauteur

export default function P020(api) {
  const L = etiquettes(api);
  const put = (ref, obj, pos, n, d = 0.2, opts) => api.part(ref, L.stick(obj, pos, n, opts), n.map((v) => v * d));
  const T = 0.0004; // décalque adhésif

  // Gabarits
  const iso2 = (top, bottom, w = 0.08, h = 0.16) => L.label({ w, h, t: T, bg: 'white', ink: 'black', border: 'black', pics: [top, bottom], lines: 0, layout: 'v' });
  const iso1 = (pic, w = 0.08) => L.label({ w, h: w, t: T, bg: 'white', ink: 'black', pics: [pic], lines: 0 });
  const isoTxt = (pic, w, h, lines, seed) => L.label({ w, h, t: T, bg: 'white', ink: 'black', border: 'black', pics: [pic], lines, seed });
  const P = { X: [1, 0, 0], mX: [-1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1], mZ: [0, 0, -1] };
  const UPZ = { up: [0, 0, -1] }; // décalque sur un dessus, lisible depuis +Z
  const UPmZ = { up: [0, 0, 1] }; // lisible depuis −Z

  // ---------------------------------------------------------------- mât
  // 4 — entraînement en rotation (4) : flancs ±Z, haut du mât.
  for (const s of [1, -1]) {
    for (const y of [2.55, 3.2]) put('4', iso2(['warn', 'gear'], ['no', 'hand']), [MX, y, s * MZ], [0, 0, s], 0.25);
  }
  // 17 — pincement (6) : mât ±Z, faces arrière des colonnes de glissière
  // (+Z au-dessus du bloc de graissage), plaque de liaison du mât.
  put('17', iso2(['warn', 'rollers'], ['no', 'hand']), [MX, 1.45, MZ], P.Z, 0.25);
  put('17', iso2(['warn', 'rollers'], ['no', 'hand']), [MX, 1.25, -MZ], P.mZ, 0.25);
  put('17', iso2(['warn', 'rollers'], ['no', 'hand']), [1.98, 1.5, 0.62], P.mX, 0.25);
  put('17', iso2(['warn', 'rollers'], ['no', 'hand']), [1.98, 1.2, -0.62], P.mX, 0.25);
  for (const s of [1, -1]) put('17', iso2(['warn', 'rollers'], ['no', 'hand']), [2.577, 1.9, s * 0.15], P.mX, 0.25);
  // 10 — éloignement du personnel (3) : mât ±Z, arrière du réservoir hydraulique.
  put('10', iso2(['warn', 'person'], ['no', 'person']), [MX, 1.75, MZ], P.Z, 0.25);
  put('10', iso2(['warn', 'person'], ['no', 'person']), [MX, 1.95, -MZ], P.mZ, 0.25);
  put('10', iso2(['warn', 'person'], ['no', 'person']), [-2.0, DECK + 0.16, 0.54], P.mX, 0.25);
  // 20 — bandeau ACCRA (système d'avance) : flanc +Z du mât, en long.
  put('20', L.label({ w: 0.3, h: 0.06, t: T, bg: 'black', ink: 'white', header: null, lines: 2, seed: 20 }), [MX, 2.15, MZ], P.Z, 0.25, { spin: Math.PI / 2 });

  // ---------------------------------------------------------------- glissière et stabilisateurs
  // 16 — laser (2) : face extérieure des colonnes (z = ±0.67), juste
  // au-dessus du disque du support de laser P180 (x 2.11, y 1.2, Ø 0.14).
  for (const s of [1, -1]) put('16', iso1(['warn', 'laser'], 0.08), [2.11, 1.34, s * 0.67], [0, 0, s], 0.25);
  // 14 — vérins de stabilisateur (4) : face extérieure du boîtier haut de chaque vérin.
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) put('14', iso2(['warn', 'crush'], ['no', 'person']), [sx * 2.0, 0.66, sz * 0.7], [0, 0, sz], 0.2);
  }

  // ---------------------------------------------------------------- réservoir hydraulique (x −2.0…−1.5, y 0.76–1.36, z 0.13–0.63)
  put('1', isoTxt(['must', 'person'], 0.1, 0.14, 2, 1), [-2.0, DECK + 0.42, 0.54], P.mX, 0.25); // trois points d'appui
  put('2', iso1(['info', 'drop']), [-2.0, DECK + 0.42, 0.38], P.mX, 0.25);
  put('21', isoTxt(['estop', null], 0.08, 0.12, 1, 21), [-2.0, DECK + 0.42, 0.22], P.mX, 0.25);
  put('2', iso1(['info', 'drop']), [-1.62, DECK + 0.44, 0.63], P.Z, 0.2);
  put('12', iso2(['warn', 'jet'], ['must', 'hand']), [-1.88, DECK + 0.44, 0.63], P.Z, 0.2);
  put('8', iso1(['info', 'can'], 0.06), [-1.75, DECK + 0.6, 0.55], P.Y, 0.2, UPZ);

  // ---------------------------------------------------------------- moteur diesel (x −0.91…−0.19, y 0.79–1.45, z 0–0.5)
  put('6', iso2(['warn', 'waves'], ['no', 'hand']), [-0.35, DECK + 0.39, 0.5], P.Z, 0.2);
  put('8', iso1(['info', 'can'], 0.06), [-0.7, DECK + 0.69, 0.2], P.Y, 0.2, UPZ);
  put('6', iso2(['warn', 'waves'], ['no', 'hand']), [-0.45, DECK + 0.69, 0.2], P.Y, 0.2, UPZ);

  // ---------------------------------------------------------------- surpresseur, carter de courroie, réservoir d'air
  put('6', iso2(['warn', 'waves'], ['no', 'hand']), [0.0, DECK + 0.24, -0.34], P.mZ, 0.2);
  put('8', iso1(['info', 'can'], 0.06), [0.12, DECK + 0.38, -0.25], P.Y, 0.2, UPmZ);
  put('3', iso1(['info', 'air']), [0.3, DECK + 0.49, -0.45], P.mZ, 0.2);
  put('18', iso1(['must', 'ear']), [0.45, DECK + 0.49, -0.45], P.mZ, 0.2);
  // Réservoir d'air Ø 0.5 (axe X, centre y 0.95, z −0.24) : flanc −Z et dessus ;
  // décalque de 60 mm enfoncé de la moitié de sa flèche (0,9 mm).
  put('3', iso1(['info', 'air'], 0.06), [1.5, 0.95, -0.24 - 0.25 + 0.0009], P.mZ, 0.2);
  put('3', iso1(['info', 'air'], 0.06), [1.3, 0.95 + 0.25 - 0.0009, -0.24], P.Y, 0.2, UPmZ);

  // ---------------------------------------------------------------- armoires électriques 18 et porte-fiche 20
  // Porte de la grande armoire (face z 0.663), rangée basse.
  put('9', iso2(['warn', 'bolt'], ['no', 'hand']), [0.82, DECK + 0.25, 0.663], P.Z, 0.22);
  put('11', isoTxt(['must', 'book'], 0.08, 0.14, 2, 11), [0.94, DECK + 0.25, 0.663], P.Z, 0.22);
  put('21', isoTxt(['estop', null], 0.08, 0.12, 1, 22), [1.06, DECK + 0.25, 0.663], P.Z, 0.22);
  put('5', iso1(['info', 'battery']), [1.40, DECK + 0.24, 0.5], P.X, 0.22); // flanc +X
  put('19', iso1(['no', 'spray']), [0.70, DECK + 0.74, 0.48], P.mX, 0.22); // flanc −X, au-dessus de la petite armoire
  put('9', iso2(['warn', 'bolt'], ['no', 'hand']), [0.23, DECK + 0.34, 0.48], P.mX, 0.22); // petite armoire, flanc −X
  put('19', iso1(['no', 'spray']), [0.23, DECK + 0.12, 0.48], P.mX, 0.22);
  put('9', iso2(['warn', 'bolt'], ['no', 'hand'], 0.06, 0.12), [-2.01, DECK + 0.95, 0.58], P.mX, 0.25); // porte-fiche de l'enrouleur

  // ---------------------------------------------------------------- longerons
  // Côté −Z (de l'arrière vers l'avant).
  put('13', iso2(['warn', 'air'], ['must', 'mask'], 0.07, 0.14), [-1.7, RY, -RAIL], P.mZ, 0.2);
  put('24', L.lettering('DU311-T', 0.05, 'white'), [-1.15, RY, -RAIL], P.mZ, 0.2);
  put('7', isoTxt(['info', 'fuel'], 0.1, 0.05, 2, 7), [-0.35, RY, -RAIL], P.mZ, 0.2);
  put('15', iso1(['no', 'flame'], 0.07), [-0.22, RY, -RAIL], P.mZ, 0.2);
  put('22', L.lettering('SANDVIK', 0.06, 'white'), [0.3, RY, -RAIL], P.mZ, 0.2);
  put('11', isoTxt(['must', 'book'], 0.08, 0.14, 2, 12), [0.75, RY, -RAIL], P.mZ, 0.2);
  put('21', isoTxt(['estop', null], 0.08, 0.12, 1, 23), [1.05, RY, -RAIL], P.mZ, 0.2);
  // Côté +Z.
  put('25', L.lettering('DU311-T', 0.05, 'grey'), [-1.0, RY, RAIL], P.Z, 0.2);
  put('12', iso2(['warn', 'jet'], ['must', 'hand'], 0.07, 0.14), [0.55, RY, RAIL], P.Z, 0.2);
  put('23', L.lettering('SANDVIK', 0.06, 'grey'), [0.95, RY, RAIL], P.Z, 0.2);

  return { view: { dir: [0.9, 0.6, 1.2] } };
}

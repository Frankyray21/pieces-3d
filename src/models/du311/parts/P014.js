// P014 — Trousse d'étiquettes CM19200-LK16 « LABEL KIT, 5200D/ORION DRILL »
// (pages 14, 16 et 18 : « NO ILLUSTRATION AVAILABLE »), repère 3 de la
// finition P012. 71 lignes, 72 étiquettes : repérage des leviers des bancs de
// distributeurs, des manomètres du pupitre, des vidanges, des entrées d'air et
// d'eau et de quelques organes de l'avance et de la glissière.
// Repère : celui de la machine P010 (frame.js, machine.js) — X vers l'avant
// (côté avance), Y vers le haut, +Z côté enrouleur ; pont du porteur à
// y = 0.76, mât dressé de x = 2.62 à 3.04 (pied à y = 0.6). P012 insère la
// trousse à l'origine, P010 insère P012 à l'origine.
// Encombrement : de x = −1.97 (banc de translation) à 2.85 (flancs du mât),
// y = 0.65 à 3.49, z = −0.68 à 0.74.
// Faute de dessin, les emplacements sont estimés d'après la fonction de chaque
// étiquette et posés à plat sur les formes simplifiées de frame.js et
// machine.js :
//  · étiquettes de levier (≈ 42 × 28 mm, alu, texte noir, flèches) sous les
//    chapeaux de tiroir des bancs : mise en place 2 (8 sections, x 1.38–1.86,
//    faces z 0.48 / 0.36), forage 3 (6 sections, face z −0.58), forage 1
//    (face z −0.62), translation 11 sur le réservoir (7 sections, faces z
//    0.44 / 0.32) ;
//  · étiquettes de manomètres (noires, 80 × 22 mm) sous les trois manomètres
//    du panneau 13 (face z 0.74) ; les autres en grille de 3 colonnes sur la
//    porte de l'armoire 18 (face z 0.663, x 0.70–1.40) — pupitre de forage ;
//  · vidanges (blanches, goutte noire) au bas du réservoir hydraulique, du
//    moteur, du surpresseur, du réservoir d'air et de la pompe à eau ;
//  · entrées d'air (flanc −Z) et d'eau (flanc +Z) sur les longerons, à l'avant ;
//  · V-30 sur le flanc −Z du mât, graissage de glissière sur le flasque +Z de
//    la glissière (formes provisoires de machine.js, repère 3 de P010).
// Repères 2 à 5 (« LABEL » sans libellé) : sur le banc de translation.

import { etiquettes } from './_glissiere_options.js';

const DECK = 0.76;
const MAST = { x: 2.74, zs: 0.23, y0: 0.6 }; // milieu libre des flancs du mât, flancs à z = ±0.23

export default function P014(api) {
  const L = etiquettes(api);
  // Pose d'une étiquette : spec, point de la surface, normale ; éclatement selon la normale.
  const put = (ref, spec, pos, n, d = 0.18, opts) => api.part(ref, L.stick(L.label(spec), pos, n, opts), n.map((v) => v * d));

  // Gabarits
  const lever = (seed) => ({ w: 0.042, h: 0.028, bg: 'zinc', ink: 'black', lines: 2, arrows: true, seed });
  const gauge = (seed, w = 0.08, h = 0.022) => ({ w, h, bg: 'black', ink: 'white', border: 'white', lines: 1, seed });
  const panelGauge = (seed) => ({ w: 0.13, h: 0.032, bg: 'black', ink: 'white', border: 'white', lines: 2, seed });
  const warnLamp = (seed) => ({ w: 0.08, h: 0.022, bg: 'red', ink: 'white', lines: 1, seed });
  const drain = (seed) => ({ w: 0.075, h: 0.035, bg: 'white', ink: 'black', border: 'black', pics: [['plain', 'drop']], lines: 2, seed });
  const inlet = (seed, bg = 'black') => ({ w: 0.09, h: 0.035, bg, ink: 'white', pics: [['plain', 'arrows']], lines: 2, seed });

  // ---------------------------------------------------------------- bancs de distributeurs
  // Milieu de la section i d'un banc valveBank(n, sw) centré en cx.
  const sec = (cx, n, sw, i) => cx - (n * sw + 0.08) / 2 + 0.04 + sw * (i + 0.5);

  // Banc de mise en place 2 (8 sections, centre 1.62 / DECK+0.62 / 0.42, h 0.16,
  // d 0.12) : face +Z (chapeaux) — stingers, glissière, bras ; face −Z — pince et bras de tige.
  const b2 = { cx: 1.62, y: DECK + 0.62, zp: 0.48, zm: 0.36 };
  ['9', '10', '14', '15', '23', '40', '41', '53'].forEach((ref, i) => {
    put(ref, lever(10 + i), [sec(b2.cx, 8, 0.05, i), b2.y - 0.038, b2.zp], [0, 0, 1], 0.14);
  });
  ['49', '50', '51'].forEach((ref, i) => {
    put(ref, lever(20 + i), [sec(b2.cx, 8, 0.05, i), b2.y - 0.005, b2.zm], [0, 0, -1], 0.14);
  });

  // Banc de forage 3 (6 sections, centre 0.95 / DECK+0.18 / −0.52) : face −Z,
  // deux rangées sous les chapeaux.
  const b3 = { cx: 0.95, y: DECK + 0.18, z: -0.58 };
  ['13', '12', '11', '37', '28', '29'].forEach((ref, i) => {
    put(ref, lever(30 + i), [sec(b3.cx, 6, 0.05, i), b3.y - 0.005, b3.z], [0, 0, -1], 0.16);
  });
  ['66', '67', '7', '8', '6', '22'].forEach((ref, i) => {
    put(ref, lever(40 + i), [sec(b3.cx, 6, 0.05, i), b3.y - 0.045, b3.z], [0, 0, -1], 0.16);
  });
  // Banc de forage 1 (1 section, centre 1.32 / DECK+0.32 / −0.56) : inversion du forage.
  put('63', { ...lever(50), w: 0.052 }, [1.32, DECK + 0.315, -0.62], [0, 0, -1], 0.16);

  // Banc de translation 11 sur le réservoir (7 sections, centre −1.75 /
  // DECK+0.67 / 0.38, h 0.14) : face +Z, puis face −Z.
  const b11 = { cx: -1.75, y: DECK + 0.67, zp: 0.44, zm: 0.32 };
  ['21', '35', '70', '1', '34', '2', '3'].forEach((ref, i) => {
    put(ref, lever(60 + i), [sec(b11.cx, 7, 0.05, i), b11.y - 0.03, b11.zp], [0, 0, 1], 0.14);
  });
  ['4', '5'].forEach((ref, i) => {
    put(ref, lever(70 + i), [sec(b11.cx, 7, 0.05, i + 1), b11.y - 0.035, b11.zm], [0, 0, -1], 0.14);
  });

  // ---------------------------------------------------------------- manomètres
  // Panneau 13 (x 0.24–0.56, y DECK+0.17…0.43, face z 0.74), manomètres à
  // x 0.31 / 0.40 / 0.49 : air du réservoir, air de la mine, huile du
  // compresseur ; rangée doublée (CX0198xx) puis voyants de basse pression.
  const g13 = [0.31, 0.4, 0.49];
  [['25', '24', '30'], ['59', '60', '61']].forEach((row, j) => {
    row.forEach((ref, i) => put(ref, gauge(80 + j * 3 + i), [g13[i], DECK + 0.275 - j * 0.04, 0.74], [0, 0, 1], 0.2));
  });
  ['42', '43', '44'].forEach((ref, i) => put(ref, warnLamp(90 + i), [g13[i], DECK + 0.195, 0.74], [0, 0, 1], 0.2));

  // Porte de l'armoire 18 (pupitre de forage) : grille 3 × 6, colonnes à
  // x 0.86 / 1.04 / 1.22, rangées de y DECK+0.82 à DECK+0.57.
  ['16', '57', '17', '55', '64', '18', '54', '19', '19', '58', '20', '65', '26', '62', '27', '68'].forEach((ref, k) => {
    const col = k % 3, row = Math.floor(k / 3);
    put(ref, panelGauge(100 + k), [0.86 + col * 0.18, DECK + 0.82 - row * 0.05, 0.663], [0, 0, 1], 0.22);
  });
  // 52 — 110 V : sous la serrure de la porte.
  put('52', { w: 0.08, h: 0.03, bg: 'yellow', ink: 'black', border: 'black', pics: [['plain', 'bolt']], lines: 1, seed: 120 }, [1.27, DECK + 0.25, 0.663], [0, 0, 1], 0.22);

  // ---------------------------------------------------------------- vidanges
  put('33', drain(130), [-1.88, DECK + 0.07, 0.63], [0, 0, 1], 0.2); // réservoir hydraulique, face +Z
  put('32', drain(131), [-0.8, DECK + 0.08, 0.5], [0, 0, 1], 0.2); // moteur diesel, face +Z
  put('56', drain(132), [0.0, DECK + 0.06, -0.34], [0, 0, -1], 0.2); // surpresseur, face −Z
  // Réservoir d'air (Ø 0.5, axe X, centre y 0.95, z −0.24) : bas du flanc −Z.
  {
    const a = (-100 * Math.PI) / 180; // angle autour de X, depuis +Y
    const n = [0, Math.cos(a), Math.sin(a)];
    put('31', drain(133), [1.62, 0.95 + 0.25 * n[1], -0.24 + 0.25 * n[2]], n, 0.2);
  }
  // Pompe à eau (Ø 0.16, axe X, centre 1.5 / DECK+0.12 / 0.2) : flanc +Z.
  put('48', { ...drain(134), w: 0.065, h: 0.03 }, [1.5, DECK + 0.12, 0.28], [0, 0, 1], 0.2);

  // ---------------------------------------------------------------- organes divers
  // 45 — purge de la circulation inverse : face +Z de la purge manuelle 23.
  put('45', { w: 0.07, h: 0.035, bg: 'black', ink: 'white', lines: 2, seed: 140 }, [1.3, DECK + 0.6, 0.16], [0, 0, 1], 0.15);
  // 36 — lance de lavage : flanc +X du support de l'enrouleur 21, sous les flasques.
  put('36', { w: 0.08, h: 0.045, bg: 'black', ink: 'white', lines: 2, seed: 141 }, [-0.07, DECK + 0.68, -0.6], [1, 0, 0], 0.2);
  // Entrées d'air et d'eau : flancs des longerons à l'avant (faces z = ±0.68,
  // y 0.55–0.75, au-dessus des chenilles) ; air côté −Z (réservoir d'air,
  // tuyauterie d'air 27), eau côté +Z (pompe à eau 29, vanne 28).
  put('39', inlet(151), [1.3, 0.665, -0.68], [0, 0, -1], 0.25);
  put('71', inlet(152, 'red'), [1.45, 0.665, -0.68], [0, 0, -1], 0.25);
  put('46', inlet(153), [1.6, 0.665, -0.68], [0, 0, -1], 0.25);
  put('38', inlet(150, 'blue'), [1.3, 0.665, 0.68], [0, 0, 1], 0.25);
  // 47 — V-30 : flanc −Z du mât, en haut.
  put('47', { w: 0.1, h: 0.04, bg: 'black', ink: 'white', lines: 1, seed: 160 }, [MAST.x, MAST.y0 + 2.87, -MAST.zs], [0, 0, -1], 0.25);
  // 69 — points de graissage de la glissière : flasque +Z (z 0.57), sous le bloc de graissage.
  put('69', { w: 0.1, h: 0.07, bg: 'white', ink: 'black', border: 'black', pics: [['plain', 'can']], lines: 3, seed: 161 }, [2.38, 0.98, 0.57], [0, 0, 1], 0.25);

  return { view: { dir: [0.9, 0.7, 1.2] } };
}

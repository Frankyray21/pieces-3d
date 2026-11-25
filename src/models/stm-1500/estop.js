// P023 et P025 — Arrêt d'urgence à câble de la foreuse STM-1500 (pages 1.13 et 1.13.2).
//
// Interrupteur Telemecanique (Schneider Electric) XY2-CH, « H7 » sur l'étiquette (photo de la page 1.13.2) :
// corps jaune de 138 × 68 × 50 mm, couvercle bleu avec le bouton de réarmement et deux fenêtres (tension du câble,
// état des contacts : vert réarmé, jaune déclenché), soufflet et œil du levier au bout avant, presse-étoupe TSRC10
// puis raccords 2404-8-8 et 5406-12-8 au bout arrière (cotes des fiches du fabricant : 201 × 68 mm de l'œil au
// presse-étoupe). Posé sur son support UM-064-907GG (plaque d'appui, deux pattes, plaque porte-interrupteur à deux
// boutonnières et encoche, raccord 2404-12-12 au bout) au bout arrière du flanc −Z du mât (côté console), l'œil tourné
// vers l'avant. Le câble UM-064-925G court sur la longueur du mât, tendu de l'œil à la plaque d'attache UM-064-960G
// posée sur le flasque latéral avant de la plateforme, sous ses trois trous, près du pied (page 1.13.2, vue de côté), où il s'arrête par une
// virole sertie derrière l'oreille percée.
//
// Hauteur et écart du câble, relevés sur le modèle : le haut du flanc est balayé par les guides de la table (dès
// 0,865 m du sol), le bas par les brides du support d'avance (jusqu'à 0,784 m), et le boyau de recul du vérin
// d'avance longe le flanc −Z à 0,835 m sur la moitié arrière. Le câble passe entre les deux, à 0,795 m du sol et à
// 78 mm de la face du longeron, en dehors du boyau ; l'interrupteur, à la même hauteur, reste sous la table.
// Le flanc +Z est barré par la plaque en saillie percée de huit trous (x −0,25 m).
//
// Repère : celui de la foreuse (P010, layout.js) ; P023 et P025 s'y posent tels quels.
// Le garde-corps grillagé, son interrupteur de porte UM-102-1860AA et leur visserie ne sont pas montés.
import { lister, BEAM } from './layout.js';

const FACE = -0.277; // face extérieure du longeron −Z
const Y = 0.795, Z = -0.355; // axe du câble
// Interrupteur : corps de XB0 (arrière, presse-étoupe) à XB1 (avant, soufflet), centré sur l'axe du câble.
const SW = { x0: -1.5, x1: -1.362, h: 0.068, d: 0.05 };
const EYE_X = SW.x1 + 0.05; // œil du levier
const CABLE_X0 = SW.x1 + 0.084; // départ du câble (après la boucle et sa virole)
// Plaque d'attache sur le flasque avant de la plateforme (x 0,949 à 1,299, face à z −0,293).
const ATT = { x: 1.155, face: -0.293 };

// Plaque UM-064-960G : semelle contre le flasque, oreille percée perpendiculaire où passe le câble.
function plaque(api) {
  const { box, extrude, at, group } = api.S;
  const t = 0.006;
  const ear = [[0, 0.04], [0, -0.02], [0.055, -0.02], [0.073, -0.002], [0.073, 0.022], [0.055, 0.04]]; // (−z, y) depuis la semelle
  return group(
    // Semelle sous les trois trous de Ø 55 du flasque (y 0,8525 et plus).
    at(box(0.07, 0.056, t, 'red', { r: 0.003 }), [ATT.x, Y + 0.025, ATT.face - t / 2]),
    // Oreille : plan YZ (épaisseur selon X), du dos de la semelle jusqu'au-delà de l'axe du câble, trou de 12 mm.
    at(extrude(ear, 0.008, 'red', { holes: [[ATT.face - t - Z, 0, 0.006]] }), [ATT.x, Y, ATT.face - t], [0, Math.PI / 2, 0]),
  );
}

export function P025(api, opts = {}) {
  const { box, cyl, lathe, torus, nut, rod, extrude, at, group } = api.S;
  const P = lister(api, 'P025');
  const cx = (SW.x0 + SW.x1) / 2;
  const front = Z - SW.d / 2; // face du couvercle (−Z)

  // 1 — Interrupteur XY2-CH : corps jaune, couvercle bleu, bouton de réarmement, fenêtres, soufflet,
  // tête du levier et œil.
  const bellows = [[0.004, 0], [0.012, 0]];
  for (let k = 0; k < 4; k++) bellows.push([0.0135, 0.003 + k * 0.006], [0.0105, 0.006 + k * 0.006]);
  bellows.push([0.009, 0.026], [0.004, 0.026]);
  P('XY2-CH', group(
    at(box(SW.x1 - SW.x0, SW.h, SW.d, 'yellow', { r: 0.006 }), [cx, Y, Z]),
    at(box(0.092, 0.056, 0.004, 'bleuRoi', { r: 0.003 }), [cx + 0.008, Y, front - 0.002]),
    at(cyl(0.018, 0.004, 'umBlue', { axis: 'z', seg: 32 }), [cx + 0.014, Y, front - 0.005]),
    at(cyl(0.013, 0.004, 'bleuRoi', { axis: 'z', seg: 32 }), [cx + 0.014, Y, front - 0.008]),
    // Fenêtres : tension du câble (repère jaune à mi-course) et contacts (vert : réarmé).
    at(box(0.007, 0.022, 0.002, 'plastic'), [cx - 0.024, Y, front - 0.0045]),
    at(box(0.004, 0.007, 0.002, 'yellow'), [cx - 0.024, Y, front - 0.0055]),
    at(box(0.007, 0.022, 0.002, 'plastic'), [cx + 0.044, Y, front - 0.0045]),
    at(box(0.004, 0.012, 0.002, 'green'), [cx + 0.044, Y, front - 0.0055]),
    at(lathe(bellows, 'rubber', { axis: 'x', seg: 20 }), [SW.x1, Y, Z]),
    at(cyl(0.013, 0.012, 'steel', { axis: 'z', seg: 24 }), [SW.x1 + 0.036, Y, Z]),
    at(nut(0.013, 0.006, 'steel', { axis: 'z' }), [SW.x1 + 0.036, Y, Z - 0.009]),
    at(box(0.016, 0.006, 0.006, 'steel', { r: 0.002 }), [EYE_X - 0.006, Y, Z]),
    at(torus(0.006, 0.0022, 'steel', { axis: 'z' }), [EYE_X + 0.004, Y, Z]),
  ), [0, 0, -0.1]);

  // 2 — Câble UM-064-925G : boucle passée dans l'œil et virole, câble tendu le long du mât, virole d'arrêt
  // devant l'oreille de la plaque d'attache.
  P('UM-064-925G', group(
    at(torus(0.007, 0.002, 'zinc', { axis: 'y' }), [EYE_X + 0.009, Y, Z]),
    at(cyl(0.0045, 0.018, 'zinc', { axis: 'x', seg: 12 }), [CABLE_X0 - 0.011, Y, Z]),
    rod([CABLE_X0 - 0.003, Y, Z], [ATT.x + 0.02, Y, Z], 0.0024, 'zinc', 10),
    at(cyl(0.005, 0.02, 'zinc', { axis: 'x', seg: 12 }), [ATT.x + 0.017, Y, Z]),
  ), [0, -0.12, -0.12]);

  // 3 — Presse-étoupe TSRC10 vissé dans le bout arrière du corps : écrou et dôme.
  P('TSRC10', group(
    at(nut(0.024, 0.01, 'zinc', { axis: 'x' }), [SW.x0 - 0.005, Y, Z]),
    at(lathe([[0, 0], [0.0115, 0], [0.0115, 0.012], [0.009, 0.024], [0, 0.024]], 'zinc', { axis: '-x', seg: 20 }), [SW.x0 - 0.01, Y, Z]),
  ), [-0.05, 0, -0.1]);
  // 4 — 2404-8-8 (MJIC 8 × MP 8) : six-pans de 7/8 po et embouts.
  P('2404-8-8', group(
    at(cyl(0.0075, 0.012, 'steel', { axis: 'x', seg: 14 }), [SW.x0 - 0.037, Y, Z]),
    at(nut(0.022, 0.011, 'steel', { axis: 'x' }), [SW.x0 - 0.049, Y, Z]),
    at(cyl(0.007, 0.014, 'steel', { axis: 'x', seg: 14 }), [SW.x0 - 0.061, Y, Z]),
  ), [-0.1, 0, -0.1]);
  // 5 — 5406-12-8 (MP 12 × FP 8) : six-pans de 1 1/4 po et filetage NPT 3/4 po.
  P('5406-12-8', group(
    at(nut(0.032, 0.014, 'steel', { axis: 'x' }), [SW.x0 - 0.075, Y, Z]),
    at(lathe([[0, 0], [0.0135, 0], [0.0125, 0.025], [0, 0.025]], 'steel', { axis: '-x', seg: 20 }), [SW.x0 - 0.082, Y, Z]),
  ), [-0.15, 0, -0.1]);

  // 6 — Plaque d'attache UM-064-960G (posée avec le garde-corps, P023, quand l'ensemble est sur la foreuse).
  if (opts.plaque !== false) P('UM-064-960G', plaque(api), [0.1, 0, -0.08]);

  // 7 — Support UM-064-907GG : plaque d'appui contre le longeron, deux pattes, plaque porte-interrupteur à deux
  // boutonnières et encoche au bout avant.
  const bx = [SW.x0 - 0.015, SW.x1 + 0.017], by = [Y - 0.03, Y + 0.02], back = Z + SW.d / 2; // dos de l'interrupteur
  const slot = (y) => [[SW.x0 + 0.004, y - 0.0025], [SW.x0 + 0.094, y - 0.0025], [SW.x0 + 0.094, y + 0.0025], [SW.x0 + 0.004, y + 0.0025]];
  const top = [[bx[0], by[0]], [bx[1], by[0]], [bx[1], Y - 0.019], [bx[1] - 0.014, Y - 0.005], [bx[1] - 0.014, Y + 0.001], [bx[1], Y + 0.015], [bx[1], by[1]], [bx[0], by[1]]];
  P('UM-064-907GG', group(
    at(box(bx[1] - bx[0], by[1] - by[0], 0.006, 'red', { r: 0.002 }), [(bx[0] + bx[1]) / 2, (by[0] + by[1]) / 2, FACE - 0.003]),
    ...[bx[0] + 0.02, bx[1] - 0.02].map((x) => at(box(0.025, 0.025, FACE - back - 0.012, 'red', { r: 0.002 }), [x, Y - 0.005, (FACE + back) / 2])),
    at(extrude(top, 0.006, 'red', { holes: [slot(Y - 0.014), slot(Y + 0.014)] }), [0, 0, back + 0.003]),
  ), [0, 0, 0.06]);
  // 8 — 2404-12-12 (MJIC 12 × MP 12) au bout arrière de la plaque porte-interrupteur.
  P('2404-12-12', group(
    at(nut(0.027, 0.013, 'steel', { axis: 'x' }), [bx[0] - 0.0065, Y - 0.022, back + 0.003]),
    at(cyl(0.0095, 0.022, 'steel', { axis: 'x', seg: 14 }), [bx[0] - 0.024, Y - 0.022, back + 0.003]),
  ), [-0.08, -0.03, 0.06]);
  return { view: { dir: [0.35, 0.45, -1] } };
}

// P023 — Garde-corps (page 1.13) : seul l'arrêt d'urgence à câble est monté (plaque d'attache et ensemble UM-064-1300SS).
export function P023(api) {
  const P = lister(api, 'P023');
  P('UM-064-960G', plaque(api), [0.1, 0, -0.08]);
  P('UM-064-1300SS', api.sub('P025', { plaque: false }), [0, 0, -0.1]);
  return { view: { dir: [0.35, 0.45, -1] } };
}

export const ESTOP = { y: Y, z: Z, x: [SW.x0 - 0.107, ATT.x + 0.04], beamX0: BEAM.x0 };

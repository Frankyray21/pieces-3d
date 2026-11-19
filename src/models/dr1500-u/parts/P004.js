// P004 — Mât 1500M MA601 (page 4), repère foreuse, mât rentré (posé à l'identité par P002).
// Mécano-soudé : deux longerons-caissons (âmes de 3/8 po, semelles de 3/4 po) ouverts entre eux, traverses basses,
// plaque de pied hexagonale à l'avant (encoche du passage des tiges, deux trous oblongs en bas ; cf. couverture),
// goussets du pied, oreilles des pattes d'extension (P002 rep. 8), portée du serre-tiges (plaque percée aux sept trous
// du plan p. 25), languette sous le mât pour la tige du vérin d'avance du mât (P003 rep. 8), plaque d'about arrière
// haute (couverture) avec les oreilles du pivot du kit de poulie (P006) et le passage du fût du vérin d'avance ;
// fenêtres et bossages des flancs, plaquettes oblongues (p. 4). Plaques d'usure MP6019 (rep. 2) vissées par 2 × 19
// vis fraisées 1/2-13 × 3/4 po (rep. 6). Pin MA611 Ø 2 1/2 po (rep. 3) en travers du bas des longerons, dans deux
// paliers lisses 6391K688 (rep. 7), arrêtée par le stoppeur MP6059 (rep. 4) et une vis 3/4-10 × 1 1/2 po (rep. 5).
// Vérin d'avance DR-FE3560H (rep. 8) logé entre les longerons : œil transversal de la tige sur la pin MA611, bride
// carrée du presse-étoupe, fût, selle sous la table, bossage d'orifices, fond et coude (p. 4) ; fermé, table en avant.
// Cotes : layout.js (MAST, RCB, PATTE) et _structure.js (section MS, vérin FEED, pivot PF) ; le reste [estimé] en
// ligne. Éclaté comme la p. 4 : plaques d'usure et vis vers le haut, vérin au-dessus, pin vers −Z, stoppeur vers +Z.
import { IN, MAST, RCB, PATTE, TABLE, POULIE } from '../layout.js';
import { MS, FEED, HCL, PF, END_TOP, rect, arc, hull, circle, slot, profilX, profilZ, boxAt, flatHead, sleeve, headPin } from './_structure.js';

const ASSISE_PIN_R = 0.625 * IN + 0.0005; // trou de la pin MA621 Ø 1 1/4 po [manuel]

export default function P004(api) {
  const S = api.S;
  const { at, group, box, cyl, ring, shell, nut, bolt } = S;
  const xF = MAST.xFoot, xR = MAST.xRear, yb = MAST.bottom, yt = MAST.top;
  const tFoot = MAST.footPlate.t, xFi = xF - tFoot; // face arrière de la plaque de pied
  const tEnd = 0.02, xRi = xR + tEnd; // plaque d'about arrière [estimé]
  const pinX = FEED.pinX, pinR = MAST.feedPin / 2;

  // 1 — Mât MA601 (mécano-soudé).
  const m = [];
  for (const s of [-1, 1]) {
    const Z = (a, b) => [s * a, s * b];
    const zz = (a) => s * a;
    // Semelles basse et haute, âmes intérieure et extérieure (de la plaque de pied à la plaque d'about).
    m.push(boxAt(api, [xRi, yb, zz(MS.zi)], [xFi, MS.yBot, zz(MS.zb)]));
    m.push(boxAt(api, [xRi, MS.yTopB, zz(MS.zi)], [xFi, MS.yTop, zz(MS.zt)]));
    const webH = [[pinX, FEED.y, pinR + 0.001]];
    m.push(profilZ(api, rect(xRi, MS.yBot, xFi, MS.yTopB), webH, MS.web, zz(MS.zi + MS.web / 2)));
    // Âme extérieure : deux fenêtres longues vers l'arrière (p. 4), trou du palier de la pin MA611.
    const win = [[-1.95, -1.62], [-1.52, -1.19]].map(([a, b]) => rect(a, 0.885, b, 0.985).reverse());
    m.push(profilZ(api, rect(xRi, MS.yBot, xFi, MS.yTopB), [...win, [pinX, FEED.y, 0.0366]], MS.web, zz(MS.zw + MS.web / 2)));
    // Bossage du palier (Ø 4 1/4 po) sur l'âme extérieure.
    m.push(at(ring(0.054, 0.0366, 0.016, 'red', { axis: 'z', seg: 28 }), [pinX, FEED.y, zz(MS.zw + MS.web + 0.008)]));
    // Plaquettes oblongues des flancs (trois, p. 4) et deux bossages ronds près des fenêtres.
    for (const x of [0.5, -0.3, -1.05]) m.push(at(box(0.1, 0.045, 0.008, 'red', { r: 0.012 }), [x, 0.935, zz(MS.zw + MS.web + 0.004)]));
    for (const x of [-1.07, -1.58]) m.push(at(ring(0.022, 0.011, 0.01, 'red', { axis: 'z', seg: 18 }), [x, 0.975, zz(MS.zw + MS.web + 0.005)]));
    // Goussets du pied : sous le mât (de la plaque de pied au dessous du longeron) et au-dessus (jusqu'aux oreilles
    // hautes de la plaque de pied), dans le plan de l'âme extérieure.
    m.push(profilZ(api, [[xFi, 0.66], [xFi, yb], [xF - 0.32, yb]], [], 0.019, zz(0.175)));
    m.push(profilZ(api, [[xFi, yt], [xF - 0.2, yt], [xFi, 1.25]], [], 0.019, zz(0.19)));
    // Oreilles des pattes d'extension (chape de deux tôles de 1/2 po sur la face arrière de la plaque de pied).
    for (const dz of [-0.03, 0.03]) {
      const c = PATTE.top;
      m.push(profilZ(api, hull([[xFi, c[1] - 0.05], [xFi, c[1] + 0.035], ...circle(c, 0.035, 18)]), [[c[0], c[1], 0.0165]], 0.5 * IN, zz(PATTE.z + dz)));
    }
  }
  // Traverses basses entre les âmes intérieures (le fût du vérin d'avance s'y appuie).
  for (const x of [-1.9, -1.2, -0.5, 0.75]) m.push(boxAt(api, [x - 0.03, yb, -MS.zi], [x + 0.03, yb + 0.012, MS.zi]));
  // Languette de la tige du vérin d'avance du mât (P003 rep. 8, pin MA621) : traverse basse et tôle de 1 po.
  m.push(boxAt(api, [HCL.xRod - 0.06, yb, -MS.zi], [HCL.xRod + 0.06, yb + 0.012, MS.zi]));
  m.push(profilZ(api, [[HCL.xRod - 0.05, yb + 0.006], [HCL.xRod - 0.05, HCL.y], ...arc([HCL.xRod, HCL.y], 0.05, Math.PI, 2 * Math.PI, 10), [HCL.xRod + 0.05, yb + 0.006]],
    [[HCL.xRod, HCL.y, ASSISE_PIN_R]], 1.0 * IN, 0));
  // Entretoises hautes aux deux bouts (le haut reste ouvert entre les longerons sur la course de la table).
  m.push(boxAt(api, [xRi, MS.yTopB, -MS.zi], [xRi + 0.06, MS.yTop, MS.zi]));
  // Portée du serre-tiges (base 55-4000, P025) : plaque de 1/2 po au niveau des plaques d'usure, sept trous taraudés
  // 5/8-11 au gabarit du plan p. 25, lumière oblongue (p. 4).
  {
    const x0 = MS.xWear[1] + 0.012, len = xFi - x0, cx = (x0 + xFi) / 2;
    const holes = RCB.holes.map(([x, z]) => [RCB.x + x - cx, z, 0.0069]);
    const lum = [[RCB.x - 0.06 - cx, -0.09, 0.07, 0.022]];
    m.push(at(S.plate(len, MAST.w, MS.wear.t, 'red', { holes, cutouts: lum, r: 0.004 }), [cx, MS.yTop + MS.wear.t / 2, 0]));
  }
  // Plaque de pied hexagonale : encoche en U du passage des tiges, deux trous oblongs en bas, trous de fixation.
  {
    const notch = arc([0, 1.25], 0.085, 0, -Math.PI, 12);
    const out = [[-0.12, 0.58], [0.12, 0.58], [0.275, 0.8], [0.275, 1.2], [0.18, 1.33], [0.085, 1.33], ...notch, [-0.085, 1.33], [-0.18, 1.33], [-0.275, 1.2], [-0.275, 0.8]];
    const holes = [slot([0.075, 0.69], 0.05, 0.022, Math.PI / 2), slot([-0.075, 0.69], 0.05, 0.022, Math.PI / 2),
      ...[[0.22, 0.9], [-0.22, 0.9], [0.22, 1.12], [-0.22, 1.12], [0.17, 1.27], [-0.17, 1.27]].map(([z, y]) => [z, y, 0.011])];
    m.push(profilX(api, out, holes, tFoot, xF - tFoot / 2));
  }
  // Plaque d'about arrière : haute au milieu (couverture), passage du fût du vérin d'avance, trou d'allègement.
  m.push(profilX(api, [[-0.23, yb], [0.23, yb], [0.23, yt], [0.14, yt], [0.1, END_TOP], [-0.1, END_TOP], [-0.14, yt], [-0.23, yt]],
    [[0, FEED.y, 0.068], [0, 1.16, 0.03]], tEnd, xR + tEnd / 2));
  // Oreilles du pivot du kit de poulie (boulon 1/2-13, P006 rep. 14) et butée du ressort (P006 rep. 15).
  {
    const [px, py] = PF.pivotAbs;
    for (const [z0, z1] of PF.ears) {
      m.push(profilZ(api, hull([[xR + 0.001, py - 0.05], [xR + 0.001, py + 0.05], ...circle([px, py], 0.03, 16)]), [[px, py, 0.0068]], z1 - z0, (z0 + z1) / 2));
    }
    m.push(at(cyl(0.024, 0.008, 'red', { axis: 'x', seg: 20 }), [xR - 0.004, POULIE.pos[1] + PF.springY, PF.z[1] + 0.022]));
  }
  // Cordons de soudure des goussets et de la plaque de pied.
  for (const s of [-1, 1]) m.push(S.weld([[xFi - 0.002, yb, s * 0.175], [xFi - 0.002, 0.66, s * 0.175]], 0.005, 'red'));
  api.part('1', group(...m), [0, 0, 0]);

  // 2 — Plaques d'usure MP6019 (×2), 19 trous fraisés chacune ; 6 — vis fraisées 1/2-13 × 3/4 po (×38).
  const [wx0, wx1] = MS.xWear, wl = wx1 - wx0, wcx = (wx0 + wx1) / 2, pitch = wl / 19;
  const xs = Array.from({ length: 19 }, (_, k) => wx0 + pitch * (k + 0.5));
  for (const s of [-1, 1]) {
    const holes = xs.map((x) => [x - wcx, 0, 0.0112]);
    api.part('2', at(S.plate(wl, MS.wear.w, MS.wear.t, 'darkSteel', { holes, r: 0.003 }), [wcx, MS.yTop + MS.wear.t / 2, s * MAST.wearZ]), [0, 0.8, s * 0.12]);
  }
  for (const s of [-1, 1]) {
    for (const x of xs) api.part('6', at(flatHead(api, 0.5 * IN, 0.75 * IN), [x, yt, s * MAST.wearZ]), [0, 1.15, s * 0.2], { noLabel: x !== xs[9] });
  }

  // 3 — Pin MA611 Ø 2 1/2 po en travers du bas des longerons (tête du côté −Z) ; 7 — paliers lisses 6391K688
  // (×2) dans les bossages des âmes extérieures ; 4 — stoppeur MP6059 et 5 — vis 3/4-10 × 1 1/2 po du côté +Z.
  const zOut = MS.zw + MS.web + 0.016; // face extérieure des bossages
  api.part('3', at(headPin(api, pinR, 2 * zOut, 'steel', { headR: 0.045, headT: 0.02, hole: false }), [pinX, FEED.y, -zOut], [-Math.PI / 2, 0, 0]), [0, 0, -0.55]);
  for (const s of [-1, 1]) {
    api.part('7', at(sleeve(api, 0.0366, pinR, 2 * IN, 'brass'), [pinX, FEED.y, s * (zOut - 0.0254)], [Math.PI / 2, 0, 0]), [0, 0, s * 0.3]);
  }
  api.part('4', at(group(cyl(0.045, 0.5 * IN, 'red', { axis: 'z', seg: 28 }), cyl(0.011, 0.0135, 'black', { axis: 'z', seg: 12 })), [pinX, FEED.y, zOut + 0.25 * IN]), [0, 0, 0.4]);
  api.part('5', bolt(0.75 * IN, 1.5 * IN, 'zinc', { axis: 'z', pos: [pinX, FEED.y, zOut + 0.5 * IN] }), [0, 0, 0.55]);

  // 8 — Vérin d'avance DR-FE3560H (fermé) : œil transversal (alésage de la pin), tige chromée, presse-étoupe à bride
  // carrée et quatre vis, fût noir, selle d'accrochage sous la table (plaque MP6018, P005 rep. 5), bossage à deux
  // orifices, fond et coude d'alimentation.
  {
    const y = FEED.y, r = FEED.r, eyeX = pinX, glandX = pinX - 0.11, capX = pinX - FEED.closed;
    const v = [
      at(ring(0.05, pinR + 0.0005, 0.075, 'black', { axis: 'z', seg: 28 }), [eyeX, y, 0]),
      at(box(0.05, 0.055, 0.06, 'black', { r: 0.004 }), [eyeX - 0.05, y, 0]),
      at(cyl(FEED.rodR, glandX - eyeX + 0.075, 'chrome', { axis: 'x', seg: 24 }), [(glandX + eyeX - 0.075) / 2 + 0.0, y, 0]),
      at(box(0.035, 0.125, 0.125, 'black', { r: 0.005 }), [glandX - 0.0175, y, 0]),
      S.boltSet([[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => [glandX, y + a * 0.047, b * 0.047]), 0.5 * IN, 0.03, 'zinc', { axis: 'x', washer: false }),
      at(shell(r, r - 0.008, glandX - 0.035 - capX - 0.04, 'black', { axis: 'x', seg: 32 }), [(glandX - 0.035 + capX + 0.04) / 2, y, 0]),
      at(cyl(r * 1.06, 0.04, 'black', { axis: 'x', seg: 32 }), [capX + 0.02, y, 0]),
      at(S.fitting(0.019, 0.05, 'steel', { axis: 'y', elbow: true }), [capX + 0.02, y + r * 1.06 + 0.012, 0]),
      // Selle d'accrochage sous la table : bloc en U sur le fût, deux trous taraudés.
      at(box(0.14, FEED.saddleTop - y, 0.09, 'black', { r: 0.004 }), [TABLE.x, (FEED.saddleTop + y) / 2, 0]),
      // Bossage à deux orifices vers l'arrière (p. 4).
      at(box(0.09, 0.022, 0.05, 'black', { r: 0.004 }), [capX + 0.42, y + r + 0.006, 0]),
      ...[-0.02, 0.02].map((dx) => at(nut(0.022, 0.01, 'steel'), [capX + 0.42 + dx, y + r + 0.022, 0])),
      // Bossage d'orifice du côté tige (près du presse-étoupe).
      at(box(0.03, 0.022, 0.04, 'black', { r: 0.003 }), [glandX - 0.07, y + r + 0.006, 0]),
      at(nut(0.022, 0.01, 'steel'), [glandX - 0.07, y + r + 0.022, 0]),
    ];
    api.part('8', group(...v), [0, 0.45, -0.35]);
  }
  return { view: { dir: [0.9, 0.75, -1.2] } };
}


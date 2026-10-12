// P098 — Cadre de montage du carrousel 6 pi CX037205 rév. 0 (page 98) :
// « ASSY, CAROUSEL MOUNTING FRAME - 6FT », repère 17 de l'avance P028.
// Mécano-soudure (9, CX037206) au dos du mât et du carrousel : deux âmes
// latérales pleine hauteur à lumières oblongues (l'âme -X s'avance jusqu'au
// dos du mât et porte les deux pattes de fixation à trous oblongs, chacune
// avec deux vis de calage carrées 3/4-10 × 2 3/4 (17), contre-écrous (27) et
// rondelles Nord-Lock (22) dans des noix soudées), plaque avant percée, cinq
// traverses en U au dos, plaques d'extrémité, butées soudées sur l'âme -X.
// Sur le prolongement arrière des âmes, les deux barres de guidage 6 pi (4,
// CX036189) qui coulissent dans les patins du MCP, chacune serrée par treize
// vis H 5/8-11 × 2 (15), têtes noyées dans les lamages de la face de
// glissement, rondelles Nord-Lock (21) sous tête et sous écrou (26). En bas,
// entre les prolongements des âmes, le support du vérin d'extension (5,
// CX036336) : semelle de 1 po vissée sous la plaque d'extrémité par deux vis
// H 1-8 × 2 1/2 (16) et rondelles Nord-Lock (23), deux joues percées garnies
// de bagues roulées 2 × 2 3/8 × 1 po (3, CP10023), axe d'extension Ø 2 po
// (1, CM77302-1) à plaquette d'arrêt traversée par une vis H 1/2-13 × 4 1/2
// (14), rondelles plates (18) et Nord-Lock (20), écrou (25) ; quatre goupilles
// à collerette ovale (6, CX036342) passées dans les âmes jusqu'aux sabots
// d'about du support, chaque collerette vissée par une vis H 3/8-16 × 3/4
// (11) à rondelle Nord-Lock (19) et une vis H 1/2-13 × 3/4 (12) à rondelle
// (20). Au bas des âmes, côté MCP, les déflecteurs des boyaux du MCP (7 côté
// gauche +X, 8 côté droit -X : cornières cintrées, quatre vis H 1/2-13 × 1
// (13) et rondelles (20) chacun). Sur la plaque avant, trois colliers
// caoutchoutés Ø 1 1/4 (2, CP001250-20) d'une conduite, vis H 3/8-16 × 5/8
// (10) et rondelles Nord-Lock larges (24).
// Repère : celui de l'avance (placé à l'identité par P028). Cadre de y = 0,35
// à 2,65 (FEED.frame), barres de guidage à x = 0,085 et 0,615 (FEED.frame.xc ±
// bar), z de -0,44 à -0,30 ; axe du vérin d'extension (œil du fût du vérin du
// MCP) en EYE_TOP (0,35 ; 2,50 ; -0,39), selon X : support en haut du cadre
// comme sur le dessin de la page 98 (œil de tige du vérin, P156). La face avant du cadre
// est à z = -0,23 pour laisser libre le cercle du carrousel (FEED.car) ;
// seule l'âme -X rejoint le dos du mât (z = -0,16).
// Encombrement ≈ 0.70 (X) × 2.53 (Y) × 0.29 (Z) m.
// Cotes : visserie (liste) ; barres 1 3/16 × 5 1/2 po × 6 pi (../feed.js),
// tôles et support d'après les proportions des vues de la page 98.
import { FEED } from '../feed.js';
import { L, u, IN, along, hhcs, hexNut, nordLock, flatWasher, sqss } from '../../du311/parts/_avance_b.js';
import { slabX, slabY, slabZ, sheet, arc, roundRect, nlT, nordLockSP, rolledBushing } from './_feedcent.js';

const F = FEED.frame;
const WL = [0.100, 0.1127], WR = [0.5873, 0.600]; // âmes (x)
const ZB = -0.445, ZF = -0.23, ZM = F.z0; // arrière des âmes, avant du cadre, dos du mât
const ZK = -0.30; // dos du caisson (traverses)
const BAR = { x: [[0.070, 0.100], [0.600, 0.630]], z: [-0.44, -0.30], y: [0.505, 0.505 + 72 * IN] };
const EYE = [F.xc, 0.50, -0.39]; // axe du vérin d'extension tel que dessiné (sous le cadre)
/** Axe de la chape du vérin d'extension posé (haut du cadre, repère de l'avance). */
export const EYE_TOP = [EYE[0], F.y0 + F.y1 - EYE[1], EYE[2]];
const CHEEK = { gap: 1.4 * IN, t: 1.0 * IN }; // jour et épaisseur des joues du support

export default function P098(api) {
  const { THREE, S } = api;
  const { merged, group, at, weld } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const W = (pts, size = 0.005) => weld(pts, size, 'lightGrey');
  const rect = (a0, b0, a1, b1) => [[a0, b0], [a1, b0], [a1, b1], [a0, b1]];
  const oblong = (ca, cb, la, lb, n = 6) => {
    // lumière oblongue (grand axe selon b) dans un plan (a, b)
    const r = la / 2;
    return [...arc(ca, cb - lb / 2 + r, r, Math.PI, 2 * Math.PI, n), ...arc(ca, cb + lb / 2 - r, r, 0, Math.PI, n)];
  };
  const { y0, y1 } = F;

  // ================================================ 9 — cadre (mécano-soudure)
  const plates = [], beads = [];
  // Âmes latérales (plan YZ, contour [z, y]) à quatre lumières oblongues.
  const winY = [0.78, 1.26, 1.74, 2.22];
  plates.push(sheetX([[ZB, y0], [ZM, y0], [ZM, y1], [ZB, y1]], WL, winY.map((y) => oblong(-0.25, y, 0.045, 0.26))));
  plates.push(sheetX([[ZB, y0], [ZF, y0], [ZF, y1], [ZB, y1]], WR, winY.map((y) => oblong(-0.265, y, 0.04, 0.26))));
  function sheetX(pts, [x0, x1], holes) {
    const m = sheet(S, THREE, pts.map(([z, y]) => [-z, y]), x1 - x0, 'lightGrey', holes.map((h) => h.map(([z, y]) => [-z, y])));
    m.rotation.y = Math.PI / 2;
    m.position.x = (x0 + x1) / 2;
    return m;
  }
  // Plaque avant (3/8 po) entre les âmes, trois découpes oblongues.
  const fp = sheet(S, THREE, rect(WL[1], y0 + 0.0127, WR[0], y1 - 0.0127), 0.0095, 'lightGrey', [0.85, 1.5, 2.15].map((y) => roundRect(F.xc, y, 0.2, 0.42, 0.04, 4)));
  fp.position.z = ZF - 0.0048;
  plates.push(fp);
  // Traverses en U (6 × 2 po, ailes vers l'avant) au dos du caisson.
  const TRV = [0.62, 1.07, 1.52, 1.97, 2.42];
  for (const y of TRV) {
    const h = 0.076, fl = 0.05, t = 0.0055;
    const prof = [[ZK, y - h], [ZK + fl, y - h], [ZK + fl, y - h + t], [ZK + t, y - h + t], [ZK + t, y + h - t], [ZK + fl, y + h - t], [ZK + fl, y + h], [ZK, y + h]];
    plates.push(slabX(S, prof, WL[1], WR[0], 'lightGrey'));
    for (const x of [WL[1] + 0.003, WR[0] - 0.003]) beads.push(W([[x, y - h, ZK - 0.003], [x, y + h, ZK - 0.003]], 0.006));
  }
  // Plaques d'extrémité : basse de 1 po (taraudages des vis 16), haute de 1/2 po.
  plates.push(slabY(S, rect(WL[1], ZK, WR[0], ZF - 0.0095), y0, y0 + 0.0254, 'lightGrey'));
  plates.push(slabY(S, rect(WL[1], ZK, WR[0], ZF - 0.0095), y1 - 0.0127, y1, 'lightGrey'));
  // Butées soudées sur la face extérieure de l'âme -X.
  for (const y of [0.62, 1.1, 1.58, 2.06, 2.54]) plates.push(S.box(0.012, 0.075, 0.055, 'lightGrey', { r: 0.008, pos: [WL[0] - 0.006, y, -0.2] }));
  // Pattes de fixation au dos du mât (côté -X) : tôle 1/2 po à quatre trous
  // oblongs, deux noix soudées dessous pour les vis de calage.
  const BRK = [0.72, 2.28];
  for (const y of BRK) {
    const slots = [[-0.035, 0.05], [-0.035, -0.05], [0.04, 0.05], [0.04, -0.05]].map(([x, dy]) => oblong(x, y + dy, 0.021, 0.034, 4));
    const bp = sheet(S, THREE, roundRect(0.022, y, 0.17, 0.2, 0.012, 3), 0.0127, 'lightGrey', slots);
    bp.position.z = ZM - 0.0064;
    plates.push(bp);
    for (const x of [-0.035, 0.05]) plates.push(S.box(0.032, 0.026, 0.038, 'lightGrey', { pos: [x, y - 0.113, ZM - 0.019] }));
    beads.push(W([[WL[0] - 0.003, y - 0.1, ZM - 0.016], [WL[0] - 0.003, y + 0.1, ZM - 0.016]], 0.006));
  }
  // Cordons principaux : âmes / plaque avant, âmes / plaques d'extrémité.
  for (const x of [WL[1] + 0.003, WR[0] - 0.003]) {
    beads.push(W([[x, y0 + 0.03, ZF - 0.012], [x, y1 - 0.03, ZF - 0.012]], 0.006));
    beads.push(W([[x, y0 + 0.028, ZK + 0.005], [x, y0 + 0.028, ZF - 0.012]], 0.006));
  }
  const frame = merged(plates, 'lightGrey');
  frame.userData.hasInterior = true;
  const fw = merged(beads, 'lightGrey');
  fw.geometry.userData.edgeAngle = 75;
  P('9', group(frame, fw), [0, 0, 0]);

  // ================================================ 4 — barres de guidage, 15 / 21 / 26
  // Barre 1 3/16 × 5 1/2 po : lamages Ø 1 1/4 × 0,47 po sur la face de glissement,
  // trous Ø 11/16 ; bouts chanfreinés.
  const NB = 13, pitch = (BAR.y[1] - BAR.y[0] - 0.1) / (NB - 1);
  const boltY = Array.from({ length: NB }, (_, i) => BAR.y[0] + 0.05 + i * pitch);
  const zb = -0.37;
  BAR.x.forEach(([xa, xb], i) => {
    const out = i === 0 ? -1 : 1; // face de glissement vers l'extérieur
    const xo = out < 0 ? xa : xb, xi = out < 0 ? xb : xa; // face extérieure, face d'appui
    const xc = xo - out * 0.012; // fond des lamages
    const ch = 0.004;
    const prof = [[BAR.z[0], BAR.y[0] + ch], [BAR.z[0] + ch, BAR.y[0]], [BAR.z[1] - ch, BAR.y[0]], [BAR.z[1], BAR.y[0] + ch], [BAR.z[1], BAR.y[1] - ch], [BAR.z[1] - ch, BAR.y[1]], [BAR.z[0] + ch, BAR.y[1]], [BAR.z[0], BAR.y[1] - ch]];
    const holesCb = boltY.map((y) => [zb, y, 0.0159]);
    const holesTh = boltY.map((y) => [zb, y, 0.0087]);
    const bar = merged([
      slabX(S, prof, Math.min(xo, xc), Math.max(xo, xc), 'steel', holesCb),
      slabX(S, prof, Math.min(xc, xi), Math.max(xc, xi), 'steel', holesTh),
    ], 'steel');
    P('4', bar, [out * 0.12, 0, -0.08]);
    const web = out < 0 ? WL : WR;
    const xin = out < 0 ? web[1] : web[0]; // face intérieure de l'âme
    for (const y of boltY) {
      P('21', along(THREE, nordLock(S, THREE, 0.625), [out, 0, 0], [xc, y, zb]), [out * 0.18, 0, -0.08]);
      P('15', along(THREE, hhcs(S, THREE, 0.625, 2.0), [out, 0, 0], [xc + out * u(nlT(0.625)), y, zb]), [out * 0.24, 0, -0.08]);
      P('21', along(THREE, nordLock(S, THREE, 0.625), [-out, 0, 0], [xin, y, zb]), [-out * 0.06, 0, 0]);
      P('26', along(THREE, hexNut(S, THREE, 0.625), [-out, 0, 0], [xin - out * u(nlT(0.625)), y, zb]), [-out * 0.1, 0, 0]);
    }
  });

  // ================================================ 5 — support du vérin d'extension (haut du cadre)
  // Dessiné sous la plaque d'extrémité basse, puis retourné d'un demi-tour autour
  // de Z sur l'axe du cadre (x = EYE.x, y = mi-hauteur) : semelle sur la plaque
  // d'extrémité haute, joues pendantes, axe en EYE_TOP (page 98).
  const YM = (y0 + y1) / 2;
  const PM = (ref, obj, e) => {
    const g = group(obj);
    g.rotation.z = Math.PI;
    g.position.set(2 * EYE[0], 2 * YM, 0);
    return P(ref, g, e && [-e[0], -e[1], e[2]]);
  };
  const [ex, ey, ez] = EYE;
  const mount = [];
  // Semelle 1 po sous la plaque d'extrémité, prolongée entre les âmes vers le MCP.
  const MS = { z0: -0.44, z1: -0.25, yb: y0 - 0.0254 };
  mount.push(slabY(S, rect(WL[1], MS.z0, WR[0], MS.z1), MS.yb, y0, 'lightGrey', [[ex - 0.08, -0.275, 0.0135], [ex + 0.08, -0.275, 0.0135]]));
  // Sabots d'about (goupilles 6) contre les âmes.
  for (const [xa, xb] of [[WL[1], WL[1] + 0.04], [WR[0] - 0.04, WR[0]]]) mount.push(slabX(S, rect(MS.z0, y0, -0.31, y0 + 0.1), xa, xb, 'lightGrey', [[-0.41, y0 + 0.06, 0.0127], [-0.34, y0 + 0.06, 0.0127]]));
  // Joues percées Ø 2 3/8 (bagues 3) et trou de la vis 14, sommet arrondi.
  const xj = [ex - CHEEK.gap / 2 - CHEEK.t, ex - CHEEK.gap / 2, ex + CHEEK.gap / 2, ex + CHEEK.gap / 2 + CHEEK.t];
  const cheek = [[MS.z0, y0], [ez + 0.05, y0], ...arc(ez, ey, 0.05, 0, Math.PI, 14)];
  const yb14 = ey - 1.75 * IN;
  for (const k of [0, 2]) mount.push(slabX(S, cheek, xj[k], xj[k + 1], 'lightGrey', [[ez, ey, 1.19 * IN], [ez, yb14, 0.27 * IN]]));
  // Goussets entre joues et semelle (côtés extérieurs).
  for (const s of [-1, 1]) {
    const x = s < 0 ? xj[0] : xj[3];
    const gus = [[s * 0, y0], [s * 0.06, y0], [s * 0, y0 + 0.08]].map(([dx, y]) => [x + dx, y]);
    mount.push(slabZ(S, s > 0 ? gus : gus.slice().reverse(), -0.36, -0.348, 'lightGrey'));
  }
  const mBeads = [xj[0] - 0.003, xj[3] + 0.003].map((x) => W([[x, y0 + 0.004, MS.z0 + 0.01], [x, y0 + 0.004, -0.325]], 0.006));
  const mountM = merged(mount, 'lightGrey');
  mountM.userData.hasInterior = true;
  PM('5', group(mountM, merged(mBeads, 'lightGrey')), [0, -0.15, -0.1]);
  // 3 — bagues roulées dans les joues.
  for (const k of [0, 2]) PM('3', at(rolledBushing(S, 1.19 * IN, 1.0 * IN, CHEEK.t, { a: Math.PI / 2, oil: true }), [(xj[k] + xj[k + 1]) / 2, ey, ez], [0, 0, Math.PI / 2]), [k ? 0.08 : -0.08, -0.15, -0.1]);
  // 1 — axe d'extension Ø 2 po, plaquette d'arrêt soudée côté +X (trou de la vis 14).
  const pinL = xj[3] - xj[0] + 0.5 * IN;
  const x0p = xj[0] - 0.25 * IN;
  const keeper = sheet(S, THREE, [...arc(0, 0, 0.032, Math.PI / 2, 1.5 * Math.PI, 10), ...arc(0, -1.75 * IN, 0.016, 1.5 * Math.PI, 2.5 * Math.PI, 8)], 0.25 * IN, 'steel', [[0, -1.75 * IN, 0.27 * IN]]);
  keeper.rotation.y = Math.PI / 2;
  keeper.position.set(xj[3] + 0.125 * IN, 0, 0);
  const pin1 = group(merged([
    L(S, [[0, 0], [0.94, 0], [1.0, 0.06], [1.0, pinL / IN - 0.06], [0.94, pinL / IN], [0, pinL / IN]], 'steel', 32, { axis: 'x', pos: [x0p, 0, 0] }),
    keeper,
  ], 'steel'));
  pin1.position.set(0, ey, ez);
  PM('1', pin1, [0.25, -0.15, -0.1]);
  // 14 — vis d'arrêt parallèle à l'axe (tête côté plaquette), 18 / 20, 25.
  const xk = xj[3] + 0.25 * IN;
  PM('18', along(THREE, flatWasher(S, THREE, 0.5), [1, 0, 0], [xk, yb14, ez]), [0.3, -0.15, -0.1]);
  PM('20', along(THREE, nordLock(S, THREE, 0.5), [1, 0, 0], [xk + 0.1 * IN, yb14, ez]), [0.34, -0.15, -0.1]);
  PM('14', along(THREE, hhcs(S, THREE, 0.5, 4.5), [1, 0, 0], [xk + 0.1 * IN + u(nlT(0.5)), yb14, ez]), [0.4, -0.15, -0.1]);
  PM('18', along(THREE, flatWasher(S, THREE, 0.5), [-1, 0, 0], [xj[0], yb14, ez]), [-0.3, -0.15, -0.1]);
  PM('20', along(THREE, nordLock(S, THREE, 0.5), [-1, 0, 0], [xj[0] - 0.1 * IN, yb14, ez]), [-0.34, -0.15, -0.1]);
  PM('25', along(THREE, hexNut(S, THREE, 0.5), [-1, 0, 0], [xj[0] - 0.1 * IN - u(nlT(0.5)), yb14, ez]), [-0.4, -0.15, -0.1]);
  // 16 / 23 — vis H 1 po par le dessous de la semelle.
  for (const dx of [-0.08, 0.08]) {
    PM('23', along(THREE, nordLock(S, THREE, 1.0), [0, -1, 0], [ex + dx, MS.yb, -0.275]), [0, -0.22, 0]);
    PM('16', along(THREE, hhcs(S, THREE, 1.0, 2.5), [0, -1, 0], [ex + dx, MS.yb - u(nlT(1.0)), -0.275]), [0, -0.3, 0]);
  }
  // 6 — goupilles à collerette ovale dans les âmes, 11 / 19 et 12 / 20.
  for (const [s, xw] of [[-1, WL[0]], [1, WR[1]]]) {
    for (const zp of [-0.41, -0.34]) {
      // Collerette ovale (plan YZ) : tige Ø 1 po au centre, vis 11 au-dessus,
      // vis 12 au-dessous ; la tige traverse l'âme jusqu'au sabot d'about.
      const yp = y0 + 0.06;
      const flm = sheet(S, THREE, roundRect(0, 0, 0.032, 0.11, 0.015, 4), 0.25 * IN, 'zinc', [[0, 0.036, 0.2 * IN], [0, -0.036, 0.27 * IN]]);
      flm.rotation.y = Math.PI / 2;
      const g6 = group(merged([flm, L(S, [[0, -0.125], [0.5, -0.125], [0.5, 1.9], [0.46, 1.95], [0, 1.95]], 'zinc', 20, { axis: s < 0 ? 'x' : '-x' })], 'zinc'));
      g6.position.set(xw + s * 0.125 * IN, yp, zp);
      PM('6', g6, [s * 0.12, 0, 0]);
      const xh = xw + s * 0.25 * IN;
      PM('19', along(THREE, nordLock(S, THREE, 0.375), [s, 0, 0], [xh, yp + 0.036, zp]), [s * 0.16, 0, 0]);
      PM('11', along(THREE, hhcs(S, THREE, 0.375, 0.75), [s, 0, 0], [xh + s * u(nlT(0.375)), yp + 0.036, zp]), [s * 0.2, 0, 0]);
      PM('20', along(THREE, nordLock(S, THREE, 0.5), [s, 0, 0], [xh, yp - 0.036, zp]), [s * 0.16, -0.03, 0]);
      PM('12', along(THREE, hhcs(S, THREE, 0.5, 0.75), [s, 0, 0], [xh + s * u(nlT(0.5)), yp - 0.036, zp]), [s * 0.2, -0.03, 0]);
    }
  }

  // ================================================ 7 / 8 — déflecteurs des boyaux du MCP
  // Cornière 2 × 2 × 3/16 po cintrée : aile plaquée sur la face extérieure de
  // l'âme (bas du cadre), descendant de 0,2 m en s'écartant ; aile repliée vers
  // l'extérieur ; quatre vis H 1/2-13 × 1 dans les taraudages de l'âme.
  for (const [ref, s, xw] of [['8', -1, WL[0]], ['7', 1, WR[1]]]) {
    const t = 0.0048;
    const prof = [[-0.30, y0 + 0.12], [-0.23, y0 + 0.12], [-0.23, y0 - 0.06], [-0.255, y0 - 0.2], [-0.30, y0 - 0.2]];
    const xa = s < 0 ? xw - t : xw, xb = s < 0 ? xw : xw + t;
    const flange = slabX(S, prof, xa, xb, 'lightGrey', [[-0.28, y0 + 0.03, 0.0071], [-0.25, y0 + 0.03, 0.0071], [-0.28, y0 + 0.09, 0.0071], [-0.25, y0 + 0.09, 0.0071]]);
    const lipPts = [[xw, y0 + 0.12], [xw + s * 0.05, y0 + 0.12], [xw + s * 0.06, y0 - 0.2], [xw, y0 - 0.2]];
    const lip = slabZ(S, s > 0 ? lipPts : lipPts.slice().reverse(), -0.30, -0.30 + t, 'lightGrey');
    P(ref, merged([flange, lip], 'lightGrey'), [s * 0.1, -0.12, 0]);
    for (const [zz, yy] of [[-0.28, y0 + 0.03], [-0.25, y0 + 0.03], [-0.28, y0 + 0.09], [-0.25, y0 + 0.09]]) {
      const xo = s < 0 ? xa : xb;
      P('20', along(THREE, nordLock(S, THREE, 0.5), [s, 0, 0], [xo, yy, zz]), [s * 0.14, -0.12, 0]);
      P('13', along(THREE, hhcs(S, THREE, 0.5, 1.0), [s, 0, 0], [xo + s * u(nlT(0.5)), yy, zz]), [s * 0.19, -0.12, 0]);
    }
  }

  // ================================================ 17 / 22 / 27 — vis de calage des pattes
  // Vis carrée à bout pointu, verticale dans la noix (pointe vers le haut contre
  // la butée du mât), contre-écrou et rondelle Nord-Lock sous la noix.
  for (const y of BRK) {
    for (const x of [-0.035, 0.05]) {
      const yn = y - 0.126; // dessous de la noix
      P('22', along(THREE, nordLock(S, THREE, 0.75), [0, -1, 0], [x, yn, ZM - 0.019]), [-0.05, -0.05, 0]);
      P('27', along(THREE, hexNut(S, THREE, 0.75, { jam: true }), [0, -1, 0], [x, yn - u(nlT(0.75)), ZM - 0.019]), [-0.05, -0.08, 0]);
      P('17', along(THREE, sqss(S, THREE, 0.75, 2.75), [0, -1, 0], [x, yn - u(nlT(0.75)) - u(0.45) - 0.004, ZM - 0.019]), [-0.05, -0.12, 0]);
    }
  }

  // ================================================ 2 / 10 / 24 — colliers caoutchoutés Ø 1 1/4
  // Bande d'acier zingué en boucle (garniture caoutchouc) autour de la conduite,
  // patte double plaquée sur la plaque avant, vis dans un taraudage.
  const clampObj = () => {
    const ri = 0.625 * IN, t = 0.05 * IN, w = 0.75 * IN, lin = 0.06 * IN;
    const loop = [];
    for (let i = 0; i <= 20; i++) {
      const a = -Math.PI / 2 + (i / 20) * 1.75 * Math.PI;
      loop.push([Math.cos(a) * (ri + lin + t / 2), Math.sin(a) * (ri + lin + t / 2), 0]);
    }
    const band = S.tube([...loop, [0.03, -(ri + lin + t / 2) + t, 0], [0.042, -(ri + lin + t / 2) + t, 0]], t / 2, 'zinc', { seg: 40, radial: 6, ends: 'none' });
    band.scale.set(1, 1, w / t);
    const tab = S.box(0.03, t * 2, w, 'zinc', { pos: [0.027, -(ri + lin) - t, 0] });
    const rub = S.lathe([[ri, -w / 2], [ri + lin, -w / 2], [ri + lin, w / 2], [ri, w / 2], [ri, -w / 2]], 'rubber', { seg: 24, axis: 'z' });
    return group(merged([band, tab], 'zinc'), rub);
  };
  for (const y of [0.95, 1.5, 2.05]) {
    // Plan de la boucle XY ; patte contre la plaque avant (normale +Z), axe de la conduite selon Y.
    const g = group(clampObj());
    g.rotation.set(Math.PI / 2, 0, 0);
    g.position.set(0.3, y, ZF + 0.018);
    P('2', g, [0, 0, 0.08]);
    const xb = 0.3 + 0.033;
    P('24', at(group(nordLockSP(S, 0.375)), [xb, y, ZF + 0.0035], [Math.PI / 2, 0, 0]), [0, 0, 0.12]);
    P('10', along(THREE, hhcs(S, THREE, 0.375, 0.625), [0, 0, 1], [xb, y, ZF + 0.0035 + u(nlT(0.375))]), [0, 0, 0.16]);
  }

  return { view: { dir: [1.1, 0.5, -1.0] } };
}

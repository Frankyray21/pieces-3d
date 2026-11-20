// P003 — Assise 1500 GA601 (page 3), repère foreuse, pose de référence (mât à 0°), posée à l'identité par P002.
// Mécano-soudé (rep. 1) : tôle de dessus de 3/4 po (deux échancrures latérales et lumière centrale ouverte vers
// l'avant pour la languette du mât, p. 3), deux longerons-caissons à tôles de côté échancrées en voûte au milieu
// (p. 3 et couverture), tôles d'about, deux traverses entaillées pour le vérin d'avance, languette du fond du vérin,
// quatre tourillons Ø 2 po (deux de chaque côté, sur les axes de bascule TILT.x) et quatre chapes de vérin de tilt
// (aux deux bouts de chaque côté, p. 3 : on y reporte les vérins pour basculer d'un côté ou de l'autre ; celles de
// l'arrière, TILT.cylAssise, portent les vérins en pose de référence), bac latéral du côté +Z (dessiné sans repère
// à côté de l'assise, p. 3 et p. 2). Six clamps de mât GP6009 (rep. 2) qui crochètent la semelle basse du mât,
// 24 vis 5/8-11 × 2 po (rep. 9). Sur chaque tourillon, bushing de split-bloc C4038 (rep. 3) et anneau élastique
// 2 po (rep. 4). Pins GA610 à plaquette (rep. 7) et paliers lisses 6391K295 (rep. 5, deux par chape) dans les
// chapes arrière. Vérin d'avance du mât HCL-2548 / DR-HCL2536 (rep. 8) fermé sous la tôle de dessus, chapes aux
// deux bouts, pins MA621 (rep. 6).
// Cotes : layout.js (ASSISE, TILT) et _structure.js (MS pour la semelle du mât, HCL) ; le reste [estimé] en ligne.
// Éclaté comme la p. 3 : clamps et vis vers le haut, bushings et anneaux vers l'extérieur, vérin vers le bas.
import { IN, ASSISE, TILT } from '../layout.js';
import { MS, HCL, rect, arc, hull, circle, profilX, profilY, profilZ, boxAt, sleeve, snapRing, headPin } from './_structure.js';

const ZO = ASSISE.w / 2; // face extérieure des tôles de côté
const T_TOP = 0.75 * IN; // tôle de dessus [estimé]
const Y_TOP = ASSISE.top - T_TOP;
const Y_BOT = 0.62; // dessous des longerons [estimé : sous les tourillons, au-dessus du treuil (HOIST.maxTop)]
const ZI = 0.2, TS = 0.75 * IN; // tôle intérieure des longerons, épaisseur des tôles de côté [estimé]
const CLAMP = { x: [0.72, -0.25, -0.92], len: 0.2, z0: 0.195, z1: 0.3, h: 1.25 * IN, bz: 0.268 }; // [estimé, stations p. 3]
const LUG_X = [TILT.cylAssise[0], TILT.x[0] - (TILT.cylAssise[0] - TILT.x[1])]; // chapes arrière (pose) et avant (miroir)
const LUG = { y: TILT.cylAssise[1], gap: 0.04, tIn: 0.04, tOut: 1.0 * IN }; // [estimé]
const STUB_END = 0.38; // bout des tourillons [estimé]

export default function P003(api) {
  const S = api.S;
  const { at, group, box, cyl, ring } = S;
  const [x0, x1] = [ASSISE.x0, ASSISE.x1];

  // 1 — Assise GA601.
  const a = [];
  // Tôle de dessus : échancrures latérales, lumière centrale ouverte vers l'avant, 24 trous taraudés des clamps.
  {
    const n0 = 0.0, n1 = 0.32, zn = 0.25, sl = 0.035, sx = 0.12;
    const out = [[x0, -ZO], [n0 - 0.03, -ZO], [n0 + 0.02, -zn], [n1 - 0.02, -zn], [n1 + 0.03, -ZO], [x1, -ZO], [x1, -sl],
      ...arc([sx + sl, 0], sl, -Math.PI / 2, -1.5 * Math.PI, 10), [x1, sl], [x1, ZO], [n1 + 0.03, ZO], [n1 - 0.02, zn], [n0 + 0.02, zn], [n0 - 0.03, ZO], [x0, ZO]];
    const holes = CLAMP.x.flatMap((cx) => [-1, 1].flatMap((s) => [-0.075, -0.025, 0.025, 0.075].map((dx) => [cx + dx, s * CLAMP.bz, 0.0079])));
    a.push(profilY(api, out, holes, T_TOP, Y_TOP + T_TOP / 2));
  }
  for (const s of [-1, 1]) {
    // Tôles de côté (extérieure et intérieure) : voûte au milieu, coins inférieurs chanfreinés.
    const side = [[x0, Y_TOP], [x1, Y_TOP], [x1, 0.66], [x1 - 0.05, Y_BOT], ...arc([0.22, Y_BOT], 0.08, 0, Math.PI / 2, 6),
      ...arc([-0.4, Y_BOT], 0.08, Math.PI / 2, Math.PI, 6), [x0 + 0.05, Y_BOT], [x0, 0.66]];
    a.push(profilZ(api, side, [[-0.68, 0.73, 0.03]], TS, s * (ZO - TS / 2)));
    a.push(profilZ(api, side, [[-0.68, 0.73, 0.03]], TS, s * (ZI + TS / 2)));
    a.push(at(ring(0.045, 0.03, 0.008, 'red', { axis: 'z', seg: 24 }), [-0.68, 0.73, s * (ZO + 0.004)]));
    // Fonds des caissons (de part et d'autre de la voûte).
    for (const [xa, xb] of [[x0 + 0.05, -0.48], [0.3, x1 - 0.05]]) a.push(boxAt(api, [xa, Y_BOT, s * (ZI + TS)], [xb, Y_BOT + 0.012, s * (ZO - TS)]));
    // Tourillons Ø 2 po (gorge de l'anneau élastique) et cordon de soudure.
    for (const tx of TILT.x) {
      a.push(at(cyl(TILT.pin / 2, STUB_END - ZO + TS, 'steel', { axis: 'z', seg: 28 }), [tx, TILT.y, s * (ZO - TS + (STUB_END - ZO + TS) / 2)]));
      a.push(at(ring(TILT.pin / 2 + 0.0002, TILT.pin / 2 - 0.0015, 0.0025, 'darkSteel', { axis: 'z', seg: 28 }), [tx, TILT.y, s * 0.3675]));
      a.push(S.weldRing(TILT.pin / 2 + 0.003, 0.006, 'red', { axis: 'z', pos: [tx, TILT.y, s * (ZO + 0.003)] }));
    }
    // Chapes des vérins de tilt : joue intérieure épaisse, joue extérieure de 1 po, pont du côté opposé au vérin.
    LUG_X.forEach((lx, k) => {
      const used = k === 0, rh = used ? 0.019 : 0.0165;
      const prof = hull([[lx - 0.05, Y_TOP + 0.014], [lx + 0.05, Y_TOP + 0.014], ...circle([lx, LUG.y], 0.036, 20)]);
      const zc = TILT.cylZ, zIn = zc - LUG.gap / 2, zOut = zc + LUG.gap / 2;
      a.push(profilZ(api, prof, [[lx, LUG.y, rh]], zIn - ZO, s * (ZO + zIn) / 2));
      a.push(profilZ(api, prof, [[lx, LUG.y, rh]], LUG.tOut, s * (zOut + LUG.tOut / 2)));
      const bx = k === 0 ? lx + 0.0425 : lx - 0.0425; // pont à l'opposé du vérin (le vérin vient de l'arrière en pose)
      a.push(boxAt(api, [bx - 0.0075, LUG.y - 0.01, s * zIn], [bx + 0.0075, Y_TOP + 0.014, s * zOut]));
    });
  }
  // Tôles d'about : lumière ouverte à l'avant (languette du mât), trou rond à l'arrière.
  const endOut = (notch) => notch
    ? [[-ZO + TS, 0.64], [ZO - TS, 0.64], [ZO - TS, Y_TOP], [0.035, Y_TOP], [0.035, 0.73], [-0.035, 0.73], [-0.035, Y_TOP], [-ZO + TS, Y_TOP]]
    : rect(-ZO + TS, 0.64, ZO - TS, Y_TOP);
  a.push(profilX(api, endOut(true), [], TS, x1 - TS / 2));
  a.push(profilX(api, endOut(false), [[0, 0.7, 0.03]], TS, x0 + TS / 2));
  // Traverses entaillées (passage du fût du vérin d'avance du mât).
  for (const x of [-0.6, 0.0]) {
    a.push(profilX(api, [[-ZI, 0.66], [ZI, 0.66], [ZI, Y_TOP], [0.065, Y_TOP], [0.065, 0.725], [-0.065, 0.725], [-0.065, Y_TOP], [-ZI, Y_TOP]], [], 0.5 * IN, x));
  }
  // Languette du fond du vérin d'avance du mât (tôle de 1 po, pin MA621).
  a.push(profilZ(api, [[x0 + TS, Y_TOP], [x0 + TS, HCL.y - 0.02], ...arc([HCL.xBase, HCL.y], 0.045, Math.PI, 1.5 * Math.PI, 6), ...arc([HCL.xBase, HCL.y], 0.045, -Math.PI / 2, Math.PI / 2, 10).slice(1), [HCL.xBase + 0.02, Y_TOP]],
    [[HCL.xBase, HCL.y, 0.625 * IN + 0.0005]], 1.0 * IN, 0));
  // Bac latéral (côté +Z, entre les chapes) : fond, paroi évasée, bords roulés, about perforé à l'avant.
  {
    const bx0 = -0.44, bx1 = 0.22, z0 = ZO, zb = 0.4, zt = 0.47, yb = 0.67, yt = Y_TOP - 0.01, t = 0.1 * IN;
    a.push(profilX(api, [[z0, yb], [zb, yb], [zt, yt], [zt + 0.015, yt], [zt + 0.015, yt + 0.004], [zt - 0.002, yt + 0.004], [zb - 0.004, yb + t], [z0, yb + t]], [], bx1 - bx0, (bx0 + bx1) / 2));
    const endP = [[z0, yb], [zb, yb], [zt, yt], [z0, yt]];
    a.push(profilX(api, endP, [], 0.003, bx0));
    const perf = [];
    for (const zz of [0.34, 0.375, 0.41]) for (const yy of [0.7, 0.735, 0.77]) if (zz < zb + (yy - yb) * (zt - zb) / (yt - yb) - 0.02) perf.push([zz, yy, 0.011]);
    a.push(profilX(api, endP, perf, 0.006, bx1));
  }
  api.part('1', group(...a), [0, 0, 0]);

  // 2 — Clamps de mât GP6009 (×6) : barre de 1 1/4 po, feuillure qui coiffe la semelle basse du mât ; 9 — vis
  // 5/8-11 × 2 po (×24), têtes sur le dessus.
  const ySeat = MS.yBot + 0.0005; // dessous de la lèvre : dessus de la semelle basse du mât
  for (const cx of CLAMP.x) {
    for (const s of [-1, 1]) {
      const prof = [[CLAMP.z0, ySeat], [MS.zb + 0.005, ySeat], [MS.zb + 0.005, ASSISE.top], [CLAMP.z1, ASSISE.top], [CLAMP.z1, ASSISE.top + CLAMP.h], [CLAMP.z0, ASSISE.top + CLAMP.h]]
        .map(([z, y]) => [s * z, y]);
      api.part('2', profilX(api, s > 0 ? prof : [...prof].reverse(), [], CLAMP.len, cx, 'darkSteel'), [0, 0.35, s * 0.06]);
      for (const dx of [-0.075, -0.025, 0.025, 0.075]) {
        api.part('9', S.bolt(0.625 * IN, 2 * IN, 'zinc', { pos: [cx + dx, ASSISE.top + CLAMP.h, s * CLAMP.bz] }), [0, 0.6, s * 0.06], { noLabel: !(cx === CLAMP.x[0] && dx === 0.025 && s > 0) });
      }
    }
  }

  // 3 — Bushings de split-bloc C4038 (×4) : bague Ø 2 1/2 × 2 po × 2 po de long, collerette vers l'extérieur ;
  // 4 — anneaux élastiques 2 po (×4) dans la gorge des tourillons.
  for (const tx of TILT.x) {
    for (const s of [-1, 1]) {
      const rot = [s * Math.PI / 2, 0, 0];
      api.part('3', at(sleeve(api, 1.25 * IN, TILT.pin / 2 + 0.0002, 2 * IN, 'brass', { flange: 0.04, flangeT: 0.005 }), [tx, TILT.y, s * TILT.z], rot), [0, 0, s * 0.3]);
      api.part('4', at(snapRing(api, TILT.pin / 2 - 0.0012, 0.0045, 0.002), [tx, TILT.y, s * 0.3675], rot), [0, 0, s * 0.45]);
    }
  }

  // 5 — Paliers lisses 6391K295 (×4, Ø 1 1/4 × 1 1/2 × 1 po) dans les deux joues des chapes arrière ; 7 — pins
  // GA610 Ø 1 1/4 po (×2) à plaquette d'arrêt, enfilées de l'extérieur.
  const lx = LUG_X[0], zc = TILT.cylZ, zIn = zc - LUG.gap / 2, zOut = zc + LUG.gap / 2;
  for (const s of [-1, 1]) {
    const rot = [Math.PI / 2, 0, 0];
    api.part('5', at(sleeve(api, 0.75 * IN, 0.625 * IN, 1.0 * IN, 'brass'), [lx, LUG.y, s * (zIn - 0.5 * IN)], rot), [0, -0.12, s * 0.18]);
    api.part('5', at(sleeve(api, 0.75 * IN, 0.625 * IN, 1.0 * IN, 'brass'), [lx, LUG.y, s * (zOut + 0.5 * IN)], rot), [0, -0.12, s * 0.26]);
    const head = s * (zOut + LUG.tOut);
    const pin = group(
      headPin(api, 0.625 * IN, zOut + LUG.tOut - ZO - 0.004, 'steel', { headR: 0.021, headT: 0.004, hole: false }),
      box(0.034, 0.005, 0.07, 'steel', { r: 0.003, pos: [0, 0.0045, 0.022] }),
      cyl(0.0055, 0.006, 'black', { seg: 10, pos: [0, 0.0045, 0.045] }),
    );
    api.part('7', at(pin, [lx, LUG.y, head], [s * Math.PI / 2, 0, 0]), [0, 0, s * 0.42]);
  }

  // 8 — Vérin d'avance du mât (fermé) : chape du fond, fond, fût, presse-étoupe, tige chromée, chape de tige ;
  // bossages d'orifices du côté +Z. 6 — pins MA621 Ø 1 1/4 po (×2) dans les chapes, têtes du côté +Z.
  {
    const y = HCL.y, r = HCL.bore / 2 + 0.25 * IN, rodR = 0.6875 * IN;
    const xb = HCL.xBase, xr = HCL.xRod, b0 = xb + 0.06, b1 = b0 + 0.95;
    const chape = (x, dir) => [-1, 1].map((k) => profilZ(api, hull([[x - dir * 0.055, y - 0.03], [x - dir * 0.055, y + 0.03], ...circle([x, y], 0.03, 16)]), [[x, y, 0.625 * IN + 0.0005]], 0.012, k * 0.019, 'black'));
    const v = group(
      ...chape(xb, -1),
      at(cyl(r, 0.035, 'black', { axis: 'x', seg: 28 }), [b0 - 0.0175 + 0.0, y, 0]),
      at(S.shell(r, r - 0.006, b1 - b0, 'black', { axis: 'x', seg: 28 }), [(b0 + b1) / 2, y, 0]),
      at(cyl(r * 1.04, 0.04, 'black', { axis: 'x', seg: 28 }), [b1 + 0.02, y, 0]),
      at(ring(rodR * 1.2, rodR * 1.0, 0.004, 'rubber', { axis: 'x', seg: 20 }), [b1 + 0.042, y, 0]),
      at(cyl(rodR, xr - 0.055 - b1, 'chrome', { axis: 'x', seg: 20 }), [(b1 + xr - 0.055) / 2, y, 0]),
      at(cyl(0.024, 0.03, 'black', { axis: 'x', seg: 6 }), [xr - 0.07, y, 0]),
      ...chape(xr, 1),
      ...[b0 + 0.04, b1 - 0.04].flatMap((px) => [
        at(box(0.035, 0.03, 0.02, 'black', { r: 0.003 }), [px, y, r + 0.006]),
        at(S.nut(0.02, 0.01, 'steel', { axis: 'z' }), [px, y, r + 0.02]),
      ]),
    );
    api.part('8', v, [0, -0.45, 0]);
    for (const x of [xb, xr]) {
      api.part('6', at(headPin(api, 0.625 * IN, 0.062, 'steel', { headR: 0.022, headT: 0.008 }), [x, y, 0.031], [Math.PI / 2, 0, 0]), [0, -0.45, 0.3]);
    }
  }
  return { view: { dir: [0.9, 0.8, -1.2] } };
}

// P476 — Collecteur de refoulement CX034807 « ASSY, MANIFOLD, COMP.
// DISCHARGE, DU311 » (page 476), repère 18 de P430. Collecteur mécano-soudé
// (2, CX008753) : corps en tube 3 po sch. 80 à fond bombé (côté patte de
// fixation) et à bride carrée code 61 2 po au bout opposé (sortie vers le
// refroidisseur final, flexible inox P430 rep. 1) ; manchons soudés :
//   · face avant : deux adaptateurs droits MNPT 1 1/2 → JIC -24 (6) et, près
//     de la bride, un coude 45° NPT → JIC -24 (4) — arrivées des trois
//     culasses (flexibles P430 rep. 23) ;
//   · dessus : deux réductions six-pans 1 × 1/2 NPT (1) — l'une reçoit la
//     sonde du thermomètre déporté du panneau P472 (note du dessin), l'autre
//     un bouchon affleurant à six-pans creux 1/2 NPT (7) — et la sonde de
//     température −18 à 260 °C (3) près de la bride ;
//   · fond bombé : adaptateur droit MNPT 1/2 → JIC -06 (5), prise de pression.
// Patte en équerre soudée sous le fond bombé, quatre boutonnières : vis H
// 3/8-16 × 1 3/4 gr. 8 (8), rondelles plates (9) côté têtes, rondelles
// fendues (10) et écrous (11) derrière la cornière support (P430 rep. 9).
// Repère : origine sur l'axe du corps, au milieu de sa longueur ; X selon le
// corps (+X vers la bride de sortie, face de bride à MAN.flangeX), Y haut,
// +Z côté arrivées (face avant de la vue de la page 476) ; face avant de la
// patte (têtes des vis) à z = MAN.tabZ.
// Encombrement ≈ 0.48 (X) × 0.24 (Y) × 0.17 (Z) m. Cotes : raccords et
// visserie de la liste ; corps et patte estimés d'après la page 476.
import { ACC, I, ENG, pipeR, nptPlug, tempTransducer, hexProf } from './_rearb.js';

const R = I(1.75); // corps : tube 3 po (Ø 3.5 po)
const X0 = -0.17, X1 = 0.17; // bout des parties cylindriques
export const MAN = {
  R,
  flangeX: X1 + 0.075, // face de la bride code 61
  tabZ: R + 0.016, // face avant de la patte
  tabX: [-0.21, -0.035], tabY: [-0.03, -0.15],
  slots: [[-0.17, -0.07], [-0.075, -0.07], [-0.17, -0.125], [-0.075, -0.125]], // [x, y]
  inlets: [[-0.09, 0], [0.01, 0]], // adaptateurs 6 (x, y) sur la face +Z
  elbow4: [0.115, -0.012], // coude 45°
};

/** Bouts des cônes -24 des trois arrivées (repère de P476) : [{ tip, dir }]. */
export function manPorts(S) {
  const st = ACC.straight(S, { a: 24, b: 24 }).userData.tip;
  const zb = R + 0.014; // face des manchons
  const out = MAN.inlets.map(([x, y]) => ({ tip: [x, y, zb + st], dir: [0, 0, 1] }));
  const e = ACC.elbow(S, { a: 24, b: 24, angle: 45 }).userData;
  const [x4, y4] = MAN.elbow4;
  // Coude orienté : filet selon +Z, branche à 45° vers −X.
  out.push({ tip: [x4 - e.out[0], y4, zb + e.out[1]], dir: [-e.dir[0], 0, e.dir[1]] });
  return out;
}

export default function P476(api) {
  const { S } = api;
  const { lathe, cyl, box, extrude, bolt, washer, weldRing, weld, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);
  const X = [1, 0, 0], NX = [-1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];

  // Manchon soudé (demi-manchon NPT n) sur le corps, axe dir depuis le centre local pos (sur l'axe du corps).
  const boss = (n, x, y, dir, top) => {
    const ro = pipeR(n) * 1.3;
    return O(lathe([[pipeR(n) * 0.98, R * 0.6], [ro, R * 0.6], [ro, top - 0.0015], [ro - 0.0015, top], [pipeR(n) * 0.98, top], [pipeR(n) * 0.98, R * 0.6]], 'grey', { seg: 24 }), [x, y, 0], dir, dir[1] ? X : Y);
  };

  // ---------------------------------------------------------------- 2 — collecteur
  {
    const zb = R + 0.014, yt = R + 0.014;
    const parts = [
      cyl(R, X1 - X0, 'grey', { axis: 'x', seg: 40 }),
      // Fond bombé (−X) et calotte plate percée (+X), col 2 po, bride carrée code 61.
      at(lathe([[0, 0], [R, 0], [R * 0.96, R * 0.22], [R * 0.82, R * 0.42], [R * 0.55, R * 0.6], [0, R * 0.66]], 'grey', { seg: 40 }), [X0, 0, 0], [0, 0, Math.PI / 2]),
      at(lathe([[0, 0], [R, 0], [R, 0.012], [R * 0.9, 0.016], [0, 0.016]], 'grey', { seg: 40 }), [X1, 0, 0], [0, 0, -Math.PI / 2]),
      at(lathe([[pipeR(32) * 0.85, 0], [pipeR(32) * 1.05, 0], [pipeR(32) * 1.05, 0.05], [pipeR(32) * 0.85, 0.05]], 'grey', { seg: 32 }), [X1 + 0.012, 0, 0], [0, 0, -Math.PI / 2]),
      boss(24, MAN.inlets[0][0], MAN.inlets[0][1], Z, zb), boss(24, MAN.inlets[1][0], MAN.inlets[1][1], Z, zb), boss(24, MAN.elbow4[0], MAN.elbow4[1], Z, zb),
      boss(16, -0.07, 0, Y, yt), boss(16, 0.05, 0, Y, yt), boss(8, 0.135, 0, Y, yt),
      boss(8, 0, 0, NX, -X0 + R * 0.62),
    ];
    // Bride : plaque à angles arrondis 4.25 × 3.5 po, quatre taraudages 1/2-13 (entraxes 3.062 × 1.688 po).
    const sq = [];
    const W = I(2.15), H = I(1.75), rc = I(0.4);
    for (const [cx, cy, a0] of [[W - rc, H - rc, 0], [-W + rc, H - rc, Math.PI / 2], [-W + rc, -H + rc, Math.PI], [W - rc, -H + rc, 1.5 * Math.PI]]) {
      for (let k = 0; k <= 4; k++) { const a = a0 + (k / 4) * (Math.PI / 2); sq.push([cx + rc * Math.cos(a), cy + rc * Math.sin(a)]); }
    }
    const fl = extrude(sq, 0.025, 'grey', { holes: [[0, 0, I(1.0)], ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => [a * I(0.844), b * I(1.531), I(0.21)])] });
    parts.push(at(group(fl), [MAN.flangeX - 0.0125, 0, 0], [0, Math.PI / 2, 0]));
    // Patte en équerre : retour supérieur soudé sous le fond, plaque verticale à boutonnières.
    const [xa, xb] = MAN.tabX, [ya, yb] = MAN.tabY, zt = MAN.tabZ;
    const slots = MAN.slots.map(([x, y]) => [x, y]);
    const shape = [[xa, yb], [xb, yb], [xb, ya], [xa, ya]];
    const tab = extrude(shape, I(0.25), 'grey');
    tab.position.z = zt - I(0.125);
    parts.push(tab, box(xb - xa, I(0.25), zt - R * 0.2, 'grey', { pos: [(xa + xb) / 2, ya + I(0.125) - 0.002, (zt + R * 0.2) / 2 - 0.003] }));
    // Boutonnières : fonds sombres (traversées) dans l'épaisseur de la patte.
    const slotDark = slots.map(([x, y]) => box(0.03, I(0.41), I(0.27), 'blackOxide', { r: I(0.2), pos: [x, y, zt - I(0.125)] }));
    const welds = [
      weldRing(R * 1.0, 0.006, 'grey', { axis: 'x', pos: [X0 + 0.002, 0, 0] }),
      weldRing(R * 1.0, 0.006, 'grey', { axis: 'x', pos: [X1 + 0.004, 0, 0] }),
      weld([[xa, ya + I(0.25), R * 0.25], [xb, ya + I(0.25), R * 0.25]], 0.006, 'grey'),
    ];
    P('2', group(merged(parts, 'grey'), merged(welds, 'grey'), merged(slotDark, 'blackOxide')), [0, 0.12, 0]);
  }

  // ---------------------------------------------------------------- arrivées 6 et 4
  const zb = R + 0.014;
  for (const [x, y] of MAN.inlets) P('6', O(ACC.straight(S, { a: 24, b: 24 }), [x, y, zb], Z, X), [0, 0, 0.12]);
  P('4', O(ACC.elbow(S, { a: 24, b: 24, angle: 45 }), [MAN.elbow4[0], MAN.elbow4[1], zb], Z, NX), [0.05, 0, 0.14]);

  // ---------------------------------------------------------------- dessus : 1, 7, 3 ; fond : 5
  const yt = R + 0.014;
  P('1', O(ACC.hexBushing(S, 16, 8), [0.05, yt, 0], Y, X), [0, 0.1, 0]);
  P('1', O(ACC.hexBushing(S, 16, 8), [-0.07, yt, 0], Y, X), [0, 0.1, 0]);
  const hh = Math.max(I(0.25), (ACC.pipeOD(16) / 2) * 0.45);
  P('7', O(nptPlug(S, 8), [-0.07, yt + hh, 0], Y, X), [0, 0.16, 0]);
  P('3', O(tempTransducer(S), [0.135, yt, 0], Y, Z), [0, 0.2, 0]);
  P('5', O(ACC.straight(S, { a: 8, b: 6 }), [X0 - R * 0.62, 0, 0], NX, Y), [-0.1, 0, 0]);

  // ---------------------------------------------------------------- 8, 9, 10, 11 — fixation de la patte
  const zt = MAN.tabZ, tS = I(0.25); // patte puis aile de la cornière support derrière elle
  for (const [x, y] of MAN.slots) {
    P('9', washer(I(0.4), I(0.2), I(0.065), 'zinc', { axis: 'z', pos: [x, y, zt + I(0.0325)] }), [0, 0, 0.1]);
    P('8', bolt(I(0.375), I(1.75), 'zinc', { axis: 'z', pos: [x, y, zt + I(0.065)] }), [0, 0, 0.16]);
    const zn = zt - I(0.25) - tS;
    P('10', at(S.slotted(I(0.33), I(0.2), 0, I(0.094), [{ a: 0.6, w: 0.12, y0: -1, y1: 1 }], 'zinc', { seg: 18 }), [x, y, zn], [-Math.PI / 2, 0, 0]), [0, 0, -0.1]);
    P('11', S.nut(I(0.5625), I(0.33), 'zinc', { axis: 'z', pos: [x, y, zn - I(0.094) - I(0.165)] }), [0, 0, -0.14]);
  }

  void hexProf; void ENG;
  return { view: { dir: [-0.6, 0.6, 1.1] } };
}

// P402 — Banc de distributeurs de forage : CX038472 rév. 0 « ASSY, VALVE BANK
// - DRILLING » (page 402), repère 32 du porteur P208. Le distributeur PVG 32 à
// six sections (2, P404) reçoit : dix adaptateurs droits MORB -10 → JIC -08 (7)
// sur les orifices A / B des cinq sections du bas, deux adaptateurs droits MORB
// -10 → JIC -12 (8) sur A / B de la section de rotation (34,3 gal/min), deux
// adaptateurs droits -12 (9) sur P et T, trois coudes MORB -05 → JIC -06 (5)
// sur l'orifice LS (flanc côté électrocommandes) et l'orifice de manomètre
// (flanc côté poignées) du couvercle d'entrée et sur l'orifice LX de la
// plaque d'extrémité, deux adaptateurs droits MORB -05 → JIC -06 (6) sur LSa /
// LSb au dos de la section de rotation. Le clapet navette 1/4 NPT (1, CP17024)
// est porté par le coude LS : adaptateur droit MNPT → écrou tournant JIC -06
// (4) vissé dans sa sortie et serré sur le nez du coude, coudes 45° MNPT -04 →
// JIC -06 (3) sur ses deux entrées (vue A de la page 402). Quatre vis H
// 5/16-18 × 3/4 po (10) et rondelles Nord-Lock (11) le fixent par l'arrière au
// travers de la platine support (tôle 1/4 po du porteur, non dessinée).
// Repère machine (layout.js), posé à l'identité par P208 : banc debout sur le
// pont avant, côté gauche, tiroirs verticaux (poignées et leviers en haut,
// électrocommandes en bas), orifices vers l'avant (+X), dos à x = 0.74, axe des
// corps à y = 1.5, empilage selon +Z de z = −0.70 (plaque d'extrémité) à
// z = −0.33 (couvercle d'entrée) (FB.bank de _frontb.js ; repères 32 et 26 de
// carrier.js). Châssis avant : corps « front » de la simulation.
import { FB, PV, IN, pvgLayout, bankFrame, bankKit, front, nptFitting, orient, shuttle17024, SH17 } from './_frontb.js';
import { SPEC404 } from './P404.js';

export default function P402(api) {
  const lay = pvgLayout(SPEC404);
  const F = bankFrame(api, [FB.bank.x + PV.D / 2, FB.bank.y, FB.bank.z0.drill]);
  const K = bankKit(api, F);
  const P = (ref, obj, e) => api.part(ref, front(F.W(obj)), F.d(e));
  api.part('2', front(F.W(api.sub('P404'))), [0.25, 0.05, 0]);
  lay.sec.forEach((s, i) => {
    const rot = i === 5;
    K.straight(rot ? '8' : '7', s.A, [0, 0, 1], 10, rot ? 12 : 8);
    K.straight(rot ? '8' : '7', s.B, [0, 0, 1], 10, rot ? 12 : 8);
    if (rot) {
      K.straight('6', s.LSa, [0, 0, -1], 5, 6);
      K.straight('6', s.LSb, [0, 0, -1], 5, 6);
    }
  });
  K.straight('9', lay.P, [0, 0, 1], 12, 12);
  K.straight('9', lay.T, [0, 0, 1], 12, 12);
  const ls = K.elbow('5', lay.LS, [-1, 0, 0], [0, 0, 1], 5, 6);
  K.elbow('5', lay.G, [1, 0, 0], [0, 0, 1], 5, 6);
  K.elbow('5', lay.LX, [-1, 0, 0], [0, 0, 1], 5, 6);

  // Clapet navette sur le coude LS : nez du coude en T (vers +Z du distributeur).
  const T = ls.outW;
  const a4 = nptFitting(api, { npt: 4, jic: 6, end: 'swivel' });
  const o4 = [T[0], T[1], T[2] + a4.out[1] - 0.006]; // face de sortie du clapet (l'écrou coiffe le nez)
  P('4', orient(api, a4.obj, o4, [0, 0, -1]), [0, 0, 0.05]);
  const cs = [o4[0], o4[1], o4[2] + SH17.C / 2];
  // Clapet : sortie (+Y du clapet) vers −Z du distributeur, entrées selon l'empilage.
  P('1', orient(api, shuttle17024(api), cs, [0, 0, -1], [-1, 0, 0]), [0, 0, 0.1]);
  for (const s of [-1, 1]) {
    const e3 = nptFitting(api, { npt: 4, jic: 6, angle: 45 });
    P('3', orient(api, e3.obj, [cs[0], cs[1] + s * SH17.L / 2, cs[2]], [0, s, 0], [0, 0, 1]), [0, s * 0.05, 0.1]);
  }
  K.bolts('10', '11', lay.bolts);
  void IN;
  return { view: { dir: [1, 0.6, 1.1] } };
}

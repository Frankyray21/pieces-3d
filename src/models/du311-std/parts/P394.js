// P394 — Banc de distributeur d'avance : CX038278 rév. 0 « ASSY, VALVE BANK -
// FEED » (page 394), repère 30 du porteur P208. Le distributeur PVG 32 à une
// section (1, P396) reçoit : deux adaptateurs droits MORB -10 → JIC -12 (4)
// sur A et B, deux adaptateurs droits -12 (5) sur P et T, un coude MORB -05 →
// JIC -06 (2) sur l'orifice LS du couvercle d'entrée, trois adaptateurs droits
// MORB -05 → JIC -06 (3) sur l'orifice de manomètre et sur les orifices LSa /
// LSb au dos du corps LS-PC ; quatre vis H 5/16-18 × 3/4 po (6) et rondelles
// Nord-Lock (7) le fixent par l'arrière au travers de la platine support
// (tôle 1/4 po du porteur, non dessinée).
// Repère machine (layout.js), posé à l'identité par P208 : banc debout au
// milieu du pont avant, tiroir vertical (poignée et levier en haut, électro-
// commande en bas), orifices vers l'avant (+X), dos à x = 0.74, axe du corps à
// y = 1.5, empilage selon +Z de z = −0.12 à z = 0.002 (FB.bank de _frontb.js ;
// repère 30 de carrier.js). Châssis avant : corps « front » de la simulation.
import { FB, PV, pvgLayout, bankFrame, bankKit, front } from './_frontb.js';
import { SPEC396 } from './P396.js';

export default function P394(api) {
  const lay = pvgLayout(SPEC396);
  const F = bankFrame(api, [FB.bank.x + PV.D / 2, FB.bank.y, FB.bank.z0.feed]);
  const K = bankKit(api, F);
  api.part('1', front(F.W(api.sub('P396'))), [0.25, 0.05, 0]);
  const s = lay.sec[0];
  K.straight('4', s.A, [0, 0, 1], 10, 12);
  K.straight('4', s.B, [0, 0, 1], 10, 12);
  K.straight('5', lay.P, [0, 0, 1], 12, 12);
  K.straight('5', lay.T, [0, 0, 1], 12, 12);
  K.elbow('2', lay.LS, [-1, 0, 0], [0, 0, 1], 5, 6);
  K.straight('3', lay.G, [1, 0, 0], 5, 6);
  K.straight('3', s.LSa, [0, 0, -1], 5, 6);
  K.straight('3', s.LSb, [0, 0, -1], 5, 6);
  K.bolts('6', '7', lay.bolts);
  return { view: { dir: [1, 0.6, 1.1] } };
}

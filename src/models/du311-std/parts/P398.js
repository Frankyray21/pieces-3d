// P398 — Banc de distributeurs de mise en place : CX038471 rév. 0 « ASSY,
// VALVE BANK - SETUP » (page 398), repère 31 du porteur P208. Le distributeur
// PVG 32 à 10 sections (1, P400) reçoit : vingt adaptateurs droits MORB -10 →
// JIC -06 (3) sur les orifices A / B, deux adaptateurs droits -12 (4) sur P et
// T, deux coudes MORB -05 → JIC -06 (2) sur l'orifice LS du couvercle d'entrée
// et sur l'orifice LX de la plaque d'extrémité (sorties vers l'avant) ; quatre
// vis H 5/16-18 × 3/4 po (5) et rondelles Nord-Lock (6) le fixent par l'arrière,
// au travers de la platine support (tôle 1/4 po du porteur, non dessinée),
// dans les taraudages du couvercle d'entrée et de la plaque d'extrémité.
// Repère machine (layout.js), posé à l'identité par P208 : banc debout sur le
// pont avant, côté droit, tiroirs verticaux (poignées et leviers en haut,
// inclinés vers l'avant, électrocommandes en bas), orifices vers l'avant (+X),
// dos (face de fixation) à x = 0.74, axe des corps à y = 1.5, empilage selon
// +Z de z = 0.17 (plaque d'extrémité) à z = 0.732 (couvercle d'entrée)
// (FB.bank de _frontb.js ; emplacement des repères 31 et 25 de carrier.js).
// Châssis avant : corps « front » de la simulation.
import { FB, PV, pvgLayout, bankFrame, bankKit, front } from './_frontb.js';
import { SPEC400 } from './P400.js';

export default function P398(api) {
  const lay = pvgLayout(SPEC400);
  const F = bankFrame(api, [FB.bank.x + PV.D / 2, FB.bank.y, FB.bank.z0.setup]);
  const K = bankKit(api, F);
  api.part('1', front(F.W(api.sub('P400'))), [0.25, 0.05, 0]);
  for (const s of lay.sec) {
    K.straight('3', s.A, [0, 0, 1], 10, 6);
    K.straight('3', s.B, [0, 0, 1], 10, 6);
  }
  K.straight('4', lay.P, [0, 0, 1], 12, 12);
  K.straight('4', lay.T, [0, 0, 1], 12, 12);
  K.elbow('2', lay.LS, [-1, 0, 0], [0, 0, 1], 5, 6);
  K.elbow('2', lay.LX, [-1, 0, 0], [0, 0, 1], 5, 6);
  K.bolts('5', '6', lay.bolts);
  return { view: { dir: [1, 0.6, 1.1] } };
}

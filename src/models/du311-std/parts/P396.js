// P396 — Distributeur d'avance, 1 section : CX038111 rév. 1 « FEED VALVE, 1
// SECTION - AMP » (page 396, 24 lb), repère 1 de P394. Distributeur
// proportionnel Danfoss PVG 32 à une section (26,4 gal/min, vérin, LS) :
// couvercle d'extrémité plein (2) en bas, corps de section LS-PC (4) avec son
// tiroir de vérin 26,4 gal/min LS (3, ressort de rappel et chape côté poignée),
// couvercle d'entrée P / T (6) en haut ; embase de poignée (1) côté +X avec son
// levier et son pommeau, électrocommande proportionnelle fine à connecteur AMP
// (5) côté −X ; trois tirants M8 à écrous (7, boulonnerie de la trousse de
// joints PVG 32). Orifices (page 396) : P et T #12 ORB et A / B #10 ORB en
// façade, LS #5 sur le flanc du couvercle d'entrée côté électrocommande,
// manomètre #5 sur le flanc opposé, LSa / LSb #5 au dos du corps LS-PC.
// Repère (commun aux PVG 32, voir _frontb.js) : origine au centre de la face
// extérieure du couvercle d'extrémité, Y vers le haut le long de l'empilage,
// X selon le tiroir (poignée vers +X, électrocommande vers −X), +Z = face des
// orifices A / B et P / T, −Z = face de fixation. Encombrement ≈ 0.43 (X,
// levier compris) × 0.14 (Y) × 0.13 (Z) m.
import { pvgValve } from './_frontb.js';

export const SPEC396 = {
  end: { ref: '2', kind: 'cover' },
  sections: [{ body: '4', kind: 'lspc', spool: '3', spoolKind: 'cylls', handle: '1', act: '5', actKind: 'fine' }],
  inlet: { ref: '6', gaugePlug: false },
  kit: '7',
};

export default function P396(api) {
  pvgValve(api, SPEC396);
  return { view: { dir: [0.7, 0.6, 1.1] } };
}

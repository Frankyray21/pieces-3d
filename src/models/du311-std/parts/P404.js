// P404 — Distributeur de forage, 6 sections : CX038028 rév. 0 « DRILLING
// VALVE, 6 SECTION - AMP » (pages 404 et 406, 93 lb), repère 2 de P402.
// Danfoss PVG 32 : plaque d'extrémité à orifice LX (2) en bas, six sections,
// couvercle d'entrée P / T (13) en haut. De bas en haut (vue éclatée de la page
// 404, schéma de la page 406) : air marche / arrêt 2,6 gal/min (corps de base
// 6, tiroir de vérin 2,6 9), centreur 6,6 gal/min 1500 psi (corps LS-PC 8,
// tiroir de moteur LS 5, orifices LSa / LSb bouchés), coins 6,6 (corps 6,
// tiroir 6,6 4), débrayage 6,6 (corps 6, tiroir 4), pompe à eau 10,6 (corps PC
// 7, tiroir 10,6 3), rotation 34,3 gal/min 2800 psi (corps LS-PC 8, tiroir
// 34,3 LS 12, orifices LSa / LSb raccordés par P402). Électrocommandes : tout-
// ou-rien (11) sur les quatre sections du bas, proportionnelles fines (10) sur
// la pompe à eau et la rotation ; une embase de poignée (1) avec levier par
// section ; trois tirants M8 à écrous (14, trousse de joints PVG 32).
// Repère (commun aux PVG 32, voir _frontb.js) : origine au centre de la face
// extérieure de la plaque d'extrémité, Y le long de l'empilage, X selon les
// tiroirs (poignées vers +X, électrocommandes vers −X), +Z = face des orifices
// A / B et P / T, −Z = face de fixation. Encombrement ≈ 0.43 (X) × 0.39 (Y) ×
// 0.13 (Z) m.
import { pvgValve } from './_frontb.js';

const S6 = (body, kind, spool, spoolKind, act, actKind, lsPlugs = false) => ({ body, kind, spool, spoolKind, handle: '1', act, actKind, lsPlugs });
export const SPEC404 = {
  end: { ref: '2', kind: 'lx' },
  sections: [
    S6('6', 'basic', '9', 'cyl', '11', 'onoff'), // air marche / arrêt
    S6('8', 'lspc', '5', 'motls', '11', 'onoff', true), // centreur
    S6('6', 'basic', '4', 'mot', '11', 'onoff'), // coins
    S6('6', 'basic', '4', 'mot', '11', 'onoff'), // débrayage
    S6('7', 'pc', '3', 'mot', '10', 'fine'), // pompe à eau
    S6('8', 'lspc', '12', 'motls', '10', 'fine'), // rotation
  ],
  inlet: { ref: '13', gaugePlug: false },
  kit: '14',
};

export default function P404(api) {
  pvgValve(api, SPEC404);
  return { view: { dir: [0.7, 0.5, 1.1] } };
}

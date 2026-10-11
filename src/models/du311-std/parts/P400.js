// P400 — Distributeur de mise en place, 10 sections : CX038470 rév. 0 « SETUP
// VALVE, 10 SECTION - AMP » (page 400), repère 1 de P398. Danfoss PVG 32 :
// plaque d'extrémité à orifice LX (2) en bas, dix sections, couvercle d'entrée
// P / T (8) en haut. De bas en haut (schéma de la page 400, de l'orifice LX
// vers l'entrée) : stinger inférieur droit, stinger supérieur droit, stinger
// inférieur gauche, stinger supérieur gauche (corps de base 5, tiroirs de
// moteur 6,6 gal/min 3), basculement, glissière (corps PC 6, tiroirs 3),
// pivotement (corps PC 6, tiroir 1,3 gal/min PCAB 4), extension d'avance
// (corps PC 6, tiroir 3), stabilisateurs avant droit et gauche (corps de base
// 5, tiroirs 3). Chaque section : embase de poignée (1) avec levier côté +X,
// électrocommande proportionnelle fine à connecteur AMP (7) côté −X. Trois
// tirants M8 à écrous (9, trousse de joints). Orifice de manomètre #5 du
// couvercle d'entrée bouché (aucun raccord dans P398).
// Repère (commun aux PVG 32, voir _frontb.js) : origine au centre de la face
// extérieure de la plaque d'extrémité, Y le long de l'empilage, X selon les
// tiroirs (poignées vers +X, électrocommandes vers −X), +Z = face des orifices
// A / B et P / T, −Z = face de fixation. Encombrement ≈ 0.43 (X) × 0.58 (Y) ×
// 0.13 (Z) m.
import { pvgValve } from './_frontb.js';

const B = (kind, spool) => ({ body: kind === 'pc' ? '6' : '5', kind, spool, spoolKind: 'mot', handle: '1', act: '7', actKind: 'fine' });
export const SPEC400 = {
  end: { ref: '2', kind: 'lx' },
  sections: [
    B('basic', '3'), B('basic', '3'), B('basic', '3'), B('basic', '3'),
    B('pc', '3'), B('pc', '3'), B('pc', '4'), B('pc', '3'),
    B('basic', '3'), B('basic', '3'),
  ],
  inlet: { ref: '8', gaugePlug: true },
  kit: '9',
};

export default function P400(api) {
  pvgValve(api, SPEC400);
  return { view: { dir: [0.7, 0.5, 1.1] } };
}

// P230 — Électrovanne de mise à vide CX027465 rév. 0 « SOLENOID VALVE
// ASSEMBLY » (page 230), repère 4 de P226. Même ensemble que P228 (dessin
// identique) avec l'électrovanne de mise à vide CP18015-13 (1) : électrovanne
// 3 voies 1/4 NPT, raccord de gaine 1/2 po (2), joint 1/2 NPT (3), gaine
// annelée 3/8 po de 12 po (4, un objet par pouce), connecteur femelle (5),
// deux broches (6), thermorétractable 3/4 po de 2 po (7, un objet par pouce).
// Bobine de teinte différente (jaune) pour la distinguer de celle de P228.
// Repère : celui de P228 (origine au centre du corps, Y vers le haut selon
// les vis de fixation, +X côté orifices P / E, +Z côté bobine).
// Encombrement ≈ 0.07 × 0.49 × 0.09 m.
import { solenoidValveAssy } from './P228.js';

export default function P230(api) {
  solenoidValveAssy(api, { coil: 'yellow' });
  return { view: { dir: [0.8, 0.4, 1.0] } };
}

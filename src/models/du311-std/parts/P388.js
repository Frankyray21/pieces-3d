// P388 — Capteur de pression 0-5000 psi CX026663 rév. 0 « PRESSURE TRANSDUCER
// 0-5000PSI » (page 388) : capteur de pression 0-5000 psi : rotation, poussée et retenue (P382).
// Capteur inox (1, CP003743) : embase mâle ORB -04 (7/16-20) avec son joint
// torique 3-904 (2, CP005538) logé sous le six-pans de 7/8 po, corps
// cylindrique Ø 22,5 mm à gorge de marquage, collet serti, connecteur Deutsch
// DT04-3P (embase ronde, boîtier carré, clip de verrouillage et cale orange) ;
// longueur 88 mm sans l'embase (proportions de la page 388 et de la page
// 382, six-pans 7/8 po pour l'échelle). Les trois capteurs (P384, P386, P388)
// ne diffèrent que par l'étendue de mesure.
// Repère (commun aux trois capteurs, voir _frontb.js) : origine au centre de
// la face d'appui du six-pans sur le lamage de l'orifice ; l'embase filetée
// (axe de l'orifice) plonge vers −Y (y de 0 à −0.0105), le corps et le
// connecteur montent selon +Y (jusqu'à y = 0.089). Encombrement 0.025 (X) ×
// 0.1 (Y) × 0.026 (Z) m.
import { transducerBody, transducerOring } from './_frontb.js';

export default function P388(api) {
  api.part('1', transducerBody(api), [0, 0.05, 0]);
  api.part('2', transducerOring(api), [0, -0.03, 0]);
  return { view: { dir: [0.8, 0.5, 1.1] } };
}

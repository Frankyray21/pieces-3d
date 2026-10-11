// P118 — Support de vérin stinger CX033804 rév. 0 (page 118) : « ASSY,
// STINGER BRACKET », pièce 1 « REMOVABLE STINGER BRKT - HEAVY » CX005385.
// Support amovible d'un vérin stinger 50/50 (Ø 3 1/2 po, fût Ø 4 1/2 po) sur le
// flanc du mât de l'avance V30 (P032, repère 23, trois exemplaires) : bras
// oxycoupé de 2 1/4 po dont le collier fendu serre le fût du vérin (chapeau
// retenu par deux vis H 5/8 × 4 1/2 (3) sur Nord-Lock (4)), plaque d'about de
// 1 po × 4 1/2 × 8 3/4 po raidie dessus et dessous par un gousset de 3/4 po,
// boulonnée au mât par quatre vis H 5/8 × 2 1/2 (2), Nord-Lock (4) sous la tête
// et sous l'écrou, écrous H 5/8 (5) : 10 rondelles en tout.
// Variante 'tall' de _avance_a_brk.js : plaque débordant de 3 1/4 po dessus et
// dessous le bras, une vis à chaque coin.
// Repère : origine au centre de la face d'appui de la plaque d'about (contre
// le mât), à mi-hauteur du bras ; +X le long du bras vers le collier (vers
// l'extérieur du mât) ; Y vers le haut (axe du vérin) ; Z en travers. Axe de
// l'alésage à x = 0.3175 m, z = 0. Encombrement ≈ 0.43 (X, des écrous à
// −0.035 au bout des vis 3 à 0.43) × 0.22 (Y, −0.111 à +0.111) × 0.21 (Z) m.
import { stingerBracket } from './_avance_a_brk.js';

export default function P118(api) {
  return stingerBracket(api, 'tall');
}

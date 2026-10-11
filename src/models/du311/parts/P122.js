// P122 — Support de vérin stinger CX033806 rév. 0 (page 122) : « ASSY,
// STINGER BRACKET », pièce 1 « REMOVABLE STINGER BRKT - HEAVY » CX005389.
// Support amovible d'un vérin stinger 50/50 sur le flanc du mât de l'avance
// V30 (P032, repère 25, trois exemplaires, dont ceux qui portent les clapets
// d'équilibrage 35 / 36) : même bras que P118 (collier fendu Ø 4 1/2 po,
// chapeau tenu par deux vis H 5/8 × 4 1/2 (3), trou de passage et taraudages
// du clapet), mais plaque d'about courte de 1 po × 4 1/2 × 6 po qui ne déborde
// que de 1/2 po sous le bras, sans gousset inférieur, et quatre vis H 5/8
// × 2 1/2 (2) en carré au-dessus du bras (deux rangées à 1 1/2 po d'écart),
// écrous (5) et 10 rondelles Nord-Lock (4).
// Variante 'short' de _avance_a_brk.js.
// Repère : origine au centre de la face d'appui de la plaque d'about (contre
// le mât), à mi-hauteur du bras ; +X le long du bras vers le collier ; Y vers
// le haut (axe du vérin) ; Z en travers. Axe de l'alésage à x = 0.3175 m,
// z = 0. Encombrement ≈ 0.43 (X) × 0.15 (Y, de −0.041 à +0.111) × 0.21 (Z) m.
import { stingerBracket } from './_avance_a_brk.js';

export default function P122(api) {
  return stingerBracket(api, 'short');
}

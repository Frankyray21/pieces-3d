// P120 — Support de vérin stinger CX033805 rév. 0 (page 120) : « ASSY,
// STINGER BRACKET », pièce 1 « REMOVABLE STINGER BRKT - HEAVY » CX005391.
// Support amovible d'un vérin stinger 50/50 au pied de l'avance V30 (P032,
// repère 24, un de chaque côté) : même support que P118 (collier fendu Ø 4 1/2
// po, chapeau tenu par deux vis H 5/8 × 4 1/2 (3), plaque d'about de 1 po
// × 4 1/2 × 8 3/4 po à goussets dessus et dessous, quatre vis H 5/8 × 2 1/2
// (2), écrous (5), 10 rondelles Nord-Lock (4)), plus une oreille de 1 1/2 po
// soudée sous le flanc du collier, juste après la fente : bout arrondi R 1 1/4
// po, trou Ø 1 1/8 po (point d'attache, dessiné à droite sur la page 120).
// Variante 'lug' de _avance_a_brk.js.
// Repère : origine au centre de la face d'appui de la plaque d'about (contre
// le mât), à mi-hauteur du bras ; +X le long du bras vers le collier ; Y vers
// le haut (axe du vérin) ; Z en travers, l'oreille du côté −Z (axe de son trou
// à x = 0.276, z = −0.152 m). Axe de l'alésage à x = 0.3175 m, z = 0.
// Encombrement ≈ 0.43 (X) × 0.22 (Y) × 0.29 (Z, de −0.215 à +0.105) m.
import { stingerBracket } from './_avance_a_brk.js';

export default function P120(api) {
  return stingerBracket(api, 'lug');
}

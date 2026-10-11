// P162 — Trousse de raccords rapides Ø 3/8 po CX036961 rév. 0 (page 162) :
// « QUICK DISCONNECT KIT - Ø3/8" », repère 41 de l'avance P032. Même
// composition et même mise en page que P160 (voir qdKit) à la série 3/8
// ISO 7241-1 A : douille femelle (4, CX000528) à bague de verrouillage et
// billes, embout mâle (3, CX000527) ; obturateurs en plastique noir attachés
// au col : bouchon de douille (1, CP000179) et capuchon d'embout (2,
// CP000181) — repères 1 et 2 inversés par rapport à P160.
// Repère : origine à mi-chemin des deux coupleurs, dans le plan de
// l'embouchure des douilles ; Y vers le haut (axes verticaux en x = ±0.055),
// X de gauche à droite de la page, Z vers l'observateur. Paire gauche :
// douille en haut ; paire droite retournée. Vue assemblée : coupleurs
// accouplés ; éclatée : désaccouplés dans l'axe, obturateurs dégagés.
// Encombrement ≈ 0.34 (X) × 0.12 (Y) × 0.11 (Z) m.
// Cotes : série 3/8 ISO A de catalogue (douille Ø 29 × 50 mm, six pans 7/8 po ;
// embout six pans 7/8 po, nez Ø 15.4 mm, 3/8 NPT) : profils de P160 à
// l'échelle 1.22 ; attaches ≈ 88 mm d'après le dessin.
import { qdKit } from './P160.js';

const IN = 0.0254;

export default function P162(api) {
  return qdKit(api, {
    k: 1.22,
    hexF: 0.875 * IN,
    hexM: 0.875 * IN,
    tether: 0.088,
    dx: 0.055,
    ref: { female: '4', male: '3', plug: '1', cap: '2' },
  });
}

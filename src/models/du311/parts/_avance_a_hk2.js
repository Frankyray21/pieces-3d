// Fonctions communes aux trousses de boyaux P060, P084, P088 et P090 de
// l'avance V30 (repère de P032 : axe du mât selon +Y, pied à y = 0, face
// avant vers +Z). Fichier préfixé « _ » : pas un assemblage, non inscrit dans
// parts/index.js.
//
// Sièges : { p, d } (p = bout du cône mâle, d = sortie de l'écrou vers le
// flexible), comme seat() de _avance_a.js. Les composants qui reçoivent les
// boyaux (vannes, vérins, traversées) appartiennent à d'autres assemblages :
// on recalcule ici leurs sièges avec les mêmes fonctions de raccords, sans
// les dessiner, puis on les porte dans le repère de P032 par une matrice de
// pose (mount()).
import * as THREE from 'three';
import { MAST } from '../mast.js';
import { place, seat, hose } from './_avance_a.js';

export const v3 = (a) => (a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(...a));

/** Pose d'un repère local : origine o, axes locaux X et Y donnés dans P032. */
export function mount(o, X, Y) {
  const x = v3(X).normalize(), y = v3(Y).normalize();
  const z = new THREE.Vector3().crossVectors(x, y);
  return new THREE.Matrix4().makeBasis(x, y, z).setPosition(v3(o));
}
/** Siège { p, d } porté par la matrice m. */
export function xs(m, s) {
  return { p: s.p.clone().applyMatrix4(m), d: s.d.clone().transformDirection(m).normalize() };
}
/** Point / direction portés par m. */
export const xp = (m, p) => v3(p).applyMatrix4(m);
export const xd = (m, d) => v3(d).transformDirection(m).normalize();

/** Siège n° i d'un raccord fit posé en pos (axe d, orientation o) — sans l'ajouter. */
export function seatOf(fit, pos, d, o = null, i = 0) {
  return seat(place(fit, pos, d, o), i);
}

/** Siège décalé : p + d·k (bout d'un raccord vissé sur un autre). */
export const ahead = (s, k) => ({ p: s.p.clone().addScaledVector(s.d, k), d: s.d.clone() });

// ------------------------------------------------------------------ traversées du mât
// Coudes de traversée FA01001-06 du mât (P130 repère 7), dix par flanc :
// mamelon droit vers l'extérieur (±X), siège à x = ±(W/2 + 0.036), z = 0.05
// (repris de P054) ; coude côté mât, entre la cornière de traversée et le
// flanc, sortie vers l'arrière (−Z), siège estimé à x = ±(W/2 + 0.016),
// z = 0.05 − 0.042 (non dessiné par mast.js, qui ne figure qu'un raccord).
export const TRAV = {
  ys: [1.45, 1.4, 1.35, 1.3, 1.25, 1.2, 0.85, 0.8, 0.3, 0.25],
  // Répartition des sièges extérieurs : P054 (stinger) en 0.25 / 0.30 /
  // 0.80 / 0.85, P090 (raccords-unions) en 1.20 … 1.45 ; sièges des coudes
  // côté mât : P088 (boyaux venant du châssis).
  outer: (s, y) => ({ p: v3([s * (MAST.width / 2 + 0.036), y, 0.05]), d: v3([s, 0, 0]) }),
  inner: (s, y) => ({ p: v3([s * (MAST.width / 2 + 0.016), y, 0.05 - 0.042]), d: v3([0, 0, -1]) }),
};

// ------------------------------------------------------------------ flexibles
/**
 * Flexible serti (hose() de _avance_a.js) posé comme pièce `ref` : L en
 * pouces (longueur de catalogue), n = taille, a / b = sièges { p, d, end, t }.
 * Retourne l'objet ; hoseCheck (longueur libre / tracé) reste dans userData.
 */
export function addHose(api, ref, L, n, a, b, opts = {}, explode = [0, 0, 0]) {
  const g = hose(L, n, a, b, opts);
  const c = g.userData.hoseCheck;
  if (c && c.len > c.free * 1.03 && typeof process !== 'undefined' && process.env?.HK2_DEBUG) {
    console.warn(`flexible ${ref} (${L} po) : tracé ${c.len.toFixed(3)} m > libre ${c.free.toFixed(3)} m`);
  }
  api.part(ref, g, explode);
  return g;
}

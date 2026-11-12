// Mouvements de la porte 1801020 : le battant tourne autour de l'axe des pentures, vers l'avant ;
// le verrou coulisse le long du battant, vers les pentures. poser() place les corps étiquetés
// (userData.body) d'un modèle construit ; ouvertureMax() calcule l'angle où le battant touche le cadre.
import * as THREE from 'three';
import { IN, L, FACE, CADRE, BATTANT, TREPIED, PENTURE, BOULON } from './plan.js';

/** Axe des pentures dans le repère du modèle (m) : vertical, par ce point. */
export const AXE = { x: (PENTURE.x - L / 2) * IN, z: PENTURE.z * IN };
const Y = new THREE.Vector3(0, 1, 0);

/** Place le battant (angle d'ouverture en degrés, vers l'avant) et le verrou (course en pouces). */
export function poser(root, angle = 0, course = 0) {
  const q = new THREE.Quaternion().setFromAxisAngle(Y, (angle * Math.PI) / 180);
  const A = new THREE.Vector3(AXE.x, 0, AXE.z);
  root.traverse((o) => {
    const b = o.userData.body;
    if (b !== 'Battant' && b !== 'Verrou') return;
    o.quaternion.copy(q);
    o.position.set(b === 'Verrou' ? course * IN : 0, 0, 0).sub(A).applyQuaternion(q).add(A);
  });
}

// ---------------------------------------------------------------- butée d'ouverture
// Coupes horizontales (plan x, z en pouces) : le battant tourné contre les pièces fixes du côté des pentures.

const rect = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

function tourner(poly, angle) {
  const a = (angle * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return poly.map(([x, z]) => {
    const dx = x - PENTURE.x, dz = z - PENTURE.z;
    return [PENTURE.x + dx * c + dz * s, PENTURE.z - dx * s + dz * c];
  });
}

/** Deux polygones convexes se chevauchent-ils (axes séparateurs) ? */
function chevauche(A, B) {
  for (const P of [A, B]) {
    for (let i = 0; i < P.length; i++) {
      const [x0, z0] = P[i], [x1, z1] = P[(i + 1) % P.length];
      const nx = z1 - z0, nz = x0 - x1;
      const pr = (Q) => Q.map(([x, z]) => x * nx + z * nz);
      const a = pr(A), b = pr(B);
      if (Math.max(...a) <= Math.min(...b) + 1e-9 || Math.max(...b) <= Math.min(...a) + 1e-9) return false;
    }
  }
  return true;
}

/** Pièce fixe que le battant touche à cet angle (null : aucune). */
export function contact(angle) {
  const B = BATTANT, t = CADRE.tube, zb = FACE - B.tube;
  const xm = L - t / 2; // axe du montant des pentures
  const zd = TREPIED.douille.jeu / 2, zf = zd + TREPIED.douille.ep;
  const vantail = tourner(rect(B.x0, B.x1, zb, FACE), angle); // traverse du bas : toute la largeur
  const montant = tourner(rect(B.x1 - B.tube, B.x1, zb, FACE), angle);
  const fils = tourner(rect(B.x0 + B.tube, B.x1 - B.tube, zb + B.tube / 2 - B.fil / 2, zb + B.tube / 2 + B.fil / 2), angle);
  if (chevauche(vantail, rect(L - t, L, -t / 2, t / 2))) return 'montant du cadre';
  if (chevauche(vantail, rect(xm - TREPIED.douille.large / 2, xm + TREPIED.douille.large / 2, zd, zf))) return 'douille du trépied';
  const tete = rect(xm - BOULON.d * 0.95, xm + BOULON.d * 0.95, zf, zf + BOULON.d * 0.65);
  if (chevauche(montant, tete) || chevauche(fils, tete)) return 'tête du boulon de la douille';
  // Gousset avant : sa coupe à la hauteur y est un rectangle qui s'éloigne du montant vers le bas.
  const g = TREPIED.gousset, y0 = TREPIED.plaque.ep, bas = g.cote - g.large * Math.SQRT2;
  for (let y = B.y0; y <= y0 + g.cote; y += 0.125) {
    const coupe = rect(xm - g.ep / 2, xm + g.ep / 2, zf + Math.max(0, bas - (y - y0)), zf + g.cote - (y - y0));
    const sous = y <= B.y0 + B.tube; // à la hauteur de la traverse du bas
    if (sous ? chevauche(vantail, coupe) : chevauche(montant, coupe) || chevauche(fils, coupe)) return 'gousset avant du trépied';
  }
  return null;
}

/** Angle d'ouverture où le battant touche une pièce fixe, au dixième de degré, et cette pièce. */
export function ouvertureMax() {
  for (let a = 0; a <= 180; a += 0.1) {
    const c = contact(a);
    if (c) return { angle: Math.round((a - 0.1) * 10) / 10, piece: c };
  }
  return { angle: 180, piece: null };
}

const butee = ouvertureMax();
/** Ouverture : angle d'usage (animations) et angle de butée calculé. */
export const OUVERTURE = { usage: 90, max: butee.angle, butee: butee.piece };

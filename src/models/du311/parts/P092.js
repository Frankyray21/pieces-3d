// P092 — Centreur fendu V30 avec support CX033803 rév. 1 (page 92) : « ASSY,
// V30 SPLIT CENTRALIZER W/MOUNT », repère 22 de l'avance P032. Le centreur
// fendu (3, P098) pivote par ses deux moyeux sur les axes Ø 2 po du pied de
// mât (4, P116) ; deux vérins de pivotement Ø 3 × 4 1/2 po (1, P094),
// dessinés sortis (centreur dans l'axe de forage, page 92), relient les axes
// Ø 1 po du pied de mât (P116 repère 5, œil de fond) aux chapes basses du
// châssis P102 (axes P098 repère 7, œil de tige), un coude -04 × -06 (5) sur
// chaque orifice ; deux butées (2, P096) boulonnées sur la face avant du pied
// de mât, sous les bras du châssis.
// Repère : celui de P098, P102 et P116 — origine au milieu des deux axes de
// pivot, sur le dessus des moyeux avant du pied de mât (appui des moyeux bas
// du châssis), Y vers le haut (le long des tiges), X selon la ligne des
// pivots (axes à x = ±11 po = ±0.279 m), +Z vers l'axe de forage (x = 0,
// z = 20.4 po = 0.518 m), le pied de mât s'étendant vers -Z. Encombrement ≈
// 1.10 (X) × 0.82 (Y, de -0.33 sous l'entonnoir à +0.49) × 1.25 (Z, de -0.41
// à +0.84) m.
// Placement des butées estimé d'après l'isométrie de la page 92 (pied de mât
// non coté).
import { u, jicElbow } from './_avance_b.js';
import { FRAME102 } from './P102.js';
import { MOUNT116 } from './P116.js';
import { CYL094 } from './P094.js';

export default function P092(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // Objet orienté par sa base locale (X, Y ; Z = X × Y), placé en pos (m).
  const frame = (obj, X, Y, pos) => {
    const x = X.clone().normalize(), y = Y.clone().normalize();
    const z = new THREE.Vector3().crossVectors(x, y);
    const g = new THREE.Group();
    g.add(obj);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
    g.position.set(...pos);
    return g;
  };

  // 4 — pied de mât ; 3 — centreur fendu (repères confondus).
  P('4', api.sub('P116'), [0, -0.25, -0.25]);
  P('3', api.sub('P098'), [0, 0.3, 0.15]);

  // 1 — vérins de pivotement, sortis (centreur dans l'axe de forage, page 92) :
  // œil de fond sur l'axe 5 du pied de mât, œil de tige entre les chapes
  // basses du châssis ; œils verticaux.
  const { lug } = FRAME102;
  for (const s of [1, -1]) {
    const rod = V(s * lug.x, (lug.y[0] + lug.t + lug.y[1]) / 2, 0);
    const [px, pz] = MOUNT116.cylPins.find(([x]) => Math.sign(x) === s);
    const cap = V(px, MOUNT116.cylEyeY, pz);
    const Yl = rod.clone().sub(cap).normalize();
    // Z local (axes des œils) proche de la verticale ; orifices (-X local)
    // vers le haut et l'extérieur.
    const Zl = V(0, -s, 0).addScaledVector(Yl, s * Yl.y).normalize();
    const Xl = new THREE.Vector3().crossVectors(Yl, Zl);
    const g = new THREE.Group();
    g.add(api.sub('P094', { extended: true }));
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xl, Yl, Zl));
    g.position.copy(cap);
    P('1', g, [s * 0.2, -0.12, 0]);
    // 5 — coudes -04 × -06 sur les deux orifices, nez vers le fond du vérin.
    for (const py of CYL094.portY) {
      const p = cap.clone().addScaledVector(Xl, CYL094.portX).addScaledVector(Yl, py);
      P('5', frame(jicElbow(S, THREE, 4), Yl.clone().negate(), Xl.clone().negate(), p.toArray()), [s * 0.28, -0.12, 0]);
    }
  }

  // 2 — butées : semelle contre la face avant du pied de mât (Y local → +Z),
  // dosseret vers le bas, sous les bras du châssis.
  for (const s of [1, -1]) {
    const st = api.sub('P096');
    P('2', frame(st, V(1, 0, 0), V(0, 0, 1), [s * u(6.5), -u(3.2), u(2.5)]), [0, -0.12, 0.15]);
  }

  return { view: { dir: [1, 0.75, 1.2] } };
}

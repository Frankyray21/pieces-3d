// P126 — Collecteur du centreur fendu CX033812 rév. 0 (page 126) : « ASSY,
// MANIFOLD - SPLIT CENTRALIZER », repère 30 de l'avance P032. Le bloc de
// pivotement du centreur (1, P128) est monté debout, valves de séquence vers
// le bas, sa face d'appui contre la tôle support : deux vis H 3/8-16 × 5 1/4
// po (5) le traversent depuis la face des cartouches, sous rondelles
// Nord-Lock (6). Huit adaptateurs droits ORB → JIC -06 (4) sur les orifices
// SAE 6 : CSR1, CSR2, CSP en haut, PA / PB sur la face arrière, CLP, CLR et T
// sur la face avant ; té de branchement à écrou tournant (2) sur CSP, run
// horizontal ; coude 90° à écrou tournant (3) sur T, tourné vers le bas.
// Repère : origine au centre de la face d'appui du bloc (vis selon Z), Y vers
// le haut (le long du bloc, de la face des valves de séquence vers celle des
// orifices CS), +Z vers la face des cartouches (têtes de vis), +X vers la face
// avant du bloc (T, CLP, CLR) ; P128 y est tourné : son X → Y, son Y → Z, son
// Z → X. Encombrement ≈ 0.17 (X) × 0.24 (Y, de -0.115 à 0.125) × 0.16 (Z,
// de -0.019 au bout des vis à 0.152) m.
import { u, along, hhcs, nordLock, jicAdapter, jicElbow } from './_avance_b.js';
import { MAN128 } from './P128.js';

// P128 → P126 : (x, y, z) → (z, x, y).
const map = ([x, y, z]) => [z, x, y];

export default function P126(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  // Objet dont le +Y local va selon yDir et le +X local selon xDir, en pos (m).
  const frame = (obj, yDir, xDir, pos) => {
    const Y = new THREE.Vector3(...yDir).normalize();
    const X = new THREE.Vector3(...xDir).normalize();
    const Z = new THREE.Vector3().crossVectors(X, Y);
    const g = new THREE.Group();
    g.add(obj);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
    g.position.set(...pos);
    return g;
  };

  // 1 — bloc P128, tourné : X128 → Y, Y128 → Z, Z128 → X.
  const blk = api.sub('P128');
  const g1 = new THREE.Group();
  g1.add(blk);
  g1.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0)));
  P('1', g1, [0, 0, 0]);

  // 4 — adaptateurs droits -06 sur les huit orifices SAE 6.
  const NOSE = 0.83; // hauteur (po) où l'écrou tournant d'un raccord vient serrer le nez JIC
  const ports = {};
  for (const [k, { p, n }] of Object.entries(MAN128.ports)) {
    const pos = map(p).map(u), nn = map(n);
    ports[k] = { pos, n: nn };
    P('4', along(THREE, jicAdapter(S, THREE, 6), nn, pos), nn.map((v) => v * 0.06));
  }

  // 2 — té à écrou tournant sur CSP : écrou sur le branchement, run selon Z.
  {
    const { pos, n } = ports.CSP;
    const at = pos.map((v, i) => v + u(NOSE) * n[i]);
    P('2', frame(jicElbow(S, THREE, 6, { swivel: true, tee: true }), n, [0, 0, 1], at), [0, 0.13, 0]);
  }
  // 3 — coude 90° à écrou tournant sur T, nez vers le bas.
  {
    const { pos, n } = ports.T;
    const at = pos.map((v, i) => v + u(NOSE) * n[i]);
    P('3', frame(jicElbow(S, THREE, 6, { swivel: true }), n, [0, -1, 0], at), [0.12, -0.03, 0]);
  }

  // 5 — vis H 3/8-16 × 5 1/4 traversant le bloc depuis la face des
  // cartouches ; 6 — rondelles Nord-Lock (paire) sous les têtes.
  const BY = MAN128.size[1];
  const tNL = u(2 * Math.max(0.05, 0.375 * 0.11));
  for (const [x, z] of MAN128.bolts) {
    const [X, Y] = map([x, 0, z]).map(u);
    P('6', at(nordLock(S, THREE, 0.375), [X, Y, BY], [Math.PI / 2, 0, 0]), [0, 0, 0.05]);
    P('5', at(hhcs(S, THREE, 0.375, 5.25), [X, Y, BY + tNL], [Math.PI / 2, 0, 0]), [0, 0, 0.17]);
  }
  function at(o, p, r) { o.position.set(...p); if (r) o.rotation.set(...r); return o; }

  return { view: { dir: [0.9, 0.6, 1.1] } };
}

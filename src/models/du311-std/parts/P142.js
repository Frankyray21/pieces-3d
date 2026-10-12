// P142 — Collecteur du bras de carrousel CX036934 rév. 0 (page 142) : « ASSY,
// MANIFOLD - CAROUSEL ARM ». Bloc de valves de séquence (1, P144) garni de
// ses raccords, fixé dans le distributeur du carrousel (P140) :
// - cinq adaptateurs droits ORB → JIC -06 (7) sous le bloc, coiffés de deux
//   coudes tournants 90° (3), deux tés tournants (4) et un coude tournant 45°
//   (2) ;
// - coude ORB -08 → JIC -06 (6) sous le bloc ; deux coudes ORB → JIC -06 (5)
//   sur la face -X ;
// - deux vis 3/8 × 3 1/4 (8) traversant le bloc selon Z, rondelles
//   Nord-Lock (9).
// Repère : celui de P144 (centre de la face inférieure du bloc, Y vers le
// haut, X selon la longueur, face avant +Z ; les vis entrent par la face
// avant). Encombrement ≈ 0.21 × 0.15 × 0.11 m.
// Cotes : tailles des raccords et des vis de la liste ; orientation des nez
// d'après les quatre vues isométriques de P142.
import { u, place, frame, fitStraight, fitElbow, fitTee, boltStack } from './_carousel.js';
import { PORTS144 } from './P144.js';

export default function P142(api) {
  const P = (ref, obj, e) => api.part(ref, obj, e);
  P('1', api.sub('P144'), [0, 0.06, 0]);
  const V = (x, y, z) => [u(x), u(y), u(z)];
  const down = [0, -1, 0];
  const tip = 0.82; // bout du nez JIC -06 d'un adaptateur droit (po sous la face)
  // adaptateurs et pièces tournantes : nez horizontaux orientés (angle autour de -Y)
  const caps = [['3', 0], ['3', Math.PI / 2], ['4', 0], ['4', Math.PI / 2], ['2', Math.PI]];
  PORTS144.bottom.slice(0, 5).forEach(([x, z], i) => {
    P('7', place(api, fitStraight(api, 6), V(x, 0, z), down), [0, -0.05, 0]);
    const [ref, a] = caps[i];
    const obj = ref === '4' ? fitTee(api, 6) : fitElbow(api, 6, 6, { swivel: true, angle: ref === '2' ? 45 : 90 });
    P(ref, place(api, obj, V(x, -tip, z), down, a), [0, -0.1, 0]);
  });
  const [x6, z6] = PORTS144.bottom[5];
  P('6', place(api, fitElbow(api, 8, 6), V(x6, 0, z6), down, -Math.PI / 2), [0, -0.08, 0]);
  for (const [y, z] of PORTS144.endX) P('5', frame(api, fitElbow(api, 6, 6), [0, 0, z > 0 ? 1 : -1], [-1, 0, 0], V(PORTS144.B.x0, y, z)), [-0.08, 0, 0]);
  for (const [x, y] of PORTS144.bolts) {
    const s = boltStack(api, V(x, y, PORTS144.B.d / 2), [0, 0, 1], 0.375, 3.25, { washer: 'nord' });
    P('9', s.washer, [0, 0, 0.06]);
    P('8', s.bolt, [0, 0, 0.1]);
  }
  return { view: { dir: [0.7, -0.5, 1] } };
}

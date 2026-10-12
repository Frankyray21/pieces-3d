// P146 — Distributeur du carrousel garni CX038076 rév. 0 (page 146) : « ASSY,
// VALVE BANK, CAROUSEL ». Distributeur PVG 32 à trois sections (1, P148) et
// ses raccords, fixé au dos dans l'équerre du distributeur (1 de P140) :
// - orifices A : trois coudes ORB -10 → JIC -06 (4), nez vers -X ;
// - orifices B : trois adaptateurs droits ORB -10 → JIC -06 (7) coiffés de
//   coudes tournants -06 (2), nez vers +X (devant les PVEO) ;
// - orifice P : coude ORB -12 → JIC -08 (5) ; orifice T : adaptateur droit
//   ORB -12 → JIC -08 (8) et coude tournant -08 (3) ;
// - prise LS : adaptateur droit ORB -05 → JIC -06 (6) sur la face +X du
//   couvercle d'entrée ;
// - quatre vis 5/16 × 3/4 (9) et rondelles Nord-Lock (10) au dos (plaque
//   d'extrémité et couvercle d'entrée) au travers de l'équerre de 1/4 po.
// Repère : celui de P148 (centre de la face inférieure de la plaque
// d'extrémité, Y le long de l'empilage, X selon les tiroirs, +Z face des
// orifices). Encombrement ≈ 0.33 × 0.25 × 0.16 m.
// Cotes : tailles des raccords et des vis de la liste ; orifices du PVG 32
// (A / B SAE -10, P / T SAE -12, LS SAE -05).
import { u, place, frame, fitStraight, fitElbow, boltStack } from './_carousel.js';
import { PVG148 } from './P148.js';

export default function P146(api) {
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { w, d, sec, inlet, end, H } = PVG148;
  P('1', api.sub('P148'), [0, 0, -0.1]);
  const face = d / 2;
  const out = [0, 0, 1];
  const ys = [0, 1, 2].map((i) => end + sec * (i + 0.5));
  for (const y of ys) {
    P('4', frame(api, fitElbow(api, 10, 6), [-1, 0, 0], out, [-0.024, y, face]), [-0.05, 0, 0.1]);
    P('7', place(api, fitStraight(api, 10, 6), [0.024, y, face], out), [0.03, 0, 0.1]);
    P('2', frame(api, fitElbow(api, 6, 6, { swivel: true }), [1, 0, 0], out, [0.024, y, face + u(0.94)]), [0.06, 0, 0.16]);
  }
  const yi = H - inlet / 2 - 0.004;
  P('5', frame(api, fitElbow(api, 12, 8), [0, 1, 0], out, [-0.028, yi, face]), [-0.05, 0.05, 0.1]);
  P('8', place(api, fitStraight(api, 12, 8), [0.03, yi, face], out), [0.03, 0.05, 0.1]);
  P('3', frame(api, fitElbow(api, 8, 8, { swivel: true }), [0, 1, 0], out, [0.03, yi, face + u(1.2)]), [0.06, 0.08, 0.16]);
  P('6', place(api, fitStraight(api, 5, 6), [w / 2, H - inlet / 2 - 0.012, 0.025], [1, 0, 0]), [0.08, 0.05, 0]);
  const back = -d / 2 - u(0.25);
  for (const y of [end / 2, H - inlet / 2]) for (const sx of [-1, 1]) {
    const s = boltStack(api, [sx * 0.035, y, back], [0, 0, -1], 0.3125, 0.75, { washer: 'nord' });
    P('10', s.washer, [0, 0, -0.06]);
    P('9', s.bolt, [0, 0, -0.1]);
  }
  return { view: { dir: [1, 0.6, 1.2] } };
}

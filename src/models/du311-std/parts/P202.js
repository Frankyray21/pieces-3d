// P202 — Distributeur d'avance monté « ASSY, ACCRA FEED MANIFOLD BLOCK »
// CX038916 rév. 0 (page 202, deux isométriques ; implantation d'après le
// détail D de P166). Bloc ACCRA (1, P204) vissé sur la face avant de la
// paroi arrière du châssis avant, au milieu, entre les chapes des vérins de
// basculement, par quatre vis H 1/2 × 1 1/4 filetées (9) et rondelles
// Nord-Lock SP (10) dans les lamages des coins ; raccords des orifices :
// té de branchement à écrou tournant -6 (2), coudes 45° ORB → JIC -12 (3),
// coude 90° -6 (4), coudes 90° -12 (5), coude 90° long -6 (6), raccords
// droits ORB -4 → JIC -6 (7) et ORB → JIC -12 (8).
// Repère : celui de la machine (X vers l'avant, Y vers le haut, Z à droite),
// placé à l'identité par P164 ; P204 posé en MAN (face d'appui −Z de P204
// sur la paroi arrière, x = M.nose + 1 1/4 po ; ses axes : x → −Z, y → +Y,
// z → +X).
// Encombrement ≈ 0.25 × 0.33 × 0.36 m.
// Simulation : tout suit le châssis avant (« front »).

import { body } from '../layout.js';
import { IN, u, M, L, frame, hexPrism, hhcs, nordLock, jicAdapter, jicElbow } from './_slide.js';
import { MAN204, onFace204 } from './P204.js';

export const MAN = [M.nose + 1.25 * IN + MAN204.size[2] / 2, 0.87, 0];

export default function P202(api) {
  const { THREE, S } = api;
  const { merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (obj) => body('front', obj);
  const EX = [0, 0, -1], EY = [0, 1, 0], EZ = [1, 0, 0];
  const place = (obj) => F(frame(THREE, obj, MAN, EX, EY, EZ));
  const on = (obj, f, a, b) => place(onFace204(THREE, obj, f, a, b));
  // déplacement éclaté selon la normale de la face (repère machine)
  const N = { '+z': [1, 0, 0], '+y': [0, 1, 0], '-y': [0, -1, 0], '+x': [0, 0, -1], '-x': [0, 0, 1] };
  const ex = (f, k = 0.15) => N[f].map((v) => v * k);

  // 1 — distributeur ACCRA
  P('1', place(api.sub('P204')), [0.25, 0, 0]);

  // 9 + 10 — vis de fixation dans les lamages des coins de la face avant
  for (const [a, b] of [[-3.0, -2.5], [3.0, -2.5], [-3.0, 2.5], [3.0, 2.5]]) {
    P('10', on(nordLock(S, THREE, 0.5), '+z', a, b), ex('+z', 0.3));
    P('9', on(group(at(hhcs(S, THREE, 0.5, 1.25), [0, u(0.11), 0])), '+z', a, b), ex('+z', 0.36));
  }

  // Coude 45° ORB → JIC -12 : six-pans et queue ORB, corps incliné, nez JIC.
  const elbow45 = () => {
    const nose = group(jicAdapter(S, THREE, 12));
    nose.rotation.z = -Math.PI / 4;
    nose.position.set(u(0.35), u(0.95), 0);
    return group(
      merged([
        hexPrism(S, THREE, 1.4, 0.5, 0, 0, 'zinc'),
        L(S, [[0, -0.85], ...S.thread(0.531, -0.85, -0.12, { pitch: 0.055, maxTurns: 6 }), [0.48, -0.12], [0.48, 0], [0, 0]], 'zinc', 16),
        at(L(S, [[0, 0], [0.55, 0], [0.55, 0.6], [0, 0.6]], 'zinc', 16), [0, u(0.45), 0], [0, 0, -Math.PI / 8]),
      ], 'zinc'),
      nose,
    );
  };
  // Coude 90° long -6 : corps rallongé sous le coude.
  const longElbow = () => group(
    at(jicElbow(S, THREE, 6), [0, u(0.9), 0]),
    L(S, [[0, -0.5], ...S.thread(0.281, -0.5, -0.1, { pitch: 0.055, maxTurns: 4 }), [0.36, 0], [0.36, 0.9], [0, 0.9]], 'zinc', 14),
  );

  // Raccords des orifices (face de P204, position a, b en po).
  const fits = [
    ['8', () => jicAdapter(S, THREE, 12), '+x', 0.2, 0.0], ['5', () => jicElbow(S, THREE, 12), '+x', -1.4, -1.1],
    ['8', () => jicAdapter(S, THREE, 12), '-x', 1.3, -2.2], ['3', elbow45, '-x', 0.0, 0.2],
    ['5', () => jicElbow(S, THREE, 12), '+y', 1.5, -0.8], ['8', () => jicAdapter(S, THREE, 12), '+y', -1.5, -0.9],
    ['3', elbow45, '-y', -2.2, 1.6], ['8', () => jicAdapter(S, THREE, 12), '-y', 2.2, 1.6],
    ['2', () => jicElbow(S, THREE, 6, { swivel: true, tee: true }), '+y', -2.8, 1.8],
    ['4', () => jicElbow(S, THREE, 6), '+y', 2.9, -1.9], ['6', longElbow, '+y', 0.2, 0.4],
    ['7', () => jicAdapter(S, THREE, 4, { jicDash: 6 }), '+z', 0.85, 0.65], ['7', () => jicAdapter(S, THREE, 4, { jicDash: 6 }), '+z', -0.85, 0.65],
    ['7', () => jicAdapter(S, THREE, 4, { jicDash: 6 }), '+x', 1.8, -0.2],
  ];
  for (const [ref, make, f, a, b] of fits) P(ref, on(make(), f, a, b), ex(f));
  return { view: { dir: [1, 0.6, 0.9] } };
}

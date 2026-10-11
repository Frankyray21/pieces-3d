// P200 — Clapet de retenue de charge « ASSY, LOAD CHECK » CX038715 rév. 1
// (page 200, isométrique ; implantation d'après le détail D de P166).
// Bloc en acier (1, CP47573-1) à deux cartouches (« VALVE 1 », « VALVE 2 »)
// vissé sur la face avant de la paroi arrière du châssis avant, sous le
// distributeur d'avance (P202), par deux vis H 5/16 × 2 (4) et rondelles
// Nord-Lock (5) ; trois coudes 90° NPT mâle 1/4 → JIC -6 (2) sur les
// orifices des faces latérales et du dessus, bouchon NPT 1/4 à six-pans
// creux (3) sur la face avant.
// Repère : celui de la machine (X vers l'avant, Y vers le haut, Z à droite),
// placé à l'identité par P164 ; face d'appui du bloc sur la paroi arrière de
// P180 (x = M.nose + 1 1/4 po), centre en y = 0.60, z = −0.10.
// Encombrement ≈ 0.09 × 0.10 × 0.12 m (raccords compris).
// Simulation : tout suit le châssis avant (« front »).

import { body } from '../layout.js';
import { IN, u, M, bx, along, frame, hhcs, nordLock, nptElbow, nptPlug, hexPrism, L } from './_slide.js';

export default function P200(api) {
  const { THREE, S } = api;
  const { merged, group, at, box } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (obj) => body('front', obj);
  const put = (obj, p, dir) => along(THREE, obj, dir, p);
  const x0 = M.nose + 1.25 * IN, yc = 0.6, zc = -0.1;
  const D = 2.0 * IN, Hh = 2.25 * IN, W = 3.0 * IN; // bloc : épaisseur (X), hauteur (Y), largeur (Z)
  const x1 = x0 + D;

  // 1 — bloc et ses deux cartouches (six-pans 7/8, corps et bouchon de réglage) sur la face avant
  const cart = () => group(
    merged([hexPrism(S, THREE, 0.875, 0.32, 0, 0, 'zinc'), L(S, [[0, 0.32], [0.3, 0.32], [0.3, 0.55], [0.26, 0.6], [0, 0.6]], 'zinc', 16)], 'zinc'),
  );
  P('1', F(group(
    bx(S, x0, x1, yc - Hh / 2, yc + Hh / 2, zc - W / 2, zc + W / 2, 'steel', 0.002),
    // marquage en creux suggéré (cadre des étiquettes « VALVE 1 / VALVE 2 »)
    merged([-0.019, 0.019].map((z) => at(box(0.0004, 0.012, 0.03, 'darkSteel'), [x1 + 0.0002, yc + 0.018, zc + z])), 'darkSteel'),
    ...[-0.019, 0.019].map((z) => put(cart(), [x1, yc - 0.008, zc + z], [1, 0, 0])),
  )), [0.12, 0, 0]);
  // 4 + 5 — vis de fixation (têtes sur la face avant)
  for (const dy of [-0.02, 0.022]) {
    const p = [x1, yc + dy, zc + (dy > 0 ? -0.03 : 0.03)];
    P('5', F(put(nordLock(S, THREE, 0.3125), p, [1, 0, 0])), [0.2, 0, 0]);
    P('4', F(put(hhcs(S, THREE, 0.3125, 2.0), [p[0] + 0.0025, p[1], p[2]], [1, 0, 0])), [0.26, 0, 0]);
  }
  // 2 — coudes NPT 1/4 → JIC -6 : faces ±Z et dessus, nez vers l'avant
  const ports = [
    [[x0 + D / 2, yc, zc - W / 2], [0, 0, -1]],
    [[x0 + D / 2, yc, zc + W / 2], [0, 0, 1]],
    [[x0 + D / 2, yc + Hh / 2, zc], [0, 1, 0]],
  ];
  for (const [p, n] of ports) {
    const ez = [n[1] * 0 - n[2] * 0, n[2] * 1 - n[0] * 0, n[0] * 0 - n[1] * 1];
    P('2', F(frame(THREE, nptElbow(S, THREE, 6, { male: true, nptDash: 4 }), p.map((v, i) => v + n[i] * u(0.15)), [1, 0, 0], n, ez)), n.map((v) => v * 0.1));
  }
  // 3 — bouchon NPT 1/4 à six-pans creux noyé (face avant, en bas)
  P('3', F(put(nptPlug(S, THREE, 4), [x1, yc - 0.022, zc], [1, 0, 0])), [0.1, -0.03, 0]);
  return { view: { dir: [1, 0.6, 0.8] } };
}

// P186 — Support de caméra de translation « ASSY, TRAMMING CAMERA MOUNT »
// CX037697 rév. 1 (page 186, vue éclatée). Sur la face avant du caisson
// latéral gauche du châssis avant (P180), sous la glissière, regard vers
// l'avant : support en coin (3) vissé par deux vis H 5/16 × 3/4 (7) et
// rondelles Nord-Lock (8) ; capot de caméra en tôle (5) posé sur le support,
// tenu par une vis H 5/16 × 1/2 (6) et sa rondelle (8) ; plaque arrière (4)
// sur deux goujons du capot, écrous 5/16 (9) et rondelles (8) ; caméra
// couleur à obturateur chauffant (1) dans le capot ; faisceau Rosco 60 pi
// (2) sortant par un passe-fil de la plaque arrière, le long du caisson vers
// le nez du porteur (seul son départ est dessiné, ≈ 1.6 m).
// Repère : celui de la machine (X vers l'avant, Y vers le haut, Z à droite),
// placé à l'identité par P164 ; face d'appui du support sur la face avant du
// caisson en CAM (x = M.nose + 0.70, y = 0.72, z = −0.55).
// Encombrement ≈ 0.16 × 0.17 × 0.13 m (sans le faisceau).
// Simulation : tout suit le châssis avant (« front »).

import { body } from '../layout.js';
import { IN, M, slabZ, bx, along, hhcs, hexNut, nordLock, washerD } from './_slide.js';

export const CAM = [M.nose + 0.70, 0.72, -0.55];

export default function P186(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, merged, group, at, cable, plate } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (obj) => body('front', obj);
  const [cx, cy, cz] = CAM;
  const put = (obj, p, dir) => along(THREE, obj, dir, p);
  const t = 0.0048; // tôle 3/16 po

  // 3 — support en coin : flasque d'appui percé de deux trous, deux joues trapézoïdales, dessus horizontal
  const side = [[0, -0.085], [0, 0], [0.13, 0], [0.13, -0.012], [0.012, -0.085]];
  P('3', F(group(merged([
    bx(S, cx, cx + t, cy - 0.09, cy + 0.005, cz - 0.065, cz + 0.065, 'black'),
    at(slabZ(S, side, -0.06, -0.06 + t, 'black'), [cx, cy, cz]),
    at(slabZ(S, side, 0.06 - t, 0.06, 'black'), [cx, cy, cz]),
    bx(S, cx, cx + 0.13, cy - t, cy, cz - 0.06, cz + 0.06, 'black'),
  ], 'black'))), [0.08, -0.05, 0]);
  // 7 + 8 — vis du support dans la face du caisson
  for (const z of [cz - 0.035, cz + 0.035]) {
    const p = [cx + t, cy - 0.05, z];
    P('8', F(put(nordLock(S, THREE, 0.3125), p, [1, 0, 0])), [0.14, -0.05, 0]);
    P('7', F(put(hhcs(S, THREE, 0.3125, 0.75), [p[0] + 0.0025, p[1], p[2]], [1, 0, 0])), [0.2, -0.05, 0]);
  }

  // 5 — capot de caméra : caisson en tôle ouvert devant (cadre) et derrière, deux goujons arrière
  const y0 = cy, y1 = cy + 0.11, x0 = cx + 0.012, x1 = cx + 0.13, z0 = cz - 0.06, z1 = cz + 0.06;
  P('5', F(group(merged([
    bx(S, x0, x1, y0, y0 + t, z0, z1, 'black'),
    bx(S, x0, x1, y1 - t, y1, z0, z1, 'black'),
    bx(S, x0, x1, y0, y1, z0, z0 + t, 'black'),
    bx(S, x0, x1, y0, y1, z1 - t, z1, 'black'),
    // cadre avant (lèvre pare-soleil)
    bx(S, x1 - t, x1 + 0.012, y1 - 0.016, y1, z0, z1, 'black'),
    bx(S, x1 - t, x1, y0, y0 + 0.012, z0, z1, 'black'),
    // pattes arrière et goujons 5/16
    bx(S, x0, x0 + t, y0 + 0.02, y1 - 0.02, z0 - 0.018, z0 + t, 'black'),
    bx(S, x0, x0 + t, y0 + 0.02, y1 - 0.02, z1 - t, z1 + 0.018, 'black'),
    ...[z0 - 0.009, z1 + 0.009].map((z) => at(cyl(0.004, 0.03, 'zinc', { axis: 'x', seg: 8 }), [x0 - 0.012, (y0 + y1) / 2, z])),
  ], 'black'))), [0.1, 0.08, 0]);
  // 6 + 8 — vis du capot sur le support (par l'intérieur du capot)
  P('8', F(at(washerD(S, 0.3125 * IN, 'zinc', { od: 0.6 * IN, t: 0.06 * IN }), [cx + 0.1, y0 + t, cz])), [0.1, 0.12, 0]);
  P('6', F(at(hhcs(S, THREE, 0.3125, 0.5), [cx + 0.1, y0 + t + 0.0015, cz])), [0.1, 0.16, 0]);

  // 4 — plaque arrière, 9 + 8 — écrous et rondelles sur les goujons
  P('4', F(at(plate(0.105, 0.162, 0.003, 'black', { holes: [[0, -0.069, 0.0045], [0, 0.069, 0.0045], [0.02, 0, 0.007]], r: 0.006 }), [x0 - 0.0035, (y0 + y1) / 2, cz], [0, 0, Math.PI / 2])), [-0.1, 0, 0]);
  for (const z of [z0 - 0.009, z1 + 0.009]) {
    const p = [x0 - 0.005, (y0 + y1) / 2, z];
    P('8', F(put(nordLock(S, THREE, 0.3125), p, [-1, 0, 0])), [-0.14, 0, 0]);
    P('9', F(put(hexNut(S, THREE, 0.3125), [p[0] - 0.0025, p[1], p[2]], [-1, 0, 0])), [-0.17, 0, 0]);
  }

  // 1 — caméra : boîtier noir à ailettes, collerette, hublot chauffant et obturateur, presse-étoupe arrière
  const cam = group(
    merged([
      at(box(0.08, 0.06, 0.075, 'black', { r: 0.008 }), [0, 0, 0]),
      ...[-0.02, -0.005, 0.01].map((y) => at(box(0.06, 0.003, 0.08, 'black'), [-0.005, y + 0.032, 0])),
      at(lathe([[0, 0], [0.026, 0], [0.026, 0.012], [0.022, 0.016], [0, 0.016]], 'black', { axis: 'x', seg: 28 }), [0.04, 0, 0]),
      at(lathe([[0, 0], [0.007, 0], [0.007, 0.012], [0, 0.012]], 'black', { axis: '-x', seg: 12 }), [-0.04, 0, 0]),
    ], 'black'),
    at(cyl(0.017, 0.002, 'glass', { axis: 'x', seg: 24 }), [0.0565, 0, 0]),
    at(box(0.002, 0.014, 0.032, 'zinc'), [0.0575, -0.02, 0]),
  );
  P('1', F(at(cam, [cx + 0.07, cy + 0.052, cz])), [0.15, 0.05, 0]);

  // 2 — faisceau Rosco : départ par le passe-fil de la plaque arrière, le long du caisson vers l'arrière
  P('2', F(cable([
    [cx - 0.004, cy + 0.055, cz + 0.02], [cx - 0.05, cy + 0.06, cz + 0.02], [cx - 0.12, cy - 0.05, cz - 0.06],
    [cx - 0.3, cy - 0.12, cz - 0.08], [cx - 0.65, cy - 0.12, cz - 0.08], [M.nose + 0.05, cy - 0.1, cz - 0.08], [M.nose + 0.01, cy - 0.16, cz - 0.03],
  ], 0.004, { seg: 48 })), [-0.2, 0, -0.1]);

  return { view: { dir: [1, 0.5, -1] } };
}

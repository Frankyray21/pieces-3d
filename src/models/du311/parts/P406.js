// P406 — Trousse d'outils : vérin de débrayage CX034793 (page 406, sans
// illustration) : vérin hydraulique de débrayage (7) qui pousse sur le manche
// de la clé P402, ses deux axes d'œil Ø 1 po (1) et leurs goupilles fendues
// (4), raccord rapide 1/4 po mâle (5) vissé dans l'orifice du vérin et coiffé
// de son capuchon (2), raccord rapide 1/4 po femelle (6) bouché par son
// bouchon (3), à brancher sur le flexible de la machine.
// Outils posés à plat comme rangés dans leur bac.
// Repère : origine au centre de l'emprise, sur le plan de pose (fond du bac) ;
// Y vers le haut ; vérin le long de X (tige vers +X), axes et raccords devant
// lui (vers -Z). Encombrement ≈ 0.43 (X) × 0.07 (Y) × 0.20 (Z) m.
// Pas de dessin : vérin d'environ Ø 2 po × course 4 po (longueur rentrée
// 13 po) estimé pour pousser le manche de la clé ; raccords 1/4 po ISO A.

const IN = 0.0254;
const u = (v) => v * IN;

export default function P406(api) {
  const { S } = api;
  const { lathe, thread, extrude, merged, at, group, nut, torus, cyl } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v3 = (x, y, z) => [u(x), u(y), u(z)];
  const Lx = (pts, mat, seg = 24) => lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg, axis: 'x' });
  const Ly = (pts, mat, seg = 14) => lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg });

  // ================================================ 7 — vérin de débrayage
  // Couché le long de X, axe à y = 1.5 po ; yeux percés selon Y (posés à plat).
  const yc = 1.5, x0 = -6.5;
  const eye = (cx, dir) => {
    const pts = [];
    for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + (i / 16) * Math.PI; pts.push([cx + dir * 1.0 * Math.cos(a), 1.0 * Math.sin(a)]); }
    pts.push([cx - dir * 1.1, 0.8], [cx - dir * 1.1, -0.8]);
    let ar = 0;
    pts.forEach(([a0, b0], i) => { const [a1, b1] = pts[(i + 1) % pts.length]; ar += a0 * b1 - a1 * b0; });
    const p = ar < 0 ? pts.reverse() : pts;
    const m = extrude(p.map(([x, z]) => [u(x), u(z)]), u(1.0), 'red', { holes: [[u(cx), 0, u(0.52)]] });
    m.rotation.x = Math.PI / 2;
    const g = group(m);
    g.position.y = u(yc);
    return g;
  };
  P('7', group(
    merged([
      // fût Ø 2 1/2, fond et tête
      Lx([[0, x0 + 1.1], [1.15, x0 + 1.1], [1.25, x0 + 1.2], [1.25, x0 + 10.9], [1.15, x0 + 11.0], [0.4, x0 + 11.0], [0, x0 + 11.0]], 'red', 28),
      eye(x0, -1),
      // bossage de l'orifice (dessus, côté fond)
      at(cyl(u(0.4), u(0.35), 'red', { seg: 16 }), v3(x0 + 2.0, yc + 1.2, 0)),
    ], 'red'),
    // tige chromée Ø 1 1/4 et œil de tige
    Lx([[0, x0 + 11.0], [0.625, x0 + 11.0], [0.625, x0 + 12.6], [0.5, x0 + 12.8], [0, x0 + 12.8]], 'chrome', 20),
    eye(x0 + 13.9, 1),
    // racleur à la sortie de la tête
    Lx([[0.62, x0 + 10.98], [0.8, x0 + 10.98], [0.8, x0 + 11.08], [0.62, x0 + 11.08]], 'rubber', 20),
  ), [0, 0.04, 0]);

  // 5 — raccord rapide mâle 1/4 (vissé dans l'orifice) et 2 — capuchon
  const xm = x0 + 2.0, ym = yc + 1.37;
  P('5', group(merged([
    at(nut(u(0.5625), u(0.25), 'zinc'), v3(xm, ym + 0.125, 0)),
    Ly([[0, ym - 0.3], [0.2, ym - 0.3], [0.2, ym], [0, ym]], 'zinc', 12).translateX(u(xm)),
    Ly([[0, ym + 0.25], [0.24, ym + 0.25], [0.24, ym + 0.5], [0.2, ym + 0.55], [0.2, ym + 0.68], [0.25, ym + 0.75], [0.25, ym + 0.85], [0.18, ym + 0.95], [0, ym + 0.95]], 'brass', 16).translateX(u(xm)),
  ], 'brass')), [0, 0.05, 0]);
  P('2', Ly([[0.2, ym + 0.55], [0.36, ym + 0.55], [0.36, ym + 1.2], [0.3, ym + 1.25], [0, ym + 1.25], [0, ym + 1.05], [0.2, ym + 1.05]], 'rubber', 16).translateX(u(xm)), [0, 0.09, 0]);

  // 6 — raccord rapide femelle 1/4 (douille moletée, couché selon X) et 3 — bouchon
  const zf = -3.2, xf = 2.0;
  P('6', merged([
    Lx([[0, xf - 0.6], [0.2, xf - 0.6], [0.2, xf - 0.3], [0, xf - 0.3]], 'brass', 12),
    at(nut(u(0.6875), u(0.3), 'brass', { axis: 'x' }), v3(xf - 0.15, 0.4, zf)),
    Lx([[0, xf], [0.42, xf], [0.45, xf + 0.1], [0.45, xf + 0.9], [0.4, xf + 1.0], [0.3, xf + 1.0], [0, xf + 1.0]], 'brass', 20),
  ].map((m, i) => (i === 1 ? m : at(m, v3(0, 0.45, zf)))), 'brass'), [0, 0.04, -0.03]);
  P('3', at(Lx([[0, xf + 0.9], [0.24, xf + 0.9], [0.3, xf + 1.0], [0.36, xf + 1.0], [0.36, xf + 1.35], [0, xf + 1.35]], 'rubber', 16), v3(0, 0.45, zf)), [0.04, 0.03, -0.03]);

  // 1 — axes d'œil Ø 1 po × 3 1/2 (collet, trou de goupille), 4 — goupilles fendues
  for (const [k, x] of [[0, -4.5], [1, -0.5]]) {
    const z = -6.0;
    P('1', at(Lx([[0, -1.75], [0.65, -1.75], [0.65, -1.45], [0.5, -1.42], [0.5, 1.65], [0.45, 1.75], [0, 1.75]], 'zinc', 20), v3(x, 0.65, z)), [0, 0.05, -0.02 * k]);
    // goupille fendue 3/16 × 1 1/2 posée à côté de son axe : boucle et deux brins
    P('4', group(merged([
      torus(u(0.16), u(0.05), 'zinc', { axis: 'y', pos: v3(x + 2.6, 0.05, z) }),
      at(cyl(u(0.05), u(1.4), 'zinc', { axis: 'x', seg: 8 }), v3(x + 3.45, 0.05, z + 0.05)),
      at(cyl(u(0.05), u(1.2), 'zinc', { axis: 'x', seg: 8 }), v3(x + 3.35, 0.05, z - 0.05)),
    ], 'zinc')), [0.03, 0.05, 0]);
  }

  void thread;
  return { view: { dir: [0.4, 1, 0.9] } };
}

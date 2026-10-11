// P408 — Trousse d'outils de la tête de rotation, filetage #28, CX034796
// rév. 0 (page 408, sans illustration) : clé dynamométrique à déclic 3/4 po (1),
// clé de débrayage du raccord d'usure (2 : clé plate forgée à mâchoire en C),
// retenue de clé pour raccord d'usure #28 (3 : collier en U et sa vis de
// serrage), deux verrous de pignon cannelés (4) qui bloquent l'arbre de la
// tête pendant le dévissage, clé de débrayage du joint tournant d'air (5).
// Outils posés à plat comme rangés dans leur bac.
// Repère : origine au centre de l'emprise, sur le plan de pose ; Y vers le
// haut ; outils longs le long de X, rangés en bandes selon Z (clé
// dynamométrique vers +Z, clé du joint tournant vers -Z).
// Encombrement ≈ 0.62 (X) × 0.05 (Y) × 0.40 (Z) m.
// Pas de dessin : proportions de l'outillage courant (raccord d'usure
// Ø 3 1/2 po, plats de 2 3/4 po ; joint tournant à plats de 2 po).

const IN = 0.0254;
const u = (v) => v * IN;

export default function P408(api) {
  const { S } = api;
  const { lathe, extrude, merged, at, group, box, cyl, bolt, thread } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v3 = (x, y, z) => [u(x), u(y), u(z)];
  const Lx = (pts, mat, seg = 18) => lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg, axis: 'x' });
  // Contour plan (x, z en po) extrudé selon Y : épaisseur t, posé sur y = y0.
  const flat = (pts, t, mat, holes = [], y0 = 0) => {
    let a = 0;
    pts.forEach(([x0, z0], i) => { const [x1, z1] = pts[(i + 1) % pts.length]; a += x0 * z1 - x1 * z0; });
    const p = a < 0 ? [...pts].reverse() : pts;
    const m = extrude(p.map(([x, z]) => [u(x), u(z)]), u(t), mat, { holes: holes.map(([x, z, r]) => [u(x), u(z), u(r)]) });
    m.rotation.x = Math.PI / 2;
    const g = group(m);
    g.position.y = u(y0 + t / 2);
    return g;
  };
  const arc = (cx, cz, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.cos(a), cz + r * Math.sin(a)];
  });
  const D = Math.PI / 180;

  // Clé plate à mâchoire ouverte (ouverture s, po) : tête en C vers -X, manche vers +X.
  const jawWrench = (zc, s, L, t, mat) => {
    const R = s * 0.95;
    // contour : bec supérieur, dos arrondi, manche, bec inférieur
    const outline = [
      [-R * 0.85, s / 2], [0.15, s / 2], [0.15, -s / 2], [-R * 0.85, -s / 2], // fond de mâchoire
      ...arc(0, 0, R, 210 * D, 300 * D, 8),
      [R + 1.0, -0.65], [L - 0.7, -0.6], ...arc(L - 0.7, 0, 0.6, -90 * D, 90 * D, 8), [R + 1.0, 0.65],
      ...arc(0, 0, R, 60 * D, 150 * D, 8),
    ];
    return at(flat(outline, t, mat, [[L - 0.7, 0, 0.3]]), v3(-L / 2 + R * 0.4, 0, zc));
  };

  // ================================================ 1 — clé dynamométrique à déclic 3/4 po
  {
    const z = 6.5, x0 = -11.5;
    P('1', group(
      merged([
        // tête à cliquet : carré d'entraînement 3/4 dessous, levier d'inversion
        at(cyl(u(1.0), u(0.9), 'chrome', { seg: 20 }), v3(x0, 0.95, z)),
        at(box(u(0.75), u(0.6), u(0.75), 'chrome'), v3(x0, 0.3, z)),
        at(box(u(0.5), u(0.18), u(0.3), 'chrome'), v3(x0 - 0.25, 1.45, z)),
        // tube du corps et échelle de couple
        Lx([[0, x0 + 0.8], [0.45, x0 + 0.8], [0.6, x0 + 2.0], [0.6, x0 + 15.5], [0, x0 + 15.5]], 'chrome', 18).translateY(u(0.95)).translateZ(u(z)),
        // contre-écrou de réglage
        Lx([[0, x0 + 15.4], [0.68, x0 + 15.4], [0.68, x0 + 16.2], [0, x0 + 16.2]], 'chrome', 16).translateY(u(0.95)).translateZ(u(z)),
      ], 'chrome'),
      // poignée moletée noire et bague graduée
      Lx([[0, x0 + 16.2], [0.62, x0 + 16.2], [0.68, x0 + 16.6], [0.68, x0 + 22.6], [0.55, x0 + 23.0], [0, x0 + 23.0]], 'black', 18).translateY(u(0.95)).translateZ(u(z)),
      at(cyl(u(0.605), u(2.0), 'white', { axis: 'x', seg: 18, open: true }), v3(x0 + 13.0, 0.95, z)),
    ), [0, 0.05, 0.05]);
  }

  // ================================================ 2 — clé du raccord d'usure (mâchoire 2 3/4 po)
  P('2', jawWrench(2.5, 2.75, 22, 0.75, 'darkSteel'), [0, 0.08, 0]);

  // ================================================ 3 — retenue de clé #28 : collier en U et vis
  {
    const xc = 4.0, zc = -2.0;
    const U = [...arc(0, 0, 2.3, -90 * D, 90 * D, 12), [-1.6, 2.3], [-1.6, 1.75], ...arc(0, 0, 1.75, 90 * D, -90 * D, 12), [-1.6, -1.75], [-1.6, -2.3]];
    P('3', group(
      at(flat(U, 0.5, 'darkSteel', []), v3(xc, 0, zc)),
      at(bolt(u(0.5), u(4.6), 'zinc', { axis: 'z' }), v3(xc - 1.3, 0.25, zc + 2.55)),
    ), [0, 0.1, -0.02]);
  }

  // ================================================ 4 — verrous de pignon cannelés (×2)
  for (const [k, x] of [[0, -10.5], [1, -5.0]]) {
    const z = -1.8;
    const spl = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      spl.push(at(box(u(2.4), u(0.16), u(0.12), 'blackOxide'), v3(x - 0.3, 0.75 + 0.62 * Math.cos(a), z + 0.62 * Math.sin(a)), [a, 0, 0]));
    }
    P('4', merged([
      // arbre cannelé Ø 1 1/4, collerette, poignée en T
      Lx([[0, x - 1.6], [0.6, x - 1.6], [0.6, x + 0.9], [0.85, x + 0.9], [0.85, x + 1.3], [0.35, x + 1.3], [0.35, x + 2.8], [0, x + 2.8]], 'blackOxide', 18).translateY(u(0.75)).translateZ(u(z)),
      at(cyl(u(0.3), u(3.0), 'blackOxide', { axis: 'z', seg: 12 }), v3(x + 2.6, 0.75, z)),
      ...spl,
    ], 'blackOxide'), [0, 0.06, -0.02 * (k + 1)]);
  }

  // ================================================ 5 — clé du joint tournant d'air (mâchoire 2 po)
  P('5', jawWrench(-6.5, 2.0, 16, 0.5, 'darkSteel'), [0, 0.04, -0.05]);

  void thread;
  return { view: { dir: [0.3, 1, 0.8] } };
}

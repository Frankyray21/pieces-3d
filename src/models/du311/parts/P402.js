// P402 — Clé de débrayage CP41029-2 rév. 0 (page 402) : clé à chaîne pour
// desserrer les tiges (tige Ø 4 1/2 po). Mâchoire forgée (11, deux joues
// réunies par une semelle cintrée) qui pivote sur la tête du manche (7) autour
// d'un boulon Ø 1 po (12) dans une bague (8) ; quatre plaquettes moletées (6)
// dans les logements de la semelle, chacune tenue par une clavette (5) et un
// ressort (13) ; axe d'ancrage de la chaîne (4) avec son écrou au bout de la
// mâchoire ; ressort de rappel (2) sur son guide (1) entre la tête du manche et
// la mâchoire ; suspente (9) articulée sur le manche par l'axe à goupille (10)
// et rangée le long du manche par le boulon de suspente (3 : boulon, rondelle,
// rondelle frein, écrou). Ligne 14 (plaquette à pointes de diamant) :
// quantité 0, sans objet.
// Repère : origine sur l'axe du pivot (boulon 12), à mi-épaisseur du manche ;
// +X le long du manche vers sa poignée ; Y = axe du pivot (clé posée à plat,
// joues horizontales) ; la face de serrage de la mâchoire regarde -Z (centre
// de la tige serrée en x = -0.107, z = -0.086 m). Dessous des joues à
// y = -0.032 m, tête du boulon 12 dessous (y = -0.048).
// Encombrement ≈ 1.07 (X, de -0.200 à +0.870) × 0.097 (Y) × 0.115 (Z) m.
// Dessin sans cotes (perspective) : proportions estimées pour une tige de
// 4 1/2 po et un manche de 34 po.

const IN = 0.0254;
const u = (v) => v * IN;

export const WRENCH402 = {
  pipe: [u(-4.2), 0, u(-3.4)], // centre de la tige serrée (x, y, z)
  length: u(35.3),
  bottom: u(-1.25), // dessous des joues
};

export default function P402(api) {
  const { THREE, S } = api;
  const { extrude, plate, lathe, merged, at, group, nut, bolt, washer, box, cyl, spring, thread } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v3 = (x, y, z) => [u(x), u(y), u(z)];
  const Ly = (pts, mat, seg = 16) => lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg });

  // Contour plan (x, z en po) → extrusion d'épaisseur t (po) selon Y, centrée en y.
  const flat = (pts, t, y, mat, holes = []) => {
    let a = 0;
    pts.forEach(([x0, z0], i) => { const [x1, z1] = pts[(i + 1) % pts.length]; a += x0 * z1 - x1 * z0; });
    const p = a < 0 ? [...pts].reverse() : pts;
    const m = extrude(p.map(([x, z]) => [u(x), u(z)]), u(t), mat, { holes: holes.map(([x, z, r]) => [u(x), u(z), u(r)]) });
    const g = group(m);
    m.rotation.x = Math.PI / 2; // (x, y_forme) → (x, z) ; épaisseur selon -Y
    g.position.y = u(y);
    return g;
  };
  const arc = (cx, cz, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.cos(a), cz + r * Math.sin(a)];
  });
  const D = Math.PI / 180;
  const C = [-4.2, -3.4]; // centre de la tige
  const RG = 2.45; // rayon de la face de serrage des joues

  // ================================================ 7 — manche
  // Barre forgée 1 1/2 × 1 3/4 po, tête arrondie autour du pivot, lumière
  // d'allègement, œil de levage au bout ; trous du boulon de suspente et de l'axe 10.
  const handle = plate(u(35.3), u(1.75), u(1.5), 'darkSteel', {
    r: u(0.86),
    holes: [[u(-16.8), 0, u(0.62)], [u(16.8), 0, u(0.45)], [u(4.5 - 16.8), 0, u(0.39)], [u(10.0 - 16.8), 0, u(0.27)]],
    cutouts: [[u(21 - 16.8), 0, u(18), u(0.55)]],
  });
  handle.position.set(u(17.65 - 0.85), 0, 0);
  // bossage autour du pivot (tête plus large)
  const headBoss = flat(arc(0, 0, 1.25, 0, 2 * Math.PI, 28).slice(0, -1), 1.5, 0, 'darkSteel', [[0, 0, 0.62]]);
  P('7', merged([handle, headBoss], 'darkSteel'), [0.08, 0.05, 0]);

  // 8 — bague du pivot Ø 1 1/4 × 1 po, longueur 1 1/2
  P('8', Ly([[0.51, -0.75], [0.62, -0.75], [0.62, 0.75], [0.51, 0.75], [0.51, -0.75]], 'brass', 24), [0, -0.12, 0]);

  // ================================================ 11 — mâchoire
  // Joue : bossage du pivot, dos bombé, bossage de l'axe d'ancrage, face de
  // serrage en arc autour de la tige ; deux joues de 1/2 po (y ±0.75 à ±1.25)
  // réunies par la semelle cintrée qui porte les plaquettes.
  const cheekPts = [
    ...arc(0, 0, 1.35, -60 * D, 110 * D, 14),
    [-2.4, 1.55], [-4.6, 1.5],
    ...arc(-6.6, -0.6, 1.05, 70 * D, 200 * D, 10),
    [-7.3, -1.9],
    ...arc(C[0], C[1], RG, 145 * D, 35 * D, 18),
  ];
  const holes = [[0, 0, 0.53], [-6.6, -0.6, 0.53], [-3.0, 0.35, 0.45], [-1.7, 0.95, 0.3]];
  const sole = [...arc(C[0], C[1], RG + 0.3, 148 * D, 32 * D, 18), ...arc(C[0], C[1], RG + 1.0, 34 * D, 146 * D, 18)];
  P('11', merged([
    flat(cheekPts, 0.5, 1.0, 'darkSteel', holes),
    flat(cheekPts, 0.5, -1.0, 'darkSteel', holes),
    flat(sole, 1.5, 0, 'darkSteel'),
  ], 'darkSteel'), [0, 0, -0.06]);

  // 12 — boulon de pivot 1 po × 3 1/4 (tête dessous) et écrou dessus
  P('12', group(
    at(bolt(u(1.0), u(3.0), 'zinc'), v3(0, -1.25, 0), [Math.PI, 0, 0]),
    at(nut(u(1.5), u(0.85), 'zinc'), v3(0, 1.25 + 0.43, 0)),
  ), [0, 0.19, 0]);

  // 4 — axe d'ancrage de la chaîne Ø 1 po, collerette dessous, écrou dessus
  P('4', group(
    Ly([[0, -1.55], [0.75, -1.55], [0.75, -1.3], [0.5, -1.25], ...thread(0.5, -1.25, 2.0, { pitch: 1 / 8, maxTurns: 8 }).slice(1), [0, 2.0]], 'zinc', 20)
      .translateX(u(-6.6)).translateZ(u(-0.6)),
    at(nut(u(1.5), u(0.8), 'zinc'), v3(-6.6, 1.65, -0.6)),
  ), [0, 0.13, 0]);

  // ================================================ 6 — plaquettes moletées (×4),
  // 5 — clavettes, 13 — ressorts : logements répartis sur la face de serrage
  const angles = [56, 79, 101, 124];
  for (const a of angles) {
    const t = a * D;
    const rot = [0, -(t - Math.PI / 2), 0]; // +Z local → vers l'extérieur (normale radiale)
    const pos = (r, y = 0) => v3(C[0] + r * Math.cos(t), y, C[1] + r * Math.sin(t));
    // plaquette : bloc 0.9 (tangentiel) × 0.5 (radial) × 2.4 (Y), stries sur la face
    const ribs = Array.from({ length: 7 }, (_, k) => at(box(u(0.07), u(2.3), u(0.06), 'steel'), v3(-0.36 + k * 0.12, 0, -0.26)));
    const ins = group(merged([box(u(0.9), u(2.4), u(0.5), 'steel', { r: u(0.04) }), ...ribs], 'steel'));
    ins.position.set(...pos(2.27 + 0.25));
    ins.rotation.set(...rot);
    P('6', ins, [-0.05 * Math.cos(t), 0, -0.05 * Math.sin(t)]);
    // clavette : goupille Ø 3/16 qui traverse la joue haute et la plaquette
    const key = group(Ly([[0, -0.8], [0.094, -0.8], [0.094, 0.5], [0.14, 0.5], [0.14, 0.6], [0, 0.6]], 'blackOxide', 10));
    key.position.set(...pos(2.52, 0.75));
    P('5', key, [0, 0.06, 0]);
    // ressort de clavette : petit ressort de compression derrière la plaquette, dans la semelle
    P('13', at(spring(u(0.13), u(0.03), u(0.3), 4, 'zinc', { perTurn: 8, radial: 4 }), pos(2.74, 0.5), [0, -t, -Math.PI / 2]), [0.04 * Math.cos(t), 0.08, 0.04 * Math.sin(t)]);
  }

  // ================================================ 2 — ressort de rappel, 1 — guide
  // Logés dans le dos de la mâchoire, appuyés sur la tête du manche (axe selon X).
  const sx = -1.55, sz = 1.05;
  P('1', at(Ly([[0, -1.4], [0.15, -1.4], [0.15, 0.3], [0.28, 0.3], [0.28, 0.5], [0, 0.5]], 'zinc', 14), v3(sx, 0, sz), [0, 0, Math.PI / 2]), [-0.03, 0.17, 0.13]);
  P('2', at(spring(u(0.24), u(0.05), u(1.3), 9, 'blackOxide', { perTurn: 10, radial: 5 }), v3(sx, 0, sz), [0, 0, Math.PI / 2]), [0.03, 0.08, 0.10]);

  // ================================================ 9 — suspente, 10 — axe, 3 — boulon
  // Barre plate 1/2 × 1 1/4 po, petit œil articulé sur l'axe 10 près de la tête
  // du manche, grand anneau Ø 3 po au bout ; rangée sous le manche.
  const xs = 4.5, xe = 15.5;
  const hangerPts = [...arc(xs, 0, 0.8, 90 * D, 270 * D, 10), ...arc(xe, 0, 1.6, -90 * D, 90 * D, 16)];
  P('9', flat(hangerPts, 0.5, -1.0, 'darkSteel', [[xs, 0, 0.4], [xe, 0, 1.0], [10.0, 0, 0.27]]), [0, -0.05, 0]);
  // 10 — axe Ø 3/4 avec goupille fendue
  P('10', group(
    Ly([[0, -1.45], [0.375, -1.45], [0.375, 0.95], [0.55, 0.95], [0.55, 1.15], [0, 1.15]], 'zinc', 18),
    at(torus8(), v3(0, -1.35, 0)),
  ).translateX(u(xs)), [0, -0.1, 0]);
  function torus8() {
    // goupille fendue : tête en boucle et deux brins traversant l'axe
    return merged([
      S.torus(u(0.12), u(0.03), 'zinc', { axis: 'z', pos: v3(0.55, 0, 0) }),
      at(cyl(u(0.03), u(1.0), 'zinc', { axis: 'x', seg: 8 }), v3(-0.05, 0, 0.03)),
      at(cyl(u(0.03), u(1.0), 'zinc', { axis: 'x', seg: 8 }), v3(-0.05, 0, -0.03)),
    ], 'zinc');
  }
  // 3 — boulon 1/2 × 3 1/2, rondelle, rondelle frein et écrou sous la suspente
  P('3', group(
    at(bolt(u(0.5), u(3.1), 'zinc', { washer: true }), v3(10.0, 0.75, 0)),
    at(washer(u(0.53), u(0.27), u(0.1), 'zinc'), v3(10.0, -1.3, 0)),
    at(washer(u(0.45), u(0.27), u(0.12), 'zinc'), v3(10.0, -1.41, 0)),
    at(nut(u(0.75), u(0.44), 'zinc'), v3(10.0, -1.69, 0)),
  ), [0, 0.12, 0]);

  return { view: { dir: [0.4, 1, -0.9] } };
}

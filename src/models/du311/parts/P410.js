// P410 — Trousse d'outils du compresseur à pistons CX034804 (page 410, sans
// illustration) : outil de dépose des clapets de refoulement (1) et outil de
// dépose des clapets d'aspiration (2) du surpresseur (P274). Chaque outil est
// un extracteur à poignée en T : tige filetée qui se visse dans le centre du
// clapet, cloche d'appui sur le siège et écrou à oreilles de tirage ; la
// cloche du clapet de refoulement est plus petite.
// Outils posés à plat comme rangés dans leur bac.
// Repère : origine au centre de l'emprise, sur le plan de pose ; Y vers le
// haut ; tiges le long de X (poignée vers -X) ; outil 1 vers +Z, outil 2 vers -Z.
// Encombrement ≈ 0.29 (X) × 0.10 (Y) × 0.24 (Z) m.
// Pas de dessin : proportions estimées (clapets Ø 3 et 4 po).

const IN = 0.0254;
const u = (v) => v * IN;

export default function P410(api) {
  const { S } = api;
  const { lathe, thread, merged, at, group, cyl, nut, box } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v3 = (x, y, z) => [u(x), u(y), u(z)];
  const Lx = (pts, mat, seg = 20) => lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg, axis: 'x' });

  // Extracteur : cloche Ø 2·rb posée sur son flanc, tige 1/2-13, écrou à oreilles,
  // poignée en T au bout opposé. Axe à y = rb (cloche tangente au plan de pose).
  const puller = (z, rb, mat) => {
    const yc = rb;
    const tr = (m) => m.translateY(u(yc)).translateZ(u(z));
    return group(
      merged([
        // tige filetée de x = -5 à +5, embout taraudé fin côté clapet
        tr(Lx([[0, -5.5], [0.25, -5.5], ...thread(0.25, -5.0, 4.6, { pitch: 1 / 13, maxTurns: 10 }).slice(1), [0.18, 5.6], [0, 5.6]], 'blackOxide', 12)),
        // poignée en T
        at(cyl(u(0.25), u(4.0), 'blackOxide', { axis: 'z', seg: 12 }), v3(-5.75, yc, z)),
        // écrou à oreilles de tirage
        tr(at(nut(u(0.75), u(0.5), 'blackOxide', { axis: 'x' }), v3(0.6, 0, 0))),
        at(box(u(0.35), u(0.25), u(2.0), 'blackOxide', { r: u(0.08) }), v3(0.6, yc, z)),
      ], 'blackOxide'),
      // cloche d'appui creuse, fenêtres de passage suggérées par la lèvre
      tr(Lx([[0.3, 1.2], [rb - 0.2, 1.2], [rb, 1.4], [rb, 5.0], [rb - 0.25, 5.0], [rb - 0.25, 1.6], [0.3, 1.5]], mat, 28)),
    );
  };

  P('1', puller(2.6, 1.4, 'steel'), [0, 0.05, 0.03]);
  P('2', puller(-2.8, 1.9, 'steel'), [0, 0.05, -0.03]);

  return { view: { dir: [0.3, 1, 0.8] } };
}

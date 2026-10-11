// P404 — Chaîne de la clé de débrayage, 11 maillons, CP41029-200C rév. 0
// (page 404) : chaîne à mailles jointives (plaques en 8, entrelacement 4 × 3,
// pas 1 1/4 po) de 11 maillons (1), reliée côté vis par l'axe (2) à la vis
// à œil (3) et son écrou de serrage à selle (4) qui se loge dans la tête de la
// clé, côté libre par la maille de raccord (5) et son axe (6) ; épissure
// boulon-écrou (7) au milieu de la chaîne. Ligne 8 (chaîne de 2 maillons) :
// quantité 0, sans objet (elle est fournie à part dans P400).
// Repère : chaîne posée à plat, tendue : origine sur l'axe de l'axe (2) de la
// vis, à mi-largeur de la chaîne ; +X le long de la chaîne vers la maille de
// raccord ; Y = axe des axes de chaîne (plaques horizontales) ; la vis part
// vers -X. Axes de maillons tous les 1 1/4 po (x = 0 à 13.75 po).
// Encombrement ≈ 0.57 (X, de -0.138 à +0.432) × 0.04 (Y) × 0.041 (Z) m.
// Dessin sans cotes : pas et largeur estimés pour une chaîne de clé de
// débrayage (charge de rupture ≈ 20 t).

const IN = 0.0254;
const u = (v) => v * IN;
const PITCH = 1.25;

export const CHAIN404 = {
  pitch: u(PITCH),
  links: 11,
  length: u(16.9 + 5.4), // hors tout, vis comprise
  ends: { screw: [u(-5.4), 0, 0], eye: [u(16.15), 0, 0] },
};

/**
 * Plaques de chaîne à mailles jointives (en mètres) : n maillons à partir de
 * x0 (po), plaques horizontales, axes selon Y ; jeu de plaques 4 / 3 alterné.
 * Exporté pour P400 (chaîne de 2 maillons).
 */
export function leafPlates(S, n, x0 = 0, mat = 'darkSteel') {
  const { extrude, merged, group } = S;
  const r = 0.55, w = 0.42;
  const outline = [];
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 - (i / 12) * Math.PI; outline.push([r * Math.cos(a), r * Math.sin(a)]); }
  outline.push([PITCH / 2, w]);
  for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 - (i / 12) * Math.PI; outline.push([PITCH + r * Math.cos(a), r * Math.sin(a)]); }
  outline.push([PITCH / 2, -w]);
  const pts = outline.map(([x, z]) => [u(x), u(z)]);
  // contour dans le sens trigonométrique
  let a = 0;
  pts.forEach(([x0p, y0p], i) => { const [x1, y1] = pts[(i + 1) % pts.length]; a += x0p * y1 - x1 * y0p; });
  if (a < 0) pts.reverse();
  const plates = [];
  for (let k = 0; k < n; k++) {
    const slots = (k + (x0 / PITCH)) % 2 === 0 ? [0, 2, 4, 6] : [1, 3, 5];
    for (const s of slots) {
      const m = extrude(pts, u(0.12), mat, { holes: [[0, 0, u(0.23)], [u(PITCH), 0, u(0.23)]] });
      m.rotation.x = Math.PI / 2;
      const g = group(m);
      g.position.set(u(x0 + k * PITCH), u((s - 3) * 0.13), 0);
      plates.push(g);
    }
  }
  return merged(plates, mat);
}

/** Axe de chaîne Ø 0.44 po le long de Y, têtes rivées, à x (po). */
export function chainPin(S, x, mat = 'steel') {
  const { lathe } = S;
  return lathe([[0, -0.5], [0.27, -0.5], [0.27, -0.46], [0.22, -0.43], [0.22, 0.43], [0.27, 0.46], [0.27, 0.5], [0, 0.5]]
    .map(([r, y]) => [u(r), u(y)]), mat, { seg: 12, pos: [u(x), 0, 0] });
}

/** Épissure boulon-écrou (axe fileté Ø 7/16 à tête six-pans, écrou dessous) à x (po). */
export function splice(S, x) {
  const { lathe, nut, merged, at } = S;
  return merged([
    at(nut(u(0.69), u(0.3), 'zinc'), [u(x), u(0.6), 0]),
    lathe([[0, -0.85], [0.21, -0.85], [0.22, 0.45], [0, 0.45]].map(([r, y]) => [u(r), u(y)]), 'zinc', { seg: 12, pos: [u(x), 0, 0] }),
    at(nut(u(0.69), u(0.38), 'zinc'), [u(x), u(-0.69), 0]),
  ], 'zinc');
}

export default function P404(api) {
  const { S } = api;
  const { lathe, thread, extrude, merged, at, group, box, cyl } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v3 = (x, y, z) => [u(x), u(y), u(z)];

  // 1 — chaîne de 11 maillons et ses axes rivés (sauf l'épissure, x = 7.5 po)
  const xs = 6 * PITCH;
  const pins = [];
  for (let k = 1; k <= 10; k++) if (k !== 6) pins.push(chainPin(S, k * PITCH));
  P('1', group(leafPlates(S, 11, 0), merged(pins, 'steel')), [0, 0.05, 0]);

  // 7 — épissure boulon-écrou
  P('7', splice(S, xs), [0, 0.1, 0]);

  // 2 — axe de la vis (tête et goupille), 6 — axe de la maille de raccord
  P('2', chainPin(S, 0, 'zinc'), [0, 0.08, 0]);
  P('6', chainPin(S, 11 * PITCH, 'zinc'), [0, 0.08, 0]);

  // Embout à lamelles (vis et maille de raccord) : trois languettes entre les
  // plaques du maillon voisin, sur un talon plein.
  const tangs = (x, dir, mat) => {
    const out = [];
    for (const s of [1, 3, 5]) {
      out.push(at(box(u(1.0), u(0.11), u(1.0), mat, { r: u(0.05) }), v3(x + dir * 0.2, (s - 3) * 0.13, 0)));
    }
    out.push(at(box(u(0.5), u(0.95), u(1.05), mat, { r: u(0.08) }), v3(x + dir * 0.85, 0, 0)));
    return out;
  };

  // 3 — vis à œil : languettes, collet, tige filetée 3/4-10 vers -X
  P('3', merged([
    ...tangs(0, -1, 'darkSteel'),
    lathe([[0, -5.4], ...thread(0.375, -5.35, -1.25, { pitch: 0.1, maxTurns: 14 }), [0.42, -1.2], [0.42, -1.1], [0, -1.1]]
      .map(([r, y]) => [u(r), u(y)]), 'darkSteel', { seg: 14, axis: 'x' }),
  ], 'darkSteel'), [-0.05, 0, 0]);

  // 4 — écrou de serrage à selle : bloc à épaulements, taraudé, logé dans la clé
  {
    const prof = [[-0.8, -0.55], [0.8, -0.55], [0.8, 0.15], [0.55, 0.15], [0.55, 0.55], [-0.55, 0.55], [-0.55, 0.15], [-0.8, 0.15]];
    const m = extrude(prof.map(([z, y]) => [u(z), u(y)]), u(1.2), 'darkSteel', { holes: [[0, 0, u(0.38)]] });
    // profil dans le plan (Z, Y), épaisseur selon X
    m.rotation.y = Math.PI / 2;
    const g = group(m);
    g.position.set(...v3(-4.3, 0, 0));
    P('4', g, [-0.06, 0, 0]);
  }

  // 5 — maille de raccord : languettes côté chaîne, barre 3/4 × 1 1/2 po, œil Ø 7/8
  {
    const x0 = 11 * PITCH;
    const pts = [[x0 + 1.0, -0.75], [x0 + 2.4, -0.75], ...Array.from({ length: 13 }, (_, i) => {
      const a = -Math.PI / 2 + (i / 12) * Math.PI;
      return [x0 + 2.4 + 0.75 * Math.cos(a), 0.75 * Math.sin(a)];
    }).slice(1), [x0 + 1.0, 0.75]];
    const bar = extrude(pts.map(([x, z]) => [u(x), u(z)]), u(0.75), 'darkSteel', { holes: [[u(x0 + 2.4), 0, u(0.44)]] });
    bar.rotation.x = Math.PI / 2;
    P('5', merged([...tangs(x0, 1, 'darkSteel'), group(bar)], 'darkSteel'), [0.06, 0, 0]);
  }

  void cyl;
  return { view: { dir: [0.3, 1, 0.9] } };
}

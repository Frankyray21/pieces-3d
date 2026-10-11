// P268 — Carter de courroie CX007762 rév. 1 (page 268) : « BELT GUARD
// ASSY, MBE904 », repère 32 de P246. Carter mécano-soudé (1) en triangle à
// angles arrondis devant la poulie de vilebrequin, la poulie de pompe à eau
// et l'alternateur : rebord en tôle pliée de 0,11 m, façade en tôle perforée
// à trous hexagonaux, cadre de façade ; console latérale (2) vissée sur le
// carter de distribution par deux vis M10 × 70 (7) avec rondelles (8, 9),
// le carter tenu dessus par deux vis 3/8-16 × 2 1/4 (4) avec rondelles
// Grower (5) et plates (6) ; vis M10 × 70 du sommet (10, rondelles 8 et 9)
// dans le bossage de la pompe à eau ; console basse (3) et sa vis M8 × 25
// (11, rondelles 12 et 13).
// Repère : REPÈRE MOTEUR de _engine.js (origine sur l'axe du vilebrequin dans
// le plan de la face SAE, +x vers l'avant du moteur, y vers le haut, +z côté
// échappement) ; P246 le pose avec le moteur (inEngine). Encombrement ≈ 0.13
// (x, de 0.715 à 0.845) × 0.53 (y) × 0.48 (z) m, d'après les pages 248 et 268.
import { IN, bolt, nut, washer, washerT, pose } from './_engine.js';

export default function P268(api) {
  const { THREE, S } = api;
  const { box, cyl, at, group, merged } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const X0 = 0.728, X1 = 0.842; // bord arrière du rebord, plan de la façade
  // Poulies couvertes [z, y, rayon + jeu] : vilebrequin, pompe à eau, alternateur.
  const circles = [[0, 0, 0.135], [0.0, 0.27, 0.092], [-0.2, 0.19, 0.072]];
  // Contour : enveloppe convexe des cercles (points (−z, y) du plan de la façade).
  const pts = [];
  for (const [z, y, r] of circles) for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    pts.push([-(z + Math.cos(a) * r), y + Math.sin(a) * r]);
  }
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const p of pts) { while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop(); lower.push(p); }
  for (const p of [...pts].reverse()) { while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop(); upper.push(p); }
  const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
  // Contour décalé vers l'intérieur de d (approximation par le centroïde des cercles).
  const cx = hull.reduce((s, p) => s + p[0], 0) / hull.length, cy = hull.reduce((s, p) => s + p[1], 0) / hull.length;
  const inset = (d) => hull.map(([x, y]) => {
    const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy);
    return [x - (dx / l) * d, y - (dy / l) * d];
  });
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  // Pièce plane (contour, trous en polygones) extrudée selon +x moteur, de x0 sur l'épaisseur t.
  const slab = (outer, holes, t, x0) => {
    const sh = new THREE.Shape(V2(outer));
    for (const h of holes) sh.holes.push(new THREE.Path(V2([...h].reverse())));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false, curveSegments: 4 });
    const m = new THREE.Mesh(geo);
    m.rotation.y = Math.PI / 2; // Z local → +x moteur ; X local → −z moteur
    m.position.x = x0;
    return m;
  };

  // ---------------------------------------------------------------- 1 — carter mécano-soudé
  // Rebord : anneau entre le contour et son décalé de 2 mm, sur la profondeur.
  const rim = slab(hull, [inset(0.0025)], X1 - X0, X0);
  // Façade perforée : trous hexagonaux en quinconce, à l'intérieur d'une marge de 22 mm.
  const inner = inset(0.022);
  const inside = (x, y) => {
    for (let i = 0; i < inner.length; i++) {
      const a = inner[i], b = inner[(i + 1) % inner.length];
      if (cross(a, b, [x, y]) < 0) return false;
    }
    return true;
  };
  const holes = [], hr = 0.0068, pitch = 0.0165;
  const xs = hull.map((p) => p[0]), ys = hull.map((p) => p[1]);
  let row = 0;
  for (let y = Math.min(...ys); y < Math.max(...ys); y += pitch * 0.866, row++) {
    for (let x = Math.min(...xs) + (row % 2) * pitch / 2; x < Math.max(...xs); x += pitch) {
      if (!inside(x, y)) continue;
      holes.push(Array.from({ length: 6 }, (_, k) => {
        const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
        return [x + Math.cos(a) * hr, y + Math.sin(a) * hr];
      }));
    }
  }
  const face = slab(hull, holes, 0.0025, X1 - 0.0025);
  // Cadre de façade (plat soudé autour de la tôle perforée) et pattes.
  const frameRing = slab(hull, [inset(0.02)], 0.004, X1 - 0.0015);
  const tabs = [
    box(0.035, 0.05, 0.004, 'black', { pos: [0.77, 0.16, -0.306] }), // vers la console 2
    box(0.035, 0.004, 0.04, 'black', { pos: [0.77, 0.137, -0.286] }),
    box(0.05, 0.004, 0.04, 'black', { pos: [0.765, -0.142, -0.02] }), // vers la console 3
  ];
  P('1', group(S.merged([rim, face, frameRing, ...tabs], 'black')), [0.25, 0, 0]);

  // ---------------------------------------------------------------- 2, 3 — consoles
  P('2', group(merged([
    box(0.006, 0.09, 0.05, 'black', { pos: [0.718, 0.16, -0.285] }),
    box(0.075, 0.09, 0.006, 'black', { pos: [0.752, 0.16, -0.311] }),
  ], 'black')), [0.12, 0, -0.1]);
  P('3', group(merged([
    box(0.006, 0.05, 0.05, 'black', { pos: [0.718, -0.12, -0.02] }),
    box(0.05, 0.006, 0.05, 'black', { pos: [0.743, -0.148, -0.02] }),
  ], 'black')), [0.12, -0.1, 0]);

  // ---------------------------------------------------------------- boulonnerie
  const m10 = 10 / 25.4, m8 = 8 / 25.4;
  // 7 — vis M10 × 70 de la console 2 dans le carter de distribution (vers −x), rondelles 8 / 9.
  for (const y of [0.135, 0.185]) {
    const p = [0.721, y, -0.285];
    P('7', pose(THREE, bolt(S, m10, 70 / 25.4), [p[0] + washerT(m10) + washerT(m10, 'split'), y, p[2]], [1, 0, 0]), [0.12, 0, 0]);
    P('9', pose(THREE, washer(S, m10), p, [1, 0, 0]), [0.08, 0, 0]);
    P('8', pose(THREE, washer(S, m10, 'split'), [p[0] + washerT(m10), y, p[2]], [1, 0, 0]), [0.1, 0, 0]);
  }
  // 4 — vis 3/8-16 × 2 1/4 du carter sur la console 2 (selon z), rondelles 5 / 6.
  for (const x of [0.76, 0.78]) {
    const p = [x, 0.16, -0.308];
    P('4', pose(THREE, bolt(S, 0.375, 2.25), [x, 0.16, p[2] - washerT(0.375) - washerT(0.375, 'split')], [0, 0, -1]), [0, 0, -0.1]);
    P('6', pose(THREE, washer(S, 0.375), p, [0, 0, -1]), [0, 0, -0.06]);
    P('5', pose(THREE, washer(S, 0.375, 'split'), [x, 0.16, p[2] - washerT(0.375)], [0, 0, -1]), [0, 0, -0.08]);
  }
  // 10 — vis M10 × 70 du sommet au travers de la façade (vers −x), rondelles 8 / 9.
  {
    const p = [X1 + 0.004, 0.31, 0.0];
    P('10', pose(THREE, bolt(S, m10, 70 / 25.4), [p[0] + washerT(m10) + washerT(m10, 'split'), p[1], p[2]], [1, 0, 0]), [0.15, 0.05, 0]);
    P('9', pose(THREE, washer(S, m10), p, [1, 0, 0]), [0.1, 0.05, 0]);
    P('8', pose(THREE, washer(S, m10, 'split'), [p[0] + washerT(m10), p[1], p[2]], [1, 0, 0]), [0.12, 0.05, 0]);
  }
  // 11 — vis M8 × 25 de la patte basse sur la console 3 (vers le bas), rondelles 12 / 13.
  {
    const p = [0.765, -0.14 + washerT(m8) + washerT(m8, 'split'), -0.02];
    P('11', pose(THREE, bolt(S, m8, 25 / 25.4), p), [0, 0.08, 0]);
    P('13', pose(THREE, washer(S, m8), [0.765, -0.14, -0.02]), [0, 0.05, 0]);
    P('12', pose(THREE, washer(S, m8, 'split'), [0.765, -0.14 + washerT(m8), -0.02]), [0, 0.065, 0]);
  }
  void cyl; void nut; void at; void IN;
  return { view: { dir: [1.2, 0.5, -0.6] } };
}

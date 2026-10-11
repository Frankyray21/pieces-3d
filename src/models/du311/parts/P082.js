// P082 — Mâchoire mobile de la pince de tige Ø 5 po CX011242 rév. 1 (page
// 82) : « PIPE ARM CLAMP Ø 5.00 DRILL PIPE ». Pièce mécano-soudée (2) en tôle
// épaisse : bec en arc (rayon 2.55 po, épouse la tige Ø 5 po), âme qui le
// relie au tube de pivot (3) soudé, chape à deux joues percées Ø 1 po où
// s'attelle l'embout du vérin (axe 5 de P074) ; deux bagues (1) emmanchées
// aux deux bouts du tube, pour l'axe de pivot Ø 1 1/4 po (6 de P074).
// Repère (celui de P074 translaté) : origine sur l'axe du tube de pivot, à
// mi-hauteur ; Y vers le haut (axe du pivot, axes verticaux) ; X le long du
// bras de pince (vers le bout des fourches), Z en travers (-Z vers le fond de
// la fourche, +Z vers son ouverture). Axe de chape (vérin) en JAW082.pin,
// centre de la tige serrée en JAW082.pipe : cotes « logiques » (po, [x, z
// logique], z logique = -Z). Encombrement ≈ 0.22 (X) × 0.111 (Y,
// tube de 4 3/8 po) × 0.18 (Z) m.
// Cotes : non cotées ; tube Ø 2 1/4 × 4 3/8 po (entre les plaques de P074 et
// les cales 4), corps de 3 po d'épaisseur, fente de chape de 1 3/4 po (œil de
// 1 1/4 po du vérin P078 et deux entretoises), d'après les proportions de
// l'isométrique (tube ≈ 2 diamètres de haut).
import { L, u, bushing } from './_avance_b.js';

export const JAW082 = {
  pin: [1.18, 2.317], // axe de chape (po), depuis l'axe du pivot
  pipe: [5.0, 3.6], // centre de la tige serrée (po)
  tubeH: 4.375, // hauteur du tube (po)
  tubeR: 1.125,
  pinR: 0.625, // axe de pivot Ø 1 1/4
  slot: 0.875, // demi-fente de la chape
  body: 1.5, // demi-épaisseur du corps
};

export default function P082(api) {
  const { THREE, S } = api;
  const { merged, group, weldRing, weld } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const [PX, PZ] = JAW082.pipe;
  const [RX, RZ] = JAW082.pin;
  const H = JAW082.body;

  // Prisme vertical d'un contour [[x, z], …] (po) de y0 à y1, trous [x, z, r] ;
  // arêtes cassées (≈ 1 mm).
  const slab = (pts, y0, y1, mat, holes = []) => {
    const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(u(x), u(z))));
    for (const [x, z, r] of holes) {
      const p = new THREE.Path();
      p.absarc(u(x), u(z), u(r), 0, Math.PI * 2, true);
      shape.holes.push(p);
    }
    const t = u(y1 - y0), b = 0.0012;
    const geo = new THREE.ExtrudeGeometry(shape, { depth: t - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelOffset: -b, bevelSegments: 1, curveSegments: 24 });
    geo.translate(0, 0, b);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, u(y0), 0);
    return new THREE.Mesh(S.creaseNormals(geo), undefined);
  };
  const arc = (cx, cz, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cz + r * Math.sin(a)];
  });

  // ================================================ 2 — corps de mâchoire
  // Bec : couronne R 2.55 / 3.6 autour de la tige, de 235° à 340° (le bout
  // vient au ras de la fourche avant de P074), chanfrein d'attaque au bout.
  const band = [...arc(PX, PZ, 3.6, 235, 336, 18), [PX + 3.25 * Math.cos(5.95), PZ + 3.25 * Math.sin(5.95)], ...arc(PX, PZ, 2.55, 340, 235, 18)];
  // Âme : du tube de pivot au bec, en dessous de la chape.
  const web = [[-0.35, -1.07], [1.6, -0.9], [3.77, 0.22], [3.54, 1.51], [2.2, 0.95], [0.6, 0.75], [-0.95, 0.55]];
  // Joues de chape (haute et basse), percées Ø 1 po.
  const cheek = [[-0.95, 0.4], [2.4, 0.8], [2.6, 2.4], [2.15, 3.35], [0.95, 3.62], [0.0, 3.05]];
  const body = merged([
    slab(band, -H, H),
    slab(web, -H, H),
    slab(cheek, JAW082.slot, H, null, [[RX, RZ, 0.5]]),
    slab(cheek, -H, -JAW082.slot, null, [[RX, RZ, 0.5]]),
  ].map((m) => m), 'grey');
  // Cordons : bec / âme et joues / tube (lignes sur les faces haute et basse).
  const beads = [];
  for (const y of [H, -H]) {
    beads.push(weld([[3.62, y, 1.4], [3.85, y, 0.3]].map(([x, yy, z]) => [u(x), u(yy), -u(z)]), u(0.18), 'grey'));
  }
  P('2', group(body, ...beads), [0, 0, 0]);

  // ================================================ 3 — tube de pivot
  const T = JAW082.tubeH / 2;
  P('3', group(
    L(S, [[0.75, -T], [1.06, -T], [1.125, -T + 0.06], [1.125, T - 0.06], [1.06, T], [0.75, T], [0.75, -T]], 'grey', 28),
    weldRing(u(1.15), u(0.17), 'grey', { pos: [0, u(H + 0.03), 0] }),
    weldRing(u(1.15), u(0.17), 'grey', { pos: [0, -u(H + 0.03), 0] }),
  ), [-0.05, 0, -0.05]);

  // ================================================ 1 — bagues (bronze), une à chaque bout
  for (const s of [1, -1]) {
    const b = bushing(S, THREE, 0.75, JAW082.pinR + 0.005, 1.0, 'brass');
    b.position.y = s * u(T - 0.5);
    P('1', b, [0, s * 0.12, 0]);
  }

  return { view: { dir: [-0.7, 0.8, 1] } };
}

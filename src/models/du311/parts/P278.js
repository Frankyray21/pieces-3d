// P278 — Carter de courroies CM51028 rév. 6 (page 278) : « BELT GUARD ASSY »,
// repère 3 du surpresseur P274. Carter en tôle (2) au profil de piste —
// fond plat, bout « moteur » arrondi en grand rayon, bout « surpresseur »
// arrondi en petit rayon — formé d'une face extérieure, d'une face arrière
// percée au passage des deux arbres et d'une bande de ceinture ; trois
// cornières de pied à boutonnières (une sous chaque bout, une le long de la
// face extérieure). La face extérieure a trois ouvertures fermées par des
// couvercles boulonnés : côté moteur (4, six vis 3/8-16 × 3/4 (5) à rondelles
// NL (7)), côté surpresseur (3, en ∩ autour de la poulie, six vis 5 / rondelles
// 7) et regard central (1, quatre vis 1/4-20 × 1/2 (6) sans rondelle).
// Repère : origine au milieu de la longueur, sur le plan d'appui des
// cornières de pied, dans le plan de la face arrière (côté machines) ; X le
// long du carter (+X vers le bout surpresseur, -X vers le bout moteur), Y vers
// le haut, +Z vers la face extérieure (couvercles). Axes des poulies (passages
// de la face arrière) en x = -0.385 (moteur) et x = +0.315 (surpresseur), à
// y = 0.24 ; poulie du surpresseur Ø 16 po (LR.sheaveR) logée dans le bout +X.
// Encombrement ≈ 1.12 (X) × 0.53 (Y) × 0.22 (Z) m.
// Cotes : visserie d'après la liste ; carter estimé d'après la page 278 et la
// poulie 5VP Ø 16 po du compresseur (rien n'est coté).

import { ACC, IN } from './_moteur_surpresseur.js';

const I = (v) => v * IN;
const L = I(42), H = I(20.5), D = I(7.5); // longueur, hauteur, épaisseur (Z) du carter
const R1 = I(10.25), R2 = I(6); // rayons des bouts moteur (-X) et surpresseur (+X)
const T = I(0.075); // tôle 14 ga
const YF = I(0.1875); // pieds : le carter repose sur l'aile des cornières
const AX = { motor: [-I(15.15), I(9.5)], booster: [I(12.4), I(9.5)] }; // axes (x, y au-dessus du fond)

export const GUARD278 = { L, H, D, axes: AX, footY: YF };

// Contour fermé [[x, y], …] décalé de d vers l'intérieur (sommets en onglet, comme P024).
function inset(pts, d) {
  const n = pts.length;
  let area = 0;
  for (let i = 0; i < n; i++) area += pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1];
  const s = Math.sign(area) * d;
  return pts.map((p, i) => {
    const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    const l1 = Math.hypot(p[0] - a[0], p[1] - a[1]) || 1, l2 = Math.hypot(b[0] - p[0], b[1] - p[1]) || 1;
    const n1 = [-(p[1] - a[1]) / l1, (p[0] - a[0]) / l1], n2 = [-(b[1] - p[1]) / l2, (b[0] - p[0]) / l2];
    const mx = n1[0] + n2[0], my = n1[1] + n2[1], ml = Math.hypot(mx, my) || 1;
    const c = Math.max(0.2, (mx * n1[0] + my * n1[1]) / ml);
    return [p[0] + ((mx / ml) * s) / c, p[1] + ((my / ml) * s) / c];
  });
}
// Polygone limité au demi-plan x ≥ x0 (k = 1) ou x ≤ x0 (k = -1) (Sutherland-Hodgman).
function clipX(pts, x0, k) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const ia = (a[0] - x0) * k >= 0, ib = (b[0] - x0) * k >= 0;
    if (ia) out.push(a);
    if (ia !== ib) { const t = (x0 - a[0]) / (b[0] - a[0]); out.push([x0, a[1] + (b[1] - a[1]) * t]); }
  }
  return out;
}
const arc = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });

export default function P278(api) {
  const { THREE, S } = api;
  const { box, plate, merged, weld, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);

  // Contour de profil du carter (plan XY, y depuis le dessous du fond).
  const outline = [
    [-L / 2, 0], [L / 2, 0],
    ...arc(L / 2 - R2, H - R2, R2, 0, Math.PI / 2, 10),
    ...arc(-L / 2 + R1, H - R1, R1, Math.PI / 2, Math.PI, 16),
  ];
  // Tôle plane : contour et ouvertures [[x, y], …] extrudés selon Z de z0 à z0 + t.
  const sheet = (out, holes, t, z0, mat = 'grey', round = []) => {
    const v = (p) => p.map(([x, y]) => new THREE.Vector2(x, y));
    const sh = new THREE.Shape(v(out));
    holes.forEach((h) => sh.holes.push(new THREE.Path(v(h))));
    round.forEach(([x, y, r]) => { const p = new THREE.Path(); p.absarc(x, y, r, 0, Math.PI * 2, true); sh.holes.push(p); });
    const mb = Math.min(t * 0.3, 0.0008);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: t - 2 * mb, bevelEnabled: true, bevelSize: mb, bevelThickness: mb, bevelOffset: -mb, bevelSegments: 1, curveSegments: 24 });
    geo.translate(0, 0, z0 + mb);
    return merged([new THREE.Mesh(S.creaseNormals(geo))], mat);
  };

  // Couvercles (contours) et ouvertures correspondantes (1 po plus petites).
  const xm = -L / 2 + I(14.5); // limite du couvercle moteur
  const cov4 = clipX(inset(outline, I(0.0)), xm, -1);
  const cov3 = [
    [L / 2 - I(17), I(7.5)], [L / 2 - I(17), H],
    ...arc(L / 2 - R2, H - R2, R2, Math.PI / 2, 0, 10),
    [L / 2, I(6.5)], [L / 2 - I(4), I(6.5)], [L / 2 - I(4), H - I(8)],
    ...arc(L / 2 - I(8.25), H - I(8), I(4.25), 0, Math.PI, 12),
    [L / 2 - I(12.5), I(7.5)],
  ];
  const c1 = [I(1.5), I(6.0)]; // centre du regard (x, y)
  const sq = (cx, cy, w, h) => [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]];
  const open4 = clipX(inset(outline, I(1.25)), xm - I(1.25), -1);
  const open3 = inset(cov3, I(1.1));
  const open1 = sq(c1[0], c1[1], I(3.5), I(3.5));

  // ------------------------------------------------------------ 2 — carter
  const zf = D - T; // face extérieure (dessous du couvercle à z = D)
  const body = [
    sheet(outline, [open4, open3, open1], T, zf),
    sheet(outline, [], T, 0, 'grey', [[AX.motor[0], AX.motor[1], I(3.25)], [AX.booster[0], AX.booster[1], I(3.75)]]),
    sheet(outline, [inset(outline, T)], D - 2 * T, T),
  ];
  const parts = body.map((m) => at(group(m), [0, YF, 0]));
  // Cornières de pied 2 × 2 × 3/16 po : bouts (selon Z, aile vers l'extérieur) et longue (selon X).
  const ang = (len) => merged([box(len, I(0.1875), I(2), 'grey', { pos: [0, I(0.094), I(1)] }), box(len, I(2), I(0.1875), 'grey', { pos: [0, I(1), I(0.094)] })], 'grey');
  const feet = [];
  for (const s of [-1, 1]) {
    const f = at(group(ang(D)), [s * L / 2, 0, D / 2], [0, s * Math.PI / 2, 0]);
    feet.push(f);
  }
  feet.push(at(group(ang(I(12))), [I(1.5), 0, D], [0, 0, 0]));
  // Boutonnières des pieds (traits sombres).
  const slots = [];
  for (const s of [-1, 1]) for (const z of [I(1.2), D - I(1.2)]) slots.push(box(I(0.4), 0.0008, I(0.7), 'blackOxide', { pos: [s * (L / 2 + I(1.15)), I(0.19), z] }));
  for (const x of [-I(3.5), I(6.5)]) slots.push(box(I(0.7), 0.0008, I(0.4), 'blackOxide', { pos: [x, I(0.19), D + I(1.15)] }));
  // Cordons des cornières.
  const beads = [weld([[-L / 2 - 0.002, YF + 0.002, I(0.3)], [-L / 2 - 0.002, YF + 0.002, D - I(0.3)]], I(0.15), 'grey'),
    weld([[L / 2 + 0.002, YF + 0.002, I(0.3)], [L / 2 + 0.002, YF + 0.002, D - I(0.3)]], I(0.15), 'grey'),
    weld([[I(-4.2), YF + 0.002, D + 0.002], [I(7.2), YF + 0.002, D + 0.002]], I(0.15), 'grey')];
  P('2', group(merged([...parts, ...feet], 'grey'), merged(slots, 'blackOxide'), merged(beads, 'grey')), [0, 0, 0]);

  // ------------------------------------------------------------ 4, 3, 1 — couvercles
  const tc = I(0.075);
  P('4', at(group(sheet(cov4, [], tc, D)), [0, YF, 0]), [-0.05, 0, 0.16]);
  P('3', at(group(sheet(cov3, [], tc, D)), [0, YF, 0]), [0.05, 0, 0.16]);
  const cov1 = sq(c1[0], c1[1], I(5), I(5));
  P('1', at(group(sheet(cov1, [], tc, D)), [0, YF, 0]), [0, 0, 0.12]);

  // ------------------------------------------------------------ 5, 7 — vis 3/8 × 3/4 et rondelles NL
  const nl = I(0.375) * 0.24;
  const b4 = [[-L / 2 + I(0.6), I(1.2)], [-L / 2 + I(0.65), I(8.5)], [-L / 2 + I(3.3), H - I(3.3)], [-L / 2 + I(9.5), H - I(0.6)], [xm - I(0.6), H - I(0.6)], [xm - I(0.6), H - I(6.2)]];
  const b3 = [[L / 2 - I(16.4), H - I(0.6)], [L / 2 - I(16.4), I(8.2)], [L / 2 - I(9.5), H - I(0.6)], [L / 2 - I(1.8), H - I(1.8)], [L / 2 - I(0.6), I(10)], [L / 2 - I(0.6), I(7.2)]];
  for (const [list, e] of [[b4, [-0.05, 0, 0.16]], [b3, [0.05, 0, 0.16]]]) {
    for (const [x, y] of list) {
      const p = [x, y + YF, D + tc];
      P('7', O(ACC.splitWasher(S, 0.375), p, [0, 0, 1], [1, 0, 0]), [e[0], 0, e[2] + 0.04]);
      P('5', O(ACC.hhcs(S, 0.375, 0.75), [x, y + YF, D + tc + nl], [0, 0, 1], [1, 0, 0]), [e[0], 0, e[2] + 0.08]);
    }
  }
  // ------------------------------------------------------------ 6 — vis 1/4 × 1/2 du regard
  for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
    P('6', O(ACC.hhcs(S, 0.25, 0.5), [c1[0] + dx * I(2.0), c1[1] + dy * I(2.0) + YF, D + tc], [0, 0, 1], [1, 0, 0]), [0, 0, 0.17]);
  }

  return { view: { dir: [0.55, 0.45, 1.2] } };
}

// P102 — Châssis du centreur fendu V30 CX030901 rév. 2 (page 102) : « ASSY,
// SPLIT CENT FRAME, V30 ». Mécano-soudure (4, « SPLIT CENTRALIZER, V30 ») :
// caisson avant fendu en deux moitiés selon l'axe de forage (passage de tige
// Ø 8 1/2 po, plaques haute et basse, âmes, plaque avant à pans coupés,
// flancs), deux bras en caisson qui rejoignent les colonnes de pivot, et à
// chaque colonne un moyeu haut (dans le caisson) et un moyeu bas suspendu
// sous le caisson, portant deux chapes plates côté extérieur (œil de fond du
// vérin de pivotement P094, axe P098 repère 7). Sur le dessus, à droite,
// les deux glissières des mâchoires ; à l'avant, au droit de la fente, le
// moyeu du verrou (vérin P114 dessous). Garnitures :
// - 1 : huit bagues bronze-aluminium 2 × 2 1/4 × 2 po, deux par moyeu ;
// - 3 : quatre entretoises entre les deux bagues de chaque moyeu (coupe D-D) ;
// - 2 : deux bagues du pêne de verrou, empilées dans le moyeu du verrou (coupe B-B).
// Repère : origine au milieu des deux axes de pivot, sous les moyeux bas
// (face d'appui sur les entretoises du pied de mât P116), Y vers le haut (le
// long des tiges) ; X selon la ligne des pivots (axes à x = ±11 po) ; +Z vers
// l'axe de forage, à z = 20.4 po (0.518 m) ; les chapes des vérins sont sur
// la ligne des pivots, à x = ±14.8 po. Encombrement ≈ 0.80 (X, des chapes)
// × 0.335 (Y) × 0.836 (Z, de -0.051 au dos des moyeux à +0.785 à l'avant) m.
// Cotes : bagues (liste) ; vue de dessus à l'échelle des moyeux (Ø 3 3/4 po,
// 38,7 px/po) : entraxe des pivots 22 po, axe de forage à 20.4 po, largeur
// 26.2 po ; coupe D-D : moyeux de 5 po, 1.8 po entre moyeu bas et moyeu haut,
// chapes de 0.6 po espacées de 1.8 po. L'isométrie de la page est vue de
// dessous (moyeux à chapes en haut du dessin, bagues du verrou côté vérin).
import { L, u, bushing } from './_avance_b.js';

const PX = 11; // demi-entraxe des pivots (po)
const DZ = 20.4; // axe de forage
const HOLE = 4.26; // rayon du passage de tige
const B = { ro: 1.875, ri: 1.125 }; // moyeux Ø 3 3/4, alésage = Ø ext. des bagues
const LOW = [0, 5]; // moyeu bas
const UP = [6.8, 11.8]; // moyeu haut = hauteur du caisson
const T = 0.5; // tôles
const LUG = { x: 14.8, r: 1.0, hole: 0.515, t: 0.6, y: [0.6, 3.0] };
const LOCK = { x: 2.97, z: 28.3, ro: 1.375, ri: 1.0 }; // moyeu du verrou
const FRONT = 30.9, SIDE = 13.1, CH = 26.0; // avant, flancs, début des pans coupés
const ARM = { x: 9.4, z0: 8.5, xi: 4.0, zi: 13.8 }; // âme intérieure des bras

export const FRAME102 = {
  pivotX: u(PX), // axes de pivot à x = ±pivotX, z = 0
  drillZ: u(DZ), // axe de forage (x = 0)
  lowerBoss: LOW.map(u), // y bas / haut du moyeu bas
  upperBoss: UP.map(u),
  lug: { x: u(LUG.x), y: LUG.y.map(u), t: u(LUG.t), hole: u(2 * LUG.hole) }, // chapes à x = ±lug.x
  lockPin: [u(LOCK.x), u(LOCK.z)], // axe vertical du verrou (vérin P114 sous y = UP[0])
  top: u(UP[1]),
};

export default function P102(api) {
  const { THREE, S } = api;
  const { extrude, box, shell, merged, group, at, weld, weldRing } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v = (x, y, z) => [u(x), u(y), u(z)];
  const arc = (cx, cz, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.cos(a), cz + r * Math.sin(a)];
  });
  // Contour [x, z] (po) extrudé selon Y de y0 à y0 + t, trous [x, z, r].
  const slabY = (pts, y0, t, holes = []) => {
    const m = extrude(pts.map(([x, z]) => [u(x), -u(z)]), u(t), 'grey', { holes: holes.map(([x, z, r]) => [u(x), -u(z), u(r)]) });
    m.rotation.x = -Math.PI / 2;
    m.position.y = u(y0 + t / 2);
    return m;
  };
  // Âme verticale d'épaisseur t le long du segment [x0, z0] → [x1, z1], de y0 à y1.
  const wall = ([x0, z0], [x1, z1], y0, y1, t = T) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const m = box(u(len), u(y1 - y0), u(t), 'grey');
    m.position.set(u((x0 + x1) / 2), u((y0 + y1) / 2), u((z0 + z1) / 2));
    m.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
    return m;
  };

  // ================================================ 4 — mécano-soudure
  // Moitié gauche (x < 0) des plaques haute et basse ; la droite en miroir.
  // Fente de 1/16 po au milieu ; contour contourné autour des moyeux.
  const g = 0.03;
  const zc = Math.sqrt(HOLE * HOLE - g * g);
  const half = [
    [-g, FRONT], [-6.6, FRONT], [-SIDE, CH], [-SIDE, 1.2],
    ...arc(-PX, 0, B.ro + 0.02, Math.PI - 0.69, 0.69, 10).map(([x, z]) => [x, Math.max(z, 1.2)]),
    [-ARM.x, 1.2], [-ARM.x, ARM.z0], [-ARM.xi, ARM.zi], [-g, ARM.zi],
    [-g, DZ - zc], ...arc(0, DZ, HOLE, -Math.PI / 2 - 0.007, -1.5 * Math.PI + 0.007, 24), [-g, FRONT],
  ];
  // Le contour doit tourner dans le sens trigonométrique : on retire les doublons.
  const uniq = half.filter((p, i) => i === 0 || Math.hypot(p[0] - half[i - 1][0], p[1] - half[i - 1][1]) > 1e-3);
  const mirror = (pts) => pts.map(([x, z]) => [-x, z]).reverse();
  const plates = [];
  for (const y0 of [UP[0], UP[1] - T]) {
    plates.push(slabY(uniq.slice().reverse(), y0, T), slabY(mirror(uniq.slice().reverse()), y0, T, [[LOCK.x, LOCK.z, LOCK.ri]]));
  }
  // Moyeux de pivot (haut et bas) et cordons au pied des moyeux bas.
  const bosses = [], beads = [];
  for (const s of [-1, 1]) {
    for (const [y0, y1] of [LOW, UP]) {
      bosses.push(shell(u(B.ro), u(B.ri), u(y1 - y0), 'grey', { seg: 40, pos: v(s * PX, (y0 + y1) / 2, 0) }));
    }
    // Chapes plates du vérin de pivotement (côté extérieur, sur la ligne des pivots).
    for (const y0 of LUG.y) {
      const xo = s * LUG.x;
      const pts = [[s * PX, -1.4], [xo, -LUG.r], ...arc(xo, 0, LUG.r, -Math.PI / 2, Math.PI / 2, 12).map(([x, z]) => [s > 0 ? x : 2 * xo - x, z]), [s * PX, 1.4]];
      const lug = slabY(s > 0 ? pts : pts.slice().reverse(), y0, LUG.t, [[xo, 0, LUG.hole]]);
      bosses.push(lug);
      beads.push(weld([v(s * (PX + B.ro - 0.05), y0 + LUG.t + 0.08, -1.0), v(s * (PX + B.ro - 0.05), y0 + LUG.t + 0.08, 1.0)], u(0.2), 'grey'));
    }
    // Gousset entre moyeu bas et caisson (plan x = ±PX, vers l'avant).
    const gus = extrude([[B.ro, LOW[1] - 1.5], [B.ro + 0.3, LOW[1] - 1.5], [B.ro + 4.2, UP[0]], [B.ro, UP[0]]].map(([z, y]) => [-u(z), u(y)]).reverse(), u(T), 'grey');
    gus.rotation.y = Math.PI / 2;
    gus.position.x = u(s * (PX - 0.6));
    bosses.push(gus);
    // Flanc extérieur, âmes des bras.
    plates.push(wall([s * (SIDE - T / 2), 1.6], [s * (SIDE - T / 2), CH], UP[0] + T, UP[1] - T));
    plates.push(wall([s * ARM.x + -s * T / 2, 1.9], [s * ARM.x + -s * T / 2, ARM.z0], UP[0] + T, UP[1] - T));
    plates.push(wall([s * (ARM.x - T / 2), ARM.z0], [s * ARM.xi, ARM.zi - T / 2], UP[0] + T, UP[1] - T));
    // Plaque avant : pan coupé.
    plates.push(wall([s * SIDE, CH], [s * 6.6, FRONT - T / 2], UP[0], UP[1]));
    beads.push(weldRing(u(B.ro + 0.04), u(0.22), 'grey', { pos: v(s * PX, LOW[1] - 0.06, 0) }));
  }
  plates.push(wall([-6.6, FRONT - T / 2], [6.6, FRONT - T / 2], UP[0], UP[1]));
  plates.push(wall([-ARM.xi, ARM.zi - T / 2], [ARM.xi, ARM.zi - T / 2], UP[0] + T, UP[1] - T));
  // Paroi du passage de tige (fendue au milieu).
  const bore = S.slotted(u(HOLE + 0.4), u(HOLE), u(UP[0] + T), u(UP[1] - T), [{ a: 0, w: 0.015, y0: -1, y1: 1 }, { a: Math.PI, w: 0.015, y0: -1, y1: 1 }], 'grey', { seg: 48, pos: v(0, 0, DZ) });
  // Moyeu du verrou entre les deux plaques (bagues 2).
  // Moyeu en saillie de 0.1 po sur chaque plaque (lamage des bagues visible).
  const lockBoss = shell(u(LOCK.ro), u(LOCK.ri), u(UP[1] - UP[0] + 0.2), 'grey', { seg: 32, pos: v(LOCK.x, (UP[0] + UP[1]) / 2, LOCK.z) });
  // Glissières des mâchoires sur la moitié droite : deux blocs chanfreinés.
  const rails = [];
  for (const [z0, z1] of [[15.1, 17.9], [22.9, 25.8]]) {
    const prof = [[4.2, UP[1]], [13.8, UP[1]], [13.8, UP[1] + 1.4], [4.8, UP[1] + 1.4], [3.1, UP[1] + 0.6], [3.1, UP[1]]];
    const m = extrude(prof.map(([x, y]) => [u(x), u(y)]), u(z1 - z0), 'grey');
    m.position.z = u((z0 + z1) / 2);
    rails.push(m);
  }
  // Repères en saillie : arêtes de soudure des plaques du caisson.
  for (const y of [UP[0] + T + 0.06, UP[1] - T - 0.06]) {
    for (const s of [-1, 1]) beads.push(weld([v(s * (SIDE - T - 0.06), y, 2.2), v(s * (SIDE - T - 0.06), y, CH - 0.3)], u(0.18), 'grey'));
  }
  const frame = merged([...plates, ...bosses, bore, lockBoss, ...rails], 'grey');
  frame.userData.hasInterior = true;
  const weldMesh = merged(beads, 'grey');
  weldMesh.geometry.userData.edgeAngle = 75;
  P('4', group(frame, weldMesh), [0, 0, 0]);

  // ================================================ garnitures
  // 1 — bagues bronze-alu 2 × 2 1/4 × 2 po ; 3 — entretoises entre elles.
  // Éclaté : celles du moyeu haut sortent par le haut, celles du moyeu bas
  // par le bas, dans l'ordre de montage.
  const spacer = () => L(S, [[1.04, -0.5], [1.12, -0.5], [1.12, 0.5], [1.04, 0.5], [1.04, -0.5]], 'steel', 32);
  for (const s of [-1, 1]) {
    for (const [[y0, y1], dir] of [[LOW, -1], [UP, 1]]) {
      const yb = dir > 0 ? y1 - 1 : y0 + 1; // bague côté sortie
      const yi = dir > 0 ? y0 + 1 : y1 - 1; // bague côté intérieur
      const ys = (y0 + y1) / 2;
      P('1', at(bushing(S, THREE, 1.125, 1.0, 2.0), v(s * PX, yb, 0)), [0, dir * 0.36, 0]);
      P('3', at(spacer(), v(s * PX, ys, 0)), [0, dir * 0.27, 0]);
      P('1', at(bushing(S, THREE, 1.125, 1.0, 2.0), v(s * PX, yi, 0)), [0, dir * 0.18, 0]);
    }
  }
  // 2 — bagues du pêne de verrou, Ø 1 1/2 × 2 × 2 1/2 po, collerette en haut.
  const lockBush = () => L(S, [[0.75, -1.25], [0.98, -1.25], [0.98, 1.1], [1.0, 1.1], [1.0, 1.25], [0.8, 1.25], [0.75, 1.2], [0.75, -1.25]], 'steel', 32);
  // Montées par le dessous (côté vérin), comme sur la coupe B-B.
  P('2', at(lockBush(), v(LOCK.x, UP[0] + 1.25, LOCK.z)), [0, -0.3, 0]);
  P('2', at(lockBush(), v(LOCK.x, UP[0] + 3.75, LOCK.z)), [0, -0.2, 0]);

  return { view: { dir: [0.9, 0.8, 1.0] } };
}

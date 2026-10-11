// P146 — Jeu de mâchoires du centreur pour tiges Ø 5 po (127 mm) CX034953-500
// rév. 0 (page 146) : « OPTION, CS JAWS - Ø5.0" (127MM) », lettre B de P098 et
// repère 34 de l'avance P032. Deux mâchoires d'acier (2, CM45463), demi-blocs
// de 6 × 8 3/4 × 2 1/4 po fendus au milieu d'un alésage Ø 5 1/16 po, coins
// extérieurs abattus ; chacune s'emboîte au bout d'un bras coulissant du
// centreur (tube P104) : poche rectangulaire ouverte en bout, traversée par
// l'axe vertical Ø 1 po du tube (trou lamé sur le dessus). Sous le châssis,
// dans les demi-couvercles du racleur (P098 repères 2 et 3) : joint racleur
// en polyuréthane (1, CP45291-500) à lèvre Ø 4.8 po et cuvette sur le dessus,
// et plaque racleuse souple (3, CM45265-8) Ø 12 1/4 po, huit trous de
// fixation, alésage fendu en croix (quatre fentes à trou d'arrêt).
// Repère : origine sur l'axe de forage, au niveau du dessous des mâchoires
// (mâchoires fermées, comme sur la tige), Y vers le haut le long de la tige ;
// X selon le coulissement des mâchoires (plan de joint X = 0, poches en bout
// vers ±X) ; Z en travers. Joint racleur sous le châssis : dessus à
// y = -WIPER_DROP. Encombrement ≈ 0.305 (X) × 0.26 (Y, de -0.204 à 0.057) ×
// 0.311 (Z, plaque racleuse) m.
// Mâchoires en acier traité brut d'usinage ('steel'). Cotes : liste (Ø 5 po) ; mâchoires, racleur et plaque d'après les
// proportions de l'isométrie (alésage Ø 5 po pour l'échelle, 86 px/po).
import { u } from './_avance_b.js';

const JW = { half: 6.0, width: 8.75, h: 2.25, bore: 2.53, gap: 0.03, ch: 0.45 };
const SLOT = { x0: 3.0, w: 3.25, y0: 0.45, y1: 1.8 }; // poche en bout (po)
const PIN = { x: 4.6, r: 0.53, cb: 0.8, cbd: 0.25 }; // trou de l'axe Ø 1 po, lamage
const WIPER_DROP = 5.5; // dessus du racleur sous le dessous des mâchoires (po), à caler dans P098

export const JAW146 = { half: u(JW.half), width: u(JW.width), h: u(JW.h), pinX: u(PIN.x), wiperTop: -u(WIPER_DROP) };

export default function P146(api) {
  const { THREE, S } = api;
  const { merged, lathe, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const V2 = (x, y) => new THREE.Vector2(u(x), u(y));
  const circ = (cx, cy, r, n = 24, cw = true) => {
    const p = new THREE.Path();
    p.absarc(u(cx), u(cy), u(r), 0, Math.PI * 2, cw);
    return p;
  };
  // Prisme d'un contour (plan X, -Z) entre y0 et y1 (po), trous éventuels.
  const layer = (pts, y0, y1, holes = []) => {
    const sh = new THREE.Shape(pts.map(([x, z]) => V2(x, -z)));
    holes.forEach((h) => sh.holes.push(h));
    const g = new THREE.ExtrudeGeometry(sh, { depth: u(y1 - y0), bevelEnabled: false, curveSegments: 24 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, u(y0), 0);
    return new THREE.Mesh(S.creaseNormals(g));
  };

  // ------------------------------------------------ 2 — mâchoires
  // Demi-bloc côté +X : contour avec l'alésage (demi-cercle de rayon bore,
  // arrondi de dégagement au plan de joint) et coins extérieurs abattus.
  const { half: H, width: W, h, bore: R, gap: g, ch: c } = JW;
  const arc = [];
  const a0 = Math.asin(Math.min(1, g / R));
  for (let i = 0; i <= 24; i++) {
    const a = Math.PI / 2 - a0 - ((Math.PI - 2 * a0) * i) / 24;
    arc.push([R * Math.cos(a), R * Math.sin(a)]);
  }
  // Dégagement : petite face plane à 0,15 po de part et d'autre du joint.
  const out = (notch) => [
    [g, -W / 2], [H - c, -W / 2], [H, -W / 2 + c],
    ...(notch ? [[H, -SLOT.w / 2], [SLOT.x0, -SLOT.w / 2], [SLOT.x0, SLOT.w / 2], [H, SLOT.w / 2]] : []),
    [H, W / 2 - c], [H - c, W / 2], [g, W / 2], [g, R + 0.15], [0.12, R],
    ...arc.slice(1, -1),
    [0.12, -R], [g, -R - 0.15],
  ];
  const jaw = () => {
    const pts = out(false), ptsN = out(true);
    const hole = () => circ(PIN.x, 0, PIN.r);
    const cb = () => circ(PIN.x, 0, PIN.cb);
    const m = merged([
      layer(pts, 0, SLOT.y0, [hole()]),
      layer(ptsN, SLOT.y0, SLOT.y1),
      layer(pts, SLOT.y1, h - PIN.cbd, [hole()]),
      layer(pts, h - PIN.cbd, h, [cb()]),
    ], 'steel');
    return m;
  };
  for (const s of [1, -1]) {
    const j = group(jaw());
    if (s < 0) j.rotation.y = Math.PI;
    P('2', j, [s * 0.14, 0.02, 0]);
  }

  // ------------------------------------------------ 1 — joint racleur
  // Anneau de polyuréthane Ø 10.4 × 1 3/4 po, cuvette Ø 7.9 sur le dessus,
  // lèvre Ø 4.8 qui frotte sur la tige.
  const yW = -WIPER_DROP;
  P('1', lathe([
    [2.4, yW - 1.75], [5.12, yW - 1.75], [5.2, yW - 1.67], [5.2, yW - 0.08], [5.12, yW], [3.98, yW],
    [3.92, yW - 0.55], [3.1, yW - 0.72], [2.55, yW - 0.82], [2.4, yW - 0.95], [2.4, yW - 1.75],
  ].map(([r, y]) => [u(r), u(y)]), 'rubber', { seg: 64 }), [0, -0.09, 0]);

  // ------------------------------------------------ 3 — plaque racleuse
  // Disque souple Ø 12 1/4 × 3/8 po, huit trous Ø 7/16 sur Ø 11 1/4, alésage
  // Ø 4.8 fendu en croix (quatre fentes à 45°, trou d'arrêt Ø 3/16 au bout).
  const RP = 6.125, T = 0.375, yP = yW - 1.75;
  const disc = new THREE.Shape();
  disc.absarc(0, 0, u(RP), 0, Math.PI * 2, false);
  disc.holes.push(circ(0, 0, 2.4, 48));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    disc.holes.push(circ(5.6 * Math.cos(a), 5.6 * Math.sin(a), 0.22, 12));
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const ca = Math.cos(a), sa = Math.sin(a), w = 0.02;
    const r0 = 2.43, r1 = 3.5;
    const slit = new THREE.Path([
      V2(r0 * ca + w * sa, r0 * sa - w * ca), V2(r1 * ca + w * sa, r1 * sa - w * ca),
      V2(r1 * ca - w * sa, r1 * sa + w * ca), V2(r0 * ca - w * sa, r0 * sa + w * ca),
    ].reverse());
    disc.holes.push(slit);
    disc.holes.push(circ(3.6 * ca, 3.6 * sa, 0.095, 10));
  }
  const pg = new THREE.ExtrudeGeometry(disc, { depth: u(T), bevelEnabled: false, curveSegments: 48 });
  pg.rotateX(-Math.PI / 2);
  pg.translate(0, u(yP - T), 0);
  P('3', merged([new THREE.Mesh(pg)], 'rubber'), [0, -0.26, 0]);

  return { view: { dir: [1, 0.9, 1.1] } };
}

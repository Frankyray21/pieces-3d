// P048 — Jeu de mâchoires du centreur pour tiges Ø 3 1/2 po (89 mm)
// CX034952-350 rév. 0 (page 48) : « OPTION, CF JAWS - Ø3.5" (89MM) », repère
// 3 de l'avance P028 (lettre B de P032). Deux mâchoires d'acier (2, CM45563),
// demi-blocs de 6 × 8 3/4 × 2 1/4 po fendus au milieu d'un alésage Ø 3.56 po,
// coins extérieurs abattus ; chacune s'emboîte au bout d'un tube coulissant
// du centreur (P036) : poche rectangulaire ouverte en bout, traversée par
// l'axe vertical Ø 1 po du tube (trou lamé sur le dessus). Sous le caisson,
// dans le logement du racleur (P034) : joint racleur en polyuréthane (3,
// CP45290-5, « ROD WIPER 3.5" ») Ø 10.4 × 1 3/4 po à lèvre Ø 3.4 et cuvette
// sur le dessus, et plaque racleuse souple (1, CM45265-630, « 3.13" - 3.50"
// DRILL PIPE WIPER ») Ø 12 1/4 × 3/8 po, huit trous, alésage Ø 3.1 fendu en
// croix (quatre fentes à trou d'arrêt).
// Repère : celui de l'avance (placé à l'identité par P028) ; mâchoires
// fermées dans les tubes de P032, dessous à y = 0,095 - 4,18 po, plan de joint
// x = 0 sur l'axe de forage, poches vers ±X ; racleurs empilés sous la plaque
// supérieure du logement P034 (dessus du joint 5.725 po sous le dessus du
// caisson). Les pièces sont dessinées dans le repère de P146 du TVK (origine
// sur l'axe au dessous des mâchoires, Y le long de la tige). Encombrement ≈
// 0.311 (X) × 0.15 (Y) × 0.311 (Z) m.
// Cotes : liste (Ø 3 1/2, plage 3.13 - 3.50 po) ; mâchoires, joint et plaque
// comme le jeu Ø 5 po du TVK (mêmes tubes CX034987), alésages ramenés au
// diamètre de tige.
import { u } from '../../du311/parts/_avance_b.js';
import { CENT, cp } from './_feedcent.js';

const JW = { half: 6.0, width: 8.75, h: 2.25, bore: 1.78, gap: 0.03, ch: 0.45 };
const SLOT = { x0: 3.0, w: 3.25, y0: 0.45, y1: 1.8 }; // poche en bout (po)
const PIN = { x: 4.52, r: 0.53, cb: 0.8, cbd: 0.25 }; // trou de l'axe Ø 1 po du tube, lamage
const WIPER_DROP = CENT.jawY - CENT.wiperTop; // dessus du joint sous le dessous des mâchoires (po)

export default function P048(api) {
  const { THREE, S } = api;
  const { merged, lathe, group, at } = S;
  // Pièce dessinée dans le repère des mâchoires, portée dans celui de l'avance.
  const P = (ref, obj, e) => api.part(ref, at(group(obj), cp(0, CENT.jawY, 0)), e);
  const V2 = (x, y) => new THREE.Vector2(u(x), u(y));
  const circ = (cx, cy, r, cw = true) => {
    const p = new THREE.Path();
    p.absarc(u(cx), u(cy), u(r), 0, Math.PI * 2, cw);
    return p;
  };
  const layer = (pts, y0, y1, holes = []) => {
    const sh = new THREE.Shape(pts.map(([x, z]) => V2(x, -z)));
    holes.forEach((h) => sh.holes.push(h));
    const g = new THREE.ExtrudeGeometry(sh, { depth: u(y1 - y0), bevelEnabled: false, curveSegments: 24 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, u(y0), 0);
    return new THREE.Mesh(S.creaseNormals(g));
  };

  // ------------------------------------------------ 2 — mâchoires
  const { half: H, width: Wd, h, bore: R, gap: g, ch: c } = JW;
  const arc = [];
  const a0 = Math.asin(Math.min(1, g / R));
  for (let i = 0; i <= 24; i++) {
    const a = Math.PI / 2 - a0 - ((Math.PI - 2 * a0) * i) / 24;
    arc.push([R * Math.cos(a), R * Math.sin(a)]);
  }
  const out = (notch) => [
    [g, -Wd / 2], [H - c, -Wd / 2], [H, -Wd / 2 + c],
    ...(notch ? [[H, -SLOT.w / 2], [SLOT.x0, -SLOT.w / 2], [SLOT.x0, SLOT.w / 2], [H, SLOT.w / 2]] : []),
    [H, Wd / 2 - c], [H - c, Wd / 2], [g, Wd / 2], [g, R + 0.15], [0.12, R],
    ...arc.slice(1, -1),
    [0.12, -R], [g, -R - 0.15],
  ];
  const jaw = () => merged([
    layer(out(false), 0, SLOT.y0, [circ(PIN.x, 0, PIN.r)]),
    layer(out(true), SLOT.y0, SLOT.y1),
    layer(out(false), SLOT.y1, h - PIN.cbd, [circ(PIN.x, 0, PIN.r)]),
    layer(out(false), h - PIN.cbd, h, [circ(PIN.x, 0, PIN.cb)]),
  ], 'steel');
  for (const s of [1, -1]) {
    const j = group(jaw());
    if (s < 0) j.rotation.y = Math.PI;
    P('2', j, [s * 0.14, 0.03, 0]);
  }

  // ------------------------------------------------ 3 — joint racleur Ø 3 1/2
  // Polyuréthane Ø 10.4 × 1 3/4, cuvette Ø 7.9 sur le dessus, lèvre Ø 3.4.
  const yW = -WIPER_DROP;
  P('3', lathe([
    [1.7, yW - 1.75], [5.12, yW - 1.75], [5.2, yW - 1.67], [5.2, yW - 0.08], [5.12, yW], [3.98, yW],
    [3.92, yW - 0.55], [2.8, yW - 0.74], [1.85, yW - 0.84], [1.7, yW - 0.97], [1.7, yW - 1.75],
  ].map(([r, y]) => [u(r), u(y)]), 'rubber', { seg: 64 }), [0, -0.2, 0.25]);

  // ------------------------------------------------ 1 — plaque racleuse 3.13 - 3.50 po
  // Disque souple Ø 12 1/4 × 3/8, huit trous Ø 7/16 sur Ø 11 1/4, alésage
  // Ø 3.1 fendu en croix (quatre fentes à 45°, trou d'arrêt Ø 3/16 au bout).
  const RP = 6.125, T = 0.375, yP = yW - 1.75;
  const disc = new THREE.Shape();
  disc.absarc(0, 0, u(RP), 0, Math.PI * 2, false);
  disc.holes.push(circ(0, 0, 1.55));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    disc.holes.push(circ(5.6 * Math.cos(a), 5.6 * Math.sin(a), 0.22));
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const ca = Math.cos(a), sa = Math.sin(a), w = 0.02, r0 = 1.58, r1 = 2.6;
    disc.holes.push(new THREE.Path([
      V2(r0 * ca + w * sa, r0 * sa - w * ca), V2(r1 * ca + w * sa, r1 * sa - w * ca),
      V2(r1 * ca - w * sa, r1 * sa + w * ca), V2(r0 * ca - w * sa, r0 * sa + w * ca),
    ].reverse()));
    disc.holes.push(circ(2.7 * ca, 2.7 * sa, 0.095));
  }
  const pg = new THREE.ExtrudeGeometry(disc, { depth: u(T), bevelEnabled: false, curveSegments: 48 });
  pg.rotateX(-Math.PI / 2);
  pg.translate(0, u(yP - T), 0);
  P('1', merged([new THREE.Mesh(pg)], 'rubber'), [0, -0.3, 0.32]);

  return { view: { dir: [1, 0.9, 1.1] } };
}

// P100 — Support latéral du mât 6 pi, côté gauche : CX037381 rév. 0 (page
// 100) : « ASSY, MAST SIDE MOUNT - 6FT LH », repère 18 de l'avance P028.
// Cornière mécano-soudée (3) : âme de 3/4 po contre le flanc −X du mât, sur
// six plots d'appui, et aile arrière de 3/4 po qui déborde vers l'extérieur
// (les platines des supports de stinger P068 y sont boulonnées), trois
// goussets, deux lumières d'allègement ; six vis H 5/8 × 4 1/2 (5) à
// rondelles Nord-Lock SP (7) au travers de l'âme et des plots, vissées dans
// les doublures intérieures du mât (P058). En bas, collier de boyau Ø 3 3/4
// po (2, « HOSE CLAMP ASSY », patte soudée au bout de l'aile, collier
// en deux moitiés serré par une vis) pour l'arrivée d'air de la boucle, et
// collier en P Ø 2 po (1) vissé sur l'âme (vis 3/8 × 1/2 : 4, Nord-Lock SP 6).
// Repère : celui de l'avance (FEED, placé à l'identité dans P028) : âme de
// x = −0.242 à −0.223, de y = 0.95 à 2.75, de z = −0.16 à 0 ; aile arrière en
// z = −0.179 à −0.16, de x = −0.44 à −0.205. Encombrement ≈ 0.25 × 1.8 × 0.33 m.
// Cotes : visserie (liste) ; tôles d'après la page 100 à l'échelle du mât.
import { IN, u, MAST, hhcs, nordLock, slab, orient, obround, pClamp, M } from './_feed.js';
import { SIDE_BOLTS } from './P058.js';

const XW = [-0.242, -0.223], Y = [0.95, 2.75], ZW = [-0.16, 0.0];
const ZF = [-0.179, -0.16], XF = [-0.44, -0.205];
// Trous de l'aile : supports P068 (vérin −X à x = −0.32).
const FLANGE_HOLES = [
  ...[-0.37, -0.27].flatMap((x) => [1.39, 1.5, 1.61].map((y) => [x, y])),
  ...[-0.37, -0.27].flatMap((x) => [2.51, 2.59].map((y) => [x, y])),
];

export default function P100(api) {
  const { S } = api;
  const { box, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // ============================================================ 3 — cornière
  const tw = XW[1] - XW[0];
  const web = orient(slab([[ZW[0], Y[0]], [ZW[1], Y[0]], [ZW[1], Y[1]], [ZW[0], Y[1]]].map(([z, y]) => [-z, y]),
    [obround(0.08, 1.45, 0.24, 0.05, 'y'), obround(0.08, 2.15, 0.24, 0.05, 'y'), ...SIDE_BOLTS.map(([y, z]) => [-z, y, u(0.34)]), [0.1, 0.98, u(0.2)]], tw, 'lightGrey'),
  [0, 0, -1], [0, 1, 0], [(XW[0] + XW[1]) / 2, 0, 0]);
  const fl = orient(slab([[XF[0] + 0.015, Y[0]], [XF[1], Y[0]], [XF[1], Y[1]], [XF[0] + 0.015, Y[1]], [XF[0], Y[1] - 0.015], [XF[0], Y[0] + 0.015]],
    FLANGE_HOLES.map(([x, y]) => [x, y, u(0.34)]), ZF[1] - ZF[0], 'lightGrey'), [1, 0, 0], [0, 1, 0], [0, 0, (ZF[0] + ZF[1]) / 2]);
  const pads = SIDE_BOLTS.map(([y, z]) => box(XW[1] - (-MAST.hw), 0.05, 0.05, 'lightGrey', { pos: [(XW[1] - MAST.hw) / 2, y, z] }));
  const gus = [1.25, 1.95, 2.3].map((y) => orient(slab([[0, 0], [0.12, 0], [0, 0.08]], [], u(0.375), 'lightGrey'), [-1, 0, 0], [0, 0, 1], [XW[0], y, ZF[1]]));
  // patte du collier Ø 3 3/4 po (soudée au bout de l'aile)
  const HC = { x: -0.50, y: 1.05, z: -0.2, r: u(3.75) / 2 }; // arrivée d'air (sous l'émerillon du collecteur P106)
  const arm = box(0.09, 0.012, 0.032, 'lightGrey', { pos: [-0.487, HC.y, ZF[0] + 0.016] });
  const bead = M([S.weld([[XW[0], Y[0], ZF[1]], [XW[0], Y[1], ZF[1]]], 0.008, 'lightGrey'), S.weld([[XW[1], Y[0] + 0.01, ZW[1] - 0.002], [XW[1], Y[1] - 0.01, ZW[1] - 0.002]], 0.006, 'lightGrey')], 'lightGrey');
  bead.geometry.userData.edgeAngle = 75;
  P('3', group(M([web, fl, ...pads, ...gus, arm], 'lightGrey'), bead), [-0.3, 0, 0]);

  // ============================================================ 2 — collier de boyau Ø 3 3/4 po
  const ring = (a0) => {
    const pts = [];
    for (let i = 0; i <= 18; i++) { const a = a0 + (i / 18) * Math.PI; pts.push([Math.cos(a) * (HC.r + 0.008), Math.sin(a) * (HC.r + 0.008)]); }
    for (let i = 18; i >= 0; i--) { const a = a0 + (i / 18) * Math.PI; pts.push([Math.cos(a) * (HC.r + 0.0015), Math.sin(a) * (HC.r + 0.0015)]); }
    return orient(slab(pts, [], 0.04, 'zinc'), [1, 0, 0], [0, 0, -1], [HC.x, HC.y, HC.z]);
  };
  const ears = [-1, 1].flatMap((s) => [-1, 1].map((k) => box(0.022, 0.04, 0.008, 'zinc', { pos: [HC.x + s * (HC.r + 0.018), HC.y, HC.z + k * 0.0045] })));
  const liner = S.ring(HC.r + 0.0015, HC.r - 0.001, 0.042, 'rubber', { seg: 32, pos: [HC.x, HC.y, HC.z] });
  const hw = [-1, 1].flatMap((s) => [
    hhcs(0.375 * IN, u(1.25), [HC.x + s * (HC.r + 0.02), HC.y, HC.z + 0.0095], [0, 0, 1]),
    S.nut(u(0.5625), u(0.33), 'zinc', { axis: 'z', pos: [HC.x + s * (HC.r + 0.02), HC.y, HC.z - 0.0095 - u(0.165)] }),
  ]);
  P('2', group(M([ring(0), ring(Math.PI), ...ears], 'zinc'), liner, M(hw, 'zinc')), [-0.1, 0, 0.15]);

  // ============================================================ 1 / 4 / 6 — collier en P Ø 2 po
  const pc = pClamp(2.0, { w: 0.019 });
  const V = (...a) => new api.THREE.Vector3(...a);
  const Yl = V(-1, 0, 0), Zl = V(0, 1, 0), Xl = Yl.clone().cross(Zl);
  pc.quaternion.setFromRotationMatrix(new api.THREE.Matrix4().makeBasis(Xl, Yl, Zl));
  pc.position.set(XW[0], 0.98, -0.12);
  P('1', pc, [-0.12, 0, 0]);
  const hole = V(XW[0], 0.98, -0.12).addScaledVector(Xl, pc.userData.hole[0]);
  const nl3 = 2 * Math.max(0.0008, 0.375 * IN * 0.09) * 1.1;
  P('6', nordLock(0.375 * IN, [XW[0] - 0.0024 - nl3 / 2, hole.y, hole.z], [-1, 0, 0], { sp: true }), [-0.16, 0, 0]);
  P('4', hhcs(0.375 * IN, u(0.5), [XW[0] - 0.0024 - nl3, hole.y, hole.z], [-1, 0, 0]), [-0.2, 0, 0]);

  // ============================================================ 5 / 7 — vis de l'âme
  const nl5 = 2 * Math.max(0.0008, 0.625 * IN * 0.09) * 1.1;
  SIDE_BOLTS.forEach(([y, z]) => {
    P('7', nordLock(0.625 * IN, [XW[0] - nl5 / 2, y, z], [-1, 0, 0], { sp: true }), [-0.1, 0, 0]);
    P('5', hhcs(0.625 * IN, u(4.5), [XW[0] - nl5, y, z], [-1, 0, 0]), [-0.22, 0, 0]);
  });
  return { view: { dir: [-1, 0.35, 0.7] } };
}

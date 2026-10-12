// P104 — Boucle de boyaux 6 pi CX037632 rév. 0 (page 104) : « ASSY, HOSE
// LOOP - 6FT », repère 21 de l'avance P028. Boucle roulante portée par deux
// câbles de 96 po (3) : brin fixe montant du support bas (8, « LOWER BULKHEAD
// BRACKET », potence boulonnée sur le flanc −X du mât par deux vis 5/8 ×
// 4 3/4 : 18, Nord-Lock 22), crosse au-dessus du mât, brin mobile descendant
// sur le support haut (6, « BRACKET, BULKHEAD ») vissé sur le chant haut de la
// plaque porte-tête (trois vis 3/4 × 1 3/4 : 19, Nord-Lock 23) où les câbles
// sont serrés par l'entretoise (5, « SPACER, HOSE ») et six vis 5/16 × 3 (14,
// Nord-Lock 20 des deux côtés, écrous 24). Trois peignes (4, « ASSY, HOSE
// SPACER ») tiennent l'écartement des câbles et des boyaux. Sur la tôle du
// support bas : quatre coudes de traversée JIC-12 (10), deux JIC-06 (9), une
// traversée droite NPT / JIC-08 (13) ; tés tournants (12) sur deux -12, avec
// leurs réductions tournantes -12 / -08 (11) ; collecteur d'air P106 (7) tenu
// par un berceau et son chapeau (quatre vis 1/2 × 2 : 17, Nord-Lock 21).
// Vis 1/2 × 1 1/2 entièrement filetées (16, contre-écrous 25, Nord-Lock 21) :
// serrage des pieds de câble (bas) et butées (haut). Arrivée d'air : collier
// (2) sur le boyau sous l'émerillon de P106, bride de sécurité (1) jusqu'à la
// patte du collecteur, vis 1/2 × 3/4 (15, Nord-Lock 21) (détail C).
// Simulation : support haut, entretoise et leur visserie suivent la tête
// (« feed ») ; câbles en flexibles dont chaque point suit l'avance, la tête
// ou un mélange ['ext', 'feed', w] (crosse à mi-course : w = 0.5, brins
// interpolés) ; peignes en corps mixtes ; support bas et raccords fixes.
// Repère : celui de l'avance (FEED, placé à l'identité dans P028), tête en
// haut : plan de la boucle x = −0.42 (câbles à ±0.15), brin fixe en z = 0.10
// depuis y = 1.92, brin mobile en z = 0.38 depuis y = 3.06, crosse de rayon
// 0.14 (sommet à y ≈ 3.63 ; tête en bas, y ≈ 2.6). Encombrement ≈ 0.45 ×
// 1.9 × 0.6 m.
// Cotes : visserie, raccords et câbles 96 po (liste) ; tôles et peignes
// d'après la page 104 et la boucle du DU311-TVK (P156).
import { body, flex } from '../layout.js';
import {
  IN, u, size, LOOP, AIR, MAST, PLATE, place, seat, hhcs, hexNut, nordLock, slab, orient, rrect, bulkElbow, tee, jicMale, M,
} from './_feed.js';
import { LOOP_BOLTS } from './P058.js';
import { SWIVEL_OUT } from './P106.js';

const XC = [LOOP.x - LOOP.dx, LOOP.x + LOOP.dx]; // câbles
const ZM = (LOOP.zA + LOOP.zB) / 2;
const YP = 1.80, TP = u(0.375); // tôle du support bas (dessous)
const XS = [-0.2575, -0.2445]; // potence : plaque d'appui extérieure
const NL = (d) => 2 * Math.max(0.0008, d * 0.09) * 1.1; // épaisseur d'une paire Nord-Lock

export default function P104(api) {
  const { S, THREE } = api;
  const { box, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (o) => body('feed', o);
  const V = (...a) => new THREE.Vector3(...a);

  // ============================================================ 8 — support bas
  const stand = [
    box(XS[1] - XS[0], 0.18, 0.115, 'lightGrey', { pos: [(XS[0] + XS[1]) / 2, 1.85, 0.0925] }),
    box(-MAST.hw - XS[1], TP, 0.115, 'lightGrey', { pos: [(XS[1] - MAST.hw) / 2, 1.94 - TP / 2, 0.0925] }),
    box(-MAST.hw - XS[1], TP, 0.115, 'lightGrey', { pos: [(XS[1] - MAST.hw) / 2, 1.76 + TP / 2, 0.0925] }),
  ];
  const B12 = [-0.33, -0.40].flatMap((x) => [0.06, 0.16].map((z) => [x, z]));
  const B6 = [[-0.585, 0.06], [-0.585, 0.16]], B8 = [-0.45, 0.165];
  const holes = [
    [XC[0], -LOOP.zA, 0.006], [XC[1], -LOOP.zA, 0.006],
    ...B12.map(([x, z]) => [x, -z, u(0.66)]), ...B6.map(([x, z]) => [x, -z, u(0.44)]), [B8[0], -B8[1], u(0.53)],
  ];
  const xp0 = XS[0], xp1 = XC[0] - 0.03;
  const plateT = orient(slab(rrect((xp0 + xp1) / 2, -0.11, xp0 - xp1, 0.14, 0.01), holes, TP, 'lightGrey'), [1, 0, 0], [0, 0, -1], [0, YP + TP / 2, 0]);
  const gus = orient(slab([[0, 0], [0.12, 0], [0, 0.05]], [], u(0.375), 'lightGrey'), [-1, 0, 0], [0, -1, 0], [XS[0], YP, 0.10]);
  // berceau et chapeau du collecteur P106 (axe de la ligne 2 po en y = AIR.yOut − 0.06)
  const ya = AIR.yOut - 0.06, r2 = u(2.375) / 2, zc = AIR.z - 0.105;
  const arcPts = (yc, s) => Array.from({ length: 13 }, (_, i) => { const a = (i / 12) * Math.PI; return [Math.cos(a) * (r2 + 0.001), yc + s * Math.sin(a) * (r2 + 0.001)]; });
  const cradle = orient(slab([[-0.05, YP + TP], [0.05, YP + TP], [0.05, ya], ...arcPts(ya, -1), [-0.05, ya]], [], 0.05, 'lightGrey'), [1, 0, 0], [0, 1, 0], [AIR.x, 0, zc]);
  const cap = orient(slab([[0.05, ya + 0.003], ...arcPts(ya + 0.003, 1), [-0.05, ya + 0.003], [-0.05, ya + r2 + 0.02], [0.05, ya + r2 + 0.02]], [], 0.05, 'lightGrey'), [1, 0, 0], [0, 1, 0], [AIR.x, 0, zc]);
  const blocks = XC.map((x) => box(0.032, 0.03, 0.032, 'lightGrey', { r: 0.002, pos: [x, YP + TP + 0.015, LOOP.zA] }));
  const tab = box(0.03, 0.04, u(0.375), 'lightGrey', { pos: [AIR.x, YP - 0.02, LOOP.zA + 0.06] });
  P('8', M([...stand, plateT, gus, cradle, cap, ...blocks, tab], 'lightGrey'), [-0.25, -0.1, 0]);

  // 18 / 22 — vis de la potence (dans les doublures du flanc −X)
  const nl5 = NL(0.625 * IN);
  LOOP_BOLTS.forEach(([y, z]) => {
    P('22', nordLock(0.625 * IN, [XS[0] - nl5 / 2, y, z], [-1, 0, 0]), [-0.1, 0, 0]);
    P('18', hhcs(0.625 * IN, u(4.75), [XS[0] - nl5, y, z], [-1, 0, 0]), [-0.22, 0, 0]);
  });
  // 17 / 21 — vis du chapeau
  const nl4 = NL(0.5 * IN);
  for (const dx of [-0.038, 0.038]) for (const dz of [-0.013, 0.013]) {
    const p = [AIR.x + dx, ya + r2 + 0.02, zc + dz];
    P('21', nordLock(0.5 * IN, [p[0], p[1] + nl4 / 2, p[2]], [0, 1, 0]), [0, 0.12, 0]);
    P('17', hhcs(0.5 * IN, u(2), [p[0], p[1] + nl4, p[2]], [0, 1, 0]), [0, 0.2, 0]);
  }
  // 16 / 25 / 21 — serrage des pieds de câble (vis horizontales dans les blocs)
  XC.forEach((x) => {
    const p = [x, YP + TP + 0.015, LOOP.zA + 0.016];
    P('25', hexNut(0.5 * IN, [p[0], p[1], p[2] + 0.0045], [0, 0, 1], { jam: true }), [0, 0, 0.08]);
    P('21', nordLock(0.5 * IN, [p[0], p[1], p[2] + 0.009 + nl4 / 2], [0, 0, 1]), [0, 0, 0.11]);
    P('16', hhcs(0.5 * IN, u(1.5), [p[0], p[1], p[2] + 0.009 + nl4 + 0.012], [0, 0, 1]), [0, 0, 0.16]);
  });

  // ============================================================ 9 / 10 / 13 — traversées ; 12 tés, 11 réductions
  const reducer = () => {
    const s = size(12), n8 = size(8);
    return group(M([
      S.nut(s.nut, s.nut * 0.7, 'zinc', { pos: [0, s.nut * 0.35 * 0.6, 0] }),
      S.lathe([[0, s.nut * 0.42], [n8.hex * 0.42, s.nut * 0.42], [n8.hex * 0.42, s.nut * 0.42 + 0.006], ...jicMale(8, s.nut * 0.42 + 0.006).slice(1)], 'zinc', { seg: 12 }),
    ], 'zinc'));
  };
  B12.forEach(([x, z], i) => {
    const e = place(bulkElbow(12, { t: TP }), [x, YP, z], [0, 1, 0], [0, 0, -1]);
    P('10', e, [0, -0.08, 0]);
    if (z > 0.11) {
      const s0 = seat(e, 0);
      const t = place(tee('swivel', 12, 12), s0.p, s0.d, [0, 0, -1]);
      P('12', t, [0, 0.1, 0]);
      for (const k of [0, 1]) { const st = seat(t, k); P('11', place(reducer(), st.p, st.d), [0, 0.16, k * -0.06]); }
    }
    void i;
  });
  B6.forEach(([x, z]) => P('9', place(bulkElbow(6, { t: TP }), [x, YP, z], [0, 1, 0], [0, 0, -1]), [0, -0.08, 0]));
  {
    // 13 — traversée droite : corps fileté, deux écrous, mâle JIC-08 dessus, NPT 1/2 dessous
    const n8 = size(8), rb = n8.jic * 0.62 + 0.003, af = n8.hex * 1.15;
    const obj = group(M([
      S.lathe([[0, -0.03], [u(0.84) / 2 * 0.9, -0.03], ...S.thread(u(0.84) / 2, -0.03, -0.012, { r1: u(0.84) / 2 * 0.94, pitch: 0.0018, maxTurns: 5 }), [rb, -0.01],
        ...S.thread(rb, -0.01, TP + 0.012, { pitch: rb * 0.3, maxTurns: 5, chamferBottom: false }), ...jicMale(8, TP + 0.013).slice(1)], 'zinc', { seg: 12 }),
      S.nut(af, 0.008, 'zinc', { pos: [0, -0.004, 0] }), S.nut(af, 0.007, 'zinc', { pos: [0, TP + 0.0035, 0] }),
    ], 'zinc'));
    P('13', place(obj, [B8[0], YP, B8[1]], [0, 1, 0]), [0, -0.1, 0.05]);
  }

  // ============================================================ 7 — collecteur d'air
  P('7', S.at(api.sub('P106'), [AIR.x, AIR.yOut, AIR.z]), [-0.15, 0.15, 0.1]);

  // ============================================================ 1 / 2 / 15 — collier et bride de l'arrivée d'air
  const sw = V(AIR.x + SWIVEL_OUT.p[0], AIR.yOut + SWIVEL_OUT.p[1], AIR.z + SWIVEL_OUT.p[2]);
  const lug = V(AIR.x + SWIVEL_OUT.lug[0], AIR.yOut + SWIVEL_OUT.lug[1], AIR.z + SWIVEL_OUT.lug[2]);
  const yc2 = sw.y - 0.07, rh = u(2.6) / 2;
  P('2', group(M([
    S.ring(rh + 0.0012, rh, 0.012, 'zinc', { seg: 28, pos: [sw.x, yc2, sw.z] }),
    box(0.012, 0.012, 0.025, 'zinc', { pos: [sw.x, yc2, sw.z + rh + 0.012] }),
    S.cyl(0.004, 0.02, 'zinc', { axis: 'x', seg: 10, pos: [sw.x, yc2, sw.z + rh + 0.006] }),
  ], 'zinc')), [0, -0.1, -0.1]);
  const a = V(sw.x, yc2, sw.z + rh + 0.022), b = lug.clone();
  const dir = b.clone().sub(a), len = dir.length();
  const strap = box(0.025, len + 0.03, u(0.125), 'zinc', { r: 0.002 });
  const sg = group(strap);
  sg.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
  sg.position.copy(a).add(b).multiplyScalar(0.5);
  P('1', group(sg), [0.1, -0.1, 0]);
  P('21', nordLock(0.5 * IN, [lug.x + 0.003 + nl4 / 2, lug.y, lug.z], [1, 0, 0]), [0.12, 0, 0]);
  P('15', hhcs(0.5 * IN, u(0.75), [lug.x + 0.003 + nl4 + u(0.125), lug.y, lug.z], [1, 0, 0]), [0.18, 0, 0]);

  // ============================================================ 6 — support haut (suit la tête), 5 — entretoise
  const yE = PLATE.y1, tb = u(0.5);
  const zb = [LOOP.zB - u(1.0), LOOP.zB, LOOP.zB + u(1.0)]; // demi-barres (joint en z = zB)
  const yb = [yE + tb, yE + tb + 0.04];
  const xb = [XC[0] - 0.02, XC[1] + 0.02];
  const base = box(0.105, tb, PLATE.z1 - PLATE.z0, 'grey', { pos: [-0.1825, yE + tb / 2, (PLATE.z0 + PLATE.z1) / 2] });
  const armPts = [[-0.13, PLATE.z0], [-0.13, PLATE.z1], [xb[1], zb[0]], [xb[0], zb[0]], [xb[0], zb[0] - 0.04], [-0.235, PLATE.z0]];
  const arm = orient(slab(armPts.map(([x, z]) => [x, -z]), [], tb, 'grey'), [1, 0, 0], [0, 0, -1], [0, yE + tb * 1.5, 0]);
  // demi-barre arrière (soudée), alvéoles : câbles aux bouts, boyaux gradués entre
  const dia = [0.375, 1.25, 1.0, 0.75, 0.75, 1.0, 1.25, 0.375].map((d) => u(d));
  const xs = [XC[0], ...[0.05, 0.095, 0.135, 0.165, 0.2, 0.24].map((t) => XC[0] + t * (XC[1] - XC[0]) / 0.29), XC[1]];
  const halfBar = (z0, z1, mat, yc = (yb[0] + yb[1]) / 2) => {
    const s = z1 > z0 ? 1 : -1;
    const pts = [[xb[0], 0], [xb[0], s * (Math.abs(z1 - z0))]];
    pts.splice(1, 0);
    const out = [[xb[0], Math.abs(z1 - z0) * s]];
    out.push([xb[1], Math.abs(z1 - z0) * s], [xb[1], 0]);
    for (let i = xs.length - 1; i >= 0; i--) {
      const r = dia[i] / 2 + 0.0005;
      for (let k = 0; k <= 8; k++) { const t = (k / 8) * Math.PI; out.push([xs[i] + Math.cos(t) * r, s * Math.sin(t) * r]); }
    }
    out.push([xb[0], 0]);
    const q = s > 0 ? out : out.slice().reverse();
    return orient(slab(q.map(([x, w]) => [x, w]), [], yb[1] - yb[0], mat), [1, 0, 0], [0, 0, 1], [0, yc, z0]);
  };
  P('6', F(M([base, arm, halfBar(LOOP.zB, zb[0], 'grey')], 'grey')), [-0.1, 0.25, 0]);
  P('5', F(halfBar(LOOP.zB, zb[2], 'plastic')), [-0.1, 0.25, 0.12]);
  // 14 / 20 / 24 — vis de l'entretoise
  const nl14 = NL(0.3125 * IN);
  const X14 = [0.035, 0.12, 0.165, 0.2, 0.245, 0.275].map((t) => XC[0] + t * (XC[1] - XC[0]) / 0.29);
  X14.forEach((x) => {
    const y = (yb[0] + yb[1]) / 2;
    P('20', F(nordLock(0.3125 * IN, [x, y, zb[2] + nl14 / 2], [0, 0, 1])), [0, 0.3, 0.16]);
    P('14', F(hhcs(0.3125 * IN, u(3), [x, y, zb[2] + nl14], [0, 0, 1])), [0, 0.3, 0.22]);
    P('20', F(nordLock(0.3125 * IN, [x, y, zb[0] - nl14 / 2], [0, 0, -1])), [0, 0.3, -0.06]);
    P('24', F(hexNut(0.3125 * IN, [x, y, zb[0] - nl14 - 0.0034], [0, 0, -1])), [0, 0.3, -0.1]);
  });
  // 19 / 23 — vis du pied (dans le chant haut de la plaque porte-tête)
  const nl19 = NL(0.75 * IN);
  [-0.215, -0.15].concat([-0.1825]).forEach((x, i) => {
    const z = i < 2 ? PLATE.z0 + 0.012 : PLATE.z1 - 0.012;
    P('23', F(nordLock(0.75 * IN, [x, yE + tb + nl19 / 2, z], [0, 1, 0])), [0, 0.35, 0]);
    P('19', F(hhcs(0.75 * IN, u(1.75), [x, yE + tb + nl19, z], [0, 1, 0])), [0, 0.42, 0]);
  });
  // 16 / 25 / 21 — butées réglables du bras (appui sur le chant de la plaque)
  [[-0.245, 0.29], [-0.32, 0.33]].forEach(([x, z]) => {
    const y = yE + 2 * tb;
    P('25', F(hexNut(0.5 * IN, [x, y + 0.0045, z], [0, 1, 0], { jam: true })), [0, 0.3, 0]);
    P('21', F(nordLock(0.5 * IN, [x, y + 0.009 + nl4 / 2, z], [0, 1, 0])), [0, 0.33, 0]);
    P('16', F(hhcs(0.5 * IN, u(1.5), [x, y + 0.009 + nl4, z], [0, 1, 0])), [0, 0.38, 0]);
  });

  // ============================================================ 3 — câbles (flexibles), 4 — peignes
  const ya0 = YP + TP + 0.031; // sortie des blocs de serrage
  const yA = LOOP.yA, yB = yb[1], yArch = LOOP.yArch, r = LOOP.r;
  const loopPts = (x) => {
    const pts = [[x, ya0 - 0.03, LOOP.zA], [x, ya0, LOOP.zA], [x, yA + 0.2, LOOP.zA], [x, (yA + yArch) / 2, LOOP.zA], [x, yArch - 0.1, LOOP.zA], [x, yArch, LOOP.zA]];
    const bod = ['ext', 'ext', ['ext', 'feed', 0.5 * 0.2 / (yArch - yA)], ['ext', 'feed', 0.25], ['ext', 'feed', 0.5 * (yArch - 0.1 - yA) / (yArch - yA)], ['ext', 'feed', 0.5]];
    for (const t of [0.25, 0.5, 0.75]) {
      const a = t * Math.PI;
      pts.push([x, yArch + Math.sin(a) * r, ZM - Math.cos(a) * r]); bod.push(['ext', 'feed', 0.5]);
    }
    pts.push([x, yArch, LOOP.zB], [x, yArch - 0.1, LOOP.zB], [x, (yArch + yB) / 2, LOOP.zB], [x, yB, LOOP.zB], [x, yb[0] - 0.02, LOOP.zB]);
    bod.push(['ext', 'feed', 0.5], ['ext', 'feed', 0.5 + 0.5 * 0.1 / (yArch - yB)], ['ext', 'feed', 0.75], 'feed', 'feed');
    return [pts, bod];
  };
  XC.forEach((x, i) => {
    const [pts, bod] = loopPts(x);
    const c = flex(S, pts, bod, u(0.375) / 2, 'darkSteel', { seg: 120, radial: 8, ends: 'none' });
    c.geometry.userData.edgeAngle = 75;
    const ends = M([S.cyl(0.0068, 0.02, 'zinc', { seg: 12, pos: [x, ya0 - 0.035, LOOP.zA] })], 'zinc');
    const endB = F(M([S.cyl(0.0068, 0.02, 'zinc', { seg: 12, pos: [x, yb[0] - 0.025, LOOP.zB] })], 'zinc'));
    P('3', group(c, ends, endB), [i ? 0.12 : -0.12, 0.2, 0]);
  });
  // peignes : demi-barres plastique à alvéoles (câbles aux bouts), six vis 1/4 po et écrous
  const comb = (pos, normal, w) => {
    const halves = [halfBar(0, 0.016, 'plastic', 0), halfBar(0, -0.016, 'plastic', 0)];
    const hw = X14.map((xx) => group(S.cyl(0.0032, 0.042, 'zinc', { axis: 'z', seg: 10, pos: [xx, 0, 0] }), S.nut(u(0.4375), 0.005, 'zinc', { axis: 'z', pos: [xx, 0, -0.018] })));
    const mesh = group(M(halves, 'plastic'), M(hw, 'zinc'));
    const wrap = group(mesh);
    // joint dans le plan (X, dir) : normale du joint = normal
    wrap.quaternion.setFromUnitVectors(V(0, 0, 1), V(...normal).normalize());
    wrap.position.set(...pos);
    return body(w === 0 ? 'ext' : ['ext', 'feed', w], wrap);
  };
  const wA = (y) => 0.5 * (y - yA) / (yArch - yA);
  P('4', comb([0, 2.25, LOOP.zA], [0, 0, 1], wA(2.25)), [0, 0, -0.15]);
  P('4', comb([0, 2.8, LOOP.zA], [0, 0, 1], wA(2.8)), [0, 0, -0.15]);
  P('4', comb([0, yArch + r, ZM], [0, 1, 0], 0.5), [0, 0.2, 0]);
  void THREE; void hexNut;
  return { view: { dir: [-1, 0.4, 0.9] } };
}

// P228 — Cadre d'appui du mât CX030874 rév. 2 (pages 228 à 231) : « MAST REST
// FRAME », repère 2 du porteur P220. Charpente boulonnée sur les flancs du
// châssis avant, devant le réservoir hydraulique : deux cadres latéraux en
// tube 2 × 2 po à fenêtre (10 droit, 11 gauche ; les bancs de distributeurs
// passent dans les fenêtres) sur pieds, avec console horizontale et trois
// crochets à flexibles ; longeron transversal d'appui du mât (12, tube 4 po
// percé, potelet à platine) portant l'entretoise (17) et le berceau du mât en
// V (6) ; butée du mât (9, tube 3 po à pattes et goussets) ; supports de
// distributeurs perforés (23 droit, 2 gauche) et leurs équerres d'about
// (24, 8) ; panneau de manomètres (18) ; support du tableau ERIS (14) dans la
// fenêtre gauche ; supports de l'injecteur de graisse (13), du filtre-
// graisseur d'air (15) et de l'électrovanne (16) ; échangeur huile / eau (3)
// sur la console gauche ; deux brides de filtres Argo (7) sous le longeron ;
// pompe électrique de remplissage d'huile 24 V (5, P232 du TVK, repère de
// P356) sur sa platine (1) entre le longeron et la butée, son élément
// filtrant (5.1, sorti de P232), et au refoulement : adaptateur ORB -8 →
// femelle NPT (22), mamelon six-pans 1/2 × 3/4 NPT (21), clapet anti-retour
// 3/4 NPT (4), adaptateur 3/4 NPT → JIC -8 (19) ; à l'aspiration, adaptateur
// droit ORB → JIC -8 (20).
// Repère machine (../layout.js), placé à l'identité par P220 : cadres sur
// les flancs (z = ±0.46), x 0.56 → 1.10, dessus des longerons à y ≈ 1.80.
// Tout est porté par le châssis avant : corps mobile « front ».
import { M as MM, body } from '../layout.js';
import { u, cabHw, prism, rrect } from './_cab.js';

export default function P228(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, merged, group, at, weld, tube } = S;
  const H_ = cabHw(api);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (ref, obj, e) => P(ref, body('front', obj), e);
  const L = 'lightGrey';
  const FT = MM.frameTop;
  const FR = { x0: 0.56, x1: 1.1, z: 0.46, yw0: 1.2, top: 1.69, a: u(2) }; // cadres latéraux
  const B12 = { x: 1.07, y: 1.746, a: u(4), z0: -0.62, z1: 0.62 };
  const B9 = { x: 0.6, y: 1.73, a: u(3), z0: -0.52, z1: 0.52 };

  // ---------------------------------------------------------------- 10, 11 — cadres latéraux
  const sideFrame = (s) => {
    const z = s * FR.z, a = FR.a, parts = [];
    // Fenêtre : quatre tubes 2 × 2 po ; pieds avant et arrière jusqu'aux semelles.
    parts.push(box(FR.x1 - FR.x0, a, a, L, { r: 0.003, pos: [(FR.x0 + FR.x1) / 2, FR.top - a / 2, z] }));
    parts.push(box(FR.x1 - FR.x0, a, a, L, { r: 0.003, pos: [(FR.x0 + FR.x1) / 2, FR.yw0 + a / 2, z] }));
    for (const x of [FR.x0 + a / 2, FR.x1 - a / 2]) parts.push(box(a, FR.top - FT - 0.0127, a, L, { r: 0.003, pos: [x, (FR.top + FT + 0.0127) / 2, z] }));
    // Semelles (plat 1/2 po) sur le dessus des flancs du châssis, deux trous chacune.
    for (const x of [FR.x0 + a / 2, FR.x1 - a / 2]) parts.push(H_.K.plate(0.1, 0.07, 0.0127, L, { holes: [[-0.032, 0, 0.0075], [0.032, 0, 0.0075]], seg: 8 }));
    parts[parts.length - 2].position.set(FR.x0 + a / 2, FT + 0.0064, s * MM.frameZ);
    parts[parts.length - 1].position.set(FR.x1 - a / 2, FT + 0.0064, s * MM.frameZ);
    // Console extérieure (tôle 3/8) sous la fenêtre, avec jambe de force.
    const sz0 = s * (MM.frameZ + 0.015), sz1 = s * 0.78;
    parts.push(box(0.36, u(0.375), Math.abs(sz1 - sz0), L, { pos: [0.76, 0.955, (sz0 + sz1) / 2] }));
    parts.push(prism(S, THREE, [[0.62, 0.95], [0.9, 0.95], [0.62, 0.8]], 0.01, L, 'xy', s * (MM.frameZ + 0.02)));
    // Trois crochets en J sous la fenêtre (rond Ø 1/2 po).
    for (const x of [0.68, 0.83, 0.98]) parts.push(tube([[x, FR.yw0, z + s * 0.02], [x, FR.yw0 - 0.06, z + s * 0.03], [x, FR.yw0 - 0.1, z + s * 0.07], [x, FR.yw0 - 0.07, z + s * 0.11]], 0.0064, L, { seg: 14, radial: 8, ends: 'none' }));
    const beads = merged([
      weld([[FR.x0 + a, FR.top - a - 0.002, z + s * a / 2], [FR.x1 - a, FR.top - a - 0.002, z + s * a / 2]], 0.005, L),
      weld([[FR.x0 + a, FR.yw0 + a + 0.002, z + s * a / 2], [FR.x1 - a, FR.yw0 + a + 0.002, z + s * a / 2]], 0.005, L),
    ], L);
    return group(merged(parts, L), beads);
  };
  F('10', sideFrame(1), [0, 0, 0.3]);
  F('11', sideFrame(-1), [0, 0, -0.3]);

  // ---------------------------------------------------------------- 12 — longeron d'appui ; 17 — entretoise ; 6 — berceau du mât
  const sqTube = (x, y, z0, z1, a, w = u(0.25)) => merged([
    box(a, w, z1 - z0, L, { pos: [x, y + a / 2 - w / 2, (z0 + z1) / 2] }), box(a, w, z1 - z0, L, { pos: [x, y - a / 2 + w / 2, (z0 + z1) / 2] }),
    box(w, a - 2 * w, z1 - z0, L, { pos: [x - a / 2 + w / 2, y, (z0 + z1) / 2] }), box(w, a - 2 * w, z1 - z0, L, { pos: [x + a / 2 - w / 2, y, (z0 + z1) / 2] }),
  ], L);
  const b12 = [sqTube(B12.x, B12.y, B12.z0, B12.z1, B12.a)];
  const holes12 = [];
  for (let i = 0; i < 13; i++) holes12.push(at(lathe([[0.0065, 0.0003], [0, 0.0003]], 'blackOxide', { seg: 10 }), [B12.x, B12.y + B12.a / 2, B12.z0 + 0.06 + i * 0.095]));
  b12.push(merged([
    box(u(3), 0.12, u(3), L, { pos: [B12.x, B12.y + B12.a / 2 + 0.06, 0.4] }),
    box(0.13, u(0.5), 0.1, L, { r: 0.003, pos: [B12.x, B12.y + B12.a / 2 + 0.126, 0.4] }),
    ...[-1, 1].map((s) => box(0.12, u(0.375), 0.12, L, { pos: [B12.x, B12.y - B12.a / 2 - u(0.19), s * 0.46] })),
  ], L));
  F('12', group(...b12, merged(holes12, 'blackOxide')), [0.1, 0.25, 0]);
  const yS = B12.y + B12.a / 2;
  F('17', merged([box(0.1, 0.05, 0.56, L, { r: 0.003, pos: [B12.x, yS + 0.025, -0.05] }), box(0.12, u(0.375), 0.6, L, { pos: [B12.x, yS + 0.05 + u(0.19), -0.05] })], L), [0, 0.35, 0]);
  const yC = yS + 0.05 + u(0.375);
  const cradle = merged([
    box(0.1, u(0.5), 0.62, L, { r: 0.003, pos: [B12.x, yC + u(0.25), -0.05] }),
    ...[-1, 1].map((s) => at(prism(S, THREE, [[-0.05, 0], [0.05, 0], [0.11, 0.09], [0.08, 0.1], [0.0, 0.025], [-0.06, 0.025]], 0.09, L, 'xy', 0), [B12.x, yC + u(0.5), -0.05 + s * 0.27], [0, s > 0 ? -Math.PI / 2 : Math.PI / 2, 0])),
  ], L);
  F('6', cradle, [0, 0.45, 0]);

  // ---------------------------------------------------------------- 9 — butée du mât
  F('9', group(
    sqTube(B9.x, B9.y, B9.z0, B9.z1, B9.a),
    merged([
      ...[-1, 1].map((s) => H_.K.plate(0.09, 0.08, 0.0127, L, { holes: [[0, s * 0.02, 0.0075]], seg: 8 }).translateX(B9.x).translateY(B9.y - B9.a / 2 - 0.0064).translateZ(s * FR.z)),
      ...[-0.2, 0.2].map((z) => box(0.07, 0.12, 0.01, L, { pos: [B9.x, B9.y - B9.a / 2 - 0.06, z] })),
    ], L),
  ), [-0.1, 0.25, 0]);

  // ---------------------------------------------------------------- 1 — platine de la pompe ; 5 — pompe (P232) ; 5.1 — élément filtrant
  const PU = [0.78, 1.86, -0.32]; // centre de la bride (face côté moteur)
  const plate1 = prism(S, THREE, [[B9.x + B9.a / 2, B9.y - 0.03], [B12.x - B12.a / 2, B12.y - 0.03], [B12.x - B12.a / 2, 1.93], [B9.x + B9.a / 2, 1.93]], u(0.25), L, 'xy', PU[2] - u(0.125), { holes: [[PU[0], PU[1], 0.043]] });
  const ears1 = merged([[B9.x + B9.a / 2 + 0.003, 1], [B12.x - B12.a / 2 - 0.003, -1]].map(([x, s]) => box(0.006, 0.08, 0.05, L, { pos: [x, B12.y, PU[2] + 0.025] })), L);
  F('1', group(plate1, ears1), [0, 0.2, -0.15]);
  const pump = api.sub('P232');
  pump.position.set(PU[0], PU[1], PU[2] + u(0.125));
  F('5', pump, [0, 0.35, -0.2]);
  const el = pump.userData.parts?.find((p) => p.userData.partRef === '1');
  if (el) {
    pump.remove(el);
    pump.userData.parts.splice(pump.userData.parts.indexOf(el), 1);
    pump.updateMatrix();
    el.applyMatrix4(pump.matrix);
    F('5.1', el, [0, 0.55, -0.2]);
  }
  // Refoulement (orifice +X de la pompe) : 22 → 21 → 4 → 19.
  const yP = PU[1] - 0.052, zP = PU[2] + u(0.125) - 0.06;
  let xP = PU[0] + 0.06;
  const ax = (obj, x) => H_.pose(obj, [x, yP, zP], [1, 0, 0], [0, 1, 0]);
  F('22', ax(group(merged([lathe([[0, -0.012], [0.009, -0.012], [0.009, 0], [0, 0]], 'zinc', { seg: 10 }), H_.R.hexY(u(0.875), 0.0005, 0.014), lathe([[0.0105, 0.0145], [0.0135, 0.0145], [0.0135, 0.026], [0.0105, 0.026]], 'zinc', { seg: 14 })], 'zinc')), xP), [0.08, 0, 0]);
  xP += 0.02;
  F('21', ax(H_.R.hexNipple(8, 12), xP), [0.12, 0, 0]);
  xP += 0.03;
  F('4', ax(group(merged([
    H_.R.hexY(u(1.375), 0, 0.016), lathe([[0.012, 0.016], [0.02, 0.016], [0.02, 0.05], [0.012, 0.05]], 'brass', { seg: 18 }), H_.R.hexY(u(1.375), 0.05, 0.016),
  ], 'brass'), at(box(0.012, 0.003, 0.006, 'black'), [0, 0.033, 0.021])), xP), [0.16, 0, 0]);
  xP += 0.066;
  F('19', ax(H_.R.straight({ port: 'npt', pd: 12, jd: 8 }), xP), [0.2, 0, 0]);
  // Aspiration (orifice −X) : 20.
  F('20', H_.pose(H_.R.straight({ port: 'orb', pd: 8, jd: 8 }), [PU[0] - 0.06, yP, zP], [-1, 0, 0], [0, 1, 0]), [-0.1, 0, 0]);

  // ---------------------------------------------------------------- 7 — brides de filtres Argo (×2) sous le longeron
  for (const z of [-0.15, 0.12]) {
    F('7', merged([
      box(0.11, u(0.25), 0.07, L, { pos: [B12.x, B12.y - B12.a / 2 - u(0.125), z] }),
      ...[-1, 1].map((s) => box(u(0.25), 0.13, 0.07, L, { pos: [B12.x + s * 0.052, B12.y - B12.a / 2 - 0.065, z] })),
      ...[-1, 1].map((s) => box(0.03, u(0.25), 0.07, L, { pos: [B12.x + s * 0.067, B12.y - B12.a / 2 - 0.127, z] })),
    ], L), [0, -0.12, 0]);
  }

  // ---------------------------------------------------------------- 23, 2 — supports de distributeurs perforés ; 24, 8 — équerres d'about
  const vbracket = (s) => {
    const zi = s * 0.5, zo = s * 0.76, y0 = 1.2, y1 = 1.425, x0 = 0.58, x1 = 1.12;
    const holes = [];
    for (let i = 0; i < 11; i++) holes.push(rrect(x0 + 0.05 + i * 0.044, y1 - 0.045, 0.012, 0.045, 0.006, 3));
    const circ = [];
    for (let i = 0; i < 10; i++) for (const yy of [y0 + 0.07, y0 + 0.11]) circ.push([x0 + 0.07 + i * 0.044 + (yy > y0 + 0.09 ? 0.022 : 0), yy, 0.008]);
    return group(merged([
      prism(S, THREE, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], u(0.1345), L, 'xy', zo, { polys: holes, holes: circ }),
      box(x1 - x0, u(0.1345), Math.abs(zo - zi), L, { pos: [(x0 + x1) / 2, y1 - u(0.067), (zi + zo) / 2] }),
      box(x1 - x0, 0.04, u(0.1345), L, { pos: [(x0 + x1) / 2, y1 - 0.02, zi] }),
      prism(S, THREE, [[zi, y0 + 0.04], [zo, y0 + 0.04], [zo, y1], [zi, y1]].map(([z, y]) => [z, y]), u(0.1345), L, 'zy', x0 + u(0.067)),
    ], L));
  };
  F('23', vbracket(1), [0, 0.15, 0.3]);
  F('2', vbracket(-1), [0, 0.15, -0.3]);
  for (const [s, ref] of [[1, '24'], [-1, '8']]) {
    F(ref, merged([
      prism(S, THREE, [[s * 0.52, 1.2], [s * 0.74, 1.2], [s * 0.74, 1.3], [s * 0.52, 1.3]], u(0.25), L, 'zy', 1.12 + u(0.125), { holes: [[s * 0.57, 1.25, 0.005], [s * 0.69, 1.25, 0.005]] }),
      box(0.05, u(0.25), 0.22, L, { pos: [1.12 + 0.025, 1.2 + u(0.125), s * 0.63] }),
    ], L), [0.12, 0, s * 0.1]);
  }

  // ---------------------------------------------------------------- 18 — panneau de manomètres (arrière gauche)
  F('18', prism(S, THREE, [[0.45, 1.12], [0.55, 1.12], [0.55, 1.66], [0.45, 1.66]], u(0.1875), L, 'xy', -0.52, {
    holes: [[0.5, 1.6, 0.022], [0.5, 1.53, 0.022], [0.5, 1.44, 0.035], [0.5, 1.34, 0.022], [0.5, 1.27, 0.022], [0.5, 1.2, 0.022]],
  }), [0, 0, -0.15]);

  // ---------------------------------------------------------------- 14 — support ERIS (fenêtre gauche) ; 13, 15, 16 — petits supports
  F('14', merged([
    prism(S, THREE, [[0.66, 1.3], [0.88, 1.3], [0.88, 1.47], [0.66, 1.47]], u(0.1875), L, 'xy', -FR.z - 0.03, { holes: [[0.7, 1.34, 0.004], [0.84, 1.34, 0.004], [0.7, 1.43, 0.004], [0.84, 1.43, 0.004], [0.77, 1.385, 0.02]] }),
    ...[0.66, 0.88].map((x) => box(0.012, 0.17, 0.03, L, { pos: [x, 1.385, -FR.z - 0.015] })),
  ], L), [0, 0, -0.15]);
  const smallMount = (x, w, h) => merged([
    box(w, 0.006, 0.05, L, { pos: [x, 0.955 - 0.003 - u(0.19), -0.53] }),
    box(w, h, 0.006, L, { pos: [x, 0.955 - h / 2 - u(0.19), -0.555] }),
  ], L);
  F('16', smallMount(0.66, 0.07, 0.09), [0, -0.1, -0.1]);
  F('13', smallMount(0.78, 0.08, 0.07), [0, -0.1, -0.1]);
  F('15', merged([box(0.03, 0.15, u(0.25), L, { pos: [0.93, 0.955 - 0.075, -0.6] }), box(0.03, 0.006, 0.06, L, { pos: [0.93, 0.95 - u(0.19), -0.575] })], L), [0, -0.12, -0.1]);

  // ---------------------------------------------------------------- 3 — échangeur huile / eau (console gauche)
  const R = u(3), RF = u(4.5), TF = u(0.75), Lc = u(14), xc = 0.74, yc = 1.08, zc = -0.66;
  const ex = group(
    merged([
      at(cyl(R, Lc - 2 * TF, 'blue', { axis: 'x', seg: 32 }), [xc, yc, zc]),
      ...[-1, 1].map((s) => at(cyl(RF, TF, 'blue', { axis: 'x', seg: 32 }), [xc + s * (Lc / 2 - TF / 2), yc, zc])),
      at(lathe([[0, 0], [RF * 0.92, 0], [RF * 0.88, 0.03], [RF * 0.6, 0.055], [0, 0.065]], 'blue', { seg: 28 }), [xc - Lc / 2, yc, zc], [0, 0, Math.PI / 2]),
      at(cyl(RF * 0.95, 0.08, 'blue', { axis: 'x', seg: 28 }), [xc + Lc / 2 + 0.04, yc, zc]),
      ...[-0.1, 0.1].map((dx) => at(cyl(0.03, 0.03, 'blue', { seg: 18 }), [xc + dx, yc + R + 0.012, zc])),
      ...[-1, 1].map((s) => box(0.03, 0.09, 0.2, 'blue', { pos: [xc + s * (Lc / 2 - TF - 0.03), yc - R - 0.02, zc] })),
    ], 'blue'),
    merged([
      ...[-1, 1].flatMap((s) => Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * Math.PI * 2; return at(cyl(0.006, TF * 2.4, 'zinc', { axis: 'x', seg: 6 }), [xc + s * (Lc / 2 - TF / 2), yc + Math.cos(a) * (RF - 0.015), zc + Math.sin(a) * (RF - 0.015)]); })),
      ...[-0.1, 0.1].map((dx) => H_.R.hexY(u(2.25), 0, 0.012).translateX(xc + dx).translateY(yc + R + 0.027).translateZ(zc)),
      ...[1, -1].map((s) => at(H_.R.hexY(u(1.625), 0, 0.012), [xc + Lc / 2 + 0.08, yc + s * 0.04, zc], [0, 0, -Math.PI / 2])),
    ], 'zinc'),
  );
  F('3', ex, [0, 0.12, -0.2]);
  return { view: { dir: [1, 0.75, -1.1] } };
}

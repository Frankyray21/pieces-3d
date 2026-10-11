// P188 — Circuit d'air de la glissière « ASSY, AIR SYSTEM » CX037698 rév. 0
// (page 188 : vues avant et arrière). Réservoir d'air (9, P190) couché en
// travers dans le châssis avant, berceau posé sur les plats de la tôle de
// protection et tenu par deux vis H 1/2 × 3 1/2 (22, rondelles 24 et
// Nord-Lock SP 25) ; tuyauterie d'air marche / arrêt (10, P192) en travers
// devant le châssis, sous la glissière, entrée auxiliaire à gauche ;
// flexibles 2 po à brides code 61 : réservoir → té de la tuyauterie (16,
// 30.5 po) et adaptateur d'arrivée du compresseur → réservoir (15, 35.25
// po) ; adaptateur droit bride code 61 → JIC -24 (13) tenu par un collier
// 2 3/8 po (1 ; vis 21, rondelles 24 et 25) contre l'âme du caisson gauche.
// Purge du réservoir (orifice avant bas 1/2) : mamelon six-pans 1/2 (11),
// vanne à bille 1/2 (4), gicleur 1/4 (2), mamelon six-pans (14), mamelon
// (11), tenue par l'équerre d'accouplement 1/2 (6) ; orifice 3/4 :
// adaptateur NPT 3/4 → JIC -8 (12) ; sortie de la soupape de sûreté :
// silencieux (3) tenu par l'équerre d'accouplement 3/4 (7) ; équerres
// vissées sur le berceau (vis 3/8 × 1 3/4, 17, rondelles 23, écrous 26).
// Collecteur de la tuyauterie soutenu par un collier Ø 2 po (5) sur
// l'équerre (8) fixée à la poutre avant de P180 (vis 18 et 20, 19 du
// collier, rondelles 25, écrous 27).
// Repère : celui de la machine (X vers l'avant, Y vers le haut, Z à droite),
// placé à l'identité par P164 ; réservoir en TANK, tuyauterie en PIPE.
// Encombrement ≈ 0.75 (X) × 0.6 (Y) × 1.5 (Z) m.
// Simulation : tout suit le châssis avant (« front »).

import { body } from '../layout.js';
import { IN, u, L, M, hexPrism, frame, along, hhcs, hexNut, nordLock, washerD, jicAdapter, bx } from './_slide.js';
import { T190 } from './P190.js';
import { P192G } from './P192.js';

export const TANK = [2.66, 0.525 - T190.cradleY, 0];
export const PIPE = [3.07, 0.55, -1.0];

export default function P188(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, merged, group, at, tube } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (obj) => body('front', obj);
  const put = (obj, p, dir) => along(THREE, obj, dir, p);
  const add = (a, b) => a.map((v, i) => v + b[i]);

  // ================================================================ 9 — réservoir, 10 — tuyauterie
  P('9', F(at(api.sub('P190'), TANK)), [0, 0.3, 0]);
  P('10', F(at(api.sub('P192'), PIPE)), [0.35, 0, 0]);
  // 22 + 24 + 25 — vis de maintien du berceau sur les plats (z ±0.39)
  for (const z of [-0.39, 0.39]) {
    const p = [TANK[0], TANK[1] + T190.cradleY + 0.008, z];
    P('24', F(at(washerD(S, 0.5 * IN, 'zinc', { od: 1.06 * IN, t: 0.1 * IN }), p)), [0, 0.15, 0]);
    P('25', F(at(nordLock(S, THREE, 0.5), [p[0], p[1] + 0.1 * IN, p[2]])), [0, 0.2, 0]);
    P('22', F(at(hhcs(S, THREE, 0.5, 3.5), [p[0], p[1] + 0.1 * IN + 0.0028, p[2]])), [0, 0.26, 0]);
  }

  // ================================================================ 15, 16 — flexibles 2 po à brides code 61
  // Embout : tête de bride code 61 (Ø 3.06 × 0.5 po, gorge de joint), col, douille sertie six pans.
  const flangeEnd = () => group(merged([
    L(S, [[0, 0], [1.53, 0], [1.53, 0.35], [1.2, 0.35], [1.2, 0.6], [1.0, 0.6], [1.0, 1.0], [0, 1.0]], 'steel', 28),
    L(S, [[0, 1.0], [1.62, 1.0], [1.68, 1.15], [1.68, 2.9], [1.5, 3.3], [0, 3.3]], 'steel', 24),
  ], 'steel'));
  const flexHose = (a, na, b, nb, mid) => {
    const r = 1.45 * IN;
    const pa = add(a, na.map((v) => v * u(3.3))), pb = add(b, nb.map((v) => v * u(3.3)));
    const pts = [pa, add(pa, na.map((v) => v * 0.06)), ...mid, add(pb, nb.map((v) => v * 0.06)), pb];
    return group(
      tube(pts, r, 'hose', { seg: 64, ends: 'none', radial: 16, tension: 0.5 }),
      put(flangeEnd(), a, na), put(flangeEnd(), b, nb),
    );
  };
  const fA = add(TANK, [0, 0.2691, T190.flanges[0][0]]), fB = add(TANK, [0, 0.2691, T190.flanges[1][0]]);
  const tee = add(PIPE, P192G.tankBranch);
  P('16', F(flexHose(fA, [0, 1, 0], tee, [0, 1, 0], [[2.7, 1.2, -0.25], [2.9, 1.08, -0.42], [3.07, 0.9, -0.5]])), [0.1, 0.3, -0.1]);
  // 13 — adaptateur bride code 61 → JIC -24 contre l'âme du caisson gauche (nez dans le caisson)
  const A13 = [2.72, 0.93, -0.47 + 0.004];
  const ad13 = group(merged([
    L(S, [[0, 0], [1.53, 0], [1.53, 0.35], [1.2, 0.35], [1.2, 0.6], [1.0, 0.6], [1.0, 2.2], [0, 2.2]], 'steel', 28),
    hexPrism(S, THREE, 2.0, 0.7, 2.2, 0, 'steel'),
  ], 'steel'), at(jicAdapter(S, THREE, 24), [0, u(2.9), 0]));
  const fl13 = add(A13, [0, 0, u(4.5)]);
  P('13', F(put(ad13, fl13, [0, 0, -1])), [0, 0, 0.15]);
  P('15', F(flexHose(fB, [0, 1, 0], fl13, [0, 0, 1], [[2.68, 1.2, -0.02], [2.84, 1.18, -0.16], [2.86, 1.02, -0.27]])), [0.1, 0.35, 0.05]);
  // 1 — collier 2 3/8 po autour du corps de l'adaptateur, pattes contre l'âme ; 21 + 24 + 25
  const zc1 = A13[2] + u(1.6);
  P('1', F(group(merged([
    at(S.ring(u(1.35), u(1.2), u(1.0), 'zinc', { axis: 'z', seg: 28 }), [A13[0], A13[1], zc1]),
    ...[-1, 1].map((s) => bx(S, A13[0] + s * u(1.3), A13[0] + s * u(2.3), A13[1] - 0.012, A13[1] + 0.012, A13[2], A13[2] + 0.004, 'zinc')),
    ...[-1, 1].map((s) => bx(S, A13[0] + s * u(1.25), A13[0] + s * u(1.35), A13[1] - 0.012, A13[1] + 0.012, A13[2], zc1 + u(0.5), 'zinc')),
  ], 'zinc'))), [0.1, 0, 0.1]);
  for (const s of [-1, 1]) {
    const p = [A13[0] + s * u(1.85), A13[1], A13[2] + 0.004];
    P('24', F(put(washerD(S, 0.5 * IN, 'zinc', { od: 1.06 * IN, t: 0.1 * IN }), p, [0, 0, 1])), [0.1, 0, 0.15]);
    P('25', F(put(nordLock(S, THREE, 0.5), add(p, [0, 0, 0.1 * IN]), [0, 0, 1])), [0.1, 0, 0.2]);
    P('21', F(put(hhcs(S, THREE, 0.5, 2.5), add(p, [0, 0, 0.1 * IN + 0.0028]), [0, 0, 1])), [0.1, 0, 0.26]);
  }

  // ================================================================ purge du réservoir (orifice avant bas 1/2, z = −0.25)
  const n45 = [Math.SQRT1_2, -Math.SQRT1_2, 0];
  const pt = (z, k) => add(TANK, [T190.R * Math.SQRT1_2 + n45[0] * k, -T190.R * Math.SQRT1_2 + n45[1] * k, z]);
  const hexNip = (af, dash) => merged([hexPrism(S, THREE, af, 0.35, 0, 0, 'zinc'), L(S, [[0, -0.5], ...S.thread(dash, -0.5, 0, { r1: dash * 1.05, pitch: 0.07, maxTurns: 4 }), [0, 0]], 'zinc', 12), L(S, [[0, 0.35], ...S.thread(dash, 0.35, 0.85, { pitch: 0.07, maxTurns: 4, chamferBottom: false }), [0, 0.85]], 'zinc', 12)], 'zinc');
  let k = 0.012;
  P('11', F(put(hexNip(0.875, 0.42), pt(-0.25, k), n45)), add(n45.map((v) => v * 0.1), [0, 0, 0]));
  k += u(0.85);
  P('4', F(frame(THREE, S.ballValve(0.034, 'brass', { axis: 'x' }), pt(-0.25, k + 0.033), [1, -1, 0].map((v) => v * Math.SQRT1_2), [Math.SQRT1_2, Math.SQRT1_2, 0], [0, 0, 1])), n45.map((v) => v * 0.16));
  k += 0.066;
  P('2', F(put(merged([hexPrism(S, THREE, 0.875, 0.5, 0, 0.12, 'brass'), L(S, [[0, -0.4], ...S.thread(0.42, -0.4, 0, { pitch: 0.07, maxTurns: 3 }), [0, 0]], 'brass', 12)], 'brass'), pt(-0.25, k), n45)), n45.map((v) => v * 0.2));
  k += u(0.5);
  P('14', F(put(hexNip(0.875, 0.42), pt(-0.25, k), n45)), n45.map((v) => v * 0.24));
  k += u(0.85);
  P('11', F(put(hexNip(0.875, 0.42), pt(-0.25, k), n45)), n45.map((v) => v * 0.28));
  // 6 — équerre d'accouplement 1/2 : patte percée autour du dernier mamelon, pied sur le berceau
  const cradleTop = TANK[1] + T190.cradleY + 0.008;
  const pEnd = pt(-0.25, k + u(0.4));
  const brk = (pe, z) => group(merged([
    bx(S, TANK[0] + 0.16, TANK[0] + 0.18, cradleTop, pe[1] + 0.02, z - 0.03, z + 0.03, 'zinc'),
    bx(S, TANK[0] + 0.1, TANK[0] + 0.18, cradleTop, cradleTop + 0.005, z - 0.03, z + 0.03, 'zinc'),
  ], 'zinc'));
  P('6', F(brk(pEnd, -0.25)), [0.1, -0.1, 0]);
  // 12 — adaptateur NPT 3/4 → JIC -8 (orifice avant bas 3/4, z = +0.25)
  P('12', F(put(jicAdapter(S, THREE, 12, { npt: true, jicDash: 8 }), pt(0.25, 0.014), n45)), n45.map((v) => v * 0.12));
  // 3 — silencieux bronze fritté sur la sortie de la soupape, 7 — équerre 3/4
  const pS = add(TANK, [0.13, -0.085, T190.L / 2 + 0.06]);
  P('3', F(put(group(merged([hexPrism(S, THREE, 1.0, 0.3, 0, 0, 'brass'), L(S, [[0, -0.45], ...S.thread(0.42, -0.45, 0, { pitch: 0.07, maxTurns: 3 }), [0, 0]], 'brass', 12)], 'brass'), L(S, [[0, 0.3], [0.5, 0.3], [0.55, 0.4], [0.55, 1.5], [0.4, 1.7], [0, 1.75]], 'castAlu', 20)), pS, [0, -1, 0])), [0.1, -0.15, 0.1]);
  P('7', F(group(merged([
    bx(S, pS[0] - 0.03, pS[0] + 0.03, pS[1] - 0.005, pS[1] + 0.001, pS[2] - 0.03, pS[2] + 0.03, 'zinc'),
    bx(S, pS[0] + 0.026, pS[0] + 0.032, cradleTop, pS[1] + 0.001, pS[2] - 0.03, pS[2] + 0.03, 'zinc'),
    bx(S, pS[0] + 0.026, pS[0] + 0.08, cradleTop, cradleTop + 0.005, pS[2] - 0.03, pS[2] + 0.03, 'zinc'),
  ], 'zinc'))), [0.15, -0.1, 0.05]);
  // 17 + 23 + 26 — vis des équerres 6 et 7 dans le berceau (rondelle dessus et dessous)
  for (const [x, z] of [[TANK[0] + 0.13, -0.27], [TANK[0] + 0.13, -0.23], [pS[0] + 0.065, pS[2] - 0.015], [pS[0] + 0.065, pS[2] + 0.015]]) {
    const p = [x, cradleTop + 0.005, Math.max(Math.min(z, T190.L / 2 + 0.11), -0.43)];
    P('23', F(at(nordLock(S, THREE, 0.375), p)), [0, 0.15, 0]);
    P('17', F(at(hhcs(S, THREE, 0.375, 1.75), add(p, [0, 0.0026, 0]))), [0, 0.2, 0]);
    P('23', F(put(nordLock(S, THREE, 0.375), add(p, [0, -0.013, 0]), [0, -1, 0])), [0, -0.12, 0]);
    P('26', F(put(hexNut(S, THREE, 0.375), add(p, [0, -0.0156, 0]), [0, -1, 0])), [0, -0.16, 0]);
  }

  // ================================================================ 8 — équerre du collecteur, 5 — collier Ø 2 po
  const zC = PIPE[2] + P192G.manifold[0] + 0.2;
  const xF = M.nose + 0.8, yP = PIPE[1], rp = 1.1875 * IN;
  P('8', F(group(merged([
    bx(S, xF, xF + 0.008, 0.64, 0.78, zC - 0.04, zC + 0.04, 'zinc'), // âme sur la face de la poutre
    bx(S, xF - 0.15, xF + 0.008, 0.78, 0.788, zC - 0.04, zC + 0.04, 'zinc'), // aile sur le dessus de la poutre
    bx(S, xF, PIPE[0] + 0.05, yP + rp + 0.004, yP + rp + 0.012, zC - 0.03, zC + 0.03, 'zinc'), // console au-dessus du tube
    bx(S, xF, xF + 0.008, yP + rp + 0.004, 0.64, zC - 0.03, zC + 0.03, 'zinc'),
  ], 'zinc'))), [0.15, 0, 0]);
  for (const dz of [-0.022, 0.022]) {
    P('25', F(put(nordLock(S, THREE, 0.5), [xF + 0.008, 0.71, zC + dz], [1, 0, 0])), [0.2, 0, 0]);
    P('18', F(put(hhcs(S, THREE, 0.5, 1.25), [xF + 0.0108, 0.71, zC + dz], [1, 0, 0])), [0.26, 0, 0]);
    P('25', F(at(nordLock(S, THREE, 0.5), [xF - 0.1, 0.788, zC + dz])), [0.1, 0.15, 0]);
    P('20', F(at(hhcs(S, THREE, 0.5, 2.25), [xF - 0.1, 0.7908, zC + dz])), [0.1, 0.22, 0]);
    P('27', F(put(hexNut(S, THREE, 0.5), [xF - 0.1, 0.77, zC + dz], [0, -1, 0])), [0.1, -0.1, 0]);
  }
  // collier : feuillard en U sous le tube, oreilles boulonnées sous la console (19, écrous 27 dessus)
  const strap = [];
  for (let i = 0; i <= 18; i++) { const a = Math.PI + (i / 18) * Math.PI; strap.push([Math.cos(a) * (rp + 0.005), Math.sin(a) * (rp + 0.005)]); }
  for (let i = 18; i >= 0; i--) { const a = Math.PI + (i / 18) * Math.PI; strap.push([Math.cos(a) * (rp + 0.0005), Math.sin(a) * (rp + 0.0005)]); }
  const strapM = S.extrude(strap, 0.03, 'zinc');
  P('5', F(group(merged([
    at(strapM, [PIPE[0], yP, zC]),
    ...[-1, 1].map((s) => bx(S, PIPE[0] + s * (rp + 0.0005), PIPE[0] + s * (rp + 0.025), yP - 0.002, yP + rp + 0.004, zC - 0.015, zC + 0.015, 'zinc')),
  ], 'zinc'))), [0, -0.12, 0]);
  for (const s of [-1, 1]) {
    const x = PIPE[0] + s * (rp + 0.015);
    P('19', F(put(hhcs(S, THREE, 0.5, 1.75), [x, yP - 0.002, zC], [0, -1, 0])), [0, -0.2, 0]);
    P('25', F(at(nordLock(S, THREE, 0.5), [x, yP + rp + 0.012, zC])), [0, 0.1, 0]);
    P('27', F(at(hexNut(S, THREE, 0.5), [x, yP + rp + 0.0148, zC])), [0, 0.16, 0]);
  }
  void box; void cyl; void lathe;
  return { view: { dir: [1, 0.7, -0.9] } };
}

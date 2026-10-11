// P116 — Bras de tige du carrousel 6 pi CX036635 rév. 2 (pages 116 à 121) :
// « ASSY, PIPE ARM - 6FT CAROUSEL », 360 lb. Arbre vertical porté par deux
// bras pivotants qui tournent autour de l'axe du carrousel ; les bras de
// serrage (13 de P108) sont serrés sur l'arbre :
// - arbre du bras (11) : tube Ø 3 1/2 po peint, portées dans les bagues des
//   bras pivotants, collets d'arrêt soudés de part et d'autre des bras de
//   serrage et des moyeux, console du clapet de serrage doux, bout haut
//   cannelé pour la bague de réglage, tenon de bout bas ;
// - bras pivotant bas (10, P128) et haut (12, P130) ; arrêt de chaque bout
//   par rondelle à fente (7) sur le tenon, rondelle épaisse (3), vis 3/4 ×
//   1 1/2 (18) et rondelle Nord-Lock (20) : bout bas de l'arbre, bossages bas
//   et haut des couvercles du carrousel ;
// - bras de pivot (9, P126) calé sur l'arbre par la bague de réglage
//   cannelée (8) — flèches de l'arbre et de la bague alignées (détail D) —,
//   rondelle (4), vis (18) et Nord-Lock (20) en bout ;
// - vérin du bras Ø 3 × 6 1/8 po (2, P122) entre la chape haute du bras
//   pivotant haut et le bras de pivot : il fait tourner l'arbre et les bras
//   de serrage de l'axe de forage (vérin presque rentré) à l'alvéole de
//   transfert du carrousel (presque sorti) ;
// - deux vérins de pivotement Ø 3 × 4 1/2 po (5, P124) entre les chapes des
//   couvercles du carrousel (axes 6 à plaquette, vis 15 + rondelles 21) et
//   les chapes des bras pivotants : ils font pivoter tout le bras de tige
//   autour du carrousel (dessinés rentrés, bras au repos) ;
// - coudes ORB -04 → JIC -06 (14) sur les six orifices des vérins ;
// - clapet de serrage doux à clapet anti-retour (1) sur la console de
//   l'arbre, deux vis 3/8 × 2 3/4 (17), protégé par son capot en U (13,
//   quatre vis 3/8 × 1 (16)), rondelles Nord-Lock (19).
// Repère : repère de l'avance translaté sur l'axe de l'arbre du bras
// (FEED.clamp.x, FEED.clamp.z), mêmes axes, y = 0 au pied du mât ; P108 le
// place en (FEED.clamp.x, 0, FEED.clamp.z). Axe du carrousel en
// (+0.17, −0.43) dans ce repère. Encombrement ≈ 0.70 (X) × 2.49 (Y, de 0.17 à
// 2.66) × 0.74 (Z) m.
// Simulation : arbre, bras de pivot, bague de réglage, clapet et visserie de
// l'arbre dans le corps « clamp » (rotation autour de l'arbre, bras de serrage
// sur l'axe de forage à 0) ; vérin P122 articulé (ramDetailed 'arm', œil de
// fond sur le bras pivotant haut, fixe, œil de tige sur le bras de pivot) ;
// bras pivotants et vérins P124 fixes (pivotement autour du carrousel non
// simulé).
import { body, ramDetailed } from '../layout.js';
import { CYL094 } from '../../du311/parts/P094.js';
import { CYL122 } from './P122.js';
import { PIVOT126 } from './P126.js';
import {
  u, K, C, H, SWING, ARMCYL, armCylRod, SWLOCAL, swingToPlan, COVER_CLEVIS, ARM,
  frame, place, prism, circle, rrect, arc, L, bolt, nordLock, tabPin, boltStack, fitElbow,
} from './_carousel.js';

const SH = { r: u(1.75), collarR: u(2.25), collarT: u(0.5), splR: u(1.5) };
const CA = { half: u(2.0) }; // demi-hauteur des moyeux doubles des bras de serrage
const VALVE = { y0: 1.02, y1: 1.12 }; // clapet de serrage doux sur sa console

export default function P116(api) {
  const { THREE, S } = api;
  const { group, merged, at, weldRing, lathe } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const lp = (p) => [p[0] - K[0], p[1] - K[1]];
  const Cl = lp(C);
  const top = H.pivot + PIVOT126.hubH + u(1.5); // bout haut de l'arbre (dessus de la bague de réglage)

  // ================================================ 11 — arbre du bras
  const collars = [
    [H.armLow + H.hub + 0.002, 1], // au-dessus du moyeu du bras pivotant bas
    [H.armUp - 0.004, -1], // sous le moyeu du bras pivotant haut
    ...H.arms.flatMap((c) => [[c - CA.half - 0.001, -1], [c + CA.half + 0.001, 1]]),
  ];
  const sh = [
    lathe([[0, H.lowEnd], [SH.r - 0.0015, H.lowEnd], [SH.r, H.lowEnd + 0.0015], [SH.r, H.pivot + PIVOT126.hubH], [SH.splR, H.pivot + PIVOT126.hubH], [SH.splR, top - 0.002], [SH.splR - 0.002, top], [0, top]], 'grey', { seg: 32 }),
    // tenon de bout bas (rondelle à fente)
    S.box(u(1.5), u(0.25), u(0.75), 'steel', { pos: [0, H.lowEnd - u(0.125), 0] }),
    ...collars.map(([y, s]) => lathe([[SH.r, 0], [SH.collarR - 0.001, 0], [SH.collarR, 0.001], [SH.collarR, SH.collarT - 0.001], [SH.collarR - 0.001, SH.collarT], [SH.r, SH.collarT]], 'grey', { seg: 32, pos: [0, s > 0 ? y : y - SH.collarT, 0] })),
  ];
  // cannelures du bout haut (dans la bague de réglage)
  const spl = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, w = (Math.PI * 2) / 12;
    for (const [k, r] of [[0.05, SH.splR - u(0.12)], [0.15, SH.splR + u(0.08)], [0.55, SH.splR + u(0.08)], [0.65, SH.splR - u(0.12)]]) spl.push([r * Math.cos(a + k * w), r * Math.sin(a + k * w)]);
  }
  sh.push(prism(api, spl, H.pivot + PIVOT126.hubH + 0.001, top - 0.003, 'steel', [[0, 0, u(0.4)]]));
  // console du clapet (plat de 1/2 po soudé sur la face +X de l'arbre)
  const brk = prism(api, rrect(SH.r - 0.003, -0.066, SH.r + u(0.5), 0.066, 0.004, 2), VALVE.y0 - 0.025, VALVE.y1 + 0.035, 'grey');
  const welds = collars.map(([y, s]) => weldRing(SH.r + 0.002, 0.006, 'grey', { pos: [0, s > 0 ? y + SH.collarT + 0.002 : y - SH.collarT - 0.002, 0] }));
  welds.push(S.weld([[SH.r, VALVE.y0 - 0.025, 0.02], [SH.r, VALVE.y1 + 0.035, 0.02]], 0.007, 'grey'), S.weld([[SH.r, VALVE.y0 - 0.025, -0.02], [SH.r, VALVE.y1 + 0.035, -0.02]], 0.007, 'grey'));
  P('11', body('clamp', group(merged([...sh.filter((o) => o.isMesh || o.isGroup), brk], 'grey'), merged(welds, 'grey'))), [0, 0, 0.35]);

  // ================================================ 10, 12 — bras pivotants
  const armRot = -SWING.phi;
  P('10', at(api.sub('P128'), [Cl[0], H.armLow, Cl[1]], [0, armRot, 0]), [0.1, -0.2, 0.15]);
  P('12', at(api.sub('P130'), [Cl[0], H.armUp, Cl[1]], [0, armRot, 0]), [0.1, 0.25, 0.15]);

  // ================================================ 7, 3, 18, 20 — arrêts de bout
  const slotWasher = (y0) => prism(api, circle(0, 0, u(2.25), 32), y0, y0 + u(0.25), 'zinc', [rrect(-u(0.77), -u(0.4), u(0.77), u(0.4), 0.001, 1)]);
  const thick = (y0) => lathe([[u(0.41), y0], [u(2.25), y0], [u(2.25), y0 + u(0.375)], [u(0.41), y0 + u(0.375)], [u(0.41), y0]], 'zinc', { seg: 32 });
  const nlT = u(2 * Math.max(0.05, 0.75 * 0.11));
  // bout bas de l'arbre (tourne avec lui), bossage bas (sous le moyeu) et bossage haut (sur le moyeu)
  const stacks = [
    { x: 0, z: 0, y: H.lowEnd, s: -1, tag: true },
    { x: Cl[0], z: Cl[1], y: H.lowEnd, s: -1 },
    { x: Cl[0], z: Cl[1], y: H.armUp + H.hub, s: 1 },
  ];
  for (const st of stacks) {
    const t = (o) => (st.tag ? body('clamp', o) : o);
    const y7 = st.s > 0 ? st.y : st.y - u(0.25);
    const y3 = st.s > 0 ? st.y + u(0.25) : st.y - u(0.25) - u(0.375);
    const yh = st.s > 0 ? y3 + u(0.375) : y3;
    const e = (k) => [0, st.s * k, 0];
    P('7', t(at(slotWasher(y7), [st.x, 0, st.z])), e(0.08));
    P('3', t(at(thick(y3), [st.x, 0, st.z])), e(0.12));
    P('20', t(place(api, nordLock(api, 0.75), [st.x, yh, st.z], [0, st.s, 0])), e(0.16));
    P('18', t(place(api, bolt(api, 0.75, 1.5), [st.x, yh + st.s * nlT, st.z], [0, st.s, 0])), e(0.21));
  }

  // ================================================ 9 — bras de pivot, 8 — bague de réglage, 4 — rondelle de bout
  P('9', body('clamp', at(api.sub('P126'), [0, H.pivot, 0], [0, ARMCYL.psi0, 0])), [0, 0.2, 0]);
  const lug = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2, w = (Math.PI * 2) / 10;
    for (const [k, r] of [[0.0, u(1.95)], [0.12, u(2.25)], [0.48, u(2.25)], [0.6, u(1.95)]]) lug.push([r * Math.cos(a + k * w), r * Math.sin(a + k * w)]);
  }
  const yAdj = H.pivot + PIVOT126.hubH;
  // flèche de calage gravée sur le dessus
  const arrow = prism(api, [[u(1.55), -u(0.12)], [u(1.85), -u(0.12)], [u(1.85), -u(0.22)], [u(2.1), 0], [u(1.85), u(0.22)], [u(1.85), u(0.12)], [u(1.55), u(0.12)]], top - 0.0006, top + 0.0002, 'darkSteel');
  P('8', body('clamp', group(prism(api, lug, yAdj, top, 'steel', [circle(0, 0, SH.splR + u(0.09), 24)]), arrow)), [0, 0.3, 0]);
  P('4', body('clamp', lathe([[u(0.41), top], [u(2.25), top], [u(2.25), top + u(0.375)], [u(0.41), top + u(0.375)], [u(0.41), top]], 'zinc', { seg: 32 })), [0, 0.36, 0]);
  P('20', body('clamp', place(api, nordLock(api, 0.75), [0, top + u(0.375), 0])), [0, 0.4, 0]);
  P('18', body('clamp', place(api, bolt(api, 0.75, 1.5), [0, top + u(0.375) + nlT, 0])), [0, 0.45, 0]);

  // ================================================ 2 — vérin du bras (P122), articulé
  const Rr = lp(ARMCYL.rear), Q0 = lp(armCylRod(0));
  const L0 = Math.hypot(Q0[0] - Rr[0], Q0[1] - Rr[1]);
  const Yc = [(Q0[0] - Rr[0]) / L0, 0, (Q0[1] - Rr[1]) / L0];
  const Xc = [-Yc[2], 0, Yc[0]]; // Y × (0, 1, 0) : orifices (-X) vers l'extérieur du bras
  const cyl = frame(api, api.sub('P122', { ext: L0 - ARMCYL.retracted }), Xc, Yc, [Rr[0], H.armCyl, Rr[1]]);
  P('2', ramDetailed('arm', 'ext', 'clamp', cyl, { rear: [0, 0, 0], rod: [0, L0, 0], stroke: ARMCYL.stroke }), [0.15, 0.3, 0.1]);

  // 14 — coudes sur les orifices des vérins (nez vers le fond du vérin)
  const elbows = (pos, X, Y, portX, portY, e) => {
    for (const py of portY) {
      const p = [pos[0] + X[0] * portX + Y[0] * py, pos[1] + X[1] * portX + Y[1] * py, pos[2] + X[2] * portX + Y[2] * py];
      P('14', frame(api, fitElbow(api, 4, 6), Y.map((v) => -v), X.map((v) => -v), p), e);
    }
  };
  elbows([Rr[0], H.armCyl, Rr[1]], Xc, Yc, CYL122.portX, CYL122.portY, [0.2, 0.35, 0.1]);

  // ================================================ 5 — vérins de pivotement (P124), 6 — axes de fond
  const Fp = lp(COVER_CLEVIS.plan), Gp = lp(swingToPlan(SWLOCAL.swingRod));
  const Ls = Math.hypot(Gp[0] - Fp[0], Gp[1] - Fp[1]);
  const Ys = [(Gp[0] - Fp[0]) / Ls, 0, (Gp[1] - Fp[1]) / Ls];
  const Xs = [Ys[2], 0, -Ys[0]]; // Y × (0, -1, 0) : orifices vers l'extérieur (côté mât)
  const { gap, cheek } = COVER_CLEVIS;
  for (const [y, up] of [[H.swingCylUp, 1], [H.swingCylLow, -1]]) {
    const pos = [Fp[0], y, Fp[1]];
    P('5', frame(api, api.sub('P124'), Xs, Ys, pos), [-0.15, up * 0.2, 0.05]);
    elbows(pos, Xs, Ys, CYL094.portX, CYL094.portY, [-0.2, up * 0.25, 0.05]);
    // axe à plaquette : par-dessus en haut, par-dessous en bas
    const yTab = y + up * (gap / 2 + cheek);
    P('6', at(group(tabPin(api)), [Fp[0], yTab, Fp[1]], up > 0 ? null : [Math.PI, 0, 0]), [0, up * 0.15, 0]);
    const s = boltStack(api, [Fp[0] + u(1.1), yTab + up * u(0.25), Fp[1]], [0, up, 0], 0.375, 0.75, { washer: 'nord' });
    P('21', s.washer, [0, up * 0.18, 0]);
    P('15', s.bolt, [0, up * 0.21, 0]);
  }

  // ================================================ 1 — clapet de serrage doux, 13 — capot
  const vx0 = SH.r + u(0.5), vx1 = vx0 + u(2.0), vy = (VALVE.y0 + VALVE.y1) / 2;
  const vb = S.box(vx1 - vx0, VALVE.y1 - VALVE.y0, u(2.5), 'castAlu', { r: 0.0015, pos: [(vx0 + vx1) / 2, vy, 0] });
  const cart = [
    L(api, [[0, 0], [0.5, 0], [0.5, 0.15], [0.44, 0.2], [0.44, 0.55], [0.3, 0.6], [0.3, 1.05], [0.22, 1.1], [0, 1.1]], 'steel', 16),
    L(api, [[0, 0], [0.4, 0], [0.4, 0.5], [0.32, 0.55], [0, 0.55]], 'steel', 16),
  ];
  cart[0].position.set((vx0 + vx1) / 2, VALVE.y1, -u(0.5));
  cart[1].position.set((vx0 + vx1) / 2, VALVE.y1, u(0.6));
  const knob = S.cyl(u(0.2), u(0.35), 'blackOxide', { seg: 10, pos: [(vx0 + vx1) / 2, VALVE.y1 + u(1.25), -u(0.5)] });
  const ports = [];
  for (const [y, z] of [[vy - 0.02, -0.018], [vy - 0.02, 0.018], [vy + 0.02, -0.018], [vy + 0.02, 0.018]]) ports.push(S.cyl(u(0.32), 0.002, 'steel', { axis: 'x', seg: 14, pos: [vx1 + 0.001, y, z] }));
  P('1', body('clamp', group(vb, merged([...cart, ...ports], 'steel'), knob)), [0.15, 0, 0]);
  for (const y of [vy - 0.025, vy + 0.025]) {
    const s = boltStack(api, [vx1, y, 0], [1, 0, 0], 0.375, 2.75, { washer: 'nord' });
    P('19', body('clamp', s.washer), [0.2, 0, 0]);
    P('17', body('clamp', s.bolt), [0.25, 0, 0]);
  }
  // capot en U de 1/8 po : face avant, deux flancs, ailes boulonnées sur la console
  const gx0 = SH.r + u(0.5), gx1 = vx1 + u(0.75), gz = 0.05, gt = u(0.125);
  const gy0 = VALVE.y0 - 0.02, gy1 = VALVE.y1 + 0.032;
  const guard = [
    S.box(gt, gy1 - gy0, 2 * gz + gt, 'grey', { pos: [gx1, (gy0 + gy1) / 2, 0] }),
    ...[-1, 1].map((s) => S.box(gx1 - gx0, gy1 - gy0, gt, 'grey', { pos: [(gx0 + gx1) / 2, (gy0 + gy1) / 2, s * gz] })),
    ...[-1, 1].map((s) => S.box(gt, gy1 - gy0, 0.016, 'grey', { pos: [gx0 + gt / 2, (gy0 + gy1) / 2, s * (gz + 0.008)] })),
  ];
  P('13', body('clamp', merged(guard, 'grey')), [0.3, 0, 0]);
  for (const s of [-1, 1]) for (const y of [gy0 + 0.012, gy1 - 0.012]) {
    const st = boltStack(api, [gx0 + gt, y, s * (gz + 0.009)], [1, 0, 0], 0.375, 1.0, { washer: 'nord' });
    P('19', body('clamp', st.washer), [0.34, 0, s * 0.02]);
    P('16', body('clamp', st.bolt), [0.38, 0, s * 0.02]);
  }

  void THREE; void arc; void ARM;
  return { view: { dir: [1, 0.5, 0.9] } };
}

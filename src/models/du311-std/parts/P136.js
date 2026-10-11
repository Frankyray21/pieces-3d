// P136 — Cadre du carrousel CX037878 rév. 0 (page 136) : « CAROUSEL FRAME
// ASSY - Ø4.0" X 6' X17 PIPE ». Deux logements mécano-soudés reliés par trois
// montants, qui reçoivent les bouts des 17 tiges Ø 3 1/2 po :
// - cadre bas (9) : plaque de fond de 1/2 po (pose de la rampe P076 à
//   y = FEED.car.y0), paroi circulaire de 3/8 po ouverte au portillon (côté
//   mât, alvéole de transfert), pont arrière au niveau du haut de la paroi,
//   tôles de fermeture, bride arrière de 3/4 po à quatre paires de lumières
//   (fixation sur le cadre de montage P098), fourreau de la bague basse de
//   l'axe central, pattes de charnière du portillon, encoche du vérin stinger ;
// - cadre haut (11) : même logement retourné sous une plaque de dessus de
//   1/2 po, fourreau de la bague haute, logement du roulement de la manivelle,
//   carter d'indexage en « goutte » (paroi de 3/4 po taraudée pour le
//   couvercle), plat d'appui des demi-colliers du stinger ;
// - couvercle haut (8) sur le carter : bossage Ø 3 1/2 po (pivot du bras
//   pivotant haut, tenon de la rondelle à fente), chape de l'œil de fond du
//   vérin de pivotement haut, trous du moteur et de la plaque d'inspection ;
//   15 vis 1/2 × 1 1/4 (13) et rondelles (19) ;
// - couvercle bas (10) sous la plaque de fond : bossage bas et chape du vérin
//   de pivotement bas, 15 vis (13) et rondelles (19), goupille de centrage
//   Ø 3/8 × 3/4 (1) ;
// - montants (2, 4 : extérieurs ; 3 : intérieur) : tubes 3 × 3 × 1/4 po à
//   plaques d'about, deux vis 3/4 × 3 1/2 (16) par bout ;
// - deux portillons (12) à charnière sur la paroi (deux vis 3/4 × 6 (18),
//   écrous (23) chacun) ; poteau du collier de boyau (7) fixé par quatre vis
//   3/4 × 4 (17) ; deux demi-colliers du stinger (5) : quatre vis 5/8 × 3 (14)
//   et rondelles (20) entre eux, quatre vis 3/4 × 2 (15) dans le plat d'appui ;
//   rondelles (21) des vis 3/4 po ;
// - support du distributeur (6) sur la plaque de dessus, quatre vis 1/2 ×
//   1 1/4 (13) et rondelles fendues (22).
// Repère : axe du carrousel, y = 0 au pied du mât (repère de l'avance
// translaté en (FEED.car.x, FEED.car.z), mêmes axes) ; P108 le place à
// l'identité. Portillon vers -X (angle de l'alvéole de transfert), bride
// arrière à z = -0.44 (face d'appui sur P098 à z = -0.32 dans le repère de
// l'avance). Encombrement ≈ 0.86 (X) × 2.33 (Y, de 0.19 à 2.52) × 0.75 (Z) m.
// Cotes : vis et quantités de la liste ; Ø des logements tiré des alvéoles
// Ø 4 po au rayon FEED.car.rp ; hauteurs d'après l'élévation de P108
// (≈ 0.8 px/mm) et les tiges de 6 pi rangées (bouts à 0.34 et 2.23 m).
import {
  u, DEG, H, RING, DRIVE, INSPECT, VBM, STINGER, BACK, COVER_CLEVIS, SWING, C,
  arc, circle, rrect, prism, hull2, frameOutline, place, frame, bolt, washer, nut, lockWasher, boltStack, L,
} from './_carousel.js';

export default function P136(api) {
  const { THREE, S } = api;
  const { group, merged, at, weld, weldRing, lathe } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { Ri, Ro, gate: G, gateHalf: GH } = RING;
  const OL = frameOutline();
  const plan = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
  const band = (ri, ro, a0, a1, y0, y1, mat = 'lightGrey', n = 64) => prism(api, [...arc(0, 0, ro, a0, a1, n), ...arc(0, 0, ri, a1, a0, n)], y0, y1, mat);
  const ringA0 = G + GH, ringA1 = G - GH + 2 * Math.PI; // paroi : du bord arrière du portillon au bord avant
  const cvl = [COVER_CLEVIS.plan[0] - C[0], COVER_CLEVIS.plan[1] - C[1]];
  const swingPhi = SWING.phi;

  // Pont arrière (entre la paroi et le contour arrière) et tôles de fermeture
  const backPts = OL.slice(OL.findIndex((p) => p[0] === -0.345 && p[1] === -0.2));
  const deckOutline = [plan(Ro, 200 * DEG), ...backPts, plan(Ro, -8 * DEG), ...arc(0, 0, Ro, -8 * DEG, -160 * DEG, 24).slice(1)];
  const sideSegs = [[plan(RING.plate, 200 * DEG), [-0.345, -0.2]], [[-0.345, -0.2], [-0.345, -0.33]], [[-0.345, -0.33], [-0.27, -0.421]], [[0.45, -0.2], [0.43, -0.06]], [[0.43, -0.06], plan(RING.plate, -8 * DEG)]];
  const sidePlate = (a, b, y0, y1) => {
    const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz), t = u(0.375);
    const n = [-dz / l, dx / l]; // vers l'intérieur
    return at(S.box(l, y1 - y0, t, 'lightGrey', { r: 0.001 }), [(a[0] + b[0]) / 2 + n[0] * t / 2, (y0 + y1) / 2, (a[1] + b[1]) / 2 + n[1] * t / 2], [0, -Math.atan2(dz, dx), 0]);
  };
  // Notch du stinger : tôle cintrée
  const sa = Math.atan2(-STINGER.p[1], -STINGER.p[0]);
  const notchBand = (y0, y1) => prism(api, [...arc(STINGER.p[0], STINGER.p[1], STINGER.notch + u(0.375), sa - Math.PI / 2, sa + Math.PI / 2, 12), ...arc(STINGER.p[0], STINGER.p[1], STINGER.notch, sa + Math.PI / 2, sa - Math.PI / 2, 12)], y0, y1, 'lightGrey');
  // Bride arrière (plan x-y, épaisseur selon z) à quatre paires de lumières verticales
  const flange = (y0, y1) => {
    const ym = (y0 + y1) / 2, slots = [];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const k of [0, 1]) {
      const x = sx * 0.21, y = ym + sy * (0.04 + k * 0.042);
      slots.push(rrect(x - u(0.42), y - u(0.6), x + u(0.42), y + u(0.6), u(0.41), 3));
    }
    const m = prism(api, [[-BACK.x, y0], [BACK.x, y0], [BACK.x, y1], [-BACK.x, y1]], 0, BACK.z1 - BACK.z0, 'lightGrey', slots.map((s) => s.map(([x, y]) => [x, y])));
    const g = group(m);
    g.rotation.x = -Math.PI / 2;
    g.position.z = BACK.z1;
    return g;
  };
  // Pattes de charnière du portillon (deux jeux, sur la paroi près du bord arrière)
  const hingeAxis = plan(Ro + 0.02, ringA0 + 4 * DEG);
  const hingeSets = (yA) => [yA + 0.05, yA + 0.15];
  const lugs = (yA) => {
    const out = [];
    const ra = plan(Ro - 0.004, ringA0 + 1 * DEG), rb = plan(Ro - 0.004, ringA0 + 9 * DEG);
    const ol = [ra, rb, ...arc(hingeAxis[0], hingeAxis[1], u(0.9), ringA0 + 9 * DEG - Math.PI / 2, ringA0 + 9 * DEG - Math.PI * 1.5, 10)];
    for (const yc of hingeSets(yA)) {
      out.push(prism(api, ol, yc - 0.033 - u(0.5), yc - 0.033, 'lightGrey', [[hingeAxis[0], hingeAxis[1], u(0.41)]]));
      out.push(prism(api, ol, yc + 0.033, yc + 0.033 + u(0.5), 'lightGrey', [[hingeAxis[0], hingeAxis[1], u(0.41)]]));
    }
    return out;
  };
  const tube = (ro, ri, y0, y1, mat = 'lightGrey', p = [0, 0]) => lathe([[ri, y0], [ro, y0], [ro, y1], [ri, y1], [ri, y0]], mat, { seg: 32, pos: [p[0], 0, p[1]] });

  // ================================================ 9 — cadre bas
  const yb0 = H.baseTop - u(0.5), yb1 = H.baseTop, yr1 = H.lowRingTop, yd0 = yr1 - u(0.5);
  P('9', group(merged([
    prism(api, OL, yb0, yb1, 'lightGrey', [[0, 0, u(1.5)]]),
    band(Ri, Ro, ringA0, ringA1, yb1, yr1),
    prism(api, deckOutline, yd0, yr1, 'lightGrey'),
    ...sideSegs.map(([a, b]) => sidePlate(a, b, yb1, yd0)),
    notchBand(yb1, yd0),
    flange(yb0, yr1),
    tube(u(2.25), u(1.5), yb1, yb1 + u(1.5)),
    ...lugs(yb1),
  ], 'lightGrey'), merged([
    weldRing(Ro + 0.003, 0.007, 'lightGrey', { pos: [0, yb1 + 0.003, 0] }),
    weldRing(u(2.25) + 0.002, 0.006, 'lightGrey', { pos: [0, yb1 + 0.003, 0] }),
    weld([[-BACK.x, yb1 + 0.003, BACK.z1 + 0.003], [BACK.x, yb1 + 0.003, BACK.z1 + 0.003]], 0.007, 'lightGrey'),
  ], 'lightGrey')), [0, -0.3, 0]);

  // ================================================ 11 — cadre haut
  const yt0 = H.topBot, yt1 = H.topTop, yu0 = H.upRingBot, yu1 = yu0 + u(0.5);
  const D = DRIVE.D;
  const chOuter = hull2([0, 0], DRIVE.R1, D, DRIVE.R2, 48);
  const chInner = hull2([0, 0], DRIVE.R1 - DRIVE.wall, D, DRIVE.R2 - DRIVE.wall, 48);
  // plat d'appui des demi-colliers du stinger (normale vers l'axe)
  const dSC = [Math.cos(sa), Math.sin(sa)], pSC = [-dSC[1], dSC[0]];
  const kB = 0.082 + 0.0095; // milieu du plat (3/4 po), à 0.082 m de l'axe du stinger
  const bp = [STINGER.p[0] + dSC[0] * kB, STINGER.p[1] + dSC[1] * kB];
  const stPlate = at(S.box(u(0.75), yt0 - yu1, 0.18, 'lightGrey', { r: 0.001 }), [bp[0], (yu1 + yt0) / 2, bp[1]], [0, -sa, 0]);
  P('11', group(merged([
    prism(api, OL, yt0, yt1, 'lightGrey', [[0, 0, u(1.5)], [D[0], D[1], 0.031]]),
    band(Ri, Ro, ringA0, ringA1, yu0, yt0),
    prism(api, deckOutline, yu0, yu1, 'lightGrey'),
    ...sideSegs.map(([a, b]) => sidePlate(a, b, yu1, yt0)),
    notchBand(yu1, yt0),
    flange(yu0, yt1),
    tube(u(2.25), u(1.5), yt0 - u(1.5), yt0),
    tube(0.04, 0.031, yt0 - 0.017, yt0, 'lightGrey', D),
    lathe([[0, yt0 - 0.022], [0.04, yt0 - 0.022], [0.04, yt0 - 0.017], [0, yt0 - 0.017]], 'lightGrey', { seg: 24, pos: [D[0], 0, D[1]] }),
    prism(api, chOuter, yt1, H.chamberTop, 'lightGrey', [chInner]),
    stPlate,
    ...lugs(yu0),
  ], 'lightGrey'), merged([
    weldRing(Ro + 0.003, 0.007, 'lightGrey', { pos: [0, yt0 - 0.003, 0] }),
    weld([...chOuter, chOuter[0]].map(([x, z]) => [x * 1.012, yt1 + 0.003, z * 1.012 + (z === 0 ? 0 : 0)]), 0.006, 'lightGrey'),
    weld([[-BACK.x, yt0 - 0.003, BACK.z1 + 0.003], [BACK.x, yt0 - 0.003, BACK.z1 + 0.003]], 0.007, 'lightGrey'),
  ], 'lightGrey')), [0, 0.3, 0]);

  // ================================================ couvercles : chapes, bossages
  const cc = COVER_CLEVIS;
  // chape : joues en langue autour de l'axe, âme à l'arrière (côté opposé au vérin)
  const back = [Math.cos(swingPhi + Math.PI) * 0.6 + Math.cos(Math.atan2(cvl[1], cvl[0])) * 0.4, 0];
  const bd = Math.atan2(cvl[1], cvl[0]) - 0.35; // direction de l'âme (vers l'extérieur, côté portillon)
  const tongue = [...arc(cvl[0], cvl[1], cc.R, bd + Math.PI / 2, bd + 1.5 * Math.PI, 12), [cvl[0] + Math.cos(bd) * u(2.2) + Math.cos(bd + Math.PI / 2) * cc.R, cvl[1] + Math.sin(bd) * u(2.2) + Math.sin(bd + Math.PI / 2) * cc.R], [cvl[0] + Math.cos(bd) * u(2.2) - Math.cos(bd + Math.PI / 2) * cc.R, cvl[1] + Math.sin(bd) * u(2.2) - Math.sin(bd + Math.PI / 2) * cc.R]].reverse();
  const webOl = rrect(-u(0.4), -cc.R, u(0.4), cc.R, 0.002, 2).map(([x, z]) => {
    const c = Math.cos(bd), s = Math.sin(bd), x1 = x + u(1.9);
    return [cvl[0] + x1 * c - z * s, cvl[1] + x1 * s + z * c];
  });
  const clevis = (yPin, up) => {
    const h = [[cvl[0], cvl[1], u(0.52)]];
    const yc0 = yPin - cc.gap / 2, yc1 = yPin + cc.gap / 2;
    const base = up > 0 ? H.upCoverTop : H.lowCoverBot;
    return up > 0
      ? [prism(api, tongue, base, yc0, 'grey', h), prism(api, tongue, yc1, yc1 + cc.cheek, 'grey', h), prism(api, webOl, base, yc1 + cc.cheek, 'grey')]
      : [prism(api, tongue, yc1, base, 'grey', h), prism(api, tongue, yc0 - cc.cheek, yc0, 'grey', h), prism(api, webOl, yc0 - cc.cheek, base, 'grey')];
  };
  void back;
  const tang = (y0) => S.box(u(1.5), u(0.25), u(0.75), 'steel', { pos: [0, y0 + u(0.125), 0] });
  const boltHoles = (pts) => pts.map(([x, z]) => [x, z, u(0.28)]);

  // 8 — couvercle haut
  const cvOl = hull2([0, 0], DRIVE.R1 + 0.002, D, DRIVE.R2 + 0.002, 48);
  // vis du couvercle : sur le milieu de la paroi, hors du passage du bras pivotant et du vérin P124
  const mid = hull2([0, 0], DRIVE.R1 - DRIVE.wall / 2, D, DRIVE.R2 - DRIVE.wall / 2, 96);
  const per = [0];
  for (let i = 1; i <= mid.length; i++) per.push(per[i - 1] + Math.hypot(mid[i % mid.length][0] - mid[i - 1][0], mid[i % mid.length][1] - mid[i - 1][1]));
  const total = per[mid.length];
  const blocked = (p) => { const a = (Math.atan2(p[1], p[0]) / DEG + 360) % 360; return (a > 98 && a < 218); };
  const cand = [];
  for (let i = 0; i < 200; i++) {
    const s = (i / 200) * total;
    let k = per.findIndex((v) => v > s) - 1;
    if (k < 0) k = 0;
    const f = (s - per[k]) / (per[k + 1] - per[k]);
    const a = mid[k], b = mid[(k + 1) % mid.length];
    const p = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    if (!blocked(p)) cand.push(p);
  }
  const upBolts = Array.from({ length: 15 }, (_, i) => cand[Math.round(((i + 0.5) / 15) * (cand.length - 1))]);
  const yc = H.upCoverTop;
  P('8', group(merged([
    prism(api, cvOl, H.chamberTop, yc, 'grey', [[D[0], D[1], u(1.0)], [INSPECT.p[0], INSPECT.p[1], INSPECT.r], ...boltHoles(upBolts)]),
    lathe([[0, yc - 0.001], [u(1.75), yc - 0.001], [u(1.75), H.armUp + H.hub - 0.002], [u(1.75) - 0.002, H.armUp + H.hub], [0, H.armUp + H.hub]], 'grey', { seg: 32 }),
    ...clevis(H.swingCylUp, 1),
  ], 'grey'), tang(H.armUp + H.hub), weldRing(u(1.75) + 0.002, 0.006, 'grey', { pos: [0, yc + 0.002, 0] })), [0, 0.55, 0]);
  for (const [x, z] of upBolts) {
    const s = boltStack(api, [x, yc, z], [0, 1, 0], 0.5, 1.25, { washer: 'flat' });
    P('19', s.washer, [0, 0.62, 0]);
    P('13', s.bolt, [0, 0.68, 0]);
  }

  // 10 — couvercle bas (rond, sous la plaque de fond)
  const lowBolts = [];
  for (let i = 0; i < 40 && lowBolts.length < 15; i++) {
    const a = (i / 40) * Math.PI * 2;
    const p = plan(0.155, a);
    const deg = (a / DEG + 360) % 360;
    if (!(deg > 98 && deg < 218)) lowBolts.push(p);
  }
  const ylc0 = H.lowCoverBot, ylc1 = H.lowCoverTop;
  P('10', group(merged([
    prism(api, circle(0, 0, 0.18, 48), ylc0, ylc1, 'grey', boltHoles(lowBolts)),
    lathe([[0, H.lowEnd], [u(1.75) - 0.002, H.lowEnd], [u(1.75), H.lowEnd + 0.002], [u(1.75), ylc0 + 0.001], [0, ylc0 + 0.001]], 'grey', { seg: 32 }),
    ...clevis(H.swingCylLow, -1),
  ], 'grey'), tang(H.lowEnd - u(0.25)), weldRing(u(1.75) + 0.002, 0.006, 'grey', { pos: [0, ylc0 - 0.002, 0] })), [0, -0.55, 0]);
  for (const [x, z] of lowBolts) {
    const s = boltStack(api, [x, ylc0, z], [0, -1, 0], 0.5, 1.25, { washer: 'flat' });
    P('19', s.washer, [0, -0.62, 0]);
    P('13', s.bolt, [0, -0.68, 0]);
  }
  // 1 — goupille de centrage (dépasse sous le couvercle bas)
  const dp = plan(0.135, 270 * DEG);
  P('1', L(api, [[0, -0.5], [0.17, -0.5], [0.1875, -0.48], [0.1875, 0.23], [0.17, 0.25], [0, 0.25]], 'steel', 14, { pos: [dp[0], ylc0, dp[1]] }), [0, -0.66, 0]);

  // ================================================ 2, 3, 4 — montants, 16 — vis d'about
  const postY0 = yr1, postY1 = yu0;
  const pw = RING.posts.w;
  for (const [ref, a] of Object.entries(RING.posts.a)) {
    const p = plan(RING.posts.r, a);
    const len = postY1 - postY0;
    const sq = prism(api, rrect(-pw / 2, -pw / 2, pw / 2, pw / 2, u(0.375), 3), postY0 + u(0.75), postY1 - u(0.75), 'lightGrey', [rrect(-pw / 2 + u(0.25), -pw / 2 + u(0.25), pw / 2 - u(0.25), pw / 2 - u(0.25), u(0.15), 2)]);
    const ends = [postY0, postY1 - u(0.75)].map((y) => prism(api, rrect(-pw / 2 - u(0.25), -pw / 2 - u(0.25), pw / 2 + u(0.25), pw / 2 + u(0.25), 0.002, 2), y, y + u(0.75), 'lightGrey'));
    const wl = [postY0 + u(0.75), postY1 - u(0.75)].map((y) => weld([[-pw / 2, y, -pw / 2], [pw / 2, y, -pw / 2], [pw / 2, y, pw / 2], [-pw / 2, y, pw / 2]], 0.006, 'lightGrey', { closed: true }));
    const g = group(merged([sq, ...ends], 'lightGrey'), merged(wl, 'lightGrey'));
    P(ref, at(g, [p[0], 0, p[1]], [0, -a, 0]), [Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35]);
    void len;
    // deux vis par bout, en diagonale, têtes dans les logements (sous le pont bas, sur le pont haut)
    for (const s of [-1, 1]) {
      const off = [Math.cos(-a) * s * u(0.9) - Math.sin(-a) * s * u(0.9), -(Math.sin(-a) * s * u(0.9) + Math.cos(-a) * s * u(0.9))];
      const q = [p[0] + off[0], p[1] + off[1]];
      const lo = boltStack(api, [q[0], yd0, q[1]], [0, -1, 0], 0.75, 3.5, { washer: 'flat' });
      P('21', lo.washer, [0, -0.08, 0]); P('16', lo.bolt, [0, -0.14, 0]);
      const hi = boltStack(api, [q[0], yu1, q[1]], [0, 1, 0], 0.75, 3.5, { washer: 'flat' });
      P('21', hi.washer, [0, 0.08, 0]); P('16', hi.bolt, [0, 0.14, 0]);
    }
  }

  // ================================================ 12 — portillons, 18 / 23 / 21 — axes de charnière
  const front = plan((Ri + Ro) / 2, ringA1);
  for (const [yA, yB, ex] of [[yb1, yr1, -0.25], [yu0, yt0, 0.25]]) {
    const dx = front[0] - hingeAxis[0], dz = front[1] - hingeAxis[1], l = Math.hypot(dx, dz);
    const leaf = at(S.box(l - 0.012, yB - yA - 0.03, u(0.375), 'grey', { r: 0.002 }), [hingeAxis[0] + dx / 2 + 0.006 * dx / l, (yA + yB) / 2, hingeAxis[1] + dz / 2 + 0.006 * dz / l], [0, -Math.atan2(dz, dx), 0]);
    const knuckles = hingeSets(yA).map((yc) => tube(u(0.85), u(0.41), yc - 0.032, yc + 0.032, 'grey', hingeAxis));
    // ressort de rappel enroulé sur le bas de l'axe, butée en bout
    const spring = S.spring(u(0.62), u(0.09), 0.025, 5, 'black', { pos: [hingeAxis[0], hingeSets(yA)[0] - 0.033 - u(0.5) - 0.016, hingeAxis[1]] });
    P('12', group(merged([leaf, ...knuckles], 'grey'), spring), [-0.15, ex * 0.3, 0]);
    for (const yc of hingeSets(yA)) {
      const top = yc + 0.033 + u(0.5), bot = yc - 0.033 - u(0.5);
      const s = boltStack(api, [hingeAxis[0], top, hingeAxis[1]], [0, 1, 0], 0.75, 6.0, { washer: 'flat', grip: (top - bot) / 0.0254, nutSide: true });
      P('21', s.washer, [-0.12, 0.08, 0]); P('18', s.bolt, [-0.12, 0.16, 0]);
      P('21', s.washer2, [-0.12, -0.08, 0]); P('23', s.nut, [-0.12, -0.14, 0]);
    }
  }

  // ================================================ 7 — poteau du collier de boyau, 17 — vis
  const hp = plan(0.43, 250 * DEG);
  P('7', group(merged([
    S.box(u(2.5), postY1 - postY0 - 2 * u(0.5), u(0.5), 'lightGrey', { pos: [hp[0], (postY0 + postY1) / 2, hp[1]] }),
    ...[postY0, postY1 - u(0.5)].map((y) => S.box(u(4.5), u(0.5), u(2.0), 'lightGrey', { pos: [hp[0], y + u(0.25), hp[1] + u(0.75)] })),
  ], 'lightGrey')), [0, 0, -0.25]);
  for (const sx of [-1, 1]) {
    const lo = boltStack(api, [hp[0] + sx * u(1.5), yd0, hp[1] + u(0.9)], [0, -1, 0], 0.75, 4.0, { washer: 'flat' });
    P('21', lo.washer, [0, -0.08, -0.25]); P('17', lo.bolt, [0, -0.14, -0.25]);
    const hi = boltStack(api, [hp[0] + sx * u(1.5), yu1, hp[1] + u(0.9)], [0, 1, 0], 0.75, 4.0, { washer: 'flat' });
    P('21', hi.washer, [0, 0.08, -0.25]); P('17', hi.bolt, [0, 0.14, -0.25]);
  }

  // ================================================ 5 — demi-colliers du stinger, 14 / 20, 15 / 21
  const [cy0, cy1] = STINGER.clamp;
  const Rb = STINGER.r, Rt = Rb + u(1.0);
  // demi A (côté axe) : dos plat contre le plat d'appui ; demi B (extérieur) à oreilles
  const W = Rt + u(0.6), th = Math.acos(-u(1.0) / Rt);
  const halfA = [[0, -W], [0.082, -W], [0.082, W], [0, W], ...arc(0, 0, Rb, Math.PI / 2, -Math.PI / 2, 14)];
  const halfB = [[0, W], [-u(1.0), W], ...arc(0, 0, Rt, th, 2 * Math.PI - th, 12), [-u(1.0), -W], [0, -W], ...arc(0, 0, Rb, -Math.PI / 2, -Math.PI * 1.5, 14)];
  const clampFrame = (obj) => {
    const g = group(obj);
    g.position.set(STINGER.p[0], 0, STINGER.p[1]);
    g.rotation.y = -sa;
    return g;
  };
  P('5', clampFrame(prism(api, halfA, cy0, cy1, 'grey')), [0.12, 0, -0.08]);
  P('5', clampFrame(prism(api, halfB, cy0, cy1, 'grey')), [0.22, 0, -0.16]);
  const loc = (uu, v, y) => [STINGER.p[0] + dSC[0] * uu + pSC[0] * v, y, STINGER.p[1] + dSC[1] * uu + pSC[1] * v];
  for (const sv of [-1, 1]) for (const dy of [-0.025, 0.025]) {
    const yy = (cy0 + cy1) / 2 + dy;
    const s1 = boltStack(api, loc(-u(1.0), sv * (Rt + u(0.1)), yy), [-dSC[0], 0, -dSC[1]], 0.625, 3.0, { washer: 'flat' });
    P('20', s1.washer, [0.26, 0, -0.18]); P('14', s1.bolt, [0.3, 0, -0.2]);
    const s2 = boltStack(api, loc(kB + 0.0095, sv * u(1.2), yy), [dSC[0], 0, dSC[1]], 0.75, 2.0, { washer: 'flat' });
    P('21', s2.washer, [0.05, 0, -0.04]); P('15', s2.bolt, [0.02, 0, -0.02]);
  }

  // ================================================ 6 — support du distributeur, 13 + 22
  const vc = VBM.c, vy1 = VBM.top, vy0 = vy1 - u(0.375);
  const x0 = vc[0] - VBM.w / 2, x1 = vc[0] + VBM.w / 2, z0 = vc[1] - VBM.d / 2, z1 = vc[1] + VBM.d / 2;
  // équerre en L : jambe arrière le long de X, jambe latérale le long de Z, platine dessus, semelles boulonnées
  const legT = u(0.375);
  const legA = S.box(VBM.w, vy0 - yt1, legT, 'lightGrey', { pos: [(x0 + x1) / 2, (vy0 + yt1) / 2, z0 + 0.012] });
  const legB = S.box(legT, vy0 - yt1, z1 - z0 - 0.07, 'lightGrey', { pos: [x1 - 0.012, (vy0 + yt1) / 2, (z0 + z1) / 2 - 0.035] });
  const feet = [[x0 + 0.03, z0 + 0.03], [x1 - 0.04, z0 + 0.03], [x1 - 0.03, z1 - 0.12], [(x0 + x1) / 2, z0 + 0.03]];
  const pad = feet.map(([x, z]) => S.box(0.05, legT, 0.05, 'lightGrey', { pos: [x, yt1 + legT / 2, z] }));
  const top = prism(api, rrect(x0, z0, x1, z1, 0.008, 3), vy0, vy1, 'lightGrey', [rrect(x0 + 0.05, z0 + 0.05, x0 + 0.14, z1 - 0.05, 0.02, 3)]);
  P('6', group(merged([legA, legB, ...pad, top], 'lightGrey')), [0.1, 0.3, -0.1]);
  for (const [x, z] of feet) {
    const s = boltStack(api, [x, yt1 + legT, z], [0, 1, 0], 0.5, 1.25, { washer: 'lock' });
    P('22', s.washer, [0.1, 0.36, -0.1]); P('13', s.bolt, [0.1, 0.42, -0.1]);
  }

  void THREE; void frame; void place; void washer; void nut; void lockWasher; void bolt;
  return { view: { dir: [1, 0.6, 1.1] } };
}

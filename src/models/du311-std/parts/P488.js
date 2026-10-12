// P488 — Accessoires standard du pont arrière CX035393 rév. 2 (page 488) :
// « ASSY, STANDARD ACCESSORIES », repère 4 du pont arrière P420. Pièces
// rapportées sur le châssis du pont : six plots antivibratoires (1), socle de
// l'enrouleur de câble (2), guide-câble arrière (14) avec sa sangle (3), sa
// poignée (12) et ses deux pattes (4), marchepied arrière : cadre (5), tôle
// de marche (6), capot du pare-chocs (7) et marche basse (13) ; quatre
// broches (8) des deux portes basses (10 à gauche, 11 à droite) ; deux
// supports de flexibles à crochets (9) aux coins arrière ; sauve-câble à
// rouleaux (15) et sa platine (16) à l'avant droit ; carter de courroies (17)
// autour de la poulie du moteur ; buse du volant ventilé (18) derrière
// l'ouverture ronde de la porte gauche ; semelle du moteur 75 HP (19) ;
// capot de la caméra de translation (20) ; supports de la bouteille (21) et du
// module (22) d'extinction ; deux cales du panneau HT (23) ; deux supports de
// feux 4 po (24), deux feux arrière rouges (25) et deux feux de recul (26).
// Repère machine (../layout.js : origine au sol sous l'articulation, X vers
// l'avant, Y vers le haut, Z vers la droite), placé à l'identité par P420.
// Châssis du pont d'après ../reardeck.js (DECK de ./_reara.js) ; poulie du
// moteur, carter (17) et semelle (19) sur DRIVE ; buse (18) sur l'axe de
// l'ouverture de la porte gauche (CAN.fan, mesurée sur les pages 416 et 424) ;
// socle (2) sous l'enrouleur REEL.
// Cotes : vues des pages 488, 416 et 420 à l'échelle du châssis ; moteur 365T
// (hauteur d'axe 9 po, entraxes des pattes 14 1/2 × 11 1/4 po) ; feux DEL
// ronds de 4 po ; tubes des supports de flexibles Ø 3 po, crochets Ø 1 po.

import { DRIVE, REEL } from '../reardeck.js';
import { DECK, CAN, I, sheetGeo, sweepGeo, xform, meshOf, rrect, circ, basis, orient, flangeProfile, arcPts, area2 } from './_reara.js';

const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1], nX = [-1, 0, 0], nY = [0, -1, 0], nZ = [0, 0, -1];
const T10 = I(0.135);
const XR = DECK.x0; // arrière du pont (-4.4)
const PADY = DRIVE.yMotor - I(9); // dessus de la semelle : hauteur d'axe 365T

export default function P488(api) {
  const { THREE, S } = api;
  const { box, cyl, at, group, merged, weld, tube } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const plate = (out, holes, t, o, ex, ey, ez) => xform(sheetGeo(THREE, out, holes, t), basis(THREE, o, ex, ey, ez));
  const boltAt = (d, len, p, dir, washer = true) => orient(THREE, S.bolt(I(d), I(len), 'zinc', { washer }), p, dir.map((v) => -v), Math.abs(dir[0]) > 0.9 ? Z : X);
  const extr = (pts, t, o, ex, ey, ez) => plate(pts, [], t, o, ex, ey, ez);

  // ---------------------------------------------------------------- 19 — semelle du moteur 75 HP ; 1 — plots (quatre dessous)
  // Plaque 1/2 po sous les pattes du moteur (axe selon Z), évidement central,
  // quatre taraudages des pattes 365T, quatre trous des plots aux coins.
  const tp = I(0.5), mz = -0.04, px = 0.48, pz = 0.56;
  const padHoles = [rrect(0.2, 0.26, 0.03, 4)];
  for (const a of [-1, 1]) for (const b of [-1, 1]) padHoles.push(circ(a * I(7.25), b * I(5.625), I(0.33), 14), circ(a * (px / 2 - 0.035), b * (pz / 2 - 0.035), I(0.22), 12));
  const padOut = [[-px / 2, -pz / 2], [-0.06, -pz / 2], [-0.06, -pz / 2 + 0.03], [0.06, -pz / 2 + 0.03], [0.06, -pz / 2], [px / 2, -pz / 2], [px / 2, pz / 2], [0.06, pz / 2], [0.06, pz / 2 - 0.03], [-0.06, pz / 2 - 0.03], [-0.06, pz / 2], [-px / 2, pz / 2]];
  const pad = plate(padOut, padHoles, tp, [DRIVE.x, PADY - tp, mz], X, nZ, Y);
  P('19', group(meshOf(api, [pad], 'lightGrey', 0.4)), [0, -0.12, 0.3]);
  // 1 — plot antivibratoire cylindrique : deux coupelles d'acier, caoutchouc, goujons M10.
  const iso = (h) => group(
    merged([cyl(I(0.8), I(0.08), 'zinc', { seg: 18, pos: [0, I(0.04), 0] }), cyl(I(0.8), I(0.08), 'zinc', { seg: 18, pos: [0, h - I(0.04), 0] }),
      cyl(0.005, 0.016, 'zinc', { seg: 10, pos: [0, -0.008, 0] }), cyl(0.005, 0.016, 'zinc', { seg: 10, pos: [0, h + 0.008, 0] })], 'zinc'),
    S.lathe([[0, I(0.08)], [I(0.7), I(0.08)], [I(0.76), h / 2], [I(0.7), h - I(0.08)], [0, h - I(0.08)]], 'rubber', { seg: 20 }),
  );
  const isoH = PADY - tp - DECK.floor;
  for (const a of [-1, 1]) for (const b of [-1, 1]) P('1', at(iso(isoH), [DRIVE.x + a * (px / 2 - 0.035), DECK.floor, mz + b * (pz / 2 - 0.035)]), [a * 0.06, -0.08, b * 0.06]);

  // ---------------------------------------------------------------- 17 — carter de courroies (poulie du moteur)
  // Face extérieure en piste (demi-cercle autour de la poulie, montants vers la
  // buse), ceinture de 0,10 m, rebord de fixation ; ouvert en haut vers la buse.
  const gR = 0.175, gH = 0.42, gz = DRIVE.z - 0.08;
  const gOut = [...arcPts(0, 0, gR, Math.PI, 2 * Math.PI, 20), [gR, gH], [-gR, gH]];
  const gM = basis(THREE, [DRIVE.x, DRIVE.yMotor, gz], X, Y, Z);
  const g17 = [
    xform(sheetGeo(THREE, gOut, [circ(0, 0, 0.035, 16)], I(0.075)), gM),
    xform(sweepGeo(THREE, gOut, flangeProfile(I(0.075), 0.005, 0.1), { i0: gOut.length - 1, i1: gOut.length - 2, loop: true }), gM),
  ];
  const f17 = [[-gR, gH * 0.6], [gR, gH * 0.6], [0, -gR]].map(([x, y]) => boltAt(0.25, 0.5, [DRIVE.x + x * 0.97, DRIVE.yMotor + y * 0.97, gz], [0, 0, 1]));
  P('17', group(meshOf(api, g17, 'lightGrey', 0.5), merged(f17, 'zinc')), [0, 0, -0.25]);

  // ---------------------------------------------------------------- 18 — buse du volant ventilé ; 1 — plots (deux dessus)
  // Tambour Ø 0,72 m (ceinture et fond percé au moyeu) dans le châssis, col
  // Ø 0,64 m jusqu'à la peau de la porte gauche, grille en spirale de fil noir
  // à huit rayons plats, échancrure basse pour les courroies, console supérieure.
  const F = CAN.fan, fy = CAN.yb + 0.32, rD = 0.36, rC = 0.318;
  const zG = -CAN.zo + 0.03, zC = -0.845, zBk = -0.48;
  const fanM = (z) => basis(THREE, [F.x, fy, z], X, Y, Z);
  const drumOut = arcPts(0, 0, rD, -Math.PI / 2 + 0.32, 1.5 * Math.PI - 0.32, 48);
  const g18 = [
    xform(sweepGeo(THREE, drumOut, [[0, 0], [T10, 0], [T10, zBk - zC], [0, zBk - zC]]), fanM(zC)), // ceinture
    xform(sheetGeo(THREE, circ(0, 0, rD, 48), [circ(0, 0, 0.11, 24), rrect(0.2, 0.14, 0.02, 3, 0, -rD + 0.05)], T10), fanM(zBk - T10)), // fond
    xform(sheetGeo(THREE, circ(0, 0, rD + 0.004, 48), [circ(0, 0, rC, 48)], T10), fanM(zC - T10)), // flasque avant
    xform(sweepGeo(THREE, circ(0, 0, rC, 48).reverse(), [[0, 0], [T10, 0], [T10, zC - T10 - zG], [0, zC - T10 - zG]], { closed: true, loop: true }), fanM(zG)), // col
    xform(sheetGeo(THREE, circ(0, 0, rC + 0.008, 48), [circ(0, 0, rC - 0.008, 48)], T10), fanM(zG - T10)), // bague de grille
  ];
  // Console supérieure (plats sur le tambour) qui reçoit deux plots.
  g18.push(box(0.36, T10 * 2, 0.12, 'lightGrey', { pos: [F.x, fy + rD + 0.004 + T10, (zC + zBk) / 2] }));
  for (const s of [-1, 1]) g18.push(box(T10 * 2, 0.06, 0.12, 'lightGrey', { pos: [F.x + s * 0.17, fy + rD - 0.025, (zC + zBk) / 2] }));
  const beads18 = [weld(arcPts(0, 0, rD + 0.002, 0.2, Math.PI - 0.2, 24).map(([x, y]) => [F.x + x, fy + y, zC + 0.002]), 0.005, 'lightGrey')];
  // Grille : spirale de fil Ø 5 mm, rayons plats, moyeu.
  const spiral = [];
  const turns = 11, r0 = 0.045, r1 = rC - 0.012;
  for (let i = 0; i <= turns * 40; i++) { const a = (i / 40) * 2 * Math.PI, r = r0 + ((r1 - r0) * i) / (turns * 40); spiral.push([F.x + r * Math.cos(a), fy + r * Math.sin(a), zG - 0.004]); }
  const wire = tube(spiral, 0.0025, 'black', { seg: turns * 40, radial: 5, ends: 'none' });
  const spokes = Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * 2 * Math.PI; return box(r1 - 0.03, 0.012, 0.004, 'black', { pos: [F.x + Math.cos(a) * (r1 + 0.03) / 2, fy + Math.sin(a) * (r1 + 0.03) / 2, zG - 0.009], rot: [0, 0, a] }); });
  const hub = [S.ring(0.045, 0.02, 0.008, 'black', { axis: 'z', seg: 24, pos: [F.x, fy, zG - 0.008] })];
  P('18', group(meshOf(api, g18, 'lightGrey', 0.5), merged(beads18, 'lightGrey'), wire, merged([...spokes, ...hub], 'black')), [0, 0.15, -0.3]);
  for (const s of [-1, 1]) P('1', at(iso(0.02), [F.x + s * 0.12, fy + rD + 0.004 + 2 * T10, (zC + zBk) / 2]), [s * 0.05, 0.08, 0]);

  // ---------------------------------------------------------------- 2 — socle de l'enrouleur
  // Semelle 1/2 po sur le plancher, fût en caisson à flancs inclinés et
  // goussets, platine supérieure à lumière carrée (fixation de l'enrouleur).
  const yTop = 0.8, rx = REEL.x;
  const g2 = [
    plate(rrect(0.3, 0.3, 0.01, 3), [...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => circ(a * 0.12, b * 0.12, 0.0085, 10))], I(0.5), [rx, DECK.floor, 0], X, nZ, Y),
    plate(rrect(0.25, 0.25, 0.01, 3), [rrect(0.08, 0.08, 0.008, 2), ...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => circ(a * 0.095, b * 0.095, 0.0075, 10))], I(0.5), [rx, yTop - I(0.5), 0], X, nZ, Y),
  ];
  const yb2 = DECK.floor + I(0.5), yt2 = yTop - I(0.5);
  for (const s of [-1, 1]) {
    g2.push(extr([[-0.1, 0], [0.1, 0], [0.1, yt2 - yb2], [-0.1, yt2 - yb2]], I(3 / 8), [rx, yb2, s * 0.09 - (s > 0 ? I(3 / 8) : 0)], X, Y, Z));
    g2.push(extr([[-0.09, 0], [0.09, 0], [0.09, yt2 - yb2], [-0.09, yt2 - yb2]], I(3 / 8), [rx + s * 0.1, yb2, 0], Z, Y, s > 0 ? nX : X));
    g2.push(extr([[0, 0], [0.06, 0], [0, 0.1]], I(3 / 8), [rx, yb2, s * 0.09], s > 0 ? Z : nZ, Y, X));
  }
  const f2 = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => boltAt(0.5, 1.5, [rx + a * 0.12, DECK.floor + I(0.5), b * 0.12], [0, -1, 0]));
  P('2', group(meshOf(api, g2, 'lightGrey', 0.4), merged(f2, 'zinc')), [0, -0.15, 0]);

  // ---------------------------------------------------------------- 14 — guide-câble arrière ; 3 — sangle ; 12 — poignée ; 4 — pattes
  // Cadre en U (dos et deux joues) derrière le capot, au coin arrière droit,
  // deux rouleaux verticaux Ø 2 po sur axes entre lesquels passe le câble.
  const qx = -4.27, qz = 0.6, y14 = [DECK.top + 0.02, 1.88];
  const h14 = y14[1] - y14[0];
  const g14 = [
    box(T10 * 2, h14, 0.2, 'lightGrey', { pos: [qx - 0.06, (y14[0] + y14[1]) / 2, qz] }), // dos
    ...[-1, 1].map((s) => box(0.12, h14, I(1 / 4), 'lightGrey', { pos: [qx, (y14[0] + y14[1]) / 2, qz + s * 0.1] })),
    ...[y14[0], y14[1]].map((y) => box(0.12, I(3 / 8), 0.2, 'lightGrey', { pos: [qx, y, qz] })),
  ];
  const rollers = [-0.04, 0.04].map((dz) => S.lathe([[0.012, 0], [I(1), 0.004], [I(1), h14 - 0.05], [0.012, h14 - 0.046]], 'steel', { seg: 24, pos: [qx + 0.02, y14[0] + 0.022, qz + dz] }));
  const axles = [-0.04, 0.04].map((dz) => cyl(0.008, h14 + 0.03, 'zinc', { seg: 12, pos: [qx + 0.02, (y14[0] + y14[1]) / 2, qz + dz] }));
  const nuts14 = [-0.04, 0.04].flatMap((dz) => [y14[0] - 0.012, y14[1] + 0.012].map((y) => at(S.nut(0.024, 0.012, 'zinc'), [qx + 0.02, y, qz + dz])));
  P('14', group(meshOf(api, g14, 'lightGrey', 0.4), merged(rollers, 'steel'), merged([...axles, ...nuts14], 'zinc')), [-0.12, 0.05, 0.1]);
  // 3 — sangle soudée : plat incliné sur le haut du cadre, lumières oblongues.
  const g3 = [plate(rrect(0.34, 0.06, 0.008, 3), [rrect(0.06, 0.016, 0.008, 3, -0.08, 0), rrect(0.06, 0.016, 0.008, 3, 0.08, 0)], I(1 / 4), [qx - 0.05, y14[1] + 0.06, qz], [Math.cos(0.45), -Math.sin(0.45), 0], [0, 0, 1], [Math.sin(0.45), Math.cos(0.45), 0])];
  g3.push(box(0.06, 0.06, I(1 / 4), 'lightGrey', { pos: [qx + 0.03, y14[1] + 0.03, qz + 0.03] }));
  P('3', group(meshOf(api, g3, 'lightGrey', 0.4)), [-0.08, 0.15, 0]);
  // 12 — poignée : rond Ø 3/4 po coudé en boucle rectangulaire, jaune.
  const hy = y14[1] + 0.012;
  const loop = [[qx - 0.05, hy, qz - 0.09], [qx - 0.05, hy + 0.08, qz - 0.09], [qx - 0.05, hy + 0.08, qz + 0.09], [qx - 0.05, hy, qz + 0.09]];
  P('12', group(tube(loop, I(0.375), 'safety', { seg: 40, radial: 12, tension: 0.15, ends: 'none' }), merged([qz - 0.09, qz + 0.09].map((z) => box(0.03, 0.006, 0.03, 'safety', { pos: [qx - 0.05, hy - 0.003, z] })), 'safety')), [0, 0.2, 0]);
  // 4 — pattes pliées (deux) : boulonnées sur la traverse arrière du châssis.
  for (const s of [-1, 1]) {
    const g = [box(0.1, T10 * 2, 0.06, 'lightGrey', { pos: [qx - 0.04, DECK.top + T10, qz + s * 0.07] }), box(T10 * 2, 0.06, 0.06, 'lightGrey', { pos: [qx + 0.01, DECK.top + 0.03, qz + s * 0.07] })];
    P('4', group(meshOf(api, g, 'lightGrey', 0.4), merged([boltAt(0.375, 1, [qx - 0.065, DECK.top + T10 * 2, qz + s * 0.07], [0, -1, 0])], 'zinc')), [-0.05, -0.05, s * 0.1]);
  }

  // ---------------------------------------------------------------- 9 — supports de flexibles (deux)
  // Tube Ø 3 po coiffé, bout Ø 2 1/2 po emboîté dans la douille du pare-chocs,
  // bague d'arrêt, deux crochets Ø 1 po en J tournés vers l'arrière.
  for (const s of [-1, 1]) {
    const x = XR - 0.06, z = s * 0.93, y0 = 0.8, y1 = 0.95, y2 = 2.25;
    const post = S.lathe([[0, y0], [I(1.2), y0], [I(1.25), y0 + 0.005], [I(1.25), y1], [I(1.6), y1], [I(1.6), y1 + 0.03], [I(1.5), y1 + 0.03], [I(1.5), y2 - 0.006], [I(1.45), y2], [0, y2]], 'grey', { seg: 28, pos: [x, 0, z] });
    const hooks = [1.6, 2.05].map((y) => tube([[x - I(1.4), y - 0.12, z], [x - 0.12, y - 0.1, z], [x - 0.2, y - 0.03, z], [x - 0.21, y + 0.06, z]], I(0.5), 'grey', { seg: 24, radial: 12, tension: 0.4, ends: 'none' }));
    const caps = [1.6, 2.05].map((y) => at(S.ball(I(0.5), 'grey'), [x - 0.21, y + 0.06, z]));
    const beads = [1.6, 2.05].map((y) => S.weldRing(I(0.62), 0.005, 'grey', { axis: 'x', pos: [x - I(1.45), y - 0.12, z] }));
    P('9', group(post, merged([...hooks, ...caps, ...beads], 'grey')), [-0.15, 0.25, 0]);
  }

  // ---------------------------------------------------------------- 10, 11 — portes basses (gauche, droite) ; 8 — broches (quatre)
  // Tôle 10 ga bordée sous le flanc du châssis (bas en pente vers l'arrière),
  // deux lumières de préhension, deux chapes en haut traversées par les
  // broches à anneau, patte de verrouillage en bas.
  const dx0 = -4.04, dx1 = -3.25, dyT = DECK.top - 0.02; // en avant de la cornière 4 de P422
  for (const [ref, s] of [['10', -1], ['11', 1]]) {
    const zD = s * (DECK.zo + 0.03);
    const o = [[0, 0], [dx1 - dx0, 0], [dx1 - dx0, dyT - 0.36], [0, dyT - 0.56]];
    const outl = area2(o) > 0 ? o : o.reverse();
    const holes = [rrect(0.11, 0.032, 0.016, 4, 0.25, 0.08), rrect(0.11, 0.032, 0.016, 4, dx1 - dx0 - 0.25, 0.08)];
    const M = basis(THREE, [dx0, dyT, zD], X, nY, [0, 0, -s]);
    const g = [xform(sheetGeo(THREE, outl, holes, T10, { bevel: false }), M), xform(sweepGeo(THREE, outl, flangeProfile(T10, 0.005, 0.025), { closed: true, loop: true }), M)];
    for (const xx of [0.06, dx1 - dx0 - 0.06]) g.push(box(0.05, 0.04, I(1 / 4), 'lightGrey', { pos: [dx0 + xx, dyT + 0.012, zD + s * 0.006] }));
    g.push(box(0.04, 0.05, I(1 / 4), 'lightGrey', { pos: [dx0 + 0.45, 0.43, zD - s * 0.01] }));
    P(ref, group(meshOf(api, g, 'lightGrey', 0.4)), [0, -0.1, s * 0.3]);
    for (const xx of [0.06, dx1 - dx0 - 0.06]) {
      const p = [dx0 + xx, dyT + 0.025, zD + s * 0.006];
      const pin = S.lathe([[0, -0.035], [I(0.25), -0.035], [I(0.25), 0.035], [I(0.33), 0.04], [I(0.33), 0.046], [0, 0.046]], 'zinc', { seg: 14 });
      const ring = at(S.torus(0.016, I(0.08), 'zinc', { axis: 'x' }), [0, 0.046 + 0.016, 0]);
      P('8', orient(THREE, group(pin, ring), p, X, Y), [0.08, 0.05, s * 0.32]);
    }
  }

  // ---------------------------------------------------------------- 5 — cadre du marchepied ; 6 — tôle de marche ; 13 — marche basse ; 7 — capot du pare-chocs
  const sz0 = -0.42, sz1 = 0.25, sx0 = XR - 0.02, sx1 = XR - 0.24, sy = 0.62;
  const zc5 = (sz0 + sz1) / 2, w5 = sz1 - sz0, d5 = sx0 - sx1;
  const g5 = [
    ...[sz0, sz1].map((z) => box(d5, 0.08, I(3 / 8), 'lightGrey', { pos: [(sx0 + sx1) / 2, sy - 0.04, z] })),
    box(I(3 / 8), 0.08, w5, 'lightGrey', { pos: [sx1, sy - 0.04, zc5] }),
    box(I(3 / 8), 0.08, w5, 'lightGrey', { pos: [sx0, sy - 0.04, zc5] }),
  ];
  for (const z of [sz0 + 0.06, sz1 - 0.06]) g5.push(plate(rrect(0.08, 0.16, 0.01, 3, 0, 0.04), [circ(0, 0.08, 0.0085, 12), circ(0, 0.03, 0.0085, 12)], I(1 / 2), [XR + 0.0, sy - 0.04, z], nZ, Y, X));
  const beads5 = [sz0, sz1].map((z) => weld([[sx1, sy, z], [sx0, sy, z]], 0.005, 'lightGrey'));
  const f5 = [sz0 + 0.06, sz1 - 0.06].flatMap((z) => [sy, sy + 0.05].map((y) => boltAt(0.5, 1.5, [XR - I(1 / 2), y, z], X)));
  P('5', group(meshOf(api, g5, 'lightGrey', 0.4), merged(beads5, 'lightGrey'), merged(f5, 'zinc')), [-0.25, 0, 0]);
  const tread = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 12; j++) tread.push(circ(-d5 / 2 + 0.035 + i * ((d5 - 0.07) / 3), -w5 / 2 + 0.05 + j * ((w5 - 0.1) / 11), 0.011, 10));
  P('6', group(meshOf(api, [plate(rrect(d5 - 0.01, w5 - 0.01, 0.01, 3), tread, I(3 / 16), [(sx0 + sx1) / 2, sy, zc5], X, nZ, Y)], 'safety', 0.4)), [-0.25, 0.12, 0]);
  const st = 0.33;
  const g13 = [...[sz0 + 0.08, sz1 - 0.08].map((z) => cyl(I(0.5), sy - 0.08 - st, 'safety', { seg: 14, pos: [(sx0 + sx1) / 2, (sy - 0.08 + st) / 2, z] }))];
  g13.push(xform(sheetGeo(THREE, rrect(0.12, w5 - 0.06, 0.006, 2), [rrect(0.08, 0.02, 0.008, 3, 0, -0.2), rrect(0.08, 0.02, 0.008, 3, 0, 0), rrect(0.08, 0.02, 0.008, 3, 0, 0.2)], I(3 / 16)), basis(THREE, [(sx0 + sx1) / 2, st, zc5], X, nZ, Y)));
  for (const s of [-1, 1]) g13.push(box(0.12, 0.03, I(3 / 16), 'safety', { pos: [(sx0 + sx1) / 2, st - 0.015, zc5 + s * (w5 - 0.06) / 2] }));
  P('13', group(meshOf(api, g13, 'safety', 0.4)), [-0.25, -0.15, 0]);
  // 7 — capot : tôle 10 ga sur le pare-chocs, retombée arrière, lumières.
  const c7 = [[-0.07, -0.8], [0.07, -0.8], [0.07, 0.8], [-0.07, 0.8]];
  const M7 = basis(THREE, [XR + 0.05, DECK.top + T10, 0], X, nZ, nY);
  const g7 = [xform(sheetGeo(THREE, c7, [rrect(0.05, 0.12, 0.012, 3, 0, -0.45), rrect(0.05, 0.12, 0.012, 3, 0, 0.45)], T10, { bevel: false }), M7),
    xform(sweepGeo(THREE, c7, flangeProfile(T10, 0.005, 0.05), { i0: 3, i1: 0, loop: true }), M7)];
  P('7', group(meshOf(api, g7, 'lightGrey', 0.4), merged([-0.7, 0, 0.7].map((z) => S.at(S.group(S.bolt(I(0.3125), I(0.75), 'zinc')), [XR + 0.05, DECK.top + T10, z])), 'zinc')), [0, 0.12, 0]);

  // ---------------------------------------------------------------- 15 — sauve-câble à rouleaux ; 16 — platine
  // Échelle de deux plats 1 1/2 × 1/2 po et trois rouleaux Ø 2 po sur axes,
  // devant la traverse avant du châssis, à droite ; platine 1/4 po boulonnée.
  const x15 = DECK.front[1] + I(1 / 4) + 0.025, za = 0.64, zb = 0.82, y15 = [0.42, 1.14];
  const g15 = [...[za, zb].map((z) => box(0.038, y15[1] - y15[0], I(0.5), 'lightGrey', { pos: [x15, (y15[0] + y15[1]) / 2, z] }))];
  for (const y of [0.52, 0.98]) g15.push(box(0.05, I(1 / 4), zb - za + I(0.5), 'lightGrey', { pos: [x15 - 0.006, y, (za + zb) / 2] }));
  const rl15 = [0.62, 0.78, 0.94].map((y) => S.lathe([[0.01, 0], [I(1), 0.004], [I(1), zb - za - I(0.5) - 0.006], [0.01, zb - za - I(0.5) - 0.002]], 'steel', { seg: 24, axis: 'z', pos: [x15, y, za + I(0.25) + 0.001] }));
  const ax15 = [0.62, 0.78, 0.94].map((y) => cyl(0.008, zb - za + 0.04, 'zinc', { axis: 'z', seg: 12, pos: [x15, y, (za + zb) / 2] }));
  const f15 = [0.52, 0.98].flatMap((y) => [za + 0.04, zb - 0.04].map((z) => boltAt(0.375, 1.0, [x15 + 0.019, y, z], nX)));
  P('15', group(meshOf(api, g15, 'lightGrey', 0.4), merged(rl15, 'steel'), merged([...ax15, ...f15], 'zinc')), [0.2, 0, 0.1]);
  P('16', group(meshOf(api, [plate(rrect(0.3, 0.52, 0.01, 3), [...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => circ(a * 0.12, b * 0.23, 0.0055, 10))], I(1 / 4), [DECK.front[1], 0.75, 0.72], nZ, Y, X)], 'lightGrey', 0.4),
    merged([[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => boltAt(0.3125, 0.75, [DECK.front[1] + I(1 / 4), 0.75 + b * 0.23, 0.72 - a * 0.12], nX)), 'zinc')), [0.12, 0, 0]);

  // ---------------------------------------------------------------- 20 — capot de la caméra de translation
  // Boîtier en tôle (toit en visière) sur le capot du pare-chocs, regard rond
  // vers l'arrière, deux vis.
  const cx = XR + 0.06, cz = -0.55, cy = DECK.top + T10;
  const g20 = [
    plate(rrect(0.11, 0.1, 0.006, 2, 0, 0.05), [circ(0, 0.05, 0.022, 20)], T10, [cx - 0.06, cy, cz], nZ, Y, X),
    ...[-1, 1].map((s) => extr([[0, 0], [0.12, 0], [0.12, 0.09], [0, 0.11]], T10, [cx + 0.06, cy, cz + s * 0.055 - (s > 0 ? T10 : 0)], nX, Y, Z)),
    plate(rrect(0.13, 0.12, 0.004, 2, 0, 0), [], T10, [cx + 0.0, cy + 0.11, cz], X, nZ, [Math.sin(0.15), Math.cos(0.15), 0]),
  ];
  P('20', group(meshOf(api, g20, 'lightGrey', 0.4), merged([-1, 1].map((s) => S.at(S.group(S.bolt(I(0.25), I(0.5), 'zinc')), [cx + 0.03, cy + 0.01, cz + s * 0.04])), 'zinc')), [-0.08, 0.15, 0]);

  // ---------------------------------------------------------------- 21 — support de la bouteille d'extinction ; 22 — support du module
  // 21 : dosseret sur la traverse arrière, deux berceaux à colliers pour une bouteille Ø 0,2 m.
  const xb = XR + 0.05 + I(1 / 4), zt = -0.25;
  const g21 = [plate(rrect(0.26, 0.4, 0.01, 3, 0, 0.2), [circ(-0.09, 0.05, 0.0055, 10), circ(0.09, 0.05, 0.0055, 10), circ(-0.09, 0.35, 0.0055, 10), circ(0.09, 0.35, 0.0055, 10)], I(1 / 4), [xb, 0.55, zt], nZ, Y, X)];
  for (const y of [0.64, 0.86]) {
    g21.push(xform(sweepGeo(THREE, arcPts(0, 0, 0.104, Math.PI, 2 * Math.PI, 18), [[0, -0.02], [I(0.1), -0.02], [I(0.1), 0.02], [0, 0.02]]), basis(THREE, [xb + 0.104, y, zt], Z, X, Y)));
  }
  P('21', group(meshOf(api, g21, 'lightGrey', 0.4)), [0.15, 0.05, 0]);
  // 22 : équerre à tablette sur la face intérieure du flanc droit, à l'avant.
  const zi = DECK.z - 0.0125;
  const g22 = [
    plate(rrect(0.22, 0.2, 0.008, 3), [circ(-0.08, -0.06, 0.0055, 10), circ(0.08, -0.06, 0.0055, 10)], I(3 / 16), [-3.1, 0.82, zi], X, Y, nZ),
    plate(rrect(0.22, 0.14, 0.008, 3, 0, 0), [rrect(0.12, 0.06, 0.01, 3)], I(3 / 16), [-3.1, 0.92, zi - 0.07], X, Z, nY),
    ...[-0.1, 0.1].map((dx) => extr([[0, 0], [0.12, 0], [0, -0.08]], I(3 / 16), [-3.1 + dx, 0.92 - I(3 / 16), zi], nZ, Y, X)),
  ];
  P('22', group(meshOf(api, g22, 'lightGrey', 0.4), merged([-0.08, 0.08].map((dx) => boltAt(0.3125, 1.25, [-3.1 + dx, 0.76, zi - I(3 / 16)], Z)), 'zinc')), [0, 0.05, -0.15]);

  // ---------------------------------------------------------------- 23 — cales du panneau HT (deux)
  // Blocs 1/2 po entre le flanc droit et l'équerre du transformateur (P416 rep. 5).
  for (const x of [-2.92, -3.18]) {
    const g = plate(rrect(0.05, 0.1, 0.006, 2), [circ(0, 0.025, 0.0055, 10), circ(0, -0.025, 0.0055, 10)], I(0.5), [x, 0.75, DECK.zo], X, Y, Z);
    P('23', group(meshOf(api, [g], 'zinc', 0.4)), [0, 0, 0.12]);
  }

  // ---------------------------------------------------------------- 24 — supports de feux ; 25 — feux arrière rouges ; 26 — feux de recul
  // Platine pliée par coin arrière sous le bras du pare-chocs, deux trous de
  // 4 po ; feux DEL ronds de 4 po en œillet de caoutchouc, lentille rouge
  // (25, côté extérieur) ou claire (26), boîtier et queue de câble.
  const lamp = (lens) => {
    const body = S.lathe([[0, -0.055], [0.04, -0.055], [0.05, -0.04], [0.052, 0], [0, 0]], 'plastic', { seg: 28 });
    const grom = S.lathe([[0.051, -0.012], [0.066, -0.012], [0.068, 0.004], [0.06, 0.008], [0.051, 0.008]], 'rubber', { seg: 28 });
    const face = S.lathe([[0, 0.006], [0.047, 0.006], [0.049, 0.0], [0, 0.0]].reverse(), lens, { seg: 28 });
    const bezel = S.ring(0.051, 0.046, 0.004, 'chrome', { seg: 28, pos: [0, 0.007, 0] });
    const pig = cyl(0.004, 0.08, 'black', { seg: 8, pos: [0, -0.095, 0] });
    return group(body, grom, face, bezel, pig);
  };
  for (const s of [-1, 1]) {
    const zl = s * 0.62, yl = 0.76;
    const g24 = [plate(rrect(0.3, 0.13, 0.01, 3), [circ(-0.075, 0, 0.0515, 28), circ(0.075, 0, 0.0515, 28)], I(3 / 16), [XR - 0.004, yl, zl], nZ, Y, nX)];
    g24.push(plate(rrect(0.3, 0.06, 0.01, 3, 0, 0.03), [circ(-0.1, 0.03, 0.0055, 10), circ(0.1, 0.03, 0.0055, 10)], I(3 / 16), [XR - 0.004, yl + 0.065, zl], nZ, X, Y));
    P('24', group(meshOf(api, g24, 'lightGrey', 0.4)), [-0.1, 0, 0]);
    P('25', orient(THREE, lamp('lampRed'), [XR - 0.004 - I(3 / 16), yl, zl + s * 0.075], nX, Z), [-0.2, 0, s * 0.05]);
    P('26', orient(THREE, lamp('lamp'), [XR - 0.004 - I(3 / 16), yl, zl - s * 0.075], nX, Z), [-0.2, 0, -s * 0.05]);
  }

  return { view: { dir: [-1.1, 0.7, 1.0] } };
}

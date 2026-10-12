// P328 — Réservoir hydraulique 34 gal CX012880 rév. 5 (page 328) : « TANK,
// HYDRAULIC 34 GAL », repère 1 de P326. Caisson soudé (4) en tôle de 3/16 po :
// corps parallélépipédique, chevron arrière en surplomb (deux pans inclinés
// face à l'articulation, dégagé en bas pour les orifices), quatre pattes de
// fixation à trous oblongs (vis 3/4 de P326), cadre taraudé sur le dessus,
// bossages des orifices (adaptateurs de P326) et des voyants, deux plaques
// d'obturation CP005527 hors liste. Couvercle (5) sur joint (6), douze vis H
// 3/8-16 × 1 (11) et rondelles Nord-Lock (16) ; reniflard de remplissage (3)
// et sonde de niveau et de température (1) sur le couvercle, sous un capot
// en U (9) fixé par deux vis 3/8 × 1 1/4 (12). Trois voyants à bille
// flottante (2) sur la face −Z, bouchon fraisé 1 po NPT de vidange (10).
// Plaque de traversée (8, seize orifices sur deux colonnes décalées) tenue à
// l'angle arrière +Z par deux équerres (7) : vis 1/2-13 × 1 (13) et rondelles
// Nord-Lock (17) côté réservoir ; vis 1/2-13 × 1 1/2 (14), rondelles plates
// (15) et écrous (18) côté plaque.
// Repère : origine au centre du dessous du caisson principal, axes du repère
// machine (X avant, Y haut, Z droite) ; chevron vers −X. Caisson 0.28 × 0.72 ×
// 0.72 m + chevron de 0.12 m (≈ 140 L brut, 34 gal US utiles) d'après les
// vues des pages 326 et 328 ; encombrement 0.42 × 0.86 × 0.86 m.
import { u, TANK, cabHw, prism, rrect } from './_cab.js';

/** Hauteurs des seize orifices de la plaque de traversée (de haut en bas), tailles et colonnes. */
export const BULK = {
  dash: [4, 12, 6, 8, 6, 6, 6, 12, 6, 12, 6, 16, 6, 16, 6, 16],
  y: (() => { const d = { 4: 0.6, 6: 0.75, 8: 0.9, 12: 1.2, 16: 1.5 }; const ys = [0.64]; const ds = [4, 12, 6, 8, 6, 6, 6, 12, 6, 12, 6, 16, 6, 16, 6, 16]; for (let k = 1; k < 16; k++) ys.push(ys[k - 1] - 0.012 - 0.0127 * 0.5 * (d[ds[k - 1]] + d[ds[k]])); return ys; })(),
  col: (k) => (k % 2 ? -0.014 : 0.014), // décalage latéral (pair : colonne des petits orifices)
  // Plaque de traversée (repère du réservoir) : plan Y-Z, face arrière à x = px.
  px: -TANK.D / 2 - 0.035, pz: TANK.W / 2 + 0.03, t: u(0.375),
};

/** Orifices du caisson (repère du réservoir) : face arrière basse [z, y], pans du chevron [z, y, dash]. */
export const TPORTS = {
  low: [[-0.1, 0.13], [0.06, 0.13], [0.22, 0.13], [-0.3, 0.06], [0.3, 0.06]],
  chev: [[-0.12, 0.4, 6], [-0.24, 0.4, 6], [0.14, 0.4, 6], [-0.05, 0.33, 12], [0.26, 0.33, 12]],
};
/** Point (x) et normale sortante du pan du chevron à la cote z (repère du réservoir). */
export function chevPan(z) {
  const s = Math.sign(z) || 1, L = Math.hypot(TANK.W / 2, TANK.nose);
  return { x: -TANK.D / 2 - TANK.nose * (1 - Math.abs(z) / (TANK.W / 2)), n: [-(TANK.W / 2) / L, 0, (s * TANK.nose) / L] };
}

export default function P328(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, merged, group, at, weld } = S;
  const H_ = cabHw(api);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { D, W, H, nose, ny } = TANK;
  const M = 'lightGrey';
  const xr = -D / 2; // face arrière du corps

  // ---------------------------------------------------------------- 4 — caisson soudé
  const body = [box(D, H, W, M, { r: 0.004, pos: [0, H / 2, 0] })];
  // Chevron : prisme (plan x-z) extrudé en hauteur de ny à H.
  body.push(prism(S, THREE, [[xr + 0.002, -W / 2], [xr - nose, 0], [xr + 0.002, W / 2]], H - ny, M, 'xz', (ny + H) / 2));
  // Pattes de fixation (plat 4 × 1/2 po) aux quatre coins, trous oblongs pour vis 3/4.
  const feet = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const f = prism(S, THREE, [[-0.045, 0], [0.045, 0], [0.045, 0.07], [0.03, 0.085], [-0.03, 0.085], [-0.045, 0.07]], 0.0127, M, 'xz', 0.0064,
      { polys: [rrect(0, 0.05, 0.035, 0.022, 0.011, 4)] });
    const g = group(f);
    g.position.set(sx * (D / 2 - 0.05), 0, sz * W / 2);
    if (sz < 0) g.rotation.y = Math.PI;
    feet.push(g);
    body.push(box(0.09, 0.08, 0.0127, M, { pos: [sx * (D / 2 - 0.05), 0.04, sz * (W / 2 + 0.0064)] }));
  }
  // Cadre taraudé sur le dessus (ouverture du couvercle).
  const CV = { x: -0.005, w: 0.25, d: 0.46 };
  body.push(prism(S, THREE, rrect(CV.x, 0, CV.w + 0.03, CV.d + 0.03, 0.02), 0.0127, M, 'xz', H + 0.0064, { polys: [rrect(CV.x, 0, CV.w - 0.05, CV.d - 0.05, 0.015)] }));
  // Bossages : voyants (face −Z), vidange, orifices arrière bas et sur les pans du chevron.
  const bosses = [];
  for (const y of [0.25, 0.42, 0.59]) bosses.push(at(cyl(0.03, 0.01, M, { axis: 'z', seg: 24 }), [0, y, -W / 2 - 0.005]));
  bosses.push(at(cyl(0.028, 0.01, M, { axis: 'z', seg: 24 }), [0.06, 0.05, -W / 2 - 0.005]));
  for (const [z, y] of TPORTS.low) bosses.push(at(cyl(0.024, 0.01, M, { axis: 'x', seg: 20 }), [xr - 0.005, y, z]));
  for (const [z, y] of TPORTS.chev) {
    const { x, n } = chevPan(z);
    bosses.push(H_.pose(lathe([[0, -0.004], [0.022, -0.004], [0.022, 0.006], [0, 0.006]], M, { seg: 20 }), [x, y, z], n));
  }
  // Plaques d'obturation CP005527 (hors liste) sur la face arrière basse.
  const blank = [];
  for (const z of [-0.25]) for (const y of [0.075, 0.165]) {
    blank.push(box(0.012, 0.075, 0.07, 'lightGrey', { r: 0.002, pos: [xr - 0.006, y, z] }));
    for (const dy of [-0.025, 0.025]) for (const dz of [-0.022, 0.022]) blank.push(at(lathe([[0, 0], [0.007, 0], [0.007, 0.006], [0, 0.006]], 'zinc', { seg: 6 }), [xr - 0.012, y + dy, z + dz], [0, 0, Math.PI / 2]));
  }
  // Évidement latéral +Z (poche rectangulaire du dessin) suggéré par un cadre soudé.
  const pocket = prism(S, THREE, [[-0.1, 0.17], [0.1, 0.17], [0.1, 0.63], [-0.1, 0.63]], 0.006, M, 'xy', W / 2 + 0.003, { polys: [rrect(0, 0.4, 0.17, 0.43, 0.008)] });
  body.push(pocket);
  const beads = merged([
    weld([[xr - 0.002, ny + 0.002, -W / 2], [xr - nose, ny + 0.002, 0], [xr - 0.002, ny + 0.002, W / 2]], 0.007, M),
    weld([[xr - nose, ny, 0], [xr - nose, H - 0.004, 0]], 0.007, M),
    ...[-1, 1].map((s) => weld([[D / 2 + 0.002, 0.01, s * (W / 2 + 0.002)], [D / 2 + 0.002, H - 0.01, s * (W / 2 + 0.002)]], 0.007, M)),
  ], M);
  P('4', group(merged([...body, ...feet, ...bosses], M), beads, merged(blank, 'zinc')), [0, 0, 0]);

  // ---------------------------------------------------------------- 6 — joint ; 5 — couvercle ; 11 / 16 — vis et rondelles
  const yC = H + 0.0127;
  const cPts = [];
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) cPts.push([CV.x + s * (CV.w / 2 - 0.004), -CV.d / 2 + 0.04 + (i * (CV.d - 0.08)) / 3]);
  for (const s of [-1, 1]) for (const k of [-1, 1]) cPts.push([CV.x + k * 0.05, s * (CV.d / 2 - 0.004)]);
  const tg = u(0.0625), tc = u(0.25);
  const gk = H_.K.plate(CV.w + 0.03, CV.d + 0.03, tg, 'rubber', { holes: cPts.map(([x, z]) => [x - CV.x, z, 0.005]), cutouts: [[0, 0, CV.w - 0.05, CV.d - 0.05]], r: 0.02, seg: 6 });
  gk.position.set(CV.x, yC + tg / 2, 0);
  P('6', gk, [0, 0.1, 0]);
  const PS = [-0.06, 0, -0.12], PB = [0.06, 0, 0.12]; // sonde, reniflard (x, -, z)
  const cov = H_.K.plate(CV.w + 0.03, CV.d + 0.03, tc, M, { holes: [...cPts.map(([x, z]) => [x - CV.x, z, 0.005]), [PS[0] - CV.x, PS[2], 0.012], [PB[0] - CV.x, PB[2], 0.02]], r: 0.02, seg: 8 });
  cov.position.set(CV.x, yC + tg + tc / 2, 0);
  const yT = yC + tg + tc;
  P('5', group(cov, at(cyl(0.032, 0.012, M, { seg: 24 }), [PB[0], yT + 0.006, PB[2]])), [0, 0.2, 0]);
  for (const [x, z] of cPts) {
    P('16', H_.washer(0.375, [x, yT, z], [0, 1, 0], 'nl'), [0, 0.26, 0]);
    P('11', H_.bolt(0.375, 1.0, [x, yT + H_.wT(0.375, 'nl'), z], [0, 1, 0], { light: true }), [0, 0.32, 0]);
  }

  // ---------------------------------------------------------------- 3 — reniflard ; 1 — sonde ; 9 — capot ; 12 — vis du capot
  const ribs = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    ribs.push(box(0.006, 0.04, 0.008, 'black', { pos: [PB[0] + Math.cos(a) * 0.036, yT + 0.034, PB[2] + Math.sin(a) * 0.036], rot: [0, -a, 0] }));
  }
  P('3', group(
    lathe([[0, 0.012], [0.035, 0.012], [0.037, 0.02], [0.037, 0.052], [0.03, 0.062], [0, 0.064]], 'black', { seg: 24, pos: [PB[0], yT, PB[2]] }),
    merged(ribs, 'black'),
    lathe([[0, -0.08], [0.016, -0.08], [0.016, 0.014], [0, 0.014]], 'zinc', { seg: 14, pos: [PB[0], yT, PB[2]] }),
  ), [0, 0.4, 0]);
  P('1', group(
    merged([
      lathe([[0, -0.6], [0.008, -0.6], [0.008, 0], [0, 0]], 'steel', { seg: 12 }),
      at(S.ball(0.014, 'steel'), [0, -0.35, 0]),
    ], 'steel'),
    merged([H_.R.hexY(u(1.0), 0.012, 0.012), lathe([[0, 0.024], [0.011, 0.024], [0.011, 0.06], [0, 0.06]], 'zinc', { seg: 14 })], 'zinc'),
    merged([box(0.028, 0.028, 0.028, 'plastic', { r: 0.003, pos: [0, 0.075, 0] }), box(0.012, 0.012, 0.03, 'plastic', { pos: [0.018, 0.075, 0] })], 'plastic'),
  ).translateX(PS[0]).translateY(yT).translateZ(PS[2]), [0, 0.45, 0]);
  const gd = prism(S, THREE, [[-0.05, 0], [0.05, 0], [0.05, 0.11], [0.044, 0.116], [-0.044, 0.116], [-0.05, 0.11]], 0.12, M, 'xy', 0, { polys: [[[-0.044, 0.01], [-0.044, 0.106], [0.044, 0.106], [0.044, 0.01]]] });
  const guard = group(gd, box(0.1, 0.006, 0.12, M, { pos: [0, 0.113, 0] }));
  guard.position.set(PS[0] + 0.0, yT, PS[2] - 0.02);
  P('9', guard, [0, 0.55, 0]);
  for (const dx of [-0.047, 0.047]) {
    const p = [PS[0] + dx, yT + 0.006, PS[2] + 0.025];
    P('12', H_.bolt(0.375, 1.25, p, [0, 1, 0], { light: true }), [0, 0.62, 0]);
    P('16', H_.washer(0.375, [p[0], yT, p[2] - 0.06], [0, 1, 0], 'nl'), [0, 0.6, 0]);
  }

  // ---------------------------------------------------------------- 2 — voyants à bille (×3) ; 10 — bouchon de vidange
  for (const y of [0.25, 0.42, 0.59]) {
    const sg = group(
      merged([H_.R.hexY(u(1.5), 0, 0.012), lathe([[0, 0.012], [0.024, 0.012], [0.024, 0.016], [0, 0.016]], 'zinc', { seg: 18 })], 'zinc'),
      lathe([[0, 0.016], [0.019, 0.016], [0.019, 0.024], [0.012, 0.03], [0, 0.031]], 'glass', { seg: 18 }),
      at(S.ball(0.007, 'red'), [0, 0.022, -0.004]),
      lathe([[0.019, 0.016], [0.024, 0.016], [0.024, 0.022], [0.019, 0.026]], 'zinc', { seg: 18 }),
    );
    sg.rotation.x = -Math.PI / 2; // +Y → −Z
    sg.position.set(0, y, -W / 2 - 0.01);
    P('2', sg, [0, 0, -0.12]);
  }
  const plug = group(
    lathe([[u(0.3), 0.0004], [u(0.66), 0.0004], [u(0.62), -0.006], [u(0.3), -0.006]], 'blackCast', { seg: 18 }),
    lathe([[0, -0.007], [u(0.3), -0.007], [u(0.3), 0.0004], [0, 0.0004]], 'blackCast', { seg: 6 }),
  );
  plug.rotation.x = -Math.PI / 2;
  plug.position.set(0.06, 0.05, -W / 2 - 0.01);
  P('10', plug, [0, 0, -0.1]);

  // ---------------------------------------------------------------- 7 — équerres ; 8 — plaque de traversée ; 13/17, 14/15/18
  const { px, pz } = BULK;
  const tb = BULK.t;
  const yTop = BULK.y[0] + 0.03, yBot = BULK.y[15] - 0.03;
  // 8 — plaque (plan Y-Z, épaisseur X), deux colonnes décalées, pattes d'extrémité.
  const holes = BULK.dash.map((dash, k) => [pz + BULK.col(k), BULK.y[k], (H_.JIC[dash].t * 0.0254) / 2 + 0.001]);
  const plate8 = prism(S, THREE, [[pz - 0.035, yBot], [pz + 0.035, yBot], [pz + 0.035, yTop], [pz - 0.035, yTop]], tb, M, 'zy', px + tb / 2, { holes });
  const tabs8 = [yBot - 0.03, yTop + 0.03].map((y) => prism(S, THREE, [[pz - 0.02, y - 0.03], [pz + 0.02, y - 0.03], [pz + 0.02, y + 0.03], [pz - 0.02, y + 0.03]], tb, M, 'zy', px + tb / 2, { holes: [[pz, y - 0.012, 0.007], [pz, y + 0.016, 0.007]] }));
  P('8', merged([plate8, ...tabs8], M), [-0.12, 0, 0.05]);
  // 7 — équerres pliées : aile vissée sur la face +Z du corps, aile portant la patte de la plaque.
  for (const y of [yBot - 0.03, yTop + 0.03]) {
    const sgn = y > 0.4 ? 1 : -1;
    const eq = merged([
      box(0.006, 0.07, 0.05, M, { pos: [px + tb + 0.003, y, pz] }),
      box(xr - px - tb + 0.045, 0.07, 0.006, M, { pos: [(px + tb + xr + 0.045) / 2, y, W / 2 + 0.003] }),
    ], M);
    P('7', eq, [-0.06, sgn * 0.06, 0.06]);
    for (const dy of [-0.018, 0.018]) {
      // 13 + 17 : aile → corps (vis vers −Z, tête dehors).
      const pT = [xr + 0.022, y + dy, W / 2 + 0.006];
      P('17', H_.washer(0.5, pT, [0, 0, 1], 'nl'), [0, 0, 0.1]);
      P('13', H_.bolt(0.5, 1.0, [pT[0], pT[1], pT[2] + H_.wT(0.5, 'nl')], [0, 0, 1], { light: true }), [0, 0, 0.16]);
    }
    for (const dy of [-0.012, 0.016]) {
      // 14 + 15 (×2) + 18 : patte de la plaque → aile de l'équerre (vis selon X).
      const yy = y + (y > 0.4 ? dy : dy);
      const pH = [px, yy, pz];
      P('15', H_.washer(0.5, pH, [-1, 0, 0]), [-0.14, 0, 0]);
      P('14', H_.bolt(0.5, 1.5, [px - H_.wT(0.5), yy, pz], [-1, 0, 0], { light: true }), [-0.2, 0, 0]);
      const pN = [px + tb + 0.006, yy, pz];
      P('15', H_.washer(0.5, pN, [1, 0, 0]), [0.06, 0, 0]);
      P('18', H_.nut(0.5, [pN[0] + H_.wT(0.5), yy, pz], [1, 0, 0]), [0.1, 0, 0]);
    }
  }
  return { view: { dir: [-1, 0.7, 1.1] } };
}

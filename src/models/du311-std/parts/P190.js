// P190 — Réservoir d'air « ASSY, DU311 RECEIVER TANK » CX033000 rév. 0 (page
// 190 : vue éclatée, vue de face et vue en bout). Réservoir 14 × 30 po, 17
// gal (3) à fonds elliptiques, couché sur un berceau en tôle pliée (4) et
// serré par deux colliers en feuillard (5 ; vis H 1/2 × 1 3/4, 15, rondelles
// 16, écrous 17, deux par extrémité de collier). Sur le dessus, deux brides
// adaptatrices 2 po NPTF → 2 po code 61 (1) avec leurs demi-brides et vis
// (6, trousses de bride fendue) pour les flexibles d'air (P188 rep. 15 et
// 16), et deux bouchons 1/2 (9) ; au fond +Z, coude mâle-femelle 90° 2 po
// (8), réduction 2 × 1 po (7), soupape de sûreté 450 psi (2) et coude 45°
// 1 1/2 po (13) en sortie ; deux mamelons 2 po (14) sous les brides ; en
// partie basse, bouchons 3/4 (10) et 1 po (11) ; fond −Z, bouchon 2 po (12).
// Les orifices avant bas (1/2 et 3/4) reçoivent la purge et l'adaptateur de
// P188.
// Repère : origine au centre du réservoir, axe du réservoir selon Z, Y vers
// le haut, X vers l'avant (P188 le pose en TANK, axes de la machine).
// Encombrement ≈ 0.40 (X) × 0.50 (Y) × 0.97 (Z) m.

import { IN, u, L, hexPrism, along, frame, hhcs, hexNut, washerD, hexPlug } from './_slide.js';

export const T190 = {
  R: 7 * IN, L: 30 * IN, cyl: 0.30, // rayon, longueur hors tout, demi-longueur de la virole
  flanges: [[-0.2, 'A'], [-0.05, 'B']], // brides 2 po sur le dessus (z)
  flangeTop: 7 * IN + 0.112, // face des brides code 61 (y)
  drain12: [0.25], drain34: [0.25], // orifices avant bas (z) : 1/2 à −z, 3/4 à +z
  cradleY: -7 * IN - 0.07, // dessous du berceau
};

export default function P190(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, merged, group, at, weld } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const put = (obj, p, dir) => along(THREE, obj, dir, p);
  const R = T190.R, ZC = T190.cyl, ZH = T190.L / 2;
  const PAINT = 'grey';

  // 3 — réservoir : virole et fonds elliptiques 2:1 (profil de révolution autour de Z), cordons circulaires,
  // manchons soudés des orifices, plaque signalétique
  const prof = [[0, -ZH]];
  for (let i = 1; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); prof.push([R * Math.sin(a), -ZC - (ZH - ZC) * Math.cos(a)]); }
  prof.push([R, ZC]);
  for (let i = 1; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); prof.push([R * Math.cos(a), ZC + (ZH - ZC) * Math.sin(a)]); }
  const shell = lathe(prof, PAINT, { axis: 'z', seg: 48 });
  const boss = (p, dir, r, h) => put(cyl(r, h, PAINT, { seg: 16 }), p, dir);
  const top = (z) => [0, R + 0.004, z];
  const bosses = [
    ...T190.flanges.map(([z]) => boss(top(z), [0, 1, 0], 1.45 * IN, 0.02)),
    boss(top(0.12), [0, 1, 0], 0.55 * IN, 0.012), boss(top(0.22), [0, 1, 0], 0.55 * IN, 0.012),
    boss([0, 0, ZH - 0.004], [0, 0, 1], 1.45 * IN, 0.016), boss([0, 0, -ZH + 0.004], [0, 0, -1], 1.45 * IN, 0.016),
    boss([0, -R - 0.002, 0.1], [0, -1, 0], 0.7 * IN, 0.012), boss([0, -R - 0.002, -0.1], [0, -1, 0], 0.85 * IN, 0.012),
    boss([R * 0.707, -R * 0.707, -0.25], [0.707, -0.707, 0], 0.55 * IN, 0.012), boss([R * 0.707, -R * 0.707, 0.25], [0.707, -0.707, 0], 0.7 * IN, 0.012),
  ];
  const seams = [S.weldRing(R + 0.001, 0.006, PAINT, { axis: 'z', pos: [0, 0, ZC] }), S.weldRing(R + 0.001, 0.006, PAINT, { axis: 'z', pos: [0, 0, -ZC] })];
  P('3', group(merged([shell, ...bosses], PAINT), merged(seams, PAINT), at(S.nameplate(0.07, 0.045), [R * 0.6, R * 0.8, 0.0], [-Math.PI / 4, Math.PI / 2, 0])), [0, 0.2, 0]);

  // 4 — berceau : semelle (posée sur les plats de P180, z ±0.39), deux selles cintrées (z ±0.22) à pattes des colliers, goussets
  const ys = T190.cradleY;
  const saddles = [];
  for (const z of [-0.22, 0.22]) {
    const pts = [[-0.17, ys + 0.008], [0.17, ys + 0.008], [0.17, -0.06]];
    for (let i = 0; i <= 16; i++) { const a = -0.25 * Math.PI + (i / 16) * -0.5 * Math.PI; pts.push([Math.cos(a) * (R + 0.002), Math.sin(a) * (R + 0.002)]); }
    pts.push([-0.17, -0.06]);
    const m = S.extrude(pts.reverse(), 0.01, PAINT);
    m.position.z = z;
    saddles.push(m);
    // pattes horizontales des colliers (deux trous chacune), de part et d'autre
    for (const s of [-1, 1]) saddles.push(at(box(0.06, 0.01, 0.05, PAINT), [s * (R + 0.035), -0.055, z]));
  }
  P('4', group(merged([at(box(0.36, 0.008, 0.86, PAINT, { r: 0.003 }), [0, ys + 0.004, 0]), ...saddles], PAINT)), [0, -0.2, 0]);

  // 5 — colliers en feuillard 50 × 6 : demi-cercle supérieur et pattes, 15 + 16 + 17 (deux par patte)
  for (const z of [-0.22, 0.22]) {
    const pts = [];
    const r0 = R + 0.001, r1 = R + 0.007;
    for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI; pts.push([Math.cos(a) * r1, Math.sin(a) * r1]); }
    for (let i = 24; i >= 0; i--) { const a = (i / 24) * Math.PI; pts.push([Math.cos(a) * r0, Math.sin(a) * r0]); }
    const band = S.extrude(pts, 0.05, 'zinc');
    const ears = [-1, 1].map((s) => at(box(0.05, 0.006, 0.05, 'zinc'), [s * (R + 0.032), -0.047, 0]));
    const legs = [-1, 1].map((s) => at(box(0.006, 0.047, 0.05, 'zinc'), [s * (R + 0.004), -0.0235, 0]));
    P('5', at(group(merged([band, ...ears, ...legs], 'zinc')), [0, 0, z]), [0, 0.25, 0]);
    for (const s of [-1, 1]) for (const dz of [-0.013, 0.013]) {
      const p = [s * (R + 0.04), -0.044, z + dz];
      P('16', at(washerD(S, 0.5 * IN, 'zinc', { od: 1.06 * IN, t: 0.1 * IN }), p), [0, 0.3, 0]);
      P('15', at(hhcs(S, THREE, 0.5, 1.75), [p[0], p[1] + 0.1 * IN, p[2]]), [0, 0.35, 0]);
      P('17', put(hexNut(S, THREE, 0.5), [p[0], -0.06 - 0.0005, p[2]], [0, -1, 0]), [0, -0.3, 0]);
    }
  }

  // 14 — mamelons 2 po courts, 1 — brides adaptatrices NPTF → code 61, 6 — demi-brides et vis
  for (const [z] of T190.flanges) {
    const y0 = R + 0.024;
    P('14', at(L(S, [[0, -0.6], ...S.thread(1.19, -0.6, 0.2, { pitch: 0.087, maxTurns: 6 }), [1.19, 0.6], ...S.thread(1.19, 0.6, 1.4, { pitch: 0.087, maxTurns: 6, chamferBottom: false }).slice(1), [0, 1.4]], 'steel', 20), [0, y0, z]), [0, 0.3, 0]);
    // corps : six-pans 3 po, col, tête de bride code 61 (Ø 3.06, épaulement)
    const fy = y0 + u(0.8);
    P('1', at(merged([
      hexPrism(S, THREE, 3.0, 0.9, 0, 1.0, 'steel'),
      L(S, [[1.0, 0.9], [1.35, 0.9], [1.35, 1.5], [1.53, 1.5], [1.53, 1.85], [1.0, 1.85], [1.0, 0.9]], 'steel', 32),
    ], 'steel'), [0, fy, z]), [0, 0.38, 0]);
    // 6 — deux demi-brides 2 po code 61 (4 vis 1/2 × 1 3/4) posées sur l'épaulement
    const yfl = fy + u(1.5);
    const halves = [-1, 1].map((s) => at(box(u(1.6), u(0.62), u(4.0), 'zinc', { r: u(0.1) }), [s * u(0.85), yfl + u(0.31), 0]));
    const bolts = [-1, 1].flatMap((s) => [-1, 1].map((k) => at(hhcs(S, THREE, 0.5, 1.75), [s * u(0.85), yfl + u(0.62), k * u(1.6)])));
    P('6', at(group(merged(halves, 'zinc'), merged(bolts, 'zinc')), [0, 0, z]), [0, 0.5, 0]);
  }

  // Fond +Z : 8 — coude 90° 2 po (vers l'avant), 7 — réduction 2 × 1, 2 — soupape 450 psi, 13 — coude 45° 1 1/2
  {
    const zE = ZH + 0.012;
    const el = group(
      L(S, [[0, -0.7], ...S.thread(1.19, -0.7, 0, { r1: 1.25, pitch: 0.087, maxTurns: 5 }), [1.4, 0], [1.4, 1.4], [0, 1.4]], 'castIron', 20),
      at(L(S, [[0, 0], [1.4, 0], [1.4, 1.6], [1.5, 1.6], [1.5, 2.0], [0, 2.0]], 'castIron', 20), [0, u(1.4), 0], [0, 0, -Math.PI / 2]),
      at(S.ball(u(1.45), 'castIron'), [0, u(1.4), 0]),
    );
    P('8', frame(THREE, el, [0, 0, zE], [0, 1, 0], [0, 0, 1], [1, 0, 0]), [0.05, 0, 0.15]);
    const xb = u(1.4 + 2.0);
    P('7', frame(THREE, merged([hexPrism(S, THREE, 2.6, 0.6, 0, 0.55, 'steel'), L(S, [[0, -0.7], ...S.thread(1.19, -0.7, 0, { r1: 1.25, pitch: 0.087, maxTurns: 5 }), [0, 0]], 'steel', 20)], 'steel'), [xb, 0, zE + u(1.4)], [0, 1, 0], [1, 0, 0], [0, 0, -1]), [0.15, 0, 0.15]);
    // soupape : corps laiton, ressort sous capot, anneau de levée
    const relief = group(
      merged([hexPrism(S, THREE, 1.625, 0.55, 0, 0, 'brass'), L(S, [[0, -0.6], ...S.thread(0.66, -0.6, 0, { r1: 0.7, pitch: 0.07, maxTurns: 4 }), [0, 0]], 'brass', 16),
        L(S, [[0, 0.55], [0.95, 0.55], [1.05, 0.9], [1.05, 1.5], [0.7, 1.7], [0.7, 3.2], [0.55, 3.35], [0, 3.35]], 'brass', 24),
        at(L(S, [[0, 0], [0.75, 0], [0.75, 1.0], [0, 1.0]], 'brass', 16), [0, u(1.2), 0], [0, 0, -Math.PI / 2])], 'brass'),
      at(S.torus(u(0.35), u(0.05), 'steel'), [0, u(3.55), 0], [Math.PI / 2, 0, 0]),
    );
    const xr = xb + u(0.6);
    P('2', frame(THREE, relief, [xr, 0, zE + u(1.4)], [0, 0, 1], [1, 0, 0], [0, -1, 0]), [0.25, 0, 0.15]);
    const el45 = group(
      L(S, [[0, -0.6], ...S.thread(0.95, -0.6, 0, { r1: 1.0, pitch: 0.08, maxTurns: 4 }), [1.1, 0], [1.1, 0.8], [0, 0.8]], 'castIron', 18),
      at(L(S, [[0, 0], [1.1, 0], [1.1, 0.9], [1.2, 0.9], [1.2, 1.2], [0, 1.2]], 'castIron', 18), [0, u(0.6), 0], [0, 0, -Math.PI / 4]),
    );
    P('13', frame(THREE, el45, [xr + u(1.2), 0, zE + u(1.4) + u(1.6)], [0, -1, 0], [0, 0, 1], [-1, 0, 0]), [0.25, 0, 0.25]);
  }
  // Bouchons : 9 (1/2) ×2 dessus, 10 (3/4) ×2 et 11 (1) dessous, 12 (2) fond −Z
  P('9', put(hexPlug(S, THREE, 8), top(0.12).map((v, i) => v + (i === 1 ? 0.012 : 0)), [0, 1, 0]), [0, 0.2, 0]);
  P('9', put(hexPlug(S, THREE, 8), top(0.22).map((v, i) => v + (i === 1 ? 0.012 : 0)), [0, 1, 0]), [0, 0.2, 0]);
  P('10', put(hexPlug(S, THREE, 12), [0, -R - 0.014, 0.1], [0, -1, 0]), [0, -0.2, 0]);
  P('10', put(hexPlug(S, THREE, 12), [R * 0.6, -R * 0.6, -0.12], [0.6, -0.8, 0]), [0.1, -0.2, 0]);
  P('11', put(hexPlug(S, THREE, 16), [0, -R - 0.014, -0.1], [0, -1, 0]), [0, -0.2, 0]);
  P('12', put(hexPlug(S, THREE, 32), [0, 0, -ZH - 0.016], [0, 0, -1]), [0, 0, -0.2]);
  void weld;
  return { view: { dir: [1, 0.6, 1] } };
}

// P028 — Avance 6 pi avec carrousel (« CLTR ASSY, FEED ») : mât 6 pi (P058),
// plaque porte-tête (P062) et tête de rotation RH6230 ME12 (P050, modélisée),
// vérin d'avance, vérins stinger 6 pi, centreur fixe, plaque à coins, cadre de
// montage du carrousel avec ses barres de guidage (qui coulissent dans le MCP),
// carrousel de 17 tiges Ø 3,5 po, bras de serrage, boyaux et vannes, en formes
// simplifiées d'après les vues des pages 28, 30, 58 et 108.
// Repère de l'avance : axe du mât selon +Y (pied à y = 0), face avant (côté
// tête de rotation) vers +Z, carrousel du côté +X. L'axe de forage passe à
// z = AX devant la plaque porte-tête.

import { body, ram, flex } from './layout.js';

export const FEED = {
  L: 3.0, W: 0.4, D: 0.32, // mât
  AX: 0.505, // axe de forage
  tdY: 2.35, // tête de rotation (sur les trous les plus bas de la plaque)
  car: { x: 0.62, z: 0.12, r: 0.34, rp: 0.27, y0: 0.45, y1: 2.62 },
  frame: { xc: 0.35, z0: -0.16, z1: -0.3, y0: 0.35, y1: 2.65, bar: 0.265 },
  // arbre des bras de serrage (x, z), haut de l'arbre, hauteurs des deux bras
  clamp: { x: 0.38, z: 0.55, top: 1.92, arms: [0.85, 1.75] },
  // vérins stinger (x, z) et dessous de leurs patins bas
  stingers: [[-0.32, -0.02], [1.02, -0.17]],
  stingerFoot: -0.255,
};

// Point de transfert : alvéole du carrousel atteinte par le bout des bras de
// serrage (intersection du cercle des alvéoles et du cercle décrit par les bras),
// du côté du mât. Les plaques sont dessinées avec leur première alvéole à ce point.
{
  const { car: C, clamp: K, AX } = FEED;
  const arm = Math.hypot(K.x, AX - K.z);
  const dx = C.x - K.x, dz = C.z - K.z, d = Math.hypot(dx, dz);
  const a = (arm * arm - C.rp * C.rp + d * d) / (2 * d), h = Math.sqrt(arm * arm - a * a);
  const bx = K.x + (a * dx) / d, bz = K.z + (a * dz) / d;
  const cands = [[bx - (h * dz) / d, bz + (h * dx) / d], [bx + (h * dz) / d, bz - (h * dx) / d]];
  FEED.transfer = cands.reduce((m, c) => (c[0] < m[0] ? c : m));
  // angle des alvéoles dans le plan des plaques (sens des rotations autour de +Y)
  FEED.pocketA0 = Math.atan2(-(FEED.transfer[1] - C.z), FEED.transfer[0] - C.x);
}

export function P028(api) {
  const { box, cyl, ring, tube, fitting, valveBank, extrude, hydCylinder, plate, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { L, W, D, AX, tdY, car: C, frame: F } = FEED;
  const IN = 0.0254;
  const hw = W / 2, hd = D / 2;

  // Disque horizontal (plaque du carrousel) percé de 17 alvéoles et d'un alésage central.
  const disc = (r, t, holeR, mat, { pockets = true } = {}) => {
    const pts = Array.from({ length: 64 }, (_, i) => {
      const a = (i / 64) * Math.PI * 2;
      return [Math.cos(a) * r, Math.sin(a) * r];
    });
    const holes = [[0, 0, 0.055]];
    if (pockets) for (let i = 0; i < 17; i++) {
      const a = (i / 17) * Math.PI * 2 + FEED.pocketA0;
      holes.push([Math.cos(a) * C.rp, Math.sin(a) * C.rp, holeR]);
    }
    const m = extrude(pts, t, mat, { holes });
    m.rotation.x = -Math.PI / 2;
    return m;
  };

  // 5 — avance 6 pi : caisson du mât (dos, flancs, semelles avant), barres de guidage avant,
  // chapeau et pied à oreilles
  P('5', group(
    at(box(W, L, 0.02, 'lightGrey'), [0, L / 2, -hd + 0.01]),
    ...[1, -1].map((s) => at(box(0.02, L, D, 'lightGrey'), [s * (hw - 0.01), L / 2, 0])),
    ...[1, -1].map((s) => at(box(0.09, L, 0.02, 'lightGrey'), [s * (hw - 0.045), L / 2, hd - 0.01])),
    ...[1, -1].map((s) => at(box(0.03, L - 0.1, 0.05, 'darkSteel'), [s * (hw - 0.015), L / 2, hd + 0.025])),
    at(box(W + 0.06, 0.05, D + 0.06, 'lightGrey'), [0, L + 0.025, 0]),
    at(box(W + 0.1, 0.06, D + 0.1, 'lightGrey'), [0, 0.03, 0]),
    ...[1, -1].map((s) => at(box(0.08, 0.1, 0.14, 'lightGrey', { r: 0.02 }), [s * (hw + 0.06), 0.08, -0.04])),
    ...[0.45, 0.95, 1.45, 1.95, 2.45].flatMap((y) => [1, -1].map((s) => at(box(0.004, 0.16, 0.05, 'darkSteel'), [s * (hw + 0.002), y, 0.02]))),
  ), [0, 0, -0.5]);

  // 9 — vérin d'avance 6 pi dans le canal avant (fût en bas, tige vers la plaque porte-tête)
  P('9', group(
    at(cyl(0.065, 1.9, 'black', { seg: 32 }), [0, 1.05, 0.06]),
    at(cyl(0.075, 0.06, 'darkSteel', { seg: 32 }), [0, 2.0, 0.06]),
    body('feed', at(cyl(0.04, 0.42, 'chrome'), [0, 2.2, 0.06])),
    at(cyl(0.075, 0.06, 'darkSteel', { seg: 32 }), [0, 0.12, 0.06]),
  ), [0, 0, 0.35]);

  // 6 — plaque porte-tête : plaque, boîtiers de glissières sur les barres, tourillons du vérin
  const H = 26.5 * IN;
  P('6', body('feed', group(
    at(box(0.56, H, 0.04, 'grey'), [0, tdY - 0.05, 0.25]),
    ...[1, -1].map((s) => at(box(0.06, H, 0.09, 'grey'), [s * (hw - 0.015), tdY - 0.05, 0.19])),
    ...[1, -1].map((s) => at(box(0.012, H - 0.04, 0.06, 'white'), [s * (hw - 0.038), tdY - 0.05, 0.19])),
    at(box(0.16, 0.12, 0.1, 'grey'), [0, tdY - 0.15, 0.17]),
    at(cyl(0.025, 0.2, 'steel', { axis: 'x' }), [0, tdY - 0.15, 0.17]),
    ...[[-0.2, 0.25], [0.2, 0.25], [-0.2, -0.32], [0.2, -0.32]].map(([x, dy]) => at(box(0.1, 0.12, 0.015, 'grey'), [x, tdY + dy, 0.278])),
  )), [0, 0, 0.6]);
  // 4 — tête de rotation RH6230-A-SP ME12-SS #24 (bride arrière contre la plaque)
  P('4', body('feed', at(api.sub('P050'), [0, tdY, AX])), [0, 0.3, 1.1]);

  // Pied de l'avance : 1 centreur fixe, 3 mâchoires Ø 3,5 po, 2 plaque à coins et son vérin
  P('1', group(
    ...[1, -1].map((s) => at(box(0.05, 0.14, AX - hd + 0.05, 'grey'), [s * 0.15, -0.04, (AX + hd) / 2])),
    at(ring(0.17, 0.095, 0.14, 'grey', { seg: 40 }), [0, -0.04, AX]),
    at(box(0.36, 0.03, 0.16, 'grey'), [0, -0.1, hd + 0.08]),
    ...[1, -1].map((s) => at(cyl(0.03, 0.2, 'black', { axis: 'x' }), [s * 0.24, -0.04, AX - 0.06])),
  ), [0, -0.3, 0.6]);
  P('3', ring(0.095, 0.05, 0.12, 'darkSteel', { seg: 32, pos: [0, -0.04, AX] }), [0, -0.5, 0.8]);
  // (la plaque et sa chape coulissent vers -X pour libérer l'axe : corps « slip »)
  P('2', group(
    body('slip', at(plate(0.34, 0.34, 0.03, 'grey', { cutouts: [[0, 0.05, 0.08, 0.2]], r: 0.02 }), [0, 0.11, AX])),
    ram('slip', 'ext', 'slip', at(hydCylinder(0.53, 0.05, { material: 'black', ext: 0.4 }), [-0.75, 0.11, AX])),
    body('slip', at(box(0.06, 0.06, 0.08, 'grey'), [-0.2, 0.11, AX])),
    at(box(0.62, 0.03, 0.06, 'grey'), [-0.46, 0.065, AX - 0.08]),
  ), [-0.3, 0, 0.7]);
  // 10 — clapet de retenue de charge, 15 — collecteur des centreurs, 16 — raccords rapides 1/4 po
  P('10', at(box(0.1, 0.12, 0.08, 'steel', { r: 0.005 }), [0.08, 0.2, -hd - 0.05]), [0, -0.2, -0.4]);
  P('15', at(box(0.14, 0.1, 0.07, 'steel', { r: 0.005 }), [-0.1, 0.22, -hd - 0.045]), [0, -0.15, -0.45]);
  P('16', group(
    ...[-0.04, 0.04].map((dx) => at(fitting(0.014, 0.035, 'brass', { axis: 'z' }), [-0.1 + dx, 0.15, -hd - 0.06], [Math.PI, 0, 0])),
  ), [0, -0.3, -0.5]);

  // 7 — vérins stinger 6 pi (Ø 3,5 po, double tige, patins aux deux bouts, clapets d'équilibrage)
  const stinger = () => group(
    at(cyl(0.056, 2.4, 'black', { seg: 32 }), [0, 1.5, 0]),
    ...[0.3, 2.7].map((y) => at(ring(0.066, 0.03, 0.06, 'darkSteel'), [0, y, 0])),
    // tiges (assez longues pour rester dans le fût en extension) et patins
    body('stingUp', group(at(cyl(0.032, 1.0, 'chrome'), [0, 2.7, 0]), at(cyl(0.058, 0.07, 'darkSteel'), [0, 3.22, 0]))),
    body('stingDn', group(at(cyl(0.032, 1.0, 'chrome'), [0, 0.3, 0]), at(cyl(0.058, 0.07, 'darkSteel'), [0, -0.22, 0]))),
    ...[0.42, 2.58].map((y) => at(box(0.06, 0.1, 0.07, 'blue', { r: 0.005 }), [0, y, 0.08])),
  );
  const [SA, SB] = FEED.stingers;
  P('7', at(stinger(), [SA[0], 0, SA[1]]), [-0.6, 0, 0]);
  P('7', at(stinger(), [SB[0], 0, SB[1]]), [0.6, 0, 0]);
  // 8 — jeu de supports des stinger (collier sur le vérin, bras vers le mât ou le cadre)
  const collar = (sx, sz, y, toX) => {
    const x0 = sx + Math.sign(toX - sx) * 0.06;
    return group(
      at(ring(0.085, 0.056, 0.08, 'grey'), [sx, y, sz]),
      at(box(Math.abs(toX - x0), 0.06, 0.08, 'grey'), [(x0 + toX) / 2, y, sz]),
    );
  };
  P('8', group(...[0.6, 1.6, 2.6].map((y) => collar(SA[0], SA[1], y, -hw))), [-0.35, 0, 0]);
  P('8', group(...[0.6, 2.5].map((y) => collar(SB[0], SB[1], y, C.x + 0.3))), [0.35, 0, 0]);

  // 17 — cadre de montage du carrousel : panneau ajouré derrière le mât et le carrousel,
  // barres de guidage 6 pi (coulissent dans le MCP), bras haut et bas, chape du vérin d'extension
  const fh = F.y1 - F.y0, fw = 0.72;
  const back = plate(fw, fh, 0.02, 'lightGrey', { cutouts: [[0, -0.55, 0.36, 0.7], [0, 0.45, 0.36, 0.8]] });
  P('17', group(
    at(back, [F.xc, (F.y0 + F.y1) / 2, F.z1 + 0.01], [Math.PI / 2, 0, 0]),
    ...[1, -1].map((s) => at(box(0.02, fh, F.z0 - F.z1, 'lightGrey'), [F.xc + s * (fw / 2 - 0.01), (F.y0 + F.y1) / 2, (F.z0 + F.z1) / 2])),
    ...[F.y0 + 0.03, F.y1 - 0.03].map((y) => at(box(C.x + 0.36 - (F.xc - fw / 2), 0.06, F.z0 - F.z1, 'lightGrey'), [(F.xc - fw / 2 + C.x + 0.36) / 2, y, (F.z0 + F.z1) / 2])),
    ...[1, -1].map((s) => at(box(0.03, 1.83, 0.14, 'darkSteel'), [F.xc + s * F.bar, 1.42, F.z1 - 0.07])),
    at(box(0.12, 0.12, 0.12, 'lightGrey'), [F.xc, 0.47, F.z1 - 0.06]),
    at(cyl(0.025, 0.16, 'steel', { axis: 'x' }), [F.xc, 0.47, F.z1 - 0.09]),
    ...[1, -1].map((s) => at(box(0.05, 0.3, 0.02, 'lightGrey'), [F.xc + s * 0.14, 0.45, F.z1 - 0.02])),
  ), [0, 0, -0.55]);
  // 18 — support latéral du mât (côté gauche du cadre), collier de boyau Ø 3,75 po
  P('18', group(
    at(box(0.04, 0.6, 0.18, 'grey'), [hw + 0.02, 1.4, -0.07]),
    at(box(0.12, 0.6, 0.02, 'grey'), [hw + 0.06, 1.4, F.z0 - 0.01]),
    at(ring(0.06, 0.048, 0.05, 'grey', { axis: 'x' }), [hw + 0.07, 1.9, 0.05]),
  ), [0.25, 0, 0]);

  // 22 — carrousel 17 tiges : arbre central, plaques à alvéoles haute et basse, mécanisme
  // d'indexage, cadre arrière, arbre des bras de serrage et ses deux bras
  const PIV = [FEED.clamp.x, FEED.clamp.z], PIV_TOP = FEED.clamp.top;
  const armDir = [-PIV[0], AX - PIV[1]];
  const armLen = Math.hypot(...armDir);
  // Plat horizontal entre deux points (x, z) à la hauteur y.
  const link = (a, b, y, w, h) => {
    const dx = b[0] - a[0], dz = b[1] - a[1];
    return at(box(Math.hypot(dx, dz), h, w, 'lightGrey'), [(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2], [0, Math.atan2(-dz, dx), 0]);
  };
  const arm = (y) => {
    const g = group(
      at(box(armLen, 0.06, 0.07, 'grey'), [armLen / 2, 0, 0]),
      at(ring(0.06, 0.04, 0.08, 'grey'), [0, 0, 0]),
      at(hydCylinder(0.26, 0.05, { material: 'black' }), [0.05, 0.07, 0.08]),
    );
    g.position.set(PIV[0], y, PIV[1]);
    g.rotation.y = -Math.atan2(armDir[1], armDir[0]);
    return body('clamp', g);
  };
  P('22', group(
    // partie tournante (corps « carousel ») : arbre, plaques à alvéoles, moyeux
    body('carousel', group(
      at(cyl(0.05, C.y1 - C.y0 + 0.2, 'steel'), [C.x, (C.y0 + C.y1) / 2, C.z]),
      at(disc(C.r, 0.02, 0.05, 'grey'), [C.x, C.y1 - 0.08, C.z]),
      at(disc(C.r, 0.02, 0.05, 'grey'), [C.x, C.y0 + 0.14, C.z]),
      at(ring(0.1, 0.05, 0.08, 'darkSteel'), [C.x, C.y1 - 0.12, C.z]),
      at(ring(0.1, 0.05, 0.08, 'darkSteel'), [C.x, C.y0 + 0.18, C.z]),
    )),
    at(hydCylinder(0.28, 0.05, { material: 'black' }), [C.x - 0.02, C.y1 + 0.04, C.z + 0.25]),
    at(box(0.12, 0.08, 0.12, 'grey'), [C.x - 0.08, C.y1 + 0.04, C.z + 0.25]),
    // cadre rectangulaire du carrousel (montants arrière, paliers de l'arbre)
    ...[-0.28, 0.28].map((dx) => at(box(0.05, C.y1 - C.y0 + 0.1, 0.05, 'lightGrey'), [C.x + dx, (C.y0 + C.y1) / 2, F.z0 - 0.03])),
    ...[C.y0 - 0.02, C.y1 + 0.02].map((y) => at(box(0.12, 0.06, C.z - F.z0 + 0.06, 'lightGrey'), [C.x, y, (C.z + F.z0) / 2])),
    // arbre des bras de serrage (entre l'axe de forage et le carrousel, sous la tête)
    // et bras en position « à l'axe de forage »
    at(cyl(0.035, PIV_TOP - C.y0 + 0.02, 'steel'), [PIV[0], (C.y0 + PIV_TOP) / 2, PIV[1]]),
    link([C.x, C.z], PIV, C.y0 + 0.02, 0.1, 0.05),
    link([hw, 0.1], PIV, PIV_TOP - 0.03, 0.1, 0.05),
    ...FEED.clamp.arms.map(arm),
  ), [0.75, 0, 0]);
  // 11 — rampe des tiges (plaque d'appui sous les alvéoles, rebord vers l'axe de forage)
  P('11', group(
    at(disc(C.r + 0.02, 0.015, 0, 'darkSteel', { pockets: false }), [C.x, C.y0 + 0.03, C.z]),
    at(box(0.22, 0.012, 0.16, 'darkSteel'), [C.x - 0.33, C.y0 + 0.035, C.z + 0.2], [0, 0.6, 0]),
  ), [0.75, -0.25, 0]);
  // 14 — guides de tiges (deux plaques à alvéoles à mi-hauteur)
  P('14', body('carousel', group(
    at(disc(C.r - 0.01, 0.012, 0.052, 'grey'), [C.x, 1.3, C.z]),
    at(disc(C.r - 0.01, 0.012, 0.052, 'grey'), [C.x, 2.05, C.z]),
  )), [0.95, 0, 0]);
  // 13 — mâchoires des bras de serrage (Ø 3,5 po), au bout des deux bras
  P('13', body('clamp', group(
    ...FEED.clamp.arms.flatMap((y) => [1, -1].map((s) => at(box(0.05, 0.08, 0.025, 'darkSteel'), [s * 0.055, y, AX + 0.02]))),
    ...FEED.clamp.arms.map((y) => at(ring(0.07, 0.046, 0.08, 'darkSteel', { seg: 28 }), [0, y, AX])),
  )), [0, 0, 0.6]);
  // 24 — banc de vannes du carrousel (3 sections) sous son capot, sur le bras haut
  P('24', group(
    at(valveBank(3, { sw: 0.05, h: 0.12, d: 0.1 }), [C.x, C.y1 + 0.16, C.z - 0.2]),
    at(box(0.34, 0.012, 0.22, 'grey'), [C.x, C.y1 + 0.33, C.z - 0.2]),
    ...[1, -1].map((s) => at(box(0.012, 0.2, 0.22, 'grey'), [C.x + s * 0.17, C.y1 + 0.23, C.z - 0.2])),
  ), [0.3, 0.35, 0]);

  // 12 — capteur de longueur (boîtier sur le chapeau, câble le long du dos du mât)
  P('12', group(
    at(box(0.08, 0.12, 0.07, 'darkSteel', { r: 0.006 }), [-0.12, L + 0.11, -0.08]),
    at(cyl(0.012, 0.05, 'black'), [-0.12, L + 0.19, -0.08]),
    tube([[-0.12, L + 0.05, -0.12], [-0.17, L - 0.2, -hd - 0.01], [-0.17, 1.0, -hd - 0.01]], 0.005, 'black', { seg: 12 }),
  ), [0, 0.45, -0.3]);
  // 19 — arrêt d'urgence (boîtier et champignon sur le flanc du mât)
  P('19', group(
    at(box(0.06, 0.1, 0.08, 'safety', { r: 0.008 }), [-hw - 0.03, 0.85, 0.1]),
    at(cyl(0.022, 0.025, 'red', { axis: 'x' }), [-hw - 0.07, 0.85, 0.1]),
  ), [-0.4, 0, 0.2]);
  // 20 — butée de l'émerillon d'air
  P('20', body('feed', group(
    at(box(0.03, 0.2, 0.03, 'grey'), [-0.12, tdY + 0.38, AX - 0.13]),
    at(box(0.03, 0.03, 0.12, 'grey'), [-0.12, tdY + 0.47, AX - 0.08]),
  )), [-0.3, 0.3, 0]);
  // 21 — boucle de boyaux de la tête (4 flexibles et échelles porte-boyaux) : bout haut sur
  // la tête (corps « feed »), bout bas sur le flanc du mât, boucle entre les deux
  const loop = ['feed', 'feed', ['ext', 'feed', 0.6], ['ext', 'feed', 0.3], 'ext'];
  const hoses = [-0.03, -0.01, 0.01, 0.03].map((d) => flex(api.S, [
    [-0.2, tdY + 0.25, AX - 0.05 + d], [-0.5, tdY + 0.55, 0.3 + d], [-0.62, 2.2, 0.15 + d], [-0.55, 1.4, 0.08 + d], [-hw - 0.03, 1.15, 0.08 + d],
  ], loop, 0.012, 'black', { seg: 48 }));
  P('21', group(
    ...hoses,
    body(['ext', 'feed', 0.75], at(box(0.04, 0.025, 0.14, 'darkSteel'), [-0.6, 2.5, 0.2])),
    body(['ext', 'feed', 0.45], at(box(0.04, 0.025, 0.14, 'darkSteel'), [-0.6, 1.85, 0.11])),
  ), [-0.5, 0, 0.2]);
  // 23 — boyau d'air DTH 1,5 po : de l'émerillon, grande boucle côté gauche jusqu'au pied
  P('23', group(
    flex(api.S, [[0, tdY + 0.48, AX], [-0.15, tdY + 0.75, AX], [-0.55, 3.15, 0.45], [-0.78, 2.6, 0.35], [-0.72, 1.4, 0.2], [-0.5, 0.55, -0.05], [-0.42, 0.36, -0.14]],
      ['feed', 'feed', ['ext', 'feed', 0.8], ['ext', 'feed', 0.5], ['ext', 'feed', 0.25], 'ext', 'ext'], 0.03, 'black', { seg: 72 }),
    at(fitting(0.05, 0.07, 'steel'), [-0.42, 0.31, -0.14]),
  ), [-0.7, 0, 0.3]);
  return { view: { dir: [1.0, 0.45, 1.3] } };
}

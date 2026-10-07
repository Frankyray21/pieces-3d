// Mât 10 pi HH (P130) et ses sous-assemblages : vérin d'avance télescopique
// (P132), plaque porte-tête de rotation (P134), barre de guidage (P136).
// Repère du mât : axe du mât selon +Y (pied à y = 0), face avant (côté tête de
// rotation) vers +Z. Cotes reprises du manuel quand il les donne (mât 10 pi,
// glissières 26 1/2 po, boulonnerie), sinon proportions des dessins.

const IN = 0.0254;
export const MAST = {
  length: 3.05, // 10 pi
  width: 0.46,
  depth: 0.42,
  cylZ: 0.1, // axe du vérin dans le canal avant
  plateY: 2.42, // centre de la plaque porte-tête (tourillons du vérin)
  plateZ: 0.26, // plan médian de la plaque
};

// P136 — Barre de guidage : barre plate le long de +Y (0 → longueur), épaisseur
// selon X, boulons tête vers +X (vers l'extérieur du mât).
export const GUIDE = { length: 2.95, thick: 0.75 * IN, width: 0.075 };

export function P136(api) {
  const { box, bolt, ring, at } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { length: L, thick: t, width: w } = GUIDE;
  P('1', at(box(t, L, w, 'darkSteel'), [0, L / 2, 0]), [0, 0, 0]);
  // De haut en bas : 3 2 3 3 2 3 3 3 3 3 2 (2 = 5/8 x 1 1/2, 3 = 5/8 x 1 1/4)
  const seq = ['3', '2', '3', '3', '2', '3', '3', '3', '3', '3', '2'];
  seq.forEach((ref, i) => {
    const y = L - 0.1 - i * ((L - 0.2) / (seq.length - 1));
    const len = ref === '2' ? 1.5 * IN : 1.25 * IN;
    P(ref, bolt(0.625 * IN, len, 'steel', { axis: 'x', pos: [t / 2 + 0.0035, y, 0] }), [0.16, 0, 0]);
    P('4', ring(0.021, 0.009, 0.0035, 'steel', { axis: 'x', pos: [t / 2 + 0.00175, y, 0] }), [0.09, 0, 0]);
  });
  return { view: { dir: [1, 0.35, 0.8] } };
}

// P132 — Vérin d'avance télescopique 10 pi : axe selon +Y, bride inférieure à
// y = 0, bride supérieure à y = 2.95. Le collier à tourillons est à y = TRUNNION.
export const CYL = { length: 2.95, trunnion: 2.37 };

export function P132(api) {
  const { box, cyl, ring, bolt, nut, fitting, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { length: L, trunnion: T } = CYL;
  const side = (x) => [x, 0, 0];

  // 13 — tige porteuse inférieure avec sa bride ; 5 — bride supérieure ; 12 — tige supérieure
  P('13', group(
    at(cyl(0.085, 0.035, 'black', { seg: 40 }), [0, 0.0175, 0]),
    at(cyl(0.045, 0.04, 'black'), [0, 0.055, 0]),
    at(cyl(0.032, 1.6, 'chrome'), [0, 0.8 + 0.035, 0]),
  ), [0, -0.35, 0]);
  P('5', group(
    at(cyl(0.085, 0.05, 'black', { seg: 40 }), [0, L - 0.025, 0]),
    at(cyl(0.045, 0.04, 'black'), [0, L - 0.07, 0]),
  ), [0, 0.35, 0]);
  P('12', cyl(0.032, 0.7, 'chrome', { pos: [0, L - 0.4, 0] }), side(-0.45));
  P('14', cyl(0.055, 0.05, 'darkSteel', { pos: [0, L - 0.75, 0] }), side(-0.45));

  // 7 — tube intérieur (dépasse sous le tube extérieur), 4 — presse-étoupes du tube intérieur
  P('7', cyl(0.0625, 1.52, 'black', { pos: [0, 1.33 + 0.76, 0] }), side(0.3));
  P('4', ring(0.07, 0.062, 0.04, 'darkSteel', { pos: [0, 1.35, 0] }), side(0.5));
  P('4', ring(0.07, 0.062, 0.04, 'darkSteel', { pos: [0, 2.83, 0] }), side(0.5));
  // 6 — tube extérieur, 2 — presse-étoupes du tube extérieur
  P('6', cyl(0.085, 0.79, 'black', { pos: [0, 1.98 + 0.395, 0], seg: 40 }), side(0.75));
  P('2', ring(0.095, 0.0625, 0.04, 'darkSteel', { pos: [0, 1.96, 0] }), side(1.0));
  P('2', ring(0.095, 0.0625, 0.04, 'darkSteel', { pos: [0, 2.79, 0] }), side(1.0));
  // 8 / 9 — demi-pistons du grand piston, 3 — clavettes de cisaillement (à l'intérieur)
  P('8', ring(0.08, 0.0625, 0.035, 'darkSteel', { pos: [0, 2.03, 0] }), side(-0.7));
  P('9', ring(0.08, 0.0625, 0.035, 'darkSteel', { pos: [0, 2.07, 0] }), side(-0.85));
  P('3', ring(0.07, 0.0625, 0.012, 'steel', { pos: [0, 2.0, 0] }), side(-1.0));
  P('3', ring(0.07, 0.0625, 0.012, 'steel', { pos: [0, 2.1, 0] }), side(-1.0));

  // 1 — collier à tourillons boulonné ; 11 — bagues d'usure sur les tourillons
  P('1', group(
    box(0.2, 0.14, 0.2, 'black', { r: 0.01 }),
    at(cyl(0.03, 0.3, 'steel', { axis: 'x' }), [0, 0, 0]),
  ).translateY(T), [0, 0, 0.4]);
  for (const s of [1, -1]) {
    P('11', cyl(0.036, 0.035, 'brass', { axis: 'x', pos: [s * 0.13, T, 0] }), [s * 0.25, 0, 0.4]);
    // 18 / 21 — boulons du collier (3 par côté) et rondelles
    for (const dy of [-0.045, 0, 0.045]) {
      P('18', bolt(0.5 * IN, 4.5 * IN, 'steel', { axis: '-z', pos: [s * 0.075, T + dy, -0.1] }), [0, 0, -0.35]);
      P('21', ring(0.012, 0.0066, 0.003, 'steel', { axis: 'z', pos: [s * 0.075, T + dy, -0.1015] }), [0, 0, -0.25]);
    }
  }
  // 10 — colliers de support (tuyau 1 1/4 po), 17 / 19 / 20 — leur boulonnerie
  for (const y of [2.6, 2.15]) {
    P('10', group(
      at(box(0.06, 0.035, 0.03, 'darkSteel'), [0, 0, 0]),
      at(cyl(0.018, 0.035, 'darkSteel', { axis: 'z' }), [0, 0, 0.02]),
    ).translateY(y).translateZ(0.1), [0, 0, 0.35]);
    P('17', bolt(0.375 * IN, 1 * IN, 'steel', { axis: 'z', pos: [0.022, y, 0.118] }), [0, 0, 0.55]);
    P('20', ring(0.009, 0.005, 0.002, 'steel', { axis: 'z', pos: [0.022, y, 0.1165] }), [0, 0, 0.5]);
    P('19', ring(0.012, 0.005, 0.0015, 'steel', { axis: 'z', pos: [0.022, y, 0.1155] }), [0, 0, 0.47]);
  }
  // Té de raccordement en bas du tube extérieur : 16 bouchon ; 15 — réducteurs aux brides
  P('16', nut(0.022, 0.015, 'steel', { axis: 'x', pos: [-0.11, 2.0, 0] }), [-0.3, 0, 0]);
  P('15', at(fitting(0.02, 0.04, 'steel'), [0, L + 0.012, 0]), [0, 0.5, 0]);
  P('15', at(fitting(0.02, 0.04, 'steel', { axis: '-y' }), [0, -0.012, 0]), [0, -0.5, 0]);
  return { view: { dir: [1, 0.3, 1.1] } };
}

// P134 — Plaque porte-tête : plaque dans le plan XY (centre à l'origine, face avant
// vers +Z), glissières le long de Y. Les barres de guidage du mât sont à
// x = ±0.24, z ∈ [-0.125, -0.05] dans ce repère ; l'axe du vérin à z = -0.16.
export function P134(api) {
  const { box, cyl, ring, bolt, nut, plate, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const H = 26.5 * IN; // glissières 26 1/2 po
  const W = 0.62, T = 0.04;
  const pockets = [[-0.24, 0.28], [0.24, 0.28], [-0.24, -0.28], [0.24, -0.28]];

  // 9 — plaque (fenêtre centrale, poches des patins aux quatre coins)
  const pl = plate(W, H + 0.03, T, 'grey', {
    cutouts: [[0, -0.06, 0.2, 0.26], ...pockets.map(([x, y]) => [x, -y, 0.07, 0.11])],
    holes: [[-0.12, -0.24, 0.01], [0.12, -0.24, 0.01], [-0.12, 0.24, 0.01], [0.12, 0.24, 0.01]],
  });
  pl.rotation.x = Math.PI / 2;
  P('9', group(pl), [0, 0, 0.35]);

  for (const s of [1, -1]) {
    // 2 — boîtier de glissière (cornière), 3 — plaque d'appui, 1 — glissière
    P('2', group(
      at(box(0.02, H, 0.12, 'grey'), [s * 0.275, 0, -0.08]),
      at(box(0.03, H, 0.015, 'grey'), [s * 0.252, 0, -0.1325]),
    ), [s * 0.35, 0, 0]);
    P('3', at(box(0.006, H, 0.07, 'darkSteel'), [s * 0.262, 0, -0.088]), [s * 0.26, 0, 0]);
    P('1', group(
      at(box(0.01, H, 0.075, 'white'), [s * 0.254, 0, -0.0875]),
      at(box(0.03, H, 0.008, 'white'), [s * 0.24, 0, -0.046]),
    ), [s * 0.18, 0, 0]);
    // 14 — vis de réglage à tête carrée + 18 contre-écrous (3 par côté)
    for (const y of [-0.25, 0, 0.25]) {
      P('14', bolt(0.75 * IN, 2 * IN, 'steel', { axis: s > 0 ? 'x' : '-x', head: 'square', pos: [s * 0.3, y, -0.09] }), [s * 0.5, 0, 0]);
      P('18', nut(0.75 * IN * 1.5, 0.012, 'steel', { axis: 'x', pos: [s * 0.291, y, -0.09] }), [s * 0.42, 0, 0]);
    }
    // 13 — vis CHC du boîtier sur la plaque (7 par côté)
    for (let i = 0; i < 7; i++) {
      P('13', bolt(0.625 * IN, 1.5 * IN, 'steel', { axis: s > 0 ? 'x' : '-x', pos: [s * 0.293, -0.3 + i * 0.1, -0.035] }), [s * 0.6, 0, 0]);
    }
    // 4 — support de tourillon amovible (derrière la plaque), 12 / 15 — longs boulons
    P('4', group(
      at(box(0.05, 0.3, 0.18, 'grey'), [s * 0.125, 0, -0.11]),
      at(cyl(0.032, 0.052, 'darkSteel', { axis: 'x' }), [s * 0.125, 0, -0.16]),
    ), [0, 0, -0.45]);
    for (const y of [-0.12, -0.06, 0.06, 0.12]) {
      P('12', bolt(0.75 * IN, 9 * IN, 'steel', { axis: '-z', pos: [s * 0.125, y, -0.2] }), [0, 0, -0.75]);
      P('15', ring(0.017, 0.01, 0.004, 'steel', { axis: 'z', pos: [s * 0.125, y, -0.198] }), [0, 0, -0.62]);
    }
  }
  // Poches des coins : 7 patin d'usure, 5 plaque d'appui, 6 / 8 plaques de retenue
  pockets.forEach(([x, y]) => {
    P('7', at(box(0.065, 0.1, 0.025, 'white'), [x, y, -0.0325]), [0, 0, -0.25]);
    P('5', at(box(0.065, 0.1, 0.012, 'darkSteel'), [x, y, -0.006]), [0, 0, 0.42]);
    P(y > 0 ? '6' : '8', at(box(0.1, 0.14, 0.012, 'grey'), [x, y, T / 2 + 0.006]), [0, 0, 0.55]);
    // 11 / 16 — vis de la plaque de retenue (5) ; 10 / 17 — vis de réglage (4) et contre-écrous
    [[-0.04, -0.06], [0.04, -0.06], [-0.04, 0.06], [0.04, 0.06], [0, 0.06]].forEach(([dx, dy]) => {
      P('11', bolt(0.5 * IN, 1.5 * IN, 'steel', { pos: [x + dx, y + dy, T / 2 + 0.016], axis: 'z' }), [0, 0, 0.8]);
      P('16', ring(0.013, 0.0066, 0.003, 'steel', { axis: 'z', pos: [x + dx, y + dy, T / 2 + 0.0135] }), [0, 0, 0.7]);
    });
    [[-0.02, -0.02], [0.02, -0.02], [-0.02, 0.02], [0.02, 0.02]].forEach(([dx, dy]) => {
      P('10', bolt(0.5 * IN, 1.25 * IN, 'steel', { pos: [x + dx, y + dy, T / 2 + 0.03], axis: 'z' }), [0, 0, 0.95]);
      P('17', nut(0.019, 0.008, 'steel', { axis: 'z', pos: [x + dx, y + dy, T / 2 + 0.016] }), [0, 0, 0.88]);
    });
  });
  void cyl; void ring;
  return { view: { dir: [0.9, 0.55, -1.0] } };
}

// P130 — Mât 10 pi HH assemblé.
export function P130(api) {
  const { box, cyl, ring, tube, bolt, fitting, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { length: L, width: W, depth: D, cylZ, plateY, plateZ } = MAST;
  const zf = D / 2;
  // Raccord couché le long de ±X (fitting ne connaît que +X).
  const fx = (d, len, sign, pos) => at(fitting(d, len, 'steel', { axis: 'x' }), pos, sign > 0 ? null : [0, Math.PI, 0]);

  // 6 — caisson du mât : dos, flancs, faces avant de part et d'autre du canal du vérin
  const body = group(
    at(box(W, L, 0.025, 'lightGrey'), [0, L / 2, -zf + 0.0125]),
    at(box(0.025, L, D, 'lightGrey'), [W / 2 - 0.0125, L / 2, 0]),
    at(box(0.025, L, D, 'lightGrey'), [-W / 2 + 0.0125, L / 2, 0]),
    at(box(0.07, L, 0.025, 'lightGrey'), [0.195, L / 2, zf - 0.0125]),
    at(box(0.07, L, 0.025, 'lightGrey'), [-0.195, L / 2, zf - 0.0125]),
    at(box(0.02, L, 0.22, 'lightGrey'), [0.17, L / 2, zf - 0.11]),
    at(box(0.02, L, 0.22, 'lightGrey'), [-0.17, L / 2, zf - 0.11]),
    at(box(0.32, L, 0.02, 'grey'), [0, L / 2, zf - 0.23]),
    at(box(W + 0.04, 0.05, D + 0.04, 'lightGrey'), [0, L - 0.025, 0]),
    at(box(W + 0.08, 0.05, D + 0.1, 'lightGrey'), [0, 0.025, 0]),
    // oreilles de pivot au pied du mât
    ...[1, -1].map((s) => at(box(0.1, 0.12, 0.1, 'lightGrey', { r: 0.02 }), [s * (W / 2 + 0.06), 0.11, -0.08])),
    // renforts visibles sur les faces avant
    ...[0.55, 1.25, 1.95, 2.6].flatMap((y) => [1, -1].map((s) => at(box(0.06, 0.16, 0.006, 'grey'), [s * 0.195, y, zf + 0.003]))),
  );
  P('6', body, [0, 0, -0.45]);
  // 1 — bagues des oreilles de pivot
  for (const s of [1, -1]) P('1', ring(0.035, 0.022, 0.1, 'brass', { axis: 'x', pos: [s * (W / 2 + 0.06), 0.11, -0.08] }), [s * 0.3, 0, 0]);
  // 14 — trousse de remplacement : bandes d'usure le long du canal
  for (const s of [1, -1]) P('14', at(box(0.008, L - 0.2, 0.02, 'white'), [s * 0.156, L / 2, zf - 0.01]), [s * 0.1, 0, 0.25]);

  // 5 — barres de guidage sur les flancs, au bord avant
  const gz = zf - 0.0375;
  const gr = at(api.sub('P136'), [W / 2 + 0.0095, 0.05, gz]);
  P('5', gr, [0.4, 0, 0]);
  const gl = at(api.sub('P136'), [-W / 2 - 0.0095, 0.05, gz]);
  gl.rotation.y = Math.PI;
  P('5', gl, [-0.4, 0, 0]);

  // 2 — vérin d'avance télescopique dans le canal ; 4 — plaque porte-tête
  P('2', at(api.sub('P132'), [0, 0.05, cylZ]), [0, 0, 0.75]);
  P('4', at(api.sub('P134'), [0, plateY, plateZ]), [0, 0, 1.4]);

  // Raccords du vérin : 11 adaptateur et 8 coude orientable en haut, 10 adaptateurs, 9 coude en bas
  P('11', at(fitting(0.025, 0.04, 'steel', { axis: 'x' }), [0.06, L - 0.075, cylZ]), [0.2, 0.25, 1.0]);
  P('8', at(fitting(0.025, 0.05, 'steel', { elbow: true }), [0.1, L - 0.06, cylZ]), [0.35, 0.3, 1.0]);
  P('10', at(fitting(0.022, 0.035, 'steel', { axis: 'x' }), [0.1, L - 0.13, cylZ]), [0.35, 0.15, 1.0]);
  P('10', fx(0.022, 0.035, -1, [-0.12, 2.05, cylZ]), [-0.3, 0, 1.0]);
  P('9', at(fitting(0.025, 0.045, 'steel', { elbow: true, axis: '-y' }), [0, 0.03, cylZ + 0.05]), [0, -0.3, 1.0]);

  // 3 — tubes 3/8 po le long du canal (10) ; 7 — coudes de traversée sur les flancs (20)
  [1.62, 1.58, 1.54, 1.5, 1.46, 1.0, 0.96, 0.92, 0.42, 0.38].forEach((y) => {
    P('3', tube([[0.15, y, zf - 0.05], [0.1, y, zf - 0.06], [0.06, y + 0.02, zf - 0.1], [0.06, y + 0.2, zf - 0.11]], 0.005, 'steel', { seg: 16 }), [0.15, 0, 0.35]);
  });
  for (const s of [1, -1]) {
    [1.45, 1.4, 1.35, 1.3, 1.25, 1.2, 0.85, 0.8, 0.3, 0.25].forEach((y) => {
      P('7', fx(0.016, 0.03, s, [s * (W / 2 + 0.012), y, 0.05]), [s * 0.25, 0, 0]);
    });
  }
  // 12 / 13 — vis CHC 1/2 x 2 1/2 et rondelles des brides du vérin (4 en haut, 4 en bas)
  for (const [dx, dz] of [[0.06, 0.06], [-0.06, 0.06], [0.06, -0.06], [-0.06, -0.06]]) {
    P('12', bolt(0.5 * IN, 2.5 * IN, 'black', { pos: [dx, L + 0.008, cylZ + dz] }), [0, 0.4, 0]);
    P('13', ring(0.012, 0.0066, 0.003, 'steel', { pos: [dx, L + 0.0015, cylZ + dz] }), [0, 0.3, 0]);
    P('12', bolt(0.5 * IN, 2.5 * IN, 'black', { axis: '-y', pos: [dx, -0.008, cylZ + dz] }), [0, -0.4, 0]);
    P('13', ring(0.012, 0.0066, 0.003, 'steel', { pos: [dx, -0.0015, cylZ + dz] }), [0, -0.3, 0]);
  }
  void cyl;
  return { view: { dir: [1.1, 0.45, 1.25] } };
}

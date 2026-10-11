// P262 — Trousse de filtres déportés Deutz CX011230 rév. 6 (page 262) :
// « DEUTZ UG REMOTE FILTER KIT D914L04 », repère 10 de P256. Les filtres
// quittent le moteur pour une cornière accessible (P256 rep. 8, posée en
// travers sur le carter de volant) : filtre à huile déporté (trousse P264,
// rep. 7) et filtre à gazole (8) sous sa tête sur l'équerre à gousset (9).
// Deux flexibles de gazole de 3 pi (1) à œils de banjo relient les orifices
// latéraux de la tête (vis creuses 4) à la console de filtre à gazole du
// moteur (vis creuses 2) ; joints de banjo (3) de part et d'autre de chaque
// œil ; vis de purge (5) et son joint (6) sur la tête.
// Visserie : 10 (5/16 × 3/4, rondelles Grower 13) — deux sous la languette de
// la patte P264 rep. 4, deux de la tête de gazole sous l'équerre 9 ;
// 11 (5/16 × 1, rondelles 13, écrous 15) — aile de la patte P264 sur la
// cornière ; 12 (3/8 × 1 1/4, rondelles 14, écrous 16) — équerre 9 sur la
// cornière.
// Repère : repère moteur ENG (_moteur_surpresseur.js) — trousse posée sur le
// moteur, insérée à l'origine par P256 : origine sur l'axe du vilebrequin au
// plan SAE du carter de volant, +X vers la soufflante, Y haut, +Z côté
// injection. Cornière (P256 rep. 8) : aile verticale de x = flangeX à
// flangeX + 6 mm ; tête d'huile en z = oilZ, tête de gazole en z = fuelZ,
// dessus des têtes à y = headTopY. Encombrement ≈ 0.62 (X) × 0.71 (Y) × 0.30 (Z) m.
// Cotes : vis de la liste ; flexibles de gazole Ø 15 mm ext. ; cartouche de
// gazole Ø 80 × 140 mm (Deutz) ; le reste d'après les proportions de la page 262.
// Joints de banjo (3) : dix à la liste pour huit faces d'œil — les deux de
// trop doublent les joints sous les vis creuses 4 de la tête.
import { ENG, IN } from './_moteur_surpresseur.js';

export default function P262(api) {
  const { box, cyl, lathe, plate, extrude, hose, bolt, nut, washer, merged, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = ENG.filters;
  const FX = F.flangeX, HT = F.headTopY, HX = F.axisX, HZ = F.fuelZ, OZ = F.oilZ;

  // 7 — trousse de filtre à huile déporté (même repère moteur).
  P('7', api.sub('P264'), [0, 0, 0]);

  // 9 — équerre de gazole : aile verticale contre la cornière, plateau sur
  // lequel la tête est vissée par-dessous, gousset triangulaire ; la tête de
  // filtre (orifices latéraux et de purge) fait corps avec elle.
  const shelf = at(plate(0.11, 0.07, 0.006, 'black', { holes: [[-0.035, 0, 0.004], [0.005, 0, 0.004]] }), [FX - 0.006 - 0.055, HT + 0.003, HZ]);
  const wing = box(0.006, 0.1, 0.07, 'black', { r: 0.001, pos: [FX - 0.003, HT + 0.02, HZ] });
  const gus = extrude([[0, 0], [-0.05, 0], [0, 0.06]], 0.006, 'black');
  gus.position.set(FX - 0.006, HT + 0.006, HZ);
  const headBody = lathe([[0.01, HT - 0.05], [0.04, HT - 0.05], [0.046, HT - 0.044], [0.046, HT - 0.004], [0.042, HT], [0.01, HT]], 'castAlu', { seg: 32, pos: [HX, 0, HZ] });
  const bosses = [-1, 1].map((s) => at(cyl(0.012, 0.016, 'castAlu', { axis: 'z', seg: 16 }), [HX, HT - 0.024, HZ + s * 0.05]));
  P('9', group(merged([shelf, wing, gus], 'black'), merged([headBody, ...bosses], 'castAlu')), [-0.06, 0.03, 0]);

  // 8 — cartouche de gazole vissée sous la tête.
  const R8 = 0.04, H8 = 0.14, Y8 = HT - 0.05;
  P('8', lathe([
    [0, Y8 - H8], [R8 - 0.007, Y8 - H8], [R8, Y8 - H8 + 0.009], [R8, Y8 - 0.014],
    [R8 + 0.0015, Y8 - 0.01], [R8 + 0.0015, Y8 - 0.005], [R8 - 0.004, Y8], [0, Y8],
  ], 'white', { seg: 32, pos: [HX, 0, HZ] }), [0, -0.14, 0]);

  // Banjo : œil (bague percée), queue vers le flexible ; vis creuse ; joints.
  const eye = (c, axis, dir) => {
    const ax = axis === 'z' ? 'z' : 'x';
    const ring = lathe([[0.004, -0.007], [0.0095, -0.007], [0.0105, -0.005], [0.0105, 0.005], [0.0095, 0.007], [0.004, 0.007]], 'zinc', { axis: ax, seg: 20, pos: c });
    const stem = at(cyl(0.005, 0.03, 'zinc', { axis: 'x', seg: 12 }), [c[0] + dir * 0.022, c[1], c[2]]);
    return merged([ring, stem], 'zinc');
  };
  const seal = (c, axis) => at(washer(0.0085, 0.005, 0.0016, 'copper', { axis }), c);
  const banjoBolt = (c, axis, s) => {
    // Tête six pans 14 mm, tige creuse M10 percée en travers.
    const g = group(
      at(bolt(0.01, 0.026, 'steel', { axis: axis === 'z' ? (s > 0 ? 'z' : '-z') : 'x' }), c),
    );
    return g;
  };

  // Tête : orifices latéraux selon ±Z, œils vers +X (vers le moteur).
  const headPorts = [-1, 1].map((s) => [HX, HT - 0.024, HZ + s * 0.058]);
  // Console de gazole du moteur : deux vis creuses dans la face +Z.
  const engPorts = [0.325, 0.365].map((x) => [x, -0.083, 0.257]);

  headPorts.forEach((p, k) => {
    const s = k === 0 ? -1 : 1;
    // Joints : contre le bossage, entre œil et tête de vis (+ un doublé).
    P('3', seal([p[0], p[1], p[2] - s * 0.0087], 'z'), [0, 0, s * 0.03]);
    P('3', seal([p[0], p[1], p[2] + s * 0.0087], 'z'), [0, 0, s * 0.05]);
    P('3', seal([p[0], p[1], p[2] + s * 0.0104], 'z'), [0, 0, s * 0.06]);
    P('4', banjoBolt([p[0], p[1], p[2] + s * 0.0112], 'z', s), [0, 0, s * 0.08]);
  });
  engPorts.forEach((p) => {
    P('3', seal([p[0], p[1], p[2] - 0.0087 + 0.0008], 'z'), [0, 0, 0.03]);
    P('3', seal([p[0], p[1], p[2] + 0.0087], 'z'), [0, 0, 0.05]);
    P('2', banjoBolt([p[0], p[1], p[2] + 0.0095], 'z', 1), [0, 0, 0.08]);
  });

  // 1 — flexibles de gazole 3 pi, œil de banjo à chaque bout.
  const R1 = 0.0075;
  for (let k = 0; k < 2; k++) {
    const hp = headPorts[k], ep = engPorts[k];
    const zo = k === 0 ? 0 : 0.03;
    const pts = [
      [hp[0] + 0.037, hp[1], hp[2]],
      [hp[0] + 0.09, hp[1] - 0.03, hp[2] - 0.01],
      [0.12, 0.0, 0.33 + zo],
      [ep[0] - 0.12, -0.13, 0.3 + zo],
      [ep[0] - 0.07, -0.1, ep[2]],
      [ep[0] - 0.037, ep[1], ep[2]],
    ];
    P('1', group(eye(hp, 'z', 1), eye(ep, 'z', -1), hose(pts, R1)), [0.05, 0, 0.1]);
  }

  // 5, 6 — vis de purge et son joint, sur le dessus de la tête (côté −X,
  // hors du plateau de l'équerre).
  const pb = [HX - 0.032, HT, HZ];
  P('6', at(washer(0.0075, 0.004, 0.0015, 'copper'), [pb[0], pb[1] + 0.00075, pb[2]]), [0, 0.03, 0]);
  P('5', at(bolt(0.008, 0.012, 'steel'), [pb[0], pb[1] + 0.0015, pb[2]]), [0, 0.06, 0]);

  // ---------------------------------------------------------------- visserie
  const D10 = 0.3125 * IN, D12 = 0.375 * IN;
  const lw = (d, c, axis) => at(washer(d * 0.95, d * 0.53, d * 0.25, 'zinc', { axis }), c);
  // 10 — deux sous la languette de la patte P264 rep. 4 (têtes en haut,
  // vissées dans la tête d'huile), deux dans le plateau de l'équerre 9.
  const tongueHoles = [[FX - 0.034, OZ + 0.008], [FX - 0.034, OZ + 0.032]];
  for (const [x, z] of tongueHoles) {
    P('13', lw(D10, [x, HT + 0.005 + D10 * 0.125, z], 'y'), [0, 0.05, 0]);
    P('10', at(bolt(D10, 0.75 * IN, 'zinc'), [x, HT + 0.005 + D10 * 0.25, z]), [0, 0.08, 0]);
  }
  for (const x of [FX - 0.006 - 0.09, FX - 0.006 - 0.05]) {
    P('13', lw(D10, [x, HT + 0.006 + D10 * 0.125, HZ], 'y'), [0, 0.05, 0]);
    P('10', at(bolt(D10, 0.75 * IN, 'zinc'), [x, HT + 0.006 + D10 * 0.25, HZ]), [0, 0.08, 0]);
  }
  // 11 — aile de la patte P264 rep. 4 sur la cornière : têtes côté −X,
  // rondelles et écrous côté +X de l'aile de la cornière (6 mm).
  const wingHoles = [[HT + 0.016, OZ + 0.005], [HT + 0.05, OZ + 0.005], [HT + 0.033, OZ + 0.035]];
  for (const [y, z] of wingHoles) {
    P('11', at(bolt(D10, 1.0 * IN, 'zinc', { axis: '-x' }), [FX - 0.005, y, z]), [-0.06, 0, 0]);
    P('13', lw(D10, [FX + 0.006 + D10 * 0.125, y, z], 'x'), [0.04, 0, 0]);
    P('15', at(nut(D10 * 1.6, D10 * 0.85, 'zinc', { axis: 'x' }), [FX + 0.006 + D10 * 0.25 + D10 * 0.425, y, z]), [0.06, 0, 0]);
  }
  // 12 — équerre 9 sur la cornière, rondelles 14 et écrous 16 côté +X.
  for (const z of [HZ - 0.02, HZ + 0.02]) {
    const y = HT + 0.045;
    P('12', at(bolt(D12, 1.25 * IN, 'zinc', { axis: '-x' }), [FX - 0.006, y, z]), [-0.08, 0, 0]);
    P('14', lw(D12, [FX + 0.006 + D12 * 0.125, y, z], 'x'), [0.04, 0, 0]);
    P('16', at(nut(D12 * 1.6, D12 * 0.85, 'zinc', { axis: 'x' }), [FX + 0.006 + D12 * 0.25 + D12 * 0.425, y, z]), [0.06, 0, 0]);
  }

  return { view: { dir: [-0.9, 0.55, 1.0] } };
}

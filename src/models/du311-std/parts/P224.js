// P224 — Réservoir de carburant 32 gal CX009603 rév. 4 (page 224) : « FUEL
// TANK ASSEMBLY », repère 1 du porteur P220. Caisson soudé revêtu (10) en tôle
// de 10 ga, deux cornières de fixation à trois trous sous les grands côtés,
// piquages 2 po NPT de remplissage et 3/8 po d'évent, orifices 1 po NPT de
// retour (grand côté et bout), de réchauffeur (bouché, 13) et de réserve
// 1 1/4 po (bouché, 14), aspiration encastrée et vidange 1 po sous le fond.
// Jauge VDO 0-99 Ω (2) sur le joint moulé (9, P226 : six vis CHC 1/4-20 × 1
// 16, cinq vis cruciformes #10 4 et rondelles 3 dans ses inserts, joint plat
// 8 sous la collerette de la jauge) ; trappe Ø 7 1/2 po (12) sur joint (11),
// huit vis H 1/4-20 × 1/2 (15) et rondelles (17), qui porte les trois vannes
// à bille 1/2 po (5) d'aspiration, de retour et d'auxiliaire. Bouchon de
// remplissage à fermeture automatique (1) au bout du boyau de remplissage
// 2 po (6) et boyau d'évent 3/8 × 48 po (7) : non dessinés au manuel
// (note 1), tracés jusqu'à un goulot accessible à l'avant droit de la
// cabine, au-dessus du vérin de direction droit.
// Repère machine (../layout.js), placé à l'identité par P220 : réservoir
// logé dans le châssis arrière sous la cabine (basculer la cabine pour y
// accéder), grand axe en travers (Z), entre x = −1.00 et −0.50, dessus à
// y = 0.93. Caisson 0.50 × 0.35 × 0.70 m (≈ 122 L = 32 gal US) d'après les
// proportions des vues de la page 224 ; châssis arrière (aucune étiquette).
import { u, cabHw, prism } from './_cab.js';
import { GASKET } from './P226.js';

export const FUEL = { x: -0.75, y: 0.58, z: 0, X: 0.5, Y: 0.35, Z: 0.7 };

export default function P224(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, merged, group, at, weld, tube, ballValve } = S;
  const H_ = cabHw(api);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { x: X0, y: Y0, z: Z0, X, Y, Z } = FUEL;
  const yT = Y0 + Y; // dessus
  const M = 'lightGrey';
  // Piquages du dessus (x, z) : jauge, trappe, remplissage, évent.
  const SEN = [X0 - 0.12, Z0 - 0.24], COV = [X0 + 0.02, Z0 + 0.02], FILL = [X0 + 0.16, Z0 + 0.25], VENT = [X0 + 0.17, Z0 + 0.1];

  // ---------------------------------------------------------------- 10 — caisson soudé
  const shell = [box(X, Y, Z, M, { r: 0.006, pos: [X0, Y0 + Y / 2, Z0] })];
  // Cornières de fixation sous les grands côtés (plat 2 × 1/4 po débordant), trois trous chacune.
  for (const s of [-1, 1]) {
    shell.push(H_.K.plate(0.05, Z + 0.02, u(0.25), M, { holes: [-0.28, 0, 0.28].map((z) => [s * 0.012, z, 0.0055]), seg: 8 }));
    shell[shell.length - 1].position.set(X0 + s * (X / 2 + 0.018), Y0 + u(0.125), Z0);
    shell.push(box(u(0.25), 0.05, Z + 0.02, M, { pos: [X0 + s * (X / 2 + u(0.125)), Y0 + 0.025, Z0] }));
  }
  // Bossages : bague taraudée de la jauge, cadre de la trappe, demi-manchons 2 po et 3/8 po.
  shell.push(at(cyl(0.05, 0.01, M, { seg: 32 }), [SEN[0], yT + 0.005, SEN[1]]));
  shell.push(at(S.ring(0.105, 0.075, 0.0095, M, { seg: 40 }), [COV[0], yT + 0.0048, COV[1]]));
  shell.push(lathe([[0.032, 0], [0.042, 0], [0.042, 0.03], [0.032, 0.03]], M, { seg: 28, pos: [FILL[0], yT, FILL[1]] }));
  shell.push(lathe([[0.009, 0], [0.016, 0], [0.016, 0.022], [0.009, 0.022]], M, { seg: 16, pos: [VENT[0], yT, VENT[1]] }));
  // Orifices 1 po : retour sur le grand côté +X, retour et réchauffeur sur les bouts, aspiration et vidange dessous.
  const sidePort = (p, axis) => at(cyl(0.025, 0.012, M, { axis, seg: 20 }), p);
  shell.push(sidePort([X0 + X / 2 + 0.006, Y0 + 0.24, Z0 - 0.15], 'x'));
  shell.push(sidePort([X0 - 0.1, Y0 + 0.08, Z0 - Z / 2 - 0.006], 'z'), sidePort([X0 + 0.1, Y0 + 0.24, Z0 + Z / 2 + 0.006], 'z'));
  shell.push(sidePort([X0 - 0.1, Y0 + 0.24, Z0 - Z / 2 - 0.006], 'z'));
  const sump = lathe([[0, -0.03], [0.04, -0.03], [0.04, 0.0], [0.03, 0.0]], M, { seg: 24, pos: [X0 + 0.05, Y0, Z0 + 0.12] });
  shell.push(sump, at(cyl(0.025, 0.012, M, { seg: 20 }), [X0 - 0.12, Y0 - 0.006, Z0 + 0.25]));
  const dark = merged([
    at(lathe([[0.017, 0.0004], [0, 0.0004]], 'blackOxide', { seg: 14 }), [X0 + X / 2 + 0.012, Y0 + 0.24, Z0 - 0.15], [0, 0, -Math.PI / 2]),
    at(lathe([[0.017, 0.0004], [0, 0.0004]], 'blackOxide', { seg: 14 }), [X0 + 0.1, Y0 + 0.24, Z0 + Z / 2 + 0.012], [Math.PI / 2, 0, 0]),
    at(lathe([[0.017, 0.0004], [0, 0.0004]], 'blackOxide', { seg: 14 }), [X0 + 0.05, Y0 - 0.03, Z0 + 0.12], [Math.PI, 0, 0]),
    at(lathe([[0.017, 0.0004], [0, 0.0004]], 'blackOxide', { seg: 14 }), [X0 - 0.12, Y0 - 0.012, Z0 + 0.25], [Math.PI, 0, 0]),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const a = Math.PI / 8 + (k * Math.PI) / 4; return at(lathe([[u(0.11), 0.0003], [0, 0.0003]], 'blackOxide', { seg: 8 }), [COV[0] + Math.cos(a) * u(3.25), yT + 0.0098, COV[1] + Math.sin(a) * u(3.25)]); }),
  ], 'blackOxide');
  const beads = merged([
    ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => weld([[X0 + sx * (X / 2 + 0.001), Y0 + 0.01, Z0 + sz * (Z / 2 + 0.001)], [X0 + sx * (X / 2 + 0.001), yT - 0.01, Z0 + sz * (Z / 2 + 0.001)]], 0.006, M))),
    weld([[X0 - X / 2, yT + 0.001, Z0 - Z / 2], [X0 - X / 2, yT + 0.001, Z0 + Z / 2]], 0.006, M),
    weld([[X0 + X / 2, yT + 0.001, Z0 - Z / 2], [X0 + X / 2, yT + 0.001, Z0 + Z / 2]], 0.006, M),
  ], M);
  P('10', group(merged(shell, M), beads, dark), [0, 0, 0]);

  // ---------------------------------------------------------------- 9 — joint moulé (P226) ; 8 — joint plat ; 2 — jauge VDO ; 3, 4 — vis #10 et rondelles ; 16 — vis CHC
  const ySen = yT + 0.01;
  const gk = api.sub('P226');
  gk.position.set(SEN[0], ySen, SEN[1]);
  P('9', gk, [0, 0.12, 0]);
  const yG = ySen + GASKET.t;
  P('8', at(lathe([[0.018, 0], [0.035, 0], [0.035, 0.0015], [0.018, 0.0015]], 'rubber', { seg: 32 }), [SEN[0], yG, SEN[1]]), [0, 0.2, 0]);
  const yS = yG + 0.0015;
  const sender = group(
    merged([
      lathe([[0.017, 0], [0.034, 0], [0.034, 0.002], [0.028, 0.004], [0.022, 0.006], [0.022, 0.022], [0.018, 0.026], [0, 0.026], [0, 0.002], [0.017, 0.002]], 'zinc', { seg: 32 }),
      lathe([[0.009, -(yS - Y0 - 0.02)], [0.011, -(yS - Y0 - 0.02)], [0.011, 0], [0.009, 0]], 'zinc', { seg: 14 }),
    ], 'zinc'),
    merged([box(0.022, 0.014, 0.016, 'plastic', { pos: [0, 0.033, 0] })], 'plastic'),
    merged([-1, 1].map((s) => at(cyl(0.0022, 0.012, 'brass', { seg: 6 }), [s * 0.006, 0.044, 0])), 'brass'),
  );
  sender.position.set(SEN[0], yS, SEN[1]);
  P('2', sender, [0, 0.3, 0]);
  for (let k = 0; k < 5; k++) {
    const a = Math.PI / 2 + (k * 2 * Math.PI) / 5;
    const x = SEN[0] + Math.cos(a) * GASKET.ri5, z = SEN[1] - Math.sin(a) * GASKET.ri5;
    P('3', at(lathe([[0.0027, 0], [0.0056, 0], [0.0056, 0.001], [0.0027, 0.001]], 'zinc', { seg: 12 }), [x, yS + 0.002, z]), [0, 0.36, 0]);
    P('4', at(group(
      lathe([[0, -0.012], [0.0024, -0.012], [0.0024, 0], [0.0045, 0], [0.0047, 0.0012], [0.004, 0.0028], [0, 0.003]], 'zinc', { seg: 12 }),
      merged([box(0.006, 0.0008, 0.0012, 'blackOxide', { pos: [0, 0.0031, 0] }), box(0.0012, 0.0008, 0.006, 'blackOxide', { pos: [0, 0.0031, 0] })], 'blackOxide'),
    ), [x, yS + 0.003, z]), [0, 0.42, 0]);
  }
  for (let k = 0; k < 6; k++) {
    const a = Math.PI / 6 + (k * Math.PI) / 3;
    P('16', H_.capscrew(0.25, 1.0, [SEN[0] + Math.cos(a) * GASKET.rb, yG, SEN[1] - Math.sin(a) * GASKET.rb]), [0, 0.25, 0]);
  }

  // ---------------------------------------------------------------- 11 — joint ; 12 — trappe ; 15 / 17 — vis et rondelles ; 5 — vannes à bille
  const yR = yT + 0.0095;
  const holes8 = [];
  for (let k = 0; k < 8; k++) { const a = Math.PI / 8 + (k * Math.PI) / 4; holes8.push([Math.cos(a) * u(3.25), Math.sin(a) * u(3.25)]); }
  const disc = (th, mat, extra = []) => {
    const sh = new THREE.Shape().absarc(0, 0, u(3.75), 0, Math.PI * 2, false);
    for (const [x, y] of holes8) sh.holes.push(new THREE.Path().absarc(x, y, 0.0035, 0, Math.PI * 2, true));
    for (const [x, y, r] of extra) sh.holes.push(new THREE.Path().absarc(x, y, r, 0, Math.PI * 2, true));
    const g = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false, curveSegments: 20 });
    g.rotateX(-Math.PI / 2);
    return merged([new THREE.Mesh(g)], mat);
  };
  const g11 = disc(u(0.0625), 'rubber', [[0, 0, u(2.5)]]);
  g11.position.set(COV[0], yR, COV[1]);
  P('11', g11, [0, 0.1, 0]);
  const yP = yR + u(0.0625), tp = u(0.25);
  const VP = [[-0.035, 0.03], [0.035, 0.03], [0, -0.04]]; // vannes (x, z locaux) ; z local = −y de la forme
  const c12 = disc(tp, M, VP.map(([x, z]) => [x, -z, 0.011]));
  c12.position.set(COV[0], yP, COV[1]);
  const bosses = merged(VP.map(([x, z]) => lathe([[0.011, 0], [0.019, 0], [0.019, 0.016], [0.011, 0.016]], M, { seg: 16, pos: [COV[0] + x, yP + tp, COV[1] + z] })), M);
  P('12', group(c12, bosses), [0, 0.2, 0]);
  for (const [hx_, hy] of holes8) {
    const p = [COV[0] + hx_, yP + tp, COV[1] - hy];
    P('17', H_.washer(0.25, p), [0, 0.26, 0]);
    P('15', H_.bolt(0.25, 0.5, [p[0], p[1] + H_.wT(0.25), p[2]]), [0, 0.32, 0]);
  }
  VP.forEach(([x, z], i) => {
    const bv = ballValve(u(0.85), 'brass', { axis: 'y', handle: 'red' });
    bv.rotation.y = i * 1.2;
    bv.position.set(COV[0] + x, yP + tp + 0.016 + u(0.85) * 1.0, COV[1] + z);
    P('5', bv, [0, 0.4, 0]);
  });

  // ---------------------------------------------------------------- 13, 14 — bouchons fraisés 1 et 1 1/4 po NPT
  const ckPlug = (r, pos, rot) => at(group(
    lathe([[r * 0.45, 0.0004], [r, 0.0004], [r * 0.94, -0.007], [r * 0.45, -0.007]], 'blackCast', { seg: 18 }),
    lathe([[0, -0.008], [r * 0.45, -0.008], [r * 0.45, 0.0004], [0, 0.0004]], 'blackCast', { seg: 6 }),
  ), pos, rot);
  P('13', ckPlug(u(0.66), [X0 - 0.1, Y0 + 0.08, Z0 - Z / 2 - 0.012], [-Math.PI / 2, 0, 0]), [0, 0, -0.1]);
  P('14', ckPlug(u(0.83), [X0 - 0.1, Y0 + 0.24, Z0 - Z / 2 - 0.012], [-Math.PI / 2, 0, 0]), [0, 0, -0.1]);

  // ---------------------------------------------------------------- 6 — boyau de remplissage 2 po ; 1 — bouchon ; 7 — boyau d'évent
  const NECK = [-0.1, 0.92, 0.56]; // pied du goulot (en avant de la cabine, côté droit)
  const ro = u(1.25);
  const fill = tube([[FILL[0], yT + 0.03, FILL[1]], [FILL[0], yT + 0.06, FILL[1]], [-0.42, 0.985, 0.33], [-0.22, 0.97, 0.48], [NECK[0] - 0.03, NECK[1] - 0.03, NECK[2]], [NECK[0], NECK[1] - 0.01, NECK[2]], [NECK[0], NECK[1] + 0.04, NECK[2]]], ro, 'hose', { seg: 60, radial: 16, ends: 'none' });
  const bands = merged([[FILL[0], yT + 0.015, FILL[1]], [NECK[0], NECK[1] + 0.025, NECK[2]]].map((p) => at(S.ring(ro + 0.004, ro - 0.002, 0.012, 'zinc', { seg: 24 }), p)), 'zinc');
  P('6', group(fill, bands), [0.1, 0.12, 0.1]);
  // Goulot (tube 2 po sur patte soudée au châssis avant de la cabine) et bouchon à clapet.
  const cap = group(
    merged([lathe([[0.028, -0.06], [0.031, -0.06], [0.031, 0.0], [0.028, 0.0]], 'zinc', { seg: 24 }), box(0.06, 0.006, 0.05, 'zinc', { pos: [0.0, -0.05, -0.04] })], 'zinc'),
    lathe([[0, 0], [0.04, 0], [0.042, 0.012], [0.036, 0.028], [0, 0.03]], 'black', { seg: 28 }),
    box(0.06, 0.012, 0.016, 'black', { r: 0.004, pos: [0, 0.034, 0] }),
  );
  cap.position.set(NECK[0], NECK[1] + 0.1, NECK[2]);
  P('1', cap, [0, 0.2, 0]);
  const vent = tube([[VENT[0], yT + 0.025, VENT[1]], [VENT[0], yT + 0.06, VENT[1]], [-0.45, 0.99, 0.2], [-0.25, 0.98, 0.42], [-0.13, 0.98, 0.52], [NECK[0] + 0.035, NECK[1] + 0.12, NECK[2] - 0.01], [NECK[0] + 0.05, NECK[1] + 0.07, NECK[2] - 0.03]], u(0.31), 'hose', { seg: 60, radial: 8, ends: 'none' });
  P('7', vent, [0.1, 0.18, 0.05]);
  void prism;
  return { view: { dir: [1, 0.9, 1.1] } };
}

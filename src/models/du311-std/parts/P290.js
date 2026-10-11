// P290 — Siège du conducteur CX035798 rév. 0 (page 290) : « ASSY, DRIVER
// SEAT », repère 20 de la cabine P278. Deux embases en oméga (3) boulonnées
// au plancher (vis H 1/2-13 × 1 1/4 filetées 5 et rondelles Nord-Lock 7,
// deux par embase) ; siège de l'opérateur (1) à suspension mécanique basse
// (soufflet), glissières de réglage, coussin et dossier piqués, appuie-tête,
// accoudoirs relevables, ceinture ventrale et leviers de réglage, fixé sur les
// embases par quatre vis H 5/16-18 × 1 1/4 (4), rondelles Nord-Lock (6, une
// sous la tête et une sous l'écrou) et écrous (8) ; support de manipulateur
// (2) en tôle pliée boulonné sous le côté gauche du siège, qui porte le
// manipulateur de translation (dessiné sans repère, comme sur la vue).
// Repère : origine sur le plancher, au milieu entre les deux embases ; X vers
// l'avant de l'opérateur, Y vers le haut, Z à sa droite. Dans la cabine
// (P278), l'opérateur regarde vers −Z machine (poste transversal).
// Encombrement ≈ 0.62 (X) × 0.96 (Y) × 0.78 (Z, support compris) m ; siège de
// 0,50 m de large, cotes des vues des pages 282 et 290.
import { u, cabHw } from './_cab.js';

export const SEATDIM = { baseH: 0.13, baseZ: 0.16, cushionTop: 0.34 };

export default function P290(api) {
  const { THREE, S } = api;
  const { box, lathe, merged, group, at, tube, cyl } = S;
  const H_ = cabHw(api);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const bH = SEATDIM.baseH, bZ = SEATDIM.baseZ, bL = 0.4, tB = u(0.1875);

  // ---------------------------------------------------------------- 3 — embases en oméga (×2)
  // Profil plié : dessus 80 mm, flancs inclinés, semelles de 35 mm percées.
  const baseProfile = [[-0.075, 0], [-0.04, 0], [-0.04, bH], [0.04, bH], [0.04, 0], [0.075, 0], [0.075, tB], [0.04 + tB, tB], [0.04 + tB, bH + tB], [-0.04 - tB, bH + tB], [-0.04 - tB, tB], [-0.075, tB]];
  const footHoles = [-bL / 2 + 0.04, bL / 2 - 0.04];
  for (const s of [-1, 1]) {
    const sh = new THREE.Shape(baseProfile.map(([z, y]) => new THREE.Vector2(z, y)));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: bL, bevelEnabled: false });
    geo.translate(0, 0, -bL / 2);
    geo.rotateY(Math.PI / 2); // profil (z, y), longueur selon X
    const m = new THREE.Mesh(geo);
    // trous des vis (sombres) sur le dessus et les semelles
    const dots = [];
    for (const x of [-0.1, 0.1]) dots.push(at(lathe([[u(0.17), 0.0003], [0, 0.0003]], 'blackOxide', { seg: 10 }), [x, bH + tB, 0]));
    for (const x of footHoles) dots.push(at(lathe([[u(0.28), 0.0003], [0, 0.0003]], 'blackOxide', { seg: 10 }), [x, tB, s * 0.0575]));
    const b = group(merged([m], 'black'), merged(dots, 'blackOxide'));
    b.position.z = s * bZ;
    P('3', b, [0, -0.05, s * 0.12]);
  }
  // 5 — vis 1/2 × 1 1/4 (semelles extérieures) ; 7 — rondelles Nord-Lock.
  for (const s of [-1, 1]) for (const x of footHoles) {
    const p = [x, tB, s * (bZ + 0.0575)];
    P('7', H_.washer(0.5, p, [0, 1, 0], 'nl'), [0, 0.08, s * 0.12]);
    P('5', H_.bolt(0.5, 1.25, [x, tB + H_.wT(0.5, 'nl'), s * (bZ + 0.0575)], [0, 1, 0]), [0, 0.14, s * 0.12]);
  }

  // ---------------------------------------------------------------- 1 — siège de l'opérateur
  const y0 = bH + tB; // dessus des embases
  const seat = [];
  const blk = [], vinyl = [], steel = [];
  // Glissières de réglage longitudinal (deux rails) et levier en étrier sous l'avant.
  for (const s of [-1, 1]) {
    steel.push(box(0.38, 0.016, 0.04, 'steel', { r: 0.002, pos: [0, y0 + 0.008, s * bZ] }));
    steel.push(box(0.36, 0.012, 0.03, 'darkSteel', { r: 0.002, pos: [0.01, y0 + 0.022, s * bZ] }));
  }
  steel.push(tube([[0.2, y0 + 0.03, -0.12], [0.26, y0 + 0.026, -0.1], [0.26, y0 + 0.026, 0.1], [0.2, y0 + 0.03, 0.12]], 0.005, 'steel', { seg: 16, radial: 8 }));
  // Suspension mécanique basse : plateau, soufflet caoutchouc, ciseaux visibles, bouton de réglage.
  const ys = y0 + 0.028;
  steel.push(box(0.4, 0.008, 0.4, 'darkSteel', { r: 0.003, pos: [0, ys + 0.004, 0] }));
  const bellows = [];
  for (let i = 0; i < 4; i++) bellows.push(box(0.4 - (i % 2) * 0.01, 0.018, 0.4 - (i % 2) * 0.01, 'rubber', { r: 0.008, pos: [0, ys + 0.017 + i * 0.017, 0] }));
  steel.push(box(0.4, 0.008, 0.4, 'darkSteel', { r: 0.003, pos: [0, ys + 0.088, 0] }));
  blk.push(at(cyl(0.022, 0.03, 'plastic', { axis: 'x', seg: 18 }), [0.215, ys + 0.05, 0.08]));
  // Coussin (appui sur la suspension), bourrelets latéraux et panneaux piqués.
  const yc = ys + 0.092;
  vinyl.push(box(0.48, 0.09, 0.5, 'plastic', { r: 0.03, pos: [0.02, yc + 0.045, 0] }));
  for (const s of [-1, 1]) vinyl.push(box(0.44, 0.03, 0.07, 'plastic', { r: 0.014, pos: [0.0, yc + 0.095, s * 0.205] }));
  const quilt = [];
  for (const [x, w] of [[0.15, 0.1], [0.04, 0.1], [-0.07, 0.1]]) for (const s of [-1, 1]) quilt.push(box(w, 0.006, 0.15, 'plastic', { r: 0.003, pos: [x, yc + 0.092, s * 0.085] }));
  // Dossier incliné de 10°, coque arrière, panneaux piqués 2 × 2, appuie-tête sur deux tiges.
  const back = group();
  back.add(box(0.11, 0.46, 0.5, 'plastic', { r: 0.035, pos: [0, 0.23, 0] }));
  back.add(box(0.05, 0.42, 0.46, 'black', { r: 0.02, pos: [-0.065, 0.22, 0] }));
  for (const s of [-1, 1]) back.add(box(0.06, 0.4, 0.06, 'plastic', { r: 0.02, pos: [0.045, 0.22, s * 0.215] }));
  for (const yy of [0.14, 0.31]) for (const s of [-1, 1]) back.add(box(0.006, 0.14, 0.15, 'plastic', { r: 0.003, pos: [0.057, yy, s * 0.085] }));
  for (const s of [-1, 1]) back.add(cyl(0.006, 0.07, 'chrome', { seg: 10, pos: [-0.01, 0.48, s * 0.08] }));
  back.add(box(0.1, 0.16, 0.3, 'plastic', { r: 0.035, pos: [-0.005, 0.585, 0] }));
  // Molette d'inclinaison et charnières.
  for (const s of [-1, 1]) back.add(box(0.05, 0.08, 0.012, 'darkSteel', { r: 0.004, pos: [-0.02, 0.02, s * 0.256] }));
  back.add(cyl(0.025, 0.02, 'plastic', { axis: 'z', seg: 18, pos: [-0.02, 0.03, 0.272] }));
  back.position.set(-0.2, yc + 0.07, 0);
  back.rotation.z = 0.17;
  // Accoudoirs relevables (×2) sur pattes du dossier.
  const arms = [];
  for (const s of [-1, 1]) {
    arms.push(box(0.3, 0.06, 0.075, 'plastic', { r: 0.025, pos: [-0.03, yc + 0.27, s * 0.29] }));
    steel.push(box(0.06, 0.12, 0.012, 'darkSteel', { r: 0.004, pos: [-0.17, yc + 0.22, s * 0.258] }));
    steel.push(at(cyl(0.01, 0.03, 'steel', { axis: 'z', seg: 10 }), [-0.17, yc + 0.27, s * 0.268]));
  }
  // Ceinture ventrale : deux sangles, boucle et pêne.
  const belt = [
    tube([[-0.16, yc + 0.06, -0.255], [-0.05, yc + 0.11, -0.22], [0.06, yc + 0.13, -0.04]], 0.006, 'black', { seg: 12, radial: 5 }),
    tube([[-0.16, yc + 0.06, 0.255], [-0.05, yc + 0.11, 0.2], [0.04, yc + 0.13, 0.05]], 0.006, 'black', { seg: 12, radial: 5 }),
  ];
  steel.push(box(0.05, 0.02, 0.06, 'chrome', { r: 0.005, pos: [0.06, yc + 0.135, 0.0] }));
  seat.push(merged(steel, 'steel'), merged(bellows, 'rubber'), merged([...vinyl, ...arms], 'plastic'), merged(quilt, 'plastic'), merged(blk, 'plastic'), back, ...belt);
  P('1', group(...seat), [0, 0.32, 0]);

  // 4 — vis 5/16 × 1 1/4 (rails → dessus des embases) ; 6 — rondelles Nord-Lock (×2) ; 8 — écrous.
  for (const s of [-1, 1]) for (const x of [-0.1, 0.1]) {
    const z = s * bZ;
    const yTop = y0 + 0.016;
    P('6', H_.washer(0.3125, [x, yTop, z], [0, 1, 0], 'nl'), [0, 0.4, 0]);
    P('4', H_.bolt(0.3125, 1.25, [x, yTop + H_.wT(0.3125, 'nl'), z], [0, 1, 0]), [0, 0.46, 0]);
    const yUnder = bH; // dessous du dessus de l'embase
    P('6', H_.washer(0.3125, [x, yUnder, z], [0, -1, 0], 'nl'), [0, -0.06, 0]);
    P('8', H_.nut(0.3125, [x, yUnder - H_.wT(0.3125, 'nl'), z], [0, -1, 0]), [0, -0.1, 0]);
  }

  // ---------------------------------------------------------------- 2 — support du manipulateur
  // Tôle pliée de 1/4 po : semelle sous la suspension (côté gauche, −Z),
  // montant incliné vers l'extérieur puis plateau horizontal à l'avant de
  // l'accoudoir ; manipulateur à soufflet et poignée (sans repère).
  const zJ = -0.36;
  const plateProfile = [[-0.06, ys + 0.004], [-0.06, ys + 0.012], [0.0, ys + 0.012], [0.0, ys - 0.004]];
  void plateProfile;
  const mount = group(
    merged([
      box(0.12, u(0.25), 0.16, 'black', { r: 0.002, pos: [0.02, ys + 0.012, -0.24] }),
      at(box(0.06, 0.26, u(0.25), 'black', { r: 0.002 }), [0.05, ys + 0.13, -0.33], [0.45, 0, 0]),
      box(0.13, u(0.25), 0.1, 'black', { r: 0.004, pos: [0.06, yc + 0.24, zJ] }),
      box(0.13, 0.04, u(0.25), 'black', { pos: [0.06, yc + 0.22, zJ - 0.05] }),
    ], 'black'),
    // Manipulateur : embase carrée, soufflet, fût, poignée ergonomique et bouton.
    merged([
      box(0.07, 0.02, 0.07, 'plastic', { r: 0.004, pos: [0.06, yc + 0.255, zJ] }),
      lathe([[0, 0], [0.026, 0], [0.024, 0.012], [0.026, 0.02], [0.02, 0.032], [0.022, 0.04], [0.012, 0.052], [0, 0.052]], 'rubber', { seg: 16, pos: [0.06, yc + 0.265, zJ] }),
      lathe([[0, 0], [0.008, 0], [0.008, 0.04], [0, 0.04]], 'plastic', { seg: 10, pos: [0.06, yc + 0.315, zJ] }),
      lathe([[0, 0], [0.018, 0], [0.022, 0.03], [0.02, 0.07], [0.014, 0.085], [0, 0.088]], 'plastic', { seg: 16, pos: [0.06, yc + 0.35, zJ] }),
    ], 'plastic'),
    S.at(cyl(0.006, 0.006, 'red', { seg: 12 }), [0.06, yc + 0.441, zJ]),
    merged([0, 1, 2, 3].map((i) => at(cyl(u(0.12), 0.004, 'steel', { seg: 8 }), [0.06 + (i % 2 ? 0.026 : -0.026), yc + 0.266, zJ + (i < 2 ? 0.026 : -0.026)])), 'steel'),
  );
  P('2', mount, [0, 0.1, -0.18]);
  return { view: { dir: [1.2, 0.7, -0.8] } };
}

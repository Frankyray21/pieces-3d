// P266 — Radiateur CX007727 rév. 1 (page 266) : « RADIATOR ASSY, PEGASUS »,
// repère 29 de P246. Radiateur (2) en deux faisceaux côte à côte dans un
// même cadre : refroidissement du moteur (côté +Z, boîtes à eau haut et bas,
// goulotte et bouchon de remplissage, purge) et air de suralimentation
// (côté −Z, boîtes en fonte d'aluminium à piquages Ø 3 po) ; montants en U
// percés, traverses haute et basse, pattes sur plots antivibratoires ;
// carénage du ventilateur boulonné côté moteur avec virole Ø 24 po, croisillon
// de grille à trois bras portant le moteur hydraulique (P246 rep. 11) et
// grille à anneaux concentriques ; autocollant de danger sur le carénage
// (page 258). Ventilateur Ø 24 po à six pales (1) dans la virole.
// Repère : origine au milieu du bord inférieur de la face avant du faisceau
// (côté ventilateur), +X vers le moteur (ventilateur), Y vers le haut, Z selon
// la largeur (piquages d'eau vers +Z, d'air vers −Z). Encombrement 0.24 (X, de
// −0.13 à 0.11) × 0.92 (Y) × 1.08 (Z) m. P246 le pose en RAD (x, y) de
// _engine.js, sans rotation. Cotes : ventilateur Ø 24 po (liste) ; faisceaux
// et cadre d'après les vues des pages 248, 252 et 266 (1,08 × 0,885 m).
import { RAD, IN } from './_engine.js';

export default function P266(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, ring, at, group, merged, tube, extrude } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const W = RAD.w, H = RAD.h, C = RAD.core, SH = RAD.shroud;
  const [ty0, ty1, ty2, ty3] = RAD.tankY;
  const { y: fy, z: fz, r: fr } = RAD.fan;

  // ---------------------------------------------------------------- 2 — radiateur
  const frame = [], alu = [], core = [], blk = [], stl = [], rub = [];
  // Montants en U (âme vers l'extérieur, ailes vers l'intérieur), percés.
  for (const s of [-1, 1]) {
    const z = s * (W / 2 - 0.02);
    frame.push(box(C + 0.01, H, 0.004, 'black', { pos: [-C / 2, H / 2, s * (W / 2 - 0.002)] }));
    for (const xx of [0.003, -C - 0.004]) frame.push(box(0.006, H, 0.04, 'black', { pos: [xx, H / 2, z] }));
    for (let k = 0; k < 7; k++) stl.push(at(cyl(0.0055, 0.0006, 'darkSteel', { axis: 'z', seg: 10 }), [-C / 2, 0.09 + k * 0.12, s * (W / 2 + 0.0002)]));
  }
  // Traverses haute et basse (cornières), cloison entre faisceaux.
  for (const y of [0.006, H - 0.006]) {
    frame.push(box(C + 0.012, 0.012, W - 0.01, 'black', { pos: [-C / 2, y, 0] }));
    frame.push(box(0.004, 0.035, W - 0.01, 'black', { pos: [-C - 0.004, y + (y < 0.1 ? 0.012 : -0.012), 0] }));
  }
  frame.push(box(C, ty2 - ty1, 0.012, 'black', { pos: [-C / 2, (ty1 + ty2) / 2, -0.1] }));
  // Faisceaux : face avant et arrière à tubes plats et ailettes (lames
  // horizontales régulières), joues latérales.
  const [c0, c1] = RAD.cool, [a0, a1] = RAD.cac;
  for (const [z0, z1] of [[c0, c1], [a0, a1]]) {
    const zc = (z0 + z1) / 2, wz = z1 - z0;
    core.push(box(C - 0.02, ty2 - ty1, wz, 'darkSteel', { pos: [-C / 2, (ty1 + ty2) / 2, zc] }));
    for (let y = ty1 + 0.008; y < ty2 - 0.004; y += 0.0105) {
      for (const xx of [-0.0085, -C + 0.0085]) core.push(box(0.003, 0.0035, wz - 0.004, 'black', { pos: [xx, y, zc] }));
    }
  }
  // Boîtes à eau (acier peint) et boîtes d'air (fonte d'aluminium nervurée).
  for (const [y0, y1] of [[ty0, ty1], [ty2, ty3]]) {
    frame.push(box(C - 0.004, y1 - y0, c1 - c0, 'black', { r: 0.006, pos: [-C / 2, (y0 + y1) / 2, (c0 + c1) / 2] }));
    alu.push(box(C, y1 - y0, a1 - a0, 'castAlu', { r: 0.012, pos: [-C / 2, (y0 + y1) / 2, (a0 + a1) / 2] }));
    for (let k = 1; k < 5; k++) alu.push(box(C + 0.006, y1 - y0 - 0.012, 0.006, 'castAlu', { r: 0.002, pos: [-C / 2, (y0 + y1) / 2, a0 + (k * (a1 - a0)) / 5] }));
  }
  // Goulotte de remplissage et bouchon à levier, purge d'air (embout à olive).
  frame.push(lathe([[0, ty3 - 0.004], [0.026, ty3 - 0.004], [0.026, ty3 + 0.03], [0.03, ty3 + 0.032], [0.03, ty3 + 0.036], [0, ty3 + 0.036]], 'black', { seg: 24, pos: [-C / 2, 0, 0.4] }));
  const cap = group(
    lathe([[0, 0], [0.037, 0], [0.038, 0.004], [0.036, 0.016], [0.03, 0.022], [0, 0.024]], 'zinc', { seg: 28 }),
    box(0.06, 0.006, 0.012, 'zinc', { r: 0.002, pos: [0, 0.026, 0] }),
  );
  stl.push(at(cap, [-C / 2, ty3 + 0.036, 0.4]));
  const brass = [at(cyl(0.005, 0.03, 'brass', { axis: 'x', seg: 10 }), [-C / 2 + 0.05, ty3 + 0.022, 0.4])];
  // Piquages : eau Ø 2 po (entrée haute, sortie basse), air Ø 3 po, vers +X,
  // avec bourrelet de retenue des durites ; robinet de vidange sous la boîte basse.
  const stub = (p, D, mat) => {
    const r = (D * IN) / 2;
    return at(lathe([[r - 0.002, 0], [r, 0], [r, 0.03], [r + 0.0025, 0.034], [r, 0.038], [r, 0.06], [r - 0.002, 0.06], [r - 0.002, 0]], mat, { axis: 'x', seg: 24 }), p);
  };
  frame.push(stub(RAD.waterIn, 2, 'black'), stub(RAD.waterOut, 2, 'black'));
  alu.push(stub(RAD.cacIn, 3, 'castAlu'), stub(RAD.cacOut, 3, 'castAlu'));
  brass.push(at(cyl(0.008, 0.02, 'brass', { seg: 12 }), [-C / 2, ty0 - 0.01, 0.2]));
  brass.push(at(cyl(0.004, 0.025, 'brass', { axis: 'z', seg: 8 }), [-C / 2, ty0 - 0.02, 0.21]));
  // Pattes : équerres sous les montants, plots antivibratoires et vis.
  for (const s of [-1, 1]) {
    const z = s * 0.48;
    frame.push(box(C + 0.03, 0.008, 0.07, 'black', { pos: [-C / 2, 0.004, z] }));
    frame.push(box(0.006, 0.05, 0.07, 'black', { pos: [-C - 0.012, 0.03, z] }));
    rub.push(lathe([[0, -0.03], [0.03, -0.03], [0.03, -0.024], [0.024, -0.02], [0.026, -0.008], [0.032, -0.006], [0.032, 0], [0, 0]], 'rubber', { seg: 20, pos: [-C / 2, 0, z] }));
    stl.push(at(S.nut(0.019, 0.011, 'zinc'), [-C / 2, 0.0135, z]));
    stl.push(cyl(0.006, 0.05, 'zinc', { seg: 10, pos: [-C / 2, -0.005, z] }));
  }
  // Carénage : caisson en tôle (joues, fond percé de la virole), virole
  // Ø 24 po, rebords boulonnés sur le cadre.
  const shY0 = ty1 - 0.005, shY1 = ty2 + 0.005, shZ0 = -0.48, shZ1 = 0.5;
  const ro = fr + 0.03;
  const hw = (shZ1 - shZ0) / 2, hh = (shY1 - shY0) / 2;
  const plate = extrude([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]], 0.003, 'black', { holes: [[fz - (shZ0 + shZ1) / 2, fy - (shY0 + shY1) / 2, ro]] });
  plate.rotation.y = -Math.PI / 2;
  plate.position.set(SH - 0.0015, (shY0 + shY1) / 2, (shZ0 + shZ1) / 2);
  blk.push(plate);
  for (const y of [shY0, shY1]) blk.push(box(SH, 0.003, shZ1 - shZ0, 'black', { pos: [SH / 2, y, (shZ0 + shZ1) / 2] }));
  for (const z of [shZ0, shZ1]) blk.push(box(SH, shY1 - shY0, 0.003, 'black', { pos: [SH / 2, (shY0 + shY1) / 2, z] }));
  blk.push(at(S.shell(ro, ro - 0.003, 0.05, 'black', { axis: 'x', seg: 48 }), [SH + 0.02, fy, fz]));
  blk.push(at(ring(ro + 0.012, ro, 0.003, 'black', { axis: 'x', seg: 48 }), [SH + 0.044, fy, fz]));
  for (let k = 0; k < 10; k++) {
    const z = shZ0 + 0.03 + k * ((shZ1 - shZ0 - 0.06) / 9);
    for (const y of [shY0 + 0.012, shY1 - 0.012]) stl.push(at(S.bolt(0.006, 0.012, 'zinc', { axis: 'x' }), [0.004, y, z]));
  }
  // Croisillon à trois bras (plats boulonnés sur la virole) et moyeu de
  // fixation du moteur ; grille à anneaux.
  const gx = SH + 0.046;
  for (let i = 0; i < 3; i++) {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / 3;
    const m = box(0.006, ro - 0.05, 0.04, 'black', { r: 0.002 });
    m.position.set(gx + 0.004, fy + Math.sin(a) * (ro + 0.05) / 2, fz + Math.cos(a) * (ro + 0.05) / 2);
    m.rotation.x = -a + Math.PI / 2;
    blk.push(m);
    blk.push(box(0.012, 0.02, 0.05, 'black', { pos: [gx, fy + Math.sin(a) * (ro - 0.005), fz + Math.cos(a) * (ro - 0.005)], rot: [-a + Math.PI / 2, 0, 0] }));
  }
  blk.push(at(lathe([[0.03, 0], [0.065, 0], [0.065, 0.012], [0.03, 0.012]], 'black', { axis: 'x', seg: 28 }), [gx - 0.002, fy, fz]));
  const guard = [];
  for (const r of [0.1, 0.15, 0.2, 0.25, ro - 0.012]) guard.push(at(S.torus(r, 0.0022, 'black', { axis: 'x' }), [gx + 0.012, fy, fz]));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    guard.push(S.rod([gx + 0.012, fy + Math.sin(a) * 0.07, fz + Math.cos(a) * 0.07], [gx + 0.012, fy + Math.sin(a) * (ro - 0.012), fz + Math.cos(a) * (ro - 0.012)], 0.002, 'black', 6));
  }
  // Autocollant « DANGER — pales en rotation » sur le carénage.
  const decal = group(
    box(0.002, 0.07, 0.09, 'white', { pos: [0, 0, 0] }),
    box(0.0024, 0.018, 0.088, 'red', { pos: [0, 0.024, 0] }),
    box(0.0024, 0.004, 0.06, 'black', { pos: [0, -0.005, 0] }),
    box(0.0024, 0.004, 0.05, 'black', { pos: [0, -0.016, -0.005] }),
  );
  decal.position.set(SH + 0.001, 0.62, -0.36);
  P('2', group(
    merged(frame, 'black'), merged(alu, 'castAlu'), merged(core, 'darkSteel'), merged(blk, 'black'),
    merged(guard, 'black'), merged(rub, 'rubber'), merged(stl, 'zinc'), merged(brass, 'brass'), decal,
  ), [-0.25, 0, 0]);

  // ---------------------------------------------------------------- 1 — ventilateur Ø 24 po
  // Moyeu à bride, six pales vrillées (profil effilé, calage 28°).
  const blade = extrude([[0.0, -0.028], [0.215, -0.05], [0.235, -0.035], [0.238, 0.02], [0.22, 0.048], [0.0, 0.03]], 0.003, 'black');
  // Pales construites autour de l'axe Z (profil dans le plan XY), puis axe tourné vers +X.
  const blades = [];
  for (let i = 0; i < 6; i++) {
    const b = blade.clone();
    b.position.x = 0.058;
    b.rotation.x = 0.49; // calage
    const g = group(b);
    g.rotation.z = (i / 6) * Math.PI * 2;
    blades.push(g);
  }
  const fanZ = group(
    merged(blades, 'black'),
    lathe([[0, -0.02], [0.062, -0.02], [0.064, -0.016], [0.064, 0.02], [0.05, 0.026], [0, 0.026]], 'black', { axis: 'z', seg: 28 }),
    merged([0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2;
      return at(S.bolt(0.008, 0.01, 'zinc', { axis: 'z' }), [Math.cos(a) * 0.035, Math.sin(a) * 0.035, 0.026]);
    }), 'zinc'),
  );
  fanZ.rotation.y = Math.PI / 2;
  P('1', at(group(fanZ), [SH + 0.012, fy, fz]), [0.25, 0, 0]);
  void tube;
  void THREE;
  return { view: { dir: [1.1, 0.5, 0.8] } };
}

// Plancher / plaque principale (F09) et moteur principal 115 HP + pompes (F10).
// Repère du plancher : dessus de la plaque à y = 0, X vers l'avant, +Z à droite.

const AXIS_Y = 0.26; // hauteur de l'axe du moteur au-dessus de ses pattes

export function F10(api) {
  const { box, cyl, ring, torus, tube, at, group, bolt, nut, shell } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const y = AXIS_Y;

  // 5 — Moteur électrique 115 HP (carcasse à ailettes, pattes, boîte à bornes)
  const fins = Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * Math.PI * 2;
    if (Math.sin(a) < -0.55) return null; // pas d'ailettes au-dessus des pattes
    return at(box(0.5, 0.035, 0.012, 'blue'), [0, y + Math.sin(a) * 0.245, Math.cos(a) * 0.245], [Math.PI / 2 - a, 0, 0]);
  });
  P('5', group(
    at(cyl(0.225, 0.55, 'blue', { axis: 'x', seg: 36 }), [0, y, 0]),
    ...fins,
    at(box(0.44, 0.06, 0.44, 'blue', { r: 0.01 }), [0.02, 0.03, 0]),
    at(box(0.3, 0.08, 0.34, 'blue'), [0.02, 0.09, 0]),
    at(box(0.2, 0.12, 0.2, 'blue', { r: 0.01 }), [0.05, y + 0.27, 0.03]),
    at(torus(0.03, 0.008, 'blue', { axis: 'z' }), [-0.12, y + 0.27, 0]),
    at(cyl(0.21, 0.1, 'blue', { axis: 'x', seg: 36 }), [-0.32, y, 0]),
    at(cyl(0.16, 0.012, 'darkSteel', { axis: 'x' }), [-0.375, y, 0]),
    at(ring(0.235, 0.05, 0.03, 'blue', { axis: 'x' }), [0.29, y, 0]),
    at(cyl(0.028, 0.18, 'steel', { axis: 'x' }), [-0.43, y, 0]),
    at(cyl(0.028, 0.08, 'steel', { axis: 'x' }), [0.33, y, 0]),
  ), [0, 0, 0]);

  // Côté poulie (-X) : 4 poulie 9", 1 moyeu conique, 2 boulons, 3 clavette
  P('4', group(
    cyl(0.114, 0.085, 'steel', { axis: 'x', seg: 40 }),
    ...[-0.025, 0, 0.025].map((dx) => at(torus(0.108, 0.008, 'darkSteel', { axis: 'x' }), [dx, 0, 0])),
  ).translateX(-0.46).translateY(y), [-0.4, 0, 0]);
  P('1', group(ring(0.065, 0.03, 0.03, 'darkSteel', { axis: 'x' }), at(cyl(0.045, 0.05, 'darkSteel', { axis: 'x' }), [0.03, 0, 0])).translateX(-0.52).translateY(y), [-0.58, 0, 0]);
  [0, 2.1, 4.2].forEach((a) => P('2', bolt(0.012, 0.05, 'steel', { axis: '-x', pos: [-0.54, y + Math.cos(a) * 0.045, Math.sin(a) * 0.045] }), [-0.7, 0, 0]));
  P('3', at(box(0.06, 0.012, 0.012, 'steel'), [-0.46, y + 0.03, 0]), [-0.35, 0.22, 0]);

  // Côté pompes (+X) : 6 clavette étagée, 8/9/7 accouplement, 11 cloche, 10 couvercle, 12 boulons
  P('6', at(box(0.05, 0.012, 0.012, 'steel'), [0.33, y + 0.03, 0]), [0.08, 0.22, 0]);
  P('8', cyl(0.055, 0.05, 'steel', { axis: 'x', pos: [0.35, y, 0] }), [0.25, 0, 0]);
  P('9', cyl(0.052, 0.022, 'black', { axis: 'x', pos: [0.385, y, 0] }), [0.36, 0, 0]);
  P('7', cyl(0.055, 0.05, 'steel', { axis: 'x', pos: [0.42, y, 0] }), [0.47, 0, 0]);
  P('11', group(
    at(shell(0.215, 0.195, 0.2, 'steel', { axis: 'x', r2Out: 0.13, r2In: 0.11, seg: 36 }), [0.385, y, 0]),
    at(ring(0.22, 0.13, 0.02, 'steel', { axis: 'x' }), [0.295, y, 0]),
  ), [0.62, 0, 0]);
  P('10', at(box(0.1, 0.008, 0.08, 'orange'), [0.39, y + 0.18, 0], [0, 0, 0.25]), [0.62, 0.3, 0]);
  [[0.1, 0.1], [-0.1, 0.1], [0.1, -0.1], [-0.1, -0.1]].forEach(([dy, dz]) => P('12', bolt(0.012, 0.04, 'steel', { axis: 'x', pos: [0.5, y + dy, dz] }), [0.58, 0.12, 0]));

  // 16 — Pompe Rexroth A10VO71, 23 — Pompe A10VO28
  P('16', group(
    at(box(0.27, 0.21, 0.21, 'black', { r: 0.02 }), [0.62, y, 0]),
    at(box(0.12, 0.08, 0.1, 'black'), [0.64, y + 0.13, -0.05]),
    at(cyl(0.1, 0.04, 'black', { axis: 'x' }), [0.49, y, 0]),
  ), [0.85, 0, 0]);
  P('23', group(
    at(box(0.19, 0.16, 0.16, 'black', { r: 0.015 }), [0.85, y, 0]),
    at(box(0.08, 0.06, 0.08, 'black'), [0.87, y + 0.1, 0.04]),
    at(box(0.06, 0.05, 0.05, 'darkSteel'), [0.93, y + 0.03, 0.1]),
  ), [1.15, 0, 0]);

  // Raccords de pompes : brides séparées, joints toriques, adaptateurs coudés
  const flange = (w) => group(at(box(0.012, w * 0.5, w, 'steel'), [0, 0, 0]));
  // Pompe 71, côté -Z (aspiration #32) : 14, 15, 13
  P('14', at(group(box(0.07, 0.012, 0.035, 'steel'), at(box(0.07, 0.012, 0.035, 'steel'), [0, 0, 0.045])), [0.62, y, -0.13], [Math.PI / 2, 0, 0]), [0.85, 0, -0.22]);
  P('15', torus(0.03, 0.005, 'rubber', { axis: 'z', pos: [0.62, y, -0.108] }), [0.85, 0, -0.16]);
  P('13', tube([[0.62, y, -0.13], [0.62, y, -0.2], [0.62, y - 0.06, -0.25], [0.62, y - 0.15, -0.27]], 0.035, 'steel'), [0.85, 0, -0.35]);
  // Pompe 71, dessus (#16) : 18, 17, 19
  P('18', at(box(0.06, 0.012, 0.05, 'steel'), [0.6, y + 0.112, 0.04]), [0.85, 0.22, 0]);
  P('17', torus(0.018, 0.004, 'rubber', { axis: 'y', pos: [0.6, y + 0.106, 0.04] }), [0.85, 0.16, 0]);
  P('19', tube([[0.6, y + 0.12, 0.04], [0.6, y + 0.18, 0.04], [0.6, y + 0.21, 0.1], [0.6, y + 0.21, 0.16]], 0.022, 'steel'), [0.85, 0.32, 0.05]);
  // Pompe 28, dessus (#16 / #12) : 21, 22, 20
  P('21', at(box(0.05, 0.012, 0.045, 'steel'), [0.83, y + 0.09, -0.03]), [1.15, 0.2, 0]);
  P('22', torus(0.015, 0.004, 'rubber', { axis: 'y', pos: [0.83, y + 0.084, -0.03] }), [1.15, 0.15, 0]);
  P('20', tube([[0.83, y + 0.1, -0.03], [0.83, y + 0.17, -0.03], [0.83, y + 0.2, -0.09], [0.83, y + 0.2, -0.15]], 0.02, 'steel'), [1.15, 0.3, -0.05]);
  // Pompe 28, côté -Z (#20) : 25, 24, 26
  P('25', at(group(box(0.06, 0.012, 0.03, 'steel'), at(box(0.06, 0.012, 0.03, 'steel'), [0, 0, 0.04])), [0.85, y - 0.02, -0.1], [Math.PI / 2, 0, 0]), [1.15, 0, -0.2]);
  P('24', torus(0.022, 0.005, 'rubber', { axis: 'z', pos: [0.85, y - 0.02, -0.083] }), [1.15, 0, -0.14]);
  P('26', tube([[0.85, y - 0.02, -0.1], [0.85, y - 0.02, -0.16], [0.85, y - 0.07, -0.2], [0.85, y - 0.13, -0.21]], 0.026, 'steel'), [1.15, 0, -0.32]);
  void flange; void nut;
  return { view: { dir: [0.55, 0.55, 1.2] } };
}

export function F09(api) {
  const { box, cyl, ring, torus, tube, at, group, plate, extrude, valveBank, enclosure, ballValve, fitting, filterCanister, gear, shell } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // 1 — Plaque principale avec découpes
  P('1', at(plate(2.3, 1.5, 0.025, 'red', {
    cutouts: [[0.05, 0.42, 0.5, 0.3], [-0.6, -0.45, 0.4, 0.3], [0.75, 0.1, 0.25, 0.4]],
    holes: [[1.0, -0.6, 0.04]],
  }), [0, -0.0125, 0]), [0, 0, 0]);

  // Moteur principal (F10), axe selon Z : poulie côté gauche (-Z), pompes à droite (+Z)
  const motor = api.sub('F10');
  motor.rotation.y = -Math.PI / 2;
  motor.position.set(0.4, 0, -0.3);
  P('F10', motor, [0, 0.75, 0]);

  // 21 — Surpresseur (compresseur bicylindre en V) sur 22 — plaque de base
  const bx = -0.32, bz = -0.3;
  P('22', at(box(0.5, 0.03, 0.5, 'red'), [bx, 0.015, bz]), [0, 0.45, 0]);
  const vcyl = (s) => group(
    at(cyl(0.075, 0.22, 'black'), [0, 0.11, 0]),
    ...Array.from({ length: 6 }, (_, i) => at(box(0.2, 0.012, 0.2, 'black'), [0, 0.04 + i * 0.03, 0])),
    at(box(0.16, 0.06, 0.18, 'black', { r: 0.01 }), [0, 0.25, 0]),
  ).rotateZ(s * 0.6);
  P('21', group(
    at(box(0.32, 0.26, 0.34, 'black', { r: 0.02 }), [0, 0.16, 0]),
    at(vcyl(1), [-0.05, 0.27, 0]),
    at(vcyl(-1), [0.05, 0.27, 0]),
    tube([[-0.2, 0.47, 0], [-0.1, 0.56, 0], [0.1, 0.56, 0], [0.2, 0.47, 0]], 0.025, 'darkSteel'),
    at(cyl(0.035, 0.5, 'steel', { axis: 'z' }), [0, 0.25, -0.25]),
  ).translateX(bx).translateY(0.03).translateZ(bz), [0, 1.0, 0]);
  // 24 — Volant (poulie du surpresseur), aligné avec la poulie moteur
  const spokes = [0, 2.09, 4.19].map((a) => at(box(0.035, 0.36, 0.02, 'black'), [0, 0, 0], [0, 0, a]));
  P('24', group(
    ring(0.25, 0.21, 0.07, 'black', { axis: 'z', seg: 48 }),
    ...[-0.02, 0.0, 0.02].map((dz) => at(torus(0.25, 0.006, 'darkSteel', { axis: 'z' }), [0, 0, dz])),
    cyl(0.05, 0.08, 'black', { axis: 'z' }),
    ...spokes,
  ).translateX(bx).translateY(0.28).translateZ(-0.76), [0, 1.0, -0.55]);
  // 29 — Garde de courroie (côté gauche)
  const gshape = [];
  for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + (i / 12) * Math.PI; gshape.push([bx + Math.cos(a) * 0.3, 0.28 + Math.sin(a) * 0.3]); }
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI; gshape.push([0.4 + Math.cos(a) * 0.2, 0.26 + Math.sin(a) * 0.2]); }
  P('29', group(
    at(extrude(gshape, 0.14, 'black'), [0, 0, -0.78]),
    at(cyl(0.17, 0.01, 'lightGrey', { axis: 'z' }), [bx, 0.28, -0.855]),
  ), [0, 0, -0.75]);

  // Distributeurs : 14 support + 16 banc de forage ; 19 support + 20 banc de mise en place
  const support = () => group(
    at(box(0.36, 0.02, 0.24, 'black'), [0, 0.42, 0]),
    at(box(0.02, 0.42, 0.24, 'black'), [-0.17, 0.21, 0]),
    at(box(0.36, 0.02, 0.24, 'black'), [0, 0.01, 0]),
  );
  P('14', at(support(), [-0.82, 0, 0.5]), [0, 0.4, 0.2]);
  P('16', at(valveBank(6, { sw: 0.045, h: 0.17, d: 0.13 }), [-0.8, 0.12, 0.5]), [0.1, 0.65, 0.25]);
  P('19', at(support(), [-0.82, 0, 0.12]), [0, 0.4, 0]);
  P('20', at(valveBank(5, { sw: 0.045, h: 0.17, d: 0.13 }), [-0.8, 0.12, 0.12]), [0.1, 0.65, 0]);
  // 9 / 10 — Boîtes de jonction électriques (forage / mise en place), face vers l'arrière
  const jb = () => { const e = enclosure(0.3, 0.36, 0.16, 'grey'); e.rotation.y = -Math.PI / 2; return e; };
  P('9', at(jb(), [-1.05, 0.2, 0.52]), [-0.55, 0.35, 0.1]);
  P('10', at(jb(), [-1.05, 0.2, 0.14]), [-0.55, 0.35, 0]);
  // 11-13 — Manifolds retenue / descente (×2) avec cartouches et bobines
  [-0.42, -0.6].forEach((z) => {
    P('13', at(box(0.08, 0.08, 0.1, 'brass', { r: 0.006 }), [-0.95, 0.06, z]), [-0.2, 0.4, 0]);
    P('11', at(cyl(0.012, 0.08, 'steel', { axis: 'x' }), [-1.02, 0.07, z]), [-0.45, 0.4, 0]);
    P('12', cyl(0.025, 0.05, 'grey', { axis: 'x', pos: [-1.07, 0.07, z] }), [-0.6, 0.4, 0]);
  });
  // 8 — Valve de séquence + 7 cartouche
  P('8', at(box(0.1, 0.06, 0.08, 'grey'), [-0.95, 0.04, -0.2]), [-0.2, 0.35, 0]);
  P('7', cyl(0.012, 0.07, 'steel', { axis: 'x', pos: [-1.03, 0.045, -0.2] }), [-0.45, 0.35, 0]);
  // 15 — Lubrificateur ; 18 — Valves charge/décharge Rexroth (×2)
  P('15', group(cyl(0.035, 0.08, 'grey'), at(cyl(0.02, 0.04, 'black'), [0, 0.06, 0])).translateX(-0.05).translateY(0.04).translateZ(0.62), [0, 0.45, 0.15]);
  [-0.18, -0.42].forEach((z) => P('18', group(box(0.06, 0.05, 0.05, 'black'), at(cyl(0.02, 0.06, 'black'), [0, 0.05, 0])).translateX(bx + 0.15).translateY(0.62).translateZ(z), [0, 1.25, 0]));
  // 25 — Admission d'air ; 26 — Filtre atmosphérique ; 27 — élément
  P('25', cyl(0.05, 0.42, 'black', { axis: 'z', pos: [bx - 0.12, 0.6, 0.02] }), [0, 1.2, 0.15]);
  P('26', group(shell(0.12, 0.108, 0.1, 'black'), at(cyl(0.125, 0.015, 'black'), [0, 0.06, 0]), at(cyl(0.012, 0.03, 'steel'), [0, 0.08, 0])).translateX(bx - 0.12).translateY(0.65).translateZ(0.3), [0, 1.45, 0.25]);
  P('27', group(ring(0.09, 0.05, 0.12, 'cream'), ...Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return at(box(0.004, 0.12, 0.03, 'darkSteel'), [Math.cos(a) * 0.09, 0, Math.sin(a) * 0.09], [0, -a, 0]); })).translateX(bx - 0.12).translateY(0.64).translateZ(0.3), [0, 1.7, 0.45]);
  // 17 — Boyau 1 1/2" x 34" ; 23 — boyau 2" x 36"
  P('17', tube([[bx + 0.2, 0.5, -0.3], [bx + 0.35, 0.7, -0.1], [bx + 0.5, 0.5, 0.15], [0.55, 0.12, 0.3]], 0.03, 'steel'), [0, 0.95, 0.2]);
  P('23', tube([[0.9, 0.1, -0.45], [0.85, 0.45, -0.4], [0.7, 0.55, -0.15], [0.62, 0.3, 0.02]], 0.035, 'steel'), [0.25, 0.7, 0]);
  // Avant : 4 vanne 2" HP + 3 actionneur, 5 entretoise, 6 accouplement ; 2 clapet 2" ; 28 vanne 3 voies
  P('4', at(ballValve(0.06, 'brass', { axis: 'x' }), [0.95, 0.06, -0.45]), [0.45, 0.25, 0]);
  P('2', group(cyl(0.045, 0.12, 'steel', { axis: 'x' }), at(nut(api, 0.1, 0.03), [0.07, 0, 0]), at(nut(api, 0.1, 0.03), [-0.07, 0, 0])).translateX(1.12).translateY(0.06).translateZ(-0.45), [0.75, 0.25, 0]);
  P('28', group(cyl(0.05, 0.14, 'steel', { axis: 'x' }), at(cyl(0.05, 0.08, 'steel', { axis: 'z' }), [0, 0, 0.06]), at(box(0.08, 0.06, 0.08, 'steel'), [0, 0.03, 0])).translateX(0.95).translateY(0.06).translateZ(0.45), [0.45, 0.25, 0]);
  [[0.95, -0.45], [0.95, 0.45]].forEach(([x, z]) => {
    P('6', cyl(0.018, 0.04, 'steel', { pos: [x, 0.12, z] }), [0.45, 0.45, 0]);
    P('5', at(box(0.08, 0.05, 0.08, 'grey'), [x, 0.165, z]), [0.45, 0.6, 0]);
    P('3', at(box(0.1, 0.09, 0.1, 'blue', { r: 0.008 }), [x, 0.235, z]), [0.45, 0.8, 0]);
  });
  void ring; void fitting; void filterCanister; void gear;
  return { view: { dir: [0.9, 0.85, 1.0] } };
}

function nut(api, d, h) {
  return api.S.nut(d, h, 'steel', { axis: 'x' });
}

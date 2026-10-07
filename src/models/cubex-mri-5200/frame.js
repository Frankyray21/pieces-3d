// Châssis de foreuse (F08). Repère machine : X vers l'avant (mât), Y vers le
// haut, +Z côté droit. Le châssis s'étend de x = -2.25 (arrière) à 1.3.

export const FRAME = {
  topY: 0.95,
  halfW: 0.44,
  actuator: { x: 1.55, y: 1.0 },
  flangeX: 1.84,
};

export function F08(api) {
  const { box, cyl, ring, tube, rod, at, group, extrude, hydCylinder, ballValve, fitting, nut, gauge } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { topY, halfW, actuator } = FRAME;

  // 4 — Châssis : flancs, échelle supérieure, fond, poutre avant de glissière
  const side = [[-2.25, 0.3], [-2.25, topY], [0.85, topY], [1.3, 0.62], [1.3, 0.32], [0.95, 0.15], [-1.62, 0.15], [-1.85, 0.3]];
  const holes = [[-1.2, 0.33, 0.1], [0.35, 0.42, 0.12]];
  const frame = group(
    at(extrude(side, 0.022, 'redDark', { holes }), [0, 0, halfW]),
    at(extrude(side, 0.022, 'redDark', { holes }), [0, 0, -halfW]),
    ...[-2.15, -1.7, -1.25, -0.8, -0.35, 0.1, 0.55].map((x) => at(box(0.07, 0.07, halfW * 2, 'red'), [x, topY - 0.035, 0])),
    at(box(3.1, 0.06, 0.06, 'red'), [-0.7, topY - 0.03, halfW - 0.03]),
    at(box(3.1, 0.06, 0.06, 'red'), [-0.7, topY - 0.03, -halfW + 0.03]),
    at(box(2.55, 0.015, halfW * 2, 'redDark'), [-0.35, 0.16, 0]),
    at(box(0.02, 0.63, halfW * 2, 'redDark'), [-2.25, 0.62, 0]),
    // Poutre transversale avant (glissière latérale)
    at(box(0.2, 0.26, 1.24, 'red'), [1.2, 0.6, 0]),
    rod([0.85, topY - 0.03, halfW], [1.2, 0.73, 0.5], 0.03, 'red'),
    rod([0.85, topY - 0.03, -halfW], [1.2, 0.73, -0.5], 0.03, 'red'),
    // Trappes latérales
    at(box(0.4, 0.3, 0.01, 'redDark'), [-0.6, 0.55, halfW + 0.015]),
    at(box(0.4, 0.3, 0.01, 'redDark'), [-0.6, 0.55, -halfW - 0.015]),
  );
  P('4', frame, [0, 0, 0]);

  // Rails de la glissière (empilés sur la face avant de la poutre) : 29, 27, 28, 26
  const rails = [['29', 1.305, 0.012, 'steel', 0.3], ['27', 1.317, 0.008, 'darkSteel', 0.42], ['28', 1.33, 0.016, 'red', 0.54], ['26', 1.35, 0.02, 'red', 0.68]];
  rails.forEach(([ref, x, t, m, e]) => {
    for (const y of [0.7, 0.5]) P(ref, at(box(t, 0.055, 1.22, m), [x, y, 0]), [e, (y > 0.6 ? 0.1 : -0.1), 0]);
  });

  // 25 — Support coulissant de l'actionneur rotatif (ligne absente de la liste)
  const gus = [[-0.18, -0.25], [0.12, -0.25], [0.12, 0.25], [-0.02, 0.25]];
  P('25', group(
    at(box(0.04, 0.5, 0.56, 'black'), [1.39, 0.65, 0]),
    at(extrude(gus, 0.03, 'black'), [1.55, 0.7, 0.24]),
    at(extrude(gus, 0.03, 'black'), [1.55, 0.7, -0.24]),
    at(box(0.32, 0.03, 0.5, 'black'), [1.53, 0.45, 0]),
  ), [0.3, 0.2, 0]);

  // 15 — Actionneur rotatif : deux corps verticaux + carter + arbre selon X
  const ra = group(
    at(box(0.24, 0.28, 0.32, 'red', { r: 0.02 }), [0, 0, 0]),
    at(cyl(0.085, 0.62, 'red'), [0.02, 0.05, 0.1]),
    at(cyl(0.085, 0.62, 'red'), [0.02, 0.05, -0.1]),
    at(cyl(0.1, 0.05, 'red'), [0.02, 0.38, 0.1]),
    at(cyl(0.1, 0.05, 'red'), [0.02, 0.38, -0.1]),
    at(cyl(0.07, 0.42, 'red', { axis: 'x' }), [0.1, 0, 0]),
    at(cyl(0.05, 0.28, 'red', { axis: 'z' }), [-0.04, -0.12, 0]),
  );
  P('15', at(ra, [actuator.x, actuator.y, 0]), [0.45, 0.55, 0]);
  P('23', group(
    ring(0.17, 0.05, 0.045, 'red', { axis: 'x' }),
    ...Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return at(cyl(0.012, 0.05, 'steel', { axis: 'x' }), [0.005, Math.cos(a) * 0.135, Math.sin(a) * 0.135]);
    }),
  ).translateX(FRAME.flangeX).translateY(actuator.y), [0.9, 0.55, 0]);
  for (const s of [1, -1]) {
    const half = extrude([[0.075, 0], [0.13, 0], ...Array.from({ length: 9 }, (_, i) => { const a = (i / 8) * Math.PI; return [Math.cos(a) * 0.13, Math.sin(a) * 0.13]; }).slice(1, 8), [-0.13, 0], [-0.075, 0], ...Array.from({ length: 9 }, (_, i) => { const a = Math.PI - (i / 8) * Math.PI; return [Math.cos(a) * 0.075, Math.sin(a) * 0.075]; }).slice(1, 8)], 0.04, 'red');
    half.rotation.y = Math.PI / 2;
    if (s < 0) half.rotation.x = Math.PI;
    P('22', at(group(half), [1.78, actuator.y, 0]), [0.72, 0.55 + s * 0.22, 0]);
  }

  // 17 — Leviers, 18 — bagues de pivot, 24 — vérins de bascule, 16 — axes, 14 — valves d'équilibrage
  for (const s of [1, -1]) {
    const z = s * 0.25;
    P('17', group(
      at(box(0.12, 0.36, 0.05, 'red', { r: 0.01 }), [0, 0.1, 0]),
      at(cyl(0.07, 0.07, 'red', { axis: 'z' }), [0, -0.08, 0]),
      at(cyl(0.05, 0.07, 'red', { axis: 'z' }), [-0.03, 0.27, 0]),
    ).translateX(actuator.x - 0.04).translateY(actuator.y - 0.12).translateZ(z), [0.3, 0.3, s * 0.42]);
    P('18', cyl(0.045, 0.06, 'brass', { axis: 'z', pos: [actuator.x - 0.04, actuator.y - 0.2, s * 0.31] }), [0.3, 0.15, s * 0.62]);
    const cylG = hydCylinder(0.62, 0.09, { ext: 0.4 });
    const a = [1.2, 0.36, s * 0.34], b = [actuator.x - 0.07, actuator.y + 0.13, s * 0.34];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    cylG.rotation.z = ang;
    cylG.position.set(...a);
    P('24', cylG, [0, -0.05, s * 0.55]);
    P('16', cyl(0.022, 0.13, 'steel', { axis: 'z', pos: a }), [0, -0.05, s * 0.85]);
    P('16', cyl(0.022, 0.13, 'steel', { axis: 'z', pos: b }), [0.25, 0.25, s * 0.85]);
    P('14', at(box(0.08, 0.06, 0.06, 'black', { r: 0.006 }), [1.3, 0.55, s * 0.42]), [0, 0.15, s * 0.7]);
  }

  // 1 — Vérin de glissière (selon Z sous la poutre avant), 2 rondelle, 3 écrou
  const so = hydCylinder(1.05, 0.1, { axis: 'z', ext: 0.4 });
  so.position.set(1.2, 0.4, -0.52);
  P('1', so, [0.1, -0.4, 0]);
  P('2', ring(0.05, 0.022, 0.012, 'steel', { axis: 'z', pos: [1.2, 0.4, 0.6] }), [0.1, -0.4, 0.35]);
  P('3', nut(0.07, 0.04, 'steel', { axis: 'z', pos: [1.2, 0.4, 0.63] }), [0.1, -0.4, 0.45]);

  // 12 — Réservoir d'air (selon Z, dans le châssis) + 11 soupape + 9/10 raccords + 8 collecteur
  P('12', group(
    cyl(0.2, 0.62, 'black', { axis: 'z' }),
    at(cyl(0.2, 0.08, 'black', { axis: 'z', r2: 0.13 }), [0, 0, 0.35]),
    at(cyl(0.13, 0.08, 'black', { axis: 'z', r2: 0.2 }), [0, 0, -0.35]),
    at(box(0.3, 0.04, 0.5, 'black'), [0, -0.21, 0]),
  ).translateX(-0.45).translateY(0.42), [0, 1.0, 0]);
  P('11', group(cyl(0.022, 0.08, 'brass'), at(cyl(0.012, 0.06, 'brass', { axis: 'x' }), [0.03, 0.02, 0]), at(torus2(api), [0, 0.05, 0])).translateX(-0.4).translateY(0.67).translateZ(0.12), [0, 1.35, 0]);
  P('9', at(fitting(0.03, 0.06, 'steel'), [-0.55, 0.65, -0.05]), [0, 1.2, -0.1]);
  P('10', at(fitting(0.03, 0.06, 'steel', { elbow: true }), [-0.48, 0.65, -0.15]), [0, 1.2, -0.2]);
  P('8', group(box(0.16, 0.12, 0.12, 'grey', { r: 0.01 }), at(cyl(0.035, 0.05, 'grey'), [0.03, 0.08, 0])).translateX(-0.75).translateY(0.7).translateZ(0.2), [0, 1.15, 0.1]);

  // 13 — Refroidisseur d'air (ailettes) et 7 — boyau tressé 2"x24"
  P('13', group(
    box(0.12, 0.42, 0.34, 'black', { r: 0.01 }),
    ...Array.from({ length: 9 }, (_, i) => at(box(0.13, 0.008, 0.32, 'darkSteel'), [0, -0.18 + i * 0.045, 0])),
    at(cyl(0.035, 0.08, 'black', { axis: 'z' }), [0, 0.15, 0.2]),
  ).translateX(0.62).translateY(0.62), [0, 0.85, 0]);
  P('7', tube([[-0.45, 0.42, 0.33], [-0.2, 0.42, 0.4], [0.3, 0.6, 0.35], [0.62, 0.77, 0.22]], 0.03, 'steel'), [0, 0.95, 0.15]);

  // Arrière : 5 vanne 2" HP + 6 bloc séparé ; 19-21 cloisons + 30-33 raccords et vannes
  P('5', at(ballValve(0.055, 'brass'), [-2.36, 0.62, -0.28]), [-0.45, 0, 0]);
  P('6', group(box(0.09, 0.1, 0.12, 'blue', { r: 0.01 }), at(cyl(0.03, 0.13, 'darkSteel', { axis: 'x' }), [0, 0, 0])).translateX(-2.28).translateY(0.62).translateZ(-0.28), [-0.3, 0, 0]);
  P('21', at(box(0.02, 0.22, 0.32, 'red'), [-2.27, 0.68, 0.22]), [-0.25, 0, 0]);
  P('19', at(box(0.015, 0.1, 0.3, 'red'), [-2.29, 0.74, 0.22]), [-0.35, 0.08, 0]);
  P('20', at(box(0.015, 0.1, 0.3, 'red'), [-2.29, 0.62, 0.22]), [-0.35, -0.08, 0]);
  [0.13, 0.22, 0.31].forEach((z, i) => {
    P('30', at(fitting(0.022, 0.05, 'brass', { axis: 'x' }), [-2.32, 0.74, z]), [-0.5, 0.12, 0]);
    P('31', at(fitting(0.02, 0.045, 'brass', { axis: 'x' }), [-2.32, 0.62, z]), [-0.5, -0.12, 0]);
    if (i < 2) P('32', at(ballValve(0.018, 'brass', { axis: 'x' }), [-2.37, 0.62, z]), [-0.65, -0.12, 0]);
    else P('33', at(ballValve(0.022, 'brass', { axis: 'x' }), [-2.37, 0.62, z]), [-0.65, -0.12, 0]);
  });

  return { view: { dir: [0.85, 0.75, 1.05] } };
}

function torus2(api) {
  return api.S.torus(0.02, 0.004, 'brass', { axis: 'y' });
}

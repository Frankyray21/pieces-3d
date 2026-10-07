// Toit / canopée (F13). Repère : pieds du cadre au niveau du plancher (y = 0).

export function F13(api) {
  const { box, cyl, tube, at, group, plate, gauge, filterCanister, fitting, ballValve } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const T = 0.85, X0 = -1.0, X1 = 1.0, Z = 0.7, r = 0.028;

  // 1 — Cadre tubulaire : cadre supérieur, traverses, 4 pattes avec semelles
  const legs = [
    [[X0 + 0.05, T, Z - 0.05], [X0 + 0.05, 0, Z - 0.05]],
    [[X0 + 0.05, T, -Z + 0.05], [X0 + 0.05, 0, -Z + 0.05]],
    [[X1 - 0.05, T, Z - 0.05], [X1 - 0.25, 0, Z - 0.08]],
    [[X1 - 0.05, T, -Z + 0.05], [X1 - 0.25, 0, -Z + 0.08]],
  ];
  P('1', group(
    tube([[X0, T, Z], [X1, T, Z], [X1, T, -Z], [X0, T, -Z], [X0, T, Z]], r, 'red', { sharp: true, seg: 8 }),
    tube([[-0.3, T, Z], [-0.3, T, -Z]], r, 'red', { sharp: true, seg: 2 }),
    tube([[0.35, T, Z], [0.35, T, -Z]], r, 'red', { sharp: true, seg: 2 }),
    tube([[-0.3, T, -0.2], [X1, T, -0.2]], r * 0.8, 'red', { sharp: true, seg: 2 }),
    ...legs.map(([a, b]) => tube([a, b], r, 'red', { sharp: true, seg: 2 })),
    ...legs.map(([, b]) => at(box(0.14, 0.012, 0.1, 'red'), [b[0], 0.006, b[2]])),
    tube([[X1 - 0.15, 0.45, Z - 0.065], [X1 - 0.15, 0.45, -Z + 0.065]], r * 0.7, 'red', { sharp: true, seg: 2 }),
  ), [0, 0, 0]);

  // Couvercles : 2 (grand, avec trappe ronde), 3 (bande), 4 (avant droit)
  P('2', group(
    plate(1.32, 1.42, 0.008, 'charcoal', { holes: [[-0.35, -0.2, 0.08]] }),
    at(cyl(0.11, 0.012, 'darkSteel'), [-0.35, 0.012, 0.2]),
  ).translateX(-0.34).translateY(T + r + 0.004), [0, 0.5, 0]);
  P('3', at(plate(0.64, 0.48, 0.008, 'charcoal'), [0.67, T + r + 0.004, -0.46]), [0.1, 0.65, -0.1]);
  P('4', at(plate(0.64, 0.92, 0.008, 'charcoal'), [0.67, T + r + 0.004, 0.24]), [0.1, 0.8, 0.1]);

  // 9 — Plaque de manomètres sur la patte avant droite + 10-15 manomètres
  const gx = X1 - 0.17, gz = Z - 0.02;
  P('9', at(plate(0.11, 0.62, 0.012, 'grey', { holes: [0, 1, 2, 3, 4, 5, 6].map((i) => [0, -0.27 + i * 0.09, 0.03]) }), [gx, 0.48, gz + 0.02], [Math.PI / 2, 0, 0]), [0, 0, 0.3]);
  ['15', '14', '13', '12', '11', '10'].forEach((ref, i) => {
    P(ref, at(gauge(0.035, { axis: 'z' }), [gx, 0.75 - i * 0.09, gz + 0.04]), [0, 0, 0.55]);
  });
  // 5 — Bloc transmetteurs de pression, 6 — raccord, 7 — clapet navette, 8 — valve de décharge auto, 16 — valve de couple de rotation
  P('5', at(box(0.16, 0.08, 0.07, 'red', { r: 0.008 }), [X1 - 0.33, 0.12, Z - 0.12]), [0.2, 0.1, 0.35]);
  P('6', at(fitting(0.02, 0.05, 'steel', { axis: 'x' }), [X1 - 0.22, 0.12, Z - 0.12]), [0.35, 0.1, 0.35]);
  P('7', at(box(0.06, 0.03, 0.03, 'brass', { r: 0.004 }), [X1 - 0.32, 0.2, Z - 0.12]), [0.2, 0.3, 0.35]);
  P('8', group(cyl(0.03, 0.08, 'steel'), at(cyl(0.02, 0.04, 'black'), [0, 0.06, 0])).translateX(X1 - 0.45).translateY(0.08).translateZ(Z - 0.15), [0, 0.3, 0.4]);
  P('16', group(box(0.07, 0.07, 0.07, 'darkSteel', { r: 0.006 }), at(cyl(0.008, 0.06, 'steel', { axis: 'x' }), [0.06, 0, 0]), at(box(0.01, 0.05, 0.01, 'red'), [0.09, 0.02, 0])).translateX(X1 - 0.17).translateY(0.2).translateZ(Z - 0.12), [0.3, 0.25, 0.25]);

  // 17 — Filtres haute pression (×2) suspendus sous le toit, 18 — éléments
  [-0.35, -0.08].forEach((z) => {
    P('17', at(filterCanister(0.055, 0.34, 'black'), [0.62, T - 0.02, z]), [0, -0.35, 0]);
    P('18', at(cyl(0.035, 0.22, 'cream'), [0.62, T - 0.2, z]), [0, -0.75, 0]);
  });
  void ballValve;
  return { view: { dir: [0.9, 0.75, 1.05] } };
}

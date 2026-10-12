// P420 — Pont arrière « ASSY, REAR DECK » CX035391 (page 420) : cadre du pont
// (1, « FRAME - ARIES/PEGAS », mécano-soudé dessiné ici), capot du
// compresseur (2, P422), installation du surpresseur (3, P430) et
// accessoires du pont (4, P488), ces trois ensembles dessinés dans le repère
// machine (../layout.js) et posés à l'identité.
// Cadre (repère machine, cotes du châssis du pont de ../reardeck.js et de
// DECK dans _reara.js) : deux flancs de 25 mm à z = ±0.86 (faces extérieures
// à ±0.8725), de y = 0.48 à 1.0, du pare-chocs (x = −4.4) à l'about avant
// (x = −2.755), coin arrière bas chanfreiné, grande fenêtre d'accès fermée par
// les portes P488 rep. 10 / 11 (x −4.0 … −3.29) ; plats de rive sur le dessus
// des flancs ; plancher de 20 mm (dessus à y = 0.5) percé de trous de
// purge ; traverse avant (x −2.805 … −2.755) boulonnée sur l'about du
// châssis arrière du porteur par huit vis H 3/4 po ; traverse arrière
// (derrière : pare-chocs P488) ; deux traverses en U 6 po sous le socle du
// surpresseur (dessus à y = 1.0) ; quatre anneaux de levage sur les plats de
// rive ; cordons de soudure aux jonctions.
// Tout est sur le châssis arrière (pas d'étiquette de simulation).
const IN = 0.0254;
const X0 = -4.4, X1 = -2.755, YB = 0.48, YT = 1.0, Z = 0.86, T = 0.025;
const WIN = { x0: -4.0, x1: -3.29, y0: 0.53, y1: 0.96 }; // fenêtre d'accès des flancs

export default function P420(api) {
  const { box, extrude, plate, bolt, weld, merged, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const zi = Z - T / 2; // face intérieure des flancs

  // Flanc : partie arrière chanfreinée, partie avant pleine, longerons haut et bas de la fenêtre.
  const flank = (s) => {
    const z = s * Z;
    const rear = extrude([[X0, 0.62], [X0 + 0.15, YB], [WIN.x0, YB], [WIN.x0, YT], [X0, YT]], T, 'lightGrey');
    const front = extrude([[WIN.x1, YB], [X1, YB], [X1, YT], [WIN.x1, YT]], T, 'lightGrey', {
      holes: s < 0 ? [[-3.02, 0.74, 0.09]] : [],
    });
    return group(
      at(rear, [0, 0, z]), at(front, [0, 0, z]),
      at(box(WIN.x1 - WIN.x0, YT - WIN.y1, T, 'lightGrey'), [(WIN.x0 + WIN.x1) / 2, (YT + WIN.y1) / 2, z]),
      at(box(WIN.x1 - WIN.x0, WIN.y0 - YB, T, 'lightGrey'), [(WIN.x0 + WIN.x1) / 2, (WIN.y0 + YB) / 2, z]),
      // plat de rive (80 × 16) sur le dessus du flanc, vers l'intérieur
      at(box(X1 - X0, 0.016, 0.08, 'lightGrey', { r: 0.002 }), [(X0 + X1) / 2, YT - 0.008, s * (zi - 0.04)]),
    );
  };
  // Traverse en U 6 po (C6 × 8.2) selon Z, dessus à y = 1.0, âme verticale vers l'avant.
  const channel = (x) => group(
    at(box(0.005, 0.152, 2 * zi, 'lightGrey'), [x, YT - 0.076, 0]),
    ...[YT - 0.0045, YT - 0.152 + 0.0045].map((y) => at(box(0.048, 0.009, 2 * zi, 'lightGrey'), [x - 0.024, y, 0])),
  );
  // Anneau de levage : plaque 1 po à œil Ø 1 1/2 po soudée debout sur le plat de rive.
  const lug = (x, z) => at(extrude([[-0.06, 0], [0.06, 0], [0.04, 0.07], [0.02, 0.085], [-0.02, 0.085], [-0.04, 0.07]], IN, 'lightGrey', {
    holes: [[0, 0.05, 0.75 * IN]],
  }), [x, YT, z]);
  // Trous de purge du plancher (Ø 1 po) entre les traverses.
  const drains = [];
  for (const x of [-4.2, -3.85, -3.45, -3.05]) for (const z of [-0.6, 0, 0.6]) drains.push([x - (X0 + X1) / 2, z, 0.5 * IN]);

  P('1', group(
    flank(1), flank(-1),
    at(plate(X1 - X0 - 0.06, 2 * zi, 0.02, 'lightGrey', { holes: drains }), [(X0 + X1) / 2, 0.49, 0]),
    at(box(0.05, YT - YB, 2 * zi, 'lightGrey'), [X1 - 0.025, (YT + YB) / 2, 0]),
    at(box(0.05, YT - 0.62, 2 * zi, 'lightGrey'), [X0 + 0.025, (YT + 0.62) / 2, 0]),
    channel(-4.3), channel(-3.68),
    lug(-4.3, 0.8), lug(-4.3, -0.8), lug(-2.9, 0.8), lug(-2.9, -0.8),
    // about avant : huit vis H 3/4 × 2 1/2 dans l'about du châssis arrière du porteur
    merged([0.6, 0.86].flatMap((y) => [-0.55, -0.25, 0.25, 0.55].map((z) => at(bolt(0.75 * IN, 2.5 * IN, 'zinc', { axis: 'x' }), [X1 - 0.05, y, z], [0, 0, Math.PI]))), 'zinc'),
    // cordons : flancs / traverses, flancs / plancher
    merged([1, -1].flatMap((s) => [
      weld([[X1 - 0.05, YB + 0.02, s * zi], [X1 - 0.05, YT - 0.02, s * zi]], 0.006, 'lightGrey'),
      weld([[X0 + 0.05, 0.64, s * zi], [X0 + 0.05, YT - 0.02, s * zi]], 0.006, 'lightGrey'),
      weld([[X0 + 0.2, 0.5, s * zi], [X1 - 0.06, 0.5, s * zi]], 0.006, 'lightGrey'),
    ]), 'lightGrey'),
  ), [0, -0.35, 0]);
  P('2', api.sub('P422'), [0, 0.8, 0]);
  P('3', api.sub('P430'), [0, 0.4, 0]);
  P('4', api.sub('P488'), [0, 0, 0]);
  return { view: { dir: [-1.1, 0.7, 1.0] } };
}

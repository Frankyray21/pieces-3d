// P198 — Option enrouleur de câble : CX003978B « CABLE REEL OPTION » (page
// 198), repère 6 de P186 (« CARRIER 5200, OPT 2, BUNDLE »). Support de bras
// (1, CM19101-12, « welding req'd to install ») : plaque verticale de 1 po
// soudée sur le flanc du porteur, deux oreilles en D de 1 po percées Ø 2 po
// qui reçoivent l'axe de pivot du bras ; enrouleur complet (2 = P200).
// Repère : origine au milieu du bord inférieur de la face arrière (soudée au
// porteur) de la plaque 1 ; Y vers le haut ; X le long du flanc du porteur
// (vers l'avant de la machine, le bras de l'enrouleur part vers -X) ; +Z vers
// l'extérieur de la machine. Axe de pivot à z = 0.11, base du tube de pivot de
// P200 à y = 0.42. Encombrement ≈ 1.85 (X) × 1.12 (Y) × 1.13 (Z) m.
// Plaque et oreilles estimées d'après la vue isométrique de la page 198.

const IN = 0.0254;

export default function P198(api) {
  const { S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  const T = 1 * IN; // plaque et oreilles
  const PW = 0.2, PH = 0.72; // plaque
  const ZA = T + 0.085; // axe de pivot
  const Y0 = 0.42; // base du tube de pivot (repère de P200)
  const wt = 0.25 * IN, TH = 0.2; // rondelle de butée, tube de pivot (P200)
  const RE = 0.065; // rayon du bout des oreilles

  // ---------------------------------------------------------------- 1 — support de bras
  const plateM = S.box(PW, PH, T, 'lightGrey', { r: 0.002, pos: [0, PH / 2, T / 2] });
  // Oreille en D dans le plan XZ : de la plaque jusqu'au bout arrondi autour de l'axe.
  const ear = (y0) => {
    const pts = [[-RE, 0], [RE, 0], [RE, ZA - T]];
    for (let i = 1; i < 16; i++) {
      const a = (i / 16) * Math.PI;
      pts.push([RE * Math.cos(a), ZA - T + RE * Math.sin(a)]);
    }
    pts.push([-RE, ZA - T]);
    const m = S.extrude(pts.map(([x, z]) => [x, -z]), T, 'lightGrey', { holes: [[0, -(ZA - T), 1.02 * IN]] });
    m.rotation.x = -Math.PI / 2;
    m.position.set(0, y0 + T / 2, T);
    return m;
  };
  const yLow = Y0 - wt - T, yHigh = Y0 + TH + wt;
  const welds = [];
  for (const y of [yLow, yHigh]) {
    for (const yy of [y - 0.003, y + T + 0.003]) welds.push(S.weld([[-RE + 0.003, yy, T + 0.003], [RE - 0.003, yy, T + 0.003]], 0.007, 'lightGrey'));
  }
  // Cordon de pose sur le porteur (« welding req'd ») : pourtour de la plaque.
  welds.push(S.weld([[-PW / 2 - 0.004, 0.01, 0.004], [-PW / 2 - 0.004, PH - 0.01, 0.004]], 0.009, 'lightGrey'));
  welds.push(S.weld([[PW / 2 + 0.004, 0.01, 0.004], [PW / 2 + 0.004, PH - 0.01, 0.004]], 0.009, 'lightGrey'));
  const wb = S.merged(welds, 'lightGrey');
  wb.geometry.userData.edgeAngle = 75;
  P('1', S.group(S.merged([plateM, ear(yLow), ear(yHigh)], 'lightGrey'), wb), [0, 0, -0.15]);

  // ---------------------------------------------------------------- 2 — enrouleur (P200)
  P('2', S.at(api.sub('P200'), [0, Y0, ZA]), [0, 0, 0.35]);

  return { view: { dir: [0.9, 0.55, 1.1] } };
}

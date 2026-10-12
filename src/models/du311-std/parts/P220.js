// P220 — Porteur « ASSY, DRIVABLE CARRIER, DU311 » CX030872 (pages 220 et
// 222) : réservoir de carburant (P224), repos du mât (P228), compartiment de
// service (P234), capot moteur (P240), moteur et ses équipements (P246),
// cabine (P278), porteur Pegasus (P292) et réservoir hydraulique (P326),
// tous dessinés dans le repère machine (../layout.js) et posés à
// l'identité ; quatre flexibles #16 6000 psi du circuit de translation
// (8 à 11), d'après la vue de dessus et le détail de la page 220 :
// - 10 et 11 : de la pompe de translation 90 cc (P246 rep. 3, brides A / B de
//   part et d'autre du corps) aux portées 1A et 1B sous le collecteur de
//   translation (P260, sous le filtre à air, côté gauche) ;
// - 8 et 9 : des portées A et B du collecteur au moteur hydraulique de la
//   boîte de transfert (P292 rep. 50, brides code 62 dessous et dessus),
//   le long du flanc intérieur gauche du châssis arrière.
// Tracés : longueurs de la liste à quelques centimètres près (les coudes
// des embouts absorbent l'écart). Tout est sur le châssis arrière.
const IN = 0.0254;
// Brides (repère machine) : pompe 90 cc, collecteur (dessous, y 1.21), moteur.
const PUMP_A = [-1.47, 1.32, -0.52], PUMP_B = [-1.77, 1.32, -0.52];
const MAN = { '1A': [-2.255, 1.209, -0.715], '1B': [-2.33, 1.209, -0.715], A: [-2.255, 1.209, -0.635], B: [-2.33, 1.209, -0.635] };
const MOT_A = [-0.79, 0.723, 0], MOT_B = [-0.79, 0.943, 0];

export default function P220(api) {
  const { hose } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const R = 0.75 * IN; // Ø ext. ≈ 1 1/2 po (tresse 4 nappes)

  P('1', api.sub('P224'), [0, -0.3, 0]);
  P('2', api.sub('P228'), [0.3, 0.4, 0]);
  P('3', api.sub('P234'), [0, 0, 0.5]);
  P('4', api.sub('P240'), [0, 0.8, 0]);
  P('5', api.sub('P246'), [0, 0.4, 0]);
  P('6', api.sub('P278'), [0, 0.6, 0.3]);
  P('7', api.sub('P292'), [0, 0, 0]);
  P('12', api.sub('P326'), [0.4, 0.3, 0]);

  // 8 — 97 po : portée B du collecteur → bride supérieure du moteur (arrive par le haut)
  P('8', hose([[MAN.B[0], MAN.B[1] - 0.02, MAN.B[2]], [-2.33, 1.06, -0.62], [-2.05, 0.98, -0.4], [-1.5, 1.08, -0.3],
    [-1.05, 1.1, -0.12], [-0.79, 1.08, 0], [MOT_B[0], MOT_B[1] + 0.02, MOT_B[2]]], R), [0.1, 0.25, 0]);
  // 9 — 107 po : portée A du collecteur → bride inférieure du moteur (arrive par le bas)
  P('9', hose([[MAN.A[0], MAN.A[1] - 0.02, MAN.A[2]], [-2.25, 1.02, -0.58], [-1.95, 0.84, -0.36], [-1.4, 0.7, -0.34],
    [-1.0, 0.6, -0.2], [-0.8, 0.58, -0.05], [MOT_A[0], MOT_A[1] - 0.02, MOT_A[2]]], R), [0.1, -0.25, 0]);
  // 10 — 44,5 po : orifice A de la pompe (vers l'avant) → portée 1A du collecteur
  P('10', hose([[PUMP_A[0], PUMP_A[1], PUMP_A[2]], [-1.36, 1.3, -0.53], [-1.42, 1.08, -0.62], [-1.95, 1.04, -0.71],
    [MAN['1A'][0], MAN['1A'][1] - 0.12, MAN['1A'][2]], [MAN['1A'][0], MAN['1A'][1] - 0.02, MAN['1A'][2]]], R), [0, -0.2, -0.3]);
  // 11 — 23,75 po : orifice B de la pompe (vers l'arrière) → portée 1B du collecteur
  P('11', hose([[PUMP_B[0], PUMP_B[1], PUMP_B[2]], [-1.88, 1.29, -0.55], [-2.05, 1.12, -0.68],
    [MAN['1B'][0], MAN['1B'][1] - 0.11, MAN['1B'][2]], [MAN['1B'][0], MAN['1B'][1] - 0.02, MAN['1B'][2]]], R), [0, -0.3, -0.3]);
  return { view: { dir: [-0.9, 0.8, 1.1] } };
}

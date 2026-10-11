// P264 — Trousse de filtre à huile déporté CP001971 rév. 1 (page 264) : « OIL
// FILTER KIT », repère 7 de P262. L'adaptateur sandwich (2) se visse à la
// place de la cartouche sur la console de filtre à huile du moteur, joint
// torique (5) dessus ; deux flexibles 3/4 po × 4 pi (6) le relient à la tête
// de filtre déportée (3), suspendue par sa patte coudée (4) à la cornière des
// filtres (P256 rep. 8) ; deux adaptateurs droits MNPT-JIC -12 (7) sur la
// tête, cartouche vissée dessous (1).
// Repère : repère moteur ENG (_moteur_surpresseur.js) — trousse posée sur le
// moteur, insérée telle quelle par P262 (et donc P256) à l'origine : origine
// sur l'axe du vilebrequin au plan SAE du carter de volant, +X vers la
// soufflante, Y haut, +Z côté injection. Tête déportée d'axe vertical en
// (ENG.filters.axisX, ENG.filters.oilZ), dessus à headTopY ; adaptateur 2
// sous la console du moteur (x = 0.47, y = −0.106, z = 0.215).
// Encombrement ≈ 0.57 (X) × 0.47 (Y) × 0.24 (Z) m.
// Cotes : flexibles 3/4 po (Ø ext. 32 mm) de 4 pi (1,22 m) ; cartouche Ø 94 ×
// 170 mm (Deutz) ; tête et adaptateur d'après les proportions de la page 264.
// Limite : la cartouche d'origine du moteur (P260 rep. 3) reste dessinée à la
// même place que l'adaptateur 2 quand les deux sont assemblés dans P256.
import { ENG } from './_moteur_surpresseur.js';

export default function P264(api) {
  const { box, cyl, lathe, plate, fitting, hose, bolt, nut, washer, torus, merged, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = ENG.filters;
  const HX = F.axisX, HZ = F.oilZ, HT = F.headTopY;
  const AX = 0.47, AY = -0.106, AZ = 0.215; // console de filtre à huile du moteur

  // 1 — cartouche vissée sous la tête : fond embouti, bourrelet de sertissage.
  const R1 = 0.047, H1 = 0.17, Y1 = HT - 0.045;
  P('1', lathe([
    [0, Y1 - H1], [R1 - 0.008, Y1 - H1], [R1, Y1 - H1 + 0.01], [R1, Y1 - 0.016],
    [R1 + 0.0015, Y1 - 0.012], [R1 + 0.0015, Y1 - 0.006], [R1 - 0.004, Y1], [0, Y1],
  ], 'black', { seg: 36, pos: [HX, 0, HZ] }), [0, -0.12, 0]);

  // 3 — tête de filtre : collerette, corps, deux bossages d'orifices dessus.
  const head = [
    lathe([[0.012, Y1], [0.052, Y1], [0.052, Y1 + 0.012], [0.044, Y1 + 0.016], [0.044, HT - 0.006], [0.04, HT], [0.012, HT]], 'castAlu', { seg: 36, pos: [HX, 0, HZ] }),
  ];
  for (const dx of [-0.017, 0.017]) head.push(at(cyl(0.013, 0.02, 'castAlu', { seg: 20 }), [HX + dx, HT + 0.008, HZ - 0.01]));
  P('3', merged(head, 'castAlu'), [0, -0.04, 0]);

  // 4 — patte coudée : languette sous le dessus de la tête (deux vis 10 de
  // P262), aile verticale percée de trois trous contre la cornière.
  const FX = F.flangeX;
  const tongue = at(plate(0.05, 0.05, 0.005, 'black', { holes: [[-0.008, -0.012, 0.004], [-0.008, 0.012, 0.004]] }), [FX - 0.026, HT + 0.0025, HZ + 0.02]);
  const wing = box(0.005, 0.065, 0.06, 'black', { r: 0.001, pos: [FX - 0.0025, HT + 0.032, HZ + 0.02] });
  P('4', group(merged([tongue, wing], 'black')), [0.04, 0.02, 0]);

  // 7 — adaptateurs droits MNPT-JIC -12 vissés dans les orifices de la tête.
  const ports = [-0.017, 0.017].map((dx) => [HX + dx, HT + 0.018, HZ - 0.01]);
  for (const p of ports) P('7', at(fitting(0.028, 0.05, 'zinc'), [p[0], p[1] + 0.012, p[2]]), [0, 0.05, 0]);

  // 2 — adaptateur sandwich vissé sur la console du moteur : galette usinée,
  // deux orifices dessous équipés de leurs raccords JIC.
  const ad = [lathe([[0.012, AY - 0.04], [0.052, AY - 0.04], [0.052, AY - 0.004], [0.046, AY], [0.02, AY], [0.02, AY - 0.01], [0.012, AY - 0.01]], 'castAlu', { seg: 36, pos: [AX, 0, AZ] })];
  const adPorts = [-0.018, 0.018].map((dz) => [AX, AY - 0.04, AZ + dz]);
  for (const p of adPorts) ad.push(at(cyl(0.014, 0.012, 'castAlu', { seg: 16 }), [p[0], p[1] - 0.006, p[2]]));
  const adFit = adPorts.map((p) => at(fitting(0.028, 0.05, 'zinc', { axis: '-y' }), [p[0], p[1] - 0.025, p[2]]));
  P('2', group(merged(ad, 'castAlu'), ...adFit), [0, -0.1, 0]);
  // 5 — joint torique sur le dessus de l'adaptateur.
  P('5', at(torus(0.036, 0.0025, 'rubber'), [AX, AY + 0.0015, AZ]), [0, 0.04, 0]);

  // 6 — flexibles 3/4 po × 4 pi : de l'adaptateur, descente, retour vers
  // l'arrière le long du flanc +Z sous le capot d'air, montée derrière la
  // cornière et arrivée par le haut sur les adaptateurs 7.
  const R6 = 0.016;
  for (let k = 0; k < 2; k++) {
    const a = adPorts[k], t = ports[k];
    const dz = k * 0.04;
    const pts = [
      [a[0], a[1] - 0.048, a[2]],
      [a[0] - 0.01, a[1] - 0.12, a[2] + 0.04 + dz],
      [a[0] - 0.12, -0.24, 0.33 + dz],
      [0.18, -0.16, 0.35 + dz],
      [0.06, 0.02, 0.34 + dz],
      [t[0] + 0.02, t[1] + 0.2, t[2] + 0.05],
      [t[0], t[1] + 0.13, t[2]],
      [t[0], t[1] + 0.035, t[2]],
    ];
    P('6', hose(pts, R6), [0.08, 0, 0.08]);
  }

  // Vis de la languette (repère 10 de P262) : dessinées par P262.
  void bolt; void nut; void washer;
  return { view: { dir: [-0.9, 0.55, 1.0] } };
}

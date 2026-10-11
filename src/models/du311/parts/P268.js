// P268 — Admission d'air du moteur CX011620 rév. 1 (page 268) : « AIR INLET
// ASSY, ENGINE D914L04 », repère 13 de P256. Filtre à air sec horizontal (3,
// éléments primaire CP80000-21 et de sécurité CP80000-22, soupape Vacuator
// CP02036 sous le couvercle de bout) tenu par deux colliers de fixation (2),
// chapeau d'entrée champignon (1) sur sa tubulure supérieure, indicateur de
// colmatage (8) sur la sortie. Vers le moteur : manchon réducteur à bosse
// 4 → 3 po (4, collier à boulon en T de 4 1/2 po, 7), tube 3 po × 3 po (9),
// coude 3 po (5) qui descend, tube 3 po × 5 po (10), second coude (5) qui
// revient vers l'arrière, second tube 3 po × 3 po (9) emboîté sur l'embout
// d'aspiration du moteur ; six colliers à boulon en T (6) sur les manchettes.
// Repère : repère moteur ENG (_moteur_surpresseur.js) — ensemble posé sur le
// moteur, inséré à l'origine par P256 (sur la console P256 rep. 15) : origine
// sur l'axe du vilebrequin au plan SAE du carter de volant, +X vers la
// soufflante, Y haut, +Z côté injection. Filtre d'axe X à y = 0.727, z =
// ENG.intake.z, sortie vers +X ; boucle de tuyaux à l'avant, qui rejoint
// l'embout 3 po du moteur (x = ENG.intake.x, y = ENG.intake.y).
// Encombrement ≈ 0.75 (X, de 0.08 à 0.84) × 0.62 (Y, de 0.40 à 1.02) × 0.32 (Z) m.
// Cotes : diamètres de la liste (4 et 3 po, collier 4 1/2 po, tubes 3 et 5 po
// de long) ; filtre Ø 11 × 17 po et chapeau d'après les proportions de la page 268.
import { ENG, IN } from './_moteur_surpresseur.js';

export default function P268(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, shell, tube, bolt, nut, merged, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const Z = ENG.intake.z, YB = ENG.intake.y, XI = ENG.intake.x;
  const RB = 0.075, CUFF = 0.035; // rayon de courbure et manchettes des coudes
  const R3 = 1.5 * IN, R4 = 2 * IN; // tubes 3 et 4 po
  const L10 = 5 * IN, L9 = 3 * IN;
  const YT = YB + 2 * RB + 2 * CUFF + (L10 - 0.06); // axe du filtre
  const XV = XI + 0.14; // branche verticale de la boucle
  const RF = 5.5 * IN, XF0 = 0.1, XF1 = 0.52; // filtre Ø 11 po

  // 3 — filtre à air : cuve, couvercle de bout bombé à soupape Vacuator (dessous),
  // fond côté sortie, tubulure de sortie 4 po, tubulure d'entrée supérieure ;
  // éléments primaire (crème, plissé) et de sécurité à l'intérieur.
  {
    const body = shell(RF, RF - 0.002, XF1 - XF0 - 0.04, 'black', { axis: 'x', seg: 48 });
    body.position.set((XF0 + XF1) / 2 + 0.02, YT, Z);
    const ends = [
      lathe([[0, XF0], [RF * 0.7, XF0 + 0.005], [RF + 0.004, XF0 + 0.03], [RF + 0.004, XF0 + 0.045], [RF - 0.002, XF0 + 0.045], [RF - 0.002, XF0 + 0.035], [0, XF0 + 0.012]].map(([r, x]) => [r, x]), 'black', { axis: 'x', seg: 48, pos: [0, YT, Z] }),
      lathe([[R4 - 0.002, XF1], [RF + 0.003, XF1 - 0.004], [RF + 0.003, XF1 - 0.03], [RF - 0.002, XF1 - 0.03], [RF - 0.002, XF1 - 0.012], [R4 - 0.002, XF1 - 0.008]].reverse(), 'black', { axis: 'x', seg: 48, pos: [0, YT, Z] }),
      // Ceinture de fermeture du couvercle.
      at(cyl(RF + 0.006, 0.012, 'black', { axis: 'x', seg: 48 }), [XF0 + 0.05, YT, Z]),
    ];
    const outlet = at(shell(R4, R4 - 0.002, 0.07, 'black', { axis: 'x', seg: 32 }), [XF1 + 0.03, YT, Z]);
    const inlet = at(shell(0.0635, 0.0615, 0.12, 'black', { seg: 32 }), [XF1 - 0.1, YT + RF + 0.04, Z]);
    const vac = group(
      at(cyl(0.022, 0.03, 'black', { seg: 20 }), [XF0 + 0.06, YT - RF - 0.012, Z]),
      lathe([[0, -0.07], [0.012, -0.07], [0.022, -0.035], [0.024, 0], [0, 0]], 'rubber', { seg: 20, pos: [XF0 + 0.06, YT - RF - 0.02, Z] }),
    );
    // Éléments filtrants (visibles en coupe) : primaire plissé, sécurité.
    const pleat = [];
    const n = 48, ro = RF - 0.012, ri = RF - 0.04;
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2;
      const r = i % 2 ? ri : ro;
      pleat.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
    }
    const sh = new THREE.Shape(pleat);
    const hole = new THREE.Path(); hole.absarc(0, 0, ri - 0.004, 0, Math.PI * 2, true); sh.holes.push(hole);
    const eg = new THREE.ExtrudeGeometry(sh, { depth: XF1 - XF0 - 0.08, bevelEnabled: false, curveSegments: 8 });
    eg.rotateY(Math.PI / 2);
    eg.translate(XF0 + 0.05, YT, Z);
    const elem = new THREE.Mesh(eg, box(0.01, 0.01, 0.01, 'cream').material);
    const safety = at(shell(ri - 0.01, ri - 0.014, XF1 - XF0 - 0.1, 'cream', { axis: 'x', seg: 32 }), [(XF0 + XF1) / 2 + 0.01, YT, Z]);
    P('3', group(body, merged(ends, 'black'), outlet, inlet, vac, elem, safety), [0, 0, 0]);
  }

  // 2 — colliers de fixation : bande d'acier, oreilles de serrage dessus,
  // pied à deux trous dessous.
  for (const x of [XF0 + 0.11, XF1 - 0.08]) {
    const band = at(shell(RF + 0.006, RF + 0.0005, 0.04, 'black', { axis: 'x', seg: 48 }), [x, YT, Z]);
    const ears = [-1, 1].map((s) => at(box(0.04, 0.025, 0.004, 'black'), [x, YT + RF + 0.014, Z + s * 0.008]));
    const foot = at(box(0.05, 0.006, 0.16, 'black', { r: 0.002 }), [x, YT - RF - 0.009, Z]);
    const web = at(box(0.04, 0.02, 0.006, 'black'), [x, YT - RF + 0.002, Z]);
    const tb = at(bolt(0.008, 0.03, 'zinc', { axis: 'z' }), [x, YT + RF + 0.014, Z + 0.012]);
    P('2', group(merged([band, ...ears, foot, web], 'black'), tb), [0, 0.12, 0]);
  }

  // 1 — chapeau d'entrée : champignon à pare-pluie, grille annulaire,
  // manchon serré sur la tubulure supérieure.
  {
    const x = XF1 - 0.1, y0 = YT + RF + 0.08;
    const hood = group(
      shell(0.068, 0.0635, 0.06, 'black', { seg: 32 }),
      lathe([[0, 0.06], [0.07, 0.06], [0.07, 0.065], [0.16, 0.085], [0.165, 0.095], [0.15, 0.11], [0.08, 0.12], [0, 0.122]], 'black', { seg: 48 }),
      lathe([[0.072, 0.03], [0.14, 0.03], [0.15, 0.038], [0.15, 0.085], [0.145, 0.085], [0.145, 0.038], [0.072, 0.036]], 'darkSteel', { seg: 48 }),
    );
    P('1', at(hood, [x, y0 - 0.03, Z]), [0, 0.15, 0]);
  }

  // 8 — indicateur de colmatage sur la tubulure de sortie.
  P('8', group(
    at(cyl(0.006, 0.016, 'brass', { seg: 12 }), [XF1 + 0.035, YT + R4 + 0.006, Z]),
    lathe([[0, 0], [0.013, 0], [0.014, 0.004], [0.014, 0.045], [0.011, 0.05], [0, 0.05]], 'yellow', { seg: 24, pos: [XF1 + 0.035, YT + R4 + 0.014, Z] }),
    lathe([[0, 0.05], [0.011, 0.05], [0.011, 0.062], [0, 0.064]], 'glass', { seg: 24, pos: [XF1 + 0.035, YT + R4 + 0.014, Z] }),
  ), [0, 0.08, 0]);

  // 4 — manchon réducteur à bosse 4 → 3 po (caoutchouc).
  const X4a = XF1 + 0.04, X4b = XI - 0.01;
  P('4', lathe([
    [R4 - 0.001, X4a], [R4 + 0.006, X4a], [R4 + 0.006, X4a + 0.035], [R4 + 0.016, X4a + 0.05], [R4 + 0.006, X4a + 0.065],
    [R3 + 0.006, X4b - 0.035], [R3 + 0.006, X4b], [R3 - 0.001, X4b], [R3 - 0.001, X4b - 0.035], [R4 - 0.004, X4a + 0.065], [R4 - 0.001, X4a + 0.035],
  ], 'rubber', { axis: 'x', seg: 40, pos: [0, YT, Z] }), [0.05, 0, 0]);

  // 9 — tubes 3 po × 3 po zingués : haut (réducteur → coude) et bas (coude →
  // embout du moteur).
  const tub = (x0, y) => at(shell(R3, R3 - 0.0016, L9, 'zinc', { axis: 'x', seg: 32 }), [x0 + L9 / 2, y, Z]);
  P('9', tub(X4b - 0.03, YT), [0.08, 0.04, 0]);
  P('9', tub(XI - 0.03, YB), [0.08, -0.04, 0]);

  // 5 — coudes 3 po en caoutchouc, manchettes droites.
  const elbow = (pts) => tube(pts, R3 + 0.005, 'rubber', { sharp: true, seg: 40, radial: 24 });
  const XE = XV - RB - CUFF;
  const arcPts = (cx, cy, a0, a1) => Array.from({ length: 11 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / 10;
    return [cx + RB * Math.cos(a), cy + RB * Math.sin(a), Z];
  });
  P('5', elbow([[XE, YT, Z], ...arcPts(XE + CUFF, YT - RB, Math.PI / 2, 0), [XV, YT - RB - CUFF, Z]]), [0.1, 0.04, 0]);
  P('5', elbow([[XV, YB + RB + CUFF, Z], ...arcPts(XE + CUFF, YB + RB, 0, -Math.PI / 2), [XE, YB, Z]]), [0.1, -0.04, 0]);

  // 10 — tube 3 po × 5 po, branche verticale.
  const Y10 = YB + RB + CUFF - 0.03;
  P('10', at(shell(R3, R3 - 0.0016, L10, 'zinc', { seg: 32 }), [XV, Y10 + L10 / 2, Z]), [0.14, 0, 0]);

  // Colliers à boulon en T : bande, pont, boulon en T, écrou.
  const tclamp = (c, axis, r) => {
    const parts = [
      shell(r + 0.0025, r + 0.0008, 0.016, 'zinc', { seg: 32 }),
      at(box(0.03, 0.014, 0.02, 'zinc', { r: 0.002 }), [0, 0, r + 0.008]),
      at(cyl(0.004, 0.05, 'steel', { axis: 'x', seg: 10 }), [0, 0, r + 0.016]),
    ];
    const g = group(merged(parts, 'zinc'), at(nut(0.011, 0.007, 'steel', { axis: 'x' }), [0.028, 0, r + 0.016]));
    const o = group(g);
    if (axis === 'x') g.rotation.z = -Math.PI / 2;
    o.position.set(...c);
    return o;
  };
  // 7 — collier 4 1/2 po sur la grande manchette du réducteur.
  P('7', tclamp([X4a + 0.018, YT, Z], 'x', R4 + 0.006), [0.03, 0.06, 0]);
  // 6 — six colliers 3 po.
  const c6 = [
    [[X4b - 0.018, YT, Z], 'x'], [[XE + 0.016, YT, Z], 'x'], [[XV, YT - RB - CUFF + 0.016, Z], 'y'],
    [[XV, YB + RB + CUFF - 0.016, Z], 'y'], [[XE + 0.016, YB, Z], 'x'], [[XI - 0.018, YB, Z], 'x'],
  ];
  c6.forEach(([c, axis], k) => P('6', tclamp(c, axis, R3 + 0.005), [0.06, k < 3 ? 0.05 : -0.05, 0.04]));

  return { view: { dir: [1.0, 0.6, 1.1] } };
}

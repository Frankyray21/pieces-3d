// Châssis complet (P186) : porteur sur chenilles (P328) et équipements montés,
// en formes simplifiées placées d'après les deux vues des pages 186 et 188.
// Repère machine : X vers l'avant (côté réservoir d'air et avance), Y vers le
// haut, +Z côté enrouleur de câble. Pont du porteur à y ≈ 0.76.
// Le manuel ne cote pas le porteur : longueur et largeur sont estimées à
// partir des proportions des dessins (chenilles, stabilisateurs, moteurs).

const DECK = 0.76;

export function P186(api) {
  const { box, cyl, ring, tube, torus, gear, fitting, gauge, enclosure, valveBank, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const UP = (dx = 0, dz = 0, h = 0.9) => [dx, h, dz];

  // 30 — porteur : longerons, traverses, pont, réservoir hydraulique, chenilles, stabilisateurs
  const track = (s) => group(
    at(box(3.0, 0.55, 0.36, 'rubber', { r: 0.2 }), [0, 0.3, 0]),
    ...[-1.25, 1.25].map((x) => at(cyl(0.2, 0.38, 'darkSteel', { axis: 'z' }), [x, 0.3, 0])),
    at(box(2.4, 0.22, 0.2, 'grey'), [0, 0.32, -s * 0.05]),
    ...[-0.6, 0, 0.6].map((x) => at(cyl(0.08, 0.37, 'darkSteel', { axis: 'z' }), [x, 0.12, 0])),
  ).translateZ(s * 0.82).translateX(-0.1);
  const jack = (x, z) => group(
    at(box(0.32, 0.18, 0.16, 'grey'), [x - Math.sign(x) * 0.12, 0.66, z]),
    at(cyl(0.08, 1.05, 'grey'), [x, 0.82, z]),
    at(cyl(0.05, 0.3, 'chrome'), [x, 0.18, z]),
    at(cyl(0.15, 0.03, 'darkSteel'), [x, 0.015, z]),
  );
  P('30', group(
    ...[1, -1].map((s) => at(box(4.1, 0.2, 0.12, 'lightGrey'), [0, 0.65, s * 0.62])),
    ...[-1.9, -0.6, 0.6, 1.9].map((x) => at(box(0.1, 0.15, 1.24, 'lightGrey'), [x, 0.65, 0])),
    at(box(1.3, 0.02, 1.36, 'lightGrey'), [-1.35, DECK, 0]),
    at(box(1.2, 0.02, 1.36, 'lightGrey'), [0.0, DECK, 0]),
    at(box(0.5, 0.6, 0.5, 'grey'), [-1.75, DECK + 0.3, 0.38]),
    at(box(0.45, 0.04, 0.55, 'darkSteel'), [-2.32, 0.55, 0.3]),
    track(1), track(-1),
    jack(2.15, 0.62), jack(2.15, -0.62), jack(-2.15, 0.62), jack(-2.15, -0.62),
  ), [0, 0, 0]);

  // Arrière : 9 groupe de pompage (moteur 60 HP vertical sur pompes), 10 adaptateurs
  // d'aspiration, 24 adaptateurs de pression, 11 banc de translation (sur le réservoir)
  P('9', group(
    at(box(0.3, 0.2, 0.26, 'black'), [0, DECK + 0.1, 0]),
    at(cyl(0.17, 0.16, 'black', { r2: 0.21 }), [0, DECK + 0.28, 0]),
    at(cyl(0.24, 0.55, 'blue', { seg: 40 }), [0, DECK + 0.635, 0]),
    ...[0.42, 0.52, 0.62, 0.72, 0.82].map((y) => at(torus(0.24, 0.008, 'blue'), [0, DECK + y, 0])),
    at(cyl(0.2, 0.08, 'blue'), [0, DECK + 0.95, 0]),
    at(box(0.12, 0.14, 0.1, 'blue'), [0, DECK + 0.6, 0.27]),
  ).translateX(-1.3).translateZ(-0.32), UP(0, -0.3, 1.1));
  P('10', group(
    at(fitting(0.05, 0.08, 'steel', { axis: 'x' }), [-1.48, DECK + 0.08, -0.32]),
    at(fitting(0.04, 0.06, 'steel', { axis: 'x' }), [-1.48, DECK + 0.14, -0.26]),
  ), UP(-0.35, -0.2, 0.6));
  P('24', group(
    at(fitting(0.03, 0.05, 'steel', { axis: 'x' }), [-1.13, DECK + 0.12, -0.36]),
    at(fitting(0.03, 0.05, 'steel', { axis: 'x' }), [-1.13, DECK + 0.07, -0.28]),
  ), UP(0.3, -0.2, 0.6));
  P('11', at(valveBank(7, { sw: 0.05, h: 0.14, d: 0.12 }), [-1.75, DECK + 0.67, 0.38]), UP(0, 0.15, 1.0));

  // 25 — surpresseur d'air : compresseur à pistons, carter de courroie, filtres d'admission
  P('25', group(
    at(box(0.5, 0.36, 0.44, 'darkSteel', { r: 0.02 }), [0.12, DECK + 0.2, -0.12]),
    ...[-0.08, 0.32].map((x) => group(
      at(cyl(0.11, 0.2, 'darkSteel', { seg: 24 }), [x, DECK + 0.48, -0.12]),
      ...[0.42, 0.46, 0.5, 0.54].map((y) => at(ring(0.13, 0.11, 0.008, 'darkSteel'), [x, DECK + y, -0.12])),
      at(box(0.2, 0.05, 0.2, 'darkSteel'), [x, DECK + 0.6, -0.12]),
    )),
    at(box(0.6, 0.5, 0.06, 'grey', { r: 0.03 }), [0.45, DECK + 0.4, -0.42]),
    ...[-0.5, -0.27].map((z) => group(
      at(cyl(0.085, 0.62, 'lightGrey'), [-2.0, DECK + 0.62, z]),
      at(cyl(0.095, 0.08, 'darkSteel'), [-2.0, DECK + 0.97, z]),
    )),
  ), UP(0, -0.45, 1.25));
  // 31 — moteur 75 HP du surpresseur (poulie 12 po) ; 32 — réservoir d'air
  P('31', group(
    at(cyl(0.21, 0.55, 'blue', { axis: 'x', seg: 40 }), [0, 0, 0]),
    ...[-0.15, -0.05, 0.05, 0.15].map((x) => at(torus(0.21, 0.008, 'blue', { axis: 'x' }), [x, 0, 0])),
    at(cyl(0.19, 0.05, 'black', { axis: 'x' }), [0.3, 0, 0]),
    at(cyl(0.152, 0.08, 'darkSteel', { axis: 'x' }), [-0.33, 0, 0]),
    at(box(0.4, 0.06, 0.34, 'blue'), [0, -0.22, 0]),
  ).translateX(0.82).translateY(DECK + 0.28).translateZ(-0.38), UP(0.3, -0.35, 1.0));
  P('32', group(
    at(cyl(0.25, 0.85, 'grey', { axis: 'x', seg: 40 }), [0, 0, 0]),
    ...[1, -1].map((s) => at(cyl(0.25, 0.08, 'grey', { axis: 'x', r2: 0.15 }), [s * 0.465, 0, 0])),
  ).translateX(1.45).translateY(0.95).translateZ(-0.24), UP(0.6, -0.5, 0.2));

  // Centre : 22 moteur diesel Deutz, 16 refroidisseur d'huile, 15 refroidisseur final,
  // 14 té de distribution, 21 enrouleur de lance de lavage
  P('22', group(
    at(box(0.72, 0.55, 0.5, 'charcoal', { r: 0.03 }), [0, 0.3, 0]),
    at(box(0.6, 0.12, 0.38, 'charcoal'), [0, 0.63, 0]),
    at(cyl(0.18, 0.12, 'darkSteel', { axis: 'x' }), [-0.42, 0.25, 0]),
    at(cyl(0.05, 0.25, 'darkSteel'), [0.2, 0.8, 0.12]),
  ).translateX(-0.55).translateY(DECK).translateZ(0.25), UP(0, 0.3, 1.4));
  const cooler = (w, h) => group(
    at(box(w, h, 0.1, 'darkSteel'), [0, 0, 0]),
    at(box(w * 0.9, h * 0.9, 0.012, 'black'), [0, 0, -0.056]),
    at(cyl(Math.min(w, h) * 0.4, 0.06, 'black', { axis: 'z' }), [0, 0, 0.08]),
  );
  P('16', at(cooler(0.55, 0.45), [-0.7, DECK + 0.35, -0.68]), UP(0, -0.45, 0.6));
  P('15', at(cooler(0.45, 0.4), [0.42, DECK + 0.62, -0.62]), UP(0, -0.45, 0.8));
  P('14', group(
    tube([[0.1, DECK + 0.3, -0.5], [0.3, DECK + 0.3, -0.5]], 0.04, 'steel', { sharp: true, seg: 2 }),
    tube([[0.2, DECK + 0.3, -0.5], [0.2, DECK + 0.48, -0.5]], 0.04, 'steel', { sharp: true, seg: 2 }),
  ), UP(0, -0.35, 0.5));
  P('21', group(
    at(cyl(0.2, 0.02, 'grey', { axis: 'z' }), [0, 0, 0.09]),
    at(cyl(0.2, 0.02, 'grey', { axis: 'z' }), [0, 0, -0.09]),
    at(cyl(0.11, 0.16, 'safety', { axis: 'z' }), [0, 0, 0]),
    at(box(0.06, 0.25, 0.22, 'grey'), [0, -0.2, 0]),
  ).translateX(-0.1).translateY(DECK + 0.95).translateZ(-0.6), UP(0, -0.3, 1.1));

  // Côté enrouleur (+Z) : 6 enrouleur de câble, 13 panneau de manomètres, 18 armoires électriques
  P('6', group(
    ...[0.04, -0.04].map((dz) => at(ring(0.55, 0.52, 0.02, 'grey', { axis: 'z', seg: 48 }), [0, 0, dz])),
    ...Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return at(box(0.02, 0.5, 0.02, 'grey'), [Math.cos(a) * 0.27, Math.sin(a) * 0.27, 0.04], [0, 0, a - Math.PI / 2]);
    }),
    at(cyl(0.2, 0.1, 'black', { axis: 'z' }), [0, 0, 0]),
    at(cyl(0.05, 0.2, 'darkSteel', { axis: 'z' }), [0, 0, -0.08]),
    at(box(0.08, 0.6, 0.08, 'grey'), [0, -0.3, -0.12]),
  ).translateX(-0.4).translateY(DECK + 0.58).translateZ(0.86), [0, 0.4, 0.55]);
  P('13', group(
    at(box(0.32, 0.26, 0.04, 'grey'), [0, 0, 0]),
    ...[-0.09, 0, 0.09].map((x) => at(gauge(0.035, { axis: 'z' }), [x, 0.04, 0.03])),
  ).translateX(0.4).translateY(DECK + 0.3).translateZ(0.72), [0, 0.2, 0.5]);
  P('18', group(
    at(enclosure(0.7, 0.9, 0.35, 'grey'), [0, 0, 0]),
    at(enclosure(0.4, 0.5, 0.3, 'grey'), [-0.62, -0.2, 0.0]),
  ).translateX(1.05).translateY(DECK + 0.47).translateZ(0.48), UP(0, 0.45, 1.0));

  // Avant : 2 banc de mise en place (8 sections), 3 banc de forage (6), 1 banc de forage (1),
  // 4 vanne auxiliaire du bras de tige, 7 bloc de vannes d'avance, 19 séquence de retenue
  P('2', at(valveBank(8, { sw: 0.05, h: 0.16, d: 0.12 }), [1.62, DECK + 0.62, 0.42]), UP(0.2, 0.2, 1.0));
  P('3', at(valveBank(6, { sw: 0.05, h: 0.16, d: 0.12 }), [0.95, DECK + 0.18, -0.52]), UP(0, -0.3, 0.75));
  P('1', at(valveBank(1, { sw: 0.06, h: 0.16, d: 0.12 }), [1.32, DECK + 0.32, -0.56]), UP(0.15, -0.35, 0.8));
  P('4', at(box(0.1, 0.12, 0.1, 'blue', { r: 0.006 }), [1.95, DECK + 0.45, 0.48]), UP(0.4, 0.2, 0.8));
  P('7', group(
    at(box(0.3, 0.12, 0.16, 'steel', { r: 0.008 }), [0, 0, 0]),
    ...[-0.1, 0, 0.1].map((x) => at(fitting(0.02, 0.04, 'steel', { axis: 'z' }), [x, 0, 0.09])),
  ).translateX(0.95).translateY(DECK + 0.75).translateZ(-0.22), UP(0, -0.1, 1.1));
  P('19', at(box(0.1, 0.1, 0.08, 'steel', { r: 0.006 }), [1.2, DECK + 0.75, -0.22]), UP(0.2, -0.1, 1.15));
  // Air et eau à l'avant : 23 purge manuelle, 17 électrovannes d'air, 33 bloc de capteurs,
  // 27 tuyauterie de marche/arrêt d'air, 34 clapet d'injection de graisse, 29 pompe à eau,
  // 28 vanne 3 voies d'eau
  P('23', at(box(0.08, 0.1, 0.08, 'steel', { r: 0.006 }), [1.3, DECK + 0.6, 0.12]), UP(0, 0.1, 1.0));
  P('17', group(
    at(box(0.36, 0.04, 0.12, 'grey'), [0, 0, 0]),
    ...[-0.12, -0.04, 0.04, 0.12].map((x) => at(box(0.05, 0.08, 0.06, 'black'), [x, 0.06, 0])),
  ).translateX(0.65).translateY(DECK + 0.88).translateZ(0.12), UP(0, 0.1, 1.0));
  P('33', group(
    at(box(0.3, 0.06, 0.08, 'steel'), [0, 0, 0]),
    ...[-0.1, 0, 0.1].map((x) => at(cyl(0.012, 0.06, 'steel'), [x, 0.06, 0])),
  ).translateX(1.25).translateY(DECK + 0.88).translateZ(0.12), UP(0.2, 0.1, 1.0));
  P('27', group(
    tube([[1.7, DECK + 0.45, -0.5], [1.95, DECK + 0.45, -0.5], [1.95, DECK + 0.25, -0.5]], 0.03, 'steel', { sharp: true, seg: 4 }),
    at(box(0.1, 0.1, 0.1, 'red', { r: 0.008 }), [1.82, DECK + 0.45, -0.5]),
  ), UP(0.35, -0.3, 0.6));
  P('34', at(box(0.08, 0.06, 0.06, 'steel', { r: 0.006 }), [1.95, DECK + 0.32, -0.32]), UP(0.4, -0.2, 0.6));
  P('29', group(
    at(cyl(0.08, 0.2, 'blue', { axis: 'x' }), [0, 0, 0]),
    at(cyl(0.09, 0.08, 'darkSteel', { axis: 'x' }), [0.15, 0, 0]),
    at(box(0.3, 0.03, 0.18, 'grey'), [0.05, -0.1, 0]),
  ).translateX(1.5).translateY(DECK + 0.12).translateZ(0.2), UP(0.2, 0.25, 0.7));
  P('28', group(
    at(box(0.08, 0.08, 0.08, 'brass'), [0, 0, 0]),
    at(cyl(0.008, 0.08, 'steel'), [0, 0.07, 0]),
    at(box(0.12, 0.012, 0.02, 'red'), [0.05, 0.11, 0]),
  ).translateX(1.95).translateY(DECK + 0.2).translateZ(0.22), UP(0.45, 0.2, 0.6));

  // Arrière : 12 injecteur, 26 graissage manuel (pompe + enrouleur), 5 attelage,
  // 8 support de transformateur, 20 porte-fiche de l'enrouleur de câble
  P('12', at(box(0.14, 0.18, 0.1, 'steel', { r: 0.008 }), [-1.72, DECK + 0.4, -0.08]), UP(-0.3, 0, 0.9));
  P('26', group(
    at(cyl(0.09, 0.25, 'red'), [-2.0, 0.4, 0.42]),
    at(cyl(0.2, 0.12, 'grey', { axis: 'z' }), [-0.4, 0.42, 1.08]),
  ), [-0.4, 0, 0.5]);
  P('5', group(
    at(box(0.3, 0.12, 0.22, 'darkSteel'), [-2.35, 0.48, 0]),
    at(cyl(0.025, 0.2, 'steel'), [-2.45, 0.5, 0]),
  ), [-0.5, 0, 0]);
  P('8', group(
    at(box(0.3, 0.03, 0.3, 'grey'), [-2.0, DECK + 0.015, -0.42]),
    at(cyl(0.12, 0.3, 'darkSteel'), [-2.0, DECK + 0.18, -0.42]),
  ), [-0.5, 0.4, -0.3]);
  P('20', at(box(0.12, 0.16, 0.1, 'safety', { r: 0.01 }), [-1.95, DECK + 0.95, 0.58]), [-0.45, 0.6, 0.3]);
  void gear;
  return { view: { dir: [0.95, 0.85, 1.15] } };
}

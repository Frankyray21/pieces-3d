// Réservoir hydraulique (F11) et pompe à eau + moteur (F12).
// Repère du réservoir : base à y = 0, centré en X/Z ; face inclinée côté +Z,
// panneau électrique sur la face arrière (-X).

export function F12(api) {
  const { box, cyl, ring, rod, at, group, nut, fitting } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  // 8 — Pompe à eau CAT (carter + tête + pistons), arbre selon +X
  P('8', group(
    at(box(0.2, 0.17, 0.19, 'blue', { r: 0.015 }), [0, 0, 0]),
    at(cyl(0.06, 0.05, 'blue', { axis: 'x' }), [0.115, 0, 0]),
    at(cyl(0.02, 0.06, 'steel', { axis: 'x' }), [0.16, 0, 0]),
    at(box(0.06, 0.03, 0.16, 'blue'), [0, -0.1, 0]),
    at(box(0.16, 0.13, 0.15, 'blue', { r: 0.012 }), [-0.21, 0, 0]),
    ...[-0.045, 0, 0.045].map((z) => at(cyl(0.016, 0.1, 'chrome', { axis: 'x' }), [-0.1, -0.01, z])),
    rod([-0.29, 0.07, 0.085], [-0.06, 0.07, 0.085], 0.008, 'chrome'),
    rod([-0.29, 0.07, -0.085], [-0.06, 0.07, -0.085], 0.008, 'chrome'),
    rod([-0.29, -0.06, 0.085], [-0.06, -0.06, 0.085], 0.008, 'chrome'),
    rod([-0.29, -0.06, -0.085], [-0.06, -0.06, -0.085], 0.008, 'chrome'),
    at(cyl(0.035, 0.03, 'blue'), [0.02, 0.1, 0.03]),
  ), [0, 0, 0]);
  P('7', cyl(0.035, 0.035, 'brass', { pos: [-0.04, 0.105, -0.03] }), [0, 0.18, 0]);
  // 9 — Soupape de décharge (té laiton), 10 — pointeau, 11 — clapet, 12 — valve ASCO, 13 — bobine
  P('9', group(cyl(0.018, 0.12, 'brass', { axis: 'x' }), at(cyl(0.014, 0.05, 'brass'), [0.02, -0.03, 0]), rod([-0.06, 0, 0], [-0.08, 0.02, 0.02], 0.004, 'brass')).translateX(-0.22).translateY(0.1), [-0.05, 0.25, 0]);
  P('10', group(box(0.04, 0.05, 0.04, 'black'), at(cyl(0.006, 0.06, 'steel', { axis: 'z' }), [0, 0, 0.05]), at(box(0.05, 0.008, 0.008, 'steel'), [0, 0, 0.08]), at(box(0.008, 0.05, 0.008, 'steel'), [0, 0, 0.08])).translateX(-0.33).translateY(0.02).translateZ(0.12), [-0.15, 0.08, 0.2]);
  P('11', group(cyl(0.02, 0.09, 'black'), at(fitting(0.016, 0.03, 'steel'), [0, 0.06, 0])).translateX(-0.33).translateY(-0.1).translateZ(0.12), [-0.15, -0.2, 0.2]);
  P('12', group(box(0.06, 0.07, 0.07, 'brass', { r: 0.01 }), at(ring(0.03, 0.012, 0.015, 'brass', { axis: 'z' }), [0, 0, 0.04])).translateX(-0.25).translateY(-0.05).translateZ(-0.15), [-0.05, 0, -0.22]);
  P('13', at(box(0.025, 0.06, 0.06, 'lightGrey'), [-0.29, -0.05, -0.15]), [-0.12, 0, -0.32]);
  // Accouplement : 6 côté pompe, 5 croisillon, 4 côté moteur ; 3 bride ; 2 moteur ; 1 garde
  P('6', cyl(0.035, 0.04, 'steel', { axis: 'x', pos: [0.2, 0, 0] }), [0.15, 0, 0]);
  P('5', cyl(0.032, 0.02, 'black', { axis: 'x', pos: [0.23, 0, 0] }), [0.25, 0, 0]);
  P('4', cyl(0.035, 0.04, 'steel', { axis: 'x', pos: [0.26, 0, 0] }), [0.35, 0, 0]);
  P('3', group(
    at(box(0.015, 0.18, 0.17, 'red'), [0.295, -0.01, 0]),
    at(box(0.16, 0.015, 0.17, 'red'), [0.37, -0.1, 0]),
  ), [0.5, 0, 0]);
  P('2', group(
    at(box(0.025, 0.1, 0.1, 'black'), [0.315, 0, 0]),
    at(cyl(0.065, 0.12, 'black', { axis: 'x' }), [0.39, 0, 0]),
    at(nut(0.03, 0.02, 'black'), [0.35, 0.07, 0.025]),
    at(nut(0.03, 0.02, 'black'), [0.35, 0.07, -0.025]),
  ), [0.72, 0, 0]);
  P('1', group(
    at(box(0.11, 0.008, 0.13, 'black'), [0.23, 0.07, 0]),
    at(box(0.11, 0.07, 0.008, 'black'), [0.23, 0.035, 0.065]),
    at(box(0.11, 0.07, 0.008, 'black'), [0.23, 0.035, -0.065]),
  ), [0.3, 0.3, 0]);
  return { view: { dir: [0.4, 0.6, 1.2] } };
}

export function F11(api) {
  const { box, cyl, ring, tube, at, group, extrude, valveBank, enclosure, ballValve, fitting, filterCanister, gauge } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const H = 0.9, HX = 0.42, HZ = 0.62;

  // 36 — Réservoir (profil incliné côté +Z, extrudé selon X)
  const prof = [[-HZ, 0], [HZ, 0], [HZ, 0.35], [HZ - 0.25, H], [-HZ, H]];
  const tankMesh = extrude(prof.map(([z, y]) => [z, y]), HX * 2, 'red');
  tankMesh.rotation.y = -Math.PI / 2; // plan du profil : (Z, Y)
  P('36', group(
    tankMesh,
    at(box(0.12, 0.03, 0.08, 'red'), [0.1, H + 0.015, -0.35]),
    at(box(0.12, 0.03, 0.08, 'red'), [-0.2, H + 0.015, -0.1]),
    at(cyl(0.05, 0.03, 'red'), [-0.25, H + 0.015, 0.2]),
    at(box(0.62, 0.02, 0.24, 'red'), [-0.05, 0.61, 0.6]),
    at(box(0.02, 0.2, 0.2, 'red'), [-0.3, 0.52, 0.6], [0.5, 0, 0]),
  ), [0, 0, 0]);

  // 35 — Pompe à eau (F12) sur la face inclinée
  const wp = api.sub('F12');
  wp.position.set(-0.08, 0.72, 0.6);
  P('35', wp, [0, 0.35, 0.75]);

  // Face arrière (-X) : 18 panneau électrique principal, 19 transformateur
  const panel = enclosure(0.62, 0.66, 0.22, 'grey');
  panel.rotation.y = -Math.PI / 2;
  P('18', at(panel, [-HX - 0.11, 0.5, -0.22]), [-0.75, 0.1, 0]);
  const tr = enclosure(0.24, 0.26, 0.2, 'grey');
  tr.rotation.y = -Math.PI / 2;
  P('19', at(tr, [-HX - 0.1, 0.15, 0.25]), [-0.6, -0.05, 0.1]);

  // Huile de marteau : 26 réservoir, 20 pompe, 22 bouchon crépine, 21 régulateur, 23 manomètre, 24 niveau, 25 vanne, 27 clapet
  const ox = -HX - 0.13, oz = 0.38;
  P('26', at(box(0.22, 0.32, 0.22, 'black', { r: 0.01 }), [ox, 0.48, oz]), [-0.45, 0.15, 0.25]);
  P('20', group(
    at(cyl(0.03, 0.26, 'steel'), [0, 0.15, 0]),
    at(cyl(0.04, 0.08, 'steel'), [0, 0.3, 0]),
    at(box(0.06, 0.05, 0.05, 'steel'), [0, 0.36, 0]),
  ).translateX(ox + 0.04).translateY(0.64).translateZ(oz), [-0.45, 0.45, 0.25]);
  P('22', group(cyl(0.035, 0.05, 'darkSteel'), at(cyl(0.028, 0.03, 'darkSteel'), [0, 0.035, 0])).translateX(ox - 0.06).translateY(0.665).translateZ(oz - 0.04), [-0.55, 0.4, 0.15]);
  P('21', group(cyl(0.03, 0.05, 'grey'), at(cyl(0.022, 0.04, 'grey'), [0, -0.045, 0])).translateX(ox - 0.06).translateY(0.82).translateZ(oz + 0.08), [-0.65, 0.4, 0.3]);
  P('23', at(gauge(0.025, { axis: '-x' }), [ox - 0.1, 0.84, oz + 0.08]), [-0.85, 0.4, 0.3]);
  P('24', group(box(0.012, 0.22, 0.03, 'darkSteel'), at(box(0.006, 0.18, 0.016, 'glass'), [-0.008, 0, 0])).translateX(ox - 0.115).translateY(0.48).translateZ(oz), [-0.4, 0, 0.1]);
  P('25', at(ballValve(0.016, 'brass', { axis: 'z' }), [ox, 0.3, oz + 0.12]), [-0.4, -0.15, 0.25]);
  P('27', at(fitting(0.016, 0.04, 'brass', { axis: 'x' }), [ox + 0.12, 0.6, oz + 0.08]), [-0.2, 0.2, 0.35]);

  // Côté gauche (-Z) : 3 séparateur d'eau (+4 élément), 7 filtre à air (+9 élément), 1/2 vannes et blocs 2", 5/6 raccords, 8 purges
  const fz = -HZ - 0.12;
  P('3', at(filterCanister(0.065, 0.33, 'black'), [-0.12, 0.82, fz]), [0, 0.1, -0.5]);
  P('4', at(group(cyl(0.045, 0.2, 'cream'), at(ring(0.05, 0.02, 0.012, 'darkSteel'), [0, 0.1, 0])), [-0.12, 0.62, fz]), [0, 0.6, -0.75]);
  P('7', at(filterCanister(0.07, 0.38, 'red'), [0.18, 0.82, fz]), [0, 0.1, -0.5]);
  P('9', at(group(cyl(0.048, 0.22, 'cream'), at(ring(0.052, 0.02, 0.012, 'darkSteel'), [0, 0.11, 0])), [0.18, 0.6, fz]), [0, 0.6, -0.75]);
  P('5', at(fitting(0.04, 0.07, 'steel', { axis: 'x' }), [0.03, 0.84, fz]), [0, 0.2, -0.65]);
  P('6', at(fitting(0.04, 0.07, 'steel', { axis: 'x' }), [0.31, 0.84, fz]), [0.1, 0.2, -0.65]);
  P('2', group(box(0.09, 0.1, 0.1, 'blue', { r: 0.01 }), at(cyl(0.03, 0.12, 'darkSteel', { axis: 'x' }), [0, 0, 0])).translateX(-0.3).translateY(0.84).translateZ(fz), [-0.15, 0.1, -0.55]);
  P('1', at(ballValve(0.05, 'brass', { axis: 'x' }), [-0.45, 0.84, fz]), [-0.4, 0.1, -0.55]);
  P('8', at(ballValve(0.014, 'brass', { axis: 'z' }), [-0.12, 0.42, fz]), [0, -0.25, -0.6]);
  P('8', at(ballValve(0.014, 'brass', { axis: 'z' }), [0.18, 0.4, fz]), [0, -0.25, -0.6]);
  // Ligne d'eau : 10 régulateur/crépine, 13 blocs 1", 14 vannes 1"
  P('10', group(cyl(0.05, 0.1, 'lightGrey', { axis: 'x', r2: 0.02 }), at(cyl(0.025, 0.06, 'lightGrey', { axis: 'x' }), [-0.07, 0, 0])).translateX(0.05).translateY(0.3).translateZ(-HZ - 0.07), [0, -0.1, -0.55]);
  P('13', group(box(0.06, 0.07, 0.07, 'blue', { r: 0.008 }), at(cyl(0.017, 0.08, 'darkSteel', { axis: 'x' }), [0, 0, 0])).translateX(-0.2).translateY(0.3).translateZ(-HZ - 0.07), [-0.1, -0.1, -0.5]);
  P('13', group(box(0.06, 0.07, 0.07, 'blue', { r: 0.008 }), at(cyl(0.017, 0.08, 'darkSteel', { axis: 'x' }), [0, 0, 0])).translateX(0.3).translateY(0.3).translateZ(-HZ - 0.07), [0.1, -0.1, -0.5]);
  P('14', at(ballValve(0.03, 'brass', { axis: 'x' }), [-0.32, 0.3, -HZ - 0.07]), [-0.3, -0.1, -0.55]);
  P('14', at(ballValve(0.03, 'brass', { axis: 'x' }), [0.3, 0.12, HZ + 0.05]), [0.25, -0.1, 0.5]);
  P('34', group(
    at(box(0.1, 0.5, 0.12, 'black', { r: 0.02 }), [0, 0, 0]),
    at(cyl(0.025, 0.08, 'steel', { axis: 'z' }), [0, 0.23, -0.07]),
    at(cyl(0.025, 0.08, 'steel', { axis: 'z' }), [0, -0.23, -0.07]),
  ).translateX(-0.22).translateY(0.5).translateZ(-HZ - 0.08).rotateX(0.2), [-0.1, 0, -0.95]);

  // Dessus : 16 banc de translation + 17 toit de protection ; 15 projecteurs DEL
  P('16', at(valveBank(2, { sw: 0.06, h: 0.15, d: 0.13 }), [0.12, H + 0.1, -0.3]), [0, 0.55, 0]);
  P('17', group(
    at(box(0.42, 0.015, 0.24, 'redDark'), [0, 0.3, 0]),
    at(box(0.015, 0.3, 0.24, 'redDark'), [-0.2, 0.15, 0]),
    at(box(0.015, 0.3, 0.24, 'redDark'), [0.2, 0.15, 0]),
  ).translateX(0.12).translateY(H).translateZ(-0.3), [0, 0.95, 0]);
  for (const z of [0.5, -0.5]) {
    P('15', group(cyl(0.05, 0.05, 'black', { axis: 'x' }), at(cyl(0.042, 0.01, 'lamp', { axis: 'x' }), [0.03, 0, 0]), at(box(0.02, 0.06, 0.03, 'black'), [-0.02, -0.04, 0])).translateX(HX - 0.03).translateY(H + 0.07).translateZ(z), [0.25, 0.35, z * 0.4]);
  }

  // Face avant (+X) : 29 filtre retour (+30 élément), 32 collecteur retour, 31 vanne 1 1/2", 33 valve ASCO, 28 niveau
  P('29', at(group(cyl(0.07, 0.07, 'darkSteel'), at(cyl(0.065, 0.2, 'lightGrey'), [0, -0.13, 0])), [HX + 0.08, 0.58, -0.35]), [0.4, 0.1, 0]);
  P('30', at(cyl(0.045, 0.16, 'cream'), [HX + 0.08, 0.44, -0.35]), [0.65, -0.1, 0]);
  P('32', at(box(0.08, 0.1, 0.3, 'black', { r: 0.01 }), [HX + 0.04, 0.12, -0.05]), [0.35, -0.1, 0]);
  P('31', at(ballValve(0.04, 'brass', { axis: 'x' }), [HX + 0.12, 0.12, -0.32]), [0.45, -0.1, -0.1]);
  P('33', group(box(0.05, 0.05, 0.05, 'green', { r: 0.006 }), at(cyl(0.012, 0.05, 'steel', { axis: 'x' }), [0.04, 0, 0])).translateX(HX + 0.04).translateY(0.32).translateZ(0.12), [0.35, 0, 0.1]);
  P('28', group(box(0.012, 0.2, 0.04, 'darkSteel'), at(box(0.006, 0.16, 0.02, 'glass'), [0.008, 0, 0])).translateX(HX + 0.006).translateY(0.5).translateZ(0.25), [0.3, 0, 0]);

  // Côté droit (+Z) : 11 boîtes de prises, 12 capteur de niveau d'huile
  for (const x of [-0.25, 0.1]) {
    P('11', group(cyl(0.06, 0.07, 'lightGrey', { axis: 'z' }), at(cyl(0.05, 0.01, 'grey', { axis: 'z' }), [0, 0, 0.04])).translateX(x).translateY(0.2).translateZ(HZ + 0.035), [0, 0, 0.35]);
  }
  P('12', group(cyl(0.015, 0.06, 'steel', { axis: 'z' }), at(cyl(0.02, 0.025, 'black', { axis: 'z' }), [0, 0, 0.04])).translateX(-0.07).translateY(0.12).translateZ(HZ + 0.03), [0, -0.05, 0.4]);
  void tube;
  return { view: { dir: [0.85, 0.7, 1.1] } };
}

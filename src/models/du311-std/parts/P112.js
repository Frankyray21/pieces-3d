// P112 — Capteur de position BG00729756 rév. B (page 112) : « SENSOR ASSEMBLY
// – Sensing range 40mm, without locking nuts ». Détecteur inductif M30 PNP NO
// (5) de portée 40 mm logé dans une protection en deux pièces, posé sur le
// support 26 de P108 (bras pivotant haut au repos) :
// - douille de protection (1) : fourreau acier Ø 43 mm taraudé M30 à l'avant,
//   chambre de raccordement à l'arrière, fond percé pour l'entrée de câble ;
// - capuchon avant (2) : coupelle Ø 40 mm en polyamide devant la face
//   sensible (le champ du détecteur la traverse), emboîtée sur la douille avec
//   un joint torique (4) ;
// - entrée de câble (3) : presse-étoupe à écrou six-pans et dôme serrant le
//   câble sur le fond de la douille ;
// - câble précâblé M12, 4 fils, 5 m (6) : connecteur femelle surmoulé branché
//   dans la chambre sur l'embase M12 du détecteur, sortie par le
//   presse-étoupe ; seule l'amorce (≈ 0.4 m) est dessinée.
// Repère : origine au centre de la face avant du capuchon, Y le long de l'axe
// vers l'arrière (câble) ; amorce de câble sortie vers +X puis descendant vers -Z. Encombrement
// ≈ 0.043 × 0.10 (corps) m, plus l'amorce de câble.
// Cotes : coupe A-A à l'échelle du corps M30 (≈ 5.5 px/mm) : longueur 85 mm,
// douille Ø 43, capuchon Ø 40 × 21, chambre Ø 38.
export default function P112(api) {
  const { S } = api;
  const { lathe, group, merged, at, torus } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const mm = (v) => v * 0.001;
  const Lm = (pts, mat, seg = 32) => lathe(pts.map(([r, y]) => [mm(r), mm(y)]), mat, { seg });

  // 2 — capuchon avant (coupelle à fond plat, chanfrein du bord)
  P('2', Lm([[0, 0], [19, 0], [20, 1], [20, 21], [17.6, 21], [17.6, 3], [0, 3]], 'plastic'), [0, -0.05, 0]);

  // 1 — douille : fourreau, taraudage M30 (filet suggéré), chambre, fond percé
  const thr = [];
  for (let i = 0; i < 8; i++) thr.push([15.3, 22 + i * 2.8], [15.9, 23.4 + i * 2.8]);
  P('1', group(
    Lm([[16, 20], [17.4, 20], [17.4, 17.5], [21.5, 17.5], [21.5, 84.5], [20.5, 85.5], [8.2, 85.5], [8.2, 81.5], [19, 81.5], [19, 44], [15.3, 44], ...thr.reverse(), [15.3, 21], [16, 20]], 'zinc', 36),
    // méplats de serrage (deux faces) sur l'arrière
    merged([-1, 1].map((s) => at(S.box(mm(1.2), mm(22), mm(26), 'zinc'), [s * mm(21.2), mm(70), 0])), 'zinc'),
  ), [0, 0.04, 0]);

  // 4 — joint torique entre capuchon et douille
  P('4', torus(mm(17.6), mm(1.3), 'rubber', { pos: [0, mm(20.3), 0] }), [0, -0.025, 0]);

  // 5 — détecteur M30 : face sensible bleue, corps fileté, embase M12, voyant
  const body = [[0, 3.2], [14.6, 3.2], [15, 4]];
  for (let i = 0; i < 16; i++) body.push([14.6, 5 + i * 3], [15, 6.5 + i * 3]);
  body.push([15, 54], [13, 55], [9, 55], [9, 63], [0, 63]);
  P('5', group(
    Lm(body, 'steel', 28),
    Lm([[0, 3.1], [14.2, 3.1], [14.2, 3.5], [0, 3.5]], 'blue', 28),
    Lm([[7.4, 55], [8, 55], [8, 62], [7.4, 62]], 'brass', 20),
    at(S.cyl(mm(2), mm(1.2), 'lampAmber', { seg: 10 }), [0, mm(55.6), mm(10)]),
  ), [0, 0.02, 0]);

  // 3 — entrée de câble (presse-étoupe sur le fond)
  P('3', group(
    S.nut(mm(24), mm(5), 'plastic', { pos: [0, mm(88), 0] }),
    Lm([[3.2, 90.5], [11, 90.5], [10.2, 94], [7.5, 97], [3.2, 98]], 'plastic', 20),
  ), [0, 0.08, 0]);

  // 6 — câble M12 : connecteur surmoulé dans la chambre, câble Ø 6 sortant, amorce coudée
  const tail = [[0, 0.096, 0], [0, 0.125, 0], [0.02, 0.15, 0], [0.06, 0.16, -0.01], [0.075, 0.165, -0.06], [0.08, 0.17, -0.15], [0.08, 0.175, -0.32]];
  P('6', group(
    Lm([[0, 63], [8, 63], [8, 70], [9.5, 74], [9.5, 80], [4, 81], [3.2, 81], [3.2, 95], [0, 95]], 'plastic', 24),
    S.tube(tail, mm(3.1), 'black', { seg: 40, radial: 8 }),
  ), [0, 0.12, 0]);

  return { view: { dir: [0.9, 0.6, 1.1] } };
}

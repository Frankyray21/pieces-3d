// P412 — Schéma du système d'extinction DU311-T CX035722 rév. 0 (pages 412
// et 414) : système à poudre sèche à déclenchement électrique (Checkfire 210),
// en implantation 3D plausible sur la machine d'après les notes du schéma.
// - module d'affichage (1) sur son étrier (2), sur le capot du réservoir
//   hydraulique, tourné vers le poste de translation (arrière, -X) ;
// - module de commande ICM (3) et sa pile (4), côté gauche (-Z) sur le
//   support des distributeurs avant ;
// - circuit de détection : câble 2 pi (7) de l'ICM au répartiteur 3 voies (8)
//   et sa fin de ligne (9) ; câbles 10 pi (11) vers l'actionneur manuel du
//   panneau arrière, 5 pi (10) vers ceux des côtés droit et gauche ; trois
//   actionneurs manuels électriques (13), deux sur équerre (12) ;
// - circuit de déclenchement : câbles 10 pi (14), 5 pi (15) et descente (16)
//   vers le dispositif d'actionnement (17) de l'actionneur électro-pneumatique
//   (21) vissé sur la cartouche de gaz propulseur (22) et son support (23), à
//   gauche de la marche de translation (arrière gauche) ;
// - circuit de relais : câbles 5 pi (18) et 3 pi (19), câble de panneau (20)
//   précédé d'un troisième câble 5 pi (10), vers le panneau de relais (avant
//   gauche, entrée des câbles seulement) ;
// - réservoir d'agent et son support (24) à droite (+Z) du réservoir
//   hydraulique, flexible de gaz depuis l'actionneur ; té de distribution (25)
//   sous le pont et flexibles d'agent 1/2 po vers six buses V-1/2 (26) sur
//   équerres (28), chacune serrée entre deux rondelles frein (27) ; buses
//   avant droite / gauche et arrière droite / gauche dirigées vers le pont et
//   le moteur, buse avant milieu sous le cadre de glissière vers l'arrière,
//   buse arrière milieu sous le réservoir hydraulique vers l'avant ;
// - étiquettes (29), six passe-câbles 3 trous (30*) et fil plombé (31*) de
//   l'actionneur manuel arrière (repères * : option extinction automatique).
// Repère : repère machine P010 (voir frame.js) : X vers l'avant, Y vers le
// haut, +Z côté enrouleur, pont du porteur à y = 0.76 ; P412 se place tel
// quel dans P400 et P010. Encombrement ≈ 4.25 (X, de -2.17 à 2.08) × 1.12
// (Y, de 0.55 à 1.67) × 1.75 (Z, de -0.88 à 0.88) m.
// Les flexibles d'agent ne sont pas listés : ils sont rattachés au té (25).
// Câbles et flexibles représentés par cable() / hose().

export default function P412(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, cable, hose, merged, at, group, nut, ring, torus, plate } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const IN = 0.0254;
  const V = (p) => new THREE.Vector3(...p);
  // Oriente un groupe dont l'axe local -Y doit suivre la direction dir.
  const aim = (obj, pos, dir) => {
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), V(dir).normalize());
    obj.position.set(...pos);
    return obj;
  };
  const RC = 0.0035; // rayon des câbles Checkfire

  // Connecteur en ligne (boîtier à oreilles) le long de X, centré en p.
  const conn = (p, rotY = 0) => {
    const g = group(merged([
      box(0.045, 0.016, 0.018, 'black', { r: 0.003 }),
      box(0.012, 0.004, 0.032, 'black'),
    ], 'black'));
    g.position.set(...p);
    g.rotation.y = rotY;
    return g;
  };

  // ================================================ 1 — module d'affichage, 2 — étrier
  {
    const p = [-1.62, 1.40, 0.16];
    const disp = group(
      box(0.12, 0.09, 0.055, 'black', { r: 0.008 }),
      at(box(0.085, 0.055, 0.004, 'glass'), [0, 0.006, 0.029]),
      at(box(0.08, 0.05, 0.002, 'plastic'), [0, 0.006, 0.0275]),
      at(cyl(0.004, 0.004, 'lamp', { axis: 'z', seg: 10 }), [-0.04, -0.032, 0.029]),
      at(cyl(0.004, 0.004, 'red', { axis: 'z', seg: 10 }), [-0.028, -0.032, 0.029]),
      at(cyl(0.006, 0.006, 'safety', { axis: 'z', seg: 12 }), [0.035, -0.032, 0.029]),
      at(cyl(0.007, 0.02, 'black', { seg: 10 }), [0.03, -0.055, 0]),
    );
    disp.rotation.set(-0.35, -Math.PI / 2, 0); // face vers -X, inclinée vers le haut
    disp.position.set(...p);
    P('1', disp, [0, 0.1, 0]);
    // étrier en U boulonné sur le capot, deux boutons de serrage
    P('2', group(
      merged([
        at(box(0.06, 0.004, 0.18, 'black'), [p[0], 1.362, p[2]]),
        at(box(0.04, 0.07, 0.004, 'black'), [p[0], 1.395, p[2] - 0.078]),
        at(box(0.04, 0.07, 0.004, 'black'), [p[0], 1.395, p[2] + 0.078]),
      ], 'black'),
      merged([-1, 1].map((s) => at(cyl(0.012, 0.012, 'plastic', { axis: 'z', seg: 12 }), [p[0], 1.40, p[2] + s * 0.086])), 'plastic'),
    ), [0, 0.06, 0]);
  }

  // ================================================ 3 — ICM, 4 — pile
  const ICM = [1.20, 1.24, -0.72];
  {
    const port = (k) => at(cyl(0.009, 0.014, 'black', { axis: 'x', seg: 12 }), [-0.105, -0.005, -0.05 + k * 0.025]);
    P('3', at(group(
      box(0.20, 0.075, 0.14, 'grey', { r: 0.008 }),
      at(box(0.24, 0.006, 0.17, 'grey'), [0, -0.04, 0]), // semelle de fixation
      at(box(0.17, 0.006, 0.11, 'lightGrey', { r: 0.004 }), [0, 0.04, 0]), // couvercle
      merged([0, 1, 2, 3, 4].map(port), 'black'),
    ), ICM), [0, 0.12, 0]);
    P('4', at(box(0.05, 0.035, 0.05, 'black', { r: 0.004 }), [ICM[0] + 0.125, ICM[1] - 0.005, ICM[2] + 0.02]), [0.06, 0.06, 0]);
  }
  const PORT = (k) => [ICM[0] - 0.115, ICM[1] - 0.005, ICM[2] - 0.05 + k * 0.025];

  // ================================================ actionneurs manuels (13), équerres (12)
  // Bouton champignon rouge en haut (+Y local), goupille à anneau, embase, connecteur dessous.
  const manual = () => group(
    merged([
      lathe([[0, 0], [0.024, 0], [0.024, 0.04], [0.016, 0.05], [0.012, 0.075], [0, 0.075]], 'red', { seg: 16 }),
      lathe([[0, 0.075], [0.022, 0.078], [0.024, 0.088], [0, 0.095]], 'red', { seg: 16 }),
    ], 'red'),
    at(box(0.06, 0.008, 0.06, 'black', { r: 0.004 }), [0, 0.004, 0]),
    torus(0.009, 0.0018, 'zinc', { axis: 'z', pos: [0.03, 0.06, 0] }),
    at(cyl(0.0018, 0.03, 'zinc', { axis: 'x', seg: 6 }), [0.015, 0.06, 0]),
    at(cyl(0.007, 0.03, 'black', { seg: 10 }), [0, -0.015, 0]),
  );
  const MAN = {
    rear: { p: [-2.06, 1.20, -0.30], rot: [0, 0, Math.PI / 2] }, // sur le panneau arrière, bouton vers -X
    right: { p: [1.62, 1.22, 0.75], rot: [-Math.PI / 2, 0, 0] }, // côté droit, bouton vers +Z
    left: { p: [1.30, 1.22, -0.79], rot: [Math.PI / 2, 0, 0] }, // côté gauche, bouton vers -Z
  };
  for (const k of ['rear', 'right', 'left']) {
    const { p, rot } = MAN[k];
    const dir = k === 'rear' ? [-0.08, 0, 0] : [0, 0, k === 'right' ? 0.08 : -0.08];
    P('13', at(manual(), p, rot), dir);
  }
  // équerres des actionneurs latéraux : aile verticale percée + aile d'appui
  for (const k of ['right', 'left']) {
    const { p } = MAN[k];
    const s = k === 'right' ? 1 : -1;
    P('12', group(merged([
      at(box(0.09, 0.09, 0.005, 'black'), [p[0], p[1], p[2] - s * 0.0025]),
      at(box(0.09, 0.005, 0.06, 'black'), [p[0], p[1] - 0.045, p[2] - s * 0.03]),
    ], 'black')), [0, 0, s * 0.05]);
  }

  // ================================================ circuit de détection
  const J8 = [0.90, 1.14, -0.72];
  P('7', group(cable([PORT(0), [1.0, 1.2, -0.78], [0.95, 1.15, -0.74], [J8[0] + 0.05, J8[1], J8[2]]], RC), conn([0.98, 1.17, -0.76], 0.6)), [0.05, 0.08, 0]);
  // répartiteur 3 voies : boîtier et quatre départs (trois actionneurs, fin de ligne)
  const legs = [[-0.12, 1.14, -0.60], [-0.12, 1.14, -0.66], [-0.12, 1.14, -0.78], [-0.12, 1.14, -0.84]].map(([dx, y, z]) => [J8[0] + dx, y, z]);
  P('8', group(
    at(box(0.06, 0.02, 0.05, 'black', { r: 0.004 }), J8),
    ...legs.map((q, i) => cable([[J8[0] - 0.03, J8[1], J8[2] - 0.015 + i * 0.01], [J8[0] - 0.07, J8[1], (J8[2] + q[2]) / 2], q], RC * 0.8)),
    ...legs.map((q) => conn([q[0] - 0.02, q[1], q[2]])),
  ), [0.05, 0.1, 0]);
  // 9 — fin de ligne : bouchon de connecteur sur le 4e départ
  P('9', at(merged([box(0.03, 0.016, 0.018, 'black', { r: 0.004 }), at(cyl(0.006, 0.012, 'black', { axis: 'x', seg: 10 }), [-0.02, 0, 0])], 'black'), [legs[3][0] - 0.06, legs[3][1], legs[3][2]]), [-0.06, 0.06, 0]);
  // 11 — 10 pi vers l'actionneur du panneau arrière (le long du côté gauche)
  P('11', cable([[legs[2][0] - 0.04, legs[2][1], legs[2][2]], [0.4, 1.0, -0.70], [-0.4, 0.92, -0.69], [-1.4, 0.92, -0.68], [-1.95, 1.0, -0.58], [-2.04, 1.14, -0.40], [-2.04, 1.20, -0.32]], RC), [0, 0.05, -0.05]);
  // 10 — 5 pi vers l'actionneur droit (devant, sous les distributeurs), 5 pi vers le gauche
  P('10', cable([[legs[0][0] - 0.04, legs[0][1], legs[0][2]], [0.95, 1.0, -0.5], [1.45, 0.92, -0.2], [1.55, 0.95, 0.45], [1.62, 1.12, 0.72], [1.62, 1.20, 0.74]], RC), [0, 0.05, 0.05]);
  P('10', cable([[legs[1][0] - 0.04, legs[1][1], legs[1][2]], [0.9, 1.06, -0.74], [1.12, 1.10, -0.80], [1.28, 1.16, -0.79], [1.30, 1.21, -0.78]], RC), [0, 0.05, -0.05]);

  // ================================================ circuit de déclenchement et cartouche
  const CART = [-2.02, 0.80, -0.62]; // axe de la cartouche, haut de l'actionneur à CART + 0.13
  // 23 — support : plaque verticale et deux colliers
  P('23', group(merged([
    at(box(0.006, 0.34, 0.09, 'black'), [CART[0] + 0.042, CART[1] - 0.06, CART[2]]),
    ...[-0.16, 0.0].map((dy) => at(ring(0.038, 0.034, 0.02, 'black', { seg: 20 }), [CART[0], CART[1] + dy, CART[2]])),
  ], 'black')), [0.06, 0, 0]);
  // 22 — cartouche de gaz propulseur Ø 2 1/2 × 12 po, col fileté vers le haut
  P('22', at(lathe([[0, -0.30], [0.022, -0.298], [0.031, -0.285], [0.032, -0.26], [0.032, -0.04], [0.026, -0.012], [0.012, 0], [0.012, 0.02], [0, 0.02]], 'red', { seg: 20 }), [CART[0], CART[1] + 0.07, CART[2]]), [0, -0.12, 0]);
  // 21 — actionneur électro-pneumatique vissé sur la cartouche, sortie de gaz latérale
  const ACT = [CART[0], CART[1] + 0.12, CART[2]];
  P('21', group(
    merged([
      lathe([[0, -0.03], [0.03, -0.03], [0.03, 0.02], [0.022, 0.03], [0, 0.03]], 'red', { seg: 18 }),
    ], 'red').translateX(ACT[0]).translateY(ACT[1]).translateZ(ACT[2]),
    at(merged([at(nut(0.022, 0.012, 'brass', { axis: 'z' }), [0, 0, 0.036]), at(cyl(0.006, 0.02, 'brass', { axis: 'z', seg: 10 }), [0, 0, 0.05])], 'brass'), ACT),
  ), [0, 0.06, 0]);
  // 17 — dispositif d'actionnement (PAD) sur le dessus de l'actionneur, coude du câble
  const PAD = [ACT[0], ACT[1] + 0.03, ACT[2]];
  P('17', group(merged([
    lathe([[0, 0], [0.012, 0], [0.012, 0.035], [0.008, 0.04], [0, 0.04]], 'zinc', { seg: 14 }),
    at(nut(0.02, 0.01, 'zinc'), [0, 0.005, 0]),
  ], 'zinc')).translateX(PAD[0]).translateY(PAD[1]).translateZ(PAD[2]), [0, 0.1, 0]);
  // 31* — fil plombé : boucle dans l'anneau de l'actionneur manuel arrière et plomb
  {
    const p = MAN.rear.p;
    P('31*', group(
      at(torus(0.012, 0.0006, 'zinc', { axis: 'x' }), [p[0] + 0.06, p[1] - 0.03, p[2] + 0.004]),
      at(cyl(0.003, 0.004, 'zinc', { axis: 'x', seg: 8 }), [p[0] + 0.06, p[1] - 0.045, p[2] + 0.004]),
    ), [0, -0.04, 0.03]);
  }
  // 14 — 10 pi, 15 — 5 pi, 16 — descente vers le PAD
  const C14 = [-0.95, 0.88, -0.66], C15 = [-1.85, 0.94, -0.64];
  P('14', group(cable([PORT(1), [1.0, 1.18, -0.70], [0.5, 0.96, -0.68], [-0.3, 0.88, -0.67], C14], RC), conn(C14)), [0, -0.05, -0.04]);
  P('15', group(cable([[C14[0] - 0.03, C14[1], C14[2]], [-1.4, 0.9, -0.65], C15], RC), conn(C15)), [0, -0.05, -0.05]);
  P('16', cable([[C15[0] - 0.03, C15[1], C15[2]], [-1.96, 0.97, -0.63], [PAD[0] + 0.02, PAD[1] + 0.07, PAD[2]], [PAD[0], PAD[1] + 0.045, PAD[2]]], RC), [-0.04, 0.05, 0]);

  // ================================================ circuit de relais (vers le panneau avant gauche)
  const PANEL = [1.55, 1.05, -0.62];
  const C18 = [1.38, 1.05, -0.60], C10 = [1.40, 1.10, -0.66];
  P('18', group(cable([PORT(2), [1.07, 1.18, -0.72], [1.2, 1.08, -0.62], C18], RC), conn(C18)), [0, 0.04, 0.04]);
  P('19', cable([[C18[0] + 0.03, C18[1], C18[2]], [1.47, 1.05, -0.60], [PANEL[0], PANEL[1], PANEL[2] + 0.03]], RC), [0.04, 0.04, 0.04]);
  P('10', group(cable([PORT(3), [1.06, 1.22, -0.68], [1.2, 1.16, -0.66], C10], RC), conn(C10)), [0, 0.06, 0]);
  P('20', cable([[C10[0] + 0.03, C10[1], C10[2]], [1.48, 1.08, -0.64], [PANEL[0], PANEL[1] + 0.02, PANEL[2]]], RC), [0.05, 0.06, 0]);

  // ================================================ circuit d'affichage
  const C5 = [-1.30, 1.42, 0.05];
  P('5', group(cable([PORT(4), [1.0, 1.28, -0.60], [0.4, 1.5, -0.45], [-0.4, 1.55, -0.25], [-1.0, 1.5, -0.05], C5], RC), conn(C5, 0.3)), [0, 0.06, 0]);
  P('6', cable([[C5[0] - 0.03, C5[1], C5[2] + 0.01], [-1.45, 1.40, 0.10], [-1.585, 1.355, 0.16]], RC), [-0.04, 0.06, 0]);

  // ================================================ 24 — réservoir d'agent et support
  const TK = [-1.75, 0.66, 0.79]; // pied du réservoir
  P('24', group(
    lathe([[0, 0], [0.085, 0], [0.1, 0.02], [0.1, 0.5], [0.085, 0.55], [0.04, 0.58], [0, 0.58]], 'red', { seg: 28, pos: TK }),
    merged([
      at(cyl(0.035, 0.05, 'brass', { seg: 16 }), [TK[0], TK[1] + 0.6, TK[2]]),
      at(nut(0.05, 0.02, 'brass'), [TK[0], TK[1] + 0.63, TK[2]]),
      at(cyl(0.008, 0.06, 'brass', { axis: 'x', seg: 10 }), [TK[0] + 0.04, TK[1] + 0.61, TK[2]]),
      at(cyl(0.008, 0.06, 'brass', { axis: 'z', seg: 10 }), [TK[0], TK[1] + 0.61, TK[2] - 0.04]),
    ], 'brass'),
    // support : semelle, dossier boulonné au réservoir hydraulique, deux sangles
    merged([
      at(box(0.24, 0.006, 0.24, 'black'), [TK[0], TK[1] - 0.003, TK[2]]),
      at(box(0.24, 0.5, 0.006, 'black'), [TK[0], TK[1] + 0.25, TK[2] - 0.13]),
      ...[0.12, 0.42].map((dy) => at(ring(0.104, 0.1, 0.035, 'black', { seg: 28 }), [TK[0], TK[1] + dy, TK[2]])),
      at(box(0.1, 0.006, 0.06, 'black'), [TK[0], TK[1] - 0.003, TK[2] - 0.15]),
    ], 'black'),
    // flexible de gaz propulseur : actionneur (21) → entrée du réservoir
    hose([[ACT[0] + 0, ACT[1], ACT[2] + 0.06], [-2.02, 0.95, -0.45], [-2.12, 0.72, -0.2], [-2.12, 0.72, 0.55], [-1.85, 1.0, 0.79], [TK[0] - 0.07, TK[1] + 0.61, TK[2]]], 0.005),
  ), [0, 0.1, 0.25]);

  // ================================================ 25 — té de distribution et flexibles d'agent
  const TEE = [-1.55, 0.60, 0.62];
  // Buses : position de l'équerre et direction du jet
  const NOZ = [
    { p: [1.30, 1.62, 0.62], d: [-0.1, -1, -0.65] }, // avant droite, vers le centre du pont
    { p: [0.75, 1.60, -0.62], d: [0.35, -1, 0.65] }, // avant gauche
    { p: [-0.75, 1.62, 0.55], d: [0.1, -1, -0.3] }, // arrière droite, vers le moteur
    { p: [-0.70, 1.42, -0.66], d: [0.1, -0.8, 0.9] }, // arrière gauche, vers le moteur
    { p: [2.02, 0.62, 0.0], d: [-1, -0.1, 0] }, // avant milieu, sous le cadre, vers l'arrière
    { p: [-1.75, 0.60, -0.10], d: [1, -0.1, 0] }, // arrière milieu, sous le réservoir, vers l'avant
  ];
  const top = (n) => { const d = V(n.d).normalize(); return V(n.p).addScaledVector(d, -0.045).toArray(); };
  const RH = 0.0095;
  const lines = [
    [TEE, [-1.0, 0.6, 0.64], [0.4, 0.6, 0.64], [1.1, 0.75, 0.66], [1.3, 1.3, 0.68], top(NOZ[0])],
    [TEE, [-1.2, 0.58, 0.3], [0.2, 0.58, 0.0], [0.8, 0.62, -0.6], [0.75, 1.3, -0.68], top(NOZ[1])],
    [TEE, [-1.1, 0.64, 0.68], [-0.85, 1.1, 0.66], [-0.76, 1.5, 0.6], top(NOZ[2])],
    [TEE, [-1.3, 0.58, 0.0], [-0.95, 0.6, -0.6], [-0.75, 1.1, -0.7], top(NOZ[3])],
    [TEE, [0.2, 0.6, 0.6], [1.6, 0.6, 0.4], [2.1, 0.62, 0.1], top(NOZ[4])],
    [TEE, [-1.75, 0.58, 0.4], [-1.85, 0.6, 0.1], top(NOZ[5])],
  ];
  P('25', group(
    merged([
      at(box(0.05, 0.04, 0.04, 'brass', { r: 0.004 }), TEE),
      at(nut(0.03, 0.02, 'brass', { axis: 'x' }), [TEE[0] + 0.035, TEE[1], TEE[2]]),
      at(nut(0.03, 0.02, 'brass', { axis: 'x' }), [TEE[0] - 0.035, TEE[1], TEE[2]]),
      at(nut(0.03, 0.02, 'brass'), [TEE[0], TEE[1] + 0.03, TEE[2]]),
    ], 'brass'),
    // descente réservoir → té
    hose([[TK[0] + 0.07, TK[1] + 0.61, TK[2]], [-1.6, 1.15, 0.8], [-1.55, 0.8, 0.7], [TEE[0], TEE[1] + 0.04, TEE[2]]], RH),
    ...lines.map((pts) => hose(pts, RH)),
  ), [0, -0.12, 0]);

  // ================================================ 26 — buses, 27 — rondelles frein, 28 — équerres
  // Repère local : jet vers -Y, aile percée de l'équerre dans le plan y = 0.
  NOZ.forEach((n, i) => {
    const away = V(n.d).normalize().multiplyScalar(-0.06).toArray();
    // buse V-1/2 : six-pans, corps fileté, embout à fente de jet
    P('26', aim(group(merged([
      at(nut(0.022, 0.012, 'brass'), [0, 0.012, 0]),
      lathe([[0, -0.03], [0.008, -0.03], [0.011, -0.022], [0.011, 0], [0.008, 0], [0.008, 0.04], [0, 0.04]], 'brass', { seg: 14 }),
      at(box(0.016, 0.004, 0.003, 'brass'), [0, -0.03, 0]),
    ], 'brass')), n.p, n.d), away);
    // rondelles frein de part et d'autre de l'aile
    for (const dy of [0.004, -0.004]) {
      P('27', aim(group(ring(0.011, 0.0065, 0.002, 'zinc', { seg: 12 })), V(n.p).addScaledVector(V(n.d).normalize(), -dy).toArray(), n.d), V(away).multiplyScalar(dy > 0 ? 0.6 : 0.3).toArray());
    }
    // équerre : aile percée et aile de fixation (deux trous)
    P('28', aim(group(merged([
      plate(0.05, 0.04, 0.004, 'black', { holes: [[0, 0, 0.0075]] }),
      at(plate(0.05, 0.05, 0.004, 'black', { holes: [[-0.012, 0, 0.004], [0.012, 0, 0.004]] }), [0, 0.025, -0.02], [Math.PI / 2, 0, 0]),
    ], 'black')), n.p, n.d), V(away).multiplyScalar(0.15).toArray());
    void i;
  });

  // ================================================ 30* — passe-câbles 3 trous (×6)
  const grom = [[0.4, 1.0, -0.70], [-0.4, 0.92, -0.69], [-1.4, 0.92, -0.68], [1.45, 0.92, -0.2], [-0.3, 0.88, -0.67], [0.4, 1.5, -0.45]];
  for (const g of grom) {
    P('30*', at(group(merged([
      ring(0.016, 0.004, 0.008, 'rubber', { axis: 'x', seg: 16 }),
      ring(0.019, 0.013, 0.003, 'rubber', { axis: 'x', seg: 16 }),
    ], 'rubber')), g), [0, 0.04, 0]);
  }

  // ================================================ 29 — étiquettes
  P('29', group(
    at(box(0.12, 0.001, 0.08, 'white'), [ICM[0], ICM[1] + 0.044, ICM[2]]),
    at(box(0.06, 0.0012, 0.02, 'red'), [ICM[0] - 0.02, ICM[1] + 0.045, ICM[2] + 0.02]),
    at(box(0.004, 0.18, 0.12, 'white'), [TK[0] - 0.101, TK[1] + 0.28, TK[2]]),
    at(box(0.0045, 0.04, 0.1, 'red'), [TK[0] - 0.1015, TK[1] + 0.34, TK[2]]),
    ...Object.values(MAN).map(({ p }) => at(box(0.06, 0.03, 0.06, 'safety'), [p[0], p[1] - 0.06, p[2]])).map((m, k) => {
      // plaquette « PUSH » sous chaque actionneur
      m.scale.set(...(k === 0 ? [0.03, 1, 1] : [1, 1, 0.03]));
      return m;
    }),
  ), [0, 0.08, 0]);

  return { view: { dir: [0.6, 0.9, 1.2] } };
}

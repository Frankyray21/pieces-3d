// P200 — Enrouleur de câble : CX003963 rév. 3 « CABLE REEL ARRANGEMENT »
// (page 200), repère 2 de P198 (option enrouleur, repère 6 de P186).
// Bras pivotant mécano-soudé (5) : tube de pivot vertical Ø 3 1/2 po en bout,
// bras en tube rectangulaire 3 × 4 po, plaque porte-enrouleur 1/2 po en
// porte-à-faux vers l'extérieur, broche de verrouillage coudée et sa chaînette,
// chaise de 2 po où se boulonne l'ensemble de galets (7 = P202). Dans le tube
// de pivot : bague (3) ; axe de pivot à tête (2) qui traverse les oreilles du
// support (P198) et le tube, deux rondelles de butée (1) de part et d'autre du
// tube, goupille fendue Ø 3/16 × 2 1/4 po (8) sous l'oreille basse. Enrouleur
// type 20.1 K560 (6) : coffret d'entraînement à toit incliné et couvercle à
// charnière, gaine annelée de sortie du câble, tambour Ø 0,66 m, deux joues en
// fer plat roulé Ø 1,10 m à douze rayons en cornière, moyeu à bride. Plaque
// d'enrouleur (4) : contre-plaque carrée boulonnée au fond du coffret
// (« located inside cable reel box »).
// Repère : origine sur l'axe du pivot, à la face inférieure du tube de pivot
// (sur la rondelle de butée basse) ; Y vers le haut ; le bras s'étend vers -X
// (plaque porte-enrouleur centrée à x = -1.0) ; +Z vers l'extérieur : axe de
// l'enrouleur selon Z, joues à z = 0.40 et 0.82, axe à y = 0.43.
// Encombrement ≈ 1.85 (X) × 1.12 (Y) × 1.02 (Z) m. Diamètres de l'enrouleur,
// longueur du bras et sections estimés d'après les proportions des pages 186, 198
// et 200 (le manuel ne les cote pas).

const IN = 0.0254;

export default function P200(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // ---------------------------------------------------------------- cotes
  const TH = 0.2; // hauteur du tube de pivot
  const TR = 1.75 * IN, TRi = 1.25 * IN; // tube de pivot Ø 3 1/2 × Ø 2 1/2 int.
  const PIN_R = 1.0 * IN; // axe Ø 2 po
  const BW = 3 * IN, BH = 4 * IN; // bras 3 (Z) × 4 (Y) po
  const YA = TH / 2; // axe du bras
  const XP = -1.0, ZP = 0.15; // centre de la plaque porte-enrouleur
  const PT = 0.5 * IN;
  const YP = YA + BH / 2 + PT; // dessus de la plaque
  const R = 0.55, RD = 0.33; // joues, tambour
  const ZR0 = 0.4, ZR1 = 0.82; // joues arrière / avant
  const YC = YP + 0.25; // axe de l'enrouleur
  const BOX = { x: 0.56, y: 0.44, z0: -0.04, z1: 0.36 }; // coffret

  // ---------------------------------------------------------------- 5 — bras pivotant
  const arm = [];
  arm.push(S.shell(TR, TRi, TH, 'grey', { pos: [0, TH / 2, 0], seg: 40 }));
  const armX0 = -TR + 0.004, armX1 = XP - 0.22;
  arm.push(S.box(armX0 - armX1, BH, BW, 'grey', { r: 0.006, pos: [(armX0 + armX1) / 2, YA, 0] }));
  // Embout du tube fermé côté plaque, plaque porte-enrouleur percée aux coins.
  const pw = 0.5, pd = 0.46;
  const plateM = S.plate(pw, pd, PT, 'grey', { r: 0.01, holes: [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => [sx * (pw / 2 - 0.035), sz * (pd / 2 - 0.035), (0.53 * IN) / 2]) });
  plateM.position.set(XP, YP - PT / 2, ZP);
  arm.push(plateM);
  // Gousset sous la partie en porte-à-faux.
  const gus = S.extrude([[0, 0], [pd / 2 + ZP - BW / 2 - 0.01, 0], [0, -BH + 0.01]], 0.375 * IN, 'grey');
  gus.rotation.y = -Math.PI / 2;
  gus.position.set(XP, YA + BH / 2, BW / 2);
  arm.push(gus);
  // Broche de verrouillage (coudée), sa patte à chaînette et sa douille.
  const lockX = XP + 0.45;
  arm.push(S.box(0.05, 0.012, 0.05, 'grey', { r: 0.003, pos: [lockX + 0.15, YA + BH / 2 + 0.006, 0] }));
  arm.push(S.cyl(0.016, 0.06, 'grey', { axis: 'z', seg: 18, pos: [lockX, YA - 0.02, -BW / 2 - 0.03] }));
  const pinL = [S.cyl(0.0095, 0.13, 'zinc', { axis: 'z', seg: 14, pos: [lockX, YA - 0.02, -BW / 2 - 0.05] }),
    S.rod([lockX, YA - 0.02, -BW / 2 - 0.115], [lockX - 0.09, YA - 0.02, -BW / 2 - 0.115], 0.0095, 'zinc', 14),
    S.ball(0.0095, 'zinc', { pos: [lockX, YA - 0.02, -BW / 2 - 0.115] })];
  const chainPts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    chainPts.push([lockX - 0.06 + t * 0.21, YA + BH / 2 + 0.012 - Math.sin(t * Math.PI) * 0.09 - (1 - t) * 0.03, -BW / 2 - 0.1 * (1 - t) - 0.005]);
  }
  pinL.push(S.tube(chainPts, 0.0025, 'zinc', { ends: 'none', radial: 6 }));
  // Chaise de l'ensemble de galets : caisson de 2 po en tôle 1/4 po au bout
  // d'un tube carré de 2 po soudé au tube de pivot.
  const XM = 0.16, YM = YA, ZM = 0.12; // face d'appui de P202 (normale +X)
  const t4 = 0.25 * IN, dM = 2 * IN;
  arm.push(S.box(XM - dM - TR + 0.004, 2 * IN, 2 * IN, 'grey', { r: 0.004, pos: [(XM - dM + TR - 0.004) / 2, YM, 0.0] }));
  for (const x of [XM - t4 / 2, XM - dM + t4 / 2]) {
    arm.push(S.box(t4, 0.2, 0.27, 'grey', { r: 0.002, pos: [x, YM, ZM] }));
  }
  for (const s of [1, -1]) arm.push(S.box(dM - 2 * t4, 0.2, t4, 'grey', { pos: [XM - dM / 2, YM, ZM + s * (0.135 - t4 / 2)] }));
  const armWelds = [
    S.weldRing(TR + 0.003, 0.006, 'grey', { pos: [0, YA + BH / 2 + 0.002, 0] }),
  ];
  const aw = S.merged(armWelds, 'grey');
  aw.geometry.userData.edgeAngle = 75;
  P('5', S.group(S.merged(arm, 'grey'), S.merged(pinL, 'zinc'), aw), [0, -0.1, 0]);

  // ---------------------------------------------------------------- 3 — bague, 2 — axe, 1 — butées, 8 — goupille
  P('3', S.shell(TRi, PIN_R + 0.0003, TH - 0.002, 'brass', { pos: [0, TH / 2, 0], seg: 32 }), [0, 0.32, 0]);
  const wt = 0.25 * IN;
  P('1', S.washer(TR, PIN_R + 0.0008, wt, 'zinc', { pos: [0, TH + wt / 2, 0] }), [0, 0.45, 0]);
  P('1', S.washer(TR, PIN_R + 0.0008, wt, 'zinc', { pos: [0, -wt / 2, 0] }), [0, -0.28, 0]);
  // Axe : tête Ø 3 po × 1/2 po (graisseur au centre) posée sur l'oreille haute
  // (1 po), fût Ø 2 po jusqu'à 45 mm sous l'oreille basse, perçage de goupille.
  const ear = 1 * IN;
  const yTop = TH + wt + ear, yBot = -wt - ear - 0.045;
  const pin = S.group(
    S.lathe([[0, yBot], [PIN_R - 0.003, yBot], [PIN_R, yBot + 0.003], [PIN_R, yTop], [1.5 * IN - 0.002, yTop], [1.5 * IN, yTop + 0.002],
      [1.5 * IN, yTop + 0.5 * IN - 0.002], [1.5 * IN - 0.003, yTop + 0.5 * IN], [0, yTop + 0.5 * IN]], 'steel', { seg: 36 }),
    S.merged([S.nut(0.4375 * IN, 0.008, 'brass', { pos: [0, yTop + 0.5 * IN + 0.004, 0] }),
      S.lathe([[0, 0], [0.004, 0], [0.004, 0.006], [0.0055, 0.008], [0.0045, 0.011], [0, 0.0115]], 'brass', { seg: 12, pos: [0, yTop + 0.5 * IN + 0.008, 0] })], 'brass'),
  );
  P('2', pin, [0, 0.62, 0]);
  // Goupille fendue : deux brins demi-ronds, œil, pattes écartées (selon Z).
  const yc = yBot + 0.016, cl = 2.25 * IN, cr = 0.09375 * IN / 2;
  const cot = S.merged([
    S.rod([0, yc + cr, -cl / 2], [0, yc + cr, cl / 2 - 0.012], cr, 'zinc', 8),
    S.rod([0, yc - cr, -cl / 2], [0, yc - cr, cl / 2], cr, 'zinc', 8),
    S.torus(cr * 2.6, cr, 'zinc', { axis: 'x', pos: [0, yc, -cl / 2 - cr * 2.2] }),
    S.rod([0, yc + cr, cl / 2 - 0.012], [0, yc + cr + 0.01, cl / 2], cr, 'zinc', 8),
  ], 'zinc');
  P('8', cot, [0, -0.3, 0.15]);

  // ---------------------------------------------------------------- 6 — enrouleur 20.1 K560
  const reel = [], housing = [], dark = [], rubber = [];
  // Joues : fer plat roulé 50 × 12 mm, rayons en cornière 40 × 40 × 5 côté extérieur.
  const angleL = (len) => {
    const a = 0.04, t = 0.005;
    const m = S.extrude([[0, 0], [a, 0], [a, t], [t, t], [t, a], [0, a]], len, 'zinc');
    return m;
  };
  const NS = 12;
  for (const [z, s] of [[ZR0, -1], [ZR1, 1]]) {
    reel.push(S.ring(R, R - 0.05, 0.012, 'zinc', { axis: 'z', seg: 96, pos: [-0 + XP, YC, z] }));
    for (let i = 0; i < NS; i++) {
      const a = (i / NS) * Math.PI * 2 + (s > 0 ? 0 : Math.PI / NS);
      const len = R - 0.03 - 0.11;
      const m = angleL(len);
      // Cornière le long de Y local, tournée en rayon dans le plan de la joue.
      const g = S.group(m);
      m.rotation.x = -Math.PI / 2; // profil dans XZ, longueur selon Y
      m.position.set(-0.02, 0.11 + len / 2, s > 0 ? 0 : 0);
      g.rotation.z = a - Math.PI / 2;
      g.position.set(XP, YC, z + s * 0.006);
      reel.push(g);
    }
    // Moyeu à bride, couronne de 8 vis.
    reel.push(S.lathe([[0.04, -0.012], [0.13, -0.012], [0.13, 0.012], [0.04, 0.012], [0.04, -0.012]], 'zinc', { axis: 'z', seg: 40, pos: [XP, YC, z + s * 0.02] }));
    reel.push(S.boltCircle(8, 0.1, 0.012, 0.03, 'zinc', { axis: s > 0 ? 'z' : '-z', pos: [XP, YC, z + s * 0.032] }));
    // Pattes de fixation du câble sur deux rayons.
    reel.push(S.box(0.04, 0.05, 0.008, 'zinc', { r: 0.004, pos: [XP - 0.36, YC + 0.06, z + s * 0.012] }));
  }
  // Tambour : virole, flasques, moyeu-tube.
  reel.push(S.shell(RD, RD - 0.004, ZR1 - ZR0 - 0.03, 'zinc', { axis: 'z', seg: 72, pos: [XP, YC, (ZR0 + ZR1) / 2] }));
  for (const z of [ZR0 + 0.015, ZR1 - 0.015]) reel.push(S.ring(RD, 0.05, 0.004, 'zinc', { axis: 'z', seg: 72, pos: [XP, YC, z] }));
  reel.push(S.shell(0.05, 0.04, ZR1 - ZR0 + 0.05, 'zinc', { axis: 'z', seg: 32, pos: [XP, YC, (ZR0 + ZR1) / 2] }));
  // Câble enroulé : quelques spires sur le tambour (caoutchouc noir).
  for (let i = 0; i < 9; i++) rubber.push(S.torus(RD + 0.02, 0.019, 'rubber', { axis: 'z', pos: [XP, YC, ZR0 + 0.035 + i * 0.043] }));
  // Coffret d'entraînement : profil à toit incliné (vers le tambour), extrudé selon Z.
  const bx = BOX.x / 2, by = BOX.y;
  const prof = [[-bx, 0], [bx, 0], [bx, by - 0.04], [bx - 0.04, by], [-bx + 0.12, by], [-bx, by - 0.16]];
  const box = S.extrude(prof, BOX.z1 - BOX.z0, 'lightGrey');
  box.position.set(XP, YP, (BOX.z0 + BOX.z1) / 2);
  housing.push(box);
  // Couvercle (léger relief), charnière continue sur l'arête haute.
  const lid = S.extrude([[-bx + 0.12 - 0.01, by + 0.004], [bx - 0.04 - 0.01, by + 0.004], [bx - 0.04 - 0.01, by - 0.002], [-bx + 0.12 - 0.01, by - 0.002]], BOX.z1 - BOX.z0 - 0.03, 'lightGrey');
  lid.position.set(XP, YP, (BOX.z0 + BOX.z1) / 2);
  housing.push(lid);
  dark.push(S.cyl(0.008, BOX.z1 - BOX.z0 - 0.04, 'steel', { axis: 'z', seg: 12, pos: [XP + bx - 0.035, YP + by - 0.004, (BOX.z0 + BOX.z1) / 2] }));
  dark.push(S.box(0.03, 0.05, 0.012, 'steel', { r: 0.003, pos: [XP - bx + 0.07, YP + by - 0.07, BOX.z1 + 0.006] }));
  // Palier de sortie de l'arbre (face +Z), arbre vers le moyeu.
  dark.push(S.lathe([[0.03, 0], [0.11, 0], [0.11, 0.012], [0.07, 0.016], [0.07, 0.04], [0.03, 0.04], [0.03, 0]], 'castIron', { axis: 'z', seg: 40, pos: [XP, YC, BOX.z1] }));
  dark.push(S.cyl(0.04, ZR1 - BOX.z1 + 0.04, 'steel', { axis: 'z', seg: 24, pos: [XP, YC, (BOX.z1 + ZR1 + 0.04) / 2] }));
  // Sortie du câble : bride sur la face +X, gaine annelée qui part vers le pivot.
  const outY = YP + 0.12, outZ = 0.17;
  dark.push(S.ring(0.07, 0.035, 0.012, 'castIron', { axis: 'x', seg: 32, pos: [XP + bx + 0.006, outY, outZ] }));
  const conduit = [];
  const cpts = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    cpts.push(new THREE.Vector3(XP + bx + 0.012 + t * 0.32, outY - Math.sin(t * Math.PI * 0.5) * 0.08, outZ + t * t * 0.05));
  }
  const curve = new THREE.CatmullRomCurve3(cpts);
  for (let i = 0; i < 22; i++) {
    const t = (i + 0.5) / 22;
    const p = curve.getPoint(t), d = curve.getTangent(t);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    const r = S.torus(0.034, 0.008, 'rubber');
    r.quaternion.copy(q);
    r.position.copy(p);
    conduit.push(r);
  }
  conduit.push(S.tube(cpts.map((v) => v.toArray()), 0.032, 'rubber', { ends: 'none', radial: 16 }));
  P('6', S.group(S.merged(reel, 'zinc'), S.merged(housing, 'lightGrey'), S.merged(dark.filter((o) => o), 'steel'), S.merged(rubber, 'rubber'), S.merged(conduit, 'rubber')), [0, 0.25, 0.5]);

  // ---------------------------------------------------------------- 4 — plaque d'enrouleur (dans le coffret)
  const p4 = S.plate(0.16, 0.16, 0.375 * IN, 'zinc', { r: 0.004, holes: [[-0.055, -0.055, 0.0068], [0.055, -0.055, 0.0068], [-0.055, 0.055, 0.0068], [0.055, 0.055, 0.0068], [0, 0, 0.012]] });
  p4.position.set(XP, YP + 0.003 + 0.375 * IN / 2, ZP);
  P('4', p4, [0, 0.95, 0.2]);

  // ---------------------------------------------------------------- 7 — ensemble de galets (P202)
  // Repère de P202 : X (largeur de la plaque) → Y, Y (axes des rouleaux) → Z,
  // Z (normale à la plaque d'appui, vers les rouleaux) → +X.
  const g7 = S.group(api.sub('P202'));
  g7.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0)));
  g7.position.set(XM, YM, ZM);
  P('7', g7, [0.3, 0, 0]);

  return { view: { dir: [0.9, 0.55, 1.1] } };
}

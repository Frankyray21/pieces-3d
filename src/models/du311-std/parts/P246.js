// P246 — Groupe moteur CX030877 rév. 4 (pages 246 à 259) : « ENGINE
// ARRANGEMENT, DU311 », repère 5 de P220. Moteur diesel Mercedes OM904 LA
// (MBE904, 174 ch) monté TRANSVERSALEMENT sur le châssis arrière (2) : poulie
// et carter de courroie (P268) à droite, carter de volant SAE 3 et pompes en
// tandem à gauche — pompe de translation 90 cc (3), pompe 60 cc (5) et pompe
// à engrenages 32 cc (6) en bout, joint torique entre pompes (14), coude
// d'aspiration 2 po (15, bride 73, colliers 20) ; suspension (kit 36 :
// traverses, consoles arrière vissées M16 (1, rondelles 95) sur le carter de
// volant, plots élastiques et vis 3/4 po 85 / 84) ; radiateur (P266) à
// l'arrière du compartiment avec son moteur de ventilateur hydraulique (11) ;
// refroidisseur d'huile (P270) côté droit ; filtre de retour (tête 7, deux
// éléments 8, indicateur 9) sur la console 31 du radiateur ; deux filtres
// haute pression (P264) sur la console 30 vissée au carter de volant ; platine
// 40 portant le distributeur de translation (P262) et le bloc surpresseur
// (21, limiteurs 22, prises de mesure 12), multiplicateur de pression (16,
// brides 10) sous l'équerre 39 (colliers 19) ; collecteur de translation
// (P260) sur le support du filtre à air ; échappement (P272, bande isolante
// 13), tuyauteries CAC et eau (P274), flexibles du surpresseur (P276) ;
// té de distribution d'extinction (37), support de remplissage de gazole
// (38), robinet à boisseau 3/4 po (27) déporté ; tous les raccords (12, 17,
// 18, 42 à 75, 99) et la boulonnerie (76 à 98) à leur place.
// Repère : REPÈRE MACHINE (../layout.js : origine au sol sous l'articulation,
// X vers l'avant, Y vers le haut, Z à droite), posé à l'identité par P220 ;
// implantation et repère moteur dans _engine.js (ENG, RAD, HC, AIR, TMAN,
// PLATE, TVALVE, BOOST, HPF, INTENS, RFILT, MOUNTX). Encombrement ≈ 1.6 (X,
// de −2.75 à −1.15) × 1.5 (Y, de 0.45 à 1.95) × 1.9 (Z) m. Cotes : moteur
// d'après les données Mercedes (≈ 0,82 × 0,69 × 0,78 m), pompes et appareils
// d'après les proportions des pages 246 à 258, quincaillerie d'après la liste.
import {
  ENG, RAD, HC, AIR, TMAN, PLATE, PLATE_TOP, TVALVE, BOOST, HPF, INTENS, RFILT, MOUNTX,
  e2m, inEngine, IN, u, bolt, nut, washer, washerT, pose, offset, uBolt, pClamp, tBoltClamp,
  fitStraight, fitElbow, fitTee, fitReducer, fitPlug, fitTestPort, splitFlangeKit, inlineValve, placeFit, boosterFittings,
} from './_engine.js';

export default function P246(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, at, group, merged, extrude, tube } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const E = (...o) => inEngine(S, ...o);
  const PE = (ref, obj, e) => P(ref, E(obj), e);
  // Boîte par ses bornes.
  const bx = (x0, x1, y0, y1, z0, z1, mat, r = 0) => box(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0), mat, { r, pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  // Extrusion selon x (repère moteur) d'un contour [[z, y], ...].
  const slabX = (pts, x0, x1, mat, holes = []) => {
    const m = extrude(pts.map(([z, y]) => [-z, y]), x1 - x0, mat, { holes: holes.map(([z, y, r]) => [-z, y, r]) });
    m.rotation.y = Math.PI / 2;
    m.position.x = (x0 + x1) / 2;
    return m;
  };
  // Raccord posé (fit = { obj, tip, dir }) sur un orifice ; inE : repère moteur.
  const F = (ref, fit, p, n, want = null, e = null, inE = false) => {
    const f = placeFit(THREE, fit, p, n, want);
    const obj = inE ? E(f.obj) : f.obj;
    P(ref, obj, e ?? n.map((v) => v * 0.08));
    return f;
  };
  const neg = (v) => v.map((a) => -a);

  // ================================================================ 2 — moteur OM904 LA
  // Construit dans le repère moteur (x vers la poulie, y vers le haut, z côté échappement).
  {
    const grey = [], iron = [], alu = [], blk = [], stl = [], dark = [], yel = [];
    const [BX0, BX1] = ENG.blockX;
    // Carter de volant SAE 3 : bride ronde, cloche nervurée, portée de pompe SAE C.
    grey.push(lathe([[0.1, 0], [ENG.sae.outR, 0], [ENG.sae.outR, 0.024], [0.242, 0.03], [0.228, 0.075], [0.205, BX0], [0.1, BX0]], 'grey', { axis: 'x', seg: 48 }));
    grey.push(lathe([[0, -0.004], [0.1, -0.004], [0.1, 0.03], [0, 0.03]], 'grey', { axis: 'x', seg: 32 }));
    stl.push(lathe([[0.064, -0.0045], [0.098, -0.0045], [0.098, -0.0035], [0.064, -0.0035]], 'steel', { axis: 'x', seg: 32 }));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      const m = bx(0.03, BX0, -0.006, 0.006, 0, 0.04, 'grey');
      const g = group(m);
      m.position.set((0.03 + BX0) / 2, 0, 0.215);
      g.rotation.x = a;
      grey.push(g);
    }
    for (let i = 0; i < 12; i++) {
      const a = ((i + 0.5) / 12) * Math.PI * 2;
      dark.push(at(cyl(0.0055, 0.001, 'darkSteel', { axis: 'x', seg: 8 }), [-0.0002, Math.sin(a) * ENG.sae.boltR, Math.cos(a) * ENG.sae.boltR]));
    }
    // Bossages latéraux des consoles de suspension arrière.
    for (const s of [-1, 1]) grey.push(bx(0.03, 0.1, -0.15, -0.055, s * 0.2, s * 0.252, 'grey', 0.006));
    // Carter-cylindres : chemise d'eau, nervures, bouchons de dessablage, rail du carter d'huile.
    grey.push(bx(BX0, BX1, -0.1, ENG.deckY, -0.165, 0.165, 'grey', 0.012));
    grey.push(bx(BX0 + 0.01, BX1 - 0.01, 0.12, ENG.deckY - 0.005, -0.178, 0.178, 'grey', 0.01));
    for (const x of [0.15, 0.275, 0.4, 0.525, 0.645]) for (const s of [-1, 1]) grey.push(bx(x - 0.008, x + 0.008, -0.095, 0.12, s * 0.165 - 0.012, s * 0.165 + 0.012, 'grey', 0.003));
    for (const x of [0.21, 0.34, 0.47, 0.6]) for (const s of [-1, 1]) stl.push(at(cyl(0.018, 0.004, 'steel', { axis: 'z', seg: 16 }), [x, 0.2, s * 0.179]));
    grey.push(bx(BX0 + 0.005, BX1 - 0.005, -0.112, -0.1, -0.172, 0.172, 'grey', 0.003));
    // Carter d'huile : cuve, bride, vis de bride, bouchon de vidange.
    grey.push(bx(0.13, 0.65, ENG.panY, -0.112, -0.155, 0.155, 'grey', 0.018));
    grey.push(bx(0.125, 0.655, -0.122, -0.112, -0.168, 0.168, 'grey', 0.003));
    for (let i = 0; i < 12; i++) for (const s of [-1, 1]) stl.push(at(cyl(0.005, 0.005, 'steel', { seg: 6 }), [0.15 + i * 0.044, -0.125, s * 0.162]));
    stl.push(at(S.nut(0.022, 0.012, 'steel'), [0.56, ENG.panY - 0.006, 0.06]));
    // Culasse, joint, couvre-culasse nervuré (noir) à quatre vis et bouchon de remplissage jaune.
    grey.push(bx(0.125, 0.655, ENG.deckY, ENG.headY, -0.16, 0.16, 'grey', 0.008));
    blk.push(bx(0.12, 0.66, ENG.deckY - 0.003, ENG.deckY + 0.003, -0.166, 0.166, 'black'));
    blk.push(bx(0.14, 0.64, ENG.headY, ENG.coverY - 0.01, -0.125, 0.125, 'black', 0.02));
    for (const z of [-0.08, 0.0, 0.08]) blk.push(bx(0.16, 0.62, ENG.coverY - 0.012, ENG.coverY, z - 0.006, z + 0.006, 'black', 0.003));
    blk.push(bx(0.135, 0.645, ENG.headY, ENG.headY + 0.012, -0.13, 0.13, 'black', 0.004));
    for (const x of [0.2, 0.32, 0.44, 0.56]) {
      blk.push(at(cyl(0.017, 0.012, 'rubber', { seg: 16 }), [x, ENG.coverY + 0.002, 0.04]));
      stl.push(at(S.nut(0.016, 0.01, 'steel'), [x, ENG.coverY + 0.012, 0.04]));
    }
    yel.push(lathe([[0, 0], [0.03, 0], [0.031, 0.004], [0.029, 0.02], [0, 0.022]], 'yellow', { seg: 24, pos: [0.6, ENG.coverY - 0.004, -0.06] }));
    yel.push(box(0.04, 0.012, 0.008, 'yellow', { r: 0.003, pos: [0.6, ENG.coverY + 0.022, -0.06] }));
    // Carter de distribution (face avant) et ses vis.
    const tcase = [[-0.19, -0.17], [-0.19, 0.25], [-0.12, 0.36], [0.12, 0.36], [0.19, 0.25], [0.19, -0.17], [0.1, -0.215], [-0.1, -0.215]];
    grey.push(slabX(tcase, BX1, ENG.frontX, 'grey'));
    for (let i = 0; i < tcase.length; i++) {
      const [z0, y0] = tcase[i], [z1, y1] = tcase[(i + 1) % tcase.length];
      for (const t of [0.25, 0.75]) stl.push(at(S.bolt(0.008, 0.01, 'steel', { axis: 'x' }), [ENG.frontX + 0.006, (y0 + (y1 - y0) * t) * 0.92, (z0 + (z1 - z0) * t) * 0.92]));
    }
    // Amortisseur et poulie de vilebrequin (gorges poly-V), vis centrale.
    const groove = (r, x0, n, w = 0.0055) => {
      const prof = [];
      for (let k = 0; k < n; k++) { const x = x0 + k * w; prof.push([r, x], [r - 0.004, x + w * 0.5]); }
      prof.push([r, x0 + n * w]);
      return prof;
    };
    dark.push(lathe([[0, ENG.frontX], [0.045, ENG.frontX], [0.045, 0.72], [0.105, 0.72], [0.105, 0.748], [0.096, 0.752], ...groove(0.096, 0.752, 6), [0.096, 0.79], [0.05, 0.795], [0.04, 0.8], [0, 0.8]], 'darkSteel', { axis: 'x', seg: 40 }));
    stl.push(at(S.bolt(0.016, 0.01, 'steel', { axis: 'x' }), [0.808, 0, 0]));
    // Pompe à eau et sa poulie ; boîtier de thermostat et piquages d'eau.
    alu.push(lathe([[0, ENG.frontX], [0.055, ENG.frontX], [0.055, 0.752], [0.03, 0.758], [0, 0.758]], 'castAlu', { axis: 'x', seg: 28, pos: [0, 0.22, 0.03] }));
    dark.push(lathe([[0.02, 0.758], [0.062, 0.758], ...groove(0.062, 0.762, 5), [0.062, 0.79], [0.02, 0.792]], 'darkSteel', { axis: 'x', seg: 32, pos: [0, 0.22, 0.03] }));
    alu.push(bx(0.655, 0.72, 0.37, 0.47, -0.01, 0.065, 'castAlu', 0.008));
    alu.push(lathe([[0.022, 0.04], [0.025, 0.04], [0.025, 0.09], [0.0275, 0.094], [0.025, 0.098], [0.025, 0.115], [0.022, 0.115]], 'castAlu', { axis: 'z', seg: 20, pos: [ENG.thermo.x, ENG.thermo.y, 0] }));
    alu.push(bx(0.668, 0.712, 0.02, 0.1, 0.17, 0.2, 'castAlu', 0.006));
    alu.push(lathe([[0.022, 0.19], [0.025, 0.19], [0.025, 0.24], [0.0275, 0.244], [0.025, 0.248], [0.025, 0.26], [0.022, 0.26]], 'castAlu', { axis: 'z', seg: 20, pos: [ENG.pumpIn.x, ENG.pumpIn.y, 0] }));
    // Alternateur, tendeur et courroie poly-V.
    const AL = { y: 0.19, z: -0.205 };
    alu.push(lathe([[0, 0.6], [0.062, 0.6], [0.068, 0.61], [0.068, 0.745], [0.06, 0.755], [0.02, 0.76], [0, 0.76]], 'castAlu', { axis: 'x', seg: 28, pos: [0, AL.y, AL.z] }));
    for (const x of [0.63, 0.66, 0.69, 0.72]) dark.push(at(S.ring(0.0695, 0.06, 0.006, 'darkSteel', { axis: 'x', seg: 28 }), [x, AL.y, AL.z]));
    dark.push(lathe([[0.012, 0.762], [0.034, 0.762], ...groove(0.034, 0.765, 4), [0.034, 0.79], [0.012, 0.792]], 'darkSteel', { axis: 'x', seg: 24, pos: [0, AL.y, AL.z] }));
    grey.push(bx(0.6, 0.66, 0.11, 0.135, -0.19, -0.12, 'grey', 0.004));
    blk.push(at(cyl(0.008, 0.012, 'red', { axis: 'z', seg: 10 }), [0.66, AL.y + 0.04, AL.z - 0.07]));
    const TN = { y: 0.08, z: -0.115 };
    grey.push(bx(0.7, 0.735, 0.04, 0.13, -0.135, -0.095, 'grey', 0.006));
    dark.push(lathe([[0.01, 0.762], [0.032, 0.762], [0.034, 0.765], [0.034, 0.787], [0.032, 0.79], [0.01, 0.79]], 'darkSteel', { axis: 'x', seg: 24, pos: [0, TN.y, TN.z] }));
    {
      const wheels = [[0, 0, 0.096], [0.22, 0.03, 0.062], [AL.y, AL.z, 0.034], [TN.y, TN.z, 0.034]];
      const pts = [];
      for (const [y, z, r] of wheels) for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; pts.push([z + Math.cos(a) * (r + 0.003), y + Math.sin(a) * (r + 0.003)]); }
      pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
      const lo = [], up = [];
      for (const p of pts) { while (lo.length >= 2 && cr(lo.at(-2), lo.at(-1), p) <= 0) lo.pop(); lo.push(p); }
      for (const p of [...pts].reverse()) { while (up.length >= 2 && cr(up.at(-2), up.at(-1), p) <= 0) up.pop(); up.push(p); }
      const hull = [...lo.slice(0, -1), ...up.slice(0, -1)];
      blk.push(tube(hull.map(([z, y]) => [0.776, y, z]), 0.005, 'rubber', { closed: true, seg: 96, radial: 6, tension: 0.0 }));
    }
    // Tubulure d'admission (côté −z) : collecteur, quatre pipes, colonne d'entrée et réchauffeur.
    alu.push(cyl(0.035, 0.5, 'castAlu', { axis: 'x', seg: 20, pos: [0.38, 0.385, -0.215] }));
    for (const x of ENG.cylX) alu.push(bx(x - 0.025, x + 0.025, 0.35, 0.41, -0.205, -0.158, 'castAlu', 0.006));
    alu.push(cyl(0.04, 0.06, 'castAlu', { seg: 24, pos: [ENG.intake.x, ENG.intake.y - 0.03, ENG.intake.z] }));
    alu.push(lathe([[0.03, 0], [0.048, 0], [0.048, 0.008], [0.03, 0.008]], 'castAlu', { seg: 24, pos: [ENG.intake.x, ENG.intake.y - 0.008, ENG.intake.z] }));
    blk.push(bx(0.105, 0.155, 0.355, 0.39, -0.27, -0.25, 'black', 0.003));
    // Collecteur d'échappement (côté +z), pipes, conduit vers la turbine.
    iron.push(cyl(0.034, 0.46, 'castIron', { axis: 'x', seg: 20, pos: [0.4, 0.33, 0.215] }));
    for (const x of ENG.cylX) iron.push(bx(x - 0.024, x + 0.024, 0.31, 0.37, 0.158, 0.21, 'castIron', 0.006));
    iron.push(tube([[0.37, 0.33, 0.24], [0.37, 0.31, 0.27], [0.37, 0.29, 0.29]], 0.03, 'castIron', { seg: 8, radial: 16 }));
    // Turbocompresseur : volute de turbine (fonte), corps de paliers, volute de compresseur (alu),
    // entrée axiale vers −x, sortie vers +y, sortie de turbine vers −y, soupape de décharge.
    const TB = ENG.turbo;
    iron.push(lathe([[0, 0.335], [0.074, 0.335], [0.078, 0.348], [0.078, 0.39], [0.06, 0.405], [0, 0.405]], 'castIron', { axis: 'x', seg: 28, pos: [0, TB.y, TB.z] }));
    iron.push(at(S.torus(0.062, 0.022, 'castIron', { axis: 'x' }), [0.37, TB.y, TB.z]));
    stl.push(cyl(0.036, 0.07, 'steel', { axis: 'x', seg: 20, pos: [0.3, TB.y, TB.z] }));
    alu.push(lathe([[0, 0.19], [0.05, 0.19], [0.075, 0.205], [0.082, 0.235], [0.076, 0.262], [0.04, 0.27], [0, 0.27]], 'castAlu', { axis: 'x', seg: 28, pos: [0, TB.y, TB.z] }));
    alu.push(lathe([[0.03, ENG.compIn.x], [0.0355, ENG.compIn.x], [0.0355, ENG.compIn.x + 0.012], [0.038, ENG.compIn.x + 0.016], [0.0355, ENG.compIn.x + 0.02], [0.04, 0.192], [0.03, 0.192]], 'castAlu', { axis: 'x', seg: 24, pos: [0, TB.y, TB.z] }));
    alu.push(cyl(0.028, 0.07, 'castAlu', { seg: 20, pos: [ENG.compOut.x, ENG.compOut.y - 0.035, ENG.compOut.z] }));
    iron.push(cyl(0.036, 0.06, 'castIron', { seg: 20, pos: [ENG.turbOut.x, ENG.turbOut.y + 0.03, ENG.turbOut.z] }));
    iron.push(lathe([[0.03, 0], [0.05, 0], [0.05, 0.008], [0.03, 0.008]], 'castIron', { seg: 24, pos: [ENG.turbOut.x, ENG.turbOut.y, ENG.turbOut.z] }));
    stl.push(at(cyl(0.028, 0.05, 'steel', { axis: 'z', seg: 20 }), [0.23, 0.18, 0.39]));
    stl.push(S.rod([0.23, 0.18, 0.36], [0.24, 0.22, 0.33], 0.0025, 'steel', 6));
    stl.push(tube([[0.32, 0.18, 0.17], [0.32, 0.26, 0.2], [0.3, 0.3, 0.27]], 0.004, 'steel', { seg: 16, radial: 6 }));
    stl.push(tube([[0.3, 0.22, 0.3], [0.31, 0.12, 0.25], [0.32, 0.04, 0.175]], 0.008, 'steel', { seg: 16, radial: 8 }));
    // Calculateur moteur (côté −z) sur plots, ailettes, connecteurs et faisceau.
    alu.push(bx(0.33, 0.55, 0.0, 0.17, -0.268, -0.235, 'castAlu', 0.006));
    for (let k = 0; k < 6; k++) alu.push(bx(0.34, 0.54, 0.015 + k * 0.026, 0.022 + k * 0.026, -0.276, -0.268, 'castAlu'));
    for (const [x, y] of [[0.35, 0.02], [0.53, 0.02], [0.35, 0.15], [0.53, 0.15]]) blk.push(at(cyl(0.012, 0.07, 'rubber', { axis: 'z', seg: 12 }), [x, y, -0.2]));
    blk.push(bx(0.37, 0.43, 0.17, 0.2, -0.265, -0.238, 'black', 0.004), bx(0.46, 0.52, 0.17, 0.2, -0.265, -0.238, 'black', 0.004));
    const harness = S.cable([[0.4, 0.2, -0.25], [0.35, 0.25, -0.24], [0.21, 0.08, -0.205], [0.6, 0.08, -0.205], [0.62, 0.15, -0.27]], 0.007);
    // Pompes d'injection unitaires et tuyaux haute pression.
    for (const x of ENG.cylX) {
      dark.push(cyl(0.017, 0.1, 'darkSteel', { seg: 14, pos: [x, 0.01, -0.19] }));
      blk.push(cyl(0.013, 0.02, 'black', { seg: 12, pos: [x, 0.07, -0.19] }));
      stl.push(tube([[x, 0.08, -0.19], [x, 0.2, -0.205], [x + 0.012, 0.31, -0.19], [x + 0.012, 0.36, -0.162]], 0.0035, 'steel', { seg: 16, radial: 6 }));
    }
    // Filtre à gazole (cartouche blanche, pompe d'amorçage) et module de filtre à huile.
    alu.push(bx(0.56, 0.625, 0.12, 0.17, -0.315, -0.245, 'castAlu', 0.006));
    alu.push(bx(0.585, 0.605, 0.12, 0.17, -0.245, -0.175, 'castAlu', 0.004));
    const fuel = lathe([[0, -0.06], [0.04, -0.06], [0.045, -0.05], [0.045, 0.1], [0.04, 0.115], [0, 0.115]], 'white', { seg: 24, pos: [0.592, 0, -0.28] });
    blk.push(cyl(0.012, 0.02, 'black', { seg: 12, pos: [0.592, 0.18, -0.28] }));
    grey.push(bx(0.38, 0.58, -0.07, 0.09, -0.205, -0.165, 'grey', 0.006));
    const oilf = lathe([[0, -0.2], [0.046, -0.2], [0.05, -0.19], [0.05, -0.085], [0.045, -0.075], [0, -0.075]], 'blue', { seg: 24, pos: [0.49, 0, -0.235] });
    grey.push(bx(0.46, 0.52, -0.08, -0.06, -0.26, -0.2, 'grey', 0.004));
    // Démarreur (côté −z) : nez, moteur, solénoïde, bornes et câble.
    alu.push(lathe([[0, -0.0], [0.04, 0], [0.042, 0.035], [0, 0.035]], 'castAlu', { axis: 'x', seg: 20, pos: [0, 0.02, -0.24] }));
    blk.push(cyl(0.052, 0.19, 'black', { axis: 'x', seg: 24, pos: [0.13, 0.02, -0.24] }));
    blk.push(cyl(0.028, 0.12, 'black', { axis: 'x', seg: 18, pos: [0.13, 0.085, -0.24] }));
    stl.push(at(cyl(0.005, 0.02, 'copper', { axis: 'z', seg: 8 }), [0.17, 0.085, -0.272]));
    const stCable = S.cable([[0.17, 0.085, -0.28], [0.22, 0.12, -0.33], [0.4, 0.22, -0.3]], 0.008, { material: 'red' });
    // Jauge d'huile (tube, poignée jaune), anneaux de levage, pattes avant.
    stl.push(tube([[0.555, -0.11, -0.168], [0.56, 0.18, -0.205], [0.565, 0.37, -0.25]], 0.005, 'steel', { seg: 24, radial: 8 }));
    yel.push(at(S.torus(0.014, 0.004, 'yellow', { axis: 'z' }), [0.565, 0.39, -0.25]));
    for (const [x, z] of [[0.665, 0.12], [0.135, -0.12]]) {
      const eye = extrude([[-0.03, 0], [0.03, 0], [0.025, 0.06], [0, 0.075], [-0.025, 0.06]], 0.012, 'grey', { holes: [[0, 0.05, 0.014]] });
      eye.rotation.y = Math.PI / 2;
      eye.position.set(x, ENG.headY, z);
      grey.push(eye);
    }
    for (const s of [-1, 1]) {
      grey.push(bx(0.585, 0.655, -0.15, -0.06, s * 0.165, s * 0.29, 'grey', 0.006));
      grey.push(bx(0.605, 0.635, -0.06, 0.06, s * 0.165, s * 0.2, 'grey', 0.004));
    }
    // Reniflard (couvre-culasse → admission), câble de capteur, plaque signalétique.
    const breather = S.hose([[0.16, 0.47, -0.1], [0.12, 0.47, -0.17], [0.13, 0.43, -0.26], [0.14, 0.4, -0.26]], 0.009);
    const plate = at(S.nameplate(0.1, 0.045), [0.36, 0.445, -0.126]);
    plate.rotation.y = Math.PI;
    PE('2', group(
      merged(grey, 'grey'), merged(iron, 'castIron'), merged(alu, 'castAlu'), merged(blk, 'black'), merged(stl, 'steel'),
      merged(dark, 'darkSteel'), merged(yel, 'yellow'), fuel, oilf, harness, stCable, breather, plate,
    ), [0, 0.6, 0]);
  }

  // ================================================================ pompes en tandem (repère moteur, x < 0)
  // 3 — pompe de translation 90 cc : bride SAE C, corps, fond à orifices A / B,
  // bloc de commande à deux électro-aimants, pompe de gavage en bout.
  PE('3', group(
    merged([
      bx(-0.022, 0, -0.095, 0.095, -0.095, 0.095, 'castIron', 0.012),
      lathe([[0, 0.0], [0.0625, 0], [0.0625, 0.004], [0, 0.004]], 'castIron', { axis: 'x', seg: 24 }),
      bx(-0.19, -0.022, -0.09, 0.09, -0.1, 0.1, 'castIron', 0.03),
      ...[-0.06, -0.12].map((x) => bx(x - 0.006, x + 0.006, -0.094, 0.094, -0.104, 0.104, 'castIron', 0.01)),
      bx(-0.25, -0.19, -0.1, 0.1, -0.11, 0.11, 'castIron', 0.012),
      ...[-1, 1].map((s) => bx(-0.245, -0.195, -0.04, 0.04, s * 0.11 - 0.004, s * 0.11 + 0.004, 'castIron', 0.003)),
      lathe([[0, -0.27], [0.06, -0.27], [0.07, -0.262], [0.07, -0.25], [0, -0.25]], 'castIron', { axis: 'x', seg: 28 }),
    ], 'castIron'),
    merged([bx(-0.17, -0.06, 0.09, 0.14, -0.07, 0.07, 'castAlu', 0.006)], 'castAlu'),
    merged([-1, 1].flatMap((s) => [
      cyl(0.022, 0.05, 'black', { axis: 'z', seg: 18, pos: [-0.115, 0.115, s * 0.095] }),
      bx(-0.13, -0.1, 0.13, 0.15, s * 0.11 - 0.012, s * 0.11 + 0.012, 'black', 0.003),
    ]), 'black'),
    merged([[-0.2, 0.08, 0.09], [-0.2, -0.08, 0.09], [-0.2, 0.08, -0.09], [-0.2, -0.08, -0.09]].map(([x, y, z]) => at(bolt(S, 0.375, 1.0, { mat: 'blackOxide', socket: true }), [-0.25, y, z], [0, 0, Math.PI / 2])), 'blackOxide'),
    at(S.nameplate(0.06, 0.03), [-0.1, 0.0, 0.1005]),
  ), [0, 0, -0.35]);
  // 14 — joint torique entre la pompe 90 cc et la pompe 60 cc.
  PE('14', at(S.torus(0.05, 0.0018, 'rubber', { axis: 'x' }), [-0.271, 0, 0]), [0, 0, -0.42]);
  // 5 — pompe 60 cc : bride SAE B à deux trous, corps cylindrique, fond à orifices, régulateur.
  PE('5', group(
    merged([
      bx(-0.287, -0.272, -0.055, 0.055, -0.095, 0.095, 'castIron', 0.02),
      lathe([[0, -0.39], [0.08, -0.39], [0.084, -0.38], [0.084, -0.295], [0.07, -0.287], [0, -0.287]], 'castIron', { axis: 'x', seg: 32 }),
      bx(-0.45, -0.385, -0.08, 0.08, -0.085, 0.085, 'castIron', 0.01),
      bx(-0.44, -0.4, -0.09, -0.08, -0.04, 0.04, 'castIron', 0.004),
      bx(-0.31, -0.29, 0.07, 0.09, 0.01, 0.05, 'castIron', 0.004),
    ], 'castIron'),
    merged([
      bx(-0.4, -0.33, 0.085, 0.125, -0.03, 0.045, 'castAlu', 0.005),
      ...[-0.355, -0.38].flatMap((x) => [cyl(0.006, 0.03, 'castAlu', { axis: 'z', seg: 10, pos: [x, 0.105, 0.06] })]),
    ], 'castAlu'),
    merged([-0.355, -0.38].map((x) => at(S.nut(0.012, 0.006, 'steel', { axis: 'z' }), [x, 0.105, 0.065])), 'steel'),
  ), [0, 0, -0.5]);
  // 6 — pompe à engrenages 32 cc : bride SAE A à deux trous, corps alu, couvercle à quatre vis.
  PE('6', group(
    merged([
      bx(-0.462, -0.45, -0.045, 0.045, -0.07, 0.07, 'castAlu', 0.012),
      bx(-0.545, -0.462, -0.05, 0.05, -0.065, 0.065, 'castAlu', 0.025),
      bx(-0.565, -0.545, -0.05, 0.05, -0.065, 0.065, 'castAlu', 0.02),
      ...[-1, 1].map((s) => bx(-0.53, -0.49, -0.03, 0.03, s * 0.065 - 0.006, s * 0.065 + 0.006, 'castAlu', 0.004)),
    ], 'castAlu'),
    merged([[0.03, 0.045], [-0.03, 0.045], [0.03, -0.045], [-0.03, -0.045]].map(([y, z]) => at(bolt(S, 0.3125, 2.0, { mat: 'zinc' }), [-0.565, y, z], [0, 0, Math.PI / 2])), 'zinc'),
  ), [0, 0, -0.62]);

  // ---------------------------------------------------------------- raccords des pompes (repère moteur)
  // 74 — brides 1 po code 62 des orifices A / B de la pompe 90 cc (vis selon y).
  for (const s of [-1, 1]) PE('74', pose(THREE, splitFlangeKit(S, 16, 62).obj, [-0.22, 0, s * 0.114], [0, 0, s], Math.PI / 2), [0, 0, -0.3]);
  F('58', fitElbow(S, 20), [-0.235, 0.1, -0.06], [0, 1, 0], [-1, 0, 0], null, true);
  F('56', fitElbow(S, 12), [-0.22, -0.1, 0.05], [0, -1, 0], [-1, 0, 0], null, true);
  F('71', fitPlug(S, 12), [-0.23, -0.1, -0.05], [0, -1, 0], null, null, true);
  F('60', fitStraight(S, 4, 6), [-0.25, 0.085, -0.09], [-1, 0, 0], null, null, true);
  F('60', fitStraight(S, 4, 6), [-0.25, -0.085, -0.09], [-1, 0, 0], null, null, true);
  F('67', fitStraight(S, 12), [-0.22, -0.05, -0.11], [0, 0, -1], null, null, true);
  F('54', fitElbow(S, 6), [-0.215, 0.1, 0.07], [0, 1, 0], [-1, 0, 0], null, true);
  F('53', fitElbow(S, 12, 12, { angle: 45 }), [-0.12, 0.115, -0.07], [0, 0, -1], [0, 1, 0], null, true);
  for (const z of [-0.04, 0.0, 0.04]) F('62', fitStraight(S, 6), [-0.06, 0.12, z], [1, 0, 0], null, null, true);
  {
    const a = F('17', fitStraight(S, 4), [-0.08, 0.115, 0.07], [0, 0, 1], null, null, true);
    const b = F('43', fitElbow(S, 4, 4, { swivel: true }), a.tip, a.dir, [0, 1, 0], null, true);
    F('45', fitReducer(S, 4, 6), b.tip, b.dir, null, null, true);
  }
  // Pompe 60 cc : aspiration 2 po (bride 73, coude 15, colliers 20), refoulement (57), drain et LS (55), régulateur (62).
  {
    const sk = splitFlangeKit(S, 32, 61, { neck: 0.0 });
    PE('73', pose(THREE, sk.obj, [-0.42, -0.09, 0], [0, -1, 0], Math.PI / 2), [0, -0.15, 0]);
    const y0 = -0.09 - sk.top;
    // Coude d'aspiration : collet à bride, coude 90° vers −z (avant de la machine), embout cannelé.
    const elbowPts = [[-0.42, y0, 0], [-0.42, y0 - 0.05, 0], [-0.42, y0 - 0.075, -0.025], [-0.42, y0 - 0.08, -0.08]];
    const barb = [];
    for (let k = 0; k < 4; k++) barb.push(at(lathe([[0.03, 0], [0.034, 0.004], [0.031, 0.012], [0.03, 0.012]], 'steel', { axis: '-z', seg: 24 }), [-0.42, y0 - 0.08, -0.08 - k * 0.013]));
    PE('15', group(merged([tube(elbowPts, 0.032, 'steel', { seg: 16, radial: 20 }), cyl(0.03, 0.06, 'steel', { axis: 'z', seg: 24, pos: [-0.42, y0 - 0.08, -0.11] }), ...barb], 'steel')), [0, -0.2, 0]);
    for (const k of [0.025, 0.06]) PE('20', at(group(tBoltClamp(S, 0.071, { w: 0.016 })), [-0.42, y0 - 0.08, -0.1 - k], [Math.PI / 2, 0, 0]), [0, -0.22, -0.05]);
  }
  F('57', fitElbow(S, 16), [-0.42, 0.0, 0.085], [0, 0, 1], [0, 1, 0], null, true);
  F('55', fitElbow(S, 8), [-0.3, 0.09, 0.03], [0, 1, 0], [-1, 0, 0], null, true);
  F('55', fitElbow(S, 8), [-0.365, 0.105, 0.045], [0, 0, 1], [0, 1, 0], null, true);
  for (const z of [-0.015, 0.025]) F('62', fitStraight(S, 6), [-0.4, 0.105, z], [-1, 0, 0], null, null, true);
  // Pompe 32 cc : aspiration (57), refoulement à bride 1 po code 61 (72) et adaptateur FL61 / JIC -12 (68), prise de pression (60).
  F('57', fitElbow(S, 16), [-0.51, 0.0, -0.071], [0, 0, -1], [0, 1, 0], null, true);
  {
    const fk = splitFlangeKit(S, 16, 61, { neck: 0.0 });
    PE('72', pose(THREE, fk.obj, [-0.51, 0.0, 0.071], [0, 0, 1], Math.PI / 2), [0, 0, 0.12]);
    const z0 = 0.071 + fk.top;
    const ad = group(merged([
      cyl(0.016, 0.02, 'zinc', { axis: 'z', seg: 16, pos: [-0.51, 0, z0 + 0.01] }),
      at(S.nut(0.032, 0.014, 'zinc', { axis: 'z' }), [-0.51, 0, z0 + 0.027]),
      lathe([[0, 0], [0.012, 0], [0.0135, 0.006], [0.0135, 0.022], [0.009, 0.03], [0, 0.03]], 'zinc', { axis: 'z', seg: 12, pos: [-0.51, 0, z0 + 0.034] }),
    ], 'zinc'));
    PE('68', ad, [0, 0, 0.16]);
  }
  F('60', fitStraight(S, 4, 6), [-0.505, 0.05, 0.0], [0, 1, 0], null, null, true);

  // ---------------------------------------------------------------- boulonnerie des pompes (repère moteur)
  {
    const D = 0.75, tF = washerT(D), tS = washerT(D, 'split');
    for (const [y, z] of [[0.075, 0.075], [-0.075, 0.075], [0.075, -0.075], [-0.075, -0.075]]) {
      PE('89', pose(THREE, washer(S, D), [-0.022, y, z], [-1, 0, 0]), [0, 0, -0.15]);
      PE('93', pose(THREE, washer(S, D, 'split'), [-0.022 - tF, y, z], [-1, 0, 0]), [0, 0, -0.18]);
      PE('84', pose(THREE, bolt(S, D, 2.0), [-0.022 - tF - tS, y, z], [-1, 0, 0]), [0, 0, -0.22]);
    }
    const d = 0.5, tF2 = washerT(d), tS2 = washerT(d, 'split');
    for (const [x, z] of [[-0.287, 0.073], [-0.287, -0.073], [-0.462, 0.058], [-0.462, -0.058]]) {
      PE('88', pose(THREE, washer(S, d), [x, 0, z], [-1, 0, 0]), [0, 0, -0.14]);
      PE('92', pose(THREE, washer(S, d, 'split'), [x - tF2, 0, z], [-1, 0, 0]), [0, 0, -0.16]);
      PE('81', pose(THREE, bolt(S, d, 1.75), [x - tF2 - tS2, 0, z], [-1, 0, 0]), [0, 0, -0.2]);
    }
  }

  // ================================================================ 36 — kit de suspension du moteur
  // Deux traverses (tube 100 × 60 posé sur les longerons), piédestaux ajourés,
  // quatre plots élastiques ; consoles arrière vissées sur le carter de volant.
  const mounts = [e2m([ENG.feet[0][0], ENG.footY, ENG.feet[0][1]]), e2m([ENG.feet[1][0], ENG.footY, ENG.feet[1][1]]), e2m([ENG.feet[2][0], ENG.footY, ENG.feet[2][1]]), e2m([ENG.feet[3][0], ENG.footY, ENG.feet[3][1]])];
  {
    const k = [], rub = [];
    for (const x of MOUNTX) {
      k.push(box(0.1, 0.006, 0.99, 'lightGrey', { pos: [x, 1.057, 0] }), box(0.1, 0.006, 0.99, 'lightGrey', { pos: [x, 1.003, 0] }));
      for (const s of [-1, 1]) k.push(box(0.006, 0.06, 0.99, 'lightGrey', { pos: [x + s * 0.047, 1.03, 0] }));
      for (const s of [-1, 1]) k.push(box(0.1, 0.06, 0.006, 'lightGrey', { pos: [x, 1.03, s * 0.492] }));
    }
    for (const [x, , z] of mounts) {
      k.push(box(0.11, 0.006, 0.09, 'lightGrey', { pos: [x, 1.097, z] }));
      for (const s of [-1, 1]) k.push(box(0.11, 0.037, 0.006, 'lightGrey', { pos: [x, 1.078, z + s * 0.042] }));
      k.push(box(0.1, 0.008, 0.08, 'black', { pos: [x, 1.104, z] }));
      rub.push(lathe([[0, 1.108], [0.04, 1.108], [0.042, 1.112], [0.03, 1.13], [0.034, 1.145], [0.038, 1.15], [0, 1.15]], 'rubber', { seg: 24, pos: [x, 0, z] }));
      k.push(lathe([[0.008, 1.15], [0.036, 1.15], [0.036, 1.158], [0.008, 1.158]], 'black', { seg: 20, pos: [x, 0, z] }));
    }
    // Consoles arrière (repère moteur) : âme contre le bossage du carter de volant, semelle sur le plot.
    const br = [];
    for (const s of [-1, 1]) {
      br.push(bx(0.03, 0.1, -0.15, -0.06, s * 0.252, s * 0.264, 'black', 0.003));
      br.push(bx(0.02, 0.09, -0.162, -0.15, s * 0.252, s * 0.345, 'black', 0.003));
      br.push(bx(0.05, 0.062, -0.15, -0.08, s * 0.264, s * 0.32, 'black', 0.002));
    }
    P('36', group(merged(k, 'lightGrey'), merged(rub, 'rubber'), E(merged(br, 'black'))), [0, -0.25, 0]);
  }
  // 1 — vis M16 × 40 des consoles arrière (vers ±z moteur), 95 — rondelles Nord-Lock (paires, deux disques par vis).
  {
    const d = 16 / 25.4, t1 = u(Math.max(0.05, d * 0.11));
    for (const s of [-1, 1]) for (const x of [0.045, 0.085]) for (const y of [-0.08, -0.13]) {
      const z = s * 0.264;
      PE('95', pose(THREE, washer(S, d, 'flat', { mat: 'zinc' }), [x, y, z], [0, 0, s]), [0, 0, 0]);
      PE('95', pose(THREE, washer(S, d, 'flat', { mat: 'zinc' }), [x, y, z + s * t1], [0, 0, s]), [0, 0, 0]);
      PE('1', pose(THREE, bolt(S, d, 40 / 25.4), [x, y, z + s * 2 * washerT(d)], [0, 0, s]), [0, 0, 0]);
    }
  }
  // 85 — vis 3/4 × 4 1/2 des plots (tête sur la patte, Nord-Lock 96), 89 plate et 98 écrou sous le piédestal.
  {
    const D = 0.75, tF = washerT(D), tN = washerT(D, 'nl');
    for (const [x, , z] of mounts) {
      const yTop = 1.17 + 0.012;
      P('96', pose(THREE, washer(S, D, 'nl'), [x, yTop, z]), [0, 0.12, 0]);
      P('85', pose(THREE, bolt(S, D, 4.5), [x, yTop + tN, z]), [0, 0.2, 0]);
      P('89', pose(THREE, washer(S, D), [x, 1.094, z], [0, -1, 0]), [0, -0.08, 0]);
      P('98', pose(THREE, nut(S, D), [x, 1.094 - tF, z], [0, -1, 0]), [0, -0.1, 0]);
    }
  }
  // 80 — vis 1/2 × 1 1/4 des semelles de plots sur les piédestaux (88 plates, 92 Grower).
  {
    const d = 0.5, tF = washerT(d), tS = washerT(d, 'split');
    for (const [x, , z] of mounts) for (const s of [-1, 1]) {
      const p = [x + s * 0.042, 1.108, z];
      P('88', pose(THREE, washer(S, d), p), [0, 0.06, 0]);
      P('92', pose(THREE, washer(S, d, 'split'), [p[0], p[1] + tF, p[2]]), [0, 0.07, 0]);
      P('80', pose(THREE, bolt(S, d, 1.25), [p[0], p[1] + tF + tS, p[2]]), [0, 0.09, 0]);
    }
  }

  // ================================================================ sous-ensembles
  P('29', at(api.sub('P266'), [RAD.x, RAD.y, 0]), [-0.55, 0, 0]);
  P('33', at(api.sub('P270'), [HC.x, HC.y, HC.z - 0.115]), [0, 0.1, 0.6]);
  P('32', E(api.sub('P268')), [0, 0, 0.45]);
  P('34', api.sub('P272'), [0, -0.4, 0]);
  P('35', api.sub('P274'), [0, 0.35, 0]);
  P('41', api.sub('P276'), [0, 0.3, -0.35]);
  P('4', at(api.sub('P260'), [TMAN.x, TMAN.y, TMAN.z], [0, Math.PI, 0]), [0, 0, -0.45]);
  P('23', at(api.sub('P262'), [TVALVE.x, PLATE_TOP, TVALVE.z], [0, Math.PI / 2, 0]), [0, 0.5, -0.2]);
  for (const z of HPF.z) P('28', at(api.sub('P264'), [HPF.x, HPF.y, z], [0, -Math.PI / 2, 0]), [-0.3, 0.1, -0.15]);

  // ================================================================ 11 — moteur hydraulique du ventilateur (25,2 cc)
  // Bride carrée sur le moyeu du croisillon du radiateur, corps alu, couvercle, orifices latéraux.
  const fm = [RAD.x + RAD.shroud + 0.056, RAD.y + RAD.fan.y, RAD.fan.z]; // face d'appui sur le moyeu
  P('11', group(
    merged([
      box(0.012, 0.09, 0.09, 'castAlu', { r: 0.008, pos: [fm[0] + 0.006, fm[1], fm[2]] }),
      box(0.075, 0.075, 0.085, 'castAlu', { r: 0.018, pos: [fm[0] + 0.05, fm[1], fm[2]] }),
      box(0.012, 0.072, 0.082, 'castAlu', { r: 0.012, pos: [fm[0] + 0.093, fm[1], fm[2]] }),
      ...[-1, 1].map((s) => box(0.03, 0.03, 0.008, 'castAlu', { r: 0.003, pos: [fm[0] + 0.05, fm[1], fm[2] + s * 0.046] })),
    ], 'castAlu'),
    merged([[0.026, 0.03], [-0.026, 0.03], [0.026, -0.03], [-0.026, -0.03]].map(([y, z]) => at(bolt(S, 0.3125, 1.0, { mat: 'blackOxide', socket: true }), [fm[0] + 0.099, fm[1] + y, fm[2] + z], [0, 0, -Math.PI / 2])), 'blackOxide'),
  ), [0.25, 0, 0]);
  F('67', fitStraight(S, 12), [fm[0] + 0.05, fm[1], fm[2] + 0.05], [0, 0, 1], null, [0.25, 0, 0.1]);
  F('56', fitElbow(S, 12), [fm[0] + 0.05, fm[1], fm[2] - 0.05], [0, 0, -1], [1, 0, 0], [0.25, 0, -0.1]);
  F('54', fitElbow(S, 6), [fm[0] + 0.06, fm[1] + 0.0375, fm[2]], [0, 1, 0], [1, 0, 0], [0.25, 0.1, 0]);
  // 86 — vis CHC 3/8 × 1 1/4 de la bride du moteur (90 Grower, 87 plates).
  {
    const d = 0.375, tF = washerT(d), tS = washerT(d, 'split');
    for (const y of [0.032, -0.032]) {
      const p = [fm[0] + 0.012, fm[1] + y, fm[2] + (y > 0 ? 0.032 : -0.032)];
      P('87', pose(THREE, washer(S, d), p, [1, 0, 0]), [0.15, 0, 0]);
      P('90', pose(THREE, washer(S, d, 'split'), [p[0] + tF, p[1], p[2]], [1, 0, 0]), [0.17, 0, 0]);
      P('86', pose(THREE, bolt(S, d, 1.25, { mat: 'blackOxide', socket: true }), [p[0] + tF + tS, p[1], p[2]], [1, 0, 0]), [0.2, 0, 0]);
    }
  }

  // ================================================================ 30 — console des filtres HP, 40 — platine, 21 — bloc surpresseur
  // Console 30 : plaque d'appui sur la face SAE (au-dessus de la portée de
  // pompe), tablette sous la platine 40, goussets, bras vertical des filtres HP.
  const zS = ENG.zSae, yP = PLATE.y - PLATE.t / 2;
  P('30', group(merged([
    box(0.26, 0.12, 0.01, 'black', { pos: [ENG.x, 1.5, zS - 0.005] }),
    box(0.44, 0.012, 0.22, 'black', { pos: [(PLATE.x0 + PLATE.x1) / 2, yP - 0.006, zS - 0.11 - 0.01] }),
    ...[-0.1, 0.1].map((dx) => box(0.008, 0.06, 0.2, 'black', { pos: [ENG.x + dx, yP - 0.042, zS - 0.11] })),
    box(0.012, 0.28, 0.27, 'black', { pos: [HPF.x + 0.006, 1.62, -0.57] }),
    box(0.06, 0.012, 0.27, 'black', { pos: [HPF.x + 0.03, yP - 0.006, -0.57] }),
  ], 'black')), [0, 0.15, -0.1]);
  // Platine 40 : semelle sur la tablette, âme verticale du bloc surpresseur, gousset.
  const Bz0 = BOOST.z + BOOST.d / 2; // face arrière du bloc (contre l'âme)
  P('40', group(merged([
    box(PLATE.x1 - PLATE.x0, PLATE.t, PLATE.z0 - PLATE.z1, 'black', { pos: [(PLATE.x0 + PLATE.x1) / 2, PLATE.y, (PLATE.z0 + PLATE.z1) / 2] }),
    box(0.14, 0.17, 0.012, 'black', { pos: [BOOST.x, PLATE_TOP + 0.085, Bz0 + 0.006] }),
    box(0.008, 0.08, 0.08, 'black', { pos: [BOOST.x + 0.066, PLATE_TOP + 0.04, Bz0 + 0.046] }),
  ], 'black')), [0, 0.3, 0]);
  // 21 — bloc surpresseur : bloc usiné, lamages, plaque de repérage.
  P('21', group(
    box(BOOST.w, BOOST.h, BOOST.d, 'castIron', { r: 0.003, pos: [BOOST.x, PLATE_TOP + BOOST.h / 2, BOOST.z] }),
    at(S.nameplate(0.04, 0.02), [BOOST.x + 0.02, PLATE_TOP + 0.03, BOOST.z - BOOST.d / 2 - 0.0005], [0, Math.PI, 0]),
  ), [0, 0.35, -0.1]);
  // 22 — limiteurs de pression 6000 psi sur la face −X.
  const reliefV = () => ({
    obj: group(merged([
      S.lathe([[0, -0.014], [0.011, -0.014], [0.012, 0], [0, 0]], 'zinc', { seg: 8 }),
      at(S.nut(0.028, 0.012, 'zinc'), [0, 0.006, 0]),
      cyl(0.011, 0.03, 'zinc', { seg: 14, pos: [0, 0.027, 0] }),
      at(S.nut(0.019, 0.007, 'zinc'), [0, 0.046, 0]),
      cyl(0.005, 0.016, 'zinc', { seg: 8, pos: [0, 0.056, 0] }),
    ], 'zinc'), S.lathe([[0, 0.058], [0.009, 0.058], [0.009, 0.07], [0.006, 0.074], [0, 0.074]], 'plastic', { seg: 12 })),
    tip: [0, 0.074, 0], dir: [0, 1, 0],
  });
  for (const y of [0.04, 0.1]) F('22', reliefV(), [BOOST.x - BOOST.w / 2, PLATE_TOP + y, BOOST.z], [-1, 0, 0], null, [-0.12, 0.3, 0]);
  // 12 — prises de mesure -04 sur le dessus.
  for (const x of [-0.03, 0.03]) F('12', fitTestPort(S, 4), [BOOST.x + x, PLATE_TOP + BOOST.h, BOOST.z - 0.02], [0, 1, 0], null, [0, 0.45, 0]);
  // 82 — vis traversantes 1/2 × 3 1/4 du bloc sur l'âme (92 Grower, 97 écrous derrière l'âme).
  {
    const d = 0.5, tS = washerT(d, 'split');
    for (const x of [-0.04, 0.04]) {
      const yb = PLATE_TOP + 0.02;
      P('82', pose(THREE, bolt(S, d, 3.25), [BOOST.x + x, yb, BOOST.z - BOOST.d / 2], [0, 0, -1]), [0, 0, -0.2]);
      P('92', pose(THREE, washer(S, d, 'split'), [BOOST.x + x, yb, Bz0 + 0.012], [0, 0, 1]), [0, 0, 0.1]);
      P('97', pose(THREE, nut(S, d), [BOOST.x + x, yb, Bz0 + 0.012 + tS], [0, 0, 1]), [0, 0, 0.12]);
    }
  }
  // 78 — vis 7/16 × 3/4 (94 Nord-Lock) : console 30 sur le carter de volant (six), platine 40 sur la console (quatre).
  {
    const d = 0.4375, tN = washerT(d, 'nl');
    for (const x of [-0.11, 0, 0.11]) for (const y of [1.465, 1.535]) {
      P('94', pose(THREE, washer(S, d, 'nl'), [ENG.x + x, y, zS - 0.01], [0, 0, -1]), [0, 0, -0.08]);
      P('78', pose(THREE, bolt(S, d, 0.75), [ENG.x + x, y, zS - 0.01 - tN], [0, 0, -1]), [0, 0, -0.12]);
    }
    for (const x of [PLATE.x0 + 0.04, PLATE.x1 - 0.04]) for (const z of [PLATE.z0 - 0.025, PLATE.z0 - 0.075]) {
      P('94', pose(THREE, washer(S, d, 'nl'), [x, PLATE_TOP, z]), [0, 0.1, 0]);
      P('78', pose(THREE, bolt(S, d, 0.75), [x, PLATE_TOP + tN, z]), [0, 0.14, 0]);
    }
  }
  // 76 — vis 3/8 × 1 des filtres HP au travers du bras (90 Grower).
  {
    const d = 0.375, tS = washerT(d, 'split');
    for (const z of HPF.z) for (const dz of [-0.03, 0.03]) {
      P('90', pose(THREE, washer(S, d, 'split'), [HPF.x + 0.012, HPF.y, z + dz], [1, 0, 0]), [0.08, 0, 0]);
      P('76', pose(THREE, bolt(S, d, 1.0), [HPF.x + 0.012 + tS, HPF.y, z + dz], [1, 0, 0]), [0.12, 0, 0]);
    }
  }
  // 59 — coudes -20 / -12 sur les orifices extérieurs des filtres HP.
  F('59', fitElbow(S, 20, 12), [HPF.x - 0.063, HPF.y + 0.0075, HPF.z[0] + 0.055], [0, 0, 1], [0, 1, 0], [-0.3, 0.15, 0]);
  F('59', fitElbow(S, 20, 12), [HPF.x - 0.063, HPF.y + 0.0075, HPF.z[1] - 0.055], [0, 0, -1], [0, 1, 0], [-0.3, 0.15, -0.2]);

  // ---------------------------------------------------------------- 77 — vis 3/8 × 1 1/4 des pattes du distributeur (90 Grower, 87 plates)
  {
    const d = 0.375, tF = washerT(d), tS = washerT(d, 'split'), yl = PLATE_TOP + 0.018;
    for (const dz of [-0.064, 0.064]) for (const dx of [-0.02, 0.02]) {
      const p = [TVALVE.x + dx, yl, TVALVE.z + dz];
      P('87', pose(THREE, washer(S, d), p), [0, 0.12, 0]);
      P('90', pose(THREE, washer(S, d, 'split'), [p[0], p[1] + tF, p[2]]), [0, 0.13, 0]);
      P('77', pose(THREE, bolt(S, d, 1.25), [p[0], p[1] + tF + tS, p[2]]), [0, 0.16, 0]);
    }
  }
  // Raccords du distributeur : T (67 et té 46), sections A / B (65), manomètre et LS (61).
  {
    const tvx = TVALVE.x + 0.05;
    const t0 = F('67', fitStraight(S, 12), [tvx, PLATE_TOP + 0.297, TVALVE.z - 0.03], [1, 0, 0], null, [0.12, 0, 0]);
    F('46', fitTee(S, 12, { swivel: true }), t0.tip, t0.dir, null, [0.16, 0, 0]);
    for (const i of [0, 1, 3, 4]) for (const dz of [-0.024, 0.024]) F('65', fitStraight(S, 10, 6), [tvx, PLATE_TOP + 0.03 + 0.048 * (i + 0.5), TVALVE.z + dz], [1, 0, 0], null, [0.12, 0, 0]);
    F('61', fitStraight(S, 5, 6), [TVALVE.x - 0.03, PLATE_TOP + 0.332, TVALVE.z + 0.015], [0, 1, 0], null, [0, 0.12, 0]);
    F('61', fitStraight(S, 5, 6), [TVALVE.x - 0.02, PLATE_TOP + 0.311, TVALVE.z - 0.058], [0, 0, -1], null, [0, 0, -0.12]);
  }
  // Raccords reliés par les flexibles du surpresseur (P276) : bloc, multiplicateur, distributeur, pompe, collecteur.
  for (const f of boosterFittings(S, THREE)) P(f.ref, f.obj, f.dir.map((v) => v * 0.08));

  // ================================================================ 16 — multiplicateur de pression, 10 — brides, 39 — équerre, 19 — colliers
  const I = INTENS, ix = (I.x0 + I.x1) / 2;
  P('16', group(
    merged([
      cyl(I.r, 0.22, 'black', { axis: 'x', seg: 28, pos: [I.x0 + 0.13, I.y, I.z] }),
      cyl(I.r - 0.006, 0.14, 'black', { axis: 'x', seg: 28, pos: [I.x1 - 0.09, I.y, I.z] }),
    ], 'black'),
    merged([
      box(0.04, 0.1, 0.1, 'steel', { r: 0.006, pos: [I.x0 + 0.02, I.y, I.z] }),
      box(0.036, 0.1, 0.1, 'steel', { r: 0.006, pos: [I.x1 - 0.018, I.y, I.z] }),
      box(0.03, 0.105, 0.105, 'steel', { r: 0.008, pos: [I.x1 - 0.165, I.y, I.z] }),
      ...[[0.035, 0.035], [-0.035, 0.035], [0.035, -0.035], [-0.035, -0.035]].map(([y, z]) => cyl(0.004, I.x1 - I.x0, 'steel', { axis: 'x', seg: 8, pos: [ix, I.y + y, I.z + z] })),
    ], 'steel'),
  ), [0, -0.15, -0.2]);
  // 39 — équerre sous le bord de la platine : bande horizontale, jambe extérieure des colliers.
  const yS = PLATE.y - PLATE.t / 2;
  P('39', group(merged([
    box(0.36, 0.006, 0.15, 'black', { pos: [ix, yS - 0.003, -0.855] }),
    box(0.05, 0.2, 0.006, 'black', { pos: [-1.62, yS - 0.1, -0.905] }),
    box(0.05, 0.006, 0.03, 'black', { pos: [-1.62, yS - 0.2, -0.92] }),
  ], 'black')), [0, -0.1, -0.25]);
  for (const x of [I.x0 + 0.08, I.x1 - 0.08]) {
    const ub = group(uBolt(S, THREE, 2 * I.r, 0.008, { leg: 0.008 + I.r, base: 0.0, band: true }));
    ub.rotation.set(Math.PI, Math.PI / 2, 0); // arc dessous, branches vers le haut au travers de l'équerre
    ub.position.set(x, I.y, I.z);
    P('10', group(ub), [0, -0.12, -0.2]);
  }
  for (const y of [1.31, 1.345]) {
    const c = group(pClamp(S, 0.027));
    c.rotation.set(0, Math.PI / 2, Math.PI / 2); // flexible selon X, patte vers +Z
    c.position.set(-1.62, y, -0.928);
    P('19', group(c), [0, -0.05, -0.15]);
  }
  // 79 — vis 7/16 × 1 de l'équerre sous la platine (94 Nord-Lock).
  {
    const d = 0.4375, tN = washerT(d, 'nl');
    for (const x of [ix - 0.12, ix + 0.12]) {
      P('94', pose(THREE, washer(S, d, 'nl'), [x, PLATE_TOP, -0.79]), [0, 0.08, 0]);
      P('79', pose(THREE, bolt(S, d, 1.0), [x, PLATE_TOP + tN, -0.79]), [0, 0.12, 0]);
    }
  }

  // ================================================================ 74 — brides 1 po code 62 sous le collecteur P260
  for (const [x, z] of [[-0.04, 0.13], [0.027, 0.13], [-0.04, 0.05], [0.027, 0.05]]) {
    P('74', pose(THREE, splitFlangeKit(S, 16, 62).obj, [TMAN.x - x, TMAN.y - 0.085, TMAN.z - z], [0, -1, 0], Math.PI / 2), [0, -0.15, -0.3]);
  }
  // 54 — coudes -06 en façade du collecteur.
  for (const [x, y] of [[-0.03, -0.068], [0.07, -0.068], [0.055, 0.025]]) F('54', fitElbow(S, 6), [TMAN.x - x, TMAN.y + y, TMAN.z - 0.18], [0, 0, -1], [1, 0, 0], [0, 0, -0.4]);
  // 79 — vis 7/16 × 1 du collecteur sur la tôle du support (91 Grower), au travers de la tôle.
  {
    const d = 0.4375, tS = washerT(d, 'split');
    for (const [x, y] of [[-0.11, 0.05], [0.11, 0.05], [-0.11, -0.05], [0.11, -0.05]]) {
      const p = [TMAN.x - x, TMAN.y + y, TMAN.z + 0.01];
      P('91', pose(THREE, washer(S, d, 'split'), p, [0, 0, 1]), [0, 0, 0.08]);
      P('79', pose(THREE, bolt(S, d, 1.0), [p[0], p[1], p[2] + tS], [0, 0, 1]), [0, 0, 0.12]);
    }
  }

  // ================================================================ filtre de retour (7, 8, 9) et console 31
  const R = RFILT;
  // 31 — console : platine contre l'âme du montant +Z du radiateur, bras, tablette, goussets.
  const xW = RAD.x - RAD.core / 2;
  P('31', group(merged([
    box(0.1, 0.12, 0.008, 'black', { pos: [xW, R.y + 0.0, RAD.w / 2 + 0.004] }),
    box(R.x - xW + 0.1, 0.008, 0.008 + 0.06, 'black', { pos: [(xW + R.x) / 2 + 0.03, R.y + 0.064, RAD.w / 2 + 0.034] }),
    box(0.16, 0.01, 0.16, 'black', { pos: [R.x, R.y + 0.065, R.z] }),
    box(R.x - xW, 0.06, 0.006, 'black', { pos: [(xW + R.x) / 2, R.y + 0.03, RAD.w / 2 + 0.06] }),
  ], 'black')), [0.1, 0.15, 0.1]);
  // 79 — vis 7/16 × 1 de la console sur le montant (91 Grower).
  {
    const d = 0.4375, tS = washerT(d, 'split');
    for (const y of [-0.04, 0.0, 0.04]) {
      const p = [xW, R.y + y, RAD.w / 2 + 0.008];
      P('91', pose(THREE, washer(S, d, 'split'), p, [0, 0, 1]), [0, 0, 0.08]);
      P('79', pose(THREE, bolt(S, d, 1.0), [p[0], p[1], p[2] + tS], [0, 0, 1]), [0, 0, 0.12]);
    }
  }
  // 7 — tête de filtre double (fonte d'alu) sous la tablette, deux bossages d'éléments.
  P('7', group(merged([
    box(0.12, 0.055, 0.15, 'castAlu', { r: 0.008, pos: [R.x, R.y + 0.0325, R.z] }),
    ...[-0.04, 0.04].map((dz) => S.lathe([[0, 0], [0.042, 0], [0.042, 0.006], [0, 0.006]], 'castAlu', { seg: 24, pos: [R.x, R.y - 0.001, R.z + dz] })),
  ], 'castAlu')), [0, 0.12, 0]);
  // 8 — éléments filtrants vissés (cartouches).
  for (const dz of [-0.04, 0.04]) {
    P('8', group(lathe([[0, -0.235], [0.03, -0.235], [0.04, -0.228], [0.042, -0.21], [0.042, -0.015], [0.038, -0.004], [0.028, 0], [0, 0]], 'blue', { seg: 28, pos: [R.x, R.y - 0.002, R.z + dz] }),
      lathe([[0, -0.242], [0.012, -0.242], [0.012, -0.235], [0, -0.235]], 'blue', { seg: 6, pos: [R.x, R.y - 0.002, R.z + dz] })), [0, -0.2, 0]);
  }
  // 83 — vis 1/2 × 3 1/2 de la tête au travers de la tablette (88 plates dessus et dessous, 92 Grower, 97 écrous).
  {
    const d = 0.5, tF = washerT(d), tS = washerT(d, 'split'), yT = R.y + 0.07;
    for (const dx of [-0.05, 0.05]) for (const dz of [-0.068, 0.068]) {
      const p = [R.x + dx, yT, R.z + dz];
      P('88', pose(THREE, washer(S, d), p), [0, 0.1, 0]);
      P('83', pose(THREE, bolt(S, d, 3.5), [p[0], p[1] + tF, p[2]]), [0, 0.15, 0]);
      P('88', pose(THREE, washer(S, d), [p[0], R.y + 0.005, p[2]], [0, -1, 0]), [0, -0.06, 0]);
      P('92', pose(THREE, washer(S, d, 'split'), [p[0], R.y + 0.005 - tF, p[2]], [0, -1, 0]), [0, -0.07, 0]);
      P('97', pose(THREE, nut(S, d), [p[0], R.y + 0.005 - tF - tS, p[2]], [0, -1, 0]), [0, -0.09, 0]);
    }
  }
  // 9 — indicateur de colmatage sur la face +X de la tête, 70 — coude de tuyauterie 1/8 NPT.
  {
    const c = F('70', fitElbow(S, 2, 2, { mat: 'brass' }), [R.x + 0.06, R.y + 0.032, R.z - 0.045], [1, 0, 0], [0, 1, 0], [0.1, 0, 0]);
    P('9', group(
      S.lathe([[0, 0], [0.012, 0], [0.012, 0.012], [0, 0.012]], 'zinc', { seg: 14, pos: c.tip }),
      S.lathe([[0, 0.012], [0.016, 0.012], [0.016, 0.034], [0.012, 0.038], [0, 0.038]], 'glass', { seg: 16, pos: c.tip }),
      S.cyl(0.009, 0.01, 'green', { seg: 12, pos: [c.tip[0], c.tip[1] + 0.024, c.tip[2]] }),
    ), [0.1, 0.1, 0]);
  }
  // Retour : entrée 1 1/2 NPT / -16 coudée (48) sur l'extrémité +Z, sortie droite (50) et coude 45° tournant (99) sur l'extrémité −Z.
  F('48', fitElbow(S, 24, 16), [R.x, R.y + 0.0325, R.z + 0.075], [0, 0, 1], [0, 1, 0], [0, 0, 0.12]);
  {
    const a = F('50', fitStraight(S, 24, 16), [R.x, R.y + 0.0325, R.z - 0.075], [0, 0, -1], null, [0, 0, -0.1]);
    F('99', fitElbow(S, 16, 16, { swivel: true, angle: 45 }), a.tip, a.dir, [0, 1, 0], [0, 0.05, -0.15]);
  }
  // Dérivation sous la tête (face −X) : coude 59, clapet 5000 psi 24, té 46, adaptateurs 51,
  // clapet 25, restricteur 26, adaptateurs 49 et 47.
  {
    const c1 = F('59', fitElbow(S, 20, 12), [R.x - 0.06, R.y + 0.03, R.z + 0.03], [-1, 0, 0], [0, -1, 0], [-0.12, 0, 0]);
    const rt12 = u((1 + 1 / 16) / 2);
    const cv = placeFit(THREE, { obj: inlineValve(S, 0.07, u(1.25), rt12), tip: [0, 0.07, 0], dir: [0, 1, 0] }, c1.tip, c1.dir);
    P('24', cv.obj, [-0.12, -0.08, 0]);
    const t = F('46', fitTee(S, 12, { swivel: true }), cv.tip, cv.dir, null, [-0.12, -0.12, 0]);
    const a1 = F('51', fitStraight(S, 12), t.tip, t.dir, null, [-0.12, -0.16, 0]);
    const r26 = placeFit(THREE, { obj: inlineValve(S, 0.05, u(1.0), rt12, { arrow: false }), tip: [0, 0.05, 0], dir: [0, 1, 0] }, a1.tip, a1.dir);
    P('26', r26.obj, [-0.12, -0.2, 0]);
    F('49', fitStraight(S, 12), r26.tip, r26.dir, null, [-0.12, -0.24, 0]);
    const teeFit = fitTee(S, 12, { swivel: true });
    const tw = placeFit(THREE, teeFit, cv.tip, cv.dir);
    tw.obj.updateMatrixWorld(true);
    const br = new THREE.Vector3(...teeFit.branch).applyMatrix4(tw.obj.children[0].matrixWorld).toArray();
    const bd = new THREE.Vector3(0, 0, 1).transformDirection(tw.obj.children[0].matrixWorld).toArray();
    const a2 = F('51', fitStraight(S, 12), br, bd, null, [-0.15, -0.12, 0.05]);
    const c25 = placeFit(THREE, { obj: inlineValve(S, 0.06, u(1.25), rt12), tip: [0, 0.06, 0], dir: [0, 1, 0] }, a2.tip, a2.dir);
    P('25', c25.obj, [-0.15, -0.12, 0.1]);
    F('47', fitElbow(S, 12), c25.tip, c25.dir, [0, -1, 0], [-0.15, -0.12, 0.14]);
    F('59', fitElbow(S, 20, 12), [R.x - 0.06, R.y + 0.03, R.z - 0.03], [-1, 0, 0], [0, 1, 0], [-0.12, 0.05, 0]);
  }

  // ================================================================ raccords du moteur, accessoires divers
  // 18 — adaptateur M26 × 1,5 / JIC -12 sur le module de filtre à huile ; 75 — coude à olive de vidange d'eau.
  F('18', fitStraight(S, 12), e2m([0.42, 0.05, -0.205]), [1, 0, 0], null, [0.12, 0, 0]);
  F('75', fitElbow(S, 4, 6, { mat: 'brass' }), e2m([0.35, -0.06, 0.178]), [-1, 0, 0], [0, -1, 0], [-0.12, 0, 0]);
  // 27 — robinet à boisseau 3/4 po laiton (vidange d'huile déportée), sur la face +X de la traverse avant.
  P('27', at(group(S.ballValve(0.028, 'brass', { axis: 'z' })), [MOUNTX[1] + 0.07, 1.03, 0.36]), [0.15, 0, 0]);
  // 37 — té de distribution de l'extinction : bloc laiton, quatre raccords de flexibles, patte.
  {
    const p = [MOUNTX[0], 1.06, 0.42];
    P('37', group(
      merged([box(0.06, 0.006, 0.05, 'black', { pos: [p[0], p[1] + 0.003, p[2]] }), box(0.006, 0.06, 0.05, 'black', { pos: [p[0] + 0.027, p[1] + 0.03, p[2]] })], 'black'),
      merged([
        box(0.04, 0.03, 0.03, 'brass', { r: 0.003, pos: [p[0] - 0.005, p[1] + 0.04, p[2]] }),
        ...[[0, 1, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]].map((n) => pose(THREE, fitStraight(S, 4, 4, { mat: 'brass' }).obj, [p[0] - 0.005 + n[0] * 0.02, p[1] + 0.04 + n[1] * 0.015, p[2] + n[2] * 0.015], n)),
      ], 'brass'),
    ), [0, 0.1, 0.15]);
  }
  // 38 — support de remplissage de gazole : équerre percée Ø 2 1/2 po sur la traverse avant (côté gauche).
  {
    const p = [MOUNTX[1] + 0.02, 1.06, -0.44];
    const web = extrude([[-0.06, 0], [0.06, 0], [0.06, 0.16], [0.03, 0.2], [-0.03, 0.2], [-0.06, 0.16]], 0.006, 'black', { holes: [[0, 0.14, 0.033]] });
    web.rotation.y = Math.PI / 2;
    web.position.set(p[0] + 0.03, p[1], p[2]);
    P('38', group(merged([web, box(0.07, 0.006, 0.12, 'black', { pos: [p[0], p[1] + 0.003, p[2]] })], 'black'), S.torus(0.033, 0.003, 'rubber', { axis: 'x', pos: [p[0] + 0.03, p[1] + 0.14, p[2]] })), [0.1, 0.1, -0.1]);
  }
  // 78 — vis 7/16 × 3/4 (94 Nord-Lock) des pattes 37 et 38 sur les traverses.
  {
    const d = 0.4375, tN = washerT(d, 'nl');
    for (const [x, z] of [[MOUNTX[0] - 0.02, 0.405], [MOUNTX[0] - 0.02, 0.435], [MOUNTX[1] + 0.005, -0.48], [MOUNTX[1] + 0.005, -0.4]]) {
      P('94', pose(THREE, washer(S, d, 'nl'), [x, 1.066, z]), [0, 0.08, 0]);
      P('78', pose(THREE, bolt(S, d, 0.75), [x, 1.066 + tN, z]), [0, 0.12, 0]);
    }
  }
  // 13 — bande isolante (trousse) enroulée sur le coude de raccordement au turbo, liens inox.
  {
    const t0 = e2m([ENG.turbOut.x, ENG.turbOut.y, ENG.turbOut.z]);
    const pts = [[t0[0], t0[1] - 0.03, t0[2]], [t0[0], t0[1] - 0.08, t0[2]], [t0[0] - 0.06, t0[1] - 0.2, t0[2] - 0.03], [-2.085, 1.215, -0.035]];
    const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    const ties = [0.15, 0.5, 0.85].map((t) => {
      const w = S.torus(1.5 * IN + 0.0075, 0.0015, 'steel');
      w.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), c.getTangentAt(t));
      w.position.copy(c.getPointAt(t));
      return w;
    });
    P('13', group(tube(pts, 1.5 * IN + 0.006, 'cream', { seg: 24, radial: 18 }), merged(ties, 'steel')), [0.1, 0.1, 0.1]);
  }
  void cyl; void offset; void neg; void fitTestPort; void ENG; void AIR;
  return { view: { dir: [1, 0.6, 1.1] } };
}

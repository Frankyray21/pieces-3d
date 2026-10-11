// P260 — Moteur diesel CP004250 rév. 2 (page 260) : « DIESEL ENGINE », Deutz
// D914L04, quatre cylindres en ligne refroidi par air. Carter-cylindres et
// carter d'huile, cylindres à ailettes et culasses individuelles en alliage
// léger sous leurs couvre-culbuteurs « DEUTZ », carter de volant SAE 3 et
// volant à l'arrière, carter de soufflante de refroidissement à l'avant (axe
// au-dessus du vilebrequin, entraîné par courroie), capot d'air le long des
// cylindres côté injection (plaque d'extrémité marquée d'un « Y » en relief
// côté volant), pompes d'injection unitaires, pattes moulées.
// Lignes 1 et 2 (bloc et accessoires, NSS) : le bloc nu, puis les
// accessoires montés dessus (tubulure d'admission, pompes et tuyaux
// d'injection, jauge et bouchon de remplissage d'huile, poulies).
// 10*, 11*, 12* : pièces d'usure listées à part (courroies de soufflante et
// d'alternateur, électro-aimant d'arrêt), dessinées à leur place.
// Repère : repère moteur ENG de _moteur_surpresseur.js — origine sur l'axe du
// vilebrequin, dans le plan de la face SAE du carter de volant ; +X vers
// l'avant (soufflante), Y vers le haut, +Z à droite en regardant vers l'avant
// (côté injection, filtres et capot d'air), −Z côté échappement et démarreur.
// Dessous des pattes à y = ENG.footY. Encombrement ≈ 0.84 (X, de −0.01 à
// 0.83) × 0.80 (Y, de −0.30 à 0.50 ; boîtier de commande jusqu'à 0.69) ×
// 0.60 (Z) m.
// Cotes : alésage 102 mm (Deutz), entraxe des cylindres estimé 125 mm, carter
// de volant SAE 3 (alésage 16,125 po, 12 vis sur Ø 16,875 po), volant SAE
// 11,5 po ; le reste d'après les proportions de la vue de la page 260.
// Boîtier de commande (6) : livré avec le moteur (« INCLUDED W/ CP004250 »,
// page 256) ; posé ici sur une console au-dessus de la soufflante, face vers
// +Z — son emplacement sur la machine est donné par P256 / P242.
import { ENG, IN, MM } from './_moteur_surpresseur.js';

export default function P260(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, shell, extrude, plate, gear, bolt, boltSet, boltCircle, tube, hose, gauge, nameplate, weld, merged, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const [BX0, BX1] = ENG.blockX;
  const [FY, FZ] = ENG.blowerC;

  // Extrusion selon X d'un contour [[z, y], ...] de x0 à x1 (trous [z, y, r]).
  const slabX = (pts, x0, x1, mat, holes = []) => {
    const m = extrude(pts.map(([z, y]) => [-z, y]), x1 - x0, mat, { holes: holes.map(([z, y, r]) => [-z, y, r]) });
    m.rotation.y = Math.PI / 2;
    m.position.x = (x0 + x1) / 2;
    return m;
  };
  // Boîte d'après ses bornes.
  const bx = (x0, x1, y0, y1, z0, z1, mat, r = 0) => box(x1 - x0, y1 - y0, z1 - z0, mat, { r, pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  const arc = (cz, cy, r, a0, a1, n = 16) => Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cz + r * Math.cos(a), cy + r * Math.sin(a)];
  });

  // ---------------------------------------------------------------- 1 — bloc moteur
  const grey = [], iron = [], alu = [], blk = [], stl = [];

  // Carter de volant SAE 3 : bride ronde en bas, épaulée en haut vers le bloc,
  // douze trous de fixation, cloche jusqu'au carter-cylindres.
  const sae = ENG.sae;
  const bell = [
    ...arc(0, 0, sae.outR, -Math.PI * 0.08, -Math.PI * 0.92, 28).map(([z, y]) => [z, y]),
  ];
  bell.reverse();
  const flangeOutline = [...bell, [-sae.outR * 0.93, 0.19], [-0.2, 0.25], [0.2, 0.25], [sae.outR * 0.93, 0.19]];
  const boltHoles = Array.from({ length: sae.n }, (_, i) => {
    const a = ((i + 0.5) / sae.n) * Math.PI * 2;
    return [sae.boltR * Math.cos(a), sae.boltR * Math.sin(a), 0.0055];
  });
  // Bride percée de l'alésage (contour polygonal fermé à part : extrude n'accepte que des trous ronds).
  grey.push(slabX(flangeOutline, 0, 0.016, 'grey', [[0, 0, sae.boreR], ...boltHoles]));
  grey.push(at(shell(sae.outR - 0.012, sae.outR - 0.02, ENG.bellX - 0.016, 'grey', { axis: 'x', r2Out: 0.2, r2In: 0.19, seg: 48 }), [(ENG.bellX + 0.016) / 2, 0, 0]));
  grey.push(slabX([[-0.2, 0.25], [-0.2, 0.05], [0.2, 0.05], [0.2, 0.25]], 0.016, ENG.bellX, 'grey'));
  // Nervures du carter de volant.
  for (const s of [-1, 1]) grey.push(bx(0.016, ENG.bellX, -0.2, 0.05, s * 0.2 - 0.008, s * 0.2 + 0.008, 'grey'));
  // Volant : disque, couronne dentée, moyeu et vis centrales.
  const VX = ENG.flywheelX;
  iron.push(lathe([[0, VX], [0.18, VX], [0.18, VX + 0.035], [0.17, VX + 0.04], [0.045, VX + 0.04], [0.045, VX + 0.05], [0, VX + 0.05]], 'castIron', { axis: 'x', seg: 56 }));
  stl.push(at(gear(0.183, 0.193, 96, 0.022, 'steel', { axis: 'x' }), [VX + 0.022, 0, 0]));
  stl.push(boltCircle(8, 0.03, 0.012, 0.03, 'steel', { axis: '-x', washer: false, pos: [VX, 0, 0] }));

  // Carter-cylindres et carter d'huile.
  grey.push(bx(BX0, BX1, -0.13, ENG.deckY, -0.17, 0.17, 'grey', 0.015));
  grey.push(bx(BX0 + 0.02, BX1 - 0.02, -0.142, -0.13, -0.162, 0.162, 'grey', 0.003)); // bride de carter
  grey.push(bx(BX0 + 0.03, BX1 - 0.03, ENG.panY, -0.142, -0.15, 0.15, 'grey', 0.02));
  for (let i = 0; i < 5; i++) {
    const x = BX0 + 0.035 + i * 0.11;
    for (const s of [-1, 1]) grey.push(bx(x - 0.007, x + 0.007, -0.125, ENG.deckY - 0.02, s * 0.17 - 0.012, s * 0.17 + 0.012, 'grey', 0.004));
  }
  stl.push(at(bolt(0.02, 0.012, 'steel', { axis: '-y' }), [0.35, ENG.panY, 0.08])); // bouchon de vidange
  // Cylindres à ailettes (fonte), culasses à ailettes (alliage léger),
  // couvre-culbuteurs noirs, tubes de culbuteurs.
  const finProf = [[0.056, ENG.deckY]];
  const nf = 15, fh = (ENG.headY - ENG.deckY) / nf;
  for (let k = 0; k < nf; k++) {
    const y = ENG.deckY + k * fh;
    finProf.push([0.06, y + fh * 0.05], [0.083, y + fh * 0.18], [0.083, y + fh * 0.48], [0.06, y + fh * 0.62]);
  }
  finProf.push([0.06, ENG.headY], [0.051, ENG.headY]);
  const covers = [];
  for (const x of ENG.cylX) {
    iron.push(lathe(finProf, 'castIron', { seg: 40, pos: [x, 0, 0] }));
    // Culasse : corps, ailettes horizontales, sièges des tubulures.
    alu.push(bx(x - 0.058, x + 0.058, ENG.headY, ENG.coverY, -0.095, 0.095, 'castAlu', 0.006));
    for (let k = 0; k < 5; k++) {
      const y = ENG.headY + 0.012 + k * 0.018;
      alu.push(bx(x - 0.061, x + 0.061, y, y + 0.006, -0.11, 0.11, 'castAlu', 0.002));
    }
    alu.push(bx(x - 0.03, x + 0.03, ENG.headY + 0.04, ENG.headY + 0.085, -0.12, -0.095, 'castAlu', 0.004)); // siège échappement
    alu.push(bx(x - 0.03, x + 0.03, ENG.headY + 0.05, ENG.headY + 0.09, 0.095, 0.12, 'castAlu', 0.004)); // siège admission
    // Couvre-culbuteurs : coque arrondie, vis centrale, bossage de l'injecteur.
    covers.push(at(lathe([[0, 0], [0.05, 0], [0.052, 0.004], [0.05, 0.03], [0.04, 0.045], [0, 0.05]], 'black', { seg: 28 }), [x, ENG.coverY, -0.02], null, [1.05, 1, 1.45]));
    covers.push(at(cyl(0.022, 0.045, 'black', { seg: 20 }), [x + 0.025, ENG.coverY + 0.01, 0.07]));
    stl.push(at(bolt(0.008, 0.01, 'steel'), [x, ENG.coverY + 0.05, -0.02]));
    for (const dx of [-0.018, 0.018]) stl.push(at(cyl(0.008, ENG.headY - ENG.deckY + 0.02, 'steel', { seg: 12 }), [x + dx, (ENG.headY + ENG.deckY) / 2, -0.075]));
    // Goujons de culasse (quatre par cylindre, écrous visibles sous les ailettes).
    for (const [dx, dz] of [[-0.05, -0.05], [0.05, -0.05], [-0.05, 0.05], [0.05, 0.05]]) stl.push(at(cyl(0.006, 0.03, 'steel', { seg: 8 }), [x + dx, ENG.headY + 0.01, dz]));
  }
  // Capot d'air (côté +Z) : caisson arrondi le long des cylindres, plaque
  // d'extrémité côté volant marquée d'un « Y » en relief.
  const duct = bx(BX0, BX1, 0.04, 0.33, 0.17, 0.29, 'lightGrey', 0.035);
  const yPlate = [];
  yPlate.push(bx(BX0 - 0.006, BX0, 0.02, 0.35, 0.165, 0.3, 'lightGrey', 0.004));
  const yStroke = (a, b) => {
    const m = box(0.006, Math.hypot(b[0] - a[0], b[1] - a[1]), 0.018, 'lightGrey', { r: 0.002 });
    m.position.set(BX0 - 0.009, (a[1] + b[1]) / 2, (a[0] + b[0]) / 2);
    m.rotation.x = Math.atan2(b[0] - a[0], b[1] - a[1]);
    return m;
  };
  yPlate.push(yStroke([0.232, 0.12], [0.232, 0.2]), yStroke([0.232, 0.2], [0.2, 0.28]), yStroke([0.232, 0.2], [0.264, 0.28]));
  // Carter de soufflante : volute d'axe X, couvercle avant à ouïes
  // concentriques, moyeu ; carter de distribution dessous.
  const blower = [];
  blower.push(at(shell(ENG.blowerR, ENG.blowerR - 0.008, ENG.blowerX[1] - ENG.blowerX[0], 'grey', { axis: 'x', seg: 56 }), [(ENG.blowerX[0] + ENG.blowerX[1]) / 2, FY, FZ]));
  blower.push(at(lathe([[0.03, 0], [ENG.blowerR + 0.012, 0], [ENG.blowerR + 0.012, 0.012], [0.03, 0.012]], 'grey', { axis: 'x', seg: 56 }), [ENG.blowerX[1] - 0.012, FY, FZ]));
  blower.push(at(lathe([[0, 0], [ENG.blowerR + 0.004, 0], [ENG.blowerR + 0.004, 0.01], [0, 0.01]], 'grey', { axis: 'x', seg: 56 }), [ENG.blowerX[0], FY, FZ]));
  const grille = [];
  for (let k = 0; k < 6; k++) grille.push(at(S.torus(0.05 + k * 0.022, 0.004, 'darkSteel', { axis: 'x' }), [ENG.blowerX[1] + 0.002, FY, FZ]));
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    grille.push(at(box(0.006, 0.12, 0.008, 'darkSteel'), [ENG.blowerX[1] + 0.002, FY + Math.sin(a) * 0.105, FZ + Math.cos(a) * 0.105], [a - Math.PI / 2, 0, 0]));
  }
  grey.push(bx(ENG.blowerX[0], 0.7, -0.25, -0.02, -0.15, 0.15, 'grey', 0.02)); // carter de distribution
  // Pattes moulées : deux sur le carter de volant, deux sous la soufflante.
  for (const [x, z] of ENG.feet) {
    const s = Math.sign(z);
    grey.push(bx(x - 0.03, x + 0.03, ENG.footY + 0.012, -0.03, z - s * 0.06, z - s * 0.025, 'grey', 0.004));
    grey.push(plate(0.11, 0.12, 0.014, 'grey', { holes: [[0, 0.015 * s, 0.009]] }));
    grey.at(-1).position.set(x, ENG.footY + 0.007, z - s * 0.015);
    grey.push(bx(x - 0.006, x + 0.006, ENG.footY + 0.014, -0.05, z - s * 0.025, z + s * 0.035, 'grey', 0.002)); // gousset
  }
  // Plaque signalétique Deutz sur le capot.
  const plaque = at(nameplate(0.12, 0.06), [0.45, 0.24, 0.291]);
  P('1', group(
    merged(grey, 'grey'), merged(iron, 'castIron'), merged(alu, 'castAlu'), merged(covers, 'black'),
    merged(stl.filter((o) => o.isObject3D), 'steel'), duct, merged(yPlate, 'lightGrey'), merged(blower, 'grey'), merged(grille, 'darkSteel'), plaque,
  ), [0, 0, 0]);

  // ---------------------------------------------------------------- 2 — accessoires
  // Tubulure d'admission côté +Z sur les culasses, coude montant vers le
  // raccord du filtre à air à l'avant ; pompes d'injection unitaires au flanc
  // du bloc et leurs tuyaux vers les injecteurs ; jauge et remplissage d'huile ;
  // poulie de vilebrequin et poulie de soufflante.
  const IY = ENG.intake.y, IZ = ENG.intake.z;
  const acc = [], accBlk = [], accStl = [];
  acc.push(tube([[0.12, IY, IZ], [0.6, IY, IZ]], 0.028, 'castAlu', { sharp: true, seg: 2, radial: 24 }));
  acc.push(at(cyl(0.036, 0.01, 'castAlu', { axis: 'x' }), [0.12, IY, IZ]));
  for (const x of ENG.cylX) acc.push(bx(x - 0.024, x + 0.024, IY - 0.035, IY - 0.005, 0.115, IZ, 'castAlu', 0.006));
  acc.push(tube([[0.6, IY, IZ], [0.64, IY + 0.01, IZ], [0.655, IY + 0.05, IZ]], 0.034, 'castAlu', { seg: 16, radial: 24 }));
  acc.push(at(cyl(0.044, 0.012, 'castAlu'), [0.656, IY + 0.056, IZ]));
  // Pompes d'injection : quatre corps sous le capot, bride à deux vis.
  for (const x of ENG.cylX) {
    accBlk.push(bx(x - 0.022, x + 0.022, -0.09, 0.0, 0.17, 0.205, 'darkSteel', 0.004));
    accStl.push(at(cyl(0.011, 0.03, 'steel', { seg: 12 }), [x, 0.015, 0.19]));
    accStl.push(tube([[x, 0.03, 0.19], [x, 0.04, 0.2], [x + 0.01, 0.2, 0.2], [x + 0.025, 0.36, 0.12], [x + 0.025, 0.38, 0.09]], 0.0035, 'steel', { seg: 24, radial: 6 }));
    accStl.push(boltSet([[x - 0.016, -0.02, 0.205], [x + 0.016, -0.02, 0.205]], 0.008, 0.02, 'steel', { axis: 'z' }));
  }
  // Rampe de gazole et pompe d'alimentation.
  accStl.push(tube([[0.16, -0.075, 0.21], [0.58, -0.075, 0.21]], 0.005, 'steel', { sharp: true, seg: 2, radial: 8 }));
  accBlk.push(bx(0.58, 0.64, -0.12, -0.03, 0.15, 0.2, 'darkSteel', 0.006));
  // Jauge d'huile (tube et poignée jaune), bouchon de remplissage.
  accStl.push(tube([[0.24, -0.1, 0.165], [0.24, 0.02, 0.215], [0.24, 0.05, 0.31]], 0.006, 'steel', { seg: 16, radial: 8 }));
  const dipHandle = at(S.torus(0.012, 0.003, 'yellow', { axis: 'z' }), [0.24, 0.07, 0.315]);
  accBlk.push(at(lathe([[0, 0], [0.026, 0], [0.026, 0.015], [0.02, 0.022], [0, 0.022]], 'black', { axis: 'z', seg: 24 }), [0.5, -0.06, 0.17]));
  // Poulies : vilebrequin (deux gorges) et soufflante.
  const groove = (r, n) => {
    const prof = [[0.02, 0], [r, 0]];
    for (let k = 0; k < n; k++) {
      const x = 0.004 + k * 0.016;
      prof.push([r, x], [r - 0.012, x + 0.004], [r - 0.012, x + 0.008], [r, x + 0.012]);
    }
    prof.push([r, 0.004 + n * 0.016], [0.02, 0.004 + n * 0.016]);
    return prof;
  };
  accStl.push(lathe(groove(0.09, 2), 'darkSteel', { axis: 'x', seg: 48, pos: [ENG.pulleyX - 0.02, 0, 0] }));
  accStl.push(lathe(groove(0.075, 2), 'darkSteel', { axis: 'x', seg: 48, pos: [ENG.pulleyX - 0.02, FY, FZ] }));
  accStl.push(at(cyl(0.045, 0.06, 'darkSteel', { axis: 'x' }), [ENG.blowerX[1] + 0.02, 0, 0])); // amortisseur / moyeu
  P('2', group(
    merged(acc, 'castAlu'), merged(accBlk.filter((o) => o.isObject3D), 'darkSteel'), merged(accStl, 'steel'), dipHandle,
  ), [0, 0.18, 0.18]);

  // ---------------------------------------------------------------- filtres (3 huile, 9 gazole)
  // Cartouches vissées sous leur console, côté +Z, bas du bloc.
  const spinOn = (r, h, mat) => {
    const g = group(
      lathe([[0, -h], [r - 0.006, -h], [r, -h + 0.008], [r, -0.012], [r - 0.004, -0.006], [r * 0.85, 0], [0, 0]], mat, { seg: 32 }),
      at(S.torus(r * 0.8, 0.003, 'rubber'), [0, 0.001, 0]),
    );
    // Cannelures de clé au fond de la cartouche.
    const ribs = [];
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      ribs.push(at(box(0.004, 0.02, 0.006, mat), [Math.cos(a) * (r + 0.001), -h + 0.016, Math.sin(a) * (r + 0.001)], [0, -a, 0]));
    }
    g.add(merged(ribs, mat));
    return g;
  };
  const console = (x) => group(
    bx(x - 0.035, x + 0.035, -0.105, -0.06, 0.17, 0.25, 'castAlu', 0.006),
    at(cyl(0.012, 0.02, 'steel', { axis: 'x', seg: 12 }), [x + 0.045, -0.08, 0.22]),
  );
  P('3', group(console(0.47), at(spinOn(0.047, 0.15, 'black'), [0.47, -0.106, 0.215])), [0, -0.12, 0.25]);
  P('9', group(console(0.345), at(spinOn(0.04, 0.14, 'white'), [0.345, -0.106, 0.215])), [0, -0.16, 0.22]);

  // ---------------------------------------------------------------- 4 — collecteur d'échappement
  // Caisson cylindrique le long des culasses (−Z), quatre pipes à bride ovale,
  // sortie arrière vers le kit d'échappement P266.
  const EX = ENG.exhaust;
  const exh = [lathe([[0, 0.12], [0.045, 0.12], [0.052, 0.13], [0.052, 0.59], [0.045, 0.6], [0, 0.6]].map(([r, x]) => [r, x]), 'darkSteel', { axis: 'x', seg: 36 })];
  exh.at(-1).position.set(0, EX.y, EX.z);
  for (const x of ENG.cylX) {
    exh.push(bx(x - 0.022, x + 0.022, EX.y - 0.022, EX.y + 0.022, EX.z + 0.03, -0.12, 'darkSteel', 0.008));
    exh.push(bx(x - 0.034, x + 0.034, EX.y - 0.03, EX.y + 0.03, -0.128, -0.12, 'darkSteel', 0.006));
  }
  exh.push(tube([[0.12, EX.y, EX.z], [EX.outX + 0.012, EX.y, EX.z]], 0.03, 'darkSteel', { sharp: true, seg: 2, radial: 20 }));
  exh.push(at(cyl(0.045, 0.012, 'darkSteel', { axis: 'x' }), [EX.outX + 0.006, EX.y, EX.z]));
  const exBolts = [];
  for (const x of ENG.cylX) exBolts.push(boltSet([[x - 0.024, EX.y, -0.128], [x + 0.024, EX.y, -0.128]], 0.008, 0.02, 'steel', { axis: '-z' }));
  P('4', group(merged(exh, 'darkSteel'), merged(exBolts, 'steel')), [0, 0.06, -0.25]);

  // ---------------------------------------------------------------- 5 — plaque d'entraînement de pompe
  // Disque d'acier boulonné sur le volant : douze trous en couronne, huit
  // trous de moyeu, alésage central.
  {
    const R = 0.176, t = 0.008;
    const holes = [];
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + 0.26; holes.push([Math.cos(a) * 0.1667, Math.sin(a) * 0.1667, 0.0055]); }
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.2; holes.push([Math.cos(a) * 0.075, Math.sin(a) * 0.075, 0.0065]); }
    holes.push([0, 0, 0.05]);
    const pts = arc(0, 0, R, 0, Math.PI * 2, 64).slice(0, -1);
    P('5', slabX(pts, VX - t, VX, 'steel', holes), [-0.3, 0, 0]);
  }

  // ---------------------------------------------------------------- 6 — boîtier de commande
  // Coffret à six instruments (manomètre d'huile, thermomètre, compte-tours,
  // ampèremètre, horamètre, voyants), contacteur à clé et voyants, sur une
  // console au-dessus de la soufflante ; façade vers +Z.
  {
    const cx = 0.74, cy = 0.56, cz = 0.21, w = 0.2, h = 0.28, d = 0.14;
    const bodyBox = box(w, h, d, 'black', { r: 0.008, pos: [cx, cy, cz] });
    const lid = box(w - 0.014, h - 0.014, 0.004, 'black', { r: 0.004, pos: [cx, cy, cz + d / 2 + 0.002] });
    const gauges = [];
    const gp = [[-0.05, 0.085], [0.04, 0.085], [-0.05, 0.015], [0.04, 0.015], [-0.05, -0.055]];
    gp.forEach(([gx, gy], k) => gauges.push(at(gauge(k < 4 ? 0.032 : 0.026, { axis: 'z' }), [cx + gx, cy + gy, cz + d / 2 + 0.012])));
    const sw = [];
    sw.push(at(cyl(0.014, 0.012, 'chrome', { axis: 'z', seg: 20 }), [cx + 0.045, cy - 0.06, cz + d / 2 + 0.008])); // contacteur à clé
    for (let k = 0; k < 4; k++) sw.push(at(cyl(0.005, 0.008, 'red', { axis: 'z', seg: 12 }), [cx + 0.075, cy - 0.105 + k * 0.022, cz + d / 2 + 0.006]));
    const bracket = group(
      bx(cx - 0.06, cx + 0.06, cy - h / 2 - 0.006, cy - h / 2, cz - 0.06, cz + 0.06, 'black'),
      bx(cx - 0.02, cx + 0.02, FY + ENG.blowerR, cy - h / 2, cz - 0.02, cz + 0.02, 'black'),
    );
    P('6', group(bodyBox, lid, ...gauges, merged(sw.filter((o, i) => i === 0), 'chrome'), merged(sw.filter((o, i) => i > 0), 'red'), bracket), [0.15, 0.25, 0.15]);
  }

  // ---------------------------------------------------------------- 7 — démarreur
  // Moteur de lancement côté −Z, nez engagé dans le carter de volant,
  // contacteur à solénoïde sur le dessus, bornes.
  {
    const y = -0.075, z = -0.2;
    const body = lathe([[0, 0.12], [0.044, 0.12], [0.046, 0.125], [0.046, 0.3], [0.04, 0.315], [0.02, 0.32], [0, 0.32]], 'black', { axis: 'x', seg: 32, pos: [0, y, z] });
    const nose = lathe([[0, ENG.bellX - 0.05], [0.03, ENG.bellX - 0.05], [0.032, ENG.bellX], [0.055, ENG.bellX], [0.055, ENG.bellX + 0.012], [0.04, 0.12], [0, 0.12]], 'castAlu', { axis: 'x', seg: 28, pos: [0, y, z] });
    const sol = lathe([[0, 0.14], [0.024, 0.14], [0.025, 0.145], [0.025, 0.27], [0.018, 0.28], [0, 0.28]], 'black', { axis: 'x', seg: 24, pos: [0, y + 0.068, z] });
    const term = group(
      at(cyl(0.005, 0.02, 'copper', { seg: 10 }), [0.285, y + 0.068 + 0.012, z]),
      at(cyl(0.005, 0.02, 'copper', { seg: 10 }), [0.285, y + 0.068 - 0.012, z]),
    );
    P('7', group(body, nose, sol, term, at(boltSet([[ENG.bellX + 0.012, y + 0.04, z], [ENG.bellX + 0.012, y - 0.04, z]], 0.01, 0.03, 'steel', { axis: 'x' }), [0, 0, 0])), [-0.05, -0.05, -0.28]);
  }

  // ---------------------------------------------------------------- 8 — alternateur
  // Carcasse en alliage à ouïes, poulie à gorge, patte de tension, bornes B+.
  const ALT = [0.7, 0.45, -0.13];
  {
    const [ax, ay, az] = ALT;
    const body = lathe([[0, -0.06], [0.055, -0.06], [0.064, -0.05], [0.064, 0.05], [0.055, 0.06], [0, 0.06]], 'castAlu', { axis: 'x', seg: 36, pos: [ax, ay, az] });
    const vents = [];
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      vents.push(at(box(0.05, 0.006, 0.008, 'darkSteel'), [ax, ay + Math.sin(a) * 0.064, az + Math.cos(a) * 0.064], [a, 0, 0]));
    }
    const pul = lathe([[0.008, 0], [0.042, 0], [0.042, 0.003], [0.032, 0.008], [0.042, 0.013], [0.042, 0.016], [0.008, 0.016]], 'darkSteel', { axis: 'x', seg: 32, pos: [ENG.pulleyX + 0.007, ay, az] });
    const shaft = at(cyl(0.008, ENG.pulleyX + 0.03 - ax - 0.06, 'steel', { axis: 'x', seg: 12 }), [(ENG.pulleyX + 0.03 + ax + 0.06) / 2, ay, az]);
    const ears = group(
      bx(ax - 0.03, ax + 0.03, ay - 0.085, ay - 0.06, az - 0.012, az + 0.012, 'castAlu', 0.004),
      at(cyl(0.006, 0.025, 'copper', { axis: 'x', seg: 10 }), [ax - 0.07, ay + 0.03, az]),
    );
    const strap = bx(ax - 0.006, ax + 0.006, 0.36, ay - 0.06, az - 0.01, az + 0.01, 'darkSteel');
    P('8', group(body, merged(vents, 'darkSteel'), pul, shaft, ears, strap), [0.1, 0.22, -0.15]);
  }

  // ---------------------------------------------------------------- 10*, 11* — courroies
  // Courroie trapézoïdale autour de deux poulies (plan x) : brins tangents et arcs.
  const belt = (x, c1, r1, c2, r2, w = 0.013) => {
    const [y1, z1] = c1, [y2, z2] = c2;
    const d = Math.hypot(y2 - y1, z2 - z1);
    const base = Math.atan2(z2 - z1, y2 - y1);
    const b = Math.acos((r1 - r2) / d);
    const pts = [];
    const n1 = 24, n2 = 16;
    for (let i = 0; i <= n1; i++) { const a = base + b + ((2 * Math.PI - 2 * b) * i) / n1; pts.push([x, y1 + r1 * Math.cos(a), z1 + r1 * Math.sin(a)]); }
    for (let i = 0; i <= n2; i++) { const a = base - b + ((2 * b) * i) / n2; pts.push([x, y2 + r2 * Math.cos(a), z2 + r2 * Math.sin(a)]); }
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), true, 'centripetal');
    const shape = new THREE.Shape([new THREE.Vector2(-w / 2, -0.004), new THREE.Vector2(w / 2, -0.004), new THREE.Vector2(w * 0.32, 0.006), new THREE.Vector2(-w * 0.32, 0.006)]);
    const geo = new THREE.ExtrudeGeometry(shape, { steps: 160, extrudePath: curve, bevelEnabled: false });
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, S.box(0.01, 0.01, 0.01, 'rubber').material);
  };
  const fanBelt = belt(ENG.pulleyX - 0.006, [0, 0], 0.084, [FY, FZ], 0.069);
  P('10*', fanBelt, [0.12, 0, 0]);
  const altBelt = belt(ENG.pulleyX + 0.01, [FY, FZ], 0.069, [ALT[1], ALT[2]], 0.036, 0.011);
  P('11*', altBelt, [0.2, 0.06, 0]);

  // ---------------------------------------------------------------- 12* — électro-aimant d'arrêt
  // Solénoïde à bride sur le carter de régulateur, à l'avant de la rangée de
  // pompes ; tige vers l'arrière, connecteur.
  {
    const y = -0.06, z = 0.22;
    P('12*', group(
      lathe([[0, 0], [0.024, 0], [0.026, 0.004], [0.026, 0.07], [0.02, 0.078], [0, 0.078]], 'black', { axis: 'x', seg: 24, pos: [0.6, y, z + 0.005] }),
      at(box(0.012, 0.05, 0.06, 'zinc', { r: 0.002 }), [0.6, y, z + 0.005]),
      at(cyl(0.008, 0.022, 'plastic', { axis: 'x', seg: 12 }), [0.687, y, z + 0.005]),
    ), [0.12, 0, 0.12]);
  }

  void IN; void MM; void hose; void weld;
  return { view: { dir: [-0.9, 0.7, 1.1] } };
}

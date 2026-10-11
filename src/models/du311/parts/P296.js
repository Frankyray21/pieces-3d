// P296 — Carter du compresseur surpresseur Le Roi CP48001 : CP48001-0700A
// « COMPRESSOR CRANKCASE ASSY » (page 296). Carter en fonte (1) : caisson
// creux à trois portées de cylindres (dessus pour le cylindre central, deux
// pans à ±60° pour les cylindres latéraux), bas plus étroit à quatre pattes
// nervurées, grande ouverture arrière qui reçoit le flasque de palier et la
// pompe à huile (P302), face avant à bossage qui porte la cuvette du
// roulement avant (3) ; boîtier de joint (27) sur son joint (26), bague
// d'étanchéité (2) et quatre vis (28) ; bouchon de remplissage (4, flanc −Z,
// au niveau d'huile) et bouchon de vidange (5, bas de la face arrière) ;
// chicane intérieure en tôle (23) sur le goujon du carter, rondelle (24) et
// écrou (25). Reniflard (6) : tube montant vissé sur le dessus du carter,
// coiffé du reniflard à clapet de l'encart (« ITEM 6 PARTS BREAKDOWN ») :
// corps (7), couvercle articulé (8) sur son rivet de charnière (15) avec
// ressort de couvercle (17) et son rivet (14), tige de clapet (9), ressort
// (10), clapet (11), rondelle de clapet (12), goupille fendue (13), rondelle
// (16). La ligne 6 porte le tube (le reste de l'ensemble a ses lignes).
// Plaque de visite du flanc +Z (« SEE CM48001-0700M ») : hors liste, non
// dessinée (portée seule).
// Repère du bloc (_moteur_surpresseur.js) : origine sur l'axe du vilebrequin
// au droit du cylindre central, +X vers la poulie, Y vers le haut, +Z = X × Y.
// Faces : arrière x = LR.rearX = −0.14, avant x = LR.frontX = 0.11 ; portées
// des cylindres à LR.deck = 0.155 de l'axe ; dessous des pattes à y = −0.165,
// trous des pattes à x = −0.112 / 0.082, z = ±0.145.
// Encombrement ≈ 0.27 (X, de −0.14 au boîtier de joint à 0.13) × 0.525 (y
// −0.165 → 0.36 au reniflard) × 0.344 (Z, pans des cylindres latéraux) m.
// Cotes estimées d'après les pages 282, 288 et 296 (dessins non cotés).

import { LR, IN, MM, lrPrism, lrRoundRect, lrCircle } from './_moteur_surpresseur.js';

export default function P296(api) {
  const { S } = api;
  const { lathe, plate, extrude, box, bolt, washer, nut, stud, spring, cyl, torus, nameplate, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  const latheX = (prof, mat, seg = 48) => { const m = lathe(prof, mat, { seg }); m.rotation.z = -Math.PI / 2; return group(m); };
  // Profil (z, y) extrudé selon X sur l'épaisseur t, centré en x.
  const side = (pts, t, x, mat, holes = []) => {
    const m = extrude(pts, t, mat, { holes });
    m.rotation.y = -Math.PI / 2;
    m.position.x = x;
    return m;
  };

  const xr = LR.rearX, xf = LR.frontX, L = xf - xr, xm = (xr + xf) / 2;
  const D = LR.deck, hw = LR.halfW, yB = LR.bottomY;
  const s60 = Math.sin(60 * Math.PI / 180), c60 = 0.5;
  const zt = (D * (1 - c60)) / s60; // arête dessus / pan latéral
  const sP = 0.08; // demi-largeur utile d'un pan latéral sous l'axe du cylindre
  const yl = D * c60 - sP * s60, zl = D * s60 + sP * c60; // bas d'un pan latéral
  // Section du caisson (z, y), sens trigonométrique.
  const sec = [[-hw, yB], [hw, yB], [hw, -0.045], [zl, yl], [zt, D], [-zt, D], [-zl, yl], [-hw, -0.045]];
  const rS = 50.5 * MM; // ouvertures des cylindres

  // ---------------------------------------------------------------- 1 — carter
  const walls = [];
  for (let k = 0; k < sec.length; k++) {
    const [z0, y0] = sec[k], [z1, y1] = sec[(k + 1) % sec.length];
    const dz = z1 - z0, dy = y1 - y0, len = Math.hypot(dz, dy);
    const ny = -dz / len, nz = dy / len; // normale extérieure
    const th = Math.atan2(nz, ny);
    const my = (y0 + y1) / 2, mz = (z0 + z1) / 2;
    // Portée de cylindre ? (normale selon l'axe d'un cylindre)
    const ci = LR.cyl.findIndex((c) => Math.abs(Math.cos(c.a) - ny) < 1e-3 && Math.abs(Math.sin(c.a) - nz) < 1e-3);
    const t = ci >= 0 ? 16 * MM : 10 * MM;
    const holes = [];
    if (ci >= 0) {
      const c = LR.cyl[ci];
      const cy = D * Math.cos(c.a), cz = D * Math.sin(c.a);
      const zl0 = (cy - my) * -Math.sin(th) + (cz - mz) * Math.cos(th);
      holes.push([c.x - xm, zl0, rS]);
    }
    const w = plate(L, len, t, 'castIron', { holes });
    const g = group(w);
    g.rotation.x = th;
    g.position.set(xm, my - (ny * t) / 2, mz - (nz * t) / 2);
    walls.push(g);
  }
  // Faces d'extrémité : arrière (ouverture du flasque P302), avant (bossage du palier).
  const secZY = sec.map(([z, y]) => [z, y]);
  walls.push(side(secZY, 12 * MM, xr + 6 * MM, 'castIron', [[0, 0, LR.rearOpenR]]));
  walls.push(side(secZY, 12 * MM, xf - 6 * MM, 'castIron', [[0, 0, 50 * MM]]));
  const rCup = 36 * MM;
  walls.push(latheX([[rCup, 0.078], [52 * MM, 0.078], [52 * MM, xf], [30 * MM, xf], [30 * MM, 0.101], [rCup, 0.101], [rCup, 0.078]], 'castIron', 56));
  // Pattes : semelles percées et nervures.
  const feet = [];
  for (const x of LR.feetX) for (const sz of [-1, 1]) {
    const zc = sz * 0.1425;
    const f = plate(0.05, 0.045, 18 * MM, 'castIron', { holes: [[0, sz * -0.0025 * -1, 6.5 * MM]], r: 4 * MM });
    f.position.set(x, LR.footY + 9 * MM, zc);
    feet.push(f);
    const rib = side([[sz * hw, LR.footY + 18 * MM], [sz * (LR.footHalfW - 4 * MM), LR.footY + 18 * MM], [sz * hw, -0.07]].map(([z, y]) => [z, y]), 8 * MM, x + 0.019, 'castIron');
    feet.push(rib);
  }
  // Goujon de la chicane (bossage sur la paroi +Z intérieure).
  const bossC = latheX([[0, 0], [7 * MM, 0], [7 * MM, 6 * MM], [0, 6 * MM]], 'castIron', 16);
  bossC.rotation.set(Math.PI / 2, 0, 0); // axe selon Z
  // Bossage du reniflard sur le dessus (coin +X / +Z) et des bouchons.
  const xBr = 0.088, zBr = 0.07;
  const bossB = lathe([[0, D], [16 * MM, D], [13 * MM, D + 6 * MM], [0, D + 6 * MM]], 'castIron', { seg: 24, pos: [xBr, 0, zBr] });
  const bossF = cyl(13 * MM, 6 * MM, 'castIron', { axis: 'z', pos: [0.06, -0.06, -hw - 3 * MM] });
  const bossD = cyl(13 * MM, 6 * MM, 'castIron', { axis: 'x', pos: [xr - 3 * MM, -0.142, 0.07] });
  const studC = stud(8 * MM, 22 * MM, 'steel', { axis: '-z', nut: false, washer: false, pos: [0.055, -0.07, hw - 10 * MM] });
  const plateN = at(nameplate(0.06, 0.035), [0.0, -0.1, hw + 0.2 * MM]);
  const caseObj = group(merged([...walls, ...feet, bossB, bossF, bossD], 'castIron'), studC, plateN);
  P('1', caseObj, [0, -0.08, 0]);

  // ---------------------------------------------------------------- 3 — cuvette du roulement avant
  P('3', latheX([[33.2 * MM, 0.085], [rCup, 0.085], [rCup, 0.101], [31.8 * MM, 0.101], [31.8 * MM, 0.0985], [33.2 * MM, 0.085]], 'steel', 48), [-0.05, 0, 0]);

  // ---------------------------------------------------------------- 26 / 27 / 28 / 2 — boîtier de joint avant
  const sq = 0.09, bp = 0.034;
  const sqHoles = [[bp, bp], [-bp, bp], [-bp, -bp], [bp, -bp]];
  const prismX = (outline, holes, xa, xb, mat) => {
    const m = lrPrism(api, outline, holes, 0, xb - xa, mat);
    m.rotation.z = -Math.PI / 2;
    m.position.x = xa;
    return m;
  };
  const tG = 0.8 * MM;
  P('26', prismX(lrRoundRect(sq, sq, 8 * MM, 4), [lrCircle(31 * MM, 40), ...sqHoles.map(([a, b]) => lrCircle(4.5 * MM, 12, a, b))], xf, xf + tG, 'cream'), [0.06, 0, 0]);
  const xh = xf + tG;
  P('27', merged([
    prismX(lrRoundRect(sq, sq, 8 * MM, 4), [lrCircle(30 * MM, 40), ...sqHoles.map(([a, b]) => lrCircle(4.3 * MM, 12, a, b))], xh, xh + 9 * MM, 'castIron'),
    latheX([[30 * MM, xh + 9 * MM], [38 * MM, xh + 9 * MM], [36 * MM, xh + 18 * MM], [21 * MM, xh + 18 * MM], [21 * MM, xh + 15 * MM], [30 * MM, xh + 15 * MM], [30 * MM, xh + 9 * MM]], 'castIron', 48),
  ], 'castIron'), [0.11, 0, 0]);
  // Bague d'étanchéité : armature, lèvre caoutchouc et ressort de lèvre.
  P('2', group(
    latheX([[24 * MM, xh + 5.5 * MM], [29.9 * MM, xh + 5.5 * MM], [29.9 * MM, xh + 14.8 * MM], [27 * MM, xh + 14.8 * MM], [24 * MM, xh + 13.5 * MM], [24 * MM, xh + 5.5 * MM]], 'steel', 40),
    latheX([[17.6 * MM, xh + 9 * MM], [24 * MM, xh + 6 * MM], [24 * MM, xh + 13.5 * MM], [19 * MM, xh + 13 * MM], [17.6 * MM, xh + 10.5 * MM], [17.6 * MM, xh + 9 * MM]], 'rubber', 40),
    torus(20.5 * MM, 0.9 * MM, 'steel', { axis: 'x', pos: [xh + 11 * MM, 0, 0] }),
  ), [0.16, 0, 0]);
  for (const [a, b] of sqHoles) {
    P('28', bolt(0.3125 * IN, 1 * IN, 'steel', { axis: 'x', washer: true, pos: [xh + 9 * MM, a, b] }), [0.2, 0, 0]);
  }

  // ---------------------------------------------------------------- 4 / 5 — bouchons (carré de manœuvre, filet conique 1/2 NPT)
  const plug = (mat) => group(
    lathe([[0, -14 * MM], [9.5 * MM, -14 * MM], [10.7 * MM, 0], [0, 0]], mat, { seg: 16 }),
    at(lathe([[0, 0], [8 * MM, 0], [8 * MM, 9 * MM], [7 * MM, 10 * MM], [0, 10 * MM]], mat, { seg: 4 }), [0, 0, 0], [0, Math.PI / 4, 0]),
  );
  P('4', at(plug('steel'), [0.06, -0.06, -hw - 6 * MM], [-Math.PI / 2, 0, 0]), [0, 0, -0.06]);
  P('5', at(plug('steel'), [xr - 6 * MM, -0.142, 0.07], [0, 0, Math.PI / 2]), [-0.06, 0, 0]);

  // ---------------------------------------------------------------- 23 / 24 / 25 — chicane, rondelle, écrou
  // Tôle verticale contre le flanc +Z intérieur, encochée, accrochée au goujon.
  const zb = hw - 10 * MM - 6 * MM - 1 * MM; // face intérieure de la tôle
  const baffle = side([[0, 0], [0.05, 0], [0.05, 0.03], [0.047, 0.034], [0.05, 0.038], [0.05, 0.1], [0, 0.1], [0, 0.062], [0.003, 0.058], [0, 0.054]], 2 * MM, 0, 'grey', [[0.025, 0.08, 4.5 * MM]]);
  // side() couche le profil (z, y) en travers de X : on le remet dans le plan XY.
  const bf = group(baffle);
  bf.rotation.y = Math.PI / 2;
  bf.position.set(0.03, -0.15, zb + 1 * MM);
  P('23', bf, [0, 0.3, -0.02]);
  P('24', washer(8.5 * MM, 4.3 * MM, 1.6 * MM, 'steel', { axis: 'z', pos: [0.055, -0.07, zb - 0.8 * MM] }), [0, 0.3, -0.045]);
  P('25', nut(13 * MM, 6.5 * MM, 'steel', { axis: 'z', pos: [0.055, -0.07, zb - 1.6 * MM - 3.25 * MM] }), [0, 0.3, -0.06]);

  // ---------------------------------------------------------------- 6 — reniflard : tube montant
  const yT0 = D + 6 * MM, yT1 = D + 0.05;
  P('6', group(
    lathe([[8.5 * MM, yT0 - 12 * MM], [11 * MM, yT0 - 12 * MM], [11 * MM, yT1 - 8 * MM], [12.5 * MM, yT1 - 8 * MM], [12.5 * MM, yT1], [8.5 * MM, yT1], [8.5 * MM, yT0 - 12 * MM]], 'zinc', { seg: 24, pos: [xBr, 0, zBr] }),
    at(nut(0.875 * IN, 8 * MM, 'zinc'), [xBr, yT0 + 4 * MM, zBr]),
  ), [0, 0.06, 0]);

  // ---------------------------------------------------------------- 7 à 17 — reniflard à clapet (encart)
  const y0 = yT1; // dessous du corps
  const B = (obj) => at(group(obj), [xBr, 0, zBr]);
  const bx = (k) => [0, 0.1 + 0.018 * k, 0];
  // 7 — corps : queue filetée dans le tube, coupe à fond percé.
  P('7', B(lathe([[5 * MM, y0 - 10 * MM], [8.3 * MM, y0 - 10 * MM], [8.3 * MM, y0], [15 * MM, y0 + 1 * MM], [16 * MM, y0 + 4 * MM],
    [16 * MM, y0 + 14 * MM], [14.5 * MM, y0 + 14 * MM], [14.5 * MM, y0 + 5 * MM], [9 * MM, y0 + 3 * MM], [2 * MM, y0 + 3 * MM], [2 * MM, y0 + 1 * MM], [5 * MM, y0 + 1 * MM], [5 * MM, y0 - 10 * MM]], 'castAlu', { seg: 32 })), bx(0));
  // 12 — rondelle de clapet sous le fond, 13 — goupille fendue dans la tige.
  P('12', B(washer(5 * MM, 1.6 * MM, 1 * MM, 'steel', { pos: [0, y0 + 0.5 * MM - 0.5 * MM, 0] })), [0, 0.06, 0]);
  P('13', B(group(
    at(cyl(0.5 * MM, 9 * MM, 'steel', { axis: 'z', seg: 8 }), [0.6 * MM, y0 - 2 * MM, 0]),
    at(cyl(0.5 * MM, 9 * MM, 'steel', { axis: 'z', seg: 8 }), [-0.6 * MM, y0 - 2 * MM, 0]),
    torus(1.2 * MM, 0.5 * MM, 'steel', { axis: 'x', pos: [0, y0 - 2 * MM, 4.5 * MM] }),
  )), [0, 0.04, 0]);
  // 9 — tige de clapet, 11 — clapet, 10 — ressort, 16 — rondelle.
  P('9', B(lathe([[0, y0 - 4 * MM], [1.5 * MM, y0 - 4 * MM], [1.5 * MM, y0 + 13 * MM], [2.5 * MM, y0 + 13 * MM], [2.5 * MM, y0 + 14 * MM], [0, y0 + 14 * MM]], 'steel', { seg: 12 })), bx(1));
  P('11', B(lathe([[1.6 * MM, y0 + 3 * MM], [12 * MM, y0 + 3 * MM], [12 * MM, y0 + 4.2 * MM], [1.6 * MM, y0 + 4.2 * MM], [1.6 * MM, y0 + 3 * MM]], 'rubber', { seg: 32 })), bx(2));
  P('10', B(spring(4 * MM, 0.5 * MM, 7 * MM, 4, 'steel', { pos: [0, y0 + 4.2 * MM + 3.5 * MM, 0], perTurn: 14, radial: 5 })), bx(3));
  P('16', B(washer(5 * MM, 1.6 * MM, 0.8 * MM, 'steel', { pos: [0, y0 + 11.6 * MM, 0] })), bx(4));
  // 8 — couvercle bombé à charnière (oreille côté +X), 15 — rivet de charnière.
  const yC = y0 + 14 * MM;
  const cover = merged([
    lathe([[0, yC], [17 * MM, yC], [17 * MM, yC + 3 * MM], [14 * MM, yC + 6 * MM], [0, yC + 7 * MM]], 'castAlu', { seg: 32 }),
    box(10 * MM, 7 * MM, 12 * MM, 'castAlu', { r: 2 * MM, pos: [19 * MM, yC + 1 * MM, 0] }),
  ], 'castAlu');
  P('8', B(cover), bx(6));
  P('15', B(cyl(1.5 * MM, 16 * MM, 'steel', { axis: 'z', seg: 10, pos: [21 * MM, yC - 0.5 * MM, 0] })), [0.03, 0.2, 0]);
  // 17 — ressort de couvercle (lame) et 14 — son rivet, sur le dessus du couvercle.
  const leaf = extrude([[0, 0], [14 * MM, 0], [22 * MM, -5 * MM], [23 * MM, -4 * MM], [15 * MM, 1 * MM], [0, 1 * MM]], 6 * MM, 'darkSteel');
  P('17', B(at(group(leaf), [6 * MM, yC + 6.2 * MM, 0])), bx(8));
  P('14', B(lathe([[0, yC + 6 * MM], [1.3 * MM, yC + 6 * MM], [1.3 * MM, yC + 7.2 * MM], [2.4 * MM, yC + 7.2 * MM], [2.2 * MM, yC + 8.4 * MM], [0, yC + 8.6 * MM]], 'steel', { seg: 12, pos: [9 * MM, 0, 0] })), bx(9));

  return { view: { dir: [-1.0, 0.7, 1.2] } };
}

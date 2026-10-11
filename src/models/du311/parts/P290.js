// P290 — Culasse du compresseur surpresseur Le Roi CP48001 : CP48001-0201
// « COMPRESSOR CYLINDER HEAD ASSEMBLY » (pages 290 et 292, même dessin ;
// « 3 HEADS REQUIRED » : une par cylindre, P288 en pose trois).
// Culasse en fonte (2) : bride ronde sur le cylindre, corps oblong qui loge
// côte à côte les deux clapets à lames, deux ailettes de refroidissement,
// quatre bossages de vis de culasse (38), bride d'aspiration en losange côté
// −X et bride de refoulement côté +X (deux trous chacune).
// Clapet d'aspiration (3, côté −X), dans l'ordre du dessin, de bas en haut :
// joint de clapet (16, cuivre), vis centrale (6, tête sous le siège), siège
// (5), goupille (10), bague de guidage (9), lame (7), trois lames-ressorts
// (8), butée (4), entretoise (13), ressort (15), fourche de délestage (14,
// ses deux doigts traversent la butée jusqu'à la lame), rondelle (12),
// écrou frein (11) ; au-dessus : chemise (17) à lumières et créneaux, joint
// torique (35) sur la chemise, piston de délestage (20) avec deux joints
// feutre (19) et un joint torique (18), bouchon (21) à six-pans et prise de
// pilotage au centre.
// Clapet de refoulement (22, côté +X) : joint (32), siège (23) à goujon
// central, goupille (29), écrou de centrage (28), lame (26), deux
// lames-ressorts (27), butée (24), rondelle (31), écrou (30) et contre-écrou
// (25) ; chemise (33), joint de bouchon (36), bouchon (34).
// Joint de culasse (37, A/R) : un ; vis de culasse (38, A/R) : quatre.
// Repère de cylindre (_moteur_surpresseur.js) : origine sur l'axe du
// vilebrequin, au droit du cylindre ; Y le long de l'axe du cylindre vers la
// culasse ; X le long du vilebrequin (aspiration −X, refoulement +X). Plan de
// joint à y = LR.headFace = 0.275, dessus des bouchons à y = 0.3605.
// Option { lite } : allège les lumières des pièces de clapet (voir plus bas).
// Encombrement 0.164 (X, brides de raccord) × 0.0855 (y 0.275 → 0.3605) ×
// 0.15 m (bride Ø 0,15).
// Cotes estimées (dessin non coté) : clapets Ø 57 mm, vis 3/8 po, bouchons
// Ø 66 mm ; disposition des orifices d'après la page 288.

import { LR, IN, MM, lrPrism, lrCircle } from './_moteur_surpresseur.js';

// Enveloppe convexe d'un nuage de points [x, z] (sens trigonométrique).
function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) { while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (hi.length > 1 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}

export default function P290(api, opts = {}) {
  const { S } = api;
  const { lathe, slotted, roundHole, ring, torus, box, bolt, nut, washer, spring, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Option { lite } (bloc P288, trois culasses) : lames sans lumières, une
  // seule couronne de lumières aux sièges et butées, chemises sans lumières.
  const lite = !!opts.lite;
  const VX = LR.valveX;
  const yG = LR.headFace; // dessous du joint de culasse
  const y0 = yG + 0.8 * MM; // dessous de la culasse
  const y1 = y0 + 12 * MM; // dessus de la bride ronde (fond des logements)
  const yD = 0.325; // dessus du corps (portée des bouchons)
  const rPk = 29.5 * MM; // logement de clapet
  const rV = 28.5 * MM; // siège, butée
  const boltPts = [0, 1, 2, 3].map((k) => {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    return [LR.headBoltR * Math.cos(a), LR.headBoltR * Math.sin(a)];
  });
  // Explosion : chaque colonne de clapet monte au-dessus de son logement.
  const col = (side, k) => [side * 0.045, 0.09 + 0.017 * k, 0];

  // ---------------------------------------------------------------- 2 — culasse
  const stadium = (R) => {
    const pts = [];
    for (let k = 0; k <= 16; k++) { const a = -Math.PI / 2 + (Math.PI * k) / 16; pts.push([VX + R * Math.cos(a), R * Math.sin(a)]); }
    for (let k = 0; k <= 16; k++) { const a = Math.PI / 2 + (Math.PI * k) / 16; pts.push([-VX + R * Math.cos(a), R * Math.sin(a)]); }
    return pts;
  };
  const pockets = [-VX, VX].map((x) => lrCircle(rPk, 28, x, 0));
  const flange = lrPrism(api, lrCircle(75 * MM, 44), [
    ...[-VX, VX].map((x) => lrCircle(20 * MM, 20, x, 0)),
    ...boltPts.map(([x, z]) => lrCircle(5.2 * MM, 14, x, z)),
  ], y0, y1, 'castIron');
  const body = lrPrism(api, stadium(38 * MM), pockets, y1, yD, 'castIron');
  // Deux ailettes autour du corps, entre la bride et la portée des bouchons.
  const fins = [0.2975, 0.3095].map((y) => lrPrism(api, stadium(47 * MM), pockets, y - 1.25 * MM, y + 1.25 * MM, 'castIron'));
  // Bossages des vis de culasse (dessus à 0.303) et congés sur la bride.
  const bosses = boltPts.map(([x, z]) => lathe([[0, y1], [12 * MM, y1], [9.5 * MM, y1 + 3 * MM], [9.5 * MM, 0.303], [0, 0.303]], 'castIron', { seg: 14, pos: [x, 0, z] }));
  // Brides de raccord en losange (deux trous), d'axe X, à y = 0.305.
  const yP = 0.305;
  const lozenge = hull([...lrCircle(15 * MM, 24), ...lrCircle(8 * MM, 12, 0, 25 * MM), ...lrCircle(8 * MM, 12, 0, -25 * MM)]);
  const portFlange = (sx) => {
    const t = 8 * MM;
    // Prisme local [x, z] extrudé selon +Y, couché le long de ±X.
    const m = lrPrism(api, lozenge, [lrCircle(9 * MM, 24), lrCircle(3.6 * MM, 12, 0, 25 * MM), lrCircle(3.6 * MM, 12, 0, -25 * MM)], 0, t, 'castIron');
    m.rotation.z = -sx * Math.PI / 2;
    m.position.set(sx * (VX + 38 * MM - 4 * MM), yP, 0);
    return m;
  };
  // Conduits : bossage cylindrique entre le corps et chaque bride.
  const ducts = [-1, 1].map((sx) => {
    const d = lathe([[0, 0], [14 * MM, 0], [14 * MM, 10 * MM], [0, 10 * MM]], 'castIron', { seg: 16 });
    d.rotation.z = -sx * Math.PI / 2;
    d.position.set(sx * (VX + 30 * MM), yP, 0);
    return d;
  });
  P('2', merged([flange, body, ...fins, ...bosses, portFlange(-1), portFlange(1), ...ducts], 'castIron'), [0, 0.05, 0]);

  // ---------------------------------------------------------------- 37 — joint de culasse
  P('37', lrPrism(api, lrCircle(75 * MM, 44), [lrCircle(LR.bore / 2 + 1 * MM, 32), ...boltPts.map(([x, z]) => lrCircle(5.5 * MM, 14, x, z))], yG, y0, 'cream'), [0, 0.02, 0]);

  // ---------------------------------------------------------------- 38 — vis de culasse (4)
  for (const [x, z] of boltPts) P('38', at(bolt(0.375 * IN, 1.5 * IN, 'steel', { washer: true }), [x, 0.303, z]), [0, 0.3, 0]);

  // ---------------------------------------------------------------- pièces de clapet
  // Disque percé (siège, butée, lames) : rayon R, trou central rc, couronnes de
  // trous [r, n, rh, phase], de ya à yb, centré sur l'axe du logement x = cx.
  const disk = (cx, R, rc, rows, ya, yb, mat, extra = []) => {
    const holes = rc > 0 ? [lrCircle(rc, 16, cx, 0)] : [];
    for (const [r, n, rh, ph = 0] of (lite ? rows.slice(0, mat === 'steel' ? 1 : 0) : rows)) {
      for (let k = 0; k < n; k++) {
        const a = ph + (2 * Math.PI * k) / n;
        holes.push(lrCircle(rh, 7, cx + r * Math.cos(a), r * Math.sin(a)));
      }
    }
    return lrPrism(api, lrCircle(R, 28, cx, 0), holes.concat(extra), ya, yb, mat);
  };
  const seatRows = [[11.5 * MM, 8, 2.6 * MM], [21 * MM, 12, 2.6 * MM, 0.26]];
  const guardRows = [[16 * MM, 10, 2.4 * MM, 0.31], [24 * MM, 10, 1.8 * MM]];
  const plateRows = [[16 * MM, 10, 1.6 * MM, 0.31]];
  const springRows = [[16.5 * MM, 8, 2.6 * MM, 0.2]];
  const cap = (cx, yb, rOut, hexR, mat) => {
    // Bouchon creux : queue filetée dans le logement, corps rond, six-pans,
    // prise de pilotage au centre.
    const yt = 0.3545;
    return merged([
      lathe([[27.5 * MM, yD - 7 * MM], [rPk, yD - 7 * MM], [rPk, yb], [rOut, yb], [rOut, yt - 2 * MM], [rOut - 2 * MM, yt],
        [3.5 * MM, yt], [3.5 * MM, yt - 5 * MM], [27.5 * MM, yt - 5 * MM], [27.5 * MM, yD - 7 * MM]], mat, { seg: 28, pos: [cx, 0, 0] }),
      lathe([[3.5 * MM, yt], [hexR, yt], [hexR, yt + 4.8 * MM], [hexR - 1.2 * MM, 0.3605], [3.5 * MM, 0.3605], [3.5 * MM, yt]], mat, { seg: 6, pos: [cx, 0, 0] }),
    ], mat);
  };
  // Chemise : tube à six lumières rondes et six créneaux en haut.
  const sleeve = (cx, ya, yb) => {
    const win = [];
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      if (!lite) win.push(...roundHole(a, ya + 7 * MM, 4 * MM, 26.5 * MM, { steps: 2 }));
      win.push({ a: a + Math.PI / 6, w: 0.32, y0: yb - 4 * MM, y1: yb });
    }
    return slotted(26.5 * MM, 22.5 * MM, ya, yb, win, 'darkSteel', { seg: 24, pos: [cx, 0, 0] });
  };

  // ---------------------------------------------------------------- 3 / 22 — ensembles de clapets
  // Lignes d'ensemble (pièces 4-15 et 23-31 dessinées une à une ci-dessous) :
  // enveloppe transparente du clapet monté, dans son logement, qui porte le
  // repère de l'ensemble sans masquer ses pièces.
  for (const [ref, cx] of [['3', -VX], ['22', VX]]) {
    P(ref, lathe([[0, y1 + 1 * MM], [rV + 0.4 * MM, y1 + 1 * MM], [rV + 0.4 * MM, y1 + 21.5 * MM], [0, y1 + 21.5 * MM]], 'glass', { seg: 28, pos: [cx, 0, 0] }), [cx < 0 ? -0.045 : 0.045, 0.09, 0]);
  }

  // ---------------------------------------------------------------- 3 — clapet d'aspiration (côté −X)
  {
    const cx = -VX, sd = -1;
    let k = 0;
    const Q = (ref, obj) => P(ref, obj, col(sd, k++));
    Q('16', lrPrism(api, lrCircle(rPk - 0.3 * MM, 28, cx, 0), [lrCircle(25 * MM, 28, cx, 0)], y1, y1 + 1 * MM, 'copper'));
    const yS = y1 + 1 * MM; // dessous du siège
    // 6 — vis centrale M6, tête sous le siège, tige vers le haut.
    Q('6', at(bolt(6 * MM, 37 * MM, 'steel', { axis: '-y' }), [cx, yS, 0]));
    Q('5', disk(cx, rV, 3.2 * MM, seatRows, yS, yS + 8 * MM, 'steel'));
    const yT = yS + 8 * MM; // dessus du siège
    Q('10', at(lathe([[0, 0], [1.5 * MM, 0], [1.5 * MM, 12 * MM], [1.2 * MM, 12.3 * MM], [0, 12.3 * MM]], 'steel', { seg: 10 }), [cx, yT - 3 * MM, 22 * MM]));
    Q('9', ring(7 * MM, 3.2 * MM, 2 * MM, 'brass', { seg: 20, pos: [cx, yT + 1 * MM, 0] }));
    Q('7', disk(cx, 26 * MM, 7.2 * MM, plateRows, yT, yT + 1 * MM, 'chrome', [lrCircle(1.8 * MM, 10, cx, 22 * MM)]));
    for (let s = 0; s < 3; s++) {
      const ya = yT + 1.1 * MM + s * 0.7 * MM;
      Q('8', disk(cx, 24.5 * MM, 7.2 * MM, springRows, ya, ya + 0.6 * MM, 'zinc', [lrCircle(1.8 * MM, 10, cx, 22 * MM)]));
    }
    const yGd = yT + 3.3 * MM; // dessous de la butée
    Q('4', disk(cx, rV, 3.2 * MM, guardRows, yGd, yGd + 9 * MM, 'steel',
      [lrCircle(1.8 * MM, 10, cx, 22 * MM), lrCircle(3.4 * MM, 12, cx, 17 * MM), lrCircle(3.4 * MM, 12, cx, -17 * MM)]));
    const yU = yGd + 9 * MM; // dessus de la butée
    Q('13', at(lathe([[3.2 * MM, yU], [4.5 * MM, yU], [4.5 * MM, yU + 6.5 * MM], [3.2 * MM, yU + 6.5 * MM], [3.2 * MM, yU]], 'steel', { seg: 16 }), [cx, 0, 0]));
    Q('15', spring(6.2 * MM, 0.7 * MM, 6 * MM, 3.5, 'darkSteel', { pos: [cx, yU + 3.2 * MM, 0], perTurn: 10, radial: 5 }));
    // 14 — fourche de délestage : traverse selon Z, deux doigts dans la butée.
    const yF = yU + 6.5 * MM;
    Q('14', merged([
      box(9 * MM, 3 * MM, 44 * MM, 'steel', { r: 1 * MM, pos: [cx, yF + 1.5 * MM, 0] }),
      ...[-1, 1].map((s) => box(6 * MM, yF - yT - 1 * MM, 4 * MM, 'steel', { pos: [cx, (yF + yT + 1 * MM) / 2, s * 17 * MM] })),
    ], 'steel'));
    Q('12', washer(6 * MM, 3.2 * MM, 1.2 * MM, 'steel', { pos: [cx, yF + 3.6 * MM, 0] }));
    Q('11', nut(10 * MM, 5 * MM, 'steel', { pos: [cx, yF + 4.2 * MM + 2.5 * MM, 0] }));
    const ySl = yU; // la chemise appuie sur la butée
    Q('17', sleeve(cx, ySl, 0.335));
    Q('35', torus(26.6 * MM, 1.1 * MM, 'rubber', { pos: [cx, 0.329, 0] }));
    // 20 — piston de délestage creux, trois gorges ; 19 / 18 / 19 dans les gorges.
    const yb = yF + 9.5 * MM; // dessous du piston
    const pl = [[17 * MM, yb], [22 * MM, yb]];
    for (const g of [yb + 3 * MM, yb + 10.5 * MM, yb + 18 * MM]) pl.push([22 * MM, g - 1.1 * MM], [20.2 * MM, g - 1.1 * MM], [20.2 * MM, g + 1.1 * MM], [22 * MM, g + 1.1 * MM]);
    pl.push([22 * MM, yb + 21 * MM], [21 * MM, yb + 22 * MM], [0, yb + 22 * MM], [0, yb + 6 * MM], [17 * MM, yb + 6 * MM], [17 * MM, yb]);
    Q('19', ring(22.4 * MM, 20.2 * MM, 2 * MM, 'cream', { seg: 24, pos: [cx, yb + 3 * MM, 0] }));
    Q('18', torus(21.3 * MM, 1.1 * MM, 'rubber', { pos: [cx, yb + 10.5 * MM, 0] }));
    Q('19', ring(22.4 * MM, 20.2 * MM, 2 * MM, 'cream', { seg: 24, pos: [cx, yb + 18 * MM, 0] }));
    Q('20', lathe(pl, 'steel', { seg: 24, pos: [cx, 0, 0] }));
    Q('21', cap(cx, yD, 33 * MM, 20 * MM, 'steel'));
  }

  // ---------------------------------------------------------------- 22 — clapet de refoulement (côté +X)
  {
    const cx = VX, sd = 1;
    let k = 0;
    const Q = (ref, obj) => P(ref, obj, col(sd, k++));
    Q('32', lrPrism(api, lrCircle(rPk - 0.3 * MM, 28, cx, 0), [lrCircle(25 * MM, 28, cx, 0)], y1, y1 + 1 * MM, 'copper'));
    const yS = y1 + 1 * MM;
    const yT = yS + 8 * MM;
    // 23 — siège à goujon central (M8, jusqu'à 0.319).
    Q('23', merged([
      disk(cx, rV, 0, seatRows, yS, yT, 'steel'),
      lathe([[0, yT], [4 * MM, yT], [4 * MM, 0.3185], [3.4 * MM, 0.319], [0, 0.319]], 'steel', { seg: 14, pos: [cx, 0, 0] }),
    ], 'steel'));
    Q('29', at(lathe([[0, 0], [1.5 * MM, 0], [1.5 * MM, 12 * MM], [1.2 * MM, 12.3 * MM], [0, 12.3 * MM]], 'steel', { seg: 10 }), [cx, yT - 3 * MM, 22 * MM]));
    Q('28', nut(11 * MM, 3 * MM, 'steel', { pos: [cx, yT + 1.5 * MM, 0] }));
    Q('26', disk(cx, 26 * MM, 7.5 * MM, plateRows, yT, yT + 1 * MM, 'chrome', [lrCircle(1.8 * MM, 10, cx, 22 * MM)]));
    for (let s = 0; s < 2; s++) {
      const ya = yT + 1.1 * MM + s * 0.7 * MM;
      Q('27', disk(cx, 24.5 * MM, 7.5 * MM, springRows, ya, ya + 0.6 * MM, 'zinc', [lrCircle(1.8 * MM, 10, cx, 22 * MM)]));
    }
    const yGd = yT + 3 * MM;
    Q('24', disk(cx, rV, 4.2 * MM, guardRows, yGd, yGd + 9 * MM, 'steel', [lrCircle(1.8 * MM, 10, cx, 22 * MM)]));
    const yU = yGd + 9 * MM;
    Q('31', washer(8 * MM, 4.2 * MM, 1.5 * MM, 'steel', { pos: [cx, yU + 0.75 * MM, 0] }));
    Q('30', nut(13 * MM, 5 * MM, 'steel', { pos: [cx, yU + 1.5 * MM + 2.5 * MM, 0] }));
    Q('25', nut(13 * MM, 3.5 * MM, 'steel', { pos: [cx, yU + 6.5 * MM + 1.75 * MM, 0] }));
    Q('33', sleeve(cx, yU, 0.335));
    Q('36', lrPrism(api, lrCircle(34 * MM, 28, cx, 0), [lrCircle(rPk + 0.2 * MM, 28, cx, 0)], yD, yD + 1.5 * MM, 'copper'));
    Q('34', cap(cx, yD + 1.5 * MM, 33 * MM, 21 * MM, 'steel'));
  }

  return { view: { dir: [1.1, 0.8, 1.0] } };
}

// P304 — Bielle et piston du compresseur surpresseur Le Roi CP48001 :
// CP48001-PISTON « COMPRESSOR CONNECTING ROD & PISTON » (page 304 ; trois par
// bloc, P288 en pose trois). Piston en alliage d'aluminium (1) à trois gorges
// (deux segments de compression, un segment racleur) et jupe percée du trou
// d'axe ; axe de piston creux (2) flottant dans deux bagues de bronze (3)
// serties dans les bossages ; segments (9, trousse : deux segments de
// compression et un racleur à deux lames et expandeur). Bielle à section en I
// (4) : pied fendu serré sur l'axe par une vis (7) et sa rondelle Grower (8),
// tête coupée en deux (chapeau) tenue par deux vis (5) et écrous (6),
// coussinets en deux demi-coquilles (10, une ligne = la paire).
// Repère de cylindre (_moteur_surpresseur.js) : origine sur l'axe du
// vilebrequin, au droit du cylindre ; Y le long de l'axe du cylindre vers la
// culasse ; X le long du vilebrequin (axe de piston et maneton parallèles à
// X). Option { crank, i } : angle du maneton dans le repère du bloc (rad,
// depuis +Y vers +Z, défaut LR.crank = 0) et numéro du cylindre (0, 1, 2 ;
// défaut 1, cylindre central) ; l'angle du maneton dans ce repère vaut
// phi = crank − LR.cyl[i].a : maneton en (0, R cos phi, R sin phi), bielle
// inclinée vers l'axe du piston (lrRod). Au PMH (phi = 0) : dessus du piston à
// y = 0.273, bas de la tête de bielle à y ≈ −0.004.
// Encombrement au PMH ≈ 0.089 (Ø piston) × 0.277 (y −0.004 → 0.273) × 0.089 m.
// Cotes estimées (dessin non coté) : alésage 3 1/2 po, course 3 po, entraxe
// 0,19 m (LR), axe Ø 3/4 po, maneton Ø 45 mm, vis de bielle 5/16 po.

import { LR, IN, MM, lrRod } from './_moteur_surpresseur.js';

export default function P304(api, opts = {}) {
  const { THREE, S } = api;
  const { lathe, slotted, roundHole, shell, ring, extrude, box, bolt, nut, washer, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  const crank = opts.crank ?? LR.crank;
  const ci = opts.i ?? 1;
  const phi = crank - LR.cyl[ci].a;
  const { cY, cZ, pinY, beta } = lrRod(phi);
  const L = LR.rod;
  const d = [0, Math.cos(beta), Math.sin(beta)]; // axe de la bielle (tête → pied)
  const along = (k) => d.map((v) => v * k);

  // ---------------------------------------------------------------- 1 — piston
  const rP = LR.bore / 2 - 0.1 * MM;
  const yc = pinY + LR.pinToCrown; // dessus du piston
  const yk = pinY - 40 * MM; // bas de la jupe
  const yr = yc - 27 * MM; // bas de la zone des segments
  const rIn = rP - 4.5 * MM;
  // Tête : dessus légèrement bombé, trois gorges (2,5 / 2,5 / 4 mm), cavité.
  const grooves = [[yc - 7 * MM, 2.5 * MM], [yc - 13 * MM, 2.5 * MM], [yc - 20.5 * MM, 4 * MM]];
  const head = [[rIn, yr], [rP, yr]];
  for (const [g, w] of grooves.slice().reverse()) {
    head.push([rP, g - w / 2], [rP - 3.6 * MM, g - w / 2], [rP - 3.6 * MM, g + w / 2], [rP, g + w / 2]);
  }
  head.push([rP, yc - 1 * MM], [rP - 1 * MM, yc], [rP * 0.6, yc + 0.6 * MM], [0, yc + 0.8 * MM], [0, yc - 9 * MM],
    [rIn - 4 * MM, yc - 9 * MM], [rIn, yc - 13 * MM], [rIn, yr]);
  const crown = lathe(head, 'castAlu', { seg: 32 });
  // Jupe percée des deux trous d'axe (Ø des bagues).
  const skirt = slotted(rP, rIn, yk, yr, roundHole(Math.PI / 2, pinY, 11.6 * MM, rP, { through: true, steps: 5 }), 'castAlu', { seg: 32 });
  // Bossages d'axe (le long de X) et voiles qui les relient à la tête.
  const bosses = [], webs = [];
  for (const s of [-1, 1]) {
    const x0 = 12.5 * MM, x1 = rIn + 1 * MM;
    bosses.push(at(shell(15 * MM, 11.6 * MM, x1 - x0, 'castAlu', { axis: 'x', seg: 28 }), [s * (x0 + x1) / 2, pinY, 0]));
    webs.push(box(5 * MM, yc - 9 * MM - pinY - 10 * MM, 16 * MM, 'castAlu', { pos: [s * (x0 + 4 * MM), (yc - 9 * MM + pinY + 10 * MM) / 2, 0] }));
  }
  P('1', merged([crown, skirt, ...bosses, ...webs], 'castAlu'), [0, 0.13, 0]);

  // ---------------------------------------------------------------- 9 — segments (trousse)
  const rings = [];
  for (const [g, w] of grooves.slice(0, 2)) rings.push(ring(rP + 0.05 * MM, rP - 3.4 * MM, w - 0.1 * MM, 'steel', { seg: 28, pos: [0, g, 0] }));
  const [go, wo] = grooves[2];
  const rails = [-1, 1].map((s) => ring(rP + 0.05 * MM, rP - 3 * MM, 0.6 * MM, 'chrome', { seg: 28, pos: [0, go + s * (wo / 2 - 0.4 * MM), 0] }));
  const expander = ring(rP - 1.2 * MM, rP - 3.4 * MM, wo - 1.8 * MM, 'steel', { seg: 28, pos: [0, go, 0] });
  P('9', group(merged(rings.concat(expander), 'darkSteel'), merged(rails, 'chrome')), [0, 0.22, 0]);

  // ---------------------------------------------------------------- 2 — axe de piston
  // Creux, Ø 3/4 po, bouts chanfreinés, le long de X.
  const rPin = 0.375 * IN;
  const pin = lathe([[6 * MM, -38 * MM], [rPin - 0.8 * MM, -38 * MM], [rPin, -37.2 * MM], [rPin, 37.2 * MM],
    [rPin - 0.8 * MM, 38 * MM], [6 * MM, 38 * MM], [6 * MM, -38 * MM]], 'chrome', { seg: 28 });
  pin.rotation.z = -Math.PI / 2;
  P('2', at(group(pin), [0, pinY, 0]), [0.1, 0.13, 0]);

  // ---------------------------------------------------------------- 3 — bagues d'axe (2)
  for (const s of [-1, 1]) {
    P('3', at(shell(11.6 * MM, rPin + 0.05 * MM, 21 * MM, 'brass', { axis: 'x', seg: 28 }), [s * 23.5 * MM, pinY, 0]), [s * 0.06, 0.13, 0]);
  }

  // ---------------------------------------------------------------- bielle
  // Repère de bielle : origine au centre de la tête, +Y vers le pied (axe
  // d'axe de piston à y = L), +Z en travers, épaisseur selon X.
  const place = (obj) => at(group(obj), [0, cY, cZ], [beta, 0, 0]);
  // Profil (z, y) extrudé selon X sur l'épaisseur t.
  const side = (pts, t, mat, holes = []) => {
    const m = extrude(pts, t, mat, { holes });
    m.rotation.y = -Math.PI / 2;
    return group(m);
  };
  const arc = (r, a0, a1, n, cz = 0, cy = 0) => Array.from({ length: n + 1 }, (_, k) => {
    const a = a0 + ((a1 - a0) * k) / n;
    return [cz + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  const rBe = LR.pinR + 2.2 * MM; // alésage de la tête (dos des coussinets)
  const rBo = 35 * MM, zb = 31 * MM; // tête et entraxe des vis de bielle
  const wB = 26 * MM; // largeur de la tête
  // 4 — corps : demi-tête à deux bossages de vis, fût en I effilé, pied fendu.
  const upper = side([
    [zb + 7 * MM, 0], [zb + 7 * MM, 15 * MM], [zb + 4 * MM, 17 * MM], ...arc(rBo, 0.42, Math.PI - 0.42, 14),
    [-zb - 4 * MM, 17 * MM], [-zb - 7 * MM, 15 * MM], [-zb - 7 * MM, 0], ...arc(rBe, Math.PI, 0, 18),
  ], wB, 'steel');
  const yS = L - 30 * MM; // haut du fût, bas du pied
  const web = side([[13 * MM, 26 * MM], [8.5 * MM, yS], [-8.5 * MM, yS], [-13 * MM, 26 * MM]], 7 * MM, 'steel');
  const flanges = [-1, 1].map((s) => side([[s * 13 * MM, 26 * MM], [s * 8.5 * MM, yS], [s * 5 * MM, yS], [s * 9 * MM, 26 * MM]], 17 * MM, 'steel'));
  // Pied : œil serré sur l'axe, fente vers la tête, oreilles de serrage.
  const rEo = 16.5 * MM, wS = 22 * MM, slit = 0.8 * MM;
  const dS = Math.asin(slit / rPin);
  const eye = side([...arc(rEo, -Math.PI / 2 + 0.55, 3 * Math.PI / 2 - 0.55, 30, 0, L),
    [-12 * MM, L - 31 * MM], [-slit, L - 31 * MM],
    ...arc(rPin, -Math.PI / 2 - dS, -2.5 * Math.PI + dS, 32, 0, L), [slit, L - 31 * MM], [12 * MM, L - 31 * MM]], wS, 'steel');
  P('4', place(group(merged([upper, web, ...flanges, eye], 'steel'),
    // chapeau (même pièce : « ROD AND CAP »), sous le plan de coupe
    merged([side([[zb + 7 * MM, 0], ...arc(rBe, 0, -Math.PI, 18), [-zb - 7 * MM, 0], [-zb - 7 * MM, -14 * MM], [-zb - 3 * MM, -17 * MM],
      ...arc(rBo, Math.PI + 0.42, 2 * Math.PI - 0.42, 14), [zb + 3 * MM, -17 * MM], [zb + 7 * MM, -14 * MM]], wB, 'steel')], 'steel'))), along(-0.02));

  // ---------------------------------------------------------------- 5 / 6 — vis et écrous de bielle (2 + 2)
  // Vis 5/16 po, tête sur les bossages du corps, écrou sous le chapeau.
  const dB = 0.3125 * IN;
  for (const s of [-1, 1]) {
    P('5', place(at(bolt(dB, 42 * MM, 'blackOxide'), [0, 15 * MM, s * zb])), along(0.07));
    P('6', place(at(nut(0.5 * IN, 7 * MM, 'steel'), [0, -17 * MM - 3.5 * MM, s * zb])), along(-0.08));
  }

  // ---------------------------------------------------------------- 7 / 8 — vis de pied et rondelle Grower
  // Vis 1/4 po en travers des oreilles du pied (selon Z), tête côté +Z.
  const yC = L - 22 * MM;
  P('7', place(at(bolt(0.25 * IN, 30 * MM, 'blackOxide', { axis: 'z' }), [0, yC, 12 * MM + 1.6 * MM])), [0, 0, 0.08]);
  P('8', place(at(washer(5.5 * MM, 3.4 * MM, 1.6 * MM, 'blackOxide', { axis: 'z' }), [0, yC, 12 * MM + 0.8 * MM])), [0, 0, 0.055]);

  // ---------------------------------------------------------------- 10 — coussinets (paire)
  // Deux demi-coquilles de régule sur dos acier, le long de X.
  const half = (top) => slotted(rBe, LR.pinR + 0.05 * MM, -12 * MM, 12 * MM,
    [{ a: top ? Math.PI / 2 : -Math.PI / 2, w: Math.PI + 0.02, y0: -12 * MM, y1: 12 * MM }], 'zinc', { axis: 'x', seg: 36 });
  P('10', place(group(half(true), half(false))), [0, 0, -0.09]);

  return { view: { dir: [1, 0.35, 1.1] } };
}

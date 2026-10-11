// P300 — Cylindre du compresseur surpresseur Le Roi CP48001 : CP48001-CYLINDER
// « COMPRESSOR CYLINDER ASSEMBLY » (page 300, « 3 CYLINDERS REQUIRED » : un
// par cylindre, P288 en pose trois). Cylindre en fonte (2) : bride carrée de
// pied à quatre trous et centrage qui entre dans le carter, fût à dix
// ailettes de refroidissement (racine épaisse, bout arrondi) reliées par deux
// nervures verticales qui dessinent les « fenêtres » du dessin, bride ronde
// de tête (plan de joint de la culasse, quatre taraudages des vis de culasse
// P290 rep. 38). Joint de pied en fibre (3) et quatre vis H 3/8-16 × 1 1/4 po
// (1) qui serrent la bride sur le carter.
// Repère de cylindre (_moteur_surpresseur.js) : origine sur l'axe du
// vilebrequin, au droit du cylindre ; Y le long de l'axe du cylindre vers la
// culasse ; X le long du vilebrequin. Joint posé sur la portée du carter
// (y = LR.deck = 0.155), plan de joint de culasse à y = LR.headFace = 0.275.
// Encombrement 0.15 (bride de tête Ø 0,15) × 0.138 (y 0.137 au bas du
// centrage → 0.275) × 0.15 m.
// Cotes estimées (dessin non coté) : alésage 3 1/2 po, ailettes Ø 0,14 m,
// bride de pied 0,14 m de côté (vues des pages 282 et 288).

import { LR, IN, MM, lrPrism, lrRoundRect, lrCircle } from './_moteur_surpresseur.js';

export default function P300(api) {
  const { S } = api;
  const { lathe, bolt, box, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  const rB = LR.bore / 2;
  const tG = 0.8 * MM; // joint de pied
  const yb = LR.deck + tG; // dessous de la bride de pied
  const tF = 14 * MM; // épaisseur de la bride de pied
  const yf = yb + tF; // dessus de la bride de pied
  const ys = LR.deck - 18 * MM; // bas du centrage
  const rS = 50 * MM; // rayon du centrage (et de l'ouverture du carter)
  const tT = 13 * MM; // bride ronde de tête
  const yt = LR.headFace - tT;
  const rT = 75 * MM;
  const root = 52 * MM; // racine des ailettes
  const fb = LR.flangeBolt;
  const corners = [[fb, fb], [-fb, fb], [-fb, -fb], [fb, -fb]];

  // ---------------------------------------------------------------- 2 — cylindre
  // Fût de révolution creux : centrage, ailettes, bride de tête, puis retour
  // par l'alésage (lisible en coupe).
  const prof = [[rB, ys], [rS - 1 * MM, ys], [rS, ys + 1 * MM], [rS, yf], [root, yf + 1.5 * MM]];
  const nF = 10;
  const f0 = yf + 5 * MM, f1 = yt - 4 * MM;
  for (let k = 0; k < nF; k++) {
    const yc = f0 + ((f1 - f0) * k) / (nF - 1);
    prof.push(
      [root, yc - 2.2 * MM], [root + 2 * MM, yc - 1.8 * MM], [LR.finR - 1 * MM, yc - 1.25 * MM],
      [LR.finR, yc - 0.5 * MM], [LR.finR, yc + 0.5 * MM], [LR.finR - 1 * MM, yc + 1.25 * MM],
      [root + 2 * MM, yc + 1.8 * MM], [root, yc + 2.2 * MM],
    );
  }
  prof.push(
    [root, yt - 1.5 * MM], [root + 3 * MM, yt], [rT - 1 * MM, yt], [rT, yt + 1 * MM], [rT, LR.headFace - 1 * MM],
    [rT - 1 * MM, LR.headFace], [rB + 1.2 * MM, LR.headFace], [rB, LR.headFace - 1.2 * MM], [rB, ys],
  );
  const barrel = lathe(prof, 'castIron', { seg: 56 });
  // Bride de pied : carré à coins arrondis, quatre trous de vis, ouverture du fût.
  const foot = lrPrism(api, lrRoundRect(2 * LR.flange, 2 * LR.flange, 12 * MM, 5),
    [lrCircle(rS - 0.5 * MM, 40), ...corners.map(([x, z]) => lrCircle(5.2 * MM, 14, x, z))], yb, yf, 'castIron');
  // Congé entre bride et fût (bourrelet de fonderie).
  const fillet = lathe([[rS, yf], [root + 9 * MM, yf], [root + 4 * MM, yf + 2.5 * MM], [root, yf + 5 * MM], [rS, yf + 5 * MM], [rS, yf]], 'castIron', { seg: 48 });
  // Deux nervures verticales (côtés ±X) qui relient les ailettes.
  const ribL = LR.finR - 2 * MM - root + 1 * MM;
  const ribs = [-1, 1].map((sx) => box(ribL, f1 - f0 + 6 * MM, 5 * MM, 'castIron',
    { pos: [sx * (root - 0.5 * MM + ribL / 2), (f0 + f1) / 2, 0] }));
  // Bossages des quatre taraudages de culasse sous la bride de tête.
  const bosses = [];
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    const b = lathe([[0, yt - 9 * MM], [5.5 * MM, yt - 9 * MM], [7.5 * MM, yt], [0, yt]], 'castIron', { seg: 16 });
    b.position.set(LR.headBoltR * Math.cos(a), 0, LR.headBoltR * Math.sin(a));
    bosses.push(b);
  }
  P('2', merged([barrel, foot, fillet, ...ribs, ...bosses], 'castIron'), [0, 0.05, 0]);

  // ---------------------------------------------------------------- 3 — joint de pied
  const gasket = lrPrism(api, lrRoundRect(2 * LR.flange, 2 * LR.flange, 12 * MM, 5),
    [lrCircle(rS + 0.5 * MM, 40), ...corners.map(([x, z]) => lrCircle(5.5 * MM, 14, x, z))], LR.deck, yb, 'cream');
  P('3', gasket, [0, 0.015, 0]);

  // ---------------------------------------------------------------- 1 — vis de pied (4)
  // Vis H 3/8-16 × 1 1/4 po, tête sur la bride, tige dans le carter.
  for (const [x, z] of corners) {
    P('1', at(bolt(0.375 * IN, 1.25 * IN, 'steel'), [x, yf, z]), [0, 0.13, 0]);
  }

  return { view: { dir: [1, 0.55, 1.2] } };
}

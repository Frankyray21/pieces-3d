// P294 — Couvercle de pompe à huile du compresseur surpresseur Le Roi
// CP48001 : CP48001-0500A « COMPRESSOR OIL PUMP COVER ASSEMBLY » (page 294).
// Couvercle en fonte (1) : plateau rond à six trous de vis (16, avec rondelles
// Grower 17) qui ferme le logement de la pompe à palettes du flasque P302,
// centrage arrière et joint torique (15), bossage central percé qui reçoit le
// couvercle d'entrée d'huile (2) : disque à encoche et embout de raccord,
// tenu par six vis à métaux H #12-24 × 1 po (5) et rondelles Grower (6).
// Repère du bloc (_moteur_surpresseur.js) : origine sur l'axe du vilebrequin
// au droit du cylindre central, +X vers la poulie, Y vers le haut ; face
// d'appui sur le moyeu du flasque P302 à x = LR.hubX = −0.176, le couvercle
// s'étend vers −X jusqu'à −0.215 (bout de l'embout).
// Encombrement 0.043 (X, −0.215 → −0.172) × 0.13 × 0.13 m.
// Cotes estimées (dessin non coté) : plateau Ø 0,13 m, vis 5/16 po sur
// Ø 0,104 m (moyeu Ø 0,12 m du flasque).

import { LR, IN, MM, lrPrism, lrCircle } from './_moteur_surpresseur.js';

export default function P294(api) {
  const { S } = api;
  const { lathe, bolt, washer, torus, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Lathe le long de X (profil [r, x]).
  const latheX = (prof, mat, seg = 48) => {
    const m = lathe(prof, mat, { seg });
    m.rotation.z = -Math.PI / 2;
    return group(m);
  };
  // Prisme d'axe X : contour [[y, z], …] de x = xa à xb.
  const prismX = (outline, holes, xa, xb, mat) => {
    const yz = (pts) => pts.map(([y, z]) => [-y, z]);
    const m = lrPrism(api, yz(outline), holes.map(yz), 0, xb - xa, mat);
    m.rotation.z = -Math.PI / 2;
    m.position.x = xa;
    return m;
  };

  const x0 = LR.hubX; // face d'appui
  const tF = 12 * MM;
  const xF = x0 - tF; // face extérieure du plateau
  const xB = xF - 8 * MM; // face du bossage central
  const R1 = 65 * MM, rB = 36 * MM;
  const ring6 = (r, ph = 0) => Array.from({ length: 6 }, (_, k) => {
    const a = ph + (k * Math.PI) / 3;
    return [r * Math.cos(a), r * Math.sin(a)];
  });
  const bolts = ring6(52 * MM, Math.PI / 6);
  const screws = ring6(27 * MM, Math.PI / 6);

  // ---------------------------------------------------------------- 1 — couvercle
  const body = latheX([
    [7 * MM, x0 + 4 * MM], [44 * MM, x0 + 4 * MM], [45 * MM, x0 + 3 * MM], [45 * MM, x0], [R1, x0],
    [R1, xF + 1.5 * MM], [R1 - 1.5 * MM, xF], [rB + 6 * MM, xF], [rB, xF - 3 * MM], [rB, xB + 1 * MM], [rB - 1 * MM, xB],
    [33 * MM, xB], [33 * MM, xB + 2 * MM], [7 * MM, xB + 2 * MM], [7 * MM, x0 + 4 * MM],
  ], 'castIron', 48);
  // Trous des vis du plateau (bagues sombres affleurantes = lamages).
  const spot = bolts.map(([y, z]) => at(latheX([[5 * MM, xF - 0.3 * MM], [8.5 * MM, xF - 0.3 * MM], [8.5 * MM, xF + 0.5 * MM], [5 * MM, xF + 0.5 * MM]], 'castIron', 16), [0, y, z]));
  P('1', merged([body, ...spot], 'castIron'), [-0.08, 0, 0]);

  // ---------------------------------------------------------------- 15 — joint torique du centrage
  P('15', torus(46.5 * MM, 1.6 * MM, 'rubber', { axis: 'x', pos: [x0 + 0.2 * MM, 0, 0] }), [-0.03, 0, 0]);

  // ---------------------------------------------------------------- 16 / 17 — vis du plateau et rondelles Grower (6 + 6)
  const tW = 2 * MM;
  for (const [y, z] of bolts) {
    P('17', washer(7.6 * MM, 4.2 * MM, tW, 'blackOxide', { axis: 'x', pos: [xF - tW / 2, y, z] }), [-0.13, 0, 0]);
    P('16', bolt(0.3125 * IN, 1.25 * IN, 'steel', { axis: '-x', pos: [xF - tW, y, z] }), [-0.17, 0, 0]);
  }

  // ---------------------------------------------------------------- 2 — couvercle d'entrée d'huile
  // Disque à encoche (vers le bas) et embout de raccord excentré.
  const xC = xB - 4 * MM;
  const disc = [];
  for (let k = 0; k <= 48; k++) {
    const a = Math.PI + 0.22 + ((2 * Math.PI - 0.44) * k) / 48;
    disc.push([33 * MM * Math.cos(a), 33 * MM * Math.sin(a)]);
  }
  disc.push([-26 * MM, 4 * MM], [-26 * MM, -4 * MM]);
  const plate = prismX(disc, screws.map(([y, z]) => lrCircle(2.9 * MM, 10, y, z)), xC, xB, 'castAlu');
  const nipple = at(latheX([[0, xC - 12 * MM], [4 * MM, xC - 12 * MM], [5 * MM, xC - 11 * MM], [5 * MM, xC - 8 * MM], [6.5 * MM, xC - 8 * MM], [6.5 * MM, xC + 0.5 * MM], [0, xC + 0.5 * MM]], 'castAlu', 20), [0, 9 * MM, 9 * MM]);
  P('2', merged([plate, nipple], 'castAlu'), [-0.1, 0, 0]);

  // ---------------------------------------------------------------- 5 / 6 — vis #12-24 × 1 po et rondelles Grower (6 + 6)
  const d12 = 0.216 * IN, tL = 1.4 * MM;
  for (const [y, z] of screws) {
    P('6', washer(4.6 * MM, 2.9 * MM, tL, 'blackOxide', { axis: 'x', pos: [xC - tL / 2, y, z] }), [-0.13, 0, 0]);
    P('5', bolt(d12, 1 * IN, 'steel', { axis: '-x', pos: [xC - tL, y, z] }), [-0.16, 0, 0]);
  }

  return { view: { dir: [-1.2, 0.5, 0.8] } };
}

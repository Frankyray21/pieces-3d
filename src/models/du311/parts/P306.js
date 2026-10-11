// P306 — Trousse de filtration d'huile du compresseur surpresseur Le Roi :
// CM48003 « COMPRESSOR OIL FILTER KIT » (photo page 306 ; ligne 33 de P282).
// Bloc filtre en fonte d'alu (1) sur son équerre (12) boulonnée sur le dessus
// du carter côté −Z, vers l'arrière ; cartouche vissée (9) sous le bloc sur
// le raccord adaptateur (2) ; clapet régulateur de pression (6, face −X),
// clapet anti-retour (7, face −Z, sortie coudée vers le haut), indicateur de
// colmatage différentiel (8, dessus), raccord coudé (11, dessus). Deux
// flexibles 3/8 po (hors liste, dessinés avec la ligne 11) descendent le long
// de l'arrière jusqu'au couvercle d'entrée d'huile à deux orifices (4) et son
// joint torique (10), qui remplace le couvercle P294 rep. 2 (même n°
// CM48003-004) sur le couvercle de pompe.
// Repère du bloc (_moteur_surpresseur.js, inséré à l'origine par P282) :
// origine sur l'axe du vilebrequin au droit du cylindre central, +X vers la
// poulie, Y vers le haut, +Z = X × Y. Bloc x −0.18 → −0.10, y 0.19 → 0.255,
// z −0.19 → −0.11 ; cartouche Ø 74 mm d'axe (x −0.145, z −0.16), de y 0.105
// à 0.183 (au-dessus du pan −Z du carter et en arrière du cylindre à −60°) ;
// couvercle d'entrée à x −0.196 → −0.200 sur l'axe du vilebrequin.
// Encombrement ≈ 0.17 (X, −0.265 aux flexibles → −0.10) × 0.33 × 0.26 m.
// Cotes estimées d'après la photo de la page 306 et les vues de P282.

import { LR, IN, MM, lrPrism, lrCircle } from './_moteur_surpresseur.js';

export default function P306(api) {
  const { S } = api;
  const { lathe, box, bolt, hose, torus, cyl, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  const bx0 = -0.18, bx1 = -0.10, by0 = 0.19, by1 = 0.255, bz0 = -0.19, bz1 = -0.11;
  const cx = -0.145, cz = -0.16; // axe de la cartouche

  // ---------------------------------------------------------------- 1 — bloc filtre
  const blk = merged([
    box(bx1 - bx0, by1 - by0, bz1 - bz0, 'grey', { r: 3 * MM, pos: [(bx0 + bx1) / 2, (by0 + by1) / 2, (bz0 + bz1) / 2] }),
    // Portée de la cartouche sous le bloc.
    lathe([[0, by0 - 2 * MM], [36 * MM, by0 - 2 * MM], [38 * MM, by0], [0, by0]], 'grey', { seg: 36, pos: [cx, 0, cz] }),
    // Bossages taraudés des orifices.
    cyl(11 * MM, 3 * MM, 'grey', { axis: 'x', pos: [bx0 - 1.5 * MM, 0.235, -0.17] }),
    cyl(11 * MM, 3 * MM, 'grey', { axis: 'z', pos: [-0.12, 0.22, bz0 - 1.5 * MM] }),
  ], 'grey');
  P('1', blk, [0, 0.1, 0]);

  // ---------------------------------------------------------------- 2 — raccord adaptateur (mamelon fileté)
  P('2', lathe([[6 * MM, by0 - 16 * MM], [11 * MM, by0 - 16 * MM], [11 * MM, by0 + 4 * MM], [6 * MM, by0 + 4 * MM], [6 * MM, by0 - 16 * MM]], 'steel', { seg: 20, pos: [cx, 0, cz] }), [0, -0.05, 0]);

  // ---------------------------------------------------------------- 9 — cartouche vissée
  const yT = by0 - 2 * MM, yB = 0.105, R = 37 * MM;
  P('9', group(
    lathe([[0, yB + 4 * MM], [R - 6 * MM, yB], [R - 2 * MM, yB + 1.5 * MM], [R, yB + 6 * MM], [R, yT - 8 * MM], [R + 0.8 * MM, yT - 6 * MM], [R + 0.8 * MM, yT - 3 * MM], [R - 1 * MM, yT - 1 * MM], [0, yT - 1 * MM]], 'white', { seg: 40, pos: [cx, 0, cz] }),
    lathe([[11 * MM, yT - 1.2 * MM], [R - 3 * MM, yT - 1.2 * MM], [R - 3 * MM, yT], [11 * MM, yT], [11 * MM, yT - 1.2 * MM]], 'rubber', { seg: 32, pos: [cx, 0, cz] }),
  ), [0, -0.13, 0]);

  // ---------------------------------------------------------------- 12 — équerre du bloc
  // Aile verticale contre la face +Z du bloc (deux vis), semelle sur le dessus
  // du carter (deux vis), en tôle d'acier peinte.
  const D = LR.deck, t = 6 * MM;
  P('12', group(
    merged([
      box(0.07, by1 - 0.005 - D, t, 'grey', { pos: [-0.14, (by1 - 0.005 + D) / 2, bz1 + t / 2] }),
      box(0.035, t, -0.05 - bz1, 'grey', { pos: [-0.1225, D + t / 2, (bz1 - 0.05) / 2] }),
    ], 'grey'),
    merged([
      ...[-0.16, -0.12].map((x) => bolt(5 / 16 * IN, 20 * MM, 'steel', { axis: 'z', washer: true, pos: [x, 0.225, bz1 + t] })),
      ...[-0.07, -0.085].map((z) => bolt(5 / 16 * IN, 20 * MM, 'steel', { washer: true, pos: [-0.1225, D + t, z] })),
    ], 'steel'),
  ), [0, 0, 0.08]);

  // Pièces tournées dessinées le long de +Y, orientées vers −X / −Z / +Y.
  const ROT = { '-x': [0, 0, Math.PI / 2], '-z': [-Math.PI / 2, 0, 0], '+y': [0, 0, 0] };
  const on = (obj, pos, d) => at(group(obj), pos, ROT[d]);
  // Coude 90° : écrou de raccordement, corps, sortie vers +X local (tourné ensuite).
  const elbow = (mat) => group(
    lathe([[0, 0], [8 * MM, 0], [8 * MM, 7 * MM], [0, 7 * MM]], mat, { seg: 6 }),
    lathe([[0, 7 * MM], [6 * MM, 7 * MM], [6 * MM, 22 * MM], [0, 22 * MM]], mat, { seg: 16 }),
    at(lathe([[0, 0], [5.5 * MM, 0], [5.5 * MM, 14 * MM], [0, 14 * MM]], mat, { seg: 16 }), [0, 17 * MM, 0], [0, 0, -Math.PI / 2]),
  );

  // ---------------------------------------------------------------- 6 — clapet régulateur de pression (face −X)
  P('6', on(group(
    lathe([[0, 0], [9.5 * MM, 0], [9.5 * MM, 12 * MM], [0, 12 * MM]], 'brass', { seg: 6 }),
    lathe([[0, 12 * MM], [7 * MM, 12 * MM], [7 * MM, 27 * MM], [5 * MM, 29 * MM], [0, 29 * MM]], 'brass', { seg: 20 }),
    lathe([[0, 29 * MM], [4.5 * MM, 29 * MM], [4.5 * MM, 34 * MM], [0, 34 * MM]], 'steel', { seg: 6 }),
  ), [bx0 - 3 * MM, 0.235, -0.17], '-x'), [-0.08, 0, 0]);

  // ---------------------------------------------------------------- 7 — clapet anti-retour (face −Z), sortie coudée vers le haut
  const cvOut = [-0.12, 0.22 + 17 * MM, bz0 - 3 * MM - 30 * MM];
  P('7', group(
    on(group(
      lathe([[0, 0], [9.5 * MM, 0], [9.5 * MM, 10 * MM], [0, 10 * MM]], 'brass', { seg: 6 }),
      lathe([[0, 10 * MM], [8 * MM, 10 * MM], [8 * MM, 24 * MM], [0, 24 * MM]], 'brass', { seg: 20 }),
      lathe([[0, 24 * MM], [9.5 * MM, 24 * MM], [9.5 * MM, 30 * MM], [0, 30 * MM]], 'brass', { seg: 6 }),
    ), [-0.12, 0.22, bz0 - 3 * MM], '-z'),
    lathe([[0, 0], [5.5 * MM, 0], [5.5 * MM, 17 * MM], [0, 17 * MM]], 'brass', { seg: 16, pos: [cvOut[0], 0.22, cvOut[2] + 6 * MM] }),
  ), [0, 0, -0.08]);

  // ---------------------------------------------------------------- 8 — indicateur de colmatage (dessus)
  P('8', on(group(
    lathe([[0, 0], [11 * MM, 0], [11 * MM, 9 * MM], [0, 9 * MM]], 'steel', { seg: 6 }),
    lathe([[0, 9 * MM], [9 * MM, 9 * MM], [9 * MM, 20 * MM], [0, 20 * MM]], 'brass', { seg: 24 }),
    lathe([[0, 20 * MM], [7.5 * MM, 20 * MM], [7.5 * MM, 26 * MM], [5 * MM, 29 * MM], [0, 29.5 * MM]], 'glass', { seg: 24 }),
    lathe([[0, 20 * MM], [4 * MM, 20 * MM], [4 * MM, 25 * MM], [0, 25 * MM]], 'red', { seg: 16 }),
  ), [-0.165, by1, -0.125], '+y'), [0, 0.15, 0]);

  // ---------------------------------------------------------------- 4 / 10 — couvercle d'entrée d'huile à deux orifices, joint torique
  // Même place que P294 rep. 2 : disque à encoche x −0.196 → −0.200.
  const xC = LR.hubX - 20 * MM; // face du bossage du couvercle de pompe
  const disc = [];
  for (let k = 0; k <= 48; k++) {
    const a = Math.PI + 0.22 + ((2 * Math.PI - 0.44) * k) / 48;
    disc.push([33 * MM * Math.cos(a), 33 * MM * Math.sin(a)]);
  }
  disc.push([-26 * MM, 4 * MM], [-26 * MM, -4 * MM]);
  const yz = (pts) => pts.map(([y, z]) => [-y, z]);
  const plate = lrPrism(api, yz(disc), [], 0, 4 * MM, 'castAlu');
  plate.rotation.z = -Math.PI / 2;
  plate.position.x = xC - 4 * MM;
  const ports = [[15 * MM, -10 * MM], [15 * MM, 12 * MM]];
  const bosses = ports.map(([y, z]) => on(lathe([[0, 0], [8 * MM, 0], [8 * MM, 6 * MM], [0, 6 * MM]], 'castAlu', { seg: 20 }), [xC - 4 * MM, y, z], '-x'));
  P('4', merged([plate, ...bosses], 'castAlu'), [-0.1, 0, 0]);
  P('10', torus(29 * MM, 1.3 * MM, 'rubber', { axis: 'x', pos: [xC - 0.3 * MM, 0, 0] }), [-0.06, 0, 0]);

  // ---------------------------------------------------------------- 11 — raccord coudé (dessus) et flexibles
  // Coude sur le dessus du bloc, sortie vers l'arrière ; deux flexibles 3/8 po
  // (hors liste) : coude 11 et sortie du clapet 7 → orifices du couvercle 4.
  const elTop = [-0.125, by1, -0.165];
  const el = on(elbow('steel'), elTop, '+y');
  el.rotation.y = Math.PI; // sortie vers −X
  const pEnd = (y, z) => [xC - 27 * MM, y, z];
  const portEl = ports.map(([y, z]) => on(elbow('steel'), [xC - 10 * MM, y, z], '-x'));
  const hA = hose([[elTop[0] - 14 * MM, elTop[1] + 17 * MM, elTop[2]], [-0.2, by1 + 0.03, -0.16], [-0.245, 0.17, -0.09], [-0.245, 0.06, -0.03], pEnd(ports[0][0] + 14 * MM, ports[0][1])], 7.5 * MM);
  const hB = hose([[cvOut[0], 0.22 + 17 * MM, cvOut[2] + 6 * MM], [cvOut[0] - 0.03, 0.29, cvOut[2] + 0.01], [-0.23, 0.25, -0.17], [-0.26, 0.12, -0.06], [-0.255, 0.05, 0.005], pEnd(ports[1][0] + 14 * MM, ports[1][1])], 7.5 * MM);
  P('11', group(el, ...portEl, hA, hB), [0, 0.18, 0]);

  return { view: { dir: [-1.1, 0.6, -1.0] } };
}

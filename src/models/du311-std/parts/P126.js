// P126 — Bras de pivot CX036560 rév. 0 (page 126) : « ASSY, PIVOT ARM ».
// Levier calé en haut de l'arbre du bras de tige (P116) par la bague de
// réglage cannelée (8 de P116), au-dessus du moyeu du bras pivotant haut ; le
// vérin P122 le fait tourner avec l'arbre et les bras de serrage :
// - bras de pivot à bague (3) : moyeu tube Ø 4 3/4 × 3 po garni d'une bague
//   bronze, chape à deux joues de 3/4 po (œil de tige du vérin à 0.145 m de
//   l'axe) soudée sur le moyeu avec un gousset côté opposé au vérin, bloc de
//   butée taraudé à l'arrière, platine de traversée des flexibles des
//   mâchoires ;
// - axe Ø 1 × 3 po à plaquette (2) arrêté par une vis 3/8 × 3/4 (5) et une
//   rondelle (8) ;
// - deux vis de butée carrées 3/4 × 2 1/2 (6), contre-écrous (9) et
//   rondelles (7) : réglage des fins de course du bras ;
// - cinq coudes de traversée JIC -06 (4) sur la platine ; graisseur 1/8 NPT
//   (1) sur le moyeu.
// Repère : axe de l'arbre du bras à l'origine, dessous du moyeu à y = 0, Y
// vers le haut ; +X vers l'axe de l'œil de tige du vérin (x = 0.145 m,
// y = 0.036 m) ; le vérin arrive côté -Z. Encombrement ≈ 0.29 × 0.10 × 0.26 m.
// Cotes : vis et raccords de la liste ; rayon du levier tiré de la course du
// vérin (6 1/8 po pour 71.5° de rotation des bras) ; moyeu et chape à
// l'échelle de l'axe Ø 1 po sur l'éclaté de P126.
import { u, ARMCYL, arc, prism, rrect, tabPin, boltStack, place, sqss, nut, nordLock, fitBulkhead, greaseNipple, flangedBushing } from './_carousel.js';

export const PIVOT126 = { hubR: u(2.375), hubH: u(3.0), pinX: ARMCYL.lever, pinY: 0.036 };

export default function P126(api) {
  const { S } = api;
  const { group, merged, at, weld } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { hubR, hubH, pinX, pinY } = PIVOT126;
  const gap = u(1.3), ct = u(0.75);
  const y1 = pinY - gap / 2, y2 = pinY + gap / 2;

  // ================================================ 3 — bras de pivot à bague
  const R = u(1.4);
  const cheek = [[0.035, -0.05], ...arc(pinX, 0, R, -Math.PI / 2, Math.PI / 2, 12), [0.035, 0.05]];
  const pinHole = [[pinX, 0, u(0.52)]];
  const hub = S.lathe([[u(2.0), 0], [hubR - 0.001, 0], [hubR, 0.001], [hubR, hubH - 0.001], [hubR - 0.001, hubH], [u(2.0), hubH], [u(2.0), 0]], 'grey', { seg: 36 });
  // gousset vertical côté +Z (le vérin arrive par -Z)
  const gusset = prism(api, rrect(0.03, 0.03, pinX - R * 0.6, 0.042, 0.002, 2), y1, y2, 'grey');
  // bloc de butée à l'arrière (deux taraudages 3/4 po selon Z)
  const stop = prism(api, rrect(-hubR - u(1.4), -u(1.5), -hubR + u(0.3), u(1.5), 0.003, 2), u(0.75), u(2.25), 'grey');
  // platine de traversée (1/4 po) côté +Z, au pied du moyeu
  const plateOl = [...arc(0, 0, hubR - 0.004, 0.1, Math.PI - 0.1, 8), [-0.06, 0.13], [0.07, 0.13]];
  const bh = [[-0.04, 0.105], [-0.012, 0.115], [0.016, 0.115], [0.044, 0.105], [0.002, 0.085]];
  const plate = prism(api, plateOl, 0, u(0.25), 'grey', bh.map(([x, z]) => [x, z, u(0.34)]));
  const welds = [
    weld([[0.035, y1 - 0.001, -0.045], [0.035, y1 - 0.001, 0.045]], 0.006, 'grey'),
    weld([[0.035, y2 + ct + 0.001, -0.045], [0.035, y2 + ct + 0.001, 0.045]], 0.006, 'grey'),
    weld([[-hubR, u(2.3), -u(1.4)], [-hubR, u(2.3), u(1.4)]], 0.006, 'grey'),
  ];
  P('3', group(
    merged([hub, prism(api, cheek, y1 - ct, y1, 'grey', pinHole), prism(api, cheek, y2, y2 + ct, 'grey', pinHole), gusset, stop, plate], 'grey'),
    merged(welds, 'grey'),
    S.group(flangedBushing(api, u(1.75), u(2.0), hubH, u(2.0), 0.0005)),
  ), [0, 0.1, 0]);

  // 2 — axe de l'œil de tige, 5 + 8 — vis d'arrêt de la plaquette
  P('2', at(group(tabPin(api)), [pinX, y2 + ct, 0]), [0, 0.12, 0]);
  const pb = boltStack(api, [pinX + u(1.1), y2 + ct + u(0.25), 0], [0, 1, 0], 0.375, 0.75, { washer: 'lock' });
  P('8', pb.washer, [0, 0.15, 0]);
  P('5', pb.bolt, [0, 0.18, 0]);

  // 6, 7, 9 — vis de butée dans le bloc arrière, rondelle et contre-écrou sur chaque face
  const yS = u(1.5), xS = -hubR - u(0.55);
  for (const s of [-1, 1]) {
    const face = [xS, yS, s * u(1.5)];
    const d = [0, 0, s];
    const nlT = u(2 * Math.max(0.05, 0.75 * 0.11));
    P('7', place(api, nordLock(api, 0.75), face, d), [0, 0, s * 0.06]);
    P('9', place(api, nut(api, 0.75, { jam: true }), face.map((v, i) => v + d[i] * nlT), d), [0, 0, s * 0.1]);
    P('6', place(api, sqss(api, 0.75, 2.5), face.map((v, i) => v + d[i] * (nlT + u(0.45) + u(0.3))), d), [0, 0, s * 0.16]);
  }

  // 4 — coudes de traversée -06 sur la platine (nez tournés vers l'extérieur)
  for (const [x, z] of bh) {
    P('4', place(api, fitBulkhead(api, 6, 0.25), [x, u(0.25), z], [0, 1, 0], Math.atan2(-z, x)), [0, 0.08, 0.05]);
  }

  // 1 — graisseur sur le moyeu (côté +Z / -X)
  const ga = 2.4;
  P('1', place(api, greaseNipple(api), [hubR * Math.cos(ga), hubH * 0.55, hubR * Math.sin(ga)], [Math.cos(ga), 0, Math.sin(ga)]), [-0.04, 0, 0.04]);

  return { view: { dir: [0.6, 0.8, -1] } };
}

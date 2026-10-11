// P354 — Pompe électrique de remplissage d'huile 24 V, montage CX012936 rév. 6
// (page 354), repère 3 de P350. La pompe (1, P356) est tenue par son support
// (3, CX013312) : tôle de 1/4 po enfilée sur le moteur (« GUIDE 3 OVER
// ELECTRIC MOTOR ») et serrée contre la bride carrée par quatre vis H
// 1/4-20 × 1 1/4 po (6) et rondelles (5) qui remplacent, coin par coin, les
// vis CHC d'origine de la bride ; la tôle se prolonge vers le bas par une patte
// à boutonnière boulonnée sur le support de filtres P350. Le boîtier de
// bouton-poussoir de la pompe (4, CX028927) est vissé sur sa platine (2,
// CX013309), équerre fixée au flanc −X de la tôle 3. L'élément filtrant 1.1
// est celui de la pompe : l'objet de P356 est repris ici sous le repère 1.1.
// Repère : celui de P356 — origine au centre de la face de la bride côté
// moteur (= face arrière de la tôle 3), Y vers le haut, +Z le long du moteur
// vers ses bornes, X horizontal. Patte de fixation de la tôle 3 : boutonnière
// au centre de (0, −0.115, 0.003), face d'appui z = 0.00635 (côté moteur).
// Encombrement ≈ 0.20 (X) × 0.23 (Y) × 0.33 (Z) m.
import { RAC_IN as IN, racFactory } from './_porteur.js';
import { P356_FLANGE, P356_SCREW } from './P356.js';

const MM = 0.001;
const T = 0.25 * IN; // tôle du support 3

export default function P354(api) {
  const { S, THREE } = api;
  const { box, at, group, merged, lathe } = S;
  const F = racFactory(S);
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // 1 — pompe ; 1.1 — son élément filtrant, sorti du sous-ensemble.
  const pump = api.sub('P356');
  P('1', pump, [0, 0, -0.06]);
  const el = pump.userData.parts.find((p) => p.userData.partRef === '1');
  if (el) {
    pump.remove(el);
    pump.userData.parts.splice(pump.userData.parts.indexOf(el), 1);
    pump.updateMatrix();
    el.applyMatrix4(pump.matrix);
    P('1.1', el, [0, 0.16, -0.06]);
  }

  // 3 — support de pompe : tôle carrée percée Ø 84 (moteur) et de quatre trous,
  // prolongée vers le bas par une patte à boutonnière (vue de la page 354).
  const W = 120 * MM;
  const shape = new THREE.Shape();
  shape.moveTo(-W / 2, W / 2);
  shape.lineTo(W / 2, W / 2);
  shape.lineTo(W / 2, -W / 2);
  shape.lineTo(22 * MM, -W / 2 - 20 * MM);
  shape.lineTo(22 * MM, -135 * MM);
  shape.lineTo(-22 * MM, -135 * MM);
  shape.lineTo(-22 * MM, -W / 2 - 20 * MM);
  shape.lineTo(-W / 2, -W / 2);
  shape.closePath();
  const hole = (x, y, r) => new THREE.Path().absarc(x, y, r, 0, Math.PI * 2, true);
  shape.holes.push(hole(0, 0, 42 * MM));
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) shape.holes.push(hole(sx * P356_SCREW, sy * P356_SCREW, 3.6 * MM));
  const slot = new THREE.Path();
  slot.moveTo(-5 * MM, -108 * MM); slot.lineTo(5 * MM, -108 * MM); slot.lineTo(5 * MM, -122 * MM); slot.lineTo(-5 * MM, -122 * MM); slot.closePath();
  shape.holes.push(slot);
  const g3 = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false, curveSegments: 4 });
  P('3', merged([new THREE.Mesh(g3)], 'black'), [0, 0, 0.09]);

  // 5 — rondelles et 6 — vis H 1/4-20 × 1 1/4 po aux quatre coins de la bride.
  const d = 0.25 * IN;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    const pos = [sx * P356_SCREW, sy * P356_SCREW, T];
    P('5', at(group(F.washer(d)), pos, [Math.PI / 2, 0, 0]), [0, 0, 0.13]);
    P('6', at(group(F.bolt(d, 1.25 * IN)), [pos[0], pos[1], T + d * 0.16], [Math.PI / 2, 0, 0]), [0, 0, 0.17]);
  }

  // 2 — platine du boîtier : équerre de tôle 1/8 po vissée au flanc −X de la tôle 3.
  const xb = -W / 2;
  const flat = (w, h, d, pos) => at(new THREE.Mesh(new THREE.BoxGeometry(w, h, d)), pos);
  P('2', merged([
    flat(3.2 * MM, 70 * MM, 40 * MM, [xb - 1.6 * MM, 10 * MM, -20 * MM]),
    flat(75 * MM, 75 * MM, 3.2 * MM, [xb - 40 * MM, 10 * MM, -40 * MM]),
  ], 'black'), [-0.05, 0, 0]);

  // 4 — boîtier de bouton-poussoir : coffret gris 70 × 70 × 55 mm, couvercle
  // vissé, bouton vert à collerette, presse-étoupe dessous.
  const box4 = group(
    merged([
      box(70 * MM, 70 * MM, 50 * MM, 'grey', { pos: [0, 0, -25 * MM] }),
      box(66 * MM, 66 * MM, 5 * MM, 'grey', { pos: [0, 0, -52 * MM] }),
    ], 'grey'),
    merged([
      ...[-1, 1].flatMap((sx) => [-1, 1].map((sy) => lathe([[0, 0], [3 * MM, 0], [3 * MM, 1.5 * MM], [0, 1.5 * MM]], 'steel', { axis: '-z', seg: 6, pos: [sx * 28 * MM, sy * 28 * MM, -54.5 * MM] }))),
    ], 'steel'),
    merged([
      lathe([[0, 0], [14 * MM, 0], [14 * MM, 4 * MM], [0, 4 * MM]], 'black', { axis: '-z', seg: 12, pos: [0, 0, -54.5 * MM] }),
      lathe([[0, 0], [6 * MM, 0], [6 * MM, 10 * MM], [4 * MM, 12 * MM], [0, 12 * MM]], 'black', { axis: '-y', seg: 10, pos: [0, -35 * MM, -25 * MM] }),
    ], 'black'),
    lathe([[0, 0], [10 * MM, 0], [10 * MM, 9 * MM], [8 * MM, 11 * MM], [0, 11 * MM]], 'green', { axis: '-z', seg: 12, pos: [0, 0, -58 * MM] }),
  );
  P('4', at(box4, [xb - 40 * MM, 10 * MM, -41.6 * MM]), [-0.05, 0, -0.08]);

  return { view: { dir: [0.6, 0.7, 1] } };
}

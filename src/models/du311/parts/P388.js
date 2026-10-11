// P388 — Traversée de raccordement DA101 / DA201 CX035831 rév. 0 (page 388),
// repère 46 du porteur P328. Cornière de tôle 1/4 po (sans repère dans la
// liste, dessinée pour porter les pièces) : âme verticale 9 × 4 po à coins
// hauts arrondis, aile d'appui horizontale de 2 1/2 po vers l'arrière ; trois
// manchons NPT soudés au travers de l'âme (deux 3/4 NPT aux extrémités, un
// 3/8 NPT au centre). Côté avant (orifices des raccords rapides), bouchons
// trempés 3/4 NPT (6) et 3/8 NPT (5) ; côté arrière, coudes 45° 3/4 NPT / JIC
// -12 (4) et 3/8 NPT / JIC -06 (3), sorties vers le haut ; étiquette ISO des
// orifices (2) collée en bas de la face avant.
// Repère : origine au centre de la face inférieure de l'aile d'appui, Y vers
// le haut, X le long de la cornière, +Z vers l'avant (face de l'âme côté
// bouchons, à z = +1 1/4 po). Encombrement ≈ 0.23 (X) × 0.11 (Y) × 0.11 (Z) m.
import { RAC_IN as IN, racFactory, racPose } from './_porteur.js';

const T = 0.25 * IN, LEN = 9 * IN, HT = 4 * IN, FL = 2.5 * IN;
const ZF = FL / 2; // face avant de l'âme
const HOLES = [[-3.0 * IN, 2.9 * IN, 12], [0, 2.3 * IN, 6], [3.0 * IN, 1.9 * IN, 12]];

export default function P388(api) {
  const { S, THREE } = api;
  const { lathe, merged, group, at, box } = S;
  const F = racFactory(S);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const npt = { 6: 0.675, 12: 1.05 };

  // Cornière (sans repère) : âme à coins hauts arrondis, aile, manchons soudés.
  const r = 0.5 * IN;
  const sh = new THREE.Shape();
  sh.moveTo(-LEN / 2, 0); sh.lineTo(LEN / 2, 0); sh.lineTo(LEN / 2, HT - r);
  sh.quadraticCurveTo(LEN / 2, HT, LEN / 2 - r, HT); sh.lineTo(-LEN / 2 + r, HT);
  sh.quadraticCurveTo(-LEN / 2, HT, -LEN / 2, HT - r); sh.closePath();
  for (const [x, y, d] of HOLES) sh.holes.push(new THREE.Path().absarc(x, y, (npt[d] * IN) / 2 * 1.2, 0, Math.PI * 2, true));
  const web = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: false, curveSegments: 3 });
  web.translate(0, 0, ZF - T);
  const plate = merged([
    new THREE.Mesh(web),
    at(new THREE.Mesh(new THREE.BoxGeometry(LEN, T, FL)), [0, T / 2, 0]),
  ], 'lightGrey');
  // Manchons : 3/4 NPT Ø 1,30 po, 3/8 NPT Ø 0,875 po, saillie 0,6 po de part et d'autre.
  const sleeves = [], bores = [];
  for (const [x, y, d] of HOLES) {
    const ro = d === 12 ? 0.65 * IN : 0.44 * IN, ri = (npt[d] * IN) / 2 * 0.95, s = 0.6 * IN;
    sleeves.push(lathe([[ri, -s - T], [ro, -s - T], [ro, s], [ri, s]], 'steel', { axis: 'z', seg: 14, pos: [x, y, ZF] }));
    bores.push(lathe([[ri, -T], [ri, s]], 'blackOxide', { axis: 'z', seg: 12, pos: [x, y, ZF] }));
  }
  const bracket = group(plate, merged(sleeves, 'steel'), merged(bores, 'blackOxide'));

  // 2 — étiquette ISO des orifices (alu blanc imprimé, symboles noirs).
  const ink = [];
  for (const [x, w] of [[-3.3, 0.3], [-0.2, 0.35], [0.15, 0.35], [2.6, 0.25], [1.4, 0.8]]) {
    ink.push(at(new THREE.Mesh(new THREE.BoxGeometry(w * IN, (x === 1.4 ? 0.08 : 0.3) * IN, 0.0002)), [x * IN, 0.8 * IN, ZF + 0.0007]));
  }
  const label = group(
    merged([at(new THREE.Mesh(new THREE.BoxGeometry(8.2 * IN, 0.7 * IN, 0.0006)), [0, 0.8 * IN, ZF + 0.0003])], 'white'),
    merged(ink, 'black'),
  );
  P('2', label, [0, 0, 0.05]).parent.add(bracket);

  // Bouchons (avant) et coudes 45° (arrière).
  for (const [x, y, d] of HOLES) {
    const s = 0.6 * IN;
    P(d === 12 ? '6' : '5', racPose(THREE, F.nptPlugHex(d), [x, y, ZF + s], [0, 0, 1]), [0, 0, 0.07]);
    P(d === 12 ? '4' : '3', racPose(THREE, F.elbow({ port: 'npt', pd: d, jd: d, angle: 45 }), [x, y, ZF - T - s], [0, 0, -1], [0, 1, 0]), [0, 0, -0.07]);
  }

  return { view: { dir: [0.7, 0.6, 1.2] } };
}

// P408 — Clapet navette : CX038662 rév. 0 « ASSY, SHUTTLE VALVE » (page 408),
// repère 33 du porteur P208. Clapet navette à cartouche (1, CP001374) : bloc
// d'acier zingué 1 1/2 × 2 1/4 × 1 1/2 po, cartouche vissée dessus (bouchon
// six-pans 1 1/8 po sur son siège rond), trois orifices ORB -06 portant
// chacun un coude 90° MORB -06 → JIC -06 (2) : flanc gauche (sortie vers le
// bas), haut du flanc droit (sortie vers le haut), bas de la façade (sortie
// vers +X) ; deux vis H 5/16-18 × 1 3/4 po (3) et rondelles Nord-Lock (4)
// traversent le bloc d'avant en arrière.
// Repère machine (layout.js), posé à l'identité par P208 : bloc vissé sur la
// face extérieure du flanc droit du châssis avant (dos à z = 0.495), centre
// du dos en (0.665, 0.56) (FB.shuttle de _frontb.js ; repère 33 de
// carrier.js). Châssis avant : corps « front » de la simulation.
import { FB, IN, orbElbow, orient, spotFace, boltAt, front } from './_frontb.js';

const W = 1.5 * IN, H = 2.25 * IN, D = 1.5 * IN;

export default function P408(api) {
  const { S } = api;
  const T = (obj) => { const g = S.group(obj); g.position.set(...FB.shuttle); return front(g); };
  const Pt = (ref, obj, e) => api.part(ref, T(obj), e);
  const ports = [
    { p: [-W / 2, -0.006, D / 2], d: [-1, 0, 0], side: [0, -1, 0], e: [-0.06, 0, 0] },
    { p: [W / 2, 0.014, 0.012], d: [1, 0, 0], side: [0, 1, 0], e: [0.06, 0, 0] },
    { p: [-0.006, -0.018, D], d: [0, 0, 1], side: [1, 0, 0], e: [0, 0, 0.06] },
  ];
  const bolts = [[-0.009, 0.012], [0.011, -0.004]];

  // 1 — clapet : bloc, siège et bouchon de cartouche, lamages.
  const steel = ports.map((q) => spotFace(api, 6, q.p, q.d));
  for (const [x, y] of bolts) steel.push(S.ring(0.0075, 0.0043, 0.0005, 'steel', { axis: 'z', seg: 16, pos: [x, y, D + 0.00025] }));
  steel.push(S.cyl(0.0165, 0.003, 'steel', { seg: 28, pos: [0, H / 2 + 0.0015, D / 2] }));
  steel.push(S.nut(1.125 * IN, 0.012, 'steel', { pos: [0, H / 2 + 0.009, D / 2] }));
  steel.push(S.lathe([[0, 0], [0.011, 0], [0.011, 0.002], [0.009, 0.0035], [0, 0.0035]], 'steel', { seg: 24, pos: [0, H / 2 + 0.015, D / 2] }));
  Pt('1', S.group(S.merged([S.box(W, H, D, 'zinc', { r: 0.0014, pos: [0, 0, D / 2] })], 'zinc'), S.merged(steel, 'steel')), [0, 0, 0.07]);
  for (const q of ports) Pt('2', orient(api, orbElbow(api, 6, 6).obj, q.p, q.d, q.side), q.e);
  for (const [x, y] of bolts) {
    const b = boltAt(api, 0.3125, 1.75, [x, y, D], [0, 0, 1], { washer: 'nl' });
    Pt('4', b.washer, [0, 0, 0.12]);
    Pt('3', b.bolt, [0, 0, 0.16]);
  }
  return { view: { dir: [0.7, 0.5, 1.1] } };
}

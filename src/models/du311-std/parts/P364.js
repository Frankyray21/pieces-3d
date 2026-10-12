// P364 — Collecteur de pression : CX034759 rév. 0 « ASSY, PRESSURE MANIFOLD,
// DU311 » (page 364), repère 17 du porteur P208. Bloc d'acier CP000407 (1,
// 5 1/2 × 2 1/2 × 2 1/2 po, voir _frontb.js) posé à plat sur une tablette du
// porteur, tenu par deux vis H 1/4-20 × 3 po (8) à rondelles Grower (9) qui le
// traversent de haut en bas entre les orifices du dessus. Raccords (trois vues
// de la page 364) : bout gauche (−X) coude 45° MORB -16 → JIC -16 (2) incliné
// vers le bas et l'arrière ; bout droit bouchon affleurant -16 (7) ; dessus :
// bouchon affleurant -12 (6) à gauche, coude 90° MORB -16 → JIC -12 (4) à
// droite, sortie vers l'extérieur (le dessin le pose sur un orifice de la
// taille -12 du bloc : six-pans du -16 conservé, d'après la liste) ; face
// extérieure : adaptateur droit -12 (5) à gauche, bouchon -12 (6) à droite ;
// face intérieure (côté flanc) : coude 90° MORB -12 → JIC -08 (3) à gauche,
// sortie vers l'arrière, bouchon -12 (6) à droite.
// Repère machine (layout.js), posé à l'identité par P208 : côté droit du
// châssis avant, au-dessus du tuyau d'air et du vérin de direction, bloc de
// x = 0.36 à 0.50, dessous à y = 0.92, face intérieure à z = 0.545 (FB.pressure
// de _frontb.js ; repère 17 de carrier.js). Châssis avant : corps « front ».
import { FB, M407, m407Ports, manifold407, orbAdapter, orbElbow, orbElbow45, orbPlugFlush, boltAt, orient, front } from './_frontb.js';

export default function P364(api) {
  const { S } = api;
  const T = (obj) => { const g = S.group(obj); g.position.set(...FB.pressure); return front(g); };
  const P = (ref, obj, e) => api.part(ref, T(obj), e);
  const q = m407Ports();
  const X = (k) => q[k].d.map((v) => v * 0.07);
  P('1', manifold407(api), [0, 0, 0]);
  P('2', orient(api, orbElbow45(api, 16, 16).obj, q.endL.p, q.endL.d, [0, -1, 0]), X('endL'));
  P('7', orient(api, orbPlugFlush(api, 16), q.endR.p, q.endR.d), X('endR'));
  for (const k of ['topL', 'frontR', 'backR']) P('6', orient(api, orbPlugFlush(api, 12), q[k].p, q[k].d), X(k));
  P('4', orient(api, orbElbow(api, 16, 12).obj, q.topR.p, q.topR.d, [0, 0, 1]), X('topR'));
  P('5', orient(api, orbAdapter(api, 12, 12).obj, q.frontL.p, q.frontL.d), X('frontL'));
  P('3', orient(api, orbElbow(api, 12, 8).obj, q.backL.p, q.backL.d, [-1, 0, 0]), X('backL'));
  for (const s of [-1, 1]) {
    const b = boltAt(api, 0.25, 3.0, [0, M407.H, s * M407.zb], [0, 1, 0]);
    P('9', b.washer, [0, 0.06, 0]);
    P('8', b.bolt, [0, 0.12, 0]);
  }
  return { view: { dir: [0.6, 0.7, 1.1] } };
}

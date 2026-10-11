// P366 — Collecteur de retour : CX034760 rév. 0 « ASSY, RETURN MANIFOLD,
// DU311 » (page 366), repère 18 du porteur P208. Même bloc d'acier CP000407
// (1) que le collecteur de pression (5 1/2 × 2 1/2 × 2 1/2 po, voir
// _frontb.js), posé à plat sur une tablette du porteur, deux vis H 1/4-20 ×
// 3 po (9) à rondelles Grower (10) verticales. Raccords (trois vues de la page
// 366) : bout gauche (−X) bouchon affleurant -16 (8) ; bout droit coude 90°
// MORB -16 → JIC -16 (4), sortie vers le haut ; dessus : bouchon affleurant
// -12 (7) à gauche, coude 90° MORB -12 → JIC -12 (2) à droite, sortie vers
// l'extérieur ; face extérieure : deux adaptateurs droits -12 (5) ; face
// intérieure (côté flanc) : adaptateur droit MORB -12 → JIC -06 (6) à gauche,
// coude 90° MORB -12 → JIC -08 (3) à droite, sortie vers l'avant (+X).
// Repère machine (layout.js), posé à l'identité par P208 : côté droit du
// châssis avant, bas du flanc devant les filtres, bloc de x = 0.93 à 1.07,
// dessous à y = 0.50, face intérieure à z = 0.545 (FB.ret de _frontb.js ;
// repère 18 de carrier.js). Châssis avant : corps « front » de la simulation.
import { FB, M407, m407Ports, manifold407, orbAdapter, orbElbow, orbPlugFlush, boltAt, orient, front } from './_frontb.js';

export default function P366(api) {
  const { S } = api;
  const T = (obj) => { const g = S.group(obj); g.position.set(...FB.ret); return front(g); };
  const P = (ref, obj, e) => api.part(ref, T(obj), e);
  const q = m407Ports();
  const X = (k) => q[k].d.map((v) => v * 0.07);
  P('1', manifold407(api), [0, 0, 0]);
  P('8', orient(api, orbPlugFlush(api, 16), q.endL.p, q.endL.d), X('endL'));
  P('4', orient(api, orbElbow(api, 16, 16).obj, q.endR.p, q.endR.d, [0, 1, 0]), X('endR'));
  P('7', orient(api, orbPlugFlush(api, 12), q.topL.p, q.topL.d), X('topL'));
  P('2', orient(api, orbElbow(api, 12, 12).obj, q.topR.p, q.topR.d, [0, 0, 1]), X('topR'));
  for (const k of ['frontL', 'frontR']) P('5', orient(api, orbAdapter(api, 12, 12).obj, q[k].p, q[k].d), X(k));
  P('6', orient(api, orbAdapter(api, 12, 6).obj, q.backL.p, q.backL.d), X('backL'));
  P('3', orient(api, orbElbow(api, 12, 8).obj, q.backR.p, q.backR.d, [1, 0, 0]), X('backR'));
  for (const s of [-1, 1]) {
    const b = boltAt(api, 0.25, 3.0, [0, M407.H, s * M407.zb], [0, 1, 0]);
    P('10', b.washer, [0, 0.06, 0]);
    P('9', b.bolt, [0, 0.12, 0]);
  }
  return { view: { dir: [0.6, 0.7, 1.1] } };
}

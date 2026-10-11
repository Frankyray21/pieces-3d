// P238 — Limiteur de pression CP006111 rév. 1 (page 238) : « PRESSURE RELIEF
// VALVE - STD S E - 6 », repère 4 du compartiment de service P234. Corps en
// fonte ductile (2) à deux orifices SAE -6 (2 en dessus, 1 en bout) et
// cartouche de limitation 150 psi (1) vissée dans la face opposée : six-pans
// de 7/8 po, fût, contre-écrou et vis de réglage à six-pans creux.
// Repère : origine au centre du corps, X selon l'axe de la cartouche (vissée
// sur la face −X), Y vers le haut (orifice 2), Z en travers (trous de
// fixation). Encombrement ≈ 0.10 (X, cartouche comprise) × 0.04 × 0.04 m ;
// corps 2 × 1 1/2 × 1 1/2 po (proportions de la vue de la page 238).
import { IN, u } from './_cab.js';

export default function P238(api) {
  const { S } = api;
  const { box, lathe, cyl, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const BX = u(2), BY = u(1.5), BZ = u(1.5);

  // ---------------------------------------------------------------- 2 — corps
  // Bloc usiné à arêtes cassées ; orifices SAE -6 (9/16-18) : lamage usiné,
  // taraudage sombre ; deux trous de fixation Ø 9/32 au travers (selon Z) ;
  // repères « 1 » et « 2 » frappés (petits bossages).
  const body = box(BX, BY, BZ, 'castIron', { r: 0.0012 });
  const spots = merged([
    lathe([[u(0.47), 0.0003], [u(0.29), 0.0003]], 'steel', { seg: 20, pos: [0, BY / 2, 0] }),
    at(lathe([[u(0.47), 0.0003], [u(0.29), 0.0003]], 'steel', { seg: 20 }), [BX / 2, 0, 0], [0, 0, -Math.PI / 2]),
    at(lathe([[u(0.62), 0.0003], [u(0.44), 0.0003]], 'steel', { seg: 20 }), [-BX / 2, 0, 0], [0, 0, Math.PI / 2]),
  ], 'steel');
  const holes = merged([
    lathe([[u(0.29), 0.0004], [0, 0.0004]], 'blackOxide', { seg: 16, pos: [0, BY / 2, 0] }),
    at(lathe([[u(0.29), 0.0004], [0, 0.0004]], 'blackOxide', { seg: 16 }), [BX / 2, 0, 0], [0, 0, -Math.PI / 2]),
    ...[-1, 1].flatMap((s) => [1, -1].map((k) => at(lathe([[u(0.14), 0.0004], [0, 0.0004]], 'blackOxide', { seg: 12 }), [s * u(0.6), 0, k * BZ / 2], [k * Math.PI / 2, 0, 0]))),
  ], 'blackOxide');
  const marks = merged([
    box(u(0.04), u(0.18), 0.0004, 'castIron', { pos: [u(0.55), u(0.25), BZ / 2 + 0.0002] }),
    box(u(0.14), u(0.04), 0.0004, 'castIron', { pos: [u(0.2), u(0.42), BZ / 2 + 0.0002] }),
    box(u(0.14), u(0.04), 0.0004, 'castIron', { pos: [u(0.2), u(0.3), BZ / 2 + 0.0002] }),
  ], 'castIron');
  P('2', group(body, spots, holes, marks), [0.03, 0, 0]);

  // ---------------------------------------------------------------- 1 — cartouche 150 psi
  // Le long de −X depuis la face du corps : six-pans 7/8, fût Ø 0,62, collet,
  // contre-écrou 9/16, vis de réglage Ø 0,31 à six-pans creux, joint torique.
  const x0 = -BX / 2;
  const cart = group(
    merged([
      lathe([[0, 0], [u(0.505), 0], [u(0.505), u(0.32)], [u(0.45), u(0.36)], [0, u(0.36)]], 'zinc', { seg: 6 }),
      lathe([[0, u(0.35)], [u(0.31), u(0.35)], [u(0.31), u(0.9)], [u(0.27), u(0.94)], [0, u(0.94)]], 'zinc', { seg: 18 }),
      lathe([[0, u(0.94)], [u(0.325), u(0.94)], [u(0.325), u(1.12)], [u(0.29), u(1.15)], [0, u(1.15)]], 'zinc', { seg: 6 }),
    ], 'zinc'),
    merged([
      lathe([[u(0.06), u(1.15)], [u(0.155), u(1.15)], ...S.thread(u(0.155), u(1.15), u(1.55), { maxTurns: 6, chamferBottom: false }), [u(0.14), u(1.6)], [u(0.07), u(1.6)], [u(0.07), u(1.5)], [0, u(1.5)]], 'steel', { seg: 14 }),
      lathe([[0, u(1.5)], [u(0.07), u(1.5)], [u(0.07), u(1.6)], [0, u(1.6)]], 'blackOxide', { seg: 6 }),
    ], 'steel'),
    S.torus(u(0.36), u(0.03), 'rubber', { pos: [0, u(0.01), 0] }),
  );
  cart.rotation.z = Math.PI / 2; // +Y local → −X
  cart.position.set(x0, 0, 0);
  P('1', cart, [-0.06, 0, 0]);
  void IN; void cyl;
  return { view: { dir: [0.6, 0.7, 1.2] } };
}

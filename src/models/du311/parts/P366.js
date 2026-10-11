// P366 — Arrivée d'eau CX030866 rév. 0 (page 366), repère 32 de P328 :
// tuyauterie 1 po NPT galvanisée de l'eau d'injection. Té d'entrée (9) avec
// adaptateur 45° NPT × JIC -16 (5) en bout et, sur sa dérivation, réduction
// six-pans 1 × 1/4 (7) et adaptateur 45° -04 (3) (prise du manomètre) ;
// mamelon 1 × 3 po (10), détendeur-filtre 1 po (2 : corps bronze, cloche à
// ressort, vis de réglage et contre-écrou, union de sortie, chapeau de tamis
// en dessous), mamelon 1 × 3 po (10), té (9) dont la dérivation monte par un
// mamelon court (11) vers un troisième té (9) : réduction 1 × 1/2 (8) et
// adaptateur 45° -08 (4) d'un côté, mamelon court (11) et robinet à bille 1 po
// (1) de l'autre ; le té du bas se prolonge par un mamelon court (11), un coude
// mâle-femelle 90° (6) et le second robinet à bille (1), tourné vers +Z.
// Repère : origine au centre du té d'entrée (axe de la conduite), X le long de
// la conduite (vers le détendeur), Y vers le haut (cloche du détendeur et
// dérivation montante), Z en travers (robinet du bas vers +Z). Encombrement
// 0.55 (X, de −0.09 à 0.46) × 0.26 (Y) × 0.21 (Z) m.
// Cotes : raccords 1 po NPT du commerce (tube Ø 33,4 mm, té 66 mm, mamelon
// court 38 mm, engagement des filets 17 mm), robinets 1 po, détendeur 1 po.
import { IN, kit } from './_porteur.js';

const RP = 0.0167; // rayon ext. du tube 1 po
const TE = 0.033; // demi-longueur d'un té 1 po
const ENG = 0.017; // engagement des filets
// Centres le long de X
const X9A = 0, X10A = TE - ENG + 0.038, XREG = 0.14, X9B = 0.28;
const Y9C = 0.07;
// Profil de sphère pour lathe() (rayon r, 6 méridiens).
const sphere = (r) => Array.from({ length: 7 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 6; return [Math.max(0, Math.cos(a) * r), Math.sin(a) * r]; });

export default function P366(api) {
  const { THREE, S } = api;
  const { lathe, cyl, box, ballValve, merged, group, at } = S;
  const T = kit(api);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const dirOf = { x: [1, 0, 0], '-x': [-1, 0, 0], y: [0, 1, 0], '-y': [0, -1, 0], z: [0, 0, 1], '-z': [0, 0, -1] };

  // Té 1 po en fonte malléable galvanisée : corps renflé, bourrelets des trois
  // embouts ; run selon X, dérivation selon branch.
  const tee = (branch) => {
    const end = (d) => T.toward(lathe([[RP, 0], [0.022, 0], [0.022, TE - 0.008], [0.024, TE - 0.006], [0.024, TE], [RP, TE], [RP, 0]], 'zinc', { seg: 10 }), dirOf[d]);
    return merged([end('x'), end('-x'), end(branch), lathe(sphere(0.0225), 'zinc', { seg: 10 })], 'zinc');
  };
  // Mamelon : tube avec filets apparents aux deux bouts (bandes de reflet).
  const nipple = (len) => lathe([
    [0.0133, -len / 2], [RP - 0.0008, -len / 2], ...S.thread(RP, -len / 2 + 0.001, -len / 2 + ENG, { pitch: 0.0022, maxTurns: 2 }),
    [RP, len / 2 - ENG], ...S.thread(RP, len / 2 - ENG + 0.001, len / 2 - 0.001, { pitch: 0.0022, maxTurns: 2 }),
    [RP - 0.0008, len / 2], [0.0133, len / 2], [0.0133, -len / 2],
  ], 'zinc', { seg: 10 });
  // Réduction six-pans 1 po × d (vissée dans un embout, six-pans dehors), le long de +Y.
  const bushing = (rIn) => group(
    lathe([[rIn, -ENG], [RP, -ENG], [RP, 0], [rIn, 0]], 'zinc', { seg: 12 }),
    at(T.hex(0.036, 0.008, 'zinc'), [0, 0.004, 0]),
  );

  // ---------------------------------------------------------------- 9 — trois tés
  P('9', at(tee('-z'), [X9A, 0, 0]), [0, 0, -0.06]);
  P('9', at(tee('y'), [X9B, 0, 0]), [0, -0.04, 0]);
  P('9', at(tee('-y'), [X9B, Y9C, 0]), [0, 0.12, 0]);

  // 5 — adaptateur 45° 1 NPT × JIC -16 au bout du té d'entrée (vers −X, coudé vers le haut)
  const e45 = (d, r) => {
    const g = group(
      lathe([[0, -ENG], [r, -ENG], [r, 0], [0, 0]], 'zinc', { seg: 10 }),
      at(T.hex(r * 2.4, r * 0.9, 'zinc'), [0, r * 0.45, 0]),
      at(lathe([[0, 0], [r * 0.95, 0], [r * 0.95, r * 1.5], [r * 0.8, r * 1.9], [0, r * 1.9]], 'zinc', { seg: 10 }), [0, r * 0.9, 0]),
    );
    // Corps coudé à 45° : six-pans de l'écrou, embout JIC à cône.
    const bend = group(lathe([[0, 0], [r * 0.95, 0], [r * 0.95, r * 0.6], [r * 0.75, r * 0.7], [r * 0.75, r * 2.2], [r * 0.5, r * 2.6], [0, r * 2.6]], 'zinc', { seg: 10 }));
    bend.position.y = r * 2.6;
    bend.rotation.z = -Math.PI / 4;
    g.add(bend);
    return T.toward(g, d);
  };
  P('5', at(e45([-1, 0, 0], RP), [X9A - TE, 0, 0]), [-0.08, 0, 0]);
  // 7 — réduction 1 × 1/4 ; 3 — adaptateur 45° -04, sur la dérivation (−Z)
  P('7', at(T.toward(bushing(0.0068), [0, 0, -1]), [X9A, 0, -TE]), [0, 0, -0.1]);
  P('3', at(e45([0, 0, -1], 0.0068), [X9A, 0, -TE - 0.008]), [0, 0, -0.16]);

  // ---------------------------------------------------------------- 10 — mamelons 1 × 3 po
  P('10', at(T.toward(nipple(3 * IN), [1, 0, 0]), [X10A, 0, 0]), [0, -0.07, 0]);
  const X10B = XREG + 0.065 - ENG + 0.038;
  P('10', at(T.toward(nipple(3 * IN), [1, 0, 0]), [X10B, 0, 0]), [0, -0.07, 0]);

  // ---------------------------------------------------------------- 2 — détendeur-filtre 1 po
  const reg = group();
  // Corps bronze : boisseau renflé, embouts, union de sortie (écrou six-pans).
  reg.add(merged([
    T.toward(lathe([[0, -0.065], [0.024, -0.065], [0.026, -0.05], [0.038, -0.03], [0.038, 0.02], [0.03, 0.04], [0.024, 0.045], [0, 0.045]], 'brass', { seg: 18 }), [1, 0, 0]),
    at(T.hex(0.05, 0.022, 'brass', { axis: 'x' }), [0.055, 0, 0]),
    at(T.hex(0.046, 0.016, 'brass', { axis: 'x' }), [-0.057, 0, 0]),
    // Col de cloche et chapeau de tamis (dessous).
    lathe([[0, 0], [0.034, 0], [0.034, 0.03], [0, 0.03]], 'brass', { seg: 18, pos: [0, 0.02, 0] }),
    lathe([[0, -0.03], [0.022, -0.03], [0.026, -0.025], [0.026, 0], [0, 0]], 'brass', { seg: 14, pos: [0, -0.035, 0] }),
    at(T.hex(0.03, 0.01, 'brass'), [0, -0.07, 0]),
  ], 'brass'));
  // Cloche du ressort, bride boulonnée (6 vis), vis de réglage et contre-écrou.
  reg.add(lathe([
    [0, 0.05], [0.05, 0.05], [0.05, 0.058], [0.044, 0.062], [0.04, 0.1], [0.026, 0.13], [0.012, 0.136], [0, 0.136],
  ], 'castAlu', { seg: 22 }));
  const flangeBolts = [];
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; flangeBolts.push(T.hex(0.009, 0.006, 'zinc', { pos: [Math.cos(a) * 0.045, 0.061, Math.sin(a) * 0.045] })); }
  reg.add(merged(flangeBolts, 'zinc'));
  reg.add(group(at(cyl(0.006, 0.04, 'steel', { seg: 10 }), [0, 0.15, 0]), at(T.hex(0.016, 0.008, 'zinc'), [0, 0.142, 0]), at(box(0.008, 0.008, 0.008, 'steel'), [0, 0.172, 0])));
  P('2', at(reg, [XREG, 0, 0]), [0, 0.2, 0]);

  // ---------------------------------------------------------------- 11 — mamelons courts (×3)
  P('11', at(T.toward(nipple(1.5 * IN), [0, 1, 0]), [X9B, Y9C / 2, 0]), [0, 0.04, 0.06]);
  const X11 = X9B + TE - ENG + 0.019;
  P('11', at(T.toward(nipple(1.5 * IN), [1, 0, 0]), [X11, Y9C, 0]), [0.05, 0.12, 0]);
  P('11', at(T.toward(nipple(1.5 * IN), [1, 0, 0]), [X11, 0, 0]), [0.05, -0.04, 0]);

  // 8 — réduction 1 × 1/2 ; 4 — adaptateur 45° -08, à gauche du té du haut
  P('8', at(T.toward(bushing(0.0107), [-1, 0, 0]), [X9B - TE, Y9C, 0]), [-0.06, 0.12, 0]);
  P('4', at(e45([-1, 0, 0], 0.0107), [X9B - TE - 0.008, Y9C, 0]), [-0.12, 0.12, 0]);

  // ---------------------------------------------------------------- 1 — robinets à bille 1 po (×2)
  const XV = X11 + 0.019 - ENG + 0.042;
  P('1', at(ballValve(0.034, 'brass', { axis: 'x' }), [XV, Y9C, 0]), [0.12, 0.12, 0]);
  // 6 — coude 90° mâle-femelle 1 po : entre le mamelon court et le robinet du bas
  const XE = X11 + 0.019 - ENG + 0.022;
  const street = group(
    T.toward(lathe([[0.0133, -0.022], [0.024, -0.022], [0.024, 0.012], [0.0133, 0.012]], 'zinc', { seg: 14 }), [1, 0, 0]),
    lathe(sphere(0.0242), 'zinc', { seg: 12 }),
    T.toward(lathe([[0.0133, 0], [0.0215, 0], [0.0215, 0.008], [RP, 0.012], [RP, 0.04], [0.0133, 0.04]], 'zinc', { seg: 14 }), [0, 0, 1]),
  );
  P('6', at(street, [XE, 0, 0]), [0.09, -0.04, 0]);
  const valveLow = ballValve(0.034, 'brass', { axis: 'x' });
  P('1', at(group(valveLow), [XE, 0, 0.04 - ENG + 0.042], [0, -Math.PI / 2, 0]), [0.09, -0.04, 0.1]);

  void THREE;
  return { view: { dir: [0.9, 0.8, 1.2] } };
}

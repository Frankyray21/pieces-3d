// P360 — Commandes d'air de la pompe à graisse CX030858 rév. 1 (page 360),
// repère 29 du porteur P328. Équerre support (6, CX026325, tôle 1/4 po) :
// aile de fixation percée de quatre trous (contre le bâti), aile
// perpendiculaire qui porte le filtre à air (3) et le lubrificateur (4)
// assemblés par leur bride modulaire (5), tablette basse sous laquelle pend
// l'électrovanne (7) avec deux adaptateurs droits 1/4 NPT / JIC -06 (10) et
// deux coudes 1/4 NPT / JIC -06 (8). Détendeur haute pression à volant en T
// (2) posé sur la tête du filtre par un mamelon 3/8 - 1/4 NPT (11), coude de
// sortie 1/4 NPT / JIC -06 (8), manomètre 0-400 psi (1) sous le détendeur par
// une réduction 1/4 - 1/8 NPT (12), bouchon carré 1/8 NPT (13) sur son flanc.
// Coude 3/8 NPT / JIC -06 (9) à la sortie du lubrificateur.
// Repère : origine au centre de la face d'appui de l'aile de fixation de
// l'équerre 6 (contre le bâti), +X sortant de cette face (vers l'appareillage),
// Y vers le haut, Z le long de l'aile (aile porteuse vers −Z). Encombrement
// ≈ 0.22 (X) × 0.42 (Y, de −0.19 à +0.23) × 0.13 (Z) m. Cotes estimées
// (unités modulaires de 55 mm, manomètre 2 1/2 po).
import { RAC_IN as IN, racFactory, racBlock, racPose, racOut } from './_porteur.js';

const T6 = 0.25 * IN;
const UZ = -0.02; // plan médian des unités modulaires
const UY = 0.05; // axe des orifices des unités
const XF = 0.09, XL = 0.157; // axes du filtre 3 et du lubrificateur 4
const U = 0.055; // tête des unités

export default function P360(api) {
  const { S, THREE } = api;
  const { box, at, group, merged, lathe } = S;
  const F = racFactory(S, { light: true });
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const flat = (w, h, d, pos) => at(new THREE.Mesh(new THREE.BoxGeometry(w, h, d)), pos);
  const disc = (r, pos, axis, seg = 8) => lathe([[r, 0.0003], [0, 0.0003]], 'blackOxide', { axis, seg, pos });

  // 6 — équerre : aile de fixation (YZ), aile porteuse (XY, en −Z), tablette basse.
  P('6', group(
    merged([
      box(T6, 0.2, 0.13, 'lightGrey', { pos: [T6 / 2, 0, 0] }),
      box(0.2, 0.2, T6, 'lightGrey', { pos: [0.1, 0, -0.065 + T6 / 2] }),
      flat(0.08, T6, 0.06, [0.046, -0.1, 0.04]),
    ], 'lightGrey'),
    merged([-1, 1].flatMap((sy) => [-1, 1].map((sz) => disc(0.0055, [T6, sy * 0.07, sz * 0.045], 'x'))), 'blackOxide'),
  ), [-0.05, 0, 0]);

  // Unité modulaire (filtre ou lubrificateur) : tête carrée à orifices ±X,
  // cuve sous la tête avec protecteur et fenêtre ; lub : bouchon de remplissage.
  const unit = (lub) => {
    const g = group(
      racBlock(S, THREE, U, U, U, [
        { p: [-U / 2, 0, 0], n: '-x', r: 0.0086 }, { p: [U / 2, 0, 0], n: '+x', r: 0.0086 },
        ...(lub ? [] : [{ p: [0, U / 2, 0], n: '+y', r: 0.0086 }]),
      ], { material: 'castAlu' }),
      merged([
        lathe([[0, -0.15], [0.016, -0.15], [0.023, -0.14], [0.024, -0.035], [0.027, -0.03], [0.027, -U / 2 + 0.001], [0, -U / 2 + 0.001]], 'castAlu', { seg: 10 }),
      ], 'castAlu'),
      box(0.012, 0.07, 0.004, 'black', { pos: [0, -0.085, 0.024] }),
      lathe([[0, -0.157], [0.005, -0.157], [0.005, -0.149]], 'zinc', { seg: 5 }),
    );
    if (lub) g.add(lathe([[0, 0], [0.014, 0], [0.014, 0.006], [0.01, 0.006], [0.01, 0.022], [0, 0.022]], 'black', { seg: 10, pos: [0, U / 2, 0] }));
    return g;
  };
  P('3', at(unit(false), [XF, UY, UZ]), [0, 0, 0.08]);
  P('4', at(unit(true), [XL, UY, UZ]), [0.06, 0, 0.08]);
  // 5 — bride modulaire entre les deux têtes, vissée sur l'aile porteuse.
  P('5', merged([
    box(XL - XF - U, 0.05, 0.035, 'zinc', { pos: [(XF + XL) / 2, UY, UZ - 0.004] }),
    flat(0.03, 0.05, 0.02, [(XF + XL) / 2, UY, -0.065 + T6 + 0.01]),
  ], 'zinc'), [0.03, 0, 0.08]);

  // 11 — mamelon 3/8 - 1/4 NPT sur le dessus du filtre.
  const yN = UY + U / 2;
  P('11', racPose(THREE, F.hexNipple(6, 4), [XF, yN, UZ], [0, 1, 0]), [0, 0.06, 0.08]);
  // 2 — détendeur : corps, carter de membrane boulonné, chapeau de ressort,
  // vis de réglage et volant en T.
  const yR = yN + 0.0115; // dessous du corps
  const RZ = UZ + 0.015;
  const regBody = racBlock(S, THREE, 0.05, 0.035, 0.07, [
    { p: [-0.025, 0, 0], n: '-x', r: 0.0068 }, { p: [0.025, 0, 0], n: '+x', r: 0.0045 }, { p: [0, -0.0175, 0.023], n: '-y', r: 0.0068 },
  ], { material: 'castAlu', seg: 8 });
  regBody.position.set(0, 0.0175, 0);
  const bolts = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    bolts.push(lathe([[0.0048, 0.001], [0.0048, 0.004], [0, 0.004]], 'zinc', { seg: 6, pos: [Math.cos(a) * 0.039, 0.055, Math.sin(a) * 0.039] }));
  }
  const reg = group(
    regBody,
    merged([
      lathe([[0, 0.035], [0.04, 0.035], [0.045, 0.04], [0.045, 0.05], [0.042, 0.055], [0.03, 0.058], [0.03, 0.065], [0.019, 0.11], [0.014, 0.112], [0, 0.112]], 'castAlu', { seg: 10 }),
    ], 'castAlu'),
    merged([
      ...bolts,
      lathe([[0, 0.112], [0.0042, 0.112], [0.0042, 0.137], [0, 0.137]], 'zinc', { seg: 8 }),
      lathe([[0.0075, 0.112], [0.0075, 0.118], [0.004, 0.118]], 'zinc', { seg: 6 }),
      lathe([[0, 0.13], [0.007, 0.13], [0.007, 0.15], [0, 0.15]], 'zinc', { seg: 8 }),
      at(lathe([[0, -0.035], [0.004, -0.035], [0.004, 0.035], [0, 0.035]], 'zinc', { seg: 8 }), [0, 0.145, 0], [0, 0, Math.PI / 2]),
    ], 'zinc'),
  );
  P('2', at(reg, [XF, yR, RZ]), [0, 0.12, 0.08]);
  // 8 — coude de sortie du détendeur (côté −X, vers le bas) ; 13 — bouchon carré côté +X.
  P('8', racPose(THREE, F.elbow({ port: 'npt', pd: 4, jd: 6 }), [XF - 0.025, yR + 0.0175, RZ], [-1, 0, 0], [0, -1, 0]), [-0.05, 0.12, 0.08]);
  P('13', racPose(THREE, F.nptPlugSquare(2), [XF + 0.025, yR + 0.0175, RZ], [1, 0, 0]), [0.05, 0.12, 0.08]);
  // 12 — réduction 1/4 - 1/8 NPT sous l'avant du corps ; 1 — manomètre (raccord vers le haut, cadran vers +Z).
  const p12 = [XF, yR, RZ + 0.023];
  P('12', racPose(THREE, F.nptBushing(4, 2), p12, [0, -1, 0]), [0, 0.03, 0.14]);
  const rg = 0.032;
  // Manomètre léger : boîtier embouti à lunette, cadran blanc, aiguille,
  // graduations (quatre traits), raccord six-pans et queue 1/8 NPT vers le haut.
  const ticks = [];
  for (let i = 0; i < 5; i++) {
    const t = (-135 + i * 67.5) * (Math.PI / 180), rr = rg * 0.7;
    ticks.push(at(new THREE.Mesh(new THREE.BoxGeometry(rg * 0.04, rg * 0.16, 0.0005)), [Math.sin(t) * rr, Math.cos(t) * rr, rg * 0.31], [0, 0, -t]));
  }
  const gauge = group(
    lathe([[0, -rg * 0.28], [rg * 0.92, -rg * 0.28], [rg, -rg * 0.2], [rg, rg * 0.3], [rg * 0.9, rg * 0.33], [rg * 0.88, rg * 0.28], [0, rg * 0.28]], 'chrome', { axis: 'z', seg: 13 }),
    lathe([[rg * 0.88, rg * 0.29], [0, rg * 0.29]], 'white', { axis: 'z', seg: 13 }),
    merged(ticks, 'black'),
    merged([at(new THREE.Mesh(new THREE.BoxGeometry(rg * 0.05, rg * 0.7, 0.0006)), [Math.sin(0.6) * rg * 0.22, Math.cos(0.6) * rg * 0.22, rg * 0.32], [0, 0, -0.6])], 'red'),
    merged([
      lathe([[0, rg], [rg * 0.24, rg], [rg * 0.24, rg * 1.18], [0, rg * 1.18]], 'brass', { seg: 6 }),
      lathe([[0, rg * 0.95], [rg * 0.17, rg * 0.95], [rg * 0.17, rg * 1.4], [0, rg * 1.4]], 'brass', { seg: 8 }),
    ], 'brass'),
  );
  const g1 = at(gauge, [XF, yR - 0.0087 + 0.004 - 1.4 * rg, RZ + 0.023]);
  P('1', g1, [0, -0.03, 0.14]);

  // 9 — coude 3/8 NPT / JIC -06 à la sortie du lubrificateur, vers le bas.
  P('9', racPose(THREE, F.elbow({ port: 'npt', pd: 6, jd: 6 }), [XL + U / 2, UY, UZ], [1, 0, 0], [0, -1, 0]), [0.11, 0, 0.08]);

  // 7 — électrovanne sous la tablette : corps, bobine à connecteur DIN.
  const VC = [0.045, -0.128, 0.04];
  const vbody = racBlock(S, THREE, 0.04, 0.05, 0.035, [
    { p: [0.02, 0.012, 0], n: '+x', r: 0.0058 }, { p: [0.02, -0.012, 0], n: '+x', r: 0.0058 },
    { p: [0, 0, 0.0175], n: '+z', r: 0.0058 }, { p: [-0.02, 0, 0], n: '-x', r: 0.0058 },
  ], { material: 'castAlu', seg: 8 });
  const coil = merged([
    box(0.03, 0.035, 0.03, 'black', { pos: [0, -0.043, 0] }),
    box(0.026, 0.026, 0.012, 'black', { pos: [0, -0.043, 0.021] }),
  ], 'black');
  P('7', at(group(vbody, coil), VC), [0, -0.08, 0]);
  const v = (dx, dy, dz) => [VC[0] + dx, VC[1] + dy, VC[2] + dz];
  P('10', racPose(THREE, F.straight({ port: 'npt', pd: 4, jd: 6 }), v(0.02, 0.012, 0), [1, 0, 0]), [0.05, -0.08, 0]);
  P('10', racPose(THREE, F.straight({ port: 'npt', pd: 4, jd: 6 }), v(-0.02, 0, 0), [-1, 0, 0]), [-0.05, -0.08, 0]);
  P('8', racPose(THREE, F.elbow({ port: 'npt', pd: 4, jd: 6 }), v(0.02, -0.012, 0), [1, 0, 0], [0, -1, 0]), [0.05, -0.1, 0]);
  P('8', racPose(THREE, F.elbow({ port: 'npt', pd: 4, jd: 6 }), v(0, 0, 0.0175), [0, 0, 1], [0, -1, 0]), [0, -0.1, 0.05]);

  return { view: { dir: [1.1, 0.6, 0.9] } };
}

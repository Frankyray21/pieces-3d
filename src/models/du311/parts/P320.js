// P320 — Enrouleur de flexible de graissage CX036431 rév. 0 « ASSY, HEAVY
// DUTY HOSE REEL W/ 50' HOSE » (page 320), repère 5 de P318. Enrouleur à
// ressort (3) : semelle à 4 trous oblongs, flasque-support côté -X portant
// l'axe et le bras du guide-flexible à 4 rouleaux, tambour à deux joues
// pleines à bord roulé et moyeu ajouré, flexible de 50 pi enroulé (dont un
// bout sort du guide) ; joint tournant universel 1/4 NPT (1) au moyeu côté
// +X ; butée à bille réglable (2) serrée sur le flexible à la sortie du guide.
// Repère : origine au centre de la face inférieure de la semelle ; Y normal à
// la semelle (vers le tambour) ; +X le long de l'axe du tambour, du support
// vers le joint tournant ; -Z côté guide-flexible. Axe du tambour à y = 0.3,
// x de -0.11 à 0.09 entre joues. Trous de la semelle (vis de P318) à
// x = -0.15 ± 0.0, z = ±0.12 et ±0.05 : PTS320.holes.
// Encombrement ≈ 0.31 (X) × 0.60 (Y) × 0.75 (Z, flexible pendant compris) m.
// Cotes estimées d'après la vue et les photos de la page 320 (joues Ø 20 po,
// largeur 8 po) ; flexible 1/4 po.
import { IN, NPT } from './_chassis.js';

export const PTS320 = {
  holes: [[-0.15, -0.12], [-0.15, -0.05], [-0.15, 0.05], [-0.15, 0.12]], // [x, z] trous de semelle
};

export default function P320(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const HY = 0.3, XA = -0.11, XB = 0.09, RJ = 0.254;

  // ---------------------------------------------------------------- 3 — enrouleur
  const red = [], steel = [], hoseM = [];
  // Semelle (4 trous oblongs Ø 9/16 po) et flasque-support vertical.
  const base = S.plate(0.11, 0.32, 0.008, 'red', { r: 0.01, cutouts: PTS320.holes.map(([x, z]) => [x + 0.15, z, 0.022, 0.0145]) });
  base.position.set(-0.15, 0.004, 0);
  red.push(base);
  const up = [[-0.15, 0.008], [0.15, 0.008], [0.06, HY - 0.02], [0.06, HY + 0.05], [-0.06, HY + 0.05], [-0.06, HY - 0.02]];
  const sh = new THREE.Shape(up.map(([z, y]) => new THREE.Vector2(z, y)));
  const hole = new THREE.Path(); hole.absarc(0, HY, 0.02, 0, Math.PI * 2, true); sh.holes.push(hole);
  const upGeo = new THREE.ExtrudeGeometry(sh, { depth: 0.006, bevelEnabled: false, curveSegments: 16 });
  const upM = new THREE.Mesh(upGeo);
  upM.rotation.y = Math.PI / 2; upM.position.x = -0.145;
  red.push(upM);
  // Pliure de la semelle (cornière) et goussets.
  red.push(S.box(0.035, 0.006, 0.3, 'red', { r: 0.001, pos: [-0.13, 0.011, 0] }));
  // Bras du guide : du haut du flasque vers l'arrière (-Z) et le haut.
  const g0 = [-0.142, HY + 0.03, -0.04], g1 = [-0.142, 0.53, -0.25];
  red.push(S.rod(g0, g1, 0.016, 'red', 12));
  red.push(S.rod(g1, [-0.01, 0.53, -0.26], 0.014, 'red', 12));
  // Guide-flexible : plaque à ouverture carrée face -Z, 4 rouleaux.
  const gc = [0.0, 0.5, -0.27];
  const gp = S.plate(0.12, 0.12, 0.008, 'red', { r: 0.015, cutouts: [[0, 0, 0.06, 0.06]] });
  gp.rotation.x = Math.PI / 2; gp.position.set(...gc);
  red.push(gp);
  for (let k = 0; k < 4; k++) {
    const vert = k % 2 === 0, s = k < 2 ? 1 : -1;
    const roll = S.cyl(0.009, 0.062, 'zinc', { axis: vert ? 'y' : 'x', seg: 14 });
    roll.position.set(gc[0] + (vert ? s * 0.039 : 0), gc[1] + (vert ? 0 : s * 0.039), gc[2] - 0.012);
    steel.push(roll);
  }
  // Axe et moyeu.
  steel.push(S.cyl(0.018, 0.27, 'zinc', { axis: 'x', seg: 20, pos: [-0.02, HY, 0] }));
  steel.push(S.nut(0.036, 0.016, 'zinc', { axis: 'x', pos: [-0.16, HY, 0] }));
  // Joues pleines (bord roulé) et tambour.
  for (const [x, s] of [[XA, -1], [XB, 1]]) {
    red.push(S.lathe([[0.045, -0.0015], [RJ, -0.0015], [RJ, 0.0015], [0.045, 0.0015], [0.045, -0.0015]], 'red', { axis: 'x', seg: 64, pos: [x, HY, 0] }));
    red.push(S.torus(RJ, 0.0045, 'red', { axis: 'x', pos: [x, HY, 0] }));
    // Embouti du moyeu (cuvette) et couronne de vis.
    red.push(S.lathe([[0.045, 0], [0.11, 0], [0.11, 0.004], [0.07, 0.012], [0.045, 0.012], [0.045, 0]], 'red', { axis: s > 0 ? 'x' : '-x', seg: 48, pos: [x, HY, 0] }));
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      steel.push(S.cyl(0.004, 0.004, 'zinc', { axis: 'x', seg: 8, pos: [x + s * 0.002, HY + Math.sin(a) * 0.2, Math.cos(a) * 0.2] }));
    }
  }
  red.push(S.cyl(0.08, XB - XA, 'red', { axis: 'x', seg: 40, pos: [(XA + XB) / 2, HY, 0] }));
  // Plateau de moyeu côté +X : 6 trous, 4 vis.
  steel.push(S.cyl(0.042, 0.006, 'zinc', { axis: 'x', seg: 32, pos: [XB + 0.015, HY, 0] }));
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    steel.push(S.nut(0.011, 0.006, 'zinc', { axis: 'x', pos: [XB + 0.021, HY + Math.sin(a) * 0.03, Math.cos(a) * 0.03] }));
  }
  steel.push(S.cyl(0.02, 0.012, 'zinc', { axis: 'x', seg: 20, pos: [XB + 0.012, HY, 0] }));
  // Flexible enroulé (3 couches) et brin de sortie par le guide.
  const rh = 0.0075;
  for (let l = 0; l < 3; l++) {
    const R = 0.08 + rh + l * rh * 1.9;
    for (let i = 0; i < 12; i++) hoseM.push(S.torus(R, rh, 'hose', { axis: 'x', pos: [XA + 0.01 + i * 0.0163, HY, 0] }));
  }
  const Rt = 0.08 + rh + 2 * rh * 1.9;
  const hosePath = [
    [0, HY + Rt, 0.0], [0, HY + Rt + 0.005, -0.12], [0, gc[1] - 0.005, -0.22], [0, gc[1], -0.3],
    [0, gc[1] - 0.04, -0.38], [0, gc[1] - 0.18, -0.42], [0, gc[1] - 0.3, -0.43],
  ];
  const hose = S.hose(hosePath, rh);
  P('3', S.group(S.merged(red, 'red'), S.merged(steel, 'zinc'), S.merged(hoseM, 'hose'), hose), [0, 0, 0]);

  // ---------------------------------------------------------------- 1 — joint tournant universel 1/4 NPT
  const rn = (NPT[4] * IN) / 2;
  const sw = S.merged([
    S.lathe([[0, 0], [rn, 0], [rn, 0.012], [0, 0.012]], 'zinc', { axis: 'x', seg: 14 }),
    S.nut(0.0175, 0.008, 'zinc', { axis: 'x', pos: [0.016, 0, 0] }),
    S.cyl(0.011, 0.02, 'zinc', { axis: 'x', seg: 18, pos: [0.03, 0, 0] }),
    S.ball(0.012, 'zinc', { pos: [0.042, 0, 0] }),
    S.cyl(0.0095, 0.03, 'zinc', { seg: 18, pos: [0.042, -0.016, 0] }),
    S.nut(0.0175, 0.008, 'zinc', { pos: [0.042, -0.034, 0] }),
  ], 'zinc');
  sw.position.set(XB + 0.018, HY, 0);
  P('1', sw, [0.08, 0, 0]);

  // ---------------------------------------------------------------- 2 — butée à bille réglable
  // Palet de caoutchouc fendu serré sur le flexible par une vis, juste après le guide.
  const curve = new THREE.CatmullRomCurve3(hosePath.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
  const t = 0.63;
  const p = curve.getPointAt(t), tg = curve.getTangentAt(t);
  const stop = S.group(
    S.lathe([[rh, -0.012], [0.026, -0.012], [0.03, -0.006], [0.03, 0.006], [0.026, 0.012], [rh, 0.012], [rh, -0.012]], 'rubber', { seg: 32 }),
    S.cyl(0.0025, 0.05, 'zinc', { axis: 'x', seg: 10, pos: [0, 0, 0.018] }),
    S.nut(0.008, 0.004, 'zinc', { axis: 'x', pos: [0.026, 0, 0.018] }),
  );
  stop.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tg);
  stop.position.copy(p);
  P('2', stop, tg.clone().multiplyScalar(0.1).toArray());

  return { view: { dir: [1, 0.55, -0.9] } };
}

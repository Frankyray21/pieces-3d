// P326 — Réservoir hydraulique 34 gal du DU311 CX031050 rév. 0 (page 326) :
// « ASSY. 34 GAL HYDTANK, DU311 », repère 12 du porteur P220. Réservoir (1,
// P328) posé sur les traverses du châssis avant juste devant l'articulation,
// chevron tourné vers elle, fixé par quatre vis H 3/4-10 × 1 1/2 (19),
// rondelles plates (21) et Grower (23). Traversée de l'articulation : seize
// raccords de cloison à 45° sur la plaque du réservoir (3 : -4, 4 : huit -6,
// 5 : -8, 6 : trois -12, 7 : trois -16) et seize sur la potence du châssis
// arrière (2, deux vis H 1/2 × 1 1/2 18, rondelles plates 20 et Grower 22) :
// coudes 90° -4 (8) et -6 (9, ×7), droits -6 (10), -8 (11), -12 (12, ×3) et
// -16 (13, ×3), dans l'ordre de la table « DU311_Bulkhead Port Info » (de
// haut en bas : extinction -4, -12, -6, -8, translation, air de mine, frein
// de service, pression, eau, frein de parc, retour, frein de transmission,
// liaison des réservoirs avant / arrière). Les seize flexibles de
// l'articulation (24 1/2 à 26 5/8 po hors sertissage, hors liste) sont
// dessinés en flexibles articulés (simulation : bout côté potence sur le
// châssis, bout côté réservoir sur le corps « front »). Orifices du réservoir :
// trois coudes 90° ORB -16 (14), deux coudes -16 → -8 (15), trois adaptateurs
// droits -6 (16) et deux -12 (17).
// Repère machine (../layout.js), placé à l'identité par P220 : réservoir en
// TANK.at (repère de P328, voir _cab.js). Corps mobiles : réservoir et ses
// raccords « front » ; potence et ses raccords sur le châssis arrière.
import { u, TANK, cabHw, prism } from './_cab.js';
import { BULK, TPORTS, chevPan } from './P328.js';
import { body, flex } from '../layout.js';

export default function P326(api) {
  const { THREE, S } = api;
  const { box, merged, group } = S;
  const H_ = cabHw(api);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (ref, obj, e) => P(ref, body('front', obj), e);
  const T = (p) => [p[0] + TANK.at[0], p[1] + TANK.at[1], p[2] + TANK.at[2]];
  const M = 'lightGrey';

  // ---------------------------------------------------------------- 1 — réservoir (P328)
  const tank = api.sub('P328');
  tank.position.set(...TANK.at);
  F('1', tank, [0.25, 0.4, 0]);

  // ---------------------------------------------------------------- 3 à 7 — traversées à 45° sur la plaque du réservoir
  const tankRef = { 4: '3', 6: '4', 8: '5', 12: '6', 16: '7' };
  const tips = []; // bouts des mâles côté articulation (repère machine)
  BULK.dash.forEach((dash, k) => {
    const pos = T([BULK.px, BULK.y[k], BULK.pz + BULK.col(k)]);
    const fit = H_.pose(H_.bulkhead(dash, '45', BULK.t), pos, [1, 0, 0], [0, 0, -1]);
    F(tankRef[dash], fit, [-0.15, 0, -0.05]);
    const tp = H_.bulkheadTip(dash, '45');
    fit.updateMatrix();
    tips[k] = { p: new THREE.Vector3(...tp.p).applyMatrix4(fit.matrix), d: new THREE.Vector3(...tp.d).transformDirection(fit.matrix) };
  });

  // ---------------------------------------------------------------- 2 — potence de traversée (châssis arrière) et ses raccords
  const BR = { x: -0.2, z: -0.3, y0: 1.0, xb: -0.32 }; // face +X de la bande, axe, pied, vis sur la traverse
  const dy = TANK.at[1] - 0.0; // mêmes hauteurs d'orifices que la plaque du réservoir
  const yTop = BULK.y[0] + dy + 0.035, yBot = BULK.y[15] + dy - 0.035;
  const tb = BULK.t;
  const holes = BULK.dash.map((dash, k) => [BR.z - BULK.col(k), BULK.y[k] + dy, (H_.JIC[dash].t * 0.0254) / 2 + 0.001]);
  const bracket = [
    // Semelle (plat 1/2 po) en porte-à-faux sur la traverse avant du châssis arrière, deux trous oblongs.
    prism(S, THREE, [[BR.xb - 0.035, BR.z - 0.06], [BR.x + 0.005, BR.z - 0.06], [BR.x + 0.005, BR.z + 0.06], [BR.xb - 0.035, BR.z + 0.06]], 0.0127, M, 'xz', BR.y0 + 0.0064,
      { polys: [-1, 1].map((s) => [[BR.xb - 0.012, BR.z + s * 0.035 - 0.0075], [BR.xb + 0.012, BR.z + s * 0.035 - 0.0075], [BR.xb + 0.012, BR.z + s * 0.035 + 0.0075], [BR.xb - 0.012, BR.z + s * 0.035 + 0.0075]]) }),
    // Montant en U (côté −X de la bande) et gousset.
    box(0.05, yTop - BR.y0, 0.006, M, { pos: [BR.x - tb - 0.025, (yTop + BR.y0) / 2, BR.z - 0.047] }),
    box(0.05, yTop - BR.y0, 0.006, M, { pos: [BR.x - tb - 0.025, (yTop + BR.y0) / 2, BR.z + 0.047] }),
    prism(S, THREE, [[BR.xb - 0.03, BR.y0 + 0.0127], [BR.x - tb - 0.05, BR.y0 + 0.0127], [BR.x - tb - 0.05, BR.y0 + 0.2]], 0.008, M, 'xy', BR.z),
    // Bande de traversée (3/8 po) percée des seize orifices.
    prism(S, THREE, [[BR.z - 0.05, BR.y0 + 0.0127], [BR.z + 0.05, BR.y0 + 0.0127], [BR.z + 0.05, yTop], [BR.z + 0.03, yTop + 0.02], [BR.z - 0.03, yTop + 0.02], [BR.z - 0.05, yTop]], tb, M, 'zy', BR.x - tb / 2, { holes }),
    box(0.012, 0.06, 0.1, M, { pos: [BR.x - tb - 0.006, yTop - 0.03, BR.z] }),
  ];
  void yBot;
  const brTips = [];
  const brKind = (dash, k) => (dash === 4 || (dash === 6 && k !== 5) ? '90' : 'straight');
  const brRef = (dash, k) => (dash === 4 ? '8' : dash === 6 ? (k === 5 ? '10' : '9') : dash === 8 ? '11' : dash === 12 ? '12' : '13');
  BULK.dash.forEach((dash, k) => {
    const kind = brKind(dash, k);
    const pos = [BR.x, BULK.y[k] + dy, BR.z - BULK.col(k)];
    const fit = H_.pose(H_.bulkhead(dash, kind, tb), pos, [-1, 0, 0], [0, 0, 1]);
    P(brRef(dash, k), fit, [0.15, 0, 0.05]);
    const tp = H_.bulkheadTip(dash, kind);
    fit.updateMatrix();
    brTips[k] = { p: new THREE.Vector3(...tp.p).applyMatrix4(fit.matrix), d: new THREE.Vector3(...tp.d).transformDirection(fit.matrix) };
  });
  // Flexibles de l'articulation (hors liste) : potence (châssis) → plaque du réservoir (« front »).
  const hr = { 4: 0.0066, 6: 0.0088, 8: 0.0105, 12: 0.0138, 16: 0.0175 };
  const hoses = BULK.dash.map((dash, k) => {
    const a = brTips[k], b = tips[k];
    const pts = [a.p, a.p.clone().addScaledVector(a.d, 0.07), b.p.clone().addScaledVector(b.d, 0.07), b.p].map((v) => v.toArray());
    pts[1][1] -= 0.03; pts[2][1] -= 0.03; // légère flèche
    return flex(S, pts, ['chassis', 'chassis', 'front', 'front'], hr[dash], 'hose', { seg: 28, radial: 10 });
  });
  P('2', group(merged(bracket, M), ...hoses), [-0.12, 0, -0.1]);
  // 18 + 20 + 22 — vis de la semelle sur la traverse.
  for (const s of [-1, 1]) {
    const p = [BR.xb, BR.y0 + 0.0127, BR.z + s * 0.035];
    P('20', H_.washer(0.5, p), [0, 0.08, 0]);
    const p2 = [p[0], p[1] + H_.wT(0.5), p[2]];
    P('22', H_.washer(0.5, p2, [0, 1, 0], 'split'), [0, 0.12, 0]);
    P('18', H_.bolt(0.5, 1.5, [p[0], p2[1] + H_.wT(0.5, 'split'), p[2]], [0, 1, 0]), [0, 0.18, 0]);
  }

  // ---------------------------------------------------------------- 14 à 17 — raccords du réservoir
  const xr = -TANK.D / 2 - 0.01;
  TPORTS.low.forEach(([z, y], i) => {
    const el = i < 3 ? H_.R.elbow({ port: 'orb', pd: 16, jd: 16 }) : H_.R.elbow({ port: 'orb', pd: 16, jd: 8 });
    F(i < 3 ? '14' : '15', H_.pose(el, T([xr, y, z]), [-1, 0, 0], [0, -1, 0]), [-0.15, -0.05, 0]);
  });
  TPORTS.chev.forEach(([z, y, dash]) => {
    const { x, n } = chevPan(z);
    const p = T([x + n[0] * 0.006, y, z + n[2] * 0.006]);
    F(dash === 6 ? '16' : '17', H_.pose(H_.R.straight({ port: 'orb', pd: dash, jd: dash }), p, n), [n[0] * 0.15, 0, n[2] * 0.15]);
  });

  // ---------------------------------------------------------------- 19 + 21 + 23 — vis des pattes du réservoir
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const p = T([sx * (TANK.D / 2 - 0.05), 0.0127, sz * (TANK.W / 2 + 0.05)]);
    F('21', H_.washer(0.75, p), [0, 0.1, 0]);
    const p2 = [p[0], p[1] + H_.wT(0.75), p[2]];
    F('23', H_.washer(0.75, p2, [0, 1, 0], 'split'), [0, 0.14, 0]);
    F('19', H_.bolt(0.75, 1.5, [p[0], p2[1] + H_.wT(0.75, 'split'), p[2]], [0, 1, 0]), [0, 0.2, 0]);
  }
  void u;
  return { view: { dir: [-1, 0.7, 1.0] } };
}

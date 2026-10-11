// P346 — Collecteur de pression hydraulique CX028864 rév. 1 (page 346) :
// « HYD. PRESSURE MANIFOLD ASSY », repère 20 du porteur P328. Bloc d'acier
// parallélépipédique (1, CP000407) percé de huit orifices SAE à joint torique,
// fixé à plat sur le pont par deux vis H 1/4-20 × 3 1/4 po (6) à rondelles
// fendues (7) qui le traversent de haut en bas, entre les deux orifices du
// dessus. Orifices : bout −X -16 (adaptateur droit -16, 4), bout +X -16
// (coude réducteur -16 / -12, 3), dessus et face +Z : un coude -12 (2) et un
// bouchon -12 (5) chacun, face −Z : deux bouchons -12 (5).
// Repère : origine au centre de la face d'appui inférieure du bloc, Y vers le
// haut, X selon la grande longueur (+X côté coude 3), +Z vers la face qui porte
// le coude 2 inférieur. Encombrement ≈ 0.26 (X, raccords compris) × 0.12 (Y)
// × 0.13 (Z) m ; bloc 6 1/2 × 3 × 3 po (proportions de la vue isométrique,
// hauteur donnée par les vis de 3 1/4 po vissées dans la platine).
// Pose sur P328 : sur le pont, au milieu de la machine, à côté du collecteur de
// retour P376 (repère 37), près de l'ouverture du réservoir (page 328, vue du
// bas, bulle 20).
import { RAC_IN as IN, racFactory, racBlock, racPose, racOut } from './_porteur.js';

const L = 6.5 * IN, H = 3 * IN, W = 3 * IN;
const XP = 0.23 * L; // orifices des faces longues et du dessus, de part et d'autre du milieu
const ZB = 0.33 * (W / 2) * 2; // vis : à ±1 po de l'axe, entre les orifices du dessus

export default function P346(api) {
  const { S, THREE } = api;
  const F = racFactory(S);
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // 1 — bloc : lamages Ø 2 1/4 po (-16) et Ø 1 7/8 po (-12), trous de vis Ø 9/32.
  const r16 = (1.3125 * IN) / 2, r12 = (1.0625 * IN) / 2;
  const ports = [
    { p: [-L / 2, H / 2, 0], n: '-x', r: r16, spot: 1.12 * IN },
    { p: [L / 2, H / 2, 0], n: '+x', r: r16, spot: 1.12 * IN },
    { p: [-XP, H, 0], n: '+y', r: r12, spot: 0.92 * IN },
    { p: [XP, H, 0], n: '+y', r: r12, spot: 0.92 * IN },
    { p: [-XP, H / 2, W / 2], n: '+z', r: r12, spot: 0.92 * IN },
    { p: [XP, H / 2, W / 2], n: '+z', r: r12, spot: 0.92 * IN },
    { p: [-XP, H / 2, -W / 2], n: '-z', r: r12, spot: 0.92 * IN },
    { p: [XP, H / 2, -W / 2], n: '-z', r: r12, spot: 0.92 * IN },
    { p: [0, H, ZB], n: '+y', r: 0.14 * IN },
    { p: [0, H, -ZB], n: '+y', r: 0.14 * IN },
  ];
  const centred = ports.map((q) => ({ ...q, p: [q.p[0], q.p[1] - H / 2, q.p[2]] }));
  P('1', S.at(racBlock(S, THREE, L, H, W, centred, { material: 'darkSteel' }), [0, H / 2, 0]), [0, 0, 0]);

  // 2 — coudes 90° -12 ORB / -12 JIC : dessus (sortie vers +X), face +Z (sortie vers le bas).
  P('2', racPose(THREE, F.elbow({ pd: 12, jd: 12 }), [XP, H, 0], [0, 1, 0], [1, 0, 0]), [0, 0.07, 0]);
  P('2', racPose(THREE, F.elbow({ pd: 12, jd: 12 }), [XP, H / 2, W / 2], [0, 0, 1], [0, -1, 0]), [0, 0, 0.07]);
  // 3 — coude réducteur -16 ORB / -12 JIC, bout +X, sortie vers +Z.
  P('3', racPose(THREE, F.elbow({ pd: 16, jd: 12 }), [L / 2, H / 2, 0], [1, 0, 0], [0, 0, 1]), [0.08, 0, 0]);
  // 4 — adaptateur droit -16 ORB / -16 JIC, bout −X.
  P('4', racPose(THREE, F.straight({ pd: 16, jd: 16 }), [-L / 2, H / 2, 0], [-1, 0, 0]), [-0.08, 0, 0]);
  // 5 — bouchons -12 : dessus, face +Z, et les deux orifices de la face −Z.
  const plugs = [
    [[-XP, H, 0], [0, 1, 0]],
    [[-XP, H / 2, W / 2], [0, 0, 1]],
    [[-XP, H / 2, -W / 2], [0, 0, -1]],
    [[XP, H / 2, -W / 2], [0, 0, -1]],
  ];
  for (const [p, d] of plugs) P('5', racPose(THREE, F.orbPlug(12), p, d), racOut(d, 0.06));

  // 6 — vis H 1/4-20 × 3 1/4 po, 7 — rondelles fendues 1/4 sous la tête.
  const d = 0.25 * IN, tw = d * 0.25;
  for (const z of [ZB, -ZB]) {
    P('7', S.at(F.washer(d, { split: true }), [0, H, z]), [0, 0.045, 0]);
    P('6', S.at(F.bolt(d, 3.25 * IN), [0, H + tw, z]), [0, 0.15, 0]);
  }

  return { view: { dir: [-0.9, 0.8, 1.1] } };
}

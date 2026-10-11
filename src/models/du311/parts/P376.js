// P376 — Collecteur de retour CX032622 rév. 0 (page 376), repère 37 de P328 :
// « ASSY, RETURN MANIFOLD ». Bloc d'acier (1, CP006674) 6 1/2 × 3 1/4 × 3 po
// percé de huit orifices SAE à joint torique, fixé à plat par deux vis H
// 1/4-20 × 3 3/4 po (11) et rondelles fendues (12) qui le traversent du dessus
// (le bout des vis dépasse de 1/2 po sous le bloc). Orifices :
//   · bout −X (-20) : adaptateur droit -20 ORB / -20 JIC (9), retour principal ;
//   · bout +X (-20) : coude 90° -20 ORB / -16 JIC (6), sortie vers +Z ;
//   · dessus (-16) : coude 90° -16 / -08 (4) coiffé d'une réduction -08 / -06
//     (2), sortie vers +X, et coude 90° -16 / -12 (5), sortie vers +X ;
//   · face +Z (-16) : adaptateur droit -16 / -12 (8) à −X, adaptateur droit
//     -16 / -08 (7) et réduction -08 / -06 (2) à +X ;
//   · face −Z (-16) : bouchon six-pans -16 (10) à −X, adaptateur droit -16 /
//     -08 (7), réduction -08 / -06 (2) et té tournant -06 (3) à +X.
// Repère : origine au centre de la face d'appui inférieure du bloc, Y vers le
// haut, X selon la longueur (+X côté coude 6), +Z vers la face qui porte
// l'adaptateur 8 (face vue de face au bas de la page). Encombrement ≈ 0.33
// (X, raccords compris) × 0.15 (Y, de −0.013 au bout des coudes) × 0.22 (Z) m.
// Cotes : bloc d'après la vue de face (lamage -16 Ø 1.12 po pour l'échelle),
// raccords SAE du commerce (racFactory de _porteur.js).
import { RAC_IN as IN, racFactory, racBlock, racPose, racPort } from './_porteur.js';

const L = 6.5 * IN, H = 3.25 * IN, D = 3 * IN;
const XP = 0.037; // orifices des faces longues et du dessus (±)
const ZB = 0.022; // vis traversantes (x = 0, z = ±ZB)

export default function P376(api) {
  const { S, THREE } = api;
  const F = racFactory(S);
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const pose = (obj, p, d, side) => racPose(THREE, obj, p, d, side);

  // ---------------------------------------------------------------- 1 — bloc
  const r20 = (1.625 * IN) / 2, r16 = (1.3125 * IN) / 2;
  const ports = [
    { p: [-L / 2, 0, 0], n: '-x', r: r20, spot: 1.38 * IN },
    { p: [L / 2, 0, 0], n: '+x', r: r20, spot: 1.38 * IN },
    { p: [-XP, H / 2, 0], n: '+y', r: r16, spot: 1.12 * IN },
    { p: [XP, H / 2, 0], n: '+y', r: r16, spot: 1.12 * IN },
    { p: [-XP, 0, D / 2], n: '+z', r: r16, spot: 1.12 * IN },
    { p: [XP, 0, D / 2], n: '+z', r: r16, spot: 1.12 * IN },
    { p: [-XP, 0, -D / 2], n: '-z', r: r16, spot: 1.12 * IN },
    { p: [XP, 0, -D / 2], n: '-z', r: r16, spot: 1.12 * IN },
    { p: [0, H / 2, ZB], n: '+y', r: 0.14 * IN },
    { p: [0, H / 2, -ZB], n: '+y', r: 0.14 * IN },
  ];
  P('1', S.at(racBlock(S, THREE, L, H, D, ports, { material: 'darkSteel', seg: 16 }), [0, H / 2, 0]), [0, 0, 0]);
  const yc = H / 2;

  // ---------------------------------------------------------------- bouts
  P('9', pose(F.straight({ pd: 20, jd: 20 }), [-L / 2, yc, 0], [-1, 0, 0]), [-0.08, 0, 0]);
  P('6', pose(F.elbow({ pd: 20, jd: 16 }), [L / 2, yc, 0], [1, 0, 0], [0, 0, 1]), [0.08, 0, 0]);

  // ---------------------------------------------------------------- dessus
  const e4 = pose(F.elbow({ pd: 16, jd: 8 }), [-XP, H, 0], [0, 1, 0], [1, 0, 0]);
  P('4', e4, [0, 0.07, 0]);
  const q4 = racPort(THREE, e4);
  P('2', pose(F.swivel({ kind: 'reducer', fd: 8, jd: 6 }), q4.p, q4.d), [0.06, 0.07, 0]);
  P('5', pose(F.elbow({ pd: 16, jd: 12 }), [XP, H, 0], [0, 1, 0], [1, 0, 0]), [0, 0.1, 0]);

  // ---------------------------------------------------------------- face +Z
  P('8', pose(F.straight({ pd: 16, jd: 12 }), [-XP, yc, D / 2], [0, 0, 1]), [0, 0, 0.08]);
  const s7f = pose(F.straight({ pd: 16, jd: 8 }), [XP, yc, D / 2], [0, 0, 1]);
  P('7', s7f, [0, 0, 0.08]);
  const q7f = racPort(THREE, s7f);
  P('2', pose(F.swivel({ kind: 'reducer', fd: 8, jd: 6 }), q7f.p, q7f.d), [0, 0, 0.14]);

  // ---------------------------------------------------------------- face −Z
  P('10', pose(F.orbPlug(16), [-XP, yc, -D / 2], [0, 0, -1]), [0, 0, -0.07]);
  const s7b = pose(F.straight({ pd: 16, jd: 8 }), [XP, yc, -D / 2], [0, 0, -1]);
  P('7', s7b, [0, 0, -0.08]);
  const q7b = racPort(THREE, s7b);
  const r2b = pose(F.swivel({ kind: 'reducer', fd: 8, jd: 6 }), q7b.p, q7b.d);
  P('2', r2b, [0, 0, -0.14]);
  const q2b = racPort(THREE, r2b);
  P('3', pose(F.swivel({ kind: 'tee', fd: 6 }), q2b.p, q2b.d, [-1, 0, 0]), [0, 0, -0.2]);

  // ---------------------------------------------------------------- 11, 12 — vis traversantes
  for (const z of [ZB, -ZB]) {
    P('12', S.at(F.washer(0.25 * IN, { split: true }), [0, H, z]), [0, 0.14, 0]);
    P('11', S.at(F.bolt(0.25 * IN, 3.75 * IN), [0, H + 0.0016, z]), [0, 0.2, 0]);
  }

  return { view: { dir: [1, 0.8, 1.2] } };
}

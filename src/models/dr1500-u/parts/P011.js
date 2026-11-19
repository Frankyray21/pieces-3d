// P011 — Kit d'adaptateur transmission (page 11) : sur la face arrière de la tête XBH, dans l'axe de l'arbre menant
// 91-104A (12T) : carter d'adaptateur 90-148 (plaque sur la tête, caisson, bride de la transmission), adaptateur
// cannelé 90-147 (douille à cannelures femelles et bout mâle dans l'arbre menant), transmission 4 vitesses (ligne
// « T2B2D54 TRANSMISSION FAIRFIELD » ; note rouge : toutes les 1500 ont des Funk 4 vitesses — corps rond entre deux
// brides, comme au dessin) et moteur hydraulique à cylindrée variable Rexroth AA6VM160 (bride carrée, corps, bloc
// arrière à orifices à bride SAE, régulateur HD sur le dessus). Ordre de montage : celui de l'éclaté de la page
// (4, 3, 2, 1 en s'éloignant de la tête) ; l'encart « Adaptateur as été installé » (DR-U-110-20 : moteur AA6VM160,
// accouplement E-1217, adaptateur UMW-002-001) montre le même empilement moteur → accouplement → adaptateur : il
// sert de référence et n'ajoute pas d'objet (ses pièces ne sont pas des lignes de la liste).
// Repère : celui de P012 (posé à l'identité) ; axe de l'arbre menant à (DRV.y, DRV.z), le long de X, vers −X.
// Cotes : moteur A6VM160 (bride 4 trous de 200, corps Ø 200, ≈ 0,38 m) [norme catalogue, arrondi] ; transmission,
// adaptateurs [mesuré sur la page 11 par rapport au moteur, ±15 %]. Les brides octogonales et le corps Ø 260
// restent à l'écart du mandrin (entraxe broche–arbre menant de layout.js).
import { DRV, CAR, SD, tour, plaqueX } from './_tete.js';

export default function P011(api) {
  const { S } = api;
  const { at, group, box, cyl, nut, rod } = S;
  const T = (prof, mat, seg = 40) => tour(S, prof, mat, DRV.y, DRV.z, seg);
  /** Bride octogonale (surplats af, pans coupés) d'épaisseur t centrée en x, trous [dz, dy, r] relatifs à l'axe. */
  const octo = (x, t, af, mat, holes = [], cham = 0.3) => {
    const h = af / 2, c = h * cham;
    const pts = [[-h + c, -h], [h - c, -h], [h, -h + c], [h, h - c], [h - c, h], [-h + c, h], [-h, h - c], [-h, -h + c]];
    return plaqueX(S, x, t, pts.map(([u, v]) => [DRV.z + u, DRV.y + v]), mat, holes.map(([u, v, r]) => [DRV.z + u, DRV.y + v, r]));
  };
  const corners = (d) => [[-d, -d], [d, -d], [d, d], [-d, d]];
  const X0 = CAR.x0;

  // 4 — Carter d'adaptateur 90-148 : plaque de 25 (pans coupés, 200 sur plats) chambrée sur la cage 90-112 de la tête,
  // caisson de 160 à parois de 12, bride arrière de 15 au centrage de la transmission ; quatre trous de fixation
  // par bride (visserie non listée à la page).
  const A = { p0: X0, p1: X0 - 0.025, b1: -0.2, f1: -0.215 };
  const holes4 = corners(0.075).map(([u, v]) => [u, v, 0.0085]);
  api.part('4', group(
    octo((A.p0 + A.p1) / 2, 0.025, 0.2, 'red', [[0, 0, 0.081], ...holes4]),
    ...[-1, 1].map((s) => at(box(A.p1 - A.b1, 0.012, 0.16, 'red'), [(A.p1 + A.b1) / 2, DRV.y + s * 0.074, DRV.z])),
    ...[-1, 1].map((s) => at(box(A.p1 - A.b1, 0.136, 0.012, 'red'), [(A.p1 + A.b1) / 2, DRV.y, DRV.z + s * 0.074])),
    octo((A.b1 + A.f1) / 2, 0.015, 0.19, 'red', [[0, 0, 0.065], ...corners(0.07).map(([u, v]) => [u, v, 0.0085])]),
  ), [-0.18, 0, 0]);

  // 3 — Adaptateur cannelé 90-147 : bout mâle Ø 43 dans l'alésage de l'arbre menant, douille Ø 70 à cannelures
  // femelles qui reçoit l'arbre de sortie de la transmission.
  const spl = [];
  for (let i = 0; i < 16; i++) spl.push(at(box(0.05, 0.004, 0.004, 'steel'), [-0.09, DRV.y + 0.0205 * Math.cos((i * Math.PI) / 8), DRV.z + 0.0205 * Math.sin((i * Math.PI) / 8)], [(i * Math.PI) / 8, 0, 0]));
  api.part('3', group(
    T([[0, -0.064], [0.019, -0.064], [0.0205, -0.066], [0.0205, -0.118], [0.035, -0.118], [0.035, -0.198], [0.033, -0.2], [0.022, -0.2], [0.022, -0.13], [0, -0.13]], 'steel', 32),
    S.merged(spl, 'steel'),
  ), [-0.42, 0, 0]);

  // 2 — Transmission 4 vitesses : bride avant octogonale (240 sur plats) à centrage dans le carter 4 et arbre de
  // sortie cannelé, corps Ø 260 à nervures, bride arrière (220 sur plats) du moteur ; bouchons de remplissage
  // (dessus) et de vidange (dessous), reniflard.
  const Tr = { f0: A.f1, f1: A.f1 - 0.025, c1: -0.425, r0: -0.425, r1: -0.45 };
  api.part('2', group(
    T([[0, Tr.f0], [0.022, Tr.f0], [0.022, Tr.f0 + 0.05], [0.0205, Tr.f0 + 0.052], [0, Tr.f0 + 0.052]], 'steel', 24),
    T([[0, Tr.f0], [0.064, Tr.f0], [0.064, Tr.f0 + 0.01], [0, Tr.f0 + 0.01]], 'grey', 40),
    octo((Tr.f0 + Tr.f1) / 2, 0.025, 0.24, 'grey', corners(0.09).map(([u, v]) => [u, v, 0.009])),
    T([[0, Tr.c1], [0.12, Tr.c1], [0.13, Tr.c1 + 0.012], [0.13, Tr.f1 - 0.012], [0.12, Tr.f1], [0, Tr.f1]], 'grey', 56),
    ...[-0.29, -0.36].map((x) => S.ring(0.134, 0.12, 0.012, 'grey', { axis: 'x', seg: 56, pos: [x, DRV.y, DRV.z] })),
    octo((Tr.r0 + Tr.r1) / 2, 0.025, 0.22, 'grey', corners(0.081).map(([u, v]) => [u, v, 0.009])),
    cyl(0.013, 0.012, 'grey', { pos: [-0.33, DRV.y + 0.13 + 0.004, DRV.z], seg: 16 }),
    at(nut(0.02, 0.01, 'zinc'), [-0.33, DRV.y + 0.141 + 0.004, DRV.z]),
    at(nut(0.02, 0.01, 'zinc'), [-0.33, DRV.y - 0.135, DRV.z]),
    cyl(0.006, 0.02, 'zinc', { pos: [-0.27, DRV.y + 0.138, DRV.z + 0.03], seg: 10 }),
  ), [-0.5, 0, 0]);

  // 1 — Moteur hydraulique Rexroth AA6VM160HD1/63W : arbre cannelé, bride carrée 200 à 4 trous, corps de pistons,
  // bloc de raccordement arrière avec orifices A et B à bride SAE sur les côtés, régulateur hydraulique HD sur le
  // dessus, orifice de drain.
  const M = { f0: Tr.r1, f1: Tr.r1 - 0.025, b1: -0.72, p1: -0.82 };
  const sOut = -SD; // orifice de drain du côté de la broche
  api.part('1', group(
    T([[0, M.f0], [0.0235, M.f0], [0.0235, M.f0 + 0.043], [0.022, M.f0 + 0.045], [0, M.f0 + 0.045]], 'steel', 24),
    T([[0, M.f0 - 0.008], [0.0625, M.f0 - 0.008], [0.0625, M.f0 + 0.008], [0, M.f0 + 0.008]], 'blackCast', 40),
    octo((M.f0 + M.f1) / 2 - 0.004, 0.025, 0.2, 'blackCast', corners(0.08).map(([u, v]) => [u, v, 0.011]), 0.18),
    T([[0, M.b1], [0.092, M.b1], [0.1, M.b1 + 0.03], [0.1, M.f1 - 0.03], [0.095, M.f1 - 0.004], [0, M.f1 - 0.004]], 'blackCast', 48),
    at(box(M.b1 - M.p1, 0.2, 0.17, 'blackCast', { r: 0.012 }), [(M.b1 + M.p1) / 2, DRV.y, DRV.z]),
    // orifices A et B à bride SAE (quatre vis chacun) sur les flancs du bloc
    ...[-1, 1].flatMap((s) => [
      at(box(0.05, 0.06, 0.012, 'blackCast', { r: 0.003 }), [(M.b1 + M.p1) / 2, DRV.y - 0.03, DRV.z + s * 0.091]),
      ...corners(0.019).map(([u, v]) => S.bolt(0.008, 0.02, 'blackOxide', { axis: s > 0 ? 'z' : '-z', pos: [(M.b1 + M.p1) / 2 + u, DRV.y - 0.03 + v, DRV.z + s * 0.097] })),
    ]),
    // régulateur HD (bloc et chapeau) sur le dessus
    at(box(0.07, 0.04, 0.09, 'blackCast', { r: 0.004 }), [M.b1 - 0.05, DRV.y + 0.12, DRV.z]),
    at(box(0.03, 0.03, 0.03, 'zinc', { r: 0.003 }), [M.b1 - 0.05, DRV.y + 0.155, DRV.z + 0.03]),
    at(S.fitting(0.016, 0.04, 'zinc'), [M.b1 - 0.02, DRV.y + 0.1 + 0.012, DRV.z + sOut * 0.06]),
    rod([M.f1 - 0.06, DRV.y + 0.095, DRV.z], [M.f1 - 0.06, DRV.y + 0.112, DRV.z], 0.009, 'blackCast'),
  ), [-0.8, 0, 0]);

  return { view: { dir: [1.0, 0.7, -SD * 0.95] } };
}

// Avance complète V30 (P032) : mât 10 pi (P130) et tête de rotation (P138)
// modélisés, plus les composants montés autour, en formes simplifiées d'après
// les vues des pages 32 et 34 : vérins stinger 50/50 et leurs supports,
// déflecteur, plaque à coins, centreur, bras de tige, vannes, boyaux d'air.
// Repère du mât (voir mast.js) : axe du mât selon +Y, face avant vers +Z.
// L'axe de forage passe à z = AX, devant la plaque porte-tête.
import { MAST, GUIDE } from './mast.js';

const AX = 0.565; // axe de forage (tête de rotation, centreur, plaque à coins)
const SX = 0.4, SZ = 0.1; // vérins stinger, de part et d'autre du mât

export function P032(api) {
  const { box, cyl, ring, shell, tube, plate, torus, fitting, enclosure, spring, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { width: W, plateY } = MAST;

  // 32 — mât ; 33 — tête de rotation sur la plaque, 28 — cale entre plaque et tête
  P('32', api.sub('P130'), [0, 0, 0]);
  P('33', at(api.sub('P138'), [0, plateY, AX]), [0, 0.35, 1.1]);
  P('28', box(0.34, 0.36, 0.05, 'grey', { pos: [0, plateY, 0.305] }), [0, 0, 0.7]);
  // 29 — barres de guidage HH aux arêtes arrière du mât
  for (const s of [1, -1]) {
    const g = at(api.sub('P136'), [s * (W / 2 + GUIDE.thick / 2), 0.05, -MAST.depth / 2 + 0.0375]);
    if (s < 0) g.rotation.y = Math.PI;
    P('29', g, [s * 0.35, 0, -0.2]);
  }

  // 42 — vérins stinger 50/50 Ø3 1/2 x 48 (double tige), 8 — rallonges de 17 po
  const stinger = () => group(
    at(shell(0.057, 0.045, 1.7, 'black'), [0, 1.45, 0]),
    at(ring(0.064, 0.032, 0.05, 'darkSteel'), [0, 0.6, 0]),
    at(ring(0.064, 0.032, 0.05, 'darkSteel'), [0, 2.3, 0]),
    at(cyl(0.032, 0.85, 'chrome'), [0, 2.72, 0]),
    at(cyl(0.05, 0.12, 'darkSteel'), [0, 3.2, 0]),
    ...[3.16, 3.19, 3.22].map((y) => at(torus(0.05, 0.004, 'darkSteel'), [0, y, 0])),
    at(cyl(0.032, 0.6, 'chrome'), [0, 0.3, 0]),
  );
  for (const s of [1, -1]) {
    P('42', at(stinger(), [s * SX, 0, SZ]), [s * 0.75, 0, 0]);
    P('8', group(
      at(cyl(0.03, 0.45, 'steel'), [0, -0.225, 0]),
      at(cyl(0.065, 0.03, 'darkSteel'), [0, -0.465, 0]),
    ).translateX(s * SX).translateZ(SZ), [s * 0.75, -0.35, 0]);
  }
  // Supports des stinger : 23 (3), 24 (2), 25 (3) — bras depuis le flanc du mât et collier
  const bracket = (s, y, w) => group(
    at(box(SX - W / 2 + 0.02, 0.03, w, 'grey'), [s * (W / 2 + (SX - W / 2) / 2), y, SZ - 0.04]),
    at(ring(0.085, 0.057, 0.06, 'grey'), [s * SX, y, SZ]),
    at(box(0.04, 0.06, 0.03, 'grey'), [s * (SX + 0.1), y, SZ]),
  );
  [[1, 2.9, '23'], [1, 1.95, '23'], [-1, 2.9, '23'], [1, 1.45, '25'], [-1, 1.95, '25'], [-1, 1.0, '25'], [1, 0.45, '24'], [-1, 0.45, '24']]
    .forEach(([s, y, ref]) => P(ref, bracket(s, y, ref === '24' ? 0.16 : 0.14), [s * 0.5, 0, 0]));
  // 26 — collier de boyau sur le vérin droit
  P('26', group(
    at(ring(0.075, 0.058, 0.03, 'steel'), [SX, 2.05, SZ]),
    at(box(0.03, 0.03, 0.05, 'steel'), [SX + 0.09, 2.05, SZ]),
  ), [0.6, 0, 0.2]);
  // 35 / 36 — clapets d'équilibrage des stinger (droit / gauche)
  P('35', at(box(0.08, 0.1, 0.08, 'blue', { r: 0.006 }), [SX + 0.11, 1.75, SZ]), [0.45, 0, 0]);
  P('36', at(box(0.08, 0.1, 0.08, 'blue', { r: 0.006 }), [-SX - 0.11, 2.0, SZ]), [-0.45, 0, 0]);

  // Bas de l'avance : 2 déflecteur, 7 plaque à coins, 22 centreur fendu, 34 mâchoires Ø5 po
  P('2', group(
    plate(1.2, 0.9, 0.02, 'lightGrey', { holes: [[0, -0.1, 0.09]] }).translateY(-0.55),
    ...[1, -1].map((s) => at(box(0.015, 0.45, 0.9, 'lightGrey'), [s * 0.6, -0.33, 0])),
    at(box(1.2, 0.3, 0.015, 'lightGrey'), [0, -0.4, -0.45]),
  ).translateZ(AX + 0.1), [0, -0.6, 0.6]);
  P('7', at(plate(0.46, 0.4, 0.04, 'grey', { holes: [[0, 0, 0.07]], r: 0.03 }), [0, 0.06, AX]), [0, -0.2, 0.75]);
  P('22', group(
    ...[1, -1].map((s) => at(box(0.05, 0.08, AX - 0.21, 'grey'), [s * 0.14, 0.4, (0.21 + AX) / 2])),
    at(ring(0.15, 0.085, 0.08, 'grey'), [0, 0.4, AX]),
    ...[1, -1].map((s) => at(cyl(0.035, 0.22, 'black', { axis: 'x' }), [s * 0.2, 0.4, AX - 0.12])),
  ), [0, 0, 0.95]);
  P('34', ring(0.084, 0.0635, 0.07, 'darkSteel', { pos: [0, 0.4, AX] }), [0, 0.25, 1.25]);
  // 30 — bloc de distribution du centreur, 40 / 41 — raccords rapides 1/4 et 3/8
  P('30', at(box(0.16, 0.12, 0.08, 'steel', { r: 0.004 }), [-0.32, 0.22, 0.3]), [-0.35, -0.2, 0.3]);
  P('40', at(fitting(0.014, 0.035, 'brass', { axis: 'z' }), [-0.36, 0.22, 0.35]), [-0.45, -0.3, 0.45]);
  P('41', at(fitting(0.018, 0.04, 'brass', { axis: 'z' }), [-0.29, 0.22, 0.35]), [-0.4, -0.3, 0.45]);

  // 18 — bras de tige à axe unique (côté droit) : arbre, actionneur, deux pinces sur l'axe
  P('18', group(
    at(cyl(0.035, 0.95, 'grey'), [0.33, 1.15, 0.42]),
    at(cyl(0.065, 0.2, 'black'), [0.33, 0.75, 0.42]),
    ...[0.9, 1.45].flatMap((y) => [
      at(box(0.36, 0.05, 0.08, 'grey'), [0.17, y, (0.42 + AX) / 2]),
      at(ring(0.1, 0.066, 0.06, 'grey'), [0, y, AX]),
    ]),
  ), [0.9, 0, 0.5]);

  // Vannes et blocs sur les flancs : 5 / 14 clapets, 11 / 12 dérivation, 37 sélecteur
  P('5', at(box(0.05, 0.09, 0.07, 'steel', { r: 0.004 }), [W / 2 + 0.03, 1.4, -0.05]), [0.35, 0, 0]);
  P('14', at(box(0.05, 0.09, 0.07, 'steel', { r: 0.004 }), [-W / 2 - 0.03, 1.45, -0.05]), [-0.35, 0, 0]);
  P('11', at(box(0.06, 0.08, 0.08, 'steel', { r: 0.004 }), [W / 2 + 0.035, 0.3, -0.04]), [0.4, -0.1, 0]);
  P('12', at(box(0.06, 0.08, 0.08, 'steel', { r: 0.004 }), [W / 2 + 0.035, 0.45, -0.04]), [0.4, 0, 0]);
  P('37', group(
    at(box(0.06, 0.12, 0.12, 'blue', { r: 0.006 }), [0, 0, 0]),
    at(cyl(0.008, 0.08, 'steel', { axis: 'x' }), [0.06, 0.03, 0]),
    at(cyl(0.015, 0.03, 'red', { axis: 'x' }), [0.1, 0.03, 0]),
  ).translateX(W / 2 + 0.035).translateY(1.0).translateZ(-0.05), [0.45, 0, 0]);
  // 10 — ligne de graissage le long du flanc droit (raccords de graissage)
  P('10', group(
    tube([[W / 2 + 0.012, 0.6, 0.115], [W / 2 + 0.012, 2.2, 0.115]], 0.004, 'steel', { sharp: true, seg: 2 }),
    ...[0.8, 1.1, 1.4, 1.7, 2.0].map((y) => at(fitting(0.01, 0.02, 'brass', { axis: 'x' }), [W / 2 + 0.014, y, 0.115])),
  ), [0.3, 0, 0.1]);

  // Haut du mât : 27 garde de bride, 3 capteur de course, 4 support de boîte de jonction
  P('27', group(
    at(cyl(0.12, 0.1, 'grey', { seg: 36 }), [0, MAST.length + 0.06, MAST.cylZ]),
    at(box(0.3, 0.012, 0.3, 'grey'), [0, MAST.length + 0.006, MAST.cylZ]),
  ), [0, 0.45, 0]);
  P('3', group(
    at(box(0.07, 0.14, 0.07, 'darkSteel', { r: 0.005 }), [0.14, MAST.length + 0.08, -0.12]),
    at(cyl(0.012, 0.06, 'black'), [0.14, MAST.length + 0.18, -0.12]),
  ), [0.25, 0.5, -0.2]);
  P('4', at(enclosure(0.1, 0.24, 0.16, 'grey'), [W / 2 + 0.08, 2.35, -0.12]), [0.45, 0, -0.1]);

  // Air : 44 adaptateur et 43 coude orientable sur l'émerillon, 45 / 47 / 46 boyaux 2 po,
  // 9 support de traversée, 6 support anti-fouet, 31 butée d'émerillon, 1 attaches de sécurité
  const yAir = plateY + 0.147 + 0.305;
  P('44', at(fitting(0.04, 0.05, 'steel', { axis: 'x' }), [0.06, yAir, AX]), [0.3, 0.3, 0]);
  P('43', at(fitting(0.045, 0.06, 'steel', { axis: 'x', elbow: true }), [0.11, yAir, AX]), [0.45, 0.35, 0]);
  const bk = [0.46, 2.72, 0.4];
  P('9', group(
    at(box(0.02, 0.16, 0.22, 'grey'), bk),
    ...[-0.06, 0.06].map((dz) => at(fitting(0.03, 0.04, 'steel', { axis: 'x' }), [bk[0] + 0.02, bk[1], bk[2] + dz])),
  ), [0.55, 0.2, 0]);
  P('45', tube([[0.14, yAir, AX + 0.03], [0.3, yAir + 0.02, AX + 0.02], [bk[0], bk[1] + 0.02, bk[2] + 0.06]], 0.033, 'black', { seg: 24 }), [0.4, 0.4, 0.3]);
  P('47', tube([[bk[0] + 0.05, bk[1], bk[2] - 0.06], [0.6, 3.25, 0.15], [0.58, 3.2, -0.25], [0.52, 2.6, -0.32]], 0.033, 'black', { seg: 40 }), [0.6, 0.45, 0]);
  P('46', tube([[0.52, 2.6, -0.32], [0.6, 1.6, -0.4], [0.45, 0.4, -0.45], [0.1, 0.02, -0.5]], 0.033, 'black', { seg: 60 }), [0.6, 0, -0.35]);
  P('6', at(box(0.1, 0.04, 0.06, 'grey'), [0.58, 3.08, 0.0]), [0.55, 0.5, 0]);
  P('31', group(
    at(box(0.03, 0.22, 0.03, 'grey'), [-0.12, plateY + 0.42, 0.42]),
    at(box(0.03, 0.03, 0.15, 'grey'), [-0.12, plateY + 0.52, 0.49]),
  ), [-0.4, 0.4, 0.2]);
  [[0.3, yAir + 0.02, AX + 0.02], [0.6, 3.25, 0.15], [0.52, 2.6, -0.32], [0.45, 0.4, -0.45]]
    .forEach((p) => P('1', at(torus(0.04, 0.004, 'safety'), p), [0.25, 0, 0]));

  // 39 — boucle de boyaux de la tête ; 38 — câble d'arrêt d'urgence (ressort + câble)
  P('39', tube([[-0.38, plateY - 0.12, AX + 0.04], [-0.5, plateY - 0.6, AX + 0.05], [-0.45, 1.2, 0.4], [-0.3, 0.9, 0.3]], 0.016, 'black', { seg: 48 }), [-0.5, 0, 0.3]);
  P('38', group(
    tube([[-0.34, 2.3, 0.3], [-0.36, 1.3, 0.3]], 0.003, 'safety', { sharp: true, seg: 2 }),
    at(spring(0.012, 0.002, 0.12, 10, 'steel'), [-0.34, 2.36, 0.3]),
    at(box(0.06, 0.05, 0.05, 'safety', { r: 0.006 }), [-0.36, 1.26, 0.3]),
  ), [-0.6, 0, 0.3]);
  return { view: { dir: [1.15, 0.5, 1.25] } };
}

// P064 — Trousse de boyaux du centreur fendu, mât 10 pi HH : CX032877 rév. 2
// « HOSE KIT, 10`HH SPLIT CENT. » (dessins pages 64, 66 et 68, listes 65, 67,
// 69), repère 17 de l'avance P032. Vingt-quatre lignes, quarante-huit pièces :
// raccords zingués JIC 37° -06 — té à branche tournante (1, FA01007) et coude
// tournant 90° (2, FA01009) du bloc du centreur, tés tournants (3, FA01011),
// unions droites mâle / mâle (4, FA01014), tés union mâles (5, FA01015), coudes
// ORB-04 / JIC-06 (6, FA01052-04-06) des orifices de vérins, adaptateurs droits
// ORB-06 / JIC-06 (7, FA01055-06) du bloc — et vingt-trois flexibles -06 deux
// tresses compact (Ø 19 mm) à embouts sertis : HA06000-L droit / droit,
// HA06001-L droit / 45°, HA06002-L droit / 90° ; L = longueur hors tout (po).
// Les raccords 1, 2 et 7 sont aussi listés par le bloc P126 et quatre coudes 6
// par P092 (vérins de pivotement) : dessinés ici une seule fois, sur le bloc
// et sur les vérins du centreur et de la plaque à coins.
// Repère : celui de P032 (feed.js, mast.js) — axe du mât selon +Y (pied à
// y = 0), face avant (tête de rotation) vers +Z, axe de forage z = 0.565 ;
// P032 insère la trousse à l'origine.
//
// Circuit supposé (bulles des trois dessins, sans schéma) :
//   · Arrivées : deux unions 4 en relais sur le coin avant du flanc −X
//     (y ≈ 0.93, sous le support stinger), bout haut libre pour les boyaux de
//     P090 (comme les unions de P084) ; 13 (32 1/2 po) et 11 (34 po), embout
//     90° sur le bloc, descendent aux adaptateurs P et T du dessus du bloc
//     P126 (P032 repère 30).
//   · Bloc → clapets de charge P042 (centreur / pivotement) : quatre 8 (7 po,
//     détail A) des adaptateurs de la face +X du bloc aux adaptateurs VALVE de
//     P042, face à face.
//   · Mâchoires (vérins du centreur, feed.js : x = ±0.2, y = 0.4, z = 0.445) :
//     tés de P042 (bloc haut, passage vers +X, branche vers le haut) → coudes 6
//     sur le dessus des vérins : 21 (22) et 16 (22 1/2, embout 90°) côté +X,
//     22 (20 1/2) et 23 (21 1/2) côté −X.
//   · Pivotement (vérins Ø 3 × 4 1/2 P094 de P092) : tés tournants 3 sur les
//     adaptateurs CYL du bloc bas de P042 → coudes de P092 : 17 (34 1/2) et
//     19 (40) côté +X, 18 (35) et 20 (39 1/2, embout 90°) côté −X.
//   · Plaque à coins (P056 sur le flanc −X, vérins de coins CX077208 de P044) :
//     té à branche tournante 1 du dessus du bloc → deux 9 (57 po) qui montent
//     aux coudes VALVE de P056 ; coudes CYL de P056 → 12 (72 po × 2, embout
//     90°) qui redescendent aux tés union 5 près du vérin de coin −X ; tés →
//     14 (14 3/4, embout 45°) et 15 (12, embout 45°) vers le vérin −X, 9
//     (57) et 10 (53, embout 90°) vers le vérin +X par l'avant du centreur.
//   · Drain : coude tournant 2 sous le bloc → 24 (180 po), remontée par
//     l'arrière du flanc −X, passage derrière le haut du mât et descente sur
//     le flanc +X jusqu'à la troisième union 4 (y ≈ 2.75), bout bas libre
//     (ligne de retour supposée, comme le 180 po de P088).
// Points de raccordement supposés (composants d'autres ensembles, non
// dessinés ici ; poses exportées dans KIT064) :
//   · bloc P126 = boîte du repère 30 de feed.js (x −0.40…−0.24, y 0.16…0.28,
//     z 0.26…0.34) : quatre orifices face +X (2 × 2, pas 28 mm, en face des
//     orifices VALVE de P042), trois sur le dessus, un dessous ;
//   · P042 posé sous le centreur, en (0.012, 0.17, 0.30), axes tournés :
//     X de P042 → −Z, orifices VALVE vers −X (le bloc), CYL vers +X ;
//   · P056 sur le flanc −X, semelle contre le flanc à (−0.23, 1.29, −0.11),
//     X de P056 → +Y, Y → −X (VALVE vers l'arrière, CYL vers l'avant) ;
//   · vérins de pivotement : axe Z en x = ±0.33, y = 0.24 (Ø 3 po), orifices
//     sur le dessus en z = 0.46 (coude vers l'axe) et 0.62 (coude vers l'extérieur) ;
//   · vérins de coins : axe Z en x = ±0.27, y = 0.10 (Ø 2 po), orifices sur
//     le dessus en z = 0.45 et 0.66 ;
//   · orifices des vérins du centreur sur le dessus, à |x| = 0.185 et 0.29.
// Écarts : feed.js ne dessine ni P092 (vérins de pivotement), ni les vérins
// de coins, ni P042 / P056 à ces places ; la répartition des fonctions entre
// boyaux est déduite des longueurs et des vues ; le 24 (180 po) n'a pas de
// destination visible sur les dessins (deux bulles au pied) : tracé estimé.
// Encombrement ≈ 1.0 (X, de −0.51 à 0.48) × 3.3 (Y, de −0.12 à 3.16) × 1.2
// (Z, de −0.35 à 0.85) m.
import { IN, LCV, loadCheckValve, place, seat, straight, elbow, tee, union } from './_avance_a.js';
import { v3, mount, xs, seatOf, addHose } from './_avance_a_hk2.js';

// Bloc P126 (boîte de feed.js) et clapets P042 / P056.
const BLK = { x0: -0.4, x1: -0.24, y0: 0.16, y1: 0.28, z: 0.3 };
const O42 = [0.012, 0.17, 0.3];
const M42 = mount(O42, [0, 0, -1], [0, 1, 0]);
const M56 = mount([-0.23, 1.29, -0.11], [0, 1, 0], [-1, 0, 0]);
// Vérins (orifices).
const JAW = { y: 0.4, z: 0.445, r: 0.035, xs: [0.185, 0.29] };
const SWG = { x: 0.33, y: 0.24, r: 1.5 * IN, zs: [0.46, 0.62] };
const WDG = { x: 0.27, y: 0.1, r: 1.0 * IN, zs: [0.45, 0.66] };
// Relais (unions) et tés union.
const U = [[-0.3, 0.93, 0.172], [-0.3, 0.95, 0.202]];
const U3 = [0.3, 2.75, -0.17];
const UT = [[-0.19, 0.17, 0.535], [-0.2, 0.17, 0.61]];

export const KIT064 = {
  block: BLK,
  P042: { at: O42, X: [0, 0, -1], Y: [0, 1, 0] },
  P056: { at: [-0.23, 1.29, -0.11], X: [0, 1, 0], Y: [-1, 0, 0] },
  swing: SWG, wedge: WDG, jaw: JAW,
};

export default function P064(api) {
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const H = (ref, L, a, b, opts, e) => addHose(api, ref, L, 6, a, b, opts, e);
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
  const NX = [-1, 0, 0], NY = [0, -1, 0], NZ = [0, 0, -1];
  const E = (s, end, t) => ({ ...s, end, t });

  // ------------------------------------------------ P042 (non dessiné) : sièges
  const lcv = loadCheckValve().userData.ports;
  const p42 = (k, key) => {
    const q = lcv[key];
    return { p: q.p.clone().add(v3([0, k * LCV.y, 0])), d: q.d.clone() };
  };
  // VALVE (adaptateurs droits), repère de P032 ; CYL haut : tés (passage, branche) ;
  // CYL bas : adaptateurs (où se vissent les tés tournants 3).
  const valve = [0, 1].flatMap((k) => ['VALVE1', 'VALVE2'].map((key) => {
    const q = p42(k, key);
    return xs(M42, seatOf(straight('npt', 4, 6), q.p, q.d));
  }));
  const cylTee = ['CYL1', 'CYL2'].map((key) => {
    const q = p42(1, key);
    const t = place(tee('npt', 4, 6), q.p, q.d, [0, 1, 0]);
    return { run: xs(M42, seat(t, 0)), br: xs(M42, seat(t, 1)) };
  });
  const cylLow = ['CYL1', 'CYL2'].map((key) => {
    const q = p42(0, key);
    return xs(M42, seatOf(straight('npt', 4, 6), q.p, q.d));
  });

  // ------------------------------------------------ P056 (non dessiné) : sièges
  const v56 = loadCheckValve().userData.ports;
  const s56 = (key, ang) => xs(M56, seatOf(elbow('npt', 4, 6, { angle: ang }), v56[key].p, v56[key].d, [0, 1, 0]));
  const val56 = [s56('VALVE1', 90), s56('VALVE2', 90)];
  const cyl56 = [s56('CYL1', 45), s56('CYL2', 45)];

  // ------------------------------------------------ 7 — adaptateurs du bloc P126
  const ad = (pos, dir, e) => {
    const g = place(straight('orb', 6, 6), pos, dir);
    P('7', g, e);
    return seat(g);
  };
  // Face +X : 2 × 2, en face des orifices VALVE de P042 (même y, même z).
  const blkX = valve.map((v) => ad([BLK.x1, v.p.y, v.p.z], X, [0.05, 0, 0]));
  // Dessus : té à branche tournante (T1), P (T2), T (T3) ; dessous : coude tournant.
  const t1 = ad([-0.37, BLK.y1, BLK.z], Y, [0, 0.05, 0]);
  const t2 = ad([-0.32, BLK.y1, BLK.z], Y, [0, 0.05, 0]);
  const t3 = ad([-0.27, BLK.y1, BLK.z], Y, [0, 0.05, 0]);
  const b1 = ad([-0.32, BLK.y0, BLK.z], NY, [0, -0.05, 0]);

  // 1 — té à branche tournante sur T1 (branche vers l'arrière) ; 2 — coude tournant sous le bloc.
  const g1 = place(tee('swivel', 6, 6), t1.p, t1.d, NZ);
  P('1', g1, [0, 0.1, 0]);
  const brTee = { run: seat(g1, 0), br: seat(g1, 1) };
  const g2 = place(elbow('swivel', 6, 6), b1.p, b1.d, NX);
  P('2', g2, [0, -0.1, 0]);
  const drain = seat(g2);

  // ------------------------------------------------ 3 — tés tournants sur CYL bas de P042
  // (branche vers l'avant sur CYL 1, vers le bas sur CYL 2)
  const swT = cylLow.map((s, i) => {
    const g = place(tee('swivel', 6, 6), s.p, s.d, i ? NY : Z);
    P('3', g, [0.08, -0.03, 0]);
    return { run: seat(g, 0), br: seat(g, 1) };
  });

  // ------------------------------------------------ 6 — coudes des vérins
  const elb6 = (pos, out, e) => {
    const g = place(elbow('orb', 4, 6), pos, Y, out);
    P('6', g, e);
    return seat(g);
  };
  // Centreur (mâchoires) : orifices sur le dessus, sorties vers l'arrière.
  const jaw = {};
  for (const s of [-1, 1]) {
    JAW.xs.forEach((x, i) => {
      jaw[`${s}${i}`] = elb6([s * x, JAW.y + JAW.r, JAW.z], NZ, [0, 0.06, 0]);
    });
  }
  // Vérins de coins : orifice arrière vers −Z (côté −X) / vers l'extérieur (côté +X),
  // orifice avant vers +Z.
  const wdg = {};
  for (const s of [-1, 1]) {
    wdg[`${s}0`] = elb6([s * WDG.x, WDG.y + WDG.r, WDG.zs[0]], s < 0 ? NZ : X, [s * 0.04, 0.05, 0]);
    wdg[`${s}1`] = elb6([s * WDG.x, WDG.y + WDG.r, WDG.zs[1]], Z, [s * 0.04, 0.05, 0]);
  }
  // Vérins de pivotement (coudes de P092, non dessinés ici) : sièges.
  const swg = {};
  for (const s of [-1, 1]) {
    swg[`${s}0`] = seatOf(elbow('orb', 4, 6), [s * SWG.x, SWG.y + SWG.r, SWG.zs[0]], Y, [-s, 0, 0]);
    swg[`${s}1`] = seatOf(elbow('orb', 4, 6), [s * SWG.x, SWG.y + SWG.r, SWG.zs[1]], Y, [s, 0, 0]);
  }

  // ------------------------------------------------ 4 — unions (relais) ; 5 — tés union
  const un = U.map((p) => {
    const g = place(union(6), p, Y);
    P('4', g, [-0.12, 0, 0]);
    return { up: seat(g, 0), down: seat(g, 1) };
  });
  const g3 = place(union(6), U3, Y);
  P('4', g3, [0.12, 0, 0]);
  const u3 = { up: seat(g3, 0), down: seat(g3, 1) };
  // Tés union : mâle A vers le bas (siège à la pose), passage vers le haut, branche vers +Z.
  const ut = UT.map((p) => {
    const g = place(tee('jic', 6, 6), p, Y, Z);
    P('5', g, [-0.06, 0, 0.08]);
    return { run: seat(g, 0), br: seat(g, 1), a: seat(g, 2) };
  });

  // ------------------------------------------------ flexibles
  // 13 / 11 : unions → P et T du bloc (embout 90°, douille vers l'arrière).
  H('13', 32.5, un[0].down, E(t2, '90', NZ), { vias: [[-0.31, 0.55, 0.2]], sag: [-0.4, 0, 1] }, [-0.12, 0, 0]);
  H('11', 34, un[1].down, E(t3, '90', NZ), { vias: [[-0.28, 0.55, 0.23]], sag: [-0.4, 0, 1] }, [-0.12, 0, 0.03]);

  // 8 : bloc → VALVE de P042, face à face.
  blkX.forEach((s, i) => H('8', 7, s, valve[i], { sag: i < 2 ? NY : Y }, [0.03, 0, 0.12]));

  // Mâchoires : tés de P042 → dessus des vérins du centreur.
  H('21', 22, cylTee[0].run, jaw['10'], { vias: [[0.17, 0.3, 0.34]], sag: NY }, [0.06, 0.06, 0.1]);
  H('16', 22.5, cylTee[1].run, E(jaw['11'], '90', NY), { vias: [[0.22, 0.28, 0.3]], sag: NY }, [0.08, 0.06, 0.1]);
  H('22', 20.5, cylTee[0].br, jaw['-10'], { vias: [[-0.08, 0.33, 0.33]], sag: Y }, [-0.06, 0.08, 0.1]);
  H('23', 21.5, cylTee[1].br, jaw['-11'], { vias: [[-0.12, 0.46, 0.33]], sag: Y }, [-0.08, 0.08, 0.1]);

  // Pivotement : tés tournants 3 → coudes des vérins de P092.
  H('17', 34.5, swT[0].run, swg['10'], { vias: [[0.2, 0.22, 0.38]], sag: [0.5, 0.5, -0.5] }, [0.12, -0.04, 0.06]);
  H('19', 40, swT[1].run, swg['11'], { vias: [[0.2, 0.18, 0.27], [0.43, 0.24, 0.5]], sag: Y }, [0.14, -0.04, 0.08]);
  H('18', 35, swT[0].br, swg['-10'], { vias: [[-0.1, 0.22, 0.45]], sag: [0, 0.3, 1] }, [-0.12, -0.04, 0.06]);
  H('20', 39.5, swT[1].br, E(swg['-11'], '90', NY), { vias: [[-0.12, 0.12, 0.31], [-0.42, 0.22, 0.52]], sag: NX }, [-0.14, -0.04, 0.08]);

  // Plaque à coins : té 1 → VALVE de P056 (9 × 2), CYL de P056 → tés union (12 × 2).
  const lane9 = (dz) => [[-0.264, 0.6, 0.165 + dz], [-0.264, 1.05, 0.165 + dz], [-0.29, 1.24, -0.02 + dz]];
  H('9', 57, brTee.run, val56[0], { vias: lane9(0), sag: NY }, [-0.2, 0.02, 0]);
  H('9', 57, brTee.br, val56[1], { vias: lane9(0.025), sag: NY }, [-0.22, 0.02, 0]);
  const lane12 = (dx) => [[-0.27 + dx, 1.22, 0.02], [-0.26 + dx, 1.12, 0.2], [-0.25 + dx, 0.7, 0.245], [-0.2 + dx, 0.5, 0.55 + dx]];
  H('12', 72, cyl56[0], E(ut[0].run, '90', NZ), { vias: lane12(0), sag: Z }, [-0.24, 0, 0.06]);
  H('12', 72, cyl56[1], E(ut[1].run, '90', NZ), { vias: lane12(-0.02), sag: Z }, [-0.26, 0, 0.06]);
  // Tés union → vérins de coins : 14 / 15 côté −X, 9 / 10 côté +X par l'avant.
  H('14', 14.75, ut[0].a, E(wdg['-10'], '45', X), { sag: X }, [-0.06, -0.03, 0.08]);
  H('15', 12, ut[1].a, E(wdg['-11'], '45', X), { sag: X }, [-0.06, -0.03, 0.1]);
  H('9', 57, ut[0].br, wdg['10'], { vias: [[-0.33, 0.14, 0.64], [-0.15, 0.12, 0.8], [0.18, 0.12, 0.81], [0.36, 0.13, 0.6]], sag: NY }, [0.02, -0.04, 0.14]);
  H('10', 53, ut[1].br, E(wdg['11'], '90', NZ), { vias: [[-0.34, 0.15, 0.7], [-0.14, 0.15, 0.8], [0.15, 0.15, 0.82]], sag: NY }, [0.04, -0.04, 0.16]);

  // 24 : drain sous le bloc → derrière le flanc −X → haut du mât → union du flanc +X.
  H('24', 180, drain, u3.up, {
    vias: [[-0.42, 0.16, 0.12], [-0.3, 0.2, -0.17], [-0.3, 1.6, -0.17], [-0.3, 2.95, -0.2],
      [-0.22, 3.12, -0.25], [0.31, 3.08, -0.25], [0.31, 2.9, -0.21]],
    sag: NZ,
  }, [0, 0, -0.2]);

  void IN; void v3;
  return { view: { dir: [-0.9, 0.45, 1.1] } };
}

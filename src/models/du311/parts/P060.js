// P060 — Trousse de boyaux du déflecteur V30 : CX032552 rév. 1 « HOSE KIT,
// V30 DEFLECTOR » (pages 60 et 62), repère 16 de l'avance P032. Circuit des
// deux vérins Ø 2 × 6 po du déflecteur (P036 repère 8, P038) : quatre
// adaptateurs droits 1/4 NPT / JIC-06 (1) dans les deux paires de raccords
// rapides 1/4 po (P160, repère 40 de P032), quatre coudes 90° ORB / JIC-06 (2)
// sur les orifices des vérins, neuf flexibles -06 (3/8 po, deux tresses
// compact, Ø 19 mm, embouts sertis zingués à écrou tournant JIC 37°) :
// HA06000-L droit / droit, HA06003-15 coudé 90° / 90° ; L = longueur hors
// tout en pouces.
// Tracés (bulles des pages 60 et 62) :
//   · 9 (9 po) et 10 (11 1/2 po) : du sélecteur 37 (P152, collé au fût du
//     vérin stinger −X, coudes du flanc +X tournés vers le bas) aux douilles
//     des raccords rapides, en S le long du fût (vues 9 et 10) ;
//   · 8 (77 po × 2) : des embouts mâles des raccords rapides, descente le long
//     du fût puis sur la semelle du pied, jusqu'aux coudes 45° des orifices
//     VALVE du clapet de charge 12 (P052) (vue 8) ;
//   · 7 (15 po, 90° / 90°) : boucle de l'adaptateur droit CYL 1 du clapet 12
//     au coude d'entrée du régulateur de débit 11 (P050) (vue 7) ;
//   · 3 (20 po) / 4 (30 po) : régulateur (sortie restreinte) → fond du vérin
//     +X, té tournant du clapet (branche) → tige du vérin +X (blocs voisins) ;
//   · 5 (41 po) / 6 (49 po) : coude tournant du clapet → tige du vérin −X,
//     régulateur (2e sortie) → fond du vérin −X, à plat le long du bord avant
//     (vues 5 et 6).
// Repère : celui de P032 (feed.js, mast.js) — axe du mât selon +Y (pied à
// y = 0), face avant (tête de rotation) vers +Z ; P032 insère la trousse à
// l'origine. Les ensembles qui reçoivent les boyaux sont placés par P032 ;
// leurs poses supposées ici sont exportées (KIT060) :
//   · sélecteur P152 sur le vérin stinger −X : origine en (−0.4, 1.0, 0.1),
//     sans rotation (sélecteur derrière le fût, comme son en-tête) ;
//   · raccords rapides P160 accouplés, axes verticaux (douille en haut), sous
//     les coudes du sélecteur, plan d'accouplement vers y = 0.72 (vues 9 / 10 :
//     au niveau du bras du support stinger) ;
//   · pied de mât (non modélisé par feed.js) : dessus de la semelle à
//     y = −0.47 (niveau des patins des rallonges de tige stinger), bord avant
//     à z = 0.74 ; clapet 12 (P052) couché sur la semelle, au coin opposé au
//     sélecteur (vues 7 / 8), cuvette en haut, en (0.30, −0.47, 0.36) ;
//     régulateur 11 (P050) couché devant lui, en (0.36, −0.47, 0.52) ;
//   · vérins du déflecteur couchés sur la marche basse du bord avant (axe
//     y = −0.52, z = 0.70), tiges vers le milieu : orifices de fond à
//     x = ±0.44, de tige à x = ±0.24, coudes ouverts vers le haut et l'arrière.
// Écarts : le dessin met les deux blocs sur la semelle du pied à côté du
// passage de tige stinger, sans cote ; feed.js les place encore sur le flanc
// +X du mât (y 0.3 / 0.45) et le déflecteur à y = −0.55 en forme simplifiée.
// Adaptateurs des embouts mâles des raccords rapides : vissés sur la queue
// 1/4 NPT mâle (le dessin ne montre pas de manchon).
// Encombrement ≈ 1.0 (X, de −0.50 à 0.50) × 1.25 (Y, de −0.56 à 0.93) × 0.86
// (Z, de −0.05 à 0.84) m.
import { IN, LCV, place, seat, straight, elbow, tee, union, loadCheckValve } from './_avance_a.js';
import { v3, mount, xs, seatOf, ahead, addHose } from './_avance_a_hk2.js';

// Sélecteur P152 (cotes de son fichier) : fût Ø 4 po, platine 3/8, cale 1 po,
// corps 2 1/4 × 3 × 2 po centré à y = −0.035 (local).
const SEL = [-0.4, 1.0, 0.1];
const P152_ZV = -(2 * IN + 0.012) - 0.375 * IN - 1.0 * IN - 1.0 * IN;
const P152_W = 2.25 * IN, P152_YV = -0.035;
// Pied de mât et vérins du déflecteur.
const YF = -0.47, ZFRONT = 0.74;
const CYL = { y: YF - 0.05, z: 0.7, r: 1.25 * IN, cap: 0.44, rod: 0.24 };
const M052 = mount([0.3, YF, 0.36], [-1, 0, 0], [0, 0, 1]);
const M050 = mount([0.36, YF, 0.52], [0, 0, 1], [1, 0, 0]);

export const KIT060 = {
  selector: { at: SEL },
  foot: { y: YF, front: ZFRONT },
  P052: { at: [0.3, YF, 0.36], X: [-1, 0, 0], Y: [0, 0, 1] },
  P050: { at: [0.36, YF, 0.52], X: [0, 0, 1], Y: [1, 0, 0] },
  cylinders: CYL,
};

export default function P060(api) {
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const H = (ref, L, a, b, opts, e) => addHose(api, ref, L, 6, a, b, opts, e);

  // ------------------------------------------------ sièges des ensembles voisins
  // Sélecteur : coudes du flanc +X (haut / bas), sortie vers le bas et l'arrière.
  const selSeat = (dy) => {
    const s = seatOf(elbow('orb', 6, 6), [P152_W / 2, P152_YV + dy, P152_ZV], [1, 0, 0], [0, -1, -0.3]);
    return { p: s.p.add(v3(SEL)), d: s.d };
  };
  const sHi = selSeat(0.018), sLo = selSeat(-0.022);

  // Clapet 12 (P052) : mêmes raccords que son fichier, dans son repère.
  const lcv = loadCheckValve();
  const g052 = place(lcv, [0, 0, 0], [0, 0, 1], [-1, 0, 0]);
  const T052 = (k) => {
    const q = lcv.userData.ports[k];
    return { p: q.p.clone().applyQuaternion(g052.quaternion), d: q.d.clone().applyQuaternion(g052.quaternion) };
  };
  const c1 = T052('CYL1'), c2 = T052('CYL2');
  const [cA, cB] = c1.p.x < c2.p.x ? [c1, c2] : [c2, c1];
  const s6 = seatOf(straight('npt', 4, 6), cA.p, cA.d);
  const e5 = place(elbow('npt', 4, 6), cB.p, cB.d, [1, 0, 0]);
  const t3 = place(tee('swivel', 6, 6), seat(e5).p, seat(e5).d, [0, -1, 0]);
  const tRun = seat(t3, 0), tBr = seat(t3, 1);
  const e2 = seatOf(elbow('swivel', 6, 6), tRun.p, tRun.d, [0, -1, 0]);
  const valve = ['VALVE1', 'VALVE2'].map((k) => {
    const w = T052(k);
    return xs(M052, seatOf(elbow('npt', 4, 6, { angle: 45 }), w.p, w.d, [0, 0, 1]));
  });
  const L052 = { s6: xs(M052, s6), tee: xs(M052, tBr), elb: xs(M052, e2) };

  // Régulateur 11 (P050) : coude d'entrée (flanc −X, sortie vers +Y local),
  // deux réducteurs calibrés sur le flanc +X (siège = bout du mâle).
  const W50 = 2 * IN, H50 = 3 * IN, D50 = 1.25 * IN;
  const in50 = xs(M050, seatOf(elbow('orb', 6, 6), [-W50 / 2, H50 / 2 - 1.05 * IN, D50 / 2], [-1, 0, 0], [0, 1, 0]));
  const uTip = union(6).userData.ports[0].p.y;
  const out50 = [H50 / 2 - 1.05 * IN, -H50 / 2 + 0.75 * IN].map((y) =>
    xs(M050, ahead(seatOf(straight('orb', 6, 6), [W50 / 2, y, D50 / 2], [1, 0, 0]), 2 * uTip)));

  // ------------------------------------------------ 1 — adaptateurs des raccords rapides
  // Deux paires accouplées sous les coudes du sélecteur, à 28 mm d'entraxe ;
  // douille : embouchure à yq, six pans percé 1/4 NPT jusqu'à yq + 41.5 mm ;
  // embout mâle : queue 1/4 NPT jusqu'à yq − 27 mm.
  const qx = [sLo.p.x + 0.014, sLo.p.x - 0.014];
  const qz = sLo.p.z + 0.004;
  const ad = straight('npt', 4, 6);
  const adTip = ad.userData.ports[0].p.y;
  const yq = sLo.p.y - 0.218 - 0.0415 - adTip;
  const qdTop = [], qdBot = [];
  qx.forEach((x) => {
    const top = place(straight('npt', 4, 6), [x, yq + 0.0415, qz], [0, 1, 0]);
    P('1', top, [0, 0.07, 0]);
    qdTop.push(seat(top));
    const bot = place(straight('npt', 4, 6), [x, yq - 0.027, qz], [0, -1, 0]);
    P('1', bot, [0, -0.07, 0]);
    qdBot.push(seat(bot));
  });

  // ------------------------------------------------ 2 — coudes des vérins
  // Orifice sur le dessus du vérin, incliné de 45° vers l'avant ; sortie du
  // coude vers le haut et l'arrière (vers la semelle).
  const nrm = v3([0, 1, -0.4]).normalize();
  const cyl = {};
  for (const s of [-1, 1]) {
    for (const k of ['cap', 'rod']) {
      const p = v3([s * CYL[k], CYL.y, CYL.z]).addScaledVector(nrm, CYL.r);
      const e = place(elbow('orb', 6, 6), p, nrm, [0, 0.3, -1]);
      P('2', e, [0, 0.05, 0.06]);
      cyl[`${k}${s}`] = seat(e);
    }
  }

  // ------------------------------------------------ flexibles
  // 9 / 10 : sélecteur → douilles (S le long du fût).
  H('9', 9, sLo, qdTop[0], {}, [0.05, 0.03, -0.08]);
  H('10', 11.5, sHi, qdTop[1], { sag: [0.3, 0, -1] }, [0.05, 0.03, -0.12]);
  // 8 : embouts mâles → coudes 45° des orifices VALVE du clapet 12 : descente
  // le long du fût du stinger −X puis en travers de la semelle jusqu'au coin
  // opposé (vues 8 : le dessin les fait longer le bord avant, mais 77 po ne
  // suffisent pas avec les poses estimées ici).
  const [v1, v2] = valve[0].p.x < valve[1].p.x ? valve : [valve[1], valve[0]];
  H('8', 77, qdBot[0], v1, {
    vias: [[-0.34, 0.1, -0.03], [-0.35, -0.4, 0.12], [-0.05, -0.455, 0.3]],
    sag: [0, 0, 1],
  }, [0.12, -0.05, -0.15]);
  H('8', 77, qdBot[1], v2, {
    vias: [[-0.37, 0.1, -0.02], [-0.38, -0.4, 0.14], [-0.05, -0.44, 0.33]],
    sag: [0, 0, 1],
  }, [0.06, -0.05, -0.2]);
  // 7 : boucle courte à plat, 90° / 90°, de l'adaptateur CYL 1 au coude
  // d'entrée du régulateur, douilles horizontales l'une vers l'autre.
  const tx = v3(in50.p).sub(v3(L052.s6.p)).setY(0).normalize().toArray();
  H('7', 15, { ...L052.s6, end: '90', t: tx }, { ...in50, end: '90', t: tx.map((c) => -c) }, { sag: [0, 0, 1] }, [0, 0.12, 0.04]);
  // 3 / 4 : vérin +X, voisin des blocs ; 5 / 6 : vérin −X, le long du bord
  // avant, à plat sur la marche.
  const [o50a, o50b] = out50[0].p.x > out50[1].p.x ? out50 : [out50[1], out50[0]];
  H('3', 20, o50a, cyl.cap1, { sag: [0, 1, 0] }, [0.05, 0.06, 0.12]);
  H('4', 30, L052.tee, cyl.rod1, { sag: [0, 1, 0] }, [0, 0.1, 0.1]);
  H('5', 41, L052.elb, cyl['rod-1'], { vias: [[0.12, -0.46, 0.6], [-0.1, -0.46, 0.66]], sag: [0, 0, -1] }, [-0.06, 0.12, 0.14]);
  H('6', 49, o50b, cyl['cap-1'], { vias: [[0.2, -0.46, 0.64], [-0.1, -0.46, 0.67], [-0.34, -0.46, 0.66]], sag: [0, 0, -1] }, [-0.1, 0.08, 0.18]);

  void LCV; void tee;
  return { view: { dir: [-1.0, 0.55, 0.9] } };
}

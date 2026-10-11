// P332 — Stabilisateur (vérin de calage) CM31106 rév. 2 (pages 332 et 334,
// même coupe sur les deux feuilles) : « OUTRIGGERS », quatre par porteur
// (repère 2 de P328). Vérin à fourreau fixe, simple tige creuse :
//   · fourreau (32, « WELL TUBE ») Ø 6 po soudé dans sa chaise de fixation :
//     platine arrière de 12 × 10 1/2 po percée de 2 × 4 trous Ø 1 1/16 po
//     (boulons de 1 po du porteur), deux joues latérales ; graisseur (33) en
//     bas du fourreau pour les bagues d'usure ;
//   · cylindre mobile (38) Ø 5 1/4 po, fond fermé et patin rotulé (pied Ø 9 po
//     embouti) ; il coulisse dans le fourreau sur deux bagues d'usure (17) ;
//     en tête, tête de vérin (31) arrêtée par un circlip intérieur (14), joint
//     torique et bague anti-extrusion sur son pourtour (29, 30), joint de tige
//     (15), racleur (28) ; couronne de retenue (27) vissée par 4 vis H (13),
//     joint torique (12) sous la couronne ;
//   · tige creuse (16) Ø 2 3/4 po, alésage Ø 1 po (passage d'huile vers le fond
//     du cylindre), fixe : piston (21) en bas, arrêté par un circlip (20),
//     joint de piston (18), bague d'usure (19), joint torique + bague
//     anti-extrusion sur la tige (34, 35), bille nylon (36) et vis de pression
//     (37) de blocage ; en haut, bloc de clapets (6) emmanché sur la tige
//     (joint torique 22 et deux bagues 23), arrêté par un circlip (24) ; vis H
//     (25) et rondelle Grower 3/8 (26) d'arrêt en rotation sur le dessus du
//     fourreau ;
//   · bloc de clapets (6) : alésage vertical côté −X, deux clapets anti-retour
//     pilotés (2) empilés sous le bouchon de retenue (1) avec leurs joints
//     (7 ×2, 8 ×2), joint torique et bague (10, 11) au fond de l'alésage ;
//     petit alésage horizontal du clapet de décharge : ressort (3) et pointeau
//     (4) ; cinq bouchons six-pans creux (5) et le bouchon (9) du perçage en T
//     sur la face +X ; deux orifices SAE (rétraction / sortie) sur la face +Z.
// Les repères 39 et 40 sont les pochettes de joints (KIT) ; leurs pièces ont
// leurs propres lignes et sont dessinées.
// Cotes : non cotées au manuel ; échelle prise sur la coupe (fourreau Ø 6 po)
// et recoupée sur la vue de côté de la page 330 (hauteur hors tout ≈ 0.83 m,
// patin Ø ≈ 0.23 m) ; épaisseurs des joints d'après leurs gorges.
// Repère : origine sur l'axe du vérin, sous le patin (rentré), Y vers le haut
// (le long de l'axe) ; platine de fixation derrière le fourreau, face d'appui
// (contre la chaise du porteur) dans le plan z = −ZP, normale −Z ; X en travers
// de la platine (bloc de clapets décalé vers −X, orifices hydrauliques vers
// +Z). Le porteur place chaque stabilisateur en tournant −Z vers son châssis.
// Encombrement 0.305 (X, platine) × 0.83 (Y) × 0.24 (Z, de −0.098 au patin
// et aux orifices) m.

import { IN, kit } from './_porteur.js';

// Fourreau et chaise
const RW = 3.0 * IN; // rayon ext. du fourreau
const RWI = 2.75 * IN; // rayon int.
const YW0 = 0.15, YW1 = 0.651; // bas et haut du fourreau
export const ZP = 0.098; // face d'appui de la platine (z = −ZP)
const PT = 0.75 * IN; // épaisseur de platine
const PW = 12 * IN, PY0 = 0.384, PY1 = 0.657; // largeur, bas et haut de platine
const HX = 5.0 * IN; // colonnes de trous (±)
const HY = [0.415, 0.488, 0.56, 0.632]; // rangées de trous
// Cylindre mobile, tige, piston
const RC = 2.625 * IN; // rayon ext. du cylindre (Ø 5 1/4)
const RCI = 2.3 * IN; // rayon int.
const YC0 = 0.075, YC1 = 0.624; // fond et haut du cylindre
const RR = 1.375 * IN; // tige Ø 2 3/4
const RRI = 0.5 * IN; // alésage de la tige
const YR0 = 0.105, YR1 = 0.75; // bas et haut de tige
const YP0 = 0.115, YP1 = 0.16; // piston
const YH0 = 0.532; // bas de la tête de vérin (haut : YC1)
const YK1 = 0.667; // haut de la couronne de retenue
// Bloc de clapets
const VB = { x0: -0.074, x1: 0.076, y0: 0.676, y1: 0.815, z0: -0.05, z1: 0.06 };
const XV = -0.05; // alésage des clapets

export default function P332(api) {
  const { THREE, S } = api;
  const { lathe, box, plate, cyl, nut, weld, merged, group, at, washer } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const K = kit(api);

  // Bague de section rectangulaire (joint, bague d'usure, circlip) autour de Y.
  const band = (ro, ri, y0, y1, mat, seg = 10) => lathe([[ri, y0], [ro, y0], [ro, y1], [ri, y1], [ri, y0]], mat, { seg });
  // Bouchon six-pans creux : collerette + empreinte, le long de +Y depuis la face.
  const hollowPlug = (r) => lathe([
    [0, -r * 1.2], [r, -r * 1.2], [r, 0], [r * 1.25, 0], [r * 1.25, r * 0.35], [r * 0.55, r * 0.35], [r * 0.55, r * 0.05], [0, r * 0.05],
  ], 'zinc', { seg: 6 });
  // Oriente un objet construit le long de +Y vers la direction d (vecteur).
  const toward = (obj, d, pos) => {
    const g = group(obj);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...d).normalize());
    g.position.set(...pos);
    return g;
  };

  // ---------------------------------------------------------------- 32 — fourreau soudé dans sa chaise
  const tubeW = lathe([
    [RWI, YW0], [RW - 0.002, YW0], [RW, YW0 + 0.002], [RW, YW1 - 0.002], [RW - 0.002, YW1], [RWI, YW1], [RWI, YW0],
  ], 'grey', { seg: 20 });
  // Platine dans le plan XY, trous Ø 1 1/16 po (contours à 10 segments).
  const shape = new THREE.Shape();
  shape.moveTo(-PW / 2, PY0); shape.lineTo(PW / 2, PY0); shape.lineTo(PW / 2, PY1); shape.lineTo(-PW / 2, PY1); shape.closePath();
  for (const x of [-HX, HX]) for (const y of HY) shape.holes.push(new THREE.Path().absarc(x, y, (1.0625 * IN) / 2, 0, Math.PI * 2, true));
  const pg = new THREE.ExtrudeGeometry(shape, { depth: PT, bevelEnabled: false, curveSegments: 4 });
  const back = new THREE.Mesh(pg);
  back.position.z = -ZP;
  // Joues latérales : de la platine au plan avant du fourreau.
  const cheekD = ZP - PT + 0.02;
  const cheeks = [-1, 1].map((s) => box(0.5 * IN, PY1 - PY0, cheekD, 'grey', { pos: [s * (RW + 0.25 * IN), (PY0 + PY1) / 2, -ZP + PT + cheekD / 2] }));
  // Entretoise entre fourreau et platine (lame soudée).
  const web = box(0.08, PY1 - PY0 - 0.02, ZP - PT - RW + 0.004, 'grey', { pos: [0, (PY0 + PY1) / 2, -(ZP - PT + RW) / 2] });
  // Cordons d'angle du fourreau sur le haut des joues.
  const beads = merged([-1, 1].map((s) => weld([[s * RW * 0.75, PY1 + 0.002, -RW * 0.66], [s * (RW + 0.25 * IN), PY1 + 0.002, -0.05]], 0.008, 'grey')), 'grey');
  beads.geometry.userData.edgeAngle = 75;
  P('32', group(merged([tubeW, back, ...cheeks, web], 'grey'), beads), [0, 0, -0.12]);

  // 33 — graisseur droit 1/8 NPT sur le fourreau, face +X
  const nipple = lathe([
    [0, 0], [0.0045, 0], [0.0045, 0.006], [0.0055, 0.006], [0.0055, 0.013], [0.0028, 0.013], [0.0028, 0.016], [0.0042, 0.018], [0.0035, 0.022], [0, 0.022],
  ], 'brass', { seg: 8 });
  P('33', toward(nipple, [1, 0, 0], [RW - 0.001, 0.215, 0]), [0.06, 0, 0]);

  // ---------------------------------------------------------------- 38 — cylindre mobile et patin rotulé
  const cylT = lathe([
    [0, YC0 - 0.014], [RC * 0.72, YC0 - 0.014], [RC, YC0 + 0.006], [RC, YC1 - 0.002], [RC - 0.002, YC1], [RCI, YC1], [RCI, YC0 + 0.012], [0, YC0 + 0.012],
  ], 'chrome', { seg: 20 });
  // Pied : rotule sous le fond, coupelle emboutie et semelle Ø 9 po.
  const foot = lathe([
    [0, 0], [0.114, 0], [0.114, 0.012], [0.105, 0.016], [0.07, 0.03], [0.05, 0.05], [0.047, 0.058], [0.04, 0.062], [0, 0.062],
  ], 'grey', { seg: 20 });
  const knuckle = lathe([[0, 0.045], [0.032, 0.05], [0.04, 0.062], [RC * 0.72, YC0 - 0.014], [0, YC0 - 0.014]], 'darkSteel', { seg: 16 });
  P('38', group(cylT, foot, knuckle), [0, -0.9, 0]);

  // 17 — bagues d'usure du cylindre (×2), dans les gorges du cylindre
  for (const y of [0.24, 0.44]) P('17', band(RWI - 0.0004, RC - 0.0015, y, y + 0.022, 'cream', 16), [0, -0.9, 0]);

  // ---------------------------------------------------------------- tête de vérin, couronne
  // 31 — tête : fût dans le cylindre, épaulement sur le bord, gorges des joints.
  const head = lathe([
    [RR + 0.0005, YH0], [RCI - 0.0003, YH0], [RCI - 0.0003, YC1 - 0.004], [RC - 0.004, YC1 - 0.004], [RC - 0.004, YC1], [RR + 0.0005, YC1], [RR + 0.0005, YH0],
  ], 'darkSteel', { seg: 16 });
  P('31', head, [0, 0.3, 0]);
  // 29, 30 — joint torique et bague anti-extrusion sur le pourtour de la tête
  P('29', band(RCI + 0.0002, RCI - 0.004, 0.55, 0.555, 'rubber'), [0, 0.37, 0]);
  P('30', band(RCI + 0.0002, RCI - 0.004, 0.556, 0.559, 'cream'), [0, 0.41, 0]);
  // 15 — joint de tige ; 28 — racleur, en haut de l'alésage de la tête
  P('15', band(RR + 0.006, RR - 0.0002, 0.585, 0.598, 'rubber'), [0, 0.47, 0]);
  P('28', band(RR + 0.005, RR - 0.0005, 0.612, 0.62, 'blackCast'), [0, 0.52, 0]);
  // 14 — circlip intérieur sous la tête (dans le cylindre)
  P('14', band(RCI + 0.0015, RCI - 0.004, YH0 - 0.004, YH0 - 0.0015, 'blackOxide'), [0, 0.22, 0]);
  // 12 — joint torique de face entre tête et couronne
  P('12', band(RR + 0.016, RR + 0.012, YC1, YC1 + 0.0025, 'rubber'), [0, 0.58, 0]);
  // 27 — couronne de retenue (sur le cylindre)
  const crown = lathe([
    [RR + 0.002, YC1], [RC, YC1], [RC, YK1 - 0.003], [RC - 0.003, YK1], [RR + 0.004, YK1], [RR + 0.002, YK1 - 0.002], [RR + 0.002, YC1],
  ], 'darkSteel', { seg: 16 });
  P('27', crown, [0, 0.63, 0]);
  // 13 — vis H 3/8 × 1 1/4 (×4) de la couronne, vissées dans la tête
  const RB13 = (RR + RC) / 2;
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    P('13', K.screw(0.375 * IN, 1.25 * IN, 'zinc', { pos: [Math.cos(a) * RB13, YK1, Math.sin(a) * RB13], seg: 6 }), [0, 0.72, 0]);
  }

  // ---------------------------------------------------------------- 16 — tige creuse et piston
  const rodBody = lathe([
    [RRI, YR0], [RR - 0.0025, YR0], [RR - 0.0025, YP1 + 0.002], [RR, YP1 + 0.006], [RR, YR1 - 0.03],
    [RR - 0.004, YR1 - 0.026], [RR - 0.004, YR1 - 0.002], [RR - 0.006, YR1], [RRI, YR1], [RRI, YR0],
  ], 'chrome', { seg: 14 });
  P('16', rodBody, [0, 0, 0]);
  // 21 — piston (alésé sur le bout réduit de la tige)
  const piston = lathe([
    [RR - 0.0025, YP0], [RCI - 0.001, YP0], [RCI - 0.001, YP1], [RR - 0.0025, YP1], [RR - 0.0025, YP0],
  ], 'darkSteel', { seg: 16 });
  P('21', piston, [0, -0.24, 0]);
  // 18 — joint de piston ; 19 — bague d'usure du piston
  P('18', band(RCI, RCI - 0.006, 0.142, 0.152, 'rubber'), [0, -0.235, 0]);
  P('19', band(RCI, RCI - 0.0035, 0.122, 0.134, 'cream'), [0, -0.255, 0]);
  // 34, 35 — joint torique et bagues anti-extrusion (×2) entre tige et piston
  P('34', band(RR - 0.0005, RR - 0.0045, 0.136, 0.139, 'rubber'), [0, -0.21, 0]);
  for (const y of [0.132, 0.1395]) P('35', band(RR - 0.0005, RR - 0.0045, y, y + 0.0015, 'cream'), [0, -0.21, 0]);
  // 20 — circlip extérieur sous le piston
  P('20', band(RR - 0.0005, RR - 0.0055, 0.108, 0.111, 'blackOxide'), [0, -0.29, 0]);
  // 36 — bille nylon, 37 — vis de pression : perçage radial du piston (face +X)
  P('36', lathe([[0, -0.0024], [0.0017, -0.0017], [0.0024, 0], [0.0017, 0.0017], [0, 0.0024]], 'white', { seg: 8, pos: [RR + 0.003, 0.125, 0] }), [0.05, -0.24, 0]);
  const setScrew = lathe([[0.0016, 0], [0.004, 0], [0.004, 0.012], [0, 0.012], [0, 0.003], [0.0016, 0.003]], 'blackOxide', { seg: 10 });
  P('37', toward(setScrew, [1, 0, 0], [RR + 0.006, 0.125, 0]), [0.08, -0.24, 0]);

  // ---------------------------------------------------------------- arrêts du bloc sur la tige
  // 24 — circlip sur la tige, juste sous le bloc
  P('24', band(RR, RR - 0.004, VB.y0 - 0.004, VB.y0 - 0.0012, 'blackOxide'), [0, 0.76, 0]);
  // 22, 23 — joint torique et deux bagues dans l'alésage du bloc, autour de la tige
  P('22', band(RR - 0.0035, RR - 0.0075, 0.722, 0.726, 'rubber'), [0, 0.81, 0]);
  for (const y of [0.7165, 0.727]) P('23', band(RR - 0.0035, RR - 0.0075, y, y + 0.0015, 'cream'), [0, 0.84, 0]);
  // 25, 26 — vis H 3/8 et rondelle Grower : patte d'arrêt du bloc vissée sur le haut du fourreau (+X)
  P('26', K.lock(0.375 * IN, 'zinc', { pos: [RW - 0.012, YW1, 0.03] }), [0, 0.06, 0]);
  P('25', K.screw(0.375 * IN, 0.75 * IN, 'zinc', { pos: [RW - 0.012, YW1 + 0.0024, 0.03], seg: 6 }), [0, 0.1, 0]);

  // ---------------------------------------------------------------- 6 — bloc de clapets et ses pièces
  const EV = [0, 0.95, 0]; // éclaté du bloc
  const up = (dy) => [EV[0], EV[1] + dy, EV[2]];
  const W = VB.x1 - VB.x0, H = VB.y1 - VB.y0, D = VB.z1 - VB.z0;
  const xc = (VB.x0 + VB.x1) / 2, yc = (VB.y0 + VB.y1) / 2, zc = (VB.z0 + VB.z1) / 2;
  const blockBody = box(W, H, D, 'zinc', { r: 0.002, pos: [xc, yc, zc] });
  // Orifices SAE (lamages) sur la face +Z, perçage du clapet de décharge sur −X.
  const spot = [];
  for (const x of [0.005, 0.045]) spot.push(at(cyl(0.014, 0.003, 'zinc', { axis: 'z', seg: 12 }), [x, VB.y0 + 0.07, VB.z1 + 0.0015]));
  const bores = [];
  for (const x of [0.005, 0.045]) bores.push(at(cyl(0.0095, 0.004, 'blackOxide', { axis: 'z', seg: 10 }), [x, VB.y0 + 0.07, VB.z1 + 0.0012]));
  P('6', group(merged([blockBody, ...spot], 'zinc'), merged(bores, 'blackOxide')), EV);
  // 1 — bouchon de retenue (collerette sur le dessus du bloc)
  const retPlug = lathe([[0, -0.02], [0.012, -0.02], [0.012, 0], [0.0155, 0], [0.0155, 0.005], [0.0145, 0.006], [0, 0.006]], 'zinc', { seg: 16 });
  P('1', at(group(retPlug), [XV, VB.y1, 0]), up(0.2));
  // 2 — clapets anti-retour (×2) empilés dans l'alésage vertical
  const cv = () => lathe([
    [0, 0], [0.006, 0], [0.008, 0.003], [0.01, 0.003], [0.01, 0.009], [0.0105, 0.01], [0.0105, 0.026],
    [0.01, 0.027], [0.01, 0.032], [0.0055, 0.034], [0.0055, 0.037], [0, 0.037],
  ], 'steel', { seg: 8 });
  P('2', at(cv(), [XV, VB.y0 + 0.062, 0]), up(0.155));
  P('2', at(cv(), [XV, VB.y0 + 0.022, 0]), up(0.11));
  // 7, 8 — joints toriques et bagues des clapets (×2 chacun)
  for (const [y, dy] of [[0.09, 0.155], [0.05, 0.11]]) {
    P('7', band(0.0108, 0.0085, VB.y0 + y, VB.y0 + y + 0.0026, 'rubber'), up(dy + 0.02));
    P('8', band(0.0108, 0.0085, VB.y0 + y - 0.0022, VB.y0 + y - 0.0006, 'cream'), up(dy + 0.012));
  }
  // 10, 11 — joint torique et bague au fond de l'alésage
  P('10', band(0.0085, 0.0062, VB.y0 + 0.013, VB.y0 + 0.0155, 'rubber'), up(0.07));
  P('11', band(0.0085, 0.0062, VB.y0 + 0.0105, VB.y0 + 0.0122, 'cream'), up(0.06));
  // 3, 4 — ressort et pointeau du clapet de décharge (alésage horizontal, face −X)
  const yD = VB.y0 + 0.012;
  P('4', at(lathe([[0, 0], [0.0035, 0.003], [0.0042, 0.008], [0.0042, 0.016], [0, 0.016]], 'steel', { seg: 10 }), [VB.x0 + 0.03, yD, 0.025], [0, 0, Math.PI / 2]), [EV[0] - 0.06, EV[1], 0]);
  P('3', S.spring(0.0032, 0.0006, 0.016, 4, 'steel', { axis: 'x', pos: [VB.x0 + 0.01, yD, 0.025], perTurn: 6, radial: 3 }), [EV[0] - 0.1, EV[1], 0]);
  // 5 — bouchons six-pans creux (×5) : perçages de fabrication
  const plugs5 = [
    [[-1, 0, 0], [VB.x0, yD, 0.025]], // bouchon du clapet de décharge
    [[-1, 0, 0], [VB.x0, VB.y0 + 0.07, 0.025]],
    [[0, 0, -1], [xc, VB.y0 + 0.035, VB.z0]],
    [[0, 0, -1], [xc + 0.03, VB.y0 + 0.1, VB.z0]],
    [[0, 0, 1], [-0.035, VB.y0 + 0.11, VB.z1]],
  ];
  for (const [d, p] of plugs5) P('5', toward(hollowPlug(0.0062), d, p), [EV[0] + d[0] * 0.05, EV[1], EV[2] + d[2] * 0.05]);
  // 9 — bouchon six-pans creux du perçage en T, face +X
  P('9', toward(hollowPlug(0.0055), [1, 0, 0], [VB.x1, VB.y0 + 0.1, 0]), [EV[0] + 0.05, EV[1], 0]);

  void nut;
  return { view: { dir: [1, 0.55, 1.2] } };
}

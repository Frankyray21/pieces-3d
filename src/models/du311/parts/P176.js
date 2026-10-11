// P176 — Vérin de basculement du mât CX047406 rév. 1 (page 176) :
// « CYLINDER - Ø6.00 X 23.13 ST », alésage 6 po, course 23 1/8 po, tige
// Ø 2 1/2 po, pression maxi 5000 psi. Vérin soudé à tête vissée, dessiné rentré :
// - tube soudé (5) : bloc de fond cylindrique Ø 6 5/8 × 2,8 po (porte les deux
//   valves d'équilibrage 1, orifices A et B #6 ORB dessus / dessous, bouchon
//   #4 ORB 3 sur la face arrière), œil de fond soudé, tube Ø 6 5/8 × 5/16 po,
//   bossage de l'orifice côté tige (relié au bloc par le tube de transfert 7) ;
// - tige soudée (6) : tige chromée Ø 2 1/2 po, queue Ø 2 po filetée, œil de
//   tige soudé ; piston (11) vissé sur la queue, bague de blocage (13) freinée
//   par une vis sans tête 3/8-24 × 1/2 po (10) ;
// - tête (12) vissée dans le tube, collerette au Ø du tube ;
// - deux rotules Torrington 25SF40TT (4 : bague extérieure Ø 3.937, alésage
//   Ø 2 1/2 po) dans les yeux, tenues par un circlip intérieur HO-393 (2) ;
//   un graisseur (9) sur le dessus de chaque œil ;
// - coude 90° ORB / JIC (8) et tube de transfert (7) du bloc de fond vers
//   l'orifice côté tige, le long du tube.
// La trousse de joints (14) reste sans objet.
// Repère : origine sur l'axe de la rotule de l'œil de fond ; +X le long de
// l'axe du vérin vers la tige ; Z = axe des deux rotules (axes d'articulation
// parallèles) ; +Y vers les graisseurs des yeux (dessus de la vue de bout).
// Les valves (1) sortent du bloc vers +Z, le tube de transfert (7) court sur
// le tube à 35° de +Y vers +Z, le bouchon (3) vers -Z.
// Vérin rentré : entraxe 0.988 m (38.9 po), sorti 1.576 m.
// Encombrement ≈ 1.13 (X, de -0.070 à 1.058) × 0.20 (Y, de -0.084 à 0.116)
// × 0.23 (Z, de -0.09 à +0.14 aux valves) m.
// Cotes : liste (alésage, course, rotules, circlips, vis 3/8-24) ; le reste
// relevé sur la coupe A-A (≈ 64 px/po) et la vue de côté (≈ 25,5 px/po) :
// tube Ø 6 5/8, yeux Ø 5 1/2 × 2.46 po d'épaisseur.

const IN = 0.0254;
const u = (v) => v * IN;

// Cotes axiales (po), vérin rentré, depuis l'axe de l'œil de fond.
const X = {
  lugEnd: 3.45, // pied de l'œil de fond sur le bloc
  blockEnd: 6.27, // face intérieure du bloc = début du tube
  ringEnd: 7.05, // bague de blocage (13) de 6.27 à 7.05
  pistonEnd: 9.17, // piston (11) de 7.05 à 9.17
  portB: 31.6, // orifice côté tige (bossage sur le tube)
  hpBot: 32.30, // dessous de la tête = pistonEnd + course
  tubeEnd: 34.20,
  hpTop: 34.84,
  neck: 35.60, // fin du chanfrein de la tige
  eyeBase: 35.92, // pied de l'œil de tige
  eye: 38.90, // axe de l'œil de tige
};
const STROKE = 23.13;
const TUBE = 3.3125, BORE = 3.0, ROD = 1.25, PILOT = 1.0; // rayons (po)
const EYE = { R: 2.75, T: 2.46, bore: 1.9685 }; // œil : rayon, épaisseur (Z), logement de rotule
const G = 0.02; // jeu radial entre pièces emboîtées (po)
const PHI = (35 * Math.PI) / 180; // angle du tube de transfert, depuis +Y vers +Z

export const CYL176 = {
  pinRetracted: u(X.eye), // x de l'axe de l'œil de tige (vérin rentré)
  stroke: u(STROKE),
  pinExtended: u(X.eye + STROKE),
  bore: u(2 * BORE),
  tubeR: u(TUBE),
  rodR: u(ROD),
  eyeR: u(EYE.R), // rayon extérieur des yeux
  eyeWidth: u(EYE.T), // épaisseur des yeux selon Z (entre joues de chape)
  pinD: u(2.5), // alésage des rotules
  axis: 'x', // axe du vérin ; axes des rotules selon Z
};

// ------------------------------------------------ pièces réutilisées (P178)

/**
 * Valve d'équilibrage à cartouche CP17037 (vissée, Ø 7/8-14) le long de +Y,
 * face d'appui à y = 0 : six-pans 1 1/8 po, corps, contre-écrou et vis de
 * réglage, capuchon. En mètres.
 */
export function cbValve(S) {
  const { lathe, merged, group, at, nut } = S;
  const L = (pts, m, seg = 20) => lathe(pts.map(([r, y]) => [u(r), u(y)]), m, { seg });
  return group(
    merged([
      // six-pans de la cartouche et collet
      at(nut(u(1.125), u(0.45), 'steel'), [0, u(0.225), 0]),
      L([[0, 0.45], [0.48, 0.45], [0.48, 0.52], [0.44, 0.55], [0.44, 1.30], [0.40, 1.34], [0, 1.34]], 'steel'),
      // contre-écrou de la vis de réglage
      at(nut(u(0.5625), u(0.22), 'steel'), [0, u(1.45), 0]),
      // vis de réglage (six-pans creux suggéré par un collet)
      L([[0, 1.56], [0.16, 1.56], [0.16, 1.86], [0.13, 1.90], [0, 1.90]], 'steel', 14),
    ], 'zinc'),
    // capuchon plastique de protection du réglage
    L([[0, 1.62], [0.30, 1.62], [0.31, 1.66], [0.31, 2.02], [0.27, 2.06], [0, 2.06]], 'black', 18),
  );
}

/** Graisseur droit 1/4-28 le long de +Y, pied (surface de l'œil) à y = 0. */
export function zerk(S, scale = 1) {
  const { lathe, merged, at, nut } = S;
  const k = scale;
  const L = (pts, seg = 12) => lathe(pts.map(([r, y]) => [u(r * k), u(y * k)]), 'brass', { seg });
  return merged([
    L([[0, -0.25], [0.12, -0.25], [0.12, 0], [0, 0]], 10),
    at(nut(u(0.3125 * k), u(0.17 * k), 'brass'), [0, u(0.085 * k), 0]),
    L([[0, 0.17], [0.09, 0.17], [0.09, 0.30], [0.12, 0.34], [0.13, 0.40], [0.11, 0.46], [0.05, 0.50], [0, 0.50]], 14),
  ], 'brass');
}

export default function P176(api) {
  const { THREE, S } = api;
  const { lathe, thread, torus, extrude, ring, weld, weldRing, merged, at, group, nut, cyl, tube, box } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  // Profil de révolution en pouces [r, x] → lathe en mètres le long de +X.
  const L = (pts, mat, seg = 48, opts = {}) => lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg, axis: 'x', ...opts });
  const v3 = (x, y, z) => [u(x), u(y), u(z)];
  // Point à la distance r de l'axe, dans la direction de l'angle a (depuis +Y vers +Z).
  const rad = (x, r, a) => v3(x, r * Math.cos(a), r * Math.sin(a));

  // Contour d'un œil dans le plan XY (po) : demi-cercle côté libre, flancs
  // tangents jusqu'au pied (x0), chanfrein de pied optionnel.
  const eyeOutline = (cx, dir, x0, foot) => {
    const pts = [];
    const n = 28;
    for (let i = 0; i <= n; i++) {
      const a = -Math.PI / 2 + (i / n) * Math.PI;
      pts.push([cx + dir * EYE.R * Math.cos(a), EYE.R * Math.sin(a)]);
    }
    pts.push(...foot);
    return pts.map(([x, y]) => [u(x), u(y)]);
  };
  const eyeBody = (cx, dir, x0, foot) => {
    const pts = eyeOutline(cx, dir, x0, foot);
    // sens trigonométrique pour l'extrusion
    let a = 0;
    pts.forEach(([x0p, y0p], i) => { const [x1, y1] = pts[(i + 1) % pts.length]; a += x0p * y1 - x1 * y0p; });
    if (a < 0) pts.reverse();
    return extrude(pts, u(EYE.T), 'grey', { holes: [[u(cx), 0, u(EYE.bore + 0.005)]] });
  };

  // ================================================ 5 — tube soudé
  // Œil de fond : demi-cercle vers -X, flancs droits jusqu'au bloc (chanfrein de pied).
  const capEye = eyeBody(0, -1, X.lugEnd, [[X.lugEnd - 0.25, EYE.R], [X.lugEnd, EYE.R - 0.25], [X.lugEnd, -EYE.R + 0.25], [X.lugEnd - 0.25, -EYE.R]]);
  // Bloc de fond plein Ø 6 5/8 (arêtes chanfreinées), portées des valves et orifices
  const block = L([
    [0, X.lugEnd], [TUBE - 0.08, X.lugEnd], [TUBE, X.lugEnd + 0.08], [TUBE, X.blockEnd - 0.05],
    [TUBE - 0.05, X.blockEnd], [BORE - 0.3, X.blockEnd], [0, X.blockEnd],
  ], 'grey', 64);
  // Tube Ø 6 5/8 × 5/16 : bout côté bloc chanfreiné (cordon), taraudage de la tête au bout
  const TAP = { y0: X.tubeEnd - 1.6, y1: X.tubeEnd - 0.1 };
  const barrel = merged([
    L([
      [BORE, X.blockEnd + 0.02], [TUBE - 0.12, X.blockEnd + 0.02], [TUBE, X.blockEnd + 0.14], [TUBE, X.tubeEnd - 0.04],
      [TUBE - 0.04, X.tubeEnd], [BORE, X.tubeEnd], [BORE, X.blockEnd + 0.02],
    ], 'grey', 64),
    L([[BORE, TAP.y0], ...thread(BORE, TAP.y0, TAP.y1, { pitch: 1 / 12, maxTurns: 12, chamferBottom: false }).reverse()], 'grey', 64),
  ], 'grey');
  barrel.userData.hasInterior = true;
  // Portées planes (lamages) des valves, du bouchon et des orifices A / B sur le bloc
  const xv = (X.lugEnd + X.blockEnd) / 2;
  const seat = (y, sz) => at(cyl(u(0.72), u(0.6), 'grey', { axis: 'z', seg: 32 }), v3(xv, y, sz * (Math.sqrt(TUBE * TUBE - y * y) - 0.24)));
  const portSeat = (sy) => at(cyl(u(0.55), u(0.10), 'grey', { seg: 28 }), v3(xv, sy * (TUBE - 0.02), 0));
  // Bossage de l'orifice côté tige, sous le bout du tube de transfert
  const bossB = at(box(u(1.0), u(0.6), u(0.9), 'grey', { r: u(0.08) }), [0, 0, 0]);
  const bossGrp = group(bossB);
  bossGrp.position.set(...rad(X.portB, TUBE + 0.2, PHI));
  bossGrp.rotation.x = PHI;
  // Garniture de l'orifice B : bouchon plastique sur un orifice libre
  const orbCaps = merged([
    at(cyl(u(0.36), u(0.18), 'plastic', { seg: 18 }), v3(xv, TUBE + 0.12, 0)),
    at(cyl(u(0.36), u(0.18), 'plastic', { seg: 18 }), v3(xv, -TUBE - 0.12, 0)),
  ], 'yellow');
  P('5', group(
    capEye, block, barrel,
    merged([seat(1.0, 1), seat(-0.9, 1), seat(-0.9, -1), portSeat(1), portSeat(-1), bossGrp], 'grey'),
    orbCaps,
    weldRing(u(TUBE - 0.03), u(0.24), 'grey', { axis: 'x', pos: v3(X.blockEnd + 0.06, 0, 0) }),
    weld([[X.lugEnd + 0.02, EYE.R + 0.06, -EYE.T / 2 - 0.06], [X.lugEnd + 0.02, EYE.R + 0.06, EYE.T / 2 + 0.06]].map(([x, y, z]) => v3(x, y, z)), u(0.22), 'grey'),
    weld([[X.lugEnd + 0.02, -EYE.R - 0.06, -EYE.T / 2 - 0.06], [X.lugEnd + 0.02, -EYE.R - 0.06, EYE.T / 2 + 0.06]].map(([x, y, z]) => v3(x, y, z)), u(0.22), 'grey'),
  ), [0, 0, 0]);

  // ================================================ 1 — valves d'équilibrage (×2)
  // Vissées dans la face +Z du bloc, l'une au-dessus de l'autre.
  for (const y of [1.0, -0.9]) {
    const zs = Math.sqrt(TUBE * TUBE - y * y) + 0.06;
    P('1', at(cbValve(S), v3(xv, y, zs), [Math.PI / 2, 0, 0]), [0, 0, 0.12]);
  }
  // 3 — bouchon #4 ORB (7/16-20) à six-pans, face -Z du bloc
  {
    const zs = Math.sqrt(TUBE * TUBE - 0.81) + 0.06;
    P('3', at(group(
      merged([
        at(nut(u(0.5625), u(0.2), 'steel'), [0, u(0.1), 0]),
        lathe([[0, -0.36], [0.2, -0.36], [0.2, 0], [0, 0]].map(([r, y]) => [u(r), u(y)]), 'steel', { seg: 14 }),
      ], 'zinc'),
      torus(u(0.215), u(0.035), 'rubber', { pos: [0, -u(0.03), 0] }),
    ), v3(xv, -0.9, -zs), [-Math.PI / 2, 0, 0]), [0, 0, -0.1]);
  }

  // ================================================ 8 — coude 90° ORB #6 / JIC #6
  // Vissé dans l'orifice de transfert du bloc (à 35° de +Y), sortie vers +X.
  const elbow = () => {
    const Lc = (pts, m = 'zinc', seg = 16) => lathe(pts.map(([r, y]) => [u(r), u(y)]), m, { seg });
    return group(
      merged([
        Lc([[0, -0.45], [0.27, -0.45], [0.27, -0.05], [0, -0.05]]), // queue ORB 9/16-18
        at(nut(u(0.75), u(0.28), 'zinc'), [0, u(0.14), 0]), // contre-écrou
        Lc([[0, 0.28], [0.34, 0.28], [0.34, 0.95], [0, 0.95]]), // corps forgé
        at(lathe([[0, 0], [0.32, 0], [0.32, 0.25], [0.27, 0.3], [0.27, 0.80], [0.20, 0.92], [0, 0.92]].map(([r, y]) => [u(r), u(y)]), 'zinc', { seg: 16, axis: 'x' }), [0, u(0.62), 0]),
        at(nut(u(0.6875), u(0.22), 'zinc', { axis: 'x' }), [u(0.42), u(0.62), 0]),
      ], 'zinc'),
      torus(u(0.29), u(0.035), 'rubber', { pos: [0, -u(0.03), 0] }),
    );
  };
  const xe = X.blockEnd - 0.95; // axe de l'orifice dans le bloc
  const eGrp = group(elbow());
  eGrp.position.set(...rad(xe, TUBE + 0.01, PHI));
  eGrp.rotation.x = PHI; // +Y local → direction radiale à PHI
  P('8', eGrp, [0, 0.06, 0.04]);

  // ================================================ 7 — tube de transfert
  // Tube acier Ø 3/8 po, écrous JIC aux deux bouts : de la sortie du coude
  // (r ≈ 3.94 po), descend contre le tube puis remonte au bossage côté tige.
  const r1 = TUBE + 0.62, r2 = TUBE + 0.32;
  const path = [
    rad(xe + 0.95, r1, PHI), rad(xe + 2.0, r1, PHI), rad(xe + 3.6, r2, PHI),
    rad(X.portB - 3.0, r2, PHI), rad(X.portB - 1.25, TUBE + 0.3, PHI),
  ];
  const nutAt = (x) => at(nut(u(0.6875), u(0.42), 'zinc', { axis: 'x' }), rad(x, r1, PHI));
  const nutEnd = at(nut(u(0.6875), u(0.42), 'zinc', { axis: 'x' }), rad(X.portB - 1.42, TUBE + 0.3, PHI));
  P('7', group(
    tube(path, u(0.1875), 'steel', { seg: 90, tension: 0.4, radial: 12 }),
    merged([nutAt(xe + 1.12), nutEnd], 'zinc'),
    // raccord droit soudé du bossage (embout JIC vers -X)
    at(lathe([[0, 0], [0.3, 0], [0.3, 0.3], [0.25, 0.35], [0.25, 0.7], [0, 0.7]].map(([r, y]) => [u(r), u(y)]), 'zinc', { seg: 16, axis: '-x' }), rad(X.portB - 0.5, TUBE + 0.3, PHI)),
  ), [0, 0.05, 0.05]);

  // ================================================ 12 — tête vissée
  const head = L([
    [ROD + G, X.hpBot + 0.08], [ROD + 0.1, X.hpBot], [BORE - 0.05, X.hpBot], [BORE - G, X.hpBot + 0.05],
    [BORE - G, X.hpBot + 0.75], [BORE - 0.12, X.hpBot + 0.75], [BORE - 0.12, X.hpBot + 0.95], [BORE - G, X.hpBot + 0.95], // gorge du torique
    ...thread(BORE - G, X.tubeEnd - 1.6, X.tubeEnd - 0.1, { pitch: 1 / 12, maxTurns: 12 }),
    [BORE - G, X.tubeEnd], [TUBE, X.tubeEnd], [TUBE, X.hpTop - 0.06], [TUBE - 0.06, X.hpTop],
    [1.6, X.hpTop], [1.6, X.hpTop - 0.22], [ROD + G, X.hpTop - 0.22], // lamage du racleur
    [ROD + G, X.hpBot + 0.08],
  ], 'grey', 64);
  // Racleur visible dans le lamage (fait partie de la tête montée)
  const wiper = L([[ROD + G, X.hpTop - 0.22], [1.58, X.hpTop - 0.22], [1.58, X.hpTop + 0.02], [1.40, X.hpTop + 0.06], [ROD + G, X.hpTop + 0.02]], 'rubber', 48);
  P('12', group(head, wiper), [0.22, 0, 0]);

  // ================================================ 6 — tige soudée
  // Tige chromée, queue filetée, chanfrein vers le col, œil de tige soudé.
  const rodEye = eyeBody(X.eye, 1, X.eyeBase, [[X.eyeBase + 0.7, EYE.R], [X.eyeBase, 1.6], [X.eyeBase, -1.6], [X.eyeBase + 0.7, -EYE.R]]);
  P('6', group(
    L([[0, X.pistonEnd], [ROD - 0.06, X.pistonEnd], [ROD, X.pistonEnd + 0.06], [ROD, X.hpTop + 0.4], [0.72, X.neck], [0.72, X.eyeBase + 0.02], [0, X.eyeBase + 0.02]], 'chrome', 40),
    L([[0, X.blockEnd + 0.1], ...thread(PILOT, X.blockEnd + 0.1, X.pistonEnd - 0.1, { pitch: 1 / 12, maxTurns: 16 }), [PILOT, X.pistonEnd], [0, X.pistonEnd]], 'steel', 28),
    rodEye,
    weldRing(u(0.8), u(0.2), 'grey', { axis: 'x', pos: v3(X.eyeBase - 0.05, 0, 0) }),
  ), [0.45, 0, 0]);

  // ================================================ 11 — piston, 13 — bague de blocage, 10 — vis
  P('11', L([
    [PILOT + G, X.ringEnd], [BORE - 0.06, X.ringEnd], [BORE - G, X.ringEnd + 0.05], [BORE - G, X.ringEnd + 0.35],
    [BORE - 0.18, X.ringEnd + 0.35], [BORE - 0.18, X.ringEnd + 0.75], [BORE - G, X.ringEnd + 0.75], // bague de guidage
    [BORE - G, X.ringEnd + 0.85], [BORE - 0.32, X.ringEnd + 0.85], [BORE - 0.32, X.ringEnd + 1.30], [BORE - G, X.ringEnd + 1.30], // joint
    [BORE - G, X.pistonEnd - 0.05], [BORE - 0.06, X.pistonEnd], [PILOT + G, X.pistonEnd],
  ], 'steel', 56), [0.18, 0.2, 0]);
  P('13', L([
    [PILOT + G, X.blockEnd + 0.03], [2.75, X.blockEnd + 0.03], [2.8, X.blockEnd + 0.08], [2.8, X.ringEnd - 0.05], [2.75, X.ringEnd], [PILOT + G, X.ringEnd],
  ], 'steel', 48), [0.06, 0.2, 0]);
  // vis sans tête à six-pans creux 3/8-24, radiale, affleurante en haut de la bague
  {
    const Ls = (pts) => lathe(pts.map(([r, y]) => [u(r), u(y)]), 'blackOxide', { seg: 14 });
    const ss = group(Ls([[0, 0], [0.18, 0], [0.1875, 0.03], [0.1875, 0.47], [0.17, 0.5], [0.09, 0.5], [0.09, 0.32], [0, 0.32]]));
    P('10', at(ss, v3((X.blockEnd + X.ringEnd) / 2, 2.8 - 0.52, 0)), [0.06, 0.26, 0]);
  }

  // ================================================ 4 — rotules, 2 — circlips, 9 — graisseurs
  const ball = () => {
    // bague extérieure (largeur 1.75 po) et rotule (alésage 2 1/2 po, largeur 2.19 po)
    const Lz = (pts, m, seg = 40) => lathe(pts.map(([r, y]) => [u(r), u(y)]), m, { seg, axis: 'z' });
    const R = 1.72; // rayon de la sphère
    const sph = [];
    for (let i = 0; i <= 10; i++) {
      const z = -1.095 + (i / 10) * 2.19;
      sph.push([Math.sqrt(R * R - z * z), z]);
    }
    return group(
      Lz([[1.49, -0.875], [EYE.bore - 0.04, -0.875], [EYE.bore, -0.84], [EYE.bore, 0.84], [EYE.bore - 0.04, 0.875], [1.49, 0.875], [1.66, 0.5], [1.66, -0.5], [1.49, -0.875]], 'steel'),
      Lz([[1.25, -1.095], ...sph, [1.25, 1.095], [1.25, -1.095]], 'chrome'),
    );
  };
  const circlip = () => {
    // circlip intérieur : anneau à section rectangulaire ouvert, deux oreilles percées
    const n = 40, ro = EYE.bore + 0.09, ri = EYE.bore - 0.17, gap = 0.35;
    const pts = [];
    for (let i = 0; i <= n; i++) { const a = gap / 2 + (i / n) * (Math.PI * 2 - gap); pts.push([ro * Math.cos(a), ro * Math.sin(a)]); }
    for (let i = n; i >= 0; i--) { const a = gap / 2 + (i / n) * (Math.PI * 2 - gap); pts.push([ri * Math.cos(a), ri * Math.sin(a)]); }
    const lug = (s) => {
      const a = s * (gap / 2 + 0.14);
      return at(cyl(u(0.17), u(0.1), 'blackOxide', { axis: 'z', seg: 14 }), v3((ri - 0.08) * Math.cos(a), (ri - 0.08) * Math.sin(a), 0));
    };
    return merged([extrude(pts.map(([x, y]) => [u(x), u(y)]), u(0.1), 'blackOxide'), lug(1), lug(-1)], 'blackOxide');
  };
  for (const [cx, s] of [[0, -1], [X.eye, 1]]) {
    P('4', at(ball(), v3(cx, 0, 0)), [0, 0, 0.16]);
    // circlip dans la gorge de la face +Z, ouverture tournée vers le corps du vérin
    P('2', at(circlip(), v3(cx, 0, EYE.T / 2 - 0.2), [0, 0, s > 0 ? Math.PI : 0]), [0, 0, 0.28]);
    P('9', at(zerk(S), v3(cx, EYE.R - 0.02, 0)), [0, 0.08, 0]);
  }

  return { view: { dir: [0.35, 0.55, 1] } };
}

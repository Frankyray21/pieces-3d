// P292 — Porteur articulé CX030879 rév. 3 (pages 292 à 305) : « ASSY,
// CARRIER, DU311 ». Porteur Pegasus à quatre roues motrices et articulation
// centrale, vu en isométrie (p. 292, 294), de dessus (p. 296), de côté et en
// coupe longitudinale (p. 298), de dessous (p. 300), en coupes de la
// transmission, des bridages d'essieu et de l'articulation (p. 302, 304) :
// - châssis avant (53) : flancs, tôle de nez (appui de la glissière),
//   traverse arrière, flancs convergents et quatre chapes de l'articulation,
//   chapes des vérins de direction, consoles des brides d'essieu, tablettes
//   des colliers ; garde-boue avant droit (51) et gauche (52) ; pont avant
//   Spicer (5) bridé par deux brides d'essieu (38), 8 vis 1"-8 × 12 (16),
//   écrous (112) et contre-écrous (113) ;
// - châssis arrière (46) : flancs ajourés, traverses, deux moyeux de
//   l'articulation, chapes arrière des vérins, garde-boue et caissons des
//   stabilisateurs, socles du moteur diesel ; pont arrière oscillant Spicer
//   (6) sur tourillons (chapeaux vissés par 4 vis 1"-8 × 6 (21) et rondelles
//   (106)), butées d'essieu (39) et leurs supports (40) ;
// - articulation (coupe E-E) : axes haut (33) et bas (32), douilles (34, 35)
//   dans les chapes avant, rotules (24) entre brides de palier (2) vissées
//   (94, 101) dans les moyeux arrière, rondelles épaisses (36), cales de
//   1/32 po (37, 5 par axe), écrous 1 1/2-12 (17), clavettes 1/2 po (61) ;
// - direction : deux vérins Ø 3 × 15 po (29, P306) sur axes expansibles Ø 2 po
//   (11) ; barre de verrouillage de l'articulation (30) rangée sur le châssis
//   avant, ses broches (41) et goupilles (12) ;
// - transmission : moteur hydraulique (50, P310) bridé par 4 vis M16 (1) sur
//   la boîte de transfert (7), arbre arrière (14) vers le pont arrière, arbres
//   « FRONT/ARTICLT » (9) de part et d'autre du frein à desserrage
//   hydraulique (43, P308) vers le pont avant, brides de croisillon (10),
//   boucles de sécurité (31) ;
// - hydraulique : collecteurs de pression (8), valve d'équilibrage (4),
//   valve du ventilateur de radiateur (13) sur sa console (55), adaptateurs
//   et coudes ORB / JIC (18-20, 25, 71-83), trousses de brides 1 1/4 code 62
//   (22) du moteur ;
// - air : tuyauteries avant (67, P312) et arrière (68, P314), colliers (26) et
//   plaques (27), plaques de colliers (65, 66) ;
// - stabilisateurs arrière : montage gauche (69, P316) à droite, montage
//   droit (70, P324) à gauche, écrans des détecteurs (45, 60), raccords (79) ;
// - divers : bavettes (48) et barres (49), plaques (47), consoles de flexibles
//   et de colliers (56-59, 62-64), cale de roue et sa fixation (42, 28, 44),
//   barre tubulaire (54) et goupille à poignée en T (15), additif d'huile
//   d'essieux (23), roues 12.00-20 (3), quincaillerie (84-114).
// Repère machine (../layout.js), posé à l'identité par P220 : origine au sol
// sous l'axe vertical de l'articulation, X vers l'avant, Y vers le haut, Z à
// droite. Roues en AXLE.front / AXLE.rear, z = ±WHEEL.z ; cotes partagées dans
// CAR (_carrier.js). Laisse la place à la cabine (M.cab), au capot moteur
// (M.engine, dessous à 1,2 m), au pont arrière (x < -2,75), aux équipements du
// pont avant et à la glissière (x ≥ 2,2).
// Pièces mobiles (simulation) : tout le châssis avant et ce qu'il porte dans
// le corps « front » ; roues et moyeux « wFL », « wFR », « wRL », « wRR » ;
// jambes des stabilisateurs « jackL », « jackR » ; vérins de direction
// « steerR », « steerL » (ramDetailed) ; arbre intermédiaire à cheval sur
// l'articulation ([chassis, front, 0,5]).
// Encombrement 5.05 (X, de -2.78 à +2.27) × 1.28 (Y) × 2.08 (Z) m.
// Cotes : liste (vis, filets, pneus 12.00-20, vérins, brides) ; implantation
// mesurée sur les vues de dessus et de dessous (p. 296, 300) à l'échelle de la
// voie et de l'empattement de layout.js, hauteurs sur la vue B et la coupe C-C
// (p. 298), articulation à l'échelle de l'écrou 1 1/2 po (coupe E-E, p. 302).
import { WHEEL, AXLE, M, body, ramDetailed } from '../layout.js';
import {
  u, L, put, along, bolted, hb, hbm, nt, fw, sw, nl, nyloc, orbPlug, jicStraight, jicElbow, jicTee, cross1410, yoke1410,
  wheel1200, CAR, ST, stTop, stPlateHoles, stPorts, stShield, SHIELD_T, SHIELD_HOLES, splitFlangeKit, pipeClamp, frameAt, T_FW, T_SW, UJ,
} from './_carrier.js';
import { CYL306 } from './P306.js';
import { YOKE308 } from './P308.js';
import { PORTS310 } from './P310.js';
import { CLAMPS312 } from './P312.js';
import { CLAMPS314 } from './P314.js';

const FB = M.frameBot, FT = M.frameTop, FZ = M.frameZ;
const T1 = u(1); // tôles de 1 po
const D = CAR.drive;
const H = CAR.hub;

export default function P292(api) {
  const { THREE, S } = api;
  const { box, cyl, extrude, merged, group, at, weld } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (ref, obj, e) => P(ref, body('front', obj), e);
  const tagF = (list) => list.forEach((o) => body('front', o));
  const Bf = (spec) => tagF(bolted(api, spec));
  const Br = (spec) => bolted(api, spec);

  // Tôle horizontale : contour [[x, z]], de y0 à y1, trous [[x, z, r]].
  const slabY = (pts, y0, y1, mat = 'lightGrey', holes = []) => {
    const m = extrude(pts.map(([x, z]) => [x, z]), y1 - y0, mat, { holes: holes.map(([x, z, r]) => [x, z, r]) });
    m.rotation.x = Math.PI / 2;
    m.position.y = (y0 + y1) / 2;
    return m;
  };
  // Tôle verticale parallèle à XY : contour [[x, y]], centrée en z, épaisseur t.
  const slabZ = (pts, z, t, mat = 'lightGrey', holes = []) => {
    const m = extrude(pts, t, mat, { holes });
    m.position.z = z;
    return m;
  };
  // Tôle verticale parallèle à YZ : contour [[z, y]], centrée en x.
  const slabX = (pts, x, t, mat = 'lightGrey', holes = []) => {
    const m = extrude(pts.map(([z, y]) => [-z, y]), t, mat, { holes: holes.map(([z, y, r]) => [-z, y, r]) });
    m.rotation.y = Math.PI / 2;
    m.position.x = x;
    return m;
  };
  const arc = (cx, cz, r, a0, a1, n = 10) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + r * Math.cos(a), cz + r * Math.sin(a)]; });
  const rect = (x0, x1, y0, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

  // =====================================================================
  // 53 — châssis avant (corps « front »)
  // =====================================================================
  const fSide = [[0.6, FB], [1.38, FB], [1.42, 0.7], [1.88, 0.7], [1.92, FB], [M.nose, FB], [M.nose, FT - 0.08], [M.nose - 0.08, FT], [0.6, FT]];
  const forkPlate = (yc) => slabY([[0.62, -FZ], [0.62, FZ], [0.13, 0.21], ...arc(0, 0, 0.16, 0.95, 2 * Math.PI - 0.95, 14), [0.13, -0.21]],
    yc - T1 / 2, yc + T1 / 2, 'lightGrey', [[0, 0, 0.046]]);
  const vPlate = (s) => {
    const a = [0.6, s * (FZ - 0.0125)], b = [0.1, s * 0.17];
    const len = Math.hypot(a[0] - b[0], a[1] - b[1]);
    const m = box(len, 0.974 - 0.346, T1, 'lightGrey');
    const g = group(m);
    g.position.set((a[0] + b[0]) / 2, (0.974 + 0.346) / 2, (a[1] + b[1]) / 2);
    g.rotation.y = -Math.atan2(a[1] - b[1], a[0] - b[0]);
    return g;
  };
  const steerLug = (s, y) => {
    const [px, , pz] = CAR.steer.rod;
    const pts = [[0.3, 0.245], [0.16, 0.345], ...arc(px, pz, 0.065, Math.PI / 2, Math.PI * 1.5, 8), [0.11, 0.19], [0.16, 0.18]];
    return slabY(pts.map(([x, z]) => [x, s * z]), y - T1 / 2, y + T1 / 2, 'lightGrey', [[px, s * pz, u(1.02)]]);
  };
  const axleBracket = (s) => group(
    slabY([[1.5, s * (FZ + 0.0125)], [1.8, s * (FZ + 0.0125)], [1.8, s * 0.72], [1.5, s * 0.72]], 0.7, 0.725),
    ...[1.515, 1.785].map((x) => slabX([[s * (FZ + 0.0125), 0.725], [s * 0.7, 0.725], [s * (FZ + 0.0125), 0.92]], x, u(0.5))),
  );
  const shelf = (x) => box(0.08, 0.012, 0.17, 'lightGrey', { pos: [x, CLAMPS312[0].pos[1] - pipeClamp(api).axisY - 0.006, -FZ + 0.0125 + 0.085] });
  const lockLug = (x, z0) => slabY([[x - 0.04, z0], [x + 0.04, z0], ...arc(x, 0.567, 0.04, 0, Math.PI, 8)], 0.866, 0.89, 'lightGrey', [[x, 0.567, u(0.66)]]);
  const crossF = [ // traverse arrière (ouverture de l'arbre)
    slabX(rect(-FZ + 0.0125, -0.15, FB, FT - 0.02), 0.6125, T1), slabX(rect(0.15, FZ - 0.0125, FB, FT - 0.02), 0.6125, T1), slabX(rect(-0.15, 0.15, 0.8, FT - 0.02), 0.6125, T1),
  ];
  F('53', group(
    merged([
      ...[1, -1].map((s) => slabZ(fSide, s * FZ, T1, 'lightGrey', [[1.02, 0.74, 0.09], [2.04, 0.66, 0.065]])),
      slabX(rect(-FZ + 0.0125, FZ - 0.0125, FB, FT - 0.08), M.nose - 0.0125, T1, 'lightGrey', [[-0.36, 0.9, 0.04]]),
      ...crossF, vPlate(1), vPlate(-1),
      ...[H.bot - H.fork, H.bot + H.fork, H.top - H.fork, H.top + H.fork].map(forkPlate),
      ...[1, -1].flatMap((s) => [steerLug(s, 0.582), steerLug(s, 0.658)]),
      axleBracket(1), axleBracket(-1),
      ...CLAMPS312.map((c) => shelf(c.pos[0])),
      lockLug(0.9, FZ + 0.0125), lockLug(0.29, 0.26),
      // petite cornière de la boucle de sécurité avant, sur la traverse
      box(0.07, 0.01, 0.24, 'lightGrey', { pos: [0.66, 0.805, 0] }),
      // cordons : flancs / tôle de nez
      ...[1, -1].map((s) => weld([[M.nose - 0.026, FB + 0.02, s * (FZ - 0.014)], [M.nose - 0.026, FT - 0.1, s * (FZ - 0.014)]], 0.012, 'lightGrey')),
    ], 'lightGrey'),
  ), [0.35, 0, 0]);

  // =====================================================================
  // 46 — châssis arrière (châssis fixe)
  // =====================================================================
  const rSide = [[-2.75, FB], [-2.0, FB], [-1.94, 0.74], [-1.32, 0.74], [-1.26, FB], [-0.45, FB], [-0.32, 0.52], [-0.32, 0.92], [-0.4, FT], [-2.75, FT]];
  const hubPlate = (yc) => slabY([[-0.45, -FZ + 0.0125], [-0.12, -0.19], ...arc(0, 0, 0.152, -(Math.PI - 0.9), Math.PI - 0.9, 18), [-0.12, 0.19], [-0.45, FZ - 0.0125]],
    yc - u(0.625), yc + u(0.625), 'lightGrey', [[0, 0, 0.061]]);
  const hubBoss = (yc) => L(S, [[2.4, -1.65], [6.0, -1.65], [6.0, 1.65], [2.4, 1.65], [2.4, -1.65]], 'lightGrey', 28, { pos: [0, yc, 0] });
  const rearLug = (s, y) => {
    const [px, , pz] = CAR.steer.rear;
    const pts = [[px - 0.065, FZ - 0.0125], [px + 0.065, FZ - 0.0125], ...arc(px, pz, 0.065, 0, -Math.PI, 8).map(([a, b]) => [a, b])];
    return slabY(pts.map(([x, z]) => [x, s * z]), y - T1 / 2, y + T1 / 2, 'lightGrey', [[px, s * pz, u(1.02)]]);
  };
  const C1x = -1.03, C2x = -1.4, C3x = -1.92;
  const crossBox = (x) => box(0.12, 0.06, 2 * FZ - T1, 'lightGrey', { pos: [x, 0.78, 0], r: 0.008 });
  const fenderR = (s) => [
    slabY([[-2.75, s * (FZ + 0.0125)], [-1.08, s * (FZ + 0.0125)], [-1.08, s * 1.0], [-2.75, s * 1.0]], 1.17, 1.176),
    box(1.67, 0.13, 0.006, 'lightGrey', { pos: [-1.915, 1.11, s * 0.997] }),
    slabX(rect(0.62, 1.0, 0.62, 1.17).map(([z, y]) => [s * z, y]), -1.08, 0.006),
    slabZ(rect(-2.3, -1.08, 0.74, 1.17), s * 0.62, 0.006),
    slabX(rect(FZ + 0.0125, 1.0, 0.62, 1.17).map(([z, y]) => [s * z, y]), -2.3, u(0.5)),
    slabX(rect(FZ + 0.0125, 1.0, 0.62, 1.17).map(([z, y]) => [s * z, y]), -2.735, u(0.5)),
    // caisson du stabilisateur : platine d'appui (face en z = ±0,7675), tôle de liaison au flanc
    slabZ(rect(-2.64, -2.36, 0.58, 1.17), s * (0.7675 - T1 / 2), T1),
    slabY([[-2.64, s * (FZ + 0.0125)], [-2.36, s * (FZ + 0.0125)], [-2.36, s * 0.742], [-2.64, s * 0.742]], 0.6, 0.62),
  ];
  const posts = [];
  for (const x of [C2x, C3x]) for (const z of [-0.215, 0.263]) {
    posts.push(box(0.1, 0.34, 0.1, 'lightGrey', { pos: [x, 0.98, z], r: 0.006 }), box(0.16, 0.016, 0.16, 'lightGrey', { pos: [x, 1.158, z] }));
  }
  P('46', group(
    merged([
      ...[1, -1].map((s) => slabZ(rSide, s * FZ, T1, 'lightGrey', [[-2.42, 0.71, 0.1], [-0.8, 0.71, 0.085], [-1.63, 0.89, 0.06]])),
      slabX(rect(-FZ + 0.0125, FZ - 0.0125, FB, FT), -2.7375, T1, 'lightGrey', [[-0.11, 0.858, 0.045]]),
      box(0.26, T1, 2 * FZ - T1, 'lightGrey', { pos: [-0.43, 0.9577, 0] }),
      slabX(rect(-FZ + 0.0125, -0.14, FB, 0.98), C1x, T1), slabX(rect(0.14, FZ - 0.0125, FB, 0.98), C1x, T1), slabX(rect(-0.14, 0.14, 0.76, 0.98), C1x, T1),
      box(0.05, 0.01, 0.24, 'lightGrey', { pos: [C1x - 0.04, 0.765, 0] }),
      crossBox(C2x), crossBox(C3x),
      hubPlate(H.top), hubPlate(H.bot), hubBoss(H.top), hubBoss(H.bot),
      ...[1, -1].map((s) => box(0.42, 0.44, T1, 'lightGrey', { pos: [-0.41, (H.bot + H.top) / 2, s * 0.18] })),
      ...[1, -1].flatMap((s) => [rearLug(s, 0.582), rearLug(s, 0.658)]),
      // supports des butées d'essieu
      ...[1, -1].map((s) => box(0.24, 0.025, FZ - 0.0125 - 0.26, 'lightGrey', { pos: [-1.63, 0.7285, s * (0.26 + (FZ - 0.0125 - 0.26) / 2)] })),
      ...fenderR(1), ...fenderR(-1), ...posts,
      ...[1, -1].map((s) => weld([[-2.725, FB + 0.02, s * (FZ - 0.014)], [-2.725, FT - 0.02, s * (FZ - 0.014)]], 0.012, 'lightGrey')),
    ], 'lightGrey'),
    // isolateurs en caoutchouc des socles du moteur
    merged(posts.filter((_, i) => i % 2).map((p) => cyl(0.045, 0.03, 'rubber', { pos: [p.position.x, 1.181, p.position.z], seg: 20 })), 'rubber'),
  ), [-0.3, 0, 0]);

  // =====================================================================
  // Articulation (coupe E-E, détail M)
  // =====================================================================
  for (const [ref, yc, sleeveRef] of [['33', H.top, '34'], ['32', H.bot, '35']]) {
    const yLo = yc - H.fork - T1 / 2, yUp = yc + H.fork + T1 / 2; // dessous de la chape basse, dessus de la chape haute
    // axe : tête sous la chape basse, corps Ø 3 po, épaulement, filet 1 1/2-12 au-dessus de la rondelle
    const k = 1 / 0.0254, y0 = yLo * k, y1 = yUp * k;
    F(ref, L(S, [[0, y0 - 0.8], [2.05, y0 - 0.8], [2.1, y0 - 0.7], [2.1, y0], [1.5, y0], [1.5, y1 + 0.03], [0.75, y1 + 0.03], [0.75, y1 + 1.95], [0.68, y1 + 2.05], [0, y1 + 2.05]], 'steel', 32), [0, ref === '33' ? 0.25 : -0.25, 0]);
    // douille dans la chape haute
    F(sleeveRef, L(S, [[1.5, y1 - 1.0], [1.8, y1 - 1.0], [1.8, y1 + 0.02], [1.5, y1 + 0.02], [1.5, y1 - 1.0]], 'brass', 32), [0, 0.14, 0]);
    // cales (5), rondelle épaisse, écrou
    for (let i = 0; i < 5; i++) F('37', L(S, [[0.77, y1 + 0.03 + i * 0.03125], [2.0, y1 + 0.03 + i * 0.03125], [2.0, y1 + 0.03 + (i + 0.8) * 0.03125], [0.77, y1 + 0.03 + (i + 0.8) * 0.03125], [0.77, y1 + 0.03 + i * 0.03125]], 'steel', 28), [0, 0.18 + i * 0.012, 0]);
    const yw = yUp + u(0.03 + 5 * 0.03125);
    F('36', put(THREE, fw(S, 1.5, { od: 4.5, t: 0.4, seg: 28 }), [0, yw, 0], [0, 1, 0]), [0, 0.26, 0]);
    F('17', put(THREE, nt(S, 1.5), [0, yw + u(0.4), 0], [0, 1, 0]), [0, 0.32, 0]);
    // clavette 1/2 po à la tête de l'axe et sa vis 3/8 × 5/8
    F('61', box(u(0.5), u(0.5), u(2.0), 'steel', { pos: [u(2.35), yLo - u(0.4), 0] }), [0.06, -0.1, 0]);
    Bf({ pos: [u(2.35), yLo - u(0.65), 0], dir: [0, -1, 0], grip: u(0.5), d: 0.375, len: 0.625, ref: '85', k: 0.05 });
    // moyeu arrière : rotule (24) et deux brides de palier (2), 6 vis 1/2 × 1 et rondelles par bride
    P('24', group(
      L(S, [[1.95, yc * k - 1.1], [2.4, yc * k - 1.1], [2.4, yc * k + 1.1], [1.95, yc * k + 1.1], [1.95, yc * k - 1.1]], 'steel', 32),
      L(S, [[1.5, yc * k - 1.25], ...Array.from({ length: 9 }, (_, i) => { const a = -0.55 + (1.1 * i) / 8; return [2.0 * Math.cos(a), yc * k + 2.0 * Math.sin(a)]; }), [1.5, yc * k + 1.25], [1.5, yc * k - 1.25]], 'chrome', 32),
    ), [0, 0, 0.3]);
    for (const sg of [1, -1]) {
      const face = yc + sg * H.t / 2;
      P('2', L(S, [[2.1, 0], [4.8, 0], [4.8, 0.5], [2.1, 0.5], [2.1, 0]], 'darkSteel', 40, { pos: [0, face + (sg < 0 ? -u(0.5) : 0), 0] }), [0, sg * 0.1, 0.3]);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        Br({ pos: [Math.cos(a) * u(3.7), face + sg * u(0.5), Math.sin(a) * u(3.7)], dir: [0, sg, 0], grip: u(0.5), d: 0.5, len: 1.0, ref: '94', head: [['101', 'fw']], k: 0.05 });
      }
    }
  }

  // =====================================================================
  // Direction : vérins (29, P306) et axes expansibles (11)
  // =====================================================================
  const R0 = CAR.steer.rear, R1 = CAR.steer.rod;
  for (const s of [1, -1]) {
    const A = [R0[0], R0[1], s * R0[2]], B = [R1[0], R1[1], s * R1[2]];
    const dx = B[0] - A[0], dz = B[2] - A[2], Lp = Math.hypot(dx, dz);
    const ext = Lp - CYL306.retracted;
    const cyl29 = api.sub('P306', { ext });
    at(cyl29, A, [s < 0 ? Math.PI : 0, Math.atan2(-dz, dx), 0, 'YXZ']);
    P('29', ramDetailed(s > 0 ? 'steerR' : 'steerL', 'chassis', 'front', cyl29, { rear: [0, 0, 0], rod: [CYL306.retracted + ext, 0, 0], stroke: CYL306.stroke }), [0, 0.25, s * 0.25]);
    // axes expansibles Ø 2 po : axe, bagues coniques fendues et vis à rondelle aux deux bouts
    for (const [p, front] of [[A, false], [B, true]]) {
      const yb = p[1] - 0.064, yt = p[1] + 0.064;
      const pin = group(
        cyl(u(1), yt - yb, 'steel', { pos: [p[0], (yb + yt) / 2, p[2]], seg: 16 }),
        merged([yb, yt].map((y, j) => L(S, [[0.5, 0], [1.08, 0], [1.2, 0.35], [1.2, 0.5], [0.5, 0.5], [0.5, 0]], 'steel', 14, { pos: [p[0], y + (j ? 0 : -u(0.5)), p[2]] })), 'steel'),
        merged([yb, yt].flatMap((y, j) => {
          const dir = j ? [0, 1, 0] : [0, -1, 0];
          const y0 = j ? y + u(0.5) : y - u(0.5);
          return [put(THREE, fw(S, 0.5, { od: 1.6, t: 0.12 }), [p[0], y0, p[2]], dir), put(THREE, hb(S, 0.5, 1.25), [p[0], y0 + (j ? 1 : -1) * u(0.12), p[2]], dir)];
        }), 'zinc'),
      );
      (front ? F : P)('11', pin, [0, 0.12, s * 0.1]);
    }
  }

  // =====================================================================
  // Ponts, brides d'essieu, roues
  // =====================================================================
  const axle = (x, front) => {
    const yA = AXLE.y, yP = D.y;
    const sx = front ? -1 : 1; // côté du pignon (vers la boîte de transfert)
    const g = group();
    const castList = [
      // carter de pont (banjo) et couvercle arrière
      L(S, [[0, -0.13], [0.11, -0.13], [0.165, -0.08], [0.17, 0], [0.165, 0.08], [0.11, 0.13], [0, 0.13]].map(([r, z]) => [r / 0.0254, z / 0.0254]), 'castIron', 24, { axis: 'z', pos: [x, yA, 0] }),
      L(S, [[0, 0], [0.13, 0], [0.12, 0.05], [0.07, 0.08], [0, 0.085]].map(([r, z]) => [r / 0.0254, z / 0.0254]), 'castIron', 20, { axis: sx > 0 ? '-x' : 'x', pos: [x - sx * 0.11, yA + 0.02, 0] }),
      // nez de pont (pignon), vers la boîte
      L(S, [[0, 0], [0.14, 0], [0.14, 0.03], [0.1, 0.06], [0.075, 0.2], [0.06, 0.24], [0, 0.24]].map(([r, z]) => [r / 0.0254, z / 0.0254]), 'castIron', 20, { axis: sx > 0 ? 'x' : '-x', pos: [x + sx * 0.08, yP, 0] }),
      // trompettes, carters de freins multidisques
      ...[1, -1].map((s) => L(S, [[0.0635, 0.12], [0.09, 0.12], [0.07, 0.2], [0.0635, 0.25], [0.0635, 0.69], [0.0, 0.69]].map(([r, z]) => [r / 0.0254, z / 0.0254]), 'castIron', 18, { axis: s > 0 ? 'z' : '-z', pos: [x, yA, 0] })),
      ...[1, -1].map((s) => L(S, [[0.06, 0.69], [0.115, 0.69], [0.12, 0.7], [0.12, 0.755], [0.115, 0.765], [0.06, 0.765]].map(([r, z]) => [r / 0.0254, z / 0.0254]), 'castIron', 24, { axis: s > 0 ? 'z' : '-z', pos: [x, yA, 0] })),
      ...[1, -1].flatMap((s) => [0, 1, 2, 3].map((i) => { const a = (i / 4) * Math.PI * 2 + 0.4; return box(0.012, 0.012, 0.06, 'castIron', { pos: [x + Math.cos(a) * 0.12, yA + Math.sin(a) * 0.12, s * 0.727] }); })),
    ];
    if (front) castList.push(...[1, -1].map((s) => box(0.2, 0.077, 0.13, 'castIron', { pos: [x, 0.6615, s * 0.63], r: 0.006 })));
    else {
      // tourillons avant (bague autour du nez) et arrière (axe sur le couvercle), chapeaux inférieurs vissés au châssis
      castList.push(L(S, [[0.06 / 0.0254, 0], [0.085 / 0.0254, 0], [0.085 / 0.0254, 0.06 / 0.0254], [0.06 / 0.0254, 0.06 / 0.0254]], 'castIron', 20, { axis: 'x', pos: [C2x - 0.03, yP, 0] }));
      castList.push(L(S, [[0, 0], [0.075 / 0.0254, 0], [0.075 / 0.0254, 0.03 / 0.0254], [0.06 / 0.0254, 0.03 / 0.0254], [0.06 / 0.0254, 0.16 / 0.0254], [0, 0.16 / 0.0254]], 'castIron', 20, { axis: '-x', pos: [x - 0.15, yP, 0] }));
      castList.push(box(0.1, yP - yA + 0.04, 0.1, 'castIron', { pos: [x - 0.17, (yA + yP) / 2, 0] }));
      for (const xc of [C2x, C3x]) {
        castList.push(box(0.07, 0.03, 0.3, 'castIron', { pos: [xc, yP - 0.1, 0] }));
        for (const z of [-1, 1]) castList.push(box(0.07, 0.09, 0.06, 'castIron', { pos: [xc, 0.705, z * 0.13] }), box(0.07, 0.11, 0.025, 'castIron', { pos: [xc, yP - 0.04, z * 0.095] }));
      }
    }
    g.add(merged(castList, 'castIron'));
    // chape de pignon (oreilles selon ±Z), bouchons de remplissage et de vidange, reniflard
    g.add(put(THREE, yoke1410(S, THREE, { hub: 2.6, yb: 1.2, ye: 2.6 }), [x + sx * 0.32, yP, 0], [sx, 0, 0], Math.PI / 2));
    g.add(merged([
      put(THREE, orbPlug(S, THREE, 12), [x - sx * 0.14, yA + 0.05, 0.09], [-sx, 0, 0.6]),
      put(THREE, orbPlug(S, THREE, 12), [x, yA - 0.17, 0], [0, -1, 0]),
      ...[1, -1].map((s) => put(THREE, orbPlug(S, THREE, 8), [x, yA - 0.12, s * 0.727], [0, -1, 0])),
      put(THREE, L(S, [[0, 0], [0.18, 0], [0.18, 0.5], [0.4, 0.55], [0.4, 0.75], [0, 0.8]], 'zinc', 10), [x, yA + 0.0635, -0.3], [0, 1, 0]),
    ], 'zinc'));
    // moyeux planétaires (tournent avec la roue) : bride, couvercle, vis, bouchon de vidange
    for (const s of [1, -1]) {
      const hub = group(
        L(S, [[0.08, 0.72], [0.17, 0.72], [0.17, 0.755], [0.205, 0.765], [0.205, 0.797], [0.105, 0.797], [0.105, 0.86], [0.095, 0.87], [0, 0.87]].map(([r, z]) => [r / 0.0254, z / 0.0254]), 'castIron', 22, { axis: s > 0 ? 'z' : '-z', pos: [x, yA, 0] }),
        merged(Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return put(THREE, hb(S, 0.375, 0.75), [x + Math.cos(a) * 0.085, yA + Math.sin(a) * 0.085, s * 0.862], [0, 0, s]); }), 'zinc'),
        put(THREE, orbPlug(S, THREE, 8), [x + 0.05, yA, s * 0.872], [0, 0, s]),
      );
      g.add(body((front ? 'wF' : 'wR') + (s > 0 ? 'R' : 'L'), hub));
    }
    return g;
  };
  F('5', axle(AXLE.front, true), [0, -0.25, 0]);
  P('6', axle(AXLE.rear, false), [0, -0.25, 0]);
  // tourillons : vis 1"-8 × 6 (21) et rondelles (106) des chapeaux, par le dessus des traverses
  for (const cx of [C2x, C3x]) {
    for (const z of [-0.13, 0.13]) Br({ pos: [cx, 0.81, z], dir: [0, 1, 0], grip: 0.15, d: 1.0, len: 6, ref: '21', head: [['106', 'sw']], k: 0.06 });
  }
  // brides d'essieu avant : bride (38), vis 1" × 12 (16) par-dessous, écrous (112) et contre-écrous (113)
  for (const s of [1, -1]) {
    F('38', group(merged([
      box(0.3, 0.04, 0.11, 'lightGrey', { pos: [AXLE.front, 0.475, s * 0.63], r: 0.006 }),
      ...[-1, 1].map((k) => box(0.03, 0.03, 0.11, 'lightGrey', { pos: [AXLE.front + k * 0.05, 0.505, s * 0.63] })),
    ], 'lightGrey')), [0, -0.2, 0]);
    for (const [dx, z] of [[-0.09, 0.597], [0.09, 0.597], [-0.09, 0.662], [0.09, 0.662]]) {
      Bf({ pos: [AXLE.front + dx, 0.455, s * z], dir: [0, -1, 0], grip: 0.27, d: 1.0, len: 12, ref: '16', tail: [['112', 'nut'], ['113', 'jam']], k: 0.08 });
    }
  }
  // roues 12.00-20 (3)
  for (const [x, w] of [[AXLE.front, 'wF'], [AXLE.rear, 'wR']]) {
    for (const s of [1, -1]) P('3', body(w + (s > 0 ? 'R' : 'L'), at(wheel1200(api, { side: s }), [x, AXLE.y, s * WHEEL.z])), [0, 0, s * 0.45]);
  }
  // butées d'essieu arrière (39) dans leurs supports (40), vis 5/8 × 3 3/4 (98), rondelles (102, 105), écrous (111)
  for (const s of [1, -1]) {
    P('39', box(u(4), u(2), u(3), 'rubber', { pos: [AXLE.rear, 0.655 + u(1), s * 0.36], r: 0.006 }), [0, -0.08, 0]);
    P('40', group(
      box(u(7.5), u(0.375), u(3.5), 'darkSteel', { pos: [AXLE.rear, 0.716 - u(0.1875), s * 0.36] }),
      box(u(4.4), u(1.2), u(0.375), 'darkSteel', { pos: [AXLE.rear, 0.716 - u(0.6), s * 0.36 + u(1.69)] }),
      box(u(4.4), u(1.2), u(0.375), 'darkSteel', { pos: [AXLE.rear, 0.716 - u(0.6), s * 0.36 - u(1.69)] }),
    ), [0, -0.05, 0]);
    for (const dx of [-u(3.0), u(3.0)]) {
      Br({ pos: [AXLE.rear + dx, 0.741, s * 0.36], dir: [0, 1, 0], grip: 0.025 + u(0.375), d: 0.625, len: 3.75, ref: '98', head: [['102', 'fw']], tail: [['105', 'sw'], ['111', 'nut']], k: 0.06 });
    }
  }

  // =====================================================================
  // Transmission : boîte (7), moteur (50), frein (43), arbres (9, 14), brides (10), boucles (31)
  // =====================================================================
  const [bx0, bx1] = D.box, yIn = D.input;
  const hull = [];
  for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; hull.push([0.115 * Math.cos(a), D.y + 0.115 * Math.sin(a)]); }
  for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; hull.push([0.105 * Math.cos(a), yIn + 0.105 * Math.sin(a)]); }
  P('7', group(
    merged([
      slabX(hull, (bx0 + bx1) / 2, bx1 - bx0, 'castAlu'),
      // nervures, pattes de fixation sur le dessus
      ...[-1, 1].map((s) => box(bx1 - bx0 + 0.02, yIn - D.y, 0.015, 'castAlu', { pos: [(bx0 + bx1) / 2, (D.y + yIn) / 2, s * 0.112] })),
      ...[-0.46, -0.38].map((x) => box(0.05, 0.03, 0.26, 'castAlu', { pos: [x, 0.93, 0], r: 0.004 })),
      // bossages des sorties avant / arrière
      L(S, [[0, 0], [2.4, 0], [2.4, 0.7], [1.6, 1.0], [0, 1.0]], 'castAlu', 28, { axis: 'x', pos: [bx1, D.y, 0] }),
      L(S, [[0, 0], [2.4, 0], [2.4, 0.7], [1.6, 1.0], [0, 1.0]], 'castAlu', 28, { axis: '-x', pos: [bx0, D.y, 0] }),
    ], 'castAlu'),
    // chapes de sortie (oreilles selon ±Z), bouchons de remplissage / vidange
    put(THREE, yoke1410(S, THREE, { hub: 2.6, yb: 0.2, ye: 1.6 }), [bx1 + u(1.0), D.y, 0], [1, 0, 0], Math.PI / 2),
    put(THREE, yoke1410(S, THREE, { hub: 2.6, yb: 0.2, ye: 1.6 }), [bx0 - u(1.0), D.y, 0], [-1, 0, 0], Math.PI / 2),
    merged([put(THREE, orbPlug(S, THREE, 12), [-0.42, D.y - 0.115, 0], [0, -1, 0]), put(THREE, orbPlug(S, THREE, 12), [-0.42, yIn + 0.02, 0.1], [0, 0.4, 1])], 'zinc'),
  ), [0, 0.15, 0]);
  for (const x of [-0.46, -0.38]) for (const z of [-0.1, 0.1]) Br({ pos: [x, 0.97, z], dir: [0, 1, 0], grip: 0.055, d: 0.5625, len: 4.5, ref: '95', head: [['107', 'nl']], k: 0.06 });
  // moteur (50) : bride sur la face arrière de la boîte, régulateur vers +Z ; 4 vis M16 × 55 (1) et rondelles (108)
  const mot = (p) => [bx0 + p[0], yIn - p[2], p[1]];
  const motDir = (d) => [d[0], -d[2], d[1]];
  P('50', at(api.sub('P310'), [bx0, yIn, 0], [Math.PI / 2, 0, 0]), [-0.25, 0.1, 0]);
  for (const h of PORTS310.flangeHoles) Br({ pos: mot([-0.022, h[1], h[2]]), dir: [-1, 0, 0], grip: 0.022, d: 0.63, len: 2.17, ref: '1', metric: [16, 55], head: [['108', 'nl']], k: 0.06 });
  // trousses de brides 1 1/4 code 62 sur A et B (22), adaptateurs M26 → #16 (18), M14 → #6 (19), M12 → #6 (20)
  for (const k of ['A', 'B']) {
    const o = splitFlangeKit(api, 'zinc');
    o.scale.setScalar(0.78);
    P('22', frameAt(THREE, o, mot(PORTS310[k].pos), motDir(PORTS310[k].dir), [1, 0, 0]), motDir(PORTS310[k].dir).map((v) => v * 0.1));
  }
  P('18', put(THREE, jicStraight(S, THREE, 16, 16, { metric: 26 }), mot(PORTS310.T.pos), motDir(PORTS310.T.dir)), [0, 0, 0.1]);
  const fit19 = [
    [mot(PORTS310.X1.pos), motDir(PORTS310.X1.dir)], [mot(PORTS310.X2.pos), motDir(PORTS310.X2.dir)],
    [[-0.42, 0.74, 0.122], [0, 0, 1]],
    [[D.brake + YOKE308.port[0], D.y + YOKE308.port[1], 0], [0, 1, 0]],
  ];
  for (const [x, front] of [[AXLE.front, true], [AXLE.rear, false]]) {
    for (const s of [1, -1]) fit19.push([[x - 0.12, 0.6, s * 0.727], [-1, 0, 0], front]);
    fit19.push([[x + (front ? -0.3 : 0.3), D.y + 0.065, 0.04], [0, 1, 0], front]);
  }
  fit19.forEach(([p, d, front], i) => {
    const o = put(THREE, jicStraight(S, THREE, 6, 6, { metric: 14 }), p, d);
    (front || i === 3 ? F : P)('19', o, d.map((v) => v * 0.08));
  });
  // tés à écrou tournant (71) sur les adaptateurs des freins de ponts
  fit19.slice(4).filter((_, i) => i % 3 !== 2).forEach(([p, d, front]) => {
    const q = [p[0] + d[0] * u(1.1), p[1], p[2]];
    (front ? F : P)('71', put(THREE, jicTee(S, THREE, 6, { swivel: true, branch: true }), q, [-1, 0, 0]), [-0.1, 0, 0]);
  });
  for (const z of [-0.03, 0.03]) P('20', put(THREE, jicStraight(S, THREE, 6, 6, { metric: 12 }), mot([-0.29, 0.143, z]), motDir([0, 1, 0])), [0, 0, 0.1]);

  // frein (43) sur la chape haute de l'articulation basse ; vis 5/8 × 3 3/4 (98), rondelles fendues (105), écrous (111)
  F('43', at(api.sub('P308'), [D.brake, D.y, 0]), [0, 0.2, 0]);
  const plateBot = H.bot + H.fork - T1 / 2, footTop = D.y + YOKE308.footY + u(0.5);
  for (const [hx, hz] of YOKE308.holes) {
    Bf({ pos: [D.brake + hx, footTop, hz], dir: [0, 1, 0], grip: footTop - plateBot, d: 0.625, len: 3.75, ref: '98', tail: [['105', 'sw'], ['111', 'nut']], k: 0.06 });
  }
  // arbres de transmission série 1410 : chapes soudées (oreilles ±Y), tube Ø 3 1/2, coulisse et soufflet, croisillons
  const shaft = (xa, xb, slip = true) => {
    const g = group();
    const yk = (x, side) => put(THREE, yoke1410(S, THREE, { hub: 2.9, yb: 1.0, ye: 2.6 }), [x + side * u(2.6), D.y, 0], [-side, 0, 0]);
    const len = xb - xa - 2 * u(2.6 + 1.55);
    const x0 = xa + u(2.6 + 1.55);
    g.add(merged([
      yk(xa, 1), yk(xb, -1),
      L(S, [[0, 0], [UJ.tube / 2, 0], [UJ.tube / 2, len / 0.0254 * (slip ? 0.62 : 1)], [0, len / 0.0254 * (slip ? 0.62 : 1)]], 'black', 24, { axis: 'x', pos: [x0, D.y, 0] }),
      ...(slip ? [L(S, [[0, 0], [1.25, 0], [1.25, len / 0.0254 * 0.38], [0, len / 0.0254 * 0.38]], 'steel', 20, { axis: 'x', pos: [x0 + len * 0.62, D.y, 0] })] : []),
    ], 'steel'));
    if (slip) g.add(L(S, [[1.25, 0], [1.65, 0.3], [1.5, 0.6], [1.75, 0.9], [1.5, 1.2], [1.75, 1.5], [1.3, 1.9]], 'rubber', 14, { axis: 'x', pos: [x0 + len * 0.62 - u(0.2), D.y, 0] }));
    for (const x of [xa, xb]) g.add(at(cross1410(S, THREE), [x, D.y, 0]));
    // masses d'équilibrage soudées sur le tube
    g.add(box(u(1.2), u(0.18), u(0.9), 'black', { pos: [x0 + len * 0.3, D.y + u(UJ.tube / 2 + 0.06), 0] }));
    return g;
  };
  P('14', shaft(D.rearPinion, D.boxRear), [0, -0.12, 0]);
  const s9a = shaft(D.boxFront, D.brake - YOKE308.x);
  s9a.userData.body = ['chassis', 'front', 0.5];
  P('9', s9a, [0, -0.12, 0]);
  F('9', shaft(D.brake + YOKE308.x, D.frontPinion), [0, -0.12, 0]);
  // brides de croisillon (10) : deux brides en U et 4 vis sur chaque chape d'organe (bols selon ±Z)
  const strap = (x, dir) => {
    const list = [];
    for (const sz of [1, -1]) {
      const zc = sz * u(UJ.span / 2 - 0.25);
      list.push(box(u(0.9), u(1.9), u(0.12), 'zinc', { pos: [x + dir * u(0.2), D.y, zc + sz * u(0.32)] }));
      list.push(box(u(0.12), u(1.9), u(0.6), 'zinc', { pos: [x + dir * u(0.62), D.y, zc] }));
      for (const sy of [1, -1]) list.push(put(THREE, hb(S, 0.3125, 0.75), [x + dir * u(0.68), D.y + sy * u(0.78), zc], [-dir, 0, 0]));
    }
    return merged(list, 'zinc');
  };
  P('10', strap(D.rearPinion, -1), [0.05, 0.05, 0]);
  P('10', strap(D.boxRear, 1), [0.05, 0.05, 0]);
  P('10', strap(D.boxFront, -1), [0.05, 0.05, 0]);
  F('10', strap(D.brake - YOKE308.x, 1), [0.05, 0.05, 0]);
  F('10', strap(D.brake + YOKE308.x, -1), [0.05, 0.05, 0]);
  F('10', strap(D.frontPinion, 1), [0.05, 0.05, 0]);
  // boucles de sécurité (31) : feuillard en U autour de l'arbre, deux vis 1/2 × 1 (94) et rondelles fendues (104)
  const loop = (x, yTop) => {
    const r0 = 0.075, pts = [[-0.11, yTop], [-r0, yTop], ...arc(0, D.y, r0, Math.PI, 2 * Math.PI, 14).map(([z, y]) => [z, y]), [r0, yTop], [0.11, yTop]];
    const path = pts.map(([z, y]) => [x, y, z]);
    return S.tube(path, 0.006, 'safety', { sharp: true, seg: 40, radial: 6 });
  };
  for (const [x, yTop, front] of [[C1x - 0.04, 0.76, false], [0.25, H.top - H.fork - T1 / 2, true], [0.66, 0.8, true]]) {
    (front ? F : P)('31', loop(x, yTop), [0, -0.1, 0]);
    for (const z of [-0.095, 0.095]) (front ? Bf : Br)({ pos: [x, yTop, z], dir: [0, -1, 0], grip: 0.01, d: 0.5, len: 1.0, ref: '94', head: [['104', 'sw']], k: 0.05 });
  }

  // =====================================================================
  // Stabilisateurs arrière (69 : P316 à droite, 70 : P324 à gauche), écrans, vis, raccords
  // =====================================================================
  const extJ = CAR.jack.top - stTop(0);
  let n96 = 0;
  for (const s of [1, -1]) {
    const pz = -s, O = [M.jackX, CAR.jack.top, s * CAR.jack.z];
    P(s > 0 ? '69' : '70', at(api.sub(s > 0 ? 'P316' : 'P324', { ext: extJ, body: s > 0 ? 'jackR' : 'jackL' }), O), [0, 0, s * 0.35]);
    P(s > 0 ? '45' : '60', at(stShield(api, pz), O), [-0.12, 0, s * 0.2]);
    stPlateHoles().forEach(([x, y], i) => {
      const k = i % 7, col = i < 7 ? -1 : 1;
      const extra = col < 0 && SHIELD_HOLES.includes(k) ? SHIELD_T : 0;
      const short = s > 0 && i === 13 && n96++ === 0; // vis 5/8 × 1 (96) au trou du bas, colonne +X
      Br({ pos: [O[0] + x, O[1] + y, O[2] + pz * u(ST.barrel.ro) - pz * u(extra)], dir: [0, 0, -pz], grip: u(ST.plate.t + extra), d: 0.625, len: short ? 1.0 : 1.5, ref: short ? '96' : '97', head: [['108', 'nl']], k: 0.06 });
    });
    for (const { pos, dir } of stPorts(pz)) P('79', put(THREE, jicStraight(S, THREE, 6), [O[0] + pos[0], O[1] + pos[1], O[2] + pos[2]], dir), dir.map((v) => v * 0.08));
  }

  // =====================================================================
  // Tuyauteries d'air (67 / 68), colliers (26, 27), vis (92, 93), plaques (65, 66)
  // =====================================================================
  F('67', api.sub('P312'), [0, 0.2, -0.3]);
  P('68', api.sub('P314'), [0, 0.2, 0.2]);
  const pc = pipeClamp(api);
  const clampAt = (c, ref, front) => {
    const base = [c.pos[0], c.pos[1] - pc.axisY, c.pos[2]];
    const kc = pipeClamp(api);
    (front ? F : P)('26', at(kc.clamp, base), [0, 0.05, 0]);
    (front ? F : P)('27', at(kc.cover, base), [0, 0.09, 0]);
    for (const dz of pc.holes) (front ? Bf : Br)({ pos: [base[0], base[1] + pc.top, base[2] + dz], dir: [0, 1, 0], grip: pc.top, d: 0.4375, len: ref === '92' ? 4.25 : 4.5, ref, k: 0.07 });
  };
  CLAMPS312.forEach((c) => clampAt(c, '92', true));
  CLAMPS314.forEach((c) => clampAt(c, '93', false));
  // 65 — plaque pliée (équerre) sous le premier collier arrière, vissée sur la tôle de bout
  const c65 = CLAMPS314[0].pos, y65 = c65[1] - pc.axisY;
  P('65', group(merged([
    box(0.006, 0.09, 0.12, 'lightGrey', { pos: [-2.722, y65 - 0.045, c65[2]] }),
    box(0.2, 0.006, 0.12, 'lightGrey', { pos: [-2.622, y65 - 0.003, c65[2]] }),
  ], 'lightGrey')), [0.05, -0.05, 0]);
  for (const dz of [-0.04, 0.04]) Br({ pos: [-2.719, y65 - 0.05, c65[2] + dz], dir: [1, 0, 0], grip: 0.006 + T1, d: 0.375, len: 1.0, ref: '86', head: [['109', 'nl']], k: 0.05 });
  // 66 — plaques des colliers sur les traverses des tourillons
  for (const c of CLAMPS314.slice(1)) {
    P('66', box(0.16, 0.006, 0.14, 'lightGrey', { pos: [c.pos[0], 0.813, c.pos[2]] }), [0, 0.05, 0]);
    for (const dx of [-0.065, 0.065]) Br({ pos: [c.pos[0] + dx, 0.816, c.pos[2]], dir: [0, 1, 0], grip: 0.006, d: 0.375, len: 1.0, ref: '86', head: [['109', 'nl']], k: 0.05 });
  }

  // =====================================================================
  // Hydraulique : collecteurs (8), valve d'équilibrage (4), valve du ventilateur (13), console (55), raccords
  // =====================================================================
  const xF = C1x + T1 / 2; // face avant de la traverse C1
  const yM = 0.8;
  for (const s of [-1, 1]) {
    P('8', box(u(2), u(2.5), u(6), 'steel', { pos: [xF + u(1), yM, s * 0.23], r: 0.004 }), [0.12, 0, s * 0.05]);
    for (const dz of [-u(2.2), u(2.2)]) Br({ pos: [xF + u(2), yM, s * 0.23 + dz], dir: [1, 0, 0], grip: u(2), d: 0.25, len: 3.5, ref: '84', head: [['99', 'fw']], k: 0.05 });
  }
  P('4', group(
    box(u(1.5), u(3.5), u(3), 'castAlu', { pos: [xF + u(0.75), yM, 0], r: 0.004 }),
    put(THREE, L(S, [[0, 0], [0.55, 0], [0.55, 0.5], [0.3, 0.6], [0.3, 1.5], [0, 1.5]], 'steel', 14), [xF + u(1.5), yM + u(0.8), 0], [1, 0, 0]),
  ), [0.12, 0, 0]);
  for (const dz of [-u(1.0), u(1.0)]) Br({ pos: [xF + u(1.5), yM - u(1.2), dz], dir: [1, 0, 0], grip: u(1.5), d: 0.375, len: 2.5, ref: '90', head: [['103', 'sw'], ['100', 'fw']].reverse(), k: 0.05 });
  // raccords des collecteurs et de la valve (vue « PRESSURE AND RETURN MANIFOLDS »)
  const xm = xF + u(2);
  const fitAt = (ref, obj, p, d) => P(ref, put(THREE, obj, p, d), d.map((v) => v * 0.07));
  fitAt('78', jicElbow(S, THREE, 16, 12), [xF + u(1), yM, -0.23 - u(3)], [0, 0, -1]);
  fitAt('78', jicElbow(S, THREE, 16, 12), [xF + u(1), yM, 0.23 + u(3)], [0, 0, 1]);
  fitAt('78', jicElbow(S, THREE, 16, 12), [xm, yM + u(0.5), 0.23 + u(1.6)], [1, 0, 0]);
  fitAt('81', jicStraight(S, THREE, 12, 6), [xm, yM + u(0.5), -0.23 - u(1.5)], [1, 0, 0]);
  fitAt('81', jicStraight(S, THREE, 12, 6), [xm, yM + u(0.5), -0.23 + u(1.5)], [1, 0, 0]);
  fitAt('81', jicStraight(S, THREE, 12, 6), [xF + u(0.75), yM + u(1.75), -u(0.8)], [0, 1, 0]);
  fitAt('81', jicStraight(S, THREE, 12, 6), [xF + u(0.75), yM + u(1.75), u(0.8)], [0, 1, 0]);
  fitAt('81', jicStraight(S, THREE, 12, 6), [xm, yM + u(0.5), 0.23 - u(1.5)], [1, 0, 0]);
  for (const dz of [-u(2), 0, u(2)]) fitAt('83', orbPlug(S, THREE, 12), [xF + u(1), yM - u(1.25), -0.23 + dz], [0, -1, 0]);
  fitAt('75', jicElbow(S, THREE, 12), [xm, yM - u(0.6), -0.23 + u(0.6)], [1, 0, 0]);
  fitAt('75', jicElbow(S, THREE, 12), [xF + u(1), yM + u(1.25), 0.23 - u(1.6)], [0, 1, 0]);
  fitAt('76', jicElbow(S, THREE, 12, 6), [xF + u(1), yM, -0.23 + u(3)], [0, 0, 1]);
  for (const s of [-1, 1]) {
    const p = [xF + u(0.75), yM, s * u(1.5)];
    fitAt('76', jicElbow(S, THREE, 12, 6), p, [0, 0, s]);
    P('72', put(THREE, jicTee(S, THREE, 6, { swivel: true }), [p[0] + u(1.1), p[1] + u(0.9), p[2] + s * u(0.55)], [1, 0, 0]), [0.1, 0.03, 0]);
  }
  fitAt('25', group(L(S, [[0.1, -0.35], [0.28, -0.35], [0.28, 0.0], [0.1, 0.0], [0.1, -0.35]], 'brass', 12), L(S, [[0, -0.2], [0.03, -0.2], [0.03, -0.18], [0, -0.18]], 'darkSteel', 8)), [xF + u(0.75), yM - u(1.75), 0], [0, -1, 0]);
  fitAt('74', jicElbow(S, THREE, 16, 16, { angle: Math.PI / 4 }), [xF + u(1), yM + u(1.25), 0.23 + u(1.6)], [0, 1, 0]);
  fitAt('73', jicElbow(S, THREE, 12, 16, { angle: Math.PI / 4 }), [xF + u(1), yM - u(1.25), 0.23 + u(1.6)], [0, -1, 0]);
  fitAt('77', jicElbow(S, THREE, 12, 8), [xm, yM - u(0.6), 0.23 + u(0.2)], [1, 0, 0]);
  fitAt('82', jicStraight(S, THREE, 12, 8), [xF + u(1), yM - u(1.25), 0.23 - u(1.6)], [0, -1, 0]);
  // valve du ventilateur de radiateur (13) sur sa console (55), flanc droit devant la roue arrière
  const xv = -0.8, zp = FZ + 0.0125;
  P('55', group(merged([
    box(0.16, 0.12, 0.008, 'lightGrey', { pos: [xv, 0.78, zp + 0.004] }),
    box(0.16, 0.008, 0.13, 'lightGrey', { pos: [xv, 0.724, zp + 0.065] }),
    slabX([[zp, 0.72], [zp + 0.12, 0.72], [zp, 0.83]], xv - 0.075, 0.006),
    slabX([[zp, 0.72], [zp + 0.12, 0.72], [zp, 0.83]], xv + 0.075, 0.006),
  ], 'lightGrey')), [0, 0, 0.1]);
  for (const dx of [-0.05, 0.05]) Br({ pos: [xv + dx, 0.81, zp + 0.008], dir: [0, 0, 1], grip: 0.008, d: 0.375, len: 2.5, ref: '90', head: [['103', 'sw'], ['100', 'fw']].reverse(), k: 0.05 });
  const vTop = 0.728 + u(4);
  P('13', group(
    box(u(3.5), u(4), u(3), 'castAlu', { pos: [xv, 0.728 + u(2), zp + 0.075], r: 0.004 }),
    put(THREE, L(S, [[0, 0], [0.45, 0], [0.45, 0.4], [0.25, 0.5], [0.25, 1.6], [0, 1.6]], 'steel', 14), [xv, vTop - u(1), zp + 0.075 + u(1.5)], [0, 0, 1]),
  ), [0, 0.05, 0.15]);
  for (const dx of [-u(1.2), u(1.2)]) Br({ pos: [xv + dx, vTop, zp + 0.075], dir: [0, 1, 0], grip: u(4) + 0.008, d: 0.375, len: 5.0, ref: '91', head: [['103', 'sw'], ['100', 'fw']].reverse(), k: 0.05 });
  fitAt('80', jicStraight(S, THREE, 12), [xv - u(1.75), 0.728 + u(1.3), zp + 0.075], [-1, 0, 0]);
  fitAt('80', jicStraight(S, THREE, 12), [xv + u(1.75), 0.728 + u(1.3), zp + 0.075], [1, 0, 0]);
  fitAt('80', jicStraight(S, THREE, 12), [xv + u(1.75), 0.728 + u(3.0), zp + 0.075], [1, 0, 0]);
  fitAt('75', jicElbow(S, THREE, 12), [xv - u(0.8), vTop, zp + 0.075 - u(0.8)], [0, 1, 0]);

  // =====================================================================
  // Garde-boue avant (51 droit, 52 gauche), vis (94, 101), cale de roue (42, 28, 44), barre (54), goupille (15)
  // =====================================================================
  const fender = (s) => group(merged([
    slabY([[1.04, s * (FZ + 0.0125)], [2.26, s * (FZ + 0.0125)], [2.26, s * 1.04], [1.04, s * 1.04]], M.fender - 0.006, M.fender),
    box(1.22, 0.13, 0.006, 'lightGrey', { pos: [1.65, M.fender - 0.065, s * 1.037] }),
    slabX(rect(0.66, 1.04, 0.48, M.fender).map(([z, y]) => [s * z, y]), 1.043, 0.006),
    slabZ(rect(1.04, 2.26, 0.92, M.fender), s * 0.663, 0.006),
    slabX(rect(FZ + 0.0125, 1.04, M.fender - 0.06, M.fender).map(([z, y]) => [s * z, y]), 2.257, 0.006),
    // rebord de fixation sur le flanc, raidisseurs
    slabZ(rect(1.1, 2.15, 0.88, M.fender - 0.004), s * (FZ + 0.0155), 0.006),
    ...[1.35, 1.95].map((x) => box(0.006, 0.05, 0.54, 'lightGrey', { pos: [x, M.fender - 0.03, s * 0.77] })),
  ], 'lightGrey'));
  F('51', fender(1), [0, 0.3, 0.25]);
  F('52', fender(-1), [0, 0.3, -0.25]);
  for (const s of [1, -1]) for (const x of [1.2, 1.5, 1.8, 2.1]) Bf({ pos: [x, 0.95, s * (FZ + 0.0185)], dir: [0, 0, s], grip: 0.006, d: 0.5, len: 1.0, ref: '94', head: [['101', 'fw']], k: 0.05 });
  // 42 — support de cale de roue sur la jupe arrière du garde-boue gauche ; 28 — axe de verrouillage ; 44 — verrou à piston
  const xc = 1.043 - 0.003;
  F('42', group(merged([
    box(0.006, 0.26, 0.24, 'lightGrey', { pos: [xc - 0.003, 0.68, -0.86] }),
    ...[-0.97, -0.75].map((z) => box(0.12, 0.26, 0.006, 'lightGrey', { pos: [xc - 0.063, 0.68, z] })),
    box(0.12, 0.006, 0.226, 'lightGrey', { pos: [xc - 0.063, 0.553, -0.86] }),
  ], 'lightGrey')), [-0.12, 0, 0]);
  for (const z of [-0.93, -0.79]) Bf({ pos: [xc - 0.006, 0.78, z], dir: [-1, 0, 0], grip: 0.012, d: 0.375, len: 1.25, ref: '87', head: [['103', 'sw'], ['100', 'fw']].reverse(), k: 0.05 });
  F('28', group(cyl(u(0.31), 0.25, 'zinc', { axis: 'z', pos: [xc - 0.1, 0.79, -0.86], seg: 14 }), cyl(u(0.5), u(0.25), 'zinc', { axis: 'z', pos: [xc - 0.1, 0.79, -0.73], seg: 14 }),
    S.torus(u(0.6), u(0.08), 'zinc', { axis: 'x', pos: [xc - 0.1, 0.79, -0.71] })), [0, 0, 0.08]);
  F('44', group(
    box(0.05, 0.06, 0.006, 'darkSteel', { pos: [xc - 0.07, 0.62, -0.744] }),
    cyl(u(0.45), 0.05, 'zinc', { axis: 'z', pos: [xc - 0.07, 0.62, -0.72], seg: 14 }),
    cyl(u(0.2), 0.03, 'zinc', { axis: 'z', pos: [xc - 0.07, 0.62, -0.68], seg: 10 }),
    S.torus(u(0.45), u(0.07), 'zinc', { axis: 'y', pos: [xc - 0.07, 0.62, -0.665] }),
  ), [0, 0, 0.08]);
  for (const y of [0.6, 0.64]) Bf({ pos: [xc - 0.07 + 0.017 * (y > 0.62 ? 1 : -1), y, -0.741], dir: [0, 0, 1], grip: 0.012, d: 0.375, len: 1.25, ref: '87', head: [['103', 'sw'], ['100', 'fw']].reverse(), k: 0.05 });
  // 54 — barre tubulaire couchée sur le garde-boue droit, dans deux berceaux ; 15 — goupille à poignée en T et sa chaînette
  const yb = M.fender + u(1.0);
  F('54', group(
    cyl(u(0.75), 0.6, 'safety', { axis: 'x', pos: [1.6, yb, 0.85], seg: 16 }),
    cyl(u(2.0), u(0.375), 'safety', { axis: 'x', pos: [1.3 - u(0.19), yb, 0.85], seg: 24 }),
    merged([1.4, 1.8].map((x) => box(0.04, u(1.0), u(2.2), 'lightGrey', { pos: [x, M.fender + u(0.5), 0.85] })), 'lightGrey'),
  ), [0, 0.12, 0]);
  F('15', group(
    cyl(u(0.25), u(2.6), 'zinc', { pos: [1.8, yb + u(0.1), 0.85], seg: 10 }),
    cyl(u(0.2), u(1.6), 'black', { axis: 'x', pos: [1.8, yb + u(1.45), 0.85], seg: 10 }),
    S.tube([[1.8, yb + u(1.3), 0.85 + u(0.2)], [1.83, yb, 0.95], [1.9, M.fender + 0.004, 0.98]], 0.002, 'zinc', { seg: 16, radial: 4 }),
  ), [0, 0.1, 0]);
  Bf({ pos: [1.9, M.fender, 0.98], dir: [0, 1, 0], grip: 0.006, d: 0.375, len: 2.25, ref: '89', head: [['100', 'fw']], tail: [['114', 'nyloc']], k: 0.05 });

  // =====================================================================
  // Barre de verrouillage de l'articulation (30), broches (41), goupilles (12)
  // =====================================================================
  F('30', group(merged([box(0.75, u(0.75), u(2), 'safety', { pos: [0.595, 0.89 + u(0.375), 0.567], r: 0.004 })], 'safety'),
    merged([0.29, 0.595, 0.9].map((x) => cyl(u(0.66), u(0.76), 'darkSteel', { pos: [x, 0.89 + u(0.375), 0.567], seg: 14 })), 'darkSteel')), [0, 0.12, 0.1]);
  for (const x of [0.29, 0.9]) {
    F('41', group(cyl(u(0.625), u(3), 'zinc', { pos: [x, 0.89 + u(0.75) - u(1.5) + u(0.4), 0.567], seg: 16 }), cyl(u(1.0), u(0.35), 'zinc', { pos: [x, 0.89 + u(0.75) + u(0.175), 0.567], seg: 18 }),
      S.torus(u(0.7), u(0.1), 'zinc', { axis: 'z', pos: [x, 0.89 + u(0.75) + u(0.9), 0.567] })), [0, 0.15, 0]);
    F('12', S.tube([[x - u(0.9), 0.866 - u(0.5), 0.567 + u(0.4)], [x, 0.866 - u(0.5), 0.567 + u(0.3)], [x + u(0.7), 0.866 - u(0.35), 0.567], [x, 0.866 - u(0.15), 0.567 - u(0.3)], [x - u(0.9), 0.866 - u(0.2), 0.567 - u(0.2)]], u(0.07), 'zinc', { seg: 24, radial: 6 }), [0, -0.06, 0.06]);
  }

  // =====================================================================
  // Bavettes (48) et barres (49), plaques (47), consoles (56-59, 62-64), additif (23)
  // =====================================================================
  for (const s of [1, -1]) {
    P('48', box(0.008, 0.36, 0.34, 'rubber', { pos: [-1.0905, 0.47, s * 0.82] }), [-0.06, -0.05, 0]);
    P('49', box(u(0.25), u(1.5), 0.34, 'darkSteel', { pos: [-1.0945 - u(0.125), 0.63, s * 0.82] }), [-0.1, 0, 0]);
    for (const z of [0.68, 0.77, 0.87, 0.96]) {
      Br({ pos: [-1.077, 0.63, s * z], dir: [1, 0, 0], grip: 0.024, d: 0.375, len: 1.75, ref: '88', head: [['100', 'fw']], tail: [['103', 'sw'], ['110', 'nut']], k: 0.05 });
    }
  }
  let nNut = 0, nFlat = 0;
  for (const s of [1, -1]) {
    P('47', box(0.3, u(0.125), 0.24, 'lightGrey', { pos: [-1.63, 1.176 + u(0.0625), s * 0.8] }), [0, 0.08, 0]);
    for (const [dx, dz] of [[-0.13, -0.11], [0.13, -0.11], [-0.13, 0.11], [0.13, 0.11]]) {
      const head = nFlat++ < 4 ? [['103', 'sw'], ['100', 'fw']].reverse() : [['103', 'sw']];
      const tail = nNut++ < 6 ? [['110', 'nut']] : [];
      Br({ pos: [-1.63 + dx, 1.176 + u(0.125), s * 0.8 + dz], dir: [0, 1, 0], grip: u(0.125) + 0.006, d: 0.375, len: 1.0, ref: '86', head, tail, k: 0.05 });
    }
  }
  // consoles : 56 vidanges (flanc gauche), 57 flexibles (flancs convergents avant), 58 flexibles (flancs arrière),
  // 59 collier du tube de radiateur, 62 / 63 colliers de flexibles, 64 flexibles (traverse du tourillon arrière)
  // Console pliée en L : semelle w × h appliquée au point c d'une face (normale dir), largeur selon e1,
  // aile relevée au bord ; n vis 3/8 × 1 (86) et rondelles fendues (103) dans la semelle.
  const bracket = (ref, front, c, w, h, n, dir, e1) => {
    const t = 0.006;
    const N = new THREE.Vector3(...dir), E = new THREE.Vector3(...e1), Up = new THREE.Vector3().crossVectors(E, N);
    const g = group(merged([
      box(w, t, h, 'lightGrey', { pos: [0, t / 2, 0] }),
      box(w, h * 0.7, t, 'lightGrey', { pos: [0, h * 0.35, h / 2 - t / 2] }),
    ], 'lightGrey'), merged(Array.from({ length: 3 }, (_, i) => cyl(u(0.4), 0.002, 'darkSteel', { axis: 'z', pos: [(i - 1) * w * 0.3, h * 0.45, h / 2 + 0.001], seg: 12 })), 'darkSteel'));
    (front ? F : P)(ref, frameAt(THREE, g, c, dir, e1), dir.map((v) => v * 0.08));
    for (let i = 0; i < n; i++) {
      const o = n > 1 ? (i - (n - 1) / 2) * (w * 0.75) / (n - 1) : 0;
      const p = new THREE.Vector3(...c).addScaledVector(E, o).addScaledVector(Up, -h * 0.2).addScaledVector(N, t);
      (front ? Bf : Br)({ pos: p.toArray(), dir, grip: t, d: 0.375, len: 1.0, ref: '86', head: [['103', 'sw']], k: 0.05 });
    }
  };
  bracket('56', false, [-2.55, 0.6, -(FZ + 0.0125)], 0.14, 0.12, 2, [0, 0, -1], [1, 0, 0]);
  for (const s of [1, -1]) {
    // flanc convergent avant : normale extérieure du flanc
    const a = Math.atan2(FZ - 0.0125 - 0.17, 0.5), nrm = [-Math.sin(a), 0, s * Math.cos(a)];
    bracket('57', true, [0.4 + nrm[0] * T1 / 2, 0.7, s * (0.17 + (FZ - 0.0125 - 0.17) * 0.6) + nrm[2] * T1 / 2], 0.12, 0.1, 2, nrm, [Math.cos(a), 0, s * Math.sin(a)]);
  }
  for (const s of [1, -1]) bracket('58', false, [-0.78, 0.75, s * (FZ - 0.0125)], 0.14, 0.1, 2, [0, 0, -s], [1, 0, 0]);
  bracket('59', false, [-2.6, FT, 0.3], 0.12, 0.1, 2, [0, 1, 0], [1, 0, 0]);
  bracket('62', false, [-2.2, FT, -0.3], 0.2, 0.1, 3, [0, 1, 0], [1, 0, 0]);
  bracket('63', false, [-2.2, FT, 0.15], 0.2, 0.1, 3, [0, 1, 0], [1, 0, 0]);
  bracket('64', false, [C3x, 0.81, 0.02], 0.2, 0.1, 3, [0, 1, 0], [1, 0, 0]);
  // 23 — additif d'huile pour ponts et freins (flacon), posé sur la traverse du tourillon avant
  P('23', group(
    S.lathe([[0, 0], [0.038, 0], [0.04, 0.01], [0.04, 0.1], [0.025, 0.125], [0.012, 0.13], [0, 0.13]], 'white', { pos: [C2x, 0.81, -0.38], seg: 20 }),
    S.lathe([[0, 0.13], [0.014, 0.13], [0.014, 0.15], [0, 0.15]], 'red', { pos: [C2x, 0.81, -0.38], seg: 14 }),
    cyl(0.0405, 0.05, 'blue', { pos: [C2x, 0.87, -0.38], seg: 20, open: true }),
  ), [0, 0.15, 0]);

  return { view: { dir: [1.0, 0.6, 1.1] } };
}

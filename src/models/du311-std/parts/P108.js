// P108 — Carrousel Ø 4.0 po × 6 pi × 17 tiges CX037873 rév. 0 (pages 108 à
// 111) : « CAROUSEL ASSY - Ø4.0" X 6' X 17 PIPE ». Râtelier tournant de 17
// tiges Ø 3 1/2 po × 6 pi monté sur le côté de l'avance, avec son bras de tige :
// - cadre (21, P136) : logements bas et haut reliés par trois montants, bridé
//   à l'arrière sur le cadre de montage P098 par 16 vis 3/4 × 3 1/2 (33),
//   rondelles Nord-Lock (37, deux par vis) et écrous (40), sous huit plaques
//   couvre-lumières (15) ;
// - axe central tournant (10, P114) dans deux bagues bronze à collerette
//   (12) ; doublures d'usure des logements haut (22) et bas (23), 40 vis
//   3/8 × 1/2 (27, frein-filet bleu, 40 lbf·po) ;
// - indexage : étoile à 17 encoches (18, « DRIVEN MEMBER ») calée sur les
//   cannelures de l'axe, rondelle de butée (14) dessous ; manivelle à galet
//   et disque de verrouillage (19, « DRIVE MEMBER ») sur l'arbre du moteur
//   hydraulique Ross MG24 (7), roulement 6305 2RS (8) en bas ; moteur fixé sur
//   le couvercle par deux vis 1/2 × 1 1/2 (32) ; plaque d'inspection (20) et
//   joint torique 2-228 (4), quatre vis 3/8 × 1 (29) et Nord-Lock (35) ;
//   joint du couvercle (24) ; évent 1-5 psi 1/8 NPT (6) sur le carter ;
//   graissage : tube de la bague haute (25) et deux tubes sous le logement bas
//   (9) ;
// - bras de tige (11, P116) et deux bras de serrage 16 tiges (13, ensembles
//   sans liste : moyeu double fendu serré sur l'arbre, poutre caisson,
//   fourche ouverte vers +Z où se vissent les mâchoires P088, pouce pivotant
//   et son petit vérin) ;
// - deux guides de bras pivotant (17), cinq vis 1/2 × 1 (31) chacun, et leur
//   vis de butée 1 po × 2 1/2 (34), contre-écrou (41), Nord-Lock (38) (coupe
//   A-A) ; capteur de position (1, P112) du bras pivotant haut sur son
//   support (26), trois vis 3/8 × 1 (29) et Nord-Lock (35) ;
// - deux déflecteurs de tige (2) au bord avant du portillon, vis 1/2 × 3/4
//   (30) ; Nord-Lock 1/2 (36) des vis 30, 31 et 32 ;
// - colliers : dix Ø 1 1/4 (3) sur les montants (flexibles), trois
//   caoutchoutés Ø 1 1/8 (5) pour le câble du capteur, vis 3/8 × 5/8 (28) et
//   rondelles (39) ; collier de boyau Ø 3 1/4 (16) sur le poteau du cadre.
// Repère : repère de l'avance (../feed.js), inséré à l'identité dans P028 :
// axe du carrousel en (FEED.car.x, FEED.car.z), arbre du bras de tige en
// (FEED.clamp.x, FEED.clamp.z), bras de serrage aux hauteurs FEED.clamp.arms,
// mâchoires sur l'axe de forage (x = 0, z = FEED.AX) à la valeur 0 du corps
// « clamp ». Encombrement ≈ 1.0 (X, de 0.0 à 1.0) × 2.48 (Y, de 0.18 à 2.66)
// × 0.85 (Z, de -0.33 à 0.60) m (sans les mâchoires P088).
// Simulation : axe central, étoile et sa rondelle dans le corps « carousel » ;
// bras de serrage dans « clamp » (le reste du bras de tige dans P116).
// Cotes : liste de pièces (vis, roulement 6305, joint 2-228, Ø 4 po × 17) ;
// constantes FEED (axes, alvéoles, bras) ; hauteurs relevées sur l'élévation
// de P108 (≈ 0.8 px/mm) ; indexage d'après l'éclaté de P110.
import { body } from '../layout.js';
import { FEED } from '../feed.js';
import { AXLE114 } from './P114.js';
import {
  u, DEG, C, K, H, RING, SWING, DRIVE, INSPECT, BACK, STINGER,
  arc, circle, rrect, prism, hull2, place, frame, L, hex, bolt, nut, washer, lockWasher, nordLock, boltStack,
  supportClamp, clampHole, flangedBushing, fitElbow, greaseNipple,
} from './_carousel.js';

export default function P108(api) {
  const { THREE, S } = api;
  const { group, merged, at, lathe, weld } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const [cx, cz] = C;
  const W = (p, y) => [p[0] + cx, y, p[1] + cz]; // local carrousel (plan) → repère de l'avance
  const atC = (obj) => { const g = group(obj); g.position.set(cx, 0, cz); return g; };
  const plan = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
  const SU = [Math.cos(SWING.phi), Math.sin(SWING.phi)], SN = [SU[1], -SU[0]];
  const { gate: G, gateHalf: GH } = RING;
  const nl = (d) => u(2 * Math.max(0.05, d * 0.11));

  // ================================================ 21 — cadre, 10 — axe central, 11 — bras de tige
  P('21', at(api.sub('P136'), [cx, 0, cz]), [0.25, 0, -0.35]);
  P('10', body('carousel', at(api.sub('P114'), [cx, 0, cz])), [0, 0, 0.75]);
  P('11', at(api.sub('P116'), [K[0], 0, K[1]]), [-0.45, 0, 0.45]);

  // ================================================ 12 — bagues de l'axe central
  P('12', atC(at(group(flangedBushing(api, u(1.25), u(1.5), u(2.0) + u(0.1875), u(1.875), u(0.1875))), [0, H.topTop + u(0.1875) - u(2.0) - u(0.1875), 0])), [0, 0.3, 0.5]);
  P('12', atC(at(group(flangedBushing(api, u(1.25), u(1.5), u(1.88) + u(0.1875), u(1.875), u(0.1875))), [0, H.baseTop - u(0.25) + 0.003, 0])), [0, -0.3, 0.5]);

  // ================================================ 18 — étoile d'indexage, 14 — rondelle de butée
  const N = 17, c = DRIVE.c, rRoll = u(0.625), slotHW = rRoll + 0.0012, lock = 0.026;
  const starPts = [];
  for (let k = 0; k < N; k++) {
    const as = DRIVE.phi + Math.PI / N + (k * 2 * Math.PI) / N; // encoche
    const bott = c - DRIVE.crank - rRoll;
    const hwO = slotHW / DRIVE.star, hwI = slotHW / bott;
    starPts.push(plan(DRIVE.star, as - hwO), plan(bott + slotHW * 0.3, as - hwI), plan(bott, as - hwI * 0.4), plan(bott, as + hwI * 0.4), plan(bott + slotHW * 0.3, as + hwI), plan(DRIVE.star, as + hwO));
    // dent : sommet creusé par l'arc de verrouillage (centre à c sur la bissectrice)
    const ab = as + Math.PI / N;
    for (let i = 1; i < 12; i++) {
      const t = as + hwO + ((ab - as - hwO) * 2 * i) / 12;
      const dt = t - ab, disc = lock * lock - c * c * Math.sin(dt) ** 2;
      let r = DRIVE.star;
      if (disc >= 0) r = Math.min(r, c * Math.cos(dt) - Math.sqrt(disc));
      starPts.push(plan(r, t));
    }
  }
  const sy0 = AXLE114.splineBot, sy1 = AXLE114.top;
  const light = Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 + 0.2; return [0.092 * Math.cos(a), 0.092 * Math.sin(a), u(0.75)]; });
  P('18', body('carousel', atC(group(merged([
    prism(api, starPts, sy0, sy1, 'steel', [circle(0, 0, u(1.27), 20), ...light]),
    lathe([[u(1.82), sy1 - 0.001], [0.058, sy1 - 0.001], [0.058, sy1 + u(0.25) - 0.001], [0.057, sy1 + u(0.25)], [u(1.82), sy1 + u(0.25)], [u(1.82), sy1 - 0.001]], 'steel', { seg: 40 }),
  ], 'steel')))), [0, 0.42, 0.25]);
  P('14', body('carousel', atC(prism(api, circle(0, 0, u(2.0), 36), sy0 - u(0.375), sy0, 'zinc', [circle(0, 0, u(1.27), 20), rrect(u(1.2), -u(0.2), u(1.55), u(0.2), 0.001, 1)]))), [0, 0.36, 0.25]);

  // ================================================ 19 — manivelle, 8 — roulement, 7 — moteur
  const D = DRIVE.D, dirD = [Math.cos(DRIVE.phi), Math.sin(DRIVE.phi)];
  const pin = [D[0] + dirD[0] * DRIVE.crank, D[1] + dirD[1] * DRIVE.crank]; // galet hors de l'étoile (verrouillé)
  const yb0 = H.topTop - 0.017;
  const lockOl = [...arc(D[0], D[1], 0.024, DRIVE.phi + 0.9, DRIVE.phi + 2 * Math.PI - 0.9, 28), ...arc(pin[0], pin[1], 0.03, DRIVE.phi + Math.PI + 0.75, DRIVE.phi + Math.PI - 0.75, 8)];
  P('19', atC(group(merged([
    lathe([[0, yb0], [0.0125, yb0], [0.0125, sy0 + 0.001], [0, sy0 + 0.001]], 'steel', { seg: 24, pos: [D[0], 0, D[1]] }),
    prism(api, lockOl, sy0 + 0.001, sy1 - 0.001, 'steel'),
    prism(api, hull2(D, 0.03, pin, 0.018, 24), sy1 + 0.0015, sy1 + 0.014, 'steel', [[pin[0], pin[1], u(0.25)]]),
    lathe([[0, sy1 + 0.014], [0.0254, sy1 + 0.014], [0.0254, H.chamberTop - 0.0025], [0, H.chamberTop - 0.0025]], 'steel', { seg: 28, pos: [D[0], 0, D[1]] }),
  ], 'steel'), lathe([[0.0065, sy0 + 0.002], [rRoll, sy0 + 0.002], [rRoll, sy1 - 0.0015], [0.0065, sy1 - 0.0015], [0.0065, sy0 + 0.002]], 'darkSteel', { seg: 24, pos: [pin[0], 0, pin[1]] }))), [0.1, 0.45, 0.1]);
  P('8', atC(S.bearing(0.031, 0.0125, 0.017, 'steel', { pos: [D[0], yb0 + 0.0085, D[1]] })), [0.1, 0.32, 0.1]);

  // moteur Ross MG24 : bride deux trous (grand axe tangent), carter de gérotor, bloc d'orifices, couvercle
  const yc = H.upCoverTop, tD = DRIVE.phi + Math.PI / 2;
  const motorLocal = group(
    merged([
      prism(api, [...arc(-0.046, 0, 0.016, Math.PI / 2, 1.5 * Math.PI, 8), ...arc(0.046, 0, 0.016, -Math.PI / 2, Math.PI / 2, 8)].concat([]), 0, u(0.4), 'black', [[-0.046, 0, u(0.28)], [0.046, 0, u(0.28)]]),
      lathe([[0, 0], [0.04, 0], [0.04, u(0.4)], [0, u(0.4)]], 'black', { seg: 32 }),
      lathe([[0, u(0.4)], [0.0432, u(0.4)], [0.0432, 0.05], [0.0418, 0.051], [0.0418, 0.054], [0.0432, 0.055], [0.0432, 0.083], [0.04, 0.086], [0, 0.086]], 'black', { seg: 36 }),
      S.box(0.04, 0.038, 0.034, 'black', { r: 0.002, pos: [0, 0.03, 0.05] }),
      lathe([[0, -0.01], [u(1.0), -0.01], [u(1.0), 0], [0, 0]], 'black', { seg: 28 }),
    ], 'black'),
    merged([
      ...Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * Math.PI * 2; return at(hex(api, 0.375, 0.2, 0, 'steel'), [0.034 * Math.cos(a), 0.086, 0.034 * Math.sin(a)]); }),
      ...[-0.011, 0.011].map((x) => at(group(hex(api, 0.875, 0.2, 0, 'steel')), [x, 0.03, 0.067], [Math.PI / 2, 0, 0])),
    ], 'steel'),
  );
  P('7', at(motorLocal, W(D, yc), [0, -tD, 0]), [0.1, 0.55, 0.1]);
  for (const s of [-1, 1]) {
    const p = [D[0] + Math.cos(tD) * 0.046 * s, D[1] + Math.sin(tD) * 0.046 * s];
    const st = boltStack(api, W(p, yc + u(0.4)), [0, 1, 0], 0.5, 1.5, { washer: 'nord' });
    P('36', st.washer, [0.1, 0.62, 0.1]); P('32', st.bolt, [0.1, 0.68, 0.1]);
  }

  // ================================================ 20 — plaque d'inspection, 4 — torique, 29 / 35
  const ip = INSPECT.p;
  const handle = S.tube([[-0.022, 0.006, 0], [-0.018, 0.02, 0], [0, 0.024, 0], [0.018, 0.02, 0], [0.022, 0.006, 0]], 0.0028, 'zinc', { seg: 16, radial: 8 });
  P('20', at(group(lathe([[0, 0], [u(1.75), 0], [u(1.75), u(0.25) - 0.001], [u(1.75) - 0.001, u(0.25)], [0, u(0.25)]], 'grey', { seg: 32 }), handle), W(ip, yc + 0.0012)), [0, 0.3, -0.05]);
  P('4', atC(S.torus(u(1.062), u(0.07), 'rubber', { pos: [ip[0], yc + 0.0012, ip[1]] })), [0, 0.22, -0.05]);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const st = boltStack(api, W([ip[0] + u(1.4) * Math.cos(a), ip[1] + u(1.4) * Math.sin(a)], yc + 0.0012 + u(0.25)), [0, 1, 0], 0.375, 1.0, { washer: 'nord' });
    P('35', st.washer, [0, 0.36, -0.05]); P('29', st.bolt, [0, 0.4, -0.05]);
  }

  // ================================================ 24 — joint du couvercle (cordon sur la paroi du carter)
  const sealPath = hull2([0, 0], DRIVE.R1 - DRIVE.wall / 2, D, DRIVE.R2 - DRIVE.wall / 2, 60).map(([x, z]) => [x + cx, H.chamberTop - 0.0008, z + cz]);
  P('24', S.tube(sealPath, 0.0016, 'rubber', { closed: true, seg: 160, radial: 6 }), [0, 0.18, 0]);

  // ================================================ 6 — évent sur la paroi du carter
  const va = 250 * DEG, vp = plan(DRIVE.R1, va);
  P('6', place(api, group(
    L(api, [[0, -0.3], [0.17, -0.3], [0.2, 0], [0, 0]], 'brass', 10),
    hex(api, 0.5, 0.2, 0, 'brass'),
    L(api, [[0, 0.2], [0.12, 0.2], [0.12, 0.3], [0.3, 0.32], [0.3, 0.42], [0.2, 0.5], [0, 0.5]], 'brass', 14),
  ), W(vp, (H.topTop + H.chamberTop) / 2), [Math.cos(va), 0, Math.sin(va)]), [-0.05, 0.1, -0.1]);

  // ================================================ 22, 23 — doublures d'usure, 27 — vis
  const linA0 = G + 16 * DEG, linA1 = G - 16 * DEG + 2 * Math.PI;
  const linerOl = [...arc(0, 0, 0.318, linA0, linA1, 64), ...Array.from({ length: 33 }, (_, i) => { const a = linA1 + ((linA0 - linA1) * i) / 32; return plan(0.215 - 0.03 * (i / 32), a); })];
  const lb = [];
  for (let i = 0; i < 10; i++) {
    const t = (i + 0.5) / 10, a = linA0 + (linA1 - linA0) * t;
    lb.push(plan(0.303, a), plan(0.225 - 0.03 * (1 - t) + 0.005, a + 0.12));
  }
  for (const [ref, y0, up, ex] of [['22', H.topBot - u(0.25), -1, 0.25], ['23', H.baseTop, 1, -0.25]]) {
    P(ref, atC(prism(api, linerOl, y0, y0 + u(0.25), 'white', lb.map(([x, z]) => [x, z, u(0.2)]))), [0.3, ex, 0]);
    for (const p of lb) {
      const face = up > 0 ? y0 + u(0.25) : y0;
      P('27', place(api, bolt(api, 0.375, 0.5), W(p, face), [0, up, 0]), [0.3, ex * 1.4, 0]);
    }
  }

  // ================================================ 2 — déflecteurs de tige, 30 / 36
  const aF = G - GH + 2 * Math.PI; // bord avant du portillon
  for (const [yA, yB, ex] of [[H.baseTop, H.lowRingTop, -1], [H.upRingBot, H.topBot, 1]]) {
    const h = yB - yA - 0.04, ym = (yA + yB) / 2;
    const base = plan(RING.Ro + u(0.1875), aF - 0.12);
    const tang = [-Math.sin(aF - 0.12), Math.cos(aF - 0.12)]; // sens des angles croissants
    const end = plan(RING.Ro + u(0.1875), aF);
    const flareDir = [Math.cos(aF + 0.5) * 0.5 + tang[0] * 0.866, Math.sin(aF + 0.5) * 0.5 + tang[1] * 0.866];
    const segBox = (a, b) => {
      const dx = b[0] - a[0], dz = b[1] - a[1];
      return at(S.box(Math.hypot(dx, dz), h, u(0.375), 'grey', { r: 0.001 }), [(a[0] + b[0]) / 2, ym, (a[1] + b[1]) / 2], [0, -Math.atan2(dz, dx), 0]);
    };
    const tip = [end[0] + flareDir[0] * 0.09, end[1] + flareDir[1] * 0.09];
    P('2', atC(merged([segBox(base, end), segBox(end, tip)], 'grey')), [-0.15, ex * 0.15, 0.1]);
    for (const dy of [-h * 0.3, h * 0.3]) {
      const n = [Math.cos(aF - 0.12), Math.sin(aF - 0.12)];
      const p = [base[0] + n[0] * u(0.1875), base[1] + n[1] * u(0.1875)];
      const st = boltStack(api, W(p, ym + dy), [n[0], 0, n[1]], 0.5, 0.75, { washer: 'nord' });
      P('36', st.washer, [-0.2, ex * 0.15, 0.1]); P('30', st.bolt, [-0.25, ex * 0.15, 0.1]);
    }
  }

  // ================================================ 13 — bras de serrage (sur l'arbre du bras de tige)
  const xj = Math.hypot(K[0], FEED.AX - K[1]); // portée : arbre → axe de forage
  const thArm = Math.atan2(-(FEED.AX - K[1]), -K[0]); // rotation.y amenant +X vers l'axe de forage
  const clampArm = () => {
    const hubR = u(3.25), boreR = u(1.75), pt = u(0.5);
    const g = [], zn = [], blk = [];
    // moyeu double : deux colliers fendus de 1 3/4 po, chapeaux côté -X, une vis 1/2 po par oreille
    for (const s of [-1, 1]) {
      const y0 = s > 0 ? 0.0032 : -0.0508, y1 = s > 0 ? 0.0508 : -0.0032;
      g.push(prism(api, [...arc(0.0003, 0, hubR, -Math.PI / 2, Math.PI / 2, 14), ...arc(0.0003, 0, boreR, Math.PI / 2, -Math.PI / 2, 14)], y0, y1, 'grey'));
      g.push(prism(api, [...arc(-0.0003, 0, hubR, Math.PI / 2, 1.5 * Math.PI, 14), ...arc(-0.0003, 0, boreR, 1.5 * Math.PI, Math.PI / 2, 14)], y0, y1, 'grey'));
      for (const sz of [-1, 1]) {
        const zr = [sz * hubR * 0.9, sz * (hubR + u(1.3))].sort((a, b) => a - b);
        g.push(prism(api, rrect(0.0003, zr[0], u(1.5), zr[1], 0.002, 2), y0, y1, 'grey'));
        g.push(prism(api, rrect(-u(1.0), zr[0], -0.0003, zr[1], 0.002, 2), y0, y1, 'grey'));
        const bz = sz * (hubR + u(0.65));
        zn.push(at(nordLock(api, 0.5), [-u(1.0), (y0 + y1) / 2, bz], [0, 0, Math.PI / 2]));
        zn.push(at(bolt(api, 0.5, 2.5), [-u(1.0) - nl(0.5), (y0 + y1) / 2, bz], [0, 0, Math.PI / 2]));
      }
    }
    // poutre caisson et fourche : deux plats de 1/2 po, flancs de 3/8 po
    const ol = [[0.07, -0.05], [0.33, -0.045], ...arc(xj, 0, 0.115, -130 * DEG, 10 * DEG, 14), ...arc(xj, 0, 0.062, 30 * DEG, -210 * DEG, 24), [0.395, 0.085], [0.36, 0.09], [0.33, 0.06], [0.07, 0.05]];
    const T = [0.375, 0.07]; // axe du pouce
    for (const s of [-1, 1]) g.push(prism(api, ol, s > 0 ? 0.032 : -0.032 - pt, s > 0 ? 0.032 + pt : -0.032, 'grey', [[T[0], T[1], u(0.32)]]));
    for (const sz of [-1, 1]) g.push(at(S.box(0.18, 0.064, u(0.375), 'grey'), [0.165, 0, sz * 0.043], [0, sz * 0.02, 0]));
    // siège de la mâchoire fixe (P088) au fond de la fourche
    g.push(prism(api, [...arc(xj, 0, 0.074, -150 * DEG, -30 * DEG, 14), ...arc(xj, 0, 0.064, -30 * DEG, -150 * DEG, 14)], -0.032, 0.032, 'grey'));
    // pouce pivotant (siège de la mâchoire mobile) et son levier, fermé sur l'ouverture
    const thumb = [...arc(xj, 0, 0.076, 150 * DEG, 32 * DEG, 14), ...arc(xj, 0, 0.065, 32 * DEG, 150 * DEG, 14)];
    const lever = [[T[0] + 0.012, T[1] - 0.012], [T[0] + 0.012, T[1] + 0.012], [T[0] - 0.065, T[1] + 0.006], [T[0] - 0.065, T[1] - 0.008]];
    const th = merged([prism(api, thumb, -0.019, 0.019, 'darkSteel'), prism(api, lever, -0.012, 0.012, 'darkSteel', [[T[0], T[1], u(0.32)]])], 'darkSteel');
    blk.push(lathe([[0, -0.045], [u(0.31), -0.045], [u(0.31), 0.045], [0, 0.045]], 'steel', { seg: 12, pos: [T[0], 0, T[1]] }));
    // petit vérin du pouce (Ø 1 1/2 po) dans la poutre
    const cyl0 = [0.105, -0.004], cyl1 = [T[0] - 0.06, T[1] - 0.001];
    const cd = [cyl1[0] - cyl0[0], cyl1[1] - cyl0[1]], cl = Math.hypot(...cd), ca = -Math.atan2(cd[1], cd[0]);
    const cylG = group(
      at(S.cyl(u(1.0), cl * 0.55, 'black', { axis: 'x', seg: 20 }), [cl * 0.3, 0, 0]),
      at(S.cyl(u(0.3125), cl * 0.45, 'chrome', { axis: 'x', seg: 14 }), [cl * 0.75, 0, 0]),
      at(S.cyl(u(0.55), u(0.75), 'black', { seg: 16 }), [0, 0, 0]),
      at(S.cyl(u(0.45), u(0.75), 'darkSteel', { seg: 16 }), [cl, 0, 0]),
      at(S.cyl(u(0.2), u(0.3), 'steel', { seg: 10 }), [cl * 0.12, u(1.1), 0]),
      at(S.cyl(u(0.2), u(0.3), 'steel', { seg: 10 }), [cl * 0.5, u(1.1), 0]),
    );
    cylG.position.set(cyl0[0], 0, cyl0[1]);
    cylG.rotation.y = ca;
    const welds = [weld([[0.07, 0.032, -0.05], [0.07, 0.032, 0.05]], 0.007, 'grey'), weld([[0.07, -0.032, -0.05], [0.07, -0.032, 0.05]], 0.007, 'grey')];
    return group(merged(g, 'grey'), merged(welds, 'grey'), merged(zn, 'zinc'), th, merged(blk, 'steel'), cylG);
  };
  H.arms.forEach((y, i) => P('13', body('clamp', at(clampArm(), [K[0], y, K[1]], [0, thArm, 0])), [-0.35, i ? 0.12 : -0.12, 0.25]));

  // ================================================ 17 — guides des bras pivotants, 31 / 36, 34 / 38 / 41
  for (const [up, yPlate] of [[1, H.topTop], [-1, H.baseTop - u(0.5)]]) {
    const g0 = up > 0 ? yPlate : yPlate - u(0.5), g1 = g0 + u(0.5);
    const yArm = up > 0 ? H.armUp + u(1.25) : H.armLow + u(1.25);
    // face +n du bras pivotant au rayon 0.32 ; butée perpendiculaire à cette face
    const s = 0.318, Af = [s * SU[0] + u(1.25) * SN[0], s * SU[1] + u(1.25) * SN[1]];
    const lugC = [Af[0] + SN[0] * 0.0297, Af[1] + SN[1] * 0.0297];
    const lugY0 = up > 0 ? g1 : yArm - 0.03, lugY1 = up > 0 ? yArm + 0.026 : g0;
    const lugOl = [[-0.02, -0.0127], [0.02, -0.0127], [0.02, 0.0127], [-0.02, 0.0127]].map(([a, b]) => [lugC[0] + a * SU[0] + b * SN[0], lugC[1] + a * SU[1] + b * SN[1]]);
    P('17', atC(merged([
      prism(api, [...arc(0, 0, 0.35, 80 * DEG, 102 * DEG, 12), ...arc(0, 0, 0.29, 102 * DEG, 80 * DEG, 12)], g0, g1, 'grey', [80.9, 84.4, 87.9, 91.4, 94.9].map((a) => [0.32 * Math.cos(a * DEG), 0.32 * Math.sin(a * DEG), u(0.28)])),
      prism(api, lugOl, lugY0, lugY1, 'grey', []),
    ], 'grey')), [0, up * 0.2, 0.15]);
    for (const a of [80.9, 84.4, 87.9, 91.4, 94.9]) {
      const p = plan(0.32, a * DEG);
      const st = boltStack(api, W(p, up > 0 ? g1 : g0), [0, up, 0], 0.5, 1.0, { washer: 'nord' });
      P('36', st.washer, [0, up * 0.26, 0.15]); P('31', st.bolt, [0, up * 0.3, 0.15]);
    }
    const at3 = (k) => W([Af[0] + SN[0] * k, Af[1] + SN[1] * k], yArm);
    const dn = [SN[0], 0, SN[1]];
    P('38', place(api, nordLock(api, 1.0), at3(0.0424), dn), [0.1, up * 0.2, 0.2]);
    P('41', place(api, nut(api, 1.0, { jam: true }), at3(0.0424 + nl(1.0)), dn), [0.12, up * 0.2, 0.22]);
    P('34', place(api, bolt(api, 1.0, 2.5), at3(0.0635), dn), [0.16, up * 0.2, 0.24]);
  }

  // ================================================ 1 — capteur (P112) et son support (26), 29 / 35
  {
    const s = 0.26, As = [s * SU[0] + u(1.25) * SN[0], s * SU[1] + u(1.25) * SN[1]];
    const face = [As[0] + SN[0] * 0.03, As[1] + SN[1] * 0.03];
    const yS = H.armUp + u(1.25);
    const Ys = [SN[0], 0, SN[1]], Xs = [-SN[1], 0, SN[0]];
    P('1', frame(api, api.sub('P112'), Xs, Ys, W(face, yS)), [0.12, 0.2, 0.1]);
    // support : semelle sur la plaque du cadre haut, âme verticale, collier fendu autour de la douille
    const cc = [face[0] + SN[0] * 0.06, face[1] + SN[1] * 0.06];
    const yP = H.topTop;
    const sole = rrect(-0.035, -0.03, 0.035, 0.03, 0.004, 2).map(([a, b]) => [cc[0] + a * SN[0] - b * SU[0], cc[1] + a * SN[1] - b * SU[1]]);
    const web = rrect(-0.03, -0.004, 0.03, 0.004, 0.001, 1).map(([a, b]) => [cc[0] + a * SN[0] - b * SU[0] + SU[0] * 0.026, cc[1] + a * SN[1] - b * SU[1] + SU[1] * 0.026]);
    const collar = group(lathe([[0.0216, -0.02], [0.028, -0.02], [0.028, 0.02], [0.0216, 0.02], [0.0216, -0.02]], 'grey', { seg: 28 }));
    collar.position.set(cc[0], yS, cc[1]);
    collar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(SN[0], 0, SN[1]));
    const earC = [cc[0] - SU[0] * 0.034, cc[1] - SU[1] * 0.034];
    const ear = at(S.box(0.016, 0.03, 0.03, 'grey'), [earC[0], yS + 0.02, earC[1]], [0, -Math.atan2(SU[1], SU[0]), 0]);
    P('26', atC(group(merged([prism(api, sole, yP, yP + u(0.375), 'grey'), prism(api, web, yP + u(0.375), yS - 0.02, 'grey'), collar, ear], 'grey'))), [0.12, 0.15, 0.1]);
    for (const [p, y, d] of [[[cc[0] + SN[0] * 0.022, cc[1] + SN[1] * 0.022], yP + u(0.375), [0, 1, 0]], [[cc[0] - SN[0] * 0.022, cc[1] - SN[1] * 0.022], yP + u(0.375), [0, 1, 0]], [earC, yS + 0.035, [0, 1, 0]]]) {
      const st = boltStack(api, W(p, y), d, 0.375, 1.0, { washer: 'nord' });
      P('35', st.washer, [0.12, 0.24, 0.1]); P('29', st.bolt, [0.12, 0.28, 0.1]);
    }
  }

  // ================================================ 3, 5 — colliers, 28 / 39
  const ringClamp = (ref, d, p, a, y, ex) => {
    const er = [Math.cos(a), 0, Math.sin(a)], X = [er[2], 0, -er[0]];
    const ch = clampHole(d);
    const org = [p[0] + er[0] * -ch.zFace, y, p[1] + er[2] * -ch.zFace];
    P(ref, atC(frame(api, supportClamp(api, d), X, [0, 1, 0], org)), ex);
    const hp = [org[0] + X[0] * ch.x + er[0] * ch.zIn, y, org[2] + X[2] * ch.x + er[2] * ch.zIn];
    const st = boltStack(api, W([hp[0], hp[2]], y), er, 0.375, 0.625, { washer: 'lock' });
    P('39', st.washer, ex.map((v) => v * 1.3)); P('28', st.bolt, ex.map((v) => v * 1.6));
  };
  for (const ref of ['4', '2']) {
    const a = RING.posts.a[ref], pc = plan(RING.posts.r + RING.posts.w / 2, a);
    for (const y of [0.8, 1.1, 1.4, 1.7, 2.0]) ringClamp('3', 1.25, pc, a, y, [Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12]);
  }
  for (const y of [2.3, 2.235, 2.18]) {
    const a = 80 * DEG;
    ringClamp('5', 1.125, plan(RING.Ro, a), a, y, [0.05, 0, 0.12]);
  }

  // ================================================ 25, 9 — tubes de graissage
  const greaseLine = (pts, nipDir) => {
    const t = S.tube(pts.map(([x, y, z]) => [x + cx, y, z + cz]), u(0.125), 'steel', { seg: 24, radial: 8, sharp: true });
    const p0 = pts[0], p1 = pts[pts.length - 1];
    const el = place(api, fitElbow(api, 4, 4, { npt: true }), [p0[0] + cx, p0[1], p0[2] + cz], [0, Math.sign(nipDir[1]) || 1, 0]);
    const nip = place(api, greaseNipple(api), [p1[0] + cx, p1[1], p1[2] + cz], nipDir);
    const bh = place(api, hex(api, 0.5625, 0.25, 0), [p1[0] + cx - nipDir[0] * 0.006, p1[1], p1[2] + cz - nipDir[2] * 0.006], nipDir);
    return group(t, merged([el, bh], 'zinc'), nip);
  };
  {
    const a = 250 * DEG, e = [Math.cos(a), Math.sin(a)];
    const y = H.topBot - u(0.25) - 0.012;
    P('25', greaseLine([[e[0] * 0.06, y + 0.008, e[1] * 0.06], [e[0] * 0.07, y, e[1] * 0.07], [e[0] * 0.33, y, e[1] * 0.33], [e[0] * 0.345, y, e[1] * 0.345]], [e[0], 0, e[1]]), [-0.05, 0.2, -0.15]);
  }
  for (const a of [300 * DEG, 235 * DEG]) {
    const e = [Math.cos(a), Math.sin(a)], y = H.lowCoverTop - 0.008;
    P('9', greaseLine([[e[0] * 0.165, H.lowCoverBot - 0.004, e[1] * 0.165], [e[0] * 0.185, y, e[1] * 0.185], [e[0] * 0.33, y, e[1] * 0.33], [e[0] * 0.345, y, e[1] * 0.345]], [e[0], 0, e[1]]), [0, -0.2, -0.15]);
  }

  // ================================================ 15 — couvre-lumières, 33 / 37 / 40 — fixation sur P098
  const earT = u(0.75); // oreille du cadre de montage P098 (hors lot) derrière la bride
  for (const [y0, y1] of [[H.baseTop - u(0.5), H.lowRingTop], [H.upRingBot, H.topTop]]) {
    const ym = (y0 + y1) / 2;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      const x = sx * 0.21;
      P('15', atC(S.box(0.032, 0.078, u(0.1875), 'zinc', { r: 0.002, pos: [x, ym + sy * 0.061, BACK.z1 + u(0.1875) / 2] })), [0, 0, 0.12]);
      for (const k of [0, 1]) {
        const y = ym + sy * (0.04 + k * 0.042);
        const zf = BACK.z1 + u(0.1875);
        P('37', atC(place(api, nordLock(api, 0.75), [x, y, zf], [0, 0, 1])), [0, 0, 0.16]);
        P('33', atC(place(api, bolt(api, 0.75, 3.5), [x, y, zf + nl(0.75)], [0, 0, 1])), [0, 0, 0.22]);
        const zb = BACK.z0 - earT;
        P('37', atC(place(api, nordLock(api, 0.75), [x, y, zb], [0, 0, -1])), [0, 0, -0.12]);
        P('40', atC(place(api, nut(api, 0.75), [x, y, zb - nl(0.75)], [0, 0, -1])), [0, 0, -0.18]);
      }
    }
  }

  // ================================================ 16 — collier de boyau Ø 3 1/4 po sur le poteau
  {
    const hp = plan(0.43, 250 * DEG), yH = (H.lowRingTop + H.upRingBot) / 2;
    const rH = u(1.625), t = u(0.25), zc = hp[1] - u(0.25) - u(1.0) - rH;
    const halves = [0, Math.PI].map((a0) => S.slotted(rH + t, rH, -u(0.75), u(0.75), [{ a: a0 + Math.PI / 2, w: 0.12, y0: -u(1), y1: u(1) }], 'zinc', { seg: 28 }));
    const ears = [-1, 1].flatMap((s) => [S.box(u(0.8), u(1.5), u(0.25), 'zinc', { pos: [s * (rH + u(0.55)), 0, u(0.14)] }), S.box(u(0.8), u(1.5), u(0.25), 'zinc', { pos: [s * (rH + u(0.55)), 0, -u(0.14)] })]);
    const baseB = S.box(u(2.2), u(1.5), u(1.0), 'zinc', { pos: [0, 0, rH + u(0.5)] });
    const hw = [-1, 1].map((s) => at(group(bolt(api, 0.3125, 0.875, 'zinc')), [s * (rH + u(0.55)), 0, u(0.27)], [Math.PI / 2, 0, 0]));
    const nuts = [-1, 1].map((s) => at(group(nut(api, 0.3125)), [s * (rH + u(0.55)), 0, -u(0.27)], [-Math.PI / 2, 0, 0]));
    P('16', atC(at(group(merged([...halves, ...ears, baseB], 'zinc'), merged([...hw, ...nuts], 'zinc')), [hp[0], yH, zc])), [0, 0, -0.2]);
  }

  void washer; void lockWasher; void STINGER;
  return { view: { dir: [1, 0.6, 1.1] } };
}

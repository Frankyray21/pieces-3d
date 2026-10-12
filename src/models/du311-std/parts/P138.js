// P138 — Boyau d'air DTH 1 1/2 po, avance 6 pi : CX038113 rév. 0 (page 138) :
// « OPTION, DTH 1.5" AIR HOSE ASSY - 6FT », repère 23 de l'avance P028.
// Flexible 1 1/2 po × 82 po (3, embouts sertis JIC-24 à écrou tournant) de
// l'émerillon d'air de la tête (P050, orifice latéral +X) au collecteur de la
// boucle (P106) : en haut, réduction six pans longue 2 × 1 1/2 NPT (5) dans
// l'orifice et émerillon tournant 90° 1 1/2 NPT / JIC-24 (4), sortie vers le
// haut ; en bas, adaptateur droit 2 NPT / JIC-24 (6) dans le coude 2 po de
// P106. Le boyau monte au-dessus de la tête, passe devant la boucle de boyaux
// et redescend côté −X, en dehors du passage du support haut de la boucle.
// À chaque bout, collier (2) sur le boyau et bride de sécurité (1, « PROTECTIVE
// STRUCTURE ») ceinturant le raccord, assemblés par une vis 1/2 po (7 en haut,
// entièrement filetée, 8 en bas), deux rondelles Nord-Lock (9) et un écrou (10).
// Simulation : boyau en flexible (points sur la tête « feed », mélanges
// ['ext', 'feed', w] le long de la boucle, bas sur l'avance) ; raccords,
// collier et bride du haut suivent la tête ; ceux du bas restent fixes.
// Repère : celui de l'avance (FEED, placé à l'identité dans P028), tête en
// haut : orifice de l'émerillon de tête en (0.0375, 3.152, 0.505), sortie du
// coude de P106 en (−0.50, 2.02, 0.17). Encombrement ≈ 0.85 × 1.6 × 0.45 m.
// Cotes : diamètres et filetages (liste), JIC-24 = 1 7/8-12 ; longueur du
// boyau tenue à ±15 % (tracé lissé).
import { body, flex } from '../layout.js';
import { FEED } from '../feed.js';
import { IN, u, AIR, place, hhcs, hexNut, nordLock, M } from './_feed.js';

const PORT = [0.0375, FEED.tdY + 0.452, FEED.AX]; // orifice 2 NPT de l'émerillon de tête (face +X)
const RH = u(2.25) / 2; // boyau (Ø ext.)
const J24 = u(1.875) / 2, NUT24 = u(2.375);

export default function P138(api) {
  const { S, THREE } = api;
  const { lathe, thread, nut, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (o) => body('feed', o);
  const V = (...a) => new THREE.Vector3(...a);
  const male = (r, y0, y1, k = 8) => thread(r, y0, y1, { pitch: 0.0022, maxTurns: k, chamferBottom: false });
  const jic24 = (y0) => [[J24 * 0.9, y0], [J24 * 0.9, y0 + 0.006], ...male(J24, y0 + 0.008, y0 + 0.03, 5), [J24 * 0.8, y0 + 0.034], [J24 * 0.6, y0 + 0.042], [0, y0 + 0.042]];

  // ============================================================ 5 — réduction longue 2 × 1 1/2 NPT (selon +X)
  const r2 = u(2.375) / 2;
  const red = group(M([
    lathe([[r2 * 0.75, -0.022], [r2 * 0.94, -0.022], ...male(r2 * 0.97, -0.022, -0.002).reverse().reverse(), [r2, 0], [r2 * 0.75, 0]], 'steel', { seg: 28 }),
    nut(u(2.75), 0.02, 'steel', { pos: [0, 0.01, 0] }),
    lathe([[u(1.9) / 2, 0.02], [r2 * 0.92, 0.02], [r2 * 0.92, 0.052], [r2 * 0.88, 0.055], [u(1.9) / 2, 0.055], [u(1.9) / 2, 0.02]], 'steel', { seg: 28 }),
  ], 'steel'));
  P('5', F(place(red, PORT, [1, 0, 0])), [0.12, 0, 0]);

  // ============================================================ 4 — émerillon tournant 90°, sortie JIC-24 vers +Y
  const x4 = PORT[0] + 0.055;
  const sw = group(
    M([
      lathe([[0, -0.02], [u(1.9) / 2 * 0.95, -0.02], ...male(u(1.9) / 2, -0.02, 0, 6), [0, 0.0001]], 'steel', { seg: 24 }),
      nut(u(2.25), 0.016, 'steel', { pos: [0, 0.008, 0] }),
    ], 'steel'),
    M([
      lathe([[0, 0.016], [0.033, 0.016], [0.035, 0.018], [0.035, 0.055], [0.033, 0.057], [0, 0.057]], 'castIron', { seg: 28 }),
      S.ball(0.031, 'castIron', { pos: [0, 0.072, 0] }),
      S.cyl(0.031, 0.03, 'castIron', { seg: 28, pos: [0, 0.062, 0] }),
      S.cyl(0.028, 0.04, 'castIron', { axis: 'x', seg: 28, pos: [0.02, 0.072, 0] }),
    ], 'castIron'),
    S.torus(0.035, 0.0015, 'darkSteel', { pos: [0, 0.036, 0] }),
  );
  const swg = place(sw, [x4, PORT[1], PORT[2]], [1, 0, 0], [0, 1, 0]);
  // (le bras local +X du coude pointe vers +Y du repère de l'avance)
  const elbowC = V(x4 + 0.072, PORT[1], PORT[2]);
  const out = elbowC.clone().add(V(0, 0.04, 0));
  const jicUp = place(lathe([[0, 0], [J24 * 0.95, 0], ...jic24(0.004).slice(0)], 'steel', { seg: 24 }), out.toArray(), [0, 1, 0]);
  P('4', F(group(swg, M([jicUp], 'steel'))), [0.15, 0.1, 0]);
  const seatTop = out.clone().add(V(0, 0.046, 0));

  // ============================================================ 6 — adaptateur 2 NPT / JIC-24 (dans le coude de P106)
  const base6 = V(AIR.x, AIR.yOut, AIR.z);
  const ad6 = group(M([
    lathe([[r2 * 0.6, -0.026], [r2 * 0.92, -0.026], ...thread(r2 * 0.95, -0.026, -0.002, { r1: r2, pitch: 0.0022, maxTurns: 8 }), [r2, 0], [r2 * 0.6, 0]], 'steel', { seg: 28 }),
    nut(u(2.75), 0.022, 'steel', { pos: [0, 0.011, 0] }),
    lathe([[0, 0.022], [J24 * 0.95, 0.022], ...jic24(0.026)], 'steel', { seg: 24 }),
  ], 'steel'));
  P('6', place(ad6, base6.toArray(), [0, 1, 0]), [0, 0.1, 0]);
  const seatBot = base6.clone().add(V(0, 0.068, 0));

  // ============================================================ 3 — boyau 1 1/2 × 82 po
  const end = () => {
    const nh = 0.034, L = 0.095;
    const prof = [[0, nh * 0.8], [RH * 0.8, nh * 0.8], [RH * 0.8, nh + 0.004], [RH * 1.1, nh + 0.007]];
    for (const t of [0.3, 0.55, 0.8]) { const y = nh + 0.007 + L * t; prof.push([RH * 1.1, y - 0.006], [RH * 1.03, y - 0.003], [RH * 1.03, y + 0.003], [RH * 1.1, y + 0.006]); }
    prof.push([RH * 1.1, nh + 0.007 + L], [RH * 1.0, nh + 0.012 + L], [0, nh + 0.012 + L]);
    return group(M([nut(NUT24, nh, 'zinc', { pos: [0, nh / 2, 0] }), lathe(prof, 'zinc', { seg: 28 })], 'zinc'));
  };
  const LE = 0.034 + 0.012 + 0.095;
  const pTop = seatTop.clone().add(V(0, LE, 0)), pBot = seatBot.clone().add(V(0, LE, 0));
  const pts = [
    pTop.toArray(), [pTop.x - 0.01, pTop.y + 0.08, pTop.z - 0.005], [0.0, pTop.y + 0.2, 0.48], [-0.35, pTop.y + 0.21, 0.47], [-0.62, pTop.y + 0.06, 0.40],
    [-0.66, 3.05, 0.25], [-0.66, 2.6, 0.18], [-0.6, pBot.y + 0.13, AIR.z], [-0.515, pBot.y + 0.05, AIR.z], pBot.toArray(),
  ];
  const bods = ['feed', 'feed', ['ext', 'feed', 0.85], ['ext', 'feed', 0.6], ['ext', 'feed', 0.45], ['ext', 'feed', 0.3], ['ext', 'feed', 0.1], 'ext', 'ext', 'ext'];
  const hoseM = flex(S, pts, bods, RH, 'hose', { seg: 140, radial: 14, ends: 'none' });
  hoseM.geometry.userData.edgeAngle = 70;
  P('3', group(hoseM, F(place(end(), seatTop.toArray(), [0, 1, 0])), place(end(), seatBot.toArray(), [0, 1, 0])), [-0.2, 0.15, 0.1]);

  // ============================================================ 2 / 1 / 7 / 8 / 9 / 10 — colliers et brides de sécurité
  const nl = 2 * Math.max(0.0008, 0.5 * IN * 0.09) * 1.1;
  const clampAt = (c, tabDir, low) => {
    const T = V(...tabDir);
    const ring = S.ring(RH + 0.0018, RH + 0.0003, 0.02, 'zinc', { seg: 32, pos: c.toArray() });
    const ears = [-1, 1].map((k) => { const b = S.box(0.004, 0.02, 0.022, 'zinc'); const g = place(b, c.clone().addScaledVector(T, RH + 0.012).add(V(0, 0, 0)).toArray(), [0, 1, 0], T.toArray()); g.translateZ(k * 0.003); return g; });
    return group(M([ring, ...ears], 'zinc'));
  };
  // haut : collier au-dessus de l'embout, bride jusqu'au corps de l'émerillon 4
  const cTop = pTop.clone().add(V(0, 0.02, 0));
  const tabTop = V(0, 0, -1);
  P('2', F(clampAt(cTop, tabTop.toArray(), false)), [0.1, 0.15, -0.1]);
  const tA = cTop.clone().addScaledVector(tabTop, RH + 0.022), tB = V(x4 + 0.035, PORT[1], PORT[2] - 0.04);
  const strap = (a, b, ringC, ringR, axis) => {
    const d = b.clone().sub(a);
    const s = S.box(0.025, d.length() + 0.02, u(0.125), 'zinc', { r: 0.002 });
    const g = group(s); g.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); g.position.copy(a).add(b).multiplyScalar(0.5);
    return group(M([g, S.ring(ringR + 0.0032, ringR, 0.025, 'zinc', { seg: 28, axis, pos: ringC.toArray() })], 'zinc'));
  };
  P('1', F(strap(tA, tB, V(x4 + 0.035, PORT[1], PORT[2]), 0.036, 'x')), [0.1, 0.1, -0.15]);
  P('9', F(nordLock(0.5 * IN, [tA.x + 0.006 + nl / 2, tA.y, tA.z], [1, 0, 0])), [0.15, 0.15, -0.15]);
  P('7', F(hhcs(0.5 * IN, u(1.25), [tA.x + 0.006 + nl, tA.y, tA.z], [1, 0, 0])), [0.22, 0.15, -0.15]);
  P('9', F(nordLock(0.5 * IN, [tA.x - 0.008 - nl / 2, tA.y, tA.z], [-1, 0, 0])), [0.05, 0.15, -0.15]);
  P('10', F(hexNut(0.5 * IN, [tA.x - 0.008 - nl - 0.0056, tA.y, tA.z], [-1, 0, 0])), [0.0, 0.15, -0.15]);
  // bas : collier au-dessus de l'embout, bride jusqu'au six pans de l'adaptateur 6
  const cBot = pBot.clone().add(V(0, 0.02, 0));
  const tabBot = V(-1, 0, 0);
  P('2', clampAt(cBot, tabBot.toArray(), true), [-0.1, 0.1, 0]);
  const bA = cBot.clone().addScaledVector(tabBot, RH + 0.022), bB = base6.clone().add(V(-0.04, 0.011, 0));
  P('1', strap(bA, bB, base6.clone().add(V(0, 0.011, 0)), u(2.75) / Math.sqrt(3) + 0.001, 'y'), [-0.15, 0.05, 0]);
  P('9', nordLock(0.5 * IN, [bA.x, bA.y, bA.z + 0.006 + nl / 2], [0, 0, 1]), [-0.12, 0.1, 0.05]);
  P('8', hhcs(0.5 * IN, u(1.5), [bA.x, bA.y, bA.z + 0.006 + nl], [0, 0, 1]), [-0.12, 0.1, 0.12]);
  P('9', nordLock(0.5 * IN, [bA.x, bA.y, bA.z - 0.008 - nl / 2], [0, 0, -1]), [-0.12, 0.1, -0.05]);
  P('10', hexNut(0.5 * IN, [bA.x, bA.y, bA.z - 0.008 - nl - 0.0056], [0, 0, -1]), [-0.12, 0.1, -0.1]);
  return { view: { dir: [-0.8, 0.5, 1] } };
}

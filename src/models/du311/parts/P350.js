// P350 — Ensemble de filtration hydraulique haute pression CX030846 rév. 2
// (page 350), repère 27 du porteur P328. Support mécano-soudé (4, CX027443) :
// poteau en tube carré 2 po sur semelle boulonnée au pont, bras horizontal
// en tube carré 2 po, deux goussets verticaux qui portent chacun un filtre
// haute pression (2, P352) par ses deux bossages latéraux (vis H 7/16-14 ×
// 1 1/4 po, 18, et rondelles fendues, 25), fer plat vertical au bout du bras
// (patte basse percée) avec un tube carré 1 1/2 po qui porte la pompe de
// remplissage (3, P354) ; collier à deux demi-coquilles sur le bras (tube
// rond, Ø 1 3/4 po), serré par deux vis H 1/2-13 × 3 1/2 po (19) et rondelles
// fendues (26) — coquilles dessinées avec le support, faute de repère.
// Raccords des filtres (orifices -20 tournés vers l'avant +Z et l'arrière −Z) :
// coudes -20 / -16 (12) à l'avant des deux filtres et à l'arrière du filtre A,
// coude -20 / -12 (11) à l'arrière du filtre B, tés tournants -16 (6) sous
// les coudes avant, coude tournant -16 (5) sous le té du filtre B. Pompe :
// mamelon NPT 1/2 - JIC -08 (8) et coude 45° NPT - JIC -08 (7) sur ses deux
// bossages, deux bouchons NPT 1/2 affleurants (13) sous le corps ; tôle 3 de
// P354 fixée au tube porteur par une vis H 3/8 × 1 1/4 (16) dans sa
// boutonnière, l'équerre du boîtier de commande par la seconde ; vis H
// 5/16-18 × 3 po (15) au travers du tube porteur, rondelles plates (20),
// fendues (23), écrous (27) ; quatre vis H 1/4-20 × 5/8 po (14) et rondelles
// fendues (22) tiennent le boîtier de bouton-poussoir sur son équerre.
// Vanne d'arrêt de translation (1, électrovanne) boulonnée sur le fer plat
// par deux vis H 3/8-16 × 2 1/4 po (17), rondelles plates (21), fendues (24) et
// écrous (28), coude 45° -12 (9) dessous et coude 90° -12 (10) sur le flanc.
// Repère : origine au centre du dessous de la semelle du poteau (appui sur le
// pont), Y vers le haut, +X le long du bras (du poteau vers la pompe), +Z vers
// l'avant (orifices d'entrée des filtres). Encombrement ≈ 0.82 (X) × 0.78 (Y) × 0.35 (Z)
// m. Cotes estimées d'après les proportions des
// deux vues de la page (filtres de P352 pour l'échelle).
import { RAC_IN as IN, racFactory, racBlock, racPose, racPort, racOut } from './_porteur.js';

const TUBE = 2 * IN; // tube carré du poteau et du bras
const Y_ARM = 0.675; // axe du bras
const XG = [0.2, 0.38]; // face −X des goussets (= face d'appui des bossages des filtres)
const YF = 0.55; // axe des bossages des filtres
const XB = 0.5; // face −X du fer plat d'extrémité
const PUMP = [0.53, 0.42, 0.1]; // origine de P354 (bride de la pompe)
const YT = 0.3; // axe du tube porteur de la pompe

export default function P350(api) {
  const { S, THREE } = api;
  const { box, at, group, merged, lathe } = S;
  const F = racFactory(S, { light: true });
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const V = (a) => new THREE.Vector3(...a);
  const add = (a, b) => a.map((v, i) => v + b[i]);
  // Point / direction d'un sous-ensemble posé, dans le repère de P350.
  const toW = (o, p) => { o.updateMatrix(); return V(p).applyMatrix4(o.matrix).toArray(); };
  const dirW = (o, d) => V(d).applyQuaternion(o.quaternion).toArray();
  // Vis (tête vers dir) avec rondelles empilées sous la tête : [[ref, split]].
  const screw = (ref, d, len, pos, dir, washers, k) => {
    let y = 0;
    for (const [wr, split] of washers) {
      P(wr, racPose(THREE, group(F.washer(d, { split })), add(pos, racOut(dir, y)), dir), racOut(dir, k * 0.7));
      y += split ? d * 0.25 : d * 0.16;
    }
    P(ref, racPose(THREE, group(F.bolt(d, len)), add(pos, racOut(dir, y)), dir), racOut(dir, k));
  };

  // ---------------------------------------------------------------- 4 — support
  // Tôles à arêtes vives (boîtes simples), tubes à arêtes arrondies.
  const flat = (w, h, d, pos) => at(new THREE.Mesh(new THREE.BoxGeometry(w, h, d)), pos);
  const mount = [
    flat(0.16, 0.0127, 0.12, [0, 0.00635, 0]),
    box(TUBE, Y_ARM - 0.0127, TUBE, 'lightGrey', { pos: [0, (Y_ARM + 0.0127) / 2, 0] }),
    box(XB + 0.0095 + TUBE / 2, TUBE, TUBE, 'lightGrey', { pos: [(XB + 0.0095 - TUBE / 2) / 2, Y_ARM, 0] }),
    ...XG.map((x) => flat(0.0095, 0.15, 0.09, [x + 0.00475, 0.575, 0])),
    flat(0.0095, 0.6, 0.0762, [XB + 0.00475, 0.4, 0]),
    box(1.5 * IN, 1.5 * IN, 0.17, 'lightGrey', { pos: [PUMP[0] - 0.019, YT, 0.07] }),
  ];
  const clampX = 0.29;
  const holes = [
    ...[-0.055, 0.055].map((x) => lathe([[0.0075, 0.0003], [0, 0.0003]], 'blackOxide', { seg: 8, pos: [x, 0.0127, 0] })),
    lathe([[0.009, 0.0003], [0, 0.0003]], 'blackOxide', { axis: 'x', seg: 8, pos: [XB + 0.0095, 0.14, 0] }),
    ...[-1, 1].map((s) => lathe([[0.0222, 0.0003], [0, 0.0003]], 'blackOxide', { axis: s > 0 ? 'z' : '-z', seg: 12, pos: [clampX, Y_ARM + TUBE / 2 + 0.035, s * 0.025] })),
  ];
  // Collier à deux demi-coquilles (polyamide noir) sur le dessus du bras.
  const clamp = [
    box(0.09, 0.034, 0.05, 'black', { pos: [clampX, Y_ARM + TUBE / 2 + 0.017, 0] }),
    box(0.09, 0.034, 0.05, 'black', { pos: [clampX, Y_ARM + TUBE / 2 + 0.053, 0] }),
  ];
  P('4', group(merged(mount, 'lightGrey'), merged(clamp, 'black'), merged(holes, 'blackOxide')), [0, 0, 0]);

  // 19 — vis H 1/2 × 3 1/2 po du collier, 26 — rondelles fendues.
  for (const dx of [-0.034, 0.034]) screw('19', 0.5 * IN, 3.5 * IN, [clampX + dx, Y_ARM + TUBE / 2 + 0.07, 0], [0, 1, 0], [['26', true]], 0.14);

  // ---------------------------------------------------------------- 2 — filtres
  // P352 tourné de −90° autour de Y : ses bossages (−Z local) regardent +X,
  // ses orifices ±X local deviennent l'avant (+Z) et l'arrière (−Z).
  const filters = XG.map((x) => {
    const f = at(api.sub('P352'), [x, YF, 0], [0, -Math.PI / 2, 0]);
    P('2', f, [0, 0, 0.16]);
    return f;
  });
  const HP = [0.055, 0.0075, 0.063]; // orifice +X de la tête de P352
  const portOf = (f, s) => ({ p: toW(f, [s * HP[0], HP[1], HP[2]]), d: dirW(f, [s, 0, 0]) });
  // 18 — vis H 7/16 × 1 1/4 po dans les bossages, au travers des goussets ; 25 — rondelles fendues.
  for (const x of XG) for (const z of [-0.03, 0.03]) screw('18', (7 / 16) * IN, 1.25 * IN, [x + 0.0095, YF, z], [1, 0, 0], [['25', true]], 0.08);

  // Raccords des filtres.
  const front = [], back = [];
  filters.forEach((f, i) => {
    const pf = portOf(f, 1), pb = portOf(f, -1);
    const ef = racPose(THREE, F.elbow({ pd: 20, jd: 16 }), pf.p, pf.d, [0, -1, 0]);
    P('12', ef, [0, 0, 0.27]);
    front.push(ef);
    const eb = racPose(THREE, F.elbow({ pd: 20, jd: i ? 12 : 16 }), pb.p, pb.d, [0, -1, 0]);
    P(i ? '11' : '12', eb, [0, 0, -0.08]);
    back.push(eb);
  });
  // 6 — tés tournants -16 sous les coudes avant (branche vers l'avant).
  const tees = front.map((e) => {
    const q = racPort(THREE, e);
    const t = racPose(THREE, F.swivel({ kind: 'tee', fd: 16 }), q.p, q.d, [0, 0, 1]);
    P('6', t, [0, -0.06, 0.27]);
    return t;
  });
  // 5 — coude tournant -16 sous le té du filtre B (sortie vers +X).
  {
    const q = racPort(THREE, tees[1], 0);
    P('5', racPose(THREE, F.swivel({ kind: 'elbow', fd: 16 }), q.p, q.d, [1, 0, 0]), [0, -0.12, 0.27]);
  }

  // ---------------------------------------------------------------- 3 — pompe de remplissage
  // P354 tourné de +90° autour de Y : moteur vers +X, bossages vers ±Z.
  const pump = at(api.sub('P354'), PUMP, [0, Math.PI / 2, 0]);
  const PE = [0.15, 0, 0];
  P('3', pump, PE);
  const lug = (s) => ({ p: toW(pump, [s * 0.06, -0.052, -0.06]), d: dirW(pump, [s, 0, 0]) });
  // 8 — mamelon NPT 1/2 / JIC -08 sur le bossage côté +Z ; 7 — coude 45° sur l'autre.
  {
    const a = lug(-1), b = lug(1);
    P('8', racPose(THREE, F.straight({ port: 'npt', pd: 8, jd: 8 }), a.p, a.d), add(PE, racOut(a.d, 0.05)));
    P('7', racPose(THREE, F.elbow({ port: 'npt', pd: 8, jd: 8, angle: 45 }), b.p, b.d, [0, -1, 0]), add(PE, racOut(b.d, 0.05)));
  }
  // 13 — bouchons NPT 1/2 affleurants sous le corps de pompe.
  for (const x of [-0.02, 0.02]) {
    const p = toW(pump, [x, -0.064, -0.045]), d = dirW(pump, [0, -1, 0]);
    P('13', racPose(THREE, F.nptPlugFlush(8), p, d), add(PE, racOut(d, 0.04)));
  }
  // 16 — vis H 3/8 × 1 1/4 po : patte de la tôle 3 (boutonnière) sur le tube
  // porteur, et équerre du boîtier ; 21 — rondelles plates, 24 — fendues.
  const d38 = 0.375 * IN;
  screw('16', d38, 1.25 * IN, toW(pump, [0, -0.115, 0.25 * IN]), dirW(pump, [0, 0, 1]), [['21', false], ['24', true]], 0.08);
  screw('16', d38, 1.25 * IN, toW(pump, [-0.0632, 0.025, -0.02]), dirW(pump, [-1, 0, 0]), [['21', false], ['24', true]], 0.08);
  // 14 — vis H 1/4 × 5/8 po du boîtier de bouton-poussoir, 22 — rondelles fendues.
  for (const dx of [-0.028, 0.028]) for (const dy of [-0.028, 0.028]) {
    screw('14', 0.25 * IN, 0.625 * IN, toW(pump, [-0.1 + dx, 0.01 + dy, -0.0384]), dirW(pump, [0, 0, 1]), [['22', true]], 0.05);
  }
  // 15 — vis H 5/16 × 3 po verticales au travers du tube porteur : rondelle
  // plate (20) sous la tête ; dessous, rondelle plate (20), fendue (23), écrou (27).
  const d516 = 0.3125 * IN, tb = 1.5 * IN;
  for (const z of [0.0, 0.14]) {
    const x = PUMP[0] - 0.019;
    screw('15', d516, 3 * IN, [x, YT + tb / 2, z], [0, 1, 0], [['20', false]], 0.1);
    const y0 = YT - tb / 2;
    P('20', at(group(F.washer(d516)), [x, y0, z], [Math.PI, 0, 0]), [0, -0.05, 0]);
    P('23', at(group(F.washer(d516, { split: true })), [x, y0 - d516 * 0.16, z], [Math.PI, 0, 0]), [0, -0.07, 0]);
    P('27', at(group(F.nut(d516)), [x, y0 - d516 * 0.41, z], [Math.PI, 0, 0]), [0, -0.09, 0]);
  }

  // ---------------------------------------------------------------- 1 — vanne d'arrêt de translation
  // Électrovanne : corps 40 × 60 × 60 mm contre le fer plat (face +X), bobine
  // noire et connecteur sur le flanc +Z, orifices -12 dessous et sur le flanc −Z.
  const VX = XB + 0.0095, VY = 0.19, BW = 0.04, BH = 0.06, BD = 0.06;
  const r12 = (1.0625 * IN) / 2;
  const vb = racBlock(S, THREE, BW, BH, BD, [
    { p: [0, -BH / 2, 0], n: '-y', r: r12, spot: r12 + 0.004 },
    { p: [0, 0.008, -BD / 2], n: '-z', r: r12, spot: r12 + 0.004 },
    ...[-0.015, 0.015].map((y) => ({ p: [BW / 2, y, 0.012], n: '+x', r: 0.005 })),
  ], { material: 'castAlu' });
  const coil = group(
    box(0.042, 0.05, 0.045, 'black', { pos: [0, 0, BD / 2 + 0.0225] }),
    box(0.03, 0.03, 0.02, 'black', { pos: [0, 0, BD / 2 + 0.055] }),
    lathe([[0, 0], [0.007, 0], [0.007, 0.012], [0, 0.012]], 'zinc', { seg: 8, pos: [0, 0.025, BD / 2 + 0.0225] }),
  );
  const valve = at(group(vb, coil), [VX + BW / 2, VY, 0]);
  const VE = [0.1, 0, 0];
  P('1', valve, VE);
  const e9 = racPose(THREE, F.elbow({ pd: 12, jd: 12, angle: 45 }), [VX + BW / 2, VY - BH / 2, 0], [0, -1, 0], [1, 0, 0]);
  P('9', e9, add(VE, [0, -0.06, 0]));
  const e10 = racPose(THREE, F.elbow({ pd: 12, jd: 12 }), [VX + BW / 2, VY + 0.008, -BD / 2], [0, 0, -1], [0, -1, 0]);
  P('10', e10, add(VE, [0, 0, -0.06]));
  // 17 — vis H 3/8 × 2 1/4 po au travers du corps et du fer plat : rondelle
  // plate (21) sous la tête ; derrière le fer plat, rondelle fendue (24) et écrou (28).
  for (const y of [-0.015, 0.015]) {
    screw('17', d38, 2.25 * IN, [VX + BW, VY + y, 0.012], [1, 0, 0], [['21', false]], 0.2);
    P('24', racPose(THREE, group(F.washer(d38, { split: true })), [XB, VY + y, 0.012], [-1, 0, 0]), [-0.05, 0, 0]);
    P('28', racPose(THREE, group(F.nut(d38)), [XB - d38 * 0.25, VY + y, 0.012], [-1, 0, 0]), [-0.08, 0, 0]);
  }

  return { view: { dir: [0.9, 0.55, 1.1] } };
}

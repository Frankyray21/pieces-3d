// P362 — Électrovanne de détection de charge : CX034758 rév. 0 « ASSY, SOL.
// VALVE, LOAD SENSE, DU311 » (page 362), repère 16 du porteur P208.
// Électrovanne 3 voies 2 positions (1, CP001057) : bloc d'acier zingué
// 1 1/2 × 2 1/2 × 1 1/2 po à orifices ORB -06 (1 dessous, 2 sur le flanc
// droit, 3 haut du flanc gauche, chiffres frappés), cartouche vissée dessus
// (six-pans 7/8 po), tube d'armature, bobine surmoulée noire 1 3/4 po avec
// boîtier de connecteur DIN 43650 sur le flanc et écrou de retenue ; coude 45°
// MORB -06 → JIC -06 (2) sous l'orifice 1, coudes 90° MORB -06 → JIC -06 (3)
// sur les orifices 2 et 3, tournés vers le bas ; deux vis H 1/4-20 × 1 3/4 po
// (4) et rondelles Grower (5) traversent le bloc d'avant en arrière.
// Repère machine (layout.js), posé à l'identité par P208 : bloc vissé sur la
// face extérieure du flanc droit du châssis avant (dos à z = 0.495), centre
// du dos en (0.56, 0.555) (FB.lsValve de _frontb.js ; repère 16 de
// carrier.js). Châssis avant : corps « front » de la simulation.
import { FB, IN, orbElbow, orbElbow45, orient, spotFace, boltAt, front } from './_frontb.js';

const W = 1.5 * IN, H = 2.5 * IN, D = 1.5 * IN;

export default function P362(api) {
  const { S } = api;
  const T = (obj) => { const g = S.group(obj); g.position.set(...FB.lsValve); return front(g); };
  const Pt = (ref, obj, e) => api.part(ref, T(obj), e);
  const ports = {
    1: { p: [0, -H / 2, D / 2], d: [0, -1, 0] },
    2: { p: [W / 2, -0.004, D / 2], d: [1, 0, 0] },
    3: { p: [-W / 2, 0.012, D / 2], d: [-1, 0, 0] },
  };
  const bolts = [[-0.0105, -0.019], [0.0105, 0.019]];

  // 1 — électrovanne : bloc, cartouche, bobine, connecteur, écrou.
  {
    const blk = [S.box(W, H, D, 'zinc', { r: 0.0014, pos: [0, 0, D / 2] })];
    const steel = Object.values(ports).map((q) => spotFace(api, 6, q.p, q.d));
    for (const [x, y] of bolts) steel.push(S.ring(0.0062, 0.0036, 0.0005, 'steel', { axis: 'z', seg: 16, pos: [x, y, D + 0.00025] }));
    // Chiffres d'orifices frappés (traits) sur la façade.
    steel.push(S.box(0.0007, 0.005, 0.0003, 'steel', { pos: [0.001, -0.024, D + 0.00015] }));
    steel.push(S.box(0.004, 0.0007, 0.0003, 'steel', { pos: [0.013, -0.012, D + 0.00015] }), S.box(0.004, 0.0007, 0.0003, 'steel', { pos: [0.013, -0.0095, D + 0.00015] }));
    steel.push(S.box(0.004, 0.0007, 0.0003, 'steel', { pos: [-0.013, 0.02, D + 0.00015] }), S.box(0.004, 0.0007, 0.0003, 'steel', { pos: [-0.013, 0.0225, D + 0.00015] }), S.box(0.004, 0.0007, 0.0003, 'steel', { pos: [-0.013, 0.025, D + 0.00015] }));
    const yc = H / 2;
    steel.push(S.nut(0.875 * IN, 0.009, 'steel', { pos: [0, yc + 0.0045, D / 2] }));
    steel.push(S.cyl(0.0082, 0.05, 'steel', { seg: 18, pos: [0, yc + 0.034, D / 2] }));
    steel.push(S.nut(0.016, 0.006, 'steel', { pos: [0, yc + 0.06, D / 2] }));
    steel.push(S.cyl(0.0035, 0.004, 'steel', { seg: 10, pos: [0, yc + 0.065, D / 2] }));
    const coil = [
      S.box(0.044, 0.04, 0.044, 'plastic', { r: 0.005, pos: [0, yc + 0.034, D / 2] }),
      // Boîtier de connecteur DIN : embase carrée, cadre et trois languettes.
      S.box(0.008, 0.028, 0.028, 'plastic', { r: 0.002, pos: [0.026, yc + 0.034, D / 2] }),
      S.box(0.004, 0.0035, 0.024, 'plastic', { pos: [0.032, yc + 0.045, D / 2] }),
      S.box(0.004, 0.0035, 0.024, 'plastic', { pos: [0.032, yc + 0.023, D / 2] }),
      S.box(0.004, 0.024, 0.0035, 'plastic', { pos: [0.032, yc + 0.034, D / 2 + 0.0105] }),
      S.box(0.004, 0.024, 0.0035, 'plastic', { pos: [0.032, yc + 0.034, D / 2 - 0.0105] }),
    ];
    const brass = [[0.033, yc + 0.039, D / 2 - 0.004], [0.033, yc + 0.039, D / 2 + 0.004], [0.033, yc + 0.029, D / 2]].map((p) => S.box(0.004, 0.0045, 0.0008, 'brass', { pos: p }));
    Pt('1', S.group(S.merged(blk, 'zinc'), S.merged(steel, 'steel'), S.merged(coil, 'plastic'), S.merged(brass, 'brass'),
      S.at(S.nameplate(0.026, 0.016), [0, yc + 0.034, D / 2 + 0.0221])), [0, 0, 0.08]);
  }
  Pt('2', orient(api, orbElbow45(api, 6, 6).obj, ports[1].p, ports[1].d, [0, 0, 1]), [0, -0.06, 0.02]);
  Pt('3', orient(api, orbElbow(api, 6, 6).obj, ports[2].p, ports[2].d, [0, -1, 0]), [0.06, 0, 0.02]);
  Pt('3', orient(api, orbElbow(api, 6, 6).obj, ports[3].p, ports[3].d, [0, -1, 0]), [-0.06, 0, 0.02]);
  for (const [x, y] of bolts) {
    const b = boltAt(api, 0.25, 1.75, [x, y, D], [0, 0, 1]);
    Pt('5', b.washer, [0, 0, 0.12]);
    Pt('4', b.bolt, [0, 0, 0.16]);
  }
  return { view: { dir: [0.7, 0.4, 1.1] } };
}

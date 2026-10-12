// P410 — Graissage centralisé du porteur : CX038828 rév. 0 « ASSY,
// CENTRALIZED GREASING - DU311 CARRIER » (pages 410 et 412), repère 34 du
// porteur P208. Bloc de graissage à 8 voies (2, CX038532 : barreau d'acier
// zingué 1 × 9 × 1 po) debout sur son entretoise (3, plat 1 × 9 × 1/2 po),
// fixé par deux vis H 1/4-20 × 1 3/4 po (7) à rondelles Nord-Lock (8) qui
// traversent bloc et entretoise. Chaque voie : graisseur droit 1/8 NPT (1) en
// façade, raccord droit à écrou tournant FNPT / MNPT 1/8 (6) sur la face
// arrière (départ du flexible), bouchon NPT 1/8 affleurant à six-pans creux
// (4) sur la face avant. Huit flexibles de graissage à embouts NPT droits (L1
// à L8, HA02554) vers les points graissés, chacun terminé par un coude 90° à
// écrou tournant FNPT / MNPT 1/8 (5) vissé dans le point (détails B à H des
// pages 410 et 412) : L1 et L3 axes arrière des vérins de direction droit et
// gauche, L2 et L4 axes avant des vérins de direction (châssis avant :
// flexibles souples qui passent l'articulation), L5 et L6 axes d'oscillation
// avant et arrière de l'essieu arrière, L7 et L8 axes supérieur et inférieur
// de l'articulation (flancs des chapes arrière).
// Repère machine (layout.js), posé à l'identité par P208 : bloc sur la paroi
// droite de la cabine (z = 0.98), près de l'articulation (vue de côté de la
// page 410) : x = −0.30, milieu à y = 1.20, graisseurs vers l'extérieur
// (+Z). Points graissés d'après les axes de carrier.js (vérins de direction
// à x = −0.95 et 0.45, z = ±0.62 ; articulation à x = 0 ; essieu arrière à
// x = −1.63). Châssis arrière (sans étiquette), sauf les coudes des axes avant
// (corps « front ») et les flexibles L2 et L4 (souples, flex).
import { M } from '../layout.js';
import { IN, boltAt, orient, orientPoint, greaseNipple18, swivelStraight18, swivelElbow18, nptPlug18, front } from './_frontb.js';
import { flex } from '../layout.js';

const BW = 1.0 * IN, BH = 9.0 * IN, SP = 0.5 * IN;
const XB = -0.3, YB = 1.2, ZW = M.cab.z1; // milieu du bloc (x, y), paroi de la cabine
const ZC = ZW + SP + BW / 2; // axe du bloc (z)
const YS = Array.from({ length: 8 }, (_, k) => YB + (3.5 - k) * 0.0229); // voies, de haut en bas (L1 en haut)
const YBOLT = [YB + 0.1029, YB - 0.1029];

// Points graissés : position de l'orifice, normale (sortie de l'orifice), côté de la sortie du coude, châssis avant ?
const PTS = [
  { p: [-0.95, 0.775, 0.62], d: [0, 1, 0], s: [0, 0, 1] }, // L1 axe arrière du vérin de direction droit
  { p: [0.45, 0.775, 0.62], d: [0, 1, 0], s: [-1, 0, 0], f: true }, // L2 axe avant du vérin droit
  { p: [-0.95, 0.775, -0.62], d: [0, 1, 0], s: [1, 0, 0] }, // L3 axe arrière du vérin gauche
  { p: [0.45, 0.775, -0.62], d: [0, 1, 0], s: [-1, 0, 0], f: true }, // L4 axe avant du vérin gauche
  { p: [-1.46, 0.69, 0.1], d: [0, 1, 0], s: [1, 0, 0] }, // L5 axe d'oscillation avant de l'essieu arrière
  { p: [-1.95, 0.69, -0.15], d: [0, 1, 0], s: [1, 0, 0] }, // L6 axe d'oscillation arrière
  { p: [-0.02, 0.9, 0.18], d: [0, 0, 1], s: [-1, 0, 0] }, // L7 axe supérieur de l'articulation
  { p: [-0.02, 0.52, 0.18], d: [0, 0, 1], s: [-1, 0, 0] }, // L8 axe inférieur
];
// Points de passage des flexibles (après la descente le long de la paroi).
const VIA = [
  [[-0.7, 0.86, 0.76], [-0.9, 0.83, 0.68]],
  [[-0.05, 0.86, 0.68], [0.22, 0.82, 0.68]],
  [[-0.6, 0.86, 0.6], [-0.72, 0.84, 0.0], [-0.88, 0.83, -0.56]],
  [[-0.45, 0.75, 0.55], [-0.45, 0.72, -0.5], [-0.1, 0.77, -0.67], [0.22, 0.79, -0.67]],
  [[-0.8, 0.8, 0.6], [-1.3, 0.75, 0.35], [-1.42, 0.73, 0.15]],
  [[-0.85, 0.79, 0.64], [-1.5, 0.75, 0.4], [-1.88, 0.74, 0.0]],
  [[-0.32, 0.93, 0.62], [-0.14, 0.9, 0.3]],
  [[-0.36, 0.8, 0.62], [-0.16, 0.56, 0.32]],
];

export default function P410(api) {
  const { S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const F = (o, f) => (f ? front(o) : o);

  // 2 — bloc : lamages des voies sur trois faces, lamages des vis.
  {
    const steel = [];
    for (const y of YS) {
      steel.push(S.ring(0.0062, 0.0052, 0.0004, 'steel', { axis: 'z', seg: 16, pos: [XB, y, ZC + BW / 2 + 0.0002] }));
      steel.push(S.ring(0.0062, 0.0052, 0.0004, 'steel', { axis: 'x', seg: 16, pos: [XB - BW / 2 - 0.0002, y, ZC] }));
      steel.push(S.ring(0.0062, 0.0052, 0.0004, 'steel', { axis: 'x', seg: 16, pos: [XB + BW / 2 + 0.0002, y, ZC] }));
    }
    for (const y of YBOLT) steel.push(S.ring(0.0065, 0.0036, 0.0004, 'steel', { axis: 'z', seg: 16, pos: [XB, y, ZC + BW / 2 + 0.0002] }));
    // Numéros des voies frappés (traits) sur la façade, à côté de chaque graisseur.
    YS.forEach((y, k) => { for (let i = 0; i <= k % 4; i++) steel.push(S.box(0.0006, 0.0035, 0.0003, 'steel', { pos: [XB - 0.009 + i * 0.0014, y, ZC + BW / 2 + 0.00015] })); });
    P('2', S.group(S.merged([S.box(BW, BH, BW, 'zinc', { r: 0.0012, pos: [XB, YB, ZC] })], 'zinc'), S.merged(steel, 'steel')), [0, 0, 0.12]);
  }
  // 3 — entretoise.
  P('3', S.box(BW, BH, SP, 'lightGrey', { r: 0.0012, pos: [XB, YB, ZW + SP / 2] }), [0, 0, 0.06]);
  // 7, 8 — vis au travers du bloc et de l'entretoise.
  for (const y of YBOLT) {
    const b = boltAt(api, 0.25, 1.75, [XB, y, ZC + BW / 2], [0, 0, 1], { washer: 'nl' });
    P('8', b.washer, [0, 0, 0.17]);
    P('7', b.bolt, [0, 0, 0.21]);
  }
  YS.forEach((y, k) => {
    P('1', orient(api, greaseNipple18(api), [XB, y, ZC + BW / 2], [0, 0, 1]), [0, 0, 0.16]);
    P('4', orient(api, nptPlug18(api), [XB + BW / 2, y, ZC], [1, 0, 0]), [0.05, 0, 0]);
    const sw = swivelStraight18(api);
    const pos = [XB - BW / 2, y, ZC];
    P('6', orient(api, sw.obj, pos, [-1, 0, 0]), [-0.05, 0, 0]);
    const start = orientPoint(api, sw.tip, pos, [-1, 0, 0]);
    // 5 — coude au point graissé ; L — flexible du raccord 6 au coude 5.
    const q = PTS[k];
    const el = swivelElbow18(api);
    P('5', F(orient(api, el.obj, q.p, q.d, q.s), q.f), q.d.map((v) => v * 0.05));
    const end = orientPoint(api, el.out, q.p, q.d, q.s);
    // Descente en nappe le long de la paroi (voie du haut à l'extérieur), puis sous la cabine.
    const xk = XB - 0.045 - 0.009 * (7 - k);
    const lead = [xk + 0.006, y, ZC];
    const down = [xk, y - 0.03, ZC];
    const low = [xk, 0.96, ZC - 0.004 * k];
    const tail = [end[0] + q.s[0] * 0.02, end[1] + q.s[1] * 0.02, end[2] + q.s[2] * 0.02];
    const pts = [start, lead, down, low, ...VIA[k], tail, end];
    const ref = `L${k + 1}`;
    if (q.f) {
      const bodies = pts.map((p) => (p[0] > 0.05 ? 'front' : 'chassis'));
      P(ref, flex(S, pts, bodies, 0.0045, 'hose', { seg: 90 }), [0, -0.05, 0]);
    } else {
      P(ref, S.hose(pts, 0.0045), [0, -0.05, 0]);
    }
  });
  return { view: { dir: [0.6, 0.5, 1.1] } };
}

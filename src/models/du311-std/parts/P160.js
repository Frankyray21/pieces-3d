// P160 — Plaque de liaison du mât « ASSY, MAST CONNECTION PLATE » CX036217
// rév. 1 (page 160 : vue éclatée, vue de face, coupe A-A, deux
// isométriques). Plaque mécano-soudée 2 po (6) vissée par sa face arrière
// sur la bride de sortie de l'actionneur rotatif (vis de P174 dans ses
// taraudages) : grand corps à deux évidements triangulaires et trou central
// (passage des vis de la rondelle d'arrêt), bout haut rétréci portant la
// chape de l'œil de tige du vérin d'extension (axe Ø 2 × 5 3/4, 1, bagues
// 3 et 4, vis d'arrêt 8 et rondelle 11). Le long des deux grands côtés de
// la face avant, quatre boîtiers de patins (7) vissés chacun par sept vis H
// 3/4 × 2 (9) et rondelles (12) ; dans chacun, un patin de glissement de
// 26.5 po en polyéthylène (2) en équerre sur la face extérieure et le dessus
// de la barre de guidage du cadre du carrousel, une plaque d'appui (5)
// poussée par trois vis carrées de réglage 3/4 × 2 (10), contre-écrous
// (13) et rondelles (12).
// Repère : celui du MCP (P156, comme ../slide.js) : plaque dans le plan XY
// centrée à l'origine, longueur selon Y (bout de la chape vers +Y), face
// avant vers +Z (vers le mât), face arrière (appui sur la bride de
// l'actionneur) à z = −MCP.t / 2 ; barres de guidage de l'avance à
// x = ±0.265, de z = 0.04 à MCP.front.
// Encombrement ≈ 0.72 (X) × 2.0 (Y) × 0.24 (Z) m.

import { IN, u, MCP, slabZ, slabX, bx, along, hhcs, hexNut, washerD, sqss, arc } from './_slide.js';

export const P160G = {
  halfW: 0.34, // demi-largeur de la plaque
  pads: [0.52, -0.5], // centres (y) des paires de boîtiers
  padL: 27.5 * IN, // longueur des boîtiers
  bar: { x0: 0.25, x1: 0.28, z0: 0.04, z1: MCP.front }, // barres de guidage de l'avance (côté +X)
  clevis: { y: -0.93, z: 0.12 }, // axe de la chape basse (œil de fond du vérin d'extension)
};

export default function P160(api) {
  const { THREE, S } = api;
  const { box, lathe, merged, weld, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const put = (obj, p, dir) => along(THREE, obj, dir, p);
  const t = MCP.t, h = MCP.length / 2, W = P160G.halfW;
  const zf = t / 2; // face avant
  const B = P160G.bar, C = P160G.clevis;
  const PAINT = 'lightGrey';

  // ================================================================ 6 — plaque mécano-soudée
  const outline = [[-W, -h], [W, -h], [W, 0.8], [0.12, h], [-0.12, h], [-W, 0.8]];
  const tri = (yc, s) => { // évidement triangulaire (pointe vers le centre)
    const a = 0.16, b = 0.26;
    const pts = [[-a, yc + s * b / 2], [a, yc + s * b / 2], [0, yc - s * b / 2]];
    return pts;
  };
  const plateM = (() => {
    const sh = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
    for (const [yc, s] of [[0.48, 1], [-0.48, -1]]) {
      const p = tri(yc, s);
      sh.holes.push(new THREE.Path((s > 0 ? p.slice().reverse() : p).map(([x, y]) => new THREE.Vector2(x, y))));
    }
    const c = new THREE.Path(); c.absarc(0, 0, 0.07, 0, Math.PI * 2, true); sh.holes.push(c);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: t - 0.003, bevelEnabled: true, bevelSize: 0.0015, bevelThickness: 0.0015, bevelOffset: -0.0015, bevelSegments: 1, curveSegments: 24 });
    geo.translate(0, 0, -t / 2 + 0.0015);
    return new THREE.Mesh(geo);
  })();
  // nervures de bord autour des évidements et du trou central (face avant)
  const ribs = [S.at(S.lathe([[0.07, 0], [0.105, 0], [0.105, 0.012], [0.07, 0.012]], PAINT, { axis: 'z', seg: 40 }), [0, 0, zf])];
  // chape : deux oreilles perpendiculaires à X (2 1/4 et 1 1/4 po), axe en (y, z) = (C.y, C.z)
  const eyeW = 1.75 * IN, lugA = 2.25 * IN, lugB = 1.25 * IN;
  const lug = [[C.y - 0.07, zf], [C.y + 0.055, zf], ...arc(C.y, C.z, 0.052, -0.2 * Math.PI, Math.PI, 12).map(([y, z]) => [y, z]), [C.y - 0.07, C.z]].map(([y, z]) => [z, y]);
  // slabX attend (z, y) : on décrit le profil dans le plan (z, y)
  const lugs = [
    slabX(S, lug.map(([z, y]) => [z, y]), eyeW / 2 + 0.002, eyeW / 2 + 0.002 + lugA, PAINT, [[C.z, C.y, 1.125 * IN]]),
    slabX(S, lug.map(([z, y]) => [z, y]), -eyeW / 2 - 0.002 - lugB, -eyeW / 2 - 0.002, PAINT, [[C.z, C.y, 1.125 * IN]]),
  ];
  const beads = [
    weld([[eyeW / 2 + 0.002, C.y - 0.07, zf + 0.003], [eyeW / 2 + 0.002, C.y + 0.05, zf + 0.003]], 0.008, PAINT),
    weld([[-eyeW / 2 - 0.002, C.y - 0.07, zf + 0.003], [-eyeW / 2 - 0.002, C.y + 0.05, zf + 0.003]], 0.008, PAINT),
  ];
  P('6', group(merged([plateM, ...ribs, ...lugs], PAINT), merged(beads, PAINT)), [0, 0, -0.25]);

  // ================================================================ 1 — axe Ø 2 × 5 3/4, 3 + 4 — bagues, 8 + 11
  const xa = -eyeW / 2 - 0.002 - lugB - 0.004, len = 5.75 * IN;
  P('1', at(lathe([[0, 0], [1.0 * IN - 0.003, 0], [1.0 * IN, 0.003], [1.0 * IN, len - 0.012], [1.5 * IN, len - 0.012], [1.5 * IN, len], [0, len]], 'steel', { axis: 'x', seg: 28 }), [xa, C.y, C.z]), [0.25, 0, 0]);
  P('4', at(lathe([[1.0 * IN, 0], [1.125 * IN, 0], [1.125 * IN, lugA], [1.0 * IN, lugA], [1.0 * IN, 0]], 'brass', { axis: 'x', seg: 28 }), [eyeW / 2 + 0.002, C.y, C.z]), [0.15, 0, 0]);
  P('3', at(lathe([[1.0 * IN, 0], [1.125 * IN, 0], [1.125 * IN, lugB], [1.0 * IN, lugB], [1.0 * IN, 0]], 'brass', { axis: 'x', seg: 28 }), [-eyeW / 2 - 0.002 - lugB, C.y, C.z]), [-0.15, 0, 0]);
  const xh = xa + len - 0.012; // collet de l'axe, côté +X
  P('11', put(washerD(S, 0.375 * IN, 'zinc', { od: 0.75 * IN, t: 0.08 * IN }), [xh + 0.012, C.y + 0.03, C.z], [1, 0, 0]), [0.3, 0.05, 0]);
  P('8', put(hhcs(S, THREE, 0.375, 1.25), [xh + 0.014, C.y + 0.03, C.z], [1, 0, 0]), [0.36, 0.05, 0]);

  // ================================================================ 7 — boîtiers de patins, 2 — patins, 5 — plaques d'appui
  const L7 = P160G.padL, Ls = 26.5 * IN;
  for (const sx of [-1, 1]) {
    for (const yc of P160G.pads) {
      const X = (x) => sx * x;
      // boîtier : semelle vissée sur la plaque, paroi extérieure, lèvre au-dessus de la barre
      const housing = merged([
        bx(S, Math.min(X(0.302), X(W)), Math.max(X(0.302), X(W)), yc - L7 / 2, yc + L7 / 2, zf, zf + 0.022, 'grey', 0.002),
        bx(S, Math.min(X(0.302), X(0.327)), Math.max(X(0.302), X(0.327)), yc - L7 / 2, yc + L7 / 2, zf, B.z1 + 0.016, 'grey', 0.002),
        bx(S, Math.min(X(0.255), X(0.327)), Math.max(X(0.255), X(0.327)), yc - L7 / 2, yc + L7 / 2, B.z1 + 0.004, B.z1 + 0.016, 'grey', 0.002),
        ...[-1, 1].map((e) => bx(S, Math.min(X(0.302), X(W)), Math.max(X(0.302), X(W)), yc + e * (L7 / 2 - 0.006) - 0.006, yc + e * (L7 / 2 - 0.006) + 0.006, zf, B.z1 + 0.016, 'grey')),
      ], 'grey');
      P('7', housing, [sx * 0.2, 0, 0.1]);
      // patin en équerre (face extérieure et dessus de la barre)
      P('2', merged([
        bx(S, Math.min(X(B.x1), X(B.x1 + 0.01)), Math.max(X(B.x1), X(B.x1 + 0.01)), yc - Ls / 2, yc + Ls / 2, B.z0 + 0.005, B.z1 + 0.004, 'white'),
        bx(S, Math.min(X(0.258), X(B.x1 + 0.01)), Math.max(X(0.258), X(B.x1 + 0.01)), yc - Ls / 2, yc + Ls / 2, B.z1 - 0.006, B.z1 + 0.004, 'white'),
      ], 'white'), [sx * 0.12, 0, 0.18]);
      P('5', bx(S, Math.min(X(B.x1 + 0.01), X(0.302)), Math.max(X(B.x1 + 0.01), X(0.302)), yc - Ls / 2 + 0.01, yc + Ls / 2 - 0.01, B.z0 + 0.02, B.z1 - 0.012, 'steel'), [sx * 0.16, 0, 0.12]);
      // 9 + 12 — sept vis de la semelle
      for (let k = 0; k < 7; k++) {
        const y = yc - L7 / 2 + 0.04 + (k * (L7 - 0.08)) / 6;
        const p = [X((0.302 + W) / 2 + 0.006), y, zf + 0.022];
        P('12', at(washerD(S, 0.75 * IN, 'zinc', { od: 1.47 * IN, t: 0.134 * IN }), p, [Math.PI / 2, 0, 0]), [sx * 0.2, 0, 0.2]);
        P('9', put(hhcs(S, THREE, 0.75, 2.0), [p[0], p[1], p[2] + 0.134 * IN], [0, 0, 1]), [sx * 0.2, 0, 0.26]);
      }
      // 10 + 13 + 12 — trois vis de réglage à travers la paroi extérieure
      for (const dy of [-0.24, 0, 0.24]) {
        const zq = (B.z0 + B.z1) / 2 + 0.004;
        const pw = [X(0.327), yc + dy, zq];
        P('12', put(washerD(S, 0.75 * IN, 'zinc', { od: 1.47 * IN, t: 0.134 * IN }), pw, [sx, 0, 0]), [sx * 0.3, 0, 0.1]);
        P('13', put(hexNut(S, THREE, 0.75, { jam: true }), [pw[0] + sx * 0.134 * IN, pw[1], pw[2]], [sx, 0, 0]), [sx * 0.34, 0, 0.1]);
        P('10', put(sqss(S, THREE, 0.75, 2.0), [X(0.302 + 2.0 * IN), pw[1], pw[2]], [sx, 0, 0]), [sx * 0.42, 0, 0.1]);
      }
    }
  }
  void box; void slabZ; void u;
  return { view: { dir: [0.9, 0.5, 1.2] } };
}

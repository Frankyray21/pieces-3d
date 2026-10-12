// P140 — Distributeur du carrousel, 3 sections CX038134 rév. 0 (page 140) :
// « ASSY, CAROUSEL VALVE BANK - 3 SECTION ». Posé sur le support du
// distributeur (6 de P136) au-dessus du cadre haut du carrousel :
// - équerre en U de 1/4 po (1, « 3 SECTION VALVE BRACKET ») : fond boulonné
//   sur la platine du support (deux vis 1/2 × 1 1/2 (14) à l'avant, deux vis
//   1/2 × 1 3/4 (15) à l'arrière, rondelles (17)), dos et deux flancs percés
//   pour les flexibles ; distributeur garni (7, P146) vissé sur le dos ;
// - bloc de valves de séquence garni (6, P142) vissé au dos de l'équerre ;
// - deux équerres d'appui (3) sur les flancs (vis 1/2 × 1 (12)) qui portent
//   la platine de montage (5, deux fenêtres, vis 1/2 × 1 1/4 (13)),
//   rondelles fendues (19) ;
// - boîte de jonction (8, P150) posée à plat sur la platine, quatre vis
//   3/8 × 3/4 (11) et rondelles (18) ; capot ajouré (4, « GUARD, MAST
//   JUNCTION BOX ») boulonné sur la platine par quatre vis 1/4 × 1/2 (9) et
//   rondelles (16) ;
// - collier Ø 11/16 po (2) du câble composite de la boîte sur la patte de la
//   platine, vis 3/8 × 5/8 (10) et rondelle (18).
// Repère : repère de l'avance (../feed.js), inséré à l'identité dans P028 ;
// distributeur à tiroirs selon X (PVEO vers +X, côté stinger), orifices vers
// +Z, empilage vertical, fond de l'équerre sur la platine du support à
// y = 2.48 m, centre de la platine en (0.77, -0.14). Encombrement ≈ 0.40 (X)
// × 0.40 (Y, de 2.48 à 2.88) × 0.33 (Z) m.
// Cotes : vis de la liste ; distributeur PVG 32 (P148) ; équerre, platine et
// capot proportionnés sur l'éclaté de P140 ; boîte 8 × 10 × 4 po (P150).
import { u, C, VBM, rrect, prism, frame, boltStack, supportClamp, clampHole } from './_carousel.js';
import { JB150 } from './P150.js';

export default function P140(api) {
  const { S } = api;
  const { group, merged, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  // origine locale : origine du distributeur (centre du dessous de la plaque d'extrémité)
  const O = [C[0] + VBM.c[0] - 0.035, VBM.top + u(0.25), C[1] + VBM.c[1] - 0.032];
  const W = (p) => [p[0] + O[0], p[1] + O[1], p[2] + O[2]];
  const atO = (obj) => { const g = group(obj); g.position.set(...O); return g; };
  const T = u(0.25);
  const bx0 = -0.125, bx1 = 0.195, bz0 = -0.0564, bz1 = 0.12, bH = 0.26;
  // tôle verticale dans le plan Z-Y (épaisseur selon X) : contour [[z, y]], trous [z, y, r]
  const sideWall = (x0, pts, holes, mat = 'grey') => {
    const m = S.extrude(pts, T, mat, { holes });
    const g = group(m);
    g.rotation.y = -Math.PI / 2;
    g.position.x = x0 + T / 2;
    return g;
  };
  // tôle verticale dans le plan X-Y (épaisseur selon Z)
  const frontWall = (z0, pts, holes, mat = 'grey') => { const m = S.extrude(pts, T, mat, { holes }); m.position.z = z0 + T / 2; return m; };

  // ================================================ 1 — équerre en U
  const sideHoles = [[0.0, 0.07, u(0.75)], [0.06, 0.07, u(0.75)], [0.0, 0.13, u(0.75)], [0.06, 0.13, u(0.75)], [0.0, 0.19, u(0.75)], [0.06, 0.19, u(0.75)], [0.03, 0.235, u(0.5)]];
  const sidePts = [[bz0, 0], [bz1, 0], [bz1, bH - 0.03], [bz1 - 0.03, bH], [bz0, bH]];
  const floorHoles = [[-0.11, 0.105], [0.18, 0.105], [-0.11, -0.04], [0.18, -0.04]];
  P('1', atO(merged([
    prism(api, rrect(bx0, bz0, bx1, bz1, 0.006, 3), -T, 0, 'grey', [...floorHoles.map(([x, z]) => [x, z, u(0.28)]), rrect(-0.02, 0.06, 0.09, 0.1, 0.015, 3)]),
    frontWall(bz0, [[bx0, 0], [bx1, 0], [bx1, bH], [bx0, bH]], [[-0.035, 0.015, u(0.17)], [0.035, 0.015, u(0.17)], [-0.035, 0.205, u(0.17)], [0.035, 0.205, u(0.17)], [0.035, 0.11, u(0.6)], [0.035, 0.155, u(0.6)]]),
    sideWall(bx0, sidePts, sideHoles),
    sideWall(bx1 - T, sidePts, sideHoles),
  ], 'grey')), [0, -0.05, 0]);
  for (const [x, z] of floorHoles) {
    const s = boltStack(api, W([x, 0, z]), [0, 1, 0], 0.5, z > 0 ? 1.5 : 1.75, { washer: 'flat' });
    P('17', s.washer, [0, 0.05, 0]); P(z > 0 ? '14' : '15', s.bolt, [0, 0.1, 0]);
  }

  // ================================================ 7 — distributeur garni, 6 — collecteur au dos
  P('7', at(api.sub('P146'), O), [0, 0, 0.25]);
  P('6', frame(api, api.sub('P142'), [-1, 0, 0], [0, 1, 0], W([0.035, 0.07, bz0 - u(1.25)])), [0, 0, -0.25]);

  // ================================================ 3 — équerres d'appui, 12 / 13 / 19
  const yP0 = bH + T, yP1 = yP0 + T; // platine de montage
  for (const [xw, s] of [[bx0, -1], [bx1, 1]]) {
    const xo = xw + (s > 0 ? 0 : 0); // face extérieure du flanc
    const vert = S.box(T, 0.07, 0.05, 'grey', { pos: [xo + s * T / 2, bH - 0.035 + T, 0.032] });
    const hor = S.box(0.038, T, 0.05, 'grey', { pos: [xo + s * 0.019 - s * 0.006, bH + T / 2, 0.032] });
    P('3', atO(merged([vert, hor], 'grey')), [s * 0.08, 0.05, 0]);
    const b12 = boltStack(api, W([xo + s * T, bH - 0.03, 0.032]), [s, 0, 0], 0.5, 1.0, { washer: 'lock' });
    P('19', b12.washer, [s * 0.12, 0.05, 0]); P('12', b12.bolt, [s * 0.16, 0.05, 0]);
    const b13 = boltStack(api, W([xo + s * 0.013, yP1, 0.032]), [0, 1, 0], 0.5, 1.25, { washer: 'lock' });
    P('19', b13.washer, [s * 0.04, 0.2, 0]); P('13', b13.bolt, [s * 0.04, 0.25, 0]);
  }

  // ================================================ 5 — platine de montage (patte du collier)
  const mx0 = -0.142, mx1 = 0.22, mz0 = -0.075, mz1 = 0.185;
  const tab = S.box(T, yP0 - 0.2, 0.055, 'grey', { pos: [mx0 + T / 2, (yP0 + 0.2) / 2, -0.0325] });
  P('5', atO(merged([
    prism(api, rrect(mx0, mz0, mx1, mz1, 0.008, 3), yP0, yP1, 'grey', [rrect(-0.09, -0.04, 0.02, 0.0, 0.02, 3), rrect(0.06, 0.1, 0.17, 0.14, 0.02, 3), ...[[mx0 + 0.012, mz0 + 0.012], [mx1 - 0.012, mz0 + 0.012], [mx0 + 0.012, mz1 - 0.012], [mx1 - 0.012, mz1 - 0.012]].map(([x, z]) => [x, z, u(0.14)])]),
    tab,
  ], 'grey')), [0, 0.15, 0]);

  // ================================================ 8 — boîte de jonction, 11 / 18
  const jc = [0.035, yP1, 0.055];
  P('8', frame(api, api.sub('P150'), [0, 0, 1], [1, 0, 0], W(jc)), [0, 0.3, 0]);
  for (const [xl, yl] of JB150.tabs) {
    const s = boltStack(api, W([jc[0] + yl, yP1 + 0.0025, jc[2] + xl]), [0, 1, 0], 0.375, 0.75, { washer: 'lock' });
    P('18', s.washer, [0, 0.36, 0]); P('11', s.bolt, [0, 0.4, 0]);
  }

  // ================================================ 4 — capot ajouré, 9 / 16
  const gx0 = -0.135, gx1 = 0.212, gz0 = -0.068, gz1 = 0.178, gy1 = yP1 + 0.122, t = u(0.125);
  const gTop = prism(api, rrect(gx0, gz0, gx1, gz1, 0.006, 3), gy1 - t, gy1, 'lightGrey', [rrect(-0.06, 0.0, 0.13, 0.11, 0.05, 6), rrect(-0.09, 0.14, 0.0, 0.16, 0.01, 3), rrect(0.07, 0.14, 0.16, 0.16, 0.01, 3)]);
  const hgt = gy1 - yP1;
  const sideX = (x0) => {
    const m = S.extrude([[gz0, 0], [gz1, 0], [gz1, hgt], [gz0, hgt]], t, 'lightGrey', { holes: [] });
    const g = group(m);
    g.rotation.y = -Math.PI / 2;
    g.position.set(x0 + t / 2, yP1, 0);
    return g;
  };
  // flanc -X avec grande fenêtre ovale (presse-étoupes, sortie du câble)
  const winX = (x0) => {
    const sh = new api.THREE.Shape([[gz0, 0], [gz1, 0], [gz1, hgt], [gz0, hgt]].map(([a, b]) => new api.THREE.Vector2(a, b)));
    const p = new api.THREE.Path();
    rrect(-0.05, 0.022, 0.15, 0.09, 0.034, 6).forEach(([a, b], i) => (i ? p.lineTo(a, b) : p.moveTo(a, b)));
    p.closePath();
    sh.holes.push(p);
    const geo = new api.THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false, curveSegments: 8 });
    geo.translate(0, 0, -t / 2);
    const g = group(S.merged([new api.THREE.Mesh(S.creaseNormals(geo))], 'lightGrey'));
    g.rotation.y = -Math.PI / 2;
    g.position.set(x0 + t / 2, yP1, 0);
    return g;
  };
  const sideZ = (z0) => S.box(gx1 - gx0, hgt, t, 'lightGrey', { pos: [(gx0 + gx1) / 2, yP1 + hgt / 2, z0 + t / 2] });
  const flanges = [gz0 - 0.012, gz1].map((z) => S.box(gx1 - gx0, t, 0.012, 'lightGrey', { pos: [(gx0 + gx1) / 2, yP1 + t / 2, z + 0.006] }));
  P('4', atO(merged([gTop, winX(gx0), sideX(gx1 - t), sideZ(gz0), sideZ(gz1 - t), ...flanges], 'lightGrey')), [0, 0.45, 0]);
  for (const x of [gx0 + 0.02, gx1 - 0.02]) for (const z of [gz0 - 0.006, gz1 + 0.006]) {
    const s = boltStack(api, W([x, yP1 + t, z]), [0, 1, 0], 0.25, 0.5, { washer: 'lock' });
    P('16', s.washer, [0, 0.5, 0]); P('9', s.bolt, [0, 0.54, 0]);
  }

  // ================================================ 2 — collier du câble composite, 10 / 18
  const d2 = 11 / 16, ch = clampHole(d2);
  const cc = [-0.155, 0.235, -0.025]; // axe du câble (descente sous le presse-étoupe 3/4 de la boîte)
  P('2', frame(api, supportClamp(api, d2), [0, 0, 1], [0, 1, 0], W(cc)), [-0.08, 0, 0]);
  const hp = [cc[0] - ch.zIn, cc[1], cc[2] + ch.x];
  const s2 = boltStack(api, W(hp), [-1, 0, 0], 0.375, 0.625, { washer: 'lock' });
  P('18', s2.washer, [-0.12, 0, 0]); P('10', s2.bolt, [-0.15, 0, 0]);

  return { view: { dir: [1, 0.7, 1.2] } };
}

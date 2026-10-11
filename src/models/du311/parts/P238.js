// P238 — Lance de lavage et enrouleur CX034925 rév. 1 « ASSY, WASH WAND W/
// HOSE REEL » (page 238), repère 21 de P186. Enrouleur de flexible haute
// pression (5) : semelle percée de 4 trous (vis H 1/2-13 × 3/4 po, 11, et
// rondelles, 12), montant en U à deux lumières, bras cintré qui passe
// au-dessus du tambour jusqu'au guide-flexible à 4 rouleaux, tambour à deux
// joues ajourées sur rayons, flexible enroulé, moyeu à 6 écrous et joint
// tournant côté montant ; coude 1/2 NPT → JIC -06 (8) sur l'entrée du joint
// tournant. Support de lance (7) : tube carré de 2 po tenu par deux vis H
// 3/8-16 × 2 3/4 po (10) à rondelles (13), dans lequel se range la poignée
// isolante de la lance (6 = P240). Sous la poignée du pistolet : mamelon
// six-pans 3/8 × 1/4 NPT (9), coupleur rapide femelle 1/4 po (2) et son
// bouchon antipoussière attaché (4), embout rapide mâle (1) et son capuchon
// attaché (3).
// Repère : origine au centre de la face inférieure de la semelle de
// l'enrouleur ; Y vers le haut ; +X le long de l'axe du tambour, du tambour
// vers le montant (joint tournant côté +X) ; +Z côté du support de lance.
// Axe du tambour à y = 0.33. Support de lance parallèle à X, à y = 0.2,
// z = 0.33. Encombrement ≈ 0.95 (X) × 0.68 (Y) × 0.62 (Z) m.
// Cotes : visserie d'après la liste ; enrouleur (joues Ø 18 po, largeur
// 6 po) et support estimés d'après les proportions de la page 238.
// Dans P186 : emplacement du repère 21 de frame.js (x ≈ -0.1, z ≈ -0.6),
// semelle à y ≈ DECK + 0.62 pour mettre le moyeu à y ≈ DECK + 0.95.
import { IN, nptFitting, orient, orientPoint } from './_chassis.js';

export default function P238(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const HY = 0.33; // axe du tambour
  const XD0 = -0.2, XD1 = -0.04; // joues du tambour
  const RD = 0.228; // rayon des joues

  // Prisme d'épaisseur t selon Z (contour XY, trous = contours).
  const slabZ = (pts, t, mat, holes = []) => {
    const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    holes.forEach((h) => sh.holes.push(h));
    const mb = Math.min(0.0012, t * 0.16);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: t - 2 * mb, bevelEnabled: true, bevelSize: mb, bevelThickness: mb, bevelOffset: -mb, bevelSegments: 1, curveSegments: 16 });
    geo.translate(0, 0, -(t - 2 * mb) / 2);
    S.creaseNormals(geo);
    return new THREE.Mesh(geo);
  };
  const slot = (cx, cy, w, h) => {
    const p = new THREE.Path();
    const r = w / 2;
    p.absarc(cx, cy + h / 2 - r, r, 0, Math.PI, false);
    p.absarc(cx, cy - h / 2 + r, r, Math.PI, Math.PI * 2, false);
    p.closePath();
    return p;
  };

  // ---------------------------------------------------------------- 5 — enrouleur
  const grey = [], dark = [], steel = [];
  // Semelle 8 × 10 po, 4 trous Ø 9/16 po.
  const holesB = [[-0.075, -0.105], [-0.075, 0.105], [0.075, -0.105], [0.075, 0.105]];
  const base = S.plate(0.2, 0.26, 0.008, 'grey', { r: 0.012, holes: holesB.map(([x, z]) => [x, z, 0.0072]) });
  base.position.y = 0.004;
  grey.push(base);
  // Montant : âme verticale (plan YZ) effilée, deux lumières, ailes repliées vers -X.
  const web = [[-0.1, 0.008], [0.1, 0.008], [0.1, 0.03], [0.05, HY - 0.03], [0.05, HY + 0.08], [-0.05, HY + 0.08], [-0.05, HY - 0.03], [-0.1, 0.03]];
  const w = slabZ(web, 0.006, 'grey', [slot(-0.05, 0.12, 0.018, 0.12), slot(0.055, 0.12, 0.018, 0.12)]);
  // Contour (z, y) → plan YZ à x = 0.03 : rotation de -90° autour de Y (Z local → +X).
  w.rotation.y = Math.PI / 2;
  w.position.x = 0.033;
  grey.push(w);
  for (const s of [-1, 1]) {
    // Ailes : bandes le long des bords inclinés de l'âme, vers -X.
    const a = new THREE.Vector3(0.033, 0.03, s * 0.1), b = new THREE.Vector3(0.033, HY - 0.03, s * 0.05);
    const len = a.distanceTo(b);
    const fl = S.box(0.04, len, 0.006, 'grey', { r: 0.001 });
    fl.position.copy(a.clone().add(b).multiplyScalar(0.5)).add(new THREE.Vector3(-0.02, 0, 0));
    fl.rotation.x = s * Math.atan2(0.05, HY - 0.06);
    grey.push(fl);
  }
  // Bras cintré (bande de 70 × 8 mm) : du haut du montant vers le dessus du tambour.
  const armPts = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const a = (t * Math.PI) / 2;
    armPts.push([0.033 - (1 - Math.cos(a)) * 0.15, HY + 0.08 + Math.sin(a) * 0.22 + t * 0.04]);
  }
  const arm = S.tube(armPts.map(([x, y]) => [x, y, 0]), 0.018, 'grey', { seg: 32, ends: 'none', radial: 12 });
  grey.push(arm);
  // Guide-flexible : cadre carré à ouverture, 4 rouleaux.
  const top = armPts[armPts.length - 1];
  const gy = top[1] + 0.012;
  const frameG = S.plate(0.13, 0.13, 0.012, 'grey', { r: 0.02, cutouts: [[0, 0, 0.07, 0.07]] });
  frameG.position.set(top[0], gy, 0);
  grey.push(frameG);
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    const roll = S.cyl(0.011, 0.07, 'steel', { axis: 'x', seg: 16 });
    roll.position.set(top[0] + Math.sin(a) * 0.046, gy + 0.012, Math.cos(a) * 0.046);
    roll.rotation.y = a;
    steel.push(roll);
    steel.push(S.bolt(0.006, 0.01, 'zinc', { pos: [top[0] + Math.sin(a + Math.PI / 4) * 0.06, gy + 0.006, Math.cos(a + Math.PI / 4) * 0.06] }));
  }
  // Tambour : deux joues (anneau + 4 rayons), noyau, flexible enroulé.
  for (const xj of [XD0, XD1]) {
    dark.push(S.ring(RD, RD - 0.035, 0.004, 'grey', { axis: 'x', seg: 64, pos: [xj, HY, 0] }));
    dark.push(S.torus(RD, 0.004, 'grey', { axis: 'x', pos: [xj, HY, 0] }));
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + (k * Math.PI) / 2;
      dark.push(S.rod([xj, HY + Math.sin(a) * 0.09, Math.cos(a) * 0.09], [xj, HY + Math.sin(a) * (RD - 0.03), Math.cos(a) * (RD - 0.03)], 0.007, 'grey', 10));
    }
  }
  dark.push(S.cyl(0.095, XD1 - XD0, 'grey', { axis: 'x', seg: 40, pos: [(XD0 + XD1) / 2, HY, 0] }));
  // Plateau de moyeu côté montant, 6 écrous.
  dark.push(S.cyl(0.07, 0.006, 'grey', { axis: 'x', seg: 32, pos: [XD1 + 0.003, HY, 0] }));
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    steel.push(S.nut(0.013, 0.007, 'zinc', { axis: 'x', pos: [0.04, HY + Math.sin(a) * 0.05, Math.cos(a) * 0.05] }));
  }
  // Joint tournant (côté +X du montant).
  steel.push(S.lathe([[0, 0.036], [0.024, 0.036], [0.024, 0.05], [0.016, 0.054], [0.016, 0.075], [0, 0.075]], 'zinc', { axis: 'x', seg: 24, pos: [0, HY, 0] }));
  // Flexible enroulé : couches de spires sur le noyau.
  const hose = [];
  const rh = 0.0085;
  for (let layer = 0; layer < 3; layer++) {
    const R = 0.095 + rh + layer * rh * 1.9;
    for (let i = 0; i < 8; i++) hose.push(S.torus(R, rh, 'hose', { axis: 'x', pos: [XD0 + 0.012 + i * 0.0185, HY, 0] }));
  }
  P('5', S.group(S.merged(grey, 'grey'), S.merged(dark, 'grey'), S.merged(steel, 'zinc'), S.merged(hose, 'hose')), [0, 0, 0]);

  // ---------------------------------------------------------------- 8 — coude 1/2 NPT → JIC -06 sur le joint tournant
  const el = nptFitting(api, { npt: 8, jic: 6, angle: 90 });
  P('8', orient(api, el.obj, [0.075, HY, 0], [1, 0, 0], [0, 0, 1]), [0.08, 0, 0]);

  // ---------------------------------------------------------------- 11 / 12 — vis de semelle et rondelles
  for (const [x, z] of holesB) {
    P('12', S.washer(0.0135, 0.0069, 0.0025, 'zinc', { pos: [x, 0.008 + 0.00125, z] }), [0, 0.06, 0]);
    P('11', S.bolt(0.5 * IN, 0.75 * IN, 'zinc', { pos: [x, 0.0105, z] }), [0, 0.1, 0]);
  }

  // ---------------------------------------------------------------- 7 — support de lance (tube carré 2 po)
  const HZ = 0.33, HYw = 0.2, X0 = -0.31, X1 = -0.01;
  const sq = (h) => [[-h, -h], [h, -h], [h, h], [-h, h]];
  const inSq = new THREE.Path(sq(0.0224).reverse().map(([a, b]) => new THREE.Vector2(a, b)));
  const holder = slabZ(sq(0.0254), X1 - X0, 'grey', [inSq]);
  holder.rotation.y = Math.PI / 2;
  holder.position.set((X0 + X1) / 2, HYw, HZ);
  // Collerette d'entrée (côté pistolet) : bord rabattu.
  const lip = S.plate(0.062, 0.062, 0.004, 'grey', { r: 0.004, cutouts: [[0, 0, 0.044, 0.044]] });
  lip.rotation.z = Math.PI / 2;
  lip.position.set(X0 - 0.002, HYw, HZ);
  P('7', S.merged([holder, lip], 'grey'), [0, 0, 0.12]);

  // ---------------------------------------------------------------- 10 / 13 — vis du support (selon -Z) et rondelles
  for (const xb of [X0 + 0.03, X1 - 0.03]) {
    const p = [xb, HYw + 0.02, HZ + 0.0254];
    P('13', orient(api, S.washer(0.0085, 0.005, 0.0024, 'zinc'), [p[0], p[1], p[2] + 0.0012], [0, 0, 1]), [0, 0, 0.2]);
    P('10', orient(api, S.bolt(0.375 * IN, 2.75 * IN, 'zinc'), [p[0], p[1], p[2] + 0.0024], [0, 0, 1]), [0, 0, 0.26]);
  }

  // ---------------------------------------------------------------- 6 — lance (P240) rangée dans le support
  // P240 : origine à la sortie du pistolet, +X vers la buse ; poignée de x = 0.025 à 0.28.
  const W = [X0 - 0.02, HYw, HZ];
  const E6 = [-0.25, 0, 0.12]; // éclaté de la lance, repris par ses raccords
  const withLance = (e) => e.map((v, i) => v + E6[i]);
  P('6', S.at(api.sub('P240'), W), E6);

  // ---------------------------------------------------------------- 9, 2, 1, 4, 3 — raccords rapides sous le pistolet
  // Entrée du pistolet (P240) : point (-0.2058, -0.129), axe (-0.479, -0.878).
  const d = [-0.479, -0.878, 0];
  const s0 = [W[0] - 0.2058, W[1] - 0.129, W[2]];
  const n9 = nptFitting(api, { npt: 6, end: 'npt', material: 'brass' });
  P('9', orient(api, n9.obj, s0, d), withLance(d.map((v) => v * 0.05)));
  const o9 = orientPoint(api, n9.out, s0, d);
  // 2 — coupleur femelle : corps six-pans taraudé, douille de verrouillage moletée.
  const qdF = S.group(S.merged([
    S.nut(0.019, 0.012, 'brass', { pos: [0, 0.006, 0] }),
    S.lathe([[0.006, 0.012], [0.0105, 0.012], [0.0105, 0.016], [0.0125, 0.017], [0.0125, 0.034], [0.0105, 0.036], [0.006, 0.036], [0.006, 0.012]], 'brass', { seg: 12 }),
  ], 'brass'));
  const p2 = o9.map((v, i) => v - d[i] * 0.008);
  P('2', orient(api, qdF, p2, d), withLance(d.map((v) => v * 0.09)));
  const p1 = p2.map((v, i) => v + d[i] * 0.026);
  // 1 — embout mâle : nez inséré dans le coupleur, six-pans, queue NPT femelle (flexible).
  const qdM = S.merged([
    S.lathe([[0, 0], [0.0055, 0], [0.0055, 0.01], [0.0045, 0.012], [0.0045, 0.014], [0.006, 0.016], [0, 0.016]].map(([r, y]) => [r, y]), 'steel', { seg: 16 }),
    S.nut(0.016, 0.01, 'steel', { pos: [0, 0.021, 0] }),
    S.lathe([[0, 0.026], [0.0068, 0.026], [0.0068, 0.04], [0, 0.04]], 'steel', { seg: 14 }),
  ], 'steel');
  P('1', orient(api, S.group(qdM), p1, d), withLance(d.map((v) => v * 0.13)));
  // 4 — bouchon antipoussière du coupleur (attache annulaire sur 2, languette, bouchon pendant).
  const tether = (ring, len, cap) => {
    const g = S.group(
      S.torus(ring, 0.0016, 'rubber'),
      S.box(len, 0.0016, 0.006, 'rubber', { pos: [ring + len / 2, 0, 0] }),
    );
    cap.position.set(ring + len + 0.006, -0.004, 0);
    g.add(cap);
    return g;
  };
  const plug4 = S.lathe([[0, 0], [0.0055, 0], [0.0055, 0.012], [0.009, 0.012], [0.009, 0.016], [0, 0.016]], 'rubber', { seg: 16 });
  P('4', orient(api, tether(0.0135, 0.04, plug4), p2.map((v, i) => v + d[i] * 0.018), d, [0, 0, 1]), withLance([0.02, -0.02, 0.06]));
  // 3 — capuchon de l'embout mâle.
  const cap3 = S.lathe([[0.0062, 0], [0.0085, 0], [0.0085, 0.018], [0, 0.018], [0, 0.016], [0.0062, 0.016], [0.0062, 0]], 'rubber', { seg: 16 });
  P('3', orient(api, tether(0.0095, 0.04, cap3), p1.map((v, i) => v + d[i] * 0.021), d, [0, 0, -1]), withLance([0.02, -0.04, -0.06]));

  return { view: { dir: [0.9, 0.55, 1.1] } };
}

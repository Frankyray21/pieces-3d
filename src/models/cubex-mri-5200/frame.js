// Châssis de foreuse (F08). Repère machine : X vers l'avant (mât), Y vers le
// haut, +Z côté droit. Le châssis s'étend de x = -2.25 (arrière) à 1.3.
// Flancs en tôle de 20 mm, échelle de traverses sous le plancher, avant
// incliné portant la glissière latérale du support d'actionneur rotatif.
import * as THREE from 'three';
import { kit, FLOOR } from './floor.js';

export const FRAME = {
  topY: 0.95,
  halfW: 0.44,
  actuator: { x: 1.55, y: 1.0 },
  flangeX: 1.84,
};

// Plan incliné de la glissière : point haut A, direction descendante u, normale n.
const TH = (32 * Math.PI) / 180;
const A = [0.96, 0.95];
const UU = [Math.cos(TH), -Math.sin(TH)];
const NN = [Math.sin(TH), Math.cos(TH)];
/** Point (x, y) à l'abscisse s le long de la pente et à la hauteur h au-dessus du plan. */
const inc = (s, h = 0) => [A[0] + s * UU[0] + h * NN[0], A[1] + s * UU[1] + h * NN[1]];
const U3 = new THREE.Vector3(UU[0], UU[1], 0);
const N3 = new THREE.Vector3(NN[0], NN[1], 0);
const nX = (k) => [NN[0] * k, NN[1] * k, 0];

const TOP = 0.89; // arête haute des flancs (traverses posées dessus jusqu'à 0.95)
const XC = [-2.18, -1.86, -1.55, ...FLOOR.boltX.map((x) => x - 0.21)]; // traverses

export function F08(api) {
  const K = kit(api);
  const { S, G } = K;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { halfW, actuator } = FRAME;
  const C = new THREE.Vector3(actuator.x, actuator.y, 0);

  /** Plaque posée sur la pente : z0..z1 × s0..s1, épaisseur t au-dessus de h0 ; trous [z, s, r]. */
  const incPlate = (z0, z1, s0, s1, h0, t, holes = []) => {
    const g = G.shape([[z0, s0], [z1, s0], [z1, s1], [z0, s1]], t, { holes, holeSeg: 10, bevel: t >= 0.015 ? 0.0015 : 0 });
    return G.frame(g, [...inc(0, h0 + t / 2), 0], [0, 0, 1], U3, N3);
  };

  // ------------------------------------------------------------- 4 — châssis
  const red = K.bag(), st = K.bag(), wd = K.bag();
  // Flancs : profil complet (arrière, échelle, pente avant, étrave), trous et lumières.
  const side = [
    [-2.25, TOP], [0.905, TOP], inc(0.495, -0.08), [1.365, 0.585], [1.37, 0.55], [1.33, 0.44], [1.29, 0.36],
    [1.245, 0.31], [1.19, 0.27], [1.02, 0.16], [0.98, 0.15], [-1.52, 0.15], [-1.56, 0.165], [-1.98, 0.3], [-2.25, 0.3],
  ];
  const sideHoles = [[-1.2, 0.31, 0.118], [0.75, 0.43, 0.075], [1.1, 0.7, 0.03], [-2.05, 0.78, 0.012], [-1.8, 0.78, 0.012], [-0.95, 0.8, 0.012], [0.2, 0.8, 0.012]];
  const drains = [-1.35, -0.25, 0.35].map((x) => [[x - 0.016, 0.172], [x + 0.016, 0.172], [x + 0.016, 0.192], [x - 0.016, 0.192]]);
  for (const s of [1, -1]) {
    red.add('red', G.xf(G.shape(side, 0.02, { holes: sideHoles, polys: drains, bevel: 0.0015, curve: 20 }), [0, 0, s * halfW]));
    // Demi-collier boulonné autour du passage du moteur de chenille (face extérieure).
    const arc = [];
    for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; arc.push([-1.2 + Math.cos(a) * 0.168, 0.31 + Math.sin(a) * 0.168]); }
    for (let i = 12; i >= 0; i--) { const a = (i / 12) * Math.PI; arc.push([-1.2 + Math.cos(a) * 0.122, 0.31 + Math.sin(a) * 0.122]); }
    red.add('red', G.xf(G.shape(arc, 0.015, { bevel: 0.002 }), [0, 0, s * (halfW + 0.0175)]));
    for (let i = 0; i < 5; i++) {
      const a = (i / 4) * Math.PI * 0.84 + Math.PI * 0.08;
      st.add('steel', K.boltGeo([-1.2 + Math.cos(a) * 0.145, 0.31 + Math.sin(a) * 0.145, s * (halfW + 0.025)], [0, 0, s], 0.012));
    }
    // Trappes de visite boulonnées.
    for (const x of [-0.5, 0.0]) {
      red.add('red', G.xf(G.box(x < -0.2 ? 0.36 : 0.28, 0.24, 0.006, 0.004), [x, 0.43, s * (halfW + 0.013)]));
      const w = x < -0.2 ? 0.16 : 0.12;
      for (const [dx, dy] of [[-w, -0.1], [0, -0.1], [w, -0.1], [-w, 0.1], [0, 0.1], [w, 0.1]]) {
        st.add('steel', K.boltGeo([x + dx, 0.43 + dy, s * (halfW + 0.016)], [0, 0, s], 0.009));
      }
    }
    // Oreille de remorquage arrière (bas des flancs).
    red.add('red', G.xf(G.shape([[-2.2, 0.3], [-2.2, 0.4], [-2.36, 0.4], [-2.41, 0.35], [-2.36, 0.3]], 0.03, { holes: [[-2.355, 0.35, 0.022]], bevel: 0.003 }), [0, 0, s * halfW]));
    // Arceau de protection du moteur de chenille (rond plein, face intérieure).
    const hoop = [];
    for (let i = 0; i <= 10; i++) { const a = -0.25 + (i / 10) * (Math.PI + 0.5); hoop.push([-1.2 + Math.cos(a) * 0.175, 0.31 + Math.sin(a) * 0.175, s * (halfW - 0.07)]); }
    red.add('red', K.bentTubeGeo([[hoop[0][0], hoop[0][1], s * (halfW - 0.01)], ...hoop, [hoop[10][0], hoop[10][1], s * (halfW - 0.01)]], 0.012, 0.03));
  }
  // Traverses supérieures : tubes rectangulaires posés sur les flancs, pattes d'extrémité, goussets.
  const rhs = G.shape(G.roundRect(0.1, 0.06, 0.006), 0.9, { polys: [G.roundRect(0.088, 0.048, 0.003).reverse()] });
  XC.forEach((x, i) => {
    red.add('red', rhs.clone().translate(x, 0.92, 0));
    for (const s of [1, -1]) {
      red.add('red', G.xf(G.box(0.1, 0.075, 0.006, 0.002), [x, 0.9125, s * (halfW + 0.013)]));
      wd.add('red', K.weldGeo([x - 0.05, TOP, s * (halfW - 0.01)], [x + 0.05, TOP, s * (halfW - 0.01)]));
    }
  });
  // Plaque arrière avec fourreaux carrés du panier, fourreaux.
  const rear = G.shape([[-0.43, 0.3], [0.43, 0.3], [0.43, TOP], [-0.43, TOP]], 0.02, {
    polys: [[0.35, 0.36], [-0.35, 0.36]].map(([z, y]) => [[z - 0.048, y - 0.048], [z + 0.048, y - 0.048], [z + 0.048, y + 0.048], [z - 0.048, y + 0.048]]),
    holes: [[0.15, 0.78, 0.035]],
    bevel: 0.0015,
  }).rotateY(-Math.PI / 2);
  red.add('red', rear.translate(-2.24, 0, 0));
  for (const z of [0.35, -0.35]) {
    red.add('red', G.shape(G.roundRect(0.096, 0.096, 0.006), 0.32, { polys: [G.roundRect(0.082, 0.082, 0.003).reverse()] }).rotateY(Math.PI / 2).translate(-2.11, 0.36, z));
  }
  for (const s of [1, -1]) wd.add('red', K.weldGeo([-2.23, 0.3, s * (halfW - 0.01)], [-2.23, TOP, s * (halfW - 0.01)]));
  // Avant incliné : poutres de glissière (tubes carrés 100 mm, bouts ouverts) et longerons.
  const sq = G.shape(G.roundRect(0.1, 0.1, 0.008), 1.22, { polys: [G.roundRect(0.084, 0.084, 0.004).reverse()] });
  for (const sc of [0.075, 0.445]) red.add('red', sq.clone().rotateZ(-TH).translate(...inc(sc, -0.05), 0));
  for (const s of [1, -1]) {
    const g = G.shape(G.roundRect(0.08, 0.08, 0.006), 0.27, { polys: [G.roundRect(0.066, 0.066, 0.003).reverse()] });
    red.add('red', G.frame(g, [...inc(0.26, -0.04), s * halfW], [0, 0, -1], N3, U3));
    wd.add('red', K.weldGeo([...inc(0.125, -0.0), s * (halfW + 0.04)], [...inc(0.125, -0.08), s * (halfW + 0.04)]));
    wd.add('red', K.weldGeo([...inc(0.395, -0.0), s * (halfW + 0.04)], [...inc(0.395, -0.08), s * (halfW + 0.04)]));
  }
  // Cloisons intérieures de l'avant (grand trou de passage du vérin de glissière).
  for (const s of [1, -1]) {
    red.add('red', G.xf(G.shape([inc(0.12, -0.1), inc(0.42, -0.1), [1.3, 0.42], [1.05, 0.32], [0.98, 0.5]], 0.012, { holes: [[1.1, 0.7, 0.085]], bevel: 0.001 }), [0, 0, s * 0.28]));
  }
  // Contreventement bas : tubes ronds, croix en V, berceaux du réservoir, barre d'étrave.
  for (const [x, yy] of [[-1.62, 0.235], [0.48, 0.215]]) red.add('red', G.xf(G.toAxis(G.cyl(0.035, 0.86, { seg: 20 }), 'z'), [x, yy, 0]));
  for (const s of [1, -1]) red.add('red', K.bentTubeGeo([[0.0, 0.2, s * 0.42], [0.85, 0.2, 0.0]], 0.025));
  red.add('red', G.xf(G.toAxis(G.cyl(0.035, 0.86, { seg: 20 }), 'z'), [1.2, 0.33, 0]));
  for (const x of [-0.9, -0.44]) {
    red.add('red', G.shape([[-0.04, 0], [0.04, 0], [0.04, 0.05], [0.032, 0.05], [0.032, 0.008], [-0.032, 0.008], [-0.032, 0.05], [-0.04, 0.05]], 0.86).translate(x, 0.15, 0));
  }
  const plateAll = red.group();
  st.build().forEach((m) => plateAll.add(m));
  // Goussets triangulaires sous les traverses (plan z-y, côté intérieur).
  const gus = K.bag();
  XC.forEach((x, i) => {
    if (i === 2) return;
    for (const s of [1, -1]) {
      const g = G.shape([[0, 0], [0.09, 0], [0, -0.09]], 0.01);
      if (s > 0) g.rotateY(Math.PI); // pointe vers -z (intérieur)
      gus.add('red', g.rotateY(-Math.PI / 2).translate(x, TOP, s * (halfW - 0.01)));
    }
  });
  gus.build().forEach((m) => plateAll.add(m));
  // Cordons de soudure complémentaires : fourreaux, oreilles, poutres de glissière, berceaux.
  for (const z of [0.35, -0.35]) for (const dy of [-0.048, 0.048]) wd.add('red', K.weldGeo([-2.228, 0.36 + dy, z - 0.048], [-2.228, 0.36 + dy, z + 0.048]));
  for (const s of [1, -1]) {
    wd.add('red', K.weldGeo([-2.25, 0.302, s * (halfW + 0.016)], [-2.2, 0.302, s * (halfW + 0.016)]));
    wd.add('red', K.weldGeo([-2.25, 0.398, s * (halfW + 0.016)], [-2.2, 0.398, s * (halfW + 0.016)]));
    for (const sc of [0.025, 0.125, 0.395, 0.495]) wd.add('red', K.weldGeo([...inc(sc, -0.002), s * (halfW - 0.01)], [...inc(sc, -0.002), s * (halfW + 0.01)]));
  }
  for (const x of [-0.9, -0.44]) for (const s of [1, -1]) wd.add('black', K.weldGeo([x - 0.008, 0.2, s * 0.17], [x + 0.008, 0.2, s * 0.17]));
  wd.build({ noEdges: true }).forEach((m) => plateAll.add(m));
  // Berceaux du réservoir d'air (noirs) sur les traverses basses.
  const cr = K.bag();
  const rcv = { x: -0.67, y: 0.52, r: 0.2 };
  for (const x of [-0.9, -0.44]) {
    const pts = [[-0.17, 0.2], [0.17, 0.2], [0.17, rcv.y - Math.sqrt(0.205 ** 2 - 0.17 ** 2)]];
    for (let i = 1; i < 12; i++) { const z = 0.17 - (i / 12) * 0.34; pts.push([z, rcv.y - Math.sqrt(0.205 ** 2 - z * z)]); }
    pts.push([-0.17, rcv.y - Math.sqrt(0.205 ** 2 - 0.17 ** 2)]);
    cr.add('black', G.shape(pts, 0.014).rotateY(-Math.PI / 2).translate(x, 0, 0));
  }
  cr.build().forEach((m) => plateAll.add(m));
  P('4', plateAll, [0, 0, 0]);

  // ------------------------------------- glissière : 29 usure, 28 entretoise, 27 cale, 26 retenue
  const boltZ = Array.from({ length: 11 }, (_, i) => -0.55 + i * 0.11);
  const rails = [
    { s: [0.025, 0.125], sp: [0.025, 0.06], sh: [0.064, 0.115], kp: [0.025, 0.115], bs: 0.0425 },
    { s: [0.395, 0.495], sp: [0.46, 0.495], sh: [0.405, 0.456], kp: [0.405, 0.495], bs: 0.4775 },
  ];
  for (const r of rails) {
    const holes = boltZ.map((z) => [z, r.bs, 0.0085]);
    P('29', K.bag().add('steel', incPlate(-0.61, 0.61, r.s[0], r.s[1], 0, 0.012, holes)).group(), nX(0.16));
    P('28', K.bag().add('red', incPlate(-0.61, 0.61, r.sp[0], r.sp[1], 0.012, 0.019, holes)).group(), nX(0.3));
    P('27', K.bag().add('darkSteel', incPlate(-0.61, 0.61, r.sh[0], r.sh[1], 0.028, 0.003)).group(), nX(0.42));
    const kp = K.bag().add('red', incPlate(-0.61, 0.61, r.kp[0], r.kp[1], 0.031, 0.02, holes));
    for (const z of boltZ) kp.add('steel', K.boltGeo([...inc(r.bs, 0.051), z], N3, 0.014));
    P('26', kp.group(), nX(0.55));
  }

  // ------------------------------------------------ 25 — support coulissant (noir)
  const sup = K.bag(), supS = K.bag();
  sup.add('black', incPlate(-0.35, 0.35, 0.065, 0.455, 0.012, 0.016));
  const hull2 = (pts) => hull(pts);
  const circ = (cx, cy, r, n = 16) => Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * r]);
  for (const s of [1, -1]) {
    // Joues : de la semelle jusqu'aux bossages des tourillons.
    const cheek = hull2([inc(0.1, 0.028), inc(0.44, 0.028), [1.47, 0.86], ...circ(C.x, C.y, 0.09)]);
    sup.add('black', G.xf(G.shape(cheek, 0.03, { holes: [[C.x, C.y, 0.062]], bevel: 0.002 }), [0, 0, s * 0.22]));
    sup.add('black', G.xf(G.toAxis(G.ring(0.092, 0.062, 0.05, 32), 'z'), [C.x, C.y, s * 0.22]));
    // Chapes basses des vérins de bascule.
    for (const e of [-1, 1]) {
      const ear = hull2([inc(0.33, 0.028), inc(0.47, 0.028), ...circ(...inc(0.4, 0.09), 0.034)]);
      sup.add('black', G.xf(G.shape(ear, 0.012, { holes: [[...inc(0.4, 0.09), 0.017]], bevel: 0.0015 }), [0, 0, s * 0.31 + e * 0.022]));
    }
  }
  // Raidisseurs entre joues, patte du vérin de glissière.
  const stiff = (p0, p1, w) => {
    const d = [p1[0] - p0[0], p1[1] - p0[1]], L = Math.hypot(...d);
    return G.xf(G.box(L, 0.02, w, 0.004), [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, 0], [0, 0, Math.atan2(d[1], d[0])]);
  };
  sup.add('black', stiff(inc(0.44, 0.04), [1.47, 0.85], 0.41));
  sup.add('black', stiff(inc(0.1, 0.04), [1.4, 1.065], 0.41));
  sup.add('black', G.frame(G.shape([[-0.04, 0.012], [0.04, 0.012], [0.04, -0.07], [-0.04, -0.07]], 0.03), [...inc(0.251, 0), 0], U3, N3, [0, 0, 1]));
  sup.add('black', G.xf(G.toAxis(G.ring(0.078, 0.066, 0.06, 28), 'z'), [1.1, 0.7, 0]));
  for (const s of [1, -1]) supS.add('steel', K.boltGeo([1.1, 0.7 + 0.072, s * 0.02], [0, 1, 0], 0.01, { washer: false }));
  P('25', group2(sup, supS), [0.42, 0.68, 0]);

  // ------------------------------------------------ 15 — actionneur rotatif
  const ra = K.bag(), raS = K.bag();
  ra.add('red', G.xf(G.box(0.24, 0.27, 0.3, 0.012), [C.x, C.y, 0]));
  for (const sy of [1, -1]) {
    ra.add('red', G.xf(G.box(0.26, 0.035, 0.32, 0.006), [C.x, C.y + sy * 0.12, 0]));
    for (const z of [0.065, -0.065]) ra.add('red', G.xf(G.cyl(0.058, 0.215, { seg: 32 }), [C.x, C.y + sy * 0.2525, z]));
    ra.add('red', G.xf(G.box(0.15, 0.065, 0.27, 0.01), [C.x, C.y + sy * 0.3925, 0]));
    // Tirants et écrous.
    for (const dx of [-0.065, 0.065]) {
      for (const z of [-0.12, 0, 0.12]) {
        raS.add('steel', G.xf(G.cyl(0.008, 0.25, { seg: 10 }), [C.x + dx, C.y + sy * 0.26, z]));
        raS.add('steel', K.boltGeo([C.x + dx, C.y + sy * 0.425, z], [0, sy, 0], 0.016, { washer: false, nut: true, stud: 0.008 }));
      }
    }
    // Orifices d'alimentation (coudes) sur les chapeaux.
    raS.add('steel', S.at(S.fitting(0.024, 0.05, 'steel', { axis: sy > 0 ? 'y' : '-y', elbow: true }), [C.x - 0.035, C.y + sy * 0.445, 0.07]));
  }
  // Tourillon traversant (axe Z), rondelles d'arrêt ; moyeu de sortie (axe X).
  raS.add('steel', G.xf(G.toAxis(G.cyl(0.05, 0.72, { seg: 28 }), 'z'), [C.x, C.y, 0]));
  for (const s of [1, -1]) {
    raS.add('steel', G.xf(G.toAxis(G.cyl(0.058, 0.01), 'z'), [C.x, C.y, s * 0.365]));
    raS.add('steel', K.boltGeo([C.x, C.y, s * 0.37], [0, 0, s], 0.016));
  }
  ra.add('red', G.xf(G.toAxis(G.cyl(0.092, 0.02, { seg: 32 }), 'x'), [1.68, C.y, 0]));
  ra.add('red', G.xf(G.toAxis(G.cyl(0.076, 0.11, { seg: 32 }), 'x'), [1.745, C.y, 0]));
  ra.add('lightGrey', G.xf(G.box(0.003, 0.06, 0.1), [1.4285, C.y + 0.02, 0]));
  P('15', group2(ra, raS), [0.35, 1.25, 0]);

  // 22 — demi-brides de retenue ; 23 — bride de montage du mât (face x = 1.84)
  for (const sy of [1, -1]) {
    const pts = [];
    for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI; pts.push([Math.cos(a) * 0.125, sy * Math.sin(a) * 0.125]); }
    for (let i = 16; i >= 0; i--) { const a = (i / 16) * Math.PI; pts.push([Math.cos(a) * 0.078, sy * Math.sin(a) * 0.078]); }
    const h = K.bag().add('red', G.shape(pts, 0.035, { holes: [-0.6, 0, 0.6].map((k) => { const a = Math.PI / 2 + k; return [Math.cos(a) * 0.1, sy * Math.sin(a) * 0.1, 0.009]; }), bevel: 0.002 }).rotateY(Math.PI / 2).translate(1.7825, C.y, 0));
    for (const k of [-0.6, 0, 0.6]) { const a = Math.PI / 2 + k; h.add('steel', K.boltGeo([1.765, C.y + sy * Math.sin(a) * 0.1, -Math.cos(a) * 0.1], [-1, 0, 0], 0.014)); }
    P('22', h.group(), [0.62, 1.25 + sy * 0.22, 0]);
  }
  const fl = K.bag();
  const disc = Array.from({ length: 56 }, (_, i) => { const a = (i / 56) * Math.PI * 2; return [Math.cos(a) * 0.17, Math.sin(a) * 0.17]; });
  const bore = Array.from({ length: 32 }, (_, i) => { const a = -(i / 32) * Math.PI * 2; return [Math.cos(a) * 0.045, Math.sin(a) * 0.045]; });
  fl.add('red', G.shape(disc, 0.04, { polys: [bore], holes: Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2 + 0.26; return [Math.cos(a) * 0.138, Math.sin(a) * 0.138, 0.011]; }), bevel: 0.0025, curve: 24 }).rotateY(Math.PI / 2).translate(1.82, C.y, 0));
  fl.add('red', G.xf(G.toAxis(G.ring(0.11, 0.078, 0.02, 40), 'x'), [1.79, C.y, 0]));
  P('23', fl.group(), [0.88, 1.25, 0]);

  // ------------------- 17 leviers, 18 bagues, 24 vérins de bascule, 16 axes, 14 valves d'équilibrage
  const lv = [-0.5 * 0.22, 0.866 * 0.22]; // bout de levier relatif au centre (vers l'arrière, en haut)
  const Lp = inc(0.4, 0.09), Up = [C.x + lv[0], C.y + lv[1]];
  for (const s of [1, -1]) {
    const z = s * 0.31;
    const lb = K.bag(), ls = K.bag();
    const body = hull([...circ(C.x, C.y, 0.08, 20), ...circ(C.x + lv[0] * 0.62, C.y + lv[1] * 0.62, 0.05, 12)]);
    lb.add('red', G.xf(G.shape(body, 0.06, { holes: [[C.x, C.y, 0.05]], bevel: 0.003 }), [0, 0, z]));
    const ear = hull([...circ(C.x + lv[0] * 0.55, C.y + lv[1] * 0.55, 0.045, 12), ...circ(Up[0], Up[1], 0.036, 14)]);
    for (const e of [-1, 1]) lb.add('red', G.xf(G.shape(ear, 0.014, { holes: [[Up[0], Up[1], 0.017]], bevel: 0.002 }), [0, 0, z + e * 0.022]));
    // Bossage et vis de serrage du collier.
    lb.add('red', G.xf(G.box(0.05, 0.04, 0.06, 0.006), [C.x + 0.085, C.y - 0.02, z]));
    ls.add('steel', K.boltGeo([C.x + 0.085, C.y + 0.0, z], [0, 1, 0], 0.014));
    P('17', group2(lb, ls), [0.35, 1.25, s * 0.36]);
    P('18', K.bag().add('brass', G.xf(G.toAxis(G.ring(0.062, 0.05, 0.06, 32), 'z'), [C.x, C.y, s * 0.22])).group(), [0.42, 0.68, s * 0.22]);
    // Vérin de bascule : œil de fond sur la chape basse, œil de tige au levier.
    const d = [Up[0] - Lp[0], Up[1] - Lp[1]], D = Math.hypot(...d), r = 0.035, rodR = 0.0193;
    const cyl = S.hydCylinder(D - 0.6 * r - 0.9 * rodR, r * 2, { ext: 0.42 });
    const ang = Math.atan2(d[1], d[0]);
    cyl.rotation.z = ang;
    cyl.position.set(Lp[0] + Math.cos(ang) * 0.6 * r, Lp[1] + Math.sin(ang) * 0.6 * r, z);
    P('24', cyl, [0.42, 0.68, s * 0.45]);
    for (const [pt, e] of [[Lp, [0.42, 0.68, s * 0.78]], [Up, [0.35, 1.25, s * 0.78]]]) {
      const pin = K.bag().add('steel', [G.xf(G.toAxis(G.cyl(0.016, 0.1, { seg: 16 }), 'z'), [pt[0], pt[1], z]), G.xf(G.toAxis(G.cyl(0.024, 0.008, { seg: 16 }), 'z'), [pt[0], pt[1], z + s * 0.052])]);
      pin.add('steel', G.xf(G.toAxis(G.torus(0.008, 0.002, 12, 6), 'x'), [pt[0], pt[1], z - s * 0.047]));
      P('16', pin.group(), e);
    }
    // Valve d'équilibrage bridée sur le fût du vérin (face extérieure).
    const vb = K.bag();
    const vp = [Lp[0] + Math.cos(ang) * 0.1, Lp[1] + Math.sin(ang) * 0.1];
    vb.add('grey', G.xf(G.box(0.07, 0.05, 0.04, 0.005), [vp[0], vp[1], z + s * 0.058], [0, 0, ang]));
    for (const k of [-1, 1]) vb.add('steel', G.xf(G.toAxis(G.hex(0.018, 0.01), s > 0 ? 'z' : '-z'), [vp[0] + Math.cos(ang) * k * 0.022, vp[1] + Math.sin(ang) * k * 0.022, z + s * 0.083]));
    vb.add('steel', G.xf(G.toAxis(G.hex(0.022, 0.012), 'y'), [vp[0] - Math.sin(ang) * 0.03, vp[1] + Math.cos(ang) * 0.03, z + s * 0.058]));
    P('14', vb.group(), [0.42, 0.68, s * 0.62]);
  }

  // ----------------------- 1 — vérin de glissière à double tige (axe Z), 2 rondelles, 3 écrous
  const so = new THREE.Group();
  so.add(S.at(S.shell(0.06, 0.05, 0.42, 'red', { axis: 'z', seg: 32 }), [1.1, 0.7, 0]));
  const sob = K.bag();
  for (const s of [1, -1]) {
    sob.add('red', G.xf(G.toAxis(G.lathe([[0.026, 0], [0.068, 0], [0.068, 0.04], [0.06, 0.048], [0.034, 0.048], [0.034, 0.062], [0.026, 0.062], [0.026, 0]], 32), s > 0 ? 'z' : '-z'), [1.1, 0.7, s * 0.21]));
    sob.add('steel', S.at(S.fitting(0.02, 0.045, 'steel', { elbow: true }), [1.1, 0.7 + 0.075, s * 0.235]));
  }
  sob.add('chrome', G.xf(G.toAxis(G.cyl(0.025, 0.9, { seg: 24 }), 'z'), [1.1, 0.7, 0]));
  for (const s of [1, -1]) sob.add('steel', G.xf(G.toAxis(G.lathe([[0, 0], [0.024, 0], [0.024, 0.06], [0.021, 0.064], [0, 0.064]], 16), s > 0 ? 'z' : '-z'), [1.1, 0.7, s * 0.45]));
  sob.add('darkSteel', G.xf(G.toAxis(G.cyl(0.049, 0.06, { seg: 28 }), 'z'), [1.1, 0.7, 0]));
  sob.build().forEach((m) => so.add(m));
  so.userData.hasInterior = true;
  P('1', so, [0.55, -0.35, 0]);
  for (const s of [1, -1]) {
    P('2', K.bag().add('steel', G.xf(G.toAxis(G.ring(0.05, 0.027, 0.012, 28), 'z'), [1.1, 0.7, s * (halfW + 0.016)])).group(), [0.55, -0.35, s * 0.25]);
    P('3', K.bag().add('steel', G.xf(G.toAxis(G.hex(0.046, 0.026), 'z'), [1.1, 0.7, s * (halfW + 0.035)])).group(), [0.55, -0.35, s * 0.36]);
  }

  // ------------------------------- 12 — réservoir d'air (axe X) et ses raccords 8 à 11
  const rv = new THREE.Group();
  rv.add(S.at(S.shell(rcv.r, rcv.r - 0.008, 0.6, 'black', { axis: 'x', seg: 40 }), [rcv.x, rcv.y, 0]));
  const rb = K.bag(), rs = K.bag();
  const head = [[rcv.r, 0], [0.197, 0.025, 1], [0.183, 0.05, 1], [0.152, 0.068, 1], [0.1, 0.081, 1], [0.05, 0.087, 1], [0, 0.089], [0, 0.081], [0.05, 0.079, 1], [0.098, 0.073, 1], [0.146, 0.06, 1], [0.176, 0.043, 1], [0.19, 0.02, 1], [rcv.r - 0.008, 0], [rcv.r, 0]];
  rb.add('black', G.xf(G.toAxis(G.lathe(head, 40), 'x'), [rcv.x + 0.3, rcv.y, 0]));
  rb.add('black', G.xf(G.toAxis(G.lathe(head, 40), '-x'), [rcv.x - 0.3, rcv.y, 0]));
  // Cordons de soudure circulaires (fonds), bossages, plaque signalétique, colliers.
  for (const sx of [1, -1]) rb.add('black', G.xf(G.toAxis(G.torus(rcv.r + 0.001, 0.004, 48, 6), 'x'), [rcv.x + sx * 0.3, rcv.y, 0]));
  rb.add('black', G.xf(G.toAxis(G.cyl(0.032, 0.05), 'x'), [rcv.x + 0.39, rcv.y, 0]));
  rb.add('black', G.xf(G.toAxis(G.cyl(0.032, 0.05), '-x'), [rcv.x - 0.39, rcv.y + 0.06, 0]));
  const bungs = [[-0.95, -0.075, 0.034], [-0.72, 0.06, 0.03], [-0.55, 0.0, 0.016], [-0.45, 0.0, 0.016], [-0.62, 0.0, 0.016]];
  for (const [x, z, r] of bungs.slice(0, 2)) rb.add('black', G.xf(G.cyl(r, 0.03), [x, rcv.y + Math.sqrt(rcv.r ** 2 - z * z) + 0.008, z]));
  for (const [x] of bungs.slice(2)) {
    const a = Math.PI / 4;
    rb.add('black', G.aim(G.cyl(0.018, 0.02), [x, rcv.y + Math.sin(a) * 0.205, Math.cos(a) * 0.205], [0, Math.sin(a), Math.cos(a)]));
    rs.add('steel', G.aim(G.hex(0.022, 0.01), [x, rcv.y + Math.sin(a) * 0.22, Math.cos(a) * 0.22], [0, Math.sin(a), Math.cos(a)]));
  }
  // Purge en point bas : mamelon et petite vanne à bille.
  rs.add('steel', G.xf(G.toAxis(G.hex(0.03, 0.012), '-y'), [-0.5, rcv.y - 0.212, 0]));
  rv.add(S.at(S.ballValve(0.018, 'brass', { axis: 'y' }), [-0.5, rcv.y - 0.25, 0]));
  rs.add('lightGrey', G.xf(G.box(0.12, 0.002, 0.07), [-0.6, rcv.y + rcv.r + 0.001, -0.02], [0.0, 0, 0]));
  for (const x of [-0.9, -0.44]) rs.add('steel', G.xf(G.toAxis(G.ring(0.209, 0.201, 0.035, 48), 'x'), [x, rcv.y, 0]));
  rs.add('steel', G.xf(G.toAxis(G.hex(0.07, 0.022), 'x'), [rcv.x + 0.425, rcv.y, 0]));
  rs.add('steel', G.xf(G.toAxis(G.hex(0.07, 0.022), '-x'), [rcv.x - 0.425, rcv.y + 0.06, 0]));
  rb.build().forEach((m) => rv.add(m));
  rs.build().forEach((m) => rv.add(m));
  rv.userData.hasInterior = true;
  P('12', rv, [0, 1.0, 0]);
  const bTop = (x, z) => rcv.y + Math.sqrt(rcv.r ** 2 - z * z) + 0.023;
  // 9 — mamelon six-pans sous le collecteur ; 10 — réduction sous la soupape.
  const nipple = (x, z, y0, af, hlen) => K.bag().add('steel', [
    G.xf(G.cyl(af * 0.38, hlen, { seg: 14 }), [x, y0 + hlen / 2, z]),
    G.xf(G.hex(af, af * 0.45), [x, y0 + hlen * 0.45, z]),
  ]).group();
  P('9', nipple(-0.95, -0.075, bTop(-0.95, -0.075), 0.05, 0.06), [0, 1.3, 0]);
  P('10', nipple(-0.72, 0.06, bTop(-0.72, 0.06), 0.046, 0.045), [0, 1.3, 0]);
  // 8 — collecteur d'échappement du surpresseur (bloc gris, orifices).
  const y8 = bTop(-0.95, -0.075) + 0.06;
  const mb = K.bag();
  mb.add('grey', G.xf(G.box(0.11, 0.08, 0.09, 0.012), [-0.95, y8 + 0.04, -0.075]));
  mb.add('darkSteel', [G.xf(G.toAxis(G.cyl(0.022, 0.004), 'x'), [-0.894, y8 + 0.04, -0.075]), G.xf(G.toAxis(G.cyl(0.016, 0.004), 'z'), [-0.95, y8 + 0.04, -0.029])]);
  mb.add('steel', G.xf(G.cyl(0.026, 0.006), [-0.95, y8 + 0.083, -0.075]));
  P('8', mb.group(), [0, 1.62, 0]);
  // 11 — soupape de sûreté (laiton) : six-pans, corps, chapeau, anneau d'essai, sortie latérale.
  const y11 = bTop(-0.72, 0.06) + 0.045;
  const sv = K.bag();
  sv.add('brass', [
    G.xf(G.hex(0.036, 0.014), [-0.72, y11 + 0.007, 0.06]),
    G.xf(G.lathe([[0, 0], [0.019, 0], [0.019, 0.04, 1], [0.016, 0.055], [0.012, 0.075], [0.012, 0.09], [0.008, 0.095], [0, 0.095]], 20), [-0.72, y11 + 0.014, 0.06]),
    G.xf(G.toAxis(G.cyl(0.011, 0.03), 'x'), [-0.7, y11 + 0.04, 0.06]),
  ]);
  sv.add('steel', [G.xf(G.toAxis(G.torus(0.012, 0.0025, 16, 6), 'z'), [-0.72, y11 + 0.118, 0.06]), G.xf(G.cyl(0.003, 0.02, { seg: 6 }), [-0.72, y11 + 0.103, 0.06])]);
  P('11', sv.group(), [0, 1.62, 0]);

  // ---------------- 13 — refroidisseur final (faisceau à ailettes), 7 — boyaux tressés 2"
  const ac = K.bag(), acF = K.bag(), acS = K.bag();
  const ax0 = 0.48, az0 = -0.2, ay0 = 0.62;
  for (const sy of [1, -1]) ac.add('black', G.xf(G.box(0.13, 0.055, 0.34, 0.014), [ax0, ay0 + sy * 0.2025, az0]));
  for (const sz of [1, -1]) ac.add('black', G.xf(G.box(0.12, 0.35, 0.012, 0.003), [ax0, ay0, az0 + sz * 0.164]));
  ac.add('darkSteel', G.xf(G.box(0.1, 0.35, 0.316), [ax0, ay0, az0]));
  for (let i = 0; i < 30; i++) acF.add('black', G.xf(new THREE.BoxGeometry(0.114, 0.003, 0.316), [ax0, ay0 - 0.17 + i * 0.0117, az0]));
  ac.add('black', G.xf(G.toAxis(G.cyl(0.03, 0.04), '-x'), [ax0 - 0.08, ay0 - 0.2, az0 + 0.06]));
  ac.add('black', G.xf(G.toAxis(G.cyl(0.03, 0.04), 'x'), [ax0 + 0.08, ay0 + 0.2, az0 - 0.06]));
  acS.add('steel', [G.xf(G.toAxis(G.hex(0.065, 0.02), '-x'), [ax0 - 0.11, ay0 - 0.2, az0 + 0.06]), G.xf(G.toAxis(G.hex(0.065, 0.02), 'x'), [ax0 + 0.11, ay0 + 0.2, az0 - 0.06])]);
  // Pattes de fixation sur le tube bas.
  for (const sz of [1, -1]) {
    ac.add('black', G.xf(G.box(0.04, 0.17, 0.008, 0.002), [ax0, 0.315, az0 + sz * 0.12]));
    acS.add('steel', K.boltGeo([ax0, 0.255, az0 + sz * 0.124], [0, 0, sz], 0.01));
  }
  const acG = ac.group();
  acF.build({ noEdges: true }).forEach((m) => acG.add(m));
  acS.build().forEach((m) => acG.add(m));
  P('13', acG, [0.15, 0.95, -0.15]);
  P('7', K.hose([rcv.x + 0.436, rcv.y, 0], [1, 0, 0], [ax0 - 0.121, ay0 - 0.2, az0 + 0.06], [-1, 0, 0], [], 0.03), [0.12, 0.72, -0.08]);
  P('7', K.hose([rcv.x - 0.436, rcv.y + 0.06, 0], [-1, 0, 0], [-1.885, 0.78, 0.15], [1, 0, 0], [[-1.5, 0.69, 0.07]], 0.03), [0, 0.78, 0.16]);

  // ------------------- arrière : 5 vanne 2" HP + tube de sortie, 6 bloc de serrage (collier bleu)
  const v5 = new THREE.Group();
  v5.add(S.at(S.ballValve(0.06, 'brass', { axis: 'x' }), [-1.95, 0.78, 0.15]));
  v5.add(K.bag().add('steel', [G.xf(G.toAxis(G.cyl(0.03, 0.27, { seg: 20 }), 'x'), [-2.135, 0.78, 0.15]), G.xf(G.toAxis(G.hex(0.085, 0.024), 'x'), [-2.262, 0.78, 0.15])]).group());
  P('5', v5, [0, 0.5, 0.3]);
  const cl = K.bag();
  for (const sy of [1, -1]) cl.add('blue', G.shape([[-0.035, 0], [-0.031, 0], ...Array.from({ length: 9 }, (_, i) => { const a = Math.PI - (i / 8) * Math.PI; return [Math.cos(a) * 0.031, Math.sin(a) * 0.031]; }).slice(1, 8), [0.031, 0], [0.035, 0], [0.035, 0.05], [-0.035, 0.05]].map(([u, v]) => [u, sy * v]), 0.05, { bevel: 0.003 }).rotateY(Math.PI / 2).translate(-2.15, 0.78, 0.15));
  cl.add('rubber', G.xf(G.toAxis(G.ring(0.031, 0.03, 0.05, 24), 'x'), [-2.15, 0.78, 0.15]));
  cl.add('steel', G.xf(G.box(0.05, 0.006, 0.08, 0.002), [-2.15, 0.833, 0.15]));
  for (const s of [1, -1]) cl.add('steel', K.boltGeo([-2.15, 0.836, 0.15 + s * 0.026], [0, 1, 0], 0.008, { stud: 0.0 }));
  cl.add('red', G.xf(G.box(0.11, 0.006, 0.09, 0.002), [-2.175, 0.727, 0.15]));
  cl.add('red', G.xf(G.shape([[-2.23, 0.724], [-2.15, 0.724], [-2.23, 0.66]], 0.006), [0, 0, 0.15]));
  P('6', cl.group(), [-0.15, 0.62, 0]);

  // ---------- 19 / 20 cloisons de raccords, 21 support (avant gauche, sur le longeron incliné)
  const sp21 = K.bag();
  const legA = inc(0.16, -0.04), legB = inc(0.36, -0.04);
  for (const lg of [legA, legB]) sp21.add('red', G.xf(G.box(0.04, 1.15 - lg[1], 0.01, 0.002), [lg[0], (1.12 + lg[1] - 0.03) / 2, -(halfW + 0.045)]));
  sp21.add('red', G.xf(G.box(legB[0] - legA[0] + 0.04, 0.03, 0.01, 0.002), [(legA[0] + legB[0]) / 2, 1.105, -(halfW + 0.045)]));
  P('21', sp21.group(), [0, 0.32, -0.32]);
  for (const [ref, yy] of [['19', 1.065], ['20', 0.985]]) {
    const xs = [legA[0] + 0.035, legA[0] + 0.1, legB[0] - 0.1, legB[0] - 0.035];
    const pb = K.bag().add('red', G.xf(G.shape(G.roundRect(legB[0] - legA[0] + 0.1, 0.065, 0.008), 0.008, { holes: xs.map((x) => [x - (legA[0] + legB[0]) / 2, 0, 0.012]) }), [(legA[0] + legB[0]) / 2, yy, -(halfW + 0.054)]));
    for (const x of xs) {
      pb.add('steel', G.xf(G.toAxis(G.hex(0.026, 0.01), '-z'), [x, yy, -(halfW + 0.063)]));
      pb.add('steel', G.xf(G.toAxis(G.cyl(0.009, 0.06, { seg: 12 }), 'z'), [x, yy, -(halfW + 0.06)]));
      pb.add('steel', G.xf(G.toAxis(G.hex(0.026, 0.01), 'z'), [x, yy, -(halfW + 0.035)]));
    }
    P(ref, pb.group(), [0, 0.32, -0.5]);
  }

  // ---------- 30 raccords coudés, 31 adaptateurs, 32 vannes 1/2", 33 vanne 3/4" (flanc gauche, arrière)
  const zv = -(halfW + 0.06);
  [-2.15, -2.07, -1.99].forEach((x, i) => {
    P('30', S.at(S.fitting(0.022, 0.05, 'steel', { elbow: true }), [x, 0.71, zv]), [0, 0.2, -0.3]);
    P('31', S.at(S.fitting(0.026, 0.05, 'steel'), [x, 0.672, zv]), [0, 0.05, -0.3]);
    const bv = S.ballValve(i < 2 ? 0.026 : 0.032, 'brass', { axis: 'y', handle: 'green' });
    bv.position.set(x, 0.6, zv);
    bv.rotation.y = Math.PI / 2;
    P(i < 2 ? '32' : '33', bv, [0, -0.15, -0.3]);
  });

  return { view: { dir: [0.85, 0.7, 1.05] } };

  function group2(a, b) {
    const g = a.group();
    b.build().forEach((m) => g.add(m));
    return g;
  }
}

/** Enveloppe convexe d'un nuage de points 2D. */
function hull(points) {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

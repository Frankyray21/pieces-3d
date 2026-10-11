// P046 — Support de traversée V30 : CX031683 rév. 3 « ASSY, V30 BULKHEAD
// BRACKET » (pages 46-47), repère de l'avance P032. Potence mécano-soudée (4,
// « BRACKET, 6245 V30 HOSE LOOP ») boulonnée par sa platine verticale (quatre
// vis H 3/4-10 × 1 3/4 (14), Nord-Lock SP (17)) sur la plaque porte-tête
// (tête 6245) : deux flasques à bord supérieur cintré et lumières, plancher
// percé de six trous qui reçoivent les coudes de traversée JIC (6 = -06,
// 7 = -08 avec bouchon 9, 8 = -12 ×4, coudes sous le plancher, sorties vers
// le bout de la potence), aile de bout en équerre qui porte le support
// d'émerillon (2) : semelle boulonnée (deux vis 1/2-13 × 1 3/4 (13), Nord-Lock
// SP (16), écrous (18)), âme et manchon Ø 3 1/2 po d'axe Z. Dans le manchon :
// adaptateur droit 2 po (10) côté +Z, raccord 2 po FNPT-MNPT (11) côté −Z, qui
// serre la platine d'attache anti-fouet (3, deux manilles) contre le manchon,
// puis l'émerillon d'air 2 po coudé à 90° (1, sortie vers −X). Plaque
// d'arrêt d'émerillon (5, fourche, tête 6245 seulement) sur l'aile haute de
// la platine (deux vis 13, Nord-Lock 16, écrous 18). Deux vis de butée 1/2-13
// × 1 1/4 filetées (12), rondelle Nord-Lock (15) et contre-écrou (19), dans le
// bossage taraudé du plancher, côté bout.
// Repère : origine au centre de la face d'appui de la platine (face +X,
// contre la plaque porte-tête), Y vers le haut (Y = 0 au niveau du dessus du
// plancher), X le long de la potence (bout vers −X), Z en travers.
// Encombrement ≈ 0.80 (X, de −0.80 à 0) × 0.40 (Y, de −0.17 à 0.23) × 0.32 (Z) m.
// Cotes : visserie (liste), émerillon 2 po ; tôles et longueurs d'après les
// proportions de la page 46 (manchon Ø 3 1/2 po pour l'échelle).
import { IN, place, hhcs, hexNut, nordLock, bulkheadElbow, capNut, seat } from './_avance_a.js';

const L = 0.62; // longueur de la potence (platine → aile de bout)
const TP = 0.5 * IN; // platine
const TS = 0.375 * IN; // flasques et plancher
const ZS = 0.115; // plan médian des flasques
const YE = 0.065; // dessus de l'aile de bout

export default function P046(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, extrude, merged, group, at, weld, torus } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Extrusion selon Z d'un contour [[x, y]] centré en z.
  const slabZ = (pts, z, t, mat, holes = []) => extrude(pts, t, mat, { holes }).translateZ(z);
  // Extrusion selon Y (tôle horizontale) d'un contour [[x, z]], dessus en y.
  const slabY = (pts, y, t, mat, holes = []) => {
    const m = extrude(pts.map(([x, z]) => [x, -z]), t, mat, { holes: holes.map(([x, z, r]) => [x, -z, r]) });
    m.rotation.x = -Math.PI / 2;
    m.position.y = y - t / 2;
    return m;
  };
  // Extrusion selon X (tôle verticale en travers) d'un contour [[z, y]], face en x.
  const slabX = (pts, x, t, mat, holes = []) => {
    const m = extrude(pts.map(([z, y]) => [-z, y]).reverse(), t, mat, { holes: holes.map(([z, y, r]) => [-z, y, r]) });
    m.rotation.y = Math.PI / 2;
    m.position.x = x;
    return m;
  };

  // ------------------------------------------------------------- 4 — potence
  const plates = [];
  // Platine : 0.26 × 0.36, aile haute horizontale vers −X (reçoit la plaque 5).
  const bolts14 = [[0.13, -0.075], [0.13, 0.075], [-0.12, -0.075], [-0.12, 0.075]];
  plates.push(slabX([[-0.13, -0.17], [0.13, -0.17], [0.13, 0.19], [-0.13, 0.19]], -TP / 2, TP, 'grey', bolts14.map(([y, z]) => [z, y, (13 / 32) * IN])));
  plates.push(slabY([[-0.1, -0.13], [-TP, -0.13], [-TP, 0.13], [-0.1, 0.13]], 0.19 + TS, TS, 'grey', [[-0.06, -0.085, 0.0071], [-0.06, 0.085, 0.0071]]));
  // Flasques : bord supérieur cintré (haut contre la platine, bas au milieu),
  // bas droit sous le plancher, lumière oblongue.
  const prof = [];
  for (let i = 0; i <= 16; i++) {
    const x = -L + (i / 16) * (L - TP);
    const u = (x + L) / (L - TP);
    prof.push([x, YE - 0.012 + 0.19 * Math.pow(u, 2.6)]);
  }
  const side = [[-TP, -TS - 0.03], [-L, -TS - 0.03], ...prof];
  const slot = (x0, x1, y, r) => {
    const pts = [];
    for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + (i / 8) * Math.PI; pts.push([x1 + Math.cos(a) * r, y + Math.sin(a) * r]); }
    for (let i = 0; i <= 8; i++) { const a = Math.PI / 2 + (i / 8) * Math.PI; pts.push([x0 + Math.cos(a) * r, y + Math.sin(a) * r]); }
    return pts;
  };
  for (const s of [-1, 1]) {
    const m = extrude(side, TS, 'grey');
    // Lumière : découpe figurée par une tôle percée (contour + trou oblong).
    const shape = new THREE.Shape(side.map(([x, y]) => new THREE.Vector2(x, y)));
    shape.holes.push(new THREE.Path(slot(-0.4, -0.22, 0.03, 0.017).map(([x, y]) => new THREE.Vector2(x, y))));
    const g = new THREE.ExtrudeGeometry(shape, { depth: TS, bevelEnabled: false, curveSegments: 12 });
    g.translate(0, 0, s * ZS - TS / 2);
    plates.push(new THREE.Mesh(g));
    void m;
  }
  // Plancher percé (six trous de traversée en ligne selon Z) et bossage
  // taraudé des vis de butée.
  const XB = -0.36;
  const ZH = [-0.085, -0.051, -0.017, 0.017, 0.051, 0.085];
  const NH = [12, 12, 6, 8, 12, 12]; // tailles des coudes (8, 8, 6, 7, 8, 8 comme le dessin)
  plates.push(slabY([[-L, -ZS], [-TP, -ZS], [-TP, ZS], [-L, ZS]], 0, TS, 'grey', ZH.map((z, i) => [XB, z, (NH[i] === 12 ? 0.83 : NH[i] === 8 ? 0.62 : 0.5) * IN])));
  // Aile de bout : tôle verticale à x = −L puis horizontale vers −X (semelle du support 2).
  plates.push(slabX([[-ZS - TS / 2, -TS - 0.03], [ZS + TS / 2, -TS - 0.03], [ZS + TS / 2, YE], [-ZS - TS / 2, YE]], -L - TS / 2, TS, 'grey'));
  plates.push(slabY([[-L - 0.14, -0.1], [-L - TS, -0.1], [-L - TS, 0.1], [-L - 0.14, 0.1]], YE, TS, 'grey', [[-L - 0.07, -0.05, 0.0071], [-L - 0.07, 0.05, 0.0071]]));
  // Gousset sous l'aile de bout.
  for (const s of [-1, 1]) plates.push(slabZ([[-L - TS, YE - TS], [-L - 0.12, YE - TS], [-L - TS, -0.03]], s * 0.07, TS, 'grey'));
  // Bossage des vis de butée (bloc 1 1/4 po carré, deux taraudages selon Z).
  plates.push(box(0.04, 0.032, 0.07, 'grey', { pos: [-L + 0.06, 0.016, -0.05] }));
  // Cordons de soudure : flasques / platine, flasques / plancher.
  const beads = [];
  for (const s of [-1, 1]) {
    beads.push(weld([[-TP - 0.002, 0.005, s * (ZS - TS / 2 - 0.002)], [-TP - 0.002, 0.18, s * (ZS - TS / 2 - 0.002)]], 0.006, 'grey'));
    beads.push(weld([[-L + 0.01, 0.002, s * (ZS - TS / 2 - 0.002)], [-TP - 0.01, 0.002, s * (ZS - TS / 2 - 0.002)]], 0.005, 'grey'));
  }
  P('4', group(merged(plates, 'grey'), merged(beads, 'grey')), [0, -0.12, 0]);

  // ------------------------------------------------------------- 14 / 17 — vis de la platine
  for (const [y, z] of bolts14) {
    P('17', nordLock(0.75 * IN, [-TP - 0.0016, y, z], [-1, 0, 0], { sp: true }), [-0.08, 0, 0]);
    P('14', hhcs(0.75 * IN, 1.75 * IN, [-TP - 0.0034, y, z], [-1, 0, 0]), [-0.16, 0, 0]);
  }

  // ------------------------------------------------------------- 5 — plaque d'arrêt d'émerillon
  // Fourche 3/8 po : ouverture vers −X, posée sur l'aile haute de la platine.
  const yA = 0.19 + TS; // dessus de l'aile haute
  const fork = [
    [-0.22, -0.11], [-0.22, -0.035], [-0.12, -0.035], [-0.12, 0.035], [-0.22, 0.035], [-0.22, 0.11],
    [-TP + 0.02, 0.11], [-TP + 0.02, -0.11],
  ];
  P('5', slabY(fork, yA + TS, TS, 'grey', [[-0.06, -0.085, 0.0071], [-0.06, 0.085, 0.0071]]), [0, 0.12, 0]);
  for (const z of [-0.085, 0.085]) {
    P('16', nordLock(0.5 * IN, [-0.06, yA + TS + 0.0012, z], [0, 1, 0], { sp: true }), [0, 0.17, 0]);
    P('13', hhcs(0.5 * IN, 1.75 * IN, [-0.06, yA + TS + 0.0024, z]), [0, 0.22, 0]);
    P('16', nordLock(0.5 * IN, [-0.06, 0.19 - 0.0012, z], [0, -1, 0], { sp: true }), [0, -0.05, 0]);
    P('18', hexNut(0.5 * IN, [-0.06, 0.19 - 0.0024 - 0.0055, z], [0, 1, 0]), [0, -0.09, 0]);
  }

  // ------------------------------------------------------------- 2 — support d'émerillon
  // Semelle 3/8 × 3 × 5 po, âme, manchon Ø 3 1/2 / 3 po × 3 po d'axe Z.
  const xM = -L - 0.07, yT = YE + TS + 0.075; // axe du manchon
  const RT = 1.75 * IN, LT = 3 * IN;
  const mount = merged([
    box(0.08, TS, 0.13, 'grey', { pos: [xM, YE + TS + TS / 2, 0] }),
    box(0.012, 0.075 - RT * 0.7, 0.07, 'grey', { pos: [xM, YE + 2 * TS + (0.075 - RT * 0.7) / 2, 0] }),
    S.shell(RT, RT - 0.25 * IN, LT, 'grey', { axis: 'z', pos: [xM, yT, 0] }),
  ], 'grey');
  P('2', mount, [0, 0.14, 0]);
  for (const z of [-0.05, 0.05]) {
    const y0 = YE + 2 * TS;
    P('16', nordLock(0.5 * IN, [xM - 0.02, y0 + 0.0012, z], [0, 1, 0], { sp: true }), [0, 0.06, 0]);
    P('13', hhcs(0.5 * IN, 1.75 * IN, [xM - 0.02, y0 + 0.0024, z]), [0, 0.1, 0]);
    P('16', nordLock(0.5 * IN, [xM - 0.02 + 0.0, YE - 0.0012, z], [0, -1, 0], { sp: true }), [0, -0.06, 0]);
    P('18', hexNut(0.5 * IN, [xM - 0.02, YE - 0.0024 - 0.0055, z], [0, 1, 0]), [0, -0.1, 0]);
  }

  // ------------------------------------------------------------- 10 / 11 / 3 / 1 — ligne d'air 2 po
  const r2 = 2.375 * IN / 2; // tube 2 po
  // 10 — adaptateur droit 2 po MNPT / JIC-32 côté +Z : six pans 2 3/4, mâle JIC.
  const ad = group(
    S.nut(2.75 * IN, 0.03, 'zinc', { pos: [0, 0.015, 0] }),
    lathe([[0, -0.04], [r2 * 0.95, -0.04], ...S.thread(r2, -0.039, -0.002, { pitch: 0.0022, maxTurns: 10 }), [r2, 0], [0, 0]], 'zinc', { seg: 28 }),
    lathe([[0, 0.03], [1.2 * IN, 0.03], ...S.thread(1.25 * IN, 0.034, 0.06, { pitch: 0.002, maxTurns: 8, chamferBottom: false }), [1.05 * IN, 0.068], [0.95 * IN, 0.068], [0.95 * IN, 0.064], [0, 0.064]], 'zinc', { seg: 28 }),
  );
  P('10', place(ad, [xM, yT, LT / 2 + 0.004], [0, 0, 1]), [0, 0, 0.12]);
  // 11 — raccord 2 po FNPT-MNPT côté −Z : six pans et mâle conique vers +Z.
  const zc = -LT / 2 - 0.01; // face de la platine 3 côté émerillon
  const conn = group(
    S.nut(3.0 * IN, 0.035, 'zinc', { pos: [0, -0.0175, 0] }),
    lathe([[0, 0], [r2 * 0.95, 0], ...S.thread(r2, 0.001, 0.045, { pitch: 0.0022, maxTurns: 10, chamferBottom: false }), [r2 * 0.9, 0.048], [0, 0.048]], 'zinc', { seg: 28 }),
  );
  P('11', place(conn, [xM, yT, zc], [0, 0, 1]), [0, 0, -0.14]);
  // 3 — platine d'attache anti-fouet : plaque 1/4 po en goutte percée Ø 2 3/8,
  // deux oreilles en haut, chacune avec sa manille.
  const wc = (() => {
    const pts = [];
    for (let i = 0; i <= 24; i++) { const a = Math.PI + (i / 24) * Math.PI; pts.push([Math.cos(a) * 0.055, Math.sin(a) * 0.055]); }
    pts.push([0.055, 0.03], [0.04, 0.085], [0.015, 0.085], [0.01, 0.06], [-0.01, 0.06], [-0.015, 0.085], [-0.04, 0.085], [-0.055, 0.03]);
    const plate = extrude(pts, 0.25 * IN, 'zinc', { holes: [[0, 0, r2 + 0.001], [0.0275, 0.073, 0.005], [-0.0275, 0.073, 0.005]] });
    const parts = [plate];
    for (const x of [-0.0275, 0.0275]) {
      // Manille : étrier en U (tore partiel) et axe à œil.
      parts.push(at(torus(0.012, 0.0028, 'zinc', { axis: 'x' }), [x, 0.085, 0]));
      parts.push(at(cyl(0.003, 0.03, 'zinc', { axis: 'z', seg: 10 }), [x, 0.075, 0]));
      parts.push(at(cyl(0.0045, 0.004, 'zinc', { axis: 'z', seg: 10 }), [x, 0.075, 0.015]));
    }
    return merged(parts, 'zinc');
  })();
  P('3', place(group(wc), [xM, yT, -LT / 2 - 0.0035], [0, 1, 0], [1, 0, 0]), [0, 0.04, -0.09]);
  // 1 — émerillon d'air 2 po coudé à 90° : écrou tournant six pans, corps
  // à roulements Ø 3 1/4, coude fonte et sortie mâle NPT vers −X.
  const zs = zc - 0.035;
  const sw = group(
    S.nut(3.0 * IN, 0.03, 'steel', { pos: [0, -0.015, 0] }),
    lathe([[0, -0.092], [1.45 * IN, -0.092], [1.62 * IN, -0.085], [1.62 * IN, -0.03], [0, -0.03]], 'castIron', { seg: 32 }),
    S.torus(1.62 * IN, 0.0015, 'darkSteel', { pos: [0, -0.058, 0] }),
  );
  P('1', group(
    place(sw, [xM, yT, zs], [0, 0, 1]),
    (() => {
      // Coude : quart de tore Ø 2 1/2 po du corps vers −X, mâle NPT.
      const R = 0.06, zc2 = zs - 0.092;
      const pts = [];
      for (let i = 0; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); pts.push(new THREE.Vector3(xM - R + R * Math.cos(a), yT, zc2 - R * Math.sin(a))); }
      const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 1.3 * IN, 24, false);
      const elbowM = merged([new THREE.Mesh(g)], 'castIron');
      const out = lathe([[0, 0], [r2 * 1.05, 0], [r2 * 1.05, 0.012], [r2 * 0.95, 0.014], ...S.thread(r2 * 0.97, 0.016, 0.05, { r1: r2 * 0.93, pitch: 0.0022, maxTurns: 10, chamferBottom: false }), [r2 * 0.8, 0.052], [0, 0.052]], 'castIron', { seg: 28 });
      return group(elbowM, place(out, [xM - R, yT, zc2 - R], [-1, 0, 0]));
    })(),
  ), [-0.06, 0, -0.22]);

  // ------------------------------------------------------------- 12 / 15 / 19 — vis de butée
  for (const dy of [0.008, 0.024]) {
    const p = [-L + 0.06, dy, -0.05 + 0.035 + 0.02];
    P('12', hhcs(0.5 * IN, 1.25 * IN, p, [0, 0, 1]), [0, 0, 0.12]);
    P('15', nordLock(0.5 * IN, [p[0], dy, -0.05 + 0.035 + 0.0012 + 0.0055], [0, 0, 1]), [0, 0, 0.09]);
    P('19', hexNut(0.5 * IN, [p[0], dy, -0.05 + 0.035 + 0.0028], [0, 0, 1], { jam: true }), [0, 0, 0.06]);
  }

  // ------------------------------------------------------------- 6 / 7 / 8 / 9 — coudes de traversée
  // Coude sous le plancher, sortie vers −X (bout de la potence) ; fût et
  // contre-écrou au-dessus.
  ZH.forEach((z, i) => {
    const n = NH[i];
    const ref = n === 12 ? '8' : n === 8 ? '7' : '6';
    const e = place(bulkheadElbow(n, { t: TS }), [XB, -TS, z], [0, 1, 0], [-1, 0, 0]);
    e.ports = e.userData.ports;
    P(ref, e, [0, -0.1 - (i % 2) * 0.03, 0]);
    if (ref === '7') {
      const s = seat(e, 1);
      P('9', place(capNut(8), s.p, s.d), [-0.06, -0.13, 0]);
    }
  });

  return { view: { dir: [-0.9, 0.75, 1.1] } };
}

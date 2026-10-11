// P040 — Capteur de longueur du mât HH : CX022808 rév. 3 « ASSEMBLY, LENGTH
// TRANSDUCER HH MAST » (page 40), repère 3 de l'avance P032. Capteur de
// position magnétostrictif à sortie CAN (1) : tête à bride six pans et
// embase M12 en haut du mât, tige-guide Ø 10 mm qui descend le long du flanc
// gauche (−X) ; la tête se visse dans le support (6), cornière en U posée
// sur la tôle de tête du mât par deux vis H 1/2-13 × 1 1/2 (10) à rondelles
// Nord-Lock SP (12). La tige est tenue par trois paliers : équerre (4)
// boulonnée au flanc du mât par deux vis 3/8-16 × 1 1/4 (9), bride en
// polyéthylène (5) serrée sur l'aile de l'équerre par deux vis 3/8-16 × 1
// filetées sur toute la longueur (8) ; Nord-Lock SP (11) et écrous (13) sous
// chaque vis 8 et 9 (côté intérieur du flanc pour les 9). L'aimant (7),
// aimant ouvert en U sur une plaque fixée au boîtier de glissière gauche de la
// plaque porte-tête (P134), coulisse le long de la tige sans toucher les
// paliers (ouverture côté opposé). Cordon M12 coudé femelle de 10 m (2) branché
// sur la tête, descendu le long de l'arête arrière gauche du mât, le surplus
// lové ; connecteur mâle M12 5 broches (3) monté au bout.
// Repère : celui de P032 (mast.js : axe du mât selon +Y, pied à y = 0, face
// avant vers +Z, flanc gauche du dessin = −X) ; P032 insère l'assemblage à
// l'origine. Tige d'axe x = XR, z = ZR, de y = 0.25 à 3.08 ; tête au-dessus
// de la tôle de tête (y = MAST.length) ; aimant à la hauteur de la plaque
// porte-tête (MAST.plateY). Encombrement ≈ 0.12 (X) × 2.95 (Y) × 0.40 (Z) m.
// Écarts : position de la tige estimée (vue d'ensemble de la page 40 sans
// cote) ; cordon de 10 m figuré par 2 m de tracé et une glène de 6 spires.
import { MAST } from '../mast.js';
import { IN, place, hhcs, hexNut, nordLock } from './_avance_a.js';

const XR = -0.262, ZR = 0.085; // axe de la tige
const YT = MAST.length; // dessus de la tôle de tête
const XF = -MAST.width / 2; // face extérieure du flanc gauche
const T_FLANK = 0.025;
const Y_CLAMP = [0.7, 1.45, 2.2]; // paliers

export default function P040(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, extrude, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // ------------------------------------------------------------- 1 — capteur
  // Tête : bride six pans 1 3/4 po (filetage 3/4-16 vissé dans le support),
  // boîtier électronique Ø 48 mm, embase M12 ; tige inox Ø 10 mm, bouchon.
  const yH = YT + 0.05; // dessous de la bride, sur l'aile haute du support
  const head = group(
    lathe([[0, -0.018], [0.0095, -0.018], ...S.thread(0.0095, -0.017, -0.002, { pitch: 0.0016, maxTurns: 8 }), [0.0095, 0], [0, 0]], 'steel', { seg: 20 }),
    S.nut(1.75 * IN, 0.012, 'steel', { pos: [0, 0.006, 0] }),
    lathe([[0, 0.012], [0.024, 0.012], [0.024, 0.06], [0.021, 0.064], [0.008, 0.064], [0.008, 0.07], [0, 0.07]], 'castAlu', { seg: 28 }),
    lathe([[0, 0.07], [0.0068, 0.07], ...S.thread(0.006, 0.071, 0.082, { pitch: 0.001, maxTurns: 6, chamferBottom: false }), [0.0045, 0.083], [0, 0.083]], 'brass', { seg: 16 }),
  );
  const rodL = yH - 0.018 - 0.25;
  const rod = group(
    at(cyl(0.005, rodL, 'steel', { seg: 16 }), [0, -0.018 - rodL / 2, 0]),
    at(cyl(0.0058, 0.012, 'steel', { seg: 16 }), [0, -0.018 - rodL + 0.006, 0]),
  );
  P('1', at(group(head, rod), [XR, yH, ZR]), [0, 0.35, 0]);

  // ------------------------------------------------------------- 6 — support du capteur
  // Cornière en U : semelle sur la tôle de tête (deux trous 1/2), joue
  // verticale, aile haute percée Ø 3/4 qui reçoit la bride ; tôle 1/4 po.
  const t = 0.25 * IN;
  const mount = merged([
    box(0.07, t, 0.075, 'grey', { pos: [XR + 0.03, YT + t / 2, ZR] }),
    box(t, 0.05, 0.075, 'grey', { pos: [XR + 0.065 - t / 2, YT + 0.025, ZR] }),
    box(0.05, t, 0.075, 'grey', { pos: [XR + 0.04 - 0.0, yH - t / 2, ZR] }),
  ], 'grey');
  P('6', mount, [0, 0.22, 0]);
  // 10 / 12 — vis de la semelle (deux, de part et d'autre selon Z).
  for (const dz of [-0.022, 0.022]) {
    const p = [XR + 0.045, YT + t, ZR + dz];
    P('12', nordLock(0.5 * IN, [p[0], p[1] + 0.0015, p[2]], [0, 1, 0], { sp: true }), [0, 0.3, 0]);
    P('10', hhcs(0.5 * IN, 1.5 * IN, [p[0], p[1] + 0.003, p[2]]), [0, 0.4, 0]);
  }

  // ------------------------------------------------------------- paliers 4 / 5
  for (const y of Y_CLAMP) {
    // 4 — équerre : joue contre le flanc (trous 3/8 selon X), aile horizontale
    // vers −X sous la bride.
    const eq = merged([
      box(t, 0.06, 0.05, 'grey', { pos: [XF - t / 2, y - 0.03, ZR] }),
      box(0.042, t, 0.05, 'grey', { pos: [XF - 0.021, y - t / 2, ZR] }),
      // Goussets.
      extrude([[0, 0], [0.025, 0], [0, -0.03]], 0.004, 'grey').translateX(XF - t).translateY(y - t).translateZ(ZR),
    ], 'grey');
    eq.children?.forEach?.(() => {});
    P('4', eq, [-0.08, 0, 0]);
    // 5 — bride en polyéthylène : plaque 1/2 po à encoche demi-ronde sur la tige.
    const c5 = extrude([
      [0.0, -0.022], [0.034, -0.022], [0.034, -0.0052], [0.04, -0.0052], [0.04, 0.0052], [0.034, 0.0052], [0.034, 0.022], [0, 0.022],
    ], 0.5 * IN, 'white');
    c5.rotation.x = -Math.PI / 2;
    // Contour dans le plan XZ : x de l'équerre (côté flanc) vers la tige.
    c5.rotation.z = Math.PI;
    c5.position.set(XF - 0.001, y + (0.5 * IN) / 2, ZR);
    P('5', c5, [-0.05, 0.05, 0]);
    // 8 — vis de serrage (deux, selon Z), têtes dessus ; 11 / 13 sous l'aile.
    for (const dz of [-0.014, 0.014]) {
      const x = XF - 0.016;
      P('8', hhcs(0.375 * IN, 1.0 * IN, [x, y + 0.5 * IN, ZR + dz]), [0, 0.09, 0]);
      P('11', nordLock(0.375 * IN, [x, y - t - 0.0012, ZR + dz], [0, -1, 0], { sp: true }), [0, -0.05, 0]);
      P('13', hexNut(0.375 * IN, [x, y - t - 0.0025 - 0.0041, ZR + dz]), [0, -0.08, 0]);
    }
    // 9 — vis de l'équerre au flanc (deux, l'une au-dessus de l'autre), têtes
    // côté extérieur ; 11 / 13 contre la face intérieure du flanc.
    for (const dy of [-0.018, -0.044]) {
      const p = [XF - t, y + dy, ZR];
      P('9', hhcs(0.375 * IN, 1.25 * IN, p, [-1, 0, 0]), [-0.12, 0, 0]);
      P('11', nordLock(0.375 * IN, [XF + T_FLANK + 0.0012, y + dy, ZR], [1, 0, 0], { sp: true }), [0.05, 0, 0]);
      P('13', hexNut(0.375 * IN, [XF + T_FLANK + 0.0025 + 0.0041, y + dy, ZR], [1, 0, 0]), [0.08, 0, 0]);
    }
  }

  // ------------------------------------------------------------- 7 — aimant
  // Plaque 1/4 po boulonnée (quatre vis à tête bombée dans des boutonnières)
  // au boîtier de glissière gauche de la plaque porte-tête, cale noire et
  // aimant ouvert en U autour de la tige (ouverture vers +X, côté paliers).
  const yM = MAST.plateY;
  const xp = XR - 0.03;
  const mag = group(
    merged([
      box(t, 0.1, 0.16, 'zinc', { pos: [xp - t / 2, yM, ZR + 0.06] }),
      ...[[-0.035, 0.035], [-0.035, 0.105], [0.035, 0.035], [0.035, 0.105]].map(([dy, dz]) => at(cyl(0.006, 0.004, 'zinc', { axis: 'x', seg: 12 }), [xp - t - 0.002, yM + dy, ZR + dz])),
    ], 'zinc'),
    box(0.022, 0.04, 0.03, 'plastic', { pos: [xp + 0.011, yM, ZR] }),
    (() => {
      // Aimant en U : couronne Ø 33 / Ø 13,5 ouverte de 60° vers +X.
      const sh = new THREE.Shape();
      sh.absarc(0, 0, 0.0165, 0.55, Math.PI * 2 - 0.55, false);
      sh.absarc(0, 0, 0.0068, Math.PI * 2 - 0.95, 0.95, true);
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.008, bevelEnabled: false, curveSegments: 24 });
      g.rotateX(-Math.PI / 2);
      g.translate(XR, yM - 0.004, ZR);
      return merged([new THREE.Mesh(g)], 'blackCast');
    })(),
  );
  P('7', mag, [-0.12, 0, 0.04]);

  // ------------------------------------------------------------- 2 / 3 — cordon et connecteur
  // Fiche coudée femelle sur l'embase (sortie vers l'arrière), câble noir
  // Ø 6 mm : vers l'arête arrière gauche, descente jusqu'à y = 2.2, glène.
  const yC = yH + 0.083;
  const plug = group(
    lathe([[0, -0.012], [0.009, -0.012], [0.009, 0.012], [0.007, 0.016], [0, 0.016]], 'plastic', { seg: 18 }),
    at(cyl(0.0075, 0.03, 'plastic', { axis: 'z', seg: 16 }), [0, 0.006, -0.018]),
    lathe([[0, -0.016], [0.0085, -0.016], [0.0085, -0.006], [0, -0.006]], 'brass', { seg: 16 }),
  );
  const zb = -MAST.depth / 2 - 0.02;
  const coilY = 2.05, coilR = 0.12, turns = 6;
  const pts = [
    [XR, yC + 0.006, ZR - 0.033], [XR, yC + 0.01, ZR - 0.07], [XR + 0.005, yC - 0.03, ZR - 0.15],
    [XR + 0.01, YT + 0.02, zb + 0.06], [XR + 0.012, YT - 0.1, zb], [XR + 0.012, 2.6, zb], [XR + 0.012, coilY + 0.25, zb],
  ];
  // Glène : spires dans le plan XY derrière le mât.
  const cx = XR + 0.012 + coilR, cyy = coilY;
  for (let i = 0; i <= turns * 16; i++) {
    const a = Math.PI + (i / 16) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * coilR, cyy + Math.sin(a) * coilR * 1.05, zb - 0.004 * (i / 16)]);
  }
  pts.push([cx - coilR + 0.01, cyy - 0.2, zb - 0.03], [cx - coilR + 0.02, cyy - 0.32, zb - 0.03]);
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
  const cable = merged([new THREE.Mesh(new THREE.TubeGeometry(curve, 400, 0.003, 8, false))], 'black');
  P('2', group(place(plug, [XR, yC, ZR], [0, 1, 0], [1, 0, 0]), cable), [0, 0.25, -0.15]);
  // 3 — connecteur mâle M12 à câbler, au bout du cordon (pointe vers le bas).
  const end = pts[pts.length - 1];
  const male = group(
    lathe([[0, 0], [0.0075, 0], [0.0085, 0.004], [0.0085, 0.04], [0.0055, 0.048], [0, 0.048]], 'plastic', { seg: 18 }),
    lathe([[0, -0.012], [0.0068, -0.012], ...S.thread(0.006, -0.011, -0.001, { pitch: 0.001, maxTurns: 6 }), [0.0068, 0], [0, 0]], 'brass', { seg: 16 }),
    S.nut(0.018, 0.008, 'brass', { pos: [0, -0.004, 0] }),
  );
  P('3', place(male, [end[0], end[1] - 0.05, end[2]], [0, 1, 0]), [0, -0.12, -0.1]);

  return { view: { dir: [-1.1, 0.5, 0.7] } };
}

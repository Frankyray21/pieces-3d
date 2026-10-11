// P040 — Capteur de longueur du mât HH : CX022808 rév. 3 « ASSEMBLY, LENGTH
// TRANSDUCER HH MAST » (page 40), repère 3 de l'avance P032. Capteur de
// position magnétostrictif à sortie CAN (1) : tige-guide inox Ø 10 mm logée
// dans le mât, contre la paroi arrière près du flanc gauche (trait caché du
// dessin), qui sort par un trou de la tôle de tête ; bride six pans 1 po
// serrée par écrou sur l'aile basse du support (6, chape en U verticale de
// 75 mm posée sur la tôle de tête, deux vis H 1/2-13 × 1 1/2 (10) à
// rondelles Nord-Lock SP (12)) ; prolongement de tige jusqu'à la tête
// électronique Ø 25 mm et son embase M12, 0.15 m au-dessus de la tôle. Trois
// paliers : équerre (4) boulonnée sur la face intérieure de la paroi arrière
// par deux vis 3/8-16 × 1 1/4 (9 : une au-dessus, une au-dessous de l'aile,
// têtes dehors), bride en polyéthylène 3/8 po (5) serrée sur l'aile par deux
// vis 3/8-16 × 1 filetées (8) ; Nord-Lock SP (11) et écrous (13) au bout de
// chaque vis. Aimant (7) : plaque à quatre boutonnières et bloc aimant noir
// rectangulaire qui longe la tige côté avant (ouvert, il passe les paliers),
// porté par l'équipage mobile (hauteur de la plaque porte-tête). Cordon M12
// coudé femelle de 10 m (2) branché sur la tête, descendu le long de l'arête
// arrière gauche du mât, surplus lové ; connecteur mâle M12 5 broches (3) au
// bout.
// Repère : celui de P032 (mast.js : axe du mât selon +Y, pied à y = 0, face
// avant vers +Z, flanc gauche = −X) ; P032 insère l'assemblage à l'origine.
// Tige d'axe x = XR, z = ZR, de y = 0.80 à la tête (y ≈ 3.20) ; paliers à
// 22 %, 47 % et 71 % de la hauteur depuis le haut (dessin). Encombrement ≈
// 0.33 (X) × 2.45 (Y) × 0.24 (Z) m.
// Écarts : paroi arrière prise à 1/2 po au droit des paliers (mast.js la
// dessine à 25 mm) ; cordon de 10 m figuré par 1.4 m de tracé et une glène.
import { MAST } from '../mast.js';
import { IN, place, hhcs, hexNut, nordLock } from './_avance_a.js';

const XR = -0.185, ZR = -0.16; // axe de la tige (dans le mât, coin arrière gauche)
const YT = MAST.length; // dessus de la tôle de tête
const ZW = -MAST.depth / 2 + 0.5 * 0.0254; // face intérieure de la paroi arrière
const T_WALL = 0.5 * 0.0254;
const Y_CLAMP = [0.88, 1.61, 2.38]; // paliers
const Y_BOT = 0.8; // bout de la tige

export default function P040(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, extrude, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const t = 0.25 * IN;

  // ------------------------------------------------------------- 6 — support du capteur
  // Chape en U verticale, tôle 1/4 po : semelle sur la tôle de tête (deux
  // trous 1/2, côté +X de la tige), joue verticale ajourée, aile basse (bride
  // du capteur et son écrou) et aile haute percées au droit de la tige.
  const yL = YT + 0.035, yU = YT + 0.075; // dessus des ailes basse et haute
  const xw = XR + 0.022; // joue
  const jw = extrude([[-0.025, 0], [0.025, 0], [0.025, 0.075], [-0.025, 0.075]], t, 'grey', { holes: [[0, 0.055, 0.008]] });
  jw.rotation.y = Math.PI / 2;
  jw.position.set(xw + t / 2, YT, ZR);
  const mount = merged([
    box(0.06, t, 0.05, 'grey', { pos: [XR + 0.052, YT + t / 2, ZR] }),
    jw,
    box(0.035, t, 0.05, 'grey', { pos: [xw - 0.0175 + t / 2, yL - t / 2, ZR] }),
    box(0.035, t, 0.05, 'grey', { pos: [xw - 0.0175 + t / 2, yU - t / 2, ZR] }),
  ], 'grey');
  P('6', mount, [0.1, 0.18, 0]);
  // 10 / 12 — vis de la semelle.
  for (const dz of [-0.014, 0.014]) {
    const p = [XR + 0.06, YT + t, ZR + dz];
    P('12', nordLock(0.5 * IN, [p[0], p[1] + 0.0015, p[2]], [0, 1, 0], { sp: true }), [0.1, 0.3, 0]);
    P('10', hhcs(0.5 * IN, 1.5 * IN, [p[0], p[1] + 0.003, p[2]]), [0.1, 0.42, 0]);
  }

  // ------------------------------------------------------------- 1 — capteur
  // Bride six pans 1 po sur l'aile basse, écrou dessous ; tige Ø 10 mm vers
  // le bas ; prolongement Ø 10 jusqu'à la tête Ø 25 et son embase M12.
  const yH = YT + 0.15;
  const rodL = yL - Y_BOT;
  const cap = group(
    S.nut(1.0 * IN, 0.008, 'steel', { pos: [0, yL + 0.004, 0] }),
    S.nut(1.0 * IN, 0.007, 'steel', { pos: [0, yL - t - 0.0035, 0] }),
    at(cyl(0.005, rodL, 'steel', { seg: 16 }), [0, Y_BOT + rodL / 2, 0]),
    at(cyl(0.0058, 0.012, 'steel', { seg: 16 }), [0, Y_BOT + 0.006, 0]),
    at(cyl(0.005, yH - yL, 'steel', { seg: 16 }), [0, (yH + yL) / 2, 0]),
    lathe([[0, yH], [0.0125, yH], [0.0125, yH + 0.03], [0.011, yH + 0.032], [0.007, yH + 0.032], [0.007, yH + 0.036], [0, yH + 0.036]], 'castAlu', { seg: 24 }),
    lathe([[0, yH + 0.036], [0.0068, yH + 0.036], ...S.thread(0.006, yH + 0.037, yH + 0.046, { pitch: 0.001, maxTurns: 6, chamferBottom: false }), [0.0045, yH + 0.047], [0, yH + 0.047]], 'brass', { seg: 16 }),
  );
  P('1', at(cap, [XR, 0, ZR]), [0, 0.35, 0]);

  // ------------------------------------------------------------- paliers 4 / 5
  for (const y of Y_CLAMP) {
    // 4 — équerre : joue contre la paroi arrière (dépasse au-dessus et
    // au-dessous de l'aile), aile horizontale vers l'avant jusqu'à la tige.
    const eq = merged([
      box(0.05, 0.09, t, 'grey', { pos: [XR, y, ZW + t / 2] }),
      box(0.05, t, 0.034, 'grey', { pos: [XR, y - t / 2, ZW + t + 0.017] }),
    ], 'grey');
    P('4', eq, [0, 0, 0.1]);
    // 5 — bride 3/8 po à encoche demi-ronde, sur l'aile, encoche vers l'avant (+Z).
    const T5 = 0.375 * IN;
    const c5 = extrude([[-0.022, 0], [0.022, 0], [0.022, ZR - ZW - t], [0.0052, ZR - ZW - t], [0.0052, ZR - ZW - t + 0.004], [-0.0052, ZR - ZW - t + 0.004], [-0.0052, ZR - ZW - t], [-0.022, ZR - ZW - t]].map(([x, z]) => [x, -z]), T5, 'white');
    c5.rotation.x = -Math.PI / 2;
    c5.position.set(XR, y + T5 / 2, ZW + t);
    P('5', c5, [0, 0.05, 0.14]);
    // 8 — vis de serrage (deux, selon X), têtes dessus ; 11 / 13 sous l'aile.
    for (const dx of [-0.014, 0.014]) {
      const z = ZW + t + 0.011;
      P('8', hhcs(0.375 * IN, 1.0 * IN, [XR + dx, y + T5, z]), [0, 0.09, 0.14]);
      P('11', nordLock(0.375 * IN, [XR + dx, y - t - 0.0015, z], [0, -1, 0], { sp: true }), [0, -0.05, 0.14]);
      P('13', hexNut(0.375 * IN, [XR + dx, y - t - 0.003 - 0.0041, z]), [0, -0.08, 0.14]);
    }
    // 9 — vis de l'équerre à la paroi (une au-dessus, une au-dessous de
    // l'aile), têtes dehors ; 11 / 13 sur la joue, à l'intérieur.
    for (const dy of [0.028, -0.03]) {
      P('9', hhcs(0.375 * IN, 1.25 * IN, [XR, y + dy, ZW - T_WALL], [0, 0, -1]), [0, 0, -0.12]);
      P('11', nordLock(0.375 * IN, [XR, y + dy, ZW + t + 0.0015], [0, 0, 1], { sp: true }), [0, 0.0, 0.06]);
      P('13', hexNut(0.375 * IN, [XR, y + dy, ZW + t + 0.003 + 0.0041], [0, 0, 1]), [0, 0, 0.09]);
    }
  }

  // ------------------------------------------------------------- 7 — aimant
  // Plaque 1/4 po à quatre boutonnières (vis à tête bombée) sur l'équipage
  // mobile, bloc aimant noir 30 × 40 × 22 mm à 4 mm de la tige, côté avant.
  const yM = MAST.plateY;
  const zb = ZR + 0.005 + 0.011; // centre du bloc
  const zp = zb + 0.011 + t / 2; // plaque
  const mag = group(
    merged([
      box(0.08, 0.1, t, 'zinc', { pos: [XR + 0.02, yM, zp] }),
      ...[[-0.01, -0.035], [-0.01, 0.035], [0.05, -0.035], [0.05, 0.035]].map(([dx, dy]) => at(cyl(0.006, 0.004, 'zinc', { axis: 'z', seg: 12 }), [XR + dx, yM + dy, zp + t / 2 + 0.002])),
    ], 'zinc'),
    box(0.03, 0.04, 0.022, 'blackCast', { pos: [XR, yM, zb] }),
  );
  P('7', mag, [0, 0, 0.14]);

  // ------------------------------------------------------------- 2 / 3 — cordon et connecteur
  // Fiche coudée femelle sur l'embase (sortie vers l'arrière), câble noir
  // Ø 6 mm : par-dessus l'arête arrière, descente le long du dos du mât, glène.
  const yC = yH + 0.047;
  const plug = group(
    lathe([[0, -0.012], [0.009, -0.012], [0.009, 0.012], [0.007, 0.016], [0, 0.016]], 'plastic', { seg: 18 }),
    at(cyl(0.0075, 0.03, 'plastic', { axis: 'z', seg: 16 }), [0, 0.006, -0.018]),
    lathe([[0, -0.016], [0.0085, -0.016], [0.0085, -0.006], [0, -0.006]], 'brass', { seg: 16 }),
  );
  const zb2 = -MAST.depth / 2 - 0.03;
  const coilY = 2.2, coilR = 0.12, turns = 5;
  const pts = [
    [XR, yC + 0.006, ZR - 0.033], [XR, yC + 0.01, ZR - 0.06], [XR - 0.005, yC - 0.02, zb2 + 0.02],
    [XR - 0.01, YT - 0.05, zb2], [XR - 0.012, 2.7, zb2], [XR - 0.012, coilY + 0.25, zb2],
  ];
  const cx = XR - 0.012 + coilR;
  for (let i = 0; i <= turns * 16; i++) {
    const a = Math.PI + (i / 16) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * coilR, coilY + Math.sin(a) * coilR * 1.05, zb2 - 0.004 * (i / 16)]);
  }
  pts.push([cx - coilR + 0.01, coilY - 0.2, zb2 - 0.03], [cx - coilR + 0.02, coilY - 0.32, zb2 - 0.03]);
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
  const cable = merged([new THREE.Mesh(new THREE.TubeGeometry(curve, 360, 0.003, 8, false))], 'black');
  P('2', group(place(plug, [XR, yC, ZR], [0, 1, 0], [1, 0, 0]), cable), [0, 0.25, -0.15]);
  const end = pts[pts.length - 1];
  const male = group(
    lathe([[0, 0], [0.0075, 0], [0.0085, 0.004], [0.0085, 0.04], [0.0055, 0.048], [0, 0.048]], 'plastic', { seg: 18 }),
    lathe([[0, -0.012], [0.0068, -0.012], ...S.thread(0.006, -0.011, -0.001, { pitch: 0.001, maxTurns: 6 }), [0.0068, 0], [0, 0]], 'brass', { seg: 16 }),
    S.nut(0.018, 0.008, 'brass', { pos: [0, -0.004, 0] }),
  );
  P('3', place(male, [end[0], end[1] - 0.05, end[2]], [0, 1, 0]), [0, -0.12, -0.1]);

  return { view: { dir: [-1.0, 0.5, -0.9] } };
}

// P302 — Flasque de palier arrière et pompe à huile du compresseur
// surpresseur Le Roi CP48001 : CP48001-OILPUMP « BEARING & OIL PUMP
// HOUSING » (page 302). Flasque arrière en fonte (17) : plateau Ø 0,25 m
// fixé sur la face arrière du carter par onze vis (15) et rondelles (16),
// centrage qui porte la cuvette du roulement arrière (1), moyeu extérieur
// qui loge la pompe à palettes ; cales de précharge du roulement (2 : 0,020
// po, 3 : 0,0075 po, 4 : 0,005 po ; « AR », une de chaque) entre plateau et
// carter. Pompe : stator (12) à alésage excentré, immobilisé par une goupille
// élastique (13) et une vis sans tête 1/4 × 1/2 po (14) ; rotor (11) claveté
// (10) sur le bout arrière du vilebrequin, quatre palettes (8) poussées par
// leurs ressorts (9) contre l'alésage du stator. Aspiration : crépine (5) au
// fond du carter, tube coudé emmanché par un manchon caoutchouc (7) sur le
// raccord d'aspiration (6) vissé dans la face intérieure du flasque.
// Repère du bloc (_moteur_surpresseur.js) : origine sur l'axe du vilebrequin
// au droit du cylindre central, +X vers la poulie, Y vers le haut. Face
// d'appui des cales sur le carter à x = LR.rearX = −0.14, plateau jusqu'à
// LR.retFaceX = −0.158, moyeu de pompe jusqu'à LR.hubX = −0.176 (face
// d'appui du couvercle P294). Option { crank } (comme P298) : angle du
// vilebrequin, qui oriente la clavette, le rotor et les palettes.
// Encombrement 0.161 (X, de −0.176 au bout de la crépine à −0.015) × 0.25 ×
// 0.25 m.
// Cotes estimées (dessin non coté) : onze vis 3/8 po sur Ø 0,224 m, pompe
// Ø 68 mm × 16 mm, excentration 4 mm.

import { LR, IN, MM, lrPrism, lrCircle } from './_moteur_surpresseur.js';

export default function P302(api, opts = {}) {
  const { S } = api;
  const { lathe, slotted, roundHole, box, bolt, washer, spring, tube, shell, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const crank = opts.crank ?? LR.crank;

  // Lathe le long de X (profil [r, x], sens trigonométrique en (r, x)).
  const latheX = (prof, mat, seg = 48) => {
    const m = lathe(prof, mat, { seg });
    m.rotation.z = -Math.PI / 2;
    return group(m);
  };
  // Prisme d'axe X : contour [[z, y], …] (vu de −X) de x = xa à xb.
  const prismX = (outline, holes, xa, xb, mat) => {
    const m = lrPrism(api, outline, holes, 0, xb - xa, mat);
    // +Y local → +X ; X local → −Y ; Z local → Z.
    m.rotation.z = -Math.PI / 2;
    m.position.x = xa;
    return m;
  };
  // Les contours de prismX sont donnés en [y, z] du bloc : X local = −Y.
  const yz = (pts) => pts.map(([y, z]) => [-y, z]);

  const x0 = LR.rearX, xF = LR.retFaceX, xH = LR.hubX;
  const tS = [0.02 * IN, 0.0075 * IN, 0.005 * IN];
  const xP = x0 - tS[0] - tS[1] - tS[2]; // face du plateau côté carter
  const rHub = 60 * MM, rRec = 34 * MM, xRec = -0.16; // moyeu, logement de pompe
  const rCup = 36 * MM;
  const boltA = Array.from({ length: 11 }, (_, k) => Math.PI / 2 + (2 * Math.PI * k) / 11);
  const boltYZ = boltA.map((a) => [LR.retBoltR * Math.cos(a), LR.retBoltR * Math.sin(a)]);

  // ---------------------------------------------------------------- 17 — flasque arrière
  const ret = latheX([
    [rRec, xH], [rHub - 1.5 * MM, xH], [rHub, xH + 1.5 * MM], [rHub, xF - 4 * MM], [rHub + 4 * MM, xF],
    [LR.retR - 1.5 * MM, xF], [LR.retR, xF + 1.5 * MM], [LR.retR, xP], [LR.rearOpenR - 0.5 * MM, xP],
    [LR.rearOpenR - 0.5 * MM, -0.117], [LR.rearOpenR - 2.5 * MM, -0.115], [rCup, -0.115], [rCup, -0.136],
    [26 * MM, -0.136], [26 * MM, -0.152], [13 * MM, -0.152], [13 * MM, xRec], [rRec, xRec], [rRec, xH],
  ], 'castIron', 72);
  // Bossages des vis sur la face extérieure du plateau.
  const pads = boltYZ.map(([y, z]) => latheX([[0, xF - 2.5 * MM], [9 * MM, xF - 2.5 * MM], [9 * MM, xF + 0.5 * MM], [0, xF + 0.5 * MM]], 'castIron', 18));
  pads.forEach((p, k) => { p.position.y = boltYZ[k][0]; p.position.z = boltYZ[k][1]; });
  P('17', merged([ret, ...pads], 'castIron'), [-0.1, 0, 0]);

  // ---------------------------------------------------------------- 2 / 3 / 4 — cales de précharge
  const shimHoles = boltYZ.map(([y, z]) => lrCircle(5.5 * MM, 12, -y, z));
  let xs = x0;
  [['2', 'steel'], ['3', 'brass'], ['4', 'zinc']].forEach(([ref, mat], k) => {
    P(ref, prismX(lrCircle(LR.retR - 2 * MM, 72), [lrCircle(LR.rearOpenR + 0.5 * MM, 64), ...shimHoles], xs - tS[k], xs, mat), [-0.02 - 0.012 * k, 0, 0]);
    xs -= tS[k];
  });

  // ---------------------------------------------------------------- 15 / 16 — vis et rondelles (11 + 11)
  const tW = 2.4 * MM;
  for (const [y, z] of boltYZ) {
    P('16', washer(10 * MM, 5.2 * MM, tW, 'steel', { axis: 'x', pos: [xF - 2.5 * MM - tW / 2, y, z] }), [-0.16, 0, 0]);
    P('15', bolt(0.375 * IN, 1.25 * IN, 'steel', { axis: '-x', pos: [xF - 2.5 * MM - tW, y, z] }), [-0.2, 0, 0]);
  }

  // ---------------------------------------------------------------- 1 — cuvette du roulement arrière
  // Piste conique (petit Ø côté extérieur), dans l'alésage du centrage.
  P('1', latheX([[31.8 * MM, -0.136], [rCup, -0.136], [rCup, -0.12], [33.2 * MM, -0.12], [31.8 * MM, -0.1225], [31.8 * MM, -0.136]], 'steel', 48), [0.05, 0, 0]);

  // ---------------------------------------------------------------- pompe à palettes
  const e = 4 * MM; // excentration de l'alésage du stator (vers +Y)
  const rSt = 25 * MM, rRo = 21 * MM;
  const xa = xH + 0.5 * MM, xb = xRec - 0.3 * MM; // épaisseur du rotor et du stator
  // 12 — stator : bague à alésage excentré.
  P('12', prismX(yz(lrCircle(rRec - 0.2 * MM, 64)), [yz(lrCircle(rSt, 64, e, 0)), yz(lrCircle(1.6 * MM, 10, -29.5 * MM, 0))], xa, xRec, 'steel'), [-0.26, 0, 0]);
  // 13 — goupille élastique (fendue) dans le bas du stator, entre dans le flasque.
  P('13', at(slotted(1.6 * MM, 1.1 * MM, 0, 12 * MM, [{ a: 0, w: 0.5, y0: 0, y1: 12 * MM }], 'blackOxide', { axis: 'x', seg: 12 }), [xRec - 8 * MM, -29.5 * MM, 0]), [-0.24, 0, 0]);
  // 14 — vis sans tête 1/4 × 1/2 po, radiale, dans le haut du moyeu.
  P('14', at(lathe([[0, 0], [3 * MM, 0], [3.175 * MM, 0.5 * MM], [3.175 * MM, 12.2 * MM], [2.6 * MM, 12.7 * MM], [0, 12.7 * MM]], 'blackOxide', { seg: 12 }), [-0.168, rHub - 12.2 * MM, 0]), [0, 0.06, 0]);
  // 11 — rotor : quatre fentes radiales, moyeu claveté.
  const slotW = 3.2 * MM, slotD = 9 * MM;
  const th = (k) => crank + Math.PI / 4 + (k * Math.PI) / 2; // angle des palettes (depuis +Y vers +Z)
  const rotorPts = [];
  const nC = 64;
  for (let i = 0; i < nC; i++) {
    const a = (2 * Math.PI * i) / nC;
    // Fente k : on remplace l'arc par l'entaille.
    const k = [0, 1, 2, 3].find((q) => {
      let d = a - th(q); d = Math.atan2(Math.sin(d), Math.cos(d));
      return Math.abs(d) < Math.asin(slotW / 2 / rRo);
    });
    if (k === undefined) rotorPts.push([rRo * Math.cos(a), rRo * Math.sin(a)]);
    else if (!rotorPts.slotDone?.[k]) {
      rotorPts.slotDone = { ...(rotorPts.slotDone || {}), [k]: true };
      const t = th(k), c = Math.cos(t), s = Math.sin(t), h = slotW / 2;
      const rr = rRo - slotD, ro = Math.sqrt(rRo * rRo - h * h);
      rotorPts.push([ro * c + h * s, ro * s - h * c], [rr * c + h * s, rr * s - h * c], [rr * c - h * s, rr * s + h * c], [ro * c - h * s, ro * s + h * c]);
    }
  }
  // Contour en (y, z) du bloc, angle depuis +Y : point (r cos a, r sin a) = (y, z).
  P('11', prismX(yz(rotorPts), [yz(lrCircle(11.6 * MM, 32))], xa, xb, 'steel'), [-0.31, 0, 0]);
  // 8 / 9 — palettes et ressorts.
  for (let k = 0; k < 4; k++) {
    const t = th(k), uy = Math.cos(t), uz = Math.sin(t);
    // Distance de l'axe à l'alésage dans la direction t.
    const tip = e * uy + Math.sqrt(rSt * rSt - e * e * (1 - uy * uy));
    const vh = 9 * MM;
    const vane = box(xb - xa - 0.6 * MM, vh, slotW - 0.3 * MM, 'charcoal', { pos: [0, 0, 0] });
    vane.position.set((xa + xb) / 2, (tip - vh / 2 - 0.1 * MM) * uy, (tip - vh / 2 - 0.1 * MM) * uz);
    vane.rotation.x = t;
    P('8', vane, [-0.31, 0.035 * uy, 0.035 * uz]);
    const base = rRo - slotD, sl = Math.max(tip - vh - base, 1.5 * MM);
    const spr = spring(1.1 * MM, 0.25 * MM, sl, 4, 'steel', { perTurn: 12, radial: 5 });
    const g = at(group(spr), [(xa + xb) / 2, (base + sl / 2) * uy, (base + sl / 2) * uz], [t, 0, 0]);
    P('9', g, [-0.31, 0.012 * uy, 0.012 * uz]);
  }
  // 10 — clavette du rotor dans le bout arrière du vilebrequin (à l'angle du maneton).
  const key = box(xb - xa, 4 * MM, 4 * MM, 'steel', { r: 0.4 * MM });
  key.position.set((xa + xb) / 2, 11.5 * MM * Math.cos(crank), 11.5 * MM * Math.sin(crank));
  key.rotation.x = crank;
  P('10', key, [-0.36, 0.02 * Math.cos(crank), 0.02 * Math.sin(crank)]);

  // ---------------------------------------------------------------- aspiration : 6, 7, 5
  const yA = -0.07; // axe du raccord d'aspiration, dans la face intérieure du centrage
  const xi = -0.115;
  // 6 — raccord : filet dans le flasque, six-pans, douille cannelée.
  P('6', at(group(
    latheX([[0, xi - 8 * MM], [6.5 * MM, xi - 8 * MM], [6.5 * MM, xi], [0, xi]], 'brass', 16),
    latheX([[2.5 * MM, xi], [9.2 * MM, xi], [9.2 * MM, xi + 7 * MM], [5 * MM, xi + 7.5 * MM], [5 * MM, xi + 9 * MM], [5.6 * MM, xi + 10 * MM],
      [4.6 * MM, xi + 13 * MM], [5.6 * MM, xi + 14 * MM], [4.6 * MM, xi + 17 * MM], [3 * MM, xi + 17 * MM], [2.5 * MM, xi + 17 * MM], [2.5 * MM, xi]], 'brass', 6),
  ), [0, yA, 0]), [0.04, 0, 0]);
  // 7 — manchon caoutchouc sur la douille et le bout du tube.
  P('7', at(shell(7.6 * MM, 5.6 * MM, 14 * MM, 'rubber', { axis: 'x', seg: 20 }), [xi + 16 * MM, yA, 0]), [0.07, 0, 0]);
  // 5 — crépine : tube coudé Ø 10 mm, six-pans, tamis perforé couché au fond du carter.
  const yS = -0.133;
  const pipe = tube([[xi + 11 * MM, yA, 0], [xi + 24 * MM, yA, 0], [xi + 30 * MM, yA - 15 * MM, 0], [xi + 30 * MM, yS + 14 * MM, 0], [xi + 36 * MM, yS, 0], [xi + 42 * MM, yS, 0]],
    5 * MM, 'steel', { seg: 40, radial: 12, tension: 0.3 });
  const xs0 = xi + 42 * MM;
  const hex = latheX([[0, xs0], [10 * MM, xs0], [10 * MM, xs0 + 8 * MM], [0, xs0 + 8 * MM]], 'steel', 6);
  hex.position.y = yS;
  const holes = [];
  for (let i = 0; i < 9; i++) for (let k = 0; k < 10; k++) holes.push(...roundHole((2 * Math.PI * (k + (i % 2) * 0.5)) / 10, 4 * MM + i * 5.2 * MM, 1.5 * MM, 12 * MM, { steps: 3 }));
  const screen = at(slotted(12 * MM, 11.3 * MM, 0, 50 * MM, holes, 'zinc', { axis: 'x', seg: 40 }), [xs0 + 8 * MM, yS, 0]);
  const endCap = latheX([[0, xs0 + 58 * MM], [12.5 * MM, xs0 + 58 * MM], [12.5 * MM, xs0 + 61 * MM], [11 * MM, xs0 + 62 * MM], [0, xs0 + 62 * MM]], 'steel', 32);
  endCap.position.y = yS;
  const collar = latheX([[0, xs0 + 8 * MM], [12.5 * MM, xs0 + 8 * MM], [12.5 * MM, xs0 + 11 * MM], [0, xs0 + 11 * MM]], 'steel', 32);
  collar.position.y = yS;
  P('5', group(merged([pipe, hex, endCap, collar], 'steel'), screen), [0.1, -0.01, 0]);

  return { view: { dir: [-1.2, 0.5, 0.9] } };
}

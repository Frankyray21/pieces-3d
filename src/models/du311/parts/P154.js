// P154 — Arrêt d'urgence à câble de la boucle de boyaux V30 : CX036042 rév. 0
// « ASSY, E-STOP - V30 HOSE LOOP » (page 154), repère de l'avance P032.
// Potence (6, mécano-soudée : sabot de collier, bras horizontal effilé en
// tôle 3/8 po raidi d'une nervure) serrée sur un tube Ø 4 po par un collier à
// bande plate (1) ; au bout du bras, crochet en J (5, tige 3/8 et écrou) qui
// retient le ressort de rappel (4) ; câble acier galvanisé Ø 3,2 mm (7, une
// boucle à chaque bout fermée par deux serre-câbles 1/8 po (3)) jusqu'à
// l'anneau de l'interrupteur à tirette (2), pendu sous son équerre (8) : deux
// vis H 3/8-16 × 1 1/2 (9), Nord-Lock (10) sous la tête et sous l'écrou (11).
// Longueur libre du câble entre serre-câbles : 14 po mini (cote du dessin),
// 15 po ici ; ensemble ≈ 38 po de l'interrupteur au crochet.
// Repère : origine sur l'axe du tube Ø 4 po, à la hauteur du bras ; Y vers
// le haut (le long du câble), bras vers −X, Z en travers. Encombrement ≈ 0.32
// (X) × 1.0 (Y) × 0.12 (Z) m.
import { IN, place, hhcs, hexNut, nordLock } from './_avance_a.js';

const R = 2 * IN; // tube Ø 4 po
const XH = -0.235; // axe du crochet / du câble
const T = 0.375 * IN;

export default function P154(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, extrude, merged, group, at, torus, spring, slotted } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v = (...a) => new THREE.Vector3(...a);
  const tubeAlong = (pts, r, mat, seg = 40) => merged([new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => v(...p))), seg, r, 8, false))], mat);

  // ------------------------------------------------------------- 6 — potence
  // Sabot vertical (tangent au tube côté −X), bras effilé à plat dessous,
  // nervure verticale triangulaire au-dessus, trou du crochet au bout.
  const xs = -R - 0.004; // face du sabot contre le tube
  const sabot = box(0.016, 0.07, 0.12, 'grey', { pos: [xs - 0.008, 0.02, 0] });
  const arm = extrude([[xs - 0.016, -0.045], [XH - 0.02, -0.012], [XH - 0.02, 0.012], [xs - 0.016, 0.045]].map(([x, z]) => [x, -z]), T, 'grey', { holes: [[XH, 0, 0.005]] });
  arm.rotation.x = -Math.PI / 2;
  arm.position.y = -0.015 + T / 2;
  const rib = extrude([[xs - 0.016, 0], [xs - 0.016, 0.05], [XH + 0.04, 0]], 0.25 * IN, 'grey');
  rib.position.y = -0.015 + T;
  const welds = [S.weld([[xs - 0.017, -0.006, -0.04], [xs - 0.017, -0.006, 0.04]], 0.005, 'grey')];
  P('6', group(merged([sabot, arm, rib], 'grey'), merged(welds, 'grey')), [-0.08, 0, 0]);

  // ------------------------------------------------------------- 1 — collier
  const xb = 0.045, zt = Math.sqrt(R * R - xb * xb);
  // Bande autour du tube (ouverte côté sabot), branches jusqu'au sabot,
  // extrémités filetées au travers du sabot, rondelles et écrous côté bras.
  const band = [slotted(R + 0.0032, R, 0.004, 0.036, [{ a: -Math.PI / 2, w: 2 * Math.asin(xb / R), y0: 0, y1: 0.04 }], 'zinc', { seg: 40 })];
  for (const s of [-1, 1]) {
    band.push(box(Math.abs(xs - (-zt)) + 0.001, 0.032, 0.0032, 'zinc', { pos: [(xs - zt) / 2, 0.02, s * (xb + 0.0016)] }));
    band.push(at(cyl(0.0047, 0.034, 'zinc', { axis: 'x', seg: 12 }), [xs - 0.017, 0.02, s * xb]));
    band.push(at(S.washer(0.011, 0.005, 0.0016, 'zinc', { axis: 'x' }), [xs - 0.0168, 0.02, s * xb]));
    band.push(at(S.nut(0.5625 * IN, 0.008, 'zinc', { axis: 'x' }), [xs - 0.0216, 0.02, s * xb]));
  }
  P('1', merged(band, 'zinc'), [0.07, 0, 0]);

  // ------------------------------------------------------------- 5 — crochet en J
  const yA = -0.015 + T; // dessus du bras
  const jhook = group(
    lathe([[0, -0.03], [0.0045, -0.03], ...S.thread(0.0047, -0.029, 0.03, { pitch: 0.0016, maxTurns: 12 }), [0.0047, 0.05], [0, 0.05]], 'zinc', { seg: 12 }),
    tubeAlong([[0, 0.05], [0, 0.058], [0.004, 0.066], [0.012, 0.068], [0.018, 0.062], [0.018, 0.054]], 0.0045, 'zinc', 16),
    at(S.nut(0.5625 * IN, 0.008, 'zinc'), [0, -0.019, 0]),
    at(S.nut(0.5625 * IN, 0.008, 'zinc'), [0, 0.004, 0]),
  );
  P('5', at(jhook, [XH, yA, 0]), [-0.05, -0.04, 0]);

  // ------------------------------------------------------------- 4 — ressort de rappel
  const y4 = yA + 0.07; // boucle basse dans le crochet
  const L4 = 0.085;
  P('4', group(
    spring(0.009, 0.0016, L4, 22, 'zinc', { pos: [XH + 0.008, y4 + 0.012 + L4 / 2, 0] }),
    tubeAlong([[XH + 0.008, y4 + 0.012, 0], [XH + 0.008, y4 + 0.004, 0.006], [XH + 0.008, y4 - 0.004, 0], [XH + 0.008, y4 + 0.003, -0.006], [XH + 0.008, y4 + 0.012, -0.001]], 0.0016, 'zinc', 20),
    tubeAlong([[XH + 0.008, y4 + 0.012 + L4, 0], [XH + 0.008, y4 + 0.02 + L4, 0.006], [XH + 0.008, y4 + 0.028 + L4, 0], [XH + 0.008, y4 + 0.021 + L4, -0.006], [XH + 0.008, y4 + 0.012 + L4, -0.001]], 0.0016, 'zinc', 20),
  ), [-0.1, 0.02, 0]);

  // ------------------------------------------------------------- 7 — câble et 3 — serre-câbles
  const xr = XH + 0.008;
  const yLo = y4 + L4 + 0.022; // boucle basse dans l'œil du ressort
  const yHi = 0.86; // boucle haute dans l'anneau de l'interrupteur
  const loop = (y, dir) => {
    // Boucle : brin passant dans l'œil, retour doublé jusqu'aux serre-câbles.
    const pts = [];
    for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; pts.push([xr + Math.cos(a) * 0.006 - 0.006 + 0.006, y - dir * Math.sin(a) * 0.012, 0]); }
    return pts;
  };
  const rc = 0.0016;
  const rope = [
    tubeAlong([[xr + 0.0035, yLo + 0.08, 0], [xr + 0.0035, yHi - 0.08, 0]], rc, 'zinc', 4),
    tubeAlong([[xr + 0.0035, yLo + 0.08, 0], [xr + 0.003, yLo + 0.02, 0], [xr + 0.006, yLo, 0], [xr, yLo - 0.006, 0], [xr - 0.006, yLo, 0], [xr - 0.003, yLo + 0.02, 0], [xr - 0.0005, yLo + 0.09, 0]], rc, 'zinc', 30),
    tubeAlong([[xr + 0.0035, yHi - 0.08, 0], [xr + 0.003, yHi - 0.02, 0], [xr + 0.006, yHi, 0], [xr, yHi + 0.006, 0], [xr - 0.006, yHi, 0], [xr - 0.003, yHi - 0.02, 0], [xr - 0.0005, yHi - 0.09, 0]], rc, 'zinc', 30),
  ];
  void loop;
  P('7', merged(rope, 'zinc'), [-0.14, 0, 0]);
  // Serre-câble 1/8 : étrier en U, selle, deux écrous.
  const clip = (y) => {
    const g = group(
      tubeAlong([[xr - 0.008, y - 0.004, 0.006], [xr - 0.008, y - 0.004, -0.004], [xr, y - 0.004, -0.009], [xr + 0.008, y - 0.004, -0.004], [xr + 0.008, y - 0.004, 0.006]], 0.0012, 'zinc', 12),
      box(0.022, 0.006, 0.005, 'zinc', { pos: [xr, y - 0.004, 0.006] }),
      at(S.nut(0.0065, 0.004, 'zinc', { axis: 'z' }), [xr - 0.008, y - 0.004, 0.0105]),
      at(S.nut(0.0065, 0.004, 'zinc', { axis: 'z' }), [xr + 0.008, y - 0.004, 0.0105]),
    );
    return merged([g], 'zinc');
  };
  for (const y of [yLo + 0.035, yLo + 0.06, yHi - 0.035, yHi - 0.06]) P('3', clip(y), [0, 0, 0.06]);

  // ------------------------------------------------------------- 2 — interrupteur à tirette
  // Boîtier jaune 2 1/4 × 4 × 2 po, couvercle noir, tête de tirette, anneau
  // en bas, bouton de réarmement bleu sur le côté, presse-étoupe.
  const yS = yHi + 0.027; // bas du boîtier (anneau dans la boucle haute)
  const BW = 0.056, BH = 0.1, BD = 0.05;
  const sw = group(
    box(BW, BH, BD, 'yellow', { pos: [0, yS + 0.025 + BH / 2, 0], r: 0.004 }),
    box(BW - 0.01, BH - 0.025, 0.003, 'black', { pos: [0, yS + 0.025 + BH / 2, BD / 2 + 0.0015] }),
    lathe([[0, yS - 0.012], [0.006, yS - 0.012], [0.011, yS], [0.011, yS + 0.025], [0, yS + 0.025]], 'castAlu', { seg: 18 }),
    at(torus(0.0065, 0.0022, 'zinc'), [0, yS - 0.022, 0]).rotateX(0),
    at(cyl(0.0022, 0.012, 'zinc', { seg: 10 }), [0, yS - 0.012, 0]),
    at(cyl(0.008, 0.012, 'blue', { axis: 'x', seg: 18 }), [-BW / 2 - 0.006, yS + 0.012, 0]),
    at(lathe([[0, 0], [0.008, 0], [0.008, 0.008], [0.005, 0.014], [0, 0.014]], 'black', { seg: 16 }), [0, yS + 0.025 + BH, 0]),
  );
  // Anneau dans le plan XY (le câble y passe).
  sw.children[3].rotation.x = Math.PI / 2;
  P('2', at(sw, [xr, 0, 0]), [-0.12, 0.08, 0]);

  // ------------------------------------------------------------- 8 — équerre et visserie
  // Joue verticale dans le dos du boîtier (côté −Z), aile horizontale en haut
  // vers −Z, deux trous 3/8 (fixation sous la structure de la boucle).
  const zb = -BD / 2 - 0.0005;
  const yTop = yS + 0.025 + BH + 0.02;
  const eq = merged([
    box(0.05, yTop - yS - 0.03, 0.005, 'grey', { pos: [xr, (yTop + yS + 0.03) / 2, zb - 0.0025] }),
    box(0.05, 0.005, 0.045, 'grey', { pos: [xr, yTop - 0.0025, zb - 0.0225] }),
  ], 'grey');
  P('8', eq, [0, 0.12, -0.05]);
  for (const dx of [-0.014, 0.014]) {
    const p = [xr + dx, yTop, zb - 0.028];
    P('10', nordLock(0.375 * IN, [p[0], yTop + 0.0011, p[2]]), [0, 0.06, 0]);
    P('9', hhcs(0.375 * IN, 1.5 * IN, [p[0], yTop + 0.0022, p[2]]), [0, 0.1, 0]);
    P('10', nordLock(0.375 * IN, [p[0], yTop - 0.005 - 0.0011, p[2]], [0, -1, 0]), [0, -0.05, 0]);
    P('11', hexNut(0.375 * IN, [p[0], yTop - 0.005 - 0.0022 - 0.004, p[2]]), [0, -0.08, 0]);
  }
  return { view: { dir: [-0.9, 0.4, 1.1] } };
}

// P152 — Sélecteur des vérins stinger : CX035744 rév. 0 « ASSY, SELECTOR
// VALVE » (page 152), repère 37 de l'avance P032. Platine 3/8 po (3) serrée
// sur le fût Ø 4 po d'un vérin stinger par deux colliers à bande plate (1,
// CP001009, extrémités filetées 3/8 et écrous sur la face avant de la
// platine) ; cale de 1 po (4) puis sélecteur 2 voies à tirette (2, CP17190) :
// corps acier, bouton champignon sur le dessus, six orifices SAE-6 (deux sur
// chaque flanc, deux sur la face avant) garnis de coudes 90° ORB / JIC-06 (6) ;
// deux vis H 3/8-16 × 2 3/4 (7) au travers du sélecteur, de la cale et de la
// platine, Nord-Lock (8) sous la tête et sous l'écrou (9). Étiquette IN / OUT
// (5, flèches A / B) collée en haut de la platine.
// Repère : origine sur l'axe du fût du vérin (Ø 4 po), à mi-hauteur de la
// platine ; Y vers le haut, −Z vers l'avant du sélecteur (platine derrière le
// fût vue de l'arrière de l'avance), X en travers. Encombrement ≈ 0.18 (X) ×
// 0.23 (Y) × 0.24 (Z) m.
import { IN, elbow, place, hhcs, hexNut, nordLock } from './_avance_a.js';

const R = 2 * IN; // fût Ø 4 po
const T = 0.375 * IN; // platine
const ZB = -(R + 0.012); // face arrière de la platine (côté fût)
const ZF = ZB - T; // face avant
const PW = 0.13, PH = 0.22;
const YC = [0.065, -0.045]; // colliers
const XB = 0.047; // branches des colliers (dans l’ombre du fût)
const TS = 1.0 * IN; // cale
const YV = -0.035; // axe du sélecteur
const VW = 2.25 * IN, VH = 3.0 * IN, VD = 2.0 * IN;

export default function P152(api) {
  const { S } = api;
  const { box, extrude, merged, group, at, lathe, cyl, slotted } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // ------------------------------------------------------------- 3 — platine
  const pl = extrude([[-PW / 2, -PH / 2], [PW / 2, -PH / 2], [PW / 2, PH / 2], [-PW / 2, PH / 2]], T, 'grey', {
    holes: [...YC.flatMap((y) => [[-XB, y, 0.0052], [XB, y, 0.0052]]), [0, YV + 0.03, 0.0052], [0, YV - 0.03, 0.0052]],
  });
  pl.position.z = ZB - T / 2;
  P('3', pl, [0, 0, -0.05]);

  // ------------------------------------------------------------- 5 — étiquette
  // Vinyle blanc 3 1/2 × 2 1/2 po, deux schémas de tiroir et flèches A / B noirs.
  const zl = ZF - 0.0003;
  const ink = [];
  for (const s of [-1, 1]) {
    const x0 = s * 0.022;
    ink.push(box(0.008, 0.026, 0.0002, 'black', { pos: [x0, PH / 2 - 0.035, zl - 0.0002] }));
    ink.push(box(0.016, 0.004, 0.0002, 'black', { pos: [x0, PH / 2 - 0.02, zl - 0.0002] }));
    for (const dy of [-0.03, -0.045]) {
      ink.push(box(0.012, 0.004, 0.0002, 'black', { pos: [x0 - s * 0.016, PH / 2 + dy, zl - 0.0002] }));
      ink.push(at(cyl(0.0035, 0.0002, 'black', { axis: 'z', seg: 12 }), [x0, PH / 2 + dy, zl - 0.0002]));
    }
  }
  P('5', group(box(0.09, 0.064, 0.0004, 'white', { pos: [0, PH / 2 - 0.038, zl] }), merged(ink, 'black')), [0, 0.04, -0.06]);

  // ------------------------------------------------------------- 1 — colliers à bande plate
  const zt = -Math.sqrt(R * R - XB * XB);
  YC.forEach((y) => {
    const parts = [slotted(R + 0.0032, R, y - 0.016, y + 0.016, [{ a: Math.PI, w: 2 * Math.asin(Math.min(0.99, XB / R)), y0: y - 0.02, y1: y + 0.02 }], 'zinc', { seg: 40 })];
    for (const s of [-1, 1]) {
      parts.push(box(0.0032, 0.032, Math.abs(ZB - zt), 'zinc', { pos: [s * (XB + 0.0016), y, (ZB + zt) / 2] }));
      parts.push(at(cyl(0.0047, T + 0.018, 'zinc', { axis: 'z', seg: 12 }), [s * XB, y, ZF - 0.009 + T / 2 + 0.0]));
      parts.push(at(S.washer(0.011, 0.005, 0.0016, 'zinc', { axis: 'z' }), [s * XB, y, ZF - 0.0008]));
      parts.push(at(S.nut(0.5625 * IN, 0.008, 'zinc', { axis: 'z' }), [s * XB, y, ZF - 0.0056]));
    }
    P('1', merged(parts, 'zinc'), [0, 0, 0.09]);
  });

  // ------------------------------------------------------------- 4 — cale
  P('4', extrude([[-0.038, -0.038], [0.038, -0.038], [0.038, 0.038], [-0.038, 0.038]], TS, 'grey', { holes: [[0, 0.03, 0.0052], [0, -0.03, 0.0052]] }).translateY(YV).translateZ(ZF - TS / 2), [0, 0, -0.1]);

  // ------------------------------------------------------------- 2 — sélecteur
  const zv = ZF - TS - VD / 2; // centre du corps
  const body = extrude([[-VW / 2, -VH / 2], [VW / 2, -VH / 2], [VW / 2, VH / 2], [-VW / 2, VH / 2]], VD, 'castIron', { holes: [[0, 0.03, 0.0052], [0, -0.03, 0.0052]] });
  body.position.set(0, YV, zv);
  // Chapeau de tirette (bossage rond), tige chromée, bouton champignon noir.
  const top = YV + VH / 2;
  const knob = group(
    lathe([[0, 0], [0.016, 0], [0.016, 0.012], [0.013, 0.014], [0, 0.014]], 'castIron', { seg: 28 }),
    lathe([[0, 0.014], [0.006, 0.014], [0.006, 0.04], [0, 0.04]], 'chrome', { seg: 16 }),
    lathe([[0, 0.038], [0.012, 0.038], [0.022, 0.044], [0.024, 0.05], [0.022, 0.056], [0.012, 0.06], [0, 0.061]], 'black', { seg: 28 }),
  );
  knob.position.set(0, top, zv);
  P('2', group(body, knob), [0, 0, -0.17]);

  // ------------------------------------------------------------- 6 — coudes
  const ports = [
    { p: [-VW / 2, YV + 0.018, zv], d: [-1, 0, 0], o: [0, -1, -0.3] },
    { p: [-VW / 2, YV - 0.022, zv], d: [-1, 0, 0], o: [0, -1, -0.3] },
    { p: [VW / 2, YV + 0.018, zv], d: [1, 0, 0], o: [0, -1, -0.3] },
    { p: [VW / 2, YV - 0.022, zv], d: [1, 0, 0], o: [0, -1, -0.3] },
    { p: [0, YV + 0.012, zv - VD / 2], d: [0, 0, -1], o: [0.4, 1, 0] },
    { p: [0, YV - 0.028, zv - VD / 2], d: [0, 0, -1], o: [0.4, -1, 0] },
  ];
  ports.forEach(({ p, d, o }) => P('6', place(elbow('orb', 6, 6), p, d, o), [d[0] * 0.07, 0, -0.17 + d[2] * 0.07]));

  // ------------------------------------------------------------- 7 / 8 / 9 — vis
  const zh = zv - VD / 2;
  for (const dy of [0.03, -0.03]) {
    const y = YV + dy;
    P('8', nordLock(0.375 * IN, [0, y, zh - 0.001], [0, 0, -1]), [0, 0, -0.26]);
    P('7', hhcs(0.375 * IN, 2.75 * IN, [0, y, zh - 0.002], [0, 0, -1]), [0, 0, -0.32]);
    P('8', nordLock(0.375 * IN, [0, y, ZB + 0.001], [0, 0, 1]), [0, 0, 0.04]);
    P('9', hexNut(0.375 * IN, [0, y, ZB + 0.002 + 0.0041], [0, 0, 1]), [0, 0, 0.07]);
  }
  return { view: { dir: [0.9, 0.5, -1.1] } };
}
